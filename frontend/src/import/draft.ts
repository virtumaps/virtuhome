// Plans from other programs and hand-written files, to a VirtuHome plan. An importer turns its file
// into a draft in metres (rooms as corner lists, doors and windows by a point, furniture by type or
// name); buildPlan moves the rooms onto the middle of their walls, puts each opening on its room
// edge, maps the furniture and says what came in and what was left out.
import { DEFAULT_SETTINGS, newId, normalizePlan, type Floor, type Furniture, type Opening, type OpeningKind, type Plan, type Room, type Vec2 } from "../model/plan";
import { add, area, cross, dist, dot, norm, outwardNormal, scale, segmentDistance, sub } from "../model/geom";
import { layoutWalls } from "../model/walls";
import { CEILING_LAMPS, FURNITURE } from "../scene/furniture-lib";
import { furnitureFor, isType } from "./names";
import { t, type EditorPlainKey } from "../i18n/editor";

export interface DraftRoom {
  name?: string;
  points: Vec2[];
  /** How far each edge moves out to the middle of its wall (m); unset: worked out from `roomsAt`. */
  outset?: number[];
}

export interface DraftOpening {
  at: Vec2;
  width: number;
  height: number;
  sill: number;
  kind: OpeningKind;
  style?: Opening["style"];
  /** Which way it runs along its wall: only room edges parallel to it are tried. */
  along?: Vec2;
  /** The side it opens to: the room on that side gets it. */
  opens?: Vec2;
  /** Where its hinge is (the hinge side follows). */
  hinge?: Vec2;
  /** What to call it in the report. */
  label?: string;
}

export interface DraftPiece {
  at: Vec2;
  /** A built-in type, or a name to find one by. */
  type?: string | null;
  name?: string;
  w?: number | null;
  d?: number | null;
  h?: number | null;
  /** Degrees clockwise; 0: its front faces down the plan. */
  rotation?: number | null;
  /** Bottom above the floor (m). */
  elevation?: number | null;
  mirror?: boolean;
  light?: boolean;
}

export interface DraftFloor {
  name?: string;
  elevation: number;
  height: number;
  rooms: DraftRoom[];
  walls?: { a: Vec2; b: Vec2; thickness?: number | null; height?: number | null }[];
  openings: DraftOpening[];
  furniture: DraftPiece[];
}

export interface Draft {
  /** Room outlines along the middle of the walls, or along their inner faces. */
  roomsAt: "centre" | "inner";
  wallExterior?: number | null;
  wallInterior?: number | null;
  /** Compass bearing the top of the plan faces (PlanSettings.north), when the file says. */
  north?: number | null;
  floors: DraftFloor[];
  /** What the importer already left out. */
  left?: string[];
}

export interface ImportSummary {
  floors: number;
  rooms: number;
  doors: number;
  windows: number;
  furniture: number;
  /** Pieces no built-in type fits, brought in as plain boxes. */
  boxes: string[];
  /** What did not come in. */
  left: string[];
  north: number | null;
}

const FLOOR_NAMES: EditorPlainKey[] = ["editor.floor.groundFloor", "editor.floor.firstFloor", "editor.floor.secondFloor", "editor.floor.thirdFloor"];
/** Furthest a door or window may lie from its room edge, and the widest gap two rooms a wall apart have. */
const NEAR = 0.45;
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const fmt = (p: Vec2) => `${p[0].toFixed(1)}, ${p[1].toFixed(1)}`;

