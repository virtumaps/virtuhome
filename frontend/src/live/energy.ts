// Solar, battery and the grid: which sensors tell what (set in the plan, else found from Home
// Assistant's energy settings), what they read now, how the power flows between them, and today's
// totals from the recorder's statistics.
import type { EnergySettings } from "../model/plan";
import { domainOf, type Hass, type HassEntity } from "./hass";

/** The sensors the house's energy is read from. */
export interface EnergySources {
  solar: string[];
  home: string | null;
  /** Signed: + discharging / importing. */
  battery: string | null;
  grid: string | null;
  /** One sensor each way, both positive. */
  batteryCharge: string | null;
  batteryDischarge: string | null;
  gridImport: string | null;
  gridExport: string | null;
  batteryLevel: string | null;
  priceImport: string | null;
  priceExport: string | null;
  /** Energy statistics (kWh) of the energy dashboard, for today's totals. */
  stats: EnergyStats;
}

export interface EnergyStats {
  solar: string[];
  gridIn: string[];
  gridOut: string[];
  batteryIn: string[];
  batteryOut: string[];
}

/** Power between the sources and the house now (kW, all positive). */
export interface Flows {
  solarToHome: number;
  solarToBattery: number;
  solarToGrid: number;
  gridToHome: number;
  gridToBattery: number;
  batteryToHome: number;
  batteryToGrid: number;
}

export interface Price {
  /** Per kWh, in the currency's main unit. */
  value: number;
  currency: string;
}

/** What the sensors read now. Power in kW; null where there is no sensor or no reading. */
export interface EnergyNow {
  solar: number | null;
  home: number | null;
  /** + discharging, − charging. */
  battery: number | null;
  batteryLevel: number | null;
  /** + importing, − exporting. */
  grid: number | null;
  /** The house's use was worked out from the others (no sensor of its own). */
  homeComputed: boolean;
  priceImport: Price | null;
  priceExport: Price | null;
  flows: Flows;
}

/** Today's energy (kWh), from midnight. */
export interface EnergyToday {
  solar: number | null;
  gridIn: number | null;
  gridOut: number | null;
  batteryIn: number | null;
  batteryOut: number | null;
  home: number | null;
}

/** The parts of Home Assistant's energy settings (energy/get_prefs) this reads. */
export interface EnergyPrefs {
  energy_sources?: {
    type: string;
    stat_energy_from?: string | null;
    stat_energy_to?: string | null;
    stat_rate?: string | null;
    flow_from?: { stat_energy_from?: string | null; entity_energy_price?: string | null }[];
    flow_to?: { stat_energy_to?: string | null; entity_energy_price?: string | null }[];
  }[];
}

const none = (): EnergySources => ({
  solar: [], home: null, battery: null, grid: null, batteryCharge: null, batteryDischarge: null, gridImport: null,
  gridExport: null, batteryLevel: null, priceImport: null, priceExport: null,
  stats: { solar: [], gridIn: [], gridOut: [], batteryIn: [], batteryOut: [] },
});

/** Words that say what kind of reading a sensor is, not what it measures. */
const STOP = new Set(["energy", "total", "today", "power", "kwh", "kw", "w", "daily", "sum", "summation", "delivered", "lifetime", "meter", "sensor", "value"]);

function tokens(id: string): Set<string> {
  return new Set(id.slice(id.indexOf(".") + 1).split(/[_\W]+/).filter((t) => t && !STOP.has(t)));
}

/** How alike two sensors' names are (0..1). */
function likeness(a: string, b: string): number {
  const A = tokens(a), B = tokens(b);
  let both = 0;
  for (const t of A) if (B.has(t)) both++;
  const any = A.size + B.size - both;
  return any ? both / any : 0;
}

const isPower = (s: HassEntity | undefined) =>
  !!s && domainOf(s.entity_id) === "sensor" && s.attributes.device_class === "power" && /^(m|k|M|G)?W$/.test(String(s.attributes.unit_of_measurement ?? ""));

/** The power sensors of an entity's device (all of them when it has none). */
function powerSensorsNear(hass: Hass, entityId: string): string[] {
  const dev = hass.entities?.[entityId]?.device_id;
  if (!dev) return [];
  return Object.values(hass.entities ?? {})
    .filter((e) => e.device_id === dev && isPower(hass.states[e.entity_id]))
    .map((e) => e.entity_id);
}

