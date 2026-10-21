import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizePlan, solarSize, type Floor, type Plan, type Roof, type RoofShape } from "../src/model/plan";
import { buildFloor } from "../src/scene/build";
import { DAY } from "../src/scene/palette";
import {
  abutting, faceAt, faceNormal, itemFrame, planeHeight, polyArea, profile, ridgeHeight, roofHeight, roofModel, ROOF_SHAPE_ORDER, type RoofModel,
} from "../src/scene/roofs";

const roof = (extra: Partial<Roof> = {}): Roof => ({ id: "r", x: 0, z: 0, w: 8, d: 6, rotation: 0, shape: "gable", pitch: 45, covering: "concrete_tiles", ...extra });
/** Walls 0.28 thick: the roof reaches their outside faces, 0.14 past the middle. */
const model = (extra: Partial<Roof> = {}, abut = {}) => roofModel(roof(extra), 5, { wallHalf: 0.14, abut });
const A = 4.14, B = 3.14;

const outlineArea = (m: RoofModel) => (m.u1 - m.u0) * (m.v1 - m.v0);
const facesArea = (m: RoofModel) => m.faces.reduce((s, f) => s + polyArea(f.poly), 0);
const top = (_m: RoofModel, f: RoofModel["faces"][number]) => Math.max(...f.poly.map(([u, v]) => planeHeight(f.plane, u, v)));

describe("roof shapes", () => {
  it("covers its whole outline with faces, for every shape", () => {
    for (const shape of ROOF_SHAPE_ORDER) {
      const m = model({ shape });
      expect(facesArea(m), shape).toBeCloseTo(outlineArea(m), 6);
    }
  });

  it("builds a gable: two slopes up to the ridge, verges past the ends", () => {
    const m = model();
    expect(m.faces.length).toBe(2);
    expect(ridgeHeight(m)).toBeCloseTo(B, 6);
    expect(m.u1).toBeCloseTo(A + 0.15, 6);
    expect(m.v1).toBeCloseTo(B + 0.3, 6);
    // the eaves' overhang drops below the wall plate
    expect(roofHeight(m, 0, m.v1)).toBeCloseTo(-0.3, 6);
  });

  it("builds a hip: four slopes, a ridge shorter by the span", () => {
    const m = model({ shape: "hip" });
    expect(m.faces.length).toBe(4);
    expect(ridgeHeight(m)).toBeCloseTo(B, 6);
    const ridge = m.faces.flatMap((f) => f.poly.filter(([u, v]) => Math.abs(planeHeight(f.plane, u, v) - B) < 1e-6));
    const us = ridge.map(([u]) => u);
    expect(Math.max(...us) - Math.min(...us)).toBeCloseTo(2 * (A - B), 6);
  });

  it("builds a pyramid meeting at one point", () => {
    const m = model({ shape: "pyramid" });
    expect(m.faces.length).toBe(4);
    for (const f of m.faces) expect(top(m, f)).toBeCloseTo(B, 6);
    expect(roofHeight(m, 0, 0)).toBeCloseTo(B, 6);
  });

  it("hips only the top half of a half-hipped roof's ends", () => {
    const m = model({ shape: "half_hip" });
    expect(m.faces.length).toBe(4);
    // at the end wall the roof stops at half its height
    expect(roofHeight(m, -A, 0)).toBeCloseTo(B / 2, 6);
    expect(ridgeHeight(m)).toBeCloseTo(B, 6);
  });

  it("puts a gablet on each end of a Dutch gable", () => {
    const m = model({ shape: "dutch" });
    expect(m.gablets.length).toBe(2);
    // hipped from the eaves to the gablet's foot, then the full gable behind it
    const g = m.gablets[0];
    expect(roofHeight(m, g.u - 0.01, 0)).toBeCloseTo(g.foot - 0.01, 2);
    expect(roofHeight(m, g.u + 0.01, 0)).toBeCloseTo(B, 6);
  });

  it("gives a mansard steep lower slopes under shallow upper ones on every side", () => {
    const m = model({ shape: "mansard", pitch: 25 });
    expect(m.faces.length).toBe(8);
    const steep = m.faces.filter((f) => f.plane.k > 2);
    expect(steep.length).toBe(4);
    // a gambrel has them on two sides only, with gable ends
    expect(model({ shape: "gambrel", pitch: 30 }).faces.length).toBe(4);
  });

  it("raises a lean-to to its back", () => {
    const m = model({ shape: "lean_to", pitch: 20 });
    expect(m.faces.length).toBe(1);
    expect(roofHeight(m, 0, -B)).toBeCloseTo(2 * B * Math.tan((20 * Math.PI) / 180), 6);
    expect(roofHeight(m, 0, B)).toBeCloseTo(0, 6);
  });

  it("lays a flat roof a little over the walls", () => {
    const m = model({ shape: "flat" });
    expect(m.faces.length).toBe(1);
    expect(roofHeight(m, 1, 1)).toBeCloseTo(0.2, 6);
    // its edge stands proud of the walls, never in their plane
    expect(m.u1 - A).toBeGreaterThan(0.02);
  });

  it("drops a butterfly to a valley in the middle and an M to one between its gables", () => {
    const b = model({ shape: "butterfly", pitch: 12 });
    expect(b.faces.length).toBe(2);
    expect(roofHeight(b, 0, 0)).toBeCloseTo(0, 6);
    expect(roofHeight(b, 0, B)).toBeGreaterThan(0.5);
    const mm = model({ shape: "m_shaped" });
    expect(mm.faces.length).toBe(4);
    expect(roofHeight(mm, 0, 0)).toBeCloseTo(0, 6);
    expect(roofHeight(mm, 0, B / 2)).toBeCloseTo(B / 2, 6);
  });

  it("cuts a semi-detached roof off flush at the party wall", () => {
    const m = model({ shape: "hip", party: "right" });
    expect(m.faces.length).toBe(3);
    expect(m.u1).toBeCloseTo(A, 6);
    // the ridge runs on to the party wall
    expect(roofHeight(m, A - 0.01, 0)).toBeCloseTo(B, 6);
    const t = model({ shape: "gable", party: "both" });
    expect(t.u0).toBeCloseTo(-A, 6);
    expect(t.u1).toBeCloseTo(A, 6);
  });

  it("follows the gable along its end wall", () => {
    const m = model();
    const p = profile(m, [-A, B], [-A, -B]);
    const peak = Math.max(...p.flatMap(([, , y0, y1]) => [y0, y1]));
    expect(peak).toBeCloseTo(B, 6);
    expect(p[0][2]).toBeCloseTo(0, 6);
  });

  it("turns with the roof", () => {
    const m = roofModel(roof({ rotation: 90, x: 10, z: 20 }), 0, { wallHalf: 0.14 });
    // turned a quarter, the ridge runs down the plan: the front slope faces -x
    const f = faceAt(m, 0, 1)!;
    const n = faceNormal(m, f);
    expect(n[0]).toBeLessThan(-0.5);
    expect(Math.abs(n[2])).toBeLessThan(1e-9);
  });
});

