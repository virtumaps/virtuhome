// The demo home drawn the same way every time, for the guide's screenshots (tools/screenshots.mjs)
// and the visual checks (tests/visual/run.mjs): the dev harness built once and served on a free port,
// a fixed window size and pixel ratio, a fixed clock (so the sun, the sky and day or night don't
// move), a fixed seed for the demo's random values, no hints, and the camera where the view puts it
// exactly (an animated flight is jumped to its end, never left a rounding error short of it).
import { existsSync } from "node:fs";
import { chromium } from "../frontend/node_modules/playwright-core/index.mjs";
import { startDevServer } from "../frontend/dev/server.mjs";

const BUILD = new URL("../custom_components/virtuhome/frontend/", import.meta.url).pathname;

/** Software WebGL: the same pixels on every computer, and what CI has. */
export const SOFTWARE_GL = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-gpu-compositing"];
/** This computer's graphics card: faster, but its pixels differ a little from another's. */
const GPU = process.platform === "darwin" ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : ["--enable-gpu", "--ignore-gpu-blocklist"];

/**
 * Chrome (Playwright's own unless `chrome` names another) and the harness, served on a free port,
 * saying it is `version` ("dev" if not given). `close()` stops both.
 */
export async function start({ gpu = false, chrome = process.env.CHROME, version } = {}) {
  if (chrome && !existsSync(chrome)) throw new Error(`No Chrome at ${chrome}`);
  const server = await startDevServer(BUILD, 0, true, { watch: false, quiet: true, version });
  let browser;
  try {
    browser = await chromium.launch({ executablePath: chrome || undefined, headless: true, args: gpu ? GPU : SOFTWARE_GL });
  } catch (err) {
    await server.close();
    if (/Executable doesn't exist/.test(String(err))) throw new Error("Playwright's Chromium is missing: run `npx playwright-core install chromium` in frontend/ (or pass --chrome <path>).");
    throw err;
  }
  return {
    browser,
    url: `http://127.0.0.1:${server.port}/`,
    async close() {
      await browser.close();
      await server.close();
    },
  };
}

// a small, fast generator (mulberry32) in place of Math.random, and the first-time hints marked seen
function pageSetup({ seed, storage }) {
  let s = seed >>> 0;
  Math.random = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  try {
    for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
  } catch {
    // about:blank has no storage; the harness's page does
  }
}

const HINTS = JSON.stringify(["view.long", "editor.select", "editor.measure"]);

/**
 * Opens the harness at `query` ("theme=night&floor=0&quality=low") and waits until the house is
 * drawn (in the realistic look when the level has it). Time stands at `time` from then on: until then
 * it runs from ten minutes before, so the page loads normally and nothing still pulses as just changed.
 */
export async function open(env, { query = "", width = 1280, height = 800, scale = 1, time, seed = 20261109, storage = {} }) {
  const context = await env.browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    locale: "en-GB",
    timezoneId: "Europe/London",
    colorScheme: "light",
    // no crossfades, no rain or plants moving, no fans turning
    reducedMotion: "reduce",
  });
  await context.addInitScript(pageSetup, { seed, storage: { "virtuhome.hints": HINTS, ...storage } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  const at = typeof time === "number" ? time : Date.parse(time);
  if (!Number.isFinite(at)) throw new Error(`a fixed time is needed, not ${time}`);
  await page.clock.install({ time: at - 600_000 });
  await page.goto(`${env.url}?${query}`);
  await page.evaluate(() => new Promise((r) => (window.vh ? r() : window.addEventListener("virtuhome-ready", r, { once: true }))));
  await page.waitForFunction(() => {
    const v = window.vh?.viewer;
    if (!v) return true; // it failed to start: the problems say why
    const realistic = v.tier === "high" || v.tier === "ultra";
    return v.drawn.frames > 0 && (!realistic || v.realisticLook);
  }, null, { polling: 100, timeout: 300_000 });
  return { page, context, problems, time: at };
}

/** Jumps the camera to the end of its flight, if it is flying. */
export const land = (page) =>
  page.evaluate(() => {
    const v = window.vh.viewer;
    if (v.flight) v.flyTo(v.flight.to[0], v.flight.to[1], false);
  });

/**
 * Stops the clock at the view's fixed time and lets frames run (on that clock) until nothing moves:
 * walls sliding, doors and blinds, a flight (jumped to its end). Fails if the page reported errors.
 */
export async function settle(view) {
  const { page, time, problems } = view;
  await land(page);
  // timers due by then fire once, at that time: the sky follows it
  await page.clock.pauseAt(time);
  for (let k = 0; k < 100; k++) {
    await land(page);
    await page.clock.runFor(100);
    const busy = await page.evaluate(() => {
      const v = window.vh.viewer;
      return v.raf !== 0 || !!v.flight || !!v.pulseTimer || !!v.fxTimer;
    });
    if (!busy && k >= 3) break;
  }
  if (problems.length) throw new Error(problems.join("\n"));
}

/** A picture of the page, or of the part `clip` gives ({ x, y, width, height }), as PNG. */
export const capture = (page, clip) => page.screenshot({ type: "png", clip, animations: "disabled", caret: "hide", timeout: 300_000 });
