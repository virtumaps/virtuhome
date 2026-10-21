// Check my setup: what stops VirtuHome working as it should. Each check says what it found; the
// editor draws them with their fixes, the view counts the problems for the dot on Edit, and only the
// counts (never names or entity ids) go to the integration for the diagnostics file.
import { linkRoomsByName } from "../auto/placement";
import type { Hass } from "../live/hass";
import { missingLinks } from "../model/links";
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

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const check = (id: CheckId, title: string, found: [Check["level"], string][], ok: string, fixes: (Fix | false)[] = []): Check => {
  const worst = found.some(([l]) => l === "problem") ? "problem" : found.length ? "note" : "ok";
  const text = found.length ? found.map(([, t]) => t).join(" ") : ok;
  return { id, level: worst, count: found.length, title, text, fixes: fixes.filter((f): f is Fix => !!f) };
};

export function checkLinks(plan: Plan, hass: Hass): Check {
  const n = missingLinks(plan, hass).length;
  const found: [Check["level"], string][] = n ? [["problem", `${plural(n, "linked entity", "linked entities")} Home Assistant no longer has: renamed or removed. Relink each to what replaced it, or pick another.`]] : [];
  return { ...check("links", "Linked entities", found, "Everything the plan links is in Home Assistant.", [n > 0 && "relink"]), count: n };
}

export function checkRooms(plan: Plan, hass: Hass): Check {
  const areas = hass.areas;
  const all = plan.floors.flatMap((f) => [...f.rooms, ...(f.outdoor ?? [])]);
  const gone = areas ? all.filter((r) => r.area_id && !areas[r.area_id]).length : 0;
  const unlinked = plan.floors.flatMap((f) => f.rooms).filter((r) => !r.area_id).length;
  const found: [Check["level"], string][] = [];
  if (gone) found.push(["problem", `${plural(gone, "room is", "rooms are")} linked to an area Home Assistant no longer has.`]);
  if (unlinked) found.push(["note", `${plural(unlinked, "room isn't", "rooms aren't")} linked to an area, so their devices, temperature and people don't show.`]);
  // linking by name helps when an area is named like a room
  const byName = unlinked > 0 && linkRoomsByName(structuredClone(plan), hass).length > 0;
  return { ...check("rooms", "Rooms and areas", found, "Every room is linked to a Home Assistant area.", [(gone > 0 || byName) && "link-rooms", found.length > 0 && "open-rooms"]), count: gone + unlinked };
}

export function checkAreas(plan: Plan, hass: Hass): Check {
  const used = new Set(plan.floors.flatMap((f) => [...f.rooms, ...(f.outdoor ?? [])].map((r) => r.area_id)));
  const withDevices = new Set<string>();
  for (const d of Object.values(hass.devices ?? {})) if (d.area_id) withDevices.add(d.area_id);
  for (const e of Object.values(hass.entities ?? {})) if (e.area_id && !e.hidden && !e.entity_category) withDevices.add(e.area_id);
  const ids = [...withDevices].filter((a) => !used.has(a) && hass.areas?.[a]);
  const names = ids.map((a) => hass.areas![a].name).sort((a, b) => a.localeCompare(b));
  const found: [Check["level"], string][] = ids.length ? [["note", `${plural(ids.length, "area has", "areas have")} devices but no room in the plan: ${names.join(", ")}.`]] : [];
  return { ...check("areas", "Areas without a room", found, "Every area with devices has a room.", [ids.length > 0 && "add-rooms"]), count: ids.length, areas: ids };
}

export function checkCard(server: ServerChecks | null | undefined, version: string): Check {
  if (server === undefined) return check("card", "Dashboard card", [], "Checking…");
  if (server === null) return check("card", "Dashboard card", [["note", "The VirtuHome integration didn't answer, so the card wasn't checked."]], "");
  const found: [Check["level"], string][] = [];
  const old = server.version !== version;
  if (old) found.push(["problem", `This page runs VirtuHome ${version}, but ${server.version} is installed: reload the page (on a tablet, clear the browser's cache).`]);
  const d = server.dashboard;
  // just after a restart the resources can still name the version before an update: not known yet
  const known = !d.pending;
  if (known && d.mode === "storage" && !d.urls?.length) found.push(["problem", "The card isn't in your dashboards' resources, so VirtuHome cards can't show."]);
  else if (known && d.mode === "storage" && !d.current) found.push(["problem", "Your dashboards load an older version of the card."]);
  else if (known && d.mode === "yaml") found.push(["note", "Your dashboards' resources are kept in YAML: add /virtuhome_static/virtuhome-loader.js there as a module resource."]);
  const resource = known && d.mode === "storage" && (!d.urls?.length || !d.current);
  const ok = known ? `VirtuHome ${version}, and the card is in your dashboards' resources.` : "Checking… Home Assistant is still starting.";
  return check("card", "Dashboard card", found, ok, [old && "reload", resource && "resource"]);
}

