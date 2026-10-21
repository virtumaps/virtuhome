// Cameras in 3D. Each placed camera gets a model of its kind where it really hangs (a bullet camera
// on a bracket against its wall, a dome on the ceiling, a doorbell flat on the outside wall, a cube
// camera standing on a shelf) and a direction even when none was set, so every camera shows what
// it sees. The viewer draws that from the lens: see Viewer.refreshCones.
import { centroid, pointInPolygon } from "../model/geom";
import type { Device, Floor, Furniture, Vec2 } from "../model/plan";
import type { WallLayout } from "../model/walls";
import type { Part, Role } from "./furniture-lib";

export type CameraKind = "bullet" | "dome" | "doorbell" | "cube";


export interface CameraRig {
  /** The device's id and entity. */
  id: string;
  entity: string;
  kind: CameraKind;
  /** Plan position of the lens, and its height above the storey's floor. */
  lens: Vec2;
  y: number;
  /** Plan direction it looks, degrees clockwise like Device.rotation (0 = +z). */
  heading: number;
  /** Field of view in degrees (360 = all round) and how far it sees in metres. */
  fov: number;
  reach: number;
  /** The wall it hangs on: the point on the wall's face and the unit vector out of it. */
  wall: { at: Vec2; out: Vec2 } | null;
  /** Not in a room (a doorbell, a garden camera): what it sees lies on the ground. */
  outside: boolean;
}

const DOORBELL = /doorbell|door_?bell|front_?door|door_?station|intercom/i;
/** A wall camera this close to a wall (from its face) hangs on it. */
const WALL_SNAP = 0.6;
const FOV: Record<CameraKind, number> = { bullet: 90, dome: 360, doorbell: 150, cube: 110 };
const REACH: Record<CameraKind, number> = { bullet: 7, dome: 4, doorbell: 6, cube: 6 };
/** How far a bullet camera's body sits off its wall, and half its length. */
const ARM = 0.11;
const BODY = 0.085;

/** Plan heading (degrees clockwise from +z) of a direction. */
export function headingOf(v: Vec2): number {
  return ((Math.atan2(-v[0], v[1]) * 180) / Math.PI + 360) % 360;
}

/** Unit plan direction of a heading in degrees. */
export function headingDir(deg: number): Vec2 {
  const a = (deg * Math.PI) / 180;
  return [-Math.sin(a), Math.cos(a)];
}

/** The nearest wall face within reach of a plan point, and the way out of it toward the point. */
function nearestWall(layout: WallLayout, p: Vec2, facing: Vec2 | null, inRoom: number): { at: Vec2; out: Vec2 } | null {
  let best: { gap: number; at: Vec2; out: Vec2 } | null = null;
  for (const w of layout.walls) {
    const ex = w.b[0] - w.a[0], ez = w.b[1] - w.a[1];
    const len2 = ex * ex + ez * ez;
    if (len2 < 1e-6) continue;
    const u = Math.max(0, Math.min(1, ((p[0] - w.a[0]) * ex + (p[1] - w.a[1]) * ez) / len2));
    const c: Vec2 = [w.a[0] + ex * u, w.a[1] + ez * u];
    const side = (p[0] - c[0]) * w.normal[0] + (p[1] - c[1]) * w.normal[1];
    const gap = Math.max(0, Math.hypot(p[0] - c[0], p[1] - c[1]) - w.thickness / 2);
    if (gap > WALL_SNAP || (best && gap >= best.gap)) continue;
    // on the centre line itself: the side it looks to, else its own room's side
    let s = Math.sign(side);
    if (Math.abs(side) < 1e-3) {
      if (facing) s = Math.sign(facing[0] * w.normal[0] + facing[1] * w.normal[1]) || 1;
      else s = inRoom >= 0 && w.roomB === inRoom ? -1 : 1;
    }
    const out: Vec2 = [w.normal[0] * s + 0, w.normal[1] * s + 0];
    best = { gap, at: [c[0] + (out[0] * w.thickness) / 2, c[1] + (out[1] * w.thickness) / 2], out };
  }
  return best && { at: best.at, out: best.out };
}

/** Where a camera hangs, which way it looks and how far it sees. */
export function cameraRig(floor: Floor, layout: WallLayout, d: Device): CameraRig {
  const p: Vec2 = [d.x, d.z];
  const inRoom = floor.rooms.findIndex((r) => pointInPolygon(p, r.points));
  const set = d.rotation !== null && d.rotation !== undefined ? headingDir(d.rotation) : null;
  let kind: CameraKind = d.mount === "ceiling" ? "dome" : DOORBELL.test(d.entity) ? "doorbell" : d.mount === "table" || d.mount === "floor" ? "cube" : "bullet";
  const wall = kind === "bullet" || kind === "doorbell" ? nearestWall(layout, p, set, inRoom) : null;
  // a wall camera nowhere near a wall stands on something instead
  if (!wall && kind === "bullet") kind = "cube";
  const room = inRoom >= 0 ? floor.rooms[inRoom] : null;
  const heading = d.rotation ?? (wall ? headingOf(wall.out) : room && kind === "cube" ? towards(p, centroid(room.points)) : 0);
  const aim = headingDir(heading);
  const usual = kind === "dome" ? floor.height - 0.065 : kind === "doorbell" ? 1.4 : kind === "bullet" ? 2.2 : d.mount === "floor" ? 0.1 : d.mount === "table" ? 0.85 : 1.0;
  const y = d.y ?? usual;
  let lens: Vec2 = p;
  if (wall && kind === "bullet") lens = [wall.at[0] + wall.out[0] * ARM + aim[0] * BODY, wall.at[1] + wall.out[1] * ARM + aim[1] * BODY];
  else if (wall) lens = [wall.at[0] + wall.out[0] * 0.034, wall.at[1] + wall.out[1] * 0.034];
  else if (kind === "cube") lens = [p[0] + aim[0] * 0.035, p[1] + aim[1] * 0.035];
  const fov = Math.max(20, Math.min(360, d.fov ?? FOV[kind]));
  const reach = Math.max(0.5, Math.min(30, d.reach ?? REACH[kind]));
  return { id: d.id, entity: d.entity, kind, lens, y, heading, fov, reach, wall, outside: inRoom < 0 };
}

