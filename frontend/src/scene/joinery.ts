// Doors and windows: the styles they come in and the parts they are made of. The fixed parts (a
// window's frame and board, a door's architraves) are built with the walls; the moving parts
// (door leaves, sashes, a garage door) are drawn again whenever they move, by the same functions,
// from how far open they are (0 closed .. 1 open).
import type { Opening, OpeningKind, Vec2 } from "../model/plan";
import { lin } from "./build";
import { JOINERY_FINISHES, parseHex, type FinishDef, type JoineryFinish } from "./finishes";
import type { Geo, V3 } from "./geo";
import { WALL_HANG } from "./materials";
import { inPalette, type Palette } from "./palette";

export const DOOR_STYLES = {
  flush: "Flush", panel: "Panelled", glazed: "Glazed", french: "French doors", sliding: "Sliding glass", barn: "Barn door",
} as const;
export const WINDOW_STYLES = {
  casement: "Casement", tilt: "Tilt and turn", awning: "Top-hung", sash: "Sliding sash", sliding: "Sliding", fixed: "Fixed",
} as const;
export const GARAGE_STYLES = { sectional: "Up and over", roller: "Roller", side: "Side-hinged" } as const;

export type DoorStyle = keyof typeof DOOR_STYLES;
export type WindowStyle = keyof typeof WINDOW_STYLES;
export type GarageStyle = keyof typeof GARAGE_STYLES;

/** The styles of a kind of opening, the usual one first; null for a plain opening. */
export function stylesFor(kind: OpeningKind): Record<string, string> | null {
  return kind === "door" ? DOOR_STYLES : kind === "window" ? WINDOW_STYLES : kind === "garage" ? GARAGE_STYLES : null;
}

export function styleOf(o: Opening): string {
  const list = stylesFor(o.kind);
  if (!list) return "";
  return o.style && o.style in list ? o.style : Object.keys(list)[0];
}

/** The finish a door or window has unless changed. */
export function defaultFinish(kind: OpeningKind): JoineryFinish {
  return kind === "window" ? "upvc" : "painted";
}

const HINGED = new Set(["flush", "panel", "glazed", "casement"]);
const SWINGS = new Set([...HINGED, "french", "side"]);
const SLIDES = new Set(["sliding", "barn"]);
const GLAZED_DOORS = new Set(["glazed", "french", "sliding"]);

/** Which of the editor's controls mean something for an opening. */
export function controlsFor(o: Opening): { hinge: boolean; swing: boolean; side: boolean; slide: boolean; bars: boolean } {
  const s = styleOf(o);
  return {
    hinge: HINGED.has(s) && (o.kind !== "window" || paneCount(o.width) === 1),
    swing: SWINGS.has(s),
    // a barn door hangs on one face of the wall, which `swing` picks: "in" is its own room's
    side: s === "barn",
    slide: SLIDES.has(s),
    bars: o.kind === "window" || GLAZED_DOORS.has(s),
  };
}

/** How far open it is drawn without a sensor: hinged doors stand ajar, so they read as doors. */
export function restOpen(o: Opening): number {
  return o.kind === "door" && SWINGS.has(styleOf(o)) ? 28 / 82 : 0;
}

/** Windows that follow a sensor are drawn with the moving parts; the others are built once, closed. */
export function windowFollowsSensor(o: Opening): boolean {
  return !!o.entity && styleOf(o) !== "fixed";
}

/** Casement-like windows are split into panes: one up to 1 m wide, two up to 2 m, else three. */
export function paneCount(width: number): number {
  return width <= 1.0 ? 1 : width <= 2.0 ? 2 : 3;
}

/** Where an opening is, as the builder found it on its wall. */
export interface OpeningInfo {
  opening: Opening;
  wallSlot: number;
  /** The room it belongs to (its moving parts are lit by that room's lamps). */
  room: number;
  /** Middle of the opening on the wall's centre line, at the storey's floor (world). */
  base: V3;
  /** Along the wall (from its start to its end), and into the opening's own room. */
  along: Vec2;
  inward: Vec2;
  width: number;
  bottom: number;
  top: number;
  /** Wall thickness and height. */
  depth: number;
  ceiling: number;
  /** The far side is a room too, not outdoors (architraves on both faces). */
  bothInside: boolean;
  /** Index into FloorBuild.items: tapping it in the editor selects it. */
  item: number;
}

