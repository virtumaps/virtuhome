// "Fit to my home": a plan stretched to a home's outside width and depth, and mirrored left to right.
// The house's room corners split each axis into bands that stretch together; when the house gets
// smaller, no band shrinks below what its doors, windows and stairs need. Doors, windows, stairs and
// furniture keep their size and stay with their walls; whatever is outside the house moves with it.
import { bounds, dist, dot, norm, pointInPolygon, sub } from "./geom";
import { layoutWalls, type WallSegment } from "./walls";
import type { Floor, Plan, Vec2 } from "./plan";
import { FURNITURE } from "../scene/furniture-lib";

export interface Fit {
  /** Outside width and depth (m), from the outside face of the walls. */
  width: number;
  depth: number;
  /** Mirrored left to right. */
  mirror: boolean;
}

/** A band never shrinks below this unless it was smaller to begin with (m). */
const MIN_BAND = 1.0;
/** Room to step off at the top of stairs, kept with them (m). */
const STAIR_TOP = 0.9;
/** Furniture this close to a wall stays this close (m). */
const NEAR = 0.35;

const r3 = (v: number) => Math.round(v * 1000) / 1000 || 0;
const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
const isStairs = (type: string) => FURNITURE[type]?.family === "stairs";

/**
 * New lengths adding up to `total`: all in proportion, except that when shrinking none goes below
 * its minimum (or its own length, if that is less) while others can still give.
 */
export function fitLengths(lengths: number[], mins: number[], total: number): number[] {
  const all = sum(lengths);
  if (all <= 0) return lengths.map(() => total / Math.max(1, lengths.length));
  if (total >= all) return lengths.map((l) => (l * total) / all);
  const m = lengths.map((l, i) => Math.max(0, Math.min(l, mins[i] ?? 0)));
  const least = sum(m);
  // too small even at the minimums: everything gives alike
  if (least >= total) return m.map((v) => (v * total) / least);
  const pinned = new Set<number>();
  for (;;) {
    const free = sum(lengths.filter((_, i) => !pinned.has(i)));
    const k = (total - sum(m.filter((_, i) => pinned.has(i)))) / free;
    const below = lengths.map((l, i) => !pinned.has(i) && l * k < m[i]);
    if (!below.includes(true)) return lengths.map((l, i) => (pinned.has(i) ? m[i] : l * k));
    below.forEach((b, i) => b && pinned.add(i));
  }
}

interface Axis {
  /** Room corner lines along the axis, in order, and the least each band between them may become. */
  cuts: number[];
  mins: number[];
}

/** Half the thickness of the walls meeting wall `w` at point p, plus a little for the frame. */
function clearance(walls: WallSegment[], w: WallSegment, p: Vec2): number {
  let c = 0;
  for (const o of walls) {
    if (o === w || Math.abs(dot(o.dir, w.normal)) < 0.2) continue;
    const t = dot(sub(p, o.a), o.dir);
    if (t > -0.02 && t < o.length + 0.02 && Math.abs(dot(sub(p, o.a), o.normal)) < 0.02) c = Math.max(c, o.thickness / 2);
  }
  return c + 0.05;
}

/** The bands of both axes, with what their stairs, doors and windows need. */
function axes(plan: Plan): { x: Axis; z: Axis } | null {
  const pts = plan.floors.flatMap((f) => f.rooms.flatMap((r) => r.points));
  if (!pts.length) return null;
  const lines = (vals: number[]) => {
    const out: number[] = [];
    for (const v of [...vals].sort((a, b) => a - b)) if (!out.length || v - out[out.length - 1] > 0.02) out.push(v);
    return out;
  };
  const make = (k: 0 | 1): Axis => {
    const cuts = lines(pts.map((p) => p[k]));
    return { cuts, mins: cuts.slice(1).map((c, i) => Math.min(c - cuts[i], MIN_BAND)) };
  };
  const ax = { x: make(0), z: make(1) };
  /** Bands overlapping [lo, hi] need `need` between them, shared in proportion (`need` Infinity: all they have). */
  const require = (a: Axis, lo: number, hi: number, need: number) => {
    a.cuts.slice(1).forEach((c, i) => {
      const b0 = a.cuts[i];
      if (Math.min(hi, c) - Math.max(lo, b0) < 0.02) return;
      a.mins[i] = Math.min(c - b0, Math.max(a.mins[i], (need * (c - b0)) / Math.max(0.01, hi - lo)));
    });
  };
  for (const f of plan.floors) {
    // stairs keep their bands, and the room to step off at the top
    for (const x of f.furniture) {
      if (!isStairs(x.type)) continue;
      const r = (x.rotation * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
      const at = ([lx, lz]: Vec2): Vec2 => [x.x + c * lx - s * lz, x.z + s * lx + c * lz];
      const corners = ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as const).map(([u, v]) => at([(u * x.w) / 2, v > 0 ? x.d / 2 : -x.d / 2 - STAIR_TOP]));
      const b = bounds(corners);
      require(ax.x, b.minX, b.maxX, Infinity);
      require(ax.z, b.minZ, b.maxZ, Infinity);
    }
    // a wall keeps room for its doors and windows, clear of the walls at its ends
    const { walls } = layoutWalls(f, plan.settings);
    for (const w of walls) {
      if (!w.openings.length) continue;
      const along = Math.abs(w.dir[1]) < 0.01 ? ax.x : Math.abs(w.dir[0]) < 0.01 ? ax.z : null;
      if (!along) continue;
      const k = along === ax.x ? 0 : 1;
      const need = sum(w.openings.map((o) => o.t1 - o.t0)) + clearance(walls, w, w.a) + clearance(walls, w, w.b) + 0.1 * (w.openings.length - 1);
      require(along, Math.min(w.a[k], w.b[k]), Math.max(w.a[k], w.b[k]), need);
    }
  }
  return ax;
}

