// A small Markdown to HTML converter for the user guide's website (dev/guide-site.mjs). It covers
// what docs/GUIDE.md uses, the way GitHub renders it: headings with GitHub's anchors, paragraphs,
// lists (nested too), block quotes, fenced code, tables, links, images, bold, italics, strikethrough
// and inline code. HTML comments are dropped and any other HTML is shown as text. Not covered:
// indented code blocks, reference links and footnotes.

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** GitHub's anchor for a heading: lower case, punctuation and symbols dropped, each space a hyphen. */
export const slug = (text) => text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "").replace(/ /g, "-");

/** Hands out anchors as GitHub does: a heading seen before gets -1, -2… */
export function slugger() {
  const seen = new Map();
  return (text) => {
    const base = slug(text);
    let id = base;
    while (seen.has(id)) {
      seen.set(base, seen.get(base) + 1);
      id = `${base}-${seen.get(base)}`;
    }
    seen.set(id, 0);
    return id;
  };
}

/** The text of a piece of rendered HTML, as a reader sees it. */
export function textOf(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot);/gi, (_, e) =>
      e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : { amp: "&", lt: "<", gt: ">", quot: '"' }[e.toLowerCase()],
    );
}

const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*([^`\s]*)[^`]*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const ITEM = /^( {0,3})([-*+]|\d{1,9}[.)])( +|$)/;
const QUOTE = /^ {0,3}> ?/;
const DELIMITER = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;
const SETEXT = /^ {0,3}(=+|-+)[ \t]*$/;

const indentOf = (line) => line.length - line.trimStart().length;
const isItem = (line) => ITEM.test(line) && !RULE.test(line);
/** Whether a line ends the paragraph above it (an ordered list does only when it starts at 1). */
function interrupts(line) {
  if (FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line) || /^ {0,3}<!--/.test(line)) return true;
  const m = ITEM.exec(line);
  return !!m && m[3] !== "" && (!/\d/.test(m[2]) || parseInt(m[2], 10) === 1);
}

/** A table row's cells: the outer pipes dropped, split at each pipe that isn't escaped. */
function cells(row) {
  let s = row.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}

/** Markdown into blocks; every heading gets its GitHub anchor (`id`). */
export function parse(md) {
  const tree = blocks(md.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n"));
  const anchor = slugger();
  const walk = (list) => {
    for (const b of list) {
      if (b.type === "heading") b.id = anchor(textOf(inline(b.text)).trim());
      if (b.blocks) walk(b.blocks);
      if (b.items) b.items.forEach(walk);
    }
  };
  walk(tree);
  return tree;
}

function blocks(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;
    if (!line.trim()) {
      i++;
    } else if (/^ {0,3}<!--/.test(line)) {
      // a comment for the guide's editors: dropped, along with any lines it spans
      while (i < lines.length && !lines[i].includes("-->")) i++;
      const rest = (lines[i] ?? "").slice((lines[i] ?? "").indexOf("-->") + 3);
      if (rest.trim()) lines[i] = rest;
      else i++;
    } else if ((m = FENCE.exec(line))) {
      const close = new RegExp(`^ {0,3}${m[1][0] === "`" ? "`" : "~"}{${m[1].length},}[ \\t]*$`);
      const cut = indentOf(line);
      const text = [];
      for (i++; i < lines.length && !close.test(lines[i]); i++) text.push(lines[i].slice(Math.min(cut, indentOf(lines[i]))));
      i++;
      out.push({ type: "code", lang: m[2], text: text.join("\n") });
    } else if ((m = HEADING.exec(line))) {
      out.push({ type: "heading", level: m[1].length, text: (m[2] ?? "").trim() });
      i++;
    } else if (RULE.test(line)) {
      out.push({ type: "rule" });
      i++;
    } else if (QUOTE.test(line)) {
      const body = [];
      while (i < lines.length && QUOTE.test(lines[i])) body.push(lines[i++].replace(QUOTE, ""));
      out.push({ type: "quote", blocks: blocks(body) });
    } else if (isItem(line)) {
      i = list(lines, i, out);
    } else if (line.includes("|") && DELIMITER.test(lines[i + 1] ?? "") && cells(line).length === cells(lines[i + 1]).length) {
      const align = cells(lines[i + 1]).map((c) => (c.endsWith(":") ? (c.startsWith(":") ? "center" : "right") : c.startsWith(":") ? "left" : ""));
      const head = cells(line);
      const rows = [];
      for (i += 2; i < lines.length && lines[i].includes("|") && !interrupts(lines[i]); i++) {
        const row = cells(lines[i]);
        rows.push(head.map((_, k) => row[k] ?? ""));
      }
      out.push({ type: "table", align, head, rows });
    } else {
      const text = [line.trimStart()];
      for (i++; i < lines.length && lines[i].trim(); i++) {
        if ((m = SETEXT.exec(lines[i]))) {
          out.push({ type: "heading", level: m[1][0] === "=" ? 1 : 2, text: text.join(" ").trim() });
          text.length = 0;
          i++;
          break;
        }
        if (interrupts(lines[i])) break;
        text.push(lines[i].trimStart());
      }
      if (text.length) out.push({ type: "paragraph", text: text.join("\n").replace(/[ \t]+$/, "") });
    }
  }
  return out;
}

