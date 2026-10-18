// Which way the plan faces, from the map: OpenStreetMap's outline of the building at Home
// Assistant's home location, matched to the plan's walls. A wall's direction gives north to within
// a quarter turn; the building's proportions and the plan's current north settle the rest.
import type { Plan, Vec2 } from "../model/plan";

/** A building from the map, in metres east (x) and north (y) of the home location. */
export interface Footprint {
  id: number;
  points: Vec2[];
  /** From the home location to the building (0 when it stands on it). */
  distance: number;
  /** Its outline's length along its main direction and across it (m). */
  size: [number, number];
  /** Its main direction: a bearing in degrees (0..90). */
  axis: number;
}

export interface NorthFit {
  /** The bearing the top of the plan faces (PlanSettings.north). */
  north: number;
  /** How far the plan's outline is from the building's in size (m): lower fits better. */
  mismatch: number;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * The main direction of a set of edges, modulo 90°, weighted by length: angles in degrees as the
 * edges' `angle` function measures them. Walls meet at right angles, so four times the angle lines
 * all of them up.
 */
export function mainDirection(edges: [Vec2, Vec2][], angle: (d: Vec2) => number): number {
  let sx = 0, sy = 0;
  for (const [a, b] of edges) {
    const d: Vec2 = [b[0] - a[0], b[1] - a[1]];
    const len = Math.hypot(d[0], d[1]);
    if (len < 0.05) continue;
    const t = (angle(d) * Math.PI) / 180 * 4;
    sx += len * Math.cos(t);
    sy += len * Math.sin(t);
  }
  return mod((Math.atan2(sy, sx) * 180) / Math.PI / 4, 90);
}

/** How long an outline is along a direction (degrees, as `angle` measures) and across it. */
function extent(points: Vec2[], axisDeg: number, unit: (deg: number) => Vec2): [number, number] {
  const u = unit(axisDeg), v = unit(axisDeg + 90);
  const along = points.map((p) => p[0] * u[0] + p[1] * u[1]);
  const across = points.map((p) => p[0] * v[0] + p[1] * v[1]);
  return [Math.max(...along) - Math.min(...along), Math.max(...across) - Math.min(...across)];
}

const edgesOf = (pts: Vec2[]): [Vec2, Vec2][] => pts.map((p, i) => [p, pts[(i + 1) % pts.length]]);

// on the map: bearings, clockwise from north (y); on the plan: clockwise from the top (-z)
const bearingOf = (d: Vec2) => (Math.atan2(d[0], d[1]) * 180) / Math.PI;
const mapUnit = (deg: number): Vec2 => [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
const planAngleOf = (d: Vec2) => (Math.atan2(d[0], -d[1]) * 180) / Math.PI;
const planUnit = (deg: number): Vec2 => [Math.sin((deg * Math.PI) / 180), -Math.cos((deg * Math.PI) / 180)];

/** A building's outline from OpenStreetMap (latitude, longitude pairs) around a home location. */
export function footprint(id: number, geometry: { lat: number; lon: number }[], lat0: number, lon0: number): Footprint | null {
  const k = Math.cos((lat0 * Math.PI) / 180);
  let pts: Vec2[] = geometry.map((g) => [(g.lon - lon0) * 111_320 * k, (g.lat - lat0) * 110_540]);
  // a closed way repeats its first point
  if (pts.length > 1 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 0.01) pts = pts.slice(0, -1);
  if (pts.length < 3) return null;
  const axis = mainDirection(edgesOf(pts), bearingOf);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > 0 !== yj > 0 && 0 < ((xj - xi) * -yi) / (yj - yi) + xi) inside = !inside;
  }
  const distance = inside ? 0 : Math.min(...edgesOf(pts).map(([a, b]) => {
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const t = Math.max(0, Math.min(1, -(a[0] * ex + a[1] * ey) / (ex * ex + ey * ey || 1)));
    return Math.hypot(a[0] + ex * t, a[1] + ey * t);
  }));
  return { id, points: pts, distance, size: extent(pts, axis, mapUnit), axis };
}

