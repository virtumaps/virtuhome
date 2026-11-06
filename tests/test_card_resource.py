"""The dashboard card's resource (plain pytest; Home Assistant is stubbed where it isn't installed)."""

import asyncio
import importlib
import sys
import types
from pathlib import Path
from types import SimpleNamespace

import pytest

# card_resource.py imports .const and HomeAssistant (for a type only): load it as a package without
# running __init__.py, with a stand-in for homeassistant.core that is taken away again afterwards
_stubbed = []
try:
    import homeassistant.core  # noqa: F401
except ImportError:
    for name in ("homeassistant", "homeassistant.core"):
        sys.modules[name] = types.ModuleType(name)
        _stubbed.append(name)
    sys.modules["homeassistant.core"].HomeAssistant = object
_pkg = types.ModuleType("vh_card_pkg")
_pkg.__path__ = [str(Path(__file__).parents[1] / "custom_components/virtuhome")]
sys.modules["vh_card_pkg"] = _pkg
cr = importlib.import_module("vh_card_pkg.card_resource")
for name in _stubbed:
    del sys.modules[name]


class FakeResources:
    """Lovelace's resource collection in storage mode."""

    def __init__(self, urls):
        self.items = [{"id": str(n), "res_type": "module", "url": u} for n, u in enumerate(urls)]
        self.loaded = True

    def async_items(self):
        return list(self.items)

    async def async_load(self):
        self.loaded = True

    async def async_create_item(self, data):
        self.items.append({"id": str(len(self.items)), **data})

    async def async_update_item(self, item_id, data):
        next(i for i in self.items if i["id"] == item_id).update(data)

    async def async_delete_item(self, item_id):
        self.items = [i for i in self.items if i["id"] != item_id]


class FakeHass:
    def __init__(self, config_dir, resources):
        self.data = {"lovelace": {"resources": resources}}
        self.config = SimpleNamespace(path=lambda *p: str(Path(config_dir, *p)))

    async def async_add_executor_job(self, fn, *args):
        return fn(*args)


OLD = "/local/virtuhome/card-loader.js?v=0.9.0"
SERVED = "/virtuhome_static/virtuhome-loader.js"


def urls(hass):
    return [i["url"] for i in hass.data["lovelace"]["resources"].items]


def test_after_an_update_the_old_resource_is_pending_until_put_right(tmp_path):
    hass = FakeHass(tmp_path, FakeResources([f"{SERVED}?v=0.9.0"]))
    # Home Assistant is still starting: the resource names the version before the update
    state = asyncio.run(cr.async_state(hass, "0.10.0"))
    assert state["pending"] is True
    assert state["current"] is False
    asyncio.run(cr.async_register(hass, "0.10.0"))
    state = asyncio.run(cr.async_state(hass, "0.10.0"))
    assert state["pending"] is False
    assert state["current"] is True
    assert state["urls"] == [f"{SERVED}?v=0.10.0"]


def test_a_failed_registration_still_shows_what_is_there(tmp_path):
    class Broken(FakeResources):
        async def async_update_item(self, item_id, data):
            raise RuntimeError("storage full")

    hass = FakeHass(tmp_path, Broken([OLD]))
    with pytest.raises(RuntimeError):
        asyncio.run(cr.async_register(hass, "0.10.0"))
    state = asyncio.run(cr.async_state(hass, "0.10.0"))
    assert state["pending"] is False
    assert state["current"] is False


def test_yaml_resources_say_pending_too(tmp_path):
    hass = FakeHass(tmp_path, None)
    hass.data["lovelace"] = {"resources": object()}
    assert asyncio.run(cr.async_state(hass, "0.10.0")) == {"mode": "yaml", "pending": True}


def test_nothing_is_written_to_www(tmp_path):
    hass = FakeHass(tmp_path, FakeResources([]))
    asyncio.run(cr.async_register(hass, "0.18.0"))
    assert urls(hass) == [f"{SERVED}?v=0.18.0"]
    assert not (tmp_path / "www").exists()
    (tmp_path / "www").mkdir()
    asyncio.run(cr.async_register(hass, "0.18.0"))
    assert list((tmp_path / "www").iterdir()) == []


def test_the_loader_older_versions_put_in_www_goes(tmp_path):
    old = tmp_path / "www" / "virtuhome" / "card-loader.js"
    old.parent.mkdir(parents=True)
    old.write_text("// VirtuHome: loads the dashboard card")
    (tmp_path / "www" / "photo.jpg").write_bytes(b"")
    hass = FakeHass(tmp_path, FakeResources(["/local/other-card.js", OLD]))
    asyncio.run(cr.async_register(hass, "0.18.0"))
    assert urls(hass) == ["/local/other-card.js", f"{SERVED}?v=0.18.0"]
    assert not old.parent.exists()
    assert (tmp_path / "www" / "photo.jpg").exists()


def test_a_virtuhome_folder_with_the_users_own_files_stays(tmp_path):
    folder = tmp_path / "www" / "virtuhome"
    folder.mkdir(parents=True)
    (folder / "card-loader.js").write_text("")
    (folder / "floorplan.png").write_bytes(b"")
    hass = FakeHass(tmp_path, FakeResources([OLD]))
    asyncio.run(cr.async_register(hass, "0.18.0"))
    assert [f.name for f in folder.iterdir()] == ["floorplan.png"]


def test_removing_the_integration_takes_the_resource_and_an_old_loader(tmp_path):
    old = tmp_path / "www" / "virtuhome" / "card-loader.js"
    old.parent.mkdir(parents=True)
    old.write_text("")
    hass = FakeHass(tmp_path, FakeResources(["/local/other-card.js", f"{SERVED}?v=0.18.0", OLD]))
    asyncio.run(cr.async_unregister(hass))
    assert urls(hass) == ["/local/other-card.js"]
    assert not old.parent.exists()
