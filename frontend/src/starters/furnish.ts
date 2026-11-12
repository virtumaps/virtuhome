// Furniture for a house type, so a home started from one looks lived in: a sofa and a TV in the living
// room, beds and wardrobes, a run of kitchen units, a bath, a table to eat at. Each piece goes against a
// wall that is free for it (never across a door, nothing tall over a window) or in open floor, and is
// left out where the room, at the size the home was fitted to, has no place for it. Everything it adds
// is ordinary furniture: moved, swapped or deleted in the editor like any other.
import { bounds, pointInPolygon } from "../model/geom";
import { newId, type Floor, type Furniture, type Plan, type Room, type Vec2 } from "../model/plan";
import { furnitureType } from "../scene/furniture-lib";

export type RoomKind = "living" | "dining" | "kitchen" | "bedroom" | "main-bedroom" | "bathroom" | "ensuite" | "wc" | "study" | "utility";

/** A rectangle on the plan, its sides along x and z. */
interface Rect {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/** A side of a room's box: 0 the top of the plan (least z), then clockwise: 1 right, 2 bottom, 3 left. */
type Side = 0 | 1 | 2 | 3;
const SIDES: Side[] = [0, 1, 2, 3];

/** A door, doorway or window in one of the room's walls: where along that side, and how wide. */
interface Gap {
  side: Side;
  at: number;
  width: number;
  window: boolean;
  /** A window over a worktop: its sill is high. */
  high: boolean;
}

const overlap = (a: Rect, b: Rect) => a.x0 < b.x1 - 1e-6 && b.x0 < a.x1 - 1e-6 && a.z0 < b.z1 - 1e-6 && b.z0 < a.z1 - 1e-6;
const grow = (r: Rect, by: number): Rect => ({ x0: r.x0 - by, z0: r.z0 - by, x1: r.x1 + by, z1: r.z1 + by });

/** One room being furnished: its box, what is in its walls, and what already stands in it. */
class Space {
  readonly box: ReturnType<typeof bounds>;
  readonly gaps: Gap[] = [];
  /** How far each side's inner face is from the middle of its wall, plus a finger's gap. */
  private inset: number[];
  /** Where nothing may stand: in front of doors, on the stairs, where furniture already is. */
  private taken: Rect[] = [];
  /** In front of windows: nothing tall. */
  private glass: Rect[] = [];

  constructor(private floor: Floor, readonly room: Room, plan: Plan, stairs: Rect[]) {
    this.box = bounds(room.points);
    const b = this.box;
    const others = floor.rooms.filter((r) => r !== room);
    const outside = (p: Vec2) => !others.some((r) => pointInPolygon(p, r.points));
    const mx = (b.minX + b.maxX) / 2, mz = (b.minZ + b.maxZ) / 2;
    const beyond: Vec2[] = [[mx, b.minZ - 0.4], [b.maxX + 0.4, mz], [mx, b.maxZ + 0.4], [b.minX - 0.4, mz]];
    this.inset = beyond.map((p) => (outside(p) ? plan.settings.wall_exterior : plan.settings.wall_interior) / 2 + 0.02);
    for (const o of floor.openings) {
      const r = floor.rooms.find((q) => q.id === o.room_id);
      if (!r) continue;
      const a = r.points[o.edge], c = r.points[(o.edge + 1) % r.points.length];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      const m: Vec2 = [a[0] + ((c[0] - a[0]) * o.offset) / len, a[1] + ((c[1] - a[1]) * o.offset) / len];
      const window = o.kind === "window";
      // the floor in front of it, on both sides of the wall, whatever the room's shape: room to open a door
      // and walk in; nothing tall before a window
      const level = Math.abs(c[0] - a[0]) >= Math.abs(c[1] - a[1]);
      const half = o.width / 2 + (window ? 0.05 : 0.1), reach = window ? 0.7 : 0.8;
      const zone: Rect = level ? { x0: m[0] - half, x1: m[0] + half, z0: m[1] - reach, z1: m[1] + reach } : { x0: m[0] - reach, x1: m[0] + reach, z0: m[1] - half, z1: m[1] + half };
      (window ? this.glass : this.taken).push(zone);
      // which side of this room's box it is in, if any (it may belong to the room next door)
      const near = (v: number, w: number) => Math.abs(v - w) < 0.2;
      const inX = m[0] > b.minX - 0.1 && m[0] < b.maxX + 0.1, inZ = m[1] > b.minZ - 0.1 && m[1] < b.maxZ + 0.1;
      const side: Side | null = near(m[1], b.minZ) && inX ? 0 : near(m[0], b.maxX) && inZ ? 1 : near(m[1], b.maxZ) && inX ? 2 : near(m[0], b.minX) && inZ ? 3 : null;
      if (side !== null) this.gaps.push({ side, at: side % 2 ? m[1] : m[0], width: o.width, window, high: window && (o.sill ?? 0) >= 1 });
    }
    this.taken.push(...stairs);
    for (const f of floor.furniture) if (f.type !== "stairs" && pointInPolygon([f.x, f.z], room.points)) this.taken.push(footprint(f));
  }

