// Extensions: paid add-ons (VirtuHome Pro) are separate ES modules that the integration downloads
// for a licence, verifies and serves. The core loads them and hands each one this API. They share
// the core's three.js through the context, so they stay small.
//
// An extension module's default export:
//   export default { id: "wall_tablet", name: "Wall Tablet", apiVersion: 1, setup(ctx) { ... } }
//
// API 2 adds tools, room tints and texts, and the house's energy (solar, battery, grid).
import * as THREE from "three";
import type { EnergyNow, EnergySources, EnergyToday } from "../live/energy";
import type { Hass } from "../live/hass";
import type { RoomText, RoomTint } from "../live/live";
import type { Plan } from "../model/plan";
import type { Viewer } from "../scene/viewer";
import type { EnergySection } from "../ui/energy";

export const EXT_API_VERSION = 2;

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

/** The house's solar, battery and grid, as the core reads them. */
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
        console.warn("VirtuHome extension cleanup failed", err);
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
    console.error("VirtuHome extension failed on a view", err);
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
        console.error(`VirtuHome extension ${ext.id} could not load:`, err);
      }
    }
  })();
  return loading;
}
