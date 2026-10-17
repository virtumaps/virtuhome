// The 3D view. Draws only when something changed (zero GPU work while idle), merges each floor
// into a couple of meshes, and lights them on the CPU.
import {
  Color, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, Raycaster, Scene, Vector2, Vector3, WebGLRenderer,
  CircleGeometry, BufferGeometry, BufferAttribute,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { spaces, type Device, type Floor, type Plan, type Vec2 } from "../model/plan";
import { buildFloor, lin, SLAB, type FloorBuild, type GlowSlot, type ItemRef, type LampInfo } from "./build";
import { Geo, type V3 } from "./geo";
import { relight, roomGlow, roomLights, type LampState, type LightingState } from "./lighting";
import { Halos, Markers, type HaloSpec, type MarkerSpec } from "./markers";
import { floorUniforms, getCut, glassMaterial, opaqueMaterial, setCut, setTint, type FloorUniforms } from "./materials";
import { paletteFor, type Palette } from "./palette";

export type WallMode = "smart" | "low" | "full";
export type Quality = "auto" | "low" | "high";

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
  group: Group;
  opaque: Mesh;
  glass: Mesh;
  dyn: Mesh;
  dynGeo: Geo;
  u: FloorUniforms;
  offset: number;
  /** Target and current cut per wall slot. */
  cutTarget: Float32Array;
  doorAngle: Float32Array;
  doorTarget: Float32Array;
  coverPos: Float32Array;
  coverTarget: Float32Array;
  roomGlow: number[];
  labels: HTMLElement[];
}

const DOOR_OPEN = (82 * Math.PI) / 180;
const DOOR_UNKNOWN = (28 * Math.PI) / 180;
const EXPLODE_GAP = 2.2;

export function detectLowEnd(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (
    /Silk|KF[A-Z]{2,4}\b|; KF|Android [5-9]\b/.test(navigator.userAgent) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 3) ||
    (navigator.hardwareConcurrency || 8) <= 4
  );
}

export class Viewer {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(38, 1, 0.1, 400);
  readonly controls: OrbitControls;
  readonly low: boolean;
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

  private floors: FloorView[] = [];
  private markers: Markers;
  private halos: Halos;
  private ground: Mesh;
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

