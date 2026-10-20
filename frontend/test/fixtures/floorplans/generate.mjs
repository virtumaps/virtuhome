// Draws the floor plan pictures the room finder is tested on, in the style of estate agents' plans,
// with the true rooms beside each as JSON. Every house here is made up.
//   node test/fixtures/floorplans/generate.mjs
// Rooms are given along the middle of their walls, in metres, as the plan stores them.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const DIR = new URL(".", import.meta.url);
const SS = 3; // drawn at 3x and averaged down, for smooth edges

// ---------------------------------------------------------------- the houses
const R = (name, x0, z0, x1, z1, extra = {}) => ({ name, points: [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], ...extra });
const P = (name, points, extra = {}) => ({ name, points, ...extra });
// doors: [x, z, width, hinge end ("a": the lower x or z), swing ("+": towards +x or +z), kind]
const PLANS = [
  { file: "terrace-ground", title: "GROUND FLOOR", mpp: 0.008, ext: 0.28, int: 0.1, walls: "black", dims: true,
    rooms: [R("Living Room", 0, 0, 3.7, 4.3), R("Hall", 3.7, 0, 4.8, 8.2), R("Dining Room", 0, 4.3, 3.7, 8.2), R("Kitchen", 1.6, 8.2, 4.8, 12), R("Bathroom", 1.6, 12, 4.8, 14)],
    doors: [[4.25, 0, 0.9, "b", "+"], [3.7, 3.5, 0.76, "b", "-"], [3.7, 5, 0.76, "a", "-"], [2.5, 8.2, 0.76, "a", "+"], [4.1, 12, 0.7, "b", "+"], [1.6, 11.2, 0.85, "b", "+"]],
    windows: [[1.85, 0, 1.8], [0.8, 8.2, 1], [1.6, 9.4, 1], [1.6, 13, 0.6], [3.2, 14, 0.8]],
    stairs: [[3.75, 4.6, 4.75, 7.9, "UP"]] },
  { file: "terrace-first", title: "FIRST FLOOR", mpp: 0.0085, ext: 0.25, int: 0.09, walls: "dark",
    rooms: [R("Bedroom 1", 0, 0, 4.8, 3.9), R("Bedroom 2", 0, 3.9, 3.6, 8.2), R("Landing", 3.6, 3.9, 4.8, 8.2), R("Bathroom", 1.6, 8.2, 3.4, 10.2), R("Lobby", 3.4, 8.2, 4.8, 10.2), R("Bedroom 3", 1.6, 10.2, 4.8, 13.4)],
    doors: [[4.2, 3.9, 0.76, "b", "-"], [3.6, 6.8, 0.76, "a", "-"], [4.1, 8.2, 0.8, "", "", "passage"], [3.4, 9.3, 0.7, "a", "-"], [4.1, 10.2, 0.76, "b", "+"]],
    windows: [[1.4, 0, 1.2], [3.6, 0, 0.9], [0.8, 8.2, 1], [1.6, 9.2, 0.6], [1.6, 11.8, 1], [3.2, 13.4, 1.2]],
    stairs: [[3.65, 4.4, 4.75, 7.4, "DN"]] },
  { file: "semi-ground", title: "GROUND FLOOR", mpp: 0.0075, ext: 0.3, int: 0.1, walls: "outline", dims: true,
    rooms: [P("Living Room", [[0, 0], [0.6, 0], [1.4, -0.8], [2.4, -0.8], [3.2, 0], [3.8, 0], [3.8, 4.2], [0, 4.2]], { box: [0, 0, 3.8, 4.2] }),
      R("Hall", 3.8, 0, 5.6, 4.2), R("Dining Room", 0, 4.2, 3.8, 8.4), R("Kitchen", 3.8, 4.2, 5.6, 8.4), R("Family Room", 0, 8.4, 5.6, 11.6)],
    doors: [[4.7, 0, 0.9, "b", "+"], [3.8, 3.2, 0.76, "b", "-"], [4.7, 4.2, 0.76, "b", "+"], [1.9, 8.4, 1.5, "", "", "passage"], [4.7, 8.4, 0.8, "", "", "passage"]],
    windows: [[1.9, -0.8, 0.8], [1, -0.4, 0.6], [2.8, -0.4, 0.6], [5.6, 6.3, 1], [1.5, 11.6, 1.2], [4, 11.6, 1.8], [5.6, 2, 0.6]],
    stairs: [[4.65, 0.9, 5.55, 4, "UP"]] },
  { file: "semi-first", title: "FIRST FLOOR", mpp: 0.007, ext: 0.28, int: 0.1, walls: "black", jpeg: 55,
    rooms: [R("Bedroom 1", 0, 0, 3.8, 4.4), R("Bedroom 2", 0, 4.4, 3.8, 8.4), R("Bedroom 3", 3.8, 0, 5.6, 2.4), R("Landing", 3.8, 2.4, 5.6, 5.6), R("Bathroom", 3.8, 5.6, 5.6, 8.4)],
    doors: [[3.8, 3.6, 0.76, "b", "-"], [3.8, 5, 0.76, "a", "-"], [4.7, 2.4, 0.7, "b", "-"], [4.7, 5.6, 0.7, "b", "+"]],
    windows: [[1.9, 0, 1.8], [4.7, 0, 0.9], [1.9, 8.4, 1.4], [4.7, 8.4, 0.6], [5.6, 7, 0.6]],
    stairs: [[4.75, 2.6, 5.5, 5.4, "DN"]] },
  { file: "flat-two-bed", title: "SECOND FLOOR FLAT", mpp: 0.009, ext: 0.3, int: 0.1, walls: "black", tint: true, speckle: 400,
    rooms: [R("Bedroom 1", 0, 0, 3.6, 3.6), R("Bedroom 2", 0, 3.6, 3.6, 6.6), R("Hall", 3.6, 0, 4.8, 6.6), R("Bathroom", 4.8, 0, 7, 2.4), R("Kitchen", 7, 0, 9.6, 2.4), R("Living Room", 4.8, 2.4, 9.6, 6.6)],
    doors: [[4.2, 0, 0.9, "a", "+"], [3.6, 2.6, 0.76, "b", "-"], [3.6, 4.4, 0.76, "a", "-"], [4.8, 1.4, 0.7, "a", "+"], [4.8, 4.4, 0.8, "b", "+"], [8.3, 2.4, 0.9, "", "", "passage"]],
    windows: [[0, 1.8, 1.2], [0, 5.1, 1.2], [6.5, 6.6, 1.8], [8.6, 6.6, 1.2], [9.6, 1.2, 1]] },
  { file: "bungalow", title: "BUNGALOW", mpp: 0.0085, ext: 0.3, int: 0.1, walls: "dark", blur: true, dims: true,
    rooms: [R("Living Room", 0, 0, 4.6, 4.6), R("Kitchen", 0, 4.6, 4.6, 8.4), P("Hall", [[4.6, 0], [6.2, 0], [6.2, 3.4], [12, 3.4], [12, 4.6], [4.6, 4.6]], { box: [4.6, 0, 6.2, 3.4] }),
      R("Bedroom 1", 6.2, 0, 9.4, 3.4), R("Bedroom 3", 9.4, 0, 12, 3.4), R("Bedroom 2", 4.6, 4.6, 9.4, 8.4), R("Bathroom", 9.4, 4.6, 12, 8.4)],
    doors: [[5.4, 0, 0.9, "a", "+"], [4.6, 2, 0.8, "a", "-"], [7, 4.6, 0.76, "a", "+"], [10.6, 4.6, 0.7, "b", "+"], [8.6, 3.4, 0.76, "b", "-"], [10.2, 3.4, 0.76, "a", "-"], [3.4, 4.6, 0.8, "b", "+"], [0, 7.4, 0.9, "b", "+"]],
    windows: [[2.3, 0, 2], [0, 2.3, 1], [7.8, 0, 1.4], [10.7, 0, 1.2], [12, 4, 0.6], [7.8, 8.4, 1.4], [10.7, 8.4, 0.8], [2.3, 8.4, 1.6]] },
  { file: "detached-l", title: "GROUND FLOOR", mpp: 0.0075, ext: 0.35, int: 0.12, walls: "black", dims: true,
    rooms: [R("Lounge", 0, 0, 4.4, 4), R("Hall", 4.4, 0, 6.2, 4), R("Study", 6.2, 0, 9, 4), R("Utility", 6.2, 4, 9, 6.4),
      P("Kitchen Diner", [[0, 4], [6.2, 4], [6.2, 6.4], [4.4, 6.4], [4.4, 10.4], [0, 10.4]], { box: [0, 6.4, 4.4, 10.4] })],
    doors: [[5.3, 0, 0.9, "a", "+"], [5.3, 4, 0.8, "b", "+"], [6.2, 3, 0.76, "b", "+"], [4.4, 3, 0.8, "b", "-"], [6.2, 5.2, 0.76, "a", "+"], [9, 5.2, 0.9, "b", "-"]],
    windows: [[2.2, 0, 1.8], [7.6, 0, 1.2], [0, 8, 1.2], [2.2, 10.4, 1.6], [7.6, 6.4, 0.9], [0, 2, 1.2], [4.4, 8.4, 1.8]] },
  { file: "studio-flat", title: "STUDIO FLAT", mpp: 0.006, ext: 0.25, int: 0.075, walls: "mid",
    rooms: [R("Living Room", 0, 0, 5.2, 4.8, { kitchen: true }), R("Shower Room", 0, 4.8, 2.2, 6.6), R("Hall", 2.2, 4.8, 5.2, 6.6)],
    doors: [[4.4, 6.6, 0.9, "b", "-"], [3.7, 4.8, 0.8, "b", "-"], [2.2, 5.7, 0.7, "a", "-"]],
    windows: [[1.6, 0, 1.4], [3.9, 0, 1.4], [5.2, 2.4, 1]] },
  { file: "cottage", title: "GROUND FLOOR", mpp: 0.008, ext: 0.5, int: 0.15, walls: "black",
    rooms: [R("Sitting Room", 0, 0, 4.2, 4.6), R("Kitchen", 4.2, 0, 7.6, 4.6), R("Utility", 0, 4.6, 3.2, 6.8, { ext: 0.25 }), R("Bathroom", 3.2, 4.6, 7.6, 6.8, { ext: 0.25 })],
    doors: [[5.2, 0, 0.85, "a", "+"], [4.2, 3.4, 0.75, "b", "-"], [5, 4.6, 0.7, "a", "+"], [1.6, 4.6, 0.75, "a", "+"], [0, 5.7, 0.85, "a", "+"]],
    windows: [[2.1, 0, 1.2], [6.8, 0, 0.9], [0, 2.3, 1], [7.6, 2.3, 1], [5.4, 6.8, 0.6], [1.6, 6.8, 0.8]] },
  { file: "detached-first", title: "FIRST FLOOR", mpp: 0.0065, ext: 0.3, int: 0.1, walls: "outline", dims: true,
    rooms: [R("Bedroom 1", 0, 0, 4, 4.2), R("En-suite", 0, 4.2, 2.4, 5.8),
      P("Landing", [[4, 0], [5.6, 0], [5.6, 4.2], [6.6, 4.2], [6.6, 5.8], [2.4, 5.8], [2.4, 4.2], [4, 4.2]], { box: [4, 0, 5.6, 4.2] }),
      R("Bedroom 2", 5.6, 0, 9, 4.2), R("Bathroom", 6.6, 4.2, 9, 5.8), R("Bedroom 3", 0, 5.8, 4.4, 8.4), R("Bedroom 4", 4.4, 5.8, 9, 8.4)],
    doors: [[4, 3.4, 0.76, "b", "-"], [5.6, 3.4, 0.76, "b", "+"], [1.2, 4.2, 0.7, "a", "+"], [6.6, 5, 0.7, "a", "+"], [3.2, 5.8, 0.76, "a", "+"], [5.6, 5.8, 0.76, "b", "+"]],
    windows: [[2, 0, 1.6], [4.8, 0, 0.8], [7.3, 0, 1.6], [2.2, 8.4, 1.4], [6.7, 8.4, 1.4], [0, 5, 0.6], [9, 5, 0.6]],
    stairs: [[4.65, 0.3, 5.5, 3.8, "DN"]] },
  { file: "flat-turned", title: "FIRST FLOOR FLAT", mpp: 0.0075, ext: 0.28, int: 0.1, walls: "black", turn: 2.5, jpeg: 70,
    rooms: [R("Living Room", 0, 0, 5, 4.4), R("Kitchen", 5, 0, 7.6, 2.6), R("Hall", 5, 2.6, 7.6, 4.4), R("Bedroom", 0, 4.4, 4.2, 7.6), R("Bathroom", 4.2, 4.4, 7.6, 6.6)],
    doors: [[7.6, 3.5, 0.9, "a", "-"], [5, 3.5, 0.8, "b", "-"], [6.3, 2.6, 0.8, "", "", "passage"], [6.6, 4.4, 0.7, "b", "+"], [3.2, 4.4, 0.76, "a", "+"]],
    windows: [[2.5, 0, 2], [0, 2.2, 1.2], [6.3, 0, 1.2], [7.6, 1.3, 0.8], [0, 6, 1.2], [2.1, 7.6, 1.2], [6, 6.6, 0.6]] },
];

