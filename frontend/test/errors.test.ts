import { afterEach, describe, expect, it, vi } from "vitest";
import { callEach, isolate } from "../src/ui/errors";
import { extensionFailures, loadExtensions, registerView, type ViewHandle } from "../src/ext/api";
import type { Hass } from "../src/live/hass";

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
