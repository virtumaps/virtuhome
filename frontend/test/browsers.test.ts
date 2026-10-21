import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { jsonClone } from "../src/compat";
import { normalizePlan } from "../src/model/plan";
import { DEMO_PLAN } from "../src/demo/plan";

const root = new URL("../", import.meta.url).pathname;
const floor = JSON.parse(readFileSync(root + "browsers.json", "utf8")) as { chrome: number; safari: number; esbuild: string[] };
const built = new URL("../../custom_components/virtuhome/frontend/", import.meta.url).pathname;
const files = ["virtuhome-loader.js", ...readdirSync(built + "app").filter((f) => f.endsWith(".js")).map((f) => `app/${f}`)];
const code = files.map((f) => readFileSync(built + f, "utf8"));

/**
 * Things newer than the oldest supported browsers that the build can't turn into older code:
 * functions they don't have, and CSS they would drop (a whole rule, for an unknown selector).
 */
const TOO_NEW: [string, RegExp][] = [
  ["Object.hasOwn (Chrome 93)", /Object\.hasOwn\b/],
  ["findLast (Chrome 97)", /\.findLast(Index)?\(/],
  ["toSorted/toReversed/toSpliced (Chrome 110)", /\.to(Sorted|Reversed|Spliced)\(/],
  ["Object.groupBy (Chrome 117)", /(Object|Map)\.groupBy\(/],
  ["AbortSignal.timeout (Chrome 103, Safari 16)", /AbortSignal\.timeout\(/],
  ["Promise.withResolvers (Chrome 119)", /Promise\.withResolvers\(/],
  ["logical assignment (Chrome 85 syntax, would mean the target was raised)", /[^=!<>]\?\?=|\|\|=|&&=/],
  ["CSS :has() (Chrome 105, Safari 15.4)", /:has\(/],
  ["CSS container queries (Chrome 105, Safari 16)", /@container\b|\d(cqw|cqh|cqi|cqb|cqmin|cqmax)\b/],
  ["CSS color-mix() (Chrome 111, Safari 16.2)", /color-mix\(/],
  ["CSS @layer (Chrome 99, Safari 15.4)", /@layer\b/],
];

describe("oldest supported browsers", () => {
  it("builds for the browsers in browsers.json", () => {
    expect(floor.esbuild).toContain(`chrome${floor.chrome}`);
    expect(floor.esbuild).toContain(`safari${floor.safari}`);
    expect(readFileSync(root + "build.mjs", "utf8")).toContain("target: browsers.esbuild");
  });

  for (const [what, re] of TOO_NEW) {
    it(`uses no ${what}`, () => {
      const hits = files.filter((_, i) => re.test(code[i]));
      expect(hits).toEqual([]);
    });
  }

  it("gives every dynamic viewport height a plain one before it", () => {
    for (const src of code) {
      const dynamic = src.match(/\d+(dvh|svh|lvh)/g) ?? [];
      const backed = src.match(/(height|min-height|max-height):\s*\d+vh;\s*\1:\s*\d+(dvh|svh|lvh)/g) ?? [];
      expect(backed.length).toBe(dynamic.length);
    }
  });

  it("loads the stand-ins first, in Home Assistant and in the dev harness", () => {
    expect(readFileSync(root + "src/app.ts", "utf8")).toMatch(/^(\/\/.*\n)*import "\.\/compat";/);
    expect(readFileSync(root + "dev/main.ts", "utf8")).toMatch(/^(\/\/.*\n)*import "\.\.\/src\/compat";/);
  });

  it("copies plans without structuredClone", () => {
    const plan = normalizePlan(DEMO_PLAN);
    const copy = jsonClone(plan);
    expect(copy).toEqual(plan);
    expect(copy).not.toBe(plan);
    expect(copy.floors[0]).not.toBe(plan.floors[0]);
    expect(jsonClone(undefined)).toBeUndefined();
  });
});
