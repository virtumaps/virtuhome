// The online demo's tour (dev/demo.ts opens it): a host talks viewers through the demo house, with
// subtitles and music (music.ts), while the house and the 3D view do what she describes and props
// (props.ts) show what the add-ons show beside it (script.ts). Her lines are recordings when
// voice/voices.json lists them (voice/make.py makes them), else the browser's own voice. It ends on how
// to get VirtuHome, and on the add-ons' free trials once the licence server offers them.
import { mdiClose, mdiPause, mdiPlay, mdiReplay, mdiSkipNext, mdiVolumeHigh, mdiVolumeOff } from "@mdi/js";
import type { ReplaySession, ViewHandle } from "../../src/ext/api";
import type { DemoHass } from "../../src/demo/hass";
import type { HassEntity } from "../../src/live/hass";
import type { Plan } from "../../src/model/plan";
import { storyState } from "../../src/demo/history";
import { Face, drawHost } from "./cast";
import { Music } from "./music";
import { Clip, Phone, PROPS_CSS, Tablet, whatIf } from "./props";
import { CHAPTERS, HOST, SAY_AS, type Chip, type Line, type Prop, type Show } from "./script";

/** The demo page's house, as the tour needs it. */
export interface DemoHouse {
  view: ViewHandle;
  hass(): DemoHass;
  /** Shows the sky at a moment (ms), as the sky panel does; null: now. */
  sky(time: number | null): void;
  /** Stops what the house does by itself during the tour, and starts it again after. */
  lively(on: boolean): void;
}

const CATALOG = "https://license.virtumaps.com/v1/catalog";
const INSTALL = "../install.html";
const ADD_ONS = "../extensions-and-virtuhome-pro.html";
const VOICE = "voice/";

