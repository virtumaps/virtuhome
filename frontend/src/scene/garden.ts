// Garden buildings and planters: pergolas (timber, louvred aluminium, a lean-to against a wall), a
// gazebo, an arch and an arbour; sheds (apex, reverse apex, pent), a summerhouse, a log cabin, a
// garden office, a metal shed and a greenhouse; and planters and raised beds in timber, sleepers,
// corten, stone... with what grows in them. Each is a furniture type made of simple solids, so a
// garden of them merges into the floor's mesh like any other piece, and each piece's options
// (a pergola's top, a shed's roof, door and windows, a planter's material and plants) are its own.
import type { Furniture } from "../model/plan";
import type { FurnitureType, Part, Role } from "./furniture-lib";
import type { PlainKey } from "../i18n";

/** What a pergola is covered with. */
export type Canopy = "open" | "slats" | "louvres" | "glass" | "canvas" | "plants";
/** What a shed's or gazebo's roof is covered with. */
export type GardenRoofing = "felt" | "shingles" | "epdm" | "corrugated" | "sedum";
/** Where a shed's door is, or a pair of doors in the middle. */
export type ShedDoor = "left" | "centre" | "right" | "double";
export type PlanterMaterial = "timber" | "sleepers" | "painted" | "corten" | "galvanised" | "fibreclay" | "terracotta" | "brick" | "stone" | "rattan";
export type Planting = "flowers" | "shrubs" | "grasses" | "lavender" | "herbs" | "vegetables" | "topiary" | "tree" | "none";

export const CANOPY_NAMES: Record<Canopy, PlainKey> = {
  open: "canopy.open", slats: "canopy.slats", louvres: "canopy.louvres", glass: "canopy.glass", canvas: "canopy.canvas", plants: "canopy.plants",
};
export const ROOFING_NAMES: Record<GardenRoofing, PlainKey> = {
  felt: "gardenRoof.felt", shingles: "gardenRoof.shingles", epdm: "gardenRoof.epdm", corrugated: "gardenRoof.corrugated", sedum: "gardenRoof.sedum",
};
export const DOOR_NAMES: Record<ShedDoor, PlainKey> = { left: "shedDoor.left", centre: "shedDoor.centre", right: "shedDoor.right", double: "shedDoor.double" };
export const PLANTER_MATERIALS: Record<PlanterMaterial, { label: PlainKey; role: Role }> = {
  timber: { label: "planter.timber", role: "softwood" },
  sleepers: { label: "planter.sleepers", role: "sleeper" },
  painted: { label: "planter.painted", role: "primed" },
  corten: { label: "planter.corten", role: "corten" },
  galvanised: { label: "planter.galvanised", role: "galvanised" },
  fibreclay: { label: "planter.fibreclay", role: "concrete" },
  terracotta: { label: "planter.terracotta", role: "pot" },
  brick: { label: "planter.brick", role: "brick" },
  stone: { label: "planter.stone", role: "stone" },
  rattan: { label: "planter.rattan", role: "rattan" },
};
export const PLANTING_NAMES: Record<Planting, PlainKey> = {
  flowers: "planting.flowers", shrubs: "planting.shrubs", grasses: "planting.grasses", lavender: "planting.lavender", herbs: "planting.herbs",
  vegetables: "planting.vegetables", topiary: "planting.topiary", tree: "planting.tree", none: "planting.none",
};

/** What the editor offers for each garden type, and what each has unless picked (the first of a list). */
export interface GardenOptions {
  canopies?: Canopy[];
  roofings?: GardenRoofing[];
  /** Where the door can go. */
  doors?: ShedDoor[];
  /** The windows it can have at most, and has unless picked. */
  windows?: [number, number];
  /** A planter: its usual material and planting. */
  material?: PlanterMaterial;
  plants?: Planting;
}

const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, extra: Partial<Part> = {}): Part => ({ shape: "box", x, y, z, w, h, d, role, ...extra });
const cyl = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, seg = 10, taper?: number): Part => ({ shape: "cyl", x, y, z, w, h, d, role, seg, taper });
const ball = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, seg = 8): Part => ({ shape: "ball", x, y, z, w, h, d, role, seg });
const prism = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role): Part => ({ shape: "prism", x, y, z, w, h, d, role });
const turned = (parts: Part[]): Part[] => parts.map((p) => ({ ...p, turn: true }));
/** Parts made for the +z face moved round to the +x face. */
const toX = (parts: Part[]): Part[] => parts.map((p) => ({ ...p, x: p.z, z: -p.x, w: p.d, d: p.w }));

function pick<T extends string>(v: string | null | undefined, allowed: readonly T[] | undefined, usual: T): T {
  return allowed && allowed.includes(v as T) ? (v as T) : usual;
}

