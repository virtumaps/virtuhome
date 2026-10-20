import{d as Ls}from"./chunk-7MOU7NY3.js";import{P as de,W as Je,X as Os,_ as et,c as Lt,d as Bt,e as Ns,f as Is,na as Bs}from"./chunk-WUINR4PW.js";import{A as fs,B as ms,C as ds,D as Nt,E as qe,F as ps,H as L,J as B,K as gs,L as q,M as he,Ma as ks,N as vs,O as xs,P as I,Q as bs,R as Ms,S as Ss,T as It,U as Ot,V as fe,Y as Ke,Z as K,_ as $e,aa as ws,c as Jt,ca as ys,d as es,da as Ts,e as At,ea as ke,f as W,fa as _s,g as ts,ga as Ps,h as ss,i as os,j as Fe,ja as Q,k as Ue,ka as G,l as Ft,la as Cs,m as Ut,ma as me,n as is,na as Ne,o as rs,oa as Rs,p as as,q as Ye,qa as Ds,r as ns,ra as Es,s as ls,sa as As,t as cs,u as re,ua as Fs,v as kt,x as us,y as hs,ya as Us,z as Y}from"./chunk-TVBYWARQ.js";import"./chunk-LZOLYCMD.js";import{F as Kt,G as $t}from"./chunk-7BQXBSVG.js";var $={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var H=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},ho=new Es(-1,1,1,-1,0,1),zt=class extends fe{constructor(){super(),this.setAttribute("position",new Ot([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ot([0,2,0,0,2,0],2))}},fo=new zt,J=class{constructor(e){this._mesh=new K(fo,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ho)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var tt=class extends H{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof G?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Q.clone(e.uniforms),this.material=new G({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new J(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ie=class extends H{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){let o=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),a.buffers.stencil.setFunc(o.ALWAYS,r,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(o.EQUAL,1,4294967295),a.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),a.buffers.stencil.setLocked(!0)}},st=class extends H{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var ot=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let s=e.getSize(new L);this._width=s.width,this._height=s.height,t=new q(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Y}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new tt($),this.copyPass.material.blending=W,this.timer=new Fs}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),s=!1;for(let o=0,a=this.passes.length;o<a;o++){let r=this.passes[o];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){let n=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ie!==void 0&&(r instanceof Ie?s=!0:r instanceof st&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new L);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var it=class extends H{constructor(e,t,s=null,o=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=o,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new I}render(e,t,s){let o=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=o}};var Oe={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new L},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new he},cameraProjectionMatrixInverse:{value:new he},cameraWorldMatrix:{value:new he},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new B(-1,-1,-1)},sceneBoxMax:{value:new B(1,1,1)}},vertexShader:`

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
		}`},Le={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

		}`},rt={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function zs(i=5){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=mo(e),s=t.length,o=new Uint8Array(s*4);for(let r=0;r<s;++r){let n=t[r],l=2*Math.PI*n/s,c=new B(Math.cos(l),Math.sin(l),0).normalize();o[r*4]=(c.x*.5+.5)*255,o[r*4+1]=(c.y*.5+.5)*255,o[r*4+2]=127,o[r*4+3]=255}let a=new $e(o,e,e);return a.wrapS=re,a.wrapT=re,a.needsUpdate=!0,a}function mo(i){let e=Math.floor(i)%2===0?Math.floor(i)+1:Math.floor(i),t=e*e,s=Array(t).fill(0),o=Math.floor(e/2),a=e-1;for(let r=1;r<=t;){if(o===-1&&a===e?(a=e-2,o=0):(a===e&&(a=0),o<0&&(o=e-1)),s[o*e+a]!==0){a-=2,o++;continue}else s[o*e+a]=r++;a++,o--}return s}var Be={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Vt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new L},cameraProjectionMatrixInverse:{value:new he},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function Vt(i,e,t){let s=po(i,e,t),o="vec3[SAMPLES](";for(let a=0;a<i;a++){let r=s[a];o+=`vec3(${r.x}, ${r.y}, ${r.z})${a<i-1?",":")"}`}return o}function po(i,e,t){let s=[];for(let o=0;o<i;o++){let a=2*Math.PI*e*o/i,r=Math.pow(o/(i-1),t);s.push(new B(Math.cos(a),Math.sin(a),r))}return s}var at=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let s,o,a,r=.5*(Math.sqrt(3)-1),n=(e+t)*r,l=Math.floor(e+n),c=Math.floor(t+n),h=(3-Math.sqrt(3))/6,d=(l+c)*h,m=l-d,f=c-d,u=e-m,p=t-f,x,v;u>p?(x=1,v=0):(x=0,v=1);let g=u-x+h,b=p-v+h,M=u-1+2*h,S=p-1+2*h,w=l&255,C=c&255,D=this.perm[w+this.perm[C]]%12,R=this.perm[w+x+this.perm[C+v]]%12,A=this.perm[w+1+this.perm[C+1]]%12,F=.5-u*u-p*p;F<0?s=0:(F*=F,s=F*F*this._dot(this.grad3[D],u,p));let N=.5-g*g-b*b;N<0?o=0:(N*=N,o=N*N*this._dot(this.grad3[R],g,b));let Z=.5-M*M-S*S;return Z<0?a=0:(Z*=Z,a=Z*Z*this._dot(this.grad3[A],M,S)),70*(s+o+a)}noise3d(e,t,s){let o,a,r,n,c=(e+t+s)*.3333333333333333,h=Math.floor(e+c),d=Math.floor(t+c),m=Math.floor(s+c),f=1/6,u=(h+d+m)*f,p=h-u,x=d-u,v=m-u,g=e-p,b=t-x,M=s-v,S,w,C,D,R,A;g>=b?b>=M?(S=1,w=0,C=0,D=1,R=1,A=0):g>=M?(S=1,w=0,C=0,D=1,R=0,A=1):(S=0,w=0,C=1,D=1,R=0,A=1):b<M?(S=0,w=0,C=1,D=0,R=1,A=1):g<M?(S=0,w=1,C=0,D=0,R=1,A=1):(S=0,w=1,C=0,D=1,R=1,A=0);let F=g-S+f,N=b-w+f,Z=M-C+f,xe=g-D+2*f,be=b-R+2*f,Me=M-A+2*f,Se=g-1+3*f,we=b-1+3*f,V=M-1+3*f,ae=h&255,ne=d&255,le=m&255,We=this.perm[ae+this.perm[ne+this.perm[le]]]%12,Qe=this.perm[ae+S+this.perm[ne+w+this.perm[le+C]]]%12,Ze=this.perm[ae+D+this.perm[ne+R+this.perm[le+A]]]%12,Xe=this.perm[ae+1+this.perm[ne+1+this.perm[le+1]]]%12,te=.6-g*g-b*b-M*M;te<0?o=0:(te*=te,o=te*te*this._dot3(this.grad3[We],g,b,M));let se=.6-F*F-N*N-Z*Z;se<0?a=0:(se*=se,a=se*se*this._dot3(this.grad3[Qe],F,N,Z));let oe=.6-xe*xe-be*be-Me*Me;oe<0?r=0:(oe*=oe,r=oe*oe*this._dot3(this.grad3[Ze],xe,be,Me));let ie=.6-Se*Se-we*we-V*V;return ie<0?n=0:(ie*=ie,n=ie*ie*this._dot3(this.grad3[Xe],Se,we,V)),32*(o+a+r+n)}noise4d(e,t,s,o){let a=this.grad4,r=this.simplex,n=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,h,d,m,f,u,p=(e+t+s+o)*l,x=Math.floor(e+p),v=Math.floor(t+p),g=Math.floor(s+p),b=Math.floor(o+p),M=(x+v+g+b)*c,S=x-M,w=v-M,C=g-M,D=b-M,R=e-S,A=t-w,F=s-C,N=o-D,Z=R>A?32:0,xe=R>F?16:0,be=A>F?8:0,Me=R>N?4:0,Se=A>N?2:0,we=F>N?1:0,V=Z+xe+be+Me+Se+we,ae=r[V][0]>=3?1:0,ne=r[V][1]>=3?1:0,le=r[V][2]>=3?1:0,We=r[V][3]>=3?1:0,Qe=r[V][0]>=2?1:0,Ze=r[V][1]>=2?1:0,Xe=r[V][2]>=2?1:0,te=r[V][3]>=2?1:0,se=r[V][0]>=1?1:0,oe=r[V][1]>=1?1:0,ie=r[V][2]>=1?1:0,qt=r[V][3]>=1?1:0,pt=R-ae+c,gt=A-ne+c,vt=F-le+c,xt=N-We+c,bt=R-Qe+2*c,Mt=A-Ze+2*c,St=F-Xe+2*c,wt=N-te+2*c,yt=R-se+3*c,Tt=A-oe+3*c,_t=F-ie+3*c,Pt=N-qt+3*c,Ct=R-1+4*c,Rt=A-1+4*c,Dt=F-1+4*c,Et=N-1+4*c,ye=x&255,Te=v&255,_e=g&255,Pe=b&255,ao=n[ye+n[Te+n[_e+n[Pe]]]]%32,no=n[ye+ae+n[Te+ne+n[_e+le+n[Pe+We]]]]%32,lo=n[ye+Qe+n[Te+Ze+n[_e+Xe+n[Pe+te]]]]%32,co=n[ye+se+n[Te+oe+n[_e+ie+n[Pe+qt]]]]%32,uo=n[ye+1+n[Te+1+n[_e+1+n[Pe+1]]]]%32,Ce=.6-R*R-A*A-F*F-N*N;Ce<0?h=0:(Ce*=Ce,h=Ce*Ce*this._dot4(a[ao],R,A,F,N));let Re=.6-pt*pt-gt*gt-vt*vt-xt*xt;Re<0?d=0:(Re*=Re,d=Re*Re*this._dot4(a[no],pt,gt,vt,xt));let De=.6-bt*bt-Mt*Mt-St*St-wt*wt;De<0?m=0:(De*=De,m=De*De*this._dot4(a[lo],bt,Mt,St,wt));let Ee=.6-yt*yt-Tt*Tt-_t*_t-Pt*Pt;Ee<0?f=0:(Ee*=Ee,f=Ee*Ee*this._dot4(a[co],yt,Tt,_t,Pt));let Ae=.6-Ct*Ct-Rt*Rt-Dt*Dt-Et*Et;return Ae<0?u=0:(Ae*=Ae,u=Ae*Ae*this._dot4(a[uo],Ct,Rt,Dt,Et)),27*(h+d+m+f+u)}_dot(e,t,s){return e[0]*t+e[1]*s}_dot3(e,t,s,o){return e[0]*t+e[1]*s+e[2]*o}_dot4(e,t,s,o,a){return e[0]*t+e[1]*s+e[2]*o+e[3]*a}};var ze=class i extends H{constructor(e,t,s=512,o=512,a,r,n){super(),this.width=s,this.height=o,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=zs(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new q(this.width,this.height,{type:Y,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new G({defines:Object.assign({},Oe.defines),uniforms:Q.clone(Oe.uniforms),vertexShader:Oe.vertexShader,fragmentShader:Oe.fragmentShader,blending:W,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Ne,this.normalMaterial.blending=W,this.pdMaterial=new G({defines:Object.assign({},Be.defines),uniforms:Q.clone(Be.uniforms),vertexShader:Be.vertexShader,fragmentShader:Be.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new G({defines:Object.assign({},Le.defines),uniforms:Q.clone(Le.uniforms),vertexShader:Le.vertexShader,fragmentShader:Le.fragmentShader,blending:W}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new G({uniforms:Q.clone($.uniforms),vertexShader:$.vertexShader,fragmentShader:$.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Ut,blendDst:Ue,blendEquation:Fe,blendSrcAlpha:Ft,blendDstAlpha:Ue,blendEquationAlpha:Fe}),this.blendMaterial=new G({uniforms:Q.clone(rt.uniforms),vertexShader:rt.vertexShader,fragmentShader:rt.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:os,blendSrc:Ut,blendDst:Ue,blendEquation:Fe,blendSrcAlpha:Ft,blendDstAlpha:Ue,blendEquationAlpha:Fe}),this._fsQuad=new J(null),this._originalClearColor=new I,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),r!==void 0&&this.updateGtaoMaterial(r),n!==void 0&&this.updatePdMaterial(n)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new _s,this.depthTexture.format=ds,this.depthTexture.type=fs,this.normalRenderTarget=new q(this.width,this.height,{minFilter:kt,magFilter:kt,type:Y,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let s=this.normalTexture?1:0,o=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=s,this.gtaoMaterial.defines.DEPTH_SWIZZLING=o,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=s,this.pdMaterial.defines.DEPTH_SWIZZLING=o,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Vt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,s){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case i.OUTPUT.Off:break;case i.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case i.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,s,o,a){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,o!=null&&(e.setClearColor(o),e.setClearAlpha(a||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_renderOverride(e,t,s,o,a){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,o=t.clearColor||o,a=t.clearAlpha||a,o!=null&&(e.setClearColor(o),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(s){(s.isPoints||s.isLine||s.isLine2)&&s.visible&&(s.visible=!1,t.push(s))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new at,s=e*e*4,o=new Uint8Array(s);for(let r=0;r<e;r++)for(let n=0;n<e;n++){let l=r,c=n;o[(r*e+n)*4]=(t.noise(l,c)*.5+.5)*255,o[(r*e+n)*4+1]=(t.noise(l+e,c)*.5+.5)*255,o[(r*e+n)*4+2]=(t.noise(l,c+e)*.5+.5)*255,o[(r*e+n)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}let a=new $e(o,e,e,ms,hs);return a.wrapS=re,a.wrapT=re,a.needsUpdate=!0,a}};ze.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Vs={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new I(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var pe=class i extends H{constructor(e,t=1,s,o){super(),this.strength=t,this.radius=s,this.threshold=o,this.resolution=e!==void 0?new L(e.x,e.y):new L(256,256),this.clearColor=new I(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new q(a,r,{type:Y,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let d=new q(a,r,{type:Y,depthBuffer:!1});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);let m=new q(a,r,{type:Y,depthBuffer:!1});m.texture.name="UnrealBloomPass.v"+h,m.texture.generateMipmaps=!1,this.renderTargetsVertical.push(m),a=Math.round(a/2),r=Math.round(r/2)}let n=Vs;this.highPassUniforms=Q.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new G({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new L(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Q.clone($.uniforms),this.blendMaterial=new G({uniforms:this.copyUniforms,vertexShader:$.vertexShader,fragmentShader:$.fragmentShader,premultipliedAlpha:!0,blending:ss,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new I,this._oldClearAlpha=1,this._basic=new Ke,this._fsQuad=new J(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(s,o);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,o),this.renderTargetsVertical[a].setSize(s,o),this.separableBlurMaterials[a].uniforms.invSize.value=new L(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(e,t,s,o,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){let t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);let o=[],a=[];for(let r=1;r<e;r+=2){let n=t[r],l=r+1<e?t[r+1]:0,c=n+l;o.push((r*n+(r+1)*l)/c),a.push(c)}return new G({defines:{KERNEL_PAIRS:o.length},uniforms:{colorTexture:{value:null},invSize:{value:new L(.5,.5)},direction:{value:new L(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:o},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new G({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};pe.BlurDirectionX=new L(1,0);pe.BlurDirectionY=new L(0,1);var Ve={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var nt=class extends H{constructor(){super(),this.isOutputPass=!0,this.uniforms=Q.clone(Ve.uniforms),this.material=new Cs({name:Ve.name,uniforms:this.uniforms,vertexShader:Ve.vertexShader,fragmentShader:Ve.fragmentShader}),this._fsQuad=new J(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},gs.getTransfer(this._outputColorSpace)===ps&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===is?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===rs?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===as?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ye?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ls?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===cs?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ns&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var lt=class extends Ms{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Ps;e.deleteAttribute("uv");let t=new me({side:es}),s=new me,o=new Ds(16777215,900,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new K(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let r=new ws(e,s,6),n=new vs;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),r.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),r.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),r.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),r.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),r.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),r.setMatrixAt(5,n.matrix),this.add(r);let l=new K(e,ge(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new K(e,ge(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new K(e,ge(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let d=new K(e,ge(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let m=new K(e,ge(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);let f=new K(e,ge(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function ge(i){return new Rs({color:0,emissive:16777215,emissiveIntensity:i})}function Gt(i){let e=i>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function U(i,e=0,t=0){let s=Math.imul(i|0,374761393)+Math.imul(e|0,668265263)+Math.imul(t|0,2147483647);return s=Math.imul(s^s>>>13,1274126177),((s^s>>>16)>>>0)/4294967296}var T=i=>i-Math.floor(i),P=(i,e)=>(i%e+e)%e,k=i=>i*i*(3-2*i),E=i=>i<0?0:i>1?1:i,_=(i,e,t)=>i+(e-i)*t,ee=(i,e,t)=>[_(i[0],e[0],t),_(i[1],e[1],t),_(i[2],e[2],t)],z=i=>[(i>>16&255)/255,(i>>8&255)/255,(i&255)/255],O=(i,e)=>E(Math.min(i,1-i)/e);function j(i,e,t){let s=new Float32Array(i*e);for(let o=0;o<s.length;o++)s[o]=t();return(o,a)=>{let r=T(o)*i,n=T(a)*e,l=Math.floor(r),c=Math.floor(n),h=k(r-l),d=k(n-c),m=(l+1)%i,f=(c+1)%e,u=s[c*i+l],p=s[c*i+m],x=s[f*i+l],v=s[f*i+m];return _(_(u,p,h),_(x,v,h),d)}}function y(i,e,t,s){let o=Array.from({length:t},(a,r)=>j(i<<r,e<<r,s));return(a,r)=>{let n=0,l=.5,c=0;for(let h of o)n+=h(a,r)*l,c+=l,l*=.5;return n/c}}function X(i,e,t=.8){let s=new Float32Array(i*i*2);for(let o=0;o<i*i;o++)s[o*2]=.5+(e()-.5)*t,s[o*2+1]=.5+(e()-.5)*t;return(o,a)=>{let r=T(o)*i,n=T(a)*i,l=Math.floor(r),c=Math.floor(n),h=9,d=9,m=0;for(let f=-1;f<=1;f++)for(let u=-1;u<=1;u++){let p=l+u,x=c+f,v=P(x,i)*i+P(p,i),g=p+s[v*2],b=x+s[v*2+1],M=g-r,S=b-n,w=Math.sqrt(M*M+S*S);w<h?(d=h,h=w,m=v):w<d&&(d=w)}return[h,d,m]}}var js=(i,e)=>e?js(e,i%e):i,Ht=(i,e)=>i/js(i,e)*e,ct=(i,e)=>i*Math.max(1,Math.ceil(e/i-1e-9)),Ws=10;function Wt(i){let[e,t]=i.unit,s=Math.max(1800,3*e);switch(i.pattern){case"grid":return ct(Ht(e,t),s);case"stretcher":return ct(Ht(e,2*t),s);case"third":return ct(Ht(e,3*t),s);case"herringbone":case"basketweave":return ct(2*e,1600);case"random":return Ws*e;case"crazy":return 2400;default:return i.material==="tarmac"?2500:1e3}}function Qt(i){let e=i.width+Qs;return e*Math.max(4,Math.round(3600/e))}var Qs=6;function ce(i,e,t,s,o,a,r){let n=a-e,l=r-t;return{id:i,d:Math.min(n,s-n,l,o-l),lx:n-s/2,ly:l-o/2,w:s,h:o}}function go(i,e,t){let s=Math.round(t/i);return(o,a)=>{let r=Math.floor(o/i),n=Math.floor(a/e);return ce(n*s+r,r*i,n*e,i,e,o,a)}}function Gs(i,e,t,s){let o=Math.round(t/i);return(a,r)=>{let n=Math.floor(r/e),l=P(n,s)*i/s,c=P(a+l,t),h=Math.floor(c/i);return ce(n*o+h,h*i,n*e,i,e,c,r)}}function vo(i,e,t){let s=Math.max(2,Math.round(i/e)),o=Math.round(t/e);return(a,r)=>{let n=Math.floor(a/e),l=Math.floor(r/e),c=P(n+l,2*s);if(c<s){let m=n-c;return ce(P(l,o)*o+P(m,o),m*e,l*e,s*e,e,a,r)}let h=l-(c-s),d=ce(P(h,o)*o+P(n,o)+o*o,n*e,h*e,e,s*e,a,r);return{...d,lx:d.ly,ly:d.lx,w:d.h,h:d.w}}}function xo(i,e,t){let s=Math.max(2,Math.round(i/e)),o=Math.round(t/i);return(a,r)=>{let n=Math.floor(a/i),l=Math.floor(r/i),c=(l*o+n)*s;if((n+l)%2===0){let m=Math.min(s-1,Math.floor((r-l*i)/e));return ce(c+m,n*i,l*i+m*e,i,e,a,r)}let h=Math.min(s-1,Math.floor((a-n*i)/e)),d=ce(c+h,n*i+h*e,l*i,e,i,a,r);return{...d,lx:d.ly,ly:d.lx,w:d.h,h:d.w}}}function bo(i,e){let t=Ws,s=new Int32Array(t*t).fill(-1),o=[],a=[[3,2,3],[2,3,1],[2,2,3],[2,1,2],[1,2,1],[1,1,1.2]],r=a.reduce((l,c)=>l+c[2],0),n=(l,c,h,d)=>{for(let m=0;m<d;m++)for(let f=0;f<h;f++)if(s[P(c+m,t)*t+P(l+f,t)]>=0)return!1;return!0};for(let l=0;l<t;l++)for(let c=0;c<t;c++){if(s[l*t+c]>=0)continue;let h=[1,1];for(let m=0;m<6;m++){let f=e()*r,u=a[0];for(let p of a)if((f-=p[2])<=0){u=p;break}if(n(c,l,u[0],u[1])){h=[u[0],u[1]];break}}let d=o.length;o.push({x:c,y:l,a:h[0],b:h[1]});for(let m=0;m<h[1];m++)for(let f=0;f<h[0];f++)s[P(l+m,t)*t+P(c+f,t)]=d}return(l,c)=>{let h=Math.floor(l/i),d=Math.floor(c/i),m=s[P(d,t)*t+P(h,t)],f=o[m],u=h-P(h-f.x,t),p=d-P(d-f.y,t);return ce(m,u*i,p*i,f.a*i,f.b*i,l,c)}}function Mo(i,e){let s=X(6,e,.95),o=i/6;return(a,r)=>{let[n,l,c]=s(a/i,r/i);return{id:c,d:(l-n)/2*o,lx:0,ly:0,w:o,h:o}}}var So=()=>({id:0,d:1/0,lx:0,ly:0,w:1,h:1});function jt(i){let e=parseInt(i.slice(1),16)||0;return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function Zs(i,e){let t=Math.floor(i),s=Math.floor(e),o=k(i-t),a=k(e-s);return _(_(U(t,s,31),U(t+1,s,31),o),_(U(t,s+1,31),U(t+1,s+1,31),o),a)}function Hs(i,e,t){let s=0,o=.5,a=0,r=1;for(let n=0;n<t;n++)s+=Zs(i*r+n*17.3,e*r-n*9.1)*o,a+=o,o*=.5,r*=2;return s/a}var wo=[[1,1,1],[1.1,1,.86],[.92,.97,1.04],[1.13,.95,.83],[.95,.99,.93],[1.05,1.02,.9],[.86,.86,.87]],yo=[[1,1,1],[1.16,.92,.84],[.74,.74,.78],[1.08,1.03,.9],[.9,.84,.82],[1.2,1.05,.88]],Ge=[0,0,0,0];function To(i,e,t){let[s,o]=i.unit;switch(i.pattern){case"grid":return go(s,o,e);case"stretcher":return Gs(s,o,e,2);case"third":return Gs(s,o,e,3);case"herringbone":return vo(s,o,e);case"basketweave":return xo(s,o,e);case"random":return bo(s,t);case"crazy":return Mo(e,t);default:return So}}function _o(i){let e=de[i.material],t=Wt(i),s=jt(i.color),o=jt(i.joint),a=e.joint/2;return{detail:!1,make:r=>{let n=To(i,t,r),l=Po(i,t,s,r),c=j(Math.max(4,Math.round(t/30)),Math.max(4,Math.round(t/30)),r),h=e.surface==="sett"||i.pattern==="crazy"?j(Math.round(t/25),Math.round(t/25),r):null,d=e.surface==="block"?5:e.surface==="clay"?3:e.surface==="tumbled"?5:e.surface==="sett"?6:e.surface==="smooth"?1:2.5;return(m,f)=>{let u=m*t,p=f*t,x=n(u,p),v=x.d;if(h&&isFinite(v)&&(v+=(h(m,f)-.5)*7),v<a){let R=c(m,f),A=(.82+R*.22)*_(.8,1,E(v/Math.max(1,a)));return[o[0]*A,o[1]*A,o[2]*A,.05+R*.05]}let g=x.id;l({u:m,v:f,x:u,y:p,hit:x,r1:U(g,1,77),r2:U(g,2,77),r3:U(g,3,77)});let[b,M,S,w]=Ge,C=isFinite(v)?k(E((v-a)/d)):1,D=_(.78,1,C);return[b*D,M*D,S*D,_(.15,w,C)]}}}}function Po(i,e,t,s){let o=de[i.material],a=o.vary,r=f=>Math.max(2,Math.round(e/f)),n=y(r(700),r(700),2,s),l=y(r(160),r(160),2,s),c=j(r(12),r(12),s),h=o.surface==="block"||o.surface==="clay"?yo:wo,d=f=>{let u=1+(f.r1-.5)*2*a,p=h[Math.floor(f.r2*h.length)%h.length];return[t[0]*u*_(1,p[0],i.mix),t[1]*u*_(1,p[1],i.mix),t[2]*u*_(1,p[2],i.mix)]},m=(f,u,p)=>{Ge[0]=f[0]*u,Ge[1]=f[1]*u,Ge[2]=f[2]*u,Ge[3]=p};switch(o.surface){case"riven":{let f=i.pattern==="crazy",u=[1.12,.93,.78];return p=>{let x=d(p),v=p.r3*Math.PI,g=Math.cos(v),b=Math.sin(v),M,S,w;if(f)M=n(p.u+p.r1,p.v+p.r2),S=l(p.u*.5+p.r2,p.v*2+p.r1),w=n(p.u+p.r3,p.v+p.r1);else{let F=p.hit.lx*g+p.hit.ly*b+p.r1*5e3,N=-p.hit.lx*b+p.hit.ly*g+p.r2*5e3;M=Hs(F/260,N/260,3),S=Hs(F/480,N/45,2),w=Zs(F/340,N/340)}let C=c(p.u,p.v),D=k(E((S-.55)*4))*(.15+.45*i.mix)+k(E((w-.62)*3))*.4*i.mix,R=[x[0]*_(1,u[0],D),x[1]*_(1,u[1],D),x[2]*_(1,u[2],D)],A=.9+(M-.5)*.24-D*.08+(C-.5)*.07;m(R,A,.4+M*.42+S*.1+C*.06)}}case"smooth":return f=>{let u=d(f),p=.97+(n(f.u+f.r1,f.v)-.5)*.06+(c(f.u,f.v)-.5)*.025;m(u,p,.9+c(f.u,f.v)*.03)};case"textured":{let f=j(r(9),r(9),s);return u=>{let p=d(u),x=c(u.u,u.v),v=f(u.u,u.v),g=v>.8?(v-.8)*2.5:0,b=.95+(l(u.u,u.v)-.5)*.1+(x-.5)*.14-g*.3;m(p,b,.82+x*.12-g*.4)}}case"flamed":{let f=j(r(4),r(4),s),u=j(r(5),r(5),s);return p=>{let x=d(p),v=f(p.u,p.v),g=u(p.u,p.v),b=.96+(l(p.u,p.v)-.5)*.06;v>.7?b*=_(1,.35,E((v-.7)*5)):g>.74&&(b*=_(1,1.3,E((g-.74)*6))),m(x,b,.8+(c(p.u,p.v)-.5)*.2+(v>.7?-.05:0))}}case"honed":{let f=j(r(6),r(6),s);return u=>{let p=d(u),x=f(u.u,u.v),v=.95+(n(u.u+u.r1,u.v+u.r3)-.5)*.16+(l(u.u,u.v)-.5)*.06-(x>.85?(x-.85)*2:0);m(p,v,.86+(l(u.u,u.v)-.5)*.06)}}case"tumbled":{let f=j(r(5),r(9),s);return u=>{let p=d(u),x=l(u.u,u.v),v=Math.sin((u.y/40+x*3+u.r3*7)*Math.PI),g=f(u.u,u.v),b=g>.8?Math.min(1,(g-.8)*6):0,M=.95+v*.045+(x-.5)*.08-b*.22;m(p,M,.82+v*.03-b*.5+(c(u.u,u.v)-.5)*.05)}}case"cleft":return f=>{let u=d(f),p=n(f.u+f.r1,f.v+f.r2)*.7+l(f.u,f.v)*.3,x=Math.floor(p*6)/6,v=k(E(T(p*6)*6)),g=.88+x*.22+(c(f.u,f.v)-.5)*.05-(1-v)*.08;m(u,g,x*.6+v*.08+.3)};case"block":case"clay":{let f=j(r(7),r(7),s),u=o.surface==="clay";return p=>{let x=d(p),v=c(p.u,p.v),g=f(p.u,p.v),b=u?(n(p.u+p.r3,p.v)-.5)*.2:0,M=.94+(v-.5)*.14+b-(u&&g>.78?(g-.78)*1.6:0)+(l(p.u,p.v)-.5)*.06;m(x,M,.8+v*.12)}}case"sett":{let f=j(r(4),r(4),s);return u=>{let p=d(u),x=2*u.hit.lx/u.hit.w,v=2*u.hit.ly/u.hit.h,g=1-.35*(x*x+v*v),b=f(u.u,u.v),M=(.92+(l(u.u,u.v)-.5)*.2+g*.06)*(b>.72?.6:1);m(p,M,g*.7+l(u.u,u.v)*.25)}}case"aggregate":{let f=X(r(6),s,.9);return u=>{let[p,x,v]=f(u.u,u.v),g=U(v,5),b=U(v,9),M=b>.93?1.35:b<.08?.55:.82+g*.3,S=E((x-p)/.3),w=M*_(.55,1,S)*(.92+E(1-p)*.12);m(t,w,S*E(1-p*.7))}}case"gravel":{let f=X(r(18),s,.9);return u=>{let[p,x,v]=f(u.u,u.v),g=U(v,3),b=U(v,11),M=b>.85?[1.08,1,.9]:b<.15?[.9,.93,.97]:[1,1,1],S=E((x-p)/.25),w=(.7+g*.45)*_(.45,1,S)*(.9+E(1-p)*.15);m([t[0]*M[0],t[1]*M[1],t[2]*M[2]],w,S*E(1-p*.8))}}default:{let f=j(r(6),r(6),s);return u=>{let p=f(u.u,u.v),x=.9+(c(u.u,u.v)-.5)*.3+(n(u.u,u.v)-.5)*.08+(p>.8?(p-.8)*1.6:0);m(t,x,c(u.u,u.v))}}}}function Co(i){let e=Qt(i),t=i.width+Qs,s=Math.round(e/t),o=jt(i.color),a=i.boards==="composite";return{detail:!1,make:r=>{let n=y(4,s*10,3,r),l=y(2,s*3,2,r),c=X(Math.max(4,Math.round(e/600)),r,.9),h=Array.from({length:s},()=>r());return(d,m)=>{let f=m*e,u=Math.floor(f/t),p=f-u*t;if(p>i.width)return[o[0]*.18,o[1]*.17,o[2]*.16,0];let x=h[u]*e;if(Math.min(Math.abs(d*e-x),e-Math.abs(d*e-x))<1.5)return[o[0]*.3,o[1]*.28,o[2]*.26,.05];let g=u*2+(d*e>x?1:0),b=U(g,4,13),M=U(g,8,13),S=k(E(Math.min(p,i.width-p)/4)),w=n(d+M,m),C,D;if(a)C=.97+(b-.5)*.06+(l(d+M,m)-.5)*.12+(w-.5)*.06,D=.85+(w-.5)*.12;else{let A=Math.abs(Math.sin((m*s*6+w*5+M*9)*Math.PI)),[F]=c(d+b*.37,m),N=i.boards==="softwood"&&F<.06&&M>.5?1-F/.06:0;C=.92+(b-.5)*.24+(w-.5)*.28-Math.pow(1-A,6)*.08-N*.3,D=.7+(i.boards==="softwood"?.5+.5*Math.cos(p/7*Math.PI*2):.5)*.2+(w-.5)*.1-N*.1}let R=C*_(.7,1,S);return[o[0]*R,o[1]*R,o[2]*R,D*_(.4,1,S)]}}}}function Xs(i){let e=i.indexOf(":"),t=i.slice(0,e),s=i.slice(e+1);if(t==="pave"){let o=Je(s);return o?_o(o):null}if(t==="deck"){let o=et(s);return o?Co(o):null}return null}function He(i,e,t,s,o=.45,a=!1){return{detail:a,make:r=>{let n=y(3,48,3,r),l=j(6,24,r),c=Array.from({length:i},()=>r()),h=t.map(z);return(d,m)=>{let f=Math.floor(m*i),u=T(m*i),p=d*e+c[f%i]*e,x=Math.floor(p),v=T(p),g=U(f,P(x,e),7),b=h[Math.floor(g*h.length)%h.length],M=n(d+g,m),S=l(d+g*.37,m),w=1+(g-.5)*s+(M-.5)*.35-Math.max(0,S-.8)*.8,C=Math.min(O(u,.02),O(v,.004*e)),D=w*_(o,1,C);return[b[0]*D,b[1]*D,b[2]*D,.4+.6*C-(1-M)*.05]}}}}function ut(i,e,t,s,o=.035,a=.06){return{detail:!1,make:r=>{let n=y(16,16,3,r),l=z(e),c=t===null?l:z(t),h=z(s);return(d,m)=>{let f=d*i,u=m*i,p=Math.floor(f),x=Math.floor(u),v=T(f),g=T(u),b=Math.min(O(v,o),O(g,o)),M=(p+x)%2===0?l:c,S=1+(U(P(p,i),P(x,i),3)-.5)*a+(n(d,m)-.5)*.06,w=ee(h,[M[0]*S,M[1]*S,M[2]*S],b);return[w[0],w[1],w[2],b*.9+.1]}}}}function Zt(i,e,t,s,o=!1){return{detail:o,make:a=>{let r=y(64,64,2,a),n=y(4,4,3,a),l=t.map(z),c=z(s);return(h,d)=>{let m=Math.floor(d*e),f=T(d*e),u=h*i+m%2*.5,p=Math.floor(u),x=T(u),v=U(P(p,i),P(m,e),11),g=Math.min(O(x,.045),O(f,.14)),b=l[Math.floor(v*l.length)%l.length],M=.88+v*.18+(r(h,d)-.5)*.3+(n(h,d)-.5)*.15,S=o?[.96+(r(h,d)-.5)*.08,.96,.95]:[b[0]*M,b[1]*M,b[2]*M],w=o?[.86,.86,.85]:[c[0]*(.9+r(h,d)*.2),c[1]*(.9+r(h,d)*.2),c[2]*(.9+r(h,d)*.2)],C=ee(w,S,k(g));return[C[0],C[1],C[2],.25+.75*k(g)-r(h,d)*.08]}}}}function Xt(i,e,t,s){return{detail:s,make:o=>{let a=e?y(48,3,3,o):y(3,48,3,o),r=t.map(z);return(n,l)=>{let c=e?n:l,h=e?l:n,d=Math.floor(c*i),m=T(c*i),f=U(P(d,i),0,5),u=r[Math.floor(f*r.length)%r.length],p=O(m,.06),x=e?1:.82+.18*k(E(m/.25)),v=(.92+f*.12+(a(n,l)-.5)*(s?.12:.3))*x*_(.45,1,p);return[u[0]*v,u[1]*v,u[2]*v,p*(e?1:.6+.4*m)]}}}}function je(i,e,t=0,s=!0){return{detail:s,make:o=>{let a=y(e,e,4,o),r=y(128,128,1,o);return(n,l)=>{let c=a(n,l),h=r(n,l),d=1-i*.5+(c-.5)*i-Math.max(0,h-.7)*t;return[d,d,d,c*.6+h*(t?.8:.2)]}}}}function Ys(i,e,t=0){return{detail:!0,make:s=>{let o=y(8,8,3,s),a=y(4,i,2,s);return(r,n)=>{let l=Math.sin(r*i*Math.PI*2),c=Math.sin(n*i*Math.PI*2),h=(Math.floor(r*i)+Math.floor(n*i))%2===0,d=Math.abs(h?l:c),m=.9+d*e-e*.5+(o(r,n)-.5)*.08+(a(r,n)-.5)*t;return[m,m,m,d]}}}}function ht(i){return{detail:i.detail,make:e=>{let t=y(48,48,2,e),s=y(5,5,3,e),o=(i.tones??[16777215]).map(z),a=i.step??.55;return(r,n)=>{let l=Math.floor(n*i.courses),c=T(n*i.courses),h=r*i.perCourse+(i.stagger&&l%2?.5:0),d=Math.floor(h),m=T(h),f=U(P(d,i.perCourse),P(l,i.courses),21),u=1-c*a,p=_(.6,1,k(E((1-c)/.14)))*_(.82,1,k(E(c/.25)));if(i.rolls){let b=i.wave?Math.sin(m*Math.PI*2)*.5+.5*Math.sin(m*Math.PI):Math.sin(m*Math.PI*i.rolls);u+=b*i.roll*.4,p*=.9+b*i.roll*.25}i.camber&&(u+=Math.sin(m*Math.PI)*i.camber);let x=O(m,i.rolls?.02:.035);p*=_(.55,1,x);let v=o[Math.floor(f*o.length)%o.length],g=p*(1+(f-.5)*i.vary+(t(r,n)-.5)*.1+(s(r,n)-.5)*.08);return[v[0]*g,v[1]*g,v[2]*g,E(u*.8*x+(t(r,n)-.5)*.05)]}}}}var Ro={planks_light:He(13,2,[14467226,13939850,14862500,13610628],.12),planks_oak:He(13,2,[13213810,12555366,13806204,12160092],.14),planks_walnut:He(13,2,[8084033,7229240,8807242,6243120],.16),planks_grey:He(13,2,[12104362,11446174,12762292,10854037],.1),vinyl:He(8,2,[16777215],.05,.75,!0),herringbone:{detail:!1,make:i=>{let e=y(4,64,3,i),t=[12885102,12095328,13609082,11437398].map(z),s=4,o=16;return(a,r)=>{let n=a*o,l=r*o,c=Math.floor(n),h=Math.floor(l),d=T(n),m=T(l),f=P(c+h,2*s),u,p,x,v;f<s?(v=!0,u=(f+d)/s,p=m,x=U(P(c-f,o),P(h,o),1)):(v=!1,u=(f-s+m)/s,p=d,x=U(P(c,o),P(h-(f-s),o),2));let g=t[Math.floor(x*t.length)%t.length],b=v?e(a,r):e(r,a),M=Math.min(O(p,.05),O(u,.012)),S=(.92+x*.14+(b-.5)*.3)*_(.45,1,M);return[g[0]*S,g[1]*S,g[2]*S,.4+.6*M]}}},tiles_light:ut(2,14474456,null,12171184),tiles_dark:ut(2,5921888,null,4605770),tiles_terracotta:ut(4,12086603,null,13483950,.05,.16),checker:ut(4,15658730,2960945,10132118,.02,.03),tiles_metro:{detail:!0,make:i=>{let e=y(8,8,2,i);return(t,s)=>{let o=Math.floor(s*6),a=t*3+o%2*.5,r=Math.min(O(T(a),.03),O(T(s*6),.06)),n=Math.min(O(T(a),.12),O(T(s*6),.24)),l=_(.72,1,k(r))*(.97+(e(t,s)-.5)*.04);return[l,l,l,.2+.5*k(r)+.3*k(n)]}}},marble:{detail:!1,make:i=>{let e=y(4,4,5,i),t=y(8,8,3,i);return(s,o)=>{let a=Math.abs(Math.sin((s*2+o+e(s,o)*2.4)*Math.PI*2)),r=Math.pow(1-E(a/.12),2)*.5+Math.pow(1-E(Math.abs(Math.sin((o*3-s+t(s,o)*3)*Math.PI*2))/.05),2)*.25,n=Math.min(O(T(s*2),.004),O(T(o*2),.004)),l=ee([.93,.925,.91],[.55,.56,.58],r),c=_(.7,1,n);return[l[0]*c,l[1]*c,l[2]*c,n]}}},carpet:{detail:!0,make:i=>{let e=y(96,96,2,i),t=y(6,6,3,i);return(s,o)=>{let a=.86+(e(s,o)-.5)*.22+(t(s,o)-.5)*.08;return[a,a,a,e(s,o)]}}},flagstone:{detail:!1,make:i=>{let e=X(4,i,.7),t=y(24,24,3,i),s=[12169894,11117463,12893616,10393483].map(z);return(o,a)=>{let[r,n,l]=e(o,a),c=E((n-r)/.08),h=s[l%s.length],d=.9+(t(o,a)-.5)*.3+U(l)*.1,m=ee([.45,.43,.4],[h[0]*d,h[1]*d,h[2]*d],k(c));return[m[0],m[1],m[2],k(c)*.8+t(o,a)*.2]}}},concrete:je(.16,6,.25),plaster:je(.05,8,0),render:je(.1,10,.2),pebbledash:{detail:!0,make:i=>{let e=X(40,i,.9),t=y(8,8,2,i);return(s,o)=>{let[a,,r]=e(s,o),n=E(1-a/.5),l=.8+n*.2+(U(r)-.5)*.12+(t(s,o)-.5)*.05;return[l,l,l,n]}}},wp_stripes:{detail:!0,make:i=>{let e=y(4,16,2,i);return(t,s)=>{let o=T(t*8),a=o<.5?1:.86,r=Math.abs(o-.75)<.012?.8:1,n=a*r*(.98+(e(t,s)-.5)*.03);return[n,n,n,.5]}}},wp_damask:{detail:!0,make:()=>(i,e)=>{let t=i*2,s=e*3,o=Math.floor(s),a=T(t+o%2*.5)-.5,r=T(s)-.5,n=Math.hypot(a,r*1.3),l=Math.atan2(r,a),c=.26+.07*Math.cos(l*6)+.03*Math.cos(l*12),h=n<c?n<.08||n>.13&&n<.16?0:1:0,d=Math.abs(Math.sin((a+r)*14)*Math.sin((a-r)*14))>.92&&n>.33?1:0,m=h||d?.82:1;return[m,m,m,h||d?.6:.4]}},wp_geo:{detail:!0,make:()=>(i,e)=>{let t=T(i*4+e*3),s=T(i*4-e*3),o=Math.min(Math.abs(t-.5),Math.abs(s-.5))<.035,a=(Math.floor(i*4+e*3)+Math.floor(i*4-e*3))%2===0,r=o?.7:a?.94:1;return[r,r,r,o?.3:.5]}},wp_leaves:{detail:!0,make:i=>{let t=Array.from({length:25},()=>({x:i(),y:i(),a:i()*Math.PI,s:.7+i()*.5,t:i()}));return(s,o)=>{let a=1,r=.4,n=Math.floor(s*5),l=Math.floor(o*5);for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){let d=n+h,m=l+c,f=t[P(m,5)*5+P(d,5)],u=(d+f.x)/5,p=(m+f.y)/5,x=(s-u)*5,v=(o-p)*5,g=Math.cos(f.a),b=Math.sin(f.a),M=(x*g+v*b)/f.s,S=(-x*b+v*g)/f.s;if(M*M/.36+S*S/.05<1){let C=Math.abs(S)<.015?.1:0;a=Math.min(a,(f.t>.5?.72:.8)+C),r=.7}}return[a,a,a,r]}}},panelling:{detail:!0,make:i=>{let e=y(6,6,2,i),t=[.05,.42,.958];return(s,o)=>{let a=T(s*4),r=Math.min(...t.map(f=>Math.abs(o-f))),n=Math.min(a,1-a)*.6,l=r*2.4,c=Math.min(n,l),h=k(E((c-.05)/.025)),d=o<.05?1:0,m=(d?.97:_(1,.93,h))*(.985+(e(s,o)-.5)*.03);return[m,m,m,d?1:1-h*.5]}}},brick_red:Zt(6,18,[10902080,10112824,11822666,9325109,11364946],13222066),brick_buff:Zt(6,18,[13281142,12622697,13874053,12160861],14209218),brick_painted:Zt(6,18,[16777215],16777215,!0),stone_wall:{detail:!1,make:i=>{let e=y(16,16,3,i),t=[0,.16,.3,.47,.6,.77,.88,1],s=[12103064,10984584,12826788,10326655,11576462].map(z);return(o,a)=>{let r=0;for(;r<t.length-2&&a>=t[r+1];)r++;let n=t[r],l=t[r+1],c=(a-n)/(l-n),h=3+r%3,d=o*h+U(r,1)*.7,m=Math.floor(d),f=T(d),u=U(P(m,h),r,4),p=Math.min(O(f,.04),O(c,.1)),x=s[Math.floor(u*s.length)%s.length],v=.88+u*.16+(e(o,a)-.5)*.3,g=ee([.62,.6,.56],[x[0]*v,x[1]*v,x[2]*v],k(p));return[g[0],g[1],g[2],k(p)*(.8+e(o,a)*.2)]}}},boards_v:Xt(10,!0,[11569248,10976853,12293227],!1),boards_h:Xt(8,!1,[16777215],!0),timber_h:Xt(8,!1,[10976081,10252360,11765596,9660996],!1),concrete_panels:{detail:!0,make:i=>{let e=y(6,6,4,i),t=y(96,96,1,i);return(s,o)=>{let a=T(s*2),r=T(o*2),n=Math.min(O(a,.006),O(r,.006)),l=[.2,.8].some(h=>[.2,.8].some(d=>Math.hypot(a-h,r-d)<.012))?.55:1,c=(.9+(e(s,o)-.5)*.18-Math.max(0,t(s,o)-.75)*.2)*_(.6,1,n)*l;return[c,c,c,n*l]}}},grass:{detail:!1,make:i=>{let e=y(4,4,3,i),t=y(128,128,2,i);return(s,o)=>{let a=e(s,o),r=t(s,o),n=ee(z(7313992),z(10272610),a),l=.78+r*.36;return[n[0]*l,n[1]*l*(.95+a*.08),n[2]*l*.9,r]}}},soil:{detail:!1,make:i=>{let e=y(24,24,4,i);return(t,s)=>{let o=.75+e(t,s)*.5;return[.36*o,.27*o,.2*o,e(t,s)]}}},weave:Ys(110,.14),linen:Ys(90,.1,.12),velvet:je(.08,12,0),boucle:{detail:!0,make:i=>{let e=X(70,i,.9);return(t,s)=>{let[o]=e(t,s),a=E(1-o/.6),r=.84+a*.16;return[r,r,r,a]}}},leather:{detail:!0,make:i=>{let e=X(36,i,.9),t=y(6,6,3,i);return(s,o)=>{let[a,r]=e(s,o),n=E((r-a)/.12),l=(.9+(t(s,o)-.5)*.16)*_(.82,1,n);return[l,l,l,n*.6+a*.2]}}},wood_grain:{detail:!0,make:i=>{let e=y(3,40,4,i);return(t,s)=>{let o=e(t,s),a=Math.abs(Math.sin((s*22+o*6)*Math.PI)),r=.86+o*.16-Math.pow(1-a,6)*.08;return[r,r,r,o]}}},wood_grain_v:{detail:!0,make:i=>{let e=y(40,3,4,i);return(t,s)=>{let o=e(t,s),a=Math.abs(Math.sin((t*22+o*6)*Math.PI)),r=.86+o*.16-Math.pow(1-a,6)*.08;return[r,r,r,o]}}},brushed:{detail:!0,make:i=>{let e=y(2,256,2,i);return(t,s)=>{let o=.92+(e(t,s)-.5)*.12;return[o,o,o,e(t,s)]}}},foliage:{detail:!0,make:i=>{let e=X(24,i,.9),t=y(8,8,2,i);return(s,o)=>{let[a,r,n]=e(s,o),l=E((r-a)/.2),c=(.7+U(n)*.4)*_(.6,1,l)+(t(s,o)-.5)*.1;return[c,c,c,l]}}},rug:{detail:!0,make:i=>{let e=y(96,96,1,i);return(t,s)=>{let o=Math.abs(T(t*4)-.5)+Math.abs(T(s*4)-.5),a=Math.abs(T(o*3)-.5)<.12,n=(Math.abs(T(s*4)-.5)>.46?.62:a?.74:o<.18?.86:1)*(.92+e(t,s)*.1);return[n,n,n,e(t,s)]}}},canvas_art:{detail:!0,make:i=>{let e=Array.from({length:9},()=>({x:i(),y:i(),r:.08+i()*.2,t:i()})),t=y(64,64,1,i);return(s,o)=>{let a=.95;for(let r of e)Math.hypot(P(s-r.x+.5,1)-.5,P(o-r.y+.5,1)-.5)<r.r&&(a=Math.min(a,.35+r.t*.55));return[a+(t(s,o)-.5)*.04,a,a,t(s,o)*.3]}}},roof_interlocking:ht({courses:5,perCourse:5,stagger:!1,rolls:2,roll:.25,vary:.08,detail:!0}),roof_plain:ht({courses:12,perCourse:7,stagger:!0,rolls:0,roll:0,vary:.22,detail:!0,camber:.15}),roof_slate:ht({courses:7,perCourse:6,stagger:!0,rolls:0,roll:0,vary:.12,detail:!1,tones:[4935512,4606549,5329756,4869458,5592158],step:.35}),roof_pantile:ht({courses:5,perCourse:6,stagger:!1,rolls:1,roll:.75,vary:.14,detail:!0,wave:!0}),roof_thatch:{detail:!1,make:i=>{let e=y(96,6,3,i),t=y(6,6,3,i);return(s,o)=>{let a=o*6+(t(s,o)-.5)*.5,r=T(a),n=e(s,o*.5+Math.floor(a)*.37),l=(.7+n*.45)*_(.62,1,k(E(r/.3))),c=ee(z(10257487),z(12888946),t(s,o));return[c[0]*l,c[1]*l,c[2]*l,n*.7+(1-r)*.3]}}},roof_seam:{detail:!0,make:i=>{let e=y(4,16,3,i);return(t,s)=>{let o=T(t*3),a=1-O(o,.03),r=.96+(e(t,s)-.5)*.05+a*.1-(1-O(o,.06))*.06;return[r,r,r,.3+a*.7+(e(t,s)-.5)*.05]}}},logs:{detail:!0,make:i=>{let e=y(3,64,3,i);return(t,s)=>{let o=T(s*8),a=Math.sin(o*Math.PI),r=(.62+.4*Math.pow(a,.5))*(.94+(e(t,s)-.5)*.18);return[r,r,r,a]}}},corrugated:{detail:!0,make:i=>{let e=y(4,4,2,i);return(t,s)=>{let o=Math.sin(t*10*Math.PI*2),a=.86+o*.12+(e(t,s)-.5)*.05;return[a,a,a,.5+o*.5]}}},shingles:{detail:!0,make:i=>{let e=y(128,128,1,i);return(t,s)=>{let o=Math.floor(s*7),a=T(s*7),r=t*3+o%2*.5+U(o,4)*.3,n=T(r),l=U(Math.floor(r),o,8),c=O(n,.03),h=_(.6,1,k(E((1-a)/.18))),d=(.88+(l-.5)*.18+(e(t,s)-.5)*.25)*h*_(.5,1,c);return[d,d,d,(1-a*.6)*c]}}},rust:{detail:!0,make:i=>{let e=y(5,5,4,i),t=y(96,96,2,i);return(s,o)=>{let a=e(s,o),r=t(s,o);return[.86+a*.3+(r-.5)*.12,.84+a*.24+(r-.5)*.1,.82+a*.18+(r-.5)*.08,r]}}},roof_felt:{detail:!0,make:i=>{let e=y(160,160,1,i),t=y(6,6,3,i);return(s,o)=>{let a=T(o*2),r=_(.8,1,k(E(a/.06))),n=(.9+(e(s,o)-.5)*.35+(t(s,o)-.5)*.08)*r;return[n,n,n,e(s,o)*.5+(a<.03?0:.5)]}}},roof_epdm:{detail:!1,make:i=>{let e=y(5,5,4,i);return(t,s)=>{let o=.95+(e(t,s)-.5)*.12;return[.165*o,.17*o,.18*o,e(t,s)*.3]}}},roof_grp:je(.05,5,.05),roof_lead:{detail:!1,make:i=>{let e=y(6,6,4,i);return(t,s)=>{let o=T(t*2.5),a=Math.max(0,1-Math.abs(o-.5)/.05),r=ee(z(7304571),z(9410203),e(t,s)),n=.92+a*.15;return[r[0]*n,r[1]*n,r[2]*n,.3+a*.7]}}},roof_sedum:{detail:!1,make:i=>{let e=X(28,i,.9),t=y(5,5,3,i),s=[6192956,8033350,9071418,10308154,7113290,11051098].map(z);return(o,a)=>{let[r,n,l]=e(o,a),c=t(o,a),h=s[Math.floor(U(l,Math.floor(c*3),9)*s.length)%s.length],d=k(E((n-r)*3)),m=.65+d*.45;return[h[0]*m,h[1]*m,h[2]*m,d]}}}},ft=new Map;function qs(i,e,t){let s=Ks(i);if(!s)return null;let o=`${i}@${e}`,a=ft.get(o);if(a)return a;let r=s.make(Gt(Do(i))),n=document.createElement("canvas");n.width=n.height=e;let l=n.getContext("2d"),c=l.createImageData(e,e),h=new Float32Array(e*e);for(let g=0;g<e;g++){let b=1-(g+.5)/e;for(let M=0;M<e;M++){let[S,w,C,D]=r((M+.5)/e,b),R=(g*e+M)*4;c.data[R]=E(S)*255,c.data[R+1]=E(w)*255,c.data[R+2]=E(C)*255,c.data[R+3]=255,h[g*e+M]=D}}l.putImageData(c,0,0);let d=new ke(n);d.colorSpace=s.detail?Nt:qe;let m=document.createElement("canvas");m.width=m.height=e;let f=m.getContext("2d"),u=f.createImageData(e,e),p=e/128;for(let g=0;g<e;g++)for(let b=0;b<e;b++){let M=h[g*e+P(b-1,e)],S=h[g*e+P(b+1,e)],w=h[P(g-1,e)*e+b],C=h[P(g+1,e)*e+b],D=-(S-M)*p,R=-(w-C)*p,A=Math.hypot(D,R,1),F=(g*e+b)*4;u.data[F]=(D/A*.5+.5)*255,u.data[F+1]=(R/A*.5+.5)*255,u.data[F+2]=(1/A*.5+.5)*255,u.data[F+3]=255}f.putImageData(u,0,0);let x=new ke(m);x.colorSpace=Nt;for(let g of[d,x])g.wrapS=g.wrapT=re,g.minFilter=us,g.anisotropy=t;let v={map:d,normal:x};return ft.set(o,v),v}function Ks(i){return Ro[i]??Xs(i)}function $s(i){var e;return((e=Ks(i))==null?void 0:e.detail)??!0}function Do(i){let e=2166136261;for(let t=0;t<i.length;t++)e=Math.imul(e^i.charCodeAt(t),16777619);return e>>>0}function Js(){var i;for(let e of ft.values())e.map.dispose(),(i=e.normal)==null||i.dispose();ft.clear()}var Eo=`
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
}`,Ao=`
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
}`,Fo=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha * vAlpha); }`,Uo=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1.0 - d * 3.2));
}`;function eo(i,e,t){return new G({vertexShader:i,fragmentShader:e,uniforms:t,transparent:!0,depthWrite:!1,blending:ts,fog:!1})}var mt=class{constructor(e){this.group=new xs;this.shared={uTime:{value:0},uTop:{value:10},uHeight:{value:12},uWind:{value:new L}};this.rainU={...this.shared,uFall:{value:8},uLen:{value:.42},uColor:{value:new I(12109010)},uAlpha:{value:.32}};this.snowU={...this.shared,uFall:{value:.9},uSize:{value:.045},uScale:{value:800},uColor:{value:new I(16777215)},uAlpha:{value:.9}};this.area=null;this.key="";this.rainMax=e?9e3:4500,this.snowMax=e?7e3:3500,this.rain=new ys(new fe,eo(Eo,Fo,this.rainU)),this.snow=new Ts(new fe,eo(Ao,Uo,this.snowU));for(let t of[this.rain,this.snow])t.frustumCulled=!1,t.renderOrder=4,t.visible=!1;this.group.add(this.rain,this.snow)}setArea(e){this.area=e,this.key=""}set(e){let t=this.area,s=!!t&&(e.rain>.02||e.snow>.02);if(this.rain.visible=!!t&&e.rain>.02,this.snow.visible=!!t&&e.snow>.02,!t||!s)return!1;this.shared.uTop.value=t.top,this.shared.uHeight.value=t.top-t.ground;let o=this.rain.visible?.55:.9;this.shared.uWind.value.set(e.drift[0]*o,e.drift[1]*o),this.rainU.uColor.value.setHex(e.night?8227744:12109010),this.rainU.uAlpha.value=e.night?.32:.45,this.snowU.uColor.value.setHex(e.night?13226982:16777215);let a=[t.minX,t.maxX,t.minZ,t.maxZ,t.top,t.ground,t.rooms.length,Math.round(e.drift[0]),Math.round(e.drift[1])].map(r=>Number(r).toFixed(1)).join("|");return a!==this.key&&(this.key=a,this.build(t)),this.rain.geometry.setDrawRange(0,Math.round(this.rainMax*Math.min(1,e.rain))*2),this.snow.geometry.setDrawRange(0,Math.round(this.snowMax*Math.min(1,e.snow))),!0}tick(e,t){this.shared.uTime.value=e,this.snowU.uScale.value=t}build(e){let t=e.top-e.ground,s=this.shared.uWind.value,o=[this.rainU.uFall.value,this.snowU.uFall.value].map(v=>[s.x*(t/v/2),s.y*(t/v/2)]),a=(v,g,b)=>{for(let M of[-1,0,1]){let S=[v+b[0]*M,g+b[1]*M];if(e.rooms.some(w=>Kt(S,w)||w.some((C,D)=>$t(S,C,w[(D+1)%w.length]).d<.35)))return!1}return!0},r=Math.max(6,.45*Math.max(e.maxX-e.minX,e.maxZ-e.minZ)),n=e.minX-r,l=e.maxX+r,c=e.minZ-r,h=e.maxZ+r,d=12345,m=()=>(d=d*1103515245+12345&2147483647)/2147483647,f=(v,g)=>{let b=[];for(let M=0;b.length<v&&M<v*6;M++){let S=n+m()*(l-n),w=c+m()*(h-c);a(S,w,g)&&b.push([S,w,m(),.6+m()*.8])}return b},u=f(this.rainMax,o[0]),p=new Float32Array(u.length*8);u.forEach((v,g)=>{p.set([v[0],v[1],v[2],0,v[0],v[1],v[2],1],g*8)}),this.replace(this.rain,p);let x=f(this.snowMax,o[1]);this.replace(this.snow,new Float32Array(x.flat()))}replace(e,t){let s=new fe;s.setAttribute("aSeed",new It(t,4)),s.setAttribute("position",new It(new Float32Array(t.length/4*3),3)),e.geometry.dispose(),e.geometry=s}dispose(){for(let e of[this.rain,this.snow])e.geometry.dispose(),e.material.dispose()}};var ko={wood:{tex:"wood_grain",scale:.9,rough:.5,relief:.25},woodDark:{tex:"wood_grain",scale:.9,rough:.45,relief:.25},white:{rough:.45},dark:{rough:.45},metal:{tex:"brushed",scale:.5,rough:.3,metal:.85},glass:{rough:.04,opacity:.28},plant:{tex:"foliage",scale:.35,rough:.65,relief:.8},leaf:{tex:"foliage",scale:.3,rough:.6,relief:.8},pot:{tex:"plaster",scale:.5,rough:.8,relief:.3},soil:{tex:"carpet",scale:.3,rough:1},accent:{rough:.45},red:{rough:.5},blue:{rough:.5},screen:{rough:.12,metal:.2},ceramic:{rough:.1},rug:{tex:"rug",scale:1.2,rough:.95,relief:.3},mattress:{tex:"weave",scale:.3,rough:.9,relief:.2},bulb:{rough:.55},paper:{rough:.85},canvas:{tex:"canvas_art",scale:1,rough:.85,relief:.2},mirror:{rough:.02,metal:1},water:{rough:.03,opacity:.8},rubber:{rough:.85},pine:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},softwood:{tex:"wood_grain_v",scale:.6,rough:.7,relief:.15},oak:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},walnut:{tex:"wood_grain_v",scale:.6,rough:.45,relief:.2},primed:{rough:.85},blackMetal:{rough:.4,metal:.6},concrete:{tex:"concrete",scale:.8,rough:.9,relief:.25},brick:{tex:"brick_red",scale:1.35,rough:.85,relief:.9},shiplap:{tex:"boards_h",scale:1.2,rough:.7,relief:.7},logs:{tex:"logs",scale:1.12,rough:.7,relief:.9},corrugated:{tex:"corrugated",scale:.76,rough:.45,metal:.3,relief:.9},felt:{tex:"roof_felt",scale:2,rough:.95,relief:.4},shingle:{tex:"shingles",scale:1,rough:.9,relief:.8},epdm:{tex:"roof_epdm",scale:3,rough:.8,relief:.15},sedum:{tex:"roof_sedum",scale:1.5,rough:1,relief:.8},corten:{tex:"rust",scale:1,rough:.8,relief:.3},galvanised:{tex:"brushed",scale:.5,rough:.35,metal:.7},sleeper:{tex:"wood_grain_v",scale:.6,rough:.85,relief:.4},stone:{tex:"stone_wall",scale:1,rough:.85,relief:.9},rattan:{tex:"weave",scale:.15,rough:.8,relief:.6},bloom:{tex:"foliage",scale:.25,rough:.7,relief:.6},lavender:{tex:"foliage",scale:.25,rough:.7,relief:.6},straw:{tex:"foliage",scale:.3,rough:.75,relief:.6}},No={cap:{rough:.9},slab:{tex:"concrete",scale:3,rough:.9,relief:.2},blind:{tex:"linen",scale:.3,rough:.9,relief:.2},glass:{rough:.04,opacity:.3},pv:{rough:.38,metal:.05}},to={lawn:{tex:"grass",scale:2,rough:.95,relief:.4},bed:{tex:"soil",scale:1.5,rough:1,relief:.6}};function io(i){let[e,t]=i.split(":"),s=ks(i);if(s)return{tex:s.tex,scale:s.scale,rough:s.roughness,metal:s.metalness,relief:s.relief};if(e==="role")return ko[t]??{rough:.6};if(e==="out")return to[t]??to.lawn;if(e==="pave"){let o=Je(t);if(o)return{tex:i,scale:Wt(o)/1e3,rough:de[o.material].roughness,relief:de[o.material].relief,res:2}}if(e==="deck"){let o=et(t);if(o)return{tex:i,scale:Qt(o)/1e3,rough:Os[o.boards].roughness,relief:.7,res:2}}return No[e]??{rough:.6}}function Io(i){let e=io(i);return!!e.tex&&!$s(e.tex)}var ro={value:1},ue={uFill:{value:1},uWet:{value:0},uSnow:{value:0},uTime:{value:0},uSway:{value:new L}},Oo=Lt+`
attribute vec3 aLamp;
attribute vec3 aEmis;
uniform float uIndoor;
uniform float uTime;
uniform vec2 uSway;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,Lo=Bt+`
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
`,Bo=Ns+`
uniform float uLampGain;
uniform float uFill;
uniform float uWet;
uniform float uSnow;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,zo=`
float vhFaceUp = smoothstep(0.5, 0.9, vUp);
float vhWet = uWet * vOut * (0.35 + 0.65 * vhFaceUp);
float vhSnow = uSnow * vOut * vhFaceUp;
diffuseColor.rgb *= 1.0 - 0.3 * vhWet;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), vhSnow * 0.94);
`,Vo=`
roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.16), vhWet * vhFaceUp * (1.0 - vhSnow));
roughnessFactor = mix(roughnessFactor, 0.85, vhSnow);
`;function Go(i,e,t){i.onBeforeCompile=s=>{Object.assign(s.uniforms,e,ue,{uLampGain:ro}),s.vertexShader=Oo+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+Lo),s.fragmentShader=Bo+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+Is+zo).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+Vo).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vEmis;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
reflectedLight.indirectDiffuse *= mix(uFill, 1.0, vOut);
reflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;`)},i.customProgramCacheKey=()=>t}var Ho=new Set(["role:plant","role:leaf","role:bloom","role:lavender","role:straw"]);function jo(i,e,t){return i.onBeforeCompile=s=>{Object.assign(s.uniforms,e),s.vertexShader=Lt+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+Bt)},i.customProgramCacheKey=()=>t,i}function Wo(){let i=document.createElement("canvas");i.width=4,i.height=256;let e=new ke(i);return e.colorSpace=qe,e}function Qo(i,e,t){let o=i.image.getContext("2d"),a=o.createLinearGradient(0,0,0,256);a.addColorStop(0,`#${e.getHexString()}`),a.addColorStop(1,`#${t.getHexString()}`),o.fillStyle=a,o.fillRect(0,0,4,256),i.needsUpdate=!0}var ve=(i,e,t)=>{let s=Math.max(0,Math.min(1,(t-i)/(e-i)));return s*s*(3-2*s)},dt=(i,e,t)=>new I(i).lerp(new I(e),Math.max(0,Math.min(1,t))),Yt=new B(-.45,.78,.45).normalize();function so(i,e,t){let s=(i-t)*Math.PI/180,o=e*Math.PI/180;return new B(Math.sin(s)*Math.cos(o),Math.sin(o),-Math.cos(s)*Math.cos(o)).normalize()}function Zo(){try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}var oo=class{constructor(e,t,s,o){this.renderer=e;this.scene=t;this.camera=s;this.groundMaterial=new me({color:13226434,roughness:1});this.castOnly=new Ke({colorWrite:!1,depthWrite:!1,side:At});this.sun=new As(16773596,2.6);this.skyTex=Wo();this.skyPainted="";this.materialsByFloor=new Map;this.registered=new Map;this.sky=null;this.north=0;this.nextFlash=0;this.flash=null;this.envBase=.55;this.haze={fog:0,gloom:0};this.calm=Zo();this.falling=!1;this.composer=null;this.gtao=null;this.bloom=null;this.normalTarget=null;this.sunDir=Yt.clone();this.centre=new B;this.radius=10;this.box=new Ss(new B(-5,0,-5),new B(5,3,5));this.groundY=0;this.night=!1;this.ultra=o,this.texSize=o?1024:512,this.aniso=Math.min(o?16:8,e.capabilities.getMaxAnisotropy()),e.toneMapping=Ye,e.toneMappingExposure=1,e.shadowMap.enabled=!0,e.shadowMap.type=Jt,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;let a=new Us(e);this.envTex=a.fromScene(new lt,.04).texture,a.dispose(),t.environment=this.envTex,this.sun.castShadow=!0;let r=o?4096:2048;this.sun.shadow.mapSize.set(r,r),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=3,t.add(this.sun,this.sun.target),this.groundMaterial.envMapIntensity=.8,this.fx=new mt(o),t.add(this.fx.group),t.background=this.skyTex,o&&this.setupComposer(),this.setNight(!1)}geometry(e){let t=e.surfaces.map(s=>Io(s));return e.toRealisticGeometry(s=>t[s]??!1)}materials(e,t){let s=this.materialsByFloor.get(t);return s||(s=new Map,this.materialsByFloor.set(t,s)),e.surfaces.map(o=>{let a=s.get(o);return a||(a=this.makeMaterial(o,t),s.set(o,a)),a})}makeMaterial(e,t){let s=io(e),o=new me({vertexColors:!0,roughness:s.rough,metalness:s.metal??0});if(s.tex){let r=qs(s.tex,Math.min(1024,this.texSize*(s.res??1)),this.aniso);if(r){let n=1/(s.scale??1);o.map=r.map.clone(),o.map.repeat.set(n,n),r.normal&&(s.relief??0)>0&&(o.normalMap=r.normal.clone(),o.normalMap.repeat.set(n,n),o.normalScale.set(s.relief,-s.relief))}}s.opacity!==void 0&&(o.transparent=!0,o.opacity=s.opacity,o.depthWrite=!1),e==="glass"&&(o.side=At,o.forceSinglePass=!0);let a=Ho.has(e);return a&&(o.defines={VH_SWAY:1}),Go(o,t,a?"vh-std-sway":"vh-std"),o}glassMaterial(e,t){return this.materials(e,t)[0]}attach(e,t,s){if(e.castShadow=s,e.receiveShadow=!0,this.ultra){let o=jo(new Ne,t,"vh-normal");o.blending=W,this.registered.set(e,{mesh:e,normal:o})}this.markShadows()}attachGround(e){if(e.receiveShadow=!0,this.ultra){let t=new Ne;t.blending=W,this.registered.set(e,{mesh:e,normal:t})}}detach(e){let t=this.registered.get(e);t&&(t.normal.dispose(),this.registered.delete(e))}releaseFloor(e){var t,s,o;for(let a of((t=this.materialsByFloor.get(e))==null?void 0:t.values())??[]){let r=a;(s=r.map)==null||s.dispose(),(o=r.normalMap)==null||o.dispose(),a.dispose()}this.materialsByFloor.delete(e)}setNight(e){this.night=e,ro.value=e?.5:.28,this.bloom&&(this.bloom.strength=e?.32:.12),this.applySky()}setSun(e,t,s){this.setSky({...this.sky??Bs(),sun:e===null||t===null?null:{azimuth:e,elevation:t}},s)}setSky(e,t){this.sky=e,this.north=t,this.applySky()}applySky(){let e=this.sky,t=this.night,s=(e==null?void 0:e.cloud)??.2,o=(e==null?void 0:e.rain)??0,a=(e==null?void 0:e.snow)??0,r=(e==null?void 0:e.fog)??0,n=!!(e!=null&&e.storm),l=Math.max(o*.65,n?.6:0,a*.25,r*.2),c=(e==null?void 0:e.sun)??null,h=this.sun.shadow,d=40;if(t){let m=(e==null?void 0:e.moon)??null,f=!!m&&m.elevation>2;this.sunDir.copy(f?so(m.azimuth,m.elevation,this.north):Yt),this.sun.intensity=(f?.38*(.3+.7*m.lit):.2)*(1-.7*s),this.sun.color.setHex(9348863),h.intensity=(f?.65:.3)*(1-.8*s),h.radius=4+6*s,this.envBase=.05+.025*s,ue.uFill.value=1}else{let m=!!c&&c.elevation>-1;d=m?c.elevation:40,this.sunDir.copy(m?so(c.azimuth,Math.max(.5,d),this.north):Yt);let f=ve(-1,3,d)*(.35+.65*ve(2,30,d));this.sun.intensity=3.2*f*(1-.9*s)*(1-.3*l);let u=new I().setRGB(...Ls(2300+3300*ve(1,28,d)));this.sun.color.copy(u.lerp(new I(16054010),s*.8)),h.intensity=Math.max(.06,1-.9*s),h.radius=3+7*s,this.envBase=(.25+.4*s)*(.6+.4*ve(-1,12,d))*(1-.32*l),ue.uFill.value=1+.75*(1-s)}this.scene.environmentIntensity=this.envBase,this.renderer.toneMappingExposure=1,this.paintSky(d,s,l,r),this.ground(e),ue.uWet.value=(e==null?void 0:e.wet)??0,ue.uSnow.value=(e==null?void 0:e.snowCover)??0,this.placeSun()}paintSky(e,t,s,o){let a,r;if(this.night)a=dt(395798,1053726,t),r=dt(1581370,2501430,t);else{a=dt(12177640,11713219,t).lerp(new I(6712952),s),r=dt(15659764,14343906,t).lerp(new I(10791601),s);let c=1-ve(1,12,e);r.lerp(new I(16109476),c*(1-t)*.75),a.lerp(new I(7440819),(1-ve(-1,6,e))*.5)}if(o>0){let c=new I(this.night?2764602:14014940);a.lerp(c,o*.85),r.lerp(c,o)}let n=a.getHexString()+r.getHexString();n!==this.skyPainted&&(this.skyPainted=n,Qo(this.skyTex,a,r)),this.haze={fog:o,gloom:s};let l=this.scene.fog;l?l.color.copy(r):this.scene.fog=new bs(r.getHex(),1,2),this.placeFog()}placeFog(){let e=this.scene.fog;if(!e)return;let t=this.radius,s=this.camera.position.distanceTo(this.centre),{fog:o,gloom:a}=this.haze;e.near=Math.max(.5,s+t*(1.5-1.9*o)*(1-.3*a)),e.far=s+t*(5-3.6*o)*(1-.25*a)}ground(e){let t=new I(this.night?2765606:13029309),s=(e==null?void 0:e.wet)??0,o=(e==null?void 0:e.snowCover)??0;t.multiplyScalar(1-.25*s).lerp(new I(this.night?8226710:15659766),o),this.groundMaterial.color.copy(t),this.groundMaterial.roughness=o>.5?.9:1-.45*s}fit(e,t){this.box.copy(e),this.groundY=t,e.getCenter(this.centre);let s=e.getSize(new B);this.radius=Math.max(6,Math.hypot(s.x,s.z)/2),this.applySky()}placeSun(){let e=this.sunDir,t=this.box.getSize(new B).length();this.sun.target.position.copy(this.centre),this.sun.position.copy(this.centre).addScaledVector(e,t+20),this.sun.target.updateMatrixWorld(),this.sun.updateMatrixWorld();let s=this.sun.shadow.camera;s.position.copy(this.sun.position),s.lookAt(this.centre),s.updateMatrixWorld();let o=s.matrixWorldInverse,a=this.box,r=1/0,n=1/0,l=1/0,c=-1/0,h=-1/0,d=-1/0,m=new B,f=x=>{m.copy(x).applyMatrix4(o),r=Math.min(r,m.x),c=Math.max(c,m.x),n=Math.min(n,m.y),h=Math.max(h,m.y),l=Math.min(l,m.z),d=Math.max(d,m.z)},u=e.y>.01?1/e.y:100;for(let x of[a.min.x,a.max.x])for(let v of[a.min.y,a.max.y])for(let g of[a.min.z,a.max.z]){let b=new B(x,v,g);f(b),f(b.addScaledVector(e,-Math.min(150,Math.max(0,v-this.groundY)*u)))}let p=.6;s.left=r-p,s.right=c+p,s.bottom=n-p,s.top=h+p,s.near=Math.max(.1,-d-2),s.far=-l+2,s.updateProjectionMatrix(),this.markShadows()}setWeatherArea(e){this.fx.setArea(e),this.applyFx()}applyFx(){let e=this.sky;if(!e){this.falling=this.fx.set({rain:0,snow:0,drift:[0,0],night:this.night});return}let t=(e.windFrom+180-this.north)*Math.PI/180,s=[Math.sin(t)*e.wind,-Math.cos(t)*e.wind],o=this.calm?0:Math.min(1,Math.max(0,(e.wind-4)/10))*.05;ue.uSway.value.set(Math.sin(t)*o,-Math.cos(t)*o),this.falling=this.fx.set({rain:e.rain,snow:e.snow,drift:s,night:this.night})}animate(e){if(this.calm)return 0;let t=this.sky,s=!!t&&t.wind>6;if(ue.uTime.value=e/1e3,this.falling){let a=this.renderer.getDrawingBufferSize(new L);this.fx.tick(e/1e3,a.y/(2*Math.tan(this.camera.fov*Math.PI/360)))}let o=!1;if(t!=null&&t.storm){if(this.nextFlash||(this.nextFlash=e+3e3+Math.random()*7e3),!this.flash&&e>=this.nextFlash&&(this.flash={start:e}),this.flash){let a=(e-this.flash.start)/1e3,r=a<.08?a/.08:a<.16?1-(a-.08)/.16:a<.22?.5+(a-.16)/.12:Math.max(0,1-(a-.22)/.25);a>.5?this.endFlash(e+1e4+Math.random()*3e4):(this.scene.environmentIntensity=this.envBase+(this.night?.5:.9)*r,this.scene.backgroundIntensity=1+.6*r,o=!0)}}else(this.flash||this.nextFlash)&&this.endFlash(0);return this.falling||s||o?33:t!=null&&t.storm?Math.max(33,this.nextFlash-e):0}endFlash(e){this.flash=null,this.nextFlash=e,this.scene.environmentIntensity=this.envBase,this.scene.backgroundIntensity=1}markShadows(){this.renderer.shadowMap.needsUpdate=!0}setupComposer(){let e=new q(1,1,{type:Y,samples:4});this.composer=new ot(this.renderer,e),this.composer.addPass(new it(this.scene,this.camera)),this.gtao=new ze(this.scene,this.camera,1,1),this.gtao._renderGBuffer=!1,this.normalTarget=this.gtao.normalRenderTarget,this.gtao.updateGtaoMaterial({radius:.45,distanceExponent:1.6,thickness:1.2,scale:1,samples:12}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,rings:2,samples:12}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao),this.bloom=new pe(new L(1,1),.12,.35,.98),this.composer.addPass(this.bloom),this.composer.addPass(new nt)}setSize(e,t,s){var o;this.composer&&(this.composer.setPixelRatio(s),this.composer.setSize(e,t),(o=this.gtao)==null||o.setSize(Math.max(1,Math.round(e*s/2)),Math.max(1,Math.round(t*s/2))))}render(){if(this.placeFog(),!this.composer){this.renderer.render(this.scene,this.camera);return}this.renderNormals(),this.composer.render()}renderNormals(){let e=[],t=[];this.scene.traverseVisible(c=>{let h=c;if(!h.isMesh)return;let d=this.registered.get(h);d?(t.push([h,h.material]),h.material=d.normal):e.push(c)});for(let c of e)c.visible=!1;let s=this.scene.background,o=this.scene.fog;this.scene.background=null,this.scene.fog=null;let a=this.renderer.shadowMap.enabled;this.renderer.shadowMap.enabled=!1;let r=this.renderer.getRenderTarget(),n=new I;this.renderer.getClearColor(n);let l=this.renderer.getClearAlpha();this.renderer.setRenderTarget(this.normalTarget),this.renderer.setClearColor(7829503,1),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(r),this.renderer.setClearColor(n,l),this.renderer.shadowMap.enabled=a,this.scene.background=s,this.scene.fog=o;for(let c of e)c.visible=!0;for(let[c,h]of t)c.material=h}dispose(){var e,t,s;for(let o of[...this.materialsByFloor.keys()])this.releaseFloor(o);for(let o of this.registered.values())o.normal.dispose();this.registered.clear(),this.scene.remove(this.sun,this.sun.target),this.sun.dispose(),this.envTex.dispose(),this.skyTex.dispose(),this.groundMaterial.dispose(),this.castOnly.dispose(),this.scene.remove(this.fx.group),this.fx.dispose(),this.scene.environment=null,this.scene.fog=null,(e=this.composer)==null||e.dispose(),(t=this.gtao)==null||t.dispose(),(s=this.bloom)==null||s.dispose(),Js(),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=0}};export{oo as RealisticLook,Io as fullColour,so as skyDirection};