function towards(from: Vec2, to: Vec2): number {
  const v: Vec2 = [to[0] - from[0], to[1] - from[1]];
  return Math.hypot(v[0], v[1]) < 1e-3 ? 0 : headingOf(v);
}

const rodZ = (x: number, y: number, z: number, dia: number, depth: number, role: Role, seg = 14): Part =>
  ({ shape: "cyl", axis: "z", x, y, z, w: dia, h: dia, d: depth, role, seg });
const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Role): Part =>
  ({ shape: "box", x, y, z, w, h, d, role });

/** A piece of a camera model: parts in its own frame (front = +z), placed like furniture. */
export interface CameraPiece {
  item: Furniture;
  /** Its bottom above the storey's floor. */
  bottom: number;
  parts: Part[];
}

/** The model of a camera: one or two pieces (a bracket turns with its wall, the body with its aim). */
export function cameraPieces(rig: CameraRig): CameraPiece[] {
  const piece = (at: Vec2, rotation: number, bottom: number, parts: Part[]): CameraPiece => ({
    item: { id: `cam_${rig.id}`, type: `camera_${rig.kind}`, x: at[0], z: at[1], rotation, w: 0.1, d: 0.1, h: 0.1 },
    bottom, parts,
  });
  const y = rig.y;
  if (rig.kind === "dome") {
    // a white base on the ceiling and a smoked half-dome under it, the lens at its bottom
    return [piece(rig.lens, rig.heading, y - 0.002, [
      { shape: "cyl", x: 0, y: 0.03, z: 0, w: 0.13, h: 0.03, d: 0.13, role: "white", seg: 20 },
      { shape: "ball", x: 0, y: 0, z: 0, w: 0.095, h: 0.058, d: 0.095, role: "screen", seg: 14 },
    ])];
  }
  if (rig.kind === "doorbell" && rig.wall) {
    // flat on the wall: a slim black body, a metal face, the lens on top and the ring of the button under it
    return [piece(rig.wall.at, headingOf(rig.wall.out), y - 0.095, [
      box(0, 0, 0.011, 0.048, 0.135, 0.022, "dark"),
      box(0, 0.006, 0.025, 0.04, 0.123, 0.006, "metal"),
      rodZ(0, 0.084, 0.0295, 0.022, 0.005, "screen"),
      rodZ(0, 0.022, 0.0295, 0.03, 0.005, "blue", 16),
      rodZ(0, 0.027, 0.0315, 0.02, 0.006, "dark", 16),
    ])];
  }
  if (rig.kind === "bullet" && rig.wall) {
    const { at, out } = rig.wall;
    const centre: Vec2 = [at[0] + out[0] * ARM, at[1] + out[1] * ARM];
    return [
      // the bracket comes straight out of the wall, its ball joint under the body's middle
      piece(at, headingOf(out), y - 0.085, [
        rodZ(0, 0.005, 0.006, 0.07, 0.012, "white", 16),
        box(0, 0.029, (0.012 + ARM) / 2, 0.022, 0.022, ARM - 0.012, "white"),
        { shape: "ball", x: 0, y: 0.02, z: ARM, w: 0.03, h: 0.034, d: 0.03, role: "metal", seg: 8 },
      ]),
      // the body turns to where the camera looks: a round body under a sun hood, the lens in front
      piece(centre, rig.heading, y - 0.0325, [
        rodZ(0, 0, 0, 0.065, BODY * 2, "white", 16),
        box(0, 0.066, 0.012, 0.078, 0.007, BODY * 2 + 0.03, "white"),
        rodZ(0, 0.0065, BODY + 0.006, 0.052, 0.012, "dark", 16),
        rodZ(0, 0.0185, BODY + 0.015, 0.028, 0.006, "screen"),
        box(0.017, 0.042, BODY + 0.0125, 0.005, 0.005, 0.002, "red"),
      ]),
    ];
  }
  // a cube camera on a little stand
  return [piece([rig.lens[0] - headingDir(rig.heading)[0] * 0.035, rig.lens[1] - headingDir(rig.heading)[1] * 0.035], rig.heading, y - 0.097, [
    { shape: "cyl", x: 0, y: 0, z: 0, w: 0.07, h: 0.012, d: 0.07, role: "white", seg: 16 },
    { shape: "cyl", x: 0, y: 0.012, z: 0, w: 0.016, h: 0.05, d: 0.016, role: "white", seg: 8 },
    box(0, 0.062, 0, 0.07, 0.07, 0.055, "white"),
    rodZ(0, 0.074, 0.0305, 0.046, 0.006, "dark", 16),
    rodZ(0, 0.086, 0.0345, 0.022, 0.004, "screen"),
  ])];
}
