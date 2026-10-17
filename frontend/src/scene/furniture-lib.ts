// Built-in furniture and decoration, made of a few simple solids each (boxes, cylinders, cones,
// balls, prisms) so a whole floor merges into one mesh and renders in a single draw call, even on
// a Fire tablet.
//
// Each type builds its parts for a given size: x/z offsets from the item's middle, y from the
// floor, width along x, depth along z (front = +z), height along y, all in metres. Types of the
// same family can be swapped for each other in the editor (a sofa for a corner sofa).
import type { Furniture } from "../model/plan";
import type { Upholstery } from "./finishes";

export type Role =
  | "wood" | "woodDark" | "fabric" | "fabricDark" | "cushion" | "white" | "metal" | "dark"
  | "glass" | "plant" | "leaf" | "pot" | "soil" | "accent" | "red" | "blue" | "screen" | "ceramic"
  | "rug" | "mattress" | "bulb" | "paper" | "canvas" | "mirror" | "water" | "rubber"
  // balustrade materials
  | "pine" | "softwood" | "oak" | "walnut" | "primed" | "blackMetal"
  // fences and garden walls
  | "concrete" | "brick";

/** Parts that light up with their entity: a TV screen, a lamp shade. */
export type Glow = "screen" | "lamp";

export interface Part {
  /**
   * box; cyl (a cylinder, cone or disc); ball (an ellipsoid); prism (a roof-like ridge along x);
   * hull (a side outline extruded across x: a car's body).
   */
  shape: "box" | "cyl" | "ball" | "prism" | "hull";
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  role: Role;
  glow?: Glow;
  /** Segments around (default 12). */
  seg?: number;
  /** Cylinders: radius at the top end as a fraction of the bottom one (0 = a cone). */
  taper?: number;
  /** Cylinders lying down, along x or z (a dumbbell's bar, a wheel, a clock face). */
  axis?: "x" | "z";
  /** Boxes: how much the box rises per metre along z (a handrail following a stair's pitch). */
  shear?: number;
  /** Upright cylinders: how far the top end sits from the bottom one along x and z (a splayed leg). */
  lean?: [number, number];
  /** Hulls: the outline seen from the side, as [along z, up y] in 0..1 of the part's depth and height. */
  outline?: [number, number][];
  /** Hulls: how far each side leans in at the top (m), like a car's windows. */
  inset?: number;
}

export type Category =
  | "living" | "dining" | "kitchen" | "bedroom" | "bath" | "office" | "decor" | "plants" | "fitness"
  | "kids" | "outdoor" | "lights" | "utility" | "structure";

export const CATEGORY_NAMES: Record<Category, string> = {
  living: "Living", dining: "Dining", kitchen: "Kitchen", bedroom: "Bedroom", bath: "Bathroom",
  office: "Office", decor: "Decor", plants: "Plants", fitness: "Fitness", kids: "Kids",
  outdoor: "Garden", lights: "Lights", utility: "Utility", structure: "Structure",
};

export interface FurnitureType {
  name: string;
  category: Category;
  /** Interchangeable types share a family ("sofa": straight, corner, chesterfield...). */
  family?: string;
  /** Usual width, depth, height. */
  size: [number, number, number];
  /** Usual height of its bottom above the floor (wall cabinets, wall TVs, wall lamps, pictures). */
  y?: number;
  /** The upholstery it comes in unless changed. */
  finish?: Upholstery;
  /** Roles a picked colour applies to (default: upholstery, else wood, else the body). */
  paint?: Role[];
  /** The item itself is passed when there is one (a staircase's balustrade). */
  build: (w: number, d: number, h: number, item?: Furniture) => Part[];
}

const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, glow?: Glow): Part => ({
  shape: "box", x, y, z, w, h, d, role, glow,
});
const cyl = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, glow?: Glow, seg?: number, taper?: number): Part => ({
  shape: "cyl", x, y, z, w, h, d, role, glow, seg, taper,
});
/** A cylinder lying along x (or z): x/z its middle, y its bottom, w x h x d its bounding box. */
const rod = (axis: "x" | "z", x: number, y: number, z: number, w: number, h: number, d: number, role: Role, seg = 10): Part => ({
  shape: "cyl", axis, x, y, z, w, h, d, role, seg,
});
const ball = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, seg = 10, glow?: Glow): Part => ({
  shape: "ball", x, y, z, w, h, d, role, seg, glow,
});
const prism = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role): Part => ({
  shape: "prism", x, y, z, w, h, d, role,
});
/** A side outline ([z, y] in metres) extruded w wide around x, leaning in by `inset` at the top. */
function hull(x: number, w: number, pts: [number, number][], role: Role, inset = 0): Part {
  const zs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const z0 = Math.min(...zs), z1 = Math.max(...zs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const d = z1 - z0 || 1, h = y1 - y0 || 1;
  return { shape: "hull", x, y: y0, z: (z0 + z1) / 2, w, h, d, role, inset, outline: pts.map(([z, y]) => [(z - z0) / d, (y - y0) / h]) };
}

/** A car's lines: its body's top from the nose back, its glasshouse, its wheels (all in 0..1 of length and height, from the back). */
interface CarStyle {
  top: [number, number][];
  cabin: [number, number][];
  wheels: [number, number];
}

const CAR_STYLES: Record<"hatchback" | "saloon" | "suv" | "estate", CarStyle> = {
  hatchback: {
    top: [[1, 0.4], [0.96, 0.5], [0.72, 0.6], [0.02, 0.62], [0, 0.42]],
    cabin: [[0.03, 0.61], [0.06, 0.92], [0.15, 0.99], [0.56, 0.99], [0.73, 0.595]],
    wheels: [0.2, 0.81],
  },
  saloon: {
    top: [[1, 0.4], [0.96, 0.48], [0.71, 0.58], [0.18, 0.64], [0.03, 0.64], [0, 0.46]],
    cabin: [[0.17, 0.63], [0.36, 0.99], [0.57, 0.99], [0.71, 0.575]],
    wheels: [0.21, 0.8],
  },
  suv: {
    top: [[1, 0.46], [0.965, 0.56], [0.73, 0.64], [0.03, 0.66], [0, 0.47]],
    cabin: [[0.03, 0.65], [0.055, 0.93], [0.13, 0.99], [0.57, 0.99], [0.73, 0.635]],
    wheels: [0.2, 0.8],
  },
  estate: {
    top: [[1, 0.4], [0.96, 0.5], [0.72, 0.6], [0.02, 0.62], [0, 0.42]],
    cabin: [[0.025, 0.61], [0.04, 0.95], [0.09, 0.99], [0.57, 0.99], [0.73, 0.595]],
    wheels: [0.19, 0.81],
  },
};

/** A car of a style: body, tinted glasshouse under a roof, wheels with hubs, lights, plates, mirrors and a charging port. */
function carParts(w: number, d: number, h: number, style: CarStyle): Part[] {
  const Z = (u: number) => -d / 2 + u * d, Y = (v: number) => v * h;
  const r = Math.min(0.4, Math.max(0.26, h * 0.21));
  const sill = r * 0.6, ra = r + 0.04;
  // along the bottom from the back, up and over each wheel
  const arch = (zc: number): [number, number][] => [
    [zc - ra, sill], ...Array.from({ length: 7 }, (_, k) => [zc - ra * Math.cos((k * Math.PI) / 6), r + ra * Math.sin((k * Math.PI) / 6)] as [number, number]), [zc + ra, sill],
  ];
  const [ur, uf] = style.wheels;
  const body: [number, number][] = [
    [Z(0.012), sill], ...arch(Z(ur)), ...arch(Z(uf)), [Z(0.99), sill], ...style.top.map(([u, v]) => [Z(u), Y(v)] as [number, number]),
  ];
  const wc = w - 0.08, lean = 0.13;
  const cabin = style.cabin.map(([u, v]) => [Z(u), Y(v)] as [number, number]);
  const roofTop = cabin.filter(([, y]) => y >= Y(0.98)).map(([z]) => z);
  const r0 = Math.min(...roofTop), r1 = Math.max(...roofTop), top = Y(0.99);
  const tw = 0.21, wx = w / 2 - 0.03 - tw / 2;
  const out: Part[] = [
    hull(0, w, body, "accent", 0.02),
    hull(0, wc, cabin, "dark", lean),
    hull(0, wc - 2 * lean + 0.02, [[r0 - 0.05, top - 0.04], [r0 + 0.03, top + 0.012], [r1 - 0.03, top + 0.012], [r1 + 0.06, top - 0.04]], "accent", 0.005),
  ];
  for (const zc of [Z(ur), Z(uf)]) {
    for (const sx of [-1, 1]) {
      out.push(rod("x", sx * wx, 0, zc, tw, 2 * r, 2 * r, "rubber", 16));
      out.push(rod("x", sx * wx, r * 0.42, zc, tw + 0.014, r * 1.16, r * 1.16, "metal", 10));
    }
  }
  // lights and plates stand a little proud of the nearly upright nose and tail
  const nose = Z(0.995), tail = Z(0.006);
  for (const sx of [-1, 1]) {
    out.push(box(sx * (w / 2 - 0.24), Y(0.3), nose, 0.3, Y(0.07), 0.05, "bulb"));
    out.push(box(sx * (w / 2 - 0.2), Y(0.47), tail, 0.28, Y(0.06), 0.05, "red"));
    out.push(box(sx * (wc / 2 + 0.05), Y(0.62), Z(0.7), 0.12, 0.07, 0.1, "accent"));
  }
  out.push(box(0, Y(0.16), nose, 0.52, 0.11, 0.04, "white"), box(0, Y(0.3), tail, 0.52, 0.11, 0.04, "white"));
  // the charging port in the nose: lit while the car is plugged in
  out.push(box(0, Y(0.34), nose, 0.18, 0.045, 0.05, "screen", "screen"));
  return out;
}

/** Four legs at the corners of a w x d footprint. */
function legs(w: number, d: number, h: number, t = 0.04, inset = 0.03, role: Role = "woodDark"): Part[] {
  const x = w / 2 - inset - t / 2;
  const z = d / 2 - inset - t / 2;
  return [box(-x, 0, -z, t, h, t, role), box(x, 0, -z, t, h, t, role), box(-x, 0, z, t, h, t, role), box(x, 0, z, t, h, t, role)];
}

/** Four round legs, thinner at the foot. */
function roundLegs(w: number, d: number, h: number, t = 0.045, inset = 0.05, role: Role = "woodDark"): Part[] {
  const x = w / 2 - inset;
  const z = d / 2 - inset;
  return [[-x, -z], [x, -z], [-x, z], [x, z]].map(([px, pz]) => cyl(px, 0, pz, t * 0.7, h, t * 0.7, role, undefined, 6, 1.4));
}

/**
 * Four round legs splaying out from under a seat or top: their tops at (±top[0], top[1] ± top[2])
 * — x, then the middle and half-spread along z — and their feet at (±foot[0], ±foot[1]).
 */
function splayLegs(top: [number, number, number], foot: [number, number], h: number, t = 0.04, role: Role = "woodDark"): Part[] {
  return [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => ({
    ...cyl(sx * foot[0], 0, sz * foot[1], t * 0.7, h, t * 0.7, role, undefined, 6, 1.4),
    lean: [sx * (top[0] - foot[0]), top[1] + sz * top[2] - sz * foot[1]] as [number, number],
  }));
}

/** Where a splayed leg's middle is at height y, as a half-spread along x. */
function splayAt(top: number, foot: number, h: number, y: number): number {
  return foot + ((top - foot) * y) / h;
}

/** The half-spread along each axis of the points k of the way out on a round top's diagonals. */
function onRound(w: number, d: number, k: number): [number, number] {
  return [(k * w) / 2 / Math.SQRT2, (k * d) / 2 / Math.SQRT2];
}

/** Round legs splaying from k0 to k1 of a round top's radius (straight down when they are equal). */
function roundTopLegs(w: number, d: number, h: number, k0: number, k1: number, t = 0.04, role: Role = "woodDark"): Part[] {
  const [tx, tz] = onRound(w, d, k0);
  return splayLegs([tx, 0, tz], onRound(w, d, k1), h, t, role);
}

/** A round shelf at height y whose rim runs through the middle of roundTopLegs(w, d, h, k0, k1). */
function legShelf(w: number, d: number, h: number, k0: number, k1: number, y: number, t: number, role: Role, seg = 14): Part {
  const k = k1 + ((k0 - k1) * (y + t / 2)) / h;
  return cyl(0, y, 0, k * w + 0.02, t, k * d + 0.02, role, undefined, seg);
}

function sofa(w: number, d: number, h: number, arms = true): Part[] {
  const arm = arms ? Math.min(0.2, w * 0.12) : 0;
  const seatH = Math.min(0.45, h * 0.55);
  const back = Math.min(0.22, d * 0.25);
  const inner = w - 2 * arm;
  const parts: Part[] = [
    box(0, 0.06, 0, w, seatH - 0.18, d, "fabricDark"),
    box(0, 0.06, -d / 2 + back / 2, w, h - 0.06, back, "fabric"),
  ];
  if (arms) {
    parts.push(box(-w / 2 + arm / 2, 0.06, 0, arm, seatH + 0.12, d, "fabric"));
    parts.push(box(w / 2 - arm / 2, 0.06, 0, arm, seatH + 0.12, d, "fabric"));
  }
  const n = inner > 1.6 ? 3 : inner > 0.9 ? 2 : 1;
  const cw = inner / n;
  for (let i = 0; i < n; i++) {
    parts.push(box(-inner / 2 + cw * (i + 0.5), seatH - 0.12, back / 2, cw - 0.02, 0.12, d - back - 0.02, "cushion"));
  }
  parts.push(...legs(w, d, 0.06, 0.05, 0.04, "dark"));
  return parts;
}

/** A seat block without back or arms (a chaise end, a modular section). */
function seatBlock(w: number, d: number, seatH = 0.42): Part[] {
  return [box(0, 0.06, 0, w, seatH - 0.18, d, "fabricDark"), box(0, seatH - 0.12, 0, w - 0.02, 0.12, d - 0.02, "cushion"), ...legs(w, d, 0.06, 0.05, 0.04, "dark")];
}

function shift(parts: Part[], dx: number, dz: number): Part[] {
  return parts.map((p) => ({ ...p, x: p.x + dx, z: p.z + dz }));
}

/** A cupboard on a plinth with a worktop. The worktop overhangs at the front only, so units stand flush in a run. */
function cabinet(w: number, d: number, h: number, role: Role = "white", top: Role = "wood"): Part[] {
  return [box(0, 0.08, 0, w, h - 0.12, d, role), box(0, h - 0.04, 0.01, w, 0.04, d + 0.02, top), box(0, 0, -0.03, w - 0.04, 0.08, d - 0.06, "dark")];
}

function steps(w: number, d: number, h: number, item?: Furniture): Part[] {
  const n = Math.max(3, Math.round(h / 0.19));
  const run = d / n;
  const rise = h / n;
  const parts: Part[] = [];
  // a wooden tread on each step, its nosing over the painted riser below
  const tread = Math.min(0.03, rise / 3), nosing = Math.min(0.025, run / 6);
  for (let i = 0; i < n; i++) {
    // the bottom step is at the front (+z); every step is a solid block down to the floor. The top
    // one stops a centimetre short, so it does not fight the floor of the storey above for pixels.
    const top = i === n - 1 ? h - 0.01 : rise * (i + 1);
    const z = d / 2 - run * (i + 0.5);
    parts.push(box(0, 0, z, w, top - tread, run, "primed"));
    parts.push(box(0, top - tread, z + nosing / 2, w, tread, run + nosing, "wood"));
  }
  const style = item?.balustrade;
  if (item && style && style !== "none" && style in BALUSTRADES) parts.push(...balustrade(w, d, h, n, style, item));
  return parts;
}

export const BALUSTRADES = { none: "None", spindles: "Spindles", bars: "Slim bars", glass: "Glass", panel: "Solid panel" } as const;

export const BALUSTRADE_MATERIALS = {
  primed: { name: "White primed", role: "primed", color: 0xf3f2ee },
  pine: { name: "Pine", role: "pine", color: 0xd9a865 },
  softwood: { name: "Softwood", role: "softwood", color: 0xe6cfa3 },
  oak: { name: "Oak", role: "oak", color: 0xc39a6c },
  walnut: { name: "Walnut", role: "walnut", color: 0x6e4f38 },
  black: { name: "Black metal", role: "blackMetal", color: 0x2a2b2e },
  steel: { name: "Steel", role: "metal", color: 0xb9bec4 },
} satisfies Record<string, { name: string; role: Role; color: number }>;

export type BalustradeStyle = keyof typeof BALUSTRADES;
export type BalustradeMaterial = keyof typeof BALUSTRADE_MATERIALS;

/** The material a balustrade style comes in unless changed. */
export const BALUSTRADE_DEFAULT: Record<Exclude<BalustradeStyle, "none">, BalustradeMaterial> = {
  spindles: "primed", bars: "black", glass: "steel", panel: "primed",
};

/**
 * Newels at both ends, a closed string over the ends of the steps, a handrail 90 cm above the
 * nosings, and spindles, bars, glass or a panel between them. Going up the stairs, "right" is +x.
 */
function balustrade(w: number, d: number, h: number, n: number, style: Exclude<BalustradeStyle, "none">, item: Furniture): Part[] {
  const role = BALUSTRADE_MATERIALS[item.balustrade_material ?? BALUSTRADE_DEFAULT[style]]?.role ?? "primed";
  const run = d / n, rise = h / n;
  const slope = -rise / run;
  /** Height of the line through the nosings. */
  const pitch = (z: number) => rise + (d / 2 - z) * (rise / run);
  const side = item.balustrade_side ?? "right";
  const flip = item.mirror ? -1 : 1;
  const out: Part[] = [];
  const post = 0.09, rail = 0.9;
  const zb = d / 2 - 0.04; // bottom newel, 5 mm proud of the first step
  const zt = -d / 2 + run - 0.04; // top newel, at the top step's nosing
  const z0 = zt + post / 2, z1 = zb - post / 2;
  const zc = (z0 + z1) / 2, len = z1 - z0;
  const sloped = (x: number, y: number, pw: number, ph: number, r: Role, z = zc, l = len): Part => ({ ...box(x, y, z, pw, ph, l, r), shear: slope });
  for (const s of side === "both" ? [1, -1] : [side === "left" ? -flip : flip]) {
    const x = s * (w / 2 - 0.02);
    out.push(box(x, 0, zb, post, pitch(zb) + rail + 0.08, post, role));
    // the top newel rises through the stairwell to the landing's rail height
    out.push(box(x, h - rise - 0.02, zt, post, rise + rail + 0.1, post, role));
    // the string covers the ends of the steps and carries the balustrade; the handrail caps it
    out.push(sloped(s * (w / 2 - 0.0025), pitch(zc) - 0.3, 0.065, 0.36, role));
    out.push(sloped(x, pitch(zc) + rail - 0.06, 0.065, 0.06, role));
    if (style === "spindles" || style === "bars") {
      const t = style === "spindles" ? 0.035 : 0.016;
      const k = Math.max(2, Math.round(len / (style === "spindles" ? 0.12 : 0.11)));
      for (let i = 0; i < k; i++) {
        const z = z0 + (len * (i + 0.5)) / k;
        // from inside the string to inside the handrail
        out.push(box(x, pitch(z) + 0.03, z, t, rail - 0.06, t, role));
      }
    } else if (style === "glass") {
      const k = Math.max(1, Math.ceil(len / 1.2));
      const gap = 0.03;
      const pl = (len - gap * (k + 1)) / k;
      for (let i = 0; i < k; i++) {
        const z = z0 + gap + pl / 2 + i * (pl + gap);
        out.push(sloped(x, pitch(z) + 0.08, 0.012, rail - 0.16, "glass", z, pl));
      }
    } else {
      out.push(sloped(x, pitch(zc) + 0.04, 0.03, rail - 0.1, role));
    }
  }
  return out;
}

function bed(w: number, d: number, h: number, upholstered = false): Part[] {
  const pillows = w > 1.2 ? [-w / 4, w / 4] : [0];
  const frame: Role = upholstered ? "fabric" : "woodDark";
  return [
    box(0, 0.08, 0, w, 0.25, d, frame),
    box(0, 0.33, 0.04, w - 0.06, 0.2, d - 0.1, "mattress"),
    box(0, 0.53, 0.25, w - 0.04, 0.04, d * 0.62, upholstered ? "cushion" : "fabric"),
    box(0, 0.08, -d / 2 + (upholstered ? 0.06 : 0.04), w + (upholstered ? 0.06 : 0), Math.max(0.9, h + (upholstered ? 0.6 : 0.35)), upholstered ? 0.12 : 0.08, frame),
    ...pillows.map((x) => box(x, 0.53, -d / 2 + 0.28, Math.min(0.6, w / 2 - 0.1), 0.12, 0.35, "white")),
    ...legs(w, d, 0.08, 0.06, 0.02, "dark"),
  ];
}

/** Books on a shelf: a row of spines of varying height and colour. */
function bookRow(x0: number, x1: number, y: number, z: number, maxH: number, depth: number, seed: number): Part[] {
  const out: Part[] = [];
  const roles: Role[] = ["red", "blue", "paper", "accent", "fabricDark", "dark", "leaf"];
  let x = x0;
  let s = seed;
  while (x < x1 - 0.03) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const t = 0.025 + r * 0.03;
    if (x + t > x1) break;
    out.push(box(x + t / 2, y, z, t - 0.003, maxH * (0.7 + 0.3 * r), depth, roles[Math.floor(r * 97) % roles.length]));
    x += t;
    // a gap now and then
    if (r > 0.86) x += 0.06;
  }
  return out;
}

