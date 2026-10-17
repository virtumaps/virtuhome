// Device markers and light halos, each a single instanced draw call for the whole house.
//
// Markers are round badges with an icon that face the camera and keep the same size on screen.
// Icons come from an atlas drawn once from Material Design Icons paths.
import {
  AdditiveBlending, BufferAttribute, CanvasTexture, Color, InstancedBufferAttribute, InstancedBufferGeometry,
  LinearFilter, Mesh, ShaderMaterial, SRGBColorSpace, Vector2,
} from "three";
import * as mdi from "./icons";

export const ICONS = mdi.ICON_LIST;
const CELL = 64;
const COLS = 8;

let atlas: CanvasTexture | null = null;
function iconAtlas(): CanvasTexture {
  if (atlas) return atlas;
  const rows = Math.ceil(ICONS.length / COLS);
  const canvas = document.createElement("canvas");
  canvas.width = CELL * COLS;
  canvas.height = CELL * rows;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ICONS.forEach(([, path], i) => {
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * CELL;
    ctx.save();
    ctx.translate(x + 8, y + 8);
    ctx.scale((CELL - 16) / 24, (CELL - 16) / 24);
    ctx.fill(new Path2D(path));
    ctx.restore();
  });
  atlas = new CanvasTexture(canvas);
  atlas.minFilter = LinearFilter;
  atlas.generateMipmaps = false;
  atlas.colorSpace = SRGBColorSpace;
  return atlas;
}

export function iconIndex(name: string): number {
  const i = ICONS.findIndex(([n]) => n === name);
  return i < 0 ? 0 : i;
}

export interface MarkerSpec {
  key: string;
  /** Editor handles: what dragging this marker moves. */
  item?: import("./build").ItemRef;
  pos: [number, number, number];
  icon: number;
  color: number;
  /** Diameter in CSS pixels. */
  size: number;
  /** 0 = still, 1 = pulsing (motion, alerts). */
  pulse: number;
  /** 0..1 how visible (floors fading out). */
  alpha: number;
}

const QUAD = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]);
const QUAD_UV = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
const QUAD_IDX = new Uint16Array([0, 1, 2, 0, 2, 3]);

function quadGeometry(count: number, attrs: Record<string, number>): InstancedBufferGeometry {
  const g = new InstancedBufferGeometry();
  g.setAttribute("position", new BufferAttribute(QUAD, 3));
  g.setAttribute("uv", new BufferAttribute(QUAD_UV, 2));
  g.setIndex(new BufferAttribute(QUAD_IDX, 1));
  for (const [name, size] of Object.entries(attrs)) {
    g.setAttribute(name, new InstancedBufferAttribute(new Float32Array(Math.max(1, count) * size), size));
  }
  g.instanceCount = count;
  return g;
}

export class Markers {
  readonly mesh: Mesh;
  private specs: MarkerSpec[] = [];
  private mat: ShaderMaterial;