  /** The length of a side, and the two ends of it that furniture can reach (clear of the walls it meets). */
  span(side: Side): [number, number] {
    const b = this.box;
    return side % 2 ? [b.minZ + this.inset[0], b.maxZ - this.inset[2]] : [b.minX + this.inset[3], b.maxX - this.inset[1]];
  }

  /** How far the room reaches from a side to the one across. */
  depth(side: Side): number {
    const b = this.box;
    return (side % 2 ? b.maxX - b.minX : b.maxZ - b.minZ) - this.inset[side] - this.inset[(side + 2) % 4];
  }

  /** A rectangle against a side: its middle `at` along the side, `w` wide, reaching `d` into the room from `from` off the wall's face. */
  rect(side: Side, at: number, w: number, d: number, from = this.inset[side]): Rect {
    const b = this.box;
    if (side === 0) return { x0: at - w / 2, x1: at + w / 2, z0: b.minZ + from, z1: b.minZ + from + d };
    if (side === 2) return { x0: at - w / 2, x1: at + w / 2, z0: b.maxZ - from - d, z1: b.maxZ - from };
    if (side === 1) return { z0: at - w / 2, z1: at + w / 2, x0: b.maxX - from - d, x1: b.maxX - from };
    return { z0: at - w / 2, z1: at + w / 2, x0: b.minX + from, x1: b.minX + from + d };
  }

  /** Whether something can stand there: inside the room, clear of doors, stairs and furniture, and of windows if it is tall. */
  free(r: Rect, tall = false, clear = 0): boolean {
    const pts: Vec2[] = [[r.x0 + 0.01, r.z0 + 0.01], [r.x1 - 0.01, r.z0 + 0.01], [r.x1 - 0.01, r.z1 - 0.01], [r.x0 + 0.01, r.z1 - 0.01], [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2]];
    if (!pts.every((p) => pointInPolygon(p, this.room.points))) return false;
    const b = this.box;
    if (r.x0 < b.minX + this.inset[3] - 0.005 || r.x1 > b.maxX - this.inset[1] + 0.005 || r.z0 < b.minZ + this.inset[0] - 0.005 || r.z1 > b.maxZ - this.inset[2] + 0.005) return false;
    const wide = clear ? grow(r, clear) : r;
    return !this.taken.some((t) => overlap(wide, t)) && !(tall && this.glass.some((g) => overlap(r, g)));
  }

  /**
   * A place for something `w` wide and `d` deep with its back to a side: as near `want` along the side as
   * it is free ("start" and "end": the corners), or null.
   */
  slot(side: Side, w: number, d: number, want: number | "middle" | "start" | "end", tall = false): number | null {
    const [lo, hi] = this.span(side);
    if (hi - lo < w) return null;
    const first = want === "middle" ? (lo + hi) / 2 : want === "start" ? lo + w / 2 : want === "end" ? hi - w / 2 : Math.min(hi - w / 2, Math.max(lo + w / 2, want));
    for (let step = 0; step * 0.1 <= hi - lo; step++) {
      for (const at of step ? [first - step * 0.1, first + step * 0.1] : [first]) {
        if (at - w / 2 < lo - 1e-6 || at + w / 2 > hi + 1e-6) continue;
        if (this.free(this.rect(side, at, w, d), tall)) return at;
      }
    }
    return null;
  }