/** A pot (wider at the top) with soil in it. */
function pot(w: number, h: number, d: number, role: Role = "pot"): Part[] {
  return [cyl(0, 0, 0, w * 0.82, h, d * 0.82, role, undefined, 12, 1.22), cyl(0, h - 0.01, 0, w * 0.9, 0.012, d * 0.9, "soil", undefined, 12)];
}

export const FURNITURE: Record<string, FurnitureType> = {
  // ---------------------------------------------------------------- sofas & seats
  sofa: { name: "Sofa", category: "living", family: "sofa", size: [2.0, 0.9, 0.8], build: (w, d, h) => sofa(w, d, h) },
  sofa_2: { name: "Two-seat sofa", category: "living", family: "sofa", size: [1.6, 0.88, 0.8], build: (w, d, h) => sofa(w, d, h) },
  sofa_l: {
    name: "Corner sofa", category: "living", family: "sofa", size: [2.6, 1.8, 0.8],
    build: (w, d, h) => {
      const depth = Math.min(0.95, d / 2);
      // the main sofa along the back, without its right arm; the return comes forward on the right
      const main = shift(sofa(w, depth, h), 0, -d / 2 + depth / 2).filter((p) => !(p.role === "fabric" && p.x > w / 2 - 0.25 && p.h < h - 0.07));
      const ret = shift(seatBlock(depth, d - depth), w / 2 - depth / 2, depth / 2);
      const arm = box(w / 2 - 0.1, 0.06, depth / 2 + 0.02, 0.2, 0.57, d - depth - 0.04, "fabric");
      return [...main, ...ret, arm];
    },
  },
  sofa_chaise: {
    name: "Sofa with chaise", category: "living", family: "sofa", size: [2.4, 1.6, 0.8],
    build: (w, d, h) => {
      const depth = Math.min(0.95, d * 0.6);
      const cw = Math.min(0.85, w * 0.38);
      const main = shift(sofa(w, depth, h), 0, -d / 2 + depth / 2);
      const chaise = shift(seatBlock(cw, d - depth + 0.02), w / 2 - cw / 2, depth / 2);
      return [...main, ...chaise];
    },
  },
  sofa_chesterfield: {
    name: "Chesterfield", category: "living", family: "sofa", size: [2.1, 0.95, 0.76], finish: "leather",
    build: (w, d, h) => {
      const arm = 0.2;
      const seatH = 0.44;
      const parts: Part[] = [
        box(0, 0.1, 0, w, seatH - 0.2, d, "fabricDark"),
        box(0, 0.1, -d / 2 + 0.1, w, h - 0.16, 0.2, "fabric"),
        rod("x", 0, h - 0.12, -d / 2 + 0.1, w, 0.12, 0.2, "fabric"),
      ];
      for (const s of [-1, 1]) {
        parts.push(box(s * (w / 2 - arm / 2), 0.1, 0, arm, h - 0.2, d, "fabric"));
        parts.push(rod("z", s * (w / 2 - arm / 2), h - 0.2, 0, arm + 0.04, 0.16, d, "fabric"));
      }
      const inner = w - 2 * arm;
      const n = inner > 1.3 ? 3 : 2;
      for (let i = 0; i < n; i++) parts.push(box(-inner / 2 + (inner / n) * (i + 0.5), seatH - 0.1, 0.08, inner / n - 0.02, 0.1, d - 0.22, "cushion"));
      parts.push(...roundLegs(w, d, 0.1, 0.06, 0.06, "woodDark"));
      return parts;
    },
  },
  sofa_modular: {
    name: "Modular sofa", category: "living", family: "sofa", size: [2.6, 1.05, 0.7], finish: "boucle",
    build: (w, d, h) => {
      const n = Math.max(2, Math.round(w / 0.9));
      const sw = w / n;
      const parts: Part[] = [box(0, 0, 0, w, 0.3, d, "fabricDark")];
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + sw * (i + 0.5);
        parts.push(box(x, 0.3, 0.12, sw - 0.02, 0.14, d - 0.26, "cushion"));
        parts.push(box(x, 0.3, -d / 2 + 0.14, sw - 0.03, h - 0.3, 0.26, "fabric"));
      }
      return parts;
    },
  },
  sofa_section: { name: "Sofa section", category: "living", family: "sofa", size: [0.8, 0.95, 0.45], build: (w, d) => seatBlock(w, d) },
  armchair: { name: "Armchair", category: "living", family: "armchair", size: [0.85, 0.85, 0.85], build: (w, d, h) => sofa(w, d, h) },
  armchair_wing: {
    name: "Wingback chair", category: "living", family: "armchair", size: [0.8, 0.85, 1.1],
    build: (w, d, h) => [
      box(0, 0.12, 0.03, w - 0.16, 0.3, d - 0.08, "fabricDark"),
      box(0, 0.42, 0.06, w - 0.18, 0.1, d - 0.2, "cushion"),
      box(0, 0.12, -d / 2 + 0.08, w, h - 0.12, 0.16, "fabric"),
      box(-w / 2 + 0.08, 0.12, -0.06, 0.16, 0.5, d - 0.2, "fabric"),
      box(w / 2 - 0.08, 0.12, -0.06, 0.16, 0.5, d - 0.2, "fabric"),
      box(-w / 2 + 0.06, 0.62, -d / 2 + 0.2, 0.12, h - 0.7, 0.3, "fabric"),
      box(w / 2 - 0.06, 0.62, -d / 2 + 0.2, 0.12, h - 0.7, 0.3, "fabric"),
      ...roundLegs(w, d, 0.12, 0.05, 0.06),
    ],
  },
  tub_chair: {
    name: "Tub chair", category: "living", family: "armchair", size: [0.75, 0.75, 0.75], finish: "velvet",
    build: (w, d, h) => [
      cyl(0, 0.08, 0, w, 0.32, d, "fabricDark", undefined, 16),
      cyl(0, 0.4, 0.04, w * 0.78, 0.08, d * 0.78, "cushion", undefined, 16),
      box(0, 0.08, -d * 0.3, w * 0.9, h - 0.08, d * 0.3, "fabric"),
      ...roundTopLegs(w, d, 0.08, 0.7, 0.75, 0.04, "metal"),
    ],
  },
  recliner: {
    name: "Recliner", category: "living", family: "armchair", size: [0.9, 0.95, 1.0],
    build: (w, d, h) => [...sofa(w, d, h), box(0, 0.06, d / 2 + 0.05, w * 0.6, 0.3, 0.12, "fabricDark")],
  },
  pouf: { name: "Pouf", category: "living", family: "pouf", size: [0.5, 0.5, 0.42], build: (w, d, h) => [cyl(0, 0, 0, w, h, d, "fabric", undefined, 16)] },
  footstool: { name: "Footstool", category: "living", family: "pouf", size: [0.7, 0.5, 0.42], build: (w, d, h) => [box(0, 0.1, 0, w, h - 0.1, d, "fabric"), ...roundLegs(w, d, 0.1, 0.05, 0.05)] },
  bean_bag: { name: "Bean bag", category: "living", family: "pouf", size: [0.85, 0.85, 0.6], build: (w, d, h) => [ball(0, 0, 0, w, h, d, "fabric", 12)] },

  // ---------------------------------------------------------------- living
  coffee_table: {
    name: "Coffee table", category: "living", family: "coffee", size: [1.1, 0.6, 0.42],
    build: (w, d, h) => [box(0, h - 0.04, 0, w, 0.04, d, "wood"), ...legs(w, d, h - 0.04, 0.04, 0.04)],
  },
  coffee_round: {
    name: "Round coffee table", category: "living", family: "coffee", size: [0.85, 0.85, 0.4],
    build: (w, d, h) => [cyl(0, h - 0.04, 0, w, 0.04, d, "wood", undefined, 20), cyl(0, 0, 0, w * 0.4, h - 0.04, d * 0.4, "woodDark", undefined, 14, 0.8)],
  },
  coffee_marble: {
    name: "Marble coffee table", category: "living", family: "coffee", size: [1.2, 0.65, 0.38], paint: ["dark"],
    build: (w, d, h) => [box(0, h - 0.035, 0, w, 0.035, d, "ceramic"), box(-w / 2 + 0.08, 0, 0, 0.03, h - 0.035, d - 0.1, "dark"), box(w / 2 - 0.08, 0, 0, 0.03, h - 0.035, d - 0.1, "dark")],
  },
  side_table: {
    name: "Side table", category: "living", family: "coffee", size: [0.45, 0.45, 0.55],
    build: (w, d, h) => [cyl(0, h - 0.03, 0, w, 0.03, d, "wood", undefined, 14), ...roundTopLegs(w, d, h - 0.03, 0.6, 0.9, 0.035)],
  },
  tv_board: {
    name: "TV on a board", category: "living", family: "tv", size: [1.6, 0.45, 1.25],
    build: (w, d, h) => {
      const board = Math.min(0.5, h * 0.4);
      const tvW = Math.min(w * 0.95, 1.7);
      const tvH = Math.min(h - board - 0.06, tvW * 0.58);
      return [
        ...cabinet(w, d, board, "woodDark", "woodDark"),
        box(0, board, -d / 2 + 0.12, 0.3, 0.03, 0.18, "dark"),
        box(0, board + 0.03, -d / 2 + 0.12, 0.06, 0.06, 0.04, "dark"),
        box(0, board + 0.08, -d / 2 + 0.12, tvW, tvH, 0.05, "dark"),
        box(0, board + 0.1, -d / 2 + 0.148, tvW - 0.04, tvH - 0.04, 0.005, "screen", "screen"),
      ];
    },
  },
  tv_wall: {
    name: "Wall TV", category: "living", family: "tv", size: [1.45, 0.06, 0.84], y: 0.9,
    build: (w, d, h) => [box(0, 0, 0, w, h, Math.max(0.03, d - 0.01), "dark"), box(0, 0.02, d / 2 - 0.004, w - 0.04, h - 0.04, 0.006, "screen", "screen")],
  },
  sideboard: { name: "Sideboard", category: "living", family: "storage_low", size: [1.6, 0.45, 0.8], build: (w, d, h) => cabinet(w, d, h, "woodDark", "wood") },
  console_table: {
    name: "Console table", category: "living", family: "storage_low", size: [1.1, 0.35, 0.8],
    build: (w, d, h) => [box(0, h - 0.03, 0, w, 0.03, d, "wood"), box(0, 0.12, 0, w - 0.06, 0.02, d - 0.04, "wood"), ...legs(w, d, h - 0.03, 0.03, 0.02, "metal")],
  },
  shelf: {
    name: "Shelf", category: "living", family: "storage_tall", size: [0.8, 0.35, 1.8],
    build: (w, d, h) => {
      const n = Math.max(2, Math.round(h / 0.38));
      const parts = [box(-w / 2 + 0.01, 0, 0, 0.02, h, d, "wood"), box(w / 2 - 0.01, 0, 0, 0.02, h, d, "wood"), box(0, 0, -d / 2 + 0.005, w, h, 0.01, "woodDark")];
      for (let i = 0; i <= n; i++) parts.push(box(0, Math.min(h - 0.02, (h / n) * i), 0, w - 0.04, 0.02, d, "wood"));
      for (let i = 0; i < n; i++) parts.push(box(-w / 4, (h / n) * i + 0.02, 0, w * 0.3, h / n * 0.6, d * 0.7, i % 2 ? "accent" : "fabricDark"));
      return parts;
    },
  },
  bookcase: {
    name: "Bookcase", category: "living", family: "storage_tall", size: [0.9, 0.32, 2.0], paint: ["white"],
    build: (w, d, h) => {
      const n = Math.max(3, Math.round(h / 0.36));
      const parts = [box(-w / 2 + 0.01, 0, 0, 0.02, h, d, "white"), box(w / 2 - 0.01, 0, 0, 0.02, h, d, "white"), box(0, 0, -d / 2 + 0.005, w, h, 0.01, "white")];
      for (let i = 0; i <= n; i++) parts.push(box(0, Math.min(h - 0.02, (h / n) * i), 0, w - 0.04, 0.02, d, "white"));
      for (let i = 0; i < n; i++) parts.push(...bookRow(-w / 2 + 0.03, w / 2 - 0.03, (h / n) * i + 0.02, 0, h / n - 0.06, d * 0.75, 17 + i * 31));
      return parts;
    },
  },
  display_cabinet: {
    name: "Display cabinet", category: "living", family: "storage_tall", size: [0.9, 0.42, 1.9],
    build: (w, d, h) => [
      box(0, 0, 0, w, 0.12, d, "woodDark"), box(0, h - 0.05, 0, w, 0.05, d, "woodDark"),
      box(-w / 2 + 0.02, 0.12, 0, 0.04, h - 0.17, d, "woodDark"), box(w / 2 - 0.02, 0.12, 0, 0.04, h - 0.17, d, "woodDark"),
      box(0, 0.12, -d / 2 + 0.01, w - 0.08, h - 0.17, 0.02, "woodDark"),
      ...[0.45, 0.85, 1.25].map((y) => box(0, (y / 1.9) * h, 0, w - 0.08, 0.015, d - 0.04, "glass")),
      ...[0.5, 0.9].map((y, i) => box(-w * 0.15 + i * 0.2, (y / 1.9) * h, 0, 0.12, 0.18, 0.12, i ? "ceramic" : "accent")),
    ],
  },
  tall_cabinet: { name: "Cupboard", category: "living", family: "storage_tall", size: [0.8, 0.4, 2.0], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, 0.3, d / 2, 0.01, h - 0.6, 0.01, "metal")] },
  rug: { name: "Rug", category: "living", family: "rug", size: [2.0, 1.4, 0.01], build: (w, d) => [box(0, 0, 0, w, 0.008, d, "rug")] },
  rug_round: { name: "Round rug", category: "living", family: "rug", size: [1.6, 1.6, 0.01], build: (w, d) => [cyl(0, 0, 0, w, 0.008, d, "rug", undefined, 28)] },
  rug_runner: { name: "Runner", category: "living", family: "rug", size: [0.8, 2.6, 0.01], build: (w, d) => [box(0, 0, 0, w, 0.008, d, "rug")] },
  fireplace: {
    name: "Fireplace", category: "living", family: "fireplace", size: [1.2, 0.35, 1.1],
    build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, 0.1, d / 2 - 0.01, w * 0.5, h * 0.5, 0.03, "dark"), box(0, h - 0.06, 0.02, w + 0.1, 0.06, d + 0.06, "wood")],
  },
  stove_wood: {
    name: "Wood burner", category: "living", family: "fireplace", size: [0.5, 0.42, 1.6], paint: ["dark"],
    build: (w, d, h) => [box(0, 0, 0, w + 0.3, 0.04, d + 0.3, "ceramic"), box(0, 0.12, 0, w, 0.62, d, "dark"), box(0, 0.22, d / 2, w * 0.7, 0.36, 0.01, "accent"), ...legs(w, d, 0.12, 0.04, 0.02, "dark"), cyl(0, 0.74, -0.05, 0.13, h - 0.74, 0.13, "dark", undefined, 8)],
  },
  piano: {
    name: "Piano", category: "living", family: "piano", size: [1.5, 0.6, 1.25], paint: ["dark"],
    build: (w, d, h) => [box(0, 0, -d / 2 + 0.17, w, h, 0.34, "dark"), box(0, 0.68, 0.06, w, 0.06, d - 0.3, "dark"), box(0, 0.74, 0.08, w - 0.12, 0.012, 0.15, "white"), box(-w / 2 + 0.04, 0, 0.05, 0.08, 0.68, 0.08, "dark"), box(w / 2 - 0.04, 0, 0.05, 0.08, 0.68, 0.08, "dark")],
  },
  speaker: {
    name: "Floor speaker", category: "living", family: "speaker", size: [0.22, 0.3, 1.0], paint: ["dark"],
    build: (w, d, h) => [box(0, 0.03, 0, w, h - 0.03, d, "dark"), rod("z", 0, h * 0.2, d / 2, 0.16, 0.16, 0.012, "rubber", 12), rod("z", 0, h * 0.45, d / 2, 0.16, 0.16, 0.012, "rubber", 12), rod("z", 0, h * 0.78, d / 2, 0.06, 0.06, 0.012, "rubber", 12), ...legs(w, d, 0.03, 0.02, 0.01, "metal")],
  },

  // ---------------------------------------------------------------- dining
  table: {
    name: "Table", category: "dining", family: "table", size: [1.6, 0.9, 0.75],
    build: (w, d, h) => [box(0, h - 0.04, 0, w, 0.04, d, "wood"), ...legs(w, d, h - 0.04, 0.06, 0.06)],
  },
  table_round: {
    name: "Round table", category: "dining", family: "table", size: [1.1, 1.1, 0.75],
    build: (w, d, h) => [cyl(0, h - 0.04, 0, w, 0.04, d, "wood", undefined, 20), cyl(0, 0.04, 0, 0.12, h - 0.08, 0.12, "woodDark", undefined, 10, 0.7), cyl(0, 0, 0, w * 0.45, 0.04, d * 0.45, "woodDark", undefined, 14)],
  },
  table_oval: {
    name: "Oval table", category: "dining", family: "table", size: [1.9, 1.0, 0.75],
    build: (w, d, h) => [cyl(0, h - 0.04, 0, w, 0.04, d, "wood", undefined, 24), box(0, 0.04, 0, w * 0.45, h - 0.08, 0.1, "woodDark"), box(0, 0, 0, w * 0.55, 0.04, d * 0.5, "woodDark")],
  },
  table_trestle: {
    name: "Farmhouse table", category: "dining", family: "table", size: [2.0, 0.95, 0.76],
    build: (w, d, h) => [box(0, h - 0.06, 0, w, 0.06, d, "wood"), ...[-1, 1].flatMap((s) => [box(s * (w / 2 - 0.25), 0, 0, 0.08, h - 0.06, d * 0.7, "woodDark"), box(s * (w / 2 - 0.25), 0, 0, 0.1, 0.06, d * 0.8, "woodDark")]), box(0, 0.25, 0, w - 0.5, 0.06, 0.06, "woodDark")],
  },
  chair: {
    name: "Chair", category: "dining", family: "chair", size: [0.45, 0.5, 0.9],
    build: (w, d, h) => [box(0, 0.44, 0.02, w, 0.04, d - 0.04, "wood"), box(0, 0.44, -d / 2 + 0.02, w, h - 0.44, 0.04, "wood"), ...legs(w, d, 0.44, 0.035, 0.02)],
  },
  chair_upholstered: {
    name: "Upholstered chair", category: "dining", family: "chair", size: [0.5, 0.56, 0.88],
    build: (w, d, h) => [box(0, 0.4, 0.02, w, 0.08, d - 0.04, "fabric"), box(0, 0.4, -d / 2 + 0.04, w * 0.95, h - 0.4, 0.08, "fabric"), ...roundLegs(w, d, 0.4, 0.04, 0.04, "dark")],
  },
  stool_bar: {
    name: "Bar stool", category: "dining", family: "chair", size: [0.42, 0.42, 0.95],
    build: (w, d, h) => {
      const legH = h - 0.2;
      const [tx, tz] = onRound(w, d, 0.65), [fx, fz] = onRound(w, d, 1.1);
      // a footrest of four rails from leg to leg
      const ry = Math.min(0.3, legH * 0.4), rx = splayAt(tx, fx, legH, ry + 0.01), rz = splayAt(tz, fz, legH, ry + 0.01);
      return [
        cyl(0, legH, 0, w, 0.06, d, "fabric", undefined, 14),
        box(0, h - 0.14, -d / 2 + 0.07, w * 0.6, 0.14, 0.025, "fabric"),
        ...splayLegs([tx, 0, tz], [fx, fz], legH, 0.035, "metal"),
        ...[-1, 1].flatMap((s) => [rod("x", 0, ry, s * rz, 2 * rx, 0.02, 0.02, "metal", 6), rod("z", s * rx, ry, 0, 0.02, 0.02, 2 * rz, "metal", 6)]),
      ];
    },
  },
  stool: { name: "Stool", category: "dining", family: "chair", size: [0.38, 0.38, 0.46], build: (w, d, h) => [cyl(0, h - 0.04, 0, w, 0.04, d, "wood", undefined, 14), ...roundTopLegs(w, d, h - 0.04, 0.7, 1.05)] },
  bench: { name: "Bench", category: "dining", family: "chair", size: [1.4, 0.4, 0.45], build: (w, d, h) => [box(0, h - 0.05, 0, w, 0.05, d, "wood"), ...legs(w, d, h - 0.05, 0.05, 0.04)] },

  // ---------------------------------------------------------------- kitchen
  kitchen: { name: "Kitchen base unit", category: "kitchen", family: "kitchen", size: [0.6, 0.6, 0.9], build: (w, d, h) => [...cabinet(w, d, h, "white", "woodDark"), box(0, h * 0.7, d / 2, w * 0.3, 0.015, 0.015, "metal")] },
  kitchen_wall: { name: "Wall cupboard", category: "kitchen", family: "kitchen", size: [0.6, 0.35, 0.7], y: 1.45, build: (w, d, h) => [box(0, 0, 0, w, h, d, "white")] },
  kitchen_tall: { name: "Tall unit / oven", category: "kitchen", family: "kitchen", size: [0.6, 0.6, 2.1], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, h * 0.4, d / 2, w - 0.08, h * 0.22, 0.01, "dark")] },
  island: { name: "Kitchen island", category: "kitchen", family: "kitchen", size: [1.8, 0.9, 0.92], build: (w, d, h) => cabinet(w, d, h, "woodDark", "white") },
  sink: {
    name: "Sink unit", category: "kitchen", family: "kitchen", size: [0.8, 0.6, 0.9],
    build: (w, d, h) => [...cabinet(w, d, h, "white", "woodDark"), box(0, h - 0.035, 0, w * 0.6, 0.03, d * 0.6, "metal"), cyl(0, h, -d / 2 + 0.08, 0.04, 0.25, 0.04, "metal")],
  },
  stove: {
    name: "Hob / stove", category: "kitchen", family: "kitchen", size: [0.6, 0.6, 0.9],
    build: (w, d, h) => {
      const parts = [...cabinet(w, d, h, "white", "dark"), box(0, h * 0.2, d / 2, w - 0.06, h * 0.45, 0.01, "dark")];
      for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) parts.push(cyl(x * w * 0.22, h, z * d * 0.22, w * 0.25, 0.006, w * 0.25, "metal"));
      return parts;
    },
  },
  fridge: { name: "Fridge", category: "kitchen", family: "fridge", size: [0.6, 0.65, 1.8], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(w / 2 - 0.06, h * 0.45, d / 2 + 0.01, 0.02, h * 0.35, 0.03, "metal"), box(0, h * 0.38, d / 2, w, 0.008, 0.008, "metal")] },
  fridge_american: { name: "American fridge", category: "kitchen", family: "fridge", size: [0.92, 0.72, 1.8], paint: ["metal"], build: (w, d, h) => [box(0, 0, 0, w, h, d, "metal"), box(0, 0.02, d / 2, 0.006, h - 0.04, 0.006, "dark"), box(-0.05, h * 0.35, d / 2 + 0.015, 0.02, h * 0.4, 0.03, "dark"), box(0.05, h * 0.35, d / 2 + 0.015, 0.02, h * 0.4, 0.03, "dark")] },
  dishwasher: { name: "Dishwasher", category: "kitchen", family: "kitchen", size: [0.6, 0.6, 0.85], build: (w, d, h) => [...cabinet(w, d, h, "metal", "woodDark"), box(0, h * 0.85, d / 2, w * 0.7, 0.02, 0.02, "dark")] },

  // ---------------------------------------------------------------- bedroom
  bed: { name: "Double bed", category: "bedroom", family: "bed", size: [1.4, 2.0, 0.55], build: (w, d, h) => bed(w, d, h) },
  bed_king: { name: "King bed", category: "bedroom", family: "bed", size: [1.6, 2.05, 0.55], build: (w, d, h) => bed(w, d, h) },
  bed_single: { name: "Single bed", category: "bedroom", family: "bed", size: [0.9, 2.0, 0.55], build: (w, d, h) => bed(w, d, h) },
  bed_upholstered: { name: "Upholstered bed", category: "bedroom", family: "bed", size: [1.6, 2.1, 0.55], build: (w, d, h) => bed(w, d, h, true) },
  bunk_bed: {
    name: "Bunk bed", category: "bedroom", family: "bed", size: [1.0, 2.05, 1.6],
    build: (w, d, h) => [
      box(0, 0.25, 0, w - 0.08, 0.15, d - 0.08, "mattress"),
      box(0, h * 0.6, 0, w - 0.08, 0.15, d - 0.08, "mattress"),
      ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => box((x * (w - 0.06)) / 2, 0, (z * (d - 0.06)) / 2, 0.06, h, 0.06, "wood")),
      box(w / 2 - 0.03, h * 0.6 + 0.15, 0, 0.04, 0.2, d - 0.1, "wood"),
    ],
  },
  nightstand: { name: "Bedside table", category: "bedroom", family: "bedside", size: [0.45, 0.4, 0.5], build: (w, d, h) => [box(0, 0.06, 0, w, h - 0.06, d, "wood"), ...legs(w, d, 0.06, 0.04, 0.02, "dark")] },
  nightstand_round: { name: "Round bedside table", category: "bedroom", family: "bedside", size: [0.42, 0.42, 0.52], build: (w, d, h) => [cyl(0, h - 0.03, 0, w, 0.03, d, "wood", undefined, 14), legShelf(w, d, h - 0.03, 0.7, 0.85, 0.2, 0.02, "wood"), ...roundTopLegs(w, d, h - 0.03, 0.7, 0.85, 0.035)] },
  wardrobe: {
    name: "Wardrobe", category: "bedroom", family: "storage_tall", size: [1.5, 0.6, 2.1],
    build: (w, d, h) => {
      const doors = Math.max(1, Math.round(w / 0.5));
      const parts = [box(0, 0, 0, w, h, d, "white")];
      for (let i = 1; i < doors; i++) parts.push(box(-w / 2 + (w / doors) * i, 0.05, d / 2, 0.006, h - 0.1, 0.006, "dark"));
      return parts;
    },
  },
  dresser: { name: "Chest of drawers", category: "bedroom", family: "storage_low", size: [1.0, 0.45, 0.85], build: (w, d, h) => [box(0, 0.06, 0, w, h - 0.06, d, "white"), ...[0.3, 0.55, 0.8].map((f) => box(0, h * f, d / 2, w - 0.06, 0.006, 0.006, "dark"))] },
  dressing_table: {
    name: "Dressing table", category: "bedroom", family: "desk", size: [1.0, 0.45, 0.76], paint: ["white"],
    build: (w, d, h) => [box(0, h - 0.04, 0, w, 0.04, d, "white"), box(w / 2 - 0.2, h - 0.2, 0, 0.38, 0.16, d - 0.02, "white"), ...roundLegs(w, d, h - 0.04, 0.045, 0.04, "white"), box(0, h + 0.05, -d / 2 + 0.03, w * 0.5, 0.7, 0.02, "mirror")],
  },

  // ---------------------------------------------------------------- bathroom
  bathtub: {
    name: "Bath", category: "bath", family: "bath", size: [1.7, 0.75, 0.55],
    build: (w, d, h) => {
      // a rim around the water, which sits a few centimetres below it
      const r = 0.07;
      const rim = h - 0.02;
      return [
        box(0, 0, -d / 2 + r / 2, w, rim, r, "ceramic"), box(0, 0, d / 2 - r / 2, w, rim, r, "ceramic"),
        box(-w / 2 + r / 2, 0, 0, r, rim, d - 2 * r, "ceramic"), box(w / 2 - r / 2, 0, 0, r, rim, d - 2 * r, "ceramic"),
        box(0, 0, 0, w - 2 * r, rim - 0.12, d - 2 * r, "ceramic"),
        box(0, rim - 0.12, 0, w - 2 * r, 0.07, d - 2 * r, "water"),
      ];
    },
  },
  bath_freestanding: {
    name: "Freestanding bath", category: "bath", family: "bath", size: [1.65, 0.78, 0.6],
    build: (w, d, h) => [cyl(0, 0.05, 0, w * 0.93, h - 0.05, d * 0.93, "ceramic", undefined, 20, 1.08), cyl(0, h - 0.04, 0, w - 0.12, 0.02, d - 0.12, "water", undefined, 20), ...roundLegs(w * 0.7, d * 0.6, 0.05, 0.07, 0.02, "metal")],
  },
  shower: {
    name: "Shower", category: "bath", family: "shower", size: [0.9, 0.9, 2.0],
    build: (w, d, h) => [box(0, 0, 0, w, 0.06, d, "ceramic"), box(0, 0.06, d / 2 - 0.01, w, h - 0.06, 0.01, "glass"), box(-w / 2 + 0.01, 0.06, 0, 0.01, h - 0.06, d, "glass"), cyl(w / 2 - 0.15, h - 0.12, -d / 2 + 0.15, 0.22, 0.02, 0.22, "metal", undefined, 12)],
  },
  wc: {
    name: "Toilet", category: "bath", family: "wc", size: [0.4, 0.65, 0.8],
    build: (w, d) => [box(0, 0, -d / 2 + 0.09, w, 0.8, 0.18, "ceramic"), cyl(0, 0, 0.06, w * 0.85, 0.42, d * 0.7, "ceramic", undefined, 14)],
  },
  washbasin: { name: "Washbasin", category: "bath", family: "basin", size: [0.6, 0.45, 0.85], build: (w, d, h) => [box(0, h * 0.35, -0.02, w * 0.9, h * 0.5, d * 0.85, "woodDark"), box(0, h - 0.12, 0, w, 0.12, d, "ceramic")] },
  towel_rail: {
    name: "Towel radiator", category: "bath", family: "radiator", size: [0.5, 0.08, 1.2], y: 0.15, paint: ["fabric"],
    build: (w, _d, h) => {
      const n = Math.max(3, Math.round(h / 0.12));
      const bars = Array.from({ length: n }, (_, i) => rod("x", 0, (h / n) * i + 0.03, 0, w, 0.022, 0.022, "metal", 6));
      return [box(-w / 2 + 0.02, 0, 0, 0.03, h, 0.03, "metal"), box(w / 2 - 0.02, 0, 0, 0.03, h, 0.03, "metal"), ...bars, box(0, h * 0.55, 0.02, w * 0.75, h * 0.3, 0.03, "fabric")];
    },
  },

  // ---------------------------------------------------------------- office
  desk: { name: "Desk", category: "office", family: "desk", size: [1.4, 0.7, 0.75], build: (w, d, h) => [box(0, h - 0.03, 0, w, 0.03, d, "white"), ...legs(w, d, h - 0.03, 0.04, 0.03, "metal")] },
  desk_l: {
    name: "Corner desk", category: "office", family: "desk", size: [1.6, 1.4, 0.75],
    build: (w, d, h) => {
      const dd = Math.min(0.7, d / 2);
      return [
        box(0, h - 0.03, -d / 2 + dd / 2, w, 0.03, dd, "white"), box(w / 2 - dd / 2, h - 0.03, dd / 2, dd, 0.03, d - dd, "white"),
        box(-w / 2 + 0.04, 0, -d / 2 + dd / 2, 0.04, h - 0.03, dd - 0.08, "metal"), box(w / 2 - dd / 2, 0, d / 2 - 0.04, dd - 0.08, h - 0.03, 0.04, "metal"),
        box(w / 2 - 0.04, 0, -d / 2 + 0.04, 0.04, h - 0.03, 0.04, "metal"),
      ];
    },
  },
  desk_standing: {
    name: "Standing desk", category: "office", family: "desk", size: [1.6, 0.8, 0.75],
    build: (w, d, h) => [box(0, h - 0.03, 0, w, 0.03, d, "wood"), ...[-1, 1].flatMap((s) => [box(s * (w / 2 - 0.15), 0, 0, 0.07, h - 0.03, 0.07, "dark"), box(s * (w / 2 - 0.15), 0, 0, 0.07, 0.03, d * 0.85, "dark")]), box(0, h - 0.1, 0, w - 0.3, 0.05, 0.05, "dark")],
  },
  office_chair: {
    name: "Office chair", category: "office", family: "office_chair", size: [0.6, 0.6, 1.1],
    build: (w, d, h) => [cyl(0, 0, 0, w, 0.05, d, "dark", undefined, 5), cyl(0, 0.05, 0, 0.05, 0.4, 0.05, "metal"), box(0, 0.45, 0.02, w * 0.8, 0.08, d * 0.75, "fabricDark"), box(0, 0.53, -d * 0.36, w * 0.75, h - 0.55, 0.06, "fabricDark")],
  },
  gaming_chair: {
    name: "Gaming chair", category: "office", family: "office_chair", size: [0.65, 0.65, 1.3],
    build: (w, d, h) => [cyl(0, 0, 0, w, 0.05, d, "dark", undefined, 5), cyl(0, 0.05, 0, 0.06, 0.38, 0.06, "metal"), box(0, 0.43, 0.02, w * 0.8, 0.1, d * 0.75, "fabricDark"), box(0, 0.53, -d * 0.36, w * 0.72, h - 0.53, 0.1, "fabricDark"), box(0, 0.6, -d * 0.36 + 0.055, w * 0.3, h - 0.7, 0.012, "red"), ...[-1, 1].map((s) => box(s * w * 0.42, 0.53, 0, 0.06, 0.2, d * 0.5, "dark"))],
  },
  monitor: { name: "Monitor", category: "office", family: "monitor", size: [0.6, 0.2, 0.45], y: 0.75, build: (w, d, h) => [box(0, 0, 0, 0.2, 0.02, d, "dark"), box(0, 0.02, -0.02, 0.04, h * 0.3, 0.04, "dark"), box(0, h * 0.25, 0, w, h * 0.75, 0.03, "dark"), box(0, h * 0.27, 0.016, w - 0.03, h * 0.71, 0.004, "screen", "screen")] },
  laptop: { name: "Laptop", category: "office", family: "monitor", size: [0.34, 0.24, 0.22], y: 0.75, paint: ["metal"], build: (w, d, h) => [box(0, 0, 0.01, w, 0.015, d - 0.02, "metal"), box(0, 0.015, -d / 2 + 0.015, w, h - 0.015, 0.008, "metal"), box(0, 0.03, -d / 2 + 0.02, w - 0.02, h - 0.04, 0.002, "screen", "screen")] },

  // ---------------------------------------------------------------- decor
  picture: {
    name: "Picture", category: "decor", family: "picture", size: [0.6, 0.03, 0.45], y: 1.35, paint: ["woodDark"],
    build: (w, d, h) => [box(0, 0, 0, w, h, d, "woodDark"), box(0, 0.035, d / 2, w - 0.07, h - 0.07, 0.004, "canvas")],
  },
  picture_large: {
    name: "Large artwork", category: "decor", family: "picture", size: [1.2, 0.04, 0.8], y: 1.15, paint: ["canvas"],
    build: (w, d, h) => [box(0, 0, 0, w, h, d, "canvas")],
  },
  picture_trio: {
    name: "Three frames", category: "decor", family: "picture", size: [1.3, 0.03, 0.4], y: 1.4, paint: ["dark"],
    build: (w, d, h) => [-1, 0, 1].flatMap((i) => [box((i * w) / 3, 0, 0, w / 3 - 0.06, h, d, "dark"), box((i * w) / 3, 0.03, d / 2, w / 3 - 0.12, h - 0.06, 0.004, i === 0 ? "canvas" : i === 1 ? "paper" : "accent")]),
  },
  mirror: { name: "Mirror", category: "decor", family: "mirror", size: [0.6, 0.03, 0.9], y: 1.1, paint: ["dark"], build: (w, d, h) => [box(0, 0, 0, w, h, d, "dark"), box(0, 0.025, d / 2, w - 0.05, h - 0.05, 0.004, "mirror")] },
  mirror_round: { name: "Round mirror", category: "decor", family: "mirror", size: [0.7, 0.03, 0.7], y: 1.2, paint: ["metal"], build: (w, d, h) => [rod("z", 0, 0, 0, w, h, d, "metal", 24), rod("z", 0, 0.02, d / 2, w - 0.04, h - 0.04, 0.004, "mirror", 24)] },
  mirror_floor: { name: "Floor mirror", category: "decor", family: "mirror", size: [0.6, 0.06, 1.7], paint: ["woodDark"], build: (w, d, h) => [box(0, 0, 0, w, h, d * 0.5, "woodDark"), box(0, 0.03, d * 0.25, w - 0.06, h - 0.06, 0.004, "mirror")] },
  clock: { name: "Wall clock", category: "decor", family: "clock", size: [0.35, 0.04, 0.35], y: 1.8, paint: ["dark"], build: (w, d, h) => [rod("z", 0, 0, 0, w, h, d, "dark", 20), rod("z", 0, 0.015, d / 2, w - 0.03, h - 0.03, 0.004, "paper", 20), box(0, h / 2 - 0.004, d / 2 + 0.004, 0.008, h * 0.35, 0.002, "dark")] },
  vase: { name: "Vase", category: "decor", family: "vase", size: [0.18, 0.18, 0.35], y: 0.75, paint: ["ceramic"], build: (w, d, h) => [cyl(0, 0, 0, w * 0.7, h * 0.55, d * 0.7, "ceramic", undefined, 12, 1.4), cyl(0, h * 0.55, 0, w, h * 0.3, d, "ceramic", undefined, 12, 0.45), cyl(0, h * 0.85, 0, w * 0.45, h * 0.15, d * 0.45, "ceramic", undefined, 12, 1.2)] },
  flowers: {
    name: "Flowers", category: "decor", family: "vase", size: [0.3, 0.3, 0.55], y: 0.75, paint: ["glass"],
    build: (w, d, h) => [cyl(0, 0, 0, w * 0.45, h * 0.45, d * 0.45, "glass", undefined, 10), ball(0, h * 0.4, 0, w * 0.85, h * 0.35, d * 0.85, "leaf", 8), ball(-w * 0.15, h * 0.55, 0.03, w * 0.3, h * 0.25, d * 0.3, "red", 6), ball(w * 0.18, h * 0.6, -0.02, w * 0.28, h * 0.25, d * 0.28, "white", 6), ball(0, h * 0.68, -w * 0.12, w * 0.3, h * 0.3, d * 0.3, "accent", 6)],
  },
  books: { name: "Stack of books", category: "decor", family: "books", size: [0.3, 0.22, 0.12], y: 0.42, build: (w, d, h) => [box(0, 0, 0, w, h * 0.3, d, "blue"), box(0.01, h * 0.3, -0.005, w * 0.92, h * 0.25, d * 0.95, "paper"), box(-0.01, h * 0.55, 0, w * 0.85, h * 0.45, d * 0.9, "red")] },
  candles: { name: "Candles", category: "decor", family: "books", size: [0.2, 0.1, 0.25], y: 0.75, paint: ["paper"], build: (w, _d, h) => [cyl(-w * 0.3, 0, 0, 0.06, h, 0.06, "paper", undefined, 8), cyl(0, 0, 0, 0.06, h * 0.75, 0.06, "paper", undefined, 8), cyl(w * 0.3, 0, 0, 0.06, h * 0.5, 0.06, "paper", undefined, 8)] },
  bowl: { name: "Fruit bowl", category: "decor", family: "vase", size: [0.32, 0.32, 0.1], y: 0.75, paint: ["ceramic"], build: (w, d, h) => [cyl(0, 0, 0, w * 0.5, h, d * 0.5, "ceramic", undefined, 14, 2.0), ball(0, h * 0.5, 0, w * 0.22, h * 0.8, d * 0.22, "accent", 6), ball(w * 0.15, h * 0.45, 0.04, w * 0.22, h * 0.8, d * 0.22, "red", 6)] },
  basket: { name: "Basket", category: "decor", family: "basket", size: [0.45, 0.35, 0.35], paint: ["wood"], build: (w, d, h) => [cyl(0, 0, 0, w * 0.85, h, d * 0.85, "wood", undefined, 14, 1.15)] },
  bin: { name: "Bin", category: "decor", family: "basket", size: [0.3, 0.3, 0.6], paint: ["metal"], build: (w, d, h) => [cyl(0, 0, 0, w, h, d, "metal", undefined, 14), cyl(0, h, 0, w * 1.02, 0.03, d * 1.02, "dark", undefined, 14)] },
  aquarium: {
    name: "Aquarium", category: "decor", family: "aquarium", size: [1.0, 0.4, 1.35], paint: ["dark"],
    build: (w, d, h) => [...cabinet(w, d, 0.75, "dark", "dark"), box(0, 0.75, 0, w, 0.5, d, "water"), box(0, 0.75, 0, w - 0.02, 0.04, d - 0.02, "soil"), box(0, 1.25, 0, w + 0.01, h - 1.25, d + 0.01, "dark"), ball(-w * 0.25, 0.79, 0, 0.18, 0.2, 0.14, "plant", 6)],
  },
  guitar: {
    name: "Guitar", category: "decor", family: "instrument", size: [0.38, 0.12, 1.0], paint: ["wood"],
    build: (w, d, h) => [box(0, 0, -0.04, 0.3, 0.06, 0.25, "dark"), ball(0, 0.04, 0, w, h * 0.3, d, "wood", 12), ball(0, h * 0.27, 0, w * 0.8, h * 0.22, d, "wood", 12), box(0, h * 0.45, 0, 0.05, h * 0.47, d * 0.4, "woodDark"), box(0, h * 0.92, 0, 0.08, h * 0.08, d * 0.4, "woodDark"), rod("z", 0, h * 0.28, d / 2 - 0.005, 0.09, 0.09, 0.01, "dark", 12)],
  },
  pet_bed: { name: "Pet bed", category: "decor", family: "pet", size: [0.7, 0.55, 0.2], build: (w, d, h) => [cyl(0, 0, 0, w, h, d, "fabric", undefined, 16), cyl(0, h * 0.3, 0, w * 0.75, h * 0.72, d * 0.7, "cushion", undefined, 16)] },
  cat_tree: {
    name: "Cat tree", category: "decor", family: "pet", size: [0.55, 0.55, 1.4], paint: ["rug"],
    build: (w, d, h) => [box(0, 0, 0, w, 0.04, d, "rug"), cyl(-w * 0.2, 0.04, 0, 0.1, h * 0.55, 0.1, "wood", undefined, 8), cyl(w * 0.2, 0.04, w * 0.1, 0.1, h - 0.1, 0.1, "wood", undefined, 8), box(-w * 0.1, h * 0.55, 0, w * 0.6, 0.04, d * 0.7, "rug"), box(w * 0.15, h - 0.06, 0.05, w * 0.55, 0.12, d * 0.6, "rug"), cyl(-w * 0.15, h * 0.3, -w * 0.05, w * 0.45, h * 0.22, d * 0.45, "rug", undefined, 10)],
  },
  christmas_tree: {
    name: "Christmas tree", category: "decor", family: "plant", size: [1.1, 1.1, 2.0],
    build: (w, d, h) => [
      cyl(0, 0, 0, 0.32, 0.25, 0.32, "red", undefined, 10), cyl(0, 0.2, 0, 0.08, 0.2, 0.08, "woodDark", undefined, 6),
      cyl(0, 0.35, 0, w, h * 0.38, d, "leaf", undefined, 10, 0.45), cyl(0, 0.35 + h * 0.3, 0, w * 0.75, h * 0.33, d * 0.75, "leaf", undefined, 10, 0.35),
      cyl(0, 0.35 + h * 0.56, 0, w * 0.5, h - 0.35 - h * 0.56, d * 0.5, "leaf", undefined, 10, 0),
      ...[0.15, -0.2, 0.25, -0.1, 0.05].map((s, i) => ball(s * w, 0.5 + i * h * 0.12, ((i % 3) - 1) * d * 0.22, 0.07, 0.07, 0.07, i % 2 ? "red" : "accent", 6)),
    ],
  },
  coat_rack: { name: "Coat rack", category: "decor", family: "coat", size: [0.5, 0.5, 1.8], build: (w, d, h) => [cyl(0, 0, 0, w * 0.7, 0.03, d * 0.7, "dark", undefined, 12), cyl(0, 0.03, 0, 0.04, h - 0.03, 0.04, "woodDark", undefined, 8), ...[0, 1, 2, 3].map((i) => box(Math.cos(i * 1.57) * 0.1, h - 0.15, Math.sin(i * 1.57) * 0.1, 0.05, 0.03, 0.05, "woodDark")), box(0.12, h - 0.75, 0, 0.12, 0.6, 0.35, "fabricDark")] },
  shoe_rack: { name: "Shoe rack", category: "decor", family: "storage_low", size: [0.8, 0.3, 0.5], build: (w, d, h) => [box(-w / 2 + 0.01, 0, 0, 0.02, h, d, "wood"), box(w / 2 - 0.01, 0, 0, 0.02, h, d, "wood"), ...[0.04, h / 2, h - 0.02].map((y) => box(0, y, 0, w - 0.04, 0.02, d, "wood")), ...[-0.25, 0, 0.25].map((x, i) => box(x * w, 0.06, 0.02, 0.1, 0.09, 0.25, i % 2 ? "dark" : "white"))] },

  // ---------------------------------------------------------------- plants
  plant: {
    name: "Plant", category: "plants", family: "plant", size: [0.5, 0.5, 1.0], paint: ["pot"],
    build: (w, d, h) => [...pot(w * 0.65, h * 0.3, d * 0.65), ball(0, h * 0.28, 0, w, h * 0.5, d, "plant", 10), ball(w * 0.1, h * 0.52, -d * 0.06, w * 0.7, h * 0.48, d * 0.7, "leaf", 8)],
  },
  plant_tall: {
    name: "Tall plant", category: "plants", family: "plant", size: [0.6, 0.6, 1.7], paint: ["pot"],
    build: (w, d, h) => [...pot(w * 0.6, h * 0.22, d * 0.6), cyl(0, h * 0.22, 0, 0.04, h * 0.55, 0.04, "woodDark", undefined, 5), ball(-w * 0.12, h * 0.45, 0.04, w * 0.6, h * 0.25, d * 0.6, "leaf", 8), ball(w * 0.12, h * 0.6, -0.05, w * 0.7, h * 0.25, d * 0.7, "plant", 8), ball(0, h * 0.74, 0, w * 0.8, h * 0.26, d * 0.8, "leaf", 8)],
  },
  plant_palm: {
    name: "Palm", category: "plants", family: "plant", size: [0.9, 0.9, 1.6], paint: ["pot"],
    build: (w, d, h) => {
      // fronds: long flat leaves drooping out from the top of the stem
      const top = h * 0.62;
      const fronds: Part[] = [];
      for (const [fx, fz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7]]) {
        const diag = fx !== 0 && fz !== 0;
        const len = diag ? 0.32 : 0.45;
        fronds.push(ball(fx * w * len * 0.5, top + (diag ? 0.12 : 0.02) * h, fz * d * len * 0.5, Math.abs(fx) > 0.5 || diag ? w * len : w * 0.12, h * 0.07, Math.abs(fz) > 0.5 || diag ? d * len : d * 0.12, diag ? "leaf" : "plant", 8));
      }
      return [...pot(w * 0.45, h * 0.22, d * 0.45), cyl(0, h * 0.22, 0, 0.07, top - h * 0.2, 0.07, "woodDark", undefined, 6, 0.7), ball(0, top - 0.03, 0, w * 0.2, h * 0.25, d * 0.2, "leaf", 8), ...fronds];
    },
  },
  plant_small: {
    name: "Small plant", category: "plants", family: "plant", size: [0.2, 0.2, 0.3], y: 0.75, paint: ["pot"],
    build: (w, d, h) => [...pot(w * 0.8, h * 0.4, d * 0.8), ball(0, h * 0.35, 0, w, h * 0.65, d, "plant", 8)],
  },
  plant_trailing: {
    name: "Trailing plant", category: "plants", family: "plant", size: [0.3, 0.3, 0.6], y: 1.6, paint: ["pot"],
    build: (w, d, h) => [cyl(0, h * 0.5, 0, w * 0.75, h * 0.3, d * 0.75, "pot", undefined, 10, 1.2), cyl(0, 0, 0, w * 0.5, h * 0.55, d * 0.5, "leaf", undefined, 8, 2.2), ball(0, h * 0.7, 0, w, h * 0.3, d, "plant", 8)],
  },
  cactus: {
    name: "Cactus", category: "plants", family: "plant", size: [0.35, 0.35, 0.9], paint: ["pot"],
    build: (w, d, h) => [...pot(w * 0.7, h * 0.25, d * 0.7), cyl(0, h * 0.25, 0, w * 0.35, h * 0.75, d * 0.35, "plant", undefined, 8, 0.85), cyl(w * 0.25, h * 0.45, 0, w * 0.18, h * 0.3, d * 0.18, "plant", undefined, 6, 0.8), cyl(-w * 0.22, h * 0.55, 0, w * 0.16, h * 0.25, d * 0.16, "plant", undefined, 6, 0.8)],
  },

  // ---------------------------------------------------------------- fitness
  dumbbells: {
    name: "Dumbbells", category: "fitness", family: "weights", size: [0.36, 0.3, 0.12], paint: ["rubber"],
    build: (w, d, h) => [-1, 1].flatMap((s) => [
      rod("x", 0, h * 0.375, (s * d) / 4, w * 0.6, h * 0.25, h * 0.25, "metal", 8),
      rod("x", -w / 2 + w * 0.11, 0, (s * d) / 4, w * 0.22, h, h, "rubber", 10),
      rod("x", w / 2 - w * 0.11, 0, (s * d) / 4, w * 0.22, h, h, "rubber", 10),
    ]),
  },
  dumbbell_rack: {
    name: "Dumbbell rack", category: "fitness", family: "weights", size: [1.1, 0.5, 0.8], paint: ["rubber"],
    build: (w, d, h) => {
      const parts: Part[] = [...legs(w, d, h, 0.05, 0.02, "dark"), box(0, h * 0.45, 0, w, 0.03, d * 0.9, "dark"), box(0, h - 0.03, 0, w, 0.03, d * 0.9, "dark")];
      for (const y of [h * 0.48, h]) for (let i = 0; i < 4; i++) {
        const z = -d / 2 + 0.1 + i * ((d - 0.2) / 3);
        const s = 0.1 + i * 0.015;
        parts.push(rod("x", 0, y, z, 0.32, s, s, "rubber", 8));
      }
      return parts;
    },
  },
  kettlebell: { name: "Kettlebell", category: "fitness", family: "weights", size: [0.22, 0.22, 0.28], paint: ["rubber"], build: (w, d, h) => [ball(0, 0, 0, w, h * 0.72, d, "rubber", 10), rod("x", 0, h * 0.75, 0, w * 0.6, h * 0.25, 0.04, "rubber", 8)] },
  weight_bench: {
    name: "Weight bench", category: "fitness", family: "bench_gym", size: [0.5, 1.25, 0.48],
    build: (w, d, h) => [box(0, h - 0.07, 0.1, w * 0.6, 0.07, d * 0.55, "fabricDark"), box(0, h - 0.07, -d * 0.28, w * 0.6, 0.07, d * 0.4, "fabricDark"), box(0, 0, 0, 0.08, h - 0.07, d * 0.9, "dark"), box(0, 0, -d / 2 + 0.05, w, 0.05, 0.08, "dark"), box(0, 0, d / 2 - 0.05, w, 0.05, 0.08, "dark")],
  },
  treadmill: {
    name: "Treadmill", category: "fitness", family: "cardio", size: [0.8, 1.8, 1.4], paint: ["dark"],
    build: (w, d, h) => [box(0, 0, 0.1, w, 0.18, d - 0.2, "dark"), box(0, 0.18, 0.1, w - 0.16, 0.01, d - 0.3, "rubber"), ...[-1, 1].map((s) => box(s * (w / 2 - 0.04), 0.18, -d / 2 + 0.2, 0.06, h - 0.3, 0.06, "dark")), box(0, h - 0.15, -d / 2 + 0.2, w, 0.12, 0.3, "dark"), box(0, h - 0.03, -d / 2 + 0.2, w * 0.5, 0.01, 0.2, "screen", "screen")],
  },
  exercise_bike: {
    name: "Exercise bike", category: "fitness", family: "cardio", size: [0.55, 1.1, 1.2], paint: ["dark"],
    build: (w, d, h) => [box(0, 0, -d / 2 + 0.05, w, 0.05, 0.1, "dark"), box(0, 0, d / 2 - 0.05, w, 0.05, 0.1, "dark"), box(0, 0.05, 0, 0.08, 0.08, d - 0.1, "dark"), rod("x", 0, 0.12, -d / 2 + 0.3, 0.06, 0.45, 0.45, "metal", 14), box(0, 0.1, 0.18, 0.07, 0.7, 0.07, "dark"), box(0, 0.8, 0.22, 0.24, 0.07, 0.3, "fabricDark"), box(0, 0.1, -d / 2 + 0.22, 0.07, h - 0.2, 0.07, "dark"), box(0, h - 0.1, -d / 2 + 0.25, w * 0.8, 0.04, 0.1, "dark")],
  },
  rowing_machine: {
    name: "Rowing machine", category: "fitness", family: "cardio", size: [0.55, 2.2, 0.55], paint: ["dark"],
    build: (w, d, h) => [box(0, 0.15, 0.15, 0.1, 0.06, d - 0.5, "metal"), box(0, 0, d / 2 - 0.05, w, 0.15, 0.1, "dark"), rod("x", 0, 0, -d / 2 + 0.25, 0.18, h, 0.5, "dark", 16), box(0, 0.21, 0.2, 0.3, 0.06, 0.3, "fabricDark"), box(0, 0.12, -d / 2 + 0.6, w, 0.03, 0.15, "dark")],
  },
  yoga_mat: { name: "Yoga mat", category: "fitness", family: "mat", size: [0.61, 1.83, 0.006], paint: ["blue"], build: (w, d) => [box(0, 0, 0, w, 0.006, d, "blue")] },
  yoga_mat_rolled: { name: "Rolled mat", category: "fitness", family: "mat", size: [0.61, 0.13, 0.13], paint: ["blue"], build: (w, d, h) => [rod("x", 0, 0, 0, w, h, d, "blue", 12)] },
  punching_bag: { name: "Punching bag", category: "fitness", family: "bag", size: [0.36, 0.36, 1.2], y: 0.55, paint: ["red"], build: (w, d, h) => [cyl(0, 0, 0, w, h - 0.15, d, "red", undefined, 14), cyl(0, h - 0.15, 0, 0.02, 0.15, 0.02, "metal", undefined, 4)] },

  // ---------------------------------------------------------------- kids
  cot: {
    name: "Cot", category: "kids", family: "bed", size: [0.66, 1.26, 0.9], paint: ["white"],
    build: (w, d, h) => {
      const parts: Part[] = [box(0, 0.3, 0, w - 0.06, 0.1, d - 0.06, "mattress"), ...legs(w, d, h, 0.05, 0, "white")];
      for (const side of [-1, 1]) {
        parts.push(box(0, h - 0.04, (side * (d - 0.05)) / 2, w, 0.04, 0.04, "white"), box((side * (w - 0.05)) / 2, h - 0.04, 0, 0.04, 0.04, d, "white"));
        for (let i = 1; i < 8; i++) parts.push(box(-w / 2 + (w / 8) * i, 0.3, (side * (d - 0.05)) / 2, 0.02, h - 0.34, 0.02, "white"));
      }
      return parts;
    },
  },
  toy_box: { name: "Toy box", category: "kids", family: "storage_low", size: [0.7, 0.4, 0.45], paint: ["blue"], build: (w, d, h) => [box(0, 0, 0, w, h - 0.03, d, "blue"), box(0, h - 0.03, 0, w + 0.02, 0.03, d + 0.02, "white"), ball(-w * 0.2, h, 0, 0.14, 0.14, 0.14, "red", 6), box(w * 0.18, h, 0.02, 0.12, 0.12, 0.12, "accent")] },
  play_tent: { name: "Play tent", category: "kids", family: "tent", size: [1.1, 1.1, 1.5], paint: ["canvas"], build: (w, d, h) => [cyl(0, 0, 0, w, h, d, "canvas", undefined, 6, 0), cyl(0, 0, 0, w * 0.8, 0.012, d * 0.8, "rug", undefined, 12)] },
  high_chair: {
    name: "High chair", category: "kids", family: "chair", size: [0.55, 0.6, 1.0], paint: ["white"],
    build: (w, d, h) => {
      // a seat with a back and sides, a tray resting on the sides, and legs splaying out to the corners
      const sy = h * 0.56, sw = w * 0.62, arm = sy + Math.min(0.25, (h - sy) * 0.55);
      const zb = -d * 0.32, zs = zb + 0.04, zf = d * 0.25, zt = d * 0.45;
      return [
        box(0, sy, (zs + zf) / 2, sw, 0.05, zf - zs, "white"),
        box(0, sy, zb + 0.02, sw, h - sy, 0.04, "white"),
        ...[-1, 1].map((s) => box(s * (sw / 2 - 0.015), sy + 0.05, (zs + zf) / 2, 0.03, arm - sy - 0.05, zf - zs, "white")),
        box(0, arm, (zf - 0.06 + zt) / 2, sw + 0.12, 0.025, zt - zf + 0.06, "white"),
        box(0, arm + 0.025, zt - 0.015, sw + 0.12, 0.02, 0.03, "white"),
        ...splayLegs([sw / 2 - 0.05, (zb + zf) / 2, (zf - zb) / 2 - 0.05], [w / 2 - 0.03, d / 2 - 0.03], sy, 0.045, "wood"),
      ];
    },
  },

  // ---------------------------------------------------------------- utility
  washer: {
    name: "Washing machine", category: "utility", family: "washer", size: [0.6, 0.6, 0.85],
    build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), rod("z", 0, h * 0.25, d / 2, w * 0.55, w * 0.55, 0.02, "dark", 16)],
  },
  dryer: { name: "Dryer", category: "utility", family: "washer", size: [0.6, 0.6, 0.85], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), rod("z", 0, h * 0.25, d / 2, w * 0.55, w * 0.55, 0.02, "metal", 16)] },
  radiator: {
    name: "Radiator", category: "utility", family: "radiator", size: [1.0, 0.1, 0.6], y: 0.12,
    build: (w, d, h) => {
      const n = Math.max(3, Math.round(w / 0.08));
      return [box(0, 0, 0, w, h, d, "white"), ...Array.from({ length: n }, (_, i) => box(-w / 2 + (w / n) * (i + 0.5), 0.02, d / 2, 0.012, h - 0.04, 0.006, "ceramic"))];
    },
  },
  boiler: { name: "Boiler", category: "utility", family: "boiler", size: [0.45, 0.35, 0.7], y: 1.2, build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, h * 0.15, d / 2, w * 0.4, h * 0.08, 0.01, "dark")] },
  laundry_basket: { name: "Laundry basket", category: "utility", family: "basket", size: [0.4, 0.4, 0.55], paint: ["wood"], build: (w, d, h) => [cyl(0, 0, 0, w, h, d, "wood", undefined, 12, 1.1), ball(0, h - 0.1, 0, w * 0.8, 0.2, d * 0.8, "fabric", 8)] },
  printer_3d: { name: "3D printer", category: "utility", family: "printer", size: [0.4, 0.4, 0.5], build: (w, d, h) => [box(0, 0, 0, w, h, d, "dark"), box(0, 0.05, d / 2 - 0.004, w * 0.85, h * 0.8, 0.008, "glass", "screen")] },

  // ---------------------------------------------------------------- garden
  garden_table: { name: "Garden table", category: "outdoor", family: "garden_table", size: [1.2, 1.2, 0.72], paint: ["metal"], build: (w, d, h) => [cyl(0, h - 0.03, 0, w, 0.03, d, "metal", undefined, 18), ...roundTopLegs(w, d, h - 0.03, 0.55, 0.8, 0.04, "dark")] },
  garden_chair: { name: "Garden chair", category: "outdoor", family: "garden_chair", size: [0.55, 0.6, 0.85], build: (w, d, h) => [box(0, 0.42, 0.02, w, 0.04, d - 0.06, "wood"), box(0, 0.46, -d / 2 + 0.04, w, h - 0.46, 0.04, "wood"), ...legs(w, d, 0.42, 0.04, 0.03, "metal"), box(-w / 2 + 0.02, 0.6, 0, 0.04, 0.03, d - 0.1, "metal"), box(w / 2 - 0.02, 0.6, 0, 0.04, 0.03, d - 0.1, "metal")] },
  sun_lounger: { name: "Sun lounger", category: "outdoor", family: "garden_chair", size: [0.7, 1.95, 0.5], paint: ["fabric"], build: (w, d, h) => [box(0, 0.25, 0.25, w, 0.06, d - 0.5, "fabric"), box(0, 0.25, -d / 2 + 0.3, w, h, 0.12, "fabric"), ...legs(w, d, 0.25, 0.04, 0.05, "metal")] },
  garden_sofa: { name: "Garden sofa", category: "outdoor", family: "garden_chair", size: [1.8, 0.8, 0.75], build: (w, d, h) => [...sofa(w, d, h).map((p) => (p.role === "fabric" ? { ...p, role: "woodDark" as Role } : p))] },
  parasol: { name: "Parasol", category: "outdoor", family: "parasol", size: [2.5, 2.5, 2.4], paint: ["canvas"], build: (w, d, h) => [cyl(0, 0, 0, 0.45, 0.06, 0.45, "dark", undefined, 10), cyl(0, 0.06, 0, 0.04, h - 0.06, 0.04, "metal", undefined, 6), cyl(0, h - 0.45, 0, w, 0.4, d, "canvas", undefined, 8, 0.05)] },
  bbq: { name: "Barbecue", category: "outdoor", family: "bbq", size: [0.6, 0.6, 1.0], paint: ["dark"], build: (w, d, h) => [ball(0, h * 0.45, 0, w, h * 0.55, d, "dark", 12), ...roundTopLegs(w, d, h * 0.62, 0.55, 0.85, 0.04, "metal"), legShelf(w, d, h * 0.62, 0.55, 0.85, h * 0.25, 0.02, "metal", 12)] },
  fire_pit: { name: "Fire pit", category: "outdoor", family: "bbq", size: [0.9, 0.9, 0.4], paint: ["dark"], build: (w, d, h) => [cyl(0, 0, 0, w * 0.8, h, d * 0.8, "dark", undefined, 16, 1.25), cyl(0, h - 0.04, 0, w * 0.85, 0.02, d * 0.85, "accent", undefined, 16)] },
  solar_panels: {
    // panels upright side by side, tilted to the front; their cells shine with what the house's solar makes
    name: "Solar panels", category: "outdoor", family: "solar", size: [4.2, 1.5, 1.1],
    build: (w, d, h) => {
      const n = Math.max(1, Math.round(w / 1.05));
      const gap = 0.02, pw = (w - gap * (n - 1)) / n;
      const low = 0.25, t = 0.035;
      const rise = Math.max(0.05, h - low - t);
      const sh = -rise / d;
      const mid = low + rise / 2;
      const out: Part[] = [];
      for (let i = 0; i < n; i++) {
        const x = -w / 2 + pw / 2 + i * (pw + gap);
        out.push({ ...box(x, mid, 0, pw, t, d, "metal"), shear: sh });
        out.push({ ...box(x, mid + t, 0, pw - 0.04, 0.006, d - 0.04, "screen", "screen"), shear: sh });
      }
      // tall legs at the back, short ones at the front, their tops hidden in the panels
      for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) {
        out.push(box(x, 0, -d / 2 + 0.06, 0.04, low + rise - 0.01, 0.04, "metal"));
        out.push(box(x, 0, d / 2 - 0.06, 0.04, low + 0.05, 0.04, "metal"));
      }
      return out;
    },
  },
  ev_charger: {
    // a wall box with a tethered cable coiled under it; its light shows what it is doing
    name: "EV charger", category: "outdoor", family: "ev_charger", size: [0.24, 0.13, 0.36], y: 0.95, paint: ["white"],
    build: (w, d, h) => [
      box(0, 0, 0, w, h, d, "white"),
      box(0, h * 0.1, d / 2 + 0.002, w * 0.78, h * 0.8, 0.008, "dark"),
      { ...rod("z", 0, h * 0.42, d / 2 + 0.0095, 0.1, 0.1, 0.006, "screen", 16), glow: "screen" },
      rod("z", 0, -0.17, -d * 0.1, 0.17, 0.17, 0.035, "rubber", 14),
      box(w / 2 + 0.025, h * 0.2, 0, 0.05, 0.11, 0.06, "dark"),
    ],
  },
  ev_charger_post: {
    name: "Charging post", category: "outdoor", family: "ev_charger", size: [0.26, 0.2, 1.3], paint: ["white"],
    build: (w, d, h) => {
      const head = 0.4;
      return [
        box(0, 0, 0, w, 0.04, d, "metal"),
        box(0, 0.04, 0, w * 0.55, h - head - 0.04, d * 0.6, "metal"),
        box(0, h - head, 0, w, head, d, "white"),
        box(0, h - head + 0.04, d / 2 + 0.002, w * 0.78, head - 0.08, 0.008, "dark"),
        { ...rod("z", 0, h - head * 0.62, d / 2 + 0.0095, 0.1, 0.1, 0.006, "screen", 16), glow: "screen" },
        box(w / 2 + 0.025, h - head * 0.75, 0, 0.05, 0.11, 0.06, "dark"),
      ];
    },
  },
  trampoline: {
    name: "Trampoline", category: "outdoor", family: "play", size: [3.0, 3.0, 0.9], paint: ["blue"],
    build: (w, d, h) => [cyl(0, h - 0.06, 0, w, 0.06, d, "blue", undefined, 24), cyl(0, h - 0.055, 0, w * 0.86, 0.008, d * 0.86, "rubber", undefined, 24), ...[0, 1, 2, 3, 4, 5].map((i) => cyl(Math.cos(i * 1.047) * w * 0.47, 0, Math.sin(i * 1.047) * d * 0.47, 0.05, h - 0.06, 0.05, "metal", undefined, 5))],
  },
  swing: { name: "Swing", category: "outdoor", family: "play", size: [2.2, 1.6, 2.1], build: (w, d, h) => [box(0, h - 0.08, 0, w, 0.08, 0.08, "woodDark"), ...[-1, 1].flatMap((s) => [box(s * (w / 2 - 0.04), 0, -d / 4, 0.08, h - 0.08, 0.08, "woodDark"), box(s * (w / 2 - 0.04), 0, d / 4, 0.08, h - 0.08, 0.08, "woodDark")]), box(-0.3, 0.45, 0, 0.45, 0.04, 0.18, "red"), box(0.3, 0.45, 0, 0.45, 0.04, 0.18, "blue")] },
  shed: { name: "Shed", category: "outdoor", family: "shed", size: [2.4, 1.8, 2.3], paint: ["wood"], build: (w, d, h) => [box(0, 0, 0, w, h * 0.78, d, "wood"), prism(0, h * 0.78, 0, w + 0.2, h * 0.22, d + 0.2, "dark"), box(-w * 0.2, 0, d / 2, w * 0.38, h * 0.7, 0.02, "woodDark"), box(w * 0.25, h * 0.4, d / 2, w * 0.3, h * 0.2, 0.02, "glass")] },
  greenhouse: { name: "Greenhouse", category: "outdoor", family: "shed", size: [2.5, 1.9, 2.3], build: (w, d, h) => [box(0, 0, 0, w, 0.3, d, "white"), box(0, 0.3, 0, w, h * 0.7 - 0.3, d, "glass"), prism(0, h * 0.7, 0, w, h * 0.3, d, "glass")] },
  planter: { name: "Planter", category: "outdoor", family: "planter", size: [1.2, 0.45, 0.8], paint: ["woodDark"], build: (w, d, h) => [box(0, 0, 0, w, h * 0.5, d, "woodDark"), ball(-w * 0.25, h * 0.4, 0, w * 0.5, h * 0.6, d, "plant", 8), ball(w * 0.22, h * 0.42, 0, w * 0.5, h * 0.55, d * 0.9, "leaf", 8)] },
  hedge: {
    name: "Hedge", category: "outdoor", family: "planter", size: [2.0, 0.6, 1.4],
    build: (w, d, h) => {
      const n = Math.max(2, Math.round(w / 0.5));
      return [box(0, 0, 0, w, h * 0.85, d, "leaf"), ...Array.from({ length: n }, (_, i) => ball(-w / 2 + (w / n) * (i + 0.5), h * 0.62, 0, w / n + 0.1, h * 0.38, d * 1.05, "plant", 8))];
    },
  },
  shrub: { name: "Shrub", category: "outdoor", family: "tree", size: [0.9, 0.9, 0.8], build: (w, d, h) => [ball(0, 0, 0, w, h, d, "plant", 10), ball(w * 0.15, h * 0.3, 0.05, w * 0.6, h * 0.7, d * 0.6, "leaf", 8)] },
  tree: { name: "Tree", category: "outdoor", family: "tree", size: [3.0, 3.0, 5.0], build: (w, d, h) => [cyl(0, 0, 0, 0.3, h * 0.5, 0.3, "woodDark", undefined, 8, 0.7), ball(0, h * 0.35, 0, w, h * 0.55, d, "plant", 12), ball(w * 0.15, h * 0.6, -d * 0.1, w * 0.7, h * 0.4, d * 0.7, "leaf", 10)] },
  tree_conifer: { name: "Conifer", category: "outdoor", family: "tree", size: [2.0, 2.0, 5.0], build: (w, d, h) => [cyl(0, 0, 0, 0.25, h * 0.2, 0.25, "woodDark", undefined, 8), cyl(0, h * 0.15, 0, w, h * 0.45, d, "leaf", undefined, 10, 0.4), cyl(0, h * 0.45, 0, w * 0.75, h * 0.35, d * 0.75, "leaf", undefined, 10, 0.3), cyl(0, h * 0.7, 0, w * 0.5, h * 0.3, d * 0.5, "leaf", undefined, 10, 0)] },
  hot_tub: { name: "Hot tub", category: "outdoor", family: "hot_tub", size: [2.0, 2.0, 0.9], paint: ["woodDark"], build: (w, d, h) => [box(0, 0, 0, w, h - 0.02, d, "woodDark"), box(0, h - 0.1, 0, w - 0.2, 0.1, d - 0.2, "water")] },
  car: { name: "Hatchback", category: "outdoor", family: "car", size: [1.77, 4.25, 1.52], paint: ["accent"], build: (w, d, h) => carParts(w, d, h, CAR_STYLES.hatchback) },
  car_saloon: { name: "Saloon", category: "outdoor", family: "car", size: [1.85, 4.7, 1.44], paint: ["accent"], build: (w, d, h) => carParts(w, d, h, CAR_STYLES.saloon) },
  car_suv: { name: "SUV", category: "outdoor", family: "car", size: [1.88, 4.6, 1.65], paint: ["accent"], build: (w, d, h) => carParts(w, d, h, CAR_STYLES.suv) },
  car_estate: { name: "Estate", category: "outdoor", family: "car", size: [1.82, 4.7, 1.5], paint: ["accent"], build: (w, d, h) => carParts(w, d, h, CAR_STYLES.estate) },
  bicycle: {
    name: "Bicycle", category: "outdoor", family: "vehicle", size: [0.55, 1.75, 1.05], paint: ["blue"],
    build: (w, d, h) => [rod("x", 0, 0, -d / 2 + 0.35, 0.04, 0.68, 0.68, "rubber", 16), rod("x", 0, 0, d / 2 - 0.35, 0.04, 0.68, 0.68, "rubber", 16), box(0, 0.34, 0, 0.04, 0.04, d - 0.7, "blue"), box(0, 0.38, -0.12, 0.04, 0.45, 0.04, "blue"), box(0, 0.83, -0.12, 0.12, 0.05, 0.24, "dark"), box(0, 0.38, d / 2 - 0.4, 0.04, h - 0.45, 0.04, "blue"), box(0, h - 0.06, d / 2 - 0.4, w, 0.03, 0.03, "dark")],
  },

  // ---------------------------------------------------------------- lights (glow with their light entity)
  lamp_ceiling: { name: "Ceiling light", category: "lights", family: "lamp_ceiling", size: [0.4, 0.4, 0.1], build: (w, d, h) => [cyl(0, -h, 0, w, h, d, "bulb", "lamp", 16)] },
  lamp_pendant: {
    name: "Pendant light", category: "lights", family: "lamp_ceiling", size: [0.35, 0.35, 0.8],
    build: (w, d, h) => [cyl(0, -h, 0, w, 0.22, d, "bulb", "lamp", 14, 0.35), cyl(0, -h + 0.22, 0, 0.012, h - 0.22, 0.012, "dark", undefined, 4)],
  },
  lamp_globe: {
    name: "Globe pendant", category: "lights", family: "lamp_ceiling", size: [0.3, 0.3, 0.7],
    build: (w, d, h) => [ball(0, -h, 0, w, w, d, "bulb", 12, "lamp"), cyl(0, -h + w, 0, 0.012, h - w, 0.012, "dark", undefined, 4)],
  },
  lamp_chandelier: {
    name: "Chandelier", category: "lights", family: "lamp_ceiling", size: [0.7, 0.7, 0.7],
    build: (w, d, h) => [
      cyl(0, -h * 0.25, 0, 0.012, h * 0.25, 0.012, "metal", undefined, 4), cyl(0, -h * 0.55, 0, w * 0.15, h * 0.3, d * 0.15, "metal", undefined, 8),
      ...[0, 1, 2, 3, 4].map((i) => cyl(Math.cos(i * 1.2566) * w * 0.4, -h, Math.sin(i * 1.2566) * d * 0.4, 0.1, 0.16, 0.1, "bulb", "lamp", 8, 0.6)),
    ],
  },
  lamp_downlight: { name: "Downlight", category: "lights", family: "lamp_ceiling", size: [0.1, 0.1, 0.02], build: (w, d, h) => [cyl(0, -h, 0, w, h, d, "bulb", "lamp", 10)] },
  lamp_spots: { name: "Spotlight bar", category: "lights", family: "lamp_ceiling", size: [0.8, 0.08, 0.15], build: (w, d, h) => [box(0, -0.03, 0, w, 0.03, d, "dark"), ...[-1, 0, 1].map((i) => cyl((i * w) / 3, -h, 0, 0.07, h - 0.03, 0.07, "bulb", "lamp", 8, 1.2))] },
  lamp_floor: {
    name: "Floor lamp", category: "lights", family: "lamp_floor", size: [0.4, 0.4, 1.6],
    build: (w, d, h) => [cyl(0, 0, 0, w * 0.6, 0.03, d * 0.6, "dark"), cyl(0, 0.03, 0, 0.025, h - 0.35, 0.025, "metal", undefined, 6), cyl(0, h - 0.32, 0, w, 0.3, d, "bulb", "lamp", 14, 0.75)],
  },
  lamp_arc: {
    name: "Arc lamp", category: "lights", family: "lamp_floor", size: [0.4, 1.6, 2.0],
    build: (_w, d, h) => [box(0, 0, -d / 2 + 0.2, 0.35, 0.06, 0.35, "ceramic"), box(0, 0.06, -d / 2 + 0.2, 0.03, h - 0.1, 0.03, "metal"), box(0, h - 0.04, -d / 2 + 0.2 + (d - 0.45) / 2, 0.03, 0.03, d - 0.45, "metal"), ball(0, h - 0.35, d / 2 - 0.2, 0.4, 0.3, 0.4, "bulb", 12, "lamp")],
  },
  lamp_table: {
    name: "Table lamp", category: "lights", family: "lamp_table", size: [0.25, 0.25, 0.45], y: 0.5,
    build: (w, d, h) => [ball(0, 0, 0, w * 0.55, h * 0.5, d * 0.55, "ceramic", 10), cyl(0, h * 0.5, 0, w, h * 0.5, d, "bulb", "lamp", 12, 0.7)],
  },
  lamp_wall: { name: "Wall light", category: "lights", family: "lamp_wall", size: [0.25, 0.12, 0.2], y: 1.8, build: (w, d, h) => [box(0, 0, -d / 2 + 0.01, w * 0.4, h * 0.6, 0.02, "dark"), box(0, 0, 0, w, h, d * 0.8, "bulb", "lamp")] },
  led_strip: { name: "LED strip", category: "lights", family: "led_strip", size: [1.5, 0.02, 0.012], build: (w, d, h) => [box(0, 0, 0, w, h, d, "bulb", "lamp")] },
  lamp_garden: { name: "Garden light", category: "lights", family: "lamp_garden", size: [0.15, 0.15, 0.6], build: (w, d, h) => [cyl(0, 0, 0, w * 0.4, h - 0.15, d * 0.4, "dark", undefined, 6), cyl(0, h - 0.15, 0, w, 0.15, d, "bulb", "lamp", 10)] },
  lamp_post: { name: "Lamp post", category: "lights", family: "lamp_garden", size: [0.3, 0.3, 2.2], build: (w, d, h) => [cyl(0, 0, 0, w * 0.6, 0.1, d * 0.6, "dark", undefined, 8), cyl(0, 0.1, 0, 0.07, h - 0.45, 0.07, "dark", undefined, 8), cyl(0, h - 0.35, 0, w, 0.3, d, "bulb", "lamp", 8, 0.6), cyl(0, h - 0.06, 0, w * 0.75, 0.06, d * 0.75, "dark", undefined, 8, 0.3)] },

  // ---------------------------------------------------------------- structure
  stairs: { name: "Stairs", category: "structure", family: "stairs", size: [0.9, 3.0, 2.6], build: steps },
  column: { name: "Column", category: "structure", family: "column", size: [0.3, 0.3, 2.5], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white")] },
};

