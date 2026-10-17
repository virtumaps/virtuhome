// Apple RoomPlan scans (an iPhone/iPad with LiDAR) to a VirtuHome plan.
//
// Takes the JSON of a CapturedStructure (several rooms merged by StructureBuilder) or of a single
// CapturedRoom, plus optionally the House Scan app's manifest with the room names picked while
// scanning. The result is a plan with the walls straight, the front door at the bottom, rooms one
// wall apart joined on the wall's middle, doors and windows on their edges and furniture mapped.
import { newId, normalizePlan, DEFAULT_SETTINGS, type Floor, type Furniture, type Opening, type Plan, type Room, type Vec2 } from "../model/plan";
import { centroid, pointInPolygon, segmentDistance } from "../model/geom";

type M = number[];

interface Surface {
  dimensions?: number[];
  transform?: number[] | number[][];
  polygonCorners?: number[][];
  story?: number;
  category?: Record<string, unknown>;
}

interface CapturedRoomJson {
  walls?: Surface[];
  doors?: Surface[];
  windows?: Surface[];
  openings?: Surface[];
  objects?: Surface[];
  floors?: Surface[];
  sections?: { label?: string; center?: number[]; story?: number }[];
  story?: number;
}

interface CapturedStructureJson extends CapturedRoomJson {
  rooms?: CapturedRoomJson[];
}

export interface Manifest {
  rooms: { order: number; name: string; file?: string; story?: number }[];
}

export interface ImportOptions {
  /** Name (as in the manifest) of the room with the front door; it ends up at the bottom of the plan. */
  frontDoorRoom?: string;
  wallExterior?: number;
}

export interface ImportReport {
  rooms: number;
  floors: number;
  openings: number;
  furniture: number;
  warnings: string[];
}

const ROOMPLAN_TYPES: Record<string, string> = {
  storage: "tall_cabinet", refrigerator: "fridge", stove: "stove", bed: "bed", sink: "sink",
  washerDryer: "washer", toilet: "wc", bathtub: "bathtub", oven: "kitchen_tall", dishwasher: "dishwasher",
  table: "table", sofa: "sofa", chair: "chair", fireplace: "fireplace", television: "tv_board", stairs: "stairs",
};

const LABELS: Record<string, string> = {
  livingRoom: "Living Room", bedroom: "Bedroom", bathroom: "Bathroom", kitchen: "Kitchen", diningRoom: "Dining Room",
};

const flat = (t: number[] | number[][]): M => (Array.isArray(t[0]) ? (t as number[][]).flat() : (t as number[]));
const rot = (p: Vec2, deg: number): Vec2 => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
};
const apply = (m: M, p: number[]): Vec2 => {
  const [x = 0, y = 0, z = 0] = p;
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[2] * x + m[6] * y + m[10] * z + m[14]];
};

export function isRoomPlan(data: unknown): boolean {
  const d = data as CapturedStructureJson;
  const walls = Array.isArray(d?.walls) && d.walls.length ? d.walls : Array.isArray(d?.rooms) ? d.rooms[0]?.walls ?? [] : [];
  return walls.length > 0 && !!walls[0]?.dimensions && !!walls[0]?.transform;
}

