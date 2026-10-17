import { describe, expect, it } from "vitest";
import { groundOf, splitEdge, type Floor } from "../src/model/plan";

const floor = (): Floor => ({
  id: "g", name: "Ground", elevation: 0, height: 2.5, walls: [], furniture: [], devices: [],
  rooms: [{ id: "a", name: "A", area_id: null, points: [[0, 0], [4, 0], [4, 3], [0, 3]] }],
  openings: [
    { id: "near", room_id: "a", edge: 0, offset: 1, width: 0.9, height: 2, sill: 0, kind: "door" },
    { id: "far", room_id: "a", edge: 0, offset: 3, width: 1.2, height: 1.2, sill: 0.9, kind: "window" },
    { id: "next", room_id: "a", edge: 1, offset: 1.5, width: 1.2, height: 1.2, sill: 0.9, kind: "window" },
  ],
  outdoor: [{ id: "drive", name: "Driveway", kind: "driveway", area_id: null, points: [[0, 5], [6, 5], [6, 9], [0, 9]] }],
});

describe("splitEdge", () => {
  it("puts the corner where it is asked for, not on the longest edge", () => {
    const f = floor();
    // the driveway's short right-hand edge, a quarter of the way down
    const i = splitEdge(f, "drive", true, 1, 1);
    expect(i).toBe(2);
    expect(f.outdoor![0].points).toEqual([[0, 5], [6, 5], [6, 6], [6, 9], [0, 9]]);
  });

  it("adds a corner on the closing edge", () => {
    const f = floor();
    splitEdge(f, "drive", true, 3, 2);
    expect(f.outdoor![0].points).toEqual([[0, 5], [6, 5], [6, 9], [0, 9], [0, 7]]);
  });

  it("moves doors and windows past the new corner to the edge's second half", () => {
    const f = floor();
    splitEdge(f, "a", false, 0, 2);
    const o = Object.fromEntries(f.openings.map((x) => [x.id, x]));
    expect([o.near.edge, o.near.offset]).toEqual([0, 1]);
    expect([o.far.edge, o.far.offset]).toEqual([1, 1]);
    expect([o.next.edge, o.next.offset]).toEqual([2, 1.5]);
  });
});

describe("groundOf", () => {
  it("tells an asphalt driveway from block paving", () => {
    const d = floor().outdoor![0];
    expect(groundOf(d)).toBe("driveway");
    expect(groundOf({ ...d, surface: "asphalt" })).toBe("asphalt");
    expect(groundOf({ ...d, kind: "path", surface: "asphalt" })).toBe("path");
  });
});
