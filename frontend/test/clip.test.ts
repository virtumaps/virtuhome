import { describe, expect, it } from "vitest";
import { clipToRect } from "../src/scene/build";
import { area } from "../src/model/geom";
import type { Vec2 } from "../src/model/plan";

describe("clipToRect", () => {
  const L: Vec2[] = [[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]];
  it("keeps the area of an L-shaped room when cut into cells", () => {
    let sum = 0;
    for (let x = 0; x < 4; x += 0.5) for (let z = 0; z < 4; z += 0.5) {
      const c = clipToRect(L, x, z, x + 0.5, z + 0.5);
      if (c.length >= 3) sum += area(c);
    }
    expect(sum).toBeCloseTo(12, 5);
  });
  it("returns nothing for a cell outside", () => {
    expect(clipToRect(L, 3, 3, 3.5, 3.5).length).toBeLessThan(3);
  });
});
