// ?bench on the panel's address: how quickly this device shows the house, how smoothly it turns and
// how soon a tap answers. The numbers show over the house and go into Home Assistant's logbook, so a
// tablet on the wall can be measured without plugging it into anything (issue #11). Then it turns the
// house again with one thing changed at a time (no frosted glass, nothing over the house, half the
// resolution), to tell what holds the device back: drawing the pixels or putting the page together.
//
// Like Copy details, the report is in plain English for whoever reads it, not translated.
import type { Hass } from "../live/hass";
import type { Hit, Viewer } from "../scene/viewer";
import { tierNameEn } from "../scene/tier";

/** What the bench needs from the view. */
export interface BenchHost {
  viewer: Viewer;
  hass(): Hass | null;
  /** The view's own tap handling (opens the room's sheet). */
  tap(hit: Hit): unknown;
  closeSheet(): void;
  showHouse(): void;
  /** The view's root: the passes take the frosted glass away (as Tablet draws it) and hide what is over the house. */
  root: HTMLElement;
  /** When the view was made (performance.now()). */
  madeAt: number;
  version: string;
}

export interface Turn {
  /** Frames drawn per second while turning. */
  fps: number;
  /** Time between frames, median and 95th percentile (ms). */
  p50: number;
  p95: number;
  worst: number;
  /** Time the main thread spent drawing a frame, on average (ms). */
  draw: number;
}

/**
 * Short turns of the house one after another: as it is, then with one thing changed each time (no
 * frosted glass, null on Tablet, which has none; nothing over the house; half the resolution).
 */
export interface Passes {
  base: Turn;
  glass: Turn | null;
  bare: Turn;
  half: Turn;
}

/** What holds a device back, worked out from the passes. */
export type Limit = "fill" | "glass" | "overlay" | "both" | "main" | "screen" | "unclear";

export interface BenchResult {
  device: string;
  graphics: string;
  screen: string;
  /** Since the page started to load, and since VirtuHome's view was made (ms); null when unknown. */
  firstFrame: { page: number | null; view: number | null; app: { ms: number; kb: number } | null };
  /** Frames drawn in 3 s of looking at a still house (should be none, or a few for pulsing markers). */
  idle: number;
  house: Turn;
  floor: Turn | null;
  passes: Passes | null;
  /** Finding what was tapped, and the tap until the next frame showed its answer (ms, medians). */
  taps: { pick: number; answer: number; n: number } | null;
  drawCalls: number;
  triangles: number;
  heapMb: number | null;
}

const frame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const median = (xs: number[]) => quantile(xs, 0.5);

export function quantile(xs: number[], q: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
}

/** The numbers of a stretch of frames: the times between them and how long each took to draw. */
export function turnStats(intervals: number[], drawn: number, seconds: number, drawMs: number[]): Turn {
  return {
    fps: seconds > 0 ? drawn / seconds : 0,
    p50: quantile(intervals, 0.5),
    p95: quantile(intervals, 0.95),
    worst: intervals.length ? Math.max(...intervals) : 0,
    draw: drawMs.length ? drawMs.reduce((a, b) => a + b, 0) / drawMs.length : 0,
  };
}

/** Waits until the house is drawn and the camera has stopped flying (at most `ms`). */
async function settle(v: Viewer, ms = 4000): Promise<void> {
  const end = performance.now() + ms;
  while ((!v.drawn.first || v.flying) && performance.now() < end) await frame();
  await wait(300);
}

