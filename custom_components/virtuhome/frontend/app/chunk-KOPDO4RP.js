import{d as _i}from"./chunk-O4UJJT36.js";import{$ as ei,Aa as ci,C as zt,Ca as hi,D as Vt,Da as ui,E as wt,Ea as Ue,F as W,Fa as fi,G as Gt,Ga as mi,H as Ht,I as Wt,J as Re,Ja as j,K as Ae,Ka as B,L as _t,La as di,M as yt,Ma as he,N as jt,Na as Fe,O as Qt,Oa as pi,P as Zt,Q as je,Qa as gi,R as Xt,Ra as vi,S as Yt,Sa as xi,T as qt,U as ie,Ua as Mi,V as Pt,X as Kt,Xb as yi,Y as $t,Ya as bi,Z,_ as Jt,aa as ti,ba as Ct,ca as Qe,da as ii,fa as F,ha as N,ia as si,ja as X,jb as Si,ka as le,la as ai,ma as oi,na as R,nb as Rt,oa as ri,ob as At,pa as ni,pb as Ti,qa as li,qb as wi,ra as Et,sa as Dt,ta as ce,v as Lt,w as Bt,wa as Ze,xa as Y,ya as Xe}from"./chunk-VNNVZEUA.js";var q={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var V=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},ji=new vi(-1,1,1,-1,0,1),Ut=class extends ce{constructor(){super(),this.setAttribute("position",new Dt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Dt([0,2,0,0,2,0],2))}},Qi=new Ut,K=class{constructor(e){this._mesh=new Y(Qi,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ji)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Ye=class extends V{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof B?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=j.clone(e.uniforms),this.material=new B({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new K(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ne=class extends V{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let s=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let o,n;this.inverse?(o=0,n=1):(o=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),a.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(s.EQUAL,1,4294967295),a.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),a.buffers.stencil.setLocked(!0)}},qe=class extends V{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Ke=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new F);this._width=i.width,this._height=i.height,t=new X(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Z}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ye(q),this.copyPass.material.blending=W,this.timer=new Mi}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let s=0,a=this.passes.length;s<a;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),o.needsSwap){if(i){let n=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ne!==void 0&&(o instanceof Ne?i=!0:o instanceof qe&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new F);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var $e=class extends V{constructor(e,t,i=null,s=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new R}render(e,t,i){let s=e.autoClear;e.autoClear=!1;let a,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}};var ke={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new F},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new le},cameraProjectionMatrixInverse:{value:new le},cameraWorldMatrix:{value:new le},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new N(-1,-1,-1)},sceneBoxMax:{value:new N(1,1,1)}},vertexShader:`

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
		}`},Ie={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

		}`},Je={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function Pi(r=5){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=Zi(e),i=t.length,s=new Uint8Array(i*4);for(let o=0;o<i;++o){let n=t[o],c=2*Math.PI*n/i,l=new N(Math.cos(c),Math.sin(c),0).normalize();s[o*4]=(l.x*.5+.5)*255,s[o*4+1]=(l.y*.5+.5)*255,s[o*4+2]=127,s[o*4+3]=255}let a=new Xe(s,e,e);return a.wrapS=ie,a.wrapT=ie,a.needsUpdate=!0,a}function Zi(r){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=e*e,i=Array(t).fill(0),s=Math.floor(e/2),a=e-1;for(let o=1;o<=t;){if(s===-1&&a===e?(a=e-2,s=0):(a===e&&(a=0),s<0&&(s=e-1)),i[s*e+a]!==0){a-=2,s++;continue}else i[s*e+a]=o++;a++,s--}return i}var Oe={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Ft(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new F},cameraProjectionMatrixInverse:{value:new le},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function Ft(r,e,t){let i=Xi(r,e,t),s="vec3[SAMPLES](";for(let a=0;a<r;a++){let o=i[a];s+=`vec3(${o.x}, ${o.y}, ${o.z})${a<r-1?",":")"}`}return s}function Xi(r,e,t){let i=[];for(let s=0;s<r;s++){let a=2*Math.PI*e*s/r,o=Math.pow(s/(r-1),t);i.push(new N(Math.cos(a),Math.sin(a),o))}return i}var et=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let i,s,a,o=.5*(Math.sqrt(3)-1),n=(e+t)*o,c=Math.floor(e+n),l=Math.floor(t+n),h=(3-Math.sqrt(3))/6,u=(c+l)*h,f=c-u,m=l-u,g=e-f,M=t-m,b,p;g>M?(b=1,p=0):(b=0,p=1);let d=g-b+h,v=M-p+h,x=g-1+2*h,S=M-1+2*h,T=c&255,y=l&255,U=this.perm[T+this.perm[y]]%12,P=this.perm[T+b+this.perm[y+p]]%12,E=this.perm[T+1+this.perm[y+1]]%12,D=.5-g*g-M*M;D<0?i=0:(D*=D,i=D*D*this._dot(this.grad3[U],g,M));let k=.5-d*d-v*v;k<0?s=0:(k*=k,s=k*k*this._dot(this.grad3[P],d,v));let Q=.5-x*x-S*S;return Q<0?a=0:(Q*=Q,a=Q*Q*this._dot(this.grad3[E],x,S)),70*(i+s+a)}noise3d(e,t,i){let s,a,o,n,l=(e+t+i)*.3333333333333333,h=Math.floor(e+l),u=Math.floor(t+l),f=Math.floor(i+l),m=1/6,g=(h+u+f)*m,M=h-g,b=u-g,p=f-g,d=e-M,v=t-b,x=i-p,S,T,y,U,P,E;d>=v?v>=x?(S=1,T=0,y=0,U=1,P=1,E=0):d>=x?(S=1,T=0,y=0,U=1,P=0,E=1):(S=0,T=0,y=1,U=1,P=0,E=1):v<x?(S=0,T=0,y=1,U=0,P=1,E=1):d<x?(S=0,T=1,y=0,U=0,P=1,E=1):(S=0,T=1,y=0,U=1,P=1,E=0);let D=d-S+m,k=v-T+m,Q=x-y+m,ge=d-U+2*m,ve=v-P+2*m,xe=x-E+2*m,Me=d-1+3*m,be=v-1+3*m,L=x-1+3*m,ae=h&255,oe=u&255,re=f&255,Ve=this.perm[ae+this.perm[oe+this.perm[re]]]%12,Ge=this.perm[ae+S+this.perm[oe+T+this.perm[re+y]]]%12,He=this.perm[ae+U+this.perm[oe+P+this.perm[re+E]]]%12,We=this.perm[ae+1+this.perm[oe+1+this.perm[re+1]]]%12,$=.6-d*d-v*v-x*x;$<0?s=0:($*=$,s=$*$*this._dot3(this.grad3[Ve],d,v,x));let J=.6-D*D-k*k-Q*Q;J<0?a=0:(J*=J,a=J*J*this._dot3(this.grad3[Ge],D,k,Q));let ee=.6-ge*ge-ve*ve-xe*xe;ee<0?o=0:(ee*=ee,o=ee*ee*this._dot3(this.grad3[He],ge,ve,xe));let te=.6-Me*Me-be*be-L*L;return te<0?n=0:(te*=te,n=te*te*this._dot3(this.grad3[We],Me,be,L)),32*(s+a+o+n)}noise4d(e,t,i,s){let a=this.grad4,o=this.simplex,n=this.perm,c=(Math.sqrt(5)-1)/4,l=(5-Math.sqrt(5))/20,h,u,f,m,g,M=(e+t+i+s)*c,b=Math.floor(e+M),p=Math.floor(t+M),d=Math.floor(i+M),v=Math.floor(s+M),x=(b+p+d+v)*l,S=b-x,T=p-x,y=d-x,U=v-x,P=e-S,E=t-T,D=i-y,k=s-U,Q=P>E?32:0,ge=P>D?16:0,ve=E>D?8:0,xe=P>k?4:0,Me=E>k?2:0,be=D>k?1:0,L=Q+ge+ve+xe+Me+be,ae=o[L][0]>=3?1:0,oe=o[L][1]>=3?1:0,re=o[L][2]>=3?1:0,Ve=o[L][3]>=3?1:0,Ge=o[L][0]>=2?1:0,He=o[L][1]>=2?1:0,We=o[L][2]>=2?1:0,$=o[L][3]>=2?1:0,J=o[L][0]>=1?1:0,ee=o[L][1]>=1?1:0,te=o[L][2]>=1?1:0,Ot=o[L][3]>=1?1:0,nt=P-ae+l,lt=E-oe+l,ct=D-re+l,ht=k-Ve+l,ut=P-Ge+2*l,ft=E-He+2*l,mt=D-We+2*l,dt=k-$+2*l,pt=P-J+3*l,gt=E-ee+3*l,vt=D-te+3*l,xt=k-Ot+3*l,Mt=P-1+4*l,bt=E-1+4*l,St=D-1+4*l,Tt=k-1+4*l,Se=b&255,Te=p&255,we=d&255,_e=v&255,zi=n[Se+n[Te+n[we+n[_e]]]]%32,Vi=n[Se+ae+n[Te+oe+n[we+re+n[_e+Ve]]]]%32,Gi=n[Se+Ge+n[Te+He+n[we+We+n[_e+$]]]]%32,Hi=n[Se+J+n[Te+ee+n[we+te+n[_e+Ot]]]]%32,Wi=n[Se+1+n[Te+1+n[we+1+n[_e+1]]]]%32,ye=.6-P*P-E*E-D*D-k*k;ye<0?h=0:(ye*=ye,h=ye*ye*this._dot4(a[zi],P,E,D,k));let Pe=.6-nt*nt-lt*lt-ct*ct-ht*ht;Pe<0?u=0:(Pe*=Pe,u=Pe*Pe*this._dot4(a[Vi],nt,lt,ct,ht));let Ce=.6-ut*ut-ft*ft-mt*mt-dt*dt;Ce<0?f=0:(Ce*=Ce,f=Ce*Ce*this._dot4(a[Gi],ut,ft,mt,dt));let Ee=.6-pt*pt-gt*gt-vt*vt-xt*xt;Ee<0?m=0:(Ee*=Ee,m=Ee*Ee*this._dot4(a[Hi],pt,gt,vt,xt));let De=.6-Mt*Mt-bt*bt-St*St-Tt*Tt;return De<0?g=0:(De*=De,g=De*De*this._dot4(a[Wi],Mt,bt,St,Tt)),27*(h+u+f+m+g)}_dot(e,t,i){return e[0]*t+e[1]*i}_dot3(e,t,i,s){return e[0]*t+e[1]*i+e[2]*s}_dot4(e,t,i,s,a){return e[0]*t+e[1]*i+e[2]*s+e[3]*a}};var Le=class r extends V{constructor(e,t,i=512,s=512,a,o,n){super(),this.width=i,this.height=s,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Pi(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new X(this.width,this.height,{type:Z,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new B({defines:Object.assign({},ke.defines),uniforms:j.clone(ke.uniforms),vertexShader:ke.vertexShader,fragmentShader:ke.fragmentShader,blending:W,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Fe,this.normalMaterial.blending=W,this.pdMaterial=new B({defines:Object.assign({},Oe.defines),uniforms:j.clone(Oe.uniforms),vertexShader:Oe.vertexShader,fragmentShader:Oe.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new B({defines:Object.assign({},Ie.defines),uniforms:j.clone(Ie.uniforms),vertexShader:Ie.vertexShader,fragmentShader:Ie.fragmentShader,blending:W}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new B({uniforms:j.clone(q.uniforms),vertexShader:q.vertexShader,fragmentShader:q.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:yt,blendDst:Ae,blendEquation:Re,blendSrcAlpha:_t,blendDstAlpha:Ae,blendEquationAlpha:Re}),this.blendMaterial=new B({uniforms:j.clone(Je.uniforms),vertexShader:Je.vertexShader,fragmentShader:Je.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Wt,blendSrc:yt,blendDst:Ae,blendEquation:Re,blendSrcAlpha:_t,blendDstAlpha:Ae,blendEquationAlpha:Re}),this._fsQuad=new K(null),this._originalClearColor=new R,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),o!==void 0&&this.updateGtaoMaterial(o),n!==void 0&&this.updatePdMaterial(n)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new fi,this.depthTexture.format=ti,this.depthTexture.type=Jt,this.normalRenderTarget=new X(this.width,this.height,{minFilter:Pt,magFilter:Pt,type:Z,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let i=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Ft(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,i){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case r.OUTPUT.Off:break;case r.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,i,s,a){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_renderOverride(e,t,i,s,a){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s=t.clearColor||s,a=t.clearAlpha||a,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(i){(i.isPoints||i.isLine||i.isLine2)&&i.visible&&(i.visible=!1,t.push(i))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new et,i=e*e*4,s=new Uint8Array(i);for(let o=0;o<e;o++)for(let n=0;n<e;n++){let c=o,l=n;s[(o*e+n)*4]=(t.noise(c,l)*.5+.5)*255,s[(o*e+n)*4+1]=(t.noise(c+e,l)*.5+.5)*255,s[(o*e+n)*4+2]=(t.noise(c,l+e)*.5+.5)*255,s[(o*e+n)*4+3]=(t.noise(c+e,l+e)*.5+.5)*255}let a=new Xe(s,e,e,ei,$t);return a.wrapS=ie,a.wrapT=ie,a.needsUpdate=!0,a}};Le.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Ci={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new R(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var ue=class r extends V{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new F(e.x,e.y):new F(256,256),this.clearColor=new R(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new X(a,o,{type:Z,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new X(a,o,{type:Z,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let f=new X(a,o,{type:Z,depthBuffer:!1});f.texture.name="UnrealBloomPass.v"+h,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),a=Math.round(a/2),o=Math.round(o/2)}let n=Ci;this.highPassUniforms=j.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new B({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];let c=[6,10,14,18,22];a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(c[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new F(1/a,1/o),a=Math.round(a/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=j.clone(q.uniforms),this.blendMaterial=new B({uniforms:this.copyUniforms,vertexShader:q.vertexShader,fragmentShader:q.fragmentShader,premultipliedAlpha:!0,blending:Ht,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new R,this._oldClearAlpha=1,this._basic=new Ze,this._fsQuad=new K(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(i,s),this.renderTargetsVertical[a].setSize(i,s),this.separableBlurMaterials[a].uniforms.invSize.value=new F(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let c=0;c<this.nMips;c++)this._fsQuad.material=this.separableBlurMaterials[c],this.separableBlurMaterials[c].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[c].uniforms.direction.value=r.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[c]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[c].uniforms.colorTexture.value=this.renderTargetsHorizontal[c].texture,this.separableBlurMaterials[c].uniforms.direction.value=r.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[c]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[c];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let o=0;o<e;o++)t.push(.39894*Math.exp(-.5*o*o/(i*i))/i);let s=[],a=[];for(let o=1;o<e;o+=2){let n=t[o],c=o+1<e?t[o+1]:0,l=n+c;s.push((o*n+(o+1)*c)/l),a.push(l)}return new B({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new F(.5,.5)},direction:{value:new F(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new B({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};ue.BlurDirectionX=new F(1,0);ue.BlurDirectionY=new F(0,1);var Be={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var tt=class extends V{constructor(){super(),this.isOutputPass=!0,this.uniforms=j.clone(Be.uniforms),this.material=new di({name:Be.name,uniforms:this.uniforms,vertexShader:Be.vertexShader,fragmentShader:Be.fragmentShader}),this._fsQuad=new K(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},si.getTransfer(this._outputColorSpace)===ii&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===jt?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Qt?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Zt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===je?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Yt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===qt?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Xt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var it=class extends ni{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new mi;e.deleteAttribute("uv");let t=new he({side:Vt}),i=new he,s=new gi(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let a=new Y(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let o=new ci(e,i,6),n=new ai;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),o.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),o.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),o.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),o.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),o.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),o.setMatrixAt(5,n.matrix),this.add(o);let c=new Y(e,fe(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new Y(e,fe(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let h=new Y(e,fe(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Y(e,fe(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let f=new Y(e,fe(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let m=new Y(e,fe(100));m.position.set(0,20,0),m.scale.set(1,.1,1),this.add(m)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function fe(r){return new pi({color:0,emissive:16777215,emissiveIntensity:r})}function Yi(r){let e=r>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function G(r,e=0,t=0){let i=Math.imul(r|0,374761393)+Math.imul(e|0,668265263)+Math.imul(t|0,2147483647);return i=Math.imul(i^i>>>13,1274126177),((i^i>>>16)>>>0)/4294967296}var _=r=>r-Math.floor(r),C=(r,e)=>(r%e+e)%e,O=r=>r*r*(3-2*r),z=r=>r<0?0:r>1?1:r,I=(r,e,t)=>r+(e-r)*t,se=(r,e,t)=>[I(r[0],e[0],t),I(r[1],e[1],t),I(r[2],e[2],t)],H=r=>[(r>>16&255)/255,(r>>8&255)/255,(r&255)/255],A=(r,e)=>z(Math.min(r,1-r)/e);function Di(r,e,t){let i=new Float32Array(r*e);for(let s=0;s<i.length;s++)i[s]=t();return(s,a)=>{let o=_(s)*r,n=_(a)*e,c=Math.floor(o),l=Math.floor(n),h=O(o-c),u=O(n-l),f=(c+1)%r,m=(l+1)%e,g=i[l*r+c],M=i[l*r+f],b=i[m*r+c],p=i[m*r+f];return I(I(g,M,h),I(b,p,h),u)}}function w(r,e,t,i){let s=Array.from({length:t},(a,o)=>Di(r<<o,e<<o,i));return(a,o)=>{let n=0,c=.5,l=0;for(let h of s)n+=h(a,o)*c,l+=c,c*=.5;return n/l}}function me(r,e,t=.8){let i=new Float32Array(r*r*2);for(let s=0;s<r*r;s++)i[s*2]=.5+(e()-.5)*t,i[s*2+1]=.5+(e()-.5)*t;return(s,a)=>{let o=_(s)*r,n=_(a)*r,c=Math.floor(o),l=Math.floor(n),h=9,u=9,f=0;for(let m=-1;m<=1;m++)for(let g=-1;g<=1;g++){let M=c+g,b=l+m,p=C(b,r)*r+C(M,r),d=M+i[p*2],v=b+i[p*2+1],x=Math.hypot(d-o,v-n);x<h?(u=h,h=x,f=p):x<u&&(u=x)}return[h,u,f]}}function de(r,e,t,i,s=.45,a=!1){return{detail:a,make:o=>{let n=w(3,48,3,o),c=Di(6,24,o),l=Array.from({length:r},()=>o()),h=t.map(H);return(u,f)=>{let m=Math.floor(f*r),g=_(f*r),M=u*e+l[m%r]*e,b=Math.floor(M),p=_(M),d=G(m,C(b,e),7),v=h[Math.floor(d*h.length)%h.length],x=n(u+d,f),S=c(u+d*.37,f),T=1+(d-.5)*i+(x-.5)*.35-Math.max(0,S-.8)*.8,y=Math.min(A(g,.02),A(p,.004*e)),U=T*I(s,1,y);return[v[0]*U,v[1]*U,v[2]*U,.4+.6*y-(1-x)*.05]}}}}function ze(r,e,t,i,s=.035,a=.06){return{detail:!1,make:o=>{let n=w(16,16,3,o),c=H(e),l=t===null?c:H(t),h=H(i);return(u,f)=>{let m=u*r,g=f*r,M=Math.floor(m),b=Math.floor(g),p=_(m),d=_(g),v=Math.min(A(p,s),A(d,s)),x=(M+b)%2===0?c:l,S=1+(G(C(M,r),C(b,r),3)-.5)*a+(n(u,f)-.5)*.06,T=se(h,[x[0]*S,x[1]*S,x[2]*S],v);return[T[0],T[1],T[2],v*.9+.1]}}}}function Nt(r,e,t,i,s=!1){return{detail:s,make:a=>{let o=w(64,64,2,a),n=w(4,4,3,a),c=t.map(H),l=H(i);return(h,u)=>{let f=Math.floor(u*e),m=_(u*e),g=h*r+f%2*.5,M=Math.floor(g),b=_(g),p=G(C(M,r),C(f,e),11),d=Math.min(A(b,.045),A(m,.14)),v=c[Math.floor(p*c.length)%c.length],x=.88+p*.18+(o(h,u)-.5)*.3+(n(h,u)-.5)*.15,S=s?[.96+(o(h,u)-.5)*.08,.96,.95]:[v[0]*x,v[1]*x,v[2]*x],T=s?[.86,.86,.85]:[l[0]*(.9+o(h,u)*.2),l[1]*(.9+o(h,u)*.2),l[2]*(.9+o(h,u)*.2)],y=se(T,S,O(d));return[y[0],y[1],y[2],.25+.75*O(d)-o(h,u)*.08]}}}}function kt(r,e,t,i){return{detail:i,make:s=>{let a=e?w(48,3,3,s):w(3,48,3,s),o=t.map(H);return(n,c)=>{let l=e?n:c,h=e?c:n,u=Math.floor(l*r),f=_(l*r),m=G(C(u,r),0,5),g=o[Math.floor(m*o.length)%o.length],M=A(f,.06),b=e?1:.82+.18*O(z(f/.25)),p=(.92+m*.12+(a(n,c)-.5)*(i?.12:.3))*b*I(.45,1,M);return[g[0]*p,g[1]*p,g[2]*p,M*(e?1:.6+.4*f)]}}}}function st(r,e,t=0,i=!0){return{detail:i,make:s=>{let a=w(e,e,4,s),o=w(128,128,1,s);return(n,c)=>{let l=a(n,c),h=o(n,c),u=1-r*.5+(l-.5)*r-Math.max(0,h-.7)*t;return[u,u,u,l*.6+h*(t?.8:.2)]}}}}function Ei(r,e,t=0){return{detail:!0,make:i=>{let s=w(8,8,3,i),a=w(4,r,2,i);return(o,n)=>{let c=Math.sin(o*r*Math.PI*2),l=Math.sin(n*r*Math.PI*2),h=(Math.floor(o*r)+Math.floor(n*r))%2===0,u=Math.abs(h?c:l),f=.9+u*e-e*.5+(s(o,n)-.5)*.08+(a(o,n)-.5)*t;return[f,f,f,u]}}}}var Ri={planks_light:de(13,2,[14467226,13939850,14862500,13610628],.12),planks_oak:de(13,2,[13213810,12555366,13806204,12160092],.14),planks_walnut:de(13,2,[8084033,7229240,8807242,6243120],.16),planks_grey:de(13,2,[12104362,11446174,12762292,10854037],.1),vinyl:de(8,2,[16777215],.05,.75,!0),herringbone:{detail:!1,make:r=>{let e=w(4,64,3,r),t=[12885102,12095328,13609082,11437398].map(H),i=4,s=16;return(a,o)=>{let n=a*s,c=o*s,l=Math.floor(n),h=Math.floor(c),u=_(n),f=_(c),m=C(l+h,2*i),g,M,b,p;m<i?(p=!0,g=(m+u)/i,M=f,b=G(C(l-m,s),C(h,s),1)):(p=!1,g=(m-i+f)/i,M=u,b=G(C(l,s),C(h-(m-i),s),2));let d=t[Math.floor(b*t.length)%t.length],v=p?e(a,o):e(o,a),x=Math.min(A(M,.05),A(g,.012)),S=(.92+b*.14+(v-.5)*.3)*I(.45,1,x);return[d[0]*S,d[1]*S,d[2]*S,.4+.6*x]}}},tiles_light:ze(2,14474456,null,12171184),tiles_dark:ze(2,5921888,null,4605770),tiles_terracotta:ze(4,12086603,null,13483950,.05,.16),checker:ze(4,15658730,2960945,10132118,.02,.03),tiles_metro:{detail:!0,make:r=>{let e=w(8,8,2,r);return(t,i)=>{let s=Math.floor(i*6),a=t*3+s%2*.5,o=Math.min(A(_(a),.03),A(_(i*6),.06)),n=Math.min(A(_(a),.12),A(_(i*6),.24)),c=I(.72,1,O(o))*(.97+(e(t,i)-.5)*.04);return[c,c,c,.2+.5*O(o)+.3*O(n)]}}},marble:{detail:!1,make:r=>{let e=w(4,4,5,r),t=w(8,8,3,r);return(i,s)=>{let a=Math.abs(Math.sin((i*2+s+e(i,s)*2.4)*Math.PI*2)),o=Math.pow(1-z(a/.12),2)*.5+Math.pow(1-z(Math.abs(Math.sin((s*3-i+t(i,s)*3)*Math.PI*2))/.05),2)*.25,n=Math.min(A(_(i*2),.004),A(_(s*2),.004)),c=se([.93,.925,.91],[.55,.56,.58],o),l=I(.7,1,n);return[c[0]*l,c[1]*l,c[2]*l,n]}}},carpet:{detail:!0,make:r=>{let e=w(96,96,2,r),t=w(6,6,3,r);return(i,s)=>{let a=.86+(e(i,s)-.5)*.22+(t(i,s)-.5)*.08;return[a,a,a,e(i,s)]}}},flagstone:{detail:!1,make:r=>{let e=me(4,r,.7),t=w(24,24,3,r),i=[12169894,11117463,12893616,10393483].map(H);return(s,a)=>{let[o,n,c]=e(s,a),l=z((n-o)/.08),h=i[c%i.length],u=.9+(t(s,a)-.5)*.3+G(c)*.1,f=se([.45,.43,.4],[h[0]*u,h[1]*u,h[2]*u],O(l));return[f[0],f[1],f[2],O(l)*.8+t(s,a)*.2]}}},concrete:st(.16,6,.25),plaster:st(.05,8,0),render:st(.1,10,.2),pebbledash:{detail:!0,make:r=>{let e=me(40,r,.9),t=w(8,8,2,r);return(i,s)=>{let[a,,o]=e(i,s),n=z(1-a/.5),c=.8+n*.2+(G(o)-.5)*.12+(t(i,s)-.5)*.05;return[c,c,c,n]}}},wp_stripes:{detail:!0,make:r=>{let e=w(4,16,2,r);return(t,i)=>{let s=_(t*8),a=s<.5?1:.86,o=Math.abs(s-.75)<.012?.8:1,n=a*o*(.98+(e(t,i)-.5)*.03);return[n,n,n,.5]}}},wp_damask:{detail:!0,make:()=>(r,e)=>{let t=r*2,i=e*3,s=Math.floor(i),a=_(t+s%2*.5)-.5,o=_(i)-.5,n=Math.hypot(a,o*1.3),c=Math.atan2(o,a),l=.26+.07*Math.cos(c*6)+.03*Math.cos(c*12),h=n<l?n<.08||n>.13&&n<.16?0:1:0,u=Math.abs(Math.sin((a+o)*14)*Math.sin((a-o)*14))>.92&&n>.33?1:0,f=h||u?.82:1;return[f,f,f,h||u?.6:.4]}},wp_geo:{detail:!0,make:()=>(r,e)=>{let t=_(r*4+e*3),i=_(r*4-e*3),s=Math.min(Math.abs(t-.5),Math.abs(i-.5))<.035,a=(Math.floor(r*4+e*3)+Math.floor(r*4-e*3))%2===0,o=s?.7:a?.94:1;return[o,o,o,s?.3:.5]}},wp_leaves:{detail:!0,make:r=>{let t=Array.from({length:25},()=>({x:r(),y:r(),a:r()*Math.PI,s:.7+r()*.5,t:r()}));return(i,s)=>{let a=1,o=.4,n=Math.floor(i*5),c=Math.floor(s*5);for(let l=-1;l<=1;l++)for(let h=-1;h<=1;h++){let u=n+h,f=c+l,m=t[C(f,5)*5+C(u,5)],g=(u+m.x)/5,M=(f+m.y)/5,b=(i-g)*5,p=(s-M)*5,d=Math.cos(m.a),v=Math.sin(m.a),x=(b*d+p*v)/m.s,S=(-b*v+p*d)/m.s;if(x*x/.36+S*S/.05<1){let y=Math.abs(S)<.015?.1:0;a=Math.min(a,(m.t>.5?.72:.8)+y),o=.7}}return[a,a,a,o]}}},panelling:{detail:!0,make:r=>{let e=w(6,6,2,r),t=[.05,.42,.958];return(i,s)=>{let a=_(i*4),o=Math.min(...t.map(m=>Math.abs(s-m))),n=Math.min(a,1-a)*.6,c=o*2.4,l=Math.min(n,c),h=O(z((l-.05)/.025)),u=s<.05?1:0,f=(u?.97:I(1,.93,h))*(.985+(e(i,s)-.5)*.03);return[f,f,f,u?1:1-h*.5]}}},brick_red:Nt(6,18,[10902080,10112824,11822666,9325109,11364946],13222066),brick_buff:Nt(6,18,[13281142,12622697,13874053,12160861],14209218),brick_painted:Nt(6,18,[16777215],16777215,!0),stone_wall:{detail:!1,make:r=>{let e=w(16,16,3,r),t=[0,.16,.3,.47,.6,.77,.88,1],i=[12103064,10984584,12826788,10326655,11576462].map(H);return(s,a)=>{let o=0;for(;o<t.length-2&&a>=t[o+1];)o++;let n=t[o],c=t[o+1],l=(a-n)/(c-n),h=3+o%3,u=s*h+G(o,1)*.7,f=Math.floor(u),m=_(u),g=G(C(f,h),o,4),M=Math.min(A(m,.04),A(l,.1)),b=i[Math.floor(g*i.length)%i.length],p=.88+g*.16+(e(s,a)-.5)*.3,d=se([.62,.6,.56],[b[0]*p,b[1]*p,b[2]*p],O(M));return[d[0],d[1],d[2],O(M)*(.8+e(s,a)*.2)]}}},boards_v:kt(10,!0,[11569248,10976853,12293227],!1),boards_h:kt(8,!1,[16777215],!0),timber_h:kt(8,!1,[10976081,10252360,11765596,9660996],!1),concrete_panels:{detail:!0,make:r=>{let e=w(6,6,4,r),t=w(96,96,1,r);return(i,s)=>{let a=_(i*2),o=_(s*2),n=Math.min(A(a,.006),A(o,.006)),c=[.2,.8].some(h=>[.2,.8].some(u=>Math.hypot(a-h,o-u)<.012))?.55:1,l=(.9+(e(i,s)-.5)*.18-Math.max(0,t(i,s)-.75)*.2)*I(.6,1,n)*c;return[l,l,l,n*c]}}},grass:{detail:!1,make:r=>{let e=w(4,4,3,r),t=w(128,128,2,r);return(i,s)=>{let a=e(i,s),o=t(i,s),n=se(H(7313992),H(10272610),a),c=.78+o*.36;return[n[0]*c,n[1]*c*(.95+a*.08),n[2]*c*.9,o]}}},patio:ze(2,13156530,null,9275261,.02,.1),deck:de(8,1,[10976082,10186568,11700061],.14,.25),pavers:{detail:!1,make:r=>{let e=w(32,32,2,r),t=[10853522,10129543,11577244,9405820].map(H);return(i,s)=>{let a=Math.floor(s*10),o=i*5+a%2*.5,n=G(C(Math.floor(o),5),C(a,10),9),c=Math.min(A(_(o),.04),A(_(s*10),.08)),l=t[Math.floor(n*t.length)%t.length],h=(.9+(e(i,s)-.5)*.25)*I(.55,1,c);return[l[0]*h,l[1]*h,l[2]*h,c]}}},block_paving:{detail:!1,make:r=>{let e=w(48,48,2,r),t=[9265229,8281167,9857359,7298389,10122076,8672840].map(H),i=H(9076848),s=2,a=16;return(o,n)=>{let c=o*a,l=n*a,h=Math.floor(c),u=Math.floor(l),f=_(c),m=_(l),g=C(h+u,2*s),M=g<s,b=M?(g+f)/s:(g-s+m)/s,p=M?m:f,d=M?G(C(h-g,a),C(u,a),5):G(C(h,a),C(u-(g-s),a),6),v=t[Math.floor(d*t.length)%t.length],x=Math.min(A(p,.07),A(b,.035)),S=Math.min(A(p,.2),A(b,.1)),T=(.94+d*.1+(e(o,n)-.5)*.2)*I(.86,1,O(S)),y=se(i,[v[0]*T,v[1]*T,v[2]*T],O(x));return[y[0],y[1],y[2],.3*O(x)+.5*O(S)+e(o,n)*.2]}}},tarmac:{detail:!1,make:r=>{let e=w(128,128,2,r),t=w(4,4,3,r);return(i,s)=>{let a=.32+(e(i,s)-.5)*.18+(t(i,s)-.5)*.06+(e(i,s)>.82?.12:0);return[a,a,a*1.02,e(i,s)]}}},soil:{detail:!1,make:r=>{let e=w(24,24,4,r);return(t,i)=>{let s=.75+e(t,i)*.5;return[.36*s,.27*s,.2*s,e(t,i)]}}},gravel:{detail:!1,make:r=>{let e=me(48,r,.9);return(t,i)=>{let[s,a,o]=e(t,i),n=z((a-s)/.25),c=G(o),l=se([.62,.58,.52],[.86,.83,.78],c),h=I(.5,1,n)*(.9+z(1-s)*.15);return[l[0]*h,l[1]*h,l[2]*h,n*z(1-s*.8)]}}},weave:Ei(110,.14),linen:Ei(90,.1,.12),velvet:st(.08,12,0),boucle:{detail:!0,make:r=>{let e=me(70,r,.9);return(t,i)=>{let[s]=e(t,i),a=z(1-s/.6),o=.84+a*.16;return[o,o,o,a]}}},leather:{detail:!0,make:r=>{let e=me(36,r,.9),t=w(6,6,3,r);return(i,s)=>{let[a,o]=e(i,s),n=z((o-a)/.12),c=(.9+(t(i,s)-.5)*.16)*I(.82,1,n);return[c,c,c,n*.6+a*.2]}}},wood_grain:{detail:!0,make:r=>{let e=w(3,40,4,r);return(t,i)=>{let s=e(t,i),a=Math.abs(Math.sin((i*22+s*6)*Math.PI)),o=.86+s*.16-Math.pow(1-a,6)*.08;return[o,o,o,s]}}},wood_grain_v:{detail:!0,make:r=>{let e=w(40,3,4,r);return(t,i)=>{let s=e(t,i),a=Math.abs(Math.sin((t*22+s*6)*Math.PI)),o=.86+s*.16-Math.pow(1-a,6)*.08;return[o,o,o,s]}}},brushed:{detail:!0,make:r=>{let e=w(2,256,2,r);return(t,i)=>{let s=.92+(e(t,i)-.5)*.12;return[s,s,s,e(t,i)]}}},foliage:{detail:!0,make:r=>{let e=me(24,r,.9),t=w(8,8,2,r);return(i,s)=>{let[a,o,n]=e(i,s),c=z((o-a)/.2),l=(.7+G(n)*.4)*I(.6,1,c)+(t(i,s)-.5)*.1;return[l,l,l,c]}}},rug:{detail:!0,make:r=>{let e=w(96,96,1,r);return(t,i)=>{let s=Math.abs(_(t*4)-.5)+Math.abs(_(i*4)-.5),a=Math.abs(_(s*3)-.5)<.12,n=(Math.abs(_(i*4)-.5)>.46?.62:a?.74:s<.18?.86:1)*(.92+e(t,i)*.1);return[n,n,n,e(t,i)]}}},canvas_art:{detail:!0,make:r=>{let e=Array.from({length:9},()=>({x:r(),y:r(),r:.08+r()*.2,t:r()})),t=w(64,64,1,r);return(i,s)=>{let a=.95;for(let o of e)Math.hypot(C(i-o.x+.5,1)-.5,C(s-o.y+.5,1)-.5)<o.r&&(a=Math.min(a,.35+o.t*.55));return[a+(t(i,s)-.5)*.04,a,a,t(i,s)*.3]}}}},at=new Map;function Ai(r,e,t){let i=Ri[r];if(!i)return null;let s=`${r}@${e}`,a=at.get(s);if(a)return a;let o=i.make(Yi(qi(r))),n=document.createElement("canvas");n.width=n.height=e;let c=n.getContext("2d"),l=c.createImageData(e,e),h=new Float32Array(e*e);for(let d=0;d<e;d++){let v=1-(d+.5)/e;for(let x=0;x<e;x++){let[S,T,y,U]=o((x+.5)/e,v),P=(d*e+x)*4;l.data[P]=z(S)*255,l.data[P+1]=z(T)*255,l.data[P+2]=z(y)*255,l.data[P+3]=255,h[d*e+x]=U}}c.putImageData(l,0,0);let u=new Ue(n);u.colorSpace=i.detail?Ct:Qe;let f=document.createElement("canvas");f.width=f.height=e;let m=f.getContext("2d"),g=m.createImageData(e,e),M=e/128;for(let d=0;d<e;d++)for(let v=0;v<e;v++){let x=h[d*e+C(v-1,e)],S=h[d*e+C(v+1,e)],T=h[C(d-1,e)*e+v],y=h[C(d+1,e)*e+v],U=-(S-x)*M,P=-(T-y)*M,E=Math.hypot(U,P,1),D=(d*e+v)*4;g.data[D]=(U/E*.5+.5)*255,g.data[D+1]=(P/E*.5+.5)*255,g.data[D+2]=(1/E*.5+.5)*255,g.data[D+3]=255}m.putImageData(g,0,0);let b=new Ue(f);b.colorSpace=Ct;for(let d of[u,b])d.wrapS=d.wrapT=ie,d.minFilter=Kt,d.anisotropy=t;let p={map:u,normal:b};return at.set(s,p),p}function Ui(r){var e;return((e=Ri[r])==null?void 0:e.detail)??!0}function qi(r){let e=2166136261;for(let t=0;t<r.length;t++)e=Math.imul(e^r.charCodeAt(t),16777619);return e>>>0}function Fi(){var r;for(let e of at.values())e.map.dispose(),(r=e.normal)==null||r.dispose();at.clear()}var Ki=`
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
}`,$i=`
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
}`,Ji=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha * vAlpha); }`,es=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1.0 - d * 3.2));
}`;function Ni(r,e,t){return new B({vertexShader:r,fragmentShader:e,uniforms:t,transparent:!0,depthWrite:!1,blending:Gt,fog:!1})}var ot=class{constructor(e){this.group=new oi;this.shared={uTime:{value:0},uTop:{value:10},uHeight:{value:12},uWind:{value:new F}};this.rainU={...this.shared,uFall:{value:8},uLen:{value:.42},uColor:{value:new R(12109010)},uAlpha:{value:.32}};this.snowU={...this.shared,uFall:{value:.9},uSize:{value:.045},uScale:{value:800},uColor:{value:new R(16777215)},uAlpha:{value:.9}};this.area=null;this.key="";this.rainMax=e?9e3:4500,this.snowMax=e?7e3:3500,this.rain=new hi(new ce,Ni(Ki,Ji,this.rainU)),this.snow=new ui(new ce,Ni($i,es,this.snowU));for(let t of[this.rain,this.snow])t.frustumCulled=!1,t.renderOrder=4,t.visible=!1;this.group.add(this.rain,this.snow)}setArea(e){this.area=e,this.key=""}set(e){let t=this.area,i=!!t&&(e.rain>.02||e.snow>.02);if(this.rain.visible=!!t&&e.rain>.02,this.snow.visible=!!t&&e.snow>.02,!t||!i)return!1;this.shared.uTop.value=t.top,this.shared.uHeight.value=t.top-t.ground;let s=this.rain.visible?.55:.9;this.shared.uWind.value.set(e.drift[0]*s,e.drift[1]*s),this.rainU.uColor.value.setHex(e.night?8227744:12109010),this.rainU.uAlpha.value=e.night?.32:.45,this.snowU.uColor.value.setHex(e.night?13226982:16777215);let a=[t.minX,t.maxX,t.minZ,t.maxZ,t.top,t.ground,t.rooms.length,Math.round(e.drift[0]),Math.round(e.drift[1])].map(o=>Number(o).toFixed(1)).join("|");return a!==this.key&&(this.key=a,this.build(t)),this.rain.geometry.setDrawRange(0,Math.round(this.rainMax*Math.min(1,e.rain))*2),this.snow.geometry.setDrawRange(0,Math.round(this.snowMax*Math.min(1,e.snow))),!0}tick(e,t){this.shared.uTime.value=e,this.snowU.uScale.value=t}build(e){let t=e.top-e.ground,i=this.shared.uWind.value,s=[this.rainU.uFall.value,this.snowU.uFall.value].map(p=>[i.x*(t/p/2),i.y*(t/p/2)]),a=(p,d,v)=>{for(let x of[-1,0,1]){let S=[p+v[0]*x,d+v[1]*x];if(e.rooms.some(T=>Lt(S,T)||T.some((y,U)=>Bt(S,y,T[(U+1)%T.length]).d<.35)))return!1}return!0},o=Math.max(6,.45*Math.max(e.maxX-e.minX,e.maxZ-e.minZ)),n=e.minX-o,c=e.maxX+o,l=e.minZ-o,h=e.maxZ+o,u=12345,f=()=>(u=u*1103515245+12345&2147483647)/2147483647,m=(p,d)=>{let v=[];for(let x=0;v.length<p&&x<p*6;x++){let S=n+f()*(c-n),T=l+f()*(h-l);a(S,T,d)&&v.push([S,T,f(),.6+f()*.8])}return v},g=m(this.rainMax,s[0]),M=new Float32Array(g.length*8);g.forEach((p,d)=>{M.set([p[0],p[1],p[2],0,p[0],p[1],p[2],1],d*8)}),this.replace(this.rain,M);let b=m(this.snowMax,s[1]);this.replace(this.snow,new Float32Array(b.flat()))}replace(e,t){let i=new ce;i.setAttribute("aSeed",new Et(t,4)),i.setAttribute("position",new Et(new Float32Array(t.length/4*3),3)),e.geometry.dispose(),e.geometry=i}dispose(){for(let e of[this.rain,this.snow])e.geometry.dispose(),e.material.dispose()}};var ts={wood:{tex:"wood_grain",scale:.9,rough:.5,relief:.25},woodDark:{tex:"wood_grain",scale:.9,rough:.45,relief:.25},white:{rough:.45},dark:{rough:.45},metal:{tex:"brushed",scale:.5,rough:.3,metal:.85},glass:{rough:.04,opacity:.28},plant:{tex:"foliage",scale:.35,rough:.65,relief:.8},leaf:{tex:"foliage",scale:.3,rough:.6,relief:.8},pot:{tex:"plaster",scale:.5,rough:.8,relief:.3},soil:{tex:"carpet",scale:.3,rough:1},accent:{rough:.45},red:{rough:.5},blue:{rough:.5},screen:{rough:.12,metal:.2},ceramic:{rough:.1},rug:{tex:"rug",scale:1.2,rough:.95,relief:.3},mattress:{tex:"weave",scale:.3,rough:.9,relief:.2},bulb:{rough:.55},paper:{rough:.85},canvas:{tex:"canvas_art",scale:1,rough:.85,relief:.2},mirror:{rough:.02,metal:1},water:{rough:.03,opacity:.8},rubber:{rough:.85},pine:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},softwood:{tex:"wood_grain_v",scale:.6,rough:.7,relief:.15},oak:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},walnut:{tex:"wood_grain_v",scale:.6,rough:.45,relief:.2},primed:{rough:.85},blackMetal:{rough:.4,metal:.6},concrete:{tex:"concrete",scale:.8,rough:.9,relief:.25},brick:{tex:"brick_red",scale:1.35,rough:.85,relief:.9}},is={cap:{rough:.9},slab:{tex:"concrete",scale:3,rough:.9,relief:.2},blind:{tex:"linen",scale:.3,rough:.9,relief:.2},glass:{rough:.04,opacity:.3}},ki={lawn:{tex:"grass",scale:2,rough:.95,relief:.4},patio:{tex:"patio",scale:1.2,rough:.8,relief:.6},deck:{tex:"deck",scale:1.2,rough:.7,relief:.6},path:{tex:"pavers",scale:1,rough:.8,relief:.6},driveway:{tex:"block_paving",scale:1.6,rough:.8,relief:.6},asphalt:{tex:"tarmac",scale:2.5,rough:.85,relief:.35},bed:{tex:"soil",scale:1.5,rough:1,relief:.6},gravel:{tex:"gravel",scale:1,rough:.9,relief:.9}};function Li(r){let[e,t]=r.split(":"),i=Si(r);return i?{tex:i.tex,scale:i.scale,rough:i.roughness,metal:i.metalness,relief:i.relief}:e==="role"?ts[t]??{rough:.6}:e==="out"?ki[t]??ki.lawn:is[e]??{rough:.6}}function ss(r){let e=Li(r);return!!e.tex&&!Ui(e.tex)}var Bi={value:1},ne={uFill:{value:1},uWet:{value:0},uSnow:{value:0},uTime:{value:0},uSway:{value:new F}},as=Rt+`
attribute vec3 aLamp;
attribute vec3 aEmis;
uniform float uIndoor;
uniform float uTime;
uniform vec2 uSway;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,os=At+`
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
`,rs=Ti+`
uniform float uLampGain;
uniform float uFill;
uniform float uWet;
uniform float uSnow;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,ns=`
float vhFaceUp = smoothstep(0.5, 0.9, vUp);
float vhWet = uWet * vOut * (0.35 + 0.65 * vhFaceUp);
float vhSnow = uSnow * vOut * vhFaceUp;
diffuseColor.rgb *= 1.0 - 0.3 * vhWet;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), vhSnow * 0.94);
`,ls=`
roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.16), vhWet * vhFaceUp * (1.0 - vhSnow));
roughnessFactor = mix(roughnessFactor, 0.85, vhSnow);
`;function cs(r,e,t){r.onBeforeCompile=i=>{Object.assign(i.uniforms,e,ne,{uLampGain:Bi}),i.vertexShader=as+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+os),i.fragmentShader=rs+i.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+wi+ns).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+ls).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vEmis;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
reflectedLight.indirectDiffuse *= mix(uFill, 1.0, vOut);
reflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;`)},r.customProgramCacheKey=()=>t}var hs=new Set(["role:plant","role:leaf"]);function us(r,e,t){return r.onBeforeCompile=i=>{Object.assign(i.uniforms,e),i.vertexShader=Rt+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+At)},r.customProgramCacheKey=()=>t,r}function fs(){let r=document.createElement("canvas");r.width=4,r.height=256;let e=new Ue(r);return e.colorSpace=Qe,e}function ms(r,e,t){let s=r.image.getContext("2d"),a=s.createLinearGradient(0,0,0,256);a.addColorStop(0,`#${e.getHexString()}`),a.addColorStop(1,`#${t.getHexString()}`),s.fillStyle=a,s.fillRect(0,0,4,256),r.needsUpdate=!0}var pe=(r,e,t)=>{let i=Math.max(0,Math.min(1,(t-r)/(e-r)));return i*i*(3-2*i)},rt=(r,e,t)=>new R(r).lerp(new R(e),Math.max(0,Math.min(1,t))),It=new N(-.45,.78,.45).normalize();function Ii(r,e,t){let i=(r-t)*Math.PI/180,s=e*Math.PI/180;return new N(Math.sin(i)*Math.cos(s),Math.sin(s),-Math.cos(i)*Math.cos(s)).normalize()}function ds(){try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}var Oi=class{constructor(e,t,i,s){this.renderer=e;this.scene=t;this.camera=i;this.groundMaterial=new he({color:13226434,roughness:1});this.castOnly=new Ze({colorWrite:!1,depthWrite:!1,side:wt});this.sun=new xi(16773596,2.6);this.skyTex=fs();this.skyPainted="";this.materialsByFloor=new Map;this.registered=new Map;this.sky=null;this.north=0;this.nextFlash=0;this.flash=null;this.envBase=.55;this.haze={fog:0,gloom:0};this.calm=ds();this.falling=!1;this.composer=null;this.gtao=null;this.bloom=null;this.normalTarget=null;this.sunDir=It.clone();this.centre=new N;this.radius=10;this.box=new li(new N(-5,0,-5),new N(5,3,5));this.groundY=0;this.night=!1;this.ultra=s,this.texSize=s?1024:512,this.aniso=Math.min(s?16:8,e.capabilities.getMaxAnisotropy()),e.toneMapping=je,e.toneMappingExposure=1,e.shadowMap.enabled=!0,e.shadowMap.type=zt,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;let a=new bi(e);this.envTex=a.fromScene(new it,.04).texture,a.dispose(),t.environment=this.envTex,this.sun.castShadow=!0;let o=s?4096:2048;this.sun.shadow.mapSize.set(o,o),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=3,t.add(this.sun,this.sun.target),this.groundMaterial.envMapIntensity=.8,this.fx=new ot(s),t.add(this.fx.group),t.background=this.skyTex,s&&this.setupComposer(),this.setNight(!1)}geometry(e){let t=e.surfaces.map(i=>ss(i));return e.toRealisticGeometry(i=>t[i]??!1)}materials(e,t){let i=this.materialsByFloor.get(t);return i||(i=new Map,this.materialsByFloor.set(t,i)),e.surfaces.map(s=>{let a=i.get(s);return a||(a=this.makeMaterial(s,t),i.set(s,a)),a})}makeMaterial(e,t){let i=Li(e),s=new he({vertexColors:!0,roughness:i.rough,metalness:i.metal??0});if(i.tex){let o=Ai(i.tex,this.texSize,this.aniso);if(o){let n=1/(i.scale??1);s.map=o.map.clone(),s.map.repeat.set(n,n),o.normal&&(i.relief??0)>0&&(s.normalMap=o.normal.clone(),s.normalMap.repeat.set(n,n),s.normalScale.set(i.relief,-i.relief))}}i.opacity!==void 0&&(s.transparent=!0,s.opacity=i.opacity,s.depthWrite=!1),e==="glass"&&(s.side=wt,s.forceSinglePass=!0);let a=hs.has(e);return a&&(s.defines={VH_SWAY:1}),cs(s,t,a?"vh-std-sway":"vh-std"),s}glassMaterial(e,t){return this.materials(e,t)[0]}attach(e,t,i){if(e.castShadow=i,e.receiveShadow=!0,this.ultra){let s=us(new Fe,t,"vh-normal");s.blending=W,this.registered.set(e,{mesh:e,normal:s})}this.markShadows()}attachGround(e){if(e.receiveShadow=!0,this.ultra){let t=new Fe;t.blending=W,this.registered.set(e,{mesh:e,normal:t})}}detach(e){let t=this.registered.get(e);t&&(t.normal.dispose(),this.registered.delete(e))}releaseFloor(e){var t,i,s;for(let a of((t=this.materialsByFloor.get(e))==null?void 0:t.values())??[]){let o=a;(i=o.map)==null||i.dispose(),(s=o.normalMap)==null||s.dispose(),a.dispose()}this.materialsByFloor.delete(e)}setNight(e){this.night=e,Bi.value=e?.5:.28,this.bloom&&(this.bloom.strength=e?.32:.12),this.applySky()}setSun(e,t,i){this.setSky({...this.sky??yi(),sun:e===null||t===null?null:{azimuth:e,elevation:t}},i)}setSky(e,t){this.sky=e,this.north=t,this.applySky()}applySky(){let e=this.sky,t=this.night,i=(e==null?void 0:e.cloud)??.2,s=(e==null?void 0:e.rain)??0,a=(e==null?void 0:e.snow)??0,o=(e==null?void 0:e.fog)??0,n=!!(e!=null&&e.storm),c=Math.max(s*.65,n?.6:0,a*.25,o*.2),l=(e==null?void 0:e.sun)??null,h=this.sun.shadow,u=40;if(t){let f=(e==null?void 0:e.moon)??null,m=!!f&&f.elevation>2;this.sunDir.copy(m?Ii(f.azimuth,f.elevation,this.north):It),this.sun.intensity=(m?.38*(.3+.7*f.lit):.2)*(1-.7*i),this.sun.color.setHex(9348863),h.intensity=(m?.65:.3)*(1-.8*i),h.radius=4+6*i,this.envBase=.05+.025*i,ne.uFill.value=1}else{let f=!!l&&l.elevation>-1;u=f?l.elevation:40,this.sunDir.copy(f?Ii(l.azimuth,Math.max(.5,u),this.north):It);let m=pe(-1,3,u)*(.35+.65*pe(2,30,u));this.sun.intensity=3.2*m*(1-.9*i)*(1-.3*c);let g=new R().setRGB(..._i(2300+3300*pe(1,28,u)));this.sun.color.copy(g.lerp(new R(16054010),i*.8)),h.intensity=Math.max(.06,1-.9*i),h.radius=3+7*i,this.envBase=(.25+.4*i)*(.6+.4*pe(-1,12,u))*(1-.32*c),ne.uFill.value=1+.75*(1-i)}this.scene.environmentIntensity=this.envBase,this.renderer.toneMappingExposure=1,this.paintSky(u,i,c,o),this.ground(e),ne.uWet.value=(e==null?void 0:e.wet)??0,ne.uSnow.value=(e==null?void 0:e.snowCover)??0,this.placeSun()}paintSky(e,t,i,s){let a,o;if(this.night)a=rt(395798,1053726,t),o=rt(1581370,2501430,t);else{a=rt(12177640,11713219,t).lerp(new R(6712952),i),o=rt(15659764,14343906,t).lerp(new R(10791601),i);let l=1-pe(1,12,e);o.lerp(new R(16109476),l*(1-t)*.75),a.lerp(new R(7440819),(1-pe(-1,6,e))*.5)}if(s>0){let l=new R(this.night?2764602:14014940);a.lerp(l,s*.85),o.lerp(l,s)}let n=a.getHexString()+o.getHexString();n!==this.skyPainted&&(this.skyPainted=n,ms(this.skyTex,a,o)),this.haze={fog:s,gloom:i};let c=this.scene.fog;c?c.color.copy(o):this.scene.fog=new ri(o.getHex(),1,2),this.placeFog()}placeFog(){let e=this.scene.fog;if(!e)return;let t=this.radius,i=this.camera.position.distanceTo(this.centre),{fog:s,gloom:a}=this.haze;e.near=Math.max(.5,i+t*(1.5-1.9*s)*(1-.3*a)),e.far=i+t*(5-3.6*s)*(1-.25*a)}ground(e){let t=new R(this.night?2765606:13029309),i=(e==null?void 0:e.wet)??0,s=(e==null?void 0:e.snowCover)??0;t.multiplyScalar(1-.25*i).lerp(new R(this.night?8226710:15659766),s),this.groundMaterial.color.copy(t),this.groundMaterial.roughness=s>.5?.9:1-.45*i}fit(e,t){this.box.copy(e),this.groundY=t,e.getCenter(this.centre);let i=e.getSize(new N);this.radius=Math.max(6,Math.hypot(i.x,i.z)/2),this.applySky()}placeSun(){let e=this.sunDir,t=this.box.getSize(new N).length();this.sun.target.position.copy(this.centre),this.sun.position.copy(this.centre).addScaledVector(e,t+20),this.sun.target.updateMatrixWorld(),this.sun.updateMatrixWorld();let i=this.sun.shadow.camera;i.position.copy(this.sun.position),i.lookAt(this.centre),i.updateMatrixWorld();let s=i.matrixWorldInverse,a=this.box,o=1/0,n=1/0,c=1/0,l=-1/0,h=-1/0,u=-1/0,f=new N,m=b=>{f.copy(b).applyMatrix4(s),o=Math.min(o,f.x),l=Math.max(l,f.x),n=Math.min(n,f.y),h=Math.max(h,f.y),c=Math.min(c,f.z),u=Math.max(u,f.z)},g=e.y>.01?1/e.y:100;for(let b of[a.min.x,a.max.x])for(let p of[a.min.y,a.max.y])for(let d of[a.min.z,a.max.z]){let v=new N(b,p,d);m(v),m(v.addScaledVector(e,-Math.min(150,Math.max(0,p-this.groundY)*g)))}let M=.6;i.left=o-M,i.right=l+M,i.bottom=n-M,i.top=h+M,i.near=Math.max(.1,-u-2),i.far=-c+2,i.updateProjectionMatrix(),this.markShadows()}setWeatherArea(e){this.fx.setArea(e),this.applyFx()}applyFx(){let e=this.sky;if(!e){this.falling=this.fx.set({rain:0,snow:0,drift:[0,0],night:this.night});return}let t=(e.windFrom+180-this.north)*Math.PI/180,i=[Math.sin(t)*e.wind,-Math.cos(t)*e.wind],s=this.calm?0:Math.min(1,Math.max(0,(e.wind-4)/10))*.05;ne.uSway.value.set(Math.sin(t)*s,-Math.cos(t)*s),this.falling=this.fx.set({rain:e.rain,snow:e.snow,drift:i,night:this.night})}animate(e){if(this.calm)return 0;let t=this.sky,i=!!t&&t.wind>6;if(ne.uTime.value=e/1e3,this.falling){let a=this.renderer.getDrawingBufferSize(new F);this.fx.tick(e/1e3,a.y/(2*Math.tan(this.camera.fov*Math.PI/360)))}let s=!1;if(t!=null&&t.storm){if(this.nextFlash||(this.nextFlash=e+3e3+Math.random()*7e3),!this.flash&&e>=this.nextFlash&&(this.flash={start:e}),this.flash){let a=(e-this.flash.start)/1e3,o=a<.08?a/.08:a<.16?1-(a-.08)/.16:a<.22?.5+(a-.16)/.12:Math.max(0,1-(a-.22)/.25);a>.5?this.endFlash(e+1e4+Math.random()*3e4):(this.scene.environmentIntensity=this.envBase+(this.night?.5:.9)*o,this.scene.backgroundIntensity=1+.6*o,s=!0)}}else(this.flash||this.nextFlash)&&this.endFlash(0);return this.falling||i||s?33:t!=null&&t.storm?Math.max(33,this.nextFlash-e):0}endFlash(e){this.flash=null,this.nextFlash=e,this.scene.environmentIntensity=this.envBase,this.scene.backgroundIntensity=1}markShadows(){this.renderer.shadowMap.needsUpdate=!0}setupComposer(){let e=new X(1,1,{type:Z,samples:4});this.composer=new Ke(this.renderer,e),this.composer.addPass(new $e(this.scene,this.camera)),this.gtao=new Le(this.scene,this.camera,1,1),this.gtao._renderGBuffer=!1,this.normalTarget=this.gtao.normalRenderTarget,this.gtao.updateGtaoMaterial({radius:.45,distanceExponent:1.6,thickness:1.2,scale:1,samples:12}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,rings:2,samples:12}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao),this.bloom=new ue(new F(1,1),.12,.35,.98),this.composer.addPass(this.bloom),this.composer.addPass(new tt)}setSize(e,t,i){var s;this.composer&&(this.composer.setPixelRatio(i),this.composer.setSize(e,t),(s=this.gtao)==null||s.setSize(Math.max(1,Math.round(e*i/2)),Math.max(1,Math.round(t*i/2))))}render(){if(this.placeFog(),!this.composer){this.renderer.render(this.scene,this.camera);return}this.renderNormals(),this.composer.render()}renderNormals(){let e=[],t=[];this.scene.traverseVisible(l=>{let h=l;if(!h.isMesh)return;let u=this.registered.get(h);u?(t.push([h,h.material]),h.material=u.normal):e.push(l)});for(let l of e)l.visible=!1;let i=this.scene.background,s=this.scene.fog;this.scene.background=null,this.scene.fog=null;let a=this.renderer.shadowMap.enabled;this.renderer.shadowMap.enabled=!1;let o=this.renderer.getRenderTarget(),n=new R;this.renderer.getClearColor(n);let c=this.renderer.getClearAlpha();this.renderer.setRenderTarget(this.normalTarget),this.renderer.setClearColor(7829503,1),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(o),this.renderer.setClearColor(n,c),this.renderer.shadowMap.enabled=a,this.scene.background=i,this.scene.fog=s;for(let l of e)l.visible=!0;for(let[l,h]of t)l.material=h}dispose(){var e,t,i;for(let s of[...this.materialsByFloor.keys()])this.releaseFloor(s);for(let s of this.registered.values())s.normal.dispose();this.registered.clear(),this.scene.remove(this.sun,this.sun.target),this.sun.dispose(),this.envTex.dispose(),this.skyTex.dispose(),this.groundMaterial.dispose(),this.castOnly.dispose(),this.scene.remove(this.fx.group),this.fx.dispose(),this.scene.environment=null,this.scene.fog=null,(e=this.composer)==null||e.dispose(),(t=this.gtao)==null||t.dispose(),(i=this.bloom)==null||i.dispose(),Fi(),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=0}};export{Oi as RealisticLook,ss as fullColour,Ii as skyDirection};
