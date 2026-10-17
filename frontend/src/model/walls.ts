// Walls are not stored: they follow from the room outlines. Edges of two rooms that lie on the same
// line become one inside wall between them; edges with a room on one side only become outside
// walls. Doors and windows are then placed on the wall they sit in.
import type { Floor, FreeWall, Opening, PlanSettings, Vec2 } from "./plan";
import { add, cross, dist, dot, norm, outwardNormal, pointInPolygon, scale, sub } from "./geom";

/** Index of the room on one side of a wall, or OUTSIDE. */
export const OUTSIDE = -1;

export interface PlacedOpening {
  opening: Opening;
  /** Along the wall, metres from its start. */
  t0: number;
  t1: number;
  /** Bottom and top above the floor. */
  bottom: number;
  top: number;
  /** Middle of the opening on the wall's centre line. */
  centre: Vec2;
  /** Unit vector into the opening's own room (doors swing that way, labels face it). */
  inward: Vec2;
}

export interface WallSegment {
  /** Centre line from a to b. */
  a: Vec2;
  b: Vec2;
  /** Unit direction a -> b, and the unit normal pointing to side A. */
  dir: Vec2;
  normal: Vec2;
  length: number;
  thickness: number;
  height: number;
  /** Rooms (indices into floor.rooms) on side A (along +normal) and side B. */
  roomA: number;
  roomB: number;
  exterior: boolean;
  /** How far the wall reaches past a and b to close corners with the walls meeting it there. */
  extendStart: number;
  extendEnd: number;
  openings: PlacedOpening[];
}

export interface WallLayout {
  walls: WallSegment[];
  /** Openings that sit on no wall (the plan changed under them). */
  orphans: Opening[];
}

interface EdgeRef {
  room: number;
  /** +1: the room lies on the +normal side of the line. */
  side: 1 | -1;
  t0: number;
  t1: number;
}

interface Line {
  angle: number;
  u: Vec2;
  n: Vec2;
  c: number;
  edges: EdgeRef[];
}

const ANGLE_TOL = 0.012; // rad, about 0.7 degrees
const OFFSET_TOL = 0.03; // m
const SNAP = 0.01; // m

export function layoutWalls(floor: Floor, settings: PlanSettings): WallLayout {
  const lines: Line[] = [];

  const lineFor = (a: Vec2, b: Vec2): { line: Line; flip: boolean } | null => {
    const d = sub(b, a);
    if (Math.hypot(d[0], d[1]) < 0.02) return null;
    let angle = Math.atan2(d[1], d[0]);
    if (angle < 0) angle += Math.PI;
    if (angle >= Math.PI - ANGLE_TOL) angle -= Math.PI;
    const u: Vec2 = [Math.cos(angle), Math.sin(angle)];
    const n: Vec2 = [-u[1], u[0]];
    const c = dot(n, a);
    for (const line of lines) {
      if (Math.abs(line.angle - angle) < ANGLE_TOL && Math.abs(line.c - c) < OFFSET_TOL) return { line, flip: false };
    }
    const line: Line = { angle, u, n, c, edges: [] };
    lines.push(line);
    return { line, flip: false };
  };

  floor.rooms.forEach((room, ri) => {
    const pts = room.points;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const found = lineFor(a, b);
      if (!found) continue;
      const { line } = found;
      const inward = scale(outwardNormal(pts, i), -1);
      const ta = dot(line.u, a);
      const tb = dot(line.u, b);
      line.edges.push({ room: ri, side: dot(inward, line.n) > 0 ? 1 : -1, t0: Math.min(ta, tb), t1: Math.max(ta, tb) });
    }
  });

  const walls: WallSegment[] = [];
  const height = floor.height;

  for (const line of lines) {
    // elementary intervals between all edge ends along the line
    const cuts = [...new Set(line.edges.flatMap((e) => [e.t0, e.t1]))].sort((x, y) => x - y);
    const ts: number[] = [];
    for (const t of cuts) if (!ts.length || t - ts[ts.length - 1] > SNAP) ts.push(t);
    let current: { t0: number; t1: number; roomA: number; roomB: number } | null = null;
    const flush = () => {
      if (!current) return;
      const { t0, t1, roomA, roomB } = current;
      const a = add(scale(line.u, t0), scale(line.n, line.c));
      const b = add(scale(line.u, t1), scale(line.n, line.c));
      const exterior = roomA === OUTSIDE || roomB === OUTSIDE;
      walls.push({
        a, b, dir: line.u, normal: line.n, length: t1 - t0,
        thickness: exterior ? settings.wall_exterior : settings.wall_interior,
        height, roomA, roomB, exterior, extendStart: 0, extendEnd: 0, openings: [],
      });
      current = null;
    };
    for (let k = 0; k + 1 < ts.length; k++) {
      const lo = ts[k];
      const hi = ts[k + 1];
      const mid = (lo + hi) / 2;
      let roomA = OUTSIDE;
      let roomB = OUTSIDE;
      for (const e of line.edges) {
        if (e.t0 - SNAP <= mid && mid <= e.t1 + SNAP) {
          if (e.side === 1) roomA = e.room;
          else roomB = e.room;
        }
      }
      if (roomA === OUTSIDE && roomB === OUTSIDE) {
        flush();
        continue;
      }
      if (current && current.roomA === roomA && current.roomB === roomB && Math.abs(current.t1 - lo) < SNAP) {
        current.t1 = hi;
      } else {
        flush();
        current = { t0: lo, t1: hi, roomA, roomB };
      }
    }
    flush();
  }

  for (const fw of floor.walls) walls.push(freeWall(fw, floor, settings));

  closeCorners(walls);
  const orphans = placeOpenings(floor, walls);
  return { walls, orphans };
}

