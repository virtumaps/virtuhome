// The plan: everything VirtuHome knows about the building. Stored by the integration as JSON
// (custom_components/virtuhome/schema.py validates the same shape).
//
// Units are metres. The plan is drawn from above: x grows to the right, z grows DOWN the plan
// (the front of the house is usually at the bottom), y grows up. Room outlines run along the
// MIDDLE of their walls, so neighbouring rooms share edges.

export type Vec2 = [number, number];

import type { ExteriorFinish, FloorFinish, JoineryFinish, Upholstery, WallFinish } from "../scene/finishes";
import type { DoorStyle, GarageStyle, WindowStyle } from "../scene/joinery";
import { CEILING_LAMPS, FURNITURE, type BalustradeMaterial, type BalustradeStyle } from "../scene/furniture-lib";

export type FloorMaterial = FloorFinish;
export type { DoorStyle, ExteriorFinish, FloorFinish, GarageStyle, JoineryFinish, Upholstery, WallFinish, WindowStyle };
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
  /** Doors and casement windows: hinge side seen from the room, and whether they swing into it. */
  hinge?: "left" | "right";
  swing?: "in" | "out";
  /** How it is made and opens (scene/joinery.ts); null = the usual for its kind. */
  style?: DoorStyle | WindowStyle | GarageStyle | null;
  /** The door leaf or the window frame: a finish and, for paintable ones, a colour ("#rrggbb"). */
  finish?: JoineryFinish | null;
  color?: string | null;
  /** Glazing bars across the glass (a Georgian grid). */
  bars?: boolean;
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
  /** Bottom above the floor (wall cabinets, wall TVs); unset or null = the type's usual height. */
  y?: number | null;
  /** Linked entity: a TV's media player, a lamp's light, a washer's power switch. */
  entity?: string | null;
  /** Main colour ("#rrggbb"): the upholstery, else the wood or the body. */
  color?: string | null;
  /** Upholstered pieces: fabric, linen, velvet, bouclé or leather. */
  finish?: Upholstery | null;
  /** Mirrored left to right (which side a corner sofa's chaise is on). */
  mirror?: boolean;
  /**
   * Cars: when the car is here (hidden in 3D otherwise). Unset: always; "plugged": while its
   * charger has it plugged in; or an entity: a tracker or person at home, a sensor that is on.
   */
  parked?: string | null;
  /** Stairs: the balustrade's style and material, and which side going up it is on. */
  balustrade?: BalustradeStyle | null;
  balustrade_material?: BalustradeMaterial | null;
  balustrade_side?: "left" | "right" | "both" | null;
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
/** What a driveway is laid with; null = block paving. */
export type DrivewaySurface = "blocks" | "asphalt";
/** What the ground of a garden area looks like: its kind, or an asphalt driveway. */
export type Ground = OutdoorKind | "asphalt";

/** Ground around the house: a lawn, a patio. Lit by its garden lights, linked to an area like a room. */
export interface OutdoorArea {
  id: string;
  name: string;
  kind: OutdoorKind;
  area_id: string | null;
  points: Vec2[];
  /** Driveways only. */
  surface?: DrivewaySurface | null;
}

export function groundOf(o: OutdoorArea): Ground {
  return o.kind === "driveway" && o.surface === "asphalt" ? "asphalt" : o.kind;
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
  /** Fences and garden walls along the ground. */
  fences?: Fence[];
  /** This storey's outside walls, when they differ from the house's (e.g. cladding upstairs). */
  exterior_finish?: ExteriorFinish | null;
  exterior_color?: string | null;
}

/** The fence designs (scene/fences.ts builds them). */
export type FenceStyle =
  | "closeboard" | "lap" | "slatted" | "venetian" | "hit_miss" | "louvre" | "composite" | "trellis"
  | "picket" | "post_rail" | "railings" | "estate" | "palisade" | "glass" | "brick_wall";
export type FencePost = "timber" | "concrete" | "metal" | "pier";

/** A gate in a fence: its middle `at` metres along the fence from its first point. */
export interface FenceGate {
  at: number;
  width: number;
  /** Two leaves meeting in the middle (a driveway gate). */
  double?: boolean;
}

