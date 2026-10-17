// A growable triangle mesh that keeps, next to what the GPU needs, what the CPU lighting pass
// needs: each vertex's normal, unlit colour, room and glow slot.
import { BufferAttribute, BufferGeometry } from "three";

export type V3 = [number, number, number];

/** Room index for faces outside the house (lit by daylight only). */
export const ROOM_OUTSIDE = -1;
/** Faces no lamp reaches: wall tops, slab undersides. */
export const ROOM_NONE = -2;

export class Geo {
  pos: number[] = [];
  nrm: number[] = [];
  base: number[] = [];
  room: number[] = [];
  /** Wall slot * 2 (+1 for a wall's top face) for the cutaway, or -1. */
  wall: number[] = [];
  /** Glow slot (a lamp shade, a screen, a lit window) or -1. */
  glow: number[] = [];
  /** The furniture or lamp a vertex belongs to (index into FloorBuild.items) or -1. */
  item: number[] = [];
  /** Set while building a piece of furniture: new vertices belong to it. */
  currentItem = -1;
  idx: number[] = [];

  get vertexCount(): number {
    return this.room.length;
  }

  vertex(p: V3, n: V3, c: V3, room: number, wall = -1, glow = -1): number {
    this.pos.push(p[0], p[1], p[2]);
    this.nrm.push(n[0], n[1], n[2]);
    this.base.push(c[0], c[1], c[2]);
    this.room.push(room);
    this.wall.push(wall);
    this.glow.push(glow);
    this.item.push(this.currentItem);
    return this.room.length - 1;
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
  quad(p0: V3, p1: V3, p2: V3, p3: V3, n: V3, c: V3, room: number, wall = -1, glow = -1, nu = 1, nv = 1): void {
    const start = this.vertexCount;
    for (let j = 0; j <= nv; j++) {
      const t = j / nv;
      for (let i = 0; i <= nu; i++) {
        const s = i / nu;
        // bilinear between the edges p0->p1 (t = 0) and p3->p2 (t = 1)
        const ax = p0[0] + (p1[0] - p0[0]) * s, ay = p0[1] + (p1[1] - p0[1]) * s, az = p0[2] + (p1[2] - p0[2]) * s;
        const bx = p3[0] + (p2[0] - p3[0]) * s, by = p3[1] + (p2[1] - p3[1]) * s, bz = p3[2] + (p2[2] - p3[2]) * s;
        this.vertex([ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t], n, c, room, wall, glow);
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

  /** Appends another mesh, with its room indices offset when the rooms are numbered differently. */
  append(o: Geo): void {
    const off = this.vertexCount;
    // plain loops: spreading 100k+ numbers into push() overflows the call stack
    for (let i = 0; i < o.pos.length; i++) {
      this.pos.push(o.pos[i]);
      this.nrm.push(o.nrm[i]);
      this.base.push(o.base[i]);
    }
    for (let i = 0; i < o.room.length; i++) {
      this.room.push(o.room[i]);
      this.wall.push(o.wall[i]);
      this.glow.push(o.glow[i]);
      this.item.push(o.item[i]);
    }
    for (const i of o.idx) this.idx.push(i + off);
  }

  /** The GPU side: positions, colours (filled by the lighting pass), room and wall indices. */
  toBufferGeometry(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(this.pos), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(this.base), 3));
    g.setAttribute("aRoom", new BufferAttribute(new Float32Array(this.room), 1));
    g.setAttribute("aWall", new BufferAttribute(new Float32Array(this.wall), 1));
    const n = this.vertexCount;
    g.setIndex(n > 65535 ? new BufferAttribute(new Uint32Array(this.idx), 1) : new BufferAttribute(new Uint16Array(this.idx), 1));
    g.computeBoundingSphere();
    return g;
  }
}
