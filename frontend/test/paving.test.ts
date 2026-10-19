import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizePlan, type Floor, type OutdoorArea, type Plan } from "../src/model/plan";
import { buildFloor, groundAt, outdoorTop, SLAB } from "../src/scene/build";
import { DAY } from "../src/scene/palette";
import { insetPolygon, openEdges, railingRuns, rectSides, resizeRect, roundness, circlePoints, stepBlocks } from "../src/scene/areas";
import { areaPaving, deckKey, deckLook, layingAngle, parseDeckKey, parsePavingKey, PAVING, pavingKey, pavingLook, type PavingMaterial } from "../src/scene/paving";
import { pavingHits, pavingTile } from "../src/scene/paving-tex";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

function floor(outdoor: OutdoorArea[], furniture: Floor["furniture"] = []): Floor {
  return {
    id: "f0", name: "Ground", elevation: 0, height: 2.6, openings: [], devices: [], walls: [], furniture, outdoor,
    rooms: [{ id: "lounge", name: "Lounge", area_id: null, points: rect(0, 0, 6, 5) }],
  } as Floor;
}

describe("paving layouts", () => {
  // every unit, followed across the tile's edges, is one whole rectangle of the right size
  const cases: [PavingMaterial, string][] = [];
  for (const m of Object.keys(PAVING) as PavingMaterial[]) for (const pat of PAVING[m].patterns) if (pat !== "crazy" && pat !== "plain") cases.push([m, pat]);
  for (const [m, pat] of cases) {
    it(`${m} laid ${pat} tiles with whole units`, () => {
      const look = pavingLook(m, { pattern: pat, unit: PAVING[m].sizes[1] });
      const T = pavingTile(look);
      const hit = pavingHits(look);
      const step = Math.max(5, Math.round(T / 300));
      const seen = new Map<number, { x0: number; y0: number; minx: number; maxx: number; miny: number; maxy: number; n: number }>();
      for (let y = step / 2; y < T; y += step) {
        for (let x = step / 2; x < T; x += step) {
          const id = hit(x, y);
          const s = seen.get(id);
          if (!s) {
            seen.set(id, { x0: x, y0: y, minx: 0, maxx: 0, miny: 0, maxy: 0, n: 1 });
            continue;
          }
          // relative to the unit's first point, across the tile's edge if that is nearer
          const dx = ((x - s.x0 + T * 1.5) % T) - T / 2, dy = ((y - s.y0 + T * 1.5) % T) - T / 2;
          s.minx = Math.min(s.minx, dx); s.maxx = Math.max(s.maxx, dx);
          s.miny = Math.min(s.miny, dy); s.maxy = Math.max(s.maxy, dy);
          s.n++;
        }
      }
      const [L, W] = look.unit;
      for (const s of seen.values()) {
        const w = s.maxx - s.minx + step, h = s.maxy - s.miny + step;
        // a whole rectangle: as many samples as its area holds
        expect(Math.abs(s.n * step * step - w * h)).toBeLessThan(w * h * 0.02 + step * step);
        if (pat === "random") {
          expect(Math.abs(w / L - Math.round(w / L))).toBeLessThan(0.05);
          expect(Math.abs(h / L - Math.round(h / L))).toBeLessThan(0.05);
        } else {
          const dims = [Math.round(w), Math.round(h)].sort((a, b) => b - a);
          expect(Math.abs(dims[0] - L)).toBeLessThanOrEqual(step);
          expect(Math.abs(dims[1] - W)).toBeLessThanOrEqual(step);
        }
      }
    });
  }

  it("keys every look it textures and reads it back", () => {
    const p = pavingLook("porcelain", { pattern: "third", unit: "1200x600", color: "#4C4D4F", joint: "#4a4a4b" });
    expect(parsePavingKey(pavingKey(p).slice(5))).toEqual(p);
    const d = deckLook({ boards: "composite", color: "#8e8b87", board_width: 140 });
    expect(parseDeckKey(deckKey(d).slice(5))).toEqual(d);
  });

  it("takes the usual for anything unset or unknown, and old asphalt driveways as tarmac", () => {
    const base = { id: "a", name: "A", area_id: null, points: rect(0, 0, 3, 3) };
    expect(areaPaving({ ...base, kind: "patio" }).material).toBe("sandstone");
    expect(areaPaving({ ...base, kind: "driveway", surface: "asphalt" }).material).toBe("tarmac");
    expect(areaPaving({ ...base, kind: "driveway" }).pattern).toBe("herringbone");
    expect(areaPaving({ ...base, kind: "gravel", paving: "porcelain" }).material).toBe("gravel");
    const odd = pavingLook("slate", { pattern: "basketweave", unit: "123x45", color: "red" });
    expect(odd.pattern).toBe("random");
    expect(odd.color).toBe(PAVING.slate.colors[0][1]);
  });

  it("lays along the longest edge, turned by the area's angle", () => {
    const turned = (deg: number) => {
      const r = (deg * Math.PI) / 180;
      return rect(0, 0, 4, 2).map(([x, z]) => [x * Math.cos(r) - z * Math.sin(r), x * Math.sin(r) + z * Math.cos(r)] as [number, number]);
    };
    expect(layingAngle({ points: rect(0, 0, 4, 2) })).toBeCloseTo(0);
    expect(layingAngle({ points: turned(30) })).toBeCloseTo(30);
    expect(layingAngle({ points: turned(30), angle: 45 })).toBeCloseTo(75);
    // a long side along z still runs along x and z, folded into -45..45
    expect(Math.abs(layingAngle({ points: rect(0, 0, 2, 5) }))).toBeCloseTo(0);
  });
});

