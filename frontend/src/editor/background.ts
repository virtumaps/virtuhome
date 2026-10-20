// Floor plan images under the 2D plan, to trace rooms over: getting a picture ready, sending it to
// Home Assistant in pieces (it closes the connection on a message over 4 MB), the address to show it
// from, and the sums for placing and scaling it.
import type { Hass } from "../live/hass";
import type { FloorBackground, Vec2 } from "../model/plan";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const PIECE_BYTES = 1024 * 1024;
/** Larger pictures are made smaller first: more pixels don't help tracing. */
const MAX_SIDE = 6000;
const RESIZE_TO = 4096;

export interface PreparedImage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * A JPEG or PNG within the limits is sent as it is. Anything else the browser can open (WebP, an
 * iPhone's HEIC in Safari, a huge photo) becomes a JPEG of at most 4096 pixels a side.
 */
export async function prepareImage(file: Blob): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file isn't a picture this browser can open. Use a JPEG or PNG.");
  }
  const { width, height } = bitmap;
  if ((file.type === "image/png" || file.type === "image/jpeg") && file.size <= MAX_IMAGE_BYTES && Math.max(width, height) <= MAX_SIDE) {
    bitmap.close();
    return { blob: file, width, height };
  }
  const k = Math.min(1, RESIZE_TO / Math.max(width, height));
  const w = Math.max(1, Math.round(width * k)), h = Math.max(1, Math.round(height * k));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // transparent parts of a plan become paper white
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.9));
  if (!blob || blob.size > MAX_IMAGE_BYTES) throw new Error("The picture is too large. Try a smaller one.");
  return { blob, width: w, height: h };
}

async function base64(b: Blob): Promise<string> {
  const bytes = new Uint8Array(await b.arrayBuffer());
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Stores the image for a floor in Home Assistant; returns its file name for the plan. */
export async function uploadImage(hass: Pick<Hass, "callWS">, floorId: string, blob: Blob, progress?: (done: number) => void): Promise<string> {
  let uploadId: string | undefined;
  for (let at = 0; ; at += PIECE_BYTES) {
    const piece = blob.slice(at, at + PIECE_BYTES);
    const last = at + PIECE_BYTES >= blob.size;
    const res = await hass.callWS<{ upload_id?: string; file?: string; bytes: number }>({
      type: "virtuhome/background/upload", floor_id: floorId, offset: at, data: await base64(piece), done: last,
      ...(uploadId ? { upload_id: uploadId } : {}),
    });
    progress?.(blob.size ? Math.min(1, (at + piece.size) / blob.size) : 1);
    if (last) {
      if (!res.file) throw new Error("Home Assistant didn't store the picture.");
      return res.file;
    }
    uploadId = res.upload_id;
  }
}

/** An address the browser can load a stored image from (signed: an <image> sends no token). */
export async function imageUrl(hass: Pick<Hass, "callWS" | "hassUrl">, file: string): Promise<string> {
  const { path } = await hass.callWS<{ path: string }>({
    type: "auth/sign_path", path: `/api/virtuhome/background/${encodeURIComponent(file)}`, expires: 24 * 3600,
  });
  return hass.hassUrl ? hass.hassUrl(path) : path;
}

/**
 * A typed length in metres: "3.45", "3,45 m", "345 cm", or feet and inches as estate agents' plans
 * also give them ("11'4\"", "11 ft 4 in", "11'").
 */
export function parseLength(text: string): number | null {
  const t = text.trim().toLowerCase().replace(/,/g, ".").replace(/[’′]/g, "'").replace(/[”″]/g, '"');
  const ft = t.match(/^(\d+(?:\.\d+)?)\s*(?:'|ft|feet|foot)\s*(?:(\d+(?:\.\d+)?)\s*(?:"|''|in|inch|inches)?)?$/);
  if (ft) return Number(ft[1]) * 0.3048 + (ft[2] ? Number(ft[2]) * 0.0254 : 0);
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(mm|cm|m)?$/);
  if (!m) return null;
  const v = Number(m[1]);
  return m[2] === "mm" ? v / 1000 : m[2] === "cm" ? v / 100 : v;
}

/** A new image, `metresWide` across, centred on a plan point. */
export function placeImage(file: string, width: number, height: number, centre: Vec2, metresWide: number): FloorBackground {
  return { file, width, height, scale: metresWide / width, x: r3(centre[0]), z: r3(centre[1]), rotation: 0, opacity: 0.5, scaled: false };
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** The image's pixel under a plan point. */
export function toImage(bg: FloorBackground, p: Vec2): Vec2 {
  const r = (-bg.rotation * Math.PI) / 180;
  const dx = p[0] - bg.x, dz = p[1] - bg.z;
  return [(dx * Math.cos(r) - dz * Math.sin(r)) / bg.scale + bg.width / 2, (dx * Math.sin(r) + dz * Math.cos(r)) / bg.scale + bg.height / 2];
}

export function insideImage(bg: FloorBackground, p: Vec2): boolean {
  const [u, v] = toImage(bg, p);
  return u >= 0 && v >= 0 && u <= bg.width && v <= bg.height;
}

/** The image's corners on the plan. */
export function imageCorners(bg: FloorBackground): Vec2[] {
  const r = (bg.rotation * Math.PI) / 180;
  const hw = (bg.width * bg.scale) / 2, hh = (bg.height * bg.scale) / 2;
  return ([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]] as Vec2[]).map(([u, v]) => [bg.x + u * Math.cos(r) - v * Math.sin(r), bg.z + u * Math.sin(r) + v * Math.cos(r)]);
}

/**
 * The image scaled so that the line from a to b, as it shows on the plan now, is `length` metres
 * long. Point a stays where it is, so the wall clicked first doesn't move.
 */
export function rescale(bg: FloorBackground, a: Vec2, b: Vec2, length: number): FloorBackground | null {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (d < 1e-6 || !(length > 0)) return null;
  const k = length / d;
  return { ...bg, scale: bg.scale * k, x: r3(a[0] + (bg.x - a[0]) * k), z: r3(a[1] + (bg.z - a[1]) * k), scaled: true };
}

/** The picture's pixels as grey levels, at most `maxSide` a side: what the room finder looks at. */
export async function greyPixels(url: string, maxSide: number): Promise<{ grey: Uint8Array; width: number; height: number }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("The picture can't be loaded.");
  const bitmap = await createImageBitmap(await res.blob());
  const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * k)), height = Math.max(1, Math.round(bitmap.height * k));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const grey = new Uint8Array(width * height);
  for (let i = 0; i < grey.length; i++) grey[i] = (rgba[i * 4] * 77 + rgba[i * 4 + 1] * 150 + rgba[i * 4 + 2] * 29) >> 8;
  return { grey, width, height };
}
