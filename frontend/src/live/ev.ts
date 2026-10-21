// Electric cars: the chargers Home Assistant knows (Ohme, Zappi, Hypervolt, Pod Point, Wallbox,
// Easee, OCPP…), what each is doing, and the car's battery. A charger is found by its integration or
// its device's name, and its other sensors and controls come from the same device. The plan can name
// the charger's power sensor and the car's battery by hand.
import type { EnergySettings } from "../model/plan";
import { domainOf, isPower, kw, type Hass, type HassEntity } from "./hass";
import { t } from "../i18n";

/** One charger's entities (any of them may be missing). */
export interface EvCharger {
  /** Its device in the registry. */
  device: string | null;
  name: string;
  power: string | null;
  /** What it is doing, in its own words. */
  status: string | null;
  /** Whether a car is plugged in. */
  plug: string | null;
  /** The car's battery (%). */
  level: string | null;
  /** The level it charges to (%), and the time it should be done by. */
  target: string | null;
  targetTime: string | null;
  /** How it charges (a select: smart, max, paused…). */
  mode: string | null;
  /** Approves a charge that waits for it. */
  approve: string | null;
  /** The car it charges, for its name (Ohme's vehicle select). */
  vehicle: string | null;
  /** When it plans to charge (Ohme's charge slots). */
  slots: string | null;
  /** An energy statistic (kWh), for today's total. */
  energy: string | null;
}

export type EvState = "unplugged" | "plugged" | "charging" | "approval" | "paused" | "finished" | "fault" | "unknown";

/** What a charger is doing, in words ("" when it isn't known). */
export const evStateText = (state: EvState): string => (state === "unknown" ? "" : t(`ev.${state}`));

/** What a charger and its car are doing now. */
export interface EvNow {
  /** The car's name, else the charger's. */
  name: string;
  state: EvState;
  /** kW. */
  power: number | null;
  /** The car's battery (%). */
  level: number | null;
  target: number | null;
  /** When it should be done ("08:00"). */
  by: string | null;
  /** The charge mode now and the ones to pick from (none while it cannot be changed). */
  mode: string | null;
  modes: string[];
  /** A charge waits for approval, and there is a button for it. */
  canApprove: boolean;
  /** When it plans to charge, as the charger says it ("23:30-05:30"). */
  slots: string | null;
}

/** Integrations that are EV chargers and nothing else. */
const PLATFORMS = /^(ohme|hypervolt\w*|pod_?point|wallbox|easee|zaptec|tesla_wall_connector|openevse|ocpp|goe\w*|go_e\w*|goecharger\w*|peblar|alfen\w*|keba|andersen\w*|indra\w*|nrgkick\w*|v2c)$/;
/** Words in a device's maker, model or name that make it a charger (myenergi's Zappi, not its Eddi). */
const WORDS = /\b(ohme|zappi|hypervolt|pod ?point|wallbox|easee|zaptec|wall connector|go-e|openevse|keba|alfen|peblar|andersen|indra|ev ?charg\w*|car ?charg\w*|charge ?point|chargepoint|charging station|evse)\b/i;
/** Integrations of cars, which know the battery when the charger does not. */
const CAR_PLATFORMS = /^(tesla_fleet|teslemetry|tessie|tesla_custom|kia_uvo|hyundai\w*|bmw_connected_drive|volkswagencarnet|volkswagen_we_connect_id|myskoda|renault|polestar\w*|volvo\w*|mbapi2020|mercedesmeapi|audiconnect|fordpass|mg_saic|jlrincontrol|porscheconnect|toyota|subaru|stellantis\w*|psa_car_controller|leafspy)$/;

const bad = (s: HassEntity | undefined) => !s || s.state === "unavailable" || s.state === "unknown";

/** A charger's own words for what it is doing, in ours. */
export function evState(raw: string | null | undefined): EvState {
  if (!raw || raw === "unavailable" || raw === "unknown") return "unknown";
  const s = raw.toLowerCase().replace(/[^a-z]+/g, " ").trim();
  if (/fault|error/.test(s)) return "fault";
  if (/approv/.test(s)) return "approval";
  if (/disconnect|unplug|not connected|no (car|vehicle|ev)\b|^(available|idle|ready|off)$/.test(s)) return "unplugged";
  if (/not charging|stopped/.test(s)) return "paused";
  if (/charging|boost|divert/.test(s)) return "charging";
  if (/complet|finish|charged|full/.test(s)) return "finished";
  if (/pause|suspend/.test(s)) return "paused";
  if (/connect|plug|wait|pending|schedul|ready|prepar|occupied|^on$/.test(s)) return "plugged";
  return "unknown";
}

