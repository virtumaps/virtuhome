// Extensions: paid add-ons (VirtuHome Pro) are separate ES modules that the integration downloads
// for a licence, verifies and serves. The core loads them and hands each one this API. They share
// the core's three.js through the context, so they stay small.
//
// An extension module's default export:
//   export default { id: "wall_tablet", name: "Wall Tablet", apiVersion: 1, setup(ctx) { ... } }
//
// API 2 adds tools, room tints and texts, and the house's energy (solar, battery, grid; car chargers
// in sources.ev and now.ev).
// API 3 adds replays of the past (the view draws states an extension gives it, from the recorder's
// history, and switches nothing meanwhile), where entities are in the plan, and floor and room moves.
// API 4 adds the roofs: their slopes and solar panels, what can shade them, the home's place, and
// colours painted over them (a solar map).
import * as THREE from "three";
import type { EnergyNow, EnergySources, EnergyToday } from "../live/energy";
import type { Hass, HassEntity } from "../live/hass";
import type { RoomText, RoomTint } from "../live/live";
import type { Plan } from "../model/plan";
import type { RoofFaceInfo, SolarArrayInfo } from "../scene/roof-info";
import type { Viewer } from "../scene/viewer";
import type { EnergySection } from "../ui/energy";
import { logError } from "../ui/errors";

export const EXT_API_VERSION = 4;

export type { RoofFaceInfo, SolarArrayInfo };

/** A round button in the view's tool column. */
export interface Tool {
  /** An SVG path (24 x 24), e.g. one of @mdi/js. */
  icon: string;
  title: string;
  onClick(): void;
}

export interface ToolHandle {
  readonly el: HTMLButtonElement;
  /** Shows the tool as switched on (accent colour). */
  setOn(on: boolean): void;
  remove(): void;
}

/** The house's solar, battery, grid and car chargers, as the core reads them. */
export interface EnergyHandle {
  readonly sources: EnergySources;
  readonly now: EnergyNow | null;
  readonly today: EnergyToday | null;
  /** Called when the readings change; returns an unsubscribe. */
  onChange(cb: (now: EnergyNow) => void): () => void;
  /** A section of the energy sheet, under the flow and today's totals; returns its removal. */
  addSection(section: EnergySection): () => void;
  /** Opens the energy sheet. */
  open(): void;
}

/** Where an entity is in the plan. Rooms count as the view does: a floor's rooms, then its garden areas. */
export interface Place {
  floor: number;
  /** -1 when only the floor is known. */
  room: number;
  floorName: string;
  roomName: string | null;
}

/** What a tap on the house hit while a replay shows. */
export interface ReplayHit {
  floor: number;
  room: number;
  entity: string | null;
}

export interface ReplayOptions {
  /** Colours and texts for the rooms while the replay shows (other extensions' wait meanwhile). */
  tint?: RoomTint | null;
  text?: RoomText | null;
  /** A tap on the house: nothing is switched or opened while a replay shows. */
  onHit?(hit: ReplayHit, gesture: "tap" | "long" | "double"): void;
  /** The replay ended, by end() or by the view (editing began, another replay started, the view went away). */
  onEnd?(): void;
}

/** The view showing the past instead of now. */
export interface ReplaySession {
  /**
   * Shows the house with these states, as it was at `time` (ms). Hand over the same state object
   * for an entity that did not change: only what changed is redrawn. Entities left out show as
   * unknown, so include every watched entity.
   */
  show(states: Record<string, HassEntity>, time: number): void;
  /** Redraws the rooms' tints alone, for a replay tint that changed without a state changing (a fading trail). */
  refreshTints(): void;
  /** Back to live. */
  end(): void;
  readonly active: boolean;
}

/** One live view (a card or the panel) as an extension sees it. */
export interface ViewHandle {
  /** The view's root element inside its shadow DOM: overlays and styles go here. */
  readonly root: HTMLElement;
  readonly viewer: Viewer;
  readonly config: Readonly<Record<string, unknown>>;
  readonly hass: Hass | null;
  readonly plan: Plan | null;
  /** Called with every new hass (states changed); returns an unsubscribe. */
  onHass(cb: (hass: Hass) => void): () => void;
  /** Called on every touch of the view (pointerdown). */
  onTouch(cb: () => void): () => void;
  /** Back to the view the card or panel opens with. */
  showStart(): void;
  closeSheet(): void;
  toast(text: string): void;
  isEditing(): boolean;
  /** Home Assistant's own card for a config, e.g. a live camera ({ type: "picture-entity", … }). */
  createCard(config: Record<string, unknown>): Promise<(HTMLElement & { hass?: unknown }) | null>;
  moreInfo(entityId: string): void;

  // API 2
  /** Adds a button above the view's own tools. */
  addTool(tool: Tool): ToolHandle;
  /** Colours rooms (an alert still wins); null hands the rooms back. Then call refreshRooms(). */
  setRoomTint(fn: RoomTint | null): void;
  /** Text after a room's temperature under its name; null removes it. Then call refreshRooms(). */
  setRoomText(fn: RoomText | null): void;
  /** Redraws the rooms' tints and labels. */
  refreshRooms(): void;
  readonly energy: EnergyHandle;

