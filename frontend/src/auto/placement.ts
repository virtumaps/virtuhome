// Puts a home's Home Assistant devices into the plan by themselves:
//   * floors are linked to HA floors (by level), rooms to HA areas (by name)
//   * door and window contacts, curtains and blinds attach to the openings of their room, a TV's
//     media player to the TV in the room
//   * lights, cameras, motion sensors, thermostats, plugs, speakers… get a sensible spot in their
//     room: ceiling lights spread over the ceiling, cameras in corners looking in, motion sensors
//     high in a corner, floor lamps by a wall
//   * a car charger goes on the house's wall at the driveway, with a car parked in front of it
// It never moves what is already placed, so it can run again after new devices were added.
import { bounds, centroid, labelPoint, outwardNormal, pointInPolygon, segmentDistance } from "../model/geom";
import { newId, type Device, type Floor, type Mount, type Opening, type OutdoorArea, type Plan, type Room, type Vec2 } from "../model/plan";
import { domainOf, type Hass, type HassEntity } from "../live/hass";
import { findChargers, type EvCharger } from "../live/ev";
import { FURNITURE } from "../scene/furniture-lib";

export interface PlacementReport {
  roomsLinked: string[];
  placed: string[];
  linked: string[];
  /** Devices whose area is not a room of the plan. */
  unplaced: { entity: string; area: string | null }[];
}

interface Candidate {
  device: string | null;
  entities: string[];
  primary: string;
  name: string;
}

const PRIORITY = ["light", "camera", "media_player", "climate", "cover", "lock", "alarm_control_panel", "vacuum", "fan", "switch", "binary_sensor", "sensor", "assist_satellite"];
const MOTION = new Set(["motion", "occupancy", "presence"]);
const CONTACT = new Set(["door", "window", "opening", "garage_door"]);
const ALERT = new Set(["smoke", "gas", "moisture", "carbon_monoxide"]);

