// Fences and garden walls: posts and panels along a line on the ground, in the popular designs
// (closeboard, lap, slatted, picket, railings, palisade, glass, a brick wall…), at any height and
// colour, on a gravel board or not, with a trellis topper and gates. Every bay, post and gate is a
// small piece of simple solids built like furniture, so a garden's fences merge into the floor's
// mesh and cost no extra draw calls.
import type { Fence, FencePost, FenceStyle, Furniture, Vec2 } from "../model/plan";
import type { PlainKey } from "../i18n";
import type { Swatch } from "./finishes";
import type { Part, Role } from "./furniture-lib";

interface BayOpts {
  /** Fewer, bigger parts (the tablet look). */
  low: boolean;
  /** Width of the posts: rails that run across them reach their middles. */
  post: number;
}

export interface FenceStyleDef {
  /** Its name, in the table (src/i18n). */
  label: PlainKey;
  /** Usual height (m) and distance between posts. */
  height: number;
  spacing: number;
  posts: FencePost;
  /** Its colour when none is picked ("#rrggbb"), and the roles a picked colour paints. */
  color?: string;
  paint: Role[];
  /** Timber panels: they can stand on a gravel board and carry a trellis topper. */
  timber: boolean;
  /** On a gravel board unless told otherwise. */
  gravel: boolean;
  /** How far the panels stand off the ground without a gravel board. */
  clear: number;
  /** Metal posts' role and size. */
  metal?: { role: Role; size: number };
  /** One bay between two posts: w wide, h high, standing on y = 0, its front towards +z. */
  bay: (w: number, h: number, o: BayOpts) => Part[];
}

const T: Role = "pine";
const BM: Role = "blackMetal";

const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, extra: Partial<Part> = {}): Part => ({ shape: "box", x, y, z, w, h, d, role, ...extra });
/** A four-sided point (a picket's or a railing's top), seen from the front as a triangle. */
const tip = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role): Part => ({ shape: "cyl", x, y, z, w, h, d, role, seg: 4, taper: 0 });

/** n equal pieces across w: their middles and their pitch. */
function across(w: number, pitch: number, min = 1): { xs: number[]; p: number } {
  const n = Math.max(min, Math.round(w / pitch));
  const p = w / n;
  return { xs: Array.from({ length: n }, (_, i) => -w / 2 + p * (i + 0.5)), p };
}

/** Rails behind the boards: two, or three on a tall fence. */
function rails(w: number, h: number, z: number, d: number, role: Role = T): Part[] {
  const ys = h > 1.3 ? [0.2, h / 2 - 0.035, h - 0.27] : [0.12, Math.max(0.3, h - 0.22)];
  return ys.map((y) => box(0, y, z, w, 0.07, d, role));
}

/** Upright battens at both ends (and the middle), front and back of horizontal boards. */
function endBattens(w: number, h: number, zs: number[], middle = false): Part[] {
  const xs = [-w / 2 + 0.0225, w / 2 - 0.0225, ...(middle ? [0] : [])];
  return xs.flatMap((x) => zs.map((z) => box(x, 0, z, 0.045, h, 0.02, T)));
}

/** Horizontal boards or slats from the top down, pitch apart, each `slat` high. */
function slats(w: number, h: number, pitch: number, slat: number, z: number, d: number, role: Role = T, alternate = 0): Part[] {
  const n = Math.max(1, Math.floor((h - slat) / pitch) + 1);
  const y0 = h - (n - 1) * pitch - slat;
  return Array.from({ length: n }, (_, i) => box(0, y0 + i * pitch, z + (i % 2) * alternate, w, slat, d, role));
}

/** A square lattice in a frame: a trellis panel or the topper on a fence. */
function lattice(w: number, h: number, low: boolean): Part[] {
  const f = 0.04;
  const out: Part[] = [
    box(0, 0, 0, w, f, 0.04, T),
    box(0, h - f, 0, w, f, 0.04, T),
    box(-w / 2 + f / 2, f, 0, f, h - 2 * f, 0.04, T),
    box(w / 2 - f / 2, f, 0, f, h - 2 * f, 0.04, T),
  ];
  // upright laths in front, cross laths behind
  const step = low ? 0.3 : 0.15, iw = w - 2 * f, ih = h - 2 * f;
  const cols = Math.max(1, Math.round(iw / step) - 1), rows = Math.max(1, Math.round(ih / step) - 1);
  for (let i = 1; i <= cols; i++) out.push(box(-iw / 2 + (iw * i) / (cols + 1), f, 0.007, 0.028, ih, 0.01, T));
  for (let i = 1; i <= rows; i++) out.push(box(0, f + (ih * i) / (rows + 1) - 0.014, -0.007, iw, 0.028, 0.01, T));
  return out;
}

