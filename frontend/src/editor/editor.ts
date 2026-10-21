// The editor: a drawer next to the 3D view (loaded only when an admin taps Edit).
//   Home     import a scan or plan, place devices automatically, floors, plan files, restore points
//   Rooms    names, Home Assistant areas, floor materials
//   Devices  what is placed, and what of Home Assistant is not yet
//   Selected the tapped room, device or furniture: link entities, move, turn, remove
// In edit mode a tap selects instead of switching, and devices, lamps and furniture can be dragged.
import { mdiAlertCircleOutline, mdiArrowULeftTop, mdiArrowURightTop, mdiCheckboxBlankCircleOutline, mdiCheckCircle, mdiCheckCircleOutline, mdiClose, mdiInformationOutline, mdiContentSave, mdiDelete, mdiFlipHorizontal, mdiMagnify, mdiPlus, mdiRotateLeft, mdiRotateRight } from "@mdi/js";
import { autoPlace, linkRoomsByName } from "../auto/placement";
import { importRoomPlan, isRoomPlan, type Detections, type Manifest } from "../import/roomplan";
import { importSimple, isSimplePlan } from "../import/simple";
import { isZip } from "../import/zip";
import type { ImportSummary } from "../import/draft";
import { labelPoint } from "../model/geom";
import {
  newId, normalizePlan, PANEL, panelOf, panelSize, solarSize, spaces, splitEdge, type Device, type EnergySettings, type PresenceSettings, type Fence, type FencePost, type FenceStyle, type Floor, type FloorMaterial,
  type Furniture, type Opening, type OutdoorArea, type OutdoorKind, type PartyEnds, type Plan, type Roof, type RoofCovering, type RoofItem, type RoofShape, type Room, type Vec2,
} from "../model/plan";
import { bounds } from "../model/geom";
import { canFollow, entityRegistry, followRenames, missingLinks, proposeFor, recordLinks, replaceEntity, type Proposal, type RegistryEntry } from "../model/links";
import { domainOf, type Hass } from "../live/hass";
import { roomTrackers, sourcesOf } from "../live/presence";
import { BALUSTRADE_DEFAULT, BALUSTRADE_MATERIALS, BALUSTRADES, CAR_TYPES, carModel, CATEGORIES, EV_TYPES, FURNITURE, furnitureName, isUpholstered, styleOptions, type BalustradeMaterial, type BalustradeStyle, type Category } from "../scene/furniture-lib";
import { EXTERIOR_FINISHES, FLOOR_FINISHES, FURNITURE_SWATCHES, JOINERY_FINISHES, JOINERY_SWATCHES, PAINT_SWATCHES, ROOF_COVERINGS, ROOF_SWATCHES, TRIM_SWATCHES, UPHOLSTERY, WALL_FINISHES, type FinishDef, type Swatch } from "../scene/finishes";
import {
  faceBearing, fitPanels, floorRoofs, fromRoofFrame, itemFrame, planeHeight, polyArea, ROOF_ITEM_DEFAULTS, ROOF_SHAPE_ORDER, ROOF_SHAPES, sunniestFace,
  type RoofFace, type RoofModel,
} from "../scene/roofs";
import { suggestRoofs, type HouseKind, type RoofChoice } from "../auto/roof";
import { controlsFor, defaultFinish, styleOf, stylesFor } from "../scene/joinery";
import { pointInPolygon, segmentDistance } from "../model/geom";
import { layoutWalls, openingPoint } from "../model/walls";
import { cameraRig } from "../scene/cameras";
import { FENCE_ORDER, FENCE_STYLES, FENCE_SWATCHES, fenceLength, fenceStyle } from "../scene/fences";
import { CANOPY_NAMES, DOOR_NAMES, GARDEN_OPTIONS, gardenChoice, PLANTER_MATERIALS, PLANTING_NAMES, ROOFING_NAMES, type PlanterMaterial, type Planting } from "../scene/garden";
import { isRaised, outdoorTop } from "../scene/build";
import { circlePoints, edgeOf, newArea, openEdges, rectSides, resizeRect, roundness, turnOf, type NewAreaKind } from "../scene/areas";
import {
  areaPaving, BORDER_MATERIALS, DECK_BOARDS, DECK_ORDER, deckLook, isPaved, JOINT_SWATCHES, PATTERN_NAMES, PAVING, PAVING_ORDER, RAISED_WALLS,
  type PavingMaterial, type RaisedWall,
} from "../scene/paving";
import { iconIndex, type MarkerSpec } from "../scene/markers";
import type { DragPhase, Hit } from "../scene/viewer";
import type { VhView } from "../ui/view";
import type { Check, Fix } from "../ui/checks";
import { cardOnDashboard, setupComplete, setupItems, showChecklist, type SetupId, type SetupItem, type StartKind } from "../ui/setup";
import { guideLink } from "../ui/guide";
import type { PlainKey } from "../i18n";
import { t, th, type EditorPlainKey } from "../i18n/editor";
import { EDITOR_CSS } from "./styles";
import { HouseTypes } from "./house-types";
import { Collider, settle } from "./collide";
import { imageUrl, uploadImage } from "./background";
import { Plan2D, PLAN2D_CSS } from "./plan2d";
import { fetchBuildings, northFits, pickBuilding, type Footprint, type NorthFit } from "./north";
import { compassName } from "../live/sun";
import { location as homeLocation } from "../live/sky";

type Tab = "home" | "rooms" | "devices" | "selected" | "extensions";
type Selection = { floor: number; kind: "room" | "outdoor" | "device" | "furniture" | "opening" | "fence" | "roof" | "roofitem"; id: string } | null;
const OUTDOOR_KINDS: OutdoorKind[] = ["lawn", "patio", "deck", "path", "driveway", "bed", "gravel"];
/** Common solar panel sizes (mm), long side first, newest first. */
const PANEL_SIZES: [number, number, EditorPlainKey][] = [
  [1722, 1134, "editor.panelSize.1722"],
  [1762, 1134, "editor.panelSize.1762"],
  [1755, 1038, "editor.panelSize.1755"],
  [1650, 992, "editor.panelSize.1650"],
];
const KIND_NAMES: Record<OutdoorKind, EditorPlainKey> = {
  lawn: "editor.kind.lawn", patio: "editor.kind.patio", deck: "editor.kind.deck", path: "editor.kind.path", driveway: "editor.kind.driveway", bed: "editor.kind.bed", gravel: "editor.kind.gravel",
};

const hexOf = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
const svg = (p: string) => `<svg viewBox="0 0 24 24"><path d="${p}"/></svg>`;

/** House Scan's detections.json (decor found while scanning). */
function isDetections(data: unknown): data is Detections {
  const d = data as Detections;
  return typeof d?.version === "number" && Array.isArray(d.objects) && d.objects.every((o) => typeof o?.label === "string" && Array.isArray(o.position));
}

/** What an import brought in and left out, for its report. */
function importLines(s: ImportSummary): string[] {
  const names = (list: string[]) => {
    const counts = new Map<string, number>();
    for (const x of list) counts.set(x, (counts.get(x) ?? 0) + 1);
    const all = [...counts].map(([x, k]) => (k > 1 ? `${x} ×${k}` : x));
    return all.length > 8 ? t("editor.import.namesMore", { list: all.slice(0, 8).join("; "), n: all.length - 8 }) : all.join("; ");
  };
  return [
    t("editor.import.in", {
      floors: t("editor.import.floors", { n: s.floors }), rooms: t("editor.import.rooms", { n: s.rooms }), doors: t("editor.import.doors", { n: s.doors }),
      windows: t("editor.import.windows", { n: s.windows }), furniture: t("editor.import.furniture", { n: s.furniture }),
    }),
    ...(s.boxes.length ? [t("editor.import.boxes", { names: names(s.boxes) })] : []),
    ...(s.left.length ? [t("editor.import.leftOut", { names: names(s.left) })] : []),
    s.north !== null
      ? t("editor.import.northFromFile", { north: Math.round(s.north), compass: compassName(s.north) })
      : t("editor.import.setNorth"),
  ];
}

/** Tiny DOM helper: h("div", { class: "x", onclick }, child, "text") */
function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, unknown> = {}, ...children: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
    else if (k === "class") el.className = String(v);
    else if (k === "html") el.innerHTML = String(v);
    else if (k in el && k !== "list") (el as unknown as Record<string, unknown>)[k] = v;
    else el.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export interface EditorHost {
  view: VhView;
  hass: Hass;
  plan: Plan;
  revision: number | null;
  /** The plan as saved, when `plan` differs from it (entities renamed in Home Assistant were followed). */
  savedJson?: string;
  /** Those renamed entities: [from, to]. */
  followed?: [string, string][];
  save(plan: Plan, baseRevision: number | null): Promise<number>;
  restorePoints?(): Promise<{ id: string; time: number; label: string | null; floors: number }[]>;
  restore?(id: string): Promise<void>;
  close(): void;
  /** The online demo: everything can be edited, nothing can be saved. */
  demo?: boolean;
}

/** A step of the undo history: the plan before a change, and what the change was. */
interface Step {
  plan: Plan;
  label: string;
}

export class Editor {
  readonly el: HTMLDivElement;
  private plan: Plan;
  private undo: Step[] = [];
  private redo: Step[] = [];
  private undoBtn: HTMLButtonElement;
  private redoBtn: HTMLButtonElement;
  /** The add-item picker's category and search text (kept across re-renders). */
  private pickCat: Category | "all" = "all";
  private pickCatGarden: Category | "all" = "outdoor";
  private pickQuery = "";
  /** The 2D plan (bird's-eye, with measurements), when it is shown instead of 3D. */
  private plan2d: Plan2D | null = null;
  private modeBtns: HTMLButtonElement[] = [];
  private unsaved = false;
  /** The plan as last saved: Save is on only while the plan differs from it (an undo back to it turns Save off). */
  private savedJson: string;
  private saving = false;
  private saveBtn: HTMLButtonElement;
  private tab: Tab = "home";
  private sel: Selection = null;
  private body: HTMLDivElement;
  private status: HTMLSpanElement;
  private dragStart: Plan | null = null;
  /** The last "Line up with the map": the building found and the ways the plan fits it. */
  private mapFit: { building: Footprint; fits: NorthFit[] } | { error: string } | { busy: true } | null = null;
  /** Corners that move together with the dragged one (shared by neighbouring rooms). */
  private dragCorners: { outdoor: boolean; id: string; i: number }[] = [];
  /** A + being pressed: the edge its corner goes on, made once the + moves. */
  private dragEdge: { outdoor: boolean; id: string; k: number; len: number } | null = null;
  private dragRaf = 0;
  private pendingDrag: (() => void) | null = null;
  /** Where the dragged piece stood when the drag began, and what it must keep out of. */
  private dragFrom: Vec2 | null = null;
  private collider: Collider | null = null;
  /** The Home tab's choices for working out a roof. */
  private roofChoice: RoofChoice = {};
  /** Home Assistant's entity registry, for what replaced missing entities (per registry change). */
  private registry: { key: unknown; list: RegistryEntry[] | null } | null = null;
  private registryLoading: unknown = null;
  /** Whether a dashboard shows the card (getting started), once asked. */
  private cardSeen: boolean | null = null;
  private cardAsked = false;
  /** The house type picker, while it is open. */
  private houseTypes: HouseTypes | null = null;
  /** A house type is going in: not a first room drawn by hand. */
  private starting = false;

  constructor(private host: EditorHost) {
    this.plan = structuredClone(host.plan);
    this.savedJson = host.savedJson ?? JSON.stringify(this.plan);
    this.unsaved = JSON.stringify(this.plan) !== this.savedJson;
    const style = h("style", {}, EDITOR_CSS + PLAN2D_CSS);
    this.status = h("span", { class: "ed-status" });
    this.body = h("div", { class: "ed-body" });
    this.undoBtn = h("button", { class: "ed-hb", html: `${svg(mdiArrowULeftTop)}<span>${th("editor.main.undo")}</span>`, onclick: () => this.doUndo() });
    this.redoBtn = h("button", { class: "ed-hb", html: `${svg(mdiArrowURightTop)}<span>${th("editor.main.redo")}</span>`, onclick: () => this.doRedo() });
    this.saveBtn = h("button", { class: "ed-save", html: `${svg(mdiContentSave)}<span>${th("editor.main.save")}</span>`, disabled: true, title: host.demo ? t("view.demoCantSave") : t("editor.nothingToSave"), onclick: () => this.save() });
    this.el = h("div", { class: "ed" },
      style,
      h("div", { class: "ed-head" },
        h("b", {}, t("editor.main.editHome")),
        this.undoBtn,
        this.redoBtn,
        this.saveBtn,
        h("button", { class: "ed-ib", title: t("editor.close"), html: svg(mdiClose), onclick: () => this.close() }),
      ),
      h("div", { class: "ed-modes" },
        ...this.modeButtons(),
      ),
      h("div", { class: "ed-tabs" },
        ...(["home", "rooms", "devices", "selected", "extensions"] as Tab[]).map((tab) =>
          h("button", { class: "ed-tab", "data-tab": tab, onclick: () => this.show(tab) }, { home: t("editor.main.home"), rooms: t("editor.rooms"), devices: t("editor.devices"), selected: t("editor.main.selected"), extensions: t("editor.main.extras") }[tab]),
        ),
      ),
      this.body,
      h("div", { class: "ed-foot" }, this.status),
    );
    const viewer = host.view.viewer;
    viewer.editMode = true;
    viewer.onDrag = (hit, x, z, phase) => this.onDrag(hit, x, z, phase);
    viewer.canDrag = (hit) => this.isHandle(hit);
    window.addEventListener("keydown", this.onKey);
    this.render();
    this.updateHistoryButtons();
    this.updateSaveButton();
  }

  /** A first-run choice: trace a picture or draw in the 2D plan, or the house types or scan import on the Home tab. */
  startSetup(kind: StartKind): void {
    if (kind === "starter") {
      this.openHouseTypes();
      return;
    }
    if (kind === "scan") {
      this.show("home");
      const scan = this.body.querySelector<HTMLElement>(".ed-scan");
      if (scan) {
        this.scrollDrawerTo(scan);
        scan.classList.add("ed-flash");
      }
      this.status.textContent = t("editor.main.tapImportAScan");
      return;
    }
    this.setPlanMode(true);
    this.plan2d?.startTool(kind === "trace" ? "image" : "rect");
  }

  private modeButtons(): HTMLButtonElement[] {
    this.modeBtns = [
      h("button", { class: "ed-mode on", onclick: () => this.setPlanMode(false) }, t("editor.main.view3d")),
      h("button", { class: "ed-mode", onclick: () => this.setPlanMode(true) }, t("editor.main.plan2d")),
    ];
    return this.modeBtns;
  }

  /** Shows the 2D plan with measurements over the 3D view, or goes back to 3D. */
  private setPlanMode(on: boolean): void {
    this.modeBtns.forEach((b, i) => b.classList.toggle("on", (i === 1) === on));
    const root = this.host.view.root;
    root.classList.toggle("plan2d", on);
    if (on && !this.plan2d) {
      const viewer = this.host.view.viewer;
      this.plan2d = new Plan2D({
        plan: () => this.plan,
        selection: () => this.sel,
        select: (sel) => this.select(sel),
        change: (fn, label) => this.change(fn, false, label),
        dragStart: () => {
          this.dragStart = structuredClone(this.plan);
        },
        // the 3D view is hidden behind the plan: it catches up once, when the drag ends
        dragMove: () => {},
        dragEnd: (label) => {
          const before = this.dragStart;
          this.dragStart = null;
          if (!before || !label || JSON.stringify(before) === JSON.stringify(this.plan)) return;
          this.undo.push({ plan: before, label });
          this.redo = [];
          this.changed();
          this.apply();
        },
        floor: () => (viewer.mode === "floor" ? viewer.activeFloor : 0),
        setFloor: (i) => this.host.view.showFloor(i),
        status: (text) => (this.status.textContent = text),
        images: {
          upload: (floorId, image, progress) => uploadImage(this.hass, floorId, image, progress),
          url: (file) => imageUrl(this.hass, file),
        },
      });
      root.append(this.plan2d.el);
      this.status.textContent = t("editor.main.selectSomethingThenDrag");
    } else if (!on && this.plan2d) {
      this.plan2d.dispose();
      this.plan2d = null;
    }
  }