const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function autoPlace(plan: Plan, hass: Hass): { plan: Plan; report: PlacementReport } {
  const p: Plan = structuredClone(plan);
  const report: PlacementReport = { roomsLinked: [], placed: [], linked: [], unplaced: [] };
  const areas = Object.values(hass.areas ?? {});
  const haFloors = Object.values(hass.floors ?? {}).sort((a, b) => (a.level ?? 0) - (b.level ?? 0));

  // ---------------------------------------------------------------- floors and rooms
  p.floors.forEach((f, i) => {
    if (!f.ha_floor && haFloors[i]) f.ha_floor = haFloors[i].floor_id;
  });
  const usedAreas = new Set(p.floors.flatMap((f) => f.rooms.map((r) => r.area_id).filter(Boolean)));
  for (const f of p.floors) {
    for (const r of [...f.rooms, ...(f.outdoor ?? [])]) {
      if (r.area_id) continue;
      const n = norm(r.name);
      const match =
        areas.find((a) => norm(a.name) === n && !usedAreas.has(a.area_id)) ??
        areas.find((a) => (norm(a.name).includes(n) || n.includes(norm(a.name))) && !usedAreas.has(a.area_id) && (!f.ha_floor || !a.floor_id || a.floor_id === f.ha_floor));
      if (match) {
        r.area_id = match.area_id;
        usedAreas.add(match.area_id);
        report.roomsLinked.push(`${r.name} → ${match.name}`);
      }
    }
  }

  // ---------------------------------------------------------------- what is already in the plan
  const inPlan = new Set<string>();
  for (const f of p.floors) {
    for (const d of f.devices) inPlan.add(d.entity);
    for (const x of f.furniture) if (x.entity) inPlan.add(x.entity);
    for (const o of f.openings) {
      if (o.entity) inPlan.add(o.entity);
      if (o.cover) inPlan.add(o.cover);
    }
    for (const r of f.rooms) {
      if (r.temperature) inPlan.add(r.temperature);
      if (r.humidity) inPlan.add(r.humidity);
    }
  }

  // ---------------------------------------------------------------- the car charger (a piece of its own, not markers)
  const chargers = findChargers(hass, null, p.settings.energy);
  const chargerDevices = new Set(chargers.map((c) => c.device).filter(Boolean));
  if (chargers.length && !p.floors.some((f) => f.furniture.some((x) => FURNITURE[x.type]?.family === "ev_charger"))) placeCharger(p, hass, chargers[0], report);

  // ---------------------------------------------------------------- devices per area
  const byArea = new Map<string, Map<string, Candidate>>();
  for (const [id, reg] of Object.entries(hass.entities ?? {})) {
    if (reg.hidden || reg.entity_category || (reg.device_id && chargerDevices.has(reg.device_id))) continue;
    const s = hass.states[id];
    if (!s) continue;
    const dom = domainOf(id);
    if (!PRIORITY.includes(dom)) continue;
    if (skipEntity(hass, id)) continue;
    const area = reg.area_id ?? (reg.device_id ? hass.devices?.[reg.device_id]?.area_id : null) ?? null;
    if (!area) continue;
    const key = reg.device_id ?? id;
    let devs = byArea.get(area);
    if (!devs) byArea.set(area, (devs = new Map()));
    let c = devs.get(key);
    if (!c) {
      const dev = reg.device_id ? hass.devices?.[reg.device_id] : undefined;
      c = { device: reg.device_id ?? null, entities: [], primary: id, name: dev?.name_by_user ?? dev?.name ?? String(s.attributes.friendly_name ?? id) };
      devs.set(key, c);
    }
    c.entities.push(id);
    if (rank(hass, id) < rank(hass, c.primary)) c.primary = id;
  }

  // an area may span rooms on several floors (a hallway and its landing)
  const roomsOfArea = new Map<string, { floor: Floor; room: Room }[]>();
  for (const f of p.floors) for (const r of [...f.rooms, ...(f.outdoor ?? []).map(asRoom)]) if (r.area_id) {
    if (!roomsOfArea.has(r.area_id)) roomsOfArea.set(r.area_id, []);
    roomsOfArea.get(r.area_id)!.push({ floor: f, room: r });
  }

  for (const [area, devs] of byArea) {
    const targets = roomsOfArea.get(area) ?? [];
    const target = targets[0];
    if (!target) {
      for (const c of devs.values()) if (!c.entities.some((e) => inPlan.has(e)) && worthPlacing(hass, c.primary)) report.unplaced.push({ entity: c.primary, area });
      continue;
    }
    const spots = new Spots(target.floor, target.room);
    const ordered = [...devs.values()].sort((a, b) => rank(hass, a.primary) - rank(hass, b.primary));
    // lights spread over the ceiling when there are several
    const ceilingLights = ordered.filter((c) => domainOf(c.primary) === "light" && lightMount(c, hass) === "ceiling" && !c.entities.some((e) => inPlan.has(e)));
    const grid = spots.ceilingGrid(ceilingLights.length);
    // the TV model goes to the most TV-like media player of the room
    const tvPlayer = ordered
      .filter((c) => domainOf(c.primary) === "media_player")
      .map((c) => ({ c, score: tvScore(`${c.primary} ${c.name}`) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.c;
    for (const c of ordered) {
      if (c.entities.some((e) => inPlan.has(e))) continue;
      // dead battery sensors stay out; TVs, lights and cameras are often "unavailable" while off
      const dom = domainOf(c.primary);
      if ((dom === "binary_sensor" || dom === "sensor") && isUnavailable(hass.states[c.primary])) {
        report.unplaced.push({ entity: c.primary, area });
        continue;
      }
      const room = pickRoom(targets, c.name) ?? target;
      const sp = room === target ? spots : new Spots(room.floor, room.room);
      const placed = placeOne(c, hass, room.floor, room.room, sp, room === target ? grid : [], report, c === tvPlayer);
      if (placed) for (const e of c.entities) inPlan.add(e);
    }
  }
  return { plan: p, report };
}

function placeOne(c: Candidate, hass: Hass, floor: Floor, room: Room, spots: Spots, grid: Vec2[], report: PlacementReport, isTv = false): boolean {
  const id = c.primary;
  const s = hass.states[id];
  const dom = domainOf(id);
  const dc = s?.attributes.device_class;
  const add = (d: Omit<Device, "id">) => {
    floor.devices.push({ id: newId("d"), ...d });
    report.placed.push(`${c.name} → ${room.name}`);
    return true;
  };

  const outdoor = (room as Room & { outdoor?: boolean }).outdoor === true;
  if (dom === "light" && outdoor) {
    // garden lights stand along the edge of their area
    const at = spots.corner(0.35);
    return add({ entity: id, x: at[0], z: at[1], mount: "floor" });
  }
  if (dom === "light") {
    const mount = lightMount(c, hass);
    if (mount === "ceiling") {
      const at = grid.shift() ?? spots.centre();
      return add({ entity: id, x: at[0], z: at[1], mount: "ceiling" });
    }
    if (mount === "table") {
      const bed = floor.furniture.find((x) => x.type === "bed" && pointInPolygon([x.x, x.z], room.points));
      const at = bed ? spots.besideBed(bed, c.name) : spots.corner(0.35);
      return add({ entity: id, x: at[0], z: at[1], mount: "table", y: 0.5 });
    }
    const wall = spots.wall(0.12);
    return add({ entity: id, x: wall.at[0], z: wall.at[1], mount: mount === "floor" ? "floor" : "wall", rotation: wall.facing, y: mount === "floor" ? null : 1.6 });
  }

  if (dom === "binary_sensor" && dc && CONTACT.has(dc)) {
    const o = pickOpening(floor, room, dc === "window" ? "window" : "door", c.name);
    if (o) {
      o.entity = id;
      report.linked.push(`${c.name} → ${room.name} ${o.kind}`);
      return true;
    }
    return false;
  }

  if (dom === "cover" && (dc === "curtain" || dc === "blind" || dc === "shade" || dc === "shutter" || !dc)) {
    const o = floor.openings.find((x) => x.room_id === room.id && x.kind === "window" && !x.cover);
    if (o) {
      o.cover = id;
      report.linked.push(`${c.name} → ${room.name} window`);
      return true;
    }
  }

  if (dom === "media_player") {
    const tv = floor.furniture.find((x) => (x.type === "tv_wall" || x.type === "tv_board") && !x.entity && pointInPolygon([x.x, x.z], room.points));
    if (tv && isTv) {
      tv.entity = id;
      report.linked.push(`${c.name} → ${room.name} TV`);
      return true;
    }
    const at = spots.corner(0.4);
    return add({ entity: id, x: at[0], z: at[1], y: 0.8 });
  }

  if (dom === "sensor") {
    if (dc === "temperature" && !room.temperature && !outdoor) {
      room.temperature = id;
      report.linked.push(`${c.name} → ${room.name} temperature`);
      // its humidity sits on the same device
      const hum = c.entities.find((e) => hass.states[e]?.attributes.device_class === "humidity");
      if (hum && !room.humidity) room.humidity = hum;
      return true;
    }
    return false;
  }

  if (dom === "camera" && /doorbell|door ?bell|front ?door|door ?station|intercom/i.test(`${id} ${c.name}`)) {
    const out = frontDoorOutside(floor, room);
    if (out) return add({ entity: id, x: out.at[0], z: out.at[1], y: 1.4, mount: "wall", rotation: out.facing });
  }
  if (dom === "camera") {
    const at = spots.corner(0.25);
    const m = centroid(room.points);
    return add({ entity: id, x: at[0], z: at[1], y: 2.2, mount: "wall", rotation: heading(m[0] - at[0], m[1] - at[1]) });
  }
  if (dom === "binary_sensor" && dc && MOTION.has(dc)) {
    const at = spots.corner(0.2);
    return add({ entity: id, x: at[0], z: at[1], y: 2.2, mount: "wall" });
  }
  if (dom === "binary_sensor" && dc && ALERT.has(dc)) {
    const at = dc === "moisture" ? spots.corner(0.3) : spots.centre();
    return add({ entity: id, x: at[0], z: at[1], y: dc === "moisture" ? 0.05 : null, mount: dc === "moisture" ? "floor" : "ceiling" });
  }
  if (dom === "climate") {
    const w = spots.wall(0.08);
    return add({ entity: id, x: w.at[0], z: w.at[1], y: 1.5, mount: "wall", rotation: w.facing });
  }
  if (dom === "switch" || dom === "fan") {
    const w = spots.wall(0.15);
    return add({ entity: id, x: w.at[0], z: w.at[1], y: dom === "fan" ? 2.3 : 0.35, mount: dom === "fan" ? "ceiling" : "wall", rotation: w.facing });
  }
  if (dom === "vacuum") {
    const at = spots.corner(0.4);
    return add({ entity: id, x: at[0], z: at[1], y: 0.05, mount: "floor" });
  }
  if (dom === "lock" || dom === "alarm_control_panel" || dom === "assist_satellite") {
    const at = spots.corner(0.35);
    return add({ entity: id, x: at[0], z: at[1], y: dom === "assist_satellite" ? 0.8 : 1.4 });
  }
  return false;
}

/**
 * A charger on the house's wall where the driveway meets it (on a post when the house is not there),
 * and a car parked in front of it, its nose to the house, when the plan has no car yet.
 */
function placeCharger(p: Plan, hass: Hass, c: EvCharger, report: PlacementReport): void {
  const link = c.status ?? c.power ?? c.level;
  const area = c.device ? hass.devices?.[c.device]?.area_id ?? null : null;
  const floor = p.floors.find((f) => (f.outdoor ?? []).length);
  const spot = floor?.outdoor?.find((o) => o.kind === "driveway") ?? floor?.outdoor?.find((o) => o.area_id && o.area_id === area);
  if (!floor || !spot) {
    if (link) report.unplaced.push({ entity: link, area });
    return;
  }
  // the driveway's edge nearest the house
  const walls = floor.rooms.flatMap((r) => r.points.map((a, i) => [a, r.points[(i + 1) % r.points.length]] as [Vec2, Vec2]));
  const toHouse = (q: Vec2) => walls.reduce((m, [a, b]) => Math.min(m, segmentDistance(q, a, b).d), Infinity);
  const pts = spot.points;
  let edge = 0, near = Infinity;
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const d = toHouse([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    if (d < near) [edge, near] = [i, d];
  });
  const a = pts[edge], b = pts[(edge + 1) % pts.length];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const dir: Vec2 = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  const out = outwardNormal(pts, edge);
  const n: Vec2 = [-out[0], -out[1]];
  const along = (t: number, off: number): Vec2 => [a[0] + dir[0] * t + n[0] * off, a[1] + dir[1] * t + n[1] * off];

  // the car in the middle of the edge, the charger beside its nose
  const [cw, cd, ch] = FURNITURE.car.size;
  const tc = l >= cw + 1 ? l / 2 - cw / 2 - 0.35 : l / 2;
  const wall = toHouse(along(tc, 0)) - p.settings.wall_exterior / 2;
  const onWall = wall < 0.5;
  const type = onWall ? "ev_charger" : "ev_charger_post";
  const [w, d, h] = FURNITURE[type].size;
  // back against the wall's face (the edge may stop short of it), or on a post a little way in
  const at = along(tc, (onWall ? -wall : 0.3) + d / 2);
  floor.furniture.push({ id: newId("f"), type, x: at[0], z: at[1], rotation: heading(n[0], n[1]), w, d, h, entity: link });
  report.placed.push(`${c.name} → ${spot.name}`);

  if (p.floors.some((f) => f.furniture.some((x) => x.type === "car")) || l < cw + 1) return;
  const gap = Math.max(0, -wall) + 0.6 + cd / 2;
  const mid = along(l / 2, gap);
  const corners: Vec2[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => along(l / 2 + (s * cw) / 2, gap + (t * cd) / 2));
  if (!corners.every((q) => pointInPolygon(q, pts))) return;
  floor.furniture.push({ id: newId("f"), type: "car", x: mid[0], z: mid[1], rotation: (heading(-n[0], -n[1]) + 360) % 360, w: cw, d: cd, h: ch, entity: link });
  report.placed.push(`Car → ${spot.name}`);
}

/** Garden areas take part like rooms (their lights, cameras and plugs go there). */
function asRoom(o: OutdoorArea): Room {
  return { id: o.id, name: o.name, area_id: o.area_id, points: o.points, outdoor: true } as Room & { outdoor: boolean };
}

const isUnavailable = (s: HassEntity | undefined) => !s || s.state === "unavailable" || s.state === "unknown";

/** Entities that are no device of the room: media player wrappers, groups, phones, NAS switches. */
function skipEntity(hass: Hass, id: string): boolean {
  const dom = domainOf(id);
  const reg = hass.entities?.[id];
  const dev = reg?.device_id ? hass.devices?.[reg.device_id] : undefined;
  const text = `${id} ${dev?.name_by_user ?? dev?.name ?? ""} ${dev?.model ?? ""}`.toLowerCase();
  if (/iphone|ipad|phone|tablet|fire hd|kfr|macbook|mac mini|imac|laptop|watch|n65/.test(text)) return true;
  if (dom === "media_player") {
    if (reg?.platform && ["plex", "music_assistant", "group", "universal"].includes(reg.platform)) return true;
    if (/group|everywhere/.test(text)) return true;
  }
  if (dom === "switch") {
    const dc = hass.states[id]?.attributes.device_class;
    return !(dc === "outlet" || /plug|socket|outlet|heater|kettle|coffee|lamp|light|fan|humidif|dehumid|monitor|printer|washing|dryer|tree|diffuser/.test(text));
  }
  return false;
}

function tvScore(text: string): number {
  const t = text.toLowerCase();
  if (/webos|bravia|tizen|television|\btv\b|_tv_|oled|qled/.test(t)) return 3;
  if (/android tv|google tv|fire ?tv|roku|apple ?tv|chromecast|shield/.test(t)) return 2;
  if (/xbox|playstation|ps5|switch/.test(t)) return 1;
  return 0;
}

/** For areas over several floors: "upstairs" devices go to the upper room, "downstairs" ones to the lower. */
function pickRoom(targets: { floor: Floor; room: Room }[], name: string): { floor: Floor; room: Room } | null {
  if (targets.length < 2) return null;
  const sorted = [...targets].sort((a, b) => a.floor.elevation - b.floor.elevation);
  if (/upstairs|first floor|landing|top/i.test(name)) return sorted[sorted.length - 1];
  if (/downstairs|ground floor|bottom/i.test(name)) return sorted[0];
  return null;
}

/** Just outside the room's front door (the outside door lowest on the plan), facing out. */
function frontDoorOutside(floor: Floor, room: Room): { at: Vec2; facing: number } | null {
  const doors = floor.openings.filter((o) => o.room_id === room.id && o.kind === "door");
  let best: { at: Vec2; facing: number; z: number } | null = null;
  for (const o of doors) {
    const a = room.points[o.edge];
    const b = room.points[(o.edge + 1) % room.points.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const dir: Vec2 = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    const p: Vec2 = [a[0] + dir[0] * o.offset, a[1] + dir[1] * o.offset];
    const n = outwardNormal(room.points, o.edge);
    const outside: Vec2 = [p[0] + n[0] * 0.5, p[1] + n[1] * 0.5];
    if (floor.rooms.some((r) => pointInPolygon(outside, r.points))) continue; // an inside door
    const at: Vec2 = [p[0] + n[0] * 0.25 + dir[0] * (o.width / 2 + 0.2), p[1] + n[1] * 0.25 + dir[1] * (o.width / 2 + 0.2)];
    if (!best || p[1] > best.z) best = { at, facing: heading(n[0], n[1]), z: p[1] };
  }
  return best;
}

/** Lower is more important: decides which of a device's entities stands for it. */
function rank(hass: Hass, id: string): number {
  const dom = domainOf(id);
  const dc = hass.states[id]?.attributes.device_class;
  let r = PRIORITY.indexOf(dom) * 10;
  if (dom === "binary_sensor") {
    if (dc && CONTACT.has(dc)) r -= 25;
    else if (dc && (MOTION.has(dc) || ALERT.has(dc))) r -= 20;
    else r += 5;
  }
  if (dom === "sensor" && dc !== "temperature") r += 5;
  if (/tamper|battery|signal|update|identify|led_ring|backlight/i.test(id)) r += 100;
  return r;
}

function worthPlacing(hass: Hass, id: string): boolean {
  const dom = domainOf(id);
  if (dom === "sensor") return hass.states[id]?.attributes.device_class === "temperature";
  return rank(hass, id) < 100;
}

function lightMount(c: Candidate, hass: Hass): Mount {
  const text = `${c.name} ${c.primary} ${hass.states[c.primary]?.attributes.friendly_name ?? ""}`.toLowerCase();
  if (/floor ?lamp|standing|h6076|uplighter/.test(text)) return "floor";
  if (/night ?light|bedside|table ?lamp|desk ?lamp/.test(text)) return "table";
  if (/strip|led|chimney|stair|hex|wall|sconce|backlight|cabinet|wardrobe|under/.test(text)) return "wall";
  return "ceiling";
}

function pickOpening(floor: Floor, room: Room, kind: "door" | "window", name: string): Opening | null {
  const list = floor.openings.filter((o) => o.room_id === room.id && (kind === "window" ? o.kind === "window" : o.kind === "door" || o.kind === "garage") && !o.entity);
  if (!list.length) {
    // a door sensor's door may be stored on the neighbouring room's edge
    if (kind !== "door") return null;
    return floor.openings.find((o) => o.kind === "door" && !o.entity && touches(floor, o, room)) ?? null;
  }
  const n = name.toLowerCase();
  const pos = (o: Opening) => {
    const r = floor.rooms.find((x) => x.id === o.room_id)!;
    const a = r.points[o.edge];
    const b = r.points[(o.edge + 1) % r.points.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [a[0] + ((b[0] - a[0]) * o.offset) / l, a[1] + ((b[1] - a[1]) * o.offset) / l] as Vec2;
  };
  if (/\bl\b|left/.test(n) && list.length > 1) return list.reduce((m, o) => (pos(o)[0] < pos(m)[0] ? o : m));
  if (/\br\b|right/.test(n) && list.length > 1) return list.reduce((m, o) => (pos(o)[0] > pos(m)[0] ? o : m));
  if (/front|main|entrance/.test(n)) return list.reduce((m, o) => (pos(o)[1] > pos(m)[1] ? o : m));
  if (/back|rear|garden|patio/.test(n)) return list.reduce((m, o) => (pos(o)[1] < pos(m)[1] ? o : m));
  return list[0];
}

function touches(floor: Floor, o: Opening, room: Room): boolean {
  const r = floor.rooms.find((x) => x.id === o.room_id);
  if (!r) return false;
  const a = r.points[o.edge];
  const b = r.points[(o.edge + 1) % r.points.length];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const p: Vec2 = [a[0] + ((b[0] - a[0]) * o.offset) / l, a[1] + ((b[1] - a[1]) * o.offset) / l];
  const n = outwardNormal(r.points, o.edge);
  return pointInPolygon([p[0] + n[0] * 0.3, p[1] + n[1] * 0.3], room.points);
}

const heading = (dx: number, dz: number) => Math.round((Math.atan2(-dx, dz) * 180) / Math.PI);

/** Free spots in a room: corners, wall middles and a ceiling grid, handed out without repeats. */
class Spots {
  private used: Vec2[] = [];

  constructor(private floor: Floor, private room: Room) {}

  private free(p: Vec2): boolean {
    return this.used.every((u) => Math.hypot(u[0] - p[0], u[1] - p[1]) > 0.45);
  }

  private take(p: Vec2): Vec2 {
    this.used.push(p);
    return p;
  }

  centre(): Vec2 {
    const c = labelPoint(this.room.points);
    return this.take(this.free(c) ? c : [c[0] + 0.5, c[1]]);
  }

  /** Corners of the room, inset; the far ones from the middle first. */
  corner(inset: number): Vec2 {
    const pts = this.room.points;
    const m = centroid(pts);
    const corners = pts
      .map((p) => {
        const dx = Math.sign(m[0] - p[0]);
        const dz = Math.sign(m[1] - p[1]);
        return [p[0] + dx * inset, p[1] + dz * inset] as Vec2;
      })
      .filter((p) => pointInPolygon(p, pts));
    const pick = corners.find((p) => this.free(p)) ?? corners[0] ?? m;
    return this.take(pick);
  }

  /** The middle of a free wall, just inside it, and the direction into the room. */
  wall(inset: number): { at: Vec2; facing: number } {
    const pts = this.room.points;
    const options = pts.map((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const n = outwardNormal(pts, i);
      const mid: Vec2 = [(a[0] + b[0]) / 2 - n[0] * inset, (a[1] + b[1]) / 2 - n[1] * inset];
      return { at: mid, facing: heading(-n[0], -n[1]), len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
    }).filter((o) => o.len > 0.8 && pointInPolygon(o.at, pts)).sort((x, y) => y.len - x.len);
    const pick = options.find((o) => this.free(o.at)) ?? options[0] ?? { at: centroid(pts), facing: 0 };
    this.take(pick.at);
    return { at: pick.at, facing: pick.facing };
  }

  besideBed(bed: { x: number; z: number; w: number; d: number; rotation: number }, name: string): Vec2 {
    const r = (bed.rotation * Math.PI) / 180;
    const side = /\br\b|right/i.test(name) ? 1 : -1;
    // beside the head end: half the bed's width plus a nightstand out, towards the head (-z local)
    const lx = side * (bed.w / 2 + 0.3);
    const lz = -bed.d / 2 + 0.25;
    const p: Vec2 = [bed.x + Math.cos(r) * lx - Math.sin(r) * lz, bed.z + Math.sin(r) * lx + Math.cos(r) * lz];
    return this.take(p);
  }

  /** n points spread over the ceiling (a grid over the room's box, inside the room). */
  ceilingGrid(n: number): Vec2[] {
    if (n <= 0) return [];
    if (n === 1) return [this.centre()];
    const b = bounds(this.room.points);
    const w = b.maxX - b.minX;
    const d = b.maxZ - b.minZ;
    const cols = Math.max(1, Math.round(Math.sqrt((n * w) / Math.max(d, 0.5))));
    const rows = Math.ceil(n / cols);
    const out: Vec2[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols && out.length < n; i++) {
        const p: Vec2 = [b.minX + (w * (i + 0.5)) / cols, b.minZ + (d * (j + 0.5)) / rows];
        out.push(pointInPolygon(p, this.room.points) ? p : labelPoint(this.room.points));
      }
    }
    for (const p of out) this.used.push(p);
    void this.floor;
    return out;
  }
}

export type { HassEntity };
