// End-to-end test against a real Home Assistant: starts one with VirtuHome (tests/e2e/ha.py), saves
// the plan fixtures through VirtuHome's WebSocket API and checks in headless Chrome that each one
// draws in the panel, that the editor opens and a save survives a reload, that a dashboard card
// draws, and that the diagnostics download works without names from the plan in it.
//
//   node tests/e2e/run.mjs --python <the Python Home Assistant is installed in> [--port 8131]
//                          [--dir <new folder for the config, logs and screenshots>] [--chrome <path>]
//
// Needs `npm ci` in frontend/ (Playwright and esbuild come from there). Without --chrome it uses
// $CHROME, Google Chrome on a Mac, or Playwright's own Chromium (`npx playwright-core install chromium`).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import esbuild from "../../frontend/node_modules/esbuild/lib/main.js";
import { chromium } from "../../frontend/node_modules/playwright-core/index.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const { values: opt } = parseArgs({
  options: {
    python: { type: "string", default: process.env.HA_PYTHON ?? "python3" },
    port: { type: "string", default: "8131" },
    dir: { type: "string" },
    chrome: { type: "string", default: process.env.CHROME ?? (existsSync(MAC_CHROME) ? MAC_CHROME : undefined) },
  },
});
const dir = opt.dir ?? mkdtempSync(join(tmpdir(), "virtuhome-e2e-"));
const shots = join(dir, "shots");
mkdirSync(shots, { recursive: true });
const DASHBOARD = "virtuhome-e2e";
const started = Date.now();
const manifest = JSON.parse(readFileSync(join(ROOT, "custom_components/virtuhome/manifest.json"), "utf8"));

// the plan fixtures: releases oldest first, then the hand-made ones
const fixtureDir = join(ROOT, "frontend/test/fixtures/plans");
const release = (f) => f.match(/^v(\d+)\.(\d+)\.(\d+)\.json$/)?.slice(1).map(Number);
const fixtures = readdirSync(fixtureDir).filter((f) => f.endsWith(".json")).sort((a, b) => {
  const ra = release(a), rb = release(b);
  if (ra && rb) return ra[0] - rb[0] || ra[1] - rb[1] || ra[2] - rb[2];
  return ra ? -1 : rb ? 1 : a.localeCompare(b);
});
const newest = fixtures.filter(release).at(-1);
const readFixture = (f) => JSON.parse(readFileSync(join(fixtureDir, f), "utf8"));

let ha = null;
let browser = null;
let failed = false;

function check(ok, what) {
  if (!ok) throw new Error(what);
}

async function step(name, fn) {
  const t = Date.now();
  try {
    const note = await fn();
    console.log(`ok - ${name}${note ? `: ${note}` : ""} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
  } catch (err) {
    console.log(`not ok - ${name}: ${err.message}`);
    err.reported = true;
    throw err;
  }
}

async function until(fn, what, timeout = 30_000) {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    last = await fn().catch((err) => ({ error: err.message }));
    if (last && !last.error && last.ok !== false) return last;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${what} (last: ${JSON.stringify(last)})`);
}

// ------------------------------------------------------------------ Home Assistant

/** Starts tests/e2e/ha.py and waits for the file it writes once VirtuHome is set up. */
async function startHomeAssistant() {
  const config = join(dir, "config");
  ha = spawn(opt.python, [join(ROOT, "tests/e2e/ha.py"), config, "--port", opt.port], { stdio: ["ignore", "inherit", "inherit"] });
  const exited = new Promise((r) => ha.once("exit", r));
  const ready = join(config, "e2e.json");
  for (const end = Date.now() + 8 * 60_000; Date.now() < end;) {
    if (existsSync(ready)) return JSON.parse(readFileSync(ready, "utf8"));
    if (ha.exitCode !== null) throw new Error(`tests/e2e/ha.py stopped (exit code ${ha.exitCode})`);
    await Promise.race([exited, new Promise((r) => setTimeout(r, 500))]);
  }
  throw new Error("Home Assistant did not start in time");
}

/** A WebSocket connection to Home Assistant: call() sends a command and resolves with its result. */
async function connect(url, token) {
  const ws = new WebSocket(`${url.replace(/^http/, "ws")}/api/websocket`);
  const pending = new Map();
  let next = 1;
  await new Promise((resolve, reject) => {
    ws.onerror = () => reject(new Error("the WebSocket failed"));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "auth_required") ws.send(JSON.stringify({ type: "auth", access_token: token }));
      else if (msg.type === "auth_ok") resolve();
      else if (msg.type === "auth_invalid") reject(new Error(msg.message));
      else if (msg.type === "result" && pending.has(msg.id)) {
        const { resolve: ok, reject: fail } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.success) ok(msg.result);
        else fail(new Error(`${msg.error?.code}: ${msg.error?.message}`));
      }
    };
  });
  return {
    call: (command) => new Promise((resolve, reject) => {
      const id = next++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ ...command, id }));
    }),
    close: () => ws.close(),
  };
}

