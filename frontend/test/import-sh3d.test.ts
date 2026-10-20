import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildPlan } from "../src/import/draft";
import { arcPoints, importSh3d, sh3dDraft } from "../src/import/sh3d";
import { parseXml } from "../src/import/xml";
import { isZip, unzipEntry } from "../src/import/zip";
import { area } from "../src/model/geom";
import { normalizePlan, type Floor, type Vec2 } from "../src/model/plan";
import { layoutWalls } from "../src/model/walls";

const house = () => new Uint8Array(readFileSync(new URL("./fixtures/import/house.sh3d", import.meta.url)));
const imported = async () => buildPlan(await importSh3d(house()));
const room = (f: Floor, name: string) => f.rooms.find((r) => r.name === name)!;
const within = (v: number, want: number) => expect(Math.abs(v - want)).toBeLessThanOrEqual(want * 0.02);
/** An opening's middle on the plan, and the room it belongs to. */
const where = (f: Floor, i: number): { at: Vec2; room: string } => {
  const o = f.openings[i];
  const r = f.rooms.find((x) => x.id === o.room_id)!;
  const a = r.points[o.edge], b = r.points[(o.edge + 1) % r.points.length];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { at: [a[0] + ((b[0] - a[0]) * o.offset) / l, a[1] + ((b[1] - a[1]) * o.offset) / l].map((v) => Math.round(v * 100) / 100) as Vec2, room: r.name };
};
const home = (body: string) => sh3dDraft(parseXml(`<?xml version='1.0'?><home version='7200' wallHeight='250'>${body}</home>`));

describe("zip and XML", () => {
  it("takes a deflated or stored entry out of a zip archive", async () => {
    const bytes = house();
    expect(isZip(bytes)).toBe(true);
    expect(new TextDecoder().decode((await unzipEntry(bytes, "Home.xml"))!)).toMatch(/^<\?xml/);
    expect(new TextDecoder().decode((await unzipEntry(bytes, "Home"))!)).toMatch(/^Not a real serialized home/);
    expect(await unzipEntry(bytes, "Nothing")).toBeNull();
    const json = new TextEncoder().encode('{"floors": []}');
    expect(isZip(json)).toBe(false);
    await expect(unzipEntry(json, "Home.xml")).rejects.toThrow(/not a zip/);
  });

  it("reads elements and attributes, and expands only the named and numbered entities", () => {
    const x = parseXml(`<?xml version='1.0'?><!DOCTYPE home [<!ENTITY a "boom">]><!-- note --><home a='1'>
      <room name="Mum &amp; Dad&apos;s &#x2603; &#9731; &a;"><point x='1' y="2"/></room><room/></home>`);
    expect(x.name).toBe("home");
    expect(x.children.map((c) => c.name)).toEqual(["room", "room"]);
    expect(x.children[0].attrs.name).toBe("Mum & Dad's ☃ ☃ &a;");
    expect(x.children[0].children[0].attrs).toEqual({ x: "1", y: "2" });
    expect(() => parseXml("<home><room></home>")).toThrow(/damaged/);
  });
});