/** Turns the camera round its target at `degPerS` for `seconds`, as a finger would, and times the frames. */
async function turn(v: Viewer, seconds: number, degPerS = 45): Promise<Turn> {
  const cam = v.camera;
  const target = v.controls.target;
  const intervals: number[] = [];
  const draws: number[] = [];
  const start = v.drawn.frames;
  let last = await frame();
  const t0 = last;
  let drawnAt = v.drawn.frames;
  while (last - t0 < seconds * 1000) {
    const now = await frame();
    const dt = now - last;
    last = now;
    intervals.push(dt);
    if (v.drawn.frames !== drawnAt) {
      drawnAt = v.drawn.frames;
      draws.push(v.drawn.ms);
    }
    const a = ((degPerS * Math.PI) / 180) * (dt / 1000);
    const x = cam.position.x - target.x;
    const z = cam.position.z - target.z;
    cam.position.x = target.x + x * Math.cos(a) - z * Math.sin(a);
    cam.position.z = target.z + x * Math.sin(a) + z * Math.cos(a);
    v.invalidate();
  }
  return turnStats(intervals, v.drawn.frames - start, (last - t0) / 1000, draws);
}

/** The house turned with something changed for it (`change` returns how to undo it). */
async function turnWith(v: Viewer, change: () => () => void, seconds = 4): Promise<Turn> {
  const undo = change();
  try {
    await settle(v, 1000);
    return await turn(v, seconds);
  } finally {
    undo();
  }
}

/** Labels, buttons and chips hidden for a pass; labels show themselves every frame, hence !important. */
function hideOverlay(root: HTMLElement): () => void {
  const style = document.createElement("style");
  style.textContent = ".vh-root > :not(.vh-canvas):not(.vh-bench), .vh-label { visibility: hidden !important; }";
  root.append(style);
  return () => style.remove();
}

/** Labels and buttons drawn as the Tablet level draws them, without frosted glass (`solid`, styles.ts). */
function solid(root: HTMLElement): () => void {
  root.classList.add("solid");
  return () => root.classList.remove("solid");
}

/** A pass that turned the house at least this much faster shows something holding it back. */
const GAIN = 1.15;

/**
 * What holds the device back. Half the resolution draws a quarter of the pixels: much faster, and
 * it is the fill rate. Without the glass, or without anything over the house, much faster: putting
 * the page together over the house (compositing). Neither: drawing takes most of each frame, or it
 * already keeps up with the screen, or something else (the browser, the graphics driver).
 */
export function limitOf(p: Passes): Limit {
  const base = p.base;
  const gain = (t: Turn | null) => (t && base.fps > 0 ? t.fps / base.fps : 0);
  const fill = gain(p.half);
  const glass = gain(p.glass);
  const over = Math.max(glass, gain(p.bare));
  if (fill < GAIN && over < GAIN) {
    if (base.p50 > 0 && base.draw > base.p50 * 0.6) return "main";
    // a frame every 20 ms or sooner: the most a 60 Hz screen shows
    return base.p50 > 0 && base.p50 <= 20 ? "screen" : "unclear";
  }
  if (fill >= GAIN && over >= GAIN && Math.min(fill, over) > 0.85 * Math.max(fill, over)) return "both";
  if (fill > over) return "fill";
  // the glass alone gives (nearly) all of it
  return glass >= GAIN && glass >= 0.85 * gain(p.bare) ? "glass" : "overlay";
}

/** Taps the middle of up to `n` rooms of the floor shown, the way a finger's tap goes, and times the answer. */
async function taps(host: BenchHost, n = 6): Promise<BenchResult["taps"]> {
  const v = host.viewer;
  const picks: number[] = [];
  const answers: number[] = [];
  for (let ri = 0; ri < v.roomCount(v.activeFloor) && picks.length < n; ri++) {
    await settle(v, 2000);
    const at = v.roomOnScreen(v.activeFloor, ri);
    if (!at) continue;
    const t0 = performance.now();
    const hit = v.pick(at[0], at[1]);
    const t1 = performance.now();
    // only rooms: a tap on a lamp or a socket would switch something in the home
    if (hit.kind !== "room" || hit.entity || (hit.entities?.length ?? 0) > 0) continue;
    const drawn = v.drawn.frames;
    host.tap(hit);
    while (v.drawn.frames === drawn && performance.now() - t1 < 2000) await frame();
    picks.push(t1 - t0);
    answers.push(performance.now() - t0);
    host.closeSheet();
  }
  return picks.length ? { pick: median(picks), answer: median(answers), n: picks.length } : null;
}

