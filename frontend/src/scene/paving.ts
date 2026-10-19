// What garden areas are laid with: patio paving in the popular materials (Indian sandstone,
// porcelain, slate, granite, block paving, setts, crazy paving, resin...) and patterns (random,
// grid, staggered, herringbone, basketweave), slab sizes, colours and joints; and deck boards
// (softwood, cedar, hardwood, composite). The model look draws each area in its colour; the
// realistic look draws its texture (scene/paving-tex.ts), keyed by everything that shows.
import type { OutdoorArea, Vec2 } from "../model/plan";

export type PavingMaterial =
  | "sandstone" | "porcelain" | "concrete" | "slate" | "granite" | "limestone" | "travertine"
  | "block" | "brick" | "setts" | "crazy" | "resin" | "tarmac" | "gravel";

/**
 * How the units are laid: a grid; staggered by half or a third of a unit; herringbone or
 * basketweave (units twice as long as wide); mixed sizes at random; crazy paving's broken
 * stones; or seamless (resin, tarmac, gravel).
 */
export type PavingPattern = "random" | "grid" | "stretcher" | "third" | "herringbone" | "basketweave" | "crazy" | "plain";

/** How a unit's face looks (what scene/paving-tex.ts draws). */
export type PavingSurface = "riven" | "smooth" | "textured" | "flamed" | "honed" | "tumbled" | "cleft" | "block" | "clay" | "sett" | "aggregate" | "tarmac" | "gravel";

export interface PavingDef {
  name: string;
  /** Patterns it is laid in, its usual first. */
  patterns: PavingPattern[];
  /** Unit sizes in mm (length x width), its usual first; none for seamless and crazy paving. */
  sizes: string[];
  /** Named colours, its usual first: [name, colour, how much the units' hues vary (0..1)]. */
  colors: [string, string, number][];
  surface: PavingSurface;
  /** Joint width (mm) and the usual joint colour. */
  joint: number;
  jointColor: string;
  /** Mixed sizes (the random pattern): the module (mm) the sizes are multiples of. */
  module?: number;
  /** How much units differ in tone (0..1). */
  vary: number;
  roughness: number;
  /** How much the surface's relief shows. */
  relief: number;
}

const JOINT = { light: "#cdc7bb", grey: "#8a8781", charcoal: "#4a4a4b", buff: "#b49e7a", sand: "#b9a98a" };

