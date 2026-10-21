import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { privateStrings, stripPrivate } from "../src/live/strip";
import { browserName, callEach, describeError, errorDetails, isolate } from "../src/ui/errors";
import { extensionFailures, loadExtensions, registerView, type ViewHandle } from "../src/ext/api";
import { normalizePlan } from "../src/model/plan";
import type { Hass } from "../src/live/hass";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

const plan = () => normalizePlan({
  version: 1,
  name: "Rose Cottage",
  floors: [{
    id: "g", name: "Downstairs", elevation: 0, height: 2.6, walls: [], openings: [], furniture: [],
    rooms: [{ id: "k", name: "Kitchen", area_id: "kitchen_area", temperature: "sensor.kitchen_temp", points: rect(0, 0, 4, 4) }],
    devices: [{ id: "d1", entity: "light.pantry_strip", x: 2, z: 2 }],
  }],
});

const state = (id: string, name: string) => ({ entity_id: id, state: "on", attributes: { friendly_name: name }, last_changed: "", last_updated: "" });
const hass = () => ({
  states: { "light.kitchen": state("light.kitchen", "Ceiling Lamp"), "select.boiler_mode": state("select.boiler_mode", "Boiler mode") },
  entities: { "light.kitchen": { entity_id: "light.kitchen", name: "Island lights" } },
  devices: { d: { id: "d", name: "Hue Bridge", name_by_user: "Sarah's lamp" } },
  areas: { snug: { area_id: "snug", name: "The Snug", aliases: ["Den room"] } },
  floors: { attic: { floor_id: "attic", name: "Loft Floor" } },
  user: { id: "u", name: "Kadir", is_admin: true },
  config: { location_name: "Oak House" },
} as unknown as Hass);

