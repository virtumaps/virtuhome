import { describe, expect, it } from "vitest";
import { HassLive } from "../src/live/live";
import { normalizePlan } from "../src/model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";
import { demoHistory, storyState } from "../dev/demo-history";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** Two storeys: a hall and a kitchen downstairs with a garden, a landing upstairs. */
const plan = () => normalizePlan({
  version: 1,
  settings: {},
  floors: [
    {
      id: "g", name: "Ground Floor", elevation: 0, height: 2.6,
      rooms: [
        { id: "hall", name: "Hallway", area_id: "hallway", points: rect(0, 0, 2, 4) },
        { id: "kitchen", name: "Kitchen", area_id: "kitchen", points: rect(2, 0, 6, 4) },
      ],
      outdoor: [{ id: "garden", name: "Garden", kind: "lawn", area_id: "garden", points: rect(0, -8, 6, -0.2) }],
      openings: [{ id: "o1", room_id: "hall", edge: 2, offset: 1, width: 0.9, height: 2, sill: 0, kind: "door", entity: "binary_sensor.front_door" }],
      furniture: [{ id: "f1", type: "lamp_floor", x: 5, z: 3, rotation: 0, w: 0.4, d: 0.4, h: 1.6, entity: "light.kitchen_lamp" }],
      devices: [
        { id: "d1", entity: "camera.doorbell", x: 1, z: 4.1 },
        { id: "d2", entity: "binary_sensor.kitchen_motion", x: 3, z: 1 },
        { id: "d3", entity: "light.garden_post", x: 3, z: -4 },
      ],
      walls: [],
    },
    {
      id: "f", name: "First Floor", elevation: 2.6, height: 2.5,
      rooms: [{ id: "landing", name: "Landing", area_id: "landing", points: rect(0, 0, 2, 4) }],
      openings: [], furniture: [], devices: [], walls: [],
    },
  ],
});

function hassOf(states: Record<string, [string, Record<string, unknown>?]>, reg: Record<string, Partial<HassEntityReg>>): Hass {
  const s: Record<string, HassEntity> = {};
  for (const [id, [state, attributes]] of Object.entries(states)) {
    s[id] = { entity_id: id, state, attributes: attributes ?? {}, last_changed: "2026-10-17T12:00:00Z", last_updated: "2026-10-17T12:00:00Z" };
  }
  const entities = Object.fromEntries(Object.entries(reg).map(([id, r]) => [id, { entity_id: id, ...r }]));
  return { states: s, entities, devices: { bell: { id: "bell", name: "Doorbell" } } } as unknown as Hass;
}

const house = () => hassOf(
  {
    "binary_sensor.front_door": ["off", { device_class: "door" }],
    "binary_sensor.kitchen_motion": ["off", { device_class: "motion" }],
    "binary_sensor.landing_motion": ["off", { device_class: "motion" }],
    "binary_sensor.bell_motion": ["off", { device_class: "motion" }],
    "camera.doorbell": ["idle"],
    "light.kitchen_lamp": ["off"],
    "light.garden_post": ["off"],
    "sensor.landing_temperature": ["19.5", { device_class: "temperature", unit_of_measurement: "°C" }],
    "lock.back_door": ["locked"],
  },
  {
    "binary_sensor.landing_motion": { area_id: "landing" },
    "binary_sensor.bell_motion": { device_id: "bell" },
    "camera.doorbell": { device_id: "bell" },
    "sensor.landing_temperature": { area_id: "landing" },
    "lock.back_door": { area_id: "kitchen" },
  },
);

