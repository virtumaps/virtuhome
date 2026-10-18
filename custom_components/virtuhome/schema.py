"""Validation of the plan saved by the frontend (mirrors frontend/src/model/plan.ts).

Known fields are checked and bounded; unknown fields pass through (ALLOW_EXTRA), so a newer
frontend can add fields before the backend learns about them.
"""

from __future__ import annotations

import voluptuous as vol

from .backgrounds import FILE_PATTERN

MAX_FLOORS = 20
MAX_ROOMS = 200
MAX_POINTS = 200
MAX_ITEMS = 2000

ID = vol.All(str, vol.Length(min=1, max=64), vol.Match(r"^[A-Za-z0-9_\-.]+$"))
_NAME = vol.All(str, vol.Length(max=100))
_COORD = vol.All(vol.Coerce(float), vol.Range(min=-2000, max=2000))
_LENGTH = vol.All(vol.Coerce(float), vol.Range(min=0, max=200))
_POINT = vol.All([_COORD], vol.Length(min=2, max=2))
_ENTITY = vol.Any(None, vol.All(str, vol.Length(max=255)))

ROOM = vol.Schema(
    {
        vol.Required("id"): ID,
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
        vol.Required("id"): ID,
        vol.Required("room_id"): ID,
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
        vol.Required("id"): ID,
        vol.Required("type"): vol.All(str, vol.Length(max=64)),
        vol.Required("x"): _COORD,
        vol.Required("z"): _COORD,
        vol.Required("rotation"): vol.Coerce(float),
        vol.Required("w"): _LENGTH,
        vol.Required("d"): _LENGTH,
        vol.Required("h"): _LENGTH,
        # unset means the type's usual height (a wall cupboard's, a ceiling lamp's), so no default of 0
        vol.Optional("y"): vol.Any(None, _LENGTH),
        vol.Optional("entity", default=None): _ENTITY,
    },
    extra=vol.ALLOW_EXTRA,
)

DEVICE = vol.Schema(
    {
        vol.Required("id"): ID,
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
        vol.Required("id"): ID,
        vol.Required("a"): _POINT,
        vol.Required("b"): _POINT,
        vol.Optional("thickness", default=None): vol.Any(None, _LENGTH),
        vol.Optional("height", default=None): vol.Any(None, _LENGTH),
    },
    extra=vol.ALLOW_EXTRA,
)

# a floor plan image under the 2D plan (only the 2D editor shows it)
BACKGROUND = vol.Schema(
    {
        vol.Required("file"): vol.All(str, vol.Match(FILE_PATTERN)),
        # the image's size in pixels, and metres per pixel
        vol.Required("width"): vol.All(int, vol.Range(min=1, max=20000)),
        vol.Required("height"): vol.All(int, vol.Range(min=1, max=20000)),
        vol.Required("scale"): vol.All(vol.Coerce(float), vol.Range(min=0.00001, max=1)),
        # where the image's middle is on the plan, its turn (degrees, clockwise) and how strongly it shows
        vol.Optional("x", default=0): _COORD,
        vol.Optional("z", default=0): _COORD,
        vol.Optional("rotation", default=0): vol.All(vol.Coerce(float), vol.Range(min=-360, max=360)),
        vol.Optional("opacity", default=0.5): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
    },
    extra=vol.ALLOW_EXTRA,
)

_COLOR = vol.Any(None, vol.All(str, vol.Match(r"^#[0-9a-fA-F]{6}$")))
_SMALL = vol.All(vol.Coerce(float), vol.Range(min=0, max=50))

# something on a roof: a window, chimney, dormer, solar panels or a lantern
ROOF_ITEM = vol.Schema(
    {
        vol.Required("id"): ID,
        vol.Required("kind"): vol.In(["window", "chimney", "dormer", "solar", "lantern"]),
        vol.Required("x"): _COORD,
        vol.Required("z"): _COORD,
        vol.Required("w"): _SMALL,
        vol.Required("d"): _SMALL,
        vol.Optional("cols"): vol.Any(None, vol.All(int, vol.Range(min=1, max=50))),
        vol.Optional("rows"): vol.Any(None, vol.All(int, vol.Range(min=1, max=20))),
        vol.Optional("entity"): _ENTITY,
        vol.Optional("cover"): _ENTITY,
        vol.Optional("color"): _COLOR,
    },
    extra=vol.ALLOW_EXTRA,
)

# a roof over a rectangle of a storey's walls
ROOF = vol.Schema(
    {
        vol.Required("id"): ID,
        vol.Required("x"): _COORD,
        vol.Required("z"): _COORD,
        vol.Required("w"): _LENGTH,
        vol.Required("d"): _LENGTH,
        vol.Optional("rotation", default=0): vol.Coerce(float),
        vol.Required("shape"): vol.All(str, vol.Length(max=32)),
        vol.Optional("pitch", default=35): vol.All(vol.Coerce(float), vol.Range(min=0, max=80)),
        vol.Optional("party"): vol.Any(None, vol.In(["left", "right", "both"])),
        vol.Optional("covering", default="concrete_tiles"): vol.All(str, vol.Length(max=32)),
        vol.Optional("color"): _COLOR,
        vol.Optional("trim"): _COLOR,
        vol.Optional("items", default=list): vol.All([ROOF_ITEM], vol.Length(max=200)),
    },
    extra=vol.ALLOW_EXTRA,
)

FLOOR = vol.Schema(
    {
        vol.Required("id"): ID,
        vol.Required("name"): _NAME,
        vol.Optional("ha_floor", default=None): _ENTITY,
        vol.Required("elevation"): vol.All(vol.Coerce(float), vol.Range(min=-100, max=500)),
        vol.Required("height"): vol.All(vol.Coerce(float), vol.Range(min=1, max=20)),
        vol.Required("rooms"): vol.All([ROOM], vol.Length(max=MAX_ROOMS)),
        vol.Optional("openings", default=list): vol.All([OPENING], vol.Length(max=MAX_ITEMS)),
        vol.Optional("furniture", default=list): vol.All([FURNITURE], vol.Length(max=MAX_ITEMS)),
        vol.Optional("devices", default=list): vol.All([DEVICE], vol.Length(max=MAX_ITEMS)),
        vol.Optional("walls", default=list): vol.All([FREE_WALL], vol.Length(max=MAX_ITEMS)),
        vol.Optional("background", default=None): vol.Any(None, BACKGROUND),
        vol.Optional("roofs", default=list): vol.All([ROOF], vol.Length(max=50)),
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
