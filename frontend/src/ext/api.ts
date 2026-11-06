// Extensions: add-ons that a separately installed integration (VirtuHome Pro) brings. It registers an
// ExtensionSource from its own frontend module, `(window.virtuhomeSources ||= []).push(source)`, and
// imports its extensions' modules itself; the core never fetches or imports extension code. The core
// hands each extension this API. They share the core's three.js through the context, so they stay small.
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
// API 5 adds automations (ctx.automations): an extension's own blueprints, signed with it, that Home
// Assistant runs with no screen open. Each is added only after the user agrees in the core's dialog.
// And marks on furniture: a piece's lit part glows (a bin's lid) and a tag shows over it. Since core
// 0.17 also what a washing machine, dryer or dishwasher does (appliance(); check for it).
import * as THREE from "three";
import type { ApplianceNow } from "../live/appliances";
import type { EnergyNow, EnergySources, EnergyToday } from "../live/energy";
import type { Hass, HassEntity } from "../live/hass";
import type { ItemMark, ItemMarks, RoomText, RoomTint } from "../live/live";
import type { Plan } from "../model/plan";
import type { RoofFaceInfo, SolarArrayInfo } from "../scene/roof-info";
import type { Viewer } from "../scene/viewer";
import type { EnergySection } from "../ui/energy";
import { t } from "../i18n";
import type { AutomationPreview } from "../ui/automation-dialog";
import { logError } from "../ui/errors";

export const EXT_API_VERSION = 5;

export type { ItemMark, ItemMarks, RoofFaceInfo, SolarArrayInfo };

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

  // API 5
  /**
   * Marks pieces of furniture, as `fn` says for each (null: no mark): `glow` lights the piece's lit part
   * (a bin's lid, a recycling box's sides, a post box's window, a lamp's shade, a screen) in that
   * colour (linear RGB 0..1); `text` is a short tag over it; a tap on the tag or the piece calls
   * `onTap`. null takes the marks off. Then call refreshItems(). Marks don't show while editing or
   * during a replay.
   */
  markItems(fn: ItemMarks | null): void;
  /** Works the marks out again and redraws them (call it when what they show changes, not every frame). */
  refreshItems(): void;
  /**
   * What a washing machine, dryer or dishwasher of the plan does now, by the piece's id: its run state
   * (idle, waiting, running, paused, done, error), programme or phase, when it ends (ms) and the entity
   * that says so. null when it isn't linked or nothing of its device says. Core 0.17 and later.
   */
  appliance?(item: string): ApplianceNow | null;
  /**
   * What's new in this extension, shown once per person in the sidebar panel to administrators, like
   * the core's after an update: `title` names it and its version ("Household 1.1.0"), `lines` are short
   * sentences (\*\*bold\*\* for the names of buttons). Core 0.17 and later.
   */
  news?(title: string, lines: string[]): void;
}

/** An automation an extension added to Home Assistant from one of its blueprints. */
export interface ExtAutomation {
  /** Home Assistant's id of it: virtuhome-<extension id>-<hex>. */
  id: string;
  alias: string | null;
  /** The blueprint's id, or null once the user took it over in the automation editor. */
  blueprint: string | null;
  entity_id: string | null;
  /** on or off (turned off in Home Assistant), null while it doesn't load. */
  state: string | null;
}

/**
 * The extension's automations in Home Assistant, made from the blueprints in its signed bundle (see
 * docs/ARCHITECTURE.md). They run with no screen open, show in Settings → Automations and go with
 * the extension. Adding, listing and removing need a Home Assistant administrator.
 */
export interface AutomationsHandle {
  /** This extension's automations, as Home Assistant has them now (the user may have deleted some). */
  list(): Promise<ExtAutomation[]>;
  /**
   * Shows the user what would be added (its name, what triggers it and what it does, where its
   * notifications go) and adds it only if they agree; null when they don't. `blueprint` is the id
   * of a blueprint in this extension's bundle, `inputs` its inputs (entity, device and area ids,
   * numbers, times, choices, text without templates). Rejects with the reason when they don't fit.
   */
  add(blueprint: string, inputs: Record<string, unknown>, options?: { name?: string }): Promise<ExtAutomation | null>;
  /** Removes one of this extension's automations. */
  remove(id: string): Promise<void>;
}

