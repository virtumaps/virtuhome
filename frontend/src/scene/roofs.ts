// Roofs over the plan's walls, in the UK's usual shapes, and what sits on them: roof windows,
// chimneys, dormers, solar panels and roof lanterns.
//
// A roof covers a rectangle of walls. Each slope is a plane rising from its eave (a line along the
// outside face of a wall), and the roof is the lowest of its planes at every point (the highest, for
// a butterfly's valley), so ridges, hips and valleys follow by themselves. A slope's face is where
// its plane is the lowest: a convex polygon, the roof's outline clipped by one half-plane per other
// plane. Walls fill up to the roof wherever it rises above them (gables, a lean-to's back, a
// butterfly's front), and fascias and soffits finish its edges. A dormer and a lantern are small
// roofs of their own, built the same way.
import { PANEL, panelOf, solarSize, type Floor, type Plan, type Roof, type RoofItem, type RoofShape, type Vec2 } from "../model/plan";
import { pointInPolygon } from "../model/geom";
import { EXTERIOR_FINISHES, JOINERY_FINISHES, parseHex, ROOF_COVERINGS, type FinishDef } from "./finishes";
import { ROOM_OUTSIDE, type Geo, type V3 } from "./geo";
import type { GlowSlot } from "./build";
import type { PlainKey } from "../i18n";

/** A slope: its height above the eaves is h0 + k * (c - n . p) at a point p of the roof's frame, n being its eave's outward normal. */
export interface RoofPlane {
  n: Vec2;
  c: number;
  k: number;
  h0: number;
}

/** A part of the outline whose height comes from the same planes. */
interface Zone {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  planes: RoofPlane[];
  /** The highest plane wins (a butterfly), not the lowest. */
  max: boolean;
}

export interface RoofFace {
  zone: number;
  plane: RoofPlane;
  /** Corners in the roof's frame (u along the ridge, v across it), going round. */
  poly: Vec2[];
}

export interface Sides {
  left: boolean;
  right: boolean;
  back: boolean;
  front: boolean;
}

export interface RoofModel {
  roof: Roof;
  /** The eaves' height (world y). */
  base: number;
  /** Half the walls' outside size along the ridge (A) and across it (B). */
  A: number;
  B: number;
  /** The roof's outline in its frame, eaves and verges included. */
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  zones: Zone[];
  faces: RoofFace[];
  /** Vertical thickness. */
  T: number;
  /** Sides standing against a taller wall: nothing is drawn there. */
  abut: Sides;
  /** Party ends (left, right): cut off flush, carrying on next door. */
  party: { left: boolean; right: boolean };
  /** Dutch gables: where each gablet stands, and its foot's height. */
  gablets: { u: number; foot: number; outward: number }[];
  /** The roof's frame on the plan. */
  cos: number;
  sin: number;
  glass: boolean;
}

/** A shape's usual slope (degrees) and covering, for new roofs. */
export const ROOF_SHAPES: Record<RoofShape, { label: PlainKey; pitch: number; hint: PlainKey }> = {
  gable: { label: "roofShape.gable", pitch: 35, hint: "roofShape.gable.hint" },
  hip: { label: "roofShape.hip", pitch: 35, hint: "roofShape.hip.hint" },
  half_hip: { label: "roofShape.half_hip", pitch: 40, hint: "roofShape.half_hip.hint" },
  dutch: { label: "roofShape.dutch", pitch: 35, hint: "roofShape.dutch.hint" },
  pyramid: { label: "roofShape.pyramid", pitch: 35, hint: "roofShape.pyramid.hint" },
  mansard: { label: "roofShape.mansard", pitch: 25, hint: "roofShape.mansard.hint" },
  gambrel: { label: "roofShape.gambrel", pitch: 30, hint: "roofShape.gambrel.hint" },
  lean_to: { label: "roofShape.lean_to", pitch: 15, hint: "roofShape.lean_to.hint" },
  flat: { label: "roofShape.flat", pitch: 0, hint: "roofShape.flat.hint" },
  butterfly: { label: "roofShape.butterfly", pitch: 12, hint: "roofShape.butterfly.hint" },
  m_shaped: { label: "roofShape.m_shaped", pitch: 35, hint: "roofShape.m_shaped.hint" },
};

export const ROOF_SHAPE_ORDER = Object.keys(ROOF_SHAPES) as RoofShape[];

const RAD = Math.PI / 180;
/** A flat roof's deck stands this far over the walls. */
const FLAT_TOP = 0.2;

export const planeHeight = (p: RoofPlane, u: number, v: number): number => p.h0 + p.k * (p.c - (p.n[0] * u + p.n[1] * v));

function zoneHeight(z: Zone, u: number, v: number): number {
  let h = z.max ? -Infinity : Infinity;
  for (const p of z.planes) {
    const y = planeHeight(p, u, v);
    if (z.max ? y > h : y < h) h = y;
  }
  return h;
}

/** The zone holding a point of the roof's frame (the nearest, just outside). */
function zoneAt(m: RoofModel, u: number, v: number): number {
  let best = 0, bestD = Infinity;
  m.zones.forEach((z, i) => {
    const d = Math.max(z.u0 - u, u - z.u1, 0) + Math.max(z.v0 - v, v - z.v1, 0);
    if (d < bestD - 1e-9) {
      best = i;
      bestD = d;
    }
  });
  return best;
}

/** The roof's height above its eaves at a point of its frame. */
export function roofHeight(m: RoofModel, u: number, v: number): number {
  return zoneHeight(m.zones[zoneAt(m, u, v)], u, v);
}

/** A plan point in the roof's frame. */
export function toRoofFrame(m: RoofModel, p: Vec2): Vec2 {
  const dx = p[0] - m.roof.x, dz = p[1] - m.roof.z;
  return [m.cos * dx + m.sin * dz, -m.sin * dx + m.cos * dz];
}

/** A point of the roof's frame on the plan. */
export function fromRoofFrame(m: RoofModel, u: number, v: number): Vec2 {
  return [m.roof.x + m.cos * u - m.sin * v, m.roof.z + m.sin * u + m.cos * v];
}

/** A direction of the roof's frame on the plan. */
const dirOf = (m: RoofModel, du: number, dv: number): Vec2 => [m.cos * du - m.sin * dv, m.sin * du + m.cos * dv];

export interface RoofOptions {
  /** Half the outside walls' thickness: the roof reaches the walls' outside faces. */
  wallHalf: number;
  /** Sides that stand against a taller wall. */
  abut?: Partial<Sides>;
  /** Lifts the whole roof a hair (overlapping roofs never share a plane). */
  lift?: number;
}

