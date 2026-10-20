// Finds the rooms in a floor plan picture with plain image processing, so the picture never leaves
// the browser: ink is split from paper, thick strokes are kept as walls (text, dimension lines and
// furniture are drawn thin), gaps in walls are closed and remembered as doors and windows, the free
// space between the walls is filled into regions, and each region's outline is straightened, squared
// to the plan's main directions and moved out to the middle of its walls, so neighbouring rooms share
// edges as the plan stores them. Runs in a worker (roomfind-worker.ts); this module is pure.
import type { Vec2 } from "../model/plan";

export interface FindInput {
  /** One byte per pixel, 0 black to 255 white, row by row. */
  grey: Uint8Array;
  width: number;
  height: number;
  /** Metres per pixel. */
  scale: number;
  /** Where the picture's middle sits on the plan and its turn (degrees clockwise), as a floor background. */
  place?: { x: number; z: number; rotation: number };
}

export type GapKind = "door" | "window" | "passage";

export interface FoundRoom {
  /** Along the middle of its walls: in picture pixels, and on the plan (m). */
  pixels: Vec2[];
  points: Vec2[];
  /** 0 to 1: how much of the outline follows walls drawn in the picture. */
  confidence: number;
}

export interface FoundGap {
  kind: GapKind;
  /** The room it opens from, the edge it sits on, and its middle's distance from points[edge] (m). */
  room: number;
  edge: number;
  offset: number;
  width: number;
  /** Doors: the jamb the leaf hangs on (as the plan stores it), and which way it swings from `room`. */
  hinge?: "left" | "right";
  swing?: "in" | "out";
  /** Its middle in picture pixels and on the plan. */
  pixel: Vec2;
  at: Vec2;
}

export interface FindResult {
  rooms: FoundRoom[];
  gaps: FoundGap[];
  /** The turn of the drawing found and straightened out (degrees), and the inside walls' thickness (m). */
  angle: number;
  wall: number;
}

/** Bigger pictures are averaged down first: finer pixels don't help and cost time. */
const MAX_SIDE = 2400;
/** The widest gap in a wall closed as an opening (m); wider ones are open plan. */
const MAX_GAP = 3;
const MIN_ROOM_AREA = 0.8;

export function findRooms(input: FindInput): FindResult {
  const k = Math.max(1, Math.ceil(Math.max(input.width, input.height) / MAX_SIDE));
  const w0 = Math.floor(input.width / k), h0 = Math.floor(input.height / k);
  const grey0 = k > 1 ? shrink(input.grey, input.width, w0, h0, k) : input.grey;
  const s = input.scale * k; // metres per working pixel
  // walls found once as drawn, to measure the drawing's turn from their edges alone (not the text's)
  let found = wallsOf(grey0, w0, h0, s);
  const angle = mainAngle(found.wall, w0, h0);
  const { px: grey, w, h, back } = straighten(grey0, w0, h0, angle);
  if (angle) found = wallsOf(grey, w, h, s, found);
  const { ink, wall, half, outer } = found;
  const n = w * h;

  // gaps in straight walls closed along the wall; what's left open to the outside is found by
  // closing the whole drawing with a large disc (bay windows, slanted walls)
  const bridge = closeGaps(wall, w, h, s, half, outer);
  // a bridge thinner than any wall joins something else (bold text) to a wall
  const parts = bridgeParts(bridge, w, h).filter((g) => {
    if (g.b1 - g.b0 >= half * 1.4) return true;
    for (const i of g.pixels) bridge[i] = 0;
    return false;
  });
  const solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) solid[i] = wall[i] || bridge[i] ? 1 : 0;
  const outside = outsideOf(solid, w, h, s);
  const kind = new Uint8Array(n); // 0 free, 1 wall, 2 bridge, 3 an open gap to the outside, 4 outside
  for (let i = 0; i < n; i++) kind[i] = wall[i] ? 1 : bridge[i] ? 2 : outside[i] ? 4 : 0;
  fillOpenGaps(kind, w, h, Math.ceil(outer * 2.2));

  const regions = freeRegions(kind, w, h, s);
  const tolerance = Math.max(1.5, 0.025 / s);
  const rooms: { edges: Edge[]; confidence: number }[] = [];
  for (const r of regions) {
    const face = squared(trace(r.label, r.start, regions.labels, w, h), tolerance);
    if (face.length < 3) continue;
    const edges = toMiddle(face, kind, w, h, s, half * 2);
    if (edges.length >= 3) rooms.push({ edges, confidence: r.confidence * shapeAgreement(face, r.area) });
  }
  snapLines(rooms.map((r) => r.edges), 0.06 / s);
  const kept: { pts: Vec2[]; confidence: number }[] = [];
  for (const r of rooms) {
    const pts = tidy(r.edges, s);
    if (pts.length >= 3 && signedArea(pts) * s * s >= MIN_ROOM_AREA) kept.push({ pts, confidence: r.confidence });
  }

  // plan points: picture pixels through the background's placement
  const place = input.place ?? { x: 0, z: 0, rotation: 0 };
  const rot = (place.rotation * Math.PI) / 180;
  const toPicture = (p: Vec2): Vec2 => {
    const q = back(p);
    return [q[0] * k, q[1] * k];
  };
  const toPlan = (q: Vec2): Vec2 => {
    const a = (q[0] - input.width / 2) * input.scale, b = (q[1] - input.height / 2) * input.scale;
    return [place.x + a * Math.cos(rot) - b * Math.sin(rot), place.z + a * Math.sin(rot) + b * Math.cos(rot)];
  };
  const out: FoundRoom[] = kept.map((r) => {
    const pixels = r.pts.map(toPicture);
    return { pixels: pixels.map(round2), points: pixels.map((q) => round3(toPlan(q))), confidence: Math.round(r.confidence * 100) / 100 };
  });
  const gaps = findGaps(parts, ink, wall, w, h, s, kept.map((r) => r.pts)).map((g) => {
    const room = out[g.room];
    const a = room.points[g.edge], b = room.points[(g.edge + 1) % room.points.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const offset = Math.max(g.width / 2, Math.min(len - g.width / 2, g.along * s));
    const at: Vec2 = [a[0] + ((b[0] - a[0]) * offset) / len, a[1] + ((b[1] - a[1]) * offset) / len];
    const gap: FoundGap = { kind: g.kind, room: g.room, edge: g.edge, offset: round3s(offset), width: round3s(g.width * s), pixel: round2(toPicture(g.centre)), at: round3(at) };
    if (g.kind === "door") {
      // as the plan has it: "left" hangs on the end nearer the start of the wall's line
      let ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (ang < 0) ang += Math.PI;
      if (ang >= Math.PI - 0.012) ang -= Math.PI;
      const dirAlong = Math.cos(ang) * (b[0] - a[0]) + Math.sin(ang) * (b[1] - a[1]) > 0;
      gap.hinge = g.hingeAtStart === dirAlong ? "left" : "right";
      gap.swing = g.swingIn ? "in" : "out";
    }
    return gap;
  });
  return { rooms: out, gaps, angle: Math.round(angle * 100) / 100, wall: round3s(half * 2 * s) };
}

