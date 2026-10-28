// Turns one floor of the plan into meshes: an opaque mesh (room floors, walls, furniture) and a
// glass mesh, plus the moving parts' descriptions (doors, windows, lamps, screens) that the
// lighting and live-state code drive. Every surface is tagged with its finish ("floor:oak",
// "ext:brick", "role:fabric"...) so the realistic look can texture it.
import { Color, ShapeUtils, Vector2 } from "three";
import { groundOf, type Fence, type Floor, type Furniture, type OutdoorArea, type Plan, type Vec2 } from "../model/plan";
import { bounds, labelPoint, pointInPolygon, segmentDistance } from "../model/geom";
import { layoutWalls, OUTSIDE, type WallLayout, type WallSegment } from "../model/walls";
import { EXTERIOR_FINISHES, FLOOR_FINISHES, parseHex, UPHOLSTERY, WALL_FINISHES, type FinishDef } from "./finishes";
import { baseHeight, CEILING_LAMPS, FURNITURE, furnitureType, paintRoles, type Part, type Role } from "./furniture-lib";
import { Geo, ROOM_NONE, ROOM_OUTSIDE, type V3 } from "./geo";
import { WALL_HANG, WALL_TRIM } from "./materials";
import { buildOpeningFixed, joineryLook, type OpeningInfo } from "./joinery";
import { cameraPieces, cameraRig, type CameraRig } from "./cameras";
import { deviceEntities, DEVICE_TYPES, fanBlades, FAN_LIGHTS, FAN_TYPES, gangsOf, GANG_TYPES } from "./devices";
import { fencePaint, fencePieces, FENCE_STYLES } from "./fences";
import { edgeOf, insetPolygon, openEdges, railingRuns, stepBlocks, turnOf } from "./areas";
import { areaColour, areaPaving, BORDER_MATERIALS, BORDER_UNITS, deckKey, deckLook, isPaved, layingAngle, layingFrame, pavingKey, pavingLook, type PavingMaterial } from "./paving";
import { drawRoof, drawRoofItem, floorRoofs, type RoofDraw, type RoofModel } from "./roofs";
import { inPalette, type Palette } from "./palette";

export const SLAB = 0.18;

/** Whether a garden area stands up off the ground (a deck, a raised patio): its sides show and things stand on it. */
export function isRaised(o: OutdoorArea | undefined): boolean {
  return !!o && (o.kind === "deck" || (o.height ?? 0) > 0.02);
}

/**
 * Height of garden area k's top above the floor's level. A deck stands level with the floor indoors
 * unless its height is set (a hair under it, so a deck reaching under a wall never fights the
 * floor); a raised patio or deck stands its height above the ground; the rest lie on the ground.
 * Overlapping areas stack a few millimetres apart: raised ones over the rest, later over earlier.
 */
export function outdoorTop(floor: Floor, k: number): number {
  const all = floor.outdoor ?? [];
  const o = all[k];
  const level = (x: OutdoorArea) => x.kind === "deck" && (x.height === null || x.height === undefined);
  if (o && level(o)) return -0.012 + 0.002 * Math.min(5, all.slice(0, k).filter(level).length);
  if (isRaised(o)) return -SLAB + Math.max(0.03, o!.height ?? 0) + 0.002 * Math.min(5, k);
  return -SLAB + 0.004 + (o?.kind === "patio" ? 0.012 : 0) + 0.003 * k;
}

/** The garden area on top at p (an index into floor.outdoor), or -1. */
export function outdoorAt(floor: Floor, p: Vec2): number {
  let top = -1;
  (floor.outdoor ?? []).forEach((o, k) => {
    if (pointInPolygon(p, o.points) && (top < 0 || outdoorTop(floor, k) > outdoorTop(floor, top))) top = k;
  });
  return top;
}

/** What stands outside at p rests on, from the floor's level: a deck, or the ground. */
export function groundAt(floor: Floor, p: Vec2): number {
  const k = outdoorAt(floor, p);
  return k >= 0 && isRaised(floor.outdoor![k]) ? outdoorTop(floor, k) : -SLAB;
}

/** Lintels whose bottom is at least this high sit above any cut, so they can drop out when cut. */
const HANG_ABOVE = 1.5;
const GRID = 0.32; // spacing of the lighting grid on floors and walls (m)
export const MAX_WALL_SLOTS = 128;

export interface GlowSlot {
  kind: "lamp" | "screen" | "window";
  entity: string | null;
  room: number;
  /** The furniture type it belongs to (solar panels shine with the house's solar power). */
  type?: string;
  /** The piece of furniture's id (an extension's mark can light it). */
  item?: string;
}

export interface LampInfo {
  id: string;
  entity: string | null;
  room: number;
  /** Where the light comes from (world). */
  pos: V3;
  type: string;
  glow: number;
  /** Reach of the light in metres at full brightness. */
  radius: number;
}

/** A door or garage door: its leaves are drawn by scene/joinery.ts as they move. */
export type DoorInfo = OpeningInfo;

export interface WindowInfo extends OpeningInfo {
  /** Middle of the window (world), and the direction into its room. */
  centre: V3;
  normal: Vec2;
  glow: number;
}

export interface Portal {
  a: number;
  b: number;
  pos: V3;
  width: number;
  /** Contact sensor of the door (null: always open). */
  entity: string | null;
  door: boolean;
}

export interface RoomInfo {
  index: number;
  id: string;
  name: string;
  area_id: string | null;
  label: Vec2;
  area: number;
  /** Garden areas come after the rooms. */
  outdoor?: boolean;
}

/** A device a tap switches or opens as a whole (a switch, an access point): a generous target around its middle. */
export interface DeviceTarget {
  /** Index into FloorBuild.items. */
  item: number;
  /** Its entities: a switch's gangs, left to right. */
  entities: string[];
  /** Its middle (world, before the floor's offset). */
  pos: V3;
  room: number;
}

/** A ceiling fan: its blades are drawn with the floor's moving parts, turned about its middle. */
export interface FanInfo {
  furniture: Furniture;
  /** Index into FloorBuild.items. */
  item: number;
  /** The ceiling it hangs from (world, before the floor's offset). */
  bottom: number;
  room: number;
}

/** A movable thing of the plan: a piece of furniture, or a device (a light gets a lamp model). */
export interface ItemRef {
  /**
   * Editor handles: "corner" sits on a room's corner, id "<space id>:<corner index>"; "edge" is the
   * + in the middle of an edge that adds a corner there, id "<space id>:<edge index>". A fence's
   * points and +s are "fencepoint" and "fenceedge", id "<fence id>:<index>". A roof's corner handles
   * are "roofcorner", id "<roof id>:<corner index>"; what sits on a roof is a "roofitem".
   */
  kind: "furniture" | "device" | "corner" | "edge" | "opening" | "fence" | "fencepoint" | "fenceedge" | "roof" | "roofitem" | "roofcorner";
  id: string;
}

export interface FloorBuild {
  floor: Floor;
  items: ItemRef[];
  index: number;
  opaque: Geo;
  glass: Geo;
  layout: WallLayout;
  rooms: RoomInfo[];
  glows: GlowSlot[];
  lamps: LampInfo[];
  doors: DoorInfo[];
  windows: WindowInfo[];
  portals: Portal[];
  /** Pieces with a screen or a light that shows their entity; `at` is the middle of what glows (world). */
  screens: { furniture: Furniture; glow: number; entity: string | null; at: V3 }[];
  targets: DeviceTarget[];
  fans: FanInfo[];
  /** Cameras: where each hangs and what it sees (the viewer draws that). */
  cameras: CameraRig[];
  bounds: { minX: number; minZ: number; maxX: number; maxZ: number };
  /** The storey's roofs, in meshes of their own (the view hides them to look inside). */
  roof: Geo;
  roofGlass: Geo;
  roofs: RoofModel[];
  /** Glows and items before the roofs' (the roofs are rebuilt on their own). */
  glowsBase: number;
  itemsBase: number;
}

export interface BuildOptions {
  /** Fewer segments on round things and a coarser lighting grid. */
  low: boolean;
}

const colorCache = new Map<number, V3>();
/** sRGB hex to linear RGB, as three.js expects vertex colours. */
export function lin(hex: number): V3 {
  let c = colorCache.get(hex);
  if (!c) {
    const col = new Color().setHex(hex);
    c = [col.r, col.g, col.b];
    colorCache.set(hex, c);
  }
  return c;
}

/** How one side of a wall looks: its surface key and colour. */
interface Look {
  surf: string;
  col: V3;
}

