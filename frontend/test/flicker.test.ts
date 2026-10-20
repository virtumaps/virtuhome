import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildPlan } from "../src/import/draft";
import { importSimple } from "../src/import/simple";
import { DEFAULT_SETTINGS, solarSize, type Plan, type Roof } from "../src/model/plan";
import { ROOF_SHAPE_ORDER, ROOF_SHAPES } from "../src/scene/roofs";
import { buildFloor } from "../src/scene/build";
import { WALL_HANG, WALL_TRIM } from "../src/scene/materials";
import { DAY } from "../src/scene/palette";

type P2 = [number, number];

function area(p: P2[]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length];
    a += p[i][0] * q[1] - q[0] * p[i][1];
  }
  return a / 2;
}

/** The part of convex polygon `s` inside convex polygon `c` (Sutherland–Hodgman). */
function clip(s: P2[], c: P2[]): P2[] {
  if (area(c) < 0) c = [...c].reverse();
  let out = s;
  for (let i = 0; i < c.length && out.length; i++) {
    const a = c[i], b = c[(i + 1) % c.length];
    const side = (p: P2) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const inp = out;
    out = [];
    inp.forEach((cur, j) => {
      const prev = inp[(j + inp.length - 1) % inp.length];
      const sc = side(cur), sp = side(prev);
      const cross = (): P2 => {
        const t = sp / (sp - sc);
        return [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t];
      };
      if (sc >= -1e-12) {
        if (sp < -1e-12) out.push(cross());
        out.push(cur);
      } else if (sp >= -1e-12) out.push(cross());
    });
  }
  return out;
}

/**
 * Surfaces of a built floor that face up or sideways, lie in one plane and overlap with different
 * looks: they flicker. Identical surfaces (wall tops meeting at a corner) and ones facing down are
 * never seen to. `cut` squashes the walls as the cutaway does.
 */
function flicker(plan: Plan, cut: number | null, fi = 0, roofs = false): string[] {
  const fb = buildFloor(plan, fi, DAY, { low: false });
  type Tri = { d: number; pts: P2[]; look: string; nk: string; x0: number; x1: number };
  const groups = new Map<string, Tri[]>();
  // the roofs are a mesh of their own, shown with the walls up: they must not fight the walls either
  for (const g of roofs ? [fb.opaque, fb.roof] : [fb.opaque]) collect(g);
  function collect(g: typeof fb.opaque): void {
  const pos = (v: number): [number, number, number] => {
    let y = g.pos[v * 3 + 1];
    let w = g.wall[v];
    if (cut !== null && w >= 0) {
      const hang = w >= WALL_HANG - 0.5;
      if (hang) w -= WALL_HANG;
      const trim = w >= WALL_TRIM - 0.5;
      y = hang ? -0.01 : Math.min(y, cut - (trim ? 0.003 : 0));
    }
    return [g.pos[v * 3], y, g.pos[v * 3 + 2]];
  };
  for (let i = 0; i < g.idx.length; i += 3) {
    const [a, b, c] = [g.idx[i], g.idx[i + 1], g.idx[i + 2]].map(pos);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(n[0], n[1], n[2]);
    if (l < 1e-9 || n[1] / l < -0.5) continue;
    n[0] /= l; n[1] /= l; n[2] /= l;
    const ax = Math.abs(n[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0];
    const e1 = [n[1] * ax[2] - n[2] * ax[1], n[2] * ax[0] - n[0] * ax[2], n[0] * ax[1] - n[1] * ax[0]];
    const l1 = Math.hypot(e1[0], e1[1], e1[2]);
    e1[0] /= l1; e1[1] /= l1; e1[2] /= l1;
    const e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]];
    const pts = [a, b, c].map((p) => [p[0] * e1[0] + p[1] * e1[1] + p[2] * e1[2], p[0] * e2[0] + p[1] * e2[1] + p[2] * e2[2]] as P2);
    const v = g.idx[i];
    const look = `${g.surfaces[g.mat[v]]} ${g.albedo.slice(v * 3, v * 3 + 3).map((x) => x.toFixed(3)).join(",")}`;
    const nk = n.map((x) => Math.round(x * 100)).join(",");
    const d = n[0] * a[0] + n[1] * a[1] + n[2] * a[2];
    const key = `${nk}|${Math.round(d / 0.001)}`;
    const t = { d, pts, look, nk, x0: Math.min(...pts.map((p) => p[0])), x1: Math.max(...pts.map((p) => p[0])) };
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(t);
  }
  }
  const bad = new Set<string>();
  for (const [key, list] of groups) {
    const [nk, dk] = key.split("|");
    const near = [...list, ...(groups.get(`${nk}|${Number(dk) + 1}`) ?? [])];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < near.length; j++) {
        const A = list[i], B = near[j];
        if (A.look === B.look || Math.abs(A.d - B.d) > 0.0005 || A.x1 <= B.x0 || B.x1 <= A.x0) continue;
        const inter = clip(A.pts, B.pts);
        if (inter.length >= 3 && Math.abs(area(inter)) > 1e-5) bad.add(`${A.look.split(" ")[0]} vs ${B.look.split(" ")[0]} facing ${nk}`);
      }
    }
  }
  return [...bad];
}

