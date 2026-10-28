// A two-storey semi-detached house drawn by hand from typical UK measurements: for the dev
// harness, screenshots and the online demo. Entity ids are made up; the pretend Home Assistant
// (hass.ts) creates states for them. To try your own home, put a plan file in dev/plans/
// (git-ignored) and open ?plan=<name>&hass=live.
import { solarSize, type Device, type Floor, type Furniture, type Opening, type Plan, type Roof, type RoofItem, type Room, type Vec2 } from "../model/plan";

const rect = (x0: number, z0: number, x1: number, z1: number): Vec2[] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

let n = 0;
const id = (p: string) => `${p}${++n}`;

function room(name: string, area: string | null, points: Vec2[], floor: Room["floor"] = "wood"): Room {
  return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), name, area_id: area, points, floor };
}

/** An opening on the edge of `r` that contains the point (x, z). */
function on(r: Room, kind: Opening["kind"], x: number, z: number, width: number, extra: Partial<Opening> = {}): Opening {
  const pts = r.points;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const horizontal = Math.abs(a[1] - b[1]) < 1e-6;
    if (horizontal && Math.abs(a[1] - z) < 1e-6 && x >= Math.min(a[0], b[0]) && x <= Math.max(a[0], b[0])) {
      return opening(r, i, Math.abs(x - a[0]), kind, width, extra);
    }
    if (!horizontal && Math.abs(a[0] - x) < 1e-6 && z >= Math.min(a[1], b[1]) && z <= Math.max(a[1], b[1])) {
      return opening(r, i, Math.abs(z - a[1]), kind, width, extra);
    }
  }
  throw new Error(`no edge of ${r.name} at ${x},${z}`);
}

function opening(r: Room, edge: number, offset: number, kind: Opening["kind"], width: number, extra: Partial<Opening>): Opening {
  const window = kind === "window";
  return {
    id: id("o"), room_id: r.id, edge, offset, width, kind,
    height: window ? 1.15 : 2.02, sill: window ? 0.95 : 0, hinge: "left", swing: "in", ...extra,
  };
}

const f = (type: string, x: number, z: number, rotation: number, w: number, d: number, h: number, extra: Partial<Furniture> = {}): Furniture => ({
  id: id("f"), type, x, z, rotation, w, d, h, ...extra,
});

const dev = (entity: string, x: number, z: number, extra: Partial<Device> = {}): Device => ({ id: id("d"), entity, x, z, ...extra });

// ---------------------------------------------------------------- ground floor
const kitchen = room("Kitchen", "kitchen", rect(0, 0, 3.05, 3.15), "tiles");
const dining = room("Dining Room", "dining_room", rect(3.05, 0, 6.25, 3.15), "oak");
const living = room("Living Room", "living_room", [[2.15, 3.15], [3.6, 3.15], [3.6, 3.6], [4.7, 3.6], [4.7, 3.15], [6.25, 3.15], [6.25, 7.4], [2.15, 7.4]], "oak");
const hall = room("Hallway", "hallway", rect(0, 3.15, 2.15, 7.4), "wood");
const side = room("Side Hall", "utility", rect(-1.05, 0, 0, 5.3), "tiles");
const wc = room("WC", "wc", rect(-2.05, 0, -1.05, 1.95), "tiles");
const store = room("Store", null, rect(-2.05, 1.95, -1.05, 2.95), "concrete");
const shed = room("Utility", "utility", rect(-3.1, 2.95, -1.05, 5.3), "concrete");

// the side extension: lean-tos against the house's side wall (turned a quarter, their backs face it)
const leanTo = (x0: number, z0: number, x1: number, z1: number): Roof => ({
  id: id("roof"), x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: z1 - z0, d: x1 - x0, rotation: 90, shape: "lean_to", pitch: 17, covering: "concrete_tiles",
});