/** A finish's look: the picked colour for tintable finishes, else its own. */
function finishLook(group: string, name: string, def: FinishDef, custom: string | null | undefined, pal: Palette, outside: boolean): Look {
  const hex = (def.tintable ? parseHex(custom) : null) ?? def.color;
  return { surf: `${group}:${name}`, col: lin(inPalette(pal, hex, outside)) };
}

export function buildFloor(plan: Plan, floorIndex: number, pal: Palette, opt: BuildOptions): FloorBuild {
  const floor = plan.floors[floorIndex];
  const layout = layoutWalls(floor, plan.settings);
  const opaque = new Geo();
  const glass = new Geo();
  glass.useSurface("glass");
  const glows: GlowSlot[] = [];
  const lamps: LampInfo[] = [];
  const doors: DoorInfo[] = [];
  const windows: WindowInfo[] = [];
  const portals: Portal[] = [];
  const screens: FloorBuild["screens"] = [];
  const targets: DeviceTarget[] = [];
  const fans: FanInfo[] = [];
  const items: ItemRef[] = [];
  // doors and windows can be tapped in the editor: one item each
  const openingItems = new Map<string, number>();
  for (const o of floor.openings) {
    openingItems.set(o.id, items.length);
    items.push({ kind: "opening", id: o.id });
  }
  const y0 = floor.elevation;
  opaque.uvY0 = y0;
  glass.uvY0 = y0;
  const grid = opt.low ? GRID * 1.4 : GRID;

  const rooms: RoomInfo[] = floor.rooms.map((r, i) => ({
    index: i, id: r.id, name: r.name, area_id: r.area_id, label: labelPoint(r.points),
    area: Math.abs(r.points.reduce((s, p, k) => {
      const q = r.points[(k + 1) % r.points.length];
      return s + p[0] * q[1] - q[0] * p[1];
    }, 0)) / 2,
  }));
  const outdoor = floor.outdoor ?? [];
  outdoor.forEach((o, k) => rooms.push({
    index: floor.rooms.length + k, id: o.id, name: o.name, area_id: o.area_id, label: labelPoint(o.points),
    area: 0, outdoor: true,
  }));
  const roomAt = (p: Vec2): number => {
    for (let i = 0; i < floor.rooms.length; i++) if (pointInPolygon(p, floor.rooms[i].points)) return i;
    const k = outdoorAt(floor, p);
    return k >= 0 ? floor.rooms.length + k : ROOM_OUTSIDE;
  };

  // how each side of a wall looks: the room's own walls inside, the house's finish outside
  const extName = floor.exterior_finish ?? plan.settings.exterior_finish ?? "render";
  const extDef = (EXTERIOR_FINISHES as Record<string, FinishDef>)[extName] ?? EXTERIOR_FINISHES.render;
  const exterior = finishLook("ext", extName, extDef, floor.exterior_finish ? floor.exterior_color : plan.settings.exterior_color, pal, true);
  const inside = floor.rooms.map((r) => {
    const name = r.wall_finish ?? "paint";
    const def = (WALL_FINISHES as Record<string, FinishDef>)[name] ?? WALL_FINISHES.paint;
    // plain paint without a picked colour keeps the palette's wall colour
    if (name === "paint" && !parseHex(r.wall_color)) return { surf: "wall:paint", col: lin(pal.wallInner) };
    return finishLook("wall", name, def, r.wall_color, pal, false);
  });
  const sideLook = (room: number): Look => (room === OUTSIDE || room < 0 ? exterior : inside[room] ?? inside[0] ?? exterior);

  // ---------------------------------------------------------------- garden areas
  outdoor.forEach((o, k) => buildArea(opaque, glass, plan, floor, o, k, pal, grid * 2, opt.low));

  // ---------------------------------------------------------------- room floors
  const wells = stairwells(plan, floorIndex);
  const wellBounds = wells.map((w) => bounds(w.hole));
  const overlaps = (a: { minX: number; minZ: number; maxX: number; maxZ: number }, b: typeof a) =>
    a.minX < b.maxX && b.minX < a.maxX && a.minZ < b.maxZ && b.minZ < a.maxZ;
  const cutsRoom = (k: number, ri: number) => wells[k].room < 0 || wells[k].room === ri;
  /** A piece of room ri's floor with its stairwells taken out of it. */
  const cutWells = (poly: Vec2[], ri: number): Vec2[][] => {
    let pieces = [poly];
    wells.forEach((w, k) => {
      if (!cutsRoom(k, ri)) return;
      pieces = pieces.flatMap((p) => (overlaps(bounds(p), wellBounds[k]) ? subtractConvex(p, w.hole) : [p]));
    });
    return pieces;
  };
  floor.rooms.forEach((room, ri) => {
    const name = room.floor && room.floor in FLOOR_FINISHES ? room.floor : "wood";
    const def: FinishDef = FLOOR_FINISHES[name];
    opaque.useSurface(`floor:${name}`);
    const colour = lin(inPalette(pal, def.color));
    const b = bounds(room.points);
    const edges = room.points.map((p, i) => [p, room.points[(i + 1) % room.points.length]] as [Vec2, Vec2]);
    const edgeDist = (x: number, z: number) => Math.min(...edges.map(([a, c]) => segmentDistance([x, z], a, c).d));
    const up: V3 = [0, 1, 0];
    const down: V3 = [0, -1, 0];
    const holed = wellBounds.some((wb, k) => cutsRoom(k, ri) && overlaps(b, wb));
    const kept: Vec2[][] = [];
    for (let gx = Math.floor(b.minX / grid) * grid; gx < b.maxX; gx += grid) {
      for (let gz = Math.floor(b.minZ / grid) * grid; gz < b.maxZ; gz += grid) {
        const cell = clipToRect(room.points, gx, gz, gx + grid, gz + grid);
        if (cell.length < 3) continue;
        for (const piece of holed ? cutWells(cell, ri) : [cell]) {
          const tris = ShapeUtils.triangulateShape(piece.map(([x, z]) => new Vector2(x, z)), []);
          // darker where the floor meets the walls: cheap contact shadow
          const ids = piece.map(([x, z]) => opaque.vertex([x, y0, z], up, colour, ri, -1, -1, 0.8 + 0.2 * Math.min(1, edgeDist(x, z) / 0.55)));
          for (const [a, c, d] of tris) opaque.tri(ids[a], ids[c], ids[d], up);
          if (holed) kept.push(piece);
        }
      }
    }
    // underside of the slab, seen when floors are pulled apart
    opaque.useSurface("slab");
    for (const piece of holed ? kept : [room.points]) {
      const under = ShapeUtils.triangulateShape(piece.map(([x, z]) => new Vector2(x, z)), []);
      const ids = piece.map(([x, z]) => opaque.vertex([x, y0 - SLAB, z], down, lin(pal.slab), ROOM_NONE));
      for (const [a, c, d] of under) opaque.tri(ids[a], ids[c], ids[d], down);
    }
  });
  // the sides of a stairwell, plastered, along its edges within the room it opens in; not where a
  // wall of the storey below stands, whose face would lie in the same place and flicker with them
  opaque.useSurface("wall:paint");
  const below = wells.length ? layoutWalls(plan.floors[floorIndex - 1], plan.settings).walls : [];
  const inWallBelow = (p: Vec2) => below.some((w) => segmentDistance(p, w.a, w.b).d < w.thickness / 2 + 0.02);
  for (const { hole, room } of wells) {
    const cx = hole.reduce((s, p) => s + p[0], 0) / hole.length;
    const cz = hole.reduce((s, p) => s + p[1], 0) / hole.length;
    hole.forEach((a, i) => {
      const c = hole[(i + 1) % hole.length];
      const l = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      let n: V3 = [(c[1] - a[1]) / l, 0, -(c[0] - a[0]) / l];
      if ((cx - (a[0] + c[0]) / 2) * n[0] + (cz - (a[1] + c[1]) / 2) * n[2] < 0) n = [-n[0], 0, -n[2]];
      // in short lengths, so an edge that leaves the room stops where the room does
      const k = Math.max(1, Math.ceil(l / 0.25));
      for (let j = 0; j < k; j++) {
        const p: Vec2 = [a[0] + ((c[0] - a[0]) * j) / k, a[1] + ((c[1] - a[1]) * j) / k];
        const q: Vec2 = [a[0] + ((c[0] - a[0]) * (j + 1)) / k, a[1] + ((c[1] - a[1]) * (j + 1)) / k];
        const mid: Vec2 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        const ri = floor.rooms.findIndex((r) => pointInPolygon(mid, r.points));
        if (ri < 0 || (room >= 0 && ri !== room) || inWallBelow(mid)) continue;
        opaque.quad([p[0], y0 - SLAB, p[1]], [q[0], y0 - SLAB, q[1]], [q[0], y0, q[1]], [p[0], y0, p[1]], n, lin(pal.wallInner), ri);
      }
    });
  }

  // ---------------------------------------------------------------- walls
  const lowest = floorIndex === 0;
  const hasAbove = floorIndex < plan.floors.length - 1;
  layout.walls.forEach((w, wi) => {
    const slot = wi < MAX_WALL_SLOTS ? wi : -1;
    buildWall(opaque, glass, w, slot, y0, pal, grid, glows, windows, doors, lowest ? -SLAB : 0, hasAbove ? w.height - 0.003 : w.height, sideLook(w.roomA), sideLook(w.roomB), openingItems, opt.low);
    // the slab edge of an upper storey, set back 5 mm so it hides behind the storey below when stacked
    if (!lowest && w.exterior) slabEdge(opaque, w, y0, exterior);
  });

  // portals: doors and openings between two rooms let light through
  for (const w of layout.walls) {
    if (w.exterior) continue;
    for (const po of w.openings) {
      if (po.opening.kind === "window") continue;
      portals.push({
        a: w.roomA, b: w.roomB, pos: [po.centre[0], y0 + 1.0, po.centre[1]], width: po.t1 - po.t0,
        entity: po.opening.entity ?? null, door: po.opening.kind === "door",
      });
    }
  }

  // ---------------------------------------------------------------- furniture
  // a light placed as a plain device gets a lamp model of its mount, so it glows in 3D
  const lampEntities = new Set(floor.furniture.map((f) => f.entity).filter(Boolean));
  const fromDevices: Furniture[] = floor.devices
    .filter((d) => d.entity.startsWith("light.") && !lampEntities.has(d.entity))
    .map((d) => {
      const outside = outdoor.some((o) => pointInPolygon([d.x, d.z], o.points)) && !floor.rooms.some((r) => pointInPolygon([d.x, d.z], r.points));
      const type = outside && d.mount !== "wall" ? "lamp_garden" : lampTypeFor(d.mount);
      const [w, dd, h] = FURNITURE[type].size;
      return { id: `dev_${d.id}`, type, x: d.x, z: d.z, rotation: d.rotation ?? 0, w, d: dd, h, y: d.y ?? undefined, entity: d.entity };
    });
  for (const item of [...floor.furniture, ...fromDevices]) {
    const fromDevice = item.id.startsWith("dev_");
    opaque.currentItem = glass.currentItem = items.length;
    items.push({ kind: fromDevice ? "device" : "furniture", id: fromDevice ? item.id.slice(4) : item.id });
    const def = furnitureType(item.type);
    const room = roomAt([item.x, item.z]);
    // a ceiling fan's light works as a lamp
    const isLamp = def.category === "lights" || FAN_LIGHTS.has(item.type);
    const lampEntity = def.category === "lights" ? item.entity : item.light;
    const ceiling = CEILING_LAMPS.has(item.type);
    const onGround = room >= floor.rooms.length;
    const bottom = y0 + baseHeight(item, floor.height) + (onGround ? groundAt(floor, [item.x, item.z]) : 0);
    const parts = def.build(item.w, item.d, item.h, item);
    let glow = -1;
    if (isLamp || parts.some((p) => p.glow === "screen")) {
      glow = glows.length;
      // a switch or socket lights each gang with its own entity
      const gangs = GANG_TYPES.has(item.type) ? gangsOf(item) : [(isLamp ? lampEntity : item.entity) ?? null];
      for (const entity of gangs) glows.push({ kind: isLamp ? "lamp" : "screen", entity, room, type: item.type, item: item.id });
    }
    if (DEVICE_TYPES.has(item.type)) {
      const entities = deviceEntities(item);
      const mid = ceiling ? bottom - item.h / 2 : bottom + item.h / 2;
      if (entities.length) targets.push({ item: items.length - 1, entities, pos: [item.x, mid, item.z], room });
    }
    // a raised piece (a wall cupboard, a lamp on the wall) shows its underside; one on the floor does not
    const raised = baseHeight(item, floor.height) > 0.05;
    addParts(opaque, parts, item, bottom, raised, room, glow, pal, opt.low, glass);
    if (FAN_TYPES.has(item.type)) fans.push({ furniture: item, item: items.length - 1, bottom, room });
    if (isLamp) {
      const top = parts.reduce((m, p) => Math.max(m, p.y + p.h), -10);
      const low = parts.reduce((m, p) => Math.min(m, p.y), 10);
      const ly = ceiling ? bottom + low : bottom + top - 0.1;
      lamps.push({
        id: item.id, entity: lampEntity ?? null, room, pos: [item.x, ly, item.z], type: item.type, glow,
        radius: LAMP_RADIUS[item.type] ?? 3.2,
      });
    } else if (glow >= 0) {
      // the middle of what glows, turned with the piece: a TV's screen
      const lit = parts.filter((p) => p.glow);
      const [lx, ly, lz] = [0, 1, 2].map((k) => lit.reduce((n, p) => n + [p.x, p.y + p.h / 2, p.z][k], 0) / lit.length);
      const r = (item.rotation * Math.PI) / 180, mx = item.mirror ? -1 : 1;
      const at: V3 = [item.x + Math.cos(r) * lx * mx - Math.sin(r) * lz, bottom + ly, item.z + Math.sin(r) * lx * mx + Math.cos(r) * lz];
      screens.push({ furniture: item, glow, entity: item.entity ?? null, at });
    }
  }

  // fences: a piece per bay, post and gate, standing on the ground; a tap picks the whole fence
  for (const fence of floor.fences ?? []) {
    opaque.currentItem = glass.currentItem = items.length;
    items.push({ kind: "fence", id: fence.id });
    const paint = fencePaint(fence);
    for (const piece of fencePieces(fence, opt.low)) {
      const at: Vec2 = [piece.item.x, piece.item.z];
      addParts(opaque, piece.parts, piece.item, y0 + groundAt(floor, at), false, roomAt(at), -1, pal, opt.low, glass, paint);
    }
  }

  // cameras: a model of their kind on their wall or ceiling, tapped and dragged like their device
  const cameras: CameraRig[] = [];
  for (const d of floor.devices) {
    if (!d.entity.startsWith("camera.")) continue;
    const rig = cameraRig(floor, layout, d);
    cameras.push(rig);
    opaque.currentItem = glass.currentItem = items.length;
    items.push({ kind: "device", id: d.id });
    const room = roomAt(rig.lens);
    for (const piece of cameraPieces(rig)) addParts(opaque, piece.parts, piece.item, y0 + piece.bottom, true, room, -1, pal, opt.low, glass);
  }

  opaque.currentItem = glass.currentItem = -1;
  const all = floor.rooms.flatMap((r) => r.points);
  const fb: FloorBuild = {
    floor, items, index: floorIndex, opaque, glass, layout, rooms, glows, lamps, doors, windows, portals, screens, targets, fans, cameras,
    bounds: all.length ? bounds(all) : { minX: 0, minZ: 0, maxX: 1, maxZ: 1 },
    roof: new Geo(), roofGlass: new Geo(), roofs: [], glowsBase: glows.length, itemsBase: items.length,
  };
  buildRoofs(plan, fb, pal, opt);
  return fb;
}

