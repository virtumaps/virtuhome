import { describe, expect, it } from "vitest";
import { Collider, settle } from "../src/editor/collide";
import { DEFAULT_SETTINGS, type Furniture, type Plan } from "../src/model/plan";

const piece = (id: string, type: string, x: number, z: number, w: number, d: number, h: number, extra: Partial<Furniture> = {}): Furniture =>
  ({ id, type, x, z, rotation: 0, w, d, h, ...extra });

// one 4 x 4 m room (walls 0.28 thick on its outline), a door in the bottom wall and a window in the right one
const plan = (furniture: Furniture[]): Plan => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  floors: [{
    id: "g", name: "Ground", elevation: 0, height: 2.5, walls: [], devices: [], furniture,
    rooms: [{ id: "a", name: "A", area_id: null, points: [[0, 0], [4, 0], [4, 4], [0, 4]] }],
    openings: [
      { id: "d", room_id: "a", edge: 2, offset: 2, width: 0.9, height: 2, sill: 0, kind: "door" },
      { id: "w", room_id: "a", edge: 1, offset: 2, width: 1.2, height: 1.2, sill: 0.9, kind: "window" },
    ],
  }],
});

describe("Collider", () => {
  it("lets a piece go where nothing is", () => {
    const p = plan([piece("a", "kitchen", 1, 1, 0.6, 0.6, 0.9)]);
    expect(new Collider(p, 0, "a").place([1, 1], [1.5, 1.2])).toEqual([1.5, 1.2]);
  });

  it("stops a cabinet at the next cabinet instead of going into it", () => {
    const p = plan([piece("a", "kitchen", 1, 1, 0.6, 0.6, 0.9), piece("b", "kitchen", 2, 1, 0.6, 0.6, 0.9)]);
    const c = new Collider(p, 0, "b");
    const [x, z] = c.place([2, 1], [1.3, 1]);
    expect(c.hits(x, z)).toBe(false);
    // pushed back to touch it, not jumped across
    expect(x).toBeGreaterThan(1.59);
    expect(x).toBeLessThan(1.62);
    expect(z).toBeCloseTo(1);
  });

  it("slides along a wall rather than into it", () => {
    const p = plan([piece("s", "sofa", 2, 2, 2.0, 0.9, 0.8)]);
    const [x, z] = new Collider(p, 0, "s").place([2, 2], [2.3, 0.3]);
    // the wall's inner face is 0.14 in; the sofa's back stops there and keeps the sideways move
    expect(z).toBeGreaterThan(0.14 + 0.45 - 0.003);
    expect(z).toBeLessThan(0.14 + 0.45 + 0.01);
    expect(x).toBeCloseTo(2.3);
  });

  it("goes through a doorway but not through a window", () => {
    const p = plan([piece("c", "chair", 2, 3, 0.45, 0.5, 0.9), piece("k", "kitchen", 2, 3, 0.6, 0.6, 0.9)]);
    // the chair stands in the door opening, inside the wall's thickness
    expect(new Collider(p, 0, "c").hits(2, 4)).toBe(false);
    // the cabinet pushed into the window's wall
    expect(new Collider(p, 0, "k").hits(3.95, 2)).toBe(true);
  });

  it("lets a chair's seat slide under a table top but stops its back", () => {
    // the chair faces the table (turned round: its front points up the plan)
    const p = plan([piece("t", "table", 2, 2, 1.6, 0.9, 0.75), piece("c", "chair", 2, 3, 0.45, 0.5, 0.9, { rotation: 180 })]);
    const c = new Collider(p, 0, "c");
    // front edge of the seat 10 cm under the table
    expect(c.hits(2, 2.45 + 0.25 - 0.1)).toBe(false);
    // the whole chair under the table: its back meets the top
    expect(c.hits(2, 2.0)).toBe(true);
  });

  it("lets things stand on others: a vase on a sideboard, a sofa on a rug, a wall cupboard over a base unit", () => {
    const vase = plan([piece("sb", "sideboard", 1.5, 1, 1.6, 0.45, 0.8), piece("v", "vase", 3, 3, 0.18, 0.18, 0.35)]);
    expect(new Collider(vase, 0, "v").hits(1.5, 1)).toBe(false);
    const rug = plan([piece("rug", "rug", 2, 2.5, 2, 1.4, 0.01), piece("s", "sofa", 2, 1, 2, 0.9, 0.8)]);
    expect(new Collider(rug, 0, "s").hits(2, 2.5)).toBe(false);
    const kitchen = plan([piece("k", "kitchen", 1, 3, 0.6, 0.6, 0.9), piece("kw", "kitchen_wall", 3, 3, 0.6, 0.35, 0.7)]);
    expect(new Collider(kitchen, 0, "kw").hits(1, 3.1)).toBe(false);
  });

  it("keeps rugs from overlapping each other, and wall cupboards from sinking into base units", () => {
    const p = plan([
      piece("r1", "rug", 2, 2, 2, 1.4, 0.01), piece("r2", "rug", 2, 3.2, 2, 1.4, 0.01),
      piece("k", "kitchen", 1, 3, 0.6, 0.6, 0.9), piece("kw", "kitchen_wall", 3, 3.5, 0.6, 0.35, 0.7, { y: 0.5 }),
    ]);
    expect(new Collider(p, 0, "r2").hits(2, 2.5)).toBe(true);
    expect(new Collider(p, 0, "kw").hits(1, 3.1)).toBe(true);
  });

  it("stops at the first contact when squeezed into a gap that is too small", () => {
    const p = plan([
      piece("a", "kitchen", 1, 1, 0.6, 0.6, 0.9), piece("b", "kitchen", 2.0, 1, 0.6, 0.6, 0.9),
      piece("c", "tall_cabinet", 1.5, 2.5, 0.8, 0.4, 2.0),
    ]);
    const c = new Collider(p, 0, "c");
    const [x, z] = c.place([1.5, 2.5], [1.5, 1]);
    expect(c.hits(x, z)).toBe(false);
    expect(z).toBeGreaterThan(1.45);
  });

  it("settles a piece that was turned into a wall", () => {
    const p = plan([piece("s", "sofa", 2, 0.7, 2.0, 0.9, 0.8, { rotation: 90 })]);
    settle(p, 0, "s");
    const s = p.floors[0].furniture[0];
    // turned, the sofa is 2 m deep across the plan: its end must clear the wall at z = 0.14
    expect(s.z - 1.0).toBeGreaterThanOrEqual(0.14 - 0.003);
  });
});