const ground: Floor = {
  id: "ground", name: "Ground Floor", ha_floor: "ground_floor", elevation: 0, height: 2.6,
  roofs: [leanTo(-2.05, 0, 0, 2.95), leanTo(-3.1, 2.95, 0, 5.3)],
  rooms: [kitchen, dining, living, hall, side, wc, store, shed],
  openings: [
    on(hall, "door", 1.35, 7.4, 0.86, { entity: "binary_sensor.front_door" }),
    on(living, "window", 4.2, 7.4, 1.8, { entity: "binary_sensor.living_room_window" }),
    on(hall, "window", 0, 6.5, 0.55, { entity: "binary_sensor.hall_window" }),
    on(living, "door", 2.15, 6.4, 0.76, { hinge: "right" }),
    on(hall, "passage", 1.45, 3.15, 0.85),
    on(kitchen, "passage", 3.05, 1.75, 1.0),
    on(living, "passage", 5.4, 3.15, 1.25),
    on(dining, "door", 4.65, 0, 1.4, { entity: "binary_sensor.garden_door", swing: "out" }),
    on(kitchen, "window", 1.75, 0, 1.3, { entity: "binary_sensor.kitchen_window", sill: 1.05, height: 1.0 }),
    on(kitchen, "door", 0, 2.55, 0.76),
    on(wc, "door", -1.05, 1.3, 0.66),
    on(store, "door", -1.05, 2.45, 0.6),
    on(shed, "door", -1.05, 4.0, 0.72, { entity: "binary_sensor.utility_door" }),
    on(side, "door", -0.52, 5.3, 0.8, { entity: "binary_sensor.side_door" }),
    on(side, "door", -0.52, 0, 0.8),
  ],
  furniture: [
    // living room
    f("sofa", 5.65, 5.3, 90, 2.4, 0.95, 0.82),
    f("armchair", 4.3, 6.75, 180, 0.85, 0.85, 0.85),
    f("coffee_table", 4.4, 5.2, 90, 1.0, 0.55, 0.42),
    f("sideboard", 2.42, 5.1, -90, 1.7, 0.42, 0.55),
    f("tv_wall", 2.24, 5.1, -90, 1.7, 0.06, 0.98, { y: 0.95, entity: "media_player.living_room_tv" }),
    f("rug", 4.3, 5.2, 90, 2.0, 1.5, 0.01),
    f("fireplace", 4.15, 3.78, 0, 1.0, 0.3, 1.05),
    f("plant", 6.0, 3.45, 0, 0.45, 0.45, 1.2),
    f("lamp_ceiling", 4.2, 5.3, 0, 0.45, 0.45, 0.1, { entity: "light.living_room_ceiling" }),
    f("lamp_floor", 5.95, 7.05, 0, 0.42, 0.42, 1.6, { entity: "light.living_room_floor_lamp" }),
    f("led_strip", 4.15, 3.62, 0, 1.0, 0.02, 0.012, { y: 1.1, entity: "light.fireplace_strip" }),
    f("lamp_downlight", 3.2, 4.4, 0, 0.1, 0.1, 0.02, { entity: "light.living_room_downlights" }),
    f("lamp_downlight", 5.2, 4.4, 0, 0.1, 0.1, 0.02, { entity: "light.living_room_downlights" }),
    f("lamp_downlight", 3.2, 6.4, 0, 0.1, 0.1, 0.02, { entity: "light.living_room_downlights" }),
    f("lamp_downlight", 5.2, 6.4, 0, 0.1, 0.1, 0.02, { entity: "light.living_room_downlights" }),
    f("radiator", 4.2, 7.21, 180, 1.4, 0.1, 0.6, { entity: "climate.thermostat" }),
    f("switch_wall", 2.216, 6.92, -90, 0.146, 0.012, 0.086, { entity: "light.living_room_ceiling", gangs: ["light.living_room_ceiling", "light.living_room_downlights"] }),
    // hall
    f("stairs", 0.55, 4.75, 0, 0.9, 2.6, 2.6),
    f("tall_cabinet", 1.85, 4.0, -90, 0.6, 0.38, 1.9),
    f("led_strip", 1.02, 4.75, 90, 2.6, 0.02, 0.012, { y: 0.15, entity: "light.stairs" }),
    f("switch_wall", 1.94, 7.254, 180, 0.086, 0.012, 0.086, { entity: "light.stairs" }),
    // kitchen
    f("kitchen", 0.45, 0.33, 180, 0.6, 0.6, 0.9),
    f("sink", 1.75, 0.33, 180, 1.0, 0.6, 0.9),
    f("dishwasher", 2.55, 0.33, 180, 0.6, 0.6, 0.85),
    f("stove", 0.33, 1.25, 90, 0.6, 0.6, 0.9),
    f("kitchen", 0.33, 1.85, 90, 0.6, 0.6, 0.9),
    f("fridge", 2.75, 2.75, -90, 0.6, 0.65, 1.8),
    f("kitchen_wall", 0.45, 0.2, 180, 0.6, 0.35, 0.7),
    f("kitchen_wall", 2.55, 0.2, 180, 0.6, 0.35, 0.7),
    f("lamp_ceiling", 1.55, 1.6, 0, 0.4, 0.4, 0.1),
    f("underfloor_heating", 1.6, 1.85, 0, 1.6, 1.4, 0.005, { entity: "valve.kitchen_underfloor" }),
    f("socket_wall", 1.0, 0.146, 0, 0.146, 0.012, 0.086, { y: 1.05, entity: "switch.kettle", gangs: ["switch.kettle", "switch.coffee_machine"] }),
    // dining room as office
    f("desk", 3.75, 1.6, 90, 1.4, 0.7, 0.75),
    f("office_chair", 4.3, 1.6, -90, 0.6, 0.6, 1.1),
    f("monitor", 3.55, 1.6, 90, 0.6, 0.2, 0.45, { y: 0.75 }),
    f("shelf", 5.85, 2.6, -90, 0.9, 0.35, 1.9),
    f("lamp_pendant", 4.6, 1.6, 0, 0.35, 0.35, 0.7, { entity: "light.office_pendant" }),
    f("socket_wall", 3.116, 2.65, -90, 0.086, 0.012, 0.086, { entity: "switch.desk_plug" }),
    // side extension
    f("wc", -1.55, 0.45, 0, 0.4, 0.62, 0.8),
    f("washbasin", -1.4, 1.65, 180, 0.45, 0.35, 0.85),
    f("printer_3d", -2.75, 3.3, 0, 0.4, 0.42, 0.5),
    f("washer", -1.4, 5.0, 180, 0.6, 0.6, 0.85),
    f("tall_cabinet", -2.3, 5.0, 180, 0.8, 0.45, 1.9),
    f("hot_water_cylinder", -2.68, 4.25, 0, 0.5, 0.5, 1.25, { entity: "water_heater.hot_water" }),
  ],
  devices: [
    dev("camera.living_room", 6.05, 7.2, { mount: "wall", y: 2.1, rotation: 135 }),
    dev("camera.kitchen", 2.9, 0.15, { mount: "wall", y: 2.1, rotation: 45 }),
    dev("camera.doorbell", 1.95, 7.65, { mount: "wall", y: 1.4, rotation: 0 }),
    dev("binary_sensor.hall_motion", 1.95, 3.35, { y: 2.2 }),
    dev("climate.thermostat", 1.95, 5.6, { y: 1.5 }),
    dev("binary_sensor.utility_motion", -2.85, 5.1, { y: 2.2 }),
    dev("media_player.office_speaker", 3.5, 2.6, { y: 0.8 }),
    // a weather station at the end of the garden: its reading shows on the plan
    dev("sensor.garden_temperature", 1.2, -8.2, { y: 1.2 }),
  ],
  walls: [],
  outdoor: [
    { id: "garden", name: "Garden", kind: "lawn", area_id: "garden", points: rect(-3.24, -10, 6.39, -0.14) },
    { id: "deck", name: "Deck", kind: "deck", area_id: "garden", points: rect(3.0, -3.2, 6.39, -0.14) },
    { id: "front", name: "Driveway", kind: "driveway", area_id: null, points: rect(-3.24, 7.54, 6.39, 13) },
  ],
  fences: [
    // round the back garden with a gate at the end, and low walls either side of the drive
    { id: "fence_garden", points: [[-3.24, -0.14], [-3.24, -10], [6.39, -10], [6.39, -0.14]], style: "closeboard", height: 1.8, gates: [{ at: 14.68, width: 0.9 }] },
    { id: "wall_left", points: [[-3.24, 7.54], [-3.24, 13], [-0.6, 13]], style: "brick_wall", height: 0.9, gates: [] },
    { id: "wall_right", points: [[3.4, 13], [6.39, 13], [6.39, 7.54]], style: "brick_wall", height: 0.9, gates: [] },
  ],
};

