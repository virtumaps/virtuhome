// Links to Home Assistant entities: every place the plan names one, which of them are gone, and
// what replaced them. The plan keeps each linked entity's registry id and device id (`plan.links`),
// so an entity renamed in Home Assistant is followed by itself; for the rest a replacement is
// proposed: the same registry id (renamed) > the same device > the same area, each with a like name.
import { areaOf, domainOf, type Hass } from "../live/hass";
import { furnitureName } from "../scene/furniture-lib";
import { pointInPolygon } from "./geom";
import { spaces, type EnergySettings, type EntityLink, type Plan } from "./plan";
import { t } from "../i18n";

/** One place the plan names an entity. */
export interface Use {
  entity: string;
  /** What it links, for people: "Light in Kitchen". */
  label: string;
  /** The Home Assistant area of the room it is in, when it is in one. */
  area: string | null;
  /** A device marker: it goes from the plan with its link. */
  device: boolean;
}

/** A linked entity that Home Assistant no longer has, and everywhere the plan uses it. */
export interface Missing {
  entity: string;
  uses: Use[];
}

/** A likely replacement for a missing entity: 1 is certain (renamed), lower is less sure. */
export interface Proposal {
  entity: string;
  score: number;
  why: "renamed" | "same device" | "same area" | "same name";
}

/** An entry of Home Assistant's entity registry (config/entity_registry/list). */
export interface RegistryEntry {
  /** Stays the same when the entity id is changed. */
  id: string;
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
  name?: string | null;
  original_name?: string | null;
  platform?: string;
  disabled_by?: string | null;
  entity_category?: string | null;
}

/** The energy settings that name a sensor, besides solar (each labelled links.energy.<setting>). */
const ENERGY_SENSORS = [
  "home", "battery", "battery_charge", "battery_discharge", "battery_level", "grid", "grid_import", "grid_export", "price_import", "price_export",
  "ev_charger", "ev_level",
] as const satisfies readonly (keyof EnergySettings)[];

/** Device markers' kinds by domain (each labelled links.device.<domain>; others are a Device). */
const DEVICE_DOMAINS = [
  "light", "camera", "binary_sensor", "sensor", "climate", "media_player", "switch", "cover", "lock", "fan", "vacuum", "alarm_control_panel",
  "assist_satellite", "water_heater", "humidifier",
] as const;
const OPENING_KINDS = ["door", "window", "passage", "garage"] as const;

export const isEntityId = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9_]+\.[a-z0-9_]+$/.test(v);

