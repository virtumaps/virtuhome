// The plan from above, for exact work: walls with their measurements, rooms to reshape by their
// corners and walls (snapping to the grid and lining up with other corners), lengths typed in,
// rooms drawn, doors and windows placed and slid along their wall, furniture moved and turned, and
// rooms traced over a floor plan image. Every change goes through the editor, so undo, redo and
// saving work the same as in 3D.
import {
  mdiCursorDefault, mdiDoor, mdiFence, mdiFitToPageOutline, mdiImageOutline, mdiPencilOutline, mdiRectangleOutline, mdiRotateLeft, mdiRotateRight,
  mdiRuler, mdiVectorPolylinePlus, mdiWindowClosedVariant,
} from "@mdi/js";
import { area, bounds, labelPoint, pointInPolygon, segmentDistance } from "../model/geom";
import { groundOf, newId, splitEdge, type Fence, type Floor, type FloorBackground, type Opening, type Plan, type Room, type Vec2 } from "../model/plan";
import { layoutWalls } from "../model/walls";
import { outdoorTop } from "../scene/build";
import { FLOOR_FINISHES, type FinishDef } from "../scene/finishes";
import { CEILING_LAMPS, furnitureType } from "../scene/furniture-lib";
import { fenceStyle } from "../scene/fences";
import { styleOf } from "../scene/joinery";
import { imageCorners, insideImage, parseLength, placeImage, prepareImage, rescale } from "./background";
import { Collider, settle } from "./collide";

export type Sel = { floor: number; kind: "room" | "outdoor" | "device" | "furniture" | "opening" | "fence" | "roof" | "roofitem"; id: string } | null;

export interface Plan2DHost {
  plan(): Plan;
  selection(): Sel;
  select(sel: Sel): void;
  /** A finished change, with undo. */
  change(fn: (p: Plan) => void, label: string): void;
  /** Dragging: the plan is changed in place many times; one undo step is made at the end. */
  dragStart(): void;
  dragMove(): void;
  dragEnd(label: string): void;
  floor(): number;
  setFloor(i: number): void;
  status(text: string): void;
  /** Floor plan images kept by Home Assistant: store one for a floor (gives its file name), and where to load one from. */
  images: {
    upload(floorId: string, image: Blob, progress: (done: number) => void): Promise<string>;
    url(file: string): Promise<string>;
  };
}

type Tool = "select" | "rect" | "draw" | "door" | "window" | "corner" | "fence" | "image";

const NS = "http://www.w3.org/2000/svg";
const svgIcon = (p: string) => `<svg viewBox="0 0 24 24"><path d="${p}"/></svg>`;
const hexOf = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
const r2 = (v: number) => Math.round(v * 100) / 100;
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const fmt = (m: number) => `${m.toFixed(2)} m`;
const same = (a: Vec2, b: Vec2) => Math.abs(a[0] - b[0]) < 0.015 && Math.abs(a[1] - b[1]) < 0.015;

const DOMAIN_COLOURS: Record<string, string> = {
  light: "#f5b83d", camera: "#3d7ff5", binary_sensor: "#e5484d", sensor: "#30a46c", climate: "#ff8b3e",
  media_player: "#8e4ec6", switch: "#12a594", cover: "#6e56cf", lock: "#d6409f",
};

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number | undefined> = {}, text?: string): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) e.setAttribute(k, String(v));
  if (text !== undefined) e.textContent = text;
  return e;
}

/** The storey a plan without floors gets when something is first put on it. */
const firstFloor = (id = "floor_0"): Floor => ({ id, name: "Ground Floor", elevation: 0, height: 2.6, rooms: [], openings: [], furniture: [], devices: [], walls: [], outdoor: [] });

/** A shape with corners: a room or a garden area. */
interface Shape {
  outdoor: boolean;
  id: string;
  points: Vec2[];
}

export class Plan2D {
  readonly el: HTMLDivElement;
  private svg: SVGSVGElement;
  private bar: HTMLDivElement;
  private input: HTMLInputElement;
  private tool: Tool = "select";
  /** Pixels per metre and the screen position of the plan's origin. */
  private s = 60;
  private ox = 0;
  private oy = 0;
  private w = 1;
  private h = 1;
  private raf = 0;
  private fitted = -1;
  private resizeObs: ResizeObserver;
  /** `made`: the drag began by changing the plan (a new corner), so it is a change even without moving. */
  private drag: { kind: string; apply: (x: number, z: number, e: PointerEvent) => void; label: string; moved: boolean; made?: boolean } | null = null;
  /** Dragging the view; a click without moving selects `tap`, or clears the selection unless it selected something. */
  private pan: { x: number; y: number; ox: number; oy: number; moved: boolean; keep: boolean; tap?: Sel } | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinch: { d: number; s: number; cx: number; cy: number } | null = null;
  private guides: { x?: number; z?: number } = {};
  private drawing: Vec2[] = [];
  private rubber: { a: Vec2; b: Vec2 } | null = null;
  private hover: Vec2 | null = null;
  /** The floor plan image: one <image> kept across redraws, so the picture isn't loaded again. */
  private bgLayer = el("g", { class: "p2-bg" });
  private bgImage = el("image", { preserveAspectRatio: "none" });
  private bgFile: string | null = null;
  private bgLoaded = false;
  private bgMissing = false;
  /** The image tool's panel, rebuilt only when what it shows changes (a slider being dragged stays). */
  private panel: HTMLDivElement;
  private panelKey = "";
  private sliders: { opacity?: HTMLInputElement; turn?: HTMLInputElement; turnText?: HTMLElement; progress?: HTMLElement } = {};
  private sliding = false;
  /** Upload progress (0..1) while a picture is being sent. */
  private uploading: number | null = null;
  private imageError = "";
  /** Setting the image's scale: the ends of a wall of known length, as clicked. */
  private measure: Vec2[] | null = null;

  constructor(private host: Plan2DHost) {
    this.el = document.createElement("div");
    this.el.className = "p2";
    this.svg = document.createElementNS(NS, "svg");
    this.svg.classList.add("p2-svg");
    this.bar = document.createElement("div");
    this.bar.className = "p2-bar";
    this.input = document.createElement("input");
    this.input.className = "p2-input";
    this.input.hidden = true;
    this.panel = document.createElement("div");
    this.panel.className = "p2-panel";
    this.panel.hidden = true;
    this.bgLayer.append(this.bgImage);
    this.bgImage.addEventListener("load", () => {
      this.bgLoaded = true;
      this.bgMissing = false;
      this.render();
    });
    this.bgImage.addEventListener("error", () => {
      if (!this.bgImage.getAttribute("href")) return;
      this.bgMissing = true;
      this.render();
    });
    this.el.append(this.svg, this.bar, this.panel, this.input);
    this.renderBar();
    this.bindPointer();
    this.resizeObs = new ResizeObserver(() => {
      const r = this.el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      this.w = r.width;
      this.h = r.height;
      if (this.fitted !== this.host.floor()) this.fit();
      this.render();
    });
    this.resizeObs.observe(this.el);
    window.addEventListener("keydown", this.onKey);
  }

  dispose(): void {
    this.resizeObs.disconnect();
    window.removeEventListener("keydown", this.onKey);
    cancelAnimationFrame(this.raf);
    this.el.remove();
  }

  private get floorIndex(): number {
    return Math.min(this.host.floor(), Math.max(0, this.host.plan().floors.length - 1));
  }

  private get floor(): Floor | undefined {
    return this.host.plan().floors[this.floorIndex];
  }

  // ------------------------------------------------------------------ view

  private toScreen = (p: Vec2): [number, number] => [this.ox + p[0] * this.s, this.oy + p[1] * this.s];
  private toPlan = (x: number, y: number): Vec2 => [(x - this.ox) / this.s, (y - this.oy) / this.s];

  /** Frames the floor (and its garden) in the view. */
  fit(): void {
    const f = this.floor;
    this.fitted = this.host.floor();
    // the rooms fill the view; the garden shows around them as far as it fits
    const rooms = f?.rooms.flatMap((r) => r.points) ?? [];
    const garden = (f?.outdoor ?? []).flatMap((o) => o.points);
    const pts = rooms.length ? rooms : garden.length ? garden : f?.background ? imageCorners(f.background) : [];
    const b = pts.length ? bounds(pts) : { minX: -3, minZ: -3, maxX: 3, maxZ: 3 };
    const pad = 70;
    // clear of the image tool's panel: beside it or below it, whichever leaves more room
    const scaleIn = ({ left, top }: { left: number; top: number }) =>
      Math.min((this.w - left - pad * 2) / Math.max(1, b.maxX - b.minX), (this.h - top - pad * 2 - 50) / Math.max(1, b.maxZ - b.minZ));
    const [beside, below] = this.panelSpace();
    const free = scaleIn(beside) >= scaleIn(below) ? beside : below;
    this.s = Math.max(8, Math.min(240, scaleIn(free)));
    this.ox = free.left + (this.w - free.left) / 2 - ((b.minX + b.maxX) / 2) * this.s;
    this.oy = (this.h + 50 + free.top) / 2 - ((b.minZ + b.maxZ) / 2) * this.s;
    this.render();
  }

  /** Room the image tool's panel takes: beside it (its width) and below it (its height under the tool bar). */
  private panelSpace(): [{ left: number; top: number }, { left: number; top: number }] {
    if (this.tool !== "image") return [{ left: 0, top: 0 }, { left: 0, top: 0 }];
    return [{ left: 320, top: 0 }, { left: 0, top: Math.max(180, this.panel.offsetTop + this.panel.offsetHeight - 50) }];
  }

