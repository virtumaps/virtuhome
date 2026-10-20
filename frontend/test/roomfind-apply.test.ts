import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Floor, type Room, type Vec2 } from "../src/model/plan";
import { layoutWalls } from "../src/model/walls";
import { findRooms, type FindResult } from "../src/editor/roomfind";
import { foundToPlan, overlaps, startTicks } from "../src/editor/roomfind-apply";

const rect = (x0: number, z0: number, x1: number, z1: number): Vec2[] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const floorWith = (rooms: Room[]): Floor => ({ id: "g", name: "Ground", elevation: 0, height: 2.5, rooms, openings: [], furniture: [], devices: [], walls: [] });
const room = (id: string, name: string, points: Vec2[]): Room => ({ id, name, area_id: null, points });

// two rooms side by side, a door between them hung in the left one and swinging into it, a window in the right one
const found: FindResult = {
  rooms: [
    { points: rect(0, 0, 4, 3), pixels: [], confidence: 0.95 },
    { points: rect(4, 0, 7, 3), pixels: [], confidence: 0.9 },
    { points: rect(7, 0, 8, 1), pixels: [], confidence: 0.3 },
  ],
  gaps: [
    { kind: "door", room: 0, edge: 1, offset: 1.5, width: 0.8, hinge: "left", swing: "in", pixel: [0, 0], at: [4, 1.5] },
    { kind: "window", room: 1, edge: 0, offset: 1.5, width: 1.2, pixel: [0, 0], at: [5.5, 0] },
  ],
  angle: 0,
  wall: 0.1,
};

describe("keeping the rooms found", () => {
  it("ticks the sure ones that aren't over rooms already drawn", () => {
    expect(startTicks(undefined, found)).toEqual([true, true, false]);
    const drawn = floorWith([room("a", "Kitchen", rect(3.9, -0.5, 7.5, 3.5))]);
    expect(startTicks(drawn, found)).toEqual([true, false, false]);
    expect(overlaps(rect(4, 0, 7, 3), drawn.rooms)).toBe(true);
    expect(overlaps(rect(0, 0, 4, 3), drawn.rooms)).toBe(false);
    expect(overlaps(rect(-5, 0, -1, 3), drawn.rooms)).toBe(false);
  });

  it("names them on from the plan's rooms and puts the openings in their walls", () => {
    const floor = floorWith([room("a", "Room 3", rect(-5, 0, -1, 3))]);
    const { rooms, openings } = foundToPlan(floor, found, [true, true, false]);
    expect(rooms.map((r) => r.name)).toEqual(["Room 4", "Room 5"]);
    expect(rooms[0].points).toEqual(rect(0, 0, 4, 3));
    const [door, win] = openings;
    expect(door).toMatchObject({ room_id: rooms[0].id, edge: 1, offset: 1.5, width: 0.8, kind: "door", sill: 0, hinge: "left", swing: "in" });
    expect(win).toMatchObject({ room_id: rooms[1].id, edge: 0, offset: 1.5, width: 1.2, kind: "window", sill: 0.9 });
  });

  it("hangs a door in the room across the wall when its own isn't kept, swinging the same way", () => {
    const { rooms, openings } = foundToPlan(undefined, found, [false, true, false]);
    expect(rooms.map((r) => r.name)).toEqual(["Room 1"]);
    // the right room's left edge runs from (4, 3) up to (4, 0): the door's middle is 1.5 m along it
    expect(openings[0]).toMatchObject({ room_id: rooms[0].id, edge: 3, offset: 1.5, swing: "out" });
    expect(foundToPlan(undefined, found, [false, false, false])).toEqual({ rooms: [], openings: [] });
  });
});

describe("rooms found in a picture, on the plan", () => {
  it("make walls that every door and window found sits in", () => {
    const dir = new URL("./fixtures/floorplans/", import.meta.url);
    const truth = JSON.parse(new TextDecoder().decode(readFileSync(new URL("terrace-ground.json", dir)))) as { scale: number };
    const res = findRooms({ ...decodeGreyPng(readFileSync(new URL("terrace-ground.png", dir))), scale: truth.scale, place: { x: 3, z: 2, rotation: 90 } });
    const { rooms, openings } = foundToPlan(undefined, res, res.rooms.map(() => true));
    expect(rooms.length).toBe(5);
    expect(openings.length).toBe(res.gaps.length);
    const floor = { ...floorWith(rooms), openings };
    expect(layoutWalls(floor, DEFAULT_SETTINGS).orphans).toEqual([]);
    // turned a quarter on the plan: the long terrace runs across it
    const xs = rooms.flatMap((r) => r.points.map((p) => p[0]));
    const zs = rooms.flatMap((r) => r.points.map((p) => p[1]));
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(Math.max(...zs) - Math.min(...zs));
  });
});

/** The fixtures are 8-bit grey PNGs. */
function decodeGreyPng(file: Uint8Array): { grey: Uint8Array; width: number; height: number } {
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const width = view.getUint32(16), height = view.getUint32(20);
  const parts: Uint8Array[] = [];
  for (let at = 8; at < file.length; ) {
    const len = view.getUint32(at);
    if (String.fromCharCode(...file.subarray(at + 4, at + 8)) === "IDAT") parts.push(file.subarray(at + 8, at + 8 + len));
    at += 12 + len;
  }
  const joined = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  parts.reduce((at, p) => (joined.set(p, at), at + p.length), 0);
  const raw = inflateSync(joined), grey = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const v = raw[y * (width + 1) + 1 + x], a = x ? grey[y * width + x - 1] : 0, b = y ? grey[(y - 1) * width + x] : 0, c = x && y ? grey[(y - 1) * width + x - 1] : 0;
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    grey[y * width + x] = (v + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][raw[y * (width + 1)]]) & 255;
  }
  return { grey, width, height };
}
