// Keeps furniture out of walls and out of each other while it is moved, turned or resized. A piece
// collides as the boxes of its parts, so a chair's seat still slides under a table top while its
// back stops at the edge, and a vase can stand on a sideboard. A dragged piece slides along what
// it meets instead of going into it.
import type { Plan, Vec2 } from "../model/plan";
import { layoutWalls } from "../model/walls";
import { baseHeight, furnitureType } from "../scene/furniture-lib";

/** A box standing on the plan: its middle, the unit direction of its width, half sizes, bottom and top. */
interface Box {
  cx: number;
  cz: number;
  ux: number;
  uz: number;
  hw: number;
  hd: number;
  y0: number;
  y1: number;
}

/** Things to keep out of, each with a circle around it that holds all its boxes (a quick first test). */
interface Obstacle {
  cx: number;
  cz: number;
  r: number;
  boxes: Box[];
}

/** Overlaps up to this (m) count as touching. */
const TOUCH = 0.002;
/** Left between a piece and what it was pushed off. */
const GAP = 0.001;
/** A part reaching this far into another's top stands on it (a vase on a sideboard, a sofa on a rug). */
const REST = 0.06;

const round3 = (v: number) => Math.round(v * 1000) / 1000;

/** Whether two boxes share height, other than one standing on the other. */
function sameHeight(a: Box, b: Box): boolean {
  if (Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) <= TOUCH) return false;
  if (a.y0 > b.y1 - REST && a.y1 > b.y1 + 0.01) return false;
  if (b.y0 > a.y1 - REST && b.y1 > a.y1 + 0.01) return false;
  return true;
}

/** The shortest push (a unit direction and a distance) that moves box a off box b, or null when apart. */
function separation(a: Box, b: Box): { nx: number; nz: number; depth: number } | null {
  const dx = a.cx - b.cx;
  const dz = a.cz - b.cz;
  let depth = Infinity;
  let nx = 0;
  let nz = 0;
  const axes = [a.ux, a.uz, -a.uz, a.ux, b.ux, b.uz, -b.uz, b.ux];
  for (let i = 0; i < 8; i += 2) {
    const ax = axes[i];
    const az = axes[i + 1];
    const ra = a.hw * Math.abs(a.ux * ax + a.uz * az) + a.hd * Math.abs(a.ux * az - a.uz * ax);
    const rb = b.hw * Math.abs(b.ux * ax + b.uz * az) + b.hd * Math.abs(b.ux * az - b.uz * ax);
    const d = dx * ax + dz * az;
    const over = ra + rb - Math.abs(d);
    if (over <= TOUCH) return null;
    if (over < depth) {
      depth = over;
      const s = d < 0 ? -1 : 1;
      nx = ax * s;
      nz = az * s;
    }
  }
  return { nx, nz, depth };
}

