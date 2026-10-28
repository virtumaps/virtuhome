import { afterEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { EN } from "../src/i18n/en";
import { EN_EDITOR } from "../src/i18n/en-editor";
import { format, language, LANGUAGES, pickLanguage, t, th, useLanguage, type Text } from "../src/i18n";
import { t as te } from "../src/i18n/editor";
import { FURNITURE } from "../src/scene/furniture-lib";
import { anOpening, openingName, wrapWords } from "../src/editor/plan2d";

const SRC = new URL("../src/", import.meta.url).pathname;
const sources = readdirSync(SRC, { recursive: true }).filter((f) => f.endsWith(".ts")).sort();
const read = (f: string) => readFileSync(SRC + f, "utf8");

describe("t()", () => {
  it("fills in the placeholders", () => {
    expect(t("checks.card.old", { version: "0.12.0", installed: "0.11.0" }))
      .toBe("This page runs VirtuHome 0.12.0, but 0.11.0 is installed: reload the page (on a tablet, clear the browser's cache).");
    expect(format("{a} and {b}", { a: 1 })).toBe("1 and {b}");
  });

  it("picks the form that goes with the count", () => {
    expect(t("checks.repairs.fence", { n: 1 })).toBe("left out 1 fence with fewer than two corners");
    expect(t("checks.repairs.fence", { n: 2 })).toBe("left out 2 fences with fewer than two corners");
    expect(t("checks.repairs.fence", { n: 0 })).toBe("left out 0 fences with fewer than two corners");
  });

  it("gives the editor both tables", () => {
    expect(te("editor.houses.use")).toBe("Use this house type");
    expect(te("checks.links.title")).toBe("Linked entities");
  });

  it("names doors and windows in words, never by their kind in the plan", () => {
    expect(openingName("passage")).toBe("Opening");
    expect(openingName("garage")).toBe("Garage door");
    expect(anOpening("passage")).toBe("an opening");
    expect(te("editor.drag.moveWhat", { what: anOpening("window") })).toBe("Move a window");
  });

  it("breaks a long text into lines that fit", () => {
    const lines = wrapWords(te("editor.plan.noFloorsYetDraw"), 40);
    expect(lines.length).toBeGreaterThan(2);
    expect(lines.every((l) => l.length <= 40)).toBe(true);
    expect(lines.join(" ")).toBe(te("editor.plan.noFloorsYetDraw"));
    expect(wrapWords("a verylongwordindeed b", 5)).toEqual(["a", "verylongwordindeed", "b"]);
  });

  it("escapes the text and what fills it in for innerHTML", () => {
    const html = th("checks.extensions.broken", { names: `<img src=x onerror="alert(1)">` });
    expect(html).not.toContain("<");
    expect(html).not.toContain('"');
    expect(html).toBe("&#60;img src=x onerror=&#34;alert(1)&#34;&#62; could not load.");
  });
});

// compile-time checks, made by npm run typecheck: these lines must not compile
function typeChecks(): void {
  // @ts-expect-error a key that doesn't exist
  t("checks.links.titel");
  // @ts-expect-error a placeholder left out
  t("checks.areas.found", { n: 1 });
  // @ts-expect-error the count left out
  t("checks.links.missing");
  // @ts-expect-error a placeholder the text doesn't have
  t("checks.links.title", { n: 1 });
  // @ts-expect-error the editor's texts only through i18n/editor, which loads them
  t("editor.houses.use");
}
void typeChecks;

describe("languages", () => {
  afterEach(async () => {
    await useLanguage({ language: "en" });
    for (const k of Object.keys(LANGUAGES)) delete LANGUAGES[k];
  });

  it("follows Home Assistant's language, else its main language, else English", () => {
    LANGUAGES.de = async () => ({});
    expect(pickLanguage("de")).toBe("de");
    expect(pickLanguage("de-CH")).toBe("de");
    expect(pickLanguage("fr")).toBe("en");
    expect(pickLanguage("constructor")).toBe("en");
    expect(pickLanguage(undefined)).toBe("en");
  });

  it("loads a language when it is needed, with English for what it lacks", async () => {
    const load = vi.fn(async () => ({
      "checks.links.title": "Powiązane encje",
      "checks.repairs.fence": { one: "{n} płot", few: "{n} płoty", many: "{n} płotów", other: "{n} płotu" },
    }));
    LANGUAGES.pl = load;
    expect(t("checks.links.title")).toBe("Linked entities");
    await Promise.all([useLanguage({ locale: { language: "pl" }, language: "pl" }), useLanguage({ language: "pl" })]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(language()).toBe("pl");
    expect(t("checks.links.title")).toBe("Powiązane encje");
    expect(t("checks.links.ok")).toBe("Everything the plan links is in Home Assistant.");
    expect([1, 2, 5, 1.5].map((n) => t("checks.repairs.fence", { n }))).toEqual(["1 płot", "2 płoty", "5 płotów", "1.5 płotu"]);
  });

  it("stays in English when a language can't be loaded", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    LANGUAGES.nl = () => Promise.reject(new Error("offline"));
    await useLanguage({ language: "nl" });
    expect(language()).toBe("en");
    expect(t("checks.links.title")).toBe("Linked entities");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("the English table", () => {
  const all = { ...EN, ...EN_EDITOR } as Record<string, Text>;
  const forms = (text: Text) => (typeof text === "string" ? [text] : Object.values(text));
  const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  it("names each catalogue's entries after their ids", () => {
    for (const [type, def] of Object.entries(FURNITURE)) expect(def.label).toBe(`furniture.${type}`);
  });

  it("has each key once, in the view's table or the editor's", () => {
    expect(Object.keys(EN).filter((k) => k in EN_EDITOR)).toEqual([]);
  });

  it("has tidy texts", () => {
    for (const [key, text] of Object.entries(all)) {
      for (const s of forms(text)) {
        expect(s, key).not.toBe("");
        expect(s, key).toBe(s.trim());
        expect(s, key).not.toMatch(/ {2}/);
        // braces only around a placeholder's name
        expect(s.replace(/\{\w+\}/g, ""), key).not.toMatch(/[{}]/);
      }
    }
  });

  it("gives each text with counts a form for one and for others, with the same placeholders", () => {
    for (const [key, text] of Object.entries(all)) {
      if (typeof text === "string") continue;
      expect(Object.keys(text).sort(), key).toEqual(["one", "other"]);
      const n = (s: string) => names(s).filter((x) => x !== "n");
      expect(n(text.one!), key).toEqual(n(text.other));
    }
  });

  it("has no text the code doesn't use", () => {
    const literal = new Set<string>();
    const patterns: RegExp[] = [];
    for (const f of sources.filter((x) => !x.startsWith("i18n/en"))) {
      const code = read(f);
      // every quoted string, and the keys inside a template's ${} on their own
      for (const m of code.matchAll(/"((?:\\.|[^"\\\n])*)"|'((?:\\.|[^'\\\n])*)'|`((?:\\.|[^`\\])*)`/g)) literal.add(m[1] ?? m[2] ?? m[3]);
      for (const m of code.matchAll(/["'`]([a-z][\w-]*(?:\.[\w-]+)+)["'`]/g)) literal.add(m[1]);
      // a key put together in the code: `checks.repairs.${r}`
      for (const m of code.matchAll(/`([a-z][\w.]*\$\{[^`]*)`/g)) {
        const re = m[1].split(/\$\{[^}]*\}/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\w-]+");
        patterns.push(new RegExp(`^${re}$`));
      }
    }
    const unused = Object.keys(all).filter((k) => !literal.has(k) && !patterns.some((re) => re.test(k)));
    expect(unused).toEqual([]);
  });
});

describe("loading", () => {
  /** The modules a module imports up front (not `import type`, not import()). */
  const imports = (f: string): string[] => [...read(f).matchAll(/^(?:import|export) (?!type )[^;]*?from "(\.[^"]+)";/gm)].map((m) => {
    const parts = f.split("/").slice(0, -1);
    for (const p of m[1].split("/")) {
      if (p === "..") parts.pop();
      else if (p !== ".") parts.push(p);
    }
    const path = parts.join("/");
    return sources.includes(`${path}.ts`) ? `${path}.ts` : `${path}/index.ts`;
  });

  it("keeps the editor's English out of what the view loads up front", () => {
    const seen = new Set<string>();
    const visit = (f: string) => {
      if (seen.has(f)) return;
      seen.add(f);
      imports(f).forEach(visit);
    };
    visit("app.ts");
    expect(seen.has("ui/view.ts")).toBe(true);
    expect(seen.has("i18n/en.ts")).toBe(true);
    expect([...seen].filter((f) => f === "i18n/editor.ts" || f === "i18n/en-editor.ts" || f.startsWith("editor/"))).toEqual([]);
  });
});

/** The files whose text has moved into the table: text written straight into them is caught here. */
const SCANNED = [
  "ui/card.ts", "ui/card-editor.ts", "ui/checks.ts", "ui/demo.ts", "ui/energy.ts", "ui/errors.ts", "ui/panel.ts", "ui/setup.ts", "ui/sky.ts", "ui/view.ts",
  "editor/background.ts", "editor/editor.ts", "editor/house-types.ts", "editor/north.ts", "editor/plan2d.ts", "editor/roomfind-apply.ts", "editor/roomfind-client.ts",
  "import/draft.ts", "import/names.ts", "import/roomplan.ts", "import/sh3d.ts", "import/simple.ts", "import/xml.ts", "import/zip.ts",
  "live/ev.ts", "starters/houses.ts",
  "scene/bins.ts", "scene/devices.ts", "scene/fences.ts", "scene/finishes.ts", "scene/garden.ts", "scene/paving.ts", "scene/roofs.ts",
];

/** Strings in them that look like text but aren't shown to users. */
const NOT_TEXT: Record<string, string[]> = {
  // class lists and key names
  "editor/editor.ts": ['"ed-btn ghost small"', 'e.key === "Backspace"'],
  "editor/plan2d.ts": ['"ed-btn ghost small"', 'e.key === "Enter"', 'e.key === "Escape"', 'e.key === "Delete"'],
  "editor/roomfind-client.ts": ['new DOMException("Stopped", "AbortError")'],
  "editor/north.ts": ['method: "POST"'],
  "import/sh3d.ts": ['"Home.xml"'],
  "import/names.ts": ["export const plain ="],
  // a mistake in a house type's drawing, for whoever draws them
  "starters/houses.ts": ["no wall of ${"],
  // what Copy details copies and the error reports say: read by whoever fixes the bug, in English
  "ui/errors.ts": ["(\\d+)", "const SYSTEMS", "Another browser", "graphics, ${browserName(ua)}", "`In: ${info.where}`", "the details could not be worked out"],
};

/** What text for users looks like in code: a title or label, a capitalised word or phrase, a few words, a text node. */
const LOOKS_LIKE_TEXT = [
  /\b(?:title|aria-label|alt|placeholder)\s*[=:]\s*["'`][A-Za-z]{2,}/,
  /(?:^|[^\w$.])["'`][A-Z][A-Za-z’']+(?:[ ,.:;!?…][^"'`]*)?["'`]/,
  /["'`][^"'`<>]*?\b[a-z]{2,} [a-z]{2,} [a-z]{2,}\b[^"'`<>]*["'`]/,
  /(?<!=)>\s*[A-Z][a-z]+[^<>"'`]*<\//,
];

describe("no text for users written into the code", () => {
  it.each(SCANNED)("%s", (f) => {
    const allowed = NOT_TEXT[f] ?? [];
    let comment = false;
    const found = read(f).split("\n").flatMap((line, i) => {
      if (comment) {
        comment = !line.includes("*/");
        return [];
      }
      if (/^\s*\/\*/.test(line)) {
        comment = !line.includes("*/");
        return [];
      }
      const code = line.replace(/^\s*\/\/.*$/, "").replace(/\s\/\/ .*$/, "");
      if (/console\.\w+\(/.test(code) || allowed.some((a) => code.includes(a))) return [];
      return LOOKS_LIKE_TEXT.some((re) => re.test(code)) ? [`${f}:${i + 1}: ${line.trim()}`] : [];
    });
    // put these into src/i18n (see docs/DEVELOPMENT.md), or into NOT_TEXT if no user sees them
    expect(found).toEqual([]);
  });
});
