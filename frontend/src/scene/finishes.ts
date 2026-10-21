// Surface finishes a home can be customised with: floors, inside walls, outside walls, upholstery,
// and the joinery of doors and windows.
// Every finish has a plain colour (what the model look draws, and what the editor's swatch shows)
// and a texture recipe for the realistic look (scene/textures.ts draws it).

import type { PlainKey } from "../i18n";

/** A colour offered as a swatch: its name (in the table) and "#rrggbb". */
export type Swatch = [PlainKey, string];

export interface FinishDef {
  /** Its name, in the table (src/i18n). */
  label: PlainKey;
  /** Day colour (sRGB hex). For tintable finishes it is the default tint. */
  color: number;
  /** The colour can be picked (paint, render, cladding, upholstery); the texture only adds detail. */
  tintable: boolean;
  /** Texture recipe (scene/textures.ts). */
  tex: string;
  /** Metres one texture tile covers. */
  scale: number;
  roughness: number;
  metalness?: number;
  /** How much the texture's relief shows (normal map strength). */
  relief?: number;
}

const f = (label: PlainKey, color: number, tex: string, scale: number, roughness: number, tintable = false, relief = 0.6): FinishDef => ({
  label, color, tex, scale, roughness, tintable, relief,
});

export const FLOOR_FINISHES = {
  wood: f("finish.floor.wood", 0xd8b98f, "planks_light", 2.4, 0.55),
  oak: f("finish.floor.oak", 0xc9a275, "planks_oak", 2.4, 0.5),
  walnut: f("finish.floor.walnut", 0x7b5a41, "planks_walnut", 2.4, 0.45),
  grey_wood: f("finish.floor.grey_wood", 0xb3ada5, "planks_grey", 2.4, 0.6),
  herringbone: f("finish.floor.herringbone", 0xc39a6c, "herringbone", 1.12, 0.5),
  tiles: f("finish.floor.tiles", 0xdadbd8, "tiles_light", 1.2, 0.35),
  tiles_dark: f("finish.floor.tiles_dark", 0x5d5f63, "tiles_dark", 1.2, 0.35),
  terracotta: f("finish.floor.terracotta", 0xb86d4b, "tiles_terracotta", 1.2, 0.7),
  marble: f("finish.floor.marble", 0xe8e6e1, "marble", 1.6, 0.18),
  checker: f("finish.floor.checker", 0x9a9a98, "checker", 1.2, 0.35),
  carpet: f("finish.floor.carpet", 0xb9b2a8, "carpet", 1.0, 0.95, true, 0.3),
  stone: f("finish.floor.stone", 0xb7b3ab, "flagstone", 2.0, 0.75),
  concrete: f("finish.floor.concrete", 0xbdbdbd, "concrete", 3.0, 0.8, true, 0.2),
  vinyl: f("finish.floor.vinyl", 0xc8c2b6, "vinyl", 1.2, 0.5, true, 0.1),
} satisfies Record<string, FinishDef>;

export const WALL_FINISHES = {
  paint: f("finish.wall.paint", 0xf4f2ee, "plaster", 2.0, 0.9, true, 0.15),
  wallpaper_stripes: f("finish.wall.wallpaper_stripes", 0xe9e2d4, "wp_stripes", 0.53, 0.85, true, 0.05),
  wallpaper_damask: f("finish.wall.wallpaper_damask", 0xd9cdb6, "wp_damask", 0.53, 0.85, true, 0.08),
  wallpaper_geo: f("finish.wall.wallpaper_geo", 0xd8dcd6, "wp_geo", 0.53, 0.85, true, 0.05),
  wallpaper_leaves: f("finish.wall.wallpaper_leaves", 0xcfd8c6, "wp_leaves", 0.53, 0.85, true, 0.05),
  panelling: f("finish.wall.panelling", 0xe8e6df, "panelling", 2.4, 0.7, true, 0.7),
  tiles: f("finish.wall.tiles", 0xf2f2f0, "tiles_metro", 0.6, 0.25, true, 0.6),
  brick: f("finish.wall.brick", 0xa65d44, "brick_red", 1.35, 0.85, false, 0.9),
  wood: f("finish.wall.wood", 0xb08860, "boards_v", 1.2, 0.6, false, 0.6),
  concrete: f("finish.wall.concrete", 0xb9b9b6, "concrete", 3.0, 0.8, true, 0.25),
} satisfies Record<string, FinishDef>;

