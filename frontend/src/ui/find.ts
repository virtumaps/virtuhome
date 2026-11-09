// Finding things in the home by name: rooms and garden areas, the devices in the plan (and those of
// the rooms' areas), furniture, scenes and scripts. Matched against Home Assistant's names, aliases,
// area names and entity ids, with every word typed found at the start of a word. Pure: the search
// box (search.ts) shows what it finds, and a spoken request could use it the same way.
import { domainOf, areaOf, type Hass } from "../live/hass";
import { roomScenes } from "../live/scenes";
import { pointInPolygon } from "../model/geom";
import { spaces, type Device, type Plan } from "../model/plan";
import { openingPoint } from "../model/walls";
import { linkedEntities } from "../scene/devices";
import { baseHeight, furnitureName } from "../scene/furniture-lib";

export type FoundKind = "room" | "garden" | "device" | "furniture" | "scene" | "script";

export interface Found {
  kind: FoundKind;
  name: string;
  /** The name of the room (else the floor) it is in, or "". */
  where: string;
  /** Its floor and room (an index into the floor's spaces); -1 where it isn't in the plan. */
  floor: number;
  room: number;
  entity?: string;
  /** Where it stands, to point it out: a device marker's spot, else a point and its height above the floor. */
  spot?: { device?: Device; x: number; z: number; y: number };
  /** What it is found by, as norm() makes them, with how much each counts. */
  texts: [string, number][];
}

/** Lower case, without accents, with ids' dots and underscores (and anything but letters and digits) as spaces. */
export const norm = (s: string): string =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** Kinds that show first when they match as well. */
const KIND_ORDER: Record<FoundKind, number> = { room: 0.3, garden: 0.3, device: 0.2, scene: 0.1, script: 0.1, furniture: 0 };

/** Devices of a room's area that its sheet shows, though they aren't in the plan. */
const AREA_DOMAINS = new Set(["light", "switch", "cover", "climate", "fan", "media_player", "lock", "camera", "vacuum", "lawn_mower", "humidifier", "water_heater", "valve", "binary_sensor", "sensor"]);

/**
 * Everything that can be found, with the texts it is found by. `aliases` are Home Assistant's
 * aliases of entities (the entity registry's, fetched when the search opens).
 */