// ---------------------------------------------------------------- a stroke font (4 x 6 cells)
const GLYPHS = {
  A: "0,6 2,0 4,6;0.7,4 3.3,4", B: "0,6 0,0 3,0 4,0.8 4,2.2 3,3 0,3;3,3 4,3.8 4,5.2 3,6 0,6", C: "4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5",
  D: "0,0 0,6 2.5,6 4,4.5 4,1.5 2.5,0 0,0", E: "4,0 0,0 0,6 4,6;0,3 3,3", F: "4,0 0,0 0,6;0,3 3,3", G: "4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,3.5 2.5,3.5",
  H: "0,0 0,6;4,0 4,6;0,3 4,3", I: "1,0 3,0;2,0 2,6;1,6 3,6", J: "4,0 4,5 3,6 1,6 0,5", K: "0,0 0,6;4,0 0,4;1.3,3 4,6", L: "0,0 0,6 4,6",
  M: "0,6 0,0 2,3 4,0 4,6", N: "0,6 0,0 4,6 4,0", O: "1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0", P: "0,6 0,0 3,0 4,1 4,2 3,3 0,3",
  Q: "1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0;2.5,4.5 4,6", R: "0,6 0,0 3,0 4,1 4,2 3,3 0,3;2,3 4,6", S: "4,1 3,0 1,0 0,1 0,2 1,3 3,3 4,4 4,5 3,6 1,6 0,5",
  T: "0,0 4,0;2,0 2,6", U: "0,0 0,5 1,6 3,6 4,5 4,0", V: "0,0 2,6 4,0", W: "0,0 1,6 2,2 3,6 4,0", X: "0,0 4,6;4,0 0,6", Y: "0,0 2,3 4,0;2,3 2,6",
  Z: "0,0 4,0 0,6 4,6", 0: "1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0", 1: "1,1 2,0 2,6;1,6 3,6", 2: "0,1 1,0 3,0 4,1 4,2 0,6 4,6",
  3: "0,1 1,0 3,0 4,1 4,2 3,3 1.5,3;3,3 4,4 4,5 3,6 1,6 0,5", 4: "3,6 3,0 0,4 4,4", 5: "4,0 0,0 0,3 3,3 4,4 4,5 3,6 1,6 0,5",
  6: "4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,4 3,3 0,3", 7: "0,0 4,0 1.5,6", 8: "1,3 0,2 0,1 1,0 3,0 4,1 4,2 3,3 1,3 0,4 0,5 1,6 3,6 4,5 4,4 3,3",
  9: "4,3 1,3 0,2 0,1 1,0 3,0 4,1 4,5 3,6 1,6 0,5", ".": "0.4,5.6 0.6,5.6 0.6,6 0.4,6 0.4,5.6", "'": "0.5,0 0.5,1.5", '"': "0.3,0 0.3,1.5;1.2,0 1.2,1.5",
  x: "0,3 3,6;3,3 0,6", m: "0,6 0,3;0,4 0.8,3 1.5,3.4 1.5,6;1.5,4 2.3,3 3,3.4 3,6", "-": "0.5,3 3.5,3", "(": "2,0 1,1.5 1,4.5 2,6", ")": "1,0 2,1.5 2,4.5 1,6", "/": "0,6 4,0",
};
const ADVANCE = { ".": 1.6, "'": 1.6, '"': 2.2, " ": 3, x: 4, m: 4.2, "(": 3, ")": 3, I: 4.4, 1: 4.4 };
const strokes = Object.fromEntries(Object.entries(GLYPHS).map(([k, s]) => [k, s.split(";").map((l) => l.split(" ").map((p) => p.split(",").map(Number)))]));

