import { describe, expect, it } from "vitest";
import {
  checkAreas, checkCard, checkCounts, checkExtensions, checkGraphics, checkLinks, checkRepairs, checkRooms, runChecks, type ServerChecks,
} from "../src/ui/checks";
import { normalizePlan, type Plan, type Repair } from "../src/model/plan";
import type { Hass } from "../src/live/hass";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** A kitchen linked to its area, a study linked to none, and a hall linked to an area that is gone. */
const plan = (): Plan => normalizePlan({
  version: 1,
  floors: [{
    id: "g", name: "Ground", elevation: 0, height: 2.6, walls: [], openings: [], furniture: [],
    rooms: [
      { id: "k", name: "Kitchen", area_id: "kitchen", points: rect(0, 0, 4, 4) },
      { id: "s", name: "Study", area_id: null, points: rect(4, 0, 6, 4) },
    ],
    devices: [{ id: "d1", entity: "light.kitchen", x: 2, z: 2 }, { id: "d2", entity: "light.gone", x: 2, z: 3 }],
  }],
});

const hass = (): Hass => ({
  states: { "light.kitchen": { entity_id: "light.kitchen", state: "on", attributes: {}, last_changed: "", last_updated: "" } },
  entities: {
    "light.kitchen": { entity_id: "light.kitchen", area_id: "kitchen" },
    "sensor.loft_temperature": { entity_id: "sensor.loft_temperature", area_id: "loft" },
    "switch.attic_led": { entity_id: "switch.attic_led", area_id: "attic", entity_category: "config" },
  },
  devices: { gate: { id: "gate", area_id: "garden" } },
  areas: {
    kitchen: { area_id: "kitchen", name: "Kitchen" }, loft: { area_id: "loft", name: "Loft" }, attic: { area_id: "attic", name: "Attic" },
    garden: { area_id: "garden", name: "Garden" }, study: { area_id: "study", name: "Study" },
  },
} as unknown as Hass);

const SERVER: ServerChecks = { version: "0.10.0", dashboard: { mode: "storage", urls: ["/local/virtuhome/card-loader.js?v=0.10.0"], current: true }, licence: { status: "none", error: null, extensions: [] } };