// garden lights on the ground floor (lamps on smart plugs and a Tapo bulb), and the outdoor unit of the
// air conditioner upstairs
ground.furniture.push(
  f("ac_outdoor", 2.55, -0.45, 180, 0.8, 0.3, 0.55, { entity: "climate.bedroom_2_air_conditioner" }),
  f("lamp_garden", -2.7, -9.4, 0, 0.15, 0.15, 0.6, { entity: "switch.garden_spot_lights" }),
  f("lamp_garden", 5.9, -9.4, 0, 0.15, 0.15, 0.6, { entity: "switch.deck_lights" }),
  f("lamp_garden", 3.3, -0.6, 0, 0.15, 0.15, 0.6, { entity: "switch.deck_lights" }),
  f("lamp_garden", 6.0, -2.8, 0, 0.15, 0.15, 0.6, { entity: "switch.deck_lights" }),
  f("lamp_garden", -2.8, -4.5, 0, 0.15, 0.15, 0.6, { entity: "light.garden_post" }),
  f("lamp_wall", 4.65, -0.2, 180, 0.25, 0.12, 0.2, { y: 2.1, entity: "switch.patio_wall_light" }),
);

// ---------------------------------------------------------------- first floor
const bath = room("Bathroom", "bathroom", rect(0, 0, 2.3, 1.95), "tiles");
const bed2 = room("Bedroom 2", "bedroom_2", rect(2.3, 0, 6.25, 3.05), "carpet");
const landing = room("Landing", "hallway", rect(0, 1.95, 2.3, 4.5), "carpet");
const bed3 = room("Bedroom 3", "bedroom_3", rect(0, 4.5, 2.3, 7.4), "carpet");
const bed1 = room("Bedroom 1", "bedroom", rect(2.3, 3.05, 6.25, 7.4), "carpet");