describe("raised patios and decks", () => {
  const patio: OutdoorArea = { id: "pat", name: "Patio", kind: "patio", area_id: null, points: rect(0, -3, 4, -0.14), height: 0.6, steps: [{ edge: 0, width: 1.2 }], railing: "balustrade" };
  const lawn: OutdoorArea = { id: "lawn", name: "Lawn", kind: "lawn", area_id: null, points: rect(-2, -9, 8, -0.14) };

  it("stands a raised patio its height above the ground, and things on it", () => {
    const f = floor([lawn, patio]);
    expect(outdoorTop(f, 1)).toBeCloseTo(-SLAB + 0.6, 2);
    expect(groundAt(f, [2, -1.5])).toBe(outdoorTop(f, 1));
    expect(groundAt(f, [6, -5])).toBe(-SLAB);
    // a deck without a height stays level with the floor indoors; with one, that far up
    const deck: OutdoorArea = { ...patio, id: "deck", kind: "deck", height: null };
    expect(outdoorTop(floor([lawn, deck]), 1)).toBeGreaterThan(-0.02);
    expect(outdoorTop(floor([lawn, { ...deck, height: 0.9 }]), 1)).toBeCloseTo(-SLAB + 0.9, 2);
  });

  it("leaves the edge along the house closed", () => {
    expect(openEdges(floor([patio]), patio)).toEqual([true, true, false, true]);
  });

  it("steps down in risers of 20 cm at most, a going apart", () => {
    const blocks = stepBlocks(patio.points, patio.steps![0], 0.6);
    expect(blocks.map((b) => Math.round(b.top * 100))).toEqual([40, 20]);
    // on the edge's outside (z < -3), 1.2 m wide in its middle
    const c = blocks[1].corners;
    expect(Math.min(...c.map((p) => p[1]))).toBeCloseTo(-3.6);
    expect(Math.min(...c.map((p) => p[0]))).toBeCloseTo(1.4);
    expect(Math.max(...c.map((p) => p[0]))).toBeCloseTo(2.6);
  });

  it("runs the railing round the open edges with a gap at the steps", () => {
    const runs = railingRuns(patio.points, [true, true, false, true], patio.steps!);
    expect(runs.length).toBe(2);
    // from the step gap round the corner to the house, both ways
    const ends = runs.map((r) => [r[0], r[r.length - 1]]);
    for (const [a, b] of ends) {
      expect(Math.min(Math.abs(a[0] - 1.38), Math.abs(a[0] - 2.62), Math.abs(b[0] - 1.38), Math.abs(b[0] - 2.62))).toBeLessThan(0.01);
    }
    expect(railingRuns(patio.points, [true, true, true, true], []).length).toBe(1);
  });

  it("builds the railing on the patio and the steps down to the lawn", () => {
    const f = floor([lawn, patio]);
    const plan = { version: 1, settings: { ...DEFAULT_SETTINGS }, floors: [f] } as unknown as Plan;
    const fb = buildFloor(plan, 0, DAY, { low: false });
    const g = fb.opaque;
    const room = f.rooms.length + 1;
    const top = outdoorTop(f, 1);
    let railTop = -Infinity, stepLow = Infinity;
    for (let v = 0; v < g.vertexCount; v++) {
      if (g.room[v] !== room) continue;
      const [x, y, z] = [g.pos[v * 3], g.pos[v * 3 + 1], g.pos[v * 3 + 2]];
      if (z > -2.9 && z < -0.2 && x > 0.1 && x < 3.9) continue;
      if (y > top + 0.05) railTop = Math.max(railTop, y);
      if (z < -3.05) stepLow = Math.min(stepLow, y);
    }
    expect(railTop).toBeGreaterThan(top + 0.9);
    expect(stepLow).toBeLessThan(-SLAB + 0.01);
  });
});

describe("shapes", () => {
  it("sets an outline in, corner to corner", () => {
    const inner = insetPolygon(rect(0, 0, 4, 3), 0.1);
    expect(inner).toEqual([[0.1, 0.1], [3.9, 0.1], [3.9, 2.9], [0.1, 2.9]].map(([x, z]) => [expect.closeTo(x), expect.closeTo(z)]));
  });

  it("resizes rectangles and circles", () => {
    expect(rectSides(rect(0, 0, 4, 3))).toEqual([4, 3]);
    expect(rectSides([[0, 0], [4, 0], [5, 3], [0, 3]])).toBeNull();
    expect(rectSides(resizeRect(rect(0, 0, 4, 3), 1, 5))).toEqual([4, 5]);
    const c = circlePoints([1, 2], 1.5);
    expect(roundness(c)?.radius).toBeCloseTo(1.5, 2);
    expect(roundness(rect(0, 0, 4, 3))).toBeNull();
  });

  it("loads areas with steps on edges they no longer have, and heights out of range", () => {
    const plan = normalizePlan({
      version: 1, settings: {}, floors: [{ id: "g", name: "G", elevation: 0, height: 2.5, rooms: [], outdoor: [
        { id: "p", name: "P", kind: "patio", points: rect(0, 0, 2, 2), height: 9, steps: [{ edge: 1 }, { edge: 7 }] },
      ] }],
    });
    const o = plan.floors[0].outdoor![0];
    expect(o.height).toBe(3);
    expect(o.steps).toEqual([{ edge: 1 }]);
    expect(o.area_id).toBeNull();
  });
});
