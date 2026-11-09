import { describe, expect, it } from "vitest";
import { HassLive } from "../src/live/live";
import type { Hass, HassEntity } from "../src/live/hass";
import { openWindows } from "../src/live/warnings";
import { normalizePlan, type Fence, type FenceGate, type Furniture, type Plan } from "../src/model/plan";
import { entityUses, replaceEntity } from "../src/model/links";
import { buildFloor, hasMoving } from "../src/scene/build";
import { advance, awningParts, goal, leafAt, Moving, reading, slat, tiltOf, type Channel } from "../src/scene/covers";
import { fencePieces } from "../src/scene/fences";
import { Geo } from "../src/scene/geo";
import { DAY } from "../src/scene/palette";
import { DEMO_PLAN } from "../src/demo/plan";

const at = "2026-11-09T08:00:00Z";
const state = (entity_id: string, s: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state: s, attributes, last_changed: at, last_updated: at });
const hassOf = (states: HassEntity[]): Hass => ({
  states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
  entities: Object.fromEntries(states.map((s) => [s.entity_id, { entity_id: s.entity_id }])),
  callService: async () => undefined,
  callWS: async () => undefined as never,
  connection: { subscribeMessage: async () => async () => undefined },
});
const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** A garden with a fence along its bottom edge (first point to last: +x) and its gates. */
function gardenPlan(gates: FenceGate[], furniture: Furniture[] = []): Plan {
  const fence: Fence = { id: "front", points: [[0, 10], [8, 10]], style: "closeboard", height: 1.8, gates };
  return normalizePlan({
    version: 1,
    settings: {},
    floors: [{
      id: "g", name: "Ground", elevation: 0, height: 2.6,
      rooms: [{ id: "lounge", name: "Lounge", area_id: null, points: rect(0, 0, 8, 5) }],
      openings: [{ id: "w", room_id: "lounge", edge: 2, offset: 4, width: 1.6, height: 1.2, sill: 0.9, kind: "window", cover: "cover.blind" }],
      furniture, devices: [], walls: [],
      outdoor: [{ id: "garden", name: "Garden", kind: "lawn", area_id: null, points: rect(0, 5, 8, 10) }],
      fences: [fence],
    }],
  });
}

