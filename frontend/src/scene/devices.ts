// Devices that are fixtures of the home, made of simple solids like the furniture
// (scene/furniture-lib.ts) so they merge into the floor's mesh: wall switches and sockets with 1 to 4
// gangs, each gang linked to an entity and lit while it is on, and Wi-Fi access points that show red
// while they are offline.
import type { Furniture } from "../model/plan";
import type { HassEntity } from "../live/hass";
import type { FurnitureType, Part, Role } from "./furniture-lib";
import type { V3 } from "./geo";

/** Switches and sockets: a gang per entity, each lit while its entity is on. */
export const GANG_TYPES = new Set(["switch_wall", "socket_wall"]);
export const MAX_GANGS = 4;
/** Access points: they glow while online and show red while offline. */
export const WIFI_TYPES = new Set(["access_point", "wifi_point"]);
/** Pieces a tap switches or opens as a whole, however small they are on the screen. */
export const DEVICE_TYPES = new Set([...GANG_TYPES, ...WIFI_TYPES]);

/** Domains a gang can switch. */
export const GANG_DOMAINS = ["light", "switch", "fan", "input_boolean"];

/** The entity of each gang of a switch or socket, left to right: one gang (the piece's entity) unless set. */
export function gangsOf(item: Pick<Furniture, "type" | "entity" | "gangs">): (string | null)[] {
  if (!GANG_TYPES.has(item.type)) return [item.entity ?? null];
  const list = Array.isArray(item.gangs) && item.gangs.length ? item.gangs.slice(0, MAX_GANGS) : [item.entity ?? null];
  return list.map((e) => (typeof e === "string" && e ? e : null));
}

/** Every entity a piece is linked to: its own, and a switch's other gangs. */
export function linkedEntities(item: Pick<Furniture, "entity" | "gangs">): string[] {
  return [...new Set([item.entity, ...(item.gangs ?? [])].filter((e): e is string => typeof e === "string" && !!e))];
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
  if (GANG_TYPES.has(type)) {
    if (gone(s) || s!.state !== "on") return null;
    return type === "socket_wall" ? [1.0, 0.5, 0.12] : [1.0, 0.82, 0.5];
  }
  return null;
}
