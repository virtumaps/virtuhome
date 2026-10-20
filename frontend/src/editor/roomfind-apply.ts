// The rooms found in a floor plan picture, as rooms, doors and windows for the plan: which start
// ticked, what they are called, and which wall each opening goes in.
import { bounds, pointInPolygon, segmentDistance } from "../model/geom";
import { newId, type Floor, type Opening, type Room, type Vec2 } from "../model/plan";
import type { FindResult } from "./roomfind";

/** Rooms found at least this surely start ticked. */
export const SURE = 0.6;

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Ticked to keep: sure enough, and not over a room already drawn. */
export function startTicks(floor: Floor | undefined, res: FindResult): boolean[] {
  return res.rooms.map((r) => r.confidence >= SURE && !overlaps(r.points, floor?.rooms ?? []));
}

/** More than a tenth of the outline lies inside rooms already on the plan. */
export function overlaps(pts: Vec2[], rooms: Room[]): boolean {
  if (!rooms.length) return false;
  const b = bounds(pts);
  let inside = 0, shared = 0;
  for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) {
    const p: Vec2 = [b.minX + ((b.maxX - b.minX) * (i + 0.5)) / 20, b.minZ + ((b.maxZ - b.minZ) * (j + 0.5)) / 20];
    if (!pointInPolygon(p, pts)) continue;
    inside++;
    if (rooms.some((r) => pointInPolygon(p, r.points))) shared++;
  }
  return inside > 0 && shared / inside > 0.1;
}

/**
 * The ticked rooms, named on from the plan's "Room N", with the doors, doorways and windows found in
 * their walls. An opening goes on its own room's edge if that room is kept, else on whichever kept or
 * existing room has an edge through it (swinging the same way), else nowhere.
 */
export function foundToPlan(floor: Floor | undefined, res: FindResult, keep: boolean[]): { rooms: Room[]; openings: Opening[] } {
  const existing = floor?.rooms ?? [];
  let n = existing.length;
  for (const r of existing) {
    const m = /^Room (\d+)$/.exec(r.name);
    if (m) n = Math.max(n, Number(m[1]));
  }
  const made = new Map<number, Room>();
  res.rooms.forEach((r, i) => {
    if (!keep[i]) return;
    made.set(i, { id: newId("room"), name: `Room ${++n}`, area_id: null, floor: "wood", wall_finish: "paint", points: r.points.map(([x, z]): Vec2 => [r2(x), r2(z)]) });
  });
  const openings: Opening[] = [];
  for (const g of res.gaps) {
    const own = res.rooms[g.room];
    const a = own.points[g.edge], b = own.points[(g.edge + 1) % own.points.length];
    const dir: Vec2 = [b[0] - a[0], b[1] - a[1]];
    const candidates: [Room, boolean][] = [];
    if (made.has(g.room)) candidates.push([made.get(g.room)!, true]);
    for (const [i, r] of made) if (i !== g.room) candidates.push([r, false]);
    for (const r of existing) candidates.push([r, false]);
    let placed: Opening | null = null;
    for (const [room, mine] of candidates) {
      const pts = room.points;
      for (let e = 0; e < pts.length && !placed; e++) {
        const p = pts[e], q = pts[(e + 1) % pts.length];
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const cross = (dir[0] * (q[1] - p[1]) - dir[1] * (q[0] - p[0])) / (Math.hypot(dir[0], dir[1]) * len || 1);
        const { d, t } = segmentDistance(g.at, p, q);
        if (Math.abs(cross) > 0.05 || d > 0.1 || len < g.width + 0.05 || t < g.width / 2 - 0.1 || t > len - g.width / 2 + 0.1) continue;
        const door = g.kind === "door";
        // on the room across the wall, the door opens the other way
        const swing = !door || mine ? g.swing ?? "in" : g.swing === "in" ? "out" : "in";
        placed = {
          id: newId("op"), room_id: room.id, edge: e, offset: r2(Math.max(g.width / 2, Math.min(len - g.width / 2, t))), width: r2(g.width),
          height: g.kind === "window" ? 1.2 : 2.0, sill: g.kind === "window" ? 0.9 : 0, kind: g.kind, hinge: g.hinge ?? "left", swing,
        };
      }
      if (placed) break;
    }
    if (placed) openings.push(placed);
  }
  return { rooms: [...made.values()], openings };
}
