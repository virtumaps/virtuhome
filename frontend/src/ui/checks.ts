// Check my setup: what stops VirtuHome working as it should. Each check says what it found; the
// editor draws them with their fixes, the view counts the problems for the dot on Edit, and only the
// counts (never names or entity ids) go to the integration for the diagnostics file.
import { linkRoomsByName } from "../auto/placement";
import type { Hass } from "../live/hass";
import { missingLinks } from "../model/links";
import { t } from "../i18n";
import type { Plan, Repair } from "../model/plan";
import { TIER_NAMES, TIERS, type Tier } from "../scene/tier";

export type CheckId = "links" | "rooms" | "areas" | "card" | "graphics" | "extensions" | "repairs";
/** Safe fixes; nothing changes until one is pressed. */
export type Fix = "relink" | "link-rooms" | "open-rooms" | "add-rooms" | "reload" | "resource" | "graphics" | "renew" | "save";

export interface Check {
  id: CheckId;
  /** problem: something doesn't work (the dot on Edit); note: worth knowing; ok: nothing to do. */
  level: "ok" | "note" | "problem";
  /** How many things it found: 0 when all is well. */
  count: number;
  title: string;
  text: string;
  fixes: Fix[];
  /** Areas without a room (area ids), for their fixes. */
  areas?: string[];
}

/** What the integration says about itself (virtuhome/checks). */
export interface ServerChecks {
  version: string;
  /**
   * How dashboards get the card (card_resource.async_state). pending: Home Assistant is still
   * starting and hasn't had the card's resource put right yet.
   */
  dashboard: { mode: string; urls?: string[]; current?: boolean; pending?: boolean };
  licence: { status: string; error: string | null; extensions: { id: string; name: string }[] } | null;
}

export interface CheckInput {
  plan: Plan;
  hass: Hass;
  /** What normalizePlan put right while loading the plan. */
  repairs: Repair[];
  /** undefined: not asked yet; null: the integration didn't answer. */
  server: ServerChecks | null | undefined;
  /** The VirtuHome this page runs. */
  version: string;
  graphics: { tier: Tier; auto: boolean; detected: Tier; cap: Tier | null; software: boolean };
  extensions: readonly { name: string; newer: boolean }[];
}

const check = (id: CheckId, title: string, found: [Check["level"], string][], ok: string, fixes: (Fix | false)[] = []): Check => {
  const worst = found.some(([l]) => l === "problem") ? "problem" : found.length ? "note" : "ok";
  const text = found.length ? found.map(([, t]) => t).join(" ") : ok;
  return { id, level: worst, count: found.length, title, text, fixes: fixes.filter((f): f is Fix => !!f) };
};

export function checkLinks(plan: Plan, hass: Hass): Check {
  const n = missingLinks(plan, hass).length;
  const found: [Check["level"], string][] = n ? [["problem", t("checks.links.missing", { n })]] : [];
  return { ...check("links", t("checks.links.title"), found, t("checks.links.ok"), [n > 0 && "relink"]), count: n };
}

export function checkRooms(plan: Plan, hass: Hass): Check {
  const areas = hass.areas;
  const all = plan.floors.flatMap((f) => [...f.rooms, ...(f.outdoor ?? [])]);
  const gone = areas ? all.filter((r) => r.area_id && !areas[r.area_id]).length : 0;
  const unlinked = plan.floors.flatMap((f) => f.rooms).filter((r) => !r.area_id).length;
  const found: [Check["level"], string][] = [];
  if (gone) found.push(["problem", t("checks.rooms.gone", { n: gone })]);
  if (unlinked) found.push(["note", t("checks.rooms.unlinked", { n: unlinked })]);
  // linking by name helps when an area is named like a room
  const byName = unlinked > 0 && linkRoomsByName(structuredClone(plan), hass).length > 0;
  return { ...check("rooms", t("checks.rooms.title"), found, t("checks.rooms.ok"), [(gone > 0 || byName) && "link-rooms", found.length > 0 && "open-rooms"]), count: gone + unlinked };
}

export function checkAreas(plan: Plan, hass: Hass): Check {
  const used = new Set(plan.floors.flatMap((f) => [...f.rooms, ...(f.outdoor ?? [])].map((r) => r.area_id)));
  const withDevices = new Set<string>();
  for (const d of Object.values(hass.devices ?? {})) if (d.area_id) withDevices.add(d.area_id);
  for (const e of Object.values(hass.entities ?? {})) if (e.area_id && !e.hidden && !e.entity_category) withDevices.add(e.area_id);
  const ids = [...withDevices].filter((a) => !used.has(a) && hass.areas?.[a]);
  const names = ids.map((a) => hass.areas![a].name).sort((a, b) => a.localeCompare(b));
  const found: [Check["level"], string][] = ids.length ? [["note", t("checks.areas.found", { n: ids.length, names: names.join(", ") })]] : [];
  return { ...check("areas", t("checks.areas.title"), found, t("checks.areas.ok"), [ids.length > 0 && "add-rooms"]), count: ids.length, areas: ids };
}