/**
 * Builds a storey's roofs (again) into its build: their meshes, glows (solar panels, lit roof
 * windows) and items, after the storey's own.
 */
export function buildRoofs(plan: Plan, fb: FloorBuild, pal: Palette, opt: BuildOptions): void {
  const fi = fb.index;
  const floor = plan.floors[fi];
  fb.glows.length = fb.glowsBase;
  fb.items.length = fb.itemsBase;
  const roof = new Geo();
  const roofGlass = new Geo();
  roofGlass.useSurface("glass");
  roof.uvY0 = roofGlass.uvY0 = floor.elevation;
  const extName = floor.exterior_finish ?? plan.settings.exterior_finish ?? "render";
  const extDef = (EXTERIOR_FINISHES as Record<string, FinishDef>)[extName] ?? EXTERIOR_FINISHES.render;
  const draw: RoofDraw = {
    geo: roof, glass: roofGlass, glows: fb.glows, low: opt.low,
    colour: (hex, outside) => lin(inPalette(pal, hex, outside)),
    exterior: finishLook("ext", extName, extDef, floor.exterior_finish ? floor.exterior_color : plan.settings.exterior_color, pal, true),
    roomAt: (p) => floor.rooms.findIndex((r) => pointInPolygon(p, r.points)),
  };
  const models = floorRoofs(plan, fi);
  for (const m of models) {
    roof.currentItem = roofGlass.currentItem = fb.items.length;
    fb.items.push({ kind: "roof", id: m.roof.id });
    drawRoof(m, draw);
    for (const it of m.roof.items ?? []) {
      roof.currentItem = roofGlass.currentItem = fb.items.length;
      fb.items.push({ kind: "roofitem", id: it.id });
      drawRoofItem(m, it, draw, floor);
    }
  }
  roof.currentItem = roofGlass.currentItem = -1;
  fb.roof = roof;
  fb.roofGlass = roofGlass;
  fb.roofs = models;
}

