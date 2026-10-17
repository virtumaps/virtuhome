// Turns one floor of the plan into meshes: an opaque mesh (room floors, walls, furniture) and a
// glass mesh, plus the moving parts' descriptions (doors, windows, lamps, screens) that the
// lighting and live-state code drive. Every surface is tagged with its finish ("floor:oak",
// "ext:brick", "role:fabric"...) so the realistic look can texture it.
import { Color, ShapeUtils, Vector2 } from "three";
import type { Floor, Furniture, Opening, Plan, Vec2 } from "../model/plan";
import { bounds, labelPoint, pointInPolygon, segmentDistance } from "../model/geom";
import { layoutWalls, OUTSIDE, type WallLayout, type WallSegment } from "../model/walls";
import { EXTERIOR_FINISHES, FLOOR_FINISHES, parseHex, UPHOLSTERY, WALL_FINISHES, type FinishDef } from "./finishes";
import { CEILING_LAMPS, FURNITURE, furnitureType, paintRoles, type Part, type Role } from "./furniture-lib";
import { Geo, ROOM_NONE, ROOM_OUTSIDE, type V3 } from "./geo";
import { inPalette, type Palette } from "./palette";

export const SLAB = 0.18;
const GRID = 0.32; // spacing of the lighting grid on floors and walls (m)
export const MAX_WALL_SLOTS = 128;

export interface GlowSlot {
  kind: "lamp" | "screen" | "window";
  entity: string | null;
  room: number;
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

export interface DoorInfo {
  opening: Opening;
  wallSlot: number;
  room: number;
  /** Hinge on the floor (world) and the leaf's direction along the wall when closed. */
  hinge: V3;
  along: Vec2;
  /** Direction the leaf swings to. */
  swing: Vec2;
  width: number;
  height: number;
}

export interface WindowInfo {
  opening: Opening;
  wallSlot: number;
  room: number;
  centre: V3;
  along: Vec2;
  normal: Vec2;
  width: number;
  bottom: number;
  top: number;
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

/** A movable thing of the plan: a piece of furniture, or a device (a light gets a lamp model). */
export interface ItemRef {
  /** "corner": an editor handle on a room's corner, id "<space id>:<corner index>". */
  kind: "furniture" | "device" | "corner";
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
  screens: { furniture: Furniture; glow: number; entity: string | null }[];
  bounds: { minX: number; minZ: number; maxX: number; maxZ: number };
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
  const items: ItemRef[] = [];
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
    for (let k = 0; k < outdoor.length; k++) if (pointInPolygon(p, outdoor[k].points)) return floor.rooms.length + k;
    return ROOM_OUTSIDE;
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
  outdoor.forEach((o, k) => {
    opaque.useSurface(`out:${o.kind}`);
    const colour = lin(pal.outdoor[o.kind] ?? pal.outdoor.lawn);
    const up: V3 = [0, 1, 0];
    const b0 = bounds(o.points);
    const g = grid * 2; // a coarser lighting grid outside
    const y = y0 - SLAB + 0.004 + (o.kind === "deck" || o.kind === "patio" ? 0.012 : 0);
    for (let gx = Math.floor(b0.minX / g) * g; gx < b0.maxX; gx += g) {
      for (let gz = Math.floor(b0.minZ / g) * g; gz < b0.maxZ; gz += g) {
        const cell = clipToRect(o.points, gx, gz, gx + g, gz + g);
        if (cell.length < 3) continue;
        const tris = ShapeUtils.triangulateShape(cell.map(([x, z]) => new Vector2(x, z)), []);
        const ids = cell.map(([x, z]) => opaque.vertex([x, y, z], up, colour, floor.rooms.length + k));
        for (const [a, c, d] of tris) opaque.tri(ids[a], ids[c], ids[d], up);
      }
    }
  });

