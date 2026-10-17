import{P as b,X as s,e as f}from"./chunk-R43RLQCJ.js";var e=(t,r,a,n,l,u=!1,o=.6)=>({name:t,color:r,tex:a,scale:n,roughness:l,tintable:u,relief:o}),d={wood:e("Light wood",14203279,"planks_light",2.4,.55),oak:e("Oak",13214325,"planks_oak",2.4,.5),walnut:e("Walnut",8084033,"planks_walnut",2.4,.45),grey_wood:e("Grey wood",11775397,"planks_grey",2.4,.6),herringbone:e("Herringbone",12819052,"herringbone",1.12,.5),tiles:e("Light tiles",14343128,"tiles_light",1.2,.35),tiles_dark:e("Dark tiles",6119267,"tiles_dark",1.2,.35),terracotta:e("Terracotta",12086603,"tiles_terracotta",1.2,.7),marble:e("Marble",15263457,"marble",1.6,.18),checker:e("Checkerboard",10132120,"checker",1.2,.35),carpet:e("Carpet",12169896,"carpet",1,.95,!0,.3),stone:e("Stone",12039083,"flagstone",2,.75),concrete:e("Concrete",12434877,"concrete",3,.8,!0,.2),vinyl:e("Vinyl",13157046,"vinyl",1.2,.5,!0,.1)},p={paint:e("Paint",16052974,"plaster",2,.9,!0,.15),wallpaper_stripes:e("Striped wallpaper",15327956,"wp_stripes",.53,.85,!0,.05),wallpaper_damask:e("Damask wallpaper",14273974,"wp_damask",.53,.85,!0,.08),wallpaper_geo:e("Geometric wallpaper",14212310,"wp_geo",.53,.85,!0,.05),wallpaper_leaves:e("Leaf wallpaper",13621446,"wp_leaves",.53,.85,!0,.05),panelling:e("Panelling",15263455,"panelling",2.4,.7,!0,.7),tiles:e("Wall tiles",15921904,"tiles_metro",.6,.25,!0,.6),brick:e("Exposed brick",10902852,"brick_red",1.35,.85,!1,.9),wood:e("Wood cladding",11569248,"boards_v",1.2,.6,!1,.6),concrete:e("Concrete",12171702,"concrete",3,.8,!0,.25)},x={render:e("Render",15129807,"render",2,.9,!0,.25),brick:e("Red brick",10902852,"brick_red",1.35,.85,!1,.9),brick_buff:e("Buff brick",13216121,"brick_buff",1.35,.85,!1,.9),brick_white:e("Painted brick",15526628,"brick_painted",1.35,.8,!0,.7),stone:e("Stone",11905944,"stone_wall",2,.85,!1,1),composite:e("Composite cladding",7304056,"boards_h",1.2,.55,!0,.7),timber:e("Timber cladding",10976081,"timber_h",1.2,.65,!1,.7),concrete:e("Concrete",11842736,"concrete_panels",3,.75,!0,.35),pebbledash:e("Pebbledash",14275268,"pebbledash",1,.95,!0,1)},m={fabric:e("Fabric",10134445,"weave",.3,.95,!0,.3),linen:e("Linen",13616821,"linen",.25,.92,!0,.3),velvet:e("Velvet",4152150,"velvet",.5,.75,!0,.15),boucle:e("Boucl\xE9",15525594,"boucle",.25,1,!0,.8),leather:e("Leather",7030320,"leather",.6,.45,!0,.35)};function F(t){let[r,a]=t.split(":");switch(r){case"floor":return d[a]??d.wood;case"wall":return p[a]??p.paint;case"ext":return x[a]??x.render;case"uph":return m[a]??m.fabric;default:return null}}function y(t){if(!t)return null;let r=/^#?([0-9a-f]{6})$/i.exec(t.trim());return r?parseInt(r[1],16):null}var c=64,i=128;function S(){return{uCut:{value:new Float32Array(i)},uCutY:{value:1.1},uCutColor:{value:new b(4079944)},uTint:{value:new Float32Array(c*4)},uDim:{value:1}}}var v=`
attribute float aRoom;
attribute float aWall;
uniform float uCut[${i}];
uniform float uCutY;
uniform vec4 uTint[${c}];
varying vec4 vTint;
varying float vCapCut;
`,h=`
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
`,C=`
uniform vec3 uCutColor;
uniform float uDim;
varying vec4 vTint;
varying float vCapCut;
`,_=`
diffuseColor.rgb = mix(diffuseColor.rgb, uCutColor, vCapCut);
diffuseColor.rgb = mix(diffuseColor.rgb, vTint.rgb, vTint.a);
diffuseColor.rgb *= uDim;
`;function g(t,r,a){return t.onBeforeCompile=n=>{Object.assign(n.uniforms,r),n.vertexShader=v+n.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+h),n.fragmentShader=C+n.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+_)},t.customProgramCacheKey=()=>a,t}function R(t){return g(new s({vertexColors:!0}),t,"vh-opaque")}function T(t){return g(new s({vertexColors:!0,transparent:!0,opacity:.55,depthWrite:!1,side:f,forceSinglePass:!0}),t,"vh-glass")}function D(t,r,a){r>=0&&r<i&&(t.uCut.value[r]=a)}function E(t,r){return r>=0&&r<i?t.uCut.value[r]:0}function W(t,r,a,n,l,u){if(r<0||r>=c)return;let o=t.uTint.value;o[r*4]=a,o[r*4+1]=n,o[r*4+2]=l,o[r*4+3]=u}export{d as a,p as b,x as c,m as d,F as e,y as f,S as g,v as h,h as i,C as j,_ as k,R as l,T as m,D as n,E as o,W as p};
