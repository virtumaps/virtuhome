// Translates Home Assistant states into what the 3D view shows, and tells the view which parts
// to refresh when states change. Home Assistant replaces a state object whenever it changes, so
// spotting changes is a cheap identity comparison over the entities the plan uses.
import { pointInPolygon } from "../model/geom";
import { DEFAULT_LABEL, showsValue, spaces, type Device, type Floor, type Furniture, type LabelPart, type Opening, type Plan, type Room, type Space } from "../model/plan";
import type { GlowSlot, LampInfo } from "../scene/build";
import { lin } from "../scene/build";
import type { V3 } from "../scene/geo";
import { kelvinToRgb, type LampState } from "../scene/lighting";
import { CAR_TYPES, EV_TYPES } from "../scene/furniture-lib";
import { holdsPost, POST_TYPES } from "../scene/bins";
import { AC_TYPES, deviceGlow, fanTurns as turnsOf, gangsOf, linkedEntities, GANG_TYPES, GLOW_TYPES, HEAT_TYPES, heats, waterTemperature, WATER_TYPES } from "../scene/devices";
import { iconIndex } from "../scene/markers";
import type { LiveSource, MarkerLook } from "../scene/viewer";
import type { EnergyLive } from "./energy";
import { chargerEntities, type EvNow } from "./ev";
import { areaOf, domainOf, type Hass, type HassEntity } from "./hass";
import { roomOf, roomTrackers, slug, sourcesOf } from "./presence";
import { readingIcon, valueText } from "./readings";
import { lockKind, type LockKind } from "./locks";
import { artwork, mediaText } from "./media";
import { t } from "../i18n";

export type Change = "lighting" | "openings" | "markers" | "tints" | "labels" | "status" | "readings";

export type RGBA = [number, number, number, number];
/** An extension's colour for a room (null leaves it to the core), and its text under the room's name. */
export type RoomTint = (floor: Floor, space: Space) => RGBA | null;
export type RoomText = (floor: Floor, space: Space) => string | null;
/** An extension's mark on a piece of furniture: its lit part's colour (linear RGB) and a tag over it, which a tap calls onTap of. */
export interface ItemMark {
  glow?: V3 | null;
  text?: string | null;
  onTap?(): void;
}
export type ItemMarks = (floor: Floor, item: Furniture) => ItemMark | null;
/** A piece of the line under a room's name. A piece with an entity opens it when tapped. */
export interface RoomPart {
  text: string;
  entity?: string;
  /** The room's heating is on: the piece shows warm. */
  heating?: boolean;
}

/** A device shown by its value: the text and the icon of its label. */
export interface Reading {
  text: string;
  icon: string;
}

/** A smart lock's badge on its door: what it says, in words for its label. */
export interface LockBadge {
  kind: LockKind;
  text: string;
}

/** What a TV or speaker plays: its line, and the artwork's address (TVs). */
export interface NowPlaying {
  text: string;
  picture: string | null;
}

/** Something that needs attention now: a leak, smoke, a triggered alarm. */
export interface Alert {
  id: string;
  text: string;
}

export interface Person {
  id: string;
  name: string;
  home: boolean;
  /** Where they are: "Home", "Away" or a zone's name. */
  where: string;
  picture: string | null;
  /** The room they are in, when a room tracker knows it. */
  room: string | null;
}

interface RoomWatch {
  temperature: string | null;
  humidity: string | null;
  alerts: string[];
  motion: string[];
  lights: string[];
  /** Thermostats and radiator valves in the room: placed in it in the plan, or of its area. */
  climates: string[];
  /** What warms the room: its own climates, else the house's one thermostat. */
  heating: string[];
  /** What its label shows, in order. */
  label: readonly LabelPart[];
}

/** Sensors whose "on" is an alert, by device class (each has its name in the table: alert.smoke…). */
const ALERTS = ["smoke", "gas", "moisture", "carbon_monoxide", "safety"] as const;
const ALERT_CLASSES = new Set<string>(ALERTS);
const MOTION_CLASSES = new Set(["motion", "occupancy", "presence"]);
const OPENING_CLASSES = new Set(["door", "window", "opening", "garage_door"]);
/** Temperatures of machines, not of the room. */
const NOT_ROOM_TEMP = /cpu|printer|nozzle|chamber|bed_temp|battery|internal|inverter|drive|disk|volume|device|chip|core|water_heater|flow|return/i;

const C = {
  idle: 0x5d6673,
  off: 0x4a525e,
  unavailable: 0x2c3138,
  on: 0xf2a33a,
  motion: 0xf2a33a,
  open: 0xf07a3a,
  closed: 0x3fae7a,
  alert: 0xe5484d,
  media: 0x8b6cf6,
  camera: 0x3d8bfd,
  heat: 0xf26b3a,
  cool: 0x3db6f2,
  secure: 0x2bb673,
};

const TINT_HEAT: RGBA = [1.0, 0.42, 0.16, 0.13];
const TINT_COOL: RGBA = [0.25, 0.62, 1.0, 0.11];
/** An air conditioner on fan only. */
const TINT_FAN: RGBA = [0.75, 0.85, 0.95, 0.08];

const isUnavailable = (s: HassEntity | undefined) => !s || s.state === "unavailable" || s.state === "unknown";

