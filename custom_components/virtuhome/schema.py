"""Validation of the plan saved by the frontend (mirrors frontend/src/model/plan.ts).

Known fields are checked and bounded; unknown fields pass through (ALLOW_EXTRA), so a newer
frontend can add fields before the backend learns about them.
"""

from __future__ import annotations

import voluptuous as vol

MAX_FLOORS = 20
MAX_ROOMS = 200
MAX_POINTS = 200
MAX_ITEMS = 2000

_ID = vol.All(str, vol.Length(min=1, max=64), vol.Match(r"^[A-Za-z0-9_\-.]+$"))
_NAME = vol.All(str, vol.Length(max=100))
_COORD = vol.All(vol.Coerce(float), vol.Range(min=-2000, max=2000))
_LENGTH = vol.All(vol.Coerce(float), vol.Range(min=0, max=200))
_POINT = vol.All([_COORD], vol.Length(min=2, max=2))
_ENTITY = vol.Any(None, vol.All(str, vol.Length(max=255)))

ROOM = vol.Schema(
    {
        vol.Required("id"): _ID,
        vol.Required("name"): _NAME,
        vol.Optional("area_id", default=None): _ENTITY,
        vol.Required("points"): vol.All([_POINT], vol.Length(min=3, max=MAX_POINTS)),
        vol.Optional("floor", default="wood"): vol.All(str, vol.Length(max=32)),
        vol.Optional("temperature", default=None): _ENTITY,
        vol.Optional("humidity", default=None): _ENTITY,
    },
    extra=vol.ALLOW_EXTRA,
)

OPENING = vol.Schema(
    {
        vol.Required("id"): _ID,
        vol.Required("room_id"): _ID,
        vol.Required("edge"): vol.All(int, vol.Range(min=0, max=MAX_POINTS)),
        vol.Required("offset"): _LENGTH,
        vol.Required("width"): _LENGTH,
        vol.Required("height"): _LENGTH,
        vol.Required("sill"): _LENGTH,
        vol.Required("kind"): vol.In(["door", "window", "passage", "garage"]),
        vol.Optional("entity", default=None): _ENTITY,
        vol.Optional("cover", default=None): _ENTITY,
    },
    extra=vol.ALLOW_EXTRA,
)

FURNITURE = vol.Schema(
    {
        vol.Required("id"): _ID,
        vol.Required("type"): vol.All(str, vol.Length(max=64)),
        vol.Required("x"): _COORD,
        vol.Required("z"): _COORD,
        vol.Required("rotation"): vol.Coerce(float),
        vol.Required("w"): _LENGTH,
        vol.Required("d"): _LENGTH,
        vol.Required("h"): _LENGTH,
        vol.Optional("y", default=0): _LENGTH,
        vol.Optional("entity", default=None): _ENTITY,
    },
    extra=vol.ALLOW_EXTRA,
)

DEVICE = vol.Schema(
    {
        vol.Required("id"): _ID,
        vol.Required("entity"): vol.All(str, vol.Length(min=3, max=255)),
        vol.Required("x"): _COORD,
        vol.Required("z"): _COORD,
        vol.Optional("y", default=None): vol.Any(None, _LENGTH),
        vol.Optional("mount", default=None): vol.Any(None, vol.In(["ceiling", "wall", "floor", "table"])),
        vol.Optional("rotation", default=None): vol.Any(None, vol.Coerce(float)),
    },
    extra=vol.ALLOW_EXTRA,
)

FREE_WALL = vol.Schema(
    {
        vol.Required("id"): _ID,
        vol.Required("a"): _POINT,
        vol.Required("b"): _POINT,
        vol.Optional("thickness", default=None): vol.Any(None, _LENGTH),
        vol.Optional("height", default=None): vol.Any(None, _LENGTH),
    },
    extra=vol.ALLOW_EXTRA,
)

FLOOR = vol.Schema(
    {
        vol.Required("id"): _ID,
        vol.Required("name"): _NAME,
        vol.Optional("ha_floor", default=None): _ENTITY,
        vol.Required("elevation"): vol.All(vol.Coerce(float), vol.Range(min=-100, max=500)),
        vol.Required("height"): vol.All(vol.Coerce(float), vol.Range(min=1, max=20)),
        vol.Required("rooms"): vol.All([ROOM], vol.Length(max=MAX_ROOMS)),
        vol.Optional("openings", default=list): vol.All([OPENING], vol.Length(max=MAX_ITEMS)),
        vol.Optional("furniture", default=list): vol.All([FURNITURE], vol.Length(max=MAX_ITEMS)),
        vol.Optional("devices", default=list): vol.All([DEVICE], vol.Length(max=MAX_ITEMS)),
        vol.Optional("walls", default=list): vol.All([FREE_WALL], vol.Length(max=MAX_ITEMS)),
    },
    extra=vol.ALLOW_EXTRA,
)

PLAN = vol.Schema(
    {
        vol.Required("version"): 1,
        vol.Optional("settings", default=dict): dict,
        vol.Required("floors"): vol.All([FLOOR], vol.Length(max=MAX_FLOORS)),
    },
    extra=vol.ALLOW_EXTRA,
)


def empty_plan() -> dict:
    """A plan without floors: the frontend shows its welcome screen."""
    return {"version": 1, "settings": {}, "floors": []}
