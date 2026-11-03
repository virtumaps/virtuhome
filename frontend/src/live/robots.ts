// Robot vacuums and mowers on the plan: where Home Assistant says they are on their own map, how
// that map lines up with the plan (two spots seen in both), and the way they went this run.
import type { RobotMap, Vec2 } from "../model/plan";
import { domainOf, type Hass, type HassEntity } from "./hass";

/**
 * What says where a robot is:
 * - position: a map camera's `vacuum_position` (Xiaomi Cloud Map Extractor, MQTT Vacuum Camera for
 *   Valetudo), in the robot's own units.
 * - valetudo: Valetudo's own map data camera, whose picture carries the map as JSON (centimetres).
 * - gps: a mower's tracker, turned into metres east and south of Home Assistant's home.
 */
export type RobotSourceKind = "position" | "valetudo" | "gps";

export interface RobotSource {
  entity: string;
  kind: RobotSourceKind;
}

export const ROBOT_DOMAINS = new Set(["vacuum", "lawn_mower"]);

/** The states in which a robot is out working, and the trail of this run grows. */
const RUNNING = new Set(["cleaning", "returning", "mowing"]);
export const isRunning = (s: HassEntity | undefined): boolean => !!s && RUNNING.has(s.state);

/** What kind of position an entity gives, if any. */
export function sourceKind(s: HassEntity | undefined): RobotSourceKind | null {
  if (!s) return null;
  const dom = domainOf(s.entity_id);
  const pos = s.attributes.vacuum_position as { x?: unknown } | undefined;
  if ((dom === "camera" || dom === "image") && pos && typeof pos === "object" && typeof pos.x === "number") return "position";
  if (dom === "camera" && /_map_data$/.test(s.entity_id)) return "valetudo";
  if (dom === "device_tracker" && typeof s.attributes.latitude === "number" && typeof s.attributes.longitude === "number") return "gps";
  return null;
}

/** The entities Home Assistant has that could say where a robot is: those of its own device first. */
export function robotSources(hass: Hass, robot: string): RobotSource[] {
  const device = hass.entities?.[robot]?.device_id ?? null;
  const out: (RobotSource & { own: boolean })[] = [];
  const mower = domainOf(robot) === "lawn_mower";
  for (const [id, s] of Object.entries(hass.states)) {
    const kind = sourceKind(s);
    // a GPS tracker only for a mower, and only its own (a phone's would put the mower in a pocket)
    if (!kind || (kind === "gps") !== mower) continue;
    const own = !!device && hass.entities?.[id]?.device_id === device;
    if (kind === "gps" && !own) continue;
    out.push({ entity: id, kind, own });
  }
  return out.sort((a, b) => Number(b.own) - Number(a.own)).map(({ entity, kind }) => ({ entity, kind }));
}

/** Where a robot is on its own map, from the source's attributes (Valetudo's comes from its picture: `valetudoMap`). */
export function attributeFix(hass: Hass, src: RobotSource): Vec2 | null {
  const s = hass.states[src.entity];
  if (!s) return null;
  if (src.kind === "position") {
    const p = s.attributes.vacuum_position as { x?: unknown; y?: unknown } | undefined;
    return p && typeof p.x === "number" && typeof p.y === "number" ? [p.x, p.y] : null;
  }
  if (src.kind === "gps") {
    const lat = s.attributes.latitude, lon = s.attributes.longitude;
    const lat0 = hass.config?.latitude, lon0 = hass.config?.longitude;
    if (typeof lat !== "number" || typeof lon !== "number" || typeof lat0 !== "number" || typeof lon0 !== "number") return null;
    return gpsMetres(lat, lon, lat0, lon0);
  }
  return null;
}

/** Metres east and south of a point (close enough for a garden: the earth is flat over 100 m). */
export function gpsMetres(lat: number, lon: number, lat0: number, lon0: number): Vec2 {
  return [(lon - lon0) * 111_320 * Math.cos((lat0 * Math.PI) / 180), -(lat - lat0) * 110_574];
}

/**
 * Whether a source's map is a mirror image of the plan (its y runs up the screen, the plan's z
 * down). A map camera says so through its calibration points, which tie the robot's coordinates
 * to its picture's pixels (y down); without them the Xiaomi way (y up) is taken. Valetudo's map
 * and GPS (east, south) run as the plan does.
 */
