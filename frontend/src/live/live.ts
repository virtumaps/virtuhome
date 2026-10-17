// Translates Home Assistant states into what the 3D view shows, and tells the view which parts
// to refresh when states change. Home Assistant replaces a state object whenever it changes, so
// spotting changes is a cheap identity comparison over the entities the plan uses.
import { pointInPolygon } from "../model/geom";
import { spaces, type Device, type Floor, type Furniture, type Plan, type Room, type Space } from "../model/plan";
import type { GlowSlot, LampInfo } from "../scene/build";
import { lin } from "../scene/build";
import type { V3 } from "../scene/geo";
import { kelvinToRgb, type LampState } from "../scene/lighting";
import { CAR_TYPES, EV_TYPES } from "../scene/furniture-lib";
import { iconIndex } from "../scene/markers";
import type { LiveSource, MarkerLook } from "../scene/viewer";
import type { EnergyLive } from "./energy";
import { chargerEntities, type EvNow } from "./ev";
import { areaOf, domainOf, type Hass, type HassEntity } from "./hass";

export type Change = "lighting" | "openings" | "markers" | "tints" | "labels" | "status";

export type RGBA = [number, number, number, number];
/** An extension's colour for a room (null leaves it to the core), and its text under the room's name. */
export type RoomTint = (floor: Floor, space: Space) => RGBA | null;
export type RoomText = (floor: Floor, space: Space) => string | null;

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
}

const ALERT_NAMES: Record<string, string> = {
  smoke: "Smoke", gas: "Gas", moisture: "Water leak", carbon_monoxide: "Carbon monoxide", safety: "Safety alert",
};

interface RoomWatch {
  temperature: string | null;
  humidity: string | null;
  alerts: string[];
  motion: string[];
  lights: string[];
}

