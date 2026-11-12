// A floor plan picture often shows every storey, side by side or one above the other. The rooms found in
// it then fall into separate drawings: rooms of one drawing share walls, and nothing but paper lies between
// two drawings. Where their outer walls line up, the room finder closes the gap between them like a doorway,
// which leaves a "room" of paper joining the two: it is told apart and left out. Pure, like the finder.
import { bounds, pointInPolygon } from "../model/geom";
import type { Vec2 } from "../model/plan";
import type { FindResult } from "./roomfind";

export interface Drawing {
  /** The rooms found that belong to it (indexes into the result's rooms). */
  rooms: number[];
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
}

export interface Drawings {
  /** The drawings in reading order: left to right, then top to bottom. */
  list: Drawing[];
  /** For each room found: its drawing, or -1 for the paper between two drawings. */
  of: number[];
  /** How they lie: beside each other, above each other, or neither (one drawing, or scattered). */
  lie: "row" | "column" | null;
}

/** Two edges run along the same line and overlap by at least `min` metres. */
function shared(a: Vec2, b: Vec2, c: Vec2, d: Vec2, min: number): boolean {
  const ux = b[0] - a[0], uz = b[1] - a[1];
  const len = Math.hypot(ux, uz);
  if (len < 1e-6) return false;
  const nx = ux / len, nz = uz / len;
  // the other edge's ends, along this edge and away from it
  const along = (p: Vec2) => (p[0] - a[0]) * nx + (p[1] - a[1]) * nz;
  const off = (p: Vec2) => Math.abs((p[0] - a[0]) * nz - (p[1] - a[1]) * nx);
  if (off(c) > 0.12 || off(d) > 0.12) return false;
  const lo = Math.max(0, Math.min(along(c), along(d))), hi = Math.min(len, Math.max(along(c), along(d)));
  return hi - lo >= min;
}

/** Whether two rooms share a stretch of wall. */
function neighbours(p: Vec2[], q: Vec2[]): boolean {
  for (let i = 0; i < p.length; i++) for (let j = 0; j < q.length; j++) {
    if (shared(p[i], p[(i + 1) % p.length], q[j], q[(j + 1) % q.length], 0.4)) return true;
  }
  return false;
}

/** The parts the rooms fall into when `without` is left out: a part number for each room (-1 for those left out). */
function parts(n: number, next: number[][], without: Set<number>): number[] {
  const part = new Array<number>(n).fill(-1);
  let count = 0;
  for (let s = 0; s < n; s++) {
    if (part[s] >= 0 || without.has(s)) continue;
    const stack = [s];
    part[s] = count;
    while (stack.length) {
      const i = stack.pop()!;
      for (const j of next[i]) if (part[j] < 0 && !without.has(j)) (part[j] = count), stack.push(j);
    }
    count++;
  }
  return part;
}

const area = (pts: Vec2[]): number => Math.abs(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0)) / 2;

/** The distance from a point to a stretch of line. */
function away(p: Vec2, a: Vec2, b: Vec2): number {
  const ux = b[0] - a[0], uz = b[1] - a[1];
  const k = Math.max(0, Math.min(1, ((p[0] - a[0]) * ux + (p[1] - a[1]) * uz) / (ux * ux + uz * uz || 1)));
  return Math.hypot(p[0] - a[0] - ux * k, p[1] - a[1] - uz * k);
}

/**
 * The drawings the rooms found belong to. A room is paper between two drawings when leaving it out splits
 * its neighbours into separate parts, each a good share of the whole, and it can't be walked into from
 * each of them: a real room joining two wings has a door or doorway on both sides, the paper between two
 * drawings at most an outside door of one.
 */