// two rooms side by side (their shared wall meets the outside walls in T-junctions), a door
// between them, a window with its board, a run of kitchen units standing flush, and cameras
// against the walls (one on a bracket, a doorbell by the front door) and on the ceiling
const house = (): Plan => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  floors: [{
    id: "g", name: "G", elevation: 0, height: 2.5, walls: [],
    devices: [
      { id: "c1", entity: "camera.room", x: 0.1, z: 2.5, rotation: 60 },
      { id: "c2", entity: "camera.doorbell", x: 5.2, z: 3.1 },
      { id: "c3", entity: "camera.dome", x: 1.5, z: 1.5, mount: "ceiling" },
    ],
    rooms: [
      { id: "a", name: "A", area_id: null, points: [[0, 0], [3, 0], [3, 3], [0, 3]] },
      { id: "b", name: "B", area_id: null, points: [[3, 0], [6, 0], [6, 3], [3, 3]] },
    ],
    openings: [
      { id: "d", room_id: "a", edge: 1, offset: 1.5, width: 0.9, height: 2, sill: 0, kind: "door" },
      { id: "w", room_id: "a", edge: 0, offset: 1.5, width: 1.2, height: 1.1, sill: 0.95, kind: "window" },
      { id: "fd", room_id: "b", edge: 2, offset: 1.5, width: 0.9, height: 2.05, sill: 0, kind: "door" },
    ],
    furniture: [
      { id: "k1", type: "kitchen", x: 3.6, z: 0.45, rotation: 180, w: 0.6, d: 0.6, h: 0.9 },
      { id: "k2", type: "stove", x: 4.2, z: 0.45, rotation: 180, w: 0.6, d: 0.6, h: 0.9 },
      { id: "k3", type: "sink", x: 4.9, z: 0.45, rotation: 180, w: 0.8, d: 0.6, h: 0.9 },
    ],
  }],
});

// behind the house: a raised patio with a border, steps and spindles, a raised deck with a
// picture frame, steps the whole length of its side and glass round it, and a patio on the lawn
const garden = (): Plan => {
  const p = house();
  p.floors[0].outdoor = [
    { id: "lawn", name: "Lawn", kind: "lawn", area_id: null, points: [[-1, -8], [7, -8], [7, -0.14], [-1, -0.14]] },
    { id: "pat", name: "Patio", kind: "patio", area_id: null, points: [[0, -3], [2.8, -3], [2.8, -0.14], [0, -0.14]], paving: "sandstone", border: "setts", height: 0.45, walls: "brick", steps: [{ edge: 0, width: 1.2 }], railing: "balustrade" },
    { id: "deck", name: "Deck", kind: "deck", area_id: null, points: [[3.2, -3], [6, -3], [6, -0.14], [3.2, -0.14]], height: 0.6, border: "frame", steps: [{ edge: 1 }], railing: "glass" },
    { id: "flat", name: "Flat", kind: "patio", area_id: null, points: [[0, -7], [3, -7], [3, -4], [0, -4]], paving: "porcelain", angle: 45, border: "block" },
  ];
  return p;
};