/** A seeded random number generator from a piece's id (its plants stay where they are). */
function seeded(id: string | undefined): () => number {
  let a = 2166136261;
  for (const ch of id ?? "plant") a = Math.imul(a ^ ch.charCodeAt(0), 16777619);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROOF_ROLE: Record<GardenRoofing, Role> = { felt: "felt", shingles: "shingle", epdm: "epdm", corrugated: "corrugated", sedum: "sedum" };

// -------------------------------------------------------------------------------- doors and windows

/**
 * A door (or a pair) in the +z face at zf, its middle at x: leaves of the wall's cladding (or
 * glazed in frames of the trim), a frame of the trim round it, hinges and a handle.
 */
function door(x: number, zf: number, width: number, height: number, leaf: Role, trim: Role, double: boolean, glazed: boolean, y0 = 0.08): Part[] {
  const out: Part[] = [
    box(x - width / 2 - 0.03, y0, zf + 0.015, 0.06, height + 0.06, 0.03, trim),
    box(x + width / 2 + 0.03, y0, zf + 0.015, 0.06, height + 0.06, 0.03, trim),
    box(x, y0 + height, zf + 0.015, width, 0.06, 0.03, trim),
  ];
  const n = double ? 2 : 1;
  const lw = (width - (n - 1) * 0.01) / n;
  for (let k = 0; k < n; k++) {
    const lx = x - width / 2 + lw / 2 + k * (lw + 0.01);
    if (glazed) {
      // stiles and rails of the trim round a pane, the dark room behind it showing through; the
      // pane's edges sink into the frame and it stands clear of the dark (glass shows both sides)
      for (const sx of [-1, 1]) out.push(box(lx + sx * (lw / 2 - 0.035), y0, zf + 0.012, 0.07, height, 0.024, trim));
      out.push(box(lx, y0, zf + 0.012, lw - 0.14, 0.12, 0.024, trim), box(lx, y0 + height - 0.12, zf + 0.012, lw - 0.14, 0.12, 0.024, trim));
      out.push(box(lx, y0 + 0.11, zf + 0.003, lw - 0.13, height - 0.22, 0.002, "screen"));
      out.push(box(lx, y0 + 0.11, zf + 0.012, lw - 0.13, height - 0.22, 0.004, "glass"));
    } else {
      out.push(box(lx, y0, zf + 0.012, lw, height, 0.024, leaf));
      // hinges on the outer side
      const hx = k === 0 ? lx - lw / 2 + 0.12 : lx + lw / 2 - 0.12;
      for (const hy of [0.25, height - 0.3]) out.push(box(hx, y0 + hy, zf + 0.026, 0.22, 0.03, 0.004, "dark"));
    }
    // the handle by the closing edge, on the stile of a glazed door
    const side = n === 1 ? 1 : k === 0 ? 1 : -1;
    out.push(box(lx + side * (lw / 2 - (glazed ? 0.035 : 0.07)), y0 + Math.min(1.0, height * 0.52), zf + 0.035, 0.02, 0.13, 0.022, "dark"));
  }
  return out;
}

/**
 * A window in the +z face at zf: a pane in a frame of the trim, on a sill. The pane's edges sink
 * into the frame and it stands clear of the dark behind it (glass shows both sides).
 */
function window(x: number, y0: number, zf: number, w: number, h: number, trim: Role): Part[] {
  return [
    box(x, y0 + 0.004, zf + 0.001, w - 0.008, h - 0.008, 0.0015, "screen"),
    box(x, y0 - 0.01, zf + 0.012, w + 0.02, h + 0.02, 0.006, "glass"),
    box(x - w / 2 - 0.025, y0, zf + 0.015, 0.05, h, 0.03, trim),
    box(x + w / 2 + 0.025, y0, zf + 0.015, 0.05, h, 0.03, trim),
    box(x, y0 + h, zf + 0.015, w + 0.1, 0.05, 0.03, trim),
    box(x, y0 - 0.045, zf + 0.022, w + 0.16, 0.045, 0.044, trim),
  ];
}

/**
 * Where n windows go along a face from a to b (m), clear of the stretches in `taken`, and how wide
 * they are: w, or narrower (down to 0.35 m) when that many would not fit.
 */
function windowSpots(a: number, b: number, n: number, w: number, taken: [number, number][]): { xs: number[]; w: number } {
  const free: [number, number][] = [];
  let cur = a;
  for (const [t0, t1] of [...taken].sort((p, q) => p[0] - q[0])) {
    if (t0 > cur) free.push([cur, t0]);
    cur = Math.max(cur, t1);
  }
  if (b > cur) free.push([cur, b]);
  const fit = (ww: number) => {
    // the roomiest stretch takes the next window, until none fits
    const counts = free.map(() => 0);
    for (let k = 0; k < n; k++) {
      let best = -1, room = 0;
      free.forEach(([f0, f1], i) => {
        const r = (f1 - f0) / (counts[i] + 1);
        if (r >= ww + 0.1 && r > room) {
          room = r;
          best = i;
        }
      });
      if (best < 0) break;
      counts[best]++;
    }
    return free.flatMap(([f0, f1], i) => Array.from({ length: counts[i] }, (_, k) => f0 + ((f1 - f0) * (k + 0.5)) / counts[i]));
  };
  let best = { xs: fit(w), w };
  for (let ww = w - 0.05; best.xs.length < n && ww >= 0.35 - 1e-9; ww -= 0.05) {
    const xs = fit(ww);
    if (xs.length > best.xs.length) best = { xs, w: ww };
  }
  return best;
}

// -------------------------------------------------------------------------------- sheds

interface ShedSpec {
  wall: Role;
  roof: Role;
  trim: Role;
  door: ShedDoor;
  /** The door in the gable end (+x) or the long side (+z). */
  doorEnd: boolean;
  windows: number;
  /** Doors of glass in frames (summerhouse, cabin), and their width. */
  glazed?: boolean;
  doorWidth?: number;
  /** The ridge's rise as a share of the span, and how far the eaves reach out. */
  pitch: number;
  eaves: number;
  /** A covered porch along the front (+z) this deep, on posts, with a deck under it. */
  porch?: number;
  /** Log ends crossing at the corners. */
  logs?: boolean;
  windowSize?: [number, number];
}

/**
 * An apex roofed building L long (along x, under the ridge) and W across (z), its ridge h high:
 * walls of its cladding on a plinth, the gables filled in, the roof's two slopes overhanging on all
 * sides with fascias and bargeboards, corner boards, the door in the gable end or the long side,
 * windows, and a porch along the front if it has one.
 */
function apexShed(L: number, W: number, h: number, o: ShedSpec): Part[] {
  const porch = o.porch ?? 0;
  const Wb = W - porch;
  const zc = -porch / 2;
  const base = 0.08;
  // eaves high enough for a door in the long side under them
  const minEaves = o.doorEnd ? 1.4 : o.glazed ? 2.05 : 1.85;
  let rise = Math.max(0.12, Math.min(Wb * o.pitch, h - minEaves - 0.04));
  // a porch's roof carries on down the front slope: its edge stays above head height
  if (porch > 0) rise = Math.max(0.12, Math.min(rise, (h - 0.04 - 1.95) / (1 + (porch + o.eaves) / (Wb / 2))));
  const he = h - rise - 0.04;
  const slope = rise / (Wb / 2);
  const ov = o.eaves, ovEnd = o.eaves;
  const t = 0.03;
  const out: Part[] = [
    box(0, 0, zc, L + 0.04, base, Wb + 0.04, "dark"),
    box(0, base, zc, L, he - base, Wb, o.wall),
    prism(0, he, zc, L, rise, Wb, o.wall),
  ];
  const yAt = (z: number) => he + rise * (1 - Math.abs(z - zc) / (Wb / 2));
  for (const s of [-1, 1]) {
    // the front slope runs on over the porch
    const reach = Wb / 2 + ov + (s > 0 ? porch : 0);
    const mid = zc + (s * reach) / 2;
    out.push(box(0, yAt(mid) + 0.002, mid, L + 2 * ovEnd, t, reach, o.roof, { shear: -s * slope }));
    // bargeboards along the slopes at both ends, fascias along the eaves
    for (const e of [-1, 1]) out.push(box(e * (L / 2 + ovEnd + 0.011), yAt(mid) - 0.1, mid, 0.022, 0.13, reach, o.trim, { shear: -s * slope }));
    const ze = zc + s * reach;
    out.push(box(0, yAt(ze) - 0.1, ze + s * 0.011, L + 2 * ovEnd + 0.044, 0.12, 0.022, o.trim));
  }
  out.push(box(0, he + rise + t - 0.01, zc, L + 2 * ovEnd + 0.03, 0.05, 0.13, o.roof));
  // corners: boards, or a log cabin's crossing log ends
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cz = zc + (sz * Wb) / 2;
      // a little under the eaves, where the roof falls past the walls
      if (o.logs) {
        out.push(box(sx * (L / 2 + 0.07), base, cz - sz * 0.035, 0.14, he - base - 0.06, 0.07, o.wall));
        out.push(box(sx * (L / 2 - 0.035), base, cz + sz * 0.07, 0.07, he - base - 0.06, 0.14, o.wall));
      } else {
        out.push(box((sx * L) / 2, base, cz, 0.07, he - base - 0.03, 0.07, o.trim));
      }
    }
  }
  // the door, and the windows beside it (on the long side) or along it (door in the end)
  const dh = Math.min(o.glazed ? 1.95 : 1.85, (o.doorEnd ? he + rise * 0.45 : he) - base - 0.08);
  const span = o.doorEnd ? Wb : L;
  const double = o.door === "double";
  const dw = Math.min(span - 0.4, o.doorWidth ?? (double ? 1.2 : 0.75));
  const edge = span / 2 - 0.2 - dw / 2;
  const dx = double || o.door === "centre" ? 0 : o.door === "left" ? -edge : edge;
  const [ww, wh] = o.windowSize ?? [0.55, 0.5];
  const wy = he - (porch > 0 ? 0.35 : 0.2) - wh;
  if (o.doorEnd) {
    // made on a +z face and moved round to the gable end; the windows go along the long side
    // toX puts a part made at x = a on the +x face at z = -a; turned, that is a across the front
    out.push(...toX(door(dx - zc, L / 2, dw, dh, o.wall, o.trim, double, !!o.glazed)));
    const spots = windowSpots(-L / 2 + 0.15, L / 2 - 0.15, o.windows, ww, []);
    for (const x of spots.xs) out.push(...window(x, wy, zc + Wb / 2, spots.w, wh, o.trim));
  } else {
    const zf = zc + Wb / 2;
    out.push(...door(dx, zf, dw, dh, o.wall, o.trim, double, !!o.glazed));
    const spots = windowSpots(-L / 2 + 0.15, L / 2 - 0.15, o.windows, ww, [[dx - dw / 2 - 0.1, dx + dw / 2 + 0.1]]);
    for (const x of spots.xs) out.push(...window(x, wy, zf, spots.w, wh, o.trim));
  }
  if (porch > 0) {
    // posts holding the eaves at the porch's front, and a deck under it
    const zp = W / 2 - 0.08;
    for (const sx of [-1, 1]) out.push(box(sx * (L / 2 - 0.06), base, zp, 0.1, yAt(zp) - base - 0.01, 0.1, o.trim));
    out.push(box(0, 0, (zc + Wb / 2 + W / 2) / 2, L, base + 0.03, W / 2 - (zc + Wb / 2), "softwood"));
  }
  return out;
}

