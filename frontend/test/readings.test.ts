import { describe, expect, it } from "vitest";
import { HassLive } from "../src/live/live";
import { readingIcon, valueText } from "../src/live/readings";
import { entityUses, replaceEntity } from "../src/model/links";
import { normalizePlan, showsValue, type Device, type Floor, type Plan } from "../src/model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

type States = Record<string, [string, Record<string, unknown>?]>;

function hassOf(states: States, reg: Record<string, Partial<HassEntityReg>> = {}, extra: Partial<Hass> = {}): Hass {
  const s: Record<string, HassEntity> = {};
  for (const [id, [state, attributes]] of Object.entries(states)) {
    s[id] = { entity_id: id, state, attributes: attributes ?? {}, last_changed: "2026-10-27T12:00:00Z", last_updated: "2026-10-27T12:00:00Z" };
  }
  const entities = Object.fromEntries(Object.keys(states).map((id) => [id, { entity_id: id, ...reg[id] }]));
  return { states: s, entities, language: "en", ...extra } as unknown as Hass;
}

/** A kitchen with its sensors, and a garden with a pond thermometer in it. */
const plan = (o: { label?: unknown; gardenLabel?: unknown; devices?: Partial<Device>[] } = {}): Plan => normalizePlan({
  version: 1,
  settings: {},
  floors: [{
    id: "g", name: "Ground Floor", elevation: 0, height: 2.6, walls: [], openings: [], furniture: [],
    rooms: [{ id: "k", name: "Kitchen", area_id: "kitchen", points: rect(0, 0, 4, 4), ...(o.label !== undefined ? { label: o.label } : {}) }],
    outdoor: [{ id: "garden", name: "Garden", kind: "lawn", area_id: "garden", points: rect(0, -8, 6, -0.2), ...(o.gardenLabel !== undefined ? { label: o.gardenLabel } : {}) }],
    devices: (o.devices ?? []).map((d, i) => ({ id: `d${i}`, x: 3, z: -4, ...d })),
  }],
});

const STATES: States = {
  "sensor.kitchen_temperature": ["21.43", { device_class: "temperature", unit_of_measurement: "°C" }],
  "sensor.kitchen_humidity": ["48.2", { device_class: "humidity", unit_of_measurement: "%" }],
  "sensor.kitchen_co2": ["612", { device_class: "carbon_dioxide", unit_of_measurement: "ppm" }],
  "sensor.pond_temperature": ["11.875", { device_class: "temperature", unit_of_measurement: "°C" }],
  "binary_sensor.shed_door": ["off", { device_class: "door" }],
};
const REG: Record<string, Partial<HassEntityReg>> = {
  "sensor.kitchen_temperature": { area_id: "kitchen", display_precision: 1 },
  "sensor.kitchen_humidity": { area_id: "kitchen" },
  "sensor.kitchen_co2": { area_id: "kitchen", display_precision: 0 },
  "sensor.pond_temperature": { area_id: "garden", display_precision: 1 },
};

/** The same Home Assistant a moment later, with one state changed (and the same registry). */
const later = (h: Hass, id: string, state: string): Hass => ({ ...h, states: { ...h.states, [id]: { ...h.states[id], state } } });

const live = (p: Plan, states = STATES) => {
  const l = new HassLive(p);
  const hass = hassOf(states, REG);
  l.update(hass);
  const f = p.floors[0] as Floor;
  return { l, f, hass, text: (id: string) => l.roomText(f, { id }), line: (id: string) => l.roomLine(f, { id }) };
};

describe("an entity's value as a reading shows it", () => {
  const h = hassOf(STATES, REG);
  it("follows the entity's display precision and unit", () => {
    expect(valueText(h, "sensor.kitchen_temperature")).toBe("21.4 °C");
    expect(valueText(h, "sensor.kitchen_co2")).toBe("612 ppm");
    expect(valueText(h, "sensor.pond_temperature")).toBe("11.9 °C");
  });

  it("writes a percentage straight after the number, and keeps two decimals at most without a precision", () => {
    expect(valueText(h, "sensor.kitchen_humidity")).toBe("48.2%");
    expect(valueText(hassOf({ "sensor.x": ["3.14159", { unit_of_measurement: "kWh" }] }), "sensor.x")).toBe("3.14 kWh");
  });

  it("shows a dash while unavailable or missing", () => {
    expect(valueText(hassOf({ "sensor.x": ["unavailable"] }), "sensor.x")).toBe("–");
    expect(valueText(hassOf({ "sensor.x": ["unknown"] }), "sensor.x")).toBe("–");
    expect(valueText(h, "sensor.not_there")).toBe("–");
  });

  it("uses Home Assistant's own formatting where there is one", () => {
    const fmt = hassOf(STATES, REG, { formatEntityState: (s: HassEntity) => `[${s.state}]` });
    expect(valueText(fmt, "binary_sensor.shed_door")).toBe("[off]");
    expect(valueText(fmt, "sensor.gone")).toBe("–");
  });

  it("picks an icon by what is measured", () => {
    expect(readingIcon(h, "sensor.kitchen_temperature")).toBe("thermometer");
    expect(readingIcon(h, "sensor.kitchen_humidity")).toBe("humidity");
    expect(readingIcon(h, "sensor.kitchen_co2")).toBe("co2");
    expect(readingIcon(hassOf({ "sensor.tank": ["40", { unit_of_measurement: "%" }] }), "sensor.tank")).toBe("gauge");
  });
});

