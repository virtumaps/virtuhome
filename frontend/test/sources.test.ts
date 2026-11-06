import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExtensionModule, ExtensionSource } from "../src/ext/api";
import type { Hass } from "../src/live/hass";

const hass = { states: {}, callWS: async () => null } as unknown as Hass;

function module(id: string, apiVersion = 5): ExtensionModule {
  return { id, name: id, apiVersion, setup: vi.fn() };
}

function source(id: string, mods: ExtensionModule[], extra: Partial<ExtensionSource> = {}): ExtensionSource {
  return {
    id, name: id,
    extensions: vi.fn(async () => mods.map((m) => ({ id: m.id, name: m.name, version: "1.0.0", load: async () => ({ default: m }) }))),
    ...extra,
  };
}

/** The extension API, freshly loaded, with whatever sources were queued on the page before it. */
async function load(queued: ExtensionSource[] = []) {
  vi.resetModules();
  vi.stubGlobal("window", { virtuhomeSources: queued });
  return import("../src/ext/api");
}

afterEach(() => vi.unstubAllGlobals());

describe("extension sources (an integration like VirtuHome Pro brings the extensions)", () => {
  it("takes sources queued before the core loaded, and those pushed after", async () => {
    const early = source("pro", []);
    const api = await load([early]);
    expect(api.extensionSources()).toEqual([early]);
    const w = window as unknown as { virtuhomeSources: { push(s: ExtensionSource): number; apiVersion: number } };
    expect(w.virtuhomeSources.apiVersion).toBe(api.EXT_API_VERSION);
    const late = source("other", []);
    w.virtuhomeSources.push(late);
    w.virtuhomeSources.push(source("pro", []));
    expect(api.extensionSources().map((s) => s.id)).toEqual(["pro", "other"]);
  });

  it("loads each source's extensions once, through the source's own load()", async () => {
    const energy = module("energy");
    const pro = source("pro", [energy], { automations: "virtuhome_pro/automations" });
    const api = await load([pro]);
    await api.loadExtensions(hass);
    await api.loadExtensions(hass);
    expect(pro.extensions).toHaveBeenCalledTimes(1);
    expect(energy.setup).toHaveBeenCalledTimes(1);
    expect(api.loaded.get("energy")).toEqual({ id: "energy", name: "energy", version: "1.0.0" });
  });

  it("a source that registers after the views started loads then, and says so", async () => {
    const api = await load();
    await api.loadExtensions(hass);
    const changed = vi.fn();
    api.onSources(changed);
    const security = module("security");
    (window as unknown as { virtuhomeSources: { push(s: ExtensionSource): void } }).virtuhomeSources.push(source("pro", [security]));
    await vi.waitFor(() => expect(security.setup).toHaveBeenCalled());
    await vi.waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
  });

  it("an extension that needs a newer core, or isn't one, shows as failed", async () => {
    const pro = source("pro", [module("network", 99)]);
    pro.extensions = async () => [
      { id: "network", name: "Network", version: "2.0.0", load: async () => ({ default: module("network", 99) }) },
      { id: "junk", name: "Junk", version: "1.0.0", load: async () => ({}) },
    ];
    const api = await load([pro]);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await api.loadExtensions(hass);
    expect(api.extensionFailures()).toEqual([
      { id: "network", name: "Network", newer: true },
      { id: "junk", name: "Junk", newer: false },
    ]);
  });
});