/** A surface key and its colour. */
export interface Look {
  surf: string;
  col: V3;
}

export interface JoineryCtx {
  g: Geo;
  glass: Geo;
  pal: Palette;
  /** The leaf or frame. */
  look: Look;
  room: number;
  /** Wall slot value for the cutaway (-1: none). */
  ws: number;
  /** Glow slot of the glass (lit windows), or -1. */
  glow: number;
  /** Tablets: no handles. */
  low: boolean;
}

/** An opening's leaf or frame look: the picked colour on paintable finishes, else the finish's own. */
export function joineryLook(o: Opening, pal: Palette): Look {
  const name: JoineryFinish = o.finish && o.finish in JOINERY_FINISHES ? o.finish : defaultFinish(o.kind);
  const def: FinishDef = JOINERY_FINISHES[name];
  const surf = `jn:${name}`;
  const custom = def.tintable ? parseHex(o.color) : null;
  // plain white keeps the palette's white, like unpainted walls; doors a little warmer
  if (custom === null && (name === "painted" || name === "upvc")) {
    const w = lin(pal.roles.white);
    return { surf, col: o.kind === "window" ? w : [w[0] * 0.9, w[1] * 0.88, w[2] * 0.85] };
  }
  return { surf, col: lin(inPalette(pal, custom ?? def.color)) };
}

// -------------------------------------------------------------------- frames and boxes

/** A local frame: an origin and three unit axes (u along, v up, w across). */
interface Frame {
  o: V3;
  u: V3;
  v: V3;
  w: V3;
}

const UP: V3 = [0, 1, 0];
const neg = (a: V3): V3 => [-a[0], -a[1], -a[2]];
const comb = (a: V3, ka: number, b: V3, kb: number): V3 => [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];

function at(F: Frame, a: number, b: number, c: number): V3 {
  return [
    F.o[0] + F.u[0] * a + F.v[0] * b + F.w[0] * c,
    F.o[1] + F.u[1] * a + F.v[1] * b + F.w[1] * c,
    F.o[2] + F.u[2] * a + F.v[2] * b + F.w[2] * c,
  ];
}

function dir(F: Frame, a: number, b: number, c: number): V3 {
  return [F.u[0] * a + F.v[0] * b + F.w[0] * c, F.u[1] * a + F.v[1] * b + F.w[1] * c, F.u[2] * a + F.v[2] * b + F.w[2] * c];
}

/** The opening's frame: origin at its middle on the wall's centre line, u along the wall, w into its room. */
function frameOf(info: OpeningInfo): Frame {
  return { o: info.base, u: [info.along[0], 0, info.along[1]], v: UP, w: [info.inward[0], 0, info.inward[1]] };
}

/** The same axes from another origin. */
function moved(F: Frame, a: number, b: number, c: number): Frame {
  return { ...F, o: at(F, a, b, c) };
}

/** Turned about a vertical hinge at p: u starts along `along` and turns towards `toward` by `angle`. */
function hinged(p: V3, along: V3, toward: V3, angle: number): Frame {
  const c = Math.cos(angle), s = Math.sin(angle);
  return { o: p, u: comb(along, c, toward, s), v: UP, w: comb(toward, c, along, -s) };
}

/** Turned about F's u axis at a point: v leans towards w by `angle`. */
function tilted(F: Frame, a: number, b: number, c: number, angle: number): Frame {
  const co = Math.cos(angle), s = Math.sin(angle);
  return { o: at(F, a, b, c), u: F.u, v: comb(F.v, co, F.w, s), w: comb(F.w, co, F.v, -s) };
}