/** A roof's planes, outline and faces. `base` is its eaves' height (world y). */
export function roofModel(r: Roof, base: number, opt: RoofOptions): RoofModel {
  const t = opt.wallHalf;
  const A = Math.max(0.1, r.w / 2 + t), B = Math.max(0.1, r.d / 2 + t);
  const shape = r.shape;
  const glass = r.covering === "glass";
  const pitch = Math.max(0, Math.min(75, shape === "flat" ? 0 : r.pitch || ROOF_SHAPES[shape]?.pitch || 35));
  const tan = Math.tan(pitch * RAD);
  const party = { left: r.party === "left" || r.party === "both", right: r.party === "right" || r.party === "both" };
  const abut: Sides = { left: false, right: false, back: false, front: false, ...opt.abut };
  const oh = Math.max(0, r.overhang ?? (shape === "flat" ? (r.parapet ? 0 : 0.1) : glass ? 0.08 : 0.3));
  const verge = Math.min(oh, 0.15);
  const hipped = shape === "hip" || shape === "pyramid" || shape === "mansard" || shape === "dutch";
  // how far the outline reaches past the walls on each side
  const reach = (side: keyof Sides, normal: number): number => {
    if (abut[side]) return -0.02;
    if ((side === "left" && party.left) || (side === "right" && party.right)) return 0;
    if (shape === "flat" && r.parapet) return 0;
    // a flat roof's edge stands proud of the wall under it, never in its plane
    if (shape === "flat") return Math.max(0.03, normal);
    return normal;
  };
  const oL = reach("left", hipped ? oh : verge);
  const oR = reach("right", hipped ? oh : verge);
  const oB = reach("back", shape === "lean_to" ? Math.min(oh, 0.1) : oh);
  const oF = reach("front", oh);
  const u0 = -A - oL, u1 = A + oR, v0 = -B - oB, v1 = B + oF;

  const front: RoofPlane = { n: [0, 1], c: B, k: tan, h0: 0 };
  const back: RoofPlane = { n: [0, -1], c: B, k: tan, h0: 0 };
  const left = (k: number, h0 = 0): RoofPlane => ({ n: [-1, 0], c: A, k, h0 });
  const right = (k: number, h0 = 0): RoofPlane => ({ n: [1, 0], c: A, k, h0 });
  const ends = (k: number, h0 = 0): RoofPlane[] => [...(party.left ? [] : [left(k, h0)]), ...(party.right ? [] : [right(k, h0)])];
  const whole = (planes: RoofPlane[], max = false): Zone[] => [{ u0, u1, v0, v1, planes, max }];
  const gablets: RoofModel["gablets"] = [];
  let zones: Zone[];
  switch (shape) {
    case "hip":
      zones = whole([front, back, ...ends(tan)]);
      break;
    case "pyramid":
      zones = whole([front, back, ...ends((tan * B) / A)]);
      break;
    case "half_hip":
      // the top half of each gable leans back
      zones = whole([front, back, ...ends(tan, 0.5 * B * tan)]);
      break;
    case "dutch": {
      // hipped up to a gablet set back from each end
      const s = Math.min(0.55 * B, A - 0.25);
      if (s < 0.3) {
        zones = whole([front, back, ...ends(tan)]);
        break;
      }
      const ul = party.left ? u0 : -A + s, ur = party.right ? u1 : A - s;
      zones = [{ u0: ul, u1: ur, v0, v1, planes: [front, back], max: false }];
      if (!party.left) {
        zones.push({ u0, u1: ul, v0, v1, planes: [front, back, left(tan)], max: false });
        gablets.push({ u: ul, foot: s * tan, outward: -1 });
      }
      if (!party.right) {
        zones.push({ u0: ur, u1, v0, v1, planes: [front, back, right(tan)], max: false });
        gablets.push({ u: ur, foot: s * tan, outward: 1 });
      }
      break;
    }
    case "mansard":
    case "gambrel": {
      const lower = Math.tan((shape === "mansard" ? 70 : 60) * RAD);
      const q = Math.max(0.35, Math.min(shape === "mansard" ? 1.0 : 1.3, Math.min(A, B) * (shape === "mansard" ? 0.3 : 0.28)));
      const pair = (p: RoofPlane): RoofPlane[] => [{ ...p, k: lower, h0: 0 }, { ...p, k: tan, h0: q * lower - q * tan }];
      const sides = [front, back, ...(shape === "mansard" ? ends(tan) : [])];
      zones = whole(sides.flatMap(pair));
      break;
    }
    case "lean_to":
      zones = whole([front]);
      break;
    case "flat":
      zones = whole([{ n: [0, 1], c: 0, k: 0, h0: FLAT_TOP }]);
      break;
    case "butterfly":
      zones = whole([{ n: [0, -1], c: 0, k: tan, h0: 0 }, { n: [0, 1], c: 0, k: tan, h0: 0 }], true);
      break;
    case "m_shaped":
      zones = [
        { u0, u1, v0: 0, v1, planes: [front, { n: [0, -1], c: 0, k: tan, h0: 0 }], max: false },
        { u0, u1, v0, v1: 0, planes: [back, { n: [0, 1], c: 0, k: tan, h0: 0 }], max: false },
      ];
      break;
    default:
      zones = whole([front, back]);
  }
  const lift = opt.lift ?? 0;
  if (lift) zones = zones.map((z) => ({ ...z, planes: z.planes.map((p) => ({ ...p, h0: p.h0 + lift })) }));
  const rad = (r.rotation ?? 0) * RAD;
  const m: RoofModel = {
    roof: r, base, A, B, u0, u1, v0, v1, zones, faces: [], abut, party, gablets: gablets.map((g) => ({ ...g, foot: g.foot + lift })),
    T: glass ? 0.07 : shape === "flat" ? 0.3 : 0.2,
    cos: Math.cos(rad), sin: Math.sin(rad), glass,
  };
  m.faces = zones.flatMap((z, zi) => z.planes.map((plane, pi) => {
    const others = z.planes.filter((_, j) => j !== pi);
    // where this plane is the lowest (or highest): plane_j - plane_i >= 0 for every other j
    const poly = clipPolygon([[z.u0, z.v0], [z.u1, z.v0], [z.u1, z.v1], [z.u0, z.v1]], others.map((o) => (p: Vec2) => {
      const d = planeHeight(o, p[0], p[1]) - planeHeight(plane, p[0], p[1]);
      return z.max ? -d : d;
    }));
    return { zone: zi, plane, poly };
  })).filter((f) => f.poly.length >= 3 && polyArea(f.poly) > 1e-4);
  return m;
}

/** The highest point of a roof above its eaves. */
export function ridgeHeight(m: RoofModel): number {
  let top = 0;
  for (const f of m.faces) for (const [u, v] of f.poly) top = Math.max(top, planeHeight(f.plane, u, v));
  return top;
}

/** The face under a point of the roof's frame: the one holding it, else the nearest. */
export function faceAt(m: RoofModel, u: number, v: number): RoofFace | null {
  let best: RoofFace | null = null, bestD = Infinity;
  const zi = zoneAt(m, u, v);
  for (const f of m.faces) {
    if (f.zone !== zi) continue;
    if (pointInPolygon([u, v], f.poly)) return f;
    const c = f.poly.reduce((s, p) => [s[0] + p[0] / f.poly.length, s[1] + p[1] / f.poly.length], [0, 0]);
    const d = Math.hypot(c[0] - u, c[1] - v);
    if (d < bestD) {
      best = f;
      bestD = d;
    }
  }
  return best;
}

/** Slope in degrees and the plan direction a face looks down to (unit, plan x and z). */
export function faceSlope(m: RoofModel, f: RoofFace): { tilt: number; down: Vec2 } {
  const tilt = Math.atan(f.plane.k) / RAD;
  const d = dirOf(m, f.plane.n[0], f.plane.n[1]);
  return { tilt, down: f.plane.k > 1e-6 ? d : [0, 1] };
}

/** World normal of a face (pointing up out of the roof). */
export function faceNormal(m: RoofModel, f: RoofFace): V3 {
  const k = f.plane.k;
  const [x, z] = dirOf(m, k * f.plane.n[0], k * f.plane.n[1]);
  const l = Math.hypot(x, 1, z);
  return [x / l, 1 / l, z / l];
}

// -------------------------------------------------------------------------- polygons

/** The part of a convex polygon where every function is >= 0 (each a half-plane). */
function clipPolygon(pts: Vec2[], planes: ((p: Vec2) => number)[]): Vec2[] {
  let out = pts;
  for (const f of planes) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i], prev = input[(i + input.length - 1) % input.length];
      const fc = f(cur), fp = f(prev);
      if (fc >= -1e-9) {
        if (fp < -1e-9) out.push(cut(prev, cur, fp, fc));
        out.push(cur);
      } else if (fp >= -1e-9) out.push(cut(prev, cur, fp, fc));
    }
    if (out.length < 3) return [];
  }
  const clean: Vec2[] = [];
  for (const p of out) {
    const q = clean[clean.length - 1];
    if (!q || Math.abs(q[0] - p[0]) > 1e-7 || Math.abs(q[1] - p[1]) > 1e-7) clean.push(p);
  }
  while (clean.length > 1 && Math.abs(clean[0][0] - clean[clean.length - 1][0]) < 1e-7 && Math.abs(clean[0][1] - clean[clean.length - 1][1]) < 1e-7) clean.pop();
  return clean;
}

function cut(a: Vec2, b: Vec2, fa: number, fb: number): Vec2 {
  const t = fa / (fa - fb);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function polyArea(p: Vec2[]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length];
    a += p[i][0] * q[1] - q[0] * p[i][1];
  }
  return Math.abs(a) / 2;
}

/**
 * The roof's height along a straight line of its frame, from a to b: pieces [t0, t1, y0, y1]
 * (t in metres from a), straight within each, split where planes or zones change.
 */
