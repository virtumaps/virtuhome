import{d as zs,f as Vs,g as Gs,h as Hs,i as js,j as Ws,k as Qs,l as Zs}from"./chunk-RGTRRDQO.js";import{P as ge,W as et,X as Bs,_ as tt,c as Bt,d as zt,e as Os,f as Ls,na as Xs}from"./chunk-6XD2KNYG.js";import"./chunk-GRCKOKFM.js";import{$ as Je,A as ms,B as ds,C as ps,D as It,E as Ke,F as gs,G as vs,I as L,K as B,L as xs,M as K,N as me,Na as Is,O as bs,P as Ms,Q as I,R as Ss,S as ys,T as ws,U as Ot,V as Lt,W as de,Z as $e,_ as $,ba as Ts,c as es,d as ts,da as _s,e as kt,ea as Ps,f as Q,fa as Ne,g as ss,ga as Cs,h as os,ha as Rs,i as rs,j as Fe,k as Ue,ka as Z,l as Ft,la as H,m as Ut,ma as Es,n as is,na as pe,o as as,oa as Ie,p as ns,pa as Ds,q as qe,r as ls,ra as As,s as cs,sa as ks,t as us,ta as Fs,u as ae,v as Nt,va as Us,x as hs,y as fs,z as q,za as Ns}from"./chunk-VR2MRTFE.js";import"./chunk-QMMH4BXU.js";import{j as $t,k as Jt}from"./chunk-2OQQ6OX5.js";import"./chunk-AVVHHO5E.js";import"./chunk-5XSRVAYZ.js";import"./chunk-G6XSQEPO.js";import"./chunk-RB5IZIYP.js";var J={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var j=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},So=new ks(-1,1,1,-1,0,1),Vt=class extends de{constructor(){super(),this.setAttribute("position",new Lt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Lt([0,2,0,0,2,0],2))}},yo=new Vt,ee=class{constructor(e){this._mesh=new $(yo,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,So)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var st=class extends j{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof H?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Z.clone(e.uniforms),this.material=new H({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ee(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Oe=class extends j{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){let o=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let i,n;this.inverse?(i=0,n=1):(i=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),a.buffers.stencil.setFunc(o.ALWAYS,i,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(o.EQUAL,1,4294967295),a.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),a.buffers.stencil.setLocked(!0)}},ot=class extends j{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var rt=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let s=e.getSize(new L);this._width=s.width,this._height=s.height,t=new K(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:q}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new st(J),this.copyPass.material.blending=Q,this.timer=new Us}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),s=!1;for(let o=0,a=this.passes.length;o<a;o++){let i=this.passes[o];if(i.enabled!==!1){if(i.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),i.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),i.needsSwap){if(s){let n=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Oe!==void 0&&(i instanceof Oe?s=!0:i instanceof ot&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new L);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var it=class extends j{constructor(e,t,s=null,o=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=o,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new I}render(e,t,s){let o=e.autoClear;e.autoClear=!1;let a,i;this.overrideMaterial!==null&&(i=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=i),e.autoClear=o}};var Le={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new L},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new me},cameraProjectionMatrixInverse:{value:new me},cameraWorldMatrix:{value:new me},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new B(-1,-1,-1)},sceneBoxMax:{value:new B(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);

			#ifdef USE_REVERSED_DEPTH_BUFFER
				if (depth <= 0.0) {
					discard;
					return;
				}
			#else
				if (depth >= 1.0) {
					discard;
					return;
				}
			#endif
			
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Be={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},at={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Ys(r=5){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=wo(e),s=t.length,o=new Uint8Array(s*4);for(let i=0;i<s;++i){let n=t[i],l=2*Math.PI*n/s,c=new B(Math.cos(l),Math.sin(l),0).normalize();o[i*4]=(c.x*.5+.5)*255,o[i*4+1]=(c.y*.5+.5)*255,o[i*4+2]=127,o[i*4+3]=255}let a=new Je(o,e,e);return a.wrapS=ae,a.wrapT=ae,a.needsUpdate=!0,a}function wo(r){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=e*e,s=Array(t).fill(0),o=Math.floor(e/2),a=e-1;for(let i=1;i<=t;){if(o===-1&&a===e?(a=e-2,o=0):(a===e&&(a=0),o<0&&(o=e-1)),s[o*e+a]!==0){a-=2,o++;continue}else s[o*e+a]=i++;a++,o--}return s}var ze={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Gt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new L},cameraProjectionMatrixInverse:{value:new me},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Gt(r,e,t){let s=To(r,e,t),o="vec3[SAMPLES](";for(let a=0;a<r;a++){let i=s[a];o+=`vec3(${i.x}, ${i.y}, ${i.z})${a<r-1?",":")"}`}return o}function To(r,e,t){let s=[];for(let o=0;o<r;o++){let a=2*Math.PI*e*o/r,i=Math.pow(o/(r-1),t);s.push(new B(Math.cos(a),Math.sin(a),i))}return s}var nt=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let s,o,a,i=.5*(Math.sqrt(3)-1),n=(e+t)*i,l=Math.floor(e+n),c=Math.floor(t+n),f=(3-Math.sqrt(3))/6,h=(l+c)*f,m=l-h,d=c-h,u=e-m,p=t-d,x,g;u>p?(x=1,g=0):(x=0,g=1);let v=u-x+f,b=p-g+f,M=u-1+2*f,S=p-1+2*f,y=l&255,C=c&255,E=this.perm[y+this.perm[C]]%12,R=this.perm[y+x+this.perm[C+g]]%12,A=this.perm[y+1+this.perm[C+1]]%12,k=.5-u*u-p*p;k<0?s=0:(k*=k,s=k*k*this._dot(this.grad3[E],u,p));let N=.5-v*v-b*b;N<0?o=0:(N*=N,o=N*N*this._dot(this.grad3[R],v,b));let X=.5-M*M-S*S;return X<0?a=0:(X*=X,a=X*X*this._dot(this.grad3[A],M,S)),70*(s+o+a)}noise3d(e,t,s){let o,a,i,n,c=(e+t+s)*.3333333333333333,f=Math.floor(e+c),h=Math.floor(t+c),m=Math.floor(s+c),d=1/6,u=(f+h+m)*d,p=f-u,x=h-u,g=m-u,v=e-p,b=t-x,M=s-g,S,y,C,E,R,A;v>=b?b>=M?(S=1,y=0,C=0,E=1,R=1,A=0):v>=M?(S=1,y=0,C=0,E=1,R=0,A=1):(S=0,y=0,C=1,E=1,R=0,A=1):b<M?(S=0,y=0,C=1,E=0,R=1,A=1):v<M?(S=0,y=1,C=0,E=0,R=1,A=1):(S=0,y=1,C=0,E=1,R=1,A=0);let k=v-S+d,N=b-y+d,X=M-C+d,be=v-E+2*d,Me=b-R+2*d,Se=M-A+2*d,ye=v-1+3*d,we=b-1+3*d,G=M-1+3*d,le=f&255,ce=h&255,ue=m&255,Qe=this.perm[le+this.perm[ce+this.perm[ue]]]%12,Ze=this.perm[le+S+this.perm[ce+y+this.perm[ue+C]]]%12,Xe=this.perm[le+E+this.perm[ce+R+this.perm[ue+A]]]%12,Ye=this.perm[le+1+this.perm[ce+1+this.perm[ue+1]]]%12,se=.6-v*v-b*b-M*M;se<0?o=0:(se*=se,o=se*se*this._dot3(this.grad3[Qe],v,b,M));let oe=.6-k*k-N*N-X*X;oe<0?a=0:(oe*=oe,a=oe*oe*this._dot3(this.grad3[Ze],k,N,X));let re=.6-be*be-Me*Me-Se*Se;re<0?i=0:(re*=re,i=re*re*this._dot3(this.grad3[Xe],be,Me,Se));let ie=.6-ye*ye-we*we-G*G;return ie<0?n=0:(ie*=ie,n=ie*ie*this._dot3(this.grad3[Ye],ye,we,G)),32*(o+a+i+n)}noise4d(e,t,s,o){let a=this.grad4,i=this.simplex,n=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,f,h,m,d,u,p=(e+t+s+o)*l,x=Math.floor(e+p),g=Math.floor(t+p),v=Math.floor(s+p),b=Math.floor(o+p),M=(x+g+v+b)*c,S=x-M,y=g-M,C=v-M,E=b-M,R=e-S,A=t-y,k=s-C,N=o-E,X=R>A?32:0,be=R>k?16:0,Me=A>k?8:0,Se=R>N?4:0,ye=A>N?2:0,we=k>N?1:0,G=X+be+Me+Se+ye+we,le=i[G][0]>=3?1:0,ce=i[G][1]>=3?1:0,ue=i[G][2]>=3?1:0,Qe=i[G][3]>=3?1:0,Ze=i[G][0]>=2?1:0,Xe=i[G][1]>=2?1:0,Ye=i[G][2]>=2?1:0,se=i[G][3]>=2?1:0,oe=i[G][0]>=1?1:0,re=i[G][1]>=1?1:0,ie=i[G][2]>=1?1:0,Kt=i[G][3]>=1?1:0,gt=R-le+c,vt=A-ce+c,xt=k-ue+c,bt=N-Qe+c,Mt=R-Ze+2*c,St=A-Xe+2*c,yt=k-Ye+2*c,wt=N-se+2*c,Tt=R-oe+3*c,_t=A-re+3*c,Pt=k-ie+3*c,Ct=N-Kt+3*c,Rt=R-1+4*c,Et=A-1+4*c,Dt=k-1+4*c,At=N-1+4*c,Te=x&255,_e=g&255,Pe=v&255,Ce=b&255,go=n[Te+n[_e+n[Pe+n[Ce]]]]%32,vo=n[Te+le+n[_e+ce+n[Pe+ue+n[Ce+Qe]]]]%32,xo=n[Te+Ze+n[_e+Xe+n[Pe+Ye+n[Ce+se]]]]%32,bo=n[Te+oe+n[_e+re+n[Pe+ie+n[Ce+Kt]]]]%32,Mo=n[Te+1+n[_e+1+n[Pe+1+n[Ce+1]]]]%32,Re=.6-R*R-A*A-k*k-N*N;Re<0?f=0:(Re*=Re,f=Re*Re*this._dot4(a[go],R,A,k,N));let Ee=.6-gt*gt-vt*vt-xt*xt-bt*bt;Ee<0?h=0:(Ee*=Ee,h=Ee*Ee*this._dot4(a[vo],gt,vt,xt,bt));let De=.6-Mt*Mt-St*St-yt*yt-wt*wt;De<0?m=0:(De*=De,m=De*De*this._dot4(a[xo],Mt,St,yt,wt));let Ae=.6-Tt*Tt-_t*_t-Pt*Pt-Ct*Ct;Ae<0?d=0:(Ae*=Ae,d=Ae*Ae*this._dot4(a[bo],Tt,_t,Pt,Ct));let ke=.6-Rt*Rt-Et*Et-Dt*Dt-At*At;return ke<0?u=0:(ke*=ke,u=ke*ke*this._dot4(a[Mo],Rt,Et,Dt,At)),27*(f+h+m+d+u)}_dot(e,t,s){return e[0]*t+e[1]*s}_dot3(e,t,s,o){return e[0]*t+e[1]*s+e[2]*o}_dot4(e,t,s,o,a){return e[0]*t+e[1]*s+e[2]*o+e[3]*a}};var Ve=class r extends j{constructor(e,t,s=512,o=512,a,i,n){super(),this.width=s,this.height=o,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Ys(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new K(this.width,this.height,{type:q,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new H({defines:Object.assign({},Le.defines),uniforms:Z.clone(Le.uniforms),vertexShader:Le.vertexShader,fragmentShader:Le.fragmentShader,blending:Q,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Ie,this.normalMaterial.blending=Q,this.pdMaterial=new H({defines:Object.assign({},ze.defines),uniforms:Z.clone(ze.uniforms),vertexShader:ze.vertexShader,fragmentShader:ze.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new H({defines:Object.assign({},Be.defines),uniforms:Z.clone(Be.uniforms),vertexShader:Be.vertexShader,fragmentShader:Be.fragmentShader,blending:Q}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new H({uniforms:Z.clone(J.uniforms),vertexShader:J.vertexShader,fragmentShader:J.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Ut,blendDst:Ue,blendEquation:Fe,blendSrcAlpha:Ft,blendDstAlpha:Ue,blendEquationAlpha:Fe}),this.blendMaterial=new H({uniforms:Z.clone(at.uniforms),vertexShader:at.vertexShader,fragmentShader:at.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:rs,blendSrc:Ut,blendDst:Ue,blendEquation:Fe,blendSrcAlpha:Ft,blendDstAlpha:Ue,blendEquationAlpha:Fe}),this._fsQuad=new ee(null),this._originalClearColor=new I,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),i!==void 0&&this.updateGtaoMaterial(i),n!==void 0&&this.updatePdMaterial(n)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new Cs,this.depthTexture.format=ps,this.depthTexture.type=ms,this.normalRenderTarget=new K(this.width,this.height,{minFilter:Nt,magFilter:Nt,type:q,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let s=this.normalTexture?1:0,o=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=s,this.gtaoMaterial.defines.DEPTH_SWIZZLING=o,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=s,this.pdMaterial.defines.DEPTH_SWIZZLING=o,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Gt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,s){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case r.OUTPUT.Off:break;case r.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=Q,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Q,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Q,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Q,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=Q,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,s,o,a){e.getClearColor(this._originalClearColor);let i=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,o!=null&&(e.setClearColor(o),e.setClearAlpha(a||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(i)}_renderOverride(e,t,s,o,a){e.getClearColor(this._originalClearColor);let i=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,o=t.clearColor||o,a=t.clearAlpha||a,o!=null&&(e.setClearColor(o),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(i)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(s){(s.isPoints||s.isLine||s.isLine2)&&s.visible&&(s.visible=!1,t.push(s))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new nt,s=e*e*4,o=new Uint8Array(s);for(let i=0;i<e;i++)for(let n=0;n<e;n++){let l=i,c=n;o[(i*e+n)*4]=(t.noise(l,c)*.5+.5)*255,o[(i*e+n)*4+1]=(t.noise(l+e,c)*.5+.5)*255,o[(i*e+n)*4+2]=(t.noise(l,c+e)*.5+.5)*255,o[(i*e+n)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}let a=new Je(o,e,e,ds,fs);return a.wrapS=ae,a.wrapT=ae,a.needsUpdate=!0,a}};Ve.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var qs={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new I(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var ve=class r extends j{constructor(e,t=1,s,o){super(),this.strength=t,this.radius=s,this.threshold=o,this.resolution=e!==void 0?new L(e.x,e.y):new L(256,256),this.clearColor=new I(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),i=Math.round(this.resolution.y/2);this.renderTargetBright=new K(a,i,{type:q,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){let h=new K(a,i,{type:q,depthBuffer:!1});h.texture.name="UnrealBloomPass.h"+f,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);let m=new K(a,i,{type:q,depthBuffer:!1});m.texture.name="UnrealBloomPass.v"+f,m.texture.generateMipmaps=!1,this.renderTargetsVertical.push(m),a=Math.round(a/2),i=Math.round(i/2)}let n=qs;this.highPassUniforms=Z.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new H({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];a=Math.round(this.resolution.x/2),i=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new L(1/a,1/i),a=Math.round(a/2),i=Math.round(i/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Z.clone(J.uniforms),this.blendMaterial=new H({uniforms:this.copyUniforms,vertexShader:J.vertexShader,fragmentShader:J.fragmentShader,premultipliedAlpha:!0,blending:os,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new I,this._oldClearAlpha=1,this._basic=new $e,this._fsQuad=new ee(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(s,o);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,o),this.renderTargetsVertical[a].setSize(s,o),this.separableBlurMaterials[a].uniforms.invSize.value=new L(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(e,t,s,o,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let i=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[l].uniforms.direction.value=r.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=r.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=i}_getSeparableBlurMaterial(e){let t=[],s=e/3;for(let i=0;i<e;i++)t.push(.39894*Math.exp(-.5*i*i/(s*s))/s);let o=[],a=[];for(let i=1;i<e;i+=2){let n=t[i],l=i+1<e?t[i+1]:0,c=n+l;o.push((i*n+(i+1)*l)/c),a.push(c)}return new H({defines:{KERNEL_PAIRS:o.length},uniforms:{colorTexture:{value:null},invSize:{value:new L(.5,.5)},direction:{value:new L(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:o},gaussianWeights:{value:a}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new H({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};ve.BlurDirectionX=new L(1,0);ve.BlurDirectionY=new L(0,1);var Ge={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var lt=class extends j{constructor(){super(),this.isOutputPass=!0,this.uniforms=Z.clone(Ge.uniforms),this.material=new Es({name:Ge.name,uniforms:this.uniforms,vertexShader:Ge.vertexShader,fragmentShader:Ge.fragmentShader}),this._fsQuad=new ee(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},xs.getTransfer(this._outputColorSpace)===vs&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===is?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===as?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ns?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===qe?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===cs?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===us?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ls&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var ct=class extends ys{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Rs;e.deleteAttribute("uv");let t=new pe({side:ts}),s=new pe,o=new As(16777215,900,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new $(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let i=new Ts(e,s,6),n=new bs;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),i.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),i.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),i.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),i.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),i.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),i.setMatrixAt(5,n.matrix),this.add(i);let l=new $(e,xe(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new $(e,xe(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let f=new $(e,xe(17));f.position.set(14.904,12.198,-1.832),f.scale.set(.15,4.265,6.331),this.add(f);let h=new $(e,xe(43));h.position.set(-.462,8.89,14.52),h.scale.set(4.38,5.441,.088),this.add(h);let m=new $(e,xe(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);let d=new $(e,xe(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function xe(r){return new Ds({color:0,emissive:16777215,emissiveIntensity:r})}function Ht(r){let e=r>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function F(r,e=0,t=0){let s=Math.imul(r|0,374761393)+Math.imul(e|0,668265263)+Math.imul(t|0,2147483647);return s=Math.imul(s^s>>>13,1274126177),((s^s>>>16)>>>0)/4294967296}var T=r=>r-Math.floor(r),P=(r,e)=>(r%e+e)%e,U=r=>r*r*(3-2*r),D=r=>r<0?0:r>1?1:r,_=(r,e,t)=>r+(e-r)*t,te=(r,e,t)=>[_(r[0],e[0],t),_(r[1],e[1],t),_(r[2],e[2],t)],V=r=>[(r>>16&255)/255,(r>>8&255)/255,(r&255)/255],O=(r,e)=>D(Math.min(r,1-r)/e);function W(r,e,t){let s=new Float32Array(r*e);for(let o=0;o<s.length;o++)s[o]=t();return(o,a)=>{let i=T(o)*r,n=T(a)*e,l=Math.floor(i),c=Math.floor(n),f=U(i-l),h=U(n-c),m=(l+1)%r,d=(c+1)%e,u=s[c*r+l],p=s[c*r+m],x=s[d*r+l],g=s[d*r+m];return _(_(u,p,f),_(x,g,f),h)}}function w(r,e,t,s){let o=Array.from({length:t},(a,i)=>W(r<<i,e<<i,s));return(a,i)=>{let n=0,l=.5,c=0;for(let f of o)n+=f(a,i)*l,c+=l,l*=.5;return n/c}}function Y(r,e,t=.8){let s=new Float32Array(r*r*2);for(let o=0;o<r*r;o++)s[o*2]=.5+(e()-.5)*t,s[o*2+1]=.5+(e()-.5)*t;return(o,a)=>{let i=T(o)*r,n=T(a)*r,l=Math.floor(i),c=Math.floor(n),f=9,h=9,m=0;for(let d=-1;d<=1;d++)for(let u=-1;u<=1;u++){let p=l+u,x=c+d,g=P(x,r)*r+P(p,r),v=p+s[g*2],b=x+s[g*2+1],M=v-i,S=b-n,y=Math.sqrt(M*M+S*S);y<f?(h=f,f=y,m=g):y<h&&(h=y)}return[f,h,m]}}var Js=(r,e)=>e?Js(e,r%e):r,jt=(r,e)=>r/Js(r,e)*e,ut=(r,e)=>r*Math.max(1,Math.ceil(e/r-1e-9)),eo=10;function Qt(r){let[e,t]=r.unit,s=Math.max(1800,3*e);switch(r.pattern){case"grid":return ut(jt(e,t),s);case"stretcher":return ut(jt(e,2*t),s);case"third":return ut(jt(e,3*t),s);case"herringbone":case"basketweave":return ut(2*e,1600);case"random":return eo*e;case"crazy":return 2400;default:return r.material==="tarmac"?2500:1e3}}function Zt(r){let e=r.width+to;return e*Math.max(4,Math.round(3600/e))}var to=6;function he(r,e,t,s,o,a,i){let n=a-e,l=i-t;return{id:r,d:Math.min(n,s-n,l,o-l),lx:n-s/2,ly:l-o/2,w:s,h:o}}function _o(r,e,t){let s=Math.round(t/r);return(o,a)=>{let i=Math.floor(o/r),n=Math.floor(a/e);return he(n*s+i,i*r,n*e,r,e,o,a)}}function Ks(r,e,t,s){let o=Math.round(t/r);return(a,i)=>{let n=Math.floor(i/e),l=P(n,s)*r/s,c=P(a+l,t),f=Math.floor(c/r);return he(n*o+f,f*r,n*e,r,e,c,i)}}function Po(r,e,t){let s=Math.max(2,Math.round(r/e)),o=Math.round(t/e);return(a,i)=>{let n=Math.floor(a/e),l=Math.floor(i/e),c=P(n+l,2*s);if(c<s){let m=n-c;return he(P(l,o)*o+P(m,o),m*e,l*e,s*e,e,a,i)}let f=l-(c-s),h=he(P(f,o)*o+P(n,o)+o*o,n*e,f*e,e,s*e,a,i);return{...h,lx:h.ly,ly:h.lx,w:h.h,h:h.w}}}function Co(r,e,t){let s=Math.max(2,Math.round(r/e)),o=Math.round(t/r);return(a,i)=>{let n=Math.floor(a/r),l=Math.floor(i/r),c=(l*o+n)*s;if((n+l)%2===0){let m=Math.min(s-1,Math.floor((i-l*r)/e));return he(c+m,n*r,l*r+m*e,r,e,a,i)}let f=Math.min(s-1,Math.floor((a-n*r)/e)),h=he(c+f,n*r+f*e,l*r,e,r,a,i);return{...h,lx:h.ly,ly:h.lx,w:h.h,h:h.w}}}function Ro(r,e){let t=eo,s=new Int32Array(t*t).fill(-1),o=[],a=[[3,2,3],[2,3,1],[2,2,3],[2,1,2],[1,2,1],[1,1,1.2]],i=a.reduce((l,c)=>l+c[2],0),n=(l,c,f,h)=>{for(let m=0;m<h;m++)for(let d=0;d<f;d++)if(s[P(c+m,t)*t+P(l+d,t)]>=0)return!1;return!0};for(let l=0;l<t;l++)for(let c=0;c<t;c++){if(s[l*t+c]>=0)continue;let f=[1,1];for(let m=0;m<6;m++){let d=e()*i,u=a[0];for(let p of a)if((d-=p[2])<=0){u=p;break}if(n(c,l,u[0],u[1])){f=[u[0],u[1]];break}}let h=o.length;o.push({x:c,y:l,a:f[0],b:f[1]});for(let m=0;m<f[1];m++)for(let d=0;d<f[0];d++)s[P(l+m,t)*t+P(c+d,t)]=h}return(l,c)=>{let f=Math.floor(l/r),h=Math.floor(c/r),m=s[P(h,t)*t+P(f,t)],d=o[m],u=f-P(f-d.x,t),p=h-P(h-d.y,t);return he(m,u*r,p*r,d.a*r,d.b*r,l,c)}}function Eo(r,e){let s=Y(6,e,.95),o=r/6;return(a,i)=>{let[n,l,c]=s(a/r,i/r);return{id:c,d:(l-n)/2*o,lx:0,ly:0,w:o,h:o}}}var Do=()=>({id:0,d:1/0,lx:0,ly:0,w:1,h:1});function Wt(r){let e=parseInt(r.slice(1),16)||0;return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function so(r,e){let t=Math.floor(r),s=Math.floor(e),o=U(r-t),a=U(e-s);return _(_(F(t,s,31),F(t+1,s,31),o),_(F(t,s+1,31),F(t+1,s+1,31),o),a)}function $s(r,e,t){let s=0,o=.5,a=0,i=1;for(let n=0;n<t;n++)s+=so(r*i+n*17.3,e*i-n*9.1)*o,a+=o,o*=.5,i*=2;return s/a}var Ao=[[1,1,1],[1.1,1,.86],[.92,.97,1.04],[1.13,.95,.83],[.95,.99,.93],[1.05,1.02,.9],[.86,.86,.87]],ko=[[1,1,1],[1.16,.92,.84],[.74,.74,.78],[1.08,1.03,.9],[.9,.84,.82],[1.2,1.05,.88]],He=[0,0,0,0];function Fo(r,e,t){let[s,o]=r.unit;switch(r.pattern){case"grid":return _o(s,o,e);case"stretcher":return Ks(s,o,e,2);case"third":return Ks(s,o,e,3);case"herringbone":return Po(s,o,e);case"basketweave":return Co(s,o,e);case"random":return Ro(s,t);case"crazy":return Eo(e,t);default:return Do}}function Uo(r){let e=ge[r.material],t=Qt(r),s=Wt(r.color),o=Wt(r.joint),a=e.joint/2;return{detail:!1,make:i=>{let n=Fo(r,t,i),l=No(r,t,s,i),c=W(Math.max(4,Math.round(t/30)),Math.max(4,Math.round(t/30)),i),f=e.surface==="sett"||r.pattern==="crazy"?W(Math.round(t/25),Math.round(t/25),i):null,h=e.surface==="block"?5:e.surface==="clay"?3:e.surface==="tumbled"?5:e.surface==="sett"?6:e.surface==="smooth"?1:2.5;return(m,d)=>{let u=m*t,p=d*t,x=n(u,p),g=x.d;if(f&&isFinite(g)&&(g+=(f(m,d)-.5)*7),g<a){let R=c(m,d),A=(.82+R*.22)*_(.8,1,D(g/Math.max(1,a)));return[o[0]*A,o[1]*A,o[2]*A,.05+R*.05]}let v=x.id;l({u:m,v:d,x:u,y:p,hit:x,r1:F(v,1,77),r2:F(v,2,77),r3:F(v,3,77)});let[b,M,S,y]=He,C=isFinite(g)?U(D((g-a)/h)):1,E=_(.78,1,C);return[b*E,M*E,S*E,_(.15,y,C)]}}}}function No(r,e,t,s){let o=ge[r.material],a=o.vary,i=d=>Math.max(2,Math.round(e/d)),n=w(i(700),i(700),2,s),l=w(i(160),i(160),2,s),c=W(i(12),i(12),s),f=o.surface==="block"||o.surface==="clay"?ko:Ao,h=d=>{let u=1+(d.r1-.5)*2*a,p=f[Math.floor(d.r2*f.length)%f.length];return[t[0]*u*_(1,p[0],r.mix),t[1]*u*_(1,p[1],r.mix),t[2]*u*_(1,p[2],r.mix)]},m=(d,u,p)=>{He[0]=d[0]*u,He[1]=d[1]*u,He[2]=d[2]*u,He[3]=p};switch(o.surface){case"riven":{let d=r.pattern==="crazy",u=[1.12,.93,.78];return p=>{let x=h(p),g=p.r3*Math.PI,v=Math.cos(g),b=Math.sin(g),M,S,y;if(d)M=n(p.u+p.r1,p.v+p.r2),S=l(p.u*.5+p.r2,p.v*2+p.r1),y=n(p.u+p.r3,p.v+p.r1);else{let k=p.hit.lx*v+p.hit.ly*b+p.r1*5e3,N=-p.hit.lx*b+p.hit.ly*v+p.r2*5e3;M=$s(k/260,N/260,3),S=$s(k/480,N/45,2),y=so(k/340,N/340)}let C=c(p.u,p.v),E=U(D((S-.55)*4))*(.15+.45*r.mix)+U(D((y-.62)*3))*.4*r.mix,R=[x[0]*_(1,u[0],E),x[1]*_(1,u[1],E),x[2]*_(1,u[2],E)],A=.9+(M-.5)*.24-E*.08+(C-.5)*.07;m(R,A,.4+M*.42+S*.1+C*.06)}}case"smooth":return d=>{let u=h(d),p=.97+(n(d.u+d.r1,d.v)-.5)*.06+(c(d.u,d.v)-.5)*.025;m(u,p,.9+c(d.u,d.v)*.03)};case"textured":{let d=W(i(9),i(9),s);return u=>{let p=h(u),x=c(u.u,u.v),g=d(u.u,u.v),v=g>.8?(g-.8)*2.5:0,b=.95+(l(u.u,u.v)-.5)*.1+(x-.5)*.14-v*.3;m(p,b,.82+x*.12-v*.4)}}case"flamed":{let d=W(i(4),i(4),s),u=W(i(5),i(5),s);return p=>{let x=h(p),g=d(p.u,p.v),v=u(p.u,p.v),b=.96+(l(p.u,p.v)-.5)*.06;g>.7?b*=_(1,.35,D((g-.7)*5)):v>.74&&(b*=_(1,1.3,D((v-.74)*6))),m(x,b,.8+(c(p.u,p.v)-.5)*.2+(g>.7?-.05:0))}}case"honed":{let d=W(i(6),i(6),s);return u=>{let p=h(u),x=d(u.u,u.v),g=.95+(n(u.u+u.r1,u.v+u.r3)-.5)*.16+(l(u.u,u.v)-.5)*.06-(x>.85?(x-.85)*2:0);m(p,g,.86+(l(u.u,u.v)-.5)*.06)}}case"tumbled":{let d=W(i(5),i(9),s);return u=>{let p=h(u),x=l(u.u,u.v),g=Math.sin((u.y/40+x*3+u.r3*7)*Math.PI),v=d(u.u,u.v),b=v>.8?Math.min(1,(v-.8)*6):0,M=.95+g*.045+(x-.5)*.08-b*.22;m(p,M,.82+g*.03-b*.5+(c(u.u,u.v)-.5)*.05)}}case"cleft":return d=>{let u=h(d),p=n(d.u+d.r1,d.v+d.r2)*.7+l(d.u,d.v)*.3,x=Math.floor(p*6)/6,g=U(D(T(p*6)*6)),v=.88+x*.22+(c(d.u,d.v)-.5)*.05-(1-g)*.08;m(u,v,x*.6+g*.08+.3)};case"block":case"clay":{let d=W(i(7),i(7),s),u=o.surface==="clay";return p=>{let x=h(p),g=c(p.u,p.v),v=d(p.u,p.v),b=u?(n(p.u+p.r3,p.v)-.5)*.2:0,M=.94+(g-.5)*.14+b-(u&&v>.78?(v-.78)*1.6:0)+(l(p.u,p.v)-.5)*.06;m(x,M,.8+g*.12)}}case"sett":{let d=W(i(4),i(4),s);return u=>{let p=h(u),x=2*u.hit.lx/u.hit.w,g=2*u.hit.ly/u.hit.h,v=1-.35*(x*x+g*g),b=d(u.u,u.v),M=(.92+(l(u.u,u.v)-.5)*.2+v*.06)*(b>.72?.6:1);m(p,M,v*.7+l(u.u,u.v)*.25)}}case"aggregate":{let d=Y(i(6),s,.9);return u=>{let[p,x,g]=d(u.u,u.v),v=F(g,5),b=F(g,9),M=b>.93?1.35:b<.08?.55:.82+v*.3,S=D((x-p)/.3),y=M*_(.55,1,S)*(.92+D(1-p)*.12);m(t,y,S*D(1-p*.7))}}case"gravel":{let d=Y(i(18),s,.9);return u=>{let[p,x,g]=d(u.u,u.v),v=F(g,3),b=F(g,11),M=b>.85?[1.08,1,.9]:b<.15?[.9,.93,.97]:[1,1,1],S=D((x-p)/.25),y=(.7+v*.45)*_(.45,1,S)*(.9+D(1-p)*.15);m([t[0]*M[0],t[1]*M[1],t[2]*M[2]],y,S*D(1-p*.8))}}default:{let d=W(i(6),i(6),s);return u=>{let p=d(u.u,u.v),x=.9+(c(u.u,u.v)-.5)*.3+(n(u.u,u.v)-.5)*.08+(p>.8?(p-.8)*1.6:0);m(t,x,c(u.u,u.v))}}}}function Io(r){let e=Zt(r),t=r.width+to,s=Math.round(e/t),o=Wt(r.color),a=r.boards==="composite";return{detail:!1,make:i=>{let n=w(4,s*10,3,i),l=w(2,s*3,2,i),c=Y(Math.max(4,Math.round(e/600)),i,.9),f=Array.from({length:s},()=>i());return(h,m)=>{let d=m*e,u=Math.floor(d/t),p=d-u*t;if(p>r.width)return[o[0]*.18,o[1]*.17,o[2]*.16,0];let x=f[u]*e;if(Math.min(Math.abs(h*e-x),e-Math.abs(h*e-x))<1.5)return[o[0]*.3,o[1]*.28,o[2]*.26,.05];let v=u*2+(h*e>x?1:0),b=F(v,4,13),M=F(v,8,13),S=U(D(Math.min(p,r.width-p)/4)),y=n(h+M,m),C,E;if(a)C=.97+(b-.5)*.06+(l(h+M,m)-.5)*.12+(y-.5)*.06,E=.85+(y-.5)*.12;else{let A=Math.abs(Math.sin((m*s*6+y*5+M*9)*Math.PI)),[k]=c(h+b*.37,m),N=r.boards==="softwood"&&k<.06&&M>.5?1-k/.06:0;C=.92+(b-.5)*.24+(y-.5)*.28-Math.pow(1-A,6)*.08-N*.3,E=.7+(r.boards==="softwood"?.5+.5*Math.cos(p/7*Math.PI*2):.5)*.2+(y-.5)*.1-N*.1}let R=C*_(.7,1,S);return[o[0]*R,o[1]*R,o[2]*R,E*_(.4,1,S)]}}}}function oo(r){let e=r.indexOf(":"),t=r.slice(0,e),s=r.slice(e+1);if(t==="pave"){let o=et(s);return o?Uo(o):null}if(t==="deck"){let o=tt(s);return o?Io(o):null}return null}function je(r,e,t,s,o=.45,a=!1){return{detail:a,make:i=>{let n=w(3,48,3,i),l=W(6,24,i),c=Array.from({length:r},()=>i()),f=t.map(V);return(h,m)=>{let d=Math.floor(m*r),u=T(m*r),p=h*e+c[d%r]*e,x=Math.floor(p),g=T(p),v=F(d,P(x,e),7),b=f[Math.floor(v*f.length)%f.length],M=n(h+v,m),S=l(h+v*.37,m),y=1+(v-.5)*s+(M-.5)*.35-Math.max(0,S-.8)*.8,C=Math.min(O(u,.02),O(g,.004*e)),E=y*_(o,1,C);return[b[0]*E,b[1]*E,b[2]*E,.4+.6*C-(1-M)*.05]}}}}function ht(r,e,t,s,o=.035,a=.06){return{detail:!1,make:i=>{let n=w(16,16,3,i),l=V(e),c=t===null?l:V(t),f=V(s);return(h,m)=>{let d=h*r,u=m*r,p=Math.floor(d),x=Math.floor(u),g=T(d),v=T(u),b=Math.min(O(g,o),O(v,o)),M=(p+x)%2===0?l:c,S=1+(F(P(p,r),P(x,r),3)-.5)*a+(n(h,m)-.5)*.06,y=te(f,[M[0]*S,M[1]*S,M[2]*S],b);return[y[0],y[1],y[2],b*.9+.1]}}}}function Xt(r,e,t,s,o=!1){return{detail:o,make:a=>{let i=w(64,64,2,a),n=w(4,4,3,a),l=t.map(V),c=V(s);return(f,h)=>{let m=Math.floor(h*e),d=T(h*e),u=f*r+m%2*.5,p=Math.floor(u),x=T(u),g=F(P(p,r),P(m,e),11),v=Math.min(O(x,.045),O(d,.14)),b=l[Math.floor(g*l.length)%l.length],M=.88+g*.18+(i(f,h)-.5)*.3+(n(f,h)-.5)*.15,S=o?[.96+(i(f,h)-.5)*.08,.96,.95]:[b[0]*M,b[1]*M,b[2]*M],y=o?[.86,.86,.85]:[c[0]*(.9+i(f,h)*.2),c[1]*(.9+i(f,h)*.2),c[2]*(.9+i(f,h)*.2)],C=te(y,S,U(v));return[C[0],C[1],C[2],.25+.75*U(v)-i(f,h)*.08]}}}}function Yt(r,e,t,s){return{detail:s,make:o=>{let a=e?w(48,3,3,o):w(3,48,3,o),i=t.map(V);return(n,l)=>{let c=e?n:l,f=e?l:n,h=Math.floor(c*r),m=T(c*r),d=F(P(h,r),0,5),u=i[Math.floor(d*i.length)%i.length],p=O(m,.06),x=e?1:.82+.18*U(D(m/.25)),g=(.92+d*.12+(a(n,l)-.5)*(s?.12:.3))*x*_(.45,1,p);return[u[0]*g,u[1]*g,u[2]*g,p*(e?1:.6+.4*m)]}}}}function We(r,e,t=0,s=!0){return{detail:s,make:o=>{let a=w(e,e,4,o),i=w(128,128,1,o);return(n,l)=>{let c=a(n,l),f=i(n,l),h=1-r*.5+(c-.5)*r-Math.max(0,f-.7)*t;return[h,h,h,c*.6+f*(t?.8:.2)]}}}}function ro(r,e,t=0){return{detail:!0,make:s=>{let o=w(8,8,3,s),a=w(4,r,2,s);return(i,n)=>{let l=Math.sin(i*r*Math.PI*2),c=Math.sin(n*r*Math.PI*2),f=(Math.floor(i*r)+Math.floor(n*r))%2===0,h=Math.abs(f?l:c),m=.9+h*e-e*.5+(o(i,n)-.5)*.08+(a(i,n)-.5)*t;return[m,m,m,h]}}}}function ft(r){return{detail:r.detail,make:e=>{let t=w(48,48,2,e),s=w(5,5,3,e),o=(r.tones??[16777215]).map(V),a=r.step??.55;return(i,n)=>{let l=Math.floor(n*r.courses),c=T(n*r.courses),f=i*r.perCourse+(r.stagger&&l%2?.5:0),h=Math.floor(f),m=T(f),d=F(P(h,r.perCourse),P(l,r.courses),21),u=1-c*a,p=_(.6,1,U(D((1-c)/.14)))*_(.82,1,U(D(c/.25)));if(r.rolls){let b=r.wave?Math.sin(m*Math.PI*2)*.5+.5*Math.sin(m*Math.PI):Math.sin(m*Math.PI*r.rolls);u+=b*r.roll*.4,p*=.9+b*r.roll*.25}r.camber&&(u+=Math.sin(m*Math.PI)*r.camber);let x=O(m,r.rolls?.02:.035);p*=_(.55,1,x);let g=o[Math.floor(d*o.length)%o.length],v=p*(1+(d-.5)*r.vary+(t(i,n)-.5)*.1+(s(i,n)-.5)*.08);return[g[0]*v,g[1]*v,g[2]*v,D(u*.8*x+(t(i,n)-.5)*.05)]}}}}var Oo={planks_light:je(13,2,[14467226,13939850,14862500,13610628],.12),planks_oak:je(13,2,[13213810,12555366,13806204,12160092],.14),planks_walnut:je(13,2,[8084033,7229240,8807242,6243120],.16),planks_grey:je(13,2,[12104362,11446174,12762292,10854037],.1),vinyl:je(8,2,[16777215],.05,.75,!0),herringbone:{detail:!1,make:r=>{let e=w(4,64,3,r),t=[12885102,12095328,13609082,11437398].map(V),s=4,o=16;return(a,i)=>{let n=a*o,l=i*o,c=Math.floor(n),f=Math.floor(l),h=T(n),m=T(l),d=P(c+f,2*s),u,p,x,g;d<s?(g=!0,u=(d+h)/s,p=m,x=F(P(c-d,o),P(f,o),1)):(g=!1,u=(d-s+m)/s,p=h,x=F(P(c,o),P(f-(d-s),o),2));let v=t[Math.floor(x*t.length)%t.length],b=g?e(a,i):e(i,a),M=Math.min(O(p,.05),O(u,.012)),S=(.92+x*.14+(b-.5)*.3)*_(.45,1,M);return[v[0]*S,v[1]*S,v[2]*S,.4+.6*M]}}},tiles_light:ht(2,14474456,null,12171184),tiles_dark:ht(2,5921888,null,4605770),tiles_terracotta:ht(4,12086603,null,13483950,.05,.16),checker:ht(4,15658730,2960945,10132118,.02,.03),tiles_metro:{detail:!0,make:r=>{let e=w(8,8,2,r);return(t,s)=>{let o=Math.floor(s*6),a=t*3+o%2*.5,i=Math.min(O(T(a),.03),O(T(s*6),.06)),n=Math.min(O(T(a),.12),O(T(s*6),.24)),l=_(.72,1,U(i))*(.97+(e(t,s)-.5)*.04);return[l,l,l,.2+.5*U(i)+.3*U(n)]}}},marble:{detail:!1,make:r=>{let e=w(4,4,5,r),t=w(8,8,3,r);return(s,o)=>{let a=Math.abs(Math.sin((s*2+o+e(s,o)*2.4)*Math.PI*2)),i=Math.pow(1-D(a/.12),2)*.5+Math.pow(1-D(Math.abs(Math.sin((o*3-s+t(s,o)*3)*Math.PI*2))/.05),2)*.25,n=Math.min(O(T(s*2),.004),O(T(o*2),.004)),l=te([.93,.925,.91],[.55,.56,.58],i),c=_(.7,1,n);return[l[0]*c,l[1]*c,l[2]*c,n]}}},carpet:{detail:!0,make:r=>{let e=w(96,96,2,r),t=w(6,6,3,r);return(s,o)=>{let a=.86+(e(s,o)-.5)*.22+(t(s,o)-.5)*.08;return[a,a,a,e(s,o)]}}},flagstone:{detail:!1,make:r=>{let e=Y(4,r,.7),t=w(24,24,3,r),s=[12169894,11117463,12893616,10393483].map(V);return(o,a)=>{let[i,n,l]=e(o,a),c=D((n-i)/.08),f=s[l%s.length],h=.9+(t(o,a)-.5)*.3+F(l)*.1,m=te([.45,.43,.4],[f[0]*h,f[1]*h,f[2]*h],U(c));return[m[0],m[1],m[2],U(c)*.8+t(o,a)*.2]}}},concrete:We(.16,6,.25),plaster:We(.05,8,0),render:We(.1,10,.2),pebbledash:{detail:!0,make:r=>{let e=Y(40,r,.9),t=w(8,8,2,r);return(s,o)=>{let[a,,i]=e(s,o),n=D(1-a/.5),l=.8+n*.2+(F(i)-.5)*.12+(t(s,o)-.5)*.05;return[l,l,l,n]}}},wp_stripes:{detail:!0,make:r=>{let e=w(4,16,2,r);return(t,s)=>{let o=T(t*8),a=o<.5?1:.86,i=Math.abs(o-.75)<.012?.8:1,n=a*i*(.98+(e(t,s)-.5)*.03);return[n,n,n,.5]}}},wp_damask:{detail:!0,make:()=>(r,e)=>{let t=r*2,s=e*3,o=Math.floor(s),a=T(t+o%2*.5)-.5,i=T(s)-.5,n=Math.hypot(a,i*1.3),l=Math.atan2(i,a),c=.26+.07*Math.cos(l*6)+.03*Math.cos(l*12),f=n<c?n<.08||n>.13&&n<.16?0:1:0,h=Math.abs(Math.sin((a+i)*14)*Math.sin((a-i)*14))>.92&&n>.33?1:0,m=f||h?.82:1;return[m,m,m,f||h?.6:.4]}},wp_geo:{detail:!0,make:()=>(r,e)=>{let t=T(r*4+e*3),s=T(r*4-e*3),o=Math.min(Math.abs(t-.5),Math.abs(s-.5))<.035,a=(Math.floor(r*4+e*3)+Math.floor(r*4-e*3))%2===0,i=o?.7:a?.94:1;return[i,i,i,o?.3:.5]}},wp_leaves:{detail:!0,make:r=>{let t=Array.from({length:25},()=>({x:r(),y:r(),a:r()*Math.PI,s:.7+r()*.5,t:r()}));return(s,o)=>{let a=1,i=.4,n=Math.floor(s*5),l=Math.floor(o*5);for(let c=-1;c<=1;c++)for(let f=-1;f<=1;f++){let h=n+f,m=l+c,d=t[P(m,5)*5+P(h,5)],u=(h+d.x)/5,p=(m+d.y)/5,x=(s-u)*5,g=(o-p)*5,v=Math.cos(d.a),b=Math.sin(d.a),M=(x*v+g*b)/d.s,S=(-x*b+g*v)/d.s;if(M*M/.36+S*S/.05<1){let C=Math.abs(S)<.015?.1:0;a=Math.min(a,(d.t>.5?.72:.8)+C),i=.7}}return[a,a,a,i]}}},panelling:{detail:!0,make:r=>{let e=w(6,6,2,r),t=[.05,.42,.958];return(s,o)=>{let a=T(s*4),i=Math.min(...t.map(d=>Math.abs(o-d))),n=Math.min(a,1-a)*.6,l=i*2.4,c=Math.min(n,l),f=U(D((c-.05)/.025)),h=o<.05?1:0,m=(h?.97:_(1,.93,f))*(.985+(e(s,o)-.5)*.03);return[m,m,m,h?1:1-f*.5]}}},brick_red:Xt(6,18,[10902080,10112824,11822666,9325109,11364946],13222066),brick_buff:Xt(6,18,[13281142,12622697,13874053,12160861],14209218),brick_painted:Xt(6,18,[16777215],16777215,!0),stone_wall:{detail:!1,make:r=>{let e=w(16,16,3,r),t=[0,.16,.3,.47,.6,.77,.88,1],s=[12103064,10984584,12826788,10326655,11576462].map(V);return(o,a)=>{let i=0;for(;i<t.length-2&&a>=t[i+1];)i++;let n=t[i],l=t[i+1],c=(a-n)/(l-n),f=3+i%3,h=o*f+F(i,1)*.7,m=Math.floor(h),d=T(h),u=F(P(m,f),i,4),p=Math.min(O(d,.04),O(c,.1)),x=s[Math.floor(u*s.length)%s.length],g=.88+u*.16+(e(o,a)-.5)*.3,v=te([.62,.6,.56],[x[0]*g,x[1]*g,x[2]*g],U(p));return[v[0],v[1],v[2],U(p)*(.8+e(o,a)*.2)]}}},boards_v:Yt(10,!0,[11569248,10976853,12293227],!1),boards_h:Yt(8,!1,[16777215],!0),timber_h:Yt(8,!1,[10976081,10252360,11765596,9660996],!1),concrete_panels:{detail:!0,make:r=>{let e=w(6,6,4,r),t=w(96,96,1,r);return(s,o)=>{let a=T(s*2),i=T(o*2),n=Math.min(O(a,.006),O(i,.006)),l=[.2,.8].some(f=>[.2,.8].some(h=>Math.hypot(a-f,i-h)<.012))?.55:1,c=(.9+(e(s,o)-.5)*.18-Math.max(0,t(s,o)-.75)*.2)*_(.6,1,n)*l;return[c,c,c,n*l]}}},grass:{detail:!1,make:r=>{let e=w(4,4,3,r),t=w(128,128,2,r);return(s,o)=>{let a=e(s,o),i=t(s,o),n=te(V(7313992),V(10272610),a),l=.78+i*.36;return[n[0]*l,n[1]*l*(.95+a*.08),n[2]*l*.9,i]}}},soil:{detail:!1,make:r=>{let e=w(24,24,4,r);return(t,s)=>{let o=.75+e(t,s)*.5;return[.36*o,.27*o,.2*o,e(t,s)]}}},weave:ro(110,.14),linen:ro(90,.1,.12),velvet:We(.08,12,0),boucle:{detail:!0,make:r=>{let e=Y(70,r,.9);return(t,s)=>{let[o]=e(t,s),a=D(1-o/.6),i=.84+a*.16;return[i,i,i,a]}}},leather:{detail:!0,make:r=>{let e=Y(36,r,.9),t=w(6,6,3,r);return(s,o)=>{let[a,i]=e(s,o),n=D((i-a)/.12),l=(.9+(t(s,o)-.5)*.16)*_(.82,1,n);return[l,l,l,n*.6+a*.2]}}},wood_grain:{detail:!0,make:r=>{let e=w(3,40,4,r);return(t,s)=>{let o=e(t,s),a=Math.abs(Math.sin((s*22+o*6)*Math.PI)),i=.86+o*.16-Math.pow(1-a,6)*.08;return[i,i,i,o]}}},wood_grain_v:{detail:!0,make:r=>{let e=w(40,3,4,r);return(t,s)=>{let o=e(t,s),a=Math.abs(Math.sin((t*22+o*6)*Math.PI)),i=.86+o*.16-Math.pow(1-a,6)*.08;return[i,i,i,o]}}},brushed:{detail:!0,make:r=>{let e=w(2,256,2,r);return(t,s)=>{let o=.92+(e(t,s)-.5)*.12;return[o,o,o,e(t,s)]}}},foliage:{detail:!0,make:r=>{let e=Y(24,r,.9),t=w(8,8,2,r);return(s,o)=>{let[a,i,n]=e(s,o),l=D((i-a)/.2),c=(.7+F(n)*.4)*_(.6,1,l)+(t(s,o)-.5)*.1;return[c,c,c,l]}}},rug:{detail:!0,make:r=>{let e=w(96,96,1,r);return(t,s)=>{let o=Math.abs(T(t*4)-.5)+Math.abs(T(s*4)-.5),a=Math.abs(T(o*3)-.5)<.12,n=(Math.abs(T(s*4)-.5)>.46?.62:a?.74:o<.18?.86:1)*(.92+e(t,s)*.1);return[n,n,n,e(t,s)]}}},canvas_art:{detail:!0,make:r=>{let e=Array.from({length:9},()=>({x:r(),y:r(),r:.08+r()*.2,t:r()})),t=w(64,64,1,r);return(s,o)=>{let a=.95;for(let i of e)Math.hypot(P(s-i.x+.5,1)-.5,P(o-i.y+.5,1)-.5)<i.r&&(a=Math.min(a,.35+i.t*.55));return[a+(t(s,o)-.5)*.04,a,a,t(s,o)*.3]}}},roof_interlocking:ft({courses:5,perCourse:5,stagger:!1,rolls:2,roll:.25,vary:.08,detail:!0}),roof_plain:ft({courses:12,perCourse:7,stagger:!0,rolls:0,roll:0,vary:.22,detail:!0,camber:.15}),roof_slate:ft({courses:7,perCourse:6,stagger:!0,rolls:0,roll:0,vary:.12,detail:!1,tones:[4935512,4606549,5329756,4869458,5592158],step:.35}),roof_pantile:ft({courses:5,perCourse:6,stagger:!1,rolls:1,roll:.75,vary:.14,detail:!0,wave:!0}),roof_thatch:{detail:!1,make:r=>{let e=w(96,6,3,r),t=w(6,6,3,r);return(s,o)=>{let a=o*6+(t(s,o)-.5)*.5,i=T(a),n=e(s,o*.5+Math.floor(a)*.37),l=(.7+n*.45)*_(.62,1,U(D(i/.3))),c=te(V(10257487),V(12888946),t(s,o));return[c[0]*l,c[1]*l,c[2]*l,n*.7+(1-i)*.3]}}},roof_seam:{detail:!0,make:r=>{let e=w(4,16,3,r);return(t,s)=>{let o=T(t*3),a=1-O(o,.03),i=.96+(e(t,s)-.5)*.05+a*.1-(1-O(o,.06))*.06;return[i,i,i,.3+a*.7+(e(t,s)-.5)*.05]}}},logs:{detail:!0,make:r=>{let e=w(3,64,3,r);return(t,s)=>{let o=T(s*8),a=Math.sin(o*Math.PI),i=(.62+.4*Math.pow(a,.5))*(.94+(e(t,s)-.5)*.18);return[i,i,i,a]}}},corrugated:{detail:!0,make:r=>{let e=w(4,4,2,r);return(t,s)=>{let o=Math.sin(t*10*Math.PI*2),a=.86+o*.12+(e(t,s)-.5)*.05;return[a,a,a,.5+o*.5]}}},shingles:{detail:!0,make:r=>{let e=w(128,128,1,r);return(t,s)=>{let o=Math.floor(s*7),a=T(s*7),i=t*3+o%2*.5+F(o,4)*.3,n=T(i),l=F(Math.floor(i),o,8),c=O(n,.03),f=_(.6,1,U(D((1-a)/.18))),h=(.88+(l-.5)*.18+(e(t,s)-.5)*.25)*f*_(.5,1,c);return[h,h,h,(1-a*.6)*c]}}},rust:{detail:!0,make:r=>{let e=w(5,5,4,r),t=w(96,96,2,r);return(s,o)=>{let a=e(s,o),i=t(s,o);return[.86+a*.3+(i-.5)*.12,.84+a*.24+(i-.5)*.1,.82+a*.18+(i-.5)*.08,i]}}},roof_felt:{detail:!0,make:r=>{let e=w(160,160,1,r),t=w(6,6,3,r);return(s,o)=>{let a=T(o*2),i=_(.8,1,U(D(a/.06))),n=(.9+(e(s,o)-.5)*.35+(t(s,o)-.5)*.08)*i;return[n,n,n,e(s,o)*.5+(a<.03?0:.5)]}}},roof_epdm:{detail:!1,make:r=>{let e=w(5,5,4,r);return(t,s)=>{let o=.95+(e(t,s)-.5)*.12;return[.165*o,.17*o,.18*o,e(t,s)*.3]}}},roof_grp:We(.05,5,.05),roof_lead:{detail:!1,make:r=>{let e=w(6,6,4,r);return(t,s)=>{let o=T(t*2.5),a=Math.max(0,1-Math.abs(o-.5)/.05),i=te(V(7304571),V(9410203),e(t,s)),n=.92+a*.15;return[i[0]*n,i[1]*n,i[2]*n,.3+a*.7]}}},roof_sedum:{detail:!1,make:r=>{let e=Y(28,r,.9),t=w(5,5,3,r),s=[6192956,8033350,9071418,10308154,7113290,11051098].map(V);return(o,a)=>{let[i,n,l]=e(o,a),c=t(o,a),f=s[Math.floor(F(l,Math.floor(c*3),9)*s.length)%s.length],h=U(D((n-i)*3)),m=.65+h*.45;return[f[0]*m,f[1]*m,f[2]*m,h]}}}},mt=new Map;function io(r,e,t){let s=ao(r);if(!s)return null;let o=`${r}@${e}`,a=mt.get(o);if(a)return a;let i=s.make(Ht(Lo(r))),n=document.createElement("canvas");n.width=n.height=e;let l=n.getContext("2d"),c=l.createImageData(e,e),f=new Float32Array(e*e);for(let v=0;v<e;v++){let b=1-(v+.5)/e;for(let M=0;M<e;M++){let[S,y,C,E]=i((M+.5)/e,b),R=(v*e+M)*4;c.data[R]=D(S)*255,c.data[R+1]=D(y)*255,c.data[R+2]=D(C)*255,c.data[R+3]=255,f[v*e+M]=E}}l.putImageData(c,0,0);let h=new Ne(n);h.colorSpace=s.detail?It:Ke;let m=document.createElement("canvas");m.width=m.height=e;let d=m.getContext("2d"),u=d.createImageData(e,e),p=e/128;for(let v=0;v<e;v++)for(let b=0;b<e;b++){let M=f[v*e+P(b-1,e)],S=f[v*e+P(b+1,e)],y=f[P(v-1,e)*e+b],C=f[P(v+1,e)*e+b],E=-(S-M)*p,R=-(y-C)*p,A=Math.hypot(E,R,1),k=(v*e+b)*4;u.data[k]=(E/A*.5+.5)*255,u.data[k+1]=(R/A*.5+.5)*255,u.data[k+2]=(1/A*.5+.5)*255,u.data[k+3]=255}d.putImageData(u,0,0);let x=new Ne(m);x.colorSpace=It;for(let v of[h,x])v.wrapS=v.wrapT=ae,v.minFilter=hs,v.anisotropy=t;let g={map:h,normal:x};return mt.set(o,g),g}function ao(r){return Oo[r]??oo(r)}function no(r){var e;return((e=ao(r))==null?void 0:e.detail)??!0}function Lo(r){let e=2166136261;for(let t=0;t<r.length;t++)e=Math.imul(e^r.charCodeAt(t),16777619);return e>>>0}function lo(){var r;for(let e of mt.values())e.map.dispose(),(r=e.normal)==null||r.dispose();mt.clear()}var Bo=`
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
}`,zo=`
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
}`,Vo=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha * vAlpha); }`,Go=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1.0 - d * 3.2));
}`,Ho=new I(8227744),jo=new I(13226982);function co(r,e,t){return new H({vertexShader:r,fragmentShader:e,uniforms:t,transparent:!0,depthWrite:!1,blending:ss,fog:!1})}var dt=class{constructor(e){this.group=new Ms;this.shared={uTime:{value:0},uTop:{value:10},uHeight:{value:12},uWind:{value:new L}};this.rainU={...this.shared,uFall:{value:8},uLen:{value:.42},uColor:{value:new I(12109010)},uAlpha:{value:.32}};this.snowU={...this.shared,uFall:{value:.9},uSize:{value:.045},uScale:{value:800},uColor:{value:new I(16777215)},uAlpha:{value:.9}};this.area=null;this.key="";this.rainMax=e?9e3:4500,this.snowMax=e?7e3:3500,this.rain=new _s(new de,co(Bo,Vo,this.rainU)),this.snow=new Ps(new de,co(zo,Go,this.snowU));for(let t of[this.rain,this.snow])t.frustumCulled=!1,t.renderOrder=4,t.visible=!1;this.group.add(this.rain,this.snow)}setArea(e){this.area=e,this.key=""}set(e){let t=this.area,s=!!t&&(e.rain>.02||e.snow>.02);if(this.rain.visible=!!t&&e.rain>.02,this.snow.visible=!!t&&e.snow>.02,!t||!s)return!1;this.shared.uTop.value=t.top,this.shared.uHeight.value=t.top-t.ground;let o=this.rain.visible?.55:.9;this.shared.uWind.value.set(e.drift[0]*o,e.drift[1]*o),this.rainU.uColor.value.setHex(12109010).lerp(Ho,e.dark),this.rainU.uAlpha.value=.45-.13*e.dark,this.snowU.uColor.value.setHex(16777215).lerp(jo,e.dark);let a=[t.minX,t.maxX,t.minZ,t.maxZ,t.top,t.ground,t.rooms.length,Math.round(e.drift[0]),Math.round(e.drift[1])].map(i=>Number(i).toFixed(1)).join("|");return a!==this.key&&(this.key=a,this.build(t)),this.rain.geometry.setDrawRange(0,Math.round(this.rainMax*Math.min(1,e.rain))*2),this.snow.geometry.setDrawRange(0,Math.round(this.snowMax*Math.min(1,e.snow))),!0}tick(e,t){this.shared.uTime.value=e,this.snowU.uScale.value=t}build(e){let t=e.top-e.ground,s=this.shared.uWind.value,o=[this.rainU.uFall.value,this.snowU.uFall.value].map(g=>[s.x*(t/g/2),s.y*(t/g/2)]),a=(g,v,b)=>{for(let M of[-1,0,1]){let S=[g+b[0]*M,v+b[1]*M];if(e.rooms.some(y=>$t(S,y)||y.some((C,E)=>Jt(S,C,y[(E+1)%y.length]).d<.35)))return!1}return!0},i=Math.max(6,.45*Math.max(e.maxX-e.minX,e.maxZ-e.minZ)),n=e.minX-i,l=e.maxX+i,c=e.minZ-i,f=e.maxZ+i,h=12345,m=()=>(h=h*1103515245+12345&2147483647)/2147483647,d=(g,v)=>{let b=[];for(let M=0;b.length<g&&M<g*6;M++){let S=n+m()*(l-n),y=c+m()*(f-c);a(S,y,v)&&b.push([S,y,m(),.6+m()*.8])}return b},u=d(this.rainMax,o[0]),p=new Float32Array(u.length*8);u.forEach((g,v)=>{p.set([g[0],g[1],g[2],0,g[0],g[1],g[2],1],v*8)}),this.replace(this.rain,p);let x=d(this.snowMax,o[1]);this.replace(this.snow,new Float32Array(x.flat()))}replace(e,t){let s=new de;s.setAttribute("aSeed",new Ot(t,4)),s.setAttribute("position",new Ot(new Float32Array(t.length/4*3),3)),e.geometry.dispose(),e.geometry=s}dispose(){for(let e of[this.rain,this.snow])e.geometry.dispose(),e.material.dispose()}};var Wo={wood:{tex:"wood_grain",scale:.9,rough:.5,relief:.25},woodDark:{tex:"wood_grain",scale:.9,rough:.45,relief:.25},white:{rough:.45},dark:{rough:.45},metal:{tex:"brushed",scale:.5,rough:.3,metal:.85},glass:{rough:.04,opacity:.28},plant:{tex:"foliage",scale:.35,rough:.65,relief:.8},leaf:{tex:"foliage",scale:.3,rough:.6,relief:.8},pot:{tex:"plaster",scale:.5,rough:.8,relief:.3},soil:{tex:"carpet",scale:.3,rough:1},accent:{rough:.45},red:{rough:.5},blue:{rough:.5},screen:{rough:.12,metal:.2},ceramic:{rough:.1},rug:{tex:"rug",scale:1.2,rough:.95,relief:.3},mattress:{tex:"weave",scale:.3,rough:.9,relief:.2},bulb:{rough:.55},paper:{rough:.85},canvas:{tex:"canvas_art",scale:1,rough:.85,relief:.2},mirror:{rough:.02,metal:1},water:{rough:.03,opacity:.8},rubber:{rough:.85},pine:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},softwood:{tex:"wood_grain_v",scale:.6,rough:.7,relief:.15},oak:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},walnut:{tex:"wood_grain_v",scale:.6,rough:.45,relief:.2},primed:{rough:.85},blackMetal:{rough:.4,metal:.6},concrete:{tex:"concrete",scale:.8,rough:.9,relief:.25},brick:{tex:"brick_red",scale:1.35,rough:.85,relief:.9},shiplap:{tex:"boards_h",scale:1.2,rough:.7,relief:.7},logs:{tex:"logs",scale:1.12,rough:.7,relief:.9},corrugated:{tex:"corrugated",scale:.76,rough:.45,metal:.3,relief:.9},felt:{tex:"roof_felt",scale:2,rough:.95,relief:.4},shingle:{tex:"shingles",scale:1,rough:.9,relief:.8},epdm:{tex:"roof_epdm",scale:3,rough:.8,relief:.15},sedum:{tex:"roof_sedum",scale:1.5,rough:1,relief:.8},corten:{tex:"rust",scale:1,rough:.8,relief:.3},galvanised:{tex:"brushed",scale:.5,rough:.35,metal:.7},sleeper:{tex:"wood_grain_v",scale:.6,rough:.85,relief:.4},stone:{tex:"stone_wall",scale:1,rough:.85,relief:.9},rattan:{tex:"weave",scale:.15,rough:.8,relief:.6},bloom:{tex:"foliage",scale:.25,rough:.7,relief:.6},lavender:{tex:"foliage",scale:.25,rough:.7,relief:.6},straw:{tex:"foliage",scale:.3,rough:.75,relief:.6},plastic:{rough:.6},lid:{rough:.5}},Qo={cap:{rough:.9},slab:{tex:"concrete",scale:3,rough:.9,relief:.2},blind:{tex:"linen",scale:.3,rough:.9,relief:.2},glass:{rough:.04,opacity:.3},pv:{rough:.38,metal:.05}},uo={lawn:{tex:"grass",scale:2,rough:.95,relief:.4},bed:{tex:"soil",scale:1.5,rough:1,relief:.6}};function mo(r){let[e,t]=r.split(":"),s=Is(r);if(s)return{tex:s.tex,scale:s.scale,rough:s.roughness,metal:s.metalness,relief:s.relief};if(e==="role")return Wo[t]??{rough:.6};if(e==="out")return uo[t]??uo.lawn;if(e==="pave"){let o=et(t);if(o)return{tex:r,scale:Qt(o)/1e3,rough:ge[o.material].roughness,relief:ge[o.material].relief,res:2}}if(e==="deck"){let o=tt(t);if(o)return{tex:r,scale:Zt(o)/1e3,rough:Bs[o.boards].roughness,relief:.7,res:2}}return Qo[e]??{rough:.6}}function Zo(r){let e=mo(r);return!!e.tex&&!no(e.tex)}var po={value:1},ne={uFill:{value:1},uSkyTint:{value:new I(1,1,1)},uWet:{value:0},uSnow:{value:0},uTime:{value:0},uSway:{value:new L}},Xo=Bt+`
attribute vec3 aLamp;
attribute vec3 aEmis;
uniform float uIndoor;
uniform float uTime;
uniform vec2 uSway;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,Yo=zt+`
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
`,qo=Os+`
uniform float uLampGain;
uniform float uFill;
uniform vec3 uSkyTint;
uniform float uWet;
uniform float uSnow;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,Ko=`
float vhFaceUp = smoothstep(0.5, 0.9, vUp);
float vhWet = uWet * vOut * (0.35 + 0.65 * vhFaceUp);
float vhSnow = uSnow * vOut * vhFaceUp;
diffuseColor.rgb *= 1.0 - 0.3 * vhWet;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), vhSnow * 0.94);
`,$o=`
roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.16), vhWet * vhFaceUp * (1.0 - vhSnow));
roughnessFactor = mix(roughnessFactor, 0.85, vhSnow);
`;function Jo(r,e,t){r.onBeforeCompile=s=>{Object.assign(s.uniforms,e,ne,{uLampGain:po}),s.vertexShader=Xo+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+Yo),s.fragmentShader=qo+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+Ls+Ko).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+$o).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vEmis;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
reflectedLight.indirectDiffuse *= mix(uFill, 1.0, vOut) * uSkyTint;
reflectedLight.indirectSpecular *= uSkyTint;
reflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;`)},r.customProgramCacheKey=()=>t}var er=new Set(["role:plant","role:leaf","role:bloom","role:lavender","role:straw"]);function tr(r,e,t){return r.onBeforeCompile=s=>{Object.assign(s.uniforms,e),s.vertexShader=Bt+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+zt)},r.customProgramCacheKey=()=>t,r}function sr(){let r=document.createElement("canvas");r.width=4,r.height=256;let e=new Ne(r);return e.colorSpace=Ke,e}function or(r,e,t,s){let a=r.image.getContext("2d"),i=a.createLinearGradient(0,0,0,256);i.addColorStop(0,`#${e.getHexString()}`),i.addColorStop(.55,`#${t.getHexString()}`),i.addColorStop(1,`#${s.getHexString()}`),a.fillStyle=i,a.fillRect(0,0,4,256),r.needsUpdate=!0}var pt=(r,e,t)=>{let s=Math.max(0,Math.min(1,(t-r)/(e-r)));return s*s*(3-2*s)},fe=(r,e,t)=>new I(r).lerp(new I(e),Math.max(0,Math.min(1,t))),rr=new I(16747114),qt=new B(-.45,.78,.45).normalize();function ho(r,e,t){let s=(r-t)*Math.PI/180,o=e*Math.PI/180;return new B(Math.sin(s)*Math.cos(o),Math.sin(o),-Math.cos(s)*Math.cos(o)).normalize()}function ir(){try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}var fo=class{constructor(e,t,s,o){this.renderer=e;this.scene=t;this.camera=s;this.groundMaterial=new pe({color:13226434,roughness:1});this.castOnly=new $e({colorWrite:!1,depthWrite:!1,side:kt});this.sun=new Fs(16773596,2.6);this.skyTex=sr();this.skyPainted="";this.materialsByFloor=new Map;this.registered=new Map;this.sky=null;this.north=0;this.nextFlash=0;this.flash=null;this.envBase=.55;this.haze={fog:0,gloom:0,glow:0};this.calm=ir();this.falling=!1;this.composer=null;this.gtao=null;this.bloom=null;this.normalTarget=null;this.sunDir=qt.clone();this.centre=new B;this.radius=10;this.box=new ws(new B(-5,0,-5),new B(5,3,5));this.groundY=0;this.night=!1;this.follow=!1;this.dark=0;this.ultra=o,this.texSize=o?1024:512,this.aniso=Math.min(o?16:8,e.capabilities.getMaxAnisotropy()),e.toneMapping=qe,e.toneMappingExposure=1,e.shadowMap.enabled=!0,e.shadowMap.type=es,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;let a=new Ns(e);this.envTex=a.fromScene(new ct,.04).texture,a.dispose(),t.environment=this.envTex,this.sun.castShadow=!0;let i=o?4096:2048;this.sun.shadow.mapSize.set(i,i),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=3,t.add(this.sun,this.sun.target),this.groundMaterial.envMapIntensity=.8,this.fx=new dt(o),t.add(this.fx.group),t.background=this.skyTex,o&&this.setupComposer(),this.setNight(!1)}geometry(e){let t=e.surfaces.map(s=>Zo(s));return e.toRealisticGeometry(s=>t[s]??!1)}materials(e,t){let s=this.materialsByFloor.get(t);return s||(s=new Map,this.materialsByFloor.set(t,s)),e.surfaces.map(o=>{let a=s.get(o);return a||(a=this.makeMaterial(o,t),s.set(o,a)),a})}makeMaterial(e,t){let s=mo(e),o=new pe({vertexColors:!0,roughness:s.rough,metalness:s.metal??0});if(s.tex){let i=io(s.tex,Math.min(1024,this.texSize*(s.res??1)),this.aniso);if(i){let n=1/(s.scale??1);o.map=i.map.clone(),o.map.repeat.set(n,n),i.normal&&(s.relief??0)>0&&(o.normalMap=i.normal.clone(),o.normalMap.repeat.set(n,n),o.normalScale.set(s.relief,-s.relief))}}s.opacity!==void 0&&(o.transparent=!0,o.opacity=s.opacity,o.depthWrite=!1),e==="glass"&&(o.side=kt,o.forceSinglePass=!0);let a=er.has(e);return a&&(o.defines={VH_SWAY:1}),Jo(o,t,a?"vh-std-sway":"vh-std"),o}glassMaterial(e,t){return this.materials(e,t)[0]}attach(e,t,s){if(e.castShadow=s,e.receiveShadow=!0,this.ultra){let o=tr(new Ie,t,"vh-normal");o.blending=Q,this.registered.set(e,{mesh:e,normal:o})}this.markShadows()}attachGround(e){if(e.receiveShadow=!0,this.ultra){let t=new Ie;t.blending=Q,this.registered.set(e,{mesh:e,normal:t})}}detach(e){let t=this.registered.get(e);t&&(t.normal.dispose(),this.registered.delete(e))}releaseFloor(e){var t,s,o;for(let a of((t=this.materialsByFloor.get(e))==null?void 0:t.values())??[]){let i=a;(s=i.map)==null||s.dispose(),(o=i.normalMap)==null||o.dispose(),a.dispose()}this.materialsByFloor.delete(e)}setNight(e,t=!1){this.night=e,this.follow=t,this.applySky()}get darkness(){return this.dark}setSun(e,t,s){this.setSky({...this.sky??Xs(),sun:e===null||t===null?null:{azimuth:e,elevation:t}},s)}setSky(e,t){this.sky=e,this.north=t,this.applySky()}applySky(){let e=this.sky,t=(e==null?void 0:e.cloud)??.2,s=(e==null?void 0:e.rain)??0,o=(e==null?void 0:e.snow)??0,a=(e==null?void 0:e.fog)??0,i=!!(e!=null&&e.storm),n=Math.max(s*.65,i?.6:0,o*.25,a*.2),l=(e==null?void 0:e.sun)??null,c=this.sun.shadow,f=!!l&&l.elevation>-1,h=this.follow&&l?l.elevation:this.night?-90:f?l.elevation:40,m=Vs(h);if(this.dark=m,h>-1){this.sunDir.copy(f?ho(l.azimuth,Math.max(.5,h),this.north):qt),this.sun.intensity=3.2*Gs(h)*(1-.9*t)*(1-.3*n);let b=new I().setRGB(...zs(js(h))).lerp(rr,.3*Ws(h));this.sun.color.copy(b.lerp(new I(16054010),t*.8)),c.intensity=Math.max(.06,1-.9*t),c.radius=3+7*t}else{let b=(e==null?void 0:e.moon)??null,M=(b==null?void 0:b.elevation)??-90,S=M>0,y=S?pt(0,6,M):pt(0,-3,M);this.sunDir.copy(S?ho(b.azimuth,Math.max(.5,M),this.north):qt),this.sun.intensity=(S?.38*(.3+.7*b.lit):.2)*y*(1-.7*t)*Hs(h),this.sun.color.setHex(9348863),c.intensity=(S?.65:.3)*(1-.8*t),c.radius=4+6*t}let d=(.25+.4*t)*(.6+.4*pt(-1,12,h))*(1-.32*n),u=.05+.025*t;this.envBase=d+(u-d)*m,this.scene.environmentIntensity=this.envBase,this.renderer.toneMappingExposure=1,ne.uFill.value=1+.75*(1-t)*(1-m);let{sky:p,tint:x}=Qs(h),g=1-.75*t;ne.uSkyTint.value.setRGB(1+(x[0]-1)*g,1+(x[1]-1)*g,1+(x[2]-1)*g,gs),po.value=.154+.346*m,this.bloom&&(this.bloom.strength=.12+.2*m);let v=Zs(h)*(1-t);this.paintSky(p,m,t,n,a,v),this.ground(e,h,m,v),ne.uWet.value=(e==null?void 0:e.wet)??0,ne.uSnow.value=(e==null?void 0:e.snowCover)??0,this.placeSun(),this.applyFx()}paintSky(e,t,s,o,a,i){let n=[fe(11713219,1053726,t),fe(13028562,1777705,t),fe(14343906,2501430,t)],l=[6712952,8752277,10791601],c=fe(14014940,2764602,t),[f,h,m]=e.map((p,x)=>{let g=fe(p,n[x].getHex(),s).lerp(new I(l[x]),o*(1-t));return a>0?g.lerp(c,a*(.85+.075*x)):g}),d=f.getHexString()+h.getHexString()+m.getHexString();d!==this.skyPainted&&(this.skyPainted=d,or(this.skyTex,f,h,m)),this.haze={fog:a,gloom:o,glow:i};let u=this.scene.fog;u?u.color.copy(m):this.scene.fog=new Ss(m.getHex(),1,2),this.placeFog()}placeFog(){let e=this.scene.fog;if(!e)return;let t=this.radius,s=this.camera.position.distanceTo(this.centre),{fog:o,gloom:a,glow:i}=this.haze;e.near=Math.max(.5,s+t*(1.5-1.9*o-.5*i)*(1-.3*a)),e.far=s+t*(5-3.6*o-1.8*i)*(1-.25*a)}ground(e,t,s,o){let a=fe(13029309,14075566,o*pt(-3,1,t)).lerp(new I(2765606),s),i=(e==null?void 0:e.wet)??0,n=(e==null?void 0:e.snowCover)??0;a.multiplyScalar(1-.25*i).lerp(fe(15659766,8226710,s),n).multiply(ne.uSkyTint.value),this.groundMaterial.color.copy(a),this.groundMaterial.roughness=n>.5?.9:1-.45*i}fit(e,t){this.box.copy(e),this.groundY=t,e.getCenter(this.centre);let s=e.getSize(new B);this.radius=Math.max(6,Math.hypot(s.x,s.z)/2),this.applySky()}placeSun(){let e=this.sunDir,t=this.box.getSize(new B).length();this.sun.target.position.copy(this.centre),this.sun.position.copy(this.centre).addScaledVector(e,t+20),this.sun.target.updateMatrixWorld(),this.sun.updateMatrixWorld();let s=this.sun.shadow.camera;s.position.copy(this.sun.position),s.lookAt(this.centre),s.updateMatrixWorld();let o=s.matrixWorldInverse,a=this.box,i=1/0,n=1/0,l=1/0,c=-1/0,f=-1/0,h=-1/0,m=new B,d=x=>{m.copy(x).applyMatrix4(o),i=Math.min(i,m.x),c=Math.max(c,m.x),n=Math.min(n,m.y),f=Math.max(f,m.y),l=Math.min(l,m.z),h=Math.max(h,m.z)},u=e.y>.01?1/e.y:100;for(let x of[a.min.x,a.max.x])for(let g of[a.min.y,a.max.y])for(let v of[a.min.z,a.max.z]){let b=new B(x,g,v);d(b),d(b.addScaledVector(e,-Math.min(150,Math.max(0,g-this.groundY)*u)))}let p=.6;s.left=i-p,s.right=c+p,s.bottom=n-p,s.top=f+p,s.near=Math.max(.1,-h-2),s.far=-l+2,s.updateProjectionMatrix(),this.markShadows()}setWeatherArea(e){this.fx.setArea(e),this.applyFx()}applyFx(){let e=this.sky;if(!e){this.falling=this.fx.set({rain:0,snow:0,drift:[0,0],dark:this.dark});return}let t=(e.windFrom+180-this.north)*Math.PI/180,s=[Math.sin(t)*e.wind,-Math.cos(t)*e.wind],o=this.calm?0:Math.min(1,Math.max(0,(e.wind-4)/10))*.05;ne.uSway.value.set(Math.sin(t)*o,-Math.cos(t)*o),this.falling=this.fx.set({rain:e.rain,snow:e.snow,drift:s,dark:this.dark})}animate(e){if(this.calm)return 0;let t=this.sky,s=!!t&&t.wind>6;if(ne.uTime.value=e/1e3,this.falling){let a=this.renderer.getDrawingBufferSize(new L);this.fx.tick(e/1e3,a.y/(2*Math.tan(this.camera.fov*Math.PI/360)))}let o=!1;if(t!=null&&t.storm){if(this.nextFlash||(this.nextFlash=e+3e3+Math.random()*7e3),!this.flash&&e>=this.nextFlash&&(this.flash={start:e}),this.flash){let a=(e-this.flash.start)/1e3,i=a<.08?a/.08:a<.16?1-(a-.08)/.16:a<.22?.5+(a-.16)/.12:Math.max(0,1-(a-.22)/.25);a>.5?this.endFlash(e+1e4+Math.random()*3e4):(this.scene.environmentIntensity=this.envBase+(.9-.4*this.dark)*i,this.scene.backgroundIntensity=1+.6*i,o=!0)}}else(this.flash||this.nextFlash)&&this.endFlash(0);return this.falling||s||o?33:t!=null&&t.storm?Math.max(33,this.nextFlash-e):0}endFlash(e){this.flash=null,this.nextFlash=e,this.scene.environmentIntensity=this.envBase,this.scene.backgroundIntensity=1}markShadows(){this.renderer.shadowMap.needsUpdate=!0}setupComposer(){let e=new K(1,1,{type:q,samples:4});this.composer=new rt(this.renderer,e),this.composer.addPass(new it(this.scene,this.camera)),this.gtao=new Ve(this.scene,this.camera,1,1),this.gtao._renderGBuffer=!1,this.normalTarget=this.gtao.normalRenderTarget,this.gtao.updateGtaoMaterial({radius:.45,distanceExponent:1.6,thickness:1.2,scale:1,samples:12}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,rings:2,samples:12}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao),this.bloom=new ve(new L(1,1),.12,.35,.98),this.composer.addPass(this.bloom),this.composer.addPass(new lt)}setSize(e,t,s){var o;this.composer&&(this.composer.setPixelRatio(s),this.composer.setSize(e,t),(o=this.gtao)==null||o.setSize(Math.max(1,Math.round(e*s/2)),Math.max(1,Math.round(t*s/2))))}render(){if(this.placeFog(),!this.composer){this.renderer.render(this.scene,this.camera);return}this.renderNormals(),this.composer.render()}renderNormals(){let e=[],t=[];this.scene.traverseVisible(c=>{let f=c;if(!f.isMesh)return;let h=this.registered.get(f);h?(t.push([f,f.material]),f.material=h.normal):e.push(c)});for(let c of e)c.visible=!1;let s=this.scene.background,o=this.scene.fog;this.scene.background=null,this.scene.fog=null;let a=this.renderer.shadowMap.enabled;this.renderer.shadowMap.enabled=!1;let i=this.renderer.getRenderTarget(),n=new I;this.renderer.getClearColor(n);let l=this.renderer.getClearAlpha();this.renderer.setRenderTarget(this.normalTarget),this.renderer.setClearColor(7829503,1),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(i),this.renderer.setClearColor(n,l),this.renderer.shadowMap.enabled=a,this.scene.background=s,this.scene.fog=o;for(let c of e)c.visible=!0;for(let[c,f]of t)c.material=f}dispose(){var e,t,s;for(let o of[...this.materialsByFloor.keys()])this.releaseFloor(o);for(let o of this.registered.values())o.normal.dispose();this.registered.clear(),this.scene.remove(this.sun,this.sun.target),this.sun.dispose(),this.envTex.dispose(),this.skyTex.dispose(),this.groundMaterial.dispose(),this.castOnly.dispose(),this.scene.remove(this.fx.group),this.fx.dispose(),this.scene.environment=null,this.scene.fog=null,(e=this.composer)==null||e.dispose(),(t=this.gtao)==null||t.dispose(),(s=this.bloom)==null||s.dispose(),lo(),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=0}};export{fo as RealisticLook,Zo as fullColour,ho as skyDirection};
