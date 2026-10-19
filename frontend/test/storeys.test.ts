import { describe, expect, it } from "vitest";
import { normalizePlan, type Floor, type Plan } from "../src/model/plan";

// A storey added by hand has no rooms until they are drawn: everything that walks the floors copes.
describe("a storey without rooms yet", async () => {
  const { DEMO_PLAN } = await import("../dev/demo-plan");
  const { buildFloor } = await import("../src/scene/build");
  const { DAY } = await import("../src/scene/palette");
  const { suggestRoofs } = await import("../src/auto/roof");
  const { floorRoofs } = await import("../src/scene/roofs");
  const empty = (elevation: number): Floor => ({
    id: "f_new", name: "Second Floor", elevation, height: 2.6,
    rooms: [], openings: [], furniture: [], devices: [], walls: [], outdoor: [], fences: [], roofs: [],
  });
  const withEmpty = (): Plan => {
    const p = normalizePlan(structuredClone(DEMO_PLAN));
    const top = p.floors[p.floors.length - 1];
    p.floors.push(empty(top.elevation + top.height));
    return normalizePlan(p);
  };

  it("builds", () => {
    const p = withEmpty();
    const fb = buildFloor(p, p.floors.length - 1, DAY, { low: false });
    expect(fb).toBeTruthy();
  });

  it("keeps the roof on the storeys that have rooms", () => {
    const p = withEmpty();
    for (const f of p.floors) f.roofs = [];
    const s = suggestRoofs(p);
    expect(s.roofs.length).toBeGreaterThan(0);
    expect(s.roofs.every((r) => r.floor < p.floors.length - 1)).toBe(true);
    expect(floorRoofs(p, p.floors.length - 1)).toEqual([]);
  });
});