  /** Redraws (at most once per frame). */
  render(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  private renderBar(): void {
    const tools: [Tool, string, string][] = [
      ["select", mdiCursorDefault, "Select and move"],
      ["rect", mdiRectangleOutline, "New room: drag a rectangle"],
      ["draw", mdiPencilOutline, "New room: click its corners, then the first one again"],
      ["door", mdiDoor, "Door: click on a wall"],
      ["window", mdiWindowClosedVariant, "Window: click on a wall"],
      ["corner", mdiVectorPolylinePlus, "Corner: click on an edge where it goes, drag to place it"],
      ["fence", mdiFence, "Fence: click its corners, then the last one again"],
      ["image", mdiImageOutline, "Floor plan image: trace the rooms over an estate agent's plan"],
    ];
    const floors = this.host.plan().floors;
    this.bar.innerHTML = "";
    const group = document.createElement("div");
    group.className = "p2-group";
    for (const [t, icon, title] of tools) {
      const b = document.createElement("button");
      b.className = `p2-tool${this.tool === t ? " on" : ""}`;
      b.title = title;
      b.innerHTML = svgIcon(icon);
      b.onclick = () => this.setTool(t);
      group.append(b);
    }
    const fit = document.createElement("button");
    fit.className = "p2-tool";
    fit.title = "Fit to view";
    fit.innerHTML = svgIcon(mdiFitToPageOutline);
    fit.onclick = () => this.fit();
    group.append(fit);
    this.bar.append(group);
    if (floors.length > 1) {
      const fg = document.createElement("div");
      fg.className = "p2-group";
      floors.forEach((f, i) => {
        const b = document.createElement("button");
        b.className = `p2-floor${i === this.floorIndex ? " on" : ""}`;
        b.textContent = f.name;
        b.onclick = () => {
          this.host.setFloor(i);
          this.fit();
          this.renderBar();
        };
        fg.append(b);
      });
      this.bar.append(fg);
    }
  }

  /** Starts drawing a fence (the editor's "Draw a fence" button). */
  drawFence(): void {
    this.setTool("fence");
  }

  private setTool(t: Tool): void {
    this.tool = t;
    this.drawing = [];
    this.rubber = null;
    this.measure = null;
    this.imageError = "";
    this.renderBar();
    this.render();
    if (t === "image") {
      this.host.status(this.floor?.background
        ? "Drag the picture to move it. Set its scale from a wall you know the length of, then draw the rooms over it."
        : "Choose a floor plan picture to trace the rooms over.");
      return;
    }
    this.host.status({
      select: "Select something, then drag it: furniture, devices, doors, windows, a room's corners and walls. Click a measurement to type it.",
      rect: "Drag out a rectangle for the new room.",
      draw: "Click the corners of the new room; click the first corner again to finish (Esc cancels).",
      door: "Click on a wall to put a door there.",
      window: "Click on a wall to put a window there.",
      corner: "Click on the edge of a room or garden area where the new corner goes, and drag it into place (Esc when done).",
      fence: "Click where the fence starts and at each corner; click the last point again (or press Enter) to finish. Esc cancels.",
    }[t]);
  }

  // ------------------------------------------------------------------ drawing

  private draw(): void {
    const f = this.floor;
    const plan = this.host.plan();
    const sel = this.host.selection();
    const fi = this.floorIndex;
    const svg = this.svg;
    svg.setAttribute("width", String(this.w));
    svg.setAttribute("height", String(this.h));
    const layers = { grid: el("g"), bg: this.bgLayer, ghost: el("g"), fill: el("g"), fence: el("g"), wall: el("g"), open: el("g"), items: el("g"), dims: el("g"), labels: el("g"), handles: el("g"), guides: el("g") };
    svg.replaceChildren(...Object.values(layers));
    this.drawGrid(layers.grid);
    this.drawBackground(f?.background ?? null, layers.guides);
    this.syncPanel();
    if (!f) {
      layers.labels.append(el("text", { x: this.w / 2, y: this.h / 2, class: "p2-empty", "text-anchor": "middle" }, "No floors yet: import a scan, draw a room, or trace a floor plan picture."));
      return;
    }
    // the floor below, faintly, to line things up with
    const below = plan.floors[fi - 1];
    for (const r of below?.rooms ?? []) layers.ghost.append(el("polygon", { points: this.pts(r.points), class: "p2-ghost" }));

    const selRoom = sel?.floor === fi && (sel.kind === "room" || sel.kind === "outdoor") ? sel.id : null;
    // stacked as in 3D, so the area on top (a deck on the lawn) is the one a click picks
    const stack = (f.outdoor ?? []).map((o, k) => ({ o, top: outdoorTop(f, k) })).sort((a, b) => a.top - b.top);
    for (const { o } of stack) {
      layers.fill.append(el("polygon", { points: this.pts(o.points), class: `p2-out p2-out-${groundOf(o)}${selRoom === o.id ? " sel" : ""}`, "data-kind": "outdoor", "data-id": o.id }));
    }
    for (const r of f.rooms) {
      const fin = (FLOOR_FINISHES as Record<string, FinishDef>)[r.floor ?? "wood"] ?? FLOOR_FINISHES.wood;
      layers.fill.append(el("polygon", {
        points: this.pts(r.points), class: `p2-room${selRoom === r.id ? " sel" : ""}`, fill: hexOf(fin.color),
        "data-kind": "room", "data-id": r.id,
      }));
    }

    // walls, with gaps where doors and windows are
    const layout = layoutWalls(f, plan.settings);
    for (const w of layout.walls) {
      const t = w.thickness / 2;
      const s0 = -w.extendStart, s1 = w.length + w.extendEnd;
      const P = (s: number, side: number): Vec2 => [w.a[0] + w.dir[0] * s + w.normal[0] * side, w.a[1] + w.dir[1] * s + w.normal[1] * side];
      let cursor = s0;
      const piece = (a: number, b: number) => {
        if (b - a < 0.005) return;
        layers.wall.append(el("polygon", { points: this.pts([P(a, t), P(b, t), P(b, -t), P(a, -t)]), class: `p2-wall${w.exterior ? " ext" : ""}` }));
      };
      for (const po of w.openings) {
        piece(cursor, po.t0);
        cursor = Math.max(cursor, po.t1);
        const o = po.opening;
        const selOp = sel?.kind === "opening" && sel.id === o.id;
        const g = el("g", { class: `p2-op${selOp ? " sel" : ""}`, "data-kind": "opening", "data-id": o.id });
        if (o.kind === "window") {
          g.append(el("polygon", { points: this.pts([P(po.t0, t), P(po.t1, t), P(po.t1, -t), P(po.t0, -t)]), class: "p2-win" }));
          const [ax, ay] = this.toScreen(P(po.t0, 0));
          const [bx, by] = this.toScreen(P(po.t1, 0));
          g.append(el("line", { x1: ax, y1: ay, x2: bx, y2: by, class: "p2-win-line" }));
        } else {
          // a gap the width of the wall, and for doors the leaves and how they open
          g.append(el("polygon", { points: this.pts([P(po.t0, t), P(po.t1, t), P(po.t1, -t), P(po.t0, -t)]), class: "p2-gap" }));
          if (o.kind === "door" || o.kind === "garage") {
            const style = styleOf(o);
            const swing: Vec2 = o.swing === "out" ? [-po.inward[0], -po.inward[1]] : po.inward;
            // the face of the wall the door is on
            const side = swing[0] * w.normal[0] + swing[1] * w.normal[1] > 0 ? 1 : -1;
            const len = po.t1 - po.t0;
            const line = (a: Vec2, b: Vec2, cls: string) => {
              const [x1, y1] = this.toScreen(a);
              const [x2, y2] = this.toScreen(b);
              g.append(el("line", { x1, y1, x2, y2, class: cls }));
            };
            // a leaf hinged at one jamb, drawn open, with the arc it sweeps
            const hingedLeaf = (atStart: boolean, l: number) => {
              const hinge = P(atStart ? po.t0 : po.t1, 0);
              const open: Vec2 = [hinge[0] + swing[0] * l, hinge[1] + swing[1] * l];
              const [ox2, oy2] = this.toScreen(open);
              const [cx, cy] = this.toScreen(P(atStart ? po.t0 + l : po.t1 - l, 0));
              const sweep = (swing[0] * w.dir[1] - swing[1] * w.dir[0]) * (atStart ? 1 : -1) > 0 ? 0 : 1;
              line(hinge, open, "p2-leaf");
              g.append(el("path", { d: `M ${ox2} ${oy2} A ${l * this.s} ${l * this.s} 0 0 ${sweep} ${cx} ${cy}`, class: "p2-swing" }));
            };
            if (style === "sliding") {
              const mid = (po.t0 + po.t1) / 2;
              line(P(po.t0, 0.025), P(mid + 0.05, 0.025), "p2-leaf");
              line(P(mid - 0.05, -0.025), P(po.t1, -0.025), "p2-leaf");
            } else if (style === "barn") {
              // on the wall's face, and dashed where it slides to
              const off = side * (t + 0.04);
              const l = len + 0.1;
              const left = (o.hinge ?? "left") === "left";
              line(P(po.t0 - 0.05, off), P(po.t1 + 0.05, off), "p2-leaf");
              line(P(left ? po.t0 - 0.05 - l : po.t1 + 0.05, off), P(left ? po.t0 - 0.05 : po.t1 + 0.05 + l, off), "p2-swing");
            } else if (style === "sectional" || style === "roller") {
              line(P(po.t0, side * t), P(po.t1, side * t), "p2-leaf");
              // an up-and-over door runs back under the ceiling
              if (style === "sectional") g.append(el("polygon", { points: this.pts([P(po.t0, side * t), P(po.t1, side * t), P(po.t1, side * (t + o.height)), P(po.t0, side * (t + o.height))]), class: "p2-swing" }));
            } else if (style === "french" || style === "side") {
              hingedLeaf(true, len / 2);
              hingedLeaf(false, len / 2);
            } else {
              hingedLeaf((o.hinge ?? "left") === "left", len);
            }
          }
        }
        // a wide invisible target to grab it by
        g.append(el("polygon", { points: this.pts([P(po.t0, t + 0.1), P(po.t1, t + 0.1), P(po.t1, -t - 0.1), P(po.t0, -t - 0.1)]), class: "p2-hit" }));
        layers.open.append(g);
      }
      piece(cursor, s1);
    }

    // fences: a line in their colour, posts as dots when there is room, gates as gaps
    for (const fence of f.fences ?? []) this.drawFenceLine(layers.fence, fence, sel?.kind === "fence" && sel.id === fence.id);

    // furniture and devices
    for (const x of f.furniture) {
      const def = furnitureType(x.type);
      // wall cupboards, wall TVs, pictures and ceiling lights are above the floor: drawn dashed
      const high = (x.y ?? def.y ?? 0) > 0.3 || CEILING_LAMPS.has(x.type);
      const g = el("g", { class: `p2-item${sel?.kind === "furniture" && sel.id === x.id ? " sel" : ""}${def.category === "lights" ? " lamp" : ""}${high ? " high" : ""}`, "data-kind": "furniture", "data-id": x.id });
      const [cx, cy] = this.toScreen([x.x, x.z]);
      const round = def.build(x.w, x.d, x.h).every((p) => p.shape !== "box") || CEILING_LAMPS.has(x.type);
      if (round) g.append(el("ellipse", { cx, cy, rx: Math.max(3, (x.w / 2) * this.s), ry: Math.max(3, (x.d / 2) * this.s) }));
      else g.append(el("rect", { x: cx - (x.w / 2) * this.s, y: cy - (x.d / 2) * this.s, width: Math.max(2, x.w * this.s), height: Math.max(2, x.d * this.s), rx: 2 }));
      // the front edge, so it is clear which way it faces
      if (!round) g.append(el("line", { x1: cx - (x.w / 2) * this.s + 2, y1: cy + (x.d / 2) * this.s - 2, x2: cx + (x.w / 2) * this.s - 2, y2: cy + (x.d / 2) * this.s - 2, class: "p2-front" }));
      g.setAttribute("transform", `rotate(${x.rotation} ${cx} ${cy})${x.mirror ? ` translate(${cx * 2} 0) scale(-1 1)` : ""}`);
      // a name only where it fits inside the piece (or when it is selected)
      const isSel = sel?.kind === "furniture" && sel.id === x.id;
      if (isSel || Math.max(x.w, x.d) * this.s > def.name.length * 5.6 + 8) {
        layers.labels.append(el("text", { x: cx, y: cy + 3, class: `p2-item-label${isSel ? " sel" : ""}`, "text-anchor": "middle" }, def.name));
      }
      layers.items.append(g);
    }
    for (const d of f.devices) {
      const [cx, cy] = this.toScreen([d.x, d.z]);
      const domain = d.entity.split(".")[0];
      layers.items.append(el("circle", {
        cx, cy, r: 6, class: `p2-dev${sel?.kind === "device" && sel.id === d.id ? " sel" : ""}`, fill: DOMAIN_COLOURS[domain] ?? "#8b8d98",
        "data-kind": "device", "data-id": d.id,
      }));
    }

    // room names and areas
    for (const r of f.rooms) {
      const [lx, ly] = this.toScreen(labelPoint(r.points));
      const t = el("text", { x: lx, y: ly - 4, class: "p2-name", "text-anchor": "middle" }, r.name);
      const a = el("text", { x: lx, y: ly + 11, class: "p2-area", "text-anchor": "middle" }, `${area(r.points).toFixed(1)} m²`);
      layers.labels.append(t, a);
    }

    // measurements: every edge of the selected shape, or of all rooms when zoomed in
    const shapes = this.shapes();
    for (const sh of shapes) {
      if (sh.outdoor && selRoom !== sh.id) continue;
      if (selRoom !== sh.id && this.s < 70) continue;
      this.drawDims(layers.dims, sh, selRoom === sh.id);
    }

    // handles of the selected shape: corners, and the middle of each edge to move that wall (the
    // corner tool shows the corners only: a click near one grabs it)
    const selShape = shapes.find((x) => x.id === selRoom);
    if (selShape && (this.tool === "select" || this.tool === "corner")) {
      if (this.tool === "select") selShape.points.forEach((p, i) => {
        const q = selShape.points[(i + 1) % selShape.points.length];
        const [mx, my] = this.toScreen([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
        layers.handles.append(el("rect", { x: mx - 5, y: my - 5, width: 10, height: 10, rx: 2, class: "p2-edge", "data-kind": "edge", "data-id": selShape.id, "data-i": i }));
      });
      selShape.points.forEach((p, i) => {
        const [x, y] = this.toScreen(p);
        layers.handles.append(el("circle", { cx: x, cy: y, r: 7, class: "p2-corner", "data-kind": "corner", "data-id": selShape.id, "data-i": i }));
      });
    }
    // the selected fence: its points, and a + in the middle of each stretch to add a corner there
    const selFence = sel?.kind === "fence" && sel.floor === fi && this.tool === "select" ? f.fences?.find((x) => x.id === sel.id) : undefined;
    if (selFence) {
      selFence.points.forEach((p, i) => {
        const q = selFence.points[i + 1];
        if (!q) return;
        const [mx, my] = this.toScreen([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
        layers.handles.append(el("rect", { x: mx - 5, y: my - 5, width: 10, height: 10, rx: 2, class: "p2-edge", "data-kind": "fenceedge", "data-id": selFence.id, "data-i": i }));
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        if (len * this.s > 40) layers.dims.append(this.badge(mx, my - 16, fmt(len), "p2-dim sel"));
      });
      selFence.points.forEach((p, i) => {
        const [x, y] = this.toScreen(p);
        layers.handles.append(el("circle", { cx: x, cy: y, r: 7, class: "p2-corner", "data-kind": "fencepoint", "data-id": selFence.id, "data-i": i }));
      });
    }

    // the selected piece of furniture: a handle to turn it
    if (sel?.kind === "furniture" && sel.floor === fi && this.tool === "select") {
      const x = f.furniture.find((y) => y.id === sel.id);
      if (x) {
        const rad = (x.rotation * Math.PI) / 180;
        const reach = x.d / 2 + 0.35;
        const [hx, hy] = this.toScreen([x.x - Math.sin(rad) * reach, x.z + Math.cos(rad) * reach]);
        const [cx, cy] = this.toScreen([x.x, x.z]);
        layers.handles.append(el("line", { x1: cx, y1: cy, x2: hx, y2: hy, class: "p2-rot-line" }));
        layers.handles.append(el("circle", { cx: hx, cy: hy, r: 7, class: "p2-rot", "data-kind": "rotate", "data-id": x.id }));
      }
    }

    // a room being drawn, snapping guides, the place a door would go
    if (this.drawing.length) {
      const pts = this.hover ? [...this.drawing, this.hover] : this.drawing;
      layers.guides.append(el("polyline", { points: this.pts(pts), class: "p2-drawing" }));
      for (const p of this.drawing) {
        const [x, y] = this.toScreen(p);
        layers.guides.append(el("circle", { cx: x, cy: y, r: 4, class: "p2-draw-pt" }));
      }
      if (this.hover && this.drawing.length) {
        const a = this.drawing[this.drawing.length - 1];
        const [mx, my] = this.toScreen([(a[0] + this.hover[0]) / 2, (a[1] + this.hover[1]) / 2]);
        layers.guides.append(this.badge(mx, my - 12, fmt(Math.hypot(this.hover[0] - a[0], this.hover[1] - a[1]))));
      }
    }
    if (this.rubber) {
      const { a, b } = this.rubber;
      layers.guides.append(el("polygon", { points: this.pts([a, [b[0], a[1]], b, [a[0], b[1]]]), class: "p2-drawing fill" }));
      const [x, y] = this.toScreen([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      layers.guides.append(this.badge(x, y, `${fmt(Math.abs(b[0] - a[0]))} × ${fmt(Math.abs(b[1] - a[1]))}`));
    }
    if (this.guides.x !== undefined) {
      const [x] = this.toScreen([this.guides.x, 0]);
      layers.guides.append(el("line", { x1: x, y1: 0, x2: x, y2: this.h, class: "p2-guide" }));
    }
    if (this.guides.z !== undefined) {
      const [, y] = this.toScreen([0, this.guides.z]);
      layers.guides.append(el("line", { x1: 0, y1: y, x2: this.w, y2: y, class: "p2-guide" }));
    }
    if ((this.tool === "door" || this.tool === "window") && this.hover) {
      const hit = this.edgeAt(this.hover);
      if (hit) {
        const [x, y] = this.toScreen(hit.point);
        layers.guides.append(el("circle", { cx: x, cy: y, r: 6, class: "p2-place" }));
      }
    }
    if (this.measure?.length) {
      const a = this.measure[0], b = this.measure[1] ?? this.hover;
      if (b) {
        const [x1, y1] = this.toScreen(a);
        const [x2, y2] = this.toScreen(b);
        layers.guides.append(el("line", { x1, y1, x2, y2, class: "p2-measure" }));
        layers.guides.append(this.badge((x1 + x2) / 2, (y1 + y2) / 2 - 14, `now ${fmt(Math.hypot(b[0] - a[0], b[1] - a[1]))}`));
      }
      for (const q of this.measure) {
        const [x, y] = this.toScreen(q);
        layers.guides.append(el("circle", { cx: x, cy: y, r: 4.5, class: "p2-measure-pt" }));
      }
    }
    if (this.tool === "corner" && this.hover && !this.drag) {
      const hit = this.shapeEdgeAt(this.hover);
      if (hit) {
        const [x, y] = this.toScreen(hit.point);
        layers.guides.append(el("circle", { cx: x, cy: y, r: 7, class: "p2-place" }));
      }
    }
    layers.handles.append(this.compass(plan.settings.north ?? 0));
  }

  /** Places the floor plan image (and outlines it while the image tool is on). */
  private drawBackground(bg: FloorBackground | null, guides: SVGGElement): void {
    const img = this.bgImage;
    if (!bg) {
      if (this.bgFile !== null) {
        img.removeAttribute("href");
        this.bgFile = null;
      }
      this.bgLoaded = this.bgMissing = false;
      this.svg.classList.remove("traced");
      return;
    }
    if (bg.file !== this.bgFile) {
      const file = bg.file;
      this.bgFile = file;
      this.bgLoaded = this.bgMissing = false;
      img.removeAttribute("href");
      this.host.images.url(file).then(
        (url) => this.bgFile === file && img.setAttribute("href", url),
        () => {
          if (this.bgFile !== file) return;
          this.bgMissing = true;
          this.render();
        },
      );
    }
    const [cx, cy] = this.toScreen([bg.x, bg.z]);
    const w = bg.width * bg.scale * this.s, h = bg.height * bg.scale * this.s;
    img.setAttribute("x", (cx - w / 2).toFixed(1));
    img.setAttribute("y", (cy - h / 2).toFixed(1));
    img.setAttribute("width", w.toFixed(1));
    img.setAttribute("height", h.toFixed(1));
    img.setAttribute("transform", `rotate(${bg.rotation} ${cx.toFixed(1)} ${cy.toFixed(1)})`);
    img.setAttribute("opacity", String(bg.opacity));
    // rooms are paler over a picture, so its lines show through
    this.svg.classList.toggle("traced", this.bgLoaded && bg.opacity > 0);
    if (this.tool === "image") guides.append(el("polygon", { points: this.pts(imageCorners(bg)), class: "p2-img-frame" }));
  }

  /** The image tool's panel: rebuilt when what it shows changes, else only its values follow the plan. */
  private syncPanel(): void {
    const bg = this.floor?.background ?? null;
    const key = this.tool !== "image" ? "" : [bg?.file ?? "", this.uploading !== null, this.measure?.length ?? -1, this.bgMissing, this.imageError].join("|");
    if (key !== this.panelKey) {
      this.panelKey = key;
      this.renderPanel();
      return;
    }
    if (bg && !this.sliding) {
      const { opacity, turn, turnText } = this.sliders;
      if (opacity) opacity.value = String(Math.round(bg.opacity * 100));
      if (turn) turn.value = String(bg.rotation);
      if (turnText) turnText.textContent = `${bg.rotation}°`;
    }
  }

  private renderPanel(): void {
    const panel = this.panel;
    panel.replaceChildren();
    this.sliders = {};
    panel.hidden = this.tool !== "image";
    if (panel.hidden) return;
    const fi = this.floorIndex;
    const bg = this.floor?.background ?? null;
    const node = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = "", text = ""): HTMLElementTagNameMap[K] => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text) e.textContent = text;
      return e;
    };
    const button = (text: string, cls: string, onclick: () => void, icon?: string, title?: string) => {
      const b = node("button", cls);
      if (icon) b.innerHTML = svgIcon(icon);
      if (text) b.append(text);
      if (title) b.title = title;
      b.onclick = onclick;
      return b;
    };
    const row = (...children: (HTMLElement | string)[]) => {
      const r = node("div", "row");
      r.append(...children);
      return r;
    };
    const choose = (text: string, cls: string) => button(text, cls, () => {
      const input = node("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/*";
      input.onchange = () => input.files?.[0] && void this.chooseImage(input.files[0]);
      input.click();
    });
    panel.append(node("b", "", "Floor plan picture"));
    if (this.uploading !== null) {
      this.sliders.progress = node("p", "", `Sending the picture… ${Math.round(this.uploading * 100)}%`);
      panel.append(this.sliders.progress);
    } else if (!bg) {
      panel.append(
        node("p", "", "Put an estate agent's plan (or a photo of a sketch) under this floor, set its scale, then draw the rooms over it. JPEG or PNG, up to 8 MB; a screenshot of a PDF works. Only the 2D plan shows it."),
        choose("Choose a picture…", "ed-btn"),
      );
    } else {
      if (this.bgMissing) panel.append(node("p", "err", "The picture can't be loaded (it may have been removed). Choose it again."));
      if (this.measure) {
        panel.append(
          node("p", "", this.measure.length < 2 ? "Click both ends of a wall you know the length of: an outside wall, or a room's width from the plan's labels." : "Type the real length and press Enter."),
          row(button("Cancel", "ed-btn ghost small", () => {
            this.measure = null;
            this.input.hidden = true;
            this.render();
          })),
        );
      } else {
        panel.append(row(button("Set the scale", "ed-btn small", () => {
          this.measure = [];
          this.host.status("Click both ends of a wall you know the length of.");
          this.render();
        }, mdiRuler)));
      }
      const opacity = node("input");
      opacity.type = "range";
      opacity.min = "0";
      opacity.max = "100";
      opacity.value = String(Math.round(bg.opacity * 100));
      this.slide(opacity, "Fade the floor plan picture", (b, v) => (b.opacity = v / 100));
      const turn = node("input");
      turn.type = "range";
      turn.min = "-180";
      turn.max = "180";
      turn.step = "0.5";
      turn.value = String(bg.rotation);
      const turnText = node("span", "val", `${bg.rotation}°`);
      this.slide(turn, "Turn the floor plan picture", (b, v) => {
        b.rotation = v;
        turnText.textContent = `${v}°`;
      });
      const quarter = (d: number) => () => this.host.change((p) => {
        const b = p.floors[fi]?.background;
        if (b) b.rotation = ((((b.rotation + d + 180) % 360) + 360) % 360) - 180;
      }, "Turn the floor plan picture");
      this.sliders = { opacity, turn, turnText };
      panel.append(
        row(node("label", "", "Show"), opacity),
        row(node("label", "", "Turn"), turn, turnText,
          button("", "ib", quarter(-90), mdiRotateLeft, "Turn a quarter left"), button("", "ib", quarter(90), mdiRotateRight, "Turn a quarter right")),
        row(choose("Another picture…", "ed-btn ghost small"), button("Remove", "ed-btn ghost small", () => {
          this.host.change((p) => {
            const f = p.floors[fi];
            if (f) f.background = null;
          }, "Remove the floor plan picture");
          this.host.status("Picture removed. Home Assistant deletes it when you save.");
        })),
      );
    }
    if (this.imageError) panel.append(node("p", "err", this.imageError));
  }

  /** A slider that changes the image while it moves, with one undo step when it's let go. */
  private slide(input: HTMLInputElement, label: string, set: (bg: FloorBackground, v: number) => void): void {
    input.addEventListener("input", () => {
      if (!this.sliding) {
        this.sliding = true;
        this.host.dragStart();
      }
      const live = this.host.plan().floors[this.floorIndex]?.background;
      if (live) set(live, Number(input.value));
      this.render();
    });
    input.addEventListener("change", () => {
      if (!this.sliding) return;
      this.sliding = false;
      this.host.dragEnd(label);
    });
  }

  /** A picture was chosen: it goes to Home Assistant, then under this floor, and the scale is next. */
  private async chooseImage(file: File): Promise<void> {
    const fi = this.floorIndex;
    const floorId = this.floor?.id ?? "floor_0";
    this.imageError = "";
    this.uploading = 0;
    this.render();
    try {
      const img = await prepareImage(file);
      const name = await this.host.images.upload(floorId, img.blob, (done) => {
        this.uploading = done;
        if (this.sliders.progress) this.sliders.progress.textContent = `Sending the picture… ${Math.round(done * 100)}%`;
      });
      // another picture keeps the old one's place and size; a first one fills most of the view
      const old = this.floor?.background;
      const bg = old
        ? { ...placeImage(name, img.width, img.height, [old.x, old.z], old.width * old.scale), rotation: old.rotation, opacity: old.opacity }
        : this.placeNew(name, img.width, img.height);
      const fresh = !this.host.plan().floors.length;
      this.host.change((p) => {
        if (!p.floors.length) p.floors.push(firstFloor(floorId));
        p.floors[Math.min(fi, p.floors.length - 1)].background = bg;
      }, old ? "Replace the floor plan picture" : "Add a floor plan picture");
      if (fresh) this.fit();
      this.measure = [];
      this.host.status("Now set its scale: click both ends of a wall you know the length of.");
    } catch (err) {
      this.imageError = String((err as { message?: string })?.message ?? err);
    } finally {
      this.uploading = null;
      this.render();
    }
  }

  /** A first picture: as large as fits beside or below the panel, in the middle of that space. */
  private placeNew(name: string, width: number, height: number): FloorBackground {
    const [beside, below] = this.panelSpace();
    const fits = ({ left, top }: { left: number; top: number }) => Math.min((this.w - left) * 0.85 / width, (this.h - 50 - top) * 0.85 / height);
    const free = fits(beside) >= fits(below) ? beside : below;
    const centre = this.toPlan((this.w + free.left) / 2, (this.h + 50 + free.top) / 2);
    return placeImage(name, width, height, centre, Math.max(1, (fits(free) * width) / this.s));
  }

  /** Both ends of the wall are clicked: ask how long it really is, and scale the picture to it. */
  private askLength(): void {
    const m = this.measure;
    if (!m || m.length !== 2) return;
    const [mx, my] = this.toScreen([(m[0][0] + m[1][0]) / 2, (m[0][1] + m[1][1]) / 2]);
    const input = this.input;
    input.hidden = false;
    input.value = "";
    input.placeholder = "3.45";
    input.style.left = `${mx - 40}px`;
    input.style.top = `${my + 12}px`;
    input.focus();
    this.host.status("How long is it really? Type it (3.45, 345 cm or 11'4\") and press Enter.");
    const done = (apply: boolean) => {
      input.onkeydown = null;
      input.onblur = null;
      input.hidden = true;
      input.placeholder = "";
      if (this.measure !== m) return;
      this.measure = null;
      const len = apply ? parseLength(input.value) : null;
      const fi = this.floorIndex;
      const next = len && this.floor?.background ? rescale(this.floor.background, m[0], m[1], len) : null;
      if (next) {
        this.host.change((p) => {
          const f = p.floors[fi];
          if (f) f.background = next;
        }, "Scale the floor plan picture");
        this.host.status(`Scaled: that wall is now ${fmt(len!)}. Draw the rooms over the plan with the room tools.`);
        if (!this.floor?.rooms.length) this.fit();
      } else if (apply && input.value.trim()) {
        this.host.status("That isn't a length. Set the scale again and type it like 3.45 or 11'4\".");
      }
      this.render();
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter") done(true);
      if (e.key === "Escape") done(false);
      e.stopPropagation();
    };
    input.onblur = () => done(true);
  }

  /** Where the compass sits: the bottom left corner. */
  private compassAt(): [number, number] {
    return [44, this.h - 44];
  }

  /** North on the plan: an arrow to drag round (Shift snaps to 15°); the sun and the wind follow it. */
  private compass(north: number): SVGGElement {
    const [cx, cy] = this.compassAt();
    const g = el("g", { class: "p2-north", "data-kind": "north", "data-id": "north", transform: `translate(${cx} ${cy})` });
    g.append(el("title", {}, `North: the top of the plan faces ${Math.round(north)}°. Drag the arrow to where north is.`));
    g.append(el("circle", { r: 26 }));
    const rose = el("g", { transform: `rotate(${-north})` });
    rose.append(el("path", { d: "M0 -20 L6 1 L0 -3 L-6 1 Z", class: "n" }), el("path", { d: "M0 20 L6 -1 L0 3 L-6 -1 Z", class: "s" }));
    g.append(rose);
    const r = (north * Math.PI) / 180;
    g.append(el("text", { x: (-35 * Math.sin(r)).toFixed(1), y: (-35 * Math.cos(r) + 4).toFixed(1) }, "N"));
    return g;
  }

  private drawGrid(g: SVGGElement): void {
    const step = this.s > 90 ? 0.5 : this.s > 25 ? 1 : 5;
    const [x0, z0] = this.toPlan(0, 0);
    const [x1, z1] = this.toPlan(this.w, this.h);
    let d = "";
    for (let x = Math.floor(x0 / step) * step; x <= x1; x += step) {
      const [sx] = this.toScreen([x, 0]);
      d += `M${sx.toFixed(1)} 0V${this.h}`;
    }
    for (let z = Math.floor(z0 / step) * step; z <= z1; z += step) {
      const [, sy] = this.toScreen([0, z]);
      d += `M0 ${sy.toFixed(1)}H${this.w}`;
    }
    g.append(el("path", { d, class: "p2-grid" }));
  }

  private drawDims(g: SVGGElement, sh: Shape, selected: boolean): void {
    const pts = sh.points;
    const inside = labelPoint(pts);
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len * this.s < 34) return;
      const [ax, ay] = this.toScreen(a);
      const [bx, by] = this.toScreen(b);
      // the label sits just inside the room, along the edge, upright
      let nx = -(by - ay), ny = bx - ax;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      const [ix, iy] = this.toScreen(inside);
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      if ((ix - mx) * nx + (iy - my) * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      let ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
      if (ang > 90) ang -= 180;
      if (ang < -90) ang += 180;
      const x = mx + nx * 13, y = my + ny * 13;
      const t = this.badge(x, y, fmt(len), selected ? "p2-dim sel" : "p2-dim");
      t.setAttribute("transform", `rotate(${ang.toFixed(1)} ${x} ${y})`);
      t.dataset.kind = "dim";
      t.dataset.id = sh.id;
      t.dataset.i = String(i);
      g.append(t);
    });
  }

  /** A text on a rounded background. */
  private badge(x: number, y: number, text: string, cls = "p2-badge"): SVGGElement {
    const g = el("g", { class: cls });
    const wpx = text.length * 6.2 + 10;
    g.append(el("rect", { x: x - wpx / 2, y: y - 9, width: wpx, height: 18, rx: 9 }), el("text", { x, y: y + 4, "text-anchor": "middle" }, text));
    return g;
  }

  private pts(p: Vec2[]): string {
    return p.map((q) => this.toScreen(q).map((v) => v.toFixed(1)).join(",")).join(" ");
  }

  private shapes(): Shape[] {
    const f = this.floor;
    if (!f) return [];
    return [
      ...f.rooms.map((r) => ({ outdoor: false, id: r.id, points: r.points })),
      ...(f.outdoor ?? []).map((o) => ({ outdoor: true, id: o.id, points: o.points })),
    ];
  }

  // ------------------------------------------------------------------ snapping

  /** Snaps a plan point: to other corners' x and z (with a guide), else to the grid. */
  private snap(p: Vec2, exclude: Set<string> = new Set(), free = false): Vec2 {
    this.guides = {};
    if (free) return [r2(p[0]), r2(p[1])];
    const tol = 9 / this.s;
    let x = p[0], z = p[1];
    let bx = tol, bz = tol;
    for (const sh of this.shapes()) {
      sh.points.forEach((q, i) => {
        if (exclude.has(`${sh.id}:${i}`)) return;
        if (Math.abs(q[0] - p[0]) < bx) {
          bx = Math.abs(q[0] - p[0]);
          x = q[0];
          this.guides.x = q[0];
        }
        if (Math.abs(q[1] - p[1]) < bz) {
          bz = Math.abs(q[1] - p[1]);
          z = q[1];
          this.guides.z = q[1];
        }
      });
    }
    const grid = this.s > 120 ? 0.01 : this.s > 50 ? 0.05 : 0.1;
    if (this.guides.x === undefined) x = Math.round(x / grid) * grid;
    if (this.guides.z === undefined) z = Math.round(z / grid) * grid;
    return [r2(x), r2(z)];
  }

  /** Corners that sit on a given corner (shared with neighbours): they move together. */
  private cornersAt(p: Vec2): { sh: Shape; i: number }[] {
    const out: { sh: Shape; i: number }[] = [];
    for (const sh of this.shapes()) sh.points.forEach((q, i) => same(q, p) && out.push({ sh, i }));
    return out;
  }

  /** The nearest room edge within reach of a point. */
  private edgeAt(p: Vec2): { room: Room; edge: number; t: number; point: Vec2; len: number } | null {
    const f = this.floor;
    if (!f) return null;
    let best: { room: Room; edge: number; t: number; point: Vec2; len: number; d: number } | null = null;
    for (const r of f.rooms) {
      r.points.forEach((a, i) => {
        const b = r.points[(i + 1) % r.points.length];
        const { d, t } = segmentDistance(p, a, b);
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        // prefer the room the point is in when two rooms share the edge
        const bias = pointInPolygon(p, r.points) ? 0 : 0.02;
        if (d < 14 / this.s && (!best || d + bias < best.d)) {
          best = { room: r, edge: i, t, len, d: d + bias, point: [a[0] + ((b[0] - a[0]) * t) / (len || 1), a[1] + ((b[1] - a[1]) * t) / (len || 1)] };
        }
      });
    }
    return best;
  }

  /**
   * Where a new corner would go: on the nearest edge of a room or garden area (the selected one
   * first), lined up with other corners or on the grid along the edge, or an existing corner there.
   */
  private shapeEdgeAt(p: Vec2, free = false): { sh: Shape; edge: number; t: number; point: Vec2; corner: number } | null {
    const sel = this.host.selection();
    const reach = 14 / this.s;
    let best: { sh: Shape; edge: number; d: number } | null = null;
    for (const sh of this.shapes()) {
      const mine = sel?.floor === this.floorIndex && sel.id === sh.id;
      sh.points.forEach((a, i) => {
        const { d } = segmentDistance(p, a, sh.points[(i + 1) % sh.points.length]);
        // the selected shape wins, then the one the point is in (two shapes can share an edge)
        const rank = d + (mine ? -1 : 0) + (pointInPolygon(p, sh.points) ? 0 : 0.02);
        if (d < reach && (!best || rank < best.d)) best = { sh, edge: i, d: rank };
      });
    }
    if (!best) return null;
    const { sh, edge } = best as { sh: Shape; edge: number };
    const a = sh.points[edge], b = sh.points[(edge + 1) % sh.points.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.02) return null;
    const near = sh.points.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) * this.s < 10);
    if (near >= 0) return { sh, edge, t: 0, point: sh.points[near], corner: near };
    // snap along the edge, then back onto it
    const q = this.snap(p, new Set(), free);
    this.guides = {};
    const t = Math.max(0.01, Math.min(len - 0.01, ((q[0] - a[0]) * (b[0] - a[0]) + (q[1] - a[1]) * (b[1] - a[1])) / len));
    return { sh, edge, t, point: [a[0] + ((b[0] - a[0]) * t) / len, a[1] + ((b[1] - a[1]) * t) / len], corner: -1 };
  }

  // ------------------------------------------------------------------ pointer

  private bindPointer(): void {
    const svg = this.svg;
    const local = (e: PointerEvent | WheelEvent | MouseEvent): [number, number] => {
      const r = svg.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const [x, y] = local(e);
      this.zoomAt(x, y, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
    }, { passive: false });
    svg.addEventListener("pointerdown", (e) => {
      this.input.hidden = true;
      const [x, y] = local(e);
      this.pointers.set(e.pointerId, { x, y });
      if (this.pointers.size === 2) {
        // two fingers: pinch to zoom, cancelling whatever one finger started
        this.drag = null;
        this.pan = null;
        const [a, b] = [...this.pointers.values()];
        this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: this.s, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
        return;
      }
      svg.setPointerCapture(e.pointerId);
      const target = (e.target as Element).closest("[data-kind]") as SVGElement | null;
      const p = this.toPlan(x, y);
      // the compass turns with any tool
      if (target?.dataset.kind === "north") {
        this.grab(target, p, e);
        return;
      }
      if (this.tool !== "select") {
        this.toolDown(p, e);
        return;
      }
      if (target) {
        this.grab(target, p, e);
        return;
      }
      this.pan = { x, y, ox: this.ox, oy: this.oy, moved: false, keep: false };
    });
    svg.addEventListener("pointermove", (e) => {
      const [x, y] = local(e);
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x, y });
      if (this.pinch && this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.zoomAt(this.pinch.cx, this.pinch.cy, (this.pinch.s * (d / this.pinch.d)) / this.s);
        return;
      }
      const p = this.toPlan(x, y);
      if (this.drag) {
        this.drag.moved = true;
        this.drag.apply(p[0], p[1], e);
        this.host.dragMove();
        this.render();
        return;
      }
      if (this.pan) {
        if (Math.hypot(x - this.pan.x, y - this.pan.y) > 4) this.pan.moved = true;
        this.ox = this.pan.ox + (x - this.pan.x);
        this.oy = this.pan.oy + (y - this.pan.y);
        this.render();
        return;
      }
      if (this.tool !== "select") {
        this.hover = this.tool === "draw" || this.tool === "rect" || this.tool === "fence" ? this.snap(p, new Set(), e.altKey) : p;
        if (this.rubber) this.rubber.b = this.hover;
        this.render();
      }
    });
    const up = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.rubber) {
        this.finishRect();
        return;
      }
      if (this.drag) {
        const d = this.drag;
        this.drag = null;
        this.guides = {};
        if (d.moved || d.made) this.host.dragEnd(d.label);
        else this.host.dragEnd("");
        this.render();
        return;
      }
      if (this.pan) {
        const { moved, keep, tap } = this.pan;
        this.pan = null;
        if (!moved && e.type === "pointerup") {
          if (tap) this.host.select(tap);
          else if (!keep) this.host.select(null);
        }
      }
    };
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    svg.addEventListener("pointerleave", () => {
      this.hover = null;
      if (this.tool !== "select") this.render();
    });
    svg.addEventListener("dblclick", (e) => {
      if (this.tool === "draw" && this.drawing.length >= 3) {
        e.preventDefault();
        this.finishDrawing();
      }
      if (this.tool === "fence" && this.drawing.length >= 2) {
        e.preventDefault();
        this.finishFence();
      }
    });
  }

  private zoomAt(x: number, y: number, k: number): void {
    const s = Math.max(6, Math.min(400, this.s * k));
    const p = this.toPlan(x, y);
    this.s = s;
    this.ox = x - p[0] * s;
    this.oy = y - p[1] * s;
    this.render();
  }

  /** Something under the pointer was pressed: the selection gets ready to be dragged, anything else waits for a click. */
  private grab(target: SVGElement, p: Vec2, e: PointerEvent): void {
    const kind = target.dataset.kind!;
    const id = target.dataset.id!;
    const fi = this.floorIndex;
    const f = this.floor!;
    if (kind === "dim") {
      this.editLength(id, Number(target.dataset.i), target);
      return;
    }
    if (kind === "north") {
      this.host.dragStart();
      this.drag = {
        kind, label: "North", moved: false,
        apply: (x, z, ev) => {
          const [sx, sy] = this.toScreen([x, z]);
          const [cx, cy] = this.compassAt();
          const a = (Math.atan2(sx - cx, -(sy - cy)) * 180) / Math.PI;
          const n = (((-a % 360) + 360) % 360);
          this.host.plan().settings.north = ev.shiftKey ? (Math.round(n / 15) * 15) % 360 : Math.round(n);
        },
      };
      return;
    }
    if (kind === "room" || kind === "outdoor" || kind === "fence") {
      // select it; dragging on a room or a fence still moves the view
      this.host.select({ floor: fi, kind: kind as "room" | "outdoor" | "fence", id });
      const [x, y] = this.toScreen(p);
      this.pan = { x, y, ox: this.ox, oy: this.oy, moved: false, keep: true };
      void e;
      return;
    }
    if (kind === "furniture" || kind === "device" || kind === "opening") {
      // only the selected thing moves: dragging anything else moves the view, and a click selects it
      const sel = this.host.selection();
      if (sel?.floor !== fi || sel.kind !== kind || sel.id !== id) {
        const [x, y] = this.toScreen(p);
        this.pan = { x, y, ox: this.ox, oy: this.oy, moved: false, keep: true, tap: { floor: fi, kind, id } };
        return;
      }
    }
    if (kind === "fencepoint" || kind === "fenceedge") {
      const fence = f.fences?.find((x) => x.id === id);
      if (!fence) return;
      let i = Number(target.dataset.i);
      this.host.dragStart();
      const [sx, sy] = this.toScreen(p);
      let made = false;
      this.drag = {
        kind, label: kind === "fencepoint" ? "Move a fence point" : "Add a fence corner", moved: false,
        apply: (x, z, ev) => {
          const live = this.host.plan().floors[fi].fences?.find((y) => y.id === id);
          if (!live) return;
          // a + becomes a new point once it moves
          if (kind === "fenceedge" && !made) {
            const [px, py] = this.toScreen([x, z]);
            if (Math.hypot(px - sx, py - sy) < 5) return;
            made = true;
            live.points.splice(i + 1, 0, [x, z]);
            i += 1;
          }
          live.points[i] = this.snap([x, z], new Set(), ev.altKey);
        },
      };
      return;
    }
    if (kind === "corner") {
      const sh = this.shapes().find((x) => x.id === id);
      if (!sh) return;
      const i = Number(target.dataset.i);
      const group = this.cornersAt(sh.points[i]);
      const exclude = new Set(group.map((c) => `${c.sh.id}:${c.i}`));
      this.host.dragStart();
      this.drag = {
        kind, label: "Move a corner", moved: false,
        apply: (x, z, ev) => {
          const q = this.snap([x, z], exclude, ev.altKey);
          for (const c of this.livePoints(group)) c.pts[c.i] = q;
        },
      };
      return;
    }
    if (kind === "edge") {
      // the whole wall moves sideways, with the corners it shares with neighbours
      const sh = this.shapes().find((x) => x.id === id);
      if (!sh) return;
      const i = Number(target.dataset.i);
      const a0 = sh.points[i], b0 = sh.points[(i + 1) % sh.points.length];
      const len = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) || 1;
      const n: Vec2 = [-(b0[1] - a0[1]) / len, (b0[0] - a0[0]) / len];
      const ga = this.cornersAt(a0), gb = this.cornersAt(b0);
      const exclude = new Set([...ga, ...gb].map((c) => `${c.sh.id}:${c.i}`));
      const start = p;
      this.host.dragStart();
      this.drag = {
        kind, label: "Move a wall", moved: false,
        apply: (x, z, ev) => {
          let off = (x - start[0]) * n[0] + (z - start[1]) * n[1];
          // snap the wall's new line onto another corner's line, or to the grid
          const probe = this.snap([a0[0] + n[0] * off, a0[1] + n[1] * off], exclude, ev.altKey);
          off = (probe[0] - a0[0]) * n[0] + (probe[1] - a0[1]) * n[1];
          for (const c of this.livePoints(ga)) c.pts[c.i] = [r2(a0[0] + n[0] * off), r2(a0[1] + n[1] * off)];
          for (const c of this.livePoints(gb)) c.pts[c.i] = [r2(b0[0] + n[0] * off), r2(b0[1] + n[1] * off)];
          if (Math.abs(n[0]) > 0.9) delete this.guides.z;
          else if (Math.abs(n[1]) > 0.9) delete this.guides.x;
        },
      };
      return;
    }
    if (kind === "furniture" || kind === "device") {
      const thing = kind === "furniture" ? f.furniture.find((x) => x.id === id) : f.devices.find((d) => d.id === id);
      if (!thing) return;
      const off: Vec2 = [thing.x - p[0], thing.z - p[1]];
      this.host.dragStart();
      // furniture keeps out of walls and other pieces: it slides along what it meets
      const collider = kind === "furniture" ? new Collider(this.host.plan(), fi, id) : null;
      this.drag = {
        kind, label: kind === "furniture" ? `Move ${furnitureType((thing as { type: string }).type).name}` : "Move a device", moved: false,
        apply: (x, z, ev) => {
          const live = this.host.plan().floors[fi];
          const t = kind === "furniture" ? live.furniture.find((y) => y.id === id) : live.devices.find((d) => d.id === id);
          if (!t) return;
          const grid = ev.altKey ? 0.01 : 0.05;
          const to: Vec2 = [r2(Math.round((x + off[0]) / grid) * grid), r2(Math.round((z + off[1]) / grid) * grid)];
          [t.x, t.z] = collider ? collider.place([t.x, t.z], to) : to;
        },
      };
      return;
    }
    if (kind === "rotate") {
      this.host.dragStart();
      this.drag = {
        kind, label: "Turn furniture", moved: false,
        apply: (x, z, ev) => {
          const t = this.host.plan().floors[fi].furniture.find((y) => y.id === id);
          if (!t) return;
          // the handle is in front of the piece: its front points at the pointer
          let deg = (Math.atan2(-(x - t.x), z - t.z) * 180) / Math.PI;
          if (!ev.altKey) deg = Math.round(deg / 15) * 15;
          t.rotation = Math.round(((deg % 360) + 360) % 360);
          settle(this.host.plan(), fi, id);
        },
      };
      return;
    }
    if (kind === "opening") {
      const o = f.openings.find((x) => x.id === id);
      const room = o && f.rooms.find((r) => r.id === o.room_id);
      if (!o || !room) return;
      const a = room.points[o.edge], b = room.points[(o.edge + 1) % room.points.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      this.host.dragStart();
      this.drag = {
        kind, label: `Move a ${o.kind}`, moved: false,
        apply: (x, z, ev) => {
          const live = this.host.plan().floors[fi].openings.find((y) => y.id === id);
          if (!live) return;
          const { t } = segmentDistance([x, z], a, b);
          const grid = ev.altKey ? 0.01 : 0.05;
          live.offset = r2(Math.max(live.width / 2, Math.min(len - live.width / 2, Math.round(t / grid) * grid)));
        },
      };
    }
  }

  /** The live point arrays (in the plan being edited) for corners found on the drawn copy. */
  private livePoints(group: { sh: Shape; i: number }[]): { pts: Vec2[]; i: number }[] {
    const f = this.host.plan().floors[this.floorIndex];
    return group.map((c) => {
      const s = c.sh.outdoor ? f.outdoor?.find((o) => o.id === c.sh.id) : f.rooms.find((r) => r.id === c.sh.id);
      return { pts: s?.points ?? [], i: c.i };
    });
  }

  // ------------------------------------------------------------------ tools

  private toolDown(p: Vec2, e: PointerEvent): void {
    const fi = this.floorIndex;
    if (this.tool === "image") {
      const bg = this.floor?.background;
      const [sx, sy] = this.toScreen(p);
      if (bg && this.measure) {
        if (this.measure.length < 2) this.measure.push(p);
        // after the click is over: the press would take the focus straight back from the box
        if (this.measure.length === 2) setTimeout(() => this.askLength());
        this.render();
        return;
      }
      // the picture moves; around it (or without one) the view does
      if (!bg || !insideImage(bg, p)) {
        this.pan = { x: sx, y: sy, ox: this.ox, oy: this.oy, moved: false, keep: true };
        return;
      }
      const from: Vec2 = [bg.x, bg.z];
      this.host.dragStart();
      this.drag = {
        kind: "image", label: "Move the floor plan picture", moved: false,
        apply: (x, z) => {
          const live = this.host.plan().floors[fi]?.background;
          if (!live) return;
          live.x = r3(from[0] + x - p[0]);
          live.z = r3(from[1] + z - p[1]);
        },
      };
      return;
    }
    if (this.tool === "rect") {
      const a = this.snap(p, new Set(), e.altKey);
      this.rubber = { a, b: a };
      return;
    }
    if (this.tool === "draw") {
      const q = this.snap(p, new Set(), e.altKey);
      if (this.drawing.length >= 3 && Math.hypot(q[0] - this.drawing[0][0], q[1] - this.drawing[0][1]) * this.s < 12) {
        this.finishDrawing();
        return;
      }
      this.drawing.push(q);
      this.render();
      return;
    }
    if (this.tool === "fence") {
      const q = this.snap(p, new Set(), e.altKey);
      const last = this.drawing[this.drawing.length - 1];
      if (last && this.drawing.length >= 2 && Math.hypot(q[0] - last[0], q[1] - last[1]) * this.s < 12) {
        this.finishFence();
        return;
      }
      if (!last || Math.hypot(q[0] - last[0], q[1] - last[1]) > 0.05) this.drawing.push(q);
      this.render();
      return;
    }
    if (this.tool === "corner") {
      const hit = this.shapeEdgeAt(p, e.altKey);
      if (!hit) {
        this.host.status("Click on the edge of a room or garden area.");
        return;
      }
      const { sh } = hit;
      this.host.select({ floor: fi, kind: sh.outdoor ? "outdoor" : "room", id: sh.id });
      this.host.dragStart();
      // a new corner on the edge, or the corner already there; dragging then moves it
      const i = hit.corner >= 0 ? hit.corner : splitEdge(this.host.plan().floors[fi], sh.id, sh.outdoor, hit.edge, hit.t);
      const group = hit.corner >= 0 ? this.cornersAt(hit.point) : [{ sh, i }];
      const exclude = new Set(group.map((c) => `${c.sh.id}:${c.i}`));
      const [sx, sy] = this.toScreen(p);
      let away = false;
      this.drag = {
        kind: "corner", label: hit.corner >= 0 ? "Move a corner" : "Add a corner", moved: false, made: hit.corner < 0,
        apply: (x, z, ev) => {
          // a click's wobble leaves the new corner on its edge
          const [px, py] = this.toScreen([x, z]);
          if (!away && Math.hypot(px - sx, py - sy) < 5) return;
          away = true;
          const q = this.snap([x, z], exclude, ev.altKey);
          for (const c of this.livePoints(group)) c.pts[c.i] = q;
        },
      };
      this.render();
      return;
    }
    if (this.tool === "door" || this.tool === "window") {
      const hit = this.edgeAt(p);
      if (!hit) {
        this.host.status("Click on a wall of a room.");
        return;
      }
      const door = this.tool === "door";
      const width = Math.min(door ? 0.82 : 1.2, hit.len - 0.1);
      if (width < 0.3) return;
      const op: Opening = {
        id: newId("op"), room_id: hit.room.id, edge: hit.edge,
        offset: r2(Math.max(width / 2, Math.min(hit.len - width / 2, hit.t))),
        width: r2(width), height: door ? 2.0 : 1.2, sill: door ? 0 : 0.9, kind: door ? "door" : "window",
        hinge: "left", swing: "in",
      };
      this.host.change((pl) => pl.floors[fi].openings.push(op), door ? "Add a door" : "Add a window");
      this.host.select({ floor: fi, kind: "opening", id: op.id });
      this.setTool("select");
    }
  }

  private finishRect(): void {
    const r = this.rubber!;
    this.rubber = null;
    this.guides = {};
    const w = Math.abs(r.b[0] - r.a[0]), d = Math.abs(r.b[1] - r.a[1]);
    if (w < 0.5 || d < 0.5) {
      this.render();
      return;
    }
    const x0 = Math.min(r.a[0], r.b[0]), z0 = Math.min(r.a[1], r.b[1]);
    this.addRoom([[x0, z0], [x0 + w, z0], [x0 + w, z0 + d], [x0, z0 + d]]);
  }

  private finishDrawing(): void {
    const pts = this.drawing;
    this.drawing = [];
    if (pts.length < 3 || area(pts) < 0.5) {
      this.render();
      return;
    }
    this.addRoom(pts);
  }

  /** A fence along the points clicked: like the last fence drawn, else a closeboard fence. */
  private finishFence(): void {
    const pts = this.drawing;
    this.drawing = [];
    if (pts.length < 2) {
      this.render();
      return;
    }
    const fi = this.floorIndex;
    const like = this.floor?.fences?.[this.floor.fences.length - 1];
    const fence: Fence = {
      id: newId("fence"), points: pts.map(([x, z]) => [r2(x), r2(z)]),
      style: like?.style ?? "closeboard", height: like?.height ?? 1.8, color: like?.color ?? null, gates: [],
    };
    this.host.change((p) => {
      const f = p.floors[fi];
      f.fences = [...(f.fences ?? []), fence];
    }, "Draw a fence");
    this.host.select({ floor: fi, kind: "fence", id: fence.id });
    this.setTool("select");
  }

  private drawFenceLine(g: SVGGElement, fence: Fence, selected: boolean): void {
    const def = fenceStyle(fence.style);
    const colour = fence.color ?? def.color ?? (def.paint.includes("blackMetal") ? "#2b2c2e" : def.paint.includes("metal") ? "#9aa0a6" : fence.style === "brick_wall" ? "#a65d44" : fence.style === "glass" ? "#7fb6d1" : "#b8874f");
    const wide = Math.max(3, (fence.style === "brick_wall" ? 0.25 : 0.08) * this.s);
    const grp = el("g", { class: `p2-fence${selected ? " sel" : ""}`, "data-kind": "fence", "data-id": fence.id });
    grp.append(el("polyline", { points: this.pts(fence.points), class: "p2-fence-line", stroke: colour, "stroke-width": wide }));
    // gates: a pale gap across the line
    const along = (d: number): Vec2 => {
      let acc = 0;
      for (let i = 1; i < fence.points.length; i++) {
        const a = fence.points[i - 1], b = fence.points[i];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (acc + l >= d || i === fence.points.length - 1) {
          const t = l ? Math.max(0, Math.min(1, (d - acc) / l)) : 0;
          return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        }
        acc += l;
      }
      return fence.points[0];
    };
    for (const gate of fence.gates ?? []) {
      const [ax, ay] = this.toScreen(along(gate.at - gate.width / 2));
      const [bx, by] = this.toScreen(along(gate.at + gate.width / 2));
      grp.append(el("line", { x1: ax, y1: ay, x2: bx, y2: by, class: "p2-fence-gate", "stroke-width": wide + 1 }));
    }
    grp.append(el("polyline", { points: this.pts(fence.points), class: "p2-fence-hit" }));
    g.append(grp);
  }

  private addRoom(points: Vec2[]): void {
    const fi = this.floorIndex;
    const n = (this.floor?.rooms.length ?? 0) + 1;
    const room: Room = { id: newId("room"), name: `Room ${n}`, area_id: null, floor: "wood", wall_finish: "paint", points: points.map(([x, z]) => [r2(x), r2(z)]) };
    this.host.change((p) => {
      if (!p.floors.length) p.floors.push(firstFloor());
      p.floors[fi].rooms.push(room);
    }, "Draw a room");
    this.host.select({ floor: fi, kind: "room", id: room.id });
    this.setTool("select");
  }

  /** A measurement was clicked: type the length the edge should have. */
  private editLength(id: string, i: number, target: SVGElement): void {
    const sh = this.shapes().find((x) => x.id === id);
    if (!sh) return;
    const a = sh.points[i], b = sh.points[(i + 1) % sh.points.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const r = target.getBoundingClientRect();
    const host = this.el.getBoundingClientRect();
    const input = this.input;
    input.hidden = false;
    input.value = len.toFixed(2);
    input.style.left = `${r.left - host.left + r.width / 2 - 40}px`;
    input.style.top = `${r.top - host.top + r.height / 2 - 14}px`;
    input.focus();
    input.select();
    const done = (apply: boolean) => {
      input.onkeydown = null;
      input.onblur = null;
      input.hidden = true;
      const v = parseFloat(input.value.replace(",", "."));
      if (!apply || !isFinite(v) || v < 0.2 || Math.abs(v - len) < 0.001) return;
      this.setLength(sh, i, v);
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter") done(true);
      if (e.key === "Escape") done(false);
      e.stopPropagation();
    };
    input.onblur = () => done(true);
  }

  /**
   * Makes edge i of a shape `len` long by moving everything at its far end: the corners beyond the
   * edge's end along its direction move with it (the room stretches), and so do the corners of
   * neighbours sitting on them, so shared walls stay shared.
   */
  private setLength(sh: Shape, i: number, len: number): void {
    const pts = sh.points;
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const cur = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const dir: Vec2 = [(b[0] - a[0]) / cur, (b[1] - a[1]) / cur];
    const delta = len - cur;
    const far = (b[0] - a[0]) * dir[0] + (b[1] - a[1]) * dir[1];
    const moving = new Set<number>();
    pts.forEach((p, k) => {
      const along = (p[0] - a[0]) * dir[0] + (p[1] - a[1]) * dir[1];
      if (along >= far - 0.02) moving.add(k);
    });
    const group = [...moving].flatMap((k) => this.cornersAt(pts[k]));
    const fi = this.floorIndex;
    this.host.change((p) => {
      const f = p.floors[fi];
      const done = new Set<string>();
      for (const c of group) {
        const key = `${c.sh.id}:${c.i}`;
        if (done.has(key)) continue;
        done.add(key);
        const s = c.sh.outdoor ? f.outdoor?.find((o) => o.id === c.sh.id) : f.rooms.find((r) => r.id === c.sh.id);
        const q = s?.points[c.i];
        if (s && q) s.points[c.i] = [r2(q[0] + dir[0] * delta), r2(q[1] + dir[1] * delta)];
      }
    }, `Set a wall to ${fmt(len)}`);
  }

  private onKey = (e: KeyboardEvent): void => {
    const target = e.composedPath()[0] as HTMLElement | undefined;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (e.ctrlKey || e.metaKey || !this.el.isConnected) return;
    const sel = this.host.selection();
    const fi = this.floorIndex;
    if (e.key === "Escape") {
      if (this.measure) {
        this.measure = null;
        this.render();
      } else if (this.tool !== "select") this.setTool("select");
      else this.host.select(null);
      return;
    }
    if (e.key === "Enter" && this.tool === "draw" && this.drawing.length >= 3) {
      this.finishDrawing();
      return;
    }
    if (e.key === "Enter" && this.tool === "fence" && this.drawing.length >= 2) {
      this.finishFence();
      return;
    }
    if (!sel || sel.floor !== fi) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      if (sel.kind === "room" || sel.kind === "outdoor") return; // rooms are removed from the drawer, with a confirmation
      e.preventDefault();
      this.host.change((p) => {
        const f = p.floors[fi];
        if (sel.kind === "furniture") f.furniture = f.furniture.filter((x) => x.id !== sel.id);
        if (sel.kind === "device") f.devices = f.devices.filter((x) => x.id !== sel.id);
        if (sel.kind === "opening") f.openings = f.openings.filter((x) => x.id !== sel.id);
        if (sel.kind === "fence") f.fences = (f.fences ?? []).filter((x) => x.id !== sel.id);
      }, sel.kind === "fence" ? "Remove a fence" : "Remove");
      this.host.select(null);
      return;
    }
    const step = e.shiftKey ? 0.1 : 0.01;
    const move: Record<string, Vec2> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const m = move[e.key];
    if (m && (sel.kind === "furniture" || sel.kind === "device")) {
      e.preventDefault();
      this.host.change((p) => {
        const f = p.floors[fi];
        const t = sel.kind === "furniture" ? f.furniture.find((x) => x.id === sel.id) : f.devices.find((x) => x.id === sel.id);
        if (!t) return;
        const to: Vec2 = [r2(t.x + m[0]), r2(t.z + m[1])];
        [t.x, t.z] = sel.kind === "furniture" ? new Collider(p, fi, sel.id).place([t.x, t.z], to) : to;
      }, "Nudge");
    }
    if ((e.key === "r" || e.key === "R") && sel.kind === "furniture") {
      this.host.change((p) => {
        const t = p.floors[fi].furniture.find((x) => x.id === sel.id);
        if (!t) return;
        t.rotation = (t.rotation + (e.shiftKey ? 270 : 90)) % 360;
        settle(p, fi, sel.id);
      }, "Turn furniture");
    }
  };
}

