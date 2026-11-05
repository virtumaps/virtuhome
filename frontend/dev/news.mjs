// What's new in a version, for the app (src/ui/news.ts): the changelog's "### New" lines of that version
// (or of Unreleased while there is no section for it yet), each with the guide section that first
// names its first bold term, so a line can link to where the guide explains it.
import { slugger } from "./markdown.mjs";

/** The "### New" bullets of `version`'s section, each joined onto one line. */
export function newLines(changelog, version) {
  const sections = changelog.split(/^## /m).slice(1);
  const section = sections.find((s) => s.startsWith(`${version}\n`)) ?? sections.find((s) => s.startsWith("Unreleased\n"));
  if (!section) return [];
  const news = /^### New\n([\s\S]*?)(?=^### |(?![\s\S]))/m.exec(section)?.[1] ?? "";
  const out = [];
  for (const line of news.split("\n")) {
    if (line.startsWith("- ")) out.push(line.slice(2).trim());
    else if (/^\s+\S/.test(line) && out.length) out[out.length - 1] += ` ${line.trim()}`;
  }
  return out;
}

/** The guide's sections: [anchor, text] for each ## and ### heading, anchors as GitHub makes them. */
export function guideSections(guide) {
  const slug = slugger();
  const out = [];
  for (const block of guide.split(/^(?=#{2,3} )/m)) {
    const head = /^#{2,3} (.+)$/m.exec(block);
    // a bold term the guide wraps over two lines is still found
    if (head) out.push([slug(head[1].trim()), block.replace(/\s+/g, " ")]);
  }
  return out;
}

/** The lines with their anchors: the first section that names one of their bold terms, tried in order (else null). */
export function news(changelog, guide, version) {
  const sections = guideSections(guide);
  return newLines(changelog, version).map((text) => {
    for (const [, term] of text.matchAll(/\*\*(.+?)\*\*/g)) {
      const hit = sections.find(([, body]) => body.includes(`**${term}**`));
      if (hit) return { text, anchor: hit[0] };
    }
    return { text, anchor: null };
  });
}
