# Changelog

## 0.4.0

### New
- Car charging: EV chargers (Ohme, Zappi, Hypervolt, Pod Point, Wallbox, Easee, OCPP and others) are
  found by themselves. The energy sheet shows the car next to the house with what it draws, a card
  per car with its battery, the level and time it charges to, what the charger is doing and its
  charge modes to pick from (and Approve for a charge that waits), and today's energy into the car.
  The corner chip shows the car's battery while it is plugged in. The charger and the car's battery
  can be changed in Edit → Home → Energy.
- An EV charger (on the wall or on a post) to place on the driveway: its light is green while
  charging, blue while plugged in and amber while waiting. A car's charging port lights up the same
  way, and the driveway's label says how full the car is.
- Place devices automatically puts the charger on the house's wall at the driveway with a car in
  front of it, instead of the charger's switches as plugs. The car takes the shape and size of the
  charger's car when it names a popular one (Nissan Leaf, Tesla, MG4, ID.3, Ioniq 5…).
- Cars come as a hatchback, saloon, SUV or estate, with wheels, lights, plates and mirrors (the old
  boxy car becomes the hatchback). "Shape it like…" in Edit fits a car to its charger's car.
- A car can be shown only while it is here: while plugged in, or while a tracker (a tag in the car,
  the car's own integration) or a sensor says so. Away, it is left out of the 3D view.
- Extension API 3: replays of the past. An extension can show the house as it was at any moment
  from Home Assistant's history (doors, windows, lights, motion, cameras, the alarm and who was
  home, day or night as it was then), while live states wait and nothing can be switched. It can
  also ask where an entity is in the plan and move between floors and rooms. The Security
  extension's timeline uses it.
- Dev harness: the demo house has a pretend day of history to replay, and an alarm.

## 0.3.1
- Nothing changes in VirtuHome itself. Releases are now also checked with Home Assistant's hassfest.

## 0.3.0

VirtuHome is now licensed under the GNU GPL v3 (it was PolyForm Shield). The paid extensions are
unchanged.

### New
- Solar, battery and grid: a chip in the corner with what the panels make (or the house uses after
  dark) and the battery's level, and an energy sheet with the power flowing between solar, battery,
  grid and the house, the price now (with Octopus and other tariff sensors) and today's totals. The
  sensors are found from Home Assistant's energy settings and can be changed in Edit → Home → Energy.
  Card option `energy: false` hides it.
- Solar panels to place in the garden or on an outbuilding; their cells shine with the house's solar.
- Doors and windows have styles, finishes and colours. Doors can be flush, panelled, glazed, French,
  sliding glass or barn doors. Windows can be casement, tilt and turn, top-hung, sliding sash,
  sliding or fixed. Garage doors can be up and over, roller or side-hinged. Frames and leaves come
  in painted wood, uPVC, aluminium, oak, light wood or walnut, in any colour, with glazing bars if
  wanted. They open inwards or outwards, and "Same finish on every window" copies a look house-wide.
- Windows open in 3D when their contact sensor does, as doors already did: casements swing, tilt
  and turn windows tilt in, sashes slide up, sliders slide across and garage doors roll up.
- Staircase balustrades: spindles, slim bars, glass or a solid panel, in white primed, pine,
  softwood, oak, walnut, black metal or steel, on either side or both.
- Doors and windows can be tapped in 3D to edit them, and dragged along their wall.
- Extension API 2: tool buttons, room tints and texts, and the house's energy (the Energy extension
  colours rooms by their power and lists the biggest users).

### Better
- Furniture keeps out of walls and other furniture when it is moved, turned or resized, and slides
  along what it meets. A chair still tucks under a table, and a vase still stands on a sideboard.
- Dragging stays smooth: the piece moves on its own, and only its storey is rebuilt when it is
  dropped. Materials and textures are kept between edits instead of being rebuilt.
- The selected piece's blue dot can be grabbed even when something stands in front of it.
- Backspace or Delete removes the selected piece, device, door or window.
- Save is greyed out while there is nothing to save.
- Edit mode keeps the walls the way the walls button has them, instead of always lowering them. A
  selected door or window's wall slides up to full height, so it is seen whole.
- The walls button shows which mode it is in: smart cutaway, low or full height.

### Fixed
- Flickering where two surfaces met: door thresholds, window boards on their sills, the walls over
  doors and windows once walls are lowered, door and window frames at the cut, a bath's water, the
  top step under the landing, kitchen worktops in a run, walls where a straight wall is split,
  overlapping garden areas, and the parts of sofas, armchairs, shelves and beds.
- Wall cupboards, pictures and ceiling lamps no longer drop to the floor after saving. The
  integration stored a missing height as 0; plans saved like that are repaired when loaded.
- A wall's end is no longer open when the wall it meets slides down in the cutaway.
- A garden area's corners can be dragged whichever storey was shown last.
- The selection's blue dot no longer stays behind after closing the editor.

## 0.2.0

### New
- Graphics levels: Tablet, Standard, Realistic and Ultra. Realistic adds textured materials, light
  from the sky and the real sun with soft shadows; Ultra adds ambient occlusion and glow. Automatic
  picks per device and steps down when the view gets slow; each device can pick its own level.
- Finishes: floors (woods, herringbone, tiles, marble, carpet…), wall paint and wallpaper with any
  colour, and the outside walls in brick, render, stone, cladding or concrete (per storey too).
- About 110 pieces of furniture and decor, in families whose styles can be swapped (a sofa for a
  corner sofa or a Chesterfield), with any colour, upholstery (fabric, linen, velvet, bouclé,
  leather) and mirroring. Plants, pictures, mirrors, gym kit, kids' things, garden furniture, cars.
- 2D plan editor: every wall measured, corners and walls dragged with snapping and guides, lengths
  typed in, rooms drawn, doors and windows placed and slid along walls, furniture turned by a handle.
- Live: alert banner for leaks, smoke, gas and a triggered alarm; who is home; lights-on count that
  turns them off; temperature map; camera view cones that stop at walls and turn red on motion.
- Scan import picks furniture styles from RoomPlan (corner sofas, stools, round tables, bookcases…)
  and adds the decoration House Scan found or was told about (`detections.json`).

### Better
- Undo and redo are proper buttons with keyboard shortcuts, and say what they undo.
- Overlapping room labels make way for bigger rooms.
- The camera frames the house to fill the view.

## 0.1.2
- Room sheet: one tile per device.

## 0.1.1
- The card loads as a dashboard resource, so it works next to cards that replace the element registry.

## 0.1.0
- First release.