/** The power sensor that goes with an energy sensor: same device, most alike name. */
export function powerFor(hass: Hass, energyId: string | null | undefined, avoid: Set<string> = new Set()): string | null {
  if (!energyId) return null;
  let best: string | null = null;
  let score = 0;
  for (const id of powerSensorsNear(hass, energyId)) {
    if (avoid.has(id)) continue;
    const s = likeness(energyId, id);
    if (s > score) {
      score = s;
      best = id;
    }
  }
  return score >= 0.5 ? best : null;
}

/**
 * The sensors to read: what the plan names, and the rest found from the energy settings (the
 * power sensors next to its energy sensors) or, without those, from the sensors' names.
 */
export function findSources(hass: Hass, prefs: EnergyPrefs | null, set: EnergySettings | null | undefined): EnergySources {
  const src = none();
  const used = new Set<string>();
  const take = (id: string | null) => {
    if (id) used.add(id);
    return id;
  };
  const near = new Set<string>();
  for (const s of prefs?.energy_sources ?? []) {
    if (s.type === "solar" && s.stat_energy_from) {
      src.stats.solar.push(s.stat_energy_from);
      const p = isPower(hass.states[s.stat_rate ?? ""]) ? s.stat_rate! : powerFor(hass, s.stat_energy_from, used);
      if (p && !src.solar.includes(p)) src.solar.push(take(p)!);
      for (const id of powerSensorsNear(hass, s.stat_energy_from)) near.add(id);
    } else if (s.type === "battery") {
      if (s.stat_energy_to) src.stats.batteryIn.push(s.stat_energy_to);
      if (s.stat_energy_from) src.stats.batteryOut.push(s.stat_energy_from);
      if (isPower(hass.states[s.stat_rate ?? ""])) src.battery ??= take(s.stat_rate!);
      src.batteryCharge ??= take(powerFor(hass, s.stat_energy_to, used));
      src.batteryDischarge ??= take(powerFor(hass, s.stat_energy_from, used));
      for (const id of powerSensorsNear(hass, s.stat_energy_from ?? s.stat_energy_to ?? "")) near.add(id);
      src.batteryLevel ??= batteryLevelNear(hass, s.stat_energy_from ?? s.stat_energy_to ?? "");
    } else if (s.type === "grid") {
      if (isPower(hass.states[s.stat_rate ?? ""])) src.grid ??= take(s.stat_rate!);
      for (const f of s.flow_from ?? []) {
        if (!f.stat_energy_from) continue;
        src.stats.gridIn.push(f.stat_energy_from);
        src.gridImport ??= take(powerFor(hass, f.stat_energy_from, used));
        src.priceImport ??= f.entity_energy_price ?? null;
        for (const id of powerSensorsNear(hass, f.stat_energy_from)) near.add(id);
      }
      for (const f of s.flow_to ?? []) {
        if (!f.stat_energy_to) continue;
        src.stats.gridOut.push(f.stat_energy_to);
        src.gridExport ??= take(powerFor(hass, f.stat_energy_to, used));
        src.priceExport ??= f.entity_energy_price ?? null;
      }
    }
  }
  // the house's own use: a "load" sensor next to the inverter or the meter
  const homeLike = /load|house|home|consumption_power|household/;
  const notHome = /grid|battery|bat_|pv|solar|feed|export|import|ct\d?|meter|inverter_power|rpower/;
  src.home = [...near].find((id) => !used.has(id) && homeLike.test(id) && !notHome.test(id.replace(/^sensor\.[a-z0-9]+_inverter_/, ""))) ?? null;

  if (!prefs?.energy_sources?.length) byName(hass, src);
  src.priceImport ??= priceSensor(hass, false);
  src.priceExport ??= priceSensor(hass, true);

  // what the plan says wins
  if (set) {
    if (set.solar?.length) src.solar = [...set.solar];
    const pick = <K extends keyof EnergySources>(k: K, v: string | null | undefined) => {
      if (v) (src as unknown as Record<string, unknown>)[k] = v;
    };
    pick("home", set.home);
    pick("battery", set.battery);
    pick("batteryCharge", set.battery_charge);
    pick("batteryDischarge", set.battery_discharge);
    pick("batteryLevel", set.battery_level);
    pick("grid", set.grid);
    pick("gridImport", set.grid_import);
    pick("gridExport", set.grid_export);
    pick("priceImport", set.price_import);
    pick("priceExport", set.price_export);
    if (set.battery) src.batteryCharge = src.batteryDischarge = null;
    if (set.grid) src.gridImport = src.gridExport = null;
  }
  // one signed sensor or two one-way ones, not both
  if (src.battery && (src.batteryCharge || src.batteryDischarge)) src.battery = null;
  if (src.grid && (src.gridImport || src.gridExport)) src.grid = null;
  return src;
}

