// The online demo: the demo house with pretend states, in any browser. dev/site.mjs builds it into
// site/demo/. Unlike the harness (main.ts) it has no live mode and no way to save: nothing in it
// talks to a Home Assistant, and the site build fails if anything that could ends up in it.
//   ?theme=night  ?walls=smart|low|full  ?floor=<index>  ?quality=low|medium|high|ultra
import { normalizePlan } from "../src/model/plan";
import { VhView } from "../src/ui/view";
import type { Quality, WallMode } from "../src/scene/viewer";
import { DEMO_PLAN } from "../src/demo/plan";
import { demoHass } from "../src/demo/hass";

const q = new URLSearchParams(location.search);

function start(): void {
  const plan = normalizePlan(DEMO_PLAN);
  const host = document.getElementById("view")!;
  const view = new VhView(host.attachShadow({ mode: "open" }), {
    walls: (q.get("walls") as WallMode) ?? "smart",
    quality: (q.get("quality") as Quality) ?? "auto",
    editable: true,
    demo: true,
  }, plan);
  // it opens in daylight; the day / night button (or ?theme=night) shows the lights at night.
  // Its devices change by themselves, as in the demo home inside Home Assistant.
  view.hass = demoHass(plan, (h) => (view.hass = h), { night: q.get("theme") === "night", lively: true });
  const floor = q.get("floor");
  if (floor !== null) view.showFloor(Number(floor));
  (window as unknown as { vh: VhView }).vh = view;
  window.dispatchEvent(new Event("virtuhome-ready"));
}

try {
  start();
} catch (err) {
  // most often a browser without WebGL
  const box = document.getElementById("failed")!;
  box.hidden = false;
  box.textContent = `The demo could not start in this browser. ${String((err as Error)?.message ?? err)}`;
  window.dispatchEvent(new Event("virtuhome-ready"));
}
