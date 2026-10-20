import { describe, expect, it } from "vitest";
import { fitRange, STARTERS, starterPlan } from "../src/starters/houses";
import { fitLengths } from "../src/model/fit";
import { normalizePlan, type Plan, type Vec2 } from "../src/model/plan";
import { pointInPolygon } from "../src/model/geom";
import { layoutWalls, openingPoint } from "../src/model/walls";
import { autoPlace } from "../src/auto/placement";
import type { Hass } from "../src/live/hass";

/** Each house type as drawn, mirrored, as small as it goes (or 0.8×) and at 1.3×. */
function variants(): { name: string; plan: Plan }[] {
  return STARTERS.flatMap((s) => {
    const own = fitRange(s.plan())!;
    const small = { width: Math.max(own.minWidth, own.width * 0.8), depth: Math.max(own.minDepth, own.depth * 0.8) };
    const big = { width: own.width * 1.3, depth: own.depth * 1.3 };
    return [
      { name: `${s.id}`, plan: starterPlan(s.id) },
      { name: `${s.id} mirrored`, plan: starterPlan(s.id, { mirror: true }) },
      { name: `${s.id} small`, plan: starterPlan(s.id, small) },
      { name: `${s.id} big, mirrored`, plan: starterPlan(s.id, { ...big, mirror: true }) },
    ];
  });
}

const near = (a: Vec2, b: Vec2, tol = 0.002) => Math.abs(a[0] - b[0]) < tol && Math.abs(a[1] - b[1]) < tol;