// -------------------------------------------------------------------- garden areas

/** An area's surface: its texture key and its colour in the model look. */
function areaLook(o: OutdoorArea, pal: Palette): Look {
  const hex = parseHex(areaColour(o));
  const surf = o.kind === "deck" ? deckKey(deckLook(o)) : isPaved(o) ? pavingKey(areaPaving(o)) : `out:${groundOf(o)}`;
  return { surf, col: lin(hex !== null ? inPalette(pal, hex, true) : pal.outdoor[groundOf(o)] ?? pal.outdoor.lawn) };
}

/** A course round an area's edge (a patio's border of setts, a deck's picture frame): its look and width (m). */
function borderLook(o: OutdoorArea, pal: Palette): { look: Look; width: number } | null {
  if (!o.border) return null;
  if (o.kind === "deck") {
    if (o.border !== "frame") return null;
    const d = deckLook(o);
    return { look: areaLook(o, pal), width: (d.width + 6) / 1000 };
  }
  if (!isPaved(o) || !BORDER_MATERIALS.includes(o.border as PavingMaterial)) return null;
  const m = o.border as PavingMaterial;
  const p = pavingLook(m, { pattern: m === "setts" ? "grid" : "stretcher", unit: BORDER_UNITS[m], color: o.border_color, joint: o.joint });
  return { look: { surf: pavingKey(p), col: lin(inPalette(pal, parseHex(p.color)!, true)) }, width: p.unit[1] / 1000 };
}

/** What a raised area's sides are: a deck's fascia boards, a raised patio's walls. */
function sideLook(o: OutdoorArea, pal: Palette, top: Look): Look {
  if (o.kind === "deck") return { surf: top.surf, col: top.col.map((c) => c * 0.85) as V3 };
  const w = o.walls ?? "brick";
  if (w === "sleepers") return { surf: deckKey({ boards: "softwood", color: "#6a5440", width: 194 }), col: lin(inPalette(pal, 0x6a5440, true)) };
  const name = w === "stone" ? "stone" : w === "render" ? "render" : "brick";
  return { surf: `ext:${name}`, col: lin(inPalette(pal, EXTERIOR_FINISHES[name].color, true)) };
}

/** The texture frame along a direction on the plan, counted from point a: u along dir, v across it (towards `across`). */
function frameAlong(a: Vec2, dir: Vec2, across: Vec2): { c: number; s: number; ou: number; ov: number } {
  // v grows along (-s, c); turn the frame round if that points the other way
  const flip = -dir[1] * across[0] + dir[0] * across[1] < 0 ? -1 : 1;
  const c = dir[0] * flip, s = dir[1] * flip;
  return { c, s, ou: a[0] * c + a[1] * s, ov: -a[0] * s + a[1] * c };
}

/** A flat polygon at height y, in lighting-grid cells. */
function fillPolygon(g: Geo, pts: Vec2[], y: number, colour: V3, room: number, cell: number): void {
  const up: V3 = [0, 1, 0];
  const b0 = bounds(pts);
  for (let gx = Math.floor(b0.minX / cell) * cell; gx < b0.maxX; gx += cell) {
    for (let gz = Math.floor(b0.minZ / cell) * cell; gz < b0.maxZ; gz += cell) {
      const piece = clipToRect(pts, gx, gz, gx + cell, gz + cell);
      if (piece.length < 3) continue;
      const tris = ShapeUtils.triangulateShape(piece.map(([x, z]) => new Vector2(x, z)), []);
      const ids = piece.map(([x, z]) => g.vertex([x, y, z], up, colour, room));
      for (const [a, c, d] of tris) g.tri(ids[a], ids[c], ids[d], up);
    }
  }
}

/**
 * A garden area: its surface (in its laying direction, inside its border), and when raised its
 * sides down to the ground, its steps and its railing.
 */
function buildArea(opaque: Geo, glass: Geo, plan: Plan, floor: Floor, o: OutdoorArea, k: number, pal: Palette, cell: number, low: boolean): void {
  if (o.points.length < 3) return;
  const room = floor.rooms.length + k;
  const y0 = floor.elevation;
  const top = y0 + outdoorTop(floor, k);
  const ground = y0 - SLAB;
  const look = areaLook(o, pal);
  const border = borderLook(o, pal);
  const turn = turnOf(o.points);
  const inner = border ? insetPolygon(o.points, border.width) : o.points;
  opaque.useSurface(look.surf);
  opaque.uvFrame = layingFrame(inner, layingAngle(o));
  fillPolygon(opaque, inner, top, look.col, room, cell);
  opaque.uvFrame = null;
  if (border) {
    // one course along each edge, mitred at the corners, running along the edge from its outside
    opaque.useSurface(border.look.surf);
    o.points.forEach((a, i) => {
      const e = edgeOf(o.points, i, turn);
      if (e.len < 0.01) return;
      const j = (i + 1) % o.points.length;
      opaque.uvFrame = frameAlong(a, e.dir, [-e.out[0], -e.out[1]]);
      opaque.quad([a[0], top, a[1]], [e.b[0], top, e.b[1]], [inner[j][0], top, inner[j][1]], [inner[i][0], top, inner[i][1]], [0, 1, 0], border.look.col, room, -1, -1, Math.max(1, Math.ceil(e.len / cell)), 1);
    });
    opaque.uvFrame = null;
  }
  if (!isRaised(o)) return;

  const open = openEdges(floor, o, plan.settings.wall_exterior);
  const side = sideLook(o, pal, look);
  const deck = o.kind === "deck";
  // a raised patio's slabs overhang its walls a little, as a coping does
  const lip = deck ? 0 : 0.03, lipH = deck ? 0 : 0.04;
  o.points.forEach((p, i) => {
    if (!open[i]) return;
    const e = edgeOf(o.points, i, turn);
    if (e.len < 0.01) return;
    const n: V3 = [e.out[0], 0, e.out[1]];
    const nu = Math.max(1, Math.ceil(e.len / cell));
    const q = e.b;
    if (lip) {
      opaque.useSurface(look.surf);
      opaque.quad([p[0], top - lipH, p[1]], [q[0], top - lipH, q[1]], [q[0], top, q[1]], [p[0], top, p[1]], n, look.col.map((c) => c * 0.9) as V3, room, -1, -1, nu, 1);
      const pi: Vec2 = [p[0] - e.out[0] * lip, p[1] - e.out[1] * lip], qi: Vec2 = [q[0] - e.out[0] * lip, q[1] - e.out[1] * lip];
      opaque.quad([p[0], top - lipH, p[1]], [pi[0], top - lipH, pi[1]], [qi[0], top - lipH, qi[1]], [q[0], top - lipH, q[1]], [0, -1, 0], look.col.map((c) => c * 0.6) as V3, room, -1, -1, nu, 1);
      opaque.useSurface(side.surf);
      opaque.quad([pi[0], ground - 0.01, pi[1]], [qi[0], ground - 0.01, qi[1]], [qi[0], top - lipH, qi[1]], [pi[0], top - lipH, pi[1]], n, side.col, room, -1, -1, nu, 1);
    } else {
      opaque.useSurface(side.surf);
      opaque.quad([p[0], ground - 0.01, p[1]], [q[0], ground - 0.01, q[1]], [q[0], top, q[1]], [p[0], top, p[1]], n, side.col, room, -1, -1, nu, 1);
    }
  });

  // steps: each tread laid along the edge like the area's top, its riser and ends like its sides
  for (const s of o.steps ?? []) {
    for (const b of stepBlocks(o.points, s, top - ground)) {
      const [c0, c1, c2, c3] = b.corners;
      const y = ground + b.top;
      opaque.useSurface(look.surf);
      opaque.uvFrame = frameAlong(c3, b.dir, [-b.out[0], -b.out[1]]);
      opaque.quad([c0[0], y, c0[1]], [c1[0], y, c1[1]], [c2[0], y, c2[1]], [c3[0], y, c3[1]], [0, 1, 0], look.col, room, -1, -1, Math.max(1, Math.ceil(Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) / cell)), 1);
      opaque.uvFrame = null;
      opaque.useSurface(side.surf);
      const lo = ground - 0.01;
      opaque.quad([c3[0], lo, c3[1]], [c2[0], lo, c2[1]], [c2[0], y, c2[1]], [c3[0], y, c3[1]], [b.out[0], 0, b.out[1]], side.col, room);
      opaque.quad([c1[0], lo, c1[1]], [c2[0], lo, c2[1]], [c2[0], y, c2[1]], [c1[0], y, c1[1]], [b.dir[0], 0, b.dir[1]], side.col, room);
      opaque.quad([c0[0], lo, c0[1]], [c3[0], lo, c3[1]], [c3[0], y, c3[1]], [c0[0], y, c0[1]], [-b.dir[0], 0, -b.dir[1]], side.col, room);
    }
  }

  // a railing round the open edges, standing on the area, with gaps where the steps go down
  const style = o.railing && o.railing in FENCE_STYLES ? o.railing : null;
  if (!style) return;
  for (const [ri, points] of railingRuns(o.points, open, o.steps ?? []).entries()) {
    const fence: Fence = { id: `${o.id}_rail${ri}`, points, style, height: Math.min(1.1, FENCE_STYLES[style].height), gates: [], gravel_board: false };
    const paint = fencePaint(fence);
    for (const piece of fencePieces(fence, low)) addParts(opaque, piece.parts, piece.item, top, false, room, -1, pal, low, glass, paint);
  }
}

