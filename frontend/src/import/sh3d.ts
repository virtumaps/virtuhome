// Sweet Home 3D homes (.sh3d) to an import draft. A .sh3d file is a zip archive; Sweet Home 3D 5.3
// and later put the home in it as Home.xml. Lengths there are centimetres, angles radians, and its
// plan's y axis runs down the plan like our z.
//
// Its rooms are usually drawn along the inner faces of the walls: each room edge moves out to the
// middle of the wall along it (stepping where the wall changes). Walls on no room edge become free
// walls, curved ones as short straight pieces. Doors and windows open towards the front of their
// model, so the room in front of one gets it; their sashes say where the hinge is.
import { cross, dot, norm, outwardNormal, sub } from "../model/geom";
import type { OpeningKind, Vec2 } from "../model/plan";
import type { Draft, DraftFloor, DraftOpening, DraftPiece, DraftRoom } from "./draft";
import { plain } from "./names";
import { parseXml, type XmlElement } from "./xml";
import { isZip, unzipEntry } from "./zip";
import { t } from "../i18n/editor";

/** Sweet Home 3D's own catalogue ids: a type, or a name to find one by (with the piece's size and height). */
const CATALOG: Record<string, string> = {
  bed140x190: "double bed", bed90x190: "single bed", bed: "bed", bunkBed90x190: "bunk_bed", cornerBunkBed90x190: "bunk_bed",
  loftBed140x190: "bunk_bed", crib: "cot", chest: "dresser", bedsideTable: "nightstand", wardrobe: "wardrobe", slidingDoors: "wardrobe",
  bookcase: "bookcase", filledBookcase: "bookcase", glassDoorCabinet: "display_cabinet", dresser: "dresser",
  chair: "chair", chair2: "chair", stool: "stool", roundTable: "table_round", squareTable: "table", table: "table",
  coffeeTable: "coffee_table", desk: "desk", armchair: "armchair", armchair2: "armchair", sofa: "sofa", sofa2: "sofa",
  cornerSofa: "sofa_l", tvUnit: "tv_board", flatTV: "television", piano: "piano", fireplace: "fireplace", aquarium: "aquarium",
  toiletUnit: "wc", washbasin: "washbasin", washbasinWithCabinet: "washbasin", bath: "bathtub", fittedBath: "bathtub", shower: "shower",
  clothesWasher: "washer", cooker: "stove", dishwasher: "dishwasher", fridge: "fridge", fridgeFreezer: "fridge",
  kitchenCabinet: "kitchen", kitchenUpperCabinet: "kitchen_wall", sink: "sink",
  staircase: "stairs", curveStaircase: "stairs", spiralStaircase: "stairs", plant: "plant", flowers: "flowers", frame: "picture",
  laptop: "laptop", electricRadiator: "radiator", hotWaterRadiator: "radiator", texturableBox: "column", texturableCylinder0: "column",
  floorUplight: "lamp_floor", spotlight: "lamp_wall", pendantLamp: "lamp_pendant", workLamp: "lamp_table", wallUplight: "lamp_wall",
  lamp: "light", blind: "blind", curtains: "curtains", railing: "curtains",
};

/** Curved walls are cut into pieces of at most this angle. */
const ARC_STEP = Math.PI / 12;

interface WallPiece {
  floor: number;
  a: Vec2;
  b: Vec2;
  thickness: number;
  height: number | null;
  /** Stretches along it (m from a) that a room edge runs along, and the sides those rooms are on. */
  used: [number, number][];
  sides: Set<number>;
}

export async function importSh3d(bytes: Uint8Array): Promise<Draft> {
  if (!isZip(bytes)) throw new Error(t("editor.import.theFileIsNot"));
  const xml = await unzipEntry(bytes, "Home.xml");
  if (!xml) throw new Error(t("editor.import.theFileHasNoHome"));
  return sh3dDraft(parseXml(new TextDecoder().decode(xml)));
}

