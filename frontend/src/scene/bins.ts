// Bins and post boxes for the garden: wheelie bins (140, 240 and 360 l), a food caddy, a recycling
// box and a communal bin, each holding a kind of waste whose usual body and lid colours depend on
// the home's country; and post boxes (on a wall, on a post, a parcel box) whose window glows while
// their sensor says there is post. Made of simple solids like the rest of the garden (scene/garden.ts).
import type { Furniture } from "../model/plan";
import type { FurnitureType, Part, Role } from "./furniture-lib";
import type { PlainKey } from "../i18n";

/** What a bin is for, so a bin can be matched to its collection sensor. */
export type WasteKind = "general" | "recycling" | "garden" | "food" | "glass";

export const WASTE_NAMES: Record<WasteKind, PlainKey> = {
  general: "waste.general", recycling: "waste.recycling", garden: "waste.garden", food: "waste.food", glass: "waste.glass",
};

/** The waste each bin type can hold; the first is what it holds unless picked. */
export const BIN_WASTES: Record<string, WasteKind[]> = {
  bin_140: ["general", "recycling", "garden", "food", "glass"],
  bin_240: ["general", "recycling", "garden", "food", "glass"],
  bin_360: ["general", "recycling", "garden", "food", "glass"],
  bin_communal: ["general", "recycling", "food", "glass", "garden"],
  food_caddy: ["food"],
  recycling_box: ["recycling", "glass"],
};

/** Post boxes: they glow while their sensor says there is post. */
export const POST_TYPES = new Set(["postbox_wall", "postbox_post", "parcel_box"]);

/** A piece's waste kind: its own where its type allows it, else its type's usual; null if it is no bin. */
export function wasteKind(item: Pick<Furniture, "type" | "waste">): WasteKind | null {
  const list = BIN_WASTES[item.type];
  if (!list) return null;
  return list.includes(item.waste as WasteKind) ? (item.waste as WasteKind) : list[0];
}

/** Body and lid colours ("#rrggbb") by country (ISO 3166 code), then waste; "" for anywhere else. */
const BIN_COLOURS: Record<string, Partial<Record<WasteKind, [string, string]>>> = {
  "": { general: ["#3c4045", "#3c4045"], recycling: ["#2f5fa6", "#2f5fa6"], garden: ["#3f6e35", "#3f6e35"], food: ["#6b4a33", "#6b4a33"], glass: ["#2f6b3f", "#2f6b3f"] },
  GB: { general: ["#2b2c2f", "#2b2c2f"], food: ["#3f6e35", "#3f6e35"] },
  IE: { general: ["#2b2c2f", "#2b2c2f"], recycling: ["#3f6e35", "#3f6e35"], garden: ["#6b4a33", "#6b4a33"] },
  US: { general: ["#2b2c2f", "#2b2c2f"], glass: ["#2f5fa6", "#2f5fa6"] },
  DE: { general: ["#3c4045", "#2b2c2f"], recycling: ["#3c4045", "#e6b81e"], garden: ["#6b4a33", "#6b4a33"] },
  AT: { general: ["#3c4045", "#2b2c2f"], recycling: ["#3c4045", "#e6b81e"], garden: ["#6b4a33", "#6b4a33"] },
  NL: { general: ["#5f6366", "#5f6366"], recycling: ["#5f6366", "#e07b1f"], garden: ["#5f6366", "#3f7a3a"], food: ["#5f6366", "#3f7a3a"] },
  FR: { general: ["#5f6366", "#3f6e35"], recycling: ["#5f6366", "#e6b81e"], garden: ["#5f6366", "#6b4a33"], food: ["#5f6366", "#6b4a33"] },
  AU: {
    general: ["#2d4a36", "#c0392b"], recycling: ["#2d4a36", "#e6b81e"], garden: ["#2d4a36", "#8bbf3f"], food: ["#2d4a36", "#8bbf3f"], glass: ["#2d4a36", "#7b4fa0"],
  },
};

/** The usual body and lid colours of a bin for this waste in this country (Home Assistant's `country`). */
export function binColours(country: string | null | undefined, waste: WasteKind): [string, string] {
  return BIN_COLOURS[(country ?? "").toUpperCase()]?.[waste] ?? BIN_COLOURS[""][waste]!;
}

/** Whether a post sensor's state means there is post: on, a count above nought, or a word for it. */
export function holdsPost(state: string): boolean {
  const n = Number(state);
  if (state.trim() !== "" && Number.isFinite(n)) return n > 0;
  return ["on", "true", "yes", "open", "detected", "post", "mail", "full"].includes(state.toLowerCase());
}