// ---------------------------------------------------------------- drawing
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Canvas {
  constructor(w, h) {
    this.w = w * SS;
    this.h = h * SS;
    this.px = new Uint8Array(this.w * this.h).fill(255);
  }
  /** Fills a polygon (canvas pixels), darkening ("min") or painting over ("set"). */
  fill(pts, v, mode = "min", target = this.px) {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) (y0 = Math.min(y0, p[1])), (y1 = Math.max(y1, p[1]));
    y0 = Math.max(0, Math.floor(y0)), y1 = Math.min(this.h - 1, Math.ceil(y1));
    const xs = [];
    for (let y = y0; y <= y1; y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + ((sy - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const xa = Math.max(0, Math.ceil(xs[k] - 0.5)), xb = Math.min(this.w - 1, Math.floor(xs[k + 1] - 0.5));
        const row = y * this.w;
        for (let x = xa; x <= xb; x++) target[row + x] = mode === "set" ? v : Math.min(target[row + x], v);
      }
    }
  }
}

function render(plan) {
  const random = rng(plan.file.length * 7919 + plan.rooms.length);
  const turn = ((plan.turn ?? 0) * Math.PI) / 180;
  const all = plan.rooms.flatMap((r) => r.points);
  const xs = all.map((p) => p[0]), zs = all.map((p) => p[1]);
  const box = { x0: Math.min(...xs) - plan.ext, z0: Math.min(...zs) - plan.ext, x1: Math.max(...xs) + plan.ext, z1: Math.max(...zs) + plan.ext };
  const mid = [(box.x0 + box.x1) / 2, (box.z0 + box.z1) / 2];
  const rot = ([x, z]) => [Math.cos(turn) * (x - mid[0]) - Math.sin(turn) * (z - mid[1]), Math.sin(turn) * (x - mid[0]) + Math.cos(turn) * (z - mid[1])];
  const corners = [[box.x0, box.z0], [box.x1, box.z0], [box.x1, box.z1], [box.x0, box.z1]].map(rot);
  const margin = { l: 1.7, t: 2.3, r: 1.3, b: 1.7 };
  const minX = Math.min(...corners.map((c) => c[0])) - margin.l, maxX = Math.max(...corners.map((c) => c[0])) + margin.r;
  const minZ = Math.min(...corners.map((c) => c[1])) - margin.t, maxZ = Math.max(...corners.map((c) => c[1])) + margin.b;
  const W = Math.round((maxX - minX) / plan.mpp), H = Math.round((maxZ - minZ) / plan.mpp);
  /** A plan point in picture pixels. */
  const pic = (p) => {
    const [x, z] = rot(p);
    return [(x - minX) / plan.mpp, (z - minZ) / plan.mpp];
  };
  const cv = new Canvas(W, H);
  const at = (p) => pic(p).map((v) => v * SS);
  const px = plan.mpp; // one picture pixel in metres
  const poly = (pts, v, mode, target) => cv.fill(pts.map(at), v, mode, target);
  const line = (a, b, w, v = 0, target) => {
    const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1;
    const n = [(-d[1] / l) * w / 2, (d[0] / l) * w / 2];
    poly([[a[0] + n[0], a[1] + n[1]], [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]], [a[0] - n[0], a[1] - n[1]]], v, "min", target);
  };
  const path = (pts, w, v, closed = false, joints = false) => {
    for (let i = 0; i + 1 < pts.length + (closed ? 1 : 0); i++) line(pts[i], pts[(i + 1) % pts.length], w, v);
    if (joints) for (const p of pts) poly(arcPts(p, w / 2, 0, 2 * Math.PI, 8), v);
  };
  const arcPts = (c, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => [c[0] + r * Math.cos(a0 + ((a1 - a0) * i) / n), c[1] + r * Math.sin(a0 + ((a1 - a0) * i) / n)]);
  const rect = (x0, z0, x1, z1, w, v) => path([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], w, v, true);
  const circle = (c, r, w, v) => path(arcPts(c, r, 0, 2 * Math.PI, 32), w, v, true);
  // `place` puts each point of the lettering on the plan (the title stays level on a turned picture)
  const text = (s, c, h, w, v = 0, align = "center", place = (p) => p) => {
    const u = h / 6;
    const width = [...s].reduce((t, ch) => t + (ADVANCE[ch] ?? 5), 0) * u - u;
    let x = align === "center" ? c[0] - width / 2 : c[0];
    const z = c[1] - h / 2;
    for (const ch of s) {
      for (const l of strokes[ch] ?? []) path(l.map(([gx, gz]) => place([x + gx * u, z + gz * u])), w, v, false, w > 2.2 * px);
      x += (ADVANCE[ch] ?? 5) * u;
    }
  };
  const thin = 1.3 * px, grey = 90;

  // walls along every room edge: shared stretches are inside walls, the rest outside walls
  const inside = (p, r) => {
    let c = false;
    for (let i = 0, j = r.points.length - 1; i < r.points.length; j = i++) {
      const [xi, zi] = r.points[i], [xj, zj] = r.points[j];
      if (zi > p[1] !== zj > p[1] && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const walls = [];
  for (const room of plan.rooms) {
    const pts = room.points;
    const area = pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
      const out = area > 0 ? [u[1], -u[0]] : [-u[1], u[0]];
      const cuts = new Set([0, l]);
      for (const o of plan.rooms) for (const q of o.points) {
        const t = (q[0] - a[0]) * u[0] + (q[1] - a[1]) * u[1], off = (q[0] - a[0]) * u[1] - (q[1] - a[1]) * u[0];
        if (Math.abs(off) < 1e-6 && t > 1e-6 && t < l - 1e-6) cuts.add(t);
      }
      const ts = [...cuts].sort((p, q) => p - q);
      for (let k = 0; k + 1 < ts.length; k++) {
        const m = (ts[k] + ts[k + 1]) / 2, probe = [a[0] + u[0] * m + out[0] * 0.05, a[1] + u[1] * m + out[1] * 0.05];
        const exterior = !plan.rooms.some((o) => o !== room && inside(probe, o));
        walls.push({ a: [a[0] + u[0] * ts[k], a[1] + u[1] * ts[k]], b: [a[0] + u[0] * ts[k + 1], a[1] + u[1] * ts[k + 1]], u, t: exterior ? room.ext ?? plan.ext : plan.int });
      }
    }
  }
  const wallAt = (c) => walls.find((w) => {
    const t = (c[0] - w.a[0]) * w.u[0] + (c[1] - w.a[1]) * w.u[1], off = (c[0] - w.a[0]) * w.u[1] - (c[1] - w.a[1]) * w.u[0];
    return Math.abs(off) < 1e-6 && t > 0 && t < Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
  });

  // pale room tints, then furniture and stairs in grey, under the walls
  if (plan.tint) for (const r of plan.rooms) poly(r.points, 232);
  for (const r of plan.rooms) furnish(r, plan, { rect, circle, line, path, arcPts, poly, px, random });
  for (const [x0, z0, x1, z1, label] of plan.stairs ?? []) {
    rect(x0, z0, x1, z1, thin, grey);
    const along = z1 - z0 > x1 - x0;
    const n = Math.floor((along ? z1 - z0 : x1 - x0) / 0.25);
    for (let i = 1; i < n; i++) along ? line([x0, z0 + i * 0.25], [x1, z0 + i * 0.25], thin, grey) : line([x0 + i * 0.25, z0], [x0 + i * 0.25, z1], thin, grey);
    const c = [(x0 + x1) / 2, (z0 + z1) / 2], half = (along ? z1 - z0 : x1 - x0) * 0.4;
    const a = along ? [c[0], c[1] + half] : [c[0] - half, c[1]], b = along ? [c[0], c[1] - half] : [c[0] + half, c[1]];
    line(a, b, thin, 40);
    poly(along ? [[b[0] - 0.08, b[1] + 0.18], [b[0] + 0.08, b[1] + 0.18], b] : [[b[0] - 0.18, b[1] - 0.08], [b[0] - 0.18, b[1] + 0.08], b], 40);
    text(label, [c[0] + (along ? 0 : 0), c[1] + (along ? half + 0.22 : 0.25)], 0.12, thin, 40);
  }

  // the walls as one shape, with gaps for the doors and windows
  const mask = new Uint8Array(cv.w * cv.h);
  for (const w of walls) {
    const e = [w.u[0] * w.t / 2, w.u[1] * w.t / 2], n = [-w.u[1] * w.t / 2, w.u[0] * w.t / 2];
    const a = [w.a[0] - e[0], w.a[1] - e[1]], b = [w.b[0] + e[0], w.b[1] + e[1]];
    poly([[a[0] + n[0], a[1] + n[1]], [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]], [a[0] - n[0], a[1] - n[1]]], 1, "set", mask);
  }
  const openings = [];
  const gap = (c, width, kind, hinge, swing) => {
    const w = wallAt(c);
    if (!w) throw new Error(`${plan.file}: no wall at ${c}`);
    const u = w.u, n = [-u[1], u[0]], h = w.t / 2 + 0.02;
    const a = [c[0] - u[0] * width / 2, c[1] - u[1] * width / 2], b = [c[0] + u[0] * width / 2, c[1] + u[1] * width / 2];
    poly([[a[0] + n[0] * h, a[1] + n[1] * h], [b[0] + n[0] * h, b[1] + n[1] * h], [b[0] - n[0] * h, b[1] - n[1] * h], [a[0] - n[0] * h, a[1] - n[1] * h]], 0, "set", mask);
    openings.push({ kind, at: pic(c).map(r2), width });
    return { w, u, n, a, b };
  };
  const plus = (u) => (Math.abs(u[0]) > Math.abs(u[1]) ? u[0] : u[1]) > 0 ? 1 : -1;
  const symbols = [];
  for (const [x, z, width, hinge, swing, kind = "door"] of plan.doors) {
    const g = gap([x, z], width, kind);
    if (kind !== "door") continue;
    symbols.push(() => {
      // the leaf drawn open at right angles to the wall, and the arc it sweeps
      const s = plus(g.n) * (swing === "+" ? 1 : -1), side = [g.n[0] * s, g.n[1] * s], t = g.w.t / 2;
      const atA = (hinge === "a") === (plus(g.u) > 0);
      const hp = atA ? g.a : g.b, other = atA ? g.b : g.a;
      const h = [hp[0] + side[0] * t, hp[1] + side[1] * t], o = [other[0] + side[0] * t, other[1] + side[1] * t];
      const tip = [h[0] + side[0] * width, h[1] + side[1] * width];
      line(h, tip, 1.8 * px, 30);
      const a0 = Math.atan2(tip[1] - h[1], tip[0] - h[0]), a1 = Math.atan2(o[1] - h[1], o[0] - h[0]);
      let da = a1 - a0;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      path(arcPts(h, width, a0, a0 + da), thin, 60);
    });
  }
  for (const [x, z, width] of plan.windows) {
    const g = gap([x, z], width, "window");
    symbols.push(() => {
      const t = g.w.t / 2;
      for (const k of [-1, -0.12, 0.12, 1]) line([g.a[0] + g.n[0] * t * k, g.a[1] + g.n[1] * t * k], [g.b[0] + g.n[0] * t * k, g.b[1] + g.n[1] * t * k], thin, 20);
      for (const e of [g.a, g.b]) line([e[0] + g.n[0] * t, e[1] + g.n[1] * t], [e[0] - g.n[0] * t, e[1] - g.n[1] * t], thin, 20);
    });
  }
  const fill = { black: 0, dark: 64, mid: 105, outline: 165 }[plan.walls];
  for (let i = 0; i < mask.length; i++) if (mask[i]) cv.px[i] = Math.min(cv.px[i], fill);
  if (plan.walls === "outline") {
    // a dark edge round the grey walls: wall pixels with a gap within k pixels
    const k = Math.round(1.6 * SS), near = new Uint8Array(mask.length);
    for (let y = 0; y < cv.h; y++) for (let x = 0, run = -1e9; x < cv.w; x++) {
      if (!mask[y * cv.w + x]) run = x;
      if (x - run <= k) near[y * cv.w + x] = 1;
    }
    for (let y = 0; y < cv.h; y++) for (let x = cv.w - 1, run = 1e9; x >= 0; x--) {
      if (!mask[y * cv.w + x]) run = x;
      if (run - x <= k) near[y * cv.w + x] = 1;
    }
    for (let x = 0; x < cv.w; x++) for (let y = 0, run = -1e9; y < cv.h; y++) {
      if (!mask[y * cv.w + x]) run = y;
      if (y - run <= k) near[y * cv.w + x] = 1;
    }
    for (let x = 0; x < cv.w; x++) for (let y = cv.h - 1, run = 1e9; y >= 0; y--) {
      if (!mask[y * cv.w + x]) run = y;
      if (run - y <= k) near[y * cv.w + x] = 1;
    }
    for (let i = 0; i < mask.length; i++) if (mask[i] && near[i]) cv.px[i] = 10;
  }
  for (const s of symbols) s();

  // names and sizes, dimension lines, the title and the small print
  const nameH = 0.2 + random() * 0.08, sizeH = nameH * 0.62, ft = (m) => `${Math.floor(m / 0.3048)}'${Math.round((m / 0.3048 - Math.floor(m / 0.3048)) * 12) % 12}"`;
  let total = 0;
  for (const r of plan.rooms) {
    const [x0, z0, x1, z1] = r.box ?? [Math.min(...r.points.map((p) => p[0])), Math.min(...r.points.map((p) => p[1])), Math.max(...r.points.map((p) => p[0])), Math.max(...r.points.map((p) => p[1]))];
    const iw = x1 - x0 - plan.int, id = z1 - z0 - plan.int;
    total += iw * id;
    const c = [(x0 + x1) / 2, (z0 + z1) / 2 - 0.25];
    const name = r.name.toUpperCase();
    const h = Math.min(nameH, (iw - 0.3) / (name.length * 0.85));
    text(name, c, h, h * 0.11, 0);
    if (iw > 1.9 && id > 1.6) {
      const sh = Math.min(sizeH, (iw - 0.3) / 12);
      text(`${iw.toFixed(2)}m x ${id.toFixed(2)}m`, [c[0], c[1] + h * 0.9 + sh], sh, sh * 0.1, 30);
      text(`(${ft(iw)} x ${ft(id)})`, [c[0], c[1] + h * 0.9 + sh * 2.6], sh, sh * 0.1, 30);
    }
  }
  if (plan.dims) {
    // along the top and the left side, ticked at every room boundary
    const top = box.z0 - 0.7, left = box.x0 - 0.7;
    // ticked along the main front wall (a bay stands out from it)
    const front = Math.min(...plan.rooms.map((r) => (r.box ? r.box[1] : Math.min(...r.points.map((p) => p[1])))));
    const xt = [...new Set(plan.rooms.flatMap((r) => r.points).filter((p) => Math.abs(p[1] - front) < 1e-6).map((p) => p[0]))].sort((a, b) => a - b);
    const zt = [...new Set(plan.rooms.flatMap((r) => r.points).filter((p) => Math.abs(p[0] - Math.min(...xs)) < 1e-6).map((p) => p[1]))].sort((a, b) => a - b);
    line([xt[0], top], [xt.at(-1), top], thin, 40);
    line([left, zt[0]], [left, zt.at(-1)], thin, 40);
    xt.forEach((x, i) => {
      line([x - 0.06, top + 0.06], [x + 0.06, top - 0.06], thin * 1.4, 40);
      if (i) text(`${(x - xt[i - 1]).toFixed(2)}m`, [(x + xt[i - 1]) / 2, top - 0.18], 0.13, thin, 40);
    });
    zt.forEach((z, i) => {
      line([left - 0.06, z + 0.06], [left + 0.06, z - 0.06], thin * 1.4, 40);
      if (i) text(`${(z - zt[i - 1]).toFixed(2)}m`, [left - 0.62, (z + zt[i - 1]) / 2], 0.13, thin, 40, "left");
    });
  }
  // title and small print sit level on the picture, whatever the turn
  const unrot = ([x, z]) => [mid[0] + Math.cos(-turn) * x - Math.sin(-turn) * z, mid[1] + Math.sin(-turn) * x + Math.cos(-turn) * z];
  const level = (s, x, z, h, w, v, align) => text(s, [x, z], h, w, v, align, unrot);
  level(plan.title, minX + 0.4, minZ + 0.6, 0.36, 0.05, 0, "left");
  level(`APPROX. GROSS INTERNAL AREA ${total.toFixed(1)} SQ M (${Math.round(total * 10.764)} SQ FT)`, (minX + maxX) / 2, maxZ - 0.9, 0.14, thin, 40, "center");
  level("FOR ILLUSTRATION ONLY. NOT TO SCALE.", (minX + maxX) / 2, maxZ - 0.55, 0.12, thin, 40, "center");
  // a north arrow in the top right corner
  const nc = unrot([maxX - 0.7, minZ + 0.8]);
  circle(nc, 0.32, thin, 30);
  poly([[nc[0], nc[1] - 0.3], [nc[0] + 0.1, nc[1] + 0.05], [nc[0] - 0.1, nc[1] + 0.05]], 20);
  text("N", [nc[0], nc[1] - 0.5], 0.14, thin * 1.3, 20);

  // averaged down to the picture's pixels, then printed and scanned a little
  let g = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0;
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) s += cv.px[(y * SS + j) * cv.w + x * SS + i];
    g[y * W + x] = Math.round(s / (SS * SS));
  }
  if (plan.blur) g = blur(g, W, H);
  for (let i = 0; i < (plan.speckle ?? 0); i++) {
    const x = Math.floor(random() * (W - 2)), y = Math.floor(random() * (H - 2)), v = Math.floor(random() * 120);
    g[y * W + x] = v;
    if (random() < 0.5) g[y * W + x + 1] = v;
  }
  if (plan.jpeg) g = jpegish(g, W, H, plan.jpeg);
  writeFileSync(new URL(`${plan.file}.png`, DIR), png(g, W, H));
  const truth = {
    picture: `${plan.file}.png`, width: W, height: H, scale: plan.mpp,
    rooms: plan.rooms.map((r) => ({ name: r.name, points: r.points.map((p) => pic(p).map(r2)) })),
    openings,
  };
  // one room or opening a line
  const list = (items) => items.map((it) => `  ${JSON.stringify(it)}`).join(",\n");
  const head = JSON.stringify({ picture: truth.picture, width: W, height: H, scale: plan.mpp }).slice(1, -1);
  writeFileSync(new URL(`${plan.file}.json`, DIR), `{${head},\n "rooms": [\n${list(truth.rooms)}\n ],\n "openings": [\n${list(openings)}\n ]\n}\n`);
  return `${plan.file}: ${W}x${H}, ${plan.rooms.length} rooms`;
}