describe("Sweet Home 3D import", () => {
  it("makes a floor of each level, as high as the next level up or its walls", async () => {
    const { plan, summary } = await imported();
    expect(plan.floors.map((f) => [f.name, f.elevation, f.height])).toEqual([["Ground floor", 0, 2.62], ["First floor", 2.62, 2.4]]);
    expect(summary).toMatchObject({ floors: 2, rooms: 8, doors: 9, windows: 7, north: 330 });
    expect(plan.settings).toMatchObject({ wall_exterior: 0.3, wall_interior: 0.1, north: 330 });
  });

  it("moves rooms from the walls' inner faces to their middles, stepping where the wall gets thinner", async () => {
    const { plan } = await imported();
    const [g, f1] = plan.floors;
    within(area(room(g, "Living room").points), 20);
    within(area(room(g, "Kitchen").points), 16);
    within(area(room(g, "Hall").points), 17.85);
    within(area(room(g, "Utility").points), 9);
    within(area(room(f1, "Bedroom").points), 20);
    within(area(room(f1, "Room 7").points), 18);
    // the porch wall is 20 cm, the rest of the front wall 30: their middles are 5 cm apart
    expect(room(g, "Hall").points).toEqual([[0, 4], [6, 4], [6, 7], [3, 7], [3, 6.95], [0, 6.95]]);
    expect(room(g, "Kitchen").points).toContainEqual([5, 4]);
    expect(room(g, "Living room").points).toContainEqual([5, 4]);
  });

  it("puts doors and windows on their walls, in the room they open into, hinged as drawn", async () => {
    const { plan, summary } = await imported();
    const [g, f1] = plan.floors;
    expect(g.openings.map((_, i) => where(g, i))).toEqual([
      { at: [1.8, 6.95], room: "Hall" }, { at: [4.4, 4], room: "Living room" }, { at: [5.5, 4], room: "Hall" },
      { at: [6, 5.6], room: "Hall" }, { at: [5, 2], room: "Living room" }, { at: [1.2, 0], room: "Living room" },
      { at: [5.85, 0], room: "Kitchen" }, { at: [0, 2.3], room: "Living room" }, { at: [9, 5.45], room: "Utility" },
    ]);
    expect(g.openings.map((o) => [o.kind, o.style ?? null, o.swing])).toEqual([
      ["door", null, "in"], ["door", null, "in"], ["door", null, "in"], ["door", null, "in"], ["passage", null, "in"],
      ["door", "french", "in"], ["window", null, "in"], ["window", null, "in"], ["window", null, "in"],
    ]);
    // the front door's hinge is towards +x (its model is turned round); the mirrored kitchen door's too
    expect(g.openings.slice(0, 4).map((o) => o.hinge)).toEqual(["right", "right", "right", "left"]);
    expect(g.openings[0]).toMatchObject({ width: 1.015, height: 2.085, sill: 0 });
    expect(g.openings[6]).toMatchObject({ width: 0.91, height: 1.34, sill: 0.87 });
    // the outward opening window belongs to the bedroom and swings out of it
    expect(f1.openings[5]).toMatchObject({ kind: "window", swing: "out", room_id: room(f1, "Bedroom 2").id });
    expect(summary.left).toEqual(["labels, dimension lines and drawn lines", "Roof window at 2.5, 2.0 is on no room edge"]);
    for (const f of plan.floors) expect(layoutWalls(f, plan.settings).orphans).toEqual([]);
  });

  it("maps furniture and lights by catalogue id and name, and brings the rest in as boxes", async () => {
    const { plan, summary } = await imported();
    const [g, f1] = plan.floors;
    expect(g.furniture.map((x) => x.type)).toEqual([
      "sofa", "coffee_table", "tv_board", "armchair", "plant", "sink", "dishwasher", "stove", "kitchen", "fridge", "kitchen_wall",
      "column", "table", "chair", "chair", "lamp_pendant", "stairs", "coat_rack", "lamp_wall", "washer", "radiator", "column", "column",
    ]);
    expect(f1.furniture.map((x) => x.type)).toEqual([
      "bed", "nightstand", "nightstand", "wardrobe", "bathtub", "wc", "washbasin", "shower", "lamp_ceiling", "bed_single", "desk", "tv_wall",
    ]);
    expect(summary.boxes).toEqual(["Hood", "Mannequin", "Ironing board"]);
    const sofa = g.furniture[0];
    expect(sofa).toMatchObject({ x: 2.3, z: 3.45, rotation: 180, w: 1.47, d: 0.87, h: 0.87 });
    // Sweet Home 3D's y runs down the plan like our z, and its angles turn the same way: the
    // armchair by the left wall (angle 3π/2) faces into the room, towards +x
    const chair = g.furniture[3];
    const r = (chair.rotation * Math.PI) / 180;
    expect([chair.x, chair.z, Math.round(-Math.sin(r)), Math.abs(Math.round(Math.cos(r)))]).toEqual([0.7, 3.35, 1, 0]);
    expect(g.furniture[10].y).toBe(1.45);
    expect(g.furniture[15].y).toBeUndefined();
    expect(f1.furniture[0].mirror).toBe(true);
    expect(f1.furniture[11].y).toBe(1.2);
  });

  it("keeps walls on no room edge as walls of their own, a curved one as short straight pieces", async () => {
    const { plan } = await imported();
    const walls = plan.floors[0].walls;
    expect(walls).toHaveLength(7);
    expect(walls[0].a).toEqual([10, 1.5]);
    expect(walls[6].b).toEqual([12, 3.5]);
    expect(walls.every((w) => w.thickness === 0.2 && w.height === 1.2)).toBe(true);
    // all on a circle of 2 m round (10, 3.5)
    for (const w of walls) for (const p of [w.a, w.b]) expect(Math.hypot(p[0] - 10, p[1] - 3.5)).toBeCloseTo(2, 2);
    expect(plan.floors[1].walls).toEqual([]);
    expect(arcPoints([0, 0], [1, 0], 0)).toEqual([[0, 0], [1, 0]]);
  });

  it("gives back a plan that normalizePlan leaves as it is", async () => {
    const { plan } = await imported();
    expect(normalizePlan(structuredClone(plan))).toEqual(plan);
  });

  it("reads a home without levels as one floor", () => {
    const draft = home(`<wall id='a' xStart='0' yStart='0' xEnd='400' yEnd='0' thickness='20'/>
      <room><point x='10' y='10'/><point x='390' y='10'/><point x='390' y='290'/><point x='10' y='290'/></room>
      <pieceOfFurniture catalogId='Someone#thing' name='Double bed' x='200' y='150' width='160' depth='200' height='50'/>`);
    const { plan, summary } = buildPlan(draft);
    expect(plan.floors.map((f) => [f.name, f.elevation, f.height])).toEqual([["Ground Floor", 0, 2.5]]);
    // only the top edge has a wall in Sweet Home 3D
    expect(plan.floors[0].rooms[0].points).toEqual([[0, 0], [3.8, 0], [3.8, 2.9], [0, 2.9]]);
    expect(summary.left).toEqual(["3 room sides without a wall (VirtuHome draws one)"]);
    expect(plan.floors[0].furniture[0].type).toBe("bed");
    expect(plan.settings.north).toBe(0);
  });

  it("says what is wrong with a file it can't read", async () => {
    await expect(importSh3d(new TextEncoder().encode("<home/>"))).rejects.toThrow(/not a Sweet Home 3D file/);
    expect(() => sh3dDraft(parseXml("<plan/>"))).toThrow(/not a Sweet Home 3D home/);
  });
});