/** A fence or garden wall: a line of posts and panels along the ground, corner to corner. */
export interface Fence {
  id: string;
  /** Its line, from its first point to its last (open: it does not come back on its own). */
  points: Vec2[];
  style: FenceStyle;
  /** Top of the panels above the ground (m); a topper sits on top of that. */
  height: number;
  /** Colour ("#rrggbb"); null = the style's own (natural timber, black metal…). */
  color?: string | null;
  /** null = the style's usual posts. */
  posts?: FencePost | null;
  /** A concrete board along the bottom; null = the style's usual. */
  gravel_board?: boolean | null;
  topper?: "trellis" | null;
  /** Between posts (m); null = the style's usual (1.83 m for UK panels). */
  spacing?: number | null;
  gates?: FenceGate[];
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
  /** Solar, battery, grid and car charger sensors; anything unset is found from Home Assistant. */
  energy?: EnergySettings | null;
}

/**
 * Power sensors (W or kW) of the house's energy. One sensor each way (both positive), or one signed
 * sensor: the battery positive while discharging, the grid positive while importing.
 */
export interface EnergySettings {
  /** false hides solar, battery and grid everywhere. */
  enabled?: boolean;
  /** Added up (one sensor per string of panels is fine). */
  solar?: string[] | null;
  home?: string | null;
  battery?: string | null;
  battery_charge?: string | null;
  battery_discharge?: string | null;
  battery_level?: string | null;
  grid?: string | null;
  grid_import?: string | null;
  grid_export?: string | null;
  /** Prices per kWh (e.g. Octopus's current rate). */
  price_import?: string | null;
  price_export?: string | null;
  /** What the panels make at most (kW): how brightly they shine in 3D. */
  solar_peak?: number | null;
  /** false hides car charging. */
  ev_enabled?: boolean;
  /** The car charger's power sensor; its status, the car's battery and the rest come from its device. */
  ev_charger?: string | null;
  /** The car's battery (%), when the charger does not know it. */
  ev_level?: string | null;
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
    furniture: (f.furniture ?? []).map(repairHeight),
    devices: f.devices ?? [],
    walls: f.walls ?? [],
    outdoor: (f.outdoor ?? []).map((o) => ({ ...o, area_id: o.area_id ?? null, kind: o.kind ?? "lawn" })),
    fences: (f.fences ?? []).filter((x) => (x.points ?? []).length >= 2).map((x) => ({ ...x, gates: x.gates ?? [] })),
  }));
  floors.sort((a, b) => a.elevation - b.elevation);
  return { version: 1, name: p.name, settings, floors };
}

/**
 * Up to 0.2.0 the integration saved a missing "y" as 0, which put wall cupboards, pictures and
 * ceiling lamps on the floor (inside whatever stood there). On a piece that never stands on the
 * floor, a 0 means "not set".
 */
function repairHeight(x: Furniture): Furniture {
  if (x.y !== 0 || !(CEILING_LAMPS.has(x.type) || (FURNITURE[x.type]?.y ?? 0) > 0)) return x;
  const { y: _unset, ...rest } = x;
  return rest;
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

/**
 * Puts a new corner on edge k of a room or garden area, at distance t from the edge's start.
 * A room's doors and windows past it move to the edge's second half. Returns the new corner's index.
 */
export function splitEdge(floor: Floor, id: string, outdoor: boolean, k: number, t: number): number {
  const s = outdoor ? floor.outdoor?.find((o) => o.id === id) : floor.rooms.find((r) => r.id === id);
  if (!s) return -1;
  const a = s.points[k], b = s.points[(k + 1) % s.points.length];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const r2 = (v: number) => Math.round(v * 100) / 100;
  s.points.splice(k + 1, 0, [r2(a[0] + ((b[0] - a[0]) * t) / len), r2(a[1] + ((b[1] - a[1]) * t) / len)]);
  if (!outdoor) {
    for (const o of floor.openings) {
      if (o.room_id !== id) continue;
      if (o.edge > k) o.edge += 1;
      else if (o.edge === k && o.offset > t) {
        o.edge = k + 1;
        o.offset = r2(o.offset - t);
      }
    }
  }
  return k + 1;
}

let counter = 0;
/** A short unique id for new plan items. */
export function newId(prefix: string): string {
  counter = (counter + 1) % 1296;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36).padStart(2, "0")}`;
}
