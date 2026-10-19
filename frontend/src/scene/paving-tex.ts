// Textures of patio paving and deck boards, made to order from their surface key (scene/paving.ts):
// the units laid out in their pattern with joints between them, each unit's face drawn as its
// material looks (riven sandstone, smooth porcelain, flamed granite, cleft slate, chamfered blocks,
// domed setts, resin's stones...) in the picked colour, its tone varying from unit to unit.
// Every layout repeats exactly over the texture's tile, so the texture tiles seamlessly.
import { PAVING, parseDeckKey, parsePavingKey, type DeckLook, type PavingLook } from "./paving";
import { cells, clamp01, fbm, frac, hash, mix, mod, noise, rng, smooth, type Recipe, type RGB } from "./texture-kit";

/** Where a point of the tile falls: its unit (an id), how far it is from the unit's edge, where in the unit (mm). */
interface Hit {
  id: number;
  /** Distance to the unit's nearest edge (mm); Infinity for seamless surfaces. */
  d: number;
  /** From the unit's middle, along its length and its width (mm), and its length and width. */
  lx: number;
  ly: number;
  w: number;
  h: number;
}

type Layout = (x: number, y: number) => Hit;

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** The smallest multiple of `period` at least `min` long. */
const atLeast = (period: number, min: number) => period * Math.max(1, Math.ceil(min / period - 1e-9));

/** How many modules a random pattern's tile is across. */
const RANDOM_MODULES = 10;

/** The square a paving look's texture repeats over (mm), so its pattern tiles exactly. */
export function pavingTile(p: PavingLook): number {
  const [L, W] = p.unit;
  const min = Math.max(1800, 3 * L);
  switch (p.pattern) {
    case "grid": return atLeast(lcm(L, W), min);
    case "stretcher": return atLeast(lcm(L, 2 * W), min);
    case "third": return atLeast(lcm(L, 3 * W), min);
    case "herringbone":
    case "basketweave": return atLeast(2 * L, 1600);
    case "random": return RANDOM_MODULES * L;
    case "crazy": return 2400;
    default: return p.material === "tarmac" ? 2500 : 1000;
  }
}

/** The square a deck's boards repeat over (mm): a whole number of boards with their gaps, about 3.6 m. */
export function deckTile(d: DeckLook): number {
  const pitch = d.width + DECK_GAP;
  return pitch * Math.max(4, Math.round(3600 / pitch));
}

const DECK_GAP = 6;

function centred(id: number, x0: number, y0: number, w: number, h: number, x: number, y: number): Hit {
  const lx = x - x0, ly = y - y0;
  return { id, d: Math.min(lx, w - lx, ly, h - ly), lx: lx - w / 2, ly: ly - h / 2, w, h };
}

function gridLayout(L: number, W: number, T: number): Layout {
  const nx = Math.round(T / L);
  return (x, y) => {
    const ix = Math.floor(x / L), iy = Math.floor(y / W);
    return centred(iy * nx + ix, ix * L, iy * W, L, W, x, y);
  };
}

/** Rows offset by a k-th of a unit from the one before. */
function staggerLayout(L: number, W: number, T: number, k: number): Layout {
  const nx = Math.round(T / L);
  return (x, y) => {
    const row = Math.floor(y / W);
    const off = (mod(row, k) * L) / k;
    const xx = mod(x + off, T);
    const ix = Math.floor(xx / L);
    return centred(row * nx + ix, ix * L, row * W, L, W, xx, y);
  };
}

/** Units k times as long as wide, in a 90° herringbone. */
function herringboneLayout(L: number, W: number, T: number): Layout {
  const k = Math.max(2, Math.round(L / W));
  const n = Math.round(T / W);
  return (x, y) => {
    const cx = Math.floor(x / W), cy = Math.floor(y / W);
    const s = mod(cx + cy, 2 * k);
    if (s < k) {
      const ox = cx - s;
      return centred(mod(cy, n) * n + mod(ox, n), ox * W, cy * W, k * W, W, x, y);
    }
    const oy = cy - (s - k);
    // lengthways along y: swap so lx runs along the unit's length
    const hit = centred(mod(oy, n) * n + mod(cx, n) + n * n, cx * W, oy * W, W, k * W, x, y);
    return { ...hit, lx: hit.ly, ly: hit.lx, w: hit.h, h: hit.w };
  };
}

