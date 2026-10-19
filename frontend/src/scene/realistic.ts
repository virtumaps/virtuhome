// The realistic look, for capable devices: textured physically based materials, light from the
// sky (an environment map) and the sun (with soft shadows, placed where the real sun is), lamps
// that still light only their own room, tone mapping, and on Ultra ambient occlusion and bloom.
// The weather shows too: clouds soften and dim the sun, fog closes in, rain wets and snow covers
// what is outside, and rain or snow falls around the house. Loaded on demand: tablets never
// download it.
import {
  ACESFilmicToneMapping, Box3, BufferGeometry, CanvasTexture, Color, DirectionalLight, DoubleSide, Fog,
  HalfFloatType, Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshStandardMaterial, NoBlending,
  Object3D, PCFShadowMap, PMREMGenerator, SRGBColorSpace, Vector2, Vector3, WebGLRenderTarget,
  type Material, type PerspectiveCamera, type Scene, type Texture, type WebGLProgramParametersWithUniforms, type WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { finishFor } from "./finishes";
import type { Geo } from "./geo";
import { FRAG_BODY, FRAG_HEAD, VERT_BODY, VERT_HEAD, type FloorUniforms } from "./materials";
import { bake, disposeTextures, isDetail } from "./textures";
import { kelvinToRgb } from "./lighting";
import { WeatherFx, type FxArea } from "./weather-fx";
import { quietSky, type Sky } from "../live/sky";

interface SurfaceSpec {
  tex?: string;
  /** Metres per texture tile. */
  scale?: number;
  rough: number;
  metal?: number;
  relief?: number;
  /** Opacity of see-through surfaces. */
  opacity?: number;
}

const ROLE_SPECS: Record<string, SurfaceSpec> = {
  wood: { tex: "wood_grain", scale: 0.9, rough: 0.5, relief: 0.25 },
  woodDark: { tex: "wood_grain", scale: 0.9, rough: 0.45, relief: 0.25 },
  white: { rough: 0.45 },
  dark: { rough: 0.45 },
  metal: { tex: "brushed", scale: 0.5, rough: 0.3, metal: 0.85 },
  glass: { rough: 0.04, opacity: 0.28 },
  plant: { tex: "foliage", scale: 0.35, rough: 0.65, relief: 0.8 },
  leaf: { tex: "foliage", scale: 0.3, rough: 0.6, relief: 0.8 },
  pot: { tex: "plaster", scale: 0.5, rough: 0.8, relief: 0.3 },
  soil: { tex: "carpet", scale: 0.3, rough: 1 },
  accent: { rough: 0.45 },
  red: { rough: 0.5 },
  blue: { rough: 0.5 },
  screen: { rough: 0.12, metal: 0.2 },
  ceramic: { rough: 0.1 },
  rug: { tex: "rug", scale: 1.2, rough: 0.95, relief: 0.3 },
  mattress: { tex: "weave", scale: 0.3, rough: 0.9, relief: 0.2 },
  bulb: { rough: 0.55 },
  paper: { rough: 0.85 },
  canvas: { tex: "canvas_art", scale: 1.0, rough: 0.85, relief: 0.2 },
  mirror: { rough: 0.02, metal: 1 },
  water: { rough: 0.03, opacity: 0.8 },
  rubber: { rough: 0.85 },
  pine: { tex: "wood_grain_v", scale: 0.6, rough: 0.5, relief: 0.2 },
  softwood: { tex: "wood_grain_v", scale: 0.6, rough: 0.7, relief: 0.15 },
  oak: { tex: "wood_grain_v", scale: 0.6, rough: 0.5, relief: 0.2 },
  walnut: { tex: "wood_grain_v", scale: 0.6, rough: 0.45, relief: 0.2 },
  primed: { rough: 0.85 },
  blackMetal: { rough: 0.4, metal: 0.6 },
  concrete: { tex: "concrete", scale: 0.8, rough: 0.9, relief: 0.25 },
  brick: { tex: "brick_red", scale: 1.35, rough: 0.85, relief: 0.9 },
};

const OTHER_SPECS: Record<string, SurfaceSpec> = {
  cap: { rough: 0.9 },
  slab: { tex: "concrete", scale: 3, rough: 0.9, relief: 0.2 },
  blind: { tex: "linen", scale: 0.3, rough: 0.9, relief: 0.2 },
  glass: { rough: 0.04, opacity: 0.3 },
  pv: { rough: 0.38, metal: 0.05 },
};

const OUTDOOR_SPECS: Record<string, SurfaceSpec> = {
  lawn: { tex: "grass", scale: 2.0, rough: 0.95, relief: 0.4 },
  patio: { tex: "patio", scale: 1.2, rough: 0.8, relief: 0.6 },
  deck: { tex: "deck", scale: 1.2, rough: 0.7, relief: 0.6 },
  path: { tex: "pavers", scale: 1.0, rough: 0.8, relief: 0.6 },
  driveway: { tex: "block_paving", scale: 1.6, rough: 0.8, relief: 0.6 },
  asphalt: { tex: "tarmac", scale: 2.5, rough: 0.85, relief: 0.35 },
  bed: { tex: "soil", scale: 1.5, rough: 1, relief: 0.6 },
  gravel: { tex: "gravel", scale: 1.0, rough: 0.9, relief: 0.9 },
};

/** What a surface key ("floor:oak", "role:metal", "out:lawn", "cap") is made of. */
function specFor(key: string): SurfaceSpec {
  const [group, name] = key.split(":");
  const fin = finishFor(key);
  if (fin) return { tex: fin.tex, scale: fin.scale, rough: fin.roughness, metal: fin.metalness, relief: fin.relief };
  if (group === "role") return ROLE_SPECS[name] ?? { rough: 0.6 };
  if (group === "out") return OUTDOOR_SPECS[name] ?? OUTDOOR_SPECS.lawn;
  return OTHER_SPECS[group] ?? { rough: 0.6 };
}

/** Surfaces whose texture carries the colour (vertex colours then only darken corners). */
export function fullColour(key: string): boolean {
  const s = specFor(key);
  return !!s.tex && !isDetail(s.tex);
}

const LAMP_GAIN = { value: 1.0 };
/** The weather on what is outside: wet (darker, glossy) and snow on what faces up; plants in the wind. */
const WEATHER = {
  /** Rooms keep more of the sky's light than the garden (the light bounces around inside them). */
  uFill: { value: 1 },
  uWet: { value: 0 },
  uSnow: { value: 0 },
  uTime: { value: 0 },
  uSway: { value: new Vector2() },
};

const STD_VERT_HEAD = VERT_HEAD + /* glsl */ `
attribute vec3 aLamp;
attribute vec3 aEmis;
uniform float uIndoor;
uniform float uTime;
uniform vec2 uSway;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`;
const STD_VERT_BODY = VERT_BODY + /* glsl */ `
vLamp = aLamp;
vEmis = aEmis;
// outside: the garden's areas (numbered after the rooms), and the outer faces of the walls
vOut = (aRoom < -0.5 && aRoom > -1.5) || aRoom > uIndoor - 0.5 ? 1.0 : 0.0;
vUp = normalize(mat3(modelMatrix) * objectNormal).y;
#ifdef VH_SWAY
float vhH = max(0.0, transformed.y - uFloorY);
float vhP = uTime * 1.7 + transformed.x * 0.8 + transformed.z * 0.6;
transformed.xz += uSway * (0.55 + 0.35 * sin(vhP) + 0.15 * sin(vhP * 2.3)) * vhH * vOut;
#endif
`;
const STD_FRAG_HEAD = FRAG_HEAD + /* glsl */ `
uniform float uLampGain;
uniform float uFill;
uniform float uWet;
uniform float uSnow;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`;
const WEATHER_COLOR = /* glsl */ `
float vhFaceUp = smoothstep(0.5, 0.9, vUp);
float vhWet = uWet * vOut * (0.35 + 0.65 * vhFaceUp);
float vhSnow = uSnow * vOut * vhFaceUp;
diffuseColor.rgb *= 1.0 - 0.3 * vhWet;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), vhSnow * 0.94);
`;
const WEATHER_ROUGH = /* glsl */ `
roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.16), vhWet * vhFaceUp * (1.0 - vhSnow));
roughnessFactor = mix(roughnessFactor, 0.85, vhSnow);
`;

function injectStandard(mat: MeshStandardMaterial, u: FloorUniforms, key: string): void {
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, u, WEATHER, { uLampGain: LAMP_GAIN });
    shader.vertexShader = STD_VERT_HEAD + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n" + STD_VERT_BODY);
    shader.fragmentShader = STD_FRAG_HEAD + shader.fragmentShader
      .replace("#include <color_fragment>", "#include <color_fragment>\n" + FRAG_BODY + WEATHER_COLOR)
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n" + WEATHER_ROUGH)
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vEmis;")
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\nreflectedLight.indirectDiffuse *= mix(uFill, 1.0, vOut);\nreflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;");
  };
  mat.customProgramCacheKey = () => key;
}