export const FENCE_STYLES: Record<FenceStyle, FenceStyleDef> = {
  closeboard: {
    // feather-edge boards nailed upright, each lapping the next, on arris rails behind, under a capping rail
    label: "fence.closeboard", height: 1.8, spacing: 1.83, posts: "timber", paint: [T], timber: true, gravel: true, clear: 0.05,
    bay: (w, h, o) => {
      const out = rails(w, h - 0.03, -0.03, 0.04);
      if (o.low) out.push(box(0, 0, 0.006, w, h - 0.03, 0.022, T));
      else {
        const { xs, p } = across(w, 0.1, 2);
        xs.forEach((x, i) => out.push(box(x, 0, 0.003 + (i % 2) * 0.006, p + 0.025, h - 0.03, 0.016, T)));
      }
      out.push(box(0, h - 0.03, 0.002, w, 0.03, 0.05, T));
      return out;
    },
  },
  lap: {
    // an overlap panel: waney boards across, each lapping the one below, framed and capped
    label: "fence.lapPanel", height: 1.8, spacing: 1.83, posts: "timber", paint: [T], timber: true, gravel: true, clear: 0.05,
    bay: (w, h, o) => {
      const inner = w - 0.09, body = h - 0.04;
      const n = Math.max(2, Math.round(body / 0.13)), p = body / n;
      const boards = o.low ? [box(0, 0, 0.007, inner, body, 0.016, T)]
        : Array.from({ length: n }, (_, i) => box(0, i * p, 0.004 + (i % 2) * 0.006, inner, Math.min(p + 0.02, body - i * p), 0.012, T));
      return [...boards, ...endBattens(w, body, [-0.016, 0.026]), box(0, body, 0.005, w, 0.04, 0.07, T)];
    },
  },
  slatted: {
    // contemporary horizontal slats with gaps, on battens behind
    label: "fence.slatted", height: 1.8, spacing: 1.83, posts: "timber", paint: [T], timber: true, gravel: false, clear: 0.05,
    bay: (w, h) => [...slats(w, h, 0.09, 0.07, 0.01, 0.02), ...endBattens(w, h, [-0.0125], true)],
  },
  venetian: {
    // thin slats with narrow gaps: privacy with a little light through
    label: "fence.venetian", height: 1.8, spacing: 1.83, posts: "timber", paint: [T], timber: true, gravel: false, clear: 0.05,
    bay: (w, h, o) => [...slats(w, h, o.low ? 0.11 : 0.055, o.low ? 0.09 : 0.045, 0.008, 0.016), ...endBattens(w, h, [-0.0125], true)],
  },
  hit_miss: {
    // boards upright on both sides of the rails, the back ones covering the front ones' gaps
    label: "fence.hitAndMiss", height: 1.8, spacing: 1.83, posts: "timber", paint: [T], timber: true, gravel: true, clear: 0.05,
    bay: (w, h, o) => {
      const out = rails(w, h, 0, 0.045);
      const { xs, p } = across(w, o.low ? 0.4 : 0.2);
      const bw = Math.min(p / 2 + 0.02, p - 0.01);
      for (const x of xs) {
        out.push(box(x - p / 4, 0, 0.0305, bw, h, 0.016, T));
        out.push(box(x + p / 4, 0, -0.0305, bw, h, 0.016, T));
      }
      return out;
    },
  },
  louvre: {
    // blades sloping down to the outside: air through, no view through
    label: "fence.louvre", height: 1.8, spacing: 1.83, posts: "timber", paint: [T], timber: true, gravel: true, clear: 0.05,
    bay: (w, h, o) => {
      const f = 0.045, inner = w - 2 * f;
      const out: Part[] = [box(0, 0, 0, w, f, 0.09, T), box(0, h - f, 0, w, f, 0.09, T), box(-w / 2 + f / 2, f, 0, f, h - 2 * f, 0.09, T), box(w / 2 - f / 2, f, 0, f, h - 2 * f, 0.09, T)];
      const pitch = o.low ? 0.11 : 0.055;
      const n = Math.max(1, Math.floor((h - 2 * f - 0.07) / pitch));
      for (let i = 0; i < n; i++) out.push(box(0, f + 0.035 + i * pitch, 0, inner, 0.012, 0.07, T, { shear: -0.9 }));
      return out;
    },
  },
  composite: {
    // tongue and groove composite boards between aluminium posts, in channels top and bottom
    label: "fence.composite", height: 1.8, spacing: 1.83, posts: "metal", color: "#55585c", paint: ["softwood"], timber: false, gravel: false, clear: 0.03,
    metal: { role: "dark", size: 0.09 },
    bay: (w, h, o) => {
      const body = h - 0.06, n = Math.max(1, Math.round(body / 0.15)), p = body / n;
      // a hairline groove between boards
      const boards = o.low ? [box(0, 0.03, 0, w, body, 0.021, "softwood")]
        : Array.from({ length: n }, (_, i) => box(0, 0.03 + i * p, 0, w, p - 0.004, 0.021, "softwood"));
      // the grooves show a dark backing, not the garden behind
      return [...boards, box(0, 0.03, -0.0125, w, body, 0.003, "dark"), box(0, 0, 0, w, 0.03, 0.04, "dark"), box(0, h - 0.03, 0, w, 0.03, 0.04, "dark")];
    },
  },
  trellis: {
    label: "fence.trellis", height: 1.8, spacing: 1.83, posts: "timber", paint: [T], timber: true, gravel: false, clear: 0.05,
    bay: (w, h, o) => lattice(w, h, o.low),
  },
  picket: {
    // pointed pickets with gaps on two rails: the cottage garden's low white fence
    label: "fence.picket", height: 1.0, spacing: 1.8, posts: "timber", color: "#f1efe9", paint: [T], timber: true, gravel: false, clear: 0.05,
    bay: (w, h, o) => {
      const out = [box(0, 0.15, -0.03, w, 0.07, 0.035, T), box(0, Math.max(0.3, h - 0.3), -0.03, w, 0.07, 0.035, T)];
      const { xs } = across(w, o.low ? 0.24 : 0.12);
      for (const x of xs) out.push(box(x, 0, 0.005, 0.07, h - 0.07, 0.018, T), tip(x, h - 0.07, 0.005, 0.07, 0.07, 0.018, T));
      return out;
    },
  },
  post_rail: {
    // rails nailed across the posts' fronts: a field's or a rural garden's edge
    label: "fence.postAndRail", height: 1.1, spacing: 2.4, posts: "timber", paint: [T], timber: true, gravel: false, clear: 0,
    bay: (w, h, o) => {
      const ys = h < 0.9 ? [0.3, h - 0.12] : [0.25, (0.25 + h - 0.12) / 2, h - 0.12];
      return ys.map((y) => box(0, y - 0.045, o.post / 2 + 0.0175, w + o.post, 0.09, 0.035, T));
    },
  },
  railings: {
    // upright bars between two rails, with spear tops
    label: "fence.railings", height: 1.2, spacing: 2.0, posts: "metal", paint: [BM], timber: false, gravel: false, clear: 0,
    metal: { role: BM, size: 0.05 },
    bay: (w, h, o) => {
      const out = [box(0, 0.08, 0, w, 0.04, 0.014, BM), box(0, h - 0.14, 0, w, 0.04, 0.014, BM)];
      for (const x of across(w, o.low ? 0.22 : 0.11).xs) out.push(box(x, 0.02, 0, 0.016, h - 0.08, 0.016, BM), tip(x, h - 0.06, 0, 0.032, 0.06, 0.032, BM));
      return out;
    },
  },
  estate: {
    // flat bars run across thin posts: the countryside's iron fence
    label: "fence.estate", height: 1.2, spacing: 1.8, posts: "metal", paint: [BM], timber: false, gravel: false, clear: 0,
    metal: { role: BM, size: 0.035 },
    bay: (w, h, o) => {
      const n = h > 1 ? 5 : 4;
      return Array.from({ length: n }, (_, i) => box(0, 0.1 + ((h - 0.16) * i) / (n - 1), o.post / 2 + 0.006, w + o.post, 0.045, 0.012, BM));
    },
  },
  palisade: {
    // steel pales with triple points on rails behind: a security fence
    label: "fence.palisade", height: 2.1, spacing: 2.75, posts: "metal", paint: ["metal"], timber: false, gravel: false, clear: 0.05,
    metal: { role: "metal", size: 0.1 },
    bay: (w, h, o) => {
      const out = [box(0, 0.3, -0.03, w + o.post, 0.05, 0.05, "metal"), box(0, h - 0.45, -0.03, w + o.post, 0.05, 0.05, "metal")];
      for (const x of across(w, o.low ? 0.34 : 0.17).xs) {
        out.push(box(x, 0, 0, 0.065, h - 0.1, 0.01, "metal"), tip(x, h - 0.1, 0, 0.026, 0.1, 0.01, "metal"));
        out.push(tip(x - 0.022, h - 0.1, 0, 0.022, 0.06, 0.01, "metal"), tip(x + 0.022, h - 0.1, 0, 0.022, 0.06, 0.01, "metal"));
      }
      return out;
    },
  },
  balustrade: {
    // square spindles between a base rail and a handrail: a deck's or a raised patio's edge
    label: "fence.spindles", height: 1.0, spacing: 1.5, posts: "timber", paint: [T], timber: true, gravel: false, clear: 0,
    bay: (w, h, o) => {
      const out = [box(0, 0.05, 0, w + o.post, 0.07, 0.07, T), box(0, h - 0.07, 0, w + o.post, 0.07, 0.09, T)];
      for (const x of across(w, o.low ? 0.24 : 0.12).xs) out.push(box(x, 0.12, 0, 0.036, h - 0.19, 0.036, T));
      return out;
    },
  },
  glass: {
    // frameless glass panes held by clamps: round a patio or deck without blocking the view
    label: "fence.glass", height: 1.0, spacing: 1.2, posts: "metal", paint: [], timber: false, gravel: false, clear: 0,
    metal: { role: "metal", size: 0.045 },
    bay: (w, h) => {
      const out = [box(0, 0.05, 0, w - 0.03, h - 0.05, 0.012, "glass")];
      for (const s of [-1, 1]) for (const y of [0.2, h - 0.3]) out.push(box(s * (w / 2 - 0.02), y, 0, 0.04, 0.06, 0.03, "metal"));
      return out;
    },
  },
  brick_wall: {
    // a garden wall of one brick's thickness under a concrete coping, between piers
    label: "fence.brickWall", height: 0.9, spacing: 2.6, posts: "pier", paint: [], timber: false, gravel: false, clear: 0,
    bay: (w, h) => [box(0, 0, 0, w, h - 0.06, 0.215, "brick"), box(0, h - 0.06, 0, w, 0.06, 0.3, "concrete")],
  },
};

