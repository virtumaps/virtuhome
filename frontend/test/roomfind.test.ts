import { readdirSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findRooms, type FindResult } from "../src/editor/roomfind";
import { findRoomsAside } from "../src/editor/roomfind-client";
import type { Vec2 } from "../src/model/plan";
import { decodePng } from "./png";

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
      // on the plan (the picture's middle at the origin), each opening sits where it is in the picture
      for (const g of res.gaps) {
        const p: Vec2 = [(g.pixel[0] - png.width / 2) * truth.scale, (g.pixel[1] - png.height / 2) * truth.scale];
        expect(Math.hypot(g.at[0] - p[0], g.at[1] - p[1])).toBeLessThan(0.05);
      }
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