/** The lamp model for a light placed as a device. */
export function lampTypeFor(mount: string | null | undefined): string {
  if (mount === "floor") return "lamp_floor";
  if (mount === "table") return "lamp_table";
  if (mount === "wall") return "lamp_wall";
  return "lamp_ceiling";
}

const LAMP_RADIUS: Record<string, number> = {
  lamp_ceiling: 4.6, lamp_pendant: 4.0, lamp_globe: 4.0, lamp_chandelier: 4.8, lamp_downlight: 3.0, lamp_spots: 3.4,
  lamp_floor: 3.4, lamp_arc: 3.4, lamp_table: 2.4, lamp_wall: 2.8, led_strip: 2.6, lamp_garden: 3.0, lamp_post: 3.6,
};

// -------------------------------------------------------------------- walls

function slabEdge(g: Geo, w: WallSegment, y0: number, look: Look): void {
  const out = w.roomA === OUTSIDE ? 1 : -1;
  const side = out * (w.thickness / 2 - 0.005);
  const n: V3 = [w.normal[0] * out, 0, w.normal[1] * out];
  const P = (s: number, y: number): V3 => [w.a[0] + w.dir[0] * s + w.normal[0] * side, y0 + y, w.a[1] + w.dir[1] * s + w.normal[1] * side];
  const s0 = -w.extendStart;
  const s1 = w.length + w.extendEnd;
  g.useSurface(look.surf);
  if (out > 0) g.quad(P(s0, -SLAB), P(s1, -SLAB), P(s1, 0), P(s0, 0), n, look.col, ROOM_NONE);
  else g.quad(P(s1, -SLAB), P(s0, -SLAB), P(s0, 0), P(s1, 0), n, look.col, ROOM_NONE);
}

function buildWall(
  g: Geo, glass: Geo, w: WallSegment, slot: number, y0: number, pal: Palette, grid: number,
  glows: GlowSlot[], windows: WindowInfo[], doors: DoorInfo[], bottom: number, top: number, lookA: Look, lookB: Look,
  openingItems: Map<string, number>, low: boolean,
): void {
  const t = w.thickness / 2;
  const s0 = -w.extendStart;
  const s1 = w.length + w.extendEnd;
  // solid pieces: [along0, along1, y0, y1, a lintel that drops out of sight when the wall is cut]
  const pieces: [number, number, number, number, boolean][] = [];
  let cursor = s0;
  for (const po of w.openings) {
    if (po.t0 > cursor + 0.005) pieces.push([cursor, po.t0, bottom, top, false]);
    if (po.bottom > 0.02) pieces.push([po.t0, po.t1, bottom, po.bottom, false]);
    // threshold under a door: just below the floors, which reach the middle of the wall
    else if (po.t1 > po.t0) pieces.push([po.t0, po.t1, bottom, -0.005, false]);
    if (po.top < top - 0.02) pieces.push([po.t0, po.t1, po.top, top, po.top >= HANG_ABOVE]);
    cursor = Math.max(cursor, po.t1);
  }
  if (s1 > cursor + 0.005) pieces.push([cursor, s1, bottom, top, false]);

  const P = (s: number, side: number, y: number): V3 => [
    w.a[0] + w.dir[0] * s + w.normal[0] * side,
    y0 + y,
    w.a[1] + w.dir[1] * s + w.normal[1] * side,
  ];
  const nA: V3 = [w.normal[0], 0, w.normal[1]];
  const nB: V3 = [-w.normal[0], 0, -w.normal[1]];
  const roomA = w.roomA === OUTSIDE ? ROOM_OUTSIDE : w.roomA;
  const roomB = w.roomB === OUTSIDE ? ROOM_OUTSIDE : w.roomB;
  const wsBody = slot >= 0 ? slot * 2 : -1;
  const wsCap = slot >= 0 ? slot * 2 + 1 : -1;
  const cap = lin(pal.wallCap);
  // reveals and lintels are plastered like the inside
  const inner = w.roomA === OUTSIDE ? lookB : lookA;

  for (const [a, b, ya, yb, hang] of pieces) {
    const len = b - a;
    const h = yb - ya;
    if (len < 0.004 || h < 0.004) continue;
    // squashed to the cut height, a lintel would lie on the door or the window frame below it
    const ws = hang && wsBody >= 0 ? wsBody + WALL_HANG : wsBody;
    const wsTop = hang && wsCap >= 0 ? wsCap + WALL_HANG : wsCap;
    const nu = Math.max(1, Math.round(len / grid));
    const nv = Math.max(1, Math.round(h / grid));
    // two faces, darker towards the floor (contact shadow)
    g.useSurface(lookA.surf);
    contactShadow(g, () => g.quad(P(a, t, ya), P(b, t, ya), P(b, t, yb), P(a, t, yb), nA, lookA.col, roomA, ws, -1, nu, nv), y0);
    g.useSurface(lookB.surf);
    contactShadow(g, () => g.quad(P(b, -t, ya), P(a, -t, ya), P(a, -t, yb), P(b, -t, yb), nB, lookB.col, roomB, ws, -1, nu, nv), y0);
    // top of the piece (a wall top, a window sill, or the top of a threshold)
    g.useSurface("cap");
    g.quad(P(a, t, yb), P(b, t, yb), P(b, -t, yb), P(a, -t, yb), [0, 1, 0], cap, ROOM_NONE, yb >= top - 0.01 ? wsTop : ws);
    g.useSurface(inner.surf);
    // underside of a lintel above an opening
    if (ya > 0.02) g.quad(P(a, t, ya), P(a, -t, ya), P(b, -t, ya), P(b, t, ya), [0, -1, 0], inner.col, ROOM_NONE, ws, -1, 1, 1, 0.85);
    // ends: at an opening or in open space, and also where the piece reaches into the wall it meets,
    // which hides that end until the cutaway lowers it. Those sit 2 mm back, behind the other
    // wall's face, which would otherwise lie in the same plane
    const dirN: V3 = [w.dir[0], 0, w.dir[1]];
    const dirB: V3 = [-w.dir[0], 0, -w.dir[1]];
    const ea = a > s0 + 0.001 || w.extendStart === 0 ? a : a + 0.002;
    const eb = b < s1 - 0.001 || w.extendEnd === 0 ? b : b - 0.002;
    g.quad(P(ea, -t, ya), P(ea, t, ya), P(ea, t, yb), P(ea, -t, yb), dirB, inner.col, ROOM_NONE, ws, -1, 1, 1, 0.9);
    g.quad(P(eb, t, ya), P(eb, -t, ya), P(eb, -t, yb), P(eb, t, yb), dirN, inner.col, ROOM_NONE, ws, -1, 1, 1, 0.9);
  }

  // frames, boards and architraves; doors and windows that move are described for the moving-parts mesh
  for (const po of w.openings) {
    const o = po.opening;
    if (o.kind === "passage") continue;
    const room = roomForSide(w, po.inward);
    const mid = (po.t0 + po.t1) / 2;
    const info: DoorInfo = {
      opening: o, wallSlot: slot, room, base: P(mid, 0, 0), along: w.dir, inward: po.inward,
      width: po.t1 - po.t0, bottom: po.bottom, top: po.top, depth: w.thickness, ceiling: w.height,
      bothInside: w.roomA !== OUTSIDE && w.roomB !== OUTSIDE, item: openingItems.get(o.id) ?? -1,
    };
    let glow = -1;
    if (o.kind === "window") {
      glow = glows.length;
      glows.push({ kind: "window", entity: o.entity ?? null, room });
      windows.push({ ...info, centre: P(mid, 0, (po.bottom + po.top) / 2), normal: po.inward, glow });
    } else {
      doors.push(info);
    }
    // its glass too: a tap on the pane is a tap on the window
    g.currentItem = glass.currentItem = info.item;
    buildOpeningFixed({ g, glass, pal, look: joineryLook(o, pal), room, ws: wsBody >= 0 ? wsBody + WALL_TRIM : wsBody, glow, low }, info);
    g.currentItem = glass.currentItem = -1;
  }
}

