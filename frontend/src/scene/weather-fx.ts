// Rain and snow falling around the house (the realistic look only). Each drop or flake is set up
// once in a column outside the house and moved by the GPU alone: a frame costs one draw call each,
// whatever the weather. The house keeps dry: no column stands over a room, wherever the wind blows.
import { BufferAttribute, BufferGeometry, Color, Group, LineSegments, NormalBlending, Points, ShaderMaterial, Vector2 } from "three";
import { pointInPolygon, segmentDistance } from "../model/geom";
import type { Vec2 } from "../model/plan";

export interface FxArea {
  /** Rooms of every storey (no drop falls inside them). */
  rooms: Vec2[][];
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  /** Ground level and the top of the house. */
  ground: number;
  top: number;
}

export interface FxWeather {
  rain: number;
  snow: number;
  /** Where the drops drift to (plan x and z, m/s). */
  drift: [number, number];
  /** 0 by day .. 1 at night (drops and flakes catch less light). */
  dark: number;
}

const RAIN_VERT = /* glsl */ `
uniform float uTime;
uniform float uTop;
uniform float uHeight;
uniform float uFall;
uniform float uLen;
uniform vec2 uWind;
attribute vec4 aSeed;
varying float vAlpha;
void main() {
  float s = fract(aSeed.z + uTime * uFall / uHeight);
  float t = s * uHeight / uFall - 0.5 * uHeight / uFall;
  float e = aSeed.w;
  vec2 xz = aSeed.xy + uWind * t - e * uWind * (uLen / uFall);
  float y = uTop - s * uHeight + e * uLen;
  // fade in at the top and out near the ground
  vAlpha = (1.0 - 0.75 * e) * smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.92, 1.0, s));
  gl_Position = projectionMatrix * viewMatrix * vec4(xz.x, y, xz.y, 1.0);
}`;

const SNOW_VERT = /* glsl */ `
uniform float uTime;
uniform float uTop;
uniform float uHeight;
uniform float uFall;
uniform float uSize;
uniform float uScale;
uniform vec2 uWind;
attribute vec4 aSeed;
varying float vAlpha;
void main() {
  float s = fract(aSeed.z + uTime * uFall / uHeight);
  float t = s * uHeight / uFall - 0.5 * uHeight / uFall;
  float k = aSeed.z * 40.0;
  vec2 wobble = vec2(sin(uTime * 1.3 + k), cos(uTime * 1.1 + k * 0.77)) * 0.22;
  vec2 xz = aSeed.xy + uWind * t + wobble;
  vec4 mv = viewMatrix * vec4(xz.x, uTop - s * uHeight, xz.y, 1.0);
  vAlpha = smoothstep(0.0, 0.06, s) * (1.0 - smoothstep(0.94, 1.0, s));
  gl_PointSize = max(1.0, uSize * aSeed.w * uScale / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const LINE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha * vAlpha); }`;

