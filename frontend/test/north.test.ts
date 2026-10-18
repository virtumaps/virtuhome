import { describe, expect, it } from "vitest";
import { normalizePlan, type Plan, type Vec2 } from "../src/model/plan";
import { footprint, mainDirection, northFits, pickBuilding } from "../src/editor/north";

const LAT = 53, LON = -2.4;

/** A plan: a 10 m by 6 m house of two rooms, its top facing `north`. */
function plan(north: number): Plan {
  return normalizePlan({
    version: 1,
    settings: { north },
    floors: [{
      id: "f", name: "Ground", elevation: 0, height: 2.6, openings: [], furniture: [], devices: [], walls: [],
      rooms: [
        { id: "a", name: "A", area_id: null, points: [[0, 0], [6, 0], [6, 6], [0, 6]] },
        { id: "b", name: "B", area_id: null, points: [[6, 0], [10, 0], [10, 6], [6, 6]] },
      ],
    }],
  });
}

/** The building on the map: the plan's outline (with its walls) turned to `trueNorth`, moved `shift` metres east. */
function building(trueNorth: number, shift = 0) {
  const t = (trueNorth * Math.PI) / 180;
  const outline: Vec2[] = [[-0.14, -0.14], [10.14, -0.14], [10.14, 6.14], [-0.14, 6.14]];
  const geometry = outline.map(([x, z]) => {
    const e0 = x - 5, n0 = -(z - 3);
    const e = e0 * Math.cos(t) + n0 * Math.sin(t) + shift, n = -e0 * Math.sin(t) + n0 * Math.cos(t);
    return { lat: LAT + n / 110_540, lon: LON + e / (111_320 * Math.cos((LAT * Math.PI) / 180)) };
  });
  return footprint(1, [...geometry, geometry[0]], LAT, LON)!;
}

describe("north from the map", () => {
  it("finds a wall direction modulo 90 degrees", () => {
    const edges: [Vec2, Vec2][] = [[[0, 0], [10, 0]], [[10, 0], [10, 6]], [[0, 0], [0, 6]]];
    expect(mainDirection(edges, (d) => (Math.atan2(d[0], -d[1]) * 180) / Math.PI)).toBeCloseTo(0, 5);
  });

  it("reads a building's size and whether the home stands on it", () => {
    const b = building(23);
    expect(b.distance).toBe(0);
    expect(Math.max(...b.size)).toBeCloseTo(10.28, 1);
    expect(Math.min(...b.size)).toBeCloseTo(6.28, 1);
    expect(building(23, 30).distance).toBeGreaterThan(20);
  });

  for (const truth of [0, 23, 97, 180, 251, 338]) {
    it(`turns a plan to ${truth}° when it was roughly right`, () => {
      const p = plan((truth + 25) % 360);
      const fits = northFits(p, building(truth));
      expect(fits).toHaveLength(4);
      const diff = Math.abs((((fits[0].north - truth) % 360) + 540) % 360 - 180);
      expect(diff).toBeLessThan(0.5);
    });
  }

  it("uses the proportions to tell a quarter turn apart", () => {
    // starting 80° off, the long walls still decide: never a quarter turn out
    const fits = northFits(plan(80), building(0));
    const n = fits[0].north;
    expect(n === 0 || n === 180).toBe(true);
  });

  it("picks the house over a bigger neighbour further away", () => {
    const near = building(10);
    const far = { ...building(10, 25), id: 2, size: [20, 12] as [number, number] };
    expect(pickBuilding(plan(0), [far, near])?.id).toBe(1);
  });
});