  constructor(private pixelRatio: number) {
    this.mat = new ShaderMaterial({
      uniforms: {
        uAtlas: { value: iconAtlas() },
        uCols: { value: COLS },
        uRows: { value: Math.ceil(ICONS.length / COLS) },
        uViewport: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
        uRing: { value: new Color(0xffffff) },
      },
      vertexShader: /* glsl */ `
        attribute vec3 iPos;
        attribute vec4 iData; // icon, size (px), pulse, alpha
        attribute vec3 iColor;
        uniform vec2 uViewport;
        uniform float uTime;
        uniform float uCols;
        uniform float uRows;
        varying vec2 vUv;
        varying vec2 vCell;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vPulse;
        void main() {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(iPos, 1.0);
          float pulse = iData.z * (0.5 + 0.5 * sin(uTime * 5.0));
          float size = iData.y * (1.0 + 0.18 * pulse);
          clip.xy += position.xy * size * 2.0 / uViewport * clip.w;
          gl_Position = clip;
          vUv = uv;
          float icon = iData.x;
          vCell = vec2(mod(icon, uCols), floor(icon / uCols));
          vColor = iColor;
          vAlpha = iData.w;
          vPulse = pulse;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uAtlas;
        uniform float uCols;
        uniform float uRows;
        varying vec2 vUv;
        varying vec2 vCell;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vPulse;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 1.0) discard;
          float aa = fwidth(r);
          float disc = 1.0 - smoothstep(1.0 - aa * 1.5, 1.0, r);
          float ring = smoothstep(0.80 - aa, 0.80, r);
          vec2 iuv = vec2((vCell.x + vUv.x) / uCols, 1.0 - (vCell.y + 1.0 - vUv.y) / uRows);
          float icon = texture2D(uAtlas, iuv).a;
          vec3 col = mix(vColor, vec3(1.0), icon * 0.95);
          col = mix(col, vec3(1.0), ring * (0.55 + 0.45 * vPulse));
          gl_FragColor = vec4(col, disc * vAlpha);
        }`,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(quadGeometry(0, { iPos: 3, iData: 4, iColor: 3 }), this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
  }

  set(specs: MarkerSpec[]): void {
    this.specs = specs;
    const old = this.mesh.geometry as InstancedBufferGeometry;
    let g = old;
    if ((old.getAttribute("iPos") as InstancedBufferAttribute).count < specs.length) {
      old.dispose();
      g = quadGeometry(Math.max(specs.length, 16), { iPos: 3, iData: 4, iColor: 3 });
      this.mesh.geometry = g;
    }
    const pos = g.getAttribute("iPos") as InstancedBufferAttribute;
    const data = g.getAttribute("iData") as InstancedBufferAttribute;
    const col = g.getAttribute("iColor") as InstancedBufferAttribute;
    const c = new Color();
    specs.forEach((s, i) => {
      pos.setXYZ(i, s.pos[0], s.pos[1], s.pos[2]);
      data.setXYZW(i, s.icon, s.size * this.pixelRatio, s.pulse, s.alpha);
      c.setHex(s.color);
      col.setXYZ(i, c.r, c.g, c.b);
    });
    pos.needsUpdate = data.needsUpdate = col.needsUpdate = true;
    g.instanceCount = specs.length;
  }

  get list(): MarkerSpec[] {
    return this.specs;
  }

  get pulsing(): boolean {
    return this.specs.some((s) => s.pulse > 0 && s.alpha > 0);
  }

  setViewport(w: number, h: number, pixelRatio: number): void {
    this.pixelRatio = pixelRatio;
    (this.mat.uniforms.uViewport.value as Vector2).set(w * pixelRatio, h * pixelRatio);
  }

  setTime(t: number): void {
    this.mat.uniforms.uTime.value = t;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mat.dispose();
  }
}

export interface HaloSpec {
  pos: [number, number, number];
  /** Linear RGB. */
  rgb: [number, number, number];
  /** Radius in metres. */
  size: number;
}

/** Soft additive glows around lamps that are on: a cheap stand-in for bloom. */
export class Halos {
  readonly mesh: Mesh;
  private mat: ShaderMaterial;

  constructor() {
    this.mat = new ShaderMaterial({
      vertexShader: /* glsl */ `
        attribute vec3 iPos;
        attribute vec4 iColor; // rgb, size
        varying vec2 vUv;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
          mv.xy += position.xy * iColor.w * 2.0;
          gl_Position = projectionMatrix * mv;
          vUv = uv;
          vColor = iColor.rgb;
        }`,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vColor;
        void main() {
          float r = length(vUv * 2.0 - 1.0);
          float a = exp(-r * r * 4.0) * (1.0 - smoothstep(0.85, 1.0, r));
          gl_FragColor = vec4(vColor * a, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    this.mesh = new Mesh(quadGeometry(0, { iPos: 3, iColor: 4 }), this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
  }

  set(halos: HaloSpec[]): void {
    const old = this.mesh.geometry as InstancedBufferGeometry;
    let g = old;
    if ((old.getAttribute("iPos") as InstancedBufferAttribute).count < halos.length) {
      old.dispose();
      g = quadGeometry(Math.max(halos.length, 16), { iPos: 3, iColor: 4 });
      this.mesh.geometry = g;
    }
    const pos = g.getAttribute("iPos") as InstancedBufferAttribute;
    const col = g.getAttribute("iColor") as InstancedBufferAttribute;
    halos.forEach((h, i) => {
      pos.setXYZ(i, h.pos[0], h.pos[1], h.pos[2]);
      col.setXYZW(i, h.rgb[0], h.rgb[1], h.rgb[2], h.size);
    });
    pos.needsUpdate = col.needsUpdate = true;
    g.instanceCount = halos.length;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.mat.dispose();
  }
}
