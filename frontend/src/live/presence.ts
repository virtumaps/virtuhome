// Who is in which room. Room-level trackers say which area a phone, watch or tag is in: Bermuda's
// Area sensor (its area_id outright), ESPresense through mqtt_room or the ESPresense Companion's
// trackers (a room's name). The plan's rooms are linked to areas, so the name finds the room.
import { spaces, type Plan, type PresenceSettings } from "../model/plan";
import { domainOf, type Hass, type HassEntity } from "./hass";

/** States that say nothing about a room. */
const NOT_A_ROOM = new Set(["home", "not_home", "away", "unknown", "unavailable", "none", ""]);

/** "Living Room", "living_room", "living-room" and "Kadir’s" / "Kadir's" read the same. */
export const slug = (s: string): string =>
  s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const nameOf = (hass: Hass, id: string) => String(hass.states[id]?.attributes.friendly_name ?? id.slice(id.indexOf(".") + 1));

/** Bermuda's Area sensor of a device (not its Area Last Seen, Floor or Distance, which carry the same attributes). */
function isBermudaArea(hass: Hass, id: string): boolean {
  if (domainOf(id) !== "sensor" || hass.entities?.[id]?.platform !== "bermuda") return false;
  const name = nameOf(hass, id);
  return (/_area$/.test(id) || / area$/i.test(name)) && !/last.?seen/i.test(`${id} ${name}`);
}

/** Areas by their id, name and aliases as slugs (made again only when the areas change). */
const areaSlugs = new WeakMap<object, Map<string, string>>();
function areaIndex(hass: Hass): Map<string, string> {
  const areas = hass.areas ?? {};
  let m = areaSlugs.get(areas);
  if (!m) {
    m = new Map();
    for (const a of Object.values(areas)) {
      for (const k of [a.area_id, slug(a.name), ...(a.aliases ?? []).map(slug)]) if (k && !m.has(k)) m.set(k, a.area_id);
    }
    areaSlugs.set(areas, m);
  }
  return m;
}

/** The Home Assistant area a tracker's state names, if it names one. */
export function areaNamed(hass: Hass, s: HassEntity | undefined): string | null {
  if (!s || NOT_A_ROOM.has(s.state.toLowerCase())) return null;
  const id = s.attributes.area_id;
  if (typeof id === "string" && hass.areas?.[id]) return id;
  return areaIndex(hass).get(slug(s.state)) ?? null;
}

/**
 * The room (or garden area) of the plan a tracker puts someone in: the room linked to the area it
 * names (with an area on two storeys, the one on the area's floor), else a room of that name.
 */
export function roomOf(plan: Plan, hass: Hass, s: HassEntity | undefined): { floor: number; room: number } | null {
  if (!s || NOT_A_ROOM.has(s.state.toLowerCase())) return null;
  const area = areaNamed(hass, s);
  const onFloor = area ? hass.areas?.[area]?.floor_id ?? null : null;
  const names = [slug(s.state), ...(area ? [slug(hass.areas![area].name)] : [])];
  let byArea: { floor: number; room: number } | null = null;
  let byName: { floor: number; room: number } | null = null;
  plan.floors.forEach((f, fi) => spaces(f).forEach((sp, ri) => {
    if (area && sp.area_id === area) {
      if (!byArea || (onFloor && f.ha_floor === onFloor && plan.floors[byArea.floor].ha_floor !== onFloor)) byArea = { floor: fi, room: ri };
    } else if (!byName && names.includes(slug(sp.name))) byName = { floor: fi, room: ri };
  }));
  return byArea ?? byName;
}

/** Entities that can say which room someone is in (the editor offers these). */
export function roomTrackers(hass: Hass): string[] {
  return Object.keys(hass.states).filter((id) => {
    const dom = domainOf(id);
    if (dom !== "sensor" && dom !== "device_tracker") return false;
    const platform = hass.entities?.[id]?.platform;
    if (platform === "bermuda") return isBermudaArea(hass, id);
    if (platform === "mqtt_room") return true;
    // ESPresense Companion's trackers, and others whose state is a room now
    return areaNamed(hass, hass.states[id]) !== null;
  }).sort();
}

/**
 * Where a person's room comes from, best first: the tracker picked in the plan; else their own
 * trackers that name rooms (ESPresense Companion), Bermuda's Area sensor on the device of one of
 * their trackers, and Bermuda and mqtt_room trackers named after them or one of their devices
 * ("Kadir's iPhone Area" for Kadir, whose phone is "Kadir’s iPhone").
 */
export function sourcesOf(hass: Hass, person: string, set: PresenceSettings | null | undefined, trackers = roomTrackers(hass)): string[] {
  const picked = set?.people;
  if (picked && person in picked) return picked[person] ? [picked[person]!] : [];
  const p = hass.states[person];
  const own = (Array.isArray(p?.attributes.device_trackers) ? p.attributes.device_trackers : []).filter((t): t is string => typeof t === "string");
  const out: string[] = [];
  const reg = Object.values(hass.entities ?? {});
  for (const t of own) {
    // a phone's own tracker says home or away; one that names rooms, or could, is a room tracker
    const platform = hass.entities?.[t]?.platform;
    if (platform !== "mobile_app" && !hass.states[t]?.attributes.latitude) out.push(t);
    const dev = hass.entities?.[t]?.device_id;
    if (dev) for (const e of reg) if (e.device_id === dev && isBermudaArea(hass, e.entity_id)) out.push(e.entity_id);
  }
  const names = [p ? nameOf(hass, person) : "", ...own.map((t) => (hass.states[t] ? nameOf(hass, t) : ""))].map(slug).filter(Boolean);
  for (const id of trackers) {
    const platform = hass.entities?.[id]?.platform;
    if (platform !== "bermuda" && platform !== "mqtt_room") continue;
    const n = slug(nameOf(hass, id));
    if (names.some((x) => n === x || n.startsWith(`${x}_`) || n.startsWith(`${x}s_`))) out.push(id);
  }
  return [...new Set(out)];
}

/** "Kadir is here", "Kadir and Thea are here", "Alex, Sam and Kim are here". */
export function hereText(names: string[]): string | null {
  if (!names.length) return null;
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${list} ${names.length === 1 ? "is" : "are"} here`;
}