function batteryLevelNear(hass: Hass, entityId: string): string | null {
  const dev = hass.entities?.[entityId]?.device_id;
  if (!dev) return null;
  return Object.values(hass.entities ?? {})
    .filter((e) => e.device_id === dev && domainOf(e.entity_id) === "sensor")
    .map((e) => e.entity_id)
    .find((id) => {
      const s = hass.states[id];
      return s?.attributes.device_class === "battery" && s.attributes.unit_of_measurement === "%" && !/min|max|soh|health|on_grid|reserve|cutoff/.test(id);
    }) ?? null;
}

/** Without energy settings: power sensors whose names say what they are. */
function byName(hass: Hass, src: EnergySources): void {
  const power = Object.keys(hass.states).filter((id) => isPower(hass.states[id]));
  const find = (re: RegExp, not?: RegExp) => power.find((id) => re.test(id) && !(not && not.test(id))) ?? null;
  if (!src.solar.length) {
    const total = find(/(^|[._])(pv|solar)_(total_)?power(_|$)|solar_production/, /pv\d|string|forecast|energy/);
    if (total) src.solar = [total];
  }
  src.home ??= find(/(house|home|load)_(power|consumption)$|load_power$/);
  src.gridImport ??= find(/grid_(import|consumption)(_power)?$/);
  src.gridExport ??= find(/grid_export(_power)?$|feed_in(_power)?$/);
  if (!src.gridImport && !src.gridExport) src.grid ??= find(/grid_power$/);
  src.batteryCharge ??= find(/battery_charge(_power)?$/);
  src.batteryDischarge ??= find(/battery_discharge(_power)?$/);
  if (!src.batteryCharge && !src.batteryDischarge) src.battery ??= find(/battery_power$/);
  // every phone and sensor has a battery level: only the home battery's own device counts
  const bat = src.battery ?? src.batteryCharge ?? src.batteryDischarge;
  if (bat) src.batteryLevel ??= batteryLevelNear(hass, bat);
}

/** A tariff's current price per kWh (Octopus: …_current_rate; …_export_current_rate). */
function priceSensor(hass: Hass, exp: boolean): string | null {
  return Object.keys(hass.states).find((id) => {
    if (domainOf(id) !== "sensor" || !/\/kWh$/i.test(String(hass.states[id].attributes.unit_of_measurement ?? ""))) return false;
    if (/gas|previous|next|standing/.test(id)) return false;
    return /current_rate|current_price|electricity_price/.test(id) && /export|feed_in|outgoing/.test(id) === exp;
  }) ?? null;
}

/** A power sensor's reading in kW, or null. */
export function kw(hass: Hass, id: string | null): number | null {
  const s = id ? hass.states[id] : undefined;
  if (!s) return null;
  const v = parseFloat(s.state);
  if (!isFinite(v)) return null;
  const unit = String(s.attributes.unit_of_measurement ?? "kW");
  const k = unit === "W" ? 1e-3 : unit === "mW" ? 1e-6 : unit === "MW" ? 1e3 : unit === "GW" ? 1e6 : 1;
  return v * k;
}

