// Materials: three.js' unlit MeshBasicMaterial with vertex colours (the cheapest fragment work
// there is), plus two small additions done per vertex, not per pixel:
//   * cutaway: every wall vertex knows its wall slot; uCut holds how far each wall is lowered
//     (0..1), so walls between the camera and a room slide down to the cut height smoothly. A
//     lintel over a door or window would end up lying on the door or the frame, so once its wall
//     is fully cut it drops under the floor instead, and door and window parts stop a hair under
//     the cut so the wall's cut top covers them
//   * room tint: every vertex knows its room; uTint gives a colour and an amount per room
//     (selection, heatmap, alerts)
import { Color, DoubleSide, MeshBasicMaterial, type WebGLProgramParametersWithUniforms } from "three";

export const MAX_ROOMS = 64;
export const MAX_WALLS = 128;
/** Added to a lintel's wall slot value (slots and their caps stay below 256). */
export const WALL_HANG = 512;
/** Added to a door's or window's parts: cut, they settle just under the wall's cut top instead of on it. */
export const WALL_TRIM = 256;

// typed arrays: three.js uploads them as they are, without rebuilding them every frame
export interface FloorUniforms {
  uCut: { value: Float32Array };
  uCutY: { value: number };
  /** The storey's floor level (where cut lintels hide). */
  uFloorY: { value: number };
  uCutColor: { value: Color };
  /** rgb + amount per room. */
  uTint: { value: Float32Array };
  uDim: { value: number };
  /** How many of the floor's spaces are rooms (the garden's areas come after them: outside). */
  uIndoor: { value: number };
}

export function floorUniforms(): FloorUniforms {
  return {
    uCut: { value: new Float32Array(MAX_WALLS) },
    uCutY: { value: 1.1 },
    uFloorY: { value: 0 },
    uCutColor: { value: new Color(0x3e4148) },
    uTint: { value: new Float32Array(MAX_ROOMS * 4) },
    uDim: { value: 1 },
    uIndoor: { value: 0 },
  };
}

export const VERT_HEAD = /* glsl */ `
attribute float aRoom;
attribute float aWall;
uniform float uCut[${MAX_WALLS}];
uniform float uCutY;
uniform float uFloorY;
uniform vec4 uTint[${MAX_ROOMS}];
varying vec4 vTint;
varying float vCapCut;
`;

export const VERT_BODY = /* glsl */ `
vCapCut = 0.0;
if (aWall >= 0.0) {
  float hang = step(${WALL_HANG - 0.5}, aWall);
  float wall = aWall - ${WALL_HANG}.0 * hang;
  float trim = step(${WALL_TRIM - 0.5}, wall);
  wall -= ${WALL_TRIM}.0 * trim;
  float slot = floor(wall * 0.5 + 0.01);
  float cut = uCut[int(slot)];
  if (cut > 0.001) {
    transformed.y = mix(transformed.y, min(transformed.y, uCutY - 0.003 * trim), cut);
    if (hang > 0.5 && cut > 0.999) transformed.y = uFloorY - 0.01;
    if (wall - slot * 2.0 > 0.5) vCapCut = cut;
  }
}
vTint = aRoom >= -0.5 ? uTint[int(aRoom + 0.5)] : vec4(0.0);
`;

export const FRAG_HEAD = /* glsl */ `
uniform vec3 uCutColor;
uniform float uDim;
varying vec4 vTint;
varying float vCapCut;
`;

export const FRAG_BODY = /* glsl */ `
diffuseColor.rgb = mix(diffuseColor.rgb, uCutColor, vCapCut);
diffuseColor.rgb = mix(diffuseColor.rgb, vTint.rgb, vTint.a);
diffuseColor.rgb *= uDim;
`;

// The model look's colours come already lit, so a tint brighter than the colour under it would
// shine on it like a lamp: at night a garden with someone in it turned khaki and its fences brown.
// Here a tint is at most three times as bright as what it covers, which by day is nearly always
// the whole tint.
const MODEL_FRAG_BODY = /* glsl */ `
diffuseColor.rgb = mix(diffuseColor.rgb, uCutColor, vCapCut);
float vhLit = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
float vhTint = max(dot(vTint.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0001);
diffuseColor.rgb = mix(diffuseColor.rgb, vTint.rgb * min(1.0, 3.0 * vhLit / vhTint), vTint.a);
diffuseColor.rgb *= uDim;
`;

function inject(mat: MeshBasicMaterial, u: FloorUniforms, key: string): MeshBasicMaterial {
  mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = VERT_HEAD + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n" + VERT_BODY);
    shader.fragmentShader = FRAG_HEAD + shader.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\n" + MODEL_FRAG_BODY);
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