  /** Stands a piece with its back to a side (its front faces into the room). */
  put(type: string, side: Side, at: number, size?: Partial<Pick<Furniture, "w" | "d">>): Furniture {
    const [w0, d0, h] = furnitureType(type).size;
    const w = size?.w ?? w0, d = size?.d ?? d0;
    const r = this.rect(side, at, w, d);
    return this.add({ id: newId("f"), type, x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2, rotation: side * 90, w, d, h }, r);
  }

  /** Stands a piece in the open, turned by quarter turns; `solid` false for what others may stand on (a rug). */
  stand(type: string, x: number, z: number, rotation: number, size?: Partial<Pick<Furniture, "w" | "d">>, solid = true): Furniture | null {
    const [w0, d0, h] = furnitureType(type).size;
    const item: Furniture = { id: newId("f"), type, x, z, rotation, w: size?.w ?? w0, d: size?.d ?? d0, h };
    const r = footprint(item);
    if (!this.free(r) && solid) return null;
    if (!solid && !pointInPolygon([x, z], this.room.points)) return null;
    return this.add(item, solid ? r : null);
  }

  private add(item: Furniture, r: Rect | null): Furniture {
    const round = (v: number) => Math.round(v * 100) / 100;
    item.x = round(item.x);
    item.z = round(item.z);
    this.floor.furniture.push(item);
    if (r) this.taken.push(r);
    return item;
  }

  /** Where things stand now, to come back to: what was put in after it is taken out again. */
  mark(): () => number {
    const pieces = this.floor.furniture.length, taken = this.taken.length;
    return () => {
      const added = this.floor.furniture.length - pieces;
      this.floor.furniture.length = pieces;
      this.taken.length = taken;
      return added;
    };
  }

  /** Keeps a stretch of floor clear (the way round a bed, the chairs' room at a table). */
  keep(r: Rect): void {
    this.taken.push(r);
  }

  /** The sides, longest first; `score` puts some before others. */
  sides(score: (s: Side) => number = () => 0): Side[] {
    const len = (s: Side) => this.span(s)[1] - this.span(s)[0];
    return [...SIDES].sort((a, b) => score(b) - score(a) || len(b) - len(a));
  }

  has(side: Side, what: "door" | "window" | "high"): boolean {
    return this.gaps.some((g) => g.side === side && (what === "door" ? !g.window : what === "high" ? g.high : g.window));
  }

  /** The point `d` into the room from a side's face, at `at` along it. */
  point(side: Side, at: number, d: number): Vec2 {
    const r = this.rect(side, at, 0, d);
    return side === 0 ? [at, r.z1] : side === 2 ? [at, r.z0] : side === 1 ? [r.x0, at] : [r.x1, at];
  }

