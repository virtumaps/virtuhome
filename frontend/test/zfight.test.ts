import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizePlan, type Floor } from "../src/model/plan";
import { layoutWalls } from "../src/model/walls";
import { cameraPieces, cameraRig } from "../src/scene/cameras";
import { separateFaces } from "../src/scene/build";
import { BALUSTRADES, FURNITURE, type BalustradeStyle, type Part } from "../src/scene/furniture-lib";
import { FENCE_ORDER, fencePieces } from "../src/scene/fences";
import { GARDEN_OPTIONS, PLANTER_MATERIALS, PLANTING_NAMES } from "../src/scene/garden";

/**
 * Flat faces of the parts that lie in one plane, face the same way and overlap: they would flicker.
 * Glass is drawn from both sides, so a pane in the plane of a solid face flickers whichever way
 * either faces.
 */
function fights(parts: Part[]): string[] {
  type Face = { part: number; axis: number; sign: number; at: number; u: [number, number]; v: [number, number] };
  const faces: Face[] = [];
  parts.forEach((p, i) => {
    const x: [number, number] = [p.x - p.w / 2, p.x + p.w / 2];
    const y: [number, number] = [p.y, p.y + p.h];
    const z: [number, number] = [p.z - p.d / 2, p.z + p.d / 2];
    const box = p.shape === "box";
    const upright = p.shape === "cyl" && !p.axis;
    if (box || upright) {
      // a leaning cylinder's top sits off its bottom
      const [lx, lz] = p.lean ?? [0, 0];
      if (!upright || (p.taper ?? 1) > 0.001) faces.push({ part: i, axis: 1, sign: 1, at: y[1], u: [x[0] + lx, x[1] + lx], v: [z[0] + lz, z[1] + lz] });
      if (p.y > 0.02) faces.push({ part: i, axis: 1, sign: -1, at: y[0], u: x, v: z });
    }
    if (box || p.axis === "x") for (const s of [-1, 1]) faces.push({ part: i, axis: 0, sign: s, at: s < 0 ? x[0] : x[1], u: y, v: z });
    if (box || p.axis === "z") for (const s of [-1, 1]) faces.push({ part: i, axis: 2, sign: s, at: s < 0 ? z[0] : z[1], u: x, v: y });
    // a hull's sides are flat unless they lean in (the outline's box stands for the outline)
    if (p.shape === "hull" && !p.inset) for (const s of [-1, 1]) faces.push({ part: i, axis: 0, sign: s, at: s < 0 ? x[0] : x[1], u: y, v: z });
  });
  const glass = (f: Face) => parts[f.part].role === "glass";
  const out: string[] = [];
  for (let a = 0; a < faces.length; a++) {
    for (let b = a + 1; b < faces.length; b++) {
      const A = faces[a], B = faces[b];
      if (A.part === B.part || A.axis !== B.axis || Math.abs(A.at - B.at) > 0.0005) continue;
      if (A.sign !== B.sign && glass(A) === glass(B)) continue;
      const ou = Math.min(A.u[1], B.u[1]) - Math.max(A.u[0], B.u[0]);
      const ov = Math.min(A.v[1], B.v[1]) - Math.max(A.v[0], B.v[0]);
      if (ou > 0.002 && ov > 0.002) out.push(`parts ${A.part} and ${B.part}, ${"xyz"[A.axis]}${A.sign > 0 ? "+" : "-"} at ${A.at.toFixed(3)}`);
    }
  }
  return out;
}

