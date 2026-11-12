// The demo home inside Home Assistant (Look at the demo home), fetched only when someone opens it:
// the demo house with pretend devices that change by themselves, in a view of its own over the
// user's. That view never gets Home Assistant, only the pretend states: it can't edit or save, loads
// no extensions and opens no Home Assistant dialogs. The user's own view, plan and states carry on
// underneath, untouched, and show again when the demo closes.
import { normalizePlan, type Plan } from "../model/plan";
import type { Hass } from "../live/hass";
import { DEMO_PLAN } from "../demo/plan";
import { demoHass, type DemoOptions } from "../demo/hass";
import { sunEvents } from "../live/sun";
import type { SkyPick } from "./sky";
import type { ViewConfig } from "./view";
import { t } from "../i18n";

/** What the demo needs of its view (a VhView). */
export interface DemoView {
  hass: Hass | null;
  destroy(): void;
}

/** The demo's view: the graphics and walls of the user's, and nothing that reaches Home Assistant. */
export function demoConfig(from: ViewConfig): ViewConfig {
  return { quality: from.quality, walls: from.walls, stats: from.stats, demo: true, editable: false };
}

/**
 * The demo house in a view, its devices changing by themselves until close(). It stands where the
 * user's home is (only the place is taken), so its sky is the one outside, by day or by night.
 */
export function demoSession<V extends DemoView>(
  makeView: (config: ViewConfig, plan: Plan) => V, from: ViewConfig, place?: DemoOptions["place"], night?: boolean,
): { view: V; close(): void } {
  const plan = normalizePlan(structuredClone(DEMO_PLAN));
  const view = makeView(demoConfig(from), plan);
  let open = true;
  const hass = demoHass(plan, (h) => {
    if (open) view.hass = h;
  }, { lively: true, place, night });
  view.hass = hass;
  return {
    view,
    close() {
      if (!open) return;
      open = false;
      hass.stop();
      view.destroy();
    },
  };
}

const CSS = /* css */ `
:host { position: absolute; inset: 0; z-index: 20; display: block; background: #0c1220; }
.box { position: absolute; top: 0; left: 0; right: 0; bottom: 52px; }
.bar {
  position: absolute; left: 0; right: 0; bottom: 0; height: 52px; box-sizing: border-box; padding: 0 12px;
  display: flex; align-items: center; justify-content: center; gap: 10px; color: #c4cfdf; background: #0c1220;
  font: 14px/1.3 var(--ha-font-family-body, Roboto, system-ui, sans-serif); border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.t { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.t b { color: #eef3fb; font-weight: 600; }
button { flex: none; border: 0; border-radius: 999px; padding: 8px 14px; font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
.start { color: #0c1220; background: #56c7ff; }
.close { color: #eef3fb; background: rgba(255, 255, 255, 0.12); }
button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.s { display: none; }
@media (max-width: 720px) { .more { display: none; } }
@media (max-width: 480px) { .l { display: none; } .s { display: inline; } }
`;

