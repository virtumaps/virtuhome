// The demo home inside Home Assistant (Look at the demo home), fetched only when someone opens it:
// the demo house with pretend devices that change by themselves, in a view of its own over the
// user's. That view never gets Home Assistant, only the pretend states: it can't edit or save, loads
// no extensions and opens no Home Assistant dialogs. The user's own view, plan and states carry on
// underneath, untouched, and show again when the demo closes.
import { normalizePlan, type Plan } from "../model/plan";
import type { Hass } from "../live/hass";
import { DEMO_PLAN } from "../demo/plan";
import { demoHass, type DemoOptions } from "../demo/hass";
import type { ViewConfig } from "./view";

export const DEMO_TEXT = {
  title: "This is a demo home.",
  more: "Its devices are pretend: tap them to try. Nothing here is saved.",
  start: "Start my own home",
  close: "Close",
};

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
  makeView: (config: ViewConfig, plan: Plan) => V, from: ViewConfig, place?: DemoOptions["place"],
): { view: V; close(): void } {
  const plan = normalizePlan(structuredClone(DEMO_PLAN));
  const view = makeView(demoConfig(from), plan);
  let open = true;
  const hass = demoHass(plan, (h) => {
    if (open) view.hass = h;
  }, { lively: true, place });
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
@media (max-width: 720px) { .more { display: none; } }
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
    <div class="bar"><span class="t"><b></b> <span class="more"></span></span><button class="start"></button><button class="close"></button></div>`;
  shadow.querySelector("b")!.textContent = DEMO_TEXT.title;
  shadow.querySelector(".more")!.textContent = DEMO_TEXT.more;
  const start = shadow.querySelector<HTMLButtonElement>(".start")!;
  const close = shadow.querySelector<HTMLButtonElement>(".close")!;
  start.textContent = DEMO_TEXT.start;
  close.textContent = DEMO_TEXT.close;
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