const r2 = (v) => Math.round(v * 100) / 100;

/** Furniture in grey outlines, by what the room is called, against walls away from the doors. */
function furnish(room, plan, d) {
  const [bx0, bz0, bx1, bz1] = room.box ?? [room.points[0][0], room.points[0][1], room.points[2][0], room.points[2][1]];
  const m = plan.int / 2 + 0.12;
  const x0 = bx0 + m, z0 = bz0 + m, x1 = bx1 - m, z1 = bz1 - m;
  const w = d.px * 1.2, v = 110;
  const n = room.name.toLowerCase();
  const doorNear = (x, z, r) => plan.doors.some(([dx, dz, dw]) => Math.hypot(dx - x, dz - z) < r + dw);
  if (n.startsWith("bedroom")) {
    const bw = x1 - x0 > 3 ? 1.5 : 0.95, bl = 2;
    // headboard against the top wall, or the bottom one if a door is in the way
    const cx = (x0 + x1) / 2, top = !doorNear(cx, z0, bl * 0.6);
    const zs = top ? z0 : z1 - bl;
    d.rect(cx - bw / 2, zs, cx + bw / 2, zs + bl, w, v);
    const pz = top ? zs + 0.08 : zs + bl - 0.38;
    if (bw > 1) (d.rect(cx - bw / 2 + 0.1, pz, cx - 0.05, pz + 0.3, w, v), d.rect(cx + 0.05, pz, cx + bw / 2 - 0.1, pz + 0.3, w, v));
    else d.rect(cx - bw / 2 + 0.1, pz, cx + bw / 2 - 0.1, pz + 0.3, w, v);
    d.line([cx - bw / 2, top ? zs + 0.6 : zs + bl - 0.6], [cx + bw / 2, top ? zs + 0.6 : zs + bl - 0.6], w, v);
  } else if (n.startsWith("living") || n === "lounge" || n.startsWith("sitting") || n.startsWith("family")) {
    const cx = (x0 + x1) / 2;
    if (room.kitchen) {
      d.rect(x0, z1 - 0.6, x1 - 1.4, z1, w, v);
      for (const k of [0, 1]) for (const j of [0, 1]) d.circle([x0 + 0.6 + k * 0.3, z1 - 0.45 + j * 0.3], 0.1, w, v);
      d.rect(x0 + 1.4, z1 - 0.5, x0 + 2, z1 - 0.1, w, v);
    }
    d.rect(cx - 1, z0 + 0.1, cx + 1, z0 + 0.95, w, v);
    d.rect(cx - 1, z0 + 0.1, cx + 1, z0 + 0.3, w, v);
    d.rect(cx - 0.5, z0 + 1.4, cx + 0.5, z0 + 1.9, w, v);
    if (x1 - x0 > 3.4) d.rect(x1 - 0.95, (z0 + z1) / 2 - 0.4, x1 - 0.1, (z0 + z1) / 2 + 0.4, w, v);
  } else if (n.startsWith("dining")) {
    const c = [(x0 + x1) / 2, (z0 + z1) / 2];
    d.rect(c[0] - 0.8, c[1] - 0.45, c[0] + 0.8, c[1] + 0.45, w, v);
    for (const k of [-0.45, 0.45]) for (const s of [-1, 1]) d.rect(c[0] + k - 0.22, c[1] + s * 0.55 - 0.2, c[0] + k + 0.22, c[1] + s * 0.55 + 0.2, w, v);
  } else if (n.startsWith("kitchen")) {
    // worktops along two walls, a hob and a sink
    d.rect(x0, z0, x1, z0 + 0.6, w, v);
    d.rect(x0, z0 + 0.6, x0 + 0.6, z1 - 0.3, w, v);
    for (const k of [0, 1]) for (const j of [0, 1]) d.circle([x0 + 1 + k * 0.3, z0 + 0.15 + j * 0.3], 0.1, w, v);
    d.rect(x0 + 0.1, z0 + 1.2, x0 + 0.5, z0 + 1.8, w, v);
    d.circle([x0 + 0.3, z0 + 1.5], 0.04, w, v);
  } else if (n.startsWith("bathroom") || n.startsWith("en-suite") || n.startsWith("shower")) {
    if (n.startsWith("bathroom")) {
      d.rect(x0, z1 - 0.72, Math.min(x1, x0 + 1.7), z1, w, v);
      d.rect(x0 + 0.08, z1 - 0.64, Math.min(x1, x0 + 1.7) - 0.08, z1 - 0.08, w, v);
    } else {
      d.rect(x0, z1 - 0.9, x0 + 0.9, z1, w, v);
      d.line([x0, z1 - 0.9], [x0 + 0.9, z1], w, v);
      d.line([x0 + 0.9, z1 - 0.9], [x0, z1], w, v);
    }
    d.rect(x1 - 0.5, z0, x1 - 0.1, z0 + 0.2, w, v);
    d.path(d.arcPts([x1 - 0.3, z0 + 0.42], 0.2, 0, 2 * Math.PI, 20).map(([x, z]) => [x, z0 + 0.42 + (z - z0 - 0.42) * 1.2]), w, v, true);
    d.path(d.arcPts([x0 + 0.35, z0 + 0.3], 0.25, 0, 2 * Math.PI, 20).map(([x, z]) => [x, z0 + 0.25 + (z - z0 - 0.3) * 0.7]), w, v, true);
  } else if (n === "utility") {
    d.rect(x0, z0, x1, z0 + 0.6, w, v);
    d.rect(x0 + 0.1, z0 + 0.05, x0 + 0.6, z0 + 0.55, w, v);
    d.circle([x0 + 0.35, z0 + 0.3], 0.18, w, v);
  } else if (n === "study") {
    d.rect(x0, z0, x0 + 1.4, z0 + 0.7, w, v);
    d.circle([x0 + 0.7, z0 + 1], 0.25, w, v);
  }
}