describe("roofs on a plan", { timeout: 30_000 }, () => {
  const floor = (id: string, elevation: number, rooms: [number, number, number, number][], roofs: Roof[] = []): Floor => ({
    id, name: id, elevation, height: 2.5, openings: [], furniture: [], devices: [], walls: [], roofs,
    rooms: rooms.map(([x0, z0, x1, z1], i) => ({ id: `${id}_${i}`, name: `r${i}`, area_id: null, points: [[x0, z0], [x1, z0], [x1, z1], [x0, z1]] })),
  });

  it("sees a lean-to standing against the storey above", () => {
    // a two-storey house 0..6 x 0..7 and a single-storey side extension at -3..0
    const lean = roof({ shape: "lean_to", x: -1.5, z: 2.5, w: 5, d: 3, rotation: 90, pitch: 20 });
    const plan: Plan = { version: 1, settings: { ...DEFAULT_SETTINGS }, floors: [
      floor("g", 0, [[0, 0, 6, 7], [-3, 0, 0, 5]], [lean]),
      floor("f", 2.68, [[0, 0, 6, 7]]),
    ] };
    // turned a quarter clockwise, the lean-to's back (-z) faces +x: the house
    expect(abutting(plan, 0, lean)).toEqual({ left: false, right: false, back: true, front: false });
  });

  it("builds roofs into meshes of their own, with solar panels that shine", () => {
    const r = roof({
      shape: "hip", x: 3, z: 3.5, w: 6, d: 7, items: [
        { id: "pv", kind: "solar", x: 3, z: 5.2, cols: 4, rows: 2, ...solarSize({ cols: 4, rows: 2 }) },
        { id: "ch", kind: "chimney", x: 1, z: 3.5, w: 1, d: 0.5 },
        { id: "rw", kind: "window", x: 4.5, z: 1.5, w: 0.78, d: 1.18 },
        { id: "dm", kind: "dormer", x: 3, z: 1.6, w: 2, d: 1.5, style: "box" },
      ],
    });
    const plan = normalizePlan({ version: 1, settings: { ...DEFAULT_SETTINGS }, floors: [floor("g", 0, [[0, 0, 6, 7]], [r])] });
    const fb = buildFloor(plan, 0, DAY, { low: false });
    expect(fb.roof.vertexCount).toBeGreaterThan(100);
    expect(fb.roofGlass.vertexCount).toBeGreaterThan(0);
    expect(fb.items.filter((x) => x.kind === "roofitem").map((x) => x.id)).toEqual(["pv", "ch", "rw", "dm"]);
    expect(fb.glows.some((g) => g.type === "solar_panels")).toBe(true);
    for (const v of fb.roof.pos) expect(Number.isFinite(v)).toBe(true);
    for (let i = 0; i < fb.roof.nrm.length; i += 3) {
      expect(Math.hypot(fb.roof.nrm[i], fb.roof.nrm[i + 1], fb.roof.nrm[i + 2])).toBeCloseTo(1, 4);
    }
  });

  it("builds every shape and covering without gaps in the numbers", () => {
    for (const shape of ROOF_SHAPE_ORDER as RoofShape[]) {
      for (const covering of ["slate", "glass"] as const) {
        const plan = normalizePlan({ version: 1, settings: { ...DEFAULT_SETTINGS }, floors: [floor("g", 0, [[0, 0, 6, 7]], [roof({ shape, covering, x: 3, z: 3.5, w: 6, d: 7, party: "left", parapet: true })])] });
        const fb = buildFloor(plan, 0, DAY, { low: true });
        for (const v of [...fb.roof.pos, ...fb.roofGlass.pos]) expect(Number.isFinite(v), `${shape} ${covering}`).toBe(true);
        expect(fb.roof.vertexCount + fb.roofGlass.vertexCount, `${shape} ${covering}`).toBeGreaterThan(0);
      }
    }
  });

  it("lays things on a slope along it", () => {
    const m = model({ shape: "gable" });
    const fr = itemFrame(m, { x: 0, z: 1.5 })!;
    expect(fr.slope).toBeCloseTo(45, 6);
    // up the slope rises, out of the roof is square to it
    expect(fr.e2[1]).toBeGreaterThan(0.6);
    expect(fr.n[0] * fr.e2[0] + fr.n[1] * fr.e2[1] + fr.n[2] * fr.e2[2]).toBeCloseTo(0, 9);
    expect(fr.c[1]).toBeCloseTo(5 + (B - 1.5), 6);
  });

  it("sizes solar arrays from their panels", () => {
    expect(solarSize({ cols: 4, rows: 2 })).toEqual({ w: 4.596, d: 3.464 });
    expect(solarSize({ cols: 2, rows: 1, portrait: false })).toEqual({ w: 3.464, d: 1.134 });
    // an array's own panels
    expect(solarSize({ cols: 5, rows: 1, panel: [1.762, 1.134] })).toEqual({ w: 5.75, d: 1.762 });
    expect(solarSize({ cols: 1, rows: 2, portrait: false, panel: [1.65, 0.992] })).toEqual({ w: 1.65, d: 2.004 });
  });

  it("keeps a usable panel size and sizes the array from it on load", () => {
    const item = (panel: unknown) => {
      const plan = normalizePlan({
        version: 1, name: "t", settings: DEFAULT_SETTINGS,
        floors: [{ id: "g", name: "G", level: 0, height: 2.5, rooms: [], openings: [], furniture: [], devices: [], walls: [],
          roofs: [{ ...roof(), items: [{ id: "pv", kind: "solar", x: 3, z: 5.2, w: 1, d: 1, cols: 2, rows: 1, panel } as never] }] }],
      });
      return plan.floors[0].roofs![0].items![0];
    };
    expect(item([1.134, 1.762])).toMatchObject({ panel: [1.762, 1.134], w: 2.288, d: 1.762 });
    expect(item(undefined)).toMatchObject({ panel: null, w: 2.288, d: 1.722 });
    for (const bad of [[1.7], [1.7, "x"], [9, 1], [1.7, 0.1], "1762x1134"]) expect(item(bad).panel).toBeNull();
  });
});