/** The plan's outline as the map would show it: the biggest storey's rooms, out to the outside walls' faces. */
export function planOutline(plan: Plan): { points: Vec2[]; axis: number; size: [number, number] } | null {
  const floor = plan.floors.slice().sort((a, b) => b.rooms.length - a.rooms.length)[0];
  const points = floor?.rooms.flatMap((r) => r.points) ?? [];
  if (points.length < 3) return null;
  const axis = mainDirection(floor.rooms.flatMap((r) => edgesOf(r.points)), planAngleOf);
  const [a, b] = extent(points, axis, planUnit);
  // rooms run along the middle of their walls
  const wall = plan.settings.wall_exterior;
  return { points, axis, size: [a + wall, b + wall] };
}

/**
 * The four ways the plan can face that line its walls up with the building's, best first: those
 * whose proportions match, then the one nearest the plan's current north.
 */
export function northFits(plan: Plan, building: Footprint): NorthFit[] {
  const outline = planOutline(plan);
  if (!outline) return [];
  const base = mod(building.axis - outline.axis, 90);
  const fits: NorthFit[] = [0, 1, 2, 3].map((k) => {
    const north = mod(base + 90 * k, 360);
    // the plan's main direction ends up along the building's main direction, or across it
    const along = mod(outline.axis + north - building.axis, 180) < 45 || mod(outline.axis + north - building.axis, 180) > 135;
    const [pa, pb] = outline.size;
    const [ba, bb] = building.size;
    return { north: Math.round(north * 10) / 10, mismatch: along ? Math.abs(pa - ba) + Math.abs(pb - bb) : Math.abs(pa - bb) + Math.abs(pb - ba) };
  });
  const current = plan.settings.north;
  const turn = (n: number) => Math.min(mod(n - current, 360), mod(current - n, 360));
  // proportions decide only when they differ clearly (a square house fits every way)
  const step = (f: NorthFit) => Math.round(f.mismatch / 0.75);
  return fits.sort((a, b) => step(a) - step(b) || turn(a.north) - turn(b.north));
}

/** The building the house most likely is: the one at the home location, else a near one of about its size. */
export function pickBuilding(plan: Plan, buildings: Footprint[]): Footprint | null {
  const outline = planOutline(plan);
  const size = (b: Footprint) => {
    if (!outline) return 0;
    const [pa, pb] = outline.size;
    return Math.min(Math.abs(pa - b.size[0]) + Math.abs(pb - b.size[1]), Math.abs(pa - b.size[1]) + Math.abs(pb - b.size[0]));
  };
  const score = (b: Footprint) => b.distance + 1.5 * size(b);
  return buildings.slice().sort((a, b) => score(a) - score(b))[0] ?? null;
}

/** OpenStreetMap's public Overpass servers, asked in turn (the main one is often busy). */
export const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

/** Buildings within `radius` metres of a location, from a public Overpass server (OpenStreetMap). */
export async function fetchBuildings(lat: number, lon: number, radius = 60): Promise<Footprint[]> {
  const query = `[out:json][timeout:15];way["building"](around:${radius},${lat.toFixed(6)},${lon.toFixed(6)});out geom;`;
  let last: unknown = null;
  for (const url of OVERPASS) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 12_000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
        signal: abort.signal,
      });
      if (!res.ok) throw new Error(`OpenStreetMap answered ${res.status}`);
      const json = (await res.json()) as { elements?: { type: string; id: number; geometry?: { lat: number; lon: number }[] }[] };
      return (json.elements ?? [])
        .filter((e) => e.type === "way" && e.geometry)
        .map((e) => footprint(e.id, e.geometry!, lat, lon))
        .filter((f): f is Footprint => !!f);
    } catch (err) {
      last = abort.signal.aborted ? new Error("no answer in time") : err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}