function blur(g, w, h) {
  const t = new Uint8Array(g.length), o = new Uint8Array(g.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    t[i] = (g[i - (x > 0 ? 1 : 0)] + 2 * g[i] + g[i + (x < w - 1 ? 1 : 0)] + 2) >> 2;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    o[i] = (t[i - (y > 0 ? w : 0)] + 2 * t[i] + t[i + (y < h - 1 ? w : 0)] + 2) >> 2;
  }
  return o;
}

/** What saving as a JPEG does to a picture: each 8 x 8 block's frequencies rounded to steps. */
function jpegish(g, w, h, quality) {
  const Q = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99];
  const s = quality < 50 ? 5000 / quality : 200 - 2 * quality;
  const q = Q.map((v) => Math.max(1, Math.floor((v * s + 50) / 100)));
  const C = Array.from({ length: 64 }, (_, k) => {
    const u = k >> 3, x = k & 7;
    return (u ? 0.5 : Math.SQRT1_2 / 2) * Math.cos(((2 * x + 1) * u * Math.PI) / 16);
  });
  const out = new Uint8Array(g);
  const b = new Float64Array(64), f = new Float64Array(64), t = new Float64Array(64);
  for (let by = 0; by + 8 <= h; by += 8) for (let bx = 0; bx + 8 <= w; bx += 8) {
    let flat = true;
    for (let k = 0; k < 64; k++) (b[k] = g[(by + (k >> 3)) * w + bx + (k & 7)] - 128), (flat &&= b[k] === b[0]);
    if (flat) continue;
    for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) {
      let a = 0;
      for (let x = 0; x < 8; x++) a += C[u * 8 + x] * b[v * 8 + x];
      t[v * 8 + u] = a;
    }
    for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) {
      let a = 0;
      for (let y = 0; y < 8; y++) a += C[v * 8 + y] * t[y * 8 + u];
      f[v * 8 + u] = Math.round(a / q[v * 8 + u]) * q[v * 8 + u];
    }
    for (let y = 0; y < 8; y++) for (let u = 0; u < 8; u++) {
      let a = 0;
      for (let v = 0; v < 8; v++) a += C[v * 8 + y] * f[v * 8 + u];
      t[y * 8 + u] = a;
    }
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      let a = 0;
      for (let u = 0; u < 8; u++) a += C[u * 8 + x] * t[y * 8 + u];
      out[(by + y) * w + bx + x] = Math.max(0, Math.min(255, Math.round(a + 128)));
    }
  }
  return out;
}