export const EXTERIOR_FINISHES = {
  render: f("finish.outside.render", 0xe6dccf, "render", 2.0, 0.9, true, 0.25),
  brick: f("finish.outside.brick", 0xa65d44, "brick_red", 1.35, 0.85, false, 0.9),
  brick_buff: f("finish.outside.brick_buff", 0xc9a979, "brick_buff", 1.35, 0.85, false, 0.9),
  brick_white: f("finish.outside.brick_white", 0xeceae4, "brick_painted", 1.35, 0.8, true, 0.7),
  stone: f("finish.outside.stone", 0xb5ab98, "stone_wall", 2.0, 0.85, false, 1.0),
  composite: f("finish.outside.composite", 0x6f7378, "boards_h", 1.2, 0.55, true, 0.7),
  timber: f("finish.outside.timber", 0xa77b51, "timber_h", 1.2, 0.65, false, 0.7),
  concrete: f("finish.outside.concrete", 0xb4b4b0, "concrete_panels", 3.0, 0.75, true, 0.35),
  pebbledash: f("finish.outside.pebbledash", 0xd9d2c4, "pebbledash", 1.0, 0.95, true, 1.0),
} satisfies Record<string, FinishDef>;

export const UPHOLSTERY = {
  fabric: f("finish.upholstery.fabric", 0x9aa3ad, "weave", 0.3, 0.95, true, 0.3),
  linen: f("finish.upholstery.linen", 0xcfc6b5, "linen", 0.25, 0.92, true, 0.3),
  velvet: f("finish.upholstery.velvet", 0x3f5b56, "velvet", 0.5, 0.75, true, 0.15),
  boucle: f("finish.upholstery.boucle", 0xece6da, "boucle", 0.25, 1.0, true, 0.8),
  leather: f("finish.upholstery.leather", 0x6b4630, "leather", 0.6, 0.45, true, 0.35),
} satisfies Record<string, FinishDef>;

/** Door leaves and window frames. */
export const JOINERY_FINISHES = {
  painted: f("finish.joinery.painted", 0xf1efea, "plaster", 1.0, 0.5, true, 0.05),
  upvc: f("finish.joinery.upvc", 0xf3f2ee, "", 1.0, 0.35, true),
  aluminium: { ...f("finish.joinery.aluminium", 0xa9adb2, "brushed", 0.5, 0.35, true, 0.1), metalness: 0.6 },
  oak: f("finish.joinery.oak", 0xc39a6c, "wood_grain_v", 0.9, 0.5, false, 0.25),
  ash: f("finish.joinery.ash", 0xd9c09a, "wood_grain_v", 0.9, 0.5, false, 0.2),
  walnut: f("finish.joinery.walnut", 0x6e4f38, "wood_grain_v", 0.9, 0.45, false, 0.25),
} satisfies Record<string, FinishDef>;

/** What a roof is covered with: the UK's usual tiles and slates, thatch, and flat roofs' coverings. */
export const ROOF_COVERINGS = {
  concrete_tiles: f("covering.concrete_tiles", 0x6a625c, "roof_interlocking", 1.5, 0.85, true, 0.9),
  clay_plain: f("covering.clay_plain", 0x9a553a, "roof_plain", 1.2, 0.8, true, 0.8),
  slate: f("covering.slate", 0x4b4f58, "roof_slate", 1.5, 0.6, false, 0.7),
  pantiles: f("covering.pantiles", 0xb0603d, "roof_pantile", 1.4, 0.75, true, 1.0),
  thatch: f("covering.thatch", 0xb39a62, "roof_thatch", 2.0, 1.0, false, 1.0),
  metal: { ...f("covering.metal", 0x3e4348, "roof_seam", 1.6, 0.45, true, 0.5), metalness: 0.4 },
  felt: f("covering.felt", 0x3b3d40, "roof_felt", 2.0, 0.95, true, 0.4),
  epdm: f("covering.epdm", 0x2b2c2f, "roof_epdm", 3.0, 0.8, false, 0.15),
  grp: f("covering.grp", 0x5e6268, "roof_grp", 3.0, 0.5, true, 0.15),
  lead: f("covering.lead", 0x7c8288, "roof_lead", 1.6, 0.6, false, 0.4),
  sedum: f("covering.sedum", 0x6c8b4a, "roof_sedum", 1.5, 1.0, false, 0.8),
  glass: f("covering.glass", 0xa9cfe2, "", 1.0, 0.05, false),
} satisfies Record<string, FinishDef>;

export type FloorFinish = keyof typeof FLOOR_FINISHES;
export type WallFinish = keyof typeof WALL_FINISHES;
export type ExteriorFinish = keyof typeof EXTERIOR_FINISHES;
export type Upholstery = keyof typeof UPHOLSTERY;
export type JoineryFinish = keyof typeof JOINERY_FINISHES;
export type RoofCovering = keyof typeof ROOF_COVERINGS;