/** Cars, in their styles. */
export const CAR_TYPES = new Set(Object.keys(FURNITURE).filter((k) => FURNITURE[k].family === "car"));

/** Pieces that show a car charger's state: the chargers' lights, the cars' charging ports. */
export const EV_TYPES = new Set([...CAR_TYPES, "ev_charger", "ev_charger_post"]);

/** Popular electric cars: the style and size (w, d, h) for a car's name ("Nissan LEAF (2015-2018)"). */
const CAR_MODELS: [RegExp, string, number, number, number][] = [
  [/leaf/i, "car", 1.77, 4.45, 1.55],
  [/model ?3/i, "car_saloon", 1.85, 4.69, 1.44],
  [/model ?y/i, "car_suv", 1.92, 4.75, 1.62],
  [/model ?s/i, "car_saloon", 1.96, 4.97, 1.45],
  [/model ?x/i, "car_suv", 2.0, 5.04, 1.68],
  [/\bmg ?4\b/i, "car", 1.84, 4.29, 1.5],
  [/\bmg ?5\b/i, "car_estate", 1.82, 4.6, 1.54],
  [/\bmg zs\b/i, "car_suv", 1.81, 4.32, 1.62],
  [/\bid\.? ?3\b|\bborn\b/i, "car", 1.81, 4.26, 1.55],
  [/\bid\.? ?[457]\b|enyaq|\bq4\b|elroq/i, "car_suv", 1.85, 4.58, 1.63],
  [/niro/i, "car_suv", 1.83, 4.42, 1.57],
  [/\bev ?6\b/i, "car_suv", 1.88, 4.68, 1.55],
  [/\bev ?9\b/i, "car_suv", 1.98, 5.01, 1.75],
  [/kona/i, "car_suv", 1.8, 4.21, 1.57],
  [/ioniq ?5/i, "car_suv", 1.89, 4.64, 1.6],
  [/ioniq ?6/i, "car_saloon", 1.88, 4.86, 1.5],
  [/ioniq/i, "car", 1.82, 4.47, 1.45],
  [/polestar ?2/i, "car_saloon", 1.86, 4.61, 1.48],
  [/zoe/i, "car", 1.79, 4.09, 1.56],
  [/\bi3\b/i, "car", 1.78, 4.01, 1.6],
  [/\bi4\b/i, "car_saloon", 1.85, 4.78, 1.45],
  [/ix3|xc40|ex30|ex40|c40|eq[ab]\b|atto ?3|mach-?e/i, "car_suv", 1.87, 4.5, 1.63],
  [/i-?pace|e-?tron|eqc/i, "car_suv", 1.94, 4.75, 1.6],
  [/e-?208|corsa|e-?2008|\bmini\b|dolphin|500e|fiat 500/i, "car", 1.75, 4.0, 1.48],
  [/\bseal\b|taycan|\beqe\b/i, "car_saloon", 1.9, 4.85, 1.42],
];