export function importRoomPlan(data: CapturedStructureJson, manifest?: Manifest | null, opt: ImportOptions = {}): { plan: Plan; report: ImportReport } {
  const warnings: string[] = [];
  const wallExt = opt.wallExterior ?? DEFAULT_SETTINGS.wall_exterior;
  // a single CapturedRoom has its surfaces at the top and no rooms list
  const rawRooms: CapturedRoomJson[] = data.rooms?.length ? data.rooms : [data];
  const top = (k: keyof CapturedRoomJson) => {
    const list = (data[k] as Surface[] | undefined) ?? [];
    return list.length ? list : rawRooms.flatMap((r) => (r[k] as Surface[] | undefined) ?? []);
  };
  const walls = top("walls");
  if (!walls.length) throw new Error("The file has no walls: is it a RoomPlan JSON?");

  // 1. straighten: the walls' main direction (length weighted, modulo 90 degrees)
  let sx = 0;
  let sy = 0;
  for (const w of walls) {
    const m = flat(w.transform!);
    const t = Math.atan2(m[2], m[0]) * 4;
    const len = w.dimensions?.[0] ?? 0;
    sx += len * Math.cos(t);
    sy += len * Math.sin(t);
  }
  const straighten = (-Math.atan2(sy, sx) * 180) / Math.PI / 4;

  const names = manifest?.rooms?.slice().sort((a, b) => a.order - b.order).map((r) => r.name) ?? [];
  if (names.length && names.length !== rawRooms.length) warnings.push(`The manifest names ${names.length} rooms, the scan has ${rawRooms.length}.`);

  interface Work {
    name: string;
    story: number;
    poly: Vec2[];
    lines: ["h" | "v", number][];
    shared: boolean[];
  }
  const rooms: Work[] = [];
  rawRooms.forEach((r, i) => {
    const f = (r.floors ?? []).find((s) => (s.polygonCorners?.length ?? 0) >= 3 && s.transform);
    if (!f) {
      warnings.push(`Room ${i + 1} has no floor outline (scanned before iOS 17?) and was left out.`);
      return;
    }
    const m = flat(f.transform!);
    const poly = f.polygonCorners!.map((c) => rot(apply(m, c), straighten));
    const label = r.sections?.find((s) => s.label && s.label !== "unidentified")?.label;
    const name = names[i] ?? (label ? LABELS[label] ?? label : `Room ${i + 1}`);
    rooms.push({ name: cleanName(name), story: r.story ?? f.story ?? 0, poly, lines: [], shared: [] });
  });

  // 2. square up: each edge on one horizontal or vertical line
  const edges = (p: Vec2[]) => p.map((a, i) => [a, p[(i + 1) % p.length]] as [Vec2, Vec2]);
  const rebuild = (poly: Vec2[], lines: Work["lines"]): Vec2[] =>
    poly.map((p, i) => {
      let [x, z] = p;
      for (const e of [(i - 1 + poly.length) % poly.length, i]) {
        const [kind, v] = lines[e];
        if (kind === "h") z = v;
        else x = v;
      }
      return [x, z] as Vec2;
    });
  for (const r of rooms) {
    r.lines = edges(r.poly).map(([a, b]) =>
      Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]) ? ["h", (a[1] + b[1]) / 2] : ["v", (a[0] + b[0]) / 2],
    );
    r.poly = dedupe(rebuild(r.poly, r.lines), r);
    r.shared = r.poly.map(() => false);
  }

  const outward = (poly: Vec2[], a: Vec2, b: Vec2): Vec2 => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const l = Math.hypot(dx, dz) || 1;
    const n: Vec2 = [dz / l, -dx / l];
    const mid: Vec2 = [(a[0] + b[0]) / 2 + n[0] * 0.05, (a[1] + b[1]) / 2 + n[1] * 0.05];
    return pointInPolygon(mid, poly) ? [-n[0], -n[1]] : n;
  };

  // 3. rooms one wall apart share the wall's middle
  const gaps: number[] = [];
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const r = rooms[i];
      const q = rooms[j];
      if (r.story !== q.story) continue;
      edges(r.poly).forEach(([a, b], ei) => {
        edges(q.poly).forEach(([c, d], ej) => {
          const [ki, vi] = r.lines[ei];
          const [kj, vj] = q.lines[ej];
          if (ki !== kj) return;
          const na = outward(r.poly, a, b);
          const nb = outward(q.poly, c, d);
          if (na[0] * nb[0] + na[1] * nb[1] > -0.9) return;
          const gap = Math.abs(vi - vj);
          const k = ki === "v" ? 1 : 0;
          const lo = Math.max(Math.min(a[k], b[k]), Math.min(c[k], d[k]));
          const hi = Math.min(Math.max(a[k], b[k]), Math.max(c[k], d[k]));
          if (gap >= 0.02 && gap <= 0.45 && hi - lo > 0.3) {
            const mid = (vi + vj) / 2;
            r.lines[ei] = [ki, mid];
            q.lines[ej] = [kj, mid];
            r.shared[ei] = q.shared[ej] = true;
            gaps.push(gap);
          }
        });
      });
    }
  }
  const wallInterior = gaps.length ? clamp(median(gaps), 0.08, 0.3) : DEFAULT_SETTINGS.wall_interior;

  // 4. outer edges out by half an outside wall: NeonPlan-style centred walls keep the scanned inside
  for (const r of rooms) {
    const poly = rebuild(r.poly, r.lines);
    r.lines = r.lines.map(([kind, v], e) => {
      if (r.shared[e]) return [kind, v];
      const [a, b] = edges(poly)[e];
      const n = outward(poly, a, b);
      return [kind, v + (kind === "h" ? n[1] : n[0]) * (wallExt / 2)];
    });
    r.poly = rebuild(poly, r.lines);
  }

  // floor levels: the walls' bottoms per storey (the scan's origin is the phone)
  const bottoms = new Map<number, number[]>();
  for (const w of walls) {
    const m = flat(w.transform!);
    const s = w.story ?? 0;
    if (!bottoms.has(s)) bottoms.set(s, []);
    bottoms.get(s)!.push(m[13] - (w.dimensions?.[1] ?? 2.4) / 2);
  }
  const level = new Map([...bottoms].map(([s, v]) => [s, median(v)]));
  const heights = walls.map((w) => w.dimensions?.[1] ?? 2.4);

  const item = (o: Surface) => {
    const m = flat(o.transform!);
    return {
      centre: rot([m[12], m[14]], straighten),
      axis: rot([m[0], m[2]], straighten),
      bottom: m[13] - (o.dimensions?.[1] ?? 0) / 2 - (level.get(o.story ?? 0) ?? 0),
      story: o.story ?? 0,
    };
  };

  // 5. turn so the front door faces the bottom of the plan
  const doors = top("doors");
  const frontName = opt.frontDoorRoom ? cleanName(opt.frontDoorRoom) : null;
  const frontRoom = (frontName && rooms.find((r) => r.name.toLowerCase() === frontName.toLowerCase())) || null;
  let turn = 0;
  let frontDoor: Vec2 | null = null;
  const findFront = (cands: Work[]) => {
    let best: { w: number; n: Vec2; c: Vec2 } | null = null;
    for (const d of doors) {
      const { centre } = item(d);
      for (const r of cands) {
        edges(r.poly).forEach(([a, b], e) => {
          if (r.shared[e]) return;
          if (segmentDistance(centre, a, b).d < 0.45 && (!best || (d.dimensions?.[0] ?? 0) > best.w)) {
            best = { w: d.dimensions?.[0] ?? 0, n: outward(r.poly, a, b), c: centre };
          }
        });
      }
    }
    return best as { w: number; n: Vec2; c: Vec2 } | null;
  };
  const front = findFront(frontRoom ? [frontRoom] : rooms.filter((r) => r.story === 0));
  if (front) {
    const key = `${Math.round(front.n[0])},${Math.round(front.n[1])}`;
    turn = ({ "0,1": 0, "-1,0": -90, "0,-1": 180, "1,0": 90 } as Record<string, number>)[key] ?? 0;
    frontDoor = front.c;
  }
  const place = (p: Vec2) => rot(p, turn);
  for (const r of rooms) r.poly = r.poly.map(place);
  const all = rooms.flatMap((r) => r.poly);
  const minX = Math.min(...all.map((p) => p[0]));
  const minZ = Math.min(...all.map((p) => p[1]));
  const fin = (p: Vec2): Vec2 => {
    const q = place(p);
    return [round(q[0] - minX), round(q[1] - minZ)];
  };
  for (const r of rooms) r.poly = r.poly.map(([x, z]) => [round(x - minX), round(z - minZ)]);
  void frontDoor;

  // floors by storey
  const stories = [...new Set(rooms.map((r) => r.story))].sort((a, b) => a - b);
  const floorNames = ["Ground Floor", "First Floor", "Second Floor", "Third Floor"];
  const base = level.get(stories[0] ?? 0) ?? 0;
  const floors: Floor[] = stories.map((s, i) => ({
    id: `floor_${i}`,
    name: floorNames[i] ?? `Floor ${i + 1}`,
    ha_floor: null,
    elevation: round((level.get(s) ?? base) - base),
    height: round(median(heights) + 0.2),
    rooms: [],
    openings: [],
    furniture: [],
    devices: [],
    walls: [],
  }));
  const floorOf = (story: number) => floors[Math.max(0, stories.indexOf(story))];
  // storey heights: up to the next storey where there is one
  floors.forEach((f, i) => {
    if (floors[i + 1]) f.height = round(Math.max(2.2, floors[i + 1].elevation - f.elevation));
  });

  const used = new Set<string>();
  const roomIds = new Map<Work, string>();
  for (const r of rooms) {
    let id = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "room";
    while (used.has(id)) id += "_2";
    used.add(id);
    roomIds.set(r, id);
    const room: Room = { id, name: r.name, area_id: null, points: r.poly, floor: guessFloor(r.name) };
    floorOf(r.story).rooms.push(room);
  }

  // 6. doors, windows and openings onto their room edges
  let openingCount = 0;
  const addOpenings = (list: Surface[], kind: "door" | "window" | null) => {
    for (const o of list) {
      const { centre, bottom, story } = item(o);
      const p = fin(centre);
      const width = o.dimensions?.[0] ?? 0.9;
      const height = o.dimensions?.[1] ?? 2;
      let best: { d: number; r: Work; e: number; t: number; len: number } | null = null;
      for (const r of rooms) {
        if (r.story !== story) continue;
        edges(r.poly).forEach(([a, b], e) => {
          const { d, t } = segmentDistance(p, a, b);
          if (!best || d < best.d) best = { d, r, e, t, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
        });
      }
      const b = best as { d: number; r: Work; e: number; t: number; len: number } | null;
      if (!b || b.d > 0.45) {
        warnings.push(`A ${kind ?? "opening"} at ${p.map((v) => v.toFixed(1)).join(", ")} lies on no room edge and was left out.`);
        continue;
      }
      const isDoor = kind === "door" || (kind === null && bottom < 0.15);
      const op: Opening = {
        id: newId("op"),
        room_id: roomIds.get(b.r)!,
        edge: b.e,
        offset: round(Math.max(width / 2, Math.min(b.len - width / 2, b.t))),
        width: round(Math.min(width, b.len)),
        height: round(height),
        sill: isDoor ? 0 : round(Math.max(0, bottom)),
        kind: kind === null ? (isDoor ? "passage" : "window") : kind,
      };
      floorOf(story).openings.push(op);
      openingCount++;
    }
  };
  addOpenings(doors, "door");
  addOpenings(top("windows"), "window");
  addOpenings(top("openings"), null);

  // 7. furniture
  let furnitureCount = 0;
  for (const o of top("objects")) {
    const cat = Object.keys(o.category ?? {})[0] ?? "";
    let type = ROOMPLAN_TYPES[cat];
    if (!type) continue;
    const { centre, axis, bottom, story } = item(o);
    const [w = 0.5, h = 0.5, d = 0.5] = o.dimensions ?? [];
    if (cat === "storage" && h < 1.3) type = "sideboard";
    if (cat === "television" && bottom > 0.5) type = "tv_wall";
    const p = fin(centre);
    const ax = place(axis);
    const piece: Furniture = {
      id: newId("f"), type, x: p[0], z: p[1],
      rotation: round((Math.atan2(ax[1], ax[0]) * 180) / Math.PI),
      w: round(w), d: round(d), h: round(h),
    };
    if (type === "tv_wall") piece.y = round(Math.max(0, bottom));
    if (type === "stairs") {
      // RoomPlan sees only the first steps: give the flight the storey height and a matching run
      piece.h = floorOf(story).height;
      piece.d = Math.max(piece.d, round(piece.h * 1.05));
    }
    floorOf(story).furniture.push(piece);
    furnitureCount++;
  }

  const plan = normalizePlan({ version: 1, settings: { ...DEFAULT_SETTINGS, wall_exterior: wallExt, wall_interior: round(wallInterior) }, floors });
  return {
    plan,
    report: { rooms: rooms.length, floors: floors.length, openings: openingCount, furniture: furnitureCount, warnings },
  };
}