/** Visits every entity the plan names, with a way to change it (null unlinks it, or removes a device marker). */
function walk(plan: Plan, visit: (use: Use, set: (to: string | null) => void) => void): void {
  plan.floors.forEach((f) => {
    const sp = spaces(f);
    const at = (x: number, z: number) => sp.find((s) => pointInPolygon([x, z], s.points)) ?? null;
    // "Light in Kitchen", else "Light on Ground Floor"
    const where = (what: string, room: string | null | undefined) => (room ? t("links.in", { what, room }) : t("links.on", { what, floor: f.name }));
    for (const r of f.rooms) {
      for (const k of ["temperature", "humidity"] as const) {
        const e = r[k];
        if (isEntityId(e)) visit({ entity: e, label: t(`links.${k}`, { room: r.name }), area: r.area_id, device: false }, (to) => (r[k] = to));
      }
    }
    for (const s of [...f.rooms, ...(f.outdoor ?? [])]) {
      const label = s.label;
      if (!label) continue;
      label.forEach((e, i) => {
        if (isEntityId(e)) visit({ entity: e, label: t("links.label", { room: s.name }), area: s.area_id, device: false }, (to) => (label[i] = to ?? ""));
      });
      // what was unlinked leaves the label
      if (label.includes("")) s.label = label.filter(Boolean);
    }
    for (const o of f.openings) {
      const room = f.rooms.find((r) => r.id === o.room_id);
      const kind = OPENING_KINDS.find((k) => k === o.kind) ?? "passage";
      if (isEntityId(o.entity)) visit({ entity: o.entity, label: where(t(`links.sensor.${kind}`), room?.name), area: room?.area_id ?? null, device: false }, (to) => (o.entity = to));
      if (isEntityId(o.cover)) visit({ entity: o.cover, label: where(t("links.blind"), room?.name), area: room?.area_id ?? null, device: false }, (to) => (o.cover = to));
      if (isEntityId(o.lock)) visit({ entity: o.lock, label: where(t("links.lock"), room?.name), area: room?.area_id ?? null, device: false }, (to) => (o.lock = to));
    }
    for (const x of f.furniture) {
      const s = at(x.x, x.z);
      const name = furnitureName(x.type) ?? t("links.furniture");
      if (isEntityId(x.entity)) visit({ entity: x.entity, label: where(name, s?.name), area: s?.area_id ?? null, device: false }, (to) => (x.entity = to));
      // a switch's other gangs (the first is its entity)
      const gangs = x.gangs;
      gangs?.forEach((e, i) => {
        if (i > 0 && isEntityId(e)) visit({ entity: e, label: where(name, s?.name), area: s?.area_id ?? null, device: false }, (to) => (gangs[i] = to));
      });
      // a ceiling fan's light
      if (isEntityId(x.light)) visit({ entity: x.light, label: where(name, s?.name), area: s?.area_id ?? null, device: false }, (to) => (x.light = to));
      if (isEntityId(x.parked)) visit({ entity: x.parked, label: t("links.parked", { name }), area: null, device: false }, (to) => {
        if (to) x.parked = to;
        else delete x.parked;
      });
    }
    const gone = new Set<string>();
    for (const d of f.devices) {
      const s = at(d.x, d.z);
      if (!isEntityId(d.entity)) continue;
      const dom = DEVICE_DOMAINS.find((x) => x === domainOf(d.entity));
      visit({ entity: d.entity, label: where(dom ? t(`links.device.${dom}`) : t("links.device"), s?.name), area: s?.area_id ?? null, device: true }, (to) => {
        if (to) d.entity = to;
        else gone.add(d.id);
      });
    }
    if (gone.size) f.devices = f.devices.filter((d) => !gone.has(d.id));
    for (const roof of f.roofs ?? []) {
      for (const it of roof.items ?? []) {
        const label = t(it.kind === "solar" ? "links.solarSensor" : "links.roofWindowSensor");
        if (isEntityId(it.entity)) visit({ entity: it.entity, label, area: null, device: false }, (to) => (it.entity = to));
        if (isEntityId(it.cover)) visit({ entity: it.cover, label: t("links.roofWindowBlind"), area: null, device: false }, (to) => (it.cover = to));
      }
    }
  });
  const energy = plan.settings.energy as Record<string, unknown> | null | undefined;
  if (energy) {
    const solar = energy.solar;
    if (Array.isArray(solar)) {
      solar.forEach((e, i) => {
        if (isEntityId(e)) visit({ entity: e, label: t("links.energy.solar"), area: null, device: false }, (to) => (solar[i] = to));
      });
      if (solar.some((e) => e === null)) {
        const left = solar.filter((e) => e !== null);
        if (left.length) energy.solar = left;
        else delete energy.solar;
      }
    }
    for (const k of ENERGY_SENSORS) {
      const e = energy[k];
      if (isEntityId(e)) visit({ entity: e, label: t(`links.energy.${k}`), area: null, device: false }, (to) => {
        if (to) energy[k] = to;
        else delete energy[k];
      });
    }
  }
  const chips = plan.settings.chips;
  if (Array.isArray(chips)) {
    chips.forEach((e, i) => {
      if (isEntityId(e)) visit({ entity: e, label: t("links.chip"), area: null, device: false }, (to) => (chips[i] = to ?? ""));
    });
    if (chips.includes("")) plan.settings.chips = chips.filter(Boolean);
  }
  const sky = plan.settings.sky;
  if (sky && isEntityId(sky.weather)) visit({ entity: sky.weather, label: t("links.weather"), area: null, device: false }, (to) => (sky.weather = to));
  const people = plan.settings.presence?.people;
  if (people) {
    for (const [person, tracker] of Object.entries(people)) {
      // the person's own entity can change first: its tracker follows it to the new key
      let key: string | null = person;
      if (isEntityId(person)) visit({ entity: person, label: t("links.person"), area: null, device: false }, (to) => {
        const tracked = people[person];
        delete people[person];
        if (to) people[to] = tracked;
        key = to;
      });
      if (isEntityId(tracker)) visit({ entity: tracker, label: t("links.tracker", { person }), area: null, device: false }, (to) => {
        if (!key) return;
        if (to) people[key] = to;
        else delete people[key];
      });
    }
  }
}

