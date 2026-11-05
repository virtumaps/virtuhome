// Help where it's needed: a "?" in each panel that opens its part of the guide, and first-time hints
// shown once per person (kept in the browser; with no storage they just show again next time).
import { mdiHelpCircleOutline } from "@mdi/js";
import { esc, th } from "../i18n";
import { guideAt } from "./guide";

const KEY = "virtuhome.hints";

/** The hints there are. */
export type HintId = "view.long" | "editor.select" | "editor.measure";

function seen(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function hintSeen(id: HintId): boolean {
  return seen().includes(id);
}

export function markHint(id: HintId): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set([...seen(), id])]));
  } catch {
    // no storage: it shows again next time
  }
}

/** Edit → Home → Show hints again. */
export function resetHints(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing kept, nothing to forget
  }
}

/**
 * Shows a hint once: a small bubble with Got it, at the top or bottom edge of `root` (away from what it
 * explains). Returns a function that takes it away. Nothing shows if it was seen already.
 */
export function showHint(root: HTMLElement, id: HintId, text: string, where: "top" | "bottom" = "top"): () => void {
  if (hintSeen(id) || root.querySelector(".vh-hint")) return () => {};
  const el = document.createElement("div");
  el.className = `vh-hint ${where}`;
  el.innerHTML = `<span>${esc(text)}</span><button>${th("hint.gotIt")}</button>`;
  const close = () => el.remove();
  el.querySelector("button")!.onclick = () => {
    markHint(id);
    close();
  };
  root.append(el);
  return close;
}

/** A "?" that opens a part of the guide in a new tab. */
export function helpLink(anchor: string, cls = "vh-icon vh-help"): string {
  return `<a class="${cls}" href="${esc(guideAt(anchor))}" target="_blank" rel="noopener" title="${th("view.help")}" aria-label="${th("view.help")}"><svg viewBox="0 0 24 24"><path d="${mdiHelpCircleOutline}"/></svg></a>`;
}

export const HINT_CSS = `
.vh-hint { position: absolute; z-index: 7; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 10px;
  max-width: min(92%, 420px); padding: 8px 8px 8px 14px; border-radius: 14px; background: rgba(14,20,32,.86); color: #eef3fb;
  font-size: 13px; box-shadow: 0 4px 16px rgba(0,0,0,.3); }
.vh-hint.top { top: 62px; }
.vh-hint.bottom { bottom: 14px; }
.vh-hint button { border: 0; border-radius: 10px; padding: 5px 10px; background: rgba(255,255,255,.16); color: inherit; font: inherit; cursor: pointer; white-space: nowrap; }
a.vh-help { text-decoration: none; margin-left: auto; width: 32px; height: 32px; box-shadow: none; display: grid; place-items: center; color: var(--vh-dim); }
a.vh-help svg { width: 20px; height: 20px; fill: currentColor; }
a.vh-help + .vh-close, .vh-sky h3 a.vh-help + .vh-icon { margin-left: 0; }
`;
