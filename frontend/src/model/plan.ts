// The plan: everything VirtuHome knows about the building. Stored by the integration as JSON
// (custom_components/virtuhome/schema.py validates the same shape).
//
// Units are metres. The plan is drawn from above: x grows to the right, z grows DOWN the plan
// (the front of the house is usually at the bottom), y grows up. Room outlines run along the
// MIDDLE of their walls, so neighbouring rooms share edges.

export type Vec2 = [number, number];

import type { ExteriorFinish, FloorFinish, JoineryFinish, RoofCovering, Upholstery, WallFinish } from "../scene/finishes";
import type { DoorStyle, GarageStyle, WindowStyle } from "../scene/joinery";
import { CEILING_LAMPS, FURNITURE, type BalustradeMaterial, type BalustradeStyle } from "../scene/furniture-lib";
import type { SkySettings } from "../live/sky";
import type { DeckBoard, PavingMaterial, PavingPattern, RaisedWall } from "../scene/paving";
import type { Canopy, GardenRoofing, PlanterMaterial, Planting, ShedDoor } from "../scene/garden";

export type FloorMaterial = FloorFinish;
export type { DoorStyle, ExteriorFinish, FloorFinish, GarageStyle, JoineryFinish, RoofCovering, Upholstery, WallFinish, WindowStyle };
export type { DeckBoard, PavingMaterial, PavingPattern, RaisedWall };
export type { Canopy, GardenRoofing, PlanterMaterial, Planting, ShedDoor };
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
  /** Garden buildings (scene/garden.ts): a pergola's top; a shed's or gazebo's roof covering. */
  canopy?: Canopy | null;
  roofing?: GardenRoofing | null;
  /** Sheds: where the door is (or double doors), how many windows, and the trim's colour ("#rrggbb"). */
  door?: ShedDoor | null;
  windows?: number | null;
  trim?: string | null;
  /** Planters: what they are made of, and what grows in them. */
  material?: PlanterMaterial | null;
  plants?: Planting | null;
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
  /** Driveways laid before paving could be picked: "asphalt" is tarmac. */
  surface?: DrivewaySurface | null;
  /** Patios, paths, driveways and gravel: what they are laid with (scene/paving.ts); null = the kind's usual. */
  paving?: PavingMaterial | null;
  /** How the units are laid; null = the material's usual. */
  pattern?: PavingPattern | null;
  /** The units' size in mm, "900x600"; null = the material's usual. */
  unit?: string | null;
  /** The paving's or the deck boards' colour ("#rrggbb"); null = the material's usual. */
  color?: string | null;
  /** The joints' colour ("#rrggbb"); null = the material's usual. */
  joint?: string | null;
  /** Which way the pattern or the boards run: degrees from the area's longest edge (45: diagonal). */
  angle?: number | null;
  /** Decks: what the boards are, and their width (mm). */
  boards?: DeckBoard | null;
  board_width?: number | null;
  /** A course round the edge: a paving material on a patio, "frame" (boards along the edges) on a deck. */
  border?: string | null;
  border_color?: string | null;
  /** Its top above the ground (m): a raised patio or deck. Decks: null = level with the floor indoors. */
  height?: number | null;
  /** Raised patios: what the sides are built of; null = brick. */
  walls?: RaisedWall | null;
  /** Steps down to the ground from a raised patio or deck. */
  steps?: AreaSteps[];
  /** A balustrade along its open edges, in a fence style; null = none. */
  railing?: FenceStyle | null;
}

/** Steps down from a raised area: in the middle of an edge (points[edge] -> points[edge + 1]). */
export interface AreaSteps {
  edge: number;
  /** Across the steps (m); null = the whole edge. */
  width?: number | null;
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
  /** A floor plan image to trace over in the 2D editor (the 3D view never loads it). */
  background?: FloorBackground | null;
  /** Roofs over this storey's walls (scene/roofs.ts builds them). */
  roofs?: Roof[];
}

/**
 * Roof shapes. Gable, hip, half-hip (jerkinhead) and Dutch (gablet) differ in their ends; mansard
 * (hipped) and gambrel (gable ends) have a steep lower slope under a shallow upper one; a lean-to
 * has one slope, rising to its back; a butterfly two falling to a valley; M-shaped two gables side
 * by side.
 */
export type RoofShape =
  | "gable" | "hip" | "half_hip" | "dutch" | "pyramid" | "mansard" | "gambrel" | "lean_to" | "flat" | "butterfly" | "m_shaped";

/** Ends of a roof that carry on next door (a semi-detached or terraced house): cut off flush there. */
export type PartyEnds = "left" | "right" | "both";

/**
 * A roof over a rectangle of walls: `w` along its ridge, `d` across it, measured like rooms along
 * the middle of the walls, its middle at (x, z), turned `rotation` degrees clockwise. Unturned, the
 * ridge runs across the plan (along x) and the front slope faces down the plan (+z); a lean-to
 * rises towards its back (-z). Its left and right ends are at -x and +x.
 */
