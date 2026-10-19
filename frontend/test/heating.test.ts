import { describe, expect, it } from "vitest";
import { heatColour, heatText, HassLive, shownClimate } from "../src/live/live";
import { normalizePlan, type Floor } from "../src/model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/**
 * A hall with the boiler's thermostat on its wall, a living room and a garden downstairs; a landing
 * that shares the hall's area and a bedroom with a radiator valve upstairs.
 */
const plan = (devices: { entity: string; x: number; z: number }[] = [{ entity: "climate.thermostat", x: 0.1, z: 2 }]) => normalizePlan({
  version: 1,
  settings: {},
  floors: [
    {
      id: "g", name: "Ground Floor", elevation: 0, height: 2.6,
      rooms: [
        { id: "hall", name: "Hallway", area_id: "hallway", points: rect(0, 0, 2, 4) },
        { id: "living", name: "Living Room", area_id: "living_room", points: rect(2, 0, 6, 4) },
      ],
      outdoor: [{ id: "garden", name: "Garden", kind: "lawn", area_id: "garden", points: rect(0, -8, 6, -0.2) }],
      openings: [], furniture: [], walls: [],
      devices: devices.map((d, i) => ({ id: `d${i}`, ...d })),
    },
    {
      id: "f", name: "First Floor", elevation: 2.6, height: 2.5,
      rooms: [
        { id: "landing", name: "Landing", area_id: "hallway", points: rect(0, 0, 2, 4) },
        { id: "bed", name: "Bedroom", area_id: "bedroom", points: rect(2, 0, 6, 4) },
      ],
      openings: [], furniture: [], devices: [], walls: [],
    },
  ],
});

type States = Record<string, [string, Record<string, unknown>?]>;

function hassOf(states: States, reg: Record<string, Partial<HassEntityReg>> = {}): Hass {
  const s: Record<string, HassEntity> = {};
  for (const [id, [state, attributes]] of Object.entries(states)) {
    s[id] = { entity_id: id, state, attributes: attributes ?? {}, last_changed: "2026-10-19T12:00:00Z", last_updated: "2026-10-19T12:00:00Z" };
  }
  const entities = Object.fromEntries(Object.keys(states).map((id) => [id, { entity_id: id, ...reg[id] }]));
  return { states: s, entities } as unknown as Hass;
}

const heat = (action: string | null, current: number | null, target: number | null, state = "heat") => [
  state,
  { ...(action ? { hvac_action: action } : {}), ...(current !== null ? { current_temperature: current } : {}), ...(target !== null ? { temperature: target } : {}) },
] as [string, Record<string, unknown>];

const live = (states: States, reg: Record<string, Partial<HassEntityReg>> = {}, p = plan()) => {
  const l = new HassLive(p);
  l.update(hassOf(states, reg));
  const room = (fi: number, id: string) => ({ floor: p.floors[fi] as Floor, room: { id } });
  return {
    l,
    text: (fi: number, id: string) => { const r = room(fi, id); return l.roomText(r.floor, r.room); },
    line: (fi: number, id: string) => { const r = room(fi, id); return l.roomLine(r.floor, r.room); },
    tint: (fi: number, id: string) => { const r = room(fi, id); return l.tint(r.floor, r.room); },
  };
};

describe("which room a thermostat or valve heats", () => {
  it("puts a thermostat placed in the plan in its room only, not in other rooms of its area", () => {
    const h = live({ "climate.thermostat": heat("idle", 20.5, 21) }, { "climate.thermostat": { area_id: "hallway" } });
    expect(h.text(0, "hall")).toBe("20.5° → 21°");
    expect(h.text(1, "landing")).toBeNull();
  });

  it("puts one that isn't placed in the rooms of its area", () => {
    const h = live({ "climate.bedroom_trv": heat("idle", 18, 19.5) }, { "climate.bedroom_trv": { area_id: "bedroom" } }, plan([]));
    expect(h.text(1, "bed")).toBe("18.0° → 19.5°");
    expect(h.text(0, "living")).toBeNull();
  });

  it("lists them with what the view watches", () => {
    const h = live({ "climate.bedroom_trv": heat("idle", 18, 19.5) }, { "climate.bedroom_trv": { area_id: "bedroom" } }, plan([]));
    expect(h.l.watched()).toContain("climate.bedroom_trv");
  });

  it("leaves gardens out", () => {
    const h = live({ "climate.car": heat("heating", 12, 21) }, { "climate.car": { area_id: "garden" } }, plan([]));
    expect(h.text(0, "garden")).toBeNull();
    expect(h.tint(0, "garden")).toBeNull();
  });
});