const round2 = (p: Vec2): Vec2 => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100];
const round3 = (p: Vec2): Vec2 => [round3s(p[0]), round3s(p[1])];
const round3s = (v: number) => Math.round(v * 1000) / 1000;

// ---------------------------------------------------------------- pixels

/**
 * Ink split from paper, pinholes closed, and the walls in it: ink thick enough to hold a disc a little
 * thinner than the thinnest wall, spread back out by the disc (an opening, so text and lines go).
 */
function wallsOf(grey: Uint8Array, w: number, h: number, s: number, known?: { half: number; outer: number }) {
  const n = w * h, cut = otsu(grey);
  let ink: Uint8Array = new Uint8Array(n);
  for (let i = 0; i < n; i++) ink[i] = grey[i] < cut ? 1 : 0;
  ink = grow(grow(ink, w, h, 1), w, h, 0);
  const depth = distanceTo(ink, w, h, 0);
  const { half, outer } = known ?? strokeWidths(ink, depth, w, h, s);
  const t = Math.max(1.5, Math.min(half * 0.6, half - 1));
  const core = new Uint8Array(n);
  for (let i = 0; i < n; i++) core[i] = depth[i] >= t ? 1 : 0;
  const nearCore = distanceTo(core, w, h, 1);
  const wall = new Uint8Array(n);
  for (let i = 0; i < n; i++) wall[i] = ink[i] && nearCore[i] <= t ? 1 : 0;
  dropSpecks(wall, depth, w, h, s, outer);
  return { ink, wall, half, outer };
}

function shrink(grey: Uint8Array, width: number, w: number, h: number, k: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) sum += grey[(y * k + j) * width + x * k + i];
    out[y * w + x] = Math.round(sum / (k * k));
  }
  return out;
}

/**
 * The turn of the drawing's walls (degrees, -45 to 45): the angle at which the edges of the walls
 * pile up into the fewest rows and columns.
 */
function mainAngle(wall: Uint8Array, w: number, h: number): number {
  const pts: number[] = [];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    if (wall[i] && (!wall[i - 1] || !wall[i + 1] || !wall[i - w] || !wall[i + w])) pts.push(x - w / 2, y - h / 2);
  }
  const step = Math.max(1, Math.round(pts.length / 2 / 60000)) * 2;
  const size = Math.ceil(Math.hypot(w, h)) + 4, rows = new Float64Array(size), cols = new Float64Array(size);
  const energy = (deg: number) => {
    const r = (deg * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
    rows.fill(0);
    cols.fill(0);
    for (let i = 0; i < pts.length; i += step) {
      const x = pts[i], y = pts[i + 1];
      cols[Math.round(x * c + y * sn) + (size >> 1)]++;
      rows[Math.round(y * c - x * sn) + (size >> 1)]++;
    }
    let e = 0;
    for (let i = 0; i < size; i++) e += rows[i] * rows[i] + cols[i] * cols[i];
    return e;
  };
  let best = 0, bestE = -1;
  const search = (from: number, to: number, by: number) => {
    for (let d = from; d < to + by / 2; d += by) {
      const e = energy(d);
      if (e > bestE) (bestE = e), (best = d);
    }
  };
  search(-45, 44.5, 0.5);
  const coarse = best;
  search(coarse - 0.5, coarse + 0.5, 0.05);
  return Math.abs(best) < 0.1 ? 0 : Math.round(best * 100) / 100;
}