/** A list from line `start` into `out`; returns the line after it. */
function list(lines, start, out) {
  const first = ITEM.exec(lines[start]);
  const ordered = /\d/.test(first[2]);
  const marker = first[2].slice(-1);
  const items = [];
  let loose = false;
  let i = start;
  while (i < lines.length) {
    const m = ITEM.exec(lines[i]);
    if (!m || RULE.test(lines[i]) || /\d/.test(m[2]) !== ordered || m[2].slice(-1) !== marker) break;
    // the item's content starts after the marker and its spaces (one, when it is followed by more than four)
    const indent = m[1].length + m[2].length + (m[3].length === 0 || m[3].length > 4 ? 1 : m[3].length);
    const body = [lines[i].slice(indent)];
    let blank = false;
    for (i++; i < lines.length; i++) {
      const l = lines[i];
      if (!l.trim()) {
        blank = true;
        body.push("");
      } else if (indentOf(l) >= indent) {
        // a blank line followed by more of this item (not of a list inside it) makes the list loose
        if (blank && indentOf(l) === indent && !isItem(l.slice(indent))) loose = true;
        blank = false;
        body.push(l.slice(indent));
      } else if (blank || isItem(l) || interrupts(l)) {
        break;
      } else {
        body.push(l.trimStart()); // a lazy continuation line of the item's paragraph
      }
    }
    while (body.length && !body[body.length - 1].trim()) body.pop();
    items.push(blocks(body));
    if (blank && i < lines.length && isItem(lines[i])) {
      const next = ITEM.exec(lines[i]);
      if (/\d/.test(next[2]) === ordered && next[2].slice(-1) === marker) loose = true;
    }
  }
  out.push({ type: "list", ordered, start: ordered ? parseInt(first[2], 10) : 1, loose, items });
  return i;
}

const SAFE_URL = (url) => (/^\s*(javascript|vbscript|data|file):/i.test(url) ? "#" : url);

/**
 * Inline Markdown into HTML. `opts.href(url, kind)` rewrites link and image addresses ("link" or
 * "image"), and `opts.image(src)` adds attributes to an image (its size).
 */
