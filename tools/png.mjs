// PNG reading and writing for the visual checks, and comparing two pictures, without dependencies.
// Reads the 8-bit, non-interlaced PNGs browsers write (greyscale, RGB, RGBA, with or without alpha).
import { deflateSync, inflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

/** A PNG's pixels: { width, height, data } with four bytes (RGBA) a pixel. */
export function readPng(buf) {
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error("not a PNG");
  let width = 0, height = 0, depth = 0, type = 0, interlace = 0;
  const idat = [];
  for (let at = 8; at < buf.length; ) {
    const len = buf.readUInt32BE(at);
    const kind = buf.toString("latin1", at + 4, at + 8);
    const body = buf.subarray(at + 8, at + 8 + len);
    if (kind === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      [depth, type, , , interlace] = body.subarray(8, 13);
    } else if (kind === "IDAT") idat.push(body);
    else if (kind === "IEND") break;
    at += 12 + len;
  }
  const ch = CHANNELS[type];
  if (depth !== 8 || !ch || interlace) throw new Error(`unsupported PNG (depth ${depth}, colour type ${type}, interlace ${interlace})`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const px = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = px.subarray(y * stride, (y + 1) * stride);
    const up = y ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? row[i - ch] : 0;
      const b = up ? up[i] : 0;
      const c = up && i >= ch ? up[i - ch] : 0;
      let v = src[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      row[i] = v & 255;
    }
  }
  const data = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < data.length; i += 4, j += ch) {
    if (ch >= 3) {
      data[i] = px[j];
      data[i + 1] = px[j + 1];
      data[i + 2] = px[j + 2];
    } else data[i] = data[i + 1] = data[i + 2] = px[j];
    data[i + 3] = ch === 4 ? px[j + 3] : ch === 2 ? px[j + 1] : 255;
  }
  return { width, height, data };
}

const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function chunk(kind, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(kind, 4, "latin1");
  let c = -1;
  for (const b of [...head.subarray(4), ...body]) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE((c ^ -1) >>> 0, 0);
  return Buffer.concat([head, body, tail]);
}

/** Pixels ({ width, height, data } in RGBA) as an RGB PNG. */
export function writePng({ width, height, data }) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const at = y * (width * 3 + 1);
    // "up" filtering: rows of a picture are much like the row above
    raw[at] = 2;
    for (let x = 0; x < width; x++) {
      for (let k = 0; k < 3; k++) {
        const i = (y * width + x) * 4 + k;
        raw[at + 1 + x * 3 + k] = (data[i] - (y ? data[i - width * 4] : 0)) & 255;
      }
    }
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0);
  head.writeUInt32BE(height, 4);
  head[8] = 8;
  head[9] = 2;
  return Buffer.concat([SIGNATURE, chunk("IHDR", head), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

/**
 * How far apart two colours look, 0 (the same) to 1: the difference in brightness counts most, as in
 * YIQ (the measure pixelmatch uses).
 */
function colourDelta(a, i, b, j) {
  const dr = a[i] - b[j], dg = a[i + 1] - b[j + 1], db = a[i + 2] - b[j + 2];
  const y = dr * 0.29889531 + dg * 0.58662247 + db * 0.11448223;
  const iq = dr * 0.59597799 - dg * 0.2741761 - db * 0.32180189;
  const q = dr * 0.21147017 - dg * 0.52261711 + db * 0.31114694;
  return Math.sqrt((0.5053 * y * y + 0.299 * iq * iq + 0.1957 * q * q) / 35215);
}

/**
 * Compares two pictures of the same size: how many pixels differ by more than `threshold` (0..1), as a
 * share of all, and a picture of the two side by side with the differences in red between them.
 */
export function compare(expected, actual, threshold = 0.1) {
  if (expected.width !== actual.width || expected.height !== actual.height) {
    return { ratio: 1, differ: expected.width * expected.height, sized: false, diff: null };
  }
  const { width: w, height: h } = expected;
  const marks = { width: w, height: h, data: new Uint8Array(w * h * 4) };
  let differ = 0;
  for (let i = 0; i < w * h * 4; i += 4) {
    const d = colourDelta(expected.data, i, actual.data, i);
    if (d > threshold) {
      differ++;
      marks.data.set([255, 0, 0, 255], i);
    } else {
      // the picture faded, so the differences stand out
      const grey = 255 - (255 - (expected.data[i] * 0.3 + expected.data[i + 1] * 0.59 + expected.data[i + 2] * 0.11)) * 0.15;
      marks.data.set([grey, grey, grey, 255], i);
    }
  }
  return { ratio: differ / (w * h), differ, sized: true, diff: sideBySide([expected, marks, actual]) };
}

/** Pictures of the same height side by side, with a gap between them. */
export function sideBySide(pics, gap = 8) {
  const height = Math.max(...pics.map((p) => p.height));
  const width = pics.reduce((s, p) => s + p.width, 0) + gap * (pics.length - 1);
  const data = new Uint8Array(width * height * 4).fill(255);
  let left = 0;
  for (const p of pics) {
    for (let y = 0; y < p.height; y++) data.set(p.data.subarray(y * p.width * 4, (y + 1) * p.width * 4), (y * width + left) * 4);
    left += p.width + gap;
  }
  return { width, height, data };
}
