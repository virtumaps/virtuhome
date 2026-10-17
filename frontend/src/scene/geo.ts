// A growable triangle mesh that keeps, next to what the GPU needs, what the CPU lighting pass
// needs: each vertex's normal, colour, ambient occlusion, room and glow slot. It also records a
// surface material and texture coordinates per vertex for the realistic renderer.
import { BufferAttribute, BufferGeometry } from "three";

export type V3 = [number, number, number];

/** Room index for faces outside the house (lit by daylight only). */
export const ROOM_OUTSIDE = -1;
/** Faces no lamp reaches: wall tops, slab undersides. */
export const ROOM_NONE = -2;

/** Fixed daylight from the upper left, baked into the model look's colours so faces read as solid. */
export function shade(n: V3): number {
  if (n[1] > 0.5) return 1.0;
  if (n[1] < -0.5) return 0.62;
  return 0.84 + 0.14 * (n[0] * -0.55 + n[2] * -0.83);
}

export class Geo {
  pos: number[] = [];
  nrm: number[] = [];
  /** Model look colour: albedo x ambient occlusion x baked daylight. */
  base: number[] = [];
  /** Surface colour without any lighting, and the ambient occlusion factor. */
  albedo: number[] = [];
  ao: number[] = [];
  uv: number[] = [];
  /** Surface material (SURF.*) of each vertex; a triangle takes its first vertex's. */
  mat: number[] = [];
  room: number[] = [];
  /** Wall slot * 2 (+1 for a wall's top face) for the cutaway, or -1. */
  wall: number[] = [];
  /** Glow slot (a lamp shade, a screen, a lit window) or -1. */
  glow: number[] = [];
  /** The furniture or lamp a vertex belongs to (index into FloorBuild.items) or -1. */
  item: number[] = [];
  /** Set while building: new vertices belong to this item and surface. */
  currentItem = -1;
  currentMat = 0;
  /** Surface keys ("floor:oak", "role:fabric"...), indexed by mat. */
  surfaces: string[] = [];
  /** Height texture coordinates count from (the storey's floor, so a dado rail sits right). */
  uvY0 = 0;
  idx: number[] = [];
  private surfaceIndex = new Map<string, number>();

  /** New vertices are of this surface. */
  useSurface(key: string): void {
    let i = this.surfaceIndex.get(key);
    if (i === undefined) {
      i = this.surfaces.length;
      this.surfaces.push(key);
      this.surfaceIndex.set(key, i);
    }
    this.currentMat = i;
  }

  get vertexCount(): number {
    return this.room.length;
  }

  vertex(p: V3, n: V3, c: V3, room: number, wall = -1, glow = -1, ao = 1): number {
    this.pos.push(p[0], p[1], p[2]);
    this.nrm.push(n[0], n[1], n[2]);
    const s = shade(n) * ao;
    this.base.push(c[0] * s, c[1] * s, c[2] * s);
    this.albedo.push(c[0], c[1], c[2]);
    this.ao.push(ao);
    // world-space planar mapping in metres: floors by x/z, everything else along its face and up
    if (n[1] > 0.7 || n[1] < -0.7) this.uv.push(p[0], p[2]);
    else {
      const l = Math.hypot(n[0], n[2]) || 1;
      this.uv.push((p[0] * -n[2] + p[2] * n[0]) / l, p[1] - this.uvY0);
    }
    this.mat.push(this.currentMat);
    this.room.push(room);
    this.wall.push(wall);
    this.glow.push(glow);
    this.item.push(this.currentItem);
    return this.room.length - 1;
  }

  /** Multiplies the ambient occlusion of vertex v (and its model colour). */
  occlude(v: number, f: number): void {
    this.ao[v] *= f;
    this.base[v * 3] *= f;
    this.base[v * 3 + 1] *= f;
    this.base[v * 3 + 2] *= f;
  }