  // ---------------------------------------------------------------- room floors
  floor.rooms.forEach((room, ri) => {
    const name = room.floor && room.floor in FLOOR_FINISHES ? room.floor : "wood";
    const def: FinishDef = FLOOR_FINISHES[name];
    opaque.useSurface(`floor:${name}`);
    const colour = lin(inPalette(pal, def.color));
    const b = bounds(room.points);
    const edges = room.points.map((p, i) => [p, room.points[(i + 1) % room.points.length]] as [Vec2, Vec2]);
    const edgeDist = (x: number, z: number) => Math.min(...edges.map(([a, c]) => segmentDistance([x, z], a, c).d));
    const up: V3 = [0, 1, 0];
    for (let gx = Math.floor(b.minX / grid) * grid; gx < b.maxX; gx += grid) {
      for (let gz = Math.floor(b.minZ / grid) * grid; gz < b.maxZ; gz += grid) {
        const cell = clipToRect(room.points, gx, gz, gx + grid, gz + grid);
        if (cell.length < 3) continue;
        const contour = cell.map(([x, z]) => new Vector2(x, z));
        const tris = ShapeUtils.triangulateShape(contour, []);
        // darker where the floor meets the walls: cheap contact shadow
        const ids = cell.map(([x, z]) => opaque.vertex([x, y0, z], up, colour, ri, -1, -1, 0.8 + 0.2 * Math.min(1, edgeDist(x, z) / 0.55)));
        for (const [a, c, d] of tris) opaque.tri(ids[a], ids[c], ids[d], up);
      }
    }
    // underside of the slab, seen when floors are pulled apart
    opaque.useSurface("slab");
    const ring = room.points.map(([x, z]) => new Vector2(x, z));
    const under = ShapeUtils.triangulateShape(ring, []);
    const down: V3 = [0, -1, 0];
    const ids = room.points.map(([x, z]) => opaque.vertex([x, y0 - SLAB, z], down, lin(pal.slab), ROOM_NONE));
    for (const [a, c, d] of under) opaque.tri(ids[a], ids[c], ids[d], down);
  });

