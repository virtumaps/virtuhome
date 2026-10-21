// Text shown to users, in the user's language. The English text is the source: en.ts for what the
// view shows (loaded up front), en-editor.ts for what only the editor shows (loaded with it). Other
// languages are tables of the same keys, loaded on demand; a key a language lacks shows in English.
//
//   t("checks.repairs.fence", { n: 2 })   "left out 2 fences with fewer than two corners"
//   th(...)                               the same, escaped for innerHTML
//
// Placeholders are named, {name}. A text with forms for counts is { one, other } (and two, few,
// many, zero where a language has them), picked by the number in {n}. TypeScript checks that the key
// exists and that every placeholder is given. Never call t() at the top of a module: that would run
// before the user's language is loaded; keep keys in constants and call t() when drawing.
import { EN } from "./en";

/** A text with a form for each count the language tells apart (Intl.PluralRules). */
export interface Plural {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}
export type Text = string | Plural;
export type Table = Readonly<Record<string, Text>>;
/** Another language: any of the English keys, in that language. */
export type Translation = Readonly<Partial<Record<string, Text>>>;

export type Key = keyof typeof EN;

/** The placeholders of a text: "{a} and {b}" → "a" | "b"; a text with counts also takes n. */
type Names<S> = S extends `${string}{${infer V}}${infer R}` ? V | Names<R> : never;
type Forms<T> = T extends string ? T : T[keyof T] & string;
type VarNames<T> = Names<Forms<T>> | (T extends string ? never : "n");
/** What t() takes after the key: nothing for a plain text, else every placeholder. */
export type Args<T> = [VarNames<T>] extends [never] ? [] : [vars: Record<VarNames<T>, string | number>];
/** A key whose text takes nothing: what a catalogue's entries name themselves with. */
export type PlainKey = { [K in Key]: Args<(typeof EN)[K]> extends [] ? K : never }[Key];

/**
 * Languages besides English, each loaded the first time it is needed, so none of them adds to
 * what every page loads. A new one goes here: `de: () => import("./de").then((m) => m.DE)`.
 */
export const LANGUAGES: Record<string, () => Promise<Translation>> = {};

let lang = "en";
let table: Translation = {};
let rules: Intl.PluralRules | null = null;
/** Each language's table, fetched once however many cards ask for it (null: it failed to load). */
const tables = new Map<string, Promise<Translation | null>>();

/** The language texts are shown in now ("en" until another is loaded). */
export const language = (): string => lang;

/** The language for a Home Assistant language code: itself, else its main language ("de-CH" → "de"), else English. */
export function pickLanguage(code: string | null | undefined): string {
  const known = (c: string) => Object.prototype.hasOwnProperty.call(LANGUAGES, c);
  if (!code) return "en";
  if (known(code)) return code;
  const main = code.split(/[-_]/)[0].toLowerCase();
  return known(main) ? main : "en";
}

/**
 * Shows texts in the user's language (Home Assistant's profile setting), loading its table first.
 * Runs before a card or the panel draws anything. A table that fails to load leaves English.
 */
export async function useLanguage(hass: unknown): Promise<void> {
  const h = hass as { language?: string; locale?: { language?: string } } | null | undefined;
  const code = pickLanguage(h?.locale?.language ?? h?.language);
  if (code === lang) return;
  let load = tables.get(code);
  if (!load) {
    load = (code === "en" ? Promise.resolve({}) : LANGUAGES[code]()).catch((err) => {
      console.warn(`VirtuHome: no ${code} texts, showing English`, err);
      return null;
    });
    tables.set(code, load);
  }
  const loaded = await load;
  if (!loaded) return;
  lang = code;
  table = loaded;
  rules = null;
}

/** Which form of a text with counts goes with n in the language shown. */
function pick(text: Plural, n: number): string {
  rules ??= new Intl.PluralRules(lang);
  return text[rules.select(n) as keyof Plural] ?? text.other;
}

/** Fills in the placeholders; one not given stays as it is, to be seen. */
export function format(text: string, vars?: Record<string, string | number>): string {
  return vars ? text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m)) : text;
}

/** A key's text in the language shown, else in English (`english`), with its placeholders filled in. */
export function translate(key: string, english: Text, vars?: Record<string, string | number>): string {
  const text = table[key] ?? english;
  return format(typeof text === "string" ? text : pick(text, Number(vars?.n)), vars);
}

/** Escapes text for innerHTML (Home Assistant's names in placeholders are never trusted). */
export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A text in the user's language. */
export function t<K extends Key>(key: K, ...args: Args<(typeof EN)[K]>): string {
  return translate(key, EN[key], args[0]);
}

/** A text in the user's language, escaped for innerHTML. */
export function th<K extends Key>(key: K, ...args: Args<(typeof EN)[K]>): string {
  return esc(translate(key, EN[key], args[0]));
}