export function findIndex(plan: Plan, hass: Hass, aliases: Record<string, string[]> = {}): Found[] {
  const out: Found[] = [];
  const seen = new Set<string>();
  const areaTexts = (area: string | null | undefined): [string, number][] => {
    const a = area ? hass.areas?.[area] : undefined;
    return a ? [a.name, ...(a.aliases ?? [])].map((x) => [norm(x), 1] as [string, number]) : [];
  };
  /** A room's or floor's name for where something is. */
  const placeName = (fi: number, ri: number) => (ri >= 0 ? spaces(plan.floors[fi])[ri].name : plan.floors[fi].name);
  const entity = (id: string, fi: number, ri: number, spot: Found["spot"], extra: string[] = []) => {
    if (seen.has(id)) return;
    seen.add(id);
    const s = hass.states[id];
    const reg = hass.entities?.[id];
    const device = reg?.device_id ? hass.devices?.[reg.device_id] : undefined;
    const name = String(s?.attributes.friendly_name ?? reg?.name ?? id);
    const kind: FoundKind = domainOf(id) === "scene" ? "scene" : domainOf(id) === "script" ? "script" : "device";
    const texts: [string, number][] = [[norm(name), 3]];
    for (const x of [reg?.name, ...(aliases[id] ?? [])]) if (x) texts.push([norm(x), 2.5]);
    for (const x of [device?.name_by_user, device?.name, ...extra]) if (x) texts.push([norm(x), 1.5]);
    texts.push([norm(id), 1.5]);
    if (fi >= 0) texts.push([norm(placeName(fi, ri)), 1]);
    texts.push(...areaTexts(areaOf(hass, id)));
    out.push({ kind, name, where: fi >= 0 ? placeName(fi, ri) : "", floor: fi, room: ri, entity: id, spot, texts });
  };

  plan.floors.forEach((f, fi) => {
    const sp = spaces(f);
    const at = (x: number, z: number) => sp.findIndex((s) => pointInPolygon([x, z], s.points));
    sp.forEach((s, ri) => {
      const texts: [string, number][] = [[norm(s.name), 3], ...areaTexts(s.area_id).map(([x]) => [x, 2.5] as [string, number]), [norm(f.name), 0.5]];
      out.push({ kind: s.outdoor ? "garden" : "room", name: s.name, where: f.name, floor: fi, room: ri, texts });
    });
    for (const d of f.devices) entity(d.entity, fi, at(d.x, d.z), { device: d, x: d.x, z: d.z, y: 0 });
    const pieces = new Set<string>();
    for (const x of f.furniture) {
      const ri = at(x.x, x.z);
      const label = furnitureName(x.type) ?? x.type;
      const spot = { x: x.x, z: x.z, y: baseHeight(x, f.height) + x.h + 0.15 };
      const linked = linkedEntities(x);
      for (const id of linked) entity(id, fi, ri, spot, [label]);
      // a piece without a device, once for each kind in a room (six dining chairs are one)
      const key = `${x.type}|${ri}`;
      if (linked.length || pieces.has(key)) continue;
      pieces.add(key);
      out.push({ kind: "furniture", name: label, where: placeName(fi, ri), floor: fi, room: ri, spot, texts: [[norm(label), 3], [norm(placeName(fi, ri)), 1]] });
    }
    for (const o of f.openings) {
      const p = openingPoint(f, o);
      const ri = sp.findIndex((s) => s.id === o.room_id);
      const spot = p ? { x: p[0], z: p[1], y: o.kind === "window" ? o.sill + o.height / 2 : 1.05 } : undefined;
      for (const id of [o.entity, o.cover, o.lock]) if (id) entity(id, fi, ri, spot);
    }
  });
  // what the rooms' areas have besides, as their sheets show it, then the scenes and scripts
  const rooms = new Map<string, [number, number]>();
  plan.floors.forEach((f, fi) => spaces(f).forEach((s, ri) => s.area_id && !rooms.has(s.area_id) && rooms.set(s.area_id, [fi, ri])));
  for (const [id, reg] of Object.entries(hass.entities ?? {})) {
    if (reg.hidden || reg.entity_category || !hass.states[id] || !AREA_DOMAINS.has(domainOf(id))) continue;
    const r = rooms.get(areaOf(hass, id) ?? "");
    if (r) entity(id, r[0], r[1], undefined);
  }
  // a scene or script is in the room whose sheet shows it, else in none
  const picked = new Map<string, [number, number]>();
  plan.floors.forEach((f, fi) => [...f.rooms, ...(f.outdoor ?? [])].forEach((s, ri) => {
    for (const id of roomScenes(hass, s)) if (!picked.has(id)) picked.set(id, [fi, ri]);
  }));
  for (const id of Object.keys(hass.states)) {
    if (!/^(scene|script)\./.test(id) || hass.entities?.[id]?.hidden) continue;
    const r = picked.get(id) ?? [-1, -1];
    entity(id, r[0], r[1], undefined);
  }
  return out;
}

/** How well `words` (normalised) match a text: each must start a word in it; 0 when one doesn't. */
function score(item: Found, words: string[], whole: string): number {
  let total = 0;
  for (const w of words) {
    let best = 0;
    for (const [text, weight] of item.texts) {
      if (weight > best && (text.startsWith(w) || text.includes(` ${w}`))) best = weight;
    }
    if (!best) return 0;
    total += best;
  }
  const name = item.texts[0][0];
  if (name === whole) total += 4;
  else if (name.startsWith(whole)) total += 2;
  return total + KIND_ORDER[item.kind];
}

/** The best matches for what was typed, best first (nothing for nothing typed). */
export function find(index: Found[], query: string, limit = 30): Found[] {
  const whole = norm(query);
  if (!whole) return [];
  const words = whole.split(" ");
  const hits: [Found, number][] = [];
  for (const item of index) {
    const s = score(item, words, whole);
    if (s) hits.push([item, s]);
  }
  hits.sort((a, b) => b[1] - a[1] || a[0].name.length - b[0].name.length || a[0].name.localeCompare(b[0].name));
  return hits.slice(0, limit).map(([item]) => item);
}