export function inline(text, opts = {}) {
  const held = [];
  const hold = (html) => `\uE000${held.push(html) - 1}\uE001`;
  let s = text
    .replace(/[\uE000-\uE003]/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/(?: {2,}|\\)\n/g, () => hold("<br />\n"))
    // backslash escapes and code spans, in order, so an escaped backtick starts no code
    .replace(/\\([!-/:-@[-`{-~])|(?<!`)(`+)(?!`)([\s\S]*?[^`])\2(?!`)/g, (_, esc, ticks, code) => {
      if (esc) return hold(escapeHtml(esc));
      const c = code.replace(/\n/g, " ");
      return hold(`<code>${escapeHtml(/^ .*[^ ].* $/.test(c) ? c.slice(1, -1) : c)}</code>`);
    })
    .replace(/<((?:https?|mailto):[^\s<>]+)>/g, (_, url) => hold(link(url, escapeHtml(url), "", opts)));
  s = linksAndImages(s, hold, opts);
  s = phrasing(s, hold, opts, true);
  while (/\uE000/.test(s)) s = s.replace(/\uE000(\d+)\uE001/g, (_, n) => held[n]);
  // an image's alt text is plain: the label's tags are dropped once it is complete
  return s.replace(/\uE002([\s\S]*?)\uE003/g, (_, alt) => alt.replace(/<[^>]*>/g, ""));
}

function link(url, label, title, opts) {
  const href = SAFE_URL(opts.href ? opts.href(url, "link") : url);
  return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}>${label}</a>`;
}

const DESTINATION = /^\(\s*(<[^<>\n]*>|(?:[^\s()\\]|\\.|\([^\s()]*\))*)(?:\s+("[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/;

/** `[label](url "title")` and `![alt](src)`, with brackets nested in the label. */
function linksAndImages(s, hold, opts) {
  let out = "";
  let i = 0;
  for (let open = s.indexOf("[", i); open >= 0; open = s.indexOf("[", i)) {
    let depth = 0;
    let close = -1;
    for (let j = open; j < s.length && close < 0; j++) {
      if (s[j] === "[") depth++;
      else if (s[j] === "]" && --depth === 0) close = j;
    }
    const dest = close > 0 && s[close + 1] === "(" ? DESTINATION.exec(s.slice(close + 1)) : null;
    if (!dest) {
      out += s.slice(i, open + 1);
      i = open + 1;
      continue;
    }
    const image = s[open - 1] === "!";
    const url = dest[1].replace(/^<(.*)>$/, "$1").replace(/\\([!-/:-@[-`{-~])/g, "$1");
    const title = dest[2]?.slice(1, -1) ?? "";
    // a label can hold an image (a picture that links), never another link
    const label = phrasing(linksAndImages(s.slice(open + 1, close), hold, opts), hold, opts, false);
    let html;
    if (image) {
      const src = SAFE_URL(opts.href ? opts.href(url, "image") : url);
      html = `<img src="${escapeHtml(src)}" alt="\uE002${label}\uE003"${title ? ` title="${escapeHtml(title)}"` : ""}${opts.image ? opts.image(url) : ""} />`;
    } else {
      html = link(url, label, title, opts);
    }
    out += s.slice(i, image ? open - 1 : open) + hold(html);
    i = close + 1 + dest[0].length;
  }
  return out + s.slice(i);
}

/** Emphasis and text: escaped, with bare web addresses made links outside link labels. */
function phrasing(s, hold, opts, autolink) {
  if (autolink) {
    s = s.replace(/(^|[\s(*_~])(https?:\/\/[^\s<\uE000]*[^\s<?!.,:;*_~'")\]\uE000])/g, (_, before, url) => before + hold(link(url, escapeHtml(url), "", opts)));
  }
  return s
    .replace(/&(?!#\d{1,7};|#x[\da-f]{1,6};|[a-z][a-z\d]{1,31};)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, "<em><strong>$1</strong></em>")
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g, "$1<strong>$2</strong>")
    .replace(/\*(?=[^\s*])([\s\S]*?[^\s*])\*/g, "<em>$1</em>")
    .replace(/(^|[^\w])_(?=\S)([\s\S]*?\S)_(?!\w)/g, "$1<em>$2</em>")
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, "<del>$1</del>");
}

/** Blocks into HTML. `opts.shift` moves every heading down (or up) that many levels. */
export function render(list, opts = {}, tight = false) {
  return list.map((b) => block(b, opts, tight)).join("\n");
}

function block(b, opts, tight) {
  switch (b.type) {
    case "heading": {
      const level = Math.min(6, Math.max(1, b.level + (opts.shift ?? 0)));
      return `<h${level} id="${escapeHtml(b.id)}">${inline(b.text, opts)}</h${level}>`;
    }
    case "paragraph":
      return tight ? inline(b.text, opts) : `<p>${inline(b.text, opts)}</p>`;
    case "code":
      return `<pre><code${b.lang ? ` class="language-${escapeHtml(b.lang)}"` : ""}>${escapeHtml(b.text)}\n</code></pre>`;
    case "quote":
      return `<blockquote>\n${render(b.blocks, opts)}\n</blockquote>`;
    case "rule":
      return "<hr />";
    case "list": {
      const tag = b.ordered ? "ol" : "ul";
      const items = b.items.map((item) => `<li>${render(item, opts, !b.loose)}</li>`).join("\n");
      return `<${tag}${b.ordered && b.start !== 1 ? ` start="${b.start}"` : ""}>\n${items}\n</${tag}>`;
    }
    case "table": {
      const cell = (tag, text, k) => `<${tag}${b.align[k] ? ` style="text-align: ${b.align[k]}"` : ""}>${inline(text, opts)}</${tag}>`;
      const head = `<tr>${b.head.map((c, k) => cell("th", c, k)).join("")}</tr>`;
      const rows = b.rows.map((r) => `<tr>${r.map((c, k) => cell("td", c, k)).join("")}</tr>`).join("\n");
      return `<table>\n<thead>\n${head}\n</thead>\n${rows ? `<tbody>\n${rows}\n</tbody>\n` : ""}</table>`;
    }
  }
  return "";
}