export class HassLive implements LiveSource {
  hass: Hass | null = null;
  private plan: Plan;
  private seen = new Map<string, HassEntity | undefined>();
  private kinds = new Map<string, Set<Change>>();
  private rooms = new Map<string, RoomWatch>();
  private regRef: unknown = null;
  /** The index picks sensors by their state attributes, so it is redone once states exist. */
  private indexedWithStates = false;
  /** Rooms tinted by temperature (blue cold, red warm). */
  heatmap = false;
  /** Everyone, and the trackers that say their room (watched apart: only a move to another room redraws). */
  private presence: { person: string; sources: string[] }[] = [];
  private presenceIds = new Set<string>();
  private presenceSeen = new Map<string, HassEntity | undefined>();
  /** The room each person is in now (floor and space index, and `floor id/space id`). */
  private where = new Map<string, { floor: number; room: number; key: string }>();
  private whereKey = "";
  /** Shows people in their rooms (the card's `people` option turns it off with the avatars). */
  peopleInRooms = true;
  /** Motion sensors of each camera's own device (a doorbell's motion turns its view cone red). */
  private cameraMotion = new Map<string, string[]>();
  /** Rooms and garden areas with a car or a charger in them. */
  private evSpaces = new Map<string, Furniture[]>();
  /** The house's solar: solar panels in the plan shine with it (darker in the day look's brighter light). */
  energy: EnergyLive | null = null;
  day = false;
  /** Set by an extension (the Energy extension's power map). */
  roomTint: RoomTint | null = null;
  roomExtraText: RoomText | null = null;
  /** Extensions' marks on furniture, by the piece's id (a bin on the evening before its collection). */
  itemMarks: Map<string, ItemMark> | null = null;
  /** The time the states are from: a replay of the past moves it, so a sensor that just changed still pulses. */
  now: () => number = Date.now;

  constructor(plan: Plan) {
    this.plan = plan;
  }

  setPlan(plan: Plan): void {
    this.plan = plan;
    this.regRef = null;
    this.indexedWithStates = false;
  }

  /** Takes a new hass object; returns which parts of the view need a refresh. */
  update(hass: Hass): Set<Change> {
    this.hass = hass;
    const changes = new Set<Change>();
    const hasStates = Object.keys(hass.states).length > 0;
    if (this.regRef !== hass.entities || (hasStates && !this.indexedWithStates)) {
      this.regRef = hass.entities;
      this.indexedWithStates = hasStates;
      this.reindex(hass);
      for (const c of ["lighting", "openings", "markers", "tints", "labels", "status", "readings"] as Change[]) changes.add(c);
      for (const id of this.kinds.keys()) this.seen.set(id, hass.states[id]);
      for (const id of this.presenceIds) this.presenceSeen.set(id, hass.states[id]);
      this.locate();
      return changes;
    }
    for (const [id, kinds] of this.kinds) {
      const s = hass.states[id];
      if (s !== this.seen.get(id)) {
        this.seen.set(id, s);
        for (const k of kinds) changes.add(k);
      }
    }
    // trackers change often (a distance, a signal); the view only hears of it when someone changes room
    let moved = false;
    for (const id of this.presenceIds) {
      const s = hass.states[id];
      if (s !== this.presenceSeen.get(id)) {
        this.presenceSeen.set(id, s);
        moved = true;
      }
    }
    if (moved && this.locate()) for (const c of ["tints", "labels", "status"] as Change[]) changes.add(c);
    return changes;
  }

  private watch(id: string | null | undefined, ...kinds: Change[]): void {
    if (!id) return;
    let set = this.kinds.get(id);
    if (!set) this.kinds.set(id, (set = new Set()));
    for (const k of kinds) set.add(k);
  }