/** The picture turned so its lines run straight across and down; `back` maps a point back into it. */
function straighten(g: Uint8Array, w: number, h: number, angle: number): { px: Uint8Array; w: number; h: number; back: (p: Vec2) => Vec2 } {
  if (!angle) return { px: g, w, h, back: (p) => p };
  const r = (angle * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const W = Math.ceil(Math.abs(w * c) + Math.abs(h * sn)), H = Math.ceil(Math.abs(w * sn) + Math.abs(h * c));
  const back = (p: Vec2): Vec2 => [w / 2 + c * (p[0] - W / 2) - sn * (p[1] - H / 2), h / 2 + sn * (p[0] - W / 2) + c * (p[1] - H / 2)];
  const px = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [u, v] = back([x + 0.5, y + 0.5]);
    const fx = u - 0.5, fy = v - 0.5, x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
    const at = (xx: number, yy: number) => (xx < 0 || yy < 0 || xx >= w || yy >= h ? 255 : g[yy * w + xx]);
    px[y * W + x] = Math.round((at(x0, y0) * (1 - ax) + at(x0 + 1, y0) * ax) * (1 - ay) + (at(x0, y0 + 1) * (1 - ax) + at(x0 + 1, y0 + 1) * ax) * ay);
  }
  return { px, w: W, h: H, back };
}

/** The grey level that best splits ink from paper. */
function otsu(g: Uint8Array): number {
  const hist = new Float64Array(256);
  for (let i = 0; i < g.length; i++) hist[g[i]]++;
  let sum = 0;
  for (let v = 0; v < 256; v++) sum += v * hist[v];
  let wB = 0, sumB = 0, best = 0, cut = 128;
  for (let v = 0; v < 256; v++) {
    wB += hist[v];
    const wF = g.length - wB;
    if (!wB || !wF) continue;
    sumB += v * hist[v];
    const between = wB * wF * (sumB / wB - (sum - sumB) / wF) ** 2;
    if (between > best) (best = between), (cut = v + 1);
  }
  return Math.max(60, Math.min(235, cut));
}

/** A 3 x 3 square grown (to = 1) or shrunk (to = 0) by one pixel. */
function grow(m: Uint8Array, w: number, h: number, to: 0 | 1): Uint8Array {
  const a = new Uint8Array(m.length), b = new Uint8Array(m.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    a[i] = m[i] === to || (x > 0 && m[i - 1] === to) || (x < w - 1 && m[i + 1] === to) ? to : 1 - to;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    b[i] = a[i] === to || (y > 0 && a[i - w] === to) || (y < h - 1 && a[i + w] === to) ? to : 1 - to;
  }
  return b;
}

/** Euclidean distance (px) from every pixel to the nearest pixel whose value in `m` is `target`. */
export function distanceTo(m: Uint8Array, w: number, h: number, target: 0 | 1): Float32Array {
  const INF = 1e20, n = Math.max(w, h);
  const f = new Float64Array(n), d = new Float64Array(n), z = new Float64Array(n + 1), v = new Int32Array(n);
  const out = new Float32Array(w * h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = m[y * w + x] === target ? 0 : INF;
    lowerEnvelope(f, h, d, v, z);
    for (let y = 0; y < h; y++) out[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) f[x] = out[row + x];
    lowerEnvelope(f, w, d, v, z);
    for (let x = 0; x < w; x++) out[row + x] = Math.sqrt(d[x]);
  }
  return out;
}

// squared distance along one line, as the lower envelope of parabolas (Felzenszwalb and Huttenlocher)
function lowerEnvelope(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array): void {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/**
 * Half the thickness (px) of the thinnest walls and of the thickest, from the ridges of the ink's
 * distance map. A wall is equally thick all along, so its ridge pixels pile up at one distance: a
 * peak standing well clear of the thin strokes (text, lines), which tail off from one or two pixels.
 */
function strokeWidths(ink: Uint8Array, depth: Float32Array, w: number, h: number, s: number): { half: number; outer: number } {
  const hist = new Float64Array(256);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, d = depth[i];
    if (!ink[i] || d < 1.5 || d < depth[i - 1] || d < depth[i + 1] || d < depth[i - w] || d < depth[i + w]) continue;
    hist[Math.min(255, Math.round(d))]++;
  }
  // strokes under 5 cm are never walls, whatever the scale says
  const from = Math.max(3, Math.round(0.025 / s));
  const peaks: number[] = [];
  for (let b = from; b < 254; b++) if (hist[b] > hist[b - 1] && hist[b] >= hist[b + 1] && hist[b] >= 1.5 * Math.min(hist[b - 1], hist[b - 2])) peaks.push(b);
  const top = Math.max(0, ...peaks.map((b) => hist[b]));
  const big = peaks.filter((b) => hist[b] >= top * 0.15);
  if (!big.length) return { half: Math.round(0.05 / s), outer: Math.round(0.15 / s) };
  return { half: big[0], outer: big[big.length - 1] };
}

