import { t } from "../i18n/editor";
// A small XML reader: elements, their attributes and children. Enough for files written by programs
// (Sweet Home 3D's Home.xml); text, comments, processing instructions and the doctype are skipped,
// and only the five named entities and character references are expanded, so a file can't make it
// fetch anything or blow up in size.

export interface XmlElement {
  name: string;
  attrs: Record<string, string>;
  children: XmlElement[];
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const decode = (s: string): string =>
  s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()]);

/** The document's root element. */
export function parseXml(text: string): XmlElement {
  const root: XmlElement = { name: "", attrs: {}, children: [] };
  const stack = [root];
  const tag = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE(?:[^[>]|\[[\s\S]*?\])*>|<\/([^\s>]+)\s*>|<([^\s/>!?]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/gi;
  const attr = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(text))) {
    if (m[1]) {
      if (stack.length > 1 && stack[stack.length - 1].name === m[1]) stack.pop();
      else throw new Error(t("editor.import.theXmlIsDamaged", { x: m[1] }));
    } else if (m[2]) {
      const el: XmlElement = { name: m[2], attrs: {}, children: [] };
      for (const a of m[3].matchAll(attr)) el.attrs[a[1]] = decode(a[2] ?? a[3] ?? "");
      stack[stack.length - 1].children.push(el);
      if (!m[4]) stack.push(el);
    }
  }
  const top = root.children[0];
  if (!top) throw new Error(t("editor.import.theFileHasNoXml"));
  return top;
}