  private reindex(hass: Hass): void {
    this.kinds.clear();
    this.rooms.clear();
    this.cameraMotion.clear();
    this.evSpaces.clear();
    this.presence = [];
    const set = this.plan.settings.presence;
    if (this.peopleInRooms && set?.enabled !== false) {
      const trackers = roomTrackers(hass);
      for (const id of Object.keys(hass.states)) if (domainOf(id) === "person") this.presence.push({ person: id, sources: sourcesOf(hass, id, set, trackers) });
    }
    this.presenceIds = new Set(this.presence.flatMap((p) => [p.person, ...p.sources]));
    // people, and alarms anywhere in the house, feed the top bar
    for (const id of Object.keys(hass.states)) {
      const dom = domainOf(id);
      if (dom === "person" || dom === "alarm_control_panel") this.watch(id, "status");
      else if (dom === "binary_sensor" && ALERT_CLASSES.has(String(hass.states[id].attributes.device_class))) this.watch(id, "status");
    }
    const byArea = new Map<string, string[]>();
    for (const id of Object.keys(hass.entities ?? {})) {
      const reg = hass.entities![id];
      if (reg.hidden || reg.entity_category) continue;
      const area = areaOf(hass, id);
      if (!area) continue;
      let list = byArea.get(area);
      if (!list) byArea.set(area, (list = []));
      list.push(id);
    }
    // a thermostat, valve or motion or presence sensor placed in the plan belongs to the room it is
    // in, else to its area's rooms. A radiator linked to a thermostat (a radiator valve) makes it its
    // room's; linked to one that is placed in another room too (the house's thermostat), or to a valve
    // or switch, it only warms its room while it heats.
    const isMotion = (id: string) => domainOf(id) === "binary_sensor" && MOTION_CLASSES.has(String(hass.states[id]?.attributes.device_class));
    const found: { entity: string; key: string; piece: boolean; heater: boolean }[] = [];
    for (const floor of this.plan.floors) {
      const sp = spaces(floor);
      for (const x of [...floor.devices, ...floor.furniture]) {
        const piece = "type" in x;
        const heater = piece && HEAT_TYPES.has(x.type);
        const climate = !!x.entity && domainOf(x.entity) === "climate";
        if (!x.entity || (!climate && !heater && !isMotion(x.entity))) continue;
        // an air conditioner's outdoor unit is in no room
        const space = sp.find((s) => ((!climate && !heater) || !s.outdoor) && pointInPolygon([x.x, x.z], s.points));
        if (space) found.push({ entity: x.entity, key: `${floor.id}/${space.id}`, piece, heater });
      }
    }
    const anywhere = new Set(found.map((x) => x.entity));
    const roomsOf = new Map<string, Set<string>>();
    for (const x of found) roomsOf.set(x.entity, (roomsOf.get(x.entity) ?? new Set()).add(x.key));
    const placed = new Map<string, string[]>();
    const warms = new Map<string, string[]>();
    for (const x of found) {
      const own = (domainOf(x.entity) === "climate" || isMotion(x.entity)) && (!x.piece || roomsOf.get(x.entity)!.size === 1);
      const to = own ? placed : x.heater ? warms : null;
      to?.set(x.key, [...(to.get(x.key) ?? []), x.entity]);
    }
    for (const floor of this.plan.floors) {
      for (const space of spaces(floor)) {
        const room = (floor.rooms.find((r) => r.id === space.id) ?? space) as Partial<Room> & Space;
        const ids = room.area_id ? byArea.get(room.area_id) ?? [] : [];
        const cls = (id: string) => hass.states[id]?.attributes.device_class;
        const pick = (dc: string, unit: RegExp) =>
          ids.find((id) => domainOf(id) === "sensor" && cls(id) === dc && unit.test(String(hass.states[id]?.attributes.unit_of_measurement ?? "")) && !NOT_ROOM_TEMP.test(id)) ?? null;
        const here = placed.get(`${floor.id}/${room.id}`) ?? [];
        const climates = space.outdoor ? [] : [...new Set([
          ...here.filter((id) => domainOf(id) === "climate"),
          ...ids.filter((id) => domainOf(id) === "climate" && !anywhere.has(id)),
        ])];
        const w: RoomWatch = {
          temperature: room.temperature ?? (space.outdoor ? null : pick("temperature", /°/)),
          humidity: room.humidity ?? (space.outdoor ? null : pick("humidity", /%/)),
          alerts: ids.filter((id) => domainOf(id) === "binary_sensor" && ALERT_CLASSES.has(String(cls(id)))),
          motion: [...new Set([...here.filter(isMotion), ...ids.filter((id) => isMotion(id) && !anywhere.has(id))])],
          lights: ids.filter((id) => domainOf(id) === "light"),
          climates,
          heating: [...new Set([...climates, ...(warms.get(`${floor.id}/${room.id}`) ?? [])])],
          label: space.label ?? (space.outdoor ? [] : DEFAULT_LABEL),
        };
        this.rooms.set(`${floor.id}/${room.id}`, w);
        for (const id of w.label) if (id !== "temperature" && id !== "humidity") this.watch(id, "labels");
        for (const id of w.climates) this.watch(id, "labels", "tints");
        for (const id of w.heating) this.watch(id, "tints");
        this.watch(w.temperature, "labels", "tints");
        this.watch(w.humidity, "labels");
        for (const id of w.lights) this.watch(id, "status");
        for (const id of w.alerts) this.watch(id, "tints");
        for (const id of w.motion) this.watch(id, "tints");
      }
      for (const d of floor.devices) {
        const dom = domainOf(d.entity);
        // a reading's pin (only the editor shows it) looks the same whatever the value
        const reading = showsValue(d);
        if (dom === "light" || dom === "switch") this.watch(d.entity, "lighting", "markers", "status", ...(reading ? ["readings" as const] : []));
        else this.watch(d.entity, reading ? "readings" : "markers");
        // what a speaker plays shows on its label
        if (dom === "media_player") this.watch(d.entity, "readings");
        if (dom === "camera") {
          const dev = hass.entities?.[d.entity]?.device_id;
          const motion = dev ? Object.values(hass.entities ?? {})
            .filter((e) => e.device_id === dev && domainOf(e.entity_id) === "binary_sensor" && MOTION_CLASSES.has(String(hass.states[e.entity_id]?.attributes.device_class)))
            .map((e) => e.entity_id) : [];
          this.cameraMotion.set(d.entity, motion);
          for (const id of motion) this.watch(id, "markers");
        }
      }
      for (const f of floor.furniture) {
        // solar panels relight when the house's solar moves a step, and chargers and cars when one starts
        // or stops charging (the view sees to both), not on every reading
        if (EV_TYPES.has(f.type)) {
          const space = spaces(floor).find((sp) => pointInPolygon([f.x, f.z], sp.points));
          if (space) this.evSpaces.set(`${floor.id}/${space.id}`, [...(this.evSpaces.get(`${floor.id}/${space.id}`) ?? []), f]);
          this.watch(f.parked && f.parked !== "plugged" ? f.parked : null, "labels");
          continue;
        }
        if (f.type === "solar_panels" && f.entity && domainOf(f.entity) === "sensor") continue;
        this.watch(f.entity, "lighting", "markers");
        if (f.entity && domainOf(f.entity) === "media_player") this.watch(f.entity, "readings");
        if (GANG_TYPES.has(f.type)) for (const id of gangsOf(f)) this.watch(id, "lighting");
        this.watch(f.light, "lighting");
        if (WATER_TYPES.has(f.type)) this.watch(f.entity, "readings");
      }
      for (const o of floor.openings) {
        this.watch(o.entity, "openings", "lighting");
        this.watch(o.cover, "openings");
        // a lock's badge, and its door's sensor (open while locked is a problem)
        if (o.lock) for (const id of [o.lock, o.entity]) this.watch(id, "readings");
      }
      // a roof window that opens glows warm, like a window in a wall
      for (const r of floor.roofs ?? []) for (const it of r.items ?? []) if (it.kind === "window") this.watch(it.entity, "lighting");
    }
    // one thermostat in the whole home runs the boiler for every room: they all warm while it heats
    // (an air conditioner is its room's own)
    const acs = new Set(this.plan.floors.flatMap((f) => f.furniture.filter((x) => AC_TYPES.has(x.type)).map((x) => x.entity)));
    const all = new Set([...this.rooms.values()].flatMap((w) => w.heating).filter((id) => !acs.has(id) && domainOf(id) === "climate"));
    if (all.size === 1) {
      const [only] = all;
      for (const floor of this.plan.floors) {
        for (const space of spaces(floor)) {
          const w = this.rooms.get(`${floor.id}/${space.id}`);
          if (!w || space.outdoor || w.climates.length) continue;
          w.heating = [...new Set([...w.heating, only])];
          this.watch(only, "tints");
        }
      }
    }
  }