const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, extra: Partial<Part> = {}): Part => ({ shape: "box", x, y, z, w, h, d, role, ...extra });
const rod = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, seg = 10): Part => ({ shape: "cyl", axis: "x", x, y, z, w, h, d, role, seg });
/** A side outline (along z, up y, in 0..1 of d and h) carried w across x. */
const hull = (y: number, z: number, w: number, h: number, d: number, role: Role, outline: [number, number][]): Part => ({ shape: "hull", x: 0, y, z, w, h, d, role, outline });

/**
 * A wheelie bin: a body narrowing to its foot, a rim, the lid hinged at the back, the handle and the
 * axle with its two wheels at the back (-z), and two feet at the front.
 */
function wheelieBin(w: number, d: number, h: number): Part[] {
  const top = h - 0.04, wheel = Math.min(0.25, h * 0.2);
  return [
    hull(0.04, 0, w - 0.04, top - 0.09, d - 0.06, "plastic", [[0.12, 0], [0.92, 0], [1, 1], [0, 1]]),
    box(0, top - 0.05, 0, w, 0.05, d - 0.03, "plastic"),
    box(0, top, 0.006, w + 0.01, 0.035, d + 0.012, "lid"),
    box(0, top - 0.035, d / 2 + 0.014, w - 0.08, 0.035, 0.016, "lid"),
    // the handle across the back, on two arms from the rim
    rod(0, top - 0.07, -d / 2 - 0.035, w - 0.06, 0.035, 0.035, "plastic"),
    ...[-1, 1].map((s) => box(s * (w / 2 - 0.06), top - 0.075, -d / 2 - 0.01, 0.03, 0.045, 0.05, "plastic")),
    rod(0, wheel / 2 - 0.0125, -d / 2 + 0.07, w + 0.07, 0.025, 0.025, "metal", 6),
    ...[-1, 1].map((s) => rod(s * (w / 2 + 0.012), 0, -d / 2 + 0.07, 0.055, wheel, wheel, "rubber", 14)),
    ...[-1, 1].map((s) => box(s * (w / 2 - 0.09), 0, d / 2 - 0.14, 0.06, 0.04, 0.08, "plastic")),
  ];
}

/** A communal bin (1100 l): a deep body on four castors, a domed lid, grab bars front and sides. */
function communalBin(w: number, d: number, h: number): Part[] {
  const foot = 0.17, top = h - 0.13;
  const out: Part[] = [
    hull(foot, 0, w - 0.06, top - foot - 0.06, d - 0.1, "plastic", [[0.06, 0], [0.94, 0], [1, 1], [0, 1]]),
    box(0, top - 0.06, 0, w, 0.06, d - 0.04, "plastic"),
    hull(top, 0.004, w + 0.012, h - top, d + 0.008, "lid", [[0, 0], [1, 0], [0.96, 0.45], [0.82, 0.82], [0.5, 1], [0.18, 0.82], [0.04, 0.45]]),
    rod(0, top - 0.3, d / 2 + 0.01, w - 0.36, 0.035, 0.035, "dark"),
  ];
  for (const sx of [-1, 1]) {
    out.push(box(sx * (w / 2 - 0.02 + 0.035), top - 0.32, 0, 0.03, 0.035, d * 0.5, "dark"));
    for (const sz of [-1, 1]) {
      const x = sx * (w / 2 - 0.15), z = sz * (d / 2 - 0.16);
      out.push(box(x, 0.1, z, 0.08, foot - 0.1, 0.08, "metal"), rod(x, 0, z, 0.04, 0.11, 0.11, "rubber", 12));
    }
  }
  return out;
}

/** A kerbside food caddy: a small tub, its lid, and the carrying handle folded down over it. */
function foodCaddy(w: number, d: number, h: number): Part[] {
  return [
    hull(0, 0, w, h - 0.05, d - 0.02, "plastic", [[0.06, 0], [0.94, 0], [1, 1], [0, 1]]),
    box(0, h - 0.05, 0, w + 0.012, 0.04, d + 0.004, "lid"),
    box(0, h - 0.01, d / 2 - 0.05, w - 0.05, 0.012, 0.03, "plastic"),
  ];
}

/** An open recycling box: thin walls round a floor, a few things in it. */
function recyclingBox(w: number, d: number, h: number): Part[] {
  const t = 0.012;
  return [
    box(0, 0, 0, w - 2 * t, 0.02, d - 2 * t, "plastic"),
    box(0, 0, -d / 2 + t / 2, w, h, t, "plastic"),
    box(0, 0, d / 2 - t / 2, w, h, t, "plastic"),
    box(-w / 2 + t / 2, 0, 0, t, h, d - 2 * t, "plastic"),
    box(w / 2 - t / 2, 0, 0, t, h, d - 2 * t, "plastic"),
    box(-w * 0.18, 0.02, -d * 0.12, w * 0.4, h * 0.45, d * 0.5, "paper"),
    { shape: "cyl", x: w * 0.2, y: 0.02, z: d * 0.1, w: 0.07, h: h * 0.6, d: 0.07, role: "metal", seg: 10 },
    { shape: "cyl", x: w * 0.28, y: 0.02, z: -d * 0.16, w: 0.08, h: h * 0.75, d: 0.08, role: "leaf", seg: 10, taper: 0.4 },
  ];
}