export function profile(m: RoofModel, a: Vec2, b: Vec2, extra: number[] = []): [number, number, number, number][] {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (len < 1e-6) return [];
  const du = (b[0] - a[0]) / len, dv = (b[1] - a[1]) / len;
  const ts = new Set<number>([0, len, ...extra.filter((t) => t > 0 && t < len)]);
  const along = (fixed: number, start: number, dir: number) => {
    if (Math.abs(dir) < 1e-9) return;
    const t = (fixed - start) / dir;
    if (t > 1e-6 && t < len - 1e-6) ts.add(t);
  };
  for (const z of m.zones) {
    along(z.u0, a[0], du);
    along(z.u1, a[0], du);
    along(z.v0, a[1], dv);
    along(z.v1, a[1], dv);
    for (let i = 0; i < z.planes.length; i++) {
      for (let j = i + 1; j < z.planes.length; j++) {
        // where planes i and j are level along the line
        const p = z.planes[i], q = z.planes[j];
        const h0 = planeHeight(p, a[0], a[1]) - planeHeight(q, a[0], a[1]);
        const slope = -p.k * (p.n[0] * du + p.n[1] * dv) + q.k * (q.n[0] * du + q.n[1] * dv);
        if (Math.abs(slope) < 1e-9) continue;
        const t = -h0 / slope;
        if (t > 1e-6 && t < len - 1e-6) ts.add(t);
      }
    }
  }
  const sorted = [...ts].sort((x, y) => x - y);
  const out: [number, number, number, number][] = [];
  for (let i = 0; i + 1 < sorted.length; i++) {
    const t0 = sorted[i], t1 = sorted[i + 1];
    if (t1 - t0 < 1e-6) continue;
    const tm = (t0 + t1) / 2;
    const z = m.zones[zoneAt(m, a[0] + du * tm, a[1] + dv * tm)];
    out.push([t0, t1, zoneHeight(z, a[0] + du * t0, a[1] + dv * t0), zoneHeight(z, a[0] + du * t1, a[1] + dv * t1)]);
  }
  return out;
}

// -------------------------------------------------------------------------- the plan's roofs

/**
 * Which sides of a roof stand against a storey above it (a lean-to against the house): a point
 * just past the side's middle that lies in a room of a higher storey.
 */
export function abutting(plan: Plan, fi: number, r: Roof): Sides {
  const higher = plan.floors.slice(fi + 1).flatMap((f) => f.rooms);
  const t = plan.settings.wall_exterior / 2;
  const rad = (r.rotation ?? 0) * RAD, c = Math.cos(rad), s = Math.sin(rad);
  const at = (u: number, v: number): Vec2 => [r.x + c * u - s * v, r.z + s * u + c * v];
  const inside = (p: Vec2) => higher.some((room) => pointInPolygon(p, room.points));
  const A = r.w / 2 + t + 0.3, B = r.d / 2 + t + 0.3;
  const test = (pts: Vec2[]) => pts.filter(inside).length >= 2;
  return {
    left: test([at(-A, 0), at(-A, -r.d / 4), at(-A, r.d / 4)]),
    right: test([at(A, 0), at(A, -r.d / 4), at(A, r.d / 4)]),
    back: test([at(0, -B), at(-r.w / 4, -B), at(r.w / 4, -B)]),
    front: test([at(0, B), at(-r.w / 4, B), at(r.w / 4, B)]),
  };
}

/** The models of a storey's roofs, eaves on its walls. */
export function floorRoofs(plan: Plan, fi: number): RoofModel[] {
  const floor = plan.floors[fi];
  return (floor.roofs ?? []).map((r, k) => roofModel(r, floor.elevation + (r.eaves ?? floor.height), {
    wallHalf: plan.settings.wall_exterior / 2,
    abut: abutting(plan, fi, r),
    // later roofs a hair above earlier ones: two never share a plane
    lift: k * 0.002,
  }));
}

/** Where an item stands on its roof: the face, its frame (across, up the slope, out) and its middle. */
export interface ItemFrame {
  face: RoofFace;
  /** Unit vectors (world): across the slope, up it, and out of the roof. */
  e1: V3;
  e2: V3;
  n: V3;
  /** Its middle on the roof (world). */
  c: V3;
  slope: number;
}

export function itemFrame(m: RoofModel, it: Pick<RoofItem, "x" | "z" | "rotation">): ItemFrame | null {
  const [u, v] = toRoofFrame(m, [it.x, it.z]);
  const face = faceAt(m, u, v);
  if (!face) return null;
  const y = m.base + planeHeight(face.plane, u, v);
  const k = face.plane.k;
  if (k > 0.03) {
    const th = Math.atan(k);
    const up = dirOf(m, -face.plane.n[0], -face.plane.n[1]);
    const across = dirOf(m, -face.plane.n[1], face.plane.n[0]);
    return {
      face, slope: th / RAD, c: [it.x, y, it.z],
      e1: [across[0], 0, across[1]],
      e2: [up[0] * Math.cos(th), Math.sin(th), up[1] * Math.cos(th)],
      n: [-up[0] * Math.sin(th), Math.cos(th), -up[1] * Math.sin(th)],
    };
  }
  // level: turned like furniture, its back as "up"
  const r = (it.rotation ?? m.roof.rotation ?? 0) * RAD;
  return { face, slope: 0, c: [it.x, y, it.z], e1: [Math.cos(r), 0, Math.sin(r)], e2: [Math.sin(r), 0, -Math.cos(r)], n: [0, 1, 0] };
}

/** A face's compass bearing (degrees) that it looks down to, with the plan's north. */
export function faceBearing(m: RoofModel, f: RoofFace, north: number): number {
  const [dx, dz] = faceSlope(m, f).down;
  return (((north + (Math.atan2(dx, -dz) * 180) / Math.PI) % 360) + 360) % 360;
}

/** A face's polygon in an item frame's terms: across the slope and up it (metres along the slope). */
function faceInFrame(m: RoofModel, f: RoofFace, fr: ItemFrame): Vec2[] {
  const k = f.plane.k;
  const sec = Math.sqrt(1 + k * k);
  return f.poly.map(([u, v]) => {
    const [x, z] = fromRoofFrame(m, u, v);
    const dx = x - fr.c[0], dz = z - fr.c[2];
    const a = dx * fr.e1[0] + dz * fr.e1[2];
    const hb = Math.hypot(fr.e2[0], fr.e2[2]) || 1;
    const b = ((dx * fr.e2[0] + dz * fr.e2[2]) / hb) * (k > 0.03 ? sec : 1);
    return [a, b];
  });
}

/** Across-the-slope extent of a convex polygon at height b (null outside it). */
function spanAt(poly: Vec2[], b: number): [number, number] | null {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    if ((p[1] - b) * (q[1] - b) > 0) continue;
    if (Math.abs(q[1] - p[1]) < 1e-9) {
      lo = Math.min(lo, p[0], q[0]);
      hi = Math.max(hi, p[0], q[0]);
      continue;
    }
    const a = p[0] + ((b - p[1]) / (q[1] - p[1])) * (q[0] - p[0]);
    lo = Math.min(lo, a);
    hi = Math.max(hi, a);
  }
  return lo <= hi ? [lo, hi] : null;
}

/**
 * The most panels of `panel`'s size that fit on a face, keeping `margin` from its edges (and from
 * roof windows, chimneys and dormers on it): columns, rows, and the array's middle on the plan.
 */