/** Everywhere the plan names an entity. */
export function entityUses(plan: Plan): Use[] {
  const out: Use[] = [];
  walk(plan, (u) => out.push(u));
  return out;
}

/** Home Assistant has the entity: a state, or a registry entry. */
export const entityExists = (hass: Hass, id: string): boolean => !!hass.states[id] || !!hass.entities?.[id];

/** Linked entities Home Assistant no longer has, each with every place it is used. */
export function missingLinks(plan: Plan, hass: Hass): Missing[] {
  const by = new Map<string, Use[]>();
  for (const u of entityUses(plan)) {
    if (entityExists(hass, u.entity)) continue;
    if (!by.has(u.entity)) by.set(u.entity, []);
    by.get(u.entity)!.push(u);
  }
  return [...by].map(([entity, uses]) => ({ entity, uses }));
}

/**
 * Changes an entity everywhere the plan names it (null unlinks it, and removes device markers of it).
 * Its registry ids go with it. Mutates the plan.
 */
export function replaceEntity(plan: Plan, from: string, to: string | null): void {
  walk(plan, (u, set) => {
    if (u.entity === from) set(to);
  });
  const links = plan.links;
  if (links?.[from]) {
    if (to && !links[to]) links[to] = links[from];
    delete links[from];
    if (!Object.keys(links).length) delete plan.links;
  }
}

/** Some missing entity has a registry id kept: the registry would tell where it went. */
export function canFollow(plan: Plan, hass: Hass): boolean {
  return !!plan.links && missingLinks(plan, hass).some((m) => !!plan.links?.[m.entity]?.id);
}

/**
 * Follows entities renamed in Home Assistant: a missing entity whose registry id now has another
 * entity id is changed to it. Mutates the plan; returns what moved, [from, to].
 */
export function followRenames(plan: Plan, hass: Hass, registry: RegistryEntry[]): [string, string][] {
  const byId = new Map(registry.map((e) => [e.id, e]));
  const moved: [string, string][] = [];
  for (const m of missingLinks(plan, hass)) {
    const e = byId.get(plan.links?.[m.entity]?.id ?? "");
    if (!e || e.entity_id === m.entity || e.disabled_by || !entityExists(hass, e.entity_id)) continue;
    replaceEntity(plan, m.entity, e.entity_id);
    moved.push([m.entity, e.entity_id]);
  }
  return moved;
}

/**
 * Keeps the registry id and device id of every linked entity in `plan.links` (with the registry
 * unknown, ids kept before stay). Entities that are missing keep what was kept for them, so they
 * can still be followed. Mutates the plan; returns whether it changed.
 */
export function recordLinks(plan: Plan, hass: Hass, registry: RegistryEntry[] | null): boolean {
  const before = JSON.stringify(plan.links ?? {});
  const reg = registry ? new Map(registry.map((e) => [e.entity_id, e])) : null;
  const old = plan.links ?? {};
  const next: Record<string, EntityLink> = {};
  for (const { entity } of entityUses(plan)) {
    if (next[entity]) continue;
    let link: EntityLink | undefined = old[entity];
    if (entityExists(hass, entity)) {
      const e = reg?.get(entity);
      const id = reg ? e?.id ?? null : old[entity]?.id ?? null;
      const device = hass.entities?.[entity]?.device_id ?? e?.device_id ?? null;
      link = { ...(id ? { id } : {}), ...(device ? { device_id: device } : {}) };
    }
    if (link && (link.id || link.device_id)) next[entity] = link;
  }
  if (Object.keys(next).length) plan.links = next;
  else delete plan.links;
  return JSON.stringify(plan.links ?? {}) !== before;
}

