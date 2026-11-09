// Makes the screenshots the user guide and the README show, from the demo home, the same way every
// time (tools/render.mjs): `npm run screenshots` in frontend/ makes them all, `npm run screenshots --
// night day` the ones named. docs/screenshots/README.md says what each one shows.
//   --gpu            draw with this computer's graphics card (quicker; software WebGL otherwise)
//   --chrome <path>  another Chrome than Playwright's (`npx playwright-core install chromium`)
//   --out <dir>      somewhere else than docs/screenshots
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { capture, land, open, settle, start } from "./render.mjs";
import { readPng, sideBySide, writePng } from "./png.mjs";

const ROOT = new URL("../", import.meta.url).pathname;
/** An afternoon in May (the sun in the south-west), and a winter's evening. */
const DAY = "2026-05-14T14:30:00+01:00";
const NIGHT = "2026-01-15T21:00:00Z";
const WIDE = { width: 1440, height: 900 };
const FIXTURES = join(ROOT, "frontend/test/fixtures");

// ------------------------------------------------------------------ steps on the page

const button = (page, name) => page.getByRole("button", { name, exact: true }).first();
async function openEditor(page) {
  await page.locator(".vh-edit").click();
  await page.locator(".ed").waitFor();
}
/** The editor's selection (the drawer then shows Selected). */
const select = (page, sel) => page.evaluate((s) => window.vh.editor.select(s), sel);
/** The view's chrome left out, for pictures of the house alone. */
const houseOnly = (page) => page.evaluate(() => {
  const style = document.createElement("style");
  style.textContent = ".vh-bar, .vh-tools, .vh-status { display: none !important; }";
  document.getElementById("view").shadowRoot.append(style);
});
/** The camera `f` times as far from what it looks at. */
const zoom = (page, f) => page.evaluate((k) => {
  const v = window.vh.viewer;
  const to = v.controls.target.clone();
  v.flyTo(v.camera.position.clone().sub(to).multiplyScalar(k).add(to), to, false);
}, f);
/** A house type as a new home starts with it: picked, used, saved, and the editor closed. */
async function houseType(page, name) {
  await page.locator(".vh-start-choice").filter({ hasText: "Start from a house type" }).click();
  await page.locator(".ed-house").filter({ hasText: name }).click();
  await button(page, "Use this house type").click();
  await page.locator(".ed-save").click();
  await page.locator(".ed-status").filter({ hasText: "Saved" }).waitFor();
  await page.locator(".ed-head .ed-ib").click();
  await page.locator(".ed").waitFor({ state: "detached" });
  await houseOnly(page);
  await land(page);
  await zoom(page, 0.62);
}

/** Two pictures side by side with a white gap, as a PNG. */
const pair = (a, b) => writePng(sideBySide([readPng(a), readPng(b)]));

// ------------------------------------------------------------------ the screenshots

/**
 * Each screenshot: its file in docs/screenshots, what it shows (docs/screenshots/README.md), the
 * window, the harness's address and the time, then `steps` (before the clock stops) or `make` for
 * pictures put together from more than one view.
 */
