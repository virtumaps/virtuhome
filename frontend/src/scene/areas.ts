// The shape of garden areas beyond their outline: which edges are open (not along the house), the
// outline set in for a border course or a railing, steps down from a raised patio or deck, and the
// runs a railing takes round the open edges, leaving gaps for the steps.
import { labelPoint, pointInPolygon, segmentDistance } from "../model/geom";
import { newId, type AreaSteps, type Floor, type OutdoorArea, type Vec2 } from "../model/plan";
import { t } from "../i18n";

/** +1 if the outline turns one way, -1 the other (which side of each edge is inside). */
export function turnOf(points: Vec2[]): number {
  let a = 0;
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    a += p[0] * q[1] - q[0] * p[1];
  });
  return a >= 0 ? 1 : -1;
}

/** Edge i's direction, length and the normal pointing out of the area. */
export function edgeOf(points: Vec2[], i: number, turn = turnOf(points)): { a: Vec2; b: Vec2; dir: Vec2; len: number; out: Vec2 } {
  const a = points[i], b = points[(i + 1) % points.length];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-9;
  const dir: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  return { a, b, dir, len, out: [turn * dir[1], -turn * dir[0]] };
}

/**
 * Whether an edge runs along the house: a room just beyond it, or a room's wall in reach of its
 * middle. Such an edge needs no side, railing or steps.
 */
export function alongHouse(floor: Floor, points: Vec2[], i: number, wall = 0.28): boolean {
  const e = edgeOf(points, i);
  const mid: Vec2 = [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2];
  const beyond: Vec2 = [mid[0] + e.out[0] * 0.3, mid[1] + e.out[1] * 0.3];
  if (floor.rooms.some((r) => pointInPolygon(beyond, r.points))) return true;
  const reach = wall / 2 + 0.2;
  return floor.rooms.some((r) => r.points.some((p, k) => segmentDistance(mid, p, r.points[(k + 1) % r.points.length]).d < reach
    && Math.abs(edgeOf(r.points, k).dir[0] * e.dir[1] - edgeOf(r.points, k).dir[1] * e.dir[0]) < 0.2));
}

/** The edges of an area that are open: not along the house. */
export function openEdges(floor: Floor, o: OutdoorArea, wall = 0.28): boolean[] {
  return o.points.map((_, i) => !alongHouse(floor, o.points, i, wall));
}

/** The outline moved in by d (each edge parallel to its own, meeting its neighbours at the corners). */
export function insetPolygon(points: Vec2[], d: number): Vec2[] {
  const n = points.length;
  const turn = turnOf(points);
  const lines = points.map((_, i) => {
    const e = edgeOf(points, i, turn);
    return { p: [e.a[0] - e.out[0] * d, e.a[1] - e.out[1] * d] as Vec2, dir: e.dir };
  });
  return points.map((_, i) => {
    const l1 = lines[(i + n - 1) % n], l2 = lines[i];
    const den = l1.dir[0] * l2.dir[1] - l1.dir[1] * l2.dir[0];
    if (Math.abs(den) < 1e-6) return l2.p;
    const t = ((l2.p[0] - l1.p[0]) * l2.dir[1] - (l2.p[1] - l1.p[1]) * l2.dir[0]) / den;
    return [l1.p[0] + l1.dir[0] * t, l1.p[1] + l1.dir[1] * t];
  });
}

/** A step: its outline on the plan (a quad along the edge), the height of its tread, and the edge's frame. */
export interface StepBlock {
  corners: [Vec2, Vec2, Vec2, Vec2];
  /** Top of the tread above the ground (m). */
  top: number;
  dir: Vec2;
  out: Vec2;
}

/** How deep each tread is (m) and the highest a riser may be. */
export const STEP_GOING = 0.3;
const MAX_RISE = 0.2;

/** Where a flight of steps sits along its edge: from t0 to t1 (m from the edge's start). */
export function stepSpan(points: Vec2[], s: AreaSteps): [number, number] {
  const e = edgeOf(points, s.edge);
  const w = Math.max(0.6, Math.min(e.len, s.width ?? e.len));
  return [(e.len - w) / 2, (e.len + w) / 2];
}

/**
 * The steps down from an area `rise` m above the ground: one block per tread, the first against the
 * edge a riser below the area's top, each further one a going further out and a riser lower.
 */
export function stepBlocks(points: Vec2[], s: AreaSteps, rise: number): StepBlock[] {
  if (s.edge < 0 || s.edge >= points.length || rise < 0.05) return [];
  const e = edgeOf(points, s.edge);
  const n = Math.max(2, Math.ceil(rise / MAX_RISE - 1e-6));
  const [t0, t1] = stepSpan(points, s);
  const at = (t: number, o: number): Vec2 => [e.a[0] + e.dir[0] * t + e.out[0] * o, e.a[1] + e.dir[1] * t + e.out[1] * o];
  const out: StepBlock[] = [];
  for (let k = 1; k < n; k++) {
    const o0 = (k - 1) * STEP_GOING, o1 = k * STEP_GOING;
    out.push({ corners: [at(t0, o0), at(t1, o0), at(t1, o1), at(t0, o1)], top: (rise * (n - k)) / n, dir: e.dir, out: e.out });
  }
  return out;
}