export function buildPlan(draft: Draft): { plan: Plan; summary: ImportSummary } {
  const left = [...(draft.left ?? [])];
  const boxes: string[] = [];
  const ext = draft.wallExterior ?? DEFAULT_SETTINGS.wall_exterior;
  const gaps: number[] = [];
  let roomNo = 0;
  let doors = 0;
  let windows = 0;
  const floors: Floor[] = [];

  draft.floors.forEach((df, fi) => {
    // rooms: at least three corners and some floor
    const rooms: { name: string; points: Vec2[]; outset?: number[] }[] = [];
    for (const r of df.rooms) {
      roomNo++;
      const name = r.name?.trim() || t("editor.import.roomRoomno", { roomNo });
      const kept = tidy(r.points, r.outset);
      if (kept.points.length < 3 || area(kept.points) < 0.1) {
        left.push(t("editor.import.nameTooFewCorners", { name }));
        continue;
      }
      rooms.push({ name, ...kept });
    }
    if (draft.roomsAt === "inner") gaps.push(...innerOutsets(rooms, ext));
    const outlines = weld(rooms.map((r) => offsetOutline(r.points, r.outset ?? r.points.map(() => 0))));

    const used = new Set<string>();
    const floor: Floor = {
      id: `floor_${fi}`, name: df.name?.trim() || (FLOOR_NAMES[fi] && t(FLOOR_NAMES[fi])) || t("editor.floor.floorX", { x: fi + 1 }), ha_floor: null,
      elevation: r3(df.elevation), height: r3(Math.max(2, df.height)),
      rooms: rooms.map((r, i): Room => {
        let id = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "room";
        while (used.has(id)) id += "_2";
        used.add(id);
        return { id, name: r.name, area_id: null, points: outlines[i], floor: guessFloor(r.name) };
      }),
      openings: [], furniture: [], devices: [], walls: [],
    };

    // doors and windows onto the nearest room edge (the room they open into, when known)
    const hinges = new Map<Opening, Vec2>();
    for (const o of df.openings) {
      const what = o.label || (o.kind === "window" ? t("editor.import.aWindow") : t("editor.import.aDoor"));
      const found = edgeFor(floor.rooms, o);
      if (!found) {
        left.push(t("editor.import.whatAtAtIs", { what, at: fmt(o.at) }));
        continue;
      }
      const { room, edge, t: along, len, inward } = found;
      const width = Math.min(o.width, len);
      const op: Opening = {
        id: newId("op"), room_id: room.id, edge, offset: r3(Math.max(width / 2, Math.min(len - width / 2, along))),
        width: r3(width), height: r3(o.height), sill: o.kind === "window" ? r3(Math.max(0, o.sill)) : 0, kind: o.kind,
      };
      if (o.style) op.style = o.style;
      if (o.opens) op.swing = dot(inward, o.opens) < 0 ? "out" : "in";
      if (o.hinge) hinges.set(op, o.hinge);
      floor.openings.push(op);
      if (o.kind === "window") windows++;
      else doors++;
    }
    // the hinge side runs along the wall's own direction, as the 3D view and the 2D plan draw it
    if (hinges.size) {
      for (const w of layoutWalls(floor, { ...DEFAULT_SETTINGS, wall_exterior: ext }).walls) {
        for (const po of w.openings) {
          const h = hinges.get(po.opening);
          if (h) po.opening.hinge = dot(sub(h, po.centre), w.dir) < 0 ? "left" : "right";
        }
      }
    }

    for (const w of df.walls ?? []) {
      if (dist(w.a, w.b) < 0.05) continue;
      floor.walls.push({ id: newId("w"), a: w.a.map(r3) as Vec2, b: w.b.map(r3) as Vec2, thickness: w.thickness ? r3(w.thickness) : null, height: w.height ? r3(w.height) : null });
    }

    for (const p of df.furniture) {
      const label = p.name || p.type || t("editor.import.aPiece");
      const info = { w: p.w ?? undefined, h: p.h ?? undefined, elevation: p.elevation ?? undefined, storey: floor.height, light: p.light };
      let type = p.type && isType(p.type) ? p.type : furnitureFor(p.type || p.name || "", info);
      if (type === null && p.type && p.name) type = furnitureFor(p.name, info);
      if (type === "") {
        left.push(label);
        continue;
      }
      if (type === null) boxes.push(label);
      const kind = type ?? "column";
      const [dw, dd, dh] = FURNITURE[kind].size;
      const size = (v: number | null | undefined, d: number) => r3(v && v > 0.005 ? v : d);
      const piece: Furniture = {
        id: newId("f"), type: kind, x: r3(p.at[0]), z: r3(p.at[1]),
        rotation: r3((((p.rotation ?? 0) % 360) + 360) % 360), w: size(p.w, dw), d: size(p.d, dd), h: size(p.h, dh),
      };
      if ((p.elevation ?? 0) > 0.02 && !CEILING_LAMPS.has(kind)) piece.y = r3(p.elevation!);
      if (p.mirror) piece.mirror = true;
      floor.furniture.push(piece);
    }
    floors.push(floor);
  });

  // the plan starts at 0, 0
  const all = floors.flatMap((f) => [...f.rooms.flatMap((r) => r.points), ...f.walls.flatMap((w) => [w.a, w.b])]);
  const minX = all.length ? Math.floor(Math.min(...all.map((p) => p[0])) * 100) / 100 : 0;
  const minZ = all.length ? Math.floor(Math.min(...all.map((p) => p[1])) * 100) / 100 : 0;
  const move = (p: Vec2): Vec2 => [r3(p[0] - minX), r3(p[1] - minZ)];
  for (const f of floors) {
    for (const r of f.rooms) r.points = r.points.map(move);
    for (const w of f.walls) [w.a, w.b] = [move(w.a), move(w.b)];
    for (const x of f.furniture) [x.x, x.z] = move([x.x, x.z]);
  }

  const inner = gaps.length ? gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : null;
  const settings = {
    ...DEFAULT_SETTINGS,
    wall_exterior: r3(ext),
    wall_interior: r3(Math.max(0.06, Math.min(0.3, draft.wallInterior ?? inner ?? DEFAULT_SETTINGS.wall_interior))),
    north: draft.north ? (((draft.north % 360) + 360) % 360) : 0,
  };
  const plan = normalizePlan({ version: 1, settings, floors });
  return {
    plan,
    summary: {
      floors: floors.length, rooms: floors.reduce((n, f) => n + f.rooms.length, 0), doors, windows,
      furniture: floors.reduce((n, f) => n + f.furniture.length, 0), boxes, left, north: draft.north ? settings.north : null,
    },
  };
}