describe("the label", () => {
  it("pairs the setpoint with what the thermostat reads, as its dialog does", () => {
    const reg = { "sensor.hall_temperature": { area_id: "hallway" }, "sensor.hall_humidity": { area_id: "hallway" } };
    const sensors: States = { "sensor.hall_temperature": ["19.8", { device_class: "temperature", unit_of_measurement: "°C" }], "sensor.hall_humidity": ["52", { device_class: "humidity", unit_of_measurement: "%" }] };
    const h = live({ ...sensors, "climate.thermostat": heat("idle", 21.5, 21) }, reg);
    expect(h.text(0, "hall")).toBe("21.5° → 21° · 52 %");
    // the temperature map keeps the room's own sensor
    h.l.heatmap = true;
    expect(h.tint(0, "hall")?.slice(0, 3)).toEqual(heatColour(19.8));
    // a thermostat that reads nothing takes the room's sensor
    expect(live({ ...sensors, "climate.thermostat": heat("idle", null, 21) }, reg).text(0, "hall")).toBe("19.8° → 21° · 52 %");
  });

  it("drops the setpoint while the heating is off", () => {
    expect(live({ "climate.thermostat": heat(null, 20.5, 7, "off") }).text(0, "hall")).toBe("20.5°");
  });

  it("shows the warmest setpoint of several", () => {
    const h = live(
      { "climate.thermostat": heat("idle", 20.4, 19), "climate.hall_trv": heat("idle", 20.6, 21.5), "climate.spare": heat(null, 20, 25, "off") },
      {},
      plan([{ entity: "climate.thermostat", x: 0.1, z: 2 }, { entity: "climate.hall_trv", x: 1, z: 0.2 }, { entity: "climate.spare", x: 1, z: 3 }]),
    );
    expect(h.text(0, "hall")).toBe("20.6° → 21.5°");
    expect(h.line(0, "hall")[0].entity).toBe("climate.hall_trv");
  });

  it("shows a heat-and-cool range", () => {
    expect(live({ "climate.thermostat": ["heat_cool", { current_temperature: 22, target_temp_low: 20, target_temp_high: 24 }] }).text(0, "hall")).toBe("22.0° → 20–24°");
  });

  it("leaves out a thermostat that is unavailable", () => {
    const h = live(
      { "climate.thermostat": ["unavailable"], "sensor.hall_temperature": ["19.8", { device_class: "temperature", unit_of_measurement: "°C" }] },
      { "sensor.hall_temperature": { area_id: "hallway" } },
    );
    expect(h.line(0, "hall")).toEqual([{ text: "19.8°" }]);
  });

  it("opens the thermostat from its piece, warm while it heats", () => {
    expect(live({ "climate.thermostat": heat("heating", 19, 21) }).line(0, "hall")[0]).toEqual({ text: "19.0° → 21°", entity: "climate.thermostat", heating: true });
    expect(live({ "climate.thermostat": heat("idle", 21, 21) }).line(0, "hall")[0].heating).toBe(false);
  });
});

describe("the warm glow", () => {
  it("tints a room while its valve heats, and not while idle", () => {
    const reg = { "climate.bedroom_trv": { area_id: "bedroom" }, "climate.living_trv": { area_id: "living_room" } };
    const h = live({ "climate.bedroom_trv": heat("heating", 18, 21), "climate.living_trv": heat("idle", 21, 21) }, reg, plan([]));
    expect(h.tint(1, "bed")?.[3]).toBeGreaterThan(0);
    expect(h.tint(0, "living")).toBeNull();
    // with valves in some rooms, the others follow nothing
    expect(h.tint(0, "hall")).toBeNull();
  });

  it("needs hvac_action", () => {
    expect(live({ "climate.thermostat": heat(null, 18, 21) }).tint(0, "hall")).toBeNull();
  });

  it("tints if any of a room's several heats", () => {
    const h = live(
      { "climate.thermostat": heat("idle", 20, 19), "climate.hall_trv": heat("heating", 19, 21) },
      {},
      plan([{ entity: "climate.thermostat", x: 0.1, z: 2 }, { entity: "climate.hall_trv", x: 1, z: 0.2 }]),
    );
    expect(h.tint(0, "hall")).not.toBeNull();
  });

  it("warms every room of the home from its one thermostat, but not the garden", () => {
    const h = live({ "climate.thermostat": heat("heating", 19, 21) });
    for (const [fi, id] of [[0, "hall"], [0, "living"], [1, "landing"], [1, "bed"]] as const) expect(h.tint(fi, id)).not.toBeNull();
    expect(h.tint(0, "garden")).toBeNull();
    // the setpoint stays on the thermostat's own room
    expect(h.text(0, "living")).toBeNull();
  });

  it("cools only the air conditioner's own room", () => {
    const h = live({ "climate.thermostat": heat("cooling", 26, 23, "cool") });
    expect(h.tint(0, "hall")?.[2]).toBe(1);
    expect(h.tint(0, "living")).toBeNull();
  });

  it("gives way to motion, and the temperature map reads the thermostat", () => {
    const h = live(
      { "climate.thermostat": heat("heating", 16, 21), "binary_sensor.hall_motion": ["on", { device_class: "motion" }] },
      { "binary_sensor.hall_motion": { area_id: "hallway" } },
    );
    expect(h.tint(0, "hall")).toEqual([1.0, 0.72, 0.32, 0.09]);
    h.l.heatmap = true;
    expect(h.tint(0, "hall")?.[3]).toBe(0.42);
    expect(h.tint(0, "living")).toBeNull();
  });
});

describe("the text", () => {
  it("rounds as thermostats do", () => {
    expect(heatText(20.46, "21°")).toBe("20.5° → 21°");
    expect(heatText(null, "21°")).toBe("→ 21°");
    expect(heatText(null, null)).toBeNull();
    const s = (target: number): HassEntity => ({ entity_id: "climate.x", state: "heat", attributes: { temperature: target }, last_changed: "", last_updated: "" });
    expect(shownClimate([s(20.5)])?.target).toBe("20.5°");
    expect(shownClimate([s(21.04)])?.target).toBe("21°");
    expect(shownClimate([])).toBeNull();
  });
});
