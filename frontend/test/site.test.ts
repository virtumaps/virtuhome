import { describe, expect, it } from "vitest";
import { bundle, demoPage, liveCode } from "../dev/site.mjs";

describe("the online demo site", () => {
  it("has nothing in it that reaches a Home Assistant", async () => {
    const { files, preload, problems } = await bundle();
    expect(problems).toEqual([]);
    expect(files.map((f) => f.name)).toContain("demo.js");
    // the editor and the realistic look are fetched later
    expect(preload.length).toBeLessThan(files.length - 1);
  }, 60_000);

  it("would catch the harness's live mode", async () => {
    const { problems } = await bundle("dev/main.ts");
    expect(problems.some((p) => p.includes("home-assistant-js-websocket"))).toBe(true);
    expect(problems.some((p) => p.includes("dev/main.ts"))).toBe(true);
    expect(problems.some((p) => p.includes("local.env"))).toBe(true);
  }, 60_000);

  it("names each problem", () => {
    expect(liveCode([{ name: "a.js", text: 'const u = "HA_TOKEN"' }], [])).toEqual(['a.js contains "HA_TOKEN"']);
    expect(liveCode([{ name: "a.js", text: "fine" }], ["src/ui/view.ts", "dev/demo.ts"])).toEqual([]);
  });

  it("says it is a demo and loads nothing from elsewhere", () => {
    const page = demoPage(["chunk-A.js"]);
    expect(page).toContain("This is a demo.");
    expect(page).toContain("https://github.com/virtumaps/virtuhome#install-hacs-custom-repository");
    expect(page).toContain('<link rel="modulepreload" href="chunk-A.js" />');
    expect(page).toContain('src="demo.js"');
    // no trackers or analytics: every script and stylesheet is the site's own
    expect(page).not.toMatch(/<(script|link)[^>]+(src|href)="(https?:)?\/\//);
  });
});
