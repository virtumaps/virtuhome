// The online demo's languages: English and those of the countries with the most Home Assistant homes,
// and Turkish and Bulgarian. Each loads when it is needed. Which one shows: the one picked before,
// else the browser's own language, else the one where the viewer is (from their time zone; nothing is
// looked up), else English. The menu in the demo's bar changes it.
import { EN } from "./en";
import type { DemoStrings } from "./types";

export type { DemoStrings, LineId, ChapterId } from "./types";
export { EN };

/** The languages, in the menu's order, each with its own name. */
export const NAMES: Record<string, string> = {
  en: "English", de: "Deutsch", nl: "Nederlands", fr: "Français", it: "Italiano", es: "Español", pt: "Português",
  sv: "Svenska", da: "Dansk", nb: "Norsk", pl: "Polski", cs: "Čeština", tr: "Türkçe", bg: "Български",
};

const LOAD: Record<string, () => Promise<DemoStrings>> = {
  en: async () => EN,
  de: () => import("./de").then((m) => m.DE),
  nl: () => import("./nl").then((m) => m.NL),
  fr: () => import("./fr").then((m) => m.FR),
  it: () => import("./it").then((m) => m.IT),
  es: () => import("./es").then((m) => m.ES),
  pt: () => import("./pt").then((m) => m.PT),
  sv: () => import("./sv").then((m) => m.SV),
  da: () => import("./da").then((m) => m.DA),
  nb: () => import("./nb").then((m) => m.NB),
  pl: () => import("./pl").then((m) => m.PL),
  cs: () => import("./cs").then((m) => m.CS),
  tr: () => import("./tr").then((m) => m.TR),
  bg: () => import("./bg").then((m) => m.BG),
};

/** A language's texts (English if it fails to load). */
export function load(code: string): Promise<DemoStrings> {
  return (LOAD[code] ?? LOAD.en)().catch(() => EN);
}

/** Where a time zone is, as the language spoken there that the demo has. */
const ZONES: [RegExp, string][] = [
  [/^Europe\/(Berlin|Busingen|Vienna|Zurich|Vaduz)$/, "de"],
  [/^Europe\/(Amsterdam|Brussels)$/, "nl"],
  [/^Europe\/(Paris|Monaco|Luxembourg)$/, "fr"],
  [/^Europe\/(Rome|San_Marino|Vatican)$/, "it"],
  [/^(Europe\/Madrid|Atlantic\/Canary|Africa\/Ceuta|America\/(Mexico_City|Monterrey|Merida|Cancun|Tijuana|Chihuahua|Hermosillo|Mazatlan|Bogota|Lima|Santiago|Caracas|Montevideo|Asuncion|La_Paz|Guayaquil|Guatemala|Costa_Rica|Panama|El_Salvador|Tegucigalpa|Managua|Havana|Santo_Domingo|Argentina\/.+))$/, "es"],
  [/^(Europe\/Lisbon|Atlantic\/(Madeira|Azores)|America\/(Sao_Paulo|Fortaleza|Recife|Bahia|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Maceio|Araguaina|Santarem|Noronha))$/, "pt"],
  [/^Europe\/Stockholm$/, "sv"],
  [/^(Europe\/Copenhagen|Atlantic\/Faroe)$/, "da"],
  [/^(Europe\/Oslo|Arctic\/Longyearbyen)$/, "nb"],
  [/^Europe\/Warsaw$/, "pl"],
  [/^Europe\/Prague$/, "cs"],
  [/^(Europe|Asia)\/Istanbul$/, "tr"],
  [/^Europe\/Sofia$/, "bg"],
];

/** A browser's language code as one of the demo's ("de-AT" → "de", "no" → "nb"), or null. */
export function ours(code: string | null | undefined): string | null {
  if (!code) return null;
  const main = code.toLowerCase().split(/[-_]/)[0];
  const lang = main === "no" || main === "nn" ? "nb" : main;
  return lang in NAMES ? lang : null;
}

/**
 * The language to show: `param` (?lang=), else `saved` (picked before), else the browser's first
 * language if it isn't English, else where the viewer is, else any of the browser's, else English.
 * An English browser in Berlin gets German: the menu is a tap away.
 */
export function detect(o: { param?: string | null; saved?: string | null; languages: readonly string[]; timeZone?: string | null }): string {
  const first = ours(o.languages[0]);
  const zone = o.timeZone ? ZONES.find(([re]) => re.test(o.timeZone!))?.[1] ?? null : null;
  return ours(o.param) ?? ours(o.saved) ?? (first && first !== "en" ? first : null) ?? zone ?? o.languages.map(ours).find(Boolean) ?? "en";
}

/** Fills in a text's placeholders. */
export const fill = (text: string, vars: Record<string, string | number> = {}): string =>
  text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/** A tour line without its cues, and the word each cue is on (0 = the first). */
export function cued(text: string): { text: string; cues: Record<string, number> } {
  const cues: Record<string, number> = {};
  const words: string[] = [];
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const bare = token.replace(/\[\[(\w+)\]\]/g, (_, name: string) => ((cues[name] = words.length), ""));
    if (bare) words.push(bare);
  }
  return { text: words.join(" "), cues };
}

/** A number as the language writes it. */
export const num = (s: DemoStrings, v: number, digits = 0): string =>
  v.toLocaleString(s.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** A sum of the demo house's (pounds) in the language's money, rounded to `step` of that money. */
export function money(s: DemoStrings, pounds: number, step = 1): string {
  const v = Math.round((pounds * s.money.perPound) / step) * step;
  // British prices under a pound are in pence
  if (s.money.currency === "GBP" && v < 1) return v < 0.1 ? `${(v * 100).toFixed(1)}p` : `${Math.round(v * 100)}p`;
  const digits = step < 1 ? 2 : 0;
  return v.toLocaleString(s.locale, { style: "currency", currency: s.money.currency, minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** A line as the voice should say it (the subtitles keep how it is written). */
export const spokenAs = (s: DemoStrings, text: string): string =>
  s.sayAs.reduce((t, [word, as]) => t.split(word).join(as), text);
