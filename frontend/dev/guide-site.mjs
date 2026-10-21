// The user guide as a website: docs/GUIDE.md split into a page per part (each "##" section), with
// the contents beside it, the part's sections at its top, previous and next links, a front page and
// search. GUIDE.md stays the one source. Anchors are GitHub's, so a link that works on GitHub works
// here: GUIDE.md#storeys is get-your-home-in.html#storeys, and the front page sends #storeys on to
// it. dev/site.mjs writes it into site/, and the previous minor release's guide into site/<minor>/.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { escapeHtml, inline, parse, render, textOf } from "./markdown.mjs";

const repo = new URL("../..", import.meta.url).pathname;
export const SITE = "https://virtumaps.github.io/virtuhome/";
export const REPO = "https://github.com/virtumaps/virtuhome";
/** Names the site already uses, which no part may take. */
const TAKEN = new Set(["index", "demo", "guide", "search", "anchors"]);

/** docs/GUIDE.md as it is now. */
export const readGuide = () => readFileSync(join(repo, "docs/GUIDE.md"), "utf8");
/** The version of VirtuHome in this checkout (the last release, until the next one bumps it). */
export const currentVersion = () => JSON.parse(readFileSync(join(repo, "custom_components/virtuhome/manifest.json"), "utf8")).version;
/** A file of this checkout, by its path in the repository (null: there is none). */
const readRepo = (path) => (existsSync(join(repo, path)) ? readFileSync(join(repo, path)) : null);

/** The release tags in this checkout (none without git, or in a clone without its tags). */
export function releaseTags() {
  try {
    return execFileSync("git", ["-C", repo, "tag", "--list", "v*"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n");
  } catch {
    return [];
  }
}

/** The newest release of the minor versions before `version` ("0.11.0" → "0.10.2"), or null. */
export function previousMinor(version, tags = releaseTags()) {
  const [major, minor] = version.split(".").map(Number);
  const older = tags
    .map((t) => /^v(\d+)\.(\d+)\.(\d+)$/.exec(t.trim())?.slice(1).map(Number))
    .filter((v) => v && (v[0] < major || (v[0] === major && v[1] < minor)))
    .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  return older.length ? older[0].join(".") : null;
}

/** A file of the repository as a release had it (null: there was none). */
export const readRelease = (version) => (path) => {
  try {
    return execFileSync("git", ["-C", repo, "show", `v${version}:${path}`], { stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1 << 28 });
  } catch {
    return null;
  }
};

/** The guide in parts: its start (the front page) and a part per "##" section. */
export function parts(md) {
  const list = [{ id: "", file: "index.html", title: "Start", blocks: [] }];
  for (const b of parse(md)) {
    if (b.type === "heading" && b.level === 2) list.push({ id: b.id, file: `${b.id}.html`, title: textOf(inline(b.text)), heading: b, blocks: [] });
    else list[list.length - 1].blocks.push(b);
  }
  return list;
}

function headings(blocks, found = []) {
  for (const b of blocks) {
    if (b.type === "heading") found.push(b);
    if (b.blocks) headings(b.blocks, found);
    if (b.items) b.items.forEach((item) => headings(item, found));
  }
  return found;
}

/** Where each of the guide's GitHub anchors is on the site: "storeys" → "get-your-home-in.html#storeys". */
export function anchors(list) {
  const map = {};
  for (const p of list) {
    if (p.heading) map[p.id] = p.file;
    for (const h of headings(p.blocks)) map[h.id] = `${p.file}#${h.id}`;
  }
  return map;
}

/** A link to a file beside the guide: the file's path in the repository, and the anchor. */
function beside(url) {
  const [path, hash] = url.split("#");
  return [posix.normalize(posix.join("docs", decodeURIComponent(path))), hash];
}

/** A JPEG's, PNG's or GIF's size, so the page keeps the room for a picture before it loads. */
export function imageSize(bytes) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length > 24 && v.getUint32(0) === 0x89504e47) return { width: v.getUint32(16), height: v.getUint32(20) };
  if (bytes.length > 10 && v.getUint32(0) === 0x47494638) return { width: v.getUint16(6, true), height: v.getUint16(8, true) };
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  // a JPEG: the size is in the first "start of frame" segment
  for (let i = 2; i + 9 < bytes.length; ) {
    const marker = bytes[i + 1];
    if (bytes[i] !== 0xff || marker === 0xff) i++;
    else if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { width: v.getUint16(i + 7), height: v.getUint16(i + 5) };
    else if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) i += 2;
    else i += 2 + v.getUint16(i + 2);
  }
  return null;
}

