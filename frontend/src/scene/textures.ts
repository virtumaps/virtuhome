// Procedural textures for the realistic look: wood planks, tiles, brick, wallpaper, grass...
// Drawn pixel by pixel into canvases (nothing to download), each tiling seamlessly, with a normal
// map from the recipe's height. Tintable recipes are detail maps (linear multipliers around 1)
// that the surface's own colour shows through; the others carry their colours.
import { CanvasTexture, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

export interface TexturePair {
  map: Texture;
  normal: Texture | null;
}

type RGB = [number, number, number];
/** A recipe returns colour (0..1, sRGB for full-colour recipes, linear for detail ones) and height. */
type Pixel = (u: number, v: number) => [number, number, number, number];
interface Recipe {
  /** Detail map: multiplies the surface colour (stored linear). */
  detail: boolean;
  make: (rnd: () => number) => Pixel;
}

// ---------------------------------------------------------------------------- helpers

function rng(seed: number): () => number {
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
function hash(a: number, b = 0, c = 0): number {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const frac = (x: number) => x - Math.floor(x);
const mod = (a: number, n: number) => ((a % n) + n) % n;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixc = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const hex = (h: number): RGB => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
/** 0 inside a groove of width w at the edges of a 0..1 cell, 1 elsewhere, softened. */
const groove = (t: number, w: number) => clamp01(Math.min(t, 1 - t) / w);

/** Tileable value noise with cx x cy cells over the tile. */
function noise(cx: number, cy: number, rnd: () => number): (u: number, v: number) => number {
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
function fbm(cx: number, cy: number, octaves: number, rnd: () => number): (u: number, v: number) => number {
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
function cells(n: number, rnd: () => number, jitter = 0.8): (u: number, v: number) => [number, number, number] {
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
        const d = Math.hypot(px - x, py - y);
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

// ---------------------------------------------------------------------------- recipe makers

/** Wood boards: rows of planks along u, staggered, with grain and dark joints. */
function planks(rows: number, perRow: number, tones: number[], vary: number, gapDark = 0.45, detail = false): Recipe {
  return {
    detail,
    make: (rnd) => {
      const grain = fbm(3, 48, 3, rnd);
      const knots = noise(6, 24, rnd);
      const offsets = Array.from({ length: rows }, () => rnd());
      const cols = tones.map(hex);
      return (u, v) => {
        const r = Math.floor(v * rows);
        const lv = frac(v * rows);
        const uu = u * perRow + offsets[r % rows] * perRow;
        const k = Math.floor(uu);
        const lu = frac(uu);
        const id = hash(r, mod(k, perRow), 7);
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const g = grain(u + id, v);
        const kn = knots(u + id * 0.37, v);
        const shade = 1 + (id - 0.5) * vary + (g - 0.5) * 0.35 - Math.max(0, kn - 0.8) * 0.8;
        const joint = Math.min(groove(lv, 0.02), groove(lu, 0.004 * perRow));
        const f = shade * mix(gapDark, 1, joint);
        return [base[0] * f, base[1] * f, base[2] * f, 0.4 + 0.6 * joint - (1 - g) * 0.05];
      };
    },
  };
}

/** Square tiles with grout; optional second colour as a checkerboard. */
function tiles(n: number, a: number, b: number | null, groutCol: number, grout = 0.035, vary = 0.06): Recipe {
  return {
    detail: false,
    make: (rnd) => {
      const fine = fbm(16, 16, 3, rnd);
      const ca = hex(a), cb = b === null ? ca : hex(b), cg = hex(groutCol);
      return (u, v) => {
        const x = u * n, y = v * n;
        const ix = Math.floor(x), iy = Math.floor(y);
        const lx = frac(x), ly = frac(y);
        const g = Math.min(groove(lx, grout), groove(ly, grout));
        const base = (ix + iy) % 2 === 0 ? ca : cb;
        const s = 1 + (hash(mod(ix, n), mod(iy, n), 3) - 0.5) * vary + (fine(u, v) - 0.5) * 0.06;
        const c = mixc(cg, [base[0] * s, base[1] * s, base[2] * s], g);
        return [c[0], c[1], c[2], g * 0.9 + 0.1];
      };
    },
  };
}

/** Bricks in running bond: m bricks per course, n courses per tile. */
function bricks(m: number, n: number, tones: number[], mortarCol: number, painted = false): Recipe {
  return {
    detail: painted,
    make: (rnd) => {
      const speck = fbm(64, 64, 2, rnd);
      const blotch = fbm(4, 4, 3, rnd);
      const cols = tones.map(hex);
      const mc = hex(mortarCol);
      return (u, v) => {
        const c = Math.floor(v * n);
        const lv = frac(v * n);
        const x = u * m + (c % 2) * 0.5;
        const b = Math.floor(x);
        const lu = frac(x);
        const id = hash(mod(b, m), mod(c, n), 11);
        const edge = Math.min(groove(lu, 0.045), groove(lv, 0.14));
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const s = 0.88 + id * 0.18 + (speck(u, v) - 0.5) * 0.3 + (blotch(u, v) - 0.5) * 0.15;
        const brick: RGB = painted ? [0.96 + (speck(u, v) - 0.5) * 0.08, 0.96, 0.95] : [base[0] * s, base[1] * s, base[2] * s];
        const mortar: RGB = painted ? [0.86, 0.86, 0.85] : [mc[0] * (0.9 + speck(u, v) * 0.2), mc[1] * (0.9 + speck(u, v) * 0.2), mc[2] * (0.9 + speck(u, v) * 0.2)];
        const col = mixc(mortar, brick, smooth(edge));
        return [col[0], col[1], col[2], 0.25 + 0.75 * smooth(edge) - speck(u, v) * 0.08];
      };
    },
  };
}

/** Boards with grooves along u (horizontal cladding) or v (vertical). */
function boards(count: number, vertical: boolean, tones: number[], detail: boolean): Recipe {
  return {
    detail,
    make: (rnd) => {
      const grain = vertical ? fbm(48, 3, 3, rnd) : fbm(3, 48, 3, rnd);
      const cols = tones.map(hex);
      return (u, v) => {
        const t = vertical ? u : v;
        const along = vertical ? v : u;
        const k = Math.floor(t * count);
        const l = frac(t * count);
        const id = hash(mod(k, count), 0, 5);
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const g = groove(l, 0.06);
        // the lower edge of each board casts a shadow on the next
        const lap = vertical ? 1 : 0.82 + 0.18 * smooth(clamp01(l / 0.25));
        const s = (0.92 + id * 0.12 + (grain(u, v) - 0.5) * (detail ? 0.12 : 0.3)) * lap * mix(0.45, 1, g);
        void along;
        return [base[0] * s, base[1] * s, base[2] * s, g * (vertical ? 1 : 0.6 + 0.4 * l)];
      };
    },
  };
}

/** Plain surfaces with a little irregularity (paint, render, concrete). */
function grainy(amount: number, scale: number, speckle = 0, detail = true): Recipe {
  return {
    detail,
    make: (rnd) => {
      const n = fbm(scale, scale, 4, rnd);
      const s = fbm(128, 128, 1, rnd);
      return (u, v) => {
        const a = n(u, v), b = s(u, v);
        const f = 1 - amount * 0.5 + (a - 0.5) * amount - Math.max(0, b - 0.7) * speckle;
        return [f, f, f, a * 0.6 + b * (speckle ? 0.8 : 0.2)];
      };
    },
  };
}

/** Fabric weaves: two crossing thread directions. */
function weave(threads: number, contrast: number, slub = 0): Recipe {
  return {
    detail: true,
    make: (rnd) => {
      const n = fbm(8, 8, 3, rnd);
      const sl = fbm(4, threads, 2, rnd);
      return (u, v) => {
        const a = Math.sin(u * threads * Math.PI * 2), b = Math.sin(v * threads * Math.PI * 2);
        const over = (Math.floor(u * threads) + Math.floor(v * threads)) % 2 === 0;
        const t = over ? Math.abs(a) : Math.abs(b);
        const f = 0.9 + t * contrast - contrast * 0.5 + (n(u, v) - 0.5) * 0.08 + (sl(u, v) - 0.5) * slub;
        return [f, f, f, t];
      };
    },
  };
}

/**
 * Roof tiles and slates in courses up the slope: each course's lower edge stands proud and shades
 * the course under it; `stagger` breaks the joints (plain tiles, slates), `rolls` gives each tile a
 * curved profile (interlocking tiles, pantiles' S when `wave`).
 */
function roofTiles(o: {
  courses: number; perCourse: number; stagger: boolean; rolls: number; roll: number; vary: number; detail: boolean;
  tones?: number[]; camber?: number; wave?: boolean; step?: number;
}): Recipe {
  return {
    detail: o.detail,
    make: (rnd) => {
      const fine = fbm(48, 48, 2, rnd);
      const blotch = fbm(5, 5, 3, rnd);
      const cols = (o.tones ?? [0xffffff]).map(hex);
      const step = o.step ?? 0.55;
      return (u, v) => {
        const c = Math.floor(v * o.courses);
        const lv = frac(v * o.courses);
        const x = u * o.perCourse + (o.stagger && c % 2 ? 0.5 : 0);
        const t = Math.floor(x);
        const lu = frac(x);
        const id = hash(mod(t, o.perCourse), mod(c, o.courses), 21);
        // the tile thins from its lower edge (lv 0) up under the next course; just under that edge it is in shadow
        let h = 1 - lv * step;
        let shade = mix(0.6, 1, smooth(clamp01((1 - lv) / 0.14))) * mix(0.82, 1, smooth(clamp01(lv / 0.25)));
        if (o.rolls) {
          const a = o.wave ? Math.sin(lu * Math.PI * 2) * 0.5 + 0.5 * Math.sin(lu * Math.PI) : Math.sin(lu * Math.PI * o.rolls);
          h += a * o.roll * 0.4;
          shade *= 0.9 + a * o.roll * 0.25;
        }
        if (o.camber) h += Math.sin(lu * Math.PI) * o.camber;
        const joint = groove(lu, o.rolls ? 0.02 : 0.035);
        shade *= mix(0.55, 1, joint);
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const k = shade * (1 + (id - 0.5) * o.vary + (fine(u, v) - 0.5) * 0.1 + (blotch(u, v) - 0.5) * 0.08);
        return [base[0] * k, base[1] * k, base[2] * k, clamp01(h * 0.8 * joint + (fine(u, v) - 0.5) * 0.05)];
      };
    },
  };
}

// ---------------------------------------------------------------------------- recipes

const RECIPES: Record<string, Recipe> = {
  // floors
  planks_light: planks(13, 2, [0xdcc09a, 0xd4b48a, 0xe2c8a4, 0xcfae84], 0.12),
  planks_oak: planks(13, 2, [0xc9a072, 0xbf9466, 0xd2aa7c, 0xb98c5c], 0.14),
  planks_walnut: planks(13, 2, [0x7b5a41, 0x6e4f38, 0x86634a, 0x5f4330], 0.16),
  planks_grey: planks(13, 2, [0xb8b2aa, 0xaea79e, 0xc2bcb4, 0xa59e95], 0.1),
  vinyl: planks(8, 2, [0xffffff], 0.05, 0.75, true),
  herringbone: {
    detail: false,
    make: (rnd) => {
      const grain = fbm(4, 64, 3, rnd);
      const cols = [0xc49c6e, 0xb88f60, 0xcfa87a, 0xae8556].map(hex);
      const k = 4, cellsPer = 16;
      return (u, v) => {
        const x = u * cellsPer, y = v * cellsPer;
        const cx = Math.floor(x), cy = Math.floor(y);
        const fx = frac(x), fy = frac(y);
        const s = mod(cx + cy, 2 * k);
        let along: number, across: number, id: number, horiz: boolean;
        if (s < k) {
          horiz = true;
          along = (s + fx) / k;
          across = fy;
          id = hash(mod(cx - s, cellsPer), mod(cy, cellsPer), 1);
        } else {
          horiz = false;
          along = (s - k + fy) / k;
          across = fx;
          id = hash(mod(cx, cellsPer), mod(cy - (s - k), cellsPer), 2);
        }
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const g = horiz ? grain(u, v) : grain(v, u);
        const joint = Math.min(groove(across, 0.05), groove(along, 0.012));
        const f = (0.92 + id * 0.14 + (g - 0.5) * 0.3) * mix(0.45, 1, joint);
        return [base[0] * f, base[1] * f, base[2] * f, 0.4 + 0.6 * joint];
      };
    },
  },
  tiles_light: tiles(2, 0xdcdcd8, null, 0xb9b7b0),
  tiles_dark: tiles(2, 0x5a5c60, null, 0x46474a),
  tiles_terracotta: tiles(4, 0xb86d4b, null, 0xcdbfae, 0.05, 0.16),
  checker: tiles(4, 0xeeeeea, 0x2d2e31, 0x9a9a96, 0.02, 0.03),
  tiles_metro: {
    detail: true,
    make: (rnd) => {
      const n = fbm(8, 8, 2, rnd);
      return (u, v) => {
        const c = Math.floor(v * 6);
        const x = u * 3 + (c % 2) * 0.5;
        const g = Math.min(groove(frac(x), 0.03), groove(frac(v * 6), 0.06));
        const bevel = Math.min(groove(frac(x), 0.12), groove(frac(v * 6), 0.24));
        const f = mix(0.72, 1, smooth(g)) * (0.97 + (n(u, v) - 0.5) * 0.04);
        return [f, f, f, 0.2 + 0.5 * smooth(g) + 0.3 * smooth(bevel)];
      };
    },
  },
  marble: {
    detail: false,
    make: (rnd) => {
      const n = fbm(4, 4, 5, rnd);
      const m = fbm(8, 8, 3, rnd);
      return (u, v) => {
        const t = Math.abs(Math.sin((u * 2 + v + n(u, v) * 2.4) * Math.PI * 2));
        const vein = Math.pow(1 - clamp01(t / 0.12), 2) * 0.5 + Math.pow(1 - clamp01(Math.abs(Math.sin((v * 3 - u + m(u, v) * 3) * Math.PI * 2)) / 0.05), 2) * 0.25;
        const seam = Math.min(groove(frac(u * 2), 0.004), groove(frac(v * 2), 0.004));
        const c = mixc([0.93, 0.925, 0.91], [0.55, 0.56, 0.58], vein);
        const f = mix(0.7, 1, seam);
        return [c[0] * f, c[1] * f, c[2] * f, seam];
      };
    },
  },
  carpet: {
    detail: true,
    make: (rnd) => {
      const n = fbm(96, 96, 2, rnd);
      const m = fbm(6, 6, 3, rnd);
      return (u, v) => {
        const f = 0.86 + (n(u, v) - 0.5) * 0.22 + (m(u, v) - 0.5) * 0.08;
        return [f, f, f, n(u, v)];
      };
    },
  },
  flagstone: {
    detail: false,
    make: (rnd) => {
      const c = cells(4, rnd, 0.7);
      const n = fbm(24, 24, 3, rnd);
      const cols = [0xb9b2a6, 0xa9a397, 0xc4bdb0, 0x9e978b].map(hex);
      return (u, v) => {
        const [d1, d2, id] = c(u, v);
        const edge = clamp01((d2 - d1) / 0.08);
        const base = cols[id % cols.length];
        const s = 0.9 + (n(u, v) - 0.5) * 0.3 + hash(id) * 0.1;
        const col = mixc([0.45, 0.43, 0.4], [base[0] * s, base[1] * s, base[2] * s], smooth(edge));
        return [col[0], col[1], col[2], smooth(edge) * 0.8 + n(u, v) * 0.2];
      };
    },
  },
  concrete: grainy(0.16, 6, 0.25),
  // walls
  plaster: grainy(0.05, 8, 0),
  render: grainy(0.1, 10, 0.2),
  pebbledash: {
    detail: true,
    make: (rnd) => {
      const c = cells(40, rnd, 0.9);
      const n = fbm(8, 8, 2, rnd);
      return (u, v) => {
        const [d1, , id] = c(u, v);
        const bump = clamp01(1 - d1 / 0.5);
        const f = 0.8 + bump * 0.2 + (hash(id) - 0.5) * 0.12 + (n(u, v) - 0.5) * 0.05;
        return [f, f, f, bump];
      };
    },
  },
  wp_stripes: {
    detail: true,
    make: (rnd) => {
      const n = fbm(4, 16, 2, rnd);
      return (u, v) => {
        const s = frac(u * 8);
        const band = s < 0.5 ? 1 : 0.86;
        const pin = Math.abs(s - 0.75) < 0.012 ? 0.8 : 1;
        const f = band * pin * (0.98 + (n(u, v) - 0.5) * 0.03);
        return [f, f, f, 0.5];
      };
    },
  },
  wp_damask: {
    detail: true,
    make: () => (u, v) => {
      // medallions on a diamond lattice
      const x = u * 2, y = v * 3;
      const row = Math.floor(y);
      const lx = frac(x + (row % 2) * 0.5) - 0.5, ly = frac(y) - 0.5;
      const r = Math.hypot(lx, ly * 1.3);
      const a = Math.atan2(ly, lx);
      const petal = 0.26 + 0.07 * Math.cos(a * 6) + 0.03 * Math.cos(a * 12);
      const motif = r < petal ? (r < 0.08 || (r > 0.13 && r < 0.16) ? 0 : 1) : 0;
      const scroll = Math.abs(Math.sin((lx + ly) * 14) * Math.sin((lx - ly) * 14)) > 0.92 && r > 0.33 ? 1 : 0;
      const f = motif || scroll ? 0.82 : 1;
      return [f, f, f, motif || scroll ? 0.6 : 0.4];
    },
  },
  wp_geo: {
    detail: true,
    make: () => (u, v) => {
      const a = frac(u * 4 + v * 3), b = frac(u * 4 - v * 3);
      const line = Math.min(Math.abs(a - 0.5), Math.abs(b - 0.5)) < 0.035;
      const fill = (Math.floor(u * 4 + v * 3) + Math.floor(u * 4 - v * 3)) % 2 === 0;
      const f = line ? 0.7 : fill ? 0.94 : 1;
      return [f, f, f, line ? 0.3 : 0.5];
    },
  },
  wp_leaves: {
    detail: true,
    make: (rnd) => {
      const n = 5;
      const leaves = Array.from({ length: n * n }, () => ({ x: rnd(), y: rnd(), a: rnd() * Math.PI, s: 0.7 + rnd() * 0.5, t: rnd() }));
      return (u, v) => {
        let f = 1, h = 0.4;
        const gx = Math.floor(u * n), gy = Math.floor(v * n);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const cx = gx + dx, cy = gy + dy;
            const L = leaves[mod(cy, n) * n + mod(cx, n)];
            const px = (cx + L.x) / n, py = (cy + L.y) / n;
            const ox = (u - px) * n, oy = (v - py) * n;
            const ca = Math.cos(L.a), sa = Math.sin(L.a);
            const lx = (ox * ca + oy * sa) / L.s, ly = (-ox * sa + oy * ca) / L.s;
            const e = (lx * lx) / 0.36 + (ly * ly) / 0.05;
            if (e < 1) {
              const rib = Math.abs(ly) < 0.015 ? 0.1 : 0;
              f = Math.min(f, (L.t > 0.5 ? 0.72 : 0.8) + rib);
              h = 0.7;
            }
          }
        }
        return [f, f, f, h];
      };
    },
  },
  panelling: {
    detail: true,
    make: (rnd) => {
      const n = fbm(6, 6, 2, rnd);
      // tile: 2.4 m square, from the floor up; stiles every 0.6 m, rails at the skirting, 1.0 m and 2.3 m
      const rails = [0.05, 0.42, 0.958];
      return (u, v) => {
        const lu = frac(u * 4);
        const nearRail = Math.min(...rails.map((r) => Math.abs(v - r)));
        const stile = Math.min(lu, 1 - lu) * 0.6; // metres to the nearest stile
        const railD = nearRail * 2.4;
        const inPanel = Math.min(stile, railD);
        const recess = smooth(clamp01((inPanel - 0.05) / 0.025));
        const skirting = v < 0.05 ? 1 : 0;
        const f = (skirting ? 0.97 : mix(1, 0.93, recess)) * (0.985 + (n(u, v) - 0.5) * 0.03);
        return [f, f, f, skirting ? 1 : 1 - recess * 0.5];
      };
    },
  },
  brick_red: bricks(6, 18, [0xa65a40, 0x9a4f38, 0xb4664a, 0x8e4a35, 0xad6a52], 0xc9c0b2),
  brick_buff: bricks(6, 18, [0xcaa776, 0xc09b69, 0xd3b385, 0xb98f5d], 0xd8d0c2),
  brick_painted: bricks(6, 18, [0xffffff], 0xffffff, true),
  stone_wall: {
    detail: false,
    make: (rnd) => {
      const n = fbm(16, 16, 3, rnd);
      const courses = [0, 0.16, 0.3, 0.47, 0.6, 0.77, 0.88, 1];
      const cols = [0xb8ad98, 0xa79c88, 0xc3b8a4, 0x9d927f, 0xb0a48e].map(hex);
      return (u, v) => {
        let c = 0;
        while (c < courses.length - 2 && v >= courses[c + 1]) c++;
        const h0 = courses[c], h1 = courses[c + 1];
        const lv = (v - h0) / (h1 - h0);
        const count = 3 + (c % 3);
        const x = u * count + hash(c, 1) * 0.7;
        const k = Math.floor(x);
        const lu = frac(x);
        const id = hash(mod(k, count), c, 4);
        const edge = Math.min(groove(lu, 0.04), groove(lv, 0.1));
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const s = 0.88 + id * 0.16 + (n(u, v) - 0.5) * 0.3;
        const col = mixc([0.62, 0.6, 0.56], [base[0] * s, base[1] * s, base[2] * s], smooth(edge));
        return [col[0], col[1], col[2], smooth(edge) * (0.8 + n(u, v) * 0.2)];
      };
    },
  },
  boards_v: boards(10, true, [0xb08860, 0xa77e55, 0xbb946b], false),
  boards_h: boards(8, false, [0xffffff], true),
  timber_h: boards(8, false, [0xa77b51, 0x9c7048, 0xb3875c, 0x936a44], false),
  concrete_panels: {
    detail: true,
    make: (rnd) => {
      const n = fbm(6, 6, 4, rnd);
      const s = fbm(96, 96, 1, rnd);
      return (u, v) => {
        const lu = frac(u * 2), lv = frac(v * 2);
        const seam = Math.min(groove(lu, 0.006), groove(lv, 0.006));
        const hole = [0.2, 0.8].some((a) => [0.2, 0.8].some((b) => Math.hypot(lu - a, lv - b) < 0.012)) ? 0.55 : 1;
        const f = (0.9 + (n(u, v) - 0.5) * 0.18 - Math.max(0, s(u, v) - 0.75) * 0.2) * mix(0.6, 1, seam) * hole;
        return [f, f, f, seam * hole];
      };
    },
  },
  // garden
  grass: {
    detail: false,
    make: (rnd) => {
      const big = fbm(4, 4, 3, rnd);
      const fine = fbm(128, 128, 2, rnd);
      return (u, v) => {
        const b = big(u, v), f = fine(u, v);
        const c = mixc(hex(0x6f9a48), hex(0x9cbf62), b);
        const k = 0.78 + f * 0.36;
        return [c[0] * k, c[1] * k * (0.95 + b * 0.08), c[2] * k * 0.9, f];
      };
    },
  },
  patio: tiles(2, 0xc8c0b2, null, 0x8d877d, 0.02, 0.1),
  deck: planks(8, 1, [0xa77b52, 0x9b6f48, 0xb2875d], 0.14, 0.25),
  pavers: {
    detail: false,
    make: (rnd) => {
      const n = fbm(32, 32, 2, rnd);
      const cols = [0xa59c92, 0x9a9087, 0xb0a79c, 0x8f857c].map(hex);
      return (u, v) => {
        const c = Math.floor(v * 10);
        const x = u * 5 + (c % 2) * 0.5;
        const id = hash(mod(Math.floor(x), 5), mod(c, 10), 9);
        const g = Math.min(groove(frac(x), 0.04), groove(frac(v * 10), 0.08));
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const s = (0.9 + (n(u, v) - 0.5) * 0.25) * mix(0.55, 1, g);
        return [base[0] * s, base[1] * s, base[2] * s, g];
      };
    },
  },
  // driveway block paving: 200 × 100 mm blocks in herringbone, brindle tones, sanded joints
  block_paving: {
    detail: false,
    make: (rnd) => {
      const n = fbm(48, 48, 2, rnd);
      const cols = [0x8d604d, 0x7e5c4f, 0x96694f, 0x6f5d55, 0x9a735c, 0x845648].map(hex);
      const sand = hex(0x8a8070);
      const k = 2, cellsPer = 16;
      return (u, v) => {
        const x = u * cellsPer, y = v * cellsPer;
        const cx = Math.floor(x), cy = Math.floor(y);
        const fx = frac(x), fy = frac(y);
        const s = mod(cx + cy, 2 * k);
        const horiz = s < k;
        const along = horiz ? (s + fx) / k : (s - k + fy) / k;
        const across = horiz ? fy : fx;
        const id = horiz ? hash(mod(cx - s, cellsPer), mod(cy, cellsPer), 5) : hash(mod(cx, cellsPer), mod(cy - (s - k), cellsPer), 6);
        const base = cols[Math.floor(id * cols.length) % cols.length];
        const joint = Math.min(groove(across, 0.07), groove(along, 0.035));
        const bevel = Math.min(groove(across, 0.2), groove(along, 0.1));
        const f = (0.94 + id * 0.1 + (n(u, v) - 0.5) * 0.2) * mix(0.86, 1, smooth(bevel));
        const c = mixc(sand, [base[0] * f, base[1] * f, base[2] * f], smooth(joint));
        return [c[0], c[1], c[2], 0.3 * smooth(joint) + 0.5 * smooth(bevel) + n(u, v) * 0.2];
      };
    },
  },
  tarmac: {
    detail: false,
    make: (rnd) => {
      const n = fbm(128, 128, 2, rnd);
      const m = fbm(4, 4, 3, rnd);
      return (u, v) => {
        const f = 0.32 + (n(u, v) - 0.5) * 0.18 + (m(u, v) - 0.5) * 0.06 + (n(u, v) > 0.82 ? 0.12 : 0);
        return [f, f, f * 1.02, n(u, v)];
      };
    },
  },
  soil: {
    detail: false,
    make: (rnd) => {
      const n = fbm(24, 24, 4, rnd);
      return (u, v) => {
        const k = 0.75 + n(u, v) * 0.5;
        return [0.36 * k, 0.27 * k, 0.2 * k, n(u, v)];
      };
    },
  },
  gravel: {
    detail: false,
    make: (rnd) => {
      const c = cells(48, rnd, 0.9);
      return (u, v) => {
        const [d1, d2, id] = c(u, v);
        const edge = clamp01((d2 - d1) / 0.25);
        const t = hash(id);
        const base = mixc([0.62, 0.58, 0.52], [0.86, 0.83, 0.78], t);
        const k = mix(0.5, 1, edge) * (0.9 + clamp01(1 - d1) * 0.15);
        return [base[0] * k, base[1] * k, base[2] * k, edge * clamp01(1 - d1 * 0.8)];
      };
    },
  },
  // furniture and upholstery (detail maps)
  weave: weave(110, 0.14),
  linen: weave(90, 0.1, 0.12),
  velvet: grainy(0.08, 12, 0),
  boucle: {
    detail: true,
    make: (rnd) => {
      const c = cells(70, rnd, 0.9);
      return (u, v) => {
        const [d1] = c(u, v);
        const b = clamp01(1 - d1 / 0.6);
        const f = 0.84 + b * 0.16;
        return [f, f, f, b];
      };
    },
  },
  leather: {
    detail: true,
    make: (rnd) => {
      const c = cells(36, rnd, 0.9);
      const n = fbm(6, 6, 3, rnd);
      return (u, v) => {
        const [d1, d2] = c(u, v);
        const crease = clamp01((d2 - d1) / 0.12);
        const f = (0.9 + (n(u, v) - 0.5) * 0.16) * mix(0.82, 1, crease);
        return [f, f, f, crease * 0.6 + d1 * 0.2];
      };
    },
  },
  wood_grain: {
    detail: true,
    make: (rnd) => {
      const g = fbm(3, 40, 4, rnd);
      return (u, v) => {
        const t = g(u, v);
        const ring = Math.abs(Math.sin((v * 22 + t * 6) * Math.PI));
        const f = 0.86 + t * 0.16 - Math.pow(1 - ring, 6) * 0.08;
        return [f, f, f, t];
      };
    },
  },
  // along the length of a door or a window frame
  wood_grain_v: {
    detail: true,
    make: (rnd) => {
      const g = fbm(40, 3, 4, rnd);
      return (u, v) => {
        const t = g(u, v);
        const ring = Math.abs(Math.sin((u * 22 + t * 6) * Math.PI));
        const f = 0.86 + t * 0.16 - Math.pow(1 - ring, 6) * 0.08;
        return [f, f, f, t];
      };
    },
  },
  brushed: {
    detail: true,
    make: (rnd) => {
      const g = fbm(2, 256, 2, rnd);
      return (u, v) => {
        const f = 0.92 + (g(u, v) - 0.5) * 0.12;
        return [f, f, f, g(u, v)];
      };
    },
  },
  foliage: {
    detail: true,
    make: (rnd) => {
      const c = cells(24, rnd, 0.9);
      const n = fbm(8, 8, 2, rnd);
      return (u, v) => {
        const [d1, d2, id] = c(u, v);
        const edge = clamp01((d2 - d1) / 0.2);
        const f = (0.7 + hash(id) * 0.4) * mix(0.6, 1, edge) + (n(u, v) - 0.5) * 0.1;
        return [f, f, f, edge];
      };
    },
  },
  rug: {
    detail: true,
    make: (rnd) => {
      const n = fbm(96, 96, 1, rnd);
      return (u, v) => {
        // kilim-like diamonds and bands
        const a = Math.abs(frac(u * 4) - 0.5) + Math.abs(frac(v * 4) - 0.5);
        const ring = Math.abs(frac(a * 3) - 0.5) < 0.12;
        const band = Math.abs(frac(v * 4) - 0.5) > 0.46;
        const f = (band ? 0.62 : ring ? 0.74 : a < 0.18 ? 0.86 : 1) * (0.92 + n(u, v) * 0.1);
        return [f, f, f, n(u, v)];
      };
    },
  },
  canvas_art: {
    detail: true,
    make: (rnd) => {
      const blobs = Array.from({ length: 9 }, () => ({ x: rnd(), y: rnd(), r: 0.08 + rnd() * 0.2, t: rnd() }));
      const n = fbm(64, 64, 1, rnd);
      return (u, v) => {
        let f = 0.95;
        for (const b of blobs) {
          const d = Math.hypot(mod(u - b.x + 0.5, 1) - 0.5, mod(v - b.y + 0.5, 1) - 0.5);
          if (d < b.r) f = Math.min(f, 0.35 + b.t * 0.55);
        }
        return [f + (n(u, v) - 0.5) * 0.04, f, f, n(u, v) * 0.3];
      };
    },
  },
  // roofs: courses run along u, v climbs the slope; each course's lower edge stands proud over the one below
  roof_interlocking: roofTiles({ courses: 5, perCourse: 5, stagger: false, rolls: 2, roll: 0.25, vary: 0.08, detail: true }),
  roof_plain: roofTiles({ courses: 12, perCourse: 7, stagger: true, rolls: 0, roll: 0, vary: 0.22, detail: true, camber: 0.15 }),
  roof_slate: roofTiles({ courses: 7, perCourse: 6, stagger: true, rolls: 0, roll: 0, vary: 0.12, detail: false, tones: [0x4b4f58, 0x464a55, 0x51535c, 0x4a4d52, 0x55545e], step: 0.35 }),
  roof_pantile: roofTiles({ courses: 5, perCourse: 6, stagger: false, rolls: 1, roll: 0.75, vary: 0.14, detail: true, wave: true }),
  roof_thatch: {
    detail: false,
    make: (rnd) => {
      const strands = fbm(96, 6, 3, rnd);
      const lumps = fbm(6, 6, 3, rnd);
      return (u, v) => {
        // courses of straw a hand deep, wavy at their lower edge
        const course = v * 6 + (lumps(u, v) - 0.5) * 0.5;
        const lv = frac(course);
        const st = strands(u, v * 0.5 + Math.floor(course) * 0.37);
        const shade = (0.7 + st * 0.45) * mix(0.62, 1, smooth(clamp01(lv / 0.3)));
        const c = mixc(hex(0x9c844f), hex(0xc4ab72), lumps(u, v));
        return [c[0] * shade, c[1] * shade, c[2] * shade, st * 0.7 + (1 - lv) * 0.3];
      };
    },
  },
  roof_seam: {
    detail: true,
    make: (rnd) => {
      const n = fbm(4, 16, 3, rnd);
      return (u, v) => {
        // a standing seam every 0.53 m, the trays between them a little oil-canned
        const x = frac(u * 3);
        const seam = 1 - groove(x, 0.03);
        const f = 0.96 + (n(u, v) - 0.5) * 0.05 + seam * 0.1 - (1 - groove(x, 0.06)) * 0.06;
        return [f, f, f, 0.3 + seam * 0.7 + (n(u, v) - 0.5) * 0.05];
      };
    },
  },
  roof_felt: {
    detail: true,
    make: (rnd) => {
      const grit = fbm(160, 160, 1, rnd);
      const n = fbm(6, 6, 3, rnd);
      return (u, v) => {
        // mineral felt in 1 m rolls laid up the slope, each lapping over the one below
        const lv = frac(v * 2);
        const lap = mix(0.8, 1, smooth(clamp01(lv / 0.06)));
        const f = (0.9 + (grit(u, v) - 0.5) * 0.35 + (n(u, v) - 0.5) * 0.08) * lap;
        return [f, f, f, grit(u, v) * 0.5 + (lv < 0.03 ? 0 : 0.5)];
      };
    },
  },
  roof_epdm: {
    detail: false,
    make: (rnd) => {
      const n = fbm(5, 5, 4, rnd);
      return (u, v) => {
        const f = 0.95 + (n(u, v) - 0.5) * 0.12;
        return [0.165 * f, 0.17 * f, 0.18 * f, n(u, v) * 0.3];
      };
    },
  },
  roof_grp: grainy(0.05, 5, 0.05),
  roof_lead: {
    detail: false,
    make: (rnd) => {
      const n = fbm(6, 6, 4, rnd);
      return (u, v) => {
        // wood rolls every 0.6 m, the sheet between them mottled with patina
        const x = frac(u * 2.5);
        const roll = Math.max(0, 1 - Math.abs(x - 0.5) / 0.05);
        const c = mixc(hex(0x6f757b), hex(0x8f969b), n(u, v));
        const f = 0.92 + roll * 0.15;
        return [c[0] * f, c[1] * f, c[2] * f, 0.3 + roll * 0.7];
      };
    },
  },
  roof_sedum: {
    detail: false,
    make: (rnd) => {
      const cl = cells(28, rnd, 0.9);
      const patches = fbm(5, 5, 3, rnd);
      const tones = [0x5e7f3c, 0x7a9446, 0x8a6b3a, 0x9d4a3a, 0x6c8a4a, 0xa8a05a].map(hex);
      return (u, v) => {
        const [d1, d2, id] = cl(u, v);
        const p = patches(u, v);
        const c = tones[Math.floor(hash(id, Math.floor(p * 3), 9) * tones.length) % tones.length];
        const rim = smooth(clamp01((d2 - d1) * 3));
        const f = 0.65 + rim * 0.45;
        return [c[0] * f, c[1] * f, c[2] * f, rim];
      };
    },
  },
};

// ---------------------------------------------------------------------------- baking

const cache = new Map<string, TexturePair>();

/** The texture pair of a recipe, drawn once at `size` pixels and shared (repeat set per use). */
export function bake(recipe: string, size: number, anisotropy: number): TexturePair | null {
  const r = RECIPES[recipe];
  if (!r) return null;
  const key = `${recipe}@${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const pixel = r.make(rng(hashString(recipe)));
  const col = document.createElement("canvas");
  col.width = col.height = size;
  const ctx = col.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  for (let j = 0; j < size; j++) {
    // canvas rows run down, texture v runs up (flipY)
    const v = 1 - (j + 0.5) / size;
    for (let i = 0; i < size; i++) {
      const [r0, g0, b0, h] = pixel((i + 0.5) / size, v);
      const o = (j * size + i) * 4;
      img.data[o] = clamp01(r0) * 255;
      img.data[o + 1] = clamp01(g0) * 255;
      img.data[o + 2] = clamp01(b0) * 255;
      img.data[o + 3] = 255;
      height[j * size + i] = h;
    }
  }
  ctx.putImageData(img, 0, 0);
  const map = new CanvasTexture(col);
  map.colorSpace = r.detail ? NoColorSpace : SRGBColorSpace;
  // normal map from the height: central differences, wrapping at the edges
  const nc = document.createElement("canvas");
  nc.width = nc.height = size;
  const nctx = nc.getContext("2d")!;
  const nimg = nctx.createImageData(size, size);
  const k = size / 128;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const hl = height[j * size + mod(i - 1, size)], hr = height[j * size + mod(i + 1, size)];
      const hu = height[mod(j - 1, size) * size + i], hd = height[mod(j + 1, size) * size + i];
      const nx = -(hr - hl) * k, ny = -(hu - hd) * k;
      const l = Math.hypot(nx, ny, 1);
      const o = (j * size + i) * 4;
      nimg.data[o] = (nx / l * 0.5 + 0.5) * 255;
      nimg.data[o + 1] = (ny / l * 0.5 + 0.5) * 255;
      nimg.data[o + 2] = (1 / l * 0.5 + 0.5) * 255;
      nimg.data[o + 3] = 255;
    }
  }
  nctx.putImageData(nimg, 0, 0);
  const normal = new CanvasTexture(nc);
  normal.colorSpace = NoColorSpace;
  for (const t of [map, normal]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.minFilter = LinearMipmapLinearFilter;
    t.anisotropy = anisotropy;
  }
  const pair = { map, normal };
  cache.set(key, pair);
  return pair;
}

export function hasRecipe(recipe: string): boolean {
  return recipe in RECIPES;
}

/** Whether a recipe is a detail map (the surface's colour shows through). */
export function isDetail(recipe: string): boolean {
  return RECIPES[recipe]?.detail ?? true;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Frees every baked texture (when the realistic look goes away). */
export function disposeTextures(): void {
  for (const p of cache.values()) {
    p.map.dispose();
    p.normal?.dispose();
  }
  cache.clear();
}