export function checkCard(server: ServerChecks | null | undefined, version: string): Check {
  if (server === undefined) return check("card", t("checks.card.title"), [], t("checks.card.checking"));
  if (server === null) return check("card", t("checks.card.title"), [["note", t("checks.card.noAnswer")]], "");
  const found: [Check["level"], string][] = [];
  const old = server.version !== version;
  if (old) found.push(["problem", t("checks.card.old", { version, installed: server.version })]);
  const d = server.dashboard;
  // just after a restart the resources can still name the version before an update: not known yet
  const known = !d.pending;
  if (known && d.mode === "storage" && !d.urls?.length) found.push(["problem", t("checks.card.noResource")]);
  else if (known && d.mode === "storage" && !d.current) found.push(["problem", t("checks.card.oldResource")]);
  else if (known && d.mode === "yaml") found.push(["note", t("checks.card.yaml")]);
  const resource = known && d.mode === "storage" && (!d.urls?.length || !d.current);
  const ok = known ? t("checks.card.ok", { version }) : t("checks.card.starting");
  return check("card", t("checks.card.title"), found, ok, [old && "reload", resource && "resource"]);
}

export function checkGraphics(g: CheckInput["graphics"]): Check {
  const found: [Check["level"], string][] = [];
  const capped = g.auto && !!g.cap && TIERS.indexOf(g.cap) < TIERS.indexOf(g.detected);
  if (capped && g.cap) {
    found.push(["note", t("checks.graphics.capped", { tier: TIER_NAMES[g.cap] })]);
  }
  if (g.auto && g.software) found.push(["note", t("checks.graphics.software")]);
  const ok = t(g.auto ? "checks.graphics.auto" : "checks.graphics.picked", { tier: TIER_NAMES[g.tier] });
  return check("graphics", t("checks.graphics.title"), found, ok, [capped && "graphics"]);
}

export function checkExtensions(licence: ServerChecks["licence"] | undefined, failed: CheckInput["extensions"]): Check {
  const found: [Check["level"], string][] = [];
  const newer = failed.filter((x) => x.newer).map((x) => x.name);
  const broken = failed.filter((x) => !x.newer).map((x) => x.name);
  if (newer.length) found.push(["problem", t("checks.extensions.newer", { n: newer.length, names: newer.join(", ") })]);
  if (broken.length) found.push(["problem", t("checks.extensions.broken", { names: broken.join(", ") })]);
  const error = licence?.error;
  if (licence?.status === "expired") found.push(["problem", error ? t("checks.extensions.expiredWhy", { error }) : t("checks.extensions.expired")]);
  else if (licence?.status === "invalid") found.push(["problem", error ? t("checks.extensions.invalidWhy", { error }) : t("checks.extensions.invalid")]);
  else if (licence?.status === "active" && error) found.push(["note", t("checks.extensions.renewFailed", { error })]);
  const names = licence?.extensions.map((x) => x.name) ?? [];
  const renew = licence?.status === "expired" || licence?.status === "invalid" || (licence?.status === "active" && !!licence.error);
  const ok = licence?.status !== "active" ? t("checks.extensions.none")
    : names.length ? t("checks.extensions.activeWith", { names: names.join(", ") }) : t("checks.extensions.active");
  return check("extensions", t("checks.extensions.title"), found, ok, [renew && "renew"]);
}

export function checkRepairs(repairs: Repair[]): Check {
  const counts = new Map<Repair, number>();
  for (const r of repairs) counts.set(r, (counts.get(r) ?? 0) + 1);
  const parts = [...counts].map(([r, n]) => t(`checks.repairs.${r}`, { n }));
  const found: [Check["level"], string][] = parts.length ? [["note", t("checks.repairs.found", { repairs: parts.join("; ") })]] : [];
  return { ...check("repairs", t("checks.repairs.title"), found, t("checks.repairs.ok"), [parts.length > 0 && "save"]), count: repairs.length };
}

export function runChecks(i: CheckInput): Check[] {
  return [
    checkLinks(i.plan, i.hass),
    checkRooms(i.plan, i.hass),
    checkAreas(i.plan, i.hass),
    checkCard(i.server, i.version),
    checkGraphics(i.graphics),
    checkExtensions(i.server?.licence, i.extensions),
    checkRepairs(i.repairs),
  ];
}

/** What the diagnostics get: each check's id and count, nothing else. */
export const checkCounts = (checks: Check[]): Record<string, number> => Object.fromEntries(checks.map((c) => [c.id, c.count]));