describe("stripping names and ids", () => {
  const names = privateStrings(hass(), plan());

  it("collects names and entity ids from Home Assistant and the plan", () => {
    for (const s of ["light.kitchen", "Ceiling Lamp", "Island lights", "select.boiler_mode", "Sarah's lamp", "Hue Bridge", "The Snug",
      "Den room", "snug", "Loft Floor", "Kadir", "Oak House", "Rose Cottage", "Downstairs", "Kitchen", "kitchen_area",
      "sensor.kitchen_temp", "light.pantry_strip"]) {
      expect(names).toContain(s);
    }
    // ids of the plan's own parts and finishes are not names
    expect(names).not.toContain("k");
    expect(names).not.toContain("d1");
  });

  it("takes out names, case and all, and entity ids", () => {
    const out = stripPrivate("Cannot light the kitchen (Ceiling Lamp) in THE SNUG for Kadir: select.boiler_mode", names);
    expect(out).toBe("Cannot light the <name> (<name>) in <name> for <name>: <entity>");
  });

  it("takes out entity ids Home Assistant doesn't know, whole", () => {
    expect(stripPrivate("binary_sensor.front_door and light.kitchen_ceiling are gone", names)).toBe("<entity> and <entity> are gone");
    // not property names in a message
    expect(stripPrivate("e.floors is undefined")).toBe("e.floors is undefined");
  });

  it("keeps a script's file and line, and nothing else of an address", () => {
    const stack = "at tick (http://homeassistant.local:8123/virtuhome_static/app/app.js?v=0.11.0:1:2345)\n"
      + "tick@https://abc123.ui.nabu.casa/virtuhome_ext/security-1.1.0.js:12:9\n"
      + "see https://192.168.1.20:8123/api/camera_proxy/camera.drive?token=abc";
    expect(stripPrivate(stack)).toBe("at tick (app.js:1:2345)\ntick@security-1.1.0.js:12:9\nsee <url>");
  });

  it("takes out tokens, keys, IP and email addresses", () => {
    const text = "token eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ4In0.c2lnbmF0dXJl, vhl1.ZGF0YWRhdGFkYXRhZGF0YWRhdGFkYXRhZGF0YQ.sig, "
      + "key VH-TEST-KEY-0000-QW7Z at 192.168.1.20 or fe80:0:0:0:1ff:fe23:4567:890a for kadir@example.co.uk";
    const out = stripPrivate(text);
    for (const secret of ["eyJ", "ZGF0YW", "QW7Z", "192.168", "fe80", "kadir@"]) expect(out).not.toContain(secret);
    expect(out).toContain("<token>");
    expect(out).toContain("<key>");
    expect(out).toContain("<ip>");
    expect(out).toContain("<email>");
  });

  it("takes out the address Home Assistant is reached at, without its https:// too", () => {
    vi.stubGlobal("location", { hostname: "oak-house.duckdns.org" });
    try {
      expect(stripPrivate("Failed to fetch oak-house.duckdns.org:8123", privateStrings(null, null))).toBe("Failed to fetch <name>:8123");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("leaves names shorter than three letters alone", () => {
    expect(privateStrings({ states: {}, areas: { tv: { area_id: "tv", name: "TV" } } } as unknown as Hass, null)).toEqual([]);
  });

  it("details for Copy details hold no names", () => {
    const err = new TypeError("Can't draw Kitchen with light.kitchen");
    err.stack = "TypeError: Can't draw Kitchen with light.kitchen\n    at build (http://ha.local:8123/virtuhome_static/app/chunk-ABC.js:3:14)";
    const text = errorDetails(err, { where: "plan", graphics: "Standard", hass: hass(), plan: plan() });
    expect(text).toMatch(/^VirtuHome \S+, Standard graphics, /);
    expect(text).toContain("In: plan\nTypeError: Can't draw <name> with <entity>\nat build (chunk-ABC.js:3:14)");
    expect(text).not.toMatch(/kitchen|ha\.local/i);
  });
});

describe("describing errors", () => {
  it("drops the message Chrome repeats at the top of the stack, and keeps 12 lines", () => {
    const err = new Error("broken");
    err.stack = ["Error: broken", ...Array.from({ length: 20 }, (_, i) => `    at f${i} (app.js:1:${i})`)].join("\n");
    const { message, stack } = describeError(err);
    expect(message).toBe("Error: broken");
    expect(stack.split("\n")).toHaveLength(12);
    expect(stack.startsWith("at f0 (app.js:1:0)")).toBe(true);
  });

  it("describes whatever was thrown", () => {
    expect(describeError("plain text")).toEqual({ message: "plain text", stack: "" });
    expect(describeError(null).message).toBe("null");
    expect(describeError({ message: "x".repeat(5000) }).message).toHaveLength(1200);
  });

  it("names the browser and system only", () => {
    expect(browserName("Mozilla/5.0 (Linux; Android 11; KFONWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/131.3.1 like Chrome/131.0.6778.260 Safari/537.36"))
      .toBe("Silk 131 on Android");
    expect(browserName("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"))
      .toBe("Safari 17 on iOS");
    expect(browserName("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0")).toBe("Firefox 132 on Windows");
    expect(browserName("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 Home Assistant/2024.10.0-14567"))
      .toBe("Chrome 130 in the Home Assistant app on Android");
  });
});

describe("extensions that throw", () => {
  afterEach(() => vi.restoreAllMocks());

  it("a function called per room is set aside after it throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    let calls = 0;
    const tint = isolate((_a: number, _b: number) => {
      calls++;
      throw new Error("bad tint");
    }, null);
    expect(tint(1, 2)).toBeNull();
    expect(tint(1, 2)).toBeNull();
    expect(calls).toBe(1);
    expect(console.error).toHaveBeenCalledTimes(1);
    // a tap handler is called every time
    let taps = 0;
    const tap = isolate(() => {
      taps++;
      throw new Error("bad tap");
    }, undefined, "extension", false);
    tap(0, 0);
    tap(0, 0);
    expect(taps).toBe(2);
  });

  it("one listener that throws doesn't stop the others", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const got: number[] = [];
    callEach([(v: number) => got.push(v), () => {
      throw new Error("bad listener");
    }, (v: number) => got.push(v * 10)], 4);
    expect(got).toEqual([4, 40]);
  });

  it("an extension that throws in setup or on a view leaves the others working", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const module = (body: string) => `data:text/javascript,${encodeURIComponent(body)}`;
    const urls = [
      module(`export default { id: "bad_setup", name: "Bad setup", apiVersion: 1, setup() { throw new Error("no"); } };`),
      module(`export default { id: "bad_view", name: "Bad view", apiVersion: 1, setup(ctx) { ctx.onView(() => { throw new Error("no"); }); } };`),
      module(`export default { id: "good", name: "Good", apiVersion: 1, setup(ctx) { ctx.onView((v) => { v.toast("hello"); return () => { throw new Error("no"); }; }); } };`),
    ];
    const toasts: string[] = [];
    const unregister = registerView({ toast: (t: string) => toasts.push(t) } as unknown as ViewHandle);
    await loadExtensions({ callWS: () => Promise.reject(new Error("no integration")) } as unknown as Hass, urls);
    expect(toasts).toEqual(["hello"]);
    expect(extensionFailures().map((f) => f.name)).toEqual([urls[0]]);
    // a cleanup that throws doesn't stop the view going away
    expect(() => unregister()).not.toThrow();
  });
});