const panels = (x: number, z: number, cols: number, rows: number, entity: string): RoofItem => ({
  id: id("pv"), kind: "solar", x, z, cols, rows, portrait: true, watts: 430, entity, ...solarSize({ cols, rows }),
});

// semi-detached: hipped at the free end, cut off at the party wall on the right
const mainRoof: Roof = {
  id: "main_roof", x: 3.125, z: 3.7, w: 6.25, d: 7.4, rotation: 0, shape: "hip", pitch: 35, party: "right", covering: "concrete_tiles",
  items: [
    panels(3.8, 6.88, 3, 1, "sensor.solar_pv1_power"),
    panels(4.5, 5.45, 2, 1, "sensor.solar_pv1_power"),
    panels(3.75, 1.2, 3, 1, "sensor.solar_pv2_power"),
    { id: "chimney", kind: "chimney", x: 6.0, z: 3.7, w: 0.9, d: 0.55, h: 0.9, pots: 2 },
    { id: "roof_window", kind: "window", x: 1.5, z: 1.1, w: 0.78, d: 0.98 },
  ],
};

const first: Floor = {
  id: "first", name: "First Floor", ha_floor: "first_floor", elevation: 2.6, height: 2.5,
  roofs: [mainRoof],
  rooms: [bath, bed2, landing, bed3, bed1],
  openings: [
    on(bath, "window", 1.2, 0, 0.8, { sill: 1.25, height: 0.9, entity: "binary_sensor.bathroom_window" }),
    on(landing, "door", 1.65, 1.95, 0.7),
    on(bed2, "window", 4.35, 0, 1.3),
    on(landing, "door", 2.3, 2.45, 0.76),
    on(landing, "door", 2.3, 3.9, 0.76),
    on(bed1, "window", 4.35, 7.4, 1.3, { entity: "binary_sensor.bedroom_window", cover: "cover.bedroom_curtains" }),
    on(landing, "door", 1.7, 4.5, 0.7),
    on(bed3, "window", 1.2, 7.4, 0.8),
    on(landing, "window", 0, 2.45, 0.5, { sill: 1.0, height: 0.9 }),
  ],
  furniture: [
    f("bathtub", 0.42, 0.98, 90, 1.7, 0.72, 0.55),
    f("wc", 1.8, 0.4, 0, 0.4, 0.62, 0.8),
    f("washbasin", 1.95, 1.62, 180, 0.55, 0.42, 0.85),
    f("bed", 4.3, 6.2, 180, 1.6, 2.05, 0.55),
    f("nightstand", 3.25, 6.95, 180, 0.45, 0.4, 0.5),
    f("nightstand", 5.35, 6.95, 180, 0.45, 0.4, 0.5),
    f("lamp_table", 3.25, 6.95, 0, 0.25, 0.25, 0.42, { y: 0.5, entity: "light.bedside_left" }),
    f("lamp_table", 5.35, 6.95, 0, 0.25, 0.25, 0.42, { y: 0.5, entity: "light.bedside_right" }),
    f("wardrobe", 4.3, 3.4, 0, 2.2, 0.6, 2.1),
    f("tv_wall", 6.17, 5.4, -90, 1.45, 0.06, 0.84, { y: 1.0 }),
    f("fan_ceiling_light", 4.3, 5.1, 0, 1.2, 1.2, 0.45, { entity: "fan.bedroom_ceiling_fan", light: "light.bedroom_ceiling" }),
    f("ac_wall", 3.2, 0.26, 0, 0.9, 0.24, 0.3, { entity: "climate.bedroom_2_air_conditioner" }),
    f("towel_rail", 1.04, 1.85, 180, 0.5, 0.08, 1.0, { y: 0.15, entity: "climate.thermostat" }),
    f("bench", 4.3, 1.5, 0, 1.4, 0.4, 0.45),
    f("rug", 4.3, 1.6, 0, 2.2, 1.4, 0.01),
    f("wardrobe", 1.15, 6.95, 180, 2.0, 0.6, 2.1),
    f("lamp_ceiling", 1.15, 5.9, 0, 0.35, 0.35, 0.1, { entity: "light.bedroom_3_ceiling" }),
    f("lamp_ceiling", 1.15, 3.2, 0, 0.35, 0.35, 0.1),
    f("access_point", 1.15, 4.0, 0, 0.2, 0.2, 0.035, { entity: "device_tracker.landing_access_point" }),
  ],
  devices: [
    dev("binary_sensor.landing_motion", 2.05, 2.2, { y: 2.2 }),
    dev("media_player.bedroom_speaker", 5.4, 6.95, { y: 0.95 }),
    dev("binary_sensor.bedroom_3_motion", 0.3, 4.8, { y: 2.2 }),
  ],
  walls: [],
};

export const DEMO_PLAN: Plan = {
  version: 1,
  name: "Demo house",
  settings: { wall_exterior: 0.28, wall_interior: 0.12, north: 0, theme: "auto", exterior_finish: "brick" },
  floors: [ground, first],
};