function freeWall(fw: FreeWall, floor: Floor, settings: PlanSettings): WallSegment {
  const d = sub(fw.b, fw.a);
  const length = Math.hypot(d[0], d[1]);
  const dir = norm(d);
  const normal: Vec2 = [-dir[1], dir[0]];
  const mid = scale(add(fw.a, fw.b), 0.5);
  const roomAt = (p: Vec2) => floor.rooms.findIndex((r) => pointInPolygon(p, r.points));
  return {
    a: fw.a, b: fw.b, dir, normal, length,
    thickness: fw.thickness ?? settings.wall_interior,
    height: fw.height ?? floor.height,
    roomA: roomAt(add(mid, scale(normal, 0.15))),
    roomB: roomAt(add(mid, scale(normal, -0.15))),
    exterior: false, extendStart: 0, extendEnd: 0, openings: [],
  };
}

/**
 * Walls meeting at an angle each reach half the other's thickness past the corner, so corners close.
 * Where the same line carries on (a wall split where another meets it), the two parts just meet:
 * reaching into each other, their faces would overlap and flicker.
 */
function closeCorners(walls: WallSegment[]): void {
  const reach = (w: WallSegment, p: Vec2): number => {
    const carriesOn = walls.some((o) => o !== w && Math.abs(cross(o.dir, w.dir)) < 0.2
      && Math.abs(dot(sub(p, o.a), o.normal)) < 0.02 && (dist(p, o.a) < 0.02 || dist(p, o.b) < 0.02));
    if (carriesOn) return 0;
    let ext = 0;
    for (const o of walls) {
      if (o === w) continue;
      if (Math.abs(cross(o.dir, w.dir)) < 0.2) continue; // (nearly) parallel: continues the same wall
      const t = dot(sub(p, o.a), o.dir);
      if (t < -0.02 || t > o.length + 0.02) continue;
      const off = Math.abs(dot(sub(p, o.a), o.normal));
      if (off < 0.02) ext = Math.max(ext, o.thickness / 2);
    }
    return ext;
  };
  for (const w of walls) {
    w.extendStart = reach(w, w.a);
    w.extendEnd = reach(w, w.b);
  }
}

function placeOpenings(floor: Floor, walls: WallSegment[]): Opening[] {
  const orphans: Opening[] = [];
  const roomIndex = new Map(floor.rooms.map((r, i) => [r.id, i]));
  for (const o of floor.openings) {
    const ri = roomIndex.get(o.room_id);
    const room = ri === undefined ? undefined : floor.rooms[ri];
    if (!room || o.edge >= room.points.length) {
      orphans.push(o);
      continue;
    }
    const a = room.points[o.edge];
    const b = room.points[(o.edge + 1) % room.points.length];
    const d = norm(sub(b, a));
    const centre = add(a, scale(d, o.offset));
    const inward = scale(outwardNormal(room.points, o.edge), -1);
    let best: WallSegment | null = null;
    let bestT = 0;
    for (const w of walls) {
      if (Math.abs(cross(w.dir, d)) > 0.05) continue;
      const rel = sub(centre, w.a);
      if (Math.abs(dot(rel, w.normal)) > 0.05) continue;
      const t = dot(rel, w.dir);
      if (t < -0.01 || t > w.length + 0.01) continue;
      best = w;
      bestT = t;
      break;
    }
    if (!best) {
      orphans.push(o);
      continue;
    }
    const half = Math.min(o.width, best.length) / 2;
    const tc = Math.max(half, Math.min(best.length - half, bestT));
    const bottom = o.kind === "window" ? o.sill : 0;
    best.openings.push({
      opening: o,
      t0: tc - half,
      t1: tc + half,
      bottom,
      top: Math.min(best.height - 0.05, bottom + o.height),
      centre: add(best.a, scale(best.dir, tc)),
      inward,
    });
  }
  for (const w of walls) w.openings.sort((p, q) => p.t0 - q.t0);
  return orphans;
}

/** Where an opening sits in the plan (for editors and auto-placement). */
export function openingPoint(floor: Floor, o: Opening): Vec2 | null {
  const room = floor.rooms.find((r) => r.id === o.room_id);
  if (!room || o.edge >= room.points.length) return null;
  const a = room.points[o.edge];
  const b = room.points[(o.edge + 1) % room.points.length];
  const d = norm(sub(b, a));
  return dist(a, b) < 1e-6 ? a : add(a, scale(d, o.offset));
}