/** Shows the demo over `under` (the user's view), with its banner; `done` hears which button closed it. */
export function openDemo(
  View: new (shadow: ShadowRoot, config: ViewConfig, plan: Plan) => DemoView,
  under: HTMLElement, from: ViewConfig, place: DemoOptions["place"], done: (start: boolean) => void,
): { close(): void } {
  const host = document.createElement("div");
  host.className = "vh-demo";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${CSS}</style><div class="box"></div>
    <div class="bar"><span class="t"><b class="l"></b><b class="s"></b> <span class="more"></span></span><button class="start"></button><button class="close"></button></div>`;
  shadow.querySelector(".l")!.textContent = t("demo.title");
  shadow.querySelector(".s")!.textContent = t("demo.short");
  shadow.querySelector(".more")!.textContent = t("demo.more");
  const start = shadow.querySelector<HTMLButtonElement>(".start")!;
  const close = shadow.querySelector<HTMLButtonElement>(".close")!;
  start.textContent = t("demo.start");
  close.textContent = t("demo.close");
  start.onclick = () => done(true);
  close.onclick = () => done(false);
  under.append(host);
  const box = shadow.querySelector<HTMLDivElement>(".box")!;
  const session = demoSession((config, plan) => new View(box.attachShadow({ mode: "open" }), config, plan), from, place);
  return {
    close() {
      session.close();
      host.remove();
    },
  };
}

/** What the first run's backdrop needs of its view (a VhView): the sky, the roof and the camera. */
export interface BackdropView extends DemoView {
  pickSky(pick: SkyPick | null): void;
  viewer: {
    readonly tier: string;
    readonly flying: boolean;
    camera: { position: { x: number; y: number; z: number }; setViewOffset(fullW: number, fullH: number, x: number, y: number, w: number, h: number): void; clearViewOffset(): void };
    controls: { target: { x: number; y: number; z: number } };
    forceRoof(on: boolean | null): void;
    invalidate(): void;
  };
}

// only the house: no bars, buttons, labels or hints, and nothing to tap
const BARE = /* css */ `
.vh-tools, .vh-bar, .vh-tiles, .vh-stats, .vh-legend, .vh-status, .vh-updated, .vh-toast, .vh-hint, .vh-alert, .vh-overlay, .vh-sheet { display: none !important; }
`;

/** This evening where the home is, the sun down half an hour: dark enough for the lights to glow, with the sky still blue. */
function evening(place: DemoOptions["place"]): number {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  const set = sunEvents(day.getTime(), place?.latitude ?? 51.5072, place?.longitude ?? -0.1276).set;
  // no sunset today (midsummer in the far north): late evening is as dark as it gets
  return set !== null ? set + 30 * 60_000 : day.getTime() + 23 * 3_600_000;
}

/**
 * The demo house as a picture behind the first run's choices: early evening, the roofs off so the lit rooms
 * show, turning slowly. Nothing in it can be tapped. `room` says where the house stands: how far right of
 * the middle, as a share of the width, and how much further off than the view's own fit (the choices take
 * the left of a wide screen, and the house has to fit in what is left). It holds still for people who
 * asked for less motion, on Tablet graphics, and while it is out of sight.
 */
export function openBackdrop(
  View: new (shadow: ShadowRoot, config: ViewConfig, plan: Plan) => BackdropView,
  into: HTMLElement, from: ViewConfig, place: DemoOptions["place"], room: () => { shift: number; away: number },
): { close(): void } {
  const shadow = into.attachShadow({ mode: "open" });
  const session = demoSession((config, plan) => new View(shadow, { ...config, stats: false }, plan), from, place, true);
  const bare = document.createElement("style");
  bare.textContent = BARE;
  shadow.append(bare);
  const v = session.view.viewer;
  session.view.pickSky({ time: evening(place), weather: "clear" });
  v.forceRoof(false);
  const still = v.tier === "low" || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const started = performance.now();
  let last = started;
  let shifted = NaN;
  let away = 1;
  let frame = 0;
  const turn = (now: number) => {
    frame = requestAnimationFrame(turn);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!into.offsetParent) return;
    const want = room();
    if (want.shift !== shifted) {
      shifted = want.shift;
      if (shifted) v.camera.setViewOffset(1, 1, -shifted, 0, 1, 1);
      else v.camera.clearViewOffset();
      v.invalidate();
    }
    // the view flies to the whole house first; then it steps back to fit beside the choices
    if (v.flying) return;
    const cam = v.camera.position;
    const tg = v.controls.target;
    if (want.away !== away) {
      const k = want.away / away;
      away = want.away;
      cam.x = tg.x + (cam.x - tg.x) * k;
      cam.y = tg.y + (cam.y - tg.y) * k;
      cam.z = tg.z + (cam.z - tg.z) * k;
      v.invalidate();
    }
    if (still || now - started < 1500) return;
    const a = dt * 0.05;
    const dx = cam.x - tg.x;
    const dz = cam.z - tg.z;
    cam.x = tg.x + dx * Math.cos(a) - dz * Math.sin(a);
    cam.z = tg.z + dx * Math.sin(a) + dz * Math.cos(a);
    v.invalidate();
  };
  frame = requestAnimationFrame(turn);
  return {
    close() {
      cancelAnimationFrame(frame);
      session.close();
    },
  };
}
