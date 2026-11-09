import { describe, expect, it } from "vitest";
import { benchLines, limitOf, quantile, turnStats, type BenchResult, type Turn } from "../src/ui/bench";

/** A turn at this many frames a second, the main thread drawing for `draw` ms of each. */
const at = (fps: number, draw = 2): Turn => ({ fps, p50: 1000 / fps, p95: 1500 / fps, worst: 2000 / fps, draw });

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
      firstFrame: { page: null, view: 2100, app: null }, idle: 0, house: turn, floor: null, passes: null, taps: null,
      drawCalls: 9, triangles: 41000, heapMb: null,
    };
    const lines = benchLines(r, "0.16.1");
    expect(lines[0]).toBe("VirtuHome 0.16.1 · Tablet");
    expect(lines).toContain("First frame: page opened in place, 2.1 s after VirtuHome started");
    expect(lines.some((l) => l.startsWith("Turning a floor"))).toBe(false);
    expect(lines.some((l) => l.startsWith("Turning again") || l.startsWith("Held back"))).toBe(false);
    expect(lines).toContain("Taps: no room to tap");
    expect(lines.at(-1)).toBe("Last frame: 9 draw calls, 41k triangles");
  });
});

describe("what holds a device back", () => {
  it("is the fill rate when half the resolution turns much faster", () => {
    expect(limitOf({ base: at(25), glass: null, bare: at(26), half: at(41) })).toBe("fill");
  });

  it("is compositing when the house turns much faster with nothing over it", () => {
    expect(limitOf({ base: at(25), glass: null, bare: at(40), half: at(27) })).toBe("overlay");
  });

  it("blames the glass when taking it away gives nearly all of it", () => {
    expect(limitOf({ base: at(7), glass: at(36), bare: at(38), half: at(11) })).toBe("glass");
    // without the glass a little faster, without anything over the house much faster: the layers themselves
    expect(limitOf({ base: at(20), glass: at(24), bare: at(40), half: at(21) })).toBe("overlay");
  });

  it("says both when both help about as much", () => {
    expect(limitOf({ base: at(20), glass: null, bare: at(30), half: at(31) })).toBe("both");
  });

  it("tells a busy main thread, a device that keeps up, and one it can't tell", () => {
    expect(limitOf({ base: at(20, 40), glass: null, bare: at(21), half: at(21) })).toBe("main");
    expect(limitOf({ base: at(60), glass: at(60), bare: at(60), half: at(60) })).toBe("screen");
    // a pass that came out slower (something else woke up on the device) is no finding either
    expect(limitOf({ base: at(50), glass: null, bare: at(30), half: at(54) })).toBe("screen");
    expect(limitOf({ base: at(25), glass: null, bare: at(26), half: at(26) })).toBe("unclear");
  });

  it("puts the passes and what they say after the turns", () => {
    const r: BenchResult = {
      device: "KFRAWI", graphics: "Standard", screen: "906×601 px", firstFrame: { page: null, view: null, app: null }, idle: 0,
      house: at(26), floor: at(19), passes: { base: at(25), glass: at(27), bare: at(28), half: at(41) }, taps: null, drawCalls: 15, triangles: 19000, heapMb: null,
    };
    const lines = benchLines(r, "0.18.1");
    const i = lines.findIndex((l) => l.startsWith("Turning a floor"));
    expect(lines[i + 1]).toBe("Turning again: as it is 25 fps, without glass 27 fps (+8%), nothing over the house 28 fps (+12%), half resolution 41 fps (+64%)");
    expect(lines[i + 2]).toBe("Held back by fill rate, the pixels the graphics chip draws (a lower resolution helps most)");
    // the Tablet level has no glass to take away
    const tablet = benchLines({ ...r, graphics: "Tablet", passes: { base: at(25), glass: null, bare: at(40), half: at(26) } }, "0.18.1");
    expect(tablet).toContain("Turning again: as it is 25 fps, nothing over the house 40 fps (+60%), half resolution 26 fps (+4%)");
    expect(tablet).toContain("Held back by compositing, the labels and buttons over the house");
  });
});
