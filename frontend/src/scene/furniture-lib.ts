// Built-in furniture, made of a few boxes and cylinders each so a whole floor merges into one
// mesh and renders in a single draw call, even on a Fire tablet.
//
// Each type builds its parts for a given size: x/z offsets from the item's middle, y from the
// floor, width along x, depth along z (front = +z), height along y, all in metres.

export type Role =
  | "wood" | "woodDark" | "fabric" | "fabricDark" | "cushion" | "white" | "metal" | "dark"
  | "glass" | "plant" | "pot" | "accent" | "screen" | "ceramic" | "rug" | "mattress" | "bulb";

/** Parts that light up with their entity: a TV screen, a lamp shade. */
export type Glow = "screen" | "lamp";

export interface Part {
  shape: "box" | "cyl";
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  role: Role;
  glow?: Glow;
  /** Cylinders: segments around (default 12). */
  seg?: number;
}

export interface FurnitureType {
  name: string;
  category: "living" | "kitchen" | "bedroom" | "bath" | "office" | "lights" | "utility" | "structure";
  /** Usual width, depth, height. */
  size: [number, number, number];
  /** Usual height of its bottom above the floor (wall cabinets, wall TVs, wall lamps). */
  y?: number;
  build: (w: number, d: number, h: number) => Part[];
}

const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, glow?: Glow): Part => ({
  shape: "box", x, y, z, w, h, d, role, glow,
});
const cyl = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, glow?: Glow, seg?: number): Part => ({
  shape: "cyl", x, y, z, w, h, d, role, glow, seg,
});

