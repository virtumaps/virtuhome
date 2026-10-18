// The editor: a drawer next to the 3D view (loaded only when an admin taps Edit).
//   Home     import a scan, place devices automatically, floors, plan files, restore points
//   Rooms    names, Home Assistant areas, floor materials
//   Devices  what is placed, and what of Home Assistant is not yet
//   Selected the tapped room, device or furniture: link entities, move, turn, remove
// In edit mode a tap selects instead of switching, and devices, lamps and furniture can be dragged.
import { mdiArrowULeftTop, mdiArrowURightTop, mdiClose, mdiContentSave, mdiDelete, mdiFlipHorizontal, mdiMagnify, mdiPlus, mdiRotateLeft, mdiRotateRight } from "@mdi/js";
import { autoPlace } from "../auto/placement";
import { importRoomPlan, isRoomPlan, type Detections, type Manifest } from "../import/roomplan";
import { labelPoint } from "../model/geom";
import { newId, normalizePlan, spaces, splitEdge, type Device, type EnergySettings, type Fence, type FencePost, type FenceStyle, type Floor, type FloorMaterial, type Furniture, type Opening, type OutdoorArea, type OutdoorKind, type Plan, type Room, type Vec2 } from "../model/plan";
import { bounds } from "../model/geom";
import { domainOf, type Hass } from "../live/hass";
import { BALUSTRADE_DEFAULT, BALUSTRADE_MATERIALS, BALUSTRADES, CAR_TYPES, carModel, CATEGORY_NAMES, EV_TYPES, FURNITURE, isUpholstered, styleOptions, type BalustradeMaterial, type BalustradeStyle, type Category } from "../scene/furniture-lib";
import { EXTERIOR_FINISHES, FLOOR_FINISHES, FURNITURE_SWATCHES, JOINERY_FINISHES, JOINERY_SWATCHES, PAINT_SWATCHES, UPHOLSTERY, WALL_FINISHES, type FinishDef } from "../scene/finishes";
import { controlsFor, defaultFinish, styleOf, stylesFor } from "../scene/joinery";
import { pointInPolygon, segmentDistance } from "../model/geom";
import { layoutWalls, openingPoint } from "../model/walls";
import { CAMERA_NAMES, cameraRig } from "../scene/cameras";
import { FENCE_ORDER, FENCE_STYLES, FENCE_SWATCHES, fenceLength, fenceStyle } from "../scene/fences";
import { outdoorTop } from "../scene/build";
import { iconIndex, type MarkerSpec } from "../scene/markers";
import type { DragPhase, Hit } from "../scene/viewer";
import type { VhView } from "../ui/view";
import { EDITOR_CSS } from "./styles";
import { Collider, settle } from "./collide";
import { Plan2D, PLAN2D_CSS } from "./plan2d";
import { fetchBuildings, northFits, pickBuilding, type Footprint, type NorthFit } from "./north";
import { compassName } from "../live/sun";
import { location as homeLocation } from "../live/sky";

type Tab = "home" | "rooms" | "devices" | "selected" | "extensions";
type Selection = { floor: number; kind: "room" | "outdoor" | "device" | "furniture" | "opening" | "fence"; id: string } | null;
const OUTDOOR_KINDS: OutdoorKind[] = ["lawn", "patio", "deck", "path", "driveway", "bed", "gravel"];

const hexOf = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
const svg = (p: string) => `<svg viewBox="0 0 24 24"><path d="${p}"/></svg>`;

