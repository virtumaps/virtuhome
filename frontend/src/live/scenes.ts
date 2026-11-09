// Scenes and scripts on a room's sheet: those of its area (their own area, or their device's), with
// the ones picked for the room in the editor first and those hidden there left out. A script that
// can't run without details (a required field) is left out: its dialog asks for them.
import { areaOf, domainOf, type Hass } from "./hass";
import type { Room } from "../model/plan";

/** The most a sheet shows. */
export const MAX_SCENES = 12;

/** A list of entity ids from the plan (a plan edited by hand may hold anything). */
export const idList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.includes(".")) : []);

/** A scene or a script: what a tap runs. */
export const runnable = (id: string): boolean => /^(scene|script)\./.test(id);

/** A script with a field it needs: it can only run from its dialog. */
export function needsDetails(hass: Hass, id: string): boolean {
  if (domainOf(id) !== "script") return false;
  return Object.values(hass.services?.script?.[id.slice(7)]?.fields ?? {}).some((f) => f?.required);
}

/** The scenes and scripts of an area that can run from a tap, by name. */
export function areaScenes(hass: Hass, area: string | null): string[] {
  if (!area) return [];
  const name = (id: string) => String(hass.states[id]?.attributes.friendly_name ?? id);
  return Object.entries(hass.entities ?? {})
    .filter(([id, reg]) => runnable(id) && !reg.hidden && !reg.entity_category && hass.states[id] && areaOf(hass, id) === area && !needsDetails(hass, id))
    .map(([id]) => id)
    .sort((a, b) => name(a).localeCompare(name(b)));
}

/** What a room's or garden area's sheet shows: those picked for it first, then its area's own not hidden. */
export function roomScenes(hass: Hass, space: Pick<Room, "area_id" | "scenes" | "hide_scenes">): string[] {
  const hidden = new Set(idList(space.hide_scenes));
  const picked = idList(space.scenes).filter((id) => runnable(id) && hass.states[id]);
  return [...new Set([...picked, ...areaScenes(hass, space.area_id).filter((id) => !hidden.has(id))])].slice(0, MAX_SCENES);
}

/**
 * What a scene sets that it asks about first: locks, alarm panels, garage doors and gates. Scripts
 * don't say what they do, so they run at once.
 */
export function sceneRisks(hass: Hass, id: string): string[] {
  if (domainOf(id) !== "scene") return [];
  return idList(hass.states[id]?.attributes.entity_id).filter((x) => {
    const d = domainOf(x);
    return d === "lock" || d === "alarm_control_panel" || (d === "cover" && /garage|gate/.test(String(hass.states[x]?.attributes.device_class ?? "")));
  });
}
