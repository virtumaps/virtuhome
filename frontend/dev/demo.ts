// The online demo: the demo house with pretend states, in any browser. dev/site.mjs builds it into
// site/demo/. Unlike the harness (main.ts) it has no live mode and no way to save: nothing in it
// talks to a Home Assistant, and the site build fails if anything that could ends up in it.
//   ?theme=night  ?walls=smart|low|full  ?floor=<index>  ?quality=low|medium|high|ultra  ?tour
import { normalizePlan } from "../src/model/plan";
import { VhView } from "../src/ui/view";
import type { Quality, WallMode } from "../src/scene/viewer";
import type { WeatherPick } from "../src/live/sky";
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
  const pretend = () => demoHass(plan, (h) => (view.hass = h), { night: q.get("theme") === "night", lively: true });
  let hass = pretend();
  view.hass = hass;
  const floor = q.get("floor");
  if (floor !== null) view.showFloor(Number(floor));
  (window as unknown as { vh: VhView }).vh = view;

  // the tour (dev/tour): Take the tour in the bar, or ?tour to open on its start card. Fetched when asked for.
  const house = {
    view: view.handle(),
    hass: () => hass,
    sky: (time: number | null, weather: WeatherPick | null = null) => view.pickSky(time === null && !weather ? null : { time, weather }),
    lively(on: boolean) {
      hass.stop();
      if (!on) return;
      hass = pretend();
      view.hass = hass;
    },
  };
  const tour = (start: boolean, audio: AudioContext | null = null) => import("./tour/tour").then((m) => m.openTour(house, start, audio));
  document.getElementById("tour")?.addEventListener("click", () => {
    // some browsers only play sound after a tap: start the voice and the music's audio now, while this is one
    if (typeof speechSynthesis !== "undefined") {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      speechSynthesis.speak(u);
    }
    void tour(true, typeof AudioContext !== "undefined" ? new AudioContext() : null);
  });
  if (q.has("tour")) void tour(false);
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
