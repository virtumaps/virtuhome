// Reads the tests' PNG pictures without a decoder library.
import { inflateSync } from "node:zlib";

/** An 8-bit grey or colour PNG, as grey. */
export function decodePng(file: Uint8Array): { grey: Uint8Array; width: number; height: number } {
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  let width = 0, height = 0, type = 0;
  const data: Uint8Array[] = [];
  for (let at = 8; at < file.length; ) {
    const len = view.getUint32(at), name = String.fromCharCode(...file.subarray(at + 4, at + 8));
    const body = file.subarray(at + 8, at + 8 + len);
    if (name === "IHDR") (width = view.getUint32(at + 8)), (height = view.getUint32(at + 12)), (type = body[9]);
    if (name === "IDAT") data.push(body);
    at += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[type] ?? 1;
  const raw = inflateSync(concat(data)), stride = width * channels;
  const px = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const a = x >= channels ? px[y * stride + x - channels] : 0, b = y ? px[(y - 1) * stride + x] : 0;
      const c = x >= channels && y ? px[(y - 1) * stride + x - channels] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      px[y * stride + x] = (v + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f]) & 255;
    }
  }
  if (channels === 1) return { grey: px, width, height };
  const grey = new Uint8Array(width * height);
  for (let i = 0; i < grey.length; i++) grey[i] = channels < 3 ? px[i * channels] : Math.round(0.299 * px[i * channels] + 0.587 * px[i * channels + 1] + 0.114 * px[i * channels + 2]);
  return { grey, width, height };
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let at = 0;
  for (const p of parts) out.set(p, at), (at += p.length);
  return out;
}