const svg = (path: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const sleepMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** About how long a line takes to say, in seconds. */
const est = (text: string) => text.split(/\s+/).length / 2.7 + 0.4;
/** A line as the voice should say it. */
export const spoken = (text: string) => SAY_AS.reduce((t, [word, as]) => t.replace(word, as), text);

/** A recorded line's file name: a hash of what is said (FNV-1a, the same in voice/make.py). */
export function voiceId(text: string): string {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(text)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
}

const CSS = /* css */ `
:host { --j: #5cd0ff; --m: #ff8f8f; --ink: #f4f7ff; --dim: rgba(238,244,255,.74); --line: rgba(255,255,255,.16); --glass: rgba(9,13,24,.74);
  position: fixed; left: 0; top: 0; right: 0; bottom: var(--bar, 36px); z-index: 10; pointer-events: none; color: var(--ink);
  font-family: Roboto, system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
.stage { position: absolute; inset: 0; overflow: hidden; }
/* dark at the top and bottom, so white text reads over a bright daytime sky too */
.shade { position: absolute; inset: 0; opacity: 0; transition: opacity .8s;
  background: linear-gradient(180deg, rgba(5,8,16,.62), rgba(5,8,16,.18) 20%, rgba(5,8,16,0) 34%, rgba(5,8,16,0) 58%, rgba(5,8,16,.5) 80%, rgba(5,8,16,.82)); }
.on .shade { opacity: 1; }
.glass { background: var(--glass); -webkit-backdrop-filter: blur(16px) saturate(1.3); backdrop-filter: blur(16px) saturate(1.3); border: 1px solid var(--line);
  box-shadow: 0 .8vh 3vh rgba(0,0,0,.25); }
button, a.btn { pointer-events: auto; font: inherit; cursor: pointer; }
.char { position: absolute; right: 1vw; bottom: 0; width: calc(var(--u) * 34); height: calc(var(--u) * 34); transition: transform .6s cubic-bezier(.2,.9,.3,1.25), opacity .6s; transform-origin: 50% 85%; }
.char canvas { width: 100%; height: 100%; display: block; }
.char.talking { transform: scale(1.07); }
.tag { position: absolute; bottom: 4%; left: 50%; transform: translateX(-50%); font-size: max(10px, calc(var(--u) * 1.4)); letter-spacing: .3em; padding-left: .3em;
  text-transform: uppercase; font-weight: 700; opacity: .8; transition: opacity .3s; color: var(--m); text-shadow: 0 1px 6px rgba(0,0,0,.8); }
.talking .tag { opacity: 1; }
.stage:not(.on) .char { transform: translateY(110%); opacity: 0; }
.subs { position: absolute; left: 50%; bottom: calc(var(--u) * 4); width: min(56vw, calc(var(--u) * 110)); transform: translate(-50%, 12px); text-align: center;
  border-radius: calc(var(--u) * 2.4); padding: calc(var(--u) * 1.8) calc(var(--u) * 3) calc(var(--u) * 2.2); box-sizing: border-box; opacity: 0;
  transition: opacity .3s, transform .4s cubic-bezier(.2,.9,.3,1); }
.subs.show { opacity: 1; transform: translate(-50%, 0); }
.who { font-size: max(10px, calc(var(--u) * 1.4)); letter-spacing: .3em; text-transform: uppercase; font-weight: 700; margin-bottom: .6em; color: var(--m); }
.say { margin: 0; font-size: max(15px, calc(var(--u) * 3.1)); line-height: 1.38; font-weight: 500; }
.say span { opacity: .42; transition: opacity .18s; } .say span.said { opacity: 1; }
.chapter { position: absolute; top: calc(var(--u) * 3); left: 3vw; max-width: 44vw; padding: calc(var(--u) * 1.4) calc(var(--u) * 2.2); border-radius: calc(var(--u) * 2);
  opacity: 0; transform: translateY(-8px); transition: opacity .6s, transform .6s; }
.chapter.show { opacity: 1; transform: none; }
.num { font-size: max(10px, calc(var(--u) * 1.35)); letter-spacing: .3em; color: var(--j); font-weight: 700; }
.title { font-size: max(19px, calc(var(--u) * 3.8)); font-weight: 400; margin-top: .1em; }
.kicker { font-size: max(12px, calc(var(--u) * 1.8)); color: var(--dim); margin-top: .15em; }
.badge { display: inline-block; margin-top: .6em; font-size: max(11px, calc(var(--u) * 1.5)); font-weight: 700; letter-spacing: .06em; padding: .45em .9em; border-radius: 999px;
  color: #071022; background: linear-gradient(120deg, #6fd8ff, #b59bff 55%, #ff9fb0); }
.badge:empty { display: none; }
.big { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; opacity: 0; }
/* a dark halo behind the big title, for daylight */
.big::before { content: ""; position: absolute; left: 50%; top: 50%; width: 80vw; height: 40vh; transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, rgba(5,8,16,.62), rgba(5,8,16,0)); }
.big .t { position: relative; font-size: max(30px, calc(var(--u) * 9)); font-weight: 300; letter-spacing: -.02em;
  background: linear-gradient(100deg, #fff 30%, #d6f2ff 60%, #ffd6d6); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 2px 14px rgba(0,0,0,.45)); }
.big .k { position: relative; font-size: max(13px, calc(var(--u) * 2.2)); letter-spacing: .3em; text-transform: uppercase; color: var(--ink); margin-top: .6em;
  text-shadow: 0 1px 8px rgba(0,0,0,.7); }
.big .k:empty { display: none; }
.big.show { animation: big 2.4s cubic-bezier(.2,.8,.2,1) both; }
.big.hero.show { animation-duration: 4.2s; }
@keyframes big { 0% { opacity: 0; transform: scale(.94); } 18% { opacity: 1; transform: none; } 75% { opacity: 1; } 100% { opacity: 0; transform: scale(1.03); } }
.controls { position: absolute; top: calc(var(--u) * 3); right: 3vw; display: flex; gap: 6px; padding: 5px; border-radius: 999px; opacity: 0; transition: opacity .5s; }
.on .controls { opacity: 1; }
.controls button { width: max(34px, calc(var(--u) * 4.6)); height: max(34px, calc(var(--u) * 4.6)); border-radius: 50%; border: 0; background: transparent; color: var(--ink);
  display: grid; place-items: center; padding: 0; }
.controls button:hover, .controls button:focus-visible { background: rgba(255,255,255,.14); outline: none; }
svg { width: 55%; height: 55%; fill: currentColor; }
.chips { position: absolute; right: 3vw; top: calc(var(--u) * 11.5); display: flex; flex-direction: column; gap: calc(var(--u) * 1.1); width: min(24vw, calc(var(--u) * 46)); }
.chip { display: flex; align-items: center; gap: calc(var(--u) * 1.5); padding: calc(var(--u) * 1.2) calc(var(--u) * 1.8); border-radius: calc(var(--u) * 2);
  opacity: 0; transform: translateX(24px); transition: opacity .5s, transform .6s cubic-bezier(.2,.9,.3,1); }
.chip.show { opacity: 1; transform: none; }
.chip svg { width: calc(var(--u) * 2.8); height: calc(var(--u) * 2.8); min-width: 18px; min-height: 18px; fill: var(--j); flex: none; padding: calc(var(--u) * 1);
  background: rgba(92,208,255,.16); border-radius: calc(var(--u) * 1.4); }
.chip .l { font-size: max(10px, calc(var(--u) * 1.35)); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); font-weight: 600; }
.chip .v { font-size: max(14px, calc(var(--u) * 2.6)); font-weight: 600; margin-top: .15em; }
.clock { position: absolute; left: 50%; top: calc(var(--u) * 3); transform: translateX(-50%); padding: .55em 1.1em; border-radius: 999px; font-size: max(13px, calc(var(--u) * 2.2));
  font-weight: 600; font-variant-numeric: tabular-nums; display: none; min-width: 11em; text-align: center; }
.clock.show { display: block; }
.clock i { display: block; height: 3px; margin-top: .45em; border-radius: 2px; background: rgba(255,255,255,.2); position: relative; overflow: hidden; }
.clock b { position: absolute; left: 0; top: 0; bottom: 0; background: linear-gradient(90deg, var(--j), var(--m)); }
.card { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); width: min(92vw, 660px); box-sizing: border-box; padding: 30px 30px 26px; border-radius: 22px;
  text-align: center; pointer-events: auto; display: none; }
.card.show { display: block; animation: rise .6s cubic-bezier(.2,.9,.3,1) both; }
@keyframes rise { from { opacity: 0; transform: translate(-50%, -46%); } }
.card h2 { margin: 0 0 8px; font-size: 32px; font-weight: 300; letter-spacing: -.01em; }
.card h2 b { font-weight: 600; background: linear-gradient(100deg, var(--j), #b59bff 55%, var(--m)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.card p { margin: 0 0 18px; color: var(--dim); font-size: 16px; line-height: 1.5; }
.card ul { list-style: none; margin: 0 0 20px; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: left; font-size: 14.5px; }
.card li { padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,.07); }
.card li b { display: block; color: var(--j); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 2px; }
.row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.btn { border: 0; border-radius: 999px; padding: 11px 18px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-flex; gap: 8px; align-items: center;
  color: var(--ink); background: rgba(255,255,255,.1); border: 1px solid var(--line); }
.btn svg { width: 18px; height: 18px; }
.btn.go { color: #071022; background: linear-gradient(120deg, #6fd8ff, #a08cff); border-color: transparent; }
.btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.narrow .char { width: 25vw; height: 25vw; }
.narrow .subs { width: auto; left: 3vw; right: 3vw; transform: translateY(12px); bottom: calc(25vw - 6px); }
.narrow .subs.show { transform: none; }
.narrow .chips, .narrow .kicker { display: none; }
.narrow .chapter { max-width: 58vw; }
.narrow .card ul { grid-template-columns: 1fr; }
@media (prefers-reduced-motion: reduce) { .big.show { animation-duration: .01s; } .char, .chip, .subs { transition: none; } }
${PROPS_CSS}
`;

// ------------------------------------------------------------------ the browser's own voice

// When there are no recordings: the most natural-sounding women's voices first (the "Online (Natural)",
// "Premium" and "Enhanced" ones are neural), then the usual ones
const PREFER = [
  "Sonia Online", "Libby Online", "Jenny Online", "Aria Online", "Maisie Online", "Natasha Online",
  "Serena (Premium)", "Kate (Premium)", "Stephanie (Premium)", "Serena (Enhanced)", "Kate (Enhanced)", "Martha (Enhanced)", "Samantha (Enhanced)",
  "Google UK English Female", "Google US English", "Samantha", "Serena", "Kate", "Martha", "Karen",
];

class Speech {
  private chosen: SpeechSynthesisVoice | null = null;
  readonly ok = typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";
  private current: SpeechSynthesisUtterance | null = null;

  /** Called from the click that starts the tour: some browsers only speak after one. */
  unlock(): void {
    if (!this.ok) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    speechSynthesis.speak(u);
  }

  /** The browser lists its voices a moment after the page loads. */
  async load(): Promise<void> {
    if (!this.ok || speechSynthesis.getVoices().length) return this.choose();
    await new Promise<void>((done) => {
      speechSynthesis.addEventListener("voiceschanged", () => done(), { once: true });
      setTimeout(done, 1500);
    });
    this.choose();
  }

  private choose(): void {
    if (!this.ok) return;
    const all = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
    const named = (name: string) => all.find((x) => x.name.toLowerCase().includes(name.toLowerCase()));
    this.chosen = PREFER.map(named).find(Boolean) ?? all.find((x) => /GB/i.test(x.lang)) ?? all[0] ?? null;
  }

  /** Says a line; `word` hears where each word starts. Resolves when it ends or is cancelled. */
  say(text: string, word: (at: number) => void): Promise<void> {
    if (!this.ok) return sleepMs(est(text) * 1000);
    return new Promise((done) => {
      const u = new SpeechSynthesisUtterance(text);
      if (this.chosen) u.voice = this.chosen;
      u.lang = this.chosen?.lang ?? "en-GB";
      // her own pitch and pace: shifting them is what makes these voices sound robotic
      u.rate = 1;
      u.pitch = 1;
      // some browsers never say they finished: give up well after it should have
      const t = setTimeout(finish, (est(text) * 2 + 4) * 1000);
      function finish() {
        clearTimeout(t);
        done();
      }
      u.onboundary = (e) => {
        if (e.name === "word" || e.name === undefined) word(e.charIndex);
      };
      u.onend = finish;
      u.onerror = finish;
      this.current = u;
      speechSynthesis.speak(u);
    });
  }

  pause(on: boolean): void {
    if (!this.ok) return;
    if (on) speechSynthesis.pause();
    else speechSynthesis.resume();
  }

  stop(): void {
    if (this.current) this.current.onend = null;
    this.current = null;
    if (this.ok) speechSynthesis.cancel();
  }
}

// ------------------------------------------------------------------ the tour

const timeOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Opens the tour over the demo; `start` plays it at once (the opening click lets it speak), with
 * `audio` made in that click for the music.
 */
export function openTour(house: DemoHouse, start: boolean, audio: AudioContext | null = null): void {
  if (document.getElementById("vh-tour")) return;
  const host = document.createElement("div");
  host.id = "vh-tour";
  document.body.append(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${CSS}</style>
    <div class="stage">
      <div class="shade"></div>
      <div class="props"></div>
      <div class="chapter glass"><div class="num"></div><div class="title"></div><div class="kicker"></div><div class="badge"></div></div>
      <div class="big"><div class="t"></div><div class="k"></div></div>
      <div class="clock glass"><span></span><i><b></b></i></div>
      <div class="chips"></div>
      <div class="char"><canvas></canvas><span class="tag">${esc(HOST)}</span></div>
      <div class="subs glass" aria-live="polite"><div class="who"></div><p class="say"></p></div>
      <div class="controls glass">
        <button class="mute" aria-label="Sound off">${svg(mdiVolumeHigh)}</button>
        <button class="pause" aria-label="Pause">${svg(mdiPause)}</button>
        <button class="skip" aria-label="Next line">${svg(mdiSkipNext)}</button>
        <button class="close" aria-label="Close the tour">${svg(mdiClose)}</button>
      </div>
      <div class="card glass intro">
        <h2>Take the <b>2-minute tour</b></h2>
        <p>${esc(HOST)} shows you round the demo house, and everything the add-ons can do. Turn your sound on.</p>
        <div class="row"><button class="btn go start">${svg(mdiPlay)} Start the tour</button><button class="btn skipit">No thanks</button></div>
      </div>
      <div class="card glass outro"></div>
    </div>`;
  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as unknown as T;
  const stage = $(".stage");
  const face = new Face();
  const canvas: HTMLCanvasElement = $(".char canvas");
  const speech = new Speech();
  const music = new Music();
  const view = house.view;
  let talking = false;
  let kick = 0;
  let lastWord = 0;
  let paused = false;
  let stopped = false;
  let skipChapter = false;
  let muted = false;
  let holdOrbit = 0;
  let raf = 0;
  let wakers: (() => void)[] = [];
  let timers: number[] = [];
  let words: HTMLElement[] = [];
  let starts: number[] = [];
  let lineStart = 0;
  let lineSecs = 1;
  let trials = false;
  /** Recorded lines (voice/voices.json: id → seconds), when there are any. */
  let recorded: Record<string, number> | null = null;
  const fetched = new Map<string, HTMLAudioElement>();
  let playing: HTMLAudioElement | null = null;
  let meter: AnalyserNode | null = null;
  const level = new Float32Array(1024);

  // ---------------------------------------------------------------- the 3D view

  const cinema = document.createElement("style");
  cinema.textContent = ".vh-tools, .vh-bar, .vh-tiles, .vh-stats, .vh-legend, .vh-status, .vh-updated { display: none !important; }";

  let session: ReplaySession | null = null;
  let clock = 0;
  let clockFrom = 0;
  let clockTo = 0;
  let clockAt = 0;
  let clockFor = 1;
  let clockDrawn = 0;
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  // yesterday, so the whole day has happened
  const midnight = day.getTime() - 864e5;
  const DAY_FROM = timeOf("07:00");
  const DAY_TO = timeOf("19:00");
  let restyled = false;

  /** The house at a minute of yesterday, from the pretend day's story. */
  const drawPast = (minute: number) => {
    if (!session?.active) return;
    const t = midnight + minute * 60_000;
    const early = new Date(midnight).toISOString();
    const states: Record<string, HassEntity> = {};
    // what changed after this moment hadn't happened yet: nothing pulses as if it just did
    for (const [id, st] of Object.entries(house.hass().states)) states[id] = Date.parse(st.last_changed) > t ? { ...st, last_changed: early, last_updated: early } : st;
    for (const id of view.watchedEntities()) {
      const st = storyState(id, t);
      if (!st) continue;
      const since = st.t !== undefined ? new Date(st.t).toISOString() : early;
      states[id] = { entity_id: id, state: st.s, attributes: { ...(states[id]?.attributes ?? {}), ...(st.a ?? {}) }, last_changed: since, last_updated: since };
    }
    session.show(states, t);
    const hh = String(Math.floor(minute / 60)).padStart(2, "0");
    const mm = String(Math.floor(minute % 60)).padStart(2, "0");
    $(".clock span").textContent = `Yesterday, ${hh}:${mm}`;
    $(".clock b").style.width = `${Math.max(0, Math.min(100, ((minute - DAY_FROM) / (DAY_TO - DAY_FROM)) * 100))}%`;
  };

  // ---------------------------------------------------------------- props

  const propsBox = $(".props");
  const clip = new Clip("parcel", "10:12");
  const clipBox = document.createElement("div");
  clipBox.className = "prop clipbox";
  clipBox.innerHTML = `<div class="cap"></div>`;
  const phone = new Phone();
  phone.el.classList.add("prop");
  const tablet = new Tablet(clip);
  tablet.el.classList.add("prop");
  const plan = whatIf();
  plan.classList.add("prop");
  propsBox.append(clipBox, phone.el, tablet.el, plan);
  let shownProps: Prop[] = [];

  const setProps = (list: Prop[]) => {
    const has = (k: Prop["kind"]) => list.find((p) => p.kind === k);
    const had = (k: Prop["kind"]) => shownProps.some((p) => p.kind === k);
    const c = has("clip");
    if (c && c.kind === "clip" && !had("clip")) {
      clip.restart(c.clip, c.time);
      clipBox.prepend(clip.canvas);
      clipBox.querySelector(".cap")!.textContent = c.caption;
    }
    const t = has("tablet");
    if (t && t.kind === "tablet" && !had("tablet")) {
      clip.restart("ring", t.time);
      tablet.el.querySelector(".feed")!.append(clip.canvas);
    }
    const a = has("alert");
    if (a && a.kind === "alert" && !had("alert")) phone.alert(a.title, a.body, clip.canvas);
    if (has("scan") && !had("scan")) phone.scan();
    clipBox.classList.toggle("show", !!c);
    tablet.el.classList.toggle("show", !!t);
    phone.el.classList.toggle("show", !!a || !!has("scan"));
    plan.classList.toggle("show", !!has("whatif"));
    shownProps = list;
  };

  const show: Show = {
    view,
    get hass() {
      return house.hass();
    },
    get trials() {
      return trials;
    },
    call(domain, service, entity, data = {}) {
      void house.hass().callService(domain, service, data, { entity_id: entity });
    },
    quiet(id, state, attributes = {}) {
      house.hass().set(id, state, attributes, new Date(Date.now() - 5 * 60_000).toISOString());
    },
    house(roof = null) {
      view.closeSheet();
      view.showRoofs(roof);
      view.showHouse();
      holdOrbit = performance.now() + 2500;
    },
    floor(index) {
      view.closeSheet();
      view.showFloor(index);
      holdOrbit = performance.now() + 2500;
    },
    fly(entity) {
      const p = view.locate(entity);
      if (p) view.selectRoom(p.floor, p.room, true);
      holdOrbit = performance.now() + 2500;
    },
    replay(at) {
      session = view.replay({ onEnd: () => $(".clock").classList.remove("show") });
      clock = clockFrom = clockTo = timeOf(at);
      $(".clock").classList.add("show");
      drawPast(clock);
    },
    endReplay() {
      session?.end();
      session = null;
      $(".clock").classList.remove("show");
    },
    sky(when) {
      // today at half past eight in the evening, or at one, whatever the time is where the viewer is
      const at = new Date();
      at.setHours(when === "night" ? 20 : 13, when === "night" ? 30 : 0, 0, 0);
      house.sky(when === "now" ? null : at.getTime());
    },
    weather(state) {
      house.hass().set("weather.forecast_home", state, { temperature: /snow/.test(state) ? -1 : 12, cloud_coverage: /snow|rain/.test(state) ? 100 : 45 });
    },
    later(ms, fn) {
      timers.push(window.setTimeout(() => {
        if (!stopped) fn();
      }, ms));
    },
    restyle(fn) {
      const base = view.plan;
      if (!base) return;
      if (!fn) {
        if (restyled) view.viewer.setPlan(base, true);
        restyled = false;
        return;
      }
      const copy = JSON.parse(JSON.stringify(base)) as Plan;
      fn(copy);
      view.viewer.setPlan(copy, true);
      restyled = true;
    },
    explode(on) {
      view.viewer.setExplode(on);
      holdOrbit = performance.now() + 2500;
    },
    props: setProps,
  };

  /** Takes every preview off the house, and gives the view back. */
  const tidy = () => {
    show.endReplay();
    house.sky(null);
    setProps([]);
    show.restyle(null);
    view.viewer.setExplode(false);
    view.setRoomTint(null);
    view.setRoomText(null);
    view.refreshRooms();
    view.markItems(null);
    view.refreshItems();
    view.paintRoofs(null);
    view.showRoofs(null);
    view.closeSheet();
  };

  // ---------------------------------------------------------------- every frame

  const size = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    host.style.setProperty("--u", `${Math.min(h, (w * 9) / 16) / 100}px`);
    stage.classList.toggle("narrow", w < 700);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
  };
  const resize = new ResizeObserver(size);
  resize.observe(host);

  let last = 0;
  let propFrame = 0;
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const t = now / 1000;
    const dt = last ? Math.min(0.05, t - last) : 0.016;
    last = t;
    // her mouth: the recording's loudness when there is one, else a kick on every word the voice reaches
    kick = Math.max(0, kick - dt * 5);
    let mouth = now - lastWord > 700 ? 0.3 + 0.4 * Math.abs(Math.sin(t * 9.5)) : 0.3 + 0.55 * kick;
    if (playing && meter) {
      meter.getFloatTimeDomainData(level);
      let sum = 0;
      for (const v of level) sum += v * v;
      mouth = Math.min(1, Math.max(0, (Math.sqrt(sum / level.length) - 0.01) * 6));
    }
    if (talking && !paused) {
      if (playing) markSaid(playing.currentTime / (playing.duration || lineSecs));
      // by time until the voice says where it is (some never do)
      else if (muted || !speech.ok || !lastWord) markSaid((now - lineStart) / 1000 / lineSecs);
    }
    face.talking = talking && !paused;
    face.target = face.talking ? mouth : 0;
    // talking, mostly at the viewer; between lines it looks about, now and then over at the house
    if (face.talking) face.gazeTo = Math.sin(t * 0.7) * 0.15;
    else if (t > face.nextGlance) {
      face.gazeTo = [0, 0, 0.35, -0.35, -0.8][Math.floor(Math.random() * 5)];
      face.nextGlance = t + 1.6 + Math.random() * 3.4;
    }
    face.update(dt);
    const c = canvas.getContext("2d");
    if (c && canvas.width) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawHost(c, face, canvas.width / dpr, canvas.height / dpr, t, dt);
    }
    // the props, at a film's 24 frames a second
    if (shownProps.length && now - propFrame > 41) {
      propFrame = now;
      if (shownProps.some((p) => p.kind === "clip" || p.kind === "tablet")) clip.draw(now);
      if (shownProps.some((p) => p.kind === "alert" || p.kind === "scan")) phone.draw(now);
    }
    // the replay's clock moves through the day as the line goes
    if (session?.active && clock !== clockTo && !paused) {
      const k = Math.min(1, (now - clockAt) / clockFor);
      clock = clockFrom + (clockTo - clockFrom) * (1 - (1 - k) ** 2);
      if (now - clockDrawn > 90 || k === 1) {
        clockDrawn = now;
        drawPast(k === 1 ? (clock = clockTo) : clock);
      }
    }
    // the house turns slowly, except just after a flight
    if (stage.classList.contains("on") && !paused && now > holdOrbit) {
      const cam = view.viewer.camera.position;
      const tg = view.viewer.controls.target;
      const a = dt * 0.05;
      const dx = cam.x - tg.x;
      const dz = cam.z - tg.z;
      cam.x = tg.x + dx * Math.cos(a) - dz * Math.sin(a);
      cam.z = tg.z + dx * Math.sin(a) + dz * Math.cos(a);
      view.viewer.invalidate();
    }
  };

  // ---------------------------------------------------------------- lines

  const subtitle = (text: string | null) => {
    const subs = $(".subs");
    if (text === null) {
      subs.classList.remove("show");
      return;
    }
    subs.classList.add("show");
    $(".who").textContent = HOST;
    const list = text.split(" ");
    let at = 0;
    starts = list.map((w) => ((at += w.length + 1), at - w.length - 1));
    $(".say").innerHTML = list.map((w) => `<span>${esc(w)}</span>`).join(" ");
    words = Array.from($(".say").querySelectorAll("span"));
  };
  /** Lights the words said so far: up to a character, or a share of the line. */
  const markSaid = (share: number) => words.forEach((w, i) => w.classList.toggle("said", i < Math.ceil(share * words.length + 0.3)));
  const markTo = (char: number) => words.forEach((w, i) => w.classList.toggle("said", starts[i] <= char));

  const sleep = async (ms: number) => {
    await new Promise<void>((done) => {
      const wake = () => {
        clearTimeout(t);
        wakers = wakers.filter((w) => w !== wake);
        done();
      };
      const t = setTimeout(wake, ms);
      wakers.push(wake);
    });
    while (paused && !stopped) await sleepMs(150);
  };
  const interrupt = () => {
    speech.stop();
    for (const w of wakers.slice()) w();
  };

  /** Fetches a recorded line ahead of time. */
  const fetchLine = (text: string) => {
    const id = voiceId(spoken(text));
    if (!recorded?.[id] || fetched.has(id)) return;
    const a = new Audio();
    a.preload = "auto";
    a.src = `${VOICE}${id}.mp3`;
    fetched.set(id, a);
  };

  /** Plays a recorded line; resolves when it ends, fails, is skipped or the tour stops. */
  const playLine = (id: string) => new Promise<void>((done) => {
    const a = fetched.get(id) ?? Object.assign(new Audio(`${VOICE}${id}.mp3`), { preload: "auto" });
    fetched.delete(id);
    playing = a;
    meter = music.voice(a);
    const finish = () => {
      a.onended = a.onerror = null;
      a.pause();
      wakers = wakers.filter((w) => w !== finish);
      if (playing === a) playing = meter = null;
      done();
    };
    a.onended = finish;
    a.onerror = finish;
    wakers.push(finish);
    a.play().catch(() => void sleepMs(lineSecs * 1000).then(finish));
  });

  const say = async (line: Line, ahead: Line[]) => {
    const text = line.say;
    const voice = spoken(text);
    const id = voiceId(voice);
    for (const next of ahead) fetchLine(next.say);
    face.mood = line.mood ?? "neutral";
    line.do?.(show);
    if (line.pause) await sleep(line.pause);
    if (stopped) return;
    subtitle(text);
    talking = true;
    lastWord = 0;
    lineStart = performance.now();
    lineSecs = recorded?.[id] ?? est(text);
    $(".char").classList.add("talking");
    music.duck(true);
    if (line.replay && session?.active) {
      clockFrom = clock;
      clockTo = timeOf(line.replay);
      clockAt = performance.now();
      clockFor = lineSecs * 1000 * 0.9;
    }
    const word = (char: number) => {
      lastWord = performance.now();
      kick = 1;
      // where the voice is in what it says, as a place in what the subtitle shows
      markTo((char * text.length) / voice.length);
    };
    if (muted) await sleep(lineSecs * 1000);
    else if (recorded?.[id]) await playLine(id);
    else if (!speech.ok) await sleep(lineSecs * 1000);
    else {
      let wake = () => undefined as void;
      await Promise.race([speech.say(voice, word), new Promise<void>((done) => wakers.push((wake = done)))]);
      wakers = wakers.filter((w) => w !== wake);
    }
    while (paused && !stopped) await sleepMs(150);
    markSaid(1);
    talking = false;
    $(".char").classList.remove("talking");
    music.duck(false);
    if (stopped) return;
    line.after?.(show);
    setTimeout(() => {
      if (!talking) subtitle(null);
    }, 900);
    await sleep(line.gap ?? 250);
    face.mood = "neutral";
  };

  const chips = (list: Chip[] | undefined) => {
    const box = $(".chips");
    box.innerHTML = (list ?? []).map((c) => `<div class="chip glass">${svg(c.icon)}<div><div class="l">${esc(c.label)}</div><div class="v"></div></div></div>`).join("");
    const values = () => (list ?? []).forEach((c, i) => {
      box.children[i].querySelector(".v")!.textContent = typeof c.value === "string" ? c.value : c.value(house.hass());
    });
    values();
    Array.from(box.children).forEach((el, i) => setTimeout(() => el.classList.add("show"), 150 * i));
    return values;
  };

  const chapterCard = (i: number, total: number, title: string, kicker: string, addOn = "") => {
    const card = $(".chapter");
    card.classList.remove("show");
    const hero = i === 0;
    // the opening is the title card itself: the small card waits until it has gone
    setTimeout(() => {
      $(".num").textContent = `${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
      $(".title").textContent = title;
      $(".kicker").textContent = kicker;
      $(".badge").textContent = addOn;
      card.classList.add("show");
    }, hero ? 4000 : 1700);
    const big = $(".big");
    $(".big .t").textContent = title;
    $(".big .k").textContent = hero ? kicker : addOn;
    big.classList.toggle("hero", hero);
    big.classList.remove("show");
    void big.offsetWidth;
    big.classList.add("show");
  };

  // ---------------------------------------------------------------- start, end

  const ending = () => {
    music.finish();
    const card = $(".outro");
    card.innerHTML = `<h2>Your home, <b>like this</b>.</h2>
      <p>VirtuHome is free in the Home Assistant Community Store. ${trials
        ? "Every add-on has a free 14-day trial: no card, no account."
        : "The add-ons are coming soon."}</p>
      <ul>
        <li><b>Security</b>Your day played back, with the camera clips</li>
        <li><b>Energy</b>Every room's power, and solar on your roof</li>
        <li><b>Household</b>Appliances, bins, damp and mould</li>
        <li><b>Wall Tablet</b>The 3D home on a screen by the door</li>
      </ul>
      <div class="row">
        <a class="btn go" href="${INSTALL}">Get VirtuHome free</a>
        <a class="btn" href="${ADD_ONS}">${trials ? "Try the add-ons free" : "About the add-ons"}</a>
        <button class="btn again">${svg(mdiReplay)} Watch again</button>
        <button class="btn explore">Explore the house</button>
      </div>`;
    card.querySelector(".again")!.addEventListener("click", () => {
      card.classList.remove("show");
      speech.unlock();
      void play();
    });
    card.querySelector(".explore")!.addEventListener("click", close);
    card.classList.add("show");
  };

  const play = async () => {
    // first, while this is still the click that started it: browsers start sound only then
    music.start(audio);
    stopped = false;
    skipChapter = false;
    $(".intro").classList.remove("show");
    $(".outro").classList.remove("show");
    stage.classList.add("on");
    view.root.append(cinema);
    house.lively(false);
    const ask = fetch(CATALOG, { signal: AbortSignal.timeout?.(4000) })
      .then((r) => r.json())
      .then((c: { extensions?: { trial_days?: number }[] }) => (trials = !!c.extensions?.some((e) => (e.trial_days ?? 0) > 0)))
      .catch(() => (trials = false));
    const voices = fetch(`${VOICE}voices.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((v: Record<string, number> | null) => (recorded = v))
      .catch(() => (recorded = null));
    await Promise.race([Promise.all([speech.load(), voices]), sleepMs(2500)]);
    const all = CHAPTERS.flatMap((c) => c.lines);
    for (const [i, ch] of CHAPTERS.entries()) {
      if (stopped) break;
      skipChapter = false;
      if (i === CHAPTERS.length - 1) await ask;
      chapterCard(i, CHAPTERS.length, ch.title, ch.kicker, ch.addOn);
      music.section(i, CHAPTERS.length);
      ch.start?.(show);
      const values = chips(ch.chips);
      const live = setInterval(values, 1000);
      await sleep(i ? 1700 : 600);
      for (const line of ch.lines) {
        if (stopped || skipChapter) break;
        if (line.when && !line.when(show)) continue;
        const at = all.indexOf(line);
        await say(line, all.slice(at + 1, at + 3));
      }
      clearInterval(live);
      ch.end?.(show);
      $(".chips").innerHTML = "";
    }
    if (stopped) return;
    tidy();
    show.house(true);
    $(".chapter").classList.remove("show");
    subtitle(null);
    ending();
  };

  function close() {
    stopped = true;
    paused = false;
    interrupt();
    for (const t of timers) clearTimeout(t);
    timers = [];
    music.stop();
    tidy();
    cinema.remove();
    house.lively(true);
    cancelAnimationFrame(raf);
    resize.disconnect();
    window.removeEventListener("keydown", key);
    host.remove();
  }

  const togglePause = () => {
    paused = !paused;
    speech.pause(paused);
    music.pause(paused);
    if (playing) void (paused ? playing.pause() : playing.play().catch(() => undefined));
    $(".pause").innerHTML = svg(paused ? mdiPlay : mdiPause);
    $(".pause").setAttribute("aria-label", paused ? "Play" : "Pause");
  };
  function key(e: KeyboardEvent) {
    if (e.key === "Escape") close();
    else if (e.key === " " && stage.classList.contains("on")) {
      e.preventDefault();
      togglePause();
    } else if (e.key === "ArrowRight") interrupt();
    else if (e.key === "n" || e.key === "N") {
      skipChapter = true;
      interrupt();
    }
  }

  $(".pause").addEventListener("click", togglePause);
  $(".skip").addEventListener("click", interrupt);
  $(".close").addEventListener("click", close);
  $(".mute").addEventListener("click", () => {
    muted = !muted;
    if (muted) {
      speech.stop();
      if (playing) playing.muted = true;
    } else if (playing) playing.muted = false;
    music.mute(muted);
    $(".mute").innerHTML = svg(muted ? mdiVolumeOff : mdiVolumeHigh);
    $(".mute").setAttribute("aria-label", muted ? "Sound on" : "Sound off");
  });
  $(".start").addEventListener("click", () => {
    speech.unlock();
    void play();
  });
  $(".skipit").addEventListener("click", close);
  window.addEventListener("keydown", key);

  size();
  raf = requestAnimationFrame(tick);
  if (start) {
    speech.unlock();
    void play();
  } else {
    $(".intro").classList.add("show");
  }
}