function appScript(): { ms: number; kb: number } | null {
  const e = performance.getEntriesByType("resource").find((r) => /\/virtuhome[^?]*\/app\/app\.js/.test(r.name)) as PerformanceResourceTiming | undefined;
  return e ? { ms: e.responseEnd - e.startTime, kb: Math.round((e.transferSize || e.encodedBodySize || 0) / 1024) } : null;
}

function deviceName(): string {
  const ua = navigator.userAgent;
  const model = /Android [\d.]+; ([^;)]+?)(?: Build|\))/.exec(ua)?.[1];
  const chrome = /Chrome\/(\d+)/.exec(ua)?.[1];
  const safari = !chrome && /Version\/([\d.]+).*Safari/.exec(ua)?.[1];
  const os = /Android [\d.]+|iPhone OS [\d_]+|CPU OS [\d_]+|Mac OS X [\d_]+|Windows NT [\d.]+|Linux/.exec(ua)?.[0]?.replace(/_/g, ".") ?? "";
  const app = /Home ?Assistant/i.test(ua) ? " · Companion app" : "";
  const nav = navigator as Navigator & { deviceMemory?: number };
  return [model, os, chrome ? `Chrome ${chrome}` : safari ? `Safari ${safari}` : "", `${navigator.hardwareConcurrency || "?"} cores`,
    nav.deviceMemory ? `${nav.deviceMemory} GB` : ""].filter(Boolean).join(" · ") + app;
}

/** Measures; the view must already be showing the house. */
export async function runBench(host: BenchHost, status: (text: string) => void = () => {}): Promise<BenchResult> {
  const v = host.viewer;
  status("Waiting for the house…");
  await settle(v, 15_000);
  const firstFrame = {
    // a page opened in place (not loaded) has no fair start
    page: v.drawn.first && host.madeAt < 60_000 ? v.drawn.first : null,
    view: v.drawn.first ? v.drawn.first - host.madeAt : null,
    app: appScript(),
  };
  status("Still house…");
  host.showHouse();
  await settle(v);
  const idleFrom = v.drawn.frames;
  await wait(3000);
  const idle = v.drawn.frames - idleFrom;
  status("Turning the house…");
  const house = await turn(v, 8);
  let floor: Turn | null = null;
  if (v.roomCount(0) > 0) {
    status("Turning a floor…");
    v.setMode("floor", 0);
    await settle(v);
    floor = await turn(v, 6);
  }
  status("Tapping rooms…");
  const tapped = await taps(host);
  host.showHouse();
  await settle(v);
  status("Finding what holds it back…");
  // as it is again first: compared right next to each other, the passes share the same view and warmth
  const passes: Passes = {
    base: await turnWith(v, () => () => undefined),
    glass: v.tier !== "low" ? await turnWith(v, () => solid(host.root)) : null,
    bare: await turnWith(v, () => hideOverlay(host.root)),
    half: await turnWith(v, () => (v.setRenderScale(0.5), () => v.setRenderScale(1))),
  };
  await settle(v, 1000);
  const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
  const canvas = v.renderer.domElement;
  return {
    device: deviceName(),
    graphics: tierNameEn(v.tier),
    screen: `${canvas.width}×${canvas.height} px (${Math.round(canvas.clientWidth)}×${Math.round(canvas.clientHeight)} at ×${(window.devicePixelRatio || 1).toFixed(2)})`,
    firstFrame,
    idle,
    house,
    floor,
    passes,
    taps: tapped,
    drawCalls: v.drawn.calls,
    triangles: v.drawn.triangles,
    heapMb: mem ? Math.round(mem.usedJSHeapSize / 1048576) : null,
  };
}

const s1 = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
const ms0 = (ms: number) => `${Math.round(ms)} ms`;
const turnText = (t: Turn) => `${t.fps.toFixed(0)} fps (frames ${ms0(t.p50)}, 95% under ${ms0(t.p95)}, worst ${ms0(t.worst)}; drawing ${t.draw.toFixed(1)} ms)`;

