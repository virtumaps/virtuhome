// The plan: everything VirtuHome knows about the building. Stored by the integration as JSON
// (custom_components/virtuhome/schema.py validates the same shape).
//
// Units are metres. The plan is drawn from above: x grows to the right, z grows DOWN the plan
// (the front of the house is usually at the bottom), y grows up. Room outlines run along the
// MIDDLE of their walls, so neighbouring rooms share edges.

export type Vec2 = [number, number];

import type { ExteriorFinish, FloorFinish, Upholstery, WallFinish } from "../scene/finishes";

export type FloorMaterial = FloorFinish;
export type { ExteriorFinish, FloorFinish, Upholstery, WallFinish };
export type OpeningKind = "door" | "window" | "passage" | "garage";
export type Mount = "ceiling" | "wall" | "floor" | "table";
export type ThemeName = "auto" | "night" | "day";

export interface Room {
  id: string;
  name: string;
  /** Home Assistant area: its devices belong to this room. */
  area_id: string | null;
  points: Vec2[];
  floor?: FloorMaterial;
  /** Inside face of the room's walls: a finish and, for paint-like finishes, a colour ("#rrggbb"). */
  wall_finish?: WallFinish;
  wall_color?: string | null;
  /** Sensors for the room's climate label (null = picked automatically from the area). */
  temperature?: string | null;
  humidity?: string | null;
}

export interface Opening {
  id: string;
  room_id: string;
  /** Edge of the room the opening sits on: points[edge] -> points[edge + 1]. */
  edge: number;
  /** Distance of the opening's middle from points[edge] (m). */
  offset: number;
  width: number;
  height: number;
  /** Bottom edge above the floor; 0 for doors. */
  sill: number;
  kind: OpeningKind;
  /** Contact sensor (doors, windows) — opens the door / lights the window in 3D. */
  entity?: string | null;
  /** Blind or curtain in front of a window. */
  cover?: string | null;
  /** Doors: hinge side seen from the room, and whether they swing into it. */
  hinge?: "left" | "right";
  swing?: "in" | "out";
}

export interface Furniture {
  id: string;
  type: string;
  /** Middle of the item on the plan. */
  x: number;
  z: number;
  /** Degrees clockwise on the plan; 0 = its front faces down the plan (+z). */
  rotation: number;
  /** Width along its front, depth, height (m). */
  w: number;
  d: number;
  h: number;
  /** Bottom above the floor (wall cabinets, wall TVs). */
  y?: number;
  /** Linked entity: a TV's media player, a lamp's light, a washer's power switch. */
  entity?: string | null;
  /** Main colour ("#rrggbb"): the upholstery, else the wood or the body. */
  color?: string | null;
  /** Upholstered pieces: fabric, linen, velvet, bouclé or leather. */
  finish?: Upholstery | null;
  /** Mirrored left to right (which side a corner sofa's chaise is on). */
  mirror?: boolean;
}

export interface Device {
  id: string;
  entity: string;
  x: number;
  z: number;
  /** Height above the floor; null = the usual height for its kind and mount. */
  y?: number | null;
  mount?: Mount | null;
  /** Degrees clockwise on the plan that the device faces (cameras, wall lamps). */
  rotation?: number | null;
  /** Cameras: field of view (degrees) and reach (m). */
  fov?: number | null;
  reach?: number | null;
}

export type OutdoorKind = "lawn" | "patio" | "deck" | "path" | "driveway" | "bed" | "gravel";

/** Ground around the house: a lawn, a patio. Lit by its garden lights, linked to an area like a room. */
export interface OutdoorArea {
  id: string;
  name: string;
  kind: OutdoorKind;
  area_id: string | null;
  points: Vec2[];
}

export interface FreeWall {
  id: string;
  a: Vec2;
  b: Vec2;
  thickness?: number | null;
  height?: number | null;
}

export interface Floor {
  id: string;
  name: string;
  /** Home Assistant floor this storey stands for. */
  ha_floor?: string | null;
  /** Floor level above the ground floor (m). */
  elevation: number;
  /** Storey height: floor to the floor above (m). */
  height: number;
  rooms: Room[];
  openings: Opening[];
  furniture: Furniture[];
  devices: Device[];
  walls: FreeWall[];
  /** Garden areas (usually on the ground floor only). */
  outdoor?: OutdoorArea[];
  /** This storey's outside walls, when they differ from the house's (e.g. cladding upstairs). */
  exterior_finish?: ExteriorFinish | null;
  exterior_color?: string | null;
}

export interface PlanSettings {
  /** Wall thickness of outside walls and inside walls (m). */
  wall_exterior: number;
  wall_interior: number;
  /** Degrees the plan is turned from north (0 = up the plan is north). */
  north: number;
  theme: ThemeName;
  /** Outside walls: brick, render, cladding... and a colour for paintable finishes. */
  exterior_finish: ExteriorFinish;
  exterior_color?: string | null;
}

export interface Plan {
  version: 1;
  name?: string;
  settings: PlanSettings;
  floors: Floor[];
}

export const DEFAULT_SETTINGS: PlanSettings = {
  wall_exterior: 0.28,
  wall_interior: 0.12,
  north: 0,
  theme: "auto",
  exterior_finish: "render",
};

export function emptyPlan(): Plan {
  return { version: 1, settings: { ...DEFAULT_SETTINGS }, floors: [] };
}

/** Fills in defaults so the rest of the code never sees a missing field. */
export function normalizePlan(raw: unknown): Plan {
  const p = (raw ?? {}) as Partial<Plan>;
  const settings = { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) };
  const floors = (p.floors ?? []).map((f) => ({
    ...f,
    ha_floor: f.ha_floor ?? null,
    rooms: (f.rooms ?? []).map((r) => ({ ...r, area_id: r.area_id ?? null, floor: r.floor ?? "wood", wall_finish: r.wall_finish ?? "paint" })),
    openings: (f.openings ?? []).map((o) => ({ hinge: "left" as const, swing: "in" as const, ...o })),
    furniture: f.furniture ?? [],
    devices: f.devices ?? [],
    walls: f.walls ?? [],
    outdoor: (f.outdoor ?? []).map((o) => ({ ...o, area_id: o.area_id ?? null, kind: o.kind ?? "lawn" })),
  }));
  floors.sort((a, b) => a.elevation - b.elevation);
  return { version: 1, name: p.name, settings, floors };
}

/** A room or a garden area: anything with a name, an area and an outline. */
export interface Space {
  id: string;
  name: string;
  area_id: string | null;
  points: Vec2[];
  outdoor: boolean;
}

/** Rooms first, then garden areas (the order the 3D view numbers them in). */
export function spaces(floor: Floor): Space[] {
  return [
    ...floor.rooms.map((r) => ({ id: r.id, name: r.name, area_id: r.area_id, points: r.points, outdoor: false })),
    ...(floor.outdoor ?? []).map((o) => ({ id: o.id, name: o.name, area_id: o.area_id, points: o.points, outdoor: true })),
  ];
}

let counter = 0;
/** A short unique id for new plan items. */
export function newId(prefix: string): string {
  counter = (counter + 1) % 1296;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36).padStart(2, "0")}`;
}
