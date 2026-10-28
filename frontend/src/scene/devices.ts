// Devices that are fixtures of the home, made of simple solids like the furniture
// (scene/furniture-lib.ts) so they merge into the floor's mesh: wall switches and sockets with 1 to 4
// gangs, each gang linked to an entity and lit while it is on; Wi-Fi access points that show red
// while they are offline; ceiling fans, whose blades turn in the floor's mesh of moving parts while
// the fan runs; air conditioners lit by their mode; radiators and underfloor heating that glow while
// they heat; and hot water cylinders with their temperature.
import type { Furniture } from "../model/plan";
import type { HassEntity } from "../live/hass";
import type { FurnitureType, Part, Role } from "./furniture-lib";
import type { V3 } from "./geo";

/** Switches and sockets: a gang per entity, each lit while its entity is on. */
export const GANG_TYPES = new Set(["switch_wall", "socket_wall"]);
export const MAX_GANGS = 4;
/** Access points: they glow while online and show red while offline. */
export const WIFI_TYPES = new Set(["access_point", "wifi_point"]);
/** Ceiling fans; those with a light have it as a lamp (`light`). */
export const FAN_TYPES = new Set(["fan_ceiling", "fan_ceiling_light"]);
export const FAN_LIGHTS = new Set(["fan_ceiling_light"]);
/** Air conditioners, lit by their climate's mode. */
export const AC_TYPES = new Set(["ac_wall", "ac_outdoor"]);
/** Radiators and underfloor heating: they glow while their thermostat, valve or switch heats. */
export const HEAT_TYPES = new Set(["radiator", "radiator_column", "towel_rail", "underfloor_heating"]);
/** Hot water: its temperature shows in a label over it. */
export const WATER_TYPES = new Set(["hot_water_cylinder", "water_heater"]);
/** Pieces a tap switches or opens as a whole, however small they are on the screen. */
export const DEVICE_TYPES = new Set([...GANG_TYPES, ...WIFI_TYPES, ...FAN_TYPES, ...AC_TYPES, ...WATER_TYPES, "smart_speaker"]);

/** Smart speakers: their light ring glows softly while they play. */
export const SPEAKER_TYPES = new Set(["smart_speaker"]);
/** Pieces lit by their entity's state (scene/devices.ts deviceGlow). */
export const GLOW_TYPES = new Set([...GANG_TYPES, ...WIFI_TYPES, ...AC_TYPES, ...HEAT_TYPES, ...SPEAKER_TYPES]);

/** What a device piece switches or opens: a switch's gangs, a fan and its light, else its entity. */
export function deviceEntities(item: Pick<Furniture, "type" | "entity" | "gangs" | "light">): string[] {
  const list = FAN_LIGHTS.has(item.type) ? [item.entity, item.light] : gangsOf(item);
  return list.filter((e): e is string => !!e);
}

/** Domains a gang can switch. */
export const GANG_DOMAINS = ["light", "switch", "fan", "input_boolean"];

/** The entity of each gang of a switch or socket, left to right: one gang (the piece's entity) unless set. */
export function gangsOf(item: Pick<Furniture, "type" | "entity" | "gangs">): (string | null)[] {
  if (!GANG_TYPES.has(item.type)) return [item.entity ?? null];
  const list = Array.isArray(item.gangs) && item.gangs.length ? item.gangs.slice(0, MAX_GANGS) : [item.entity ?? null];
  return list.map((e) => (typeof e === "string" && e ? e : null));
}

/** Every entity a piece is linked to: its own, a switch's other gangs, a fan's light. */
export function linkedEntities(item: Pick<Furniture, "entity" | "gangs" | "light">): string[] {
  return [...new Set([item.entity, ...(item.gangs ?? []), item.light].filter((e): e is string => typeof e === "string" && !!e))];
}

/** A plate's width for n gangs: 86 mm for one, 60 mm more for each further one. */
export const gangWidth = (n: number): number => Math.round((0.026 + 0.06 * Math.max(1, Math.min(MAX_GANGS, n))) * 1000) / 1000;

const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, extra: Partial<Part> = {}): Part => ({ shape: "box", x, y, z, w, h, d, role, ...extra });
const cyl = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role, extra: Partial<Part> = {}): Part => ({ shape: "cyl", x, y, z, w, h, d, role, seg: 20, ...extra });

