// Surface finishes a home can be customised with: floors, inside walls, outside walls, upholstery,
// and the joinery of doors and windows.
// Every finish has a plain colour (what the model look draws, and what the editor's swatch shows)
// and a texture recipe for the realistic look (scene/textures.ts draws it).

export interface FinishDef {
  name: string;
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

const f = (name: string, color: number, tex: string, scale: number, roughness: number, tintable = false, relief = 0.6): FinishDef => ({
  name, color, tex, scale, roughness, tintable, relief,
});

export const FLOOR_FINISHES = {
  wood: f("Light wood", 0xd8b98f, "planks_light", 2.4, 0.55),
  oak: f("Oak", 0xc9a275, "planks_oak", 2.4, 0.5),
  walnut: f("Walnut", 0x7b5a41, "planks_walnut", 2.4, 0.45),
  grey_wood: f("Grey wood", 0xb3ada5, "planks_grey", 2.4, 0.6),
  herringbone: f("Herringbone", 0xc39a6c, "herringbone", 1.12, 0.5),
  tiles: f("Light tiles", 0xdadbd8, "tiles_light", 1.2, 0.35),
  tiles_dark: f("Dark tiles", 0x5d5f63, "tiles_dark", 1.2, 0.35),
  terracotta: f("Terracotta", 0xb86d4b, "tiles_terracotta", 1.2, 0.7),
  marble: f("Marble", 0xe8e6e1, "marble", 1.6, 0.18),
  checker: f("Checkerboard", 0x9a9a98, "checker", 1.2, 0.35),
  carpet: f("Carpet", 0xb9b2a8, "carpet", 1.0, 0.95, true, 0.3),
  stone: f("Stone", 0xb7b3ab, "flagstone", 2.0, 0.75),
  concrete: f("Concrete", 0xbdbdbd, "concrete", 3.0, 0.8, true, 0.2),
  vinyl: f("Vinyl", 0xc8c2b6, "vinyl", 1.2, 0.5, true, 0.1),
} satisfies Record<string, FinishDef>;

export const WALL_FINISHES = {
  paint: f("Paint", 0xf4f2ee, "plaster", 2.0, 0.9, true, 0.15),
  wallpaper_stripes: f("Striped wallpaper", 0xe9e2d4, "wp_stripes", 0.53, 0.85, true, 0.05),
  wallpaper_damask: f("Damask wallpaper", 0xd9cdb6, "wp_damask", 0.53, 0.85, true, 0.08),
  wallpaper_geo: f("Geometric wallpaper", 0xd8dcd6, "wp_geo", 0.53, 0.85, true, 0.05),
  wallpaper_leaves: f("Leaf wallpaper", 0xcfd8c6, "wp_leaves", 0.53, 0.85, true, 0.05),
  panelling: f("Panelling", 0xe8e6df, "panelling", 2.4, 0.7, true, 0.7),
  tiles: f("Wall tiles", 0xf2f2f0, "tiles_metro", 0.6, 0.25, true, 0.6),
  brick: f("Exposed brick", 0xa65d44, "brick_red", 1.35, 0.85, false, 0.9),
  wood: f("Wood cladding", 0xb08860, "boards_v", 1.2, 0.6, false, 0.6),
  concrete: f("Concrete", 0xb9b9b6, "concrete", 3.0, 0.8, true, 0.25),
} satisfies Record<string, FinishDef>;

export const EXTERIOR_FINISHES = {
  render: f("Render", 0xe6dccf, "render", 2.0, 0.9, true, 0.25),
  brick: f("Red brick", 0xa65d44, "brick_red", 1.35, 0.85, false, 0.9),
  brick_buff: f("Buff brick", 0xc9a979, "brick_buff", 1.35, 0.85, false, 0.9),
  brick_white: f("Painted brick", 0xeceae4, "brick_painted", 1.35, 0.8, true, 0.7),
  stone: f("Stone", 0xb5ab98, "stone_wall", 2.0, 0.85, false, 1.0),
  composite: f("Composite cladding", 0x6f7378, "boards_h", 1.2, 0.55, true, 0.7),
  timber: f("Timber cladding", 0xa77b51, "timber_h", 1.2, 0.65, false, 0.7),
  concrete: f("Concrete", 0xb4b4b0, "concrete_panels", 3.0, 0.75, true, 0.35),
  pebbledash: f("Pebbledash", 0xd9d2c4, "pebbledash", 1.0, 0.95, true, 1.0),
} satisfies Record<string, FinishDef>;

export const UPHOLSTERY = {
  fabric: f("Fabric", 0x9aa3ad, "weave", 0.3, 0.95, true, 0.3),
  linen: f("Linen", 0xcfc6b5, "linen", 0.25, 0.92, true, 0.3),
  velvet: f("Velvet", 0x3f5b56, "velvet", 0.5, 0.75, true, 0.15),
  boucle: f("Bouclé", 0xece6da, "boucle", 0.25, 1.0, true, 0.8),
  leather: f("Leather", 0x6b4630, "leather", 0.6, 0.45, true, 0.35),
} satisfies Record<string, FinishDef>;

/** Door leaves and window frames. */
export const JOINERY_FINISHES = {
  painted: f("Painted wood", 0xf1efea, "plaster", 1.0, 0.5, true, 0.05),
  upvc: f("uPVC", 0xf3f2ee, "", 1.0, 0.35, true),
  aluminium: { ...f("Aluminium", 0xa9adb2, "brushed", 0.5, 0.35, true, 0.1), metalness: 0.6 },
  oak: f("Oak", 0xc39a6c, "wood_grain_v", 0.9, 0.5, false, 0.25),
  ash: f("Light wood", 0xd9c09a, "wood_grain_v", 0.9, 0.5, false, 0.2),
  walnut: f("Walnut", 0x6e4f38, "wood_grain_v", 0.9, 0.45, false, 0.25),
} satisfies Record<string, FinishDef>;

export type FloorFinish = keyof typeof FLOOR_FINISHES;
export type WallFinish = keyof typeof WALL_FINISHES;
export type ExteriorFinish = keyof typeof EXTERIOR_FINISHES;
export type Upholstery = keyof typeof UPHOLSTERY;
export type JoineryFinish = keyof typeof JOINERY_FINISHES;

/** Paint colours offered as swatches (any colour can be typed in too). */
export const PAINT_SWATCHES: [string, string][] = [
  ["Pure white", "#f5f4f0"], ["Warm white", "#efe8dc"], ["Greige", "#d5cdc0"], ["Stone", "#bdb5a6"],
  ["Sage", "#b3bfa3"], ["Duck egg", "#c3d6d1"], ["Sky", "#bcd0e2"], ["Dusty pink", "#dbbdb3"],
  ["Terracotta", "#c47a5a"], ["Mustard", "#d2a54a"], ["Forest", "#3e5747"], ["Navy", "#2f3d56"],
  ["Charcoal", "#4a4c50"], ["Black", "#26272a"],
];

/** Fabric and wood colours offered for furniture. */
export const FURNITURE_SWATCHES: [string, string][] = [
  ["Light grey", "#b9bec4"], ["Grey", "#8a9099"], ["Charcoal", "#4b4f56"], ["Cream", "#e6dfd0"],
  ["Sand", "#cbb595"], ["Tan", "#a8784f"], ["Brown", "#6b4630"], ["Olive", "#7c7f52"],
  ["Green", "#41624f"], ["Teal", "#2f6b6b"], ["Navy", "#2c3c5a"], ["Blue", "#5a7fa8"],
  ["Rust", "#a4553a"], ["Mustard", "#c99b3c"], ["Blush", "#d6aaa0"], ["Oak", "#c9a275"],
  ["Walnut", "#6e4f38"], ["White", "#f1efea"], ["Black", "#2b2c2f"],
];

/** Door and window colours: the usual frame colours, then front door paints. */
export const JOINERY_SWATCHES: [string, string][] = [
  ["White", "#f3f2ee"], ["Cream", "#e8e1d0"], ["Agate grey", "#b5b8b1"], ["Anthracite", "#383e42"],
  ["Black", "#26272a"], ["Chartwell green", "#a9bfae"], ["Sage", "#9aa58b"], ["Duck egg", "#c3d6d1"],
  ["Racing green", "#2f4a3a"], ["Navy", "#2c3c5a"], ["Red", "#8e2b2b"], ["Mustard", "#d2a54a"],
  ["Pink", "#d9a9a3"],
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
    default: return null;
  }
}

/** "#rrggbb" (or "rrggbb") to a number, or null. */
export function parseHex(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(s.trim());
  return m ? parseInt(m[1], 16) : null;
}