export function fitPanels(m: RoofModel, f: RoofFace, portrait = true, panel: { long: number; short: number } = PANEL, margin = 0.3): { cols: number; rows: number; x: number; z: number } | null {
  const c = f.poly.reduce((s, p) => [s[0] + p[0] / f.poly.length, s[1] + p[1] / f.poly.length], [0, 0]);
  const at = fromRoofFrame(m, c[0], c[1]);
  const fr = itemFrame(m, { x: at[0], z: at[1] });
  if (!fr || fr.face !== f) return null;
  const poly = faceInFrame(m, f, fr);
  const pw = (portrait ? panel.short : panel.long) + PANEL.gap, ph = (portrait ? panel.long : panel.short) + PANEL.gap;
  // what else is on this face, as boxes in the same terms, to keep clear of
  const blocks = (m.roof.items ?? []).filter((it) => it.kind !== "solar").flatMap((it) => {
    const [iu, iv] = toRoofFrame(m, [it.x, it.z]);
    if (faceAt(m, iu, iv) !== f) return [];
    const dx = it.x - fr.c[0], dz = it.z - fr.c[2];
    const hb = Math.hypot(fr.e2[0], fr.e2[2]) || 1;
    const a = dx * fr.e1[0] + dz * fr.e1[2];
    const b = ((dx * fr.e2[0] + dz * fr.e2[2]) / hb) * Math.sqrt(1 + f.plane.k ** 2);
    const r = Math.max(it.w, it.d) / 2 + 0.25;
    return [[a - r, a + r, b - r, b + r]];
  });
  const bs = poly.map((p) => p[1]);
  const lo = Math.min(...bs) + margin, hi = Math.max(...bs) - margin;
  let best: { cols: number; rows: number; a: number; b: number } | null = null;
  for (let rows = Math.floor((hi - lo + PANEL.gap) / ph); rows >= 1; rows--) {
    const H = rows * ph - PANEL.gap;
    for (let b0 = lo; b0 + H <= hi + 1e-9; b0 += 0.05) {
      const s0 = spanAt(poly, b0), s1 = spanAt(poly, b0 + H);
      if (!s0 || !s1) continue;
      let a0 = Math.max(s0[0], s1[0]) + margin, a1 = Math.min(s0[1], s1[1]) - margin;
      // stop short of anything in the way
      for (const [x0, x1, y0, y1] of blocks) {
        if (y1 < b0 || y0 > b0 + H) continue;
        if ((x0 + x1) / 2 < (a0 + a1) / 2) a0 = Math.max(a0, x1);
        else a1 = Math.min(a1, x0);
      }
      const cols = Math.floor((a1 - a0 + PANEL.gap) / pw);
      if (cols < 1) continue;
      // the most panels; of as many, the fewest rows (one long row looks neater)
      if (!best || cols * rows > best.cols * best.rows || (cols * rows === best.cols * best.rows && rows < best.rows)) best = { cols, rows, a: (a0 + a1) / 2, b: b0 + H / 2 };
    }
  }
  if (!best) return null;
  const k = f.plane.k;
  const hb = Math.hypot(fr.e2[0], fr.e2[2]) || 1;
  const along = best.b / (k > 0.03 ? Math.sqrt(1 + k * k) : 1);
  const x = fr.c[0] + fr.e1[0] * best.a + (fr.e2[0] / hb) * along;
  const z = fr.c[2] + fr.e1[2] * best.a + (fr.e2[2] / hb) * along;
  return { cols: best.cols, rows: best.rows, x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 };
}

/** The sunniest face for panels: looking nearest the equator, among those big enough. */
export function sunniestFace(m: RoofModel, north: number, southern = false): RoofFace | null {
  const want = southern ? 0 : 180;
  let best: RoofFace | null = null, bestScore = -Infinity;
  for (const f of m.faces) {
    const area = polyArea(f.poly) * Math.sqrt(1 + f.plane.k ** 2);
    if (area < 3) continue;
    const off = f.plane.k < 0.05 ? 60 : Math.abs(((faceBearing(m, f, north) - want + 540) % 360) - 180);
    const score = -off + Math.min(10, area / 3);
    if (score > bestScore) {
      best = f;
      bestScore = score;
    }
  }
  return best;
}

// -------------------------------------------------------------------------- drawing

/** What drawing a roof needs from the floor's build. */
export interface RoofDraw {
  geo: Geo;
  glass: Geo;
  /** A day colour (sRGB hex) as linear RGB in the palette's mood. */
  colour(hex: number, outside?: boolean): V3;
  /** The storey's outside walls. */
  exterior: { surf: string; col: V3 };
  glows: GlowSlot[];
  /** The room under a plan point (roof windows light up with it). */
  roomAt(p: Vec2): number;
  low: boolean;
}

type Look = { surf: string; col: V3 };

function covering(r: Roof): FinishDef {
  return (ROOF_COVERINGS as Record<string, FinishDef>)[r.covering] ?? ROOF_COVERINGS.concrete_tiles;
}

/** The covering's colour (a picked one where it takes one). */
export function coveringHex(r: Roof): number {
  const def = covering(r);
  return (def.tintable ? parseHex(r.color) : null) ?? def.color;
}

const toWorld = (m: RoofModel, u: number, v: number, y: number): V3 => {
  const [x, z] = fromRoofFrame(m, u, v);
  return [x, y, z];
};

/** A flat polygon (convex, going round) as a fan, facing n. */
function fan(g: Geo, pts: V3[], n: V3, col: V3, glow = -1): number[] {
  const ids = pts.map((p) => g.vertex(p, n, col, ROOM_OUTSIDE, -1, glow));
  for (let i = 1; i + 1 < ids.length; i++) g.tri(ids[0], ids[i], ids[i + 1], n);
  return ids;
}

/** A vertical strip between two heights along a line of the roof's frame, facing out. */
function strip(g: Geo, m: RoofModel, a: Vec2, dir: Vec2, t0: number, t1: number, lo0: number, lo1: number, hi0: number, hi1: number, out: Vec2, col: V3): void {
  if (hi0 - lo0 < 1e-4 && hi1 - lo1 < 1e-4) return;
  const p = (t: number, y: number) => toWorld(m, a[0] + dir[0] * t, a[1] + dir[1] * t, m.base + y);
  const [nx, nz] = dirOf(m, out[0], out[1]);
  g.quad(p(t0, lo0), p(t1, lo1), p(t1, Math.max(lo1, hi1)), p(t0, Math.max(lo0, hi0)), [nx, 0, nz], col, ROOM_OUTSIDE);
}

/** A strip's pieces between `lo` and the profile's height + `dy`, only where that is above `lo`. */
function fill(g: Geo, m: RoofModel, a: Vec2, b: Vec2, out: Vec2, lo: number, dy: number, col: V3, extra: number[] = []): void {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (len < 1e-6) return;
  const dir: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  for (const [t0, t1, y0, y1] of profile(m, a, b, extra)) {
    const h0 = y0 + dy, h1 = y1 + dy;
    if (h0 <= lo && h1 <= lo) continue;
    if (h0 >= lo && h1 >= lo) {
      strip(g, m, a, dir, t0, t1, lo, lo, h0, h1, out, col);
      continue;
    }
    // crosses lo: only the part above it
    const tc = t0 + ((lo - h0) / (h1 - h0)) * (t1 - t0);
    if (h0 > lo) strip(g, m, a, dir, t0, tc, lo, lo, h0, lo, out, col);
    else strip(g, m, a, dir, tc, t1, lo, lo, lo, h1, out, col);
  }
}

/**
 * The roof's edge between its top (y0..y1) and T under it, cut off at floorY (a wall's top it must
 * not reach into), along t0..t1 of a line.
 */
function band(g: Geo, m: RoofModel, a: Vec2, dir: Vec2, out: Vec2, t0: number, t1: number, y0: number, y1: number, T: number, floorY: number, col: V3): void {
  const at = (t: number) => y0 + ((t - t0) / (t1 - t0)) * (y1 - y0);
  const cuts = [t0, t1];
  if (isFinite(floorY)) {
    for (const [p, q] of [[y0 - T, y1 - T], [y0, y1]]) {
      if ((p - floorY) * (q - floorY) < 0) cuts.push(t0 + ((floorY - p) / (q - p)) * (t1 - t0));
    }
  }
  cuts.sort((x, y) => x - y);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const s0 = cuts[i], s1 = cuts[i + 1];
    if (s1 - s0 < 1e-6) continue;
    const top0 = at(s0), top1 = at(s1);
    const lo0 = Math.max(floorY, top0 - T), lo1 = Math.max(floorY, top1 - T);
    strip(g, m, a, dir, s0, s1, lo0, lo1, Math.max(lo0, top0), Math.max(lo1, top1), out, col);
  }
}

