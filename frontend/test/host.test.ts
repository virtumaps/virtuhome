import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Hass } from "../src/live/hass";
import { RELEASE_MS, ViewHost } from "../src/ui/host";
import type { VhView } from "../src/ui/view";

/** A view that only says what was done to it. */
class FakeView {
  done: string[] = [];
  editing = false;
  hass: Hass | null = null;
  connect() { this.done.push("connect"); }
  disconnect() { this.done.push("disconnect"); }
  destroy() { this.done.push("destroy"); }
}

class TestHost extends ViewHost {
  made: FakeView[] = [];
  cleared = 0;
  constructor(public page: { isConnected: boolean }) {
    super(page as unknown as HTMLElement);
    this.build();
  }
  protected get inner(): ShadowRoot {
    return { replaceChildren: () => this.cleared++ } as unknown as ShadowRoot;
  }
  protected make(): VhView {
    const v = new FakeView();
    this.made.push(v);
    return v as unknown as VhView;
  }
  protected failure(): { hass: Hass | null } {
    return { hass: null };
  }
  get current() {
    return this.view as unknown as FakeView | null;
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", globalThis);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const hass = { states: {} } as unknown as Hass;

describe("a view off the page", () => {
  it("is let go a while after it leaves, and made again with the last hass when it's back", () => {
    const page = { isConnected: true };
    const h = new TestHost(page);
    h.hass = hass;
    page.isConnected = false;
    h.disconnect();
    vi.advanceTimersByTime(RELEASE_MS - 1);
    expect(h.made[0].done).toEqual(["disconnect"]);
    vi.advanceTimersByTime(1);
    expect(h.made[0].done).toEqual(["disconnect", "destroy"]);
    expect(h.current).toBeNull();
    expect(h.cleared).toBe(1);
    page.isConnected = true;
    h.connect();
    expect(h.made).toHaveLength(2);
    expect(h.current?.hass).toBe(hass);
  });

  it("is kept when it comes back in time", () => {
    const page = { isConnected: true };
    const h = new TestHost(page);
    page.isConnected = false;
    h.disconnect();
    vi.advanceTimersByTime(RELEASE_MS / 2);
    page.isConnected = true;
    h.connect();
    vi.advanceTimersByTime(RELEASE_MS * 2);
    expect(h.made).toHaveLength(1);
    expect(h.made[0].done).toEqual(["disconnect", "connect"]);
  });

  it("waits while its editor is open", () => {
    const page = { isConnected: false };
    const h = new TestHost(page);
    h.made[0].editing = true;
    h.disconnect();
    vi.advanceTimersByTime(RELEASE_MS * 3);
    expect(h.made[0].done).not.toContain("destroy");
    h.made[0].editing = false;
    vi.advanceTimersByTime(RELEASE_MS);
    expect(h.made[0].done).toContain("destroy");
  });
});
