// What moves with its entity besides doors and windows: blinds over windows (venetian blinds with
// their slats at the blind's tilt), roof window blinds, gates that open (swinging or sliding) and
// awnings that run out. The viewer loads this only for a plan that has any (build.ts hasMoving).
// They are drawn into the floor's mesh of moving parts, again only while one of them moves: a
// cover that says where it is eases there, one that only says it is opening or closing travels
// there at an even pace, and with reduced motion each jumps.
import type { HassEntity } from "../live/hass";
import type { FenceGate, Furniture, RoofItem } from "../model/plan";
import { pointInPolygon } from "../model/geom";
import { addParts, lin, type FloorBuild, type MoverInfo, type WindowInfo } from "./build";
import { fencePaint, type FencePiece } from "./fences";
import type { Part } from "./furniture-lib";
import type { Geo, V3 } from "./geo";
import type { Palette } from "./palette";
import { itemFrame, type RoofModel } from "./roofs";

/** One movement: where it is drawn (0 shut .. 1 open), where its entity says it is, and which way it goes. */
export interface Channel {
  pos: number;
  /** Where the entity says it is; null when it doesn't say. */
  at: number | null;
  /** Opening (1), closing (-1), or neither (0). */
  going: number;
  /** How much of the way it travels a second while its entity says only that it is opening or closing. */
  speed: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * What a cover, lock, switch or contact sensor says: how far open it is (null when it doesn't say, or
 * is unavailable) and whether it is opening or closing.
 */
export function reading(s: HassEntity | undefined): { at: number | null; going: number } {
  if (!s || s.state === "unavailable" || s.state === "unknown") return { at: null, going: 0 };
  const p = s.attributes.current_position;
  const at = typeof p === "number" ? clamp01(p / 100) : null;
  switch (s.state) {
    case "opening":
    case "unlocking":
      return { at, going: 1 };
    case "closing":
    case "locking":
      return { at, going: -1 };
    case "open":
    case "on":
    case "unlocked":
      return { at: at ?? 1, going: 0 };
    case "closed":
    case "off":
    case "locked":
      return { at: at ?? 0, going: 0 };
  }
  return { at, going: 0 };
}

/** A venetian blind's tilt (0 slats shut .. 1 level), or null for a blind without one. */
export function tiltOf(s: HassEntity | undefined): number | null {
  const t = s?.attributes.current_tilt_position;
  return typeof t === "number" ? clamp01(t / 100) : null;
}

/** Where a movement is going now. */
export function goal(c: Channel): number {
  return c.going ? (c.going > 0 ? 1 : 0) : c.at ?? c.pos;
}

/**
 * Moves a channel on by dt seconds; true when it moved. Opening or closing, it travels at its speed,
 * keeping up with a position that runs ahead; otherwise it eases to where its entity says.
 */
export function advance(c: Channel, dt: number, calm: boolean): boolean {
  const to = goal(c);
  let next: number;
  if (calm) next = to;
  else if (c.going) {
    next = c.pos + c.going * c.speed * dt;
    if (c.at !== null && (c.at - next) * c.going > 0) next += (c.at - next) * Math.min(1, dt * 2.5);
    next = c.going > 0 ? Math.min(1, next) : Math.max(0, next);
  } else {
    const d = to - c.pos;
    next = Math.abs(d) < 0.002 ? to : c.pos + d * Math.min(1, dt * 2.5);
  }
  if (next === c.pos) return false;
  c.pos = next;
  return true;
}

/** Where a gate's leaf is with the gate `open` (0..1): swung a quarter turn about its hinges, or slid along the fence. */
export function leafAt(leaf: FencePiece, gate: Pick<FenceGate, "kind" | "swing">, open: number): Furniture {
  const it = leaf.item;
  const r = (it.rotation * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const hx = leaf.hinge ?? -it.w / 2;
  const side = gate.swing === "back" ? -1 : 1;
  if (gate.kind === "slide") {
    // out past its post first, then along the fence towards the side its hinges would be on
    const along = Math.sign(hx) * open * (it.w + 0.05);
    const out = side * ((leaf.post ?? 0.12) / 2 + 0.06) * Math.min(1, open * 10);
    return { ...it, x: it.x + c * along - s * out, z: it.z + s * along + c * out };
  }
  const ra = r + (hx < 0 ? 1 : -1) * side * open * (Math.PI / 2);
  const ca = Math.cos(ra), sa = Math.sin(ra);
  return { ...it, rotation: (ra * 180) / Math.PI, x: it.x + c * hx - ca * hx, z: it.z + s * hx - sa * hx };
}

const box = (x: number, y: number, z: number, w: number, h: number, d: number, role: Part["role"], shear?: number): Part => ({ shape: "box", x, y, z, w, h, d, role, shear });

/**
 * An awning's moving parts, run out `ext` (0 in its cassette .. 1 all the way): the fabric sloping
 * from the cassette to the front bar, the arms under it, the front bar and its valance. Like its
 * cassette (scene/garden.ts) its back is at -d/2, its top at h.
 */
export function awningParts(w: number, d: number, h: number, ext: number): Part[] {
  const z0 = -d / 2 + 0.16, y0 = h - 0.12;
  const run = Math.max(0, d - 0.24) * ext, fall = Math.max(0, h - 0.36) * ext;
  const z1 = z0 + run, y1 = y0 - fall;
  const out = [box(0, y1 - 0.08, z1 + 0.04, w, 0.08, 0.08, "metal")];
  if (run > 0.02) {
    const sh = -fall / run, mz = (z0 + z1) / 2, my = (y0 + y1) / 2;
    out.push(box(0, my - 0.01, mz, w - 0.04, 0.01, run, "canvas", sh));
    for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) out.push(box(x, my - 0.06, mz, 0.04, 0.035, run, "metal", sh));
    out.push(box(0, y1 - 0.24, z1 + 0.078, w, 0.16, 0.006, "canvas"));
  }
  return out;
}

/** A venetian blind's slat, seen from its end: its two edges (out from the wall's middle, up), and which way its top faces. */
export function slat(y: number, out: number, depth: number, tilt: number): { a: [number, number]; b: [number, number]; up: [number, number] } {
  // level when the blind is tilted open, nearly upright (each over the next) when shut
  const th = (1 - tilt) * 1.4;
  const dn = (Math.cos(th) * depth) / 2, dy = (Math.sin(th) * depth) / 2;
  return { a: [out + dn, y - dy], b: [out - dn, y + dy], up: [Math.sin(th), Math.cos(th)] };
}

type Mover =
  | { kind: "blind"; key: string; entity: string; open: Channel; tilt: Channel | null; win: WindowInfo }
  | { kind: "roof"; key: string; entity: string; open: Channel; tilt: null; model: RoofModel; it: RoofItem; room: number }
  | { kind: "gate"; key: string; entity: string | null; open: Channel; tilt: null; info: MoverInfo }
  | { kind: "awning"; key: string; entity: string | null; open: Channel; tilt: null; info: MoverInfo };

const channel = (pos: number, speed: number): Channel => ({ pos, at: null, going: 0, speed });

/** A floor's moving parts and where each is. */
export class Moving {
  private list: Mover[] = [];
  private fresh = new Set<string>();
  /** It has roof window blinds (drawn only while the roofs show). */
  readonly roofs: boolean;
  /** Whether the roofs showed when last drawn. */
  roofsShown = false;