/** Corners without repeats (the first again at the end, or twice in a row), with their edges' outsets. */
function tidy(points: Vec2[], outset?: number[]): { points: Vec2[]; outset?: number[] } {
  const pts: Vec2[] = [];
  const out: number[] = [];
  points.forEach((p, i) => {
    if (!p.every((v) => Number.isFinite(v))) return;
    if (pts.length && dist(pts[pts.length - 1], p) < 0.005) {
      if (outset) out[out.length - 1] = outset[i];
      return;
    }
    pts.push(p);
    if (outset) out.push(outset[i] ?? 0);
  });
  while (pts.length > 2 && dist(pts[pts.length - 1], pts[0]) < 0.005) {
    pts.pop();
    out.pop();
  }
  return outset ? { points: pts, outset: out } : { points: pts };
}

/**
 * Rooms drawn along the inner faces of their walls: edges of two rooms a wall apart move out to meet
 * in the middle of the gap, the others out by half an outside wall. Returns the gaps found.
 */
function innerOutsets(rooms: { points: Vec2[]; outset?: number[] }[], ext: number): number[] {
  const gaps: number[] = [];
  const out = rooms.map((r) => r.points.map(() => ext / 2));
  const edges = (pts: Vec2[]) => pts.map((a, i) => ({ a, b: pts[(i + 1) % pts.length], n: outwardNormal(pts, i) }));
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      edges(rooms[i].points).forEach((A, ei) => {
        edges(rooms[j].points).forEach((B, ej) => {
          if (dot(A.n, B.n) > -0.985) return;
          const gap = dot(sub(B.a, A.a), A.n);
          if (gap < -0.01 || gap > NEAR) return;
          const u = norm(sub(A.b, A.a));
          const [a0, a1] = [0, dot(sub(A.b, A.a), u)];
          const [b0, b1] = [dot(sub(B.a, A.a), u), dot(sub(B.b, A.a), u)].sort((x, y) => x - y);
          if (Math.min(a1, b1) - Math.max(a0, b0) < 0.2) return;
          const half = Math.max(0, gap) / 2;
          out[i][ei] = Math.min(out[i][ei], half);
          out[j][ej] = Math.min(out[j][ej], half);
          if (gap > 0.02) gaps.push(gap);
        });
      });
    }
  }
  rooms.forEach((r, i) => (r.outset = r.outset ?? out[i]));
  return gaps;
}

