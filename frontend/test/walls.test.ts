import { describe, expect, it } from "vitest";
import { layoutWalls, OUTSIDE } from "../src/model/walls";
import { DEFAULT_SETTINGS, type Floor } from "../src/model/plan";

const floor = (): Floor => ({
  id: "g", name: "Ground", elevation: 0, height: 2.5, walls: [], furniture: [], devices: [],
  rooms: [
    { id: "a", name: "A", area_id: null, points: [[0, 0], [3, 0], [3, 3], [0, 3]] },
    { id: "b", name: "B", area_id: null, points: [[3, 0], [6, 0], [6, 3], [3, 3]] },
  ],
  openings: [
    { id: "d", room_id: "a", edge: 1, offset: 1.5, width: 0.9, height: 2, sill: 0, kind: "door" },
    { id: "w", room_id: "b", edge: 2, offset: 1.5, width: 1.2, height: 1.2, sill: 0.9, kind: "window" },
  ],
});

describe("layoutWalls", () => {
  it("makes one inside wall where two rooms share an edge", () => {
    const { walls, orphans } = layoutWalls(floor(), DEFAULT_SETTINGS);
    expect(orphans).toHaveLength(0);
    const inside = walls.filter((w) => !w.exterior);
    expect(inside).toHaveLength(1);
    expect(inside[0].length).toBeCloseTo(3);
    expect(new Set([inside[0].roomA, inside[0].roomB])).toEqual(new Set([0, 1]));
    expect(inside[0].thickness).toBe(DEFAULT_SETTINGS.wall_interior);
    // outside: top and bottom split per room, plus the two ends
    expect(walls.filter((w) => w.exterior)).toHaveLength(6);
    expect(walls.filter((w) => w.exterior).every((w) => w.roomA === OUTSIDE || w.roomB === OUTSIDE)).toBe(true);
  });

  it("puts the door on the shared wall and the window on the outside wall", () => {
    const { walls } = layoutWalls(floor(), DEFAULT_SETTINGS);
    const door = walls.find((w) => w.openings.some((o) => o.opening.id === "d"))!;
    expect(door.exterior).toBe(false);
    const po = door.openings[0];
    expect(po.t1 - po.t0).toBeCloseTo(0.9);
    expect(po.centre[1]).toBeCloseTo(1.5);
    const win = walls.find((w) => w.openings.some((o) => o.opening.id === "w"))!;
    expect(win.exterior).toBe(true);
    expect(win.openings[0].bottom).toBeCloseTo(0.9);
    expect(win.openings[0].top).toBeCloseTo(2.1);
  });

  it("closes corners: walls meeting at an angle reach past the corner", () => {
    const { walls } = layoutWalls(floor(), DEFAULT_SETTINGS);
    const top = walls.find((w) => w.exterior && Math.abs(w.a[1]) < 1e-6 && Math.min(w.a[0], w.b[0]) < 1)!;
    const atCorner = top.a[0] < top.b[0] ? top.extendStart : top.extendEnd;
    expect(atCorner).toBeCloseTo(DEFAULT_SETTINGS.wall_exterior / 2);
  });
});