describe("flicker-free furniture", () => {
  it("leaves no two parts of a garden building or planter sharing a face, whatever is picked", () => {
    const bad: string[] = [];
    for (const [type, o] of Object.entries(GARDEN_OPTIONS)) {
      const def = FURNITURE[type];
      const [w, d, h] = def.size;
      const variants: Record<string, unknown>[] = [{}];
      for (const canopy of o.canopies ?? []) variants.push({ canopy });
      for (const roofing of o.roofings ?? []) variants.push({ roofing });
      for (const door of o.doors ?? [null]) for (let windows = 0; windows <= (o.windows?.[0] ?? 0); windows++) variants.push({ door, windows });
      if (o.material) for (const material of Object.keys(PLANTER_MATERIALS)) variants.push({ material });
      if (o.plants) for (const plants of Object.keys(PLANTING_NAMES)) variants.push({ plants });
      for (const waste of o.wastes ?? []) variants.push({ waste });
      for (const v of variants) {
        const item = { id: "t", type, x: 0, z: 0, rotation: 0, w, d, h, ...v };
        for (const f of fights(separateFaces(def.build(w, d, h, item)))) bad.push(`${type} ${JSON.stringify(v)}: ${f}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("leaves no two parts of a piece sharing a face", () => {
    const bad: string[] = [];
    for (const [type, def] of Object.entries(FURNITURE)) {
      const [w, d, h] = def.size;
      for (const f of fights(separateFaces(def.build(w, d, h)))) bad.push(`${type}: ${f}`);
    }
    expect(bad).toEqual([]);
  });

  it("leaves no two parts of a camera model sharing a face", () => {
    const bad: string[] = [];
    const f: Floor = {
      id: "g", name: "G", elevation: 0, height: 2.5, walls: [], furniture: [], openings: [],
      rooms: [{ id: "a", name: "A", area_id: null, points: [[0, 0], [4, 0], [4, 3], [0, 3]] }],
      devices: [
        { id: "bullet", entity: "camera.a", x: 1, z: 0.1, rotation: 30 },
        { id: "dome", entity: "camera.b", x: 2, z: 1.5, mount: "ceiling" },
        { id: "doorbell", entity: "camera.doorbell", x: 1, z: 3.2 },
        { id: "cube", entity: "camera.c", x: 2, z: 1.5, mount: "table" },
      ],
    };
    const layout = layoutWalls(f, DEFAULT_SETTINGS);
    for (const d of f.devices) {
      for (const piece of cameraPieces(cameraRig(f, layout, d))) for (const x of fights(separateFaces(piece.parts))) bad.push(`${d.id}: ${x}`);
    }
    expect(bad).toEqual([]);
  });

  it("leaves no two parts of a fence's bay, post or gate sharing a face", () => {
    const bad: string[] = [];
    for (const style of FENCE_ORDER) {
      for (const low of [false, true]) {
        for (const extra of [{}, { gravel_board: true, topper: "trellis" as const }, { posts: "concrete" as const }]) {
          const fence = { id: "f", points: [[0, 0], [5, 0], [5, 4]] as [number, number][], style, height: 1.8, gates: [{ at: 2.5, width: 1 }, { at: 7, width: 3, double: true }], ...extra };
          fencePieces(fence, low).forEach((p, i) => {
            for (const f of fights(separateFaces(p.parts))) bad.push(`${style}${low ? " (low)" : ""} piece ${i}: ${f}`);
          });
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("leaves no shared faces in a staircase's balustrade", () => {
    const bad: string[] = [];
    for (const balustrade of Object.keys(BALUSTRADES) as BalustradeStyle[]) {
      const item = { id: "s", type: "stairs", x: 0, z: 0, rotation: 0, w: 0.9, d: 3, h: 2.6, balustrade, balustrade_side: "both" as const };
      for (const f of fights(separateFaces(FURNITURE.stairs.build(0.9, 3, 2.6, item)))) bad.push(`${balustrade}: ${f}`);
    }
    expect(bad).toEqual([]);
  });

  it("leaves no shared faces in the pieces of the house types", async () => {
    const { STARTERS, starterPlan } = await import("../src/starters/houses");
    const bad: string[] = [];
    for (const s of STARTERS) {
      for (const f of starterPlan(s.id, { mirror: true }).floors) {
        for (const x of f.furniture) for (const fault of fights(separateFaces(FURNITURE[x.type].build(x.w, x.d, x.h, x)))) bad.push(`${s.id} ${x.type}: ${fault}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("shows a bath's water below its rim", () => {
    const parts = FURNITURE.bathtub.build(1.7, 0.75, 0.55);
    const water = parts.find((p) => p.role === "water")!;
    const rim = Math.max(...parts.filter((p) => p.role === "ceramic").map((p) => p.y + p.h));
    expect(water.y + water.h).toBeLessThan(rim - 0.02);
  });

  it("stops stairs under the floor of the storey above", () => {
    const top = Math.max(...FURNITURE.stairs.build(0.9, 3, 2.6).map((p) => p.y + p.h));
    expect(top).toBeLessThan(2.6 - 0.005);
  });
});

describe("normalizePlan", () => {
  it("puts back pieces that an old save dropped to the floor", () => {
    const plan = normalizePlan({
      version: 1, settings: {},
      floors: [{
        id: "g", name: "G", elevation: 0, height: 2.6, rooms: [], openings: [], devices: [], walls: [],
        furniture: [
          { id: "a", type: "kitchen_wall", x: 0, z: 0, rotation: 0, w: 0.6, d: 0.35, h: 0.7, y: 0 },
          { id: "b", type: "lamp_ceiling", x: 0, z: 0, rotation: 0, w: 0.4, d: 0.4, h: 0.1, y: 0 },
          { id: "c", type: "sofa", x: 0, z: 0, rotation: 0, w: 2, d: 0.9, h: 0.8, y: 0 },
          { id: "d", type: "kitchen_wall", x: 0, z: 0, rotation: 0, w: 0.6, d: 0.35, h: 0.7, y: 1.6 },
        ],
      }],
    });
    const [a, b, c, d] = plan.floors[0].furniture;
    expect(a.y).toBeUndefined();
    expect(b.y).toBeUndefined();
    expect(c.y).toBe(0);
    expect(d.y).toBe(1.6);
  });
});