/** Turned within F's u-v plane at a point (a diagonal brace). */
function turnedUV(F: Frame, a: number, b: number, c: number, angle: number): Frame {
  const co = Math.cos(angle), s = Math.sin(angle);
  return { o: at(F, a, b, c), u: comb(F.u, co, F.v, s), v: comb(F.v, co, F.u, -s), w: F.w };
}

// faces of a box, for leaving out the ones that are never seen
const PU = 1, NU = 2, PV = 4, NV = 8, PW = 16, NW = 32, ALL = 63;

/** A box over [u0,u1] x [v0,v1] x [w0,w1] of a frame. `nv` splits the big faces for the lighting grid. */
function box(c: JoineryCtx, F: Frame, u0: number, u1: number, v0: number, v1: number, w0: number, w1: number, look: Look, mask = ALL, nv = 1): void {
  if (u0 > u1) [u0, u1] = [u1, u0];
  if (v0 > v1) [v0, v1] = [v1, v0];
  if (w0 > w1) [w0, w1] = [w1, w0];
  if (u1 - u0 < 1e-4 || v1 - v0 < 1e-4) return;
  const g = c.g;
  g.useSurface(look.surf);
  const P = (a: number, b: number, d: number) => at(F, a, b, d);
  const q = (p0: V3, p1: V3, p2: V3, p3: V3, n: V3, k = 1) => g.quad(p0, p1, p2, p3, n, look.col, c.room, c.ws, -1, 1, k);
  if (mask & PW) q(P(u0, v0, w1), P(u1, v0, w1), P(u1, v1, w1), P(u0, v1, w1), dir(F, 0, 0, 1), nv);
  if (mask & NW) q(P(u1, v0, w0), P(u0, v0, w0), P(u0, v1, w0), P(u1, v1, w0), dir(F, 0, 0, -1), nv);
  if (mask & PV) q(P(u0, v1, w1), P(u1, v1, w1), P(u1, v1, w0), P(u0, v1, w0), dir(F, 0, 1, 0));
  if (mask & NV) q(P(u0, v0, w0), P(u1, v0, w0), P(u1, v0, w1), P(u0, v0, w1), dir(F, 0, -1, 0));
  if (mask & PU) q(P(u1, v0, w1), P(u1, v0, w0), P(u1, v1, w0), P(u1, v1, w1), dir(F, 1, 0, 0), nv);
  if (mask & NU) q(P(u0, v0, w0), P(u0, v0, w1), P(u0, v1, w1), P(u0, v1, w0), dir(F, -1, 0, 0), nv);
}

/** Parts high above the floor drop out of sight when their wall is cut, instead of lying flat at the cut. */
function hung(c: JoineryCtx, bottom: number): JoineryCtx {
  return bottom >= 1.5 && c.ws >= 0 ? { ...c, ws: c.ws + WALL_HANG } : c;
}

const shade = (l: Look, k: number): Look => ({ surf: l.surf, col: [l.col[0] * k, l.col[1] * k, l.col[2] * k] });

/** Glass over a rectangle of a frame at depth w, with glazing bars if asked. */
function pane(c: JoineryCtx, F: Frame, u0: number, u1: number, v0: number, v1: number, w: number, bars: boolean): void {
  if (u1 - u0 < 0.01 || v1 - v0 < 0.01) return;
  c.glass.quad(at(F, u0, v0, w), at(F, u1, v0, w), at(F, u1, v1, w), at(F, u0, v1, w), dir(F, 0, 0, 1), lin(c.pal.glass), c.room, c.ws, c.glow);
  if (!bars) return;
  // a Georgian grid: panes of about 30 x 32 cm
  const cols = Math.max(1, Math.round((u1 - u0) / 0.3));
  const rows = Math.max(1, Math.round((v1 - v0) / 0.32));
  const b = 0.009, d = 0.012;
  for (let i = 1; i < cols; i++) {
    const u = u0 + ((u1 - u0) * i) / cols;
    box(c, F, u - b, u + b, v0, v1, w - d, w + d, c.look, PU | NU | PW | NW);
  }
  for (let j = 1; j < rows; j++) {
    const v = v0 + ((v1 - v0) * j) / rows;
    box(c, F, u0, u1, v - b, v + b, w - d, w + d, c.look, PV | NV | PW | NW);
  }
}

