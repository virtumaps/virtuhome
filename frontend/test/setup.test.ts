import { describe, expect, it } from "vitest";
import { cardOnDashboard, isNewHome, setupComplete, setupItems, showChecklist } from "../src/ui/setup";
import { emptyPlan, normalizePlan, type Plan } from "../src/model/plan";
import type { Hass } from "../src/live/hass";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

const hass = (areas: string[] = ["hallway", "kitchen"], callWS: Hass["callWS"] = async () => { throw new Error("no"); }): Hass => ({
  states: {},
  areas: Object.fromEntries(areas.map((a) => [a, { area_id: a, name: a }])),
  callService: async () => undefined,
  callWS,
  connection: { subscribeMessage: async () => async () => undefined },
});

const plan = (opts: { rooms?: { id: string; area_id: string | null }[]; devices?: number; north?: number; setup?: unknown } = {}): Plan => normalizePlan({
  version: 1,
  settings: { north: opts.north ?? 0, ...(opts.setup ? { setup: opts.setup } : {}) },
  floors: [{
    id: "g", name: "Ground Floor", elevation: 0, height: 2.6,
    rooms: (opts.rooms ?? []).map((r, i) => ({ ...r, name: r.id, points: rect(i * 3, 0, i * 3 + 3, 3) })),
    openings: [], furniture: [], walls: [],
    devices: Array.from({ length: opts.devices ?? 0 }, (_, i) => ({ id: `d${i}`, entity: `light.l${i}`, x: 1, z: 1 })),
  }],
});

const byId = (p: Plan, h: Hass | null = hass(), card: boolean | null = null) =>
  Object.fromEntries(setupItems(p, h, { cardOnDashboard: card }).map((it) => [it.id, it]));

describe("first run", () => {
  it("is a new home until a room exists, with or without floors", () => {
    expect(isNewHome(null)).toBe(true);
    expect(isNewHome(emptyPlan())).toBe(true);
    expect(isNewHome(plan())).toBe(true);
    expect(isNewHome(plan({ rooms: [{ id: "hallway", area_id: null }] }))).toBe(false);
  });
});

describe("getting started checklist", () => {
  it("starts with nothing done", () => {
    const items = setupItems(emptyPlan(), hass(), { cardOnDashboard: null });
    expect(items.map((it) => it.id)).toEqual(["home", "areas", "devices", "north", "card", "tablet"]);
    expect(items.every((it) => !it.done)).toBe(true);
    expect(showChecklist(emptyPlan(), items)).toBe(true);
  });

  it("counts rooms, linked areas and placed devices from the plan", () => {
    const it1 = byId(plan({ rooms: [{ id: "hallway", area_id: "hallway" }, { id: "kitchen", area_id: null }] }));
    expect(it1.home.done).toBe(true);
    expect(it1.areas.done).toBe(false);
    expect(it1.devices.done).toBe(false);
    const it2 = byId(plan({ rooms: [{ id: "hallway", area_id: "hallway" }, { id: "kitchen", area_id: "kitchen" }], devices: 2 }));
    expect(it2.areas.done).toBe(true);
    expect(it2.devices.done).toBe(true);
  });

  it("calls the areas done when no area is left for the unlinked rooms", () => {
    const p = plan({ rooms: [{ id: "hallway", area_id: "hallway" }, { id: "porch", area_id: null }] });
    expect(byId(p, hass(["hallway"])).areas.done).toBe(true);
    expect(byId(p, hass(["hallway", "kitchen"])).areas.done).toBe(false);
    // rooms needed: no rooms is never done, whatever the areas
    expect(byId(plan(), hass([])).areas.done).toBe(false);
  });

  it("sees north once it is turned, and takes a tick for it otherwise", () => {
    expect(byId(plan({ north: 305 })).north).toMatchObject({ done: true, manual: false });
    expect(byId(plan()).north).toMatchObject({ done: false, manual: true });
    expect(byId(plan({ setup: { done: ["north"] } })).north.done).toBe(true);
  });

  it("knows the card is on a dashboard, or takes a tick", () => {
    expect(byId(plan(), hass(), true).card.done).toBe(true);
    expect(byId(plan(), hass(), false).card.done).toBe(false);
    expect(byId(plan({ setup: { done: ["card"] } }), hass(), false).card.done).toBe(true);
  });

  it("is complete without the optional wall tablet, and then hides", () => {
    const p = plan({ rooms: [{ id: "hallway", area_id: "hallway" }, { id: "kitchen", area_id: "kitchen" }], devices: 1, north: 10, setup: { done: ["card"] } });
    const items = setupItems(p, hass(), { cardOnDashboard: null });
    expect(items.find((it) => it.id === "tablet")!.done).toBe(false);
    expect(setupComplete(items)).toBe(true);
    expect(showChecklist(p, items)).toBe(false);
  });

  it("hides when dismissed, and old or broken setup settings load", () => {
    const p = plan({ setup: { dismissed: true } });
    expect(showChecklist(p, setupItems(p, hass(), { cardOnDashboard: null }))).toBe(false);
    expect(plan({ setup: { done: "north", dismissed: "yes" } }).settings.setup).toEqual({ dismissed: false, done: [] });
    expect(plan({ setup: { done: ["north", 3] } }).settings.setup?.done).toEqual(["north"]);
    expect(plan().settings.setup).toBeUndefined();
  });
});

describe("card on a dashboard", () => {
  it("looks through every dashboard's config", async () => {
    const configs: Record<string, unknown> = {
      default: { views: [{ cards: [{ type: "entities" }] }] },
      tablet: { views: [{ panel: true, cards: [{ type: "custom:virtuhome-card", fill: true }] }] },
    };
    const ws = (async (msg: Record<string, unknown>) => {
      if (msg.type === "lovelace/dashboards/list") return [{ url_path: "tablet" }];
      if (msg.type === "lovelace/config") return configs[(msg.url_path as string | null) ?? "default"];
      throw new Error("unknown");
    }) as Hass["callWS"];
    expect(await cardOnDashboard(hass([], ws))).toBe(true);
    delete configs.tablet;
    expect(await cardOnDashboard(hass([], ws))).toBe(false);
  });

  it("doesn't know when it may not ask", async () => {
    expect(await cardOnDashboard(hass())).toBe(null);
  });
});