/** A piece's part boxes, placed relative to its middle. */
function partBoxes(item: Plan["floors"][number]["furniture"][number], storeyHeight: number): Box[] {
  const def = furnitureType(item.type);
  const r = (item.rotation * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const mx = item.mirror ? -1 : 1;
  const base = baseHeight(item, storeyHeight);
  return def.build(item.w, item.d, item.h)
    .filter((p) => p.w > 0.005 && p.d > 0.005 && p.h > 0)
    .map((p) => ({
      cx: c * p.x * mx - s * p.z, cz: s * p.x * mx + c * p.z, ux: c, uz: s,
      hw: p.w / 2, hd: p.d / 2, y0: base + p.y, y1: base + p.y + p.h,
    }));
}

function reachOf(boxes: Box[]): number {
  return boxes.reduce((m, b) => Math.max(m, Math.hypot(b.cx, b.cz) + Math.hypot(b.hw, b.hd)), 0);
}

/** One piece of furniture against the walls and the other pieces of its floor. */
export class Collider {
  private own: Box[] = [];
  private reach = 0;
  private others: Obstacle[] = [];

  constructor(plan: Plan, fi: number, id: string) {
    const floor = plan.floors[fi];
    const item = floor?.furniture.find((x) => x.id === id);
    if (!floor || !item) return;
    this.own = partBoxes(item, floor.height);
    this.reach = reachOf(this.own);
    for (const x of floor.furniture) {
      if (x.id === id) continue;
      const rel = partBoxes(x, floor.height);
      this.others.push({ cx: x.x, cz: x.z, r: reachOf(rel), boxes: rel.map((b) => ({ ...b, cx: b.cx + x.x, cz: b.cz + x.z })) });
    }
    // walls: solid from below the floor to their top, except doorways (open up to the door's top);
    // a window is solid all the way (sill, glass, lintel)
    for (const w of layoutWalls(floor, plan.settings).walls) {
      const span = (a: number, b: number, y0: number, y1: number) => {
        if (b - a < 0.005) return;
        const mid = (a + b) / 2;
        const box: Box = {
          cx: w.a[0] + w.dir[0] * mid, cz: w.a[1] + w.dir[1] * mid, ux: w.dir[0], uz: w.dir[1],
          hw: (b - a) / 2, hd: w.thickness / 2, y0, y1,
        };
        this.others.push({ cx: box.cx, cz: box.cz, r: Math.hypot(box.hw, box.hd), boxes: [box] });
      };
      let cursor = -w.extendStart;
      for (const po of w.openings) {
        if (po.opening.kind === "window") continue;
        span(cursor, po.t0, -1, w.height);
        span(po.t0, po.t1, po.top, w.height);
        cursor = Math.max(cursor, po.t1);
      }
      span(cursor, w.length + w.extendEnd, -1, w.height);
    }
  }

  /** The deepest thing the piece would be in with its middle at (x, z), as the push that frees it. */
  private contact(x: number, z: number): { nx: number; nz: number; depth: number } | null {
    let worst: { nx: number; nz: number; depth: number } | null = null;
    for (const o of this.others) {
      if (Math.hypot(o.cx - x, o.cz - z) > o.r + this.reach) continue;
      for (const b of o.boxes) {
        for (const p of this.own) {
          const a = { ...p, cx: p.cx + x, cz: p.cz + z };
          if (!sameHeight(a, b)) continue;
          const s = separation(a, b);
          if (s && (!worst || s.depth > worst.depth)) worst = s;
        }
      }
    }
    return worst;
  }

  /** Whether the piece would be in a wall or another piece with its middle at (x, z). */
  hits(x: number, z: number): boolean {
    return this.contact(x, z) !== null;
  }

  /**
   * Where the piece ends up when moved from `from` (null: where it is) to `to`: `to` when that is
   * free; else pushed out of what it would be in, so it slides along walls and other pieces; else,
   * wedged in a gap too small for it, as far towards `to` as it fits. A piece that was already
   * stuck moves freely, so it can be dragged out.
   */
  place(from: Vec2 | null, to: Vec2): Vec2 {
    if (!this.own.length) return to;
    let x = to[0];
    let z = to[1];
    for (let i = 0; i < 12; i++) {
      const c = this.contact(x, z);
      if (!c) return i === 0 ? to : this.tidy(x, z);
      x += c.nx * (c.depth + GAP);
      z += c.nz * (c.depth + GAP);
    }
    if (!from || this.hits(from[0], from[1])) return to;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 14; i++) {
      const m = (lo + hi) / 2;
      if (this.hits(from[0] + (to[0] - from[0]) * m, from[1] + (to[1] - from[1]) * m)) hi = m;
      else lo = m;
    }
    return this.tidy(from[0] + (to[0] - from[0]) * lo, from[1] + (to[1] - from[1]) * lo);
  }

  /** Rounded to the millimetre, unless that would take it back into what it was pushed off. */
  private tidy(x: number, z: number): Vec2 {
    const r: Vec2 = [round3(x), round3(z)];
    return this.hits(r[0], r[1]) ? [x, z] : r;
  }
}

/** Pushes a piece out of walls and other pieces where it stands (after turning, resizing or adding it). */
export function settle(plan: Plan, fi: number, id: string): void {
  const item = plan.floors[fi]?.furniture.find((x) => x.id === id);
  if (!item) return;
  const [x, z] = new Collider(plan, fi, id).place(null, [item.x, item.z]);
  item.x = x;
  item.z = z;
}