  // ---------------------------------------------------------------- walls
  const lowest = floorIndex === 0;
  const hasAbove = floorIndex < plan.floors.length - 1;
  layout.walls.forEach((w, wi) => {
    const slot = wi < MAX_WALL_SLOTS ? wi : -1;
    buildWall(opaque, glass, w, slot, y0, pal, grid, glows, windows, doors, lowest ? -SLAB : 0, hasAbove ? w.height - 0.003 : w.height, sideLook(w.roomA), sideLook(w.roomB));
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
    opaque.currentItem = items.length;
    items.push({ kind: fromDevice ? "device" : "furniture", id: fromDevice ? item.id.slice(4) : item.id });
    const def = furnitureType(item.type);
    const room = roomAt([item.x, item.z]);
    const isLamp = def.category === "lights";
    const ceiling = CEILING_LAMPS.has(item.type);
    const onGround = room >= floor.rooms.length;
    const bottom = y0 + (item.y ?? (ceiling ? floor.height - 0.02 : def.y ?? 0)) - (onGround ? SLAB : 0);
    const parts = def.build(item.w, item.d, item.h);
    let glow = -1;
    if (isLamp || parts.some((p) => p.glow === "screen")) {
      glow = glows.length;
      glows.push({ kind: isLamp ? "lamp" : "screen", entity: item.entity ?? null, room });
    }
    addParts(opaque, parts, item, bottom, room, glow, pal, opt.low);
    if (isLamp) {
      const top = parts.reduce((m, p) => Math.max(m, p.y + p.h), -10);
      const low = parts.reduce((m, p) => Math.min(m, p.y), 10);
      const ly = ceiling ? bottom + low : bottom + top - 0.1;
      lamps.push({
        id: item.id, entity: item.entity ?? null, room, pos: [item.x, ly, item.z], type: item.type, glow,
        radius: LAMP_RADIUS[item.type] ?? 3.2,
      });
    } else if (glow >= 0) {
      screens.push({ furniture: item, glow, entity: item.entity ?? null });
    }
  }

  opaque.currentItem = -1;
  const all = floor.rooms.flatMap((r) => r.points);
  return {
    floor, items, index: floorIndex, opaque, glass, layout, rooms, glows, lamps, doors, windows, portals, screens,
    bounds: all.length ? bounds(all) : { minX: 0, minZ: 0, maxX: 1, maxZ: 1 },
  };
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
): void {
  const t = w.thickness / 2;
  const s0 = -w.extendStart;
  const s1 = w.length + w.extendEnd;
  // solid pieces: [along0, along1, y0, y1]
  const pieces: [number, number, number, number][] = [];
  let cursor = s0;
  for (const po of w.openings) {
    if (po.t0 > cursor + 0.005) pieces.push([cursor, po.t0, bottom, top]);
    if (po.bottom > 0.02) pieces.push([po.t0, po.t1, bottom, po.bottom]);
    else if (po.t1 > po.t0) pieces.push([po.t0, po.t1, bottom, 0]); // threshold under a door
    if (po.top < top - 0.02) pieces.push([po.t0, po.t1, po.top, top]);
    cursor = Math.max(cursor, po.t1);
  }
  if (s1 > cursor + 0.005) pieces.push([cursor, s1, bottom, top]);

  const P = (s: number, side: number, y: number): V3 => [
    w.a[0] + w.dir[0] * s + w.normal[0] * side,
    y0 + y,
    w.a[1] + w.dir[1] * s + w.normal[1] * side,
  ];
  const nA: V3 = [w.normal[0], 0, w.normal[1]];
  const nB: V3 = [-w.normal[0], 0, -w.normal[1]];
  const roomA = w.roomA === OUTSIDE ? ROOM_OUTSIDE : w.roomA;
  const roomB = w.roomB === OUTSIDE ? ROOM_OUTSIDE : w.roomB;
  const ws = slot >= 0 ? slot * 2 : -1;
  const wsTop = slot >= 0 ? slot * 2 + 1 : -1;
  const cap = lin(pal.wallCap);
  // reveals and lintels are plastered like the inside
  const inner = w.roomA === OUTSIDE ? lookB : lookA;

  for (const [a, b, ya, yb] of pieces) {
    const len = b - a;
    const h = yb - ya;
    if (len < 0.004 || h < 0.004) continue;
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
    // reveals where the piece ends at an opening or in open space
    const dirN: V3 = [w.dir[0], 0, w.dir[1]];
    const dirB: V3 = [-w.dir[0], 0, -w.dir[1]];
    if (a > s0 + 0.001 || w.extendStart === 0) g.quad(P(a, -t, ya), P(a, t, ya), P(a, t, yb), P(a, -t, yb), dirB, inner.col, ROOM_NONE, ws, -1, 1, 1, 0.9);
    if (b < s1 - 0.001 || w.extendEnd === 0) g.quad(P(b, t, ya), P(b, -t, ya), P(b, -t, yb), P(b, t, yb), dirN, inner.col, ROOM_NONE, ws, -1, 1, 1, 0.9);
  }

  // glass and frames in windows; doors are described for the moving-parts mesh
  for (const po of w.openings) {
    const o = po.opening;
    const room = roomForSide(w, po.inward);
    const mid = (po.t0 + po.t1) / 2;
    if (o.kind === "window") {
      const glow = glows.length;
      glows.push({ kind: "window", entity: o.entity ?? null, room });
      glass.quad(P(po.t0, 0, po.bottom), P(po.t1, 0, po.bottom), P(po.t1, 0, po.top), P(po.t0, 0, po.top), nA, lin(pal.glass), room, ws, glow);
      // a slim frame and a middle bar
      g.useSurface("frame");
      const fr = lin(pal.roles.white);
      const fw = 0.045;
      frameBox(g, P, po.t0, po.t0 + fw, po.bottom, po.top, fr, ws);
      frameBox(g, P, po.t1 - fw, po.t1, po.bottom, po.top, fr, ws);
      frameBox(g, P, po.t0, po.t1, po.bottom, po.bottom + fw, fr, ws);
      frameBox(g, P, po.t0, po.t1, po.top - fw, po.top, fr, ws);
      if (po.t1 - po.t0 > 1.0) frameBox(g, P, mid - fw / 2, mid + fw / 2, po.bottom, po.top, fr, ws);
      windows.push({
        opening: o, wallSlot: slot, room, centre: P(mid, 0, (po.bottom + po.top) / 2), along: w.dir,
        normal: po.inward, width: po.t1 - po.t0, bottom: po.bottom, top: po.top, glow,
      });
    } else if (o.kind === "door" || o.kind === "garage") {
      const hingeAtStart = (o.hinge ?? "left") === "left";
      const hs = hingeAtStart ? po.t0 : po.t1;
      const swingDir: Vec2 = o.swing === "out" ? [-po.inward[0], -po.inward[1]] : po.inward;
      // the leaf sits on the face of the wall it swings away from
      const face = (swingDir[0] * w.normal[0] + swingDir[1] * w.normal[1] > 0 ? 1 : -1) * t;
      doors.push({
        opening: o, wallSlot: slot, room,
        hinge: P(hs, face, 0),
        along: hingeAtStart ? w.dir : [-w.dir[0], -w.dir[1]],
        swing: swingDir,
        width: po.t1 - po.t0,
        height: po.top,
      });
    }
  }
}

function roomForSide(w: WallSegment, inward: Vec2): number {
  const side = inward[0] * w.normal[0] + inward[1] * w.normal[1] > 0 ? w.roomA : w.roomB;
  return side === OUTSIDE ? ROOM_OUTSIDE : side;
}

function frameBox(g: Geo, P: (s: number, side: number, y: number) => V3, a: number, b: number, ya: number, yb: number, c: V3, ws: number): void {
  const d = 0.035;
  const quads: [V3, V3, V3, V3][] = [
    [P(a, d, ya), P(b, d, ya), P(b, d, yb), P(a, d, yb)],
    [P(b, -d, ya), P(a, -d, ya), P(a, -d, yb), P(b, -d, yb)],
    [P(a, d, yb), P(b, d, yb), P(b, -d, yb), P(a, -d, yb)],
  ];
  for (const [p0, p1, p2, p3] of quads) g.quad(p0, p1, p2, p3, faceNormal(p0, p1, p2), c, ROOM_NONE, ws);
}

function faceNormal(a: V3, b: V3, c: V3): V3 {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const n: V3 = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
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

function addParts(g: Geo, parts: Part[], item: Furniture, bottom: number, room: number, glow: number, pal: Palette, low: boolean): void {
  const def = furnitureType(item.type);
  const r = (item.rotation * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const mx = item.mirror ? -1 : 1;
  const toWorld = (lx: number, ly: number, lz: number): V3 => [item.x + c * lx * mx - s * lz, bottom + ly, item.z + s * lx * mx + c * lz];
  const rotN = (nx: number, ny: number, nz: number): V3 => [c * nx * mx - s * nz, ny, s * nx * mx + c * nz];
  // the picked colour, or the upholstery's own colour (leather is brown unless told otherwise)
  const finish = item.finish ?? def.finish ?? "fabric";
  const upholstery = UPHOLSTERY[finish] ?? UPHOLSTERY.fabric;
  const picked = parseHex(item.color) ?? (finish !== "fabric" ? upholstery.color : null);
  const painted = paintRoles(def, parts);
  const colourOf = (role: Role): V3 => {
    if (picked !== null && painted.has(role)) {
      const base = lin(inPalette(pal, picked));
      const k = SHADE_OF[role] ?? 1;
      return [Math.min(1, base[0] * k), Math.min(1, base[1] * k), Math.min(1, base[2] * k)];
    }
    return lin(pal.roles[role]);
  };
  for (const p of parts) {
    g.useSurface(UPHOLSTERY_ROLES.has(p.role) ? `uph:${finish}` : `role:${p.role}`);
    const col = colourOf(p.role);
    const gslot = p.glow ? glow : -1;
    const elevated = p.y > 0.02 || bottom > 0.05;
    if (p.shape === "box") {
      const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, z0 = p.z - p.d / 2, z1 = p.z + p.d / 2;
      const ya = p.y, yb = p.y + p.h;
      const ao = ya < 0.05 ? 0.86 : 1;
      const q = (a: V3, b: V3, cc: V3, d: V3, n: V3, f: number) =>
        g.quad(toWorld(...a), toWorld(...b), toWorld(...cc), toWorld(...d), n, col, room, -1, gslot, 1, 1, f);
      q([x0, yb, z0], [x1, yb, z0], [x1, yb, z1], [x0, yb, z1], [0, 1, 0], 1);
      q([x0, ya, z1], [x1, ya, z1], [x1, yb, z1], [x0, yb, z1], rotN(0, 0, 1), ao);
      q([x1, ya, z0], [x0, ya, z0], [x0, yb, z0], [x1, yb, z0], rotN(0, 0, -1), ao);
      q([x1, ya, z1], [x1, ya, z0], [x1, yb, z0], [x1, yb, z1], rotN(1, 0, 0), ao);
      q([x0, ya, z0], [x0, ya, z1], [x0, yb, z1], [x0, yb, z0], rotN(-1, 0, 0), ao);
      if (elevated) q([x0, ya, z1], [x1, ya, z1], [x1, ya, z0], [x0, ya, z0], [0, -1, 0], 1);
    } else if (p.shape === "prism") {
      prismPart(g, p, toWorld, rotN, col, room, gslot, elevated);
    } else {
      lathe(g, p, toWorld, rotN, col, room, gslot, elevated, low);
    }
  }
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
    at = (u, v, t) => toWorld(p.x + u, p.y + t, p.z + v);
    dir = (nu, nv, nt) => rotN(nu, nt, nv);
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
  let out = pts;
  const planes: [(p: Vec2) => number][] = [
    [(p) => p[0] - x0],
    [(p) => x1 - p[0]],
    [(p) => p[1] - z0],
    [(p) => z1 - p[1]],
  ];
  for (const [f] of planes) {
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

function intersect(a: Vec2, b: Vec2, fa: number, fb: number): Vec2 {
  const t = fa / (fa - fb);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** All built-in furniture types (for pickers). */
export const FURNITURE_TYPES = Object.keys(FURNITURE);