function roomForSide(w: WallSegment, inward: Vec2): number {
  const side = inward[0] * w.normal[0] + inward[1] * w.normal[1] > 0 ? w.roomA : w.roomB;
  return side === OUTSIDE ? ROOM_OUTSIDE : side;
}

/** Runs a quad builder and darkens its new vertices near the storey's floor. */
function contactShadow(g: Geo, build: () => void, floorY: number): void {
  const from = g.vertexCount;
  build();
  for (let v = from; v < g.vertexCount; v++) {
    const above = g.pos[v * 3 + 1] - floorY;
    if (above < 0.5) g.occlude(v, 0.8 + (0.2 * Math.max(0, above)) / 0.5);
  }
}

// -------------------------------------------------------------------- furniture

const UPHOLSTERY_ROLES = new Set<Role>(["fabric", "fabricDark", "cushion"]);
/** How a role's colour relates to the main colour picked for a piece (linear light). */
const SHADE_OF: Partial<Record<Role, number>> = { fabricDark: 0.5, cushion: 1.4, woodDark: 0.45 };

/** How far a face that would lie on an earlier part's face is moved out, per layer (m). */
const FACE_STEP = 0.0015;

/** Which faces of a part are flat: x-, x+, y-, y+, z-, z+. */
function flatFaces(p: Part): boolean[] {
  // a sheared box's top and bottom follow its slope
  if (p.shape === "box") return [true, true, !p.shear, !p.shear, true, true];
  if (p.shape === "prism") return [true, true, true, false, false, false];
  if (p.shape === "ball" || p.shape === "hull") return [false, false, false, false, false, false];
  if (p.shape === "hip") return [false, false, true, false, false, false];
  if (p.axis === "x") return [true, true, false, false, false, false];
  if (p.axis === "z") return [false, false, false, false, true, true];
  return [false, false, true, (p.taper ?? 1) > 0.001, false, false];
}

/** A face's plane and its extent in the other two axes: [plane, u0, u1, v0, v1]. */
function faceRect(p: Part, f: number): [number, number, number, number, number] {
  const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, y0 = p.y, y1 = p.y + p.h, z0 = p.z - p.d / 2, z1 = p.z + p.d / 2;
  if (f < 2) return [f === 0 ? x0 : x1, y0, y1, z0, z1];
  // a leaning cylinder's top sits off its bottom
  const [lx, lz] = f === 3 && p.lean ? p.lean : [0, 0];
  if (f < 4) return [f === 2 ? y0 : y1, x0 + lx, x1 + lx, z0 + lz, z1 + lz];
  return [f === 4 ? z0 : z1, x0, x1, y0, y1];
}

/**
 * Parts of one piece often share a face: a sofa's arms and base end in the same side, a bath's
 * water meets its rim. Two faces in one plane facing the same way fight for pixels and flicker, so
 * each face lying on an earlier part's face moves out a hair further than it: the later part wins.
 */
export function separateFaces(parts: Part[], raised = false): Part[] {
  const layer = new Uint8Array(parts.length * 6);
  const flat = parts.map(flatFaces);
  let any = false;
  for (let k = 1; k < parts.length; k++) {
    for (let f = 0; f < 6; f++) {
      if (!flat[k][f]) continue;
      // the floor hides a bottom that stands on it
      if (f === 2 && parts[k].y <= 0.02 && !raised) continue;
      const [pk, u0, u1, v0, v1] = faceRect(parts[k], f);
      for (let j = 0; j < k; j++) {
        if (!flat[j][f]) continue;
        const [pj, a0, a1, b0, b1] = faceRect(parts[j], f);
        if (Math.abs(pk - pj) > 0.001) continue;
        if (Math.min(u1, a1) - Math.max(u0, a0) <= 0.001 || Math.min(v1, b1) - Math.max(v0, b0) <= 0.001) continue;
        layer[k * 6 + f] = Math.max(layer[k * 6 + f], layer[j * 6 + f] + 1);
        any = true;
      }
    }
  }
  if (!any) return parts;
  return parts.map((p, k) => {
    const g = (f: number) => layer[k * 6 + f] * FACE_STEP;
    if (!layer.subarray(k * 6, k * 6 + 6).some((v) => v > 0)) return p;
    return {
      ...p,
      x: p.x + (g(1) - g(0)) / 2, w: p.w + g(0) + g(1),
      y: p.y - g(2), h: p.h + g(2) + g(3),
      z: p.z + (g(5) - g(4)) / 2, d: p.d + g(4) + g(5),
    };
  });
}

/** A ceiling fan's blades at rest, into a mesh of moving parts; returns the range of vertices they take. */
export function addFanBlades(g: Geo, fan: FanInfo, pal: Palette, low: boolean): [number, number] {
  const start = g.vertexCount;
  const f = fan.furniture;
  g.currentItem = fan.item;
  addParts(g, fanBlades(f.w, f.h), f, fan.bottom, true, fan.room, -1, pal, low);
  return [start, g.vertexCount];
}

