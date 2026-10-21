// Errors: the box shown when the house can't be drawn, its details (with nothing that names the
// home), keeping extensions' errors away from the core view, and sending recent errors to the
// integration for the diagnostics file.
import { mdiAlertCircleOutline } from "@mdi/js";
import { t } from "../i18n";
import type { Hass } from "../live/hass";
import { privateStrings, stripPrivate } from "../live/strip";
import type { Plan } from "../model/plan";
import { parseTierSetting, resolveTier, tierNameEn } from "../scene/tier";

const VERSION = typeof __VERSION__ === "string" ? __VERSION__ : "dev";

/** Where an error happened and what it can be stripped with. */
export interface ErrorInfo {
  /** card, panel, view, plan, render, graphics, extension… */
  where: string;
  /** The graphics level's name (Tablet, Standard…). */
  graphics: string;
  hass: Hass | null;
  plan: Plan | null;
}

/** An error's message and the first lines of its stack, whatever was thrown (cut again once stripped). */
export function describeError(err: unknown): { message: string; stack: string } {
  const e = (err && typeof err === "object" ? err : {}) as { name?: unknown; message?: unknown; stack?: unknown };
  const message = typeof e.message === "string" ? (typeof e.name === "string" && e.name ? `${e.name}: ${e.message}` : e.message) : String(err);
  const lines = (typeof e.stack === "string" ? e.stack : "").split("\n").map((l) => l.trim()).filter(Boolean);
  // Chrome's stack starts with the message again
  if (lines.length && message.startsWith(lines[0])) lines.shift();
  return { message: message.slice(0, 1200), stack: lines.slice(0, 12).join("\n").slice(0, 8000) };
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
    stripPrivate(message, names).slice(0, 300),
    stripPrivate(stack, names).slice(0, 2000),
  ].filter(Boolean).join("\n");
}

/** An error the view carries on after (an extension's, a frame that failed once): logged and reported. */
export function logError(err: unknown, where: string): void {
  console.error(`VirtuHome error (${where})`, err);
  reportError(err, where);
}

// ------------------------------------------------------------------ reports to the integration

/** At most this many reports a minute, and this many different errors a page. */
const REPORT_RATE = 5;
const REPORT_MAX = 20;

type ReportSource = () => Omit<ErrorInfo, "where">;
const sources = new Set<ReportSource>();
/** Errors already sent (once each), when the last few went, and those waiting for Home Assistant. */
const reported = new Set<string>();
const sentAt: number[] = [];
let held: [unknown, string][] = [];
let reporting = false;

/** Where reports take Home Assistant, the plan and the graphics level from (each view gives its own); returns the removal. */
export function reportFrom(source: ReportSource): () => void {
  sources.add(source);
  watchPage();
  return () => sources.delete(source);
}

/** Home Assistant arrived: errors from before it are sent now. */
export function sendHeld(): void {
  const waiting = held;
  held = [];
  for (const [err, where] of waiting) reportError(err, where);
}

/**
 * Sends an error to the integration (virtuhome/errors/report), which keeps the last 50 for the
 * diagnostics file. Stripped of names first, each error once, a few a minute at most. Nothing here
 * throws, and an error while reporting is never reported.
 */
export function reportError(err: unknown, where: string): void {
  if (reporting) return;
  reporting = true;
  try {
    let info: Omit<ErrorInfo, "where"> | null = null;
    for (const source of sources) {
      const i = source();
      if (i.hass) {
        info = i;
        break;
      }
    }
    if (!info?.hass) {
      if (held.length < REPORT_RATE) held.push([err, where]);
      return;
    }
    const { message, stack } = describeError(err);
    const key = `${where}\n${message}\n${stack.split("\n", 1)[0]}`;
    const now = Date.now();
    while (sentAt.length && now - sentAt[0] > 60_000) sentAt.shift();
    if (reported.has(key) || reported.size >= REPORT_MAX || sentAt.length >= REPORT_RATE) return;
    reported.add(key);
    sentAt.push(now);
    const names = privateStrings(info.hass, info.plan);
    const sent = info.hass.callWS({
      type: "virtuhome/errors/report", where, message: stripPrivate(message, names).slice(0, 300),
      stack: stripPrivate(stack, names).slice(0, 2000), version: VERSION, graphics: info.graphics,
      browser: browserName(typeof navigator === "undefined" ? "" : navigator.userAgent),
    });
    // an integration without the command (older, or the dev harness) just doesn't keep it
    Promise.resolve(sent).catch(() => undefined);
  } catch {
    // reporting never throws
  } finally {
    reporting = false;
  }
}

/** Our scripts (the app's chunks and the extensions), to tell our uncaught errors from Home Assistant's. */
const OURS = [new URL(".", import.meta.url).href, "/virtuhome_ext/"];
let watching = false;

/** Errors of ours that nothing caught (in a timer, a click, a promise) are reported too. */
function watchPage(): void {
  if (watching || typeof window === "undefined") return;
  watching = true;
  const ours = (err: unknown, file = "") => OURS.some((u) => file.includes(u) || String((err as Error)?.stack ?? "").includes(u));
  window.addEventListener("error", (e) => ours(e.error, e.filename) && reportError(e.error ?? e.message, "page"));
  window.addEventListener("unhandledrejection", (e) => ours(e.reason) && reportError(e.reason, "page"));
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
  box.querySelector("b")!.textContent = t("error.title");
  const copy = box.querySelector<HTMLButtonElement>('[data-act="copy"]')!;
  const reload = box.querySelector<HTMLButtonElement>('[data-act="reload"]')!;
  const hint = box.querySelector("small")!;
  const area = box.querySelector("textarea")!;
  copy.textContent = t("error.copy");
  reload.textContent = t("error.reload");
  hint.textContent = t("error.copyHint");
  copy.onclick = async () => {
    let text: string;
    try {
      text = details();
    } catch {
      // never the raw error: it may hold the names the details would have taken out
      text = `VirtuHome ${VERSION}: the details could not be worked out`;
    }
    if (await copyText(text, area)) copy.textContent = t("error.copied");
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
  const graphics = tierNameEn(resolveTier(parseTierSetting(quality)).tier);
  let hass: Hass | null = null;
  reportFrom(() => ({ hass, plan: null, graphics }));
  logError(err, where);
  parent.replaceChildren(errorBox(() => errorDetails(err, { where, graphics, hass, plan: null })));
  return {
    get hass() {
      return hass;
    },
    set hass(h) {
      hass = h;
      sendHeld();
    },
  };
}
