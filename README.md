# VirtuHome

Your home as a live 3D model in Home Assistant. Lights glow in their real colours and light up their
rooms, doors swing with their contact sensors, blinds follow their covers, cameras, motion and alarms
show where they are, and walls between you and a room slide out of the way.

Built for wall tablets first: on a Fire HD 8 class tablet the view draws nothing while nothing changes,
each floor is one or two draw calls, and lighting is computed on the CPU only when a light changes.

- **Get your home in:** import an iPhone/iPad LiDAR scan (Apple RoomPlan JSON), or draw rooms and drag
  their corners in the editor. Gardens, patios and driveways too.
- **Smart setup:** rooms link to Home Assistant areas by name; lights, cameras, motion sensors,
  thermostats and plugs are placed in their rooms, door and window sensors attach to their doors and
  windows, the TV to its screen.
- **Live:** lights glow and light their rooms (and spill through open doors), lit windows glow at night,
  doors swing, curtains move, motion and alarms show where they happen, room temperatures sit on the
  labels, the alarm panel is one tap away.
- **Free and open to contributions** under the PolyForm Shield licence. Extensions such as Wall Tablet
  (doorbell camera takeover, screensaver, night dimming) are available to VirtuMaps installation clients.

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
quality: auto          # auto | low | high
height: 440            # px, ignored in a panel view or with fill: true
room_panel: true       # tapping a room opens its devices
floor_chips: true
alarm: alarm_control_panel.home   # optional; default: the first alarm panel, "none" hides it
```

Everything above can also be set in the card's visual editor. Extensions add their own options there.

Gestures: tap a lamp or device to switch it, long-press for its Home Assistant dialog, tap a room to
open it, double-tap a room to switch all its lights, double-tap empty space for the whole house.

## Development

```bash
cd frontend
npm install
npm run dev        # rebuilds on change, dev harness on http://127.0.0.1:5173
npm run build      # writes custom_components/virtuhome/frontend
npm test
node ../tools/shot.mjs "floor=0&theme=night" /tmp/shot.png   # screenshot with local Chrome
```

The dev harness runs against pretend states (`?hass=demo`) or your Home Assistant (`?hass=live`,
with `HA_URL` and `HA_TOKEN` in the dev server's environment; they are never written to a file).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Extensions and licence keys

Editor → **Extras** takes a licence key. Keys are checked with the VirtuMaps licence server once; the
extensions they unlock are verified, stored in Home Assistant and keep working offline. Nothing is sent
anywhere unless you enter a key.

## Licence

[PolyForm Shield 1.0.0](LICENSE): use it, change it and share it freely, except to offer a product or
service that competes with VirtuHome. Copyright (c) 2026 VirtuMaps.