export const SHOTS = [
  { file: "house.jpg", ...WIDE, query: "theme=day&quality=high", time: DAY },
  { file: "first-run.jpg", width: 900, height: 600, query: "plan=empty&theme=night&quality=medium", time: DAY },
  { file: "day.jpg", ...WIDE, query: "theme=day&floor=0&quality=high", time: DAY },
  {
    file: "getting-started.jpg", width: 1280, height: 800, query: "plan=empty&theme=night&quality=medium", time: DAY,
    steps: (page) => page.locator(".vh-start-choice").filter({ hasText: "Trace a floor plan picture" }).click(),
  },
  {
    file: "house-types.jpg", width: 1280, height: 1065, query: "plan=empty&theme=night&quality=medium", time: DAY, clip: ".ed",
    async steps(page) {
      await page.locator(".vh-start-choice").filter({ hasText: "Start from a house type" }).click();
      await page.locator(".ed-house").filter({ hasText: "Three-bed semi-detached" }).click();
      // picking one scrolls to Fit to my home: back up to show the house types too
      await page.locator(".ed-body").evaluate((el) => (el.scrollTop = 0));
    },
  },
  {
    file: "house-types-3d.jpg",
    async make(env) {
      const one = async (name) => {
        const view = await open(env, { query: "plan=empty&theme=day&quality=high", width: 768, height: 520, time: DAY });
        await houseType(view.page, name);
        await settle(view);
        const png = await capture(view.page);
        await view.context.close();
        return png;
      };
      return pair(await one("Three-bed semi-detached"), await one("Two-bed bungalow"));
    },
  },
  {
    file: "import.jpg", ...WIDE, query: "theme=day&quality=high", time: DAY,
    async steps(page) {
      await openEditor(page);
      const chooser = page.waitForEvent("filechooser");
      await button(page, "Import a scan or plan…").click();
      await (await chooser).setFiles(join(FIXTURES, "import/house.sh3d"));
      await button(page, "Replace").click();
      await page.locator(".ed-report").filter({ hasText: "devices placed" }).waitFor();
      await page.evaluate(() => window.vh.showFloor(0));
    },
  },
  {
    file: "plan.jpg", ...WIDE, query: "theme=day&floor=0&quality=medium", time: DAY,
    async steps(page) {
      await openEditor(page);
      await button(page, "2D plan").click();
      await select(page, { floor: 0, kind: "room", id: "living_room" });
    },
  },
  {
    file: "find-rooms.jpg",
    async make(env) {
      const view = await open(env, { query: "plan=empty&theme=day&quality=medium", width: 1096, height: 652, time: DAY });
      const { page } = view;
      await page.locator(".vh-start-choice").filter({ hasText: "Trace a floor plan picture" }).click();
      const chooser = page.waitForEvent("filechooser");
      await button(page, "Choose a picture…").click();
      await (await chooser).setFiles(join(FIXTURES, "floorplans/detached-first.png"));
      // the scale: the top outside wall, from corner to corner (detached-first.json), is 9 m
      await page.locator(".p2-panel").getByText("Click both ends").waitFor();
      // once the picture has loaded and the plan has fitted itself round it
      const img = page.locator(".p2 image").first();
      let box = null;
      for (let last = ""; ; await page.waitForTimeout(250)) {
        box = await img.boundingBox();
        const now = JSON.stringify(box);
        if (box?.width && now === last) break;
        last = now;
      }
      for (const [px, py] of [[307.69, 400], [1692.31, 400]]) await page.mouse.click(box.x + (px / 1938) * box.width, box.y + (py / 2000) * box.height);
      await page.locator(".p2-input").waitFor();
      await page.keyboard.type("9");
      await page.keyboard.press("Enter");
      await page.locator(".ed-status").getByText("Scaled").waitFor();
      // the picture at its real size is small: Fit to view, then a little closer (into the free space
      // right of the panel and under it)
      await page.locator(".p2-bar button[title=\"Fit to view\"]").click();
      await page.mouse.move(600, 640);
      await page.mouse.wheel(0, -224);
      await button(page, "Find the rooms").click();
      await button(page, "Add these rooms").waitFor({ timeout: 120_000 });
      const clip = { x: 0, y: 0, width: 716, height: 652 };
      await settle(view);
      const found = await capture(page, clip);
      await page.clock.resume();
      await button(page, "Add these rooms").click();
      await button(page, "Add these rooms").waitFor({ state: "detached" });
      await settle({ ...view, time: view.time + 60_000 });
      const added = await capture(page, clip);
      await view.context.close();
      return pair(found, added);
    },
  },
  {
    file: "editor.jpg", ...WIDE, query: "theme=day&floor=0&quality=high", time: DAY,
    async steps(page) {
      await openEditor(page);
      await select(page, { floor: 0, kind: "room", id: "living_room" });
      await button(page, "Herringbone").click();
      await button(page, "Damask wallpaper").click();
      await page.locator('.ed-sw[title="Forest"]').click();
      await page.evaluate(() => window.vh.viewer.frameRoom(0, 2));
      await land(page);
    },
  },
  { file: "night.jpg", ...WIDE, query: "theme=night&floor=0&quality=ultra", time: NIGHT },
  {
    file: "live.jpg", ...WIDE, query: "theme=night&floor=0&quality=medium&leak", time: NIGHT,
    steps: (page) => page.locator('[data-act="heat"]').click(),
  },
  {
    // a motion sensor renamed in Home Assistant; graphics on Automatic (in software WebGL, Graphics on
    // this device says so)
    file: "check-setup.jpg", ...WIDE, query: "theme=night", time: NIGHT,
    async steps(page) {
      await page.evaluate(() => window.demo.rename("binary_sensor.hall_motion", "binary_sensor.hallway_motion_sensor"));
      await openEditor(page);
      await button(page, "Hide this list").click();
      await page.locator(".ed").getByText("Linked entities").waitFor();
    },
  },
];

