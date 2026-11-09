import { describe, expect, it } from "vitest";
import { find, findIndex, norm, type Found } from "../src/ui/find";
import { demoHass } from "../src/demo/hass";
import { DEMO_PLAN } from "../src/demo/plan";
import { normalizePlan, type Plan } from "../src/model/plan";
import type { Hass, HassEntity } from "../src/live/hass";

const plan = normalizePlan(structuredClone(DEMO_PLAN));
const hass = demoHass(plan, () => undefined, { night: true });
hass.stop();
const index = findIndex(plan, hass, { "light.living_room_floor_lamp": ["Reading lamp"] });
const names = (q: string, n = 5) => find(index, q).slice(0, n).map((x) => x.name);
const first = (q: string): Found => find(index, q)[0];

describe("finding by name", () => {
  it("makes names comparable: lower case, no accents, ids' dots and underscores as spaces", () => {
    expect(norm("Café Lounge")).toBe("cafe lounge");
    expect(norm("binary_sensor.front_door")).toBe("binary sensor front door");
    expect(norm("Alex's  phone")).toBe("alexs phone");
    expect(norm("Küche – Decke")).toBe("kuche decke");
    expect(norm("寝室")).toBe("寝室");
  });

  it("puts the room first for its name, before what is in it", () => {
    expect(first("kitchen")).toMatchObject({ kind: "room", name: "Kitchen", floor: 0, room: 0 });
    expect(first("bedroom 1")).toMatchObject({ kind: "room", name: "Bedroom 1", floor: 1, room: 4 });
    expect(first("deck")).toMatchObject({ kind: "garden", name: "Deck" });
  });

  it("finds devices by their names, ids, aliases and their rooms' names", () => {
    expect(first("front door")).toMatchObject({ kind: "device", where: "Hallway", floor: 0, room: 3 });
    expect(find(index, "front door").map((x) => x.entity)).toEqual(expect.arrayContaining(["binary_sensor.front_door", "lock.front_door"]));
    expect(first("reading")).toMatchObject({ entity: "light.living_room_floor_lamp", where: "Living Room" });
    expect(first("light.bedside_l")).toMatchObject({ entity: "light.bedside_left", floor: 1, room: 4 });
    // all the words, each at the start of a word somewhere
    expect(names("living lamp", 3)).toContain("Living room floor lamp");
    expect(find(index, "itchen")).toEqual([]);
    expect(find(index, "kitchen zebra")).toEqual([]);
    expect(find(index, "  ")).toEqual([]);
  });

  it("finds rooms by their area's name and aliases", () => {
    // the Landing is linked to the area with the Entrance alias, as the Hallway is
    expect(find(index, "entrance").slice(0, 2).map((x) => x.name).sort()).toEqual(["Hallway", "Landing"]);
  });

  it("finds furniture once for each room, and scenes in the room whose sheet has them", () => {
    expect(first("sofa")).toMatchObject({ kind: "furniture", name: "Sofa", where: "Living Room" });
    expect(first("movie")).toMatchObject({ kind: "scene", entity: "scene.movie_night", floor: 0, room: 2 });
    // Goodnight is in no area, and picked for the main bedroom
    expect(first("goodnight")).toMatchObject({ kind: "script", where: "Bedroom 1", floor: 1, room: 4 });
    // the downlights of a room, or its dining chairs, are one each
    const pieces = index.filter((x) => x.kind === "furniture").map((x) => `${x.name}|${x.floor}|${x.room}`);
    expect(new Set(pieces).size).toBe(pieces.length);
  });

  it("knows where to point each thing out", () => {
    expect(first("bedside left").spot).toMatchObject({ x: 3.25, z: 6.95 });
    expect(first("doorbell camera").spot?.device?.entity).toBe("camera.doorbell");
    expect(first("front door").spot?.y).toBeGreaterThan(0.5);
    expect(first("kitchen").spot).toBeUndefined();
  });

  it("finds a scene in no room, to open its dialog", () => {
    const h = { ...hass, states: { ...hass.states, "scene.party": { entity_id: "scene.party", state: "", attributes: { friendly_name: "Party" }, last_changed: "", last_updated: "" } } };
    expect(find(findIndex(plan, h), "party")[0]).toMatchObject({ kind: "scene", floor: -1, room: -1, where: "" });
  });
});

describe("speed", () => {
  /** A home of 20 rooms and 500 devices, 25 to a room, each on the plan. */
  function bigHome(): { plan: Plan; hass: Hass } {
    const states: Record<string, HassEntity> = {};
    const entities: NonNullable<Hass["entities"]> = {};
    const areas: NonNullable<Hass["areas"]> = {};
    const rooms = Array.from({ length: 20 }, (_, i) => ({ id: `r${i}`, name: `Room ${i}`, area_id: `area_${i}`, points: [[i * 4, 0], [i * 4 + 4, 0], [i * 4 + 4, 4], [i * 4, 4]] as [number, number][] }));
    const devices = [];
    const kinds = ["light", "switch", "sensor", "binary_sensor", "cover"];
    for (let i = 0; i < 500; i++) {
      const r = i % 20;
      const id = `${kinds[i % 5]}.device_${i}_in_room_${r}`;
      states[id] = { entity_id: id, state: "on", attributes: { friendly_name: `Device ${i} lamp ${r}` }, last_changed: "", last_updated: "" };
      entities[id] = { entity_id: id, area_id: `area_${r}` };
      devices.push({ id: `d${i}`, entity: id, x: r * 4 + 1 + (i % 3), z: 1 + (i % 2) });
      areas[`area_${r}`] = { area_id: `area_${r}`, name: `Area ${r}`, aliases: [`Alias ${r}`] };
    }
    const p = normalizePlan({ version: 1, floors: [{ id: "g", name: "Ground", elevation: 0, height: 2.6, rooms, devices }] });
    return { plan: p, hass: { states, entities, areas } as unknown as Hass };
  }

  it("finds among 500 entities in well under 50 ms", () => {
    const big = bigHome();
    const t0 = performance.now();
    const idx = findIndex(big.plan, big.hass);
    const built = performance.now() - t0;
    expect(idx.filter((x) => x.kind === "device")).toHaveLength(500);
    let best = Infinity;
    for (let run = 0; run < 5; run++) {
      const t1 = performance.now();
      for (const q of ["lamp", "room 7", "device 42", "alias 3", "light device", "zzz"]) find(idx, q);
      best = Math.min(best, (performance.now() - t1) / 6);
    }
    expect(find(idx, "device 42 lamp")[0].name).toBe("Device 42 lamp 2");
    console.info(`search: index of ${idx.length} built in ${built.toFixed(1)} ms, a query in ${best.toFixed(2)} ms`);
    expect(best).toBeLessThan(50);
    expect(built).toBeLessThan(250);
  });
});