export function mirrored(s: HassEntity | undefined, kind: RobotSourceKind): boolean {
  if (kind !== "position") return false;
  const cal = s?.attributes.calibration_points as { vacuum?: { x: number; y: number }; map?: { x: number; y: number } }[] | undefined;
  if (Array.isArray(cal) && cal.length >= 3 && cal.slice(0, 3).every((c) => c?.vacuum && c?.map)) {
    const cross = (k: "vacuum" | "map") => {
      const [a, b, c] = cal.map((x) => x[k]!);
      return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    };
    const v = cross("vacuum"), m = cross("map");
    if (v && m) return v * m < 0;
  }
  return true;
}

/**
 * The way from a robot's own map to the plan: turned, scaled and moved so that both spots land
 * where they are on the plan (mirrored first when the map is). Null until there are two spots
 * that are apart in both maps.
 */
export function robotToPlan(map: RobotMap | null | undefined, mirror: boolean): ((p: Vec2) => Vec2) | null {
  const spots = map?.spots ?? [];
  if (spots.length < 2) return null;
  const flip = (p: Vec2): Vec2 => (mirror ? [p[0], -p[1]] : p);
  const p1 = flip(spots[0].robot), p2 = flip(spots[1].robot);
  const [q1, q2] = [spots[0].plan, spots[1].plan];
  const dp: Vec2 = [p2[0] - p1[0], p2[1] - p1[1]];
  const dq: Vec2 = [q2[0] - q1[0], q2[1] - q1[1]];
  const len = dp[0] * dp[0] + dp[1] * dp[1];
  if (len < 1e-9 || Math.hypot(dq[0], dq[1]) < 0.3) return null;
  // the turn and scale as a complex number: dq / dp
  const a = (dq[0] * dp[0] + dq[1] * dp[1]) / len;
  const b = (dq[1] * dp[0] - dq[0] * dp[1]) / len;
  return (p) => {
    const [x, y] = flip(p);
    const u = x - p1[0], v = y - p1[1];
    return [q1[0] + a * u - b * v, q1[1] + b * u + a * v];
  };
}

/** What Valetudo's map picture says: where the robot is, its dock, and the way it went this run (centimetres). */
export interface ValetudoMap {
  robot: Vec2 | null;
  dock: Vec2 | null;
  path: Vec2[];
}

/** Whether this browser can unpack Valetudo's map (Safari only from 16.4). */
export const canInflate = (): boolean => typeof DecompressionStream !== "undefined";

/** The JSON Valetudo puts into its map picture: a zTXt chunk named "ValetudoMap", deflated. */
export function valetudoChunk(png: ArrayBuffer): Uint8Array | null {
  const bytes = new Uint8Array(png);
  const view = new DataView(png);
  let at = 8;
  while (at + 12 <= bytes.length) {
    const len = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const data = bytes.subarray(at + 8, at + 8 + len);
    if (type === "zTXt") {
      const end = data.indexOf(0);
      if (end > 0 && String.fromCharCode(...data.subarray(0, end)) === "ValetudoMap") return data.subarray(end + 2);
    }
    if (type === "IEND") break;
    at += 12 + len;
  }
  return null;
}

/** The robot, its dock and its path from Valetudo's map JSON. */
export function readValetudo(json: unknown): ValetudoMap {
  const entities = ((json as { entities?: unknown })?.entities ?? []) as { type?: string; points?: number[] }[];
  const point = (type: string): Vec2 | null => {
    const p = entities.find((e) => e.type === type)?.points;
    return p && p.length >= 2 ? [p[0], p[1]] : null;
  };
  const path: Vec2[] = [];
  for (const e of entities) {
    if (e.type !== "path" || !Array.isArray(e.points)) continue;
    for (let i = 0; i + 1 < e.points.length; i += 2) path.push([e.points[i], e.points[i + 1]]);
  }
  return { robot: point("robot_position"), dock: point("charger_location"), path };
}

/** Valetudo's map from its picture, or null when it carries none or the browser can't unpack it. */
export async function valetudoMap(png: ArrayBuffer): Promise<ValetudoMap | null> {
  const chunk = valetudoChunk(png);
  if (!chunk || !canInflate()) return null;
  const text = await new Response(new Blob([chunk.slice()]).stream().pipeThrough(new DecompressionStream("deflate"))).text();
  return readValetudo(JSON.parse(text));
}

/** At most this many points of a trail are kept (a long run: every other one goes). */
export const TRAIL_MAX = 1200;

/** A trail with a new point: only when the robot has moved 5 cm, thinned when it gets long. */
export function grow(trail: Vec2[], p: Vec2): Vec2[] {
  const last = trail[trail.length - 1];
  if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.05) return trail;
  const out = [...trail, p];
  return out.length > TRAIL_MAX ? out.filter((_, i) => i % 2 === 0 || i === out.length - 1) : out;
}