/** The styles in the order the editor shows them. */
export const FENCE_ORDER = Object.keys(FENCE_STYLES) as FenceStyle[];

/** Colour swatches for fences: [name, colour]. */
export const FENCE_SWATCHES: Swatch[] = [
  ["colour.goldenBrown", "#c9965d"], ["colour.redCedar", "#8b5a3c"], ["colour.darkOak", "#5a4030"], ["colour.greenTreated", "#7a7444"],
  ["colour.forestGreen", "#3b5a46"], ["colour.sage", "#8f9a84"], ["colour.stone", "#c9c3b4"], ["colour.white", "#f1efe9"],
  ["colour.anthracite", "#4a4d52"], ["colour.black", "#2b2c2e"],
];

export function fenceStyle(style: string | null | undefined): FenceStyleDef {
  return FENCE_STYLES[style as FenceStyle] ?? FENCE_STYLES.closeboard;
}

/** What the fence's posts are. */
function postOf(f: Fence, def: FenceStyleDef): { kind: FencePost; size: number; extra: number } {
  const kind = f.posts ?? def.posts;
  if (kind === "concrete") return { kind, size: 0.1, extra: 0.05 };
  if (kind === "metal") return { kind, size: def.metal?.size ?? 0.06, extra: 0.02 };
  if (kind === "pier") return { kind, size: 0.33, extra: 0.1 };
  return { kind, size: 0.09, extra: 0.05 };
}