  private state(id: string | null | undefined): HassEntity | undefined {
    return id ? this.hass?.states[id] : undefined;
  }

  /**
   * Every entity whose state the view shows. Room trackers are left out: a replay of the past shows
   * people home or away, never where they went.
   */
  watched(): string[] {
    return [...this.kinds.keys()];
  }

  /** Puts everyone who is home into the room their first tracker that names one says; true when someone moved. */
  private locate(): boolean {
    this.where.clear();
    const hass = this.hass;
    if (hass) {
      for (const { person, sources } of this.presence) {
        // away (or in another zone), a tracker's last room is out of date
        const p = hass.states[person];
        if (p && (p.state === "not_home" || (p.state !== "home" && hass.states[`zone.${slug(p.state)}`]))) continue;
        for (const id of sources) {
          const at = roomOf(this.plan, hass, hass.states[id]);
          if (!at) continue;
          this.where.set(person, { ...at, key: `${this.plan.floors[at.floor].id}/${spaces(this.plan.floors[at.floor])[at.room].id}` });
          break;
        }
      }
    }
    const key = [...this.where].map(([p, at]) => `${p}@${at.key}`).join("|");
    if (key === this.whereKey) return false;
    this.whereKey = key;
    return true;
  }

  /** Where someone is: the floor and space index of their room, if a tracker knows it. */
  personRoom(person: string): { floor: number; room: number } | null {
    const at = this.where.get(person);
    return at ? { floor: at.floor, room: at.room } : null;
  }

  /** The trackers a person's room is read from (the first that names a room wins). */
  presenceSources(person: string): string[] {
    return this.presence.find((p) => p.person === person)?.sources ?? [];
  }

  /** The people in a room now. */
  roomPeople(floor: Floor, room: { id: string }): Person[] {
    if (!this.where.size) return [];
    const key = `${floor.id}/${room.id}`;
    return [...this.where].filter(([, at]) => at.key === key).map(([id]) => this.person(id)).filter((p): p is Person => !!p);
  }

  private occupied(floor: Floor, room: { id: string }): boolean {
    const key = `${floor.id}/${room.id}`;
    for (const at of this.where.values()) if (at.key === key) return true;
    return false;
  }

  /**
   * Where an entity is: the room (or garden area) of a device, lamp or door it is linked to in the
   * plan, the room of the camera whose motion sensor it is, else the first room of its area. The
   * room is an index into the floor's spaces, -1 when only the floor is known.
   */
  place(entity: string): { floor: number; room: number } | null {
    const floors = this.plan.floors;
    for (let fi = 0; fi < floors.length; fi++) {
      const floor = floors[fi];
      const sp = spaces(floor);
      const at = (x: number, z: number) => sp.findIndex((s) => pointInPolygon([x, z], s.points));
      const d = floor.devices.find((x) => x.entity === entity);
      if (d) return { floor: fi, room: at(d.x, d.z) };
      const o = floor.openings.find((x) => x.entity === entity || x.cover === entity || x.lock === entity);
      if (o) return { floor: fi, room: sp.findIndex((s) => s.id === o.room_id) };
      const f = floor.furniture.find((x) => x.parked === entity || linkedEntities(x).includes(entity));
      if (f) return { floor: fi, room: at(f.x, f.z) };
    }
    for (const [camera, motion] of this.cameraMotion) if (motion.includes(entity)) return this.place(camera);
    const area = this.hass ? areaOf(this.hass, entity) : null;
    if (!area) return null;
    for (let fi = 0; fi < floors.length; fi++) {
      const ri = spaces(floors[fi]).findIndex((s) => s.area_id === area);
      if (ri >= 0) return { floor: fi, room: ri };
    }
    return null;
  }

  // ------------------------------------------------------------------ LiveSource

  lamp(l: LampInfo): LampState | null {
    const s = this.state(l.entity);
    if (!s || isUnavailable(s)) return null;
    const dom = domainOf(s.entity_id);
    if (dom === "light") {
      if (s.state !== "on") return { on: false, rgb: [0, 0, 0], level: 0 };
      const a = s.attributes;
      const level = typeof a.brightness === "number" ? a.brightness / 255 : 1;
      let rgb: V3;
      if (Array.isArray(a.rgb_color)) rgb = normalise(lin((a.rgb_color[0] << 16) | (a.rgb_color[1] << 8) | a.rgb_color[2]));
      else if (typeof a.color_temp_kelvin === "number") rgb = kelvinToRgb(a.color_temp_kelvin);
      else rgb = kelvinToRgb(2900);
      return { on: true, rgb, level };
    }
    // a lamp on a smart plug
    const on = s.state === "on";
    return { on, rgb: kelvinToRgb(2800), level: on ? 1 : 0 };
  }

