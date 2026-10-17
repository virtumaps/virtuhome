import{P as f,X as a,e as l}from"./chunk-33DCXNTY.js";var i=64,n=128;function x(){return{uCut:{value:new Float32Array(n)},uCutY:{value:1.1},uCutColor:{value:new f(4079944)},uTint:{value:new Float32Array(i*4)},uDim:{value:1}}}var v=`
attribute float aRoom;
attribute float aWall;
uniform float uCut[${n}];
uniform float uCutY;
uniform vec4 uTint[${i}];
varying vec4 vTint;
varying float vCapCut;
`,C=`
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
`,p=`
uniform vec3 uCutColor;
uniform float uDim;
varying vec4 vTint;
varying float vCapCut;
`,b=`
diffuseColor.rgb = mix(diffuseColor.rgb, uCutColor, vCapCut);
diffuseColor.rgb = mix(diffuseColor.rgb, vTint.rgb, vTint.a);
diffuseColor.rgb *= uDim;
`;function s(e,r,o){return e.onBeforeCompile=t=>{Object.assign(t.uniforms,r),t.vertexShader=v+t.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+C),t.fragmentShader=p+t.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+b)},e.customProgramCacheKey=()=>o,e}function d(e){return s(new a({vertexColors:!0}),e,"vh-opaque")}function M(e){return s(new a({vertexColors:!0,transparent:!0,opacity:.55,depthWrite:!1,side:l,forceSinglePass:!0}),e,"vh-glass")}function y(e,r,o){r>=0&&r<n&&(e.uCut.value[r]=o)}function F(e,r){return r>=0&&r<n?e.uCut.value[r]:0}function T(e,r,o,t,m,c){if(r<0||r>=i)return;let u=e.uTint.value;u[r*4]=o,u[r*4+1]=t,u[r*4+2]=m,u[r*4+3]=c}export{x as a,v as b,C as c,p as d,b as e,d as f,M as g,y as h,F as i,T as j};