// ------------------------------------------------------------------ the page

/** Hides everything but canvases (buttons and labels over the 3D view must not count as drawn). */
function onlyCanvases(on) {
  const roots = [document];
  for (let i = 0; i < roots.length; i++) {
    for (const el of roots[i].querySelectorAll("*")) if (el.shadowRoot) roots.push(el.shadowRoot);
  }
  for (const root of roots) {
    const parent = root === document ? document.head : root;
    if (on) {
      const style = document.createElement("style");
      style.dataset.e2e = "";
      style.textContent = "* { visibility: hidden !important; } canvas { visibility: visible !important; }";
      parent.append(style);
    } else parent.querySelectorAll("style[data-e2e]").forEach((s) => s.remove());
  }
}

/**
 * How much of a screenshot is drawn: the share of pixels outside its two commonest colours (4 bits
 * a channel). An empty view is the sky and a disc of ground; a house is far more.
 */
async function measure(png) {
  const img = new Image();
  img.src = `data:image/png;base64,${png}`;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const counts = new Map();
  let n = 0;
  for (let i = 0; i < d.length; i += 4 * 3, n++) {
    const k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const [a = 0, b = 0] = [...counts.values()].sort((x, y) => y - x);
  return { colours: counts.size, share: Math.round((1 - (a + b) / n) * 1000) / 10 };
}

/** The 3D view's pixels under `selector` (a VirtuHome element): drawn, or blank. */
async function canvasPixels(page, selector) {
  const canvas = page.locator(`${selector} canvas`).first();
  if (!(await canvas.count())) return { error: "no 3D view on the page" };
  await page.evaluate(onlyCanvases, true);
  let png;
  try {
    png = await canvas.screenshot({ timeout: 15_000 });
  } finally {
    await page.evaluate(onlyCanvases, false);
  }
  const stats = await page.evaluate(measure, png.toString("base64"));
  return { ...stats, drawn: stats.share >= 3 };
}

const waitDrawn = (page, selector, drawn = true, timeout = 60_000) =>
  until(async () => {
    const p = await canvasPixels(page, selector);
    return { ...p, ok: p.drawn === drawn };
  }, drawn ? `${selector} drew no house` : `${selector} did not show an empty view`, timeout);

// ------------------------------------------------------------------ plans

/** The frontend's normalizePlan, bundled from the sources. */
async function loadNormalizePlan() {
  const out = await esbuild.build({
    stdin: { contents: 'export { normalizePlan } from "./src/model/plan";', resolveDir: join(ROOT, "frontend"), loader: "ts" },
    bundle: true, format: "esm", platform: "neutral", write: false, logLevel: "error",
  });
  return (await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString("base64")}`)).normalizePlan;
}

/** JSON with sorted keys, to compare plans. */
const canonical = (v) => JSON.stringify(v, (_, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x));

/** Names and entity ids a plan holds: none of them may reach the diagnostics. */
function planStrings(plan) {
  const out = new Set([plan.name]);
  for (const f of plan.floors) {
    out.add(f.name);
    for (const r of f.rooms) out.add(r.name).add(r.temperature).add(r.humidity);
    for (const o of f.outdoor ?? []) out.add(o.name);
    for (const o of f.openings) out.add(o.entity).add(o.cover);
    for (const x of [...f.furniture, ...f.devices]) out.add(x.entity);
    for (const r of f.roofs ?? []) for (const it of r.items ?? []) out.add(it.entity).add(it.cover);
  }
  return [...out].filter((s) => typeof s === "string" && s.length > 1);
}

// ------------------------------------------------------------------ the run

async function run() {
  let info;
  await step("Home Assistant starts, onboarding finishes and VirtuHome is added", async () => {
    info = await startHomeAssistant();
    return `Home Assistant ${info.version}`;
  });
  const { url, access_token: token } = info;
  const ws = await connect(url, token);
  const normalizePlan = await loadNormalizePlan();

  await step("VirtuHome reports its version", async () => {
    const res = await ws.call({ type: "virtuhome/info" });
    check(res.version === manifest.version, `version ${res.version}, manifest ${manifest.version}`);
    return res.version;
  });

  browser = await chromium.launch({
    executablePath: opt.chrome,
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  // signed in as the owner: the frontend takes its tokens from local storage
  const hassTokens = JSON.stringify({
    access_token: token, refresh_token: info.refresh_token, token_type: "Bearer", expires_in: info.expires_in,
    expires: Date.now() + info.expires_in * 1000, hassUrl: url, clientId: info.client_id,
  });
  await context.addInitScript((t) => localStorage.getItem("hassTokens") || localStorage.setItem("hassTokens", t), hassTokens);
  const page = await context.newPage();
  const problems = [];
  // Home Assistant's own frontend has errors of its own: only ours count
  page.on("pageerror", (err) => /virtuhome/i.test(`${err.message} ${err.stack}`) && problems.push(`page error: ${err.message}`));
  page.on("console", (m) => m.type() === "error" && /virtuhome/i.test(`${m.text()} ${m.location().url}`) && problems.push(`console: ${m.text()}`));

  const panel = "virtuhome-panel";
  await step("The panel opens with nothing drawn before there is a plan", async () => {
    await page.goto(`${url}/virtuhome`);
    const p = await waitDrawn(page, panel, false);
    await page.screenshot({ path: join(shots, "empty.png") });
    return `${p.share}% of the view drawn`;
  });

  for (const file of fixtures) {
    await step(`${file} saves and draws in the panel`, async () => {
      const plan = readFixture(file);
      await ws.call({ type: "virtuhome/plan/save", plan });
      const stored = await ws.call({ type: "virtuhome/plan/get" });
      check(stored.plan.floors.length === plan.floors.length, `${stored.plan.floors.length} floors stored of ${plan.floors.length}`);
      // a fresh page each time, so what is drawn can only be this plan
      await page.reload();
      const p = await waitDrawn(page, panel);
      await page.screenshot({ path: join(shots, file.replace(".json", ".png")) });
      return `${p.share}% of the view drawn`;
    });
  }

  let before;
  await step(`The editor opens on ${newest} and saves a change`, async () => {
    await ws.call({ type: "virtuhome/plan/save", plan: readFixture(newest) });
    before = await ws.call({ type: "virtuhome/plan/get" });
    await page.reload();
    await waitDrawn(page, panel);
    await page.locator(`${panel} .vh-edit`).click();
    const save = page.locator(`${panel} .ed-save`);
    await save.waitFor({ state: "visible", timeout: 30_000 });
    await page.locator(`${panel} .ed-chip`, { hasText: "Buff brick" }).first().click();
    await save.click();
    await until(async () => ({ ok: (await page.locator(`${panel} .ed-status`).textContent()) === "Saved" }), "the editor did not say Saved");
    await page.screenshot({ path: join(shots, "editor.png") });
    const after = await ws.call({ type: "virtuhome/plan/get" });
    check(after.revision > before.revision, "the revision did not move on");
    check(after.plan.settings.exterior_finish === "brick_buff", `outside walls are ${after.plan.settings.exterior_finish}`);
    const want = normalizePlan(structuredClone(before.plan));
    want.settings.exterior_finish = "brick_buff";
    check(canonical(normalizePlan(after.plan)) === canonical(want), "the saved plan differs from the one loaded, beyond the change");
    await page.locator(`${panel} .ed-head button[title="Close"]`).click();
    return `revision ${before.revision} → ${after.revision}`;
  });

  await step("After a reload the panel draws the saved plan and the editor shows the change", async () => {
    const saved = await ws.call({ type: "virtuhome/plan/get" });
    await page.reload();
    await waitDrawn(page, panel);
    await page.locator(`${panel} .vh-edit`).click();
    const on = page.locator(`${panel} .ed-chip.on`, { hasText: "Buff brick" });
    await on.waitFor({ state: "visible", timeout: 30_000 });
    await page.locator(`${panel} .ed-head button[title="Close"]`).click();
    const now = await ws.call({ type: "virtuhome/plan/get" });
    check(now.revision === saved.revision && canonical(now.plan) === canonical(saved.plan), "opening the editor changed the stored plan");
  });

  await step("A dashboard card draws the house", async () => {
    await ws.call({ type: "lovelace/dashboards/create", url_path: DASHBOARD, title: "VirtuHome e2e", mode: "storage", show_in_sidebar: true, require_admin: false });
    await ws.call({ type: "lovelace/config/save", url_path: DASHBOARD, config: { views: [{ title: "Home", cards: [{ type: "custom:virtuhome-card", height: 480 }] }] } });
    await page.goto(`${url}/${DASHBOARD}/0`);
    const p = await waitDrawn(page, "virtuhome-card");
    await page.screenshot({ path: join(shots, "card.png") });
    return `${p.share}% of the view drawn`;
  });

  await step("An error report from the frontend is kept, without names", async () => {
    const { plan } = await ws.call({ type: "virtuhome/plan/get" });
    // as an old or odd frontend might send it: with every name and entity of the plan, and an address
    const names = planStrings(plan).join(", ");
    const res = await ws.call({ type: "virtuhome/errors/report", where: "plan", message: `No room for ${names}`.slice(0, 1000),
      stack: `at build (${url}/virtuhome_static/app/app.js?v=${manifest.version}:1:2)`, version: manifest.version, graphics: "Tablet", browser: "Chrome 131 on Linux" });
    check(res.kept, "the report was not kept");
  });

  await step("The diagnostics download works and holds no names from the plan", async () => {
    const res = await fetch(`${url}/api/diagnostics/config_entry/${info.entry_id}`, { headers: { Authorization: `Bearer ${token}` } });
    check(res.ok, `HTTP ${res.status}`);
    const text = await res.text();
    writeFileSync(join(dir, "diagnostics.json"), text);
    const { data } = JSON.parse(text);
    const { plan } = await ws.call({ type: "virtuhome/plan/get" });
    check(data.virtuhome_version === manifest.version && data.loaded && data.panel_registered, "the report does not describe VirtuHome");
    check(data.plan.floors.length === plan.floors.length, "the report has the wrong number of floors");
    check(data.dashboard_resource.mode === "storage" && data.dashboard_resource.current, `card resource: ${JSON.stringify(data.dashboard_resource)}`);
    check(data.errors.some((e) => e.where === "plan" && e.stack === "at build (app.js:1:2)"), `errors: ${JSON.stringify(data.errors)}`);
    const strings = [];
    JSON.parse(text, (key, value) => (strings.push(key), typeof value === "string" && strings.push(value), value));
    const leaked = planStrings(plan).filter((s) => strings.some((x) => x === s || (s.length >= 6 && x.includes(s))));
    check(!leaked.length, `it holds ${leaked.join(", ")}`);
    return `${planStrings(plan).length} names and entities checked`;
  });

  await step("No errors from VirtuHome in the browser", async () => {
    check(!problems.length, problems.join("; "));
  });
  ws.close();
}

try {
  await run();
} catch (err) {
  failed = true;
  if (!err.reported) console.error(err);
  const log = join(dir, "config/home-assistant.log");
  if (existsSync(log)) console.error(`\nThe end of Home Assistant's log:\n${readFileSync(log, "utf8").split("\n").slice(-40).join("\n")}`);
} finally {
  await browser?.close();
  if (ha && ha.exitCode === null) {
    const exited = new Promise((r) => ha.once("exit", r));
    ha.kill("SIGTERM");
    await exited;
  }
}
console.log(`${failed ? "FAILED" : "passed"} in ${Math.round((Date.now() - started) / 1000)} s; screenshots and logs in ${dir}`);
process.exit(failed ? 1 : 0);
