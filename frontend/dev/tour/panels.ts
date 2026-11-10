// The tour's panels beside the house: VirtuHome's own controls and the add-ons' sheets as they look in
// the app (a room's scenes, the editor's finishes, the Energy add-on's solar and what-if, the Wall
// Tablet's screen), with a finger that taps them. The demo loads no add-on: their panels are copies,
// with the demo house's numbers. The solar ones are what the Energy add-on works out for the demo
// house; the what-if's year is a pretend one.
import { mdiClose, mdiLightbulbGroup, mdiPlay, mdiRedo, mdiUndo, mdiContentSave, mdiWhiteBalanceSunny } from "@mdi/js";
import { EXTERIOR_FINISHES, FLOOR_FINISHES, PAINT_SWATCHES, WALL_FINISHES, type FinishDef } from "../../src/scene/finishes";
import { finishPreview } from "../../src/scene/textures";
import { esc } from "../../src/i18n";
import { fill, num, money, type DemoStrings } from "../lang";
import type { Clip } from "./props";

const svg = (path: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const hexOf = (n: number) => `#${n.toString(16).padStart(6, "0")}`;

/** A panel with a finger that taps what is in it. */
class Panel {
  readonly el = document.createElement("div");
  private finger = document.createElement("i");
  private hide = 0;
  /** Taps one after another: the next starts once the last has pressed. */
  private queue: Promise<void> = Promise.resolve();

  constructor(cls: string, html: string) {
    this.el.className = `panel ${cls}`;
    this.el.innerHTML = html;
    this.finger.className = "finger";
    this.el.append(this.finger);
  }

  /**
   * Taps what `key` names (data-k): scrolls it into view, moves the finger there and presses it, then
   * lights it (and puts out the others of its group, data-g). `then` runs as it is pressed.
   */
  tap(key: string, then?: () => void): void {
    this.queue = this.queue.then(() => new Promise<void>((done) => this.press(key, () => {
      then?.();
      window.setTimeout(done, 120);
    })));
  }

  private press(key: string, then: () => void): void {
    const item = this.el.querySelector<HTMLElement>(`[data-k="${key}"]`);
    if (!item) return then();
    const box = item.closest<HTMLElement>(".scroll");
    if (box) {
      const top = item.offsetTop - box.offsetTop - box.clientHeight / 2 + item.offsetHeight / 2;
      box.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
    window.clearTimeout(this.hide);
    window.setTimeout(() => {
      const p = this.el.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      // where the finger rests before it moves: below and to the right of what it taps
      if (!this.finger.classList.contains("on")) {
        this.finger.style.transform = `translate(${r.right - p.left + 40}px, ${r.bottom - p.top + 50}px)`;
        void this.finger.offsetWidth;
      }
      this.finger.classList.add("on");
      this.finger.style.transform = `translate(${r.left - p.left + r.width / 2}px, ${r.top - p.top + r.height / 2}px)`;
      window.setTimeout(() => {
        this.finger.classList.remove("press");
        void this.finger.offsetWidth;
        this.finger.classList.add("press");
        item.classList.add("pressed");
        window.setTimeout(() => item.classList.remove("pressed"), 220);
        const group = item.dataset.g;
        if (group) this.el.querySelectorAll<HTMLElement>(`[data-g="${group}"]`).forEach((x) => x.classList.toggle("on", x === item));
        this.pressed(key);
        then();
        this.hide = window.setTimeout(() => this.finger.classList.remove("on"), 1600);
      }, 460);
    }, box ? 320 : 0);
  }

  /** What pressing `key` changes in the panel itself. */
  protected pressed(_key: string): void {}

  /** Back as it was first drawn. */
  reset(): void {
    this.finger.classList.remove("on", "press");
    this.el.querySelectorAll(".on[data-g]").forEach((x) => x.classList.remove("on"));
    this.el.querySelectorAll<HTMLElement>("[data-first]").forEach((x) => x.classList.add("on"));
  }
}

// ------------------------------------------------------------------ a room's scenes

/** The living room's sheet, as far as its buttons: the lights, and its scenes. */
export class Scenes extends Panel {
  constructor(S: DemoStrings) {
    const P = S.panels;
    super("vsheet scenes", `<div class="hd"><b>${esc(S.house["Living Room"])}</b><small>${num(S, 19.4, 1)}° · 55 %</small></div>
      <div class="acts">
        <button data-k="all">${svg(mdiLightbulbGroup)}${esc(P.allLightsOn)}</button>
        <button data-k="bright" data-g="scene">${svg(mdiPlay)}${esc(P.bright)}</button>
        <button data-k="movie" data-g="scene">${svg(mdiPlay)}${esc(P.movieNight)}</button>
      </div>`);
  }
}

// ------------------------------------------------------------------ the editor

const tiles = (S: DemoStrings, defs: Record<string, FinishDef>, keys: string[], group: string, current: string, tint: string | null = null) =>
  `<div class="tiles">${keys.map((k) => {
    const d = defs[k];
    const colour = k === current && d.tintable && tint ? parseInt(tint.slice(1), 16) : d.color;
    const pic = finishPreview(d.tex, d.scale, colour, 64);
    return `<button class="tile${k === current ? " on" : ""}" data-k="${group}:${k}" data-g="${group}"${k === current ? " data-first" : ""}>` +
      `<i style="background:${hexOf(colour)}${pic ? ` url(${pic}) center/cover` : ""}"></i>${esc(S.panels.finishes[`${group}.${k}`] ?? k)}</button>`;
  }).join("")}</div>`;

const swatches = (S: DemoStrings, group: string, current: string | null) => `<div class="sws">
  <button class="sw none${current ? "" : " on"}" data-g="${group}"${current ? "" : " data-first"} aria-label="${esc(S.panels.plainWhite)}"></button>
  ${PAINTS.map(([, c]) => `<button class="sw${c === current ? " on" : ""}" data-k="${group}:${c}" data-g="${group}" style="--c:${c}" aria-hidden="true"></button>`).join("")}
  </div>`;

// what the editor's panel offers
const OUTSIDE = ["render", "brick", "brick_buff", "brick_white", "stone", "composite", "timber", "pebbledash"];
const WALLS = ["paint", "wallpaper_stripes", "wallpaper_damask", "wallpaper_geo", "wallpaper_leaves", "panelling", "tiles", "brick"];
const FLOORS = ["wood", "oak", "walnut", "grey_wood", "herringbone", "tiles", "marble", "carpet"];
const PAINTS = PAINT_SWATCHES.slice(0, 11);

/** Everything the panels have that a line can tap (their data-k). */
export function tapKeys(): string[] {
  return [
    "all", "bright", "movie", "map", "try", "more",
    ...OUTSIDE.map((k) => `out:${k}`), ...WALLS.map((k) => `walls:${k}`), ...FLOORS.map((k) => `floor:${k}`), ...PAINTS.map(([, c]) => `paint:${c}`),
  ];
}

/** The editor's panel: the outside walls on its Home tab, and a room's floor and walls. */
export class Editor extends Panel {
  constructor(S: DemoStrings) {
    const P = S.panels;
    const tab = (name: string, k: string) => `<span class="tab" data-tab="${k}">${esc(name)}</span>`;
    super("vsheet day editor", `<div class="ehd"><b>${esc(P.editHome)}</b><span class="hb">${svg(mdiUndo)}${esc(P.undo)}</span><span class="hb">${svg(mdiRedo)}${esc(P.redo)}</span>
        <span class="save">${svg(mdiContentSave)}${esc(P.save)}</span><span class="x">${svg(mdiClose)}</span></div>
      <div class="modes"><span class="on">${esc(P.view3d)}</span><span>${esc(P.plan2d)}</span></div>
      <div class="tabs">${tab(P.tabHome, "home")}${tab(P.tabRooms, "rooms")}${tab(P.tabDevices, "devices")}${tab(P.tabSelected, "room")}${tab(P.tabExtras, "extras")}</div>
      <div class="body scroll">
        <section data-tab="home">
          <h4>${esc(P.outsideWalls)}</h4>
          ${tiles(S, EXTERIOR_FINISHES, OUTSIDE, "out", "brick")}
        </section>
        <section data-tab="room">
          <h4>${esc(S.house["Living Room"])}</h4>
          <div class="sub">${esc(P.walls)}</div>
          ${tiles(S, WALL_FINISHES, WALLS, "walls", "paint")}
          ${swatches(S, "paint", null)}
          <div class="sub">${esc(P.floor)}</div>
          ${tiles(S, FLOOR_FINISHES, FLOORS, "floor", "oak")}
        </section>
      </div>`);
    this.show("home");
  }

  /** Which tab shows: the house's (its outside walls) or the selected room's. */
  show(tab: "home" | "room"): void {
    this.el.querySelectorAll<HTMLElement>("[data-tab]").forEach((x) => {
      if (x.tagName === "SECTION") x.hidden = x.dataset.tab !== tab;
      else x.classList.toggle("on", x.dataset.tab === tab);
    });
    this.el.querySelector(".body")!.scrollTop = 0;
  }

  /** Shows the room's walls in a paint colour (null: each finish's own), as the editor does once one is picked. */
  tint(colour: string | null): void {
    this.el.querySelectorAll<HTMLElement>(`[data-g="walls"]`).forEach((b) => {
      const k = b.dataset.k!.split(":")[1] as keyof typeof WALL_FINISHES;
      const d: FinishDef = WALL_FINISHES[k];
      if (!d.tintable) return;
      const c = colour ? parseInt(colour.slice(1), 16) : d.color;
      const pic = finishPreview(d.tex, d.scale, c, 64);
      b.querySelector("i")!.setAttribute("style", `background:${hexOf(c)}${pic ? ` url(${pic}) center/cover` : ""}`);
    });
  }

  protected pressed(key: string): void {
    if (key.startsWith("paint:")) this.tint(key.slice(6));
  }

  reset(): void {
    super.reset();
    this.tint(null);
    this.show("home");
  }
}

// ------------------------------------------------------------------ the Energy add-on

/** The solar ramp, poor (40 % of the best) to the best. */
const RAMP: [number, number][] = [[0, 0x2b0f54], [0.25, 0x7a1f6e], [0.5, 0xc4305a], [0.7, 0xef6a2b], [0.85, 0xfbb33a], [1, 0xfdf3a0]];
function rampCss(pct: number): string {
  const x = Math.max(0, Math.min(1, (pct - 40) / 60));
  for (let i = 1; i < RAMP.length; i++) {
    if (x > RAMP[i][0]) continue;
    const [t0, a] = RAMP[i - 1], [t1, b] = RAMP[i];
    const f = (x - t0) / (t1 - t0);
    const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  }
  return "#fdf3a0";
}

// what the Energy add-on's Solar on the roof says for the demo house (its sun model, its shade, its
// panels): [slope, degrees, roof (0: the first floor's, else the ground floor's nth), m², kWh/kWp, % lost to shade, %]
type Slope = ["south" | "west" | "north", number, number, number, number, number, number];
const SLOPES: Slope[] = [
  ["south", 35, 0, 24, 997, 2, 98],
  ["west", 35, 0, 21, 840, 0, 83],
  ["west", 17, 2, 11, 607, 30, 60],
  ["north", 35, 0, 24, 554, 4, 55],
  ["west", 17, 1, 10, 395, 54, 39],
];
// its placed panels: [panels, kWp, slope, kWh a year, %]
const ARRAYS: [number, number, "south" | "north", number, number][] = [[3, 1.29, "south", 1310, 100], [2, 0.86, "south", 872, 100], [3, 1.29, "north", 739, 56]];

const row = (name: string, small: string, pct: number) =>
  `<div class="srow"><div class="n"><b>${esc(name)}</b><small>${esc(small)}</small></div><div class="bar"><i style="width:${pct}%;background:${rampCss(pct)}"></i></div><span>${pct}%</span></div>`;

/** The Energy sheet's last two parts: Solar on the roof, and What if, with three more panels tried. */
export class EnergySheet extends Panel {
  private readonly P: DemoStrings["panels"];

  constructor(S: DemoStrings) {
    const P = S.panels;
    const n = (v: number, d = 0) => num(S, v, d);
    const slope = (k: "south" | "west" | "north", deg: number) => fill(P.slope, { slope: P[k], deg });
    const roof = (r: number) => (r ? fill(P.groundFloorRoof, { n: r }) : P.firstFloorRoof);
    const rows = SLOPES.map(([k, deg, r, m2, per, shade, pct]) =>
      row(slope(k, deg), [roof(r), `${m2} m²`, `${n(per)} kWh/kWp`, ...(shade >= 2 ? [fill(P.lostToShade, { pct: shade })] : [])].join(" · "), pct)).join("");
    const arrays = ARRAYS.map(([count, kwp, k, kwh, pct]) =>
      row(fill(P.panels, { n: count, kwp: n(kwp, 2) }), [slope(k, 35), roof(0), fill(P.kwhAYear, { kwh: n(kwh) })].join(" · "), pct)).join("");
    const cash = (pounds: number) => money(S, pounds, S.money.perPound >= 10 ? 10 : 1);
    const cell = (k: string, a: string, b: string, cls = "") => `<span class="n">${esc(k)}</span><span>${esc(a)}</span><span class="${cls}">${esc(b)}</span>`;
    super("vsheet day energy", `<h3>${esc(P.energy)}</h3>
      <div class="body scroll">
        <div class="sh"><span>${esc(P.solarOnRoof)}</span><button class="pill on" data-k="map">${svg(mdiWhiteBalanceSunny)}${esc(P.shownOnRoof)}</button></div>
        <p class="best">${esc(fill(P.best, { pct: 98, kwh: n(997) }))}</p>
        ${rows}
        <div class="ssub">${esc(fill(P.yourPanels, { kwh: n(2921), kwp: n(3.44, 2) }))}</div>
        ${arrays}
        <div class="key"><span>40%</span><i style="background:linear-gradient(90deg,${RAMP.map(([at, c]) => `${hexOf(c)} ${at * 100}%`).join(",")})"></i><span>100%</span></div>
        <div class="sh" data-k="whatif-h"><span>${esc(P.whatIf)}</span><button class="pill go" data-k="try">${esc(P.tryIt)}</button></div>
        <div class="wf" hidden>
          <div class="fld"><label>${esc(P.panelsOn)}</label><span class="in sel">${esc(`${slope("south", 35)} · ${roof(0)}`)}</span></div>
          <div class="fld"><label>${esc(P.howMany)}</label><span class="pm">−</span><span class="in val" data-n>0</span><span class="pm" data-k="more">+</span><small>${esc(P.of)}</small><span class="in val">430</span><small>W</small>
            <small class="room">${esc(fill(P.roomFor, { n: 3 }))}</small></div>
          <div class="fld"><label>${esc(P.addBattery)}</label><span class="pm">−</span><span class="in val">${n(0)}</span><span class="pm">+</span><small>kWh</small></div>
          <div class="fld"><label>${esc(P.costOfWork)}</label><span class="in val wide">${esc(cash(1500))}</span><small>${esc(P.forPayback)}</small></div>
          <div class="wt">
            <span class="n k">${esc(P.aYear)}</span><span class="k">${esc(P.now)}</span><span class="k">${esc(P.withThem)}</span>
            ${cell(P.solarKwh, n(2921), n(4207))}
            ${cell(P.usedAtHome, `${n(1310)} (45%)`, `${n(1630)} (39%)`)}
            ${cell(P.soldKwh, n(1611), n(2577))}
            ${cell(P.boughtKwh, n(2690), n(2370))}
            ${cell(P.bill, cash(417), cash(194))}
            <i class="rule"></i>
            ${cell(P.saving, "", fill(P.savingValue, { money: cash(223) }), "good")}
            ${cell(P.costOfWork, "", cash(1500))}
            ${cell(P.paysBackIn, "", fill(P.years, { n: n(6.7, 1) }), "good")}
          </div>
        </div>
      </div>`);
    this.P = P;
  }

  /** What if → Try it, then three more panels, one tap at a time. */
  tryIt(onDone?: () => void): void {
    this.tap("try", () => {
      this.el.querySelector<HTMLElement>(".wf")!.hidden = false;
      this.el.querySelector<HTMLElement>("[data-k=try]")!.textContent = this.P.close;
      this.el.querySelector<HTMLElement>(".wt")!.classList.remove("in");
      let n = 0;
      const more = () => {
        this.tap("more", () => {
          n++;
          this.el.querySelector<HTMLElement>("[data-n]")!.textContent = String(n);
          if (n < 3) window.setTimeout(more, 60);
          else {
            const wt = this.el.querySelector<HTMLElement>(".wt")!;
            wt.classList.add("in");
            const box = this.el.querySelector<HTMLElement>(".body")!;
            box.scrollTo({ top: wt.offsetTop + wt.offsetHeight - box.clientHeight - box.offsetTop + 8, behavior: "smooth" });
            onDone?.();
          }
        });
      };
      window.setTimeout(more, 300);
    });
  }

  reset(): void {
    super.reset();
    this.el.querySelector<HTMLElement>(".wf")!.hidden = true;
    this.el.querySelector<HTMLElement>("[data-k=try]")!.textContent = this.P.tryIt;
    this.el.querySelector<HTMLElement>("[data-n]")!.textContent = "0";
    this.el.querySelector<HTMLElement>(".wt")!.classList.remove("in");
    this.el.querySelector(".body")!.scrollTop = 0;
  }
}

// ------------------------------------------------------------------ the Wall Tablet add-on

/**
 * A tablet on the wall by the front door, showing what the Wall Tablet add-on shows: the 3D home turning,
 * with its screensaver's clock, the weather, who's home and what's next; and when the doorbell rings, the
 * doorbell's camera over all of it, with a close button.
 */
export class WallTablet {
  readonly el = document.createElement("div");
  private video = document.createElement("video");
  private stream: MediaStream | null = null;

  constructor(private clip: Clip, S: DemoStrings) {
    this.el.className = "panel walltab";
    const day = new Date().toLocaleDateString(S.locale, { weekday: "long", day: "numeric", month: "long" });
    const P = S.panels;
    this.el.innerHTML = `<div class="frame"><div class="screen">
        <div class="saver"><div class="time">17:41</div><div class="date">${esc(day)}</div>
          <div class="more"><span>${esc(P.weather)}</span><span>${esc(P.whoIsHome)}</span><span>${esc(P.nextEvent)}</span></div></div>
        <div class="pop"><div class="feed"></div><span class="x">${svg(mdiClose)}</span></div>
      </div><i class="cam"></i></div>`;
    this.video.muted = true;
    this.video.playsInline = true;
    this.el.querySelector(".screen")!.prepend(this.video);
  }

  /** Shows the view's own picture on the tablet, live (as the add-on does: the same 3D home). */
  start(canvas: HTMLCanvasElement): void {
    try {
      this.stream ??= (canvas as HTMLCanvasElement & { captureStream?(fps?: number): MediaStream }).captureStream?.(30) ?? null;
    } catch {
      this.stream = null;
    }
    if (this.stream) {
      this.video.srcObject = this.stream;
      void this.video.play().catch(() => undefined);
    }
    this.el.classList.toggle("still", !this.stream);
    this.ring(false);
  }

  /** The doorbell: its camera takes the screen over. */
  ring(on: boolean): void {
    if (on) {
      this.clip.restart("ring", "17:42");
      this.el.querySelector(".feed")!.append(this.clip.canvas);
    }
    this.el.classList.toggle("ringing", on);
  }

  stop(): void {
    this.video.pause();
    this.video.srcObject = null;
    this.stream?.getTracks().forEach((x) => x.stop());
    this.stream = null;
    this.el.classList.remove("ringing");
  }
}

export const PANELS_CSS = /* css */ `
.panel { position: absolute; opacity: 0; transform: translateY(16px) scale(.97); transition: opacity .5s, transform .6s cubic-bezier(.2,.9,.3,1); }
.panel.show { opacity: 1; transform: none; }
/* VirtuHome's own glass, dark by night and light by day, at the tour's scale */
.vsheet { --vt: #eef3fb; --vd: #9fb0c8; --va: #56c7ff; --vc: rgba(255,255,255,.08); --von: rgba(86,199,255,.22); --vl: rgba(255,255,255,.12);
  left: 3vw; top: calc(var(--u) * 19); font-size: max(11px, calc(var(--u) * 1.55)); color: var(--vt); background: rgba(14,20,32,.72);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-radius: 1.4em; box-shadow: 0 1.5vh 5vh rgba(0,0,0,.35); padding: 1em 1.1em 1.1em; box-sizing: border-box; }
.vsheet.day { --vt: #1d232b; --vd: #46505d; --va: #1a5fcc; --vc: rgba(0,0,0,.05); --von: rgba(47,124,246,.16); --vl: rgba(0,0,0,.08); background: rgba(255,255,255,.86); }
.vsheet svg { width: 1.15em; height: 1.15em; fill: currentColor; flex: none; }
.vsheet button, .vsheet .pill { font: inherit; color: inherit; border: 0; }
.scroll { overflow: hidden; }
.finger { position: absolute; left: 0; top: 0; width: 2.6em; height: 2.6em; margin: -1.3em 0 0 -1.3em; border-radius: 50%; z-index: 3; pointer-events: none;
  background: radial-gradient(circle, rgba(255,255,255,.95) 0 38%, rgba(255,255,255,.35) 40% 60%, rgba(255,255,255,0) 62%);
  box-shadow: 0 .2em .8em rgba(0,0,0,.35); opacity: 0; transition: opacity .3s, transform .5s cubic-bezier(.5,0,.2,1); }
.finger.on { opacity: 1; }
.finger.press { animation: press .45s ease-out; }
@keyframes press { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.75), 0 .2em .8em rgba(0,0,0,.35); scale: 1; } 30% { scale: .8; }
  100% { box-shadow: 0 0 0 1.4em rgba(255,255,255,0), 0 .2em .8em rgba(0,0,0,.35); scale: 1; } }
.pressed { scale: .93; transition: scale .12s; }

.scenes { min-width: min(40vw, calc(var(--u) * 52)); }
.scenes .hd b { font-size: 1.25em; display: block; }
.scenes .hd small { color: var(--vd); font-size: .9em; }
.scenes .acts { display: flex; flex-wrap: wrap; gap: .5em; margin-top: .8em; }
.scenes .acts button { display: inline-flex; align-items: center; gap: .45em; padding: .55em 1em .55em .8em; border-radius: 999px; background: rgba(255,255,255,.1); }
.scenes .acts button.on { background: var(--von); box-shadow: inset 0 0 0 .12em var(--va); font-weight: 600; }

.editor { width: min(36vw, calc(var(--u) * 50)); padding: 0; overflow: hidden; }
.editor .ehd { display: flex; align-items: center; gap: .4em; padding: .8em .8em .5em 1.1em; }
.editor .ehd b { font-size: 1.15em; margin-right: auto; }
.editor .hb { display: inline-flex; align-items: center; gap: .25em; padding: .4em .7em .4em .55em; border-radius: 999px; background: var(--vc); color: var(--vd); font-size: .9em; }
.editor .save { display: inline-flex; align-items: center; gap: .35em; padding: .45em .8em; border-radius: 999px; background: rgba(127,127,127,.32); color: rgba(255,255,255,.85); font-weight: 600; font-size: .9em; }
.editor .x { display: grid; place-items: center; width: 2.2em; height: 2.2em; border-radius: 50%; background: var(--vc); }
.editor .modes { display: flex; gap: 2px; margin: 0 .8em .6em; padding: .2em; border-radius: .9em; background: var(--vc); }
.editor .modes span { flex: 1; text-align: center; padding: .45em; border-radius: .7em; color: var(--vd); font-weight: 600; }
.editor .modes span.on { background: #fff; color: var(--vt); box-shadow: 0 1px 4px rgba(0,0,0,.15); }
.editor .tabs { display: flex; gap: .3em; padding: 0 .8em .6em; border-bottom: 1px solid var(--vl); }
.editor .tab { flex: 1; text-align: center; padding: .5em .2em; border-radius: .75em; color: var(--vd); }
.editor .tab.on { background: var(--von); color: var(--vt); font-weight: 600; }
.editor .body { height: calc(var(--u) * 38); padding: .2em 1.1em 1.1em; }
.editor h4 { margin: 1em 0 .5em; font-size: .9em; text-transform: uppercase; letter-spacing: .04em; color: var(--vd); }
.editor .sub { margin: .9em 0 .35em; font-size: .92em; color: var(--vd); }
.editor .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: .45em; }
.editor .tile { display: flex; flex-direction: column; align-items: center; gap: .35em; padding: .4em .3em .5em; border-radius: .9em; background: var(--vc);
  font-size: .85em; line-height: 1.15; text-align: center; transition: background .2s, box-shadow .2s; }
.editor .tile i { width: 100%; aspect-ratio: 1; border-radius: .6em; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
.editor .tile.on { background: var(--von); box-shadow: inset 0 0 0 .12em var(--va); font-weight: 600; }
.editor .tile.on i { box-shadow: 0 0 0 .14em var(--va); }
.editor .sws { display: flex; flex-wrap: wrap; gap: .45em; margin: .6em 0 .2em; }
.editor .sw { width: 2em; height: 2em; border-radius: 50%; padding: 0; background: var(--c, #fff); box-shadow: inset 0 0 0 1px rgba(0,0,0,.18); }
.editor .sw.on { box-shadow: 0 0 0 .15em #fff, 0 0 0 .3em var(--va); }
.editor .sw.none { background: linear-gradient(135deg, transparent 45%, #d9534f 45%, #d9534f 55%, transparent 55%), var(--vc); }

.energy { width: min(38vw, calc(var(--u) * 56)); padding: 1em .6em .4em; }
.energy h3 { margin: 0 .5em .2em; font-size: 1.2em; font-weight: 600; }
.energy .body { height: calc(var(--u) * 46); }
.energy .sh { display: flex; align-items: center; gap: .6em; margin: 1em .5em .45em; }
.energy .sh span { font-size: .92em; color: var(--vd); }
.energy .pill { margin-left: auto; display: inline-flex; align-items: center; gap: .3em; padding: .4em .8em; border-radius: 999px; background: var(--vc); font-size: .92em; }
.energy .pill.on, .energy .pill.go { background: var(--von); box-shadow: inset 0 0 0 .12em var(--va); }
.energy .best { margin: 0 .6em .5em; line-height: 1.4; }
.energy .srow { display: grid; grid-template-columns: minmax(0, 1fr) 4.9em 3em; gap: .6em; align-items: center; padding: .35em .6em; }
.energy .srow b { display: block; font-weight: 500; }
.energy .srow small { display: block; font-size: .84em; color: var(--vd); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.energy .srow > span { text-align: right; font-variant-numeric: tabular-nums; }
.energy .bar { height: .45em; border-radius: .25em; background: var(--vc); overflow: hidden; }
.energy .bar i { display: block; height: 100%; border-radius: .25em; }
.energy .ssub { margin: .8em .6em .15em; font-size: .92em; color: var(--vd); }
.energy .key { display: flex; align-items: center; gap: .45em; margin: .6em .6em 0; font-size: .84em; color: var(--vd); }
.energy .key i { flex: 1; height: .45em; border-radius: .25em; }
.energy .wf { margin: .3em .6em .6em; }
.energy .fld { display: flex; align-items: center; gap: .35em .55em; flex-wrap: wrap; margin: 0 0 .55em; }
.energy .fld label { flex: 0 0 8em; color: var(--vd); font-size: .92em; }
.energy .fld small { color: var(--vd); font-size: .84em; }
.energy .fld .room { flex-basis: 100%; padding-left: 8.55em; margin-top: -.2em; }
.energy .in { background: var(--vc); border-radius: .6em; padding: .35em .55em; }
.energy .in.sel { flex: 1; }
.energy .in.val { min-width: 2.4em; text-align: right; font-variant-numeric: tabular-nums; }
.energy .in.wide { min-width: 4.6em; }
.energy .pm { background: var(--vc); border-radius: 999px; padding: .2em .65em; font-size: 1.05em; }
.energy .wt { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: .2em 1.1em; margin: .6em 0 .2em; font-variant-numeric: tabular-nums;
  opacity: .25; transition: opacity .5s; }
.energy .wt.in { opacity: 1; }
.energy .wt span { text-align: right; }
.energy .wt span.n { text-align: left; }
.energy .wt .k { color: var(--vd); font-size: .84em; }
.energy .wt .good { color: #1f9d5c; font-weight: 700; }
.energy .wt .rule { grid-column: 1 / -1; border-top: 1px solid var(--vl); margin: .15em 0; }

.walltab { left: 3vw; top: calc(var(--u) * 19); width: min(46vw, calc(var(--u) * 80)); }
.walltab .frame { position: relative; padding: calc(var(--u) * 1.3); border-radius: calc(var(--u) * 2.6); background: linear-gradient(145deg, #2a2d33, #0d0e11);
  box-shadow: 0 2vh 6vh rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.08); }
.walltab .cam { position: absolute; left: 50%; top: calc(var(--u) * .5); width: calc(var(--u) * .5); height: calc(var(--u) * .5); border-radius: 50%; background: #222831; }
.walltab .screen { position: relative; aspect-ratio: 16 / 10; border-radius: calc(var(--u) * 1); overflow: hidden; background: #0c1220; color: #fff;
  font-family: Roboto, system-ui, sans-serif; container-type: size; }
.walltab video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.walltab.still .screen { background: radial-gradient(ellipse at 50% 70%, #34405a, #0c1220); }
.walltab .saver { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 4cqh 5cqh;
  background: linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0) 60%); text-shadow: 0 1px 6px rgba(0,0,0,.5); }
.walltab .time { font-size: 17cqh; font-weight: 300; line-height: 1; letter-spacing: -.02em; }
.walltab .date { font-size: 4.2cqh; margin-top: 1cqh; }
.walltab .more { display: flex; flex-wrap: wrap; gap: 1cqh 4cqh; font-size: 3.4cqh; margin-top: 2cqh; opacity: .92; }
.walltab .pop { position: absolute; inset: 0; background: #000; display: grid; place-items: center; opacity: 0; transition: opacity .35s; }
.walltab.ringing .pop { opacity: 1; }
.walltab .pop .feed { width: 100%; }
.walltab .pop canvas { display: block; width: 100%; height: auto; }
.walltab .pop .x { position: absolute; top: 3cqh; right: 3cqh; width: 9cqh; height: 9cqh; border-radius: 50%; background: rgba(0,0,0,.55); display: grid; place-items: center; }
.walltab .pop .x svg { width: 55%; height: 55%; fill: #fff; }
.narrow .vsheet, .narrow .walltab { left: 4vw; right: 4vw; width: auto; min-width: 0; top: 140px; }
.narrow .vsheet { font-size: 11px; }
.narrow .editor .body, .narrow .energy .body { height: 34vh; }
`;
