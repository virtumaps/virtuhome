import { describe, expect, it } from "vitest";
import { FURNITURE, styleOptions } from "../src/scene/furniture-lib";
import { binColours, BIN_WASTES, holdsPost, POST_TYPES, wasteKind } from "../src/scene/bins";
import { GARDEN_OPTIONS } from "../src/scene/garden";
import { HassLive } from "../src/live/live";
import { normalizePlan } from "../src/model/plan";
import type { Hass } from "../src/live/hass";

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
});
