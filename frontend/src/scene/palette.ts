// Colours of the two looks. Day is a soft architectural model, Night a dark house where the
// lights carry the picture. Colours are sRGB hex; the mesh builder converts them to linear.
import type { Role } from "./furniture-lib";

export interface Palette {
  name: "day" | "night";
  outdoor: Record<import("../model/plan").Ground, number>;
  background: number;
  ground: number;
  wallInner: number;
  wallOuter: number;
  wallCap: number;
  /** The cut face of a wall lowered by the cutaway. */
  wallCut: number;
  slab: number;
  glass: number;
  /** Glass of a lit room seen from outside at night. */
  glassLit: number;
  roles: Record<Role, number>;
  /** Light everything gets without lamps (0..1.2). */
  ambient: number;
  /** How strongly lamps add to it. */
  lampGain: number;
  text: number;
  accent: number;
}

const roles = (o: Partial<Record<Role, number>>, base: Record<Role, number>) => ({ ...base, ...o });

const DAY_ROLES: Record<Role, number> = {
  wood: 0xc9a27a,
  woodDark: 0x8a6a4f,
  fabric: 0x9aa3ad,
  fabricDark: 0x6f7883,
  cushion: 0xb7bec6,
  white: 0xf1efea,
  metal: 0xb9bec4,
  dark: 0x3b3f45,
  glass: 0xbfd9e6,
  plant: 0x6f9e5b,
  pot: 0xc97c5d,
  accent: 0xd9a441,
  screen: 0x22262c,
  ceramic: 0xf7f7f5,
  rug: 0xc8b9a6,
  mattress: 0xf4f1ec,
  bulb: 0xf3ead8,
  leaf: 0x4f7f45,
  soil: 0x4e3c2e,
  red: 0xb5483b,
  blue: 0x4a6fa5,
  paper: 0xece7dc,
  canvas: 0xd9c3a0,
  mirror: 0xcfdde6,
  water: 0x6fb3c9,
  rubber: 0x2b2c2f,
  pine: 0xd9a865,
  softwood: 0xe6cfa3,
  oak: 0xc39a6c,
  walnut: 0x6e4f38,
  primed: 0xf3f2ee,
  blackMetal: 0x2a2b2e,
  concrete: 0xb3b0a8,
  brick: 0xa65d44,
};

export const DAY: Palette = {
  name: "day",
  outdoor: { lawn: 0x9cc27a, patio: 0xc9c2b5, deck: 0xb58a62, path: 0xbab3a6, driveway: 0x9e8f84, asphalt: 0x63666b, bed: 0x7b5e45, gravel: 0xcfc8bb },
  background: 0xe9edf1,
  ground: 0xd8dfd3,
  wallInner: 0xf4f2ee,
  wallOuter: 0xe6dccf,
  wallCap: 0x5c5f66,
  wallCut: 0x3e4148,
  slab: 0x8c8f94,
  glass: 0xa9cfe2,
  glassLit: 0xffd9a0,
  roles: DAY_ROLES,
  ambient: 1.0,
  lampGain: 0.55,
  text: 0x1f2329,
  accent: 0x2f7cf6,
};

export const NIGHT: Palette = {
  name: "night",
  outdoor: { lawn: 0x41603a, patio: 0x6e6a63, deck: 0x6a5240, path: 0x66625b, driveway: 0x5c5650, asphalt: 0x37393d, bed: 0x4a3a2c, gravel: 0x6f6b64 },
  background: 0x0c1220,
  ground: 0x141c2c,
  wallInner: 0x9aa3b2,
  wallOuter: 0x6e7787,
  wallCap: 0x2b3240,
  wallCut: 0x4f86b0,
  slab: 0x232a38,
  glass: 0x34506a,
  glassLit: 0xffc77a,
  roles: roles({ white: 0xc9ccd2, primed: 0xc9ccd2, ceramic: 0xd5d7db, mattress: 0xcfd2d6, bulb: 0x8d8a83, screen: 0x0d1015 }, DAY_ROLES),
  ambient: 0.34,
  lampGain: 1.0,
  text: 0xe8eef8,
  accent: 0x56c7ff,
};

/**
 * A day colour as the night look shows it (custom paint, finishes): about two thirds as bright,
 * cooler, darker still outside.
 */
export function nightify(hex: number, outside = false): number {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const k = outside ? [0.44, 0.48, 0.52] : [0.63, 0.66, 0.74];
  return (Math.round(r * k[0]) << 16) | (Math.round(g * k[1]) << 8) | Math.round(b * k[2]);
}

/** A palette's version of a day colour. */
export function inPalette(pal: Palette, hex: number, outside = false): number {
  return pal.name === "night" ? nightify(hex, outside) : hex;
}

export function paletteFor(name: "day" | "night"): Palette {
  return name === "night" ? NIGHT : DAY;
}