/** A sash: four members around glass, over u 0..L, v 0..H, w w0..w0 + sd of its frame. */
function sash(c: JoineryCtx, S: Frame, L: number, H: number, w0: number, sd: number, sw: number, bars: boolean): void {
  const w1 = w0 + sd;
  box(c, S, 0, sw, 0, H, w0, w1, c.look);
  box(c, S, L - sw, L, 0, H, w0, w1, c.look);
  box(c, S, sw, L - sw, 0, sw, w0, w1, c.look, PV | NV | PW | NW);
  box(c, S, sw, L - sw, H - sw, H, w0, w1, c.look, PV | NV | PW | NW);
  pane(c, S, sw, L - sw, sw, H - sw, (w0 + w1) / 2, bars);
}

// -------------------------------------------------------------------- windows

const FW = 0.05; // outer frame members
const FD = 0.035; // half the frame's depth
const SW = 0.045; // sash members
const SD = 0.05; // sash depth
const CASEMENT = (70 * Math.PI) / 180;
const TILT = (12 * Math.PI) / 180;
const AWNING = (30 * Math.PI) / 180;

interface Cell {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  opens: boolean;
  /** Hinge at u0 (-1) or u1 (+1). */
  hinge: -1 | 1;
}

function windowCells(o: Opening, style: string, W: number, b: number, t: number): Cell[] {
  const v0 = b + FW, v1 = t - FW;
  const i0 = -W / 2 + FW, i1 = W / 2 - FW;
  if (style === "sash" || style === "sliding") return [{ u0: i0, u1: i1, v0, v1, opens: true, hinge: -1 }];
  const n = paneCount(W);
  const cw = (i1 - i0 - (n - 1) * FW) / n;
  return Array.from({ length: n }, (_, i) => ({
    u0: i0 + i * (cw + FW), u1: i0 + i * (cw + FW) + cw, v0, v1,
    // a three-pane window opens at the sides only
    opens: style !== "fixed" && !(n === 3 && i === 1),
    hinge: (n === 1 ? ((o.hinge ?? "left") === "left" ? -1 : 1) : i < n / 2 ? -1 : 1) as -1 | 1,
  }));
}

function windowFixed(c: JoineryCtx, F: Frame, info: OpeningInfo, style: string): void {
  const o = info.opening, W = info.width, b = info.bottom, t = info.top;
  const L = c.look;
  box(c, F, -W / 2, -W / 2 + FW, b, t, -FD, FD, L, ALL & ~NU);
  box(c, F, W / 2 - FW, W / 2, b, t, -FD, FD, L, ALL & ~PU);
  box(c, F, -W / 2 + FW, W / 2 - FW, b, b + FW, -FD, FD, L, PV | PW | NW);
  box(c, F, -W / 2 + FW, W / 2 - FW, t - FW, t, -FD, FD, L, NV | PW | NW);
  const cells = windowCells(o, style, W, b, t);
  for (let i = 1; i < cells.length; i++) box(c, F, cells[i - 1].u1, cells[i].u0, b + FW, t - FW, -FD, FD, L, PW | NW);
  for (const cell of cells) if (!cell.opens) pane(c, F, cell.u0, cell.u1, cell.v0, cell.v1, 0, !!o.bars);
  const cell = cells[0];
  const H = cell.v1 - cell.v0;
  if (style === "sash") sash(c, moved(F, cell.u0, cell.v1 - (H / 2 + 0.02), 0), cell.u1 - cell.u0, H / 2 + 0.02, -0.032, 0.03, 0.04, !!o.bars);
  if (style === "sliding") slider(c, F, cell, (o.hinge ?? "left") === "left", 0, false, !!o.bars);
  // the window board inside
  if (b > 0.25) {
    const board: Look = { surf: "jn:painted", col: lin(c.pal.roles.white) };
    // its top stands 3 mm proud of the wall's sill: level with it, the two would flicker
    box(c, F, -W / 2 - 0.04, W / 2 + 0.04, b - 0.022, b + 0.003, FD, info.depth / 2 + 0.03, board, ALL & ~NW);
  }
}