/**
 * The lines a railing runs along: the open edges, set in a little so its posts stand on the area,
 * joined at corners, with a gap where steps go down.
 */
export function railingRuns(points: Vec2[], open: boolean[], steps: AreaSteps[], inset = 0.05): Vec2[][] {
  const n = points.length;
  if (n < 3) return [];
  const inner = insetPolygon(points, inset);
  // the pieces of each open edge, as [from, to] along it
  const pieces: { i: number; a: Vec2; b: Vec2 }[] = [];
  for (let i = 0; i < n; i++) {
    if (!open[i]) continue;
    const a = inner[i], b = inner[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.05) continue;
    const at = (t: number): Vec2 => [a[0] + ((b[0] - a[0]) * t) / len, a[1] + ((b[1] - a[1]) * t) / len];
    // the steps' span is along the outline's edge, which starts a little before this one
    const o = points[i];
    const shift = ((a[0] - o[0]) * (b[0] - a[0]) + (a[1] - o[1]) * (b[1] - a[1])) / len;
    const gaps = steps.filter((s) => s.edge === i).map((s) => stepSpan(points, s).map((t) => t - shift)).sort((x, y) => x[0] - y[0]);
    let cur = 0;
    for (const [g0, g1] of gaps) {
      if (g0 - 0.02 > cur + 0.05) pieces.push({ i, a: at(cur), b: at(g0 - 0.02) });
      cur = Math.max(cur, g1 + 0.02);
    }
    if (len > cur + 0.05) pieces.push({ i, a: at(cur), b: at(len) });
  }
  // joined where one piece ends where the next begins (round the corners, and over the start)
  const runs: Vec2[][] = [];
  for (const p of pieces) {
    const last = runs[runs.length - 1];
    const end = last?.[last.length - 1];
    if (end && Math.hypot(end[0] - p.a[0], end[1] - p.a[1]) < 1e-3) last.push(p.b);
    else runs.push([p.a, p.b]);
  }
  if (runs.length > 1) {
    const first = runs[0], last = runs[runs.length - 1];
    const end = last[last.length - 1];
    if (Math.hypot(end[0] - first[0][0], end[1] - first[0][1]) < 1e-3) {
      runs[0] = [...last, ...first.slice(1)];
      runs.pop();
    }
  }
  return runs;
}

/** The circle-like areas (a round patio): many corners, all as far from their middle. */
export function roundness(points: Vec2[]): { centre: Vec2; radius: number } | null {
  if (points.length < 12) return null;
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cz = points.reduce((s, p) => s + p[1], 0) / points.length;
  const rs = points.map((p) => Math.hypot(p[0] - cx, p[1] - cz));
  const r = rs.reduce((s, x) => s + x, 0) / rs.length;
  return rs.every((x) => Math.abs(x - r) < Math.max(0.03, r * 0.03)) ? { centre: [cx, cz], radius: r } : null;
}

/** A circle of `n` corners. */
export function circlePoints(centre: Vec2, radius: number, n = 32): Vec2[] {
  const r2 = (v: number) => Math.round(v * 1000) / 1000;
  return Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    return [r2(centre[0] + Math.cos(a) * radius), r2(centre[1] + Math.sin(a) * radius)] as Vec2;
  });
}

export type NewAreaKind = "patio" | "deck" | "path";

/**
 * A new patio, deck or path with these corners, named after its kind and linked to the area of the
 * garden it lies in (so the garden's lights light it). Patios are laid in Indian sandstone.
 */
export function newArea(floor: Floor, kind: NewAreaKind, points: Vec2[]): OutdoorArea {
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  const all = floor.outdoor ?? [];
  const n = all.filter((o) => o.kind === kind).length + 1;
  const name = n > 1 ? t("name.numbered", { name: t(`name.${kind}`), n }) : t(`name.${kind}`);
  const at = labelPoint(points);
  const under = all.find((o) => o.kind === "lawn" && pointInPolygon(at, o.points)) ?? all.find((o) => pointInPolygon(at, o.points));
  return {
    id: newId("out"), name, kind, area_id: under?.area_id ?? null, points: points.map(([x, z]) => [r3(x), r3(z)] as Vec2),
    ...(kind === "patio" ? { paving: "sandstone" as const } : {}),
  };
}

/** A rectangle's two side lengths (along its first edge, then its second), or null if it is not one. */
export function rectSides(points: Vec2[]): [number, number] | null {
  if (points.length !== 4) return null;
  for (let i = 0; i < 4; i++) {
    const a = edgeOf(points, i), b = edgeOf(points, (i + 1) % 4);
    if (Math.abs(a.dir[0] * b.dir[0] + a.dir[1] * b.dir[1]) > 0.02) return null;
  }
  return [edgeOf(points, 0).len, edgeOf(points, 1).len];
}

/** A rectangle with one pair of sides made `len` long, its first corner (and side) staying put. */
export function resizeRect(points: Vec2[], side: 0 | 1, len: number): Vec2[] {
  const e = edgeOf(points, side);
  const dx = e.dir[0] * (len - e.len), dz = e.dir[1] * (len - e.len);
  const moved = side === 0 ? [1, 2] : [2, 3];
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  return points.map((p, i) => (moved.includes(i) ? [r3(p[0] + dx), r3(p[1] + dz)] : p));
}
