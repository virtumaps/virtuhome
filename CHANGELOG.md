# Changelog

## Unreleased

### New
- Add a floor without a scan: Edit → Home → Floors → Add a floor puts a storey on top, and the 2D
  plan shows the floor below faintly to draw its rooms over. A floor can be removed too. A roof's
  Sits on moves it, with everything on it, onto another storey.
- A user guide, [docs/GUIDE.md](docs/GUIDE.md): installing, getting a home in by scanning, drawing or
  tracing a floor plan, placing devices, looks, the garden and roof, energy, the sun and weather,
  wall tablets, the card's options, extensions, a FAQ and troubleshooting.
- Solar panels can have their real size: tap the panels and pick a common size, or type the length
  and width in mm from the label on the back of a panel. The array is sized from it, and Fill the
  slope fits as many as there is room for. A new size changes every array of the same panels, and
  new panels take the size and power of those already on the roof.
- Patios in the popular materials: Indian sandstone, porcelain, concrete slabs, slate, granite,
  limestone, travertine, block paving, clay pavers, granite setts, crazy paving, resin bound and
  tarmac. Each comes in its usual colours (or any colour), patterns (random, grid, staggered, third
  offset, herringbone, basketweave) and slab sizes, with a joint colour, laid along, across or
  diagonally, and with an optional border of setts, blocks, clay pavers, porcelain or sandstone. Paths
  and driveways take the same materials; gravel areas take the colour of their stones. Patios laid
  before show as Indian sandstone and paths as grey block paving until something else is picked.
- Decks in softwood, cedar, hardwood or composite boards, in their colours and widths, laid along,
  across or diagonally, with an optional picture frame of boards round the edge.
- Raised patios and decks: set the height, and a raised patio's sides (brick, stone, render or
  sleepers). Add steps down from any open side, and a railing round the open sides (spindles, glass,
  railings, post and rail, slatted or picket) with a gap at the steps. Spindles is a new fence style
  too.
- Edit → Rooms → **Add a patio** and **Add a deck**. A lawn's panel has **Add to this garden**: a
  patio, a round patio, a deck or a path in the middle of it, **Draw a patio** in the 2D plan, and
  the garden's furniture and plants. A rectangular area's size, or a round one's width, can be typed.

### Fixed
- Activating a licence key no longer sends the home's name from Home Assistant to the licence
  server: only the key and an anonymous code for the installation.
- Solar panels on a roof look dark in the realistic look, as anti-reflective panel glass does; they
  used to mirror a bright sky almost white.
- With the roofs on, taps no longer reach what is inside the house: a tap on a solar panel used to
  pick a light, a camera or (in the editor) a sensor under the roof that happened to be near it on
  screen, and a tap on a window went through the glass to whatever stood behind it. Doors, windows
  and the garden still take taps: in the editor a window's pane selects the window, and in the view
  it opens the window's sensor, or the room behind it.

## 0.8.0

### New
- Roofs: gable, hipped, half-hipped, Dutch gable, pyramid, mansard, gambrel, lean-to, flat (with
  eaves or a parapet), butterfly and M-shaped, with ridge and hip tiles, fascias, soffits and gutters.
  Coverings: concrete and clay plain tiles, slate, clay pantiles, thatch, standing seam metal, mineral
  felt, rubber, fibreglass, lead, sedum and conservatory glass, in the realistic look too. Semi-detached
  and terraced roofs are cut off at the party wall.
- Edit → Home → Roof works the roofs out from the plan: a main roof over the top storey, and a lean-to
  (or a flat roof when deep) over each part of a lower storey that stands against the house. It sees
  from the walls whether the house is detached, semi-detached or terraced.
- On a roof: solar panels (on the sunniest slope, as many as fit, shining with their string's power
  sensor), roof windows (centre-pivot or conservation, lit from the room under them at night), chimneys
  with pots, box, gable and hipped dormers, and roof lanterns. Drag them along the roof.
- A roof button beside the view takes the roofs off to look in from above. With the roofs on, the
  whole-house view shows the storeys standing together as the house does outside.
- Extension API 4: the roofs' slopes and solar panels, what can shade them, the home's location and
  north, and colours painted over the roofs.

## 0.7.0

### New
- Trace a floor plan picture in the 2D plan: put an estate agent's plan (or a photo of a sketch) under
  a floor, set its scale by clicking both ends of a wall you know and typing its length (metres, or feet
  and inches as the plans give them), then draw the rooms over it. Drag it into place, fade it or turn
  it. Only the 2D plan shows it, and Home Assistant keeps it for signed-in users only. A picture that
  isn't a JPEG or PNG, or is very large, is turned into a smaller JPEG first.
- Download diagnostics (Settings → Devices & services → VirtuHome → ⋮): versions, the plan's size and
  counts per floor, linked entities that no longer exist, the dashboard card's resource and the
  extensions, for attaching to an issue. Names, entity ids and the licence key stay out of it.

