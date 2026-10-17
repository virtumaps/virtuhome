// Materials: three.js' unlit MeshBasicMaterial with vertex colours (the cheapest fragment work
// there is), plus two small additions done per vertex, not per pixel:
//   * cutaway: every wall vertex knows its wall slot; uCut holds how far each wall is lowered
//     (0..1), so walls between the camera and a room slide down to the cut height smoothly
//   * room tint: every vertex knows its room; uTint gives a colour and an amount per room
//     (selection, heatmap, alerts)
import { Color, DoubleSide, MeshBasicMaterial, type WebGLProgramParametersWithUniforms } from "three";

export const MAX_ROOMS = 64;
export const MAX_WALLS = 128;

// typed arrays: three.js uploads them as they are, without rebuilding them every frame
export interface FloorUniforms {
  uCut: { value: Float32Array };
  uCutY: { value: number };
  uCutColor: { value: Color };
  /** rgb + amount per room. */
  uTint: { value: Float32Array };
  uDim: { value: number };
}

export function floorUniforms(): FloorUniforms {
  return {
    uCut: { value: new Float32Array(MAX_WALLS) },
    uCutY: { value: 1.1 },
    uCutColor: { value: new Color(0x3e4148) },
    uTint: { value: new Float32Array(MAX_ROOMS * 4) },
    uDim: { value: 1 },
  };
}

const VERT_HEAD = /* glsl */ `
attribute float aRoom;
attribute float aWall;
uniform float uCut[${MAX_WALLS}];
uniform float uCutY;
uniform vec4 uTint[${MAX_ROOMS}];
varying vec4 vTint;
varying float vCapCut;
`;

const VERT_BODY = /* glsl */ `
vCapCut = 0.0;
if (aWall >= 0.0) {
  float slot = floor(aWall * 0.5 + 0.01);
  float cut = uCut[int(slot)];
  if (cut > 0.001) {
    transformed.y = mix(transformed.y, min(transformed.y, uCutY), cut);
    if (aWall - slot * 2.0 > 0.5) vCapCut = cut;
  }
}
vTint = aRoom >= -0.5 ? uTint[int(aRoom + 0.5)] : vec4(0.0);
`;

const FRAG_HEAD = /* glsl */ `
uniform vec3 uCutColor;
uniform float uDim;
varying vec4 vTint;
varying float vCapCut;
`;

const FRAG_BODY = /* glsl */ `
diffuseColor.rgb = mix(diffuseColor.rgb, uCutColor, vCapCut);
diffuseColor.rgb = mix(diffuseColor.rgb, vTint.rgb, vTint.a);
diffuseColor.rgb *= uDim;
`;

function inject(mat: MeshBasicMaterial, u: FloorUniforms, key: string): MeshBasicMaterial {
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = VERT_HEAD + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n" + VERT_BODY);
    shader.fragmentShader = FRAG_HEAD + shader.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\n" + FRAG_BODY);
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

export function opaqueMaterial(u: FloorUniforms): MeshBasicMaterial {
  return inject(new MeshBasicMaterial({ vertexColors: true }), u, "vh-opaque");
}

export function glassMaterial(u: FloorUniforms): MeshBasicMaterial {
  return inject(
    // forceSinglePass: otherwise three.js draws double-sided glass twice and rebuilds its program each frame
    new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false, side: DoubleSide, forceSinglePass: true }),
    u,
    "vh-glass",
  );
}

/** Sets wall slot i's cut amount. */
export function setCut(u: FloorUniforms, slot: number, amount: number): void {
  if (slot >= 0 && slot < MAX_WALLS) u.uCut.value[slot] = amount;
}

export function getCut(u: FloorUniforms, slot: number): number {
  return slot >= 0 && slot < MAX_WALLS ? u.uCut.value[slot] : 0;
}

export function setTint(u: FloorUniforms, room: number, r: number, g: number, b: number, a: number): void {
  if (room < 0 || room >= MAX_ROOMS) return;
  const t = u.uTint.value;
  t[room * 4] = r;
  t[room * 4 + 1] = g;
  t[room * 4 + 2] = b;
  t[room * 4 + 3] = a;
}
