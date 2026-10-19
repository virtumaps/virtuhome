import{d as yi}from"./chunk-EW6L4JMQ.js";import{$ as Z,Aa as Ye,Ca as hi,E as Vt,Ea as ui,F as Gt,Fa as fi,G as _t,Ga as Ue,H as W,Ha as mi,I as Ht,Ia as di,J as Wt,K as jt,L as Re,La as j,M as Ae,Ma as G,N as yt,Na as pi,O as Pt,Oa as ue,P as Qt,Pa as Fe,Q as Zt,Qa as gi,R as Xt,S as Qe,Sa as vi,T as Yt,Ta as xi,U as qt,Ua as Mi,V as Kt,W as se,Wa as bi,X as Ct,Z as $t,_ as Jt,_a as Si,aa as ei,ba as ti,ca as ii,da as Et,ea as Ze,fa as si,ha as N,ja as k,ka as ai,la as X,ma as ce,na as oi,oa as ri,ob as Ti,oc as Pi,pa as A,qa as ni,ra as li,sa as ci,sb as At,ta as Dt,tb as Ut,ua as Rt,ub as wi,va as he,vb as _i,x as Bt,y as zt,ya as Xe,za as Y}from"./chunk-2ON6OTRR.js";var q={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var H=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Qi=new xi(-1,1,1,-1,0,1),Ft=class extends he{constructor(){super(),this.setAttribute("position",new Rt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Rt([0,2,0,0,2,0],2))}},Zi=new Ft,K=class{constructor(e){this._mesh=new Y(Zi,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Qi)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var qe=class extends H{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof G?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=j.clone(e.uniforms),this.material=new G({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new K(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ne=class extends H{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let s=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let o,n;this.inverse?(o=0,n=1):(o=1,n=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),a.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),a.buffers.stencil.setClear(n),a.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(s.EQUAL,1,4294967295),a.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),a.buffers.stencil.setLocked(!0)}},Ke=class extends H{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var $e=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new N);this._width=i.width,this._height=i.height,t=new X(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Z}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new qe(q),this.copyPass.material.blending=W,this.timer=new bi}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let s=0,a=this.passes.length;s<a;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),o.needsSwap){if(i){let n=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}Ne!==void 0&&(o instanceof Ne?i=!0:o instanceof Ke&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new N);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Je=class extends H{constructor(e,t,i=null,s=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new A}render(e,t,i){let s=e.autoClear;e.autoClear=!1;let a,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(a=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}};var ke={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new N},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new ce},cameraProjectionMatrixInverse:{value:new ce},cameraWorldMatrix:{value:new ce},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new k(-1,-1,-1)},sceneBoxMax:{value:new k(1,1,1)}},vertexShader:`

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

		}`},et={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function Ci(r=5){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=Xi(e),i=t.length,s=new Uint8Array(i*4);for(let o=0;o<i;++o){let n=t[o],c=2*Math.PI*n/i,l=new k(Math.cos(c),Math.sin(c),0).normalize();s[o*4]=(l.x*.5+.5)*255,s[o*4+1]=(l.y*.5+.5)*255,s[o*4+2]=127,s[o*4+3]=255}let a=new Ye(s,e,e);return a.wrapS=se,a.wrapT=se,a.needsUpdate=!0,a}function Xi(r){let e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=e*e,i=Array(t).fill(0),s=Math.floor(e/2),a=e-1;for(let o=1;o<=t;){if(s===-1&&a===e?(a=e-2,s=0):(a===e&&(a=0),s<0&&(s=e-1)),i[s*e+a]!==0){a-=2,s++;continue}else i[s*e+a]=o++;a++,s--}return i}var Oe={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Nt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new N},cameraProjectionMatrixInverse:{value:new ce},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function Nt(r,e,t){let i=Yi(r,e,t),s="vec3[SAMPLES](";for(let a=0;a<r;a++){let o=i[a];s+=`vec3(${o.x}, ${o.y}, ${o.z})${a<r-1?",":")"}`}return s}function Yi(r,e,t){let i=[];for(let s=0;s<r;s++){let a=2*Math.PI*e*s/r,o=Math.pow(s/(r-1),t);i.push(new k(Math.cos(a),Math.sin(a),o))}return i}var tt=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let i,s,a,o=.5*(Math.sqrt(3)-1),n=(e+t)*o,c=Math.floor(e+n),l=Math.floor(t+n),h=(3-Math.sqrt(3))/6,u=(c+l)*h,f=c-u,m=l-u,g=e-f,M=t-m,b,p;g>M?(b=1,p=0):(b=0,p=1);let d=g-b+h,v=M-p+h,x=g-1+2*h,T=M-1+2*h,_=c&255,y=l&255,U=this.perm[_+this.perm[y]]%12,C=this.perm[_+b+this.perm[y+p]]%12,D=this.perm[_+1+this.perm[y+1]]%12,R=.5-g*g-M*M;R<0?i=0:(R*=R,i=R*R*this._dot(this.grad3[U],g,M));let B=.5-d*d-v*v;B<0?s=0:(B*=B,s=B*B*this._dot(this.grad3[C],d,v));let Q=.5-x*x-T*T;return Q<0?a=0:(Q*=Q,a=Q*Q*this._dot(this.grad3[D],x,T)),70*(i+s+a)}noise3d(e,t,i){let s,a,o,n,l=(e+t+i)*.3333333333333333,h=Math.floor(e+l),u=Math.floor(t+l),f=Math.floor(i+l),m=1/6,g=(h+u+f)*m,M=h-g,b=u-g,p=f-g,d=e-M,v=t-b,x=i-p,T,_,y,U,C,D;d>=v?v>=x?(T=1,_=0,y=0,U=1,C=1,D=0):d>=x?(T=1,_=0,y=0,U=1,C=0,D=1):(T=0,_=0,y=1,U=1,C=0,D=1):v<x?(T=0,_=0,y=1,U=0,C=1,D=1):d<x?(T=0,_=1,y=0,U=0,C=1,D=1):(T=0,_=1,y=0,U=1,C=1,D=0);let R=d-T+m,B=v-_+m,Q=x-y+m,ge=d-U+2*m,ve=v-C+2*m,xe=x-D+2*m,Me=d-1+3*m,be=v-1+3*m,V=x-1+3*m,ae=h&255,oe=u&255,re=f&255,Ge=this.perm[ae+this.perm[oe+this.perm[re]]]%12,He=this.perm[ae+T+this.perm[oe+_+this.perm[re+y]]]%12,We=this.perm[ae+U+this.perm[oe+C+this.perm[re+D]]]%12,je=this.perm[ae+1+this.perm[oe+1+this.perm[re+1]]]%12,J=.6-d*d-v*v-x*x;J<0?s=0:(J*=J,s=J*J*this._dot3(this.grad3[Ge],d,v,x));let ee=.6-R*R-B*B-Q*Q;ee<0?a=0:(ee*=ee,a=ee*ee*this._dot3(this.grad3[He],R,B,Q));let te=.6-ge*ge-ve*ve-xe*xe;te<0?o=0:(te*=te,o=te*te*this._dot3(this.grad3[We],ge,ve,xe));let ie=.6-Me*Me-be*be-V*V;return ie<0?n=0:(ie*=ie,n=ie*ie*this._dot3(this.grad3[je],Me,be,V)),32*(s+a+o+n)}noise4d(e,t,i,s){let a=this.grad4,o=this.simplex,n=this.perm,c=(Math.sqrt(5)-1)/4,l=(5-Math.sqrt(5))/20,h,u,f,m,g,M=(e+t+i+s)*c,b=Math.floor(e+M),p=Math.floor(t+M),d=Math.floor(i+M),v=Math.floor(s+M),x=(b+p+d+v)*l,T=b-x,_=p-x,y=d-x,U=v-x,C=e-T,D=t-_,R=i-y,B=s-U,Q=C>D?32:0,ge=C>R?16:0,ve=D>R?8:0,xe=C>B?4:0,Me=D>B?2:0,be=R>B?1:0,V=Q+ge+ve+xe+Me+be,ae=o[V][0]>=3?1:0,oe=o[V][1]>=3?1:0,re=o[V][2]>=3?1:0,Ge=o[V][3]>=3?1:0,He=o[V][0]>=2?1:0,We=o[V][1]>=2?1:0,je=o[V][2]>=2?1:0,J=o[V][3]>=2?1:0,ee=o[V][0]>=1?1:0,te=o[V][1]>=1?1:0,ie=o[V][2]>=1?1:0,Lt=o[V][3]>=1?1:0,lt=C-ae+l,ct=D-oe+l,ht=R-re+l,ut=B-Ge+l,ft=C-He+2*l,mt=D-We+2*l,dt=R-je+2*l,pt=B-J+2*l,gt=C-ee+3*l,vt=D-te+3*l,xt=R-ie+3*l,Mt=B-Lt+3*l,bt=C-1+4*l,St=D-1+4*l,Tt=R-1+4*l,wt=B-1+4*l,Se=b&255,Te=p&255,we=d&255,_e=v&255,Vi=n[Se+n[Te+n[we+n[_e]]]]%32,Gi=n[Se+ae+n[Te+oe+n[we+re+n[_e+Ge]]]]%32,Hi=n[Se+He+n[Te+We+n[we+je+n[_e+J]]]]%32,Wi=n[Se+ee+n[Te+te+n[we+ie+n[_e+Lt]]]]%32,ji=n[Se+1+n[Te+1+n[we+1+n[_e+1]]]]%32,ye=.6-C*C-D*D-R*R-B*B;ye<0?h=0:(ye*=ye,h=ye*ye*this._dot4(a[Vi],C,D,R,B));let Pe=.6-lt*lt-ct*ct-ht*ht-ut*ut;Pe<0?u=0:(Pe*=Pe,u=Pe*Pe*this._dot4(a[Gi],lt,ct,ht,ut));let Ce=.6-ft*ft-mt*mt-dt*dt-pt*pt;Ce<0?f=0:(Ce*=Ce,f=Ce*Ce*this._dot4(a[Hi],ft,mt,dt,pt));let Ee=.6-gt*gt-vt*vt-xt*xt-Mt*Mt;Ee<0?m=0:(Ee*=Ee,m=Ee*Ee*this._dot4(a[Wi],gt,vt,xt,Mt));let De=.6-bt*bt-St*St-Tt*Tt-wt*wt;return De<0?g=0:(De*=De,g=De*De*this._dot4(a[ji],bt,St,Tt,wt)),27*(h+u+f+m+g)}_dot(e,t,i){return e[0]*t+e[1]*i}_dot3(e,t,i,s){return e[0]*t+e[1]*i+e[2]*s}_dot4(e,t,i,s,a){return e[0]*t+e[1]*i+e[2]*s+e[3]*a}};var Le=class r extends H{constructor(e,t,i=512,s=512,a,o,n){super(),this.width=i,this.height=s,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Ci(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new X(this.width,this.height,{type:Z,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new G({defines:Object.assign({},ke.defines),uniforms:j.clone(ke.uniforms),vertexShader:ke.vertexShader,fragmentShader:ke.fragmentShader,blending:W,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Fe,this.normalMaterial.blending=W,this.pdMaterial=new G({defines:Object.assign({},Oe.defines),uniforms:j.clone(Oe.uniforms),vertexShader:Oe.vertexShader,fragmentShader:Oe.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new G({defines:Object.assign({},Ie.defines),uniforms:j.clone(Ie.uniforms),vertexShader:Ie.vertexShader,fragmentShader:Ie.fragmentShader,blending:W}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new G({uniforms:j.clone(q.uniforms),vertexShader:q.vertexShader,fragmentShader:q.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Pt,blendDst:Ae,blendEquation:Re,blendSrcAlpha:yt,blendDstAlpha:Ae,blendEquationAlpha:Re}),this.blendMaterial=new G({uniforms:j.clone(et.uniforms),vertexShader:et.vertexShader,fragmentShader:et.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:jt,blendSrc:Pt,blendDst:Ae,blendEquation:Re,blendSrcAlpha:yt,blendDstAlpha:Ae,blendEquationAlpha:Re}),this._fsQuad=new K(null),this._originalClearColor=new A,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),o!==void 0&&this.updateGtaoMaterial(o),n!==void 0&&this.updatePdMaterial(n)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new mi,this.depthTexture.format=ii,this.depthTexture.type=ei,this.normalRenderTarget=new X(this.width,this.height,{minFilter:Ct,magFilter:Ct,type:Z,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let i=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Nt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,i){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case r.OUTPUT.Off:break;case r.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case r.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=W,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,i,s,a){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_renderOverride(e,t,i,s,a){e.getClearColor(this._originalClearColor);let o=e.getClearAlpha(),n=e.autoClear;e.setRenderTarget(i),e.autoClear=!1,s=t.clearColor||s,a=t.clearAlpha||a,s!=null&&(e.setClearColor(s),e.setClearAlpha(a||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=n,e.setClearColor(this._originalClearColor),e.setClearAlpha(o)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(i){(i.isPoints||i.isLine||i.isLine2)&&i.visible&&(i.visible=!1,t.push(i))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new tt,i=e*e*4,s=new Uint8Array(i);for(let o=0;o<e;o++)for(let n=0;n<e;n++){let c=o,l=n;s[(o*e+n)*4]=(t.noise(c,l)*.5+.5)*255,s[(o*e+n)*4+1]=(t.noise(c+e,l)*.5+.5)*255,s[(o*e+n)*4+2]=(t.noise(c,l+e)*.5+.5)*255,s[(o*e+n)*4+3]=(t.noise(c+e,l+e)*.5+.5)*255}let a=new Ye(s,e,e,ti,Jt);return a.wrapS=se,a.wrapT=se,a.needsUpdate=!0,a}};Le.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Ei={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new A(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var fe=class r extends H{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new N(e.x,e.y):new N(256,256),this.clearColor=new A(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new X(a,o,{type:Z,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new X(a,o,{type:Z,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let f=new X(a,o,{type:Z,depthBuffer:!1});f.texture.name="UnrealBloomPass.v"+h,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),a=Math.round(a/2),o=Math.round(o/2)}let n=Ei;this.highPassUniforms=j.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new G({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];let c=[6,10,14,18,22];a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(c[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new N(1/a,1/o),a=Math.round(a/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new k(1,1,1),new k(1,1,1),new k(1,1,1),new k(1,1,1),new k(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=j.clone(q.uniforms),this.blendMaterial=new G({uniforms:this.copyUniforms,vertexShader:q.vertexShader,fragmentShader:q.fragmentShader,premultipliedAlpha:!0,blending:Wt,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new A,this._oldClearAlpha=1,this._basic=new Xe,this._fsQuad=new K(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(i,s),this.renderTargetsVertical[a].setSize(i,s),this.separableBlurMaterials[a].uniforms.invSize.value=new N(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let n=this.renderTargetBright;for(let c=0;c<this.nMips;c++)this._fsQuad.material=this.separableBlurMaterials[c],this.separableBlurMaterials[c].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[c].uniforms.direction.value=r.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[c]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[c].uniforms.colorTexture.value=this.renderTargetsHorizontal[c].texture,this.separableBlurMaterials[c].uniforms.direction.value=r.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[c]),e.clear(),this._fsQuad.render(e),n=this.renderTargetsVertical[c];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let o=0;o<e;o++)t.push(.39894*Math.exp(-.5*o*o/(i*i))/i);let s=[],a=[];for(let o=1;o<e;o+=2){let n=t[o],c=o+1<e?t[o+1]:0,l=n+c;s.push((o*n+(o+1)*c)/l),a.push(l)}return new G({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new N(.5,.5)},direction:{value:new N(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:a}},vertexShader:`

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

				}`})}};fe.BlurDirectionX=new N(1,0);fe.BlurDirectionY=new N(0,1);var Be={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var it=class extends H{constructor(){super(),this.isOutputPass=!0,this.uniforms=j.clone(Be.uniforms),this.material=new pi({name:Be.name,uniforms:this.uniforms,vertexShader:Be.vertexShader,fragmentShader:Be.fragmentShader}),this._fsQuad=new K(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ai.getTransfer(this._outputColorSpace)===si&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Qt?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Zt?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Xt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Qe?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===qt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Kt?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Yt&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var st=class extends li{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new di;e.deleteAttribute("uv");let t=new ue({side:Gt}),i=new ue,s=new vi(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let a=new Y(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let o=new hi(e,i,6),n=new oi;n.position.set(-10.906,2.009,1.846),n.rotation.set(0,-.195,0),n.scale.set(2.328,7.905,4.651),n.updateMatrix(),o.setMatrixAt(0,n.matrix),n.position.set(-5.607,-.754,-.758),n.rotation.set(0,.994,0),n.scale.set(1.97,1.534,3.955),n.updateMatrix(),o.setMatrixAt(1,n.matrix),n.position.set(6.167,.857,7.803),n.rotation.set(0,.561,0),n.scale.set(3.927,6.285,3.687),n.updateMatrix(),o.setMatrixAt(2,n.matrix),n.position.set(-2.017,.018,6.124),n.rotation.set(0,.333,0),n.scale.set(2.002,4.566,2.064),n.updateMatrix(),o.setMatrixAt(3,n.matrix),n.position.set(2.291,-.756,-2.621),n.rotation.set(0,-.286,0),n.scale.set(1.546,1.552,1.496),n.updateMatrix(),o.setMatrixAt(4,n.matrix),n.position.set(-2.193,-.369,-5.547),n.rotation.set(0,.516,0),n.scale.set(3.875,3.487,2.986),n.updateMatrix(),o.setMatrixAt(5,n.matrix),this.add(o);let c=new Y(e,me(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new Y(e,me(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let h=new Y(e,me(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Y(e,me(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let f=new Y(e,me(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let m=new Y(e,me(100));m.position.set(0,20,0),m.scale.set(1,.1,1),this.add(m)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function me(r){return new gi({color:0,emissive:16777215,emissiveIntensity:r})}function qi(r){let e=r>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function z(r,e=0,t=0){let i=Math.imul(r|0,374761393)+Math.imul(e|0,668265263)+Math.imul(t|0,2147483647);return i=Math.imul(i^i>>>13,1274126177),((i^i>>>16)>>>0)/4294967296}var w=r=>r-Math.floor(r),P=(r,e)=>(r%e+e)%e,I=r=>r*r*(3-2*r),O=r=>r<0?0:r>1?1:r,F=(r,e,t)=>r+(e-r)*t,$=(r,e,t)=>[F(r[0],e[0],t),F(r[1],e[1],t),F(r[2],e[2],t)],L=r=>[(r>>16&255)/255,(r>>8&255)/255,(r&255)/255],E=(r,e)=>O(Math.min(r,1-r)/e);function Ri(r,e,t){let i=new Float32Array(r*e);for(let s=0;s<i.length;s++)i[s]=t();return(s,a)=>{let o=w(s)*r,n=w(a)*e,c=Math.floor(o),l=Math.floor(n),h=I(o-c),u=I(n-l),f=(c+1)%r,m=(l+1)%e,g=i[l*r+c],M=i[l*r+f],b=i[m*r+c],p=i[m*r+f];return F(F(g,M,h),F(b,p,h),u)}}function S(r,e,t,i){let s=Array.from({length:t},(a,o)=>Ri(r<<o,e<<o,i));return(a,o)=>{let n=0,c=.5,l=0;for(let h of s)n+=h(a,o)*c,l+=c,c*=.5;return n/l}}function ne(r,e,t=.8){let i=new Float32Array(r*r*2);for(let s=0;s<r*r;s++)i[s*2]=.5+(e()-.5)*t,i[s*2+1]=.5+(e()-.5)*t;return(s,a)=>{let o=w(s)*r,n=w(a)*r,c=Math.floor(o),l=Math.floor(n),h=9,u=9,f=0;for(let m=-1;m<=1;m++)for(let g=-1;g<=1;g++){let M=c+g,b=l+m,p=P(b,r)*r+P(M,r),d=M+i[p*2],v=b+i[p*2+1],x=Math.hypot(d-o,v-n);x<h?(u=h,h=x,f=p):x<u&&(u=x)}return[h,u,f]}}function de(r,e,t,i,s=.45,a=!1){return{detail:a,make:o=>{let n=S(3,48,3,o),c=Ri(6,24,o),l=Array.from({length:r},()=>o()),h=t.map(L);return(u,f)=>{let m=Math.floor(f*r),g=w(f*r),M=u*e+l[m%r]*e,b=Math.floor(M),p=w(M),d=z(m,P(b,e),7),v=h[Math.floor(d*h.length)%h.length],x=n(u+d,f),T=c(u+d*.37,f),_=1+(d-.5)*i+(x-.5)*.35-Math.max(0,T-.8)*.8,y=Math.min(E(g,.02),E(p,.004*e)),U=_*F(s,1,y);return[v[0]*U,v[1]*U,v[2]*U,.4+.6*y-(1-x)*.05]}}}}function ze(r,e,t,i,s=.035,a=.06){return{detail:!1,make:o=>{let n=S(16,16,3,o),c=L(e),l=t===null?c:L(t),h=L(i);return(u,f)=>{let m=u*r,g=f*r,M=Math.floor(m),b=Math.floor(g),p=w(m),d=w(g),v=Math.min(E(p,s),E(d,s)),x=(M+b)%2===0?c:l,T=1+(z(P(M,r),P(b,r),3)-.5)*a+(n(u,f)-.5)*.06,_=$(h,[x[0]*T,x[1]*T,x[2]*T],v);return[_[0],_[1],_[2],v*.9+.1]}}}}function kt(r,e,t,i,s=!1){return{detail:s,make:a=>{let o=S(64,64,2,a),n=S(4,4,3,a),c=t.map(L),l=L(i);return(h,u)=>{let f=Math.floor(u*e),m=w(u*e),g=h*r+f%2*.5,M=Math.floor(g),b=w(g),p=z(P(M,r),P(f,e),11),d=Math.min(E(b,.045),E(m,.14)),v=c[Math.floor(p*c.length)%c.length],x=.88+p*.18+(o(h,u)-.5)*.3+(n(h,u)-.5)*.15,T=s?[.96+(o(h,u)-.5)*.08,.96,.95]:[v[0]*x,v[1]*x,v[2]*x],_=s?[.86,.86,.85]:[l[0]*(.9+o(h,u)*.2),l[1]*(.9+o(h,u)*.2),l[2]*(.9+o(h,u)*.2)],y=$(_,T,I(d));return[y[0],y[1],y[2],.25+.75*I(d)-o(h,u)*.08]}}}}function It(r,e,t,i){return{detail:i,make:s=>{let a=e?S(48,3,3,s):S(3,48,3,s),o=t.map(L);return(n,c)=>{let l=e?n:c,h=e?c:n,u=Math.floor(l*r),f=w(l*r),m=z(P(u,r),0,5),g=o[Math.floor(m*o.length)%o.length],M=E(f,.06),b=e?1:.82+.18*I(O(f/.25)),p=(.92+m*.12+(a(n,c)-.5)*(i?.12:.3))*b*F(.45,1,M);return[g[0]*p,g[1]*p,g[2]*p,M*(e?1:.6+.4*f)]}}}}function Ve(r,e,t=0,i=!0){return{detail:i,make:s=>{let a=S(e,e,4,s),o=S(128,128,1,s);return(n,c)=>{let l=a(n,c),h=o(n,c),u=1-r*.5+(l-.5)*r-Math.max(0,h-.7)*t;return[u,u,u,l*.6+h*(t?.8:.2)]}}}}function Di(r,e,t=0){return{detail:!0,make:i=>{let s=S(8,8,3,i),a=S(4,r,2,i);return(o,n)=>{let c=Math.sin(o*r*Math.PI*2),l=Math.sin(n*r*Math.PI*2),h=(Math.floor(o*r)+Math.floor(n*r))%2===0,u=Math.abs(h?c:l),f=.9+u*e-e*.5+(s(o,n)-.5)*.08+(a(o,n)-.5)*t;return[f,f,f,u]}}}}function at(r){return{detail:r.detail,make:e=>{let t=S(48,48,2,e),i=S(5,5,3,e),s=(r.tones??[16777215]).map(L),a=r.step??.55;return(o,n)=>{let c=Math.floor(n*r.courses),l=w(n*r.courses),h=o*r.perCourse+(r.stagger&&c%2?.5:0),u=Math.floor(h),f=w(h),m=z(P(u,r.perCourse),P(c,r.courses),21),g=1-l*a,M=F(.6,1,I(O((1-l)/.14)))*F(.82,1,I(O(l/.25)));if(r.rolls){let v=r.wave?Math.sin(f*Math.PI*2)*.5+.5*Math.sin(f*Math.PI):Math.sin(f*Math.PI*r.rolls);g+=v*r.roll*.4,M*=.9+v*r.roll*.25}r.camber&&(g+=Math.sin(f*Math.PI)*r.camber);let b=E(f,r.rolls?.02:.035);M*=F(.55,1,b);let p=s[Math.floor(m*s.length)%s.length],d=M*(1+(m-.5)*r.vary+(t(o,n)-.5)*.1+(i(o,n)-.5)*.08);return[p[0]*d,p[1]*d,p[2]*d,O(g*.8*b+(t(o,n)-.5)*.05)]}}}}var Ai={planks_light:de(13,2,[14467226,13939850,14862500,13610628],.12),planks_oak:de(13,2,[13213810,12555366,13806204,12160092],.14),planks_walnut:de(13,2,[8084033,7229240,8807242,6243120],.16),planks_grey:de(13,2,[12104362,11446174,12762292,10854037],.1),vinyl:de(8,2,[16777215],.05,.75,!0),herringbone:{detail:!1,make:r=>{let e=S(4,64,3,r),t=[12885102,12095328,13609082,11437398].map(L),i=4,s=16;return(a,o)=>{let n=a*s,c=o*s,l=Math.floor(n),h=Math.floor(c),u=w(n),f=w(c),m=P(l+h,2*i),g,M,b,p;m<i?(p=!0,g=(m+u)/i,M=f,b=z(P(l-m,s),P(h,s),1)):(p=!1,g=(m-i+f)/i,M=u,b=z(P(l,s),P(h-(m-i),s),2));let d=t[Math.floor(b*t.length)%t.length],v=p?e(a,o):e(o,a),x=Math.min(E(M,.05),E(g,.012)),T=(.92+b*.14+(v-.5)*.3)*F(.45,1,x);return[d[0]*T,d[1]*T,d[2]*T,.4+.6*x]}}},tiles_light:ze(2,14474456,null,12171184),tiles_dark:ze(2,5921888,null,4605770),tiles_terracotta:ze(4,12086603,null,13483950,.05,.16),checker:ze(4,15658730,2960945,10132118,.02,.03),tiles_metro:{detail:!0,make:r=>{let e=S(8,8,2,r);return(t,i)=>{let s=Math.floor(i*6),a=t*3+s%2*.5,o=Math.min(E(w(a),.03),E(w(i*6),.06)),n=Math.min(E(w(a),.12),E(w(i*6),.24)),c=F(.72,1,I(o))*(.97+(e(t,i)-.5)*.04);return[c,c,c,.2+.5*I(o)+.3*I(n)]}}},marble:{detail:!1,make:r=>{let e=S(4,4,5,r),t=S(8,8,3,r);return(i,s)=>{let a=Math.abs(Math.sin((i*2+s+e(i,s)*2.4)*Math.PI*2)),o=Math.pow(1-O(a/.12),2)*.5+Math.pow(1-O(Math.abs(Math.sin((s*3-i+t(i,s)*3)*Math.PI*2))/.05),2)*.25,n=Math.min(E(w(i*2),.004),E(w(s*2),.004)),c=$([.93,.925,.91],[.55,.56,.58],o),l=F(.7,1,n);return[c[0]*l,c[1]*l,c[2]*l,n]}}},carpet:{detail:!0,make:r=>{let e=S(96,96,2,r),t=S(6,6,3,r);return(i,s)=>{let a=.86+(e(i,s)-.5)*.22+(t(i,s)-.5)*.08;return[a,a,a,e(i,s)]}}},flagstone:{detail:!1,make:r=>{let e=ne(4,r,.7),t=S(24,24,3,r),i=[12169894,11117463,12893616,10393483].map(L);return(s,a)=>{let[o,n,c]=e(s,a),l=O((n-o)/.08),h=i[c%i.length],u=.9+(t(s,a)-.5)*.3+z(c)*.1,f=$([.45,.43,.4],[h[0]*u,h[1]*u,h[2]*u],I(l));return[f[0],f[1],f[2],I(l)*.8+t(s,a)*.2]}}},concrete:Ve(.16,6,.25),plaster:Ve(.05,8,0),render:Ve(.1,10,.2),pebbledash:{detail:!0,make:r=>{let e=ne(40,r,.9),t=S(8,8,2,r);return(i,s)=>{let[a,,o]=e(i,s),n=O(1-a/.5),c=.8+n*.2+(z(o)-.5)*.12+(t(i,s)-.5)*.05;return[c,c,c,n]}}},wp_stripes:{detail:!0,make:r=>{let e=S(4,16,2,r);return(t,i)=>{let s=w(t*8),a=s<.5?1:.86,o=Math.abs(s-.75)<.012?.8:1,n=a*o*(.98+(e(t,i)-.5)*.03);return[n,n,n,.5]}}},wp_damask:{detail:!0,make:()=>(r,e)=>{let t=r*2,i=e*3,s=Math.floor(i),a=w(t+s%2*.5)-.5,o=w(i)-.5,n=Math.hypot(a,o*1.3),c=Math.atan2(o,a),l=.26+.07*Math.cos(c*6)+.03*Math.cos(c*12),h=n<l?n<.08||n>.13&&n<.16?0:1:0,u=Math.abs(Math.sin((a+o)*14)*Math.sin((a-o)*14))>.92&&n>.33?1:0,f=h||u?.82:1;return[f,f,f,h||u?.6:.4]}},wp_geo:{detail:!0,make:()=>(r,e)=>{let t=w(r*4+e*3),i=w(r*4-e*3),s=Math.min(Math.abs(t-.5),Math.abs(i-.5))<.035,a=(Math.floor(r*4+e*3)+Math.floor(r*4-e*3))%2===0,o=s?.7:a?.94:1;return[o,o,o,s?.3:.5]}},wp_leaves:{detail:!0,make:r=>{let t=Array.from({length:25},()=>({x:r(),y:r(),a:r()*Math.PI,s:.7+r()*.5,t:r()}));return(i,s)=>{let a=1,o=.4,n=Math.floor(i*5),c=Math.floor(s*5);for(let l=-1;l<=1;l++)for(let h=-1;h<=1;h++){let u=n+h,f=c+l,m=t[P(f,5)*5+P(u,5)],g=(u+m.x)/5,M=(f+m.y)/5,b=(i-g)*5,p=(s-M)*5,d=Math.cos(m.a),v=Math.sin(m.a),x=(b*d+p*v)/m.s,T=(-b*v+p*d)/m.s;if(x*x/.36+T*T/.05<1){let y=Math.abs(T)<.015?.1:0;a=Math.min(a,(m.t>.5?.72:.8)+y),o=.7}}return[a,a,a,o]}}},panelling:{detail:!0,make:r=>{let e=S(6,6,2,r),t=[.05,.42,.958];return(i,s)=>{let a=w(i*4),o=Math.min(...t.map(m=>Math.abs(s-m))),n=Math.min(a,1-a)*.6,c=o*2.4,l=Math.min(n,c),h=I(O((l-.05)/.025)),u=s<.05?1:0,f=(u?.97:F(1,.93,h))*(.985+(e(i,s)-.5)*.03);return[f,f,f,u?1:1-h*.5]}}},brick_red:kt(6,18,[10902080,10112824,11822666,9325109,11364946],13222066),brick_buff:kt(6,18,[13281142,12622697,13874053,12160861],14209218),brick_painted:kt(6,18,[16777215],16777215,!0),stone_wall:{detail:!1,make:r=>{let e=S(16,16,3,r),t=[0,.16,.3,.47,.6,.77,.88,1],i=[12103064,10984584,12826788,10326655,11576462].map(L);return(s,a)=>{let o=0;for(;o<t.length-2&&a>=t[o+1];)o++;let n=t[o],c=t[o+1],l=(a-n)/(c-n),h=3+o%3,u=s*h+z(o,1)*.7,f=Math.floor(u),m=w(u),g=z(P(f,h),o,4),M=Math.min(E(m,.04),E(l,.1)),b=i[Math.floor(g*i.length)%i.length],p=.88+g*.16+(e(s,a)-.5)*.3,d=$([.62,.6,.56],[b[0]*p,b[1]*p,b[2]*p],I(M));return[d[0],d[1],d[2],I(M)*(.8+e(s,a)*.2)]}}},boards_v:It(10,!0,[11569248,10976853,12293227],!1),boards_h:It(8,!1,[16777215],!0),timber_h:It(8,!1,[10976081,10252360,11765596,9660996],!1),concrete_panels:{detail:!0,make:r=>{let e=S(6,6,4,r),t=S(96,96,1,r);return(i,s)=>{let a=w(i*2),o=w(s*2),n=Math.min(E(a,.006),E(o,.006)),c=[.2,.8].some(h=>[.2,.8].some(u=>Math.hypot(a-h,o-u)<.012))?.55:1,l=(.9+(e(i,s)-.5)*.18-Math.max(0,t(i,s)-.75)*.2)*F(.6,1,n)*c;return[l,l,l,n*c]}}},grass:{detail:!1,make:r=>{let e=S(4,4,3,r),t=S(128,128,2,r);return(i,s)=>{let a=e(i,s),o=t(i,s),n=$(L(7313992),L(10272610),a),c=.78+o*.36;return[n[0]*c,n[1]*c*(.95+a*.08),n[2]*c*.9,o]}}},patio:ze(2,13156530,null,9275261,.02,.1),deck:de(8,1,[10976082,10186568,11700061],.14,.25),pavers:{detail:!1,make:r=>{let e=S(32,32,2,r),t=[10853522,10129543,11577244,9405820].map(L);return(i,s)=>{let a=Math.floor(s*10),o=i*5+a%2*.5,n=z(P(Math.floor(o),5),P(a,10),9),c=Math.min(E(w(o),.04),E(w(s*10),.08)),l=t[Math.floor(n*t.length)%t.length],h=(.9+(e(i,s)-.5)*.25)*F(.55,1,c);return[l[0]*h,l[1]*h,l[2]*h,c]}}},block_paving:{detail:!1,make:r=>{let e=S(48,48,2,r),t=[9265229,8281167,9857359,7298389,10122076,8672840].map(L),i=L(9076848),s=2,a=16;return(o,n)=>{let c=o*a,l=n*a,h=Math.floor(c),u=Math.floor(l),f=w(c),m=w(l),g=P(h+u,2*s),M=g<s,b=M?(g+f)/s:(g-s+m)/s,p=M?m:f,d=M?z(P(h-g,a),P(u,a),5):z(P(h,a),P(u-(g-s),a),6),v=t[Math.floor(d*t.length)%t.length],x=Math.min(E(p,.07),E(b,.035)),T=Math.min(E(p,.2),E(b,.1)),_=(.94+d*.1+(e(o,n)-.5)*.2)*F(.86,1,I(T)),y=$(i,[v[0]*_,v[1]*_,v[2]*_],I(x));return[y[0],y[1],y[2],.3*I(x)+.5*I(T)+e(o,n)*.2]}}},tarmac:{detail:!1,make:r=>{let e=S(128,128,2,r),t=S(4,4,3,r);return(i,s)=>{let a=.32+(e(i,s)-.5)*.18+(t(i,s)-.5)*.06+(e(i,s)>.82?.12:0);return[a,a,a*1.02,e(i,s)]}}},soil:{detail:!1,make:r=>{let e=S(24,24,4,r);return(t,i)=>{let s=.75+e(t,i)*.5;return[.36*s,.27*s,.2*s,e(t,i)]}}},gravel:{detail:!1,make:r=>{let e=ne(48,r,.9);return(t,i)=>{let[s,a,o]=e(t,i),n=O((a-s)/.25),c=z(o),l=$([.62,.58,.52],[.86,.83,.78],c),h=F(.5,1,n)*(.9+O(1-s)*.15);return[l[0]*h,l[1]*h,l[2]*h,n*O(1-s*.8)]}}},weave:Di(110,.14),linen:Di(90,.1,.12),velvet:Ve(.08,12,0),boucle:{detail:!0,make:r=>{let e=ne(70,r,.9);return(t,i)=>{let[s]=e(t,i),a=O(1-s/.6),o=.84+a*.16;return[o,o,o,a]}}},leather:{detail:!0,make:r=>{let e=ne(36,r,.9),t=S(6,6,3,r);return(i,s)=>{let[a,o]=e(i,s),n=O((o-a)/.12),c=(.9+(t(i,s)-.5)*.16)*F(.82,1,n);return[c,c,c,n*.6+a*.2]}}},wood_grain:{detail:!0,make:r=>{let e=S(3,40,4,r);return(t,i)=>{let s=e(t,i),a=Math.abs(Math.sin((i*22+s*6)*Math.PI)),o=.86+s*.16-Math.pow(1-a,6)*.08;return[o,o,o,s]}}},wood_grain_v:{detail:!0,make:r=>{let e=S(40,3,4,r);return(t,i)=>{let s=e(t,i),a=Math.abs(Math.sin((t*22+s*6)*Math.PI)),o=.86+s*.16-Math.pow(1-a,6)*.08;return[o,o,o,s]}}},brushed:{detail:!0,make:r=>{let e=S(2,256,2,r);return(t,i)=>{let s=.92+(e(t,i)-.5)*.12;return[s,s,s,e(t,i)]}}},foliage:{detail:!0,make:r=>{let e=ne(24,r,.9),t=S(8,8,2,r);return(i,s)=>{let[a,o,n]=e(i,s),c=O((o-a)/.2),l=(.7+z(n)*.4)*F(.6,1,c)+(t(i,s)-.5)*.1;return[l,l,l,c]}}},rug:{detail:!0,make:r=>{let e=S(96,96,1,r);return(t,i)=>{let s=Math.abs(w(t*4)-.5)+Math.abs(w(i*4)-.5),a=Math.abs(w(s*3)-.5)<.12,n=(Math.abs(w(i*4)-.5)>.46?.62:a?.74:s<.18?.86:1)*(.92+e(t,i)*.1);return[n,n,n,e(t,i)]}}},canvas_art:{detail:!0,make:r=>{let e=Array.from({length:9},()=>({x:r(),y:r(),r:.08+r()*.2,t:r()})),t=S(64,64,1,r);return(i,s)=>{let a=.95;for(let o of e)Math.hypot(P(i-o.x+.5,1)-.5,P(s-o.y+.5,1)-.5)<o.r&&(a=Math.min(a,.35+o.t*.55));return[a+(t(i,s)-.5)*.04,a,a,t(i,s)*.3]}}},roof_interlocking:at({courses:5,perCourse:5,stagger:!1,rolls:2,roll:.25,vary:.08,detail:!0}),roof_plain:at({courses:12,perCourse:7,stagger:!0,rolls:0,roll:0,vary:.22,detail:!0,camber:.15}),roof_slate:at({courses:7,perCourse:6,stagger:!0,rolls:0,roll:0,vary:.12,detail:!1,tones:[4935512,4606549,5329756,4869458,5592158],step:.35}),roof_pantile:at({courses:5,perCourse:6,stagger:!1,rolls:1,roll:.75,vary:.14,detail:!0,wave:!0}),roof_thatch:{detail:!1,make:r=>{let e=S(96,6,3,r),t=S(6,6,3,r);return(i,s)=>{let a=s*6+(t(i,s)-.5)*.5,o=w(a),n=e(i,s*.5+Math.floor(a)*.37),c=(.7+n*.45)*F(.62,1,I(O(o/.3))),l=$(L(10257487),L(12888946),t(i,s));return[l[0]*c,l[1]*c,l[2]*c,n*.7+(1-o)*.3]}}},roof_seam:{detail:!0,make:r=>{let e=S(4,16,3,r);return(t,i)=>{let s=w(t*3),a=1-E(s,.03),o=.96+(e(t,i)-.5)*.05+a*.1-(1-E(s,.06))*.06;return[o,o,o,.3+a*.7+(e(t,i)-.5)*.05]}}},roof_felt:{detail:!0,make:r=>{let e=S(160,160,1,r),t=S(6,6,3,r);return(i,s)=>{let a=w(s*2),o=F(.8,1,I(O(a/.06))),n=(.9+(e(i,s)-.5)*.35+(t(i,s)-.5)*.08)*o;return[n,n,n,e(i,s)*.5+(a<.03?0:.5)]}}},roof_epdm:{detail:!1,make:r=>{let e=S(5,5,4,r);return(t,i)=>{let s=.95+(e(t,i)-.5)*.12;return[.165*s,.17*s,.18*s,e(t,i)*.3]}}},roof_grp:Ve(.05,5,.05),roof_lead:{detail:!1,make:r=>{let e=S(6,6,4,r);return(t,i)=>{let s=w(t*2.5),a=Math.max(0,1-Math.abs(s-.5)/.05),o=$(L(7304571),L(9410203),e(t,i)),n=.92+a*.15;return[o[0]*n,o[1]*n,o[2]*n,.3+a*.7]}}},roof_sedum:{detail:!1,make:r=>{let e=ne(28,r,.9),t=S(5,5,3,r),i=[6192956,8033350,9071418,10308154,7113290,11051098].map(L);return(s,a)=>{let[o,n,c]=e(s,a),l=t(s,a),h=i[Math.floor(z(c,Math.floor(l*3),9)*i.length)%i.length],u=I(O((n-o)*3)),f=.65+u*.45;return[h[0]*f,h[1]*f,h[2]*f,u]}}}},ot=new Map;function Ui(r,e,t){let i=Ai[r];if(!i)return null;let s=`${r}@${e}`,a=ot.get(s);if(a)return a;let o=i.make(qi(Ki(r))),n=document.createElement("canvas");n.width=n.height=e;let c=n.getContext("2d"),l=c.createImageData(e,e),h=new Float32Array(e*e);for(let d=0;d<e;d++){let v=1-(d+.5)/e;for(let x=0;x<e;x++){let[T,_,y,U]=o((x+.5)/e,v),C=(d*e+x)*4;l.data[C]=O(T)*255,l.data[C+1]=O(_)*255,l.data[C+2]=O(y)*255,l.data[C+3]=255,h[d*e+x]=U}}c.putImageData(l,0,0);let u=new Ue(n);u.colorSpace=i.detail?Et:Ze;let f=document.createElement("canvas");f.width=f.height=e;let m=f.getContext("2d"),g=m.createImageData(e,e),M=e/128;for(let d=0;d<e;d++)for(let v=0;v<e;v++){let x=h[d*e+P(v-1,e)],T=h[d*e+P(v+1,e)],_=h[P(d-1,e)*e+v],y=h[P(d+1,e)*e+v],U=-(T-x)*M,C=-(_-y)*M,D=Math.hypot(U,C,1),R=(d*e+v)*4;g.data[R]=(U/D*.5+.5)*255,g.data[R+1]=(C/D*.5+.5)*255,g.data[R+2]=(1/D*.5+.5)*255,g.data[R+3]=255}m.putImageData(g,0,0);let b=new Ue(f);b.colorSpace=Et;for(let d of[u,b])d.wrapS=d.wrapT=se,d.minFilter=$t,d.anisotropy=t;let p={map:u,normal:b};return ot.set(s,p),p}function Fi(r){var e;return((e=Ai[r])==null?void 0:e.detail)??!0}function Ki(r){let e=2166136261;for(let t=0;t<r.length;t++)e=Math.imul(e^r.charCodeAt(t),16777619);return e>>>0}function Ni(){var r;for(let e of ot.values())e.map.dispose(),(r=e.normal)==null||r.dispose();ot.clear()}var $i=`
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
}`,Ji=`
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
}`,es=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha * vAlpha); }`,ts=`
uniform vec3 uColor;
uniform float uAlpha;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  gl_FragColor = vec4(uColor, uAlpha * vAlpha * (1.0 - d * 3.2));
}`;function ki(r,e,t){return new G({vertexShader:r,fragmentShader:e,uniforms:t,transparent:!0,depthWrite:!1,blending:Ht,fog:!1})}var rt=class{constructor(e){this.group=new ri;this.shared={uTime:{value:0},uTop:{value:10},uHeight:{value:12},uWind:{value:new N}};this.rainU={...this.shared,uFall:{value:8},uLen:{value:.42},uColor:{value:new A(12109010)},uAlpha:{value:.32}};this.snowU={...this.shared,uFall:{value:.9},uSize:{value:.045},uScale:{value:800},uColor:{value:new A(16777215)},uAlpha:{value:.9}};this.area=null;this.key="";this.rainMax=e?9e3:4500,this.snowMax=e?7e3:3500,this.rain=new ui(new he,ki($i,es,this.rainU)),this.snow=new fi(new he,ki(Ji,ts,this.snowU));for(let t of[this.rain,this.snow])t.frustumCulled=!1,t.renderOrder=4,t.visible=!1;this.group.add(this.rain,this.snow)}setArea(e){this.area=e,this.key=""}set(e){let t=this.area,i=!!t&&(e.rain>.02||e.snow>.02);if(this.rain.visible=!!t&&e.rain>.02,this.snow.visible=!!t&&e.snow>.02,!t||!i)return!1;this.shared.uTop.value=t.top,this.shared.uHeight.value=t.top-t.ground;let s=this.rain.visible?.55:.9;this.shared.uWind.value.set(e.drift[0]*s,e.drift[1]*s),this.rainU.uColor.value.setHex(e.night?8227744:12109010),this.rainU.uAlpha.value=e.night?.32:.45,this.snowU.uColor.value.setHex(e.night?13226982:16777215);let a=[t.minX,t.maxX,t.minZ,t.maxZ,t.top,t.ground,t.rooms.length,Math.round(e.drift[0]),Math.round(e.drift[1])].map(o=>Number(o).toFixed(1)).join("|");return a!==this.key&&(this.key=a,this.build(t)),this.rain.geometry.setDrawRange(0,Math.round(this.rainMax*Math.min(1,e.rain))*2),this.snow.geometry.setDrawRange(0,Math.round(this.snowMax*Math.min(1,e.snow))),!0}tick(e,t){this.shared.uTime.value=e,this.snowU.uScale.value=t}build(e){let t=e.top-e.ground,i=this.shared.uWind.value,s=[this.rainU.uFall.value,this.snowU.uFall.value].map(p=>[i.x*(t/p/2),i.y*(t/p/2)]),a=(p,d,v)=>{for(let x of[-1,0,1]){let T=[p+v[0]*x,d+v[1]*x];if(e.rooms.some(_=>Bt(T,_)||_.some((y,U)=>zt(T,y,_[(U+1)%_.length]).d<.35)))return!1}return!0},o=Math.max(6,.45*Math.max(e.maxX-e.minX,e.maxZ-e.minZ)),n=e.minX-o,c=e.maxX+o,l=e.minZ-o,h=e.maxZ+o,u=12345,f=()=>(u=u*1103515245+12345&2147483647)/2147483647,m=(p,d)=>{let v=[];for(let x=0;v.length<p&&x<p*6;x++){let T=n+f()*(c-n),_=l+f()*(h-l);a(T,_,d)&&v.push([T,_,f(),.6+f()*.8])}return v},g=m(this.rainMax,s[0]),M=new Float32Array(g.length*8);g.forEach((p,d)=>{M.set([p[0],p[1],p[2],0,p[0],p[1],p[2],1],d*8)}),this.replace(this.rain,M);let b=m(this.snowMax,s[1]);this.replace(this.snow,new Float32Array(b.flat()))}replace(e,t){let i=new he;i.setAttribute("aSeed",new Dt(t,4)),i.setAttribute("position",new Dt(new Float32Array(t.length/4*3),3)),e.geometry.dispose(),e.geometry=i}dispose(){for(let e of[this.rain,this.snow])e.geometry.dispose(),e.material.dispose()}};var is={wood:{tex:"wood_grain",scale:.9,rough:.5,relief:.25},woodDark:{tex:"wood_grain",scale:.9,rough:.45,relief:.25},white:{rough:.45},dark:{rough:.45},metal:{tex:"brushed",scale:.5,rough:.3,metal:.85},glass:{rough:.04,opacity:.28},plant:{tex:"foliage",scale:.35,rough:.65,relief:.8},leaf:{tex:"foliage",scale:.3,rough:.6,relief:.8},pot:{tex:"plaster",scale:.5,rough:.8,relief:.3},soil:{tex:"carpet",scale:.3,rough:1},accent:{rough:.45},red:{rough:.5},blue:{rough:.5},screen:{rough:.12,metal:.2},ceramic:{rough:.1},rug:{tex:"rug",scale:1.2,rough:.95,relief:.3},mattress:{tex:"weave",scale:.3,rough:.9,relief:.2},bulb:{rough:.55},paper:{rough:.85},canvas:{tex:"canvas_art",scale:1,rough:.85,relief:.2},mirror:{rough:.02,metal:1},water:{rough:.03,opacity:.8},rubber:{rough:.85},pine:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},softwood:{tex:"wood_grain_v",scale:.6,rough:.7,relief:.15},oak:{tex:"wood_grain_v",scale:.6,rough:.5,relief:.2},walnut:{tex:"wood_grain_v",scale:.6,rough:.45,relief:.2},primed:{rough:.85},blackMetal:{rough:.4,metal:.6},concrete:{tex:"concrete",scale:.8,rough:.9,relief:.25},brick:{tex:"brick_red",scale:1.35,rough:.85,relief:.9}},ss={cap:{rough:.9},slab:{tex:"concrete",scale:3,rough:.9,relief:.2},blind:{tex:"linen",scale:.3,rough:.9,relief:.2},glass:{rough:.04,opacity:.3},pv:{rough:.38,metal:.05}},Ii={lawn:{tex:"grass",scale:2,rough:.95,relief:.4},patio:{tex:"patio",scale:1.2,rough:.8,relief:.6},deck:{tex:"deck",scale:1.2,rough:.7,relief:.6},path:{tex:"pavers",scale:1,rough:.8,relief:.6},driveway:{tex:"block_paving",scale:1.6,rough:.8,relief:.6},asphalt:{tex:"tarmac",scale:2.5,rough:.85,relief:.35},bed:{tex:"soil",scale:1.5,rough:1,relief:.6},gravel:{tex:"gravel",scale:1,rough:.9,relief:.9}};function Bi(r){let[e,t]=r.split(":"),i=Ti(r);return i?{tex:i.tex,scale:i.scale,rough:i.roughness,metal:i.metalness,relief:i.relief}:e==="role"?is[t]??{rough:.6}:e==="out"?Ii[t]??Ii.lawn:ss[e]??{rough:.6}}function as(r){let e=Bi(r);return!!e.tex&&!Fi(e.tex)}var zi={value:1},le={uFill:{value:1},uWet:{value:0},uSnow:{value:0},uTime:{value:0},uSway:{value:new N}},os=At+`
attribute vec3 aLamp;
attribute vec3 aEmis;
uniform float uIndoor;
uniform float uTime;
uniform vec2 uSway;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,rs=Ut+`
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
`,ns=wi+`
uniform float uLampGain;
uniform float uFill;
uniform float uWet;
uniform float uSnow;
varying vec3 vLamp;
varying vec3 vEmis;
varying float vOut;
varying float vUp;
`,ls=`
float vhFaceUp = smoothstep(0.5, 0.9, vUp);
float vhWet = uWet * vOut * (0.35 + 0.65 * vhFaceUp);
float vhSnow = uSnow * vOut * vhFaceUp;
diffuseColor.rgb *= 1.0 - 0.3 * vhWet;
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.95, 0.98), vhSnow * 0.94);
`,cs=`
roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.16), vhWet * vhFaceUp * (1.0 - vhSnow));
roughnessFactor = mix(roughnessFactor, 0.85, vhSnow);
`;function hs(r,e,t){r.onBeforeCompile=i=>{Object.assign(i.uniforms,e,le,{uLampGain:zi}),i.vertexShader=os+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+rs),i.fragmentShader=ns+i.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+_i+ls).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
`+cs).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += vEmis;`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
reflectedLight.indirectDiffuse *= mix(uFill, 1.0, vOut);
reflectedLight.indirectDiffuse += vLamp * material.diffuseColor * uLampGain;`)},r.customProgramCacheKey=()=>t}var us=new Set(["role:plant","role:leaf"]);function fs(r,e,t){return r.onBeforeCompile=i=>{Object.assign(i.uniforms,e),i.vertexShader=At+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+Ut)},r.customProgramCacheKey=()=>t,r}function ms(){let r=document.createElement("canvas");r.width=4,r.height=256;let e=new Ue(r);return e.colorSpace=Ze,e}function ds(r,e,t){let s=r.image.getContext("2d"),a=s.createLinearGradient(0,0,0,256);a.addColorStop(0,`#${e.getHexString()}`),a.addColorStop(1,`#${t.getHexString()}`),s.fillStyle=a,s.fillRect(0,0,4,256),r.needsUpdate=!0}var pe=(r,e,t)=>{let i=Math.max(0,Math.min(1,(t-r)/(e-r)));return i*i*(3-2*i)},nt=(r,e,t)=>new A(r).lerp(new A(e),Math.max(0,Math.min(1,t))),Ot=new k(-.45,.78,.45).normalize();function Oi(r,e,t){let i=(r-t)*Math.PI/180,s=e*Math.PI/180;return new k(Math.sin(i)*Math.cos(s),Math.sin(s),-Math.cos(i)*Math.cos(s)).normalize()}function ps(){try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}}var Li=class{constructor(e,t,i,s){this.renderer=e;this.scene=t;this.camera=i;this.groundMaterial=new ue({color:13226434,roughness:1});this.castOnly=new Xe({colorWrite:!1,depthWrite:!1,side:_t});this.sun=new Mi(16773596,2.6);this.skyTex=ms();this.skyPainted="";this.materialsByFloor=new Map;this.registered=new Map;this.sky=null;this.north=0;this.nextFlash=0;this.flash=null;this.envBase=.55;this.haze={fog:0,gloom:0};this.calm=ps();this.falling=!1;this.composer=null;this.gtao=null;this.bloom=null;this.normalTarget=null;this.sunDir=Ot.clone();this.centre=new k;this.radius=10;this.box=new ci(new k(-5,0,-5),new k(5,3,5));this.groundY=0;this.night=!1;this.ultra=s,this.texSize=s?1024:512,this.aniso=Math.min(s?16:8,e.capabilities.getMaxAnisotropy()),e.toneMapping=Qe,e.toneMappingExposure=1,e.shadowMap.enabled=!0,e.shadowMap.type=Vt,e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;let a=new Si(e);this.envTex=a.fromScene(new st,.04).texture,a.dispose(),t.environment=this.envTex,this.sun.castShadow=!0;let o=s?4096:2048;this.sun.shadow.mapSize.set(o,o),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=3,t.add(this.sun,this.sun.target),this.groundMaterial.envMapIntensity=.8,this.fx=new rt(s),t.add(this.fx.group),t.background=this.skyTex,s&&this.setupComposer(),this.setNight(!1)}geometry(e){let t=e.surfaces.map(i=>as(i));return e.toRealisticGeometry(i=>t[i]??!1)}materials(e,t){let i=this.materialsByFloor.get(t);return i||(i=new Map,this.materialsByFloor.set(t,i)),e.surfaces.map(s=>{let a=i.get(s);return a||(a=this.makeMaterial(s,t),i.set(s,a)),a})}makeMaterial(e,t){let i=Bi(e),s=new ue({vertexColors:!0,roughness:i.rough,metalness:i.metal??0});if(i.tex){let o=Ui(i.tex,this.texSize,this.aniso);if(o){let n=1/(i.scale??1);s.map=o.map.clone(),s.map.repeat.set(n,n),o.normal&&(i.relief??0)>0&&(s.normalMap=o.normal.clone(),s.normalMap.repeat.set(n,n),s.normalScale.set(i.relief,-i.relief))}}i.opacity!==void 0&&(s.transparent=!0,s.opacity=i.opacity,s.depthWrite=!1),e==="glass"&&(s.side=_t,s.forceSinglePass=!0);let a=us.has(e);return a&&(s.defines={VH_SWAY:1}),hs(s,t,a?"vh-std-sway":"vh-std"),s}glassMaterial(e,t){return this.materials(e,t)[0]}attach(e,t,i){if(e.castShadow=i,e.receiveShadow=!0,this.ultra){let s=fs(new Fe,t,"vh-normal");s.blending=W,this.registered.set(e,{mesh:e,normal:s})}this.markShadows()}attachGround(e){if(e.receiveShadow=!0,this.ultra){let t=new Fe;t.blending=W,this.registered.set(e,{mesh:e,normal:t})}}detach(e){let t=this.registered.get(e);t&&(t.normal.dispose(),this.registered.delete(e))}releaseFloor(e){var t,i,s;for(let a of((t=this.materialsByFloor.get(e))==null?void 0:t.values())??[]){let o=a;(i=o.map)==null||i.dispose(),(s=o.normalMap)==null||s.dispose(),a.dispose()}this.materialsByFloor.delete(e)}setNight(e){this.night=e,zi.value=e?.5:.28,this.bloom&&(this.bloom.strength=e?.32:.12),this.applySky()}setSun(e,t,i){this.setSky({...this.sky??Pi(),sun:e===null||t===null?null:{azimuth:e,elevation:t}},i)}setSky(e,t){this.sky=e,this.north=t,this.applySky()}applySky(){let e=this.sky,t=this.night,i=(e==null?void 0:e.cloud)??.2,s=(e==null?void 0:e.rain)??0,a=(e==null?void 0:e.snow)??0,o=(e==null?void 0:e.fog)??0,n=!!(e!=null&&e.storm),c=Math.max(s*.65,n?.6:0,a*.25,o*.2),l=(e==null?void 0:e.sun)??null,h=this.sun.shadow,u=40;if(t){let f=(e==null?void 0:e.moon)??null,m=!!f&&f.elevation>2;this.sunDir.copy(m?Oi(f.azimuth,f.elevation,this.north):Ot),this.sun.intensity=(m?.38*(.3+.7*f.lit):.2)*(1-.7*i),this.sun.color.setHex(9348863),h.intensity=(m?.65:.3)*(1-.8*i),h.radius=4+6*i,this.envBase=.05+.025*i,le.uFill.value=1}else{let f=!!l&&l.elevation>-1;u=f?l.elevation:40,this.sunDir.copy(f?Oi(l.azimuth,Math.max(.5,u),this.north):Ot);let m=pe(-1,3,u)*(.35+.65*pe(2,30,u));this.sun.intensity=3.2*m*(1-.9*i)*(1-.3*c);let g=new A().setRGB(...yi(2300+3300*pe(1,28,u)));this.sun.color.copy(g.lerp(new A(16054010),i*.8)),h.intensity=Math.max(.06,1-.9*i),h.radius=3+7*i,this.envBase=(.25+.4*i)*(.6+.4*pe(-1,12,u))*(1-.32*c),le.uFill.value=1+.75*(1-i)}this.scene.environmentIntensity=this.envBase,this.renderer.toneMappingExposure=1,this.paintSky(u,i,c,o),this.ground(e),le.uWet.value=(e==null?void 0:e.wet)??0,le.uSnow.value=(e==null?void 0:e.snowCover)??0,this.placeSun()}paintSky(e,t,i,s){let a,o;if(this.night)a=nt(395798,1053726,t),o=nt(1581370,2501430,t);else{a=nt(12177640,11713219,t).lerp(new A(6712952),i),o=nt(15659764,14343906,t).lerp(new A(10791601),i);let l=1-pe(1,12,e);o.lerp(new A(16109476),l*(1-t)*.75),a.lerp(new A(7440819),(1-pe(-1,6,e))*.5)}if(s>0){let l=new A(this.night?2764602:14014940);a.lerp(l,s*.85),o.lerp(l,s)}let n=a.getHexString()+o.getHexString();n!==this.skyPainted&&(this.skyPainted=n,ds(this.skyTex,a,o)),this.haze={fog:s,gloom:i};let c=this.scene.fog;c?c.color.copy(o):this.scene.fog=new ni(o.getHex(),1,2),this.placeFog()}placeFog(){let e=this.scene.fog;if(!e)return;let t=this.radius,i=this.camera.position.distanceTo(this.centre),{fog:s,gloom:a}=this.haze;e.near=Math.max(.5,i+t*(1.5-1.9*s)*(1-.3*a)),e.far=i+t*(5-3.6*s)*(1-.25*a)}ground(e){let t=new A(this.night?2765606:13029309),i=(e==null?void 0:e.wet)??0,s=(e==null?void 0:e.snowCover)??0;t.multiplyScalar(1-.25*i).lerp(new A(this.night?8226710:15659766),s),this.groundMaterial.color.copy(t),this.groundMaterial.roughness=s>.5?.9:1-.45*i}fit(e,t){this.box.copy(e),this.groundY=t,e.getCenter(this.centre);let i=e.getSize(new k);this.radius=Math.max(6,Math.hypot(i.x,i.z)/2),this.applySky()}placeSun(){let e=this.sunDir,t=this.box.getSize(new k).length();this.sun.target.position.copy(this.centre),this.sun.position.copy(this.centre).addScaledVector(e,t+20),this.sun.target.updateMatrixWorld(),this.sun.updateMatrixWorld();let i=this.sun.shadow.camera;i.position.copy(this.sun.position),i.lookAt(this.centre),i.updateMatrixWorld();let s=i.matrixWorldInverse,a=this.box,o=1/0,n=1/0,c=1/0,l=-1/0,h=-1/0,u=-1/0,f=new k,m=b=>{f.copy(b).applyMatrix4(s),o=Math.min(o,f.x),l=Math.max(l,f.x),n=Math.min(n,f.y),h=Math.max(h,f.y),c=Math.min(c,f.z),u=Math.max(u,f.z)},g=e.y>.01?1/e.y:100;for(let b of[a.min.x,a.max.x])for(let p of[a.min.y,a.max.y])for(let d of[a.min.z,a.max.z]){let v=new k(b,p,d);m(v),m(v.addScaledVector(e,-Math.min(150,Math.max(0,p-this.groundY)*g)))}let M=.6;i.left=o-M,i.right=l+M,i.bottom=n-M,i.top=h+M,i.near=Math.max(.1,-u-2),i.far=-c+2,i.updateProjectionMatrix(),this.markShadows()}setWeatherArea(e){this.fx.setArea(e),this.applyFx()}applyFx(){let e=this.sky;if(!e){this.falling=this.fx.set({rain:0,snow:0,drift:[0,0],night:this.night});return}let t=(e.windFrom+180-this.north)*Math.PI/180,i=[Math.sin(t)*e.wind,-Math.cos(t)*e.wind],s=this.calm?0:Math.min(1,Math.max(0,(e.wind-4)/10))*.05;le.uSway.value.set(Math.sin(t)*s,-Math.cos(t)*s),this.falling=this.fx.set({rain:e.rain,snow:e.snow,drift:i,night:this.night})}animate(e){if(this.calm)return 0;let t=this.sky,i=!!t&&t.wind>6;if(le.uTime.value=e/1e3,this.falling){let a=this.renderer.getDrawingBufferSize(new N);this.fx.tick(e/1e3,a.y/(2*Math.tan(this.camera.fov*Math.PI/360)))}let s=!1;if(t!=null&&t.storm){if(this.nextFlash||(this.nextFlash=e+3e3+Math.random()*7e3),!this.flash&&e>=this.nextFlash&&(this.flash={start:e}),this.flash){let a=(e-this.flash.start)/1e3,o=a<.08?a/.08:a<.16?1-(a-.08)/.16:a<.22?.5+(a-.16)/.12:Math.max(0,1-(a-.22)/.25);a>.5?this.endFlash(e+1e4+Math.random()*3e4):(this.scene.environmentIntensity=this.envBase+(this.night?.5:.9)*o,this.scene.backgroundIntensity=1+.6*o,s=!0)}}else(this.flash||this.nextFlash)&&this.endFlash(0);return this.falling||i||s?33:t!=null&&t.storm?Math.max(33,this.nextFlash-e):0}endFlash(e){this.flash=null,this.nextFlash=e,this.scene.environmentIntensity=this.envBase,this.scene.backgroundIntensity=1}markShadows(){this.renderer.shadowMap.needsUpdate=!0}setupComposer(){let e=new X(1,1,{type:Z,samples:4});this.composer=new $e(this.renderer,e),this.composer.addPass(new Je(this.scene,this.camera)),this.gtao=new Le(this.scene,this.camera,1,1),this.gtao._renderGBuffer=!1,this.normalTarget=this.gtao.normalRenderTarget,this.gtao.updateGtaoMaterial({radius:.45,distanceExponent:1.6,thickness:1.2,scale:1,samples:12}),this.gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:4,rings:2,samples:12}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao),this.bloom=new fe(new N(1,1),.12,.35,.98),this.composer.addPass(this.bloom),this.composer.addPass(new it)}setSize(e,t,i){var s;this.composer&&(this.composer.setPixelRatio(i),this.composer.setSize(e,t),(s=this.gtao)==null||s.setSize(Math.max(1,Math.round(e*i/2)),Math.max(1,Math.round(t*i/2))))}render(){if(this.placeFog(),!this.composer){this.renderer.render(this.scene,this.camera);return}this.renderNormals(),this.composer.render()}renderNormals(){let e=[],t=[];this.scene.traverseVisible(l=>{let h=l;if(!h.isMesh)return;let u=this.registered.get(h);u?(t.push([h,h.material]),h.material=u.normal):e.push(l)});for(let l of e)l.visible=!1;let i=this.scene.background,s=this.scene.fog;this.scene.background=null,this.scene.fog=null;let a=this.renderer.shadowMap.enabled;this.renderer.shadowMap.enabled=!1;let o=this.renderer.getRenderTarget(),n=new A;this.renderer.getClearColor(n);let c=this.renderer.getClearAlpha();this.renderer.setRenderTarget(this.normalTarget),this.renderer.setClearColor(7829503,1),this.renderer.clear(),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(o),this.renderer.setClearColor(n,c),this.renderer.shadowMap.enabled=a,this.scene.background=i,this.scene.fog=s;for(let l of e)l.visible=!0;for(let[l,h]of t)l.material=h}dispose(){var e,t,i;for(let s of[...this.materialsByFloor.keys()])this.releaseFloor(s);for(let s of this.registered.values())s.normal.dispose();this.registered.clear(),this.scene.remove(this.sun,this.sun.target),this.sun.dispose(),this.envTex.dispose(),this.skyTex.dispose(),this.groundMaterial.dispose(),this.castOnly.dispose(),this.scene.remove(this.fx.group),this.fx.dispose(),this.scene.environment=null,this.scene.fog=null,(e=this.composer)==null||e.dispose(),(t=this.gtao)==null||t.dispose(),(i=this.bloom)==null||i.dispose(),Ni(),this.renderer.shadowMap.enabled=!1,this.renderer.toneMapping=0}};export{Li as RealisticLook,as as fullColour,Oi as skyDirection};