/** The outside size a plan has, and the least it can be fitted to (m). */
export function fitRange(plan: Plan): { width: number; depth: number; minWidth: number; minDepth: number } | null {
  const ax = axes(plan);
  if (!ax) return null;
  const t = plan.settings.wall_exterior;
  const size = (a: Axis) => a.cuts[a.cuts.length - 1] - a.cuts[0] + t;
  const least = (a: Axis) => sum(a.mins) + t;
  return { width: r3(size(ax.x)), depth: r3(size(ax.z)), minWidth: r3(least(ax.x)), minDepth: r3(least(ax.z)) };
}

/** The axis stretched so its corner lines span `span`; beyond the house, distances are kept. */
function stretch(a: Axis, span: number): { map: (v: number) => number; lo: number; hi: number } {
  const { cuts } = a;
  const n = cuts.length - 1;
  const lengths = fitLengths(cuts.slice(1).map((c, i) => c - cuts[i]), a.mins, Math.max(0.5, span));
  const out = [cuts[0]];
  for (const l of lengths) out.push(out[out.length - 1] + l);
  const map = (v: number): number => {
    if (n < 1 || v <= cuts[0]) return v;
    if (v >= cuts[n]) return out[n] + v - cuts[n];
    let i = 0;
    while (v > cuts[i + 1]) i++;
    return out[i] + ((v - cuts[i]) / (cuts[i + 1] - cuts[i])) * (out[i + 1] - out[i]);
  };
  return { map, lo: out[0], hi: out[n] };
}

/** The plan fitted to a home's outside width and depth, and mirrored if asked. Leaves the plan as it is. */
export function fitPlan(plan: Plan, fit: Fit): Plan {
  const p: Plan = structuredClone(plan);
  const ax = axes(plan);
  if (!ax) return p;
  const t = plan.settings.wall_exterior;
  const X = stretch(ax.x, fit.width - t), Z = stretch(ax.z, fit.depth - t);
  const at = ([x, z]: Vec2): Vec2 => [r3(X.map(x)), r3(Z.map(z))];
  plan.floors.forEach((f, fi) => fitFloor(f, p.floors[fi], plan, at, X.map, Z.map));
  if (fit.mirror) for (const f of p.floors) mirrorFloor(f, X.lo + X.hi);
  return p;
}