/** Thick blobs too small to be walls: arrowheads, bold letters, text crossing a line, smudges. */
function dropSpecks(wall: Uint8Array, depth: Float32Array, w: number, h: number, s: number, outer: number): void {
  const seen = new Uint8Array(wall.length), stack: number[] = [], members: number[] = [];
  for (let start = 0; start < wall.length; start++) {
    if (!wall[start] || seen[start]) continue;
    let x0 = w, y0 = h, x1 = 0, y1 = 0, deepest = 0;
    members.length = 0;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop()!, x = i % w, y = (i - x) / w;
      members.push(i);
      x0 = Math.min(x0, x), x1 = Math.max(x1, x), y0 = Math.min(y0, y), y1 = Math.max(y1, y);
      deepest = Math.max(deepest, depth[i]);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy, j = yy * w + xx;
        if (xx >= 0 && yy >= 0 && xx < w && yy < h && wall[j] && !seen[j]) (seen[j] = 1), stack.push(j);
      }
    }
    // short pieces stay only as thick as outside walls (the piers of a bay)
    if (Math.max(x1 - x0, y1 - y0) * s < 1.2 && deepest < outer * 0.9) for (const i of members) wall[i] = 0;
  }
}

/**
 * Closes gaps in walls that run straight across or down: where a run of wall along a row (or a
 * column) stops at a free end of a wall, and wall carries on along the same row within MAX_GAP, the
 * pixels between become bridge (1: across, 2: down). Nothing bridges from the side of a wall, a
 * corner or a junction: there the wall is far thicker across the row than any wall.
 */
function closeGaps(wall: Uint8Array, w: number, h: number, s: number, half: number, outer: number): Uint8Array {
  const across = runs(wall, w, h, 1, w), down = runs(wall, w, h, w, 1);
  const bridge = new Uint8Array(wall.length);
  const maxGap = MAX_GAP / s, back = Math.round(half);
  const scan = (lines: number, len: number, step: number, lineStep: number, along: Uint16Array, side: Uint16Array, mark: number) => {
    // a free end: about as thick across as a wall (not a burr on a wall's face, nor where another wall
    // meets it), and running along the line
    const isEnd = (i: number) => side[i] >= half * 1.4 && side[i] <= outer * 2.6 && along[i] >= side[i];
    for (let l = 0; l < lines; l++) {
      let last = -1; // index along the line of the last wall pixel
      for (let p = 0; p < len; p++) {
        const i = l * lineStep + p * step;
        if (!wall[i]) continue;
        if (last >= 0 && p - last > 1 && p - last - 1 <= maxGap) {
          // judged a little way back from the tip, where a rounded end is as thick as its wall
          const a = l * lineStep + last * step;
          const ka = Math.min(back, (along[a] - 1) >> 1), kb = Math.min(back, (along[i] - 1) >> 1);
          if (isEnd(a - ka * step) || isEnd(i + kb * step)) for (let q = last + 1; q < p; q++) bridge[l * lineStep + q * step] ||= mark;
        }
        last = p;
      }
    }
  };
  scan(h, w, 1, w, across, down, 1);
  scan(w, h, w, 1, down, across, 2);
  return bridge;
}

/** For every set pixel, the length of the run of set pixels through it, stepping by `step`. */
function runs(m: Uint8Array, w: number, h: number, step: number, lineStep: number): Uint16Array {
  const out = new Uint16Array(m.length);
  const lines = step === 1 ? h : w, len = step === 1 ? w : h;
  for (let l = 0; l < lines; l++) {
    let p = 0;
    while (p < len) {
      if (!m[l * lineStep + p * step]) {
        p++;
        continue;
      }
      let q = p;
      while (q < len && m[l * lineStep + q * step]) q++;
      const n = Math.min(65535, q - p);
      for (let r = p; r < q; r++) out[l * lineStep + r * step] = n;
      p = q;
    }
  }
  return out;
}

/**
 * What lies outside the building: reachable from the picture's edge once the walls are closed with a
 * disc wide enough to span any opening. Worked out on a coarse grid; it only needs to be roughly right.
 */
function outsideOf(solid: Uint8Array, w: number, h: number, s: number): Uint8Array {
  const radius = MAX_GAP / 2 / s;
  const f = Math.max(1, Math.round(radius / 24)), r = radius / f, pad = Math.ceil(r) + 2;
  const cw = Math.ceil(w / f) + 2 * pad, ch = Math.ceil(h / f) + 2 * pad;
  const coarse = new Uint8Array(cw * ch);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (solid[y * w + x]) coarse[(Math.floor(y / f) + pad) * cw + Math.floor(x / f) + pad] = 1;
  const grown = distanceTo(coarse, cw, ch, 1);
  const dilated = new Uint8Array(cw * ch);
  for (let i = 0; i < dilated.length; i++) dilated[i] = grown[i] <= r ? 1 : 0;
  const shrunk = distanceTo(dilated, cw, ch, 0);
  const out = new Uint8Array(cw * ch);
  const stack = [0];
  out[0] = 1;
  while (stack.length) {
    const i = stack.pop()!, x = i % cw, y = (i - x) / cw;
    for (const j of [x > 0 ? i - 1 : -1, x < cw - 1 ? i + 1 : -1, y > 0 ? i - cw : -1, y < ch - 1 ? i + cw : -1]) {
      if (j >= 0 && !out[j] && shrunk[j] <= r) (out[j] = 1), stack.push(j);
    }
  }
  const res = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) res[y * w + x] = out[(Math.floor(y / f) + pad) * cw + Math.floor(x / f) + pad] && !solid[y * w + x] ? 1 : 0;
  return res;
}

/**
 * Free pixels reached from the outside within a wall's thickness without crossing a wall: the openings
 * left in outside walls (a bay's windows), filled so the rooms behind them keep a straight face.
 */