/** Plants and leaves move in the wind (outside). */
const SWAYS = new Set(["role:plant", "role:leaf"]);

/** Only the cutaway (the normal pass must see lowered walls as lowered). */
function injectCut<T extends Material>(mat: T, u: FloorUniforms, key: string): T {
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = VERT_HEAD + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n" + VERT_BODY);
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

/** A vertical gradient for the sky behind the house (redrawn into the same canvas as the sky changes). */
function skyTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function paintSky(t: CanvasTexture, top: Color, bottom: Color): void {
  const c = t.image as HTMLCanvasElement;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, `#${top.getHexString()}`);
  g.addColorStop(1, `#${bottom.getHexString()}`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  t.needsUpdate = true;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mixHex = (a: number, b: number, t: number) => new Color(a).lerp(new Color(b), Math.max(0, Math.min(1, t)));

/** Where the light comes from when the look doesn't match the sky (the day look at night): front left, high. */
const STUDIO = new Vector3(-0.45, 0.78, 0.45).normalize();

/** A direction to the sky from an azimuth (clockwise from north) and an elevation, on a plan turned by `north`. */
export function skyDirection(azimuth: number, elevation: number, north: number): Vector3 {
  const b = ((azimuth - north) * Math.PI) / 180;
  const el = (elevation * Math.PI) / 180;
  return new Vector3(Math.sin(b) * Math.cos(el), Math.sin(el), -Math.cos(b) * Math.cos(el)).normalize();
}

/** prefers-reduced-motion: no lightning, and the rain and plants hold still. */
function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

interface Registered {
  mesh: Mesh;
  normal: Material;
}

export class RealisticLook {
  readonly ultra: boolean;
  readonly groundMaterial = new MeshStandardMaterial({ color: 0xc9d1c2, roughness: 1 });
  /** Drawn into the shadows only: the ceilings and the storeys hidden above (see the viewer). */
  readonly castOnly = new MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: DoubleSide });
  private sun = new DirectionalLight(0xfff1dc, 2.6);
  private envTex: Texture;
  private skyTex = skyTexture();
  private skyPainted = "";
  private materialsByFloor = new Map<FloorUniforms, Map<string, Material>>();
  private registered = new Map<Mesh, Registered>();
  private fx: WeatherFx;
  private sky: Sky | null = null;
  private north = 0;
  /** Lightning: when the next flash comes, and the one going on. */
  private nextFlash = 0;
  private flash: { start: number } | null = null;
  private envBase = 0.55;
  /** How thick the air is: fog, and the gloom of heavy weather. */
  private haze = { fog: 0, gloom: 0 };
  private calm = reducedMotion();
  /** Rain or snow is falling (the view keeps drawing). */
  private falling = false;
  private composer: EffectComposer | null = null;
  private gtao: GTAOPass | null = null;
  private bloom: UnrealBloomPass | null = null;
  private normalTarget: WebGLRenderTarget | null = null;
  private sunDir = STUDIO.clone();
  private centre = new Vector3();
  private radius = 10;
  /** What casts shadows (the house, stacked as shown) and the ground's level. */
  private box = new Box3(new Vector3(-5, 0, -5), new Vector3(5, 3, 5));
  private groundY = 0;
  private night = false;
  private texSize: number;
  private aniso: number;

  constructor(private renderer: WebGLRenderer, private scene: Scene, private camera: PerspectiveCamera, ultra: boolean) {
    this.ultra = ultra;
    this.texSize = ultra ? 1024 : 512;
    this.aniso = Math.min(ultra ? 16 : 8, renderer.capabilities.getMaxAnisotropy());
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    const pmrem = new PMREMGenerator(renderer);
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = this.envTex;
    this.sun.castShadow = true;
    const size = ultra ? 4096 : 2048;
    this.sun.shadow.mapSize.set(size, size);
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.025;
    this.sun.shadow.radius = 3;
    scene.add(this.sun, this.sun.target);
    this.groundMaterial.envMapIntensity = 0.8;
    this.fx = new WeatherFx(ultra);
    scene.add(this.fx.group);
    scene.background = this.skyTex;
    if (ultra) this.setupComposer();
    this.setNight(false);
  }

  // ------------------------------------------------------------------ materials and meshes

  /** Geometry with texture coordinates, normals and one group per surface. */
  geometry(geo: Geo): BufferGeometry {
    const full = geo.surfaces.map((k) => fullColour(k));
    return geo.toRealisticGeometry((m) => full[m] ?? false);
  }

  /** One material per surface of a mesh (shared within a floor, so rebuilding doors is cheap). */
  materials(geo: Geo, u: FloorUniforms): Material[] {
    let cache = this.materialsByFloor.get(u);
    if (!cache) {
      cache = new Map();
      this.materialsByFloor.set(u, cache);
    }
    return geo.surfaces.map((key) => {
      let m = cache!.get(key);
      if (!m) {
        m = this.makeMaterial(key, u);
        cache!.set(key, m);
      }
      return m;
    });
  }

  private makeMaterial(key: string, u: FloorUniforms): Material {
    const spec = specFor(key);
    const mat = new MeshStandardMaterial({ vertexColors: true, roughness: spec.rough, metalness: spec.metal ?? 0 });
    if (spec.tex) {
      const pair = bake(spec.tex, this.texSize, this.aniso);
      if (pair) {
        const rep = 1 / (spec.scale ?? 1);
        mat.map = pair.map.clone();
        mat.map.repeat.set(rep, rep);
        if (pair.normal && (spec.relief ?? 0) > 0) {
          mat.normalMap = pair.normal.clone();
          mat.normalMap.repeat.set(rep, rep);
          mat.normalScale.set(spec.relief!, -spec.relief!);
        }
      }
    }
    if (spec.opacity !== undefined) {
      mat.transparent = true;
      mat.opacity = spec.opacity;
      mat.depthWrite = false;
    }
    if (key === "glass") {
      mat.side = DoubleSide;
      mat.forceSinglePass = true;
    }
    const sway = SWAYS.has(key);
    if (sway) mat.defines = { VH_SWAY: 1 };
    injectStandard(mat, u, sway ? "vh-std-sway" : "vh-std");
    return mat;
  }

  glassMaterial(geo: Geo, u: FloorUniforms): Material {
    return this.materials(geo, u)[0];
  }

  /**
   * Shadows and the ambient occlusion pass for a mesh of a floor. The sun sees every wall at its full
   * height, cut away or not: the light comes into a room through its windows and open doors, as it
   * does in the real house.
   */
  attach(mesh: Mesh, u: FloorUniforms, cast: boolean): void {
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    if (this.ultra) {
      const normal = injectCut(new MeshNormalMaterial(), u, "vh-normal");
      normal.blending = NoBlending;
      this.registered.set(mesh, { mesh, normal });
    }
    this.markShadows();
  }

  /** The ground takes shadows and joins the ambient occlusion pass. */
  attachGround(mesh: Mesh): void {
    mesh.receiveShadow = true;
    if (this.ultra) {
      const normal = new MeshNormalMaterial();
      normal.blending = NoBlending;
      this.registered.set(mesh, { mesh, normal });
    }
  }

  detach(mesh: Mesh): void {
    const r = this.registered.get(mesh);
    if (r) {
      r.normal.dispose();
      this.registered.delete(mesh);
    }
  }

  /** Frees a floor's materials (when it is rebuilt or removed). */
  releaseFloor(u: FloorUniforms): void {
    for (const m of this.materialsByFloor.get(u)?.values() ?? []) {
      const s = m as MeshStandardMaterial;
      s.map?.dispose();
      s.normalMap?.dispose();
      m.dispose();
    }
    this.materialsByFloor.delete(u);
  }

  // ------------------------------------------------------------------ light

  setNight(night: boolean): void {
    this.night = night;
    LAMP_GAIN.value = night ? 0.5 : 0.28;
    if (this.bloom) this.bloom.strength = night ? 0.32 : 0.12;
    this.applySky();
  }

  /** The old way in: just where the sun is (azimuth clockwise from north, elevation in degrees). */
  setSun(azimuth: number | null, elevation: number | null, north: number): void {
    this.setSky({ ...(this.sky ?? quietSky()), sun: azimuth === null || elevation === null ? null : { azimuth, elevation } }, north);
  }

  /** The sky over the house: the sun or moon where they are, and the weather. `north`: see PlanSettings. */
  setSky(sky: Sky, north: number): void {
    this.sky = sky;
    this.north = north;
    this.applySky();
  }

  /**
   * Light, sky and weather from the sky and the look. The light follows the real sun (or moon) when
   * the look matches the sky; the day look at night (picked by hand) keeps a studio sun instead.
   */
  private applySky(): void {
    const sky = this.sky;
    const night = this.night;
    const cloud = sky?.cloud ?? 0.2;
    const rain = sky?.rain ?? 0;
    const snow = sky?.snow ?? 0;
    const fog = sky?.fog ?? 0;
    const storm = !!sky?.storm;
    // how much heavy weather darkens the day
    const gloom = Math.max(rain * 0.65, storm ? 0.6 : 0, snow * 0.25, fog * 0.2);
    const sun = sky?.sun ?? null;
    const shadow = this.sun.shadow;
    let el = 40;
    if (!night) {
      const real = !!sun && sun.elevation > -1;
      el = real ? sun!.elevation : 40;
      this.sunDir.copy(real ? skyDirection(sun!.azimuth, Math.max(0.5, el), this.north) : STUDIO);
      // a low sun is weaker and redder; clouds take most of it and soften the shadows
      const strength = smooth(-1, 3, el) * (0.35 + 0.65 * smooth(2, 30, el));
      this.sun.intensity = 3.2 * strength * (1 - 0.9 * cloud) * (1 - 0.3 * gloom);
      const warm = new Color().setRGB(...kelvinToRgb(2300 + 3300 * smooth(1, 28, el)));
      this.sun.color.copy(warm.lerp(new Color(0xf4f6fa), cloud * 0.8));
      shadow.intensity = Math.max(0.06, 1 - 0.9 * cloud);
      shadow.radius = 3 + 7 * cloud;
      // the sky's own light: less at dawn and dusk, a bit more of it (relatively) under cloud
      // clear sun against a weaker sky, so shadows read outside; under cloud the sky carries the light
      this.envBase = (0.25 + 0.4 * cloud) * (0.6 + 0.4 * smooth(-1, 12, el)) * (1 - 0.32 * gloom);
      WEATHER.uFill.value = 1 + 0.75 * (1 - cloud);
    } else {
      // by night the moon lights the outside faintly blue (a light from the front left when it's down)
      const moon = sky?.moon ?? null;
      const up = !!moon && moon.elevation > 2;
      this.sunDir.copy(up ? skyDirection(moon!.azimuth, moon!.elevation, this.north) : STUDIO);
      this.sun.intensity = (up ? 0.38 * (0.3 + 0.7 * moon!.lit) : 0.2) * (1 - 0.7 * cloud);
      this.sun.color.setHex(0x8ea6ff);
      shadow.intensity = (up ? 0.65 : 0.3) * (1 - 0.8 * cloud);
      shadow.radius = 4 + 6 * cloud;
      // a cloudy town sky gives back a little light
      this.envBase = 0.05 + 0.025 * cloud;
      WEATHER.uFill.value = 1;
    }
    this.scene.environmentIntensity = this.envBase;
    this.renderer.toneMappingExposure = 1.0;
    this.paintSky(el, cloud, gloom, fog);
    this.ground(sky);
    WEATHER.uWet.value = sky?.wet ?? 0;
    WEATHER.uSnow.value = sky?.snowCover ?? 0;
    this.placeSun();
  }

  /** The sky's gradient and the fog (in the sky's colour near the horizon). */
  private paintSky(el: number, cloud: number, gloom: number, fog: number): void {
    let top: Color, bottom: Color;
    if (this.night) {
      top = mixHex(0x060a16, 0x10141e, cloud);
      bottom = mixHex(0x18213a, 0x262b36, cloud);
    } else {
      top = mixHex(0xb9d0e8, 0xb2bac3, cloud).lerp(new Color(0x666e78), gloom);
      bottom = mixHex(0xeef2f4, 0xdadee2, cloud).lerp(new Color(0xa4aab1), gloom);
      // golden light low in a clear sky; a darker top as the sun goes down
      const low = 1 - smooth(1, 12, el);
      bottom.lerp(new Color(0xf5cfa4), low * (1 - cloud) * 0.75);
      top.lerp(new Color(0x7189b3), (1 - smooth(-1, 6, el)) * 0.5);
    }
    if (fog > 0) {
      const f = new Color(this.night ? 0x2a2f3a : 0xd5d9dc);
      top.lerp(f, fog * 0.85);
      bottom.lerp(f, fog);
    }
    const key = top.getHexString() + bottom.getHexString();
    if (key !== this.skyPainted) {
      this.skyPainted = key;
      paintSky(this.skyTex, top, bottom);
    }
    this.haze = { fog, gloom };
    const f = this.scene.fog as Fog | null;
    if (f) f.color.copy(bottom);
    else this.scene.fog = new Fog(bottom.getHex(), 1, 2);
    this.placeFog();
  }

  /**
   * The fog starts behind the house and closes in on it with the weather: measured from the camera,
   * so zooming in or out keeps the house in view (greyer in thick fog) and the garden fading away.
   */
  private placeFog(): void {
    const f = this.scene.fog as Fog | null;
    if (!f) return;
    const r = this.radius;
    const d = this.camera.position.distanceTo(this.centre);
    const { fog, gloom } = this.haze;
    f.near = Math.max(0.5, d + r * (1.5 - 1.9 * fog) * (1 - 0.3 * gloom));
    f.far = d + r * (5 - 3.6 * fog) * (1 - 0.25 * gloom);
  }

  /** The ground around the house: darker and glossier when wet, white under snow. */
  private ground(sky: Sky | null): void {
    const base = new Color(this.night ? 0x2a3326 : 0xc6cfbd);
    const wet = sky?.wet ?? 0;
    const snow = sky?.snowCover ?? 0;
    base.multiplyScalar(1 - 0.25 * wet).lerp(new Color(this.night ? 0x7d8796 : 0xeef2f6), snow);
    this.groundMaterial.color.copy(base);
    this.groundMaterial.roughness = snow > 0.5 ? 0.9 : 1 - 0.45 * wet;
  }

  /**
   * Fits the sun's shadow to what casts shadows (`box`, the house as stacked now with its garden)
   * and lays the fog around it; `ground` is the ground's level.
   */
  fit(box: Box3, ground: number): void {
    this.box.copy(box);
    this.groundY = ground;
    box.getCenter(this.centre);
    const size = box.getSize(new Vector3());
    this.radius = Math.max(6, Math.hypot(size.x, size.z) / 2);
    this.applySky();
  }

  /**
   * The shadow camera looks along the sunlight at just what casts shadows: seen from the sun, a long
   * low-sun shadow lies behind what casts it, so the map covers the house's outline as the sun sees
   * it, and its depth reaches the ground where the longest shadow ends.
   */
  private placeSun(): void {
    const dir = this.sunDir;
    const span = this.box.getSize(new Vector3()).length();
    this.sun.target.position.copy(this.centre);
    this.sun.position.copy(this.centre).addScaledVector(dir, span + 20);
    this.sun.target.updateMatrixWorld();
    this.sun.updateMatrixWorld();
    const cam = this.sun.shadow.camera;
    cam.position.copy(this.sun.position);
    cam.lookAt(this.centre);
    cam.updateMatrixWorld();
    const view = cam.matrixWorldInverse;
    const b = this.box;
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    const v = new Vector3();
    const add = (p: Vector3) => {
      v.copy(p).applyMatrix4(view);
      minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
      minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
    };
    const reach = dir.y > 0.01 ? 1 / dir.y : 100;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
      const p = new Vector3(x, y, z);
      add(p);
      // where its shadow meets the ground (at most 150 m away)
      add(p.addScaledVector(dir, -Math.min(150, Math.max(0, y - this.groundY) * reach)));
    }
    const pad = 0.6;
    cam.left = minX - pad;
    cam.right = maxX + pad;
    cam.bottom = minY - pad;
    cam.top = maxY + pad;
    cam.near = Math.max(0.1, -maxZ - 2);
    cam.far = -minZ + 2;
    cam.updateProjectionMatrix();
    this.markShadows();
  }

  /** Where rain may fall (around the house, not inside it). */
  setWeatherArea(area: FxArea): void {
    this.fx.setArea(area);
    this.applyFx();
  }

  /** Rain and snow falling, and the plants' sway: in plan space, from the wind's bearing. */
  private applyFx(): void {
    const sky = this.sky;
    if (!sky) {
      this.falling = this.fx.set({ rain: 0, snow: 0, drift: [0, 0], night: this.night });
      return;
    }
    // the wind blows towards the opposite of where it comes from
    const b = ((sky.windFrom + 180 - this.north) * Math.PI) / 180;
    const drift: [number, number] = [Math.sin(b) * sky.wind, -Math.cos(b) * sky.wind];
    // plants lean a few centimetres per metre of height in a strong wind
    const lean = this.calm ? 0 : Math.min(1, Math.max(0, (sky.wind - 4) / 10)) * 0.05;
    WEATHER.uSway.value.set(Math.sin(b) * lean, -Math.cos(b) * lean);
    this.falling = this.fx.set({ rain: sky.rain, snow: sky.snow, drift, night: this.night });
  }

  /**
   * Moves the weather to this moment (ms). Returns in how many milliseconds it wants the next frame
   * (0: none): every frame while rain or snow falls, plants sway in a strong wind or lightning
   * flashes, and at the next flash during a storm.
   */
  animate(now: number): number {
    if (this.calm) return 0;
    const sky = this.sky;
    const windy = !!sky && sky.wind > 6;
    WEATHER.uTime.value = now / 1000;
    if (this.falling) {
      const size = this.renderer.getDrawingBufferSize(new Vector2());
      this.fx.tick(now / 1000, size.y / (2 * Math.tan((this.camera.fov * Math.PI) / 360)));
    }
    let flashing = false;
    if (sky?.storm) {
      if (!this.nextFlash) this.nextFlash = now + 3000 + Math.random() * 7000;
      if (!this.flash && now >= this.nextFlash) this.flash = { start: now };
      if (this.flash) {
        // two quick pulses that die away in under half a second
        const t = (now - this.flash.start) / 1000;
        const f = t < 0.08 ? t / 0.08 : t < 0.16 ? 1 - (t - 0.08) / 0.16 : t < 0.22 ? 0.5 + (t - 0.16) / 0.12 : Math.max(0, 1 - (t - 0.22) / 0.25);
        if (t > 0.5) this.endFlash(now + 10_000 + Math.random() * 30_000);
        else {
          this.scene.environmentIntensity = this.envBase + (this.night ? 0.5 : 0.9) * f;
          this.scene.backgroundIntensity = 1 + 0.6 * f;
          flashing = true;
        }
      }
    } else if (this.flash || this.nextFlash) this.endFlash(0);
    if (this.falling || windy || flashing) return 33;
    return sky?.storm ? Math.max(33, this.nextFlash - now) : 0;
  }

  private endFlash(next: number): void {
    this.flash = null;
    this.nextFlash = next;
    this.scene.environmentIntensity = this.envBase;
    this.scene.backgroundIntensity = 1;
  }

  /** The shadow map is redrawn only when something in the scene moved, not when the camera did. */
  markShadows(): void {
    this.renderer.shadowMap.needsUpdate = true;
  }

  // ------------------------------------------------------------------ frames

  private setupComposer(): void {
    const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // the pass would draw its own normals with every wall at full height: we draw them instead,
    // into its target (handing it a separate buffer trips over a bug in three r186)
    this.gtao = new GTAOPass(this.scene, this.camera, 1, 1);
    (this.gtao as unknown as { _renderGBuffer: boolean })._renderGBuffer = false;
    this.normalTarget = (this.gtao as unknown as { normalRenderTarget: WebGLRenderTarget }).normalRenderTarget;
    this.gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.6, thickness: 1.2, scale: 1.0, samples: 12 });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, rings: 2, samples: 12 });
    this.gtao.blendIntensity = 0.85;
    this.composer.addPass(this.gtao);
    this.bloom = new UnrealBloomPass(new Vector2(1, 1), 0.12, 0.35, 0.98);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  setSize(w: number, h: number, pr: number): void {
    if (!this.composer) return;
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    // ambient occlusion is soft anyway: half the resolution costs a quarter and looks the same
    this.gtao?.setSize(Math.max(1, Math.round((w * pr) / 2)), Math.max(1, Math.round((h * pr) / 2)));
  }

  render(): void {
    this.placeFog();
    if (!this.composer) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.renderNormals();
    this.composer.render();
  }

  /** Normals and depth for ambient occlusion, with walls lowered the way the cutaway shows them. */
  private renderNormals(): void {
    const hidden: Object3D[] = [];
    const swapped: [Mesh, Material | Material[]][] = [];
    this.scene.traverseVisible((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const r = this.registered.get(m);
      if (r) {
        swapped.push([m, m.material]);
        m.material = r.normal;
      } else hidden.push(o);
    });
    for (const o of hidden) o.visible = false;
    const bg = this.scene.background;
    const fog = this.scene.fog;
    this.scene.background = null;
    this.scene.fog = null;
    const shadowAuto = this.renderer.shadowMap.enabled;
    this.renderer.shadowMap.enabled = false;
    const prevTarget = this.renderer.getRenderTarget();
    const clear = new Color();
    this.renderer.getClearColor(clear);
    const alpha = this.renderer.getClearAlpha();
    this.renderer.setRenderTarget(this.normalTarget);
    this.renderer.setClearColor(0x7777ff, 1);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(prevTarget);
    this.renderer.setClearColor(clear, alpha);
    this.renderer.shadowMap.enabled = shadowAuto;
    this.scene.background = bg;
    this.scene.fog = fog;
    for (const o of hidden) o.visible = true;
    for (const [m, mat] of swapped) m.material = mat;
  }

  dispose(): void {
    for (const u of [...this.materialsByFloor.keys()]) this.releaseFloor(u);
    for (const r of this.registered.values()) r.normal.dispose();
    this.registered.clear();
    this.scene.remove(this.sun, this.sun.target);
    this.sun.dispose();
    this.envTex.dispose();
    this.skyTex.dispose();
    this.groundMaterial.dispose();
    this.castOnly.dispose();
    this.scene.remove(this.fx.group);
    this.fx.dispose();
    this.scene.environment = null;
    this.scene.fog = null;
    this.composer?.dispose();
    this.gtao?.dispose();
    this.bloom?.dispose();
    disposeTextures();
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = 0;
  }
}
