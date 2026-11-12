import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findRooms, type FindResult, type FoundGap } from "../src/editor/roomfind";
import { drawingsOf, moveOver } from "../src/editor/roomfind-groups";
import type { Vec2 } from "../src/model/plan";
import { decodePng } from "./png";

// An estate agent's picture usually shows every storey: these put two of the test pictures on one sheet.
const DIR = new URL("./fixtures/floorplans/", import.meta.url);

interface Picture {
  grey: Uint8Array;
  width: number;
  height: number;
}

function load(name: string): Picture & { scale: number; rooms: number } {
  const truth = JSON.parse(new TextDecoder().decode(readFileSync(new URL(`${name}.json`, DIR)))) as { picture: string; scale: number; rooms: unknown[] };
  return { ...decodePng(readFileSync(new URL(truth.picture, DIR))), scale: truth.scale, rooms: truth.rooms.length };
}

/** Only the drawing: the paper round it cut away. */
function crop(p: Picture): Picture {
  let x0 = p.width, y0 = p.height, x1 = 0, y1 = 0;
  for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) {
    if (p.grey[y * p.width + x] < 100) (x0 = Math.min(x0, x)), (x1 = Math.max(x1, x)), (y0 = Math.min(y0, y)), (y1 = Math.max(y1, y));
  }
  const width = x1 - x0 + 1, height = y1 - y0 + 1;
  const grey = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) grey.set(p.grey.subarray((y + y0) * p.width + x0, (y + y0) * p.width + x0 + width), y * width);
  return { grey, width, height };
}

/** Two drawings on one sheet of paper, `gap` pixels apart: beside each other (tops level) or one above the other (left sides level). */
function sheet(a: Picture, b: Picture, gap: number, lie: "row" | "column"): Picture {
  const m = 90;
  const width = lie === "row" ? a.width + gap + b.width + 2 * m : Math.max(a.width, b.width) + 2 * m;
  const height = lie === "row" ? Math.max(a.height, b.height) + 2 * m : a.height + gap + b.height + 2 * m;
  const grey = new Uint8Array(width * height).fill(255);
  const put = (p: Picture, ox: number, oy: number) => {
    for (let y = 0; y < p.height; y++) grey.set(p.grey.subarray(y * p.width, (y + 1) * p.width), (y + oy) * width + ox);
  };
  put(a, m, m);
  put(b, lie === "row" ? m + a.width + gap : m, lie === "row" ? m : m + a.height + gap);
  return { grey, width, height };
}

/** One of the test pictures twice on a sheet, as an estate agent draws a home's storeys in one style. */
function twice(name: string, gapMetres: number, lie: "row" | "column") {
  const one = load(name);
  const drawing = crop(one);
  const res = findRooms({ ...sheet(drawing, drawing, Math.round(gapMetres / one.scale), lie), scale: one.scale });
  return { res, drawings: drawingsOf(res), rooms: one.rooms };
}

describe("a floor plan picture that shows several storeys", () => {
  it("keeps one drawing as one", () => {
    const p = load("semi-ground");
    const d = drawingsOf(findRooms({ ...p, scale: p.scale }));
    expect(d.list.length).toBe(1);
    expect(d.lie).toBeNull();
    expect(d.of.every((k) => k === 0)).toBe(true);
  });

  for (const [name, gap] of [["semi-ground", 3], ["terrace-ground", 0.4], ["bungalow", 0.2]] as const) {
    it(`tells two storeys of ${name} side by side, ${gap} m of paper between their labels`, { timeout: 30_000 }, () => {
      const { res, drawings, rooms } = twice(name, gap, "row");
      expect(drawings.list.length).toBe(2);
      expect(drawings.lie).toBe("row");
      expect(drawings.list[0].maxX).toBeLessThan(drawings.list[1].minX);
      expect(drawings.list.map((d) => d.rooms.length)).toEqual([rooms, rooms]);
      // nothing but paper between them: what the finder closed there belongs to neither
      res.rooms.forEach((r, i) => {
        if (drawings.of[i] < 0) for (const [x] of r.points) expect(x).toBeGreaterThan(drawings.list[0].maxX - 0.3);
      });
      // the same drawing twice: the second goes straight over the first
      const [dx, dz] = moveOver(res, drawings.list[1], drawings.list[0], drawings.lie);
      expect(dz).toBe(0);
      expect(drawings.list[1].minX + dx).toBeCloseTo(drawings.list[0].minX, 1);
    });
  }

  it("tells two storeys drawn one above the other", { timeout: 30_000 }, () => {
    const { res, drawings, rooms } = twice("semi-ground", 0.5, "column");
    expect(drawings.list.map((d) => d.rooms.length)).toEqual([rooms, rooms]);
    expect(drawings.lie).toBe("column");
    const [dx, dz] = moveOver(res, drawings.list[1], drawings.list[0], drawings.lie);
    expect(dx).toBe(0);
    expect(drawings.list[1].minZ + dz).toBeCloseTo(drawings.list[0].minZ, 1);
  });

  // rooms by hand: two wings joined by one room in the middle
  const box = (x0: number, z0: number, x1: number, z1: number): Vec2[] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const result = (gaps: Partial<FoundGap>[]): FindResult => ({
    rooms: [box(0, 0, 4, 4), box(0, 4, 4, 8), box(4, 0, 5.2, 8), box(5.2, 0, 9, 4), box(5.2, 4, 9, 8)].map((points) => ({ points, pixels: points, confidence: 1 })),
    gaps: gaps.map((g) => ({ kind: "door", room: 0, edge: 0, offset: 0, width: 0.8, pixel: [0, 0], at: [0, 0], ...g }) as FoundGap),
    angle: 0, wall: 0.1,
  });

  it("leaves out the paper between two drawings: a strip no door opens into", () => {
    const d = drawingsOf(result([{ room: 0, edge: 2, at: [2, 4] }, { kind: "window", room: 0, edge: 1, at: [4, 2] }]));
    expect(d.of).toEqual([0, 0, -1, 1, 1]);
    expect(d.lie).toBe("row");
  });

  it("stands an upper storey over the rooms below, not over the paper beside them", () => {
    // downstairs a shed stands apart on the left; upstairs is as wide as the house itself
    const rooms = [box(-3, 0, -1, 2), box(0, 0, 4, 4), box(4, 0, 8, 4), box(20, 0, 24, 4), box(24, 0, 28, 4)];
    const res: FindResult = { rooms: rooms.map((points) => ({ points, pixels: points, confidence: 1 })), gaps: [], angle: 0, wall: 0.1 };
    const d = drawingsOf(res);
    expect(d.of).toEqual([0, 0, 0, 1, 1]);
    expect(moveOver(res, d.list[1], d.list[0], d.lie)).toEqual([-20, 0]);
  });

  it("keeps a hall that joins two wings: doors open into it", () => {
    const d = drawingsOf(result([{ room: 0, edge: 1, at: [4, 2] }, { room: 3, edge: 3, at: [5.2, 2] }]));
    expect(d.list.length).toBe(1);
    expect(d.of).toEqual([0, 0, 0, 0, 0]);
  });
});