### Fixed
- Picking a garden area or the driveway flies the view to it, as it does for a room; it used to stay
  where it was.
- A new home's Edit button can be tapped: the "No home yet" text lay over it, so a fresh install
  couldn't start editing.

## 0.6.0

### New
- The sun where it really is. VirtuHome works out the sun's and the moon's position itself from Home
  Assistant's home location (to a tenth of a degree, the same as `sun.sun`), every minute and for any
  moment, so the realistic look's shadows fall as they do outside at every hour and season: long and
  low in winter, short at midsummer.
- Light comes into rooms through their windows and open doors. For the sun every wall stands at its
  full height (the cutaway only lowers them for you), each storey has a ceiling, and closed blinds keep
  the sun out. Storeys hidden above the one you look at still shade the garden.
- The weather from a weather entity (Met.no's `weather.forecast_home`, or the one picked): clouds dim
  the sun and soften its shadows, the sky turns grey or dark, fog closes in, rain falls and wets the
  paving, the drive and the garden (it stays wet for a while after), snow falls and lies on what faces
  up, plants sway in a strong wind, and a storm flashes now and then (not with "reduce motion"). With
  solar panels, what they make now against what they made in clear sun lately tells whether the sun
  is out right now. Replays show the weather of their moment.
- The sun and weather button: the house at any date and time of day (midwinter, midsummer, sunrise,
  noon, sunset…), a day played through, and the weather picked by hand. "Now" goes back to live.
- Edit → Home → Sun and weather: which way the top of the plan faces, on a compass to drag or as a
  bearing, or **Line up with the map**, which turns the plan to match the building's outline on
  OpenStreetMap (it sends Home Assistant's home location to a public OpenStreetMap server). The 2D plan
  has a north arrow to drag. Also: the weather entity, and the weather on or off.
- Scans from House Scan carry the phone's compass reading: an imported scan faces its own way.

### Changed
- The realistic look no longer keeps the sun at least 18° up, and its shadow covers the house as the
  sun sees it, so low-sun shadows are no longer cut short. Clear days have more contrast between sun
  and shade; rooms keep their light.
- The Tablet and Standard looks show the weather in their sky (greyer under cloud, darker in a storm)
  and white ground under snow.

## 0.5.0

### New
- Fences and garden walls in 15 designs: closeboard, lap panel, slatted, venetian, hit and miss,
  louvre, composite, trellis, picket, post and rail, railings, estate fencing, palisade, glass and a
  brick wall with piers. Any height and colour; timber, concrete or metal posts at any spacing; a
  concrete gravel board and a trellis topper on timber panels; single gates and double driveway
  gates in the fence's own style. Draw them with the fence tool in the 2D plan, or tap "Fence round
  it" on a garden area to fence every edge that isn't along the house. Drag their points in 3D or 2D,
  add corners with the +s, or drag a whole fence.
- Cameras are models of their kind where they hang: a camera on a bracket against its wall (its body
  turned to where it looks), a dome on the ceiling, a doorbell flat on the outside wall, or a camera
  on a stand on a table or the floor. Tap one for its live picture; a pin floats over it while it sees
  motion.
- Edit → a camera: its field of view and reach.
- Asphalt driveways: Edit → a driveway → Surface picks block paving or asphalt.
- 2D plan: a corner tool. Click the edge of a room or garden area where the new corner goes (it lines
  up with other corners and the grid along the edge) and drag it into place.

### Changed
- Every camera shows what it sees, also in the whole-house view and in the editor. A camera without a
  direction looks away from its wall (a dome all round), and the view is a clear glow on the floor
  with an outline and a faint beam from the lens, stopping at the first walls. It is red while the
  camera is live or sees motion and grey while it is offline. Before, a camera without a direction
  showed nothing and the view was too faint to see indoors.
- In the editor, furniture, devices, doors and windows move only once they are selected: tap or
  click one first, then drag it. Dragging anything else turns the 3D view (or moves the 2D plan),
  so turning the view no longer shifts a piece by mistake.
- A selected room or garden area has a + in the middle of each edge: drag it out to where the new
  corner goes, or tap it for a corner in the middle of that edge. This replaces the Add a corner
  button, which always split the longest edge, often on the far side of the shape.
- Block-paved driveways are laid in herringbone with brindle blocks. Before, a driveway was the
  path's paving, only larger.
- "Same style on every door" (and window) copies the style and glazing bars too, not only the
  finish and colour.
- Barn doors can hang on either side of their wall: Edit → the door → Hangs.
- Stairs: each step is a wooden tread with a small nosing on a white riser. A picked colour changes
  the treads only; before, every other step was darker.
- A deck stands raised, level with the floor inside, with board sides down to the garden, and can
  be tapped and resized even where it lies inside a lawn.

### Fixed
- A closed door leaves a 4 mm gap all round with a door stop behind it, so no daylight shows past the
  handle side (it was a 3 cm gap). French and side-hinged garage doors meet the same way.
- Saving twice in one editing session no longer says someone else saved the plan in the meantime.

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
