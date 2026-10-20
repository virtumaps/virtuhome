import { readdirSync, readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findRooms, type FindResult } from "../src/editor/roomfind";
import { findRoomsAside } from "../src/editor/roomfind-client";
import type { Vec2 } from "../src/model/plan";

// floor plan pictures drawn for these tests by fixtures/floorplans/generate.mjs, with their true rooms
const DIR = new URL("./fixtures/floorplans/", import.meta.url);

interface Truth {
  picture: string;
  width: number;
  height: number;
  scale: number;
  rooms: { name: string; points: Vec2[] }[];
  openings: { kind: string; at: Vec2; width: number }[];
}

/** An 8-bit grey or colour PNG, as grey. */
function decodePng(file: Uint8Array): { grey: Uint8Array; width: number; height: number } {
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

const inside = (p: Vec2, pts: Vec2[]) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    if (pts[i][1] > p[1] !== pts[j][1] > p[1] && p[0] < ((pts[j][0] - pts[i][0]) * (p[1] - pts[i][1])) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c;
  }
  return c;
};

/** A point well inside a room: the middle of the widest row through it. */
function insidePoint(pts: Vec2[]): Vec2 {
  const ys = [...new Set(pts.map((p) => p[1]))].sort((a, b) => a - b);
  let best: Vec2 = pts[0], width = -1;
  for (let k = 1; k < ys.length; k++) {
    const y = (ys[k - 1] + ys[k]) / 2, xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if (a[1] > y !== b[1] > y) xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > width) (width = xs[i + 1] - xs[i]), (best = [(xs[i] + xs[i + 1]) / 2, y]);
  }
  return best;
}

/** Each corner of one outline within `tol` of a corner of the other, both ways round. */
function sameCorners(a: Vec2[], b: Vec2[], tol: number): boolean {
  const near = (p: Vec2, list: Vec2[]) => list.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) <= tol);
  return a.every((p) => near(p, b)) && b.every((p) => near(p, a));
}

function score(truth: Truth, res: FindResult) {
  const m = (p: Vec2): Vec2 => [p[0] * truth.scale, p[1] * truth.scale];
  const rooms = truth.rooms.filter((r) => {
    const c = insidePoint(r.points);
    const found = res.rooms.find((f) => inside(c, f.pixels));
    return !!found && sameCorners(r.points.map(m), found.pixels.map(m), 0.15);
  });
  const openings = truth.openings.filter((o) =>
    res.gaps.some((g) => Math.hypot(g.pixel[0] - o.at[0], g.pixel[1] - o.at[1]) * truth.scale <= 0.15 && Math.abs(g.width - o.width) <= 0.15 && g.kind === o.kind));
  return { rooms: rooms.length, openings: openings.length };
}

describe("finding the rooms in floor plan pictures", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
  const totals = { rooms: 0, found: 0, openings: 0, opened: 0 };

  it("has at least ten pictures to try", () => expect(files.length).toBeGreaterThanOrEqual(10));

  for (const file of files) {
    it(`finds the rooms in ${file.replace(".json", "")}`, () => {
      const truth = JSON.parse(new TextDecoder().decode(readFileSync(new URL(file, DIR)))) as Truth;
      const png = decodePng(readFileSync(new URL(truth.picture, DIR)));
      const t0 = performance.now();
      const res = findRooms({ ...png, scale: truth.scale });
      const ms = performance.now() - t0;
      const sc = score(truth, res);
      totals.rooms += truth.rooms.length;
      totals.found += sc.rooms;
      totals.openings += truth.openings.length;
      totals.opened += sc.openings;
      console.log(`${file.replace(".json", "").padEnd(16)} rooms ${sc.rooms}/${truth.rooms.length}  openings ${sc.openings}/${truth.openings.length}  ${png.width}x${png.height} in ${Math.round(ms)} ms`);
      expect(ms).toBeLessThan(3000);
    });
  }

  it("gets at least 80% of the rooms with every corner within 15 cm", () => {
    console.log(`all: rooms ${totals.found}/${totals.rooms}, openings ${totals.opened}/${totals.openings}`);
    expect(totals.found / totals.rooms).toBeGreaterThanOrEqual(0.8);
  });
});

describe("finding the rooms off the page's thread", () => {
  const made: FakeWorker[] = [];
  class FakeWorker {
    onmessage: ((e: { data: unknown }) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    sent: unknown[] = [];
    stopped = false;
    constructor(public url: URL, public options: { type: string }) {
      made.push(this);
    }
    postMessage(msg: unknown, transfer: unknown[]) {
      this.sent.push(msg, transfer);
      setTimeout(() => this.onmessage?.({ data: { ok: true, result: { rooms: [], gaps: [], angle: 0, wall: 0.1 } } }), 5);
    }
    terminate() {
      this.stopped = true;
    }
  }
  afterEach(() => {
    vi.unstubAllGlobals();
    made.length = 0;
  });
  const input = () => ({ grey: new Uint8Array(4).fill(255), width: 2, height: 2, scale: 0.01 });

  it("hands the picture to a module worker of its own and gives back what it found", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const res = await findRoomsAside(input());
    expect(res.wall).toBe(0.1);
    expect(made[0].url.pathname.endsWith("/roomfind-worker.js")).toBe(true);
    expect(made[0].options.type).toBe("module");
    expect(made[0].stopped).toBe(true);
  });

  it("stops the worker when the search is called off", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const stop = new AbortController();
    const found = findRoomsAside(input(), stop.signal);
    stop.abort();
    await expect(found).rejects.toThrow("Stopped");
    expect(made[0].stopped).toBe(true);
  });
});