/** The entities of each device, and the integration it comes from. */
function byDevice(hass: Hass): Map<string, { ids: string[]; platform: string }> {
  const out = new Map<string, { ids: string[]; platform: string }>();
  for (const e of Object.values(hass.entities ?? {})) {
    if (!e.device_id || !hass.states[e.entity_id]) continue;
    let d = out.get(e.device_id);
    if (!d) out.set(e.device_id, (d = { ids: [], platform: e.platform ?? "" }));
    d.ids.push(e.entity_id);
  }
  return out;
}

function deviceText(hass: Hass, dev: string): string {
  const d = hass.devices?.[dev];
  return d ? `${d.manufacturer ?? ""} ${d.model ?? ""} ${d.name_by_user ?? ""} ${d.name ?? ""}` : "";
}

/** A charger's entities, picked from its device's. */
function fromDevice(hass: Hass, dev: string | null, ids: string[]): EvCharger {
  const st = (id: string) => hass.states[id];
  const d = dev ? hass.devices?.[dev] : undefined;
  // names are read without the device's own ("sensor.ohme_home_pro_power" is "power", not a home's)
  const slug = String(d?.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const tail = (id: string) => {
    const o = id.slice(id.indexOf(".") + 1);
    return slug && o.startsWith(`${slug}_`) ? o.slice(slug.length + 1) : o;
  };
  const of = (domain: string | string[], test: (name: string, s: HassEntity, id: string) => boolean) =>
    ids.find((id) => [domain].flat().includes(domainOf(id)) && test(tail(id), st(id), id)) ?? null;
  const power = ids
    .filter((id) => isPower(st(id)) && !/max|min|limit|avail|offer|grid|generation|solar|pv|house|home|import|export|target|set_?point|budget/.test(tail(id)))
    .sort((a, b) => Number(/charg/.test(tail(b))) - Number(/charg/.test(tail(a))))[0] ?? null;
  const plug = of(["binary_sensor", "sensor"], (n, s) => s.attributes.device_class === "plug" || /plug|cable_connected|(car|vehicle|ev)_connected/.test(n));
  return {
    device: dev,
    name: d?.name_by_user || d?.name || t("ev.defaultName"),
    power,
    plug,
    status: of("sensor", (n, s, id) => id !== plug && /status|state/.test(n) && !s.attributes.unit_of_measurement && !/state_of_charge|soc|wifi|signal|rssi|firmware|update|lock|connection|error_code/.test(n)),
    level: of("sensor", (n, s) => s.attributes.device_class === "battery" && s.attributes.unit_of_measurement === "%" && !/min|max|target|limit|reserve/.test(n)),
    target: of("number", (n, s) => s.attributes.unit_of_measurement === "%" && /target|limit|charge_level/.test(n) && !/min|precondition/.test(n)),
    targetTime: of("time", (n) => /target|ready|departure|finish/.test(n)),
    mode: of("select", (n) => /mode/.test(n) && !/vehicle|car/.test(n)),
    approve: of("button", (n) => /approve/.test(n)),
    vehicle: of("select", (n) => /vehicle|car_model/.test(n)),
    slots: of("sensor", (n) => /slot/.test(n)),
    energy: of("sensor", (_n, s) => s.attributes.device_class === "energy" && /total/.test(String(s.attributes.state_class ?? ""))),
  };
}

const usable = (c: EvCharger) => !!(c.power || c.status || c.plug || c.level);

/**
 * The house's chargers: the plan's (its power sensor's device), else every device that is a
 * charger, with the energy settings' statistic for a device where it has one.
 */
export function findChargers(hass: Hass, prefs: { device_consumption?: { stat_consumption?: string | null }[] } | null, set: EnergySettings | null | undefined, avoid: Set<string> = new Set()): EvCharger[] {
  if (set?.ev_enabled === false) return [];
  const devices = byDevice(hass);
  let list: EvCharger[] = [];
  if (set?.ev_charger) {
    const dev = hass.entities?.[set.ev_charger]?.device_id ?? null;
    list = [{ ...fromDevice(hass, dev, dev ? devices.get(dev)?.ids ?? [] : []), power: set.ev_charger }];
  } else {
    for (const [dev, d] of devices) {
      if (!PLATFORMS.test(d.platform) && !WORDS.test(deviceText(hass, dev))) continue;
      const c = fromDevice(hass, dev, d.ids);
      if (usable(c)) list.push(c);
    }
    // an energy statistic the energy settings list as a device, and that is a charger's
    for (const s of prefs?.device_consumption ?? []) {
      const id = s.stat_consumption;
      if (!id) continue;
      const dev = hass.entities?.[id]?.device_id ?? null;
      const known = list.find((c) => c.device && c.device === dev);
      const label = String(hass.states[id]?.attributes.friendly_name ?? "");
      if (known) known.energy = id;
      else if (WORDS.test(`${id.replace(/[._]/g, " ")} ${label} ${dev ? deviceText(hass, dev) : ""}`)) {
        const c = fromDevice(hass, dev, dev ? devices.get(dev)?.ids ?? [] : []);
        list.push({ ...c, energy: id, name: dev ? c.name : label || c.name });
      }
    }
  }
  if (set?.ev_level) {
    if (!list.length) list.push(fromDevice(hass, null, []));
    list[0].level = set.ev_level;
  }
  // the car's own integration, when the charger does not know the battery (one car only)
  if (list.length === 1 && !list[0].level) list[0].level = carLevel(hass, devices, avoid);
  return list;
}

function carLevel(hass: Hass, devices: Map<string, { ids: string[]; platform: string }>, avoid: Set<string>): string | null {
  const found: string[] = [];
  for (const [dev, d] of devices) {
    if (!CAR_PLATFORMS.test(d.platform) || /powerwall|energy site|gateway|wall connector/i.test(deviceText(hass, dev))) continue;
    const levels = d.ids.filter((id) => {
      const s = hass.states[id];
      return domainOf(id) === "sensor" && !avoid.has(id) && s.attributes.device_class === "battery" && s.attributes.unit_of_measurement === "%" &&
        !/min|max|target|limit|key|fob|12v|aux|tpms|tire|tyre|phone|reserve/.test(id);
    });
    const best = levels.find((id) => /soc|state_of_charge|ev_battery|battery_level|charge_level/.test(id)) ?? levels[0];
    if (best) found.push(best);
  }
  return found.length === 1 ? found[0] : null;
}

/** Every entity a charger's readings come from (to spot changes). */
export function chargerEntities(c: EvCharger): string[] {
  return [c.power, c.status, c.plug, c.level, c.target, c.targetTime, c.mode, c.approve, c.vehicle, c.slots].filter((x): x is string => !!x);
}

/** "Nissan LEAF (2015-2018)" reads better as "Nissan LEAF". */
const carName = (s: string) => s.replace(/\s*\([^)]*\)\s*/g, " ").trim();