function windowMoving(c: JoineryCtx, F: Frame, info: OpeningInfo, style: string, open: number): void {
  const o = info.opening;
  const bars = !!o.bars;
  const cells = windowCells(o, style, info.width, info.bottom, info.top);
  if (style === "fixed") return;
  if (style === "sliding") {
    slider(c, F, cells[0], (o.hinge ?? "left") === "left", open, true, bars);
    return;
  }
  if (style === "sash") {
    // the lower sash slides up behind the upper one
    const cell = cells[0];
    const H = cell.v1 - cell.v0, hs = H / 2 + 0.02;
    sash(c, moved(F, cell.u0, cell.v0 + open * (H - hs) * 0.92, 0), cell.u1 - cell.u0, hs, 0.002, 0.03, 0.04, bars);
    return;
  }
  for (const cell of cells) {
    if (!cell.opens) continue;
    const L = cell.u1 - cell.u0, H = cell.v1 - cell.v0;
    if (style === "tilt") {
      // tilts into the room from the bottom
      sash(c, tilted(F, cell.u0, cell.v0, SD / 2, open * TILT), L, H, -SD, SD, SW, bars);
    } else if (style === "awning") {
      // hinged at the top, the bottom swings out
      const T = tilted(F, cell.u0, cell.v1, -SD / 2, open * AWNING);
      sash(c, { ...T, v: neg(T.v) }, L, H, 0, SD, SW, bars);
    } else {
      const side = o.swing === "out" ? -1 : 1;
      const p = at(F, cell.hinge < 0 ? cell.u0 : cell.u1, cell.v0, (side * SD) / 2);
      const S = hinged(p, cell.hinge < 0 ? F.u : neg(F.u), side > 0 ? F.w : neg(F.w), open * CASEMENT);
      sash(c, S, L, H, -SD, SD, SW, bars);
    }
  }
}

/** Two panes on two tracks: the fixed one outside, the moving one inside slides over it. */
function slider(c: JoineryCtx, F: Frame, cell: { u0: number; u1: number; v0: number; v1: number }, fromLeft: boolean, open: number, moving: boolean, bars: boolean, sw = SW): void {
  const span = cell.u1 - cell.u0;
  const pw = span / 2 + 0.025;
  const H = cell.v1 - cell.v0;
  if (!moving) {
    sash(c, moved(F, fromLeft ? cell.u1 - pw : cell.u0, cell.v0, 0), pw, H, -0.032, 0.03, sw, bars);
    return;
  }
  const travel = (span - pw) * 0.95 * open;
  sash(c, moved(F, fromLeft ? cell.u0 + travel : cell.u1 - pw - travel, cell.v0, 0), pw, H, 0.002, 0.03, sw, bars);
}

// -------------------------------------------------------------------- doors

const LT = 0.04; // leaf thickness
const GAP = 0.004; // round a closed leaf
const STOP = 0.012, STOP_D = 0.025; // a door stop: how far it stands out of the reveal, and how deep it is
const DOOR_ANGLE = (82 * Math.PI) / 180;
const DFW = 0.06; // frame of a sliding glass door