describe("which devices are readings", () => {
  const d = (entity: string, show?: Device["show"]): Device => ({ id: "x", entity, x: 0, z: 0, show });
  it("shows sensors and numbers by their value unless set to an icon", () => {
    expect(showsValue(d("sensor.pond_temperature"))).toBe(true);
    expect(showsValue(d("input_number.target"))).toBe(true);
    expect(showsValue(d("sensor.pond_temperature", "icon"))).toBe(false);
  });

  it("shows everything else as an icon unless set to its value", () => {
    expect(showsValue(d("binary_sensor.shed_door"))).toBe(false);
    expect(showsValue(d("binary_sensor.shed_door", "value"))).toBe(true);
  });

  it("gives a reading its value and icon, and says when its value changes", () => {
    const p = plan({ devices: [{ entity: "sensor.pond_temperature" }, { entity: "binary_sensor.shed_door" }] });
    const { l, hass } = live(p);
    expect(l.reading(p.floors[0].devices[0])).toEqual({ text: "11.9 °C", icon: "thermometer" });
    const warmer = later(hass, "sensor.pond_temperature", "12.3");
    expect([...l.update(warmer)]).toEqual(["readings"]);
    expect(l.reading(p.floors[0].devices[0])?.text).toBe("12.3 °C");
    // a door contact shown as an icon is no reading
    expect([...l.update(later(warmer, "binary_sensor.shed_door", "on"))]).toEqual(["markers"]);
  });
});

describe("what a room's label shows", () => {
  it("shows the temperature and humidity when nothing is chosen", () => {
    expect(live(plan()).text("k")).toBe("21.4° · 48 %");
  });

  it("shows the chosen values in their order, and hides the rest", () => {
    expect(live(plan({ label: ["humidity"] })).text("k")).toBe("48 %");
    expect(live(plan({ label: ["sensor.kitchen_co2", "temperature"] })).text("k")).toBe("612 ppm · 21.4°");
    expect(live(plan({ label: [] })).text("k")).toBeNull();
  });

  it("opens an entity's value when tapped, and redraws when it changes", () => {
    const { l, hass, line } = live(plan({ label: ["sensor.kitchen_co2"] }));
    expect(line("k")).toEqual([{ text: "612 ppm", entity: "sensor.kitchen_co2" }]);
    expect([...l.update(later(hass, "sensor.kitchen_co2", "700"))]).toEqual(["labels"]);
    expect(line("k")[0].text).toBe("700 ppm");
  });

  it("shows nothing on a garden area unless chosen, then any value", () => {
    expect(live(plan()).text("garden")).toBeNull();
    expect(live(plan({ gardenLabel: ["sensor.pond_temperature"] })).text("garden")).toBe("11.9 °C");
    expect(live(plan({ gardenLabel: ["sensor.gone"] })).text("garden")).toBe("–");
  });
});

describe("labels in the plan", () => {
  it("keeps a label's values as a list of names, at most eight", () => {
    expect(plan({ label: ["humidity", 3, "", "sensor.kitchen_co2"] }).floors[0].rooms[0].label).toEqual(["humidity", "sensor.kitchen_co2"]);
    expect(plan({ label: "temperature" }).floors[0].rooms[0].label).toBeNull();
    expect(plan({ label: Array.from({ length: 12 }, (_, i) => `sensor.s${i}`) }).floors[0].rooms[0].label).toHaveLength(8);
    expect("label" in plan().floors[0].rooms[0]).toBe(false);
  });

  it("follows a renamed entity on a label, and drops one that is unlinked", () => {
    const p = plan({ label: ["temperature", "sensor.kitchen_co2"], gardenLabel: ["sensor.pond_temperature"] });
    expect(entityUses(p).map((u) => u.entity)).toEqual(expect.arrayContaining(["sensor.kitchen_co2", "sensor.pond_temperature"]));
    replaceEntity(p, "sensor.kitchen_co2", "sensor.kitchen_carbon_dioxide");
    expect(p.floors[0].rooms[0].label).toEqual(["temperature", "sensor.kitchen_carbon_dioxide"]);
    replaceEntity(p, "sensor.pond_temperature", null);
    expect(p.floors[0].outdoor![0].label).toEqual([]);
  });
});
