// The realistic look, for capable devices: textured physically based materials, light from the
// sky (an environment map) and the sun (with soft shadows, placed where the real sun is), lamps
// that still light only their own room, tone mapping, and on Ultra ambient occlusion and bloom.
// Loaded on demand: tablets never download it.
import {
  ACESFilmicToneMapping, BufferGeometry, CanvasTexture, Color, DirectionalLight, DoubleSide, Fog,
  HalfFloatType, Mesh, MeshDepthMaterial, MeshNormalMaterial, MeshStandardMaterial, NoBlending,
  Object3D, PCFShadowMap, PMREMGenerator, RGBADepthPacking, SRGBColorSpace, Vector2, Vector3, WebGLRenderTarget,
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
};

const OTHER_SPECS: Record<string, SurfaceSpec> = {
  cap: { rough: 0.9 },
  slab: { tex: "concrete", scale: 3, rough: 0.9, relief: 0.2 },
  frame: { rough: 0.4 },
  door: { tex: "wood_grain", scale: 1.6, rough: 0.45, relief: 0.1 },
  blind: { tex: "linen", scale: 0.3, rough: 0.9, relief: 0.2 },
  glass: { rough: 0.04, opacity: 0.3 },
};

const OUTDOOR_SPECS: Record<string, SurfaceSpec> = {
  lawn: { tex: "grass", scale: 2.0, rough: 0.95, relief: 0.4 },
  patio: { tex: "patio", scale: 1.2, rough: 0.8, relief: 0.6 },
  deck: { tex: "deck", scale: 1.2, rough: 0.7, relief: 0.6 },
  path: { tex: "pavers", scale: 1.0, rough: 0.8, relief: 0.6 },
  driveway: { tex: "pavers", scale: 1.2, rough: 0.8, relief: 0.6 },
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

const STD_VERT_HEAD = VERT_HEAD + /* glsl */ `
attribute vec3 aLamp;
attribute vec3 aEmis;
varying vec3 vLamp;
varying vec3 vEmis;
`;
const STD_VERT_BODY = VERT_BODY + /* glsl */ `
vLamp = aLamp;
vEmis = aEmis;
`;
const STD_FRAG_HEAD = FRAG_HEAD + /* glsl */ `
uniform float uLampGain;
varying vec3 vLamp;
varying vec3 vEmis;
`;

function injectStandard(mat: MeshStandardMaterial, u: FloorUniforms, key: string): void {
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, u, { uLampGain: LAMP_GAIN });
    shader.vertexShader = STD_VERT_HEAD + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n" + STD_VERT_BODY);
    shader.fragmentShader = STD_FRAG_HEAD + shader.fragmentShader
      .replace("#include <color_fragment>", "#include <color_fragment>\n" + FRAG_BODY)
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vEmis;")
      .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\nreflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;");
  };
  mat.customProgramCacheKey = () => key;
}