const LIMITS: Record<Limit, string> = {
  fill: "fill rate, the pixels the graphics chip draws (a lower resolution helps most)",
  glass: "compositing, the frosted glass under the labels and buttons",
  overlay: "compositing, the labels and buttons over the house",
  both: "both fill rate and compositing",
  main: "the main thread: drawing takes most of each frame",
  screen: "nothing: it keeps up with the screen",
  unclear: "neither the pixels nor what is over the house (perhaps the browser or the graphics driver)",
};

/** The passes on one line, each with how much faster than the house as it is, and what that says. */
function passLines(p: Passes): string[] {
  const one = (name: string, t: Turn) => {
    const pct = p.base.fps > 0 ? Math.round((t.fps / p.base.fps - 1) * 100) : 0;
    return `${name} ${t.fps.toFixed(0)} fps (${pct >= 0 ? "+" : ""}${pct}%)`;
  };
  const parts = [`as it is ${p.base.fps.toFixed(0)} fps`, p.glass ? one("without glass", p.glass) : "", one("nothing over the house", p.bare), one("half resolution", p.half)];
  return [`Turning again: ${parts.filter(Boolean).join(", ")}`, `Held back by ${LIMITS[limitOf(p)]}`];
}

/** The result as lines of text, the same on the screen and in the logbook. */
export function benchLines(r: BenchResult, version: string): string[] {
  const f = r.firstFrame;
  return [
    `VirtuHome ${version} · ${r.graphics}`,
    r.device,
    r.screen,
    `First frame: ${f.page !== null ? `${s1(f.page)} after the page started` : "page opened in place"}${f.view !== null ? `, ${s1(f.view)} after VirtuHome started` : ""}${f.app ? ` (app ${f.app.kb} KB in ${ms0(f.app.ms)})` : ""}`,
    `Still: ${r.idle} frames in 3 s`,
    `Turning the house: ${turnText(r.house)}`,
    r.floor ? `Turning a floor: ${turnText(r.floor)}` : "",
    ...(r.passes ? passLines(r.passes) : []),
    r.taps ? `Taps: ${r.taps.pick.toFixed(1)} ms to find the room, ${ms0(r.taps.answer)} until it shows (median of ${r.taps.n})` : "Taps: no room to tap",
    `Last frame: ${r.drawCalls} draw calls, ${Math.round(r.triangles / 1000)}k triangles${r.heapMb !== null ? ` · ${r.heapMb} MB of JavaScript` : ""}`,
  ].filter(Boolean);
}

/** Writes the result to Home Assistant's logbook (the bench was asked for in the address). */
export async function logBench(hass: Hass, lines: string[]): Promise<void> {
  await hass.callService("logbook", "log", { name: "VirtuHome", message: `measured ${lines.join(" | ")}` });
}

/** The box the numbers show in, at the bottom of the view; Copy puts them on the clipboard. */
export function benchBox(root: HTMLElement): { status(text: string): void; done(lines: string[]): void } {
  const box = document.createElement("div");
  box.className = "vh-bench";
  const pre = document.createElement("pre");
  pre.textContent = "Measuring: leave the screen alone for about a minute.";
  const copy = document.createElement("button");
  copy.textContent = "Copy";
  copy.hidden = true;
  const close = document.createElement("button");
  close.textContent = "Close";
  close.onclick = () => box.remove();
  const row = document.createElement("div");
  row.append(copy, close);
  box.append(pre, row);
  root.append(box);
  return {
    status: (text) => (pre.textContent = `Measuring: ${text}`),
    done: (lines) => {
      pre.textContent = lines.join("\n");
      copy.hidden = false;
      copy.onclick = () => {
        navigator.clipboard?.writeText(lines.join("\n")).then(() => (copy.textContent = "Copied"), () => undefined);
      };
    },
  };
}
