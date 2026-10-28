import { describe, expect, it } from "vitest";
import { FURNITURE, styleOptions } from "../src/scene/furniture-lib";
import { binColours, BIN_WASTES, holdsPost, POST_TYPES, wasteKind } from "../src/scene/bins";
import { GARDEN_OPTIONS } from "../src/scene/garden";
import { HassLive } from "../src/live/live";
import { normalizePlan } from "../src/model/plan";
import type { Hass } from "../src/live/hass";
import { buildFloor } from "../src/scene/build";
import { NIGHT } from "../src/scene/palette";

describe("bins and post boxes", () => {
  it("are garden pieces, bins swapping for bins and post boxes for post boxes", () => {
    for (const type of [...Object.keys(BIN_WASTES), ...POST_TYPES]) {
      expect(FURNITURE[type]?.category, type).toBe("outdoor");
      expect(GARDEN_OPTIONS[type], type).toBeDefined();
    }
    expect(styleOptions("bin_240")).toEqual(expect.arrayContaining(["bin_140", "bin_360", "bin_communal", "food_caddy", "recycling_box"]));
    expect(styleOptions("bin_240")).not.toContain("parcel_box");
    expect(styleOptions("parcel_box")).toEqual(expect.arrayContaining(["postbox_wall", "postbox_post"]));
  });

  it("hold their own waste where their type allows it, else their type's usual, and nothing for other pieces", () => {
    expect(wasteKind({ type: "bin_240" })).toBe("general");
    expect(wasteKind({ type: "bin_240", waste: "garden" })).toBe("garden");
    expect(wasteKind({ type: "food_caddy", waste: "glass" })).toBe("food");
    expect(wasteKind({ type: "recycling_box", waste: "glass" })).toBe("glass");
    expect(wasteKind({ type: "recycling_box", waste: "rubble" as never })).toBe("recycling");
    expect(wasteKind({ type: "sofa", waste: "general" })).toBeNull();
  });

  it("start from the country's colours for their waste, else the usual ones", () => {
    expect(binColours("DE", "recycling")).toEqual(["#3c4045", "#e6b81e"]);
    expect(binColours("au", "general")[1]).toBe("#c0392b");
    // a waste the country doesn't name, and a country there is no table for
    expect(binColours("GB", "recycling")).toEqual(binColours(null, "recycling"));
    expect(binColours("JP", "glass")).toEqual(binColours("", "glass"));
    for (const waste of ["general", "recycling", "garden", "food", "glass"] as const) {
      for (const c of binColours("NL", waste)) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("give a post box a window that glows, and a bin a lid of its own colour", () => {
    for (const type of POST_TYPES) {
      const [w, d, h] = FURNITURE[type].size;
      expect(FURNITURE[type].build(w, d, h).some((p) => p.glow === "screen"), type).toBe(true);
    }
    expect(FURNITURE.bin_240.trim).toEqual(["lid"]);
    expect(FURNITURE.bin_240.build(0.58, 0.74, 1.07).some((p) => p.role === "lid")).toBe(true);
  });

  it("reads a post sensor as holding post when it is on, counts some, or says so", () => {
    for (const s of ["on", "1", "3", "Mail", "detected"]) expect(holdsPost(s), s).toBe(true);
    for (const s of ["off", "0", "", "empty", "unknown"]) expect(holdsPost(s), s).toBe(false);
  });

  it("lights a post box's window while its sensor holds post", () => {
    const glow = (type: string, state: string) => {
      const l = new HassLive(normalizePlan({ floors: [] }));
      const at = "2026-10-21T08:00:00Z";
      l.update({ states: { "sensor.post": { entity_id: "sensor.post", state, attributes: {}, last_changed: at, last_updated: at } }, entities: {} } as unknown as Hass);
      return l.glowColor({ kind: "screen", entity: "sensor.post", room: 0, type });
    };
    expect(glow("postbox_wall", "2")).not.toBeNull();
    expect(glow("parcel_box", "0")).toBeNull();
    expect(glow("parcel_box", "unavailable")).toBeNull();
  });

  it("give every bin a part an extension's mark can light, and that mark lights only its own piece", () => {
    for (const type of Object.keys(BIN_WASTES)) {
      const [w, d, h] = FURNITURE[type].size;
      expect(FURNITURE[type].build(w, d, h).some((p) => p.glow === "screen"), type).toBe(true);
    }
    const plan = normalizePlan({
      version: 1, settings: {},
      floors: [{
        id: "g", name: "Ground Floor", elevation: 0, height: 2.6, rooms: [], openings: [], devices: [], walls: [],
        outdoor: [{ id: "front", name: "Front garden", kind: "lawn", points: [[0, 0], [6, 0], [6, 4], [0, 4]] }],
        furniture: [
          { id: "black", type: "bin_240", x: 1, z: 1, rotation: 0, w: 0.58, d: 0.74, h: 1.07 },
          { id: "blue", type: "bin_240", x: 2, z: 1, rotation: 0, w: 0.58, d: 0.74, h: 1.07, waste: "recycling" },
        ],
      }],
    });
    const fb = buildFloor(plan, 0, NIGHT, { low: false });
    const slots = fb.glows.filter((g) => g.item);
    expect(slots.map((g) => [g.item, g.type])).toEqual([["black", "bin_240"], ["blue", "bin_240"]]);
    const l = new HassLive(plan);
    expect(l.glowColor(slots[0])).toBeNull();
    l.itemMarks = new Map([["black", { glow: [1, 0.6, 0.2], text: "Black bin tomorrow" }], ["blue", { text: "Blue bin on Monday" }]]);
    expect(l.glowColor(slots[0])).toEqual([1, 0.6, 0.2]);
    expect(l.glowColor(slots[1])).toBeNull();
    expect(l.itemTag(plan.floors[0].furniture[0])).toEqual({ text: "Black bin tomorrow", lit: true });
    expect(l.itemTag(plan.floors[0].furniture[1])).toEqual({ text: "Blue bin on Monday", lit: false });
    l.itemMarks = null;
    expect(l.itemTag(plan.floors[0].furniture[0])).toBeNull();
  });
});
