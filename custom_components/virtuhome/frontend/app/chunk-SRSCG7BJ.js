import{a as Si,b as Ti,c as bi,d as wi,f as _i}from"./chunk-CGUFNDGQ.js";import{d as ci,f as fi,g as di,h as mi,i as pi,j as vi,k as gi,l as xi}from"./chunk-BTTLEWEH.js";import{b as Mi}from"./chunk-C54B4JFJ.js";import"./chunk-OJPCXMFA.js";import{$ as ui,Q as pt,X as li,Y as hi,c as dt,d as mt,e as oi,f as ni}from"./chunk-Z7CSZFAD.js";import{$ as Ne,A as Nt,B as zt,C as Ot,E as It,F as Lt,G as Bt,I as _,K as P,L as Vt,M as V,N as ee,Na as ri,O as kt,P as Gt,Q as w,R as Ht,S as Wt,T as jt,U as ct,V as ft,W as te,Z as Fe,_ as k,ba as Qt,c as bt,d as wt,da as Zt,e as nt,ea as Xt,f as O,fa as Yt,g as _t,ga as qt,h as Pt,ha as Kt,i as yt,j as Me,k as Se,ka as I,l as lt,la as U,m as ht,ma as $t,n as Ct,na as ie,o as Et,oa as Te,p as Dt,pa as Jt,q as Ue,r as Rt,ra as ei,s as At,sa as ti,t as Ut,ta as ii,u as J,v as ut,va as si,y as Ft,z as B,za as ai}from"./chunk-JT5VAX3R.js";import"./chunk-QMMH4BXU.js";import{j as St,k as Tt}from"./chunk-2OQQ6OX5.js";import"./chunk-LICDGIV6.js";import"./chunk-ZN2N6HIG.js";import"./chunk-Q323WBP4.js";import"./chunk-QQAOQDRW.js";var G={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var N=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Li=new ti(-1,1,1,-1,0,1),vt=class extends te{constructor(){super(),this.setAttribute("position",new ft([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ft([0,2,0,0,2,0],2))}},Bi=new vt,H=class{constructor(e){this._mesh=new k(Bi,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Li)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var ze=class extends N{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof U?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=I.clone(e.uniforms),this.material=new U({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new H(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var be=class extends N{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let s=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,o;this.inverse?(r=0,o=1):(r=1,o=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),a.buffers.stencil.setFunc(s.ALWAYS,r,4294967295),a.buffers.stencil.setClear(o),a.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(s.EQUAL,1,4294967295),a.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),a.buffers.stencil.setLocked(!0)}},Oe=class extends N{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Ie=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new _);this._width=i.width,this._height=i.height,t=new V(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:B}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ze(G),this.copyPass.material.blending=O,this.timer=new si}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let s=0,a=this.passes.length;s<a;s++){let r=this.passes[s];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),r.needsSwap){if(i){let o=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}be!==void 0&&(r instanceof be?i=!0:r instanceof Oe&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new _);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Le=class extends N{constructor(e,t,i=null,s=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new w}render(e,t,i){let s=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=s}};var we={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new _},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new ee},cameraProjectionMatrixInverse:{value:new ee},cameraWorldMatrix:{value:new ee},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new P(-1,-1,-1)},sceneBoxMax:{value:new P(1,1,1)}},vertexShader:`

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
		}`},_e={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

		}`},Be={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function Pi(n=5){let e=Math.floor(n)%2===0?Math.floor(n)+1:Math.floor(n),t=Vi(e),i=t.length,s=new Uint8Array(i*4);for(let r=0;r<i;++r){let o=t[r],h=2*Math.PI*o/i,l=new P(Math.cos(h),Math.sin(h),0).normalize();s[r*4]=(l.x*.5+.5)*255,s[r*4+1]=(l.y*.5+.5)*255,s[r*4+2]=127,s[r*4+3]=255}let a=new Ne(s,e,e);return a.wrapS=J,a.wrapT=J,a.needsUpdate=!0,a}function Vi(n){let e=Math.floor(n)%2===0?Math.floor(n)+1:Math.floor(n),t=e*e,i=Array(t).fill(0),s=Math.floor(e/2),a=e-1;for(let r=1;r<=t;){if(s===-1&&a===e?(a=e-2,s=0):(a===e&&(a=0),s<0&&(s=e-1)),i[s*e+a]!==0){a-=2,s++;continue}else i[s*e+a]=r++;a++,s--}return i}var Pe={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:gt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new _},cameraProjectionMatrixInverse:{value:new ee},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function gt(n,e,t){let i=ki(n,e,t),s="vec3[SAMPLES](";for(let a=0;a<n;a++){let r=i[a];s+=`vec3(${r.x}, ${r.y}, ${r.z})${a<n-1?",":")"}`}return s}function ki(n,e,t){let i=[];for(let s=0;s<n;s++){let a=2*Math.PI*e*s/n,r=Math.pow(s/(n-1),t);i.push(new P(Math.cos(a),Math.sin(a),r))}return i}var Ve=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let i,s,a,r=.5*(Math.sqrt(3)-1),o=(e+t)*r,h=Math.floor(e+o),l=Math.floor(t+o),u=(3-Math.sqrt(3))/6,c=(h+l)*u,f=h-c,p=l-c,S=e-f,x=t-p,T,d;S>x?(T=1,d=0):(T=0,d=1);let g=S-T+u,m=x-d+u,v=S-1+2*u,M=x-1+2*u,b=h&255,R=l&255,z=this.perm[b+this.perm[R]]%12,y=this.perm[b+T+this.perm[R+d]]%12,C=this.perm[b+1+this.perm[R+1]]%12,E=.5-S*S-x*x;E<0?i=0:(E*=E,i=E*E*this._dot(this.grad3[z],S,x));let D=.5-g*g-m*m;D<0?s=0:(D*=D,s=D*D*this._dot(this.grad3[y],g,m));let L=.5-v*v-M*M;return L<0?a=0:(L*=L,a=L*L*this._dot(this.grad3[C],v,M)),70*(i+s+a)}noise3d(e,t,i){let s,a,r,o,l=(e+t+i)*.3333333333333333,u=Math.floor(e+l),c=Math.floor(t+l),f=Math.floor(i+l),p=1/6,S=(u+c+f)*p,x=u-S,T=c-S,d=f-S,g=e-x,m=t-T,v=i-d,M,b,R,z,y,C;g>=m?m>=v?(M=1,b=0,R=0,z=1,y=1,C=0):g>=v?(M=1,b=0,R=0,z=1,y=0,C=1):(M=0,b=0,R=1,z=1,y=0,C=1):m<v?(M=0,b=0,R=1,z=0,y=1,C=1):g<v?(M=0,b=1,R=0,z=0,y=1,C=1):(M=0,b=1,R=0,z=1,y=1,C=0);let E=g-M+p,D=m-b+p,L=v-R+p,re=g-z+2*p,oe=m-y+2*p,ne=v-C+2*p,le=g-1+3*p,he=m-1+3*p,A=v-1+3*p,Y=u&255,q=c&255,K=f&255,Ee=this.perm[Y+this.perm[q+this.perm[K]]]%12,De=this.perm[Y+M+this.perm[q+b+this.perm[K+R]]]%12,Re=this.perm[Y+z+this.perm[q+y+this.perm[K+C]]]%12,Ae=this.perm[Y+1+this.perm[q+1+this.perm[K+1]]]%12,W=.6-g*g-m*m-v*v;W<0?s=0:(W*=W,s=W*W*this._dot3(this.grad3[Ee],g,m,v));let j=.6-E*E-D*D-L*L;j<0?a=0:(j*=j,a=j*j*this._dot3(this.grad3[De],E,D,L));let Q=.6-re*re-oe*oe-ne*ne;Q<0?r=0:(Q*=Q,r=Q*Q*this._dot3(this.grad3[Re],re,oe,ne));let Z=.6-le*le-he*he-A*A;return Z<0?o=0:(Z*=Z,o=Z*Z*this._dot3(this.grad3[Ae],le,he,A)),32*(s+a+r+o)}noise4d(e,t,i,s){let a=this.grad4,r=this.simplex,o=this.perm,h=(Math.sqrt(5)-1)/4,l=(5-Math.sqrt(5))/20,u,c,f,p,S,x=(e+t+i+s)*h,T=Math.floor(e+x),d=Math.floor(t+x),g=Math.floor(i+x),m=Math.floor(s+x),v=(T+d+g+m)*l,M=T-v,b=d-v,R=g-v,z=m-v,y=e-M,C=t-b,E=i-R,D=s-z,L=y>C?32:0,re=y>E?16:0,oe=C>E?8:0,ne=y>D?4:0,le=C>D?2:0,he=E>D?1:0,A=L+re+oe+ne+le+he,Y=r[A][0]>=3?1:0,q=r[A][1]>=3?1:0,K=r[A][2]>=3?1:0,Ee=r[A][3]>=3?1:0,De=r[A][0]>=2?1:0,Re=r[A][1]>=2?1:0,Ae=r[A][2]>=2?1:0,W=r[A][3]>=2?1:0,j=r[A][0]>=1?1:0,Q=r[A][1]>=1?1:0,Z=r[A][2]>=1?1:0,Mt=r[A][3]>=1?1:0,je=y-Y+l,Qe=C-q+l,Ze=E-K+l,Xe=D-Ee+l,Ye=y-De+2*l,qe=C-Re+2*l,Ke=E-Ae+2*l,$e=D-W+2*l,Je=y-j+3*l,et=C-Q+3*l,tt=E-Z+3*l,it=D-Mt+3*l,st=y-1+4*l,at=C-1+4*l,rt=E-1+4*l,ot=D-1+4*l,ue=T&255,ce=d&255,fe=g&255,de=m&255,Fi=o[ue+o[ce+o[fe+o[de]]]]%32,Ni=o[ue+Y+o[ce+q+o[fe+K+o[de+Ee]]]]%32,zi=o[ue+De+o[ce+Re+o[fe+Ae+o[de+W]]]]%32,Oi=o[ue+j+o[ce+Q+o[fe+Z+o[de+Mt]]]]%32,Ii=o[ue+1+o[ce+1+o[fe+1+o[de+1]]]]%32,me=.6-y*y-C*C-E*E-D*D;me<0?u=0:(me*=me,u=me*me*this._dot4(a[Fi],y,C,E,D));let pe=.6-je*je-Qe*Qe-Ze*Ze-Xe*Xe;pe<0?c=0:(pe*=pe,c=pe*pe*this._dot4(a[Ni],je,Qe,Ze,Xe));let ve=.6-Ye*Ye-qe*qe-Ke*Ke-$e*$e;ve<0?f=0:(ve*=ve,f=ve*ve*this._dot4(a[zi],Ye,qe,Ke,$e));let ge=.6-Je*Je-et*et-tt*tt-it*it;ge<0?p=0:(ge*=ge,p=ge*ge*this._dot4(a[Oi],Je,et,tt,it));let xe=.6-st*st-at*at-rt*rt-ot*ot;return xe<0?S=0:(xe*=xe,S=xe*xe*this._dot4(a[Ii],st,at,rt,ot)),27*(u+c+f+p+S)}_dot(e,t,i){return e[0]*t+e[1]*i}_dot3(e,t,i,s){return e[0]*t+e[1]*i+e[2]*s}_dot4(e,t,i,s,a){return e[0]*t+e[1]*i+e[2]*s+e[3]*a}};var ye=class n extends N{constructor(e,t,i=512,s=512,a,r,o){super(),this.width=i,this.height=s,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Pi(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new V(this.width,this.height,{type:B,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new U({defines:Object.assign({},we.defines),uniforms:I.clone(we.uniforms),vertexShader:we.vertexShader,fragmentShader:we.fragmentShader,blending:O,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Te,this.normalMaterial.blending=O,this.pdMaterial=new U({defines:Object.assign({},Pe.defines),uniforms:I.clone(Pe.uniforms),vertexShader:Pe.vertexShader,fragmentShader:Pe.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new U({defines:Object.assign({},_e.defines),uniforms:I.clone(_e.uniforms),vertexShader:_e.vertexShader,fragmentShader:_e.fragmentShader,blending:O}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new U({uniforms:I.clone(G.uniforms),vertexShader:G.vertexShader,fragmentShader:G.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:ht,blendDst:Se,blendEquation:Me,blendSrcAlpha:lt,blendDstAlpha:Se,blendEquationAlpha:Me}),this.blendMaterial=new U({uniforms:I.clone(Be.uniforms),vertexShader:Be.vertexShader,fragmentShader:Be.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:yt,blendSrc:ht,blendDst:Se,blendEquation:Me,blendSrcAlpha:lt,blendDstAlpha:Se,blendEquationAlpha:Me}),this._fsQuad=new H(null),this._originalClearColor=new w,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),r!==void 0&&this.updateGtaoMaterial(r),o!==void 0&&this.updatePdMaterial(o)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new qt,this.depthTexture.format=Ot,this.depthTexture.type=Nt,this.normalRenderTarget=new V(this.width,this.height,{minFilter:ut,magFilter:ut,type:B,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let i=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=gt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,i){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case n.OUTPUT.Off:break;case n.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=O,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case n.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=O,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case n.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=O,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case n.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case n.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=O,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case n.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=O,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,i,s,a){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_renderOverride(e,t,i,s,a){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s=t.clearColor||s,a=t.clearAlpha||a,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(i){(i.isPoints||i.isLine||i.isLine2)&&i.visible&&(i.visible=!1,t.push(i))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new Ve,i=e*e*4,s=new Uint8Array(i);for(let r=0;r<e;r++)for(let o=0;o<e;o++){let h=r,l=o;s[(r*e+o)*4]=(t.noise(h,l)*.5+.5)*255,s[(r*e+o)*4+1]=(t.noise(h+e,l)*.5+.5)*255,s[(r*e+o)*4+2]=(t.noise(h,l+e)*.5+.5)*255,s[(r*e+o)*4+3]=(t.noise(h+e,l+e)*.5+.5)*255}let a=new Ne(s,e,e,zt,Ft);return a.wrapS=J,a.wrapT=J,a.needsUpdate=!0,a}};ye.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var yi={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new w(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var se=class n extends N{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new _(e.x,e.y):new _(256,256),this.clearColor=new w(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new V(a,r,{type:B,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){let c=new V(a,r,{type:B,depthBuffer:!1});c.texture.name="UnrealBloomPass.h"+u,c.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(c);let f=new V(a,r,{type:B,depthBuffer:!1});f.texture.name="UnrealBloomPass.v"+u,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),a=Math.round(a/2),r=Math.round(r/2)}let o=yi;this.highPassUniforms=I.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new U({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let h=[6,10,14,18,22];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(h[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new _(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=I.clone(G.uniforms),this.blendMaterial=new U({uniforms:this.copyUniforms,vertexShader:G.vertexShader,fragmentShader:G.fragmentShader,premultipliedAlpha:!0,blending:Pt,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new w,this._oldClearAlpha=1,this._basic=new Fe,this._fsQuad=new H(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(i,s),this.renderTargetsVertical[a].setSize(i,s),this.separableBlurMaterials[a].uniforms.invSize.value=new _(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let h=0;h<this.nMips;h++)this._fsQuad.material=this.separableBlurMaterials[h],this.separableBlurMaterials[h].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[h].uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[h]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[h].uniforms.colorTexture.value=this.renderTargetsHorizontal[h].texture,this.separableBlurMaterials[h].uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[h]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[h];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(i*i))/i);let s=[],a=[];for(let r=1;r<e;r+=2){let o=t[r],h=r+1<e?t[r+1]:0,l=o+h;s.push((r*o+(r+1)*h)/l),a.push(l)}return new U({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new _(.5,.5)},direction:{value:new _(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new U({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};se.BlurDirectionX=new _(1,0);se.BlurDirectionY=new _(0,1);var Ce={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var ke=class extends N{constructor(){super(),this.isOutputPass=!0,this.uniforms=I.clone(Ce.uniforms),this.material=new $t({name:Ce.name,uniforms:this.uniforms,vertexShader:Ce.vertexShader,fragmentShader:Ce.fragmentShader}),this._fsQuad=new H(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Vt.getTransfer(this._outputColorSpace)===Bt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ct?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Et?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Dt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ue?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===At?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Ut?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Rt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ge=class extends Wt{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Kt;e.deleteAttribute("uv");let t=new ie({side:wt}),i=new ie,s=new ei(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let a=new k(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let r=new Qt(e,i,6),o=new kt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),r.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),r.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),r.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),r.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),r.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),r.setMatrixAt(5,o.matrix),this.add(r);let h=new k(e,ae(50));h.position.set(-16.116,14.37,8.208),h.scale.set(.1,2.428,2.739),this.add(h);let l=new k(e,ae(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let u=new k(e,ae(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);let c=new k(e,ae(43));c.position.set(-.462,8.89,14.52),c.scale.set(4.38,5.441,.088),this.add(c);let f=new k(e,ae(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let p=new k(e,ae(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function ae(n){return new Jt({color:0,emissive:16777215,emissiveIntensity:n})}var Gi=`
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
}`,Hi=`
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
}`,Wi=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha * vAlpha); }`,ji=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1.0 - d * 3.2));
}`,Qi=new w(8227744),Zi=new w(13226982);function Ci(n,e,t){return new U({vertexShader:n,fragmentShader:e,uniforms:t,transparent:!0,depthWrite:!1,blending:_t,fog:!1})}var He=class{constructor(e){this.group=new Gt;this.shared={uTime:{value:0},uTop:{value:10},uHeight:{value:12},uWind:{value:new _}};this.rainU={...this.shared,uFall:{value:8},uLen:{value:.42},uColor:{value:new w(12109010)},uAlpha:{value:.32}};this.snowU={...this.shared,uFall:{value:.9},uSize:{value:.045},uScale:{value:800},uColor:{value:new w(16777215)},uAlpha:{value:.9}};this.area=null;this.key="";this.rainMax=e?9e3:4500,this.snowMax=e?7e3:3500,this.rain=new Zt(new te,Ci(Gi,Wi,this.rainU)),this.snow=new Xt(new te,Ci(Hi,ji,this.snowU));for(let t of[this.rain,this.snow])t.frustumCulled=!1,t.renderOrder=4,t.visible=!1;this.group.add(this.rain,this.snow)}setArea(e){this.area=e,this.key=""}set(e){let t=this.area,i=!!t&&(e.rain>.02||e.snow>.02);if(this.rain.visible=!!t&&e.rain>.02,this.snow.visible=!!t&&e.snow>.02,!t||!i)return!1;this.shared.uTop.value=t.top,this.shared.uHeight.value=t.top-t.ground;let s=this.rain.visible?.55:.9;this.shared.uWind.value.set(e.drift[0]*s,e.drift[1]*s),this.rainU.uColor.value.setHex(12109010).lerp(Qi,e.dark),this.rainU.uAlpha.value=.45-.13*e.dark,this.snowU.uColor.value.setHex(16777215).lerp(Zi,e.dark);let a=[t.minX,t.maxX,t.minZ,t.maxZ,t.top,t.ground,t.rooms.length,Math.round(e.drift[0]),Math.round(e.drift[1])].map(r=>Number(r).toFixed(1)).join("|");return a!==this.key&&(this.key=a,this.build(t)),this.rain.geometry.setDrawRange(0,Math.round(this.rainMax*Math.min(1,e.rain))*2),this.snow.geometry.setDrawRange(0,Math.round(this.snowMax*Math.min(1,e.snow))),!0}tick(e,t){this.shared.uTime.value=e,this.snowU.uScale.value=t}build(e){let t=e.top-e.ground,i=this.shared.uWind.value,s=[this.rainU.uFall.value,this.snowU.uFall.value].map(d=>[i.x*(t/d/2),i.y*(t/d/2)]),a=(d,g,m)=>{for(let v of[-1,0,1]){let M=[d+m[0]*v,g+m[1]*v];if(e.rooms.some(b=>St(M,b)||b.some((R,z)=>Tt(M,R,b[(z+1)%b.length]).d<.35)))return!1}return!0},r=Math.max(6,.45*Math.max(e.maxX-e.minX,e.maxZ-e.minZ)),o=e.minX-r,h=e.maxX+r,l=e.minZ-r,u=e.maxZ+r,c=12345,f=()=>(c=c*1103515245+12345&2147483647)/2147483647,p=(d,g)=>{let m=[];for(let v=0;m.length<d&&v<d*6;v++){let M=o+f()*(h-o),b=l+f()*(u-l);a(M,b,g)&&m.push([M,b,f(),.6+f()*.8])}return m},S=p(this.rainMax,s[0]),x=new Float32Array(S.length*8);S.forEach((d,g)=>{x.set([d[0],d[1],d[2],0,d[0],d[1],d[2],1],g*8)}),this.replace(this.rain,x);let T=p(this.snowMax,s[1]);this.replace(this.snow,new Float32Array(T.flat()))}replace(e,t){let i=new te;i.setAttribute("aSeed",new ct(t,4)),i.setAttribute("position",new ct(new Float32Array(t.length/4*3),3)),e.geometry.dispose(),e.geometry=i}dispose(){for(let e of[this.rain,this.snow])e.geometry.dispose(),e.material.dispose()}};var Xi={wood:{tex:"wood_grain",scale:.9,rough:.5,relief:.25},woodDark:{tex:"wood_grain",scale:.9,rough:.45,relief:.25},white:{rough:.45},dark:{rough:.45},metal:{tex:"brushed",scale:.5,rough:.3,metal:.85},glass:{rough:.04,opacity:.28},plant:{tex:"foliage",scale:.35,rough:.65,relief:.8},leaf:{tex:"foliage",scale:.3,rough:.6,relief:.8},pot:{tex:"plaster",scale:.5,rough:.8,relief:.3},soil:{tex:"carpet",scale:.3,rough:1},accent:{rough:.45},red:{rough:.5},blue:{rough:.5},screen:{rough:.12,metal:.2},ceramic:{rough:.1},rug:{tex:"rug",scale:1.2,rough:.95,relief:.3},mattress:{tex:"weave",scale:.3,rough:.9,relief:.2},bulb:{rough:.55},paper:{rough:.85},canvas:{tex:"canvas_art",scale:1,rough:.85,relief:.2},mirror:{rough:.02,metal:1},water:{rough:.03,opacity:.8},rubber:{rough:.85},pine:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},softwood:{tex:"wood_grain_v",scale:.6,rough:.7,relief:.15},oak:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},walnut:{tex:"wood_grain_v",scale:.6,rough:.45,relief:.2},primed:{rough:.85},blackMetal:{rough:.4,metal:.6},concrete:{tex:"concrete",scale:.8,rough:.9,relief:.25},brick:{tex:"brick_red",scale:1.35,rough:.85,relief:.9},shiplap:{tex:"boards_h",scale:1.2,rough:.7,relief:.7},logs:{tex:"logs",scale:1.12,rough:.7,relief:.9},corrugated:{tex:"corrugated",scale:.76,rough:.45,metal:.3,relief:.9},felt:{tex:"roof_felt",scale:2,rough:.95,relief:.4},shingle:{tex:"shingles",scale:1,rough:.9,relief:.8},epdm:{tex:"roof_epdm",scale:3,rough:.8,relief:.15},sedum:{tex:"roof_sedum",scale:1.5,rough:1,relief:.8},corten:{tex:"rust",scale:1,rough:.8,relief:.3},galvanised:{tex:"brushed",scale:.5,rough:.35,metal:.7},sleeper:{tex:"wood_grain_v",scale:.6,rough:.85,relief:.4},stone:{tex:"stone_wall",scale:1,rough:.85,relief:.9},rattan:{tex:"weave",scale:.15,rough:.8,relief:.6},bloom:{tex:"foliage",scale:.25,rough:.7,relief:.6},lavender:{tex:"foliage",scale:.25,rough:.7,relief:.6},straw:{tex:"foliage",scale:.3,rough:.75,relief:.6},plastic:{rough:.6},lid:{rough:.5}},Yi={cap:{rough:.9},slab:{tex:"concrete",scale:3,rough:.9,relief:.2},blind:{tex:"linen",scale:.3,rough:.9,relief:.2},glass:{rough:.04,opacity:.3},pv:{rough:.38,metal:.05}},Ei={lawn:{tex:"grass",scale:2,rough:.95,relief:.4},bed:{tex:"soil",scale:1.5,rough:1,relief:.6}};function Ai(n){let[e,t]=n.split(":"),i=ri(n);if(i)return{tex:i.tex,scale:i.scale,rough:i.roughness,metal:i.metalness,relief:i.relief};if(e==="role")return Xi[t]??{rough:.6};if(e==="out")return Ei[t]??Ei.lawn;if(e==="pave"){let s=li(t);if(s)return{tex:n,scale:Si(s)/1e3,rough:pt[s.material].roughness,relief:pt[s.material].relief,res:2}}if(e==="deck"){let s=ui(t);if(s)return{tex:n,scale:Ti(s)/1e3,rough:hi[s.boards].roughness,relief:.7,res:2}}return Yi[e]??{rough:.6}}function qi(n){let e=Ai(n);return!!e.tex&&!wi(e.tex)}var Ui={value:1},X={uFill:{value:1},uSkyTint:{value:new w(1,1,1)},uWet:{value:0},uSnow:{value:0},uTime:{value:0},uSway:{value:new _}},Ki=dt+`
attribute vec3 aLamp;
attribute vec3 aEmis;
uniform float uIndoor;
uniform float uTime;
uniform vec2 uSway;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,$i=mt+`
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
`,Ji=oi+`
uniform float uLampGain;
uniform float uFill;
uniform vec3 uSkyTint;
uniform float uWet;
uniform float uSnow;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,es=`
float vhFaceUp = smoothstep(0.5, 0.9, vUp);
float vhWet = uWet * vOut * (0.35 + 0.65 * vhFaceUp);
float vhSnow = uSnow * vOut * vhFaceUp;
diffuseColor.rgb *= 1.0 - 0.3 * vhWet;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), vhSnow * 0.94);
`,ts=`
roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.16), vhWet * vhFaceUp * (1.0 - vhSnow));
roughnessFactor = mix(roughnessFactor, 0.85, vhSnow);
`;function is(n,e,t){n.onBeforeCompile=i=>{Object.assign(i.uniforms,e,X,{uLampGain:Ui}),i.vertexShader=Ki+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+$i),i.fragmentShader=Ji+i.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+ni+es).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+ts).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vEmis;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
reflectedLight.indirectDiffuse *= mix(uFill, 1.0, vOut) * uSkyTint;
reflectedLight.indirectSpecular *= uSkyTint;
reflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;`)},n.customProgramCacheKey=()=>t}var ss=new Set(["role:plant","role:leaf","role:bloom","role:lavender","role:straw"]);function as(n,e,t){return n.onBeforeCompile=i=>{Object.assign(i.uniforms,e),i.vertexShader=dt+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+mt)},n.customProgramCacheKey=()=>t,n}function rs(){let n=document.createElement("canvas");n.width=4,n.height=256;let e=new Yt(n);return e.colorSpace=It,e}function os(n,e,t,i){let a=n.image.getContext("2d"),r=a.createLinearGradient(0,0,0,256);r.addColorStop(0,`#${e.getHexString()}`),r.addColorStop(.55,`#${t.getHexString()}`),r.addColorStop(1,`#${i.getHexString()}`),a.fillStyle=r,a.fillRect(0,0,4,256),n.needsUpdate=!0}var We=(n,e,t)=>{let i=Math.max(0,Math.min(1,(t-n)/(e-n)));return i*i*(3-2*i)},$=(n,e,t)=>new w(n).lerp(new w(e),Math.max(0,Math.min(1,t))),ns=new w(16747114),xt=new P(-.45,.78,.45).normalize();function Di(n,e,t){let i=(n-t)*Math.PI/180,s=e*Math.PI/180;return new P(Math.sin(i)*Math.cos(s),Math.sin(s),-Math.cos(i)*Math.cos(s)).normalize()}function ls(){try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}var Ri=class{constructor(e,t,i,s){this.renderer=e;this.scene=t;this.camera=i;this.groundMaterial=new ie({color:13226434,roughness:1});this.castOnly=new Fe({colorWrite:!1,depthWrite:!1,side:nt});this.sun=new ii(16773596,2.6);this.skyTex=rs();this.skyPainted="";this.materialsByFloor=new Map;this.registered=new Map;this.sky=null;this.north=0;this.nextFlash=0;this.flash=null;this.envBase=.55;this.haze={fog:0,gloom:0,glow:0};this.calm=ls();this.falling=!1;this.composer=null;this.gtao=null;this.bloom=null;this.normalTarget=null;this.sunDir=xt.clone();this.centre=new P;this.radius=10;this.box=new jt(new P(-5,0,-5),new P(5,3,5));this.groundY=0;this.night=!1;this.follow=!1;this.dark=0;this.ultra=s,this.texSize=s?1024:512,this.aniso=Math.min(s?16:8,e.capabilities.getMaxAnisotropy()),e.toneMapping=Ue,e.toneMappingExposure=1,e.shadowMap.enabled=!0,e.shadowMap.type=bt,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;let a=new ai(e);this.envTex=a.fromScene(new Ge,.04).texture,a.dispose(),t.environment=this.envTex,this.sun.castShadow=!0;let r=s?4096:2048;this.sun.shadow.mapSize.set(r,r),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=3,t.add(this.sun,this.sun.target),this.groundMaterial.envMapIntensity=.8,this.fx=new He(s),t.add(this.fx.group),t.background=this.skyTex,s&&this.setupComposer(),this.setNight(!1)}geometry(e){let t=e.surfaces.map(i=>qi(i));return e.toRealisticGeometry(i=>t[i]??!1)}materials(e,t){let i=this.materialsByFloor.get(t);return i||(i=new Map,this.materialsByFloor.set(t,i)),e.surfaces.map(s=>{let a=i.get(s);return a||(a=this.makeMaterial(s,t),i.set(s,a)),a})}makeMaterial(e,t){let i=Ai(e),s=new ie({vertexColors:!0,roughness:i.rough,metalness:i.metal??0});if(i.tex){let r=bi(i.tex,Math.min(1024,this.texSize*(i.res??1)),this.aniso);if(r){let o=1/(i.scale??1);s.map=r.map.clone(),s.map.repeat.set(o,o),r.normal&&(i.relief??0)>0&&(s.normalMap=r.normal.clone(),s.normalMap.repeat.set(o,o),s.normalScale.set(i.relief,-i.relief))}}i.opacity!==void 0&&(s.transparent=!0,s.opacity=i.opacity,s.depthWrite=!1),e==="glass"&&(s.side=nt,s.forceSinglePass=!0);let a=ss.has(e);return a&&(s.defines={VH_SWAY:1}),is(s,t,a?"vh-std-sway":"vh-std"),s}glassMaterial(e,t){return this.materials(e,t)[0]}attach(e,t,i){if(e.castShadow=i,e.receiveShadow=!0,this.ultra){let s=as(new Te,t,"vh-normal");s.blending=O,this.registered.set(e,{mesh:e,normal:s})}this.markShadows()}attachGround(e){if(e.receiveShadow=!0,this.ultra){let t=new Te;t.blending=O,this.registered.set(e,{mesh:e,normal:t})}}detach(e){let t=this.registered.get(e);t&&(t.normal.dispose(),this.registered.delete(e))}releaseFloor(e){var t,i,s;for(let a of((t=this.materialsByFloor.get(e))==null?void 0:t.values())??[]){let r=a;(i=r.map)==null||i.dispose(),(s=r.normalMap)==null||s.dispose(),a.dispose()}this.materialsByFloor.delete(e)}setNight(e,t=!1){this.night=e,this.follow=t,this.applySky()}get darkness(){return this.dark}setSun(e,t,i){this.setSky({...this.sky??Mi(),sun:e===null||t===null?null:{azimuth:e,elevation:t}},i)}setSky(e,t){this.sky=e,this.north=t,this.applySky()}applySky(){let e=this.sky,t=(e==null?void 0:e.cloud)??.2,i=(e==null?void 0:e.rain)??0,s=(e==null?void 0:e.snow)??0,a=(e==null?void 0:e.fog)??0,r=!!(e!=null&&e.storm),o=Math.max(i*.65,r?.6:0,s*.25,a*.2),h=(e==null?void 0:e.sun)??null,l=this.sun.shadow,u=!!h&&h.elevation>-1,c=this.follow&&h?h.elevation:this.night?-90:u?h.elevation:40,f=fi(c);if(this.dark=f,c>-1){this.sunDir.copy(u?Di(h.azimuth,Math.max(.5,c),this.north):xt),this.sun.intensity=3.2*di(c)*(1-.9*t)*(1-.3*o);let m=new w().setRGB(...ci(pi(c))).lerp(ns,.3*vi(c));this.sun.color.copy(m.lerp(new w(16054010),t*.8)),l.intensity=Math.max(.06,1-.9*t),l.radius=3+7*t}else{let m=(e==null?void 0:e.moon)??null,v=(m==null?void 0:m.elevation)??-90,M=v>0,b=M?We(0,6,v):We(0,-3,v);this.sunDir.copy(M?Di(m.azimuth,Math.max(.5,v),this.north):xt),this.sun.intensity=(M?.38*(.3+.7*m.lit):.2)*b*(1-.7*t)*mi(c),this.sun.color.setHex(9348863),l.intensity=(M?.65:.3)*(1-.8*t),l.radius=4+6*t}let p=(.25+.4*t)*(.6+.4*We(-1,12,c))*(1-.32*o),S=.05+.025*t;this.envBase=p+(S-p)*f,this.scene.environmentIntensity=this.envBase,this.renderer.toneMappingExposure=1,X.uFill.value=1+.75*(1-t)*(1-f);let{sky:x,tint:T}=gi(c),d=1-.75*t;X.uSkyTint.value.setRGB(1+(T[0]-1)*d,1+(T[1]-1)*d,1+(T[2]-1)*d,Lt),Ui.value=.154+.346*f,this.bloom&&(this.bloom.strength=.12+.2*f);let g=xi(c)*(1-t);this.paintSky(x,f,t,o,a,g),this.ground(e,c,f,g),X.uWet.value=(e==null?void 0:e.wet)??0,X.uSnow.value=(e==null?void 0:e.snowCover)??0,this.placeSun(),this.applyFx()}paintSky(e,t,i,s,a,r){let o=[$(11713219,1053726,t),$(13028562,1777705,t),$(14343906,2501430,t)],h=[6712952,8752277,10791601],l=$(14014940,2764602,t),[u,c,f]=e.map((x,T)=>{let d=$(x,o[T].getHex(),i).lerp(new w(h[T]),s*(1-t));return a>0?d.lerp(l,a*(.85+.075*T)):d}),p=u.getHexString()+c.getHexString()+f.getHexString();p!==this.skyPainted&&(this.skyPainted=p,os(this.skyTex,u,c,f)),this.haze={fog:a,gloom:s,glow:r};let S=this.scene.fog;S?S.color.copy(f):this.scene.fog=new Ht(f.getHex(),1,2),this.placeFog()}placeFog(){let e=this.scene.fog;if(!e)return;let t=this.radius,i=this.camera.position.distanceTo(this.centre),{fog:s,gloom:a,glow:r}=this.haze;e.near=Math.max(.5,i+t*(1.5-1.9*s-.5*r)*(1-.3*a)),e.far=i+t*(5-3.6*s-1.8*r)*(1-.25*a)}ground(e,t,i,s){let a=$(13029309,14075566,s*We(-3,1,t)).lerp(new w(2765606),i),r=(e==null?void 0:e.wet)??0,o=(e==null?void 0:e.snowCover)??0;a.multiplyScalar(1-.25*r).lerp($(15659766,8226710,i),o).multiply(X.uSkyTint.value),this.groundMaterial.color.copy(a),this.groundMaterial.roughness=o>.5?.9:1-.45*r}fit(e,t){this.box.copy(e),this.groundY=t,e.getCenter(this.centre);let i=e.getSize(new P);this.radius=Math.max(6,Math.hypot(i.x,i.z)/2),this.applySky()}placeSun(){let e=this.sunDir,t=this.box.getSize(new P).length();this.sun.target.position.copy(this.centre),this.sun.position.copy(this.centre).addScaledVector(e,t+20),this.sun.target.updateMatrixWorld(),this.sun.updateMatrixWorld();let i=this.sun.shadow.camera;i.position.copy(this.sun.position),i.lookAt(this.centre),i.updateMatrixWorld();let s=i.matrixWorldInverse,a=this.box,r=1/0,o=1/0,h=1/0,l=-1/0,u=-1/0,c=-1/0,f=new P,p=T=>{f.copy(T).applyMatrix4(s),r=Math.min(r,f.x),l=Math.max(l,f.x),o=Math.min(o,f.y),u=Math.max(u,f.y),h=Math.min(h,f.z),c=Math.max(c,f.z)},S=e.y>.01?1/e.y:100;for(let T of[a.min.x,a.max.x])for(let d of[a.min.y,a.max.y])for(let g of[a.min.z,a.max.z]){let m=new P(T,d,g);p(m),p(m.addScaledVector(e,-Math.min(150,Math.max(0,d-this.groundY)*S)))}let x=.6;i.left=r-x,i.right=l+x,i.bottom=o-x,i.top=u+x,i.near=Math.max(.1,-c-2),i.far=-h+2,i.updateProjectionMatrix(),this.markShadows()}setWeatherArea(e){this.fx.setArea(e),this.applyFx()}applyFx(){let e=this.sky;if(!e){this.falling=this.fx.set({rain:0,snow:0,drift:[0,0],dark:this.dark});return}let t=(e.windFrom+180-this.north)*Math.PI/180,i=[Math.sin(t)*e.wind,-Math.cos(t)*e.wind],s=this.calm?0:Math.min(1,Math.max(0,(e.wind-4)/10))*.05;X.uSway.value.set(Math.sin(t)*s,-Math.cos(t)*s),this.falling=this.fx.set({rain:e.rain,snow:e.snow,drift:i,dark:this.dark})}animate(e){if(this.calm)return 0;let t=this.sky,i=!!t&&t.wind>6;if(X.uTime.value=e/1e3,this.falling){let a=this.renderer.getDrawingBufferSize(new _);this.fx.tick(e/1e3,a.y/(2*Math.tan(this.camera.fov*Math.PI/360)))}let s=!1;if(t!=null&&t.storm){if(this.nextFlash||(this.nextFlash=e+3e3+Math.random()*7e3),!this.flash&&e>=this.nextFlash&&(this.flash={start:e}),this.flash){let a=(e-this.flash.start)/1e3,r=a<.08?a/.08:a<.16?1-(a-.08)/.16:a<.22?.5+(a-.16)/.12:Math.max(0,1-(a-.22)/.25);a>.5?this.endFlash(e+1e4+Math.random()*3e4):(this.scene.environmentIntensity=this.envBase+(.9-.4*this.dark)*r,this.scene.backgroundIntensity=1+.6*r,s=!0)}}else(this.flash||this.nextFlash)&&this.endFlash(0);return this.falling||i||s?33:t!=null&&t.storm?Math.max(33,this.nextFlash-e):0}endFlash(e){this.flash=null,this.nextFlash=e,this.scene.environmentIntensity=this.envBase,this.scene.backgroundIntensity=1}markShadows(){this.renderer.shadowMap.needsUpdate=!0}setupComposer(){let e=new V(1,1,{type:B,samples:4});this.composer=new Ie(this.renderer,e),this.composer.addPass(new Le(this.scene,this.camera)),this.gtao=new ye(this.scene,this.camera,1,1),this.gtao._renderGBuffer=!1,this.normalTarget=this.gtao.normalRenderTarget,this.gtao.updateGtaoMaterial({radius:.45,distanceExponent:1.6,thickness:1.2,scale:1,samples:12}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,rings:2,samples:12}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao),this.bloom=new se(new _(1,1),.12,.35,.98),this.composer.addPass(this.bloom),this.composer.addPass(new ke)}setSize(e,t,i){var s;this.composer&&(this.composer.setPixelRatio(i),this.composer.setSize(e,t),(s=this.gtao)==null||s.setSize(Math.max(1,Math.round(e*i/2)),Math.max(1,Math.round(t*i/2))))}render(){if(this.placeFog(),!this.composer){this.renderer.render(this.scene,this.camera);return}this.renderNormals(),this.composer.render()}renderNormals(){let e=[],t=[];this.scene.traverseVisible(l=>{let u=l;if(!u.isMesh)return;let c=this.registered.get(u);c?(t.push([u,u.material]),u.material=c.normal):e.push(l)});for(let l of e)l.visible=!1;let i=this.scene.background,s=this.scene.fog;this.scene.background=null,this.scene.fog=null;let a=this.renderer.shadowMap.enabled;this.renderer.shadowMap.enabled=!1;let r=this.renderer.getRenderTarget(),o=new w;this.renderer.getClearColor(o);let h=this.renderer.getClearAlpha();this.renderer.setRenderTarget(this.normalTarget),this.renderer.setClearColor(7829503,1),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(r),this.renderer.setClearColor(o,h),this.renderer.shadowMap.enabled=a,this.scene.background=i,this.scene.fog=s;for(let l of e)l.visible=!0;for(let[l,u]of t)l.material=u}dispose(){var e,t,i;for(let s of[...this.materialsByFloor.keys()])this.releaseFloor(s);for(let s of this.registered.values())s.normal.dispose();this.registered.clear(),this.scene.remove(this.sun,this.sun.target),this.sun.dispose(),this.envTex.dispose(),this.skyTex.dispose(),this.groundMaterial.dispose(),this.castOnly.dispose(),this.scene.remove(this.fx.group),this.fx.dispose(),this.scene.environment=null,this.scene.fog=null,(e=this.composer)==null||e.dispose(),(t=this.gtao)==null||t.dispose(),(i=this.bloom)==null||i.dispose(),_i(),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=0}};export{Ri as RealisticLook,qi as fullColour,Di as skyDirection};
