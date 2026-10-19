// The pieces procedural textures are drawn with (scene/textures.ts, scene/paving-tex.ts): seeded
// random numbers, hashes, and value, fractal and cellular noise that tile seamlessly over 0..1.

export type RGB = [number, number, number];
/** A recipe returns colour (0..1, sRGB for full-colour recipes, linear for detail ones) and height. */
export type Pixel = (u: number, v: number) => [number, number, number, number];
export interface Recipe {
  /** Detail map: multiplies the surface colour (stored linear). */
  detail: boolean;
  make: (rnd: () => number) => Pixel;
}

// ---------------------------------------------------------------------------- helpers

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer hash to 0..1 (cell colours, plank variation). */
export function hash(a: number, b = 0, c = 0): number {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const frac = (x: number) => x - Math.floor(x);
export const mod = (a: number, n: number) => ((a % n) + n) % n;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixc = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
export const hex = (h: number): RGB => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
/** 0 inside a groove of width w at the edges of a 0..1 cell, 1 elsewhere, softened. */
export const groove = (t: number, w: number) => clamp01(Math.min(t, 1 - t) / w);

/** Tileable value noise with cx x cy cells over the tile. */
export function noise(cx: number, cy: number, rnd: () => number): (u: number, v: number) => number {
  const g = new Float32Array(cx * cy);
  for (let i = 0; i < g.length; i++) g[i] = rnd();
  return (u, v) => {
    const x = frac(u) * cx, y = frac(v) * cy;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = smooth(x - x0), fy = smooth(y - y0);
    const x1 = (x0 + 1) % cx, y1 = (y0 + 1) % cy;
    const a = g[y0 * cx + x0], b = g[y0 * cx + x1], c = g[y1 * cx + x0], d = g[y1 * cx + x1];
    return mix(mix(a, b, fx), mix(c, d, fx), fy);
  };
}

/** Fractal noise: octaves of value noise, 0..1. */
export function fbm(cx: number, cy: number, octaves: number, rnd: () => number): (u: number, v: number) => number {
  const layers = Array.from({ length: octaves }, (_, i) => noise(cx << i, cy << i, rnd));
  return (u, v) => {
    let s = 0, amp = 0.5, norm = 0;
    for (const n of layers) {
      s += n(u, v) * amp;
      norm += amp;
      amp *= 0.5;
    }
    return s / norm;
  };
}

/** Tileable cellular noise over n x n jittered cells: nearest and second-nearest distances, cell id. */
export function cells(n: number, rnd: () => number, jitter = 0.8): (u: number, v: number) => [number, number, number] {
  const pts = new Float32Array(n * n * 2);
  for (let i = 0; i < n * n; i++) {
    pts[i * 2] = 0.5 + (rnd() - 0.5) * jitter;
    pts[i * 2 + 1] = 0.5 + (rnd() - 0.5) * jitter;
  }
  return (u, v) => {
    const x = frac(u) * n, y = frac(v) * n;
    const cx = Math.floor(x), cy = Math.floor(y);
    let d1 = 9, d2 = 9, id = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const gx = cx + dx, gy = cy + dy;
        const k = mod(gy, n) * n + mod(gx, n);
        const px = gx + pts[k * 2], py = gy + pts[k * 2 + 1];
        const ex = px - x, ey = py - y;
        const d = Math.sqrt(ex * ex + ey * ey);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          id = k;
        } else if (d < d2) d2 = d;
      }
    }
    return [d1, d2, id];
  };
}
