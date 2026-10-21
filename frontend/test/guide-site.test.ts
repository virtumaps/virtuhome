import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { anchors, guideSite, imageSize, parts, readGuide, SITE } from "../dev/guide-site.mjs";
import { parse, type Block } from "../dev/markdown.mjs";
import { GUIDE_URL, guideLink } from "../src/ui/guide";

const md = readGuide();
const site = guideSite({ md, version: "1.2.3" });
const files = new Map(site.files.map((f) => [f.name, f]));
const pages = site.files.filter((f) => f.name.endsWith(".html"));
/** A small guide, with pretend files beside it. */
const small = (text: string, have: string[] = []) =>
  guideSite({ md: text, version: "1.0.0", read: (path) => (have.includes(path) ? new Uint8Array([1]) : null) });

function headings(blocks: Block[], found: string[] = []) {
  for (const b of blocks) {
    if (b.type === "heading") found.push(b.id);
    if (b.type === "quote") headings(b.blocks, found);
    if (b.type === "list") b.items.forEach((item) => headings(item, found));
  }
  return found;
}

/** Whether a site address (page.html#anchor, or #anchor on `from`) is a page with that anchor. */
function resolves(url: string, from: string) {
  const [path, hash] = url.split("#");
  const page = files.get(path || from);
  return !!page?.text && (!hash || page.text.includes(` id="${hash}"`));
}

describe("the guide's website", () => {
  it("has a page for each part of docs/GUIDE.md", () => {
    const count = md.split("\n").filter((l) => l.startsWith("## ")).length;
    expect(pages.map((p) => p.name)).toEqual(expect.arrayContaining(["index.html", "install.html", "get-your-home-in.html", "faq.html", "troubleshooting.html"]));
    expect(pages.length).toBe(count + 1);
    expect(site.problems).toEqual([]);
  });

  it("puts every heading's GitHub anchor on a page", () => {
    const ids = headings(parse(md));
    expect(Object.keys(site.anchors).sort()).toEqual([...ids].sort());
    for (const [id, url] of Object.entries(site.anchors)) {
      expect(resolves(url, ""), `#${id} → ${url}`).toBe(true);
      expect(url.endsWith(`#${id}`) || url === `${id}.html`).toBe(true);
    }
    expect(site.anchors.install).toBe("install.html");
    expect(site.anchors.storeys).toBe("get-your-home-in.html#storeys");
    expect(JSON.parse(files.get("anchors.json")!.text!)).toEqual(site.anchors);
    // a GitHub anchor on the front page goes on to its part
    expect(files.get("index.html")!.text).toContain('"storeys":"get-your-home-in.html#storeys"');
  });

  it("leads every link in the guide somewhere", () => {
    for (const page of pages) {
      for (const [, attr, url] of page.text!.matchAll(/ (href|src)="([^"]*)"/g)) {
        if (/^(https?:|data:)/.test(url) || url === "demo/" || url === "guide.css") continue;
        if (attr === "src") expect(files.get(url)?.data?.length, `${page.name}: ${url}`).toBeGreaterThan(0);
        else expect(resolves(url, page.name), `${page.name}: ${url}`).toBe(true);
      }
    }
  });

  it("finds a link that leads nowhere", () => {
    const broken = small("# G\n\n## One\n\n[a](#nowhere) ![b](missing.png) [c](NOPE.md) ![d](../README.md)\n\n## Index\n", ["README.md"]);
    expect(broken.problems).toEqual([
      'A part can\'t be called "Index": index.html is taken',
      "one.html: the link #nowhere has no heading",
      "one.html: missing.png isn't in the repository",
      "one.html: NOPE.md isn't in the repository",
      "one.html: the picture ../README.md must be in docs/",
    ]);
  });

  it("rewrites links for the site", () => {
    const install = files.get("install.html")!.text!;
    expect(install).toContain('<a href="get-your-home-in.html">Get your home in</a>');
    expect(install).toMatch(/<img src="screenshots\/first-run\.jpg" alt="Let's get your home in" width="\d+" height="\d+" loading="lazy"/);
    expect(files.get("index.html")!.text).toContain('<a href="demo/">online demo</a>');
    const own = small("# G\n\n## One\n\n[a](#two) [b](#one) [c](DEVELOPMENT.md#labels) [d](https://hacs.xyz)\n\n### Two\n", ["docs/DEVELOPMENT.md"]);
    expect(own.problems).toEqual([]);
    expect(own.files.find((f) => f.name === "one.html")!.text).toContain(
      '<a href="#two">a</a> <a href="one.html">b</a> <a href="https://github.com/virtumaps/virtuhome/blob/v1.0.0/docs/DEVELOPMENT.md#labels">c</a> <a href="https://hacs.xyz">d</a>',
    );
  });

  it("is plain HTML with contents, sections, previous and next, and nothing from elsewhere", () => {
    const page = files.get("get-your-home-in.html")!.text!;
    expect(page).toContain('<a href="get-your-home-in.html" aria-current="page">Get your home in</a>');
    expect(page).toContain('<h1 id="get-your-home-in">Get your home in</h1>');
    expect(page).toMatch(/<nav class="toc" aria-label="On this page">[\s\S]*<a href="#storeys">Storeys<\/a>/);
    expect(page).toContain('<h2 id="storeys">Storeys</h2>');
    expect(page).toContain('<a rel="prev" href="find-your-way-around.html">');
    expect(page).toContain('<a rel="next" href="place-your-devices.html">');
    expect(page).toContain("Guide for 1.2.3");
    expect(page).toContain("https://github.com/virtumaps/virtuhome/blob/v1.2.3/docs/GUIDE.md");
    // no trackers, fonts or scripts from elsewhere, and only the front page has a script
    for (const p of pages) {
      expect(p.text).not.toMatch(/<(script|link|img)[^>]+(src|href)="(https?:)?\/\//);
      expect(p.text!.includes("<script")).toBe(p.name === "index.html");
    }
  });

  it("knows where the parts and anchors are", () => {
    expect(parts(md)[0].file).toBe("index.html");
    expect(anchors(parts("## A\n### B\n## C\n### B"))).toEqual({ a: "a.html", b: "a.html#b", c: "c.html", "b-1": "c.html#b-1" });
  });

  it("reads a picture's size", () => {
    const png = new Uint8Array(32);
    png.set([0x89, 0x50, 0x4e, 0x47]);
    png.set([0, 0, 2, 0, 0, 0, 1, 0], 16);
    expect(imageSize(png)).toEqual({ width: 512, height: 256 });
    expect(imageSize(Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x40, 1, 0xf0, 0, 0, 0]))).toEqual({ width: 320, height: 240 });
    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 17, 8, 0, 90, 0, 160, 3, 0, 0]);
    expect(imageSize(jpeg)).toEqual({ width: 160, height: 90 });
    expect(imageSize(files.get("screenshots/house.jpg")!.data!)).toEqual({ width: 1440, height: 900 });
  });
});