function doorFixed(c: JoineryCtx, F: Frame, info: OpeningInfo, style: string): void {
  const W = info.width, H = info.top;
  if (style === "sliding") {
    const d = 0.04;
    box(c, F, -W / 2, -W / 2 + DFW, 0, H, -d, d, c.look, ALL & ~NU);
    box(c, F, W / 2 - DFW, W / 2, 0, H, -d, d, c.look, ALL & ~PU);
    box(c, F, -W / 2 + DFW, W / 2 - DFW, H - DFW, H, -d, d, c.look, NV | PW | NW);
    box(c, F, -W / 2 + DFW, W / 2 - DFW, 0, 0.02, -d, d, c.look, PV | PW | NW);
    slider(c, F, slidingCell(W, H), (info.opening.hinge ?? "left") === "left", 0, false, !!info.opening.bars, DFW);
    return;
  }
  // architraves on the faces that are indoors
  const aw = 0.065, ad = 0.014;
  const top = Math.max(0, Math.min(aw, info.ceiling - H - 0.005));
  for (const s of info.bothInside ? [1, -1] : [1]) {
    const w0 = (s * info.depth) / 2, w1 = s * (info.depth / 2 + ad);
    const back = s > 0 ? NW : PW;
    box(c, F, -W / 2 - aw, -W / 2, 0, H + top, w0, w1, c.look, ALL & ~back & ~NV);
    box(c, F, W / 2, W / 2 + aw, 0, H + top, w0, w1, c.look, ALL & ~back & ~NV);
    if (top > 0.005) box(hung(c, H), F, -W / 2, W / 2, H, H + top, w0, w1, c.look, (s > 0 ? PW : NW) | PV | NV);
  }
  // a stop round the opening, just behind the closed leaf, so the gap round it doesn't show through
  if (SWINGS.has(style)) {
    const side = info.opening.swing === "out" ? -1 : 1;
    const w0 = (side * info.depth) / 2 - side * (LT / 2 + 0.001), w1 = w0 - side * STOP_D;
    box(c, F, -W / 2, -W / 2 + STOP, 0, H, w0, w1, c.look, ALL & ~NU & ~NV & ~PV);
    box(c, F, W / 2 - STOP, W / 2, 0, H, w0, w1, c.look, ALL & ~PU & ~NV & ~PV);
    box(hung(c, H - STOP), F, -W / 2 + STOP, W / 2 - STOP, H - STOP, H, w0, w1, c.look, PW | NW | NV);
  }
}

function slidingCell(W: number, H: number) {
  return { u0: -W / 2 + DFW, u1: W / 2 - DFW, v0: 0.02, v1: H - DFW };
}

function doorMoving(c: JoineryCtx, F: Frame, info: OpeningInfo, style: string, open: number): void {
  const o = info.opening, W = info.width, H = info.top;
  const bars = !!o.bars;
  const side = o.swing === "out" ? -1 : 1;
  // a leaf sits on the face of the wall it swings away from
  const face = (side * info.depth) / 2;
  const toward = side > 0 ? F.w : neg(F.w);
  const angle = open * DOOR_ANGLE;
  if (style === "sliding") {
    slider(c, F, slidingCell(W, H), (o.hinge ?? "left") === "left", open, true, bars, DFW);
  } else if (style === "barn") {
    barn(c, F, info, open);
  } else if (style === "french") {
    const L = (W - GAP) / 2;
    leaf(c, hinged(at(F, -W / 2, 0, face), F.u, toward, angle), L, H - GAP, "french", bars);
    leaf(c, hinged(at(F, W / 2, 0, face), neg(F.u), toward, angle), L, H - GAP, "french", bars);
  } else {
    const atStart = (o.hinge ?? "left") === "left";
    const S = hinged(at(F, atStart ? -W / 2 : W / 2, 0, face), atStart ? F.u : neg(F.u), toward, angle);
    leaf(c, S, W - GAP, H - GAP, style, bars);
  }
}

/** A hinged leaf over u 0..L (from the hinge), v 0..H, centred on w = 0. */
function leaf(c: JoineryCtx, S: Frame, L: number, H: number, style: string, bars: boolean, handle = true): void {
  const t = LT / 2;
  // the handle about a metre up; a panelled door's middle rail and a half-glazed door's solid part are there for it
  const hv = Math.min(1.0, H * 0.48);
  let stile = 0;
  if (style === "glazed" || style === "french") {
    stile = style === "french" ? 0.1 : 0.11;
    const low = style === "french" ? 0.35 : Math.min(H * 0.55, hv + 0.12);
    box(c, S, 0, L, 0, low, -t, t, c.look, ALL & ~NV);
    box(c, S, 0, stile, low, H, -t, t, c.look, ALL & ~NV);
    box(c, S, L - stile, L, low, H, -t, t, c.look, ALL & ~NV);
    box(c, S, stile, L - stile, H - stile, H, -t, t, c.look, PV | NV | PW | NW);
    pane(c, S, stile, L - stile, low, H - stile, 0, bars);
    // a half-glazed door's handle is on its solid part
    if (style === "glazed") stile = 0;
  } else {
    box(c, S, 0, L, 0, H, -t, t, c.look, ALL & ~NV, 2);
    if (style === "panel") panels(c, S, L, H, t, hv);
  }
  if (handle && !c.low) handles(c, S, L, t, hv, stile);
}