/**
 * The outline with each edge moved out by its outset. Where a straight run changes outset (a thin
 * inside wall carrying on as a thick outside one), it steps across.
 */
export function offsetOutline(pts: Vec2[], outset: number[]): Vec2[] {
  const n = pts.length;
  const res: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const prev = (i - 1 + n) % n;
    const d1 = norm(sub(pts[i], pts[prev]));
    const d2 = norm(sub(pts[(i + 1) % n], pts[i]));
    const p1 = add(pts[i], scale(outwardNormal(pts, prev), outset[prev]));
    const p2 = add(pts[i], scale(outwardNormal(pts, i), outset[i]));
    const c = cross(d1, d2);
    if (Math.abs(c) < 0.02) {
      if (Math.abs(outset[prev] - outset[i]) > 0.005 && dot(d1, d2) > 0) res.push(p1);
      res.push(p2);
    } else {
      res.push(add(p1, scale(d1, cross(sub(p2, p1), d2) / c)));
    }
  }
  // corners that ended up on a straight line or on top of each other go
  const out: Vec2[] = [];
  for (const p of res) if (!out.length || dist(out[out.length - 1], p) > 0.002) out.push(p);
  if (out.length > 1 && dist(out[0], out[out.length - 1]) <= 0.002) out.pop();
  return out.filter((p, i) => {
    const a = out[(i - 1 + out.length) % out.length];
    const b = out[(i + 1) % out.length];
    return Math.abs(cross(norm(sub(p, a)), norm(sub(b, p)))) > 0.001 || dot(sub(p, a), sub(b, p)) < 0;
  });
}

/** Corners of different rooms within a centimetre become one, so shared walls line up exactly. */
function weld(outlines: Vec2[][]): Vec2[][] {
  const seen: Vec2[] = [];
  return outlines.map((pts) => pts.map((p) => {
    const q = seen.find((s) => dist(s, p) < 0.01);
    if (q) return q;
    const r: Vec2 = [r3(p[0]), r3(p[1])];
    seen.push(r);
    return r;
  }));
}

/** The room edge an opening sits on: the nearest, and of two rooms sharing it, the one it opens into. */
function edgeFor(rooms: Room[], o: DraftOpening): { room: Room; edge: number; t: number; len: number; inward: Vec2 } | null {
  const cands: { room: Room; edge: number; t: number; len: number; inward: Vec2; d: number }[] = [];
  for (const room of rooms) {
    room.points.forEach((a, edge) => {
      const b = room.points[(edge + 1) % room.points.length];
      const len = dist(a, b);
      if (len < 0.2) return;
      if (o.along && Math.abs(cross(norm(o.along), norm(sub(b, a)))) > 0.17) return;
      const { d, t } = segmentDistance(o.at, a, b);
      if (d <= NEAR) cands.push({ room, edge, t, len, d, inward: scale(outwardNormal(room.points, edge), -1) });
    });
  }
  if (!cands.length) return null;
  const best = Math.min(...cands.map((c) => c.d));
  const near = cands.filter((c) => c.d < best + 0.06);
  return (o.opens && near.find((c) => dot(c.inward, o.opens!) > 0)) || near.find((c) => c.d === best)!;
}

function guessFloor(name: string): Room["floor"] {
  if (/kitchen|bath|wc|toilet|utility|shower|en.?suite/i.test(name)) return "tiles";
  if (/bed|landing|nursery|dressing|study/i.test(name)) return "carpet";
  if (/garage|shed|store|cellar|basement/i.test(name)) return "concrete";
  return "wood";
}