export function sh3dDraft(home: XmlElement): Draft {
  if (home.name !== "home") throw new Error(t("editor.import.theFileIsNotA"));
  const num = (e: XmlElement, k: string, d = 0) => {
    const v = parseFloat(e.attrs[k]);
    return Number.isFinite(v) ? v : d;
  };
  const cm = (e: XmlElement, k: string, d = 0) => num(e, k, d * 100) / 100;
  const of = (name: string) => home.children.filter((e) => e.name === name);
  const left: string[] = [];

  // levels at the same elevation are one storey
  const levels = of("level").sort((a, b) => num(a, "elevation") - num(b, "elevation") || num(a, "elevationIndex") - num(b, "elevationIndex"));
  const elevations = [...new Set(levels.map((l) => cm(l, "elevation")))];
  const floorOf = new Map(levels.map((l) => [l.attrs.id, elevations.indexOf(cm(l, "elevation"))]));
  const fi = (e: XmlElement, inherited?: string) => floorOf.get(e.attrs.level ?? inherited ?? "") ?? 0;
  const wallHeight = cm(home, "wallHeight", 2.5);
  const floors: DraftFloor[] = (elevations.length ? elevations : [0]).map((elevation) => {
    const level = levels.find((l) => cm(l, "elevation") === elevation);
    return { name: level?.attrs.name, elevation, height: level ? cm(level, "height", wallHeight) : wallHeight, rooms: [], walls: [], openings: [], furniture: [] };
  });

  // walls, curved ones cut into straight pieces
  const pieces: WallPiece[] = [];
  for (const w of of("wall")) {
    const a: Vec2 = [cm(w, "xStart"), cm(w, "yStart")];
    const b: Vec2 = [cm(w, "xEnd"), cm(w, "yEnd")];
    const f = fi(w);
    const thickness = Math.max(0.01, cm(w, "thickness", 0.1));
    const height = w.attrs.height ? cm(w, "height") : null;
    const pts = arcPoints(a, b, num(w, "arcExtent"));
    for (let i = 0; i + 1 < pts.length; i++) pieces.push({ floor: f, a: pts[i], b: pts[i + 1], thickness, height, used: [], sides: new Set() });
  }
  // the top storey's walls say how high it is; the others reach the storey above
  floors.forEach((f, i) => {
    const next = floors[i + 1];
    const hs = pieces.filter((p) => p.floor === i && p.height).map((p) => p.height!).sort((x, y) => x - y);
    f.height = next ? next.elevation - f.elevation : hs.length ? hs[Math.floor(hs.length / 2)] : f.height;
  });

  // rooms: each edge out to the middle of the wall along it
  let unwalled = 0;
  for (const r of of("room")) {
    const pts = r.children.filter((p) => p.name === "point").map((p): Vec2 => [cm(p, "x"), cm(p, "y")]);
    const f = fi(r);
    if (pts.length < 3) {
      floors[f].rooms.push({ name: r.attrs.name, points: pts });
      continue;
    }
    const room: DraftRoom = { name: r.attrs.name, points: [], outset: [] };
    pts.forEach((p, i) => {
      const runs = wallRuns(pts, i, pieces.filter((w) => w.floor === f));
      if (!runs.length) unwalled++;
      room.points.push(p);
      room.outset!.push(runs[0]?.s ?? 0);
      const u = norm(sub(pts[(i + 1) % pts.length], p));
      for (const run of runs.slice(1)) {
        room.points.push([p[0] + u[0] * run.from, p[1] + u[1] * run.from]);
        room.outset!.push(run.s);
      }
    });
    floors[f].rooms.push(room);
  }
  if (unwalled) left.push(t("editor.import.unwalled", { n: unwalled }));

  // walls no room runs along stand on their own
  for (const w of pieces) {
    const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
    const u: Vec2 = [(w.b[0] - w.a[0]) / len, (w.b[1] - w.a[1]) / len];
    let t = 0;
    for (const [lo, hi] of [...w.used.sort((x, y) => x[0] - y[0]), [len, len] as [number, number]]) {
      // a whole piece of wall, or a stretch of one past the rooms
      if (lo - t > (w.used.length ? 0.3 : 0.05)) {
        const height = w.height && Math.abs(w.height - floors[w.floor].height) > 0.05 ? w.height : null;
        floors[w.floor].walls!.push({ a: [w.a[0] + u[0] * t, w.a[1] + u[1] * t], b: [w.a[0] + u[0] * lo, w.a[1] + u[1] * lo], thickness: w.thickness, height });
      }
      t = Math.max(t, hi);
    }
  }

  // furniture, doors, windows and lights, also inside groups
  const visit = (e: XmlElement, level?: string) => {
    if (e.name === "furnitureGroup") return e.children.forEach((c) => visit(c, e.attrs.level ?? level));
    if (!["pieceOfFurniture", "doorOrWindow", "light", "shelfUnit"].includes(e.name) || e.attrs.visible === "false") return;
    const f = floors[fi(e, level)];
    const at: Vec2 = [cm(e, "x"), cm(e, "y")];
    const angle = num(e, "angle");
    const [w, d, h] = [cm(e, "width"), cm(e, "depth"), cm(e, "height")];
    const name = e.attrs.name ?? "";
    const id = (e.attrs.catalogId ?? "").split("#").pop()!;
    if (e.name === "doorOrWindow" || e.attrs.doorOrWindow === "true") {
      f.openings.push(opening(e, at, angle, w, d, h, cm(e, "elevation"), name, id));
      return;
    }
    const piece: DraftPiece = { at, name: name || id, w, d, h, rotation: (angle * 180) / Math.PI, elevation: cm(e, "elevation"), mirror: e.attrs.modelMirrored === "true", light: e.name === "light" };
    if (Object.prototype.hasOwnProperty.call(CATALOG, id)) piece.type = CATALOG[id];
    f.furniture.push(piece);
  };
  for (const e of home.children) visit(e);

  const drawings = of("label").length + of("dimensionLine").length + of("polyline").length;
  if (drawings) left.push(t("editor.import.labelsDimensionLinesAnd"));

  // the plan's thicknesses: walls with a room on one side are outside walls
  const median = (v: number[]) => (v.length ? v.sort((x, y) => x - y)[Math.floor(v.length / 2)] : null);
  const compass = of("compass")[0];
  const north = compass ? ((360 - (num(compass, "northDirection") * 180) / Math.PI) % 360 + 360) % 360 : 0;
  return {
    roomsAt: "centre",
    wallExterior: median(pieces.filter((w) => w.sides.size === 1).map((w) => w.thickness)),
    wallInterior: median(pieces.filter((w) => w.sides.size === 2).map((w) => w.thickness)),
    north: Math.abs(north) > 0.05 && Math.abs(north - 360) > 0.05 ? Math.round(north * 10) / 10 : null,
    floors,
    left,
  };
}

