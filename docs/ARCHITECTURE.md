# Architecture

## Pieces

| Path | What |
|---|---|
| `custom_components/virtuhome/` | Home Assistant integration: stores the plan (`.storage/virtuhome.plan` + restore points), WebSocket API (`virtuhome/plan/get|save|subscribe`, `virtuhome/history/*`, `virtuhome/info`, `virtuhome/background/upload`), sidebar panel, serves the frontend. Floor plan images to trace over sit in `.virtuhome/backgrounds/` and are served to signed-in users at `/api/virtuhome/background/<file>`; a save that stops using one deletes it. |
| `frontend/src/loader.ts` | ~2 KB, loaded on every HA page. Defines `virtuhome-card` and `virtuhome-panel`; imports the engine only when one is shown. |
| `frontend/src/model/` | The plan format (`plan.ts`), 2D geometry, and wall layout derived from room outlines (`walls.ts`). |
| `frontend/src/scene/` | The 3D engine: mesh building, CPU lighting, materials, markers, the `Viewer`. |
| `frontend/src/live/` | Maps Home Assistant states onto the view; decides which refresh each state change needs. |
| `frontend/src/ui/` | The shared view with its controls, the card and the panel. |
| `frontend/dev/` | Dev harness, demo house, pretend Home Assistant. |

## The plan

Metres; x right, z down the plan, y up. Rooms are polygons along the middle of their walls; walls
are not stored but derived: room edges on the same line become one inside wall, edges with one room
become outside walls. Doors and windows reference a room edge and an offset along it. Furniture and
devices sit at plan points. Floors stack by elevation and link to HA floors; rooms link to HA areas.
A floor can carry a `background` image (only the 2D editor shows it; `floorKey` leaves it out, so
moving or fading it never rebuilds the 3D floor).

A floor's `roofs` sit on its walls: each a rectangle (`w` along the ridge, `d` across, along the
middle of the walls like rooms) with a shape. `scene/roofs.ts` makes every slope a plane rising from
its eave and takes the lowest plane at each point (the highest for a butterfly), so ridges, hips and
valleys follow without special cases; each slope's face is the outline clipped by one half-plane per
other plane. Gables are the walls filled up to the roof, and dormers and lanterns are small roofs of
their own. Roofs are built into two meshes of their own per floor (opaque and glass), keyed apart from
the floor (`roofKey`), so dragging a panel along a roof rebuilds only the roofs. `auto/roof.ts` works
roofs out from the plan; `scene/roof-info.ts` hands their slopes, panels and shading geometry to
extensions.

## Performance rules (Fire HD 8 class tablets)

- **No frame without a reason.** Rendering is requested by state changes, camera movement and running
  animations only. Idle = 0 fps. Pulsing markers alone render at 11–20 fps.
- **Few draw calls.** Per floor: one opaque mesh (floors, walls, furniture merged), one glass mesh, one
  small dynamic mesh (door leaves, blinds). Markers and halos are one instanced draw each for the house.
- **Unlit materials.** `MeshBasicMaterial` with vertex colours. Lighting is computed per vertex on the CPU
  when a light, door or theme changes (floors and walls carry a ~0.3 m lighting grid). Light stays in its
  room and spills one bounce through open doors.
- **Per-vertex extras only.** Cutaway and room tints run in the vertex shader from small uniform arrays.
- **Tablet tier** (auto on Fire/low-memory devices): pixel ratio 1, no MSAA, coarser grids, fewer segments.

## Looks and graphics levels

`scene/tier.ts` decides the level per device (Tablet, Standard, Realistic, Ultra). Tablet and Standard
draw the model look: `MeshBasicMaterial` with colours lit on the CPU. Realistic and Ultra load
`scene/realistic.ts` on demand (tablets never download it):

- Every vertex the builder makes carries a surface key (`floor:oak`, `wall:wallpaper_damask`,
  `ext:brick`, `role:wood`, `uph:leather`, `out:lawn`) and planar texture coordinates in metres; the
  realistic geometry has one draw group per surface.
- `scene/textures.ts` draws the textures pixel by pixel (tiling seamlessly, with normal maps from
  their height); finishes that take a colour are detail maps the vertex colour shows through.
- Materials are `MeshStandardMaterial` with the same cutaway and room tint injection as the model
  look, plus the CPU lamp light (lamps still light only their room) and the glow of shades, screens
  and lit windows. The sun is a directional light placed from `sun.sun`; its shadow map is redrawn
  only when something in the scene moves, not when the camera does.
- Ultra renders through an `EffectComposer` with ambient occlusion (at half resolution, fed with
  normals drawn with the walls lowered as the cutaway shows them) and bloom.

`scene/finishes.ts` lists the finishes; `scene/furniture-lib.ts` the furniture, in families whose
styles can be swapped. Patios, paths, driveways and decks are textured to order from their look
(`scene/paving.ts`): the surface key carries the material, pattern, unit size, colours and joints
(`pave:sandstone.random.300x300.8e8c70.8a8781.85`, `deck:composite.8e8b87.145`), and
`scene/paving-tex.ts` lays the units out over a tile that repeats exactly and draws each unit's face.
An area's texture runs along its longest edge (or at its angle to it) through the mesh's `uvFrame`.
`scene/areas.ts` works out a raised area's open edges, steps, border and railing runs.
Garden buildings and planters (`scene/garden.ts`) are furniture types whose options (a pergola's
top, a shed's roof, door, windows and trim, a planter's material and plants) are fields of the piece;
a shed with its door in the gable end is described front towards +x and drawn with `Part.turn`. The editor's 2D plan is `editor/plan2d.ts` (SVG, redrawn per frame while
dragging), going through the same change and undo path as the 3D editor.
