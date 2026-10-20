import { describe, expect, it } from "vitest";
import { normalizePlan } from "../src/model/plan";
import { buildFloor, lin } from "../src/scene/build";
import type { Geo } from "../src/scene/geo";
import { relight, roomLights, type LightingState } from "../src/scene/lighting";
import { DAY, NIGHT } from "../src/scene/palette";

// Saved plans that must keep loading: the demo house as every release stored it (v*.json, made
// from that release's code) and small hand-made ones with the rarer parts. They are kept as they
// are for good; when one stops loading, fix normalizePlan, not the fixture. When releasing,
// tools/save_plan_fixture.py adds the new version's.
declare global {
  interface ImportMeta {
    /** Vite's: the files matching a pattern, loaded. */
    glob<T>(pattern: string, options: { eager: true; import: "default" }): Record<string, T>;
  }
}
type Saved = { floors: { furniture: { type: string; y?: number | null }[] }[] };
const saved = Object.fromEntries(
  Object.entries(import.meta.glob<Saved>("./fixtures/plans/*.json", { eager: true, import: "default" })).map(([path, plan]) => [path.split("/").pop()!, plan]),
);
const files = Object.keys(saved).sort();
const read = (file: string): Saved => structuredClone(saved[file]);
const { version } = Object.values(import.meta.glob<{ version: string }>("../../custom_components/virtuhome/manifest.json", { eager: true, import: "default" }))[0];

const finite = (g: Geo) => g.pos.every((v) => Number.isFinite(v));

/** Every lamp on, every door open: the most lighting code a floor can run. */
const allOn: LightingState = {
  ambient: 0.4,
  lamp: () => ({ on: true, rgb: lin(0xffd8a8), level: 1 }),
  portal: () => 1,
  glow: () => null,
};

describe("saved plans", () => {
  it("include the demo house from every release", () => {
    expect(files).toContain(`v${version}.json`);
    expect(files.filter((f) => /^v\d+\.\d+\.\d+\.json$/.test(f)).length).toBeGreaterThanOrEqual(12);
  });

  describe.each(files)("%s", (file) => {
    const plan = normalizePlan(read(file));

    it("loads with all its floors, lowest first", () => {
      expect(plan.version).toBe(1);
      expect(plan.floors.length).toBe(saved[file].floors.length);
      const levels = plan.floors.map((f) => f.elevation);
      expect(levels).toEqual([...levels].sort((a, b) => a - b));
      for (const f of plan.floors) {
        for (const list of [f.rooms, f.openings, f.furniture, f.devices, f.walls, f.outdoor, f.fences, f.roofs]) expect(Array.isArray(list)).toBe(true);
      }
    });

    it("builds every floor, with its roofs", () => {
      for (const low of [false, true]) {
        plan.floors.forEach((floor, i) => {
          const fb = buildFloor(plan, i, low ? DAY : NIGHT, { low });
          const where = `${floor.id}${low ? " (low)" : ""}`;
          for (const g of [fb.opaque, fb.glass, fb.roof, fb.roofGlass]) expect(finite(g), where).toBe(true);
          if (floor.rooms.length) expect(fb.opaque.vertexCount, where).toBeGreaterThan(0);
          expect(fb.roofs.length, where).toBe(floor.roofs!.length);
          const lights = roomLights(fb, NIGHT, allOn);
          for (const g of [fb.opaque, fb.roof]) {
            const out = new Float32Array(g.vertexCount * 3);
            relight(g, out, lights, allOn, NIGHT);
            expect(out.every((v) => Number.isFinite(v)), where).toBe(true);
          }
        });
      }
    });

    it("loads the same after it is saved again", () => {
      expect(normalizePlan(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
    });
  });

  it("lifts wall cupboards and ceiling lamps that 0.1 and 0.2 saved on the floor", () => {
    for (const file of ["v0.1.0.json", "v0.2.0.json"]) {
      expect(read(file).floors[0].furniture.find((x) => x.type === "kitchen_wall")!.y).toBe(0);
      const ground = normalizePlan(read(file)).floors[0];
      for (const type of ["kitchen_wall", "lamp_ceiling"]) expect(ground.furniture.find((x) => x.type === type)!.y, `${file} ${type}`).toBeUndefined();
    }
  });
});