export const PAVING: Record<PavingMaterial, PavingDef> = {
  sandstone: {
    name: "Indian sandstone", patterns: ["random", "stretcher", "grid"], sizes: ["600x600", "900x600", "600x290"], surface: "riven",
    colors: [["Kandla grey", "#8f8b85", 0.3], ["Raj green", "#8e8c70", 0.85], ["Autumn brown", "#a27d5c", 1], ["Rippon buff", "#c6aa82", 0.6], ["Camel dust", "#c4ae8d", 0.4], ["Fossil mint", "#c3b6a0", 0.55]],
    joint: 12, jointColor: JOINT.grey, module: 300, vary: 0.16, roughness: 0.85, relief: 0.9,
  },
  porcelain: {
    name: "Porcelain", patterns: ["grid", "stretcher", "third", "random"], sizes: ["600x600", "900x600", "1200x600", "800x800", "1200x300"], surface: "smooth",
    colors: [["Light grey", "#bdbcb7", 0], ["Mid grey", "#8f8e8a", 0], ["Anthracite", "#4c4d4f", 0], ["Ivory", "#dad3c4", 0], ["Sand", "#c3b59c", 0], ["Silver", "#a9aaa7", 0], ["Black", "#2f3032", 0]],
    joint: 4, jointColor: JOINT.grey, module: 300, vary: 0.04, roughness: 0.55, relief: 0.15,
  },
  concrete: {
    name: "Concrete slabs", patterns: ["grid", "stretcher", "random"], sizes: ["600x600", "450x450", "600x300"], surface: "textured",
    colors: [["Natural", "#b4b0a7", 0], ["Buff", "#c9b590", 0.2], ["Charcoal", "#5d5d5d", 0], ["Silver", "#bab9b4", 0], ["Red", "#9c6253", 0.1]],
    joint: 8, jointColor: JOINT.grey, module: 300, vary: 0.06, roughness: 0.9, relief: 0.35,
  },
  slate: {
    name: "Slate", patterns: ["random", "grid", "stretcher"], sizes: ["600x600", "900x600", "600x300"], surface: "cleft",
    colors: [["Black", "#33363a", 0.1], ["Blue black", "#3a4048", 0.15], ["Grey", "#5e6369", 0.2], ["Rustic", "#5a5450", 0.9]],
    joint: 6, jointColor: JOINT.charcoal, module: 300, vary: 0.1, roughness: 0.6, relief: 0.7,
  },
  granite: {
    name: "Granite", patterns: ["grid", "stretcher", "random"], sizes: ["600x600", "900x600", "600x300"], surface: "flamed",
    colors: [["Silver grey", "#a5a5a3", 0], ["Dark grey", "#6c6d6f", 0], ["Black", "#2c2d2f", 0], ["Golden", "#c2a67b", 0.3]],
    joint: 6, jointColor: JOINT.grey, module: 300, vary: 0.05, roughness: 0.75, relief: 0.4,
  },
  limestone: {
    name: "Limestone", patterns: ["random", "grid", "stretcher"], sizes: ["600x600", "900x600"], surface: "honed",
    colors: [["Kota blue", "#5f6b70", 0.25], ["Kota brown", "#7d6b59", 0.3], ["Black", "#323436", 0.1], ["Jura beige", "#cfc4ae", 0.2]],
    joint: 8, jointColor: JOINT.grey, module: 300, vary: 0.1, roughness: 0.6, relief: 0.3,
  },
  travertine: {
    name: "Travertine", patterns: ["random", "grid", "stretcher"], sizes: ["600x400", "600x600"], surface: "tumbled",
    colors: [["Classic", "#d5c3a3", 0.35], ["Ivory", "#e2d8c4", 0.25], ["Silver", "#c3beb5", 0.2], ["Noce", "#a98b6b", 0.45]],
    joint: 3, jointColor: JOINT.light, module: 200, vary: 0.1, roughness: 0.7, relief: 0.45,
  },
  block: {
    name: "Block paving", patterns: ["herringbone", "stretcher", "basketweave", "grid"], sizes: ["200x100"], surface: "block",
    colors: [["Brindle", "#8d624f", 0.9], ["Charcoal", "#525254", 0.1], ["Natural", "#9f9d98", 0.1], ["Red", "#9b4c3e", 0.2], ["Buff", "#c3a374", 0.3], ["Burnt ochre", "#a9764c", 0.5]],
    joint: 3, jointColor: JOINT.sand, vary: 0.12, roughness: 0.85, relief: 0.7,
  },
  brick: {
    name: "Clay pavers", patterns: ["herringbone", "basketweave", "stretcher"], sizes: ["200x100"], surface: "clay",
    colors: [["Red", "#a3553f", 0.3], ["Multi", "#8f5b46", 0.9], ["Staffordshire blue", "#3f4046", 0.2], ["Buff", "#caa97a", 0.35]],
    joint: 4, jointColor: JOINT.sand, vary: 0.14, roughness: 0.85, relief: 0.75,
  },
  setts: {
    name: "Granite setts", patterns: ["stretcher", "grid"], sizes: ["100x100", "200x100"], surface: "sett",
    colors: [["Silver grey", "#9e9e9c", 0.1], ["Dark grey", "#606164", 0.1], ["Mixed", "#a9a08c", 0.8], ["Black", "#3b3c3e", 0.05]],
    joint: 10, jointColor: JOINT.grey, vary: 0.12, roughness: 0.85, relief: 1,
  },
  crazy: {
    name: "Crazy paving", patterns: ["crazy"], sizes: [], surface: "riven",
    colors: [["Buff", "#c4a983", 0.6], ["Grey", "#9a9690", 0.3], ["Multi", "#a38c71", 1], ["York stone", "#b3a58b", 0.4]],
    joint: 16, jointColor: JOINT.grey, vary: 0.16, roughness: 0.85, relief: 0.9,
  },
  resin: {
    name: "Resin bound", patterns: ["plain"], sizes: [], surface: "aggregate",
    colors: [["Golden", "#c3a167", 0], ["Barley", "#cab68b", 0], ["Silver grey", "#a9a8a4", 0], ["Bronze", "#90704d", 0], ["Charcoal", "#4e4e50", 0], ["Cream", "#d9ceb5", 0]],
    joint: 0, jointColor: JOINT.grey, vary: 0, roughness: 0.6, relief: 0.6,
  },
  tarmac: {
    name: "Tarmac", patterns: ["plain"], sizes: [], surface: "tarmac",
    colors: [["Black", "#45474b", 0], ["Red", "#7e4239", 0]],
    joint: 0, jointColor: JOINT.grey, vary: 0, roughness: 0.85, relief: 0.35,
  },
  gravel: {
    name: "Gravel", patterns: ["plain"], sizes: [], surface: "gravel",
    colors: [["Cotswold", "#cbb58e", 0], ["Pea shingle", "#b4a284", 0], ["Golden flint", "#b8925e", 0], ["Slate chippings", "#525961", 0], ["White", "#e6e4df", 0], ["Grey granite", "#9b9b99", 0]],
    joint: 0, jointColor: JOINT.grey, vary: 0, roughness: 0.9, relief: 0.9,
  },
};