  /**
   * Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z or Ctrl+Y redoes; Backspace or Delete removes the selected
   * piece, device, door or window (not while typing in a field; the 2D plan has its own keys).
   */
  private onKey = (e: KeyboardEvent): void => {
    // the demo home covers the editor: keys are not for this plan then
    if (this.host.view.demoShown) return;
    const target = e.composedPath()[0] as HTMLElement | undefined;
    if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
    if ((e.key === "Backspace" || e.key === "Delete") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (!this.plan2d && this.removeSelected()) e.preventDefault();
      return;
    }
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "z" && !e.shiftKey) this.doUndo();
    else if ((k === "z" && e.shiftKey) || k === "y") this.doRedo();
    else return;
    e.preventDefault();
  };

  /** Removes the selected piece, device, door or window (rooms are removed from the drawer, with a confirmation). */
  private removeSelected(): boolean {
    const sel = this.sel;
    if (!sel || (sel.kind !== "furniture" && sel.kind !== "device" && sel.kind !== "opening" && sel.kind !== "fence" && sel.kind !== "roof" && sel.kind !== "roofitem")) return false;
    const f = this.plan.floors[sel.floor];
    const name = sel.kind === "furniture" ? furnitureName(f?.furniture.find((x) => x.id === sel.id)?.type ?? "") ?? "furniture"
      : sel.kind === "device" ? t("editor.aDevice") : sel.kind === "fence" ? t("editor.main.aFence") : sel.kind === "roof" ? t("editor.main.aRoof")
      : sel.kind === "roofitem" ? this.roofItemName(this.roofItemOf(this.plan, sel.id)?.item ?? ({ kind: "window" } as RoofItem)).toLowerCase() : t("editor.main.anOpening");
    this.change((p) => {
      const fl = p.floors[sel.floor];
      if (!fl) return;
      if (sel.kind === "furniture") fl.furniture = fl.furniture.filter((x) => x.id !== sel.id);
      else if (sel.kind === "device") fl.devices = fl.devices.filter((x) => x.id !== sel.id);
      else if (sel.kind === "fence") fl.fences = (fl.fences ?? []).filter((x) => x.id !== sel.id);
      else if (sel.kind === "roof") fl.roofs = (fl.roofs ?? []).filter((x) => x.id !== sel.id);
      else if (sel.kind === "roofitem") for (const r of fl.roofs ?? []) r.items = (r.items ?? []).filter((x) => x.id !== sel.id);
      else fl.openings = fl.openings.filter((x) => x.id !== sel.id);
    }, false, t("editor.removeName", { name }));
    this.select(null);
    return true;
  }

  // ------------------------------------------------------------------ plan changes

  private get hass(): Hass {
    return this.host.view.hass ?? this.host.hass;
  }

  /** Applies a change with undo; `quiet` skips re-rendering the drawer (while dragging). */
  private change(fn: (p: Plan) => void, quiet = false, label = t("editor.main.change")): void {
    const before = structuredClone(this.plan);
    this.undo.push({ plan: before, label });
    if (this.undo.length > 100) this.undo.shift();
    this.redo = [];
    fn(this.plan);
    this.changed();
    this.apply(quiet);
    if (!quiet && before.floors.every((f) => f.rooms.length === 0) && this.plan.floors.some((f) => f.rooms.length > 0)) this.firstRoom();
  }

  /** The first room of a new home: the getting-started list shows what comes next. */
  private firstRoom(): void {
    if (this.starting) return;
    const items = setupItems(this.plan, this.hass, { cardOnDashboard: this.cardSeen });
    if (!showChecklist(this.plan, items)) return;
    // after the 2D plan has said its own piece about the tool
    queueMicrotask(() => (this.status.textContent = t("editor.main.yourFirstRoomOnce")));
  }

  private apply(quiet = false): void {
    this.host.view.previewPlan(this.plan);
    this.updateSelectionMarker();
    this.plan2d?.render();
    if (!quiet) this.render();
    this.status.textContent = this.savedText();
    this.updateHistoryButtons();
  }

  private updateHistoryButtons(): void {
    const u = this.undo[this.undo.length - 1];
    const r = this.redo[this.redo.length - 1];
    this.undoBtn.disabled = !u;
    this.redoBtn.disabled = !r;
    this.undoBtn.title = u ? t("editor.history.undoLabelCtrlZ", { label: u.label }) : t("editor.history.nothingToUndo");
    this.redoBtn.title = r ? t("editor.history.redoLabelCtrlShift", { label: r.label }) : t("editor.history.nothingToRedo");
  }

  private doUndo(): void {
    const prev = this.undo.pop();
    if (!prev) return;
    this.redo.push({ plan: this.plan, label: prev.label });
    this.plan = prev.plan;
    this.changed();
    this.dropMissingSelection();
    this.apply();
    this.status.textContent = t("editor.history.undoneLabel", { label: prev.label });
  }

  private doRedo(): void {
    const next = this.redo.pop();
    if (!next) return;
    this.undo.push({ plan: this.plan, label: next.label });
    this.plan = next.plan;
    this.changed();
    this.dropMissingSelection();
    this.apply();
    this.status.textContent = t("editor.history.redoneLabel", { label: next.label });
  }

  /** After undo the selected thing may no longer exist. */
  private dropMissingSelection(): void {
    const s = this.sel;
    if (!s) return;
    const f = this.plan.floors[s.floor];
    const exists = !!f && (
      s.kind === "room" ? f.rooms.some((r) => r.id === s.id) :
      s.kind === "outdoor" ? (f.outdoor ?? []).some((o) => o.id === s.id) :
      s.kind === "fence" ? (f.fences ?? []).some((x) => x.id === s.id) :
      s.kind === "roof" ? (f.roofs ?? []).some((x) => x.id === s.id) :
      s.kind === "roofitem" ? (f.roofs ?? []).some((r) => (r.items ?? []).some((x) => x.id === s.id)) :
      s.kind === "device" ? f.devices.some((d) => d.id === s.id) :
      s.kind === "opening" ? f.openings.some((o) => o.id === s.id) : f.furniture.some((x) => x.id === s.id));
    if (!exists) this.sel = null;
  }

  /** Unsaved changes: Save can only be clicked while there are some. */
  private get dirty(): boolean {
    return this.unsaved;
  }

  /** After a change of the plan: whether it now differs from what was last saved. */
  private changed(): void {
    this.unsaved = JSON.stringify(this.plan) !== this.savedJson;
    this.updateSaveButton();
  }

  private updateSaveButton(): void {
    if (!this.saveBtn) return;
    this.saveBtn.disabled = !this.unsaved || this.saving || !!this.host.demo;
    this.saveBtn.title = this.host.demo ? t("view.demoCantSave") : this.saving ? t("editor.saving") : this.unsaved ? t("editor.save.saveChanges") : t("editor.nothingToSave");
  }

  /** The footer's word on saving. */
  private savedText(): string {
    if (this.host.demo) return t("editor.save.thisIsADemo");
    return this.dirty ? t("editor.save.unsavedChanges") : t("editor.save.saved");
  }

  private async save(): Promise<void> {
    if (!this.unsaved || this.saving || this.host.demo) return;
    this.saving = true;
    this.updateSaveButton();
    this.status.textContent = t("editor.saving");
    // each linked entity's registry id goes with the plan, so a later rename is followed
    recordLinks(this.plan, this.hass, await entityRegistry(this.hass));
    const json = JSON.stringify(this.plan);
    const saved = () => {
      // edits made while saving still need a save
      this.savedJson = json;
      this.host.followed = [];
      this.changed();
      this.status.textContent = this.savedText();
    };
    try {
      // our own save is the base for the next one, so only someone else's save is a conflict
      this.host.revision = await this.host.save(this.plan, this.host.revision);
      saved();
    } catch (err) {
      const msg = String((err as { message?: string })?.message ?? err);
      if (/changed meanwhile|conflict/i.test(msg)) {
        this.confirm(t("editor.save.someoneElseSavedThe"), t("editor.save.saveMine"), async () => {
          this.host.revision = await this.host.save(this.plan, null);
          saved();
        });
      } else this.status.textContent = t("editor.save.notSavedMsg", { msg });
    } finally {
      this.saving = false;
      this.updateSaveButton();
    }
  }

  close(): void {
    if (this.dirty) {
      this.confirm(t("editor.main.closeWithoutSavingYour"), t("editor.main.discard"), () => this.finish());
      return;
    }
    this.finish();
  }

  private finish(): void {
    const viewer = this.host.view.viewer;
    viewer.editMode = false;
    viewer.onDrag = null;
    viewer.canDrag = null;
    viewer.overlayMarkers = [];
    viewer.refreshMarkers();
    viewer.raiseOpening(0, null);
    viewer.editRoof(false);
    cancelAnimationFrame(this.dragRaf);
    window.removeEventListener("keydown", this.onKey);
    this.plan2d?.dispose();
    this.plan2d = null;
    this.host.view.root.classList.remove("plan2d");
    this.el.remove();
    this.host.close();
  }

  /** The view tells the editor about taps in edit mode. */
  onHit(hit: Hit): void {
    if (hit.item?.kind === "corner" || hit.item?.kind === "fencepoint" || hit.item?.kind === "roofcorner") return;
    if (hit.item?.kind === "fenceedge") {
      // a tap on a fence's +: a corner in the middle of that stretch
      const sel = this.sel;
      const ref = hit.item.id, at = ref.lastIndexOf(":");
      if (sel) this.change((p) => {
        const fence = p.floors[sel.floor]?.fences?.find((x) => x.id === ref.slice(0, at));
        const i = Number(ref.slice(at + 1));
        const a = fence?.points[i], b = fence?.points[i + 1];
        if (fence && a && b) fence.points.splice(i + 1, 0, [Math.round(((a[0] + b[0]) / 2) * 100) / 100, Math.round(((a[1] + b[1]) / 2) * 100) / 100]);
      }, false, t("editor.addAFenceCorner"));
      return;
    }
    if (hit.item?.kind === "edge") {
      // a tap on a +: a corner in the middle of that edge (dragging the + puts it anywhere)
      const sel = this.sel;
      const e = sel && this.edgeOf(hit.item.id, sel.floor);
      if (sel && e) this.change((p) => splitEdge(p.floors[sel.floor], e.id, e.outdoor, e.k, e.len / 2), false, t("editor.addACorner"));
      return;
    }
    if (hit.item) this.select({ floor: hit.floor, kind: hit.item.kind, id: hit.item.id });
    else if (hit.kind === "room" && hit.room >= 0) {
      const s = spaces(this.plan.floors[hit.floor])[hit.room];
      if (s) this.select({ floor: hit.floor, kind: s.outdoor ? "outdoor" : "room", id: s.id });
    } else this.select(null);
  }

  private select(sel: Selection): void {
    this.sel = sel;
    // a roof, or something on one, is shown: the roofs come on, over the whole house
    const onRoof = sel?.kind === "roof" || sel?.kind === "roofitem";
    const viewer = this.host.view.viewer;
    viewer.editRoof(onRoof);
    if (onRoof && viewer.mode === "floor" && viewer.activeFloor <= sel!.floor) viewer.setMode("house");
    this.updateSelectionMarker();
    this.plan2d?.render();
    if (sel) this.show("selected");
    else this.render();
  }

  private updateSelectionMarker(): void {
    const viewer = this.host.view.viewer;
    viewer.overlayMarkers = [];
    const s = this.sel;
    if (s && (s.kind === "room" || s.kind === "outdoor")) {
      const f = this.plan.floors[s.floor];
      const space = s.kind === "room" ? f?.rooms.find((r) => r.id === s.id) : f?.outdoor?.find((o) => o.id === s.id);
      if (space) {
        const y = f.elevation + (s.kind === "outdoor" ? outdoorTop(f, f.outdoor!.indexOf(space as OutdoorArea)) : 0) + 0.06;
        const corners: MarkerSpec[] = space.points.map((p, i) => ({
          key: `__corner${i}`, pos: [p[0], y, p[1]], icon: iconIndex("dot"), color: 0x2f7cf6,
          size: 20, pulse: 0, alpha: 0.95, item: { kind: "corner", id: `${space.id}:${i}` },
        }));
        // a + in the middle of each edge: drag it out to where a new corner goes, or tap it
        const plus: MarkerSpec[] = space.points.flatMap((p, i) => {
          const q = space.points[(i + 1) % space.points.length];
          if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.4) return [];
          return [{
            key: `__edge${i}`, pos: [(p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2], icon: iconIndex("plus"), color: 0x2f7cf6,
            size: 15, pulse: 0, alpha: 0.8, item: { kind: "edge", id: `${space.id}:${i}` },
          }];
        });
        viewer.overlayMarkers = [...corners, ...plus];
      }
    }
    if (s && s.kind === "fence") {
      const f = this.plan.floors[s.floor];
      const fence = f?.fences?.find((x) => x.id === s.id);
      if (fence) {
        const y = f.elevation + 0.08;
        const pts: MarkerSpec[] = fence.points.map((p, i) => ({
          key: `__fp${i}`, pos: [p[0], y, p[1]], icon: iconIndex("dot"), color: 0x2f7cf6, size: 20, pulse: 0, alpha: 0.95, item: { kind: "fencepoint", id: `${fence.id}:${i}` },
        }));
        const plus: MarkerSpec[] = fence.points.slice(1).flatMap((q, i) => {
          const p = fence.points[i];
          if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.4) return [];
          return [{ key: `__fe${i}`, pos: [(p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2], icon: iconIndex("plus"), color: 0x2f7cf6, size: 15, pulse: 0, alpha: 0.8, item: { kind: "fenceedge", id: `${fence.id}:${i}` } }];
        });
        viewer.overlayMarkers = [...pts, ...plus];
      }
    }
    if (s && (s.kind === "device" || s.kind === "furniture")) {
      const f = this.plan.floors[s.floor];
      const thing = s.kind === "device" ? f?.devices.find((d) => d.id === s.id) : f?.furniture.find((x) => x.id === s.id);
      if (thing) {
        const y = (f.elevation ?? 0) + 0.05;
        // a handle: grabbing it drags the selected piece, whatever stands in front of it
        viewer.overlayMarkers = [{ key: "__sel", pos: [thing.x, y, thing.z], icon: iconIndex("dot"), color: 0x2f7cf6, size: 18, pulse: 0.6, alpha: 0.9, item: { kind: s.kind, id: s.id } }];
      }
    }
    if (s && s.kind === "opening") {
      const f = this.plan.floors[s.floor];
      const o = f?.openings.find((x) => x.id === s.id);
      const at = o ? openingPoint(f, o) : null;
      if (o && at) {
        const y = f.elevation + (o.kind === "window" ? o.sill + o.height / 2 : 0.05);
        viewer.overlayMarkers = [{ key: "__sel", pos: [at[0], y, at[1]], icon: iconIndex("dot"), color: 0x2f7cf6, size: 18, pulse: 0.6, alpha: 0.9, item: { kind: "opening", id: o.id } }];
      }
    }
    if (s && s.kind === "roof") {
      const found = this.roofOf(this.plan, s.id);
      if (found) {
        const f = this.plan.floors[found.fi];
        const y = f.elevation + (found.roof.eaves ?? f.height) + 0.05;
        viewer.overlayMarkers = this.roofCorners(found.roof).map((p, i) => ({
          key: `__rc${i}`, pos: [p[0], y, p[1]], icon: iconIndex("dot"), color: 0x2f7cf6, size: 20, pulse: 0, alpha: 0.95, item: { kind: "roofcorner", id: `${found.roof.id}:${i}` },
        }));
      }
    }
    if (s && s.kind === "roofitem") {
      const found = this.roofItemOf(this.plan, s.id);
      const m = found && this.roofModelOf(found.fi, found.roof.id);
      const fr = m && found ? itemFrame(m, found.item) : null;
      if (found && fr) {
        // its handle floats over its middle; dragging it follows the slope
        const lift = found.item.kind === "chimney" ? (found.item.h ?? 1) + 0.3 : 0.35;
        const pos: [number, number, number] = [fr.c[0] + fr.n[0] * lift, fr.c[1] + fr.n[1] * lift, fr.c[2] + fr.n[2] * lift];
        viewer.overlayMarkers = [{
          key: "__sel", pos, icon: iconIndex("dot"), color: 0x2f7cf6, size: 18, pulse: 0.6, alpha: 0.9, item: { kind: "roofitem", id: s.id },
          plane: found.item.kind === "chimney" ? undefined : { normal: fr.n, point: pos },
        }];
      }
    }
    // a selected door or window is shown whole: its wall slides up out of the cutaway
    viewer.raiseOpening(s?.floor ?? 0, s?.kind === "opening" ? s.id : null);
    viewer.refreshMarkers();
  }

  // ------------------------------------------------------------------ dragging

  /**
   * Only the selection moves: its corners and +s, its dot, the piece itself. Pressing on anything else
   * turns the view, and a tap selects it, so turning the view never shifts a piece by mistake.
   */
  private isHandle(hit: Hit): boolean {
    const item = hit.item, sel = this.sel;
    return !!item && !!sel && (item.kind === "corner" || item.kind === "edge" || item.kind === "fencepoint" || item.kind === "fenceedge" || item.kind === "roofcorner"
      || (item.kind === sel.kind && item.id === sel.id));
  }

  private onDrag(hit: Hit, x: number, z: number, phase: DragPhase): void {
    const item = hit.item;
    if (!item) return;
    // handles (corners, +s, the selected piece's dot) belong to the selection, whichever floor is in view
    const handle = this.isHandle(hit);
    const fi = handle && this.sel ? this.sel.floor : hit.floor;
    const f = this.plan.floors[fi];
    if (!f) return;
    const view = this.host.view;
    if (item.kind === "fence" || item.kind === "fencepoint" || item.kind === "fenceedge") {
      this.dragFence(item.kind, item.id, f, x, z, phase);
      return;
    }
    if (item.kind === "roof" || item.kind === "roofitem" || item.kind === "roofcorner") {
      this.dragRoof(item.kind, item.id, x, z, phase);
      return;
    }
    const find = () => (item.kind === "device" ? f.devices.find((d) => d.id === item.id) : f.furniture.find((d) => d.id === item.id));
    if (phase === "start") {
      this.dragStart = structuredClone(this.plan);
      if (item.kind === "edge") {
        // the corner is made once the + moves: a tap adds one in the middle instead (onHit)
        this.dragEdge = this.edgeOf(item.id, fi);
        this.dragCorners = [];
        return;
      }
      if (item.kind === "corner") {
        const [sid, idx] = [item.id.slice(0, item.id.lastIndexOf(":")), Number(item.id.slice(item.id.lastIndexOf(":") + 1))];
        const all = [...f.rooms.map((r) => ({ outdoor: false, s: r as { id: string; points: Vec2[] } })), ...(f.outdoor ?? []).map((o) => ({ outdoor: true, s: o }))];
        const owner = all.find((x) => x.s.id === sid);
        const at = owner?.s.points[idx];
        this.dragCorners = [];
        if (at) {
          for (const x of all) {
            x.s.points.forEach((p, i) => {
              if (Math.hypot(p[0] - at[0], p[1] - at[1]) < 0.015) this.dragCorners.push({ outdoor: x.outdoor, id: x.s.id, i });
            });
          }
        }
        return;
      }
      if (item.kind === "opening") {
        this.select({ floor: fi, kind: "opening", id: item.id });
        return;
      }
      this.select({ floor: fi, kind: item.kind, id: item.id });
      const thing = find();
      this.dragFrom = thing ? [thing.x, thing.z] : null;
      this.collider = item.kind === "furniture" ? new Collider(this.plan, fi, item.id) : null;
      // the view must show this very plan, so markers follow the piece; then the piece leaves its
      // floor's mesh, and dragging only moves it
      if (view.viewer.plan !== this.plan) view.previewPlan(this.plan);
      view.viewer.liftItem(fi, item);
      return;
    }
    if (phase === "move" && item.kind === "edge" && this.dragEdge) {
      const e = this.dragEdge;
      this.dragEdge = null;
      this.dragCorners = [{ outdoor: e.outdoor, id: e.id, i: splitEdge(f, e.id, e.outdoor, e.k, e.len / 2) }];
    }
    if (phase === "move" && (item.kind === "corner" || item.kind === "edge")) {
      const snap = (v: number) => Math.round(v * 100) / 100;
      for (const c of this.dragCorners) {
        const s = c.outdoor ? f.outdoor?.find((o) => o.id === c.id) : f.rooms.find((r) => r.id === c.id);
        if (s) s.points[c.i] = [snap(x), snap(z)];
      }
      this.queueDragFrame(() => view.previewPlan(this.plan));
      return;
    }
    if (phase === "move" && item.kind === "opening") {
      // a door or window slides along its wall
      const o = f.openings.find((y) => y.id === item.id);
      const room = o && f.rooms.find((r) => r.id === o.room_id);
      if (!o || !room) return;
      const a = room.points[o.edge], b = room.points[(o.edge + 1) % room.points.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.05) return;
      const t = ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) / len;
      o.offset = Math.round(Math.max(o.width / 2, Math.min(len - o.width / 2, t)) * 100) / 100;
      this.queueDragFrame(() => view.previewPlan(this.plan));
      return;
    }
    if (phase === "move") {
      const thing = find();
      const from = this.dragFrom;
      if (!thing || !from) return;
      const to: Vec2 = [Math.round(x * 100) / 100, Math.round(z * 100) / 100];
      [thing.x, thing.z] = this.collider ? this.collider.place([thing.x, thing.z], to) : to;
      this.queueDragFrame(() => view.viewer.moveLifted(thing.x - from[0], thing.z - from[1]));
      return;
    }
    this.dragFrom = null;
    this.collider = null;
    this.dragEdge = null;
    if (this.dragStart) {
      const moved = JSON.stringify(this.dragStart) !== JSON.stringify(this.plan);
      if (moved) {
        const what = item.kind === "corner" ? t("editor.drag.aCorner") : item.kind === "opening" ? t("editor.drag.aKind", { kind: f.openings.find((o) => o.id === item.id)?.kind ?? "door" }) : item.kind === "device"
          ? String(this.hass.states[f.devices.find((d) => d.id === item.id)?.entity ?? ""]?.attributes.friendly_name ?? t("editor.aDevice"))
          : furnitureName(f.furniture.find((x) => x.id === item.id)?.type ?? "") ?? "furniture";
        this.undo.push({ plan: this.dragStart, label: item.kind === "edge" ? t("editor.addACorner") : t("editor.drag.moveWhat", { what }) });
        this.redo = [];
        this.changed();
        // the floor is rebuilt with the piece in its new place
        this.apply();
      } else view.viewer.dropLifted();
      this.dragStart = null;
    }
  }

  private fenceDrag: { origin: Vec2 | null; points: Vec2[]; i: number; made: boolean } | null = null;

  /**
   * A fence's point follows the pointer; a + becomes a new point once it moves; the selected fence
   * itself moves whole. The floor is drawn again once per frame, like a room's corner.
   */
  private dragFence(kind: "fence" | "fencepoint" | "fenceedge", ref: string, f: Floor, x: number, z: number, phase: DragPhase): void {
    const view = this.host.view;
    const at = ref.lastIndexOf(":");
    const id = kind === "fence" ? ref : ref.slice(0, at);
    const fence = f.fences?.find((y) => y.id === id);
    if (!fence) return;
    const snap = (v: number) => Math.round(v * 100) / 100;
    if (phase === "start") {
      this.dragStart = structuredClone(this.plan);
      this.fenceDrag = { origin: null, points: fence.points.map((p) => [p[0], p[1]] as Vec2), i: kind === "fence" ? -1 : Number(ref.slice(at + 1)), made: false };
      return;
    }
    const d = this.fenceDrag;
    if (phase === "move" && d) {
      if (kind === "fence") {
        d.origin ??= [x, z];
        const dx = snap(x - d.origin[0]), dz = snap(z - d.origin[1]);
        fence.points = d.points.map((p) => [snap(p[0] + dx), snap(p[1] + dz)] as Vec2);
      } else {
        if (kind === "fenceedge" && !d.made) {
          d.made = true;
          fence.points.splice(d.i + 1, 0, [snap(x), snap(z)]);
          d.i += 1;
        }
        fence.points[d.i] = [snap(x), snap(z)];
      }
      this.queueDragFrame(() => view.previewPlan(this.plan));
      return;
    }
    this.fenceDrag = null;
    if (!this.dragStart) return;
    if (JSON.stringify(this.dragStart) !== JSON.stringify(this.plan)) {
      this.undo.push({ plan: this.dragStart, label: kind === "fence" ? t("editor.drag.moveAFence") : kind === "fenceedge" ? t("editor.addAFenceCorner") : t("editor.drag.moveAFencePoint") });
      this.redo = [];
      this.changed();
      this.apply();
    }
    this.dragStart = null;
  }

  /** Drag updates run once per frame at most. */
  private queueDragFrame(fn: () => void): void {
    this.pendingDrag = fn;
    if (this.dragRaf) return;
    this.dragRaf = requestAnimationFrame(() => {
      this.dragRaf = 0;
      this.pendingDrag?.();
      this.pendingDrag = null;
      this.updateSelectionMarker();
    });
  }

  // ------------------------------------------------------------------ drawer

  private show(tab: Tab): void {
    this.tab = tab;
    this.render();
  }

  private render(): void {
    this.el.querySelectorAll<HTMLElement>(".ed-tab").forEach((b) => b.classList.toggle("on", b.dataset.tab === this.tab));
    this.body.replaceChildren(
      this.tab === "home" ? this.homeTab() :
      this.tab === "rooms" ? this.roomsTab() :
      this.tab === "devices" ? this.devicesTab() :
      this.tab === "extensions" ? this.extensionsTab() : this.selectedTab(),
    );
    this.status.textContent = this.savedText();
  }

  private homeTab(): HTMLElement {
    const fileIn = h("input", { type: "file", accept: ".json,.sh3d,application/json", multiple: true, hidden: true, onchange: (e: Event) => this.importFiles((e.target as HTMLInputElement).files) });
    const planIn = h("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: (e: Event) => this.loadPlanFile((e.target as HTMLInputElement).files?.[0]) });
    const box = h("div", {},
      this.houseTypes?.el,
      ...this.setupSection(() => fileIn.click()),
      ...this.checkSection(),
      ...this.demoSection(),
      this.houseTypes ? null : h("h4", {}, t("editor.houseType")),
      this.houseTypes ? null : h("p", { class: "ed-hint" }, t("editor.home.aReadyMadeHome")),
      this.houseTypes ? null : h("button", { class: "ed-btn ghost", onclick: () => this.openHouseTypes() }, t("editor.home.startFromAHouse")),
      h("div", { class: "ed-scan" },
        h("h4", {}, t("editor.home.import")),
        h("p", { class: "ed-hint" }, t("editor.home.aHouseScanScan")),
        h("button", { class: "ed-btn", onclick: () => fileIn.click() }, t("editor.importAScanOr")),
      ),
      fileIn,
      h("h4", {}, t("editor.devices")),
      h("p", { class: "ed-hint" }, t("editor.home.linksRoomsToAreas")),
      h("button", { class: "ed-btn", onclick: () => this.runAutoPlace() }, t("editor.placeDevicesAutomatically")),
      h("div", { class: "ed-report" }),
      h("h4", {}, t("editor.home.outsideWalls")),
      this.finishChips(EXTERIOR_FINISHES, this.plan.settings.exterior_finish ?? "render", (k) =>
        this.change((p) => (p.settings.exterior_finish = k as Plan["settings"]["exterior_finish"]), false, t("editor.home.outsideWallsName", { name: t((EXTERIOR_FINISHES as Record<string, FinishDef>)[k].label) }))),
      (EXTERIOR_FINISHES as Record<string, FinishDef>)[this.plan.settings.exterior_finish ?? "render"]?.tintable
        ? this.colourPicker(PAINT_SWATCHES, this.plan.settings.exterior_color, (c) => this.change((p) => (p.settings.exterior_color = c), false, t("editor.home.outsideWallColour")))
        : null,
      ...this.roofSection(),
      ...this.energySection(),
      ...this.peopleSection(),
      ...this.skySection(),
      h("h4", {}, t("editor.home.floors")),
      ...this.plan.floors.map((f, i) => this.floorRow(f, i)),
      h("div", { class: "ed-row" }, h("button", { class: "ed-btn ghost small", onclick: () => this.addFloor() }, t("editor.home.addAFloor"))),
      h("p", { class: "ed-hint" }, t("editor.home.aNewFloorGoes", { x: this.plan.floors.some((f) => (f.roofs ?? []).length) ? ` ${t("editor.home.thenTapTheRoof")}` : "" })),
      h("h4", {}, t("editor.home.planFile")),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => this.downloadPlan() }, t("editor.home.download")),
        h("button", { class: "ed-btn ghost", onclick: () => planIn.click() }, t("editor.home.load")),
        planIn,
      ),
    );
    if (this.host.restorePoints) {
      const list = h("div", { class: "ed-list" }, h("p", { class: "ed-hint" }, t("editor.loading")));
      box.append(h("h4", {}, t("editor.home.restorePoints")), list);
      this.host.restorePoints().then((points) => {
        list.replaceChildren(...(points.length ? points.map((p) =>
          h("div", { class: "ed-item" },
            h("span", {}, `${new Date(p.time * 1000).toLocaleString()}${p.label ? ` · ${p.label}` : ""}`),
            h("button", { class: "ed-btn ghost small", onclick: () => this.confirm(t("editor.home.goBackToThis"), t("editor.home.restore"), async () => {
              await this.host.restore!(p.id);
              this.finish();
            }) }, t("editor.home.restore")),
          )) : [h("p", { class: "ed-hint" }, t("editor.home.noneYetEverySave"))]));
      }).catch(() => list.replaceChildren(h("p", { class: "ed-hint" }, t("editor.home.notAvailableHere"))));
    }
    return box;
  }

  /** Look at the demo home (not in the online demo, which is one). */
  private demoSection(): HTMLElement[] {
    if (this.host.demo) return [];
    return [
      h("h4", {}, t("editor.demo.demoHome")),
      h("p", { class: "ed-hint" }, t("start.demo.text")),
      h("button", { class: "ed-btn ghost", onclick: () => {
        // back to 3D first: the 2D plan's keys would still reach this plan under the demo
        this.setPlanMode(false);
        void this.host.view.openDemo();
      } }, t("start.demo.title")),
    ];
  }

  /** The entity registry with registry ids; undefined while it loads (the Home tab is drawn again then). */
  private registryNow(): RegistryEntry[] | null | undefined {
    const key = this.hass.entities;
    const known = this.registry;
    if (known && known.key === key) return known.list;
    if (this.registryLoading !== key) {
      this.registryLoading = key;
      entityRegistry(this.hass).then((list) => {
        if (this.hass.entities !== key) return;
        this.registry = { key, list };
        if (this.tab === "home") this.render();
      });
    }
    return undefined;
  }

  /** Home Assistant's entity registry changed: renamed entities are followed, and what is missing is shown. */
  async registryChanged(): Promise<void> {
    const hass = this.hass;
    if (canFollow(this.plan, hass)) {
      const registry = await entityRegistry(hass);
      if (registry && followRenames(structuredClone(this.plan), hass, registry).length) {
        this.change((p) => void followRenames(p, hass, registry), true, t("editor.checks.followRenamedEntities"));
      }
    }
    if (this.tab === "home") this.render();
  }

  /** The integration answered Check my setup again (Home Assistant finished starting). */
  checksChanged(): void {
    if (this.tab === "home") this.render();
  }

  /** Check my setup: what stops VirtuHome working as it should, each with a fix where a safe one exists. */
  private checkSection(): HTMLElement[] {
    const view = this.host.view;
    const icons = { ok: mdiCheckCircleOutline, note: mdiInformationOutline, problem: mdiAlertCircleOutline };
    const followed = this.host.followed ?? [];
    const cards = view.setupChecks(this.plan).map((c) => {
      const buttons = c.fixes.map((f) => this.fixButton(f)).filter((b): b is HTMLButtonElement => !!b);
      return h("div", { class: `ed-card ed-result ${c.level}` },
        // all well takes one line
        h("div", { class: "ed-row" }, h("span", { html: svg(icons[c.level]) }), h("b", {}, c.title), c.level === "ok" ? h("small", {}, c.text) : null),
        c.level === "ok" ? null : h("p", { class: "ed-hint" }, c.text),
        c.id === "links" && followed.length && this.dirty
          ? h("p", { class: "ed-hint" }, t("editor.checks.followed", { n: followed.length }))
          : null,
        buttons.length ? h("div", { class: "ed-row" }, ...buttons) : null,
        ...(c.fixes.includes("relink") ? this.linkFixes() : []),
        ...(c.fixes.includes("add-rooms") ? this.areaFixes(c) : []),
      );
    });
    return [
      h("h4", {}, t("editor.checks.checkMySetup")),
      h("p", { class: "ed-hint" }, t("editor.checks.whatStopsVirtuhomeWorking")),
      ...cards,
      h("div", { class: "ed-row" }, h("button", { class: "ed-btn ghost small", onclick: async () => {
        await view.refreshServer();
        this.render();
      } }, t("editor.checks.checkAgain"))),
    ];
  }

  /** A fix's button. Nothing changes until it is pressed. */
  private fixButton(fix: Fix): HTMLButtonElement | null {
    const view = this.host.view;
    const hass = this.hass;
    const run: Partial<Record<Fix, [string, () => unknown]>> = {
      "link-rooms": [t("editor.checks.linkRoomsByName"), () => this.change((p) => {
        // areas Home Assistant no longer has are let go first
        for (const r of p.floors.flatMap((f) => [...f.rooms, ...(f.outdoor ?? [])])) if (r.area_id && hass.areas && !hass.areas[r.area_id]) r.area_id = null;
        linkRoomsByName(p, hass);
      }, true, t("editor.checks.linkRoomsToAreas"))],
      "open-rooms": [t("editor.checks.openRooms"), () => this.show("rooms")],
      reload: [t("editor.checks.reload"), () => location.reload()],
      resource: [t("editor.checks.addItAgain"), () => view.refreshServer(true)],
      graphics: [t("editor.checks.tryAgain"), () => view.resetGraphics()],
      renew: [t("editor.checks.renewNow"), async () => {
        await hass.callWS({ type: "virtuhome/licence/refresh" }).catch(() => undefined);
        await view.refreshServer();
      }],
      save: [t("editor.checks.save"), () => {
        this.unsaved = true;
        return this.save();
      }],
    };
    const f = run[fix];
    if (!f) return null;
    const b = h("button", { class: `ed-btn small${fix === "open-rooms" ? " ghost" : ""}`, onclick: async () => {
      b.disabled = true;
      await f[1]();
      if (this.tab === "home") this.render();
    } }, f[0]);
    return b;
  }

  /** Areas with devices but no room: a room for each, named and linked like the area. */
  private areaFixes(c: Check): HTMLElement[] {
    return (c.areas ?? []).slice(0, 12).map((id) => {
      const name = this.hass.areas?.[id]?.name ?? id;
      return h("div", { class: "ed-item" }, h("span", {}, name), h("button", { class: "ed-btn ghost small", onclick: () => this.addRoom(name, id) }, t("editor.addARoom")));
    });
  }

  /** Linked entities Home Assistant no longer has: the likely replacement to relink, or another to pick. */
  private linkFixes(): HTMLElement[] {
    const hass = this.hass;
    const missing = missingLinks(this.plan, hass);
    const registry = this.registryNow();
    const proposals = new Map<string, Proposal>();
    if (registry !== undefined) {
      for (const m of missing) {
        const p = proposeFor(m, this.plan, hass, registry);
        if (p) proposals.set(m.entity, p);
      }
    }
    const name = (id: string) => String(hass.states[id]?.attributes.friendly_name ?? id);
    const why: Record<Proposal["why"], string> = { renamed: "", "same device": t("editor.relink.sameDevice"), "same area": t("editor.relink.sameRoomLikeName"), "same name": t("editor.relink.likeName") };
    const relink = (pairs: [string, string | null][]) => {
      const label = pairs.length > 1 ? t("editor.relink.relinkNEntities", { n: pairs.length }) : pairs[0][1] ? t("editor.relink.relink") : t("editor.relink.unlink");
      this.change((p) => pairs.forEach(([from, to]) => replaceEntity(p, from, to)), false, label);
      this.status.textContent = pairs.length > 1 ? t("editor.relink.relinkedNEntities", { n: pairs.length }) : pairs[0][1] ? t("editor.relink.relinked") : t("editor.relink.unlinked");
    };
    const cards = missing.map((m) => {
      const p = proposals.get(m.entity);
      const others = this.entities((id) => domainOf(id) === domainOf(m.entity));
      const unlink: [string, string] = ["-", m.uses.every((u) => u.device) ? t("editor.removeFromPlan") : t("editor.relink.unlink")];
      return h("div", { class: "ed-card" },
        h("div", { class: "ed-row" }, h("b", {}, m.uses[0].label), m.uses.length > 1 ? h("small", {}, `and ${m.uses.length - 1} more`) : null),
        h("small", { class: "ed-id" }, m.entity),
        p ? h("div", { class: "ed-row" },
          h("span", { class: "ed-col" }, `${p.why === "renamed" ? t("editor.relink.renamed") : t("editor.relink.likely")}: ${name(p.entity)}`, h("small", { class: "ed-id" }, p.why === "renamed" ? p.entity : `${p.entity} · ${why[p.why]}`)),
          h("button", { class: "ed-btn small", onclick: () => relink([[m.entity, p.entity]]) }, t("editor.relink.relink")),
        ) : registry !== undefined ? h("p", { class: "ed-hint" }, t("editor.relink.nothingLikeItFound")) : null,
        h("div", { class: "ed-row" }, this.dropdown([unlink, ...others], "", (v) => v && relink([[m.entity, v === "-" ? null : v]]), t("editor.relink.pickAnother"))),
      );
    });
    const out: (HTMLElement | null)[] = [
      registry === undefined ? h("p", { class: "ed-hint" }, t("editor.relink.lookingForWhatReplaced")) : null,
      proposals.size > 1 ? h("div", { class: "ed-row" }, h("button", { class: "ed-btn small", onclick: () => relink([...proposals].map(([from, p]) => [from, p.entity])) }, t("editor.relink.relinkAllSize", { size: proposals.size }))) : null,
      ...cards,
    ];
    return out.filter((e): e is HTMLElement => !!e);
  }

  /** Getting started: what is left to set up a new home, each with the way to do it. */
  private setupSection(importScan: () => void): HTMLElement[] {
    const items = setupItems(this.plan, this.hass, { cardOnDashboard: this.cardSeen });
    if (!showChecklist(this.plan, items)) {
      if (!this.plan.settings.setup?.dismissed || setupComplete(items)) return [];
      return [h("div", { class: "ed-row" }, h("button", { class: "ed-btn ghost small", onclick: () => this.setSetup((s) => (s.dismissed = false), t("editor.setup.showGettingStarted")) }, t("editor.setup.showGettingStarted")))];
    }
    const card = items.find((it) => it.id === "card");
    if (card && !card.done && !this.cardAsked) {
      this.cardAsked = true;
      cardOnDashboard(this.hass).then((seen) => {
        this.cardSeen = seen;
        if (seen && this.tab === "home") this.render();
      });
    }
    const left = items.filter((it) => !it.done && !it.optional).length;
    return [
      h("h4", {}, t("editor.setup.gettingStarted")),
      h("p", { class: "ed-hint" }, left ? t("editor.setup.stepsToGo", { n: left }) : t("editor.setup.allDoneTheWall")),
      h("div", { class: "ed-setup" }, ...items.map((it) => this.setupRow(it, importScan))),
      h("div", { class: "ed-row" }, h("button", { class: "ed-btn ghost small", onclick: () => this.setSetup((s) => (s.dismissed = true), t("editor.setup.hideGettingStarted")) }, t("editor.setup.hideThisList"))),
    ];
  }

  private setupRow(it: SetupItem, importScan: () => void): HTMLElement {
    const btn = (label: string, onclick: () => void) => h("button", { class: "ed-btn ghost small", onclick }, label);
    const tick = (on: boolean) => this.setSetup((s) => {
      const done = new Set(s.done ?? []);
      if (on) done.add(it.id);
      else done.delete(it.id);
      s.done = [...done];
    }, on ? t("editor.setup.doneTitle", { title: it.title }) : t("editor.setup.notDoneTitle", { title: it.title }));
    const ticked = (this.plan.settings.setup?.done ?? []).includes(it.id);
    const actions: Record<SetupId, () => HTMLElement[]> = {
      home: () => [btn(t("editor.setup.traceAPicture"), () => this.startSetup("trace")), btn(t("editor.houseType"), () => this.startSetup("starter")), btn(t("editor.importAScanOr"), importScan), btn(t("editor.setup.drawRooms"), () => this.startSetup("draw"))],
      areas: () => [btn(t("editor.rooms"), () => this.show("rooms"))],
      devices: () => [btn(t("editor.placeDevicesAutomatically"), () => this.runAutoPlace())],
      north: () => [btn(t("editor.sunAndWeather"), () => this.scrollToHeading(t("editor.sunAndWeather"))), btn(t("editor.setup.itsRight"), () => tick(true))],
      card: () => [btn(t("editor.setup.done"), () => tick(true))],
      tablet: () => [btn(t("editor.setup.how"), () => window.open(guideLink("wall-tablets"), "_blank", "noopener")), btn(t("editor.setup.done"), () => tick(true))],
    };
    const icon = h("span", { class: `ed-tick${it.done ? " on" : ""}`, html: svg(it.done ? mdiCheckCircle : mdiCheckboxBlankCircleOutline) });
    // a step ticked by hand can be unticked
    const mark = it.manual && ticked
      ? h("button", { class: "ed-tick on", title: t("editor.setup.notDoneAfterAll"), html: svg(mdiCheckCircle), onclick: () => tick(false) })
      : icon;
    return h("div", { class: `ed-step${it.done ? " done" : ""}` },
      mark,
      h("div", {},
        h("b", {}, it.title + (it.optional ? ` ${t("editor.setup.optional")}` : "")),
        it.done ? null : h("p", { class: "ed-hint" }, it.id === "areas" ? t("editor.setup.hintSmartSetupLinks", { hint: it.hint }) : it.hint),
        it.done ? null : h("div", { class: "ed-row" }, ...actions[it.id]()),
      ),
    );
  }

  private setSetup(fn: (s: NonNullable<Plan["settings"]["setup"]>) => void, label: string): void {
    this.change((p) => {
      const s = { dismissed: false, done: [], ...(p.settings.setup ?? {}) };
      fn(s);
      p.settings.setup = s;
    }, false, label);
  }

  private scrollToHeading(text: string): void {
    this.show("home");
    const h4 = Array.from(this.body.querySelectorAll("h4")).find((x) => x.textContent === text);
    if (h4) this.scrollDrawerTo(h4);
  }

  /** Scrolls the drawer (only the drawer: scrollIntoView would move the page around it too). */
  private scrollDrawerTo(el: HTMLElement): void {
    this.body.scrollTop += el.getBoundingClientRect().top - this.body.getBoundingClientRect().top - 6;
  }

  /** Solar, battery and grid: what was found, and a sensor picked by hand where that is wrong. */
  private energySection(): HTMLElement[] {
    const hass = this.hass;
    const auto = this.host.view.energy.automatic();
    const set = this.plan.settings.energy ?? {};
    // "FoxESS - Modbus (Inverter) PV1 Power" reads better as "PV1 Power": without its device's name
    const name = (id: string) => {
      const full = String(hass.states[id]?.attributes.friendly_name ?? id);
      const dev = hass.entities?.[id]?.device_id ? hass.devices?.[hass.entities[id].device_id!] : undefined;
      const prefix = dev?.name_by_user || dev?.name;
      const short = prefix && full.startsWith(prefix) ? full.slice(prefix.length).replace(/^[\s:\-–]+/, "") : "";
      return short || full;
    };
    const sensors = (ok: (id: string) => boolean): [string, string][] =>
      Object.keys(hass.states).filter((id) => domainOf(id) === "sensor" && ok(id)).map((id) => [id, name(id)] as Swatch).sort((a, b) => a[1].localeCompare(b[1]));
    const dc = (id: string) => hass.states[id].attributes.device_class;
    const power = sensors((id) => dc(id) === "power");
    const levels = sensors((id) => dc(id) === "battery");
    const prices = sensors((id) => /\/kWh$/i.test(String(hass.states[id].attributes.unit_of_measurement ?? "")));
    const edit = (k: keyof EnergySettings, v: unknown, label: string) =>
      this.change((p) => {
        const e = { ...(p.settings.energy ?? {}) } as Record<string, unknown>;
        if (v === "" || v === null || v === undefined) delete e[k];
        else e[k] = v;
        p.settings.energy = Object.keys(e).length ? (e as EnergySettings) : null;
      }, false, label);
    const automatic = (...ids: (string | null)[]) => {
      const found = ids.filter((x): x is string => !!x);
      return t("editor.automaticX", { x: found.length ? found.map(name).join(" + ") : t("editor.energy.none") });
    };
    const row = (label: string, k: keyof EnergySettings, options: [string, string][], autoLabel: string) =>
      h("div", { class: "ed-row" },
        h("label", {}, label),
        this.dropdown(options, k === "solar" ? set.solar?.[0] ?? "" : String(set[k] ?? ""), (v) =>
          edit(k, k === "solar" ? (v ? [v] : null) : v || null, t("editor.energy.energyName", { name: label.toLowerCase() })), autoLabel),
      );
    return [
      h("h4", {}, t("editor.energy.energy")),
      h("p", { class: "ed-hint" }, t("editor.energy.solarBatteryAndGrid")),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: set.enabled !== false, onchange: (e: Event) => edit("enabled", (e.target as HTMLInputElement).checked ? null : false, t("editor.energy.energyShown")) }),
        ` ${t("editor.energy.showSolarBatteryAnd")}`),
      row(t("editor.energy.solar"), "solar", power, automatic(...auto.solar)),
      row(t("editor.energy.house"), "home", power, auto.home ? automatic(auto.home) : t("editor.energy.automaticWorkedOutFrom")),
      row(t("editor.energy.batteryIn"), "battery_charge", power, automatic(auto.batteryCharge ?? auto.battery)),
      row(t("editor.energy.batteryOut"), "battery_discharge", power, automatic(auto.batteryDischarge ?? auto.battery)),
      row(t("editor.energy.batteryLevel"), "battery_level", levels, automatic(auto.batteryLevel)),
      row(t("editor.energy.gridImport"), "grid_import", power, automatic(auto.gridImport ?? auto.grid)),
      row(t("editor.energy.gridExport"), "grid_export", power, automatic(auto.gridExport ?? auto.grid)),
      row(t("editor.energy.priceToBuy"), "price_import", prices, automatic(auto.priceImport)),
      row(t("editor.energy.priceToSell"), "price_export", prices, automatic(auto.priceExport)),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.energy.panelsPeakKw")),
        h("input", { class: "ed-in num", type: "number", step: "0.1", min: "0", value: set.solar_peak ? String(set.solar_peak) : "", placeholder: t("editor.auto"),
          onchange: (e: Event) => edit("solar_peak", Number((e.target as HTMLInputElement).value) || null, t("editor.energy.energyPanelsPeak")) }),
      ),
      h("div", { class: "ed-sub" }, t("editor.energy.carCharging")),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: set.ev_enabled !== false, onchange: (e: Event) => edit("ev_enabled", (e.target as HTMLInputElement).checked ? null : false, t("editor.energy.carChargingShown")) }),
        ` ${t("editor.energy.showTheCarCharger")}`),
      row(t("editor.charger"), "ev_charger", power, auto.ev.length ? t("editor.energy.automaticList", { list: auto.ev.map((c) => c.name).join(" + ") }) : t("editor.energy.automaticNoneFound")),
      row(t("editor.energy.carBattery"), "ev_level", levels, automatic(auto.ev[0]?.level ?? null)),
    ];
  }

  /** Who is in which room: the tracker each person's room comes from, found by itself or picked. */
  private peopleSection(): HTMLElement[] {
    const hass = this.hass;
    const set = this.plan.settings.presence ?? {};
    const people = this.entities((id) => domainOf(id) === "person");
    const found = new Set(roomTrackers(hass));
    const trackers = this.entities((id) => found.has(id));
    const name = (id: string) => trackers.find(([t]) => t === id)?.[1] ?? id;
    const edit = (fn: (e: PresenceSettings) => void, label: string) =>
      this.change((p) => {
        const e: PresenceSettings = { ...(p.settings.presence ?? {}), people: { ...(p.settings.presence?.people ?? {}) } };
        fn(e);
        if (!Object.keys(e.people!).length) delete e.people;
        p.settings.presence = Object.keys(e).length ? e : null;
      }, false, label);
    const rows = people.map(([id, who]) => {
      const picked = set.people && id in set.people ? set.people[id] ?? "none" : "";
      const auto = sourcesOf(hass, id, null, [...found]).filter((t) => found.has(t));
      return h("div", { class: "ed-row" },
        h("label", {}, who),
        this.dropdown([["none", t("editor.people.neverInARoom")], ...trackers], picked, (v) => edit((e) => {
          if (!v) delete e.people![id];
          else e.people![id] = v === "none" ? null : v;
        }, t("editor.people.whoRoomFrom", { who })), t("editor.automaticX", { x: auto.length ? auto.map(name).join(` ${t("editor.people.or")} `) : t("editor.people.noneFound") })));
    });
    // where the trackers put everyone now, to check them against
    const now = people.flatMap(([id, who]) => {
      const at = this.host.view.live.personRoom(id);
      const room = at ? spaces(this.plan.floors[at.floor])[at.room]?.name : null;
      return room ? [t("editor.people.whoInRoom", { who, room })] : [];
    });
    const out: (HTMLElement | null)[] = [
      h("h4", {}, t("editor.people.people")),
      h("p", { class: "ed-hint" }, t("editor.people.peopleShowInThe")),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: set.enabled !== false, onchange: (e: Event) => edit((x) => {
          if ((e.target as HTMLInputElement).checked) delete x.enabled;
          else x.enabled = false;
        }, t("editor.people.peopleInRoomsShown")) }),
        ` ${t("editor.people.showPeopleInTheir")}`),
      ...(set.enabled === false ? [] : rows),
      set.enabled !== false && now.length ? h("p", { class: "ed-hint" }, t("editor.people.nowList", { list: now.join(", ") })) : null,
      people.length ? null : h("p", { class: "ed-hint" }, t("editor.people.noPeopleInHome")),
      people.length && !trackers.length && set.enabled !== false
        ? h("p", { class: "ed-hint" }, t("editor.people.noRoomTrackersFound"))
        : null,
    ];
    return out.filter((e): e is HTMLElement => !!e);
  }

  /** Which way the house faces (for the sun and the wind) and which weather it shows. */
  private skySection(): HTMLElement[] {
    const set = this.plan.settings;
    const sky = set.sky ?? {};
    const north = set.north ?? 0;
    const editSky = (k: "enabled" | "weather", v: unknown, label: string) =>
      this.change((p) => {
        const e = { ...(p.settings.sky ?? {}) } as Record<string, unknown>;
        if (v === "" || v === null || v === undefined) delete e[k];
        else e[k] = v;
        p.settings.sky = Object.keys(e).length ? e : null;
      }, false, label);
    const weathers = this.entities((id) => domainOf(id) === "weather");
    const autoWeather = this.host.view.skyLive.weatherEntity(this.hass);
    const fit = this.mapFit;
    let mapRows: (HTMLElement | null)[] = [];
    if (fit && "busy" in fit) mapRows = [h("p", { class: "ed-hint" }, t("editor.sky.askingOpenstreetmap"))];
    else if (fit && "error" in fit) mapRows = [h("p", { class: "ed-hint" }, fit.error)];
    else if (fit && "building" in fit) {
      const b = fit.building;
      const where = b.distance < 1 ? t("editor.sky.atTheHomeLocation") : t("editor.sky.distanceMFromThe", { distance: Math.round(b.distance) });
      mapRows = [
        h("p", { class: "ed-hint" }, t("editor.sky.foundABuildingWhere", { where, fixed: b.size[0].toFixed(1), fixed2: b.size[1].toFixed(1) })),
        h("div", { class: "ed-row" }, ...fit.fits.map((f) =>
          h("button", { class: `ed-btn small${Math.abs(f.north - north) < 0.5 ? "" : " ghost"}`, onclick: () => this.setNorth(f.north) }, `${Math.round(f.north)}° ${compassName(f.north)}`))),
      ];
    }
    return [
      h("h4", {}, t("editor.sunAndWeather")),
      h("p", { class: "ed-hint" }, t("editor.sky.whichWayTheTop")),
      h("div", { class: "ed-row" },
        this.northDial(north),
        h("div", { class: "ed-col" },
          h("div", { class: "ed-row" },
            h("label", {}, t("editor.sky.faces")),
            h("input", { class: "ed-in num", type: "number", step: "1", min: "0", max: "359", value: String(Math.round(north * 10) / 10),
              onchange: (e: Event) => this.setNorth(Number((e.target as HTMLInputElement).value) || 0) }),
            h("span", {}, `° ${compassName(north)}`)),
          h("button", { class: "ed-btn ghost", onclick: () => this.lineUpWithMap() }, t("editor.sky.lineUpWithThe")),
        ),
      ),
      h("p", { class: "ed-hint" }, t("editor.sky.lineUpWithTheMap")),
      ...mapRows.filter((e): e is HTMLElement => !!e),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: sky.enabled !== false, onchange: (e: Event) => editSky("enabled", (e.target as HTMLInputElement).checked ? null : false, t("editor.sky.weatherShown")) }),
        ` ${t("editor.sky.showTheWeatherClouds")}`),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.sky.weather")),
        this.dropdown(weathers, sky.weather ?? "", (v) => editSky("weather", v || null, t("editor.sky.weatherEntity")), t("editor.automaticX", { x: autoWeather ? weathers.find(([id]) => id === autoWeather)?.[1] ?? autoWeather : "none" }))),
    ];
  }

  private setNorth(n: number): void {
    const v = Math.round((((n % 360) + 360) % 360) * 10) / 10;
    this.change((p) => (p.settings.north = v), false, t("editor.north"));
  }

  /** A compass to drag: the N goes where north is on the plan (the plan's top is up). Shift snaps to 15°. */
  private northDial(north: number): HTMLElement {
    const dial = h("div", { class: "ed-compass", title: t("editor.sky.dragTheNTo") });
    const draw = (n: number) => {
      const ticks = Array.from({ length: 12 }, (_, i) => `<line x1="42" y1="6" x2="42" y2="${i % 3 ? 10 : 13}" transform="rotate(${i * 30} 42 42)"/>`).join("");
      // the letters stay upright as the rose turns
      const letters = ([["N", 0], ["E", 90], ["S", 180], ["W", 270]] as const).map(([l, a]) => {
        const r = ((a - n) * Math.PI) / 180;
        return `<text x="${(42 + 21 * Math.sin(r)).toFixed(1)}" y="${(46 - 21 * Math.cos(r)).toFixed(1)}" class="${l === "N" ? "n" : ""}">${l}</text>`;
      }).join("");
      dial.innerHTML = `<svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/><g transform="rotate(${-n} 42 42)">${ticks}</g>${letters}`
        + `<path class="up" d="M42 34 L47 46 L42 43 L37 46 Z"/></svg>`;
    };
    draw(north);
    let start: Plan | null = null;
    const angle = (e: PointerEvent) => {
      const r = dial.getBoundingClientRect();
      const a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
      const n = (((-a % 360) + 360) % 360);
      return e.shiftKey ? (Math.round(n / 15) * 15) % 360 : Math.round(n);
    };
    dial.addEventListener("pointerdown", (e) => {
      start = structuredClone(this.plan);
      dial.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    dial.addEventListener("pointermove", (e) => {
      if (!start) return;
      // the 3D view's sun turns with it; one undo step when the drag ends
      this.plan.settings.north = angle(e);
      draw(this.plan.settings.north);
      this.host.view.previewPlan(this.plan);
    });
    const end = (e: PointerEvent) => {
      if (!start) return;
      const before = start;
      start = null;
      this.plan.settings.north = angle(e);
      if (before.settings.north !== this.plan.settings.north) {
        this.undo.push({ plan: before, label: t("editor.north") });
        this.redo = [];
        this.changed();
      }
      this.apply();
    };
    dial.addEventListener("pointerup", end);
    dial.addEventListener("pointercancel", end);
    return dial;
  }

  /** Turns the plan to match the building at the home location on OpenStreetMap. */
  private async lineUpWithMap(): Promise<void> {
    const loc = homeLocation(this.hass);
    if (!loc) {
      this.mapFit = { error: t("editor.sky.homeAssistantHasNo") };
      this.render();
      return;
    }
    this.mapFit = { busy: true };
    this.render();
    try {
      const buildings = await fetchBuildings(loc.lat, loc.lon);
      const building = pickBuilding(this.plan, buildings);
      if (!building) {
        this.mapFit = { error: t("editor.sky.openstreetmapHasNoBuilding") };
        this.render();
        return;
      }
      const fits = northFits(this.plan, building);
      this.mapFit = { building, fits };
      if (fits[0]) this.setNorth(fits[0].north);
      else this.render();
    } catch (err) {
      this.mapFit = { error: t("editor.sky.openstreetmapCouldNotBe", { x: (err as Error).message ?? err }) };
      this.render();
    }
  }

  /** A car: when it shows (it can leave the drive), and its charger's car's own shape and size. */
  private carRows(fi: number, x: Furniture, reshape: (label: string) => (fn: (y: Furniture) => void) => void): HTMLElement[] {
    const here = this.entities((id) => ["device_tracker", "person", "binary_sensor", "input_boolean"].includes(domainOf(id)));
    const name = this.host.view.live.ev(x.entity ?? null)?.name ?? null;
    const model = carModel(name);
    const same = model && model.type === x.type && [x.w, x.d, x.h].every((v, i) => Math.abs(v - model.size[i]) < 0.005);
    const rows: (HTMLElement | null)[] = [
      h("div", { class: "ed-row" }, h("label", {}, t("editor.car.shown")),
        this.dropdown([["plugged", t("editor.car.whilePluggedIn")], ...here], x.parked ?? "", (v) => this.change((p) => {
          const y = p.floors[fi].furniture.find((z) => z.id === x.id)!;
          if (v) y.parked = v;
          else delete y.parked;
        }, false, t("editor.car.carShown")), t("editor.car.always"))),
      h("p", { class: "ed-hint" }, t("editor.car.aCarThatIs")),
      model && name && !same
        ? h("button", { class: "ed-btn ghost", onclick: () => reshape(t("editor.car.shape"))((y) => {
          y.type = model.type;
          [y.w, y.d, y.h] = model.size;
        }) }, t("editor.car.shapeItLikeThe", { name }))
        : null,
    ];
    return rows.filter((e): e is HTMLElement => !!e);
  }

  private floorRow(f: Floor, i: number): HTMLElement {
    const haFloors = Object.values(this.hass.floors ?? {});
    return h("div", { class: "ed-card" },
      h("div", { class: "ed-row" },
        h("input", { class: "ed-in", value: f.name, onchange: (e: Event) => this.change((p) => (p.floors[i].name = (e.target as HTMLInputElement).value)) }),
        this.plan.floors.length > 1 ? h("button", { class: "ed-ib small", title: t("editor.removeName", { name: f.name }), html: svg(mdiDelete), onclick: () => this.removeFloor(i) }) : null,
      ),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.floor.haFloor")),
        this.dropdown(haFloors.map((x) => [x.floor_id, x.name]), f.ha_floor ?? "", (v) => this.change((p) => (p.floors[i].ha_floor = v || null)), "—"),
      ),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.floor.levelM")),
        h("input", { class: "ed-in num", type: "number", step: "0.05", value: String(f.elevation), onchange: (e: Event) => this.change((p) => (p.floors[i].elevation = Number((e.target as HTMLInputElement).value))) }),
        h("label", {}, t("editor.height")),
        h("input", { class: "ed-in num", type: "number", step: "0.05", value: String(f.height), onchange: (e: Event) => this.change((p) => (p.floors[i].height = Number((e.target as HTMLInputElement).value))) }),
      ),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.outside")),
        this.dropdown(Object.entries(EXTERIOR_FINISHES).map(([k, d]) => [k, t(d.label)]), f.exterior_finish ?? "", (v) =>
          this.change((p) => (p.floors[i].exterior_finish = (v || null) as Floor["exterior_finish"]), false, t("editor.floor.nameOutsideWalls", { name: f.name })), t("editor.floor.sameAsTheHouse")),
      ),
    );
  }

  /** Licence key and extensions. Buying shows up only once VirtuMaps opens the shop on the server. */
  private extensionsTab(): HTMLElement {
    const box = h("div", {}, h("p", { class: "ed-hint" }, t("editor.loading")));
    const hass = this.hass;
    type Summary = { status: string; error: string | null; key_hint: string | null; extensions: { id: string; name: string; version: string }[] };
    type Catalog = { id: string; name: string; description?: string; price?: string; checkout_url?: string }[];
    const render = (s: Summary | null, catalog: Catalog, note = "", reload = false) => {
      const installed = new Set(s?.extensions.map((x) => x.id));
      const input = h("input", { class: "ed-in", placeholder: t("editor.extensions.licenceKey"), autocomplete: "off", spellcheck: false });
      const status = h("p", { class: "ed-hint" }, note);
      const busy = (b: HTMLButtonElement, text: string) => {
        b.disabled = true;
        b.textContent = text;
      };
      const parts: (Node | null)[] = [
        h("h4", {}, t("editor.extensions.licence")),
        s && s.status !== "none"
          ? h("div", { class: "ed-card" },
            h("div", { class: "ed-row" }, h("b", {}, s.status === "active" ? t("editor.extensions.active") : s.status === "expired" ? t("editor.extensions.expiredRenewsOnline") : t("editor.extensions.notValid")), h("small", {}, s.key_hint ?? "")),
            s.error ? h("p", { class: "ed-hint" }, s.error) : null,
            ...s.extensions.map((x) => h("div", { class: "ed-item" }, h("span", {}, x.name), h("small", {}, x.version))),
            h("div", { class: "ed-row" },
              h("button", { class: "ed-btn ghost small", onclick: async (ev: Event) => {
                busy(ev.target as HTMLButtonElement, t("editor.extensions.checking"));
                try {
                  render(await hass.callWS<Summary>({ type: "virtuhome/licence/refresh" }), catalog, t("editor.extensions.upToDateReload"), true);
                } catch (err) {
                  render(s, catalog, String((err as { message?: string }).message ?? err));
                }
              } }, t("editor.extensions.checkForUpdates")),
              h("button", { class: "ed-btn ghost small", onclick: () => this.confirm(t("editor.extensions.removeTheLicenceFrom"), t("editor.remove"), async () => {
                render(await hass.callWS<Summary>({ type: "virtuhome/licence/remove" }), catalog, t("editor.extensions.licenceRemoved"));
              }) }, t("editor.extensions.removeLicence")),
            ))
          : h("p", { class: "ed-hint" }, t("editor.extensions.extensionsAddFeaturesSuch")),
        h("div", { class: "ed-row" },
          input,
          h("button", { class: "ed-btn small", onclick: async (ev: Event) => {
            const key = input.value.trim();
            if (key.length < 8) return;
            busy(ev.target as HTMLButtonElement, t("editor.extensions.activating"));
            try {
              const next = await hass.callWS<Summary>({ type: "virtuhome/licence/activate", key });
              render(next, catalog, t("editor.extensions.activatedReloadThePage"), true);
            } catch (err) {
              render(s, catalog, String((err as { message?: string }).message ?? err));
            }
          } }, t("editor.extensions.activate")),
        ),
        status,
        reload ? h("button", { class: "ed-btn ghost small", onclick: () => location.reload() }, t("editor.extensions.reloadNow")) : null,
        h("h4", {}, t("editor.extensions.availableExtensions")),
        ...(catalog.length ? catalog.map((c) => h("div", { class: "ed-card" },
          h("div", { class: "ed-row" }, h("b", {}, c.name), installed.has(c.id) ? h("small", {}, t("editor.extensions.installed")) : null),
          c.description ? h("p", { class: "ed-hint" }, c.description) : null,
          !installed.has(c.id) && c.checkout_url ? h("a", { class: "ed-btn small", href: c.checkout_url, target: "_blank", rel: "noopener" }, t("editor.extensions.getItX", { x: c.price ? ` · ${c.price}` : "" })) : null,
        )) : [h("p", { class: "ed-hint" }, t("editor.extensions.theListOfExtensions"))]),
        !catalog.some((c) => c.checkout_url) ? h("p", { class: "ed-hint" }, t("editor.extensions.extensionsAreCurrentlyAvailable")) : null,
      ];
      box.replaceChildren(...parts.filter((x): x is Node => x !== null));
    };
    Promise.all([
      hass.callWS<Summary>({ type: "virtuhome/licence/get" }).catch(() => null),
      hass.callWS<Catalog>({ type: "virtuhome/catalog" }).catch(() => [] as Catalog),
    ]).then(([s, c]) => render(s, c, s ? "" : t("editor.extensions.extensionsNeedTheVirtuhome")));
    return box;
  }

  private roomsTab(): HTMLElement {
    const areas = Object.values(this.hass.areas ?? {}).sort((a, b) => a.name.localeCompare(b.name));
    const box = h("div", {},
      h("p", { class: "ed-hint" }, t("editor.rooms.tapARoomOr")),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => this.addRoom() }, t("editor.addARoom")),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addGarden("back") }, t("editor.rooms.addBackGarden")),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addGarden("front") }, t("editor.rooms.addFrontArea")),
        h("button", { class: "ed-btn ghost small", onclick: () => this.startFence() }, t("editor.rooms.drawAFence")),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addArea("patio", "rect") }, t("editor.rooms.addAPatio")),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addArea("deck", "rect") }, t("editor.rooms.addADeck")),
      ),
    );
    this.plan.floors.forEach((f, fi) => {
      box.append(h("h4", {}, f.name));
      for (const fence of f.fences ?? []) {
        box.append(h("div", { class: `ed-card ${this.sel?.id === fence.id ? "on" : ""}`, onclick: () => this.select({ floor: fi, kind: "fence", id: fence.id }) },
          h("div", { class: "ed-row" }, h("b", {}, t("editor.nameFence", { name: t(fenceStyle(fence.style).label) })), h("small", {}, ` · ${t("editor.rooms.fenceMetres", { m: fenceLength(fence).toFixed(1) })}${fence.gates?.length ? t("editor.rooms.fenceGates", { n: fence.gates.length }) : ""}`)),
        ));
      }
      for (const o of f.outdoor ?? []) {
        box.append(h("div", { class: `ed-card ${this.sel?.id === o.id ? "on" : ""}`, onclick: () => this.select({ floor: fi, kind: "outdoor", id: o.id }) },
          h("div", { class: "ed-row" }, h("b", {}, o.name), h("small", {}, ` · ${o.kind === "deck" ? t("editor.rooms.nameDeck", { name: t(DECK_BOARDS[deckLook(o).boards].label).toLowerCase() }) : isPaved(o) ? t(PAVING[areaPaving(o).material].label).toLowerCase() : t(KIND_NAMES[o.kind]).toLowerCase()}`)),
        ));
      }
      f.rooms.forEach((r, ri) => {
        box.append(h("div", { class: `ed-card ${this.sel?.kind === "room" && this.sel.id === r.id ? "on" : ""}` },
          h("div", { class: "ed-row" },
            h("input", { class: "ed-in", value: r.name, onchange: (e: Event) => this.change((p) => (p.floors[fi].rooms[ri].name = (e.target as HTMLInputElement).value)) }),
            h("button", { class: "ed-btn ghost small", onclick: () => {
              this.host.view.viewer.selectRoom(fi, ri);
              this.select({ floor: fi, kind: "room", id: r.id });
            } }, t("editor.rooms.show")),
          ),
          h("div", { class: "ed-row" },
            h("label", {}, t("editor.area")),
            this.dropdown(areas.map((a) => [a.area_id, a.name]), r.area_id ?? "", (v) => this.change((p) => (p.floors[fi].rooms[ri].area_id = v || null)), t("editor.notLinked")),
          ),
          h("div", { class: "ed-row" },
            h("label", {}, t("editor.floor")),
            this.dropdown(Object.entries(FLOOR_FINISHES).map(([k, d]) => [k, t(d.label)]), r.floor ?? "wood", (v) => this.change((p) => (p.floors[fi].rooms[ri].floor = v as FloorMaterial), false, t("editor.nameFloor", { name: r.name }))),
          ),
        ));
      });
    });
    return box;
  }

  private devicesTab(): HTMLElement {
    const hass = this.hass;
    const name = (id: string) => String(hass.states[id]?.attributes.friendly_name ?? id);
    const box = h("div", {});
    // what is not in the plan yet, by area of a linked room
    const inPlan = new Set(this.plan.floors.flatMap((f) => [
      ...f.devices.map((d) => d.entity), ...f.furniture.map((x) => x.entity), ...f.openings.flatMap((o) => [o.entity, o.cover]),
    ]).filter(Boolean) as string[]);
    const roomByArea = new Map<string, { fi: number; room: Room }>();
    this.plan.floors.forEach((f, fi) => [...f.rooms, ...(f.outdoor ?? []) as unknown as Room[]].forEach((r) => r.area_id && !roomByArea.has(r.area_id) && roomByArea.set(r.area_id, { fi, room: r })));
    const missing: { id: string; fi: number; room: Room }[] = [];
    for (const [id, reg] of Object.entries(hass.entities ?? {})) {
      if (reg.hidden || reg.entity_category || inPlan.has(id) || !hass.states[id]) continue;
      if (!["light", "camera", "binary_sensor", "climate", "media_player", "switch", "cover", "lock", "fan", "vacuum", "alarm_control_panel"].includes(domainOf(id))) continue;
      const area = reg.area_id ?? (reg.device_id ? hass.devices?.[reg.device_id]?.area_id : null);
      const target = area ? roomByArea.get(area) : undefined;
      if (target) missing.push({ id, ...target });
    }
    box.append(h("h4", {}, t("editor.devices.notPlacedN", { n: missing.length })));
    if (!missing.length) box.append(h("p", { class: "ed-hint" }, t("editor.devices.everythingInTheLinked")));
    for (const m of missing.slice(0, 80)) {
      box.append(h("div", { class: "ed-item" },
        h("span", {}, name(m.id), h("small", {}, ` · ${m.room.name}`)),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addDevice(m.fi, m.room, m.id) }, t("editor.devices.add")),
      ));
    }
    this.plan.floors.forEach((f, fi) => {
      box.append(h("h4", {}, t("editor.devices.namePlaced", { name: f.name })));
      for (const d of f.devices) {
        box.append(h("div", { class: "ed-item", onclick: () => this.select({ floor: fi, kind: "device", id: d.id }) },
          h("span", {}, name(d.entity)),
          h("button", { class: "ed-ib small", title: t("editor.remove"), html: svg(mdiDelete), onclick: (e: Event) => {
            e.stopPropagation();
            this.change((p) => (p.floors[fi].devices = p.floors[fi].devices.filter((x) => x.id !== d.id)));
          } }),
        ));
      }
    });
    return box;
  }

  private selectedTab(): HTMLElement {
    const s = this.sel;
    if (!s) return h("p", { class: "ed-hint" }, t("editor.selected.tapARoomA"));
    const fi = s.floor;
    const f = this.plan.floors[fi];
    if (!f) return h("div", {});
    if (s.kind === "room") return this.roomPanel(fi, f.rooms.find((r) => r.id === s.id));
    if (s.kind === "outdoor") return this.outdoorPanel(fi, f.outdoor?.find((o) => o.id === s.id));
    if (s.kind === "device") return this.devicePanel(fi, f.devices.find((d) => d.id === s.id));
    if (s.kind === "opening") return this.openingPanel(fi, f.openings.find((o) => o.id === s.id));
    if (s.kind === "fence") return this.fencePanel(fi, f.fences?.find((x) => x.id === s.id));
    if (s.kind === "roof") return this.roofPanel(fi, f.roofs?.find((x) => x.id === s.id));
    if (s.kind === "roofitem") return this.roofItemPanel(fi, this.roofItemOf(this.plan, s.id)?.item);
    return this.furniturePanel(fi, f.furniture.find((x) => x.id === s.id));
  }

  private roomPanel(fi: number, room: Room | undefined): HTMLElement {
    if (!room) return h("div", {});
    const f = this.plan.floors[fi];
    const contacts = this.entities((id, s) => domainOf(id) === "binary_sensor" && ["door", "window", "opening", "garage_door"].includes(String(s.attributes.device_class)));
    const covers = this.entities((id) => domainOf(id) === "cover");
    const openings = f.openings.filter((o) => o.room_id === room.id);
    const updRoom = (label: string, fn: (r: Room) => void) => this.change((p) => fn(p.floors[fi].rooms.find((r) => r.id === room.id)!), false, label);
    const wallFinish = room.wall_finish ?? "paint";
    const inRoom = f.furniture.filter((x) => pointInPolygon([x.x, x.z], room.points));
    return h("div", {},
      h("h4", {}, room.name),
      h("div", { class: "ed-sub" }, t("editor.floor")),
      this.finishChips(FLOOR_FINISHES, room.floor ?? "wood", (k) => updRoom(t("editor.nameFloor", { name: room.name }), (r) => (r.floor = k as FloorMaterial))),
      h("div", { class: "ed-sub" }, t("editor.room.walls")),
      this.finishChips(WALL_FINISHES, wallFinish, (k) => updRoom(t("editor.room.nameWalls", { name: room.name }), (r) => (r.wall_finish = k as Room["wall_finish"]))),
      (WALL_FINISHES as Record<string, FinishDef>)[wallFinish]?.tintable
        ? this.colourPicker(PAINT_SWATCHES, room.wall_color, (c) => updRoom(t("editor.room.nameWallColour", { name: room.name }), (r) => (r.wall_color = c)), t("editor.room.plainWhite"))
        : null,
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
          for (const fl of p.floors) for (const r of fl.rooms) {
            r.wall_finish = room.wall_finish;
            r.wall_color = room.wall_color ?? null;
          }
        }, false, t("editor.room.wallsInEveryRoom")) }, t("editor.room.useTheseWallsEverywhere")),
      ),
      h("h4", {}, t("editor.room.addFurnitureAndDecor")),
      this.itemPicker((type) => this.addFurniture(fi, room, type)),
      h("h4", {}, t("editor.room.inThisRoomN", { n: inRoom.length })),
      h("div", { class: "ed-chips" }, ...inRoom.map((x) => h("button", { class: "ed-chip", onclick: () => this.select({ floor: fi, kind: "furniture", id: x.id }) },
        furnitureName(x.type) ?? x.type))),
      h("h4", {}, t("editor.room.doorsAndWindowsN", { n: openings.length })),
      ...openings.map((o) => h("div", { class: "ed-card" },
        h("div", { class: "ed-row" }, h("b", {}, o.kind), h("small", {}, t("editor.room.fixedMWide", { fixed: o.width.toFixed(2) })),
          h("button", { class: "ed-btn ghost small", onclick: () => this.select({ floor: fi, kind: "opening", id: o.id }) }, t("editor.room.edit"))),
        h("div", { class: "ed-row" },
          h("label", {}, t("editor.sensor")),
          this.dropdown(contacts, o.entity ?? "", (v) => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.entity = v || null;
          }), t("editor.none")),
        ),
        o.kind === "window" ? h("div", { class: "ed-row" },
          h("label", {}, t("editor.blind")),
          this.dropdown(covers, o.cover ?? "", (v) => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.cover = v || null;
          }), t("editor.none")),
        ) : null,
        o.kind === "door" ? h("div", { class: "ed-row" },
          h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.hinge = x.hinge === "right" ? "left" : "right";
          }) }, t("editor.flipHinge")),
          h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.swing = x.swing === "out" ? "in" : "out";
          }) }, t("editor.room.swingOtherWay")),
        ) : null,
      )),
      h("p", { class: "ed-hint" }, t("editor.room.toAddACorner")),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => this.confirm(t("editor.room.removeNameWithIts", { name: room.name }), t("editor.remove"), () => {
          this.change((p) => {
            const fl = p.floors[fi];
            fl.rooms = fl.rooms.filter((r) => r.id !== room.id);
            fl.openings = fl.openings.filter((x) => x.room_id !== room.id);
          });
          this.select(null);
        }) }, t("editor.room.removeRoom")),
      ),
    );
  }

  private outdoorPanel(fi: number, o: OutdoorArea | undefined): HTMLElement {
    if (!o) return h("div", {});
    const areas = Object.values(this.hass.areas ?? {}).sort((a, b) => a.name.localeCompare(b.name));
    const upd = (label: string, fn: (x: OutdoorArea) => void) => this.change((p) => fn(p.floors[fi].outdoor!.find((y) => y.id === o.id)!), false, label);
    const chip = (label: string, on: boolean, onclick: () => void, title = "") => h("button", { class: `ed-chip${on ? " on" : ""}`, title, onclick: () => !on && onclick() }, label);
    const lawn = o.kind === "lawn";
    return h("div", {},
      h("h4", {}, o.name),
      h("p", { class: "ed-hint" }, t("editor.outdoor.dragTheBlueCorners")),
      h("div", { class: "ed-row" }, h("label", {}, t("editor.outdoor.name")), h("input", { class: "ed-in", value: o.name, onchange: (e: Event) => upd(t("editor.outdoor.renameAGardenArea"), (x) => (x.name = (e.target as HTMLInputElement).value)) })),
      h("div", { class: "ed-sub" }, t("editor.outdoor.ground")),
      h("div", { class: "ed-chips" }, ...OUTDOOR_KINDS.map((k) => chip(t(KIND_NAMES[k]), o.kind === k, () => upd(t("editor.outdoor.makeNameLowercase", { name: o.name, lowerCase: t(KIND_NAMES[k]).toLowerCase() }), (x) => (x.kind = k))))),
      ...(isPaved(o) ? this.pavingRows(o, upd) : []),
      ...(o.kind === "deck" ? this.deckRows(o, upd) : []),
      ...(o.kind === "patio" || o.kind === "deck" ? this.raisedRows(fi, o, upd) : []),
      ...this.areaSizeRows(o, upd),
      h("div", { class: "ed-row" }, h("label", {}, t("editor.area")), this.dropdown(areas.map((a) => [a.area_id, a.name]), o.area_id ?? "", (v) => upd(t("editor.outdoor.linkAGardenArea"), (x) => (x.area_id = v || null)), t("editor.notLinked"))),
      lawn ? h("h4", {}, t("editor.outdoor.addToThisGarden")) : null,
      lawn ? h("div", { class: "ed-chips" },
        h("button", { class: "ed-chip", onclick: () => this.addArea("patio", "rect", o) }, t("editor.patio")),
        h("button", { class: "ed-chip", onclick: () => this.addArea("patio", "round", o) }, t("editor.outdoor.roundPatio")),
        h("button", { class: "ed-chip", onclick: () => this.addArea("deck", "rect", o) }, t("editor.deck")),
        h("button", { class: "ed-chip", onclick: () => this.addArea("path", "rect", o) }, t("editor.path")),
        h("button", { class: "ed-chip", title: t("editor.outdoor.drawItsOutlineIn"), onclick: () => this.drawArea("patio") }, t("editor.outdoor.drawAPatio")),
      ) : null,
      lawn ? this.itemPicker((type) => this.addFurniture(fi, o, type), true) : null,
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", title: t("editor.outdoor.aFenceAlongIts"), onclick: () => this.fenceRound(fi, o) }, t("editor.outdoor.fenceRoundIt")),
        h("button", { class: "ed-btn ghost", onclick: () => {
          const id = newId("out");
          this.change((p) => {
            const fl = p.floors[fi];
            fl.outdoor = [...(fl.outdoor ?? []), { ...structuredClone(o), id, name: `${o.name} 2`, points: o.points.map(([px, pz]) => [px + 0.5, pz + 0.5] as Vec2) }];
          }, false, t("editor.duplicateName", { name: o.name }));
          this.select({ floor: fi, kind: "outdoor", id });
        } }, t("editor.duplicate")),
        h("button", { class: "ed-btn danger", onclick: () => {
          this.change((p) => (p.floors[fi].outdoor = (p.floors[fi].outdoor ?? []).filter((x) => x.id !== o.id)), false, t("editor.removeName", { name: o.name }));
          this.select(null);
        } }, t("editor.remove")),
      ),
    );
  }

  /** A paved area: what it is laid with, in what colour and pattern, unit size, joints, direction and border. */
  private pavingRows(o: OutdoorArea, upd: (label: string, fn: (x: OutdoorArea) => void) => void): (HTMLElement | null)[] {
    const look = areaPaving(o);
    const usual = areaPaving({ ...o, color: null });
    const def = PAVING[look.material];
    const chip = (label: string, on: boolean, onclick: () => void) => h("button", { class: `ed-chip${on ? " on" : ""}`, onclick: () => !on && onclick() }, label);
    const sized = look.pattern !== "random" && look.pattern !== "crazy" && look.pattern !== "plain";
    const unit = def.sizes.includes(o.unit ?? "") ? o.unit! : def.sizes[0];
    const border = o.border && BORDER_MATERIALS.includes(o.border as PavingMaterial) ? (o.border as PavingMaterial) : null;
    // a gravel area's stones only take a colour (gravel is a kind of ground of its own)
    if (o.kind === "gravel") {
      return [h("div", { class: "ed-sub" }, t("editor.paving.stones")), this.colourPicker(def.colors.map(([name, c]) => [name, c] as Swatch), o.color && o.color !== usual.color ? o.color : null, (c) => upd(t("editor.paving.stonesOfName", { name: o.name }), (x) => (x.color = c)), t(def.colors[0][0]))];
    }
    return [
      h("div", { class: "ed-sub" }, t("editor.paving.laidWith")),
      h("div", { class: "ed-chips" }, ...PAVING_ORDER.filter((k) => k !== "gravel").map((k) => h("button", { class: `ed-chip${k === look.material ? " on" : ""}`, onclick: () => k !== look.material && upd(t("editor.paving.tForName", { t: t(PAVING[k].label), name: o.name }), (x) => {
        x.paving = k;
        x.pattern = x.unit = x.color = x.joint = null;
        if (x.kind === "driveway") x.surface = null;
      }) }, h("i", { style: `background:${PAVING[k].colors[0][1]}` }), t(PAVING[k].label)))),
      h("div", { class: "ed-sub" }, t("editor.colour")),
      this.colourPicker(def.colors.map(([name, c]) => [name, c] as Swatch), o.color && o.color !== usual.color ? o.color : null, (c) => upd(t("editor.colourOfName", { name: o.name }), (x) => (x.color = c)),
        ((k) => (k ? t(k) : t("editor.usual")))(def.colors.find(([, c]) => c === usual.color)?.[0])),
      def.patterns.length > 1 ? h("div", { class: "ed-sub" }, t("editor.paving.pattern")) : null,
      def.patterns.length > 1 ? h("div", { class: "ed-chips" }, ...def.patterns.map((k) => chip(t(PATTERN_NAMES[k]), look.pattern === k, () => upd(t("editor.paving.tPatternForName", { t: t(PATTERN_NAMES[k]), name: o.name }), (x) => (x.pattern = k))))) : null,
      sized && def.sizes.length > 1 ? h("div", { class: "ed-sub" }, t("editor.paving.sizeMm")) : null,
      sized && def.sizes.length > 1 ? h("div", { class: "ed-chips" }, ...def.sizes.map((k) => chip(k.replace("x", " × "), unit === k, () => upd(t("editor.paving.kUnitsForName", { k, name: o.name }), (x) => (x.unit = k))))) : null,
      def.joint > 0 ? h("div", { class: "ed-sub" }, t("editor.paving.joints")) : null,
      def.joint > 0 ? this.colourPicker(JOINT_SWATCHES, o.joint, (c) => upd(t("editor.paving.jointsOfName", { name: o.name }), (x) => (x.joint = c)), t("editor.usual")) : null,
      look.pattern !== "plain" && look.pattern !== "crazy" ? this.directionRow(o, upd) : null,
      look.material !== "gravel" ? h("div", { class: "ed-sub" }, t("editor.paving.border")) : null,
      look.material !== "gravel" ? h("div", { class: "ed-chips" },
        chip(t("editor.none"), !border, () => upd(t("editor.paving.noBorderRoundName", { name: o.name }), (x) => (x.border = null))),
        ...BORDER_MATERIALS.map((k) => chip(t(PAVING[k].label), border === k, () => upd(t("editor.paving.tBorderRoundName", { t: t(PAVING[k].label), name: o.name }), (x) => {
          x.border = k;
          x.border_color = null;
        })))) : null,
      border ? this.colourPicker(PAVING[border].colors.map(([name, c]) => [name, c] as Swatch), o.border_color, (c) => upd(t("editor.paving.borderColourOfName", { name: o.name }), (x) => (x.border_color = c)), t(PAVING[border].colors[0][0])) : null,
    ];
  }

  /** Which way the pattern or the boards run, from the area's longest edge. */
  private directionRow(o: OutdoorArea, upd: (label: string, fn: (x: OutdoorArea) => void) => void): HTMLElement {
    const a = o.angle ?? 0;
    const chip = (label: string, v: number) => h("button", { class: `ed-chip${Math.abs(a - v) < 0.01 ? " on" : ""}`, onclick: () => upd(t("editor.direction.layNameLowercase", { name: o.name, lowerCase: label.toLowerCase() }), (x) => (x.angle = v || null)) }, label);
    return h("div", { class: "ed-row" }, h("label", {}, t("editor.direction.runs")), chip(t("editor.direction.along"), 0), chip(t("editor.direction.diagonal"), 45), chip(t("editor.across"), 90),
      h("input", { class: "ed-in num", type: "number", step: "5", value: String(a), title: t("editor.direction.degreesFromTheLongest"), onchange: (e: Event) => {
        const v = Number((e.target as HTMLInputElement).value);
        upd(t("editor.direction.turnThePatternOf", { name: o.name }), (x) => (x.angle = isFinite(v) && v ? ((v % 180) + 180) % 180 : null));
      } }));
  }

  /** A deck's boards: material, colour, width, direction and a picture frame round the edge. */
  private deckRows(o: OutdoorArea, upd: (label: string, fn: (x: OutdoorArea) => void) => void): (HTMLElement | null)[] {
    const look = deckLook(o);
    const def = DECK_BOARDS[look.boards];
    const chip = (label: string, on: boolean, onclick: () => void) => h("button", { class: `ed-chip${on ? " on" : ""}`, onclick: () => !on && onclick() }, label);
    return [
      h("div", { class: "ed-sub" }, t("editor.deck.boards")),
      h("div", { class: "ed-chips" }, ...DECK_ORDER.map((k) => h("button", { class: `ed-chip${k === look.boards ? " on" : ""}`, onclick: () => k !== look.boards && upd(t("editor.deck.tBoardsOnName", { t: t(DECK_BOARDS[k].label), name: o.name }), (x) => {
        x.boards = k;
        x.color = x.board_width = null;
      }) }, h("i", { style: `background:${DECK_BOARDS[k].colors[0][1]}` }), t(DECK_BOARDS[k].label)))),
      h("div", { class: "ed-sub" }, t("editor.colour")),
      this.colourPicker(def.colors, o.color && o.color !== def.colors[0][1] ? o.color : null, (c) => upd(t("editor.colourOfName", { name: o.name }), (x) => (x.color = c)), t(def.colors[0][0])),
      h("div", { class: "ed-row" }, h("label", {}, t("editor.deck.boardsMm")), ...def.widths.map((w) => chip(String(w), look.width === w, () => upd(t("editor.deck.wMmBoardsOn", { w, name: o.name }), (x) => (x.board_width = w))))),
      this.directionRow(o, upd),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: o.border === "frame", onchange: (e: Event) => upd(t("editor.deck.pictureFrameRoundName", { name: o.name }), (x) => (x.border = (e.target as HTMLInputElement).checked ? "frame" : null)) }),
        ` ${t("editor.deck.pictureFrameBoardsAlong")}`),
    ];
  }

  /** A patio or deck off the ground: how high, what its sides are, steps down from its open edges, a railing. */
  private raisedRows(fi: number, o: OutdoorArea, upd: (label: string, fn: (x: OutdoorArea) => void) => void): (HTMLElement | null)[] {
    const deck = o.kind === "deck";
    const raised = isRaised(o);
    const chip = (label: string, on: boolean, onclick: () => void, title = "") => h("button", { class: `ed-chip${on ? " on" : ""}`, title, onclick: () => !on && onclick() }, label);
    const heights: [number | null, string][] = deck
      ? [[null, t("editor.raised.levelWithTheFloor")], [0.05, t("editor.raised.onTheGround")], [0.3, "0.3"], [0.45, "0.45"], [0.6, "0.6"], [0.9, "0.9"]]
      : [[null, t("editor.raised.onTheGround")], [0.15, "0.15"], [0.3, "0.3"], [0.45, "0.45"], [0.6, "0.6"], [0.9, "0.9"]];
    const cur = o.height ?? null;
    const f = this.plan.floors[fi];
    const open = openEdges(f, o, this.plan.settings.wall_exterior);
    const turn = turnOf(o.points);
    const north = this.plan.settings.north ?? 0;
    const steps = o.steps ?? [];
    const railings: FenceStyle[] = ["balustrade", "glass", "railings", "post_rail", "slatted", "picket"];
    const rows: (HTMLElement | null)[] = [
      h("div", { class: "ed-sub" }, deck ? t("editor.raised.heightM") : t("editor.raised.raisedM")),
      h("div", { class: "ed-chips" }, ...heights.map(([v, label]) => chip(label, cur === v || (v !== null && cur !== null && Math.abs(cur - v) < 0.001), () => upd(t("editor.raised.heightOfName", { name: o.name }), (x) => (x.height = v)))),
        h("input", { class: "ed-in num", type: "number", step: "0.05", min: "0", value: cur === null ? "" : String(cur), placeholder: "m", onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          upd(t("editor.raised.heightOfName", { name: o.name }), (x) => (x.height = v === "" ? null : Math.max(0, Math.min(3, Number(v)))));
        } })),
    ];
    if (!raised) return rows;
    if (!deck) {
      rows.push(h("div", { class: "ed-row" }, h("label", {}, t("editor.raised.sides")), ...Object.entries(RAISED_WALLS).map(([k, key]) =>
        chip(t(key), (o.walls ?? "brick") === k, () => upd(t("editor.raised.tSidesOnName", { t: t(key), name: o.name }), (x) => (x.walls = k as RaisedWall))))));
    }
    rows.push(h("div", { class: "ed-sub" }, t("editor.raised.stepsDown")));
    o.points.forEach((_, i) => {
      if (!open[i]) return;
      const e = edgeOf(o.points, i, turn);
      const facing = compassName(north + (Math.atan2(e.out[0], -e.out[1]) * 180) / Math.PI);
      const s = steps.find((x) => x.edge === i);
      rows.push(h("div", { class: "ed-row" },
        h("label", {}, t("editor.raised.facingSide", { facing })), h("small", {}, `${e.len.toFixed(1)} m`),
        h("button", { class: `ed-chip${s ? " on" : ""}`, title: s ? t("editor.raised.takeThemOff") : t("editor.raised.addStepsHere"), onclick: () => upd(s ? t("editor.raised.takeTheStepsOff", { name: o.name }) : t("editor.raised.stepsDownFromName", { name: o.name }), (x) => {
          x.steps = s ? (x.steps ?? []).filter((y) => y.edge !== i) : [...(x.steps ?? []), { edge: i, width: Math.min(e.len, 1.2) }];
        }) }, t("editor.raised.steps")),
        s ? h("input", { class: "ed-in num", type: "number", step: "0.1", min: "0.6", value: String(s.width ?? e.len.toFixed(2)), title: t("editor.raised.widthOfTheSteps"), onchange: (ev: Event) => {
          const v = Number((ev.target as HTMLInputElement).value);
          upd(t("editor.raised.widthOfTheStepsOf", { name: o.name }), (x) => {
            const y = x.steps?.find((z) => z.edge === i);
            if (y) y.width = isFinite(v) && v > 0 ? Math.max(0.6, Math.min(e.len, v)) : null;
          });
        } }) : null,
      ));
    });
    rows.push(
      h("div", { class: "ed-sub" }, t("editor.raised.railing")),
      h("div", { class: "ed-chips" }, chip(t("editor.none"), !o.railing, () => upd(t("editor.raised.noRailingRoundName", { name: o.name }), (x) => (x.railing = null))),
        ...railings.map((k) => chip(t(FENCE_STYLES[k].label), o.railing === k, () => upd(t("editor.raised.tRailingRoundName", { t: t(FENCE_STYLES[k].label), name: o.name }), (x) => (x.railing = k))))),
    );
    return rows;
  }

  /** The size of a rectangular or round area, to type in. */
  private areaSizeRows(o: OutdoorArea, upd: (label: string, fn: (x: OutdoorArea) => void) => void): HTMLElement[] {
    const round = roundness(o.points);
    const num = (value: number, title: string, onSet: (v: number) => void) => h("input", { class: "ed-in num", type: "number", step: "0.1", min: "0.5", value: value.toFixed(2), title, onchange: (e: Event) => {
      const v = Number((e.target as HTMLInputElement).value);
      if (isFinite(v) && v >= 0.5) onSet(v);
    } });
    if (round) {
      return [h("div", { class: "ed-row" }, h("label", {}, t("editor.areaSize.acrossM")), num(round.radius * 2, t("editor.areaSize.diameter"), (v) => upd(t("editor.areaSize.resizeName", { name: o.name }), (x) => (x.points = circlePoints(round.centre, v / 2, x.points.length)))))];
    }
    const rect = rectSides(o.points);
    if (!rect) return [];
    return [h("div", { class: "ed-row" },
      h("label", {}, t("editor.areaSize.sizeM")),
      num(rect[0], t("editor.areaSize.alongItsFirstEdge"), (v) => upd(t("editor.areaSize.resizeName", { name: o.name }), (x) => (x.points = resizeRect(x.points, 0, v)))),
      h("span", {}, "×"),
      num(rect[1], t("editor.areaSize.alongItsSecondEdge"), (v) => upd(t("editor.areaSize.resizeName", { name: o.name }), (x) => (x.points = resizeRect(x.points, 1, v)))),
    )];
  }

  private fencePanel(fi: number, fence: Fence | undefined): HTMLElement {
    if (!fence) return h("div", {});
    const def = fenceStyle(fence.style);
    const upd = (label: string, fn: (x: Fence) => void) => this.change((p) => fn(p.floors[fi].fences!.find((y) => y.id === fence.id)!), false, label);
    const len = fenceLength(fence);
    const gates = fence.gates ?? [];
    const num = (value: number | null | undefined, placeholder: string, step: string, onSet: (v: number | null) => void, title = "") =>
      h("input", { class: "ed-in num", type: "number", step, min: "0", value: value ? String(value) : "", placeholder, title, onchange: (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        onSet(v === "" ? null : Number(v));
      } });
    const posts: [FencePost, string][] = [["timber", "timber"], ["concrete", "concrete"], ["metal", "metal"], ["pier", t("editor.fence.brickPiers")]];
    // a new gate goes in the middle of the longest stretch without one
    const freeSpot = (width: number) => {
      const taken = gates.map((g) => [g.at - g.width / 2, g.at + g.width / 2]).sort((a, b) => a[0] - b[0]);
      let best = { at: len / 2, room: -1 }, cur = 0;
      for (const [a, b] of [...taken, [len, len]]) {
        if (a - cur > best.room) best = { at: (cur + a) / 2, room: a - cur };
        cur = Math.max(cur, b);
      }
      return Math.round(Math.max(width / 2, Math.min(len - width / 2, best.at)) * 100) / 100;
    };
    return h("div", {},
      h("h4", {}, t("editor.nameFence", { name: t(def.label) })),
      h("p", { class: "ed-hint" }, t("editor.fence.fixedMLongDrag", { fixed: len.toFixed(1) })),
      h("div", { class: "ed-sub" }, t("editor.style")),
      h("div", { class: "ed-chips" }, ...FENCE_ORDER.map((k) => h("button", { class: `ed-chip${k === fence.style ? " on" : ""}`, onclick: () => k !== fence.style && upd(t("editor.fence.fenceName", { name: t(FENCE_STYLES[k].label) }), (x) => {
        // the new style's usual height, unless the height was picked
        if (Math.abs(x.height - def.height) < 0.001) x.height = FENCE_STYLES[k].height;
        if (x.color && x.color === def.color) x.color = null;
        x.style = k as FenceStyle;
        x.posts = null;
        x.spacing = null;
      }) }, t(FENCE_STYLES[k].label)))),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.fence.heightM")),
        num(fence.height, String(def.height), "0.05", (v) => upd(t("editor.fence.fenceHeight"), (x) => (x.height = Math.max(0.3, Math.min(3, v ?? def.height))))),
        ...[0.9, 1.2, 1.5, 1.8, 2.0].map((v) => h("button", { class: `ed-chip${Math.abs(fence.height - v) < 0.001 ? " on" : ""}`, onclick: () => upd(t("editor.fence.fenceHeight"), (x) => (x.height = v)) }, `${v.toFixed(1)}`)),
      ),
      def.paint.length ? h("div", { class: "ed-sub" }, t("editor.colour")) : null,
      def.paint.length ? this.colourPicker(FENCE_SWATCHES, fence.color, (c) => upd(t("editor.fence.fenceColour"), (x) => (x.color = c)), def.color ? t("editor.usual") : t("editor.fence.natural")) : null,
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.fence.posts")),
        this.dropdown(posts, fence.posts ?? "", (v) => upd(t("editor.fence.fencePosts"), (x) => (x.posts = (v || null) as FencePost | null)), `usual (${def.posts === "pier" ? t("editor.fence.brickPiers") : def.posts})`),
        h("label", {}, t("editor.fence.everyM")),
        num(fence.spacing, String(def.spacing), "0.05", (v) => upd(t("editor.fence.postSpacing"), (x) => (x.spacing = v && v >= 0.6 ? v : null)), t("editor.fence.distanceBetweenPosts")),
      ),
      def.timber ? h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: fence.gravel_board ?? def.gravel, onchange: (e: Event) => upd(t("editor.fence.gravelBoard"), (x) => (x.gravel_board = (e.target as HTMLInputElement).checked)) }),
        ` ${t("editor.fence.concreteGravelBoardAlong")}`) : null,
      def.timber && fence.style !== "trellis" ? h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: fence.topper === "trellis", onchange: (e: Event) => upd(t("editor.fence.trellisTopper"), (x) => (x.topper = (e.target as HTMLInputElement).checked ? "trellis" : null)) }),
        ` ${t("editor.fence.trellisOnTop30")}`) : null,
      h("div", { class: "ed-sub" }, t("editor.fence.gatesN", { n: gates.length })),
      ...gates.map((g, gi) => h("div", { class: "ed-row" },
        h("label", {}, t("editor.fence.atM")),
        num(g.at, "", "0.1", (v) => upd(t("editor.fence.moveAGate"), (x) => (x.gates![gi].at = Math.max(g.width / 2, Math.min(len - g.width / 2, v ?? g.at)))), t("editor.fence.itsMiddleFromThe")),
        h("label", {}, t("editor.fence.wide")),
        num(g.width, "", "0.05", (v) => upd(t("editor.fence.gateWidth"), (x) => (x.gates![gi].width = Math.max(0.5, Math.min(6, v ?? g.width))))),
        h("button", { class: `ed-chip${g.double ? " on" : ""}`, title: t("editor.fence.twoLeavesMeetingIn"), onclick: () => upd(t("editor.fence.gateLeaves"), (x) => (x.gates![gi].double = !g.double)) }, t("editor.fence.double")),
        h("button", { class: "ed-ib small", title: t("editor.fence.removeTheGate"), html: svg(mdiDelete), onclick: () => upd(t("editor.fence.removeAGate"), (x) => (x.gates = x.gates!.filter((_, k) => k !== gi))) }),
      )),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => upd(t("editor.fence.addAGate"), (x) => (x.gates = [...(x.gates ?? []), { at: freeSpot(0.9), width: 0.9 }])) }, t("editor.fence.addAGate")),
        h("button", { class: "ed-btn ghost small", onclick: () => upd(t("editor.fence.addADrivewayGate"), (x) => (x.gates = [...(x.gates ?? []), { at: freeSpot(3), width: 3, double: true }])) }, t("editor.fence.addADrivewayGate")),
      ),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => {
          const id = newId("fence");
          this.change((p) => {
            const fl = p.floors[fi];
            fl.fences = [...(fl.fences ?? []), { ...structuredClone(fence), id, points: fence.points.map(([px, pz]) => [px + 0.5, pz + 0.5] as Vec2) }];
          }, false, t("editor.fence.duplicateAFence"));
          this.select({ floor: fi, kind: "fence", id });
        } }, t("editor.duplicate")),
        h("button", { class: "ed-btn danger", onclick: () => {
          this.change((p) => (p.floors[fi].fences = (p.floors[fi].fences ?? []).filter((x) => x.id !== fence.id)), false, t("editor.fence.removeAFence"));
          this.select(null);
        } }, t("editor.remove")),
      ),
    );
  }

  /**
   * A fence along a garden area's edges, leaving out those along the house: round a lawn a timber
   * fence, round a patio or deck glass, round a front garden or driveway a low brick wall.
   */
  private fenceRound(fi: number, o: OutdoorArea): void {
    const f = this.plan.floors[fi];
    const reach = this.plan.settings.wall_exterior / 2 + 0.35;
    const walls = f.rooms.flatMap((r) => r.points.map((a, i) => [a, r.points[(i + 1) % r.points.length]] as [Vec2, Vec2]));
    const n = o.points.length;
    const kept = o.points.map((a, i) => {
      const b = o.points[(i + 1) % n];
      const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      return !walls.some(([p, q]) => segmentDistance(mid, p, q).d < reach);
    });
    const runs: Vec2[][] = [];
    if (kept.every(Boolean)) runs.push([...o.points, o.points[0]]);
    else {
      const start = kept.indexOf(false);
      let run: Vec2[] = [];
      for (let k = 1; k <= n; k++) {
        const i = (start + k) % n;
        if (kept[i]) {
          if (!run.length) run.push(o.points[i]);
          run.push(o.points[(i + 1) % n]);
        } else if (run.length) {
          runs.push(run);
          run = [];
        }
      }
      if (run.length) runs.push(run);
    }
    if (!runs.length) {
      this.status.textContent = t("editor.fence.everyEdgeOfIt");
      return;
    }
    const style: FenceStyle = o.kind === "patio" || o.kind === "deck" ? "glass" : o.kind === "driveway" || o.kind === "path" ? "brick_wall" : "closeboard";
    const made = runs.map((points) => ({ id: newId("fence"), points: points.map(([x, z]) => [x, z] as Vec2), style, height: FENCE_STYLES[style].height, gates: [] }) as Fence);
    this.change((p) => {
      const fl = p.floors[fi];
      fl.fences = [...(fl.fences ?? []), ...made];
    }, false, t("editor.fence.fenceRoundName", { name: o.name }));
    this.select({ floor: fi, kind: "fence", id: made[0].id });
  }

  private devicePanel(fi: number, d: Device | undefined): HTMLElement {
    if (!d) return h("div", {});
    const all = this.entities(() => true);
    const upd = (fn: (x: Device) => void) => this.change((p) => fn(p.floors[fi].devices.find((y) => y.id === d.id)!));
    const floor = this.plan.floors[fi];
    const rig = domainOf(d.entity) === "camera" ? cameraRig(floor, layoutWalls(floor, this.plan.settings), d) : null;
    return h("div", {},
      h("h4", {}, String(this.hass.states[d.entity]?.attributes.friendly_name ?? d.entity)),
      h("div", { class: "ed-row" }, h("label", {}, t("editor.device.entity")), this.entityInput(all, d.entity, (v) => upd((x) => (x.entity = v)))),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.device.mount")),
        this.dropdown([["ceiling", "ceiling"], ["wall", "wall"], ["floor", "floor"], ["table", "table"]], d.mount ?? "", (v) => upd((x) => (x.mount = (v || null) as Device["mount"])), "auto"),
        h("label", {}, t("editor.height")),
        h("input", { class: "ed-in num", type: "number", step: "0.1", value: d.y === null || d.y === undefined ? "" : String(d.y), placeholder: t("editor.auto"), onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          upd((x) => (x.y = v === "" ? null : Number(v)));
        } }),
      ),
      // a camera without a set direction looks away from its wall: turning starts from there
      this.turnRow((deg) => upd((x) => (x.rotation = ((x.rotation ?? rig?.heading ?? 0) + deg + 360) % 360))),
      rig ? h("div", { class: "ed-row" },
        h("label", {}, t("editor.device.view")),
        h("input", { class: "ed-in num", type: "number", step: "5", min: "20", max: "360", value: d.fov ? String(d.fov) : "", placeholder: String(rig.fov), title: t("editor.device.fieldOfViewIn"), onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          upd((x) => (x.fov = v === "" ? null : Math.max(20, Math.min(360, Number(v)))));
        } }),
        h("label", {}, t("editor.device.reachM")),
        h("input", { class: "ed-in num", type: "number", step: "0.5", min: "0.5", max: "30", value: d.reach ? String(d.reach) : "", placeholder: String(rig.reach), title: t("editor.device.howFarItSees"), onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          upd((x) => (x.reach = v === "" ? null : Math.max(0.5, Math.min(30, Number(v)))));
        } }),
      ) : null,
      rig ? h("p", { class: "ed-hint" }, t("editor.device.shownAsNameMount", { name: t(`camera.${rig.kind}`) })) : null,
      h("button", { class: "ed-btn danger", onclick: () => {
        this.change((p) => (p.floors[fi].devices = p.floors[fi].devices.filter((x) => x.id !== d.id)));
        this.select(null);
      } }, t("editor.removeFromPlan")),
    );
  }

  private furniturePanel(fi: number, x: Furniture | undefined): HTMLElement {
    if (!x) return h("div", {});
    const def = FURNITURE[x.type];
    const upd = (fn: (y: Furniture) => void) => this.change((p) => fn(p.floors[fi].furniture.find((y) => y.id === x.id)!));
    const chargers = this.host.view.energy.sources.ev;
    const linkable = def?.category === "lights"
      ? this.entities((id) => ["light", "switch"].includes(domainOf(id)))
      : EV_TYPES.has(x.type)
        ? chargers.map((c) => [c.status ?? c.power ?? c.level ?? "", c.name] as Swatch).filter(([id]) => id)
        : this.entities((id) => ["media_player", "switch", "binary_sensor"].includes(domainOf(id)));
    // a change of size, height, turn or side keeps the piece out of walls and other pieces
    const reshape = (label: string) => (fn: (y: Furniture) => void) => this.change((p) => {
      fn(p.floors[fi].furniture.find((y) => y.id === x.id)!);
      settle(p, fi, x.id);
    }, false, `${label} ${def ? t(def.label) : t("editor.item")}`);
    const num = (label: string, key: "w" | "d" | "h" | "y") =>
      [h("label", {}, label), h("input", {
        class: "ed-in num", type: "number", step: "0.05",
        // an empty height above the floor means the type's usual one (a wall cupboard's, a ceiling lamp's)
        value: key === "y" ? (x.y === null || x.y === undefined ? "" : String(x.y)) : String(x[key]), placeholder: key === "y" ? "auto" : "",
        onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          reshape(t("editor.furniture.resize"))((y) => {
            if (key === "y" && v === "") delete y.y;
            else y[key] = Number(v);
          });
        },
      })];
    const styles = styleOptions(x.type);
    const garden = x.type in GARDEN_OPTIONS || x.type === "metal_shed" || x.type === "greenhouse";
    const finish = x.finish ?? def?.finish ?? "fabric";
    const named = (label: string) => (fn: (y: Furniture) => void) => this.change((p) => fn(p.floors[fi].furniture.find((y) => y.id === x.id)!), false, `${label} ${def ? t(def.label) : t("editor.item")}`);
    return h("div", {},
      h("h4", {}, def ? t(def.label) : x.type),
      styles.length > 1 ? h("div", { class: "ed-sub" }, t("editor.style")) : null,
      styles.length > 1 ? h("div", { class: "ed-chips" }, ...styles.map((k) =>
        h("button", { class: `ed-chip${k === x.type ? " on" : ""}`, onclick: () => k !== x.type && this.swapType(fi, x, k) }, t(FURNITURE[k].label)))) : null,
      h("div", { class: "ed-sub" }, t("editor.colour")),
      this.colourPicker(garden ? FENCE_SWATCHES : FURNITURE_SWATCHES, x.color, (c) => named(t("editor.furniture.recolour"))((y) => (y.color = c)), t("editor.original")),
      isUpholstered(x.type) ? h("div", { class: "ed-sub" }, t("editor.furniture.upholstery")) : null,
      isUpholstered(x.type) ? this.finishChips(UPHOLSTERY, finish, (k) => named(t("editor.furniture.reupholster"))((y) => (y.finish = k as Furniture["finish"]))) : null,
      ...(def?.family === "stairs" ? this.balustradeRows(x, named) : []),
      ...(garden ? this.gardenRows(x, named) : []),
      garden ? null : h("div", { class: "ed-row" }, h("label", {}, EV_TYPES.has(x.type) ? t("editor.charger") : t("editor.furniture.linkedTo")),
        this.dropdown(linkable, x.entity ?? "", (v) => upd((y) => (y.entity = v || null)), EV_TYPES.has(x.type) ? (chargers.length ? t("editor.furniture.theHousesCharger") : t("editor.furniture.noneFound")) : t("editor.furniture.nothing"))),
      ...(CAR_TYPES.has(x.type) ? this.carRows(fi, x, reshape) : []),
      h("div", { class: "ed-row" }, ...num(t("editor.houses.width"), "w"), ...num(t("editor.houses.depth"), "d")),
      h("div", { class: "ed-row" }, ...num(t("editor.height"), "h"), ...num(t("editor.furniture.aboveFloor"), "y")),
      this.turnRow((deg) => reshape(t("editor.turn"))((y) => (y.rotation = Math.round(((y.rotation + deg) % 360 + 360) % 360))),
        h("button", { class: `ed-ib${x.mirror ? " on" : ""}`, title: t("editor.furniture.mirror"), html: svg(mdiFlipHorizontal), onclick: () => reshape(t("editor.furniture.mirror"))((y) => (y.mirror = !y.mirror)) })),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => {
          const id = newId("f");
          this.change((p) => {
            p.floors[fi].furniture.push({ ...structuredClone(x), id, x: x.x + 0.3, z: x.z + 0.3 });
            settle(p, fi, id);
          }, false, t("editor.furniture.duplicateX", { x: def ? t(def.label) : t("editor.item") }));
        } }, t("editor.duplicate")),
        h("button", { class: "ed-btn danger", onclick: () => {
          this.change((p) => (p.floors[fi].furniture = p.floors[fi].furniture.filter((y) => y.id !== x.id)));
          this.select(null);
        } }, t("editor.remove")),
      ),
    );
  }

  /** Garden buildings and planters: a pergola's top, a shed's roof, door, windows and trim, a planter's material and plants. */
  private gardenRows(x: Furniture, named: (label: string) => (fn: (y: Furniture) => void) => void): (HTMLElement | null)[] {
    const o = GARDEN_OPTIONS[x.type] ?? {};
    const c = gardenChoice(x.type, x);
    const def = FURNITURE[x.type];
    const chips = <T extends string>(title: string, list: T[] | undefined, names: Record<T, PlainKey>, cur: T | null, label: string, set: (y: Furniture, v: T) => void) =>
      list && list.length > 1 ? [h("div", { class: "ed-sub" }, title), h("div", { class: "ed-chips" }, ...list.map((k) => h("button", {
        class: `ed-chip${cur === k ? " on" : ""}`, onclick: () => cur !== k && named(label)((y) => set(y, k)),
      }, t(names[k] as PlainKey))))] : [];
    const [most] = o.windows ?? [0, 0];
    return [
      ...chips(t("editor.garden.top"), o.canopies, CANOPY_NAMES, c.canopy, t("editor.garden.topOf"), (y, v) => (y.canopy = v)),
      ...chips(t("editor.roof"), o.roofings, ROOFING_NAMES, c.roofing, t("editor.garden.roofOf"), (y, v) => (y.roofing = v)),
      ...chips(t("editor.door"), o.doors, DOOR_NAMES, c.door, t("editor.garden.doorOf"), (y, v) => (y.door = v)),
      most ? h("div", { class: "ed-row" }, h("label", {}, t("editor.garden.windows")), ...Array.from({ length: most + 1 }, (_, n) => h("button", {
        class: `ed-chip${c.windows === n ? " on" : ""}`, onclick: () => c.windows !== n && named(t("editor.garden.windowsOf"))((y) => (y.windows = n)),
      }, n ? String(n) : t("editor.none")))) : null,
      def?.trim ? h("div", { class: "ed-sub" }, t("editor.garden.trim")) : null,
      def?.trim ? this.colourPicker(FENCE_SWATCHES, x.trim, (c) => named(t("editor.garden.trimColourOf"))((y) => (y.trim = c)), t("editor.original")) : null,
      ...chips(t("editor.garden.madeOf"), o.material ? (Object.keys(PLANTER_MATERIALS) as PlanterMaterial[]) : undefined,
        Object.fromEntries(Object.entries(PLANTER_MATERIALS).map(([k, m]) => [k, m.label])) as Record<PlanterMaterial, PlainKey>, c.material, t("editor.garden.materialOf"), (y, v) => (y.material = v)),
      ...chips(t("editor.garden.planting"), o.plants ? (Object.keys(PLANTING_NAMES) as Planting[]) : undefined, PLANTING_NAMES, c.plants, t("editor.garden.plantingIn"), (y, v) => (y.plants = v)),
    ];
  }

  /** Stairs: the balustrade's style, what it is made of, and which side it is on. */
  private balustradeRows(x: Furniture, named: (label: string) => (fn: (y: Furniture) => void) => void): (HTMLElement | null)[] {
    const style = x.balustrade ?? "none";
    const material = x.balustrade_material ?? (style === "none" ? "primed" : BALUSTRADE_DEFAULT[style]);
    const side = x.balustrade_side ?? "right";
    const chip = (label: string, on: boolean, onclick: () => void) => h("button", { class: `ed-chip${on ? " on" : ""}`, onclick: () => !on && onclick() }, label);
    const sides: [NonNullable<Furniture["balustrade_side"]>, string][] = [["left", t("editor.houses.left")], ["right", t("editor.houses.right")], ["both", t("editor.balustrade.both")]];
    return [
      h("div", { class: "ed-sub" }, t("editor.balustrade.balustrade")),
      h("div", { class: "ed-chips" }, ...Object.entries(BALUSTRADES).map(([k, name]) =>
        chip(t(name), style === k, () => named(k === "none" ? t("editor.balustrade.noBalustradeOn") : t("editor.balustrade.nameBalustradeOn", { name: t(name) }))((y) => (y.balustrade = k as BalustradeStyle))))),
      style !== "none" ? h("div", { class: "ed-sub" }, style === "glass" ? t("editor.balustrade.handrailAndPosts") : t("editor.balustrade.material")) : null,
      style !== "none" ? h("div", { class: "ed-chips" }, ...Object.entries(BALUSTRADE_MATERIALS).map(([k, m]) =>
        h("button", { class: `ed-chip${material === k ? " on" : ""}`, onclick: () => material !== k && named(t("editor.balustrade.nameBalustradeOn", { name: t(m.label) }))((y) => (y.balustrade_material = k as BalustradeMaterial)) },
          h("i", { style: `background:${hexOf(m.color)}` }), t(m.label)))) : null,
      style !== "none" ? h("div", { class: "ed-row" }, h("label", {}, t("editor.balustrade.sideGoingUp")),
        ...sides.map(([k, label]) => chip(label, side === k, () => named(t("editor.balustrade.moveTheBalustradeOf"))((y) => (y.balustrade_side = k))))) : null,
    ];
  }

  /** A door, window or opening: kind, style, finish, size, which way it opens, and what it is linked to. */
  private openingPanel(fi: number, o: Opening | undefined): HTMLElement {
    if (!o) return h("div", {});
    const upd = (label: string, fn: (x: Opening) => void) => this.change((p) => fn(p.floors[fi].openings.find((y) => y.id === o.id)!), false, label);
    const contacts = this.entities((id, st) => domainOf(id) === "binary_sensor" && ["door", "window", "opening", "garage_door"].includes(String(st.attributes.device_class)));
    const covers = this.entities((id) => domainOf(id) === "cover");
    const room = this.plan.floors[fi].rooms.find((r) => r.id === o.room_id);
    const num = (label: string, key: "width" | "height" | "sill" | "offset", step = "0.05") =>
      [h("label", {}, label), h("input", { class: "ed-in num", type: "number", step, min: "0", value: String(o[key]), onchange: (e: Event) => upd(t("editor.opening.changeKindName", { kind: o.kind, name: label.toLowerCase() }), (x) => (x[key] = Math.max(0, Number((e.target as HTMLInputElement).value)))) })];
    const names: Record<Opening["kind"], string> = { door: t("editor.door"), window: t("editor.opening.window"), passage: t("editor.opening.opening"), garage: t("editor.opening.garageDoor") };
    const what = names[o.kind].toLowerCase();
    const styles = stylesFor(o.kind);
    const style = styleOf(o);
    const ctl = controlsFor(o);
    const finish = o.finish ?? defaultFinish(o.kind);
    const def: FinishDef = JOINERY_FINISHES[finish];
    const chip = (label: string, on: boolean, onclick: () => void) => h("button", { class: `ed-chip${on ? " on" : ""}`, onclick: () => !on && onclick() }, label);
    return h("div", {},
      h("h4", {}, `${names[o.kind]}${room ? ` · ${room.name}` : ""}`),
      h("div", { class: "ed-chips" }, ...(["door", "window", "passage", "garage"] as Opening["kind"][]).map((k) =>
        chip(names[k], o.kind === k, () => upd(t("editor.opening.makeItAName", { name: names[k].toLowerCase() }), (x) => {
          x.kind = k;
          x.style = null; // styles differ between kinds
          if (k === "window" && x.sill < 0.3) x.sill = 0.9;
          if (k !== "window") x.sill = 0;
        })))),
      styles ? h("div", { class: "ed-sub" }, t("editor.style")) : null,
      styles ? h("div", { class: "ed-chips" }, ...Object.entries(styles).map(([k, name]) =>
        chip(t(name), style === k, () => upd(`${t(name)} ${what}`, (x) => (x.style = k as Opening["style"]))))) : null,
      styles ? h("div", { class: "ed-sub" }, o.kind === "window" ? t("editor.opening.frame") : t("editor.opening.finish")) : null,
      styles ? this.finishChips(JOINERY_FINISHES, finish, (k) => upd(t("editor.opening.finishOf", { finish: t(JOINERY_FINISHES[k as keyof typeof JOINERY_FINISHES].label), what }), (x) => (x.finish = k as Opening["finish"]))) : null,
      styles && def.tintable
        ? this.colourPicker(JOINERY_SWATCHES, o.color, (c) => upd(t("editor.opening.colourOfAWhat", { what }), (x) => (x.color = c)), finish === "aluminium" ? t("editor.opening.silver") : t("editor.white"))
        : null,
      styles ? h("div", { class: "ed-row" },
        ctl.bars ? chip(t("editor.opening.plainGlass"), !o.bars, () => upd(t("editor.opening.plainGlassInA", { what }), (x) => (x.bars = false))) : null,
        ctl.bars ? chip(t("editor.opening.glazingBars"), !!o.bars, () => upd(t("editor.opening.glazingBarsOnA", { what }), (x) => (x.bars = true))) : null,
        // the whole look: style, finish, colour and glazing bars (hinge, swing and size stay each one's own)
        h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
          for (const fl of p.floors) for (const x of fl.openings) {
            if (x.kind !== o.kind) continue;
            x.style = o.style ?? null;
            x.finish = o.finish ?? null;
            x.color = o.color ?? null;
            x.bars = !!o.bars;
          }
        }, false, t("editor.opening.sameStyleOnEvery", { what })) }, t("editor.opening.sameStyleOnEvery", { what })),
      ) : null,
      h("div", { class: "ed-row" }, ...num(t("editor.houses.width"), "width"), ...num(t("editor.height"), "height")),
      h("div", { class: "ed-row" }, ...(o.kind === "window" ? num(t("editor.opening.sill"), "sill") : []), ...num(t("editor.opening.fromCorner"), "offset")),
      ctl.swing ? h("div", { class: "ed-row" },
        h("label", {}, t("editor.opening.opens")),
        chip(t("editor.opening.inwards"), o.swing !== "out", () => upd(t("editor.opening.openAWhatInwards", { what }), (x) => (x.swing = "in"))),
        chip(t("editor.opening.outwards"), o.swing === "out", () => upd(t("editor.opening.openAWhatOutwards", { what }), (x) => (x.swing = "out"))),
      ) : null,
      ctl.side ? h("div", { class: "ed-row" },
        h("label", {}, t("editor.opening.hangs")),
        chip(room ? t("editor.opening.inName", { name: room.name }) : t("editor.opening.inside"), o.swing !== "out", () => upd(t("editor.opening.hangAWhatInside", { what }), (x) => (x.swing = "in"))),
        chip(room ? t("editor.opening.outsideName", { name: room.name }) : t("editor.outside"), o.swing === "out", () => upd(t("editor.opening.hangAWhatOutside", { what }), (x) => (x.swing = "out"))),
      ) : null,
      ctl.hinge || ctl.slide ? h("div", { class: "ed-row" },
        ctl.hinge ? h("button", { class: "ed-btn ghost small", onclick: () => upd(t("editor.opening.flipAWhatS", { what }), (x) => (x.hinge = x.hinge === "right" ? "left" : "right")) }, t("editor.flipHinge")) : null,
        ctl.slide ? h("button", { class: "ed-btn ghost small", onclick: () => upd(t("editor.opening.slideAWhatThe", { what }), (x) => (x.hinge = x.hinge === "right" ? "left" : "right")) }, t("editor.opening.slideTheOtherWay")) : null,
      ) : null,
      h("div", { class: "ed-row" }, h("label", {}, t("editor.sensor")), this.dropdown(contacts, o.entity ?? "", (v) => upd(t("editor.opening.linkASensor"), (x) => (x.entity = v || null)), t("editor.none"))),
      o.kind !== "passage" && style !== "fixed" ? h("p", { class: "ed-hint" }, t("editor.opening.theWhatOpensIn", { what })) : null,
      o.kind === "window" ? h("div", { class: "ed-row" }, h("label", {}, t("editor.blind")), this.dropdown(covers, o.cover ?? "", (v) => upd(t("editor.opening.linkABlind"), (x) => (x.cover = v || null)), t("editor.none"))) : null,
      h("button", { class: "ed-btn danger", onclick: () => {
        this.change((p) => (p.floors[fi].openings = p.floors[fi].openings.filter((x) => x.id !== o.id)), false, t("editor.opening.removeAWhat", { what }));
        this.select(null);
      } }, t("editor.remove")),
    );
  }

  private turnRow(turn: (deg: number) => void, ...extra: HTMLElement[]): HTMLElement {
    return h("div", { class: "ed-row" },
      h("label", {}, t("editor.turn")),
      h("button", { class: "ed-ib", title: "-90°", html: svg(mdiRotateLeft), onclick: () => turn(-90) }),
      h("button", { class: "ed-btn ghost small", onclick: () => turn(-15) }, "-15°"),
      h("button", { class: "ed-btn ghost small", onclick: () => turn(15) }, "+15°"),
      h("button", { class: "ed-ib", title: "+90°", html: svg(mdiRotateRight), onclick: () => turn(90) }),
      ...extra,
    );
  }

  /** Swaps a piece for another style of the same kind, keeping where it stands and what it is linked to. */
  private swapType(fi: number, x: Furniture, type: string): void {
    const def = FURNITURE[type];
    this.change((p) => {
      const y = p.floors[fi].furniture.find((z) => z.id === x.id);
      if (!y) return;
      const [w, d, hh] = def.size;
      // a similar width is kept (a sofa that fits its wall); otherwise the new style's own size
      y.w = Math.abs(y.w - w) / w < 0.4 ? y.w : w;
      y.d = d;
      y.h = hh;
      y.type = type;
      if (def.y !== undefined) y.y = def.y;
      else delete y.y;
      if (def.finish && !y.finish) y.finish = def.finish;
      settle(p, fi, y.id);
    }, false, t("editor.furniture.changeToName", { name: t(def.label) }));
  }

  /** Named finishes as chips with their colour. */
  private finishChips(defs: Record<string, FinishDef>, current: string, onPick: (k: string) => void): HTMLElement {
    return h("div", { class: "ed-chips" }, ...Object.entries(defs).map(([k, d]) =>
      h("button", { class: `ed-chip${k === current ? " on" : ""}`, onclick: () => k !== current && onPick(k) },
        h("i", { style: `background:${hexOf(d.color)}` }), t(d.label))));
  }

  /** Colour swatches, any colour, or the default (null). */
  private colourPicker(swatches: Swatch[], current: string | null | undefined, onPick: (c: string | null) => void, defaultLabel = t("editor.colour.default")): HTMLElement {
    const cur = current?.toLowerCase() ?? null;
    const custom = h("input", { type: "color", value: cur ?? "#ffffff", onchange: (e: Event) => onPick((e.target as HTMLInputElement).value) });
    const isCustom = !!cur && !swatches.some(([, c]) => c === cur);
    return h("div", { class: "ed-swatches" },
      h("button", { class: `ed-sw none${!cur ? " on" : ""}`, title: defaultLabel, onclick: () => cur && onPick(null) }),
      ...swatches.map(([name, c]) => h("button", { class: `ed-sw${cur === c ? " on" : ""}`, title: t(name), style: `--c:${c}`, onclick: () => cur !== c && onPick(c) })),
      h("label", { class: `ed-sw custom${isCustom ? " on" : ""}`, title: t("editor.colour.anyColour"), style: isCustom ? `--c:${cur}` : "" }, custom),
    );
  }

  /** Search and categories over everything that can be placed (in a garden, the garden's things first). */
  private itemPicker(onAdd: (type: string) => void, garden = false): HTMLElement {
    const cats: (Category | "all")[] = ["all", ...CATEGORIES];
    const results = h("div", { class: "ed-grid" });
    const cat = () => (garden ? this.pickCatGarden : this.pickCat);
    const draw = () => {
      const q = this.pickQuery.trim().toLowerCase();
      const list = Object.entries(FURNITURE)
        .filter(([k, def]) => (cat() === "all" || def.category === cat()) && (!q || t(def.label).toLowerCase().includes(q) || k.includes(q.replace(/\s+/g, "_"))))
        .sort((a, b) => t(a[1].label).localeCompare(t(b[1].label)));
      results.replaceChildren(...list.slice(0, 80).map(([k, def]) =>
        h("button", { class: "ed-pick", title: t("editor.addName", { name: t(def.label) }), onclick: () => onAdd(k) }, h("span", { html: svg(mdiPlus) }), h("b", {}, t(def.label)), h("small", {}, t(`category.${def.category}`)))));
      if (!list.length) results.append(h("p", { class: "ed-hint" }, t("editor.picker.nothingMatches")));
    };
    const search = h("input", { class: "ed-in", placeholder: t("editor.picker.searchPlantSofaDumbbells"), value: this.pickQuery, oninput: (e: Event) => {
      this.pickQuery = (e.target as HTMLInputElement).value;
      draw();
    } });
    const chips = h("div", { class: "ed-chips scroll" }, ...cats.map((c) => h("button", { class: `ed-chip${cat() === c ? " on" : ""}`, onclick: (e: Event) => {
      if (garden) this.pickCatGarden = c;
      else this.pickCat = c;
      chips.querySelectorAll(".ed-chip").forEach((b) => b.classList.toggle("on", b === e.currentTarget));
      draw();
    } }, c === "all" ? t("editor.picker.all") : t(`category.${c}`))));
    draw();
    return h("div", {}, h("div", { class: "ed-search" }, h("span", { html: svg(mdiMagnify) }), search), chips, results);
  }

  // ------------------------------------------------------------------ roofs

  /** A roof and its storey by id. */
  private roofOf(p: Plan, id: string): { fi: number; roof: Roof } | null {
    for (const [fi, f] of p.floors.entries()) {
      const roof = (f.roofs ?? []).find((r) => r.id === id);
      if (roof) return { fi, roof };
    }
    return null;
  }

  /** Something on a roof by id, with its roof. */
  private roofItemOf(p: Plan, id: string): { fi: number; roof: Roof; item: RoofItem } | null {
    for (const [fi, f] of p.floors.entries()) {
      for (const roof of f.roofs ?? []) {
        const item = (roof.items ?? []).find((it) => it.id === id);
        if (item) return { fi, roof, item };
      }
    }
    return null;
  }

  private roofModelOf(fi: number, id: string): RoofModel | null {
    return floorRoofs(this.plan, fi).find((m) => m.roof.id === id) ?? null;
  }

  /** The Home tab's roofs: worked out from the plan, or the list of those there are. */
  private roofSection(): HTMLElement[] {
    const all = this.plan.floors.flatMap((f, fi) => (f.roofs ?? []).map((r) => ({ fi, r, f })));
    const chip = (label: string, on: boolean, onclick: () => void, title = "") => h("button", { class: `ed-chip${on ? " on" : ""}`, title, onclick: () => !on && onclick() }, label);
    const out: (HTMLElement | null)[] = [h("h4", {}, t("editor.roof"))];
    if (!all.length) {
      const seen = suggestRoofs(this.plan, {});
      const c = this.roofChoice;
      const kind = c.kind ?? seen.kind;
      const set = (patch: Partial<RoofChoice>) => {
        this.roofChoice = { ...c, ...patch };
        this.render();
      };
      const kinds: [HouseKind, string][] = [["detached", t("editor.roof.detached")], ["semi", t("editor.roof.semiDetached")], ["terrace", t("editor.roof.terraced")]];
      const shape = c.shape ?? (kind === "terrace" ? "gable" : "hip");
      const side = c.side ?? (seen.party === "left" ? "left" : "right");
      out.push(
        h("p", { class: "ed-hint" }, t("editor.roof.aRoofOverThe")),
        h("div", { class: "ed-sub" }, t("editor.roof.theHouse")),
        h("div", { class: "ed-chips" }, ...kinds.map(([k, name]) => chip(name + (k === seen.kind ? " ✓" : ""), kind === k, () => set({ kind: k }), k === seen.kind ? t("editor.roof.howItsWallsLook") : ""))),
        kind === "semi" ? h("div", { class: "ed-row" }, h("label", {}, t("editor.roof.joinedOnThe")),
          chip(t("editor.houses.left"), side === "left", () => set({ side: "left" })), chip(t("editor.houses.right"), side === "right", () => set({ side: "right" }))) : null,
        h("div", { class: "ed-sub" }, t("editor.roof.mainRoof")),
        h("div", { class: "ed-chips" }, ...(["hip", "gable", "half_hip", "dutch", "mansard", "gambrel", "pyramid", "m_shaped", "flat", "butterfly", "lean_to"] as RoofShape[]).map((k) =>
          chip(t(ROOF_SHAPES[k].label), shape === k, () => set({ shape: k }), t(ROOF_SHAPES[k].hint)))),
        h("div", { class: "ed-sub" }, t("editor.covering")),
        this.finishChips(ROOF_COVERINGS, c.covering ?? "concrete_tiles", (k) => set({ covering: k as RoofCovering })),
        h("button", { class: "ed-btn", onclick: () => this.addRoofs({ ...c, kind, side: kind === "semi" ? side : null, shape }) }, t("editor.addTheRoof")),
      );
      return out.filter((e): e is HTMLElement => !!e);
    }
    out.push(h("p", { class: "ed-hint" }, t("editor.roof.tapARoofIn")));
    for (const { fi, r, f } of all) {
      const items = r.items ?? [];
      const panels = items.filter((it) => it.kind === "solar").reduce((n, it) => n + (it.cols ?? 1) * (it.rows ?? 1), 0);
      out.push(h("div", { class: `ed-card ${this.sel?.id === r.id ? "on" : ""}`, onclick: () => this.select({ floor: fi, kind: "roof", id: r.id }) },
        h("div", { class: "ed-row" }, h("b", {}, t("editor.roof.xRoof", { x: (ROOF_SHAPES[r.shape] ? t(ROOF_SHAPES[r.shape].label) : r.shape) })),
          h("small", {}, ` ${t("editor.roof.nameFixedFixed2M", { name: f.name, fixed: r.w.toFixed(1), fixed2: r.d.toFixed(1), x: panels ? ` ${t("editor.roof.panelsPanels", { panels })}` : "", x2: items.length - (panels ? items.filter((it) => it.kind === "solar").length : 0) ? ` ${t("editor.roof.nMore", { n: items.filter((it) => it.kind !== "solar").length })}` : "" })}`)),
      ));
    }
    out.push(h("div", { class: "ed-row" },
      h("button", { class: "ed-btn ghost small", onclick: () => this.addOneRoof() }, t("editor.addARoof")),
      h("button", { class: "ed-btn ghost small", onclick: () => this.confirm(t("editor.roof.takeEveryRoofOff"), t("editor.roof.startAgain"), () => {
        this.change((p) => p.floors.forEach((f) => (f.roofs = [])), false, t("editor.roof.takeTheRoofsOff"));
        this.select(null);
      }) }, t("editor.roof.startAgain")),
    ));
    return out.filter((e): e is HTMLElement => !!e);
  }

  /** Puts the worked-out roofs on. */
  private addRoofs(choice: RoofChoice): void {
    const { roofs } = suggestRoofs(this.plan, choice);
    if (!roofs.length) {
      this.toastInDrawer(t("editor.roof.thePlanHasNo"));
      return;
    }
    this.change((p) => {
      for (const { floor, roof } of roofs) p.floors[floor].roofs = [...(p.floors[floor].roofs ?? []), roof];
    }, false, t("editor.addTheRoof"));
    this.host.view.viewer.setMode("house");
    this.select({ floor: roofs[0].floor, kind: "roof", id: roofs[0].roof.id });
  }

  /** One more roof: a gable over the shown storey, beside what is there; move and size it after. */
  private addOneRoof(): void {
    const viewer = this.host.view.viewer;
    const fi = viewer.mode === "floor" ? viewer.activeFloor : Math.max(0, this.plan.floors.length - 1);
    const f = this.plan.floors[fi];
    if (!f) return;
    const pts = f.rooms.flatMap((r) => r.points);
    const b = pts.length ? bounds(pts) : { minX: 0, minZ: 0, maxX: 4, maxZ: 4 };
    const roof: Roof = {
      id: newId("roof"), x: Math.round(((b.minX + b.maxX) / 2) * 100) / 100, z: Math.round(((b.minZ + b.maxZ) / 2) * 100) / 100,
      w: Math.max(1, Math.round((b.maxX - b.minX) * 100) / 100), d: Math.max(1, Math.round((b.maxZ - b.minZ) * 100) / 100),
      rotation: 0, shape: "gable", pitch: 35, covering: "concrete_tiles", items: [],
    };
    this.change((p) => (p.floors[fi].roofs = [...(p.floors[fi].roofs ?? []), roof]), false, t("editor.addARoof"));
    viewer.setMode("house");
    this.select({ floor: fi, kind: "roof", id: roof.id });
  }

  private roofPanel(fi: number, roof: Roof | undefined): HTMLElement {
    if (!roof) return h("div", {});
    const upd = (label: string, fn: (r: Roof) => void) => this.change((p) => fn(this.roofOf(p, roof.id)!.roof), false, label);
    const chip = (label: string, on: boolean, onclick: () => void, title = "") => h("button", { class: `ed-chip${on ? " on" : ""}`, title, onclick: () => !on && onclick() }, label);
    const num = (value: number | null | undefined, placeholder: string, step: string, onSet: (v: number | null) => void, title = "") =>
      h("input", { class: "ed-in num", type: "number", step, value: value === null || value === undefined ? "" : String(value), placeholder, title, onchange: (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        onSet(v === "" ? null : Number(v));
      } });
    const def = (ROOF_COVERINGS as Record<string, FinishDef>)[roof.covering] ?? ROOF_COVERINGS.concrete_tiles;
    const f = this.plan.floors[fi];
    const pitched = roof.shape !== "flat";
    const m = this.roofModelOf(fi, roof.id);
    const parties: [PartyEnds | null, string][] = [[null, t("editor.none")], ["left", t("editor.roof.leftEnd")], ["right", t("editor.roof.rightEnd")], ["both", t("editor.roof.bothEnds")]];
    const kinds: [RoofItem["kind"], string][] = [["solar", t("editor.roof.solarPanels")], ["window", t("editor.roof.roofWindow")], ["chimney", t("editor.roof.chimney")], ...(pitched ? [["dormer", t("editor.roof.dormer")]] as [RoofItem["kind"], string][] : [["lantern", t("editor.roof.roofLantern")]] as [RoofItem["kind"], string][])];
    const items = roof.items ?? [];
    return h("div", {},
      h("h4", {}, t("editor.roof.xRoofX2", { x: (ROOF_SHAPES[roof.shape] ? t(ROOF_SHAPES[roof.shape].label) : roof.shape), x2: f?.name ?? "" })),
      h("p", { class: "ed-hint" }, t("editor.roof.dragTheBlueCorners")),
      this.plan.floors.length > 1 ? h("div", { class: "ed-row" }, h("label", {}, t("editor.roof.sitsOn")),
        this.dropdown(this.plan.floors.map((x, i) => [String(i), x.name]), String(fi), (v) => this.moveRoof(fi, roof.id, Number(v)))) : null,
      h("div", { class: "ed-chips" }, ...ROOF_SHAPE_ORDER.map((k) => chip(t(ROOF_SHAPES[k].label), roof.shape === k, () => upd(t("editor.roof.nameRoof", { name: t(ROOF_SHAPES[k].label) }), (r) => {
        r.shape = k;
        if (k === "flat") r.pitch = 0;
        else if (!r.pitch || r.shape === "flat" || Math.abs(r.pitch - ROOF_SHAPES[roof.shape].pitch) < 0.01) r.pitch = ROOF_SHAPES[k].pitch;
      }), t(ROOF_SHAPES[k].hint)))),
      pitched ? h("div", { class: "ed-row" },
        h("label", {}, t("editor.roof.pitch")),
        num(roof.pitch, "35", "1", (v) => upd(t("editor.roof.roofPitch"), (r) => (r.pitch = Math.max(5, Math.min(70, v ?? 35))))),
        ...[15, 22.5, 30, 35, 40, 45].map((v) => chip(String(v), Math.abs(roof.pitch - v) < 0.01, () => upd(t("editor.roof.roofPitch"), (r) => (r.pitch = v)))),
      ) : h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: !!roof.parapet, onchange: (e: Event) => upd(t("editor.roof.parapet"), (r) => (r.parapet = (e.target as HTMLInputElement).checked)) }),
        ` ${t("editor.roof.aParapetRoundIt")}`),
      h("div", { class: "ed-row" }, h("label", {}, t("editor.roof.joinedNextDoor")),
        ...parties.map(([k, label]) => chip(label, (roof.party ?? null) === k, () => upd(k ? t("editor.roof.partyWall") : t("editor.roof.noPartyWall"), (r) => (r.party = k)),
          k ? t("editor.roof.aSemiDetachedOr") : ""))),
      h("div", { class: "ed-sub" }, t("editor.covering")),
      this.finishChips(ROOF_COVERINGS, roof.covering, (k) => upd(t("editor.roof.roofName", { name: t((ROOF_COVERINGS as Record<string, FinishDef>)[k].label) }), (r) => (r.covering = k as RoofCovering))),
      def.tintable ? this.colourPicker(ROOF_SWATCHES, roof.color, (c) => upd(t("editor.roof.roofColour"), (r) => (r.color = c)), t("editor.usual")) : null,
      roof.covering !== "glass" ? h("div", { class: "ed-sub" }, t("editor.roof.fasciasAndSoffits")) : null,
      this.colourPicker(TRIM_SWATCHES, roof.trim, (c) => upd(t("editor.roof.fasciaColour"), (r) => (r.trim = c)), t("editor.white")),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.roof.eavesOut")), num(roof.overhang, pitched ? "0.3" : "0.1", "0.05", (v) => upd(t("editor.roof.eavesOverhang"), (r) => (r.overhang = v === null ? null : Math.max(0, Math.min(1.5, v)))), t("editor.roof.howFarTheRoof")),
        h("label", {}, t("editor.roof.eavesAt")), num(roof.eaves, String(f?.height ?? 2.5), "0.05", (v) => upd(t("editor.roof.eavesHeight"), (r) => (r.eaves = v === null ? null : Math.max(0, Math.min(20, v)))), t("editor.roof.heightOfTheEaves")),
      ),
      h("div", { class: "ed-row" },
        h("label", {}, t("editor.length")), num(roof.w, "", "0.05", (v) => v && upd(t("editor.roof.roofLength"), (r) => (r.w = Math.max(0.5, v)))),
        h("label", {}, t("editor.roof.span")), num(roof.d, "", "0.05", (v) => v && upd(t("editor.roof.roofSpan"), (r) => (r.d = Math.max(0.5, v)))),
      ),
      this.turnRow((deg) => upd(t("editor.roof.turnARoof"), (r) => {
        // the roof turns round its middle, and what is on it with it
        const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
        for (const it of r.items ?? []) {
          const dx = it.x - r.x, dz = it.z - r.z;
          it.x = Math.round((r.x + c * dx - s * dz) * 100) / 100;
          it.z = Math.round((r.z + s * dx + c * dz) * 100) / 100;
          if (it.rotation !== null && it.rotation !== undefined) it.rotation = (it.rotation + deg + 360) % 360;
        }
        r.rotation = ((r.rotation + deg) % 360 + 360) % 360;
      })),
      h("h4", {}, t("editor.roof.addOnTheRoof")),
      h("div", { class: "ed-chips" }, ...kinds.map(([k, label]) => h("button", { class: "ed-chip", onclick: () => this.addRoofItem(fi, roof.id, k) }, label))),
      m && pitched ? h("p", { class: "ed-hint" }, this.roofFacesText(m)) : null,
      items.length ? h("h4", {}, t("editor.roof.onThisRoofN", { n: items.length })) : null,
      items.length ? h("div", { class: "ed-chips" }, ...items.map((it) => h("button", { class: "ed-chip", onclick: () => this.select({ floor: fi, kind: "roofitem", id: it.id }) }, this.roofItemName(it)))) : null,
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => {
          const id = newId("roof");
          this.change((p) => {
            const fl = p.floors[fi];
            const copy: Roof = { ...structuredClone(roof), id, x: roof.x + 1, z: roof.z + 1 };
            copy.items = (copy.items ?? []).map((it) => ({ ...it, id: newId("ri"), x: it.x + 1, z: it.z + 1 }));
            fl.roofs = [...(fl.roofs ?? []), copy];
          }, false, t("editor.roof.duplicateARoof"));
          this.select({ floor: fi, kind: "roof", id });
        } }, t("editor.duplicate")),
        h("button", { class: "ed-btn danger", onclick: () => {
          this.change((p) => (p.floors[fi].roofs = (p.floors[fi].roofs ?? []).filter((r) => r.id !== roof.id)), false, t("editor.roof.removeARoof"));
          this.select(null);
        } }, t("editor.remove")),
      ),
    );
  }

  /** Puts a roof, with what is on it, on another storey (after a floor was added under it, say). */
  private moveRoof(from: number, id: string, to: number): void {
    if (to === from || !this.plan.floors[to]) return;
    this.change((p) => {
      const roof = (p.floors[from].roofs ?? []).find((r) => r.id === id);
      if (!roof) return;
      p.floors[from].roofs = (p.floors[from].roofs ?? []).filter((r) => r.id !== id);
      p.floors[to].roofs = [...(p.floors[to].roofs ?? []), roof];
    }, false, t("editor.roof.roofOntoName", { name: this.plan.floors[to].name }));
    this.select({ floor: to, kind: "roof", id });
  }

  /** Which way each big slope faces, with the plan's north. */
  private roofFacesText(m: RoofModel): string {
    const north = this.plan.settings.north ?? 0;
    const faces = m.faces.filter((f) => f.plane.k > 0.03 && polyArea(f.poly) > 2);
    if (!faces.length) return "";
    const parts = faces.map((f) => compassName(faceBearing(m, f, north)));
    const unique = [...new Set(parts)];
    return t("editor.roof.itsSlopesFaceList", { list: unique.join(", "), x: north === 0 ? ` ${t("editor.roof.withNorthUpThe")}` : "" });
  }

  private roofItemName(it: RoofItem): string {
    if (it.kind === "solar") return t("editor.roofItem.xSolarPanels", { x: (it.cols ?? 1) * (it.rows ?? 1) });
    if (it.kind === "dormer") return t("editor.roofItem.xDormer", { x: it.style === "box" ? t("editor.box") : it.style === "hipped" ? t("editor.hipped") : t("editor.gable") });
    return t(ROOF_ITEM_DEFAULTS[it.kind].label);
  }

  /** Something new on a roof, where it usually goes: panels on the sunniest slope, a chimney on the ridge… */
  private addRoofItem(fi: number, roofId: string, kind: RoofItem["kind"]): void {
    const m = this.roofModelOf(fi, roofId);
    if (!m) return;
    const north = this.plan.settings.north ?? 0;
    const southern = (this.hass.config as { latitude?: number } | undefined)?.latitude !== undefined && ((this.hass.config as { latitude: number }).latitude < 0);
    const def = ROOF_ITEM_DEFAULTS[kind];
    const centroid = (f: RoofFace) => fromRoofFrame(m, f.poly.reduce((s, p) => s + p[0], 0) / f.poly.length, f.poly.reduce((s, p) => s + p[1], 0) / f.poly.length);
    const biggest = [...m.faces].sort((a, b) => polyArea(b.poly) - polyArea(a.poly))[0];
    const r2 = (v: number) => Math.round(v * 100) / 100;
    let item: RoofItem;
    if (kind === "solar") {
      // a house's arrays are nearly always the same panels: take them from one already placed
      const like = this.plan.floors.flatMap((f) => (f.roofs ?? []).flatMap((r) => r.items ?? [])).find((x) => x.kind === "solar");
      const panel = panelSize(like?.panel);
      const face = sunniestFace(m, north, southern) ?? biggest;
      const fit = face ? fitPanels(m, face, true, panelOf({ panel })) : null;
      const at = fit ? [fit.x, fit.z] : face ? centroid(face) : [m.roof.x, m.roof.z];
      const cols = fit?.cols ?? 2, rows = fit?.rows ?? 1;
      item = { id: newId("ri"), kind, x: r2(at[0]), z: r2(at[1]), cols, rows, portrait: true, watts: like?.watts ?? PANEL.watts, panel, ...solarSize({ cols, rows, panel }) };
    } else if (kind === "chimney") {
      // on the ridge: at the party wall when there is one, else in its middle
      const top = m.faces.flatMap((f) => f.poly.map(([u, v]) => ({ u, v, y: planeHeight(f.plane, u, v) })));
      const ymax = Math.max(...top.map((p) => p.y));
      const ridge = top.filter((p) => p.y > ymax - 0.01);
      const us = ridge.map((p) => p.u);
      const u = m.party.right ? Math.max(...us) - 0.5 : m.party.left ? Math.min(...us) + 0.5 : (Math.min(...us) + Math.max(...us)) / 2;
      const at = fromRoofFrame(m, u, ridge[0]?.v ?? 0);
      item = { id: newId("ri"), kind, x: r2(at[0]), z: r2(at[1]), w: def.w, d: def.d, h: def.h, pots: 2, rotation: m.roof.rotation };
    } else {
      // a dormer goes on the back, a window or a lantern on the biggest face
      const back = m.faces.find((f) => f.plane.n[1] < -0.9 && f.plane.k > 0.03);
      const face = kind === "dormer" ? back ?? biggest : biggest;
      const at = face ? centroid(face) : [m.roof.x, m.roof.z];
      item = { id: newId("ri"), kind, x: r2(at[0]), z: r2(at[1]), w: def.w, d: def.d, h: def.h ?? null, ...(kind === "dormer" ? { style: "box" as const } : {}) };
    }
    this.change((p) => {
      const r = this.roofOf(p, roofId)?.roof;
      if (r) r.items = [...(r.items ?? []), item];
    }, false, t("editor.addName", { name: t(def.label).toLowerCase() }));
    this.select({ floor: fi, kind: "roofitem", id: item.id });
  }

  private roofItemPanel(fi: number, it: RoofItem | undefined): HTMLElement {
    if (!it) return h("div", {});
    const found = this.roofItemOf(this.plan, it.id);
    if (!found) return h("div", {});
    const roof = found.roof;
    const upd = (label: string, fn: (x: RoofItem) => void) => this.change((p) => {
      const x = this.roofItemOf(p, it.id)?.item;
      if (!x) return;
      fn(x);
      if (x.kind === "solar") Object.assign(x, solarSize(x));
    }, false, label);
    const chip = (label: string, on: boolean, onclick: () => void, title = "") => h("button", { class: `ed-chip${on ? " on" : ""}`, title, onclick: () => !on && onclick() }, label);
    const num = (label: string, value: number | null | undefined, step: string, onSet: (v: number | null) => void, placeholder = "", title = "") => [
      h("label", {}, label),
      h("input", { class: "ed-in num", type: "number", step, value: value === null || value === undefined ? "" : String(value), placeholder, title, onchange: (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        onSet(v === "" ? null : Number(v));
      } }),
    ];
    const m = this.roofModelOf(fi, roof.id);
    const fr = m ? itemFrame(m, it) : null;
    const flat = !!fr && fr.slope < 1;
    const name = this.roofItemName(it);
    const rows: (HTMLElement | null)[] = [h("h4", {}, name), h("p", { class: "ed-hint" }, t("editor.roofItem.dragItAlongThe"))];
    if (it.kind === "solar") {
      const n = (it.cols ?? 1) * (it.rows ?? 1);
      const kwp = (n * (it.watts ?? PANEL.watts)) / 1000;
      const panel = panelOf(it);
      const mm = (v: number) => Math.round(v * 1000);
      // a size is set for every array of the same panels: a house nearly always has one kind
      const samePanels = (p: Plan) => p.floors.flatMap((f) => (f.roofs ?? []).flatMap((r) => r.items ?? []))
        .filter((x) => x.kind === "solar" && mm(panelOf(x).long) === mm(panel.long) && mm(panelOf(x).short) === mm(panel.short));
      const arrays = samePanels(this.plan).length;
      const setPanel = (label: string, size: (x: RoofItem) => [number, number] | null) => this.change((p) => {
        for (const x of samePanels(p)) {
          x.panel = size(x);
          Object.assign(x, solarSize(x));
        }
      }, false, label);
      const power = this.entities((id, st) => domainOf(id) === "sensor" && st.attributes.device_class === "power");
      rows.push(
        h("p", { class: "ed-hint" }, t("editor.roofItem.nPanelsFixedKwp", { n, fixed: kwp.toFixed(2), fixed2: it.w.toFixed(2), fixed3: it.d.toFixed(2) })),
        h("div", { class: "ed-row" },
          ...num(t("editor.across"), it.cols, "1", (v) => upd(t("editor.roofItem.solarPanelsAcross"), (x) => (x.cols = Math.max(1, Math.min(30, Math.round(v ?? 1)))))),
          ...num(t("editor.roofItem.up"), it.rows, "1", (v) => upd(t("editor.roofItem.solarPanelsUpThe"), (x) => (x.rows = Math.max(1, Math.min(12, Math.round(v ?? 1)))))),
        ),
        h("div", { class: "ed-row" },
          chip(t("editor.roofItem.portrait"), it.portrait !== false, () => upd(t("editor.roofItem.panelsPortrait"), (x) => (x.portrait = true))),
          chip(t("editor.roofItem.landscape"), it.portrait === false, () => upd(t("editor.roofItem.panelsLandscape"), (x) => (x.portrait = false))),
          chip(t("editor.roofItem.allBlack"), it.style !== "blue", () => upd(t("editor.roofItem.allBlackPanels"), (x) => (x.style = "black"))),
          chip(t("editor.roofItem.blue"), it.style === "blue", () => upd(t("editor.roofItem.bluePanels"), (x) => (x.style = "blue"))),
        ),
        h("div", { class: "ed-sub" }, t("editor.roofItem.panelSizeMm")),
        h("div", { class: "ed-chips" }, ...PANEL_SIZES.map(([long, short, title]) => chip(`${long} × ${short}`, mm(panel.long) === long && mm(panel.short) === short, () => setPanel(t("editor.roofItem.panelsLongShortMm", { long, short }), () => [long / 1000, short / 1000]), t(title)))),
        h("div", { class: "ed-row" },
          ...num(t("editor.roofItem.long"), mm(panel.long), "1", (v) => setPanel(t("editor.roofItem.panelLength"), (x) => (v ? panelSize([v / 1000, panelOf(x).short]) : null)), "", t("editor.roofItem.eachPanelsLongSide")),
          ...num(t("editor.roofItem.short"), mm(panel.short), "1", (v) => setPanel(t("editor.roofItem.panelWidth"), (x) => (v ? panelSize([panelOf(x).long, v / 1000]) : null)), "", t("editor.roofItem.eachPanelsShortSide")),
        ),
        h("p", { class: "ed-hint" }, t("editor.roofItem.theSizeAndPower", { x: arrays > 1 ? ` ${t("editor.roofItem.aNewSizeChanges", { arrays })}` : "" })),
        h("div", { class: "ed-row" }, ...num(t("editor.roofItem.eachW"), it.watts, "5", (v) => upd(t("editor.roofItem.panelPower"), (x) => (x.watts = v && v > 0 ? Math.min(1000, v) : null)), String(PANEL.watts), t("editor.roofItem.eachPanelsPeakPower"))),
        flat ? h("div", { class: "ed-row" }, ...num(t("editor.roofItem.tilt"), it.tilt, "5", (v) => upd(t("editor.roofItem.panelTilt"), (x) => (x.tilt = v ? Math.max(0, Math.min(60, v)) : null)), "flat", t("editor.roofItem.framesTiltingThePanels"))) : null,
        flat ? this.turnRow((deg) => upd(t("editor.roofItem.turnSolarPanels"), (x) => (x.rotation = (((x.rotation ?? roof.rotation) + deg) % 360 + 360) % 360))) : null,
        h("div", { class: "ed-row" }, h("label", {}, t("editor.roofItem.shinesWith")), this.dropdown(power, it.entity ?? "", (v) => upd(t("editor.roofItem.panelsSensor"), (x) => (x.entity = v || null)), t("editor.roofItem.theHousesSolar"))),
        h("p", { class: "ed-hint" }, t("editor.roofItem.linkThePowerSensor")),
        m && fr ? h("button", { class: "ed-btn ghost", onclick: () => {
          const fit = fitPanels(m, fr.face, it.portrait !== false, panel);
          if (!fit) return this.toastInDrawer(t("editor.roofItem.noPanelFitsOn"));
          upd(t("editor.roofItem.fillTheSlopeWith"), (x) => Object.assign(x, { cols: fit.cols, rows: fit.rows, x: fit.x, z: fit.z }));
        } }, t("editor.roofItem.fillTheSlope")) : null,
      );
    } else if (it.kind === "window") {
      const contacts = this.entities((id, st) => domainOf(id) === "binary_sensor" && ["window", "opening"].includes(String(st.attributes.device_class)));
      const sizes: [string, number, number][] = [["55 × 78", 0.55, 0.78], ["55 × 98", 0.55, 0.98], ["78 × 98", 0.78, 0.98], ["78 × 118", 0.78, 1.18], ["78 × 140", 0.78, 1.4], ["94 × 118", 0.94, 1.18], ["114 × 118", 1.14, 1.18]];
      rows.push(
        h("div", { class: "ed-row" },
          chip(t("editor.roofItem.centrePivot"), it.style !== "conservation", () => upd(t("editor.roofItem.centrePivotRoofWindow"), (x) => (x.style = "pivot"))),
          chip(t("editor.roofItem.conservation"), it.style === "conservation", () => upd(t("editor.roofItem.conservationRoofWindow"), (x) => (x.style = "conservation")), t("editor.roofItem.blackFlushWithThe"))),
        h("div", { class: "ed-sub" }, t("editor.roofItem.sizeCm")),
        h("div", { class: "ed-chips" }, ...sizes.map(([label, w, d]) => chip(label, Math.abs(it.w - w) < 0.005 && Math.abs(it.d - d) < 0.005, () => upd(t("editor.roofItem.roofWindowLabel", { label }), (x) => {
          x.w = w;
          x.d = d;
        })))),
        h("div", { class: "ed-row" }, ...num(t("editor.houses.width"), it.w, "0.01", (v) => v && upd(t("editor.roofItem.roofWindowWidth"), (x) => (x.w = Math.max(0.3, v)))), ...num(t("editor.length"), it.d, "0.01", (v) => v && upd(t("editor.roofItem.roofWindowLength"), (x) => (x.d = Math.max(0.3, v))))),
        this.colourPicker(JOINERY_SWATCHES, it.color, (c) => upd(t("editor.roofItem.roofWindowColour"), (x) => (x.color = c)), t("editor.roofItem.grey")),
        h("div", { class: "ed-row" }, h("label", {}, t("editor.sensor")), this.dropdown(contacts, it.entity ?? "", (v) => upd(t("editor.roofItem.roofWindowSensor"), (x) => (x.entity = v || null)), t("editor.none"))),
        h("p", { class: "ed-hint" }, t("editor.roofItem.litFromTheRoom")),
      );
    } else if (it.kind === "chimney") {
      rows.push(
        h("div", { class: "ed-row" },
          chip(t("editor.roofItem.brick"), !it.style || it.style === "brick", () => upd(t("editor.roofItem.brickChimney"), (x) => (x.style = "brick"))),
          chip(t("editor.roofItem.render"), it.style === "render", () => upd(t("editor.roofItem.renderedChimney"), (x) => (x.style = "render"))),
          chip(t("editor.roofItem.stone"), it.style === "stone", () => upd(t("editor.roofItem.stoneChimney"), (x) => (x.style = "stone")))),
        it.style === "render" ? this.colourPicker(PAINT_SWATCHES, it.color, (c) => upd(t("editor.roofItem.chimneyColour"), (x) => (x.color = c))) : null,
        h("div", { class: "ed-row" }, ...num(t("editor.houses.width"), it.w, "0.05", (v) => v && upd(t("editor.roofItem.chimneyWidth"), (x) => (x.w = Math.max(0.3, v)))), ...num(t("editor.houses.depth"), it.d, "0.05", (v) => v && upd(t("editor.roofItem.chimneyDepth"), (x) => (x.d = Math.max(0.3, v))))),
        h("div", { class: "ed-row" },
          ...num(t("editor.roofItem.aboveRoof"), it.h, "0.05", (v) => upd(t("editor.roofItem.chimneyHeight"), (x) => (x.h = v === null ? null : Math.max(0.3, Math.min(4, v)))), "1.0"),
          ...num(t("editor.roofItem.pots"), it.pots, "1", (v) => upd(t("editor.roofItem.chimneyPots"), (x) => (x.pots = v === null ? null : Math.max(0, Math.min(6, Math.round(v))))), "2")),
        this.turnRow((deg) => upd(t("editor.roofItem.turnAChimney"), (x) => (x.rotation = (((x.rotation ?? roof.rotation) + deg) % 360 + 360) % 360))),
      );
    } else if (it.kind === "dormer") {
      rows.push(
        h("div", { class: "ed-row" },
          chip(t("editor.box"), it.style === "box", () => upd(t("editor.roofItem.boxDormer"), (x) => (x.style = "box")), t("editor.roofItem.flatRoofedAsMost")),
          chip(t("editor.gable"), it.style !== "box" && it.style !== "hipped", () => upd(t("editor.roofItem.gableDormer"), (x) => (x.style = "gable"))),
          chip(t("editor.hipped"), it.style === "hipped", () => upd(t("editor.roofItem.hippedDormer"), (x) => (x.style = "hipped")))),
        h("div", { class: "ed-row" }, ...num(t("editor.houses.width"), it.w, "0.05", (v) => v && upd(t("editor.roofItem.dormerWidth"), (x) => (x.w = Math.max(0.8, v)))), ...num(t("editor.roofItem.frontWall"), it.h, "0.05", (v) => upd(t("editor.roofItem.dormerHeight"), (x) => (x.h = v)), "auto")),
        this.colourPicker(JOINERY_SWATCHES, it.color, (c) => upd(t("editor.roofItem.dormerColour"), (x) => (x.color = c)), t("editor.white")),
        h("p", { class: "ed-hint" }, t("editor.roofItem.itsCheeksAreHung")),
      );
    } else if (it.kind === "lantern") {
      rows.push(
        h("div", { class: "ed-row" }, ...num(t("editor.houses.width"), it.w, "0.05", (v) => v && upd(t("editor.roofItem.lanternWidth"), (x) => (x.w = Math.max(0.6, v)))), ...num(t("editor.length"), it.d, "0.05", (v) => v && upd(t("editor.roofItem.lanternLength"), (x) => (x.d = Math.max(0.6, v))))),
        h("div", { class: "ed-row" }, ...num(t("editor.roofItem.rise"), it.h, "0.05", (v) => upd(t("editor.roofItem.lanternRise"), (x) => (x.h = v === null ? null : Math.max(0.2, Math.min(1.5, v)))), "0.5")),
        this.colourPicker(JOINERY_SWATCHES, it.color, (c) => upd(t("editor.roofItem.lanternColour"), (x) => (x.color = c)), t("editor.roofItem.anthracite")),
        this.turnRow((deg) => upd(t("editor.roofItem.turnALantern"), (x) => (x.rotation = (((x.rotation ?? roof.rotation) + deg) % 360 + 360) % 360))),
      );
    }
    rows.push(h("div", { class: "ed-row" },
      h("button", { class: "ed-btn ghost", onclick: () => this.select({ floor: fi, kind: "roof", id: roof.id }) }, t("editor.roofItem.theRoof")),
      h("button", { class: "ed-btn ghost", onclick: () => {
        const id = newId("ri");
        this.change((p) => {
          const r = this.roofOf(p, roof.id)?.roof;
          if (r) r.items = [...(r.items ?? []), { ...structuredClone(it), id, x: it.x + 0.5, z: it.z + 0.5 }];
        }, false, t("editor.duplicateName", { name: name.toLowerCase() }));
        this.select({ floor: fi, kind: "roofitem", id });
      } }, t("editor.duplicate")),
      h("button", { class: "ed-btn danger", onclick: () => {
        this.change((p) => {
          const r = this.roofOf(p, roof.id)?.roof;
          if (r) r.items = (r.items ?? []).filter((x) => x.id !== it.id);
        }, false, t("editor.removeName", { name: name.toLowerCase() }));
        this.select(null);
      } }, t("editor.remove")),
    ));
    return h("div", {}, ...rows.filter((e): e is HTMLElement => !!e));
  }

  private roofDrag: { origin: Vec2 | null; roof: Vec2; items: Vec2[]; corner: { opp: Vec2; i: number } | null } | null = null;

  /**
   * Dragging on a roof: something on it follows the finger along the slope (staying on the roof), the
   * selected roof moves level with what is on it, and a corner sizes it with the opposite one staying.
   * Only the roofs are built again per frame.
   */
  private dragRoof(kind: "roof" | "roofitem" | "roofcorner", ref: string, x: number, z: number, phase: DragPhase): void {
    const view = this.host.view;
    const snap = (v: number) => Math.round(v * 100) / 100;
    if (phase === "start") {
      this.dragStart = structuredClone(this.plan);
      const rid = kind === "roofcorner" ? ref.slice(0, ref.lastIndexOf(":")) : ref;
      const found = kind === "roofitem" ? this.roofItemOf(this.plan, ref) : this.roofOf(this.plan, rid);
      if (!found) return;
      const r = found.roof;
      let corner: { opp: Vec2; i: number } | null = null;
      if (kind === "roofcorner") {
        const i = Number(ref.slice(ref.lastIndexOf(":") + 1));
        const corners = this.roofCorners(r);
        corner = { opp: corners[(i + 2) % 4], i };
      }
      this.roofDrag = { origin: null, roof: [r.x, r.z], items: (r.items ?? []).map((it) => [it.x, it.z] as Vec2), corner };
      return;
    }
    const d = this.roofDrag;
    if (phase === "move" && d) {
      if (kind === "roofitem") {
        const found = this.roofItemOf(this.plan, ref);
        if (!found) return;
        const { roof, item } = found;
        // kept on its roof: its middle inside the roof's walls
        const rad = (roof.rotation * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
        const dx = x - roof.x, dz = z - roof.z;
        let u = c * dx + s * dz, v = -s * dx + c * dz;
        const t = this.plan.settings.wall_exterior / 2;
        u = Math.max(-roof.w / 2 - t, Math.min(roof.w / 2 + t, u));
        v = Math.max(-roof.d / 2 - t, Math.min(roof.d / 2 + t, v));
        item.x = snap(roof.x + c * u - s * v);
        item.z = snap(roof.z + s * u + c * v);
      } else if (kind === "roof") {
        const found = this.roofOf(this.plan, ref);
        if (!found) return;
        d.origin ??= [x, z];
        const ddx = Math.round((x - d.origin[0]) * 20) / 20, ddz = Math.round((z - d.origin[1]) * 20) / 20;
        found.roof.x = snap(d.roof[0] + ddx);
        found.roof.z = snap(d.roof[1] + ddz);
        (found.roof.items ?? []).forEach((it, k) => {
          if (!d.items[k]) return;
          it.x = snap(d.items[k][0] + ddx);
          it.z = snap(d.items[k][1] + ddz);
        });
      } else if (d.corner) {
        const found = this.roofOf(this.plan, ref.slice(0, ref.lastIndexOf(":")));
        if (!found) return;
        const r = found.roof;
        const rad = (r.rotation * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
        const du = (x - d.corner.opp[0]) * c + (z - d.corner.opp[1]) * s;
        const dv = -(x - d.corner.opp[0]) * s + (z - d.corner.opp[1]) * c;
        const w = Math.max(0.5, snap(Math.abs(du))), dd = Math.max(0.5, snap(Math.abs(dv)));
        const su = du < 0 ? -1 : 1, sv = dv < 0 ? -1 : 1;
        r.w = w;
        r.d = dd;
        r.x = snap(d.corner.opp[0] + c * (su * w / 2) - s * (sv * dd / 2));
        r.z = snap(d.corner.opp[1] + s * (su * w / 2) + c * (sv * dd / 2));
      }
      this.queueDragFrame(() => view.previewPlan(this.plan));
      return;
    }
    this.roofDrag = null;
    if (this.dragStart) {
      if (JSON.stringify(this.dragStart) !== JSON.stringify(this.plan)) {
        this.undo.push({ plan: this.dragStart, label: kind === "roofitem" ? t("editor.drag.moveName", { name: this.roofItemName(this.roofItemOf(this.plan, ref)?.item ?? ({ kind: "window" } as RoofItem)).toLowerCase() }) : kind === "roof" ? t("editor.drag.moveARoof") : t("editor.drag.sizeARoof") });
        this.redo = [];
        this.changed();
      }
      this.apply();
    }
    this.dragStart = null;
  }

  /** A roof's corners on the plan (along the middle of its walls), going round from the back left. */
  private roofCorners(r: Roof): Vec2[] {
    const rad = (r.rotation * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
    return ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as const).map(([a, b]) => {
      const u = (a * r.w) / 2, v = (b * r.d) / 2;
      return [r.x + c * u - s * v, r.z + s * u + c * v] as Vec2;
    });
  }

  // ------------------------------------------------------------------ actions

  private async importFiles(files: FileList | null): Promise<void> {
    if (!files?.length) return;
    let house: unknown = null;
    let manifest: Manifest | null = null;
    let detections: Detections | null = null;
    let other: unknown = null;
    let sh3d: Uint8Array | null = null;
    for (const file of Array.from(files)) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (isZip(bytes)) {
        sh3d ??= bytes;
        continue;
      }
      let data: unknown;
      try {
        data = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        continue;
      }
      if (isRoomPlan(data)) house = data;
      else if (isDetections(data)) detections = data;
      else if (isSimplePlan(data)) other = data;
      else if (Array.isArray((data as Manifest).rooms) && (data as Manifest).rooms.every((r) => typeof r.name === "string")) manifest = data as Manifest;
      else other ??= data;
    }
    if (house) {
      const front = manifest?.rooms.find((r) => /hall|entrance|porch|front/i.test(r.name))?.name;
      const { plan, report } = importRoomPlan(house as never, manifest, { frontDoorRoom: front, detections });
      // a new scan faces its own way: the phone's compass, or unknown (north up) until set
      this.replaceWithImport(plan, report.north?.bearing ?? 0, t("editor.import.aScan"), [
        t("editor.import.brought", { rooms: report.rooms, n: report.floors, openings: report.openings, furniture: report.furniture, decor: report.decor ? t("editor.import.decorations", { n: report.decor }) : "" }),
        report.north
          ? t("editor.import.northFromThePhones", { bearing: Math.round(report.north.bearing), compassName: compassName(report.north.bearing), x: report.north.spread !== null ? t("editor.import.readingsWithinSpread", { spread: Math.round(report.north.spread) }) : "", x2: report.north.magnetic ? t("editor.import.magneticNorth") : "" })
          : t("editor.import.theScanHasNo"),
        ...report.warnings,
      ]);
      return;
    }
    if (sh3d || (other && isSimplePlan(other))) {
      try {
        const { buildPlan } = await import("../import/draft");
        const draft = sh3d ? await (await import("../import/sh3d")).importSh3d(sh3d) : importSimple(other);
        const { plan, summary } = buildPlan(draft);
        this.replaceWithImport(plan, summary.north ?? 0, sh3d ? t("editor.import.aSweetHome3dHome") : t("editor.import.aPlan"), importLines(summary));
      } catch (e) {
        this.toastInDrawer(t("editor.import.cantImportItMessage", { message: (e as Error).message }));
      }
      return;
    }
    const plan = other as Partial<Plan> | null;
    this.toastInDrawer(plan?.version === 1 && plan.settings
      ? t("editor.import.thatIsAVirtuhome")
      : t("editor.import.noneOfTheFiles"));
  }

  /** Puts an imported plan in place of this one (after asking, if this one has rooms) as one undo step, with Smart Setup. */
  private replaceWithImport(plan: Plan, north: number, what: string, lines: string[]): void {
    const go = () => {
      const next: Plan = { ...structuredClone(this.plan), floors: plan.floors };
      next.settings = { ...next.settings, wall_exterior: plan.settings.wall_exterior, wall_interior: plan.settings.wall_interior, north };
      const placed = autoPlace(next, this.hass);
      // quiet: the report says what comes next, not the first-room hint
      this.change((p) => Object.assign(p, placed.plan), true, t("editor.import.importWhat", { what }));
      this.host.view.viewer.setMode("house");
      this.showReport([
        ...lines,
        t("editor.nDevicesPlacedN2", { n: placed.report.placed.length, n2: placed.report.linked.length, n3: placed.report.roomsLinked.length }),
      ], ".ed-scan");
    };
    if (this.plan.floors.some((f) => f.rooms.length)) {
      this.confirm(t("editor.import.replaceTheWholePlan"), t("editor.replace"), go);
    } else go();
  }

  private runAutoPlace(): void {
    const { plan, report } = autoPlace(this.plan, this.hass);
    this.change((p) => Object.assign(p, plan));
    this.showReport([
      t("editor.autoPlace.nDevicesPlacedN2", { n: report.placed.length, n2: report.linked.length, n3: report.roomsLinked.length }),
      ...(report.unplaced.length ? [t("editor.nDevicesAreIn", { n: report.unplaced.length })] : []),
      ...report.placed.slice(0, 30),
    ]);
  }

  /** Opens the house type picker at the top of the Home tab. */
  private openHouseTypes(): void {
    this.houseTypes ??= new HouseTypes({
      use: (plan, name) => this.useHouseType(plan, name),
      close: () => {
        this.houseTypes = null;
        this.render();
      },
      reveal: (el) => this.scrollDrawerTo(el),
    });
    this.show("home");
    this.body.scrollTop = 0;
  }

  /**
   * A house type in place of the plan (asking first if it has rooms), its storeys linked to Home
   * Assistant's floors of their level, then Smart Setup: one step to undo.
   */
  private useHouseType(house: Plan, name: string): void {
    const go = () => {
      const used = new Set<string>();
      const floors = house.floors.map((f, i) => {
        const ha = Object.values(this.hass.floors ?? {}).find((x) => x.level === i && !used.has(x.floor_id));
        if (ha) used.add(ha.floor_id);
        return { ...f, ha_floor: ha?.floor_id ?? null };
      });
      const { wall_exterior, wall_interior, exterior_finish } = house.settings;
      const next: Plan = { ...structuredClone(this.plan), floors, settings: { ...this.plan.settings, wall_exterior, wall_interior, exterior_finish, exterior_color: null } };
      const placed = autoPlace(next, this.hass);
      this.houseTypes = null;
      this.starting = true;
      this.change((p) => Object.assign(p, placed.plan), false, t("editor.houseType.startFromName", { name: name.toLowerCase() }));
      this.starting = false;
      this.select(null);
      this.host.view.viewer.setMode("house");
      const rooms = floors.reduce((n, f) => n + f.rooms.length, 0);
      const openings = floors.reduce((n, f) => n + f.openings.filter((o) => o.kind !== "passage").length, 0);
      const r = placed.report;
      this.showReport([
        t("editor.houseType.summary", { name, rooms, n: floors.length, openings }),
        t("editor.nDevicesPlacedN2", { n: r.placed.length, n2: r.linked.length, n3: r.roomsLinked.length }),
        ...(r.unplaced.length ? [t("editor.nDevicesAreIn", { n: r.unplaced.length })] : []),
        ...r.roomsLinked.slice(0, 20),
      ]);
      const report = this.body.querySelector<HTMLElement>(".ed-report");
      if (report) this.scrollDrawerTo(report);
    };
    if (this.plan.floors.some((f) => f.rooms.length)) this.confirm(t("editor.houseType.replaceTheCurrentPlan"), t("editor.replace"), go);
    else go();
  }

  /** The report on the Home tab, scrolled to `from` (a section above it) when given. */
  private showReport(lines: string[], from?: string): void {
    this.show("home");
    const r = this.body.querySelector(".ed-report");
    r?.replaceChildren(...lines.map((l) => h("div", {}, l)));
    const top = from ? this.body.querySelector<HTMLElement>(from) : null;
    if (top) this.scrollDrawerTo(top);
  }

  /** A storey on top of the house: as high as the one below, linked to the Home Assistant floor of its level when there is one. */
  private addFloor(): void {
    const floors = this.plan.floors;
    const top = floors.reduce<Floor | null>((a, f) => (!a || f.elevation >= a.elevation ? f : a), null);
    const n = floors.length;
    const names = [t("editor.floor.groundFloor"), t("editor.floor.firstFloor"), t("editor.floor.secondFloor"), t("editor.floor.thirdFloor"), t("editor.floor.fourthFloor"), t("editor.floor.fifthFloor")];
    const taken = new Set(floors.map((f) => f.name.toLowerCase()));
    const name = [names[n] ?? t("editor.floor.floorN", { n }), t("editor.floor.floorN", { n }), t("editor.floor.floorX", { x: n + 1 })].find((x) => !taken.has(x.toLowerCase())) ?? t("editor.floor.floorX", { x: n + 1 });
    const used = new Set(floors.map((f) => f.ha_floor).filter(Boolean));
    const ha = Object.values(this.hass.floors ?? {}).find((x) => x.level === n && !used.has(x.floor_id));
    const floor: Floor = {
      id: newId("floor"), name, ha_floor: ha?.floor_id ?? null,
      elevation: top ? Math.round((top.elevation + top.height) * 100) / 100 : 0, height: top?.height ?? 2.6,
      rooms: [], openings: [], furniture: [], devices: [], walls: [], outdoor: [], fences: [], roofs: [],
    };
    this.change((p) => p.floors.push(floor), false, t("editor.addName", { name }));
    this.select(null);
    this.host.view.showFloor(this.plan.floors.length - 1);
  }

  /** Takes a storey out with everything on it; the others keep their levels. */
  private removeFloor(i: number): void {
    const f = this.plan.floors[i];
    if (!f || this.plan.floors.length < 2) return;
    const n = f.rooms.length;
    const what = n ? ` ${t("editor.floor.withRooms", { n })}` : "";
    this.confirm(t("editor.floor.removeNameWhat", { name: f.name, what }), t("editor.remove"), () => {
      this.change((p) => p.floors.splice(i, 1), false, t("editor.removeName", { name: f.name }));
      this.select(null);
      this.host.view.showHouse();
    });
  }

  /** A 3 x 3 m room beside the house on the current floor. */
  private addRoom(name = t("editor.add.newRoom"), area: string | null = null): void {
    // a room for an area goes on its floor
    const haFloor = area ? this.hass.areas?.[area]?.floor_id : null;
    const onFloor = haFloor ? this.plan.floors.findIndex((x) => x.ha_floor === haFloor) : -1;
    const fi = onFloor >= 0 ? onFloor : this.host.view.viewer.mode === "floor" ? this.host.view.viewer.activeFloor : 0;
    const f = this.plan.floors[fi];
    if (!f) return;
    const all = f.rooms.flatMap((r) => r.points);
    const b = all.length ? bounds(all) : { minX: 0, minZ: 0, maxX: 0, maxZ: 3 };
    const x0 = b.maxX;
    const room: Room = { id: newId("room"), name, area_id: area, floor: "wood", points: [[x0, b.minZ], [x0 + 3, b.minZ], [x0 + 3, b.minZ + 3], [x0, b.minZ + 3]] };
    this.change((p) => p.floors[fi].rooms.push(room), false, t("editor.addName", { name }));
    if (!area) this.select({ floor: fi, kind: "room", id: room.id });
  }

  /** Opens the 2D plan with its fence tool. */
  private startFence(): void {
    this.setPlanMode(true);
    this.plan2d?.drawFence();
  }

  /** A lawn behind the house (top of the plan) or a front area (bottom), as wide as the house. */
  private addGarden(where: "back" | "front"): void {
    const f = this.plan.floors[0];
    if (!f) return;
    const all = f.rooms.flatMap((r) => r.points);
    if (!all.length) return;
    const b = bounds(all);
    const half = this.plan.settings.wall_exterior / 2;
    const depth = where === "back" ? 9 : 5;
    const z0 = where === "back" ? b.minZ - half - depth : b.maxZ + half;
    const z1 = where === "back" ? b.minZ - half : b.maxZ + half + depth;
    const area = Object.values(this.hass.areas ?? {}).find((a) => /garden|yard|outside|patio/i.test(a.name));
    const o: OutdoorArea = {
      id: newId("out"), name: where === "back" ? t("editor.add.garden") : t("editor.add.front"), kind: where === "back" ? "lawn" : "driveway",
      area_id: where === "back" ? area?.area_id ?? null : null,
      points: [[b.minX - half, z0], [b.maxX + half, z0], [b.maxX + half, z1], [b.minX - half, z1]],
    };
    this.change((p) => {
      p.floors[0].outdoor = [...(p.floors[0].outdoor ?? []), o];
    });
    this.select({ floor: 0, kind: "outdoor", id: o.id });
  }

  /**
   * A new patio (4 x 3 m, or 3 m across), deck or path (1 m wide) in the middle of a garden area:
   * the one given, else the back garden, else behind the house.
   */
  private addArea(kind: NewAreaKind, shape: "rect" | "round", near?: OutdoorArea): void {
    const f = this.plan.floors[0];
    if (!f) return;
    const garden = near ?? (f.outdoor ?? []).find((o) => o.kind === "lawn");
    const house = f.rooms.flatMap((r) => r.points);
    let at: Vec2;
    if (garden) at = labelPoint(garden.points);
    else if (house.length) {
      const b = bounds(house);
      at = [(b.minX + b.maxX) / 2, b.minZ - this.plan.settings.wall_exterior / 2 - 2];
    } else at = [0, 0];
    const [w, d] = kind === "path" ? [1, 4] : [4, 3];
    const points: Vec2[] = shape === "round" ? circlePoints(at, 1.5)
      : [[at[0] - w / 2, at[1] - d / 2], [at[0] + w / 2, at[1] - d / 2], [at[0] + w / 2, at[1] + d / 2], [at[0] - w / 2, at[1] + d / 2]];
    const o = newArea(f, kind, points);
    this.change((p) => {
      p.floors[0].outdoor = [...(p.floors[0].outdoor ?? []), o];
    }, false, t("editor.addName", { name: o.name.toLowerCase() }));
    this.select({ floor: 0, kind: "outdoor", id: o.id });
  }

  /** Opens the 2D plan to draw a patio or deck. */
  private drawArea(kind: NewAreaKind): void {
    this.setPlanMode(true);
    this.plan2d?.drawArea(kind, "rect");
  }

  /** The edge behind a + handle ("<space id>:<edge index>"), with its length. */
  private edgeOf(ref: string, fi: number): { outdoor: boolean; id: string; k: number; len: number } | null {
    const at = ref.lastIndexOf(":");
    const id = ref.slice(0, at), k = Number(ref.slice(at + 1));
    const f = this.plan.floors[fi];
    const room = f?.rooms.find((r) => r.id === id);
    const s = room ?? f?.outdoor?.find((o) => o.id === id);
    const a = s?.points[k], b = s && s.points[(k + 1) % s.points.length];
    if (!s || !a || !b) return null;
    return { outdoor: !room, id, k, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  }

  private addDevice(fi: number, room: Room, entity: string): void {
    const at = labelPoint(room.points);
    const dom = domainOf(entity);
    this.change((p) => p.floors[fi].devices.push({
      id: newId("d"), entity, x: at[0] + (Math.random() - 0.5) * 0.4, z: at[1] + (Math.random() - 0.5) * 0.4,
      mount: dom === "light" ? "ceiling" : null, y: dom === "camera" ? 2.2 : null,
    }));
  }

  private addFurniture(fi: number, space: { points: Vec2[] }, type: string): void {
    const def = FURNITURE[type];
    if (!def) return;
    const at = labelPoint(space.points);
    const item: Furniture = { id: newId("f"), type, x: at[0], z: at[1], rotation: 0, w: def.size[0], d: def.size[1], h: def.size[2] };
    if (def.y) item.y = def.y;
    this.change((p) => {
      p.floors[fi].furniture.push(item);
      settle(p, fi, item.id);
    }, false, t("editor.addName", { name: t(def.label) }));
    this.select({ floor: fi, kind: "furniture", id: item.id });
  }

  private downloadPlan(): void {
    const blob = new Blob([JSON.stringify(this.plan, null, 1)], { type: "application/json" });
    const a = h("a", { href: URL.createObjectURL(blob), download: "virtuhome-plan.json" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  private async loadPlanFile(file: File | undefined): Promise<void> {
    if (!file) return;
    const plan = normalizePlan(JSON.parse(await file.text()));
    this.confirm(t("editor.planFile.replaceTheCurrentPlan"), t("editor.replace"), () => {
      this.change((p) => Object.assign(p, plan));
      // its entities may have been renamed since, or be missing here
      this.registryChanged();
    });
  }

  // ------------------------------------------------------------------ small widgets

  private entities(filter: (id: string, s: Hass["states"][string]) => boolean): [string, string][] {
    const states = this.hass.states;
    return Object.keys(states)
      .filter((id) => filter(id, states[id]))
      .map((id) => [id, String(states[id].attributes.friendly_name ?? id)] as Swatch)
      .sort((a, b) => a[1].localeCompare(b[1]));
  }

  private dropdown(options: [string, string][], value: string, onChange: (v: string) => void, empty?: string): HTMLSelectElement {
    const sel = h("select", { class: "ed-in", onchange: (e: Event) => onChange((e.target as HTMLSelectElement).value) });
    if (empty !== undefined) sel.append(h("option", { value: "" }, empty));
    for (const [v, label] of options) sel.append(h("option", { value: v, selected: v === value }, label));
    if (value && !options.some(([v]) => v === value)) sel.append(h("option", { value, selected: true }, value));
    sel.value = value;
    return sel;
  }

  private entityInput(options: [string, string][], value: string, onChange: (v: string) => void): HTMLElement {
    const id = `ents-${Math.random().toString(36).slice(2)}`;
    const list = h("datalist", { id }, ...options.slice(0, 1500).map(([v, label]) => h("option", { value: v }, label)));
    const input = h("input", { class: "ed-in", value, onchange: (e: Event) => onChange((e.target as HTMLInputElement).value.trim()) });
    input.setAttribute("list", id);
    return h("span", { class: "ed-grow" }, input, list);
  }

  /** An in-page confirmation (browser dialogs would block a wall tablet's view). */
  private confirm(text: string, action: string, onYes: () => void | Promise<void>): void {
    const box = h("div", { class: "ed-confirm" },
      h("p", {}, text),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => box.remove() }, t("editor.main.cancel")),
        h("button", { class: "ed-btn danger", onclick: async () => {
          box.remove();
          await onYes();
        } }, action),
      ),
    );
    this.el.append(box);
  }

  private toastInDrawer(text: string): void {
    this.status.textContent = text;
  }
}