export interface Roof {
  id: string;
  x: number;
  z: number;
  w: number;
  d: number;
  rotation: number;
  shape: RoofShape;
  /** Slope in degrees (the upper slope of a mansard or gambrel). */
  pitch: number;
  party?: PartyEnds | null;
  /** The eaves' height above the storey's floor (m); null: the top of its walls. */
  eaves?: number | null;
  /** How far the eaves reach past the walls (m); null: the usual for the shape. */
  overhang?: number | null;
  covering: RoofCovering;
  /** The covering's colour, for coverings that take one ("#rrggbb"). */
  color?: string | null;
  /** Fascias, soffits and bargeboards ("#rrggbb"); null: white. */
  trim?: string | null;
  /** Flat roofs: a low wall round the edge instead of overhanging eaves. */
  parapet?: boolean;
  /** Roof windows, chimneys, dormers, solar panels and lanterns on it. */
  items?: RoofItem[];
}

export type RoofItemKind = "window" | "chimney" | "dormer" | "solar" | "lantern";
export type RoofWindowStyle = "pivot" | "conservation";
export type DormerStyle = "box" | "gable" | "hipped";
export type ChimneyStyle = "brick" | "render" | "stone";
/** All-black panels, or blue cells in silver frames. */
export type SolarStyle = "black" | "blue";

/**
 * Something on a roof, its middle at (x, z) on the plan. On a slope it lies along the slope:
 * `w` across it and `d` up it; on a flat roof it is turned `rotation` degrees clockwise like
 * furniture. A chimney's and a dormer's `w` x `d` is their size on the plan, a dormer reaching `d`
 * from its front back into the roof.
 */
export interface RoofItem {
  id: string;
  kind: RoofItemKind;
  x: number;
  z: number;
  w: number;
  d: number;
  /** Chimneys: the top above the roof at its middle; dormers: the front wall's height; lanterns: their rise. */
  h?: number | null;
  rotation?: number | null;
  style?: RoofWindowStyle | DormerStyle | ChimneyStyle | SolarStyle | null;
  /** Chimneys: pots on the stack. */
  pots?: number | null;
  /** Solar panels: panels across and up the slope, portrait (long side up the slope), each one's peak power (W). */
  cols?: number | null;
  rows?: number | null;
  portrait?: boolean | null;
  watts?: number | null;
  /** Solar panels: each panel's long and short side (m); null is the typical `PANEL`. */
  panel?: [number, number] | null;
  /** Solar panels on a flat roof: frames tilting them up (degrees) towards `rotation`'s front; null lies flat. */
  tilt?: number | null;
  /** Solar panels: the power sensor of their string (they shine with it). Roof windows: a contact sensor. */
  entity?: string | null;
  /** Roof windows: a blind. */
  cover?: string | null;
  /** Window frames, dormer cheeks, chimney brick ("#rrggbb"). */
  color?: string | null;
}

/**
 * An image under the 2D plan, stored by the integration. Its middle sits at (x, z) on the plan,
 * turned `rotation` degrees clockwise, each pixel `scale` metres wide.
 */
export interface FloorBackground {
  /** The file's name in the integration's image folder. */
  file: string;
  /** The image's size in pixels. */
  width: number;
  height: number;
  /** Metres per pixel. */
  scale: number;
  x: number;
  z: number;
  rotation: number;
  /** 0 hides it, 1 shows it fully. */
  opacity: number;
}

/** The fence designs (scene/fences.ts builds them). */
export type FenceStyle =
  | "closeboard" | "lap" | "slatted" | "venetian" | "hit_miss" | "louvre" | "composite" | "trellis"
  | "picket" | "post_rail" | "railings" | "estate" | "palisade" | "balustrade" | "glass" | "brick_wall";
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
  /** The compass bearing the top of the plan faces, in degrees (0: up the plan is north, 90: east). */
  north: number;
  theme: ThemeName;
  /** Outside walls: brick, render, cladding... and a colour for paintable finishes. */
  exterior_finish: ExteriorFinish;
  exterior_color?: string | null;
  /** Solar, battery, grid and car charger sensors; anything unset is found from Home Assistant. */
  energy?: EnergySettings | null;
  /** The weather shown in 3D: which weather entity, or none. */
  sky?: SkySettings | null;
  /** Who is in which room; anything unset is found from Home Assistant. */
  presence?: PresenceSettings | null;
}

/** People in their rooms, from room-level trackers (Bermuda, ESPresense, mqtt_room). */
export interface PresenceSettings {
  /** false never shows people in rooms (they stay in the top bar). */
  enabled?: boolean;
  /** The tracker that says each person's room, by person entity; null shows that person in no room. */
  people?: Record<string, string | null>;
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

/**
 * What Home Assistant's registries said about a linked entity when the plan was saved: its registry
 * id stays the same when the entity id changes, so a renamed entity is found again (model/links.ts).
 */
export interface EntityLink {
  id?: string | null;
  device_id?: string | null;
}

export interface Plan {
  version: 1;
  name?: string;
  settings: PlanSettings;
  floors: Floor[];
  /** Registry ids of the linked entities, by entity id. */
  links?: Record<string, EntityLink>;
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
    outdoor: (f.outdoor ?? []).map(normalizeOutdoor),
    fences: (f.fences ?? []).filter((x) => (x.points ?? []).length >= 2).map((x) => ({ ...x, gates: x.gates ?? [] })),
    background: normalizeBackground(f.background),
    roofs: (f.roofs ?? []).filter((r) => r.w > 0.2 && r.d > 0.2).map(normalizeRoof),
  }));
  floors.sort((a, b) => a.elevation - b.elevation);
  const links = normalizeLinks(p.links);
  return { version: 1, name: p.name, settings, floors, ...(links ? { links } : {}) };
}