  constructor(private fb: FloorBuild, prev: Moving | null) {
    const list = this.list;
    for (const w of fb.windows) {
      // up unless told otherwise; a roller blind takes about 15 s
      if (w.opening.cover) list.push({ kind: "blind", key: `w${w.opening.id}`, entity: w.opening.cover, open: channel(1, 1 / 15), tilt: null, win: w });
    }
    for (const model of fb.roofs) {
      for (const it of model.roof.items ?? []) {
        if (it.kind !== "window" || !it.cover) continue;
        const room = fb.floor.rooms.findIndex((r) => pointInPolygon([it.x, it.z], r.points));
        list.push({ kind: "roof", key: `r${it.id}`, entity: it.cover, open: channel(1, 1 / 15), tilt: null, model, it, room });
      }
    }
    for (const info of fb.movers) {
      // a gate takes about 15 s, an awning 10; an awning without a cover is drawn out
      if (info.leaves) list.push({ kind: "gate", key: `g${info.fence!.id}:${info.gate}`, entity: info.entity, open: channel(0, 1 / 15), tilt: null, info });
      else list.push({ kind: "awning", key: `a${info.furniture!.id}`, entity: info.entity, open: channel(info.entity ? 0 : 1, 1 / 10), tilt: null, info });
    }
    this.roofs = list.some((m) => m.kind === "roof");
    const before = new Map(prev?.list.map((m) => [m.key, m]) ?? []);
    for (const m of list) {
      const old = before.get(m.key);
      if (old && old.entity === m.entity) {
        m.open = old.open;
        if (m.kind === "blind" && old.kind === "blind") m.tilt = old.tilt;
      } else this.fresh.add(m.key);
    }
  }