  constructor(private container: HTMLElement, private overlay: HTMLElement, opts: { quality?: Quality; theme?: "day" | "night" } = {}) {
    this.low = opts.quality === "low" || (opts.quality !== "high" && detectLowEnd());
    this.pal = paletteFor(opts.theme ?? "night");
    this.renderer = new WebGLRenderer({
      antialias: !this.low,
      powerPreference: this.low ? "low-power" : "default",
      alpha: false,
      stencil: false,
    });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.low ? 1 : 2);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";
    container.appendChild(this.renderer.domElement);

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
    this.ground = new Mesh(new CircleGeometry(1, 48), new MeshBasicMaterial({ color: 0xffffff }));
    this.ground.rotation.x = -Math.PI / 2;
    this.scene.add(this.ground, this.halos.mesh, this.markers.mesh);
    this.applyPalette();

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    this.interObs = new IntersectionObserver((entries) => {
      this.visible = entries.some((e) => e.isIntersecting);
      if (this.visible) this.invalidate();
    });
    this.interObs.observe(container);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.renderer.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
    this.renderer.domElement.addEventListener("webglcontextrestored", () => this.plan && this.setPlan(this.plan, true));
    this.bindPointer();
    this.resize();
  }

  // ------------------------------------------------------------------ plan and looks

  setPlan(plan: Plan, keepView = false): void {
    this.plan = plan;
    for (const f of this.floors) this.disposeFloor(f);
    this.floors = plan.floors.map((_, i) => this.makeFloor(i));
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
    if (this.plan) this.setPlan(this.plan, true);
  }

  setLive(live: LiveSource): void {
    this.live = live;
    this.refreshAll();
  }

  private applyPalette(): void {
    this.scene.background = new Color(this.pal.background);
    (this.ground.material as MeshBasicMaterial).color.setHex(this.pal.ground);
  }

  private makeFloor(i: number): FloorView {
    const fb = buildFloor(this.plan!, i, this.pal, { low: this.low });
    const u = floorUniforms();
    u.uCutColor.value.setHex(this.pal.wallCut);
    u.uCutY.value = fb.floor.elevation + this.cutHeight;
    const opaque = new Mesh(fb.opaque.toBufferGeometry(), opaqueMaterial(u));
    const glass = new Mesh(fb.glass.toBufferGeometry(), glassMaterial(u));
    glass.renderOrder = 2;
    const dynGeo = new Geo();
    const dyn = new Mesh(new BufferGeometry(), opaqueMaterial(u));
    const group = new Group();
    group.add(opaque, dyn, glass);
    this.scene.add(group);
    const slots = 128;
    return {
      fb, group, opaque, glass, dyn, dynGeo, u, offset: 0,
      cutTarget: new Float32Array(slots),
      doorAngle: new Float32Array(fb.doors.length).fill(DOOR_UNKNOWN),
      doorTarget: new Float32Array(fb.doors.length).fill(DOOR_UNKNOWN),
      coverPos: new Float32Array(fb.windows.length).fill(1),
      coverTarget: new Float32Array(fb.windows.length).fill(1),
      roomGlow: [],
      labels: [],
    };
  }

  private disposeFloor(f: FloorView): void {
    this.scene.remove(f.group);
    for (const m of [f.opaque, f.glass, f.dyn]) {
      m.geometry.dispose();
      (m.material as MeshBasicMaterial).dispose();
    }
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
    const r = Math.max(b.maxX - b.minX, b.maxZ - b.minZ, 6) * 2.4;
    this.ground.scale.set(r, r, 1);
    this.ground.position.x = (b.minX + b.maxX) / 2;
    this.ground.position.z = (b.minZ + b.maxZ) / 2;
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
    const pos = new Vector3(
      cx + dist * Math.sin(polar) * Math.sin(az),
      ty + dist * Math.cos(polar),
      cz + dist * Math.sin(polar) * Math.cos(az),
    );
    this.flyTo(pos, target, fly);
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
      const fill = (mesh: Mesh, geo: Geo) => {
        const attr = mesh.geometry.getAttribute("color") as BufferAttribute | undefined;
        if (!attr || attr.count !== geo.vertexCount) return;
        relight(geo, attr.array as Float32Array, lights, st, this.pal);
        attr.needsUpdate = true;
      };
      fill(f.opaque, f.fb.opaque);
      fill(f.glass, f.fb.glass);
      fill(f.dyn, f.dynGeo);
      if (this.mode === "floor" && fi > this.activeFloor) continue;
      for (const lamp of f.fb.lamps) {
        const s = st.lamp(lamp);
        if (!s?.on || s.level <= 0) continue;
        if (this.pal.name === "day") continue; // by day a halo reads as haze, not light
        const k = 0.55 * (0.4 + 0.6 * s.level);
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

  /** Doors swing to their contact's state, blinds move to their cover's position. */
  refreshOpenings(): void {
    if (!this.live) return;
    let moving = false;
    for (const f of this.floors) {
      f.fb.doors.forEach((d, i) => {
        const c = this.live!.contact(d.opening.entity);
        f.doorTarget[i] = c === null ? DOOR_UNKNOWN : c * DOOR_OPEN;
        if (Math.abs(f.doorTarget[i] - f.doorAngle[i]) > 0.001) moving = true;
      });
      f.fb.windows.forEach((w, i) => {
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
    const wood = lin(this.pal.roles.white);
    const y0 = f.fb.floor.elevation;
    f.fb.doors.forEach((d, i) => {
      const a = f.doorAngle[i];
      const dx = d.along[0] * Math.cos(a) + d.swing[0] * Math.sin(a);
      const dz = d.along[1] * Math.cos(a) + d.swing[1] * Math.sin(a);
      const w = d.width - 0.03;
      const t = 0.04;
      // the leaf: a thin box from the hinge along (dx, dz)
      const nx = -dz, nz = dx;
      const corner = (s: number, side: number, y: number): V3 => [d.hinge[0] + dx * s + nx * side, y0 + y, d.hinge[2] + dz * s + nz * side];
      const h = d.height - 0.02;
      const slot = d.wallSlot >= 0 ? d.wallSlot * 2 : -1;
      const quads: [V3, V3, V3, V3, V3][] = [
        [corner(0, t / 2, 0), corner(w, t / 2, 0), corner(w, t / 2, h), corner(0, t / 2, h), [nx, 0, nz]],
        [corner(w, -t / 2, 0), corner(0, -t / 2, 0), corner(0, -t / 2, h), corner(w, -t / 2, h), [-nx, 0, -nz]],
        [corner(0, t / 2, h), corner(w, t / 2, h), corner(w, -t / 2, h), corner(0, -t / 2, h), [0, 1, 0]],
        [corner(w, t / 2, 0), corner(w, -t / 2, 0), corner(w, -t / 2, h), corner(w, t / 2, h), [dx, 0, dz]],
      ];
      for (const [p0, p1, p2, p3, n] of quads) g.quad(p0, p1, p2, p3, n, [wood[0] * 0.9, wood[1] * 0.88, wood[2] * 0.85], d.room, slot, -1, 1, 2);
    });
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
      const fabric = lin(this.pal.roles.fabric);
      const slot = w.wallSlot >= 0 ? w.wallSlot * 2 : -1;
      g.quad(P(-half, bot), P(half, bot), P(half, top), P(-half, top), [w.normal[0], 0, w.normal[1]], fabric, w.room, slot, -1, 2, 2);
      g.quad(P(half, bot), P(-half, bot), P(-half, top), P(half, top), [-w.normal[0], 0, -w.normal[1]], fabric, w.room, slot, -1, 2, 2);
    });
    f.dynGeo = g;
    const old = f.dyn.geometry;
    f.dyn.geometry = g.vertexCount ? g.toBufferGeometry() : new BufferGeometry();
    old.dispose();
    if (this.live && g.vertexCount) {
      const st = this.lightingFor(f);
      const attr = f.dyn.geometry.getAttribute("color") as BufferAttribute;
      relight(g, attr.array as Float32Array, roomLights(f.fb, this.pal, st), st, this.pal);
    }
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
    this.invalidate();
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

  private positionLabels(): void {
    const v = new Vector3();
    for (const [fi, f] of this.floors.entries()) {
      f.labels.forEach((el, i) => {
        if (this.mode === "house") {
          const b = f.fb.bounds;
          v.set(b.maxX + 0.4, f.fb.floor.elevation + f.offset + 0.2, (b.minZ + b.maxZ) / 2);
        } else {
          const r = f.fb.rooms[i];
          v.set(r.label[0], f.fb.floor.elevation + f.offset + 0.05, r.label[1]);
        }
        v.project(this.camera);
        const hidden = v.z > 1 || (this.mode === "floor" && fi !== this.activeFloor);
        const x = Math.round(((v.x + 1) / 2) * this.width);
        const y = Math.round(((1 - v.y) / 2) * this.height);
        const key = hidden ? "h" : `${x},${y}`;
        if (el.dataset.at === key) return;
        el.dataset.at = key;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        el.style.visibility = hidden ? "hidden" : "visible";
      });
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
      for (let i = 0; i < f.doorAngle.length; i++) {
        const d = f.doorTarget[i] - f.doorAngle[i];
        if (Math.abs(d) > 0.002) {
          f.doorAngle[i] += d * step;
          dynChanged = true;
        } else if (d !== 0) {
          f.doorAngle[i] = f.doorTarget[i];
          dynChanged = true;
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
    if (this.animate(dt)) again = true;
    if (moved) again = true;
    const pulsing = this.markers.pulsing;
    if (pulsing) this.markers.setTime(now / 1000);

    if ((this.dirty || again || pulsing) && this.visible && !document.hidden) {
      const t0 = performance.now();
      this.renderer.render(this.scene, this.camera);
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

  private resize(): void {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    // a large Retina window needs no 4+ million pixels for this look: about 2.5 million is plenty
    const want = Math.min(window.devicePixelRatio || 1, this.low ? 1 : 2);
    const cap = Math.sqrt(2_500_000 / (w * h));
    const ratio = Math.max(1, Math.min(want, cap));
    if (Math.abs(ratio - this.pixelRatio) > 0.01) {
      this.pixelRatio = ratio;
      this.renderer.setPixelRatio(ratio);
    }
    this.renderer.setSize(w, h, true);
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
    const el = this.renderer.domElement;
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
    for (const m of this.markers.list) {
      v.set(m.pos[0], m.pos[1], m.pos[2]).project(this.camera);
      if (v.z > 1) continue;
      const sx = ((v.x + 1) / 2) * this.width;
      const sy = ((1 - v.y) / 2) * this.height;
      const d = Math.hypot(sx - x, sy - y);
      if (d < m.size * 0.75 && (!best || d < best.d)) best = { d, key: m.key };
      // editor handles win over what lies under them
      if (m.item && d < m.size * 0.9) {
        return { kind: "marker", floor: this.activeFloor, room: -1, entity: null, item: m.item, y: m.pos[1] };
      }
    }
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
    const meshes = this.floors.filter((f, fi) => f.group.visible && (this.mode === "house" || fi === this.activeFloor)).map((f) => f.opaque);
    const hits = ray.intersectObjects(meshes, false);
    for (const h of hits) {
      const fi = this.floors.findIndex((f) => f.opaque === h.object);
      const f = this.floors[fi];
      const vi = h.face?.a ?? -1;
      if (vi < 0) continue;
      const itemIdx = f.fb.opaque.item[vi];
      const item = itemIdx >= 0 ? f.fb.items[itemIdx] : undefined;
      const slot = f.fb.opaque.glow[vi];
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
    this.markers.dispose();
    this.halos.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

