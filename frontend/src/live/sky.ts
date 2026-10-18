// The sky over the house: where the sun and moon are, and the weather. The weather comes from a
// weather entity (Met.no and the like: a forecast for the area, updated about hourly), and where
// the house has solar panels, from what they make now against what they made in clear sun at
// this time of day lately: that is measured on the roof, right now.
import type { Hass, HassEntity } from "./hass";
import { moonPosition, sunPosition, type MoonPlace, type SunPlace } from "./sun";

/** Weather picked by hand in the sun and weather panel, instead of the live one. */
export type WeatherPick = "clear" | "cloudy" | "rain" | "storm" | "snow" | "fog";
export const WEATHER_PICKS: WeatherPick[] = ["clear", "cloudy", "rain", "storm", "snow", "fog"];

export interface SkySettings {
  /** false: no weather in 3D (the sun still moves). */
  enabled?: boolean;
  /** The weather entity; unset = the first one with a condition. */
  weather?: string | null;
}

export interface Sky {
  time: number;
  /** null without a location (Home Assistant's home zone). */
  sun: SunPlace | null;
  moon: MoonPlace | null;
  /** How much of the sun's light the clouds take: 0 clear .. 1 overcast. */
  cloud: number;
  /** Falling now: 0 none, ~0.4 light, 1 a downpour. */
  rain: number;
  snow: number;
  /** 0 clear air .. 1 thick fog. */
  fog: number;
  /** The ground's wetness and lying snow, 0..1 (they last a while after the rain or snow stops). */
  wet: number;
  snowCover: number;
  /** Wind in m/s, and where it blows from (degrees clockwise from north). */
  wind: number;
  windFrom: number;
  /** A thunderstorm: lightning now and then. */
  storm: boolean;
  /** Home Assistant's condition ("rainy"), or the pick's name. */
  condition: string | null;
  /** Where the weather came from. */
  source: "live" | "pick" | "none";
}

interface Look {
  cloud: number;
  rain?: number;
  snow?: number;
  fog?: number;
  storm?: boolean;
}

/** What each of Home Assistant's weather conditions looks like. */
const CONDITIONS: Record<string, Look> = {
  "clear-night": { cloud: 0.05 },
  sunny: { cloud: 0.08 },
  partlycloudy: { cloud: 0.45 },
  cloudy: { cloud: 0.88 },
  windy: { cloud: 0.3 },
  "windy-variant": { cloud: 0.6 },
  fog: { cloud: 0.92, fog: 1 },
  rainy: { cloud: 0.92, rain: 0.5 },
  pouring: { cloud: 1, rain: 1 },
  hail: { cloud: 0.95, rain: 0.8 },
  lightning: { cloud: 0.9, storm: true },
  "lightning-rainy": { cloud: 0.97, rain: 0.85, storm: true },
  snowy: { cloud: 0.92, snow: 0.7 },
  "snowy-rainy": { cloud: 0.94, rain: 0.35, snow: 0.4 },
  exceptional: { cloud: 0.6 },
};