/** Draws a roof: its slopes, the walls up to it, its edges and the soffits under its overhangs. */
export function drawRoof(m: RoofModel, d: RoofDraw, look?: { cover?: Look; trim?: Look; wall?: Look }): void {
  const r = m.roof;
  const g = d.geo;
  const def = covering(r);
  const cover: Look = look?.cover ?? { surf: `roof:${r.covering}`, col: d.colour(coveringHex(r), true) };
  const trim: Look = look?.trim ?? { surf: "jn:upvc", col: d.colour(parseHex(r.trim) ?? JOINERY_FINISHES.upvc.color, true) };
  const wall: Look = look?.wall ?? d.exterior;

  // the slopes, their texture laid along the eaves and up the slope
  for (const f of m.faces) {
    const n = faceNormal(m, f);
    const pts = f.poly.map(([u, v]) => toWorld(m, u, v, m.base + planeHeight(f.plane, u, v)));
    const target = m.glass ? d.glass : g;
    if (!m.glass) target.useSurface(cover.surf);
    const ids = fan(target, pts, n, m.glass ? d.colour(def.color, true) : cover.col);
    const sec = Math.sqrt(1 + f.plane.k * f.plane.k);
    f.poly.forEach(([u, v], i) => {
      const vi = ids[i];
      const p = f.plane;
      target.uv[vi * 2] = f.plane.k > 1e-6 ? -p.n[1] * u + p.n[0] * v : u;
      target.uv[vi * 2 + 1] = f.plane.k > 1e-6 ? (p.c - (p.n[0] * u + p.n[1] * v)) * sec : v;
    });
    if (m.glass) glazingBars(m, f, d, trim);
  }

  // ridge and hip tiles along the edges where two slopes meet at the top
  if (!m.glass && r.shape !== "flat") ridgeTiles(m, d, cover);

  // walls up to the roof (gables, a lean-to's back, a butterfly's sides), not where it stands against a wall
  const { A, B, T } = m;
  g.useSurface(wall.surf);
  if (!m.abut.left) fill(g, m, [-A, B], [-A, -B], [-1, 0], 0, -T, wall.col);
  if (!m.abut.right) fill(g, m, [A, -B], [A, B], [1, 0], 0, -T, wall.col);
  if (!m.abut.back) fill(g, m, [-A, -B], [A, -B], [0, -1], 0, -T, wall.col);
  if (!m.abut.front) fill(g, m, [A, B], [-A, B], [0, 1], 0, -T, wall.col);
  // a Dutch gable's gablet: the little gable above the hips
  for (const gb of m.gablets) {
    const z = m.zones[0];
    const fake: RoofModel = { ...m, zones: [z] };
    const a: Vec2 = gb.outward < 0 ? [gb.u, B] : [gb.u, -B];
    const b: Vec2 = gb.outward < 0 ? [gb.u, -B] : [gb.u, B];
    fill(g, fake, a, b, [gb.outward, 0], gb.foot, 0, wall.col);
  }

  // edges: fascias at the eaves, bargeboards at the verges, the cut at a party wall
  const sides: [keyof Sides, Vec2, Vec2, Vec2, 0 | 1, number, number][] = [
    // side, from, to, outwards, the axis it runs along, how far it reaches past the wall, the wall's half length
    ["left", [m.u0, m.v1], [m.u0, m.v0], [-1, 0], 1, -A - m.u0, B],
    ["right", [m.u1, m.v0], [m.u1, m.v1], [1, 0], 1, m.u1 - A, B],
    ["back", [m.u0, m.v0], [m.u1, m.v0], [0, -1], 0, -B - m.v0, A],
    ["front", [m.u1, m.v1], [m.u0, m.v1], [0, 1], 0, m.v1 - B, A],
  ];
  for (const [side, a, b, out, axis, past, half] of sides) {
    // a parapet stands where the edge would be
    if (m.abut[side] || (r.shape === "flat" && r.parapet)) continue;
    const party = (side === "left" && m.party.left) || (side === "right" && m.party.right);
    const lookE = party ? wall : trim;
    g.useSurface(lookE.surf);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const dir: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    // flush with the wall under it, the edge stops at the wall's top there: never in the wall's plane
    let over: [number, number] | null = null;
    if (past < 0.005) {
      const t1 = (-half - a[axis]) / dir[axis], t2 = (half - a[axis]) / dir[axis];
      over = [Math.min(t1, t2), Math.max(t1, t2)];
    }
    for (const [t0, t1, y0, y1] of profile(m, a, b, over ?? [])) {
      const tm = (t0 + t1) / 2;
      const floorY = over && tm > over[0] && tm < over[1] ? 0 : -Infinity;
      band(g, m, a, dir, out, t0, t1, y0, y1, T, floorY, lookE.col);
    }
  }

  // soffits: under the overhangs only (inside, the house hides the roof's underside)
  if (!m.glass) {
    g.useSurface(trim.surf);
    const bands: ((p: Vec2) => number)[][] = [
      [(p) => p[1] - B],
      [(p) => -B - p[1]],
      [(p) => p[0] - A, (p) => B - p[1], (p) => p[1] + B],
      [(p) => -A - p[0], (p) => B - p[1], (p) => p[1] + B],
    ];
    for (const f of m.faces) {
      const n = faceNormal(m, f);
      const down: V3 = [-n[0], -n[1], -n[2]];
      for (const band of bands) {
        const poly = clipPolygon(f.poly, band);
        if (poly.length < 3 || polyArea(poly) < 1e-4) continue;
        fan(g, poly.map(([u, v]) => toWorld(m, u, v, m.base + planeHeight(f.plane, u, v) - T)), down, trim.col);
      }
    }
  }

  // gutters along the eaves
  if (!(r.shape === "flat" && r.parapet)) gutters(m, d);

  // a flat roof's parapet: the walls carried up round its edge
  if (r.shape === "flat" && r.parapet) parapet(m, d, wall);
}

/**
 * Capping tiles over ridges and hips: the edges two faces of a zone share, where (the lowest of
 * the planes winning) the roof always folds down on both sides.
 */
function ridgeTiles(m: RoofModel, d: RoofDraw, cover: Look): void {
  const g = d.geo;
  g.useSurface(cover.surf);
  const col: V3 = [cover.col[0] * 0.85, cover.col[1] * 0.85, cover.col[2] * 0.85];
  const seen = new Set<string>();
  const key = (p: Vec2) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
  m.faces.forEach((f, i) => {
    if (m.zones[f.zone].max) return;
    f.poly.forEach((a, k) => {
      const b = f.poly[(k + 1) % f.poly.length];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.05) return;
      const id = [key(a), key(b)].sort().join("|");
      if (seen.has(id)) return;
      // the face on the other side of this edge
      const other = m.faces.find((o, j) => j !== i && o.zone === f.zone && o.poly.some((p, q) => {
        const p2 = o.poly[(q + 1) % o.poly.length];
        return (key(p) === key(b) && key(p2) === key(a)) || (key(p) === key(a) && key(p2) === key(b));
      }));
      if (!other) return;
      seen.add(id);
      const A3 = toWorld(m, a[0], a[1], m.base + planeHeight(f.plane, a[0], a[1]));
      const B3 = toWorld(m, b[0], b[1], m.base + planeHeight(f.plane, b[0], b[1]));
      const n1 = faceNormal(m, f), n2 = faceNormal(m, other);
      const e = norm3([B3[0] - A3[0], B3[1] - A3[1], B3[2] - A3[2]]);
      // across each face, square to the edge, pointing into it
      const into = (n: V3, face: RoofFace): V3 => {
        let s = norm3(cross3(n, e));
        const c = face.poly.reduce((acc, p) => [acc[0] + p[0] / face.poly.length, acc[1] + p[1] / face.poly.length], [0, 0]);
        const cw = toWorld(m, c[0], c[1], m.base + planeHeight(face.plane, c[0], c[1]));
        if (s[0] * (cw[0] - A3[0]) + s[1] * (cw[1] - A3[1]) + s[2] * (cw[2] - A3[2]) < 0) s = [-s[0], -s[1], -s[2]];
        return s;
      };
      const s1 = into(n1, f), s2 = into(n2, other);
      const up = norm3([n1[0] + n2[0], n1[1] + n2[1], n1[2] + n2[2]]);
      const w = 0.14, rise = 0.09;
      const foot = (P: V3, s: V3, n: V3): V3 => [P[0] + s[0] * w + n[0] * 0.012, P[1] + s[1] * w + n[1] * 0.012, P[2] + s[2] * w + n[2] * 0.012];
      const apex = (P: V3): V3 => [P[0] + up[0] * rise, P[1] + up[1] * rise, P[2] + up[2] * rise];
      for (const [s, n] of [[s1, n1], [s2, n2]] as [V3, V3][]) {
        const side = norm3([n[0] * 0.7 + up[0] * 0.3 - s[0] * 0.2, n[1] * 0.7 + up[1] * 0.3 - s[1] * 0.2, n[2] * 0.7 + up[2] * 0.3 - s[2] * 0.2]);
        g.quad(foot(A3, s, n), foot(B3, s, n), apex(B3), apex(A3), side, col, ROOM_OUTSIDE);
      }
    });
  });
}

