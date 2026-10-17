# Architecture

## Pieces

| Path | What |
|---|---|
| `custom_components/virtuhome/` | Home Assistant integration: stores the plan (`.storage/virtuhome.plan` + restore points), WebSocket API (`virtuhome/plan/get|save|subscribe`, `virtuhome/history/*`, `virtuhome/info`), sidebar panel, serves the frontend. |
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
