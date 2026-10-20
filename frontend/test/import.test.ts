import { describe, expect, it } from "vitest";
import { buildPlan, offsetOutline, type Draft } from "../src/import/draft";
import { furnitureFor } from "../src/import/names";
import { area } from "../src/model/geom";
import { normalizePlan, type Plan, type Vec2 } from "../src/model/plan";
import { layoutWalls } from "../src/model/walls";

describe("import drafts", () => {
  const draft = (extra: Partial<Draft["floors"][0]>): Plan => buildPlan({
    roomsAt: "centre",
    floors: [{
      elevation: 0, height: 2.5, openings: [], furniture: [],
      rooms: [{ name: "A", points: [[0, 0], [4, 0], [4, 3], [0, 3]] }, { name: "B", points: [[4, 0], [7, 0], [7, 3], [4, 3]] }],
      ...extra,
    }],
  }).plan;

  it("joins rooms drawn on the inner faces in the middle of their wall, and starts the plan at 0, 0", () => {
    const { plan, summary } = buildPlan({
      roomsAt: "inner", wallExterior: 0.3,
      floors: [{
        elevation: 0, height: 2.4, openings: [], furniture: [],
        rooms: [
          { name: "Lounge", points: [[10.15, 5.15], [14.95, 5.15], [14.95, 9.85], [10.15, 9.85]] },
          { points: [[15.05, 5.15], [17.85, 5.15], [17.85, 9.85], [15.05, 9.85], [15.05, 5.15]] },
          { name: "Line", points: [[0, 0], [1, 0]] },
        ],
      }],
    });
    const [a, b] = plan.floors[0].rooms;
    expect(a.points).toEqual([[0, 0], [5, 0], [5, 5], [0, 5]]);
    expect(b.name).toBe("Room 2");
    expect(area(b.points)).toBeCloseTo(15);
    expect(b.points).toContainEqual([5, 0]);
    expect(plan.settings.wall_interior).toBe(0.1);
    expect(plan.settings.wall_exterior).toBe(0.3);
    expect(summary).toMatchObject({ floors: 1, rooms: 2, left: ["Line: too few corners"] });
  });

  it("maps furniture by type and name, and brings pieces without a match in as boxes", () => {
    const { plan, summary } = buildPlan({
      roomsAt: "centre",
      floors: [{
        elevation: 0, height: 2.5,
        rooms: [{ name: "Kitchen", points: [[0, 0], [4, 0], [4, 3], [0, 3]] }],
        openings: [{ at: [2, 3], width: 0.9, height: 2, sill: 0, kind: "door" }, { at: [9, 9], width: 1, height: 1, sill: 1, kind: "window", label: "Roof window" }],
        furniture: [
          { at: [1, 1], type: "sofa", rotation: -90 },
          { at: [3.6, 0.4], name: "Kühlschrank", w: 0.6, d: 0.65, h: 1.8 },
          { at: [2, 1.5], type: "lamp_panel", elevation: 2.4 },
          { at: [2, 0.2], type: "kitchen_wall", elevation: 1.45 },
          { at: [0.5, 2.5], name: "Ironing board", w: 1.2, d: 0.35, h: 0.9 },
          { at: [1, 0.1], name: "Curtains" },
          { at: [3, 2], type: "constructor", name: "toString" },
        ],
      }],
    });
    const f = plan.floors[0];
    expect(f.furniture.map((x) => x.type)).toEqual(["sofa", "fridge", "lamp_ceiling", "kitchen_wall", "column", "column"]);
    const [sofa, fridge, lamp, wall, box] = f.furniture;
    expect(sofa).toMatchObject({ rotation: 270, w: 2, d: 0.9, h: 0.8 });
    expect(fridge.h).toBe(1.8);
    expect(lamp.y).toBeUndefined();
    expect(wall.y).toBe(1.45);
    expect(box).toMatchObject({ w: 1.2, d: 0.35, h: 0.9 });
    expect(summary).toMatchObject({ doors: 1, windows: 0, furniture: 6, boxes: ["Ironing board", "toString"], left: ["Roof window at 9.0, 9.0 is on no room edge", "Curtains"] });
    expect(layoutWalls(f, plan.settings).orphans).toEqual([]);
    expect(normalizePlan(structuredClone(plan))).toEqual(plan);
  });

  it("gives a door between two rooms to the one it opens into, hinged on the side it is", () => {
    // on the shared wall x = 4 (it runs down the plan): opening into B, hinge near the top
    const plan = draft({ openings: [{ at: [4, 1.5], width: 0.9, height: 2, sill: 0, kind: "door", opens: [1, 0], hinge: [4, 1.08] }] });
    const [d] = plan.floors[0].openings;
    expect(d.room_id).toBe("b");
    expect(d.swing).toBe("in");
    expect(d.hinge).toBe("left");
    const other = draft({ openings: [{ at: [4, 1.5], width: 0.9, height: 2, sill: 0, kind: "door", opens: [-1, 0], hinge: [4, 1.92] }] });
    expect(other.floors[0].openings[0]).toMatchObject({ room_id: "a", swing: "in", hinge: "right" });
    // an outside door that opens out
    const out = draft({ openings: [{ at: [2, 3], width: 0.9, height: 2, sill: 0, kind: "door", opens: [0, 1] }] });
    expect(out.floors[0].openings[0]).toMatchObject({ room_id: "a", swing: "out" });
  });

  it("only tries edges that run the way the opening does", () => {
    // near the corner of A: the bottom edge is nearer, but the opening runs down the plan
    const plan = draft({ openings: [{ at: [0.1, 2.9], width: 0.8, height: 1, sill: 1, kind: "window", along: [0, 1] }] });
    const [w] = plan.floors[0].openings;
    expect(w.edge).toBe(3);
  });

  it("steps an outline where a straight run of wall changes thickness", () => {
    // the bottom edge: a 10 cm wall for its first 4 m, then a 30 cm outside wall
    const pts: Vec2[] = [[0, 0], [9, 0], [9, 3], [4, 3], [0, 3]];
    const out = offsetOutline(pts, [0.15, 0.15, 0.15, 0.05, 0.15]);
    expect(out.map((p) => p.map((v) => Math.round(v * 100) / 100))).toEqual([[-0.15, -0.15], [9.15, -0.15], [9.15, 3.15], [4, 3.15], [4, 3.05], [-0.15, 3.05]]);
  });

  it("finds furniture types by name, in a few languages", () => {
    const cases: [string, string | null][] = [
      ["Bed 140x190", "bed"], ["Bed 90x190", "bed"], ["Corner sofa", "sofa_l"], ["Bedside table", "nightstand"],
      ["Kitchen upper cabinet", "kitchen_wall"], ["Washbasin with cabinet", "washbasin"], ["Toilet unit", "wc"],
      ["Fridge & Freezer", "fridge"], ["Clothes washer", "washer"], ["Coffee table", "coffee_table"],
      ["Réfrigérateur", "fridge"], ["Esstisch", "table"], ["Lave-vaisselle", "dishwasher"], ["Cama", "bed"],
      ["Front door", ""], ["Curtains", ""], ["Mannequin", null],
    ];
    expect(cases.map(([n]) => [n, furnitureFor(n)])).toEqual(cases);
    expect(furnitureFor("Bed 90x190", { w: 0.9 })).toBe("bed_single");
    expect(furnitureFor("Flat TV", { elevation: 1.1 })).toBe("tv_wall");
    expect(furnitureFor("White light source", { light: true, elevation: 2.3, h: 0.1, storey: 2.5 })).toBe("lamp_ceiling");
  });
});