/** The materials in the order the editor shows them. */
export const PAVING_ORDER = Object.keys(PAVING) as PavingMaterial[];

export const PATTERN_NAMES: Record<PavingPattern, string> = {
  random: "Random", grid: "Grid", stretcher: "Staggered", third: "Third offset", herringbone: "Herringbone",
  basketweave: "Basketweave", crazy: "Crazy", plain: "Seamless",
};

/** Joint colours offered: [name, colour]. */
export const JOINT_SWATCHES: [string, string][] = [["Light", JOINT.light], ["Grey", JOINT.grey], ["Charcoal", JOINT.charcoal], ["Buff", JOINT.buff], ["Sand", JOINT.sand]];

/** Units that can edge a patio, a course wide. */
export const BORDER_MATERIALS: PavingMaterial[] = ["setts", "block", "brick", "porcelain", "sandstone"];

/** The units a border is laid with, along the edge. */
export const BORDER_UNITS: Partial<Record<PavingMaterial, string>> = {
  setts: "100x100", block: "200x100", brick: "200x100", porcelain: "1200x300", sandstone: "600x290",
};

/** What a garden area of each kind is laid with unless picked. */
export const KIND_PAVING: Partial<Record<OutdoorArea["kind"], { material: PavingMaterial; pattern?: PavingPattern; color?: string }>> = {
  patio: { material: "sandstone" },
  path: { material: "block", pattern: "stretcher", color: "#9f9d98" },
  driveway: { material: "block" },
  gravel: { material: "gravel" },
};

/** The garden areas that are paved (and take a paving material). */
export function isPaved(o: OutdoorArea): boolean {
  return o.kind in KIND_PAVING;
}

/** A paving or deck surface, everything about it that shows. */
export interface PavingLook {
  material: PavingMaterial;
  pattern: PavingPattern;
  /** Unit length and width (mm); for the random pattern, the module. */
  unit: [number, number];
  color: string;
  /** How much the units' hues vary (0..1). */
  mix: number;
  joint: string;
}

