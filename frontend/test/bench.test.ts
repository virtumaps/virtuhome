import { describe, expect, it } from "vitest";
import { benchLines, quantile, turnStats, type BenchResult } from "../src/ui/bench";

describe("bench numbers", () => {
  it("takes quantiles from unsorted frame times", () => {
    expect(quantile([33, 16, 17, 16, 100], 0.5)).toBe(17);
    expect(quantile([33, 16, 17, 16, 100], 0.95)).toBe(100);
    expect(quantile([], 0.5)).toBe(0);
  });

  it("counts frames drawn, not frames the browser offered", () => {
    const t = turnStats([16, 17, 16, 50], 2, 0.1, [4, 6]);
    expect(t.fps).toBe(20);
    expect(t.worst).toBe(50);
    expect(t.draw).toBe(5);
  });

  it("writes a report without the parts it couldn't measure", () => {
    const turn = turnStats([16, 17], 2, 0.033, [1]);
    const r: BenchResult = {
      device: "KFRAWI · Android 11 · Chrome 130 · 8 cores", graphics: "Tablet", screen: "1280×800 px",
      firstFrame: { page: null, view: 2100, app: null }, idle: 0, house: turn, floor: null, taps: null,
      drawCalls: 9, triangles: 41000, heapMb: null,
    };
    const lines = benchLines(r, "0.16.1");
    expect(lines[0]).toBe("VirtuHome 0.16.1 · Tablet");
    expect(lines).toContain("First frame: page opened in place, 2.1 s after VirtuHome started");
    expect(lines.some((l) => l.startsWith("Turning a floor"))).toBe(false);
    expect(lines).toContain("Taps: no room to tap");
    expect(lines.at(-1)).toBe("Last frame: 9 draw calls, 41k triangles");
  });
});
