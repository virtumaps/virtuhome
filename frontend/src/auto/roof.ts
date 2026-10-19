// Roofs for a plan without any: a main roof over the top storey, and a roof over every part of a
// lower storey that has nothing above it (an extension, a garage, a porch). Outlines are split into
// rectangles; a part that stands against a taller storey gets a lean-to rising to it (flat when it is
// deep), the rest the house's shape. Semi-detached and terraced houses carry their roofs on over the
// party walls: sides with no doors or windows on any storey and nothing built against them.
import { pointInPolygon } from "../model/geom";
import { layoutWalls } from "../model/walls";
import { newId, type PartyEnds, type Plan, type Roof, type RoofCovering, type RoofShape, type Vec2 } from "../model/plan";
import { ROOF_SHAPES } from "../scene/roofs";

export type HouseKind = "detached" | "semi" | "terrace";

export interface RoofPlan {
  /** Roofs to add, by storey. */
  roofs: { floor: number; roof: Roof }[];
  /** What the house looks like from its walls, and which ends join the neighbours. */
  kind: HouseKind;
  party: PartyEnds | null;
}

export interface RoofChoice {
  kind?: HouseKind;
  /** Which side joins next door for a semi (null: worked out from the walls). */
  side?: "left" | "right" | null;
  shape?: RoofShape;
  covering?: RoofCovering;
}

const RAD = Math.PI / 180;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** The plan's main direction (degrees, 0..90): most wall length runs along it or across it. */
function mainAngle(plan: Plan): number {
  const bins = new Float64Array(90);
  for (const f of plan.floors) for (const r of f.rooms) {
    r.points.forEach((a, i) => {
      const b = r.points[(i + 1) % r.points.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.3) return;
      const deg = ((Math.atan2(b[1] - a[1], b[0] - a[0]) / RAD) % 90 + 90) % 90;
      bins[Math.round(deg) % 90] += len;
    });
  }
  let best = 0;
  for (let i = 1; i < 90; i++) if (bins[i] > bins[best]) best = i;
  return best > 45 ? best - 90 : best;
}

interface Rect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/**
 * Rectangles covering the cells of a grid where `inside` holds: the biggest first, until every
 * cell is covered. Grids from house plans are small (tens of lines each way).
 */
export function rectangles(xs: number[], zs: number[], inside: (x: number, z: number) => boolean): Rect[] {
  const nx = xs.length - 1, nz = zs.length - 1;
  const cell: boolean[][] = [];
  for (let i = 0; i < nx; i++) {
    cell.push([]);
    for (let j = 0; j < nz; j++) cell[i].push(inside((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2));
  }
  const left = cell.map((col) => col.slice());
  const out: Rect[] = [];
  for (;;) {
    let best: [number, number, number, number] | null = null;
    let bestArea = 0;
    for (let i0 = 0; i0 < nx; i0++) for (let j0 = 0; j0 < nz; j0++) {
      if (!cell[i0][j0]) continue;
      // grow over cells of the region; it must cover at least one cell not yet covered
      for (let i1 = i0; i1 < nx && cell[i1][j0]; i1++) {
        for (let j1 = j0; j1 < nz; j1++) {
          let ok = true, fresh = false;
          for (let i = i0; i <= i1 && ok; i++) for (let j = j0; j <= j1 && ok; j++) {
            if (!cell[i][j]) ok = false;
            else if (left[i][j]) fresh = true;
          }
          if (!ok) break;
          const a = (xs[i1 + 1] - xs[i0]) * (zs[j1 + 1] - zs[j0]);
          if (fresh && a > bestArea + 1e-9) {
            bestArea = a;
            best = [i0, j0, i1, j1];
          }
        }
      }
    }
    if (!best) break;
    const [i0, j0, i1, j1] = best;
    // what it covers that a bigger one already did is fine: overlapping roofs of a shape merge
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) left[i][j] = false;
    out.push({ x0: xs[i0], z0: zs[j0], x1: xs[i1 + 1], z1: zs[j1 + 1] });
    if (!left.some((col) => col.some(Boolean))) break;
  }
  return out;
}

