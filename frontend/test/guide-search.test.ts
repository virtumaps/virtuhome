import { describe, expect, it } from "vitest";
import { find, fold, foundText, snippet, wordsOf, type Section } from "../dev/guide.mjs";
import { guideSite } from "../dev/guide-site.mjs";

const index: Section[] = [
  ["Storeys", "Get your home in", "get-your-home-in.html#storeys", "Add a floor puts a new storey on top. The bin removes a floor."],
  ["Wall tablets", "Wall tablets", "wall-tablets.html", "Built for wall tablets: it draws nothing while nothing changes."],
  ["Garden", "Outside", "outside.html#garden", "Lawns, paths and a café table. Walls of the garden."],
  ["Floors", "Find your way around", "find.html#floors", "Each floor has a button."],
];
const titles = (q: string, from = index) => find(from, q).map((s) => s[0]);

describe("the guide's search", () => {
  it("folds case and accents, and splits words", () => {
    expect(fold("Café ÉTÉ")).toBe("cafe ete");
    expect(wordsOf(" Wall-tablet, CAFÉ! 2D ")).toEqual(["wall", "tablet", "cafe", "2d"]);
    expect(wordsOf(" ,. ")).toEqual([]);
  });

  it("finds sections with every word at the start of a word, best first", () => {
    expect(titles("")).toEqual([]);
    expect(titles("floor")).toEqual(["Floors", "Storeys"]);
    expect(titles("wall tablet")).toEqual(["Wall tablets"]);
    expect(titles("wall tab")).toEqual(["Wall tablets", "Garden"]); // and its table
    expect(titles("cafe")).toEqual(["Garden"]);
    expect(titles("all")).toEqual([]); // not inside a word
    expect(titles("floor nowhere")).toEqual([]);
    expect(titles("walls")).toEqual(["Garden"]);
  });

  it("puts a section with the words together first", () => {
    const two: Section[] = [
      ["A", "P", "a.html", "floor, then new; floor, then new; floor, then new"],
      ["B", "P", "b.html", "a new floor"],
    ];
    expect(titles("new floor", two)).toEqual(["B", "A"]);
    expect(titles("floor new", two)).toEqual(["A", "B"]);
  });

  it("shows the text around the first word found, with the words marked", () => {
    expect(snippet("Add a floor puts a new storey on top.", ["storey"])).toEqual([
      ["Add a floor puts a new ", false],
      ["storey", true],
      [" on top.", false],
    ]);
    const long = `${"word ".repeat(40)}the garden gate ${"more ".repeat(60)}`;
    const pieces = snippet(long, ["gard"], 100);
    expect(pieces[0]).toEqual(["…", false]);
    expect(pieces.find(([, m]) => m)).toEqual(["garden", true]);
    expect(pieces[pieces.length - 1]).toEqual(["…", false]);
    expect(pieces.map(([t]) => t).join("").length).toBeLessThan(110);
    expect(snippet("Café table", ["cafe"])).toEqual([["Café", true], [" table", false]]);
  });

  it("says how many it found", () => {
    expect([0, 1, 7].map(foundText)).toEqual(["Nothing found. Try fewer words, or other ones.", "Found in one section.", "Found in 7 sections."]);
  });

  it("finds the right part of the real guide", () => {
    const real: Section[] = JSON.parse(guideSite({ version: "1.0.0" }).files.find((f) => f.name === "search.json")!.text!);
    expect(find(real, "storeys")[0][0]).toBe("Storeys");
    expect(find(real, "wall tablets")[0][0]).toBe("Wall tablets");
    expect(find(real, "licence key")[0][0]).toBe("Extensions and licence keys");
    expect(find(real, "sweet home 3d")[0][0]).toBe("Import from another program");
  });
});
