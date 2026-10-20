import { describe, expect, it } from "vitest";
import { entityUses, followRenames, missingLinks, nameLikeness, proposeFor, recordLinks, replaceEntity, type RegistryEntry } from "../src/model/links";
import { normalizePlan, type Plan } from "../src/model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** A kitchen and a hall, with an entity in every kind of place the plan links one. */
const plan = (links: Plan["links"] = {}): Plan => normalizePlan({
  version: 1,
  links,
  settings: {
    energy: { solar: ["sensor.pv1_power", "sensor.pv2_power"], grid: "sensor.grid_power", ev_charger: "sensor.ohme_power" },
    sky: { weather: "weather.home" },
    presence: { people: { "person.kadir": "sensor.kadirs_phone_area" } },
  },
  floors: [{
    id: "g", name: "Ground", elevation: 0, height: 2.6, walls: [],
    rooms: [
      { id: "k", name: "Kitchen", area_id: "kitchen", points: rect(0, 0, 4, 4), temperature: "sensor.kitchen_temperature" },
      { id: "h", name: "Hall", area_id: "hall", points: rect(4, 0, 6, 4) },
    ],
    openings: [{ id: "o", room_id: "h", edge: 0, offset: 1, width: 0.9, height: 2, sill: 0, kind: "door", entity: "binary_sensor.front_door" }],
    furniture: [
      { id: "tv", type: "tv", x: 1, z: 1, rotation: 0, w: 1, d: 0.1, h: 0.6, entity: "media_player.kitchen_tv" },
      { id: "car", type: "car", x: 9, z: 9, rotation: 0, w: 2, d: 4.5, h: 1.5, parked: "device_tracker.car" },
      { id: "car2", type: "car", x: 9, z: 9, rotation: 0, w: 2, d: 4.5, h: 1.5, parked: "plugged" },
    ],
    devices: [
      { id: "d1", entity: "light.kitchen_ceiling", x: 2, z: 2 },
      { id: "d2", entity: "light.hall", x: 5, z: 2 },
    ],
    roofs: [{ id: "r", x: 3, z: 2, w: 6, d: 4, rotation: 0, shape: "gable", pitch: 35, covering: "slate",
      items: [{ id: "s", kind: "solar", x: 3, z: 3, w: 3, d: 2, entity: "sensor.pv1_power" }, { id: "w", kind: "window", x: 2, z: 1, w: 0.8, d: 1, entity: "binary_sensor.roof_window", cover: "cover.roof_blind" }] }],
  }],
});

type Ent = { state?: string; name?: string; device?: string; area?: string; category?: "config" | "diagnostic" };

function hassOf(ents: Record<string, Ent>): Hass {
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, HassEntityReg> = {};
  for (const [id, e] of Object.entries(ents)) {
    states[id] = { entity_id: id, state: e.state ?? "on", attributes: e.name ? { friendly_name: e.name } : {}, last_changed: "", last_updated: "" };
    entities[id] = { entity_id: id, device_id: e.device ?? null, area_id: e.area ?? null, entity_category: e.category ?? null };
  }
  return {
    states, entities,
    devices: { hue: { id: "hue", area_id: "kitchen", name: "Kitchen ceiling" }, ikea: { id: "ikea", area_id: "kitchen" }, z2m: { id: "z2m", area_id: "kitchen" } },
    areas: { kitchen: { area_id: "kitchen", name: "Kitchen" }, hall: { area_id: "hall", name: "Hall" } },
  } as unknown as Hass;
}

/** Everything the plan links, all there. */
const ALL: Record<string, Ent> = Object.fromEntries([
  "sensor.pv1_power", "sensor.pv2_power", "sensor.grid_power", "sensor.ohme_power", "weather.home", "person.kadir", "sensor.kadirs_phone_area",
  "sensor.kitchen_temperature", "binary_sensor.front_door", "media_player.kitchen_tv", "device_tracker.car", "light.hall",
  "binary_sensor.roof_window", "cover.roof_blind",
].map((id) => [id, {}]));

const regOf = (h: Hass, ids: Record<string, string>): RegistryEntry[] =>
  Object.keys(h.states).map((entity_id) => ({ id: ids[entity_id] ?? `reg-${entity_id}`, entity_id, device_id: h.entities?.[entity_id]?.device_id ?? null }));

