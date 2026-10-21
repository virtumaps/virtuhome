// What garden areas are laid with: patio paving in the popular materials (Indian sandstone,
// porcelain, slate, granite, block paving, setts, crazy paving, resin...) and patterns (random,
// grid, staggered, herringbone, basketweave), slab sizes, colours and joints; and deck boards
// (softwood, cedar, hardwood, composite). The model look draws each area in its colour; the
// realistic look draws its texture (scene/paving-tex.ts), keyed by everything that shows.
import type { OutdoorArea, Vec2 } from "../model/plan";
import type { PlainKey } from "../i18n";
import type { Swatch } from "./finishes";

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
  /** Its name, in the table (src/i18n). */
  label: PlainKey;
  /** Patterns it is laid in, its usual first. */
  patterns: PavingPattern[];
  /** Unit sizes in mm (length x width), its usual first; none for seamless and crazy paving. */
  sizes: string[];
  /** Named colours, its usual first: [name, colour, how much the units' hues vary (0..1)]. */
  colors: [PlainKey, string, number][];
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
    label: "paving.indianSandstone", patterns: ["random", "stretcher", "grid"], sizes: ["600x600", "900x600", "600x290"], surface: "riven",
    colors: [["colour.kandlaGrey", "#8f8b85", 0.3], ["colour.rajGreen", "#8e8c70", 0.85], ["colour.autumnBrown", "#a27d5c", 1], ["colour.ripponBuff", "#c6aa82", 0.6], ["colour.camelDust", "#c4ae8d", 0.4], ["colour.fossilMint", "#c3b6a0", 0.55]],
    joint: 12, jointColor: JOINT.grey, module: 300, vary: 0.16, roughness: 0.85, relief: 0.9,
  },
  porcelain: {
    label: "paving.porcelain", patterns: ["grid", "stretcher", "third", "random"], sizes: ["600x600", "900x600", "1200x600", "800x800", "1200x300"], surface: "smooth",
    colors: [["colour.lightGrey", "#bdbcb7", 0], ["colour.midGrey", "#8f8e8a", 0], ["colour.anthracite", "#4c4d4f", 0], ["colour.ivory", "#dad3c4", 0], ["colour.sand", "#c3b59c", 0], ["colour.silver", "#a9aaa7", 0], ["colour.black", "#2f3032", 0]],
    joint: 4, jointColor: JOINT.grey, module: 300, vary: 0.04, roughness: 0.55, relief: 0.15,
  },
  concrete: {
    label: "paving.concreteSlabs", patterns: ["grid", "stretcher", "random"], sizes: ["600x600", "450x450", "600x300"], surface: "textured",
    colors: [["colour.natural", "#b4b0a7", 0], ["colour.buff", "#c9b590", 0.2], ["colour.charcoal", "#5d5d5d", 0], ["colour.silver", "#bab9b4", 0], ["colour.red", "#9c6253", 0.1]],
    joint: 8, jointColor: JOINT.grey, module: 300, vary: 0.06, roughness: 0.9, relief: 0.35,
  },
  slate: {
    label: "paving.slate", patterns: ["random", "grid", "stretcher"], sizes: ["600x600", "900x600", "600x300"], surface: "cleft",
    colors: [["colour.black", "#33363a", 0.1], ["colour.blueBlack", "#3a4048", 0.15], ["colour.grey", "#5e6369", 0.2], ["colour.rustic", "#5a5450", 0.9]],
    joint: 6, jointColor: JOINT.charcoal, module: 300, vary: 0.1, roughness: 0.6, relief: 0.7,
  },
  granite: {
    label: "paving.granite", patterns: ["grid", "stretcher", "random"], sizes: ["600x600", "900x600", "600x300"], surface: "flamed",
    colors: [["colour.silverGrey", "#a5a5a3", 0], ["colour.darkGrey", "#6c6d6f", 0], ["colour.black", "#2c2d2f", 0], ["colour.golden", "#c2a67b", 0.3]],
    joint: 6, jointColor: JOINT.grey, module: 300, vary: 0.05, roughness: 0.75, relief: 0.4,
  },
  limestone: {
    label: "paving.limestone", patterns: ["random", "grid", "stretcher"], sizes: ["600x600", "900x600"], surface: "honed",
    colors: [["colour.kotaBlue", "#5f6b70", 0.25], ["colour.kotaBrown", "#7d6b59", 0.3], ["colour.black", "#323436", 0.1], ["colour.juraBeige", "#cfc4ae", 0.2]],
    joint: 8, jointColor: JOINT.grey, module: 300, vary: 0.1, roughness: 0.6, relief: 0.3,
  },
  travertine: {
    label: "paving.travertine", patterns: ["random", "grid", "stretcher"], sizes: ["600x400", "600x600"], surface: "tumbled",
    colors: [["colour.classic", "#d5c3a3", 0.35], ["colour.ivory", "#e2d8c4", 0.25], ["colour.silver", "#c3beb5", 0.2], ["colour.noce", "#a98b6b", 0.45]],
    joint: 3, jointColor: JOINT.light, module: 200, vary: 0.1, roughness: 0.7, relief: 0.45,
  },
  block: {
    label: "paving.blockPaving", patterns: ["herringbone", "stretcher", "basketweave", "grid"], sizes: ["200x100"], surface: "block",
    colors: [["colour.brindle", "#8d624f", 0.9], ["colour.charcoal", "#525254", 0.1], ["colour.natural", "#9f9d98", 0.1], ["colour.red", "#9b4c3e", 0.2], ["colour.buff", "#c3a374", 0.3], ["colour.burntOchre", "#a9764c", 0.5]],
    joint: 3, jointColor: JOINT.sand, vary: 0.12, roughness: 0.85, relief: 0.7,
  },
  brick: {
    label: "paving.clayPavers", patterns: ["herringbone", "basketweave", "stretcher"], sizes: ["200x100"], surface: "clay",
    colors: [["colour.red", "#a3553f", 0.3], ["colour.multi", "#8f5b46", 0.9], ["colour.staffordshireBlue", "#3f4046", 0.2], ["colour.buff", "#caa97a", 0.35]],
    joint: 4, jointColor: JOINT.sand, vary: 0.14, roughness: 0.85, relief: 0.75,
  },
  setts: {
    label: "paving.graniteSetts", patterns: ["stretcher", "grid"], sizes: ["100x100", "200x100"], surface: "sett",
    colors: [["colour.silverGrey", "#9e9e9c", 0.1], ["colour.darkGrey", "#606164", 0.1], ["colour.mixed", "#a9a08c", 0.8], ["colour.black", "#3b3c3e", 0.05]],
    joint: 10, jointColor: JOINT.grey, vary: 0.12, roughness: 0.85, relief: 1,
  },
  crazy: {
    label: "paving.crazyPaving", patterns: ["crazy"], sizes: [], surface: "riven",
    colors: [["colour.buff", "#c4a983", 0.6], ["colour.grey", "#9a9690", 0.3], ["colour.multi", "#a38c71", 1], ["colour.yorkStone", "#b3a58b", 0.4]],
    joint: 16, jointColor: JOINT.grey, vary: 0.16, roughness: 0.85, relief: 0.9,
  },
  resin: {
    label: "paving.resinBound", patterns: ["plain"], sizes: [], surface: "aggregate",
    colors: [["colour.golden", "#c3a167", 0], ["colour.barley", "#cab68b", 0], ["colour.silverGrey", "#a9a8a4", 0], ["colour.bronze", "#90704d", 0], ["colour.charcoal", "#4e4e50", 0], ["colour.cream", "#d9ceb5", 0]],
    joint: 0, jointColor: JOINT.grey, vary: 0, roughness: 0.6, relief: 0.6,
  },
  tarmac: {
    label: "paving.tarmac", patterns: ["plain"], sizes: [], surface: "tarmac",
    colors: [["colour.black", "#45474b", 0], ["colour.red", "#7e4239", 0]],
    joint: 0, jointColor: JOINT.grey, vary: 0, roughness: 0.85, relief: 0.35,
  },
  gravel: {
    label: "paving.gravel", patterns: ["plain"], sizes: [], surface: "gravel",
    colors: [["colour.cotswold", "#cbb58e", 0], ["colour.peaShingle", "#b4a284", 0], ["colour.goldenFlint", "#b8925e", 0], ["colour.slateChippings", "#525961", 0], ["colour.white", "#e6e4df", 0], ["colour.greyGranite", "#9b9b99", 0]],
    joint: 0, jointColor: JOINT.grey, vary: 0, roughness: 0.9, relief: 0.9,
  },
};

