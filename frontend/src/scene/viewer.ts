// The 3D view. Draws only when something changed (zero GPU work while idle), merges each floor
// into a couple of meshes, and lights them on the CPU.
import {
  Box3, Color, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, Raycaster, Scene, ShapeUtils, Vector2, Vector3, WebGLRenderer,
  CircleGeometry, BufferGeometry, BufferAttribute, DoubleSide, LineSegments, LineBasicMaterial, AdditiveBlending, NormalBlending,
  type Material,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { showsValue, spaces, type Device, type Floor, type Plan, type Vec2 } from "../model/plan";
import { pointInPolygon } from "../model/geom";
import { buildFloor, buildRoofs, clipToRect, lin, outdoorAt, SLAB, stairwells, type FloorBuild, type GlowSlot, type ItemRef, type LampInfo } from "./build";
import { faceInfos, type RoofFaceInfo } from "./roof-info";
import { fromRoofFrame, planeHeight } from "./roofs";
import { Geo, type V3 } from "./geo";
import { relight, relightRealistic, roomGlow, roomLights, type LampState, type LightingState } from "./lighting";
import { buildOpeningMoving, joineryLook, restOpen, windowFollowsSensor, type OpeningInfo } from "./joinery";
import { headingDir, type CameraRig } from "./cameras";
import type { WallSegment } from "../model/walls";
import { Halos, ICONS, Markers, type HaloSpec, type MarkerSpec } from "./markers";
import { floorUniforms, getCut, glassMaterial, opaqueMaterial, setCut, setTint, WALL_TRIM, type FloorUniforms } from "./materials";
import { DAY, NIGHT, paletteFor, type Palette } from "./palette";
import { afterglow, duskColours } from "./dusk";
import type { RealisticLook } from "./realistic";
import type { Tier, TierSetting } from "./tier";
import { quietSky, type Sky } from "../live/sky";
import { initials, type Person, type Reading, type RoomPart } from "../live/live";

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
  /** Short text under the room name, e.g. "20.5° → 21° · 48 %", in pieces (a piece with an entity opens it). */
  roomLine(floor: Floor, room: { id: string }): RoomPart[];
  /** A camera's state: its view turns red while it is live or sees motion, grey while offline. */
  cameraState?(d: Device): "idle" | "active" | "offline";
  /** Who is in a room now: their faces go on its label (in the house view, over the room). */
  roomPeople?(floor: Floor, room: { id: string }): Person[];
  /** A device shown by its value: what its label says. */
  reading?(d: Device): Reading | null;
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
  /** The slope under something on a roof: dragging follows it (else a level plane at y). */
  plane?: { normal: V3; point: V3 };
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
  /**
   * Realistic look, shadows only: the storey's ceiling (the sun lights its rooms through their
   * windows, not over cut walls), and the storey as a shell for when it is hidden above the one shown
   * (its shadow still falls on the garden).
   */
  shade: Mesh | null;
  ghost: Mesh | null;
  /** The storey's roofs and their glass (null without roofs), and what they were built from. */
  roof: Mesh | null;
  roofGlass: Mesh | null;
  roofKey: string;
  /** An extension's colours over the roofs (the solar map), or null. */
  paint: Mesh | null;
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

/** A storey without what only its labels and readings show: changing those builds nothing. */
function unlabelled<F extends Pick<Floor, "rooms" | "devices" | "outdoor">>(f: F): F {
  return {
    ...f,
    rooms: f.rooms.map(({ label: _label, ...r }) => r),
    outdoor: f.outdoor?.map(({ label: _label, ...o }) => o),
    devices: f.devices.map(({ show: _show, ...d }) => d),
  };
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
  /** Roofs shown over the house (the view's roof button). */
  roofOn = true;
  /** An extension's say over the roofs (the solar map shows them), else null. */
  private roofForced: boolean | null = null;
  /** The editor has a roof or something on one selected: roofs show. */
  private roofEditing = false;
  cutHeight = 1.15;
  /** Called after each drawn frame (overlays follow the camera). */
  onFrame: (() => void) | null = null;
  onHit: ((hit: Hit, gesture: "tap" | "long" | "double") => void) | null = null;
  private _editMode = false;
  /** Edit mode: things can be dragged, and readings show as pins to drag; plan coordinates of the finger while dragging. */
  get editMode(): boolean {
    return this._editMode;
  }
  set editMode(on: boolean) {
    if (this._editMode === on) return;
    this._editMode = on;
    this.refreshMarkers();
    this.refreshLabels();
  }
  onDrag: ((hit: Hit, x: number, z: number, phase: DragPhase) => void) | null = null;
  /** Edit mode: whether pressing on this thing grabs it; otherwise the press turns the view. */
  canDrag: ((hit: Hit) => boolean) | null = null;
  /** Extra markers drawn on top (the editor's selection). */
  overlayMarkers: MarkerSpec[] = [];
  /** Called once when moving the view stays slow (under ~22 frames per second). */
  onSlow: (() => void) | null = null;
  /**
   * Called when drawing goes wrong; `fatal` when the house can't be drawn any more (frames failed
   * again and again, or the graphics could not be got back), and the viewer has stopped.
   */
  onError: ((err: unknown, fatal: boolean, where: string) => void) | null = null;

  private floors: FloorView[] = [];
  /** The door or window whose wall stays up (the editor's selection). */
  private raised: { floor: number; opening: string } | null = null;
  private markers: Markers;
  private halos: Halos;
  private ground: Mesh;
  /** What the cameras see: a glow on the floor and a faint beam from the lens, and their outlines. */
  private cones: Mesh;
  private coneLines: LineSegments;
  /** A camera being dragged in the editor: its view follows the model. */
  private liftedCamera: { id: string; dx: number; dz: number } | null = null;
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
  /** The storeys hidden above the one shown, as shadow casters (realistic look). */
  private ghosts = new Group();
  /** Something moved in the scene (not just the camera): shadows need redrawing. */
  private sceneChanged = true;
  private sky: Sky | null = null;
  /** The look follows the sky's time of day. */
  private followSun = false;
  /** How much the lamps glow like at night, 0..1 (the realistic look fades it in at dusk). */
  private glowDark = 1;
  private lampsOn = false;
  /** The last picture, fading out over a new look. */
  private fade: HTMLCanvasElement | null = null;
  /** The weather wants frames (rain, snow, wind, lightning): when the next one is due. */
  private fxTimer = 0;
  private slowWatch = { frames: 0, time: 0, fired: false };
  /** Frames that failed in a row, and whether drawing stopped for good. */
  private fails = 0;
  private halted = false;
  /** While the graphics context is lost: the timer for a new canvas, if the browser doesn't give it back. */
  private lostTimer = 0;
  private renewals = 0;
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
    this.cones = new Mesh(new BufferGeometry(), new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: DoubleSide, forceSinglePass: true }));
    this.cones.renderOrder = 3;
    this.coneLines = new LineSegments(new BufferGeometry(), new LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false }));
    this.coneLines.renderOrder = 3;
    this.scene.add(this.ground, this.cones, this.coneLines, this.halos.mesh, this.markers.mesh, this.ghosts);
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
    r.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      if (r !== this.renderer || this.disposed || this.halted) return;
      this.onError?.(new Error("The browser dropped the WebGL context"), false, "graphics");
      // the browser usually gives it back (restored, below); if it doesn't, a new canvas gets a new one
      window.clearTimeout(this.lostTimer);
      this.lostTimer = window.setTimeout(() => this.recover(true), 3000);
    });
    r.domElement.addEventListener("webglcontextrestored", () => r === this.renderer && this.recover(false));
    this.container.appendChild(r.domElement);
    return r;
  }

  private setupLook(): void {
    const wantsLook = (this.tier === "high" || this.tier === "ultra") && this.realistic;
    this.look = wantsLook ? new this.realistic!.RealisticLook(this.renderer, this.scene, this.camera, this.tier === "ultra") : null;
    if (this.look) {
      this.ground.material = this.look.groundMaterial;
      this.look.attachGround(this.ground);
      if (this.sky) this.look.setSky(this.sky, this.plan?.settings.north ?? 0);
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
    this.remake(tier, !sameRenderer);
  }

  /** Everything made again from the plan: the look, the floors, and a new renderer (a new canvas) when asked. */
  private remake(tier: Tier, newRenderer: boolean): void {
    for (const f of this.floors) this.disposeFloor(f);
    this.floors = [];
    this.look?.dispose();
    this.look = null;
    this.tier = tier;
    this.slowWatch = { frames: 0, time: 0, fired: false };
    if (newRenderer) {
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

  /**
   * After the context was lost: the house is made again, on the same canvas when the browser gave the
   * context back, else on a new one (a few times at most).
   */
  private recover(newCanvas: boolean): void {
    window.clearTimeout(this.lostTimer);
    this.lostTimer = 0;
    if (this.disposed || this.halted) return;
    try {
      if (newCanvas && ++this.renewals > 3) throw new Error("The WebGL context was lost again and again");
      this.remake(this.tier, newCanvas);
    } catch (err) {
      this.halt();
      this.onError?.(err, true, "graphics");
    }
  }

  /** Stops drawing for good (the view shows why instead). */
  halt(): void {
    this.halted = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.clearTimeout(this.lostTimer);
  }

  /** Where the sun is (degrees), for the realistic look's daylight and shadows (the sky's weather stays). */
  setSun(azimuth: number | null, elevation: number | null): void {
    this.setSky({ ...(this.sky ?? quietSky()), sun: azimuth === null || elevation === null ? null : { azimuth, elevation } });
  }

  /** The sky over the house: the sun's and the moon's light and the weather (the realistic look); the sky's colour (the model look). */
  setSky(sky: Sky): void {
    this.sky = sky;
    if (this.look) {
      this.look.setSky(sky, this.plan?.settings.north ?? 0);
      this.followGlow();
    } else this.applyPalette();
    this.invalidate();
  }

  get currentSky(): Sky | null {
    return this.sky;
  }

  // ------------------------------------------------------------------ plan and looks

  /**
   * Shows a plan. Floors whose plan did not change are kept as they are, and a changed floor is
   * rebuilt into its old meshes and materials, so editing one piece costs one floor's build and
   * no shader or texture work.
   */
  setPlan(plan: Plan, keepView = false, reuse = true): void {
    this.dropLifted();
    const turned = (this.plan?.settings.north ?? 0) !== plan.settings.north;
    this.plan = plan;
    // turning the plan to north moves the sun, nothing else
    if (turned && this.look && this.sky) this.look.setSky(this.sky, plan.settings.north);
    if (!reuse) {
      for (const f of this.floors) this.disposeFloor(f);
      this.floors = [];
    }
    while (this.floors.length > plan.floors.length) this.disposeFloor(this.floors.pop()!);
    plan.floors.forEach((floor, i) => {
      const f = this.floors[i];
      if (!f) this.floors.push(this.makeFloor(i));
      else if (f.key !== this.floorKey(i)) this.rebuildFloor(f, i);
      else {
        // same content, maybe a new object (undo): later edits and live state read this one
        f.fb.floor = floor;
        if (f.roofKey !== this.roofKey(i)) this.rebuildRoofs(f, i);
      }
    });
    this.activeFloor = Math.min(this.activeFloor, Math.max(0, this.floors.length - 1));
    this.layoutFloors();
    this.refreshAll();
    if (!keepView) this.frame(false);
    this.invalidate();
  }

  /**
   * Day or night; with `follow` the look goes with the sky's time of day. The realistic look then
   * lights dusk and dawn on its own and a new palette only relights; the model look bakes its
   * colours into the house, so a new palette rebuilds it. Either way the picture crossfades.
   */
  setTheme(name: "day" | "night", follow = false): void {
    const changed = this.pal.name !== name;
    if (!changed && this.followSun === follow) return;
    if (changed) this.crossfade();
    this.followSun = follow;
    this.pal = paletteFor(name);
    this.applyPalette();
    if (!changed) return;
    if (this.plan && !this.look) this.setPlan(this.plan, true, false);
    else this.refreshAll();
  }

  /** The realistic look's lamp glows fade in with the dark (relit in quarter steps, only while lamps are on). */
  private followGlow(): void {
    const g = this.look ? Math.round(this.look.darkness * 4) / 4 : this.pal.name === "night" ? 1 : 0;
    if (g === this.glowDark) return;
    this.glowDark = g;
    if (this.lampsOn) this.refreshLighting();
  }

  /**
   * Fades from the picture shown now to the next one (a new look), in under a second: one copy of the
   * canvas, then nothing but the browser's own opacity transition.
   */
  private crossfade(): void {
    const src = this.renderer.domElement;
    if (!this.plan || !this.visible || document.hidden || this.disposed || !src.width || !src.height || reducedMotion()) return;
    // the canvas can only be copied right after a frame is drawn: draw one now
    this.fitNearPlane();
    if (this.look) this.look.render();
    else this.renderer.render(this.scene, this.camera);
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(src, 0, 0);
    c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;transition:opacity 0.8s ease-in-out";
    this.fade?.remove();
    this.fade = c;
    src.after(c);
    requestAnimationFrame(() => requestAnimationFrame(() => (c.style.opacity = "0")));
    window.setTimeout(() => {
      c.remove();
      if (this.fade === c) this.fade = null;
    }, 1000);
  }

  setLive(live: LiveSource): void {
    this.live = live;
    this.refreshAll();
  }

  private applyPalette(): void {
    this.basicGround.color.setHex(this.pal.ground);
    if (this.look) {
      this.look.setNight(this.pal.name === "night", this.followSun);
      this.followGlow();
    } else {
      // the model look shows dusk and the weather in its sky only: rose and blue around sunset, greyer
      // under cloud, darker in a storm, white ground under snow
      const sky = this.sky;
      const bg = new Color(this.pal.background);
      const el = sky?.sun?.elevation;
      if (this.followSun && typeof el === "number" && afterglow(el) > 0) bg.lerp(new Color(duskColours(el).sky[1]), 0.5 * afterglow(el));
      this.glowDark = this.pal.name === "night" ? 1 : 0;
      if (sky && sky.source !== "none") {
        const night = this.pal.name === "night";
        bg.lerp(new Color(night ? 0x1a1f29 : 0xd3d8dd), sky.cloud * 0.7);
        bg.lerp(new Color(night ? 0x0b0e14 : 0x9aa1a8), Math.max(sky.rain * 0.45, sky.storm ? 0.5 : 0));
        if (sky.snowCover > 0) this.basicGround.color.lerp(new Color(night ? 0x5f6878 : 0xf3f5f8), sky.snowCover * 0.85);
      }
      this.scene.background = bg;
      this.scene.fog = null;
    }
  }

  /** Everything a floor's build depends on. */
  private floorKey(i: number): string {
    const plan = this.plan!;
    // stairs on the storey below cut the stairwell in this one's floor; north and the weather only move
    // the light, and the floor plan image is only in the 2D editor
    const { north: _north, sky: _sky, ...settings } = plan.settings;
    const { background: _background, roofs: _roofs, ...floor } = plan.floors[i];
    // the realistic look builds in day colours and lights the time of day
    return JSON.stringify([settings, unlabelled(floor), stairwells(plan, i), i === 0, i < plan.floors.length - 1, this.look ? "" : this.pal.name, !!this.look, this.low]);
  }

  /** Everything a storey's roofs depend on: they are rebuilt on their own (dragging a panel along one is cheap). */
  private roofKey(i: number): string {
    const plan = this.plan!;
    const f = plan.floors[i];
    const s = plan.settings;
    return JSON.stringify([f.roofs ?? [], f.elevation, f.height, f.exterior_finish, f.exterior_color, unlabelled(f).rooms,
      s.exterior_finish, s.exterior_color, s.wall_exterior, plan.floors.slice(i + 1).map((x) => unlabelled(x).rooms), this.look ? "" : this.pal.name, !!this.look, this.low]);
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
    u.uIndoor.value = fb.floor.rooms.length;
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
    const [shade, ghost] = this.makeShadowShells(fb, group);
    const [roof, roofGlass] = this.makeRoofMeshes(fb, group, u);
    return {
      fb, key, group, opaque, glass, dyn, dynGeo, dynGlass, dynGlassGeo, u, offset: 0, shade, ghost, roof, roofGlass, roofKey: this.roofKey(i), paint: null,
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
    this.disposeRoofMeshes(f);
    [f.roof, f.roofGlass] = this.makeRoofMeshes(fb, f.group, f.u);
    f.roofKey = this.roofKey(i);
    this.paintFloor(f);
    f.u.uCutY.value = fb.floor.elevation + this.cutHeight;
    f.u.uFloorY.value = fb.floor.elevation;
    f.u.uIndoor.value = fb.floor.rooms.length;
    this.disposeShells(f);
    [f.shade, f.ghost] = this.makeShadowShells(fb, f.group);
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

  /** A storey's roof meshes: in its group, moving with it; null without roofs. */
  private makeRoofMeshes(fb: FloorBuild, group: Group, u: FloorUniforms): [Mesh | null, Mesh | null] {
    if (!fb.roof.vertexCount && !fb.roofGlass.vertexCount) return [null, null];
    let roof: Mesh, glass: Mesh;
    if (this.look) {
      roof = new Mesh(this.look.geometry(fb.roof), this.look.materials(fb.roof, u));
      glass = new Mesh(this.look.geometry(fb.roofGlass), this.look.glassMaterial(fb.roofGlass, u));
      this.look.attach(roof, u, true);
    } else {
      roof = new Mesh(fb.roof.toBufferGeometry(), opaqueMaterial(u));
      glass = new Mesh(fb.roofGlass.toBufferGeometry(), glassMaterial(u));
    }
    glass.renderOrder = 2;
    group.add(roof, glass);
    return [roof, glass];
  }

  private roofPaint: { fn: (face: RoofFaceInfo, p: V3) => V3 | null; spacing: number } | null = null;

  /**
   * Colours the roofs' faces (an extension's map: how sunny each part is). `fn` gives a point's
   * colour (linear RGB 0..1) or null to leave it bare; null takes the colours off.
   */
  setRoofPaint(fn: ((face: RoofFaceInfo, p: V3) => V3 | null) | null, spacing = 0.35): void {
    this.roofPaint = fn ? { fn, spacing: Math.max(0.15, spacing) } : null;
    for (const f of this.floors) this.paintFloor(f);
    this.updateRoofs();
  }

  private paintFloor(f: FloorView): void {
    if (f.paint) {
      f.paint.removeFromParent();
      f.paint.geometry.dispose();
      (f.paint.material as Material).dispose();
      f.paint = null;
    }
    const paint = this.roofPaint;
    if (!paint || !f.fb.roofs.length || !this.plan) return;
    const pos: number[] = [], col: number[] = [];
    const north = this.plan.settings.north ?? 0;
    for (const m of f.fb.roofs) {
      const infos = faceInfos(m, f.fb.index, north);
      m.faces.forEach((face, k) => {
        const info = infos[k];
        if (!info) return;
        const n = info.normal;
        const at = (u: number, v: number): V3 => {
          const [x, z] = fromRoofFrame(m, u, v);
          const y = m.base + planeHeight(face.plane, u, v);
          return [x + n[0] * 0.03, y + n[1] * 0.03, z + n[2] * 0.03];
        };
        const us = face.poly.map((p) => p[0]), vs = face.poly.map((p) => p[1]);
        const g = paint.spacing;
        for (let gu = Math.floor(Math.min(...us) / g) * g; gu < Math.max(...us); gu += g) {
          for (let gv = Math.floor(Math.min(...vs) / g) * g; gv < Math.max(...vs); gv += g) {
            const cell = clipToRect(face.poly, gu, gv, gu + g, gv + g);
            if (cell.length < 3) continue;
            const pts = cell.map(([u, v]) => at(u, v));
            const cs = pts.map((p) => paint.fn(info, p));
            if (cs.some((c) => !c)) continue;
            for (let i = 1; i + 1 < pts.length; i++) {
              for (const j of [0, i, i + 1]) {
                pos.push(...pts[j]);
                col.push(...cs[j]!);
              }
            }
          }
        }
      });
    }
    if (!pos.length) return;
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    geo.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
    geo.computeBoundingSphere();
    const mat = new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.86, depthWrite: false, side: DoubleSide, forceSinglePass: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    f.paint = new Mesh(geo, mat);
    f.paint.renderOrder = 1;
    f.group.add(f.paint);
  }

  private disposeRoofMeshes(f: FloorView): void {
    for (const m of [f.roof, f.roofGlass]) {
      if (!m) continue;
      m.removeFromParent();
      m.geometry.dispose();
      if (this.look) this.look.detach(m);
      else (m.material as Material).dispose();
    }
    f.roof = f.roofGlass = null;
  }

  /** Builds a storey's roofs again, leaving the rest of it as it is. */
  private rebuildRoofs(f: FloorView, i: number): void {
    buildRoofs(this.plan!, f.fb, this.look ? DAY : this.pal, { low: this.low });
    this.disposeRoofMeshes(f);
    [f.roof, f.roofGlass] = this.makeRoofMeshes(f.fb, f.group, f.u);
    f.roofKey = this.roofKey(i);
    this.paintFloor(f);
    this.disposeShells(f);
    [f.shade, f.ghost] = this.makeShadowShells(f.fb, f.group);
    this.updateRoofs();
    this.sceneChanged = true;
    this.refreshLighting();
  }

  /**
   * Roofs show over the house when the roof button is on: over every storey in the whole-house view
   * (not with low walls), and over the storeys below the one shown, never over the one looked into.
   */
  private roofShown(fi: number): boolean {
    if (!this.roofWanted) return false;
    return this.mode === "house" ? this.walls !== "low" : fi < this.activeFloor;
  }

  private get roofWanted(): boolean {
    return this.roofEditing || (this.roofForced ?? this.roofOn);
  }

  /**
   * The whole house with its storeys pulled apart (to see into them), unless roofs are on: then the
   * storeys sit together as the house does outside.
   */
  private get apart(): boolean {
    return this.mode === "house" && this.explode && !this.closed;
  }

  /** The whole house shut under its roofs, its walls up: from outside, as it stands. */
  private get closed(): boolean {
    return this.mode === "house" && this.roofWanted && this.walls !== "low" && this.hasRoofs;
  }

  /**
   * Whether a point (world) of a storey is inside the shut house: in one of its rooms with a storey
   * or a roof over it. What is in there can't be seen, so it takes no taps; doors and windows do.
   */
  private shutIn(fi: number, p: V3): boolean {
    if (!this.closed) return false;
    const xz: Vec2 = [p[0], p[2]];
    const inRoom = (k: number) => this.floors[k].fb.floor.rooms.some((r) => pointInPolygon(xz, r.points));
    if (!this.floors[fi] || !inRoom(fi)) return false;
    for (let k = fi + 1; k < this.floors.length; k++) if (inRoom(k)) return true;
    // looking down onto it (a roof's faces face out): anything of a roof above it
    const roofs = this.floors.flatMap((f) => (f.roof?.visible ? [f.roof] : []));
    return new Raycaster(new Vector3(p[0], p[1] + 1000, p[2]), new Vector3(0, -1, 0), 0, 1000).intersectObjects(roofs, false).length > 0;
  }

  private updateRoofs(): void {
    this.floors.forEach((f, fi) => {
      const shown = this.roofShown(fi);
      if (f.roof) f.roof.visible = shown;
      if (f.roofGlass) f.roofGlass.visible = shown;
      if (f.paint) f.paint.visible = shown;
    });
    this.sceneChanged = true;
    this.invalidate();
  }

  /** The roof button. */
  setRoof(on: boolean): void {
    this.roofOn = on;
    this.layoutFloors();
    this.refreshMarkers();
  }

  /** An extension shows the roofs whatever the button says, or hides them (null hands them back). */
  forceRoof(on: boolean | null): void {
    if (this.roofForced === on) return;
    this.roofForced = on;
    this.layoutFloors();
    this.refreshMarkers();
  }

  /** The editor shows the roofs while one of them, or something on one, is selected. */
  editRoof(on: boolean): void {
    if (this.roofEditing === on) return;
    this.roofEditing = on;
    this.layoutFloors();
    this.refreshMarkers();
  }

  /** Whether any storey has a roof. */
  get hasRoofs(): boolean {
    return this.floors.some((f) => f.fb.roofs.length > 0);
  }

  /**
   * The realistic look's shadow-only shells of a storey: its ceiling, in its group (light gets into
   * its rooms through the windows), and the whole storey (outside walls and roof) for when it is
   * hidden above the one shown.
   */
  private makeShadowShells(fb: FloorBuild, group: Group): [Mesh | null, Mesh | null] {
    if (!this.look) return [null, null];
    const top = fb.floor.elevation + fb.floor.height - 0.02;
    const pos: number[] = [];
    for (const r of fb.floor.rooms) {
      if (r.points.length < 3) continue;
      const tris = ShapeUtils.triangulateShape(r.points.map(([x, z]) => new Vector2(x, z)), []);
      for (const t of tris) for (const k of t) pos.push(r.points[k][0], top, r.points[k][1]);
    }
    if (!pos.length) return [null, null];
    const mesh = (p: number[]) => {
      const g = new BufferGeometry();
      g.setAttribute("position", new BufferAttribute(new Float32Array(p), 3));
      g.computeVertexNormals();
      const m = new Mesh(g, this.look!.castOnly);
      m.castShadow = true;
      return m;
    };
    const shade = mesh(pos);
    group.add(shade);
    const shell = pos.slice();
    const y0 = fb.floor.elevation;
    for (const w of fb.layout.walls) {
      if (!w.exterior) continue;
      const [a, b] = [w.a, w.b];
      shell.push(a[0], y0, a[1], b[0], y0, b[1], b[0], top, b[1], a[0], y0, a[1], b[0], top, b[1], a[0], top, a[1]);
    }
    // and its roofs, whose shadow falls on the garden too
    const rp = fb.roof.pos;
    for (const k of fb.roof.idx) shell.push(rp[k * 3], rp[k * 3 + 1], rp[k * 3 + 2]);
    const ghost = mesh(shell);
    ghost.visible = false;
    this.ghosts.add(ghost);
    return [shade, ghost];
  }

  private disposeShells(f: FloorView): void {
    if (f.shade) {
      f.shade.removeFromParent();
      f.shade.geometry.dispose();
    }
    if (f.ghost) {
      f.ghost.removeFromParent();
      f.ghost.geometry.dispose();
    }
    f.shade = f.ghost = null;
  }

  // ------------------------------------------------------------------ dragging a piece

  /** A piece lifted out of its floor's meshes (the opaque one and the glass) while it is dragged. */
  private lifted: { f: FloorView; parts: LiftedPart[] } | null = null;

  /**
   * Lifts a piece (furniture, or a light's lamp) out of its floor's merged meshes into meshes of its
   * own, so dragging it moves those instead of rebuilding the floor. Its glass comes along too (a
   * greenhouse, a glass table). False when it has no geometry (a plain device).
   */
  liftItem(fi: number, ref: ItemRef): boolean {
    this.dropLifted();
    const f = this.floors[fi];
    const k = f ? f.fb.items.findIndex((it) => it.kind === ref.kind && it.id === ref.id) : -1;
    if (!f || k < 0) return false;
    const parts = [liftPart(f.opaque, f.fb.opaque.item, k), liftPart(f.glass, f.fb.glass.item, k)].filter((p): p is LiftedPart => !!p);
    if (!parts.length) return false;
    for (const p of parts) f.group.add(p.mesh);
    if (parts[0].from === f.opaque) this.look?.attach(parts[0].mesh, f.u, true);
    this.lifted = { f, parts };
    if (ref.kind === "device" && f.fb.cameras.some((c) => c.id === ref.id)) this.liftedCamera = { id: ref.id, dx: 0, dz: 0 };
    this.sceneChanged = true;
    this.invalidate();
    return true;
  }

  /** Moves the lifted piece by (dx, dz) from where it was built. */
  moveLifted(dx: number, dz: number): void {
    if (!this.lifted) return;
    for (const p of this.lifted.parts) p.mesh.position.set(dx, 0, dz);
    if (this.liftedCamera) {
      this.liftedCamera.dx = dx;
      this.liftedCamera.dz = dz;
      this.refreshCones();
    }
    this.sceneChanged = true;
    this.invalidate();
  }

  /** Puts the lifted piece back where it was (the drag changed nothing). */
  dropLifted(): void {
    const l = this.lifted;
    if (!l) return;
    this.lifted = null;
    if (this.liftedCamera) {
      this.liftedCamera = null;
      this.refreshCones();
    }
    for (const p of l.parts) {
      if (p.from.geometry === p.geometry) {
        (p.index.array as Uint16Array | Uint32Array).set(p.saved);
        p.index.needsUpdate = true;
      }
      l.f.group.remove(p.mesh);
      this.look?.detach(p.mesh);
      p.mesh.geometry.dispose();
    }
    this.sceneChanged = true;
    this.invalidate();
  }

  private disposeFloor(f: FloorView): void {
    this.scene.remove(f.group);
    this.disposeShells(f);
    this.disposeRoofMeshes(f);
    if (f.paint) {
      f.paint.geometry.dispose();
      (f.paint.material as Material).dispose();
      f.paint = null;
    }
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
    // low walls take the roofs off, and the storeys apart
    this.layoutFloors();
    this.refreshMarkers();
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
      f.offset = this.apart ? lift : 0;
      f.group.position.y = f.offset;
      if (this.apart) lift += EXPLODE_GAP;
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
      // the shadow covers what casts it: the house as stacked now (storeys hidden above the one shown
      // still stand there for the sun), its garden, fences and garden furniture
      let top = groundY + 3;
      const box = new Box3();
      for (const f of this.floors) {
        const shown = f.group.visible;
        if (f.ghost) f.ghost.visible = !shown;
        top = Math.max(top, f.fb.floor.elevation + (shown ? f.offset : 0) + f.fb.floor.height);
        const pts = [...f.fb.floor.rooms.flatMap((r) => r.points), ...(f.fb.floor.outdoor ?? []).flatMap((o) => o.points), ...(f.fb.floor.fences ?? []).flatMap((x) => x.points)];
        for (const p of pts) box.expandByPoint(new Vector3(p[0], groundY, p[1]));
      }
      if (box.isEmpty()) box.set(new Vector3(b.minX, groundY, b.minZ), new Vector3(b.maxX, groundY, b.maxZ));
      box.expandByScalar(1);
      box.min.y = groundY;
      box.max.y = top + 0.5;
      this.look.fit(box, groundY);
      // where rain may fall: around the house, never in a room of any storey
      this.look.setWeatherArea({
        rooms: this.floors.flatMap((f) => f.fb.floor.rooms.map((r) => r.points)),
        minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z, ground: groundY, top: top + 5,
      });
    }
    this.sceneChanged = true;
    this.updateCutTargets(true);
    this.updateRoofs();
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
    let top3 = this.mode === "house" && this.floors.length
      ? this.floors[this.floors.length - 1].fb.floor.elevation + this.floors[this.floors.length - 1].offset + this.floors[this.floors.length - 1].fb.floor.height
      : (this.floors[this.activeFloor]?.fb.floor.elevation ?? 0) + 1.2;
    // roofs (and chimneys) shown above the walls
    this.floors.forEach((f, fi) => {
      if (!f.roof?.visible) return;
      const box = f.roof.geometry.boundingBox ?? (f.roof.geometry.computeBoundingBox(), f.roof.geometry.boundingBox);
      if (box && (this.mode === "house" || fi <= this.activeFloor)) top3 = Math.max(top3, box.max.y + f.offset);
    });
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
    // rooms count as everywhere else: the floor's rooms, then its garden areas
    const r = f ? spaces(f.fb.floor)[room] : undefined;
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
    const dark = this.glowDark;
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
        if (dark > 0 && lit > 0.05) {
          const c = lin(this.pal.glassLit);
          const k = Math.min(1, 0.35 + lit * 0.5) * dark;
          return [c[0] * k, c[1] * k, c[2] * k];
        }
        return null;
      },
    };
  }

  refreshLighting(): void {
    if (!this.live) return;
    const halos: HaloSpec[] = [];
    let on = 0;
    for (const [fi, f] of this.floors.entries()) {
      const st = this.lightingFor(f);
      const lights = roomLights(f.fb, this.lampPalette, st);
      on += lights.reduce((n, r) => n + r.length, 0);
      f.roomGlow = roomGlow(lights);
      const fill = (mesh: Mesh, geo: Geo) => this.fillLight(f, mesh, geo, lights, st);
      fill(f.opaque, f.fb.opaque);
      fill(f.glass, f.fb.glass);
      fill(f.dyn, f.dynGeo);
      fill(f.dynGlass, f.dynGlassGeo);
      if (f.roof) fill(f.roof, f.fb.roof);
      if (f.roofGlass) fill(f.roofGlass, f.fb.roofGlass);
      if (this.mode === "floor" && fi > this.activeFloor) continue;
      for (const lamp of f.fb.lamps) {
        const s = st.lamp(lamp);
        if (!s?.on || s.level <= 0) continue;
        if (this.glowDark <= 0) continue; // by day a halo reads as haze, not light
        // Ultra's bloom already makes lit shades glow
        const k = 0.55 * (0.4 + 0.6 * s.level) * (this.tier === "ultra" ? 0.45 : 1) * this.glowDark;
        halos.push({
          pos: [lamp.pos[0], lamp.pos[1] + f.offset - 0.05, lamp.pos[2]],
          rgb: [s.rgb[0] * k, s.rgb[1] * k, s.rgb[2] * k],
          size: lamp.type === "lamp_downlight" ? 0.35 : lamp.type === "led_strip" ? 0.5 : 0.7,
        });
      }
    }
    this.lampsOn = on > 0;
    this.halos.set(this.low ? halos.slice(0, 24) : halos);
    this.invalidate();
  }

  /** The lamps' strength: the realistic look takes them at full and scales them with the dark in its shader. */
  private get lampPalette(): Palette {
    return this.look ? NIGHT : this.pal;
  }

  /** Writes a mesh's lighting: lit colours (model look) or lamp light and glow (realistic). */
  private fillLight(f: FloorView, mesh: Mesh, geo: Geo, lights: ReturnType<typeof roomLights>, st: LightingState): void {
    if (this.look) {
      const lamp = mesh.geometry.getAttribute("aLamp") as BufferAttribute | undefined;
      const emis = mesh.geometry.getAttribute("aEmis") as BufferAttribute | undefined;
      if (!lamp || !emis || lamp.count !== geo.vertexCount) return;
      const dark = this.glowDark;
      relightRealistic(geo, lamp.array as Float32Array, emis.array as Float32Array, lights, st, (slot) => {
        const kind = f.fb.glows[slot]?.kind;
        if (kind === "lamp") return 1 + 0.8 * dark;
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
      g.currentItem = gl.currentItem = info.item;
      // cut, door leaves and sashes settle just under the wall's cut top
      const ws = info.wallSlot >= 0 ? info.wallSlot * 2 + WALL_TRIM : -1;
      buildOpeningMoving({ g, glass: gl, pal, look: joineryLook(info.opening, pal), room: info.room, ws, glow, low: this.low }, info, open);
    };
    f.fb.doors.forEach((d, i) => draw(d, f.doorPos[i], -1));
    f.fb.windows.forEach((w, i) => {
      if (windowFollowsSensor(w.opening)) draw(w, f.winPos[i], w.glow);
    });
    g.currentItem = gl.currentItem = -1;
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
      const lights = roomLights(f.fb, this.lampPalette, st);
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
        // a reading is its label, except in the editor (where its pin is what is dragged)
        if (!this.editMode && showsValue(d)) continue;
        const look = this.live!.marker(d);
        if (!look) continue;
        // the whole house shows only what wants attention: through the floors above, the rest is noise
        if (this.mode === "house" && !look.attention) continue;
        const pos = this.devicePosition(fi, d);
        // a camera's pin (live, motion, offline) floats over its model
        if (d.entity.startsWith("camera.")) pos[1] += 0.3;
        specs.push({ key: d.id, pos, icon: look.icon, color: look.color, size: this.mode === "house" ? 22 : 30, pulse: look.pulse, alpha: 1 });
      }
    });
    this.markers.set(specs.concat(this.overlayMarkers));
    this.refreshCones();
    this.invalidate();
  }

  /**
   * What each camera sees, in every view and in the editor (where it shows the aim): a glow on the
   * floor (or the ground outside) fading out to its reach, a faint beam from the lens down to it and
   * an outline. Each ray stops at the first wall it meets; doorways let it through. Blue while idle,
   * red while the camera is live or sees motion, grey while it is offline.
   */
  private refreshCones(): void {
    const tri: number[] = [], triCol: number[] = [];
    const line: number[] = [], lineCol: number[] = [];
    const night = this.pal.name === "night";
    for (const [fi, f] of this.floors.entries()) {
      if (!f.group.visible || (this.mode === "floor" && fi !== this.activeFloor)) continue;
      for (const rig of f.fb.cameras) {
        const d = f.fb.floor.devices.find((x) => x.id === rig.id);
        const state = (d && !this.editMode && this.live?.cameraState?.(d)) || "idle";
        const c = lin(state === "active" ? 0xff4b45 : state === "offline" ? 0x9aa0a8 : 0x3d8bfd);
        // how strong the glow is at the camera's foot, the beam at the lens and the outline
        const k = state === "active" ? 1.35 : state === "offline" ? 0.45 : 1;
        const lift = this.liftedCamera?.id === rig.id ? this.liftedCamera : null;
        const lx = rig.lens[0] + (lift?.dx ?? 0), lz = rig.lens[1] + (lift?.dz ?? 0);
        const base = f.fb.floor.elevation + f.offset;
        const gy = base + (rig.outside ? -SLAB : 0) + 0.03;
        const ly = base + rig.y;
        const full = rig.fov >= 359;
        const fov = (rig.fov * Math.PI) / 180;
        const h = (rig.heading * Math.PI) / 180;
        const n = Math.max(8, Math.min(90, Math.round(rig.fov / 4)));
        const reach = rig.reach;
        // the rays: direction and where each stops
        const rays: [number, number, number][] = [];
        for (let i = 0; i <= n; i++) {
          const a = full ? (Math.PI * 2 * i) / n : h - fov / 2 + (fov * i) / n;
          const [rx, rz] = headingDir((a * 180) / Math.PI);
          rays.push([rx, rz, this.castRay(f.fb.layout.walls, lx, lz, rx, rz, reach)]);
        }
        // even over what it covers, softer toward its reach
        const glow = (r: number) => (night ? 0.3 : 0.42) * k * (1 - (night ? 0.65 : 0.55) * Math.min(1, r / reach));
        const at = (i: number, r: number): number[] => [lx + rays[i][0] * r, gy, lz + rays[i][1] * r];
        const push = (out: number[], col: number[], p: number[], a: number) => {
          out.push(p[0], p[1], p[2]);
          col.push(c[0], c[1], c[2], a);
        };
        // the glow on the floor, in rings so it fades with distance, not with each ray's length
        const rings = 10;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < rings; j++) {
            const r0 = (reach * j) / rings, r1 = (reach * (j + 1)) / rings;
            const a0 = Math.min(r0, rays[i][2]), a1 = Math.min(r1, rays[i][2]);
            const b0 = Math.min(r0, rays[i + 1][2]), b1 = Math.min(r1, rays[i + 1][2]);
            if (a0 === a1 && b0 === b1) continue;
            const q = [at(i, a0), at(i, a1), at(i + 1, b1), at(i + 1, b0)];
            const qa = [glow(a0), glow(a1), glow(b1), glow(b0)];
            for (const v of [0, 1, 2, 0, 2, 3]) push(tri, triCol, q[v], qa[v]);
          }
        }
        // the beam: from the lens out to where the view ends, fading as it goes
        const beam = (full ? 0.05 : 0.1) * k;
        for (let i = 0; i < n; i++) {
          push(tri, triCol, [lx, ly, lz], beam);
          push(tri, triCol, at(i, rays[i][2]), 0);
          push(tri, triCol, at(i + 1, rays[i + 1][2]), 0);
        }
        // the outline: the edge of the view on the floor, and the beam's sides
        const edge = (r: number) => (night ? 0.22 + 0.5 * Math.max(0, 1 - r / reach) : 0.6) * k;
        for (let i = 0; i < n; i++) {
          push(line, lineCol, at(i, rays[i][2]), edge(rays[i][2]));
          push(line, lineCol, at(i + 1, rays[i + 1][2]), edge(rays[i + 1][2]));
        }
        if (!full) {
          for (const i of [0, n]) {
            push(line, lineCol, [lx, gy, lz], 0.7 * k);
            push(line, lineCol, at(i, rays[i][2]), edge(rays[i][2]));
            push(line, lineCol, [lx, ly, lz], 0.55 * k);
            push(line, lineCol, at(i, rays[i][2]), 0.05 * k);
          }
        }
      }
    }
    // a glow adds light at night; by day it tints the floor
    const blending = night ? AdditiveBlending : NormalBlending;
    for (const m of [this.cones.material as MeshBasicMaterial, this.coneLines.material as LineBasicMaterial]) {
      if (m.blending !== blending) {
        m.blending = blending;
        m.needsUpdate = true;
      }
    }
    const fill = (obj: Mesh | LineSegments, pos: number[], col: number[]) => {
      const old = obj.geometry;
      const g = new BufferGeometry();
      if (pos.length) {
        g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
        g.setAttribute("color", new BufferAttribute(new Float32Array(col), 4));
      }
      obj.geometry = g;
      old.dispose();
    };
    fill(this.cones, tri, triCol);
    fill(this.coneLines, line, lineCol);
  }

  /** How far a ray along the floor gets before it meets a wall's face (doorways let it through). */
  private castRay(walls: WallSegment[], ox: number, oz: number, rx: number, rz: number, reach: number): number {
    let t = reach;
    for (const w of walls) {
      const ex = w.b[0] - w.a[0], ez = w.b[1] - w.a[1];
      const den = rx * ez - rz * ex;
      if (Math.abs(den) < 1e-6) continue;
      const qx = w.a[0] - ox, qz = w.a[1] - oz;
      const tt = (qx * ez - qz * ex) / den;
      const along = ((qx * rz - qz * rx) / den) * w.length;
      // walls reach past their ends to close corners
      if (tt <= 0.02 || along < -w.extendStart - 0.01 || along > w.length + w.extendEnd + 0.01) continue;
      const face = tt - ((w.thickness / 2) * w.length) / Math.abs(den);
      if (face >= t) continue;
      if (w.openings.some((o) => o.opening.kind !== "window" && along > o.t0 && along < o.t1)) continue;
      t = Math.max(0, face);
    }
    return t;
  }

  /** World position of a device's marker (a camera's: its lens). */
  devicePosition(fi: number, d: Device): [number, number, number] {
    const f = this.floors[fi];
    const rig = f.fb.cameras.find((c) => c.id === d.id);
    if (rig) return [rig.lens[0], f.fb.floor.elevation + f.offset + rig.y, rig.lens[1]];
    const domain = d.entity.split(".")[0];
    const usual = d.mount === "ceiling" ? f.fb.floor.height - 0.15 : d.mount === "floor" ? 0.3 : domain === "binary_sensor" ? 2.0 : 1.2;
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
        // the house view has no room labels: who is where shows over their rooms
        f.fb.rooms.forEach((r, ri) => {
          const people = this.live?.roomPeople?.(f.fb.floor, { id: r.id }) ?? [];
          if (!people.length) return;
          const who = document.createElement("div");
          who.className = "vh-label vh-faces";
          who.append(faces(people));
          who.dataset.floor = String(fi);
          who.dataset.room = String(ri);
          this.overlay.appendChild(who);
          f.labels.push(who);
        });
        return;
      }
      f.fb.rooms.forEach((r, ri) => {
        const el = document.createElement("div");
        el.className = "vh-label";
        const parts = this.live?.roomLine(f.fb.floor, { id: r.id }) ?? [];
        el.innerHTML = `<b></b>${parts.length ? "<span></span>" : ""}`;
        (el.firstChild as HTMLElement).textContent = r.name;
        const people = this.live?.roomPeople?.(f.fb.floor, { id: r.id }) ?? [];
        if (people.length) {
          el.prepend(faces(people));
          el.dataset.who = "";
        }
        parts.forEach((p, i) => {
          const line = el.lastChild as HTMLElement;
          if (i) line.append(" · ");
          if (!p.entity) return line.append(p.text);
          const s = document.createElement("span");
          s.className = p.heating ? "vh-heat on" : "vh-heat";
          s.dataset.entity = p.entity;
          s.textContent = p.text;
          line.append(s);
        });
        el.dataset.floor = String(fi);
        el.dataset.room = String(ri);
        this.overlay.appendChild(el);
        f.labels.push(el);
      });
      if (this.editMode) return;
      for (const d of f.fb.floor.devices) {
        if (!showsValue(d)) continue;
        const el = document.createElement("div");
        el.className = "vh-label vh-reading";
        el.dataset.floor = String(fi);
        el.dataset.reading = d.id;
        el.dataset.entity = d.entity;
        this.drawReading(el, d);
        this.overlay.appendChild(el);
        f.labels.push(el);
      }
    });
    this.positionLabels();
  }

  /** Fills a reading's label: its icon and its value. Returns whether its text changed. */
  private drawReading(el: HTMLElement, d: Device): boolean {
    const r = this.live?.reading?.(d) ?? null;
    const text = r?.text ?? "–";
    const icon = r?.icon ?? "gauge";
    if (el.dataset.text === text && el.dataset.icon === icon) return false;
    el.dataset.text = text;
    el.dataset.icon = icon;
    const path = (ICONS.find(([n]) => n === icon) ?? ICONS[0])[1];
    el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg><span></span>`;
    (el.lastChild as HTMLElement).textContent = text;
    return true;
  }

  /** Readings' values changed: their labels say so, without redrawing the rest. */
  refreshReadings(): void {
    let changed = false;
    for (const f of this.floors) {
      for (const el of f.labels) {
        if (el.dataset.reading === undefined) continue;
        const d = f.fb.floor.devices.find((x) => x.id === el.dataset.reading);
        if (!d || !this.drawReading(el, d)) continue;
        this.labelSize.delete(el);
        changed = true;
      }
    }
    if (changed) this.positionLabels();
  }

  /**
   * Puts the labels over their rooms. Where labels would overlap, the bigger room keeps its label
   * (the selected room always does); zooming in brings the others back.
   */
  private positionLabels(): void {
    const v = new Vector3();
    const items: { el: HTMLElement; x: number; y: number; hidden: boolean; prio: number }[] = [];
    for (const [fi, f] of this.floors.entries()) {
      f.labels.forEach((el) => {
        let prio = 1e9;
        const i = el.dataset.room === undefined ? -1 : Number(el.dataset.room);
        const reading = el.dataset.reading === undefined ? null : f.fb.floor.devices.find((d) => d.id === el.dataset.reading);
        if (reading) {
          // over the room labels around it, but under the selected room's and those with someone in
          v.set(...this.devicePosition(fi, reading));
          prio = 5e4;
        } else if (i < 0) {
          const b = f.fb.bounds;
          v.set(b.maxX + 0.4, f.fb.floor.elevation + f.offset + 0.2, (b.minZ + b.maxZ) / 2);
        } else {
          const r = f.fb.rooms[i];
          v.set(r.label[0], f.fb.floor.elevation + f.offset + 0.05, r.label[1]);
          // a room with someone in it keeps its label; in the house view people always show
          prio = this.mode === "house" ? 1e10 : (fi === this.activeFloor && i === this.selectedRoom ? 1e6 : 0) + (el.dataset.who !== undefined ? 1e5 : 0) + (r.area || 1);
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
        if (it.prio < 1e10 && placed.some((p) => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1])) hide = true;
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
    if (!this.raf && !this.disposed && !this.halted) this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.raf = 0;
    // nothing to draw on while the context is lost
    if (this.disposed || this.halted || this.lostTimer) return;
    try {
      this.step(now);
      this.fails = 0;
    } catch (err) {
      this.frameFailed(err);
    }
  };

  /** A frame threw: tried again shortly, and after a few failures in a row the view is told it can't draw. */
  private frameFailed(err: unknown): void {
    this.dirty = true;
    if (++this.fails >= 3) {
      this.halt();
      this.onError?.(err, true, "render");
      return;
    }
    this.onError?.(err, false, "render");
    window.setTimeout(() => this.invalidate(), 250);
  }

  private step(now: number): void {
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
      this.renewals = 0;
      this.positionLabels();
      if (this.onFrame) {
        // an extension's: one that throws is dropped, the house keeps drawing
        try {
          this.onFrame();
        } catch (err) {
          this.onFrame = null;
          this.onError?.(err, false, "extension");
        }
      }
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
    // the weather asks for its own frames, at most about 30 a second, and none while unseen
    const fx = this.look && this.visible && !document.hidden ? this.look.animate(now) : 0;
    if (fx && !again && !this.fxTimer) {
      this.fxTimer = window.setTimeout(() => {
        this.fxTimer = 0;
        this.invalidate();
      }, fx);
    }
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
  }

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
        if (hit.item && (hit.kind === "marker" || hit.kind === "lamp" || hit.kind === "furniture") && (this.canDrag?.(hit) ?? true)) {
          const plane = hit.plane
            ? new Plane().setFromNormalAndCoplanarPoint(new Vector3(...hit.plane.normal), new Vector3(...hit.plane.point))
            : new Plane(new Vector3(0, 1, 0), -(hit.y ?? 0));
          drag = { hit, plane, moved: false };
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
    // the editor leaves alone what the shut house hides (its pins still show what wants attention)
    const pinShut = (key: string) => {
      if (!this.editMode || !this.closed) return false;
      for (const [fi, f] of this.floors.entries()) {
        const dev = f.fb.floor.devices.find((dd) => dd.id === key);
        if (dev) return this.shutIn(fi, this.devicePosition(fi, dev));
      }
      return false;
    };
    for (const m of this.markers.list) {
      v.set(m.pos[0], m.pos[1], m.pos[2]).project(this.camera);
      if (v.z > 1) continue;
      const sx = ((v.x + 1) / 2) * this.width;
      const sy = ((1 - v.y) / 2) * this.height;
      const d = Math.hypot(sx - x, sy - y);
      if (d < m.size * 0.75 && (!best || d < best.d) && !pinShut(m.key)) best = { d, key: m.key };
      if (m.item && d < Math.max(m.size * 0.9, 16) && (!handle || d < handle.d)) handle = { d, m };
    }
    if (handle) return { kind: "marker", floor: this.activeFloor, room: -1, entity: null, item: handle.m.item, y: handle.m.pos[1], plane: handle.m.plane };
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
        if (d < 26 && (!lampBest || d < lampBest.d) && !this.shutIn(fi, [lamp.pos[0], lamp.pos[1] + f.offset, lamp.pos[2]])) {
          const item = lamp.id.startsWith("dev_") ? { kind: "device" as const, id: lamp.id.slice(4) } : { kind: "furniture" as const, id: lamp.id };
          lampBest = { d, fi, entity: lamp.entity, room: lamp.room, item, y: lamp.pos[1] + f.offset };
        }
      }
    }
    // cameras: their lens, as generous a target as a lamp
    let camBest: { d: number; fi: number; rig: CameraRig; y: number } | null = null;
    for (const [fi, f] of this.floors.entries()) {
      if (!f.group.visible || (this.mode === "floor" && fi !== this.activeFloor)) continue;
      for (const rig of f.fb.cameras) {
        const wy = f.fb.floor.elevation + f.offset + rig.y;
        v.set(rig.lens[0], wy, rig.lens[1]).project(this.camera);
        if (v.z > 1) continue;
        const d = Math.hypot(((v.x + 1) / 2) * this.width - x, ((1 - v.y) / 2) * this.height - y);
        if (d < 26 && (!camBest || d < camBest.d) && !this.shutIn(fi, [rig.lens[0], wy, rig.lens[1]])) camBest = { d, fi, rig, y: wy };
      }
    }
    if (camBest && (!lampBest || camBest.d < lampBest.d)) {
      const { fi, rig } = camBest;
      const device = this.floors[fi].fb.floor.devices.find((dd) => dd.id === rig.id);
      return { kind: "marker", floor: fi, room: this.roomAt(fi, rig.lens), entity: rig.entity, device, item: { kind: "device", id: rig.id }, y: camBest.y };
    }
    if (lampBest) return { kind: "lamp", floor: lampBest.fi, room: lampBest.room, entity: lampBest.entity, item: lampBest.item, y: lampBest.y };
    // then the meshes: a screen with an entity, else the room the floor belongs to
    const ray = new Raycaster();
    ray.setFromCamera(new Vector2((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1), this.camera);
    const parts = new Map<object, { fi: number; geo: Geo; onRoof: boolean }>();
    this.floors.forEach((f, fi) => {
      if (!f.group.visible || (this.mode !== "house" && fi !== this.activeFloor)) return;
      parts.set(f.opaque, { fi, geo: f.fb.opaque, onRoof: false });
      parts.set(f.dyn, { fi, geo: f.dynGeo, onRoof: false });
      if (f.roof?.visible) parts.set(f.roof, { fi, geo: f.fb.roof, onRoof: true });
      // the shut house's glass too: a tap on a pane is on its window, not on the room behind
      if (!this.closed) return;
      parts.set(f.glass, { fi, geo: f.fb.glass, onRoof: false });
      parts.set(f.dynGlass, { fi, geo: f.dynGlassGeo, onRoof: false });
      if (f.roofGlass?.visible) parts.set(f.roofGlass, { fi, geo: f.fb.roofGlass, onRoof: true });
    });
    const hits = ray.intersectObjects([...parts.keys()] as Mesh[], false);
    for (const h of hits) {
      const { fi, geo, onRoof } = parts.get(h.object)!;
      const f = this.floors[fi];
      const vi = h.face?.a ?? -1;
      if (vi < 0) continue;
      const itemIdx = geo.item[vi];
      const item = itemIdx >= 0 ? f.fb.items[itemIdx] : undefined;
      const slot = geo.glow[vi];
      if (!onRoof && item?.kind !== "opening" && this.shutIn(fi, [h.point.x, h.point.y, h.point.z])) {
        // seen inside the shut house (through an open door): only its room, never what is in it
        const room = this.roomAt(fi, [h.point.x, h.point.z]);
        return { kind: room >= 0 ? "room" : "empty", floor: fi, room, entity: null };
      }
      if (slot >= 0 && !this.editMode) {
        const g = f.fb.glows[slot];
        if (g?.entity) return { kind: "entity", floor: fi, room: g.room, entity: g.entity, item };
      }
      if (this.closed && item?.kind === "opening" && !this.editMode) {
        // the shut house's door or window without a sensor: the room behind it (as a tap through the glass gave)
        const o = [...f.fb.windows, ...f.fb.doors].find((w) => w.item === itemIdx);
        if (o && o.room >= 0) return { kind: "room", floor: fi, room: o.room, entity: null };
      }
      if (item && this.editMode && onRoof) {
        // something on a roof slides along the slope under it; a roof itself moves level
        const n = h.face?.normal;
        const plane = item.kind === "roofitem" && n && n.y > 0.2 ? { normal: [n.x, n.y, n.z] as V3, point: [h.point.x, h.point.y, h.point.z] as V3 } : undefined;
        return { kind: "furniture", floor: fi, room: -1, entity: null, item, y: h.point.y, plane };
      }
      if (onRoof && !this.editMode) {
        // a tap on the roof is a tap on the house (solar panels open their sensor)
        return { kind: "empty", floor: fi, room: -1, entity: null, item };
      }
      if (item && this.editMode) {
        return { kind: "furniture", floor: fi, room: this.roomAt(fi, [h.point.x, h.point.z]), entity: null, item, y: f.fb.floor.elevation + f.offset };
      }
      const room = this.roomAt(fi, [h.point.x, h.point.z]);
      return { kind: room >= 0 ? "room" : "empty", floor: fi, room, entity: null };
    }
    return { kind: "empty", floor: this.activeFloor, room: -1, entity: null };
  }

  /** Room (or garden area, numbered after the rooms; the one on top where they overlap) under a plan point, or -1. */
  roomAt(fi: number, p: Vec2): number {
    const f = this.floors[fi]?.fb.floor;
    if (!f) return -1;
    const ri = f.rooms.findIndex((r) => pointInPolygon(p, r.points));
    if (ri >= 0) return ri;
    const k = outdoorAt(f, p);
    return k >= 0 ? f.rooms.length + k : -1;
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
    window.clearTimeout(this.fxTimer);
    window.clearTimeout(this.lostTimer);
    this.fade?.remove();
    this.resizeObs.disconnect();
    this.interObs.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    for (const f of this.floors) this.disposeFloor(f);
    this.look?.dispose();
    this.markers.dispose();
    this.halos.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    // its WebGL context goes now, not when collected: a page may hold only so many (the demo home
    // opens and closes a view of its own)
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}

/** People's faces in a row: their picture, else their initials. Names go in as text, never markup. */
function faces(people: Person[]): HTMLElement {
  const row = document.createElement("div");
  row.className = "vh-who";
  for (const p of people) {
    const face = document.createElement("i");
    face.className = "vh-face";
    face.dataset.entity = p.id;
    face.title = p.name;
    if (p.picture) {
      const img = document.createElement("img");
      img.alt = "";
      img.src = p.picture;
      face.append(img);
    } else face.textContent = initials(p.name);
    row.append(face);
  }
  return row;
}

/** A piece's share of one of its floor's meshes, drawn by a mesh of its own while it is dragged. */
interface LiftedPart {
  /** The floor's mesh it came out of, its geometry then, and that geometry's index as it was. */
  from: Mesh;
  geometry: BufferGeometry;
  index: BufferAttribute;
  saved: Uint16Array | Uint32Array;
  mesh: Mesh;
}

/**
 * Copies item k's triangles out of a floor's mesh (owner: the item of each vertex) into a mesh of
 * their own, and collapses them in the floor's index. Null when the item has none there.
 */
function liftPart(from: Mesh, owner: number[], k: number): LiftedPart | null {
  const src = from.geometry;
  const index = src.getIndex();
  if (!index) return null;
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
  if (!tris.length) return null;
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
  const mesh = new Mesh(g, from.material);
  mesh.renderOrder = from.renderOrder;
  return { from, geometry: src, index, saved, mesh };
}

/** prefers-reduced-motion: a new look shows at once. */
function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