/** "Hallway (downstairs)" -> "Hallway". */
function cleanName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, " ").trim() || name;
}

function guessFloor(name: string): Room["floor"] {
  if (/kitchen|bath|wc|toilet|utility|shower/i.test(name)) return "tiles";
  if (/bed|landing|nursery|cloak|dressing|gym/i.test(name)) return "carpet";
  if (/garage|shed|store/i.test(name)) return "concrete";
  return "wood";
}

/** Drops corners that squaring up made doubled; edge i runs from corner i to the next. */
function dedupe(poly: Vec2[], r: { lines: ["h" | "v", number][] }): Vec2[] {
  const out: Vec2[] = [];
  const lines: ["h" | "v", number][] = [];
  const same = (a: Vec2, b: Vec2) => Math.abs(a[0] - b[0]) < 1e-4 && Math.abs(a[1] - b[1]) < 1e-4;
  for (let i = 0; i < poly.length; i++) {
    if (out.length && same(out[out.length - 1], poly[i])) {
      // the edge into this corner has no length: the corner before takes this one's outgoing edge
      lines[lines.length - 1] = r.lines[i];
      continue;
    }
    out.push(poly[i]);
    lines.push(r.lines[i]);
  }
  while (out.length > 3 && same(out[out.length - 1], out[0])) {
    out.pop();
    lines.pop();
  }
  r.lines = lines;
  return out;
}

const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round = (v: number) => Math.round(v * 1000) / 1000;

export { centroid };