  get count(): number {
    return this.list.length;
  }

  /**
   * Reads where each should be from its entity's state; true when something has to be drawn again
   * (a movement to make, a blind that took or lost its tilt). New ones start where they are.
   */
  retarget(state: (id: string) => HassEntity | undefined, calm: boolean): boolean {
    let redraw = false;
    for (const m of this.list) {
      const s = m.entity ? state(m.entity) : undefined;
      const r = m.entity ? reading(s) : { at: 1, going: 0 };
      m.open.at = r.at;
      m.open.going = r.going;
      if (m.kind === "blind") {
        const t = tiltOf(s);
        if ((t === null) !== !m.tilt) redraw = true;
        if (t === null) m.tilt = null;
        else (m.tilt ??= channel(t, 0)).at = t;
      }
      if (this.fresh.has(m.key) && (s || !m.entity)) {
        this.fresh.delete(m.key);
        // opening or closing without saying where: from the end it left
        m.open.pos = r.at ?? (r.going > 0 ? 0 : r.going < 0 ? 1 : m.open.pos);
        if (m.tilt) m.tilt.pos = goal(m.tilt);
        redraw = true;
      }
      if (calm) redraw = this.jump(m) || redraw;
      else if (goal(m.open) !== m.open.pos || (m.tilt && goal(m.tilt) !== m.tilt.pos)) redraw = true;
    }
    return redraw;
  }

  private jump(m: Mover): boolean {
    const a = advance(m.open, 0, true);
    return (m.tilt ? advance(m.tilt, 0, true) : false) || a;
  }

  /** Moves each on by dt seconds; true while something moved. */
  step(dt: number, calm: boolean): boolean {
    let moved = false;
    for (const m of this.list) {
      if (advance(m.open, dt, calm)) moved = true;
      if (m.tilt && advance(m.tilt, dt, calm)) moved = true;
    }
    return moved;
  }