/** Black gutters along the eaves: the level edges of the outline with slopes running down to them. */
function gutters(m: RoofModel, d: RoofDraw): void {
  const g = d.geo;
  g.useSurface("role:blackMetal");
  const col = d.colour(0x2b2c2f, true);
  const sides: [keyof Sides, Vec2, Vec2, Vec2][] = [
    ["front", [m.u0, m.v1], [m.u1, m.v1], [0, 1]],
    ["back", [m.u1, m.v0], [m.u0, m.v0], [0, -1]],
    ["left", [m.u0, m.v0], [m.u0, m.v1], [-1, 0]],
    ["right", [m.u1, m.v1], [m.u1, m.v0], [1, 0]],
  ];
  for (const [side, a, b, out] of sides) {
    if (m.abut[side] || (side === "left" && m.party.left) || (side === "right" && m.party.right)) continue;
    // an eave is level along its length, with the roof rising inwards from it
    const p = profile(m, a, b);
    if (!p.length) continue;
    const y = p[0][2];
    if (p.some(([, , y0, y1]) => Math.abs(y0 - y) > 0.01 || Math.abs(y1 - y) > 0.01)) continue;
    const mid: Vec2 = [(a[0] + b[0]) / 2 - out[0] * 0.3, (a[1] + b[1]) / 2 - out[1] * 0.3];
    if (roofHeight(m, mid[0], mid[1]) <= y + 0.01) continue;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [ox, oz] = dirOf(m, out[0], out[1]);
    const [ax, az] = fromRoofFrame(m, a[0], a[1]);
    const [dx, dz] = dirOf(m, (b[0] - a[0]) / len, (b[1] - a[1]) / len);
    const fr = { e1: [dx, 0, dz] as V3, e2: [ox, 0, oz] as V3, n: [0, 1, 0] as V3, c: [ax, m.base + y - m.T * 0.35, az] as V3 };
    frameBox(g, fr, -0.02, len + 0.02, 0.0, 0.12, -0.08, 0, col, -1, true);
  }
}

const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Glazing bars on a conservatory's glass, up the slope every 0.65 m, and round its edge. */
function glazingBars(m: RoofModel, f: RoofFace, d: RoofDraw, trim: Look): void {
  const p = f.plane;
  const g = d.geo;
  g.useSurface(trim.surf);
  const across: Vec2 = p.k > 1e-6 ? [-p.n[1], p.n[0]] : [1, 0];
  const proj = f.poly.map((q) => q[0] * across[0] + q[1] * across[1]);
  const lo = Math.min(...proj), hi = Math.max(...proj);
  const count = Math.max(1, Math.round((hi - lo) / 0.65));
  for (let i = 0; i <= count; i++) {
    const s = lo + ((hi - lo) * i) / count;
    // the bar's line through the face: clip a thin band of the polygon
    const w = 0.025;
    const band = clipPolygon(f.poly, [(q) => q[0] * across[0] + q[1] * across[1] - (s - w), (q) => s + w - (q[0] * across[0] + q[1] * across[1])]);
    if (band.length < 3) continue;
    fan(g, band.map(([u, v]) => toWorld(m, u, v, m.base + planeHeight(p, u, v) + 0.03)), faceNormal(m, f), trim.col);
  }
}

function parapet(m: RoofModel, d: RoofDraw, wall: Look): void {
  const g = d.geo;
  const top = FLAT_TOP + 0.35;
  const th = 0.2;
  const { A, B } = m;
  const sides: [Vec2, Vec2, Vec2, keyof Sides][] = [
    [[-A, B], [A, B], [0, 1], "front"],
    [[A, -B], [-A, -B], [0, -1], "back"],
    [[-A, -B], [-A, B], [-1, 0], "left"],
    [[A, B], [A, -B], [1, 0], "right"],
  ];
  for (const [a, b, out, side] of sides) {
    if (m.abut[side]) continue;
    const inner = (p: Vec2): Vec2 => [p[0] - out[0] * th, p[1] - out[1] * th];
    const W = (p: Vec2, y: number) => toWorld(m, p[0], p[1], m.base + y);
    const [nx, nz] = dirOf(m, out[0], out[1]);
    g.useSurface(wall.surf);
    g.quad(W(a, 0), W(b, 0), W(b, top), W(a, top), [nx, 0, nz], wall.col, ROOM_OUTSIDE);
    g.quad(W(inner(b), FLAT_TOP), W(inner(a), FLAT_TOP), W(inner(a), top), W(inner(b), top), [-nx, 0, -nz], wall.col, ROOM_OUTSIDE);
    g.useSurface("cap");
    g.quad(W(a, top), W(b, top), W(inner(b), top), W(inner(a), top), [0, 1, 0], d.colour(0x9a9a96, true), ROOM_OUTSIDE);
  }
}

// -------------------------------------------------------------------------- things on the roof

/** A box in an item's frame: a..b across, up the slope and out of the roof. */
function frameBox(g: Geo, fr: { e1: V3; e2: V3; n: V3; c: V3 }, a0: number, a1: number, b0: number, b1: number, c0: number, c1: number, col: V3, glow = -1, bottom = false): void {
  const P = (a: number, b: number, c: number): V3 => [
    fr.c[0] + fr.e1[0] * a + fr.e2[0] * b + fr.n[0] * c,
    fr.c[1] + fr.e1[1] * a + fr.e2[1] * b + fr.n[1] * c,
    fr.c[2] + fr.e1[2] * a + fr.e2[2] * b + fr.n[2] * c,
  ];
  const neg = (v: V3): V3 => [-v[0], -v[1], -v[2]];
  g.quad(P(a0, b0, c1), P(a1, b0, c1), P(a1, b1, c1), P(a0, b1, c1), fr.n, col, ROOM_OUTSIDE, -1, glow);
  g.quad(P(a0, b0, c0), P(a1, b0, c0), P(a1, b0, c1), P(a0, b0, c1), neg(fr.e2), col, ROOM_OUTSIDE, -1, glow);
  g.quad(P(a1, b1, c0), P(a0, b1, c0), P(a0, b1, c1), P(a1, b1, c1), fr.e2, col, ROOM_OUTSIDE, -1, glow);
  g.quad(P(a0, b1, c0), P(a0, b0, c0), P(a0, b0, c1), P(a0, b1, c1), neg(fr.e1), col, ROOM_OUTSIDE, -1, glow);
  g.quad(P(a1, b0, c0), P(a1, b1, c0), P(a1, b1, c1), P(a1, b0, c1), fr.e1, col, ROOM_OUTSIDE, -1, glow);
  if (bottom) g.quad(P(a0, b1, c0), P(a1, b1, c0), P(a1, b0, c0), P(a0, b0, c0), neg(fr.n), col, ROOM_OUTSIDE, -1, glow);
}

/** A flat rectangle in an item's frame at height c (glass, solar cells). */
function frameQuad(g: Geo, fr: { e1: V3; e2: V3; n: V3; c: V3 }, a0: number, a1: number, b0: number, b1: number, c: number, col: V3, glow = -1): void {
  const P = (a: number, b: number): V3 => [
    fr.c[0] + fr.e1[0] * a + fr.e2[0] * b + fr.n[0] * c,
    fr.c[1] + fr.e1[1] * a + fr.e2[1] * b + fr.n[1] * c,
    fr.c[2] + fr.e1[2] * a + fr.e2[2] * b + fr.n[2] * c,
  ];
  g.quad(P(a0, b0), P(a1, b0), P(a1, b1), P(a0, b1), fr.n, col, ROOM_OUTSIDE, -1, glow);
}

/** An upright cylinder (a chimney pot), narrowing to `taper` of its radius at the top. */
function pot(g: Geo, at: V3, r: number, h: number, taper: number, col: V3, seg: number): void {
  const ring = (y: number, rr: number) => Array.from({ length: seg }, (_, i) => {
    const a = (i / seg) * Math.PI * 2;
    return [at[0] + Math.cos(a) * rr, at[1] + y, at[2] + Math.sin(a) * rr] as V3;
  });
  const lo = ring(0, r), hi = ring(h, r * taper);
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    const a = (((i + 0.5) / seg) * Math.PI * 2);
    g.quad(lo[i], lo[j], hi[j], hi[i], [Math.cos(a), 0, Math.sin(a)], col, ROOM_OUTSIDE);
  }
  // the open top: a dark disc a little down inside
  const inner = ring(h - 0.02, r * taper * 0.8);
  const dark: V3 = [col[0] * 0.25, col[1] * 0.25, col[2] * 0.25];
  const c = g.vertex([at[0], at[1] + h - 0.02, at[2]], [0, 1, 0], dark, ROOM_OUTSIDE);
  const ids = inner.map((p) => g.vertex(p, [0, 1, 0], dark, ROOM_OUTSIDE));
  for (let i = 0; i < seg; i++) g.tri(c, ids[i], ids[(i + 1) % seg], [0, 1, 0]);
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    g.quad(hi[i], hi[j], inner[j], inner[i], [0, 1, 0], col, ROOM_OUTSIDE);
  }
}