const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Where a point across a leaf (x, at its middle's depth) is on the plan. */
function point(it: Furniture, x: number, z = 0): [number, number] {
  const r = (it.rotation * Math.PI) / 180;
  return [it.x + Math.cos(r) * x - Math.sin(r) * z, it.z + Math.sin(r) * x + Math.cos(r) * z];
}

describe("gates that open", () => {
  const leaves = (gate: FenceGate) => fencePieces(gardenPlan([gate]).floors[0].fences![0], false).filter((p) => p.gate === 0);

  it("tags each leaf with its gate and the side its hinges are on", () => {
    expect(leaves({ at: 4, width: 1 }).map((l) => Math.sign(l.hinge!))).toEqual([-1]);
    // a single leaf hung at the far end, and a pair whose second leaf is turned round
    expect(leaves({ at: 4, width: 1, hinge: "end" }).map((l) => Math.sign(l.hinge!))).toEqual([1]);
    expect(leaves({ at: 4, width: 3, double: true }).map((l) => Math.sign(l.hinge!))).toEqual([-1, 1]);
  });

  it("swings a leaf a quarter turn about its hinges, to the side picked", () => {
    for (const swing of [null, "back"] as const) {
      for (const leaf of leaves({ at: 4, width: 3, double: true, swing })) {
        const shut = leaf.item, hx = leaf.hinge!;
        const hinge = point(shut, hx);
        for (const open of [0.25, 0.5, 1]) {
          const it = leafAt(leaf, { swing }, open);
          // the hinges stay where they are, the leaf keeps its width
          expect(dist(point(it, hx), hinge)).toBeLessThan(1e-9);
          expect(dist(point(it, -hx), hinge)).toBeCloseTo(shut.w, 9);
        }
        // wide open it stands square to the fence (along z), its free end on the front (+z) or the back
        const free = point(leafAt(leaf, { swing }, 1), -hx);
        expect(Math.abs(free[0] - hinge[0])).toBeLessThan(1e-9);
        expect(Math.sign(free[1] - 10)).toBe(swing === "back" ? -1 : 1);
      }
    }
  });

  it("slides a leaf along the fence towards its hinge side, just off the fence's line", () => {
    const [leaf] = leaves({ at: 4, width: 1, kind: "slide" });
    const shut = leafAt(leaf, { kind: "slide" }, 0);
    expect([shut.x, shut.z]).toEqual([leaf.item.x, leaf.item.z]);
    const open = leafAt(leaf, { kind: "slide" }, 1);
    expect(open.rotation).toBe(leaf.item.rotation);
    expect(open.x - leaf.item.x).toBeCloseTo(-(leaf.item.w + 0.05), 9);
    expect(open.z).toBeGreaterThan(10.05);
    expect(leafAt(leaf, { kind: "slide", swing: "back" }, 1).z).toBeLessThan(9.95);
  });

  it("builds a linked gate's leaves with the moving parts, an item of its own that asks when tapped", () => {
    const linked = buildFloor(gardenPlan([{ at: 4, width: 1, entity: "cover.gate" }]), 0, DAY, { low: true });
    const plain = buildFloor(gardenPlan([{ at: 4, width: 1 }]), 0, DAY, { low: true });
    expect(linked.opaque.idx.length).toBeLessThan(plain.opaque.idx.length);
    expect(plain.movers).toEqual([]);
    const [m] = linked.movers;
    expect(m.entity).toBe("cover.gate");
    expect(linked.items[m.item]).toEqual({ kind: "fence", id: "front" });
    expect(linked.targets.find((t) => t.item === m.item)).toMatchObject({ entities: ["cover.gate"], ask: true });
  });
});

describe("following a cover", () => {
  const ch = (pos: number, at: number | null, going: number, speed = 0.1): Channel => ({ pos, at, going, speed });

  it("reads covers, locks, switches and contact sensors", () => {
    expect(reading(state("cover.g", "open", { current_position: 40 }))).toEqual({ at: 0.4, going: 0 });
    expect(reading(state("cover.g", "opening"))).toEqual({ at: null, going: 1 });
    expect(reading(state("cover.g", "closing", { current_position: 70 }))).toEqual({ at: 0.7, going: -1 });
    expect(reading(state("cover.g", "closed"))).toEqual({ at: 0, going: 0 });
    expect(reading(state("lock.g", "unlocked"))).toEqual({ at: 1, going: 0 });
    expect(reading(state("lock.g", "locking"))).toEqual({ at: null, going: -1 });
    expect(reading(state("switch.g", "on"))).toEqual({ at: 1, going: 0 });
    expect(reading(state("binary_sensor.g", "off"))).toEqual({ at: 0, going: 0 });
    expect(reading(state("cover.g", "unavailable"))).toEqual({ at: null, going: 0 });
    expect(tiltOf(state("cover.b", "open", { current_tilt_position: 25 }))).toBe(0.25);
    expect(tiltOf(state("cover.b", "open"))).toBeNull();
  });

  it("travels at an even pace while it only says opening, and stops at the end", () => {
    const c = ch(0, null, 1, 0.1);
    for (let i = 0; i < 5; i++) expect(advance(c, 1, false)).toBe(true);
    expect(c.pos).toBeCloseTo(0.5, 9);
    for (let i = 0; i < 5; i++) advance(c, 1, false);
    expect(c.pos).toBe(1);
    // settled: nothing more to draw
    expect(advance(c, 1, false)).toBe(false);
  });

  it("keeps up with a position that runs ahead, and eases to where it says once still", () => {
    const c = ch(0.1, 0.8, 1, 0.05);
    advance(c, 0.5, false);
    expect(c.pos).toBeGreaterThan(0.5);
    const d = ch(1, 0.3, 0);
    for (let i = 0; i < 100 && advance(d, 0.1, false); i++);
    expect(d.pos).toBe(0.3);
    expect(advance(d, 0.1, false)).toBe(false);
  });

  it("jumps with reduced motion, and stays put while unavailable", () => {
    const c = ch(0, null, 1);
    expect(advance(c, 0.016, true)).toBe(true);
    expect(c.pos).toBe(1);
    const u = ch(0.4, null, 0);
    expect(goal(u)).toBe(0.4);
    expect(advance(u, 1, false)).toBe(false);
  });
});

describe("blinds and awnings", () => {
  it("tilts a venetian blind's slats: level when open, nearly upright when shut", () => {
    const open = slat(1, 0.09, 0.06, 1);
    expect(open.a[1]).toBeCloseTo(open.b[1], 9);
    expect(Math.abs(open.a[0] - open.b[0])).toBeCloseTo(0.06, 9);
    const shut = slat(1, 0.09, 0.06, 0);
    expect(Math.abs(shut.a[1] - shut.b[1])).toBeGreaterThan(0.055);
    expect(Math.abs(shut.a[0] - shut.b[0])).toBeLessThan(0.02);
    for (const s of [open, shut, slat(1, 0.09, 0.06, 0.5)]) expect(Math.hypot(...s.up)).toBeCloseTo(1, 9);
  });

  it("runs an awning out from its cassette", () => {
    const shut = awningParts(3, 2.5, 0.7, 0);
    expect(shut.length).toBe(1);
    const out = awningParts(3, 2.5, 0.7, 1);
    const fabric = out.find((p) => p.role === "canvas" && p.d > 1)!;
    expect(fabric.d).toBeCloseTo(2.26, 9);
    // it slopes down and away from the wall to the front bar near the bottom
    expect(fabric.shear!).toBeLessThan(0);
    const bar = out[0];
    expect(bar.z + bar.d / 2).toBeCloseTo(1.25 - 0.24 + 0.16 + 0.08, 9);
    expect(Math.min(...out.map((p) => p.y))).toBeCloseTo(0, 9);
    expect(awningParts(3, 2.5, 0.7, 0.5).find((p) => p.role === "canvas" && p.d > 0.5)!.d).toBeCloseTo(1.13, 9);
  });
});

describe("moving parts of a floor", () => {
  const awning: Furniture = { id: "aw", type: "awning", x: 4, z: 6.25, rotation: 0, w: 3, d: 2.5, h: 0.7, y: 2, entity: "cover.awning" };
  const plan = gardenPlan([{ at: 4, width: 3, double: true, entity: "cover.gate" }], [awning]);

  it("knows when a plan has any, so their module is loaded only then", () => {
    expect(hasMoving(plan)).toBe(true);
    expect(hasMoving(normalizePlan({ ...gardenPlan([{ at: 4, width: 1 }]), floors: [{ ...gardenPlan([{ at: 4, width: 1 }]).floors[0], openings: [] }] }))).toBe(false);
    expect(hasMoving(DEMO_PLAN)).toBe(true);
  });

  it("starts where the states say, moves only when they change, and draws into the moving parts", () => {
    const fb = buildFloor(plan, 0, DAY, { low: true });
    const m = new Moving(fb, null);
    expect(m.count).toBe(3);
    let states: Record<string, HassEntity> = {
      "cover.gate": state("cover.gate", "closed"),
      "cover.awning": state("cover.awning", "open", { current_position: 100 }),
      "cover.blind": state("cover.blind", "open", { current_position: 0, current_tilt_position: 50 }),
    };
    expect(m.retarget((id) => states[id], false)).toBe(true);
    // already where they should be: nothing moves, nothing to draw again
    expect(m.step(0.1, false)).toBe(false);
    expect(m.retarget((id) => states[id], false)).toBe(false);
    const g = new Geo(), gl = new Geo();
    m.draw(g, gl, DAY, true, false);
    const shut = g.idx.length;
    expect(shut).toBeGreaterThan(0);
    // the gate opens: it travels while it says opening, then settles
    states = { ...states, "cover.gate": state("cover.gate", "opening") };
    expect(m.retarget((id) => states[id], false)).toBe(true);
    let frames = 0;
    while (m.step(0.1, false)) frames++;
    expect(frames).toBeGreaterThan(100);
    expect(m.step(0.1, false)).toBe(false);
    // a new floor build keeps where everything is
    const again = new Moving(buildFloor(plan, 0, DAY, { low: true }), m);
    expect(again.retarget((id) => states[id], false)).toBe(false);
  });

  it("follows the entities live and links them like the rest", () => {
    const live = new HassLive(plan);
    live.update(hassOf([state("cover.gate", "closed"), state("cover.awning", "open")]));
    expect(live.watched()).toEqual(expect.arrayContaining(["cover.gate", "cover.awning", "cover.blind"]));
    expect(live.update(hassOf([state("cover.gate", "opening"), state("cover.awning", "open")])).has("openings")).toBe(true);
    const p = structuredClone(plan);
    expect(entityUses(p).map((u) => u.entity)).toContain("cover.gate");
    replaceEntity(p, "cover.gate", "cover.drive_gate");
    expect(p.floors[0].fences![0].gates![0].entity).toBe("cover.drive_gate");
  });

  it("counts a roof window's opener that is open in the rain warning", () => {
    const p = normalizePlan({ ...plan, floors: [{ ...plan.floors[0], roofs: [{ id: "r", x: 4, z: 2.5, w: 8, d: 5, rotation: 0, shape: "gable", pitch: 35, covering: "concrete_tiles", items: [{ id: "rw", kind: "window", x: 4, z: 1.5, w: 0.78, d: 0.98, entity: "cover.velux" }] }] }] });
    expect(openWindows(p, hassOf([state("cover.velux", "open", { device_class: "window" })]))).toEqual(["cover.velux"]);
    expect(openWindows(p, hassOf([state("cover.velux", "closed", { device_class: "window" })]))).toEqual([]);
  });
});