describe("no flickering surfaces in a built floor", () => {
  it("with the walls up", () => {
    expect(flicker(house(), null)).toEqual([]);
  });

  it("with patios and decks: raised, bordered, with steps and railings", () => {
    expect(flicker(garden(), null)).toEqual([]);
  });

  it("with the walls cut down", () => {
    expect(flicker(house(), 1.15)).toEqual([]);
  });

  it("in imported plans", () => {
    for (const file of ["simple.json", "storeys.json"]) {
      const { plan } = buildPlan(importSimple(JSON.parse(readFileSync(new URL(`./fixtures/import/${file}`, import.meta.url), "utf8"))));
      plan.floors.forEach((_, fi) => {
        expect(flicker(plan, null, fi)).toEqual([]);
        expect(flicker(plan, 1.15, fi)).toEqual([]);
      });
    }
  });
});

describe("no flickering roofs", { timeout: 30_000 }, () => {
  const roofed = (roof: Partial<Roof>): Plan => {
    const p = house();
    p.floors[0].roofs = [{
      id: "r", x: 3, z: 1.5, w: 6, d: 3, rotation: 0, shape: "gable", pitch: 35, covering: "slate", ...roof,
      items: [
        { id: "ch", kind: "chimney", x: 5.6, z: 1.5, w: 0.8, d: 0.5 },
        { id: "rw", kind: "window", x: 1.5, z: 0.6, w: 0.78, d: 0.98 },
        { id: "pv", kind: "solar", x: 3.5, z: 2.3, cols: 3, rows: 1, ...solarSize({ cols: 3, rows: 1 }) },
        ...(roof.shape === "flat" ? [{ id: "ln", kind: "lantern" as const, x: 0.9, z: 1.5, w: 1.0, d: 1 }] : [{ id: "dm", kind: "dormer" as const, x: 2.5, z: 0.8, w: 1.6, d: 1.2, style: "gable" as const }]),
      ],
    }];
    return p;
  };
  for (const shape of ROOF_SHAPE_ORDER) {
    it(`a ${shape} roof`, () => {
      expect(flicker(roofed({ shape, pitch: shape === "flat" ? 0 : ROOF_SHAPES[shape].pitch }), null, 0, true)).toEqual([]);
    });
  }
  it("cut off at party walls", () => {
    expect(flicker(roofed({ shape: "hip", party: "both" }), null, 0, true)).toEqual([]);
  });
  it("with a parapet", () => {
    expect(flicker(roofed({ shape: "flat", pitch: 0, parapet: true }), null, 0, true)).toEqual([]);
  });
  it("with no eaves", () => {
    expect(flicker(roofed({ shape: "gable", overhang: 0 }), null, 0, true)).toEqual([]);
  });
});

describe("no flickering in the house types", { timeout: 60_000 }, async () => {
  const { fitRange, STARTERS, starterPlan } = await import("../src/starters/houses");
  for (const s of STARTERS) {
    it(`${s.name}, as drawn, mirrored and bigger, walls up and cut down`, () => {
      const own = fitRange(s.plan())!;
      for (const plan of [starterPlan(s.id), starterPlan(s.id, { mirror: true }), starterPlan(s.id, { width: own.width * 1.3, depth: own.depth * 1.2 })]) {
        plan.floors.forEach((_, fi) => {
          expect(flicker(plan, null, fi, true)).toEqual([]);
          expect(flicker(plan, 1.15, fi)).toEqual([]);
        });
      }
    });
  }
});
