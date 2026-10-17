// Small 2D geometry helpers on plan coordinates (x right, z down).
import type { Vec2 } from "./plan";

export const EPS = 1e-6;

export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const scale = (a: Vec2, s: number): Vec2 => [a[0] * s, a[1] * s];
export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];
export const cross = (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0];
export const len = (a: Vec2): number => Math.hypot(a[0], a[1]);
export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export function norm(a: Vec2): Vec2 {
  const l = len(a);
  return l < EPS ? [0, 0] : [a[0] / l, a[1] / l];
}

/** Signed area: positive when the corners run clockwise on screen (z down). */
export function signedArea(pts: Vec2[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

export const area = (pts: Vec2[]): number => Math.abs(signedArea(pts));

export function centroid(pts: Vec2[]): Vec2 {
  let a = 0;
  let cx = 0;
  let cz = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    const c = p[0] * q[1] - q[0] * p[1];
    a += c;
    cx += (p[0] + q[0]) * c;
    cz += (p[1] + q[1]) * c;
  }
  if (Math.abs(a) < EPS) {
    const n = pts.length || 1;
    return [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
  }
  return [cx / (3 * a), cz / (3 * a)];
}

export function pointInPolygon(p: Vec2, pts: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i];
    const [xj, zj] = pts[j];
    if (zi > p[1] !== zj > p[1] && p[0] < ((xj - xi) * (p[1] - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance from p to segment a-b, and how far along the segment (m from a) its foot lies. */
export function segmentDistance(p: Vec2, a: Vec2, b: Vec2): { d: number; t: number } {
  const ab = sub(b, a);
  const l = len(ab);
  if (l < EPS) return { d: dist(p, a), t: 0 };
  const t = Math.max(0, Math.min(l, dot(sub(p, a), ab) / l));
  const foot = add(a, scale(ab, t / l));
  return { d: dist(p, foot), t };
}

/** A point well inside the polygon for labels: the centroid, or the middle of the widest span. */
export function labelPoint(pts: Vec2[]): Vec2 {
  const c = centroid(pts);
  if (pointInPolygon(c, pts)) return c;
  // L-shapes: scan a horizontal line through the centroid for the widest inside span
  const xs: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[(i + 1) % pts.length];
    if (z1 > c[1] !== z2 > c[1]) xs.push(x1 + ((c[1] - z1) * (x2 - x1)) / (z2 - z1));
  }
  xs.sort((a, b) => a - b);
  let best: Vec2 = c;
  let width = -1;
  for (let i = 0; i + 1 < xs.length; i += 2) {
    if (xs[i + 1] - xs[i] > width) {
      width = xs[i + 1] - xs[i];
      best = [(xs[i] + xs[i + 1]) / 2, c[1]];
    }
  }
  return best;
}

export function bounds(pts: Vec2[]): { minX: number; minZ: number; maxX: number; maxZ: number } {
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of pts) {
    if (x < minX) minX = x;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (z > maxZ) maxZ = z;
  }
  return { minX, minZ, maxX, maxZ };
}

/** Unit normal of edge a->b pointing out of the polygon. */
export function outwardNormal(pts: Vec2[], i: number): Vec2 {
  const a = pts[i];
  const b = pts[(i + 1) % pts.length];
  const d = norm(sub(b, a));
  // z-down plan: for a clockwise polygon (positive signed area) the right-hand normal points out
  const right: Vec2 = [-d[1], d[0]];
  return signedArea(pts) > 0 ? scale(right, -1) : right;
}