function parseUnit(s: string | null | undefined): [number, number] | null {
  const m = /^(\d{2,4})x(\d{2,4})$/.exec(s ?? "");
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2]);
  return a >= b ? [a, b] : [b, a];
}

const isHex = (s: string | null | undefined): s is string => !!s && /^#[0-9a-f]{6}$/i.test(s);

/** A paving material's look with these choices (anything unset or unknown takes its usual). */
export function pavingLook(material: string | null | undefined, choice: { pattern?: string | null; unit?: string | null; color?: string | null; joint?: string | null } = {}): PavingLook {
  const m: PavingMaterial = material && material in PAVING ? (material as PavingMaterial) : "sandstone";
  const def = PAVING[m];
  const pattern = def.patterns.includes(choice.pattern as PavingPattern) ? (choice.pattern as PavingPattern) : def.patterns[0];
  const size = def.sizes.includes(choice.unit ?? "") ? choice.unit! : def.sizes[0];
  const unit: [number, number] = pattern === "random" ? [def.module ?? 300, def.module ?? 300] : parseUnit(size) ?? [600, 600];
  const color = isHex(choice.color) ? choice.color.toLowerCase() : def.colors[0][1];
  const named = def.colors.find(([, c]) => c === color);
  return { material: m, pattern, unit, color, mix: named ? named[2] : def.colors[0][2] * 0.5, joint: isHex(choice.joint) ? choice.joint.toLowerCase() : def.jointColor };
}

/** A paved garden area's look. */
export function areaPaving(o: OutdoorArea): PavingLook {
  const usual = KIND_PAVING[o.kind] ?? KIND_PAVING.patio!;
  // a driveway set to asphalt before materials could be picked; gravel is always gravel, and only gravel is
  const material = o.kind === "gravel" ? "gravel"
    : o.paving && o.paving !== "gravel" ? o.paving
    : o.kind === "driveway" && o.surface === "asphalt" ? "tarmac" : usual.material;
  const same = material === usual.material;
  return pavingLook(material, {
    pattern: o.pattern ?? (same ? usual.pattern : null),
    unit: o.unit,
    color: o.color ?? (same ? usual.color : null),
    joint: o.joint,
  });
}

/** The surface key ("pave:<material>.<pattern>.<L>x<W>.<colour>.<joint>.<mix>") the realistic look textures. */
export function pavingKey(p: PavingLook): string {
  return `pave:${p.material}.${p.pattern}.${p.unit[0]}x${p.unit[1]}.${p.color.slice(1)}.${p.joint.slice(1)}.${Math.round(p.mix * 100)}`;
}

export function parsePavingKey(name: string): PavingLook | null {
  const [material, pattern, unit, color, joint, mix] = name.split(".");
  if (!(material in PAVING)) return null;
  const u = parseUnit(unit);
  return { material: material as PavingMaterial, pattern: pattern as PavingPattern, unit: u ?? [600, 600], color: `#${color}`, joint: `#${joint}`, mix: Number(mix) / 100 || 0 };
}

// -------------------------------------------------------------------------------- decks

export type DeckBoard = "softwood" | "cedar" | "hardwood" | "composite";

export interface DeckBoardDef {
  name: string;
  colors: [string, string][];
  /** Board widths (mm), the usual first. */
  widths: number[];
  roughness: number;
}

export const DECK_BOARDS: Record<DeckBoard, DeckBoardDef> = {
  softwood: {
    name: "Softwood", widths: [120, 145, 95], roughness: 0.75,
    colors: [["Brown treated", "#9c7752"], ["Golden", "#c49b64"], ["Green treated", "#9f9768"], ["Weathered", "#9c968b"], ["Dark oak stain", "#5f4632"], ["Grey stain", "#8e8b86"], ["Black stain", "#38363a"]],
  },
  cedar: { name: "Cedar", widths: [140, 95], roughness: 0.7, colors: [["Natural", "#b5764e"], ["Weathered", "#a59b8e"]] },
  hardwood: { name: "Hardwood", widths: [145, 90], roughness: 0.55, colors: [["Ipe", "#7a5238"], ["Iroko", "#9c6c40"], ["Balau", "#8a5e3f"]] },
  composite: {
    name: "Composite", widths: [145, 140], roughness: 0.6,
    colors: [["Grey", "#8e8b87"], ["Charcoal", "#4c4b4a"], ["Walnut", "#6b5141"], ["Oak", "#a17e5b"], ["Teak", "#9b6f48"], ["Silver", "#b4b1ab"], ["Black", "#303031"]],
  },
};