/** A paragraph that is only a link to a video: a short clip, shown in the page. */
const CLIP = /^\[([^\]]+)\]\(([^()\s]+\.(?:mp4|webm))\)$/;

/** The guide's sections for search.json: [title, part, address, text] each. */
function sections(list) {
  const out = [];
  for (const p of list) {
    let at = { title: p.heading ? p.title : "Start", url: p.file, blocks: [] };
    const add = () => {
      // cells and list items apart, as a reader sees them
      const text = textOf(render(at.blocks).replace(/></g, "> <")).replace(/\s+/g, " ").trim().normalize("NFC");
      if (text || p.heading || at.url !== p.file) out.push([at.title, p.title, at.url, text]);
    };
    for (const b of p.blocks) {
      if (b.type !== "heading") at.blocks.push(b);
      else {
        add();
        at = { title: textOf(inline(b.text)), url: `${p.file}#${b.id}`, blocks: [] };
      }
    }
    add();
  }
  return out;
}

/**
 * The guide's files for the site: pages, search, the stylesheet and script, the anchors
 * (anchors.json) and the pictures. `problems` lists links that lead nowhere; the site isn't built
 * while there are any. `read` gives a file of the repository by its path (the pictures, and the
 * files the guide links). `root` leads from the guide to the site's root (the demo), `older` lists
 * older guides to link to, and `newest` is the newest guide, when this one is older.
 */
