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


def test_after_an_update_the_old_resource_is_pending_until_put_right(tmp_path):
    (tmp_path / "www").mkdir()
    hass = FakeHass(tmp_path, FakeResources([OLD]))
    # Home Assistant is still starting: the resource names the version before the update
    state = asyncio.run(cr.async_state(hass, "0.10.0"))
    assert state["pending"] is True
    assert state["current"] is False
    asyncio.run(cr.async_register(hass, "0.10.0"))
    state = asyncio.run(cr.async_state(hass, "0.10.0"))
    assert state["pending"] is False
    assert state["current"] is True
    assert state["urls"] == ["/local/virtuhome/card-loader.js?v=0.10.0"]


def test_a_failed_registration_still_shows_what_is_there(tmp_path):
    class Broken(FakeResources):
        async def async_update_item(self, item_id, data):
            raise RuntimeError("storage full")

    (tmp_path / "www").mkdir()
    hass = FakeHass(tmp_path, Broken([OLD]))
    with pytest.raises(RuntimeError):
        asyncio.run(cr.async_register(hass, "0.10.0"))
    state = asyncio.run(cr.async_state(hass, "0.10.0"))
    assert state["pending"] is False
    assert state["current"] is False


def test_yaml_resources_say_pending_too(tmp_path):
    hass = FakeHass(tmp_path, None)
    hass.data["lovelace"] = {"resources": object()}
    assert asyncio.run(cr.async_state(hass, "0.10.0")) == {"mode": "yaml", "www_loader": False, "pending": True}