export function drawingsOf(res: FindResult): Drawings {
  const n = res.rooms.length;
  const pts = res.rooms.map((r) => r.points);
  const next: number[][] = pts.map(() => []);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (neighbours(pts[i], pts[j])) next[i].push(j), next[j].push(i);
  const areas = pts.map(area);
  const total = areas.reduce((s, a) => s + a, 0) || 1;
  // each door and doorway, with the rooms whose walls it is in
  const on = (g: Vec2, p: Vec2[]) => p.some((a, e) => away(g, a, p[(e + 1) % p.length]) < 0.15);
  const ways = res.gaps.filter((g) => g.kind !== "window").map((g) => pts.flatMap((p, i) => (i === g.room || on(g.at, p) ? [i] : [])));

  const between = new Set<number>();
  for (let r = 0; r < n; r++) {
    if (next[r].length < 2) continue;
    const part = parts(n, next, new Set([r]));
    const sides = new Map<number, number>();
    for (const j of next[r]) sides.set(part[j], 0);
    if (sides.size < 2) continue;
    for (let i = 0; i < n; i++) if (sides.has(part[i])) sides.set(part[i], sides.get(part[i])! + areas[i]);
    // the sides that are drawings of their own, not a cupboard hanging off a hall
    const big = [...sides].filter(([, a]) => a >= total * 0.15).map(([k]) => k);
    if (big.length < 2) continue;
    const entered = new Set(ways.filter((w) => w.includes(r)).flatMap((w) => w.filter((i) => i !== r).map((i) => part[i])));
    if (!big.every((k) => entered.has(k))) between.add(r);
  }

  const part = parts(n, next, between);
  const count = Math.max(-1, ...part) + 1;
  let list: Drawing[] = Array.from({ length: count }, (_, k) => {
    const rooms = part.flatMap((p, i) => (p === k ? [i] : []));
    return { rooms, ...bounds(rooms.flatMap((i) => pts[i])) };
  });
  // a part within another's reach belongs to its drawing (a shed across a hall that wasn't found as a room):
  // their boxes overlap well, or it is small beside the other and stands close by
  const boxArea = (d: Drawing) => (d.maxX - d.minX) * (d.maxZ - d.minZ);
  const size = (d: Drawing) => d.rooms.reduce((sum, i) => sum + areas[i], 0);
  for (let merged = true; merged; ) {
    merged = false;
    for (let i = 0; i < list.length && !merged; i++) for (let j = i + 1; j < list.length && !merged; j++) {
      const a = list[i], b = list[j];
      const w = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX), d = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
      const overlap = w > 0 && d > 0 && w * d >= 0.25 * Math.min(boxArea(a), boxArea(b));
      const small = Math.min(size(a), size(b)) < 0.15 * Math.max(size(a), size(b)) && Math.max(-w, -d, 0) < 1.5 && Math.min(w, d) > -1.5;
      if (!overlap && !small) continue;
      const rooms = [...a.rooms, ...b.rooms];
      list.splice(j, 1);
      list[i] = { rooms, ...bounds(rooms.flatMap((k) => pts[k])) };
      merged = true;
    }
  }
  // reading order: by columns when they stand beside each other, else by rows
  const overlapZ = (a: Drawing, b: Drawing) => Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ) > 0.3 * Math.min(a.maxZ - a.minZ, b.maxZ - b.minZ);
  const overlapX = (a: Drawing, b: Drawing) => Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX) > 0.3 * Math.min(a.maxX - a.minX, b.maxX - b.minX);
  let lie: Drawings["lie"] = null;
  if (list.length > 1) {
    const row = list.every((a, i) => list.every((b, j) => i === j || (overlapZ(a, b) && !overlapX(a, b))));
    const column = list.every((a, i) => list.every((b, j) => i === j || (overlapX(a, b) && !overlapZ(a, b))));
    lie = row ? "row" : column ? "column" : null;
  }
  list = list.sort((a, b) => (lie === "column" ? a.minZ - b.minZ || a.minX - b.minX : a.minX - b.minX || a.minZ - b.minZ));
  const of = new Array<number>(n).fill(-1);
  list.forEach((d, k) => d.rooms.forEach((i) => (of[i] = k)));
  return { list, of, lie };
}

/**
 * How far to move a drawing so that it stands over another (its storey over the one below): `[dx, dz]`.
 * Drawings beside each other are drawn level, so the move is sideways only, and one above the other
 * only up or down; then the side that puts most of the upper storey over the rooms below wins (a storey
 * rarely overhangs the one under it), flush left or right, top or bottom, or centred.
 */
export function moveOver(res: FindResult, upper: Drawing, lower: Drawing, lie: Drawings["lie"]): Vec2 {
  const below = lower.rooms.map((i) => res.rooms[i].points);
  const above = upper.rooms.map((i) => res.rooms[i].points);
  const xs = [lower.minX - upper.minX, lower.maxX - upper.maxX, (lower.minX + lower.maxX - upper.minX - upper.maxX) / 2];
  const zs = [lower.minZ - upper.minZ, lower.maxZ - upper.maxZ, (lower.minZ + lower.maxZ - upper.minZ - upper.maxZ) / 2];
  const moves: Vec2[] = lie === "row" ? xs.map((dx): Vec2 => [dx, 0]) : lie === "column" ? zs.map((dz): Vec2 => [0, dz]) : xs.flatMap((dx) => zs.map((dz): Vec2 => [dx, dz]));
  let best: Vec2 = moves[0], bestScore = -1;
  for (const [dx, dz] of moves) {
    let inside = 0, over = 0;
    for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) {
      const p: Vec2 = [upper.minX + ((upper.maxX - upper.minX) * (i + 0.5)) / 40, upper.minZ + ((upper.maxZ - upper.minZ) * (j + 0.5)) / 40];
      if (!above.some((r) => pointInPolygon(p, r))) continue;
      inside++;
      const q: Vec2 = [p[0] + dx, p[1] + dz];
      if (below.some((r) => pointInPolygon(q, r))) over++;
    }
    const score = inside ? over / inside : 0;
    if (score > bestScore + 1e-6) (bestScore = score), (best = [dx, dz]);
  }
  return [Math.round(best[0] * 100) / 100, Math.round(best[1] * 100) / 100];
}