/** Paint colours offered as swatches (any colour can be typed in too). */
export const PAINT_SWATCHES: Swatch[] = [
  ["colour.pureWhite", "#f5f4f0"], ["colour.warmWhite", "#efe8dc"], ["colour.greige", "#d5cdc0"], ["colour.stone", "#bdb5a6"],
  ["colour.sage", "#b3bfa3"], ["colour.duckEgg", "#c3d6d1"], ["colour.sky", "#bcd0e2"], ["colour.dustyPink", "#dbbdb3"],
  ["colour.terracotta", "#c47a5a"], ["colour.mustard", "#d2a54a"], ["colour.forest", "#3e5747"], ["colour.navy", "#2f3d56"],
  ["colour.charcoal", "#4a4c50"], ["colour.black", "#26272a"],
];

/** Fabric and wood colours offered for furniture. */
export const FURNITURE_SWATCHES: Swatch[] = [
  ["colour.lightGrey", "#b9bec4"], ["colour.grey", "#8a9099"], ["colour.charcoal", "#4b4f56"], ["colour.cream", "#e6dfd0"],
  ["colour.sand", "#cbb595"], ["colour.tan", "#a8784f"], ["colour.brown", "#6b4630"], ["colour.olive", "#7c7f52"],
  ["colour.green", "#41624f"], ["colour.teal", "#2f6b6b"], ["colour.navy", "#2c3c5a"], ["colour.blue", "#5a7fa8"],
  ["colour.rust", "#a4553a"], ["colour.mustard", "#c99b3c"], ["colour.blush", "#d6aaa0"], ["colour.oak", "#c9a275"],
  ["colour.walnut", "#6e4f38"], ["colour.white", "#f1efea"], ["colour.black", "#2b2c2f"],
];

/** Door and window colours: the usual frame colours, then front door paints. */
export const JOINERY_SWATCHES: Swatch[] = [
  ["colour.white", "#f3f2ee"], ["colour.cream", "#e8e1d0"], ["colour.agateGrey", "#b5b8b1"], ["colour.anthracite", "#383e42"],
  ["colour.black", "#26272a"], ["colour.chartwellGreen", "#a9bfae"], ["colour.sage", "#9aa58b"], ["colour.duckEgg", "#c3d6d1"],
  ["colour.racingGreen", "#2f4a3a"], ["colour.navy", "#2c3c5a"], ["colour.red", "#8e2b2b"], ["colour.mustard", "#d2a54a"],
  ["colour.pink", "#d9a9a3"],
];

/** Roof colours: the usual tile and slate shades, Staffordshire blue among them. */
export const ROOF_SWATCHES: Swatch[] = [
  ["colour.slateGrey", "#4b4f58"], ["colour.charcoal", "#35373b"], ["colour.staffordshireBlue", "#3c4049"], ["colour.smoothBrown", "#5e4a3f"],
  ["colour.rusticRed", "#8f4a34"], ["colour.terracotta", "#b0603d"], ["colour.antiqueBrown", "#6e5345"], ["colour.sandfaced", "#a0765a"],
  ["colour.anthracite", "#383e42"], ["colour.mossGreen", "#5d6b4f"],
];

/** Fascias, soffits and bargeboards. */
export const TRIM_SWATCHES: Swatch[] = [
  ["colour.white", "#f3f2ee"], ["colour.black", "#26272a"], ["colour.anthracite", "#383e42"], ["colour.brown", "#5a4636"], ["colour.rosewood", "#6b3a2e"], ["colour.cream", "#e8e1d0"],
];

/** Every surface the builder can tag, as "<group>:<name>", with its finish (for the textured look). */
export function finishFor(key: string): FinishDef | null {
  const [group, name] = key.split(":");
  switch (group) {
    case "floor": return (FLOOR_FINISHES as Record<string, FinishDef>)[name] ?? FLOOR_FINISHES.wood;
    case "wall": return (WALL_FINISHES as Record<string, FinishDef>)[name] ?? WALL_FINISHES.paint;
    case "ext": return (EXTERIOR_FINISHES as Record<string, FinishDef>)[name] ?? EXTERIOR_FINISHES.render;
    case "uph": return (UPHOLSTERY as Record<string, FinishDef>)[name] ?? UPHOLSTERY.fabric;
    case "jn": return (JOINERY_FINISHES as Record<string, FinishDef>)[name] ?? JOINERY_FINISHES.painted;
    case "roof": return (ROOF_COVERINGS as Record<string, FinishDef>)[name] ?? ROOF_COVERINGS.concrete_tiles;
    default: return null;
  }
}

/** "#rrggbb" (or "rrggbb") to a number, or null. */
export function parseHex(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(s.trim());
  return m ? parseInt(m[1], 16) : null;
}
