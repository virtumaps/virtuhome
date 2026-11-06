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


def report(store=None, entry=None):
    store = store or SimpleNamespace(plan=PLAN, revision=7, snapshots=[{}, {}, {}])
    # options from before 0.18 may still hold a licence server; a secret there is left out
    entry = entry or SimpleNamespace(options={"licence_server": "https://licence.example", "key": KEY},
                                     data={"token": TOKEN})
    return rep.build_report(
        store, entry, version="0.6.0", ha_version="2026.10.2",
        dashboard={"mode": "storage", "urls": ["/virtuhome_static/virtuhome-loader.js?v=0.6.0"], "current": True},
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


def test_no_secrets_anywhere():
    text = json.dumps(report(), ensure_ascii=False)
    for secret in (KEY, KEY[-4:], TOKEN):
        assert secret not in text
    # nor names or entity ids from the plan
    for private in ("Kitchen", "light.kitchen", "binary_sensor.back_door", "ground_floor"):
        assert private not in text
    assert {"key", "token", "activation", "instance"} <= rep.TO_REDACT


def test_not_loaded():
    out = rep.build_report(None, SimpleNamespace(options={}), version="0.6.0", ha_version="2026.10.2",
                           dashboard={"mode": "yaml"}, panel=False)
    assert out["loaded"] is False and "plan" not in out
    assert "licence" not in out


def test_check_my_setup_counts_only():
    assert report()["checks"] == {"reported": False}
    checks = {"time": 1792279060.9, "counts": {"links": 2, "rooms": 0, "areas": "Kitchen", "light.kitchen": 1}}
    store = SimpleNamespace(plan=PLAN, revision=7, snapshots=[], checks=checks)
    out = report(store)
    assert out["checks"] == {"reported": True, "time": 1792279060.9, "counts": {"links": 2, "rooms": 0}}
    assert "Kitchen" not in json.dumps(out["checks"]) and "light.kitchen" not in json.dumps(out)
    assert set(rep.CHECK_IDS) == {"links", "rooms", "areas", "card", "graphics", "extensions", "repairs"}


def test_frontend_errors():
    assert report()["errors"] == []
    kept = [{"time": 1.0, "last": 2.0, "count": 2, "where": "render", "message": "TypeError: <name>", "stack": "at a (app.js:1:2)",
             "version": "0.12.0", "graphics": "Tablet", "browser": "Silk 131 on Android"}]
    store = SimpleNamespace(plan=PLAN, revision=7, snapshots=[], errors=SimpleNamespace(summary=lambda: kept))
    assert report(store)["errors"] == kept