const PICKS: Record<WeatherPick, Look & { wind: number }> = {
  clear: { cloud: 0.04, wind: 2 },
  cloudy: { cloud: 0.9, wind: 4 },
  rain: { cloud: 0.95, rain: 0.7, wind: 5 },
  storm: { cloud: 1, rain: 1, storm: true, wind: 11 },
  snow: { cloud: 0.92, snow: 0.8, wind: 3 },
  fog: { cloud: 0.95, fog: 1, wind: 1 },
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const num = (v: unknown): number | null => (typeof v === "number" && isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && isFinite(Number(v)) ? Number(v) : null);

/** A wind speed in m/s, whatever unit the weather entity reports in. */
export function windMs(speed: number, unit: unknown): number {
  const u = String(unit ?? "km/h").toLowerCase();
  if (u === "m/s") return speed;
  if (u === "mph") return speed * 0.44704;
  if (u === "kn" || u === "kt" || u === "knots") return speed * 0.514444;
  if (u === "ft/s") return speed * 0.3048;
  return speed / 3.6;
}

const RAIN = new Set(["rainy", "pouring", "hail", "lightning-rainy", "snowy-rainy"]);
const SNOW = new Set(["snowy", "snowy-rainy"]);

/** Everything the sky depends on besides the time and place. */
export interface SkyInput {
  time: number;
  lat: number | null;
  lon: number | null;
  /** The weather entity's state, or null. */
  weather: HassEntity | null;
  pick?: WeatherPick | null;
  /** Solar now against clear sun (0..~1.2), when it can be trusted. */
  clearIndex?: number | null;
  /** When it last rained or snowed (ms), for wet ground and lying snow. */
  lastRain?: number | null;
  lastSnow?: number | null;
}

/** A sky with nothing known about it: no sun, no weather. */
export function quietSky(time = Date.now()): Sky {
  return { time, sun: null, moon: null, cloud: 0.2, rain: 0, snow: 0, fog: 0, wet: 0, snowCover: 0, wind: 2, windFrom: 240, storm: false, condition: null, source: "none" };
}

/** The sky for a moment: pure, so replays and picked dates get the same answer every time. */
export function skyAt(inp: SkyInput): Sky {
  const { time, lat, lon } = inp;
  const placed = lat !== null && lon !== null;
  const sun = placed ? sunPosition(time, lat!, lon!) : null;
  const moon = placed ? moonPosition(time, lat!, lon!) : null;
  const base = { time, sun, moon };
  if (inp.pick) {
    const p = PICKS[inp.pick];
    return {
      ...base, cloud: p.cloud, rain: p.rain ?? 0, snow: p.snow ?? 0, fog: p.fog ?? 0,
      wet: p.rain ? 1 : 0, snowCover: p.snow ? 1 : 0, wind: p.wind, windFrom: 240, storm: !!p.storm,
      condition: inp.pick, source: "pick",
    };
  }
  const w = inp.weather;
  if (!w || w.state === "unavailable" || w.state === "unknown") return { ...quietSky(time), sun, moon };
  const a = w.attributes;
  const look = CONDITIONS[w.state] ?? { cloud: 0.4 };
  let cloud = look.cloud;
  const cover = num(a.cloud_coverage);
  if (cover !== null) cloud = 0.6 * clamp01(cover / 100) + 0.4 * look.cloud;
  // the panels know better than a forecast whether the sun is out right now
  const k = inp.clearIndex;
  if (typeof k === "number" && isFinite(k)) cloud = 0.75 * clamp01((0.82 - k) / 0.65) + 0.25 * cloud;
  let fog = look.fog ?? 0;
  const vis = num(a.visibility);
  if (vis !== null) {
    const km = String(a.visibility_unit ?? "km") === "mi" ? vis * 1.609 : vis;
    fog = Math.max(fog, km < 1 ? 1 : km < 4 ? 0.45 : km < 8 ? 0.15 : 0);
  }
  const temp = num(a.temperature);
  const celsius = temp === null ? null : String(a.temperature_unit ?? "°C").includes("F") ? ((temp - 32) * 5) / 9 : temp;
  const humidity = num(a.humidity);
  const speed = num(a.wind_speed);
  const rain = look.rain ?? 0;
  const snow = look.snow ?? 0;
  // wet ground dries over a couple of hours (slower when it is cold or damp); dew wets it a little
  let wet = rain > 0 ? 1 : 0;
  if (!wet && inp.lastRain) {
    const tau = (celsius !== null && celsius < 6) || (humidity ?? 0) > 88 ? 5 : 2;
    wet = Math.exp(-Math.max(0, time - inp.lastRain) / 3_600_000 / tau);
  }
  if ((humidity ?? 0) >= 97) wet = Math.max(wet, 0.3);
  // lying snow stays while it freezes and thaws over a few hours once it doesn't
  let snowCover = snow > 0.2 ? 1 : 0;
  if (!snowCover && inp.lastSnow) {
    const hours = Math.max(0, time - inp.lastSnow) / 3_600_000;
    snowCover = celsius !== null && celsius <= 1 ? (hours < 48 ? 1 : 0) : Math.exp(-hours / 3);
  }
  return {
    ...base, cloud: clamp01(cloud), rain, snow, fog, wet: clamp01(wet), snowCover: clamp01(snowCover < 0.05 ? 0 : snowCover),
    wind: speed === null ? 2 : windMs(speed, a.wind_speed_unit), windFrom: num(a.wind_bearing) ?? 240,
    storm: !!look.storm, condition: w.state, source: "live",
  };
}

/** Two skies that look the same (the 3D view redraws only when the sky changes this much). */
export function skyKey(s: Sky): string {
  const r = (v: number, step: number) => Math.round(v / step);
  return [
    s.sun ? `${r(s.sun.azimuth, 0.25)},${r(s.sun.elevation, 0.25)}` : "-",
    s.moon ? `${r(s.moon.azimuth, 2)},${r(s.moon.elevation, 2)}` : "-",
    r(s.cloud, 0.05), r(s.rain, 0.1), r(s.snow, 0.1), r(s.fog, 0.05), r(s.wet, 0.1), r(s.snowCover, 0.1), r(s.wind, 1), r(s.windFrom, 15), s.storm,
  ].join("|");
}

// ------------------------------------------------------------------ live: weather entity, history, panels

/** Five-minute slots of a day (UTC). */
const SLOT = 300_000;
const slotOf = (t: number) => Math.floor((t % 86_400_000) / SLOT);

/** The best output seen in each five-minute slot lately (kW), with the sun's height then. */
export interface ClearReference {
  slots: Map<number, { kw: number; elevation: number }>;
  peak: { kw: number; elevation: number } | null;
}

/**
 * Builds the clear-sun reference from five-minute maxima of the solar power sensors: per slot of the
 * day, the best of the last days (some of them were sunny), and the best of all.
 */
export function clearReference(rows: { start: number; kw: number }[], lat: number, lon: number): ClearReference {
  const total = new Map<number, number>();
  for (const r of rows) total.set(r.start, (total.get(r.start) ?? 0) + Math.max(0, r.kw));
  const slots: ClearReference["slots"] = new Map();
  let peak: ClearReference["peak"] = null;
  for (const [start, kw] of total) {
    const el = sunPosition(start + SLOT / 2, lat, lon).elevation;
    if (el <= 0) continue;
    const s = slotOf(start);
    const cur = slots.get(s);
    if (!cur || kw > cur.kw) slots.set(s, { kw, elevation: el });
    if (!peak || kw > peak.kw) peak = { kw, elevation: el };
  }
  return { slots, peak };
}

/**
 * Solar now against clear sun at this moment (1 ≈ full sun, under 0.3 overcast), or null when it
 * can't be told: the sun too low (trees, neighbours), too little history, or nothing made at all
 * lately. Clear sun is scaled from the reference by the sun's height then and now.
 */
export function clearIndex(ref: ClearReference | null, kwNow: number | null, time: number, lat: number, lon: number): number | null {
  if (!ref?.peak || kwNow === null || ref.peak.kw < 0.2) return null;
  const el = sunPosition(time, lat, lon).elevation;
  if (el < 8) return null;
  const sin = (d: number) => Math.sin((Math.max(1, d) * Math.PI) / 180);
  const s = slotOf(time);
  let best: { kw: number; elevation: number } | null = null;
  for (const k of [s - 1, s, s + 1]) {
    const v = ref.slots.get((k + 288) % 288);
    if (v && (!best || v.kw > best.kw)) best = v;
  }
  const fromSlot = best ? (best.kw * sin(el)) / sin(best.elevation) : 0;
  const fromPeak = (ref.peak.kw * sin(el)) / sin(ref.peak.elevation);
  // a run of dull days leaves a slot low: the best day of all keeps it honest
  const clear = Math.max(fromSlot, 0.7 * fromPeak);
  if (clear < 0.05) return null;
  return kwNow / clear;
}

/**
 * The sky for a view: follows the weather entity, remembers when it last rained or snowed (also
 * from the last day's history, fetched once), and keeps the solar reference up to date.
 */
export class SkyLive {
  settings: SkySettings = {};
  /** The solar power sensors (the energy view finds them). */
  solar: string[] = [];
  private lastRain: number | null = null;
  private lastSnow: number | null = null;
  private historyFor: string | null = null;
  private ref: ClearReference | null = null;
  private refAt = 0;
  private refFor = "";
  private refBusy = false;
  /** Called when something fetched in the background changes the sky. */
  onChange: (() => void) | null = null;

  /** The weather entity to follow: the picked one, else the first one with a condition. */
  weatherEntity(h: Hass): string | null {
    if (this.settings.enabled === false) return null;
    const set = this.settings.weather;
    if (set) return h.states[set] ? set : null;
    const ids = Object.keys(h.states).filter((id) => id.startsWith("weather.")).sort();
    // a forecast with cloud cover (Met.no's "forecast_home") over one without
    return ids.find((id) => h.states[id].attributes.cloud_coverage !== undefined) ?? ids[0] ?? null;
  }

  /** The sky now (or at a replay's moment, from its states). */
  sky(h: Hass, time: number, opt: { pick?: WeatherPick | null; past?: boolean; solarKw?: number | null } = {}): Sky {
    const loc = location(h);
    const id = opt.pick ? null : this.weatherEntity(h);
    const weather = id ? h.states[id] ?? null : null;
    if (!opt.past && weather) {
      this.remember(weather, time);
      this.loadHistory(h, id!);
    }
    let k: number | null = null;
    if (!opt.past && !opt.pick && loc && this.settings.enabled !== false) {
      this.loadReference(h, loc, time);
      k = clearIndex(this.ref, opt.solarKw ?? null, time, loc.lat, loc.lon);
    }
    return skyAt({
      time, lat: loc?.lat ?? null, lon: loc?.lon ?? null, weather, pick: opt.pick ?? null, clearIndex: k,
      lastRain: opt.past ? null : this.lastRain, lastSnow: opt.past ? null : this.lastSnow,
    });
  }

  private remember(w: HassEntity, time: number): void {
    if (RAIN.has(w.state)) this.lastRain = time;
    if (SNOW.has(w.state)) this.lastSnow = time;
  }

  /** When it last rained or snowed in the last day, so the ground is wet after a shower at once. */
  private loadHistory(h: Hass, id: string): void {
    if (this.historyFor === id) return;
    this.historyFor = id;
    const start = new Date(Date.now() - 36 * 3_600_000).toISOString();
    h.callWS<Record<string, { s: string; lu: number }[]>>({
      type: "history/history_during_period", start_time: start, entity_ids: [id], minimal_response: true, no_attributes: true,
    }).then((res) => {
      const rows = res?.[id] ?? [];
      let changed = false;
      rows.forEach((row, i) => {
        // a state lasts until the next one starts
        const end = (rows[i + 1]?.lu ?? Date.now() / 1000) * 1000;
        if (RAIN.has(row.s) && end > (this.lastRain ?? 0)) {
          this.lastRain = end;
          changed = true;
        }
        if (SNOW.has(row.s) && end > (this.lastSnow ?? 0)) {
          this.lastSnow = end;
          changed = true;
        }
      });
      if (changed) this.onChange?.();
    }).catch(() => undefined);
  }

  /** The solar reference: fetched now and then (a few hours apart) from the last days' statistics. */
  private loadReference(h: Hass, loc: { lat: number; lon: number }, time: number): void {
    const key = this.solar.join(",");
    if (!key || this.refBusy || (key === this.refFor && time - this.refAt < 4 * 3_600_000)) return;
    this.refBusy = true;
    this.refFor = key;
    this.refAt = time;
    type Row = { start: number | string; max?: number | null };
    h.callWS<Record<string, Row[]>>({
      type: "recorder/statistics_during_period", start_time: new Date(time - 12 * 86_400_000).toISOString(),
      statistic_ids: this.solar, period: "5minute", types: ["max"], units: { power: "kW" },
    }).then((res) => {
      const rows = this.solar.flatMap((id) => res?.[id] ?? [])
        .filter((r) => typeof r.max === "number")
        .map((r) => ({ start: typeof r.start === "number" ? r.start : Date.parse(r.start), kw: r.max as number }));
      this.ref = rows.length ? clearReference(rows, loc.lat, loc.lon) : null;
      this.onChange?.();
    }).catch(() => undefined).finally(() => {
      this.refBusy = false;
    });
  }
}

/** Home Assistant's home location, or null. */
export function location(h: Hass | null | undefined): { lat: number; lon: number } | null {
  const c = h?.config;
  return c && typeof c.latitude === "number" && typeof c.longitude === "number" && (c.latitude !== 0 || c.longitude !== 0)
    ? { lat: c.latitude, lon: c.longitude }
    : null;
}
