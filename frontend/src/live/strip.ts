// Takes what could tell whose home it is out of an error's text before anyone copies or sends it:
// names and entity ids from Home Assistant and the plan, web addresses, tokens and keys, IP and
// email addresses. The integration strips what it is sent again (custom_components/virtuhome/errors.py).
import type { Plan } from "../model/plan";
import type { Hass } from "./hass";

/** Entity ids of these domains go even when Home Assistant doesn't know the entity (errors.py has the same list). */
export const ENTITY_DOMAINS = [
  "alarm_control_panel", "automation", "binary_sensor", "calendar", "camera", "climate", "counter", "cover",
  "device_tracker", "fan", "humidifier", "input_boolean", "input_button", "input_datetime", "input_number",
  "input_select", "input_text", "lawn_mower", "light", "lock", "media_player", "person", "remote", "scene",
  "script", "sensor", "siren", "switch", "timer", "vacuum", "valve", "water_heater", "weather", "zone",
];

/** Shorter names than this stay: two letters would cut up every stack trace. */
const MIN_NAME = 3;
const ENTITY_ID = /^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/;
/** Where a plan keeps names and entity ids. */
const PLAN_KEYS = new Set(["name", "label", "title", "area_id", "ha_floor", "entity", "cover", "temperature", "humidity"]);

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const ADDRESS = /\b[a-z][a-z0-9+.-]*:\/\/[^\s"'`<>()]*/gi;
const ENTITY = new RegExp(`\\b(?:${ENTITY_DOMAINS.join("|")})\\.[a-z0-9_]+`, "g");
const PATTERNS: [RegExp, string][] = [
  [/\beyJ[\w-]*\.[\w-]*(?:\.[\w-]*)?/g, "<token>"],
  [/[A-Za-z0-9_-]{32,}/g, "<token>"],
  [/\b[A-Z0-9]{2,}(?:-[A-Z0-9]{2,}){3,}\b/g, "<key>"],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "<ip>"],
  [/\b(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b/gi, "<ip>"],
];

/** A script's address keeps its file name and line (what a stack trace needs); any other address goes. */
function shortUrl(url: string): string {
  const at = /(?::\d+){1,2}$/.exec(url)?.[0] ?? "";
  const path = url.slice(0, url.length - at.length).split(/[?#]/)[0];
  const file = path.slice(path.lastIndexOf("/") + 1);
  return /^[\w.-]+\.m?js$/.test(file) ? file + at : "<url>";
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `text` without the names, entity ids, addresses, tokens and keys in it. */
export function stripPrivate(text: string, names: readonly string[] = []): string {
  // whole entity ids before the names in them
  let s = text.replace(EMAIL, "<email>").replace(ADDRESS, shortUrl).replace(ENTITY, "<entity>");
  const lower = s.toLowerCase();
  const hits = names.filter((n) => lower.includes(n.toLowerCase())).sort((a, b) => b.length - a.length);
  if (hits.length) {
    s = s.replace(new RegExp(hits.map(escapeRe).join("|"), "gi"), (m) => (ENTITY_ID.test(m.toLowerCase()) ? "<entity>" : "<name>"));
  }
  for (const [re, to] of PATTERNS) s = s.replace(re, to);
  return s;
}

/** Everything in Home Assistant and the plan that names the home, its people or its devices. */
export function privateStrings(hass: Hass | null | undefined, plan: Plan | null | undefined): string[] {
  const out = new Set<string>();
  const add = (s: unknown) => {
    if (typeof s === "string" && s.trim().length >= MIN_NAME) out.add(s.trim());
  };
  if (hass) {
    for (const id in hass.states) {
      add(id);
      add(hass.states[id]?.attributes?.friendly_name);
    }
    for (const e of Object.values(hass.entities ?? {})) {
      add(e.entity_id);
      add(e.name);
    }
    for (const d of Object.values(hass.devices ?? {})) {
      add(d.name);
      add(d.name_by_user);
    }
    for (const a of Object.values(hass.areas ?? {})) {
      add(a.area_id);
      add(a.name);
      a.aliases?.forEach(add);
    }
    for (const f of Object.values(hass.floors ?? {})) {
      add(f.floor_id);
      add(f.name);
    }
    add(hass.user?.name);
    add((hass.config as { location_name?: unknown } | undefined)?.location_name);
  }
  // the address Home Assistant is reached at turns up without its https:// too
  if (typeof location !== "undefined") add(location.hostname);
  if (plan) walk(plan, "", add, 0);
  return [...out];
}

function walk(v: unknown, key: string, add: (s: unknown) => void, depth: number): void {
  if (depth > 12) return;
  if (typeof v === "string") {
    if (PLAN_KEYS.has(key) || ENTITY_ID.test(v)) add(v);
  } else if (Array.isArray(v)) {
    for (const x of v) walk(x, key, add, depth + 1);
  } else if (v && typeof v === "object") {
    for (const k in v) walk((v as Record<string, unknown>)[k], k, add, depth + 1);
  }
}