/** The window a post box shows its post through: dark, glowing while there is post. */
const postWindow = (y: number, zf: number, w: number): Part => box(0, y, zf + 0.002, w, 0.025, 0.004, "screen", { glow: "screen" });

/** A post box on a wall: a box with a lid flap over the top, its window and a handle at the front. */
function wallPostBox(w: number, d: number, h: number): Part[] {
  return [
    box(0, 0, 0, w, h - 0.04, d, "blackMetal"),
    box(0, h - 0.04, 0.005, w + 0.012, 0.04, d + 0.02, "blackMetal"),
    postWindow(h * 0.5, d / 2, w * 0.5),
    box(0, h * 0.2, d / 2 + 0.01, 0.06, 0.02, 0.02, "metal"),
  ];
}

/** A post box on a post: a box with a sloping top on a square post, a door and its window at the front. */
function postPostBox(w: number, d: number, h: number): Part[] {
  const bh = Math.min(0.38, h * 0.3), by = h - bh;
  return [
    box(0, 0, -0.02, 0.08, by, 0.08, "blackMetal"),
    hull(by, 0, w, bh, d, "blackMetal", [[0, 0], [1, 0], [1, 0.82], [0, 1]]),
    box(0, by + 0.04, d / 2 + 0.004, w - 0.06, bh * 0.82 - 0.1, 0.008, "blackMetal"),
    postWindow(by + bh * 0.5, d / 2 + 0.008, w * 0.45),
    box(w / 2 - 0.08, by + 0.1, d / 2 + 0.016, 0.02, 0.05, 0.016, "metal"),
  ];
}

/** A parcel box: a tall locker on a plinth, a cap, a flap for letters with its window, the door below. */
function parcelBox(w: number, d: number, h: number): Part[] {
  return [
    box(0, 0, 0, w - 0.04, 0.04, d - 0.04, "dark"),
    box(0, 0.04, 0, w, h - 0.07, d, "blackMetal"),
    box(0, h - 0.03, 0, w + 0.03, 0.03, d + 0.03, "blackMetal"),
    box(0, h - 0.2, d / 2 + 0.005, w - 0.08, 0.12, 0.01, "blackMetal"),
    postWindow(h - 0.25, d / 2, w * 0.5),
    box(0, 0.12, d / 2 + 0.005, w - 0.08, h - 0.45, 0.01, "blackMetal"),
    box(w / 2 - 0.09, h * 0.4, d / 2 + 0.018, 0.02, 0.12, 0.016, "metal"),
  ];
}

const bin = (label: FurnitureType["label"], size: [number, number, number], build: (w: number, d: number, h: number) => Part[], lid = true): FurnitureType => ({
  label, category: "outdoor", family: "bin", size, paint: ["plastic"], trim: lid ? ["lid"] : undefined, build: (w, d, h) => build(w, d, h),
});
const postBox = (label: FurnitureType["label"], size: [number, number, number], build: (w: number, d: number, h: number) => Part[], y?: number): FurnitureType => ({
  label, category: "outdoor", family: "postbox", size, y, paint: ["blackMetal"], build: (w, d, h) => build(w, d, h),
});

export const BIN_FURNITURE: Record<string, FurnitureType> = {
  bin_140: bin("furniture.bin_140", [0.48, 0.555, 1.065], wheelieBin),
  bin_240: bin("furniture.bin_240", [0.58, 0.74, 1.07], wheelieBin),
  bin_360: bin("furniture.bin_360", [0.66, 0.88, 1.1], wheelieBin),
  bin_communal: bin("furniture.bin_communal", [1.37, 1.07, 1.33], communalBin),
  food_caddy: bin("furniture.food_caddy", [0.32, 0.4, 0.4], foodCaddy),
  recycling_box: bin("furniture.recycling_box", [0.58, 0.4, 0.33], recyclingBox, false),
  postbox_wall: postBox("furniture.postbox_wall", [0.36, 0.12, 0.36], wallPostBox, 1.0),
  postbox_post: postBox("furniture.postbox_post", [0.36, 0.3, 1.3], postPostBox),
  parcel_box: postBox("furniture.parcel_box", [0.55, 0.45, 0.9], parcelBox),
};
