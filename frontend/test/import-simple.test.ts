import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildPlan } from "../src/import/draft";
import { importSimple, isSimplePlan } from "../src/import/simple";
import { area } from "../src/model/geom";
import { normalizePlan, type Floor, type Vec2 } from "../src/model/plan";
import { layoutWalls } from "../src/model/walls";

const fixture = (name: string): unknown => JSON.parse(readFileSync(new URL(`./fixtures/import/${name}`, import.meta.url), "utf8"));
const room = (f: Floor, name: string) => f.rooms.find((r) => r.name === name)!;
/** Where an opening's middle is on the plan. */
const at = (f: Floor, id: string): Vec2 => {
  const o = f.openings.find((x) => x.id === id)!;
  const r = f.rooms.find((x) => x.id === o.room_id)!;
  const a = r.points[o.edge], b = r.points[(o.edge + 1) % r.points.length];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [a[0] + ((b[0] - a[0]) * o.offset) / l, a[1] + ((b[1] - a[1]) * o.offset) / l];
};
const within = (v: number, want: number, frac = 0.02) => expect(Math.abs(v - want)).toBeLessThanOrEqual(want * frac);

describe("simple plan format", () => {
  it("is recognised, and VirtuHome plan files and scans are not", () => {
    expect(isSimplePlan(fixture("simple.json"))).toBe(true);
    expect(isSimplePlan(fixture("neonplan.json"))).toBe(true);
    expect(isSimplePlan({ rooms: [{ points: [[0, 0], [1, 0], [1, 1]] }] })).toBe(true);
    expect(isSimplePlan({ format: "something-else", floors: [] })).toBe(false);
    expect(isSimplePlan({ version: 1, settings: {}, floors: [{ rooms: [{ points: [[0, 0], [1, 0], [1, 1]] }] }] })).toBe(false);
    expect(isSimplePlan({ walls: [{ dimensions: [1, 2, 0], transform: [] }] })).toBe(false);
  });

  it("moves rooms drawn on the inner faces onto the middle of the walls, in centimetres", () => {
    const { plan, summary } = buildPlan(importSimple(fixture("simple.json")));
    const f = plan.floors[0];
    expect(summary.floors).toBe(1);
    expect(summary.rooms).toBe(5);
    within(area(room(f, "Living room").points), 27);
    within(area(room(f, "Kitchen").points), 18);
    within(area(room(f, "Bedroom").points), 14);
    within(area(room(f, "Bathroom").points), 8.75);
    // the unnamed hall (its first corner repeated at the end) gets a name
    within(area(room(f, "Room 5").points), 12.25);
    expect(room(f, "Room 5").points).toHaveLength(4);
    // neighbours share their edge exactly: the living room's bottom right corner is the kitchen's bottom left
    expect(room(f, "Living room").points).toContainEqual([6, 4.5]);
    expect(room(f, "Kitchen").points).toContainEqual([6, 4.5]);
    expect(plan.settings.wall_exterior).toBe(0.3);
    expect(plan.settings.wall_interior).toBe(0.1);
    expect(plan.settings.north).toBe(15);
    expect(f.height).toBe(2.5);
    expect(f.walls).toEqual([expect.objectContaining({ a: [9, 4.55], b: [9, 6], thickness: 0.1 })]);
  });

  it("puts doors and windows on their room edges", () => {
    const { plan, summary } = buildPlan(importSimple(fixture("simple.json")));
    const f = plan.floors[0];
    expect(summary.doors).toBe(6);
    expect(summary.windows).toBe(4);
    expect(layoutWalls(f, plan.settings).orphans).toEqual([]);
    const front = f.openings.find((o) => o.width === 1)!;
    expect(front.room_id).toBe(room(f, "Room 5").id);
    expect(at(f, front.id)[0]).toBeCloseTo(8.2);
    expect(at(f, front.id)[1]).toBeCloseTo(8);
    expect(front.height).toBe(2.1);
    expect(f.openings.filter((o) => o.kind === "passage")).toHaveLength(1);
    expect(f.openings.find((o) => o.style === "french")).toMatchObject({ kind: "door", width: 1.6, sill: 0 });
    const high = f.openings.find((o) => o.kind === "window" && o.width === 0.6)!;
    expect(high).toMatchObject({ sill: 1.5, height: 0.6, room_id: room(f, "Bathroom").id });
  });

  it("maps furniture by type and name, and brings unknown pieces in as boxes", () => {
    const { plan, summary } = buildPlan(importSimple(fixture("simple.json")));
    const types = plan.floors[0].furniture.map((x) => x.type);
    expect(types).toEqual(["sofa", "table", "bed", "fridge", "wc", "lamp_ceiling", "kitchen_wall", "column", "column"]);
    expect(summary.boxes).toEqual(["Ironing board", "ac_unit"]);
    const [sofa, table, , fridge, wc, lamp, wall, board] = plan.floors[0].furniture;
    expect(sofa).toMatchObject({ x: 3, z: 3.9, rotation: 180, w: 2, d: 0.9 });
    expect(table).toMatchObject({ w: 1.6, d: 0.9, h: 0.75 });
    expect(fridge.h).toBe(1.8);
    expect(wc.rotation).toBe(270);
    expect(lamp.y).toBeUndefined();
    expect(wall.y).toBe(1.45);
    expect(board).toMatchObject({ w: 1.2, d: 0.35, h: 0.9 });
  });

  it("reads NeonPlan's import format: storeys, metres, furniture names in other languages", () => {
    const { plan, summary } = buildPlan(importSimple(fixture("neonplan.json")));
    expect(plan.floors.map((f) => [f.name, f.elevation, f.height])).toEqual([["Ground floor", 0, 2.5], ["First floor", 2.7, 2.4]]);
    expect(summary).toMatchObject({ rooms: 4, doors: 3, windows: 2, furniture: 5, boxes: [] });
    expect(summary.left).toEqual(["A window at 12.0, 12.0 is on no room edge"]);
    within(area(room(plan.floors[0], "Living room").points), 20);
    expect(plan.floors[0].furniture.map((x) => x.type)).toEqual(["sofa", "stool_bar", "kitchen_wall"]);
    expect(plan.floors[1].furniture.map((x) => x.type)).toEqual(["bed", "bathtub"]);
    expect(plan.settings.north).toBe(0);
    expect(summary.north).toBeNull();
  });

  it("imports the example in docs/import-format.md", () => {
    const doc = readFileSync(new URL("../../docs/import-format.md", import.meta.url), "utf8");
    const example = JSON.parse(doc.split("```json")[1].split("```")[0]);
    const { plan, summary } = buildPlan(importSimple(example));
    expect(summary).toMatchObject({ floors: 1, rooms: 2, doors: 2, windows: 1, furniture: 2, boxes: [], left: [] });
    expect(plan.floors[0].furniture.map((x) => x.type)).toEqual(["sofa", "table"]);
  });

  it("gives back a plan that normalizePlan leaves as it is", () => {
    for (const file of ["simple.json", "neonplan.json"]) {
      const { plan } = buildPlan(importSimple(fixture(file)));
      expect(normalizePlan(structuredClone(plan))).toEqual(plan);
    }
  });

  it("says what is wrong with a file it can't read", () => {
    expect(() => importSimple({ units: "ft", rooms: [] })).toThrow(/units/);
    expect(() => importSimple({ units: "constructor", rooms: [] })).toThrow(/units/);
    const odd = importSimple({ rooms: [], doors: [{ at: [0, 0], style: "toString" }] });
    expect(odd.floors[0].openings[0].style).toBeUndefined();
    expect(() => importSimple({ floors: [] })).toThrow(/no floors/);
    const { summary } = buildPlan(importSimple({ rooms: [{ name: "Line", points: [[0, 0], [1, 0]] }] }));
    expect(summary.left).toEqual(["Line: too few corners"]);
  });
});
