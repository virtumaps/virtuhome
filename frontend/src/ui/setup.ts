// Getting started: the first-run choices and the checklist that follows a new home until it is set up.
import type { Hass } from "../live/hass";
import type { Plan } from "../model/plan";

/** How a new home is got in (the first-run choices). */
export type StartKind = "scan" | "trace" | "draw";

export const START_CHOICES: { kind: StartKind; title: string; text: string }[] = [
  { kind: "trace", title: "Trace a floor plan picture", text: "An estate agent's plan, or a photo of a sketch. No scanner needed." },
  { kind: "scan", title: "Import a scan", text: "From an iPhone or iPad with LiDAR, made with the House Scan app." },
  { kind: "draw", title: "Draw it myself", text: "Drag out the rooms in the 2D plan and type their sizes." },
];

export type SetupId = "home" | "areas" | "devices" | "north" | "card" | "tablet";

export interface SetupItem {
  id: SetupId;
  title: string;
  hint: string;
  done: boolean;
  /** Ticked by hand: the plan can't tell whether it is done. */
  manual: boolean;
  optional: boolean;
}

/** What the checklist can't read from the plan: whether a dashboard shows the card (null: not known yet). */
export interface SetupFacts {
  cardOnDashboard: boolean | null;
}

const hasRooms = (plan: Plan): boolean => plan.floors.some((f) => f.rooms.length > 0);

/** A home with no rooms yet gets the first-run choices instead of an empty view. */
export const isNewHome = (plan: Plan | null | undefined): boolean => !plan || !hasRooms(plan);

/** The getting-started checklist, in order. */
export function setupItems(plan: Plan, hass: Hass | null | undefined, facts: SetupFacts): SetupItem[] {
  const ticked = new Set(plan.settings.setup?.done ?? []);
  const rooms = plan.floors.flatMap((f) => f.rooms);
  const linked = new Set(rooms.map((r) => r.area_id).filter(Boolean));
  // every room linked, or none of Home Assistant's areas left for the rest
  const freeAreas = Object.keys(hass?.areas ?? {}).filter((a) => !linked.has(a));
  const areasDone = rooms.length > 0 && (rooms.every((r) => r.area_id) || freeAreas.length === 0);
  const placed = plan.floors.some((f) => f.devices.length > 0 || f.furniture.some((x) => x.entity));
  // seen: done by what the plan shows; null: only a tick says it is done
  const item = (id: SetupId, title: string, hint: string, seen: boolean | null, optional = false): SetupItem => ({
    id, title, hint, optional, manual: seen === null, done: !!seen || ticked.has(id),
  });
  return [
    item("home", "Get your home in", "Trace a floor plan picture, import a scan, or draw the rooms.", rooms.length > 0),
    item("areas", "Link the rooms to areas", "Each room shows the devices of its Home Assistant area.", areasDone),
    item("devices", "Place your devices", "Lights, sensors, cameras and thermostats go into their rooms, contacts onto their doors and windows.", placed),
    item("north", "Set north", "So the sun shines in from the right side.", plan.settings.north !== 0 ? true : null),
    item("card", "Put the house on a dashboard", "Edit a dashboard, add a card and pick VirtuHome.", facts.cardOnDashboard ? true : null),
    item("tablet", "Set up a wall tablet", "A tablet on the wall showing the house.", null, true),
  ];
}

/** Every item that isn't optional is done. */
export const setupComplete = (items: SetupItem[]): boolean => items.every((it) => it.done || it.optional);

/** The checklist shows in the editor until it is complete or dismissed. */
export const showChecklist = (plan: Plan, items: SetupItem[]): boolean => !plan.settings.setup?.dismissed && !setupComplete(items);

/** Whether one of the dashboards shows a VirtuHome card (null when it can't be told: no rights, or an error). */
export async function cardOnDashboard(hass: Hass): Promise<boolean | null> {
  try {
    const boards = await hass.callWS<{ url_path: string; mode?: string }[]>({ type: "lovelace/dashboards/list" });
    const paths: (string | null)[] = [null, ...boards.map((b) => b.url_path)];
    for (const url_path of paths) {
      const config = await hass.callWS<unknown>({ type: "lovelace/config", url_path }).catch(() => null);
      if (config && JSON.stringify(config).includes("custom:virtuhome-card")) return true;
    }
    return false;
  } catch {
    return null;
  }
}
