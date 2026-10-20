"""The diagnostics report (plain pytest; report.py has no Home Assistant imports)."""

import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace

spec = importlib.util.spec_from_file_location("report", Path(__file__).parents[1] / "custom_components/virtuhome/report.py")
rep = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rep)

KEY = "VH-TEST-KEY-0000-QW7Z"
TOKEN = "vhl1.eyJpbnN0IjoiYWJjIn0.c2lnbmF0dXJl"
ACTIVATION = "act_7f3c9e"
INSTANCE = "0f1e2d3c4b5a69788796a5b4c3d2e1f0"

PLAN = {
    "version": 1,
    "settings": {"theme": "day", "north": 12, "energy": {"solar": ["sensor.pv_power"], "grid": None, "ev_enabled": True}},
    "floors": [
        {
            "id": "f0", "name": "Ground", "elevation": 0, "height": 2.6, "ha_floor": "ground_floor",
            "rooms": [{"id": "r1", "name": "Kitchen", "points": [[0, 0], [4, 0], [4, 3]], "temperature": "sensor.kitchen_temp"}],
            "openings": [{"id": "o1", "room_id": "r1", "kind": "door", "entity": "binary_sensor.back_door", "cover": None}],
            "furniture": [{"id": "s1", "type": "sofa"}, {"id": "l1", "type": "lamp", "entity": "light.gone"}],
            "devices": [{"id": "d1", "entity": "light.kitchen"}],
            "walls": [],
            "outdoor": [{"id": "g1"}],
        },
        {"id": "f1", "name": "First", "elevation": 2.8, "height": 2.5, "rooms": [], "openings": []},
    ],
}

EXISTING = {"sensor.kitchen_temp", "binary_sensor.back_door", "light.kitchen"}


class FakeManager:
    """ExtensionManager with a real-looking licence in its stored data."""

    data = {"key": KEY, "activation": ACTIVATION, "token": TOKEN, "checked": 1792279060.9,
            "extensions": [{"id": "security", "name": "Security", "version": "1.0.2", "file": "security-1.0.2.js"},
                           {"id": "energy", "name": "Energy", "version": "1.0.0", "file": "energy-1.0.0.js"}]}
    instance = INSTANCE

    def summary(self):
        return {"status": "active", "error": None, "key_hint": f"{KEY[:4]}…{KEY[-4:]}",
                "extensions": [{k: e[k] for k in ("id", "name", "version")} for e in self.data["extensions"]],
                "checked": self.data["checked"], "server": "https://licence.example"}

    def extensions(self):
        return [{"id": "security", "name": "Security", "version": "1.0.2", "url": "/virtuhome_ext/security-1.0.2.js"}]


def report(store=None, entry=None):
    manager = FakeManager()
    store = store or SimpleNamespace(plan=PLAN, revision=7, snapshots=[{}, {}, {}], extension_manager=manager)
    entry = entry or SimpleNamespace(options={"licence_server": "https://licence.example", "key": KEY},
                                     data={"token": TOKEN})
    return rep.build_report(
        store, entry, version="0.6.0", ha_version="2026.10.2", licence=manager.summary(), loaded=manager.extensions(),
        dashboard={"mode": "storage", "urls": ["/local/virtuhome/card-loader.js?v=0.6.0"], "current": True},
        panel=True, entity_exists=EXISTING.__contains__,
    )


def test_counts_per_floor_and_totals():
    plan = report()["plan"]
    assert plan["revision"] == 7
    assert plan["restore_points"] == 3
    assert plan["size_bytes"] == len(json.dumps(PLAN, separators=(",", ":")).encode())
    ground, first = plan["floors"]
    assert (ground["rooms"], ground["openings"], ground["furniture"], ground["devices"], ground["outdoor"]) == (1, 1, 2, 1, 1)
    assert ground["ha_floor_linked"] and not first["ha_floor_linked"]
    assert first["furniture"] == 0 and first["fences"] == 0
    assert plan["totals"]["furniture"] == 2
    # light.gone is linked to the lamp but no longer exists in Home Assistant
    assert ground["missing_entities"] == 1
    assert plan["energy_set"] == ["ev_enabled", "solar"]


def test_licence_and_extensions():
    lic = report()["licence"]
    assert lic["status"] == "active" and lic["key_entered"]
    assert lic["extensions"] == [
        {"id": "security", "version": "1.0.2", "loaded": True},
        {"id": "energy", "version": "1.0.0", "loaded": False},
    ]


def test_no_secrets_anywhere():
    text = json.dumps(report(), ensure_ascii=False)
    for secret in (KEY, KEY[-4:], TOKEN, ACTIVATION, INSTANCE):
        assert secret not in text
    # nor names or entity ids from the plan
    for private in ("Kitchen", "light.kitchen", "binary_sensor.back_door", "ground_floor"):
        assert private not in text
    assert {"key", "token", "activation", "instance"} <= rep.TO_REDACT


def test_not_loaded():
    out = rep.build_report(None, SimpleNamespace(options={}), version="0.6.0", ha_version="2026.10.2",
                           licence=None, loaded=[], dashboard={"mode": "yaml"}, panel=False)
    assert out["loaded"] is False and "plan" not in out
    assert out["licence"] == {"status": "unavailable"}


def test_check_my_setup_counts_only():
    assert report()["checks"] == {"reported": False}
    checks = {"time": 1792279060.9, "counts": {"links": 2, "rooms": 0, "areas": "Kitchen", "light.kitchen": 1}}
    store = SimpleNamespace(plan=PLAN, revision=7, snapshots=[], checks=checks)
    out = report(store)
    assert out["checks"] == {"reported": True, "time": 1792279060.9, "counts": {"links": 2, "rooms": 0}}
    assert "Kitchen" not in json.dumps(out["checks"]) and "light.kitchen" not in json.dumps(out)
    assert set(rep.CHECK_IDS) == {"links", "rooms", "areas", "card", "graphics", "extensions", "repairs"}