  /** Draws them where they are into the moving parts' meshes; roof window blinds only while the roofs show. */
  draw(g: Geo, glass: Geo, pal: Palette, low: boolean, roofs: boolean): void {
    this.roofsShown = roofs;
    const y0 = this.fb.floor.elevation;
    const fabric = lin(pal.roles.fabric);
    for (const m of this.list) {
      g.currentItem = glass.currentItem = -1;
      if (m.kind === "blind") {
        g.useSurface("blind");
        if (m.tilt) venetian(g, m.win, y0, m.open.pos, m.tilt.pos, lin(pal.roles.white), low);
        else rollerBlind(g, m.win, y0, m.open.pos, fabric);
      } else if (m.kind === "roof") {
        if (roofs) roofBlind(g, m.model, m.it, m.room, m.open.pos, fabric);
      } else if (m.kind === "gate") {
        const { info } = m;
        const gate = info.fence!.gates![info.gate!];
        const paint = fencePaint(info.fence!);
        g.currentItem = glass.currentItem = info.item;
        for (const leaf of info.leaves!) addParts(g, leaf.parts, leafAt(leaf, gate, m.open.pos), info.bottom, false, info.room, -1, pal, low, glass, paint);
      } else {
        const f = m.info.furniture!;
        g.currentItem = glass.currentItem = m.info.item;
        addParts(g, awningParts(f.w, f.d, f.h, m.open.pos), f, m.info.bottom, true, m.info.room, -1, pal, low, glass);
      }
    }
    g.currentItem = glass.currentItem = -1;
  }
}

/** A point by a window: s along it from its middle, `out` towards its room from the wall's middle, at height y. */
function by(w: WindowInfo, s: number, out: number, y: number): V3 {
  return [w.centre[0] + w.along[0] * s + w.normal[0] * out, y, w.centre[2] + w.along[1] * s + w.normal[1] * out];
}

/** A strip across a window between two points of its section (out, up), facing n and its back. */
function strip(g: Geo, w: WindowInfo, half: number, a: [number, number], b: [number, number], up: [number, number], col: V3): void {
  const slot = w.wallSlot >= 0 ? w.wallSlot * 2 : -1;
  const n: V3 = [w.normal[0] * up[0], up[1], w.normal[1] * up[0]];
  const back: V3 = [-n[0], -n[1], -n[2]];
  const p = [by(w, -half, a[0], a[1]), by(w, half, a[0], a[1]), by(w, half, b[0], b[1]), by(w, -half, b[0], b[1])];
  g.quad(p[0], p[1], p[2], p[3], n, col, w.room, slot, -1, 2, 1);
  g.quad(p[1], p[0], p[3], p[2], back, col, w.room, slot, -1, 2, 1);
}

/** A roller blind or curtain down to `open` (1 rolled up at the top). */
function rollerBlind(g: Geo, w: WindowInfo, y0: number, open: number, col: V3): void {
  const top = y0 + w.top + 0.06;
  const bot = y0 + w.top - (w.top - w.bottom) * (1 - open);
  strip(g, w, w.width / 2 + 0.06, [0.09, bot], [0.09, top], [1, 0], col);
}

/** A venetian blind down to `open`, its slats at `tilt`, under its head rail. */
function venetian(g: Geo, w: WindowInfo, y0: number, open: number, tilt: number, col: V3, low: boolean): void {
  const half = w.width / 2 + 0.03, top = y0 + w.top;
  const pitch = low ? 0.1 : 0.05;
  const n = Math.floor(((w.top - w.bottom) * (1 - open)) / pitch);
  for (let i = 0; i < n; i++) {
    const s = slat(top - pitch * (i + 0.5), 0.09, pitch * 1.15, tilt);
    strip(g, w, half, s.a, s.b, s.up, col);
  }
  // the head rail, with the slats drawn up under it
  strip(g, w, half, [0.12, top - 0.02 - (n ? 0 : 0.04)], [0.12, top + 0.04], [1, 0], col);
}

/** A roof window's blind, under its glass, drawn down from the top of the window to `open` (1 rolled up). */
function roofBlind(g: Geo, m: RoofModel, it: RoofItem, room: number, open: number, col: V3): void {
  const fr = itemFrame(m, it);
  if (!fr || open > 0.99) return;
  const conservation = it.style === "conservation";
  const bar = conservation ? 0.05 : 0.07;
  const c = (conservation ? 0.05 : 0.1) - 0.032;
  const w = it.w / 2 - bar, h = it.d / 2 - bar;
  const b0 = h - 2 * h * (1 - open);
  const P = (a: number, b: number): V3 => [0, 1, 2].map((k) => fr.c[k] + fr.e1[k] * a + fr.e2[k] * b + fr.n[k] * c) as V3;
  const back: V3 = [-fr.n[0], -fr.n[1], -fr.n[2]];
  g.useSurface("blind");
  g.quad(P(-w, b0), P(w, b0), P(w, h), P(-w, h), fr.n, col, room);
  g.quad(P(w, b0), P(-w, b0), P(-w, h), P(w, h), back, col, room);
}