/** A pent shed: one slope falling to the back, the door and windows in its tall front. */
function pentShed(w: number, d: number, h: number, o: ShedSpec): Part[] {
  const base = 0.08;
  const hf = h - 0.06;
  const hb = Math.max(1.4, hf - d * 0.16);
  const sh = (hf - hb) / d;
  const out: Part[] = [
    box(0, 0, 0, w + 0.04, base, d + 0.04, "dark"),
    // the walls: a side outline (low at the back, -z) carried across the width
    { shape: "hull", x: 0, y: base, z: 0, w, h: hf - base, d, role: o.wall, outline: [[0, 0], [1, 0], [1, 1], [0, (hb - base) / (hf - base)]] },
    box(0, (hf + hb) / 2 + 0.004, 0, w + 0.2, 0.03, d + 0.24, o.roof, { shear: sh }),
    box(0, hf + 0.12 * sh - 0.1, d / 2 + 0.131, w + 0.244, 0.12, 0.022, o.trim),
    box(0, hb - 0.12 * sh - 0.1, -d / 2 - 0.131, w + 0.244, 0.12, 0.022, o.trim),
  ];
  for (const sx of [-1, 1]) out.push(box(sx * (w / 2 + 0.111), (hf + hb) / 2 - 0.1, 0, 0.022, 0.13, d + 0.24, o.trim, { shear: sh }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push(box((sx * w) / 2, base, (sz * d) / 2, 0.07, (sz > 0 ? hf : hb) - base - 0.02, 0.07, o.trim));
  const double = o.door === "double";
  const dw = Math.min(w - 0.4, double ? 1.2 : 0.75);
  const dh = Math.min(1.85, hf - base - 0.15);
  const edge = w / 2 - 0.2 - dw / 2;
  const dx = double || o.door === "centre" ? 0 : o.door === "left" ? -edge : edge;
  out.push(...door(dx, d / 2, dw, dh, o.wall, o.trim, double, false));
  const spots = windowSpots(-w / 2 + 0.15, w / 2 - 0.15, o.windows, 0.55, [[dx - dw / 2 - 0.1, dx + dw / 2 + 0.1]]);
  for (const x of spots.xs) out.push(...window(x, hf - 0.75, d / 2, spots.w, 0.5, o.trim));
  return out;
}

/** A garden office: a flat-roofed box clad all round, glass doors and a tall window across its front. */
function gardenOffice(w: number, d: number, h: number, roof: Role, doors: ShedDoor): Part[] {
  const base = 0.1;
  const top = h - 0.22;
  const green = roof === "sedum";
  const out: Part[] = [
    box(0, 0, 0, w + 0.04, base, d + 0.04, "dark"),
    box(0, base, 0, w, top - base, d, "shiplap"),
    box(0, top, 0, w + 0.3, 0.2, d + 0.3, "dark"),
    box(0, top + 0.2, 0, w + 0.22, green ? 0.06 : 0.015, d + 0.22, roof),
  ];
  const dh = top - base - 0.25;
  // the glass doors (double unless a single door is picked) and a fixed pane on the other side
  const double = doors === "double" || doors === "centre";
  const dw = Math.min(w * 0.5, double ? 1.8 : 0.95);
  const edge = w / 2 - 0.25 - dw / 2;
  const dx = double ? -w * 0.1 : doors === "left" ? -edge : edge;
  out.push(...door(dx, d / 2, dw, dh, "shiplap", "dark", double, true, base));
  const spots = windowSpots(-w / 2 + 0.2, w / 2 - 0.2, 1, 0.6, [[dx - dw / 2 - 0.15, dx + dw / 2 + 0.15]]);
  for (const x of spots.xs) out.push(...window(x, base + 0.15, d / 2, spots.w, dh - 0.15, "dark"));
  return out;
}

/**
 * A greenhouse: an aluminium frame of sills, posts, rails and glazing bars round panes of glass, a
 * sliding door outside the gable end, and a path of slabs down the soil inside. Glass is seen from
 * both sides, so every pane's edges are sunk into the frame and no pane lies on a metal face.
 */
function greenhouse(L: number, W: number, h: number, frame: Role): Part[] {
  const base = 0.12;
  const rise = Math.min(h - 1.4, W * 0.3);
  const he = h - rise;
  const slope = rise / (W / 2);
  const yAt = (z: number) => he + rise * (1 - Math.abs(z) / (W / 2));
  const G = 0.006;
  // the doorway: 0.7 wide, up into the gable, under the roof
  const ow = Math.max(0.2, Math.min(0.35, W / 2 - 0.15));
  const top = Math.min(base + 1.85, yAt(ow) - 0.08);
  const out: Part[] = [
    // soil, and slabs from the door to the back
    box(0, 0, 0, L - 0.05, 0.02, W - 0.05, "soil"),
  ];
  const pw = Math.min(0.6, W - 0.4), n = Math.max(1, Math.round((L - 0.05) / 0.6)), sl = (L - 0.05) / n;
  for (let i = 0; i < n; i++) out.push(box(-(L - 0.05) / 2 + sl * (i + 0.5), 0, 0, sl - 0.012, 0.035, pw, "concrete"));
  // the sills round the base, posts at the corners, rails along the eaves and the ridge
  for (const sz of [-1, 1]) out.push(box(0, 0, (sz * W) / 2, L + 0.05, base, 0.05, frame));
  for (const sx of [-1, 1]) out.push(box((sx * L) / 2, 0, 0, 0.05, base, W - 0.05, frame));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push(box((sx * L) / 2, base, (sz * W) / 2, 0.04, he - base, 0.04, frame));
  for (const sz of [-1, 1]) out.push(box(0, he - 0.03, (sz * W) / 2, L + 0.04, 0.05, 0.05, frame));
  out.push(box(0, he + rise - 0.03, 0, L + 0.04, 0.05, 0.05, frame));
  // glazing bars every 0.6 m, up the sides and over the roof; rafters along both gables
  const nx = Math.max(1, Math.round(L / 0.6));
  for (let i = 1; i < nx; i++) {
    const x = -L / 2 + (L * i) / nx;
    for (const sz of [-1, 1]) {
      out.push(box(x, base, (sz * W) / 2, 0.025, he - base, 0.03, frame));
      out.push(box(x, yAt((sz * W) / 4) - 0.012, (sz * W) / 4, 0.025, 0.03, W / 2, frame, { shear: -sz * slope }));
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push(box((sx * L) / 2, yAt((sz * W) / 4) - 0.015, (sz * W) / 4, 0.04, 0.03, W / 2, frame, { shear: -sz * slope }));
  // the gable ends: a bar each side of the doorway (up to the head at the door's end, to the rafters at the back)
  for (const sz of [-1, 1]) {
    out.push(box(L / 2, base, sz * ow, 0.03, top - 0.03 - base, 0.025, frame));
    out.push(box(-L / 2, base, sz * ow, 0.03, yAt(ow) - base, 0.025, frame));
  }
  out.push(box(L / 2, top - 0.03, 0, 0.03, 0.04, 2 * ow + 0.025, frame));
  // the panes: the sides, the roof's two slopes, and the gables (the doorway left open)
  const y0 = base - 0.03;
  for (const sz of [-1, 1]) {
    out.push(box(0, y0, (sz * W) / 2, L, he - y0, G, "glass"));
    // the slopes stop short of the bars' ends, still inside the eave and ridge rails
    out.push(box(0, yAt((sz * W) / 4) - G / 2, (sz * W) / 4, L, G, W / 2 - 0.02, "glass", { shear: -sz * slope }));
  }
  const gh = he + rise - y0, ve = (he - y0) / gh, u0 = 0.5 - ow / W, u1 = 0.5 + ow / W, vt = (top - 0.01 - y0) / gh;
  const gable = (x: number, outline: [number, number][]): Part => ({ shape: "hull", x, y: y0, z: 0, w: G, h: gh, d: W, role: "glass", outline });
  out.push(gable(-L / 2, [[0, 0], [1, 0], [1, ve], [0.5, 1], [0, ve]]));
  out.push(gable(L / 2, [[0, 0], [u0, 0], [u0, vt], [u1, vt], [u1, 0], [1, 0], [1, ve], [0.5, 1], [0, ve]]));
  // the sliding door, a little wider than the doorway: stiles and rails round a pane, and a handle
  const xd = L / 2 + 0.028, dw = 2 * ow + 0.06, dh = top - base;
  for (const sz of [-1, 1]) out.push(box(xd, base, sz * (dw / 2 - 0.02), 0.024, dh, 0.04, frame));
  out.push(box(xd, base, 0, 0.024, 0.08, dw - 0.08, frame), box(xd, top - 0.04, 0, 0.024, 0.04, dw - 0.08, frame));
  out.push(box(xd, base + 0.06, 0, 0.004, dh - 0.08, dw - 0.06, "glass"));
  out.push(box(xd + 0.022, base + 0.9, -(dw / 2 - 0.02), 0.02, 0.14, 0.02, "dark"));
  return out;
}

// -------------------------------------------------------------------------------- pergolas

function canopyParts(c: Canopy, w: number, d: number, y: number, role: Role, rnd: () => number): Part[] {
  switch (c) {
    case "slats": {
      const n = Math.max(3, Math.round(d / 0.15));
      return Array.from({ length: n }, (_, i) => box(0, y, -d / 2 + (d * (i + 0.5)) / n, w, 0.022, 0.045, role));
    }
    case "glass": return [box(0, y + 0.004, 0, w, 0.012, d, "glass")];
    case "canvas": return [box(0, y + 0.004, 0, w - 0.1, 0.01, d - 0.1, "canvas")];
    case "plants": {
      // leaves tumbling over the top, in clumps of every size, a flower here and there
      const out: Part[] = [];
      const n = Math.max(4, Math.round((w * d) / 0.25));
      for (let i = 0; i < n; i++) {
        const x = (rnd() - 0.5) * (w - 0.2), z = (rnd() - 0.5) * (d - 0.15);
        const s = 0.22 + rnd() * 0.3;
        out.push(ball(x, y - 0.1 - rnd() * 0.06, z, s, s * (0.6 + rnd() * 0.4), s * (0.8 + rnd() * 0.4), rnd() > 0.45 ? "leaf" : "plant", 7));
        if (rnd() > 0.8) out.push(ball(x + 0.05, y + s * 0.25, z, 0.06, 0.05, 0.06, "bloom", 5));
      }
      return out;
    }
    default: return [];
  }
}

/** Climbing plants up a post at (x, z), h high. */
function climber(x: number, z: number, h: number, rnd: () => number): Part[] {
  const out: Part[] = [];
  // clumps of leaves winding up, overlapping, thinner towards the top
  for (let y = 0.05; y < h - 0.2; y += 0.22 + rnd() * 0.1) {
    const s = 0.16 + rnd() * 0.14 * (1 - (0.5 * y) / h);
    const a = rnd() * Math.PI * 2;
    out.push(ball(x + Math.cos(a) * 0.05, y, z + Math.sin(a) * 0.05, s, s * (1 + rnd() * 0.4), s, rnd() > 0.5 ? "leaf" : "plant", 6));
  }
  return out;
}

/** A timber pergola: posts with knee braces, beams front and back, rafters across, and its top. */
function pergola(w: number, d: number, h: number, item?: Furniture): Part[] {
  const canopy = gardenChoice("pergola", item).canopy!;
  const rnd = seeded(item?.id);
  const W = "softwood";
  const post = 0.12;
  const ty = h - 0.15, by = ty - 0.18;
  const nx = Math.max(2, Math.ceil(w / 3.2) + 1);
  const out: Part[] = [];
  for (let i = 0; i < nx; i++) {
    const x = -w / 2 + post / 2 + ((w - post) * i) / (nx - 1);
    for (const sz of [-1, 1]) {
      const z = sz * (d / 2 - post / 2);
      out.push(box(x, 0, z, post, by, post, W));
      // knee braces up to the beam, towards the middle
      const dir = i === 0 ? 1 : i === nx - 1 ? -1 : 0;
      if (dir) out.push({ shape: "cyl", x: x + dir * (post / 2 + 0.03), y: by - 0.52, z, w: 0.05, h: 0.5, d: 0.05, role: W, seg: 4, lean: [dir * 0.46, 0] });
      if (canopy === "plants" && i === 0) out.push(...climber(x, z + sz * 0.1, by, rnd));
    }
  }
  for (const sz of [-1, 1]) out.push(box(0, by, sz * (d / 2 - post / 2), w + 0.4, 0.18, 0.07, W));
  const nr = Math.max(3, Math.round((w + 0.3) / 0.5));
  for (let i = 0; i < nr; i++) out.push(box(-w / 2 - 0.1 + ((w + 0.2) * (i + 0.5)) / nr, ty, 0, 0.05, 0.15, d + 0.5, W));
  out.push(...canopyParts(canopy, w + 0.3, d + 0.4, h, W, rnd));
  return out;
}

/** An aluminium pergola with a deep frame on four posts and blades that tilt open. */
function louvred(w: number, d: number, h: number, item?: Furniture): Part[] {
  const canopy = gardenChoice("pergola_louvred", item).canopy!;
  const A = "dark";
  const p = 0.15, fh = 0.22;
  const out: Part[] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push(box(sx * (w / 2 - p / 2), 0, sz * (d / 2 - p / 2), p, h - fh, p, A));
  for (const sz of [-1, 1]) out.push(box(0, h - fh, sz * (d / 2 - p / 2), w, fh, p, A));
  for (const sx of [-1, 1]) out.push(box(sx * (w / 2 - p / 2), h - fh, 0, p, fh, d - 2 * p, A));
  const iw = w - 2 * p, id = d - 2 * p;
  if (canopy === "louvres") {
    const n = Math.max(3, Math.round(id / 0.2));
    for (let i = 0; i < n; i++) out.push(box(0, h - fh / 2 - 0.006, -id / 2 + (id * (i + 0.5)) / n, iw, 0.012, 0.18, A, { shear: 0.84 }));
  } else if (canopy === "glass") out.push(box(0, h - 0.06, 0, iw + 0.01, 0.012, id + 0.01, "glass"));
  else out.push(box(0, h - 0.07, 0, iw, 0.01, id, "canvas"));
  return out;
}

/** A pergola against a wall: posts at the front, a plate on the wall behind, rafters falling to the front. */
function leanTo(w: number, d: number, h: number, item?: Furniture): Part[] {
  const canopy = gardenChoice("pergola_leanto", item).canopy!;
  const rnd = seeded(item?.id);
  const W = "softwood";
  const fall = 0.3, post = 0.12;
  const hb = h, hf = h - fall;
  const sh = -fall / d;
  const nx = Math.max(2, Math.ceil(w / 3.2) + 1);
  const out: Part[] = [];
  for (let i = 0; i < nx; i++) {
    const x = -w / 2 + post / 2 + ((w - post) * i) / (nx - 1);
    out.push(box(x, 0, d / 2 - post / 2, post, hf - 0.33, post, W));
    if (canopy === "plants" && (i === 0 || i === nx - 1)) out.push(...climber(x, d / 2 + 0.05, hf - 0.33, rnd));
  }
  out.push(box(0, hf - 0.33, d / 2 - post / 2, w + 0.3, 0.18, 0.07, W));
  out.push(box(0, hb - 0.33, -d / 2 + 0.025, w + 0.3, 0.17, 0.05, W));
  // rafters from the wall plate over the front beam, falling to the front
  const nr = Math.max(3, Math.round((w + 0.2) / 0.6));
  const mid = (hb + hf) / 2 - 0.15;
  for (let i = 0; i < nr; i++) out.push(box(-w / 2 - 0.05 + ((w + 0.1) * (i + 0.5)) / nr, mid, 0.075, 0.05, 0.15, d + 0.15, W, { shear: sh }));
  const top = mid + 0.15;
  if (canopy === "glass") out.push(box(0, top + 0.004, 0.075, w + 0.2, 0.012, d + 0.15, "glass", { shear: sh }));
  else if (canopy === "canvas") out.push(box(0, top + 0.004, 0.075, w, 0.01, d, "canvas", { shear: sh }));
  else if (canopy === "slats") {
    const n = Math.max(3, Math.round(d / 0.15));
    for (let i = 0; i < n; i++) {
      const z = -d / 2 + 0.075 + (d * (i + 0.5)) / n;
      out.push(box(0, top + sh * (z - 0.075), z, w + 0.2, 0.022, 0.045, W));
    }
  } else if (canopy === "plants") out.push(...canopyParts("plants", w, d, top - 0.05, W, rnd));
  return out;
}

/** A gazebo: four posts with rails, beams round the top and a hipped roof with a finial. */
function gazebo(w: number, d: number, h: number, item?: Furniture): Part[] {
  const roof = ROOF_ROLE[gardenChoice("gazebo", item).roofing!];
  const W = "softwood";
  const post = 0.12;
  const he = h * 0.72, rise = h - he;
  const out: Part[] = [box(0, 0, 0, w, 0.1, d, W)];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) out.push(box(sx * (w / 2 - 0.1), 0.1, sz * (d / 2 - 0.1), post, he - 0.28, post, W));
  for (const sz of [-1, 1]) out.push(box(0, he - 0.18, sz * (d / 2 - 0.1), w - 0.06, 0.16, 0.08, W));
  for (const sx of [-1, 1]) out.push(box(sx * (w / 2 - 0.1), he - 0.18, 0, 0.08, 0.16, d - 0.36, W));
  // rails round three sides, the front open
  for (const sx of [-1, 1]) out.push(box(sx * (w / 2 - 0.1), 0.85, 0, 0.05, 0.06, d - 0.32, W));
  out.push(box(0, 0.85, -(d / 2 - 0.1), w - 0.32, 0.06, 0.05, W));
  out.push({ shape: "hip", x: 0, y: he, z: 0, w: w + 0.5, h: rise - 0.1, d: d + 0.5, role: roof, ridge: Math.max(0, w - d) });
  out.push(ball(0, h - 0.13, 0, 0.1, 0.16, 0.1, W, 8));
  return out;
}

/** A garden arch: posts in pairs, a flat top, trellis sides and climbing plants. */
function arch(w: number, d: number, h: number, item?: Furniture, seat = false): Part[] {
  const canopy = gardenChoice(seat ? "arbour" : "garden_arch", item).canopy!;
  const rnd = seeded(item?.id);
  const W = "softwood";
  const post = 0.07;
  const out: Part[] = [];
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 - post / 2);
    for (const sz of [-1, 1]) out.push(box(x, 0, sz * (d / 2 - post / 2), post, h - 0.12, post, W));
    // trellis between each pair of posts
    for (let y = 0.3; y < h - 0.3; y += 0.2) out.push(box(x, y, 0, 0.025, 0.025, d - 2 * post, W));
    for (const z of [-d / 6, d / 6]) out.push(box(x, 0.2, z, 0.02, h - 0.45, 0.02, W));
    if (canopy === "plants") out.push(...climber(x + sx * 0.06, 0, h - 0.1, rnd));
  }
  for (const sz of [-1, 1]) out.push(box(0, h - 0.12, sz * (d / 2 - post / 2), w + 0.2, 0.1, 0.045, W));
  const n = Math.max(3, Math.round(w / 0.25));
  for (let i = 0; i < n; i++) out.push(box(-w / 2 + (w * (i + 0.5)) / n, h - 0.04, 0, 0.04, 0.04, d + 0.15, W));
  if (canopy === "plants") out.push(...canopyParts("plants", w, d, h + 0.05, W, rnd));
  if (seat) {
    out.push(box(0, 0.42, 0, w - 2 * post, 0.04, d - 2 * post - 0.02, W));
    out.push(box(0, 0, 0, w - 2 * post - 0.1, 0.42, 0.04, W));
    // a trellis back
    for (let y = 0.6; y < h - 0.3; y += 0.18) out.push(box(0, y, -d / 2 + post / 2, w - 2 * post, 0.025, 0.02, W));
  }
  return out;
}

// -------------------------------------------------------------------------------- planters

/** What grows in a planter w x d whose soil is at y; round planters keep their plants in the circle. */
function planting(kind: Planting, w: number, d: number, y: number, rnd: () => number, round = false): Part[] {
  const out: Part[] = [];
  const iw = w - 0.06, id = d - 0.06;
  const spot = (): [number, number] => {
    for (;;) {
      const x = (rnd() - 0.5) * iw * 0.85, z = (rnd() - 0.5) * id * 0.85;
      if (!round || (x / (iw / 2)) ** 2 + (z / (id / 2)) ** 2 < 0.7) return [x, z];
    }
  };
  const count = (per: number) => Math.max(1, Math.round(iw * id * per));
  switch (kind) {
    case "flowers": {
      out.push(ball(0, y - 0.06, 0, iw * 0.95, 0.24, id * 0.95, "leaf", 9));
      const tones: Role[] = ["bloom", "bloom", "red", "accent", "white", "lavender"];
      for (let i = 0, n = Math.min(24, count(40)); i < n; i++) {
        const [x, z] = spot();
        const s = 0.07 + rnd() * 0.06;
        out.push(ball(x, y + 0.08 + rnd() * 0.06, z, s, s * 0.8, s, tones[Math.floor(rnd() * tones.length)], 6));
      }
      break;
    }
    case "shrubs": {
      for (let i = 0, n = Math.max(2, Math.min(5, count(5))); i < n; i++) {
        const [x, z] = spot();
        const s = Math.min(iw, id, 0.6) * (0.55 + rnd() * 0.35);
        out.push(ball(x, y - 0.04, z, s, s * (0.9 + rnd() * 0.4), s, i % 2 ? "plant" : "leaf", 9));
      }
      break;
    }
    case "grasses": {
      // tufts of blades fanning out
      for (let i = 0, n = Math.max(3, Math.min(10, count(20))); i < n; i++) {
        const [x, z] = spot();
        const role: Role = rnd() > 0.4 ? "straw" : "leaf";
        for (let b = 0; b < 4; b++) {
          const a = rnd() * Math.PI * 2, hh = 0.3 + rnd() * 0.35;
          out.push({ shape: "cyl", x, y: y - 0.02, z, w: 0.05, h: hh, d: 0.05, role, seg: 4, taper: 0, lean: [Math.cos(a) * hh * 0.35, Math.sin(a) * hh * 0.35] });
        }
      }
      break;
    }
    case "lavender": {
      for (let i = 0, n = Math.min(12, count(12)); i < n; i++) {
        const [x, z] = spot();
        out.push(ball(x, y - 0.03, z, 0.22, 0.18, 0.22, "plant", 7));
        out.push(ball(x, y + 0.1, z, 0.2, 0.14, 0.2, "lavender", 7));
      }
      break;
    }
    case "herbs": {
      for (let i = 0, n = Math.min(10, count(14)); i < n; i++) {
        const [x, z] = spot();
        const s = 0.14 + rnd() * 0.1;
        out.push(ball(x, y - 0.03, z, s, s * 0.8, s, i % 3 ? "leaf" : "plant", 7));
      }
      break;
    }
    case "vegetables": {
      // rows along the bed, the odd tomato
      const rows = Math.max(1, Math.round(id / 0.35));
      for (let r = 0; r < rows; r++) {
        const z = -id / 2 + (id * (r + 0.5)) / rows;
        const n = Math.max(1, Math.round(iw / 0.3));
        for (let i = 0; i < n; i++) {
          const x = -iw / 2 + (iw * (i + 0.5)) / n;
          const s = 0.18 + rnd() * 0.06;
          out.push(ball(x, y - 0.03, z, s, s * (r % 2 ? 1.3 : 0.8), s, r % 2 ? "leaf" : "plant", 7));
          if (r % 3 === 1 && rnd() > 0.5) out.push(ball(x + 0.05, y + 0.12, z + 0.04, 0.05, 0.05, 0.05, "red", 6));
        }
      }
      break;
    }
    case "topiary": {
      const s = Math.min(iw, id) * 0.95;
      out.push(cyl(0, y - 0.02, 0, 0.04, s * 0.4, 0.04, "woodDark", 6));
      out.push(ball(0, y + s * 0.3, 0, s, s, s, "leaf", 10));
      break;
    }
    case "tree": {
      const s = Math.max(0.5, Math.min(iw, id) * 1.6);
      out.push(cyl(0, y - 0.02, 0, 0.06, 0.9, 0.06, "woodDark", 6, 0.7));
      out.push(ball(0, y + 0.7, 0, s, s * 0.8, s, "plant", 10));
      break;
    }
    default:
      break;
  }
  return out;
}

/** A planter's own role, from its material (or its type's usual). */
function planterRole(type: string, item?: Furniture): Role {
  return PLANTER_MATERIALS[gardenChoice(type, item).material ?? "timber"].role;
}

/** A planter body of its material, soil a little under its rim, and its plants. */
function planter(type: string, shape: (role: Role) => { parts: Part[]; soil: number; w: number; d: number; round?: boolean }) {
  return (w: number, d: number, h: number, item?: Furniture): Part[] => {
    void w; void d; void h;
    const role = planterRole(type, item);
    const body = shape(role);
    const plants = gardenChoice(type, item).plants ?? "flowers";
    return [...body.parts, ...planting(plants, body.w, body.d, body.soil, seeded(item?.id), body.round)];
  };
}

/** A box planter: walls round soil, its top a few centimetres above the soil. */
function boxPlanter(w: number, d: number, h: number, role: Role, feet = 0): { parts: Part[]; soil: number; w: number; d: number } {
  const t = 0.03;
  const parts: Part[] = [
    box(0, feet, -d / 2 + t / 2, w, h - feet, t, role),
    box(0, feet, d / 2 - t / 2, w, h - feet, t, role),
    box(-w / 2 + t / 2, feet, 0, t, h - feet, d - 2 * t, role),
    box(w / 2 - t / 2, feet, 0, t, h - feet, d - 2 * t, role),
    box(0, h - 0.05, 0, w - 2 * t, 0.01, d - 2 * t, "soil"),
  ];
  if (feet > 0) for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(box(sx * (w / 2 - 0.04), 0, sz * (d / 2 - 0.04), 0.05, feet, 0.05, role));
  else parts.push(box(0, 0, 0, w - 2 * t, h - 0.05, d - 2 * t, "soil"));
  return { parts, soil: h - 0.04, w, d };
}

// -------------------------------------------------------------------------------- the types

const SHED_ROOFS: GardenRoofing[] = ["felt", "shingles", "corrugated", "epdm", "sedum"];

export const GARDEN_OPTIONS: Record<string, GardenOptions> = {
  pergola: { canopies: ["open", "slats", "glass", "canvas", "plants"] },
  pergola_louvred: { canopies: ["louvres", "glass", "canvas"] },
  pergola_leanto: { canopies: ["glass", "open", "slats", "canvas", "plants"] },
  gazebo: { roofings: ["shingles", "felt"] },
  garden_arch: { canopies: ["plants", "open"] },
  arbour: { canopies: ["plants", "open"] },
  shed: { roofings: SHED_ROOFS, doors: ["centre", "left", "right", "double"], windows: [3, 1] },
  shed_reverse: { roofings: SHED_ROOFS, doors: ["left", "centre", "right", "double"], windows: [3, 1] },
  shed_pent: { roofings: SHED_ROOFS, doors: ["right", "left", "centre", "double"], windows: [2, 1] },
  summerhouse: { roofings: ["shingles", "felt", "corrugated", "epdm", "sedum"], windows: [2, 2] },
  log_cabin: { roofings: ["shingles", "felt", "corrugated", "epdm", "sedum"], windows: [4, 2] },
  garden_office: { roofings: ["epdm", "sedum", "felt"], doors: ["double", "left", "right"] },
  planter: { material: "timber", plants: "flowers" },
  raised_bed: { material: "sleepers", plants: "vegetables" },
  planter_cube: { material: "fibreclay", plants: "topiary" },
  planter_round: { material: "terracotta", plants: "shrubs" },
  planter_tall: { material: "fibreclay", plants: "grasses" },
  planter_tiered: { material: "timber", plants: "herbs" },
};

/** A shed's spec from its item's choices (or its type's usual ones). */
function shedSpec(type: string, item: Furniture | undefined, base: Omit<ShedSpec, "roof" | "door" | "windows">): ShedSpec {
  const c = gardenChoice(type, item);
  return { ...base, roof: ROOF_ROLE[c.roofing ?? "felt"], door: c.door ?? "double", windows: c.windows };
}

/** A garden piece's choices: its own where it has them, else its type's usual. */
export function gardenChoice(type: string, item?: Pick<Furniture, "canopy" | "roofing" | "door" | "windows" | "material" | "plants">): {
  canopy: Canopy | null; roofing: GardenRoofing | null; door: ShedDoor | null; windows: number; material: PlanterMaterial | null; plants: Planting | null;
} {
  const o = GARDEN_OPTIONS[type] ?? {};
  const first = <T extends string>(v: string | null | undefined, list?: T[]) => (list?.length ? pick(v, list, list[0]) : null);
  const [most, usual] = o.windows ?? [0, 0];
  return {
    canopy: first(item?.canopy, o.canopies),
    roofing: first(item?.roofing, o.roofings),
    door: first(item?.door, o.doors),
    windows: Math.max(0, Math.min(most, Math.round(item?.windows ?? usual))),
    material: o.material ? pick(item?.material, Object.keys(PLANTER_MATERIALS) as PlanterMaterial[], o.material) : null,
    plants: o.plants ? pick(item?.plants, Object.keys(PLANTING_NAMES) as Planting[], o.plants) : null,
  };
}

const planterPaint = (type: string) => (item?: Furniture): Role[] => [planterRole(type, item)];

export const GARDEN_FURNITURE: Record<string, FurnitureType> = {
  // ---------------------------------------------------------------- pergolas
  pergola: { label: "furniture.pergola", category: "outdoor", family: "pergola", size: [3.0, 3.0, 2.5], paint: ["softwood"], build: (w, d, h, item) => pergola(w, d, h, item) },
  pergola_louvred: { label: "furniture.pergola_louvred", category: "outdoor", family: "pergola", size: [4.0, 3.0, 2.6], paint: ["dark"], build: (w, d, h, item) => louvred(w, d, h, item) },
  pergola_leanto: { label: "furniture.pergola_leanto", category: "outdoor", family: "pergola", size: [4.0, 2.5, 2.7], paint: ["softwood"], build: (w, d, h, item) => leanTo(w, d, h, item) },
  gazebo: { label: "furniture.gazebo", category: "outdoor", family: "pergola", size: [3.0, 3.0, 3.0], paint: ["softwood"], build: (w, d, h, item) => gazebo(w, d, h, item) },
  garden_arch: { label: "furniture.garden_arch", category: "outdoor", family: "pergola", size: [1.4, 0.6, 2.3], paint: ["softwood"], build: (w, d, h, item) => arch(w, d, h, item) },
  arbour: { label: "furniture.arbour", category: "outdoor", family: "pergola", size: [1.6, 0.7, 2.2], paint: ["softwood"], build: (w, d, h, item) => arch(w, d, h, item, true) },
  // ---------------------------------------------------------------- sheds and garden buildings
  shed: {
    label: "furniture.shed", category: "outdoor", family: "shed", size: [1.83, 2.44, 2.2], paint: ["shiplap"], trim: ["softwood"],
    // the ridge runs back from the door in the gable end: made door towards +x, turned to face +z
    build: (w, d, h, item) => turned(apexShed(d, w, h, shedSpec("shed", item, { wall: "shiplap", trim: "softwood", doorEnd: true, pitch: 0.42, eaves: 0.1 }))),
  },
  shed_reverse: {
    label: "furniture.shed_reverse", category: "outdoor", family: "shed", size: [2.44, 1.83, 2.15], paint: ["shiplap"], trim: ["softwood"],
    build: (w, d, h, item) => apexShed(w, d, h, shedSpec("shed_reverse", item, { wall: "shiplap", trim: "softwood", doorEnd: false, pitch: 0.45, eaves: 0.1 })),
  },
  shed_pent: {
    label: "furniture.shed_pent", category: "outdoor", family: "shed", size: [2.44, 1.83, 2.05], paint: ["shiplap"], trim: ["softwood"],
    build: (w, d, h, item) => pentShed(w, d, h, shedSpec("shed_pent", item, { wall: "shiplap", trim: "softwood", doorEnd: false, pitch: 0, eaves: 0.1 })),
  },
  summerhouse: {
    label: "furniture.summerhouse", category: "outdoor", family: "shed", size: [3.0, 2.6, 2.7], paint: ["shiplap"], trim: ["primed"],
    build: (w, d, h, item) => apexShed(w, d, h, {
      ...shedSpec("summerhouse", item, { wall: "shiplap", trim: "primed", doorEnd: false, pitch: 0.5, eaves: 0.15, glazed: true, porch: 0.6, windowSize: [0.45, 1.1] }),
      door: "double",
    }),
  },
  log_cabin: {
    label: "furniture.log_cabin", category: "outdoor", family: "shed", size: [4.0, 3.6, 2.7], paint: ["logs"], trim: ["woodDark"],
    build: (w, d, h, item) => apexShed(w, d, h, {
      ...shedSpec("log_cabin", item, { wall: "logs", trim: "woodDark", doorEnd: false, pitch: 0.42, eaves: 0.25, glazed: true, porch: 0.8, logs: true, windowSize: [0.7, 0.9] }),
      door: "double",
    }),
  },
  garden_office: {
    label: "furniture.garden_office", category: "outdoor", family: "shed", size: [4.0, 3.0, 2.5], paint: ["shiplap"], trim: ["dark"],
    build: (w, d, h, item) => gardenOffice(w, d, h, ROOF_ROLE[gardenChoice("garden_office", item).roofing!], gardenChoice("garden_office", item).door!),
  },
  metal_shed: {
    label: "furniture.metal_shed", category: "outdoor", family: "shed", size: [2.6, 1.8, 1.95], paint: ["corrugated"], trim: ["galvanised"],
    build: (w, d, h) => apexShed(w, d, h, { wall: "corrugated", roof: "corrugated", trim: "galvanised", door: "double", doorEnd: false, windows: 0, pitch: 0.18, eaves: 0.06, doorWidth: Math.min(1.5, w * 0.55) }),
  },
  greenhouse: {
    label: "furniture.greenhouse", category: "outdoor", family: "shed", size: [1.9, 2.5, 2.2], paint: ["metal"],
    build: (w, d, h) => turned(greenhouse(d, w, h, "metal")),
  },
  // ---------------------------------------------------------------- planters
  planter: {
    label: "furniture.planter", category: "outdoor", family: "planter", size: [1.2, 0.45, 0.45], paintFor: planterPaint("planter"),
    build: (w, d, h, item) => planter("planter", (r) => boxPlanter(w, d, h, r, 0.06))(w, d, h, item),
  },
  raised_bed: {
    label: "furniture.raised_bed", category: "outdoor", family: "planter", size: [2.4, 1.2, 0.4], paintFor: planterPaint("raised_bed"),
    build: (w, d, h, item) => planter("raised_bed", (r) => {
      // sleepers laid in courses, lapping at the corners
      const t = 0.1, n = Math.max(1, Math.round(h / 0.2)), ch = h / n;
      const parts: Part[] = [];
      for (let c = 0; c < n; c++) {
        const y = c * ch, long = c % 2 === 0;
        parts.push(box(0, y, -d / 2 + t / 2, long ? w : w - 2 * t, ch - 0.004, t, r), box(0, y, d / 2 - t / 2, long ? w : w - 2 * t, ch - 0.004, t, r));
        parts.push(box(-w / 2 + t / 2, y, 0, t, ch - 0.004, long ? d - 2 * t : d, r), box(w / 2 - t / 2, y, 0, t, ch - 0.004, long ? d - 2 * t : d, r));
      }
      parts.push(box(0, 0, 0, w - 2 * t, h - 0.06, d - 2 * t, "soil"));
      return { parts, soil: h - 0.05, w: w - 2 * t, d: d - 2 * t };
    })(w, d, h, item),
  },
  planter_cube: {
    label: "furniture.planter_cube", category: "outdoor", family: "planter", size: [0.5, 0.5, 0.5], paintFor: planterPaint("planter_cube"),
    build: (w, d, h, item) => planter("planter_cube", (r) => boxPlanter(w, d, h, r))(w, d, h, item),
  },
  planter_round: {
    label: "furniture.planter_round", category: "outdoor", family: "planter", size: [0.6, 0.6, 0.5], paintFor: planterPaint("planter_round"),
    build: (w, d, h, item) => planter("planter_round", (r) => ({
      parts: [cyl(0, 0, 0, w * 0.82, h, d * 0.82, r, 18, 1.22), cyl(0, h - 0.04, 0, w * 0.94, 0.01, d * 0.94, "soil", 18)],
      soil: h - 0.03, w: w * 0.9, d: d * 0.9, round: true,
    }))(w, d, h, item),
  },
  planter_tall: {
    label: "furniture.planter_tall", category: "outdoor", family: "planter", size: [0.4, 0.4, 0.9], paintFor: planterPaint("planter_tall"),
    build: (w, d, h, item) => planter("planter_tall", (r) => boxPlanter(w, d, h, r))(w, d, h, item),
  },
  planter_tiered: {
    label: "furniture.planter_tiered", category: "outdoor", family: "planter", size: [1.0, 0.8, 0.6], paintFor: planterPaint("planter_tiered"),
    build: (w, d, h, item) => {
      // three troughs stepping up to the back, each with its own plants
      const role = planterRole("planter_tiered", item);
      const kind = gardenChoice("planter_tiered", item).plants ?? "herbs";
      const rnd = seeded(item?.id);
      const out: Part[] = [];
      const td = d / 3;
      for (let i = 0; i < 3; i++) {
        const th = (h * (i + 1)) / 3;
        const z = d / 2 - td * (i + 0.5);
        const b = boxPlanter(w, td, th, role);
        out.push(...b.parts.map((p) => ({ ...p, z: p.z + z })));
        out.push(...planting(kind, w, td, b.soil, rnd).map((p) => ({ ...p, z: p.z + z })));
      }
      return out;
    },
  },
};