describe("where the plan links entities", () => {
  it("finds every kind of link, and nothing that is not an entity", () => {
    const ids = entityUses(plan()).map((u) => u.entity).sort();
    expect(ids).toEqual([
      "binary_sensor.front_door", "binary_sensor.roof_window", "cover.roof_blind", "device_tracker.car", "light.hall", "light.kitchen_ceiling",
      "media_player.kitchen_tv", "person.kadir", "sensor.grid_power", "sensor.kadirs_phone_area", "sensor.kitchen_temperature", "sensor.ohme_power",
      "sensor.pv1_power", "sensor.pv1_power", "sensor.pv2_power", "weather.home",
    ]);
  });

  it("names each use and the area it is in", () => {
    const by = Object.fromEntries(entityUses(plan()).map((u) => [u.entity, u]));
    expect(by["light.kitchen_ceiling"]).toMatchObject({ label: "Light in Kitchen", area: "kitchen", device: true });
    expect(by["binary_sensor.front_door"]).toMatchObject({ label: "Door sensor in Hall", area: "hall", device: false });
    expect(by["media_player.kitchen_tv"].area).toBe("kitchen");
    expect(by["sensor.ohme_power"].label).toBe("Energy: car charger");
  });

  it("lists the missing ones once, with every place they are used", () => {
    const missing = missingLinks(plan(), hassOf(Object.fromEntries(Object.entries(ALL).filter(([id]) => id !== "sensor.pv1_power"))));
    expect(missing.map((m) => m.entity).sort()).toEqual(["light.kitchen_ceiling", "sensor.pv1_power"]);
    expect(missing.find((m) => m.entity === "sensor.pv1_power")!.uses.map((u) => u.label)).toEqual(["Solar panels' sensor", "Energy: solar"]);
  });
});

describe("changing a link everywhere", () => {
  it("changes every field naming it, and moves its registry ids along", () => {
    const p = plan({ "sensor.pv1_power": { id: "abc", device_id: "fox" } });
    replaceEntity(p, "sensor.pv1_power", "sensor.solar_string_1");
    expect(p.settings.energy?.solar).toEqual(["sensor.solar_string_1", "sensor.pv2_power"]);
    expect(p.floors[0].roofs![0].items![0].entity).toBe("sensor.solar_string_1");
    expect(p.links).toEqual({ "sensor.solar_string_1": { id: "abc", device_id: "fox" } });
  });

  it("unlinks: a device marker goes, a field is cleared, a person keeps the rest", () => {
    const p = plan();
    for (const id of ["light.kitchen_ceiling", "binary_sensor.front_door", "sensor.pv1_power", "sensor.grid_power", "device_tracker.car", "sensor.kadirs_phone_area"]) replaceEntity(p, id, null);
    const f = p.floors[0];
    expect(f.devices.map((d) => d.id)).toEqual(["d2"]);
    expect(f.openings[0].entity).toBeNull();
    expect(p.settings.energy).toEqual({ solar: ["sensor.pv2_power"], ev_charger: "sensor.ohme_power" });
    expect(f.furniture.find((x) => x.id === "car")!.parked).toBeUndefined();
    expect(f.furniture.find((x) => x.id === "car2")!.parked).toBe("plugged");
    expect(p.settings.presence?.people).toEqual({});
  });

  it("moves a person's tracker along with the person", () => {
    const p = plan();
    replaceEntity(p, "person.kadir", "person.kadir_eker");
    expect(p.settings.presence?.people).toEqual({ "person.kadir_eker": "sensor.kadirs_phone_area" });
  });
});

describe("keeping registry ids", () => {
  it("keeps each linked entity's registry id and device, and drops what is no longer linked", () => {
    const h = hassOf({ ...ALL, "light.kitchen_ceiling": { device: "hue" } });
    const p = plan({ "light.unlinked": { id: "old" } });
    expect(recordLinks(p, h, regOf(h, { "light.kitchen_ceiling": "r-ceiling" }))).toBe(true);
    expect(p.links?.["light.kitchen_ceiling"]).toEqual({ id: "r-ceiling", device_id: "hue" });
    expect(p.links?.["light.unlinked"]).toBeUndefined();
    expect(Object.keys(p.links!)).toHaveLength(15);
    expect(recordLinks(p, h, regOf(h, { "light.kitchen_ceiling": "r-ceiling" }))).toBe(false);
  });

  it("keeps what it knew of a missing entity, and of all when the registry can't be read", () => {
    const h = hassOf({ ...ALL });
    const p = plan({ "light.kitchen_ceiling": { id: "r-ceiling", device_id: "hue" }, "light.hall": { id: "r-hall" } });
    recordLinks(p, h, null);
    expect(p.links?.["light.kitchen_ceiling"]).toEqual({ id: "r-ceiling", device_id: "hue" });
    expect(p.links?.["light.hall"]).toEqual({ id: "r-hall" });
  });

  it("goes through normalizePlan: old plans have none, bad entries are dropped", () => {
    expect(normalizePlan({ version: 1, floors: [] }).links).toBeUndefined();
    expect(normalizePlan({ version: 1, floors: [], links: { "light.a": { id: "x", device_id: 3 }, "light.b": "y", "light.c": {} } }).links).toEqual({ "light.a": { id: "x" } });
  });
});