describe("check my setup", () => {
  it("linked entities: missing ones are a problem to relink", () => {
    const c = checkLinks(plan(), hass());
    expect([c.level, c.count, c.fixes]).toEqual(["problem", 1, ["relink"]]);
    const p = plan();
    p.floors[0].devices.pop();
    expect(checkLinks(p, hass())).toMatchObject({ level: "ok", count: 0, fixes: [] });
  });

  it("rooms: unlinked ones are a note, linked by name when an area is named like them; a gone area is a problem", () => {
    const c = checkRooms(plan(), hass());
    expect([c.level, c.count, c.fixes]).toEqual(["note", 1, ["link-rooms", "open-rooms"]]);
    const p = plan();
    p.floors[0].rooms[1].area_id = "office";
    expect(checkRooms(p, hass())).toMatchObject({ level: "problem", count: 1, fixes: ["link-rooms", "open-rooms"] });
    p.floors[0].rooms[1].area_id = "study";
    expect(checkRooms(p, hass())).toMatchObject({ level: "ok", count: 0, fixes: [] });
  });

  it("areas: those with devices but no room, not counting hidden or config entities", () => {
    const c = checkAreas(plan(), hass());
    expect(c.areas!.sort()).toEqual(["garden", "loft"]);
    expect([c.level, c.count, c.fixes]).toEqual(["note", 2, ["add-rooms"]]);
    expect(c.text).toContain("Garden, Loft");
  });

  it("dashboard card: checking, unanswered, an old page, a missing or old resource, YAML", () => {
    expect(checkCard(undefined, "0.10.0")).toMatchObject({ level: "ok", text: "Checking…" });
    expect(checkCard(null, "0.10.0").level).toBe("note");
    expect(checkCard(SERVER, "0.10.0")).toMatchObject({ level: "ok", fixes: [] });
    expect(checkCard(SERVER, "0.9.0")).toMatchObject({ level: "problem", fixes: ["reload"] });
    expect(checkCard({ ...SERVER, dashboard: { mode: "storage", urls: [] } }, "0.10.0")).toMatchObject({ level: "problem", fixes: ["resource"] });
    expect(checkCard({ ...SERVER, dashboard: { mode: "storage", urls: ["x?v=0.9.0"], current: false } }, "0.10.0")).toMatchObject({ level: "problem", fixes: ["resource"] });
    expect(checkCard({ ...SERVER, dashboard: { mode: "yaml" } }, "0.10.0")).toMatchObject({ level: "note", fixes: [] });
  });

  it("graphics: stepped down by itself, or drawing in software", () => {
    const g = { tier: "medium" as const, auto: true, detected: "high" as const, cap: "medium" as const, software: false };
    expect(checkGraphics(g)).toMatchObject({ level: "note", count: 1, fixes: ["graphics"] });
    expect(checkGraphics({ ...g, cap: null })).toMatchObject({ level: "ok", text: "Automatic: Standard." });
    expect(checkGraphics({ ...g, auto: false })).toMatchObject({ level: "ok", text: "Picked on this device: Standard." });
    expect(checkGraphics({ ...g, tier: "low", detected: "low", cap: null, software: true })).toMatchObject({ level: "note", fixes: [] });
  });

  it("extensions: one needing a newer VirtuHome, a licence expired or unable to renew", () => {
    const active = { status: "active", error: null, extensions: [{ id: "wall_tablet", name: "Wall Tablet" }] };
    expect(checkExtensions(active, [])).toMatchObject({ level: "ok", text: "Licence active: Wall Tablet." });
    expect(checkExtensions(active, [{ name: "Wall Tablet", newer: true }])).toMatchObject({ level: "problem", fixes: [] });
    expect(checkExtensions({ ...active, status: "expired", error: "token expired" }, [])).toMatchObject({ level: "problem", fixes: ["renew"] });
    expect(checkExtensions({ ...active, error: "could not reach the licence server" }, [])).toMatchObject({ level: "note", fixes: ["renew"] });
    expect(checkExtensions(SERVER.licence, [])).toMatchObject({ level: "ok", count: 0 });
  });

  it("repairs: normalizePlan says what it put right, and returns the same plan", () => {
    const raw = {
      version: 1,
      links: { "light.a": { id: "x" }, "light.b": "broken" },
      floors: [{
        id: "g", name: "Ground", elevation: 0, height: 2.6, rooms: [], openings: [], devices: [], walls: [],
        furniture: [{ id: "c", type: "kitchen_wall", x: 1, z: 1, rotation: 0, w: 0.6, d: 0.35, h: 0.7, y: 0 }],
        fences: [{ id: "f", points: [[0, 0]], style: "closeboard", height: 1.8 }],
        outdoor: [{ id: "o", name: "Patio", kind: "patio", area_id: null, points: rect(0, 0, 2, 2), steps: [{ edge: 9 }] }],
        background: { file: "g.png", width: 0, height: 10, scale: 0.01 },
        roofs: [
          { id: "r1", x: 0, z: 0, w: 0.1, d: 3, rotation: 0, shape: "gable", pitch: 35, covering: "slate" },
          { id: "r2", x: 0, z: 0, w: 5, d: 3, rotation: 0, shape: "onion", pitch: 90, covering: "slate", items: [{ id: "s", kind: "solar", x: 0, z: 0, w: 1, d: 1, panel: [9, 9] }] },
        ],
      }],
    };
    const repairs: Repair[] = [];
    expect(normalizePlan(structuredClone(raw), repairs)).toEqual(normalizePlan(structuredClone(raw)));
    expect(repairs.sort()).toEqual(["background", "fence", "height", "link", "panel", "roof", "shape", "slope", "steps"]);
    const c = checkRepairs(repairs);
    expect([c.level, c.count, c.fixes]).toEqual(["note", 9, ["save"]]);
    expect(c.text).toContain("left out 1 fence with fewer than two corners");
    expect(checkRepairs([])).toMatchObject({ level: "ok", count: 0 });
    const clean: Repair[] = [];
    normalizePlan(normalizePlan(raw), clean);
    expect(clean).toEqual([]);
  });

  it("changes nothing, and reports only counts under the ids the integration knows", () => {
    const p = plan();
    const before = JSON.stringify(p);
    const checks = runChecks({
      plan: p, hass: hass(), repairs: [], server: SERVER, version: "0.10.0", extensions: [],
      graphics: { tier: "high", auto: true, detected: "high", cap: null, software: false },
    });
    expect(JSON.stringify(p)).toBe(before);
    const counts = checkCounts(checks);
    expect(Object.values(counts).every((n) => typeof n === "number")).toBe(true);
    // the same ids as CHECK_IDS in custom_components/virtuhome/report.py (tests/test_report.py checks that side)
    expect(Object.keys(counts)).toEqual(["links", "rooms", "areas", "card", "graphics", "extensions", "repairs"]);
  });
});