describe("reporting errors to the integration", () => {
  type Sent = Record<string, unknown>;
  let errs: typeof import("../src/ui/errors");
  let sent: Sent[];
  const fakeHass = (callWS: (msg: Sent) => Promise<unknown> = (msg) => (sent.push(msg), Promise.resolve({ kept: true }))) =>
    ({ ...hass(), callWS } as unknown as Hass);

  beforeEach(async () => {
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    errs = await import("../src/ui/errors");
    sent = [];
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("sends each error once, stripped of names", () => {
    errs.reportFrom(() => ({ hass: fakeHass(), plan: plan(), graphics: "Tablet" }));
    const err = new RangeError("No room for Kitchen near light.kitchen");
    err.stack = "RangeError: No room for Kitchen near light.kitchen\n    at build (http://ha.local:8123/virtuhome_static/app/chunk-ABC.js:3:14)";
    errs.logError(err, "plan");
    errs.reportError(err, "plan");
    expect(sent).toEqual([{
      type: "virtuhome/errors/report", where: "plan", message: "RangeError: No room for <name> near <entity>",
      stack: "at build (chunk-ABC.js:3:14)", version: "dev", graphics: "Tablet", browser: expect.any(String),
    }]);
  });

  it("sends a few a minute at most", () => {
    vi.useFakeTimers();
    errs.reportFrom(() => ({ hass: fakeHass(), plan: null, graphics: "Tablet" }));
    for (let i = 0; i < 8; i++) errs.reportError(new Error(`error ${i}`), "view");
    expect(sent).toHaveLength(5);
    vi.advanceTimersByTime(61_000);
    errs.reportError(new Error("error 6"), "view");
    expect(sent.map((m) => m.message)).toEqual(["Error: error 0", "Error: error 1", "Error: error 2", "Error: error 3", "Error: error 4", "Error: error 6"]);
  });

  it("never reports an error while reporting, and never throws", () => {
    let calls = 0;
    errs.reportFrom(() => ({
      hass: fakeHass(() => {
        calls++;
        // sending fails and fails again while failing
        errs.reportError(new Error("while sending"), "view");
        throw new Error("no connection");
      }),
      plan: null, graphics: "Tablet",
    }));
    expect(() => errs.reportError(new Error("first"), "view")).not.toThrow();
    expect(calls).toBe(1);
    // an integration without the command answers with an error: nothing more happens
    errs.reportFrom(() => ({ hass: fakeHass(() => Promise.reject(new Error("unknown command"))), plan: null, graphics: "Tablet" }));
    expect(() => errs.reportError(new Error("second"), "view")).not.toThrow();
  });

  it("keeps errors from before Home Assistant came until it does", () => {
    let h: Hass | null = null;
    errs.reportFrom(() => ({ hass: h, plan: null, graphics: "Standard" }));
    errs.reportError(new Error("too early"), "card");
    expect(sent).toEqual([]);
    h = fakeHass();
    errs.sendHeld();
    expect(sent.map((m) => [m.where, m.message])).toEqual([["card", "Error: too early"]]);
  });
});
