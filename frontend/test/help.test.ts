import { afterEach, describe, expect, it, vi } from "vitest";
import { hintSeen, markHint, resetHints } from "../src/ui/help";
import { extNewsSeen, lineHtml, markExtNews, newsDue } from "../src/ui/news";
import { guideSections, news, newLines } from "../dev/news.mjs";

function storage(): Storage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, String(v)), removeItem: (k) => void m.delete(k), clear: () => m.clear(), key: () => null, length: 0 };
}

afterEach(() => vi.unstubAllGlobals());

describe("hints", () => {
  it("show once per person, and again after Show hints again", () => {
    vi.stubGlobal("localStorage", storage());
    expect(hintSeen("view.long")).toBe(false);
    markHint("view.long");
    markHint("view.long");
    expect(hintSeen("view.long")).toBe(true);
    expect(JSON.parse(localStorage.getItem("virtuhome.hints")!)).toEqual(["view.long"]);
    resetHints();
    expect(hintSeen("view.long")).toBe(false);
  });

  it("keep working with no storage (they show again next time)", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } });
    expect(hintSeen("editor.select")).toBe(false);
    expect(() => markHint("editor.select")).not.toThrow();
    expect(() => resetHints()).not.toThrow();
  });
});

describe("what's new", () => {
  it("shows after an update, not on a first install, once per version", () => {
    vi.stubGlobal("localStorage", storage());
    vi.stubGlobal("location", { search: "" });
    expect(newsDue("0.16.0")).toBe(false);
    expect(newsDue("0.16.0")).toBe(false);
    expect(newsDue("0.17.0")).toBe(true);
    localStorage.setItem("virtuhome.news", "0.17.0");
    expect(newsDue("0.17.0")).toBe(false);
  });

  it("never on a kiosk tablet or without storage", () => {
    vi.stubGlobal("localStorage", storage());
    localStorage.setItem("virtuhome.news", "0.16.0");
    vi.stubGlobal("location", { search: "?kiosk" });
    expect(newsDue("0.17.0")).toBe(false);
    vi.stubGlobal("location", { search: "" });
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => undefined });
    expect(newsDue("0.17.0")).toBe(false);
  });

  it("keeps an extension's news once per title", () => {
    vi.stubGlobal("localStorage", storage());
    expect(extNewsSeen("Household 1.1.0")).toBe(false);
    markExtNews("Household 1.1.0");
    expect(extNewsSeen("Household 1.1.0")).toBe(true);
  });

  it("shows bold and code from the changelog, and escapes the rest", () => {
    expect(lineHtml("**Try it free** under `Extras` <script>")).toBe("<b>Try it free</b> under <code>Extras</code> &#60;script&#62;");
  });

  it("takes the version's New lines from the changelog and finds their guide sections", () => {
    const changelog = "# Changelog\n\n## Unreleased\n\n### New\n- **Try it free** under Extras,\n  for 14 days.\n- A thing with no bold.\n\n### Fixed\n- Not this.\n\n## 0.16.0\n\n### New\n- Old.\n";
    expect(newLines(changelog, "0.17.0")).toEqual(["**Try it free** under Extras, for 14 days.", "A thing with no bold."]);
    expect(newLines(changelog, "0.16.0")).toEqual(["Old."]);
    const guide = "## Install\n\nText.\n\n## Extensions and licence keys\n\n**Try it free** shows…\n\n### Scan it (iPhone or iPad with LiDAR)\n";
    expect(guideSections(guide).map(([a]) => a)).toEqual(["install", "extensions-and-licence-keys", "scan-it-iphone-or-ipad-with-lidar"]);
    expect(news(changelog, guide, "0.17.0").map((n) => n.anchor)).toEqual(["extensions-and-licence-keys", null]);
  });
});
