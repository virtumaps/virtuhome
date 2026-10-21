// The sun and weather panel: the house at any date and time of day (where the sun is then, and
// its shadows), a day played through, and the weather picked by hand. Live comes back with "Now".
import { mdiClose, mdiPause, mdiPlay } from "@mdi/js";
import type { Hass } from "../live/hass";
import { location, WEATHER_PICKS, type Sky, type WeatherPick } from "../live/sky";
import { compassName, sunEvents } from "../live/sun";
import { zonedParts, zonedTime } from "./clock";
import { esc, t, th } from "../i18n";

export interface SkyPick {
  /** A moment to show instead of now. */
  time: number | null;
  weather: WeatherPick | null;
}

export interface SkyPanelHost {
  hass(): Hass | null;
  /** The sky the view shows now. */
  sky(): Sky | null;
  realistic(): boolean;
  pick(p: SkyPick | null): void;
  useRealistic(): void;
}

const svg = (path: string) => `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`;

/** Home Assistant's weather conditions the panel puts into words (others show as they are). */
const CONDITIONS = [
  "clear-night", "sunny", "partlycloudy", "cloudy", "windy", "windy-variant", "fog", "rainy", "pouring", "hail", "lightning",
  "lightning-rainy", "snowy", "snowy-rainy", "exceptional",
] as const;

export const SKY_CSS = /* css */ `
.vh-sky {
  position: absolute; left: 10px; bottom: 10px; right: 60px; max-width: 460px; z-index: 3;
  background: var(--vh-glass); color: var(--vh-text); border-radius: 18px; padding: 10px 14px 12px;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  font-size: 13px;
}
.vh-sky h3 { margin: 0 0 6px; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.vh-sky h3 .vh-icon { width: 30px; height: 30px; margin-left: auto; box-shadow: none; }
.vh-sky-row { display: grid; grid-template-columns: 42px 1fr 64px; gap: 8px; align-items: center; margin: 4px 0; }
.vh-sky-row label { color: var(--vh-dim); font-size: 12px; }
.vh-sky-row b { font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.vh-sky-row input[type=range] { width: 100%; accent-color: var(--vh-accent); }
.vh-sky-chips { display: flex; flex-wrap: wrap; gap: 5px; margin: 2px 0 6px 50px; }
.vh-sky-chips.weather { margin-left: 0; margin-top: 8px; }
.vh-sky .vh-chip { padding: 5px 10px; font-size: 12px; box-shadow: none; background: var(--vh-chip); }
.vh-sky .vh-chip.on { background: var(--vh-chip-on); box-shadow: inset 0 0 0 1.5px var(--vh-accent); }
.vh-sky .vh-play { width: 30px; height: 30px; padding: 0; justify-content: center; }
.vh-sky .vh-play svg { width: 18px; height: 18px; fill: currentColor; }
.vh-sky-info { color: var(--vh-dim); font-size: 12px; line-height: 1.4; margin-top: 4px; }
.vh-sky-info button { border: 0; background: none; color: var(--vh-accent); font: inherit; padding: 0; cursor: pointer; text-decoration: underline; }
@media (min-width: 601px) { .vh-root.editing .vh-sky { display: none; } }
`;

export class SkyPanel {
  readonly el: HTMLDivElement;
  /** Day of the year (from 0) and minute of the day picked; null: today, now. */
  private yday: number | null = null;
  private minutes: number | null = null;
  private weather: WeatherPick | null = null;
  private playTimer = 0;

