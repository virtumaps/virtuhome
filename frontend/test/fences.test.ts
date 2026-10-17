import { describe, expect, it } from "vitest";
import type { Fence } from "../src/model/plan";
import { FENCE_ORDER, fenceAt, fenceLength, fencePieces } from "../src/scene/fences";

const fence = (points: [number, number][], extra: Partial<Fence> = {}): Fence => ({ id: "f", points, style: "closeboard", height: 1.8, gates: [], ...extra });
/** Posts are the narrow pieces (a gate's posts are a little stouter). */
const posts = (f: Fence) => fencePieces(f, false).filter((p) => p.item.w < 0.13);
const bays = (f: Fence) => fencePieces(f, false).filter((p) => p.item.w >= 0.13);

describe("fences", () => {
  it("puts posts no further apart than the spacing", () => {
    const f = fence([[0, 0], [5, 0]]);
    expect(posts(f).map((p) => p.item.x)).toEqual([0, 5 / 3, 10 / 3, 5].map((x) => expect.closeTo(x, 3)));
    expect(bays(f).length).toBe(3);
  });

  it("builds a corner's post once", () => {
    const f = fence([[0, 0], [5, 0], [5, 4]]);
    expect(posts(f).length).toBe(4 + 3);
  });

  it("leaves a gap for a gate between two stouter posts", () => {
    const f = fence([[0, 0], [5, 0]], { gates: [{ at: 2.5, width: 1 }] });
    const xs = posts(f).map((p) => Math.round(p.item.x * 100) / 100).sort((a, b) => a - b);
    expect(xs).toEqual([0, 1, 2, 3, 4, 5]);
    const gate = fencePieces(f, false).filter((p) => p.item.w > 0.5 && p.item.x > 2 && p.item.x < 3);
    expect(gate.length).toBe(1);
    expect(posts(f).filter((p) => p.item.w > 0.1).map((p) => p.item.x)).toEqual([2, 3]);
  });

  it("hangs a double gate as two leaves", () => {
    const f = fence([[0, 0], [8, 0]], { gates: [{ at: 4, width: 3, double: true }] });
    const leaves = fencePieces(f, false).filter((p) => p.item.x > 2.5 && p.item.x < 5.5 && p.item.w > 1);
    expect(leaves.length).toBe(2);
  });

  it("turns each run to follow its line", () => {
    const f = fence([[0, 0], [0, 3]]);
    expect(new Set(fencePieces(f, false).map((p) => p.item.rotation))).toEqual(new Set([90]));
  });

  it("builds every design, plainer on tablets", () => {
    for (const style of FENCE_ORDER) {
      const f = fence([[0, 0], [6, 0]], { style });
      const full = fencePieces(f, false).reduce((n, p) => n + p.parts.length, 0);
      const low = fencePieces(f, true).reduce((n, p) => n + p.parts.length, 0);
      expect(full, style).toBeGreaterThan(0);
      expect(low, style).toBeLessThanOrEqual(full);
    }
  });

  it("measures and finds points along it", () => {
    const f = fence([[0, 0], [3, 0], [3, 4]]);
    expect(fenceLength(f)).toBeCloseTo(7);
    const at = fenceAt(f, [3.5, 2]);
    expect(at.at).toBeCloseTo(5);
    expect(at.point).toEqual([3, 2]);
  });
});