/** Only the cutaway (shadow and normal passes must see lowered walls as lowered). */
function injectCut<T extends Material>(mat: T, u: FloorUniforms, key: string): T {
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = VERT_HEAD + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n" + VERT_BODY);
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

/** A vertical gradient for the sky behind the house. */
function skyTexture(top: number, bottom: number): Texture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, `#${top.toString(16).padStart(6, "0")}`);
  g.addColorStop(1, `#${bottom.toString(16).padStart(6, "0")}`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

interface Registered {
  mesh: Mesh;
  normal: Material;
}

export class RealisticLook {
  readonly ultra: boolean;
  readonly groundMaterial = new MeshStandardMaterial({ color: 0xc9d1c2, roughness: 1 });
  private sun = new DirectionalLight(0xfff1dc, 2.6);
  private envTex: Texture;
  private skyDay = skyTexture(0xb9d0e8, 0xeef2f4);
  private skyNight = skyTexture(0x060a16, 0x18213a);
  private materialsByFloor = new Map<FloorUniforms, Map<string, Material>>();
  private depthByFloor = new Map<FloorUniforms, Material>();
  private registered = new Map<Mesh, Registered>();
  private composer: EffectComposer | null = null;
  private gtao: GTAOPass | null = null;
  private bloom: UnrealBloomPass | null = null;
  private normalTarget: WebGLRenderTarget | null = null;
  private sunDir = new Vector3(0.45, 0.75, 0.5).normalize();
  private centre = new Vector3();
  private radius = 10;
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
    injectStandard(mat, u, "vh-std");
    return mat;
  }

  glassMaterial(geo: Geo, u: FloorUniforms): Material {
    return this.materials(geo, u)[0];
  }

  /** Shadows and the ambient occlusion pass for a mesh of a floor. */
  attach(mesh: Mesh, u: FloorUniforms, cast: boolean): void {
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    if (cast) {
      let depth = this.depthByFloor.get(u);
      if (!depth) {
        depth = injectCut(new MeshDepthMaterial({ depthPacking: RGBADepthPacking }), u, "vh-depth");
        this.depthByFloor.set(u, depth);
      }
      mesh.customDepthMaterial = depth;
    }
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
    this.depthByFloor.get(u)?.dispose();
    this.depthByFloor.delete(u);
  }

  // ------------------------------------------------------------------ light

  setNight(night: boolean): void {
    this.night = night;
    this.scene.environmentIntensity = night ? 0.05 : 0.55;
    // by night the same light is a faint blue moon, so the outside of the house still reads
    this.sun.intensity = night ? 0.35 : 2.6;
    this.sun.color.setHex(night ? 0x8ea6ff : 0xfff1dc);
    this.scene.background = night ? this.skyNight : this.skyDay;
    this.renderer.toneMappingExposure = 1.0;
    this.groundMaterial.color.setHex(night ? 0x2a3326 : 0xc6cfbd);
    LAMP_GAIN.value = night ? 0.5 : 0.28;
    if (this.bloom) this.bloom.strength = night ? 0.32 : 0.12;
    this.markShadows();
  }

  /**
   * Puts the sun where it is: azimuth clockwise from north and elevation in degrees; `north` is how
   * far the plan is turned from north. Without a sun entity the light comes from the front left.
   */
  setSun(azimuth: number | null, elevation: number | null, north: number): void {
    if (azimuth === null || elevation === null) {
      this.sunDir.set(-0.45, 0.78, 0.45).normalize();
    } else {
      const b = ((azimuth - north) * Math.PI) / 180;
      // a low sun still lights the model: keep it at least 18° up
      const el = (Math.max(18, elevation) * Math.PI) / 180;
      this.sunDir.set(Math.sin(b) * Math.cos(el), Math.sin(el), -Math.cos(b) * Math.cos(el)).normalize();
    }
    this.placeSun();
  }

  /** Fits the sun's shadow to the house (centre and radius in metres). */
  fit(centre: Vector3, radius: number): void {
    this.centre.copy(centre);
    this.radius = Math.max(6, radius);
    const fog = this.night ? 0x141c33 : 0xe6ecf0;
    this.scene.fog = new Fog(fog, this.radius * 2.5, this.radius * 6);
    this.placeSun();
  }

  private placeSun(): void {
    const r = this.radius;
    this.sun.target.position.copy(this.centre);
    this.sun.position.copy(this.centre).addScaledVector(this.sunDir, r * 2.5);
    const cam = this.sun.shadow.camera;
    cam.left = -r;
    cam.right = r;
    cam.top = r;
    cam.bottom = -r;
    cam.near = 0.5;
    cam.far = r * 5;
    cam.updateProjectionMatrix();
    this.sun.target.updateMatrixWorld();
    this.markShadows();
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
    this.gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.6, thickness: 1.2, scale: 1.0, samples: 16 });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
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
  }

  render(): void {
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
    this.skyDay.dispose();
    this.skyNight.dispose();
    this.groundMaterial.dispose();
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