/** Four legs at the corners of a w x d footprint. */
function legs(w: number, d: number, h: number, t = 0.04, inset = 0.03, role: Role = "woodDark"): Part[] {
  const x = w / 2 - inset - t / 2;
  const z = d / 2 - inset - t / 2;
  return [box(-x, 0, -z, t, h, t, role), box(x, 0, -z, t, h, t, role), box(-x, 0, z, t, h, t, role), box(x, 0, z, t, h, t, role)];
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

function cabinet(w: number, d: number, h: number, role: Role = "white", top: Role = "wood"): Part[] {
  return [box(0, 0.08, 0, w, h - 0.12, d, role), box(0, h - 0.04, 0, w + 0.01, 0.04, d + 0.02, top), box(0, 0, -0.03, w - 0.04, 0.08, d - 0.06, "dark")];
}

function steps(w: number, d: number, h: number): Part[] {
  const n = Math.max(3, Math.round(h / 0.19));
  const run = d / n;
  const rise = h / n;
  const parts: Part[] = [];
  for (let i = 0; i < n; i++) {
    // the bottom step is at the front (+z); every step is a solid block down to the floor
    parts.push(box(0, 0, d / 2 - run * (i + 0.5), w, rise * (i + 1), run, i % 2 ? "wood" : "woodDark"));
  }
  return parts;
}

export const FURNITURE: Record<string, FurnitureType> = {
  // ---------------------------------------------------------------- living
  sofa: { name: "Sofa", category: "living", size: [2.0, 0.9, 0.8], build: (w, d, h) => sofa(w, d, h) },
  sofa_l: {
    name: "Corner sofa", category: "living", size: [2.6, 1.8, 0.8],
    build: (w, d, h) => {
      const depth = Math.min(0.95, d / 2);
      const main = sofa(w, depth, h).map((p) => ({ ...p, z: p.z - d / 2 + depth / 2 }));
      const chaise = sofa(depth, d - depth, h, false).map((p) => ({ ...p, x: p.x + w / 2 - depth / 2, z: p.z + depth / 2 }));
      return [...main, ...chaise.filter((p) => p.role !== "fabric")];
    },
  },
  armchair: { name: "Armchair", category: "living", size: [0.85, 0.85, 0.85], build: (w, d, h) => sofa(w, d, h) },
  coffee_table: {
    name: "Coffee table", category: "living", size: [1.1, 0.6, 0.42],
    build: (w, d, h) => [box(0, h - 0.04, 0, w, 0.04, d, "wood"), ...legs(w, d, h - 0.04, 0.04, 0.04)],
  },
  tv_board: {
    name: "TV on a board", category: "living", size: [1.6, 0.45, 1.25],
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
    name: "Wall TV", category: "living", size: [1.45, 0.06, 0.84], y: 0.9,
    build: (w, d, h) => [box(0, 0, 0, w, h, Math.max(0.03, d - 0.01), "dark"), box(0, 0.02, d / 2 - 0.004, w - 0.04, h - 0.04, 0.006, "screen", "screen")],
  },
  sideboard: { name: "Sideboard", category: "living", size: [1.6, 0.45, 0.8], build: (w, d, h) => cabinet(w, d, h, "woodDark", "wood") },
  shelf: {
    name: "Shelf", category: "living", size: [0.8, 0.35, 1.8],
    build: (w, d, h) => {
      const n = Math.max(2, Math.round(h / 0.38));
      const parts = [box(-w / 2 + 0.01, 0, 0, 0.02, h, d, "wood"), box(w / 2 - 0.01, 0, 0, 0.02, h, d, "wood"), box(0, 0, -d / 2 + 0.005, w, h, 0.01, "woodDark")];
      for (let i = 0; i <= n; i++) parts.push(box(0, Math.min(h - 0.02, (h / n) * i), 0, w - 0.04, 0.02, d, "wood"));
      for (let i = 0; i < n; i++) parts.push(box(-w / 4, (h / n) * i + 0.02, 0, w * 0.3, h / n * 0.6, d * 0.7, i % 2 ? "accent" : "fabricDark"));
      return parts;
    },
  },
  tall_cabinet: { name: "Cupboard", category: "living", size: [0.8, 0.4, 2.0], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, 0.3, d / 2, 0.01, h - 0.6, 0.01, "metal")] },
  plant: {
    name: "Plant", category: "living", size: [0.45, 0.45, 1.1],
    build: (w, d, h) => [cyl(0, 0, 0, w * 0.6, h * 0.3, d * 0.6, "pot"), cyl(0, h * 0.3, 0, w, h * 0.7, d, "plant", undefined, 8)],
  },
  rug: { name: "Rug", category: "living", size: [2.0, 1.4, 0.01], build: (w, d) => [box(0, 0, 0, w, 0.008, d, "rug")] },
  fireplace: {
    name: "Fireplace", category: "living", size: [1.2, 0.35, 1.1],
    build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, 0.1, d / 2 - 0.01, w * 0.5, h * 0.5, 0.03, "dark"), box(0, h - 0.06, 0.02, w + 0.1, 0.06, d + 0.06, "wood")],
  },

  // ---------------------------------------------------------------- dining & kitchen
  table: {
    name: "Table", category: "kitchen", size: [1.6, 0.9, 0.75],
    build: (w, d, h) => [box(0, h - 0.04, 0, w, 0.04, d, "wood"), ...legs(w, d, h - 0.04, 0.06, 0.06)],
  },
  table_round: {
    name: "Round table", category: "kitchen", size: [1.1, 1.1, 0.75],
    build: (w, d, h) => [cyl(0, h - 0.04, 0, w, 0.04, d, "wood", undefined, 16), cyl(0, 0, 0, 0.1, h - 0.04, 0.1, "woodDark"), cyl(0, 0, 0, w * 0.45, 0.04, d * 0.45, "woodDark")],
  },
  chair: {
    name: "Chair", category: "kitchen", size: [0.45, 0.5, 0.9],
    build: (w, d, h) => [box(0, 0.44, 0.02, w, 0.04, d - 0.04, "wood"), box(0, 0.44, -d / 2 + 0.02, w, h - 0.44, 0.04, "wood"), ...legs(w, d, 0.44, 0.035, 0.02)],
  },
  bench: { name: "Bench", category: "kitchen", size: [1.4, 0.4, 0.45], build: (w, d, h) => [box(0, h - 0.05, 0, w, 0.05, d, "wood"), ...legs(w, d, h - 0.05, 0.05, 0.04)] },
  kitchen: { name: "Kitchen base unit", category: "kitchen", size: [0.6, 0.6, 0.9], build: (w, d, h) => [...cabinet(w, d, h, "white", "woodDark"), box(0, h * 0.7, d / 2, w * 0.3, 0.015, 0.015, "metal")] },
  kitchen_wall: { name: "Wall cupboard", category: "kitchen", size: [0.6, 0.35, 0.7], y: 1.45, build: (w, d, h) => [box(0, 0, 0, w, h, d, "white")] },
  kitchen_tall: { name: "Tall unit / oven", category: "kitchen", size: [0.6, 0.6, 2.1], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, h * 0.4, d / 2, w - 0.08, h * 0.22, 0.01, "dark")] },
  island: { name: "Kitchen island", category: "kitchen", size: [1.8, 0.9, 0.92], build: (w, d, h) => cabinet(w, d, h, "woodDark", "white") },
  sink: {
    name: "Sink unit", category: "kitchen", size: [0.8, 0.6, 0.9],
    build: (w, d, h) => [...cabinet(w, d, h, "white", "woodDark"), box(0, h - 0.035, 0, w * 0.6, 0.03, d * 0.6, "metal"), cyl(0, h, -d / 2 + 0.08, 0.04, 0.25, 0.04, "metal")],
  },
  stove: {
    name: "Hob / stove", category: "kitchen", size: [0.6, 0.6, 0.9],
    build: (w, d, h) => {
      const parts = [...cabinet(w, d, h, "white", "dark"), box(0, h * 0.2, d / 2, w - 0.06, h * 0.45, 0.01, "dark")];
      for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) parts.push(cyl(x * w * 0.22, h, z * d * 0.22, w * 0.25, 0.006, w * 0.25, "metal"));
      return parts;
    },
  },
  fridge: { name: "Fridge", category: "kitchen", size: [0.6, 0.65, 1.8], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(w / 2 - 0.06, h * 0.45, d / 2 + 0.01, 0.02, h * 0.35, 0.03, "metal"), box(0, h * 0.38, d / 2, w, 0.008, 0.008, "metal")] },
  dishwasher: { name: "Dishwasher", category: "kitchen", size: [0.6, 0.6, 0.85], build: (w, d, h) => [...cabinet(w, d, h, "metal", "woodDark"), box(0, h * 0.85, d / 2, w * 0.7, 0.02, 0.02, "dark")] },

  // ---------------------------------------------------------------- bedroom
  bed: {
    name: "Bed", category: "bedroom", size: [1.6, 2.05, 0.55],
    build: (w, d, h) => {
      const pillows = w > 1.2 ? [-w / 4, w / 4] : [0];
      return [
        box(0, 0.08, 0, w, 0.25, d, "woodDark"),
        box(0, 0.33, 0.04, w - 0.06, 0.2, d - 0.1, "mattress"),
        box(0, 0.53, 0.25, w - 0.04, 0.04, d * 0.62, "fabric"),
        box(0, 0.08, -d / 2 + 0.04, w, Math.max(0.9, h + 0.35), 0.08, "woodDark"),
        ...pillows.map((x) => box(x, 0.53, -d / 2 + 0.28, Math.min(0.6, w / 2 - 0.1), 0.12, 0.35, "white")),
        ...legs(w, d, 0.08, 0.06, 0.02, "dark"),
      ];
    },
  },
  bunk_bed: {
    name: "Bunk bed", category: "bedroom", size: [1.0, 2.05, 1.6],
    build: (w, d, h) => [
      box(0, 0.25, 0, w - 0.08, 0.15, d - 0.08, "mattress"),
      box(0, h * 0.6, 0, w - 0.08, 0.15, d - 0.08, "mattress"),
      ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => box((x * (w - 0.06)) / 2, 0, (z * (d - 0.06)) / 2, 0.06, h, 0.06, "wood")),
    ],
  },
  nightstand: { name: "Bedside table", category: "bedroom", size: [0.45, 0.4, 0.5], build: (w, d, h) => [box(0, 0.06, 0, w, h - 0.06, d, "wood"), ...legs(w, d, 0.06, 0.04, 0.02, "dark")] },
  wardrobe: {
    name: "Wardrobe", category: "bedroom", size: [1.5, 0.6, 2.1],
    build: (w, d, h) => {
      const doors = Math.max(1, Math.round(w / 0.5));
      const parts = [box(0, 0, 0, w, h, d, "white")];
      for (let i = 1; i < doors; i++) parts.push(box(-w / 2 + (w / doors) * i, 0.05, d / 2, 0.006, h - 0.1, 0.006, "dark"));
      return parts;
    },
  },
  dresser: { name: "Chest of drawers", category: "bedroom", size: [1.0, 0.45, 0.85], build: (w, d, h) => [box(0, 0.06, 0, w, h - 0.06, d, "white"), ...[0.3, 0.55, 0.8].map((f) => box(0, h * f, d / 2, w - 0.06, 0.006, 0.006, "dark"))] },

  // ---------------------------------------------------------------- bathroom & utility
  bathtub: {
    name: "Bath", category: "bath", size: [1.7, 0.75, 0.55],
    build: (w, d, h) => [box(0, 0, 0, w, h - 0.02, d, "ceramic"), box(0, h - 0.04, 0, w - 0.14, 0.02, d - 0.14, "glass")],
  },
  shower: {
    name: "Shower", category: "bath", size: [0.9, 0.9, 2.0],
    build: (w, d, h) => [box(0, 0, 0, w, 0.06, d, "ceramic"), box(0, 0.06, d / 2 - 0.01, w, h - 0.06, 0.01, "glass"), box(-w / 2 + 0.01, 0.06, 0, 0.01, h - 0.06, d, "glass")],
  },
  wc: {
    name: "Toilet", category: "bath", size: [0.4, 0.65, 0.8],
    build: (w, d) => [box(0, 0, -d / 2 + 0.09, w, 0.8, 0.18, "ceramic"), cyl(0, 0, 0.06, w * 0.85, 0.42, d * 0.7, "ceramic", undefined, 14)],
  },
  washbasin: { name: "Washbasin", category: "bath", size: [0.6, 0.45, 0.85], build: (w, d, h) => [box(0, h * 0.35, -0.02, w * 0.9, h * 0.5, d * 0.85, "woodDark"), box(0, h - 0.12, 0, w, 0.12, d, "ceramic")] },
  washer: {
    name: "Washing machine", category: "utility", size: [0.6, 0.6, 0.85],
    build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), { ...cyl(0, h * 0.25, d / 2, w * 0.55, w * 0.55, 0.02, "dark", undefined, 16), shape: "cyl" }],
  },
  dryer: { name: "Dryer", category: "utility", size: [0.6, 0.6, 0.85], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), cyl(0, h * 0.25, d / 2, w * 0.55, w * 0.55, 0.02, "metal", undefined, 16)] },
  radiator: { name: "Radiator", category: "utility", size: [1.0, 0.1, 0.6], y: 0.12, build: (w, d, h) => [box(0, 0, 0, w, h, d, "white")] },
  boiler: { name: "Boiler", category: "utility", size: [0.45, 0.35, 0.7], y: 1.2, build: (w, d, h) => [box(0, 0, 0, w, h, d, "white"), box(0, h * 0.15, d / 2, w * 0.4, h * 0.08, 0.01, "dark")] },
  printer_3d: { name: "3D printer", category: "utility", size: [0.4, 0.4, 0.5], build: (w, d, h) => [box(0, 0, 0, w, h, d, "dark"), box(0, 0.05, d / 2 - 0.004, w * 0.85, h * 0.8, 0.008, "glass", "screen")] },

  // ---------------------------------------------------------------- office
  desk: { name: "Desk", category: "office", size: [1.4, 0.7, 0.75], build: (w, d, h) => [box(0, h - 0.03, 0, w, 0.03, d, "white"), ...legs(w, d, h - 0.03, 0.04, 0.03, "metal")] },
  office_chair: {
    name: "Office chair", category: "office", size: [0.6, 0.6, 1.1],
    build: (w, d, h) => [cyl(0, 0, 0, w, 0.05, d, "dark", undefined, 5), cyl(0, 0.05, 0, 0.05, 0.4, 0.05, "metal"), box(0, 0.45, 0.02, w * 0.8, 0.08, d * 0.75, "fabricDark"), box(0, 0.53, -d * 0.36, w * 0.75, h - 0.55, 0.06, "fabricDark")],
  },
  monitor: { name: "Monitor", category: "office", size: [0.6, 0.2, 0.45], y: 0.75, build: (w, d, h) => [box(0, 0, 0, 0.2, 0.02, d, "dark"), box(0, 0.02, -0.02, 0.04, h * 0.3, 0.04, "dark"), box(0, h * 0.25, 0, w, h * 0.75, 0.03, "dark"), box(0, h * 0.27, 0.016, w - 0.03, h * 0.71, 0.004, "screen", "screen")] },

  // ---------------------------------------------------------------- lights (glow with their light entity)
  lamp_ceiling: { name: "Ceiling light", category: "lights", size: [0.4, 0.4, 0.1], build: (w, d, h) => [cyl(0, -h, 0, w, h, d, "bulb", "lamp", 16)] },
  lamp_pendant: {
    name: "Pendant light", category: "lights", size: [0.35, 0.35, 0.8],
    build: (w, d, h) => [cyl(0, -h, 0, w, 0.22, d, "bulb", "lamp", 14), cyl(0, -h + 0.22, 0, 0.012, h - 0.22, 0.012, "dark", undefined, 4)],
  },
  lamp_downlight: { name: "Downlight", category: "lights", size: [0.1, 0.1, 0.02], build: (w, d, h) => [cyl(0, -h, 0, w, h, d, "bulb", "lamp", 10)] },
  lamp_floor: {
    name: "Floor lamp", category: "lights", size: [0.4, 0.4, 1.6],
    build: (w, d, h) => [cyl(0, 0, 0, w * 0.6, 0.03, d * 0.6, "dark"), cyl(0, 0.03, 0, 0.025, h - 0.35, 0.025, "metal", undefined, 6), cyl(0, h - 0.32, 0, w, 0.3, d, "bulb", "lamp", 14)],
  },
  lamp_table: {
    name: "Table lamp", category: "lights", size: [0.25, 0.25, 0.45], y: 0.5,
    build: (w, d, h) => [cyl(0, 0, 0, w * 0.5, h * 0.5, d * 0.5, "ceramic"), cyl(0, h * 0.5, 0, w, h * 0.5, d, "bulb", "lamp", 12)],
  },
  lamp_wall: { name: "Wall light", category: "lights", size: [0.25, 0.12, 0.2], y: 1.8, build: (w, d, h) => [box(0, 0, -d / 2 + 0.01, w * 0.4, h * 0.6, 0.02, "dark"), box(0, 0, 0, w, h, d * 0.8, "bulb", "lamp")] },
  led_strip: { name: "LED strip", category: "lights", size: [1.5, 0.02, 0.012], build: (w, d, h) => [box(0, 0, 0, w, h, d, "bulb", "lamp")] },
  lamp_garden: { name: "Garden light", category: "lights", size: [0.15, 0.15, 0.6], build: (w, d, h) => [cyl(0, 0, 0, w * 0.4, h - 0.15, d * 0.4, "dark", undefined, 6), cyl(0, h - 0.15, 0, w, 0.15, d, "bulb", "lamp", 10)] },

  // ---------------------------------------------------------------- structure
  stairs: { name: "Stairs", category: "structure", size: [0.9, 3.0, 2.6], build: steps },
  column: { name: "Column", category: "structure", size: [0.3, 0.3, 2.5], build: (w, d, h) => [box(0, 0, 0, w, h, d, "white")] },
};

/** Light fixtures follow a light entity's state. */
export const LAMP_TYPES = Object.keys(FURNITURE).filter((k) => FURNITURE[k].category === "lights");

export function furnitureType(type: string): FurnitureType {
  return FURNITURE[type] ?? FURNITURE.tall_cabinet;
}
