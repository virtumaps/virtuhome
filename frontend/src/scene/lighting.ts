// Lighting without real-time lights: when a lamp changes, every vertex of the affected floor gets
// its colour recomputed on the CPU (a few thousand vertices: well under a millisecond on a Fire
// tablet) and the GPU only ever draws unlit vertex colours. Light stays in its room, except
// through open doors and openings, where part of it spills into the next room.
import type { FloorBuild, LampInfo, Portal } from "./build";
import { lin } from "./build";
import type { Geo, V3 } from "./geo";
import type { Palette } from "./palette";

export interface LampState {
  on: boolean;
  /** Linear RGB of the light colour, 0..1. */
  rgb: V3;
  /** 0..1 (brightness). */
  level: number;
}

interface Light {
  x: number;
  y: number;
  z: number;
  r2: number;
  r: number;
  g: number;
  b: number;
}

export interface LightingState {
  /** Ambient (sky) light colour multiplier for the whole house. */
  ambient: number;
  lamp: (lamp: LampInfo) => LampState | null;
  /** 0 closed .. 1 open; null: no sensor (treated as open). */
  portal: (p: Portal) => number | null;
  /** A glow slot's own colour (a screen that is on, a window that is open), or null. */
  glow: (slot: number) => V3 | null;
}

const PORTAL_SPILL = 0.55;
const PORTAL_RADIUS = 2.8;

/** Lights per room for one floor, including the light that spills through open doors. */
export function roomLights(fb: FloorBuild, pal: Palette, st: LightingState): Light[][] {
  const byRoom: Light[][] = fb.rooms.map(() => []);
  const gain = pal.lampGain;
  for (const lamp of fb.lamps) {
    if (lamp.room < 0) continue;
    const s = st.lamp(lamp);
    if (!s?.on || s.level <= 0) continue;
    // perceived brightness: 10 % still clearly reads as on
    const k = gain * (0.35 + 0.65 * Math.sqrt(s.level)) * 1.6;
    const radius = lamp.radius * (0.75 + 0.25 * s.level);
    byRoom[lamp.room].push({
      x: lamp.pos[0], y: lamp.pos[1], z: lamp.pos[2], r2: radius * radius,
      r: s.rgb[0] * k, g: s.rgb[1] * k, b: s.rgb[2] * k,
    });
  }
  // one bounce through each open portal, from the lights of the room on the other side
  const spill: Light[][] = fb.rooms.map(() => []);
  for (const p of fb.portals) {
    const open = st.portal(p) ?? 1;
    const f = PORTAL_SPILL * (p.door ? 0.12 + 0.88 * open : 1);
    if (f <= 0.01) continue;
    for (const [from, to] of [[p.a, p.b], [p.b, p.a]]) {
      if (from < 0 || to < 0) continue;
      const c = lightAt(byRoom[from], p.pos[0], p.pos[1], p.pos[2]);
      const strength = Math.max(c[0], c[1], c[2]);
      if (strength < 0.02) continue;
      const w = Math.min(1, p.width / 0.9);
      spill[to].push({
        x: p.pos[0], y: p.pos[1], z: p.pos[2], r2: PORTAL_RADIUS * PORTAL_RADIUS,
        r: c[0] * f * w, g: c[1] * f * w, b: c[2] * f * w,
      });
    }
  }
  return byRoom.map((l, i) => l.concat(spill[i]));
}

function lightAt(lights: Light[], x: number, y: number, z: number): V3 {
  let r = 0, g = 0, b = 0;
  for (const l of lights) {
    const dx = l.x - x, dy = l.y - y, dz = l.z - z;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 >= l.r2) continue;
    const q = 1 - d2 / l.r2;
    const att = q * q;
    r += l.r * att;
    g += l.g * att;
    b += l.b * att;
  }
  return [r, g, b];
}

/**
 * Writes lit colours into `out` (the colour attribute): unlit colour x (sky + lamps), lamp shades
 * and screens in their own colour.
 */
export function relight(geo: Geo, out: Float32Array, lights: Light[][], st: LightingState, pal: Palette): void {
  const amb = st.ambient;
  const pos = geo.pos, nrm = geo.nrm, base = geo.base, room = geo.room, glow = geo.glow;
  const n = geo.vertexCount;
  const glowCache = new Map<number, V3 | null>();
  for (let v = 0; v < n; v++) {
    const i3 = v * 3;
    const slot = glow[v];
    if (slot >= 0) {
      let c = glowCache.get(slot);
      if (c === undefined) {
        c = st.glow(slot);
        glowCache.set(slot, c);
      }
      if (c) {
        out[i3] = c[0];
        out[i3 + 1] = c[1];
        out[i3 + 2] = c[2];
        continue;
      }
    }
    let lr = amb, lg = amb, lb = amb;
    const ri = room[v];
    if (ri >= 0) {
      const list = lights[ri];
      if (list && list.length) {
        const px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];
        const nx = nrm[i3], ny = nrm[i3 + 1], nz = nrm[i3 + 2];
        for (let k = 0; k < list.length; k++) {
          const l = list[k];
          const dx = l.x - px, dy = l.y - py, dz = l.z - pz;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= l.r2) continue;
          const q = 1 - d2 / l.r2;
          // faces turned towards the lamp get more of it
          const d = Math.sqrt(d2) || 1;
          const ndl = (dx * nx + dy * ny + dz * nz) / d;
          const f = q * q * (0.45 + 0.55 * Math.max(0, ndl));
          lr += l.r * f;
          lg += l.g * f;
          lb += l.b * f;
        }
      }
    }
    out[i3] = Math.min(1, base[i3] * lr);
    out[i3 + 1] = Math.min(1, base[i3 + 1] * lg);
    out[i3 + 2] = Math.min(1, base[i3 + 2] * lb);
  }
  void pal;
}

/** How bright a room's lamps are in total (for lit windows seen from outside). */
export function roomGlow(lights: Light[][]): number[] {
  return lights.map((list) => list.reduce((s, l) => s + Math.max(l.r, l.g, l.b), 0));
}

/** Colour temperature (Kelvin) to linear RGB, normalised to the brightest channel. */
export function kelvinToRgb(k: number): V3 {
  const t = k / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.47 * Math.log(t) - 161.12;
    b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  } else {
    r = 329.7 * Math.pow(t - 60, -0.1332);
    g = 288.12 * Math.pow(t - 60, -0.0755);
    b = 255;
  }
  const hex = (clamp(r) << 16) | (clamp(g) << 8) | clamp(b);
  return lin(hex);
}

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
