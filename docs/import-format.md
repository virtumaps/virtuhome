# The simple plan format

A plan you can write by hand, with a script, or with help from an AI chat, and import in Edit →
**Home** → **Import a scan or plan…**. You give the rooms as corner lists, doors and windows as a
point on a room's edge, and furniture by type; VirtuHome works out the walls, puts each door and
window on its wall and places the furniture. After the import it lists what came in and what it
left out.

It follows NeonPlan 3D's [import format](https://github.com/Mastershort/neonplan3d/blob/main/docs/plan-format.md),
so a file written for that (`"format": "neonplan-import"`) imports too.

## Example

```json
{
  "format": "virtuhome-import",
  "units": "m",
  "rooms_at": "centre",
  "floors": [
    {
      "name": "Ground floor",
      "elevation": 0,
      "height": 2.5,
      "rooms": [
        { "name": "Living room", "points": [[0, 0], [6, 0], [6, 4.5], [0, 4.5]] },
        { "name": "Kitchen", "points": [[6, 0], [10, 0], [10, 4.5], [6, 4.5]] }
      ],
      "doors": [{ "at": [6, 2.2], "width": 0.9 }, { "at": [8, 4.5], "width": 1.0, "height": 2.1 }],
      "windows": [{ "at": [3, 0], "width": 1.5, "height": 1.3, "sill": 0.9 }],
      "furniture": [
        { "type": "sofa", "at": [3, 3.9], "rotation": 180 },
        { "name": "Dining table", "at": [8, 2], "width": 1.6, "depth": 0.9 }
      ]
    }
  ]
}
```

## Fields

The plan is seen from above: **x** runs to the right and **z** down the plan (from the top of the
drawing to the bottom). Points are `[x, z]`.

| Field | Meaning |
|---|---|
| `format` | `"virtuhome-import"` (or `"neonplan-import"`) |
| `units` | `"m"` (the default), `"cm"` or `"mm"`, for every length in the file |
| `rooms_at` | `"centre"` (the default): room outlines run along the **middle of the walls**, so rooms next to each other share an edge. `"inner"`: along the walls' **inner faces**, as measured inside a room; rooms a wall apart are joined in the middle of the wall. |
| `wall_thickness` | optional: `{ "outside": 0.3, "inside": 0.1 }`. With `rooms_at: "inner"`, outside walls are taken this thick; inside walls come from the gaps between rooms. |
| `north` | optional: the compass bearing the top of the plan faces, in degrees (0: north is up, 90: east is up) |
| `floors[]` | lowest first. `name`, `elevation` (the floor's level above the ground floor; the next one up when left out) and `height` (floor to the floor above, 2.5 m when left out) |
| `rooms[]` | `name` and `points`: the outline's corners in order, at least three, without repeating the first at the end. A room without a name is called Room 1, Room 2… |
| `walls[]` | optional: walls that are not on a room's edge, such as a partition across part of a room. `from`, `to`, `thickness` and `height` (both optional) |
| `doors[]` | `at`: the middle of the door, on a room's edge. `width` (0.9 m), `height` (2 m). Optional `kind`: `"passage"` (an opening without a door) or `"garage"`, and `style`: `"flush"`, `"panel"`, `"glazed"`, `"french"`, `"sliding"` or `"barn"` |
| `windows[]` | `at`, `width` (1.2 m), `height` (1.2 m), `sill`: the bottom edge above the floor (0.9 m). Optional `style`: `"casement"`, `"tilt"`, `"awning"`, `"sash"`, `"sliding"` or `"fixed"` |
| `furniture[]` | `at`: the middle. `type` (see below) or `name` ("Sofa", "Kühlschrank", "lit double": common names in English, German, French, Spanish, Italian and Dutch are recognised). `width` (along its front), `depth` and `height`: the type's usual size when left out. `rotation`: degrees clockwise, 0 when its front faces down the plan, 180 up. `elevation`: its bottom above the floor (a wall cupboard) |

A door between two rooms is listed once. A door or window more than 45 cm from every room edge is
left out, and so is a room with fewer than three corners. Furniture that matches no type comes in
as a plain box of its size.

**Furniture types:** `sofa`, `sofa_2`, `sofa_l`, `armchair`, `coffee_table`, `side_table`,
`tv_board`, `tv_wall`, `sideboard`, `shelf`, `bookcase`, `tall_cabinet`, `rug`, `fireplace`,
`piano`, `table`, `table_round`, `chair`, `stool`, `stool_bar`, `bench`, `kitchen` (a base unit),
`kitchen_wall`, `kitchen_tall`, `island`, `sink`, `stove`, `fridge`, `fridge_american`,
`dishwasher`, `washer`, `dryer`, `bed`, `bed_single`, `bed_king`, `bunk_bed`, `cot`, `nightstand`,
`wardrobe`, `dresser`, `bathtub`, `shower`, `wc`, `washbasin`, `towel_rail`, `radiator`, `desk`,
`office_chair`, `plant`, `plant_tall`, `mirror`, `picture`, `coat_rack`, `stairs`, the lamps
`lamp_ceiling`, `lamp_pendant`, `lamp_downlight`, `lamp_spots`, `lamp_floor`, `lamp_table`,
`lamp_wall` and `led_strip`, and the rest of VirtuHome's furniture by the names its plan files use.

## From a floor plan picture with an AI chat

Give an AI chat that can read pictures your floor plan (an estate agent's plan with its
measurements works best) and this prompt. Check the result in the 2D plan after importing: room
sizes it read wrongly are quick to fix there.

```text
Turn this floor plan into JSON in the format below. Use metres. x runs to the right and z runs
down the picture, starting at the top left corner of the building. Use the room measurements
written on the plan; where there are none, estimate from the other rooms.

{
  "format": "virtuhome-import",
  "units": "m",
  "rooms_at": "inner",
  "floors": [{
    "name": "Ground floor",
    "rooms": [{ "name": "Kitchen", "points": [[x, z], ...] }],
    "doors": [{ "at": [x, z], "width": 0.9 }],
    "windows": [{ "at": [x, z], "width": 1.2, "height": 1.2, "sill": 0.9 }],
    "furniture": [{ "type": "bed", "at": [x, z], "rotation": 0 }]
  }]
}

Rules: list each room's corners in order around the room, at the inside faces of its walls,
without repeating the first corner. Leave about 0.1 m between rooms either side of an inside wall.
Put each door and window's "at" point in the middle of it, on the edge of a room it belongs to;
list a door between two rooms once. A doorway without a door has "kind": "passage". Only add
furniture the plan shows, with "type" from: sofa, armchair, table, chair, bed, bed_single,
wardrobe, desk, kitchen, sink, stove, fridge, bathtub, shower, wc, washbasin, stairs. "rotation"
is in degrees clockwise, 0 when the front of the piece faces down the picture. If the plan has
more than one floor, add one entry to "floors" for each, lowest first. Reply with the JSON only.
```

Save the reply as a `.json` file and import it.