const FLAKE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1.0 - d * 3.2));
}`;

const NIGHT_RAIN = new Color(0x7d8ba0);
const NIGHT_SNOW = new Color(0xc9d3e6);

function material(vert: string, frag: string, u: Record<string, { value: unknown }>): ShaderMaterial {
  return new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: u, transparent: true, depthWrite: false, blending: NormalBlending, fog: false });
}

export class WeatherFx {
  readonly group = new Group();
  private rain: LineSegments;
  private snow: Points;
  private shared = {
    uTime: { value: 0 },
    uTop: { value: 10 },
    uHeight: { value: 12 },
    uWind: { value: new Vector2() },
  };
  private rainU = { ...this.shared, uFall: { value: 8 }, uLen: { value: 0.42 }, uColor: { value: new Color(0xb8c4d2) }, uAlpha: { value: 0.32 } };
  private snowU = { ...this.shared, uFall: { value: 0.9 }, uSize: { value: 0.045 }, uScale: { value: 800 }, uColor: { value: new Color(0xffffff) }, uAlpha: { value: 0.9 } };
  private area: FxArea | null = null;
  private key = "";
  private rainMax: number;
  private snowMax: number;

  constructor(ultra: boolean) {
    this.rainMax = ultra ? 9000 : 4500;
    this.snowMax = ultra ? 7000 : 3500;
    this.rain = new LineSegments(new BufferGeometry(), material(RAIN_VERT, LINE_FRAG, this.rainU));
    this.snow = new Points(new BufferGeometry(), material(SNOW_VERT, FLAKE_FRAG, this.snowU));
    for (const o of [this.rain, this.snow]) {
      o.frustumCulled = false;
      o.renderOrder = 4;
      o.visible = false;
    }
    this.group.add(this.rain, this.snow);
  }

  /** Where it may rain: around the house as it stands now. */
  setArea(area: FxArea): void {
    this.area = area;
    this.key = "";
  }

  /** Shows the weather; true while anything falls (the view keeps drawing then). */
  set(w: FxWeather): boolean {
    const a = this.area;
    const falling = !!a && (w.rain > 0.02 || w.snow > 0.02);
    this.rain.visible = !!a && w.rain > 0.02;
    this.snow.visible = !!a && w.snow > 0.02;
    if (!a || !falling) return false;
    this.shared.uTop.value = a.top;
    this.shared.uHeight.value = a.top - a.ground;
    // a drop drifts with the wind while it falls; snow drifts with nearly all of it
    const k = this.rain.visible ? 0.55 : 0.9;
    this.shared.uWind.value.set(w.drift[0] * k, w.drift[1] * k);
    this.rainU.uColor.value.setHex(0xb8c4d2).lerp(NIGHT_RAIN, w.dark);
    this.rainU.uAlpha.value = 0.45 - 0.13 * w.dark;
    this.snowU.uColor.value.setHex(0xffffff).lerp(NIGHT_SNOW, w.dark);
    // the columns depend on the house and on how far the wind blows the drops sideways
    const key = [a.minX, a.maxX, a.minZ, a.maxZ, a.top, a.ground, a.rooms.length, Math.round(w.drift[0]), Math.round(w.drift[1])].map((v) => Number(v).toFixed(1)).join("|");
    if (key !== this.key) {
      this.key = key;
      this.build(a);
    }
    this.rain.geometry.setDrawRange(0, Math.round(this.rainMax * Math.min(1, w.rain)) * 2);
    this.snow.geometry.setDrawRange(0, Math.round(this.snowMax * Math.min(1, w.snow)));
    return true;
  }

  /** Moves everything to this moment (seconds); `scale` turns flake sizes into pixels. */
  tick(seconds: number, scale: number): void {
    this.shared.uTime.value = seconds;
    this.snowU.uScale.value = scale;
  }

  private build(a: FxArea): void {
    const h = a.top - a.ground;
    const wind = this.shared.uWind.value;
    // how far the wind carries a drop from the middle of its fall to its top and bottom
    const spans = [this.rainU.uFall.value, this.snowU.uFall.value].map((fall) => [wind.x * (h / fall / 2), wind.y * (h / fall / 2)]);
    const dry = (x: number, z: number, span: number[]) => {
      for (const s of [-1, 0, 1]) {
        const p: Vec2 = [x + span[0] * s, z + span[1] * s];
        if (a.rooms.some((r) => pointInPolygon(p, r) || r.some((q, i) => segmentDistance(p, q, r[(i + 1) % r.length]).d < 0.35))) return false;
      }
      return true;
    };
    const margin = Math.max(6, 0.45 * Math.max(a.maxX - a.minX, a.maxZ - a.minZ));
    const x0 = a.minX - margin, x1 = a.maxX + margin, z0 = a.minZ - margin, z1 = a.maxZ + margin;
    // a fixed pseudo-random sequence: the same house rains the same way every time
    let seed = 12345;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const columns = (n: number, span: number[]) => {
      const out: number[][] = [];
      for (let tries = 0; out.length < n && tries < n * 6; tries++) {
        const x = x0 + rand() * (x1 - x0), z = z0 + rand() * (z1 - z0);
        if (dry(x, z, span)) out.push([x, z, rand(), 0.6 + rand() * 0.8]);
      }
      return out;
    };
    const rain = columns(this.rainMax, spans[0]);
    const seeds = new Float32Array(rain.length * 8);
    rain.forEach((c, i) => {
      seeds.set([c[0], c[1], c[2], 0, c[0], c[1], c[2], 1], i * 8);
    });
    this.replace(this.rain, seeds);
    const snow = columns(this.snowMax, spans[1]);
    this.replace(this.snow, new Float32Array(snow.flat()));
  }

  private replace(o: LineSegments | Points, seeds: Float32Array): void {
    const g = new BufferGeometry();
    g.setAttribute("aSeed", new BufferAttribute(seeds, 4));
    // positions are made in the shader; three.js still wants an attribute to count vertices by
    g.setAttribute("position", new BufferAttribute(new Float32Array((seeds.length / 4) * 3), 3));
    o.geometry.dispose();
    o.geometry = g;
  }

  dispose(): void {
    for (const o of [this.rain, this.snow]) {
      o.geometry.dispose();
      (o.material as ShaderMaterial).dispose();
    }
  }
}