/** An 8-bit grey PNG; each row filtered whichever way packs smallest. */
function png(g, w, h) {
  const raw = new Uint8Array((w + 1) * h), row = new Uint8Array(w);
  for (let y = 0; y < h; y++) {
    let best = null, bestSum = Infinity, bestType = 0;
    for (let type = 0; type < 5; type++) {
      let sum = 0;
      for (let x = 0; x < w; x++) {
        const v = g[y * w + x], a = x ? g[y * w + x - 1] : 0, b = y ? g[(y - 1) * w + x] : 0, c = x && y ? g[(y - 1) * w + x - 1] : 0;
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][type];
        row[x] = (v - pred) & 255;
        sum += row[x] < 128 ? row[x] : 256 - row[x];
      }
      if (sum < bestSum) (bestSum = sum), (bestType = type), (best = row.slice());
    }
    raw[y * (w + 1)] = bestType;
    raw.set(best, y * (w + 1) + 1);
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, "latin1");
    Buffer.from(data).copy(out, 8);
    let c = 0xffffffff;
    for (let i = 4; i < 8 + data.length; i++) c = crcTable[(c ^ out[i]) & 255] ^ (c >>> 8);
    out.writeUInt32BE((c ^ 0xffffffff) >>> 0, 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 0, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", new Uint8Array(0))]);
}

const only = process.argv[2];
for (const plan of PLANS) if (!only || plan.file === only) console.log(render(plan));
