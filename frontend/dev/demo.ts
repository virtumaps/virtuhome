// The online demo: the demo house with pretend states, in any browser. dev/site.mjs builds it into
// site/demo/. Unlike the harness (main.ts) it has no live mode and no way to save: nothing in it
// talks to a Home Assistant, and the site build fails if anything that could ends up in it.
//   ?theme=night  ?walls=smart|low|full  ?floor=<index>  ?quality=low|medium|high|ultra  ?tour  ?lang=<code>
// It speaks the viewer's language (dev/lang): the one picked in its bar before, else the browser's,
// else where they are; VirtuHome's own texts are in it where the app has them (src/i18n).
import { normalizePlan, type Plan } from "../src/model/plan";
import { useLanguage } from "../src/i18n";
import { detect, load, NAMES, type DemoStrings } from "./lang";
import { VhView } from "../src/ui/view";
import type { Quality, WallMode } from "../src/scene/viewer";
import type { WeatherPick } from "../src/live/sky";
import { DEMO_PLAN } from "../src/demo/plan";
import { demoHass } from "../src/demo/hass";

const q = new URLSearchParams(location.search);
const SAVED = "virtuhome-demo-language";

/** The demo house with its rooms, floors and garden named in the language. */
function named(plan: Plan, names: Record<string, string>): Plan {
  const p = structuredClone(plan);
  const as = (name: string) => names[name] ?? name;
  for (const f of p.floors) {
    f.name = as(f.name);
    for (const r of f.rooms) r.name = as(r.name);
    for (const o of f.outdoor ?? []) o.name = as(o.name);
  }
  return p;
}

/** The page in the language, and the menu in the bar that changes it (the page loads again in the new one). */
function page(code: string, S: DemoStrings): void {
  document.documentElement.lang = code === "nb" ? "nb" : S.locale;
  document.title = S.page.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", S.page.description);
  const text = (id: string, value: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  text("demo-note", S.page.demo);
  document.documentElement.dataset.failed = S.page.failed;
  text("tour-label", S.page.takeTour);
  text("get", S.page.getIt);
  const menu = document.getElementById("lang") as HTMLSelectElement | null;
  if (!menu) return;
  menu.setAttribute("aria-label", S.page.language);
  menu.title = S.page.language;
  menu.innerHTML = Object.entries(NAMES).map(([c, name]) => `<option value="${c}" lang="${c}"${c === code ? " selected" : ""}>${name}</option>`).join("");
  text("lang-code", code.toUpperCase());
  menu.addEventListener("change", () => {
    try {
      localStorage.setItem(SAVED, menu.value);
    } catch {
      // private browsing: the link still carries it
    }
    const next = new URLSearchParams(location.search);
    next.set("lang", menu.value);
    location.search = next.toString();
  });
}

async function start(): Promise<void> {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(SAVED);
  } catch {
    // no storage: the browser's language, or where the viewer is
  }
  let zone: string | null = null;
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    // no time zone
  }
  const language = detect({ param: q.get("lang"), saved, languages: navigator.languages?.length ? navigator.languages : [navigator.language], timeZone: zone });
  const strings = await load(language);
  page(language, strings);
  // VirtuHome's own texts, in the languages the app has
  await useLanguage({ language });
  const plan = normalizePlan(named(DEMO_PLAN, strings.house));
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
    language,
    strings,
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

start().catch((err) => {
  // most often a browser without WebGL
  const box = document.getElementById("failed")!;
  box.hidden = false;
  box.textContent = `${document.documentElement.dataset.failed ?? "The demo could not start in this browser."} ${String((err as Error)?.message ?? err)}`;
  window.dispatchEvent(new Event("virtuhome-ready"));
});
