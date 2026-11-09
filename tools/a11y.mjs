// Accessibility check of the dev harness with axe-core: the demo house by day and by night, its
// sheets and menus, the first run and the editor. Fails on serious or critical problems.
//   cd frontend && npm run a11y [-- --chrome <path>] [--verbose]
// Uses $CHROME, Google Chrome on a Mac, or Playwright's Chromium (`npx playwright-core install chromium`).
// The end-to-end test (tests/e2e/run.mjs) runs the same check on the panel and a card in Home Assistant.
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { chromium } from "../frontend/node_modules/playwright-core/index.mjs";
import { axeRun, axeReport } from "./axe.mjs";

const MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const { values: opt } = parseArgs({
  options: {
    chrome: { type: "string", default: process.env.CHROME ?? (existsSync(MAC_CHROME) ? MAC_CHROME : undefined) },
    port: { type: "string", default: "5199" },
    verbose: { type: "boolean", default: false },
  },
});

const { startDevServer } = await import("../frontend/dev/server.mjs");
const out = new URL("../frontend/dev/out/a11y/", import.meta.url).pathname;
await startDevServer(out, Number(opt.port), true);
// the first build is written a moment later
for (let i = 0; i < 120; i++) {
  const res = await fetch(`http://127.0.0.1:${opt.port}/dev/out/main.js`).catch(() => null);
  if (res?.ok) break;
  await new Promise((r) => setTimeout(r, 250));
}

const browser = await chromium.launch({
  executablePath: opt.chrome,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

/** The views to check: a query string, and what to do on the page first. */
const VIEWS = [
  ["the house at night", "theme=night"],
  ["the house by day", "theme=day"],
  ["a room's sheet by day", "theme=day&floor=0", (p) => p.locator(".vh-label[data-room]").first().click()],
  ["a room's sheet at night", "theme=night&floor=0", (p) => p.locator(".vh-label[data-room]").first().click()],
  ["the list of rooms and devices", "theme=day", (p) => p.locator('[data-act="list"]').click()],
  ["the list at night", "theme=night", (p) => p.locator('[data-act="list"]').click()],
  ["the graphics menu", "theme=day", (p) => p.locator('[data-act="graphics"]').click()],
  ["the sun and weather panel", "theme=day", (p) => p.locator('[data-act="sky"]').click()],
  ["the alarm sheet", "theme=night", (p) => p.locator(".vh-alarm").click()],
  ["the alarm asking first", "theme=day", async (p) => {
    await p.locator(".vh-alarm").click();
    await p.locator(".vh-alarm-panel .actions .vh-chip").first().click();
  }],
  ["the temperature map", "theme=day", (p) => p.locator('[data-act="heat"]').click()],
  ["the first run", "plan=empty&theme=day"],
  ["the editor", "theme=day", (p) => p.locator(".vh-edit").click(), ".ed-save"],
  ["the editor's rooms", "theme=day", async (p) => {
    await p.locator(".vh-edit").click();
    await p.locator('.ed-tab[data-tab="rooms"]').click();
  }, ".ed-save"],
  ["the editor's devices", "theme=night", async (p) => {
    await p.locator(".vh-edit").click();
    await p.locator('.ed-tab[data-tab="devices"]').click();
  }, ".ed-save"],
  ["a phone, by day", "theme=day&floor=0", (p) => p.setViewportSize({ width: 390, height: 780 })],
  ["the 2D plan", "theme=day", async (p) => {
    await p.locator(".vh-edit").click();
    await p.locator(".ed-mode").nth(1).click();
  }, ".ed-save"],
];

let serious = 0;
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => console.log(`  page error: ${e.message}`));
for (const [name, query, act, waitFor] of VIEWS) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:${opt.port}/?${query}`);
  await page.evaluate(() => new Promise((r) => (window.vh ? r() : window.addEventListener("virtuhome-ready", r, { once: true }))));
  await page.waitForTimeout(800);
  try {
    if (act) await act(page);
    if (waitFor) await page.locator(waitFor).first().waitFor({ state: "visible", timeout: 15_000 });
  } catch (err) {
    console.log(`not ok - ${name}: could not open it (${err.message.split("\n")[0]})`);
    serious++;
    continue;
  }
  await page.waitForTimeout(600);
  const result = await axeRun(page);
  const { lines, count } = axeReport(result, opt.verbose);
  serious += count;
  console.log(`${count ? "not ok" : "ok"} - ${name}${lines.length ? `\n${lines.join("\n")}` : ""}`);
}
await browser.close();
console.log(serious ? `${serious} serious or critical problems` : "no serious or critical problems");
process.exit(serious ? 1 : 0);
