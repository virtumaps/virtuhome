// The 3D view. Draws only when something changed (zero GPU work while idle), merges each floor
// into a couple of meshes, and lights them on the CPU.
import {
  Color, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, Raycaster, Scene, Vector2, Vector3, WebGLRenderer,
  CircleGeometry, BufferGeometry, BufferAttribute, DoubleSide, type Material,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { spaces, type Device, type Floor, type Plan, type Vec2 } from "../model/plan";
import { buildFloor, lin, SLAB, stairwells, type FloorBuild, type GlowSlot, type ItemRef, type LampInfo } from "./build";
import { Geo, type V3 } from "./geo";
import { relight, relightRealistic, roomGlow, roomLights, type LampState, type LightingState } from "./lighting";
import { buildOpeningMoving, joineryLook, restOpen, windowFollowsSensor, type OpeningInfo } from "./joinery";
import { Halos, Markers, type HaloSpec, type MarkerSpec } from "./markers";
import { floorUniforms, getCut, glassMaterial, opaqueMaterial, setCut, setTint, WALL_TRIM, type FloorUniforms } from "./materials";
import { DAY, paletteFor, type Palette } from "./palette";
import type { RealisticLook } from "./realistic";
import type { Tier, TierSetting } from "./tier";

export { detectLowEnd } from "./tier";
export type WallMode = "smart" | "low" | "full";
export type Quality = TierSetting;
/** The realistic look's module, loaded on demand. */
export type RealisticModule = typeof import("./realistic");

export interface MarkerLook {
  icon: number;
  color: number;
  pulse: number;
  /** Shown in the whole-house view too (motion, alerts, open doors, a triggered alarm). */
  attention?: boolean;
}

export interface LiveSource {
  lamp(lamp: LampInfo): LampState | null;
  /** A lamp shade's or screen's own colour while on, else null (drawn unlit-lit as usual). */
  glowColor(g: GlowSlot): V3 | null;
  /** How a device's marker looks now; null hides it (e.g. lights, drawn as lamps instead). */
  marker(d: Device): MarkerLook | null;
  /** Doors and windows: 0 closed .. 1 open, null without a sensor. */
  contact(entity: string | null | undefined): number | null;
  /** Blind or curtain: 0 closed .. 1 open, null without one. */
  cover(entity: string | null | undefined): number | null;
  tint(floor: Floor, room: { id: string }): [number, number, number, number] | null;
  /** Short text under the room name, e.g. "21.4° · 48 %". */
  roomText(floor: Floor, room: { id: string }): string | null;
  /** A camera that is live or sees motion (its view cone turns red). */
  cameraActive?(d: Device): boolean;
}

export interface Hit {
  kind: "marker" | "lamp" | "entity" | "furniture" | "room" | "empty";
  floor: number;
  room: number;
  entity: string | null;
  device?: Device;
  /** The plan item under the finger (furniture, or the device behind a marker or lamp). */
  item?: ItemRef;
  /** World height of what was hit (dragging keeps it under the finger). */
  y?: number;
}

export type DragPhase = "start" | "move" | "end";

interface FloorView {
  fb: FloorBuild;
  /** What the floor was built from: an unchanged floor is not rebuilt. */
  key: string;
  group: Group;
  opaque: Mesh;
  glass: Mesh;
  /** Moving parts: door leaves, sashes that follow a sensor, blinds; and their glass. */
  dyn: Mesh;
  dynGeo: Geo;
  dynGlass: Mesh;
  dynGlassGeo: Geo;
  u: FloorUniforms;
  offset: number;
  /** Target and current cut per wall slot. */
  cutTarget: Float32Array;
  /** How far each door and window is open (0..1) and where it is going. */
  doorPos: Float32Array;
  doorTarget: Float32Array;
  winPos: Float32Array;
  winTarget: Float32Array;
  coverPos: Float32Array;
  coverTarget: Float32Array;
  roomGlow: number[];
  labels: HTMLElement[];
}

/** Doors start where they rest without a sensor (hinged ones ajar). */
const doorRest = (fb: FloorBuild) => Float32Array.from(fb.doors, (d) => restOpen(d.opening));
const EXPLODE_GAP = 2.2;

export class Viewer {
  renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(38, 1, 0.1, 400);
  readonly controls: OrbitControls;
  tier: Tier;
  plan: Plan | null = null;
  pal: Palette;
  mode: "house" | "floor" = "house";
  activeFloor = 0;
  selectedRoom = -1;
  walls: WallMode = "smart";
  explode = true;
  cutHeight = 1.15;
  /** Called after each drawn frame (overlays follow the camera). */
  onFrame: (() => void) | null = null;
  onHit: ((hit: Hit, gesture: "tap" | "long" | "double") => void) | null = null;
  /** Edit mode: things can be dragged; plan coordinates of the finger while dragging. */
  editMode = false;
  onDrag: ((hit: Hit, x: number, z: number, phase: DragPhase) => void) | null = null;
  /** Extra markers drawn on top (the editor's selection). */
  overlayMarkers: MarkerSpec[] = [];
  /** Called once when moving the view stays slow (under ~22 frames per second). */
  onSlow: (() => void) | null = null;

  private floors: FloorView[] = [];
  /** The door or window whose wall stays up (the editor's selection). */
  private raised: { floor: number; opening: string } | null = null;
  private markers: Markers;
  private halos: Halos;
  private ground: Mesh;
  /** What the cameras of the shown floor see, on the floor. */
  private cones: Mesh;
  private live: LiveSource | null = null;
  private raf = 0;
  private dirty = true;
  private visible = true;
  private lastFrame = 0;
  private flight: { from: [Vector3, Vector3]; to: [Vector3, Vector3]; t: number; dur: number } | null = null;
  private resizeObs: ResizeObserver;
  private interObs: IntersectionObserver;
  private width = 1;
  private height = 1;
  private pixelRatio = 1;
  private disposed = false;
  private stats = { frames: 0, last: 0, fps: 0, ms: 0 };
  private lastPulseCheck = 0;
  private look: RealisticLook | null = null;
  private realistic: RealisticModule | null;
  private basicGround = new MeshBasicMaterial({ color: 0xffffff });
  /** Something moved in the scene (not just the camera): shadows need redrawing. */
  private sceneChanged = true;
  private sun: { azimuth: number | null; elevation: number | null } = { azimuth: null, elevation: null };
  private slowWatch = { frames: 0, time: 0, fired: false };
  /** Measured once per label element (reading sizes every frame would force layouts). */
  private labelSize = new WeakMap<HTMLElement, number[]>();

  constructor(private container: HTMLElement, private overlay: HTMLElement, opts: { tier: Tier; realistic?: RealisticModule | null; theme?: "day" | "night" }) {
    this.tier = opts.tier;
    this.realistic = opts.realistic ?? null;
    this.pal = paletteFor(opts.theme ?? "night");
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.low ? 1 : 2);
    this.renderer = this.createRenderer();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.2;
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 120;
    this.controls.screenSpacePanning = false;
    this.controls.addEventListener("change", () => this.invalidate());

    this.markers = new Markers(this.pixelRatio);
    this.halos = new Halos();
    this.ground = new Mesh(new CircleGeometry(1, 64), this.basicGround);
    this.ground.rotation.x = -Math.PI / 2;
    this.cones = new Mesh(new BufferGeometry(), new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: DoubleSide }));
    this.cones.renderOrder = 3;
    this.scene.add(this.ground, this.cones, this.halos.mesh, this.markers.mesh);
    this.setupLook();
    this.applyPalette();

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    this.interObs = new IntersectionObserver((entries) => {
      this.visible = entries.some((e) => e.isIntersecting);
      if (this.visible) this.invalidate();
    });
    this.interObs.observe(container);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.bindPointer();
    this.resize();
  }

  /** Fire-class tablets: the cheapest way of drawing everything. */
  get low(): boolean {
    return this.tier === "low";
  }

  get realisticLook(): boolean {
    return this.look !== null;
  }

  private createRenderer(): WebGLRenderer {
    const r = new WebGLRenderer({
      // Ultra antialiases in its own multisampled buffer
      antialias: this.tier === "medium" || this.tier === "high",
      powerPreference: this.low ? "low-power" : this.tier === "medium" ? "default" : "high-performance",
      alpha: false,
      stencil: false,
    });
    r.setPixelRatio(this.pixelRatio);
    r.domElement.style.display = "block";
    r.domElement.style.touchAction = "none";
    r.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
    r.domElement.addEventListener("webglcontextrestored", () => this.plan && this.setPlan(this.plan, true, false));
    this.container.appendChild(r.domElement);
    return r;
  }

  private setupLook(): void {
    const wantsLook = (this.tier === "high" || this.tier === "ultra") && this.realistic;
    this.look = wantsLook ? new this.realistic!.RealisticLook(this.renderer, this.scene, this.camera, this.tier === "ultra") : null;
    if (this.look) {
      this.ground.material = this.look.groundMaterial;
      this.look.attachGround(this.ground);
      this.look.setSun(this.sun.azimuth, this.sun.elevation, this.plan?.settings.north ?? 0);
    } else {
      this.ground.material = this.basicGround;
      this.ground.receiveShadow = false;
    }
  }

  /** Switches to another tier: a new renderer (antialiasing is fixed per renderer), same view. */
  setTier(tier: Tier, realistic?: RealisticModule | null): void {
    if (realistic) this.realistic = realistic;
    const wantsLook = (tier === "high" || tier === "ultra") && !!this.realistic;
    const sameRenderer = tier === this.tier;
    if (sameRenderer && wantsLook === !!this.look) return;
    for (const f of this.floors) this.disposeFloor(f);
    this.floors = [];
    this.look?.dispose();
    this.look = null;
    this.tier = tier;
    this.slowWatch = { frames: 0, time: 0, fired: false };
    if (!sameRenderer) {
      this.controls.disconnect();
      this.renderer.dispose();
      this.renderer.domElement.remove();
      this.renderer = this.createRenderer();
      this.controls.connect(this.renderer.domElement);
    }
    this.setupLook();
    this.applyPalette();
    this.width = this.height = 0;
    this.resize();
    if (this.plan) this.setPlan(this.plan, true);
  }

  /** Where the sun is (degrees), for the realistic look's daylight and shadows. */
  setSun(azimuth: number | null, elevation: number | null): void {
    if (azimuth === this.sun.azimuth && elevation === this.sun.elevation) return;
    this.sun = { azimuth, elevation };
    if (this.look) {
      this.look.setSun(azimuth, elevation, this.plan?.settings.north ?? 0);
      this.invalidate();
    }
  }

  // ------------------------------------------------------------------ plan and looks

  /**
   * Shows a plan. Floors whose plan did not change are kept as they are, and a changed floor is
   * rebuilt into its old meshes and materials, so editing one piece costs one floor's build and
   * no shader or texture work.
   */
  setPlan(plan: Plan, keepView = false, reuse = true): void {
    this.dropLifted();
    this.plan = plan;
    if (!reuse) {
      for (const f of this.floors) this.disposeFloor(f);
      this.floors = [];
    }
    while (this.floors.length > plan.floors.length) this.disposeFloor(this.floors.pop()!);
    plan.floors.forEach((floor, i) => {
      const f = this.floors[i];
      if (!f) this.floors.push(this.makeFloor(i));
      else if (f.key !== this.floorKey(i)) this.rebuildFloor(f, i);
      // same content, maybe a new object (undo): later edits and live state read this one
      else f.fb.floor = floor;
    });
    this.activeFloor = Math.min(this.activeFloor, Math.max(0, this.floors.length - 1));
    this.layoutFloors();
    this.refreshAll();
    if (!keepView) this.frame(false);
    this.invalidate();
  }

  setTheme(name: "day" | "night"): void {
    if (this.pal.name === name) return;
    this.pal = paletteFor(name);
    this.applyPalette();
    if (this.plan) this.setPlan(this.plan, true, false);
  }

  setLive(live: LiveSource): void {
    this.live = live;
    this.refreshAll();
  }

  private applyPalette(): void {
    this.basicGround.color.setHex(this.pal.ground);
    if (this.look) this.look.setNight(this.pal.name === "night");
    else {
      this.scene.background = new Color(this.pal.background);
      this.scene.fog = null;
    }
  }

  /** Everything a floor's build depends on. */
  private floorKey(i: number): string {
    const plan = this.plan!;
    // stairs on the storey below cut the stairwell in this one's floor
    return JSON.stringify([plan.settings, plan.floors[i], stairwells(plan, i), i === 0, i < plan.floors.length - 1, this.pal.name, !!this.look, this.low]);
  }

  private buildFloor(i: number): FloorBuild {
    // the realistic look lights true colours; the model look bakes the palette's mood into them
    return buildFloor(this.plan!, i, this.look ? DAY : this.pal, { low: this.low });
  }

  private makeFloor(i: number): FloorView {
    const key = this.floorKey(i);
    const fb = this.buildFloor(i);
    const u = floorUniforms();
    u.uCutColor.value.setHex(this.look ? 0x2c2f34 : this.pal.wallCut);
    u.uCutY.value = fb.floor.elevation + this.cutHeight;
    u.uFloorY.value = fb.floor.elevation;
    const dynGeo = new Geo();
    const dynGlassGeo = new Geo();
    let opaque: Mesh, glass: Mesh, dyn: Mesh, dynGlass: Mesh;
    if (this.look) {
      opaque = new Mesh(this.look.geometry(fb.opaque), this.look.materials(fb.opaque, u));
      glass = new Mesh(this.look.geometry(fb.glass), this.look.glassMaterial(fb.glass, u));
      dyn = new Mesh(new BufferGeometry(), [] as Material[]);
      dynGlass = new Mesh(new BufferGeometry(), [] as Material[]);
      this.look.attach(opaque, u, true);
      this.look.attach(dyn, u, true);
    } else {
      opaque = new Mesh(fb.opaque.toBufferGeometry(), opaqueMaterial(u));
      glass = new Mesh(fb.glass.toBufferGeometry(), glassMaterial(u));
      dyn = new Mesh(new BufferGeometry(), opaqueMaterial(u));
      dynGlass = new Mesh(new BufferGeometry(), glassMaterial(u));
    }
    glass.renderOrder = 2;
    dynGlass.renderOrder = 2;
    const group = new Group();
    group.add(opaque, dyn, glass, dynGlass);
    this.scene.add(group);
    const slots = 128;
    return {
      fb, key, group, opaque, glass, dyn, dynGeo, dynGlass, dynGlassGeo, u, offset: 0,
      cutTarget: new Float32Array(slots),
      doorPos: doorRest(fb),
      doorTarget: doorRest(fb),
      winPos: new Float32Array(fb.windows.length),
      winTarget: new Float32Array(fb.windows.length),
      coverPos: new Float32Array(fb.windows.length).fill(1),
      coverTarget: new Float32Array(fb.windows.length).fill(1),
      roomGlow: [],
      labels: [],
    };
  }

  /** Builds floor i again into f's meshes, keeping its materials, uniforms and door positions. */
  private rebuildFloor(f: FloorView, i: number): void {
    const fb = this.buildFloor(i);
    f.u.uCutColor.value.setHex(this.look ? 0x2c2f34 : this.pal.wallCut);
    const swap = (mesh: Mesh, g: BufferGeometry) => {
      mesh.geometry.dispose();
      mesh.geometry = g;
    };
    if (this.look) {
      swap(f.opaque, this.look.geometry(fb.opaque));
      f.opaque.material = this.look.materials(fb.opaque, f.u);
      swap(f.glass, this.look.geometry(fb.glass));
      f.glass.material = this.look.glassMaterial(fb.glass, f.u);
    } else {
      swap(f.opaque, fb.opaque.toBufferGeometry());
      swap(f.glass, fb.glass.toBufferGeometry());
    }
    // doors and blinds keep where they are when the same ones are still there
    const sameDoors = fb.doors.length === f.fb.doors.length;
    const sameWindows = fb.windows.length === f.fb.windows.length;
    f.fb = fb;
    f.key = this.floorKey(i);
    f.u.uCutY.value = fb.floor.elevation + this.cutHeight;
    f.u.uFloorY.value = fb.floor.elevation;
    if (!sameDoors) {
      f.doorPos = doorRest(fb);
      f.doorTarget = doorRest(fb);
    }
    if (!sameWindows) {
      f.winPos = new Float32Array(fb.windows.length);
      f.winTarget = new Float32Array(fb.windows.length);
      f.coverPos = new Float32Array(fb.windows.length).fill(1);
      f.coverTarget = new Float32Array(fb.windows.length).fill(1);
    }
    this.rebuildDynamic(f);
  }

  // ------------------------------------------------------------------ dragging a piece

  /** A piece lifted out of its floor's mesh while it is dragged. */
  private lifted: { f: FloorView; mesh: Mesh; index: BufferAttribute; saved: Uint16Array | Uint32Array; geometry: BufferGeometry } | null = null;

  /**
   * Lifts a piece (furniture, or a light's lamp) out of its floor's merged mesh into a mesh of its
   * own, so dragging it moves that mesh instead of rebuilding the floor. False when it has no
   * geometry (a plain device).
   */
  liftItem(fi: number, ref: ItemRef): boolean {
    this.dropLifted();
    const f = this.floors[fi];
    const k = f ? f.fb.items.findIndex((it) => it.kind === ref.kind && it.id === ref.id) : -1;
    const src = f?.opaque.geometry;
    const index = src?.getIndex();
    if (!f || k < 0 || !src || !index) return false;
    const owner = f.fb.opaque.item;
    const idx = index.array as Uint16Array | Uint32Array;
    const saved = idx.slice();
    const remap = new Int32Array(owner.length).fill(-1);
    const verts: number[] = [];
    const tris: number[] = [];
    const groups: { start: number; count: number; materialIndex: number }[] = [];
    const ranges = src.groups.length ? src.groups : [{ start: 0, count: idx.length, materialIndex: 0 }];
    for (const r of ranges) {
      const start = tris.length;
      for (let i = r.start; i < r.start + r.count; i += 3) {
        if (owner[idx[i]] !== k) continue;
        for (let c = 0; c < 3; c++) {
          const v = idx[i + c];
          if (remap[v] < 0) {
            remap[v] = verts.length;
            verts.push(v);
          }
          tris.push(remap[v]);
        }
        // collapsed in the floor's mesh: nothing left to draw there
        idx[i + 1] = idx[i + 2] = idx[i];
      }
      if (tris.length > start) groups.push({ start, count: tris.length - start, materialIndex: r.materialIndex ?? 0 });
    }
    if (!tris.length) return false;
    index.needsUpdate = true;
    const g = new BufferGeometry();
    for (const [name, attr] of Object.entries(src.attributes)) {
      const a = attr as BufferAttribute;
      const n = a.itemSize;
      const arr = new Float32Array(verts.length * n);
      verts.forEach((v, r) => {
        for (let c = 0; c < n; c++) arr[r * n + c] = a.array[v * n + c];
      });
      g.setAttribute(name, new BufferAttribute(arr, n));
    }
    g.setIndex(tris);
    if (src.groups.length) for (const gr of groups) g.addGroup(gr.start, gr.count, gr.materialIndex);
    g.computeBoundingSphere();
    const mesh = new Mesh(g, f.opaque.material);
    f.group.add(mesh);
    this.look?.attach(mesh, f.u, true);
    this.lifted = { f, mesh, index, saved, geometry: src };
    this.sceneChanged = true;
    this.invalidate();
    return true;
  }

  /** Moves the lifted piece by (dx, dz) from where it was built. */
  moveLifted(dx: number, dz: number): void {
    if (!this.lifted) return;
    this.lifted.mesh.position.set(dx, 0, dz);
    this.sceneChanged = true;
    this.invalidate();
  }

  /** Puts the lifted piece back where it was (the drag changed nothing). */
  dropLifted(): void {
    const l = this.lifted;
    if (!l) return;
    this.lifted = null;
    if (l.f.opaque.geometry === l.geometry) {
      (l.index.array as Uint16Array | Uint32Array).set(l.saved);
      l.index.needsUpdate = true;
    }
    l.f.group.remove(l.mesh);
    this.look?.detach(l.mesh);
    l.mesh.geometry.dispose();
    this.sceneChanged = true;
    this.invalidate();
  }

  private disposeFloor(f: FloorView): void {
    this.scene.remove(f.group);
    for (const m of [f.opaque, f.glass, f.dyn, f.dynGlass]) {
      m.geometry.dispose();
      if (this.look) this.look.detach(m);
      else (m.material as Material).dispose();
    }
    this.look?.releaseFloor(f.u);
    for (const l of f.labels) l.remove();
  }

  // ------------------------------------------------------------------ views

  /** Shows the whole house, or one floor with the floors above it hidden. */
  setMode(mode: "house" | "floor", floor = this.activeFloor, fly = true): void {
    this.mode = mode;
    this.activeFloor = Math.max(0, Math.min(floor, this.floors.length - 1));
    if (mode === "house") this.selectedRoom = -1;
    this.layoutFloors();
    this.refreshLighting();
    this.refreshLabels();
    this.refreshMarkers();
    this.refreshTints();
    this.frame(fly);
  }

  setWalls(mode: WallMode): void {
    this.walls = mode;
    this.updateCutTargets(true);
    this.invalidate();
  }

  /** Keeps the wall holding this door or window at full height, whatever the cutaway does (null: none). */
  raiseOpening(floor: number, opening: string | null): void {
    const was = this.raised;
    if (opening === null ? was === null : was?.floor === floor && was.opening === opening) return;
    this.raised = opening === null ? null : { floor, opening };
    this.updateCutTargets();
    this.invalidate();
  }

  setExplode(on: boolean): void {
    this.explode = on;
    this.layoutFloors();
    this.refreshMarkers();
    this.frame(true);
  }

  selectRoom(floor: number, room: number, fly = true): void {
    if (this.mode !== "floor" || this.activeFloor !== floor) {
      this.mode = "floor";
      this.activeFloor = floor;
      this.layoutFloors();
      this.refreshLighting();
      this.refreshLabels();
      this.refreshMarkers();
    }
    this.selectedRoom = room;
    this.refreshTints();
    if (fly) {
      if (room >= 0) this.frameRoom(floor, room);
      else this.frame(true);
    }
    this.invalidate();
  }

  private layoutFloors(): void {
    let lift = 0;
    this.floors.forEach((f, i) => {
      const above = this.mode === "floor" && i > this.activeFloor;
      f.group.visible = !above;
      f.offset = this.mode === "house" && this.explode ? lift : 0;
      f.group.position.y = f.offset;
      if (this.mode === "house" && this.explode) lift += EXPLODE_GAP;
      f.u.uDim.value = this.mode === "floor" && i < this.activeFloor ? 0.45 : 1;
    });
    const groundY = (this.floors[0]?.fb.floor.elevation ?? 0) - SLAB - 0.01;
    this.ground.position.y = groundY;
    const b = this.planBounds();
    // the realistic look fades the ground into the fog far away; the model look keeps a disc
    const r = Math.max(b.maxX - b.minX, b.maxZ - b.minZ, 6) * (this.look ? 9 : 2.4);
    this.ground.scale.set(r, r, 1);
    this.ground.position.x = (b.minX + b.maxX) / 2;
    this.ground.position.z = (b.minZ + b.maxZ) / 2;
    if (this.look) {
      // the shadow covers the house as stacked now, garden included
      const visible = this.floors.filter((f) => f.group.visible);
      const top = visible.reduce((m, f) => Math.max(m, f.fb.floor.elevation + f.offset + f.fb.floor.height), 3);
      const half = Math.hypot(b.maxX - b.minX, b.maxZ - b.minZ) / 2 + 2;
      this.look.fit(new Vector3((b.minX + b.maxX) / 2, (groundY + top) / 2, (b.minZ + b.maxZ) / 2), Math.max(half, (top - groundY) / 2 + 2));
    }
    this.sceneChanged = true;
    this.updateCutTargets(true);
  }

  private planBounds(floors = this.floors) {
    const b = { minX: Infinity, minZ: Infinity, maxX: -Infinity, maxZ: -Infinity };
    for (const f of floors) {
      b.minX = Math.min(b.minX, f.fb.bounds.minX);
      b.minZ = Math.min(b.minZ, f.fb.bounds.minZ);
      b.maxX = Math.max(b.maxX, f.fb.bounds.maxX);
      b.maxZ = Math.max(b.maxZ, f.fb.bounds.maxZ);
    }
    if (!isFinite(b.minX)) return { minX: -3, minZ: -3, maxX: 3, maxZ: 3 };
    return b;
  }

  /** Frames the visible floors from the front, above. */
  frame(fly: boolean): void {
    const floors = this.mode === "house" ? this.floors : this.floors.filter((_, i) => i === this.activeFloor);
    const b = this.planBounds(floors);
    const cx = (b.minX + b.maxX) / 2;
    const cz = (b.minZ + b.maxZ) / 2;
    const top = this.mode === "house" && this.floors.length
      ? this.floors[this.floors.length - 1].fb.floor.elevation + this.floors[this.floors.length - 1].offset
      : this.floors[this.activeFloor]?.fb.floor.elevation ?? 0;
    const bottom = this.floors[this.mode === "house" ? 0 : this.activeFloor]?.fb.floor.elevation ?? 0;
    const ty = (top + bottom) / 2 + (this.mode === "house" ? 1.2 : 0.4);
    const size = Math.max(b.maxX - b.minX, b.maxZ - b.minZ, 4);
    const fov = (this.camera.fov * Math.PI) / 180;
    const aspect = Math.max(0.5, this.width / Math.max(1, this.height));
    let dist = (size * 0.62) / Math.tan(fov / 2) / Math.min(1, aspect);
    if (this.mode === "house") dist *= 1.1 + 0.08 * this.floors.length;
    const polar = this.mode === "house" ? 0.95 : 0.78;
    const az = 0.32;
    const target = new Vector3(cx, ty, cz);
    const dir = new Vector3(Math.sin(polar) * Math.sin(az), Math.cos(polar), Math.sin(polar) * Math.cos(az));
    // the box of what is shown, from the lowest floor to the top of the highest
    const top3 = this.mode === "house" && this.floors.length
      ? this.floors[this.floors.length - 1].fb.floor.elevation + this.floors[this.floors.length - 1].offset + this.floors[this.floors.length - 1].fb.floor.height
      : (this.floors[this.activeFloor]?.fb.floor.elevation ?? 0) + 1.2;
    const corners: Vector3[] = [];
    for (const x of [b.minX, b.maxX]) for (const z of [b.minZ, b.maxZ]) for (const y of [bottom, top3]) corners.push(new Vector3(x, y, z));
    dist = this.fitDistance(target, dir, corners, dist);
    this.flyTo(target.clone().addScaledVector(dir, dist), target, fly);
  }

  /** How far back the camera goes for a set of points to fill most of the view (leaving room for the controls). */
  private fitDistance(target: Vector3, dir: Vector3, pts: Vector3[], dist: number): number {
    const cam = this.camera.clone();
    const v = new Vector3();
    for (let k = 0; k < 4; k++) {
      cam.position.copy(target).addScaledVector(dir, dist);
      cam.lookAt(target);
      cam.updateMatrixWorld();
      let ex = 0, ey = 0;
      for (const p of pts) {
        v.copy(p).project(cam);
        ex = Math.max(ex, Math.abs(v.x));
        ey = Math.max(ey, Math.abs(v.y));
      }
      // the chips take the top, the tools the right: aim for ~80 % of the view
      const f = Math.max(ex / 0.8, ey / 0.78);
      if (!isFinite(f) || f <= 0) break;
      dist = Math.min(300, Math.max(3, dist * f));
    }
    return dist;
  }

  frameRoom(floor: number, room: number): void {
    const f = this.floors[floor];
    const r = f?.fb.floor.rooms[room];
    if (!r) return;
    const xs = r.points.map((p) => p[0]);
    const zs = r.points.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 2.5);
    const y = f.fb.floor.elevation + f.offset + 0.3;
    const target = new Vector3(cx, y, cz);
    // keep the current direction, come closer
    const dir = new Vector3().subVectors(this.camera.position, this.controls.target).normalize();
    const fov = (this.camera.fov * Math.PI) / 180;
    const dist = Math.max(4, (size * 0.75) / Math.tan(fov / 2));
    if (dir.y < 0.55) dir.y = 0.55;
    dir.normalize();
    this.flyTo(target.clone().addScaledVector(dir, dist), target, true);
  }

  private flyTo(pos: Vector3, target: Vector3, animate: boolean): void {
    if (!animate) {
      this.camera.position.copy(pos);
      this.controls.target.copy(target);
      this.controls.update();
      this.flight = null;
      this.updateCutTargets(true);
      this.invalidate();
      return;
    }
    this.flight = { from: [this.camera.position.clone(), this.controls.target.clone()], to: [pos, target], t: 0, dur: 0.75 };
    this.invalidate();
  }

  // ------------------------------------------------------------------ live state

  /** Everything that depends on states: lighting, doors, blinds, markers, tints, labels. */
  refreshAll(): void {
    this.refreshLighting();
    this.refreshOpenings();
    this.refreshMarkers();
    this.refreshTints();
    this.refreshLabels();
  }

  /** The inputs of the lighting pass for one floor. */
  private lightingFor(f: FloorView): LightingState {
    const live = this.live!;
    const night = this.pal.name === "night";
    return {
      ambient: this.pal.ambient,
      lamp: (l) => live.lamp(l),
      portal: (p) => (p.entity ? live.contact(p.entity) : null),
      glow: (slot) => {
        const g = f.fb.glows[slot];
        if (!g) return null;
        if (g.kind !== "window") return live.glowColor(g);
        const open = live.contact(g.entity);
        if (open !== null && open > 0.5) return lin(0xffb347);
        const lit = g.room >= 0 ? f.roomGlow[g.room] ?? 0 : 0;
        if (night && lit > 0.05) {
          const c = lin(this.pal.glassLit);
          const k = Math.min(1, 0.35 + lit * 0.5);
          return [c[0] * k, c[1] * k, c[2] * k];
        }
        return null;
      },
    };
  }

  refreshLighting(): void {
    if (!this.live) return;
    const halos: HaloSpec[] = [];
    for (const [fi, f] of this.floors.entries()) {
      const st = this.lightingFor(f);
      const lights = roomLights(f.fb, this.pal, st);
      f.roomGlow = roomGlow(lights);
      const fill = (mesh: Mesh, geo: Geo) => this.fillLight(f, mesh, geo, lights, st);
      fill(f.opaque, f.fb.opaque);
      fill(f.glass, f.fb.glass);
      fill(f.dyn, f.dynGeo);
      fill(f.dynGlass, f.dynGlassGeo);
      if (this.mode === "floor" && fi > this.activeFloor) continue;
      for (const lamp of f.fb.lamps) {
        const s = st.lamp(lamp);
        if (!s?.on || s.level <= 0) continue;
        if (this.pal.name === "day") continue; // by day a halo reads as haze, not light
        // Ultra's bloom already makes lit shades glow
        const k = 0.55 * (0.4 + 0.6 * s.level) * (this.tier === "ultra" ? 0.45 : 1);
        halos.push({
          pos: [lamp.pos[0], lamp.pos[1] + f.offset - 0.05, lamp.pos[2]],
          rgb: [s.rgb[0] * k, s.rgb[1] * k, s.rgb[2] * k],
          size: lamp.type === "lamp_downlight" ? 0.35 : lamp.type === "led_strip" ? 0.5 : 0.7,
        });
      }
    }
    this.halos.set(this.low ? halos.slice(0, 24) : halos);
    this.invalidate();
  }

  /** Writes a mesh's lighting: lit colours (model look) or lamp light and glow (realistic). */
  private fillLight(f: FloorView, mesh: Mesh, geo: Geo, lights: ReturnType<typeof roomLights>, st: LightingState): void {
    if (this.look) {
      const lamp = mesh.geometry.getAttribute("aLamp") as BufferAttribute | undefined;
      const emis = mesh.geometry.getAttribute("aEmis") as BufferAttribute | undefined;
      if (!lamp || !emis || lamp.count !== geo.vertexCount) return;
      const night = this.pal.name === "night";
      relightRealistic(geo, lamp.array as Float32Array, emis.array as Float32Array, lights, st, (slot) => {
        const kind = f.fb.glows[slot]?.kind;
        if (kind === "lamp") return night ? 1.8 : 1.0;
        if (kind === "window") return 0.9;
        return 0.8;
      });
      lamp.needsUpdate = true;
      emis.needsUpdate = true;
      return;
    }
    const attr = mesh.geometry.getAttribute("color") as BufferAttribute | undefined;
    if (!attr || attr.count !== geo.vertexCount) return;
    relight(geo, attr.array as Float32Array, lights, st, this.pal);
    attr.needsUpdate = true;
  }

  /** Doors and windows open to their contact's state, blinds move to their cover's position. */
  refreshOpenings(): void {
    if (!this.live) return;
    let moving = false;
    for (const f of this.floors) {
      f.fb.doors.forEach((d, i) => {
        const c = this.live!.contact(d.opening.entity);
        f.doorTarget[i] = c === null ? restOpen(d.opening) : c;
        if (Math.abs(f.doorTarget[i] - f.doorPos[i]) > 0.001) moving = true;
      });
      f.fb.windows.forEach((w, i) => {
        f.winTarget[i] = windowFollowsSensor(w.opening) ? this.live!.contact(w.opening.entity) ?? 0 : 0;
        if (Math.abs(f.winTarget[i] - f.winPos[i]) > 0.001) moving = true;
        const c = this.live!.cover(w.opening.cover);
        f.coverTarget[i] = c === null ? 1 : c;
        if (Math.abs(f.coverTarget[i] - f.coverPos[i]) > 0.001) moving = true;
      });
      this.rebuildDynamic(f);
    }
    if (moving) this.invalidate();
  }

  private rebuildDynamic(f: FloorView): void {
    const g = new Geo();
    const gl = new Geo();
    g.uvY0 = gl.uvY0 = f.fb.floor.elevation;
    gl.useSurface("glass");
    const pal = this.look ? DAY : this.pal;
    const y0 = f.fb.floor.elevation;
    const draw = (info: OpeningInfo, open: number, glow: number) => {
      g.currentItem = info.item;
      // cut, door leaves and sashes settle just under the wall's cut top
      const ws = info.wallSlot >= 0 ? info.wallSlot * 2 + WALL_TRIM : -1;
      buildOpeningMoving({ g, glass: gl, pal, look: joineryLook(info.opening, pal), room: info.room, ws, glow, low: this.low }, info, open);
    };
    f.fb.doors.forEach((d, i) => draw(d, f.doorPos[i], -1));
    f.fb.windows.forEach((w, i) => {
      if (windowFollowsSensor(w.opening)) draw(w, f.winPos[i], w.glow);
    });
    g.currentItem = -1;
    f.fb.windows.forEach((w, i) => {
      if (!w.opening.cover) return;
      const open = f.coverPos[i];
      const span = w.top - w.bottom;
      const yb = w.top - span * (1 - open);
      if (w.top - yb < 0.01) {
        // rolled up: a slim box at the top
      }
      const off = 0.09;
      const P = (s: number, y: number): V3 => [
        w.centre[0] + w.along[0] * s + w.normal[0] * off, y, w.centre[2] + w.along[1] * s + w.normal[1] * off,
      ];
      const half = w.width / 2 + 0.06;
      const top = y0 + w.top + 0.06;
      const bot = y0 + Math.min(w.top, yb);
      g.useSurface("blind");
      const fabric = lin((this.look ? DAY : this.pal).roles.fabric);
      const slot = w.wallSlot >= 0 ? w.wallSlot * 2 : -1;
      g.quad(P(-half, bot), P(half, bot), P(half, top), P(-half, top), [w.normal[0], 0, w.normal[1]], fabric, w.room, slot, -1, 2, 2);
      g.quad(P(half, bot), P(-half, bot), P(-half, top), P(half, top), [-w.normal[0], 0, -w.normal[1]], fabric, w.room, slot, -1, 2, 2);
    });
    f.dynGeo = g;
    f.dynGlassGeo = gl;
    const old = [f.dyn.geometry, f.dynGlass.geometry];
    if (this.look) {
      f.dyn.geometry = g.vertexCount ? this.look.geometry(g) : new BufferGeometry();
      f.dyn.material = this.look.materials(g, f.u);
      f.dynGlass.geometry = gl.vertexCount ? this.look.geometry(gl) : new BufferGeometry();
      f.dynGlass.material = gl.vertexCount ? this.look.glassMaterial(gl, f.u) : [];
    } else {
      f.dyn.geometry = g.vertexCount ? g.toBufferGeometry() : new BufferGeometry();
      f.dynGlass.geometry = gl.vertexCount ? gl.toBufferGeometry() : new BufferGeometry();
    }
    for (const o of old) o.dispose();
    if (this.live && (g.vertexCount || gl.vertexCount)) {
      const st = this.lightingFor(f);
      const lights = roomLights(f.fb, this.pal, st);
      this.fillLight(f, f.dyn, g, lights, st);
      this.fillLight(f, f.dynGlass, gl, lights, st);
    }
    this.sceneChanged = true;
  }

  refreshMarkers(): void {
    if (!this.live || !this.plan) return;
    const specs: MarkerSpec[] = [];
    this.floors.forEach((f, fi) => {
      if (this.mode === "floor" && fi !== this.activeFloor) return;
      for (const d of f.fb.floor.devices) {
        const look = this.live!.marker(d);
        if (!look) continue;
        // the whole house shows only what wants attention: through the floors above, the rest is noise
        if (this.mode === "house" && !look.attention) continue;
        const pos = this.devicePosition(fi, d);
        specs.push({ key: d.id, pos, icon: look.icon, color: look.color, size: this.mode === "house" ? 22 : 30, pulse: look.pulse, alpha: 1 });
      }
    });
    this.markers.set(specs.concat(this.overlayMarkers));
    this.refreshCones();
    this.invalidate();
  }

  /**
   * Camera view cones on the floor of the shown storey: each ray stops at the first wall it meets
   * (doorways let it through), red while the camera is live or sees motion.
   */
  private refreshCones(): void {
    const pos: number[] = [];
    const col: number[] = [];
    const f = this.mode === "floor" ? this.floors[this.activeFloor] : undefined;
    if (f && this.live && !this.editMode) {
      const walls = f.fb.layout.walls;
      for (const d of f.fb.floor.devices) {
        if (!d.entity.startsWith("camera.") || d.rotation === null || d.rotation === undefined) continue;
        const active = this.live.cameraActive?.(d) ?? false;
        const c = active ? [0.95, 0.22, 0.2] : [0.24, 0.55, 0.99];
        const fov = ((d.fov ?? 90) * Math.PI) / 180;
        const reach = d.reach ?? 7;
        const h = (d.rotation * Math.PI) / 180;
        const outside = this.roomAt(this.activeFloor, [d.x, d.z]) < 0 || this.roomAt(this.activeFloor, [d.x, d.z]) >= f.fb.floor.rooms.length;
        const y = f.fb.floor.elevation + f.offset + (outside ? -SLAB : 0) + 0.035;
        const n = 28;
        const rim: [number, number][] = [];
        for (let k = 0; k <= n; k++) {
          const a = h - fov / 2 + (fov * k) / n;
          const rx = -Math.sin(a), rz = Math.cos(a);
          let t = reach;
          for (const w of walls) {
            // ray o + t r against the wall's centre line a + u (b - a)
            const ex = w.b[0] - w.a[0], ez = w.b[1] - w.a[1];
            const den = rx * ez - rz * ex;
            if (Math.abs(den) < 1e-6) continue;
            const ox = w.a[0] - d.x, oz = w.a[1] - d.z;
            const tt = (ox * ez - oz * ex) / den;
            const u = (ox * rz - oz * rx) / den;
            if (tt < 0.35 || tt >= t || u < 0 || u > 1) continue;
            const along = u * w.length;
            if (w.openings.some((o) => o.opening.kind !== "window" && along > o.t0 && along < o.t1)) continue;
            t = tt;
          }
          rim.push([d.x + rx * t, d.z + rz * t]);
        }
        for (let k = 0; k < n; k++) {
          pos.push(d.x, y, d.z, rim[k][0], y, rim[k][1], rim[k + 1][0], y, rim[k + 1][1]);
          col.push(c[0], c[1], c[2], active ? 0.34 : 0.13, c[0], c[1], c[2], 0.02, c[0], c[1], c[2], 0.02);
        }
      }
    }
    const old = this.cones.geometry;
    const g = new BufferGeometry();
    if (pos.length) {
      g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
      g.setAttribute("color", new BufferAttribute(new Float32Array(col), 4));
    }
    this.cones.geometry = g;
    old.dispose();
  }

  /** World position of a device's marker. */
  devicePosition(fi: number, d: Device): [number, number, number] {
    const f = this.floors[fi];
    const domain = d.entity.split(".")[0];
    const usual = d.mount === "ceiling" ? f.fb.floor.height - 0.15 : d.mount === "floor" ? 0.3 : domain === "camera" ? 2.2 : domain === "binary_sensor" ? 2.0 : 1.2;
    const y = f.fb.floor.elevation + f.offset + (d.y ?? usual);
    return [d.x, y, d.z];
  }

  refreshTints(): void {
    for (const [fi, f] of this.floors.entries()) {
      f.u.uTint.value.fill(0);
      spaces(f.fb.floor).forEach((room, ri) => {
        const t = this.live?.tint(f.fb.floor, room) ?? [0, 0, 0, 0];
        let [r, g, b, a] = t;
        if (fi === this.activeFloor && ri === this.selectedRoom) {
          const acc = lin(this.pal.accent);
          const k = 0.16;
          r = r * a + acc[0] * k;
          g = g * a + acc[1] * k;
          b = b * a + acc[2] * k;
          a = Math.min(0.6, a + k);
        }
        setTint(f.u, ri, r, g, b, a);
      });
    }
    this.invalidate();
  }

  // ------------------------------------------------------------------ labels

  refreshLabels(): void {
    for (const f of this.floors) {
      for (const l of f.labels) l.remove();
      f.labels = [];
    }
    if (!this.plan) return;
    this.floors.forEach((f, fi) => {
      if (this.mode === "floor" && fi !== this.activeFloor) return;
      if (this.mode === "house") {
        const el = document.createElement("div");
        el.className = "vh-label vh-floor-label";
        el.textContent = f.fb.floor.name;
        el.dataset.floor = String(fi);
        this.overlay.appendChild(el);
        f.labels.push(el);
        return;
      }
      f.fb.rooms.forEach((r, ri) => {
        const el = document.createElement("div");
        el.className = "vh-label";
        const text = this.live?.roomText(f.fb.floor, { id: r.id });
        el.innerHTML = `<b></b>${text ? "<span></span>" : ""}`;
        (el.firstChild as HTMLElement).textContent = r.name;
        if (text) (el.lastChild as HTMLElement).textContent = text;
        el.dataset.floor = String(fi);
        el.dataset.room = String(ri);
        this.overlay.appendChild(el);
        f.labels.push(el);
      });
    });
    this.positionLabels();
  }

  /**
   * Puts the labels over their rooms. Where labels would overlap, the bigger room keeps its label
   * (the selected room always does); zooming in brings the others back.
   */
  private positionLabels(): void {
    const v = new Vector3();
    const items: { el: HTMLElement; x: number; y: number; hidden: boolean; prio: number }[] = [];
    for (const [fi, f] of this.floors.entries()) {
      f.labels.forEach((el, i) => {
        let prio = 1e9;
        if (this.mode === "house") {
          const b = f.fb.bounds;
          v.set(b.maxX + 0.4, f.fb.floor.elevation + f.offset + 0.2, (b.minZ + b.maxZ) / 2);
        } else {
          const r = f.fb.rooms[i];
          v.set(r.label[0], f.fb.floor.elevation + f.offset + 0.05, r.label[1]);
          prio = (fi === this.activeFloor && i === this.selectedRoom ? 1e6 : 0) + (r.area || 1);
        }
        v.project(this.camera);
        const hidden = v.z > 1 || (this.mode === "floor" && fi !== this.activeFloor);
        items.push({ el, x: Math.round(((v.x + 1) / 2) * this.width), y: Math.round(((1 - v.y) / 2) * this.height), hidden, prio });
      });
    }
    items.sort((a, b) => b.prio - a.prio);
    const placed: number[][] = [];
    for (const it of items) {
      let hide = it.hidden;
      if (!hide) {
        let size = this.labelSize.get(it.el);
        if (!size) {
          size = [it.el.offsetWidth, it.el.offsetHeight];
          if (size[0]) this.labelSize.set(it.el, size);
        }
        const r = [it.x - size[0] / 2 - 3, it.y - size[1] / 2 - 2, it.x + size[0] / 2 + 3, it.y + size[1] / 2 + 2];
        if (placed.some((p) => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1])) hide = true;
        else placed.push(r);
      }
      const key = hide ? "h" : `${it.x},${it.y}`;
      if (it.el.dataset.at === key) continue;
      it.el.dataset.at = key;
      if (!hide) it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, 0) translate(-50%, -50%)`;
      it.el.style.visibility = hide ? "hidden" : "visible";
    }
  }

  // ------------------------------------------------------------------ cutaway

  /** Which walls stand between the camera and the rooms: those slide down to the cut height. */
  private updateCutTargets(snap = false): void {
    const cam = this.camera.position;
    const tgt = this.controls.target;
    const vx = tgt.x - cam.x;
    const vz = tgt.z - cam.z;
    const vl = Math.hypot(vx, vz) || 1;
    const tx = -vx / vl;
    const tz = -vz / vl;
    const steep = (cam.y - tgt.y) / (cam.distanceTo(tgt) || 1);
    this.floors.forEach((f, fi) => {
      const active = this.mode === "floor" ? fi === this.activeFloor : fi === this.floors.length - 1 && this.walls !== "full";
      f.fb.layout.walls.forEach((w, i) => {
        if (i >= 128) return;
        let target = 0;
        if (this.walls === "low" && (this.mode === "floor" ? fi === this.activeFloor : true)) target = 1;
        else if (this.walls === "smart" && active && this.mode === "floor" && steep < 0.97) {
          const cur = getCut(f.u, i);
          if (w.exterior) {
            const outward = w.roomA < 0 ? w.normal : [-w.normal[0], -w.normal[1]];
            const d = outward[0] * tx + outward[1] * tz;
            target = d > (cur > 0.5 ? 0.05 : 0.25) ? 1 : 0;
          } else {
            const d = Math.abs(w.normal[0] * tx + w.normal[1] * tz);
            target = d > (cur > 0.5 ? 0.45 : 0.62) ? 1 : 0;
          }
        }
        const up = this.raised;
        if (up && up.floor === fi && w.openings.some((po) => po.opening.id === up.opening)) target = 0;
        f.cutTarget[i] = target;
        if (snap) setCut(f.u, i, target);
      });
      f.u.uCutY.value = f.fb.floor.elevation + this.cutHeight;
    });
  }

  /** Moves cut amounts, doors and blinds towards their targets; true while anything moves. */
  private animate(dt: number): boolean {
    let moving = false;
    const step = Math.min(1, dt * 4.5);
    for (const f of this.floors) {
      for (let i = 0; i < f.fb.layout.walls.length && i < 128; i++) {
        const cur = getCut(f.u, i);
        const t = f.cutTarget[i];
        if (Math.abs(t - cur) > 0.002) {
          setCut(f.u, i, cur + (t - cur) * Math.min(1, dt * 7));
          moving = true;
        } else if (cur !== t) setCut(f.u, i, t);
      }
      let dynChanged = false;
      for (const [pos, target] of [[f.doorPos, f.doorTarget], [f.winPos, f.winTarget]]) {
        for (let i = 0; i < pos.length; i++) {
          const d = target[i] - pos[i];
          if (Math.abs(d) > 0.002) {
            pos[i] += d * step;
            dynChanged = true;
          } else if (d !== 0) {
            pos[i] = target[i];
            dynChanged = true;
          }
        }
      }
      for (let i = 0; i < f.coverPos.length; i++) {
        const d = f.coverTarget[i] - f.coverPos[i];
        if (Math.abs(d) > 0.002) {
          f.coverPos[i] += d * Math.min(1, dt * 2.5);
          dynChanged = true;
        } else if (d !== 0) {
          f.coverPos[i] = f.coverTarget[i];
          dynChanged = true;
        }
      }
      if (dynChanged) {
        this.rebuildDynamic(f);
        moving = true;
      }
    }
    return moving;
  }

  // ------------------------------------------------------------------ rendering

  invalidate(): void {
    this.dirty = true;
    if (!this.raf && !this.disposed) this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.raf = 0;
    if (this.disposed) return;
    const dt = this.lastFrame ? Math.min(0.1, (now - this.lastFrame) / 1000) : 0.016;
    this.lastFrame = now;
    let again = false;

    if (this.flight) {
      const fl = this.flight;
      fl.t = Math.min(1, fl.t + dt / fl.dur);
      const e = fl.t < 0.5 ? 4 * fl.t ** 3 : 1 - (-2 * fl.t + 2) ** 3 / 2;
      this.camera.position.lerpVectors(fl.from[0], fl.to[0], e);
      this.controls.target.lerpVectors(fl.from[1], fl.to[1], e);
      if (fl.t >= 1) this.flight = null;
      again = true;
    }
    // damping keeps the camera gliding after a swipe; update() says whether it still moves
    const moved = this.controls.update(dt);
    if (moved || this.flight) this.updateCutTargets();
    if (this.animate(dt)) {
      again = true;
      this.sceneChanged = true;
    }
    if (moved) again = true;
    const pulsing = this.markers.pulsing;
    if (pulsing) this.markers.setTime(now / 1000);

    if ((this.dirty || again || pulsing) && this.visible && !document.hidden) {
      const t0 = performance.now();
      this.fitNearPlane();
      if (this.look) {
        if (this.sceneChanged) this.look.markShadows();
        this.look.render();
      } else this.renderer.render(this.scene, this.camera);
      this.sceneChanged = false;
      this.positionLabels();
      this.onFrame?.();
      this.dirty = false;
      const s = this.stats;
      s.frames++;
      s.ms = performance.now() - t0;
      if (now - s.last > 1000) {
        s.fps = (s.frames * 1000) / (now - s.last);
        s.frames = 0;
        s.last = now;
      }
    }
    this.watchSpeed(again, dt);
    // one pending frame at most: OrbitControls' change event may already have asked for it
    if (again) {
      if (!this.raf) this.raf = requestAnimationFrame(this.tick);
    } else if (pulsing) {
      // only markers pulse: a calm 15 frames per second is plenty
      window.setTimeout(() => this.invalidate(), this.low ? 90 : 50);
      if (now - this.lastPulseCheck > 5000) {
        this.lastPulseCheck = now;
        this.refreshMarkers(); // a pulse ends a minute after its change
      }
    } else {
      this.lastFrame = 0;
    }
  };

  get fps(): number {
    return this.stats.fps;
  }

  /** Tells onSlow once when two seconds of continuous movement averaged under ~22 frames per second. */
  /**
   * The near plane follows the camera's distance: depth precision depends on it, and with a fixed
   * 10 cm one, surfaces a few millimetres apart (a rug, a door's threshold) flicker from afar.
   */
  private fitNearPlane(): void {
    const near = Math.min(1, Math.max(0.1, this.camera.position.distanceTo(this.controls.target) * 0.03));
    if (Math.abs(near - this.camera.near) < 0.005) return;
    this.camera.near = near;
    this.camera.updateProjectionMatrix();
  }

  private watchSpeed(moving: boolean, dt: number): void {
    const w = this.slowWatch;
    if (w.fired || !this.onSlow) return;
    if (!moving || !this.visible || document.hidden) {
      w.frames = 0;
      w.time = 0;
      return;
    }
    w.frames++;
    w.time += dt;
    if (w.time > 2 && w.frames > 10) {
      if (w.time / w.frames > 0.045) {
        w.fired = true;
        this.onSlow();
      }
      w.frames = 0;
      w.time = 0;
    }
  }

  private resize(): void {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    // a large Retina window needs no 4+ million pixels for the model look: about 2.5 million is plenty
    const want = Math.min(window.devicePixelRatio || 1, this.low ? 1 : 2);
    const budget = this.tier === "ultra" ? 3_500_000 : this.tier === "high" ? 3_000_000 : 2_500_000;
    const cap = Math.sqrt(budget / (w * h));
    const ratio = Math.max(1, Math.min(want, cap));
    if (Math.abs(ratio - this.pixelRatio) > 0.01) {
      this.pixelRatio = ratio;
      this.renderer.setPixelRatio(ratio);
    }
    this.renderer.setSize(w, h, true);
    this.look?.setSize(w, h, this.pixelRatio);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.markers.setViewport(w, h, this.pixelRatio);
    this.invalidate();
  }

  private onVisibility = () => {
    if (!document.hidden) this.invalidate();
  };

  // ------------------------------------------------------------------ picking

  private bindPointer(): void {
    // on the container: the canvas is replaced when the tier changes
    const el = this.container;
    let down: { x: number; y: number; t: number; id: number } | null = null;
    let longTimer = 0;
    let longFired = false;
    let lastTap = 0;
    let moved = false;
    let drag: { hit: Hit; plane: Plane; moved: boolean } | null = null;
    const planePoint = (cx: number, cy: number, plane: Plane): Vector3 | null => {
      const rect = el.getBoundingClientRect();
      const ray = new Raycaster();
      ray.setFromCamera(new Vector2(((cx - rect.left) / this.width) * 2 - 1, -((cy - rect.top) / this.height) * 2 + 1), this.camera);
      return ray.ray.intersectPlane(plane, new Vector3());
    };
    el.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary) {
        down = null;
        window.clearTimeout(longTimer);
        if (drag) {
          this.onDrag?.(drag.hit, 0, 0, "end");
          drag = null;
          this.controls.enabled = true;
        }
        return;
      }
      if (this.editMode && this.onDrag) {
        const hit = this.pick(e.clientX, e.clientY);
        if (hit.item && (hit.kind === "marker" || hit.kind === "lamp" || hit.kind === "furniture")) {
          drag = { hit, plane: new Plane(new Vector3(0, 1, 0), -(hit.y ?? 0)), moved: false };
          this.controls.enabled = false;
          el.setPointerCapture(e.pointerId);
          this.onDrag(hit, 0, 0, "start");
        }
      }
      down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
      moved = false;
      longFired = false;
      window.clearTimeout(longTimer);
      longTimer = window.setTimeout(() => {
        if (!down || moved) return;
        longFired = true;
        const hit = this.pick(down.x, down.y);
        if (hit.kind !== "empty") this.onHit?.(hit, "long");
      }, 520);
    });
    el.addEventListener("pointermove", (e) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 9) {
        moved = true;
        window.clearTimeout(longTimer);
      }
      if (drag && moved) {
        const p = planePoint(e.clientX, e.clientY, drag.plane);
        if (p) {
          drag.moved = true;
          this.onDrag?.(drag.hit, p.x, p.z, "move");
        }
      }
    });
    const end = (e: PointerEvent) => {
      window.clearTimeout(longTimer);
      if (drag) {
        const d = drag;
        drag = null;
        this.controls.enabled = true;
        this.onDrag?.(d.hit, 0, 0, "end");
        if (d.moved) {
          down = null;
          return;
        }
      }
      if (!down || down.id !== e.pointerId) return;
      const d = down;
      down = null;
      if (moved || longFired || performance.now() - d.t > 600) return;
      const hit = this.pick(e.clientX, e.clientY);
      const now = performance.now();
      const double = now - lastTap < 320;
      lastTap = double ? 0 : now;
      this.onHit?.(hit, double ? "double" : "tap");
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", () => {
      down = null;
      window.clearTimeout(longTimer);
    });
  }

  /** What is under a point of the screen (client coordinates). */
  pick(clientX: number, clientY: number): Hit {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const v = new Vector3();
    // markers first: the nearest within its radius on screen
    let best: { d: number; key: string } | null = null;
    // editor handles (blue dots) win over everything drawn under or in front of them: the nearest one
    let handle: { d: number; m: MarkerSpec } | null = null;
    for (const m of this.markers.list) {
      v.set(m.pos[0], m.pos[1], m.pos[2]).project(this.camera);
      if (v.z > 1) continue;
      const sx = ((v.x + 1) / 2) * this.width;
      const sy = ((1 - v.y) / 2) * this.height;
      const d = Math.hypot(sx - x, sy - y);
      if (d < m.size * 0.75 && (!best || d < best.d)) best = { d, key: m.key };
      if (m.item && d < Math.max(m.size * 0.9, 16) && (!handle || d < handle.d)) handle = { d, m };
    }
    if (handle) return { kind: "marker", floor: this.activeFloor, room: -1, entity: null, item: handle.m.item, y: handle.m.pos[1] };
    if (best) {
      for (const [fi, f] of this.floors.entries()) {
        const dev = f.fb.floor.devices.find((dd) => dd.id === best!.key);
        if (dev) {
          const pos = this.devicePosition(fi, dev);
          return { kind: "marker", floor: fi, room: this.roomAt(fi, [dev.x, dev.z]), entity: dev.entity, device: dev, item: { kind: "device", id: dev.id }, y: pos[1] };
        }
      }
    }
    // lamps: generous targets, they are small on screen
    let lampBest: { d: number; fi: number; entity: string | null; room: number; item?: ItemRef; y: number } | null = null;
    for (const [fi, f] of this.floors.entries()) {
      if (!f.group.visible || (this.mode === "floor" && fi !== this.activeFloor)) continue;
      for (const lamp of f.fb.lamps) {
        if (!lamp.entity && !this.editMode) continue;
        v.set(lamp.pos[0], lamp.pos[1] + f.offset, lamp.pos[2]).project(this.camera);
        const sx = ((v.x + 1) / 2) * this.width;
        const sy = ((1 - v.y) / 2) * this.height;
        const d = Math.hypot(sx - x, sy - y);
        if (d < 26 && (!lampBest || d < lampBest.d)) {
          const item = lamp.id.startsWith("dev_") ? { kind: "device" as const, id: lamp.id.slice(4) } : { kind: "furniture" as const, id: lamp.id };
          lampBest = { d, fi, entity: lamp.entity, room: lamp.room, item, y: lamp.pos[1] + f.offset };
        }
      }
    }
    if (lampBest) return { kind: "lamp", floor: lampBest.fi, room: lampBest.room, entity: lampBest.entity, item: lampBest.item, y: lampBest.y };
    // then the meshes: a screen with an entity, else the room the floor belongs to
    const ray = new Raycaster();
    ray.setFromCamera(new Vector2((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1), this.camera);
    const meshes = this.floors.filter((f, fi) => f.group.visible && (this.mode === "house" || fi === this.activeFloor)).flatMap((f) => [f.opaque, f.dyn]);
    const hits = ray.intersectObjects(meshes, false);
    for (const h of hits) {
      const fi = this.floors.findIndex((f) => f.opaque === h.object || f.dyn === h.object);
      const f = this.floors[fi];
      const geo = f.dyn === h.object ? f.dynGeo : f.fb.opaque;
      const vi = h.face?.a ?? -1;
      if (vi < 0) continue;
      const itemIdx = geo.item[vi];
      const item = itemIdx >= 0 ? f.fb.items[itemIdx] : undefined;
      const slot = geo.glow[vi];
      if (slot >= 0 && !this.editMode) {
        const g = f.fb.glows[slot];
        if (g?.entity) return { kind: "entity", floor: fi, room: g.room, entity: g.entity, item };
      }
      if (item && this.editMode) {
        return { kind: "furniture", floor: fi, room: this.roomAt(fi, [h.point.x, h.point.z]), entity: null, item, y: f.fb.floor.elevation + f.offset };
      }
      const room = this.roomAt(fi, [h.point.x, h.point.z]);
      return { kind: room >= 0 ? "room" : "empty", floor: fi, room, entity: null };
    }
    return { kind: "empty", floor: this.activeFloor, room: -1, entity: null };
  }

  /** Room (or garden area, numbered after the rooms) under a plan point, or -1. */
  roomAt(fi: number, p: Vec2): number {
    const f = this.floors[fi];
    const rooms = f ? spaces(f.fb.floor) : [];
    for (let i = 0; i < rooms.length; i++) {
      const pts = rooms[i].points;
      let inside = false;
      for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
        if (pts[a][1] > p[1] !== pts[b][1] > p[1] && p[0] < ((pts[b][0] - pts[a][0]) * (p[1] - pts[a][1])) / (pts[b][1] - pts[a][1]) + pts[a][0]) inside = !inside;
      }
      if (inside) return i;
    }
    return -1;
  }

  floorBuild(i: number): FloorBuild | undefined {
    return this.floors[i]?.fb;
  }

  get floorCount(): number {
    return this.floors.length;
  }

  /** Counts for a floor's label in the house view. */
  floorSummary(i: number): { lightsOn: number; rooms: number } {
    const f = this.floors[i];
    if (!f || !this.live) return { lightsOn: 0, rooms: 0 };
    const on = new Set<string>();
    for (const l of f.fb.lamps) if (l.entity && this.live.lamp(l)?.on) on.add(l.entity);
    return { lightsOn: on.size, rooms: f.fb.rooms.length };
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.interObs.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    for (const f of this.floors) this.disposeFloor(f);
    this.look?.dispose();
    this.markers.dispose();
    this.halos.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

