import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SHOTS } from "../../tools/screenshots.mjs";
import { compare, readPng, sideBySide, writePng, type Pixels } from "../../tools/png.mjs";

const root = new URL("../../", import.meta.url).pathname;
const read = (path: string) => readFileSync(root + path, "utf8");
/** The pictures a Markdown file shows, by their path in the repository. */
const pictures = (path: string) => {
  const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
  return [...read(path).matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => (/^https?:/.test(m[1]) ? null : dir + m[1])).filter((p): p is string => !!p);
};
const files = readdirSync(`${root}docs/screenshots`).filter((f) => f !== "README.md");
const shown = new Set([...pictures("README.md"), ...pictures("docs/GUIDE.md")]);
const list = read("docs/screenshots/README.md");

describe("screenshots", () => {
  it("are there for every picture the README and the guide show", () => {
    const missing = [...shown].filter((p) => !files.includes(p.replace(/^docs\/screenshots\//, "")) || !p.startsWith("docs/screenshots/"));
    expect(missing).toEqual([]);
  });

  it("are all shown, made by npm run screenshots and listed in docs/screenshots/README.md", () => {
    expect(files.filter((f) => !shown.has(`docs/screenshots/${f}`))).toEqual([]);
    expect(files.filter((f) => !SHOTS.some((s) => s.file === f))).toEqual([]);
    expect(SHOTS.map((s) => s.file).filter((f) => !files.includes(f))).toEqual([]);
    expect(files.filter((f) => !list.includes(`\`${f}\``))).toEqual([]);
  });
});

describe("comparing pictures", () => {
  const pic = (width: number, height: number, rgb: [number, number, number]): Pixels => {
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < data.length; i += 4) data.set([...rgb, 255], i);
    return { width, height, data };
  };

  it("reads back the PNG it writes", () => {
    const a = pic(5, 3, [10, 200, 30]);
    a.data.set([255, 0, 0, 255], 4 * 7);
    expect(readPng(writePng(a))).toEqual(a);
  });

  it("counts the pixels that changed by more than the threshold", () => {
    const a = pic(10, 10, [100, 100, 100]);
    const b = pic(10, 10, [100, 100, 100]);
    b.data.set([102, 100, 100, 255], 0); // too little to see
    b.data.set([250, 20, 20, 255], 4 * 55); // a red dot
    const res = compare(a, b, 0.1);
    expect(res.sized).toBe(true);
    expect(res.differ).toBe(1);
    expect(res.ratio).toBeCloseTo(0.01);
    // stored | changed pixels | now, with gaps
    expect(res.diff!.width).toBe(10 * 3 + 8 * 2);
    expect(compare(a, pic(10, 9, [100, 100, 100])).sized).toBe(false);
  });

  it("puts pictures side by side", () => {
    const s = sideBySide([pic(2, 2, [0, 0, 0]), pic(3, 1, [9, 9, 9])], 1);
    expect([s.width, s.height]).toEqual([6, 2]);
    expect([...s.data.slice(0, 4)]).toEqual([0, 0, 0, 255]);
    expect([...s.data.slice(4 * 3, 4 * 4)]).toEqual([9, 9, 9, 255]);
  });

  it("reads a picture the browser wrote", () => {
    const png = readPng(readFileSync(new URL("fixtures/floorplans/cottage.png", import.meta.url)));
    expect(png.width * png.height * 4).toBe(png.data.length);
  });
});