function fillOpenGaps(kind: Uint8Array, w: number, h: number, depth: number): void {
  let front: number[] = [];
  for (let i = 0; i < kind.length; i++) if (kind[i] === 4) front.push(i);
  for (let d = 0; d < depth && front.length; d++) {
    const next: number[] = [];
    for (const i of front) {
      const x = i % w, y = (i - x) / w;
      // eight ways round, so a slanted wall is as thick as a straight one
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy, j = yy * w + xx;
        if (xx >= 0 && yy >= 0 && xx < w && yy < h && kind[j] === 0) (kind[j] = 3), next.push(j);
      }
    }
    front = next;
  }
}

interface Region {
  label: number;
  start: number;
  area: number;
  confidence: number;
}

/** The free space split into rooms: pieces that keep clear of the picture's edge, big enough to be a room. */
function freeRegions(kind: Uint8Array, w: number, h: number, s: number): Region[] & { labels: Int32Array } {
  const labels = new Int32Array(w * h);
  const regions: Region[] = [];
  const stack: number[] = [];
  let next = 0;
  for (let start = 0; start < kind.length; start++) {
    if (kind[start] || labels[start]) continue;
    const label = ++next;
    let area = 0, edge = false, x0 = w, x1 = 0, y0 = h, y1 = 0, walls = 0, near = 0, open = 0;
    labels[start] = label;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop()!, x = i % w, y = (i - x) / w;
      area++;
      x0 = Math.min(x0, x), x1 = Math.max(x1, x), y0 = Math.min(y0, y), y1 = Math.max(y1, y);
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j < 0) continue;
        const kj = kind[j];
        if (kj === 0) {
          if (!labels[j]) (labels[j] = label), stack.push(j);
        } else if (kj <= 2) walls++;
        else if (kj === 3) near++;
        else open++;
      }
    }
    const around = walls + near + open;
    if (edge || area * s * s < MIN_ROOM_AREA || Math.min(x1 - x0, y1 - y0) * s < 0.5 || open > around * 0.3) continue;
    regions.push({ label, start, area, confidence: around ? (walls + near * 0.5) / around : 0 });
  }
  return Object.assign(regions, { labels });
}

// ---------------------------------------------------------------- outlines

/**
 * The outer outline of a region along the cracks between pixels, clockwise on screen (the region on
 * the right), as its corners. Pixels touching only at a corner count as apart.
 */
function trace(label: number, start: number, labels: Int32Array, w: number, h: number): Vec2[] {
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && labels[y * w + x] === label;
  const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
  // the region's first pixel in reading order: its top left corner is a corner of the outline
  const x0 = start % w, y0 = (start - x0) / w;
  let x = x0, y = y0, dir = 0;
  const pts: Vec2[] = [[x0, y0]];
  for (;;) {
    x += DX[dir];
    y += DY[dir];
    if (x === x0 && y === y0) break;
    // the pixels ahead on the right and on the left of the corner (x, y), heading `dir`
    const fr = dir === 0 ? at(x, y) : dir === 1 ? at(x - 1, y) : dir === 2 ? at(x - 1, y - 1) : at(x, y - 1);
    const fl = dir === 0 ? at(x, y - 1) : dir === 1 ? at(x, y) : dir === 2 ? at(x - 1, y) : at(x - 1, y - 1);
    const turn = !fr ? 1 : fl ? 3 : 0;
    if (turn) {
      dir = (dir + turn) % 4;
      pts.push([x, y]);
    }
  }
  return pts;
}

/** Douglas–Peucker on a closed outline: the corners that matter, as indices. */
function simplify(pts: Vec2[], tol: number): number[] {
  const n = pts.length;
  if (n < 4) return pts.map((_, i) => i);
  let far = 0, fd = -1;
  for (let i = 1; i < n; i++) {
    const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2;
    if (d > fd) (fd = d), (far = i);
  }
  const keep = new Uint8Array(n);
  keep[0] = keep[far] = 1;
  const stack: [number, number][] = [[0, far], [far, n]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const pa = pts[a], pb = pts[b % n];
    const dx = pb[0] - pa[0], dy = pb[1] - pa[1], l = Math.hypot(dx, dy) || 1;
    let best = -1, bd = tol;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i][0] - pa[0]) * dy - (pts[i][1] - pa[1]) * dx) / l;
      if (d > bd) (bd = d), (best = i);
    }
    if (best >= 0) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(i);
  return out;
}

/** A straight line of an outline: points p with n·p = c, n pointing out of the room. */
interface Edge {
  /** "h" runs across the picture, "v" down it, "d" at a slant. */
  k: "h" | "v" | "d";
  n: Vec2;
  c: number;
  /** Length, for weighting. */
  len: number;
  /** The corner it ends at, as first found (for putting a step after it). */
  end: Vec2;
  /** Moved out to the middle of its wall. */
  moved?: boolean;
}

const SQUARE = Math.sin((15 * Math.PI) / 180);

const kindOf = (n: Vec2): Edge["k"] => (Math.abs(n[1]) > 0.999 ? "h" : Math.abs(n[0]) > 0.999 ? "v" : "d");