/** Registry ids kept for linked entities: only string ids, and nothing when there are none. */
function normalizeLinks(raw: unknown): Record<string, EntityLink> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: Record<string, EntityLink> = {};
  for (const [entity, v] of Object.entries(raw as Record<string, EntityLink>)) {
    const id = typeof v?.id === "string" && v.id ? v.id : null;
    const device = typeof v?.device_id === "string" && v.device_id ? v.device_id : null;
    if (id || device) out[entity] = { ...(id ? { id } : {}), ...(device ? { device_id: device } : {}) };
  }
  return Object.keys(out).length ? out : null;
}

/** A garden area with its kind and area set, its height in range and its steps on edges it has. */
function normalizeOutdoor(o: OutdoorArea): OutdoorArea {
  const n = (o.points ?? []).length;
  const height = typeof o.height === "number" && isFinite(o.height) ? Math.max(0, Math.min(3, o.height)) : null;
  return {
    ...o,
    area_id: o.area_id ?? null,
    kind: o.kind ?? "lawn",
    ...(o.height !== undefined ? { height } : {}),
    ...(o.steps ? { steps: o.steps.filter((s) => Number.isInteger(s.edge) && s.edge >= 0 && s.edge < n) } : {}),
  };
}

const ROOF_SHAPES = new Set<RoofShape>(["gable", "hip", "half_hip", "dutch", "pyramid", "mansard", "gambrel", "lean_to", "flat", "butterfly", "m_shaped"]);

/** A roof with its shape, slope and covering set, and its solar panels sized from their panels. */
function normalizeRoof(r: Roof): Roof {
  const shape = ROOF_SHAPES.has(r.shape) ? r.shape : "gable";
  const pitch = typeof r.pitch === "number" && isFinite(r.pitch) ? Math.max(0, Math.min(75, r.pitch)) : 35;
  return {
    ...r,
    rotation: r.rotation ?? 0,
    shape,
    pitch,
    covering: r.covering ?? "concrete_tiles",
    items: (r.items ?? []).map((it) => (it.kind === "solar" ? normalizeSolar(it) : it)),
  };
}

function normalizeSolar(it: RoofItem): RoofItem {
  const out = { ...it, panel: panelSize(it.panel) };
  return { ...out, ...solarSize(out) };
}

/** A typical panel today: 1.72 x 1.13 m, about 430 W. */
export const PANEL = { long: 1.722, short: 1.134, gap: 0.02, watts: 430 };

/** A usable panel size, long side first (m), or null for the typical one. */
export function panelSize(p: unknown): [number, number] | null {
  if (!Array.isArray(p) || p.length !== 2) return null;
  const [a, b] = p.map(Number);
  if (!(isFinite(a) && isFinite(b))) return null;
  const long = Math.max(a, b), short = Math.min(a, b);
  if (long > 3 || short < 0.3) return null;
  return [Math.round(long * 1000) / 1000, Math.round(short * 1000) / 1000];
}

/** One panel's sides (m): the array's own size, or the typical one. */
export function panelOf(it: Pick<RoofItem, "panel">): { long: number; short: number } {
  const p = panelSize(it.panel);
  return p ? { long: p[0], short: p[1] } : PANEL;
}

/** A solar array's size from its panels: `w` across the slope, `d` up it. */
export function solarSize(it: Pick<RoofItem, "cols" | "rows" | "portrait" | "panel">): { w: number; d: number } {
  const cols = Math.max(1, Math.round(it.cols ?? 1));
  const rows = Math.max(1, Math.round(it.rows ?? 1));
  const portrait = it.portrait ?? true;
  const panel = panelOf(it);
  const across = portrait ? panel.short : panel.long;
  const up = portrait ? panel.long : panel.short;
  const r3 = (v: number) => Math.round(v * 1000) / 1000;
  return { w: r3(cols * across + (cols - 1) * PANEL.gap), d: r3(rows * up + (rows - 1) * PANEL.gap) };
}

/** A usable background, or null: it needs a file, a size and a scale. */
function normalizeBackground(b: FloorBackground | null | undefined): FloorBackground | null {
  if (!b || typeof b.file !== "string" || !b.file || !(b.width > 0) || !(b.height > 0) || !(b.scale > 0)) return null;
  const num = (v: unknown, d: number) => (typeof v === "number" && isFinite(v) ? v : d);
  return {
    ...b,
    x: num(b.x, 0),
    z: num(b.z, 0),
    rotation: num(b.rotation, 0),
    opacity: Math.max(0, Math.min(1, num(b.opacity, 0.5))),
  };
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