/** A wall's centre line: straight, or a curve as points at most ARC_STEP apart (Sweet Home 3D's arc). */
export function arcPoints(a: Vec2, b: Vec2, extent: number): Vec2[] {
  const chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (Math.abs(extent) < 0.01 || chord < 1e-6) return [a, b];
  const tilt = Math.abs(extent) > Math.PI ? -(Math.PI + extent) / 2 : (Math.PI - extent) / 2;
  const off = (-Math.tan(tilt) * chord) / 2;
  const dir = Math.atan2(a[0] - b[0], b[1] - a[1]);
  const c: Vec2 = [(a[0] + b[0]) / 2 + off * Math.cos(dir), (a[1] + b[1]) / 2 + off * Math.sin(dir)];
  const radius = Math.hypot(a[0] - c[0], a[1] - c[1]);
  const start = Math.atan2(a[1] - c[1], a[0] - c[0]);
  // the way round from a to b that sweeps the arc's angle
  let sweep = Math.atan2(b[1] - c[1], b[0] - c[0]) - start;
  sweep = ((sweep % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (Math.abs(sweep - 2 * Math.PI - extent) < Math.abs(sweep - extent)) sweep -= 2 * Math.PI;
  const n = Math.max(1, Math.ceil(Math.abs(sweep) / ARC_STEP));
  const pts: Vec2[] = [a];
  for (let i = 1; i < n; i++) pts.push([c[0] + radius * Math.cos(start + (sweep * i) / n), c[1] + radius * Math.sin(start + (sweep * i) / n)]);
  pts.push(b);
  return pts;
}

/**
 * The walls along edge i of a room, as runs from `from` metres along the edge, each with how far
 * out its middle is (`s`). Marks the stretch of each wall the edge runs along.
 */
function wallRuns(pts: Vec2[], i: number, walls: WallPiece[]): { from: number; s: number }[] {
  const p = pts[i];
  const q = pts[(i + 1) % pts.length];
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  if (len < 0.02) return [];
  const u = norm(sub(q, p));
  const n = outwardNormal(pts, i);
  const found: { lo: number; hi: number; s: number }[] = [];
  for (const w of walls) {
    const wl = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
    if (wl < 0.01) continue;
    const wu = norm(sub(w.b, w.a));
    if (Math.abs(cross(u, wu)) > 0.09) continue;
    const s = (dot(sub(w.a, p), n) + dot(sub(w.b, p), n)) / 2;
    if (!(Math.abs(s) <= 0.02 || (s > 0 && Math.abs(s - w.thickness / 2) <= Math.max(0.03, w.thickness / 4)))) continue;
    const [t0, t1] = [dot(sub(w.a, p), u), dot(sub(w.b, p), u)].sort((x, y) => x - y);
    const lo = Math.max(0, t0);
    const hi = Math.min(len, t1);
    if (hi - lo < 0.05) continue;
    found.push({ lo, hi, s });
    // the same stretch measured along the wall
    const wa = dot(sub([p[0] + u[0] * lo, p[1] + u[1] * lo], w.a), wu);
    const wb = dot(sub([p[0] + u[0] * hi, p[1] + u[1] * hi], w.a), wu);
    w.used.push([Math.min(wa, wb), Math.max(wa, wb)]);
    w.sides.add(Math.sign(dot(n, [-wu[1], wu[0]])));
  }
  // runs of walls the same distance out; a run starts halfway between it and the one before
  found.sort((x, y) => x.lo - y.lo);
  const runs: { from: number; s: number; hi: number }[] = [];
  for (const m of found) {
    const last = runs[runs.length - 1];
    if (last && Math.abs(last.s - m.s) < 0.01) last.hi = Math.max(last.hi, m.hi);
    else if (!last || m.hi > last.hi + 0.05) runs.push({ from: last ? Math.max(0.02, Math.min(len - 0.02, (last.hi + m.lo) / 2)) : 0, s: m.s, hi: m.hi });
  }
  return runs;
}

/** A door or window, from its model's size, the part of it in the wall, and its sashes. */
function opening(e: XmlElement, at: Vec2, angle: number, w: number, d: number, h: number, elevation: number, name: string, id: string): DraftOpening {
  const f = (k: string, dflt: number) => (Number.isFinite(parseFloat(e.attrs[k])) ? parseFloat(e.attrs[k]) : dflt);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const place = (lx: number, ly: number): Vec2 => [at[0] + c * lx - s * ly, at[1] + s * lx + c * ly];
  const inWall = -d / 2 + d * (f("wallDistance", 0) + f("wallThickness", 1) / 2);
  const text = plain(`${name} ${id}`);
  const sashes = e.children.filter((x) => x.name === "sash");
  let kind: OpeningKind;
  if (/garage|roller door|up.?and.?over|sectional door/.test(text)) kind = "garage";
  else if (/door|french ?window|patio|porte|\btur\b|puerta|porta|deur/.test(text)) kind = "door";
  else if (/window|fenetre|fenster|ventana|finestra|raam|velux|skylight/.test(text)) kind = "window";
  else kind = elevation < 0.25 && h > 1.8 ? "door" : "window";
  if (kind === "door" && !sashes.length && /frame|opening|arch|doorway|passage|ouverture|durchgang/.test(text)) kind = "passage";
  let style: DraftOpening["style"];
  if (kind === "door") style = /slid/.test(text) ? "sliding" : /french|double/.test(text) && w > 1.2 ? "french" : /french|glass|glazed|patio/.test(text) ? "glazed" : undefined;
  if (kind === "window") style = /double.?hung|sash/.test(text) ? "sash" : /slid/.test(text) ? "sliding" : /fixed|round|triangle/.test(text) ? "fixed" : undefined;
  const o: DraftOpening = {
    at: place(0, inWall), along: [c, s], width: w * f("wallWidth", 1), height: h, sill: elevation, kind, style, label: name || id || undefined,
  };
  // a sash turns about its axis from one angle to another: the side it sweeps is where it opens
  const mirror = e.attrs.modelMirrored === "true" ? -1 : 1;
  const sash = sashes[0];
  const side = sash ? pickSide(parseFloat(sash.attrs.startAngle), parseFloat(sash.attrs.endAngle)) : 1;
  if (kind !== "passage" && (kind !== "window" || sash)) o.opens = [-s * side, c * side];
  if ((kind === "door" && sashes.length <= 1) || (kind === "window" && sashes.length === 1)) {
    const x = sash ? parseFloat(sash.attrs.xAxis) * w - w / 2 : -w / 2;
    o.hinge = place(mirror * (Number.isFinite(x) ? x : -w / 2), inWall);
  }
  return o;
}

/** Which way (+1 the model's front, -1 its back) a sash swinging from `start` to `end` opens. */
function pickSide(start: number, end: number): number {
  // its direction at an angle, on a plan whose y runs down: (cos a, -sin a)
  const ys = [start, end].map((a) => -Math.sin(Number.isFinite(a) ? a : 0));
  const y = Math.abs(ys[0]) > Math.abs(ys[1]) ? ys[0] : ys[1];
  return y < 0 ? -1 : 1;
}
