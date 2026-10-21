// Errors: the box shown when the house can't be drawn, its details (with nothing that names the
// home), and keeping extensions' errors away from the core view.
import { mdiAlertCircleOutline } from "@mdi/js";
import type { Hass } from "../live/hass";
import { privateStrings, stripPrivate } from "../live/strip";
import type { Plan } from "../model/plan";
import { parseTierSetting, resolveTier, TIER_NAMES } from "../scene/tier";

const VERSION = typeof __VERSION__ === "string" ? __VERSION__ : "dev";

/** What the box says (kept together for the one table of strings to come). */
export const ERROR_TEXT = {
  title: "Something went wrong drawing the house",
  copy: "Copy details",
  copied: "Copied",
  copyHint: "Copy this to report it:",
  reload: "Reload",
};

/** Where an error happened and what it can be stripped with. */
export interface ErrorInfo {
  /** card, panel, view, plan, render, graphics, extension… */
  where: string;
  /** The graphics level's name (Tablet, Standard…). */
  graphics: string;
  hass: Hass | null;
  plan: Plan | null;
}

/** An error's message and the first lines of its stack, whatever was thrown. */
export function describeError(err: unknown): { message: string; stack: string } {
  const e = (err && typeof err === "object" ? err : {}) as { name?: unknown; message?: unknown; stack?: unknown };
  const message = typeof e.message === "string" ? (typeof e.name === "string" && e.name ? `${e.name}: ${e.message}` : e.message) : String(err);
  const lines = (typeof e.stack === "string" ? e.stack : "").split("\n").map((l) => l.trim()).filter(Boolean);
  // Chrome's stack starts with the message again
  if (lines.length && message.startsWith(lines[0])) lines.shift();
  return { message: message.slice(0, 300), stack: lines.slice(0, 12).join("\n").slice(0, 2000) };
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\/(\d+)/, "Edge"],
  [/SamsungBrowser\/(\d+)/, "Samsung Internet"],
  [/Silk\/(\d+)/, "Silk"],
  [/(?:Firefox|FxiOS)\/(\d+)/, "Firefox"],
  [/(?:Chrome|CriOS)\/(\d+)/, "Chrome"],
  [/Version\/(\d+)[\d.]* (?:Mobile\/\w+ )?Safari/, "Safari"],
];
const SYSTEMS: [RegExp, string][] = [[/Android/, "Android"], [/iPhone|iPad|iPod/, "iOS"], [/CrOS/, "ChromeOS"], [/Mac OS X/, "macOS"], [/Windows/, "Windows"], [/Linux/, "Linux"]];

