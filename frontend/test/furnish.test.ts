import { describe, expect, it } from "vitest";
import { fitRange, STARTERS, starterPlan } from "../src/starters/houses";
import { pointInPolygon } from "../src/model/geom";
import type { Floor, Furniture, Plan, Vec2 } from "../src/model/plan";

/** Each house type as drawn, mirrored, as small as it goes (or 0.8×) and at 1.4×. */
function variants(): { name: string; plan: Plan; drawn: boolean }[] {
  return STARTERS.flatMap((s) => {
    const own = fitRange(s.plan())!;
    const small = { width: Math.max(own.minWidth, own.width * 0.8), depth: Math.max(own.minDepth, own.depth * 0.8) };
    const big = { width: own.width * 1.4, depth: own.depth * 1.4 };
    return [
      { name: s.id, plan: starterPlan(s.id), drawn: true },
      { name: `${s.id} mirrored`, plan: starterPlan(s.id, { mirror: true }), drawn: true },
      { name: `${s.id} small`, plan: starterPlan(s.id, small), drawn: false },
      { name: `${s.id} big, mirrored`, plan: starterPlan(s.id, { ...big, mirror: true }), drawn: false },
    ];
  });
}

interface Rect { x0: number; z0: number; x1: number; z1: number }
const rect = (f: Furniture): Rect => {
  const turned = Math.round(f.rotation / 90) % 2 !== 0;
  const w = turned ? f.d : f.w, d = turned ? f.w : f.d;
  return { x0: f.x - w / 2, x1: f.x + w / 2, z0: f.z - d / 2, z1: f.z + d / 2 };
};
const overlap = (a: Rect, b: Rect) => a.x0 < b.x1 - 0.011 && b.x0 < a.x1 - 0.011 && a.z0 < b.z1 - 0.011 && b.z0 < a.z1 - 0.011;
const pieces = (f: Floor) => f.furniture.filter((x) => x.type !== "stairs");
const roomOf = (f: Floor, x: Furniture) => f.rooms.find((r) => pointInPolygon([x.x, x.z], r.points));

describe("furnished house types", () => {
  const all = variants();

  it("stand every piece inside a room, clear of its walls", () => {
    const bad: string[] = [];
    for (const { name, plan } of all) for (const f of plan.floors) for (const x of pieces(f)) {
      const r = rect(x);
      const room = roomOf(f, x);
      const corners: Vec2[] = [[r.x0 + 0.03, r.z0 + 0.03], [r.x1 - 0.03, r.z0 + 0.03], [r.x1 - 0.03, r.z1 - 0.03], [r.x0 + 0.03, r.z1 - 0.03]];
      if (!room || (x.type !== "rug" && !corners.every((p) => pointInPolygon(p, room.points)))) bad.push(`${name}: ${x.type} at ${x.x}, ${x.z}`);
    }
    expect(bad).toEqual([]);
  });

  it("stand no piece in another (a rug lies under what stands on it)", () => {
    const bad: string[] = [];
    for (const { name, plan } of all) for (const f of plan.floors) {
      const solid = f.furniture.filter((x) => x.type !== "rug");
      solid.forEach((a, i) => solid.slice(i + 1).forEach((b) => {
        if (overlap(rect(a), rect(b))) bad.push(`${name}: ${a.type} in ${b.type}`);
      }));
    }
    expect(bad).toEqual([]);
  });

  it("leave every door and doorway clear on both sides", () => {
    const bad: string[] = [];
    for (const { name, plan } of all) for (const f of plan.floors) for (const o of f.openings) {
      if (o.kind === "window") continue;
      const r = f.rooms.find((q) => q.id === o.room_id)!;
      const a = r.points[o.edge], b = r.points[(o.edge + 1) % r.points.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
      const mx = a[0] + ux * o.offset, mz = a[1] + uz * o.offset;
      // the doorway and 60 cm of floor either side of the wall
      const hw = o.width / 2, zone: Rect = Math.abs(ux) > 0.5
        ? { x0: mx - hw, x1: mx + hw, z0: mz - 0.6, z1: mz + 0.6 } : { x0: mx - 0.6, x1: mx + 0.6, z0: mz - hw, z1: mz + hw };
      for (const x of pieces(f)) if (x.type !== "rug" && overlap(rect(x), zone)) bad.push(`${name}: ${x.type} in the way of a door of ${r.name}`);
    }
    expect(bad).toEqual([]);
  });

  it("put nothing tall in front of a window", () => {
    const tall = new Set(["wardrobe", "fridge", "bookcase", "shower", "tv_board"]);
    const bad: string[] = [];
    for (const { name, plan } of all) for (const f of plan.floors) for (const o of f.openings) {
      if (o.kind !== "window") continue;
      const r = f.rooms.find((q) => q.id === o.room_id)!;
      const a = r.points[o.edge], b = r.points[(o.edge + 1) % r.points.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
      const mx = a[0] + ux * o.offset, mz = a[1] + uz * o.offset;
      const hw = o.width / 2 - 0.05, zone: Rect = Math.abs(ux) > 0.5
        ? { x0: mx - hw, x1: mx + hw, z0: mz - 0.5, z1: mz + 0.5 } : { x0: mx - 0.5, x1: mx + 0.5, z0: mz - hw, z1: mz + hw };
      for (const x of pieces(f)) if (tall.has(x.type) && overlap(rect(x), zone)) bad.push(`${name}: ${x.type} over a window of ${r.name}`);
    }
    expect(bad).toEqual([]);
  });

  it("give each home as drawn somewhere to sit, sleep, cook and wash", () => {
    for (const { name, plan, drawn } of all) {
      if (!drawn) continue;
      const types = plan.floors.flatMap((f) => pieces(f).map((x) => x.type));
      const count = (re: RegExp) => types.filter((t) => re.test(t)).length;
      const bedrooms = plan.floors.flatMap((f) => f.rooms).filter((r) => /bedroom/i.test(r.name)).length;
      expect(count(/^sofa/), `${name}: a sofa`).toBeGreaterThanOrEqual(1);
      expect(count(/^tv_board$/), `${name}: a TV`).toBeGreaterThanOrEqual(1);
      expect(count(/^bed/), `${name}: a bed in each bedroom`).toBe(bedrooms);
      expect(count(/^wardrobe$/), `${name}: a wardrobe`).toBeGreaterThanOrEqual(1);
      expect(count(/^(kitchen|fridge|stove|sink)$/), `${name}: kitchen units`).toBeGreaterThanOrEqual(2);
      expect(count(/^stove$/), `${name}: a cooker`).toBe(1);
      expect(count(/^sink$/), `${name}: a sink`).toBe(1);
      expect(count(/^wc$/), `${name}: a toilet`).toBeGreaterThanOrEqual(1);
      expect(count(/^(bathtub|shower)$/), `${name}: a bath or shower`).toBeGreaterThanOrEqual(1);
      expect(count(/^table$/), `${name}: a table to eat at`).toBeGreaterThanOrEqual(1);
    }
  });

  it("leaves the rooms bare when asked to", () => {
    for (const s of STARTERS) expect(starterPlan(s.id, {}, false).floors.flatMap((f) => pieces(f))).toEqual([]);
  });
});