/** A piece's parts, into the floor's mesh; its glass into the glass mesh when one is given. */
function addParts(opaque: Geo, parts: Part[], item: Furniture, bottom: number, raised: boolean, room: number, glow: number, pal: Palette, low: boolean, glass?: Geo, paint?: Set<Role>): void {
  const def = furnitureType(item.type);
  const r = (item.rotation * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const mx = item.mirror ? -1 : 1;
  const toWorld = (lx: number, ly: number, lz: number): V3 => [item.x + c * lx * mx - s * lz, bottom + ly, item.z + s * lx * mx + c * lz];
  const rotN = (nx: number, ny: number, nz: number): V3 => [c * nx * mx - s * nz, ny, s * nx * mx + c * nz];
  // a quarter turn for parts described front towards +x (scene/furniture-lib.ts Part.turn)
  const toWorldT = (lx: number, ly: number, lz: number): V3 => toWorld(-lz, ly, lx);
  const rotNT = (nx: number, ny: number, nz: number): V3 => rotN(-nz, ny, nx);
  // the picked colour, or the upholstery's own colour (leather is brown unless told otherwise)
  const finish = item.finish ?? def.finish ?? "fabric";
  const upholstery = UPHOLSTERY[finish] ?? UPHOLSTERY.fabric;
  const picked = parseHex(item.color) ?? (finish !== "fabric" ? upholstery.color : null);
  const trim = def.trim ? parseHex(item.trim) : null;
  const painted = paint ?? paintRoles(def, parts, item);
  parts = separateFaces(parts, raised);
  const shadeOf = (hex: number, role: Role): V3 => {
    const base = lin(inPalette(pal, hex));
    const k = SHADE_OF[role] ?? 1;
    return [Math.min(1, base[0] * k), Math.min(1, base[1] * k), Math.min(1, base[2] * k)];
  };
  const colourOf = (role: Role): V3 => {
    if (trim !== null && def.trim!.includes(role)) return shadeOf(trim, role);
    if (picked !== null && painted.has(role)) return shadeOf(picked, role);
    return lin(pal.roles[role]);
  };
  // tops textured along the piece (a rug's pattern, a roof's courses), moving with it
  const frameOf = (turned: boolean) => {
    const [fc, fs] = turned ? [-s, c] : [c, s];
    return { c: fc, s: fs, ou: item.x * fc + item.z * fs, ov: -item.x * fs + item.z * fc };
  };
  const frames = [frameOf(false), frameOf(true)];
  for (const p of parts) {
    const tw = p.turn ? toWorldT : toWorld, rn = p.turn ? rotNT : rotN;
    opaque.uvFrame = frames[p.turn ? 1 : 0];
    // the glass mesh keeps its one surface
    const g = p.role === "glass" && glass ? glass : opaque;
    if (g === opaque) g.useSurface(UPHOLSTERY_ROLES.has(p.role) ? `uph:${finish}` : `role:${p.role}`);
    const col = colourOf(p.role);
    const gslot = p.glow && glow >= 0 ? glow + (p.slot ?? 0) : -1;
    const elevated = p.y > 0.02 || raised;
    if (p.shape === "box") {
      const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, z0 = p.z - p.d / 2, z1 = p.z + p.d / 2;
      // a sheared box rises along z (a handrail on a stair)
      const sh = p.shear ?? 0;
      const ya0 = p.y - (sh * p.d) / 2, ya1 = p.y + (sh * p.d) / 2;
      const yb0 = ya0 + p.h, yb1 = ya1 + p.h;
      const ao = p.y < 0.05 ? 0.86 : 1;
      const l = Math.hypot(1, sh);
      const up = sh ? rn(0, 1 / l, -sh / l) : ([0, 1, 0] as V3);
      const q = (a: V3, b: V3, cc: V3, d: V3, n: V3, f: number) =>
        g.quad(tw(...a), tw(...b), tw(...cc), tw(...d), n, col, room, -1, gslot, 1, 1, f);
      q([x0, yb0, z0], [x1, yb0, z0], [x1, yb1, z1], [x0, yb1, z1], up, 1);
      q([x0, ya1, z1], [x1, ya1, z1], [x1, yb1, z1], [x0, yb1, z1], rn(0, 0, 1), ao);
      q([x1, ya0, z0], [x0, ya0, z0], [x0, yb0, z0], [x1, yb0, z0], rn(0, 0, -1), ao);
      q([x1, ya1, z1], [x1, ya0, z0], [x1, yb0, z0], [x1, yb1, z1], rn(1, 0, 0), ao);
      q([x0, ya0, z0], [x0, ya1, z1], [x0, yb1, z1], [x0, yb0, z0], rn(-1, 0, 0), ao);
      if (elevated) q([x0, ya1, z1], [x1, ya1, z1], [x1, ya0, z0], [x0, ya0, z0], [-up[0], -up[1], -up[2]], 1);
    } else if (p.shape === "prism") {
      prismPart(g, p, tw, rn, col, room, gslot, elevated);
    } else if (p.shape === "hip") {
      hipPart(g, p, tw, rn, col, room, gslot, elevated);
    } else if (p.shape === "hull") {
      hullPart(g, p, tw, rn, col, room, gslot, elevated);
    } else {
      lathe(g, p, tw, rn, col, room, gslot, elevated, low);
    }
  }
  opaque.uvFrame = null;
}

type ToWorld = (x: number, y: number, z: number) => V3;
type RotN = (x: number, y: number, z: number) => V3;

/** A roof-like prism: a w x d base, a ridge along x at height h. */
function prismPart(g: Geo, p: Part, toWorld: ToWorld, rotN: RotN, col: V3, room: number, gslot: number, elevated: boolean): void {
  const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, z0 = p.z - p.d / 2, z1 = p.z + p.d / 2;
  const ya = p.y, yb = p.y + p.h;
  const l = Math.hypot(p.d / 2, p.h) || 1;
  const nf = rotN(0, p.d / 2 / l, p.h / l);
  const nb = rotN(0, p.d / 2 / l, -p.h / l);
  g.quad(toWorld(x0, ya, z1), toWorld(x1, ya, z1), toWorld(x1, yb, p.z), toWorld(x0, yb, p.z), nf, col, room, -1, gslot);
  g.quad(toWorld(x1, ya, z0), toWorld(x0, ya, z0), toWorld(x0, yb, p.z), toWorld(x1, yb, p.z), nb, col, room, -1, gslot);
  for (const [x, n] of [[x0, rotN(-1, 0, 0)], [x1, rotN(1, 0, 0)]] as [number, V3][]) {
    const a = g.vertex(toWorld(x, ya, z0), n, col, room, -1, gslot);
    const b = g.vertex(toWorld(x, ya, z1), n, col, room, -1, gslot);
    const t = g.vertex(toWorld(x, yb, p.z), n, col, room, -1, gslot);
    g.tri(a, b, t, n);
  }
  if (elevated) g.quad(toWorld(x0, ya, z1), toWorld(x1, ya, z1), toWorld(x1, ya, z0), toWorld(x0, ya, z0), [0, -1, 0], col, room, -1, gslot);
}

/** A hipped roof: a w x d base, a ridge along x of length `ridge` at height h, four flat slopes. */
function hipPart(g: Geo, p: Part, toWorld: ToWorld, rotN: RotN, col: V3, room: number, gslot: number, elevated: boolean): void {
  const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, z0 = p.z - p.d / 2, z1 = p.z + p.d / 2;
  const r = Math.max(0, Math.min(p.w, p.ridge ?? p.w - p.d)) / 2;
  const ya = p.y, yb = p.y + p.h;
  const ra: V3 = [p.x - r, yb, p.z], rb: V3 = [p.x + r, yb, p.z];
  const face = (pts: V3[]) => {
    // the slope's normal from two of its edges
    const [a, b, c] = pts;
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let n: V3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    n = [n[0] / l, n[1] / l, n[2] / l];
    if (n[1] < 0) n = [-n[0], -n[1], -n[2]];
    const nw = rotN(n[0], n[1], n[2]);
    const ids = pts.map((q) => g.vertex(toWorld(q[0], q[1], q[2]), nw, col, room, -1, gslot));
    for (let k = 1; k < ids.length - 1; k++) g.tri(ids[0], ids[k], ids[k + 1], nw);
  };
  face([[x0, ya, z1], [x1, ya, z1], rb, ra]);
  face([[x1, ya, z0], [x0, ya, z0], ra, rb]);
  face([[x0, ya, z0], [x0, ya, z1], ra]);
  face([[x1, ya, z1], [x1, ya, z0], rb]);
  if (elevated) g.quad(toWorld(x0, ya, z1), toWorld(x1, ya, z1), toWorld(x1, ya, z0), toWorld(x0, ya, z0), rotN(0, -1, 0), col, room, -1, gslot);
}

/** A side outline extruded across x, its sides leaning in towards the top (a car's body and windows). */
function hullPart(g: Geo, p: Part, toWorld: ToWorld, rotN: RotN, col: V3, room: number, gslot: number, elevated: boolean): void {
  const pts = (p.outline ?? []).map(([u, v]) => [p.z - p.d / 2 + u * p.d, p.y + v * p.h] as [number, number]);
  if (pts.length < 3) return;
  const lean = (p.inset ?? 0) / (p.h || 1);
  const half = (y: number) => p.w / 2 - lean * (y - p.y);
  // the sides: one flat, leaning face each
  const tris = ShapeUtils.triangulateShape(pts.map(([z, y]) => new Vector2(z, y)), []);
  const nl = Math.hypot(1, lean);
  for (const sx of [-1, 1]) {
    const n = rotN(sx / nl, lean / nl, 0);
    const ids = pts.map(([z, y]) => g.vertex(toWorld(p.x + sx * half(y), y, z), n, col, room, -1, gslot));
    for (const [a, b, c] of tris) g.tri(ids[a], ids[b], ids[c], n);
  }
  // around the outline (which way is out follows the outline's turn)
  let area = 0;
  pts.forEach(([z, y], i) => {
    const [z2, y2] = pts[(i + 1) % pts.length];
    area += z * y2 - z2 * y;
  });
  const turn = area > 0 ? 1 : -1;
  pts.forEach(([za, ya], i) => {
    const [zb, yb] = pts[(i + 1) % pts.length];
    const l = Math.hypot(zb - za, yb - ya);
    if (l < 1e-6) return;
    const ny = (-(zb - za) / l) * turn, nz = ((yb - ya) / l) * turn;
    // the bottom of something standing on the ground is never seen
    if (!elevated && ny < -0.99 && ya < p.y + 0.02) return;
    g.quad(toWorld(p.x - half(ya), ya, za), toWorld(p.x + half(ya), ya, za), toWorld(p.x + half(yb), yb, zb), toWorld(p.x - half(yb), yb, zb), rotN(0, ny, nz), col, room, -1, gslot);
  });
}

/**
 * Round solids as a profile turned around an axis: cylinders and cones (with caps) and balls,
 * standing up or lying along x or z. Normals are smooth around and along the profile.
 */
function lathe(g: Geo, p: Part, toWorld: ToWorld, rotN: RotN, col: V3, room: number, gslot: number, elevated: boolean, low: boolean): void {
  const seg = Math.max(p.shape === "ball" ? 6 : 5, Math.round((p.seg ?? 12) * (low ? 0.67 : 1)));
  // the solid's own frame: u and v across the axis, t along it
  let ru: number, rv: number, len: number;
  let at: (u: number, v: number, t: number) => V3;
  let dir: (nu: number, nv: number, nt: number) => V3;
  if (p.axis === "x") {
    ru = p.h / 2; rv = p.d / 2; len = p.w;
    at = (u, v, t) => toWorld(p.x - p.w / 2 + t, p.y + p.h / 2 + u, p.z + v);
    dir = (nu, nv, nt) => rotN(nt, nu, nv);
  } else if (p.axis === "z") {
    ru = p.w / 2; rv = p.h / 2; len = p.d;
    at = (u, v, t) => toWorld(p.x + u, p.y + p.h / 2 + v, p.z - p.d / 2 + t);
    dir = (nu, nv, nt) => rotN(nu, nv, nt);
  } else {
    ru = p.w / 2; rv = p.d / 2; len = p.h;
    // a leaning cylinder (a splayed leg) is sheared: its ends stay level, its sides tilt
    const kx = (p.lean?.[0] ?? 0) / len, kz = (p.lean?.[1] ?? 0) / len;
    at = (u, v, t) => toWorld(p.x + u + kx * t, p.y + t, p.z + v + kz * t);
    dir = (nu, nv, nt) => rotN(nu, nt - kx * nu - kz * nv, nv);
  }
  // profile: [radius factor, position along the axis 0..1]
  let profile: [number, number][];
  if (p.shape === "ball") {
    const rings = Math.max(4, Math.round(seg / 2));
    profile = Array.from({ length: rings + 1 }, (_, k) => [Math.sin((Math.PI * k) / rings), (1 - Math.cos((Math.PI * k) / rings)) / 2]);
  } else {
    profile = [[1, 0], [p.taper ?? 1, 1]];
  }
  const rAvg = (ru + rv) / 2;
  const angles = Array.from({ length: seg }, (_, j) => (j / seg) * Math.PI * 2);
  const rows: number[][] = [];
  profile.forEach(([rf, tf], i) => {
    // the profile's slope gives the normal's lean along the axis
    const prev = profile[Math.max(0, i - 1)];
    const next = profile[Math.min(profile.length - 1, i + 1)];
    const dr = (next[0] - prev[0]) * rAvg;
    const dt = (next[1] - prev[1]) * len;
    const l = Math.hypot(dr, dt) || 1;
    const nr = dt / l;
    const na = -dr / l;
    rows.push(angles.map((a) => {
      const ca = Math.cos(a), sa = Math.sin(a);
      // across an ellipse the normal leans towards the flatter side
      let nu = ca / (ru || 1), nv = sa / (rv || 1);
      const nl = Math.hypot(nu, nv) || 1;
      nu = (nu / nl) * nr;
      nv = (nv / nl) * nr;
      const n3 = dir(nu, nv, na);
      const n3l = Math.hypot(n3[0], n3[1], n3[2]) || 1;
      return g.vertex(at(ca * ru * rf, sa * rv * rf, tf * len), [n3[0] / n3l, n3[1] / n3l, n3[2] / n3l], col, room, -1, gslot);
    }));
  });
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = rows[i][j], b = rows[i][(j + 1) % seg], c2 = rows[i + 1][(j + 1) % seg], d = rows[i + 1][j];
      // tri() turns each triangle to face the vertices' (outward) normal
      const nn = avgNormal(g, a, c2);
      g.tri(a, b, c2, nn);
      g.tri(a, c2, d, nn);
    }
  }
  if (p.shape === "ball") return;
  // flat caps at the ends (a cone has none at its tip)
  const caps: [number, number, number][] = [[0, profile[0][0], -1], [1, profile[profile.length - 1][0], 1]];
  for (const [tf, rf, sign] of caps) {
    if (rf <= 0.001) continue;
    // the bottom of something standing on the floor is never seen
    if (sign < 0 && !p.axis && !elevated) continue;
    const n0 = dir(0, 0, sign);
    const centre = g.vertex(at(0, 0, tf * len), n0, col, room, -1, gslot);
    const ids = angles.map((a) => g.vertex(at(Math.cos(a) * ru * rf, Math.sin(a) * rv * rf, tf * len), n0, col, room, -1, gslot));
    for (let j = 0; j < seg; j++) g.tri(centre, ids[j], ids[(j + 1) % seg], n0);
  }
}

