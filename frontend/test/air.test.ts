import { describe, expect, it } from "vitest";
import { airBand, BAND_COLOURS, legendScale, needsDoing, type Air } from "../src/live/air";
import { HassLive } from "../src/live/live";
import { normalizePlan, type Floor } from "../src/model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

const sensor = (state: string, device_class: string, unit: string): HassEntity => ({
  entity_id: "sensor.x", state, attributes: { device_class, unit_of_measurement: unit }, last_changed: "", last_updated: "",
});
const band = (kind: Air, state: string, dc: string, unit: string) => airBand(kind, sensor(state, dc, unit));

describe("the bands", () => {
  it("CO₂: fresh under 800 ppm, a window wanted from 1500", () => {
    expect(["420", "799", "800", "999", "1000", "1499", "1500", "2400"].map((v) => band("co2", v, "carbon_dioxide", "ppm")))
      .toEqual(["good", "good", "fair", "fair", "poor", "poor", "bad", "bad"]);
  });

  it("humidity is bad both ways: dry under 30 %, damp over 60 % and mould likely over 70 %", () => {
    expect(["25", "30", "60", "60.5", "70", "71"].map((v) => band("humidity", v, "humidity", "%")))
      .toEqual(["dry", "good", "good", "poor", "poor", "bad"]);
  });

  it("PM2.5 from the WHO's guideline of 15 µg/m³", () => {
    expect(["4", "15", "34.9", "35", "55", "120"].map((v) => band("pm25", v, "pm25", "µg/m³"))).toEqual(["good", "fair", "fair", "poor", "bad", "bad"]);
  });

  it("VOC in µg/m³, mg/m³, ppb and ppm", () => {
    expect(band("voc", "250", "volatile_organic_compounds", "µg/m³")).toBe("good");
    expect(band("voc", "1.2", "volatile_organic_compounds", "mg/m³")).toBe("poor");
    expect(band("voc", "250", "volatile_organic_compounds_parts", "ppb")).toBe("fair");
    expect(band("voc", "2.5", "volatile_organic_compounds_parts", "ppm")).toBe("bad");
    expect(legendScale("voc", sensor("250", "volatile_organic_compounds_parts", "ppb"))).toEqual({ limits: [220, 660, 2200], unit: "ppb" });
    expect(legendScale("voc", sensor("250", "volatile_organic_compounds", "µg/m³")).unit).toBe("µg/m³");
  });

  it("has no band while a sensor reads nothing", () => {
    expect(band("co2", "unavailable", "carbon_dioxide", "ppm")).toBeNull();
    expect(band("co2", "", "carbon_dioxide", "ppm")).toBeNull();
    expect(airBand("co2", undefined)).toBeNull();
  });

  it("says on the label only what needs doing", () => {
    expect([null, "good", "fair", "poor", "bad", "dry"].map((b) => needsDoing(b as never))).toEqual([false, false, false, true, true, true]);
  });

  it("goes from light to dark as the air gets worse, so the bands differ without colour", () => {
    const luma = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma(BAND_COLOURS.fair)).toBeGreaterThan(luma(BAND_COLOURS.poor));
    expect(luma(BAND_COLOURS.poor)).toBeGreaterThan(luma(BAND_COLOURS.bad));
  });
});

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** A bedroom and an office on one floor, a garden outside; devices placed as given. */
const plan = (devices: { entity: string; x: number; z: number }[] = [], label?: string[]) => normalizePlan({
  version: 1,
  settings: {},
  floors: [{
    id: "g", name: "Ground Floor", elevation: 0, height: 2.6,
    rooms: [
      { id: "bed", name: "Bedroom", area_id: "bedroom", points: rect(0, 0, 4, 4), ...(label ? { label } : {}) },
      { id: "office", name: "Office", area_id: "office", points: rect(4, 0, 8, 4) },
    ],
    outdoor: [{ id: "garden", name: "Garden", kind: "lawn", area_id: "garden", points: rect(0, -8, 8, -0.2) }],
    openings: [], furniture: [], walls: [],
    devices: devices.map((d, i) => ({ id: `d${i}`, ...d })),
  }],
});

