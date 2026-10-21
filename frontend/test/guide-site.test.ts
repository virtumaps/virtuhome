import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { anchors, guideSite, imageSize, parts, previousMinor, readGuide, SITE } from "../dev/guide-site.mjs";
import { parse, type Block } from "../dev/markdown.mjs";
import { GUIDE_URL, guideLink } from "../src/ui/guide";

const md = readGuide();
const site = guideSite({ md, version: "1.2.3", older: [{ version: "1.1.4", href: "1.1/" }] });
const files = new Map(site.files.map((f) => [f.name, f]));
const pages = site.files.filter((f) => f.name.endsWith(".html"));
/** A small guide, with pretend files beside it. */
const small = (text: string, have: string[] = [], more = {}) =>
  guideSite({ md: text, version: "1.0.0", read: (path) => (have.includes(path) ? new Uint8Array([1]) : null), ...more });
const text = (s: ReturnType<typeof guideSite>, name: string) => s.files.find((f) => f.name === name)!.text!;

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
    expect(pages.length).toBe(count + 2); // and the search page
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
        if (/^(https?:|data:)/.test(url) || url === "demo/" || url === "1.1/") continue;
        if (attr === "src") expect(files.get(url)?.data?.length ?? files.get(url)?.text?.length, `${page.name}: ${url}`).toBeGreaterThan(0);
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
    // no trackers, fonts or scripts from elsewhere; the site's own script, and the front page's anchors
    for (const p of pages) {
      expect(p.text).not.toMatch(/<(script|link|img|video)[^>]+(src|href)="(https?:)?\/\//);
      expect(p.text).toContain('<script type="module" src="guide.js"></script>');
      expect(p.text!.includes("<script>")).toBe(p.name === "index.html");
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

describe("searching the guide's website", () => {
  const index: [string, string, string, string][] = JSON.parse(files.get("search.json")!.text!);

  it("has every section, where it is, with its text", () => {
    const storeys = index.find((e) => e[0] === "Storeys")!;
    expect(storeys.slice(0, 3)).toEqual(["Storeys", "Get your home in", "get-your-home-in.html#storeys"]);
    expect(storeys[3]).toMatch(/^Edit → Home → Floors lists each storey/);
    expect(index.find((e) => e[0] === "Install")!.slice(1, 3)).toEqual(["Install", "install.html"]);
    for (const [, , url] of index) expect(resolves(url, ""), url).toBe(true);
    for (const id of Object.keys(site.anchors).filter((id) => id !== "virtuhome-guide")) expect(index.some((e) => e[2] === site.anchors[id]), id).toBe(true);
    // a table's cells stay apart
    expect(index.find((e) => e[0] === "The card and its options")![3]).toContain("Option Visual editor Values Default");
  });

  it("has a search page that lists every section without JavaScript, and a search box on the others", () => {
    const search = files.get("search.html")!.text!;
    expect(search).toContain('<form class="find" role="search" action="search.html">');
    expect(search).toContain('<input id="q" type="search" name="q"');
    expect(search).toContain('<a href="get-your-home-in.html#storeys">Storeys</a>');
    for (const p of parts(md)) expect(search).toContain(`<a href="${p.file}">`);
    expect(search).not.toContain('<form class="search"');
    expect(files.get("faq.html")!.text).toContain('<form class="search" role="search" action="search.html"><input type="search" name="q"');
  });
});

describe("the guide's versions", () => {
  it("finds the newest release of the minor before", () => {
    const tags = ["v0.9.0", "v0.10.0", "v0.10.2", "v0.10.10", "v0.11.0", "v0.11.1", "v1.0.0", "nightly", ""];
    expect(previousMinor("0.11.1", tags)).toBe("0.10.10");
    expect(previousMinor("0.11.0", tags)).toBe("0.10.10");
    expect(previousMinor("1.0.0", tags)).toBe("0.11.1");
    expect(previousMinor("0.9.0", tags)).toBeNull();
    expect(previousMinor("0.11.0", [])).toBeNull();
  });

  it("links the newest guide to the older one", () => {
    expect(files.get("faq.html")!.text).toContain('Guide for 1.2.3 · older: <a href="1.1/">1.1</a>');
  });

  it("marks an older guide, and leads to the same part of the newest", () => {
    const newest = { version: "1.2.0", href: "../", anchors: { one: "one.html", two: "three.html#two" } };
    const old = small("# G\n\n## One\n\n[demo](https://virtumaps.github.io/virtuhome/demo/)\n\n## Two\n", [], { root: "../", newest });
    expect(old.problems).toEqual([]);
    const one = text(old, "one.html");
    expect(one).toContain('<p class="old">This guide is for VirtuHome 1.0.0. <a href="../one.html">The guide for 1.2.0</a></p>');
    expect(one).toContain('Guide for 1.0.0 · newest: <a href="../">1.2.0</a>');
    expect(one).toContain('<a href="../demo/">demo</a>');
    expect(one).toContain('<a href="../demo/">Demo</a>');
    expect(text(old, "two.html")).toContain('<a href="../three.html#two">The guide for 1.2.0</a>');
  });
});

describe("clips in the guide", () => {
  it("shows a paragraph that is only a link to a video as the video, with its picture", () => {
    const clips = small("# G\n\n## One\n\n[Placing a *light*](clips/light.mp4)\n\nSee [the clip](clips/light.mp4).\n", ["docs/clips/light.mp4", "docs/clips/light.jpg"]);
    expect(clips.problems).toEqual([]);
    expect(text(clips, "one.html")).toContain(
      '<figure class="clip">\n<video src="clips/light.mp4" poster="clips/light.jpg" controls muted playsinline preload="metadata"><a href="clips/light.mp4">Placing a <em>light</em></a></video>\n<figcaption>Placing a <em>light</em></figcaption>\n</figure>',
    );
    // a link to it in a sentence stays a link
    expect(text(clips, "one.html")).toContain('<p>See <a href="https://github.com/virtumaps/virtuhome/blob/v1.0.0/docs/clips/light.mp4">the clip</a>.</p>');
    expect(clips.files.map((f) => f.name)).toEqual(expect.arrayContaining(["clips/light.mp4", "clips/light.jpg"]));
    expect(small("# G\n\n## One\n\n[Gone](clips/gone.webm)\n").problems).toEqual(["one.html: clips/gone.webm isn't in the repository"]);
  });
});