/** Roofs for the plan's storeys. Leaves the plan as it is. */
export function suggestRoofs(plan: Plan, choice: RoofChoice = {}): RoofPlan {
  const theta = mainAngle(plan);
  const c = Math.cos(theta * RAD), s = Math.sin(theta * RAD);
  // into the plan's own square frame and back
  const into = ([x, z]: Vec2): Vec2 => [c * x + s * z, -s * x + c * z];
  const back = ([x, z]: Vec2): Vec2 => [c * x - s * z, s * x + c * z];
  const floors = plan.floors.map((f) => f.rooms.map((r) => r.points.map(into)));
  const inAny = (fi: number, p: Vec2) => floors[fi].some((pts) => pointInPolygon(p, pts));
  const above = (fi: number, p: Vec2) => floors.slice(fi + 1).some((rooms) => rooms.some((pts) => pointInPolygon(p, pts)));
  const lines = (vals: number[]) => [...new Set(vals.map((v) => Math.round(v * 100) / 100))].sort((a, b) => a - b);

  // the top storey's biggest rectangle is the main roof
  const parts: { fi: number; rect: Rect }[] = [];
  floors.forEach((rooms, fi) => {
    const pts = rooms.flat();
    if (!pts.length) return;
    const xs = lines(pts.map((p) => p[0])), zs = lines(pts.map((p) => p[1]));
    for (const rect of rectangles(xs, zs, (x, z) => inAny(fi, [x, z]) && !above(fi, [x, z]))) {
      // slivers where storeys don't quite line up are not parts of the house
      if (Math.min(rect.x1 - rect.x0, rect.z1 - rect.z0) >= 0.6 && (rect.x1 - rect.x0) * (rect.z1 - rect.z0) >= 0.5) parts.push({ fi, rect });
    }
  });
  if (!parts.length) return { roofs: [], kind: choice.kind ?? "detached", party: null };
  const top = Math.max(...parts.map((p) => p.fi));
  const sized = (p: { rect: Rect }) => (p.rect.x1 - p.rect.x0) * (p.rect.z1 - p.rect.z0);
  const main = parts.filter((p) => p.fi === top).sort((a, b) => sized(b) - sized(a))[0];

  // party walls: the main block's left and right sides with no openings on any storey and nothing beyond them
  const open = (side: "left" | "right"): boolean => {
    const x = side === "left" ? main.rect.x0 : main.rect.x1;
    const out = side === "left" ? -0.4 : 0.4;
    for (let k = 1; k < 4; k++) {
      const z = main.rect.z0 + ((main.rect.z1 - main.rect.z0) * k) / 4;
      if (floors.some((_, fi) => inAny(fi, [x + out, z]))) return true;
    }
    for (const f of plan.floors) {
      for (const w of layoutWalls(f, plan.settings).walls) {
        if (!w.exterior || !w.openings.length) continue;
        const a = into(w.a), b = into(w.b);
        if (Math.abs(a[0] - x) < 0.08 && Math.abs(b[0] - x) < 0.08) return true;
      }
    }
    return false;
  };
  const blank = { left: !open("left"), right: !open("right") };
  const detected: HouseKind = blank.left && blank.right ? "terrace" : blank.left || blank.right ? "semi" : "detached";
  const kind = choice.kind ?? detected;
  let party: PartyEnds | null = null;
  if (kind === "terrace") party = "both";
  else if (kind === "semi") party = choice.side ?? (blank.right || !blank.left ? "right" : "left");

  const shape: RoofShape = choice.shape ?? (kind === "terrace" ? "gable" : "hip");
  const covering: RoofCovering = choice.covering ?? "concrete_tiles";
  const roofs: { floor: number; roof: Roof }[] = [];
  const make = (rect: Rect, rot: number, alongX: boolean, extra: Partial<Roof>): Roof => {
    const mid = back([(rect.x0 + rect.x1) / 2, (rect.z0 + rect.z1) / 2]);
    const wx = rect.x1 - rect.x0, dz = rect.z1 - rect.z0;
    return {
      id: newId("roof"), x: r2(mid[0]), z: r2(mid[1]), w: r2(alongX ? wx : dz), d: r2(alongX ? dz : wx),
      rotation: Math.round((((rot + theta) % 360) + 360) % 360), shape, pitch: ROOF_SHAPES[shape].pitch, covering, items: [], ...extra,
    };
  };
  // the main roof: its ridge along the front (the plan's bottom) for a semi or a terrace, else along its longer side
  const mw = main.rect.x1 - main.rect.x0, md = main.rect.z1 - main.rect.z0;
  const alongX = kind !== "detached" || mw >= md;
  roofs.push({ floor: main.fi, roof: make(main.rect, alongX ? 0 : 90, alongX, { party: alongX ? party : null }) });

  for (const p of parts) {
    if (p === main) continue;
    const { rect } = p;
    // against a taller storey (or the main block): which side, and how long the shared stretch is
    const touch = (side: "x0" | "x1" | "z0" | "z1"): number => {
      const n = 8;
      let hits = 0;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const q: Vec2 = side === "x0" ? [rect.x0 - 0.3, rect.z0 + (rect.z1 - rect.z0) * t]
          : side === "x1" ? [rect.x1 + 0.3, rect.z0 + (rect.z1 - rect.z0) * t]
          : side === "z0" ? [rect.x0 + (rect.x1 - rect.x0) * t, rect.z0 - 0.3] : [rect.x0 + (rect.x1 - rect.x0) * t, rect.z1 + 0.3];
        if (above(p.fi, q) || (p.fi === top && inAny(top, q))) hits++;
      }
      return hits / n;
    };
    const sides = (["x0", "x1", "z0", "z1"] as const).map((sd) => [sd, touch(sd)] as const).sort((a, b) => b[1] - a[1]);
    const [side, share] = sides[0];
    const lower = p.fi < top;
    if (lower && share >= 0.5) {
      // a lean-to rising to the wall it stands against; deep ones are flat
      const alongXl = side === "z0" || side === "z1";
      const span = alongXl ? rect.z1 - rect.z0 : rect.x1 - rect.x0;
      const rot = side === "z0" ? 0 : side === "z1" ? 180 : side === "x1" ? 90 : 270;
      const flat = span > 3.6;
      roofs.push({ floor: p.fi, roof: make(rect, rot, alongXl, flat
        ? { shape: "flat", pitch: 0, covering: "epdm" }
        : { shape: "lean_to", pitch: 17 }) });
      continue;
    }
    // a wing of the top storey, or a building of its own: the house's shape, its ridge along its longer side
    const w = rect.x1 - rect.x0, d = rect.z1 - rect.z0;
    roofs.push({ floor: p.fi, roof: make(rect, w >= d ? 0 : 90, w >= d, lower ? { pitch: 30 } : {}) });
  }
  return { roofs, kind, party };
}