/** A plate on the wall (its back at -d/2) with a rocker, or a socket and its light, per gang. */
function plate(w: number, d: number, h: number, item: Furniture | undefined, socket: boolean): Part[] {
  const n = item ? gangsOf(item).length : 1;
  const t = d * 0.6;
  const front = -d / 2 + t;
  const out: Part[] = [box(0, 0, -d / 2 + t / 2, w, h, t, "white")];
  const pitch = (w - 0.026) / n;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 0.013 + pitch * (i + 0.5);
    if (socket) {
      // the sockets' face, its two holes, and the little light that says it is on
      out.push({ shape: "cyl", axis: "z", x, y: h * 0.2, z: front + 0.0015, w: pitch * 0.62, h: pitch * 0.62, d: 0.003, role: "ceramic", seg: 16 });
      for (const s of [-1, 1]) out.push({ shape: "cyl", axis: "z", x: x + s * pitch * 0.13, y: h * 0.2 + pitch * 0.25, z: front + 0.0035, w: 0.007, h: 0.007, d: 0.002, role: "dark", seg: 6 });
      out.push(box(x, h * 0.84, front + 0.0015, pitch * 0.16, h * 0.07, 0.003, "screen", { glow: "screen", slot: i }));
    } else {
      out.push(box(x, h * 0.2, front + 0.002, pitch * 0.55, h * 0.6, 0.004, "ceramic", { glow: "screen", slot: i }));
    }
  }
  return out;
}

/** A ceiling fan's blades at rest, for the floor's moving parts (turned about the piece's middle). */
export function fanBlades(w: number, h: number): Part[] {
  const l = w / 2 - 0.1, y = -h * 0.8;
  return [1, -1].flatMap((s) => [box(s * (0.1 + l / 2), y, 0, l, 0.012, 0.13, "wood"), box(0, y - 0.002, s * (0.1 + l / 2), 0.13, 0.012, l, "wood")]);
}

/** A fan's motor and rod, hanging from the ceiling, with a glass bowl under it when it has a light. */
function fan(h: number, light: boolean): Part[] {
  const out = [
    cyl(0, -0.05, 0, 0.13, 0.05, 0.13, "white"),
    cyl(0, -h * 0.7, 0, 0.025, h * 0.7 - 0.05, 0.025, "metal", { seg: 6 }),
    cyl(0, -h * 0.88, 0, 0.2, h * 0.18, 0.2, "white", { taper: 0.8 }),
  ];
  if (light) out.push({ shape: "ball", x: 0, y: -h, z: 0, w: 0.17, h: h * 0.24, d: 0.17, role: "bulb", seg: 12, glow: "lamp" });
  else out.push(cyl(0, -h * 0.94, 0, 0.12, h * 0.06, 0.12, "white"));
  return out;
}

/** Pipes laid back and forth across the zone, every 20 cm. */
function underfloor(w: number, d: number): Part[] {
  const out: Part[] = [];
  const n = Math.max(2, Math.floor(d / 0.2) + 1), step = (d - 0.02) / (n - 1), t = 0.016, h = 0.005;
  for (let i = 0; i < n; i++) {
    const z = -d / 2 + 0.01 + i * step;
    out.push(box(0, 0, z, w - 0.02, h, t, "red", { glow: "screen" }));
    // the bend to the next run, at alternate ends
    if (i < n - 1) out.push(box((i % 2 ? -1 : 1) * (w / 2 - 0.01 - t / 2), 0, z + step / 2, t, h, step - t, "red", { glow: "screen" }));
  }
  return out;
}