  glowColor(g: GlowSlot): V3 | null {
    const marked = g.item ? this.itemMarks?.get(g.item)?.glow : null;
    if (marked) return marked;
    if (g.type && EV_TYPES.has(g.type)) return evGlow(this.ev(g.entity), this.day);
    if (g.type === "solar_panels" && !g.entity) return solarGlow(this.energy, null, this.day);
    // an access point is red while offline (unavailable too), a switch's gangs light while on, an air
    // conditioner with its mode, a radiator while it heats
    if (g.type && GLOW_TYPES.has(g.type)) return g.entity ? deviceGlow(g.type, this.state(g.entity)) : null;
    const s = this.state(g.entity);
    if (!s || isUnavailable(s)) return null;
    // a post box's window glows warm while its sensor says there is post
    if (g.type && POST_TYPES.has(g.type)) return holdsPost(s.state) ? [1.0, 0.68, 0.28] : null;
    if (g.kind === "lamp") {
      const l = this.lamp({ entity: g.entity } as LampInfo);
      if (!l?.on) return null;
      const k = 0.55 + 0.45 * l.level;
      // the shade glows towards white, tinted by the light
      return [Math.min(1, (l.rgb[0] * 0.6 + 0.45) * k), Math.min(1, (l.rgb[1] * 0.6 + 0.45) * k), Math.min(1, (l.rgb[2] * 0.6 + 0.45) * k)];
    }
    if (g.kind === "screen") {
      const dom = domainOf(s.entity_id);
      if (dom === "sensor") return solarGlow(this.energy, s, this.day);
      const on = dom === "media_player" ? !["off", "standby"].includes(s.state) : s.state === "on";
      if (!on) return null;
      return s.state === "playing" ? [0.42, 0.62, 1.0] : [0.22, 0.3, 0.45];
    }
    return null;
  }

  contact(entity: string | null | undefined): number | null {
    const s = this.state(entity);
    if (!s || isUnavailable(s)) return null;
    const dom = domainOf(s.entity_id);
    if (dom === "cover") return coverLevel(s);
    if (dom === "lock") return s.state === "unlocked" || s.state === "open" ? 1 : 0;
    return s.state === "on" || s.state === "open" ? 1 : 0;
  }

  cover(entity: string | null | undefined): number | null {
    const s = this.state(entity);
    if (!s || isUnavailable(s)) return null;
    return coverLevel(s);
  }

  marker(d: Device): MarkerLook | null {
    const s = this.state(d.entity);
    const dom = domainOf(d.entity);
    if (dom === "light") return null;
    const dc = s?.attributes.device_class;
    const look = (icon: string, color: number, pulse = 0): MarkerLook => ({
      icon: iconIndex(icon), color, pulse, attention: pulse > 0 || color === C.alert || color === C.open,
    });
    // attention fades: pulsing only during the first minute after a change
    const fresh = s ? this.now() - Date.parse(s.last_changed) < 60_000 : false;
    if (!s || isUnavailable(s)) {
      const icon = dom === "binary_sensor" && dc ? (MOTION_CLASSES.has(dc) ? "motion-off" : OPENING_CLASSES.has(dc) ? "door" : ALERT_CLASSES.has(dc) ? "smoke" : "dot") : iconName(dom, dc, s);
      return look(icon, C.unavailable);
    }
    const on = s.state === "on";
    switch (dom) {
      case "binary_sensor":
        if (dc && MOTION_CLASSES.has(dc)) return look(on ? "motion" : "motion-off", on ? C.motion : C.idle, on && fresh ? 1 : 0);
        if (dc && ALERT_CLASSES.has(dc)) return look(dc === "moisture" ? "water" : "smoke", on ? C.alert : C.idle, on ? 1 : 0);
        if (dc && OPENING_CLASSES.has(dc)) return look(dc === "window" ? (on ? "window-open" : "window") : on ? "door-open" : "door", on ? C.open : C.closed);
        return look("dot", on ? C.on : C.idle);
      case "camera":
        // the camera is drawn as a model with its view; a pin only says it is live or sees motion
        return this.cameraActive(d) ? look(/doorbell/i.test(d.entity) ? "doorbell" : "camera", C.alert) : null;
      case "media_player":
        return look(/tv|television|webos|xbox|plex/i.test(d.entity) ? "tv" : "speaker", ["off", "standby"].includes(s.state) ? C.off : C.media, s.state === "playing" ? 0.35 : 0);
      case "climate": {
        const action = s.attributes.hvac_action;
        return look("thermostat", action === "heating" ? C.heat : action === "cooling" ? C.cool : s.state === "off" ? C.off : C.idle);
      }
      case "lock":
        return look(s.state === "locked" ? "lock" : "lock-open", s.state === "locked" ? C.secure : C.alert);
      case "alarm_control_panel":
        if (s.state === "triggered") return look("alarm", C.alert, 1);
        return look(s.state.startsWith("armed") ? "alarm" : "alarm-off", s.state.startsWith("armed") ? C.secure : C.off, s.state === "pending" || s.state === "arming" ? 0.6 : 0);
      case "vacuum":
        return look("vacuum", s.state === "cleaning" ? C.camera : C.idle, s.state === "cleaning" ? 0.4 : 0);
      case "cover":
        return look(dc === "blind" || dc === "shutter" ? "blinds" : "curtains", (coverLevel(s) ?? 0) > 0.05 ? C.on : C.idle);
      case "fan":
        return look("fan", on ? C.cool : C.off);
      case "sensor":
        return look(iconName(dom, dc, s), C.idle);
      default:
        return look(iconName(dom, dc, s), on ? C.on : C.off);
    }
  }