describe("roofs worked out from the plan", async () => {
  const { DEMO_PLAN } = await import("../src/demo/plan");
  const { suggestRoofs, rectangles } = await import("../src/auto/roof");
  const bare = (): Plan => normalizePlan({ ...structuredClone(DEMO_PLAN), floors: DEMO_PLAN.floors.map((f) => ({ ...structuredClone(f), roofs: [] })) });

  it("splits an L into rectangles, the biggest first", () => {
    const L = (x: number, z: number) => (x < 2 && z < 4) || (z >= 2 && z < 4 && x < 5);
    const rects = rectangles([0, 2, 5], [0, 2, 4], L);
    expect(rects[0]).toEqual({ x0: 0, z0: 2, x1: 5, z1: 4 });
    expect(rects.length).toBe(2);
  });

  it("sees the demo house as a semi joined on the right, and leans the extension on it", () => {
    const s = suggestRoofs(bare());
    expect(s.kind).toBe("semi");
    expect(s.party).toBe("right");
    const main = s.roofs.find((r) => r.floor === 1)!.roof;
    expect(main).toMatchObject({ shape: "hip", party: "right", rotation: 0, w: 6.25, d: 7.4 });
    const lower = s.roofs.filter((r) => r.floor === 0).map((r) => r.roof);
    expect(lower.length).toBe(2);
    for (const r of lower) expect(r).toMatchObject({ shape: "lean_to", rotation: 90 });
  });

  it("puts panels on the sunniest slope, as many as fit", async () => {
    const { floorRoofs, sunniestFace, fitPanels, faceBearing } = await import("../src/scene/roofs");
    const plan = bare();
    for (const { floor, roof: r } of suggestRoofs(plan).roofs) plan.floors[floor].roofs!.push(r);
    const m = floorRoofs(plan, 1)[0];
    // north up the plan: the front (bottom) faces south
    const f = sunniestFace(m, 0)!;
    expect(faceBearing(m, f, 0)).toBeCloseTo(180, 6);
    const fit = fitPanels(m, f)!;
    // the hipped end narrows the slope towards the ridge
    expect(fit.cols * fit.rows).toBe(4);
    // bigger panels: fewer fit
    const big = fitPanels(m, f, true, { long: 2.278, short: 1.134 })!;
    expect(big.cols * big.rows).toBeLessThan(4);
    // with the plan's top facing east, its bottom faces west
    expect(faceBearing(m, f, 90)).toBeCloseTo(270, 6);
  });
});

