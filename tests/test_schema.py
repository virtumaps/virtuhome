"""The saved plan's schema (needs voluptuous; skipped where only cryptography and pytest are installed)."""

import importlib
import sys
import types
from pathlib import Path

import pytest

vol = pytest.importorskip("voluptuous")

# schema.py imports .backgrounds: load both as a package without running __init__.py (Home Assistant)
_pkg = types.ModuleType("vh_schema_pkg")
_pkg.__path__ = [str(Path(__file__).parents[1] / "custom_components/virtuhome")]
sys.modules["vh_schema_pkg"] = _pkg
schema = importlib.import_module("vh_schema_pkg.schema")

FLOOR = {"id": "g", "name": "Ground", "elevation": 0, "height": 2.6, "rooms": []}


def test_old_plans_without_links_still_load():
    out = schema.PLAN({"version": 1, "floors": [FLOOR]})
    assert "links" not in out


def test_links_keep_registry_and_device_ids():
    links = {"light.kitchen": {"id": "5f2b0c0d6a1e4f7d9c3b2a1908f7e6d5", "device_id": "a1b2c3"}, "sensor.pv": {"device_id": None}}
    out = schema.PLAN({"version": 1, "floors": [FLOOR], "links": links})
    assert out["links"] == links


def test_bad_links_are_refused():
    for links in ({"light.kitchen": {"id": "x" * 65}}, {"light.kitchen": "abc"}, {"x": {"id": "abc"}}, ["light.kitchen"]):
        with pytest.raises(vol.Invalid):
            schema.PLAN({"version": 1, "floors": [FLOOR], "links": links})


ROOM = {"id": "k", "name": "Kitchen", "points": [[0, 0], [3, 0], [3, 3]]}
READING = {"id": "d1", "entity": "sensor.pond_temperature", "x": 1, "z": 1}


def test_labels_and_readings_are_kept():
    floor = {**FLOOR, "rooms": [{**ROOM, "label": ["humidity", "sensor.kitchen_co2"]}], "devices": [{**READING, "show": "value"}]}
    out = schema.PLAN({"version": 1, "floors": [floor]})
    assert out["floors"][0]["rooms"][0]["label"] == ["humidity", "sensor.kitchen_co2"]
    assert out["floors"][0]["devices"][0]["show"] == "value"


def test_plans_without_labels_gain_none():
    out = schema.PLAN({"version": 1, "floors": [{**FLOOR, "rooms": [ROOM], "devices": [READING]}]})
    assert "label" not in out["floors"][0]["rooms"][0]
    assert "show" not in out["floors"][0]["devices"][0]


def test_bad_labels_and_shows_are_refused():
    for room in ({**ROOM, "label": "temperature"}, {**ROOM, "label": [""]}, {**ROOM, "label": ["sensor.x"] * 9}):
        with pytest.raises(vol.Invalid):
            schema.PLAN({"version": 1, "floors": [{**FLOOR, "rooms": [room]}]})
    with pytest.raises(vol.Invalid):
        schema.PLAN({"version": 1, "floors": [{**FLOOR, "devices": [{**READING, "show": "graph"}]}]})


def test_room_scenes_are_kept_and_bounded():
    room = {**ROOM, "scenes": ["script.goodnight", "scene.cooking"], "hide_scenes": ["scene.kitchen_off"]}
    out = schema.PLAN({"version": 1, "floors": [{**FLOOR, "rooms": [room]}]})
    assert out["floors"][0]["rooms"][0]["scenes"] == ["script.goodnight", "scene.cooking"]
    assert out["floors"][0]["rooms"][0]["hide_scenes"] == ["scene.kitchen_off"]
    for bad in ({**ROOM, "scenes": "scene.cooking"}, {**ROOM, "hide_scenes": [""]}, {**ROOM, "scenes": ["scene.x"] * 51}):
        with pytest.raises(vol.Invalid):
            schema.PLAN({"version": 1, "floors": [{**FLOOR, "rooms": [bad]}]})


ROBOT = {"id": "r1", "entity": "vacuum.robbie", "x": 1, "z": 1, "mount": "floor"}


def test_robot_maps_are_kept():
    robot = {"source": "camera.robbie_map", "spots": [{"robot": [25500, 25700], "plan": [1.2, 3.4]}, {"robot": [31000, 22000], "plan": [5.5, 0.4]}], "mirror": None}
    out = schema.PLAN({"version": 1, "floors": [{**FLOOR, "devices": [{**ROBOT, "robot": robot}]}]})
    assert out["floors"][0]["devices"][0]["robot"] == robot
    # a mower's GPS spots, in metres from home
    gps = {"source": None, "spots": [{"robot": [-12.5, 40.1], "plan": [0, -8]}]}
    assert schema.PLAN({"version": 1, "floors": [{**FLOOR, "devices": [{**ROBOT, "robot": gps}]}]})["floors"][0]["devices"][0]["robot"] == gps


def test_bad_robot_maps_are_refused():
    for robot in ({"spots": [{"robot": [1, 2]}]}, {"spots": [{"robot": [1, 2], "plan": [0, 0]}] * 3}, {"mirror": "yes"}, {"spots": [{"robot": [1, 2, 3], "plan": [0, 0]}]}):
        with pytest.raises(vol.Invalid):
            schema.PLAN({"version": 1, "floors": [{**FLOOR, "devices": [{**ROBOT, "robot": robot}]}]})