  constructor(private host: SkyPanelHost) {
    this.el = document.createElement("div");
    this.el.className = "vh-sky";
    this.el.hidden = true;
    this.el.addEventListener("input", (e) => {
      const t = e.target as HTMLInputElement;
      if (t.dataset.k === "date") this.yday = Number(t.value);
      if (t.dataset.k === "time") this.minutes = Number(t.value);
      this.changed();
    });
    this.el.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
      if (!b) return;
      const a = b.dataset.a!;
      const v = b.dataset.v ?? "";
      if (a === "close") return this.close();
      if (a === "play") return this.togglePlay();
      if (a === "realistic") return this.host.useRealistic();
      if (a === "date") this.yday = v === "today" ? null : Number(v);
      if (a === "time") {
        this.stopPlay();
        this.minutes = v === "now" ? null : Number(v);
      }
      if (a === "weather") this.weather = v === "live" ? null : (v as WeatherPick);
      this.changed();
    });
  }

  get open(): boolean {
    return !this.el.hidden;
  }

  show(): void {
    this.el.hidden = false;
    this.render();
  }

  /** Closes the panel and goes back to live. */
  close(): void {
    this.stopPlay();
    this.el.hidden = true;
    this.yday = this.minutes = null;
    this.weather = null;
    this.host.pick(null);
  }

  private get tz(): string | undefined {
    return this.host.hass()?.config?.time_zone;
  }

  /** The moment picked, or null for now (today and now both untouched). */
  private time(): number | null {
    if (this.yday === null && this.minutes === null) return null;
    const tz = this.tz;
    const now = zonedParts(Date.now(), tz);
    const year = now.year;
    const day = this.yday ?? now.yday;
    const d = new Date(Date.UTC(year, 0, 1 + day));
    return zonedTime(year, d.getUTCMonth(), d.getUTCDate(), this.minutes ?? now.minutes, tz);
  }

  private changed(): void {
    const time = this.time();
    // another day or hour shows clear skies unless a weather is picked: the forecast is for now
    this.host.pick(time === null && this.weather === null ? null : { time, weather: this.weather ?? (time !== null ? "clear" : null) });
    this.render();
  }

  private togglePlay(): void {
    if (this.playTimer) return this.stopPlay();
    const now = zonedParts(Date.now(), this.tz);
    this.minutes ??= now.minutes;
    // a day in about twelve seconds
    this.playTimer = window.setInterval(() => {
      this.minutes = ((this.minutes ?? 0) + 4) % 1440;
      this.changed();
    }, 33);
    this.render();
  }

  private stopPlay(): void {
    window.clearInterval(this.playTimer);
    this.playTimer = 0;
  }

  /**
   * Redraws the panel. A slider being dragged keeps its element (replacing it would drop the drag):
   * only its value, the labels, the chips and the readout change.
   */
  render(): void {
    if (this.el.hidden) return;
    const hass = this.host.hass();
    const tz = this.tz;
    const lang = hass?.language || undefined;
    const now = zonedParts(Date.now(), tz);
    const yday = this.yday ?? now.yday;
    const minutes = this.minutes ?? now.minutes;
    const shown = this.time() ?? Date.now();
    const fmt = (o: Intl.DateTimeFormatOptions, t: number) => {
      try {
        return new Intl.DateTimeFormat(lang, { ...o, timeZone: tz }).format(new Date(t));
      } catch {
        return new Intl.DateTimeFormat(lang, o).format(new Date(t));
      }
    };
    const loc = location(hass);
    // the day's sunrise, noon and sunset, as minutes of the day
    let events: { rise: number | null; noon: number; set: number | null } | null = null;
    if (loc) {
      const d = new Date(Date.UTC(now.year, 0, 1 + yday));
      const start = zonedTime(now.year, d.getUTCMonth(), d.getUTCDate(), 0, tz);
      const ev = sunEvents(start, loc.lat, loc.lon);
      const m = (t: number | null) => (t === null ? null : Math.round(zonedParts(t, tz).minutes / 5) * 5);
      events = { rise: m(ev.rise), noon: m(ev.noon)!, set: m(ev.set) };
    }
    const yearDay = (month: number, day: number) => Math.round((Date.UTC(now.year, month, day) - Date.UTC(now.year, 0, 1)) / 86_400_000);
    const chip = (a: string, v: string, label: string, on: boolean) =>
      `<button class="vh-chip${on ? " on" : ""}" data-a="${a}" data-v="${v}">${esc(label)}</button>`;
    const days: [string, number][] = [[t("sky.midwinter"), yearDay(11, 21)], [t("sky.spring"), yearDay(2, 20)], [t("sky.midsummer"), yearDay(5, 21)], [t("sky.autumn"), yearDay(8, 22)]];
    const times: [string, number | null][] = events ? [[t("sky.sunrise"), events.rise], [t("sky.noon"), events.noon], [t("sky.sunset"), events.set]] : [];
    const weatherNow = this.weather ?? (this.time() !== null ? "clear" : null);
    if (!this.el.firstChild) {
      this.el.innerHTML = `
        <h3>${th("sky.title")}<button class="vh-icon" data-a="close" title="${th("sky.back")}">${svg(mdiClose)}</button></h3>
        <div class="vh-sky-row"><label>${th("sky.date")}</label><input type="range" min="0" max="365" step="1" data-k="date"><b data-l="date"></b></div>
        <div class="vh-sky-chips" data-c="date"></div>
        <div class="vh-sky-row"><label>${th("sky.time")}</label><input type="range" min="0" max="1435" step="5" data-k="time"><b data-l="time"></b></div>
        <div class="vh-sky-chips" data-c="time"></div>
        <div class="vh-sky-chips weather" data-c="weather"></div>
        <div class="vh-sky-info"></div>`;
    }
    const q = <T extends HTMLElement>(sel: string) => this.el.querySelector<T>(sel)!;
    const dateIn = q<HTMLInputElement>('[data-k="date"]');
    const timeIn = q<HTMLInputElement>('[data-k="time"]');
    // inside the card's shadow root, the document only sees the card as focused
    const focused = (this.el.getRootNode() as Document | ShadowRoot).activeElement;
    if (focused !== dateIn || this.yday === null) dateIn.value = String(yday);
    if (focused !== timeIn || this.minutes === null || this.playTimer) timeIn.value = String(minutes);
    q('[data-l="date"]').textContent = fmt({ day: "numeric", month: "short" }, shown);
    q('[data-l="time"]').textContent = fmt({ hour: "numeric", minute: "2-digit" }, shown);
    const html = (sel: string, h: string) => {
      const e = q(sel);
      if (e.innerHTML !== h) e.innerHTML = h;
    };
    html('[data-c="date"]', chip("date", "today", t("sky.today"), this.yday === null) + days.map(([n, d]) => chip("date", String(d), n, this.yday === d)).join(""));
    html('[data-c="time"]', chip("time", "now", t("sky.now"), this.minutes === null && !this.playTimer)
      + times.filter(([, m]) => m !== null).map(([n, m]) => chip("time", String(m), n, this.minutes === m && !this.playTimer)).join("")
      + `<button class="vh-chip vh-play" data-a="play" title="${th(this.playTimer ? "sky.pause" : "sky.play")}">${svg(this.playTimer ? mdiPause : mdiPlay)}</button>`);
    html('[data-c="weather"]', (["live", ...WEATHER_PICKS] as const).map((w) => chip("weather", w, t(`sky.weather.${w}`), (weatherNow ?? "live") === w)).join(""));
    const sky = this.host.sky();
    const lines: string[] = [];
    if (!loc) lines.push(th("sky.noLocation"));
    else if (sky?.sun) {
      const s = sky.sun;
      const moon = sky.moon && sky.moon.elevation > 0 ? t("sky.moon", { lit: Math.round(sky.moon.lit * 100), direction: compassName(sky.moon.azimuth) }) : "";
      lines.push(esc(s.elevation > -0.833
        ? t("sky.sunUp", { elevation: Math.round(s.elevation), direction: compassName(s.azimuth), azimuth: Math.round(s.azimuth) })
        : [t("sky.sunDown", { below: Math.round(-s.elevation) }), moon].filter(Boolean).join(" · ")));
    }
    if (sky && sky.source === "live" && sky.condition) {
      const condition = CONDITIONS.find((c) => c === sky.condition);
      const parts = [condition ? t(`sky.condition.${condition}`) : sky.condition, t("sky.cloud", { cloud: Math.round(sky.cloud * 100) })];
      if (sky.wind >= 1) parts.push(t("sky.wind", { speed: Math.round(sky.wind * 3.6), direction: compassName(sky.windFrom) }));
      if (sky.wet > 0.2 && sky.rain === 0) parts.push(t("sky.wet"));
      lines.push(th("sky.weatherNow", { weather: parts.join(", ") }));
    } else if (sky?.source === "none" && !this.weather && this.time() === null) lines.push(th("sky.noWeather"));
    if (!this.host.realistic()) lines.push(`${th("sky.realistic")} <button data-a="realistic">${th("sky.useRealistic")}</button>`);
    html(".vh-sky-info", lines.join("<br>"));
  }

  dispose(): void {
    this.stopPlay();
  }
}