function avgNormal(g: Geo, a: number, b: number): V3 {
  const n: V3 = [g.nrm[a * 3] + g.nrm[b * 3], g.nrm[a * 3 + 1] + g.nrm[b * 3 + 1], g.nrm[a * 3 + 2] + g.nrm[b * 3 + 2]];
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
}

// -------------------------------------------------------------------- polygon clipping

/** Sutherland–Hodgman: the part of a polygon inside an axis-aligned rectangle. */
export function clipToRect(pts: Vec2[], x0: number, z0: number, x1: number, z1: number): Vec2[] {
  return clipPlanes(pts, [(p) => p[0] - x0, (p) => x1 - p[0], (p) => p[1] - z0, (p) => z1 - p[1]]);
}

/** The part of a polygon where every function is >= 0 (each a half-plane). */
function clipPlanes(pts: Vec2[], planes: ((p: Vec2) => number)[]): Vec2[] {
  let out = pts;
  for (const f of planes) {
    const input = out;
    out = [];
    if (!input.length) break;
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      const fc = f(cur);
      const fp = f(prev);
      if (fc >= 0) {
        if (fp < 0) out.push(intersect(prev, cur, fp, fc));
        out.push(cur);
      } else if (fp >= 0) {
        out.push(intersect(prev, cur, fp, fc));
      }
    }
  }
  // drop repeated points
  const clean: Vec2[] = [];
  for (const p of out) {
    const q = clean[clean.length - 1];
    if (!q || Math.abs(q[0] - p[0]) > 1e-6 || Math.abs(q[1] - p[1]) > 1e-6) clean.push(p);
  }
  if (clean.length > 1) {
    const a = clean[0], b = clean[clean.length - 1];
    if (Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6) clean.pop();
  }
  return clean;
}

/** A polygon minus a convex hole: one piece per edge of the hole, each outside that edge and inside the ones before it. */
function subtractConvex(poly: Vec2[], hole: Vec2[]): Vec2[][] {
  const cx = hole.reduce((s, p) => s + p[0], 0) / hole.length;
  const cz = hole.reduce((s, p) => s + p[1], 0) / hole.length;
  // >= 0 outside each edge
  const outside = hole.map((a, i) => {
    const b = hole[(i + 1) % hole.length];
    let nx = b[1] - a[1], nz = a[0] - b[0];
    if ((cx - a[0]) * nx + (cz - a[1]) * nz > 0) [nx, nz] = [-nx, -nz];
    return (p: Vec2) => (p[0] - a[0]) * nx + (p[1] - a[1]) * nz;
  });
  const pieces: Vec2[][] = [];
  outside.forEach((f, k) => {
    const piece = clipPlanes(poly, [...outside.slice(0, k).map((g) => (p: Vec2) => -g(p)), f]);
    if (piece.length >= 3 && Math.abs(area(piece)) > 1e-6) pieces.push(piece);
  });
  return pieces;
}

function area(pts: Vec2[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** An opening in a storey's floor over stairs coming up from below, in the room they arrive in (-1: any). */
export interface Stairwell {
  hole: Vec2[];
  room: number;
}

/**
 * Stairwells: where stairs from the storey below come up, the floor of the room they arrive in
 * (the landing) opens over them; a room over their lower steps keeps its floor. A little wider
 * than the stairs and longer at their foot, so their balustrade rises through it; flush with their
 * top step, where the landing begins.
 */
export function stairwells(plan: Plan, floorIndex: number): Stairwell[] {
  const below = plan.floors[floorIndex - 1];
  const floor = plan.floors[floorIndex];
  if (!below || !floor) return [];
  const out: Stairwell[] = [];
  for (const x of below.furniture) {
    if (furnitureType(x.type).family !== "stairs") continue;
    const top = below.elevation + baseHeight(x, below.height) + x.h;
    if (Math.abs(top - floor.elevation) > 0.35) continue;
    const hw = x.w / 2 + 0.04;
    const r = (x.rotation * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
    const at = ([lx, lz]: Vec2): Vec2 => [x.x + c * lx - s * lz, x.z + s * lx + c * lz];
    const roomAt = (p: Vec2) => floor.rooms.findIndex((rm) => pointInPolygon(p, rm.points));
    // where you step off the top, else over the top step
    const arrive = roomAt(at([0, -x.d / 2 - 0.25]));
    const room = arrive >= 0 ? arrive : roomAt(at([0, -x.d / 2 + 0.1]));
    out.push({ hole: ([[-hw, -x.d / 2], [hw, -x.d / 2], [hw, x.d / 2 + 0.04], [-hw, x.d / 2 + 0.04]] as Vec2[]).map(at), room });
  }
  return out;
}

function intersect(a: Vec2, b: Vec2, fa: number, fb: number): Vec2 {
  const t = fa / (fa - fb);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** All built-in furniture types (for pickers). */
export const FURNITURE_TYPES = Object.keys(FURNITURE);