function price(hass: Hass, id: string | null): Price | null {
  const s = id ? hass.states[id] : undefined;
  if (!s) return null;
  const v = parseFloat(s.state);
  if (!isFinite(v)) return null;
  const unit = String(s.attributes.unit_of_measurement ?? "");
  return { value: /^p\//i.test(unit) ? v / 100 : v, currency: unit.split("/")[0].replace(/^p$/i, "GBP") || "" };
}

/** How the power flows between solar, battery, grid and the house (the usual split). */
export function flows(solar: number, battery: number, grid: number): Flows {
  const charge = Math.max(0, -battery), discharge = Math.max(0, battery);
  const imp = Math.max(0, grid), exp = Math.max(0, -grid);
  solar = Math.max(0, solar);
  const solarToGrid = Math.min(exp, solar);
  const solarToBattery = Math.min(charge, solar - solarToGrid);
  const solarToHome = Math.max(0, solar - solarToGrid - solarToBattery);
  const batteryToGrid = Math.min(discharge, Math.max(0, exp - solarToGrid));
  const batteryToHome = Math.max(0, discharge - batteryToGrid);
  const gridToBattery = Math.min(imp, Math.max(0, charge - solarToBattery));
  const gridToHome = Math.max(0, imp - gridToBattery);
  return { solarToHome, solarToBattery, solarToGrid, gridToHome, gridToBattery, batteryToHome, batteryToGrid };
}

/** Readings of the sources now. */
export function readNow(hass: Hass, src: EnergySources): EnergyNow {
  const sum = (ids: string[]) => {
    const v = ids.map((id) => kw(hass, id)).filter((x): x is number => x !== null);
    return v.length ? v.reduce((a, b) => a + b, 0) : null;
  };
  const solar = sum(src.solar);
  const signed = (one: string | null, plus: string | null, minus: string | null) => {
    if (one) return kw(hass, one);
    const p = kw(hass, plus), m = kw(hass, minus);
    return p === null && m === null ? null : (p ?? 0) - (m ?? 0);
  };
  const battery = signed(src.battery, src.batteryDischarge, src.batteryCharge);
  const grid = signed(src.grid, src.gridImport, src.gridExport);
  let home = kw(hass, src.home);
  const homeComputed = home === null && (solar !== null || grid !== null);
  if (home === null && homeComputed) home = Math.max(0, (solar ?? 0) + (battery ?? 0) + (grid ?? 0));
  const lvl = src.batteryLevel ? parseFloat(hass.states[src.batteryLevel]?.state ?? "") : NaN;
  return {
    solar, home, battery, grid, homeComputed,
    batteryLevel: isFinite(lvl) ? lvl : null,
    priceImport: price(hass, src.priceImport),
    priceExport: price(hass, src.priceExport),
    flows: flows(solar ?? 0, battery ?? 0, grid ?? 0),
  };
}

export function hasEnergy(src: EnergySources): boolean {
  return !!(src.solar.length || src.home || src.battery || src.batteryCharge || src.batteryDischarge || src.grid || src.gridImport || src.gridExport);
}

/** Every entity the readings come from (to spot changes). */
export function sourceEntities(src: EnergySources): string[] {
  return [
    ...src.solar, src.home, src.battery, src.grid, src.batteryCharge, src.batteryDischarge, src.gridImport,
    src.gridExport, src.batteryLevel, src.priceImport, src.priceExport,
  ].filter((x): x is string => !!x);
}

/** kW as people read it: "640 W", "2.4 kW". */
export function formatPower(v: number | null): string {
  if (v === null) return "—";
  const a = Math.abs(v);
  if (a < 0.0005) return "0 W";
  if (a < 1) return `${Math.round(a * 1000)} W`;
  return `${a.toFixed(a < 10 ? 1 : 0)} kW`;
}

export function formatEnergy(v: number | null): string {
  if (v === null) return "—";
  return `${v.toFixed(v < 10 ? 1 : 0)} kWh`;
}

const SYMBOL: Record<string, string> = { GBP: "£", EUR: "€", USD: "$", AUD: "$", CAD: "$", NZD: "$", CHF: "CHF ", SEK: "kr ", NOK: "kr ", DKK: "kr " };

/** A price per kWh: "24.5p" in pounds, "€0.245" otherwise. */
export function formatPrice(p: Price | null): string {
  if (!p) return "—";
  if (p.currency === "GBP") return `${(p.value * 100).toFixed(1)}p`;
  return `${SYMBOL[p.currency] ?? (p.currency ? `${p.currency} ` : "")}${p.value.toFixed(3)}`;
}

/** Money per hour at a price: "£0.35/h". */
export function formatRate(kwNow: number, p: Price | null): string | null {
  if (!p) return null;
  const v = kwNow * p.value;
  const sym = SYMBOL[p.currency] ?? (p.currency ? `${p.currency} ` : "");
  return p.currency === "GBP" && v < 1 ? `${(v * 100).toFixed(v < 0.1 ? 1 : 0)}p/h` : `${sym}${v.toFixed(2)}/h`;
}

/** Today's totals from the recorder: the change of each energy statistic since midnight. */
export async function readToday(hass: Hass, stats: EnergyStats): Promise<EnergyToday> {
  const change = async (ids: string[]): Promise<number | null> => {
    if (!ids.length) return null;
    const v = await Promise.all(ids.map((id) =>
      hass.callWS<{ change?: number | null }>({
        type: "recorder/statistic_during_period", statistic_id: id, calendar: { period: "day" }, types: ["change"], units: { energy: "kWh" },
      }).then((r) => (typeof r.change === "number" ? r.change : null)).catch(() => null)));
    const ok = v.filter((x): x is number => x !== null);
    return ok.length ? ok.reduce((a, b) => a + b, 0) : null;
  };
  const [solar, gridIn, gridOut, batteryIn, batteryOut] = await Promise.all([
    change(stats.solar), change(stats.gridIn), change(stats.gridOut), change(stats.batteryIn), change(stats.batteryOut),
  ]);
  const parts = [solar, gridIn, gridOut, batteryIn, batteryOut];
  const home = parts.some((x) => x !== null)
    ? Math.max(0, (solar ?? 0) + (gridIn ?? 0) - (gridOut ?? 0) + (batteryOut ?? 0) - (batteryIn ?? 0))
    : null;
  return { solar, gridIn, gridOut, batteryIn, batteryOut, home };
}

/**
 * The house's energy for a view: finds the sensors once the registry is there, then reports when
 * a reading changed. Home Assistant replaces a state object when it changes, so that is an
 * identity check over a dozen entities.
 */
export class EnergyLive {
  sources: EnergySources = none();
  now: EnergyNow | null = null;
  today: EnergyToday | null = null;
  private prefs: EnergyPrefs | null = null;
  private prefsAsked = false;
  private regRef: unknown = null;
  private settings: EnergySettings | null | undefined;
  private seen = new Map<string, HassEntity | undefined>();
  private hass: Hass | null = null;
  private todayAt = 0;
  private todayLoading: Promise<void> | null = null;
  /** Called when the sources were found again (the energy settings arrived, the plan changed). */
  onSources: (() => void) | null = null;

  setSettings(s: EnergySettings | null | undefined): void {
    this.settings = s;
    this.regRef = null;
  }

  get enabled(): boolean {
    return this.settings?.enabled !== false && hasEnergy(this.sources);
  }

  /** Takes a new hass object; true when a reading changed. */
  update(hass: Hass): boolean {
    this.hass = hass;
    if (!this.prefsAsked && hass.connection) {
      this.prefsAsked = true;
      hass.callWS<EnergyPrefs>({ type: "energy/get_prefs" })
        .then((p) => {
          this.prefs = p;
          this.regRef = null;
          if (this.hass) this.update(this.hass);
          this.onSources?.();
        })
        .catch(() => undefined);
    }
    if (this.regRef !== hass.entities && Object.keys(hass.states).length) {
      this.regRef = hass.entities;
      this.sources = findSources(hass, this.prefs, this.settings);
      this.seen.clear();
      this.todayAt = 0;
    }
    let changed = !this.now;
    for (const id of sourceEntities(this.sources)) {
      const s = hass.states[id];
      if (s !== this.seen.get(id)) {
        this.seen.set(id, s);
        changed = true;
      }
    }
    if (changed) this.now = readNow(hass, this.sources);
    return changed;
  }

  /** The sources found without the plan's choices (what "Automatic" stands for in the editor). */
  automatic(): EnergySources {
    return this.hass ? findSources(this.hass, this.prefs, null) : none();
  }

  /** Today's totals, fetched again when older than five minutes. */
  refreshToday(force = false): Promise<void> {
    const hass = this.hass;
    if (!hass || !hass.connection) return Promise.resolve();
    if (!force && Date.now() - this.todayAt < 300_000) return this.todayLoading ?? Promise.resolve();
    this.todayAt = Date.now();
    this.todayLoading = readToday(hass, this.sources.stats).then((t) => {
      this.today = t;
    }).catch(() => undefined).finally(() => {
      this.todayLoading = null;
    });
    return this.todayLoading;
  }

  /** What the panels make at most (kW): the plan's figure, else the best seen (at least 3 kW). */
  solarPeak(): number {
    this.peakSeen = Math.max(this.peakSeen, this.now?.solar ?? 0);
    return this.settings?.solar_peak || Math.max(3, this.peakSeen);
  }
  private peakSeen = 0;

  /** How brightly the panels shine: 0..1 of their peak. */
  solarLevel(): number {
    const v = this.now?.solar ?? 0;
    return v > 0 ? Math.min(1, v / this.solarPeak()) : 0;
  }
}
