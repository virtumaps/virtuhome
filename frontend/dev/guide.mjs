// The script of the guide's website (dev/guide-site.mjs publishes it as guide.js; every page reads
// fine without it). It searches the guide on search.html, and sends an anchor that isn't on the page
// (an old link to a section that has since moved to another part) on to the page it is on now.

/** Lower case and without accents, the same length as `s` so places in it match. */
export function fold(s) {
  const f = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return f.length === s.length ? f : s.toLowerCase();
}

/** The words of a search, folded. */
export const wordsOf = (q) => fold(q.normalize("NFC")).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

const escape = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Where a word begins with `w`: the match's last group is the word. */
const starts = (w) => new RegExp(`(?:^|[^\\p{L}\\p{N}])(${escape(w)}[\\p{L}\\p{N}]*)`, "gu");
const count = (w, s, most) => {
  let n = 0;
  for (const re = starts(w); n < most && re.exec(s); ) n++;
  return n;
};

/**
 * The sections with every word of the search (as the start of a word), best first: a word in the
 * section's title counts most, then in its part's name, then each time it is in the text.
 * `index` is search.json: [title, part, address, text] for each section.
 */
export function find(index, query) {
  const words = wordsOf(query);
  if (!words.length) return [];
  const phrase = words.join(" ");
  const found = [];
  for (const entry of index) {
    const [title, part, , text] = entry.map(fold);
    let score = 0;
    for (const w of words) {
      const s = count(w, title, 1) * 10 + count(w, part, 1) * 3 + count(w, text, 5);
      if (!s) {
        score = 0;
        break;
      }
      score += s;
    }
    if (score && words.length > 1 && (title.includes(phrase) || text.includes(phrase))) score += 10;
    if (score) found.push({ entry, score });
  }
  // the sort keeps the guide's order between equals
  return found.sort((a, b) => b.score - a.score).map((f) => f.entry);
}

/** About `size` characters of `text` around the first word found, as [text, marked] pieces. */
export function snippet(text, words, size = 180) {
  const all = fold(text);
  let first = text.length;
  for (const w of words) {
    const m = starts(w).exec(all);
    if (m) first = Math.min(first, m.index + m[0].length - m[1].length);
  }
  if (first === text.length) first = 0;
  let from = Math.max(0, first - 60);
  if (from > 0) from = text.indexOf(" ", from) + 1 || from;
  if (from > first) from = first;
  let to = Math.min(text.length, from + size);
  if (to < text.length && text.lastIndexOf(" ", to) > first) to = text.lastIndexOf(" ", to);
  const piece = text.slice(from, to);
  const folded = all.slice(from, to);
  const marks = [];
  for (const w of words) {
    const re = starts(w);
    for (let m = re.exec(folded); m; m = re.exec(folded)) marks.push([m.index + m[0].length - m[1].length, m.index + m[0].length]);
  }
  marks.sort((a, b) => a[0] - b[0]);
  const out = from > 0 ? [["…", false]] : [];
  let at = 0;
  for (const [s, e] of marks) {
    if (s < at) continue;
    if (s > at) out.push([piece.slice(at, s), false]);
    out.push([piece.slice(s, e), true]);
    at = e;
  }
  if (at < piece.length) out.push([piece.slice(at), false]);
  if (to < text.length) out.push(["…", false]);
  return out;
}

/** What the search page says above its results. */
export const foundText = (n) => (n === 0 ? "Nothing found. Try fewer words, or other ones." : n === 1 ? "Found in one section." : `Found in ${n} sections.`);

function searchPage(box, list, status, every) {
  let index = null;
  let timer = 0;
  const show = () => {
    const q = box.value.trim();
    history.replaceState(null, "", q ? `?q=${encodeURIComponent(q)}` : location.pathname);
    every.hidden = !!q && !!index;
    list.textContent = "";
    if (!index) return;
    status.textContent = "";
    if (!q) return;
    const words = wordsOf(q);
    const results = find(index, q);
    status.textContent = foundText(results.length);
    for (const [title, part, url, text] of results) {
      const a = document.createElement("a");
      a.href = url;
      a.textContent = title;
      const li = document.createElement("li");
      li.append(a);
      if (part !== title) li.append(" ", Object.assign(document.createElement("span"), { className: "where", textContent: part }));
      const p = document.createElement("p");
      for (const [s, mark] of snippet(text, words)) p.append(mark ? Object.assign(document.createElement("mark"), { textContent: s }) : s);
      li.append(p);
      list.append(li);
    }
  };
  box.value = new URLSearchParams(location.search).get("q") ?? "";
  box.form?.addEventListener("submit", (e) => {
    e.preventDefault();
    show();
  });
  box.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(show, 150);
  });
  fetch("search.json")
    .then((r) => r.json())
    .then((i) => {
      index = i;
      show();
    })
    .catch(() => (status.textContent = "Search isn't working just now. Every section is listed below."));
}

function moved() {
  let id = location.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    return;
  }
  if (!id || document.getElementById(id)) return;
  const here = location.pathname.split("/").pop() || "index.html";
  fetch("anchors.json")
    .then((r) => r.json())
    .then((map) => {
      if (map[id] && map[id].split("#")[0] !== here) location.replace(map[id]);
    })
    .catch(() => {});
}

if (typeof document !== "undefined") {
  moved();
  const box = document.getElementById("q");
  const list = document.getElementById("results");
  if (box && list) searchPage(box, list, document.getElementById("status"), document.getElementById("every"));
}
