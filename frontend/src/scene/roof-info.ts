// What the roofs offer to extensions (and the solar score): their slopes and solar panels in world
// terms, and the geometry that can shade them.
import { solarSize, PANEL, type Plan } from "../model/plan";
import type { FloorBuild } from "./build";
import { faceBearing, faceNormal, floorRoofs, fromRoofFrame, itemFrame, planeHeight, polyArea, type RoofModel } from "./roofs";
import type { V3 } from "./geo";

/** A slope of a roof. Points are world metres with the storeys standing together. */
export interface RoofFaceInfo {
  floor: number;
  roof: string;
  /** The face's number within its roof. */
  face: number;
  /** Corners going round. */
  points: V3[];
  /** Unit normal out of the roof. */
  normal: V3;
  /** Degrees from level, and the compass bearing it looks down to (with the plan's north; level faces: 180). */
  tilt: number;
  azimuth: number;
  /** True (sloped) area in m². */
  area: number;
}

/** Solar panels on a roof. */
export interface SolarArrayInfo {
  floor: number;
  roof: string;
  id: string;
  panels: number;
  /** Peak power in kW. */
  kwp: number;
  /** How the panels lie: degrees from level and the bearing they face. */
  tilt: number;
  azimuth: number;
  /** Their middle and corners (world), and their normal. */
  centre: V3;
  corners: V3[];
  normal: V3;
  /** The power sensor of their string, if linked. */
  entity: string | null;
}

const RAD = Math.PI / 180;
const bearing = (north: number, dx: number, dz: number) => (((north + Math.atan2(dx, -dz) / RAD) % 360) + 360) % 360;

/** A roof's faces as extensions see them. */
export function faceInfos(m: RoofModel, fi: number, north: number): RoofFaceInfo[] {
  if (m.glass) return [];
  return m.faces.map((f, k) => {
    const points = f.poly.map(([u, v]) => {
      const [x, z] = fromRoofFrame(m, u, v);
      return [x, m.base + planeHeight(f.plane, u, v), z] as V3;
    });
    const sec = Math.sqrt(1 + f.plane.k * f.plane.k);
    return {
      floor: fi, roof: m.roof.id, face: k, points, normal: faceNormal(m, f),
      tilt: Math.atan(f.plane.k) / RAD, azimuth: f.plane.k > 1e-6 ? faceBearing(m, f, north) : 180, area: polyArea(f.poly) * sec,
    };
  });
}

export function roofFaces(plan: Plan): RoofFaceInfo[] {
  const north = plan.settings.north ?? 0;
  return plan.floors.flatMap((_, fi) => floorRoofs(plan, fi).flatMap((m) => faceInfos(m, fi, north)));
}

export function solarArrays(plan: Plan): SolarArrayInfo[] {
  const north = plan.settings.north ?? 0;
  const out: SolarArrayInfo[] = [];
  plan.floors.forEach((_, fi) => {
    for (const m of floorRoofs(plan, fi)) {
      for (const it of m.roof.items ?? []) {
        if (it.kind !== "solar") continue;
        const fr = itemFrame(m, it);
        if (!fr) continue;
        const { w, d } = solarSize(it);
        const panels = Math.max(1, Math.round(it.cols ?? 1)) * Math.max(1, Math.round(it.rows ?? 1));
        let tilt = fr.slope, normal = fr.n;
        let az = bearing(north, -fr.e2[0], -fr.e2[2]);
        if (fr.slope < 1 && it.tilt) {
          // on frames on a flat roof: facing its front
          tilt = it.tilt;
          const t = tilt * RAD;
          normal = [-fr.e2[0] * Math.sin(t), Math.cos(t), -fr.e2[2] * Math.sin(t)];
        } else if (fr.slope < 1) az = 180;
        const corner = (a: number, b: number): V3 => [fr.c[0] + fr.e1[0] * a + fr.e2[0] * b, fr.c[1] + fr.e1[1] * a + fr.e2[1] * b + 0.08, fr.c[2] + fr.e1[2] * a + fr.e2[2] * b];
        out.push({
          floor: fi, roof: m.roof.id, id: it.id, panels, kwp: (panels * (it.watts ?? PANEL.watts)) / 1000, tilt, azimuth: az,
          centre: [fr.c[0] + fr.n[0] * 0.08, fr.c[1] + fr.n[1] * 0.08, fr.c[2] + fr.n[2] * 0.08], normal,
          corners: [corner(-w / 2, -d / 2), corner(w / 2, -d / 2), corner(w / 2, d / 2), corner(-w / 2, d / 2)],
          entity: it.entity ?? null,
        });
      }
    }
  });
  return out;
}

/**
 * Everything that can shade a roof, as triangles (9 numbers each): the roofs and what is on them,
 * the walls, and garden things taller than a person (trees, sheds). Nothing lower than the lowest
 * roof's eaves can, so it is left out.
 */
export function shadeGeometry(builds: FloorBuild[]): Float32Array {
  const models: RoofModel[] = builds.flatMap((fb) => fb.roofs);
  if (!models.length) return new Float32Array(0);
  const floorY = Math.min(...models.map((m) => m.base)) - 0.2;
  const out: number[] = [];
  for (const fb of builds) {
    const take = (pos: number[], idx: number[], keep: (v: number) => boolean) => {
      for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i], b = idx[i + 1], c = idx[i + 2];
        if (!keep(a)) continue;
        if (Math.max(pos[a * 3 + 1], pos[b * 3 + 1], pos[c * 3 + 1]) < floorY) continue;
        for (const v of [a, b, c]) out.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
      }
    };
    // panels lie on the roof: they shade nothing but themselves, and the map must see under them
    const solar = new Set(fb.roofs.flatMap((m) => (m.roof.items ?? []).filter((it) => it.kind === "solar").map((it) => it.id)));
    const skip = new Set(fb.items.flatMap((it, k) => (it.kind === "roofitem" && solar.has(it.id) ? [k] : [])));
    take(fb.roof.pos, fb.roof.idx, (v) => !skip.has(fb.roof.item[v]));
    const g = fb.opaque;
    const indoor = fb.floor.rooms.length;
    // walls (they carry a cutaway slot), and what stands in the garden
    take(g.pos, g.idx, (v) => g.wall[v] >= 0 || g.room[v] === -1 || g.room[v] >= indoor);
  }
  return new Float32Array(out);
}
