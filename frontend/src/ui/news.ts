// What's new after an update: the first time an administrator opens the sidebar panel on a new version,
// the changelog's New lines (taken at build time, dev/news.mjs), each linking to its part of the guide,
// and Got it. Shown once per person per version; a first install shows nothing (all of it is new).
// The lines are the changelog's own words, in English.
import { esc, t, th } from "../i18n";
import { guideAt } from "./guide";

const KEY = "virtuhome.news";
export const CHANGELOG_URL = "https://github.com/virtumaps/virtuhome/blob/main/CHANGELOG.md";

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return "";
  }
}

function write(version: string): void {
  try {
    localStorage.setItem(KEY, version);
  } catch {
    // no storage: nothing more to do, it can't be told apart from a first install next time
  }
}

/** A wall tablet's kiosk (Fully Kiosk, kiosk-mode's ?kiosk) or a measuring run (?bench). */
export function onKiosk(): boolean {
  return (typeof location !== "undefined" && /[?&](kiosk|bench)\b/.test(location.search)) || (typeof window !== "undefined" && "fully" in window);
}

/** Whether to show it now: after an update, not on a first install (which is remembered as seen). */
export function newsDue(version: string): boolean {
  // a wall tablet's kiosk (Fully Kiosk, kiosk-mode), a measuring run: never
  if (onKiosk()) return false;
  const last = read();
  if (last === "") return false;
  if (last === null) {
    write(version);
    return false;
  }
  return last !== version;
}

const EXT_KEY = "virtuhome.news.ext";

/** An extension's news, by its title ("Household 1.1.0"): shown once per person. */
export function extNewsSeen(title: string): boolean {
  try {
    const v = JSON.parse(localStorage.getItem(EXT_KEY) ?? "[]");
    return Array.isArray(v) && v.includes(title);
  } catch {
    return true;
  }
}

export function markExtNews(title: string): void {
  try {
    const v = JSON.parse(localStorage.getItem(EXT_KEY) ?? "[]");
    localStorage.setItem(EXT_KEY, JSON.stringify([...(Array.isArray(v) ? v : []), title].slice(-50)));
  } catch {
    // no storage: seen this time only
  }
}

/** A changelog line as HTML: **bold** and `code` kept, everything else escaped. */
export function lineHtml(text: string): string {
  return esc(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`(.+?)`/g, "<code>$1</code>");
}

/** The sheet over the view. Got it remembers the version (`remember`: something else to note as seen). */
export function showNews(root: HTMLElement, version: string, lines: { text: string; anchor: string | null }[], remember: () => void = () => write(version)): void {
  if (!lines.length) {
    write(version);
    return;
  }
  const el = document.createElement("div");
  el.className = "vh-news";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", t("news.title", { version }));
  el.innerHTML = `<h3>${th("news.title", { version })}</h3><ul>${lines.map((l) =>
    `<li>${lineHtml(l.text)}${l.anchor ? ` <a href="${esc(guideAt(l.anchor))}" target="_blank" rel="noopener">${th("news.more")}</a>` : ""}</li>`).join("")}</ul>
    <div><a href="${esc(CHANGELOG_URL)}" target="_blank" rel="noopener">${th("news.all")}</a><button>${th("news.gotIt")}</button></div>`;
  el.querySelector("button")!.onclick = () => {
    remember();
    el.remove();
  };
  root.append(el);
}

export const NEWS_CSS = /* css */ `
.vh-news { position: absolute; z-index: 8; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(92%, 560px); max-height: 80%;
  overflow-y: auto; box-sizing: border-box; padding: 16px 18px; border-radius: 18px; background: var(--vh-glass); color: var(--vh-text);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,.35); font-size: 13px; line-height: 1.45; }
.vh-news h3 { margin: 0 0 8px; font-size: 16px; }
.vh-news ul { margin: 0 0 12px; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; }
.vh-news a { color: var(--vh-accent); }
.vh-news code { font-size: 12px; }
.vh-news div { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.vh-news button { border: 0; border-radius: 12px; padding: 7px 16px; background: var(--vh-accent); color: var(--vh-on-accent); font: inherit; font-weight: 600; cursor: pointer; }
`;