export function guideSite({ md = readGuide(), version = currentVersion(), read = readRepo, root = "", older = [], newest = null } = {}) {
  const problems = [];
  const list = parts(md);
  const map = anchors(list);
  const pictures = new Map();
  const versions = newest ? `newest: <a href="${newest.href}">${escapeHtml(newest.version)}</a>` : older.map((o) => `older: <a href="${o.href}">${escapeHtml(o.version.replace(/\.\d+$/, ""))}</a>`).join(" ");
  const shared = { version, versions, root, search: true };
  for (const p of list) if (TAKEN.has(p.id)) problems.push(`A part can't be called "${p.title}": ${p.file} is taken`);

  const options = (here) => ({
    shift: here.heading ? -1 : 1,
    href(url, kind) {
      if (url.startsWith(SITE)) return root + url.slice(SITE.length) || "index.html"; // the demo, wherever the site is served
      if (/^([a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url;
      if (url.startsWith("#")) {
        const to = map[decodeURIComponent(url.slice(1))];
        if (!to) problems.push(`${here.file}: the link ${url} has no heading`);
        return !to ? url : to.startsWith(`${here.file}#`) ? to.slice(here.file.length) : to;
      }
      // a file beside the guide: pictures are copied to the site, anything else is linked on GitHub
      const [file, hash] = beside(url);
      const data = read(file);
      if (!data) problems.push(`${here.file}: ${url} isn't in the repository`);
      if (kind === "link") return `${REPO}/blob/v${version}/${file}${hash ? `#${hash}` : ""}`;
      if (!file.startsWith("docs/")) problems.push(`${here.file}: the picture ${url} must be in docs/`);
      else if (data) pictures.set(file.slice(5), data);
      return file.slice(5);
    },
    image(url) {
      const data = pictures.get(beside(url)[0].slice(5));
      const size = data && imageSize(data);
      return `${size ? ` width="${size.width}" height="${size.height}"` : ""} loading="lazy" decoding="async"`;
    },
  });

  const clip = (b, opts) => {
    const m = b.type === "paragraph" && CLIP.exec(b.text);
    if (!m) return render([b], opts);
    const src = escapeHtml(opts.href(m[2], "image"));
    const poster = m[2].replace(/\.\w+$/, ".jpg");
    const still = read(beside(poster)[0]) ? ` poster="${escapeHtml(opts.href(poster, "image"))}"` : "";
    const label = inline(m[1], opts);
    return `<figure class="clip">\n<video src="${src}"${still} controls muted playsinline preload="metadata"><a href="${src}">${label}</a></video>\n<figcaption>${label}</figcaption>\n</figure>`;
  };
  const nav = (here) =>
    `<ol>\n${list.map((p) => `<li><a href="${p.file}"${p === here ? ' aria-current="page"' : ""}>${escapeHtml(p.title)}</a></li>`).join("\n")}\n</ol>`;
  const files = list.map((p, k) => {
    const opts = options(p);
    let blocks = p.blocks;
    let top = "";
    if (p.heading) {
      // the part's own sections, at the top of its page
      const sections = blocks.filter((b) => b.type === "heading" && b.level === 3);
      top = `<h1 id="${p.id}">${inline(p.heading.text, opts)}</h1>\n`;
      if (sections.length) top += `<nav class="toc" aria-label="On this page">\n<p>On this page</p>\n<ul>\n${sections.map((s) => `<li><a href="#${s.id}">${inline(s.text, opts)}</a></li>`).join("\n")}\n</ul>\n</nav>\n`;
    } else {
      // the front page: the guide's first picture, then its introduction
      const picture = blocks.findIndex((b) => b.type === "paragraph" && /^!\[[^\]]*\]\([^)]*\)$/.test(b.text));
      top = front(root, picture >= 0 ? inline(blocks[picture].text, opts).replace(' loading="lazy"', ' fetchpriority="high"') : "");
      blocks = blocks.filter((_, j) => j !== picture);
    }
    const body = blocks
      .map((b) => clip(b, opts))
      .join("\n")
      .replace(/<table>/g, '<div class="scroll" tabindex="0" role="region" aria-label="Table">\n<table>')
      .replace(/<\/table>/g, "</table>\n</div>");
    const first = blocks.find((b) => b.type === "paragraph");
    const summary = first ? textOf(inline(first.text)).replace(/\s+/g, " ") : "";
    const description = summary.length > 160 ? `${summary.slice(0, 160).replace(/\s+\S*$/, "")}…` : summary;
    const pager = [
      k > 0 && `<a rel="prev" href="${list[k - 1].file}"><span>Previous</span> ${escapeHtml(list[k - 1].title)}</a>`,
      k < list.length - 1 && `<a rel="next" href="${list[k + 1].file}"><span>Next</span> ${escapeHtml(list[k + 1].title)}</a>`,
    ].filter(Boolean);
    const intro = !p.heading && headings(blocks)[0];
    const text = intro ? `<section aria-labelledby="${intro.id}">\n${body}\n</section>` : body;
    const old = newest ? `<p class="old">This guide is for VirtuHome ${escapeHtml(version)}. <a href="${newest.href}${newest.anchors[p.id] ?? ""}">The guide for ${escapeHtml(newest.version)}</a></p>\n` : "";
    const main = `${old}${top}${text}\n<nav class="pager" aria-label="Previous and next">\n${pager.join("\n")}\n</nav>`;
    const title = p.heading ? `${p.title} · VirtuHome guide` : "VirtuHome: your home in 3D in Home Assistant";
    return { name: p.file, text: page({ title, description, main, nav: nav(p), head: p.heading ? "" : redirects(map), ...shared }) };
  });
  const index = sections(list);
  files.push({ name: "search.html", text: page({ title: "Search · VirtuHome guide", description: "Search the VirtuHome guide.", main: searchMain(list), nav: nav(null), head: "", ...shared, search: false }) });
  files.push({ name: "search.json", text: JSON.stringify(index) });
  files.push({ name: "guide.css", text: readFileSync(new URL("guide.css", import.meta.url), "utf8") });
  files.push({ name: "guide.js", text: readFileSync(new URL("guide.mjs", import.meta.url), "utf8") });
  files.push({ name: "anchors.json", text: `${JSON.stringify(map, null, 1)}\n` });
  for (const [name, data] of pictures) files.push({ name, data });
  return { files, anchors: map, problems };
}

/** The front page's introduction to VirtuHome, above the guide's own. */
function front(root, picture) {
  return `<div class="hero">
<h1>VirtuHome</h1>
<p class="lead">Your home as a live 3D model in Home Assistant.</p>
<p>Lights glow in their real colours, doors swing with their sensors, blinds follow their covers, and cameras, motion and alarms show where they are. It is built for wall tablets and works on phones and computers too. Free and open source.</p>
<p class="actions"><a class="button" href="install.html">Install</a> <a class="button" href="${root}demo/">Try the demo</a> <a href="${REPO}">VirtuHome on GitHub</a></p>
</div>
${picture ? `<p class="shot">${picture}</p>\n` : ""}`;
}

/** The search page: the box and its results, and every section for reading without JavaScript. */
function searchMain(list) {
  const every = list
    .map((p) => {
      const subs = p.blocks.filter((b) => b.type === "heading" && b.level === 3);
      const inner = subs.length ? `\n<ul>\n${subs.map((s) => `<li><a href="${p.file}#${s.id}">${inline(s.text)}</a></li>`).join("\n")}\n</ul>\n` : "";
      return `<li><a href="${p.file}">${escapeHtml(p.title)}</a>${inner}</li>`;
    })
    .join("\n");
  return `<h1>Search the guide</h1>
<form class="find" role="search" action="search.html">
<label for="q">Words to look for</label>
<div><input id="q" type="search" name="q" autocomplete="off" /> <button>Search</button></div>
</form>
<noscript><p>Search needs JavaScript. Every section of the guide is below.</p></noscript>
<p id="status" role="status"></p>
<ol id="results" class="results"></ol>
<section id="every" aria-labelledby="every-section">
<h2 id="every-section">Every section</h2>
<ul class="every">
${every}
</ul>
</section>`;
}

/** On the front page, a GitHub anchor (index.html#storeys) goes on to its part. */
function redirects(map) {
  const away = Object.fromEntries(Object.entries(map).filter(([, to]) => !to.startsWith("index.html")));
  const json = JSON.stringify(away).replace(/</g, "\\u003c");
  return `<script>(function(){var m=${json},h=location.hash.slice(1);try{h=decodeURIComponent(h)}catch(e){}if(m[h])location.replace(m[h])})()</script>\n`;
}

function page({ title, description, main, nav, version, versions, root, search, head }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="color-scheme" content="light dark" />
<link rel="icon" href="data:," />
<link rel="stylesheet" href="guide.css" />
<script type="module" src="guide.js"></script>
${head}</head>
<body>
<a class="skip" href="#content">Skip to the guide</a>
<header class="top">
<a class="brand" href="index.html">VirtuHome</a>
<span class="version">Guide for ${escapeHtml(version)}${versions ? ` · ${versions}` : ""}</span>
${search ? '<form class="search" role="search" action="search.html"><input type="search" name="q" placeholder="Search the guide" aria-label="Search the guide" /></form>\n' : ""}<nav class="links" aria-label="VirtuHome"><a href="${root}demo/">Demo</a> <a href="${REPO}">GitHub</a></nav>
<details class="menu"><summary>Contents</summary>
<nav aria-label="Guide">
${nav}
</nav>
</details>
</header>
<div class="layout">
<nav class="side" aria-label="Guide">
${nav}
</nav>
<main id="content">
${main}
</main>
</div>
<footer>
<p>This guide is for VirtuHome ${escapeHtml(version)}, and on <a href="${REPO}/blob/v${escapeHtml(version)}/docs/GUIDE.md">GitHub</a> · <a href="${REPO}/releases">All releases</a> · <a href="${REPO}/issues">Report a problem</a></p>
</footer>
</body>
</html>
`;
}