/** Pairs of units side by side, every other square turned. */
function basketLayout(L: number, W: number, T: number): Layout {
  const k = Math.max(2, Math.round(L / W));
  const n = Math.round(T / L);
  return (x, y) => {
    const bx = Math.floor(x / L), by = Math.floor(y / L);
    const base = (by * n + bx) * k;
    if ((bx + by) % 2 === 0) {
      const r = Math.min(k - 1, Math.floor((y - by * L) / W));
      return centred(base + r, bx * L, by * L + r * W, L, W, x, y);
    }
    const c = Math.min(k - 1, Math.floor((x - bx * L) / W));
    const hit = centred(base + c, bx * L + c * W, by * L, W, L, x, y);
    return { ...hit, lx: hit.ly, ly: hit.lx, w: hit.h, h: hit.w };
  };
}

/**
 * Mixed sizes at random, like a patio pack of 900 x 600, 600 x 600, 600 x 290 and 290 x 290 slabs:
 * the tile's square of modules filled in turn with the biggest slab that fits (picked at random,
 * wrapping round the tile's edges so it repeats).
 */
function randomLayout(M: number, rnd: () => number): Layout {
  const N = RANDOM_MODULES;
  const owner = new Int32Array(N * N).fill(-1);
  const units: { x: number; y: number; a: number; b: number }[] = [];
  const sizes: [number, number, number][] = [[3, 2, 3], [2, 3, 1], [2, 2, 3], [2, 1, 2], [1, 2, 1], [1, 1, 1.2]];
  const total = sizes.reduce((s, z) => s + z[2], 0);
  const fits = (x: number, y: number, a: number, b: number) => {
    for (let j = 0; j < b; j++) for (let i = 0; i < a; i++) if (owner[mod(y + j, N) * N + mod(x + i, N)] >= 0) return false;
    return true;
  };
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (owner[y * N + x] >= 0) continue;
      // a few tries at a weighted random size, then the biggest that fits
      let pick: [number, number] = [1, 1];
      for (let t = 0; t < 6; t++) {
        let r = rnd() * total, z = sizes[0];
        for (const s of sizes) if ((r -= s[2]) <= 0) { z = s; break; }
        if (fits(x, y, z[0], z[1])) { pick = [z[0], z[1]]; break; }
      }
      const id = units.length;
      units.push({ x, y, a: pick[0], b: pick[1] });
      for (let j = 0; j < pick[1]; j++) for (let i = 0; i < pick[0]; i++) owner[mod(y + j, N) * N + mod(x + i, N)] = id;
    }
  }
  return (x, y) => {
    const cx = Math.floor(x / M), cy = Math.floor(y / M);
    const id = owner[mod(cy, N) * N + mod(cx, N)];
    const u = units[id];
    // the unit's start, unwrapped to this side of the tile
    const ox = cx - mod(cx - u.x, N), oy = cy - mod(cy - u.y, N);
    return centred(id, ox * M, oy * M, u.a * M, u.b * M, x, y);
  };
}

/** Broken stones: cells round scattered points, each a stone. */
function crazyLayout(T: number, rnd: () => number): Layout {
  const n = 6;
  const c = cells(n, rnd, 0.95);
  const size = T / n;
  return (x, y) => {
    const [d1, d2, id] = c(x / T, y / T);
    return { id, d: ((d2 - d1) / 2) * size, lx: 0, ly: 0, w: size, h: size };
  };
}

const plainLayout: Layout = () => ({ id: 0, d: Infinity, lx: 0, ly: 0, w: 1, h: 1 });