  /** A triangle facing n (the winding is fixed to match). */
  tri(a: number, b: number, c: number, n: V3): void {
    const p = this.pos;
    const ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2];
    const vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) this.idx.push(a, b, c);
    else this.idx.push(a, c, b);
  }

  /**
   * A flat quad p0-p1-p2-p3 (in order around it), split into an nu x nv grid so the per-vertex
   * lighting has points to work with on big surfaces.
   */
  quad(p0: V3, p1: V3, p2: V3, p3: V3, n: V3, c: V3, room: number, wall = -1, glow = -1, nu = 1, nv = 1, ao = 1): void {
    const start = this.vertexCount;
    for (let j = 0; j <= nv; j++) {
      const t = j / nv;
      for (let i = 0; i <= nu; i++) {
        const s = i / nu;
        // bilinear between the edges p0->p1 (t = 0) and p3->p2 (t = 1)
        const ax = p0[0] + (p1[0] - p0[0]) * s, ay = p0[1] + (p1[1] - p0[1]) * s, az = p0[2] + (p1[2] - p0[2]) * s;
        const bx = p3[0] + (p2[0] - p3[0]) * s, by = p3[1] + (p2[1] - p3[1]) * s, bz = p3[2] + (p2[2] - p3[2]) * s;
        this.vertex([ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t], n, c, room, wall, glow, ao);
      }
    }
    const row = nu + 1;
    for (let j = 0; j < nv; j++) {
      for (let i = 0; i < nu; i++) {
        const a = start + j * row + i;
        this.tri(a, a + 1, a + row + 1, n);
        this.tri(a, a + row + 1, a + row, n);
      }
    }
  }

  /** The model look on the GPU: positions, colours (filled by the lighting pass), room and wall. */
  toBufferGeometry(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(this.base), 3));
    g.setAttribute("aRoom", new BufferAttribute(new Float32Array(this.room), 1));
    g.setAttribute("aWall", new BufferAttribute(new Float32Array(this.wall), 1));
    g.setIndex(this.index(this.idx));
    g.computeBoundingSphere();
    return g;
  }

  /**
   * The realistic look: normals, texture coordinates, an occlusion colour (textured surfaces get
   * their colour from the texture), lamp light and glow, and one draw group per surface material.
   */
  toRealisticGeometry(textured: (mat: number) => boolean): BufferGeometry {
    const g = new BufferGeometry();
    const n = this.vertexCount;
    g.setAttribute("position", new BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute("normal", new BufferAttribute(new Float32Array(this.nrm), 3));
    g.setAttribute("uv", new BufferAttribute(new Float32Array(this.uv), 2));
    const col = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) {
      const a = this.ao[v];
      if (textured(this.mat[v])) {
        col[v * 3] = col[v * 3 + 1] = col[v * 3 + 2] = a;
      } else {
        col[v * 3] = this.albedo[v * 3] * a;
        col[v * 3 + 1] = this.albedo[v * 3 + 1] * a;
        col[v * 3 + 2] = this.albedo[v * 3 + 2] * a;
      }
    }
    g.setAttribute("color", new BufferAttribute(col, 3));
    g.setAttribute("aLamp", new BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aEmis", new BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aRoom", new BufferAttribute(new Float32Array(this.room), 1));
    g.setAttribute("aWall", new BufferAttribute(new Float32Array(this.wall), 1));
    // triangles sorted by material: one draw group each
    const tris: number[][] = [];
    for (let i = 0; i < this.idx.length; i += 3) tris.push([this.mat[this.idx[i]], this.idx[i], this.idx[i + 1], this.idx[i + 2]]);
    tris.sort((p, q) => p[0] - q[0]);
    const sorted: number[] = [];
    let groupStart = 0;
    let current = tris.length ? tris[0][0] : 0;
    tris.forEach((t, k) => {
      if (t[0] !== current) {
        g.addGroup(groupStart, k * 3 - groupStart, current);
        groupStart = k * 3;
        current = t[0];
      }
      sorted.push(t[1], t[2], t[3]);
    });
    if (tris.length) g.addGroup(groupStart, tris.length * 3 - groupStart, current);
    g.setIndex(this.index(sorted));
    g.computeBoundingSphere();
    return g;
  }

  private index(idx: number[]): BufferAttribute {
    return this.vertexCount > 65535 ? new BufferAttribute(new Uint32Array(idx), 1) : new BufferAttribute(new Uint16Array(idx), 1);
  }
}