/** The style and size for a car's name, when it is a car we know. */
export function carModel(name: string | null | undefined): { type: string; size: [number, number, number] } | null {
  const m = name ? CAR_MODELS.find(([re]) => re.test(name)) : undefined;
  return m ? { type: m[1], size: [m[2], m[3], m[4]] } : null;
}

/** Light fixtures follow a light entity's state. */
export const LAMP_TYPES = Object.keys(FURNITURE).filter((k) => FURNITURE[k].category === "lights");

/** Fixtures that hang from the ceiling (placed at the ceiling, light below). */
export const CEILING_LAMPS = new Set(["lamp_ceiling", "lamp_pendant", "lamp_globe", "lamp_chandelier", "lamp_downlight", "lamp_spots"]);

export function furnitureType(type: string): FurnitureType {
  return FURNITURE[type] ?? FURNITURE.tall_cabinet;
}

/** Height of a piece's bottom above its storey's floor: its own, else its type's; ceiling lamps hang from the ceiling. */
export function baseHeight(item: { type: string; y?: number | null }, storeyHeight: number): number {
  if (item.y !== undefined && item.y !== null) return item.y;
  if (CEILING_LAMPS.has(item.type)) return storeyHeight - 0.02;
  return furnitureType(item.type).y ?? 0;
}

/** Types a piece can be swapped for (same family), the piece's own type first. */
export function styleOptions(type: string): string[] {
  const fam = FURNITURE[type]?.family;
  if (!fam) return [type];
  return [type, ...Object.keys(FURNITURE).filter((k) => k !== type && FURNITURE[k].family === fam)];
}

const UPHOLSTERED: Role[] = ["fabric", "fabricDark", "cushion"];

/** Whether a type has upholstery (can take a fabric finish). */
export function isUpholstered(type: string): boolean {
  const def = furnitureType(type);
  const [w, d, h] = def.size;
  return def.build(w, d, h).some((p) => UPHOLSTERED.includes(p.role));
}

/** Roles a picked colour paints, for a set of parts. */
export function paintRoles(def: FurnitureType, parts: Part[]): Set<Role> {
  if (def.paint) return new Set(def.paint);
  const has = (r: Role) => parts.some((p) => p.role === r);
  if (UPHOLSTERED.some(has)) return new Set(UPHOLSTERED);
  if (has("wood") || has("woodDark")) return new Set<Role>(["wood", "woodDark"]);
  if (has("white")) return new Set<Role>(["white"]);
  return new Set<Role>([parts[0]?.role ?? "white"]);
}