  get area(): number {
    const p = this.room.points;
    return Math.abs(p.reduce((s, a, i) => s + a[0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * a[1], 0)) / 2;
  }
}

/** What a piece covers on the plan (pieces here stand at quarter turns). */
function footprint(f: Pick<Furniture, "x" | "z" | "w" | "d" | "rotation">): Rect {
  const turned = Math.round(f.rotation / 90) % 2 !== 0;
  const w = turned ? f.d : f.w, d = turned ? f.w : f.d;
  return { x0: f.x - w / 2, x1: f.x + w / 2, z0: f.z - d / 2, z1: f.z + d / 2 };
}

// ------------------------------------------------------------------ the rooms

function living(s: Space): void {
  // the sofa on a wall with the TV across from it; failing that the sofa alone, a smaller one in a small room
  const plans: [string, number, boolean][] = [["sofa", 2.0, true], ["sofa_2", 1.6, true], ["sofa", 2.0, false], ["sofa_2", 1.6, false]];
  search: for (const [type, w, withTv] of plans) {
    for (const side of s.sides((x) => (s.has(x, "door") ? -1 : 0))) {
      if (s.depth(side) < 2.3) continue;
      const at = s.slot(side, w, 0.9, "middle");
      if (at === null) continue;
      const across = ((side + 2) % 4) as Side;
      const tv = s.slot(across, 1.6, 0.45, at, true);
      const faces = tv !== null && Math.abs(tv - at) < 1.0;
      if (withTv && !faces) continue;
      s.put(type, side, at);
      if (faces) s.put("tv_board", across, tv);
      // a rug and a low table in front of the sofa, where there is the floor for them
      if (s.depth(side) >= 3.0) {
        const [x, z] = s.point(side, at, 0.9 + 0.75);
        s.stand("rug", x, z, side * 90, undefined, false);
        s.stand("coffee_table", x, z, side * 90);
      }
      break search;
    }
  }
  corner(s, "plant", 0.45);
}

/** Something small in the first corner that is free. */
function corner(s: Space, type: string, size: number): void {
  for (const side of s.sides()) for (const end of ["start", "end"] as const) {
    const at = s.slot(side, size, size, end);
    if (at === null) continue;
    const [lo, hi] = s.span(side);
    if (Math.abs(at - (end === "start" ? lo + size / 2 : hi - size / 2)) > 0.05) continue;
    s.put(type, side, at, { w: size, d: size });
    return;
  }
}

/**
 * A table with chairs down its long sides, in the open floor nearest `near` (the middle of the room if not
 * given): along the room if it fits that way, else across it, else a smaller table.
 */
function dining(s: Space, near?: Vec2): void {
  const b = s.box;
  const along = b.maxX - b.minX >= b.maxZ - b.minZ;
  const want = near ?? [(b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2];
  const spots: Vec2[] = [];
  for (let x = b.minX; x <= b.maxX; x += 0.2) for (let z = b.minZ; z <= b.maxZ; z += 0.2) spots.push([x, z]);
  spots.sort((p, q) => Math.hypot(p[0] - want[0], p[1] - want[1]) - Math.hypot(q[0] - want[0], q[1] - want[1]));
  for (const [tw, td, level] of [[1.6, 0.9, along], [1.6, 0.9, !along], [1.2, 0.8, along], [1.2, 0.8, !along]] as const) {
    // the chairs need their room on both sides of the table, and a little at its ends
    const lx = level ? tw : td, lz = level ? td : tw;
    const cx = level ? 0.15 : 0.7, cz = level ? 0.7 : 0.15;
    for (const [x, z] of spots) {
      const whole: Rect = { x0: x - lx / 2 - cx, x1: x + lx / 2 + cx, z0: z - lz / 2 - cz, z1: z + lz / 2 + cz };
      if (!s.free(whole) || !s.stand("table", x, z, level ? 0 : 90, { w: tw, d: td })) continue;
      // each chair faces the table, just clear of its edge
      const out = td / 2 + 0.27;
      for (const k of tw > 1.4 ? [-0.4, 0.4] : [0]) for (const far of [-1, 1]) {
        if (level) s.stand("chair", x + k, z + far * out, far < 0 ? 0 : 180);
        else s.stand("chair", x + far * out, z + k, far < 0 ? 270 : 90);
      }
      s.keep(whole);
      return;
    }
  }
}

/**
 * A run of units along one wall: the sink under the window, a cooker, a fridge at an end. The longest
 * run the walls allow wins, and one with the window over it before one without.
 */
function kitchen(s: Space): Side | null {
  const U = 0.6;
  let best: { side: Side; first: number; n: number; score: number } | null = null;
  for (const side of SIDES) {
    const [lo, hi] = s.span(side);
    for (let first = lo; first + 2 * U <= hi + 1e-6; first += 0.1) {
      let n = 0;
      while (n < 7 && first + (n + 1) * U <= hi + 1e-6 && s.free(s.rect(side, first + (n + 0.5) * U, U, 0.65))) n++;
      const score = n * 10 + (s.has(side, "high") ? 6 : 0) - (s.has(side, "door") ? 1 : 0) - (first - lo);
      // a sink and a cooker at the least
      if (n >= 2 && (!best || score > best.score)) best = { side, first, n, score };
    }
  }
  if (!best) return null;
  const { side, first, n } = best;
  const middle = (i: number) => first + (i + 0.5) * U;
  const window = s.gaps.find((g) => g.side === side && g.window);
  const under = (i: number) => !!window && Math.abs(middle(i) - window.at) < window.width / 2 + U / 2;
  const cells = new Array<string>(n).fill("kitchen");
  // the sink under the window (the middle of the run without one), the fridge at an end clear of the window, the cooker away from both
  const sink = window ? [...cells.keys()].sort((i, j) => Math.abs(middle(i) - window.at) - Math.abs(middle(j) - window.at))[0] : Math.floor(n / 2);
  cells[sink] = "sink";
  const end = [0, n - 1].find((i) => i !== sink && !under(i) && s.free(s.rect(side, middle(i), U, 0.65), true));
  if (end !== undefined && n >= 4) cells[end] = "fridge";
  const cooker = [...cells.keys()].filter((i) => cells[i] === "kitchen").sort((i, j) => Math.abs(j - sink) - Math.abs(i - sink) || Number(under(i)) - Number(under(j)))[0];
  if (cooker !== undefined) cells[cooker] = "stove";
  cells.forEach((type, i) => s.put(type, side, middle(i), { w: U }));
  return side;
}

function bedroom(s: Space, main: boolean): void {
  const b = s.box;
  const least = Math.min(b.maxX - b.minX, b.maxZ - b.minZ);
  const first = s.area < 7.5 || least < 2.4 ? "bed_single" : main && least >= 3.3 ? "bed_king" : "bed";
  // the head against a wall without the door, with room to walk past the foot; a single bed in a corner,
  // in a box room from wall to wall. A smaller bed where the one the room deserves finds no place
  let bedSide: Side | null = null;
  search: for (const type of [...new Set([first, "bed", "bed_single"])]) {
    const [w, d] = furnitureType(type).size;
    const single = type === "bed_single";
    for (const side of s.sides((x) => (s.has(x, "door") ? -2 : 0) - (s.has(x, "window") ? 1 : 0))) {
      if (s.depth(side) < d + (single ? 0.02 : 0.5)) continue;
      const at = single ? s.slot(side, w, d, "start") ?? s.slot(side, w, d, "end") : s.slot(side, w, d, "middle");
      if (at === null) continue;
      s.put(type, side, at);
      bedSide = side;
      for (const k of single ? [1, -1] : [-1, 1]) {
        const t = at + k * (w / 2 + 0.05 + 0.225);
        if (s.free(s.rect(side, t, 0.45, 0.4))) {
          s.put("nightstand", side, t);
          if (single) break;
        }
      }
      // the way round the bed stays clear
      s.keep(grow(s.rect(side, at, w, d), single ? 0.3 : 0.45));
      break search;
    }
  }
  // the wardrobe on another wall, away from the windows
  for (const ww of s.area < 8 ? [1.0] : [1.5, 1.0]) {
    for (const side of s.sides((x) => (x === bedSide ? -3 : 0) - (s.has(x, "window") ? 1 : 0))) {
      const at = s.slot(side, ww, 0.6, "start", true) ?? s.slot(side, ww, 0.6, "end", true);
      if (at === null) continue;
      s.put("wardrobe", side, at, { w: ww });
      return;
    }
  }
}

function bathroom(s: Space, kind: "bathroom" | "ensuite" | "wc"): void {
  const b = s.box;
  const most = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
  const small = () => {
    for (const [type, w, d] of [["wc", 0.4, 0.65], ["washbasin", 0.6, 0.45]] as const) {
      for (const side of s.sides((x) => (s.has(x, "door") ? -1 : 0))) {
        const at = s.slot(side, w + 0.1, d, "end") ?? s.slot(side, w + 0.1, d, "start");
        if (at === null) continue;
        s.put(type, side, at);
        // room to stand in front of it
        s.keep(s.rect(side, at, w + 0.1, d + 0.35));
        break;
      }
    }
  };
  // a bath along a wall where the room is long enough for one, else a shower in a corner
  const big = () => {
    if (kind === "bathroom" && most >= 2.1) {
      for (const side of s.sides()) {
        const at = s.slot(side, 1.7, 0.75, "start") ?? s.slot(side, 1.7, 0.75, "end");
        if (at === null) continue;
        s.put("bathtub", side, at);
        return;
      }
    }
    for (const side of s.sides()) {
      const at = s.slot(side, 0.9, 0.9, "start", true) ?? s.slot(side, 0.9, 0.9, "end", true);
      if (at === null) continue;
      s.put("shower", side, at);
      return;
    }
  };
  if (kind === "wc") return small();
  // the bath first, the toilet and basin in what is left; the other way round only if that gets more in
  const back = s.mark();
  big();
  small();
  const first = back();
  small();
  big();
  if (first >= 3 || back() <= first) {
    big();
    small();
  } else {
    small();
    big();
  }
}

function study(s: Space): void {
  // the desk under the window if it fits there, the chair in front of it
  for (const side of s.sides((x) => (s.has(x, "window") ? 2 : 0) - (s.has(x, "door") ? 2 : 0))) {
    const window = s.gaps.find((g) => g.side === side && g.window);
    const at = s.slot(side, 1.4, 0.7, window ? window.at : "middle");
    if (at === null || s.depth(side) < 1.8) continue;
    s.put("desk", side, at);
    const [x, z] = s.point(side, at, 0.7 + 0.4);
    s.stand("office_chair", x, z, (side * 90 + 180) % 360);
    break;
  }
  for (const side of s.sides()) {
    const at = s.slot(side, 0.9, 0.35, "start", true);
    if (at === null) continue;
    s.put("bookcase", side, at, { w: 0.9 });
    break;
  }
}

function utility(s: Space): void {
  for (const side of s.sides((x) => (s.has(x, "door") ? -1 : 0))) {
    const at = s.slot(side, 1.25, 0.6, "start") ?? s.slot(side, 1.25, 0.6, "end");
    if (at === null) continue;
    s.put("washer", side, at - 0.325);
    s.put("dryer", side, at + 0.325);
    break;
  }
}

/**
 * Furnishes every room of the plan whose kind `kindOf` knows from its name (halls and landings stay
 * clear). Call it on the plan as it will be used: fitted to its size and mirrored.
 */
export function furnish(plan: Plan, kindOf: (name: string) => RoomKind | null): void {
  // rooms a table to eat at could still go in, should the home have no dining room: kitchens first
  const eatIn: Space[] = [];
  plan.floors.forEach((floor, fi) => {
    // the flight on this storey and the hole of the flight coming up from below, each with the floor to step
    // on and off it: in the way only in the room they are in
    const flights = [...floor.furniture, ...(plan.floors[fi - 1]?.furniture ?? [])].filter((x) => x.type === "stairs");
    for (const room of floor.rooms) {
      const kind = kindOf(room.name);
      if (!kind) continue;
      const stairs = flights.filter((x) => pointInPolygon([x.x, x.z], room.points)).map((x) => grow(footprint(x), 0.9));
      const s = new Space(floor, room, plan, stairs);
      if (kind === "living") {
        // one big room to live, cook and eat in gets its kitchen too
        if (s.area >= 26 && s.gaps.some((g) => g.high)) kitchen(s);
        living(s);
        eatIn.push(s);
      } else if (kind === "dining") dining(s);
      else if (kind === "kitchen") {
        kitchen(s);
        eatIn.unshift(s);
      } else if (kind === "bedroom" || kind === "main-bedroom") bedroom(s, kind === "main-bedroom");
      else if (kind === "bathroom" || kind === "ensuite" || kind === "wc") bathroom(s, kind);
      else if (kind === "study") study(s);
      else utility(s);
    }
  });
  const table = () => plan.floors.some((f) => f.furniture.some((x) => x.type === "table"));
  for (const s of eatIn) {
    if (table()) break;
    dining(s);
  }
}