function fitFloor(f: Floor, g: Floor, plan: Plan, at: (p: Vec2) => Vec2, mx: (v: number) => number, mz: (v: number) => number): void {
  // doors and windows: where along their wall, from the floor as it was
  const centres = new Map<string, Vec2>();
  const { walls } = layoutWalls(f, plan.settings);
  for (const w of walls) {
    if (!w.openings.length) continue;
    const a = at(w.a), b = at(w.b), length = dist(a, b), dir = norm(sub(b, a));
    const widths = w.openings.map((o) => o.t1 - o.t0);
    const gaps = w.openings.map((o, i) => Math.max(0, o.t0 - (i ? w.openings[i - 1].t1 : 0)));
    gaps.push(Math.max(0, w.length - w.openings[w.openings.length - 1].t1));
    const ends = [clearance(walls, w, w.a), clearance(walls, w, w.b)];
    const fitted = fitLengths(gaps, gaps.map((_, i) => (i === 0 ? ends[0] : i === gaps.length - 1 ? ends[1] : 0.1)), Math.max(0, length - sum(widths)));
    let s = 0;
    w.openings.forEach((o, i) => {
      s += fitted[i];
      centres.set(o.opening.id, [a[0] + dir[0] * (s + widths[i] / 2), a[1] + dir[1] * (s + widths[i] / 2)]);
      s += widths[i];
    });
  }
  const edge = (pts: Vec2[], k: number): [Vec2, Vec2] => [pts[k], pts[(k + 1) % pts.length]];
  g.rooms.forEach((r, ri) => (r.points = f.rooms[ri].points.map(at)));
  g.openings.forEach((o, oi) => {
    const ri = f.rooms.findIndex((r) => r.id === o.room_id);
    if (ri < 0 || o.edge >= f.rooms[ri].points.length) return;
    const [a, b] = edge(g.rooms[ri].points, o.edge);
    const c = centres.get(f.openings[oi].id);
    const [a0, b0] = edge(f.rooms[ri].points, o.edge);
    o.offset = r3(c ? dot(sub(c, a), norm(sub(b, a))) : (o.offset * dist(a, b)) / Math.max(0.01, dist(a0, b0)));
  });
  // furniture and devices near a wall stay as near it; the rest keep their place in the room
  const place = (x: number, z: number, ex: number, ez: number): Vec2 => {
    const room = f.rooms.find((r) => pointInPolygon([x, z], r.points));
    if (!room) return at([x, z]);
    const b = bounds(room.points);
    const keep = (v: number, e: number, lo: number, hi: number, map: (v: number) => number) => {
      const g0 = v - e - lo, g1 = hi - v - e;
      if (g0 < NEAR && g0 <= g1) return map(lo) + g0 + e;
      if (g1 < NEAR) return map(hi) - g1 - e;
      return map(v);
    };
    return [r3(keep(x, ex, b.minX, b.maxX, mx)), r3(keep(z, ez, b.minZ, b.maxZ, mz))];
  };
  g.furniture.forEach((x) => {
    const r = (x.rotation * Math.PI) / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
    [x.x, x.z] = place(x.x, x.z, (c * x.w + s * x.d) / 2, (s * x.w + c * x.d) / 2);
  });
  g.devices.forEach((d) => ([d.x, d.z] = place(d.x, d.z, 0, 0)));
  g.walls.forEach((w) => ([w.a, w.b] = [at(w.a), at(w.b)]));
  for (const o of g.outdoor ?? []) o.points = o.points.map(at);
  for (const x of g.fences ?? []) {
    const before = fenceLength(x.points);
    x.points = x.points.map(at);
    const k = fenceLength(x.points) / Math.max(0.01, before);
    x.gates = (x.gates ?? []).map((gate) => ({ ...gate, at: r3(gate.at * k) }));
  }
  // roofs: their corners go with the walls they sit on; what is on them keeps its size
  for (const r of g.roofs ?? []) {
    const rad = (r.rotation * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
    const corner = (u: number, v: number) => at([r.x + (c * u * r.w) / 2 - (s * v * r.d) / 2, r.z + (s * u * r.w) / 2 + (c * v * r.d) / 2]);
    const [p0, p1, p2] = [corner(-1, -1), corner(1, -1), corner(1, 1)];
    r.w = r3(dist(p0, p1));
    r.d = r3(dist(p1, p2));
    [r.x, r.z] = [r3((p0[0] + p2[0]) / 2), r3((p0[1] + p2[1]) / 2)];
    for (const it of r.items ?? []) [it.x, it.z] = at([it.x, it.z]);
  }
}

const fenceLength = (pts: Vec2[]) => sum(pts.slice(1).map((q, i) => dist(pts[i], q)));

/** Mirrors a storey left to right about x = s/2: outlines keep their winding, hinges and roofs' party ends swap. */
function mirrorFloor(f: Floor, s: number): void {
  const m = ([x, z]: Vec2): Vec2 => [r3(s - x), z];
  const turn = (deg: number) => (360 - deg) % 360;
  // edge k of a reversed outline is the old edge n - 2 - k, run the other way
  const flipEdge = (k: number, n: number) => (2 * n - 2 - k) % n;
  for (const r of f.rooms) {
    const n = r.points.length;
    for (const o of f.openings) {
      if (o.room_id !== r.id || o.edge >= n) continue;
      const len = dist(r.points[o.edge], r.points[(o.edge + 1) % n]);
      o.edge = flipEdge(o.edge, n);
      o.offset = r3(len - o.offset);
      o.hinge = o.hinge === "right" ? "left" : "right";
    }
    r.points = r.points.map(m).reverse();
  }
  for (const o of f.outdoor ?? []) {
    const n = o.points.length;
    o.points = o.points.map(m).reverse();
    if (o.steps) o.steps = o.steps.map((st) => ({ ...st, edge: flipEdge(st.edge, n) }));
  }
  for (const x of f.furniture) {
    x.x = r3(s - x.x);
    x.rotation = turn(x.rotation);
    if (isStairs(x.type)) x.balustrade_side = x.balustrade_side === "both" ? "both" : x.balustrade_side === "left" ? "right" : "left";
    else x.mirror = !x.mirror;
  }
  for (const d of f.devices) {
    d.x = r3(s - d.x);
    if (typeof d.rotation === "number") d.rotation = turn(d.rotation);
  }
  for (const w of f.walls) [w.a, w.b] = [m(w.a), m(w.b)];
  for (const x of f.fences ?? []) x.points = x.points.map(m);
  for (const r of f.roofs ?? []) {
    r.x = r3(s - r.x);
    r.rotation = turn(r.rotation);
    if (r.party === "left" || r.party === "right") r.party = r.party === "left" ? "right" : "left";
    for (const it of r.items ?? []) {
      it.x = r3(s - it.x);
      if (typeof it.rotation === "number") it.rotation = turn(it.rotation);
    }
  }
}