describe("help links in VirtuHome", () => {
  const src = new URL("../src/", import.meta.url);
  const sources = readdirSync(src.pathname, { recursive: true })
    .filter((f) => f.endsWith(".ts"))
    .map((f) => ({ name: f, text: readFileSync(new URL(f, src), "utf8") }));

  it("go to the guide's website", () => {
    expect(GUIDE_URL).toBe(SITE);
    expect(guideLink("wall-tablets")).toBe("https://virtumaps.github.io/virtuhome/#wall-tablets");
  });

  it("all lead to a heading in the guide", () => {
    const used: string[] = [];
    for (const { name, text } of sources) {
      for (const [call, arg] of text.matchAll(/\bguideLink\(([^)]*)\)/g)) {
        // a plain string, so this test can check it
        expect(arg, `${name}: ${call}`).toMatch(/^"[^"]+"$/);
        used.push(arg.slice(1, -1));
      }
      // the guide on GitHub, or a page of the website
      for (const [, anchor] of text.matchAll(/(?:docs\/GUIDE\.md|virtumaps\.github\.io\/virtuhome\/[\w.-]*)#([\w-]+)/g)) used.push(anchor);
    }
    expect(used).toContain("wall-tablets");
    for (const anchor of used) expect(site.anchors[anchor], `#${anchor} is not a heading in docs/GUIDE.md`).toBeDefined();
  });
});