/** The outline's straight lines, squared to the picture's directions where they nearly follow them. */
function squared(crack: Vec2[], tol: number): Edge[] {
  if (crack.length < 4) return [];
  const idx = simplify(crack, tol);
  const edges: Edge[] = [];
  for (let e = 0; e < idx.length; e++) {
    const i0 = idx[e], i1 = e + 1 < idx.length ? idx[e + 1] : idx[0] + crack.length;
    const a = crack[i0], b = crack[i1 % crack.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (l < 1e-9) continue;
    const u: Vec2 = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    // the room is on the right of the clockwise outline, so out is on the left
    let n: Vec2 = [u[1], -u[0]];
    if (Math.abs(u[1]) < SQUARE) n = [0, Math.sign(n[1])];
    else if (Math.abs(u[0]) < SQUARE) n = [Math.sign(n[0]), 0];
    else if (Math.abs(Math.abs(u[0]) - Math.abs(u[1])) < 0.1) n = [Math.sign(n[0]) * Math.SQRT1_2, Math.sign(n[1]) * Math.SQRT1_2];
    const k = kindOf(n);
    // where the line lies: the crack segments along it, weighted by length
    let sum = 0, weight = 0;
    for (let i = i0; i < i1; i++) {
      const p = crack[i % crack.length], q = crack[(i + 1) % crack.length];
      if ((k === "h" && p[1] !== q[1]) || (k === "v" && p[0] !== q[0])) continue;
      const sl = Math.hypot(q[0] - p[0], q[1] - p[1]);
      sum += ((n[0] * (p[0] + q[0]) + n[1] * (p[1] + q[1])) / 2) * sl;
      weight += sl;
    }
    const c = weight ? sum / weight : (n[0] * (a[0] + b[0]) + n[1] * (a[1] + b[1])) / 2;
    edges.push({ k, n, c, len: l, end: b });
  }
  return joinSteps(edges, 2);
}

const parallel = (a: Edge, b: Edge) => a.n[0] * b.n[0] + a.n[1] * b.n[1] > 0.985;

/**
 * Lines next to each other going the same way become one where they nearly coincide; otherwise a line
 * at right angles joins them (a step in the outline).
 */
function joinSteps(edges: Edge[], tol: number): Edge[] {
  const out = edges.slice();
  for (let i = 0; i < out.length && out.length > 2; ) {
    const j = (i + 1) % out.length, a = out[i], b = out[j];
    if (!parallel(a, b)) {
      i++;
      continue;
    }
    if (Math.abs(a.c - b.c) <= tol) {
      const len = a.len + b.len || 1;
      out[i] = { ...a, c: (a.c * a.len + b.c * b.len) / len, len, end: b.end, moved: a.moved || b.moved };
      out.splice(j, 1);
      if (j < i) i--;
    } else {
      // the step heads out when b lies further out than a, and its outside is on its left
      const v: Vec2 = b.c > a.c ? a.n : [-a.n[0], -a.n[1]];
      const n: Vec2 = [v[1], -v[0]];
      out.splice(i + 1, 0, { k: kindOf(n), n, c: n[0] * a.end[0] + n[1] * a.end[1], len: Math.abs(a.c - b.c), end: a.end, moved: a.moved });
      i += 2;
    }
  }
  return out;
}

/** The corner where two lines meet, or null for parallel lines. */
function meet(a: Edge, b: Edge): Vec2 | null {
  const det = a.n[0] * b.n[1] - a.n[1] * b.n[0];
  if (Math.abs(det) < 1e-6) return null;
  return [(a.c * b.n[1] - b.c * a.n[1]) / det, (a.n[0] * b.c - b.n[0] * a.c) / det];
}

/** Corner i is where line i - 1 meets line i. */
function corners(edges: Edge[]): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < edges.length; i++) {
    const p = meet(edges[(i + edges.length - 1) % edges.length], edges[i]);
    if (p) pts.push(p);
  }
  return pts;
}