/** House Scan's detections.json (decor found while scanning). */
function isDetections(data: unknown): data is Detections {
  const d = data as Detections;
  return typeof d?.version === "number" && Array.isArray(d.objects) && d.objects.every((o) => typeof o?.label === "string" && Array.isArray(o.position));
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
  save(plan: Plan, baseRevision: number | null): Promise<number>;
  restorePoints?(): Promise<{ id: string; time: number; label: string | null; floors: number }[]>;
  restore?(id: string): Promise<void>;
  close(): void;
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

  constructor(private host: EditorHost) {
    this.plan = structuredClone(host.plan);
    this.savedJson = JSON.stringify(this.plan);
    const style = h("style", {}, EDITOR_CSS + PLAN2D_CSS);
    this.status = h("span", { class: "ed-status" });
    this.body = h("div", { class: "ed-body" });
    this.undoBtn = h("button", { class: "ed-hb", html: `${svg(mdiArrowULeftTop)}<span>Undo</span>`, onclick: () => this.doUndo() });
    this.redoBtn = h("button", { class: "ed-hb", html: `${svg(mdiArrowURightTop)}<span>Redo</span>`, onclick: () => this.doRedo() });
    this.saveBtn = h("button", { class: "ed-save", html: `${svg(mdiContentSave)}<span>Save</span>`, disabled: true, title: "Nothing to save", onclick: () => this.save() });
    this.el = h("div", { class: "ed" },
      style,
      h("div", { class: "ed-head" },
        h("b", {}, "Edit home"),
        this.undoBtn,
        this.redoBtn,
        this.saveBtn,
        h("button", { class: "ed-ib", title: "Close", html: svg(mdiClose), onclick: () => this.close() }),
      ),
      h("div", { class: "ed-modes" },
        ...this.modeButtons(),
      ),
      h("div", { class: "ed-tabs" },
        ...(["home", "rooms", "devices", "selected", "extensions"] as Tab[]).map((t) =>
          h("button", { class: "ed-tab", "data-tab": t, onclick: () => this.show(t) }, { home: "Home", rooms: "Rooms", devices: "Devices", selected: "Selected", extensions: "Extras" }[t]),
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
  }

  private modeButtons(): HTMLButtonElement[] {
    this.modeBtns = [
      h("button", { class: "ed-mode on", onclick: () => this.setPlanMode(false) }, "3D view"),
      h("button", { class: "ed-mode", onclick: () => this.setPlanMode(true) }, "2D plan"),
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
      });
      root.append(this.plan2d.el);
      this.status.textContent = "Select something, then drag it: furniture, devices, doors, windows, a room's corners and walls. Click a measurement to type it.";
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
    if (!sel || (sel.kind !== "furniture" && sel.kind !== "device" && sel.kind !== "opening" && sel.kind !== "fence")) return false;
    const f = this.plan.floors[sel.floor];
    const name = sel.kind === "furniture" ? FURNITURE[f?.furniture.find((x) => x.id === sel.id)?.type ?? ""]?.name ?? "furniture"
      : sel.kind === "device" ? "a device" : sel.kind === "fence" ? "a fence" : "an opening";
    this.change((p) => {
      const fl = p.floors[sel.floor];
      if (!fl) return;
      if (sel.kind === "furniture") fl.furniture = fl.furniture.filter((x) => x.id !== sel.id);
      else if (sel.kind === "device") fl.devices = fl.devices.filter((x) => x.id !== sel.id);
      else if (sel.kind === "fence") fl.fences = (fl.fences ?? []).filter((x) => x.id !== sel.id);
      else fl.openings = fl.openings.filter((x) => x.id !== sel.id);
    }, false, `Remove ${name}`);
    this.select(null);
    return true;
  }

  // ------------------------------------------------------------------ plan changes

  private get hass(): Hass {
    return this.host.view.hass ?? this.host.hass;
  }

  /** Applies a change with undo; `quiet` skips re-rendering the drawer (while dragging). */
  private change(fn: (p: Plan) => void, quiet = false, label = "Change"): void {
    this.undo.push({ plan: structuredClone(this.plan), label });
    if (this.undo.length > 100) this.undo.shift();
    this.redo = [];
    fn(this.plan);
    this.changed();
    this.apply(quiet);
  }

  private apply(quiet = false): void {
    this.host.view.previewPlan(this.plan);
    this.updateSelectionMarker();
    this.plan2d?.render();
    if (!quiet) this.render();
    this.status.textContent = this.dirty ? "Unsaved changes" : "Saved";
    this.updateHistoryButtons();
  }

  private updateHistoryButtons(): void {
    const u = this.undo[this.undo.length - 1];
    const r = this.redo[this.redo.length - 1];
    this.undoBtn.disabled = !u;
    this.redoBtn.disabled = !r;
    this.undoBtn.title = u ? `Undo: ${u.label} (Ctrl+Z)` : "Nothing to undo";
    this.redoBtn.title = r ? `Redo: ${r.label} (Ctrl+Shift+Z)` : "Nothing to redo";
  }

  private doUndo(): void {
    const prev = this.undo.pop();
    if (!prev) return;
    this.redo.push({ plan: this.plan, label: prev.label });
    this.plan = prev.plan;
    this.changed();
    this.dropMissingSelection();
    this.apply();
    this.status.textContent = `Undone: ${prev.label}`;
  }

  private doRedo(): void {
    const next = this.redo.pop();
    if (!next) return;
    this.undo.push({ plan: this.plan, label: next.label });
    this.plan = next.plan;
    this.changed();
    this.dropMissingSelection();
    this.apply();
    this.status.textContent = `Redone: ${next.label}`;
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
    this.saveBtn.disabled = !this.unsaved || this.saving;
    this.saveBtn.title = this.saving ? "Saving…" : this.unsaved ? "Save changes" : "Nothing to save";
  }

  private async save(): Promise<void> {
    if (!this.unsaved || this.saving) return;
    const json = JSON.stringify(this.plan);
    const saved = () => {
      // edits made while saving still need a save
      this.savedJson = json;
      this.changed();
      this.status.textContent = this.unsaved ? "Unsaved changes" : "Saved";
    };
    this.saving = true;
    this.updateSaveButton();
    this.status.textContent = "Saving…";
    try {
      // our own save is the base for the next one, so only someone else's save is a conflict
      this.host.revision = await this.host.save(this.plan, this.host.revision);
      saved();
    } catch (err) {
      const msg = String((err as { message?: string })?.message ?? err);
      if (/changed meanwhile|conflict/i.test(msg)) {
        this.confirm("Someone else saved the plan meanwhile. Save yours over it?", "Save mine", async () => {
          this.host.revision = await this.host.save(this.plan, null);
          saved();
        });
      } else this.status.textContent = `Not saved: ${msg}`;
    } finally {
      this.saving = false;
      this.updateSaveButton();
    }
  }

  close(): void {
    if (this.dirty) {
      this.confirm("Close without saving? Your changes are lost.", "Discard", () => this.finish());
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
    if (hit.item?.kind === "corner" || hit.item?.kind === "fencepoint") return;
    if (hit.item?.kind === "fenceedge") {
      // a tap on a fence's +: a corner in the middle of that stretch
      const sel = this.sel;
      const ref = hit.item.id, at = ref.lastIndexOf(":");
      if (sel) this.change((p) => {
        const fence = p.floors[sel.floor]?.fences?.find((x) => x.id === ref.slice(0, at));
        const i = Number(ref.slice(at + 1));
        const a = fence?.points[i], b = fence?.points[i + 1];
        if (fence && a && b) fence.points.splice(i + 1, 0, [Math.round(((a[0] + b[0]) / 2) * 100) / 100, Math.round(((a[1] + b[1]) / 2) * 100) / 100]);
      }, false, "Add a fence corner");
      return;
    }
    if (hit.item?.kind === "edge") {
      // a tap on a +: a corner in the middle of that edge (dragging the + puts it anywhere)
      const sel = this.sel;
      const e = sel && this.edgeOf(hit.item.id, sel.floor);
      if (sel && e) this.change((p) => splitEdge(p.floors[sel.floor], e.id, e.outdoor, e.k, e.len / 2), false, "Add a corner");
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
    return !!item && !!sel && (item.kind === "corner" || item.kind === "edge" || item.kind === "fencepoint" || item.kind === "fenceedge" || (item.kind === sel.kind && item.id === sel.id));
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
        const what = item.kind === "corner" ? "a corner" : item.kind === "opening" ? `a ${f.openings.find((o) => o.id === item.id)?.kind ?? "door"}` : item.kind === "device"
          ? String(this.hass.states[f.devices.find((d) => d.id === item.id)?.entity ?? ""]?.attributes.friendly_name ?? "a device")
          : FURNITURE[f.furniture.find((x) => x.id === item.id)?.type ?? ""]?.name ?? "furniture";
        this.undo.push({ plan: this.dragStart, label: item.kind === "edge" ? "Add a corner" : `Move ${what}` });
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
      this.undo.push({ plan: this.dragStart, label: kind === "fence" ? "Move a fence" : kind === "fenceedge" ? "Add a fence corner" : "Move a fence point" });
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
    this.status.textContent = this.dirty ? "Unsaved changes" : "Saved";
  }

  private homeTab(): HTMLElement {
    const fileIn = h("input", { type: "file", accept: ".json,application/json", multiple: true, hidden: true, onchange: (e: Event) => this.importFiles((e.target as HTMLInputElement).files) });
    const planIn = h("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: (e: Event) => this.loadPlanFile((e.target as HTMLInputElement).files?.[0]) });
    const box = h("div", {},
      h("h4", {}, "Scan"),
      h("p", { class: "ed-hint" }, "Choose the scan's files together: house.json, manifest.json (room names) and detections.json (plants, pictures, gym kit…). Rooms, doors, windows, furniture and decor come from the scan."),
      h("button", { class: "ed-btn", onclick: () => fileIn.click() }, "Import a scan…"),
      fileIn,
      h("h4", {}, "Devices"),
      h("p", { class: "ed-hint" }, "Links rooms to areas, contacts to doors and windows, and puts lights, cameras and sensors into their rooms. Keeps what is already placed."),
      h("button", { class: "ed-btn", onclick: () => this.runAutoPlace() }, "Place devices automatically"),
      h("div", { class: "ed-report" }),
      h("h4", {}, "Outside walls"),
      this.finishChips(EXTERIOR_FINISHES, this.plan.settings.exterior_finish ?? "render", (k) =>
        this.change((p) => (p.settings.exterior_finish = k as Plan["settings"]["exterior_finish"]), false, `Outside walls: ${(EXTERIOR_FINISHES as Record<string, FinishDef>)[k].name}`)),
      (EXTERIOR_FINISHES as Record<string, FinishDef>)[this.plan.settings.exterior_finish ?? "render"]?.tintable
        ? this.colourPicker(PAINT_SWATCHES, this.plan.settings.exterior_color, (c) => this.change((p) => (p.settings.exterior_color = c), false, "Outside wall colour"))
        : null,
      ...this.energySection(),
      ...this.skySection(),
      h("h4", {}, "Floors"),
      ...this.plan.floors.map((f, i) => this.floorRow(f, i)),
      h("h4", {}, "Plan file"),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => this.downloadPlan() }, "Download"),
        h("button", { class: "ed-btn ghost", onclick: () => planIn.click() }, "Load…"),
        planIn,
      ),
    );
    if (this.host.restorePoints) {
      const list = h("div", { class: "ed-list" }, h("p", { class: "ed-hint" }, "Loading…"));
      box.append(h("h4", {}, "Restore points"), list);
      this.host.restorePoints().then((points) => {
        list.replaceChildren(...(points.length ? points.map((p) =>
          h("div", { class: "ed-item" },
            h("span", {}, `${new Date(p.time * 1000).toLocaleString()}${p.label ? ` · ${p.label}` : ""}`),
            h("button", { class: "ed-btn ghost small", onclick: () => this.confirm("Go back to this version of the plan?", "Restore", async () => {
              await this.host.restore!(p.id);
              this.finish();
            }) }, "Restore"),
          )) : [h("p", { class: "ed-hint" }, "None yet: every save keeps the version before it.")]));
      }).catch(() => list.replaceChildren(h("p", { class: "ed-hint" }, "Not available here.")));
    }
    return box;
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
      Object.keys(hass.states).filter((id) => domainOf(id) === "sensor" && ok(id)).map((id) => [id, name(id)] as [string, string]).sort((a, b) => a[1].localeCompare(b[1]));
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
      return `Automatic: ${found.length ? found.map(name).join(" + ") : "none"}`;
    };
    const row = (label: string, k: keyof EnergySettings, options: [string, string][], autoLabel: string) =>
      h("div", { class: "ed-row" },
        h("label", {}, label),
        this.dropdown(options, k === "solar" ? set.solar?.[0] ?? "" : String(set[k] ?? ""), (v) =>
          edit(k, k === "solar" ? (v ? [v] : null) : v || null, `Energy: ${label.toLowerCase()}`), autoLabel),
      );
    return [
      h("h4", {}, "Energy"),
      h("p", { class: "ed-hint" }, "Solar, battery and grid are read from Home Assistant's energy settings, and car chargers from their integrations. Pick a sensor only where the automatic one is wrong. Solar panels placed in the plan shine with what they make; EV chargers and cars light up while charging."),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: set.enabled !== false, onchange: (e: Event) => edit("enabled", (e.target as HTMLInputElement).checked ? null : false, "Energy shown") }),
        " Show solar, battery and grid"),
      row("Solar", "solar", power, automatic(...auto.solar)),
      row("House", "home", power, auto.home ? automatic(auto.home) : "Automatic: worked out from the others"),
      row("Battery in", "battery_charge", power, automatic(auto.batteryCharge ?? auto.battery)),
      row("Battery out", "battery_discharge", power, automatic(auto.batteryDischarge ?? auto.battery)),
      row("Battery level", "battery_level", levels, automatic(auto.batteryLevel)),
      row("Grid import", "grid_import", power, automatic(auto.gridImport ?? auto.grid)),
      row("Grid export", "grid_export", power, automatic(auto.gridExport ?? auto.grid)),
      row("Price to buy", "price_import", prices, automatic(auto.priceImport)),
      row("Price to sell", "price_export", prices, automatic(auto.priceExport)),
      h("div", { class: "ed-row" },
        h("label", {}, "Panels' peak (kW)"),
        h("input", { class: "ed-in num", type: "number", step: "0.1", min: "0", value: set.solar_peak ? String(set.solar_peak) : "", placeholder: "auto",
          onchange: (e: Event) => edit("solar_peak", Number((e.target as HTMLInputElement).value) || null, "Energy: panels' peak") }),
      ),
      h("div", { class: "ed-sub" }, "Car charging"),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: set.ev_enabled !== false, onchange: (e: Event) => edit("ev_enabled", (e.target as HTMLInputElement).checked ? null : false, "Car charging shown") }),
        " Show the car charger"),
      row("Charger", "ev_charger", power, auto.ev.length ? `Automatic: ${auto.ev.map((c) => c.name).join(" + ")}` : "Automatic: none found"),
      row("Car battery", "ev_level", levels, automatic(auto.ev[0]?.level ?? null)),
    ];
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
    if (fit && "busy" in fit) mapRows = [h("p", { class: "ed-hint" }, "Asking OpenStreetMap…")];
    else if (fit && "error" in fit) mapRows = [h("p", { class: "ed-hint" }, fit.error)];
    else if (fit && "building" in fit) {
      const b = fit.building;
      const where = b.distance < 1 ? "at the home location" : `${Math.round(b.distance)} m from the home location`;
      mapRows = [
        h("p", { class: "ed-hint" }, `Found a building ${where}, ${b.size[0].toFixed(1)} × ${b.size[1].toFixed(1)} m. If the house faces another way, pick it:`),
        h("div", { class: "ed-row" }, ...fit.fits.map((f) =>
          h("button", { class: `ed-btn small${Math.abs(f.north - north) < 0.5 ? "" : " ghost"}`, onclick: () => this.setNorth(f.north) }, `${Math.round(f.north)}° ${compassName(f.north)}`))),
      ];
    }
    return [
      h("h4", {}, "Sun and weather"),
      h("p", { class: "ed-hint" }, "Which way the top of the plan faces. With it right, the sun lights the house and casts its shadows as it does outside, at every hour and season. Drag the N to where north is."),
      h("div", { class: "ed-row" },
        this.northDial(north),
        h("div", { class: "ed-col" },
          h("div", { class: "ed-row" },
            h("label", {}, "Faces"),
            h("input", { class: "ed-in num", type: "number", step: "1", min: "0", max: "359", value: String(Math.round(north * 10) / 10),
              onchange: (e: Event) => this.setNorth(Number((e.target as HTMLInputElement).value) || 0) }),
            h("span", {}, `° ${compassName(north)}`)),
          h("button", { class: "ed-btn ghost", onclick: () => this.lineUpWithMap() }, "Line up with the map"),
        ),
      ),
      h("p", { class: "ed-hint" }, "Line up with the map sends Home Assistant's home location to a public OpenStreetMap server (overpass-api.de, or overpass.kumi.systems when that one is busy) for the outline of the building there, and turns the plan to match its walls. Map data © OpenStreetMap contributors."),
      ...mapRows.filter((e): e is HTMLElement => !!e),
      h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: sky.enabled !== false, onchange: (e: Event) => editSky("enabled", (e.target as HTMLInputElement).checked ? null : false, "Weather shown") }),
        " Show the weather: clouds, rain, snow, fog and wind"),
      h("div", { class: "ed-row" },
        h("label", {}, "Weather"),
        this.dropdown(weathers, sky.weather ?? "", (v) => editSky("weather", v || null, "Weather entity"), `Automatic: ${autoWeather ? weathers.find(([id]) => id === autoWeather)?.[1] ?? autoWeather : "none"}`)),
    ];
  }

  private setNorth(n: number): void {
    const v = Math.round((((n % 360) + 360) % 360) * 10) / 10;
    this.change((p) => (p.settings.north = v), false, "North");
  }

  /** A compass to drag: the N goes where north is on the plan (the plan's top is up). Shift snaps to 15°. */
  private northDial(north: number): HTMLElement {
    const dial = h("div", { class: "ed-compass", title: "Drag the N to where north is on the plan" });
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
        this.undo.push({ plan: before, label: "North" });
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
      this.mapFit = { error: "Home Assistant has no home location: set it under Settings → System → General." };
      this.render();
      return;
    }
    this.mapFit = { busy: true };
    this.render();
    try {
      const buildings = await fetchBuildings(loc.lat, loc.lon);
      const building = pickBuilding(this.plan, buildings);
      if (!building) {
        this.mapFit = { error: "OpenStreetMap has no building outline near the home location. Set north by hand." };
        this.render();
        return;
      }
      const fits = northFits(this.plan, building);
      this.mapFit = { building, fits };
      if (fits[0]) this.setNorth(fits[0].north);
      else this.render();
    } catch (err) {
      this.mapFit = { error: `OpenStreetMap could not be reached (${(err as Error).message ?? err}). Try again later, or set north by hand.` };
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
      h("div", { class: "ed-row" }, h("label", {}, "Shown"),
        this.dropdown([["plugged", "While plugged in"], ...here], x.parked ?? "", (v) => this.change((p) => {
          const y = p.floors[fi].furniture.find((z) => z.id === x.id)!;
          if (v) y.parked = v;
          else delete y.parked;
        }, false, "Car shown"), "Always")),
      h("p", { class: "ed-hint" }, "A car that is away is left out of the 3D view. A charger only knows when the car is plugged in; a tracker in the car, or its own integration, knows when it is parked."),
      model && name && !same
        ? h("button", { class: "ed-btn ghost", onclick: () => reshape("Shape")((y) => {
          y.type = model.type;
          [y.w, y.d, y.h] = model.size;
        }) }, `Shape it like the ${name}`)
        : null,
    ];
    return rows.filter((e): e is HTMLElement => !!e);
  }

  private floorRow(f: Floor, i: number): HTMLElement {
    const haFloors = Object.values(this.hass.floors ?? {});
    return h("div", { class: "ed-card" },
      h("input", { class: "ed-in", value: f.name, onchange: (e: Event) => this.change((p) => (p.floors[i].name = (e.target as HTMLInputElement).value)) }),
      h("div", { class: "ed-row" },
        h("label", {}, "HA floor"),
        this.dropdown(haFloors.map((x) => [x.floor_id, x.name]), f.ha_floor ?? "", (v) => this.change((p) => (p.floors[i].ha_floor = v || null)), "—"),
      ),
      h("div", { class: "ed-row" },
        h("label", {}, "Level (m)"),
        h("input", { class: "ed-in num", type: "number", step: "0.05", value: String(f.elevation), onchange: (e: Event) => this.change((p) => (p.floors[i].elevation = Number((e.target as HTMLInputElement).value))) }),
        h("label", {}, "Height"),
        h("input", { class: "ed-in num", type: "number", step: "0.05", value: String(f.height), onchange: (e: Event) => this.change((p) => (p.floors[i].height = Number((e.target as HTMLInputElement).value))) }),
      ),
      h("div", { class: "ed-row" },
        h("label", {}, "Outside"),
        this.dropdown(Object.entries(EXTERIOR_FINISHES).map(([k, d]) => [k, d.name]), f.exterior_finish ?? "", (v) =>
          this.change((p) => (p.floors[i].exterior_finish = (v || null) as Floor["exterior_finish"]), false, `${f.name} outside walls`), "Same as the house"),
      ),
    );
  }

  /** Licence key and extensions. Buying shows up only once VirtuMaps opens the shop on the server. */
  private extensionsTab(): HTMLElement {
    const box = h("div", {}, h("p", { class: "ed-hint" }, "Loading…"));
    const hass = this.hass;
    type Summary = { status: string; error: string | null; key_hint: string | null; extensions: { id: string; name: string; version: string }[] };
    type Catalog = { id: string; name: string; description?: string; price?: string; checkout_url?: string }[];
    const render = (s: Summary | null, catalog: Catalog, note = "") => {
      const installed = new Set(s?.extensions.map((x) => x.id));
      const input = h("input", { class: "ed-in", placeholder: "Licence key", autocomplete: "off", spellcheck: false });
      const status = h("p", { class: "ed-hint" }, note);
      const busy = (b: HTMLButtonElement, text: string) => {
        b.disabled = true;
        b.textContent = text;
      };
      const parts: (Node | null)[] = [
        h("h4", {}, "Licence"),
        s && s.status !== "none"
          ? h("div", { class: "ed-card" },
            h("div", { class: "ed-row" }, h("b", {}, s.status === "active" ? "Active" : s.status === "expired" ? "Expired — renews online" : "Not valid"), h("small", {}, s.key_hint ?? "")),
            s.error ? h("p", { class: "ed-hint" }, s.error) : null,
            ...s.extensions.map((x) => h("div", { class: "ed-item" }, h("span", {}, x.name), h("small", {}, x.version))),
            h("div", { class: "ed-row" },
              h("button", { class: "ed-btn ghost small", onclick: async (ev: Event) => {
                busy(ev.target as HTMLButtonElement, "Checking…");
                try {
                  render(await hass.callWS<Summary>({ type: "virtuhome/licence/refresh" }), catalog, "Up to date. Reload the page to use new versions.");
                } catch (err) {
                  render(s, catalog, String((err as { message?: string }).message ?? err));
                }
              } }, "Check for updates"),
              h("button", { class: "ed-btn ghost small", onclick: () => this.confirm("Remove the licence from this Home Assistant? Its extensions stop working here, and the activation is freed for another one.", "Remove", async () => {
                render(await hass.callWS<Summary>({ type: "virtuhome/licence/remove" }), catalog, "Licence removed.");
              }) }, "Remove licence"),
            ))
          : h("p", { class: "ed-hint" }, "Extensions add features such as the wall tablet mode. Enter the licence key you got from VirtuMaps."),
        h("div", { class: "ed-row" },
          input,
          h("button", { class: "ed-btn small", onclick: async (ev: Event) => {
            const key = input.value.trim();
            if (key.length < 8) return;
            busy(ev.target as HTMLButtonElement, "Activating…");
            try {
              const next = await hass.callWS<Summary>({ type: "virtuhome/licence/activate", key });
              render(next, catalog, "Activated. Reload the page to start using the extensions.");
            } catch (err) {
              render(s, catalog, String((err as { message?: string }).message ?? err));
            }
          } }, "Activate"),
        ),
        status,
        note.includes("Reload") ? h("button", { class: "ed-btn ghost small", onclick: () => location.reload() }, "Reload now") : null,
        h("h4", {}, "Available extensions"),
        ...(catalog.length ? catalog.map((c) => h("div", { class: "ed-card" },
          h("div", { class: "ed-row" }, h("b", {}, c.name), installed.has(c.id) ? h("small", {}, "· installed") : null),
          c.description ? h("p", { class: "ed-hint" }, c.description) : null,
          !installed.has(c.id) && c.checkout_url ? h("a", { class: "ed-btn small", href: c.checkout_url, target: "_blank", rel: "noopener" }, `Get it${c.price ? ` · ${c.price}` : ""}`) : null,
        )) : [h("p", { class: "ed-hint" }, "The list of extensions could not be loaded right now.")]),
        !catalog.some((c) => c.checkout_url) ? h("p", { class: "ed-hint" }, "Extensions are currently available to VirtuMaps installation clients.") : null,
      ];
      box.replaceChildren(...parts.filter((x): x is Node => x !== null));
    };
    Promise.all([
      hass.callWS<Summary>({ type: "virtuhome/licence/get" }).catch(() => null),
      hass.callWS<Catalog>({ type: "virtuhome/catalog" }).catch(() => [] as Catalog),
    ]).then(([s, c]) => render(s, c, s ? "" : "Extensions need the VirtuHome integration."));
    return box;
  }

  private roomsTab(): HTMLElement {
    const areas = Object.values(this.hass.areas ?? {}).sort((a, b) => a.name.localeCompare(b.name));
    const box = h("div", {},
      h("p", { class: "ed-hint" }, "Tap a room or garden area in 3D, then drag its blue corners to reshape it. Corners shared with a neighbour move together. To add a corner, drag a + from the middle of an edge to where it goes."),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => this.addRoom() }, "Add a room"),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addGarden("back") }, "Add back garden"),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addGarden("front") }, "Add front area"),
        h("button", { class: "ed-btn ghost small", onclick: () => this.startFence() }, "Draw a fence"),
      ),
    );
    this.plan.floors.forEach((f, fi) => {
      box.append(h("h4", {}, f.name));
      for (const fence of f.fences ?? []) {
        box.append(h("div", { class: `ed-card ${this.sel?.id === fence.id ? "on" : ""}`, onclick: () => this.select({ floor: fi, kind: "fence", id: fence.id }) },
          h("div", { class: "ed-row" }, h("b", {}, `${fenceStyle(fence.style).name} fence`), h("small", {}, ` · ${fenceLength(fence).toFixed(1)} m${fence.gates?.length ? `, ${fence.gates.length} gate${fence.gates.length > 1 ? "s" : ""}` : ""}`)),
        ));
      }
      for (const o of f.outdoor ?? []) {
        box.append(h("div", { class: `ed-card ${this.sel?.id === o.id ? "on" : ""}`, onclick: () => this.select({ floor: fi, kind: "outdoor", id: o.id }) },
          h("div", { class: "ed-row" }, h("b", {}, o.name), h("small", {}, ` · ${o.kind}`)),
        ));
      }
      f.rooms.forEach((r, ri) => {
        box.append(h("div", { class: `ed-card ${this.sel?.kind === "room" && this.sel.id === r.id ? "on" : ""}` },
          h("div", { class: "ed-row" },
            h("input", { class: "ed-in", value: r.name, onchange: (e: Event) => this.change((p) => (p.floors[fi].rooms[ri].name = (e.target as HTMLInputElement).value)) }),
            h("button", { class: "ed-btn ghost small", onclick: () => {
              this.host.view.viewer.selectRoom(fi, ri);
              this.select({ floor: fi, kind: "room", id: r.id });
            } }, "Show"),
          ),
          h("div", { class: "ed-row" },
            h("label", {}, "Area"),
            this.dropdown(areas.map((a) => [a.area_id, a.name]), r.area_id ?? "", (v) => this.change((p) => (p.floors[fi].rooms[ri].area_id = v || null)), "Not linked"),
          ),
          h("div", { class: "ed-row" },
            h("label", {}, "Floor"),
            this.dropdown(Object.entries(FLOOR_FINISHES).map(([k, d]) => [k, d.name]), r.floor ?? "wood", (v) => this.change((p) => (p.floors[fi].rooms[ri].floor = v as FloorMaterial), false, `${r.name} floor`)),
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
    box.append(h("h4", {}, `Not placed (${missing.length})`));
    if (!missing.length) box.append(h("p", { class: "ed-hint" }, "Everything in the linked areas is in the plan."));
    for (const m of missing.slice(0, 80)) {
      box.append(h("div", { class: "ed-item" },
        h("span", {}, name(m.id), h("small", {}, ` · ${m.room.name}`)),
        h("button", { class: "ed-btn ghost small", onclick: () => this.addDevice(m.fi, m.room, m.id) }, "Add"),
      ));
    }
    this.plan.floors.forEach((f, fi) => {
      box.append(h("h4", {}, `${f.name}: placed`));
      for (const d of f.devices) {
        box.append(h("div", { class: "ed-item", onclick: () => this.select({ floor: fi, kind: "device", id: d.id }) },
          h("span", {}, name(d.entity)),
          h("button", { class: "ed-ib small", title: "Remove", html: svg(mdiDelete), onclick: (e: Event) => {
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
    if (!s) return h("p", { class: "ed-hint" }, "Tap a room, a device or a piece of furniture in 3D. Once it is selected, drag it to move it; dragging anything else turns the view.");
    const fi = s.floor;
    const f = this.plan.floors[fi];
    if (!f) return h("div", {});
    if (s.kind === "room") return this.roomPanel(fi, f.rooms.find((r) => r.id === s.id));
    if (s.kind === "outdoor") return this.outdoorPanel(fi, f.outdoor?.find((o) => o.id === s.id));
    if (s.kind === "device") return this.devicePanel(fi, f.devices.find((d) => d.id === s.id));
    if (s.kind === "opening") return this.openingPanel(fi, f.openings.find((o) => o.id === s.id));
    if (s.kind === "fence") return this.fencePanel(fi, f.fences?.find((x) => x.id === s.id));
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
      h("div", { class: "ed-sub" }, "Floor"),
      this.finishChips(FLOOR_FINISHES, room.floor ?? "wood", (k) => updRoom(`${room.name} floor`, (r) => (r.floor = k as FloorMaterial))),
      h("div", { class: "ed-sub" }, "Walls"),
      this.finishChips(WALL_FINISHES, wallFinish, (k) => updRoom(`${room.name} walls`, (r) => (r.wall_finish = k as Room["wall_finish"]))),
      (WALL_FINISHES as Record<string, FinishDef>)[wallFinish]?.tintable
        ? this.colourPicker(PAINT_SWATCHES, room.wall_color, (c) => updRoom(`${room.name} wall colour`, (r) => (r.wall_color = c)), "Plain white")
        : null,
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
          for (const fl of p.floors) for (const r of fl.rooms) {
            r.wall_finish = room.wall_finish;
            r.wall_color = room.wall_color ?? null;
          }
        }, false, "Walls in every room") }, "Use these walls everywhere"),
      ),
      h("h4", {}, "Add furniture and decor"),
      this.itemPicker((type) => this.addFurniture(fi, room, type)),
      h("h4", {}, `In this room (${inRoom.length})`),
      h("div", { class: "ed-chips" }, ...inRoom.map((x) => h("button", { class: "ed-chip", onclick: () => this.select({ floor: fi, kind: "furniture", id: x.id }) },
        FURNITURE[x.type]?.name ?? x.type))),
      h("h4", {}, `Doors and windows (${openings.length})`),
      ...openings.map((o) => h("div", { class: "ed-card" },
        h("div", { class: "ed-row" }, h("b", {}, o.kind), h("small", {}, `${o.width.toFixed(2)} m wide`),
          h("button", { class: "ed-btn ghost small", onclick: () => this.select({ floor: fi, kind: "opening", id: o.id }) }, "Edit")),
        h("div", { class: "ed-row" },
          h("label", {}, "Sensor"),
          this.dropdown(contacts, o.entity ?? "", (v) => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.entity = v || null;
          }), "None"),
        ),
        o.kind === "window" ? h("div", { class: "ed-row" },
          h("label", {}, "Blind"),
          this.dropdown(covers, o.cover ?? "", (v) => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.cover = v || null;
          }), "None"),
        ) : null,
        o.kind === "door" ? h("div", { class: "ed-row" },
          h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.hinge = x.hinge === "right" ? "left" : "right";
          }) }, "Flip hinge"),
          h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
            const x = p.floors[fi].openings.find((y) => y.id === o.id)!;
            x.swing = x.swing === "out" ? "in" : "out";
          }) }, "Swing other way"),
        ) : null,
      )),
      h("p", { class: "ed-hint" }, "To add a corner, drag a + from the middle of a wall to where it goes; a tap puts it in the middle. In the 2D plan, the corner tool puts it where you click."),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => this.confirm(`Remove ${room.name} with its doors and windows?`, "Remove", () => {
          this.change((p) => {
            const fl = p.floors[fi];
            fl.rooms = fl.rooms.filter((r) => r.id !== room.id);
            fl.openings = fl.openings.filter((x) => x.room_id !== room.id);
          });
          this.select(null);
        }) }, "Remove room"),
      ),
    );
  }

  private outdoorPanel(fi: number, o: OutdoorArea | undefined): HTMLElement {
    if (!o) return h("div", {});
    const areas = Object.values(this.hass.areas ?? {}).sort((a, b) => a.name.localeCompare(b.name));
    const upd = (fn: (x: OutdoorArea) => void) => this.change((p) => fn(p.floors[fi].outdoor!.find((y) => y.id === o.id)!));
    return h("div", {},
      h("h4", {}, "Garden area"),
      h("p", { class: "ed-hint" }, "Drag the blue corners to shape it. To add a corner, drag a + from the middle of an edge to where it goes; a tap puts it in the middle. Lights of its area light it up at night."),
      h("div", { class: "ed-row" }, h("label", {}, "Name"), h("input", { class: "ed-in", value: o.name, onchange: (e: Event) => upd((x) => (x.name = (e.target as HTMLInputElement).value)) })),
      h("div", { class: "ed-row" }, h("label", {}, "Ground"), this.dropdown(OUTDOOR_KINDS.map((k) => [k, k]), o.kind, (v) => upd((x) => (x.kind = v as OutdoorKind)))),
      o.kind === "driveway" ? h("div", { class: "ed-row" },
        h("label", {}, "Surface"),
        this.dropdown([["blocks", "block paving"], ["asphalt", "asphalt"]], o.surface ?? "blocks", (v) => upd((x) => (x.surface = v === "asphalt" ? "asphalt" : null))),
      ) : null,
      h("div", { class: "ed-row" }, h("label", {}, "Area"), this.dropdown(areas.map((a) => [a.area_id, a.name]), o.area_id ?? "", (v) => upd((x) => (x.area_id = v || null)), "Not linked")),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", title: "A fence along its edges, except those along the house", onclick: () => this.fenceRound(fi, o) }, "Fence round it"),
        h("button", { class: "ed-btn danger", onclick: () => {
          this.change((p) => (p.floors[fi].outdoor = (p.floors[fi].outdoor ?? []).filter((x) => x.id !== o.id)));
          this.select(null);
        } }, "Remove"),
      ),
    );
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
    const posts: [FencePost, string][] = [["timber", "timber"], ["concrete", "concrete"], ["metal", "metal"], ["pier", "brick piers"]];
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
      h("h4", {}, `${def.name} fence`),
      h("p", { class: "ed-hint" }, `${len.toFixed(1)} m long. Drag its blue points to move them or a + to add a corner; drag the fence itself to move it. In the 2D plan, the fence tool draws new ones.`),
      h("div", { class: "ed-sub" }, "Style"),
      h("div", { class: "ed-chips" }, ...FENCE_ORDER.map((k) => h("button", { class: `ed-chip${k === fence.style ? " on" : ""}`, onclick: () => k !== fence.style && upd(`Fence: ${FENCE_STYLES[k].name}`, (x) => {
        // the new style's usual height, unless the height was picked
        if (Math.abs(x.height - def.height) < 0.001) x.height = FENCE_STYLES[k].height;
        if (x.color && x.color === def.color) x.color = null;
        x.style = k as FenceStyle;
        x.posts = null;
        x.spacing = null;
      }) }, FENCE_STYLES[k].name))),
      h("div", { class: "ed-row" },
        h("label", {}, "Height m"),
        num(fence.height, String(def.height), "0.05", (v) => upd("Fence height", (x) => (x.height = Math.max(0.3, Math.min(3, v ?? def.height))))),
        ...[0.9, 1.2, 1.5, 1.8, 2.0].map((v) => h("button", { class: `ed-chip${Math.abs(fence.height - v) < 0.001 ? " on" : ""}`, onclick: () => upd("Fence height", (x) => (x.height = v)) }, `${v.toFixed(1)}`)),
      ),
      def.paint.length ? h("div", { class: "ed-sub" }, "Colour") : null,
      def.paint.length ? this.colourPicker(FENCE_SWATCHES, fence.color, (c) => upd("Fence colour", (x) => (x.color = c)), def.color ? "Usual" : "Natural") : null,
      h("div", { class: "ed-row" },
        h("label", {}, "Posts"),
        this.dropdown(posts, fence.posts ?? "", (v) => upd("Fence posts", (x) => (x.posts = (v || null) as FencePost | null)), `usual (${def.posts === "pier" ? "brick piers" : def.posts})`),
        h("label", {}, "Every m"),
        num(fence.spacing, String(def.spacing), "0.05", (v) => upd("Post spacing", (x) => (x.spacing = v && v >= 0.6 ? v : null)), "Distance between posts"),
      ),
      def.timber ? h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: fence.gravel_board ?? def.gravel, onchange: (e: Event) => upd("Gravel board", (x) => (x.gravel_board = (e.target as HTMLInputElement).checked)) }),
        " Concrete gravel board along the bottom") : null,
      def.timber && fence.style !== "trellis" ? h("label", { class: "ed-check" },
        h("input", { type: "checkbox", checked: fence.topper === "trellis", onchange: (e: Event) => upd("Trellis topper", (x) => (x.topper = (e.target as HTMLInputElement).checked ? "trellis" : null)) }),
        " Trellis on top (30 cm)") : null,
      h("div", { class: "ed-sub" }, `Gates (${gates.length})`),
      ...gates.map((g, gi) => h("div", { class: "ed-row" },
        h("label", {}, "At m"),
        num(g.at, "", "0.1", (v) => upd("Move a gate", (x) => (x.gates![gi].at = Math.max(g.width / 2, Math.min(len - g.width / 2, v ?? g.at)))), "Its middle, from the fence's first point"),
        h("label", {}, "Wide"),
        num(g.width, "", "0.05", (v) => upd("Gate width", (x) => (x.gates![gi].width = Math.max(0.5, Math.min(6, v ?? g.width))))),
        h("button", { class: `ed-chip${g.double ? " on" : ""}`, title: "Two leaves meeting in the middle", onclick: () => upd("Gate leaves", (x) => (x.gates![gi].double = !g.double)) }, "Double"),
        h("button", { class: "ed-ib small", title: "Remove the gate", html: svg(mdiDelete), onclick: () => upd("Remove a gate", (x) => (x.gates = x.gates!.filter((_, k) => k !== gi))) }),
      )),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost small", onclick: () => upd("Add a gate", (x) => (x.gates = [...(x.gates ?? []), { at: freeSpot(0.9), width: 0.9 }])) }, "Add a gate"),
        h("button", { class: "ed-btn ghost small", onclick: () => upd("Add a driveway gate", (x) => (x.gates = [...(x.gates ?? []), { at: freeSpot(3), width: 3, double: true }])) }, "Add a driveway gate"),
      ),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => {
          const id = newId("fence");
          this.change((p) => {
            const fl = p.floors[fi];
            fl.fences = [...(fl.fences ?? []), { ...structuredClone(fence), id, points: fence.points.map(([px, pz]) => [px + 0.5, pz + 0.5] as Vec2) }];
          }, false, "Duplicate a fence");
          this.select({ floor: fi, kind: "fence", id });
        } }, "Duplicate"),
        h("button", { class: "ed-btn danger", onclick: () => {
          this.change((p) => (p.floors[fi].fences = (p.floors[fi].fences ?? []).filter((x) => x.id !== fence.id)), false, "Remove a fence");
          this.select(null);
        } }, "Remove"),
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
      this.status.textContent = "Every edge of it is along the house.";
      return;
    }
    const style: FenceStyle = o.kind === "patio" || o.kind === "deck" ? "glass" : o.kind === "driveway" || o.kind === "path" ? "brick_wall" : "closeboard";
    const made = runs.map((points) => ({ id: newId("fence"), points: points.map(([x, z]) => [x, z] as Vec2), style, height: FENCE_STYLES[style].height, gates: [] }) as Fence);
    this.change((p) => {
      const fl = p.floors[fi];
      fl.fences = [...(fl.fences ?? []), ...made];
    }, false, `Fence round ${o.name}`);
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
      h("div", { class: "ed-row" }, h("label", {}, "Entity"), this.entityInput(all, d.entity, (v) => upd((x) => (x.entity = v)))),
      h("div", { class: "ed-row" },
        h("label", {}, "Mount"),
        this.dropdown([["ceiling", "ceiling"], ["wall", "wall"], ["floor", "floor"], ["table", "table"]], d.mount ?? "", (v) => upd((x) => (x.mount = (v || null) as Device["mount"])), "auto"),
        h("label", {}, "Height"),
        h("input", { class: "ed-in num", type: "number", step: "0.1", value: d.y === null || d.y === undefined ? "" : String(d.y), placeholder: "auto", onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          upd((x) => (x.y = v === "" ? null : Number(v)));
        } }),
      ),
      // a camera without a set direction looks away from its wall: turning starts from there
      this.turnRow((deg) => upd((x) => (x.rotation = ((x.rotation ?? rig?.heading ?? 0) + deg + 360) % 360))),
      rig ? h("div", { class: "ed-row" },
        h("label", {}, "View °"),
        h("input", { class: "ed-in num", type: "number", step: "5", min: "20", max: "360", value: d.fov ? String(d.fov) : "", placeholder: String(rig.fov), title: "Field of view in degrees (360: all round)", onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          upd((x) => (x.fov = v === "" ? null : Math.max(20, Math.min(360, Number(v)))));
        } }),
        h("label", {}, "Reach m"),
        h("input", { class: "ed-in num", type: "number", step: "0.5", min: "0.5", max: "30", value: d.reach ? String(d.reach) : "", placeholder: String(rig.reach), title: "How far it sees, in metres", onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          upd((x) => (x.reach = v === "" ? null : Math.max(0.5, Math.min(30, Number(v)))));
        } }),
      ) : null,
      rig ? h("p", { class: "ed-hint" }, `Shown as ${CAMERA_NAMES[rig.kind]}. Mount it on the ceiling for a dome, or on a table or the floor for a camera on a stand. Empty fields use the usual values.`) : null,
      h("button", { class: "ed-btn danger", onclick: () => {
        this.change((p) => (p.floors[fi].devices = p.floors[fi].devices.filter((x) => x.id !== d.id)));
        this.select(null);
      } }, "Remove from plan"),
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
        ? chargers.map((c) => [c.status ?? c.power ?? c.level ?? "", c.name] as [string, string]).filter(([id]) => id)
        : this.entities((id) => ["media_player", "switch", "binary_sensor"].includes(domainOf(id)));
    // a change of size, height, turn or side keeps the piece out of walls and other pieces
    const reshape = (label: string) => (fn: (y: Furniture) => void) => this.change((p) => {
      fn(p.floors[fi].furniture.find((y) => y.id === x.id)!);
      settle(p, fi, x.id);
    }, false, `${label} ${def?.name ?? "item"}`);
    const num = (label: string, key: "w" | "d" | "h" | "y") =>
      [h("label", {}, label), h("input", {
        class: "ed-in num", type: "number", step: "0.05",
        // an empty height above the floor means the type's usual one (a wall cupboard's, a ceiling lamp's)
        value: key === "y" ? (x.y === null || x.y === undefined ? "" : String(x.y)) : String(x[key]), placeholder: key === "y" ? "auto" : "",
        onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          reshape("Resize")((y) => {
            if (key === "y" && v === "") delete y.y;
            else y[key] = Number(v);
          });
        },
      })];
    const styles = styleOptions(x.type);
    const finish = x.finish ?? def?.finish ?? "fabric";
    const named = (label: string) => (fn: (y: Furniture) => void) => this.change((p) => fn(p.floors[fi].furniture.find((y) => y.id === x.id)!), false, `${label} ${def?.name ?? "item"}`);
    return h("div", {},
      h("h4", {}, def?.name ?? x.type),
      styles.length > 1 ? h("div", { class: "ed-sub" }, "Style") : null,
      styles.length > 1 ? h("div", { class: "ed-chips" }, ...styles.map((k) =>
        h("button", { class: `ed-chip${k === x.type ? " on" : ""}`, onclick: () => k !== x.type && this.swapType(fi, x, k) }, FURNITURE[k].name))) : null,
      h("div", { class: "ed-sub" }, "Colour"),
      this.colourPicker(FURNITURE_SWATCHES, x.color, (c) => named("Recolour")((y) => (y.color = c)), "Original"),
      isUpholstered(x.type) ? h("div", { class: "ed-sub" }, "Upholstery") : null,
      isUpholstered(x.type) ? this.finishChips(UPHOLSTERY, finish, (k) => named("Reupholster")((y) => (y.finish = k as Furniture["finish"]))) : null,
      ...(def?.family === "stairs" ? this.balustradeRows(x, named) : []),
      h("div", { class: "ed-row" }, h("label", {}, EV_TYPES.has(x.type) ? "Charger" : "Linked to"),
        this.dropdown(linkable, x.entity ?? "", (v) => upd((y) => (y.entity = v || null)), EV_TYPES.has(x.type) ? (chargers.length ? "The house's charger" : "None found") : "Nothing")),
      ...(CAR_TYPES.has(x.type) ? this.carRows(fi, x, reshape) : []),
      h("div", { class: "ed-row" }, ...num("Width", "w"), ...num("Depth", "d")),
      h("div", { class: "ed-row" }, ...num("Height", "h"), ...num("Above floor", "y")),
      this.turnRow((deg) => reshape("Turn")((y) => (y.rotation = Math.round(((y.rotation + deg) % 360 + 360) % 360))),
        h("button", { class: `ed-ib${x.mirror ? " on" : ""}`, title: "Mirror", html: svg(mdiFlipHorizontal), onclick: () => reshape("Mirror")((y) => (y.mirror = !y.mirror)) })),
      h("div", { class: "ed-row" },
        h("button", { class: "ed-btn ghost", onclick: () => {
          const id = newId("f");
          this.change((p) => {
            p.floors[fi].furniture.push({ ...structuredClone(x), id, x: x.x + 0.3, z: x.z + 0.3 });
            settle(p, fi, id);
          }, false, `Duplicate ${def?.name ?? "item"}`);
        } }, "Duplicate"),
        h("button", { class: "ed-btn danger", onclick: () => {
          this.change((p) => (p.floors[fi].furniture = p.floors[fi].furniture.filter((y) => y.id !== x.id)));
          this.select(null);
        } }, "Remove"),
      ),
    );
  }

  /** Stairs: the balustrade's style, what it is made of, and which side it is on. */
  private balustradeRows(x: Furniture, named: (label: string) => (fn: (y: Furniture) => void) => void): (HTMLElement | null)[] {
    const style = x.balustrade ?? "none";
    const material = x.balustrade_material ?? (style === "none" ? "primed" : BALUSTRADE_DEFAULT[style]);
    const side = x.balustrade_side ?? "right";
    const chip = (label: string, on: boolean, onclick: () => void) => h("button", { class: `ed-chip${on ? " on" : ""}`, onclick: () => !on && onclick() }, label);
    const sides: [NonNullable<Furniture["balustrade_side"]>, string][] = [["left", "Left"], ["right", "Right"], ["both", "Both"]];
    return [
      h("div", { class: "ed-sub" }, "Balustrade"),
      h("div", { class: "ed-chips" }, ...Object.entries(BALUSTRADES).map(([k, name]) =>
        chip(name, style === k, () => named(k === "none" ? "No balustrade on" : `${name} balustrade on`)((y) => (y.balustrade = k as BalustradeStyle))))),
      style !== "none" ? h("div", { class: "ed-sub" }, style === "glass" ? "Handrail and posts" : "Material") : null,
      style !== "none" ? h("div", { class: "ed-chips" }, ...Object.entries(BALUSTRADE_MATERIALS).map(([k, m]) =>
        h("button", { class: `ed-chip${material === k ? " on" : ""}`, onclick: () => material !== k && named(`${m.name} balustrade on`)((y) => (y.balustrade_material = k as BalustradeMaterial)) },
          h("i", { style: `background:${hexOf(m.color)}` }), m.name))) : null,
      style !== "none" ? h("div", { class: "ed-row" }, h("label", {}, "Side going up"),
        ...sides.map(([k, label]) => chip(label, side === k, () => named("Move the balustrade of")((y) => (y.balustrade_side = k))))) : null,
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
      [h("label", {}, label), h("input", { class: "ed-in num", type: "number", step, min: "0", value: String(o[key]), onchange: (e: Event) => upd(`Change ${o.kind} ${label.toLowerCase()}`, (x) => (x[key] = Math.max(0, Number((e.target as HTMLInputElement).value)))) })];
    const names: Record<Opening["kind"], string> = { door: "Door", window: "Window", passage: "Opening", garage: "Garage door" };
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
        chip(names[k], o.kind === k, () => upd(`Make it a ${names[k].toLowerCase()}`, (x) => {
          x.kind = k;
          x.style = null; // styles differ between kinds
          if (k === "window" && x.sill < 0.3) x.sill = 0.9;
          if (k !== "window") x.sill = 0;
        })))),
      styles ? h("div", { class: "ed-sub" }, "Style") : null,
      styles ? h("div", { class: "ed-chips" }, ...Object.entries(styles).map(([k, name]) =>
        chip(name, style === k, () => upd(`${name} ${what}`, (x) => (x.style = k as Opening["style"]))))) : null,
      styles ? h("div", { class: "ed-sub" }, o.kind === "window" ? "Frame" : "Finish") : null,
      styles ? this.finishChips(JOINERY_FINISHES, finish, (k) => upd(`${JOINERY_FINISHES[k as keyof typeof JOINERY_FINISHES].name} ${what}`, (x) => (x.finish = k as Opening["finish"]))) : null,
      styles && def.tintable
        ? this.colourPicker(JOINERY_SWATCHES, o.color, (c) => upd(`Colour of a ${what}`, (x) => (x.color = c)), finish === "aluminium" ? "Silver" : "White")
        : null,
      styles ? h("div", { class: "ed-row" },
        ctl.bars ? chip("Plain glass", !o.bars, () => upd(`Plain glass in a ${what}`, (x) => (x.bars = false))) : null,
        ctl.bars ? chip("Glazing bars", !!o.bars, () => upd(`Glazing bars on a ${what}`, (x) => (x.bars = true))) : null,
        // the whole look: style, finish, colour and glazing bars (hinge, swing and size stay each one's own)
        h("button", { class: "ed-btn ghost small", onclick: () => this.change((p) => {
          for (const fl of p.floors) for (const x of fl.openings) {
            if (x.kind !== o.kind) continue;
            x.style = o.style ?? null;
            x.finish = o.finish ?? null;
            x.color = o.color ?? null;
            x.bars = !!o.bars;
          }
        }, false, `Same style on every ${what}`) }, `Same style on every ${what}`),
      ) : null,
      h("div", { class: "ed-row" }, ...num("Width", "width"), ...num("Height", "height")),
      h("div", { class: "ed-row" }, ...(o.kind === "window" ? num("Sill", "sill") : []), ...num("From corner", "offset")),
      ctl.swing ? h("div", { class: "ed-row" },
        h("label", {}, "Opens"),
        chip("Inwards", o.swing !== "out", () => upd(`Open a ${what} inwards`, (x) => (x.swing = "in"))),
        chip("Outwards", o.swing === "out", () => upd(`Open a ${what} outwards`, (x) => (x.swing = "out"))),
      ) : null,
      ctl.side ? h("div", { class: "ed-row" },
        h("label", {}, "Hangs"),
        chip(room ? `In ${room.name}` : "Inside", o.swing !== "out", () => upd(`Hang a ${what} inside the room`, (x) => (x.swing = "in"))),
        chip(room ? `Outside ${room.name}` : "Outside", o.swing === "out", () => upd(`Hang a ${what} outside the room`, (x) => (x.swing = "out"))),
      ) : null,
      ctl.hinge || ctl.slide ? h("div", { class: "ed-row" },
        ctl.hinge ? h("button", { class: "ed-btn ghost small", onclick: () => upd(`Flip a ${what}'s hinge`, (x) => (x.hinge = x.hinge === "right" ? "left" : "right")) }, "Flip hinge") : null,
        ctl.slide ? h("button", { class: "ed-btn ghost small", onclick: () => upd(`Slide a ${what} the other way`, (x) => (x.hinge = x.hinge === "right" ? "left" : "right")) }, "Slide the other way") : null,
      ) : null,
      h("div", { class: "ed-row" }, h("label", {}, "Sensor"), this.dropdown(contacts, o.entity ?? "", (v) => upd("Link a sensor", (x) => (x.entity = v || null)), "None")),
      o.kind !== "passage" && style !== "fixed" ? h("p", { class: "ed-hint" }, `The ${what} opens in 3D when its sensor does.`) : null,
      o.kind === "window" ? h("div", { class: "ed-row" }, h("label", {}, "Blind"), this.dropdown(covers, o.cover ?? "", (v) => upd("Link a blind", (x) => (x.cover = v || null)), "None")) : null,
      h("button", { class: "ed-btn danger", onclick: () => {
        this.change((p) => (p.floors[fi].openings = p.floors[fi].openings.filter((x) => x.id !== o.id)), false, `Remove a ${what}`);
        this.select(null);
      } }, "Remove"),
    );
  }

  private turnRow(turn: (deg: number) => void, ...extra: HTMLElement[]): HTMLElement {
    return h("div", { class: "ed-row" },
      h("label", {}, "Turn"),
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
    }, false, `Change to ${def.name}`);
  }

  /** Named finishes as chips with their colour. */
  private finishChips(defs: Record<string, FinishDef>, current: string, onPick: (k: string) => void): HTMLElement {
    return h("div", { class: "ed-chips" }, ...Object.entries(defs).map(([k, d]) =>
      h("button", { class: `ed-chip${k === current ? " on" : ""}`, onclick: () => k !== current && onPick(k) },
        h("i", { style: `background:${hexOf(d.color)}` }), d.name)));
  }

  /** Colour swatches, any colour, or the default (null). */
  private colourPicker(swatches: [string, string][], current: string | null | undefined, onPick: (c: string | null) => void, defaultLabel = "Default"): HTMLElement {
    const cur = current?.toLowerCase() ?? null;
    const custom = h("input", { type: "color", value: cur ?? "#ffffff", onchange: (e: Event) => onPick((e.target as HTMLInputElement).value) });
    const isCustom = !!cur && !swatches.some(([, c]) => c === cur);
    return h("div", { class: "ed-swatches" },
      h("button", { class: `ed-sw none${!cur ? " on" : ""}`, title: defaultLabel, onclick: () => cur && onPick(null) }),
      ...swatches.map(([name, c]) => h("button", { class: `ed-sw${cur === c ? " on" : ""}`, title: name, style: `--c:${c}`, onclick: () => cur !== c && onPick(c) })),
      h("label", { class: `ed-sw custom${isCustom ? " on" : ""}`, title: "Any colour", style: isCustom ? `--c:${cur}` : "" }, custom),
    );
  }

  /** Search and categories over everything that can be placed. */
  private itemPicker(onAdd: (type: string) => void): HTMLElement {
    const cats = ["all", ...Object.keys(CATEGORY_NAMES)] as (Category | "all")[];
    const results = h("div", { class: "ed-grid" });
    const draw = () => {
      const q = this.pickQuery.trim().toLowerCase();
      const list = Object.entries(FURNITURE)
        .filter(([k, t]) => (this.pickCat === "all" || t.category === this.pickCat) && (!q || t.name.toLowerCase().includes(q) || k.includes(q.replace(/\s+/g, "_"))))
        .sort((a, b) => a[1].name.localeCompare(b[1].name));
      results.replaceChildren(...list.slice(0, 80).map(([k, t]) =>
        h("button", { class: "ed-pick", title: `Add ${t.name}`, onclick: () => onAdd(k) }, h("span", { html: svg(mdiPlus) }), h("b", {}, t.name), h("small", {}, CATEGORY_NAMES[t.category]))));
      if (!list.length) results.append(h("p", { class: "ed-hint" }, "Nothing matches."));
    };
    const search = h("input", { class: "ed-in", placeholder: "Search: plant, sofa, dumbbells…", value: this.pickQuery, oninput: (e: Event) => {
      this.pickQuery = (e.target as HTMLInputElement).value;
      draw();
    } });
    const chips = h("div", { class: "ed-chips scroll" }, ...cats.map((c) => h("button", { class: `ed-chip${this.pickCat === c ? " on" : ""}`, onclick: (e: Event) => {
      this.pickCat = c;
      chips.querySelectorAll(".ed-chip").forEach((b) => b.classList.toggle("on", b === e.currentTarget));
      draw();
    } }, c === "all" ? "All" : CATEGORY_NAMES[c])));
    draw();
    return h("div", {}, h("div", { class: "ed-search" }, h("span", { html: svg(mdiMagnify) }), search), chips, results);
  }

  // ------------------------------------------------------------------ actions

  private async importFiles(files: FileList | null): Promise<void> {
    if (!files?.length) return;
    let house: unknown = null;
    let manifest: Manifest | null = null;
    let detections: Detections | null = null;
    for (const file of Array.from(files)) {
      let data: unknown;
      try {
        data = JSON.parse(await file.text());
      } catch {
        continue;
      }
      if (isRoomPlan(data)) house = data;
      else if (isDetections(data)) detections = data;
      else if (Array.isArray((data as Manifest).rooms) && (data as Manifest).rooms.every((r) => typeof r.name === "string")) manifest = data as Manifest;
    }
    if (!house) {
      this.toastInDrawer("None of the files is a RoomPlan scan (house.json).");
      return;
    }
    const front = manifest?.rooms.find((r) => /hall|entrance|porch|front/i.test(r.name))?.name;
    const { plan, report } = importRoomPlan(house as never, manifest, { frontDoorRoom: front, detections });
    const go = () => {
      this.change((p) => {
        p.floors = plan.floors;
        p.settings = { ...p.settings, wall_exterior: plan.settings.wall_exterior, wall_interior: plan.settings.wall_interior };
        // a new scan faces its own way: the phone's compass, or unknown (north up) until set
        p.settings.north = report.north?.bearing ?? 0;
      });
      this.host.view.viewer.setMode("house");
      const placed = autoPlace(this.plan, this.hass);
      this.change((p) => Object.assign(p, placed.plan), false);
      this.showReport([
        `${report.rooms} rooms on ${report.floors} floor${report.floors === 1 ? "" : "s"}, ${report.openings} doors and windows, ${report.furniture} pieces of furniture${report.decor ? `, ${report.decor} decorations` : ""}.`,
        `${placed.report.placed.length} devices placed, ${placed.report.linked.length} linked to doors, windows and TVs, ${placed.report.roomsLinked.length} rooms linked to areas.`,
        report.north
          ? `North from the phone's compass: the top of the plan faces ${Math.round(report.north.bearing)}° (${compassName(report.north.bearing)})${report.north.spread !== null ? `, readings within ±${Math.round(report.north.spread)}°` : ""}${report.north.magnetic ? ", magnetic north" : ""}. Indoors a compass can be off: check it under Sun and weather.`
          : "The scan has no compass reading: set north under Sun and weather for the sun's shadows.",
        ...report.warnings,
      ]);
    };
    if (this.plan.floors.length) this.confirm("Replace the current plan with this scan?", "Replace", go);
    else go();
  }

  private runAutoPlace(): void {
    const { plan, report } = autoPlace(this.plan, this.hass);
    this.change((p) => Object.assign(p, plan));
    this.showReport([
      `${report.placed.length} devices placed, ${report.linked.length} linked, ${report.roomsLinked.length} rooms linked to areas.`,
      ...(report.unplaced.length ? [`${report.unplaced.length} devices are in areas without a room in the plan.`] : []),
      ...report.placed.slice(0, 30),
    ]);
  }

  private showReport(lines: string[]): void {
    this.show("home");
    const r = this.body.querySelector(".ed-report");
    r?.replaceChildren(...lines.map((l) => h("div", {}, l)));
  }

  /** A 3 x 3 m room beside the house on the current floor. */
  private addRoom(): void {
    const fi = this.host.view.viewer.mode === "floor" ? this.host.view.viewer.activeFloor : 0;
    const f = this.plan.floors[fi];
    if (!f) return;
    const all = f.rooms.flatMap((r) => r.points);
    const b = all.length ? bounds(all) : { minX: 0, minZ: 0, maxX: 0, maxZ: 3 };
    const x0 = b.maxX;
    const room: Room = { id: newId("room"), name: "New room", area_id: null, floor: "wood", points: [[x0, b.minZ], [x0 + 3, b.minZ], [x0 + 3, b.minZ + 3], [x0, b.minZ + 3]] };
    this.change((p) => p.floors[fi].rooms.push(room));
    this.select({ floor: fi, kind: "room", id: room.id });
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
      id: newId("out"), name: where === "back" ? "Garden" : "Front", kind: where === "back" ? "lawn" : "driveway",
      area_id: where === "back" ? area?.area_id ?? null : null,
      points: [[b.minX - half, z0], [b.maxX + half, z0], [b.maxX + half, z1], [b.minX - half, z1]],
    };
    this.change((p) => {
      p.floors[0].outdoor = [...(p.floors[0].outdoor ?? []), o];
    });
    this.select({ floor: 0, kind: "outdoor", id: o.id });
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

  private addFurniture(fi: number, room: Room, type: string): void {
    const def = FURNITURE[type];
    if (!def) return;
    const at = labelPoint(room.points);
    const item: Furniture = { id: newId("f"), type, x: at[0], z: at[1], rotation: 0, w: def.size[0], d: def.size[1], h: def.size[2] };
    if (def.y) item.y = def.y;
    this.change((p) => {
      p.floors[fi].furniture.push(item);
      settle(p, fi, item.id);
    }, false, `Add ${def.name}`);
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
    this.confirm("Replace the current plan with this file?", "Replace", () => this.change((p) => Object.assign(p, plan)));
  }

  // ------------------------------------------------------------------ small widgets

  private entities(filter: (id: string, s: Hass["states"][string]) => boolean): [string, string][] {
    const states = this.hass.states;
    return Object.keys(states)
      .filter((id) => filter(id, states[id]))
      .map((id) => [id, String(states[id].attributes.friendly_name ?? id)] as [string, string])
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
        h("button", { class: "ed-btn ghost", onclick: () => box.remove() }, "Cancel"),
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