type States = Record<string, [string, Record<string, unknown>]>;

function live(states: States, areas: Record<string, string>, p = plan()) {
  const s: Record<string, HassEntity> = {};
  for (const [id, [state, attributes]] of Object.entries(states)) s[id] = { entity_id: id, state, attributes, last_changed: "", last_updated: "" };
  const entities: Record<string, HassEntityReg> = Object.fromEntries(Object.keys(states).map((id) => [id, { entity_id: id, area_id: areas[id] ?? null } as HassEntityReg]));
  const l = new HassLive(p);
  l.update({ states: s, entities } as unknown as Hass);
  const floor = p.floors[0] as Floor;
  return { l, line: (id: string) => l.roomLine(floor, { id }), tint: (id: string) => l.tint(floor, { id }) };
}

const co2 = (v: string): [string, Record<string, unknown>] => [v, { device_class: "carbon_dioxide", unit_of_measurement: "ppm" }];
const hum = (v: string): [string, Record<string, unknown>] => [v, { device_class: "humidity", unit_of_measurement: "%" }];

describe("the maps", () => {
  it("offers temperature, then the air maps the home has sensors for", () => {
    expect(live({}, {}).l.maps()).toEqual(["temperature"]);
    const h = live({ "sensor.bedroom_co2": co2("900"), "sensor.office_humidity": hum("45"), "sensor.garden_co2": co2("420") }, {
      "sensor.bedroom_co2": "bedroom", "sensor.office_humidity": "office", "sensor.garden_co2": "garden",
    });
    expect(h.l.maps()).toEqual(["temperature", "co2", "humidity"]);
  });

  it("tints each room by its band, rooms without a sensor not at all", () => {
    const h = live({ "sensor.bedroom_co2": co2("1700") }, { "sensor.bedroom_co2": "bedroom" });
    expect(h.tint("bed")).toBeNull();
    h.l.map = "co2";
    expect(h.tint("bed")).toEqual([...BAND_COLOURS.bad, 0.42]);
    expect(h.tint("office")).toBeNull();
    h.l.map = "humidity";
    expect(h.tint("bed")).toBeNull();
  });

  it("takes a sensor placed in the room before its area's", () => {
    const states = { "sensor.a_co2": co2("500"), "sensor.b_co2": co2("1200") };
    // both of the bedroom's area; b is placed in the office
    const h = live(states, { "sensor.a_co2": "bedroom", "sensor.b_co2": "bedroom" }, plan([{ entity: "sensor.b_co2", x: 6, z: 2 }]));
    h.l.map = "co2";
    expect(h.tint("bed")?.slice(0, 3)).toEqual(BAND_COLOURS.good);
    expect(h.tint("office")?.slice(0, 3)).toEqual(BAND_COLOURS.poor);
  });

  it("says stuffy or damp air on the room's label, opening the sensor", () => {
    const h = live({ "sensor.bedroom_co2": co2("1640"), "sensor.bedroom_humidity": hum("74") }, { "sensor.bedroom_co2": "bedroom", "sensor.bedroom_humidity": "bedroom" });
    // the label shows the humidity already: only the CO₂ is added
    expect(h.line("bed")).toEqual([{ text: "74 %" }, { text: "CO₂ 1,640 ppm", entity: "sensor.bedroom_co2", warn: true }]);
    const fresh = live({ "sensor.bedroom_co2": co2("640") }, { "sensor.bedroom_co2": "bedroom" });
    expect(fresh.line("bed")).toEqual([]);
    // a label without the humidity says it when it's damp
    const damp = live({ "sensor.bedroom_humidity": hum("74") }, { "sensor.bedroom_humidity": "bedroom" }, plan([], ["temperature"]));
    expect(damp.line("bed")).toEqual([{ text: "Humidity 74%", entity: "sensor.bedroom_humidity", warn: true }]);
  });
});