export const PLAN2D_CSS = /* css */ `
.p2 { position: absolute; inset: 0; z-index: 2; background: var(--p2-bg, #f4f5f2); touch-action: none; user-select: none; -webkit-user-select: none; }
.vh-root:not(.day) .p2 { --p2-bg: #151a24; }
@media (min-width: 601px) { .vh-root.editing .p2 { right: min(380px, 100%); } }
@media (max-width: 600px) { .vh-root.editing .p2 { bottom: 62%; } }
.p2-svg { display: block; width: 100%; height: 100%; font: 11px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
.p2-grid { stroke: rgba(127,127,127,0.16); stroke-width: 1; fill: none; }
.p2-ghost { fill: none; stroke: rgba(127,127,127,0.45); stroke-dasharray: 4 4; }
.p2-room { fill-opacity: 0.38; stroke: none; cursor: pointer; }
.p2-room.sel { fill-opacity: 0.6; }
.p2-out { fill-opacity: 0.35; cursor: pointer; fill: #9cc27a; }
.p2-out-patio, .p2-out-path, .p2-out-gravel { fill: #b9b2a6; }
.p2-out-driveway { fill: #a08877; }
.p2-out-asphalt { fill: #5d6066; }
.p2-out-deck { fill: #b58a62; }
.p2-out.sel { fill-opacity: 0.55; }
.p2-fence { cursor: pointer; }
.p2-fence-line { fill: none; stroke-linecap: square; stroke-linejoin: miter; opacity: 0.9; }
.p2-fence.sel .p2-fence-line { opacity: 1; filter: drop-shadow(0 0 2px #2f7cf6); }
.p2-fence-gate { stroke: var(--p2-bg, #f4f5f2); stroke-dasharray: 3 3; }
.p2-fence-hit { fill: none; stroke: transparent; stroke-width: 16; }
.p2-wall { fill: #3b3f45; }
.p2-wall.ext { fill: #24272c; }
.vh-root:not(.day) .p2-wall { fill: #a3acba; }
.vh-root:not(.day) .p2-wall.ext { fill: #c9d0db; }
.p2-gap { fill: var(--p2-bg, #f4f5f2); }
.p2-win { fill: #bfe0f2; stroke: #3b3f45; stroke-width: 1; }
.p2-win-line { stroke: #3b3f45; stroke-width: 1; }
.p2-leaf { stroke: #3b3f45; stroke-width: 2; }
.vh-root:not(.day) .p2-leaf, .vh-root:not(.day) .p2-win-line { stroke: #c9d0db; }
.p2-swing { fill: none; stroke: #8b8d98; stroke-width: 1; stroke-dasharray: 3 3; }
.p2-hit { fill: transparent; cursor: ew-resize; }
.p2-op.sel .p2-hit { fill: rgba(47,124,246,0.22); }
.p2-item { cursor: move; }
.p2-item rect, .p2-item ellipse { fill: rgba(255,255,255,0.78); stroke: #6b6f78; stroke-width: 1; }
.vh-root:not(.day) .p2-item rect, .vh-root:not(.day) .p2-item ellipse { fill: rgba(40,46,58,0.85); stroke: #9aa3b2; }
.p2-item.lamp ellipse { fill: rgba(245,184,61,0.5); }
.p2-item.high rect, .p2-item.high ellipse { stroke-dasharray: 4 3; fill-opacity: 0.45; }
.p2-item-label.sel { font-weight: 700; fill: #2f7cf6; }
.p2-item.sel rect, .p2-item.sel ellipse { stroke: #2f7cf6; stroke-width: 2; }
.p2-front { stroke: #6b6f78; stroke-width: 2; }
.p2-item-label { fill: #555; font-size: 9px; pointer-events: none; }
.vh-root:not(.day) .p2-item-label { fill: #c9d0db; }
.p2-dev { stroke: #fff; stroke-width: 1.5; cursor: move; }
.p2-dev.sel { stroke: #2f7cf6; stroke-width: 3; }
.p2-name { fill: #1f2329; font-size: 12px; font-weight: 600; pointer-events: none; }
.p2-area { fill: #6b6f78; font-size: 10px; pointer-events: none; }
.vh-root:not(.day) .p2-name { fill: #e8eef8; }
.vh-root:not(.day) .p2-area { fill: #9aa3b2; }
.p2-badge rect, .p2-dim rect { fill: rgba(255,255,255,0.92); stroke: rgba(0,0,0,0.12); }
.p2-badge text, .p2-dim text { fill: #1f2329; font-size: 10.5px; font-variant-numeric: tabular-nums; }
.p2-dim { cursor: text; }
.p2-dim.sel rect { fill: #2f7cf6; stroke: none; }
.p2-dim.sel text { fill: #fff; font-weight: 600; }
.p2-corner { fill: #fff; stroke: #2f7cf6; stroke-width: 2.5; cursor: grab; }
.p2-edge { fill: #2f7cf6; stroke: #fff; stroke-width: 1.5; cursor: move; }
.p2-rot { fill: #fff; stroke: #2f7cf6; stroke-width: 2.5; cursor: grab; }
.p2-rot-line { stroke: #2f7cf6; stroke-width: 1.5; stroke-dasharray: 3 3; }
.p2-guide { stroke: #e5484d; stroke-width: 1; stroke-dasharray: 5 4; }
.p2-drawing { fill: none; stroke: #2f7cf6; stroke-width: 2; }
.p2-drawing.fill { fill: rgba(47,124,246,0.12); }
.p2-draw-pt { fill: #2f7cf6; }
.p2-place { fill: rgba(47,124,246,0.35); stroke: #2f7cf6; stroke-width: 2; }
.p2-north { cursor: grab; }
.p2-north circle { fill: rgba(255,255,255,0.85); stroke: rgba(0,0,0,0.15); }
.vh-root:not(.day) .p2-north circle { fill: rgba(30,36,48,0.85); stroke: rgba(255,255,255,0.15); }
.p2-north .n { fill: #e5484d; }
.p2-north .s { fill: rgba(127,127,127,0.6); }
.p2-north text { fill: #e5484d; font-weight: 700; font-size: 12px; text-anchor: middle; }
.p2-empty { fill: #8b8d98; font-size: 14px; }
.p2-bar { position: absolute; left: 10px; top: 10px; display: flex; gap: 8px; flex-wrap: wrap; pointer-events: none; }
.p2-group { display: flex; gap: 2px; padding: 3px; border-radius: 14px; background: var(--vh-glass); box-shadow: 0 1px 6px rgba(0,0,0,0.16); pointer-events: auto; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.p2-tool { width: 34px; height: 34px; border: 0; border-radius: 11px; background: none; color: var(--vh-text); display: grid; place-items: center; cursor: pointer; padding: 0; }
.p2-tool svg { width: 20px; height: 20px; fill: currentColor; }
.p2-tool.on { background: var(--vh-accent); color: #fff; }
.p2-floor { border: 0; border-radius: 11px; background: none; color: var(--vh-text); font: inherit; font-size: 12px; padding: 0 10px; cursor: pointer; }
.p2-floor.on { background: var(--vh-chip-on); font-weight: 600; }
.p2-bg image { pointer-events: none; }
.p2-svg.traced .p2-room { fill-opacity: 0.16; }
.p2-svg.traced .p2-room.sel { fill-opacity: 0.3; }
.p2-svg.traced .p2-out { fill-opacity: 0.14; }
.p2-img-frame { fill: none; stroke: #2f7cf6; stroke-width: 1.5; stroke-dasharray: 6 4; pointer-events: none; }
.p2-measure { stroke: #e5484d; stroke-width: 2; }
.p2-measure-pt { fill: #e5484d; }
.p2-panel { position: absolute; left: 10px; top: 56px; width: min(300px, calc(100% - 20px)); max-height: calc(100% - 66px); overflow: auto; box-sizing: border-box; padding: 10px 12px; border-radius: 14px; background: var(--vh-glass); color: var(--vh-text); box-shadow: 0 1px 6px rgba(0,0,0,0.16); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); font: 12.5px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; z-index: 3; }
.p2-panel[hidden] { display: none; }
.p2-panel b { display: block; margin-bottom: 6px; }
.p2-panel p { margin: 0 0 8px; color: var(--vh-dim); }
.p2-panel p.err { color: #e5484d; }
.p2-panel .row { display: flex; align-items: center; gap: 6px; margin: 6px 0; }
.p2-panel .row label { min-width: 34px; color: var(--vh-dim); }
.p2-panel input[type=range] { flex: 1; min-width: 0; accent-color: var(--vh-accent); }
.p2-panel .val { min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }
.p2-panel .ed-btn svg { width: 16px; height: 16px; fill: currentColor; vertical-align: -3px; margin-right: 4px; }
.p2-panel .ib { width: 30px; height: 30px; flex: none; border: 0; border-radius: 9px; background: var(--vh-chip); color: var(--vh-text); display: grid; place-items: center; cursor: pointer; padding: 0; }
.p2-panel .ib svg { width: 18px; height: 18px; fill: currentColor; }
.p2-input { position: absolute; width: 80px; padding: 4px 6px; border-radius: 8px; border: 2px solid #2f7cf6; font: 13px system-ui; text-align: center; z-index: 3; }
`;