export interface ExtensionContext {
  apiVersion: number;
  three: typeof THREE;
  /** Runs for every view, now and later; may return a cleanup for when the view goes away. */
  onView(cb: (view: ViewHandle) => void | (() => void)): void;
  /** A section for the card's visual editor (ha-form schema), shown while the extension is installed. */
  cardSchema(section: Record<string, unknown>, labels?: Record<string, string>): void;
  // API 5
  readonly automations: AutomationsHandle;
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
}

/** An extension a source offers: load() imports its module (the source's code, not the core's). */
export interface SourceExtension extends ExtensionInfo {
  load(): Promise<ExtensionModule | { default?: ExtensionModule }>;
}

/** What a source says in Check my setup, in the user's language. */
export interface SourceCheck {
  /** Problems (the dot on Edit) and notes. */
  found: ["problem" | "note", string][];
  /** Said when nothing was found. */
  ok: string;
  /** Offer Renew now (runs the source's renew()). */
  renew?: boolean;
  /** Offer Open Extras. */
  extras?: boolean;
}

/**
 * A separately installed integration that brings extensions, registered by its own frontend module
 * with `(window.virtuhomeSources ||= []).push(source)`, before or after the core loads.
 */
export interface ExtensionSource {
  id: string;
  name: string;
  /** The extensions to load now. */
  extensions(hass: Hass): Promise<SourceExtension[]>;
  /** WebSocket type prefix for its extensions' automations: `<prefix>/list`, `/preview`, `/add`, `/remove`. */
  automations?: string;
  /**
   * Draws its part of Edit → Extras into `el` (a key, trials, what it has). `el` is in the editor, so
   * its classes style it: ed-card, ed-row, ed-item, ed-btn (small, ghost), ed-in, ed-hint.
   */
  extras?(el: HTMLElement, hass: Hass): void;
  /** Its lines in Check my setup. */
  check?(hass: Hass): Promise<SourceCheck>;
  /** Check my setup's Renew now. */
  renew?(hass: Hass): Promise<void>;
}

type ViewEntry = { handle: ViewHandle; cleanups: (() => void)[] };

const views = new Set<ViewEntry>();
const viewHooks: ((v: ViewHandle) => void | (() => void))[] = [];
export const cardSchemas: { section: Record<string, unknown>; labels: Record<string, string> }[] = [];
export const loaded = new Map<string, ExtensionInfo>();

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