let cache: { key: unknown; list: Promise<RegistryEntry[] | null> } | null = null;
/**
 * Home Assistant's entity registry, with each entity's registry id (the frontend's `hass.entities`
 * leaves it out). Fetched once per registry change; null when it can't be read.
 */
export function entityRegistry(hass: Hass): Promise<RegistryEntry[] | null> {
  const key = hass.entities;
  if (cache && cache.key === key) return cache.list;
  const list = hass.callWS<RegistryEntry[]>({ type: "config/entity_registry/list" }).then((l) => (Array.isArray(l) ? l : null), () => null);
  cache = { key, list };
  return list;
}

/** Words of a name or an entity id ("light.kitchen_ceiling_2" -> kitchen, ceiling). */
function words(s: string, entityId = false): string[] {
  let t = s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  if (entityId) t = t.slice(t.indexOf(".") + 1).replace(/_\d+$/, "");
  return t.split(/[^a-z0-9]+/).filter(Boolean);
}

/** How alike two lists of words are: 1 the same words, 0 none alike ("hall" counts most of "hallway"). */
export function nameLikeness(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const like = (x: string, y: string) => (x === y ? 1 : Math.min(x.length, y.length) >= 3 && (x.startsWith(y) || y.startsWith(x)) ? 0.75 : 0);
  const best = (from: string[], to: string[]) => from.reduce((s, x) => s + Math.max(...to.map((y) => like(x, y))), 0);
  return (best(a, b) + best(b, a)) / (a.length + b.length);
}

/**
 * The likely replacement for a missing entity: the entity its registry id has now (renamed), else
 * an entity of the same kind on the same device, in the same area or anywhere, with a like name.
 * Entities already linked elsewhere in the plan are not proposed. Null when nothing is likely.
 */
export function proposeFor(m: Missing, plan: Plan, hass: Hass, registry: RegistryEntry[] | null): Proposal | null {
  const link = plan.links?.[m.entity];
  const reg = registry ?? [];
  if (link?.id) {
    const e = reg.find((x) => x.id === link.id);
    if (e && e.entity_id !== m.entity && !e.disabled_by && entityExists(hass, e.entity_id)) return { entity: e.entity_id, score: 1, why: "renamed" };
  }
  const dom = domainOf(m.entity);
  const used = new Set(entityUses(plan).map((u) => u.entity));
  const regBy = new Map(reg.map((e) => [e.entity_id, e]));
  const areas = new Set(m.uses.map((u) => u.area).filter((a): a is string => !!a));
  const oldArea = link?.device_id ? hass.devices?.[link.device_id]?.area_id : null;
  if (oldArea) areas.add(oldArea);
  const old = words(m.entity, true);
  const candidates = Object.keys(hass.states).filter((id) => domainOf(id) === dom && id !== m.entity && !used.has(id)
    && !hass.entities?.[id]?.entity_category && !regBy.get(id)?.entity_category);
  const onDevice = link?.device_id ? candidates.filter((id) => (hass.entities?.[id]?.device_id ?? regBy.get(id)?.device_id) === link.device_id) : [];
  let best: Proposal | null = null;
  for (const id of candidates) {
    const e = regBy.get(id);
    const names = [words(id, true), words(String(hass.states[id]?.attributes.friendly_name ?? "")), words(e?.name ?? ""), words(e?.original_name ?? "")];
    const like = Math.max(...names.map((n) => nameLikeness(old, n)));
    let p: Proposal | null = null;
    if (onDevice.includes(id) && (like >= 0.34 || onDevice.length === 1)) p = { entity: id, score: 0.6 + 0.35 * like, why: "same device" };
    else if (like >= 0.5 && areas.size && areas.has(areaOf(hass, id) ?? e?.area_id ?? "")) p = { entity: id, score: 0.3 + 0.25 * like, why: "same area" };
    else if (like >= 0.8) p = { entity: id, score: 0.1 + 0.15 * like, why: "same name" };
    if (p && (!best || p.score > best.score)) best = p;
  }
  if (best) best.score = Math.round(best.score * 100) / 100;
  return best;
}