function signedArea(pts: Vec2[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** How well the squared outline's area agrees with the region's: low for ragged shapes. */
function shapeAgreement(face: Edge[], area: number): number {
  const pts = corners(face);
  if (pts.length !== face.length) return 0;
  return Math.max(0, Math.min(1, 1 - (Math.abs(signedArea(pts) - area) / area) * 3));
}

/**
 * Each line moved out from the face of its wall to the wall's middle: the wall's thickness is
 * measured straight out from the room at points along the line (closed gaps count as wall).
 */
function toMiddle(face: Edge[], kind: Uint8Array, w: number, h: number, s: number, fallback: number): Edge[] {
  const pts = corners(face);
  if (pts.length !== face.length) return [];
  const at = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    return xi >= 0 && yi >= 0 && xi < w && yi < h ? kind[yi * w + xi] : 0;
  };
  const maxT = 0.8 / s;
  const edges = face.map((e, i): Edge => {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // steps, and corners cut off at a slant, are too short to measure
    if (l * s < (e.k === "d" ? 0.35 : 0.15)) return { ...e, len: l, moved: false };
    const samples: number[] = [];
    const count = Math.min(25, Math.max(3, Math.floor(l / 3)));
    for (let j = 0; j < count; j++) {
      const t = 0.1 + (0.8 * (j + 0.5)) / count;
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      // through wall and closed gaps, or through a gap left open to the outside
      const open = at(x + e.n[0] * 0.5, y + e.n[1] * 0.5) === 3;
      let d = 0;
      for (; d < maxT; d++) {
        const v = at(x + e.n[0] * (d + 0.5), y + e.n[1] * (d + 0.5));
        if (open ? v !== 3 : v !== 1 && v !== 2) break;
      }
      if (d > 0 && d < maxT) samples.push(d);
    }
    samples.sort((p, q) => p - q);
    const thick = samples.length >= Math.max(2, count / 4) ? samples[samples.length >> 1] : fallback;
    return { ...e, c: e.c + thick / 2, len: l, moved: true };
  });
  // short lines (steps) move out as far as their neighbours did, on average
  const shifts = edges.map((e, i) => (e.moved ? e.c - face[i].c : 0));
  return edges.map((e, i) => {
    if (e.moved) return e;
    const p = (i + edges.length - 1) % edges.length, q = (i + 1) % edges.length;
    const m = (edges[p].moved ? 1 : 0) + (edges[q].moved ? 1 : 0);
    return { ...e, c: e.c + (m ? (shifts[p] + shifts[q]) / m : 0) };
  });
}

/** Lines of different rooms along the same wall made exactly one line, so the rooms share edges. */
function snapLines(rooms: Edge[][], tol: number): void {
  for (const k of ["h", "v"] as const) {
    const all = rooms.flat().filter((e) => e.k === k);
    const pos = (e: Edge) => e.c * (k === "h" ? e.n[1] : e.n[0]);
    all.sort((a, b) => pos(a) - pos(b));
    for (let i = 0; i < all.length; ) {
      let j = i + 1;
      while (j < all.length && pos(all[j]) - pos(all[j - 1]) <= tol) j++;
      let sum = 0, weight = 0;
      for (let m = i; m < j; m++) (sum += pos(all[m]) * all[m].len), (weight += all[m].len);
      const v = sum / weight;
      for (let m = i; m < j; m++) all[m].c = v * (k === "h" ? all[m].n[1] : all[m].n[0]);
      i = j;
    }
  }
}

/** The final corners: lines that coincide joined, slivers and tiny steps taken out. */
function tidy(edges: Edge[], s: number): Vec2[] {
  let list = joinSteps(edges, 0.01 / s);
  const short = 0.12 / s, stuck = new Set<Edge>();
  for (let guard = 0; guard < 200 && list.length > 3; guard++) {
    const pts = corners(list);
    if (pts.length !== list.length) return [];
    let worst = -1, wl = Infinity;
    for (let i = 0; i < list.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      // a corner cut off at a slant counts as short up to 35 cm
      const cut = list[i].k === "d" && list[(i + list.length - 1) % list.length].k !== "d" && list[(i + 1) % list.length].k !== "d";
      if (l < (cut ? 0.35 / s : short) && l < wl && !stuck.has(list[i])) (wl = l), (worst = i);
    }
    if (worst < 0) break;
    const p = (worst + list.length - 1) % list.length, q = (worst + 1) % list.length;
    const prev = list[p], next = list[q];
    if (!parallel(prev, next)) {
      list = list.filter((_, i) => i !== worst);
      continue;
    }
    if (Math.abs(prev.c - next.c) > short) {
      stuck.add(list[worst]);
      continue;
    }
    // a small step: the lines either side become one
    const len = prev.len + next.len || 1;
    const merged: Edge = { ...prev, c: (prev.c * prev.len + next.c * next.len) / len, len };
    list = list.filter((_, i) => i !== worst && i !== q).map((e) => (e === prev ? merged : e));
  }
  const pts = corners(list);
  return pts.length === list.length && signedArea(pts) > 0 ? pts : [];
}

// ---------------------------------------------------------------- doors and windows

interface Gap {
  kind: GapKind;
  room: number;
  edge: number;
  /** From the edge's start to the gap's middle (working px). */
  along: number;
  width: number;
  centre: Vec2;
  hingeAtStart: boolean;
  swingIn: boolean;
}

interface BridgePart {
  /** Across the picture (a row is a line along x) or down it. */
  across: boolean;
  /** Along the wall: where the gap starts and ends (its middle line across the wall); across it: the wall's faces. */
  a0: number;
  a1: number;
  b0: number;
  b1: number;
  pixels: number[];
}

/** The bridges, each closed gap on its own. */
function bridgeParts(bridge: Uint8Array, w: number, h: number): BridgePart[] {
  const seen = new Uint8Array(bridge.length);
  const parts: BridgePart[] = [];
  for (let start = 0; start < bridge.length; start++) {
    const code = bridge[start];
    if (!code || seen[start]) continue;
    const across = code === 1, lo = new Map<number, number>(), hi = new Map<number, number>(), pixels = [start];
    seen[start] = 1;
    for (let k = 0; k < pixels.length; k++) {
      const i = pixels[k], x = i % w, y = (i - x) / w;
      const a = across ? x : y, r = across ? y : x;
      lo.set(r, Math.min(lo.get(r) ?? a, a));
      hi.set(r, Math.max(hi.get(r) ?? a, a));
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j >= 0 && !seen[j] && bridge[j] === code) (seen[j] = 1), pixels.push(j);
      }
    }
    const rows = [...lo.keys()].sort((p, q) => p - q);
    // the ends of a wall are rounded a little: the row in the middle tells the gap's width
    const [a0, a1] = rows.map((r) => [lo.get(r)!, hi.get(r)! + 1]).sort((p, q) => p[1] - p[0] - (q[1] - q[0]))[rows.length >> 1];
    parts.push({ across, a0, a1, b0: rows[0], b1: rows[rows.length - 1] + 1, pixels });
  }
  // glass drawn as close lines can read as a thin wall along a window, splitting its gap in two
  for (let i = 0; i < parts.length; i++) for (let j = parts.length - 1; j > i; j--) {
    const p = parts[i], q = parts[j];
    const overlap = Math.min(p.a1, q.a1) - Math.max(p.a0, q.a0);
    const apart = Math.max(p.b0, q.b0) - Math.min(p.b1, q.b1);
    if (p.across !== q.across || overlap < 0.8 * Math.max(p.a1 - p.a0, q.a1 - q.a0) || apart > Math.max(3, (p.b1 - p.b0 + q.b1 - q.b0) / 2)) continue;
    parts[i] = { ...p, a0: Math.min(p.a0, q.a0), a1: Math.max(p.a1, q.a1), b0: Math.min(p.b0, q.b0), b1: Math.max(p.b1, q.b1), pixels: p.pixels.concat(q.pixels) };
    parts.splice(j, 1);
    j = parts.length;
  }
  return parts;
}