function postParts(kind: FencePost, size: number, top: number, metal: Role): Part[] {
  if (kind === "concrete") return [box(0, 0, 0, size, top, size, "concrete"), { shape: "prism", x: 0, y: top, z: 0, w: size, h: 0.025, d: size, role: "concrete" }];
  if (kind === "metal") return [box(0, 0, 0, size, top, size, metal), box(0, top, 0, size + 0.012, 0.01, size + 0.012, metal)];
  if (kind === "pier") return [box(0, 0, 0, size, top, size, "brick"), box(0, top, 0, size + 0.07, 0.06, size + 0.07, "concrete")];
  return [box(0, 0, 0, size, top, size, T), box(0, top, 0, size + 0.02, 0.022, size + 0.02, T)];
}

/** One gate leaf w wide and h high, with its infill in the fence's style and a handle at the +x side. */
function leaf(def: FenceStyleDef, w: number, h: number, low: boolean): Part[] {
  // a wall or glass gets a railing gate; timber gates hang their boards on ledges and a brace behind
  const infill = def === FENCE_STYLES.brick_wall || def === FENCE_STYLES.glass ? FENCE_STYLES.railings : def;
  const metal = !infill.timber && infill !== FENCE_STYLES.composite;
  const role: Role = metal ? infill.paint[0] ?? BM : infill === FENCE_STYLES.composite ? "dark" : T;
  const fw = 0.04;
  const out: Part[] = infill.bay(w - (metal ? 2 * fw : 0), h - (metal ? 2 * fw : 0), { low, post: 0 }).map((p) => (metal ? { ...p, y: p.y + fw } : p));
  if (metal || infill === FENCE_STYLES.composite) {
    out.push(box(0, 0, 0, w, fw, 0.03, role), box(0, h - fw, 0, w, fw, 0.03, role), box(-w / 2 + fw / 2, fw, 0, fw, h - 2 * fw, 0.03, role), box(w / 2 - fw / 2, fw, 0, fw, h - 2 * fw, 0.03, role));
  } else {
    const y0 = h * 0.15, y1 = h * 0.8;
    out.push(box(0, y0, -0.07, w - 0.03, 0.09, 0.022, T), box(0, y1, -0.07, w - 0.03, 0.09, 0.022, T));
    out.push({ shape: "cyl", x: -w / 2 + 0.08, y: y0 + 0.09, z: -0.07, w: 0.07, h: y1 - y0 - 0.09, d: 0.022, role: T, seg: 4, lean: [w - 0.16, 0] });
  }
  out.push(box(w / 2 - 0.08, h * 0.55, metal ? 0.03 : 0.045, 0.025, 0.1, 0.02, "dark"));
  return out;
}