  // API 3
  /** The entities whose states the 3D view shows: replay their history to show the house as it was. */
  watchedEntities(): string[];
  /** The floor and room an entity is in, as placed in the plan or by its area; null when it is not in the house. */
  locate(entityId: string): Place | null;
  /** Starts showing the past (ending a replay already showing). Live states wait until it ends. */
  replay(options?: ReplayOptions): ReplaySession;
  readonly replaying: boolean;
  showFloor(index: number): void;
  showHouse(): void;
  /** Picks out a room on its floor (-1: none), flying to it unless fly is false. */
  selectRoom(floor: number, room: number, fly?: boolean): void;

  // API 4
  /** The roofs' slopes (empty without roofs). World metres, the storeys standing together. */
  roofFaces(): RoofFaceInfo[];
  /** Solar panels placed on the roofs. */
  solarArrays(): SolarArrayInfo[];
  /** What can shade the roofs (roofs, chimneys, dormers, walls, tall garden things) as triangles, 9 numbers each. */
  shadeGeometry(): Float32Array;
  /** The plan's north (degrees, the bearing the plan's top faces) and Home Assistant's home location. */
  site(): { north: number; lat: number; lon: number } | null;
  /** Colours over the roofs: `fn` gives a point's colour (linear RGB 0..1) or null; null takes them off. */
  paintRoofs(fn: ((face: RoofFaceInfo, p: [number, number, number]) => [number, number, number] | null) | null, spacing?: number): void;
  /** Shows the roofs whatever the roof button says, or hides them; null hands them back to it. */
  showRoofs(on: boolean | null): void;
  /** Called when the plan changes (the roofs or what is on them may have); returns an unsubscribe. */
  onPlan(cb: (plan: Plan) => void): () => void;
}

export interface ExtensionContext {
  apiVersion: number;
  three: typeof THREE;
  /** Runs for every view, now and later; may return a cleanup for when the view goes away. */
  onView(cb: (view: ViewHandle) => void | (() => void)): void;
  /** A section for the card's visual editor (ha-form schema), shown while the extension is installed. */
  cardSchema(section: Record<string, unknown>, labels?: Record<string, string>): void;
}

export interface ExtensionModule {
  id: string;
  name: string;
  apiVersion: number;
  setup(ctx: ExtensionContext): void | Promise<void>;
}

export interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  url: string;
}

type ViewEntry = { handle: ViewHandle; cleanups: (() => void)[] };

const views = new Set<ViewEntry>();
const viewHooks: ((v: ViewHandle) => void | (() => void))[] = [];
export const cardSchemas: { section: Record<string, unknown>; labels: Record<string, string> }[] = [];
export const loaded = new Map<string, ExtensionInfo>();
let loading: Promise<void> | null = null;

/** The core registers each view; extensions loaded later still get it. */
export function registerView(handle: ViewHandle): () => void {
  const entry: ViewEntry = { handle, cleanups: [] };
  views.add(entry);
  for (const hook of viewHooks) runHook(entry, hook);
  return () => {
    for (const c of entry.cleanups) {
      try {
        c();
      } catch (err) {
        logError(err, "extension");
      }
    }
    views.delete(entry);
  };
}

function runHook(entry: ViewEntry, hook: (v: ViewHandle) => void | (() => void)): void {
  try {
    const cleanup = hook(entry.handle);
    if (typeof cleanup === "function") entry.cleanups.push(cleanup);
  } catch (err) {
    logError(err, "extension");
  }
}

const context: ExtensionContext = {
  apiVersion: EXT_API_VERSION,
  three: THREE,
  onView(cb) {
    viewHooks.push(cb);
    for (const entry of views) runHook(entry, cb);
  },
  cardSchema(section, labels = {}) {
    cardSchemas.push({ section, labels });
  },
};

/** Loads the extensions the integration serves (once per page). */
const failed: { id: string; name: string; newer: boolean }[] = [];
/** Extensions that could not load on this page; `newer`: they need a newer VirtuHome. */
export const extensionFailures = (): readonly { id: string; name: string; newer: boolean }[] => failed;

export function loadExtensions(hass: Hass, extra: string[] = []): Promise<void> {
  loading ??= (async () => {
    let list: ExtensionInfo[] = [];
    try {
      const info = await hass.callWS<{ extensions?: ExtensionInfo[] }>({ type: "virtuhome/info" });
      list = info.extensions ?? [];
    } catch {
      // the dev harness has no integration
    }
    list = list.concat(extra.map((url, i) => ({ id: `dev${i}`, name: url, version: "dev", url })));
    for (const ext of list) {
      try {
        const mod = (await import(/* @vite-ignore */ ext.url)) as { default?: ExtensionModule };
        const m = mod.default;
        if (!m || typeof m.setup !== "function") throw new Error("not a VirtuHome extension");
        if (m.apiVersion > EXT_API_VERSION) throw new Error(`needs a newer VirtuHome (API ${m.apiVersion})`);
        await m.setup(context);
        loaded.set(m.id, { ...ext, id: m.id, name: m.name });
      } catch (err) {
        logError(err, `extension ${ext.id}`);
        failed.push({ id: ext.id, name: ext.name, newer: /newer VirtuHome/.test(String(err)) });
      }
    }
  })();
  return loading;
}
