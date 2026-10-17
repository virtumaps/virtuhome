import{b as Tt,c as _t,d as ui,e as fi}from"./chunk-XBDM7UVR.js";import{$ as Jt,A as Ht,B as jt,C as Wt,D as bt,E as He,Ea as hi,F as Qt,H as N,J as B,K as Zt,L as Z,M as ne,N as qt,P as q,Q as Xt,R as Yt,T as St,U as Kt,X as $t,Y as X,Z as je,aa as Ee,ba as ei,c as Et,ca as ti,d as Rt,e as At,f as L,fa as G,g as Ut,ga as V,h as Nt,ha as ii,i as ye,ia as le,j as De,ja as Re,k as vt,ka as si,l as xt,la as ai,m as Ft,n as kt,na as oi,o as Ot,oa as ri,p as ze,pa as ni,q as Bt,r as It,ra as li,s as Lt,t as ie,u as Mt,va as ci,w as Vt,x as Gt,y as Q,z as zt}from"./chunk-33DCXNTY.js";var Y={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var I=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Ui=new ri(-1,1,1,-1,0,1),Pt=class extends Kt{constructor(){super(),this.setAttribute("position",new St([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new St([0,2,0,0,2,0],2))}},Ni=new Pt,K=class{constructor(e){this._mesh=new X(Ni,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ui)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var We=class extends I{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof V?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=G.clone(e.uniforms),this.material=new V({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new K(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ae=class extends I{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let s=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let o,n;this.inverse?(o=0,n=1):(o=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),a.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(s.EQUAL,1,4294967295),a.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),a.buffers.stencil.setLocked(!0)}},Qe=class extends I{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Ze=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new N);this._width=i.width,this._height=i.height,t=new Z(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Q}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new We(Y),this.copyPass.material.blending=L,this.timer=new li}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let s=0,a=this.passes.length;s<a;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),o.needsSwap){if(i){let n=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ae!==void 0&&(o instanceof Ae?i=!0:o instanceof Qe&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new N);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var qe=class extends I{constructor(e,t,i=null,s=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new q}render(e,t,i){let s=e.autoClear;e.autoClear=!1;let a,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}};var Ue={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new N},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new ne},cameraProjectionMatrixInverse:{value:new ne},cameraWorldMatrix:{value:new ne},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new B(-1,-1,-1)},sceneBoxMax:{value:new B(1,1,1)}},vertexShader:`

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
		}`},Ne={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

		}`},Xe={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function di(r=5){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=Fi(e),i=t.length,s=new Uint8Array(i*4);for(let o=0;o<i;++o){let n=t[o],c=2*Math.PI*n/i,l=new B(Math.cos(c),Math.sin(c),0).normalize();s[o*4]=(l.x*.5+.5)*255,s[o*4+1]=(l.y*.5+.5)*255,s[o*4+2]=127,s[o*4+3]=255}let a=new je(s,e,e);return a.wrapS=ie,a.wrapT=ie,a.needsUpdate=!0,a}function Fi(r){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=e*e,i=Array(t).fill(0),s=Math.floor(e/2),a=e-1;for(let o=1;o<=t;){if(s===-1&&a===e?(a=e-2,s=0):(a===e&&(a=0),s<0&&(s=e-1)),i[s*e+a]!==0){a-=2,s++;continue}else i[s*e+a]=o++;a++,s--}return i}var Fe={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:wt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new N},cameraProjectionMatrixInverse:{value:new ne},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function wt(r,e,t){let i=ki(r,e,t),s="vec3[SAMPLES](";for(let a=0;a<r;a++){let o=i[a];s+=`vec3(${o.x}, ${o.y}, ${o.z})${a<r-1?",":")"}`}return s}function ki(r,e,t){let i=[];for(let s=0;s<r;s++){let a=2*Math.PI*e*s/r,o=Math.pow(s/(r-1),t);i.push(new B(Math.cos(a),Math.sin(a),o))}return i}var Ye=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let i,s,a,o=.5*(Math.sqrt(3)-1),n=(e+t)*o,c=Math.floor(e+n),l=Math.floor(t+n),h=(3-Math.sqrt(3))/6,u=(c+l)*h,f=c-u,d=l-u,g=e-f,x=t-d,b,M;g>x?(b=1,M=0):(b=0,M=1);let m=g-b+h,v=x-M+h,p=g-1+2*h,T=x-1+2*h,w=c&255,C=l&255,R=this.perm[w+this.perm[C]]%12,P=this.perm[w+b+this.perm[C+M]]%12,y=this.perm[w+1+this.perm[C+1]]%12,D=.5-g*g-x*x;D<0?i=0:(D*=D,i=D*D*this._dot(this.grad3[R],g,x));let U=.5-m*m-v*v;U<0?s=0:(U*=U,s=U*U*this._dot(this.grad3[P],m,v));let W=.5-p*p-T*T;return W<0?a=0:(W*=W,a=W*W*this._dot(this.grad3[y],p,T)),70*(i+s+a)}noise3d(e,t,i){let s,a,o,n,l=(e+t+i)*.3333333333333333,h=Math.floor(e+l),u=Math.floor(t+l),f=Math.floor(i+l),d=1/6,g=(h+u+f)*d,x=h-g,b=u-g,M=f-g,m=e-x,v=t-b,p=i-M,T,w,C,R,P,y;m>=v?v>=p?(T=1,w=0,C=0,R=1,P=1,y=0):m>=p?(T=1,w=0,C=0,R=1,P=0,y=1):(T=0,w=0,C=1,R=1,P=0,y=1):v<p?(T=0,w=0,C=1,R=0,P=1,y=1):m<p?(T=0,w=1,C=0,R=0,P=1,y=1):(T=0,w=1,C=0,R=1,P=1,y=0);let D=m-T+d,U=v-w+d,W=p-C+d,de=m-R+2*d,me=v-P+2*d,pe=p-y+2*d,ge=m-1+3*d,ve=v-1+3*d,k=p-1+3*d,se=h&255,ae=u&255,oe=f&255,Ie=this.perm[se+this.perm[ae+this.perm[oe]]]%12,Le=this.perm[se+T+this.perm[ae+w+this.perm[oe+C]]]%12,Ve=this.perm[se+R+this.perm[ae+P+this.perm[oe+y]]]%12,Ge=this.perm[se+1+this.perm[ae+1+this.perm[oe+1]]]%12,$=.6-m*m-v*v-p*p;$<0?s=0:($*=$,s=$*$*this._dot3(this.grad3[Ie],m,v,p));let J=.6-D*D-U*U-W*W;J<0?a=0:(J*=J,a=J*J*this._dot3(this.grad3[Le],D,U,W));let ee=.6-de*de-me*me-pe*pe;ee<0?o=0:(ee*=ee,o=ee*ee*this._dot3(this.grad3[Ve],de,me,pe));let te=.6-ge*ge-ve*ve-k*k;return te<0?n=0:(te*=te,n=te*te*this._dot3(this.grad3[Ge],ge,ve,k)),32*(s+a+o+n)}noise4d(e,t,i,s){let a=this.grad4,o=this.simplex,n=this.perm,c=(Math.sqrt(5)-1)/4,l=(5-Math.sqrt(5))/20,h,u,f,d,g,x=(e+t+i+s)*c,b=Math.floor(e+x),M=Math.floor(t+x),m=Math.floor(i+x),v=Math.floor(s+x),p=(b+M+m+v)*l,T=b-p,w=M-p,C=m-p,R=v-p,P=e-T,y=t-w,D=i-C,U=s-R,W=P>y?32:0,de=P>D?16:0,me=y>D?8:0,pe=P>U?4:0,ge=y>U?2:0,ve=D>U?1:0,k=W+de+me+pe+ge+ve,se=o[k][0]>=3?1:0,ae=o[k][1]>=3?1:0,oe=o[k][2]>=3?1:0,Ie=o[k][3]>=3?1:0,Le=o[k][0]>=2?1:0,Ve=o[k][1]>=2?1:0,Ge=o[k][2]>=2?1:0,$=o[k][3]>=2?1:0,J=o[k][0]>=1?1:0,ee=o[k][1]>=1?1:0,te=o[k][2]>=1?1:0,Dt=o[k][3]>=1?1:0,tt=P-se+l,it=y-ae+l,st=D-oe+l,at=U-Ie+l,ot=P-Le+2*l,rt=y-Ve+2*l,nt=D-Ge+2*l,lt=U-$+2*l,ct=P-J+3*l,ht=y-ee+3*l,ut=D-te+3*l,ft=U-Dt+3*l,dt=P-1+4*l,mt=y-1+4*l,pt=D-1+4*l,gt=U-1+4*l,xe=b&255,Me=M&255,be=m&255,Se=v&255,yi=n[xe+n[Me+n[be+n[Se]]]]%32,Di=n[xe+se+n[Me+ae+n[be+oe+n[Se+Ie]]]]%32,Ei=n[xe+Le+n[Me+Ve+n[be+Ge+n[Se+$]]]]%32,Ri=n[xe+J+n[Me+ee+n[be+te+n[Se+Dt]]]]%32,Ai=n[xe+1+n[Me+1+n[be+1+n[Se+1]]]]%32,Te=.6-P*P-y*y-D*D-U*U;Te<0?h=0:(Te*=Te,h=Te*Te*this._dot4(a[yi],P,y,D,U));let _e=.6-tt*tt-it*it-st*st-at*at;_e<0?u=0:(_e*=_e,u=_e*_e*this._dot4(a[Di],tt,it,st,at));let Pe=.6-ot*ot-rt*rt-nt*nt-lt*lt;Pe<0?f=0:(Pe*=Pe,f=Pe*Pe*this._dot4(a[Ei],ot,rt,nt,lt));let we=.6-ct*ct-ht*ht-ut*ut-ft*ft;we<0?d=0:(we*=we,d=we*we*this._dot4(a[Ri],ct,ht,ut,ft));let Ce=.6-dt*dt-mt*mt-pt*pt-gt*gt;return Ce<0?g=0:(Ce*=Ce,g=Ce*Ce*this._dot4(a[Ai],dt,mt,pt,gt)),27*(h+u+f+d+g)}_dot(e,t,i){return e[0]*t+e[1]*i}_dot3(e,t,i,s){return e[0]*t+e[1]*i+e[2]*s}_dot4(e,t,i,s,a){return e[0]*t+e[1]*i+e[2]*s+e[3]*a}};var ke=class r extends I{constructor(e,t,i=512,s=512,a,o,n){super(),this.width=i,this.height=s,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=di(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new Z(this.width,this.height,{type:Q,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new V({defines:Object.assign({},Ue.defines),uniforms:G.clone(Ue.uniforms),vertexShader:Ue.vertexShader,fragmentShader:Ue.fragmentShader,blending:L,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Re,this.normalMaterial.blending=L,this.pdMaterial=new V({defines:Object.assign({},Fe.defines),uniforms:G.clone(Fe.uniforms),vertexShader:Fe.vertexShader,fragmentShader:Fe.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new V({defines:Object.assign({},Ne.defines),uniforms:G.clone(Ne.uniforms),vertexShader:Ne.vertexShader,fragmentShader:Ne.fragmentShader,blending:L}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new V({uniforms:G.clone(Y.uniforms),vertexShader:Y.vertexShader,fragmentShader:Y.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:xt,blendDst:De,blendEquation:ye,blendSrcAlpha:vt,blendDstAlpha:De,blendEquationAlpha:ye}),this.blendMaterial=new V({uniforms:G.clone(Xe.uniforms),vertexShader:Xe.vertexShader,fragmentShader:Xe.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Nt,blendSrc:xt,blendDst:De,blendEquation:ye,blendSrcAlpha:vt,blendDstAlpha:De,blendEquationAlpha:ye}),this._fsQuad=new K(null),this._originalClearColor=new q,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),o!==void 0&&this.updateGtaoMaterial(o),n!==void 0&&this.updatePdMaterial(n)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new ei,this.depthTexture.format=jt,this.depthTexture.type=zt,this.normalRenderTarget=new Z(this.width,this.height,{minFilter:Mt,magFilter:Mt,type:Q,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let i=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=wt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,i){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case r.OUTPUT.Off:break;case r.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=L,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=L,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=L,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=L,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=L,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,i,s,a){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_renderOverride(e,t,i,s,a){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s=t.clearColor||s,a=t.clearAlpha||a,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(i){(i.isPoints||i.isLine||i.isLine2)&&i.visible&&(i.visible=!1,t.push(i))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new Ye,i=e*e*4,s=new Uint8Array(i);for(let o=0;o<e;o++)for(let n=0;n<e;n++){let c=o,l=n;s[(o*e+n)*4]=(t.noise(c,l)*.5+.5)*255,s[(o*e+n)*4+1]=(t.noise(c+e,l)*.5+.5)*255,s[(o*e+n)*4+2]=(t.noise(c,l+e)*.5+.5)*255,s[(o*e+n)*4+3]=(t.noise(c+e,l+e)*.5+.5)*255}let a=new je(s,e,e,Ht,Gt);return a.wrapS=ie,a.wrapT=ie,a.needsUpdate=!0,a}};ke.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var mi={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new q(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var ce=class r extends I{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new N(e.x,e.y):new N(256,256),this.clearColor=new q(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new Z(a,o,{type:Q,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new Z(a,o,{type:Q,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let f=new Z(a,o,{type:Q,depthBuffer:!1});f.texture.name="UnrealBloomPass.v"+h,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),a=Math.round(a/2),o=Math.round(o/2)}let n=mi;this.highPassUniforms=G.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new V({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];let c=[6,10,14,18,22];a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(c[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new N(1/a,1/o),a=Math.round(a/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1),new B(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=G.clone(Y.uniforms),this.blendMaterial=new V({uniforms:this.copyUniforms,vertexShader:Y.vertexShader,fragmentShader:Y.fragmentShader,premultipliedAlpha:!0,blending:Ut,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new q,this._oldClearAlpha=1,this._basic=new $t,this._fsQuad=new K(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(i,s),this.renderTargetsVertical[a].setSize(i,s),this.separableBlurMaterials[a].uniforms.invSize.value=new N(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let c=0;c<this.nMips;c++)this._fsQuad.material=this.separableBlurMaterials[c],this.separableBlurMaterials[c].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[c].uniforms.direction.value=r.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[c]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[c].uniforms.colorTexture.value=this.renderTargetsHorizontal[c].texture,this.separableBlurMaterials[c].uniforms.direction.value=r.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[c]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[c];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let o=0;o<e;o++)t.push(.39894*Math.exp(-.5*o*o/(i*i))/i);let s=[],a=[];for(let o=1;o<e;o+=2){let n=t[o],c=o+1<e?t[o+1]:0,l=n+c;s.push((o*n+(o+1)*c)/l),a.push(l)}return new V({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new N(.5,.5)},direction:{value:new N(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new V({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};ce.BlurDirectionX=new N(1,0);ce.BlurDirectionY=new N(0,1);var Oe={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var Ke=class extends I{constructor(){super(),this.isOutputPass=!0,this.uniforms=G.clone(Oe.uniforms),this.material=new ii({name:Oe.name,uniforms:this.uniforms,vertexShader:Oe.vertexShader,fragmentShader:Oe.fragmentShader}),this._fsQuad=new K(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Zt.getTransfer(this._outputColorSpace)===Qt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ft?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===kt?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Ot?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===ze?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===It?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Lt?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Bt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var $e=class extends Yt{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new ti;e.deleteAttribute("uv");let t=new le({side:Rt}),i=new le,s=new oi(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let a=new X(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let o=new Jt(e,i,6),n=new qt;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),o.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),o.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),o.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),o.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),o.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),o.setMatrixAt(5,n.matrix),this.add(o);let c=new X(e,he(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new X(e,he(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let h=new X(e,he(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new X(e,he(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let f=new X(e,he(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let d=new X(e,he(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function he(r){return new si({color:0,emissive:16777215,emissiveIntensity:r})}function Oi(r){let e=r>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function z(r,e=0,t=0){let i=Math.imul(r|0,374761393)+Math.imul(e|0,668265263)+Math.imul(t|0,2147483647);return i=Math.imul(i^i>>>13,1274126177),((i^i>>>16)>>>0)/4294967296}var _=r=>r-Math.floor(r),E=(r,e)=>(r%e+e)%e,H=r=>r*r*(3-2*r),O=r=>r<0?0:r>1?1:r,F=(r,e,t)=>r+(e-r)*t,re=(r,e,t)=>[F(r[0],e[0],t),F(r[1],e[1],t),F(r[2],e[2],t)],j=r=>[(r>>16&255)/255,(r>>8&255)/255,(r&255)/255],A=(r,e)=>O(Math.min(r,1-r)/e);function gi(r,e,t){let i=new Float32Array(r*e);for(let s=0;s<i.length;s++)i[s]=t();return(s,a)=>{let o=_(s)*r,n=_(a)*e,c=Math.floor(o),l=Math.floor(n),h=H(o-c),u=H(n-l),f=(c+1)%r,d=(l+1)%e,g=i[l*r+c],x=i[l*r+f],b=i[d*r+c],M=i[d*r+f];return F(F(g,x,h),F(b,M,h),u)}}function S(r,e,t,i){let s=Array.from({length:t},(a,o)=>gi(r<<o,e<<o,i));return(a,o)=>{let n=0,c=.5,l=0;for(let h of s)n+=h(a,o)*c,l+=c,c*=.5;return n/l}}function ue(r,e,t=.8){let i=new Float32Array(r*r*2);for(let s=0;s<r*r;s++)i[s*2]=.5+(e()-.5)*t,i[s*2+1]=.5+(e()-.5)*t;return(s,a)=>{let o=_(s)*r,n=_(a)*r,c=Math.floor(o),l=Math.floor(n),h=9,u=9,f=0;for(let d=-1;d<=1;d++)for(let g=-1;g<=1;g++){let x=c+g,b=l+d,M=E(b,r)*r+E(x,r),m=x+i[M*2],v=b+i[M*2+1],p=Math.hypot(m-o,v-n);p<h?(u=h,h=p,f=M):p<u&&(u=p)}return[h,u,f]}}function fe(r,e,t,i,s=.45,a=!1){return{detail:a,make:o=>{let n=S(3,48,3,o),c=gi(6,24,o),l=Array.from({length:r},()=>o()),h=t.map(j);return(u,f)=>{let d=Math.floor(f*r),g=_(f*r),x=u*e+l[d%r]*e,b=Math.floor(x),M=_(x),m=z(d,E(b,e),7),v=h[Math.floor(m*h.length)%h.length],p=n(u+m,f),T=c(u+m*.37,f),w=1+(m-.5)*i+(p-.5)*.35-Math.max(0,T-.8)*.8,C=Math.min(A(g,.02),A(M,.004*e)),R=w*F(s,1,C);return[v[0]*R,v[1]*R,v[2]*R,.4+.6*C-(1-p)*.05]}}}}function Be(r,e,t,i,s=.035,a=.06){return{detail:!1,make:o=>{let n=S(16,16,3,o),c=j(e),l=t===null?c:j(t),h=j(i);return(u,f)=>{let d=u*r,g=f*r,x=Math.floor(d),b=Math.floor(g),M=_(d),m=_(g),v=Math.min(A(M,s),A(m,s)),p=(x+b)%2===0?c:l,T=1+(z(E(x,r),E(b,r),3)-.5)*a+(n(u,f)-.5)*.06,w=re(h,[p[0]*T,p[1]*T,p[2]*T],v);return[w[0],w[1],w[2],v*.9+.1]}}}}function Ct(r,e,t,i,s=!1){return{detail:s,make:a=>{let o=S(64,64,2,a),n=S(4,4,3,a),c=t.map(j),l=j(i);return(h,u)=>{let f=Math.floor(u*e),d=_(u*e),g=h*r+f%2*.5,x=Math.floor(g),b=_(g),M=z(E(x,r),E(f,e),11),m=Math.min(A(b,.045),A(d,.14)),v=c[Math.floor(M*c.length)%c.length],p=.88+M*.18+(o(h,u)-.5)*.3+(n(h,u)-.5)*.15,T=s?[.96+(o(h,u)-.5)*.08,.96,.95]:[v[0]*p,v[1]*p,v[2]*p],w=s?[.86,.86,.85]:[l[0]*(.9+o(h,u)*.2),l[1]*(.9+o(h,u)*.2),l[2]*(.9+o(h,u)*.2)],C=re(w,T,H(m));return[C[0],C[1],C[2],.25+.75*H(m)-o(h,u)*.08]}}}}function yt(r,e,t,i){return{detail:i,make:s=>{let a=e?S(48,3,3,s):S(3,48,3,s),o=t.map(j);return(n,c)=>{let l=e?n:c,h=e?c:n,u=Math.floor(l*r),f=_(l*r),d=z(E(u,r),0,5),g=o[Math.floor(d*o.length)%o.length],x=A(f,.06),b=e?1:.82+.18*H(O(f/.25)),M=(.92+d*.12+(a(n,c)-.5)*(i?.12:.3))*b*F(.45,1,x);return[g[0]*M,g[1]*M,g[2]*M,x*(e?1:.6+.4*f)]}}}}function Je(r,e,t=0,i=!0){return{detail:i,make:s=>{let a=S(e,e,4,s),o=S(128,128,1,s);return(n,c)=>{let l=a(n,c),h=o(n,c),u=1-r*.5+(l-.5)*r-Math.max(0,h-.7)*t;return[u,u,u,l*.6+h*(t?.8:.2)]}}}}function pi(r,e,t=0){return{detail:!0,make:i=>{let s=S(8,8,3,i),a=S(4,r,2,i);return(o,n)=>{let c=Math.sin(o*r*Math.PI*2),l=Math.sin(n*r*Math.PI*2),h=(Math.floor(o*r)+Math.floor(n*r))%2===0,u=Math.abs(h?c:l),f=.9+u*e-e*.5+(s(o,n)-.5)*.08+(a(o,n)-.5)*t;return[f,f,f,u]}}}}var vi={planks_light:fe(13,2,[14467226,13939850,14862500,13610628],.12),planks_oak:fe(13,2,[13213810,12555366,13806204,12160092],.14),planks_walnut:fe(13,2,[8084033,7229240,8807242,6243120],.16),planks_grey:fe(13,2,[12104362,11446174,12762292,10854037],.1),vinyl:fe(8,2,[16777215],.05,.75,!0),herringbone:{detail:!1,make:r=>{let e=S(4,64,3,r),t=[12885102,12095328,13609082,11437398].map(j),i=4,s=16;return(a,o)=>{let n=a*s,c=o*s,l=Math.floor(n),h=Math.floor(c),u=_(n),f=_(c),d=E(l+h,2*i),g,x,b,M;d<i?(M=!0,g=(d+u)/i,x=f,b=z(E(l-d,s),E(h,s),1)):(M=!1,g=(d-i+f)/i,x=u,b=z(E(l,s),E(h-(d-i),s),2));let m=t[Math.floor(b*t.length)%t.length],v=M?e(a,o):e(o,a),p=Math.min(A(x,.05),A(g,.012)),T=(.92+b*.14+(v-.5)*.3)*F(.45,1,p);return[m[0]*T,m[1]*T,m[2]*T,.4+.6*p]}}},tiles_light:Be(2,14474456,null,12171184),tiles_dark:Be(2,5921888,null,4605770),tiles_terracotta:Be(4,12086603,null,13483950,.05,.16),checker:Be(4,15658730,2960945,10132118,.02,.03),tiles_metro:{detail:!0,make:r=>{let e=S(8,8,2,r);return(t,i)=>{let s=Math.floor(i*6),a=t*3+s%2*.5,o=Math.min(A(_(a),.03),A(_(i*6),.06)),n=Math.min(A(_(a),.12),A(_(i*6),.24)),c=F(.72,1,H(o))*(.97+(e(t,i)-.5)*.04);return[c,c,c,.2+.5*H(o)+.3*H(n)]}}},marble:{detail:!1,make:r=>{let e=S(4,4,5,r),t=S(8,8,3,r);return(i,s)=>{let a=Math.abs(Math.sin((i*2+s+e(i,s)*2.4)*Math.PI*2)),o=Math.pow(1-O(a/.12),2)*.5+Math.pow(1-O(Math.abs(Math.sin((s*3-i+t(i,s)*3)*Math.PI*2))/.05),2)*.25,n=Math.min(A(_(i*2),.004),A(_(s*2),.004)),c=re([.93,.925,.91],[.55,.56,.58],o),l=F(.7,1,n);return[c[0]*l,c[1]*l,c[2]*l,n]}}},carpet:{detail:!0,make:r=>{let e=S(96,96,2,r),t=S(6,6,3,r);return(i,s)=>{let a=.86+(e(i,s)-.5)*.22+(t(i,s)-.5)*.08;return[a,a,a,e(i,s)]}}},flagstone:{detail:!1,make:r=>{let e=ue(4,r,.7),t=S(24,24,3,r),i=[12169894,11117463,12893616,10393483].map(j);return(s,a)=>{let[o,n,c]=e(s,a),l=O((n-o)/.08),h=i[c%i.length],u=.9+(t(s,a)-.5)*.3+z(c)*.1,f=re([.45,.43,.4],[h[0]*u,h[1]*u,h[2]*u],H(l));return[f[0],f[1],f[2],H(l)*.8+t(s,a)*.2]}}},concrete:Je(.16,6,.25),plaster:Je(.05,8,0),render:Je(.1,10,.2),pebbledash:{detail:!0,make:r=>{let e=ue(40,r,.9),t=S(8,8,2,r);return(i,s)=>{let[a,,o]=e(i,s),n=O(1-a/.5),c=.8+n*.2+(z(o)-.5)*.12+(t(i,s)-.5)*.05;return[c,c,c,n]}}},wp_stripes:{detail:!0,make:r=>{let e=S(4,16,2,r);return(t,i)=>{let s=_(t*8),a=s<.5?1:.86,o=Math.abs(s-.75)<.012?.8:1,n=a*o*(.98+(e(t,i)-.5)*.03);return[n,n,n,.5]}}},wp_damask:{detail:!0,make:()=>(r,e)=>{let t=r*2,i=e*3,s=Math.floor(i),a=_(t+s%2*.5)-.5,o=_(i)-.5,n=Math.hypot(a,o*1.3),c=Math.atan2(o,a),l=.26+.07*Math.cos(c*6)+.03*Math.cos(c*12),h=n<l?n<.08||n>.13&&n<.16?0:1:0,u=Math.abs(Math.sin((a+o)*14)*Math.sin((a-o)*14))>.92&&n>.33?1:0,f=h||u?.82:1;return[f,f,f,h||u?.6:.4]}},wp_geo:{detail:!0,make:()=>(r,e)=>{let t=_(r*4+e*3),i=_(r*4-e*3),s=Math.min(Math.abs(t-.5),Math.abs(i-.5))<.035,a=(Math.floor(r*4+e*3)+Math.floor(r*4-e*3))%2===0,o=s?.7:a?.94:1;return[o,o,o,s?.3:.5]}},wp_leaves:{detail:!0,make:r=>{let t=Array.from({length:25},()=>({x:r(),y:r(),a:r()*Math.PI,s:.7+r()*.5,t:r()}));return(i,s)=>{let a=1,o=.4,n=Math.floor(i*5),c=Math.floor(s*5);for(let l=-1;l<=1;l++)for(let h=-1;h<=1;h++){let u=n+h,f=c+l,d=t[E(f,5)*5+E(u,5)],g=(u+d.x)/5,x=(f+d.y)/5,b=(i-g)*5,M=(s-x)*5,m=Math.cos(d.a),v=Math.sin(d.a),p=(b*m+M*v)/d.s,T=(-b*v+M*m)/d.s;if(p*p/.36+T*T/.05<1){let C=Math.abs(T)<.015?.1:0;a=Math.min(a,(d.t>.5?.72:.8)+C),o=.7}}return[a,a,a,o]}}},panelling:{detail:!0,make:r=>{let e=S(6,6,2,r),t=[.05,.42,.958];return(i,s)=>{let a=_(i*4),o=Math.min(...t.map(d=>Math.abs(s-d))),n=Math.min(a,1-a)*.6,c=o*2.4,l=Math.min(n,c),h=H(O((l-.05)/.025)),u=s<.05?1:0,f=(u?.97:F(1,.93,h))*(.985+(e(i,s)-.5)*.03);return[f,f,f,u?1:1-h*.5]}}},brick_red:Ct(6,18,[10902080,10112824,11822666,9325109,11364946],13222066),brick_buff:Ct(6,18,[13281142,12622697,13874053,12160861],14209218),brick_painted:Ct(6,18,[16777215],16777215,!0),stone_wall:{detail:!1,make:r=>{let e=S(16,16,3,r),t=[0,.16,.3,.47,.6,.77,.88,1],i=[12103064,10984584,12826788,10326655,11576462].map(j);return(s,a)=>{let o=0;for(;o<t.length-2&&a>=t[o+1];)o++;let n=t[o],c=t[o+1],l=(a-n)/(c-n),h=3+o%3,u=s*h+z(o,1)*.7,f=Math.floor(u),d=_(u),g=z(E(f,h),o,4),x=Math.min(A(d,.04),A(l,.1)),b=i[Math.floor(g*i.length)%i.length],M=.88+g*.16+(e(s,a)-.5)*.3,m=re([.62,.6,.56],[b[0]*M,b[1]*M,b[2]*M],H(x));return[m[0],m[1],m[2],H(x)*(.8+e(s,a)*.2)]}}},boards_v:yt(10,!0,[11569248,10976853,12293227],!1),boards_h:yt(8,!1,[16777215],!0),timber_h:yt(8,!1,[10976081,10252360,11765596,9660996],!1),concrete_panels:{detail:!0,make:r=>{let e=S(6,6,4,r),t=S(96,96,1,r);return(i,s)=>{let a=_(i*2),o=_(s*2),n=Math.min(A(a,.006),A(o,.006)),c=[.2,.8].some(h=>[.2,.8].some(u=>Math.hypot(a-h,o-u)<.012))?.55:1,l=(.9+(e(i,s)-.5)*.18-Math.max(0,t(i,s)-.75)*.2)*F(.6,1,n)*c;return[l,l,l,n*c]}}},grass:{detail:!1,make:r=>{let e=S(4,4,3,r),t=S(128,128,2,r);return(i,s)=>{let a=e(i,s),o=t(i,s),n=re(j(7313992),j(10272610),a),c=.78+o*.36;return[n[0]*c,n[1]*c*(.95+a*.08),n[2]*c*.9,o]}}},patio:Be(2,13156530,null,9275261,.02,.1),deck:fe(8,1,[10976082,10186568,11700061],.14,.25),pavers:{detail:!1,make:r=>{let e=S(32,32,2,r),t=[10853522,10129543,11577244,9405820].map(j);return(i,s)=>{let a=Math.floor(s*10),o=i*5+a%2*.5,n=z(E(Math.floor(o),5),E(a,10),9),c=Math.min(A(_(o),.04),A(_(s*10),.08)),l=t[Math.floor(n*t.length)%t.length],h=(.9+(e(i,s)-.5)*.25)*F(.55,1,c);return[l[0]*h,l[1]*h,l[2]*h,c]}}},tarmac:{detail:!1,make:r=>{let e=S(128,128,2,r),t=S(4,4,3,r);return(i,s)=>{let a=.32+(e(i,s)-.5)*.18+(t(i,s)-.5)*.06+(e(i,s)>.82?.12:0);return[a,a,a*1.02,e(i,s)]}}},soil:{detail:!1,make:r=>{let e=S(24,24,4,r);return(t,i)=>{let s=.75+e(t,i)*.5;return[.36*s,.27*s,.2*s,e(t,i)]}}},gravel:{detail:!1,make:r=>{let e=ue(48,r,.9);return(t,i)=>{let[s,a,o]=e(t,i),n=O((a-s)/.25),c=z(o),l=re([.62,.58,.52],[.86,.83,.78],c),h=F(.5,1,n)*(.9+O(1-s)*.15);return[l[0]*h,l[1]*h,l[2]*h,n*O(1-s*.8)]}}},weave:pi(110,.14),linen:pi(90,.1,.12),velvet:Je(.08,12,0),boucle:{detail:!0,make:r=>{let e=ue(70,r,.9);return(t,i)=>{let[s]=e(t,i),a=O(1-s/.6),o=.84+a*.16;return[o,o,o,a]}}},leather:{detail:!0,make:r=>{let e=ue(36,r,.9),t=S(6,6,3,r);return(i,s)=>{let[a,o]=e(i,s),n=O((o-a)/.12),c=(.9+(t(i,s)-.5)*.16)*F(.82,1,n);return[c,c,c,n*.6+a*.2]}}},wood_grain:{detail:!0,make:r=>{let e=S(3,40,4,r);return(t,i)=>{let s=e(t,i),a=Math.abs(Math.sin((i*22+s*6)*Math.PI)),o=.86+s*.16-Math.pow(1-a,6)*.08;return[o,o,o,s]}}},brushed:{detail:!0,make:r=>{let e=S(2,256,2,r);return(t,i)=>{let s=.92+(e(t,i)-.5)*.12;return[s,s,s,e(t,i)]}}},foliage:{detail:!0,make:r=>{let e=ue(24,r,.9),t=S(8,8,2,r);return(i,s)=>{let[a,o,n]=e(i,s),c=O((o-a)/.2),l=(.7+z(n)*.4)*F(.6,1,c)+(t(i,s)-.5)*.1;return[l,l,l,c]}}},rug:{detail:!0,make:r=>{let e=S(96,96,1,r);return(t,i)=>{let s=Math.abs(_(t*4)-.5)+Math.abs(_(i*4)-.5),a=Math.abs(_(s*3)-.5)<.12,n=(Math.abs(_(i*4)-.5)>.46?.62:a?.74:s<.18?.86:1)*(.92+e(t,i)*.1);return[n,n,n,e(t,i)]}}},canvas_art:{detail:!0,make:r=>{let e=Array.from({length:9},()=>({x:r(),y:r(),r:.08+r()*.2,t:r()})),t=S(64,64,1,r);return(i,s)=>{let a=.95;for(let o of e)Math.hypot(E(i-o.x+.5,1)-.5,E(s-o.y+.5,1)-.5)<o.r&&(a=Math.min(a,.35+o.t*.55));return[a+(t(i,s)-.5)*.04,a,a,t(i,s)*.3]}}}},et=new Map;function xi(r,e,t){let i=vi[r];if(!i)return null;let s=`${r}@${e}`,a=et.get(s);if(a)return a;let o=i.make(Oi(Bi(r))),n=document.createElement("canvas");n.width=n.height=e;let c=n.getContext("2d"),l=c.createImageData(e,e),h=new Float32Array(e*e);for(let m=0;m<e;m++){let v=1-(m+.5)/e;for(let p=0;p<e;p++){let[T,w,C,R]=o((p+.5)/e,v),P=(m*e+p)*4;l.data[P]=O(T)*255,l.data[P+1]=O(w)*255,l.data[P+2]=O(C)*255,l.data[P+3]=255,h[m*e+p]=R}}c.putImageData(l,0,0);let u=new Ee(n);u.colorSpace=i.detail?bt:He;let f=document.createElement("canvas");f.width=f.height=e;let d=f.getContext("2d"),g=d.createImageData(e,e),x=e/128;for(let m=0;m<e;m++)for(let v=0;v<e;v++){let p=h[m*e+E(v-1,e)],T=h[m*e+E(v+1,e)],w=h[E(m-1,e)*e+v],C=h[E(m+1,e)*e+v],R=-(T-p)*x,P=-(w-C)*x,y=Math.hypot(R,P,1),D=(m*e+v)*4;g.data[D]=(R/y*.5+.5)*255,g.data[D+1]=(P/y*.5+.5)*255,g.data[D+2]=(1/y*.5+.5)*255,g.data[D+3]=255}d.putImageData(g,0,0);let b=new Ee(f);b.colorSpace=bt;for(let m of[u,b])m.wrapS=m.wrapT=ie,m.minFilter=Vt,m.anisotropy=t;let M={map:u,normal:b};return et.set(s,M),M}function Mi(r){var e;return((e=vi[r])==null?void 0:e.detail)??!0}function Bi(r){let e=2166136261;for(let t=0;t<r.length;t++)e=Math.imul(e^r.charCodeAt(t),16777619);return e>>>0}function bi(){var r;for(let e of et.values())e.map.dispose(),(r=e.normal)==null||r.dispose();et.clear()}var Ii={wood:{tex:"wood_grain",scale:.9,rough:.5,relief:.25},woodDark:{tex:"wood_grain",scale:.9,rough:.45,relief:.25},white:{rough:.45},dark:{rough:.45},metal:{tex:"brushed",scale:.5,rough:.3,metal:.85},glass:{rough:.04,opacity:.28},plant:{tex:"foliage",scale:.35,rough:.65,relief:.8},leaf:{tex:"foliage",scale:.3,rough:.6,relief:.8},pot:{tex:"plaster",scale:.5,rough:.8,relief:.3},soil:{tex:"carpet",scale:.3,rough:1},accent:{rough:.45},red:{rough:.5},blue:{rough:.5},screen:{rough:.12,metal:.2},ceramic:{rough:.1},rug:{tex:"rug",scale:1.2,rough:.95,relief:.3},mattress:{tex:"weave",scale:.3,rough:.9,relief:.2},bulb:{rough:.55},paper:{rough:.85},canvas:{tex:"canvas_art",scale:1,rough:.85,relief:.2},mirror:{rough:.02,metal:1},water:{rough:.03,opacity:.8},rubber:{rough:.85}},Li={cap:{rough:.9},slab:{tex:"concrete",scale:3,rough:.9,relief:.2},frame:{rough:.4},door:{tex:"wood_grain",scale:1.6,rough:.45,relief:.1},blind:{tex:"linen",scale:.3,rough:.9,relief:.2},glass:{rough:.04,opacity:.3}},Si={lawn:{tex:"grass",scale:2,rough:.95,relief:.4},patio:{tex:"patio",scale:1.2,rough:.8,relief:.6},deck:{tex:"deck",scale:1.2,rough:.7,relief:.6},path:{tex:"pavers",scale:1,rough:.8,relief:.6},driveway:{tex:"pavers",scale:1.2,rough:.8,relief:.6},bed:{tex:"soil",scale:1.5,rough:1,relief:.6},gravel:{tex:"gravel",scale:1,rough:.9,relief:.9}};function wi(r){let[e,t]=r.split(":"),i=hi(r);return i?{tex:i.tex,scale:i.scale,rough:i.roughness,metal:i.metalness,relief:i.relief}:e==="role"?Ii[t]??{rough:.6}:e==="out"?Si[t]??Si.lawn:Li[e]??{rough:.6}}function Vi(r){let e=wi(r);return!!e.tex&&!Mi(e.tex)}var Ci={value:1},Gi=Tt+`
attribute vec3 aLamp;
attribute vec3 aEmis;
varying vec3 vLamp;
varying vec3 vEmis;
`,zi=_t+`
vLamp = aLamp;
vEmis = aEmis;
`,Hi=ui+`
uniform float uLampGain;
varying vec3 vLamp;
varying vec3 vEmis;
`;function ji(r,e,t){r.onBeforeCompile=i=>{Object.assign(i.uniforms,e,{uLampGain:Ci}),i.vertexShader=Gi+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+zi),i.fragmentShader=Hi+i.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+fi).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vEmis;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
reflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;`)},r.customProgramCacheKey=()=>t}function Ti(r,e,t){return r.onBeforeCompile=i=>{Object.assign(i.uniforms,e),i.vertexShader=Tt+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+_t)},r.customProgramCacheKey=()=>t,r}function _i(r,e){let t=document.createElement("canvas");t.width=4,t.height=256;let i=t.getContext("2d"),s=i.createLinearGradient(0,0,0,256);s.addColorStop(0,`#${r.toString(16).padStart(6,"0")}`),s.addColorStop(1,`#${e.toString(16).padStart(6,"0")}`),i.fillStyle=s,i.fillRect(0,0,4,256);let a=new Ee(t);return a.colorSpace=He,a}var Pi=class{constructor(e,t,i,s){this.renderer=e;this.scene=t;this.camera=i;this.groundMaterial=new le({color:13226434,roughness:1});this.sun=new ni(16773596,2.6);this.skyDay=_i(12177640,15659764);this.skyNight=_i(395798,1581370);this.materialsByFloor=new Map;this.depthByFloor=new Map;this.registered=new Map;this.composer=null;this.gtao=null;this.bloom=null;this.normalTarget=null;this.sunDir=new B(.45,.75,.5).normalize();this.centre=new B;this.radius=10;this.night=!1;this.ultra=s,this.texSize=s?1024:512,this.aniso=Math.min(s?16:8,e.capabilities.getMaxAnisotropy()),e.toneMapping=ze,e.toneMappingExposure=1,e.shadowMap.enabled=!0,e.shadowMap.type=Et,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;let a=new ci(e);this.envTex=a.fromScene(new $e,.04).texture,a.dispose(),t.environment=this.envTex,this.sun.castShadow=!0;let o=s?4096:2048;this.sun.shadow.mapSize.set(o,o),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=3,t.add(this.sun,this.sun.target),this.groundMaterial.envMapIntensity=.8,s&&this.setupComposer(),this.setNight(!1)}geometry(e){let t=e.surfaces.map(i=>Vi(i));return e.toRealisticGeometry(i=>t[i]??!1)}materials(e,t){let i=this.materialsByFloor.get(t);return i||(i=new Map,this.materialsByFloor.set(t,i)),e.surfaces.map(s=>{let a=i.get(s);return a||(a=this.makeMaterial(s,t),i.set(s,a)),a})}makeMaterial(e,t){let i=wi(e),s=new le({vertexColors:!0,roughness:i.rough,metalness:i.metal??0});if(i.tex){let a=xi(i.tex,this.texSize,this.aniso);if(a){let o=1/(i.scale??1);s.map=a.map.clone(),s.map.repeat.set(o,o),a.normal&&(i.relief??0)>0&&(s.normalMap=a.normal.clone(),s.normalMap.repeat.set(o,o),s.normalScale.set(i.relief,-i.relief))}}return i.opacity!==void 0&&(s.transparent=!0,s.opacity=i.opacity,s.depthWrite=!1),e==="glass"&&(s.side=At,s.forceSinglePass=!0),ji(s,t,"vh-std"),s}glassMaterial(e,t){return this.materials(e,t)[0]}attach(e,t,i){if(e.castShadow=i,e.receiveShadow=!0,i){let s=this.depthByFloor.get(t);s||(s=Ti(new ai({depthPacking:Wt}),t,"vh-depth"),this.depthByFloor.set(t,s)),e.customDepthMaterial=s}if(this.ultra){let s=Ti(new Re,t,"vh-normal");s.blending=L,this.registered.set(e,{mesh:e,normal:s})}this.markShadows()}attachGround(e){if(e.receiveShadow=!0,this.ultra){let t=new Re;t.blending=L,this.registered.set(e,{mesh:e,normal:t})}}detach(e){let t=this.registered.get(e);t&&(t.normal.dispose(),this.registered.delete(e))}releaseFloor(e){var t,i,s,a;for(let o of((t=this.materialsByFloor.get(e))==null?void 0:t.values())??[]){let n=o;(i=n.map)==null||i.dispose(),(s=n.normalMap)==null||s.dispose(),o.dispose()}this.materialsByFloor.delete(e),(a=this.depthByFloor.get(e))==null||a.dispose(),this.depthByFloor.delete(e)}setNight(e){this.night=e,this.scene.environmentIntensity=e?.05:.55,this.sun.intensity=e?.35:2.6,this.sun.color.setHex(e?9348863:16773596),this.scene.background=e?this.skyNight:this.skyDay,this.renderer.toneMappingExposure=1,this.groundMaterial.color.setHex(e?2765606:13029309),Ci.value=e?.5:.28,this.bloom&&(this.bloom.strength=e?.32:.12),this.markShadows()}setSun(e,t,i){if(e===null||t===null)this.sunDir.set(-.45,.78,.45).normalize();else{let s=(e-i)*Math.PI/180,a=Math.max(18,t)*Math.PI/180;this.sunDir.set(Math.sin(s)*Math.cos(a),Math.sin(a),-Math.cos(s)*Math.cos(a)).normalize()}this.placeSun()}fit(e,t){this.centre.copy(e),this.radius=Math.max(6,t);let i=this.night?1317939:15133936;this.scene.fog=new Xt(i,this.radius*2.5,this.radius*6),this.placeSun()}placeSun(){let e=this.radius;this.sun.target.position.copy(this.centre),this.sun.position.copy(this.centre).addScaledVector(this.sunDir,e*2.5);let t=this.sun.shadow.camera;t.left=-e,t.right=e,t.top=e,t.bottom=-e,t.near=.5,t.far=e*5,t.updateProjectionMatrix(),this.sun.target.updateMatrixWorld(),this.markShadows()}markShadows(){this.renderer.shadowMap.needsUpdate=!0}setupComposer(){let e=new Z(1,1,{type:Q,samples:4});this.composer=new Ze(this.renderer,e),this.composer.addPass(new qe(this.scene,this.camera)),this.gtao=new ke(this.scene,this.camera,1,1),this.gtao._renderGBuffer=!1,this.normalTarget=this.gtao.normalRenderTarget,this.gtao.updateGtaoMaterial({radius:.45,distanceExponent:1.6,thickness:1.2,scale:1,samples:16}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:16}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao),this.bloom=new ce(new N(1,1),.12,.35,.98),this.composer.addPass(this.bloom),this.composer.addPass(new Ke)}setSize(e,t,i){this.composer&&(this.composer.setPixelRatio(i),this.composer.setSize(e,t))}render(){if(!this.composer){this.renderer.render(this.scene,this.camera);return}this.renderNormals(),this.composer.render()}renderNormals(){let e=[],t=[];this.scene.traverseVisible(l=>{let h=l;if(!h.isMesh)return;let u=this.registered.get(h);u?(t.push([h,h.material]),h.material=u.normal):e.push(l)});for(let l of e)l.visible=!1;let i=this.scene.background,s=this.scene.fog;this.scene.background=null,this.scene.fog=null;let a=this.renderer.shadowMap.enabled;this.renderer.shadowMap.enabled=!1;let o=this.renderer.getRenderTarget(),n=new q;this.renderer.getClearColor(n);let c=this.renderer.getClearAlpha();this.renderer.setRenderTarget(this.normalTarget),this.renderer.setClearColor(7829503,1),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(o),this.renderer.setClearColor(n,c),this.renderer.shadowMap.enabled=a,this.scene.background=i,this.scene.fog=s;for(let l of e)l.visible=!0;for(let[l,h]of t)l.material=h}dispose(){var e,t,i;for(let s of[...this.materialsByFloor.keys()])this.releaseFloor(s);for(let s of this.registered.values())s.normal.dispose();this.registered.clear(),this.scene.remove(this.sun,this.sun.target),this.sun.dispose(),this.envTex.dispose(),this.skyDay.dispose(),this.skyNight.dispose(),this.groundMaterial.dispose(),this.scene.environment=null,this.scene.fog=null,(e=this.composer)==null||e.dispose(),(t=this.gtao)==null||t.dispose(),(i=this.bloom)==null||i.dispose(),bi(),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=0}};export{Pi as RealisticLook,Vi as fullColour};