  tint(floor: Floor, room: { id: string }): [number, number, number, number] | null {
    const w = this.rooms.get(`${floor.id}/${room.id}`);
    if (!w || !this.hass) return null;
    if (w.alerts.some((id) => this.hass!.states[id]?.state === "on")) return [0.9, 0.12, 0.1, 0.42];
    if (this.roomTint) {
      const space = spaces(floor).find((x) => x.id === room.id);
      const t = space ? this.roomTint(floor, space) : null;
      if (t) return t;
    }
    if (this.heatmap) {
      const v = this.roomTemperature(w);
      if (v !== null) return [...heatColour(v), 0.42];
      return null;
    }
    // someone is there: motion, a presence sensor, or a person's room tracker
    if (w.motion.some((id) => this.hass!.states[id]?.state === "on") || this.occupied(floor, room)) return [1.0, 0.72, 0.32, 0.09];
    if (w.heating.some((id) => heats(this.state(id)))) return TINT_HEAT;
    // cooling is a room's own (an air conditioner), never the whole home's
    if (w.climates.some((id) => this.state(id)?.attributes.hvac_action === "cooling")) return TINT_COOL;
    if (w.climates.some((id) => this.state(id)?.attributes.hvac_action === "fan")) return TINT_FAN;
    return null;
  }

  /** The room's temperature: its sensor's, else what its thermostat or valve reads. */
  private roomTemperature(w: RoomWatch): number | null {
    const t = this.state(w.temperature);
    const v = t && !isUnavailable(t) ? parseFloat(t.state) : NaN;
    if (!isNaN(v)) return v;
    const c = shownClimate(w.climates.map((id) => this.state(id)));
    return c?.current ?? null;
  }

  cameraState(d: Device): "idle" | "active" | "offline" {
    const s = this.state(d.entity);
    if (!s || isUnavailable(s)) return "offline";
    return this.cameraActive(d) ? "active" : "idle";
  }

  /** A camera that is live or sees motion right now. */
  cameraActive(d: Device): boolean {
    const s = this.state(d.entity);
    if (s && (s.state === "streaming" || s.state === "recording")) return true;
    return (this.cameraMotion.get(d.entity) ?? []).some((id) => this.hass?.states[id]?.state === "on");
  }

  /** Leaks, smoke, gas anywhere in the house, and a triggered alarm. */
  alerts(): Alert[] {
    const hass = this.hass;
    if (!hass) return [];
    const out: Alert[] = [];
    for (const [id, s] of Object.entries(hass.states)) {
      const dom = domainOf(id);
      if (dom === "alarm_control_panel" && s.state === "triggered") out.push({ id, text: t("alert.alarm", { name: String(s.attributes.friendly_name ?? id) }) });
      else if (dom === "binary_sensor" && s.state === "on") {
        const dc = String(s.attributes.device_class);
        if (ALERT_CLASSES.has(dc)) {
          const area = areaOf(hass, id);
          const where = area ? hass.areas?.[area]?.name : null;
          const kind = ALERTS.find((a) => a === dc);
          const alert = kind ? t(`alert.${kind}`) : t("alert.other");
          out.push({ id, text: where ? t("alert.in", { alert, area: where }) : alert });
        }
      }
    }
    return out;
  }

  /** Lights of the plan that are on, on one floor or (null) in the whole house. */
  lightsOn(floorIndex: number | null): string[] {
    const hass = this.hass;
    if (!hass) return [];
    const ids = new Set<string>();
    this.plan.floors.forEach((f, i) => {
      if (floorIndex !== null && i !== floorIndex) return;
      for (const d of f.devices) if (domainOf(d.entity) === "light") ids.add(d.entity);
      for (const x of f.furniture) if (x.entity && domainOf(x.entity) === "light") ids.add(x.entity);
      for (const sp of spaces(f)) for (const id of this.rooms.get(`${f.id}/${sp.id}`)?.lights ?? []) ids.add(id);
    });
    return [...ids].filter((id) => hass.states[id]?.state === "on");
  }

  people(): Person[] {
    const hass = this.hass;
    if (!hass) return [];
    return Object.keys(hass.states).filter((id) => domainOf(id) === "person").map((id) => this.person(id)!);
  }

  private person(id: string): Person | null {
    const s = this.hass?.states[id];
    if (!s) return null;
    const at = this.where.get(id);
    return {
      id,
      name: String(s.attributes.friendly_name ?? id.slice(7)),
      // a person whose tracker names a room is home, whatever their state says
      home: s.state === "home" || !!at,
      where: s.state === "home" || at ? t("person.home") : s.state === "not_home" ? t("person.away") : isUnavailable(s) ? t("person.unknown") : s.state,
      picture: typeof s.attributes.entity_picture === "string" ? s.attributes.entity_picture : null,
      room: at ? spaces(this.plan.floors[at.floor])[at.room]?.name ?? null : null,
    };
  }

  /** An extension's tag over a piece of furniture; lit while the piece glows. */
  itemTag(item: Furniture): { text: string; lit: boolean } | null {
    const m = this.itemMarks?.get(item.id);
    return m?.text ? { text: m.text, lit: !!m.glow } : null;
  }

  /** The line under a room's name, e.g. "21.4° · 48 %". */
  roomText(floor: Floor, room: { id: string }): string | null {
    const parts = this.roomLine(floor, room);
    return parts.length ? parts.map((p) => p.text).join(" · ") : null;
  }