describe("finding what replaced a missing entity", () => {
  const missing = (p: Plan, h: Hass, id: string) => missingLinks(p, h).find((m) => m.entity === id)!;

  it("renamed: follows the registry id, and changes the plan", () => {
    const h = hassOf({ ...ALL, "light.kitchen_main": { device: "hue", area: "kitchen" } });
    const reg = regOf(h, { "light.kitchen_main": "r-ceiling" });
    const p = plan({ "light.kitchen_ceiling": { id: "r-ceiling", device_id: "hue" } });
    expect(proposeFor(missing(p, h, "light.kitchen_ceiling"), p, h, reg)).toEqual({ entity: "light.kitchen_main", score: 1, why: "renamed" });
    expect(followRenames(p, h, reg)).toEqual([["light.kitchen_ceiling", "light.kitchen_main"]]);
    expect(p.floors[0].devices[0].entity).toBe("light.kitchen_main");
    expect(p.links).toEqual({ "light.kitchen_main": { id: "r-ceiling", device_id: "hue" } });
    expect(missingLinks(p, h)).toEqual([]);
  });

  it("renamed by its integration on the same device: proposed, not followed", () => {
    const h = hassOf({ ...ALL, "light.kitchen_ceiling_light": { device: "hue" }, "light.kitchen_ceiling_nightlight": { device: "hue", category: "config" } });
    const p = plan({ "light.kitchen_ceiling": { id: "r-gone", device_id: "hue" } });
    const reg = regOf(h, {});
    expect(proposeFor(missing(p, h, "light.kitchen_ceiling"), p, h, reg)).toMatchObject({ entity: "light.kitchen_ceiling_light", why: "same device" });
    expect(followRenames(p, h, reg)).toEqual([]);
  });

  it("re-paired: a new device with the same name in the same area", () => {
    const h = hassOf({ ...ALL, "light.kitchen_ceiling_2": { device: "z2m", area: "kitchen", name: "Kitchen ceiling" }, "light.kitchen_spots": { area: "kitchen" } });
    const p = plan({ "light.kitchen_ceiling": { id: "r-gone", device_id: "hue" } });
    const got = proposeFor(missing(p, h, "light.kitchen_ceiling"), p, h, regOf(h, {}));
    expect(got).toMatchObject({ entity: "light.kitchen_ceiling_2", why: "same area" });
    expect(got!.score).toBeLessThan(0.6);
  });

  it("replaced: another make named like the old one, in its room", () => {
    // no registry ids kept (a plan saved before they were): the room's area still tells
    const h = hassOf({ ...ALL, "light.tradfri_bulb": { device: "ikea", name: "Kitchen ceiling" }, "light.hall_lamp": { area: "hall", name: "Kitchen ceiling" } });
    const p = plan();
    expect(proposeFor(missing(p, h, "light.kitchen_ceiling"), p, h, null)).toMatchObject({ entity: "light.tradfri_bulb", why: "same area" });
  });

  it("ranks a renamed entity over the same device over the same area", () => {
    const h = hassOf({
      ...ALL,
      "light.kitchen_ceiling_2": { device: "z2m", area: "kitchen" },
      "light.kitchen_ceiling_light": { device: "hue" },
      "light.renamed": { device: "hue" },
    });
    const p = plan({ "light.kitchen_ceiling": { id: "r-ceiling", device_id: "hue" } });
    const m = missing(p, h, "light.kitchen_ceiling");
    expect(proposeFor(m, p, h, regOf(h, { "light.renamed": "r-ceiling" }))!.why).toBe("renamed");
    expect(proposeFor(m, p, h, regOf(h, {}))!.entity).toBe("light.kitchen_ceiling_light");
    delete h.states["light.kitchen_ceiling_light"];
    delete h.states["light.renamed"];
    expect(proposeFor(m, p, h, regOf(h, {}))!.entity).toBe("light.kitchen_ceiling_2");
  });

  it("no good match: nothing alike, other kinds, or already linked elsewhere", () => {
    const h = hassOf({ ...ALL, "light.garage_strip": { area: "kitchen" }, "switch.kitchen_ceiling": { area: "kitchen" }, "sensor.kitchen_ceiling_power": { device: "hue" } });
    const p = plan();
    expect(proposeFor(missing(p, h, "light.kitchen_ceiling"), p, h, regOf(h, {}))).toBeNull();
    // light.hall is linked already: not a replacement for another light
    const h2 = hassOf({ ...ALL });
    delete h2.states["light.hall"];
    delete h2.entities!["light.hall"];
    expect(proposeFor(missing(p, h2, "light.hall"), p, h2, null)).toBeNull();
  });

  it("alike names", () => {
    expect(nameLikeness(["kitchen", "ceiling"], ["kitchen", "ceiling"])).toBe(1);
    expect(nameLikeness(["hall", "motion"], ["hallway", "motion"])).toBeGreaterThan(0.8);
    expect(nameLikeness(["pv1", "power"], ["pv2", "power"])).toBe(0.5);
    expect(nameLikeness(["garage"], ["kitchen"])).toBe(0);
  });
});
