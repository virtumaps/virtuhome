import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { normalizePlan, type Plan } from "../src/model/plan";
import { buildFloor } from "../src/scene/build";
import { DAY } from "../src/scene/palette";
import { DEMO_PLAN } from "../src/demo/plan";
import { APP_BYTES, DEMO_TRIANGLES, FIRST_LOAD_BYTES, LOADER_BYTES } from "./budgets";

const built = new URL("../../custom_components/virtuhome/frontend/", import.meta.url).pathname;
const tablet = { low: true };

/** What a floor draws in the model look (Tablet and Standard): one draw call per mesh that has triangles. */
function drawCalls(plan: Plan, fi: number) {
  const fb = buildFloor(plan, fi, DAY, tablet);
  const meshes = { opaque: fb.opaque, glass: fb.glass, roof: fb.roof, roofGlass: fb.roofGlass };
  const calls = Object.values(meshes).filter((g) => g.idx.length > 0).length;
  const groups = Object.values(meshes).map((g) => g.toBufferGeometry().groups.length);
  const triangles = Object.values(meshes).reduce((n, g) => n + g.idx.length / 3, 0);
  return { fb, calls, groups, triangles };
}

describe("draw calls", () => {
  const plan = normalizePlan(DEMO_PLAN);

  it("draws each floor in at most four meshes, without draw groups, plus its moving parts", () => {
    plan.floors.forEach((_, fi) => {
      const { calls, groups } = drawCalls(plan, fi);
      // the floor's opaque and glass meshes, and its roof's; doors and blinds add two dynamic ones
      expect(calls).toBeLessThanOrEqual(4);
      expect(groups.every((n) => n === 0)).toBe(true);
    });
  });

  it("doesn't add draw calls for more devices or furniture", () => {
    const busy = structuredClone(plan);
    const f = busy.floors[0];
    const room = f.rooms[0];
    const [x, z] = room.points[0];
    for (let i = 0; i < 40; i++) {
      f.devices.push({ id: `extra_d${i}`, entity: `light.extra_${i}`, x: x + 0.5, z: z + 0.5 });
      f.furniture.push({ id: `extra_f${i}`, type: "plant_tall", x: x + 0.6, z: z + 0.6, w: 0.4, d: 0.4, rotation: 0 } as never);
    }
    expect(drawCalls(normalizePlan(busy), 0).calls).toBe(drawCalls(plan, 0).calls);
  });

  it(`keeps the demo house under ${DEMO_TRIANGLES.toLocaleString("en-GB")} triangles at the Tablet level`, () => {
    const triangles = plan.floors.reduce((n, _, fi) => n + drawCalls(plan, fi).triangles, 0);
    console.info(`demo house at the Tablet level: ${triangles} triangles (budget ${DEMO_TRIANGLES})`);
    expect(triangles).toBeLessThanOrEqual(DEMO_TRIANGLES);
  });
});

/** app.js and every chunk it imports up front (not the ones loaded later with import()). */
function firstLoad(dir: string): string[] {
  const seen = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const src = readFileSync(dir + file, "utf8");
    // static imports only: `import{…}from"./chunk-X.js"` or `import"./chunk-X.js"`, never `import("./…")`
    for (const m of src.matchAll(/(?:^|[;}\s])(?:import|export)\s*(?:[\w*{}\s,$]*?from\s*)?["']\.\/([\w.-]+\.js)["']/g)) visit(m[1]);
  };
  visit("app.js");
  return [...seen];
}

describe("bundle size", () => {
  const app = built + "app/";
  const files = readdirSync(app).filter((f) => f.endsWith(".js"));
  const size = (f: string) => statSync(app + f).size;

  it(`keeps the loader under ${LOADER_BYTES} bytes`, () => {
    expect(statSync(built + "virtuhome-loader.js").size).toBeLessThanOrEqual(LOADER_BYTES);
  });

  it("keeps the app within 10% of its budget", () => {
    const total = files.reduce((n, f) => n + size(f), 0);
    const first = firstLoad(app).reduce((n, f) => n + size(f), 0);
    console.info(`app: ${total} bytes in all (budget ${APP_BYTES}), ${first} bytes to show the house (budget ${FIRST_LOAD_BYTES})`);
    expect(total).toBeLessThanOrEqual(APP_BYTES * 1.1);
    expect(first).toBeLessThanOrEqual(FIRST_LOAD_BYTES * 1.1);
  });

  it("finds the chunks app.js loads up front, and not the lazy ones", () => {
    const first = firstLoad(app);
    expect(first[0]).toBe("app.js");
    expect(first.length).toBeGreaterThan(1);
    expect(first.length).toBeLessThan(files.length);
  });

  it("fetches the demo home only when someone opens it", () => {
    // the demo house and its pretend states are in a chunk of their own, not in what shows the house
    const demo = files.filter((f) => readFileSync(app + f, "utf8").includes("Demo house"));
    expect(demo.length).toBe(1);
    expect(firstLoad(app)).not.toContain(demo[0]);
  });
});
