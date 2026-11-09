// Visual checks: draws key views of the demo home in software WebGL (tools/render.mjs) and compares
// each with its stored picture in tests/visual/baseline/, so a look that breaks quietly (flicker, a
// missing texture, a wall drawn dark) shows before a release. CI runs it in the Playwright container
// (.github/workflows/visual.yml); fonts and the software renderer differ elsewhere, so the stored
// pictures come from CI.
//
//   node tests/visual/run.mjs [view…]   compare (all views, or those named)
//     --update      store what is drawn as the new pictures (in the same container as CI)
//     --fetch       store the pictures CI drew for this branch's last commit (needs the gh CLI)
//     --out <dir>   where the drawn pictures and the differences go (tools/out/visual)
//
// Needs `npm ci` in frontend/, and Playwright's Chromium (`npx playwright-core install chromium`).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { capture, land, open, settle, start } from "../../tools/render.mjs";
import { compare, readPng, writePng } from "../../tools/png.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const BASELINE = join(ROOT, "tests/visual/baseline");
const DAY = "2026-05-14T14:30:00+01:00";
const NIGHT = "2026-01-15T21:00:00Z";

/** How far a pixel's colour may move (0..1, as pixelmatch measures it) before it counts as changed. */
const PIXEL = 0.1;
/** The share of changed pixels a view may have; one missing marker is about 0.2 %. */
const LIMIT = 0.001;

async function editor(page, plan2d = false) {
  await page.locator(".vh-edit").click();
  await page.locator(".ed").waitFor();
  if (plan2d) await page.getByRole("button", { name: "2D plan", exact: true }).click();
  await page.evaluate(() => window.vh.editor.select({ floor: 0, kind: "room", id: "living_room" }));
  await land(page);
}

/** The views: each graphics level by day or night, the whole house and a floor, the walls low, and the editor. */
export const VIEWS = [
  { name: "tablet-house-day", query: "quality=low&theme=day", time: DAY },
  { name: "tablet-house-night", query: "quality=low&theme=night", time: NIGHT },
  { name: "standard-house-day", query: "quality=medium&theme=day", time: DAY },
  { name: "standard-floor-night", query: "quality=medium&theme=night&floor=0", time: NIGHT },
  { name: "standard-upstairs-low-walls", query: "quality=medium&theme=day&floor=1&walls=low", time: DAY },
  { name: "editor-3d", query: "quality=medium&theme=day&floor=0", time: DAY, width: 1100, height: 620, steps: (page) => editor(page) },
  { name: "editor-2d", query: "quality=medium&theme=day&floor=0", time: DAY, width: 1100, height: 620, steps: (page) => editor(page, true) },
  { name: "realistic-floor-day", query: "quality=high&theme=day&floor=0", time: DAY },
  { name: "ultra-house-night", query: "quality=ultra&theme=night", time: NIGHT },
];

/** The pictures CI drew for this branch's last commit, into tests/visual/baseline. */
function fetchFromCi() {
  const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  const head = run("git", ["rev-parse", "HEAD"]);
  const runs = JSON.parse(run("gh", ["run", "list", "--workflow", "visual.yml", "--branch", branch, "--limit", "20", "--json", "databaseId,headSha,status"]));
  const found = runs.find((r) => r.headSha === head);
  if (!found) throw new Error(`No Visual checks run for ${head.slice(0, 7)} on ${branch} yet: push it first.`);
  if (found.status !== "completed") {
    console.log(`Waiting for run ${found.databaseId}…`);
    try {
      execFileSync("gh", ["run", "watch", String(found.databaseId)], { cwd: ROOT, stdio: "inherit" });
    } catch {
      // a failed run still has its pictures
    }
  }
  const dir = mkdtempSync(join(tmpdir(), "virtuhome-visual-"));
  run("gh", ["run", "download", String(found.databaseId), "--name", "visual-new", "--dir", dir]);
  const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
  if (!files.length) throw new Error(`Run ${found.databaseId} left no pictures.`);
  for (const f of files) copyFileSync(join(dir, f), join(BASELINE, f));
  rmSync(dir, { recursive: true, force: true });
  console.log(`Stored ${files.length} pictures from run ${found.databaseId} in tests/visual/baseline. Look at them, then commit them.`);
}

async function main() {
  const { values: opt, positionals } = parseArgs({
    allowPositionals: true,
    options: { update: { type: "boolean" }, fetch: { type: "boolean" }, out: { type: "string" }, chrome: { type: "string" } },
  });
  mkdirSync(BASELINE, { recursive: true });
  if (opt.fetch) return fetchFromCi();
  const unknown = positionals.filter((p) => !VIEWS.some((v) => v.name === p));
  if (unknown.length) throw new Error(`No view called ${unknown.join(", ")}. There are: ${VIEWS.map((v) => v.name).join(", ")}`);
  const views = positionals.length ? VIEWS.filter((v) => positionals.includes(v.name)) : VIEWS;
  const out = opt.out ?? join(ROOT, "tools/out/visual");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, "new"), { recursive: true });

  const failed = [];
  const env = await start({ chrome: opt.chrome });
  try {
    for (const v of views) {
      const t = Date.now();
      let png;
      try {
        const view = await open(env, { width: 800, height: 500, ...v });
        if (v.steps) await v.steps(view.page);
        await settle(view);
        png = await capture(view.page);
        await view.context.close();
      } catch (err) {
        failed.push(v.name);
        console.log(`not ok - ${v.name}: ${err.message}`);
        continue;
      }
      const took = `${((Date.now() - t) / 1000).toFixed(0)} s`;
      writeFileSync(join(out, "new", `${v.name}.png`), png);
      const stored = join(BASELINE, `${v.name}.png`);
      if (opt.update) {
        writeFileSync(stored, png);
        console.log(`stored - ${v.name} (${took})`);
        continue;
      }
      if (!existsSync(stored)) {
        failed.push(v.name);
        console.log(`not ok - ${v.name}: no stored picture yet (${took})`);
        continue;
      }
      const res = compare(readPng(readFileSync(stored)), readPng(png), PIXEL);
      const share = `${(res.ratio * 100).toFixed(3)} %`;
      if (res.sized && res.ratio <= LIMIT) {
        console.log(`ok - ${v.name}: ${share} of pixels differ (${took})`);
        continue;
      }
      failed.push(v.name);
      if (res.diff) writeFileSync(join(out, `${v.name}.diff.png`), writePng(res.diff));
      console.log(`not ok - ${v.name}: ${res.sized ? `${share} of pixels differ, more than ${LIMIT * 100} %` : "a different size"} (${took})`);
    }
  } finally {
    await env.close();
  }
  if (!positionals.length) {
    const views = new Set(VIEWS.map((v) => `${v.name}.png`));
    for (const f of readdirSync(BASELINE).filter((f) => f.endsWith(".png") && !views.has(f))) {
      failed.push(f);
      console.log(`not ok - tests/visual/baseline/${f} belongs to no view: remove it`);
    }
  }
  if (failed.length) {
    if (!opt.update) {
      console.log(`\n${failed.length} of ${views.length} views changed. Side by side (stored | changed pixels in red | now) in ${out}.`);
      console.log("If the look changed on purpose, store the new pictures: see docs/DEVELOPMENT.md, Visual checks.");
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(String(err?.message ?? err));
  process.exitCode = 1;
});