describe("roofs for extensions", async () => {
  const { DEMO_PLAN } = await import("../src/demo/plan");
  const { roofFaces, solarArrays, shadeGeometry } = await import("../src/scene/roof-info");
  const plan = normalizePlan(structuredClone(DEMO_PLAN));

  it("lists the slopes with the way they face", () => {
    const faces = roofFaces(plan);
    const main = faces.filter((f) => f.roof === "main_roof");
    expect(main.length).toBe(3);
    // north up the plan: the front faces south, the back north, the hipped end west
    expect(main.map((f) => Math.round(f.azimuth)).sort((a, b) => a - b)).toEqual([0, 180, 270]);
    for (const f of main) expect(f.tilt).toBeCloseTo(35, 6);
  });

  it("lists the panels with their power and the way they face", () => {
    const arrays = solarArrays(plan);
    expect(arrays.map((a) => a.panels)).toEqual([3, 2, 3]);
    expect(arrays[0].kwp).toBeCloseTo(1.29, 6);
    expect(Math.round(arrays[0].azimuth)).toBe(180);
    expect(Math.round(arrays[2].azimuth)).toBe(0);
  });

  it("hands over what can shade the roofs, panels left out", () => {
    const builds = plan.floors.map((_, i) => buildFloor(plan, i, DAY, { low: true }));
    const tris = shadeGeometry(builds);
    expect(tris.length % 9).toBe(0);
    expect(tris.length / 9).toBeGreaterThan(50);
    // nothing under the lowest eaves
    let low = Infinity;
    for (let i = 1; i < tris.length; i += 3) low = Math.min(low, tris[i]);
    expect(low).toBeGreaterThan(-1);
  });
});
