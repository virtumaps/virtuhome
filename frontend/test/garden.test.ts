import { describe, expect, it } from "vitest";
import { FURNITURE, styleOptions, type Part } from "../src/scene/furniture-lib";
import { GARDEN_OPTIONS, gardenChoice } from "../src/scene/garden";

/** A part's footprint on the piece's own plan (a turned part is drawn a quarter round). */
function footprint(p: Part): [number, number, number, number] {
  const [x, z, w, d] = p.turn ? [-p.z, p.x, p.d, p.w] : [p.x, p.z, p.w, p.d];
  const lx = Math.abs(p.lean?.[0] ?? 0), lz = Math.abs(p.lean?.[1] ?? 0);
  return [x - w / 2 - lx, x + w / 2 + lx, z - d / 2 - lz, z + d / 2 + lz];
}

const GARDEN_TYPES = [...Object.keys(GARDEN_OPTIONS), "metal_shed", "greenhouse"];

describe("garden buildings and planters", () => {
  it("stand on their footprint (eaves and plants reaching a little past it)", () => {
    for (const type of GARDEN_TYPES) {
      const def = FURNITURE[type];
      const [w, d, h] = def.size;
      for (const p of def.build(w, d, h, { id: "a", type, x: 0, z: 0, rotation: 0, w, d, h })) {
        const [x0, x1, z0, z1] = footprint(p);
        expect(x0, type).toBeGreaterThan(-w / 2 - 0.45);
        expect(x1, type).toBeLessThan(w / 2 + 0.45);
        expect(z0, type).toBeGreaterThan(-d / 2 - 0.45);
        expect(z1, type).toBeLessThan(d / 2 + 0.45);
        expect(p.y, type).toBeGreaterThanOrEqual(-0.05);
        expect(p.y + p.h, type).toBeLessThan(h + 0.6);
      }
    }
  });

  it("turns a shed's gable-end door to the front, and puts its handle where the door was picked", () => {
    const handles = (type: string, door: string) => {
      const def = FURNITURE[type];
      const [w, d, h] = def.size;
      return def.build(w, d, h, { id: "a", type, x: 0, z: 0, rotation: 0, w, d, h, door: door as never })
        .filter((p) => p.role === "dark" && Math.abs(p.h - 0.13) < 1e-6).map(footprint);
    };
    for (const type of ["shed", "shed_reverse", "shed_pent"]) {
      const [w, d] = FURNITURE[type].size;
      for (const f of handles(type, "left")) {
        expect(f[2], type).toBeGreaterThan(d / 2 - 0.01);
        expect((f[0] + f[1]) / 2, type).toBeLessThan(0);
      }
      expect((handles(type, "right")[0][0] + handles(type, "right")[0][1]) / 2, type).toBeGreaterThan(0);
      expect(handles(type, "double").length, type).toBe(2);
      void w;
    }
  });

  it("fits the windows asked for, narrower when they would not fit at their usual width", () => {
    const def = FURNITURE.shed_reverse;
    const [w, d, h] = def.size;
    const panes = (windows: number) => def.build(w, d, h, { id: "a", type: "shed_reverse", x: 0, z: 0, rotation: 0, w, d, h, door: "right", windows }).filter((p) => p.role === "glass");
    expect(panes(0).length).toBe(0);
    expect(panes(2).length).toBe(2);
    expect(panes(2)[0].w).toBeLessThan(0.55);
  });

  it("keeps each piece's choices within its type's, and falls back to the usual", () => {
    expect(gardenChoice("pergola", { canopy: "louvres" }).canopy).toBe("open");
    expect(gardenChoice("pergola_louvred", {}).canopy).toBe("louvres");
    expect(gardenChoice("shed", { windows: 9 }).windows).toBe(3);
    expect(gardenChoice("shed", {}).windows).toBe(1);
    expect(gardenChoice("raised_bed", { material: "rattan" }).material).toBe("rattan");
    expect(gardenChoice("raised_bed", { plants: "cacti" as never }).plants).toBe("vegetables");
    expect(gardenChoice("sofa", {})).toEqual({ canopy: null, roofing: null, door: null, windows: 0, material: null, plants: null, waste: null });
  });

  it("swaps within pergolas, sheds and planters", () => {
    expect(styleOptions("pergola")).toEqual(expect.arrayContaining(["pergola_louvred", "gazebo", "arbour"]));
    expect(styleOptions("shed")).toEqual(expect.arrayContaining(["summerhouse", "log_cabin", "garden_office", "greenhouse"]));
    expect(styleOptions("planter")).not.toContain("hedge");
  });

  it("grows the same plants each time for the same piece", () => {
    const def = FURNITURE.planter;
    const [w, d, h] = def.size;
    const a = def.build(w, d, h, { id: "p1", type: "planter", x: 0, z: 0, rotation: 0, w, d, h });
    expect(def.build(w, d, h, { id: "p1", type: "planter", x: 0, z: 0, rotation: 0, w, d, h })).toEqual(a);
    expect(def.build(w, d, h, { id: "p2", type: "planter", x: 0, z: 0, rotation: 0, w, d, h })).not.toEqual(a);
  });
});