describe("where an entity is", () => {
  const live = new HassLive(plan());
  live.update(house());

  it("finds devices, lamps and door sensors placed in the plan", () => {
    expect(live.place("binary_sensor.kitchen_motion")).toEqual({ floor: 0, room: 1 });
    expect(live.place("light.kitchen_lamp")).toEqual({ floor: 0, room: 1 });
    expect(live.place("binary_sensor.front_door")).toEqual({ floor: 0, room: 0 });
    // a garden area counts after the floor's rooms
    expect(live.place("light.garden_post")).toEqual({ floor: 0, room: 2 });
  });

  it("puts a camera's own motion sensor where the camera is", () => {
    // the doorbell hangs just outside the hall's wall, in no room
    expect(live.place("binary_sensor.bell_motion")).toEqual({ floor: 0, room: -1 });
  });

  it("falls back to the room of the entity's area", () => {
    expect(live.place("binary_sensor.landing_motion")).toEqual({ floor: 1, room: 0 });
    expect(live.place("lock.back_door")).toEqual({ floor: 0, room: 1 });
    expect(live.place("sensor.nowhere")).toBeNull();
  });

  it("lists what the view shows", () => {
    const w = live.watched();
    for (const id of ["binary_sensor.front_door", "binary_sensor.kitchen_motion", "binary_sensor.landing_motion", "binary_sensor.bell_motion", "camera.doorbell", "light.kitchen_lamp", "sensor.landing_temperature"]) {
      expect(w).toContain(id);
    }
    expect(w).not.toContain("lock.back_door");
  });
});

describe("a replay's clock", () => {
  it("pulses a sensor that changed in the minute before the time shown", () => {
    const live = new HassLive(plan());
    const h = house();
    const changed = Date.parse("2026-10-17T13:02:00Z");
    h.states["binary_sensor.kitchen_motion"] = { ...h.states["binary_sensor.kitchen_motion"], state: "on", last_changed: new Date(changed).toISOString() };
    live.update(h);
    const motion = { id: "d2", entity: "binary_sensor.kitchen_motion", x: 3, z: 1 };
    live.now = () => changed + 30_000;
    expect(live.marker(motion)?.pulse).toBe(1);
    live.now = () => changed + 120_000;
    expect(live.marker(motion)?.pulse).toBe(0);
  });
});

describe("the demo's pretend day", () => {
  const midnight = new Date(2026, 9, 14).getTime();
  const at = (h: number, m = 0) => midnight + (h * 60 + m) * 60_000;

  it("starts each entity with its state at the start, then its changes in order", () => {
    const rows = demoHistory({ start_time: new Date(at(0)).toISOString(), end_time: new Date(at(23, 59)).toISOString(), entity_ids: ["binary_sensor.front_door", "alarm_control_panel.home", "light.stairs"], no_attributes: true }, {});
    const door = rows["binary_sensor.front_door"];
    expect(door[0]).toEqual({ s: "off", lu: at(0) / 1000 });
    expect(door.length).toBeGreaterThan(8);
    for (let i = 1; i < door.length; i++) expect(door[i].lu).toBeGreaterThan(door[i - 1].lu);
    expect(door.every((r) => r.a === undefined)).toBe(true);
    const alarm = rows["alarm_control_panel.home"].map((r) => r.s);
    expect(alarm[0]).toBe("armed_home");
    expect(alarm).toContain("armed_away");
    expect(alarm).toContain("pending");
  });

  it("has everyone out in the afternoon, with the alarm set", () => {
    expect(storyState("person.alex", at(15))?.s).toBe("not_home");
    expect(storyState("person.sam", at(15))?.s).toBe("Work");
    expect(storyState("alarm_control_panel.home", at(15))?.s).toBe("armed_away");
    expect(storyState("person.alex", at(21))?.s).toBe("home");
  });

  it("carries attributes for lights unless asked not to", () => {
    const rows = demoHistory({ start_time: new Date(at(18)).toISOString(), end_time: new Date(at(20)).toISOString(), entity_ids: ["light.living_room_floor_lamp"] }, {});
    const on = rows["light.living_room_floor_lamp"].find((r) => r.s === "on");
    expect(on?.a).toMatchObject({ brightness: 190, color_temp_kelvin: 2700 });
  });
});
