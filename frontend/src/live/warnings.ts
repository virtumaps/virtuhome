// Two warnings a wall tablet should give: rain coming with windows open, and a power cut. Both are
// safety, so both are in the core.
import type { Plan } from "../model/plan";
import { domainOf, type Hass, type HassEntity } from "./hass";

/** Weather conditions that wet an open window. */
export const RAIN_CONDITIONS = new Set(["rainy", "pouring", "lightning-rainy", "hail", "snowy-rainy"]);

/** One hour of a forecast, as Home Assistant's `weather/subscribe_forecast` gives it. */
export interface ForecastHour {
  datetime: string;
  condition?: string | null;
  precipitation?: number | null;
  precipitation_probability?: number | null;
}

const gone = (s: HassEntity | undefined): boolean => !s || s.state === "unavailable" || s.state === "unknown";

/** Rain sensors: a binary sensor named for rain (on while it rains), or a sensor of how hard it rains. */
export function rainSensors(hass: Hass): string[] {
  return Object.keys(hass.states).filter((id) => {
    const dc = String(hass.states[id].attributes.device_class ?? "");
    if (domainOf(id) === "binary_sensor") return /(^|[._])rain(ing)?([._]|$)/.test(id) && (dc === "" || dc === "moisture");
    return domainOf(id) === "sensor" && dc === "precipitation_intensity";
  });
}

/**
 * Whether it rains now or will within the hour: a rain sensor says best (one that reads dry is
 * believed over the weather's condition for the whole area); else the weather's condition now; else
 * an hour of the forecast starting within the next hour that is rainy, or wet enough and likely.
 */
export function rainComing(hass: Hass, weather: string | null, sensors: string[], forecast: ForecastHour[] | null, now: number): "now" | "soon" | null {
  let sensed = false;
  for (const id of sensors) {
    const s = hass.states[id];
    if (gone(s)) continue;
    sensed = true;
    if (domainOf(id) === "binary_sensor" ? s.state === "on" : parseFloat(s.state) > 0) return "now";
  }
  if (sensed) return null;
  if (weather && RAIN_CONDITIONS.has(hass.states[weather]?.state ?? "")) return "now";
  for (const f of forecast ?? []) {
    const t = Date.parse(f.datetime);
    if (!isFinite(t) || t + 3_600_000 <= now || t > now + 3_600_000) continue;
    const wet = RAIN_CONDITIONS.has(f.condition ?? "") || ((f.precipitation ?? 0) >= 0.3 && (f.precipitation_probability ?? 100) >= 50);
    if (wet) return "soon";
  }
  return null;
}

/** The sensors of the windows and roof windows that are open, leaving out sheltered ones. */
export function openWindows(plan: Plan, hass: Hass): string[] {
  const ids = new Set<string>();
  // a contact sensor that is on, or a roof window's opener (a cover) that is open
  const open = (id: string | null | undefined) => !!id && /^(on|open)$/.test(hass.states[id]?.state ?? "");
  for (const f of plan.floors) {
    for (const o of f.openings) if (o.kind === "window" && !o.sheltered && open(o.entity)) ids.add(o.entity!);
    for (const r of f.roofs ?? []) for (const it of r.items ?? []) if (it.kind === "window" && !it.sheltered && open(it.entity)) ids.add(it.entity!);
  }
  return [...ids];
}

/** Where to tell a power cut from. */
export interface PowerSources {
  /** A grid status sensor picked in the plan. */
  status: string | null;
  /** The grid's power sensor and the battery's (from the energy settings). */
  grid: string | null;
  battery: string | null;
  batteryLevel: string | null;
}

/** A UPS's status that says it runs on its battery (NUT's "OB", or in words). */
const ON_BATTERY = /^OB\b|on ?battery/i;
/** A grid status in words that says the grid is off. */
const GRID_OFF = /\b(off|lost|loss|outage|fault|down|failure|islanded|off-?grid)\b/i;

/**
 * Whether the grid is off, and how much battery is left if known:
 * - a grid status sensor picked in the plan (a binary sensor that is off, or "on" for a problem
 *   sensor; a sensor whose state says off, lost, outage…);
 * - a UPS on battery (Network UPS Tools' status);
 * - the grid's power sensor unavailable for 2 minutes while the battery still reports (the
 *   inverter is up, the grid isn't).
 */
export function powerCut(hass: Hass, src: PowerSources, now: number): { battery: number | null } | null {
  const level = (id: string | null) => {
    const v = id ? parseFloat(hass.states[id]?.state ?? "") : NaN;
    return isFinite(v) ? Math.round(v) : null;
  };
  const st = src.status ? hass.states[src.status] : undefined;
  if (st && !gone(st)) {
    const cut = domainOf(st.entity_id) === "binary_sensor"
      ? (st.attributes.device_class === "problem" ? st.state === "on" : st.state === "off")
      : GRID_OFF.test(st.state);
    return cut ? { battery: level(src.batteryLevel) } : null;
  }
  for (const id of Object.keys(hass.states)) {
    if (domainOf(id) !== "sensor" || !/(^|[._])ups([._]|$)/.test(id) || !/status/.test(id)) continue;
    if (ON_BATTERY.test(hass.states[id].state)) {
      const charge = Object.keys(hass.states).find((x) => x.startsWith(id.slice(0, id.indexOf("status"))) && /battery_charge$/.test(x)) ?? null;
      return { battery: level(src.batteryLevel) ?? level(charge) };
    }
  }
  const g = src.grid ? hass.states[src.grid] : undefined;
  if (g && gone(g) && now - Date.parse(g.last_changed) >= 120_000) {
    const reports = [src.battery, src.batteryLevel].some((id) => id && !gone(hass.states[id]));
    if (reports) return { battery: level(src.batteryLevel) };
  }
  return null;
}