/** Usual sizes of new roof items. */
export const ROOF_ITEM_DEFAULTS: Record<RoofItem["kind"], { label: PlainKey; w: number; d: number; h?: number }> = {
  window: { label: "roofItem.window", w: 0.78, d: 1.18 },
  chimney: { label: "roofItem.chimney", w: 1.1, d: 0.6, h: 1.0 },
  dormer: { label: "roofItem.dormer", w: 2.2, d: 2.0, h: 1.3 },
  solar: { label: "roofItem.solar", w: 0, d: 0 },
  lantern: { label: "roofItem.lantern", w: 2.0, d: 1.2, h: 0.5 },
};

/** Draws something on a roof. */
export function drawRoofItem(m: RoofModel, it: RoofItem, d: RoofDraw, floor: Floor): void {
  if (it.kind === "chimney") return chimney(m, it, d);
  if (it.kind === "dormer") return dormer(m, it, d, floor);
  if (it.kind === "lantern") return lantern(m, it, d);
  const fr = itemFrame(m, it);
  if (!fr) return;
  if (it.kind === "window") roofWindow(it, fr, d);
  else if (it.kind === "solar") solar(it, fr, d);
}

function roofWindow(it: RoofItem, fr: ItemFrame, d: RoofDraw): void {
  const g = d.geo;
  const w = it.w / 2, h = it.d / 2;
  const conservation = it.style === "conservation";
  const frameHex = parseHex(it.color) ?? (conservation ? 0x2a2b2e : 0x5d6267);
  const col = d.colour(frameHex, true);
  const bar = conservation ? 0.05 : 0.07;
  const top = conservation ? 0.05 : 0.1;
  // flashing round it, then the frame's four sides
  g.useSurface("role:dark");
  frameBox(g, fr, -w - 0.05, w + 0.05, -h - 0.05, h + 0.05, 0, 0.015, d.colour(0x3b3f45, true));
  g.useSurface("jn:aluminium");
  frameBox(g, fr, -w, w, -h, -h + bar, 0.01, top, col);
  frameBox(g, fr, -w, w, h - bar, h, 0.01, top, col);
  frameBox(g, fr, -w, -w + bar, -h + bar, h - bar, 0.01, top, col);
  frameBox(g, fr, w - bar, w, -h + bar, h - bar, 0.01, top, col);
  if (conservation) frameBox(g, fr, -0.015, 0.015, -h + bar, h - bar, 0.01, top + 0.005, col);
  // the glass glows with the room under it at night
  const glow = d.glows.length;
  d.glows.push({ kind: "window", entity: it.entity ?? null, room: d.roomAt([it.x, it.z]) });
  frameQuad(d.glass, fr, -w + bar, w - bar, -h + bar, h - bar, top - 0.02, d.colour(0xa9cfe2, true), glow);
}

function solar(it: RoofItem, fr: ItemFrame, d: RoofDraw): void {
  const g = d.geo;
  const cols = Math.max(1, Math.round(it.cols ?? 1)), rows = Math.max(1, Math.round(it.rows ?? 1));
  const portrait = it.portrait ?? true;
  const panel = panelOf(it);
  const pw = portrait ? panel.short : panel.long, ph = portrait ? panel.long : panel.short;
  const blue = it.style === "blue";
  const frameCol = d.colour(blue ? 0xb9bec4 : 0x232529, true);
  const cellCol = d.colour(blue ? 0x23396a : 0x15181d, true);
  const glow = d.glows.length;
  d.glows.push({ kind: "screen", entity: it.entity ?? null, room: ROOM_OUTSIDE, type: "solar_panels" });
  const tilt = fr.slope < 1 && it.tilt ? Math.max(0, Math.min(60, it.tilt)) : 0;
  const { w } = solarSize(it);
  const step = tilt ? ph * (Math.cos(tilt * RAD) + 1.4 * Math.sin(tilt * RAD)) + PANEL.gap : ph + PANEL.gap;
  const depth = step * rows - PANEL.gap;
  for (let r = 0; r < rows; r++) {
    const b0 = -depth / 2 + r * step;
    // on a flat roof a row leans up on frames from its front edge
    let row = fr;
    let lift = 0.06;
    if (tilt) {
      const t = tilt * RAD, ct = Math.cos(t), st = Math.sin(t);
      const base: V3 = [fr.c[0] + fr.e2[0] * b0, fr.c[1] + fr.e2[1] * b0 + 0.12, fr.c[2] + fr.e2[2] * b0];
      const e2: V3 = [fr.e2[0] * ct + fr.n[0] * st, fr.e2[1] * ct + fr.n[1] * st, fr.e2[2] * ct + fr.n[2] * st];
      const n: V3 = [-fr.e2[0] * st + fr.n[0] * ct, -fr.e2[1] * st + fr.n[1] * ct, -fr.e2[2] * st + fr.n[2] * ct];
      row = { ...fr, c: base, e2, n };
      lift = 0;
      g.useSurface("role:metal");
      // the frame's legs at both ends of the row
      for (const a of [-w / 2 + 0.05, w / 2 - 0.05]) {
        frameBox(g, { ...fr, c: [base[0], fr.c[1], base[2]] }, a - 0.02, a + 0.02, ph * ct - 0.04, ph * ct, 0, 0.12 + ph * st, d.colour(0xb9bec4, true));
      }
    }
    const bb = tilt ? 0 : b0;
    for (let c = 0; c < cols; c++) {
      const a0 = -w / 2 + c * (pw + PANEL.gap);
      g.useSurface(blue ? "role:metal" : "role:blackMetal");
      frameBox(g, row, a0, a0 + pw, bb, bb + ph, lift, lift + 0.035, frameCol, -1, tilt > 0);
      // solar glass: anti-reflective, so it reads dark under a bright sky
      g.useSurface("pv");
      frameQuad(g, row, a0 + 0.02, a0 + pw - 0.02, bb + 0.02, bb + ph - 0.02, lift + 0.037, cellCol, glow);
    }
  }
}

function chimney(m: RoofModel, it: RoofItem, d: RoofDraw): void {
  const g = d.geo;
  const [u, v] = toRoofFrame(m, [it.x, it.z]);
  const rot = (it.rotation ?? m.roof.rotation ?? 0) * RAD;
  const e1: V3 = [Math.cos(rot), 0, Math.sin(rot)], e2: V3 = [-Math.sin(rot), 0, Math.cos(rot)];
  const w = Math.max(0.3, it.w), dd = Math.max(0.3, it.d);
  // from under the roof's lowest corner below it to h over the roof at its middle
  let lowest = Infinity;
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const p: Vec2 = [it.x + e1[0] * a * w / 2 + e2[0] * b * dd / 2, it.z + e1[2] * a * w / 2 + e2[2] * b * dd / 2];
    const [pu, pv] = toRoofFrame(m, p);
    lowest = Math.min(lowest, roofHeight(m, pu, pv));
  }
  const bottom = m.base + Math.max(-m.T, lowest - 0.35);
  const top = m.base + roofHeight(m, u, v) + Math.max(0.3, it.h ?? 1.0);
  const style = it.style === "render" || it.style === "stone" ? it.style : "brick";
  const ext = d.exterior;
  const fin = style === "render" ? "render" : style === "stone" ? "stone" : ext.surf.startsWith("ext:brick") ? ext.surf.slice(4) : "brick";
  const def = (EXTERIOR_FINISHES as Record<string, FinishDef>)[fin] ?? EXTERIOR_FINISHES.brick;
  const hex = (def.tintable ? parseHex(it.color) : null) ?? def.color;
  const col = d.colour(hex, true);
  const fr = { e1, e2, n: [0, 1, 0] as V3, c: [it.x, 0, it.z] as V3 };
  g.useSurface(`ext:${fin}`);
  frameBox(g, fr, -w / 2, w / 2, -dd / 2, dd / 2, bottom, top - 0.3, col);
  // an oversailing course, then the stack's last courses, then a concrete cap
  frameBox(g, fr, -w / 2 - 0.03, w / 2 + 0.03, -dd / 2 - 0.03, dd / 2 + 0.03, top - 0.3, top - 0.2, col, -1, true);
  frameBox(g, fr, -w / 2, w / 2, -dd / 2, dd / 2, top - 0.2, top - 0.06, col);
  g.useSurface("role:concrete");
  frameBox(g, fr, -w / 2 - 0.04, w / 2 + 0.04, -dd / 2 - 0.04, dd / 2 + 0.04, top - 0.06, top, d.colour(0xa9a7a0, true), -1, true);
  const pots = Math.max(0, Math.min(6, Math.round(it.pots ?? (w >= 0.8 ? 2 : 1))));
  g.useSurface("role:pot");
  const potCol = d.colour(0xb5653f, true);
  for (let i = 0; i < pots; i++) {
    const a = pots === 1 ? 0 : -w / 2 + 0.2 + ((w - 0.4) * i) / (pots - 1);
    pot(g, [it.x + e1[0] * a, top, it.z + e1[2] * a], 0.11, 0.42, 0.82, potCol, d.low ? 6 : 10);
  }
}