/**
 * A lever handle on each face, near the free edge, pointing towards the hinge: on a square rose,
 * or on a glass door's stile, a slim upright plate with a shorter lever.
 */
function handles(c: JoineryCtx, S: Frame, L: number, t: number, hv: number, stile: number): void {
  // where its wall is cut, a door ends just above the handle, which would look like it sat at the top: it hides instead
  if (c.ws >= 0) c = { ...c, ws: c.ws + WALL_HANG };
  const metal: Look = { surf: "role:metal", col: lin(c.pal.roles.metal) };
  const u = stile ? L - stile / 2 : L - 0.065;
  const pw = stile ? Math.min(0.032, stile - 0.03) : 0.05;
  const ph = stile ? 0.2 : 0.05;
  const lever = stile ? 0.09 : 0.12;
  for (const s of [1, -1]) {
    const back = s > 0 ? NW : PW;
    box(c, S, u - pw / 2, u + pw / 2, hv - ph / 2, hv + ph / 2, s * t, s * (t + 0.008), metal, ALL & ~back);
    box(c, S, u - 0.008, u + 0.008, hv - 0.008, hv + 0.008, s * (t + 0.008), s * (t + 0.045), metal, ALL & ~back);
    box(c, S, u - lever, u + 0.012, hv - 0.009, hv + 0.009, s * (t + 0.04), s * (t + 0.058), metal);
  }
}

/** Four raised panels on each face of a leaf, either side of a middle rail at the handle. */
function panels(c: JoineryCtx, S: Frame, L: number, H: number, t: number, hv: number): void {
  const look = shade(c.look, 0.93);
  const m = Math.min(0.11, L * 0.14);
  const cols: [number, number][] = L > 0.55 ? [[m, L / 2 - 0.05], [L / 2 + 0.05, L - m]] : [[m, L - m]];
  const rows: [number, number][] = [[0.2, hv - 0.08], [hv + 0.08, H - m]];
  for (const s of [1, -1]) {
    for (const [u0, u1] of cols) for (const [v0, v1] of rows) box(c, S, u0, u1, v0, v1, s * t, s * (t + 0.006), look, ALL & ~(s > 0 ? NW : PW));
  }
}

/** A plank door hanging on a rail on the wall's face, sliding sideways off the opening. */
function barn(c: JoineryCtx, F: Frame, info: OpeningInfo, open: number): void {
  const o = info.opening, W = info.width, H = info.top;
  const side = o.swing === "out" ? -1 : 1;
  const face = (side * info.depth) / 2;
  const LW = W + 0.1, LH = H + 0.05;
  const away = (o.hinge ?? "left") === "left" ? -1 : 1;
  const x = open * LW * away;
  const w0 = face + side * 0.012, w1 = face + side * 0.052, wb = w1 + side * 0.022;
  box(c, F, x - LW / 2, x + LW / 2, 0.01, LH, w0, w1, c.look, ALL, 2);
  // a Z of battens on its room side
  const batten = shade(c.look, 0.9);
  box(c, F, x - LW / 2 + 0.06, x + LW / 2 - 0.06, 0.25, 0.37, w1, wb, batten, ALL & ~(side > 0 ? NW : PW));
  box(c, F, x - LW / 2 + 0.06, x + LW / 2 - 0.06, LH - 0.37, LH - 0.25, w1, wb, batten, ALL & ~(side > 0 ? NW : PW));
  const du = LW - 0.32, dv = LH - 0.74 - 0.12;
  const D = turnedUV(F, x - LW / 2 + 0.16, 0.43, 0, Math.atan2(dv, du));
  box(c, D, 0, Math.hypot(du, dv), -0.055, 0.055, w1, wb, batten, ALL & ~(side > 0 ? NW : PW));
  // the rail, long enough for both ends of its travel
  const dark: Look = { surf: "role:dark", col: lin(c.pal.roles.dark) };
  const r0 = Math.min(-LW / 2, -LW / 2 + away * LW) - 0.05, r1 = Math.max(LW / 2, LW / 2 + away * LW) + 0.05;
  box(hung(c, LH), F, r0, r1, LH + 0.02, LH + 0.06, face + side * 0.004, face + side * 0.03, dark);
}

