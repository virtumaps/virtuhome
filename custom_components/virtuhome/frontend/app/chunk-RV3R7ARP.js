import{d as Ls}from"./chunk-LHGDC4DT.js";import{$ as us,A as $t,Aa as Ke,Ba as K,Ca as $e,Ea as ys,G as Jt,Ga as ws,H as es,Ha as Ts,I as At,Ia as ke,J as W,Ja as _s,K as ts,Ka as Ps,L as ss,M as is,N as Fe,Na as Q,O as Ue,Oa as G,Oc as Bs,P as Ft,Pa as Cs,Q as Ut,Qa as me,R as os,Ra as Ne,S as rs,Sa as Rs,T as as,U as Ye,Ua as Ds,V as ns,Va as Es,W as ls,Wa as As,X as cs,Y as re,Ya as Fs,Z as kt,aa as hs,ab as Us,ba as Y,ca as fs,cc as de,da as ms,ea as ds,fa as Nt,ga as qe,ha as ps,ja as L,jc as Je,kc as Os,la as B,ma as gs,na as q,nc as et,oa as he,pa as vs,qa as xs,qb as ks,ra as I,sa as bs,ta as Ms,ua as Ss,ub as Lt,va as It,vb as Bt,wa as Ot,wb as Ns,xa as fe,xb as Is,z as Kt}from"./chunk-QHR5XOI4.js";var $={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var H=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},hi=new Es(-1,1,1,-1,0,1),zt=class extends fe{constructor(){super(),this.setAttribute("position",new Ot([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ot([0,2,0,0,2,0],2))}},fi=new zt,J=class{constructor(e){this._mesh=new K(fi,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,hi)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var tt=class extends H{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof G?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Q.clone(e.uniforms),this.material=new G({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new J(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ie=class extends H{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){let i=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,n;this.inverse?(r=0,n=1):(r=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),a.buffers.stencil.setFunc(i.ALWAYS,r,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(i.EQUAL,1,4294967295),a.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),a.buffers.stencil.setLocked(!0)}},st=class extends H{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var it=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let s=e.getSize(new L);this._width=s.width,this._height=s.height,t=new q(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Y}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new tt($),this.copyPass.material.blending=W,this.timer=new Fs}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),s=!1;for(let i=0,a=this.passes.length;i<a;i++){let r=this.passes[i];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){let n=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ie!==void 0&&(r instanceof Ie?s=!0:r instanceof st&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new L);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let s=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(s,i),this.renderTarget2.setSize(s,i);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var ot=class extends H{constructor(e,t,s=null,i=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=i,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new I}render(e,t,s){let i=e.autoClear;e.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=i}};var Oe={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new L},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new he},cameraProjectionMatrixInverse:{value:new he},cameraWorldMatrix:{value:new he},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new B(-1,-1,-1)},sceneBoxMax:{value:new B(1,1,1)}},vertexShader:`

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
		}`};function zs(o=5){let e=Math.floor(o)%2===0?Math.floor(o)+1:Math.floor(o),t=mi(e),s=t.length,i=new Uint8Array(s*4);for(let r=0;r<s;++r){let n=t[r],l=2*Math.PI*n/s,c=new B(Math.cos(l),Math.sin(l),0).normalize();i[r*4]=(c.x*.5+.5)*255,i[r*4+1]=(c.y*.5+.5)*255,i[r*4+2]=127,i[r*4+3]=255}let a=new $e(i,e,e);return a.wrapS=re,a.wrapT=re,a.needsUpdate=!0,a}function mi(o){let e=Math.floor(o)%2===0?Math.floor(o)+1:Math.floor(o),t=e*e,s=Array(t).fill(0),i=Math.floor(e/2),a=e-1;for(let r=1;r<=t;){if(i===-1&&a===e?(a=e-2,i=0):(a===e&&(a=0),i<0&&(i=e-1)),s[i*e+a]!==0){a-=2,i++;continue}else s[i*e+a]=r++;a++,i--}return s}var Be={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Vt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new L},cameraProjectionMatrixInverse:{value:new he},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function Vt(o,e,t){let s=di(o,e,t),i="vec3[SAMPLES](";for(let a=0;a<o;a++){let r=s[a];i+=`vec3(${r.x}, ${r.y}, ${r.z})${a<o-1?",":")"}`}return i}function di(o,e,t){let s=[];for(let i=0;i<o;i++){let a=2*Math.PI*e*i/o,r=Math.pow(i/(o-1),t);s.push(new B(Math.cos(a),Math.sin(a),r))}return s}var at=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let s,i,a,r=.5*(Math.sqrt(3)-1),n=(e+t)*r,l=Math.floor(e+n),c=Math.floor(t+n),f=(3-Math.sqrt(3))/6,p=(l+c)*f,m=l-p,h=c-p,u=e-m,d=t-h,x,v;u>d?(x=1,v=0):(x=0,v=1);let g=u-x+f,b=d-v+f,M=u-1+2*f,S=d-1+2*f,y=l&255,C=c&255,D=this.perm[y+this.perm[C]]%12,R=this.perm[y+x+this.perm[C+v]]%12,A=this.perm[y+1+this.perm[C+1]]%12,F=.5-u*u-d*d;F<0?s=0:(F*=F,s=F*F*this._dot(this.grad3[D],u,d));let k=.5-g*g-b*b;k<0?i=0:(k*=k,i=k*k*this._dot(this.grad3[R],g,b));let Z=.5-M*M-S*S;return Z<0?a=0:(Z*=Z,a=Z*Z*this._dot(this.grad3[A],M,S)),70*(s+i+a)}noise3d(e,t,s){let i,a,r,n,c=(e+t+s)*.3333333333333333,f=Math.floor(e+c),p=Math.floor(t+c),m=Math.floor(s+c),h=1/6,u=(f+p+m)*h,d=f-u,x=p-u,v=m-u,g=e-d,b=t-x,M=s-v,S,y,C,D,R,A;g>=b?b>=M?(S=1,y=0,C=0,D=1,R=1,A=0):g>=M?(S=1,y=0,C=0,D=1,R=0,A=1):(S=0,y=0,C=1,D=1,R=0,A=1):b<M?(S=0,y=0,C=1,D=0,R=1,A=1):g<M?(S=0,y=1,C=0,D=0,R=1,A=1):(S=0,y=1,C=0,D=1,R=1,A=0);let F=g-S+h,k=b-y+h,Z=M-C+h,xe=g-D+2*h,be=b-R+2*h,Me=M-A+2*h,Se=g-1+3*h,ye=b-1+3*h,V=M-1+3*h,ae=f&255,ne=p&255,le=m&255,We=this.perm[ae+this.perm[ne+this.perm[le]]]%12,Qe=this.perm[ae+S+this.perm[ne+y+this.perm[le+C]]]%12,Ze=this.perm[ae+D+this.perm[ne+R+this.perm[le+A]]]%12,Xe=this.perm[ae+1+this.perm[ne+1+this.perm[le+1]]]%12,te=.6-g*g-b*b-M*M;te<0?i=0:(te*=te,i=te*te*this._dot3(this.grad3[We],g,b,M));let se=.6-F*F-k*k-Z*Z;se<0?a=0:(se*=se,a=se*se*this._dot3(this.grad3[Qe],F,k,Z));let ie=.6-xe*xe-be*be-Me*Me;ie<0?r=0:(ie*=ie,r=ie*ie*this._dot3(this.grad3[Ze],xe,be,Me));let oe=.6-Se*Se-ye*ye-V*V;return oe<0?n=0:(oe*=oe,n=oe*oe*this._dot3(this.grad3[Xe],Se,ye,V)),32*(i+a+r+n)}noise4d(e,t,s,i){let a=this.grad4,r=this.simplex,n=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,f,p,m,h,u,d=(e+t+s+i)*l,x=Math.floor(e+d),v=Math.floor(t+d),g=Math.floor(s+d),b=Math.floor(i+d),M=(x+v+g+b)*c,S=x-M,y=v-M,C=g-M,D=b-M,R=e-S,A=t-y,F=s-C,k=i-D,Z=R>A?32:0,xe=R>F?16:0,be=A>F?8:0,Me=R>k?4:0,Se=A>k?2:0,ye=F>k?1:0,V=Z+xe+be+Me+Se+ye,ae=r[V][0]>=3?1:0,ne=r[V][1]>=3?1:0,le=r[V][2]>=3?1:0,We=r[V][3]>=3?1:0,Qe=r[V][0]>=2?1:0,Ze=r[V][1]>=2?1:0,Xe=r[V][2]>=2?1:0,te=r[V][3]>=2?1:0,se=r[V][0]>=1?1:0,ie=r[V][1]>=1?1:0,oe=r[V][2]>=1?1:0,qt=r[V][3]>=1?1:0,pt=R-ae+c,gt=A-ne+c,vt=F-le+c,xt=k-We+c,bt=R-Qe+2*c,Mt=A-Ze+2*c,St=F-Xe+2*c,yt=k-te+2*c,wt=R-se+3*c,Tt=A-ie+3*c,_t=F-oe+3*c,Pt=k-qt+3*c,Ct=R-1+4*c,Rt=A-1+4*c,Dt=F-1+4*c,Et=k-1+4*c,we=x&255,Te=v&255,_e=g&255,Pe=b&255,ai=n[we+n[Te+n[_e+n[Pe]]]]%32,ni=n[we+ae+n[Te+ne+n[_e+le+n[Pe+We]]]]%32,li=n[we+Qe+n[Te+Ze+n[_e+Xe+n[Pe+te]]]]%32,ci=n[we+se+n[Te+ie+n[_e+oe+n[Pe+qt]]]]%32,ui=n[we+1+n[Te+1+n[_e+1+n[Pe+1]]]]%32,Ce=.6-R*R-A*A-F*F-k*k;Ce<0?f=0:(Ce*=Ce,f=Ce*Ce*this._dot4(a[ai],R,A,F,k));let Re=.6-pt*pt-gt*gt-vt*vt-xt*xt;Re<0?p=0:(Re*=Re,p=Re*Re*this._dot4(a[ni],pt,gt,vt,xt));let De=.6-bt*bt-Mt*Mt-St*St-yt*yt;De<0?m=0:(De*=De,m=De*De*this._dot4(a[li],bt,Mt,St,yt));let Ee=.6-wt*wt-Tt*Tt-_t*_t-Pt*Pt;Ee<0?h=0:(Ee*=Ee,h=Ee*Ee*this._dot4(a[ci],wt,Tt,_t,Pt));let Ae=.6-Ct*Ct-Rt*Rt-Dt*Dt-Et*Et;return Ae<0?u=0:(Ae*=Ae,u=Ae*Ae*this._dot4(a[ui],Ct,Rt,Dt,Et)),27*(f+p+m+h+u)}_dot(e,t,s){return e[0]*t+e[1]*s}_dot3(e,t,s,i){return e[0]*t+e[1]*s+e[2]*i}_dot4(e,t,s,i,a){return e[0]*t+e[1]*s+e[2]*i+e[3]*a}};var ze=class o extends H{constructor(e,t,s=512,i=512,a,r,n){super(),this.width=s,this.height=i,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=zs(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new q(this.width,this.height,{type:Y,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new G({defines:Object.assign({},Oe.defines),uniforms:Q.clone(Oe.uniforms),vertexShader:Oe.vertexShader,fragmentShader:Oe.fragmentShader,blending:W,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Ne,this.normalMaterial.blending=W,this.pdMaterial=new G({defines:Object.assign({},Be.defines),uniforms:Q.clone(Be.uniforms),vertexShader:Be.vertexShader,fragmentShader:Be.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new G({defines:Object.assign({},Le.defines),uniforms:Q.clone(Le.uniforms),vertexShader:Le.vertexShader,fragmentShader:Le.fragmentShader,blending:W}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new G({uniforms:Q.clone($.uniforms),vertexShader:$.vertexShader,fragmentShader:$.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Ut,blendDst:Ue,blendEquation:Fe,blendSrcAlpha:Ft,blendDstAlpha:Ue,blendEquationAlpha:Fe}),this.blendMaterial=new G({uniforms:Q.clone(rt.uniforms),vertexShader:rt.vertexShader,fragmentShader:rt.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:is,blendSrc:Ut,blendDst:Ue,blendEquation:Fe,blendSrcAlpha:Ft,blendDstAlpha:Ue,blendEquationAlpha:Fe}),this._fsQuad=new J(null),this._originalClearColor=new I,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),r!==void 0&&this.updateGtaoMaterial(r),n!==void 0&&this.updatePdMaterial(n)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new _s,this.depthTexture.format=ds,this.depthTexture.type=fs,this.normalRenderTarget=new q(this.width,this.height,{minFilter:kt,magFilter:kt,type:Y,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let s=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=s,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=s,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Vt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,s){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case o.OUTPUT.Off:break;case o.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case o.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case o.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case o.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case o.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case o.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=s.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,s,i,a){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,i!=null&&(e.setClearColor(i),e.setClearAlpha(a||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_renderOverride(e,t,s,i,a){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,i=t.clearColor||i,a=t.clearAlpha||a,i!=null&&(e.setClearColor(i),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(s){(s.isPoints||s.isLine||s.isLine2)&&s.visible&&(s.visible=!1,t.push(s))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new at,s=e*e*4,i=new Uint8Array(s);for(let r=0;r<e;r++)for(let n=0;n<e;n++){let l=r,c=n;i[(r*e+n)*4]=(t.noise(l,c)*.5+.5)*255,i[(r*e+n)*4+1]=(t.noise(l+e,c)*.5+.5)*255,i[(r*e+n)*4+2]=(t.noise(l,c+e)*.5+.5)*255,i[(r*e+n)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}let a=new $e(i,e,e,ms,hs);return a.wrapS=re,a.wrapT=re,a.needsUpdate=!0,a}};ze.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Vs={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new I(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var pe=class o extends H{constructor(e,t=1,s,i){super(),this.strength=t,this.radius=s,this.threshold=i,this.resolution=e!==void 0?new L(e.x,e.y):new L(256,256),this.clearColor=new I(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new q(a,r,{type:Y,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){let p=new q(a,r,{type:Y,depthBuffer:!1});p.texture.name="UnrealBloomPass.h"+f,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);let m=new q(a,r,{type:Y,depthBuffer:!1});m.texture.name="UnrealBloomPass.v"+f,m.texture.generateMipmaps=!1,this.renderTargetsVertical.push(m),a=Math.round(a/2),r=Math.round(r/2)}let n=Vs;this.highPassUniforms=Q.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new G({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new L(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Q.clone($.uniforms),this.blendMaterial=new G({uniforms:this.copyUniforms,vertexShader:$.vertexShader,fragmentShader:$.fragmentShader,premultipliedAlpha:!0,blending:ss,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new I,this._oldClearAlpha=1,this._basic=new Ke,this._fsQuad=new J(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(s,i);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,i),this.renderTargetsVertical[a].setSize(s,i),this.separableBlurMaterials[a].uniforms.invSize.value=new L(1/s,1/i),s=Math.round(s/2),i=Math.round(i/2)}render(e,t,s,i,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[l].uniforms.direction.value=o.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=o.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){let t=[],s=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(s*s))/s);let i=[],a=[];for(let r=1;r<e;r+=2){let n=t[r],l=r+1<e?t[r+1]:0,c=n+l;i.push((r*n+(r+1)*l)/c),a.push(c)}return new G({defines:{KERNEL_PAIRS:i.length},uniforms:{colorTexture:{value:null},invSize:{value:new L(.5,.5)},direction:{value:new L(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:i},gaussianWeights:{value:a}},vertexShader:`

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

		}`};var nt=class extends H{constructor(){super(),this.isOutputPass=!0,this.uniforms=Q.clone(Ve.uniforms),this.material=new Cs({name:Ve.name,uniforms:this.uniforms,vertexShader:Ve.vertexShader,fragmentShader:Ve.fragmentShader}),this._fsQuad=new J(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},gs.getTransfer(this._outputColorSpace)===ps&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===os?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===rs?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===as?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ye?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ls?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===cs?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ns&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var lt=class extends Ms{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Ps;e.deleteAttribute("uv");let t=new me({side:es}),s=new me,i=new Ds(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);let a=new K(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let r=new ys(e,s,6),n=new vs;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),r.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),r.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),r.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),r.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),r.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),r.setMatrixAt(5,n.matrix),this.add(r);let l=new K(e,ge(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new K(e,ge(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let f=new K(e,ge(17));f.position.set(14.904,12.198,-1.832),f.scale.set(.15,4.265,6.331),this.add(f);let p=new K(e,ge(43));p.position.set(-.462,8.89,14.52),p.scale.set(4.38,5.441,.088),this.add(p);let m=new K(e,ge(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);let h=new K(e,ge(100));h.position.set(0,20,0),h.scale.set(1,.1,1),this.add(h)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function ge(o){return new Rs({color:0,emissive:16777215,emissiveIntensity:o})}function Gt(o){let e=o>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function U(o,e=0,t=0){let s=Math.imul(o|0,374761393)+Math.imul(e|0,668265263)+Math.imul(t|0,2147483647);return s=Math.imul(s^s>>>13,1274126177),((s^s>>>16)>>>0)/4294967296}var T=o=>o-Math.floor(o),_=(o,e)=>(o%e+e)%e,N=o=>o*o*(3-2*o),E=o=>o<0?0:o>1?1:o,P=(o,e,t)=>o+(e-o)*t,ee=(o,e,t)=>[P(o[0],e[0],t),P(o[1],e[1],t),P(o[2],e[2],t)],z=o=>[(o>>16&255)/255,(o>>8&255)/255,(o&255)/255],O=(o,e)=>E(Math.min(o,1-o)/e);function j(o,e,t){let s=new Float32Array(o*e);for(let i=0;i<s.length;i++)s[i]=t();return(i,a)=>{let r=T(i)*o,n=T(a)*e,l=Math.floor(r),c=Math.floor(n),f=N(r-l),p=N(n-c),m=(l+1)%o,h=(c+1)%e,u=s[c*o+l],d=s[c*o+m],x=s[h*o+l],v=s[h*o+m];return P(P(u,d,f),P(x,v,f),p)}}function w(o,e,t,s){let i=Array.from({length:t},(a,r)=>j(o<<r,e<<r,s));return(a,r)=>{let n=0,l=.5,c=0;for(let f of i)n+=f(a,r)*l,c+=l,l*=.5;return n/c}}function X(o,e,t=.8){let s=new Float32Array(o*o*2);for(let i=0;i<o*o;i++)s[i*2]=.5+(e()-.5)*t,s[i*2+1]=.5+(e()-.5)*t;return(i,a)=>{let r=T(i)*o,n=T(a)*o,l=Math.floor(r),c=Math.floor(n),f=9,p=9,m=0;for(let h=-1;h<=1;h++)for(let u=-1;u<=1;u++){let d=l+u,x=c+h,v=_(x,o)*o+_(d,o),g=d+s[v*2],b=x+s[v*2+1],M=g-r,S=b-n,y=Math.sqrt(M*M+S*S);y<f?(p=f,f=y,m=v):y<p&&(p=y)}return[f,p,m]}}var js=(o,e)=>e?js(e,o%e):o,Ht=(o,e)=>o/js(o,e)*e,ct=(o,e)=>o*Math.max(1,Math.ceil(e/o-1e-9)),Ws=10;function Wt(o){let[e,t]=o.unit,s=Math.max(1800,3*e);switch(o.pattern){case"grid":return ct(Ht(e,t),s);case"stretcher":return ct(Ht(e,2*t),s);case"third":return ct(Ht(e,3*t),s);case"herringbone":case"basketweave":return ct(2*e,1600);case"random":return Ws*e;case"crazy":return 2400;default:return o.material==="tarmac"?2500:1e3}}function Qt(o){let e=o.width+Qs;return e*Math.max(4,Math.round(3600/e))}var Qs=6;function ce(o,e,t,s,i,a,r){let n=a-e,l=r-t;return{id:o,d:Math.min(n,s-n,l,i-l),lx:n-s/2,ly:l-i/2,w:s,h:i}}function pi(o,e,t){let s=Math.round(t/o);return(i,a)=>{let r=Math.floor(i/o),n=Math.floor(a/e);return ce(n*s+r,r*o,n*e,o,e,i,a)}}function Gs(o,e,t,s){let i=Math.round(t/o);return(a,r)=>{let n=Math.floor(r/e),l=_(n,s)*o/s,c=_(a+l,t),f=Math.floor(c/o);return ce(n*i+f,f*o,n*e,o,e,c,r)}}function gi(o,e,t){let s=Math.max(2,Math.round(o/e)),i=Math.round(t/e);return(a,r)=>{let n=Math.floor(a/e),l=Math.floor(r/e),c=_(n+l,2*s);if(c<s){let m=n-c;return ce(_(l,i)*i+_(m,i),m*e,l*e,s*e,e,a,r)}let f=l-(c-s),p=ce(_(f,i)*i+_(n,i)+i*i,n*e,f*e,e,s*e,a,r);return{...p,lx:p.ly,ly:p.lx,w:p.h,h:p.w}}}function vi(o,e,t){let s=Math.max(2,Math.round(o/e)),i=Math.round(t/o);return(a,r)=>{let n=Math.floor(a/o),l=Math.floor(r/o),c=(l*i+n)*s;if((n+l)%2===0){let m=Math.min(s-1,Math.floor((r-l*o)/e));return ce(c+m,n*o,l*o+m*e,o,e,a,r)}let f=Math.min(s-1,Math.floor((a-n*o)/e)),p=ce(c+f,n*o+f*e,l*o,e,o,a,r);return{...p,lx:p.ly,ly:p.lx,w:p.h,h:p.w}}}function xi(o,e){let t=Ws,s=new Int32Array(t*t).fill(-1),i=[],a=[[3,2,3],[2,3,1],[2,2,3],[2,1,2],[1,2,1],[1,1,1.2]],r=a.reduce((l,c)=>l+c[2],0),n=(l,c,f,p)=>{for(let m=0;m<p;m++)for(let h=0;h<f;h++)if(s[_(c+m,t)*t+_(l+h,t)]>=0)return!1;return!0};for(let l=0;l<t;l++)for(let c=0;c<t;c++){if(s[l*t+c]>=0)continue;let f=[1,1];for(let m=0;m<6;m++){let h=e()*r,u=a[0];for(let d of a)if((h-=d[2])<=0){u=d;break}if(n(c,l,u[0],u[1])){f=[u[0],u[1]];break}}let p=i.length;i.push({x:c,y:l,a:f[0],b:f[1]});for(let m=0;m<f[1];m++)for(let h=0;h<f[0];h++)s[_(l+m,t)*t+_(c+h,t)]=p}return(l,c)=>{let f=Math.floor(l/o),p=Math.floor(c/o),m=s[_(p,t)*t+_(f,t)],h=i[m],u=f-_(f-h.x,t),d=p-_(p-h.y,t);return ce(m,u*o,d*o,h.a*o,h.b*o,l,c)}}function bi(o,e){let s=X(6,e,.95),i=o/6;return(a,r)=>{let[n,l,c]=s(a/o,r/o);return{id:c,d:(l-n)/2*i,lx:0,ly:0,w:i,h:i}}}var Mi=()=>({id:0,d:1/0,lx:0,ly:0,w:1,h:1});function jt(o){let e=parseInt(o.slice(1),16)||0;return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function Zs(o,e){let t=Math.floor(o),s=Math.floor(e),i=N(o-t),a=N(e-s);return P(P(U(t,s,31),U(t+1,s,31),i),P(U(t,s+1,31),U(t+1,s+1,31),i),a)}function Hs(o,e,t){let s=0,i=.5,a=0,r=1;for(let n=0;n<t;n++)s+=Zs(o*r+n*17.3,e*r-n*9.1)*i,a+=i,i*=.5,r*=2;return s/a}var Si=[[1,1,1],[1.1,1,.86],[.92,.97,1.04],[1.13,.95,.83],[.95,.99,.93],[1.05,1.02,.9],[.86,.86,.87]],yi=[[1,1,1],[1.16,.92,.84],[.74,.74,.78],[1.08,1.03,.9],[.9,.84,.82],[1.2,1.05,.88]],Ge=[0,0,0,0];function wi(o,e,t){let[s,i]=o.unit;switch(o.pattern){case"grid":return pi(s,i,e);case"stretcher":return Gs(s,i,e,2);case"third":return Gs(s,i,e,3);case"herringbone":return gi(s,i,e);case"basketweave":return vi(s,i,e);case"random":return xi(s,t);case"crazy":return bi(e,t);default:return Mi}}function Ti(o){let e=de[o.material],t=Wt(o),s=jt(o.color),i=jt(o.joint),a=e.joint/2;return{detail:!1,make:r=>{let n=wi(o,t,r),l=_i(o,t,s,r),c=j(Math.max(4,Math.round(t/30)),Math.max(4,Math.round(t/30)),r),f=e.surface==="sett"||o.pattern==="crazy"?j(Math.round(t/25),Math.round(t/25),r):null,p=e.surface==="block"?5:e.surface==="clay"?3:e.surface==="tumbled"?5:e.surface==="sett"?6:e.surface==="smooth"?1:2.5;return(m,h)=>{let u=m*t,d=h*t,x=n(u,d),v=x.d;if(f&&isFinite(v)&&(v+=(f(m,h)-.5)*7),v<a){let R=c(m,h),A=(.82+R*.22)*P(.8,1,E(v/Math.max(1,a)));return[i[0]*A,i[1]*A,i[2]*A,.05+R*.05]}let g=x.id;l({u:m,v:h,x:u,y:d,hit:x,r1:U(g,1,77),r2:U(g,2,77),r3:U(g,3,77)});let[b,M,S,y]=Ge,C=isFinite(v)?N(E((v-a)/p)):1,D=P(.78,1,C);return[b*D,M*D,S*D,P(.15,y,C)]}}}}function _i(o,e,t,s){let i=de[o.material],a=i.vary,r=h=>Math.max(2,Math.round(e/h)),n=w(r(700),r(700),2,s),l=w(r(160),r(160),2,s),c=j(r(12),r(12),s),f=i.surface==="block"||i.surface==="clay"?yi:Si,p=h=>{let u=1+(h.r1-.5)*2*a,d=f[Math.floor(h.r2*f.length)%f.length];return[t[0]*u*P(1,d[0],o.mix),t[1]*u*P(1,d[1],o.mix),t[2]*u*P(1,d[2],o.mix)]},m=(h,u,d)=>{Ge[0]=h[0]*u,Ge[1]=h[1]*u,Ge[2]=h[2]*u,Ge[3]=d};switch(i.surface){case"riven":{let h=o.pattern==="crazy",u=[1.12,.93,.78];return d=>{let x=p(d),v=d.r3*Math.PI,g=Math.cos(v),b=Math.sin(v),M,S,y;if(h)M=n(d.u+d.r1,d.v+d.r2),S=l(d.u*.5+d.r2,d.v*2+d.r1),y=n(d.u+d.r3,d.v+d.r1);else{let F=d.hit.lx*g+d.hit.ly*b+d.r1*5e3,k=-d.hit.lx*b+d.hit.ly*g+d.r2*5e3;M=Hs(F/260,k/260,3),S=Hs(F/480,k/45,2),y=Zs(F/340,k/340)}let C=c(d.u,d.v),D=N(E((S-.55)*4))*(.15+.45*o.mix)+N(E((y-.62)*3))*.4*o.mix,R=[x[0]*P(1,u[0],D),x[1]*P(1,u[1],D),x[2]*P(1,u[2],D)],A=.9+(M-.5)*.24-D*.08+(C-.5)*.07;m(R,A,.4+M*.42+S*.1+C*.06)}}case"smooth":return h=>{let u=p(h),d=.97+(n(h.u+h.r1,h.v)-.5)*.06+(c(h.u,h.v)-.5)*.025;m(u,d,.9+c(h.u,h.v)*.03)};case"textured":{let h=j(r(9),r(9),s);return u=>{let d=p(u),x=c(u.u,u.v),v=h(u.u,u.v),g=v>.8?(v-.8)*2.5:0,b=.95+(l(u.u,u.v)-.5)*.1+(x-.5)*.14-g*.3;m(d,b,.82+x*.12-g*.4)}}case"flamed":{let h=j(r(4),r(4),s),u=j(r(5),r(5),s);return d=>{let x=p(d),v=h(d.u,d.v),g=u(d.u,d.v),b=.96+(l(d.u,d.v)-.5)*.06;v>.7?b*=P(1,.35,E((v-.7)*5)):g>.74&&(b*=P(1,1.3,E((g-.74)*6))),m(x,b,.8+(c(d.u,d.v)-.5)*.2+(v>.7?-.05:0))}}case"honed":{let h=j(r(6),r(6),s);return u=>{let d=p(u),x=h(u.u,u.v),v=.95+(n(u.u+u.r1,u.v+u.r3)-.5)*.16+(l(u.u,u.v)-.5)*.06-(x>.85?(x-.85)*2:0);m(d,v,.86+(l(u.u,u.v)-.5)*.06)}}case"tumbled":{let h=j(r(5),r(9),s);return u=>{let d=p(u),x=l(u.u,u.v),v=Math.sin((u.y/40+x*3+u.r3*7)*Math.PI),g=h(u.u,u.v),b=g>.8?Math.min(1,(g-.8)*6):0,M=.95+v*.045+(x-.5)*.08-b*.22;m(d,M,.82+v*.03-b*.5+(c(u.u,u.v)-.5)*.05)}}case"cleft":return h=>{let u=p(h),d=n(h.u+h.r1,h.v+h.r2)*.7+l(h.u,h.v)*.3,x=Math.floor(d*6)/6,v=N(E(T(d*6)*6)),g=.88+x*.22+(c(h.u,h.v)-.5)*.05-(1-v)*.08;m(u,g,x*.6+v*.08+.3)};case"block":case"clay":{let h=j(r(7),r(7),s),u=i.surface==="clay";return d=>{let x=p(d),v=c(d.u,d.v),g=h(d.u,d.v),b=u?(n(d.u+d.r3,d.v)-.5)*.2:0,M=.94+(v-.5)*.14+b-(u&&g>.78?(g-.78)*1.6:0)+(l(d.u,d.v)-.5)*.06;m(x,M,.8+v*.12)}}case"sett":{let h=j(r(4),r(4),s);return u=>{let d=p(u),x=2*u.hit.lx/u.hit.w,v=2*u.hit.ly/u.hit.h,g=1-.35*(x*x+v*v),b=h(u.u,u.v),M=(.92+(l(u.u,u.v)-.5)*.2+g*.06)*(b>.72?.6:1);m(d,M,g*.7+l(u.u,u.v)*.25)}}case"aggregate":{let h=X(r(6),s,.9);return u=>{let[d,x,v]=h(u.u,u.v),g=U(v,5),b=U(v,9),M=b>.93?1.35:b<.08?.55:.82+g*.3,S=E((x-d)/.3),y=M*P(.55,1,S)*(.92+E(1-d)*.12);m(t,y,S*E(1-d*.7))}}case"gravel":{let h=X(r(18),s,.9);return u=>{let[d,x,v]=h(u.u,u.v),g=U(v,3),b=U(v,11),M=b>.85?[1.08,1,.9]:b<.15?[.9,.93,.97]:[1,1,1],S=E((x-d)/.25),y=(.7+g*.45)*P(.45,1,S)*(.9+E(1-d)*.15);m([t[0]*M[0],t[1]*M[1],t[2]*M[2]],y,S*E(1-d*.8))}}default:{let h=j(r(6),r(6),s);return u=>{let d=h(u.u,u.v),x=.9+(c(u.u,u.v)-.5)*.3+(n(u.u,u.v)-.5)*.08+(d>.8?(d-.8)*1.6:0);m(t,x,c(u.u,u.v))}}}}function Pi(o){let e=Qt(o),t=o.width+Qs,s=Math.round(e/t),i=jt(o.color),a=o.boards==="composite";return{detail:!1,make:r=>{let n=w(4,s*10,3,r),l=w(2,s*3,2,r),c=X(Math.max(4,Math.round(e/600)),r,.9),f=Array.from({length:s},()=>r());return(p,m)=>{let h=m*e,u=Math.floor(h/t),d=h-u*t;if(d>o.width)return[i[0]*.18,i[1]*.17,i[2]*.16,0];let x=f[u]*e;if(Math.min(Math.abs(p*e-x),e-Math.abs(p*e-x))<1.5)return[i[0]*.3,i[1]*.28,i[2]*.26,.05];let g=u*2+(p*e>x?1:0),b=U(g,4,13),M=U(g,8,13),S=N(E(Math.min(d,o.width-d)/4)),y=n(p+M,m),C,D;if(a)C=.97+(b-.5)*.06+(l(p+M,m)-.5)*.12+(y-.5)*.06,D=.85+(y-.5)*.12;else{let A=Math.abs(Math.sin((m*s*6+y*5+M*9)*Math.PI)),[F]=c(p+b*.37,m),k=o.boards==="softwood"&&F<.06&&M>.5?1-F/.06:0;C=.92+(b-.5)*.24+(y-.5)*.28-Math.pow(1-A,6)*.08-k*.3,D=.7+(o.boards==="softwood"?.5+.5*Math.cos(d/7*Math.PI*2):.5)*.2+(y-.5)*.1-k*.1}let R=C*P(.7,1,S);return[i[0]*R,i[1]*R,i[2]*R,D*P(.4,1,S)]}}}}function Xs(o){let e=o.indexOf(":"),t=o.slice(0,e),s=o.slice(e+1);if(t==="pave"){let i=Je(s);return i?Ti(i):null}if(t==="deck"){let i=et(s);return i?Pi(i):null}return null}function He(o,e,t,s,i=.45,a=!1){return{detail:a,make:r=>{let n=w(3,48,3,r),l=j(6,24,r),c=Array.from({length:o},()=>r()),f=t.map(z);return(p,m)=>{let h=Math.floor(m*o),u=T(m*o),d=p*e+c[h%o]*e,x=Math.floor(d),v=T(d),g=U(h,_(x,e),7),b=f[Math.floor(g*f.length)%f.length],M=n(p+g,m),S=l(p+g*.37,m),y=1+(g-.5)*s+(M-.5)*.35-Math.max(0,S-.8)*.8,C=Math.min(O(u,.02),O(v,.004*e)),D=y*P(i,1,C);return[b[0]*D,b[1]*D,b[2]*D,.4+.6*C-(1-M)*.05]}}}}function ut(o,e,t,s,i=.035,a=.06){return{detail:!1,make:r=>{let n=w(16,16,3,r),l=z(e),c=t===null?l:z(t),f=z(s);return(p,m)=>{let h=p*o,u=m*o,d=Math.floor(h),x=Math.floor(u),v=T(h),g=T(u),b=Math.min(O(v,i),O(g,i)),M=(d+x)%2===0?l:c,S=1+(U(_(d,o),_(x,o),3)-.5)*a+(n(p,m)-.5)*.06,y=ee(f,[M[0]*S,M[1]*S,M[2]*S],b);return[y[0],y[1],y[2],b*.9+.1]}}}}function Zt(o,e,t,s,i=!1){return{detail:i,make:a=>{let r=w(64,64,2,a),n=w(4,4,3,a),l=t.map(z),c=z(s);return(f,p)=>{let m=Math.floor(p*e),h=T(p*e),u=f*o+m%2*.5,d=Math.floor(u),x=T(u),v=U(_(d,o),_(m,e),11),g=Math.min(O(x,.045),O(h,.14)),b=l[Math.floor(v*l.length)%l.length],M=.88+v*.18+(r(f,p)-.5)*.3+(n(f,p)-.5)*.15,S=i?[.96+(r(f,p)-.5)*.08,.96,.95]:[b[0]*M,b[1]*M,b[2]*M],y=i?[.86,.86,.85]:[c[0]*(.9+r(f,p)*.2),c[1]*(.9+r(f,p)*.2),c[2]*(.9+r(f,p)*.2)],C=ee(y,S,N(g));return[C[0],C[1],C[2],.25+.75*N(g)-r(f,p)*.08]}}}}function Xt(o,e,t,s){return{detail:s,make:i=>{let a=e?w(48,3,3,i):w(3,48,3,i),r=t.map(z);return(n,l)=>{let c=e?n:l,f=e?l:n,p=Math.floor(c*o),m=T(c*o),h=U(_(p,o),0,5),u=r[Math.floor(h*r.length)%r.length],d=O(m,.06),x=e?1:.82+.18*N(E(m/.25)),v=(.92+h*.12+(a(n,l)-.5)*(s?.12:.3))*x*P(.45,1,d);return[u[0]*v,u[1]*v,u[2]*v,d*(e?1:.6+.4*m)]}}}}function je(o,e,t=0,s=!0){return{detail:s,make:i=>{let a=w(e,e,4,i),r=w(128,128,1,i);return(n,l)=>{let c=a(n,l),f=r(n,l),p=1-o*.5+(c-.5)*o-Math.max(0,f-.7)*t;return[p,p,p,c*.6+f*(t?.8:.2)]}}}}function Ys(o,e,t=0){return{detail:!0,make:s=>{let i=w(8,8,3,s),a=w(4,o,2,s);return(r,n)=>{let l=Math.sin(r*o*Math.PI*2),c=Math.sin(n*o*Math.PI*2),f=(Math.floor(r*o)+Math.floor(n*o))%2===0,p=Math.abs(f?l:c),m=.9+p*e-e*.5+(i(r,n)-.5)*.08+(a(r,n)-.5)*t;return[m,m,m,p]}}}}function ht(o){return{detail:o.detail,make:e=>{let t=w(48,48,2,e),s=w(5,5,3,e),i=(o.tones??[16777215]).map(z),a=o.step??.55;return(r,n)=>{let l=Math.floor(n*o.courses),c=T(n*o.courses),f=r*o.perCourse+(o.stagger&&l%2?.5:0),p=Math.floor(f),m=T(f),h=U(_(p,o.perCourse),_(l,o.courses),21),u=1-c*a,d=P(.6,1,N(E((1-c)/.14)))*P(.82,1,N(E(c/.25)));if(o.rolls){let b=o.wave?Math.sin(m*Math.PI*2)*.5+.5*Math.sin(m*Math.PI):Math.sin(m*Math.PI*o.rolls);u+=b*o.roll*.4,d*=.9+b*o.roll*.25}o.camber&&(u+=Math.sin(m*Math.PI)*o.camber);let x=O(m,o.rolls?.02:.035);d*=P(.55,1,x);let v=i[Math.floor(h*i.length)%i.length],g=d*(1+(h-.5)*o.vary+(t(r,n)-.5)*.1+(s(r,n)-.5)*.08);return[v[0]*g,v[1]*g,v[2]*g,E(u*.8*x+(t(r,n)-.5)*.05)]}}}}var Ci={planks_light:He(13,2,[14467226,13939850,14862500,13610628],.12),planks_oak:He(13,2,[13213810,12555366,13806204,12160092],.14),planks_walnut:He(13,2,[8084033,7229240,8807242,6243120],.16),planks_grey:He(13,2,[12104362,11446174,12762292,10854037],.1),vinyl:He(8,2,[16777215],.05,.75,!0),herringbone:{detail:!1,make:o=>{let e=w(4,64,3,o),t=[12885102,12095328,13609082,11437398].map(z),s=4,i=16;return(a,r)=>{let n=a*i,l=r*i,c=Math.floor(n),f=Math.floor(l),p=T(n),m=T(l),h=_(c+f,2*s),u,d,x,v;h<s?(v=!0,u=(h+p)/s,d=m,x=U(_(c-h,i),_(f,i),1)):(v=!1,u=(h-s+m)/s,d=p,x=U(_(c,i),_(f-(h-s),i),2));let g=t[Math.floor(x*t.length)%t.length],b=v?e(a,r):e(r,a),M=Math.min(O(d,.05),O(u,.012)),S=(.92+x*.14+(b-.5)*.3)*P(.45,1,M);return[g[0]*S,g[1]*S,g[2]*S,.4+.6*M]}}},tiles_light:ut(2,14474456,null,12171184),tiles_dark:ut(2,5921888,null,4605770),tiles_terracotta:ut(4,12086603,null,13483950,.05,.16),checker:ut(4,15658730,2960945,10132118,.02,.03),tiles_metro:{detail:!0,make:o=>{let e=w(8,8,2,o);return(t,s)=>{let i=Math.floor(s*6),a=t*3+i%2*.5,r=Math.min(O(T(a),.03),O(T(s*6),.06)),n=Math.min(O(T(a),.12),O(T(s*6),.24)),l=P(.72,1,N(r))*(.97+(e(t,s)-.5)*.04);return[l,l,l,.2+.5*N(r)+.3*N(n)]}}},marble:{detail:!1,make:o=>{let e=w(4,4,5,o),t=w(8,8,3,o);return(s,i)=>{let a=Math.abs(Math.sin((s*2+i+e(s,i)*2.4)*Math.PI*2)),r=Math.pow(1-E(a/.12),2)*.5+Math.pow(1-E(Math.abs(Math.sin((i*3-s+t(s,i)*3)*Math.PI*2))/.05),2)*.25,n=Math.min(O(T(s*2),.004),O(T(i*2),.004)),l=ee([.93,.925,.91],[.55,.56,.58],r),c=P(.7,1,n);return[l[0]*c,l[1]*c,l[2]*c,n]}}},carpet:{detail:!0,make:o=>{let e=w(96,96,2,o),t=w(6,6,3,o);return(s,i)=>{let a=.86+(e(s,i)-.5)*.22+(t(s,i)-.5)*.08;return[a,a,a,e(s,i)]}}},flagstone:{detail:!1,make:o=>{let e=X(4,o,.7),t=w(24,24,3,o),s=[12169894,11117463,12893616,10393483].map(z);return(i,a)=>{let[r,n,l]=e(i,a),c=E((n-r)/.08),f=s[l%s.length],p=.9+(t(i,a)-.5)*.3+U(l)*.1,m=ee([.45,.43,.4],[f[0]*p,f[1]*p,f[2]*p],N(c));return[m[0],m[1],m[2],N(c)*.8+t(i,a)*.2]}}},concrete:je(.16,6,.25),plaster:je(.05,8,0),render:je(.1,10,.2),pebbledash:{detail:!0,make:o=>{let e=X(40,o,.9),t=w(8,8,2,o);return(s,i)=>{let[a,,r]=e(s,i),n=E(1-a/.5),l=.8+n*.2+(U(r)-.5)*.12+(t(s,i)-.5)*.05;return[l,l,l,n]}}},wp_stripes:{detail:!0,make:o=>{let e=w(4,16,2,o);return(t,s)=>{let i=T(t*8),a=i<.5?1:.86,r=Math.abs(i-.75)<.012?.8:1,n=a*r*(.98+(e(t,s)-.5)*.03);return[n,n,n,.5]}}},wp_damask:{detail:!0,make:()=>(o,e)=>{let t=o*2,s=e*3,i=Math.floor(s),a=T(t+i%2*.5)-.5,r=T(s)-.5,n=Math.hypot(a,r*1.3),l=Math.atan2(r,a),c=.26+.07*Math.cos(l*6)+.03*Math.cos(l*12),f=n<c?n<.08||n>.13&&n<.16?0:1:0,p=Math.abs(Math.sin((a+r)*14)*Math.sin((a-r)*14))>.92&&n>.33?1:0,m=f||p?.82:1;return[m,m,m,f||p?.6:.4]}},wp_geo:{detail:!0,make:()=>(o,e)=>{let t=T(o*4+e*3),s=T(o*4-e*3),i=Math.min(Math.abs(t-.5),Math.abs(s-.5))<.035,a=(Math.floor(o*4+e*3)+Math.floor(o*4-e*3))%2===0,r=i?.7:a?.94:1;return[r,r,r,i?.3:.5]}},wp_leaves:{detail:!0,make:o=>{let t=Array.from({length:25},()=>({x:o(),y:o(),a:o()*Math.PI,s:.7+o()*.5,t:o()}));return(s,i)=>{let a=1,r=.4,n=Math.floor(s*5),l=Math.floor(i*5);for(let c=-1;c<=1;c++)for(let f=-1;f<=1;f++){let p=n+f,m=l+c,h=t[_(m,5)*5+_(p,5)],u=(p+h.x)/5,d=(m+h.y)/5,x=(s-u)*5,v=(i-d)*5,g=Math.cos(h.a),b=Math.sin(h.a),M=(x*g+v*b)/h.s,S=(-x*b+v*g)/h.s;if(M*M/.36+S*S/.05<1){let C=Math.abs(S)<.015?.1:0;a=Math.min(a,(h.t>.5?.72:.8)+C),r=.7}}return[a,a,a,r]}}},panelling:{detail:!0,make:o=>{let e=w(6,6,2,o),t=[.05,.42,.958];return(s,i)=>{let a=T(s*4),r=Math.min(...t.map(h=>Math.abs(i-h))),n=Math.min(a,1-a)*.6,l=r*2.4,c=Math.min(n,l),f=N(E((c-.05)/.025)),p=i<.05?1:0,m=(p?.97:P(1,.93,f))*(.985+(e(s,i)-.5)*.03);return[m,m,m,p?1:1-f*.5]}}},brick_red:Zt(6,18,[10902080,10112824,11822666,9325109,11364946],13222066),brick_buff:Zt(6,18,[13281142,12622697,13874053,12160861],14209218),brick_painted:Zt(6,18,[16777215],16777215,!0),stone_wall:{detail:!1,make:o=>{let e=w(16,16,3,o),t=[0,.16,.3,.47,.6,.77,.88,1],s=[12103064,10984584,12826788,10326655,11576462].map(z);return(i,a)=>{let r=0;for(;r<t.length-2&&a>=t[r+1];)r++;let n=t[r],l=t[r+1],c=(a-n)/(l-n),f=3+r%3,p=i*f+U(r,1)*.7,m=Math.floor(p),h=T(p),u=U(_(m,f),r,4),d=Math.min(O(h,.04),O(c,.1)),x=s[Math.floor(u*s.length)%s.length],v=.88+u*.16+(e(i,a)-.5)*.3,g=ee([.62,.6,.56],[x[0]*v,x[1]*v,x[2]*v],N(d));return[g[0],g[1],g[2],N(d)*(.8+e(i,a)*.2)]}}},boards_v:Xt(10,!0,[11569248,10976853,12293227],!1),boards_h:Xt(8,!1,[16777215],!0),timber_h:Xt(8,!1,[10976081,10252360,11765596,9660996],!1),concrete_panels:{detail:!0,make:o=>{let e=w(6,6,4,o),t=w(96,96,1,o);return(s,i)=>{let a=T(s*2),r=T(i*2),n=Math.min(O(a,.006),O(r,.006)),l=[.2,.8].some(f=>[.2,.8].some(p=>Math.hypot(a-f,r-p)<.012))?.55:1,c=(.9+(e(s,i)-.5)*.18-Math.max(0,t(s,i)-.75)*.2)*P(.6,1,n)*l;return[c,c,c,n*l]}}},grass:{detail:!1,make:o=>{let e=w(4,4,3,o),t=w(128,128,2,o);return(s,i)=>{let a=e(s,i),r=t(s,i),n=ee(z(7313992),z(10272610),a),l=.78+r*.36;return[n[0]*l,n[1]*l*(.95+a*.08),n[2]*l*.9,r]}}},soil:{detail:!1,make:o=>{let e=w(24,24,4,o);return(t,s)=>{let i=.75+e(t,s)*.5;return[.36*i,.27*i,.2*i,e(t,s)]}}},weave:Ys(110,.14),linen:Ys(90,.1,.12),velvet:je(.08,12,0),boucle:{detail:!0,make:o=>{let e=X(70,o,.9);return(t,s)=>{let[i]=e(t,s),a=E(1-i/.6),r=.84+a*.16;return[r,r,r,a]}}},leather:{detail:!0,make:o=>{let e=X(36,o,.9),t=w(6,6,3,o);return(s,i)=>{let[a,r]=e(s,i),n=E((r-a)/.12),l=(.9+(t(s,i)-.5)*.16)*P(.82,1,n);return[l,l,l,n*.6+a*.2]}}},wood_grain:{detail:!0,make:o=>{let e=w(3,40,4,o);return(t,s)=>{let i=e(t,s),a=Math.abs(Math.sin((s*22+i*6)*Math.PI)),r=.86+i*.16-Math.pow(1-a,6)*.08;return[r,r,r,i]}}},wood_grain_v:{detail:!0,make:o=>{let e=w(40,3,4,o);return(t,s)=>{let i=e(t,s),a=Math.abs(Math.sin((t*22+i*6)*Math.PI)),r=.86+i*.16-Math.pow(1-a,6)*.08;return[r,r,r,i]}}},brushed:{detail:!0,make:o=>{let e=w(2,256,2,o);return(t,s)=>{let i=.92+(e(t,s)-.5)*.12;return[i,i,i,e(t,s)]}}},foliage:{detail:!0,make:o=>{let e=X(24,o,.9),t=w(8,8,2,o);return(s,i)=>{let[a,r,n]=e(s,i),l=E((r-a)/.2),c=(.7+U(n)*.4)*P(.6,1,l)+(t(s,i)-.5)*.1;return[c,c,c,l]}}},rug:{detail:!0,make:o=>{let e=w(96,96,1,o);return(t,s)=>{let i=Math.abs(T(t*4)-.5)+Math.abs(T(s*4)-.5),a=Math.abs(T(i*3)-.5)<.12,n=(Math.abs(T(s*4)-.5)>.46?.62:a?.74:i<.18?.86:1)*(.92+e(t,s)*.1);return[n,n,n,e(t,s)]}}},canvas_art:{detail:!0,make:o=>{let e=Array.from({length:9},()=>({x:o(),y:o(),r:.08+o()*.2,t:o()})),t=w(64,64,1,o);return(s,i)=>{let a=.95;for(let r of e)Math.hypot(_(s-r.x+.5,1)-.5,_(i-r.y+.5,1)-.5)<r.r&&(a=Math.min(a,.35+r.t*.55));return[a+(t(s,i)-.5)*.04,a,a,t(s,i)*.3]}}},roof_interlocking:ht({courses:5,perCourse:5,stagger:!1,rolls:2,roll:.25,vary:.08,detail:!0}),roof_plain:ht({courses:12,perCourse:7,stagger:!0,rolls:0,roll:0,vary:.22,detail:!0,camber:.15}),roof_slate:ht({courses:7,perCourse:6,stagger:!0,rolls:0,roll:0,vary:.12,detail:!1,tones:[4935512,4606549,5329756,4869458,5592158],step:.35}),roof_pantile:ht({courses:5,perCourse:6,stagger:!1,rolls:1,roll:.75,vary:.14,detail:!0,wave:!0}),roof_thatch:{detail:!1,make:o=>{let e=w(96,6,3,o),t=w(6,6,3,o);return(s,i)=>{let a=i*6+(t(s,i)-.5)*.5,r=T(a),n=e(s,i*.5+Math.floor(a)*.37),l=(.7+n*.45)*P(.62,1,N(E(r/.3))),c=ee(z(10257487),z(12888946),t(s,i));return[c[0]*l,c[1]*l,c[2]*l,n*.7+(1-r)*.3]}}},roof_seam:{detail:!0,make:o=>{let e=w(4,16,3,o);return(t,s)=>{let i=T(t*3),a=1-O(i,.03),r=.96+(e(t,s)-.5)*.05+a*.1-(1-O(i,.06))*.06;return[r,r,r,.3+a*.7+(e(t,s)-.5)*.05]}}},roof_felt:{detail:!0,make:o=>{let e=w(160,160,1,o),t=w(6,6,3,o);return(s,i)=>{let a=T(i*2),r=P(.8,1,N(E(a/.06))),n=(.9+(e(s,i)-.5)*.35+(t(s,i)-.5)*.08)*r;return[n,n,n,e(s,i)*.5+(a<.03?0:.5)]}}},roof_epdm:{detail:!1,make:o=>{let e=w(5,5,4,o);return(t,s)=>{let i=.95+(e(t,s)-.5)*.12;return[.165*i,.17*i,.18*i,e(t,s)*.3]}}},roof_grp:je(.05,5,.05),roof_lead:{detail:!1,make:o=>{let e=w(6,6,4,o);return(t,s)=>{let i=T(t*2.5),a=Math.max(0,1-Math.abs(i-.5)/.05),r=ee(z(7304571),z(9410203),e(t,s)),n=.92+a*.15;return[r[0]*n,r[1]*n,r[2]*n,.3+a*.7]}}},roof_sedum:{detail:!1,make:o=>{let e=X(28,o,.9),t=w(5,5,3,o),s=[6192956,8033350,9071418,10308154,7113290,11051098].map(z);return(i,a)=>{let[r,n,l]=e(i,a),c=t(i,a),f=s[Math.floor(U(l,Math.floor(c*3),9)*s.length)%s.length],p=N(E((n-r)*3)),m=.65+p*.45;return[f[0]*m,f[1]*m,f[2]*m,p]}}}},ft=new Map;function qs(o,e,t){let s=Ks(o);if(!s)return null;let i=`${o}@${e}`,a=ft.get(i);if(a)return a;let r=s.make(Gt(Ri(o))),n=document.createElement("canvas");n.width=n.height=e;let l=n.getContext("2d"),c=l.createImageData(e,e),f=new Float32Array(e*e);for(let g=0;g<e;g++){let b=1-(g+.5)/e;for(let M=0;M<e;M++){let[S,y,C,D]=r((M+.5)/e,b),R=(g*e+M)*4;c.data[R]=E(S)*255,c.data[R+1]=E(y)*255,c.data[R+2]=E(C)*255,c.data[R+3]=255,f[g*e+M]=D}}l.putImageData(c,0,0);let p=new ke(n);p.colorSpace=s.detail?Nt:qe;let m=document.createElement("canvas");m.width=m.height=e;let h=m.getContext("2d"),u=h.createImageData(e,e),d=e/128;for(let g=0;g<e;g++)for(let b=0;b<e;b++){let M=f[g*e+_(b-1,e)],S=f[g*e+_(b+1,e)],y=f[_(g-1,e)*e+b],C=f[_(g+1,e)*e+b],D=-(S-M)*d,R=-(y-C)*d,A=Math.hypot(D,R,1),F=(g*e+b)*4;u.data[F]=(D/A*.5+.5)*255,u.data[F+1]=(R/A*.5+.5)*255,u.data[F+2]=(1/A*.5+.5)*255,u.data[F+3]=255}h.putImageData(u,0,0);let x=new ke(m);x.colorSpace=Nt;for(let g of[p,x])g.wrapS=g.wrapT=re,g.minFilter=us,g.anisotropy=t;let v={map:p,normal:x};return ft.set(i,v),v}function Ks(o){return Ci[o]??Xs(o)}function $s(o){var e;return((e=Ks(o))==null?void 0:e.detail)??!0}function Ri(o){let e=2166136261;for(let t=0;t<o.length;t++)e=Math.imul(e^o.charCodeAt(t),16777619);return e>>>0}function Js(){var o;for(let e of ft.values())e.map.dispose(),(o=e.normal)==null||o.dispose();ft.clear()}var Di=`
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
}`,Ei=`
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
}`,Ai=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha * vAlpha); }`,Fi=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1.0 - d * 3.2));
}`;function ei(o,e,t){return new G({vertexShader:o,fragmentShader:e,uniforms:t,transparent:!0,depthWrite:!1,blending:ts,fog:!1})}var mt=class{constructor(e){this.group=new xs;this.shared={uTime:{value:0},uTop:{value:10},uHeight:{value:12},uWind:{value:new L}};this.rainU={...this.shared,uFall:{value:8},uLen:{value:.42},uColor:{value:new I(12109010)},uAlpha:{value:.32}};this.snowU={...this.shared,uFall:{value:.9},uSize:{value:.045},uScale:{value:800},uColor:{value:new I(16777215)},uAlpha:{value:.9}};this.area=null;this.key="";this.rainMax=e?9e3:4500,this.snowMax=e?7e3:3500,this.rain=new ws(new fe,ei(Di,Ai,this.rainU)),this.snow=new Ts(new fe,ei(Ei,Fi,this.snowU));for(let t of[this.rain,this.snow])t.frustumCulled=!1,t.renderOrder=4,t.visible=!1;this.group.add(this.rain,this.snow)}setArea(e){this.area=e,this.key=""}set(e){let t=this.area,s=!!t&&(e.rain>.02||e.snow>.02);if(this.rain.visible=!!t&&e.rain>.02,this.snow.visible=!!t&&e.snow>.02,!t||!s)return!1;this.shared.uTop.value=t.top,this.shared.uHeight.value=t.top-t.ground;let i=this.rain.visible?.55:.9;this.shared.uWind.value.set(e.drift[0]*i,e.drift[1]*i),this.rainU.uColor.value.setHex(e.night?8227744:12109010),this.rainU.uAlpha.value=e.night?.32:.45,this.snowU.uColor.value.setHex(e.night?13226982:16777215);let a=[t.minX,t.maxX,t.minZ,t.maxZ,t.top,t.ground,t.rooms.length,Math.round(e.drift[0]),Math.round(e.drift[1])].map(r=>Number(r).toFixed(1)).join("|");return a!==this.key&&(this.key=a,this.build(t)),this.rain.geometry.setDrawRange(0,Math.round(this.rainMax*Math.min(1,e.rain))*2),this.snow.geometry.setDrawRange(0,Math.round(this.snowMax*Math.min(1,e.snow))),!0}tick(e,t){this.shared.uTime.value=e,this.snowU.uScale.value=t}build(e){let t=e.top-e.ground,s=this.shared.uWind.value,i=[this.rainU.uFall.value,this.snowU.uFall.value].map(v=>[s.x*(t/v/2),s.y*(t/v/2)]),a=(v,g,b)=>{for(let M of[-1,0,1]){let S=[v+b[0]*M,g+b[1]*M];if(e.rooms.some(y=>Kt(S,y)||y.some((C,D)=>$t(S,C,y[(D+1)%y.length]).d<.35)))return!1}return!0},r=Math.max(6,.45*Math.max(e.maxX-e.minX,e.maxZ-e.minZ)),n=e.minX-r,l=e.maxX+r,c=e.minZ-r,f=e.maxZ+r,p=12345,m=()=>(p=p*1103515245+12345&2147483647)/2147483647,h=(v,g)=>{let b=[];for(let M=0;b.length<v&&M<v*6;M++){let S=n+m()*(l-n),y=c+m()*(f-c);a(S,y,g)&&b.push([S,y,m(),.6+m()*.8])}return b},u=h(this.rainMax,i[0]),d=new Float32Array(u.length*8);u.forEach((v,g)=>{d.set([v[0],v[1],v[2],0,v[0],v[1],v[2],1],g*8)}),this.replace(this.rain,d);let x=h(this.snowMax,i[1]);this.replace(this.snow,new Float32Array(x.flat()))}replace(e,t){let s=new fe;s.setAttribute("aSeed",new It(t,4)),s.setAttribute("position",new It(new Float32Array(t.length/4*3),3)),e.geometry.dispose(),e.geometry=s}dispose(){for(let e of[this.rain,this.snow])e.geometry.dispose(),e.material.dispose()}};var Ui={wood:{tex:"wood_grain",scale:.9,rough:.5,relief:.25},woodDark:{tex:"wood_grain",scale:.9,rough:.45,relief:.25},white:{rough:.45},dark:{rough:.45},metal:{tex:"brushed",scale:.5,rough:.3,metal:.85},glass:{rough:.04,opacity:.28},plant:{tex:"foliage",scale:.35,rough:.65,relief:.8},leaf:{tex:"foliage",scale:.3,rough:.6,relief:.8},pot:{tex:"plaster",scale:.5,rough:.8,relief:.3},soil:{tex:"carpet",scale:.3,rough:1},accent:{rough:.45},red:{rough:.5},blue:{rough:.5},screen:{rough:.12,metal:.2},ceramic:{rough:.1},rug:{tex:"rug",scale:1.2,rough:.95,relief:.3},mattress:{tex:"weave",scale:.3,rough:.9,relief:.2},bulb:{rough:.55},paper:{rough:.85},canvas:{tex:"canvas_art",scale:1,rough:.85,relief:.2},mirror:{rough:.02,metal:1},water:{rough:.03,opacity:.8},rubber:{rough:.85},pine:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},softwood:{tex:"wood_grain_v",scale:.6,rough:.7,relief:.15},oak:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},walnut:{tex:"wood_grain_v",scale:.6,rough:.45,relief:.2},primed:{rough:.85},blackMetal:{rough:.4,metal:.6},concrete:{tex:"concrete",scale:.8,rough:.9,relief:.25},brick:{tex:"brick_red",scale:1.35,rough:.85,relief:.9}},ki={cap:{rough:.9},slab:{tex:"concrete",scale:3,rough:.9,relief:.2},blind:{tex:"linen",scale:.3,rough:.9,relief:.2},glass:{rough:.04,opacity:.3},pv:{rough:.38,metal:.05}},ti={lawn:{tex:"grass",scale:2,rough:.95,relief:.4},bed:{tex:"soil",scale:1.5,rough:1,relief:.6}};function oi(o){let[e,t]=o.split(":"),s=ks(o);if(s)return{tex:s.tex,scale:s.scale,rough:s.roughness,metal:s.metalness,relief:s.relief};if(e==="role")return Ui[t]??{rough:.6};if(e==="out")return ti[t]??ti.lawn;if(e==="pave"){let i=Je(t);if(i)return{tex:o,scale:Wt(i)/1e3,rough:de[i.material].roughness,relief:de[i.material].relief,res:2}}if(e==="deck"){let i=et(t);if(i)return{tex:o,scale:Qt(i)/1e3,rough:Os[i.boards].roughness,relief:.7,res:2}}return ki[e]??{rough:.6}}function Ni(o){let e=oi(o);return!!e.tex&&!$s(e.tex)}var ri={value:1},ue={uFill:{value:1},uWet:{value:0},uSnow:{value:0},uTime:{value:0},uSway:{value:new L}},Ii=Lt+`
attribute vec3 aLamp;
attribute vec3 aEmis;
uniform float uIndoor;
uniform float uTime;
uniform vec2 uSway;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,Oi=Bt+`
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
`,Li=Ns+`
uniform float uLampGain;
uniform float uFill;
uniform float uWet;
uniform float uSnow;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,Bi=`
float vhFaceUp = smoothstep(0.5, 0.9, vUp);
float vhWet = uWet * vOut * (0.35 + 0.65 * vhFaceUp);
float vhSnow = uSnow * vOut * vhFaceUp;
diffuseColor.rgb *= 1.0 - 0.3 * vhWet;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), vhSnow * 0.94);
`,zi=`
roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.16), vhWet * vhFaceUp * (1.0 - vhSnow));
roughnessFactor = mix(roughnessFactor, 0.85, vhSnow);
`;function Vi(o,e,t){o.onBeforeCompile=s=>{Object.assign(s.uniforms,e,ue,{uLampGain:ri}),s.vertexShader=Ii+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+Oi),s.fragmentShader=Li+s.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+Is+Bi).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+zi).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vEmis;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
reflectedLight.indirectDiffuse *= mix(uFill, 1.0, vOut);
reflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;`)},o.customProgramCacheKey=()=>t}var Gi=new Set(["role:plant","role:leaf"]);function Hi(o,e,t){return o.onBeforeCompile=s=>{Object.assign(s.uniforms,e),s.vertexShader=Lt+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+Bt)},o.customProgramCacheKey=()=>t,o}function ji(){let o=document.createElement("canvas");o.width=4,o.height=256;let e=new ke(o);return e.colorSpace=qe,e}function Wi(o,e,t){let i=o.image.getContext("2d"),a=i.createLinearGradient(0,0,0,256);a.addColorStop(0,`#${e.getHexString()}`),a.addColorStop(1,`#${t.getHexString()}`),i.fillStyle=a,i.fillRect(0,0,4,256),o.needsUpdate=!0}var ve=(o,e,t)=>{let s=Math.max(0,Math.min(1,(t-o)/(e-o)));return s*s*(3-2*s)},dt=(o,e,t)=>new I(o).lerp(new I(e),Math.max(0,Math.min(1,t))),Yt=new B(-.45,.78,.45).normalize();function si(o,e,t){let s=(o-t)*Math.PI/180,i=e*Math.PI/180;return new B(Math.sin(s)*Math.cos(i),Math.sin(i),-Math.cos(s)*Math.cos(i)).normalize()}function Qi(){try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}var ii=class{constructor(e,t,s,i){this.renderer=e;this.scene=t;this.camera=s;this.groundMaterial=new me({color:13226434,roughness:1});this.castOnly=new Ke({colorWrite:!1,depthWrite:!1,side:At});this.sun=new As(16773596,2.6);this.skyTex=ji();this.skyPainted="";this.materialsByFloor=new Map;this.registered=new Map;this.sky=null;this.north=0;this.nextFlash=0;this.flash=null;this.envBase=.55;this.haze={fog:0,gloom:0};this.calm=Qi();this.falling=!1;this.composer=null;this.gtao=null;this.bloom=null;this.normalTarget=null;this.sunDir=Yt.clone();this.centre=new B;this.radius=10;this.box=new Ss(new B(-5,0,-5),new B(5,3,5));this.groundY=0;this.night=!1;this.ultra=i,this.texSize=i?1024:512,this.aniso=Math.min(i?16:8,e.capabilities.getMaxAnisotropy()),e.toneMapping=Ye,e.toneMappingExposure=1,e.shadowMap.enabled=!0,e.shadowMap.type=Jt,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;let a=new Us(e);this.envTex=a.fromScene(new lt,.04).texture,a.dispose(),t.environment=this.envTex,this.sun.castShadow=!0;let r=i?4096:2048;this.sun.shadow.mapSize.set(r,r),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=3,t.add(this.sun,this.sun.target),this.groundMaterial.envMapIntensity=.8,this.fx=new mt(i),t.add(this.fx.group),t.background=this.skyTex,i&&this.setupComposer(),this.setNight(!1)}geometry(e){let t=e.surfaces.map(s=>Ni(s));return e.toRealisticGeometry(s=>t[s]??!1)}materials(e,t){let s=this.materialsByFloor.get(t);return s||(s=new Map,this.materialsByFloor.set(t,s)),e.surfaces.map(i=>{let a=s.get(i);return a||(a=this.makeMaterial(i,t),s.set(i,a)),a})}makeMaterial(e,t){let s=oi(e),i=new me({vertexColors:!0,roughness:s.rough,metalness:s.metal??0});if(s.tex){let r=qs(s.tex,Math.min(1024,this.texSize*(s.res??1)),this.aniso);if(r){let n=1/(s.scale??1);i.map=r.map.clone(),i.map.repeat.set(n,n),r.normal&&(s.relief??0)>0&&(i.normalMap=r.normal.clone(),i.normalMap.repeat.set(n,n),i.normalScale.set(s.relief,-s.relief))}}s.opacity!==void 0&&(i.transparent=!0,i.opacity=s.opacity,i.depthWrite=!1),e==="glass"&&(i.side=At,i.forceSinglePass=!0);let a=Gi.has(e);return a&&(i.defines={VH_SWAY:1}),Vi(i,t,a?"vh-std-sway":"vh-std"),i}glassMaterial(e,t){return this.materials(e,t)[0]}attach(e,t,s){if(e.castShadow=s,e.receiveShadow=!0,this.ultra){let i=Hi(new Ne,t,"vh-normal");i.blending=W,this.registered.set(e,{mesh:e,normal:i})}this.markShadows()}attachGround(e){if(e.receiveShadow=!0,this.ultra){let t=new Ne;t.blending=W,this.registered.set(e,{mesh:e,normal:t})}}detach(e){let t=this.registered.get(e);t&&(t.normal.dispose(),this.registered.delete(e))}releaseFloor(e){var t,s,i;for(let a of((t=this.materialsByFloor.get(e))==null?void 0:t.values())??[]){let r=a;(s=r.map)==null||s.dispose(),(i=r.normalMap)==null||i.dispose(),a.dispose()}this.materialsByFloor.delete(e)}setNight(e){this.night=e,ri.value=e?.5:.28,this.bloom&&(this.bloom.strength=e?.32:.12),this.applySky()}setSun(e,t,s){this.setSky({...this.sky??Bs(),sun:e===null||t===null?null:{azimuth:e,elevation:t}},s)}setSky(e,t){this.sky=e,this.north=t,this.applySky()}applySky(){let e=this.sky,t=this.night,s=(e==null?void 0:e.cloud)??.2,i=(e==null?void 0:e.rain)??0,a=(e==null?void 0:e.snow)??0,r=(e==null?void 0:e.fog)??0,n=!!(e!=null&&e.storm),l=Math.max(i*.65,n?.6:0,a*.25,r*.2),c=(e==null?void 0:e.sun)??null,f=this.sun.shadow,p=40;if(t){let m=(e==null?void 0:e.moon)??null,h=!!m&&m.elevation>2;this.sunDir.copy(h?si(m.azimuth,m.elevation,this.north):Yt),this.sun.intensity=(h?.38*(.3+.7*m.lit):.2)*(1-.7*s),this.sun.color.setHex(9348863),f.intensity=(h?.65:.3)*(1-.8*s),f.radius=4+6*s,this.envBase=.05+.025*s,ue.uFill.value=1}else{let m=!!c&&c.elevation>-1;p=m?c.elevation:40,this.sunDir.copy(m?si(c.azimuth,Math.max(.5,p),this.north):Yt);let h=ve(-1,3,p)*(.35+.65*ve(2,30,p));this.sun.intensity=3.2*h*(1-.9*s)*(1-.3*l);let u=new I().setRGB(...Ls(2300+3300*ve(1,28,p)));this.sun.color.copy(u.lerp(new I(16054010),s*.8)),f.intensity=Math.max(.06,1-.9*s),f.radius=3+7*s,this.envBase=(.25+.4*s)*(.6+.4*ve(-1,12,p))*(1-.32*l),ue.uFill.value=1+.75*(1-s)}this.scene.environmentIntensity=this.envBase,this.renderer.toneMappingExposure=1,this.paintSky(p,s,l,r),this.ground(e),ue.uWet.value=(e==null?void 0:e.wet)??0,ue.uSnow.value=(e==null?void 0:e.snowCover)??0,this.placeSun()}paintSky(e,t,s,i){let a,r;if(this.night)a=dt(395798,1053726,t),r=dt(1581370,2501430,t);else{a=dt(12177640,11713219,t).lerp(new I(6712952),s),r=dt(15659764,14343906,t).lerp(new I(10791601),s);let c=1-ve(1,12,e);r.lerp(new I(16109476),c*(1-t)*.75),a.lerp(new I(7440819),(1-ve(-1,6,e))*.5)}if(i>0){let c=new I(this.night?2764602:14014940);a.lerp(c,i*.85),r.lerp(c,i)}let n=a.getHexString()+r.getHexString();n!==this.skyPainted&&(this.skyPainted=n,Wi(this.skyTex,a,r)),this.haze={fog:i,gloom:s};let l=this.scene.fog;l?l.color.copy(r):this.scene.fog=new bs(r.getHex(),1,2),this.placeFog()}placeFog(){let e=this.scene.fog;if(!e)return;let t=this.radius,s=this.camera.position.distanceTo(this.centre),{fog:i,gloom:a}=this.haze;e.near=Math.max(.5,s+t*(1.5-1.9*i)*(1-.3*a)),e.far=s+t*(5-3.6*i)*(1-.25*a)}ground(e){let t=new I(this.night?2765606:13029309),s=(e==null?void 0:e.wet)??0,i=(e==null?void 0:e.snowCover)??0;t.multiplyScalar(1-.25*s).lerp(new I(this.night?8226710:15659766),i),this.groundMaterial.color.copy(t),this.groundMaterial.roughness=i>.5?.9:1-.45*s}fit(e,t){this.box.copy(e),this.groundY=t,e.getCenter(this.centre);let s=e.getSize(new B);this.radius=Math.max(6,Math.hypot(s.x,s.z)/2),this.applySky()}placeSun(){let e=this.sunDir,t=this.box.getSize(new B).length();this.sun.target.position.copy(this.centre),this.sun.position.copy(this.centre).addScaledVector(e,t+20),this.sun.target.updateMatrixWorld(),this.sun.updateMatrixWorld();let s=this.sun.shadow.camera;s.position.copy(this.sun.position),s.lookAt(this.centre),s.updateMatrixWorld();let i=s.matrixWorldInverse,a=this.box,r=1/0,n=1/0,l=1/0,c=-1/0,f=-1/0,p=-1/0,m=new B,h=x=>{m.copy(x).applyMatrix4(i),r=Math.min(r,m.x),c=Math.max(c,m.x),n=Math.min(n,m.y),f=Math.max(f,m.y),l=Math.min(l,m.z),p=Math.max(p,m.z)},u=e.y>.01?1/e.y:100;for(let x of[a.min.x,a.max.x])for(let v of[a.min.y,a.max.y])for(let g of[a.min.z,a.max.z]){let b=new B(x,v,g);h(b),h(b.addScaledVector(e,-Math.min(150,Math.max(0,v-this.groundY)*u)))}let d=.6;s.left=r-d,s.right=c+d,s.bottom=n-d,s.top=f+d,s.near=Math.max(.1,-p-2),s.far=-l+2,s.updateProjectionMatrix(),this.markShadows()}setWeatherArea(e){this.fx.setArea(e),this.applyFx()}applyFx(){let e=this.sky;if(!e){this.falling=this.fx.set({rain:0,snow:0,drift:[0,0],night:this.night});return}let t=(e.windFrom+180-this.north)*Math.PI/180,s=[Math.sin(t)*e.wind,-Math.cos(t)*e.wind],i=this.calm?0:Math.min(1,Math.max(0,(e.wind-4)/10))*.05;ue.uSway.value.set(Math.sin(t)*i,-Math.cos(t)*i),this.falling=this.fx.set({rain:e.rain,snow:e.snow,drift:s,night:this.night})}animate(e){if(this.calm)return 0;let t=this.sky,s=!!t&&t.wind>6;if(ue.uTime.value=e/1e3,this.falling){let a=this.renderer.getDrawingBufferSize(new L);this.fx.tick(e/1e3,a.y/(2*Math.tan(this.camera.fov*Math.PI/360)))}let i=!1;if(t!=null&&t.storm){if(this.nextFlash||(this.nextFlash=e+3e3+Math.random()*7e3),!this.flash&&e>=this.nextFlash&&(this.flash={start:e}),this.flash){let a=(e-this.flash.start)/1e3,r=a<.08?a/.08:a<.16?1-(a-.08)/.16:a<.22?.5+(a-.16)/.12:Math.max(0,1-(a-.22)/.25);a>.5?this.endFlash(e+1e4+Math.random()*3e4):(this.scene.environmentIntensity=this.envBase+(this.night?.5:.9)*r,this.scene.backgroundIntensity=1+.6*r,i=!0)}}else(this.flash||this.nextFlash)&&this.endFlash(0);return this.falling||s||i?33:t!=null&&t.storm?Math.max(33,this.nextFlash-e):0}endFlash(e){this.flash=null,this.nextFlash=e,this.scene.environmentIntensity=this.envBase,this.scene.backgroundIntensity=1}markShadows(){this.renderer.shadowMap.needsUpdate=!0}setupComposer(){let e=new q(1,1,{type:Y,samples:4});this.composer=new it(this.renderer,e),this.composer.addPass(new ot(this.scene,this.camera)),this.gtao=new ze(this.scene,this.camera,1,1),this.gtao._renderGBuffer=!1,this.normalTarget=this.gtao.normalRenderTarget,this.gtao.updateGtaoMaterial({radius:.45,distanceExponent:1.6,thickness:1.2,scale:1,samples:12}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,rings:2,samples:12}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao),this.bloom=new pe(new L(1,1),.12,.35,.98),this.composer.addPass(this.bloom),this.composer.addPass(new nt)}setSize(e,t,s){var i;this.composer&&(this.composer.setPixelRatio(s),this.composer.setSize(e,t),(i=this.gtao)==null||i.setSize(Math.max(1,Math.round(e*s/2)),Math.max(1,Math.round(t*s/2))))}render(){if(this.placeFog(),!this.composer){this.renderer.render(this.scene,this.camera);return}this.renderNormals(),this.composer.render()}renderNormals(){let e=[],t=[];this.scene.traverseVisible(c=>{let f=c;if(!f.isMesh)return;let p=this.registered.get(f);p?(t.push([f,f.material]),f.material=p.normal):e.push(c)});for(let c of e)c.visible=!1;let s=this.scene.background,i=this.scene.fog;this.scene.background=null,this.scene.fog=null;let a=this.renderer.shadowMap.enabled;this.renderer.shadowMap.enabled=!1;let r=this.renderer.getRenderTarget(),n=new I;this.renderer.getClearColor(n);let l=this.renderer.getClearAlpha();this.renderer.setRenderTarget(this.normalTarget),this.renderer.setClearColor(7829503,1),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(r),this.renderer.setClearColor(n,l),this.renderer.shadowMap.enabled=a,this.scene.background=s,this.scene.fog=i;for(let c of e)c.visible=!0;for(let[c,f]of t)c.material=f}dispose(){var e,t,s;for(let i of[...this.materialsByFloor.keys()])this.releaseFloor(i);for(let i of this.registered.values())i.normal.dispose();this.registered.clear(),this.scene.remove(this.sun,this.sun.target),this.sun.dispose(),this.envTex.dispose(),this.skyTex.dispose(),this.groundMaterial.dispose(),this.castOnly.dispose(),this.scene.remove(this.fx.group),this.fx.dispose(),this.scene.environment=null,this.scene.fog=null,(e=this.composer)==null||e.dispose(),(t=this.gtao)==null||t.dispose(),(s=this.bloom)==null||s.dispose(),Js(),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=0}};export{ii as RealisticLook,Ni as fullColour,si as skyDirection};