export const DECK_ORDER = Object.keys(DECK_BOARDS) as DeckBoard[];

export interface DeckLook {
  boards: DeckBoard;
  color: string;
  width: number;
}

export function deckLook(o: Pick<OutdoorArea, "boards" | "color" | "board_width">): DeckLook {
  const boards: DeckBoard = o.boards && o.boards in DECK_BOARDS ? o.boards : "softwood";
  const def = DECK_BOARDS[boards];
  const width = o.board_width && o.board_width >= 60 && o.board_width <= 300 ? Math.round(o.board_width) : def.widths[0];
  return { boards, color: isHex(o.color) ? o.color.toLowerCase() : def.colors[0][1], width };
}

/** The surface key ("deck:<boards>.<colour>.<width>") of a deck's boards. */
export function deckKey(d: DeckLook): string {
  return `deck:${d.boards}.${d.color.slice(1)}.${d.width}`;
}

export function parseDeckKey(name: string): DeckLook | null {
  const [boards, color, width] = name.split(".");
  if (!(boards in DECK_BOARDS)) return null;
  return { boards: boards as DeckBoard, color: `#${color}`, width: Number(width) || 120 };
}

// -------------------------------------------------------------------------------- laying out

/** What a raised patio's sides are built of. */
export const RAISED_WALLS = { brick: "Brick", stone: "Stone", render: "Render", sleepers: "Sleepers" } as const;
export type RaisedWall = keyof typeof RAISED_WALLS;

/**
 * Which way an area's pattern or boards run, in degrees clockwise on the plan: along its longest
 * edge, turned by its `angle`.
 */
export function layingAngle(o: Pick<OutdoorArea, "points" | "angle">): number {
  let best = 0, len = -1;
  o.points.forEach((p, i) => {
    const q = o.points[(i + 1) % o.points.length];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    // the longest edge, and of edges nearly as long the one nearest the plan's axes
    const a = Math.atan2(q[1] - p[1], q[0] - p[0]);
    const off = Math.abs(Math.sin(2 * a));
    if (l > len + 0.05 || (Math.abs(l - len) <= 0.05 && off < Math.abs(Math.sin(2 * best)))) {
      len = l;
      best = a;
    }
  });
  // folded to -45..45 degrees: a pattern along x reads the same either way
  let deg = (best * 180) / Math.PI;
  deg = ((deg % 90) + 135) % 90 - 45;
  return Math.round((deg + (o.angle ?? 0)) * 100) / 100;
}

/**
 * The texture frame of an area laid at `deg`: u runs along the laying direction, v across it, both
 * counted from the area's corner furthest back along them (so the units start whole at an edge).
 */
export function layingFrame(points: Vec2[], deg: number): { c: number; s: number; ou: number; ov: number } {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  let ou = Infinity, ov = Infinity;
  for (const [x, z] of points) {
    ou = Math.min(ou, x * c + z * s);
    ov = Math.min(ov, -x * s + z * c);
  }
  return { c, s, ou: isFinite(ou) ? ou : 0, ov: isFinite(ov) ? ov : 0 };
}

/** The colour the model look and the 2D plan show an area in, or null for its kind's own. */
export function areaColour(o: OutdoorArea): string | null {
  if (o.kind === "deck") return deckLook(o).color;
  if (isPaved(o)) return areaPaving(o).color;
  return null;
}