async function shoot(env, shot) {
  if (shot.make) return shot.make(env);
  const view = await open(env, shot);
  try {
    if (shot.steps) await shot.steps(view.page);
    await settle(view);
    const clip = shot.clip ? await view.page.locator(shot.clip).boundingBox() : undefined;
    return await capture(view.page, clip);
  } finally {
    await view.context.close();
  }
}

/** A PNG as a JPEG, by the browser's own encoder (no image library needed). */
async function jpeg(env, png, quality = 0.82) {
  const page = await env.browser.newPage();
  try {
    const b64 = await page.evaluate(async ([data, q]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      return c.toDataURL("image/jpeg", q).split(",")[1];
    }, [Buffer.from(png).toString("base64"), quality]);
    return Buffer.from(b64, "base64");
  } finally {
    await page.close();
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const { values: opt, positionals } = parseArgs({
    allowPositionals: true,
    options: { gpu: { type: "boolean" }, chrome: { type: "string" }, out: { type: "string" } },
  });
  const out = opt.out ?? join(ROOT, "docs/screenshots");
  const wanted = positionals.map((p) => p.replace(/\.jpg$/, ""));
  const unknown = wanted.filter((w) => !SHOTS.some((s) => s.file === `${w}.jpg`));
  if (unknown.length) {
    console.error(`No screenshot called ${unknown.join(", ")}. There are: ${SHOTS.map((s) => s.file.replace(/\.jpg$/, "")).join(", ")}`);
    process.exit(1);
  }
  mkdirSync(out, { recursive: true });
  // the version being released, as Check my setup names it
  const { version } = JSON.parse(readFileSync(join(ROOT, "custom_components/virtuhome/manifest.json"), "utf8"));
  const env = await start({ gpu: opt.gpu, chrome: opt.chrome, version });
  let failed = false;
  try {
    for (const shot of SHOTS.filter((s) => !wanted.length || wanted.includes(s.file.replace(/\.jpg$/, "")))) {
      const t = Date.now();
      try {
        const data = await jpeg(env, await shoot(env, shot));
        const path = join(out, shot.file);
        let before = 0;
        try {
          before = readFileSync(path).length;
        } catch {
          // a new one
        }
        writeFileSync(path, data);
        console.log(`${shot.file.padEnd(22)} ${(data.length / 1024).toFixed(0).padStart(4)} KB (was ${(before / 1024).toFixed(0)} KB)  ${((Date.now() - t) / 1000).toFixed(0)} s`);
      } catch (err) {
        failed = true;
        console.error(`${shot.file}: ${err.message}`);
      }
    }
  } finally {
    await env.close();
  }
  process.exit(failed ? 1 : 0);
}
