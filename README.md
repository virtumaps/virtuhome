# VirtuHome

Your home as a live 3D model in Home Assistant. Lights glow in their real colours and light up their
rooms, doors swing with their contact sensors, blinds follow their covers, cameras, motion and alarms
show where they are, and walls between you and a room slide out of the way.

![The ground floor at night, Ultra graphics](docs/screenshots/night.jpg)

Built for wall tablets first: on a Fire HD 8 class tablet the view draws nothing while nothing changes,
each floor is one or two draw calls, and lighting is computed on the CPU only when a light changes.
On a computer or a recent iPad it switches to a realistic look with textures, sunlight and shadows.

- **Get your home in:** import an iPhone/iPad LiDAR scan (Apple RoomPlan JSON), or draw rooms in the
  2D plan. Furniture comes with the scan in the right style (corner sofa, bar stool, round table…),
  and with the House Scan app plants, pictures, mirrors and gym kit too.
- **Smart setup:** rooms link to Home Assistant areas by name; lights, cameras, motion sensors,
  thermostats and plugs are placed in their rooms, door and window sensors attach to their doors and
  windows, the TV to its screen.
- **Live:** lights glow and light their rooms (and spill through open doors), lit windows glow at night,
  doors swing, curtains move, motion and alarms show where they happen, camera views show on the floor
  and turn red on motion, leaks and smoke raise a banner, a temperature map colours the rooms, room
  temperatures sit on the labels, who is home sits in the corner, and one tap turns off the lights.
- **Solar, battery and grid:** what the panels make sits in the corner; tap it for the power flowing
  between solar, battery, grid and the house, the price now and today's totals. Found from Home
  Assistant's energy settings; solar panels placed in the plan shine with what they make.
- **Make it look like home:** floor finishes, wall paint and wallpaper, the outside in brick, render,
  stone or cladding, and about 110 pieces of furniture and decor in swappable styles, colours and
  fabrics.
- **Free and open source** under the GPL-3.0 licence, and open to contributions. Extensions such as Wall Tablet
  (doorbell camera takeover, screensaver, night dimming) and Energy (rooms coloured by their power,
  the biggest users and what is not measured yet) are available to VirtuMaps installation clients.

| Realistic, by day | Live: alerts, people, temperature map |
|---|---|
| ![Realistic look by day](docs/screenshots/day.jpg) | ![Leak alert, people and the temperature map](docs/screenshots/live.jpg) |
| **Finishes, colours and decor** | **2D plan with measurements** |
| ![Editing a room's look](docs/screenshots/editor.jpg) | ![The 2D plan editor](docs/screenshots/plan.jpg) |

## Install (HACS, custom repository)

1. HACS → ⋮ → Custom repositories → `https://github.com/virtumaps/virtuhome` as **Integration**.
2. Install **VirtuHome**, restart Home Assistant.
3. Settings → Devices & services → Add integration → **VirtuHome**.
4. Open **VirtuHome** in the sidebar. Add the card to a dashboard with `type: custom:virtuhome-card`.

## Card options

```yaml
type: custom:virtuhome-card
floor: ground          # optional: open on a floor (id, name or index)
theme: auto            # auto (follows sun.sun) | day | night
walls: smart           # smart (cutaway) | low | full
quality: auto          # auto | low (Tablet) | medium (Standard) | high (Realistic) | ultra
height: 440            # px, ignored in a panel view or with fill: true
room_panel: true       # tapping a room opens its devices
floor_chips: true
people: true           # who is home, in the corner
energy: true           # solar, battery and grid in the corner (when the house has them)
alarm: alarm_control_panel.home   # optional; default: the first alarm panel, "none" hides it
```

Everything above can also be set in the card's visual editor. Extensions add their own options there.

### Graphics

| Level | Look | For |
|---|---|---|
| Tablet | the model look at 1x, no antialiasing, simpler shapes | Fire tablets, old phones |
| Standard | the model look, sharp and antialiased | phones, older laptops |
| Realistic | textured materials, light from the sky and the real sun (placed from `sun.sun`), soft shadows | computers, recent iPads |
| Ultra | Realistic plus ambient occlusion and glow | strong graphics cards |

**Automatic** picks a level for each device and steps down if moving the view gets slow. The sliders
button in the view picks a level for that device only (it wins over the card's `quality`).

Gestures: tap a lamp or device to switch it, long-press for its Home Assistant dialog, tap a room to
open it, double-tap a room to switch all its lights, double-tap empty space for the whole house.

## Editing

Open **VirtuHome** in the sidebar and tap **Edit** (admins only).

- **3D view:** tap rooms, devices and furniture to select them; drag devices, lamps and furniture; drag
  a room's blue corners to reshape it.
- **2D plan:** every wall measured. Drag corners or whole walls (they snap to the grid and line up with
  other corners), click a measurement to type the exact length, draw rooms as rectangles or corner by
  corner, click a wall to add a door or window and slide it along, turn furniture with its handle.
  Arrow keys nudge, R turns, Delete removes.
- **Looks:** a room's floor and wall finish and paint colour, the outside walls (also per storey), and
  for furniture its style, colour, upholstery and mirroring. Add items from a searchable catalogue.
- **Energy:** Edit → Home → Energy shows the solar, house, battery and grid sensors found from the
  energy settings, and takes another where one is wrong. Panels' peak sets how brightly placed solar
  panels shine (otherwise the best output seen).
- **Undo / Redo** in the header, or Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z. Every save keeps a restore point.

## Scanning with House Scan

Scan room by room with an iPhone or iPad with LiDAR, then choose `house.json`, `manifest.json` and
`detections.json` together in Edit → Home → **Import a scan…**. While scanning, hold decoration in view
for a second, or point the crosshair at it and tap **Tag item** (best for dumbbells, mirrors and rugs).

## Development

```bash
cd frontend
npm install
npm run dev        # rebuilds on change, dev harness on http://127.0.0.1:5173
npm run build      # writes custom_components/virtuhome/frontend
npm test
node ../tools/shot.mjs "floor=0&theme=night&quality=high" /tmp/shot.png   # screenshot with local Chrome
```

The dev harness runs against pretend states (`?hass=demo`) or your Home Assistant (`?hass=live`,
with `HA_URL` and `HA_TOKEN` in the dev server's environment; they are never written to a file).
`?plan=catalog` shows every built-in item, labelled.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [CHANGELOG.md](CHANGELOG.md) and
[CONTRIBUTING.md](CONTRIBUTING.md).

## Extensions and licence keys

Editor → **Extras** takes a licence key. Keys are checked with the VirtuMaps licence server once; the
extensions they unlock are verified, stored in Home Assistant and keep working offline. Nothing is sent
anywhere unless you enter a key.

## Licence

[GNU GPL v3](LICENSE): use it, change it and share it freely. If you share a changed version, it stays
under the GPL with its source. The paid extensions are separate and not covered by this licence. To build
VirtuHome into a closed product, ask about a commercial licence at info@virtumaps.com.
Copyright (c) 2026 VirtuMaps.