const context: Omit<ExtensionContext, "automations"> = {
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

type Ask = (preview: AutomationPreview, extName: string, hass: Hass) => Promise<boolean>;
const askToAdd: Ask = async (preview, extName, hass) => (await import("../ui/automation-dialog")).askToAdd(preview, extName, hass);

/** One extension's automations, through its source's WebSocket commands (`prefix`); `ask` shows the agreement dialog. */
export function automationsFor(ext: { id: string; name: string }, getHass: () => Hass | null, prefix: string | undefined, ask: Ask = askToAdd): AutomationsHandle {
  const ws = <T>(msg: Record<string, unknown>): Promise<T> => {
    const hass = getHass();
    if (!prefix) return Promise.reject(new Error("automations aren't available to this extension"));
    return hass ? hass.callWS<T>({ ...msg, type: `${prefix}/${msg.type}`, ext_id: ext.id }) : Promise.reject(new Error("no Home Assistant connection"));
  };
  const list = () => ws<ExtAutomation[]>({ type: "list" });
  return {
    list,
    async add(blueprint, inputs, options = {}) {
      const msg = { blueprint, inputs, alias: options.name ?? "", description: t("automations.description", { name: ext.name }) };
      const preview = await ws<AutomationPreview>({ ...msg, type: "preview" });
      if (!(await ask(preview, ext.name, getHass()!))) return null;
      const added = await ws<{ id: string; entity_id: string }>({ ...msg, type: "add" });
      const found = (await list()).find((a) => a.id === added.id);
      return found ?? { id: added.id, alias: preview.alias, blueprint, entity_id: added.entity_id, state: null };
    },
    async remove(id) {
      await ws({ type: "remove", automation_id: id });
    },
  };
}

/** The Home Assistant connection extensions talk through: a live view's, else the one they loaded with. */
let loadedWith: Hass | null = null;
const currentHass = (): Hass | null => [...views].find((v) => v.handle.hass)?.handle.hass ?? loadedWith;

/** Extensions that could not load on this page; `newer`: they need a newer VirtuHome. */
const failed: { id: string; name: string; newer: boolean }[] = [];
export const extensionFailures = (): readonly { id: string; name: string; newer: boolean }[] => failed;

/** The sources registered on this page, in order. */
const sources: ExtensionSource[] = [];
const sourceListeners = new Set<() => void>();
const started = new Set<string>();
const loads = new Map<string, Promise<void>>();
export const extensionSources = (): readonly ExtensionSource[] => sources;
/** Called when a source registers (the Extras tab draws it) and once its extensions loaded; returns an unsubscribe. */
export function onSources(cb: () => void): () => void {
  sourceListeners.add(cb);
  return () => sourceListeners.delete(cb);
}
const sourcesChanged = () => [...sourceListeners].forEach((cb) => cb());

function addSource(source: ExtensionSource): void {
  if (!source || typeof source.extensions !== "function" || sources.some((s) => s.id === source.id)) return;
  sources.push(source);
  // registered after the views started: its extensions load now
  if (loadedWith) void loadSource(source, loadedWith).then(sourcesChanged);
  sourcesChanged();
}

// sources queued before the core loaded, and a push that registers from now on
type Queue = ExtensionSource[] | { push(...s: ExtensionSource[]): number; apiVersion: number };
if (typeof window !== "undefined") {
  const w = window as unknown as { virtuhomeSources?: Queue };
  const queued = Array.isArray(w.virtuhomeSources) ? w.virtuhomeSources : [];
  w.virtuhomeSources = {
    apiVersion: EXT_API_VERSION,
    push(...s) {
      s.forEach(addSource);
      return sources.length;
    },
  };
  queued.forEach(addSource);
}

function loadSource(source: ExtensionSource, hass: Hass): Promise<void> {
  if (started.has(source.id)) return loads.get(source.id)!;
  started.add(source.id);
  const run = (async () => {
    let list: SourceExtension[] = [];
    try {
      list = await source.extensions(hass);
    } catch (err) {
      logError(err, `extensions of ${source.name}`);
      return;
    }
    for (const ext of list) {
      try {
        const mod = await ext.load();
        const m = ("setup" in mod ? mod : mod.default) as ExtensionModule | undefined;
        if (!m || typeof m.setup !== "function") throw new Error("not a VirtuHome extension");
        if (m.apiVersion > EXT_API_VERSION) throw new Error(`needs a newer VirtuHome (API ${m.apiVersion})`);
        await m.setup({ ...context, automations: automationsFor({ id: m.id, name: m.name }, currentHass, source.automations) });
        loaded.set(m.id, { id: m.id, name: m.name, version: ext.version });
      } catch (err) {
        logError(err, `extension ${ext.id}`);
        failed.push({ id: ext.id, name: ext.name, newer: /newer VirtuHome/.test(String(err)) });
      }
    }
  })();
  loads.set(source.id, run);
  return run;
}

/** Loads the extensions of every source, now and as more register (once per page). */
export function loadExtensions(hass: Hass): Promise<void> {
  loadedWith = hass;
  return Promise.all(sources.map((s) => loadSource(s, hass))).then(() => undefined);
}
