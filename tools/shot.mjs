// Screenshots of the dev harness with your local Chrome:
//   node tools/shot.mjs "<query string>" <out.png> [width] [height] [scale]
// e.g. node tools/shot.mjs "theme=night&floor=0" /tmp/a.png 1280 800
// Prints the page's console errors and the frame rate it reached.
import { chromium } from "../frontend/node_modules/playwright-core/index.mjs";

const [query = "", out = "shot.png", w = "1280", h = "800", scale = "1"] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: Number(scale) });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(`http://127.0.0.1:5173/?${query}`);
await page.evaluate(() => new Promise((r) => (window.vh ? r() : window.addEventListener("virtuhome-ready", r, { once: true }))));
await page.waitForTimeout(Number(process.env.WAIT ?? 1800));
const info = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
  return { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "?", fps: window.vh?.viewer.fps };
});
await page.screenshot({ path: out });
console.log(JSON.stringify({ out, ...info, logs }, null, 1));
await browser.close();