describe("house types", () => {
  const all = variants();

  it("load through normalizePlan unchanged", () => {
    for (const { plan } of all) expect(normalizePlan(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
  });

  it("have every door and window on a wall of its room, clear of the walls at its ends", () => {
    const bad: string[] = [];
    for (const { name, plan } of all) {
      plan.floors.forEach((f) => {
        for (const o of f.openings) {
          const r = f.rooms.find((x) => x.id === o.room_id);
          const a = r?.points[o.edge], b = r && r.points[(o.edge + 1) % r.points.length];
          const len = a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) : 0;
          if (!a || o.offset - o.width / 2 < 0 || o.offset + o.width / 2 > len) bad.push(`${name}: ${r?.name} edge ${o.edge}`);
        }
        const { walls, orphans } = layoutWalls(f, plan.settings);
        for (const o of orphans) bad.push(`${name}: ${o.kind} off its wall`);
        for (const w of walls) {
          // the walls meeting this one's ends, which a door must clear
          const end = (p: Vec2) => Math.max(0, ...walls.filter((x) => x !== w && Math.abs(x.dir[0] * w.normal[0] + x.dir[1] * w.normal[1]) > 0.2)
            .filter((x) => {
              const rel: Vec2 = [p[0] - x.a[0], p[1] - x.a[1]];
              const t = rel[0] * x.dir[0] + rel[1] * x.dir[1];
              return t > -0.02 && t < x.length + 0.02 && Math.abs(rel[0] * x.normal[0] + rel[1] * x.normal[1]) < 0.02;
            }).map((x) => x.thickness / 2));
          w.openings.forEach((po, i) => {
            const at = openingPoint(f, po.opening)!;
            if (!near(at, po.centre)) bad.push(`${name}: ${po.opening.kind} pushed along its wall`);
            if (i === 0 && po.t0 < end(w.a) + 0.04) bad.push(`${name}: ${po.opening.kind} into the wall at its start (${po.t0.toFixed(2)})`);
            if (i === w.openings.length - 1 && w.length - po.t1 < end(w.b) + 0.04) bad.push(`${name}: ${po.opening.kind} into the wall at its end`);
            if (i > 0 && po.t0 < w.openings[i - 1].t1 + 0.05) bad.push(`${name}: two openings overlap`);
          });
        }
      });
    }
    expect(bad).toEqual([]);
  });

  it("keep doors and windows at their size when fitted", () => {
    for (const s of STARTERS) {
      const widths = (p: Plan) => p.floors.flatMap((f) => f.openings.map((o) => [o.width, o.height, o.sill]));
      const own = widths(starterPlan(s.id));
      const own2 = fitRange(s.plan())!;
      expect(widths(starterPlan(s.id, { width: own2.width * 0.9, depth: own2.depth * 1.2, mirror: true }))).toEqual(own);
    }
  });

  it("fit the size asked for", () => {
    for (const s of STARTERS) {
      const own = fitRange(s.plan())!;
      for (const k of [0.85, 1, 1.3]) {
        const width = Math.max(own.minWidth, own.width * k), depth = Math.max(own.minDepth, own.depth * k);
        const got = fitRange(starterPlan(s.id, { width, depth, mirror: k === 1 }))!;
        expect(got.width).toBeCloseTo(width, 2);
        expect(got.depth).toBeCloseTo(depth, 2);
      }
    }
  });

  it("have stairs clear of the walls, coming up into a landing", () => {
    const bad: string[] = [];
    for (const { name, plan } of all) {
      plan.floors.forEach((f, fi) => {
        const walls = layoutWalls(f, plan.settings).walls;
        for (const x of f.furniture.filter((y) => y.type === "stairs")) {
          const r = (x.rotation * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
          const at = (lx: number, lz: number): Vec2 => [x.x + c * lx - s * lz, x.z + s * lx + c * lz];
          // every wall's footprint stays out of the stairs'
          const xs = [at(-x.w / 2, -x.d / 2), at(x.w / 2, x.d / 2)];
          const [x0, x1] = [Math.min(xs[0][0], xs[1][0]), Math.max(xs[0][0], xs[1][0])];
          const [z0, z1] = [Math.min(xs[0][1], xs[1][1]), Math.max(xs[0][1], xs[1][1])];
          for (const w of walls) {
            const h = w.thickness / 2;
            const wx0 = Math.min(w.a[0], w.b[0]) - (w.dir[0] ? 0 : h), wx1 = Math.max(w.a[0], w.b[0]) + (w.dir[0] ? 0 : h);
            const wz0 = Math.min(w.a[1], w.b[1]) - (w.dir[1] ? 0 : h), wz1 = Math.max(w.a[1], w.b[1]) + (w.dir[1] ? 0 : h);
            if (Math.min(x1, wx1) - Math.max(x0, wx0) > 0.001 && Math.min(z1, wz1) - Math.max(z0, wz0) > 0.001) bad.push(`${name}: stairs run into a wall`);
          }
          const above = plan.floors[fi + 1];
          if (!above || Math.abs(f.elevation + x.h - above.elevation) > 0.01) bad.push(`${name}: stairs don't reach the floor above`);
          else if (!above.rooms.some((rm) => pointInPolygon(at(0, -x.d / 2 - 0.4), rm.points))) bad.push(`${name}: nowhere to step off at the top`);
        }
      });
    }
    expect(bad).toEqual([]);
  });

  it("have roofs that sit on their walls, joining next door on the right side", () => {
    for (const { name, plan } of all) {
      for (const f of plan.floors) {
        const corners = f.rooms.flatMap((r) => r.points);
        for (const r of f.roofs ?? []) {
          const rad = (r.rotation * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
          for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            const p: Vec2 = [r.x + (c * u * r.w) / 2 - (s * v * r.d) / 2, r.z + (s * u * r.w) / 2 + (c * v * r.d) / 2];
            expect(corners.some((q) => near(p, q)), `${name}: roof corner ${p}`).toBe(true);
          }
        }
      }
    }
    const party = (p: Plan) => p.floors.flatMap((f) => (f.roofs ?? []).map((r) => r.party ?? null)).filter(Boolean);
    expect(party(starterPlan("semi"))).toEqual(["right"]);
    expect(party(starterPlan("semi", { mirror: true }))).toEqual(["left"]);
    expect(party(starterPlan("terrace", { mirror: true }))).toEqual(["both"]);
    expect(party(starterPlan("flat"))).toEqual([]);
  });

  it("link their rooms to Home Assistant's areas the way Smart Setup does", () => {
    const names = ["Living Room", "Kitchen", "Bedroom", "Hallway", "Bathroom"];
    const hass = {
      states: {}, callService: async () => undefined, callWS: async () => undefined, connection: { subscribeMessage: async () => async () => undefined },
      areas: Object.fromEntries(names.map((n) => [n.toLowerCase().replace(/ /g, "_"), { area_id: n.toLowerCase().replace(/ /g, "_"), name: n }])),
    } as unknown as Hass;
    const { plan } = autoPlace(starterPlan("semi"), hass);
    const linked = Object.fromEntries(plan.floors.flatMap((f) => f.rooms.map((r) => [r.name, r.area_id])));
    expect(linked).toMatchObject({ "Living Room": "living_room", Kitchen: "kitchen", Hallway: "hallway", Bathroom: "bathroom", "Bedroom 1": "bedroom" });
  });
});

describe("fitLengths", () => {
  it("grows in proportion and shrinks down to the minimums", () => {
    expect(fitLengths([1, 3], [0, 0], 8)).toEqual([2, 6]);
    expect(fitLengths([2, 2], [1, 2], 3)).toEqual([1, 2]);
    const got = fitLengths([2, 4, 1], [1.5, 0, 1], 5);
    expect(got[0]).toBeCloseTo(1.5);
    expect(got[2]).toBeCloseTo(1);
    expect(got[1]).toBeCloseTo(2.5);
  });
});