  /**
   * The line under a room's name in pieces, as its label lists them: "20.5° → 21°" opens the room's
   * thermostat, any other value its entity.
   */
  roomLine(floor: Floor, room: { id: string }): RoomPart[] {
    const w = this.rooms.get(`${floor.id}/${room.id}`);
    if (!w) return [];
    const parts: RoomPart[] = [];
    for (const what of w.label) {
      if (what === "temperature") {
        const c = shownClimate(w.climates.map((id) => this.state(id)));
        // what the thermostat reads goes with its setpoint, as its dialog shows them
        const text = heatText(c?.current ?? this.roomTemperature(w), c?.target ?? null);
        if (text) parts.push(c ? { text, entity: c.entity, heating: w.climates.some((id) => this.state(id)?.attributes.hvac_action === "heating") } : { text });
      } else if (what === "humidity") {
        const h = this.state(w.humidity);
        if (h && !isUnavailable(h) && !isNaN(parseFloat(h.state))) parts.push({ text: `${Math.round(parseFloat(h.state))} %` });
      } else if (this.hass) {
        parts.push({ text: valueText(this.hass, what), entity: what });
      }
    }
    // a car that is here, or a charger with a car plugged in
    const cars = new Set((this.evSpaces.get(`${floor.id}/${room.id}`) ?? [])
      .filter((f) => (CAR_TYPES.has(f.type) ? this.carHere(f) : !["unplugged", "unknown"].includes(this.ev(f.entity ?? null)?.state ?? "unknown")))
      .map((f) => this.ev(f.entity ?? null)));
    for (const ev of cars) if (ev) parts.push({ text: evText(ev) });
    if (this.roomExtraText) {
      const space = spaces(floor).find((x) => x.id === room.id);
      const extra = space ? this.roomExtraText(floor, space) : null;
      if (extra) parts.push({ text: extra });
    }
    return parts;
  }

  /** A device shown by its value (a reading): its text and icon, or null while there are no states. */
  reading(d: Device): Reading | null {
    if (!this.hass) return null;
    return { text: valueText(this.hass, d.entity), icon: readingIcon(this.hass, d.entity) };
  }

  /** A door's smart lock: locked, unlocked, jammed, gone, or a problem (locked while the door is open). */
  lockBadge(o: Opening): LockBadge | null {
    if (!o.lock || !this.hass) return null;
    const kind = lockKind(this.state(o.lock), this.contact(o.entity));
    return { kind, text: t(`lock.${kind}`) };
  }

  /** What a TV or speaker plays now, or null (off, idle, nothing named). */
  nowPlaying(entity: string | null, tv: boolean): NowPlaying | null {
    const s = this.state(entity);
    const text = mediaText(s, tv);
    if (!text || !this.hass) return null;
    return { text, picture: tv ? artwork(this.hass, s) : null };
  }

  /** A hot water cylinder's temperature, and what it heats to: "52.0° → 55°". */
  pieceReading(f: Furniture): Reading | null {
    if (!this.hass || !WATER_TYPES.has(f.type)) return null;
    const w = waterTemperature(this.state(f.entity));
    return { text: (w && heatText(w.current, w.target !== null ? degrees(w.target) : null)) || "–", icon: "water" };
  }

  /** How fast a ceiling fan's blades turn. */
  fanTurns(entity: string | null): number {
    return turnsOf(this.state(entity));
  }

  /** The charger a car or charger of the plan is linked to (any of its entities), else the house's first. */
  ev(entity: string | null): EvNow | null {
    const e = this.energy;
    if (!e?.now) return null;
    const i = entity ? e.sources.ev.findIndex((c) => chargerEntities(c).includes(entity)) : 0;
    return e.now.ev[i] ?? null;
  }

  /** Whether a car of the plan is here now, as its "parked" says (with nothing to go by, it is). */
  carHere(f: Furniture): boolean {
    if (!f.parked) return true;
    if (f.parked === "plugged") {
      const st = this.ev(f.entity ?? null)?.state;
      return !st || st !== "unplugged";
    }
    const s = this.state(f.parked);
    if (!s || isUnavailable(s)) return true;
    const dom = domainOf(f.parked);
    if (dom === "device_tracker" || dom === "person") return s.state === "home";
    if (dom === "binary_sensor" || dom === "input_boolean") return s.state === "on";
    return !["off", "not_home", "away", "unplugged", "disconnected"].includes(s.state.toLowerCase());
  }

  /** Lights of a room's area (double-tap toggles them all). */
  roomLights(floor: Floor, room: { id: string }): string[] {
    return this.rooms.get(`${floor.id}/${room.id}`)?.lights ?? [];
  }
}

/**
 * Solar cells: dark while the panels make nothing, a brighter blue the more they make. Linked to a
 * power sensor of their own, or (unlinked) to the house's solar.
 */
function solarGlow(energy: EnergyLive | null, s: HassEntity | null, day: boolean): V3 | null {
  let k: number;
  if (s) {
    if (isUnavailable(s) || s.attributes.device_class !== "power") return null;
    const v = parseFloat(s.state) * (s.attributes.unit_of_measurement === "W" ? 1e-3 : 1);
    k = isFinite(v) && v > 0 ? solarStep(Math.min(1, v / (energy?.solarPeak() ?? 3))) : 0;
  } else {
    k = energy ? solarStep(energy.solarLevel()) : 0;
  }
  if (k <= 0.02) return null;
  const d = day ? 0.4 : 1;
  return [(0.02 + 0.05 * k) * d, (0.04 + 0.12 * k) * d, (0.12 + 0.36 * k) * d];
}