// -------------------------------------------------------------------- garage doors

function garageMoving(c: JoineryCtx, F: Frame, info: OpeningInfo, style: string, open: number): void {
  const o = info.opening, W = info.width, H = info.top;
  const side = o.swing === "out" ? -1 : 1;
  const face = (side * info.depth) / 2;
  if (style === "side") {
    const toward = side > 0 ? F.w : neg(F.w);
    const angle = open * DOOR_ANGLE;
    leaf(c, hinged(at(F, -W / 2, 0, face), F.u, toward, angle), (W - GAP) / 2, H - GAP, "flush", false, false);
    leaf(c, hinged(at(F, W / 2, 0, face), neg(F.u), toward, angle), (W - GAP) / 2, H - GAP, "flush", false, false);
    return;
  }
  // behind the opening, inside: rises from the bottom
  const G = 0.045;
  const bottom = Math.min(H, open * H);
  const u0 = -W / 2 - 0.03, u1 = W / 2 + 0.03;
  box(c, F, u0, u1, bottom, H + 0.03, face, face + side * G, c.look, ALL, 2);
  // section joints or slats, seen from outside
  const joint = shade(c.look, 0.78);
  const step = style === "roller" ? 0.1 : H / 4;
  const w = face - side * 0.003;
  for (let v = bottom + step; v < H - 0.02; v += step) {
    c.g.useSurface(joint.surf);
    c.g.quad(at(F, u0, v - 0.008, w), at(F, u1, v - 0.008, w), at(F, u1, v + 0.008, w), at(F, u0, v + 0.008, w), dir(F, 0, 0, -side), joint.col, c.room, c.ws);
  }
  if (style === "sectional") {
    // the risen sections run back under the ceiling
    if (bottom > 0.01) box(hung(c, H), F, u0, u1, H + 0.03, H + 0.03 + G, face, face + side * bottom, c.look);
  } else {
    box(hung(c, H), F, u0 - 0.02, u1 + 0.02, H + 0.03, Math.min(info.ceiling, H + 0.3), face, face + side * 0.26, c.look);
  }
}

// -------------------------------------------------------------------- entry points

/** The parts that never move, built with the walls (and windows that follow no sensor, closed). */
export function buildOpeningFixed(c: JoineryCtx, info: OpeningInfo): void {
  const F = frameOf(info);
  const style = styleOf(info.opening);
  if (info.opening.kind === "window") {
    windowFixed(c, F, info, style);
    if (!windowFollowsSensor(info.opening)) windowMoving(c, F, info, style, 0);
  } else if (info.opening.kind === "door") {
    doorFixed(c, F, info, style);
  }
}

/** The moving parts, `open` from 0 (closed) to 1 (open). */
export function buildOpeningMoving(c: JoineryCtx, info: OpeningInfo, open: number): void {
  const F = frameOf(info);
  const style = styleOf(info.opening);
  if (info.opening.kind === "window") windowMoving(c, F, info, style, open);
  else if (info.opening.kind === "door") doorMoving(c, F, info, style, open);
  else if (info.opening.kind === "garage") garageMoving(c, F, info, style, open);
}
