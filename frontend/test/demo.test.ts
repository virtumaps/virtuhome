import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { demoConfig, demoSession, type DemoView } from "../src/ui/demo";
import { demoHass } from "../src/demo/hass";
import { DEMO_PLAN } from "../src/demo/plan";
import { normalizePlan, type Plan } from "../src/model/plan";
import type { Hass } from "../src/live/hass";
import { saveRefused, type ViewConfig } from "../src/ui/view";

/** The panel's view config, with everything that could reach Home Assistant or save. */
const PANEL: ViewConfig = {
  editable: true, quality: "high", walls: "low", stats: false,
  save: async () => 1, dev_extensions: ["/dev/ext/wall_tablet.js"], popup_camera: "camera.front", alarm: "alarm_control_panel.home",
};

/** A stand-in for the demo's VhView: what it was made with, and every Home Assistant it was handed. */
class FakeView implements DemoView {
  handed: Hass[] = [];
  destroyed = 0;
  constructor(readonly config: ViewConfig, readonly plan: Plan) {}
  set hass(h: Hass | null) {
    if (h) this.handed.push(h);
  }
  get hass(): Hass | null {
    return this.handed[this.handed.length - 1] ?? null;
  }
  destroy(): void {
    this.destroyed++;
  }
}

const open = () => demoSession((config, plan) => new FakeView(config, plan), PANEL);

describe("the demo home inside Home Assistant", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-21T14:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("gets a view that can't edit or save and loads no extensions", () => {
    const c = demoConfig(PANEL);
    expect(c).toEqual({ quality: "high", walls: "low", stats: false, demo: true, editable: false });
    expect(c.save).toBeUndefined();
    expect(c.dev_extensions).toBeUndefined();
    const { view, close } = open();
    expect(view.config.demo).toBe(true);
    expect(view.config.editable).toBe(false);
    close();
  });

  it("shows the demo house with pretend states, never the user's", () => {
    const { view, close } = open();
    expect(view.plan.name).toBe("Demo house");
    expect(view.plan).toEqual(normalizePlan(structuredClone(DEMO_PLAN)));
    expect(view.handed.length).toBe(1);
    expect(view.hass!.user?.id).toBe("demo");
    close();
  });

  it("makes saving impossible while it shows, in the demo and in the user's own editor under it", () => {
    expect(saveRefused(PANEL, false)).toBeNull();
    expect(saveRefused(PANEL, true)).toBe("Close the demo first");
    expect(saveRefused(demoConfig(PANEL), false)).toBe("The demo can't save");
  });

  it("can't save, restore or follow a plan through its pretend Home Assistant", async () => {
    const { view, close } = open();
    const h = view.hass!;
    await expect(h.callWS({ type: "virtuhome/plan/save", plan: {} })).rejects.toThrow();
    await expect(h.callWS({ type: "virtuhome/history/list" })).rejects.toThrow();
    await expect(h.callWS({ type: "virtuhome/history/restore", snapshot_id: "x" })).rejects.toThrow();
    await expect(h.connection.subscribeMessage(() => undefined, { type: "virtuhome/plan/subscribe" })).rejects.toThrow();
    close();
  });

  it("switches its pretend devices when tapped", async () => {
    const { view, close } = open();
    const before = view.hass!.states["light.stairs"].state;
    await view.hass!.callService("light", "toggle", {}, { entity_id: "light.stairs" });
    expect(view.hass!.states["light.stairs"].state).toBe(before === "on" ? "off" : "on");
    expect(view.hass!.user?.id).toBe("demo");
    close();
  });

  it("changes by itself until it closes, and leaves what was tapped alone for a while", async () => {
    const { view, close } = open();
    await view.hass!.callService("light", "turn_on", {}, { entity_id: "light.stairs" });
    const first = JSON.stringify(view.hass!.states);
    vi.advanceTimersByTime(45_000);
    const seen = view.handed.length;
    expect(seen).toBeGreaterThan(5);
    expect(JSON.stringify(view.hass!.states)).not.toBe(first);
    expect(view.handed.every((h) => h.user?.id === "demo")).toBe(true);
    expect(view.hass!.states["light.stairs"].state).toBe("on");
    close();
    expect(view.destroyed).toBe(1);
    vi.advanceTimersByTime(120_000);
    expect(view.handed.length).toBe(seen);
    close();
    expect(view.destroyed).toBe(1);
  });

  it("has the sky of the user's place: day there, day in the demo", () => {
    // 14:00 UTC: afternoon in London, the middle of the night in Sydney
    const sun = (place?: { latitude: number; longitude: number }) => demoHass(normalizePlan(DEMO_PLAN), () => undefined, { place }).states["sun.sun"];
    expect(sun().state).toBe("above_horizon");
    expect(sun({ latitude: -33.87, longitude: 151.21 }).state).toBe("below_horizon");
    const s = demoSession((config, plan) => new FakeView(config, plan), PANEL, { latitude: -33.87, longitude: 151.21, time_zone: "Australia/Sydney" });
    expect(s.view.hass!.states["sun.sun"].state).toBe("below_horizon");
    expect(s.view.hass!.config).toEqual({ latitude: -33.87, longitude: 151.21, time_zone: "Australia/Sydney" });
    s.close();
  });
});