/** A dormer: a little roof of its own on walls rising from the slope, a window in its front. */
function dormer(m: RoofModel, it: RoofItem, d: RoofDraw, floor: Floor): void {
  const fr = itemFrame(m, it);
  if (!fr || fr.slope < 10) return;
  const g = d.geo;
  const k = fr.face.plane.k;
  const up = dirOf(m, -fr.face.plane.n[0], -fr.face.plane.n[1]);
  const across: Vec2 = [fr.e1[0], fr.e1[2]];
  const w = Math.max(0.8, it.w);
  // its front stands where the item's middle is, less half its depth down the slope
  const frontAt: Vec2 = [it.x - (up[0] * it.d) / 2, it.z - (up[1] * it.d) / 2];
  const [fu, fv] = toRoofFrame(m, frontAt);
  const foot = roofHeight(m, fu, fv);
  const ridge = ridgeHeight(m);
  const style = it.style === "box" || it.style === "hipped" ? it.style : "gable";
  const pitch = Math.max(25, Math.min(50, m.roof.pitch || 35));
  const rise = style === "box" ? 0.15 : (w / 2 + 0.1) * Math.tan(pitch * RAD);
  // its walls stop short of the main ridge, so the dormer's own roof stays under it
  const wallH = Math.max(0.6, Math.min(it.h ?? (style === "box" ? ridge - foot - 0.35 : 1.3), ridge - foot - rise - 0.1));
  const eaves = foot + wallH;
  // back into the roof until the slope rises over the dormer's top, and a little more
  const depth = Math.max(0.5, (eaves + rise - foot) / Math.max(0.05, k) + 0.3);
  const coverLook: Look = { surf: `roof:${m.roof.covering === "glass" ? "felt" : m.roof.covering}`, col: d.colour(coveringHex(m.roof), true) };
  const trim: Look = { surf: "jn:upvc", col: d.colour(parseHex(it.color) ?? JOINERY_FINISHES.upvc.color, true) };
  const W = (p: Vec2, y: number): V3 => [p[0], m.base + y, p[1]];
  const at = (s: number, t: number): Vec2 => [frontAt[0] + across[0] * s + up[0] * t, frontAt[1] + across[1] * s + up[1] * t];
  // cheeks: from the slope up to the eaves, back to where the slope meets them
  const meet = wallH / Math.max(0.05, k);
  g.useSurface(coverLook.surf);
  for (const side of [-1, 1]) {
    const s = (side * w) / 2;
    const n: V3 = [across[0] * side, 0, across[1] * side];
    const a = g.vertex(W(at(s, 0), foot - 0.05), n, coverLook.col, ROOM_OUTSIDE);
    const b = g.vertex(W(at(s, 0), eaves), n, coverLook.col, ROOM_OUTSIDE);
    const c = g.vertex(W(at(s, meet + 0.05), eaves), n, coverLook.col, ROOM_OUTSIDE);
    g.tri(a, b, c, n);
  }
  // the front, round its window
  const out: V3 = [-up[0], 0, -up[1]];
  const ww = Math.max(0.4, w - 0.35), wh = Math.max(0.35, wallH - 0.4), sill = foot + 0.22;
  const F = (s: number, y: number) => W(at(s, 0), y);
  g.useSurface(trim.surf);
  g.quad(F(-w / 2, foot - 0.05), F(w / 2, foot - 0.05), F(w / 2, sill), F(-w / 2, sill), out, trim.col, ROOM_OUTSIDE);
  g.quad(F(-w / 2, sill + wh), F(w / 2, sill + wh), F(w / 2, eaves), F(-w / 2, eaves), out, trim.col, ROOM_OUTSIDE);
  g.quad(F(-w / 2, sill), F(-ww / 2, sill), F(-ww / 2, sill + wh), F(-w / 2, sill + wh), out, trim.col, ROOM_OUTSIDE);
  g.quad(F(ww / 2, sill), F(w / 2, sill), F(w / 2, sill + wh), F(ww / 2, sill + wh), out, trim.col, ROOM_OUTSIDE);
  // the window: its frame set in, its glass lit by the room behind
  const wf = { e1: [across[0], 0, across[1]] as V3, e2: [0, 1, 0] as V3, n: out, c: W(at(0, 0.06), sill + wh / 2) };
  frameBox(g, wf, -ww / 2, ww / 2, -wh / 2, -wh / 2 + 0.06, -0.06, 0, trim.col);
  frameBox(g, wf, -ww / 2, ww / 2, wh / 2 - 0.06, wh / 2, -0.06, 0, trim.col);
  frameBox(g, wf, -ww / 2, -ww / 2 + 0.06, -wh / 2 + 0.06, wh / 2 - 0.06, -0.06, 0, trim.col);
  frameBox(g, wf, ww / 2 - 0.06, ww / 2, -wh / 2 + 0.06, wh / 2 - 0.06, -0.06, 0, trim.col);
  if (ww > 1.0) frameBox(g, wf, -0.03, 0.03, -wh / 2 + 0.06, wh / 2 - 0.06, -0.06, 0, trim.col);
  // reveals: the window sits back in the front wall
  const glow = d.glows.length;
  d.glows.push({ kind: "window", entity: it.entity ?? null, room: d.roomAt([it.x, it.z]) });
  frameQuad(d.glass, wf, -ww / 2 + 0.06, ww / 2 - 0.06, -wh / 2 + 0.06, wh / 2 - 0.06, -0.04, d.colour(0xa9cfe2, true), glow);
  // its roof: a gable (or hip, or flat for a box dormer) running back into the main roof
  const mid: Vec2 = at(0, depth / 2);
  const rot = (Math.atan2(up[1], up[0]) * 180) / Math.PI;
  const own: Roof = {
    id: `${it.id}_roof`, x: mid[0], z: mid[1], w: depth, d: w, rotation: rot,
    shape: style === "box" ? "flat" : style === "hipped" ? "hip" : "gable", pitch, covering: style === "box" ? "felt" : m.roof.covering,
    color: m.roof.color, trim: it.color ?? m.roof.trim ?? null, overhang: style === "box" ? 0.1 : 0.15, party: style === "hipped" ? "right" : null,
  };
  const dm = roofModel(own, m.base + eaves - (style === "box" ? FLAT_TOP : 0), { wallHalf: 0.04, abut: { right: true } });
  drawRoof(dm, d, { wall: coverLook, trim, cover: style === "box" ? undefined : coverLook });
  void floor;
}

/** A roof lantern: a hipped glass roof on an upstand, on a flat roof. */
function lantern(m: RoofModel, it: RoofItem, d: RoofDraw): void {
  const fr = itemFrame(m, it);
  if (!fr) return;
  const g = d.geo;
  const w = Math.max(0.6, it.w), dd = Math.max(0.6, it.d);
  const kerb = 0.22;
  const frameHex = parseHex(it.color) ?? 0x383e42;
  const col = d.colour(frameHex, true);
  const rot = fr.slope < 1 ? Math.atan2(fr.e1[2], fr.e1[0]) / RAD : m.roof.rotation;
  g.useSurface("jn:aluminium");
  frameBox(g, fr, -w / 2, w / 2, -dd / 2, dd / 2, -0.05, kerb, col);
  const rise = Math.max(0.2, it.h ?? 0.5);
  const pitch = Math.atan(rise / (Math.min(w, dd) / 2)) / RAD;
  const own: Roof = {
    id: `${it.id}_glass`, x: it.x, z: it.z, w, d: dd, rotation: rot, shape: "hip", pitch, covering: "glass", overhang: 0.02, trim: it.color ?? "#383e42",
  };
  const lm = roofModel(own, fr.c[1] + kerb, { wallHalf: 0 });
  // the glass glows with the room under it
  const glow = d.glows.length;
  d.glows.push({ kind: "window", entity: it.entity ?? null, room: d.roomAt([it.x, it.z]) });
  const before = d.glass.vertexCount;
  drawRoof(lm, d, { trim: { surf: "jn:aluminium", col } });
  for (let v = before; v < d.glass.vertexCount; v++) d.glass.glow[v] = glow;
}