/** A piece of a fence: a bay, a post or a gate, placed like a piece of furniture. */
export interface FencePiece {
  item: Furniture;
  parts: Part[];
}

/** The total length of a fence's line. */
export function fenceLength(f: Fence): number {
  let l = 0;
  for (let i = 1; i < f.points.length; i++) l += Math.hypot(f.points[i][0] - f.points[i - 1][0], f.points[i][1] - f.points[i - 1][1]);
  return l;
}

/** Where along the fence (m from its start) a point lies nearest, and that point on the line. */
export function fenceAt(f: Fence, p: Vec2): { at: number; point: Vec2; d: number } {
  let best = { at: 0, point: f.points[0], d: Infinity };
  let s = 0;
  for (let i = 1; i < f.points.length; i++) {
    const a = f.points[i - 1], b = f.points[i];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (l < 1e-6) continue;
    const t = Math.max(0, Math.min(l, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l));
    const q: Vec2 = [a[0] + ((b[0] - a[0]) * t) / l, a[1] + ((b[1] - a[1]) * t) / l];
    const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (d < best.d) best = { at: s + t, point: q, d };
    s += l;
  }
  return best;
}

/**
 * The fence as pieces: along each straight run, posts at its ends and no more than the spacing
 * apart, a bay between each pair (on its gravel board, under its topper), and gates where they are,
 * each between two stouter posts. A corner's post is built once.
 */