export const DEVICE_FURNITURE: Record<string, FurnitureType> = {
  switch_wall: {
    label: "furniture.switch_wall", category: "devices", family: "switch", size: [0.086, 0.012, 0.086], y: 1.06, paint: ["white", "ceramic"],
    build: (w, d, h, item) => plate(w, d, h, item, false),
  },
  socket_wall: {
    label: "furniture.socket_wall", category: "devices", family: "switch", size: [0.086, 0.012, 0.086], y: 0.3, paint: ["white", "ceramic"],
    build: (w, d, h, item) => plate(w, d, h, item, true),
  },
  access_point: {
    // a disc on the ceiling with a light round its edge
    label: "furniture.access_point", category: "devices", family: "wifi", size: [0.2, 0.2, 0.035], paint: ["white"],
    build: (w, d, h) => [cyl(0, -h, 0, w * 0.94, h, d * 0.94, "white"), cyl(0, -h * 0.62, 0, w, h * 0.22, d, "screen", { glow: "screen" })],
  },
  wifi_point: {
    // a mesh point on a shelf or a desk, its light on top
    label: "furniture.wifi_point", category: "devices", family: "wifi", size: [0.11, 0.11, 0.09], y: 0.75, paint: ["white"],
    build: (w, d, h) => [cyl(0, 0, 0, w, h - 0.004, d, "white", { taper: 0.92 }), cyl(0, h - 0.004, 0, w * 0.3, 0.004, d * 0.3, "screen", { glow: "screen" })],
  },
  fan_ceiling: {
    label: "furniture.fan_ceiling", category: "devices", family: "fan", size: [1.2, 1.2, 0.4], paint: ["wood"],
    build: (_w, _d, h) => fan(h, false),
  },
  fan_ceiling_light: {
    label: "furniture.fan_ceiling_light", category: "devices", family: "fan", size: [1.2, 1.2, 0.45], paint: ["wood"],
    build: (_w, _d, h) => fan(h, true),
  },
  ac_wall: {
    // a split unit high on the wall; its louvre and display light with its mode
    label: "furniture.ac_wall", category: "devices", family: "ac", size: [0.9, 0.24, 0.3], y: 2.0, paint: ["white"],
    build: (w, d, h) => [
      box(0, 0.03, 0, w, h - 0.03, d, "white"),
      box(0, 0, -0.02, w - 0.04, 0.03, d - 0.04, "white"),
      box(0, 0.006, d / 2 - 0.035, w * 0.78, 0.01, 0.05, "screen", { glow: "screen" }),
      box(w * 0.36, h * 0.5, d / 2 + 0.002, 0.05, 0.02, 0.004, "screen", { glow: "screen" }),
    ],
  },
  ac_outdoor: {
    label: "furniture.ac_outdoor", category: "devices", family: "ac", size: [0.8, 0.3, 0.55], paint: ["white"],
    build: (w, d, h) => [
      box(0, 0.06, 0, w, h - 0.06, d, "white"),
      box(-w * 0.38, 0, 0, 0.05, 0.06, d * 0.9, "dark"), box(w * 0.38, 0, 0, 0.05, 0.06, d * 0.9, "dark"),
      { shape: "cyl", axis: "z", x: -w * 0.12, y: 0.06 + (h - 0.06) * 0.12, z: d / 2 + 0.004, w: (h - 0.06) * 0.76, h: (h - 0.06) * 0.76, d: 0.008, role: "dark", seg: 20 },
      box(w * 0.34, h * 0.55, d / 2 + 0.004, w * 0.16, h * 0.3, 0.008, "metal"),
    ],
  },
  radiator: {
    label: "furniture.radiator", category: "devices", family: "radiator", size: [1.0, 0.1, 0.6], y: 0.12,
    build: (w, d, h) => {
      const n = Math.max(3, Math.round(w / 0.08));
      return [box(0, 0, 0, w, h, d, "white"), ...Array.from({ length: n }, (_, i) => box(-w / 2 + (w / n) * (i + 0.5), 0.02, d / 2, 0.012, h - 0.04, 0.006, "ceramic", { glow: "screen" }))];
    },
  },
  radiator_column: {
    label: "furniture.radiator_column", category: "devices", family: "radiator", size: [0.8, 0.1, 0.6], y: 0.12, paint: ["white", "ceramic"],
    build: (w, d, h) => {
      const n = Math.max(3, Math.round(w / 0.065));
      return [
        box(0, 0, 0, w, 0.05, d * 0.5, "white"), box(0, h - 0.05, 0, w, 0.05, d * 0.5, "white"),
        ...Array.from({ length: n }, (_, i) => box(-w / 2 + (w / n) * (i + 0.5), 0.05, 0, (w / n) * 0.62, h - 0.1, d, "ceramic", { glow: "screen" })),
      ];
    },
  },
  underfloor_heating: {
    label: "furniture.underfloor_heating", category: "devices", family: "underfloor", size: [2.0, 2.0, 0.005],
    build: (w, d) => underfloor(w, d),
  },
  hot_water_cylinder: {
    label: "furniture.hot_water_cylinder", category: "devices", family: "water", size: [0.5, 0.5, 1.25], paint: ["white"],
    build: (w, d, h) => [
      cyl(0, 0, 0, w, h - w * 0.2, d, "white"),
      { shape: "ball", x: 0, y: h - w * 0.4, z: 0, w: w * 0.98, h: w * 0.4, d: d * 0.98, role: "white", seg: 16 },
      cyl(-w * 0.2, h - 0.02, 0, 0.03, 0.12, 0.03, "pot", { seg: 6 }),
      box(0, h * 0.45, d / 2, 0.08, 0.06, 0.03, "dark"),
    ],
  },
  smart_speaker: {
    // a fabric-covered speaker with a light ring on top
    label: "furniture.smart_speaker", category: "devices", family: "speaker", size: [0.14, 0.14, 0.15], y: 0.75, paint: ["fabricDark"],
    build: (w, d, h) => [
      cyl(0, 0, 0, w, h - 0.012, d, "fabricDark", { taper: 0.94 }),
      cyl(0, h - 0.012, 0, w * 0.94, 0.006, d * 0.94, "screen", { glow: "screen" }),
      cyl(0, h - 0.006, 0, w * 0.8, 0.006, d * 0.8, "dark"),
    ],
  },
  water_heater: {
    label: "furniture.water_heater", category: "devices", family: "water", size: [0.45, 0.45, 0.8], y: 1.2, paint: ["white"],
    build: (w, d, h) => [cyl(0, 0, 0, w, h, d, "white"), box(0, h * 0.15, d / 2, w * 0.3, h * 0.08, 0.02, "dark")],
  },
};