/**
 * Closed gaps wide enough to be openings, each put on the room edge it sits in. A door shows the arc
 * its leaf sweeps (centred on the jamb it hangs on, on the side it opens to); a window shows its glass
 * as thin lines along the gap; anything else is an open doorway.
 */
function findGaps(parts: BridgePart[], ink: Uint8Array, wall: Uint8Array, w: number, h: number, s: number, rooms: Vec2[][]): Gap[] {
  const thin = (x: number, y: number) => {
    const xi = Math.round(x), yi = Math.round(y);
    return xi >= 0 && yi >= 0 && xi < w && yi < h && ink[yi * w + xi] === 1 && !wall[yi * w + xi];
  };
  const gaps: Gap[] = [];
  for (const { across, a0, a1, b0, b1 } of parts) {
    const width = a1 - a0;
    if (width * s < 0.45 || width * s > MAX_GAP) continue;
    const mid = (b0 + b1) / 2;
    const P = (a: number, b: number): Vec2 => (across ? [a, b] : [b, a]);
    // glass: thin lines inside the gap along most of its width, clear of its faces (furniture against the wall)
    let glass = 0;
    const inset = Math.max(1, Math.round((b1 - b0) * 0.2));
    for (let a = a0 + 2; a < a1 - 2; a++) {
      let hit = false;
      for (let b = b0 + inset; b < b1 - inset && !hit; b++) hit = thin(...P(a + 0.5, b + 0.5)) || wall[Math.floor(P(a + 0.5, b + 0.5)[1]) * w + Math.floor(P(a + 0.5, b + 0.5)[0])] === 1;
      if (hit) glass++;
    }
    // a door's arc: a quarter circle about one jamb on one face, as wide as the gap
    let best = 0, hingeLow = true, side = 1;
    const slack = Math.max(2, width * 0.05);
    for (const low of [true, false]) for (const sd of [-1, 1]) {
      const ha = low ? a0 : a1, hb = sd < 0 ? b0 : b1, toward = low ? 1 : -1;
      let hits = 0, total = 0;
      for (let deg = 8; deg <= 82; deg += 3) {
        const r = (deg * Math.PI) / 180;
        let hit = false;
        for (let rad = width - slack; rad <= width + slack && !hit; rad += 0.7) hit = thin(...P(ha + toward * rad * Math.cos(r), hb + sd * rad * Math.sin(r)));
        total++;
        if (hit) hits++;
      }
      if (hits / total > best) (best = hits / total), (hingeLow = low), (side = sd);
    }
    const kind: GapKind = glass >= (width - 4) * 0.6 ? "window" : best >= 0.7 ? "door" : "passage";
    const centre = P((a0 + a1) / 2, mid);
    // the rooms whose edges run through the gap; a door goes on the room it opens into
    let found: Gap | null = null;
    for (let ri = 0; ri < rooms.length; ri++) {
      const pts = rooms[ri];
      for (let e = 0; e < pts.length; e++) {
        const p = pts[e], q = pts[(e + 1) % pts.length];
        const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const u: Vec2 = [(q[0] - p[0]) / l, (q[1] - p[1]) / l];
        if (Math.abs(across ? u[1] : u[0]) > 0.05) continue;
        const off = (centre[0] - p[0]) * u[1] - (centre[1] - p[1]) * u[0];
        const t = (centre[0] - p[0]) * u[0] + (centre[1] - p[1]) * u[1];
        if (Math.abs(off) > Math.max(3, (b1 - b0) * 0.75) || t < width * 0.3 || t > l - width * 0.3) continue;
        // the room lies on the right of its clockwise outline: is that the side the door opens to?
        const into = (across ? Math.sign(u[0]) : -Math.sign(u[1])) === side;
        const hingeAtStart = (hingeLow ? -1 : 1) * (across ? u[0] : u[1]) < 0;
        const g: Gap = { kind, room: ri, edge: e, along: t, width, centre, hingeAtStart, swingIn: into };
        if (!found || (kind === "door" && into && !found.swingIn)) found = g;
      }
    }
    if (found) gaps.push(found);
  }
  return gaps;
}