/** A charger's light and a car's charging port: green charging, blue plugged in, amber waiting. */
function evGlow(ev: EvNow | null, day: boolean): V3 | null {
  if (!ev) return null;
  const c: V3 | null =
    ev.state === "charging" ? [0.12, 0.85, 0.35]
    : ev.state === "plugged" || ev.state === "finished" ? [0.18, 0.45, 1.0]
    : ev.state === "approval" || ev.state === "paused" ? [1.0, 0.6, 0.1]
    : ev.state === "fault" ? [1.0, 0.15, 0.1]
    : null;
  const k = day ? 0.55 : 1;
  return c && [c[0] * k, c[1] * k, c[2] * k];
}

/** Under the driveway's name: "Car 52% · charging". */
function evText(ev: EvNow): string {
  const what = ev.state === "unplugged" || ev.state === "unknown" ? "" : t(`room.ev.${ev.state}`);
  return [ev.level !== null ? t("room.carLevel", { level: Math.round(ev.level) }) : t("room.car"), what].filter(Boolean).join(" · ");
}

/**
 * Which of a room's thermostats and valves its label shows: the one set warmest of those that are on,
 * else the first that is there (it reads the temperature, and a tap opens it to turn it on).
 */
export function shownClimate(states: (HassEntity | undefined)[]): { entity: string; current: number | null; target: string | null } | null {
  const there = states.filter((s): s is HassEntity => !isUnavailable(s));
  const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
  // a heat-and-cool range is told by its low end, which is what heats
  const setpoint = (s: HassEntity) => num(s.attributes.temperature) ?? num(s.attributes.target_temp_low);
  let best: HassEntity | null = null;
  for (const s of there) {
    const v = setpoint(s);
    if (s.state === "off" || v === null) continue;
    if (!best || v > setpoint(best)!) best = s;
  }
  const s = best ?? there[0];
  if (!s) return null;
  let target: string | null = null;
  if (best) {
    const lo = num(s.attributes.target_temp_low), hi = num(s.attributes.target_temp_high);
    target = num(s.attributes.temperature) === null && lo !== null && hi !== null ? `${degrees(lo, false)}–${degrees(hi)}` : degrees(setpoint(s)!);
  }
  return { entity: s.entity_id, current: num(s.attributes.current_temperature), target };
}

/** "20.5° → 21°", "20.5°" while the heating is off, "→ 21°" with nothing reading the room. */
export function heatText(current: number | null, target: string | null): string | null {
  const now = current !== null ? `${current.toFixed(1)}°` : null;
  if (!target) return now;
  return now ? `${now} → ${target}` : `→ ${target}`;
}

/** A setpoint as thermostats show it: "21°", "20.5°". */
function degrees(v: number, mark = true): string {
  const r = Math.round(v * 10) / 10;
  return `${Number.isInteger(r) ? r : r.toFixed(1)}${mark ? "°" : ""}`;
}

/** The panels' brightness in tenths: the 3D view only relights when it moves a step. */
export function solarStep(level: number): number {
  return Math.round(level * 10) / 10;
}

/** Room temperature to a colour: blue below 17°, green around 20°, red from 25°. */
export function heatColour(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, (t - 16) / 10));
  // blue -> cyan -> green -> yellow -> red
  const stops: [number, number, number][] = [[0.15, 0.35, 1], [0.1, 0.8, 0.95], [0.3, 0.85, 0.35], [1, 0.8, 0.15], [1, 0.25, 0.12]];
  const f = x * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(f));
  const k = f - i;
  const a = stops[i], b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function coverLevel(s: HassEntity): number | null {
  if (typeof s.attributes.current_position === "number") return s.attributes.current_position / 100;
  if (s.state === "open" || s.state === "opening") return 1;
  if (s.state === "closed" || s.state === "closing") return 0;
  return null;
}

function normalise(c: V3): V3 {
  const m = Math.max(c[0], c[1], c[2], 1e-3);
  return [c[0] / m, c[1] / m, c[2] / m];
}

function iconName(domain: string, dc: string | undefined, s: HassEntity | undefined): string {
  if (domain === "sensor") {
    if (dc === "temperature") return "thermometer";
    if (dc === "humidity") return "humidity";
    if (dc === "power" || dc === "energy") return "power";
    if (dc === "battery") return "battery";
    return "gauge";
  }
  const map: Record<string, string> = {
    switch: "plug", input_boolean: "switch", fan: "fan", climate: "thermostat", camera: "camera",
    media_player: "speaker", lock: "lock", alarm_control_panel: "alarm", vacuum: "vacuum", cover: "curtains",
    binary_sensor: "dot", assist_satellite: "mic", button: "dot", humidifier: "air-purifier",
  };
  void s;
  return map[domain] ?? "dot";
}

/** "Kadir Eker" -> "KE": a person without a picture. */
export function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

/** Toggles what can be toggled; false means "open its dialog instead". */
export async function toggleEntity(hass: Hass, entityId: string): Promise<boolean> {
  const dom = domainOf(entityId);
  if (["light", "switch", "fan", "input_boolean", "cover", "siren", "humidifier"].includes(dom)) {
    await hass.callService(dom, "toggle", {}, { entity_id: entityId });
    return true;
  }
  if (dom === "media_player") {
    const s = hass.states[entityId];
    if (s && ["playing", "paused"].includes(s.state)) {
      await hass.callService(dom, "media_play_pause", {}, { entity_id: entityId });
      return true;
    }
  }
  return false;
}
