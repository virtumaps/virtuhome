import { describe, expect, it } from "vitest";
import { EN } from "../src/i18n/en";
import { EN_EDITOR } from "../src/i18n/en-editor";
import { DE } from "../src/i18n/de";
import { DE_EDITOR } from "../src/i18n/de-editor";
import { NL } from "../src/i18n/nl";
import { NL_EDITOR } from "../src/i18n/nl-editor";
import { EDITOR_LANGUAGES, LANGUAGES, pickLanguage, type Table, type Text } from "../src/i18n";

const names = (t: Text) => [...new Set((typeof t === "string" ? [t] : Object.values(t)).flatMap((s) => [...s!.matchAll(/\{(\w+)\}/g)].map((m) => m[1])))].sort();

const TABLES: [string, Table, Table][] = [
  ["de", DE as Table, EN as Table], ["de-editor", DE_EDITOR as Table, EN_EDITOR as Table],
  ["nl", NL as Table, EN as Table], ["nl-editor", NL_EDITOR as Table, EN_EDITOR as Table],
];

describe("languages", () => {
  it.each(TABLES)("%s has only English's keys, with the same placeholders", (_name, table, english) => {
    for (const [key, text] of Object.entries(table)) {
      expect(english[key], `${key} isn't an English key`).toBeDefined();
      // a text with counts keeps its forms, and every form its placeholders
      expect(typeof text, key).toBe(typeof english[key]);
      const want = names(english[key]).filter((n) => n !== "n" || typeof english[key] === "string" || names(english[key]).includes("n"));
      for (const form of typeof text === "string" ? [text] : Object.values(text)) {
        expect(names(form!), `${key}: ${form}`).toEqual(expect.arrayContaining(want.filter((n) => n !== "n")));
      }
      if (typeof text !== "string") expect(text.other, key).toBeDefined();
    }
  });

  it("follows Home Assistant's language, its main language, else English", () => {
    expect(Object.keys(LANGUAGES).sort()).toEqual(["de", "nl"]);
    expect(Object.keys(EDITOR_LANGUAGES).sort()).toEqual(["de", "nl"]);
    expect(pickLanguage("de")).toBe("de");
    expect(pickLanguage("de-CH")).toBe("de");
    expect(pickLanguage("nl-BE")).toBe("nl");
    expect(pickLanguage("fr")).toBe("en");
    expect(pickLanguage(undefined)).toBe("en");
  });

  it("puts the editor's texts in the editor's tables (a wall tablet never loads them)", () => {
    for (const [name, table, english] of TABLES) {
      const other = english === (EN as Table) ? (EN_EDITOR as Table) : (EN as Table);
      for (const key of Object.keys(table)) expect(other[key] === undefined || english[key] !== undefined, `${name}: ${key}`).toBe(true);
    }
  });
});