const gone = (s: HassEntity | undefined) => !s || s.state === "unavailable" || s.state === "unknown";

/** Whether an access point is offline: its entity is gone, disconnected, or away. */
export function wifiOffline(s: HassEntity | undefined): boolean {
  if (gone(s)) return true;
  return ["off", "not_home", "offline", "disconnected", "down", "disconnect"].includes(s!.state.toLowerCase());
}

/**
 * A device's glow: a gang lit while it is on (a switch's rocker warm, a socket's light amber), an
 * access point soft blue while online and red while offline. Null: not lit.
 */
export function deviceGlow(type: string, s: HassEntity | undefined): V3 | null {
  if (WIFI_TYPES.has(type)) return wifiOffline(s) ? [1.0, 0.12, 0.08] : [0.45, 0.68, 1.0];
  if (AC_TYPES.has(type)) {
    const m = acMode(s);
    return m === "cooling" ? [0.3, 0.7, 1.0] : m === "heating" ? [1.0, 0.5, 0.2] : m === "fan" ? [0.85, 0.9, 0.95] : m === "drying" ? [0.35, 0.9, 0.8] : null;
  }
  if (SPEAKER_TYPES.has(type)) return s?.state === "playing" || s?.state === "buffering" ? [0.5, 0.4, 1.0] : null;
  if (HEAT_TYPES.has(type)) return heats(s) ? (type === "underfloor_heating" ? [0.95, 0.24, 0.06] : [1.0, 0.55, 0.3]) : null;
  if (GANG_TYPES.has(type)) {
    if (gone(s) || s!.state !== "on") return null;
    return type === "socket_wall" ? [1.0, 0.5, 0.12] : [1.0, 0.82, 0.5];
  }
  return null;
}

/**
 * What an air conditioner is doing: what its climate says it does (hvac_action), else its mode while
 * on. Null while it is off or idle.
 */
export function acMode(s: HassEntity | undefined): "cooling" | "heating" | "fan" | "drying" | null {
  if (gone(s) || s!.state === "off") return null;
  const a = s!.attributes.hvac_action;
  const by: Record<string, "cooling" | "heating" | "fan" | "drying"> = { cooling: "cooling", heating: "heating", fan: "fan", drying: "drying", cool: "cooling", heat: "heating", fan_only: "fan", dry: "drying" };
  if (typeof a === "string") return by[a] ?? null;
  return by[s!.state] ?? null;
}

/**
 * Whether a radiator's or underfloor zone's entity says it heats: a thermostat or valve whose action
 * is heating, a valve that is open, a switch, helper or sensor that is on.
 */
export function heats(s: HassEntity | undefined): boolean {
  if (gone(s)) return false;
  const dom = s!.entity_id.slice(0, s!.entity_id.indexOf("."));
  if (dom === "climate" || dom === "water_heater") return s!.attributes.hvac_action === "heating";
  if (dom === "valve") return s!.state === "open" || s!.state === "opening" || (typeof s!.attributes.current_position === "number" && s!.attributes.current_position > 0);
  return s!.state === "on";
}

/** How fast a fan's blades turn (turns a second): with its speed while it runs, nought while it is off. */
export function fanTurns(s: HassEntity | undefined): number {
  if (gone(s) || s!.state !== "on") return 0;
  const pct = s!.attributes.percentage;
  if (typeof pct !== "number") return 0.6;
  // at most one turn a second: four blades at the Tablet level's 12 frames a second still read as turning
  return pct > 0 ? 0.25 + 0.75 * Math.min(1, pct / 100) : 0;
}

/** A hot water cylinder's or heater's temperature, and the one it heats to: "52° → 55°". */
export function waterTemperature(s: HassEntity | undefined): { current: number | null; target: number | null } | null {
  if (gone(s)) return null;
  const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
  const dom = s!.entity_id.slice(0, s!.entity_id.indexOf("."));
  if (dom === "water_heater" || dom === "climate") return { current: num(s!.attributes.current_temperature), target: s!.state === "off" ? null : num(s!.attributes.temperature) };
  const v = parseFloat(s!.state);
  return isFinite(v) ? { current: v, target: null } : null;
}