export function fencePieces(f: Fence, low: boolean): FencePiece[] {
  const def = fenceStyle(f.style);
  const height = Math.max(0.3, Math.min(3, f.height || def.height));
  const post = postOf(f, def);
  const spacing = Math.max(0.6, Math.min(6, f.spacing || def.spacing));
  const gravel = def.timber && (f.gravel_board ?? def.gravel);
  const base = gravel ? 0.15 : def.clear;
  const topper = def.timber && f.topper === "trellis" && def !== FENCE_STYLES.trellis ? 0.3 : 0;
  const top = height + topper + post.extra;
  const metal = def.metal?.role ?? BM;
  const color = f.color ?? def.color ?? null;
  const gates = (f.gates ?? []).map((g) => ({ g, a: g.at - g.width / 2, b: g.at + g.width / 2 })).sort((x, y) => x.a - y.a);
  const out: FencePiece[] = [];
  let s0 = 0;
  for (let i = 1; i < f.points.length; i++) {
    const a = f.points[i - 1], b = f.points[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.05) continue;
    const dir: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    const rotation = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
    const piece = (d: number, w: number, h: number, parts: Part[]) => {
      const t = d - s0;
      out.push({ item: { id: f.id, type: "fence", x: a[0] + dir[0] * t, z: a[1] + dir[1] * t, rotation, w, d: 0.1, h, color }, parts });
    };
    // the run without its gates, and the gates in it
    const inRun = gates.filter((x) => x.b > s0 + 0.01 && x.a < s0 + len - 0.01).map((x) => ({ ...x, a: Math.max(x.a, s0), b: Math.min(x.b, s0 + len) }));
    const spans: [number, number][] = [];
    let cur = s0;
    for (const x of inRun) {
      if (x.a > cur + 0.01) spans.push([cur, x.a]);
      cur = Math.max(cur, x.b);
    }
    if (s0 + len > cur + 0.01) spans.push([cur, s0 + len]);
    const posts = new Map<number, boolean>();
    const addPost = (d: number, gate: boolean) => {
      const k = Math.round(d * 1000) / 1000;
      posts.set(k, (posts.get(k) ?? false) || gate);
    };
    for (const [ra, rb] of spans) {
      const n = Math.max(1, Math.ceil((rb - ra) / spacing - 0.01));
      const step = (rb - ra) / n;
      for (let k = 0; k <= n; k++) addPost(ra + k * step, false);
      const w = step - post.size;
      if (w < 0.05) continue;
      for (let k = 0; k < n; k++) {
        const parts = def.bay(w, height - base, { low, post: post.size }).map((p) => ({ ...p, y: p.y + base }));
        if (gravel) parts.push(box(0, 0, 0.01, w, 0.15, 0.05, "concrete"));
        if (topper) parts.push(...lattice(w, topper, low).map((p) => ({ ...p, y: p.y + height })));
        piece(ra + (k + 0.5) * step, w, top, parts);
      }
    }
    for (const x of inRun) {
      addPost(x.a, true);
      addPost(x.b, true);
      const gp = post.size * 1.3;
      const w = x.b - x.a - gp - 0.02;
      if (w < 0.2) continue;
      const h = height - 0.05;
      const leaves = x.g.double ? 2 : 1;
      const lw = (w - (leaves - 1) * 0.01) / leaves;
      for (let k = 0; k < leaves; k++) {
        // the second leaf of a pair is turned round, so both handles meet in the middle
        const parts = leaf(def, lw, h, low).map((p) => (k === 1 ? { ...p, x: -p.x, lean: p.lean ? [-p.lean[0], p.lean[1]] as [number, number] : undefined } : p)).map((p) => ({ ...p, y: p.y + 0.05 }));
        piece(x.a + gp / 2 + 0.01 + lw * (k + 0.5) + k * 0.01, lw, h, parts);
      }
    }
    for (const [d, gate] of posts) {
      // a corner's post was built with the run before
      if (i > 1 && Math.abs(d - s0) < 0.002) continue;
      const size = gate ? post.size * 1.3 : post.size;
      piece(d, size, top, postParts(post.kind, size, top, metal));
    }
    s0 += len;
  }
  return out;
}

/** The roles a picked colour paints on a fence. */
export function fencePaint(f: Fence): Set<Role> {
  return new Set(fenceStyle(f.style).paint);
}