/** The materials in the order the editor shows them. */
export const PAVING_ORDER = Object.keys(PAVING) as PavingMaterial[];

export const PATTERN_NAMES: Record<PavingPattern, PlainKey> = {
  random: "pattern.random", grid: "pattern.grid", stretcher: "pattern.stretcher", third: "pattern.third", herringbone: "pattern.herringbone",
  basketweave: "pattern.basketweave", crazy: "pattern.crazy", plain: "pattern.plain",
};

/** Joint colours offered: [name, colour]. */
export const JOINT_SWATCHES: Swatch[] = [["colour.light", JOINT.light], ["colour.grey", JOINT.grey], ["colour.charcoal", JOINT.charcoal], ["colour.buff", JOINT.buff], ["colour.sand", JOINT.sand]];

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
  /** Its name, in the table (src/i18n). */
  label: PlainKey;
  colors: Swatch[];
  /** Board widths (mm), the usual first. */
  widths: number[];
  roughness: number;
}

export const DECK_BOARDS: Record<DeckBoard, DeckBoardDef> = {
  softwood: {
    label: "deck.softwood", widths: [120, 145, 95], roughness: 0.75,
    colors: [["colour.brownTreated", "#9c7752"], ["colour.golden", "#c49b64"], ["colour.greenTreated", "#9f9768"], ["colour.weathered", "#9c968b"], ["colour.darkOakStain", "#5f4632"], ["colour.greyStain", "#8e8b86"], ["colour.blackStain", "#38363a"]],
  },
  cedar: { label: "deck.cedar", widths: [140, 95], roughness: 0.7, colors: [["colour.natural", "#b5764e"], ["colour.weathered", "#a59b8e"]] },
  hardwood: { label: "deck.hardwood", widths: [145, 90], roughness: 0.55, colors: [["colour.ipe", "#7a5238"], ["colour.iroko", "#9c6c40"], ["colour.balau", "#8a5e3f"]] },
  composite: {
    label: "deck.composite", widths: [145, 140], roughness: 0.6,
    colors: [["colour.grey", "#8e8b87"], ["colour.charcoal", "#4c4b4a"], ["colour.walnut", "#6b5141"], ["colour.oak", "#a17e5b"], ["colour.teak", "#9b6f48"], ["colour.silver", "#b4b1ab"], ["colour.black", "#303031"]],
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
export const RAISED_WALLS = { brick: "raisedWall.brick", stone: "raisedWall.stone", render: "raisedWall.render", sleepers: "raisedWall.sleepers" } as const satisfies Record<string, PlainKey>;
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