/** The browser, its version and the system, e.g. "Chrome 131 on Android": nothing else of the user agent. */
export function browserName(ua: string): string {
  const b = BROWSERS.find(([re]) => re.test(ua));
  const os = SYSTEMS.find(([re]) => re.test(ua))?.[1];
  let name = b ? `${b[1]} ${b[0].exec(ua)![1]}` : "Another browser";
  if (/Home ?Assistant\//.test(ua)) name += " in the Home Assistant app";
  return os ? `${name} on ${os}` : name;
}

/** The details Copy details copies: versions, where, the message and the stack, stripped of names. */
export function errorDetails(err: unknown, info: ErrorInfo): string {
  const names = privateStrings(info.hass, info.plan);
  const { message, stack } = describeError(err);
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  return [
    `VirtuHome ${VERSION}, ${info.graphics} graphics, ${browserName(ua)}`,
    `In: ${info.where}`,
    stripPrivate(message, names),
    stripPrivate(stack, names),
  ].filter(Boolean).join("\n");
}

/** An error the view carries on after (an extension's, a frame that failed once). */
export function logError(err: unknown, where: string): void {
  console.error(`VirtuHome error (${where})`, err);
}

/**
 * An extension's function the core calls (for each room or point: a room tint, a roof map). When
 * it throws the core gets `fallback`, and with `setAside` it isn't called again (a function called
 * thousands of times would throw thousands of times).
 */
export function isolate<A, B, R>(fn: (a: A, b: B) => R, fallback: R, where = "extension", setAside = true): (a: A, b: B) => R {
  let failed = false;
  return (a, b) => {
    if (failed) return fallback;
    try {
      return fn(a, b);
    } catch (err) {
      failed = setAside;
      logError(err, where);
      return fallback;
    }
  };
}

/** Calls each listener of an extension; one that throws stops neither the others nor the view. */
export function callEach<T>(listeners: Iterable<(value: T) => void>, value: T, where = "extension"): void {
  for (const cb of listeners) {
    try {
      cb(value);
    } catch (err) {
      logError(err, where);
    }
  }
}

const BOX_CSS = /* css */ `
.vh-failed > :not(.vh-error) { visibility: hidden; }
.vh-error {
  position: absolute; inset: 0; z-index: 20; display: grid; place-items: center; padding: 16px; box-sizing: border-box;
  background: #0c1220; color: #eef3fb; font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif);
  text-align: center; -webkit-user-select: text; user-select: text;
}
.vh-error > div { display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 340px; }
.vh-error svg { width: 36px; height: 36px; fill: #ffb454; }
.vh-error b { font-size: 16px; font-weight: 600; line-height: 1.35; }
.vh-error .row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.vh-error button {
  border: 0; border-radius: 16px; padding: 8px 16px; font: inherit; font-size: 14px; cursor: pointer;
  background: rgba(255,255,255,0.1); color: inherit;
}
.vh-error button.main { background: #56c7ff; color: #0c1220; font-weight: 600; }
.vh-error small { color: #9fb0c8; font-size: 12px; }
.vh-error textarea {
  width: 100%; height: 120px; box-sizing: border-box; border: 0; border-radius: 10px; padding: 8px;
  font: 11px/1.4 ui-monospace, monospace; background: rgba(255,255,255,0.08); color: inherit; resize: none;
}
.vh-error [hidden] { display: none; }
.day .vh-error { background: #e4e8ee; color: #1d232b; }
.day .vh-error button, .day .vh-error textarea { background: rgba(0,0,0,0.06); }
.day .vh-error button.main { background: #2f7cf6; color: #fff; }
.day .vh-error small { color: #5a6573; }
`;

/** Copies text: the clipboard where the page may use it, else the old way through a selected textarea. */
async function copyText(text: string, area: HTMLTextAreaElement): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // not a secure page (Home Assistant over plain http): no clipboard API
  }
  area.value = text;
  area.hidden = false;
  area.select();
  try {
    if (document.execCommand("copy")) {
      area.hidden = true;
      return true;
    }
  } catch {
    // left selected, to copy by hand
  }
  return false;
}

/**
 * The box shown instead of the house when it can't be drawn: Copy details (worked out when pressed,
 * stripped of names) and Reload. It fills the nearest positioned parent.
 */
export function errorBox(details: () => string): HTMLElement {
  const box = document.createElement("div");
  box.className = "vh-error";
  box.setAttribute("role", "alert");
  box.innerHTML = `<style>${BOX_CSS}</style><div><svg viewBox="0 0 24 24"><path d="${mdiAlertCircleOutline}"/></svg><b></b>
    <div class="row"><button data-act="copy"></button><button class="main" data-act="reload"></button></div>
    <small hidden></small><textarea readonly hidden></textarea></div>`;
  box.querySelector("b")!.textContent = ERROR_TEXT.title;
  const copy = box.querySelector<HTMLButtonElement>('[data-act="copy"]')!;
  const reload = box.querySelector<HTMLButtonElement>('[data-act="reload"]')!;
  const hint = box.querySelector("small")!;
  const area = box.querySelector("textarea")!;
  copy.textContent = ERROR_TEXT.copy;
  reload.textContent = ERROR_TEXT.reload;
  hint.textContent = ERROR_TEXT.copyHint;
  copy.onclick = async () => {
    let text: string;
    try {
      text = details();
    } catch {
      // never the raw error: it may hold the names the details would have taken out
      text = `VirtuHome ${VERSION}: the details could not be worked out`;
    }
    if (await copyText(text, area)) copy.textContent = ERROR_TEXT.copied;
    else hint.hidden = false;
  };
  reload.onclick = () => location.reload();
  return box;
}

/**
 * The card or panel could not make its view at all (no WebGL, say): the box in its place. The
 * returned object takes Home Assistant when it comes, for Copy details to strip names with.
 */
export function failedView(parent: ShadowRoot, err: unknown, where: string, quality?: unknown): { hass: Hass | null } {
  logError(err, where);
  const state: { hass: Hass | null } = { hass: null };
  const graphics = TIER_NAMES[resolveTier(parseTierSetting(quality)).tier];
  parent.replaceChildren(errorBox(() => errorDetails(err, { where, graphics, hass: state.hass, plan: null })));
  return state;
}