export function checkGraphics(g: CheckInput["graphics"]): Check {
  const found: [Check["level"], string][] = [];
  const capped = g.auto && !!g.cap && TIERS.indexOf(g.cap) < TIERS.indexOf(g.detected);
  if (capped && g.cap) {
    found.push(["note", `Automatic stepped down to ${TIER_NAMES[g.cap]} because turning the view was slow on this device.`]);
  }
  if (g.auto && g.software) found.push(["note", "This browser draws without the graphics card (WebGL runs in software), so Automatic picks Tablet. Turn on hardware acceleration in the browser's settings."]);
  return check("graphics", "Graphics on this device", found, `${g.auto ? "Automatic" : "Picked on this device"}: ${TIER_NAMES[g.tier]}.`, [capped && "graphics"]);
}

export function checkExtensions(licence: ServerChecks["licence"] | undefined, failed: CheckInput["extensions"]): Check {
  const found: [Check["level"], string][] = [];
  const newer = failed.filter((x) => x.newer).map((x) => x.name);
  const broken = failed.filter((x) => !x.newer).map((x) => x.name);
  if (newer.length) found.push(["problem", `${newer.join(", ")} ${newer.length === 1 ? "needs" : "need"} a newer VirtuHome: update VirtuHome in HACS.`]);
  if (broken.length) found.push(["problem", `${broken.join(", ")} could not load.`]);
  const why = licence?.error ? ` (${licence.error})` : "";
  if (licence?.status === "expired") found.push(["problem", `The licence has expired${why}. Its extensions stop until it renews.`]);
  else if (licence?.status === "invalid") found.push(["problem", `The licence key isn't valid here${why}.`]);
  else if (licence?.status === "active" && licence.error) found.push(["note", `The licence couldn't be renewed lately (${licence.error}). Extensions keep working until it expires.`]);
  const names = licence?.extensions.map((x) => x.name) ?? [];
  const renew = licence?.status === "expired" || licence?.status === "invalid" || (licence?.status === "active" && !!licence.error);
  return check("extensions", "Extensions and licence", found, licence?.status === "active" ? `Licence active${names.length ? `: ${names.join(", ")}` : ""}.` : "No licence key, so no extensions.", [renew && "renew"]);
}

const REPAIRS: Record<Repair, (n: number) => string> = {
  height: (n) => `put ${plural(n, "wall cupboard or ceiling lamp", "wall cupboards or ceiling lamps")} back at the usual height`,
  fence: (n) => `left out ${plural(n, "fence")} with fewer than two corners`,
  background: (n) => `left out ${plural(n, "floor plan picture")} without a size or scale`,
  steps: (n) => `left out ${plural(n, "flight")} of steps on a missing edge`,
  roof: (n) => `left out ${plural(n, "roof")} too small to build`,
  shape: (n) => `gave ${plural(n, "roof")} of an unknown shape a gable`,
  slope: (n) => `put ${plural(n, "roof slope")} back in range`,
  panel: (n) => `reset ${plural(n, "solar panel size")} that couldn't be right`,
  link: (n) => `left out ${plural(n, "unreadable entity record")}`,
};

export function checkRepairs(repairs: Repair[]): Check {
  const counts = new Map<Repair, number>();
  for (const r of repairs) counts.set(r, (counts.get(r) ?? 0) + 1);
  const parts = [...counts].map(([r, n]) => REPAIRS[r](n));
  const found: [Check["level"], string][] = parts.length ? [["note", `While loading the plan, VirtuHome ${parts.join("; ")}. Save to keep the plan as repaired.`]] : [];
  return { ...check("repairs", "Plan repairs", found, "The plan loaded as it was saved.", [parts.length > 0 && "save"]), count: repairs.length };
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