function rgbOf(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Value noise that does not repeat, over a unit's own coordinates. */
function vnoise(x: number, y: number): number {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = smooth(x - x0), fy = smooth(y - y0);
  return mix(mix(hash(x0, y0, 31), hash(x0 + 1, y0, 31), fx), mix(hash(x0, y0 + 1, 31), hash(x0 + 1, y0 + 1, 31), fx), fy);
}

function vfbm(x: number, y: number, octaves: number): number {
  let s = 0, amp = 0.5, norm = 0, f = 1;
  for (let i = 0; i < octaves; i++) {
    s += vnoise(x * f + i * 17.3, y * f - i * 9.1) * amp;
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return s / norm;
}

/** Hue shifts a unit can take (multiplied in by its colour's mix): natural stone's and clay's. */
const STONE_HUES: RGB[] = [[1, 1, 1], [1.1, 1.0, 0.86], [0.92, 0.97, 1.04], [1.13, 0.95, 0.83], [0.95, 0.99, 0.93], [1.05, 1.02, 0.9], [0.86, 0.86, 0.87]];
const CLAY_HUES: RGB[] = [[1, 1, 1], [1.16, 0.92, 0.84], [0.74, 0.74, 0.78], [1.08, 1.03, 0.9], [0.9, 0.84, 0.82], [1.2, 1.05, 0.88]];

/** Everything a face is drawn with: the tile's noises (over 0..1 of the tile) and the unit. */
interface Face {
  u: number;
  v: number;
  x: number;
  y: number;
  hit: Hit;
  /** The unit's random numbers. */
  r1: number;
  r2: number;
  r3: number;
}

/** A face writes its colour and height into FACE_OUT (no array per pixel). */
type FaceFn = (f: Face) => void;
const FACE_OUT = [0, 0, 0, 0];

/** How a look's units are laid over a tile T mm across. */
function layoutOf(p: PavingLook, T: number, rnd: () => number): Layout {
  const [L, W] = p.unit;
  switch (p.pattern) {
    case "grid": return gridLayout(L, W, T);
    case "stretcher": return staggerLayout(L, W, T, 2);
    case "third": return staggerLayout(L, W, T, 3);
    case "herringbone": return herringboneLayout(L, W, T);
    case "basketweave": return basketLayout(L, W, T);
    case "random": return randomLayout(L, rnd);
    case "crazy": return crazyLayout(T, rnd);
    default: return plainLayout;
  }
}

/** The paving texture for a look: the layout, each unit's face, and the joints. */
function paving(p: PavingLook): Recipe {
  const def = PAVING[p.material];
  const T = pavingTile(p);
  const base = rgbOf(p.color), joint = rgbOf(p.joint);
  const jw = def.joint / 2;
  return {
    detail: false,
    make: (rnd) => {
      const layout = layoutOf(p, T, rnd);
      const face = faceOf(p, T, base, rnd);
      const mortar = noise(Math.max(4, Math.round(T / 30)), Math.max(4, Math.round(T / 30)), rnd);
      // hand-cut setts and crazy paving have uneven edges
      const ragged = def.surface === "sett" || p.pattern === "crazy" ? noise(Math.round(T / 25), Math.round(T / 25), rnd) : null;
      const bevel = def.surface === "block" ? 5 : def.surface === "clay" ? 3 : def.surface === "tumbled" ? 5 : def.surface === "sett" ? 6 : def.surface === "smooth" ? 1 : 2.5;
      return (u, v) => {
        const x = u * T, y = v * T;
        const hit = layout(x, y);
        let d = hit.d;
        if (ragged && isFinite(d)) d += (ragged(u, v) - 0.5) * 7;
        if (d < jw) {
          // the joint: mortar or sand, a little uneven, in the shadow of the units' edges
          const m = mortar(u, v);
          const k = (0.82 + m * 0.22) * mix(0.8, 1, clamp01(d / Math.max(1, jw)));
          return [joint[0] * k, joint[1] * k, joint[2] * k, 0.05 + m * 0.05];
        }
        const id = hit.id;
        face({ u, v, x, y, hit, r1: hash(id, 1, 77), r2: hash(id, 2, 77), r3: hash(id, 3, 77) });
        const [r, g, b, h] = FACE_OUT;
        // the arris: rounded or chamfered down into the joint
        const e = isFinite(d) ? smooth(clamp01((d - jw) / bevel)) : 1;
        const k = mix(0.78, 1, e);
        return [r * k, g * k, b * k, mix(0.15, h, e)];
      };
    },
  };
}

/** How a material's units look, for a look, over a tile T mm across. */
function faceOf(p: PavingLook, T: number, base: RGB, rnd: () => number): FaceFn {
  const def = PAVING[p.material];
  const vary = def.vary;
  const cellsAt = (mm: number) => Math.max(2, Math.round(T / mm));
  const big = fbm(cellsAt(700), cellsAt(700), 2, rnd);
  const mid = fbm(cellsAt(160), cellsAt(160), 2, rnd);
  const fine = noise(cellsAt(12), cellsAt(12), rnd);
  const hues = def.surface === "block" || def.surface === "clay" ? CLAY_HUES : STONE_HUES;
  /** The unit's own colour: its tone, and its hue when the colour mixes. */
  const tint = (f: Face): RGB => {
    const tone = 1 + (f.r1 - 0.5) * 2 * vary;
    const hue = hues[Math.floor(f.r2 * hues.length) % hues.length];
    return [base[0] * tone * mix(1, hue[0], p.mix), base[1] * tone * mix(1, hue[1], p.mix), base[2] * tone * mix(1, hue[2], p.mix)];
  };
  const out = (c: RGB, k: number, h: number): void => {
    FACE_OUT[0] = c[0] * k;
    FACE_OUT[1] = c[1] * k;
    FACE_OUT[2] = c[2] * k;
    FACE_OUT[3] = h;
  };
  switch (def.surface) {
    case "riven": {
      // split along its bedding: a broad undulation, and streaks and patches of a second colour
      // running one way per stone (drawn in the stone's own frame, so a stone across the tile's
      // edge carries on unbroken)
      const crazy = p.pattern === "crazy";
      const rust: RGB = [1.12, 0.93, 0.78];
      return (f) => {
        const c = tint(f);
        const a = f.r3 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
        let und: number, streak: number, patch: number;
        if (crazy) {
          und = big(f.u + f.r1, f.v + f.r2);
          streak = mid(f.u * 0.5 + f.r2, f.v * 2 + f.r1);
          patch = big(f.u + f.r3, f.v + f.r1);
        } else {
          const px = f.hit.lx * ca + f.hit.ly * sa + f.r1 * 5000, py = -f.hit.lx * sa + f.hit.ly * ca + f.r2 * 5000;
          und = vfbm(px / 260, py / 260, 3);
          streak = vfbm(px / 480, py / 45, 2);
          patch = vnoise(px / 340, py / 340);
        }
        const s2 = fine(f.u, f.v);
        // the second colour: rust in a mixed stone, else a shade darker
        const w = smooth(clamp01((streak - 0.55) * 4)) * (0.15 + 0.45 * p.mix) + smooth(clamp01((patch - 0.62) * 3)) * 0.4 * p.mix;
        const col: RGB = [c[0] * mix(1, rust[0], w), c[1] * mix(1, rust[1], w), c[2] * mix(1, rust[2], w)];
        const k = 0.9 + (und - 0.5) * 0.24 - w * 0.08 + (s2 - 0.5) * 0.07;
        out(col, k, 0.4 + und * 0.42 + streak * 0.1 + s2 * 0.06);
      };
    }
    case "smooth": {
      // porcelain: an even body with a faint stone-like cloud
      return (f) => {
        const c = tint(f);
        const k = 0.97 + (big(f.u + f.r1, f.v) - 0.5) * 0.06 + (fine(f.u, f.v) - 0.5) * 0.025;
        out(c, k, 0.9 + fine(f.u, f.v) * 0.03);
      };
    }
    case "textured": {
      // pressed concrete: fine aggregate in the face, the odd pit
      const pits = noise(cellsAt(9), cellsAt(9), rnd);
      return (f) => {
        const c = tint(f);
        const s = fine(f.u, f.v), q = pits(f.u, f.v);
        const pit = q > 0.8 ? (q - 0.8) * 2.5 : 0;
        const k = 0.95 + (mid(f.u, f.v) - 0.5) * 0.1 + (s - 0.5) * 0.14 - pit * 0.3;
        out(c, k, 0.82 + s * 0.12 - pit * 0.4);
      };
    }
    case "flamed": {
      // granite: crystals of black mica and white feldspar in the grey
      const dark = noise(cellsAt(4), cellsAt(4), rnd);
      const light = noise(cellsAt(5), cellsAt(5), rnd);
      return (f) => {
        const c = tint(f);
        const dk = dark(f.u, f.v), lt = light(f.u, f.v);
        let k = 0.96 + (mid(f.u, f.v) - 0.5) * 0.06;
        if (dk > 0.7) k *= mix(1, 0.35, clamp01((dk - 0.7) * 5));
        else if (lt > 0.74) k *= mix(1, 1.3, clamp01((lt - 0.74) * 6));
        out(c, k, 0.8 + (fine(f.u, f.v) - 0.5) * 0.2 + (dk > 0.7 ? -0.05 : 0));
      };
    }
    case "honed": {
      // limestone: smooth, with soft clouds and a scatter of darker specks
      const speck = noise(cellsAt(6), cellsAt(6), rnd);
      return (f) => {
        const c = tint(f);
        const sp = speck(f.u, f.v);
        const k = 0.95 + (big(f.u + f.r1, f.v + f.r3) - 0.5) * 0.16 + (mid(f.u, f.v) - 0.5) * 0.06 - (sp > 0.85 ? (sp - 0.85) * 2 : 0);
        out(c, k, 0.86 + (mid(f.u, f.v) - 0.5) * 0.06);
      };
    }
    case "tumbled": {
      // travertine: bands along the stone, small pits, edges worn round
      const pits = noise(cellsAt(5), cellsAt(9), rnd);
      return (f) => {
        const c = tint(f);
        const m = mid(f.u, f.v);
        const band = Math.sin((f.y / 40 + m * 3 + f.r3 * 7) * Math.PI);
        const q = pits(f.u, f.v);
        const pit = q > 0.8 ? Math.min(1, (q - 0.8) * 6) : 0;
        const k = 0.95 + band * 0.045 + (m - 0.5) * 0.08 - pit * 0.22;
        out(c, k, 0.82 + band * 0.03 - pit * 0.5 + (fine(f.u, f.v) - 0.5) * 0.05);
      };
    }
    case "cleft": {
      // slate: layers split off in steps, each catching the light a little differently
      return (f) => {
        const c = tint(f);
        const b = big(f.u + f.r1, f.v + f.r2) * 0.7 + mid(f.u, f.v) * 0.3;
        const layer = Math.floor(b * 6) / 6;
        const edge = smooth(clamp01(frac(b * 6) * 6));
        const k = 0.88 + layer * 0.22 + (fine(f.u, f.v) - 0.5) * 0.05 - (1 - edge) * 0.08;
        out(c, k, layer * 0.6 + edge * 0.08 + 0.3);
      };
    }
    case "block":
    case "clay": {
      // pressed blocks or fired clay: speckled faces, clay with darker spots and firing marks
      const spots = noise(cellsAt(7), cellsAt(7), rnd);
      const clay = def.surface === "clay";
      return (f) => {
        const c = tint(f);
        const s = fine(f.u, f.v), sp = spots(f.u, f.v);
        const fire = clay ? (big(f.u + f.r3, f.v) - 0.5) * 0.2 : 0;
        const k = 0.94 + (s - 0.5) * 0.14 + fire - (clay && sp > 0.78 ? (sp - 0.78) * 1.6 : 0) + (mid(f.u, f.v) - 0.5) * 0.06;
        out(c, k, 0.8 + s * 0.12);
      };
    }
    case "sett": {
      // split granite: a domed, rough top, with the crystals of granite
      const dark = noise(cellsAt(4), cellsAt(4), rnd);
      return (f) => {
        const c = tint(f);
        const rx = (2 * f.hit.lx) / f.hit.w, ry = (2 * f.hit.ly) / f.hit.h;
        const dome = 1 - 0.35 * (rx * rx + ry * ry);
        const dk = dark(f.u, f.v);
        const k = (0.92 + (mid(f.u, f.v) - 0.5) * 0.2 + dome * 0.06) * (dk > 0.72 ? 0.6 : 1);
        out(c, k, dome * 0.7 + mid(f.u, f.v) * 0.25);
      };
    }
    case "aggregate": {
      // resin bound: small stones in a clear resin, every one its own shade
      const stones = cells(cellsAt(6), rnd, 0.9);
      return (f) => {
        const [d1, d2, id] = stones(f.u, f.v);
        const t = hash(id, 5), t2 = hash(id, 9);
        const shade = t2 > 0.93 ? 1.35 : t2 < 0.08 ? 0.55 : 0.82 + t * 0.3;
        const rim = clamp01((d2 - d1) / 0.3);
        const k = shade * mix(0.55, 1, rim) * (0.92 + clamp01(1 - d1) * 0.12);
        out(base, k, rim * clamp01(1 - d1 * 0.7));
      };
    }
    case "gravel": {
      const stones = cells(cellsAt(18), rnd, 0.9);
      return (f) => {
        const [d1, d2, id] = stones(f.u, f.v);
        const t = hash(id, 3), t2 = hash(id, 11);
        const hue: RGB = t2 > 0.85 ? [1.08, 1.0, 0.9] : t2 < 0.15 ? [0.9, 0.93, 0.97] : [1, 1, 1];
        const edge = clamp01((d2 - d1) / 0.25);
        const k = (0.7 + t * 0.45) * mix(0.45, 1, edge) * (0.9 + clamp01(1 - d1) * 0.15);
        out([base[0] * hue[0], base[1] * hue[1], base[2] * hue[2]], k, edge * clamp01(1 - d1 * 0.8));
      };
    }
    default: {
      // tarmac: dark binder with pale chips of stone
      const chips = noise(cellsAt(6), cellsAt(6), rnd);
      return (f) => {
        const ch = chips(f.u, f.v);
        const k = 0.9 + (fine(f.u, f.v) - 0.5) * 0.3 + (big(f.u, f.v) - 0.5) * 0.08 + (ch > 0.8 ? (ch - 0.8) * 1.6 : 0);
        out(base, k, fine(f.u, f.v));
      };
    }
  }
}

/**
 * Deck boards along u, a gap between each: timber with grain, knots and reeded ribs (softwood),
 * or composite's even colour with a pressed grain. One butt joint per board in a tile, staggered.
 */
function deck(d: DeckLook): Recipe {
  const T = deckTile(d);
  const pitch = d.width + DECK_GAP;
  const rows = Math.round(T / pitch);
  const base = rgbOf(d.color);
  const composite = d.boards === "composite";
  return {
    detail: false,
    make: (rnd) => {
      const grain = fbm(4, rows * 10, 3, rnd);
      const streak = fbm(2, rows * 3, 2, rnd);
      const knots = cells(Math.max(4, Math.round(T / 600)), rnd, 0.9);
      const joints = Array.from({ length: rows }, () => rnd());
      return (u, v) => {
        const y = v * T;
        const row = Math.floor(y / pitch);
        const ly = y - row * pitch;
        // the gap between boards: dark, deep
        if (ly > d.width) return [base[0] * 0.18, base[1] * 0.17, base[2] * 0.16, 0];
        const jx = joints[row] * T;
        const dx = Math.min(Math.abs(u * T - jx), T - Math.abs(u * T - jx));
        if (dx < 1.5) return [base[0] * 0.3, base[1] * 0.28, base[2] * 0.26, 0.05];
        const id = row * 2 + (u * T > jx ? 1 : 0);
        const r1 = hash(id, 4, 13), r2 = hash(id, 8, 13);
        const edge = smooth(clamp01(Math.min(ly, d.width - ly) / 4));
        const g = grain(u + r2, v);
        let k: number, h: number;
        if (composite) {
          k = 0.97 + (r1 - 0.5) * 0.06 + (streak(u + r2, v) - 0.5) * 0.12 + (g - 0.5) * 0.06;
          h = 0.85 + (g - 0.5) * 0.12;
        } else {
          const ring = Math.abs(Math.sin((v * rows * 6 + g * 5 + r2 * 9) * Math.PI));
          const [d1] = knots(u + r1 * 0.37, v);
          const knot = d.boards === "softwood" && d1 < 0.06 && r2 > 0.5 ? 1 - d1 / 0.06 : 0;
          k = 0.92 + (r1 - 0.5) * 0.24 + (g - 0.5) * 0.28 - Math.pow(1 - ring, 6) * 0.08 - knot * 0.3;
          // reeded softwood: ribs along the board
          const rib = d.boards === "softwood" ? 0.5 + 0.5 * Math.cos((ly / 7) * Math.PI * 2) : 0.5;
          h = 0.7 + rib * 0.2 + (g - 0.5) * 0.1 - knot * 0.1;
        }
        const s = k * mix(0.7, 1, edge);
        return [base[0] * s, base[1] * s, base[2] * s, h * mix(0.4, 1, edge)];
      };
    },
  };
}

/** The recipe for a "pave:…" or "deck:…" surface key, or null for any other name. */
export function pavingRecipe(key: string): Recipe | null {
  const at = key.indexOf(":");
  const group = key.slice(0, at), name = key.slice(at + 1);
  if (group === "pave") {
    const p = parsePavingKey(name);
    return p ? paving(p) : null;
  }
  if (group === "deck") {
    const d = parseDeckKey(name);
    return d ? deck(d) : null;
  }
  return null;
}

/** Laid out without drawing: the unit at any point of the plane, in mm (for tests). */
export function pavingHits(p: PavingLook, seed = 1): (x: number, y: number) => number {
  const T = pavingTile(p);
  const layout = layoutOf(p, T, rng(seed));
  return (x, y) => layout(mod(x, T), mod(y, T)).id;
}
