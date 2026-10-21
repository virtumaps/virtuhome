"""Errors from the frontend, stripped and kept for diagnostics (plain pytest; errors.py has no Home Assistant imports)."""

import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location("errors", Path(__file__).parents[1] / "custom_components/virtuhome/errors.py")
errors = importlib.util.module_from_spec(spec)
spec.loader.exec_module(errors)

PLAN = {
    "version": 1,
    "name": "Rose Cottage",
    "settings": {"energy": {"solar": ["sensor.pv_power"]}},
    "floors": [{
        "id": "g", "name": "Downstairs", "ha_floor": "ground_floor",
        "rooms": [{"id": "k", "name": "Kitchen", "area_id": "kitchen_area", "temperature": "sensor.kitchen_temp"}],
        "devices": [{"id": "d1", "entity": "light.pantry_strip"}],
        "furniture": [{"id": "f1", "type": "sofa"}],
    }],
}
# what websocket.py hands over from Home Assistant: entity ids, friendly names, areas, floors, devices
HA_NAMES = ["Oak House", "light.kitchen", "Ceiling Lamp", "select.boiler_mode", "The Snug", "snug", "Den room",
            "Sarah's lamp", None, "TV"]
NAMES = errors.private_strings(HA_NAMES, PLAN)


def test_collects_names_from_home_assistant_and_the_plan():
    for name in ("Oak House", "light.kitchen", "Ceiling Lamp", "select.boiler_mode", "The Snug", "Sarah's lamp",
                 "Rose Cottage", "Downstairs", "ground_floor", "Kitchen", "kitchen_area", "sensor.kitchen_temp",
                 "light.pantry_strip", "sensor.pv_power"):
        assert name in NAMES
    # too short to strip, and the plan's own ids and kinds are not names
    for other in ("TV", "k", "d1", "sofa", "g"):
        assert other not in NAMES


def test_strips_names_and_entity_ids():
    text = "Cannot light the kitchen (Ceiling Lamp) in THE SNUG: select.boiler_mode, binary_sensor.front_door"
    assert errors.strip_text(text, NAMES) == "Cannot light the <name> (<name>) in <name>: <entity>, <entity>"
    # unknown entity ids go whole, not as light.<name>_ceiling
    assert errors.strip_text("light.kitchen_ceiling", NAMES) == "<entity>"
    assert errors.strip_text("e.floors is undefined", NAMES) == "e.floors is undefined"


def test_keeps_only_a_scripts_file_and_line_of_an_address():
    stack = ("at tick (http://homeassistant.local:8123/virtuhome_static/app/app.js?v=0.11.0:1:2345)\n"
             "tick@https://abc123.ui.nabu.casa/virtuhome_ext/security-1.1.0.js:12:9\n"
             "see https://192.168.1.20:8123/api/camera_proxy/camera.drive?token=abc")
    assert errors.strip_text(stack) == "at tick (app.js:1:2345)\ntick@security-1.1.0.js:12:9\nsee <url>"


def test_strips_tokens_keys_ips_and_emails():
    text = ("eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ4In0.c2lnbmF0dXJl vhl1.ZGF0YWRhdGFkYXRhZGF0YWRhdGFkYXRhZGF0YQ.sig "
            "VH-TEST-KEY-0000-QW7Z 192.168.1.20 fe80:0:0:0:1ff:fe23:4567:890a kadir@example.co.uk")
    out = errors.strip_text(text)
    for secret in ("eyJ", "ZGF0YW", "QW7Z", "192.168", "fe80", "kadir@"):
        assert secret not in out
    for placeholder in ("<token>", "<key>", "<ip>", "<email>"):
        assert placeholder in out


def report(**fields):
    return {"where": "render", "message": "TypeError: x", "stack": "at a (app.js:1:2)", "version": "0.12.0",
            "graphics": "Tablet", "browser": "Silk 131 on Android", **fields}


def test_keeps_the_last_50_stripped():
    log = errors.ErrorLog(rate=1000)
    for i in range(60):
        assert log.add(report(message=f"No room for Kitchen near light.kitchen #{i}"), NAMES, 1000.0 + i)
    kept = log.summary()
    assert len(kept) == 50
    assert kept[0]["message"] == "No room for <name> near <entity> #10"
    assert kept[-1]["message"].endswith("#59")
    assert {k for k in kept[0]} == {"time", "last", "count", "where", "message", "stack", "version", "graphics", "browser"}
    assert "Kitchen" not in json.dumps(kept) and "light.kitchen" not in json.dumps(kept)


def test_the_same_error_again_counts():
    log = errors.ErrorLog()
    log.add(report(), [], 10.0)
    log.add(report(where="plan"), [], 11.0)
    log.add(report(), [], 12.0)
    kept = log.summary()
    assert [(e["where"], e["count"], e["time"], e["last"]) for e in kept] == [("plan", 1, 11.0, 11.0), ("render", 2, 10.0, 12.0)]


def test_a_few_a_minute_and_fields_cut():
    log = errors.ErrorLog(rate=3)
    assert [log.add(report(message=str(i)), [], 100.0 + i) for i in range(5)] == [True, True, True, False, False]
    # a minute after the first, there is room again
    assert log.add(report(message="later"), [], 161.0)
    log.add(report(message="no room " * 500, stack="at a (app.js:1:2)\n" * 500, browser="Oak House " * 50), NAMES, 300.0)
    last = log.summary()[-1]
    assert len(last["message"]) == 300 and len(last["stack"]) == 2000 and len(last["browser"]) <= 80
    # every field is stripped, even those the frontend fills itself
    assert "Oak House" not in last["browser"]