export function readEv(hass: Hass, c: EvCharger): EvNow {
  const s = (id: string | null) => (id ? hass.states[id] : undefined);
  const num = (id: string | null) => {
    const v = parseFloat(s(id)?.state ?? "");
    return isFinite(v) ? v : null;
  };
  const power = kw(hass, c.power);
  let state = evState(s(c.status)?.state);
  const plug = s(c.plug);
  if (!bad(plug)) {
    const plugged = domainOf(plug!.entity_id) === "binary_sensor" ? plug!.state === "on" : !["unplugged", "unknown"].includes(evState(plug!.state));
    if (!plugged) state = "unplugged";
    else if (state === "unknown" || state === "unplugged") state = "plugged";
  }
  // a charger drawing power is charging, whatever its words
  if ((state === "unknown" || state === "plugged") && (power ?? 0) > 0.1) state = "charging";
  const mode = s(c.mode);
  const vehicle = s(c.vehicle);
  const slots = s(c.slots);
  const time = s(c.targetTime);
  return {
    name: !bad(vehicle) && vehicle!.state.trim() ? carName(vehicle!.state) : c.name,
    state,
    power,
    level: num(c.level),
    target: num(c.target),
    by: !bad(time) && /^\d\d:\d\d/.test(time!.state) ? time!.state.slice(0, 5) : null,
    mode: bad(mode) ? null : mode!.state,
    modes: !bad(mode) && Array.isArray(mode!.attributes.options) ? mode!.attributes.options.map(String) : [],
    // a button that was never pressed reads "unknown"
    canApprove: state === "approval" && !!s(c.approve) && s(c.approve)!.state !== "unavailable",
    slots: !bad(slots) && slots!.state.trim() ? slots!.state.trim() : null,
  };
}

/** "smart_charge" as "Smart charge". */
export function modeName(option: string): string {
  const t = option.replace(/_/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