const ALERT_CLASSES = new Set(["smoke", "gas", "moisture", "carbon_monoxide", "safety"]);
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
      for (const c of ["lighting", "openings", "markers", "tints", "labels", "status"] as Change[]) changes.add(c);
      for (const id of this.kinds.keys()) this.seen.set(id, hass.states[id]);
      return changes;
    }
    for (const [id, kinds] of this.kinds) {
      const s = hass.states[id];
      if (s !== this.seen.get(id)) {
        this.seen.set(id, s);
        for (const k of kinds) changes.add(k);
      }
    }
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
    for (const floor of this.plan.floors) {
      for (const space of spaces(floor)) {
        const room = (floor.rooms.find((r) => r.id === space.id) ?? space) as Partial<Room> & Space;
        const ids = room.area_id ? byArea.get(room.area_id) ?? [] : [];
        const cls = (id: string) => hass.states[id]?.attributes.device_class;
        const pick = (dc: string, unit: RegExp) =>
          ids.find((id) => domainOf(id) === "sensor" && cls(id) === dc && unit.test(String(hass.states[id]?.attributes.unit_of_measurement ?? "")) && !NOT_ROOM_TEMP.test(id)) ?? null;
        const w: RoomWatch = {
          temperature: room.temperature ?? (space.outdoor ? null : pick("temperature", /°/)),
          humidity: room.humidity ?? (space.outdoor ? null : pick("humidity", /%/)),
          alerts: ids.filter((id) => domainOf(id) === "binary_sensor" && ALERT_CLASSES.has(String(cls(id)))),
          motion: ids.filter((id) => domainOf(id) === "binary_sensor" && MOTION_CLASSES.has(String(cls(id)))),
          lights: ids.filter((id) => domainOf(id) === "light"),
        };
        this.rooms.set(`${floor.id}/${room.id}`, w);
        this.watch(w.temperature, "labels", "tints");
        this.watch(w.humidity, "labels");
        for (const id of w.lights) this.watch(id, "status");
        for (const id of w.alerts) this.watch(id, "tints");
        for (const id of w.motion) this.watch(id, "tints");
      }
      for (const d of floor.devices) {
        const dom = domainOf(d.entity);
        if (dom === "light" || dom === "switch") this.watch(d.entity, "lighting", "markers", "status");
        else this.watch(d.entity, "markers");
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
      }
      for (const o of floor.openings) {
        this.watch(o.entity, "openings", "lighting");
        this.watch(o.cover, "openings");
      }
    }
  }

  private state(id: string | null | undefined): HassEntity | undefined {
    return id ? this.hass?.states[id] : undefined;
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
    if (g.type && EV_TYPES.has(g.type)) return evGlow(this.ev(g.entity), this.day);
    if (g.type === "solar_panels" && !g.entity) return solarGlow(this.energy, null, this.day);
    const s = this.state(g.entity);
    if (!s || isUnavailable(s)) return null;
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
    const fresh = s ? Date.now() - Date.parse(s.last_changed) < 60_000 : false;
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
        return look(/doorbell/i.test(d.entity) ? "doorbell" : "camera", s.state === "streaming" || s.state === "recording" ? C.alert : C.camera);
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
      const t = this.state(w.temperature);
      const v = t && !isUnavailable(t) ? parseFloat(t.state) : NaN;
      if (!isNaN(v)) return [...heatColour(v), 0.42];
      return null;
    }
    if (w.motion.some((id) => this.hass!.states[id]?.state === "on")) return [1.0, 0.72, 0.32, 0.09];
    return null;
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
      if (dom === "alarm_control_panel" && s.state === "triggered") out.push({ id, text: `Alarm triggered: ${s.attributes.friendly_name ?? id}` });
      else if (dom === "binary_sensor" && s.state === "on") {
        const dc = String(s.attributes.device_class);
        if (ALERT_CLASSES.has(dc)) {
          const area = areaOf(hass, id);
          const where = area ? hass.areas?.[area]?.name : null;
          out.push({ id, text: `${ALERT_NAMES[dc] ?? "Alert"}${where ? ` in ${where}` : ""}` });
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
    return Object.entries(hass.states)
      .filter(([id]) => domainOf(id) === "person")
      .map(([id, s]) => ({
        id,
        name: String(s.attributes.friendly_name ?? id.slice(7)),
        home: s.state === "home",
        where: s.state === "home" ? "Home" : s.state === "not_home" ? "Away" : isUnavailable(s) ? "Unknown" : s.state,
        picture: typeof s.attributes.entity_picture === "string" ? s.attributes.entity_picture : null,
      }));
  }

  roomText(floor: Floor, room: { id: string }): string | null {
    const w = this.rooms.get(`${floor.id}/${room.id}`);
    if (!w) return null;
    const parts: string[] = [];
    const t = this.state(w.temperature);
    if (t && !isUnavailable(t) && !isNaN(parseFloat(t.state))) parts.push(`${parseFloat(t.state).toFixed(1)}°`);
    const h = this.state(w.humidity);
    if (h && !isUnavailable(h) && !isNaN(parseFloat(h.state))) parts.push(`${Math.round(parseFloat(h.state))} %`);
    // a car that is here, or a charger with a car plugged in
    const cars = new Set((this.evSpaces.get(`${floor.id}/${room.id}`) ?? [])
      .filter((f) => (CAR_TYPES.has(f.type) ? this.carHere(f) : !["unplugged", "unknown"].includes(this.ev(f.entity ?? null)?.state ?? "unknown")))
      .map((f) => this.ev(f.entity ?? null)));
    for (const ev of cars) if (ev) parts.push(evText(ev));
    if (this.roomExtraText) {
      const space = spaces(floor).find((x) => x.id === room.id);
      const extra = space ? this.roomExtraText(floor, space) : null;
      if (extra) parts.push(extra);
    }
    return parts.length ? parts.join(" · ") : null;
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
  const what: Partial<Record<EvNow["state"], string>> = { charging: "charging", plugged: "plugged in", approval: "waiting", paused: "paused", finished: "charged", fault: "fault" };
  return [`Car${ev.level !== null ? ` ${Math.round(ev.level)}%` : ""}`, what[ev.state]].filter(Boolean).join(" · ");
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
