import{B as Tm,C as Rm,F as Cm,O as Im,P as Kt,Q as Vo,R as zo,S as hr,U as wi,V as Bf,a as O_,m as Ff,q as Am,r as kc,s as Vc,v as Em,w as Of,z as Jn}from"./chunk-73QM76PP.js";var Dd="186",G0={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},H0={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Nd=0,Vh=1,Ud=2,W0=3,X0=0,xo=1,Fd=2,Ks=3,ki=0,un=1,Nn=2,ri=0,js=1,zh=2,Gh=3,Hh=4,Od=5,q0=6,ps=100,Bd=101,kd=102,Vd=103,zd=104,Gd=200,Hd=201,Wd=202,Xd=203,Wh=204,Xh=205,qd=206,Yd=207,Zd=208,Jd=209,$d=210,Kd=211,jd=212,Qd=213,ep=214,la=0,ca=1,ua=2,Fs=3,ha=4,fa=5,da=6,pa=7,_o=0,tp=1,np=2,Wn=0,qh=1,Yh=2,Zh=3,Jh=4,$h=5,Kh=6,jh=7,Iu="attached",ip="detached",Rl=300,oi=301,Vi=302,yo=303,vo=304,Qs=306,Nr=1e3,xn=1001,Ur=1002,Ct=1003,Qh=1004,Y0=1004,er=1005,Z0=1005,wt=1006,bo=1007,J0=1007,ai=1008,$0=1008,bn=1009,ef=1010,tf=1011,tr=1012,Cl=1013,Un=1014,ln=1015,Xn=1016,Il=1017,Pl=1018,nr=1020,nf=35902,sf=35899,rf=1021,of=1022,cn=1023,ni=1026,zi=1027,Ll=1028,Mo=1029,Gi=1030,Dl=1031,K0=1032,Nl=1033,So=33776,wo=33777,Ao=33778,Eo=33779,Ul=35840,Fl=35841,Ol=35842,Bl=35843,kl=36196,Vl=37492,zl=37496,Gl=37488,Hl=37489,To=37490,Wl=37491,Xl=37808,ql=37809,Yl=37810,Zl=37811,Jl=37812,$l=37813,Kl=37814,jl=37815,Ql=37816,ec=37817,tc=37818,nc=37819,ic=37820,sc=37821,rc=36492,oc=36494,ac=36495,lc=36283,cc=36284,Ro=36285,uc=36286,sp=2200,rp=2201,op=2202,Fr=2300,ma=2301,na=2302,Pu=2303,ns=2400,is=2401,Or=2402,hc=2500,af=2501,j0=0,Q0=1,eg=2,ap=3200,tg=3201,ng=3202,ig=3203,vi=0,lp=1,bi="",mn="srgb",Br="srgb-linear",kr="linear",dt="srgb",sg="",rg="rg",og="ga",ag=0,ia=7680,lg=7681,cg=7682,ug=7683,hg=34055,fg=34056,dg=5386,pg=512,mg=513,gg=514,xg=515,_g=516,yg=517,vg=518,cp=519,up=512,hp=513,fp=514,fc=515,dp=516,pp=517,dc=518,mp=519,pc=35044,bg=35048,Mg=35040,Sg=35045,wg=35049,Ag=35041,Eg=35046,Tg=35050,Rg=35042,Cg="100",lf="300 es",wn=2e3,ss=2001,Ig={COMPUTE:"compute",RENDER:"render"},Pg={PERSPECTIVE:"perspective",LINEAR:"linear",FLAT:"flat"},Lg={NORMAL:"normal",CENTROID:"centroid",SAMPLE:"sample",FIRST:"first",EITHER:"either"},Dg={TEXTURE_COMPARE:"depthTextureCompare"},Ng={NONE:0,SHARED:1,FULL:2};function B_(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}var k_={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};function Lr(i,e){return new k_[i](e)}function Ug(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Vr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function gp(){let i=Vr("canvas");return i.style.display="block",i}var Pm={},rs=null;function Fg(i){rs=i}function Og(){return rs}function zr(...i){let e="THREE."+i.shift();rs?rs("log",e,...i):console.log(e,...i)}function Bg(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function _e(...i){i=Bg(i);let e="THREE."+i.shift();if(rs)rs("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function ke(...i){i=Bg(i);let e="THREE."+i.shift();if(rs)rs("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function gi(...i){let e=i.join(" ");e in Pm||(Pm[e]=!0,_e(...i))}function kg(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Vg={[la]:ca,[ua]:da,[ha]:pa,[Fs]:fa,[ca]:la,[da]:ua,[pa]:ha,[fa]:Fs},An=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Lm=1234567,Us=Math.PI/180,Os=180/Math.PI;function Ln(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(rn[i&255]+rn[i>>8&255]+rn[i>>16&255]+rn[i>>24&255]+"-"+rn[e&255]+rn[e>>8&255]+"-"+rn[e>>16&15|64]+rn[e>>24&255]+"-"+rn[t&63|128]+rn[t>>8&255]+"-"+rn[t>>16&255]+rn[t>>24&255]+rn[n&255]+rn[n>>8&255]+rn[n>>16&255]+rn[n>>24&255]).toLowerCase()}function Je(i,e,t){return Math.max(e,Math.min(t,i))}function xp(i,e){return(i%e+e)%e}function V_(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function z_(i,e,t){return i!==e?(t-i)/(e-i):0}function sa(i,e,t){return(1-t)*i+t*e}function G_(i,e,t,n){return sa(i,e,1-Math.exp(-t*n))}function H_(i,e=1){return e-Math.abs(xp(i,e*2)-e)}function W_(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function X_(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function q_(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Y_(i,e){return i+Math.random()*(e-i)}function Z_(i){return i*(.5-Math.random())}function J_(i){i!==void 0&&(Lm=i);let e=Lm+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function $_(i){return i*Us}function K_(i){return i*Os}function j_(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Q_(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function ey(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function ty(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),u=o((e+n)/2),f=r((e-n)/2),h=o((e-n)/2),d=r((n-e)/2),p=o((n-e)/2);switch(s){case"XYX":i.set(a*u,l*f,l*h,a*c);break;case"YZY":i.set(l*h,a*u,l*f,a*c);break;case"ZXZ":i.set(l*f,l*h,a*u,a*c);break;case"XZX":i.set(a*u,l*p,l*d,a*c);break;case"YXY":i.set(l*d,a*u,l*p,a*c);break;case"ZYZ":i.set(l*p,l*d,a*u,a*c);break;default:_e("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function gn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function it(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var zg={DEG2RAD:Us,RAD2DEG:Os,generateUUID:Ln,clamp:Je,euclideanModulo:xp,mapLinear:V_,inverseLerp:z_,lerp:sa,damp:G_,pingpong:H_,smoothstep:W_,smootherstep:X_,randInt:q_,randFloat:Y_,randFloatSpread:Z_,seededRandom:J_,degToRad:$_,radToDeg:K_,isPowerOfTwo:j_,ceilPowerOfTwo:Q_,floorPowerOfTwo:ey,setQuaternionFromProperEuler:ty,normalize:it,denormalize:gn},wp=class wp{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};wp.prototype.isVector2=!0;var oe=wp,Zt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],f=n[s+3],h=r[o+0],d=r[o+1],p=r[o+2],x=r[o+3];if(f!==x||l!==h||c!==d||u!==p){let m=l*h+c*d+u*p+f*x;m<0&&(h=-h,d=-d,p=-p,x=-x,m=-m);let g=1-a;if(m<.9995){let y=Math.acos(m),S=Math.sin(y);g=Math.sin(g*y)/S,a=Math.sin(a*y)/S,l=l*g+h*a,c=c*g+d*a,u=u*g+p*a,f=f*g+x*a}else{l=l*g+h*a,c=c*g+d*a,u=u*g+p*a,f=f*g+x*a;let y=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=y,c*=y,u*=y,f*=y}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],f=r[o],h=r[o+1],d=r[o+2],p=r[o+3];return e[t]=a*p+u*f+l*d-c*h,e[t+1]=l*p+u*h+c*f-a*d,e[t+2]=c*p+u*d+a*h-l*f,e[t+3]=u*p-a*f-l*h-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),f=a(r/2),h=l(n/2),d=l(s/2),p=l(r/2);switch(o){case"XYZ":this._x=h*u*f+c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f-h*d*p;break;case"YXZ":this._x=h*u*f+c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f+h*d*p;break;case"ZXY":this._x=h*u*f-c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f-h*d*p;break;case"ZYX":this._x=h*u*f-c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f+h*d*p;break;case"YZX":this._x=h*u*f+c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f-h*d*p;break;case"XZY":this._x=h*u*f-c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f+h*d*p;break;default:_e("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],f=t[10],h=n+a+f;if(h>0){let d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(o-s)*d}else if(n>a&&n>f){let d=2*Math.sqrt(1+n-a-f);this._w=(u-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+c)/d}else if(a>f){let d=2*Math.sqrt(1+a-n-f);this._w=(r-c)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+f-n-a);this._w=(o-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Je(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Ap=class Ap{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Dm.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Dm.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),u=2*(a*t-r*s),f=2*(r*n-o*t);return this.x=t+l*c+o*f-a*u,this.y=n+l*u+a*c-r*f,this.z=s+l*f+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return kf.copy(this).projectOnVector(e),this.sub(kf)}reflect(e){return this.sub(kf.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ap.prototype.isVector3=!0;var N=Ap,kf=new N,Dm=new Zt,Ep=class Ep{constructor(e,t,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],f=n[7],h=n[2],d=n[5],p=n[8],x=s[0],m=s[3],g=s[6],y=s[1],S=s[4],v=s[7],M=s[2],b=s[5],E=s[8];return r[0]=o*x+a*y+l*M,r[3]=o*m+a*S+l*b,r[6]=o*g+a*v+l*E,r[1]=c*x+u*y+f*M,r[4]=c*m+u*S+f*b,r[7]=c*g+u*v+f*E,r[2]=h*x+d*y+p*M,r[5]=h*m+d*S+p*b,r[8]=h*g+d*v+p*E,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=u*o-a*c,h=a*l-u*r,d=c*r-o*l,p=t*f+n*h+s*d;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return e[0]=f*x,e[1]=(s*c-u*n)*x,e[2]=(a*n-s*o)*x,e[3]=h*x,e[4]=(u*t-s*l)*x,e[5]=(s*r-a*t)*x,e[6]=d*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return gi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Vf.makeScale(e,t)),this}rotate(e){return gi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Vf.makeRotation(-e)),this}translate(e,t){return gi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Vf.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Ep.prototype.isMatrix3=!0;var Qe=Ep,Vf=new Qe,Nm=new Qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Um=new Qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ny(){let i={enabled:!0,workingColorSpace:Br,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===dt&&(s.r=Di(s.r),s.g=Di(s.g),s.b=Di(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===dt&&(s.r=Dr(s.r),s.g=Dr(s.g),s.b=Dr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===bi?kr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return gi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return gi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Br]:{primaries:e,whitePoint:n,transfer:kr,toXYZ:Nm,fromXYZ:Um,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:mn},outputColorSpaceConfig:{drawingBufferColorSpace:mn}},[mn]:{primaries:e,whitePoint:n,transfer:dt,toXYZ:Nm,fromXYZ:Um,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:mn}}}),i}var at=ny();function Di(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Dr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var fr,ga=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{fr===void 0&&(fr=Vr("canvas")),fr.width=e.width,fr.height=e.height;let s=fr.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=fr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Vr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Di(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Di(t[n]/255)*255):t[n]=Di(t[n]);return{data:t,width:e.width,height:e.height}}else return _e("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},iy=0,zn=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:iy++}),this.uuid=Ln(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(zf(s[o].image)):r.push(zf(s[o]))}else r=zf(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function zf(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ga.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(_e("Texture: Unable to serialize Texture."),{})}var Lu=class extends zn{constructor(e=null){gi('Source: "Source" has been renamed to "TextureSource". Please update your code to use "THREE.TextureSource" instead.'),super(e),this.isSource=!0}},sy=0,Gf=new N,It=class i extends An{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=xn,s=xn,r=wt,o=ai,a=cn,l=bn,c=i.DEFAULT_ANISOTROPY,u=bi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sy++}),this.uuid=Ln(),this.name="",this.source=new zn(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new oe(0,0),this.repeat=new oe(1,1),this.center=new oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Gf).x}get height(){return this.source.getSize(Gf).y}get depth(){return this.source.getSize(Gf).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){_e(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){_e(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Rl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Nr:e.x=e.x-Math.floor(e.x);break;case xn:e.x=e.x<0?0:1;break;case Ur:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Nr:e.y=e.y-Math.floor(e.y);break;case xn:e.y=e.y<0?0:1;break;case Ur:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};It.DEFAULT_IMAGE=null;It.DEFAULT_MAPPING=Rl;It.DEFAULT_ANISOTROPY=1;var Tp=class Tp{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],f=l[8],h=l[1],d=l[5],p=l[9],x=l[2],m=l[6],g=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-x)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+x)<.1&&Math.abs(p+m)<.1&&Math.abs(c+d+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(c+1)/2,v=(d+1)/2,M=(g+1)/2,b=(u+h)/4,E=(f+x)/4,_=(p+m)/4;return S>v&&S>M?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=b/n,r=E/n):v>M?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=b/s,r=_/s):M<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),n=E/r,s=_/r),this.set(n,s,r,t),this}let y=Math.sqrt((m-p)*(m-p)+(f-x)*(f-x)+(h-u)*(h-u));return Math.abs(y)<.001&&(y=1),this.x=(m-p)/y,this.y=(f-x)/y,this.z=(h-u)/y,this.w=Math.acos((c+d+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this.w=Je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this.w=Je(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Tp.prototype.isVector4=!0;var _t=Tp,Gr=class extends An{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:wt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new _t(0,0,e,t),this.scissorTest=!1,this.viewport=new _t(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new It(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:wt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new zn(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qt=class extends Gr{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Bs=class extends It{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Du=class extends Qt{constructor(e=1,t=1,n=1,s={}){super(e,t,s),this.isWebGLArrayRenderTarget=!0,this.depth=n,this.texture=new Bs(null,e,t,n),this._setTextureOptions(s),this.texture.isRenderTargetTexture=!0}},ks=class extends It{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ct,this.minFilter=Ct,this.wrapR=xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Nu=class extends Qt{constructor(e=1,t=1,n=1,s={}){super(e,t,s),this.isWebGL3DRenderTarget=!0,this.depth=n,this.texture=new ks(null,e,t,n),this._setTextureOptions(s),this.texture.isRenderTargetTexture=!0}},kh=class kh{constructor(e,t,n,s,r,o,a,l,c,u,f,h,d,p,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,u,f,h,d,p,x,m)}set(e,t,n,s,r,o,a,l,c,u,f,h,d,p,x,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=u,g[10]=f,g[14]=h,g[3]=d,g[7]=p,g[11]=x,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new kh().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/dr.setFromMatrixColumn(e,0).length(),r=1/dr.setFromMatrixColumn(e,1).length(),o=1/dr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let h=o*u,d=o*f,p=a*u,x=a*f;t[0]=l*u,t[4]=-l*f,t[8]=c,t[1]=d+p*c,t[5]=h-x*c,t[9]=-a*l,t[2]=x-h*c,t[6]=p+d*c,t[10]=o*l}else if(e.order==="YXZ"){let h=l*u,d=l*f,p=c*u,x=c*f;t[0]=h+x*a,t[4]=p*a-d,t[8]=o*c,t[1]=o*f,t[5]=o*u,t[9]=-a,t[2]=d*a-p,t[6]=x+h*a,t[10]=o*l}else if(e.order==="ZXY"){let h=l*u,d=l*f,p=c*u,x=c*f;t[0]=h-x*a,t[4]=-o*f,t[8]=p+d*a,t[1]=d+p*a,t[5]=o*u,t[9]=x-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let h=o*u,d=o*f,p=a*u,x=a*f;t[0]=l*u,t[4]=p*c-d,t[8]=h*c+x,t[1]=l*f,t[5]=x*c+h,t[9]=d*c-p,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let h=o*l,d=o*c,p=a*l,x=a*c;t[0]=l*u,t[4]=x-h*f,t[8]=p*f+d,t[1]=f,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=d*f+p,t[10]=h-x*f}else if(e.order==="XZY"){let h=o*l,d=o*c,p=a*l,x=a*c;t[0]=l*u,t[4]=-f,t[8]=c*u,t[1]=h*f+x,t[5]=o*u,t[9]=d*f-p,t[2]=p*f-d,t[6]=a*u,t[10]=x*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ry,e,oy)}lookAt(e,t,n){let s=this.elements;return In.subVectors(e,t),In.lengthSq()===0&&(In.z=1),In.normalize(),$i.crossVectors(n,In),$i.lengthSq()===0&&(Math.abs(n.z)===1?In.x+=1e-4:In.z+=1e-4,In.normalize(),$i.crossVectors(n,In)),$i.normalize(),zc.crossVectors(In,$i),s[0]=$i.x,s[4]=zc.x,s[8]=In.x,s[1]=$i.y,s[5]=zc.y,s[9]=In.y,s[2]=$i.z,s[6]=zc.z,s[10]=In.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],f=n[5],h=n[9],d=n[13],p=n[2],x=n[6],m=n[10],g=n[14],y=n[3],S=n[7],v=n[11],M=n[15],b=s[0],E=s[4],_=s[8],A=s[12],R=s[1],L=s[5],I=s[9],P=s[13],C=s[2],U=s[6],B=s[10],z=s[14],j=s[3],q=s[7],k=s[11],H=s[15];return r[0]=o*b+a*R+l*C+c*j,r[4]=o*E+a*L+l*U+c*q,r[8]=o*_+a*I+l*B+c*k,r[12]=o*A+a*P+l*z+c*H,r[1]=u*b+f*R+h*C+d*j,r[5]=u*E+f*L+h*U+d*q,r[9]=u*_+f*I+h*B+d*k,r[13]=u*A+f*P+h*z+d*H,r[2]=p*b+x*R+m*C+g*j,r[6]=p*E+x*L+m*U+g*q,r[10]=p*_+x*I+m*B+g*k,r[14]=p*A+x*P+m*z+g*H,r[3]=y*b+S*R+v*C+M*j,r[7]=y*E+S*L+v*U+M*q,r[11]=y*_+S*I+v*B+M*k,r[15]=y*A+S*P+v*z+M*H,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],f=e[6],h=e[10],d=e[14],p=e[3],x=e[7],m=e[11],g=e[15],y=l*d-c*h,S=a*d-c*f,v=a*h-l*f,M=o*d-c*u,b=o*h-l*u,E=o*f-a*u;return t*(x*y-m*S+g*v)-n*(p*y-m*M+g*b)+s*(p*S-x*M+g*E)-r*(p*v-x*b+m*E)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],u=e[10];return t*(o*u-a*c)-n*(r*u-a*l)+s*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=e[9],h=e[10],d=e[11],p=e[12],x=e[13],m=e[14],g=e[15],y=t*a-n*o,S=t*l-s*o,v=t*c-r*o,M=n*l-s*a,b=n*c-r*a,E=s*c-r*l,_=u*x-f*p,A=u*m-h*p,R=u*g-d*p,L=f*m-h*x,I=f*g-d*x,P=h*g-d*m,C=y*P-S*I+v*L+M*R-b*A+E*_;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/C;return e[0]=(a*P-l*I+c*L)*U,e[1]=(s*I-n*P-r*L)*U,e[2]=(x*E-m*b+g*M)*U,e[3]=(h*b-f*E-d*M)*U,e[4]=(l*R-o*P-c*A)*U,e[5]=(t*P-s*R+r*A)*U,e[6]=(m*v-p*E-g*S)*U,e[7]=(u*E-h*v+d*S)*U,e[8]=(o*I-a*R+c*_)*U,e[9]=(n*R-t*I-r*_)*U,e[10]=(p*b-x*v+g*y)*U,e[11]=(f*v-u*b-d*y)*U,e[12]=(a*A-o*L-l*_)*U,e[13]=(t*L-n*A+s*_)*U,e[14]=(x*S-p*M-m*y)*U,e[15]=(u*M-f*S+h*y)*U,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,f=a+a,h=r*c,d=r*u,p=r*f,x=o*u,m=o*f,g=a*f,y=l*c,S=l*u,v=l*f,M=n.x,b=n.y,E=n.z;return s[0]=(1-(x+g))*M,s[1]=(d+v)*M,s[2]=(p-S)*M,s[3]=0,s[4]=(d-v)*b,s[5]=(1-(h+g))*b,s[6]=(m+y)*b,s[7]=0,s[8]=(p+S)*E,s[9]=(m-y)*E,s[10]=(1-(h+x))*E,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=dr.set(s[0],s[1],s[2]).length(),a=dr.set(s[4],s[5],s[6]).length(),l=dr.set(s[8],s[9],s[10]).length();r<0&&(o=-o),$n.copy(this);let c=1/o,u=1/a,f=1/l;return $n.elements[0]*=c,$n.elements[1]*=c,$n.elements[2]*=c,$n.elements[4]*=u,$n.elements[5]*=u,$n.elements[6]*=u,$n.elements[8]*=f,$n.elements[9]*=f,$n.elements[10]*=f,t.setFromRotationMatrix($n),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,s,r,o,a=wn,l=!1){let c=this.elements,u=2*r/(t-e),f=2*r/(n-s),h=(t+e)/(t-e),d=(n+s)/(n-s),p,x;if(l)p=r/(o-r),x=o*r/(o-r);else if(a===wn)p=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===ss)p=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=wn,l=!1){let c=this.elements,u=2/(t-e),f=2/(n-s),h=-(t+e)/(t-e),d=-(n+s)/(n-s),p,x;if(l)p=1/(o-r),x=o/(o-r);else if(a===wn)p=-2/(o-r),x=-(o+r)/(o-r);else if(a===ss)p=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=p,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};kh.prototype.isMatrix4=!0;var $e=kh,dr=new N,$n=new $e,ry=new N(0,0,0),oy=new N(1,1,1),$i=new N,zc=new N,In=new N,Fm=new $e,Om=new Zt,Gn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(Je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Je(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:_e("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Fm.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Fm,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Om.setFromEuler(this),this.setFromQuaternion(Om,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Gn.DEFAULT_ORDER="XYZ";var Vs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},ay=0,Bm=new N,pr=new Zt,Ai=new $e,Gc=new N,Go=new N,ly=new N,cy=new Zt,km=new N(1,0,0),Vm=new N(0,1,0),zm=new N(0,0,1),Gm={type:"added"},uy={type:"removed"},mr={type:"childadded",child:null},Hf={type:"childremoved",child:null},ft=class i extends An{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ay++}),this.uuid=Ln(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new N,t=new Gn,n=new Zt,s=new N(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new $e},normalMatrix:{value:new Qe}}),this.matrix=new $e,this.matrixWorld=new $e,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Vs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return pr.setFromAxisAngle(e,t),this.quaternion.multiply(pr),this}rotateOnWorldAxis(e,t){return pr.setFromAxisAngle(e,t),this.quaternion.premultiply(pr),this}rotateX(e){return this.rotateOnAxis(km,e)}rotateY(e){return this.rotateOnAxis(Vm,e)}rotateZ(e){return this.rotateOnAxis(zm,e)}translateOnAxis(e,t){return Bm.copy(e).applyQuaternion(this.quaternion),this.position.add(Bm.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(km,e)}translateY(e){return this.translateOnAxis(Vm,e)}translateZ(e){return this.translateOnAxis(zm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ai.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Gc.copy(e):Gc.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Go.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ai.lookAt(Go,Gc,this.up):Ai.lookAt(Gc,Go,this.up),this.quaternion.setFromRotationMatrix(Ai),s&&(Ai.extractRotation(s.matrixWorld),pr.setFromRotationMatrix(Ai),this.quaternion.premultiply(pr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Gm),mr.child=e,this.dispatchEvent(mr),mr.child=null):ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(uy),Hf.child=e,this.dispatchEvent(Hf),Hf.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ai.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ai.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ai),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Gm),mr.child=e,this.dispatchEvent(mr),mr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Go,e,ly),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Go,cy,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),f=o(e.shapes),h=o(e.skeletons),d=o(e.animations),p=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),p.length>0&&(n.nodes=p)}return n.object=s,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};ft.DEFAULT_UP=new N(0,1,0);ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Li=class extends ft{constructor(){super(),this.isGroup=!0,this.type="Group"}},hy={type:"move"},zs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Li,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Li,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Li,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),g=this._getHandJoint(c,x);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),d=.02,p=.005;c.inputState.pinching&&h>d+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=d-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(hy)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Li;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Gg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ki={h:0,s:0,l:0},Hc={h:0,s:0,l:0};function Wf(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Se=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=mn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,at.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=at.workingColorSpace){return this.r=e,this.g=t,this.b=n,at.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=at.workingColorSpace){if(e=xp(e,1),t=Je(t,0,1),n=Je(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Wf(o,r,e+1/3),this.g=Wf(o,r,e),this.b=Wf(o,r,e-1/3)}return at.colorSpaceToWorking(this,s),this}setStyle(e,t=mn){function n(r){r!==void 0&&parseFloat(r)<1&&_e("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:_e("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);_e("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=mn){let n=Gg[e.toLowerCase()];return n!==void 0?this.setHex(n,t):_e("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Di(e.r),this.g=Di(e.g),this.b=Di(e.b),this}copyLinearToSRGB(e){return this.r=Dr(e.r),this.g=Dr(e.g),this.b=Dr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=mn){return at.workingToColorSpace(on.copy(this),e),Math.round(Je(on.r*255,0,255))*65536+Math.round(Je(on.g*255,0,255))*256+Math.round(Je(on.b*255,0,255))}getHexString(e=mn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=at.workingColorSpace){at.workingToColorSpace(on.copy(this),t);let n=on.r,s=on.g,r=on.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let f=o-a;switch(c=u<=.5?f/(o+a):f/(2-o-a),o){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=at.workingColorSpace){return at.workingToColorSpace(on.copy(this),t),e.r=on.r,e.g=on.g,e.b=on.b,e}getStyle(e=mn){at.workingToColorSpace(on.copy(this),e);let t=on.r,n=on.g,s=on.b;return e!==mn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ki),this.setHSL(Ki.h+e,Ki.s+t,Ki.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ki),e.getHSL(Hc);let n=sa(Ki.h,Hc.h,t),s=sa(Ki.s,Hc.s,t),r=sa(Ki.l,Hc.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},on=new Se;Se.NAMES=Gg;var xa=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Se(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}},_a=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Se(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},ya=class extends ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Gn,this.environmentIntensity=1,this.environmentRotation=new Gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Kn=new N,Ei=new N,Xf=new N,Ti=new N,gr=new N,xr=new N,Hm=new N,qf=new N,Yf=new N,Zf=new N,Jf=new _t,$f=new _t,Kf=new _t,ei=class i{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Kn.subVectors(e,t),s.cross(Kn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Kn.subVectors(s,t),Ei.subVectors(n,t),Xf.subVectors(e,t);let o=Kn.dot(Kn),a=Kn.dot(Ei),l=Kn.dot(Xf),c=Ei.dot(Ei),u=Ei.dot(Xf),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;let h=1/f,d=(c*l-a*u)*h,p=(o*u-a*l)*h;return r.set(1-d-p,p,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ti)===null?!1:Ti.x>=0&&Ti.y>=0&&Ti.x+Ti.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Ti)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ti.x),l.addScaledVector(o,Ti.y),l.addScaledVector(a,Ti.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Jf.setScalar(0),$f.setScalar(0),Kf.setScalar(0),Jf.fromBufferAttribute(e,t),$f.fromBufferAttribute(e,n),Kf.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Jf,r.x),o.addScaledVector($f,r.y),o.addScaledVector(Kf,r.z),o}static isFrontFacing(e,t,n,s){return Kn.subVectors(n,t),Ei.subVectors(e,t),Kn.cross(Ei).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Kn.subVectors(this.c,this.b),Ei.subVectors(this.a,this.b),Kn.cross(Ei).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;gr.subVectors(s,n),xr.subVectors(r,n),qf.subVectors(e,n);let l=gr.dot(qf),c=xr.dot(qf);if(l<=0&&c<=0)return t.copy(n);Yf.subVectors(e,s);let u=gr.dot(Yf),f=xr.dot(Yf);if(u>=0&&f<=u)return t.copy(s);let h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(gr,o);Zf.subVectors(e,r);let d=gr.dot(Zf),p=xr.dot(Zf);if(p>=0&&d<=p)return t.copy(r);let x=d*c-l*p;if(x<=0&&c>=0&&p<=0)return a=c/(c-p),t.copy(n).addScaledVector(xr,a);let m=u*p-d*f;if(m<=0&&f-u>=0&&d-p>=0)return Hm.subVectors(r,s),a=(f-u)/(f-u+(d-p)),t.copy(s).addScaledVector(Hm,a);let g=1/(m+x+h);return o=x*g,a=h*g,t.copy(n).addScaledVector(gr,o).addScaledVector(xr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},zt=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(jn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(jn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=jn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,jn):jn.fromBufferAttribute(r,o),jn.applyMatrix4(e.matrixWorld),this.expandByPoint(jn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wc.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Wc.copy(n.boundingBox)),Wc.applyMatrix4(e.matrixWorld),this.union(Wc)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,jn),jn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ho),Xc.subVectors(this.max,Ho),_r.subVectors(e.a,Ho),yr.subVectors(e.b,Ho),vr.subVectors(e.c,Ho),ji.subVectors(yr,_r),Qi.subVectors(vr,yr),Ss.subVectors(_r,vr);let t=[0,-ji.z,ji.y,0,-Qi.z,Qi.y,0,-Ss.z,Ss.y,ji.z,0,-ji.x,Qi.z,0,-Qi.x,Ss.z,0,-Ss.x,-ji.y,ji.x,0,-Qi.y,Qi.x,0,-Ss.y,Ss.x,0];return!jf(t,_r,yr,vr,Xc)||(t=[1,0,0,0,1,0,0,0,1],!jf(t,_r,yr,vr,Xc))?!1:(qc.crossVectors(ji,Qi),t=[qc.x,qc.y,qc.z],jf(t,_r,yr,vr,Xc))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,jn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(jn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ri[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ri[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ri[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ri[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ri[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ri[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ri[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ri[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ri),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ri=[new N,new N,new N,new N,new N,new N,new N,new N],jn=new N,Wc=new zt,_r=new N,yr=new N,vr=new N,ji=new N,Qi=new N,Ss=new N,Ho=new N,Xc=new N,qc=new N,ws=new N;function jf(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ws.fromArray(i,r);let a=s.x*Math.abs(ws.x)+s.y*Math.abs(ws.y)+s.z*Math.abs(ws.z),l=e.dot(ws),c=t.dot(ws),u=n.dot(ws);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var Pi=fy();function fy(){let i=new ArrayBuffer(4),e=new Float32Array(i),t=new Uint32Array(i),n=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;c<-27?(n[l]=0,n[l|256]=32768,s[l]=24,s[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,s[l]=24,s[l|256]=24):(n[l]=31744,n[l|256]=64512,s[l]=13,s[l|256]=13)}let r=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,u=0;for(;(c&8388608)===0;)c<<=1,u-=8388608;c&=-8388609,u+=947912704,r[l]=c|u}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:s,mantissaTable:r,exponentTable:o,offsetTable:a}}function Sn(i){Math.abs(i)>65504&&_e("DataUtils.toHalfFloat(): Value out of range."),i=Je(i,-65504,65504),Pi.floatView[0]=i;let e=Pi.uint32View[0],t=e>>23&511;return Pi.baseTable[t]+((e&8388607)>>Pi.shiftTable[t])}function ea(i){let e=i>>10;return Pi.uint32View[0]=Pi.mantissaTable[Pi.offsetTable[e]+(i&1023)]+Pi.exponentTable[e],Pi.floatView[0]}var Uu=class{static toHalfFloat(e){return Sn(e)}static fromHalfFloat(e){return ea(e)}},Ut=new N,Yc=new oe,dy=0,tt=class extends An{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:dy++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=pc,this.updateRanges=[],this.gpuType=ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Yc.fromBufferAttribute(this,t),Yc.applyMatrix3(e),this.setXY(t,Yc.x,Yc.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix3(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=it(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=gn(t,this.array)),t}setX(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=gn(t,this.array)),t}setY(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=gn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=gn(t,this.array)),t}setW(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array),r=it(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}},Fu=class extends tt{constructor(e,t,n){super(new Int8Array(e),t,n)}},Ou=class extends tt{constructor(e,t,n){super(new Uint8Array(e),t,n)}},Bu=class extends tt{constructor(e,t,n){super(new Uint8ClampedArray(e),t,n)}},ku=class extends tt{constructor(e,t,n){super(new Int16Array(e),t,n)}},Hr=class extends tt{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Vu=class extends tt{constructor(e,t,n){super(new Int32Array(e),t,n)}},Wr=class extends tt{constructor(e,t,n){super(new Uint32Array(e),t,n)}},zu=class extends tt{constructor(e,t,n){super(new Uint16Array(e),t,n),this.isFloat16BufferAttribute=!0}getX(e){let t=ea(this.array[e*this.itemSize]);return this.normalized&&(t=gn(t,this.array)),t}setX(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize]=Sn(t),this}getY(e){let t=ea(this.array[e*this.itemSize+1]);return this.normalized&&(t=gn(t,this.array)),t}setY(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+1]=Sn(t),this}getZ(e){let t=ea(this.array[e*this.itemSize+2]);return this.normalized&&(t=gn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+2]=Sn(t),this}getW(e){let t=ea(this.array[e*this.itemSize+3]);return this.normalized&&(t=gn(t,this.array)),t}setW(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+3]=Sn(t),this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array)),this.array[e+0]=Sn(t),this.array[e+1]=Sn(n),this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array)),this.array[e+0]=Sn(t),this.array[e+1]=Sn(n),this.array[e+2]=Sn(s),this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array),r=it(r,this.array)),this.array[e+0]=Sn(t),this.array[e+1]=Sn(n),this.array[e+2]=Sn(s),this.array[e+3]=Sn(r),this}},Le=class extends tt{constructor(e,t,n){super(new Float32Array(e),t,n)}},py=new zt,Wo=new N,Qf=new N,Ot=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):py.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Wo.subVectors(e,this.center);let t=Wo.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Wo,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Qf.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Wo.copy(e.center).add(Qf)),this.expandByPoint(Wo.copy(e.center).sub(Qf))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},my=0,kn=new $e,ed=new ft,br=new N,Pn=new zt,Xo=new zt,Yt=new N,Ke=class i extends An{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:my++}),this.uuid=Ln(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(B_(e)?Wr:Hr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Qe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return kn.makeRotationFromQuaternion(e),this.applyMatrix4(kn),this}rotateX(e){return kn.makeRotationX(e),this.applyMatrix4(kn),this}rotateY(e){return kn.makeRotationY(e),this.applyMatrix4(kn),this}rotateZ(e){return kn.makeRotationZ(e),this.applyMatrix4(kn),this}translate(e,t,n){return kn.makeTranslation(e,t,n),this.applyMatrix4(kn),this}scale(e,t,n){return kn.makeScale(e,t,n),this.applyMatrix4(kn),this}lookAt(e){return ed.lookAt(e),ed.updateMatrix(),this.applyMatrix4(ed.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(br).negate(),this.translate(br.x,br.y,br.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Le(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&_e("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Pn.setFromBufferAttribute(r),this.morphTargetsRelative?(Yt.addVectors(this.boundingBox.min,Pn.min),this.boundingBox.expandByPoint(Yt),Yt.addVectors(this.boundingBox.max,Pn.max),this.boundingBox.expandByPoint(Yt)):(this.boundingBox.expandByPoint(Pn.min),this.boundingBox.expandByPoint(Pn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ot);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let n=this.boundingSphere.center;if(Pn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Xo.setFromBufferAttribute(a),this.morphTargetsRelative?(Yt.addVectors(Pn.min,Xo.min),Pn.expandByPoint(Yt),Yt.addVectors(Pn.max,Xo.max),Pn.expandByPoint(Yt)):(Pn.expandByPoint(Xo.min),Pn.expandByPoint(Xo.max))}Pn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Yt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Yt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Yt.fromBufferAttribute(a,c),l&&(br.fromBufferAttribute(e,c),Yt.add(br)),s=Math.max(s,n.distanceToSquared(Yt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new tt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<n.count;_++)a[_]=new N,l[_]=new N;let c=new N,u=new N,f=new N,h=new oe,d=new oe,p=new oe,x=new N,m=new N;function g(_,A,R){c.fromBufferAttribute(n,_),u.fromBufferAttribute(n,A),f.fromBufferAttribute(n,R),h.fromBufferAttribute(r,_),d.fromBufferAttribute(r,A),p.fromBufferAttribute(r,R),u.sub(c),f.sub(c),d.sub(h),p.sub(h);let L=1/(d.x*p.y-p.x*d.y);isFinite(L)&&(x.copy(u).multiplyScalar(p.y).addScaledVector(f,-d.y).multiplyScalar(L),m.copy(f).multiplyScalar(d.x).addScaledVector(u,-p.x).multiplyScalar(L),a[_].add(x),a[A].add(x),a[R].add(x),l[_].add(m),l[A].add(m),l[R].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let _=0,A=y.length;_<A;++_){let R=y[_],L=R.start,I=R.count;for(let P=L,C=L+I;P<C;P+=3)g(e.getX(P+0),e.getX(P+1),e.getX(P+2))}let S=new N,v=new N,M=new N,b=new N;function E(_){M.fromBufferAttribute(s,_),b.copy(M);let A=a[_];S.copy(A),S.sub(M.multiplyScalar(M.dot(A))).normalize(),v.crossVectors(b,A);let L=v.dot(l[_])<0?-1:1;o.setXYZW(_,S.x,S.y,S.z,L)}for(let _=0,A=y.length;_<A;++_){let R=y[_],L=R.start,I=R.count;for(let P=L,C=L+I;P<C;P+=3)E(e.getX(P+0)),E(e.getX(P+1)),E(e.getX(P+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new tt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);let s=new N,r=new N,o=new N,a=new N,l=new N,c=new N,u=new N,f=new N;if(e)for(let h=0,d=e.count;h<d;h+=3){let p=e.getX(h+0),x=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),a.fromBufferAttribute(n,p),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,d=t.count;h<d;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Yt.fromBufferAttribute(e,t),Yt.normalize(),e.setXYZ(t,Yt.x,Yt.y,Yt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,f=a.normalized,h=new c.constructor(l.length*u),d=0,p=0;for(let x=0,m=l.length;x<m;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*u;for(let g=0;g<u;g++)h[p++]=c[d++]}return new tt(h,u,f)}if(this.index===null)return _e("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,f=c.length;u<f;u++){let h=c[u],d=e(h,n);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){let d=c[f];u.push(d.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],f=r[c];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Gs=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=pc,this.updateRanges=[],this.version=0,this.uuid=Ln()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ln()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ln()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},pn=new N,os=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)pn.fromBufferAttribute(this,t),pn.applyMatrix4(e),this.setXYZ(t,pn.x,pn.y,pn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)pn.fromBufferAttribute(this,t),pn.applyNormalMatrix(e),this.setXYZ(t,pn.x,pn.y,pn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)pn.fromBufferAttribute(this,t),pn.transformDirection(e),this.setXYZ(t,pn.x,pn.y,pn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=it(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=gn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=gn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=gn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=gn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=it(t,this.array),n=it(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array),r=it(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){zr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new tt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){zr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},td=new N,gy=new N,xy=new Qe,Vn=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=td.subVectors(n,t).cross(gy.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(td),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||xy.getNormalMatrix(e),s=this.coplanarPoint(td).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},_y=0,Bt=class extends An{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_y++}),this.uuid=Ln(),this.name="",this.type="Material",this.blending=js,this.side=ki,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Wh,this.blendDst=Xh,this.blendEquation=ps,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Se(0,0,0),this.blendAlpha=0,this.depthFunc=Fs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=cp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ia,this.stencilZFail=ia,this.stencilZPass=ia,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){_e(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){_e(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Se().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Vn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new oe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new oe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Xr=class extends Bt{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Se(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Mr,qo=new N,Sr=new N,wr=new N,Ar=new oe,Yo=new oe,Hg=new $e,Zc=new N,Zo=new N,Jc=new N,Wm=new oe,nd=new oe,Xm=new oe,va=class extends ft{constructor(e=new Xr){if(super(),this.isSprite=!0,this.type="Sprite",Mr===void 0){Mr=new Ke;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Gs(t,5);Mr.setIndex([0,1,2,0,2,3]),Mr.setAttribute("position",new os(n,3,0,!1)),Mr.setAttribute("uv",new os(n,2,3,!1))}this.geometry=Mr,this.material=e,this.center=new oe(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&ke('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Sr.setFromMatrixScale(this.matrixWorld),Hg.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),wr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Sr.multiplyScalar(-wr.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let o=this.center;$c(Zc.set(-.5,-.5,0),wr,o,Sr,s,r),$c(Zo.set(.5,-.5,0),wr,o,Sr,s,r),$c(Jc.set(.5,.5,0),wr,o,Sr,s,r),Wm.set(0,0),nd.set(1,0),Xm.set(1,1);let a=e.ray.intersectTriangle(Zc,Zo,Jc,!1,qo);if(a===null&&($c(Zo.set(-.5,.5,0),wr,o,Sr,s,r),nd.set(0,1),a=e.ray.intersectTriangle(Zc,Jc,Zo,!1,qo),a===null))return;let l=e.ray.origin.distanceTo(qo);l<e.near||l>e.far||t.push({distance:l,point:qo.clone(),uv:ei.getInterpolation(qo,Zc,Zo,Jc,Wm,nd,Xm,new oe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function $c(i,e,t,n,s,r){Ar.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(Yo.x=r*Ar.x-s*Ar.y,Yo.y=s*Ar.x+r*Ar.y):Yo.copy(Ar),i.copy(e),i.x+=Yo.x,i.y+=Yo.y,i.applyMatrix4(Hg)}var Kc=new N,qm=new N,ba=class extends ft{constructor(){super(),this.isLOD=!0,this._currentLevel=0,this.type="LOD",Object.defineProperties(this,{levels:{enumerable:!0,value:[]}}),this.autoUpdate=!0}copy(e){super.copy(e,!1);let t=e.levels;for(let n=0,s=t.length;n<s;n++){let r=t[n];this.addLevel(r.object.clone(),r.distance,r.hysteresis)}return this.autoUpdate=e.autoUpdate,this}addLevel(e,t=0,n=0){t=Math.abs(t);let s=this.levels,r;for(r=0;r<s.length&&!(t<s[r].distance);r++);return s.splice(r,0,{distance:t,hysteresis:n,object:e}),this.add(e),this}removeLevel(e){let t=this.levels;for(let n=0;n<t.length;n++)if(t[n].distance===e){let s=t.splice(n,1);return this.remove(s[0].object),!0}return!1}getCurrentLevel(){return this._currentLevel}getObjectForDistance(e){let t=this.levels;if(t.length>0){let n,s;for(n=1,s=t.length;n<s;n++){let r=t[n].distance;if(t[n].object.visible&&(r-=r*t[n].hysteresis),e<r)break}return t[n-1].object}return null}raycast(e,t){if(this.levels.length>0){Kc.setFromMatrixPosition(this.matrixWorld);let s=e.ray.origin.distanceTo(Kc);this.getObjectForDistance(s).raycast(e,t)}}update(e){let t=this.levels;if(t.length>1){Kc.setFromMatrixPosition(e.matrixWorld),qm.setFromMatrixPosition(this.matrixWorld);let n=Kc.distanceTo(qm)/e.zoom;t[0].object.visible=!0;let s,r;for(s=1,r=t.length;s<r;s++){let o=t[s].distance;if(t[s].object.visible&&(o-=o*t[s].hysteresis),n>=o)t[s-1].object.visible=!1,t[s].object.visible=!0;else break}for(this._currentLevel=s-1;s<r;s++)t[s].object.visible=!1}}toJSON(e){let t=super.toJSON(e);t.object.autoUpdate=this.autoUpdate,t.object.levels=[];let n=this.levels;for(let s=0,r=n.length;s<r;s++){let o=n[s];t.object.levels.push({object:o.object.uuid,distance:o.distance,hysteresis:o.hysteresis})}return t}},Ci=new N,id=new N,jc=new N,Qc=new N,Ni=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ci)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ci.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ci.copy(this.origin).addScaledVector(this.direction,t),Ci.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){id.copy(e).add(t).multiplyScalar(.5),jc.copy(t).sub(e).normalize(),Qc.copy(this.origin).sub(id);let r=e.distanceTo(t)*.5,o=-this.direction.dot(jc),a=Qc.dot(this.direction),l=-Qc.dot(jc),c=Qc.lengthSq(),u=Math.abs(1-o*o),f,h,d,p;if(u>0)if(f=o*l-a,h=o*a-l,p=r*u,f>=0)if(h>=-p)if(h<=p){let x=1/u;f*=x,h*=x,d=f*(f+o*h+2*a)+h*(o*f+h+2*l)+c}else h=r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;else h<=-p?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c):h<=p?(f=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+c):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(id).addScaledVector(jc,h),d}intersectSphere(e,t){if(e.radius<0)return null;Ci.subVectors(e.center,this.origin);let n=Ci.dot(this.direction),s=Ci.dot(Ci)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ci)!==null}intersectTriangle(e,t,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,f=e.x-o.x,h=e.y-o.y,d=e.z-o.z,p=t.x-o.x,x=t.y-o.y,m=t.z-o.z,g=n.x-o.x,y=n.y-o.y,S=n.z-o.z,v=Math.abs(l),M=Math.abs(c),b=Math.abs(u),E,_,A,R,L,I,P,C,U,B,z,j;if(v>=M&&v>=b?(A=l,I=f,U=p,j=g,l>=0?(E=c,_=u,R=h,L=d,P=x,C=m,B=y,z=S):(E=u,_=c,R=d,L=h,P=m,C=x,B=S,z=y)):M>=b?(A=c,I=h,U=x,j=y,c>=0?(E=u,_=l,R=d,L=f,P=m,C=p,B=S,z=g):(E=l,_=u,R=f,L=d,P=p,C=m,B=g,z=S)):(A=u,I=d,U=m,j=S,u>=0?(E=l,_=c,R=f,L=h,P=p,C=x,B=g,z=y):(E=c,_=l,R=h,L=f,P=x,C=p,B=y,z=g)),A===0)return null;let q=E/A,k=_/A,H=1/A,ue=R-q*I,de=L-k*I,G=P-q*U,le=C-k*U,ge=B-q*j,X=z-k*j,Y=ge*le-X*G,he=ue*X-de*ge,Re=G*de-le*ue;if(s){if(Y<0||he<0||Re<0)return null}else if((Y<0||he<0||Re<0)&&(Y>0||he>0||Re>0))return null;let me=Y+he+Re;if(me===0)return null;let Ie=H*(Y*I+he*U+Re*j);return(me>0?Ie<0:Ie>0)?null:this.at(Ie/me,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},En=class extends Bt{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.combine=_o,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Ym=new $e,As=new Ni,eu=new Ot,Zm=new N,tu=new N,nu=new N,iu=new N,sd=new N,su=new N,Jm=new N,ru=new N,Tt=class extends ft{constructor(e=new Ke,t=new En){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){su.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],f=r[l];u!==0&&(sd.fromBufferAttribute(f,e),o?su.addScaledVector(sd,u):su.addScaledVector(sd.sub(t),u))}t.add(su)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),eu.copy(n.boundingSphere),eu.applyMatrix4(r),As.copy(e.ray).recast(e.near),!(eu.containsPoint(As.origin)===!1&&(As.intersectSphere(eu,Zm)===null||As.origin.distanceToSquared(Zm)>(e.far-e.near)**2))&&(Ym.copy(r).invert(),As.copy(e.ray).applyMatrix4(Ym),!(n.boundingBox!==null&&As.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,As)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,x=h.length;p<x;p++){let m=h[p],g=o[m.materialIndex],y=Math.max(m.start,d.start),S=Math.min(a.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,M=S;v<M;v+=3){let b=a.getX(v),E=a.getX(v+1),_=a.getX(v+2);s=ou(this,g,e,n,c,u,f,b,E,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){let y=a.getX(m),S=a.getX(m+1),v=a.getX(m+2);s=ou(this,o,e,n,c,u,f,y,S,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let p=0,x=h.length;p<x;p++){let m=h[p],g=o[m.materialIndex],y=Math.max(m.start,d.start),S=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,M=S;v<M;v+=3){let b=v,E=v+1,_=v+2;s=ou(this,g,e,n,c,u,f,b,E,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let p=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let m=p,g=x;m<g;m+=3){let y=m,S=m+1,v=m+2;s=ou(this,o,e,n,c,u,f,y,S,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function yy(i,e,t,n,s,r,o,a){let l;if(e.side===un?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===ki,a),l===null)return null;ru.copy(a),ru.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(ru);return c<t.near||c>t.far?null:{distance:c,point:ru.clone(),object:i}}function ou(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,tu),i.getVertexPosition(l,nu),i.getVertexPosition(c,iu);let u=yy(i,e,t,n,tu,nu,iu,Jm);if(u){let f=new N;ei.getBarycoord(Jm,tu,nu,iu,f),s&&(u.uv=ei.getInterpolatedAttribute(s,a,l,c,f,new oe)),r&&(u.uv1=ei.getInterpolatedAttribute(r,a,l,c,f,new oe)),o&&(u.normal=ei.getInterpolatedAttribute(o,a,l,c,f,new N),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new N,materialIndex:0};ei.getNormal(tu,nu,iu,h.normal),u.face=h,u.barycoord=f}return u}var Jo=new _t,$m=new _t,Km=new _t,vy=new _t,jm=new $e,au=new N,rd=new Ot,Qm=new $e,od=new Ni,Ma=class extends Tt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Iu,this.bindMatrix=new $e,this.bindMatrixInverse=new $e,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new zt),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,au),this.boundingBox.expandByPoint(au)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Ot),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,au),this.boundingSphere.expandByPoint(au)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),rd.copy(this.boundingSphere),rd.applyMatrix4(s),e.ray.intersectsSphere(rd)!==!1&&(Qm.copy(s).invert(),od.copy(e.ray).applyMatrix4(Qm),!(this.boundingBox!==null&&od.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,od)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new _t,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Iu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===ip?this.bindMatrixInverse.copy(this.bindMatrix).invert():_e("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;$m.fromBufferAttribute(s.attributes.skinIndex,e),Km.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(Jo.copy(t),t.set(0,0,0,0)):(Jo.set(...t,1),t.set(0,0,0)),Jo.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=Km.getComponent(r);if(o!==0){let a=$m.getComponent(r);jm.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(vy.copy(Jo).applyMatrix4(jm),o)}}return t.isVector4&&(t.w=Jo.w),t.applyMatrix4(this.bindMatrixInverse)}},qr=class extends ft{constructor(){super(),this.isBone=!0,this.type="Bone"}},_n=class extends It{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Ct,u=Ct,f,h){super(null,o,a,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},e0=new $e,by=new $e,Sa=class i{constructor(e=[],t=[]){this.uuid=Ln(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){_e("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new $e)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new $e;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:by;e0.multiplyMatrices(a,t[r]),e0.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new _n(t,e,e,cn,ln);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(_e("Skeleton: No bone found with UUID:",r),o=new qr),this.bones.push(o),this.boneInverses.push(new $e().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}},Ui=class extends tt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Er=new $e,t0=new $e,lu=[],n0=new zt,My=new $e,$o=new Tt,Ko=new Ot,wa=class extends Tt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ui(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,My)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new zt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Er),n0.copy(e.boundingBox).applyMatrix4(Er),this.boundingBox.union(n0)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ot),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Er),Ko.copy(e.boundingSphere).applyMatrix4(Er),this.boundingSphere.union(Ko)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if($o.geometry=this.geometry,$o.material=this.material,$o.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ko.copy(this.boundingSphere),Ko.applyMatrix4(n),e.ray.intersectsSphere(Ko)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Er),t0.multiplyMatrices(n,Er),$o.matrixWorld=t0,$o.raycast(e,lu);for(let o=0,a=lu.length;o<a;o++){let l=lu[o];l.instanceId=r,l.object=this,t.push(l)}lu.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Ui(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new _n(new Float32Array(s*this.count),s,this.count,Ll,ln));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Es=new Ot,Sy=new oe(.5,.5),cu=new N,xi=class{constructor(e=new Vn,t=new Vn,n=new Vn,s=new Vn,r=new Vn,o=new Vn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=wn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],d=r[7],p=r[8],x=r[9],m=r[10],g=r[11],y=r[12],S=r[13],v=r[14],M=r[15];if(s[0].setComponents(c-o,d-u,g-p,M-y).normalize(),s[1].setComponents(c+o,d+u,g+p,M+y).normalize(),s[2].setComponents(c+a,d+f,g+x,M+S).normalize(),s[3].setComponents(c-a,d-f,g-x,M-S).normalize(),n)s[4].setComponents(l,h,m,v).normalize(),s[5].setComponents(c-l,d-h,g-m,M-v).normalize();else if(s[4].setComponents(c-l,d-h,g-m,M-v).normalize(),t===wn)s[5].setComponents(c+l,d+h,g+m,M+v).normalize();else if(t===ss)s[5].setComponents(l,h,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Es.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Es.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Es)}intersectsSprite(e){Es.center.set(0,0,0);let t=Sy.distanceTo(e.center);return Es.radius=.7071067811865476+t,Es.applyMatrix4(e.matrixWorld),this.intersectsSphere(Es)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(cu.x=s.normal.x>0?e.max.x:e.min.x,cu.y=s.normal.y>0?e.max.y:e.min.y,cu.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(cu)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},i0=new $e,Aa=class i{constructor(){this.coordinateSystem=wn,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];i0.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new xi),n[s].setFromProjectionMatrix(i0,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new xi),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};function ad(i,e){return i-e}function wy(i,e){return i.z-e.z}function Ay(i,e){return e.z-i.z}var bd=class{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n,s){let r=this.pool,o=this.list;this.index>=r.length&&r.push({start:-1,count:-1,z:-1,index:-1});let a=r[this.index];o.push(a),this.index++,a.start=e,a.count=t,a.z=n,a.index=s}reset(){this.list.length=0,this.index=0}},Mn=new $e,Ey=new Se(1,1,1),Ty=new xi,Ry=new Aa,uu=new zt,Ts=new Ot,jo=new N,s0=new N,Cy=new N,ld=new bd,an=new Tt,hu=[];function Iy(i,e,t=0){let n=e.itemSize;if(i.isInterleavedBufferAttribute||i.array.constructor!==e.array.constructor){let s=i.count;for(let r=0;r<s;r++)for(let o=0;o<n;o++)e.setComponent(r+t,o,i.getComponent(r,o))}else e.array.set(i.array,t*n);e.needsUpdate=!0}function Rs(i,e){if(i.constructor!==e.constructor){let t=Math.min(i.length,e.length);for(let n=0;n<t;n++)e[n]=i[n]}else{let t=Math.min(i.length,e.length);e.set(new i.constructor(i.buffer,0,t))}}var Ea=class extends Tt{constructor(e,t,n=t*2,s){super(new Ke,s),this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=e,this._maxVertexCount=t,this._maxIndexCount=n,this._multiDrawCounts=new Int32Array(e),this._multiDrawStarts=new Int32Array(e),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let e=Math.sqrt(this._maxInstanceCount*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4),n=new _n(t,e,e,cn,ln);this._matricesTexture=n}_initIndirectTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Uint32Array(e*e),n=new _n(t,e,e,Mo,Un);this._indirectTexture=n}_initColorsTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Float32Array(e*e*4).fill(1),n=new _n(t,e,e,cn,ln);n.colorSpace=at.workingColorSpace,this._colorsTexture=n}_initializeGeometry(e){let t=this.geometry,n=this._maxVertexCount,s=this._maxIndexCount;if(this._geometryInitialized===!1){for(let r in e.attributes){let o=e.getAttribute(r),{array:a,itemSize:l,normalized:c}=o,u=new a.constructor(n*l),f=new tt(u,l,c);t.setAttribute(r,f)}if(e.getIndex()!==null){let r=n>65535?new Uint32Array(s):new Uint16Array(s);t.setIndex(new tt(r,1))}this._geometryInitialized=!0}}_validateGeometry(e){let t=this.geometry;if(!!e.getIndex()!=!!t.getIndex())throw new Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let n in t.attributes){if(!e.hasAttribute(n))throw new Error(`THREE.BatchedMesh: Added geometry missing "${n}". All geometries must have consistent attributes.`);let s=e.getAttribute(n),r=t.getAttribute(n);if(s.itemSize!==r.itemSize||s.normalized!==r.normalized)throw new Error("THREE.BatchedMesh: All attributes must have a consistent itemSize and normalized value.")}}validateInstanceId(e){let t=this._instanceInfo;if(e<0||e>=t.length||t[e].active===!1)throw new Error(`THREE.BatchedMesh: Invalid instanceId ${e}. Instance is either out of range or has been deleted.`)}validateGeometryId(e){let t=this._geometryInfo;if(e<0||e>=t.length||t[e].active===!1)throw new Error(`THREE.BatchedMesh: Invalid geometryId ${e}. Geometry is either out of range or has been deleted.`)}setCustomSort(e){return this.customSort=e,this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zt);let e=this.boundingBox,t=this._instanceInfo;e.makeEmpty();for(let n=0,s=t.length;n<s;n++){if(t[n].active===!1)continue;let r=t[n].geometryIndex;this.getMatrixAt(n,Mn),this.getBoundingBoxAt(r,uu).applyMatrix4(Mn),e.union(uu)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ot);let e=this.boundingSphere,t=this._instanceInfo;e.makeEmpty();for(let n=0,s=t.length;n<s;n++){if(t[n].active===!1)continue;let r=t[n].geometryIndex;this.getMatrixAt(n,Mn),this.getBoundingSphereAt(r,Ts).applyMatrix4(Mn),e.union(Ts)}}addInstance(e){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw new Error("THREE.BatchedMesh: Maximum item count reached.");let n={visible:!0,active:!0,geometryIndex:e},s=null;this._availableInstanceIds.length>0?(this._availableInstanceIds.sort(ad),s=this._availableInstanceIds.shift(),this._instanceInfo[s]=n):(s=this._instanceInfo.length,this._instanceInfo.push(n));let r=this._matricesTexture;Mn.identity().toArray(r.image.data,s*16),r.needsUpdate=!0;let o=this._colorsTexture;return o&&(Ey.toArray(o.image.data,s*4),o.needsUpdate=!0),this._visibilityChanged=!0,s}addGeometry(e,t=-1,n=-1){this._initializeGeometry(e),this._validateGeometry(e);let s={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},r=this._geometryInfo;s.vertexStart=this._nextVertexStart,s.reservedVertexCount=t===-1?e.getAttribute("position").count:t;let o=e.getIndex();if(o!==null&&(s.indexStart=this._nextIndexStart,s.reservedIndexCount=n===-1?o.count:n),s.indexStart!==-1&&s.indexStart+s.reservedIndexCount>this._maxIndexCount||s.vertexStart+s.reservedVertexCount>this._maxVertexCount)throw new Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let l;return this._availableGeometryIds.length>0?(this._availableGeometryIds.sort(ad),l=this._availableGeometryIds.shift(),r[l]=s):(l=this._geometryCount,this._geometryCount++,r.push(s)),this.setGeometryAt(l,e),this._nextIndexStart=s.indexStart+s.reservedIndexCount,this._nextVertexStart=s.vertexStart+s.reservedVertexCount,l}setGeometryAt(e,t){if(e>=this._geometryCount)throw new Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(t);let n=this.geometry,s=n.getIndex()!==null,r=n.getIndex(),o=t.getIndex(),a=this._geometryInfo[e];if(s&&o.count>a.reservedIndexCount||t.attributes.position.count>a.reservedVertexCount)throw new Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let l=a.vertexStart,c=a.reservedVertexCount;a.vertexCount=t.getAttribute("position").count;for(let u in n.attributes){let f=t.getAttribute(u),h=n.getAttribute(u);Iy(f,h,l);let d=f.itemSize;for(let p=f.count,x=c;p<x;p++){let m=l+p;for(let g=0;g<d;g++)h.setComponent(m,g,0)}h.needsUpdate=!0,h.addUpdateRange(l*d,c*d)}if(s){let u=a.indexStart,f=a.reservedIndexCount;a.indexCount=t.getIndex().count;for(let h=0;h<o.count;h++)r.setX(u+h,l+o.getX(h));for(let h=o.count,d=f;h<d;h++)r.setX(u+h,l);r.needsUpdate=!0,r.addUpdateRange(u,a.reservedIndexCount)}return a.start=s?a.indexStart:a.vertexStart,a.count=s?a.indexCount:a.vertexCount,a.boundingBox=null,t.boundingBox!==null&&(a.boundingBox=t.boundingBox.clone()),a.boundingSphere=null,t.boundingSphere!==null&&(a.boundingSphere=t.boundingSphere.clone()),this._visibilityChanged=!0,e}deleteGeometry(e){let t=this._geometryInfo;if(e>=t.length||t[e].active===!1)return this;let n=this._instanceInfo;for(let s=0,r=n.length;s<r;s++)n[s].active&&n[s].geometryIndex===e&&this.deleteInstance(s);return t[e].active=!1,this._availableGeometryIds.push(e),this._visibilityChanged=!0,this}deleteInstance(e){return this.validateInstanceId(e),this._instanceInfo[e].active=!1,this._availableInstanceIds.push(e),this._visibilityChanged=!0,this}optimize(){let e=0,t=0,n=this._geometryInfo,s=n.map((o,a)=>a).sort((o,a)=>n[o].vertexStart-n[a].vertexStart),r=this.geometry;for(let o=0,a=n.length;o<a;o++){let l=s[o],c=n[l];if(c.active!==!1){if(r.index!==null){if(c.indexStart!==t){let{indexStart:u,vertexStart:f,reservedIndexCount:h}=c,d=r.index,p=d.array,x=e-f;for(let m=u;m<u+h;m++)p[m]=p[m]+x;d.array.copyWithin(t,u,u+h),d.addUpdateRange(t,h),d.needsUpdate=!0,c.indexStart=t}t+=c.reservedIndexCount}if(c.vertexStart!==e){let{vertexStart:u,reservedVertexCount:f}=c,h=r.attributes;for(let d in h){let p=h[d],{array:x,itemSize:m}=p;x.copyWithin(e*m,u*m,(u+f)*m),p.addUpdateRange(e*m,f*m),p.needsUpdate=!0}c.vertexStart=e}e+=c.reservedVertexCount,c.start=r.index?c.indexStart:c.vertexStart}}return this._nextIndexStart=t,this._nextVertexStart=e,this._visibilityChanged=!0,this}getBoundingBoxAt(e,t){if(e>=this._geometryCount)return null;let n=this.geometry,s=this._geometryInfo[e];if(s.boundingBox===null){let r=new zt,o=n.index,a=n.attributes.position;for(let l=s.start,c=s.start+s.count;l<c;l++){let u=l;o&&(u=o.getX(u)),r.expandByPoint(jo.fromBufferAttribute(a,u))}s.boundingBox=r}return t.copy(s.boundingBox),t}getBoundingSphereAt(e,t){if(e>=this._geometryCount)return null;let n=this.geometry,s=this._geometryInfo[e];if(s.boundingSphere===null){let r=new Ot;this.getBoundingBoxAt(e,uu),uu.getCenter(r.center);let o=n.index,a=n.attributes.position,l=0;for(let c=s.start,u=s.start+s.count;c<u;c++){let f=c;o&&(f=o.getX(f)),jo.fromBufferAttribute(a,f),l=Math.max(l,r.center.distanceToSquared(jo))}r.radius=Math.sqrt(l),s.boundingSphere=r}return t.copy(s.boundingSphere),t}setMatrixAt(e,t){this.validateInstanceId(e);let n=this._matricesTexture,s=this._matricesTexture.image.data;return t.toArray(s,e*16),n.needsUpdate=!0,this}getMatrixAt(e,t){return this.validateInstanceId(e),t.fromArray(this._matricesTexture.image.data,e*16)}setColorAt(e,t){return this.validateInstanceId(e),this._colorsTexture===null&&this._initColorsTexture(),t.toArray(this._colorsTexture.image.data,e*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(e,t){return this.validateInstanceId(e),this._colorsTexture===null?t.isVector4?t.set(1,1,1,1):t.setRGB(1,1,1):t.fromArray(this._colorsTexture.image.data,e*4)}setVisibleAt(e,t){return this.validateInstanceId(e),this._instanceInfo[e].visible===t?this:(this._instanceInfo[e].visible=t,this._visibilityChanged=!0,this)}getVisibleAt(e){return this.validateInstanceId(e),this._instanceInfo[e].visible}setGeometryIdAt(e,t){return this.validateInstanceId(e),this.validateGeometryId(t),this._instanceInfo[e].geometryIndex=t,this._visibilityChanged=!0,this}getGeometryIdAt(e){return this.validateInstanceId(e),this._instanceInfo[e].geometryIndex}getGeometryRangeAt(e,t={}){this.validateGeometryId(e);let n=this._geometryInfo[e];return t.vertexStart=n.vertexStart,t.vertexCount=n.vertexCount,t.reservedVertexCount=n.reservedVertexCount,t.indexStart=n.indexStart,t.indexCount=n.indexCount,t.reservedIndexCount=n.reservedIndexCount,t.start=n.start,t.count=n.count,t}setInstanceCount(e){let t=this._availableInstanceIds,n=this._instanceInfo;for(t.sort(ad);t[t.length-1]===n.length-1;)n.pop(),t.pop();if(e<n.length)throw new Error(`THREE.BatchedMesh: Instance ids outside the range ${e} are being used. Cannot shrink instance count.`);let s=new Int32Array(e),r=new Int32Array(e);Rs(this._multiDrawCounts,s),Rs(this._multiDrawStarts,r),this._multiDrawCounts=s,this._multiDrawStarts=r,this._maxInstanceCount=e;let o=this._indirectTexture,a=this._matricesTexture,l=this._colorsTexture;o.dispose(),this._initIndirectTexture(),Rs(o.image.data,this._indirectTexture.image.data),a.dispose(),this._initMatricesTexture(),Rs(a.image.data,this._matricesTexture.image.data),l&&(l.dispose(),this._initColorsTexture(),Rs(l.image.data,this._colorsTexture.image.data))}setGeometrySize(e,t){let n=[...this._geometryInfo].filter(a=>a.active);if(Math.max(...n.map(a=>a.vertexStart+a.reservedVertexCount))>e)throw new Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${t}. Cannot shrink further.`);if(this.geometry.index&&Math.max(...n.map(l=>l.indexStart+l.reservedIndexCount))>t)throw new Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${t}. Cannot shrink further.`);let r=this.geometry;r.dispose(),this._maxVertexCount=e,this._maxIndexCount=t,this._geometryInitialized&&(this._geometryInitialized=!1,this.geometry=new Ke,this._initializeGeometry(r));let o=this.geometry;r.index&&Rs(r.index.array,o.index.array);for(let a in r.attributes)Rs(r.attributes[a].array,o.attributes[a].array)}raycast(e,t){let n=this._instanceInfo,s=this._geometryInfo,r=this.matrixWorld,o=this.geometry;an.material=this.material,an.geometry.index=o.index,an.geometry.attributes=o.attributes,an.geometry.boundingBox===null&&(an.geometry.boundingBox=new zt),an.geometry.boundingSphere===null&&(an.geometry.boundingSphere=new Ot);for(let a=0,l=n.length;a<l;a++){if(!n[a].visible||!n[a].active)continue;let c=n[a].geometryIndex,u=s[c];an.geometry.setDrawRange(u.start,u.count),this.getMatrixAt(a,an.matrixWorld).premultiply(r),this.getBoundingBoxAt(c,an.geometry.boundingBox),this.getBoundingSphereAt(c,an.geometry.boundingSphere),an.raycast(e,hu);for(let f=0,h=hu.length;f<h;f++){let d=hu[f];d.object=this,d.batchId=a,t.push(d)}hu.length=0}an.material=null,an.geometry.index=null,an.geometry.attributes={},an.geometry.setDrawRange(0,1/0)}copy(e){return super.copy(e),this.geometry=e.geometry.clone(),this.perObjectFrustumCulled=e.perObjectFrustumCulled,this.sortObjects=e.sortObjects,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this._geometryInfo=e._geometryInfo.map(t=>({...t,boundingBox:t.boundingBox!==null?t.boundingBox.clone():null,boundingSphere:t.boundingSphere!==null?t.boundingSphere.clone():null})),this._instanceInfo=e._instanceInfo.map(t=>({...t})),this._availableInstanceIds=e._availableInstanceIds.slice(),this._availableGeometryIds=e._availableGeometryIds.slice(),this._nextIndexStart=e._nextIndexStart,this._nextVertexStart=e._nextVertexStart,this._geometryCount=e._geometryCount,this._maxInstanceCount=e._maxInstanceCount,this._maxVertexCount=e._maxVertexCount,this._maxIndexCount=e._maxIndexCount,this._geometryInitialized=e._geometryInitialized,this._multiDrawCounts=e._multiDrawCounts.slice(),this._multiDrawStarts=e._multiDrawStarts.slice(),this._multiDrawBytesPerElement=e._multiDrawBytesPerElement,this._indirectTexture=e._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=e._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),this._colorsTexture!==null&&(this._colorsTexture=e._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice()),this}dispose(){super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null&&(this._colorsTexture.dispose(),this._colorsTexture=null)}onBeforeRender(e,t,n,s,r){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let o=s.getIndex(),a=o===null?1:o.array.BYTES_PER_ELEMENT,l=1;r.wireframe&&(l=2,a=s.attributes.position.count>65535?4:2);let c=this._instanceInfo,u=this._multiDrawStarts,f=this._multiDrawCounts,h=this._geometryInfo,d=this.perObjectFrustumCulled,p=this._indirectTexture,x=p.image.data,m=n.isArrayCamera?Ry:Ty;d&&(n.isArrayCamera?m.setFromArrayCamera(n):(Mn.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse).multiply(this.matrixWorld),m.setFromProjectionMatrix(Mn,n.coordinateSystem,n.reversedDepth)));let g=0;if(this.sortObjects){Mn.copy(this.matrixWorld).invert(),jo.setFromMatrixPosition(n.matrixWorld).applyMatrix4(Mn),s0.set(0,0,-1).transformDirection(n.matrixWorld).transformDirection(Mn);for(let v=0,M=c.length;v<M;v++)if(c[v].visible&&c[v].active){let b=c[v].geometryIndex;this.getMatrixAt(v,Mn),this.getBoundingSphereAt(b,Ts).applyMatrix4(Mn);let E=!1;if(d&&(E=!m.intersectsSphere(Ts)),!E){let _=h[b],A=Cy.subVectors(Ts.center,jo).dot(s0);ld.push(_.start,_.count,A,v)}}let y=ld.list,S=this.customSort;S===null?y.sort(r.transparent?Ay:wy):S.call(this,y,n);for(let v=0,M=y.length;v<M;v++){let b=y[v];u[g]=b.start*a*l,f[g]=b.count*l,x[g]=b.index,g++}ld.reset()}else for(let y=0,S=c.length;y<S;y++)if(c[y].visible&&c[y].active){let v=c[y].geometryIndex,M=!1;if(d&&(this.getMatrixAt(y,Mn),this.getBoundingSphereAt(v,Ts).applyMatrix4(Mn),M=!m.intersectsSphere(Ts)),!M){let b=h[v];u[g]=b.start*a*l,f[g]=b.count*l,x[g]=y,g++}}p.needsUpdate=!0,this._multiDrawCount=g,this._multiDrawBytesPerElement=a,this._visibilityChanged=!1}onBeforeShadow(e,t,n,s,r,o){this.onBeforeRender(e,null,s,r,o)}},Jt=class extends Bt{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Gu=new N,Hu=new N,r0=new $e,Qo=new Ni,fu=new Ot,cd=new N,o0=new N,ii=class extends ft{constructor(e=new Ke,t=new Jt){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Gu.fromBufferAttribute(t,s-1),Hu.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Gu.distanceTo(Hu);e.setAttribute("lineDistance",new Le(n,1))}else _e("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fu.copy(n.boundingSphere),fu.applyMatrix4(s),fu.radius+=r,e.ray.intersectsSphere(fu)===!1)return;r0.copy(s).invert(),Qo.copy(e.ray).applyMatrix4(r0);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let d=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let x=d,m=p-1;x<m;x+=c){let g=u.getX(x),y=u.getX(x+1),S=du(this,e,Qo,l,g,y,x);S&&t.push(S)}if(this.isLineLoop){let x=u.getX(p-1),m=u.getX(d),g=du(this,e,Qo,l,x,m,p-1);g&&t.push(g)}}else{let d=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let x=d,m=p-1;x<m;x+=c){let g=du(this,e,Qo,l,x,x+1,x);g&&t.push(g)}if(this.isLineLoop){let x=du(this,e,Qo,l,p-1,d,p-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function du(i,e,t,n,s,r,o){let a=i.geometry.attributes.position;if(Gu.fromBufferAttribute(a,s),Hu.fromBufferAttribute(a,r),t.distanceSqToSegment(Gu,Hu,cd,o0)>n)return;cd.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(cd);if(!(c<e.near||c>e.far))return{distance:c,point:o0.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var a0=new N,l0=new N,Dn=class extends ii{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)a0.fromBufferAttribute(t,s),l0.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+a0.distanceTo(l0);e.setAttribute("lineDistance",new Le(n,1))}else _e("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Ta=class extends ii{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Yr=class extends Bt{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},c0=new $e,Md=new Ni,pu=new Ot,mu=new N,Ra=class extends ft{constructor(e=new Ke,t=new Yr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),pu.copy(n.boundingSphere),pu.applyMatrix4(s),pu.radius+=r,e.ray.intersectsSphere(pu)===!1)return;c0.copy(s).invert(),Md.copy(e.ray).applyMatrix4(c0);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,f=n.attributes.position;if(c!==null){let h=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let p=h,x=d;p<x;p++){let m=c.getX(p);mu.fromBufferAttribute(f,m),u0(mu,m,l,s,e,t,this)}}else{let h=Math.max(0,o.start),d=Math.min(f.count,o.start+o.count);for(let p=h,x=d;p<x;p++)mu.fromBufferAttribute(f,p),u0(mu,p,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function u0(i,e,t,n,s,r,o){let a=Md.distanceSqToPoint(i);if(a<t){let l=new N;Md.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Ca=class extends It{constructor(e,t,n,s,r=wt,o=wt,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isVideoTexture=!0,this.generateMipmaps=!1,this._requestVideoFrameCallbackId=0;let u=this;function f(){u.needsUpdate=!0,u._requestVideoFrameCallbackId=e.requestVideoFrameCallback(f)}"requestVideoFrameCallback"in e&&(this._requestVideoFrameCallbackId=e.requestVideoFrameCallback(f))}clone(){return new this.constructor(this.image).copy(this)}update(){let e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}dispose(){this._requestVideoFrameCallbackId!==0&&(this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId),this._requestVideoFrameCallbackId=0),super.dispose()}},Wu=class extends Ca{constructor(e,t,n,s,r,o,a,l){super({},e,t,n,s,r,o,a,l),this.isVideoFrameTexture=!0}update(){}clone(){return new this.constructor().copy(this)}setFrame(e){this.image=e,this.needsUpdate=!0}},Xu=class extends It{constructor(e,t){super({width:e,height:t}),this.isFramebufferTexture=!0,this.magFilter=Ct,this.minFilter=Ct,this.generateMipmaps=!1,this.needsUpdate=!0}},Hs=class extends It{constructor(e,t,n,s,r,o,a,l,c,u,f,h){super(null,o,a,l,c,u,s,r,f,h),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}},qu=class extends Hs{constructor(e,t,n,s,r,o){super(e,t,n,r,o),this.isCompressedArrayTexture=!0,this.image.depth=s,this.wrapR=xn,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Yu=class extends Hs{constructor(e,t,n){super(void 0,e[0].width,e[0].height,t,n,oi),this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=e}},as=class extends It{constructor(e=[],t=oi,n,s,r,o,a,l,c,u){super(e,t,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Zu=class extends It{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ju=class extends It{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isHTMLTexture=!0,this.generateMipmaps=!1,this.needsUpdate=!0;let u=e?e.parentNode:null;u!==null&&"requestPaint"in u&&(u.onpaint=()=>{this.needsUpdate=!0},u.requestPaint())}dispose(){let e=this.image?this.image.parentNode:null;e!==null&&"onpaint"in e&&(e.onpaint=null),super.dispose()}},Fi=class extends It{constructor(e,t,n=Un,s,r,o,a=Ct,l=Ct,c,u=ni,f=1){if(u!==ni&&u!==zi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:f};super(h,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new zn(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ia=class extends Fi{constructor(e,t=Un,n=oi,s,r,o=Ct,a=Ct,l,c=ni){let u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,n,s,r,o,a,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Zr=class extends It{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ls=class i extends Ke{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],f=[],h=0,d=0;p("z","y","x",-1,-1,n,t,e,o,r,0),p("z","y","x",1,-1,n,t,-e,o,r,1),p("x","z","y",1,1,e,n,t,s,o,2),p("x","z","y",1,-1,e,n,-t,s,o,3),p("x","y","z",1,-1,e,t,n,s,r,4),p("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Le(c,3)),this.setAttribute("normal",new Le(u,3)),this.setAttribute("uv",new Le(f,2));function p(x,m,g,y,S,v,M,b,E,_,A){let R=v/E,L=M/_,I=v/2,P=M/2,C=b/2,U=E+1,B=_+1,z=0,j=0,q=new N;for(let k=0;k<B;k++){let H=k*L-P;for(let ue=0;ue<U;ue++){let de=ue*R-I;q[x]=de*y,q[m]=H*S,q[g]=C,c.push(q.x,q.y,q.z),q[x]=0,q[m]=0,q[g]=b>0?1:-1,u.push(q.x,q.y,q.z),f.push(ue/E),f.push(1-k/_),z+=1}}for(let k=0;k<_;k++)for(let H=0;H<E;H++){let ue=h+H+U*k,de=h+H+U*(k+1),G=h+(H+1)+U*(k+1),le=h+(H+1)+U*k;l.push(ue,de,le),l.push(de,G,le),j+=6}a.addGroup(d,j,A),d+=j,h+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},Pa=class i extends Ke{constructor(e=1,t=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let o=[],a=[],l=[],c=[],u=t/2,f=Math.PI/2*e,h=t,d=2*f+h,p=n*2+r,x=s+1,m=new N,g=new N;for(let y=0;y<=p;y++){let S=0,v=0,M=0,b=0;if(y<=n){let A=y/n,R=A*Math.PI/2;v=-u-e*Math.cos(R),M=e*Math.sin(R),b=-e*Math.cos(R),S=A*f}else if(y<=n+r){let A=(y-n)/r;v=-u+A*t,M=e,b=0,S=f+A*h}else{let A=(y-n-r)/n,R=A*Math.PI/2;v=u+e*Math.sin(R),M=e*Math.cos(R),b=e*Math.sin(R),S=f+h+A*f}let E=Math.max(0,Math.min(1,S/d)),_=0;y===0?_=.5/s:y===p&&(_=-.5/s);for(let A=0;A<=s;A++){let R=A/s,L=R*Math.PI*2,I=Math.sin(L),P=Math.cos(L);g.x=-M*P,g.y=v,g.z=M*I,a.push(g.x,g.y,g.z),m.set(-M*P,b,M*I),m.normalize(),l.push(m.x,m.y,m.z),c.push(R+_,E)}if(y>0){let A=(y-1)*x;for(let R=0;R<s;R++){let L=A+R,I=A+R+1,P=y*x+R,C=y*x+R+1;o.push(L,I,P),o.push(I,C,P)}}}this.setIndex(o),this.setAttribute("position",new Le(a,3)),this.setAttribute("normal",new Le(l,3)),this.setAttribute("uv",new Le(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},La=class i extends Ke{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new N,u=new oe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let f=0,h=3;f<=t;f++,h+=3){let d=n+f/t*s;c.x=e*Math.cos(d),c.y=e*Math.sin(d),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[h]/e+1)/2,u.y=(o[h+1]/e+1)/2,l.push(u.x,u.y)}for(let f=1;f<=t;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new Le(o,3)),this.setAttribute("normal",new Le(a,3)),this.setAttribute("uv",new Le(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Jr=class i extends Ke{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],f=[],h=[],d=[],p=0,x=[],m=n/2,g=0;y(),o===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(u),this.setAttribute("position",new Le(f,3)),this.setAttribute("normal",new Le(h,3)),this.setAttribute("uv",new Le(d,2));function y(){let v=new N,M=new N,b=0,E=(t-e)/n;for(let _=0;_<=r;_++){let A=[],R=_/r,L=R*(t-e)+e;for(let I=0;I<=s;I++){let P=I/s,C=P*l+a,U=Math.sin(C),B=Math.cos(C);M.x=L*U,M.y=-R*n+m,M.z=L*B,f.push(M.x,M.y,M.z),v.set(U,E,B).normalize(),h.push(v.x,v.y,v.z),d.push(P,1-R),A.push(p++)}x.push(A)}for(let _=0;_<s;_++)for(let A=0;A<r;A++){let R=x[A][_],L=x[A+1][_],I=x[A+1][_+1],P=x[A][_+1];(e>0||A!==0)&&(u.push(R,L,P),b+=3),(t>0||A!==r-1)&&(u.push(L,I,P),b+=3)}c.addGroup(g,b,0),g+=b}function S(v){let M=p,b=new oe,E=new N,_=0,A=v===!0?e:t,R=v===!0?1:-1;for(let I=1;I<=s;I++)f.push(0,m*R,0),h.push(0,R,0),d.push(.5,.5),p++;let L=p;for(let I=0;I<=s;I++){let C=I/s*l+a,U=Math.cos(C),B=Math.sin(C);E.x=A*B,E.y=m*R,E.z=A*U,f.push(E.x,E.y,E.z),h.push(0,R,0),b.x=U*.5+.5,b.y=B*.5*R+.5,d.push(b.x,b.y),p++}for(let I=0;I<s;I++){let P=M+I,C=L+I;v===!0?u.push(C,C+1,P):u.push(C+1,C,P),_+=3}c.addGroup(g,_,v===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},$r=class i extends Jr{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Oi=class i extends Ke{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],o=[];a(s),c(n),u(),this.setAttribute("position",new Le(r,3)),this.setAttribute("normal",new Le(r.slice(),3)),this.setAttribute("uv",new Le(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let S=new N,v=new N,M=new N;for(let b=0;b<t.length;b+=3)d(t[b+0],S),d(t[b+1],v),d(t[b+2],M),l(S,v,M,y)}function l(y,S,v,M){let b=M+1,E=[];for(let _=0;_<=b;_++){E[_]=[];let A=y.clone().lerp(v,_/b),R=S.clone().lerp(v,_/b),L=b-_;for(let I=0;I<=L;I++)I===0&&_===b?E[_][I]=A:E[_][I]=A.clone().lerp(R,I/L)}for(let _=0;_<b;_++)for(let A=0;A<2*(b-_)-1;A++){let R=Math.floor(A/2);A%2===0?(h(E[_][R+1]),h(E[_+1][R]),h(E[_][R])):(h(E[_][R+1]),h(E[_+1][R+1]),h(E[_+1][R]))}}function c(y){let S=new N;for(let v=0;v<r.length;v+=3)S.x=r[v+0],S.y=r[v+1],S.z=r[v+2],S.normalize().multiplyScalar(y),r[v+0]=S.x,r[v+1]=S.y,r[v+2]=S.z}function u(){let y=new N;for(let S=0;S<r.length;S+=3){y.x=r[S+0],y.y=r[S+1],y.z=r[S+2];let v=m(y)/2/Math.PI+.5,M=g(y)/Math.PI+.5;o.push(v,1-M)}p(),f()}function f(){for(let y=0;y<o.length;y+=6){let S=o[y+0],v=o[y+2],M=o[y+4],b=Math.max(S,v,M),E=Math.min(S,v,M);b>.9&&E<.1&&(S<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),M<.2&&(o[y+4]+=1))}}function h(y){r.push(y.x,y.y,y.z)}function d(y,S){let v=y*3;S.x=e[v+0],S.y=e[v+1],S.z=e[v+2]}function p(){let y=new N,S=new N,v=new N,M=new N,b=new oe,E=new oe,_=new oe;for(let A=0,R=0;A<r.length;A+=9,R+=6){y.set(r[A+0],r[A+1],r[A+2]),S.set(r[A+3],r[A+4],r[A+5]),v.set(r[A+6],r[A+7],r[A+8]),b.set(o[R+0],o[R+1]),E.set(o[R+2],o[R+3]),_.set(o[R+4],o[R+5]),M.copy(y).add(S).add(v).divideScalar(3);let L=m(M);x(b,R+0,y,L),x(E,R+2,S,L),x(_,R+4,v,L)}}function x(y,S,v,M){M<0&&y.x===1&&(o[S]=y.x-1),v.x===0&&v.z===0&&(o[S]=M/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function g(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}},Da=class i extends Oi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},gu=new N,xu=new N,ud=new N,_u=new ei,Na=class extends Ke{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let s=Math.pow(10,4),r=Math.cos(Us*t),o=e.getIndex(),a=e.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],u=["a","b","c"],f=new Array(3),h={},d=[];for(let p=0;p<l;p+=3){o?(c[0]=o.getX(p),c[1]=o.getX(p+1),c[2]=o.getX(p+2)):(c[0]=p,c[1]=p+1,c[2]=p+2);let{a:x,b:m,c:g}=_u;if(x.fromBufferAttribute(a,c[0]),m.fromBufferAttribute(a,c[1]),g.fromBufferAttribute(a,c[2]),_u.getNormal(ud),f[0]=`${Math.round(x.x*s)},${Math.round(x.y*s)},${Math.round(x.z*s)}`,f[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,f[2]=`${Math.round(g.x*s)},${Math.round(g.y*s)},${Math.round(g.z*s)}`,!(f[0]===f[1]||f[1]===f[2]||f[2]===f[0]))for(let y=0;y<3;y++){let S=(y+1)%3,v=f[y],M=f[S],b=_u[u[y]],E=_u[u[S]],_=`${v}_${M}`,A=`${M}_${v}`;A in h&&h[A]?(ud.dot(h[A].normal)<=r&&(d.push(b.x,b.y,b.z),d.push(E.x,E.y,E.z)),h[A]=null):_ in h||(h[_]={index0:c[y],index1:c[S],normal:ud.clone()})}}for(let p in h)if(h[p]){let{index0:x,index1:m}=h[p];gu.fromBufferAttribute(a,x),xu.fromBufferAttribute(a,m),d.push(gu.x,gu.y,gu.z),d.push(xu.x,xu.y,xu.z)}this.setAttribute("position",new Le(d,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Tn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){_e("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let u=n[s],h=n[s+1]-u,d=(o-u)/h;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new oe:new N);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new N,s=[],r=[],o=[],a=new N,l=new $e;for(let d=0;d<=e;d++){let p=d/e;s[d]=this.getTangentAt(p,new N)}r[0]=new N,o[0]=new N;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),f=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),h<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();let p=Math.acos(Je(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(a,p))}o[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(Je(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let p=1;p<=e;p++)r[p].applyMatrix4(l.makeRotationAxis(s[p],d*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ws=class extends Tn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new oe){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=l-this.aX,d=c-this.aY;l=h*u-d*f+this.aX,c=h*f+d*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ua=class extends Ws{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function _p(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,f){let h=(o-r)/c-(a-r)/(c+u)+(a-o)/u,d=(a-o)/u-(l-o)/(u+f)+(l-a)/f;h*=u,d*=u,s(o,a,h,d)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var h0=new N,f0=new N,hd=new _p,fd=new _p,dd=new _p,Fa=class extends Tn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new N){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:(f0.subVectors(s[0],s[1]).add(s[0]),c=f0);let f=s[a%r],h=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(h0.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=h0),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,p=Math.pow(c.distanceToSquared(f),d),x=Math.pow(f.distanceToSquared(h),d),m=Math.pow(h.distanceToSquared(u),d);x<1e-4&&(x=1),p<1e-4&&(p=x),m<1e-4&&(m=x),hd.initNonuniformCatmullRom(c.x,f.x,h.x,u.x,p,x,m),fd.initNonuniformCatmullRom(c.y,f.y,h.y,u.y,p,x,m),dd.initNonuniformCatmullRom(c.z,f.z,h.z,u.z,p,x,m)}else this.curveType==="catmullrom"&&(hd.initCatmullRom(c.x,f.x,h.x,u.x,this.tension),fd.initCatmullRom(c.y,f.y,h.y,u.y,this.tension),dd.initCatmullRom(c.z,f.z,h.z,u.z,this.tension));return n.set(hd.calc(l),fd.calc(l),dd.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new N().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function d0(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function Py(i,e){let t=1-i;return t*t*e}function Ly(i,e){return 2*(1-i)*i*e}function Dy(i,e){return i*i*e}function ra(i,e,t,n){return Py(i,e)+Ly(i,t)+Dy(i,n)}function Ny(i,e){let t=1-i;return t*t*t*e}function Uy(i,e){let t=1-i;return 3*t*t*i*e}function Fy(i,e){return 3*(1-i)*i*i*e}function Oy(i,e){return i*i*i*e}function oa(i,e,t,n,s){return Ny(i,e)+Uy(i,t)+Fy(i,n)+Oy(i,s)}var Kr=class extends Tn{constructor(e=new oe,t=new oe,n=new oe,s=new oe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new oe){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(oa(e,s.x,r.x,o.x,a.x),oa(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Oa=class extends Tn{constructor(e=new N,t=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new N){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(oa(e,s.x,r.x,o.x,a.x),oa(e,s.y,r.y,o.y,a.y),oa(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},jr=class extends Tn{constructor(e=new oe,t=new oe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new oe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new oe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ba=class extends Tn{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Qr=class extends Tn{constructor(e=new oe,t=new oe,n=new oe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new oe){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(ra(e,s.x,r.x,o.x),ra(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},eo=class extends Tn{constructor(e=new N,t=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new N){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(ra(e,s.x,r.x,o.x),ra(e,s.y,r.y,o.y),ra(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},to=class extends Tn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new oe){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],f=s[o>s.length-3?s.length-1:o+2];return n.set(d0(a,l.x,c.x,u.x,f.x),d0(a,l.y,c.y,u.y,f.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new oe().fromArray(s))}return this}},$u=Object.freeze({__proto__:null,ArcCurve:Ua,CatmullRomCurve3:Fa,CubicBezierCurve:Kr,CubicBezierCurve3:Oa,EllipseCurve:Ws,LineCurve:jr,LineCurve3:Ba,QuadraticBezierCurve:Qr,QuadraticBezierCurve3:eo,SplineCurve:to}),ka=class extends Tn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new $u[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new $u[s.type]().fromJSON(s))}return this}},cs=class extends ka{constructor(e){super(),this.type="Path",this.currentPoint=new oe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new jr(this.currentPoint.clone(),new oe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new Qr(this.currentPoint.clone(),new oe(e,t),new oe(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new Kr(this.currentPoint.clone(),new oe(e,t),new oe(n,s),new oe(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new to(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new Ws(e,t,n,s,r,o,a,l);if(this.curves.length>0){let f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},us=class extends cs{constructor(e){super(e),this.uuid=Ln(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new cs().fromJSON(s))}return this}};function By(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Wg(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=Hy(i,e,r,t)),i.length>80*t){a=i[0],l=i[1];let u=a,f=l;for(let h=t;h<s;h+=t){let d=i[h],p=i[h+1];d<a&&(a=d),p<l&&(l=p),d>u&&(u=d),p>f&&(f=p)}c=Math.max(u-a,f-l),c=c!==0?32767/c:0}return Va(r,o,t,a,l,c,0),o}function Wg(i,e,t,n,s){let r;if(s===ev(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=p0(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=p0(o/n|0,i[o],i[o+1],r);return r&&no(r,r.next)&&(Ga(r),r=r.next),r}function Xs(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(no(t,t.next)||Et(t.prev,t,t.next)===0)){if(Ga(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Va(i,e,t,n,s,r,o){if(!i)return;!o&&r&&Zy(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Vy(i,n,s,r):ky(i)){e.push(l.i,i.i,c.i),Ga(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=zy(Xs(i),e),Va(i,e,t,n,s,r,2)):o===2&&Gy(i,e,t,n,s,r):Va(Xs(i),e,t,n,s,r,1);break}}}function ky(i){let e=i.prev,t=i,n=i.next;if(Et(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=Math.min(s,r,o),f=Math.min(a,l,c),h=Math.max(s,r,o),d=Math.max(a,l,c),p=n.next;for(;p!==e;){if(p.x>=u&&p.x<=h&&p.y>=f&&p.y<=d&&ta(s,a,r,l,o,c,p.x,p.y)&&Et(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Vy(i,e,t,n){let s=i.prev,r=i,o=i.next;if(Et(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,u=s.y,f=r.y,h=o.y,d=Math.min(a,l,c),p=Math.min(u,f,h),x=Math.max(a,l,c),m=Math.max(u,f,h),g=Sd(d,p,e,t,n),y=Sd(x,m,e,t,n),S=i.prevZ,v=i.nextZ;for(;S&&S.z>=g&&v&&v.z<=y;){if(S.x>=d&&S.x<=x&&S.y>=p&&S.y<=m&&S!==s&&S!==o&&ta(a,u,l,f,c,h,S.x,S.y)&&Et(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=d&&v.x<=x&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&ta(a,u,l,f,c,h,v.x,v.y)&&Et(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=g;){if(S.x>=d&&S.x<=x&&S.y>=p&&S.y<=m&&S!==s&&S!==o&&ta(a,u,l,f,c,h,S.x,S.y)&&Et(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=y;){if(v.x>=d&&v.x<=x&&v.y>=p&&v.y<=m&&v!==s&&v!==o&&ta(a,u,l,f,c,h,v.x,v.y)&&Et(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function zy(i,e){let t=i;do{let n=t.prev,s=t.next.next;!no(n,s)&&qg(n,t,t.next,s)&&za(n,s)&&za(s,n)&&(e.push(n.i,t.i,s.i),Ga(t),Ga(t.next),t=i=s),t=t.next}while(t!==i);return Xs(t)}function Gy(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Ky(o,a)){let l=Yg(o,a);o=Xs(o,o.next),l=Xs(l,l.next),Va(o,e,t,n,s,r,0),Va(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Hy(i,e,t,n){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=Wg(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push($y(c))}s.sort(Wy);for(let r=0;r<s.length;r++)t=Xy(s[r],t);return t}function Wy(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Xy(i,e){let t=qy(i,e);if(!t)return e;let n=Yg(t,i);return Xs(n,n.next),Xs(t,t.next)}function qy(i,e){let t=e,n=i.x,s=i.y,r=-1/0,o;if(no(i,t))return t;do{if(no(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let f=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=n&&f>r&&(r=f,o=t.x<t.next.x?t:t.next,f===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,u=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Xg(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let f=Math.abs(s-t.y)/(n-t.x);za(t,i)&&(f<u||f===u&&(t.x>o.x||t.x===o.x&&Yy(o,t)))&&(o=t,u=f)}t=t.next}while(t!==a);return o}function Yy(i,e){return Et(i.prev,i,e.prev)<0&&Et(e.next,i,i.next)<0}function Zy(i,e,t,n){let s=i;do s.z===0&&(s.z=Sd(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Jy(s)}function Jy(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function Sd(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function $y(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Xg(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function ta(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&Xg(i,e,t,n,s,r,o,a)}function Ky(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!jy(i,e)&&(za(i,e)&&za(e,i)&&Qy(i,e)&&(Et(i.prev,i,e.prev)||Et(i,e.prev,e))||no(i,e)&&Et(i.prev,i,i.next)>0&&Et(e.prev,e,e.next)>0)}function Et(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function no(i,e){return i.x===e.x&&i.y===e.y}function qg(i,e,t,n){let s=vu(Et(i,e,t)),r=vu(Et(i,e,n)),o=vu(Et(t,n,i)),a=vu(Et(t,n,e));return!!(s!==r&&o!==a||s===0&&yu(i,t,e)||r===0&&yu(i,n,e)||o===0&&yu(t,i,n)||a===0&&yu(t,e,n))}function yu(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function vu(i){return i>0?1:i<0?-1:0}function jy(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&qg(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function za(i,e){return Et(i.prev,i,i.next)<0?Et(i,e,i.next)>=0&&Et(i,i.prev,e)>=0:Et(i,e,i.prev)<0||Et(i,i.next,e)<0}function Qy(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Yg(i,e){let t=wd(i.i,i.x,i.y),n=wd(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function p0(i,e,t,n){let s=wd(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ga(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function wd(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function ev(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var Ad=class{static triangulate(e,t,n=2){return By(e,t,n)}},jt=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];m0(e),g0(n,e);let o=e.length;t.forEach(m0);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,g0(n,t[l]);let a=Ad.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function m0(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function g0(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Ha=class i extends Ke{constructor(e=new us([new oe(.5,.5),new oe(-.5,.5),new oe(-.5,-.5),new oe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new Le(s,3)),this.setAttribute("uv",new Le(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,f=t.depth!==void 0?t.depth:1,h=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:tv,S,v=!1,M,b,E,_;if(g){S=g.getSpacedPoints(u),v=!0,h=!1;let ee=g.isCatmullRomCurve3?g.closed:!1;M=g.computeFrenetFrames(u,ee),b=new N,E=new N,_=new N}h||(m=0,d=0,p=0,x=0);let A=a.extractPoints(c),R=A.shape,L=A.holes;if(!jt.isClockWise(R)){R=R.reverse();for(let ee=0,re=L.length;ee<re;ee++){let se=L[ee];jt.isClockWise(se)&&(L[ee]=se.reverse())}}function P(ee){let se=10000000000000001e-36,ae=ee[0];for(let fe=1;fe<=ee.length;fe++){let Pe=fe%ee.length,Ue=ee[Pe],qe=Ue.x-ae.x,Ye=Ue.y-ae.y,F=qe*qe+Ye*Ye,ht=Math.max(Math.abs(Ue.x),Math.abs(Ue.y),Math.abs(ae.x),Math.abs(ae.y)),lt=se*ht*ht;if(F<=lt){ee.splice(Pe,1),fe--;continue}ae=Ue}}P(R),L.forEach(P);let C=L.length,U=R;for(let ee=0;ee<C;ee++){let re=L[ee];R=R.concat(re)}function B(ee,re,se){return re||ke("ExtrudeGeometry: vec does not exist"),ee.clone().addScaledVector(re,se)}let z=R.length;function j(ee,re,se){let ae,fe,Pe,Ue=ee.x-re.x,qe=ee.y-re.y,Ye=se.x-ee.x,F=se.y-ee.y,ht=Ue*Ue+qe*qe,lt=Ue*F-qe*Ye;if(Math.abs(lt)>Number.EPSILON){let D=Math.sqrt(ht),w=Math.sqrt(Ye*Ye+F*F),W=re.x-qe/D,$=re.y+Ue/D,Q=se.x-F/w,pe=se.y+Ye/w,xe=((Q-W)*F-(pe-$)*Ye)/(Ue*F-qe*Ye);ae=W+Ue*xe-ee.x,fe=$+qe*xe-ee.y;let te=ae*ae+fe*fe;if(te<=2)return new oe(ae,fe);Pe=Math.sqrt(te/2)}else{let D=!1;Ue>Number.EPSILON?Ye>Number.EPSILON&&(D=!0):Ue<-Number.EPSILON?Ye<-Number.EPSILON&&(D=!0):Math.sign(qe)===Math.sign(F)&&(D=!0),D?(ae=-qe,fe=Ue,Pe=Math.sqrt(ht)):(ae=Ue,fe=qe,Pe=Math.sqrt(ht/2))}return new oe(ae/Pe,fe/Pe)}let q=[];for(let ee=0,re=U.length,se=re-1,ae=ee+1;ee<re;ee++,se++,ae++)se===re&&(se=0),ae===re&&(ae=0),q[ee]=j(U[ee],U[se],U[ae]);let k=[],H,ue=q.concat();for(let ee=0,re=C;ee<re;ee++){let se=L[ee];H=[];for(let ae=0,fe=se.length,Pe=fe-1,Ue=ae+1;ae<fe;ae++,Pe++,Ue++)Pe===fe&&(Pe=0),Ue===fe&&(Ue=0),H[ae]=j(se[ae],se[Pe],se[Ue]);k.push(H),ue=ue.concat(H)}let de;if(m===0)de=jt.triangulateShape(U,L);else{let ee=[],re=[];for(let se=0;se<m;se++){let ae=se/m,fe=d*Math.cos(ae*Math.PI/2),Pe=p*Math.sin(ae*Math.PI/2)+x;for(let Ue=0,qe=U.length;Ue<qe;Ue++){let Ye=B(U[Ue],q[Ue],Pe);he(Ye.x,Ye.y,-fe),ae===0&&ee.push(Ye)}for(let Ue=0,qe=C;Ue<qe;Ue++){let Ye=L[Ue];H=k[Ue];let F=[];for(let ht=0,lt=Ye.length;ht<lt;ht++){let D=B(Ye[ht],H[ht],Pe);he(D.x,D.y,-fe),ae===0&&F.push(D)}ae===0&&re.push(F)}}de=jt.triangulateShape(ee,re)}let G=de.length,le=p+x;for(let ee=0;ee<z;ee++){let re=h?B(R[ee],ue[ee],le):R[ee];v?(E.copy(M.normals[0]).multiplyScalar(re.x),b.copy(M.binormals[0]).multiplyScalar(re.y),_.copy(S[0]).add(E).add(b),he(_.x,_.y,_.z)):he(re.x,re.y,0)}for(let ee=1;ee<=u;ee++)for(let re=0;re<z;re++){let se=h?B(R[re],ue[re],le):R[re];v?(E.copy(M.normals[ee]).multiplyScalar(se.x),b.copy(M.binormals[ee]).multiplyScalar(se.y),_.copy(S[ee]).add(E).add(b),he(_.x,_.y,_.z)):he(se.x,se.y,f/u*ee)}for(let ee=m-1;ee>=0;ee--){let re=ee/m,se=d*Math.cos(re*Math.PI/2),ae=p*Math.sin(re*Math.PI/2)+x;for(let fe=0,Pe=U.length;fe<Pe;fe++){let Ue=B(U[fe],q[fe],ae);he(Ue.x,Ue.y,f+se)}for(let fe=0,Pe=L.length;fe<Pe;fe++){let Ue=L[fe];H=k[fe];for(let qe=0,Ye=Ue.length;qe<Ye;qe++){let F=B(Ue[qe],H[qe],ae);v?he(F.x,F.y+S[u-1].y,S[u-1].x+se):he(F.x,F.y,f+se)}}}ge(),X();function ge(){let ee=s.length/3;if(h){let re=0,se=z*re;for(let ae=0;ae<G;ae++){let fe=de[ae];Re(fe[2]+se,fe[1]+se,fe[0]+se)}re=u+m*2,se=z*re;for(let ae=0;ae<G;ae++){let fe=de[ae];Re(fe[0]+se,fe[1]+se,fe[2]+se)}}else{for(let re=0;re<G;re++){let se=de[re];Re(se[2],se[1],se[0])}for(let re=0;re<G;re++){let se=de[re];Re(se[0]+z*u,se[1]+z*u,se[2]+z*u)}}n.addGroup(ee,s.length/3-ee,0)}function X(){let ee=s.length/3,re=0;Y(U,re),re+=U.length;for(let se=0,ae=L.length;se<ae;se++){let fe=L[se];Y(fe,re),re+=fe.length}n.addGroup(ee,s.length/3-ee,1)}function Y(ee,re){let se=ee.length;for(;--se>=0;){let ae=se,fe=se-1;fe<0&&(fe=ee.length-1);for(let Pe=0,Ue=u+m*2;Pe<Ue;Pe++){let qe=z*Pe,Ye=z*(Pe+1),F=re+ae+qe,ht=re+fe+qe,lt=re+fe+Ye,D=re+ae+Ye;me(F,ht,lt,D)}}}function he(ee,re,se){l.push(ee),l.push(re),l.push(se)}function Re(ee,re,se){Ie(ee),Ie(re),Ie(se);let ae=s.length/3,fe=y.generateTopUV(n,s,ae-3,ae-2,ae-1);je(fe[0]),je(fe[1]),je(fe[2])}function me(ee,re,se,ae){Ie(ee),Ie(re),Ie(ae),Ie(re),Ie(se),Ie(ae);let fe=s.length/3,Pe=y.generateSideWallUV(n,s,fe-6,fe-3,fe-2,fe-1);je(Pe[0]),je(Pe[1]),je(Pe[3]),je(Pe[1]),je(Pe[2]),je(Pe[3])}function Ie(ee){s.push(l[ee*3+0]),s.push(l[ee*3+1]),s.push(l[ee*3+2])}function je(ee){r.push(ee.x),r.push(ee.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return nv(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new $u[s.type]().fromJSON(s)),new i(n,e.options)}},tv={generateTopUV:function(i,e,t,n,s){let r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],u=e[s*3+1];return[new oe(r,o),new oe(a,l),new oe(c,u)]},generateSideWallUV:function(i,e,t,n,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],f=e[n*3+2],h=e[s*3],d=e[s*3+1],p=e[s*3+2],x=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new oe(o,1-l),new oe(c,1-f),new oe(h,1-p),new oe(x,1-g)]:[new oe(a,1-l),new oe(u,1-f),new oe(d,1-p),new oe(m,1-g)]}};function nv(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Wa=class i extends Oi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},Xa=class i extends Ke{constructor(e=[new oe(0,-.5),new oe(.5,0),new oe(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=Je(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],u=1/t,f=new N,h=new oe,d=new N,p=new N,x=new N,m=0,g=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:m=e[y+1].x-e[y].x,g=e[y+1].y-e[y].y,d.x=g*1,d.y=-m,d.z=g*0,x.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:m=e[y+1].x-e[y].x,g=e[y+1].y-e[y].y,d.x=g*1,d.y=-m,d.z=g*0,p.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),l.push(d.x,d.y,d.z),x.copy(p)}for(let y=0;y<=t;y++){let S=n+y*u*s,v=Math.sin(S),M=Math.cos(S);for(let b=0;b<=e.length-1;b++){f.x=e[b].x*v,f.y=e[b].y,f.z=e[b].x*M,o.push(f.x,f.y,f.z),h.x=y/t,h.y=b/(e.length-1),a.push(h.x,h.y);let E=l[3*b+0]*v,_=l[3*b+1],A=l[3*b+0]*M;c.push(E,_,A)}}for(let y=0;y<t;y++)for(let S=0;S<e.length-1;S++){let v=S+y*e.length,M=v,b=v+e.length,E=v+e.length+1,_=v+1;r.push(M,b,_),r.push(E,_,b)}this.setIndex(r),this.setAttribute("position",new Le(o,3)),this.setAttribute("uv",new Le(a,2)),this.setAttribute("normal",new Le(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}},io=class i extends Oi{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},qs=class i extends Ke{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,f=e/a,h=t/l,d=[],p=[],x=[],m=[];for(let g=0;g<u;g++){let y=g*h-o;for(let S=0;S<c;S++){let v=S*f-r;p.push(v,-y,0),x.push(0,0,1),m.push(S/a),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let y=0;y<a;y++){let S=y+c*g,v=y+c*(g+1),M=y+1+c*(g+1),b=y+1+c*g;d.push(S,v,b),d.push(v,M,b)}this.setIndex(d),this.setAttribute("position",new Le(p,3)),this.setAttribute("normal",new Le(x,3)),this.setAttribute("uv",new Le(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},qa=class i extends Ke{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);let a=[],l=[],c=[],u=[],f=e,h=(t-e)/s,d=new N,p=new oe;for(let x=0;x<=s;x++){for(let m=0;m<=n;m++){let g=r+m/n*o;d.x=f*Math.cos(g),d.y=f*Math.sin(g),l.push(d.x,d.y,d.z),c.push(0,0,1),p.x=(d.x/t+1)/2,p.y=(d.y/t+1)/2,u.push(p.x,p.y)}f+=h}for(let x=0;x<s;x++){let m=x*(n+1);for(let g=0;g<n;g++){let y=g+m,S=y,v=y+n+1,M=y+n+2,b=y+1;a.push(S,v,b),a.push(v,M,b)}}this.setIndex(a),this.setAttribute("position",new Le(l,3)),this.setAttribute("normal",new Le(c,3)),this.setAttribute("uv",new Le(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Ya=class i extends Ke{constructor(e=new us([new oe(0,.5),new oe(-.5,-.5),new oe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],s=[],r=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Le(s,3)),this.setAttribute("normal",new Le(r,3)),this.setAttribute("uv",new Le(o,2));function c(u){let f=s.length/3,h=u.extractPoints(t),d=h.shape,p=h.holes;jt.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,g=p.length;m<g;m++){let y=p[m];jt.isClockWise(y)===!0&&(p[m]=y.reverse())}let x=jt.triangulateShape(d,p);for(let m=0,g=p.length;m<g;m++){let y=p[m];d=d.concat(y)}for(let m=0,g=d.length;m<g;m++){let y=d[m];s.push(y.x,y.y,0),r.push(0,0,1),o.push(y.x,y.y)}for(let m=0,g=x.length;m<g;m++){let y=x[m],S=y[0]+f,v=y[1]+f,M=y[2]+f;n.push(S,v,M),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return iv(t,e)}static fromJSON(e,t){let n=[];for(let s=0,r=e.shapes.length;s<r;s++){let o=t[e.shapes[s]];n.push(o)}return new i(n,e.curveSegments)}};function iv(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}var so=class i extends Ke{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],f=new N,h=new N,d=[],p=[],x=[],m=[];for(let g=0;g<=n;g++){let y=[],S=g/n,v=o+S*a,M=e*Math.cos(v),b=Math.sqrt(e*e-M*M),E=0;g===0&&o===0?E=.5/t:g===n&&l===Math.PI&&(E=-.5/t);for(let _=0;_<=t;_++){let A=_/t,R=s+A*r;f.x=-b*Math.cos(R),f.y=M,f.z=b*Math.sin(R),p.push(f.x,f.y,f.z),h.copy(f).normalize(),x.push(h.x,h.y,h.z),m.push(A+E,1-S),y.push(c++)}u.push(y)}for(let g=0;g<n;g++)for(let y=0;y<t;y++){let S=u[g][y+1],v=u[g][y],M=u[g+1][y],b=u[g+1][y+1];(g!==0||o>0)&&d.push(S,v,b),(g!==n-1||l<Math.PI)&&d.push(v,M,b)}this.setIndex(d),this.setAttribute("position",new Le(p,3)),this.setAttribute("normal",new Le(x,3)),this.setAttribute("uv",new Le(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}},Za=class i extends Oi{constructor(e=1,t=0){let n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,s,e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},Ja=class i extends Ke{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],u=[],f=[],h=new N,d=new N,p=new N;for(let x=0;x<=n;x++){let m=o+x/n*a;for(let g=0;g<=s;g++){let y=g/s*r;d.x=(e+t*Math.cos(m))*Math.cos(y),d.y=(e+t*Math.cos(m))*Math.sin(y),d.z=t*Math.sin(m),c.push(d.x,d.y,d.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),p.subVectors(d,h).normalize(),u.push(p.x,p.y,p.z),f.push(g/s),f.push(x/n)}}for(let x=1;x<=n;x++)for(let m=1;m<=s;m++){let g=(s+1)*x+m-1,y=(s+1)*(x-1)+m-1,S=(s+1)*(x-1)+m,v=(s+1)*x+m;l.push(g,y,v),l.push(y,S,v)}this.setIndex(l),this.setAttribute("position",new Le(c,3)),this.setAttribute("normal",new Le(u,3)),this.setAttribute("uv",new Le(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}},$a=class i extends Ke{constructor(e=1,t=.4,n=64,s=8,r=2,o=3){super(),this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:s,p:r,q:o},n=Math.floor(n),s=Math.floor(s);let a=[],l=[],c=[],u=[],f=new N,h=new N,d=new N,p=new N,x=new N,m=new N,g=new N;for(let S=0;S<=n;++S){let v=S/n*r*Math.PI*2;y(v,r,o,e,d),y(v+.01,r,o,e,p),m.subVectors(p,d),g.addVectors(p,d),x.crossVectors(m,g),g.crossVectors(x,m),x.normalize(),g.normalize();for(let M=0;M<=s;++M){let b=M/s*Math.PI*2,E=-t*Math.cos(b),_=t*Math.sin(b);f.x=d.x+(E*g.x+_*x.x),f.y=d.y+(E*g.y+_*x.y),f.z=d.z+(E*g.z+_*x.z),l.push(f.x,f.y,f.z),h.subVectors(f,d).normalize(),c.push(h.x,h.y,h.z),u.push(S/n),u.push(M/s)}}for(let S=1;S<=n;S++)for(let v=1;v<=s;v++){let M=(s+1)*(S-1)+(v-1),b=(s+1)*S+(v-1),E=(s+1)*S+v,_=(s+1)*(S-1)+v;a.push(M,b,_),a.push(b,E,_)}this.setIndex(a),this.setAttribute("position",new Le(l,3)),this.setAttribute("normal",new Le(c,3)),this.setAttribute("uv",new Le(u,2));function y(S,v,M,b,E){let _=Math.cos(S),A=Math.sin(S),R=M/v*S,L=Math.cos(R);E.x=b*(2+L)*.5*_,E.y=b*(2+L)*A*.5,E.z=b*Math.sin(R)*.5}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}},Ka=class i extends Ke{constructor(e=new eo(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new N,l=new N,c=new oe,u=new N,f=[],h=[],d=[],p=[];x(),this.setIndex(p),this.setAttribute("position",new Le(f,3)),this.setAttribute("normal",new Le(h,3)),this.setAttribute("uv",new Le(d,2));function x(){for(let S=0;S<t;S++)m(S);m(r===!1?t:0),y(),g()}function m(S){u=e.getPointAt(S/t,u);let v=o.normals[S],M=o.binormals[S];for(let b=0;b<=s;b++){let E=b/s*Math.PI*2,_=Math.sin(E),A=-Math.cos(E);l.x=A*v.x+_*M.x,l.y=A*v.y+_*M.y,l.z=A*v.z+_*M.z,l.normalize(),h.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,f.push(a.x,a.y,a.z)}}function g(){for(let S=1;S<=t;S++)for(let v=1;v<=s;v++){let M=(s+1)*(S-1)+(v-1),b=(s+1)*S+(v-1),E=(s+1)*S+v,_=(s+1)*(S-1)+v;p.push(M,b,_),p.push(b,E,_)}}function y(){for(let S=0;S<=t;S++)for(let v=0;v<=s;v++)c.x=S/t,c.y=v/s,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new $u[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},ja=class extends Ke{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,s=new N,r=new N;if(e.index!==null){let o=e.attributes.position,a=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:a.count,materialIndex:0}]);for(let c=0,u=l.length;c<u;++c){let f=l[c],h=f.start,d=f.count;for(let p=h,x=h+d;p<x;p+=3)for(let m=0;m<3;m++){let g=a.getX(p+m),y=a.getX(p+(m+1)%3);s.fromBufferAttribute(o,g),r.fromBufferAttribute(o,y),x0(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{let o=e.attributes.position;for(let a=0,l=o.count/3;a<l;a++)for(let c=0;c<3;c++){let u=3*a+c,f=3*a+(c+1)%3;s.fromBufferAttribute(o,u),r.fromBufferAttribute(o,f),x0(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new Le(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function x0(i,e,t){let n=`${i.x},${i.y},${i.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${i.x},${i.y},${i.z}`;return t.has(n)===!0||t.has(s)===!0?!1:(t.add(n),t.add(s),!0)}var _0=Object.freeze({__proto__:null,BoxGeometry:ls,CapsuleGeometry:Pa,CircleGeometry:La,ConeGeometry:$r,CylinderGeometry:Jr,DodecahedronGeometry:Da,EdgesGeometry:Na,ExtrudeGeometry:Ha,IcosahedronGeometry:Wa,LatheGeometry:Xa,OctahedronGeometry:io,PlaneGeometry:qs,PolyhedronGeometry:Oi,RingGeometry:qa,ShapeGeometry:Ya,SphereGeometry:so,TetrahedronGeometry:Za,TorusGeometry:Ja,TorusKnotGeometry:$a,TubeGeometry:Ka,WireframeGeometry:ja}),Qa=class extends Bt{constructor(e){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new Se(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}};function ir(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(y0(s))s.isRenderTargetTexture?(_e("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(y0(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function hn(i){let e={};for(let t=0;t<i.length;t++){let n=ir(i[t]);for(let s in n)e[s]=n[s]}return e}function y0(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function sv(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function yp(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:at.workingColorSpace}var vp={clone:ir,merge:hn},rv=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ov=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,yn=class extends Bt{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=rv,this.fragmentShader=ov,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ir(e.uniforms),this.uniformsGroups=sv(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Se().setHex(s.value);break;case"v2":this.uniforms[n].value=new oe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new _t().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Qe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new $e().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ro=class extends yn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},oo=class extends Bt{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Se(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vi,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},el=class extends oo{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new oe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Je(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Se(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Se(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Se(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},tl=class extends Bt{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Se(16777215),this.specular=new Se(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vi,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.combine=_o,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},nl=class extends Bt{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new Se(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vi,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},il=class extends Bt{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vi,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}},sl=class extends Bt{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vi,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gn,this.combine=_o,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ao=class extends Bt{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ap,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},lo=class extends Bt{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},rl=class extends Bt{constructor(e){super(),this.isMeshMatcapMaterial=!0,this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new Se(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vi,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={MATCAP:""},this.color.copy(e.color),this.matcap=e.matcap,this.map=e.map,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this.fog=e.fog,this}},ol=class extends Jt{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}};function Qn(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function aa(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function Zg(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Ed(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=i[a+l]}return s}function Jg(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}function av(i,e,t,n,s=30){let r=i.clone();r.name=e;let o=[];for(let l=0;l<r.tracks.length;++l){let c=r.tracks[l],u=c.getValueSize(),f=[],h=[];for(let d=0;d<c.times.length;++d){let p=c.times[d]*s;if(!(p<t||p>=n)){f.push(c.times[d]);for(let x=0;x<u;++x)h.push(c.values[d*u+x])}}f.length!==0&&(c.times=Qn(f,c.times.constructor),c.values=Qn(h,c.values.constructor),o.push(c))}r.tracks=o;let a=1/0;for(let l=0;l<r.tracks.length;++l)a>r.tracks[l].times[0]&&(a=r.tracks[l].times[0]);for(let l=0;l<r.tracks.length;++l)r.tracks[l].shift(-1*a);return r.resetDuration(),r}function lv(i,e=0,t=i,n=30){n<=0&&(n=30);let s=t.tracks.length,r=e/n;for(let o=0;o<s;++o){let a=t.tracks[o],l=a.ValueTypeName;if(l==="bool"||l==="string")continue;let c=i.tracks.find(function(g){return g.name===a.name&&g.ValueTypeName===l});if(c===void 0)continue;let u=0,f=a.getValueSize();a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(u=f/3);let h=0,d=c.getValueSize();c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(h=d/3);let p=a.times.length-1,x;if(r<=a.times[0]){let g=u,y=f-u;x=a.values.slice(g,y)}else if(r>=a.times[p]){let g=p*f+u,y=g+f-u;x=a.values.slice(g,y)}else{let g=a.createInterpolant(),y=u,S=f-u;g.evaluate(r),x=g.resultBuffer.slice(y,S)}l==="quaternion"&&new Zt().fromArray(x).normalize().conjugate().toArray(x);let m=c.times.length;for(let g=0;g<m;++g){let y=g*d+h;if(l==="quaternion")Zt.multiplyQuaternionsFlat(c.values,y,x,0,c.values,y);else{let S=d-h*2;for(let v=0;v<S;++v)c.values[y+v]-=x[v]}}}return i.blendMode=af,i}var Ku=class{static convertArray(e,t){return Qn(e,t)}static isTypedArray(e){return Ug(e)}static hasTangents(e){return aa(e)}static getKeyframeOrder(e){return Zg(e)}static sortedArray(e,t,n){return Ed(e,t,n)}static flattenJSON(e,t,n,s){Jg(e,t,n,s)}static subclip(e,t,n,s,r=30){return av(e,t,n,s,r)}static makeClipAdditive(e,t=0,n=e,s=30){return lv(e,t,n,s)}},Bi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},al=class extends Bi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ns,endingEnd:ns}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case is:r=e,a=2*t-n;break;case Or:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case is:o=e,l=2*n-t;break;case Or:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,d=this._weightNext,p=(n-t)/(s-t),x=p*p,m=x*p,g=-h*m+2*h*x-h*p,y=(1+h)*m+(-1.5-2*h)*x+(-.5+h)*p+1,S=(-1-d)*m+(1.5+d)*x+.5*p,v=d*m-d*x;for(let M=0;M!==a;++M)r[M]=g*o[u+M]+y*o[c+M]+S*o[l+M]+v*o[f+M];return r}},co=class extends Bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(s-t),f=1-u;for(let h=0;h!==a;++h)r[h]=o[c+h]*f+o[l+h]*u;return r}},ll=class extends Bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},cl=class extends Bi{interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this.inTangents,f=this.outTangents;if(!u||!f){let p=(n-t)/(s-t),x=1-p;for(let m=0;m!==a;++m)r[m]=o[c+m]*x+o[l+m]*p;return r}let h=a*2,d=e-1;for(let p=0;p!==a;++p){let x=o[c+p],m=o[l+p],g=d*h+p*2,y=f[g],S=f[g+1],v=e*h+p*2,M=u[v],b=u[v+1],E=uv(n,t,y,M,s);r[p]=$g(E,x,S,b,m)}return r}};function $g(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function cv(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function uv(i,e,t,n,s){let r=(i-e)/(s-e);for(let o=0;o<8;o++){let a=$g(r,e,t,n,s)-i;if(Math.abs(a)<1e-10)break;let l=cv(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var vn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Qn(t,this.TimeBufferType),this.values=Qn(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Qn(e.times,Array),values:Qn(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),aa(e.settings)&&(n.settings={inTangents:Qn(e.settings.inTangents,Array),outTangents:Qn(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ll(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new co(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new al(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new cl(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Fr:t=this.InterpolantFactoryMethodDiscrete;break;case ma:t=this.InterpolantFactoryMethodLinear;break;case na:t=this.InterpolantFactoryMethodSmooth;break;case Pu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return _e("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Fr;case this.InterpolantFactoryMethodLinear:return ma;case this.InterpolantFactoryMethodSmooth:return na;case this.InterpolantFactoryMethodBezier:return Pu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;aa(this.settings)&&(v0(this.settings.inTangents,e),v0(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ke("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(ke("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){ke("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){ke("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Ug(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){ke("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===na,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(s)l=!0;else{let f=a*n,h=f-n,d=f+n;for(let p=0;p!==n;++p){let x=t[f+p];if(x!==t[h+p]||x!==t[d+p]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let f=a*n,h=o*n;for(let d=0;d!==n;++d)t[h+d]=t[f+d]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,aa(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function v0(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}vn.prototype.ValueTypeName="";vn.prototype.TimeBufferType=Float32Array;vn.prototype.ValueBufferType=Float32Array;vn.prototype.DefaultInterpolation=ma;var _i=class extends vn{constructor(e,t,n){super(e,t,n)}};_i.prototype.ValueTypeName="bool";_i.prototype.ValueBufferType=Array;_i.prototype.DefaultInterpolation=Fr;_i.prototype.InterpolantFactoryMethodLinear=void 0;_i.prototype.InterpolantFactoryMethodSmooth=void 0;var uo=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}};uo.prototype.ValueTypeName="color";var Ys=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}};Ys.prototype.ValueTypeName="number";var ul=class extends Bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let u=c+a;c!==u;c+=4)Zt.slerpFlat(r,0,o,c-a,o,c,l);return r}},Zs=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ul(this.times,this.values,this.getValueSize(),e)}};Zs.prototype.ValueTypeName="quaternion";Zs.prototype.InterpolantFactoryMethodSmooth=void 0;var yi=class extends vn{constructor(e,t,n){super(e,t,n)}};yi.prototype.ValueTypeName="string";yi.prototype.ValueBufferType=Array;yi.prototype.DefaultInterpolation=Fr;yi.prototype.InterpolantFactoryMethodLinear=void 0;yi.prototype.InterpolantFactoryMethodSmooth=void 0;var ho=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}};ho.prototype.ValueTypeName="vector";var hs=class{constructor(e="",t=-1,n=[],s=hc){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Ln(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(fv(n[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(vn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);let u=Zg(l);l=Ed(l,1,u),c=Ed(c,1,u),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Ys(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],u=c.name.match(r);if(u&&u.length>1){let f=u[1],h=s[f];h||(s[f]=h=[]),h.push(c)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function hv(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ys;case"vector":case"vector2":case"vector3":case"vector4":return ho;case"color":return uo;case"quaternion":return Zs;case"bool":case"boolean":return _i;case"string":return yi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function fv(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=hv(i.type);if(i.times===void 0){let n=[],s=[];Jg(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),aa(i.settings)&&(t.settings={inTangents:Qn(i.settings.inTangents,Float32Array),outTangents:Qn(i.settings.outTangents,Float32Array)}),t}var ti={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(b0(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!b0(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function b0(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var fo=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,f){return c.push(u,f),this},this.removeHandler=function(u){let f=c.indexOf(u);return f!==-1&&c.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=c.length;f<h;f+=2){let d=c[f],p=c[f+1];if(d.global&&(d.lastIndex=0),d.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},bp=new fo,en=class{constructor(e){this.manager=e!==void 0?e:bp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};en.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ii={},Td=class extends Error{constructor(e,t){super(e),this.response=t}},Hn=class extends en{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ti.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Ii[e]!==void 0){Ii[e].push({onLoad:t,onProgress:n,onError:s});return}Ii[e]=[],Ii[e].push({onLoad:t,onProgress:n,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&_e("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=Ii[e],f=c.body.getReader(),h=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),d=h?parseInt(h):0,p=d!==0,x=0,m=new ReadableStream({start(g){y();function y(){f.read().then(({done:S,value:v})=>{if(S)g.close();else{x+=v.byteLength;let M=new ProgressEvent("progress",{lengthComputable:p,loaded:x,total:d});for(let b=0,E=u.length;b<E;b++){let _=u[b];_.onProgress&&_.onProgress(M)}g.enqueue(v),y()}},S=>{g.error(S)})}}});return new Response(m)}else throw new Td(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a==="")return c.text();{let f=/charset="?([^;"\s]*)"?/i.exec(a),h=f&&f[1]?f[1].toLowerCase():void 0,d=new TextDecoder(h);return c.arrayBuffer().then(p=>d.decode(p))}}}).then(c=>{ti.add(`file:${e}`,c);let u=Ii[e];delete Ii[e];for(let f=0,h=u.length;f<h;f++){let d=u[f];d.onLoad&&d.onLoad(c)}}).catch(c=>{let u=Ii[e];if(u===void 0)throw this.manager.itemError(e),c;delete Ii[e];for(let f=0,h=u.length;f<h;f++){let d=u[f];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},ju=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=this,o=new Hn(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(r.parse(JSON.parse(a)))}catch(l){s?s(l):ke(l),r.manager.itemError(e)}},n,s)}parse(e){let t=[];for(let n=0;n<e.length;n++){let s=hs.parse(e[n]);t.push(s)}return t}},Qu=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=this,o=[],a=new Hs,l=new Hn(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(r.withCredentials);let c=0;function u(f){l.load(e[f],function(h){let d=r.parse(h,!0);o[f]={width:d.width,height:d.height,format:d.format,mipmaps:d.mipmaps},c+=1,c===6&&(d.mipmapCount===1&&(a.minFilter=wt),a.image=o,a.format=d.format,a.needsUpdate=!0,t&&t(a))},n,s)}if(Array.isArray(e))for(let f=0,h=e.length;f<h;++f)u(f);else l.load(e,function(f){let h=r.parse(f,!0);if(h.isCubemap){let d=h.mipmaps.length/h.mipmapCount;for(let p=0;p<d;p++){o[p]={mipmaps:[]};for(let x=0;x<h.mipmapCount;x++)o[p].mipmaps.push(h.mipmaps[p*h.mipmapCount+x]),o[p].format=h.format,o[p].width=h.width,o[p].height=h.height}a.image=o}else a.image.width=h.width,a.image.height=h.height,a.mipmaps=h.mipmaps;h.mipmapCount===1&&(a.minFilter=wt),a.format=h.format,a.needsUpdate=!0,t&&t(a)},n,s);return a}},Tr=new WeakMap,fs=class extends en{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ti.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let f=Tr.get(o);f===void 0&&(f=[],Tr.set(o,f)),f.push({onLoad:t,onError:s})}return o}let a=Vr("img");function l(){u(),t&&t(this);let f=Tr.get(this)||[];for(let h=0;h<f.length;h++){let d=f[h];d.onLoad&&d.onLoad(this)}Tr.delete(this),r.manager.itemEnd(e)}function c(f){u(),s&&s(f),ti.remove(`image:${e}`);let h=Tr.get(this)||[];for(let d=0;d<h.length;d++){let p=h[d];p.onError&&p.onError(f)}Tr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),ti.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}},eh=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=new as;r.colorSpace=mn;let o=new fs(this.manager);o.setCrossOrigin(this.crossOrigin),o.setPath(this.path);let a=0;function l(c){o.load(e[c],function(u){r.images[c]=u,a++,a===6&&(r.needsUpdate=!0,t&&t(r))},void 0,s)}for(let c=0;c<e.length;++c)l(c);return r}},th=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=this,o=new _n,a=new Hn(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(r.withCredentials),a.load(e,function(l){let c;try{c=r.parse(l)}catch(u){s!==void 0?s(u):ke(u);return}r._applyTexData(o,c),t&&t(o,c)},n,s),o}createDataTexture(e){let t=new _n;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:xn,e.wrapT=t.wrapT!==void 0?t.wrapT:xn,e.magFilter=t.magFilter!==void 0?t.magFilter:wt,e.minFilter=t.minFilter!==void 0?t.minFilter:wt,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=ai),t.mipmapCount===1&&(e.minFilter=wt),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}},nh=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=new It,o=new fs(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},si=class extends ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Se(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},hl=class extends si{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Se(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},pd=new $e,M0=new N,S0=new N,Js=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new oe(512,512),this.mapType=bn,this.map=null,this.mapPass=null,this.matrix=new $e,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new xi,this._frameExtents=new oe(1,1),this._viewportCount=1,this._viewports=[new _t(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;M0.setFromMatrixPosition(e.matrixWorld),t.position.copy(M0),S0.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(S0),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){pd.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(pd,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===ss||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(pd)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},bu=new N,Mu=new Zt,mi=new N,$s=class extends ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new $e,this.projectionMatrix=new $e,this.projectionMatrixInverse=new $e,this.coordinateSystem=wn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(bu,Mu,mi),mi.x===1&&mi.y===1&&mi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(bu,Mu,mi.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(bu,Mu,mi),mi.x===1&&mi.y===1&&mi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(bu,Mu,mi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},es=new N,w0=new oe,A0=new oe,Ft=class extends $s{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Os*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Us*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Os*2*Math.atan(Math.tan(Us*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){es.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(es.x,es.y).multiplyScalar(-e/es.z),es.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(es.x,es.y).multiplyScalar(-e/es.z)}getViewSize(e,t){return this.getViewBounds(e,w0,A0),t.subVectors(A0,w0)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Us*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Rd=class extends Js{constructor(){super(new Ft(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Os*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},fl=class extends si{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Rd}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Cd=class extends Js{constructor(){super(new Ft(90,1,.5,500)),this.isPointLightShadow=!0}},dl=class extends si{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Cd}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},ds=class extends $s{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Id=class extends Js{constructor(){super(new ds(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},pl=class extends si{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.shadow=new Id}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},ml=class extends si{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}},gl=class extends si{constructor(e,t,n=10,s=10){super(e,t),this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=n,this.height=s}get power(){return this.intensity*this.width*this.height*Math.PI}set power(e){this.intensity=e/(this.width*this.height*Math.PI)}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){let t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}},po=class{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new N)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){let n=e.x,s=e.y,r=e.z,o=this.coefficients;return t.copy(o[0]).multiplyScalar(.282095),t.addScaledVector(o[1],.488603*s),t.addScaledVector(o[2],.488603*r),t.addScaledVector(o[3],.488603*n),t.addScaledVector(o[4],1.092548*(n*s)),t.addScaledVector(o[5],1.092548*(s*r)),t.addScaledVector(o[6],.315392*(3*r*r-1)),t.addScaledVector(o[7],1.092548*(n*r)),t.addScaledVector(o[8],.546274*(n*n-s*s)),t}getIrradianceAt(e,t){let n=e.x,s=e.y,r=e.z,o=this.coefficients;return t.copy(o[0]).multiplyScalar(.886227),t.addScaledVector(o[1],2*.511664*s),t.addScaledVector(o[2],2*.511664*r),t.addScaledVector(o[3],2*.511664*n),t.addScaledVector(o[4],2*.429043*n*s),t.addScaledVector(o[5],2*.429043*s*r),t.addScaledVector(o[6],.743125*r*r-.247708),t.addScaledVector(o[7],2*.429043*n*r),t.addScaledVector(o[8],.429043*(n*n-s*s)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){let n=this.coefficients;for(let s=0;s<9;s++)n[s].fromArray(e,t+s*3);return this}toArray(e=[],t=0){let n=this.coefficients;for(let s=0;s<9;s++)n[s].toArray(e,t+s*3);return e}static getBasisAt(e,t){let n=e.x,s=e.y,r=e.z;t[0]=.282095,t[1]=.488603*s,t[2]=.488603*r,t[3]=.488603*n,t[4]=1.092548*n*s,t[5]=1.092548*s*r,t[6]=.315392*(3*r*r-1),t[7]=1.092548*n*r,t[8]=.546274*(n*n-s*s)}},xl=class extends si{constructor(e=new po,t=1){super(void 0,t),this.isLightProbe=!0,this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}toJSON(e){let t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}},E0={},_l=class i extends en{constructor(e){super(e),this.textures={}}load(e,t,n,s){let r=this,o=new Hn(r.manager);o.setPath(r.path),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(a){try{t(r.parse(JSON.parse(a)))}catch(l){s?s(l):ke(l),r.manager.itemError(e)}},n,s)}parse(e){let t=this.createMaterialFromType(e.type);return t.fromJSON(e,this.textures),t}setTextures(e){return this.textures=e,this}createMaterialFromType(e){return i.createMaterialFromType(e)}static createMaterialFromType(e){let n={ShadowMaterial:Qa,SpriteMaterial:Xr,RawShaderMaterial:ro,ShaderMaterial:yn,PointsMaterial:Yr,MeshPhysicalMaterial:el,MeshStandardMaterial:oo,MeshPhongMaterial:tl,MeshToonMaterial:nl,MeshNormalMaterial:il,MeshLambertMaterial:sl,MeshDepthMaterial:ao,MeshDistanceMaterial:lo,MeshBasicMaterial:En,MeshMatcapMaterial:rl,LineDashedMaterial:ol,LineBasicMaterial:Jt,Material:Bt,...E0}[e],s;return n===void 0?(gi(`MaterialLoader: Unknown material type "${e}". Use .registerMaterial() before starting the deserialization process.`),s=new Bt):s=new n,s}static registerMaterial(e,t){E0[e]=t}},mo=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},yl=class extends Ke{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},vl=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=this,o=new Hn(r.manager);o.setPath(r.path),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(a){try{t(r.parse(JSON.parse(a)))}catch(l){s?s(l):ke(l),r.manager.itemError(e)}},n,s)}parse(e){let t={},n={};function s(d,p){if(t[p]!==void 0)return t[p];let m=d.interleavedBuffers[p],g=r(d,m.buffer),y=Lr(m.type,g),S=new Gs(y,m.stride);return S.uuid=m.uuid,m.usage!==void 0&&S.setUsage(m.usage),t[p]=S,S}function r(d,p){if(n[p]!==void 0)return n[p];let m=d.arrayBuffers[p],g=new Uint32Array(m).buffer;return n[p]=g,g}let o=e.isInstancedBufferGeometry?new yl:new Ke,a=e.data.index;if(a!==void 0){let d=Lr(a.type,a.array);o.setIndex(new tt(d,1))}let l=e.data.attributes;for(let d in l){let p=l[d],x;if(p.isInterleavedBufferAttribute){let m=s(e.data,p.data);x=new os(m,p.itemSize,p.offset,p.normalized)}else{let m=Lr(p.type,p.array),g=p.isInstancedBufferAttribute?Ui:tt;x=new g(m,p.itemSize,p.normalized)}p.name!==void 0&&(x.name=p.name),p.usage!==void 0&&x.setUsage(p.usage),p.gpuType!==void 0&&(x.gpuType=p.gpuType),o.setAttribute(d,x)}let c=e.data.morphAttributes;if(c)for(let d in c){let p=c[d],x=[];for(let m=0,g=p.length;m<g;m++){let y=p[m],S;if(y.isInterleavedBufferAttribute){let v=s(e.data,y.data);S=new os(v,y.itemSize,y.offset,y.normalized)}else{let v=Lr(y.type,y.array);S=new tt(v,y.itemSize,y.normalized)}y.name!==void 0&&(S.name=y.name),y.usage!==void 0&&S.setUsage(y.usage),y.gpuType!==void 0&&(S.gpuType=y.gpuType),x.push(S)}o.morphAttributes[d]=x}e.data.morphTargetsRelative&&(o.morphTargetsRelative=!0);let f=e.data.groups||e.data.drawcalls||e.data.offsets;if(f!==void 0)for(let d=0,p=f.length;d!==p;++d){let x=f[d];o.addGroup(x.start,x.count,x.materialIndex)}let h=e.data.boundingSphere;return h!==void 0&&(o.boundingSphere=new Ot().fromJSON(h)),e.name&&(o.name=e.name),e.userData&&(o.userData=e.userData),o}},md={},ih=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=this,o=this.path===""?mo.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||o;let a=new Hn(this.manager);a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(l){let c=null;try{c=JSON.parse(l)}catch(f){s!==void 0&&s(f),ke("ObjectLoader: Can't parse "+e+".",f.message);return}let u=c.metadata;if(u===void 0||u.type===void 0||u.type.toLowerCase()==="geometry"){s!==void 0&&s(new Error("THREE.ObjectLoader: Can't load "+e)),ke("ObjectLoader: Can't load "+e);return}r.parse(c,t)},n,s)}async loadAsync(e,t){let n=this,s=this.path===""?mo.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||s;let r=new Hn(this.manager);r.setPath(this.path),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials);let o=await r.loadAsync(e,t),a;try{a=JSON.parse(o)}catch(c){throw new Error("THREE.ObjectLoader: Can't parse "+e+". "+c.message)}let l=a.metadata;if(l===void 0||l.type===void 0||l.type.toLowerCase()==="geometry")throw new Error("THREE.ObjectLoader: Can't load "+e);return await n.parseAsync(a)}parse(e,t){let n=this.parseAnimations(e.animations),s=this.parseShapes(e.shapes),r=this.parseGeometries(e.geometries,s),o=this.parseImages(e.images,function(){t!==void 0&&t(c)}),a=this.parseTextures(e.textures,o),l=this.parseMaterials(e.materials,a),c=this.parseObject(e.object,r,l,a,n),u=this.parseSkeletons(e.skeletons,c);if(this.bindSkeletons(c,u),this.bindLightTargets(c),t!==void 0){let f=!1;for(let h in o)if(o[h].data instanceof HTMLImageElement){f=!0;break}f===!1&&t(c)}return c}async parseAsync(e){let t=this.parseAnimations(e.animations),n=this.parseShapes(e.shapes),s=this.parseGeometries(e.geometries,n),r=await this.parseImagesAsync(e.images),o=this.parseTextures(e.textures,r),a=this.parseMaterials(e.materials,o),l=this.parseObject(e.object,s,a,o,t),c=this.parseSkeletons(e.skeletons,l);return this.bindSkeletons(l,c),this.bindLightTargets(l),l}static registerGeometry(e,t){md[e]=t}parseShapes(e){let t={};if(e!==void 0)for(let n=0,s=e.length;n<s;n++){let r=new us().fromJSON(e[n]);t[r.uuid]=r}return t}parseSkeletons(e,t){let n={},s={};if(t.traverse(function(r){r.isBone&&(s[r.uuid]=r)}),e!==void 0)for(let r=0,o=e.length;r<o;r++){let a=new Sa().fromJSON(e[r],s);n[a.uuid]=a}return n}parseGeometries(e,t){let n={};if(e!==void 0){let s=new vl;for(let r=0,o=e.length;r<o;r++){let a,l=e[r];switch(l.type){case"BufferGeometry":case"InstancedBufferGeometry":a=s.parse(l);break;default:l.type in _0?a=_0[l.type].fromJSON(l,t):l.type in md?a=md[l.type].fromJSON(l,t):_e(`ObjectLoader: Unknown geometry type "${l.type}". Use .registerGeometry() before starting the deserialization process.`)}a.uuid=l.uuid,l.name!==void 0&&(a.name=l.name),l.userData!==void 0&&(a.userData=l.userData),n[l.uuid]=a}}return n}parseMaterials(e,t){let n={},s={};if(e!==void 0){let r=new _l;r.setTextures(t);for(let o=0,a=e.length;o<a;o++){let l=e[o];n[l.uuid]===void 0&&(n[l.uuid]=r.parse(l)),s[l.uuid]=n[l.uuid]}}return s}parseAnimations(e){let t={};if(e!==void 0)for(let n=0;n<e.length;n++){let s=e[n],r=hs.parse(s);t[r.uuid]=r}return t}parseImages(e,t){let n=this,s={},r;function o(l){return l=n.manager.resolveURL(l),n.manager.itemStart(l),r.load(l,function(){n.manager.itemEnd(l)},void 0,function(){n.manager.itemError(l),n.manager.itemEnd(l)})}function a(l){if(typeof l=="string"){let c=l,u=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(c)?c:n.resourcePath+c;return o(u)}else return l.data?{data:Lr(l.type,l.data),width:l.width,height:l.height}:null}if(e!==void 0&&e.length>0){let l=new fo(t);r=new fs(l),r.setCrossOrigin(this.crossOrigin);for(let c=0,u=e.length;c<u;c++){let f=e[c],h=f.url;if(Array.isArray(h)){let d=[];for(let p=0,x=h.length;p<x;p++){let m=h[p],g=a(m);g!==null&&(g instanceof HTMLImageElement?d.push(g):d.push(new _n(g.data,g.width,g.height)))}s[f.uuid]=new zn(d)}else{let d=a(f.url);s[f.uuid]=new zn(d)}}}return s}async parseImagesAsync(e){let t=this,n={},s;async function r(o){if(typeof o=="string"){let a=o,l=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(a)?a:t.resourcePath+a;return await s.loadAsync(l)}else return o.data?{data:Lr(o.type,o.data),width:o.width,height:o.height}:null}if(e!==void 0&&e.length>0){s=new fs(this.manager),s.setCrossOrigin(this.crossOrigin);for(let o=0,a=e.length;o<a;o++){let l=e[o],c=l.url;if(Array.isArray(c)){let u=[];for(let f=0,h=c.length;f<h;f++){let d=c[f],p=await r(d);p!==null&&(p instanceof HTMLImageElement?u.push(p):u.push(new _n(p.data,p.width,p.height)))}n[l.uuid]=new zn(u)}else{let u=await r(l.url);n[l.uuid]=new zn(u)}}}return n}parseTextures(e,t){function n(r,o){return typeof r=="number"?r:(_e("ObjectLoader.parseTexture: Constant should be in numeric form.",r),o[r])}let s={};if(e!==void 0)for(let r=0,o=e.length;r<o;r++){let a=e[r];a.image===void 0&&_e('ObjectLoader: No "image" specified for',a.uuid),t[a.image]===void 0&&_e("ObjectLoader: Undefined image",a.image);let l=t[a.image],c=l.data,u;Array.isArray(c)?(u=new as,c.length===6&&(u.needsUpdate=!0)):(c&&c.data?u=new _n:u=new It,c&&(u.needsUpdate=!0)),u.source=l,u.uuid=a.uuid,a.name!==void 0&&(u.name=a.name),a.mapping!==void 0&&(u.mapping=n(a.mapping,dv)),a.channel!==void 0&&(u.channel=a.channel),a.offset!==void 0&&u.offset.fromArray(a.offset),a.repeat!==void 0&&u.repeat.fromArray(a.repeat),a.center!==void 0&&u.center.fromArray(a.center),a.rotation!==void 0&&(u.rotation=a.rotation),a.wrap!==void 0&&(u.wrapS=n(a.wrap[0],T0),u.wrapT=n(a.wrap[1],T0)),a.format!==void 0&&(u.format=a.format),a.internalFormat!==void 0&&(u.internalFormat=a.internalFormat),a.type!==void 0&&(u.type=a.type),a.colorSpace!==void 0&&(u.colorSpace=a.colorSpace),a.minFilter!==void 0&&(u.minFilter=n(a.minFilter,R0)),a.magFilter!==void 0&&(u.magFilter=n(a.magFilter,R0)),a.anisotropy!==void 0&&(u.anisotropy=a.anisotropy),a.flipY!==void 0&&(u.flipY=a.flipY),a.generateMipmaps!==void 0&&(u.generateMipmaps=a.generateMipmaps),a.premultiplyAlpha!==void 0&&(u.premultiplyAlpha=a.premultiplyAlpha),a.unpackAlignment!==void 0&&(u.unpackAlignment=a.unpackAlignment),a.compareFunction!==void 0&&(u.compareFunction=a.compareFunction),a.normalized!==void 0&&(u.normalized=a.normalized),a.userData!==void 0&&(u.userData=a.userData),s[a.uuid]=u}return s}parseObject(e,t,n,s,r){let o;function a(h){return t[h]===void 0&&_e("ObjectLoader: Undefined geometry",h),t[h]}function l(h){if(h!==void 0){if(Array.isArray(h)){let d=[];for(let p=0,x=h.length;p<x;p++){let m=h[p];n[m]===void 0&&_e("ObjectLoader: Undefined material",m),d.push(n[m])}return d}return n[h]===void 0&&_e("ObjectLoader: Undefined material",h),n[h]}}function c(h){return s[h]===void 0&&_e("ObjectLoader: Undefined texture",h),s[h]}let u,f;switch(e.type){case"Scene":o=new ya,e.background!==void 0&&(Number.isInteger(e.background)?o.background=new Se(e.background):o.background=c(e.background)),e.environment!==void 0&&(o.environment=c(e.environment)),e.fog!==void 0&&(e.fog.type==="Fog"?o.fog=new _a(e.fog.color,e.fog.near,e.fog.far):e.fog.type==="FogExp2"&&(o.fog=new xa(e.fog.color,e.fog.density)),e.fog.name!==""&&(o.fog.name=e.fog.name)),e.backgroundBlurriness!==void 0&&(o.backgroundBlurriness=e.backgroundBlurriness),e.backgroundIntensity!==void 0&&(o.backgroundIntensity=e.backgroundIntensity),e.backgroundRotation!==void 0&&o.backgroundRotation.fromArray(e.backgroundRotation),e.environmentIntensity!==void 0&&(o.environmentIntensity=e.environmentIntensity),e.environmentRotation!==void 0&&o.environmentRotation.fromArray(e.environmentRotation);break;case"PerspectiveCamera":o=new Ft(e.fov,e.aspect,e.near,e.far),e.focus!==void 0&&(o.focus=e.focus),e.zoom!==void 0&&(o.zoom=e.zoom),e.filmGauge!==void 0&&(o.filmGauge=e.filmGauge),e.filmOffset!==void 0&&(o.filmOffset=e.filmOffset),e.view!==void 0&&(o.view=Object.assign({},e.view));break;case"OrthographicCamera":o=new ds(e.left,e.right,e.top,e.bottom,e.near,e.far),e.zoom!==void 0&&(o.zoom=e.zoom),e.view!==void 0&&(o.view=Object.assign({},e.view));break;case"AmbientLight":o=new ml(e.color,e.intensity);break;case"DirectionalLight":o=new pl(e.color,e.intensity),o.target=e.target||"";break;case"PointLight":o=new dl(e.color,e.intensity,e.distance,e.decay);break;case"RectAreaLight":o=new gl(e.color,e.intensity,e.width,e.height);break;case"SpotLight":o=new fl(e.color,e.intensity,e.distance,e.angle,e.penumbra,e.decay),o.target=e.target||"";break;case"HemisphereLight":o=new hl(e.color,e.groundColor,e.intensity);break;case"LightProbe":let h=new po().fromArray(e.sh);o=new xl(h,e.intensity);break;case"SkinnedMesh":u=a(e.geometry),f=l(e.material),o=new Ma(u,f),e.bindMode!==void 0&&(o.bindMode=e.bindMode),e.bindMatrix!==void 0&&o.bindMatrix.fromArray(e.bindMatrix),e.skeleton!==void 0&&(o.skeleton=e.skeleton);break;case"Mesh":u=a(e.geometry),f=l(e.material),o=new Tt(u,f);break;case"InstancedMesh":u=a(e.geometry),f=l(e.material);let d=e.count,p=e.instanceMatrix,x=e.instanceColor;o=new wa(u,f,d),o.instanceMatrix=new Ui(new Float32Array(p.array),16),x!==void 0&&(o.instanceColor=new Ui(new Float32Array(x.array),x.itemSize));break;case"BatchedMesh":u=a(e.geometry),f=l(e.material),o=new Ea(e.maxInstanceCount,e.maxVertexCount,e.maxIndexCount,f),o.geometry=u,o.perObjectFrustumCulled=e.perObjectFrustumCulled,o.sortObjects=e.sortObjects,o._drawRanges=e.drawRanges,o._reservedRanges=e.reservedRanges,o._geometryInfo=e.geometryInfo.map(m=>{let g=null,y=null;return m.boundingBox!==void 0&&(g=new zt().fromJSON(m.boundingBox)),m.boundingSphere!==void 0&&(y=new Ot().fromJSON(m.boundingSphere)),{...m,boundingBox:g,boundingSphere:y}}),o._instanceInfo=e.instanceInfo,o._availableInstanceIds=e._availableInstanceIds,o._availableGeometryIds=e._availableGeometryIds,o._nextIndexStart=e.nextIndexStart,o._nextVertexStart=e.nextVertexStart,o._geometryCount=e.geometryCount,o._maxInstanceCount=e.maxInstanceCount,o._maxVertexCount=e.maxVertexCount,o._maxIndexCount=e.maxIndexCount,o._geometryInitialized=e.geometryInitialized,o._matricesTexture=c(e.matricesTexture.uuid),o._indirectTexture=c(e.indirectTexture.uuid),e.colorsTexture!==void 0&&(o._colorsTexture=c(e.colorsTexture.uuid)),e.boundingSphere!==void 0&&(o.boundingSphere=new Ot().fromJSON(e.boundingSphere)),e.boundingBox!==void 0&&(o.boundingBox=new zt().fromJSON(e.boundingBox));break;case"LOD":o=new ba;break;case"Line":o=new ii(a(e.geometry),l(e.material));break;case"LineLoop":o=new Ta(a(e.geometry),l(e.material));break;case"LineSegments":o=new Dn(a(e.geometry),l(e.material));break;case"PointCloud":case"Points":o=new Ra(a(e.geometry),l(e.material));break;case"Sprite":o=new va(l(e.material));break;case"Group":o=new Li;break;case"Bone":o=new qr;break;default:o=new ft}if(o.uuid=e.uuid,e.name!==void 0&&(o.name=e.name),e.matrix!==void 0?(o.matrix.fromArray(e.matrix),e.matrixAutoUpdate!==void 0&&(o.matrixAutoUpdate=e.matrixAutoUpdate),o.matrixAutoUpdate&&o.matrix.decompose(o.position,o.quaternion,o.scale)):(e.position!==void 0&&o.position.fromArray(e.position),e.rotation!==void 0&&o.rotation.fromArray(e.rotation),e.quaternion!==void 0&&o.quaternion.fromArray(e.quaternion),e.scale!==void 0&&o.scale.fromArray(e.scale)),e.up!==void 0&&o.up.fromArray(e.up),e.pivot!==void 0&&(o.pivot=new N().fromArray(e.pivot)),e.morphTargetDictionary!==void 0&&(o.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),e.morphTargetInfluences!==void 0&&(o.morphTargetInfluences=e.morphTargetInfluences.slice()),e.castShadow!==void 0&&(o.castShadow=e.castShadow),e.receiveShadow!==void 0&&(o.receiveShadow=e.receiveShadow),e.shadow&&(e.shadow.intensity!==void 0&&(o.shadow.intensity=e.shadow.intensity),e.shadow.bias!==void 0&&(o.shadow.bias=e.shadow.bias),e.shadow.normalBias!==void 0&&(o.shadow.normalBias=e.shadow.normalBias),e.shadow.radius!==void 0&&(o.shadow.radius=e.shadow.radius),e.shadow.blurSamples!==void 0&&(o.shadow.blurSamples=e.shadow.blurSamples),e.shadow.focus!==void 0&&(o.shadow.focus=e.shadow.focus),e.shadow.aspect!==void 0&&(o.shadow.aspect=e.shadow.aspect),e.shadow.mapSize!==void 0&&o.shadow.mapSize.fromArray(e.shadow.mapSize),e.shadow.camera!==void 0&&(o.shadow.camera=this.parseObject(e.shadow.camera))),e.visible!==void 0&&(o.visible=e.visible),e.frustumCulled!==void 0&&(o.frustumCulled=e.frustumCulled),e.renderOrder!==void 0&&(o.renderOrder=e.renderOrder),e.static!==void 0&&(o.static=e.static),e.userData!==void 0&&(o.userData=e.userData),e.layers!==void 0&&(o.layers.mask=e.layers),e.children!==void 0){let h=e.children;for(let d=0;d<h.length;d++)o.add(this.parseObject(h[d],t,n,s,r))}if(e.animations!==void 0){let h=e.animations;for(let d=0;d<h.length;d++){let p=h[d];o.animations.push(r[p])}}if(e.type==="LOD"){e.autoUpdate!==void 0&&(o.autoUpdate=e.autoUpdate);let h=e.levels;for(let d=0;d<h.length;d++){let p=h[d],x=o.getObjectByProperty("uuid",p.object);x!==void 0&&o.addLevel(x,p.distance,p.hysteresis)}}return o}bindSkeletons(e,t){Object.keys(t).length!==0&&e.traverse(function(n){if(n.isSkinnedMesh===!0&&n.skeleton!==void 0){let s=t[n.skeleton];s===void 0?_e("ObjectLoader: No skeleton found with UUID:",n.skeleton):n.bind(s,n.bindMatrix)}})}bindLightTargets(e){e.traverse(function(t){if(t.isDirectionalLight||t.isSpotLight){let n=t.target,s=e.getObjectByProperty("uuid",n);s!==void 0?t.target=s:t.target=new ft}})}},dv={UVMapping:Rl,CubeReflectionMapping:oi,CubeRefractionMapping:Vi,EquirectangularReflectionMapping:yo,EquirectangularRefractionMapping:vo,CubeUVReflectionMapping:Qs},T0={RepeatWrapping:Nr,ClampToEdgeWrapping:xn,MirroredRepeatWrapping:Ur},R0={NearestFilter:Ct,NearestMipmapNearestFilter:Qh,NearestMipmapLinearFilter:er,LinearFilter:wt,LinearMipmapNearestFilter:bo,LinearMipmapLinearFilter:ai},gd=new WeakMap,sh=class extends en{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&_e("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&_e("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ti.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{gd.has(o)===!0?(s&&s(gd.get(o)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);return}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ti.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),gd.set(l,c),ti.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ti.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Su,go=class{static getContext(){return Su===void 0&&(Su=new(window.AudioContext||window.webkitAudioContext)),Su}static setContext(e){Su=e}},rh=class extends en{constructor(e){super(e)}load(e,t,n,s){let r=this,o=new Hn(this.manager);o.setResponseType("arraybuffer"),o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(l){try{let c=l.slice(0),u=go.getContext(),f=e+"#decode";r.manager.itemStart(f),u.decodeAudioData(c,function(h){t(h),r.manager.itemEnd(f)}).catch(function(h){a(h),r.manager.itemEnd(f)})}catch(c){a(c)}},n,s);function a(l){s?s(l):ke(l),r.manager.itemError(e)}}},C0=new $e,I0=new $e,Cs=new $e,oh=class{constructor(){this.type="StereoCamera",this.aspect=1,this.eyeSep=.064,this.cameraL=new Ft,this.cameraL.layers.enable(1),this.cameraL.matrixAutoUpdate=!1,this.cameraR=new Ft,this.cameraR.layers.enable(2),this.cameraR.matrixAutoUpdate=!1,this._cache={focus:null,fov:null,aspect:null,near:null,far:null,zoom:null,eyeSep:null}}update(e){let t=this._cache;if(t.focus!==e.focus||t.fov!==e.fov||t.aspect!==e.aspect*this.aspect||t.near!==e.near||t.far!==e.far||t.zoom!==e.zoom||t.eyeSep!==this.eyeSep){t.focus=e.focus,t.fov=e.fov,t.aspect=e.aspect*this.aspect,t.near=e.near,t.far=e.far,t.zoom=e.zoom,t.eyeSep=this.eyeSep,Cs.copy(e.projectionMatrix);let s=t.eyeSep/2,r=s*t.near/t.focus,o=t.near*Math.tan(Us*t.fov*.5)/t.zoom,a,l;I0.elements[12]=-s,C0.elements[12]=s,a=-o*t.aspect+r,l=o*t.aspect+r,Cs.elements[0]=2*t.near/(l-a),Cs.elements[8]=(l+a)/(l-a),this.cameraL.projectionMatrix.copy(Cs),a=-o*t.aspect-r,l=o*t.aspect-r,Cs.elements[0]=2*t.near/(l-a),Cs.elements[8]=(l+a)/(l-a),this.cameraR.projectionMatrix.copy(Cs)}this.cameraL.matrix.copy(e.matrixWorld).multiply(I0),this.cameraL.matrixWorldNeedsUpdate=!0,this.cameraR.matrix.copy(e.matrixWorld).multiply(C0),this.cameraR.matrixWorldNeedsUpdate=!0}},Rr=-90,Cr=1,bl=class extends ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ft(Rr,Cr,e,t);s.layers=this.layers,this.add(s);let r=new Ft(Rr,Cr,e,t);r.layers=this.layers,this.add(r);let o=new Ft(Rr,Cr,e,t);o.layers=this.layers,this.add(o);let a=new Ft(Rr,Cr,e,t);a.layers=this.layers,this.add(a);let l=new Ft(Rr,Cr,e,t);l.layers=this.layers,this.add(l);let c=new Ft(Rr,Cr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===wn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(f,h,d),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Ml=class extends Ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Sl=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=pv.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function pv(){this._document.hidden===!1&&this.reset()}var Is=new N,xd=new Zt,mv=new N,Ps=new N,Ls=new N,ah=class extends ft{constructor(){super(),this.type="AudioListener",this.context=go.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._timer=new Sl}getInput(){return this.gain}removeFilter(){return this.filter!==null&&(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null),this}getFilter(){return this.filter}setFilter(e){return this.filter!==null?(this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination)):this.gain.disconnect(this.context.destination),this.filter=e,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}updateMatrixWorld(e){super.updateMatrixWorld(e),this._timer.update();let t=this.context.listener;if(this.timeDelta=this._timer.getDelta(),this.matrixWorld.decompose(Is,xd,mv),Ps.set(0,0,-1).applyQuaternion(xd),Ls.set(0,1,0).applyQuaternion(xd),t.positionX){let n=this.context.currentTime+this.timeDelta;t.positionX.linearRampToValueAtTime(Is.x,n),t.positionY.linearRampToValueAtTime(Is.y,n),t.positionZ.linearRampToValueAtTime(Is.z,n),t.forwardX.linearRampToValueAtTime(Ps.x,n),t.forwardY.linearRampToValueAtTime(Ps.y,n),t.forwardZ.linearRampToValueAtTime(Ps.z,n),t.upX.linearRampToValueAtTime(Ls.x,n),t.upY.linearRampToValueAtTime(Ls.y,n),t.upZ.linearRampToValueAtTime(Ls.z,n)}else t.setPosition(Is.x,Is.y,Is.z),t.setOrientation(Ps.x,Ps.y,Ps.z,Ls.x,Ls.y,Ls.z)}},wl=class extends ft{constructor(e){super(),this.type="Audio",this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){return this.buffer=e,this.sourceType="buffer",this.autoplay&&this.play(),this}play(e=0){if(this.isPlaying===!0){_e("Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+e;let t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this.isPlaying===!0&&(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0&&(this._progress=this._progress%(this.duration||this.buffer.duration)),this.source.stop(),this.source.onended=null,this.isPlaying=!1),this}stop(e=0){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this._progress=0,this.source!==null&&(this.source.stop(this.context.currentTime+e),this.source.onended=null),this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected!==!1){if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}}getFilters(){return this.filters}setFilters(e){return e||(e=[]),this._connected===!0?(this.disconnect(),this.filters=e.slice(),this.connect()):this.filters=e.slice(),this}setDetune(e){return this.detune=e,this.isPlaying===!0&&this.source.detune!==void 0&&this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,.01),this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this.playbackRate=e,this.isPlaying===!0&&this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,.01),this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1,this._progress=0}getLoop(){return this.hasPlaybackControl===!1?(_e("Audio: this Audio has no playback control."),!1):this.loop}setLoop(e){if(this.hasPlaybackControl===!1){_e("Audio: this Audio has no playback control.");return}return this.loop=e,this.isPlaying===!0&&(this.source.loop=this.loop),this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,.01),this}copy(e,t){return super.copy(e,t),e.sourceType!=="buffer"?(_e("Audio: Audio source type cannot be copied."),this):(this.autoplay=e.autoplay,this.buffer=e.buffer,this.detune=e.detune,this.loop=e.loop,this.loopStart=e.loopStart,this.loopEnd=e.loopEnd,this.offset=e.offset,this.duration=e.duration,this.playbackRate=e.playbackRate,this.hasPlaybackControl=e.hasPlaybackControl,this.sourceType=e.sourceType,this.filters=e.filters.slice(),this)}clone(e){return new this.constructor(this.listener).copy(this,e)}},Ds=new N,P0=new Zt,gv=new N,Ns=new N,lh=class extends wl{constructor(e){super(e),this.panner=this.context.createPanner(),this.panner.panningModel="HRTF",this.panner.connect(this.gain)}connect(){return super.connect(),this.panner.connect(this.gain),this}disconnect(){return super.disconnect(),this.panner.disconnect(this.gain),this}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(e){return this.panner.refDistance=e,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(e){return this.panner.rolloffFactor=e,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(e){return this.panner.distanceModel=e,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(e){return this.panner.maxDistance=e,this}setDirectionalCone(e,t,n){return this.panner.coneInnerAngle=e,this.panner.coneOuterAngle=t,this.panner.coneOuterGain=n,this}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(Ds,P0,gv),Ns.set(0,0,1).applyQuaternion(P0);let t=this.panner;if(t.positionX){let n=this.context.currentTime+this.listener.timeDelta;t.positionX.linearRampToValueAtTime(Ds.x,n),t.positionY.linearRampToValueAtTime(Ds.y,n),t.positionZ.linearRampToValueAtTime(Ds.z,n),t.orientationX.linearRampToValueAtTime(Ns.x,n),t.orientationY.linearRampToValueAtTime(Ns.y,n),t.orientationZ.linearRampToValueAtTime(Ns.z,n)}else t.setPosition(Ds.x,Ds.y,Ds.z),t.setOrientation(Ns.x,Ns.y,Ns.z)}},ch=class{constructor(e,t=2048){this.analyser=e.context.createAnalyser(),this.analyser.fftSize=t,this.data=new Uint8Array(this.analyser.frequencyBinCount),e.getOutput().connect(this.analyser)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.data),this.data}getAverageFrequency(){let e=0,t=this.getFrequencyData();for(let n=0;n<t.length;n++)e+=t[n];return e/t.length}},Al=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let s,r,o;switch(t){case"quaternion":s=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:s=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,s=this.valueSize,r=e*s+s,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==s;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,s)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,s=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,s,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,s=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,s,l,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,s,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){a.setValue(n,s);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,s=n*this._origIndex;e.getValue(t,s);for(let r=n,o=s;r!==o;++r)t[r]=t[s+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,s,r){if(s>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,s){Zt.slerpFlat(e,t,e,t,e,n,s)}_slerpAdditive(e,t,n,s,r){let o=this._workIndex*r;Zt.multiplyQuaternionsFlat(e,o,e,t,e,n),Zt.slerpFlat(e,t,e,t,e,o,s)}_lerp(e,t,n,s,r){let o=1-s;for(let a=0;a!==r;++a){let l=t+a;e[l]=e[l]*o+e[n+a]*s}}_lerpAdditive(e,t,n,s,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*s}}},Mp="\\[\\]\\.:\\/",xv=new RegExp("["+Mp+"]","g"),Sp="[^"+Mp+"]",_v="[^"+Mp.replace("\\.","")+"]",yv=/((?:WC+[\/:])*)/.source.replace("WC",Sp),vv=/(WCOD+)?/.source.replace("WCOD",_v),bv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Sp),Mv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Sp),Sv=new RegExp("^"+yv+vv+bv+Mv+"$"),wv=["material","materials","bones","map"],Pd=class{constructor(e,t,n){let s=n||xt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},xt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(xv,"")}static parseTrackName(e){let t=Sv.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);wv.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){_e("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;ke("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=Pd;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var uh=class{constructor(){this.isAnimationObjectGroup=!0,this.uuid=Ln(),this._objects=Array.prototype.slice.call(arguments),this.nCachedObjects_=0;let e={};this._indicesByUUID=e;for(let n=0,s=arguments.length;n!==s;++n)e[arguments[n].uuid]=n;this._paths=[],this._parsedPaths=[],this._bindings=[],this._bindingsIndicesByPath={};let t=this;this.stats={objects:{get total(){return t._objects.length},get inUse(){return this.total-t.nCachedObjects_}},get bindingsPerObject(){return t._bindings.length}}}add(){let e=this._objects,t=this._indicesByUUID,n=this._paths,s=this._parsedPaths,r=this._bindings,o=r.length,a,l=e.length,c=this.nCachedObjects_;for(let u=0,f=arguments.length;u!==f;++u){let h=arguments[u],d=h.uuid,p=t[d];if(p===void 0){p=l++,t[d]=p,e.push(h);for(let x=0,m=o;x!==m;++x)r[x].push(new xt(h,n[x],s[x]))}else if(p<c){a=e[p];let x=--c,m=e[x];t[m.uuid]=p,e[p]=m,t[d]=x,e[x]=h;for(let g=0,y=o;g!==y;++g){let S=r[g],v=S[x],M=S[p];S[p]=v,M===void 0&&(M=new xt(h,n[g],s[g])),S[x]=M}}else e[p]!==a&&ke("AnimationObjectGroup: Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes.")}this.nCachedObjects_=c}remove(){let e=this._objects,t=this._indicesByUUID,n=this._bindings,s=n.length,r=this.nCachedObjects_;for(let o=0,a=arguments.length;o!==a;++o){let l=arguments[o],c=l.uuid,u=t[c];if(u!==void 0&&u>=r){let f=r++,h=e[f];t[h.uuid]=u,e[u]=h,t[c]=f,e[f]=l;for(let d=0,p=s;d!==p;++d){let x=n[d],m=x[f],g=x[u];x[u]=m,x[f]=g}}}this.nCachedObjects_=r}uncache(){let e=this._objects,t=this._indicesByUUID,n=this._bindings,s=n.length,r=this.nCachedObjects_,o=e.length;for(let a=0,l=arguments.length;a!==l;++a){let c=arguments[a],u=c.uuid,f=t[u];if(f!==void 0)if(delete t[u],f<r){let h=--r,d=e[h],p=--o,x=e[p];f!==h&&(t[d.uuid]=f),e[f]=d,h!==p&&(t[x.uuid]=h),e[h]=x,e.pop();for(let m=0,g=s;m!==g;++m){let y=n[m],S=y[h],v=y[p];y[f]=S,y[h]=v,y.pop()}}else{let h=--o,d=e[h];f!==h&&(t[d.uuid]=f),e[f]=d,e.pop();for(let p=0,x=s;p!==x;++p){let m=n[p];m[f]=m[h],m.pop()}}}this.nCachedObjects_=r}subscribe_(e,t){let n=this._bindingsIndicesByPath,s=n[e],r=this._bindings;if(s!==void 0)return r[s];let o=this._paths,a=this._parsedPaths,l=this._objects,c=l.length,u=this.nCachedObjects_,f=new Array(c);s=r.length,n[e]=s,o.push(e),a.push(t),r.push(f);for(let h=u,d=l.length;h!==d;++h){let p=l[h];f[h]=new xt(p,e,t)}return f}unsubscribe_(e){let t=this._bindingsIndicesByPath,n=t[e];if(n!==void 0){let s=this._paths,r=this._parsedPaths,o=this._bindings,a=o.length-1,l=o[a],c=s[a];t[c]=n,o[n]=l,o.pop(),r[n]=r[a],r.pop(),s[n]=s[a],s.pop()}}},El=class{constructor(e,t,n=null,s=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=s;let r=t.tracks,o=r.length,a=new Array(o),l={endingStart:ns,endingEnd:ns};for(let c=0;c!==o;++c){let u=r[c].createInterpolant(null);a[c]=u,u.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=rp,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let s=this._clip.duration,r=e._clip.duration,o=r/s,a=s/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let s=this._mixer,r=s.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=s._lendControlInterpolant(),this._timeScaleInterpolant=a);let l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/o,c[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,s){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case af:for(let u=0,f=l.length;u!==f;++u)l[u].evaluate(o),c[u].accumulateAdditive(a);break;case hc:default:for(let u=0,f=l.length;u!==f;++u)l[u].evaluate(o),c[u].accumulate(s,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,s=this.time+e,r=this._loopCount,o=n===op;if(e===0)return r===-1?s:o&&(r&1)===1?t-s:s;if(n===sp){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(s>=t)s=t;else if(s<0)s=0;else{this.time=s;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),s>=t||s<0){let a=Math.floor(s/t);s-=t*a,r+=Math.abs(a);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=e>0?t:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this._loopCount=r,this.time=s;if(o&&(r&1)===1)return t-s}return s}_setEndings(e,t,n){let s=this._interpolantSettings;n?(s.endingStart=is,s.endingEnd=is):(e?s.endingStart=this.zeroSlopeAtStart?is:ns:s.endingStart=Or,t?s.endingEnd=this.zeroSlopeAtEnd?is:ns:s.endingEnd=Or)}_scheduleFading(e,t,n){let s=this._mixer,r=s.time,o=this._weightInterpolant;o===null&&(o=s._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=t,a[1]=r+e,l[1]=n,this}},Av=new Float32Array(1),hh=class extends An{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,s=e._clip.tracks,r=s.length,o=e._propertyBindings,a=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,u=c[l];u===void 0&&(u={},c[l]=u);for(let f=0;f!==r;++f){let h=s[f],d=h.name,p=u[d];if(p!==void 0)++p.referenceCount,o[f]=p;else{if(p=o[f],p!==void 0){p._cacheIndex===null&&(++p.referenceCount,this._addInactiveBinding(p,l,d));continue}let x=t&&t._propertyBindings[f].binding.parsedPath;p=new Al(xt.create(n,d,x),h.ValueTypeName,h.getValueSize()),++p.referenceCount,this._addInactiveBinding(p,l,d),o[f]=p}a[f].resultBuffer=p.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,s=e._clip.uuid,r=this._actionsByClip[s];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,s,n)}let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let s=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=s.length,s.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],s=e._cacheIndex;n._cacheIndex=s,t[s]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],u=e._byClipCacheIndex;c._byClipCacheIndex=u,l[u]=c,l.pop(),e._byClipCacheIndex=null;let f=a.actionByRoot,h=(e._localRoot||this._root).uuid;delete f[h],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,s=this._nActiveActions++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,s=--this._nActiveActions,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let s=this._bindingsByRootAndName,r=this._bindings,o=s[t];o===void 0&&(o={},s[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,s=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[s],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[s]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,s=this._nActiveBindings++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,s=--this._nActiveBindings,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new co(new Float32Array(2),new Float32Array(2),1,Av),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,s=--this._nActiveControlInterpolants,r=t[s];e.__cacheIndex=s,t[s]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let s=t||this._root,r=s.uuid,o=typeof e=="string"?hs.findByName(s,e):e,a=o!==null?o.uuid:e,l=this._actionsByClip[a],c=null;if(n===void 0&&(o!==null?n=o.blendMode:n=hc),l!==void 0){let f=l.actionByRoot[r];if(f!==void 0&&f.blendMode===n)return f;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;let u=new El(this,o,t,n);return this._bindAction(u,c),this._addInactiveAction(u,a,r),u}existingAction(e,t){let n=t||this._root,s=n.uuid,r=typeof e=="string"?hs.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[s]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,s=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(s,e,r,o);let a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,s=this._actionsByClip,r=s[n];if(r!==void 0){let o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){let c=o[a];this._deactivateAction(c);let u=c._cacheIndex,f=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,f._cacheIndex=u,t[u]=f,t.pop(),this._removeInactiveBindingsForAction(c)}delete s[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,l=a[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let s=this._bindingsByRootAndName,r=s[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}},fh=class extends Gr{constructor(e=1,t=1,n=1,s={}){super(e,t,s),this.isRenderTarget3D=!0,this.depth=n;for(let r=0;r<this.textures.length;r++){let o=new ks(null,e,t,n);o.isRenderTargetTexture=!0,o.renderTarget=this,this.textures[r]=o}this._setTextureOptions(s)}},dh=class i{constructor(e){this.value=e}clone(){return new i(this.value.clone===void 0?this.value:this.value.clone())}},Ev=0,ph=class extends An{constructor(){super(),this.isUniformsGroup=!0,Object.defineProperty(this,"id",{value:Ev++}),this.name="",this.usage=pc,this.uniforms=[]}add(e){return this.uniforms.push(e),this}remove(e){let t=this.uniforms.indexOf(e);return t!==-1&&this.uniforms.splice(t,1),this}setName(e){return this.name=e,this}setUsage(e){return this.usage=e,this}dispose(){this.dispatchEvent({type:"dispose"})}copy(e){this.name=e.name,this.usage=e.usage;let t=e.uniforms;this.uniforms.length=0;for(let n=0,s=t.length;n<s;n++){let r=Array.isArray(t[n])?t[n]:[t[n]];for(let o=0;o<r.length;o++)this.uniforms.push(r[o].clone())}return this}clone(){return new this.constructor().copy(this)}},mh=class extends Gs{constructor(e,t,n=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}},gh=class{constructor(e,t,n,s,r,o=!1){this.isGLBufferAttribute=!0,this.name="",this.buffer=e,this.type=t,this.itemSize=n,this.elementSize=s,this.count=r,this.normalized=o,this.version=0}set needsUpdate(e){e===!0&&this.version++}setBuffer(e){return this.buffer=e,this}setType(e,t){return this.type=e,this.elementSize=t,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}},L0=new $e,xh=class{constructor(e,t,n=0,s=1/0){this.ray=new Ni(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Vs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):ke("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return L0.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(L0),this}intersectObject(e,t=!0,n=[]){return Ld(e,this,n,t),n.sort(D0),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Ld(e[s],this,n,t);return n.sort(D0),n}};function D0(i,e){return i.distance-e.distance}function Ld(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Ld(r[o],e,t,!0)}}var _h=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,_e("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}},yh=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Je(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Je(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}},vh=class{constructor(e=1,t=0,n=0){this.radius=e,this.theta=t,this.y=n}set(e,t,n){return this.radius=e,this.theta=t,this.y=n,this}copy(e){return this.radius=e.radius,this.theta=e.theta,this.y=e.y,this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+n*n),this.theta=Math.atan2(e,n),this.y=t,this}clone(){return new this.constructor().copy(this)}},Rp=class Rp{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};Rp.prototype.isMatrix2=!0;var bh=Rp,N0=new oe,Tl=class{constructor(e=new oe(1/0,1/0),t=new oe(-1/0,-1/0)){this.isBox2=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=N0.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(e){return this.isEmpty()?e.set(0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,N0).distanceTo(e)}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},U0=new N,wu=new N,Ir=new N,Pr=new N,_d=new N,Tv=new N,Rv=new N,Mh=class{constructor(e=new N,t=new N){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){U0.subVectors(e,this.start),wu.subVectors(this.end,this.start);let n=wu.dot(wu);if(n===0)return 0;let r=wu.dot(U0)/n;return t&&(r=Je(r,0,1)),r}closestPointToPoint(e,t,n){let s=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(s).add(this.start)}distanceSqToLine3(e,t=Tv,n=Rv){let s=10000000000000001e-32,r,o,a=this.start,l=e.start,c=this.end,u=e.end;Ir.subVectors(c,a),Pr.subVectors(u,l),_d.subVectors(a,l);let f=Ir.dot(Ir),h=Pr.dot(Pr),d=Pr.dot(_d);if(f<=s&&h<=s)return t.copy(a),n.copy(l),t.sub(n),t.dot(t);if(f<=s)r=0,o=d/h,o=Je(o,0,1);else{let p=Ir.dot(_d);if(h<=s)o=0,r=Je(-p/f,0,1);else{let x=Ir.dot(Pr),m=f*h-x*x;m!==0?r=Je((x*d-p*h)/m,0,1):r=0,o=(x*r+d)/h,o<0?(o=0,r=Je(-p/f,0,1)):o>1&&(o=1,r=Je((x-p)/f,0,1))}}return t.copy(a).addScaledVector(Ir,r),n.copy(l).addScaledVector(Pr,o),t.distanceToSquared(n)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}},F0=new N,Sh=class extends ft{constructor(e,t){super(),this.light=e,this.matrixAutoUpdate=!1,this.color=t,this.type="SpotLightHelper";let n=new Ke,s=[0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,-1,0,1,0,0,0,0,1,1,0,0,0,0,-1,1];for(let o=0,a=1,l=32;o<l;o++,a++){let c=o/l*Math.PI*2,u=a/l*Math.PI*2;s.push(Math.cos(c),Math.sin(c),1,Math.cos(u),Math.sin(u),1)}n.setAttribute("position",new Le(s,3));let r=new Jt({fog:!1,toneMapped:!1});this.cone=new Dn(n,r),this.add(this.cone),this.update()}dispose(){super.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}update(){this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),this.parent?(this.parent.updateWorldMatrix(!0),this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.light.matrixWorld)):this.matrix.copy(this.light.matrixWorld),this.matrixWorldNeedsUpdate=!0;let e=this.light.distance?this.light.distance:1e3,t=e*Math.tan(this.light.angle);this.cone.scale.set(t,t,e),F0.setFromMatrixPosition(this.light.target.matrixWorld),this.cone.lookAt(F0),this.color!==void 0?this.cone.material.color.set(this.color):this.cone.material.color.copy(this.light.color)}},ts=new N,Au=new $e,yd=new $e,wh=class extends Dn{constructor(e){let t=Kg(e),n=new Ke,s=[],r=[];for(let c=0;c<t.length;c++){let u=t[c];u.parent&&u.parent.isBone&&(s.push(0,0,0),s.push(0,0,0),r.push(0,0,0),r.push(0,0,0))}n.setAttribute("position",new Le(s,3)),n.setAttribute("color",new Le(r,3));let o=new Jt({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(n,o),this.isSkeletonHelper=!0,this.type="SkeletonHelper",this.root=e,this.bones=t,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1;let a=new Se(255),l=new Se(65280);this.setColors(a,l)}updateMatrixWorld(e){let t=this.bones,n=this.geometry,s=n.getAttribute("position");yd.copy(this.root.matrixWorld).invert();for(let r=0,o=0;r<t.length;r++){let a=t[r];a.parent&&a.parent.isBone&&(Au.multiplyMatrices(yd,a.matrixWorld),ts.setFromMatrixPosition(Au),s.setXYZ(o,ts.x,ts.y,ts.z),Au.multiplyMatrices(yd,a.parent.matrixWorld),ts.setFromMatrixPosition(Au),s.setXYZ(o+1,ts.x,ts.y,ts.z),o+=2)}n.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(e)}setColors(e,t){let s=this.geometry.getAttribute("color");for(let r=0;r<s.count;r+=2)s.setXYZ(r,e.r,e.g,e.b),s.setXYZ(r+1,t.r,t.g,t.b);return s.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function Kg(i){let e=[];i.isBone===!0&&e.push(i);for(let t=0;t<i.children.length;t++)e.push(...Kg(i.children[t]));return e}var Ah=class extends Tt{constructor(e,t,n){let s=new so(t,4,2),r=new En({wireframe:!0,fog:!1,toneMapped:!1});super(s,r),this.light=e,this.color=n,this.type="PointLightHelper",this.matrix=this.light.matrixWorld,this.matrixAutoUpdate=!1,this.update()}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}update(){this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),this.color!==void 0?this.material.color.set(this.color):this.material.color.copy(this.light.color)}},Cv=new N,O0=new Se,B0=new Se,Eh=class extends ft{constructor(e,t,n){super(),this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n,this.type="HemisphereLightHelper";let s=new io(t);s.rotateY(Math.PI*.5),this.material=new En({wireframe:!0,fog:!1,toneMapped:!1}),this.color===void 0&&(this.material.vertexColors=!0);let r=s.getAttribute("position"),o=new Float32Array(r.count*3);s.setAttribute("color",new tt(o,3)),this.add(new Tt(s,this.material)),this.update()}dispose(){super.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}update(){let e=this.children[0];if(this.color!==void 0)this.material.color.set(this.color);else{let t=e.geometry.getAttribute("color");O0.copy(this.light.color),B0.copy(this.light.groundColor);for(let n=0,s=t.count;n<s;n++){let r=n<s/2?O0:B0;t.setXYZ(n,r.r,r.g,r.b)}t.needsUpdate=!0}this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),e.lookAt(Cv.setFromMatrixPosition(this.light.matrixWorld).negate())}},Th=class extends Dn{constructor(e=10,t=10,n=4473924,s=8947848){n=new Se(n),s=new Se(s);let r=t/2,o=e/t,a=e/2,l=[],c=[];for(let h=0,d=0,p=-a;h<=t;h++,p+=o){l.push(-a,0,p,a,0,p),l.push(p,0,-a,p,0,a);let x=h===r?n:s;x.toArray(c,d),d+=3,x.toArray(c,d),d+=3,x.toArray(c,d),d+=3,x.toArray(c,d),d+=3}let u=new Ke;u.setAttribute("position",new Le(l,3)),u.setAttribute("color",new Le(c,3));let f=new Jt({vertexColors:!0,toneMapped:!1});super(u,f),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Rh=class extends Dn{constructor(e=10,t=16,n=8,s=64,r=4473924,o=8947848){r=new Se(r),o=new Se(o);let a=[],l=[];if(t>1)for(let f=0;f<t;f++){let h=f/t*(Math.PI*2),d=Math.sin(h)*e,p=Math.cos(h)*e;a.push(0,0,0),a.push(d,0,p);let x=f&1?r:o;l.push(x.r,x.g,x.b),l.push(x.r,x.g,x.b)}for(let f=0;f<n;f++){let h=f&1?r:o,d=e-e/n*f;for(let p=0;p<s;p++){let x=p/s*(Math.PI*2),m=Math.sin(x)*d,g=Math.cos(x)*d;a.push(m,0,g),l.push(h.r,h.g,h.b),x=(p+1)/s*(Math.PI*2),m=Math.sin(x)*d,g=Math.cos(x)*d,a.push(m,0,g),l.push(h.r,h.g,h.b)}}let c=new Ke;c.setAttribute("position",new Le(a,3)),c.setAttribute("color",new Le(l,3));let u=new Jt({vertexColors:!0,toneMapped:!1});super(c,u),this.type="PolarGridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},k0=new N,Eu=new N,V0=new N,Ch=class extends ft{constructor(e,t,n){super(),this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n,this.type="DirectionalLightHelper",t===void 0&&(t=1);let s=new Ke;s.setAttribute("position",new Le([-t,t,0,t,t,0,t,-t,0,-t,-t,0,-t,t,0],3));let r=new Jt({fog:!1,toneMapped:!1});this.lightPlane=new ii(s,r),this.add(this.lightPlane),s=new Ke,s.setAttribute("position",new Le([0,0,0,0,0,1],3)),this.targetLine=new ii(s,r),this.add(this.targetLine),this.update()}dispose(){super.dispose(),this.lightPlane.geometry.dispose(),this.lightPlane.material.dispose(),this.targetLine.geometry.dispose(),this.targetLine.material.dispose()}update(){this.matrixWorldNeedsUpdate=!0,this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),k0.setFromMatrixPosition(this.light.matrixWorld),Eu.setFromMatrixPosition(this.light.target.matrixWorld),V0.subVectors(Eu,k0),this.lightPlane.lookAt(Eu),this.color!==void 0?(this.lightPlane.material.color.set(this.color),this.targetLine.material.color.set(this.color)):(this.lightPlane.material.color.copy(this.light.color),this.targetLine.material.color.copy(this.light.color)),this.targetLine.lookAt(Eu),this.targetLine.scale.z=V0.length()}},Tu=new N,Rt=new $s,Ih=class extends Dn{constructor(e){let t=new Ke,n=new Jt({color:16777215,vertexColors:!0,toneMapped:!1}),s=[],r=[],o={};a("n1","n2"),a("n2","n4"),a("n4","n3"),a("n3","n1"),a("f1","f2"),a("f2","f4"),a("f4","f3"),a("f3","f1"),a("n1","f1"),a("n2","f2"),a("n3","f3"),a("n4","f4"),a("p","n1"),a("p","n2"),a("p","n3"),a("p","n4"),a("u1","u2"),a("u2","u3"),a("u3","u1"),a("c","t"),a("p","c"),a("cn1","cn2"),a("cn3","cn4"),a("cf1","cf2"),a("cf3","cf4");function a(p,x){l(p),l(x)}function l(p){s.push(0,0,0),r.push(0,0,0),o[p]===void 0&&(o[p]=[]),o[p].push(s.length/3-1)}t.setAttribute("position",new Le(s,3)),t.setAttribute("color",new Le(r,3)),super(t,n),this.type="CameraHelper",this.camera=e,this.camera.updateProjectionMatrix&&this.camera.updateProjectionMatrix(),this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=o,this.update();let c=new Se(16755200),u=new Se(16711680),f=new Se(43775),h=new Se(16777215),d=new Se(3355443);this.setColors(c,u,f,h,d)}setColors(e,t,n,s,r){let a=this.geometry.getAttribute("color");return a.setXYZ(0,e.r,e.g,e.b),a.setXYZ(1,e.r,e.g,e.b),a.setXYZ(2,e.r,e.g,e.b),a.setXYZ(3,e.r,e.g,e.b),a.setXYZ(4,e.r,e.g,e.b),a.setXYZ(5,e.r,e.g,e.b),a.setXYZ(6,e.r,e.g,e.b),a.setXYZ(7,e.r,e.g,e.b),a.setXYZ(8,e.r,e.g,e.b),a.setXYZ(9,e.r,e.g,e.b),a.setXYZ(10,e.r,e.g,e.b),a.setXYZ(11,e.r,e.g,e.b),a.setXYZ(12,e.r,e.g,e.b),a.setXYZ(13,e.r,e.g,e.b),a.setXYZ(14,e.r,e.g,e.b),a.setXYZ(15,e.r,e.g,e.b),a.setXYZ(16,e.r,e.g,e.b),a.setXYZ(17,e.r,e.g,e.b),a.setXYZ(18,e.r,e.g,e.b),a.setXYZ(19,e.r,e.g,e.b),a.setXYZ(20,e.r,e.g,e.b),a.setXYZ(21,e.r,e.g,e.b),a.setXYZ(22,e.r,e.g,e.b),a.setXYZ(23,e.r,e.g,e.b),a.setXYZ(24,t.r,t.g,t.b),a.setXYZ(25,t.r,t.g,t.b),a.setXYZ(26,t.r,t.g,t.b),a.setXYZ(27,t.r,t.g,t.b),a.setXYZ(28,t.r,t.g,t.b),a.setXYZ(29,t.r,t.g,t.b),a.setXYZ(30,t.r,t.g,t.b),a.setXYZ(31,t.r,t.g,t.b),a.setXYZ(32,n.r,n.g,n.b),a.setXYZ(33,n.r,n.g,n.b),a.setXYZ(34,n.r,n.g,n.b),a.setXYZ(35,n.r,n.g,n.b),a.setXYZ(36,n.r,n.g,n.b),a.setXYZ(37,n.r,n.g,n.b),a.setXYZ(38,s.r,s.g,s.b),a.setXYZ(39,s.r,s.g,s.b),a.setXYZ(40,r.r,r.g,r.b),a.setXYZ(41,r.r,r.g,r.b),a.setXYZ(42,r.r,r.g,r.b),a.setXYZ(43,r.r,r.g,r.b),a.setXYZ(44,r.r,r.g,r.b),a.setXYZ(45,r.r,r.g,r.b),a.setXYZ(46,r.r,r.g,r.b),a.setXYZ(47,r.r,r.g,r.b),a.setXYZ(48,r.r,r.g,r.b),a.setXYZ(49,r.r,r.g,r.b),a.needsUpdate=!0,this}update(){let e=this.geometry,t=this.pointMap,n=1,s=1,r,o;if(Rt.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),this.camera.reversedDepth===!0)r=1,o=0;else if(this.camera.coordinateSystem===wn)r=-1,o=1;else if(this.camera.coordinateSystem===ss)r=0,o=1;else throw new Error("THREE.CameraHelper.update(): Invalid coordinate system: "+this.camera.coordinateSystem);Dt("c",t,e,Rt,0,0,r),Dt("t",t,e,Rt,0,0,o),Dt("n1",t,e,Rt,-n,-s,r),Dt("n2",t,e,Rt,n,-s,r),Dt("n3",t,e,Rt,-n,s,r),Dt("n4",t,e,Rt,n,s,r),Dt("f1",t,e,Rt,-n,-s,o),Dt("f2",t,e,Rt,n,-s,o),Dt("f3",t,e,Rt,-n,s,o),Dt("f4",t,e,Rt,n,s,o),Dt("u1",t,e,Rt,n*.7,s*1.1,r),Dt("u2",t,e,Rt,-n*.7,s*1.1,r),Dt("u3",t,e,Rt,0,s*2,r),Dt("cf1",t,e,Rt,-n,0,o),Dt("cf2",t,e,Rt,n,0,o),Dt("cf3",t,e,Rt,0,-s,o),Dt("cf4",t,e,Rt,0,s,o),Dt("cn1",t,e,Rt,-n,0,r),Dt("cn2",t,e,Rt,n,0,r),Dt("cn3",t,e,Rt,0,-s,r),Dt("cn4",t,e,Rt,0,s,r),e.getAttribute("position").needsUpdate=!0}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};function Dt(i,e,t,n,s,r,o){Tu.set(s,r,o).unproject(n);let a=e[i];if(a!==void 0){let l=t.getAttribute("position");for(let c=0,u=a.length;c<u;c++)l.setXYZ(a[c],Tu.x,Tu.y,Tu.z)}}var Ru=new zt,Ph=class extends Dn{constructor(e,t=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=new Float32Array(24),r=new Ke;r.setIndex(new tt(n,1)),r.setAttribute("position",new tt(s,3)),super(r,new Jt({color:t,toneMapped:!1})),this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0&&Ru.setFromObject(this.object),Ru.isEmpty())return;let e=Ru.min,t=Ru.max,n=this.geometry.attributes.position,s=n.array;s[0]=t.x,s[1]=t.y,s[2]=t.z,s[3]=e.x,s[4]=t.y,s[5]=t.z,s[6]=e.x,s[7]=e.y,s[8]=t.z,s[9]=t.x,s[10]=e.y,s[11]=t.z,s[12]=t.x,s[13]=t.y,s[14]=e.z,s[15]=e.x,s[16]=t.y,s[17]=e.z,s[18]=e.x,s[19]=e.y,s[20]=e.z,s[21]=t.x,s[22]=e.y,s[23]=e.z,n.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Lh=class extends Dn{constructor(e,t=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],r=new Ke;r.setIndex(new tt(n,1)),r.setAttribute("position",new Le(s,3)),super(r,new Jt({color:t,toneMapped:!1})),this.box=e,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(e){let t=this.box;t.isEmpty()||(t.getCenter(this.position),t.getSize(this.scale),this.scale.multiplyScalar(.5),super.updateMatrixWorld(e))}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Dh=class extends ii{constructor(e,t=1,n=16776960){let s=n,r=[1,-1,0,-1,1,0,-1,-1,0,1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],o=new Ke;o.setAttribute("position",new Le(r,3)),o.computeBoundingSphere(),super(o,new Jt({color:s,toneMapped:!1})),this.type="PlaneHelper",this.plane=e,this.size=t;let a=[1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],l=new Ke;l.setAttribute("position",new Le(a,3)),l.computeBoundingSphere(),this.add(new Tt(l,new En({color:s,opacity:.2,transparent:!0,depthWrite:!1,toneMapped:!1})))}updateMatrixWorld(e){this.position.set(0,0,0),this.scale.set(.5*this.size,.5*this.size,1),this.lookAt(this.plane.normal),this.translateZ(-this.plane.constant),super.updateMatrixWorld(e)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}},z0=new N,Cu,vd,Nh=class extends ft{constructor(e=new N(0,0,1),t=new N(0,0,0),n=1,s=16776960,r=n*.2,o=r*.2){super(),this.type="ArrowHelper",Cu===void 0&&(Cu=new Ke,Cu.setAttribute("position",new Le([0,0,0,0,1,0],3)),vd=new $r(.5,1,5,1),vd.translate(0,-.5,0)),this.position.copy(t),this.line=new ii(Cu,new Jt({color:s,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Tt(vd,new En({color:s,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,r,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{z0.set(e.z,0,-e.x).normalize();let t=Math.acos(e.y);this.quaternion.setFromAxisAngle(z0,t)}}setLength(e,t=e*.2,n=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){super.dispose(),this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}},Uh=class extends Dn{constructor(e=1){let t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new Ke;s.setAttribute("position",new Le(t,3)),s.setAttribute("color",new Le(n,3));let r=new Jt({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){let s=new Se,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}},Fh=class{constructor(){this.type="ShapePath",this.color=new Se,this.subPaths=[],this.currentPath=null,this.userData={}}moveTo(e,t){return this.currentPath=new cs,this.subPaths.push(this.currentPath),this.currentPath.moveTo(e,t),this}lineTo(e,t){return this.currentPath.lineTo(e,t),this}quadraticCurveTo(e,t,n,s){return this.currentPath.quadraticCurveTo(e,t,n,s),this}bezierCurveTo(e,t,n,s,r,o){return this.currentPath.bezierCurveTo(e,t,n,s,r,o),this}splineThru(e){return this.currentPath.splineThru(e),this}toShapes(){function e(l,c){let u=!1,f=c.length;for(let h=0,d=f-1;h<f;d=h++){let p=c[h],x=c[d];p.y>l.y!=x.y>l.y&&l.x<(x.x-p.x)*(l.y-p.y)/(x.y-p.y)+p.x&&(u=!u)}return u}function t(l,c){let u=c.getCenter(new oe);if(e(u,l))return u;let f=u.y,h=[],d=l.length;for(let p=0;p<d;p++){let x=l[p],m=l[(p+1)%d];if(x.y>f!=m.y>f){let g=x.x+(f-x.y)*(m.x-x.x)/(m.y-x.y);h.push(g)}}return h.length>1&&(h.sort((p,x)=>p-x),u.x=(h[0]+h[1])/2),u}let n=this.userData.style&&this.userData.style.fillRule||"nonzero";n!=="nonzero"&&n!=="evenodd"&&(_e('Fill-rule "'+n+'" is not supported, falling back to "nonzero".'),n="nonzero");let s=n==="nonzero"?(l=>l!==0):(l=>(l&1)!==0),r=[];for(let l of this.subPaths){let c=l.getPoints();if(c.length<3)continue;let u=jt.area(c);if(u===0)continue;let f=new Tl;for(let h=0;h<c.length;h++)f.expandByPoint(c[h]);r.push({subPath:l,points:c,boundingBox:f,interiorPoint:t(c,f),absArea:Math.abs(u),winding:u<0?-1:1,container:null,exclude:!1,role:null})}r.sort((l,c)=>c.absArea-l.absArea);for(let l=0;l<r.length;l++){let c=r[l],u=0;for(let f=l-1;f>=0;f--){let h=r[f];if(h.boundingBox.containsBox(c.boundingBox)&&e(c.interiorPoint,h.points)){c.container=h.exclude?h.container:h,u=h.winding,c.winding+=u;break}}s(c.winding)===s(u)&&(c.exclude=!0)}for(let l of r)l.exclude||(l.role=l.container===null||l.container.role==="hole"?"outer":"hole");let o=[],a=new Map;for(let l of r){if(l.exclude||l.role!=="outer")continue;let c=new us;c.curves=l.subPath.curves,o.push(c),a.set(l,c)}for(let l of r){if(l.exclude||l.role!=="hole")continue;let c=a.get(l.container);if(!c)continue;let u=new cs;u.curves=l.subPath.curves,c.holes.push(u)}return o}},Oh=class extends An{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Iv(i,e){let t=i.image&&i.image.width?i.image.width/i.image.height:1;return t>e?(i.repeat.x=1,i.repeat.y=t/e,i.offset.x=0,i.offset.y=(1-i.repeat.y)/2):(i.repeat.x=e/t,i.repeat.y=1,i.offset.x=(1-i.repeat.x)/2,i.offset.y=0),i}function Pv(i,e){let t=i.image&&i.image.width?i.image.width/i.image.height:1;return t>e?(i.repeat.x=e/t,i.repeat.y=1,i.offset.x=(1-i.repeat.x)/2,i.offset.y=0):(i.repeat.x=1,i.repeat.y=t/e,i.offset.x=0,i.offset.y=(1-i.repeat.y)/2),i}function Lv(i){return i.repeat.x=1,i.repeat.y=1,i.offset.x=0,i.offset.y=0,i}function cf(i,e,t,n){let s=Dv(n);switch(t){case rf:return i*e;case Ll:return i*e/s.components*s.byteLength;case Mo:return i*e/s.components*s.byteLength;case Gi:return i*e*2/s.components*s.byteLength;case Dl:return i*e*2/s.components*s.byteLength;case of:return i*e*3/s.components*s.byteLength;case cn:return i*e*4/s.components*s.byteLength;case Nl:return i*e*4/s.components*s.byteLength;case So:case wo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ao:case Eo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fl:case Bl:return Math.max(i,16)*Math.max(e,8)/4;case Ul:case Ol:return Math.max(i,8)*Math.max(e,8)/2;case kl:case Vl:case Gl:case Hl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case zl:case To:case Wl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Xl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ql:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Yl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Zl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Jl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case $l:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Kl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case jl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ql:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ec:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case tc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case nc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ic:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case sc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case rc:case oc:case ac:return Math.ceil(i/4)*Math.ceil(e/4)*16;case lc:case cc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Ro:case uc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Dv(i){switch(i){case bn:case ef:return{byteLength:1,components:1};case tr:case tf:case Xn:return{byteLength:2,components:1};case Il:case Pl:return{byteLength:2,components:4};case Un:case Cl:case ln:return{byteLength:4,components:1};case nf:case sf:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}var Bh=class{static contain(e,t){return Iv(e,t)}static cover(e,t){return Pv(e,t)}static fill(e){return Lv(e)}static getByteLength(e,t,n,s){return cf(e,t,n,s)}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?_e("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");var Mw={};O_(Mw,{ACESFilmicToneMapping:()=>Jh,AddEquation:()=>ps,AddOperation:()=>np,AdditiveAnimationBlendMode:()=>af,AdditiveBlending:()=>zh,AgXToneMapping:()=>Kh,AlphaFormat:()=>rf,AlwaysCompare:()=>mp,AlwaysDepth:()=>ca,AlwaysStencilFunc:()=>cp,AmbientLight:()=>ml,AnimationAction:()=>El,AnimationClip:()=>hs,AnimationLoader:()=>ju,AnimationMixer:()=>hh,AnimationObjectGroup:()=>uh,AnimationUtils:()=>Ku,ArcCurve:()=>Ua,ArrayCamera:()=>Ml,ArrowHelper:()=>Nh,AttachedBindMode:()=>Iu,Audio:()=>wl,AudioAnalyser:()=>ch,AudioContext:()=>go,AudioListener:()=>ah,AudioLoader:()=>rh,AxesHelper:()=>Uh,BackSide:()=>un,BasicDepthPacking:()=>ap,BasicShadowMap:()=>X0,BatchedMesh:()=>Ea,BezierInterpolant:()=>cl,Bone:()=>qr,BooleanKeyframeTrack:()=>_i,Box2:()=>Tl,Box3:()=>zt,Box3Helper:()=>Lh,BoxGeometry:()=>ls,BoxHelper:()=>Ph,BufferAttribute:()=>tt,BufferGeometry:()=>Ke,BufferGeometryLoader:()=>vl,ByteType:()=>ef,Cache:()=>ti,Camera:()=>$s,CameraHelper:()=>Ih,CanvasTexture:()=>Zu,CapsuleGeometry:()=>Pa,CatmullRomCurve3:()=>Fa,CineonToneMapping:()=>Zh,CircleGeometry:()=>La,ClampToEdgeWrapping:()=>xn,Clock:()=>_h,Color:()=>Se,ColorKeyframeTrack:()=>uo,ColorManagement:()=>at,Compatibility:()=>Dg,CompressedArrayTexture:()=>qu,CompressedCubeTexture:()=>Yu,CompressedTexture:()=>Hs,CompressedTextureLoader:()=>Qu,ConeGeometry:()=>$r,ConstantAlphaFactor:()=>Qd,ConstantColorFactor:()=>Kd,Controls:()=>Oh,CubeCamera:()=>bl,CubeDepthTexture:()=>Ia,CubeReflectionMapping:()=>oi,CubeRefractionMapping:()=>Vi,CubeTexture:()=>as,CubeTextureLoader:()=>eh,CubeUVReflectionMapping:()=>Qs,CubicBezierCurve:()=>Kr,CubicBezierCurve3:()=>Oa,CubicInterpolant:()=>al,CullFaceBack:()=>Vh,CullFaceFront:()=>Ud,CullFaceFrontBack:()=>W0,CullFaceNone:()=>Nd,Curve:()=>Tn,CurvePath:()=>ka,CustomBlending:()=>Od,CustomToneMapping:()=>$h,CylinderGeometry:()=>Jr,Cylindrical:()=>vh,Data3DTexture:()=>ks,DataArrayTexture:()=>Bs,DataTexture:()=>_n,DataTextureLoader:()=>th,DataUtils:()=>Uu,DecrementStencilOp:()=>ug,DecrementWrapStencilOp:()=>fg,DefaultLoadingManager:()=>bp,DepthFormat:()=>ni,DepthStencilFormat:()=>zi,DepthTexture:()=>Fi,DetachedBindMode:()=>ip,DirectionalLight:()=>pl,DirectionalLightHelper:()=>Ch,DiscreteInterpolant:()=>ll,DodecahedronGeometry:()=>Da,DoubleSide:()=>Nn,DstAlphaFactor:()=>qd,DstColorFactor:()=>Zd,DynamicCopyUsage:()=>Tg,DynamicDrawUsage:()=>bg,DynamicReadUsage:()=>wg,EdgesGeometry:()=>Na,EllipseCurve:()=>Ws,EqualCompare:()=>fp,EqualDepth:()=>ha,EqualStencilFunc:()=>gg,EquirectangularReflectionMapping:()=>yo,EquirectangularRefractionMapping:()=>vo,Euler:()=>Gn,EventDispatcher:()=>An,ExternalTexture:()=>Zr,ExtrudeGeometry:()=>Ha,FileLoader:()=>Hn,Float16BufferAttribute:()=>zu,Float32BufferAttribute:()=>Le,FloatType:()=>ln,Fog:()=>_a,FogExp2:()=>xa,FramebufferTexture:()=>Xu,FrontSide:()=>ki,Frustum:()=>xi,FrustumArray:()=>Aa,GLBufferAttribute:()=>gh,GLSL1:()=>Cg,GLSL3:()=>lf,GreaterCompare:()=>dp,GreaterDepth:()=>da,GreaterEqualCompare:()=>dc,GreaterEqualDepth:()=>fa,GreaterEqualStencilFunc:()=>vg,GreaterStencilFunc:()=>_g,GridHelper:()=>Th,Group:()=>Li,HTMLTexture:()=>Ju,HalfFloatType:()=>Xn,HemisphereLight:()=>hl,HemisphereLightHelper:()=>Eh,IcosahedronGeometry:()=>Wa,ImageBitmapLoader:()=>sh,ImageLoader:()=>fs,ImageUtils:()=>ga,IncrementStencilOp:()=>cg,IncrementWrapStencilOp:()=>hg,InstancedBufferAttribute:()=>Ui,InstancedBufferGeometry:()=>yl,InstancedInterleavedBuffer:()=>mh,InstancedMesh:()=>wa,Int16BufferAttribute:()=>ku,Int32BufferAttribute:()=>Vu,Int8BufferAttribute:()=>Fu,IntType:()=>Cl,InterleavedBuffer:()=>Gs,InterleavedBufferAttribute:()=>os,Interpolant:()=>Bi,InterpolateBezier:()=>Pu,InterpolateDiscrete:()=>Fr,InterpolateLinear:()=>ma,InterpolateSmooth:()=>na,InterpolationSamplingMode:()=>Lg,InterpolationSamplingType:()=>Pg,InvertStencilOp:()=>dg,KeepStencilOp:()=>ia,KeyframeTrack:()=>vn,LOD:()=>ba,LatheGeometry:()=>Xa,Layers:()=>Vs,LessCompare:()=>hp,LessDepth:()=>ua,LessEqualCompare:()=>fc,LessEqualDepth:()=>Fs,LessEqualStencilFunc:()=>xg,LessStencilFunc:()=>mg,Light:()=>si,LightProbe:()=>xl,LightShadow:()=>Js,Line:()=>ii,Line3:()=>Mh,LineBasicMaterial:()=>Jt,LineCurve:()=>jr,LineCurve3:()=>Ba,LineDashedMaterial:()=>ol,LineLoop:()=>Ta,LineSegments:()=>Dn,LinearFilter:()=>wt,LinearInterpolant:()=>co,LinearMipMapLinearFilter:()=>$0,LinearMipMapNearestFilter:()=>J0,LinearMipmapLinearFilter:()=>ai,LinearMipmapNearestFilter:()=>bo,LinearSRGBColorSpace:()=>Br,LinearToneMapping:()=>qh,LinearTransfer:()=>kr,Loader:()=>en,LoaderUtils:()=>mo,LoadingManager:()=>fo,LoopOnce:()=>sp,LoopPingPong:()=>op,LoopRepeat:()=>rp,MOUSE:()=>G0,Material:()=>Bt,MaterialBlending:()=>q0,MaterialLoader:()=>_l,MathUtils:()=>zg,Matrix2:()=>bh,Matrix3:()=>Qe,Matrix4:()=>$e,MaxEquation:()=>zd,Mesh:()=>Tt,MeshBasicMaterial:()=>En,MeshDepthMaterial:()=>ao,MeshDistanceMaterial:()=>lo,MeshLambertMaterial:()=>sl,MeshMatcapMaterial:()=>rl,MeshNormalMaterial:()=>il,MeshPhongMaterial:()=>tl,MeshPhysicalMaterial:()=>el,MeshStandardMaterial:()=>oo,MeshToonMaterial:()=>nl,MinEquation:()=>Vd,MirroredRepeatWrapping:()=>Ur,MixOperation:()=>tp,MultiplyBlending:()=>Hh,MultiplyOperation:()=>_o,NearestFilter:()=>Ct,NearestMipMapLinearFilter:()=>Z0,NearestMipMapNearestFilter:()=>Y0,NearestMipmapLinearFilter:()=>er,NearestMipmapNearestFilter:()=>Qh,NeutralToneMapping:()=>jh,NeverCompare:()=>up,NeverDepth:()=>la,NeverStencilFunc:()=>pg,NoBlending:()=>ri,NoColorSpace:()=>bi,NoNormalPacking:()=>sg,NoToneMapping:()=>Wn,NormalAnimationBlendMode:()=>hc,NormalBlending:()=>js,NormalGAPacking:()=>og,NormalRGPacking:()=>rg,NotEqualCompare:()=>pp,NotEqualDepth:()=>pa,NotEqualStencilFunc:()=>yg,NumberKeyframeTrack:()=>Ys,Object3D:()=>ft,ObjectLoader:()=>ih,ObjectSpaceNormalMap:()=>lp,OctahedronGeometry:()=>io,OneFactor:()=>Hd,OneMinusConstantAlphaFactor:()=>ep,OneMinusConstantColorFactor:()=>jd,OneMinusDstAlphaFactor:()=>Yd,OneMinusDstColorFactor:()=>Jd,OneMinusSrcAlphaFactor:()=>Xh,OneMinusSrcColorFactor:()=>Xd,OrthographicCamera:()=>ds,PCFShadowMap:()=>xo,PCFSoftShadowMap:()=>Fd,PMREMGenerator:()=>_c,Path:()=>cs,PerspectiveCamera:()=>Ft,Plane:()=>Vn,PlaneGeometry:()=>qs,PlaneHelper:()=>Dh,PointLight:()=>dl,PointLightHelper:()=>Ah,Points:()=>Ra,PointsMaterial:()=>Yr,PolarGridHelper:()=>Rh,PolyhedronGeometry:()=>Oi,PositionalAudio:()=>lh,PropertyBinding:()=>xt,PropertyMixer:()=>Al,QuadraticBezierCurve:()=>Qr,QuadraticBezierCurve3:()=>eo,Quaternion:()=>Zt,QuaternionKeyframeTrack:()=>Zs,QuaternionLinearInterpolant:()=>ul,R11_EAC_Format:()=>Gl,RED_GREEN_RGTC2_Format:()=>Ro,RED_RGTC1_Format:()=>lc,REVISION:()=>Dd,RG11_EAC_Format:()=>To,RGBADepthPacking:()=>tg,RGBAFormat:()=>cn,RGBAIntegerFormat:()=>Nl,RGBA_ASTC_10x10_Format:()=>nc,RGBA_ASTC_10x5_Format:()=>Ql,RGBA_ASTC_10x6_Format:()=>ec,RGBA_ASTC_10x8_Format:()=>tc,RGBA_ASTC_12x10_Format:()=>ic,RGBA_ASTC_12x12_Format:()=>sc,RGBA_ASTC_4x4_Format:()=>Xl,RGBA_ASTC_5x4_Format:()=>ql,RGBA_ASTC_5x5_Format:()=>Yl,RGBA_ASTC_6x5_Format:()=>Zl,RGBA_ASTC_6x6_Format:()=>Jl,RGBA_ASTC_8x5_Format:()=>$l,RGBA_ASTC_8x6_Format:()=>Kl,RGBA_ASTC_8x8_Format:()=>jl,RGBA_BPTC_Format:()=>rc,RGBA_ETC2_EAC_Format:()=>zl,RGBA_PVRTC_2BPPV1_Format:()=>Bl,RGBA_PVRTC_4BPPV1_Format:()=>Ol,RGBA_S3TC_DXT1_Format:()=>wo,RGBA_S3TC_DXT3_Format:()=>Ao,RGBA_S3TC_DXT5_Format:()=>Eo,RGBDepthPacking:()=>ng,RGBFormat:()=>of,RGBIntegerFormat:()=>K0,RGB_BPTC_SIGNED_Format:()=>oc,RGB_BPTC_UNSIGNED_Format:()=>ac,RGB_ETC1_Format:()=>kl,RGB_ETC2_Format:()=>Vl,RGB_PVRTC_2BPPV1_Format:()=>Fl,RGB_PVRTC_4BPPV1_Format:()=>Ul,RGB_S3TC_DXT1_Format:()=>So,RGDepthPacking:()=>ig,RGFormat:()=>Gi,RGIntegerFormat:()=>Dl,RawShaderMaterial:()=>ro,Ray:()=>Ni,Raycaster:()=>xh,RectAreaLight:()=>gl,RedFormat:()=>Ll,RedIntegerFormat:()=>Mo,ReinhardToneMapping:()=>Yh,RenderObjectRefreshType:()=>Ng,RenderTarget:()=>Gr,RenderTarget3D:()=>fh,RepeatWrapping:()=>Nr,ReplaceStencilOp:()=>lg,ReverseSubtractEquation:()=>kd,RingGeometry:()=>qa,SIGNED_R11_EAC_Format:()=>Hl,SIGNED_RED_GREEN_RGTC2_Format:()=>uc,SIGNED_RED_RGTC1_Format:()=>cc,SIGNED_RG11_EAC_Format:()=>Wl,SRGBColorSpace:()=>mn,SRGBTransfer:()=>dt,Scene:()=>ya,ShaderChunk:()=>st,ShaderLib:()=>li,ShaderMaterial:()=>yn,ShadowMaterial:()=>Qa,Shape:()=>us,ShapeGeometry:()=>Ya,ShapePath:()=>Fh,ShapeUtils:()=>jt,ShortType:()=>tf,Skeleton:()=>Sa,SkeletonHelper:()=>wh,SkinnedMesh:()=>Ma,Source:()=>Lu,Sphere:()=>Ot,SphereGeometry:()=>so,Spherical:()=>yh,SphericalHarmonics3:()=>po,SplineCurve:()=>to,SpotLight:()=>fl,SpotLightHelper:()=>Sh,Sprite:()=>va,SpriteMaterial:()=>Xr,SrcAlphaFactor:()=>Wh,SrcAlphaSaturateFactor:()=>$d,SrcColorFactor:()=>Wd,StaticCopyUsage:()=>Eg,StaticDrawUsage:()=>pc,StaticReadUsage:()=>Sg,StereoCamera:()=>oh,StreamCopyUsage:()=>Rg,StreamDrawUsage:()=>Mg,StreamReadUsage:()=>Ag,StringKeyframeTrack:()=>yi,SubtractEquation:()=>Bd,SubtractiveBlending:()=>Gh,TOUCH:()=>H0,TangentSpaceNormalMap:()=>vi,TetrahedronGeometry:()=>Za,Texture:()=>It,TextureLoader:()=>nh,TextureSource:()=>zn,TextureUtils:()=>Bh,Timer:()=>Sl,TimestampQuery:()=>Ig,TorusGeometry:()=>Ja,TorusKnotGeometry:()=>$a,Triangle:()=>ei,TriangleFanDrawMode:()=>eg,TriangleStripDrawMode:()=>Q0,TrianglesDrawMode:()=>j0,TubeGeometry:()=>Ka,UVMapping:()=>Rl,Uint16BufferAttribute:()=>Hr,Uint32BufferAttribute:()=>Wr,Uint8BufferAttribute:()=>Ou,Uint8ClampedBufferAttribute:()=>Bu,Uniform:()=>dh,UniformsGroup:()=>ph,UniformsLib:()=>we,UniformsUtils:()=>vp,UnsignedByteType:()=>bn,UnsignedInt101111Type:()=>sf,UnsignedInt248Type:()=>nr,UnsignedInt5999Type:()=>nf,UnsignedIntType:()=>Un,UnsignedShort4444Type:()=>Il,UnsignedShort5551Type:()=>Pl,UnsignedShortType:()=>tr,VSMShadowMap:()=>Ks,Vector2:()=>oe,Vector3:()=>N,Vector4:()=>_t,VectorKeyframeTrack:()=>ho,VideoFrameTexture:()=>Wu,VideoTexture:()=>Ca,WebGL3DRenderTarget:()=>Nu,WebGLArrayRenderTarget:()=>Du,WebGLCoordinateSystem:()=>wn,WebGLCubeRenderTarget:()=>yc,WebGLRenderTarget:()=>Qt,WebGLRenderer:()=>Wp,WebGLUtils:()=>Ax,WebGPUCoordinateSystem:()=>ss,WebXRController:()=>zs,WireframeGeometry:()=>ja,WrapAroundEnding:()=>Or,ZeroCurvatureEnding:()=>ns,ZeroFactor:()=>Gd,ZeroSlopeEnding:()=>is,ZeroStencilOp:()=>ag,createCanvasElement:()=>gp,error:()=>ke,getConsoleFunction:()=>Og,log:()=>zr,setConsoleFunction:()=>Fg,warn:()=>_e,warnOnce:()=>gi});function yx(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Nv(i){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,f=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),a.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,l,c){let u=l.array,f=l.updateRanges;if(i.bindBuffer(c,a),f.length===0)i.bufferSubData(c,0,u);else{f.sort((d,p)=>d.start-p.start);let h=0;for(let d=1;d<f.length;d++){let p=f[h],x=f[d];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++h,f[h]=x)}f.length=h+1;for(let d=0,p=f.length;d<p;d++){let x=f[d];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Uv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Fv=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ov=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Bv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,kv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Vv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zv=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Gv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Hv=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Wv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Xv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,qv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Yv=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Zv=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Jv=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$v=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Kv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,jv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Qv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,eb=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,tb=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,nb=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ib=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,sb=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,rb=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ob=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,ab=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,lb=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,cb=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ub=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,hb="gl_FragColor = linearToOutputTexel( gl_FragColor );",fb=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,db=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,pb=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,mb=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,gb=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,xb=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,_b=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,yb=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,vb=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,bb=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Mb=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Sb=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,wb=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ab=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Eb=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Tb=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Rb=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Cb=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ib=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Pb=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Lb=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Db=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Nb=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ub=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Fb=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ob=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Bb=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,kb=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vb=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,zb=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Gb=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Hb=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Wb=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Xb=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,qb=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Yb=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Zb=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Jb=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,$b=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Kb=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,jb=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Qb=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,eM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,tM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,nM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,iM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,sM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,rM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,oM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,aM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,lM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,cM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,uM=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,hM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,pM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,mM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,gM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,xM=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,_M=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,yM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,vM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,bM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,MM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,SM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,wM=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,AM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,EM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,TM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,RM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,CM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,IM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,PM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,LM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,DM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,NM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,UM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,FM=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,OM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,BM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,VM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,GM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,HM=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,WM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,XM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,qM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,YM=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ZM=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,JM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,$M=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,KM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jM=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,QM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,eS=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tS=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,nS=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,iS=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sS=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rS=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,oS=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,aS=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,lS=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cS=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,uS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hS=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fS=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,dS=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,pS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,st={alphahash_fragment:Uv,alphahash_pars_fragment:Fv,alphamap_fragment:Ov,alphamap_pars_fragment:Bv,alphatest_fragment:kv,alphatest_pars_fragment:Vv,aomap_fragment:zv,aomap_pars_fragment:Gv,batching_pars_vertex:Hv,batching_vertex:Wv,begin_vertex:Xv,beginnormal_vertex:qv,bsdfs:Yv,iridescence_fragment:Zv,bumpmap_pars_fragment:Jv,clipping_planes_fragment:$v,clipping_planes_pars_fragment:Kv,clipping_planes_pars_vertex:jv,clipping_planes_vertex:Qv,color_fragment:eb,color_pars_fragment:tb,color_pars_vertex:nb,color_vertex:ib,common:sb,cube_uv_reflection_fragment:rb,defaultnormal_vertex:ob,displacementmap_pars_vertex:ab,displacementmap_vertex:lb,emissivemap_fragment:cb,emissivemap_pars_fragment:ub,colorspace_fragment:hb,colorspace_pars_fragment:fb,envmap_fragment:db,envmap_common_pars_fragment:pb,envmap_pars_fragment:mb,envmap_pars_vertex:gb,envmap_physical_pars_fragment:Tb,envmap_vertex:xb,fog_vertex:_b,fog_pars_vertex:yb,fog_fragment:vb,fog_pars_fragment:bb,gradientmap_pars_fragment:Mb,lightmap_pars_fragment:Sb,lights_lambert_fragment:wb,lights_lambert_pars_fragment:Ab,lights_pars_begin:Eb,lights_toon_fragment:Rb,lights_toon_pars_fragment:Cb,lights_phong_fragment:Ib,lights_phong_pars_fragment:Pb,lights_physical_fragment:Lb,lights_physical_pars_fragment:Db,lights_fragment_begin:Nb,lights_fragment_maps:Ub,lights_fragment_end:Fb,lightprobes_pars_fragment:Ob,logdepthbuf_fragment:Bb,logdepthbuf_pars_fragment:kb,logdepthbuf_pars_vertex:Vb,logdepthbuf_vertex:zb,map_fragment:Gb,map_pars_fragment:Hb,map_particle_fragment:Wb,map_particle_pars_fragment:Xb,metalnessmap_fragment:qb,metalnessmap_pars_fragment:Yb,morphinstance_vertex:Zb,morphcolor_vertex:Jb,morphnormal_vertex:$b,morphtarget_pars_vertex:Kb,morphtarget_vertex:jb,normal_fragment_begin:Qb,normal_fragment_maps:eM,normal_pars_fragment:tM,normal_pars_vertex:nM,normal_vertex:iM,normalmap_pars_fragment:sM,clearcoat_normal_fragment_begin:rM,clearcoat_normal_fragment_maps:oM,clearcoat_pars_fragment:aM,iridescence_pars_fragment:lM,opaque_fragment:cM,packing:uM,premultiplied_alpha_fragment:hM,project_vertex:fM,dithering_fragment:dM,dithering_pars_fragment:pM,roughnessmap_fragment:mM,roughnessmap_pars_fragment:gM,shadowmap_pars_fragment:xM,shadowmap_pars_vertex:_M,shadowmap_vertex:yM,shadowmask_pars_fragment:vM,skinbase_vertex:bM,skinning_pars_vertex:MM,skinning_vertex:SM,skinnormal_vertex:wM,specularmap_fragment:AM,specularmap_pars_fragment:EM,tonemapping_fragment:TM,tonemapping_pars_fragment:RM,transmission_fragment:CM,transmission_pars_fragment:IM,uv_pars_fragment:PM,uv_pars_vertex:LM,uv_vertex:DM,worldpos_vertex:NM,background_vert:UM,background_frag:FM,backgroundCube_vert:OM,backgroundCube_frag:BM,cube_vert:kM,cube_frag:VM,depth_vert:zM,depth_frag:GM,distance_vert:HM,distance_frag:WM,equirect_vert:XM,equirect_frag:qM,linedashed_vert:YM,linedashed_frag:ZM,meshbasic_vert:JM,meshbasic_frag:$M,meshlambert_vert:KM,meshlambert_frag:jM,meshmatcap_vert:QM,meshmatcap_frag:eS,meshnormal_vert:tS,meshnormal_frag:nS,meshphong_vert:iS,meshphong_frag:sS,meshphysical_vert:rS,meshphysical_frag:oS,meshtoon_vert:aS,meshtoon_frag:lS,points_vert:cS,points_frag:uS,shadow_vert:hS,shadow_frag:fS,sprite_vert:dS,sprite_frag:pS},we={common:{diffuse:{value:new Se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new Se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new Se(16777215)},opacity:{value:1},center:{value:new oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},li={basic:{uniforms:hn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.fog]),vertexShader:st.meshbasic_vert,fragmentShader:st.meshbasic_frag},lambert:{uniforms:hn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Se(0)},envMapIntensity:{value:1}}]),vertexShader:st.meshlambert_vert,fragmentShader:st.meshlambert_frag},phong:{uniforms:hn([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Se(0)},specular:{value:new Se(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:st.meshphong_vert,fragmentShader:st.meshphong_frag},standard:{uniforms:hn([we.common,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.roughnessmap,we.metalnessmap,we.fog,we.lights,{emissive:{value:new Se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag},toon:{uniforms:hn([we.common,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.gradientmap,we.fog,we.lights,{emissive:{value:new Se(0)}}]),vertexShader:st.meshtoon_vert,fragmentShader:st.meshtoon_frag},matcap:{uniforms:hn([we.common,we.bumpmap,we.normalmap,we.displacementmap,we.fog,{matcap:{value:null}}]),vertexShader:st.meshmatcap_vert,fragmentShader:st.meshmatcap_frag},points:{uniforms:hn([we.points,we.fog]),vertexShader:st.points_vert,fragmentShader:st.points_frag},dashed:{uniforms:hn([we.common,we.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:st.linedashed_vert,fragmentShader:st.linedashed_frag},depth:{uniforms:hn([we.common,we.displacementmap]),vertexShader:st.depth_vert,fragmentShader:st.depth_frag},normal:{uniforms:hn([we.common,we.bumpmap,we.normalmap,we.displacementmap,{opacity:{value:1}}]),vertexShader:st.meshnormal_vert,fragmentShader:st.meshnormal_frag},sprite:{uniforms:hn([we.sprite,we.fog]),vertexShader:st.sprite_vert,fragmentShader:st.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:st.background_vert,fragmentShader:st.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:st.backgroundCube_vert,fragmentShader:st.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:st.cube_vert,fragmentShader:st.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:st.equirect_vert,fragmentShader:st.equirect_frag},distance:{uniforms:hn([we.common,we.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:st.distance_vert,fragmentShader:st.distance_frag},shadow:{uniforms:hn([we.lights,we.fog,{color:{value:new Se(0)},opacity:{value:1}}]),vertexShader:st.shadow_vert,fragmentShader:st.shadow_frag}};li.physical={uniforms:hn([li.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new Se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new Se(0)},specularColor:{value:new Se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag};var uf={r:0,b:0,g:0},mS=new $e,vx=new Qe;vx.set(-1,0,0,0,1,0,0,0,1);function gS(i,e,t,n,s,r){let o=new Se(0),a=s===!0?0:1,l,c,u=null,f=0,h=null;function d(y){let S=y.isScene===!0?y.background:null;if(S&&S.isTexture){let v=y.backgroundBlurriness>0;S=e.get(S,v)}return S}function p(y){let S=!1,v=d(y);v===null?m(o,a):v&&v.isColor&&(m(v,1),S=!0);let M=i.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(y,S){let v=d(S);v&&(v.isCubeTexture||v.mapping===Qs)?(c===void 0&&(c=new Tt(new ls(1,1,1),new yn({name:"BackgroundCubeMaterial",uniforms:ir(li.backgroundCube.uniforms),vertexShader:li.backgroundCube.vertexShader,fragmentShader:li.backgroundCube.fragmentShader,side:un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(M,b,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(mS.makeRotationFromEuler(S.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(vx),c.material.toneMapped=at.getTransfer(v.colorSpace)!==dt,(u!==v||f!==v.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=v,f=v.version,h=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Tt(new qs(2,2),new yn({name:"BackgroundMaterial",uniforms:ir(li.background.uniforms),vertexShader:li.background.vertexShader,fragmentShader:li.background.fragmentShader,side:ki,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=at.getTransfer(v.colorSpace)!==dt,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||f!==v.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=v,f=v.version,h=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function m(y,S){y.getRGB(uf,yp(i)),t.buffers.color.setClear(uf.r,uf.g,uf.b,S,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,S=1){o.set(y),a=S,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(y){a=y,m(o,a)},render:p,addToRenderList:x,dispose:g}}function xS(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,o=!1;function a(L,I,P,C,U){let B=!1,z=f(L,C,P,I);r!==z&&(r=z,c(r.object)),B=d(L,C,P,U),B&&p(L,C,P,U),U!==null&&e.update(U,i.ELEMENT_ARRAY_BUFFER),(B||o)&&(o=!1,v(L,I,P,C),U!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(U).buffer))}function l(){return i.createVertexArray()}function c(L){return i.bindVertexArray(L)}function u(L){return i.deleteVertexArray(L)}function f(L,I,P,C){let U=C.wireframe===!0,B=n[I.id];B===void 0&&(B={},n[I.id]=B);let z=L.isInstancedMesh===!0?L.id:0,j=B[z];j===void 0&&(j={},B[z]=j);let q=j[P.id];q===void 0&&(q={},j[P.id]=q);let k=q[U];return k===void 0&&(k=h(l()),q[U]=k),k}function h(L){let I=[],P=[],C=[];for(let U=0;U<t;U++)I[U]=0,P[U]=0,C[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:P,attributeDivisors:C,object:L,attributes:{},index:null}}function d(L,I,P,C){let U=r.attributes,B=I.attributes,z=0,j=P.getAttributes();for(let q in j)if(j[q].location>=0){let H=U[q],ue=B[q];if(ue===void 0&&(q==="instanceMatrix"&&L.instanceMatrix&&(ue=L.instanceMatrix),q==="instanceColor"&&L.instanceColor&&(ue=L.instanceColor)),H===void 0||H.attribute!==ue||ue&&H.data!==ue.data)return!0;z++}return r.attributesNum!==z||r.index!==C}function p(L,I,P,C){let U={},B=I.attributes,z=0,j=P.getAttributes();for(let q in j)if(j[q].location>=0){let H=B[q];H===void 0&&(q==="instanceMatrix"&&L.instanceMatrix&&(H=L.instanceMatrix),q==="instanceColor"&&L.instanceColor&&(H=L.instanceColor));let ue={};ue.attribute=H,H&&H.data&&(ue.data=H.data),U[q]=ue,z++}r.attributes=U,r.attributesNum=z,r.index=C}function x(){let L=r.newAttributes;for(let I=0,P=L.length;I<P;I++)L[I]=0}function m(L){g(L,0)}function g(L,I){let P=r.newAttributes,C=r.enabledAttributes,U=r.attributeDivisors;P[L]=1,C[L]===0&&(i.enableVertexAttribArray(L),C[L]=1),U[L]!==I&&(i.vertexAttribDivisor(L,I),U[L]=I)}function y(){let L=r.newAttributes,I=r.enabledAttributes;for(let P=0,C=I.length;P<C;P++)I[P]!==L[P]&&(i.disableVertexAttribArray(P),I[P]=0)}function S(L,I,P,C,U,B,z){z===!0?i.vertexAttribIPointer(L,I,P,U,B):i.vertexAttribPointer(L,I,P,C,U,B)}function v(L,I,P,C){x();let U=C.attributes,B=P.getAttributes(),z=I.defaultAttributeValues;for(let j in B){let q=B[j];if(q.location>=0){let k=U[j];if(k===void 0&&(j==="instanceMatrix"&&L.instanceMatrix&&(k=L.instanceMatrix),j==="instanceColor"&&L.instanceColor&&(k=L.instanceColor)),k!==void 0){let H=k.normalized,ue=k.itemSize,de=e.get(k);if(de===void 0)continue;let G=de.buffer,le=de.type,ge=de.bytesPerElement,X=le===i.INT||le===i.UNSIGNED_INT||k.gpuType===Cl;if(k.isInterleavedBufferAttribute){let Y=k.data,he=Y.stride,Re=k.offset;if(Y.isInstancedInterleavedBuffer){for(let me=0;me<q.locationSize;me++)g(q.location+me,Y.meshPerAttribute);L.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let me=0;me<q.locationSize;me++)m(q.location+me);i.bindBuffer(i.ARRAY_BUFFER,G);for(let me=0;me<q.locationSize;me++)S(q.location+me,ue/q.locationSize,le,H,he*ge,(Re+ue/q.locationSize*me)*ge,X)}else{if(k.isInstancedBufferAttribute){for(let Y=0;Y<q.locationSize;Y++)g(q.location+Y,k.meshPerAttribute);L.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=k.meshPerAttribute*k.count)}else for(let Y=0;Y<q.locationSize;Y++)m(q.location+Y);i.bindBuffer(i.ARRAY_BUFFER,G);for(let Y=0;Y<q.locationSize;Y++)S(q.location+Y,ue/q.locationSize,le,H,ue*ge,ue/q.locationSize*Y*ge,X)}}else if(z!==void 0){let H=z[j];if(H!==void 0)switch(H.length){case 2:i.vertexAttrib2fv(q.location,H);break;case 3:i.vertexAttrib3fv(q.location,H);break;case 4:i.vertexAttrib4fv(q.location,H);break;default:i.vertexAttrib1fv(q.location,H)}}}}y()}function M(){A();for(let L in n){let I=n[L];for(let P in I){let C=I[P];for(let U in C){let B=C[U];for(let z in B)u(B[z].object),delete B[z];delete C[U]}}delete n[L]}}function b(L){if(n[L.id]===void 0)return;let I=n[L.id];for(let P in I){let C=I[P];for(let U in C){let B=C[U];for(let z in B)u(B[z].object),delete B[z];delete C[U]}}delete n[L.id]}function E(L){for(let I in n){let P=n[I];for(let C in P){let U=P[C];if(U[L.id]===void 0)continue;let B=U[L.id];for(let z in B)u(B[z].object),delete B[z];delete U[L.id]}}}function _(L){for(let I in n){let P=n[I],C=L.isInstancedMesh===!0?L.id:0,U=P[C];if(U!==void 0){for(let B in U){let z=U[B];for(let j in z)u(z[j].object),delete z[j];delete U[B]}delete P[C],Object.keys(P).length===0&&delete n[I]}}}function A(){R(),o=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:R,dispose:M,releaseStatesOfGeometry:b,releaseStatesOfObject:_,releaseStatesOfProgram:E,initAttributes:x,enableAttribute:m,disableUnusedAttributes:y}}function _S(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function a(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let d=0;d<u;d++)h+=c[d];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function yS(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let E=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(E){return!(E!==cn&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){let _=E===Xn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(E!==bn&&E!==ln&&!_&&n.convert(E)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(E){if(E==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(_e("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let f=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&_e("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=i.getParameter(i.MAX_SAMPLES),b=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:d,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:y,maxVaryings:S,maxFragmentUniforms:v,maxSamples:M,samples:b}}function vS(i){let e=this,t=null,n=0,s=!1,r=!1,o=new Vn,a=new Qe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let d=f.length!==0||h||n!==0||s;return s=h,n=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,d){let p=f.clippingPlanes,x=f.clipIntersection,m=f.clipShadows,g=i.get(f);if(!s||p===null||p.length===0||r&&!m)r?u(null):c();else{let y=r?0:n,S=y*4,v=g.clippingState||null;l.value=v,v=u(p,h,S,d);for(let M=0;M!==S;++M)v[M]=t[M];g.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(f,h,d,p){let x=f!==null?f.length:0,m=null;if(x!==0){if(m=l.value,p!==!0||m===null){let g=d+x*4,y=h.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<g)&&(m=new Float32Array(g));for(let S=0,v=d;S!==x;++S,v+=4)o.copy(f[S]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}var Io=4,bS=6,MS=20,SS=256,mc=new ds,jg=new Se,Cp=null,Ip=0,Pp=0,Lp=!1,wS=new N,sr=new N,_c=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=wS}=r;Cp=this._renderer.getRenderTarget(),Ip=this._renderer.getActiveCubeFace(),Pp=this._renderer.getActiveMipmapLevel(),Lp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tx(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ex(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Cp,Ip,Pp),this._renderer.xr.enabled=Lp,e.scissorTest=!1,Co(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===oi||e.mapping===Vi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Cp=this._renderer.getRenderTarget(),Ip=this._renderer.getActiveCubeFace(),Pp=this._renderer.getActiveMipmapLevel(),Lp=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:wt,minFilter:wt,generateMipmaps:!1,type:Xn,format:cn,colorSpace:Br,depthBuffer:!1},s=Qg(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Qg(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=AS(r)),this._blurMaterial=TS(r,e,t),this._ggxMaterial=ES(r,e,t)}return s}_compileMaterial(e){let t=new Tt(new Ke,e);this._renderer.compile(t,mc)}_sceneToCubeUV(e,t,n,s,r){let l=new Ft(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,d=f.toneMapping;f.getClearColor(jg),f.toneMapping=Wn,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Tt(new ls,new En({name:"PMREM.Background",side:un,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,g=!1,y=e.background;y?y.isColor&&(m.color.copy(y),e.background=null,g=!0):(m.color.copy(jg),g=!0);for(let S=0;S<6;S++){let v=S%3;v===0?(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[S],r.y,r.z)):v===1?(l.up.set(0,0,c[S]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[S],r.z)):(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[S]));let M=this._cubeSize;Co(s,v*M,S>2?M:0,M,M),f.setRenderTarget(s),g&&f.render(x,l),f.render(e,l)}f.toneMapping=d,f.autoClear=h,e.background=y}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===oi||e.mapping===Vi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=tx()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ex());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Co(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,mc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=c*1.25,d=f*h,{_lodMax:p}=this,x=this._sizeLods[n],m=3*x*(n>p-Io?n-p+Io:0),g=4*(this._cubeSize-x);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=p-t,Co(r,m,g,3*x,2*x),s.setRenderTarget(r),s.render(a,mc),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=p-n,Co(e,m,g,3*x,2*x),s.setRenderTarget(e),s.render(a,mc)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,o),this._blurPass(r,e,n,n,o)}_blurPass(e,t,n,s,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;let c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],f=3*u*(s>this._lodMax-Io?s-this._lodMax+Io:0),h=4*(this._cubeSize-u);Co(t,f,h,3*u,2*u),o.setRenderTarget(t),o.render(l,mc)}};function AS(i){let e=[],t=[],n=i,s=i-Io+1+bS;for(let r=0;r<s;r++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),l=-a,c=1+a,u=[l,l,c,l,c,c,l,l,c,c,l,c],f=6,h=6,d=3,p=new Float32Array(d*h*f),x=new Float32Array(d*h*f);for(let g=0;g<f;g++){let y=g%3*2/3-1,S=g>2?0:-1,v=[y,S,0,y+2/3,S,0,y+2/3,S+1,0,y,S,0,y+2/3,S+1,0,y,S+1,0];p.set(v,d*h*g);for(let M=0;M<h;M++){let b=u[M*2]*2-1,E=u[M*2+1]*2-1;g===0?sr.set(1,E,b):g===1?sr.set(-b,1,-E):g===2?sr.set(-b,E,1):g===3?sr.set(-1,E,-b):g===4?sr.set(-b,-1,E):sr.set(b,E,-1),sr.toArray(x,(g*h+M)*d)}}let m=new Ke;m.setAttribute("position",new tt(p,d)),m.setAttribute("outputDirection",new tt(x,d)),t.push(new Tt(m,null)),n>Io&&n--}return{lodMeshes:t,sizeLods:e}}function Qg(i,e,t){let n=new Qt(i,e,t);return n.texture.mapping=Qs,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Co(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function ES(i,e,t){return new yn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:SS,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ff(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function TS(i,e,t){return new yn({name:"SphericalGaussianBlur",defines:{SAMPLES:MS,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ff(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function ex(){return new yn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ff(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function tx(){return new yn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ff(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ri,depthTest:!1,depthWrite:!1})}function ff(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var yc=class extends Qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new as(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ls(5,5,5),r=new yn({name:"CubemapFromEquirect",uniforms:ir(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:un,blending:ri});r.uniforms.tEquirect.value=t;let o=new Tt(s,r),a=t.minFilter;return t.minFilter===ai&&(t.minFilter=wt),new bl(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}};function RS(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,d=!1){return h==null?null:d?o(h):r(h)}function r(h){if(h&&h.isTexture){let d=h.mapping;if(d===yo||d===vo)if(e.has(h)){let p=e.get(h).texture;return a(p,h.mapping)}else{let p=h.image;if(p&&p.height>0){let x=new yc(p.height);return x.fromEquirectangularTexture(i,h),e.set(h,x),h.addEventListener("dispose",c),a(x.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture){let d=h.mapping,p=d===yo||d===vo,x=d===oi||d===Vi;if(p||x){let m=t.get(h),g=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==g)return n===null&&(n=new _c(i)),m=p?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{let y=h.image;return p&&y&&y.height>0||x&&y&&l(y)?(n===null&&(n=new _c(i)),m=p?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function a(h,d){return d===yo?h.mapping=oi:d===vo&&(h.mapping=Vi),h}function l(h){let d=0,p=6;for(let x=0;x<p;x++)h[x]!==void 0&&d++;return d===p}function c(h){let d=h.target;d.removeEventListener("dispose",c);let p=e.get(d);p!==void 0&&(e.delete(d),p.dispose())}function u(h){let d=h.target;d.removeEventListener("dispose",u);let p=t.get(d);p!==void 0&&(t.delete(d),p.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function CS(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&gi("WebGLRenderer: "+n+" extension not supported."),s}}}function IS(i,e,t,n){let s={},r=new WeakMap;function o(f){let h=f.target;h.index!==null&&e.remove(h.index);for(let p in h.attributes)e.remove(h.attributes[p]);h.removeEventListener("dispose",o),delete s[h.id];let d=r.get(h);d&&(e.remove(d),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(f,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(f){let h=f.attributes;for(let d in h)e.update(h[d],i.ARRAY_BUFFER)}function c(f){let h=[],d=f.index,p=f.attributes.position,x=0;if(p===void 0)return;if(d!==null){let y=d.array;x=d.version;for(let S=0,v=y.length;S<v;S+=3){let M=y[S+0],b=y[S+1],E=y[S+2];h.push(M,b,b,E,E,M)}}else{let y=p.array;x=p.version;for(let S=0,v=y.length/3-1;S<v;S+=3){let M=S+0,b=S+1,E=S+2;h.push(M,b,b,E,E,M)}}let m=new(p.count>=65535?Wr:Hr)(h,1);m.version=x;let g=r.get(f);g&&e.remove(g),r.set(f,m)}function u(f){let h=r.get(f);if(h){let d=f.index;d!==null&&h.version<d.version&&c(f)}else c(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:u}}function PS(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,h){i.drawElements(n,h,r,f*o),t.update(h,n,1)}function c(f,h,d){d!==0&&(i.drawElementsInstanced(n,h,r,f*o,d),t.update(h,n,d))}function u(f,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,d);let x=0;for(let m=0;m<d;m++)x+=h[m];t.update(x,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function LS(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:ke("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function DS(i,e,t){let n=new WeakMap,s=new _t;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=u!==void 0?u.length:0,h=n.get(a);if(h===void 0||h.count!==f){let A=function(){E.dispose(),n.delete(a),a.removeEventListener("dispose",A)};h!==void 0&&h.texture.dispose();let d=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],S=0;d===!0&&(S=1),p===!0&&(S=2),x===!0&&(S=3);let v=a.attributes.position.count*S,M=1;v>e.maxTextureSize&&(M=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let b=new Float32Array(v*M*4*f),E=new Bs(b,v,M,f);E.type=ln,E.needsUpdate=!0;let _=S*4;for(let R=0;R<f;R++){let L=m[R],I=g[R],P=y[R],C=v*M*4*R;for(let U=0;U<L.count;U++){let B=U*_;d===!0&&(s.fromBufferAttribute(L,U),b[C+B+0]=s.x,b[C+B+1]=s.y,b[C+B+2]=s.z,b[C+B+3]=0),p===!0&&(s.fromBufferAttribute(I,U),b[C+B+4]=s.x,b[C+B+5]=s.y,b[C+B+6]=s.z,b[C+B+7]=0),x===!0&&(s.fromBufferAttribute(P,U),b[C+B+8]=s.x,b[C+B+9]=s.y,b[C+B+10]=s.z,b[C+B+11]=P.itemSize===4?s.w:1)}}h={count:f,texture:E,size:new oe(v,M)},n.set(a,h),a.addEventListener("dispose",A)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];let p=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",p),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function NS(i,e,t,n,s){let r=new WeakMap;function o(c){let u=s.render.frame,f=c.geometry,h=e.get(c,f);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return h}function a(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var US={[qh]:"LINEAR_TONE_MAPPING",[Yh]:"REINHARD_TONE_MAPPING",[Zh]:"CINEON_TONE_MAPPING",[Jh]:"ACES_FILMIC_TONE_MAPPING",[Kh]:"AGX_TONE_MAPPING",[jh]:"NEUTRAL_TONE_MAPPING",[$h]:"CUSTOM_TONE_MAPPING"};function FS(i,e,t,n,s,r){let o=new Qt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new Ke;c.setAttribute("position",new Le([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Le([0,2,0,0,2,0],2));let u=new ro({uniforms:{tDiffuse:{value:null}},vertexShader:`
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

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

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

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Tt(c,u),h=new ds(-1,1,1,-1,0,1),d=null,p=null,x=!1,m,g=null,y=[],S=!1;this.setSize=function(v,M){o.setSize(v,M),a!==null&&a.setSize(v,M),l!==null&&l.setSize(v,M);for(let b=0;b<y.length;b++){let E=y[b];E.setSize&&E.setSize(v,M)}},this.setEffects=function(v){y=v,S=y.length>0&&y[0].isRenderPass===!0;let M=o.width,b=o.height;y.length>0&&a===null&&(a=new Qt(M,b,{type:Xn,depthBuffer:!1,stencilBuffer:!1}),l=new Qt(M,b,{type:Xn,depthBuffer:!1,stencilBuffer:!1}));for(let E=0;E<y.length;E++){let _=y[E];_.setSize&&_.setSize(M,b)}},this.begin=function(v,M){if(x||v.toneMapping===Wn&&y.length===0)return!1;if(g=M,M!==null){let b=M.width,E=M.height;(o.width!==b||o.height!==E)&&this.setSize(b,E)}return S===!1&&v.setRenderTarget(o),m=v.toneMapping,v.toneMapping=Wn,!0},this.hasRenderPass=function(){return S},this.end=function(v,M){v.toneMapping=m,x=!0;let b=o,E=a;for(let _=0;_<y.length;_++){let A=y[_];A.enabled!==!1&&(A.render(v,E,b,M),A.needsSwap!==!1&&(b=E,E=E===a?l:a))}if(d!==v.outputColorSpace||p!==v.toneMapping){d=v.outputColorSpace,p=v.toneMapping,u.defines={},at.getTransfer(d)===dt&&(u.defines.SRGB_TRANSFER="");let _=US[p];_&&(u.defines[_]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=b.texture,v.setRenderTarget(g),v.render(f,h),g=null,x=!1},this.isCompositing=function(){return x},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var bx=new It,Up=new Fi(1,1),Mx=new Bs,Sx=new ks,wx=new as,nx=[],ix=[],sx=new Float32Array(16),rx=new Float32Array(9),ox=new Float32Array(4);function Lo(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=nx[s];if(r===void 0&&(r=new Float32Array(s),nx[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Gt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ht(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function df(i,e){let t=ix[e];t===void 0&&(t=new Int32Array(e),ix[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function OS(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function BS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;i.uniform2fv(this.addr,e),Ht(t,e)}}function kS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Gt(t,e))return;i.uniform3fv(this.addr,e),Ht(t,e)}}function VS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;i.uniform4fv(this.addr,e),Ht(t,e)}}function zS(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ht(t,e)}else{if(Gt(t,n))return;ox.set(n),i.uniformMatrix2fv(this.addr,!1,ox),Ht(t,n)}}function GS(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ht(t,e)}else{if(Gt(t,n))return;rx.set(n),i.uniformMatrix3fv(this.addr,!1,rx),Ht(t,n)}}function HS(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ht(t,e)}else{if(Gt(t,n))return;sx.set(n),i.uniformMatrix4fv(this.addr,!1,sx),Ht(t,n)}}function WS(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function XS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;i.uniform2iv(this.addr,e),Ht(t,e)}}function qS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;i.uniform3iv(this.addr,e),Ht(t,e)}}function YS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;i.uniform4iv(this.addr,e),Ht(t,e)}}function ZS(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function JS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;i.uniform2uiv(this.addr,e),Ht(t,e)}}function $S(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;i.uniform3uiv(this.addr,e),Ht(t,e)}}function KS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;i.uniform4uiv(this.addr,e),Ht(t,e)}}function jS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Up.compareFunction=t.isReversedDepthBuffer()?dc:fc,r=Up):r=bx,t.setTexture2D(e||r,s)}function QS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Sx,s)}function e1(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||wx,s)}function t1(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Mx,s)}function n1(i){switch(i){case 5126:return OS;case 35664:return BS;case 35665:return kS;case 35666:return VS;case 35674:return zS;case 35675:return GS;case 35676:return HS;case 5124:case 35670:return WS;case 35667:case 35671:return XS;case 35668:case 35672:return qS;case 35669:case 35673:return YS;case 5125:return ZS;case 36294:return JS;case 36295:return $S;case 36296:return KS;case 35678:case 36198:case 36298:case 36306:case 35682:return jS;case 35679:case 36299:case 36307:return QS;case 35680:case 36300:case 36308:case 36293:return e1;case 36289:case 36303:case 36311:case 36292:return t1}}function i1(i,e){i.uniform1fv(this.addr,e)}function s1(i,e){let t=Lo(e,this.size,2);i.uniform2fv(this.addr,t)}function r1(i,e){let t=Lo(e,this.size,3);i.uniform3fv(this.addr,t)}function o1(i,e){let t=Lo(e,this.size,4);i.uniform4fv(this.addr,t)}function a1(i,e){let t=Lo(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function l1(i,e){let t=Lo(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function c1(i,e){let t=Lo(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function u1(i,e){i.uniform1iv(this.addr,e)}function h1(i,e){i.uniform2iv(this.addr,e)}function f1(i,e){i.uniform3iv(this.addr,e)}function d1(i,e){i.uniform4iv(this.addr,e)}function p1(i,e){i.uniform1uiv(this.addr,e)}function m1(i,e){i.uniform2uiv(this.addr,e)}function g1(i,e){i.uniform3uiv(this.addr,e)}function x1(i,e){i.uniform4uiv(this.addr,e)}function _1(i,e,t){let n=this.cache,s=e.length,r=df(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Ht(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Up:o=bx;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function y1(i,e,t){let n=this.cache,s=e.length,r=df(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Ht(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Sx,r[o])}function v1(i,e,t){let n=this.cache,s=e.length,r=df(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Ht(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||wx,r[o])}function b1(i,e,t){let n=this.cache,s=e.length,r=df(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Ht(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Mx,r[o])}function M1(i){switch(i){case 5126:return i1;case 35664:return s1;case 35665:return r1;case 35666:return o1;case 35674:return a1;case 35675:return l1;case 35676:return c1;case 5124:case 35670:return u1;case 35667:case 35671:return h1;case 35668:case 35672:return f1;case 35669:case 35673:return d1;case 5125:return p1;case 36294:return m1;case 36295:return g1;case 36296:return x1;case 35678:case 36198:case 36298:case 36306:case 35682:return _1;case 35679:case 36299:case 36307:return y1;case 35680:case 36300:case 36308:case 36293:return v1;case 36289:case 36303:case 36311:case 36292:return b1}}var Fp=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=n1(t.type)}},Op=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=M1(t.type)}},Bp=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},Dp=/(\w+)(\])?(\[|\.)?/g;function ax(i,e){i.seq.push(e),i.map[e.id]=e}function S1(i,e,t){let n=i.name,s=n.length;for(Dp.lastIndex=0;;){let r=Dp.exec(n),o=Dp.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){ax(t,c===void 0?new Fp(a,i,e):new Op(a,i,e));break}else{let f=t.map[a];f===void 0&&(f=new Bp(a),ax(t,f)),t=f}}}var Po=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);S1(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function lx(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var w1=37297,A1=0;function E1(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var cx=new Qe;function T1(i){at._getMatrix(cx,at.workingColorSpace,i);let e=`mat3( ${cx.elements.map(t=>t.toFixed(4))} )`;switch(at.getTransfer(i)){case kr:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return _e("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function ux(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+E1(i.getShaderSource(e),a)}else return r}function R1(i,e){let t=T1(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var C1={[qh]:"Linear",[Yh]:"Reinhard",[Zh]:"Cineon",[Jh]:"ACESFilmic",[Kh]:"AgX",[jh]:"Neutral",[$h]:"Custom"};function I1(i,e){let t=C1[e];return t===void 0?(_e("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var hf=new N;function P1(){at.getLuminanceCoefficients(hf);let i=hf.x.toFixed(4),e=hf.y.toFixed(4),t=hf.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function L1(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(xc).join(`
`)}function D1(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function N1(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function xc(i){return i!==""}function hx(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function fx(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var U1=/^[ \t]*#include +<([\w\d./]+)>/gm;function kp(i){return i.replace(U1,O1)}var F1=new Map;function O1(i,e){let t=st[e];if(t===void 0){let n=F1.get(e);if(n!==void 0)t=st[n],_e('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return kp(t)}var B1=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function dx(i){return i.replace(B1,k1)}function k1(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function px(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var V1={[xo]:"SHADOWMAP_TYPE_PCF",[Ks]:"SHADOWMAP_TYPE_VSM"};function z1(i){return V1[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var G1={[oi]:"ENVMAP_TYPE_CUBE",[Vi]:"ENVMAP_TYPE_CUBE",[Qs]:"ENVMAP_TYPE_CUBE_UV"};function H1(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":G1[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var W1={[Vi]:"ENVMAP_MODE_REFRACTION"};function X1(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":W1[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var q1={[_o]:"ENVMAP_BLENDING_MULTIPLY",[tp]:"ENVMAP_BLENDING_MIX",[np]:"ENVMAP_BLENDING_ADD"};function Y1(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":q1[i.combine]||"ENVMAP_BLENDING_NONE"}function Z1(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function J1(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=z1(t),c=H1(t),u=X1(t),f=Y1(t),h=Z1(t),d=L1(t),p=D1(r),x=s.createProgram(),m,g,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(xc).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(xc).join(`
`),g.length>0&&(g+=`
`)):(m=[px(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(xc).join(`
`),g=[px(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Wn?"#define TONE_MAPPING":"",t.toneMapping!==Wn?st.tonemapping_pars_fragment:"",t.toneMapping!==Wn?I1("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",st.colorspace_pars_fragment,R1("linearToOutputTexel",t.outputColorSpace),P1(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(xc).join(`
`)),o=kp(o),o=hx(o,t),o=fx(o,t),a=kp(a),a=hx(a,t),a=fx(a,t),o=dx(o),a=dx(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===lf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===lf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let S=y+m+o,v=y+g+a,M=lx(s,s.VERTEX_SHADER,S),b=lx(s,s.FRAGMENT_SHADER,v);s.attachShader(x,M),s.attachShader(x,b),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function E(L){if(i.debug.checkShaderErrors){let I=s.getProgramInfoLog(x)||"",P=s.getShaderInfoLog(M)||"",C=s.getShaderInfoLog(b)||"",U=I.trim(),B=P.trim(),z=C.trim(),j=!0,q=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(j=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,M,b);else{let k=ux(s,M,"vertex"),H=ux(s,b,"fragment");ke("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+U+`
`+k+`
`+H)}else U!==""?_e("WebGLProgram: Program Info Log:",U):(B===""||z==="")&&(q=!1);q&&(L.diagnostics={runnable:j,programLog:U,vertexShader:{log:B,prefix:m},fragmentShader:{log:z,prefix:g}})}s.deleteShader(M),s.deleteShader(b),_=new Po(s,x),A=N1(s,x)}let _;this.getUniforms=function(){return _===void 0&&E(this),_};let A;this.getAttributes=function(){return A===void 0&&E(this),A};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(x,w1)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=A1++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=M,this.fragmentShader=b,this}var $1=0,Vp=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new zp(e),t.set(e,n)),n}},zp=class{constructor(e){this.id=$1++,this.code=e,this.usedTimes=0}};function K1(i){return i===Gi||i===To||i===Ro}function j1(i,e,t,n,s,r){let o=new Vs,a=new Vp,l=new Set,c=[],u=new Map,f=n.logarithmicDepthBuffer,h=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_){return l.add(_),_===0?"uv":`uv${_}`}function x(_,A,R,L,I,P){let C=L.fog,U=I.geometry,B=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?L.environment:null,z=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,j=e.get(_.envMap||B,z),q=j&&j.mapping===Qs?j.image.height:null,k=d[_.type];_.precision!==null&&(h=n.getMaxPrecision(_.precision),h!==_.precision&&_e("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));let H=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,ue=H!==void 0?H.length:0,de=0;U.morphAttributes.position!==void 0&&(de=1),U.morphAttributes.normal!==void 0&&(de=2),U.morphAttributes.color!==void 0&&(de=3);let G,le,ge,X;if(k){let Mt=li[k];G=Mt.vertexShader,le=Mt.fragmentShader}else{G=_.vertexShader,le=_.fragmentShader;let Mt=a.getVertexShaderStage(_),mt=a.getFragmentShaderStage(_);a.update(_,Mt,mt),ge=Mt.id,X=mt.id}let Y=i.getRenderTarget(),he=i.state.buffers.depth.getReversed(),Re=I.isInstancedMesh===!0,me=I.isBatchedMesh===!0,Ie=!!_.map,je=!!_.matcap,ee=!!j,re=!!_.aoMap,se=!!_.lightMap,ae=!!_.bumpMap&&_.wireframe===!1,fe=!!_.normalMap,Pe=!!_.displacementMap,Ue=!!_.emissiveMap,qe=!!_.metalnessMap,Ye=!!_.roughnessMap,F=_.anisotropy>0,ht=_.clearcoat>0,lt=_.dispersion>0,D=_.retroreflectivity>0,w=_.iridescence>0,W=_.sheen>0,$=_.transmission>0,Q=F&&!!_.anisotropyMap,pe=ht&&!!_.clearcoatMap,xe=ht&&!!_.clearcoatNormalMap,te=ht&&!!_.clearcoatRoughnessMap,ie=w&&!!_.iridescenceMap,ye=w&&!!_.iridescenceThicknessMap,Ge=W&&!!_.sheenColorMap,Ae=W&&!!_.sheenRoughnessMap,ve=!!_.specularMap,He=!!_.specularColorMap,Ze=!!_.specularIntensityMap,nt=$&&!!_.transmissionMap,V=$&&!!_.thicknessMap,be=!!_.gradientMap,ne=!!_.alphaMap,Me=_.alphaTest>0,Ce=!!_.alphaHash,ce=!!_.extensions,We=Wn;_.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(We=i.toneMapping);let Be={shaderID:k,shaderType:_.type,shaderName:_.name,vertexShader:G,fragmentShader:le,defines:_.defines,customVertexShaderID:ge,customFragmentShaderID:X,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:me,batchingColor:me&&I._colorsTexture!==null,instancing:Re,instancingColor:Re&&I.instanceColor!==null,instancingMorph:Re&&I.morphTexture!==null,outputColorSpace:Y===null?i.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:at.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Ie,matcap:je,envMap:ee,envMapMode:ee&&j.mapping,envMapCubeUVHeight:q,aoMap:re,lightMap:se,bumpMap:ae,normalMap:fe,displacementMap:Pe,emissiveMap:Ue,normalMapObjectSpace:fe&&_.normalMapType===lp,normalMapTangentSpace:fe&&_.normalMapType===vi,packedNormalMap:fe&&_.normalMapType===vi&&K1(_.normalMap.format),metalnessMap:qe,roughnessMap:Ye,anisotropy:F,anisotropyMap:Q,clearcoat:ht,clearcoatMap:pe,clearcoatNormalMap:xe,clearcoatRoughnessMap:te,dispersion:lt,retroreflection:D,iridescence:w,iridescenceMap:ie,iridescenceThicknessMap:ye,sheen:W,sheenColorMap:Ge,sheenRoughnessMap:Ae,specularMap:ve,specularColorMap:He,specularIntensityMap:Ze,transmission:$,transmissionMap:nt,thicknessMap:V,gradientMap:be,opaque:_.transparent===!1&&_.blending===js&&_.alphaToCoverage===!1,alphaMap:ne,alphaTest:Me,alphaHash:Ce,combine:_.combine,mapUv:Ie&&p(_.map.channel),aoMapUv:re&&p(_.aoMap.channel),lightMapUv:se&&p(_.lightMap.channel),bumpMapUv:ae&&p(_.bumpMap.channel),normalMapUv:fe&&p(_.normalMap.channel),displacementMapUv:Pe&&p(_.displacementMap.channel),emissiveMapUv:Ue&&p(_.emissiveMap.channel),metalnessMapUv:qe&&p(_.metalnessMap.channel),roughnessMapUv:Ye&&p(_.roughnessMap.channel),anisotropyMapUv:Q&&p(_.anisotropyMap.channel),clearcoatMapUv:pe&&p(_.clearcoatMap.channel),clearcoatNormalMapUv:xe&&p(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&p(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ie&&p(_.iridescenceMap.channel),iridescenceThicknessMapUv:ye&&p(_.iridescenceThicknessMap.channel),sheenColorMapUv:Ge&&p(_.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&p(_.sheenRoughnessMap.channel),specularMapUv:ve&&p(_.specularMap.channel),specularColorMapUv:He&&p(_.specularColorMap.channel),specularIntensityMapUv:Ze&&p(_.specularIntensityMap.channel),transmissionMapUv:nt&&p(_.transmissionMap.channel),thicknessMapUv:V&&p(_.thicknessMap.channel),alphaMapUv:ne&&p(_.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(fe||F),vertexNormals:!!U.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!U.attributes.uv&&(Ie||ne),fog:!!C,useFog:_.fog===!0,fogExp2:!!C&&C.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||U.attributes.normal===void 0&&fe===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:he,skinning:I.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:ue,morphTextureStride:de,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:P.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:We,decodeVideoTexture:Ie&&_.map.isVideoTexture===!0&&at.getTransfer(_.map.colorSpace)===dt,decodeVideoTextureEmissive:Ue&&_.emissiveMap.isVideoTexture===!0&&at.getTransfer(_.emissiveMap.colorSpace)===dt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Nn,flipSided:_.side===un,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ce&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ce&&_.extensions.multiDraw===!0||me)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Be.vertexUv1s=l.has(1),Be.vertexUv2s=l.has(2),Be.vertexUv3s=l.has(3),l.clear(),Be}function m(_){let A=[];if(_.shaderID?A.push(_.shaderID):(A.push(_.customVertexShaderID),A.push(_.customFragmentShaderID)),_.defines!==void 0)for(let R in _.defines)A.push(R),A.push(_.defines[R]);return _.isRawShaderMaterial===!1&&(g(A,_),y(A,_),A.push(i.outputColorSpace)),A.push(_.customProgramCacheKey),A.join()}function g(_,A){_.push(A.precision),_.push(A.outputColorSpace),_.push(A.envMapMode),_.push(A.envMapCubeUVHeight),_.push(A.mapUv),_.push(A.alphaMapUv),_.push(A.lightMapUv),_.push(A.aoMapUv),_.push(A.bumpMapUv),_.push(A.normalMapUv),_.push(A.displacementMapUv),_.push(A.emissiveMapUv),_.push(A.metalnessMapUv),_.push(A.roughnessMapUv),_.push(A.anisotropyMapUv),_.push(A.clearcoatMapUv),_.push(A.clearcoatNormalMapUv),_.push(A.clearcoatRoughnessMapUv),_.push(A.iridescenceMapUv),_.push(A.iridescenceThicknessMapUv),_.push(A.sheenColorMapUv),_.push(A.sheenRoughnessMapUv),_.push(A.specularMapUv),_.push(A.specularColorMapUv),_.push(A.specularIntensityMapUv),_.push(A.transmissionMapUv),_.push(A.thicknessMapUv),_.push(A.combine),_.push(A.fogExp2),_.push(A.sizeAttenuation),_.push(A.morphTargetsCount),_.push(A.morphAttributeCount),_.push(A.numSunLights),_.push(A.numDirLights),_.push(A.numPointLights),_.push(A.numSpotLights),_.push(A.numSpotLightMaps),_.push(A.numHemiLights),_.push(A.numRectAreaLights),_.push(A.numSunLightShadows),_.push(A.numDirLightShadows),_.push(A.numPointLightShadows),_.push(A.numSpotLightShadows),_.push(A.numSpotLightShadowsWithMaps),_.push(A.numLightProbes),_.push(A.shadowMapType),_.push(A.toneMapping),_.push(A.numClippingPlanes),_.push(A.numClipIntersection),_.push(A.depthPacking)}function y(_,A){o.disableAll(),A.instancing&&o.enable(0),A.instancingColor&&o.enable(1),A.instancingMorph&&o.enable(2),A.matcap&&o.enable(3),A.envMap&&o.enable(4),A.normalMapObjectSpace&&o.enable(5),A.normalMapTangentSpace&&o.enable(6),A.clearcoat&&o.enable(7),A.iridescence&&o.enable(8),A.alphaTest&&o.enable(9),A.vertexColors&&o.enable(10),A.vertexAlphas&&o.enable(11),A.vertexUv1s&&o.enable(12),A.vertexUv2s&&o.enable(13),A.vertexUv3s&&o.enable(14),A.vertexTangents&&o.enable(15),A.anisotropy&&o.enable(16),A.alphaHash&&o.enable(17),A.batching&&o.enable(18),A.dispersion&&o.enable(19),A.retroreflection&&o.enable(24),A.batchingColor&&o.enable(20),A.gradientMap&&o.enable(21),A.packedNormalMap&&o.enable(22),A.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),A.fog&&o.enable(0),A.useFog&&o.enable(1),A.flatShading&&o.enable(2),A.logarithmicDepthBuffer&&o.enable(3),A.reversedDepthBuffer&&o.enable(4),A.skinning&&o.enable(5),A.morphTargets&&o.enable(6),A.morphNormals&&o.enable(7),A.morphColors&&o.enable(8),A.premultipliedAlpha&&o.enable(9),A.shadowMapEnabled&&o.enable(10),A.doubleSided&&o.enable(11),A.flipSided&&o.enable(12),A.useDepthPacking&&o.enable(13),A.dithering&&o.enable(14),A.transmission&&o.enable(15),A.sheen&&o.enable(16),A.opaque&&o.enable(17),A.pointsUvs&&o.enable(18),A.decodeVideoTexture&&o.enable(19),A.decodeVideoTextureEmissive&&o.enable(20),A.alphaToCoverage&&o.enable(21),A.numLightProbeGrids>0&&o.enable(22),A.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function S(_){let A=d[_.type],R;if(A){let L=li[A];R=vp.clone(L.uniforms)}else R=_.uniforms;return R}function v(_,A){let R=u.get(A);return R!==void 0?++R.usedTimes:(R=new J1(i,A,_,s),c.push(R),u.set(A,R)),R}function M(_){if(--_.usedTimes===0){let A=c.indexOf(_);c[A]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function b(_){a.remove(_)}function E(){a.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:S,acquireProgram:v,releaseProgram:M,releaseShaderCache:b,programs:c,dispose:E}}function Q1(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function ew(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function mx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function gx(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function a(h,d,p,x,m,g){let y=i[e];return y===void 0?(y={id:h.id,object:h,geometry:d,material:p,materialVariant:o(h),groupOrder:x,renderOrder:h.renderOrder,z:m,group:g},i[e]=y):(y.id=h.id,y.object=h,y.geometry=d,y.material=p,y.materialVariant=o(h),y.groupOrder=x,y.renderOrder=h.renderOrder,y.z=m,y.group=g),e++,y}function l(h,d,p,x,m,g,y){y.reversedDepth===!0&&(m=-m);let S=a(h,d,p,x,m,g);p.transmission>0?n.push(S):p.transparent===!0?s.push(S):t.push(S)}function c(h,d,p,x,m,g){let y=a(h,d,p,x,m,g);p.transmission>0?n.unshift(y):p.transparent===!0?s.unshift(y):t.unshift(y)}function u(h,d){t.length>1&&t.sort(h||ew),n.length>1&&n.sort(d||mx),s.length>1&&s.sort(d||mx)}function f(){for(let h=e,d=i.length;h<d;h++){let p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function tw(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new gx,i.set(n,[o])):s>=r.length?(o=new gx,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function nw(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new N,color:new Se};break;case"SpotLight":t={position:new N,direction:new N,color:new Se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new Se,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new Se,groundColor:new Se};break;case"RectAreaLight":t={color:new Se,position:new N,halfWidth:new N,halfHeight:new N};break}return i[e.id]=t,t}}}function iw(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var sw=0;function rw(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function ow(i){let e=new nw,t=iw(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let s=new N,r=new $e,o=new $e;function a(c){let u=0,f=0,h=0;for(let I=0;I<9;I++)n.probe[I].set(0,0,0);let d=0,p=0,x=0,m=0,g=0,y=0,S=0,v=0,M=0,b=0,E=0,_=0,A=0,R=0;c.sort(rw);for(let I=0,P=c.length;I<P;I++){let C=c[I],U=C.color,B=C.intensity,z=C.distance,j=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===Gi?j=C.shadow.map.texture:j=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)u+=U.r*B,f+=U.g*B,h+=U.b*B;else if(C.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(C.sh.coefficients[q],B);R++}else if(C.isSunLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let k=C.shadow,H=t.get(C);H.shadowIntensity=k.intensity,H.shadowBias=k.bias,H.shadowNormalBias=k.normalBias,H.shadowRadius=k.radius,H.shadowMapSize.copy(k.mapSize).multiply(k.getFrameExtents()),n.sunShadow[p]=H,n.sunShadowMap[p]=j;let ue=k.getViewportCount();for(let de=0;de<ue;de++)n.sunShadowMatrix[x+de]=k.getMatrix(de),n.sunShadowCascade[x+de]=k._cascadeData[de];x+=ue,p++}n.sun[d]=q,d++}else if(C.isDirectionalLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let k=C.shadow,H=t.get(C);H.shadowIntensity=k.intensity,H.shadowBias=k.bias,H.shadowNormalBias=k.normalBias,H.shadowRadius=k.radius,H.shadowMapSize=k.mapSize,n.directionalShadow[m]=H,n.directionalShadowMap[m]=j,n.directionalShadowMatrix[m]=C.shadow.matrix,M++}n.directional[m]=q,m++}else if(C.isSpotLight){let q=e.get(C);q.position.setFromMatrixPosition(C.matrixWorld),q.color.copy(U).multiplyScalar(B),q.distance=z,q.coneCos=Math.cos(C.angle),q.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),q.decay=C.decay,n.spot[y]=q;let k=C.shadow;if(C.map&&(n.spotLightMap[_]=C.map,_++,k.updateMatrices(C),C.castShadow&&A++),n.spotLightMatrix[y]=k.matrix,C.castShadow){let H=t.get(C);H.shadowIntensity=k.intensity,H.shadowBias=k.bias,H.shadowNormalBias=k.normalBias,H.shadowRadius=k.radius,H.shadowMapSize=k.mapSize,n.spotShadow[y]=H,n.spotShadowMap[y]=j,E++}y++}else if(C.isRectAreaLight){let q=e.get(C);q.color.copy(U).multiplyScalar(B),q.halfWidth.set(C.width*.5,0,0),q.halfHeight.set(0,C.height*.5,0),n.rectArea[S]=q,S++}else if(C.isPointLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),q.distance=C.distance,q.decay=C.decay,C.castShadow){let k=C.shadow,H=t.get(C);H.shadowIntensity=k.intensity,H.shadowBias=k.bias,H.shadowNormalBias=k.normalBias,H.shadowRadius=k.radius,H.shadowMapSize=k.mapSize,H.shadowCameraNear=k.camera.near,H.shadowCameraFar=k.camera.far,n.pointShadow[g]=H,n.pointShadowMap[g]=j,n.pointShadowMatrix[g]=C.shadow.matrix,b++}n.point[g]=q,g++}else if(C.isHemisphereLight){let q=e.get(C);q.skyColor.copy(C.color).multiplyScalar(B),q.groundColor.copy(C.groundColor).multiplyScalar(B),n.hemi[v]=q,v++}}S>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=we.LTC_FLOAT_1,n.rectAreaLTC2=we.LTC_FLOAT_2):(n.rectAreaLTC1=we.LTC_HALF_1,n.rectAreaLTC2=we.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;let L=n.hash;(L.sunLength!==d||L.directionalLength!==m||L.pointLength!==g||L.spotLength!==y||L.rectAreaLength!==S||L.hemiLength!==v||L.numSunShadows!==p||L.numDirectionalShadows!==M||L.numPointShadows!==b||L.numSpotShadows!==E||L.numSpotMaps!==_||L.numLightProbes!==R)&&(n.sun.length=d,n.directional.length=m,n.spot.length=y,n.rectArea.length=S,n.point.length=g,n.hemi.length=v,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.directionalShadowMatrix.length=M,n.pointShadow.length=b,n.pointShadowMap.length=b,n.pointShadowMatrix.length=b,n.spotShadow.length=E,n.spotShadowMap.length=E,n.spotLightMatrix.length=E+_-A,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=R,L.sunLength=d,L.directionalLength=m,L.pointLength=g,L.spotLength=y,L.rectAreaLength=S,L.hemiLength=v,L.numSunShadows=p,L.numDirectionalShadows=M,L.numPointShadows=b,L.numSpotShadows=E,L.numSpotMaps=_,L.numLightProbes=R,n.version=sw++)}function l(c,u){let f=0,h=0,d=0,p=0,x=0,m=0,g=u.matrixWorldInverse;for(let y=0,S=c.length;y<S;y++){let v=c[y];if(v.isSunLight){let M=n.sun[f];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(g),f++}else if(v.isDirectionalLight){let M=n.directional[h];M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(g),h++}else if(v.isSpotLight){let M=n.spot[p];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(g),M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(g),p++}else if(v.isRectAreaLight){let M=n.rectArea[x];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(g),o.identity(),r.copy(v.matrixWorld),r.premultiply(g),o.extractRotation(r),M.halfWidth.set(v.width*.5,0,0),M.halfHeight.set(0,v.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),x++}else if(v.isPointLight){let M=n.point[d];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(g),d++}else if(v.isHemisphereLight){let M=n.hemi[m];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(g),m++}}}return{setup:a,setupView:l,state:n}}function xx(i){let e=new ow(i),t=[],n=[],s=[];function r(h){f.camera=h,t.length=0,n.length=0,s.length=0}function o(h){t.push(h)}function a(h){n.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}let f={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:c,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function aw(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new xx(i),e.set(s,[a])):r>=o.length?(a=new xx(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var lw=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,cw=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,uw=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],hw=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],_x=new $e,gc=new N,Np=new N;function fw(i,e,t){let n=new xi,s=new oe,r=new oe,o=new _t,a=new ao,l=new lo,c={},u=t.maxTextureSize,f={[ki]:un,[un]:ki,[Nn]:Nn},h=new yn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new oe},radius:{value:4}},vertexShader:lw,fragmentShader:cw}),d=h.clone();d.defines.HORIZONTAL_PASS=1;let p=new Ke;p.setAttribute("position",new tt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Tt(p,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=xo;let g=this.type;this.render=function(b,E,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===Fd&&(_e("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=xo);let A=i.getRenderTarget(),R=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),I=i.state;I.setBlending(ri),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);let P=g!==this.type;P&&E.traverse(function(C){C.material&&(Array.isArray(C.material)?C.material.forEach(U=>U.needsUpdate=!0):C.material.needsUpdate=!0)});for(let C=0,U=b.length;C<U;C++){let B=b[C],z=B.shadow;if(z===void 0){_e("WebGLShadowMap:",B,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let j=z.getFrameExtents();s.multiply(j),r.copy(z.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/j.x),s.x=r.x*j.x,z.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/j.y),s.y=r.y*j.y,z.mapSize.y=r.y));let q=i.state.buffers.depth.getReversed();if(z.camera._reversedDepth=q,z.map===null||P===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Ks){if(B.isPointLight){_e("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new Qt(s.x,s.y,{format:Gi,type:Xn,minFilter:wt,magFilter:wt,generateMipmaps:!1}),z.map.texture.name=B.name+".shadowMap",z.map.depthTexture=new Fi(s.x,s.y,ln),z.map.depthTexture.name=B.name+".shadowMapDepth",z.map.depthTexture.format=ni,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ct,z.map.depthTexture.magFilter=Ct}else B.isPointLight?(z.map=new yc(s.x),z.map.depthTexture=new Ia(s.x,Un)):(z.map=new Qt(s.x,s.y),z.map.depthTexture=new Fi(s.x,s.y,Un)),z.map.depthTexture.name=B.name+".shadowMap",z.map.depthTexture.format=ni,this.type===xo?(z.map.depthTexture.compareFunction=q?dc:fc,z.map.depthTexture.minFilter=wt,z.map.depthTexture.magFilter=wt):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ct,z.map.depthTexture.magFilter=Ct);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);let k=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();B.isPointLight!==!0&&z.updateMatrices(B,_);for(let H=0;H<k;H++){let ue=z.getCamera(H);if(B.isPointLight){let de=z.camera,G=z.matrix,le=B.distance||de.far;le!==de.far&&(de.far=le,de.updateProjectionMatrix()),gc.setFromMatrixPosition(B.matrixWorld),de.position.copy(gc),Np.copy(de.position),Np.add(uw[H]),de.up.copy(hw[H]),de.lookAt(Np),de.updateMatrixWorld(),G.makeTranslation(-gc.x,-gc.y,-gc.z),_x.multiplyMatrices(de.projectionMatrix,de.matrixWorldInverse),z._frustum.setFromProjectionMatrix(_x,de.coordinateSystem,de.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)i.setRenderTarget(z.map,H),i.clear();else{H===0&&(i.setRenderTarget(z.map),i.clear());let de=z.getViewport(H);o.set(r.x*de.x,r.y*de.y,r.x*de.z,r.y*de.w),I.viewport(o)}n=z.getFrustum(H),v(E,_,ue,B,this.type)}z.isPointLightShadow!==!0&&this.type===Ks&&y(z,_),z.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(A,R,L)};function y(b,E){let _=e.update(x);h.defines.VSM_SAMPLES!==b.blurSamples&&(h.defines.VSM_SAMPLES=b.blurSamples,d.defines.VSM_SAMPLES=b.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),b.mapPass===null?b.mapPass=new Qt(s.x,s.y,{format:Gi,type:Xn}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),h.uniforms.shadow_pass.value=b.map.depthTexture,h.uniforms.resolution.value.set(b.map.width,b.map.height),h.uniforms.radius.value=b.radius,i.setRenderTarget(b.mapPass),i.clear(),i.renderBufferDirect(E,null,_,h,x,null),d.uniforms.shadow_pass.value=b.mapPass.texture,d.uniforms.resolution.value.set(b.map.width,b.map.height),d.uniforms.radius.value=b.radius,i.setRenderTarget(b.map),i.clear(),i.renderBufferDirect(E,null,_,d,x,null)}function S(b,E,_,A){let R=null,L=_.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(L!==void 0)R=L;else if(R=_.isPointLight===!0?l:a,i.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let I=R.uuid,P=E.uuid,C=c[I];C===void 0&&(C={},c[I]=C);let U=C[P];U===void 0&&(U=R.clone(),C[P]=U,E.addEventListener("dispose",M)),R=U}if(R.visible=E.visible,R.wireframe=E.wireframe,A===Ks?R.side=E.shadowSide!==null?E.shadowSide:E.side:R.side=E.shadowSide!==null?E.shadowSide:f[E.side],R.alphaMap=E.alphaMap,R.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,R.map=E.map,R.clipShadows=E.clipShadows,R.clippingPlanes=E.clippingPlanes,R.clipIntersection=E.clipIntersection,R.displacementMap=E.displacementMap,R.displacementScale=E.displacementScale,R.displacementBias=E.displacementBias,R.wireframeLinewidth=E.wireframeLinewidth,R.linewidth=E.linewidth,_.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let I=i.properties.get(R);I.light=_}return R}function v(b,E,_,A,R){if(b.visible===!1)return;if(b.layers.test(E.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&R===Ks)&&(!b.frustumCulled||b.intersectsFrustum(n))){b.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,b.matrixWorld);let P=e.update(b),C=b.material;if(Array.isArray(C)){let U=P.groups;for(let B=0,z=U.length;B<z;B++){let j=U[B],q=C[j.materialIndex];if(q&&q.visible){let k=S(b,q,A,R);b.onBeforeShadow(i,b,E,_,P,k,j),i.renderBufferDirect(_,null,P,k,b,j),b.onAfterShadow(i,b,E,_,P,k,j)}}}else if(C.visible){let U=S(b,C,A,R);b.onBeforeShadow(i,b,E,_,P,U,null),i.renderBufferDirect(_,null,P,U,b,null),b.onAfterShadow(i,b,E,_,P,U,null)}}let I=b.children;for(let P=0,C=I.length;P<C;P++)v(I[P],E,_,A,R)}function M(b){b.target.removeEventListener("dispose",M);for(let _ in c){let A=c[_],R=b.target.uuid;R in A&&(A[R].dispose(),delete A[R])}}}function dw(i,e){function t(){let V=!1,be=new _t,ne=null,Me=new _t(0,0,0,0);return{setMask:function(Ce){ne!==Ce&&!V&&(i.colorMask(Ce,Ce,Ce,Ce),ne=Ce)},setLocked:function(Ce){V=Ce},setClear:function(Ce,ce,We,Be,Mt){Mt===!0&&(Ce*=Be,ce*=Be,We*=Be),be.set(Ce,ce,We,Be),Me.equals(be)===!1&&(i.clearColor(Ce,ce,We,Be),Me.copy(be))},reset:function(){V=!1,ne=null,Me.set(-1,0,0,0)}}}function n(){let V=!1,be=!1,ne=null,Me=null,Ce=null;return{setReversed:function(ce){if(be!==ce){let We=e.get("EXT_clip_control");ce?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT),be=ce;let Be=Ce;Ce=null,this.setClear(Be)}},getReversed:function(){return be},setTest:function(ce){ce?Y(i.DEPTH_TEST):he(i.DEPTH_TEST)},setMask:function(ce){ne!==ce&&!V&&(i.depthMask(ce),ne=ce)},setFunc:function(ce){if(be&&(ce=Vg[ce]),Me!==ce){switch(ce){case la:i.depthFunc(i.NEVER);break;case ca:i.depthFunc(i.ALWAYS);break;case ua:i.depthFunc(i.LESS);break;case Fs:i.depthFunc(i.LEQUAL);break;case ha:i.depthFunc(i.EQUAL);break;case fa:i.depthFunc(i.GEQUAL);break;case da:i.depthFunc(i.GREATER);break;case pa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Me=ce}},setLocked:function(ce){V=ce},setClear:function(ce){Ce!==ce&&(Ce=ce,be&&(ce=1-ce),i.clearDepth(ce))},reset:function(){V=!1,ne=null,Me=null,Ce=null,be=!1}}}function s(){let V=!1,be=null,ne=null,Me=null,Ce=null,ce=null,We=null,Be=null,Mt=null;return{setTest:function(mt){V||(mt?Y(i.STENCIL_TEST):he(i.STENCIL_TEST))},setMask:function(mt){be!==mt&&!V&&(i.stencilMask(mt),be=mt)},setFunc:function(mt,Zn,di){(ne!==mt||Me!==Zn||Ce!==di)&&(i.stencilFunc(mt,Zn,di),ne=mt,Me=Zn,Ce=di)},setOp:function(mt,Zn,di){(ce!==mt||We!==Zn||Be!==di)&&(i.stencilOp(mt,Zn,di),ce=mt,We=Zn,Be=di)},setLocked:function(mt){V=mt},setClear:function(mt){Mt!==mt&&(i.clearStencil(mt),Mt=mt)},reset:function(){V=!1,be=null,ne=null,Me=null,Ce=null,ce=null,We=null,Be=null,Mt=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,u={},f={},h={},d=new WeakMap,p=[],x=null,m=!1,g=null,y=null,S=null,v=null,M=null,b=null,E=null,_=new Se(0,0,0),A=0,R=!1,L=null,I=null,P=null,C=null,U=null,B=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,j=0,q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(q)[1]),z=j>=1):q.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),z=j>=2);let k=null,H={},ue=i.getParameter(i.SCISSOR_BOX),de=i.getParameter(i.VIEWPORT),G=new _t().fromArray(ue),le=new _t().fromArray(de);function ge(V,be,ne,Me){let Ce=new Uint8Array(4),ce=i.createTexture();i.bindTexture(V,ce),i.texParameteri(V,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(V,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let We=0;We<ne;We++)V===i.TEXTURE_3D||V===i.TEXTURE_2D_ARRAY?i.texImage3D(be,0,i.RGBA,1,1,Me,0,i.RGBA,i.UNSIGNED_BYTE,Ce):i.texImage2D(be+We,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ce);return ce}let X={};X[i.TEXTURE_2D]=ge(i.TEXTURE_2D,i.TEXTURE_2D,1),X[i.TEXTURE_CUBE_MAP]=ge(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[i.TEXTURE_2D_ARRAY]=ge(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),X[i.TEXTURE_3D]=ge(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Y(i.DEPTH_TEST),o.setFunc(Fs),ae(!1),fe(Vh),Y(i.CULL_FACE),re(ri);function Y(V){u[V]!==!0&&(i.enable(V),u[V]=!0)}function he(V){u[V]!==!1&&(i.disable(V),u[V]=!1)}function Re(V,be){return h[V]!==be?(i.bindFramebuffer(V,be),h[V]=be,V===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=be),V===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=be),!0):!1}function me(V,be){let ne=p,Me=!1;if(V){ne=d.get(be),ne===void 0&&(ne=[],d.set(be,ne));let Ce=V.textures;if(ne.length!==Ce.length||ne[0]!==i.COLOR_ATTACHMENT0){for(let ce=0,We=Ce.length;ce<We;ce++)ne[ce]=i.COLOR_ATTACHMENT0+ce;ne.length=Ce.length,Me=!0}}else ne[0]!==i.BACK&&(ne[0]=i.BACK,Me=!0);Me&&i.drawBuffers(ne)}function Ie(V){return x!==V?(i.useProgram(V),x=V,!0):!1}let je={[ps]:i.FUNC_ADD,[Bd]:i.FUNC_SUBTRACT,[kd]:i.FUNC_REVERSE_SUBTRACT};je[Vd]=i.MIN,je[zd]=i.MAX;let ee={[Gd]:i.ZERO,[Hd]:i.ONE,[Wd]:i.SRC_COLOR,[Wh]:i.SRC_ALPHA,[$d]:i.SRC_ALPHA_SATURATE,[Zd]:i.DST_COLOR,[qd]:i.DST_ALPHA,[Xd]:i.ONE_MINUS_SRC_COLOR,[Xh]:i.ONE_MINUS_SRC_ALPHA,[Jd]:i.ONE_MINUS_DST_COLOR,[Yd]:i.ONE_MINUS_DST_ALPHA,[Kd]:i.CONSTANT_COLOR,[jd]:i.ONE_MINUS_CONSTANT_COLOR,[Qd]:i.CONSTANT_ALPHA,[ep]:i.ONE_MINUS_CONSTANT_ALPHA};function re(V,be,ne,Me,Ce,ce,We,Be,Mt,mt){if(V===ri){m===!0&&(he(i.BLEND),m=!1);return}if(m===!1&&(Y(i.BLEND),m=!0),V!==Od){if(V!==g||mt!==R){if((y!==ps||M!==ps)&&(i.blendEquation(i.FUNC_ADD),y=ps,M=ps),mt)switch(V){case js:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case zh:i.blendFunc(i.ONE,i.ONE);break;case Gh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Hh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ke("WebGLState: Invalid blending: ",V);break}else switch(V){case js:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case zh:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Gh:ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Hh:ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ke("WebGLState: Invalid blending: ",V);break}S=null,v=null,b=null,E=null,_.set(0,0,0),A=0,g=V,R=mt}return}Ce=Ce||be,ce=ce||ne,We=We||Me,(be!==y||Ce!==M)&&(i.blendEquationSeparate(je[be],je[Ce]),y=be,M=Ce),(ne!==S||Me!==v||ce!==b||We!==E)&&(i.blendFuncSeparate(ee[ne],ee[Me],ee[ce],ee[We]),S=ne,v=Me,b=ce,E=We),(Be.equals(_)===!1||Mt!==A)&&(i.blendColor(Be.r,Be.g,Be.b,Mt),_.copy(Be),A=Mt),g=V,R=!1}function se(V,be){V.side===Nn?he(i.CULL_FACE):Y(i.CULL_FACE);let ne=V.side===un;be&&(ne=!ne),ae(ne),V.blending===js&&V.transparent===!1?re(ri):re(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),o.setFunc(V.depthFunc),o.setTest(V.depthTest),o.setMask(V.depthWrite),r.setMask(V.colorWrite);let Me=V.stencilWrite;a.setTest(Me),Me&&(a.setMask(V.stencilWriteMask),a.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),a.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),Ue(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?Y(i.SAMPLE_ALPHA_TO_COVERAGE):he(i.SAMPLE_ALPHA_TO_COVERAGE)}function ae(V){L!==V&&(V?i.frontFace(i.CW):i.frontFace(i.CCW),L=V)}function fe(V){V!==Nd?(Y(i.CULL_FACE),V!==I&&(V===Vh?i.cullFace(i.BACK):V===Ud?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):he(i.CULL_FACE),I=V}function Pe(V){V!==P&&(z&&i.lineWidth(V),P=V)}function Ue(V,be,ne){V?(Y(i.POLYGON_OFFSET_FILL),(C!==be||U!==ne)&&(C=be,U=ne,o.getReversed()&&(be=-be),i.polygonOffset(be,ne))):he(i.POLYGON_OFFSET_FILL)}function qe(V){V?Y(i.SCISSOR_TEST):he(i.SCISSOR_TEST)}function Ye(V){V===void 0&&(V=i.TEXTURE0+B-1),k!==V&&(i.activeTexture(V),k=V)}function F(V,be,ne){ne===void 0&&(k===null?ne=i.TEXTURE0+B-1:ne=k);let Me=H[ne];Me===void 0&&(Me={type:void 0,texture:void 0},H[ne]=Me),(Me.type!==V||Me.texture!==be)&&(k!==ne&&(i.activeTexture(ne),k=ne),i.bindTexture(V,be||X[V]),Me.type=V,Me.texture=be)}function ht(){let V=H[k];V!==void 0&&V.type!==void 0&&(i.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function lt(){try{i.compressedTexImage2D(...arguments)}catch(V){ke("WebGLState:",V)}}function D(){try{i.compressedTexImage3D(...arguments)}catch(V){ke("WebGLState:",V)}}function w(){try{i.texSubImage2D(...arguments)}catch(V){ke("WebGLState:",V)}}function W(){try{i.texSubImage3D(...arguments)}catch(V){ke("WebGLState:",V)}}function $(){try{i.compressedTexSubImage2D(...arguments)}catch(V){ke("WebGLState:",V)}}function Q(){try{i.compressedTexSubImage3D(...arguments)}catch(V){ke("WebGLState:",V)}}function pe(){try{i.texStorage2D(...arguments)}catch(V){ke("WebGLState:",V)}}function xe(){try{i.texStorage3D(...arguments)}catch(V){ke("WebGLState:",V)}}function te(){try{i.texImage2D(...arguments)}catch(V){ke("WebGLState:",V)}}function ie(){try{i.texImage3D(...arguments)}catch(V){ke("WebGLState:",V)}}function ye(V){return f[V]!==void 0?f[V]:i.getParameter(V)}function Ge(V,be){f[V]!==be&&(i.pixelStorei(V,be),f[V]=be)}function Ae(V){G.equals(V)===!1&&(i.scissor(V.x,V.y,V.z,V.w),G.copy(V))}function ve(V){le.equals(V)===!1&&(i.viewport(V.x,V.y,V.z,V.w),le.copy(V))}function He(V,be){let ne=c.get(be);ne===void 0&&(ne=new WeakMap,c.set(be,ne));let Me=ne.get(V);Me===void 0&&(Me=i.getUniformBlockIndex(be,V.name),ne.set(V,Me))}function Ze(V,be){let Me=c.get(be).get(V);l.get(be)!==Me&&(i.uniformBlockBinding(be,Me,V.__bindingPointIndex),l.set(be,Me))}function nt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},k=null,H={},h={},d=new WeakMap,p=[],x=null,m=!1,g=null,y=null,S=null,v=null,M=null,b=null,E=null,_=new Se(0,0,0),A=0,R=!1,L=null,I=null,P=null,C=null,U=null,G.set(0,0,i.canvas.width,i.canvas.height),le.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Y,disable:he,bindFramebuffer:Re,drawBuffers:me,useProgram:Ie,setBlending:re,setMaterial:se,setFlipSided:ae,setCullFace:fe,setLineWidth:Pe,setPolygonOffset:Ue,setScissorTest:qe,activeTexture:Ye,bindTexture:F,unbindTexture:ht,compressedTexImage2D:lt,compressedTexImage3D:D,texImage2D:te,texImage3D:ie,pixelStorei:Ge,getParameter:ye,updateUBOMapping:He,uniformBlockBinding:Ze,texStorage2D:pe,texStorage3D:xe,texSubImage2D:w,texSubImage3D:W,compressedTexSubImage2D:$,compressedTexSubImage3D:Q,scissor:Ae,viewport:ve,reset:nt}}function pw(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new oe,u=new WeakMap,f=new Set,h,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(D,w){return p?new OffscreenCanvas(D,w):Vr("canvas")}function m(D,w,W){let $=1,Q=lt(D);if((Q.width>W||Q.height>W)&&($=W/Math.max(Q.width,Q.height)),$<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){let pe=Math.floor($*Q.width),xe=Math.floor($*Q.height);h===void 0&&(h=x(pe,xe));let te=w?x(pe,xe):h;return te.width=pe,te.height=xe,te.getContext("2d").drawImage(D,0,0,pe,xe),_e("WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+pe+"x"+xe+")."),te}else return"data"in D&&_e("WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),D;return D}function g(D){return D.generateMipmaps}function y(D){i.generateMipmap(D)}function S(D){return D.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?i.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(D,w,W,$,Q,pe=!1){if(D!==null){if(i[D]!==void 0)return i[D];_e("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let xe;$&&(xe=e.get("EXT_texture_norm16"),xe||_e("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let te=w;if(w===i.RED&&(W===i.FLOAT&&(te=i.R32F),W===i.HALF_FLOAT&&(te=i.R16F),W===i.UNSIGNED_BYTE&&(te=i.R8),W===i.UNSIGNED_SHORT&&xe&&(te=xe.R16_EXT),W===i.SHORT&&xe&&(te=xe.R16_SNORM_EXT)),w===i.RED_INTEGER&&(W===i.UNSIGNED_BYTE&&(te=i.R8UI),W===i.UNSIGNED_SHORT&&(te=i.R16UI),W===i.UNSIGNED_INT&&(te=i.R32UI),W===i.BYTE&&(te=i.R8I),W===i.SHORT&&(te=i.R16I),W===i.INT&&(te=i.R32I)),w===i.RG&&(W===i.FLOAT&&(te=i.RG32F),W===i.HALF_FLOAT&&(te=i.RG16F),W===i.UNSIGNED_BYTE&&(te=i.RG8),W===i.UNSIGNED_SHORT&&xe&&(te=xe.RG16_EXT),W===i.SHORT&&xe&&(te=xe.RG16_SNORM_EXT)),w===i.RG_INTEGER&&(W===i.UNSIGNED_BYTE&&(te=i.RG8UI),W===i.UNSIGNED_SHORT&&(te=i.RG16UI),W===i.UNSIGNED_INT&&(te=i.RG32UI),W===i.BYTE&&(te=i.RG8I),W===i.SHORT&&(te=i.RG16I),W===i.INT&&(te=i.RG32I)),w===i.RGB_INTEGER&&(W===i.UNSIGNED_BYTE&&(te=i.RGB8UI),W===i.UNSIGNED_SHORT&&(te=i.RGB16UI),W===i.UNSIGNED_INT&&(te=i.RGB32UI),W===i.BYTE&&(te=i.RGB8I),W===i.SHORT&&(te=i.RGB16I),W===i.INT&&(te=i.RGB32I)),w===i.RGBA_INTEGER&&(W===i.UNSIGNED_BYTE&&(te=i.RGBA8UI),W===i.UNSIGNED_SHORT&&(te=i.RGBA16UI),W===i.UNSIGNED_INT&&(te=i.RGBA32UI),W===i.BYTE&&(te=i.RGBA8I),W===i.SHORT&&(te=i.RGBA16I),W===i.INT&&(te=i.RGBA32I)),w===i.RGB&&(W===i.UNSIGNED_SHORT&&xe&&(te=xe.RGB16_EXT),W===i.SHORT&&xe&&(te=xe.RGB16_SNORM_EXT),W===i.UNSIGNED_INT_5_9_9_9_REV&&(te=i.RGB9_E5),W===i.UNSIGNED_INT_10F_11F_11F_REV&&(te=i.R11F_G11F_B10F)),w===i.RGBA){let ie=pe?kr:at.getTransfer(Q);W===i.FLOAT&&(te=i.RGBA32F),W===i.HALF_FLOAT&&(te=i.RGBA16F),W===i.UNSIGNED_BYTE&&(te=ie===dt?i.SRGB8_ALPHA8:i.RGBA8),W===i.UNSIGNED_SHORT&&xe&&(te=xe.RGBA16_EXT),W===i.SHORT&&xe&&(te=xe.RGBA16_SNORM_EXT),W===i.UNSIGNED_SHORT_4_4_4_4&&(te=i.RGBA4),W===i.UNSIGNED_SHORT_5_5_5_1&&(te=i.RGB5_A1)}return(te===i.R16F||te===i.R32F||te===i.RG16F||te===i.RG32F||te===i.RGBA16F||te===i.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function M(D,w){let W;return D?w===null||w===Un||w===nr?W=i.DEPTH24_STENCIL8:w===ln?W=i.DEPTH32F_STENCIL8:w===tr&&(W=i.DEPTH24_STENCIL8,_e("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===Un||w===nr?W=i.DEPTH_COMPONENT24:w===ln?W=i.DEPTH_COMPONENT32F:w===tr&&(W=i.DEPTH_COMPONENT16),W}function b(D,w){return g(D)===!0||D.isFramebufferTexture&&D.minFilter!==Ct&&D.minFilter!==wt?Math.log2(Math.max(w.width,w.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?w.mipmaps.length:1}function E(D){let w=D.target;w.removeEventListener("dispose",E),A(w),w.isVideoTexture&&u.delete(w),w.isHTMLTexture&&f.delete(w)}function _(D){let w=D.target;w.removeEventListener("dispose",_),L(w)}function A(D){let w=n.get(D);if(w.__webglInit===void 0)return;let W=D.source,$=d.get(W);if($){let Q=$[w.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&R(D),Object.keys($).length===0&&d.delete(W)}n.remove(D)}function R(D){let w=n.get(D);i.deleteTexture(w.__webglTexture);let W=D.source,$=d.get(W);delete $[w.__cacheKey],o.memory.textures--}function L(D){let w=n.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),n.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(w.__webglFramebuffer[$]))for(let Q=0;Q<w.__webglFramebuffer[$].length;Q++)i.deleteFramebuffer(w.__webglFramebuffer[$][Q]);else i.deleteFramebuffer(w.__webglFramebuffer[$]);w.__webglDepthbuffer&&i.deleteRenderbuffer(w.__webglDepthbuffer[$])}else{if(Array.isArray(w.__webglFramebuffer))for(let $=0;$<w.__webglFramebuffer.length;$++)i.deleteFramebuffer(w.__webglFramebuffer[$]);else i.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&i.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&i.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let $=0;$<w.__webglColorRenderbuffer.length;$++)w.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(w.__webglColorRenderbuffer[$]);w.__webglDepthRenderbuffer&&i.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let W=D.textures;for(let $=0,Q=W.length;$<Q;$++){let pe=n.get(W[$]);pe.__webglTexture&&(i.deleteTexture(pe.__webglTexture),o.memory.textures--),n.remove(W[$])}n.remove(D)}let I=0;function P(){I=0}function C(){return I}function U(D){I=D}function B(){let D=I;return D>=s.maxTextures&&_e("WebGLTextures: Trying to use "+(D+1)+" texture units while this GPU supports only "+s.maxTextures),I+=1,D}function z(D){let w=[];return w.push(D.wrapS),w.push(D.wrapT),w.push(D.wrapR||0),w.push(D.magFilter),w.push(D.minFilter),w.push(D.anisotropy),w.push(D.internalFormat),w.push(D.format),w.push(D.type),w.push(D.generateMipmaps),w.push(D.premultiplyAlpha),w.push(D.flipY),w.push(D.unpackAlignment),w.push(D.colorSpace),w.join()}function j(D,w){let W=n.get(D);if(D.isVideoTexture&&F(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&W.__version!==D.version){let $=D.image;if($===null)_e("WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)_e("WebGLRenderer: Texture marked for update but image is incomplete");else{he(W,D,w);return}}else D.isExternalTexture&&(W.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,W.__webglTexture,i.TEXTURE0+w)}function q(D,w){let W=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&W.__version!==D.version){he(W,D,w);return}else D.isExternalTexture&&(W.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,W.__webglTexture,i.TEXTURE0+w)}function k(D,w){let W=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&W.__version!==D.version){he(W,D,w);return}t.bindTexture(i.TEXTURE_3D,W.__webglTexture,i.TEXTURE0+w)}function H(D,w){let W=n.get(D);if(D.isCubeDepthTexture!==!0&&D.version>0&&W.__version!==D.version){Re(W,D,w);return}t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture,i.TEXTURE0+w)}let ue={[Nr]:i.REPEAT,[xn]:i.CLAMP_TO_EDGE,[Ur]:i.MIRRORED_REPEAT},de={[Ct]:i.NEAREST,[Qh]:i.NEAREST_MIPMAP_NEAREST,[er]:i.NEAREST_MIPMAP_LINEAR,[wt]:i.LINEAR,[bo]:i.LINEAR_MIPMAP_NEAREST,[ai]:i.LINEAR_MIPMAP_LINEAR},G={[up]:i.NEVER,[mp]:i.ALWAYS,[hp]:i.LESS,[fc]:i.LEQUAL,[fp]:i.EQUAL,[dc]:i.GEQUAL,[dp]:i.GREATER,[pp]:i.NOTEQUAL};function le(D,w){if(w.type===ln&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===wt||w.magFilter===bo||w.magFilter===er||w.magFilter===ai||w.minFilter===wt||w.minFilter===bo||w.minFilter===er||w.minFilter===ai)&&_e("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(D,i.TEXTURE_WRAP_S,ue[w.wrapS]),i.texParameteri(D,i.TEXTURE_WRAP_T,ue[w.wrapT]),(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)&&i.texParameteri(D,i.TEXTURE_WRAP_R,ue[w.wrapR]),i.texParameteri(D,i.TEXTURE_MAG_FILTER,de[w.magFilter]),i.texParameteri(D,i.TEXTURE_MIN_FILTER,de[w.minFilter]),w.compareFunction&&(i.texParameteri(D,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(D,i.TEXTURE_COMPARE_FUNC,G[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===Ct||w.minFilter!==er&&w.minFilter!==ai||w.type===ln&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){let W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(D,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,s.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function ge(D,w){let W=!1;D.__webglInit===void 0&&(D.__webglInit=!0,w.addEventListener("dispose",E));let $=w.source,Q=d.get($);Q===void 0&&(Q={},d.set($,Q));let pe=z(w);if(pe!==D.__cacheKey){Q[pe]===void 0&&(Q[pe]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,W=!0),Q[pe].usedTimes++;let xe=Q[D.__cacheKey];xe!==void 0&&(Q[D.__cacheKey].usedTimes--,xe.usedTimes===0&&R(w)),D.__cacheKey=pe,D.__webglTexture=Q[pe].texture}return W}function X(D,w,W){return Math.floor(Math.floor(D/W)/w)}function Y(D,w,W,$){let pe=D.updateRanges;if(pe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,w.width,w.height,W,$,w.data);else{pe.sort((Ge,Ae)=>Ge.start-Ae.start);let xe=0;for(let Ge=1;Ge<pe.length;Ge++){let Ae=pe[xe],ve=pe[Ge],He=Ae.start+Ae.count,Ze=X(ve.start,w.width,4),nt=X(Ae.start,w.width,4);ve.start<=He+1&&Ze===nt&&X(ve.start+ve.count-1,w.width,4)===Ze?Ae.count=Math.max(Ae.count,ve.start+ve.count-Ae.start):(++xe,pe[xe]=ve)}pe.length=xe+1;let te=t.getParameter(i.UNPACK_ROW_LENGTH),ie=t.getParameter(i.UNPACK_SKIP_PIXELS),ye=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,w.width);for(let Ge=0,Ae=pe.length;Ge<Ae;Ge++){let ve=pe[Ge],He=Math.floor(ve.start/4),Ze=Math.ceil(ve.count/4),nt=He%w.width,V=Math.floor(He/w.width),be=Ze,ne=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,nt),t.pixelStorei(i.UNPACK_SKIP_ROWS,V),t.texSubImage2D(i.TEXTURE_2D,0,nt,V,be,ne,W,$,w.data)}D.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,te),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ie),t.pixelStorei(i.UNPACK_SKIP_ROWS,ye)}}function he(D,w,W){let $=i.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),w.isData3DTexture&&($=i.TEXTURE_3D);let Q=ge(D,w),pe=w.source;t.bindTexture($,D.__webglTexture,i.TEXTURE0+W);let xe=n.get(pe);if(pe.version!==xe.__version||Q===!0){if(t.activeTexture(i.TEXTURE0+W),(typeof ImageBitmap<"u"&&w.image instanceof ImageBitmap)===!1){let ne=at.getPrimaries(at.workingColorSpace),Me=w.colorSpace===bi?null:at.getPrimaries(w.colorSpace),Ce=w.colorSpace===bi||ne===Me?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce)}t.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment);let ie=m(w.image,!1,s.maxTextureSize);ie=ht(w,ie);let ye=r.convert(w.format,w.colorSpace),Ge=r.convert(w.type),Ae=v(w.internalFormat,ye,Ge,w.normalized,w.colorSpace,w.isVideoTexture);le($,w);let ve,He=w.mipmaps,Ze=w.isVideoTexture!==!0,nt=xe.__version===void 0||Q===!0,V=pe.dataReady,be=b(w,ie);if(w.isDepthTexture)Ae=M(w.format===zi,w.type),nt&&(Ze?t.texStorage2D(i.TEXTURE_2D,1,Ae,ie.width,ie.height):t.texImage2D(i.TEXTURE_2D,0,Ae,ie.width,ie.height,0,ye,Ge,null));else if(w.isDataTexture)if(He.length>0){Ze&&nt&&t.texStorage2D(i.TEXTURE_2D,be,Ae,He[0].width,He[0].height);for(let ne=0,Me=He.length;ne<Me;ne++)ve=He[ne],Ze?V&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,ve.width,ve.height,ye,Ge,ve.data):t.texImage2D(i.TEXTURE_2D,ne,Ae,ve.width,ve.height,0,ye,Ge,ve.data);w.generateMipmaps=!1}else Ze?(nt&&t.texStorage2D(i.TEXTURE_2D,be,Ae,ie.width,ie.height),V&&Y(w,ie,ye,Ge)):t.texImage2D(i.TEXTURE_2D,0,Ae,ie.width,ie.height,0,ye,Ge,ie.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Ze&&nt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,be,Ae,He[0].width,He[0].height,ie.depth);for(let ne=0,Me=He.length;ne<Me;ne++)if(ve=He[ne],w.format!==cn)if(ye!==null)if(Ze){if(V)if(w.layerUpdates.size>0){let Ce=cf(ve.width,ve.height,w.format,w.type);for(let ce of w.layerUpdates){let We=ve.data.subarray(ce*Ce/ve.data.BYTES_PER_ELEMENT,(ce+1)*Ce/ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,ce,ve.width,ve.height,1,ye,We)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,ve.width,ve.height,ie.depth,ye,ve.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ne,Ae,ve.width,ve.height,ie.depth,0,ve.data,0,0);else _e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ze?V&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,ve.width,ve.height,ie.depth,ye,Ge,ve.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ne,Ae,ve.width,ve.height,ie.depth,0,ye,Ge,ve.data);w.layerUpdates.size>0&&w.clearLayerUpdates()}else{Ze&&nt&&t.texStorage2D(i.TEXTURE_2D,be,Ae,He[0].width,He[0].height);for(let ne=0,Me=He.length;ne<Me;ne++)ve=He[ne],w.format!==cn?ye!==null?Ze?V&&t.compressedTexSubImage2D(i.TEXTURE_2D,ne,0,0,ve.width,ve.height,ye,ve.data):t.compressedTexImage2D(i.TEXTURE_2D,ne,Ae,ve.width,ve.height,0,ve.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ze?V&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,ve.width,ve.height,ye,Ge,ve.data):t.texImage2D(i.TEXTURE_2D,ne,Ae,ve.width,ve.height,0,ye,Ge,ve.data)}else if(w.isDataArrayTexture)if(Ze){if(nt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,be,Ae,ie.width,ie.height,ie.depth),V)if(w.layerUpdates.size>0){let ne=cf(ie.width,ie.height,w.format,w.type);for(let Me of w.layerUpdates){let Ce=ie.data.subarray(Me*ne/ie.data.BYTES_PER_ELEMENT,(Me+1)*ne/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Me,ie.width,ie.height,1,ye,Ge,Ce)}w.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,ye,Ge,ie.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ae,ie.width,ie.height,ie.depth,0,ye,Ge,ie.data);else if(w.isData3DTexture)Ze?(nt&&t.texStorage3D(i.TEXTURE_3D,be,Ae,ie.width,ie.height,ie.depth),V&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,ye,Ge,ie.data)):t.texImage3D(i.TEXTURE_3D,0,Ae,ie.width,ie.height,ie.depth,0,ye,Ge,ie.data);else if(w.isFramebufferTexture){if(nt)if(Ze)t.texStorage2D(i.TEXTURE_2D,be,Ae,ie.width,ie.height);else{let ne=ie.width,Me=ie.height;for(let Ce=0;Ce<be;Ce++)t.texImage2D(i.TEXTURE_2D,Ce,Ae,ne,Me,0,ye,Ge,null),ne>>=1,Me>>=1}}else if(w.isHTMLTexture){if("texElementImage2D"in i){let ne=i.canvas;if(ne.hasAttribute("layoutsubtree")||ne.setAttribute("layoutsubtree","true"),ie.parentNode!==ne){ne.appendChild(ie),f.add(w),ne.onpaint=Me=>{let Ce=Me.changedElements;for(let ce of f)Ce.includes(ce.image)&&(ce.needsUpdate=!0)},ne.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ie);else{let Ce=i.RGBA,ce=i.RGBA,We=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ce,ce,We,ie)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(He.length>0){if(Ze&&nt){let ne=lt(He[0]);t.texStorage2D(i.TEXTURE_2D,be,Ae,ne.width,ne.height)}for(let ne=0,Me=He.length;ne<Me;ne++)ve=He[ne],Ze?V&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,ye,Ge,ve):t.texImage2D(i.TEXTURE_2D,ne,Ae,ye,Ge,ve);w.generateMipmaps=!1}else if(Ze){if(nt){let ne=lt(ie);t.texStorage2D(i.TEXTURE_2D,be,Ae,ne.width,ne.height)}V&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ye,Ge,ie)}else t.texImage2D(i.TEXTURE_2D,0,Ae,ye,Ge,ie);g(w)&&y($),xe.__version=pe.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function Re(D,w,W){if(w.image.length!==6)return;let $=ge(D,w),Q=w.source;t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+W);let pe=n.get(Q);if(Q.version!==pe.__version||$===!0){t.activeTexture(i.TEXTURE0+W);let xe=at.getPrimaries(at.workingColorSpace),te=w.colorSpace===bi?null:at.getPrimaries(w.colorSpace),ie=w.colorSpace===bi||xe===te?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie);let ye=w.isCompressedTexture||w.image[0].isCompressedTexture,Ge=w.image[0]&&w.image[0].isDataTexture,Ae=[];for(let ce=0;ce<6;ce++)!ye&&!Ge?Ae[ce]=m(w.image[ce],!0,s.maxCubemapSize):Ae[ce]=Ge?w.image[ce].image:w.image[ce],Ae[ce]=ht(w,Ae[ce]);let ve=Ae[0],He=r.convert(w.format,w.colorSpace),Ze=r.convert(w.type),nt=v(w.internalFormat,He,Ze,w.normalized,w.colorSpace),V=w.isVideoTexture!==!0,be=pe.__version===void 0||$===!0,ne=Q.dataReady,Me=b(w,ve);le(i.TEXTURE_CUBE_MAP,w);let Ce;if(ye){V&&be&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Me,nt,ve.width,ve.height);for(let ce=0;ce<6;ce++){Ce=Ae[ce].mipmaps;for(let We=0;We<Ce.length;We++){let Be=Ce[We];w.format!==cn?He!==null?V?ne&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We,0,0,Be.width,Be.height,He,Be.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We,nt,Be.width,Be.height,0,Be.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):V?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We,0,0,Be.width,Be.height,He,Ze,Be.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We,nt,Be.width,Be.height,0,He,Ze,Be.data)}}}else{if(Ce=w.mipmaps,V&&be){Ce.length>0&&Me++;let ce=lt(Ae[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Me,nt,ce.width,ce.height)}for(let ce=0;ce<6;ce++)if(Ge){V?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,0,0,Ae[ce].width,Ae[ce].height,He,Ze,Ae[ce].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,nt,Ae[ce].width,Ae[ce].height,0,He,Ze,Ae[ce].data);for(let We=0;We<Ce.length;We++){let Mt=Ce[We].image[ce].image;V?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We+1,0,0,Mt.width,Mt.height,He,Ze,Mt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We+1,nt,Mt.width,Mt.height,0,He,Ze,Mt.data)}}else{V?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,0,0,He,Ze,Ae[ce]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,nt,He,Ze,Ae[ce]);for(let We=0;We<Ce.length;We++){let Be=Ce[We];V?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We+1,0,0,He,Ze,Be.image[ce]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,We+1,nt,He,Ze,Be.image[ce])}}}g(w)&&y(i.TEXTURE_CUBE_MAP),pe.__version=Q.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function me(D,w,W,$,Q,pe){let xe=r.convert(W.format,W.colorSpace),te=r.convert(W.type),ie=v(W.internalFormat,xe,te,W.normalized,W.colorSpace),ye=n.get(w),Ge=n.get(W);if(Ge.__renderTarget=w,!ye.__hasExternalTextures){let Ae=Math.max(1,w.width>>pe),ve=Math.max(1,w.height>>pe);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?t.texImage3D(Q,pe,ie,Ae,ve,w.depth,0,xe,te,null):t.texImage2D(Q,pe,ie,Ae,ve,0,xe,te,null)}t.bindFramebuffer(i.FRAMEBUFFER,D),Ye(w)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,Q,Ge.__webglTexture,0,qe(w)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,Q,Ge.__webglTexture,pe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ie(D,w,W){if(i.bindRenderbuffer(i.RENDERBUFFER,D),w.depthBuffer){let $=w.depthTexture,Q=$&&$.isDepthTexture?$.type:null,pe=M(w.stencilBuffer,Q),xe=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Ye(w)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qe(w),pe,w.width,w.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,qe(w),pe,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,pe,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,xe,i.RENDERBUFFER,D)}else{let $=w.textures;for(let Q=0;Q<$.length;Q++){let pe=$[Q],xe=r.convert(pe.format,pe.colorSpace),te=r.convert(pe.type),ie=v(pe.internalFormat,xe,te,pe.normalized,pe.colorSpace);Ye(w)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,qe(w),ie,w.width,w.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,qe(w),ie,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,ie,w.width,w.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function je(D,w,W){let $=w.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,D),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Q=n.get(w.depthTexture);if(Q.__renderTarget=w,(!Q.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),$){if(Q.__webglInit===void 0&&(Q.__webglInit=!0,w.depthTexture.addEventListener("dispose",E)),Q.__webglTexture===void 0){Q.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Q.__webglTexture),le(i.TEXTURE_CUBE_MAP,w.depthTexture);let ye=r.convert(w.depthTexture.format),Ge=r.convert(w.depthTexture.type),Ae;w.depthTexture.format===ni?Ae=i.DEPTH_COMPONENT24:w.depthTexture.format===zi&&(Ae=i.DEPTH24_STENCIL8);for(let ve=0;ve<6;ve++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,Ae,w.width,w.height,0,ye,Ge,null)}}else j(w.depthTexture,0);let pe=Q.__webglTexture,xe=qe(w),te=$?i.TEXTURE_CUBE_MAP_POSITIVE_X+W:i.TEXTURE_2D,ie=w.depthTexture.format===zi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(w.depthTexture.format===ni)Ye(w)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ie,te,pe,0,xe):i.framebufferTexture2D(i.FRAMEBUFFER,ie,te,pe,0);else if(w.depthTexture.format===zi)Ye(w)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ie,te,pe,0,xe):i.framebufferTexture2D(i.FRAMEBUFFER,ie,te,pe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ee(D){let w=n.get(D),W=D.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==D.depthTexture){let $=D.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),$){let Q=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,$.removeEventListener("dispose",Q)};$.addEventListener("dispose",Q),w.__depthDisposeCallback=Q}w.__boundDepthTexture=$}if(D.depthTexture&&!w.__autoAllocateDepthBuffer)if(W)for(let $=0;$<6;$++)je(w.__webglFramebuffer[$],D,$);else{let $=D.texture.mipmaps;$&&$.length>0?je(w.__webglFramebuffer[0],D,0):je(w.__webglFramebuffer,D,0)}else if(W){w.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer[$]),w.__webglDepthbuffer[$]===void 0)w.__webglDepthbuffer[$]=i.createRenderbuffer(),Ie(w.__webglDepthbuffer[$],D,!1);else{let Q=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pe=w.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,pe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,pe)}}else{let $=D.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=i.createRenderbuffer(),Ie(w.__webglDepthbuffer,D,!1);else{let Q=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pe=w.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,pe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,pe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function re(D,w,W){let $=n.get(D);w!==void 0&&me($.__webglFramebuffer,D,D.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),W!==void 0&&ee(D)}function se(D){let w=D.texture,W=n.get(D),$=n.get(w);D.addEventListener("dispose",_);let Q=D.textures,pe=D.isWebGLCubeRenderTarget===!0,xe=Q.length>1;if(xe||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=w.version,o.memory.textures++),pe){W.__webglFramebuffer=[];for(let te=0;te<6;te++)if(w.mipmaps&&w.mipmaps.length>0){W.__webglFramebuffer[te]=[];for(let ie=0;ie<w.mipmaps.length;ie++)W.__webglFramebuffer[te][ie]=i.createFramebuffer()}else W.__webglFramebuffer[te]=i.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){W.__webglFramebuffer=[];for(let te=0;te<w.mipmaps.length;te++)W.__webglFramebuffer[te]=i.createFramebuffer()}else W.__webglFramebuffer=i.createFramebuffer();if(xe)for(let te=0,ie=Q.length;te<ie;te++){let ye=n.get(Q[te]);ye.__webglTexture===void 0&&(ye.__webglTexture=i.createTexture(),o.memory.textures++)}if(D.samples>0&&Ye(D)===!1){W.__webglMultisampledFramebuffer=i.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let te=0;te<Q.length;te++){let ie=Q[te];W.__webglColorRenderbuffer[te]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,W.__webglColorRenderbuffer[te]);let ye=r.convert(ie.format,ie.colorSpace),Ge=r.convert(ie.type),Ae=v(ie.internalFormat,ye,Ge,ie.normalized,ie.colorSpace,D.isXRRenderTarget===!0),ve=qe(D);i.renderbufferStorageMultisample(i.RENDERBUFFER,ve,Ae,D.width,D.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+te,i.RENDERBUFFER,W.__webglColorRenderbuffer[te])}i.bindRenderbuffer(i.RENDERBUFFER,null),D.depthBuffer&&(W.__webglDepthRenderbuffer=i.createRenderbuffer(),Ie(W.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(pe){t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),le(i.TEXTURE_CUBE_MAP,w);for(let te=0;te<6;te++)if(w.mipmaps&&w.mipmaps.length>0)for(let ie=0;ie<w.mipmaps.length;ie++)me(W.__webglFramebuffer[te][ie],D,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+te,ie);else me(W.__webglFramebuffer[te],D,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+te,0);g(w)&&y(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(xe){for(let te=0,ie=Q.length;te<ie;te++){let ye=Q[te],Ge=n.get(ye),Ae=i.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(Ae=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Ae,Ge.__webglTexture),le(Ae,ye),me(W.__webglFramebuffer,D,ye,i.COLOR_ATTACHMENT0+te,Ae,0),g(ye)&&y(Ae)}t.unbindTexture()}else{let te=i.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(te=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(te,$.__webglTexture),le(te,w),w.mipmaps&&w.mipmaps.length>0)for(let ie=0;ie<w.mipmaps.length;ie++)me(W.__webglFramebuffer[ie],D,w,i.COLOR_ATTACHMENT0,te,ie);else me(W.__webglFramebuffer,D,w,i.COLOR_ATTACHMENT0,te,0);g(w)&&y(te),t.unbindTexture()}D.depthBuffer&&ee(D)}function ae(D){let w=D.textures;for(let W=0,$=w.length;W<$;W++){let Q=w[W];if(g(Q)){let pe=S(D),xe=n.get(Q).__webglTexture;t.bindTexture(pe,xe),y(pe),t.unbindTexture()}}}let fe=[],Pe=[];function Ue(D){if(D.samples>0){if(Ye(D)===!1){let w=D.textures,W=D.width,$=D.height,Q=i.COLOR_BUFFER_BIT,pe=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=n.get(D),te=w.length>1;if(te)for(let ye=0;ye<w.length;ye++)t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer);let ie=D.texture.mipmaps;ie&&ie.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let ye=0;ye<w.length;ye++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),te){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,xe.__webglColorRenderbuffer[ye]);let Ge=n.get(w[ye]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ge,0)}i.blitFramebuffer(0,0,W,$,0,0,W,$,Q,i.NEAREST),l===!0&&(fe.length=0,Pe.length=0,fe.push(i.COLOR_ATTACHMENT0+ye),D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&(fe.push(pe),Pe.push(pe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Pe)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,fe))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),te)for(let ye=0;ye<w.length;ye++){t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,xe.__webglColorRenderbuffer[ye]);let Ge=n.get(w[ye]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,Ge,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&l){let w=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[w])}}}function qe(D){return Math.min(s.maxSamples,D.samples)}function Ye(D){let w=n.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function F(D){let w=o.render.frame;u.get(D)!==w&&(u.set(D,w),D.update())}function ht(D,w){let W=D.colorSpace,$=D.format,Q=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||W!==Br&&W!==bi&&(at.getTransfer(W)===dt?($!==cn||Q!==bn)&&_e("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ke("WebGLTextures: Unsupported texture color space:",W)),w}function lt(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=P,this.getTextureUnits=C,this.setTextureUnits=U,this.setTexture2D=j,this.setTexture2DArray=q,this.setTexture3D=k,this.setTextureCube=H,this.rebindTextures=re,this.setupRenderTarget=se,this.updateRenderTargetMipmap=ae,this.updateMultisampleRenderTarget=Ue,this.setupDepthRenderbuffer=ee,this.setupFrameBufferTexture=me,this.useMultisampledRTT=Ye,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Ax(i,e){function t(n,s=bi){let r,o=at.getTransfer(s);if(n===bn)return i.UNSIGNED_BYTE;if(n===Il)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Pl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===nf)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===sf)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===ef)return i.BYTE;if(n===tf)return i.SHORT;if(n===tr)return i.UNSIGNED_SHORT;if(n===Cl)return i.INT;if(n===Un)return i.UNSIGNED_INT;if(n===ln)return i.FLOAT;if(n===Xn)return i.HALF_FLOAT;if(n===rf)return i.ALPHA;if(n===of)return i.RGB;if(n===cn)return i.RGBA;if(n===ni)return i.DEPTH_COMPONENT;if(n===zi)return i.DEPTH_STENCIL;if(n===Ll)return i.RED;if(n===Mo)return i.RED_INTEGER;if(n===Gi)return i.RG;if(n===Dl)return i.RG_INTEGER;if(n===Nl)return i.RGBA_INTEGER;if(n===So||n===wo||n===Ao||n===Eo)if(o===dt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===So)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===wo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ao)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===So)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===wo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ao)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Eo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ul||n===Fl||n===Ol||n===Bl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ul)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Fl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ol)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Bl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===kl||n===Vl||n===zl||n===Gl||n===Hl||n===To||n===Wl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===kl||n===Vl)return o===dt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===zl)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Gl)return r.COMPRESSED_R11_EAC;if(n===Hl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===To)return r.COMPRESSED_RG11_EAC;if(n===Wl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Xl||n===ql||n===Yl||n===Zl||n===Jl||n===$l||n===Kl||n===jl||n===Ql||n===ec||n===tc||n===nc||n===ic||n===sc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Xl)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ql)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Yl)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Zl)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Jl)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===$l)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Kl)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===jl)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ql)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ec)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===tc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===nc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ic)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===sc)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===rc||n===oc||n===ac)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===rc)return o===dt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===oc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ac)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===lc||n===cc||n===Ro||n===uc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===lc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===cc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ro)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===uc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===nr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var mw=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,gw=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Gp=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Zr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new yn({vertexShader:mw,fragmentShader:gw,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Tt(new qs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Hp=class extends An{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,f=null,h=null,d=null,p=null,x=typeof XRWebGLBinding<"u",m=new Gp,g={},y=t.getContextAttributes(),S=null,v=null,M=[],b=[],E=new oe,_=null,A=null,R=new Ft;R.viewport=new _t;let L=new Ft;L.viewport=new _t;let I=[R,L],P=new Ml,C=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let Y=M[X];return Y===void 0&&(Y=new zs,M[X]=Y),Y.getTargetRaySpace()},this.getControllerGrip=function(X){let Y=M[X];return Y===void 0&&(Y=new zs,M[X]=Y),Y.getGripSpace()},this.getHand=function(X){let Y=M[X];return Y===void 0&&(Y=new zs,M[X]=Y),Y.getHandSpace()};function B(X){let Y=b.indexOf(X.inputSource);if(Y===-1)return;let he=M[Y];he!==void 0&&(he.update(X.inputSource,X.frame,c||o),he.dispatchEvent({type:X.type,data:X.inputSource}))}function z(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",j);for(let X=0;X<M.length;X++){let Y=b[X];Y!==null&&(b[X]=null,M[X].disconnect(Y))}C=null,U=null,m.reset();for(let X in g)delete g[X];if(e.setRenderTarget(S),d=null,h=null,f=null,s=null,v=null,ge.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(E.width,E.height,!1),A!==null){let X=A.camera;X.fov=A.fov,X.zoom=A.zoom,X.updateProjectionMatrix(),A=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&_e("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&_e("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&x&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(S=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",z),s.addEventListener("inputsourceschange",j),y.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(E),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let he=null,Re=null,me=null;y.depth&&(me=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,he=y.stencil?zi:ni,Re=y.stencil?nr:Un);let Ie={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(Ie),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new Qt(h.textureWidth,h.textureHeight,{format:cn,type:bn,depthTexture:new Fi(h.textureWidth,h.textureHeight,Re,void 0,void 0,void 0,void 0,void 0,void 0,he),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let he={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,he),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new Qt(d.framebufferWidth,d.framebufferHeight,{format:cn,type:bn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),ge.setContext(s),ge.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function j(X){for(let Y=0;Y<X.removed.length;Y++){let he=X.removed[Y],Re=b.indexOf(he);Re>=0&&(b[Re]=null,M[Re].disconnect(he))}for(let Y=0;Y<X.added.length;Y++){let he=X.added[Y],Re=b.indexOf(he);if(Re===-1){for(let Ie=0;Ie<M.length;Ie++)if(Ie>=b.length){b.push(he),Re=Ie;break}else if(b[Ie]===null){b[Ie]=he,Re=Ie;break}if(Re===-1)break}let me=M[Re];me&&me.connect(he)}}let q=new N,k=new N;function H(X,Y,he){q.setFromMatrixPosition(Y.matrixWorld),k.setFromMatrixPosition(he.matrixWorld);let Re=q.distanceTo(k),me=Y.projectionMatrix.elements,Ie=he.projectionMatrix.elements,je=me[14]/(me[10]-1),ee=me[14]/(me[10]+1),re=(me[9]+1)/me[5],se=(me[9]-1)/me[5],ae=(me[8]-1)/me[0],fe=(Ie[8]+1)/Ie[0],Pe=je*ae,Ue=je*fe,qe=Re/(-ae+fe),Ye=qe*-ae;if(Y.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Ye),X.translateZ(qe),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),me[10]===-1)X.projectionMatrix.copy(Y.projectionMatrix),X.projectionMatrixInverse.copy(Y.projectionMatrixInverse);else{let F=je+qe,ht=ee+qe,lt=Pe-Ye,D=Ue+(Re-Ye),w=re*ee/ht*F,W=se*ee/ht*F;X.projectionMatrix.makePerspective(lt,D,w,W,F,ht),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function ue(X,Y){Y===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(Y.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;let Y=X.near,he=X.far;m.texture!==null&&(m.depthNear>0&&(Y=m.depthNear),m.depthFar>0&&(he=m.depthFar)),P.near=L.near=R.near=Y,P.far=L.far=R.far=he,(C!==P.near||U!==P.far)&&(s.updateRenderState({depthNear:P.near,depthFar:P.far}),C=P.near,U=P.far),P.layers.mask=X.layers.mask|6,R.layers.mask=P.layers.mask&-5,L.layers.mask=P.layers.mask&-3;let Re=X.parent,me=P.cameras;ue(P,Re);for(let Ie=0;Ie<me.length;Ie++)ue(me[Ie],Re);me.length===2?H(P,R,L):P.projectionMatrix.copy(R.projectionMatrix),A===null&&X.isPerspectiveCamera&&(A={camera:X,fov:X.fov,zoom:X.zoom}),de(X,P,Re)};function de(X,Y,he){he===null?X.matrix.copy(Y.matrixWorld):(X.matrix.copy(he.matrixWorld),X.matrix.invert(),X.matrix.multiply(Y.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(Y.projectionMatrix),X.projectionMatrixInverse.copy(Y.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Os*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(X){l=X,h!==null&&(h.fixedFoveation=X),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=X)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(P)},this.getCameraTexture=function(X){return g[X]};let G=null;function le(X,Y){if(u=Y.getViewerPose(c||o),p=Y,u!==null){let he=u.views;d!==null&&(e.setRenderTargetFramebuffer(v,d.framebuffer),e.setRenderTarget(v));let Re=!1;he.length!==P.cameras.length&&(P.cameras.length=0,Re=!0);for(let ee=0;ee<he.length;ee++){let re=he[ee],se=null;if(d!==null)se=d.getViewport(re);else{let fe=f.getViewSubImage(h,re);se=fe.viewport,ee===0&&(e.setRenderTargetTextures(v,fe.colorTexture,fe.depthStencilTexture),e.setRenderTarget(v))}let ae=I[ee];ae===void 0&&(ae=new Ft,ae.layers.enable(ee),ae.viewport=new _t,I[ee]=ae),ae.matrix.fromArray(re.transform.matrix),ae.matrix.decompose(ae.position,ae.quaternion,ae.scale),ae.projectionMatrix.fromArray(re.projectionMatrix),ae.projectionMatrixInverse.copy(ae.projectionMatrix).invert(),ae.viewport.set(se.x,se.y,se.width,se.height),ee===0&&(P.matrix.copy(ae.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),Re===!0&&P.cameras.push(ae)}let me=s.enabledFeatures;if(me&&me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){f=n.getBinding();let ee=f.getDepthInformation(he[0]);ee&&ee.isValid&&ee.texture&&m.init(ee,s.renderState)}if(me&&me.includes("camera-access")&&x){e.state.unbindTexture(),f=n.getBinding();for(let ee=0;ee<he.length;ee++){let re=he[ee].camera;if(re){let se=g[re];se||(se=new Zr,g[re]=se);let ae=f.getCameraImage(re);se.sourceTexture=ae}}}}for(let he=0;he<M.length;he++){let Re=b[he],me=M[he];Re!==null&&me!==void 0&&me.update(Re,Y,c||o)}G&&G(X,Y),Y.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Y}),p=null}let ge=new yx;ge.setAnimationLoop(le),this.setAnimationLoop=function(X){G=X},this.dispose=function(){}}},xw=new $e,Ex=new Qe;Ex.set(-1,0,0,0,1,0,0,0,1);function _w(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,yp(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,y,S,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),f(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),h(m,g),g.isMeshPhysicalMaterial&&d(m,g,v)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),x(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?l(m,g,y,S):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===un&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===un&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let y=e.get(g),S=y.envMap,v=y.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(xw.makeRotationFromEuler(v)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Ex),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,y,S){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*y,m.scale.value=S*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function f(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function h(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function d(m,g,y){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===un&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function x(m,g){let y=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function yw(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,M){let b=M.program;n.uniformBlockBinding(v,b)}function c(v,M){let b=s[v.id];b===void 0&&(m(v),b=u(v),s[v.id]=b,v.addEventListener("dispose",y));let E=M.program;n.updateUBOMapping(v,E);let _=e.render.frame;r[v.id]!==_&&(h(v),r[v.id]=_)}function u(v){let M=f();v.__bindingPointIndex=M;let b=i.createBuffer(),E=v.__size,_=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,b),i.bufferData(i.UNIFORM_BUFFER,E,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,b),b}function f(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(v){let M=s[v.id],b=v.uniforms,E=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let _=0,A=b.length;_<A;_++){let R=b[_];if(Array.isArray(R))for(let L=0,I=R.length;L<I;L++)d(R[L],_,L,E);else d(R,_,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(v,M,b,E){if(x(v,M,b,E)===!0){let _=v.__offset,A=v.value;if(Array.isArray(A)){let R=0;for(let L=0;L<A.length;L++){let I=A[L],P=g(I);p(I,v.__data,R),typeof I!="number"&&typeof I!="boolean"&&!I.isMatrix3&&!ArrayBuffer.isView(I)&&(R+=P.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(A,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,v.__data)}}function p(v,M,b){typeof v=="number"||typeof v=="boolean"?M[0]=v:v.isMatrix3?(M[0]=v.elements[0],M[1]=v.elements[1],M[2]=v.elements[2],M[3]=0,M[4]=v.elements[3],M[5]=v.elements[4],M[6]=v.elements[5],M[7]=0,M[8]=v.elements[6],M[9]=v.elements[7],M[10]=v.elements[8],M[11]=0):ArrayBuffer.isView(v)?M.set(new v.constructor(v.buffer,v.byteOffset,M.length)):v.toArray(M,b)}function x(v,M,b,E){let _=v.value,A=M+"_"+b;if(E[A]===void 0)return typeof _=="number"||typeof _=="boolean"?E[A]=_:ArrayBuffer.isView(_)?E[A]=_.slice():E[A]=_.clone(),!0;{let R=E[A];if(typeof _=="number"||typeof _=="boolean"){if(R!==_)return E[A]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(R.equals(_)===!1)return R.copy(_),!0}}return!1}function m(v){let M=v.uniforms,b=0,E=16;for(let A=0,R=M.length;A<R;A++){let L=Array.isArray(M[A])?M[A]:[M[A]];for(let I=0,P=L.length;I<P;I++){let C=L[I],U=Array.isArray(C.value)?C.value:[C.value];for(let B=0,z=U.length;B<z;B++){let j=U[B],q=g(j),k=b%E,H=k%q.boundary,ue=k+H;b+=H,ue!==0&&E-ue<q.storage&&(b+=E-ue),C.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),C.__offset=b,b+=q.storage}}}let _=b%E;return _>0&&(b+=E-_),v.__size=b,v.__cache={},this}function g(v){let M={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(M.boundary=4,M.storage=4):v.isVector2?(M.boundary=8,M.storage=8):v.isVector3||v.isColor?(M.boundary=16,M.storage=12):v.isVector4?(M.boundary=16,M.storage=16):v.isMatrix3?(M.boundary=48,M.storage=48):v.isMatrix4?(M.boundary=64,M.storage=64):v.isTexture?_e("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(M.boundary=16,M.storage=v.byteLength):_e("WebGLRenderer: Unsupported uniform value type.",v),M}function y(v){let M=v.target;M.removeEventListener("dispose",y);let b=o.indexOf(M.__bindingPointIndex);o.splice(b,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function S(){for(let v in s)i.deleteBuffer(s[v]);o=[],s={},r={}}return{bind:l,update:c,dispose:S}}var vw=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Mi=null;function bw(){return Mi===null&&(Mi=new _n(vw,16,16,Gi,Xn),Mi.name="DFG_LUT",Mi.minFilter=wt,Mi.magFilter=wt,Mi.wrapS=xn,Mi.wrapT=xn,Mi.generateMipmaps=!1,Mi.needsUpdate=!0),Mi}var Wp=class{constructor(e={}){let{canvas:t=gp(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=bn}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let x=d,m=new Set([Nl,Dl,Mo]),g=new Set([bn,Un,tr,nr,Il,Pl]),y=new Uint32Array(4),S=new Int32Array(4),v=new N,M=null,b=null,E=[],_=[],A=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Wn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,L=!1,I=null,P=null,C=null,U=null;this._outputColorSpace=mn;let B=0,z=0,j=null,q=-1,k=null,H=new _t,ue=new _t,de=null,G=new Se(0),le=0,ge=t.width,X=t.height,Y=1,he=null,Re=null,me=new _t(0,0,ge,X),Ie=new _t(0,0,ge,X),je=!1,ee=new xi,re=!1,se=!1,ae=new $e,fe=new N,Pe=new _t,Ue={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function Ye(){return j===null?Y:1}let F=n;function ht(T,O){return t.getContext(T,O)}let lt,D,w,W,$,Q,pe,xe,te,ie,ye,Ge,Ae,ve,He,Ze,nt,V,be,ne,Me,Ce,ce;try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Mt,!1),t.addEventListener("webglcontextrestored",mt,!1),t.addEventListener("webglcontextcreationerror",Zn,!1),F===null){let O="webgl2";if(F=ht(O,T),F===null)throw ht(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}We()}catch(T){throw t.removeEventListener("webglcontextlost",Mt,!1),t.removeEventListener("webglcontextrestored",mt,!1),t.removeEventListener("webglcontextcreationerror",Zn,!1),ke("WebGLRenderer: "+T.message),T}function We(){lt=new CS(F),lt.init(),Me=new Ax(F,lt),D=new yS(F,lt,e,Me),w=new dw(F,lt),D.reversedDepthBuffer&&h&&w.buffers.depth.setReversed(!0),P=F.createFramebuffer(),C=F.createFramebuffer(),U=F.createFramebuffer(),W=new LS(F),$=new Q1,Q=new pw(F,lt,w,$,D,Me,W),pe=new RS(R),xe=new Nv(F),Ce=new xS(F,xe),te=new IS(F,xe,W,Ce),ie=new NS(F,te,xe,Ce,W),V=new DS(F,D,Q),He=new vS($),ye=new j1(R,pe,lt,D,Ce,He),Ge=new _w(R,$),Ae=new tw,ve=new aw(lt),nt=new gS(R,pe,w,ie,p,l),Ze=new fw(R,ie,D),ce=new yw(F,W,D,w),be=new _S(F,lt,W),ne=new PS(F,lt,W),W.programs=ye.programs,R.capabilities=D,R.extensions=lt,R.properties=$,R.renderLists=Ae,R.shadowMap=Ze,R.state=w,R.info=W}x!==bn&&(A=new FS(x,t.width,t.height,a,s,r));let Be=new Hp(R,F);this.xr=Be,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let T=lt.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=lt.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(T){T!==void 0&&(Y=T,this.setSize(ge,X,!1))},this.getSize=function(T){return T.set(ge,X)},this.setSize=function(T,O,K=!0){if(Be.isPresenting){_e("WebGLRenderer: Can't change size while VR device is presenting.");return}ge=T,X=O,t.width=Math.floor(T*Y),t.height=Math.floor(O*Y),K===!0&&(t.style.width=T+"px",t.style.height=O+"px"),A!==null&&A.setSize(t.width,t.height),this.setViewport(0,0,T,O)},this.getDrawingBufferSize=function(T){return T.set(ge*Y,X*Y).floor()},this.setDrawingBufferSize=function(T,O,K){ge=T,X=O,Y=K,t.width=Math.floor(T*K),t.height=Math.floor(O*K),this.setViewport(0,0,T,O)},this.setEffects=function(T){if(x===bn){ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let O=0;O<T.length;O++)if(T[O].isOutputPass===!0){_e("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(H)},this.getViewport=function(T){return T.copy(me)},this.setViewport=function(T,O,K,Z){T.isVector4?me.set(T.x,T.y,T.z,T.w):me.set(T,O,K,Z),w.viewport(H.copy(me).multiplyScalar(Y).round())},this.getScissor=function(T){return T.copy(Ie)},this.setScissor=function(T,O,K,Z){T.isVector4?Ie.set(T.x,T.y,T.z,T.w):Ie.set(T,O,K,Z),w.scissor(ue.copy(Ie).multiplyScalar(Y).round())},this.getScissorTest=function(){return je},this.setScissorTest=function(T){w.setScissorTest(je=T)},this.setOpaqueSort=function(T){he=T},this.setTransparentSort=function(T){Re=T},this.getClearColor=function(T){return T.copy(nt.getClearColor())},this.setClearColor=function(){nt.setClearColor(...arguments)},this.getClearAlpha=function(){return nt.getClearAlpha()},this.setClearAlpha=function(){nt.setClearAlpha(...arguments)},this.clear=function(T=!0,O=!0,K=!0){let Z=0;if(T){let J=!1;if(j!==null){let Te=j.texture.format;J=m.has(Te)}if(J){let Te=j.texture.type,Ne=g.has(Te),Ee=nt.getClearColor(),Fe=nt.getClearAlpha(),ze=Ee.r,rt=Ee.g,ct=Ee.b;Ne?(y[0]=ze,y[1]=rt,y[2]=ct,y[3]=Fe,F.clearBufferuiv(F.COLOR,0,y)):(S[0]=ze,S[1]=rt,S[2]=ct,S[3]=Fe,F.clearBufferiv(F.COLOR,0,S))}else Z|=F.COLOR_BUFFER_BIT}O&&(Z|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),K&&(Z|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Z!==0&&F.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),I=T},this.dispose=function(){t.removeEventListener("webglcontextlost",Mt,!1),t.removeEventListener("webglcontextrestored",mt,!1),t.removeEventListener("webglcontextcreationerror",Zn,!1),nt.dispose(),Ae.dispose(),ve.dispose(),$.dispose(),pe.dispose(),ie.dispose(),Ce.dispose(),ce.dispose(),ye.dispose(),Be.dispose(),Be.removeEventListener("sessionstart",gm),Be.removeEventListener("sessionend",xm),Ms.stop()};function Mt(T){T.preventDefault(),zr("WebGLRenderer: Context Lost."),L=!0}function mt(){zr("WebGLRenderer: Context Restored."),L=!1;let T=W.autoReset,O=Ze.enabled,K=Ze.autoUpdate,Z=Ze.needsUpdate,J=Ze.type;We(),W.autoReset=T,Ze.enabled=O,Ze.autoUpdate=K,Ze.needsUpdate=Z,Ze.type=J}function Zn(T){ke("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function di(T){let O=T.target;O.removeEventListener("dispose",di),I_(O)}function I_(T){P_(T),$.remove(T)}function P_(T){let O=$.get(T).programs;O!==void 0&&(O.forEach(function(K){ye.releaseProgram(K)}),T.isShaderMaterial&&ye.releaseShaderCache(T))}this.renderBufferDirect=function(T,O,K,Z,J,Te){O===null&&(O=Ue);let Ne=J.isMesh&&J.matrixWorld.determinantAffine()<0,Ee=N_(T,O,K,Z,J);w.setMaterial(Z,Ne);let Fe=K.index,ze=1;if(Z.wireframe===!0){if(Fe=te.getWireframeAttribute(K),Fe===void 0)return;ze=2}let rt=K.drawRange,ct=K.attributes.position,Oe=rt.start*ze,gt=(rt.start+rt.count)*ze;Te!==null&&(Oe=Math.max(Oe,Te.start*ze),gt=Math.min(gt,(Te.start+Te.count)*ze)),Fe!==null?(Oe=Math.max(Oe,0),gt=Math.min(gt,Fe.count)):ct!=null&&(Oe=Math.max(Oe,0),gt=Math.min(gt,ct.count));let Nt=gt-Oe;if(Nt<0||Nt===1/0)return;Ce.setup(J,Z,Ee,K,Fe);let At,bt=be;if(Fe!==null&&(At=xe.get(Fe),bt=ne,bt.setIndex(At)),J.isMesh)Z.wireframe===!0?(w.setLineWidth(Z.wireframeLinewidth*Ye()),bt.setMode(F.LINES)):bt.setMode(F.TRIANGLES);else if(J.isLine){let sn=Z.linewidth;sn===void 0&&(sn=1),w.setLineWidth(sn*Ye()),J.isLineSegments?bt.setMode(F.LINES):J.isLineLoop?bt.setMode(F.LINE_LOOP):bt.setMode(F.LINE_STRIP)}else J.isPoints?bt.setMode(F.POINTS):J.isSprite&&bt.setMode(F.TRIANGLES);if(J.isBatchedMesh)if(lt.get("WEBGL_multi_draw"))bt.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else{let sn=J._multiDrawStarts,De=J._multiDrawCounts,dn=J._multiDrawCount,ut=Fe?xe.get(Fe).bytesPerElement:1,Bn=$.get(Z).currentProgram.getUniforms();for(let pi=0;pi<dn;pi++)Bn.setValue(F,"_gl_DrawID",pi),bt.render(sn[pi]/ut,De[pi])}else if(J.isInstancedMesh)bt.renderInstances(Oe,Nt,J.count);else if(K.isInstancedBufferGeometry){let sn=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,De=Math.min(K.instanceCount,sn);bt.renderInstances(Oe,Nt,De)}else bt.render(Oe,Nt)};function mm(T,O,K,Z){I!==null&&T.isNodeMaterial&&I.setObject(Z,T),re===!0&&He.setState(T,K,!1),T.transparent===!0&&T.side===Nn&&T.forceSinglePass===!1?(T.side=un,T.needsUpdate=!0,Bc(T,O,Z),T.side=ki,T.needsUpdate=!0,Bc(T,O,Z),T.side=Nn):Bc(T,O,Z)}this.compile=function(T,O,K=null){K===null&&(K=T),I!==null&&I.renderStart(T,O,K),b=ve.get(K),b.init(O),_.push(b),K.traverseVisible(function(J){J.isLight&&J.layers.test(O.layers)&&(b.pushLight(J),J.castShadow&&b.pushShadow(J))}),T!==K&&T.traverseVisible(function(J){J.isLight&&J.layers.test(O.layers)&&(b.pushLight(J),J.castShadow&&b.pushShadow(J))}),b.setupLights(),I!==null&&I.updateLights(b.state.lightsArray),se=this.localClippingEnabled,re=He.init(this.clippingPlanes,se),re===!0&&He.setGlobalState(this.clippingPlanes,O),I!==null&&Ze.render(b.state.shadowsArray,K,O);let Z=new Set;return T.traverse(function(J){if(!(J.isMesh||J.isPoints||J.isLine||J.isSprite))return;let Te=J.material;if(Te)if(Array.isArray(Te))for(let Ne=0;Ne<Te.length;Ne++){let Ee=Te[Ne];mm(Ee,K,O,J),Z.add(Ee)}else mm(Te,K,O,J),Z.add(Te)}),b=_.pop(),I!==null&&I.renderEnd(),Z},this.compileAsync=function(T,O,K=null){let Z=this.compile(T,O,K);return new Promise(J=>{function Te(){if(Z.forEach(function(Ne){let Fe=$.get(Ne).currentProgram;(Fe===void 0||Fe.isReady())&&Z.delete(Ne)}),Z.size===0){J(T);return}setTimeout(Te,10)}lt.get("KHR_parallel_shader_compile")!==null?Te():setTimeout(Te,10)})};let Nf=null;function L_(T){Nf&&Nf(T)}function gm(){Ms.stop()}function xm(){Ms.start()}let Ms=new yx;Ms.setAnimationLoop(L_),typeof self<"u"&&Ms.setContext(self),this.setAnimationLoop=function(T){Nf=T,Be.setAnimationLoop(T),T===null?Ms.stop():Ms.start()},Be.addEventListener("sessionstart",gm),Be.addEventListener("sessionend",xm),this.render=function(T,O){if(O!==void 0&&O.isCamera!==!0){ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;I!==null&&I.renderStart(T,O);let K=Be.enabled===!0&&Be.isPresenting===!0,Z=A!==null&&(j===null||K)&&A.begin(R,j);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),Be.enabled===!0&&Be.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Be.cameraAutoUpdate===!0&&Be.updateCamera(O),O=Be.getCamera()),T.isScene===!0&&T.onBeforeRender(R,T,O,j),b=ve.get(T,_.length),b.init(O),b.state.textureUnits=Q.getTextureUnits(),_.push(b),ae.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),ee.setFromProjectionMatrix(ae,wn,O.reversedDepth),se=this.localClippingEnabled,re=He.init(this.clippingPlanes,se),M=Ae.get(T,E.length),M.init(),E.push(M),Be.enabled===!0&&Be.isPresenting===!0){let Ne=R.xr.getDepthSensingMesh();Ne!==null&&Uf(Ne,O,-1/0,R.sortObjects)}Uf(T,O,0,R.sortObjects),M.finish(),I!==null&&I.updateLights(b.state.lightsArray),R.sortObjects===!0&&M.sort(he,Re),qe=Be.enabled===!1||Be.isPresenting===!1||Be.hasDepthSensing()===!1,qe&&nt.addToRenderList(M,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),re===!0&&He.beginShadows();let J=b.state.shadowsArray;if(Ze.render(J,T,O),re===!0&&He.endShadows(),(Z&&A.hasRenderPass())===!1){let Ne=M.opaque,Ee=M.transmissive;if(b.setupLights(),O.isArrayCamera){let Fe=O.cameras;if(Ee.length>0)for(let ze=0,rt=Fe.length;ze<rt;ze++){let ct=Fe[ze];ym(Ne,Ee,T,ct)}qe&&nt.render(T);for(let ze=0,rt=Fe.length;ze<rt;ze++){let ct=Fe[ze];_m(M,T,ct,ct.viewport)}}else Ee.length>0&&ym(Ne,Ee,T,O),qe&&nt.render(T),_m(M,T,O)}j!==null&&z===0&&(Q.updateMultisampleRenderTarget(j),Q.updateRenderTargetMipmap(j)),Z&&A.end(R),T.isScene===!0&&T.onAfterRender(R,T,O),Ce.resetDefaultState(),q=-1,k=null,_.pop(),_.length>0?(b=_[_.length-1],Q.setTextureUnits(b.state.textureUnits),re===!0&&He.setGlobalState(R.clippingPlanes,b.state.camera)):b=null,E.pop(),E.length>0?M=E[E.length-1]:M=null,I!==null&&I.renderEnd()};function Uf(T,O,K,Z){if(T.visible===!1)return;if(T.layers.test(O.layers)){if(T.isGroup)K=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(O);else if(T.isLightProbeGrid)b.pushLightProbeGrid(T);else if(T.isLight)b.pushLight(T),T.castShadow&&b.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(ee)){Z&&Pe.setFromMatrixPosition(T.matrixWorld).applyMatrix4(ae);let Ne=ie.update(T),Ee=T.material;Ee.visible&&M.push(T,Ne,Ee,K,Pe.z,null,O)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(ee))){let Ne=ie.update(T),Ee=T.material;if(Z&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Pe.copy(T.boundingSphere.center)):(Ne.boundingSphere===null&&Ne.computeBoundingSphere(),Pe.copy(Ne.boundingSphere.center)),Pe.applyMatrix4(T.matrixWorld).applyMatrix4(ae)),Array.isArray(Ee)){let Fe=Ne.groups;for(let ze=0,rt=Fe.length;ze<rt;ze++){let ct=Fe[ze],Oe=Ee[ct.materialIndex];Oe&&Oe.visible&&M.push(T,Ne,Oe,K,Pe.z,ct,O)}}else Ee.visible&&M.push(T,Ne,Ee,K,Pe.z,null,O)}}let Te=T.children;for(let Ne=0,Ee=Te.length;Ne<Ee;Ne++)Uf(Te[Ne],O,K,Z)}function _m(T,O,K,Z){let{opaque:J,transmissive:Te,transparent:Ne}=T;b.setupLightsView(K),re===!0&&He.setGlobalState(R.clippingPlanes,K),Z&&w.viewport(H.copy(Z)),J.length>0&&Oc(J,O,K),Te.length>0&&Oc(Te,O,K),Ne.length>0&&Oc(Ne,O,K),w.buffers.depth.setTest(!0),w.buffers.depth.setMask(!0),w.buffers.color.setMask(!0),w.setPolygonOffset(!1)}function ym(T,O,K,Z){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[Z.id]===void 0){let Oe=lt.has("EXT_color_buffer_half_float")||lt.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[Z.id]=new Qt(1,1,{generateMipmaps:!0,type:Oe?Xn:bn,minFilter:ai,samples:Math.max(4,D.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:at.workingColorSpace})}let Te=b.state.transmissionRenderTarget[Z.id],Ne=Z.viewport||H;Te.setSize(Ne.z*R.transmissionResolutionScale,Ne.w*R.transmissionResolutionScale);let Ee=R.getRenderTarget(),Fe=R.getActiveCubeFace(),ze=R.getActiveMipmapLevel();R.setRenderTarget(Te),R.getClearColor(G),le=R.getClearAlpha(),le<1&&R.setClearColor(16777215,.5),R.clear(),qe&&nt.render(K);let rt=R.toneMapping;R.toneMapping=Wn;let ct=Z.viewport;if(Z.viewport!==void 0&&(Z.viewport=void 0),b.setupLightsView(Z),re===!0&&He.setGlobalState(R.clippingPlanes,Z),Oc(T,K,Z),Q.updateMultisampleRenderTarget(Te),Q.updateRenderTargetMipmap(Te),lt.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let gt=0,Nt=O.length;gt<Nt;gt++){let At=O[gt],{object:bt,geometry:sn,material:De,group:dn}=At;if(De.side===Nn&&bt.layers.test(Z.layers)){let ut=De.side;De.side=un,De.needsUpdate=!0,vm(bt,K,Z,sn,De,dn),De.side=ut,De.needsUpdate=!0,Oe=!0}}Oe===!0&&(Q.updateMultisampleRenderTarget(Te),Q.updateRenderTargetMipmap(Te))}R.setRenderTarget(Ee,Fe,ze),R.setClearColor(G,le),ct!==void 0&&(Z.viewport=ct),R.toneMapping=rt}function Oc(T,O,K){let Z=O.isScene===!0?O.overrideMaterial:null;for(let J=0,Te=T.length;J<Te;J++){let Ne=T[J],{object:Ee,geometry:Fe,group:ze}=Ne,rt=Ne.material;rt.allowOverride===!0&&Z!==null&&(rt=Z),Ee.layers.test(K.layers)&&vm(Ee,O,K,Fe,rt,ze)}}function vm(T,O,K,Z,J,Te){I!==null&&J.isNodeMaterial&&I.setObject(T,J),T.onBeforeRender(R,O,K,Z,J,Te),T.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),J.onBeforeRender(R,O,K,Z,T,Te),J.transparent===!0&&J.side===Nn&&J.forceSinglePass===!1?(J.side=un,J.needsUpdate=!0,R.renderBufferDirect(K,O,Z,J,T,Te),J.side=ki,J.needsUpdate=!0,R.renderBufferDirect(K,O,Z,J,T,Te),J.side=Nn):R.renderBufferDirect(K,O,Z,J,T,Te),T.onAfterRender(R,O,K,Z,J,Te)}function Bc(T,O,K){O.isScene!==!0&&(O=Ue);let Z=$.get(T),J=b.state.lights,Te=b.state.shadowsArray,Ne=J.state.version,Ee=ye.getParameters(T,J.state,Te,O,K,b.state.lightProbeGridArray),Fe=ye.getProgramCacheKey(Ee),ze=Z.programs;Z.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?O.environment:null,Z.fog=O.fog;let rt=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;Z.envMap=pe.get(T.envMap||Z.environment,rt),Z.envMapRotation=Z.environment!==null&&T.envMap===null?O.environmentRotation:T.envMapRotation,ze===void 0&&(T.addEventListener("dispose",di),ze=new Map,Z.programs=ze);let ct=ze.get(Fe);if(ct!==void 0){if(Z.currentProgram===ct&&Z.lightsStateVersion===Ne)return Mm(T,Ee),ct}else Ee.uniforms=ye.getUniforms(T),I!==null&&T.isNodeMaterial&&I.build(T,K,Ee),T.onBeforeCompile(Ee,R),ct=ye.acquireProgram(Ee,Fe),ze.set(Fe,ct),Z.uniforms=Ee.uniforms;let Oe=Z.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Oe.clippingPlanes=He.uniform),Mm(T,Ee),Z.needsLights=F_(T),Z.lightsStateVersion=Ne,Z.needsLights&&(Oe.ambientLightColor.value=J.state.ambient,Oe.lightProbe.value=J.state.probe,Oe.sunLights.value=J.state.sun,Oe.sunLightShadows.value=J.state.sunShadow,Oe.directionalLights.value=J.state.directional,Oe.directionalLightShadows.value=J.state.directionalShadow,Oe.spotLights.value=J.state.spot,Oe.spotLightShadows.value=J.state.spotShadow,Oe.rectAreaLights.value=J.state.rectArea,Oe.ltc_1.value=J.state.rectAreaLTC1,Oe.ltc_2.value=J.state.rectAreaLTC2,Oe.pointLights.value=J.state.point,Oe.pointLightShadows.value=J.state.pointShadow,Oe.hemisphereLights.value=J.state.hemi,Oe.sunShadowMatrix.value=J.state.sunShadowMatrix,Oe.sunShadowCascade.value=J.state.sunShadowCascade,Oe.directionalShadowMatrix.value=J.state.directionalShadowMatrix,Oe.spotLightMatrix.value=J.state.spotLightMatrix,Oe.spotLightMap.value=J.state.spotLightMap,Oe.pointShadowMatrix.value=J.state.pointShadowMatrix),Z.lightProbeGrid=b.state.lightProbeGridArray.length>0,Z.currentProgram=ct,Z.uniformsList=null,ct}function bm(T){if(T.uniformsList===null){let O=T.currentProgram.getUniforms();T.uniformsList=Po.seqWithValue(O.seq,T.uniforms)}return T.uniformsList}function Mm(T,O){let K=$.get(T);K.outputColorSpace=O.outputColorSpace,K.batching=O.batching,K.batchingColor=O.batchingColor,K.instancing=O.instancing,K.instancingColor=O.instancingColor,K.instancingMorph=O.instancingMorph,K.skinning=O.skinning,K.morphTargets=O.morphTargets,K.morphNormals=O.morphNormals,K.morphColors=O.morphColors,K.morphTargetsCount=O.morphTargetsCount,K.numClippingPlanes=O.numClippingPlanes,K.numIntersection=O.numClipIntersection,K.vertexAlphas=O.vertexAlphas,K.vertexTangents=O.vertexTangents,K.toneMapping=O.toneMapping}function D_(T,O){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;v.setFromMatrixPosition(O.matrixWorld);for(let K=0,Z=T.length;K<Z;K++){let J=T[K];if(J.texture!==null&&J.boundingBox.containsPoint(v))return J}return null}function N_(T,O,K,Z,J){O.isScene!==!0&&(O=Ue),Q.resetTextureUnits();let Te=O.fog,Ne=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial?O.environment:null,Ee=j===null?R.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:at.workingColorSpace,Fe=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial&&!Z.envMap||Z.isMeshPhongMaterial&&!Z.envMap,ze=pe.get(Z.envMap||Ne,Fe),rt=Z.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,ct=!!K.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),Oe=!!K.morphAttributes.position,gt=!!K.morphAttributes.normal,Nt=!!K.morphAttributes.color,At=Wn;Z.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(At=R.toneMapping);let bt=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,sn=bt!==void 0?bt.length:0,De=$.get(Z),dn=b.state.lights;if(re===!0&&(se===!0||T!==k)){let St=T===k&&Z.id===q;He.setState(Z,T,St)}let ut=!1;Z.version===De.__version?(De.needsLights&&De.lightsStateVersion!==dn.state.version||De.outputColorSpace!==Ee||J.isBatchedMesh&&De.batching===!1||!J.isBatchedMesh&&De.batching===!0||J.isBatchedMesh&&De.batchingColor===!0&&J._colorsTexture===null||J.isBatchedMesh&&De.batchingColor===!1&&J._colorsTexture!==null||J.isInstancedMesh&&De.instancing===!1||!J.isInstancedMesh&&De.instancing===!0||J.isSkinnedMesh&&De.skinning===!1||!J.isSkinnedMesh&&De.skinning===!0||J.isInstancedMesh&&De.instancingColor===!0&&J.instanceColor===null||J.isInstancedMesh&&De.instancingColor===!1&&J.instanceColor!==null||J.isInstancedMesh&&De.instancingMorph===!0&&J.morphTexture===null||J.isInstancedMesh&&De.instancingMorph===!1&&J.morphTexture!==null||De.envMap!==ze||Z.fog===!0&&De.fog!==Te||De.numClippingPlanes!==void 0&&(De.numClippingPlanes!==He.numPlanes||De.numIntersection!==He.numIntersection)||De.vertexAlphas!==rt||De.vertexTangents!==ct||De.morphTargets!==Oe||De.morphNormals!==gt||De.morphColors!==Nt||De.toneMapping!==At||De.morphTargetsCount!==sn||!!De.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(ut=!0):(ut=!0,De.__version=Z.version);let Bn=De.currentProgram;ut===!0&&(Bn=Bc(Z,O,J),I&&Z.isNodeMaterial&&I.onUpdateProgram(Z,Bn,De));let pi=!1,Yi=!1,cr=!1,vt=Bn.getUniforms(),Lt=De.uniforms;if(w.useProgram(Bn.program)&&(pi=!0,Yi=!0,cr=!0),Z.id!==q&&(q=Z.id,Yi=!0),De.needsLights){let St=D_(b.state.lightProbeGridArray,J);De.lightProbeGrid!==St&&(De.lightProbeGrid=St,Yi=!0)}if(pi||k!==T){w.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),vt.setValue(F,"projectionMatrix",T.projectionMatrix),vt.setValue(F,"viewMatrix",T.matrixWorldInverse);let Ji=vt.map.cameraPosition;Ji!==void 0&&Ji.setValue(F,fe.setFromMatrixPosition(T.matrixWorld)),D.logarithmicDepthBuffer&&vt.setValue(F,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)&&vt.setValue(F,"isOrthographic",T.isOrthographicCamera===!0),k!==T&&(k=T,Yi=!0,cr=!0)}if(De.needsLights&&(dn.state.sunShadowMap.length>0&&vt.setValue(F,"sunShadowMap",dn.state.sunShadowMap,Q),dn.state.directionalShadowMap.length>0&&vt.setValue(F,"directionalShadowMap",dn.state.directionalShadowMap,Q),dn.state.spotShadowMap.length>0&&vt.setValue(F,"spotShadowMap",dn.state.spotShadowMap,Q),dn.state.pointShadowMap.length>0&&vt.setValue(F,"pointShadowMap",dn.state.pointShadowMap,Q)),J.isSkinnedMesh){vt.setOptional(F,J,"bindMatrix"),vt.setOptional(F,J,"bindMatrixInverse");let St=J.skeleton;St&&(St.boneTexture===null&&St.computeBoneTexture(),vt.setValue(F,"boneTexture",St.boneTexture,Q))}J.isBatchedMesh&&(vt.setOptional(F,J,"batchingTexture"),vt.setValue(F,"batchingTexture",J._matricesTexture,Q),vt.setOptional(F,J,"batchingIdTexture"),vt.setValue(F,"batchingIdTexture",J._indirectTexture,Q),vt.setOptional(F,J,"batchingColorTexture"),J._colorsTexture!==null&&vt.setValue(F,"batchingColorTexture",J._colorsTexture,Q));let Zi=K.morphAttributes;if((Zi.position!==void 0||Zi.normal!==void 0||Zi.color!==void 0)&&V.update(J,K,Bn),(Yi||De.receiveShadow!==J.receiveShadow)&&(De.receiveShadow=J.receiveShadow,vt.setValue(F,"receiveShadow",J.receiveShadow)),(Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial)&&Z.envMap===null&&O.environment!==null&&(Lt.envMapIntensity.value=O.environmentIntensity),Lt.dfgLUT!==void 0&&(Lt.dfgLUT.value=bw()),Yi){if(vt.setValue(F,"toneMappingExposure",R.toneMappingExposure),De.needsLights&&U_(Lt,cr),Te&&Z.fog===!0&&Ge.refreshFogUniforms(Lt,Te),Ge.refreshMaterialUniforms(Lt,Z,Y,X,b.state.transmissionRenderTarget[T.id]),De.needsLights&&De.lightProbeGrid){let St=De.lightProbeGrid;Lt.probesSH.value=St.texture,Lt.probesMin.value.copy(St.boundingBox.min),Lt.probesMax.value.copy(St.boundingBox.max),Lt.probesResolution.value.copy(St.resolution)}Po.upload(F,bm(De),Lt,Q)}if(Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0&&(Po.upload(F,bm(De),Lt,Q),Z.uniformsNeedUpdate=!1),Z.isSpriteMaterial&&vt.setValue(F,"center",J.center),vt.setValue(F,"modelViewMatrix",J.modelViewMatrix),vt.setValue(F,"normalMatrix",J.normalMatrix),vt.setValue(F,"modelMatrix",J.matrixWorld),Z.uniformsGroups!==void 0){let St=Z.uniformsGroups;for(let Ji=0,ur=St.length;Ji<ur;Ji++){let wm=St[Ji];ce.update(wm,Bn),ce.bind(wm,Bn)}}return Bn}function U_(T,O){T.ambientLightColor.needsUpdate=O,T.lightProbe.needsUpdate=O,T.sunLights.needsUpdate=O,T.sunLightShadows.needsUpdate=O,T.directionalLights.needsUpdate=O,T.directionalLightShadows.needsUpdate=O,T.pointLights.needsUpdate=O,T.pointLightShadows.needsUpdate=O,T.spotLights.needsUpdate=O,T.spotLightShadows.needsUpdate=O,T.rectAreaLights.needsUpdate=O,T.hemisphereLights.needsUpdate=O}function F_(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return B},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(T,O,K){let Z=$.get(T);Z.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,Z.__autoAllocateDepthBuffer===!1&&(Z.__useRenderToTexture=!1),$.get(T.texture).__webglTexture=O,$.get(T.depthTexture).__webglTexture=Z.__autoAllocateDepthBuffer?void 0:K,Z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,O){let K=$.get(T);K.__webglFramebuffer=O,K.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(T,O=0,K=0){j=T,B=O,z=K;let Z=null,J=!1,Te=!1;if(T){let Ee=$.get(T);if(Ee.__useDefaultFramebuffer!==void 0){w.bindFramebuffer(F.FRAMEBUFFER,Ee.__webglFramebuffer),H.copy(T.viewport),ue.copy(T.scissor),de=T.scissorTest,w.viewport(H),w.scissor(ue),w.setScissorTest(de),q=-1;return}else if(Ee.__webglFramebuffer===void 0)Q.setupRenderTarget(T);else if(Ee.__hasExternalTextures)Q.rebindTextures(T,$.get(T.texture).__webglTexture,$.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let rt=T.depthTexture;if(Ee.__boundDepthTexture!==rt){if(rt!==null&&$.has(rt)&&(T.width!==rt.image.width||T.height!==rt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Q.setupDepthRenderbuffer(T)}}let Fe=T.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(Te=!0);let ze=$.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(ze[O])?Z=ze[O][K]:Z=ze[O],J=!0):T.samples>0&&Q.useMultisampledRTT(T)===!1?Z=$.get(T).__webglMultisampledFramebuffer:Array.isArray(ze)?Z=ze[K]:Z=ze,H.copy(T.viewport),ue.copy(T.scissor),de=T.scissorTest}else H.copy(me).multiplyScalar(Y).floor(),ue.copy(Ie).multiplyScalar(Y).floor(),de=je;if(K!==0&&(Z=P),w.bindFramebuffer(F.FRAMEBUFFER,Z)&&w.drawBuffers(T,Z),w.viewport(H),w.scissor(ue),w.setScissorTest(de),J){let Ee=$.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+O,Ee.__webglTexture,K)}else if(Te){let Ee=O;for(let Fe=0;Fe<T.textures.length;Fe++){let ze=$.get(T.textures[Fe]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+Fe,ze.__webglTexture,K,Ee)}}else if(T!==null&&K!==0){let Ee=$.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Ee.__webglTexture,K)}q=-1};function Sm(T){let O=$.get(T);return(O.__readFormat!==T.format||O.__readType!==T.type)&&(O.__readFormat=T.format,O.__readType=T.type,O.__formatReadable=D.textureFormatReadable(T.format),O.__typeReadable=D.textureTypeReadable(T.type)),O}this.readRenderTargetPixels=function(T,O,K,Z,J,Te,Ne,Ee=0){if(!(T&&T.isWebGLRenderTarget)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Fe=$.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ne!==void 0&&(Fe=Fe[Ne]),Fe){w.bindFramebuffer(F.FRAMEBUFFER,Fe);try{let ze=T.textures[Ee],rt=ze.format,ct=ze.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Ee);let Oe=Sm(ze);if(Oe.__formatReadable===!1){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Oe.__typeReadable===!1){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=T.width-Z&&K>=0&&K<=T.height-J&&F.readPixels(O,K,Z,J,Me.convert(rt),Me.convert(ct),Te)}finally{let ze=j!==null?$.get(j).__webglFramebuffer:null;w.bindFramebuffer(F.FRAMEBUFFER,ze)}}},this.readRenderTargetPixelsAsync=async function(T,O,K,Z,J,Te,Ne,Ee=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Fe=$.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ne!==void 0&&(Fe=Fe[Ne]),Fe)if(O>=0&&O<=T.width-Z&&K>=0&&K<=T.height-J){w.bindFramebuffer(F.FRAMEBUFFER,Fe);let ze=T.textures[Ee],rt=ze.format,ct=ze.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Ee);let Oe=Sm(ze);if(Oe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Oe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let gt=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,gt),F.bufferData(F.PIXEL_PACK_BUFFER,Te.byteLength,F.STREAM_READ),F.readPixels(O,K,Z,J,Me.convert(rt),Me.convert(ct),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let Nt=j!==null?$.get(j).__webglFramebuffer:null;w.bindFramebuffer(F.FRAMEBUFFER,Nt);let At=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await kg(F,At,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,gt),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,Te),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(gt),F.deleteSync(At),Te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,O=null,K=0){let Z=Math.pow(2,-K),J=Math.floor(T.image.width*Z),Te=Math.floor(T.image.height*Z),Ne=O!==null?O.x:0,Ee=O!==null?O.y:0;Q.setTexture2D(T,0),F.copyTexSubImage2D(F.TEXTURE_2D,K,0,0,Ne,Ee,J,Te),w.unbindTexture()},this.copyTextureToTexture=function(T,O,K=null,Z=null,J=0,Te=0){let Ne,Ee,Fe,ze,rt,ct,Oe,gt,Nt,At=T.isCompressedTexture?T.mipmaps[Te]:T.image;if(K!==null)Ne=K.max.x-K.min.x,Ee=K.max.y-K.min.y,Fe=K.isBox3?K.max.z-K.min.z:1,ze=K.min.x,rt=K.min.y,ct=K.isBox3?K.min.z:0;else{let Lt=Math.pow(2,-J);Ne=Math.floor(At.width*Lt),Ee=Math.floor(At.height*Lt),T.isDataArrayTexture?Fe=At.depth:T.isData3DTexture?Fe=Math.floor(At.depth*Lt):Fe=1,ze=0,rt=0,ct=0}Z!==null?(Oe=Z.x,gt=Z.y,Nt=Z.z):(Oe=0,gt=0,Nt=0);let bt=Me.convert(O.format),sn=Me.convert(O.type),De;O.isData3DTexture?(Q.setTexture3D(O,0),De=F.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Q.setTexture2DArray(O,0),De=F.TEXTURE_2D_ARRAY):(Q.setTexture2D(O,0),De=F.TEXTURE_2D),w.activeTexture(F.TEXTURE0),w.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,O.flipY),w.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),w.pixelStorei(F.UNPACK_ALIGNMENT,O.unpackAlignment);let dn=w.getParameter(F.UNPACK_ROW_LENGTH),ut=w.getParameter(F.UNPACK_IMAGE_HEIGHT),Bn=w.getParameter(F.UNPACK_SKIP_PIXELS),pi=w.getParameter(F.UNPACK_SKIP_ROWS),Yi=w.getParameter(F.UNPACK_SKIP_IMAGES);w.pixelStorei(F.UNPACK_ROW_LENGTH,At.width),w.pixelStorei(F.UNPACK_IMAGE_HEIGHT,At.height),w.pixelStorei(F.UNPACK_SKIP_PIXELS,ze),w.pixelStorei(F.UNPACK_SKIP_ROWS,rt),w.pixelStorei(F.UNPACK_SKIP_IMAGES,ct);let cr=T.isDataArrayTexture||T.isData3DTexture,vt=O.isDataArrayTexture||O.isData3DTexture;if(T.isDepthTexture){let Lt=$.get(T),Zi=$.get(O),St=$.get(Lt.__renderTarget),Ji=$.get(Zi.__renderTarget);w.bindFramebuffer(F.READ_FRAMEBUFFER,St.__webglFramebuffer),w.bindFramebuffer(F.DRAW_FRAMEBUFFER,Ji.__webglFramebuffer);for(let ur=0;ur<Fe;ur++)cr&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,$.get(T).__webglTexture,J,ct+ur),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,$.get(O).__webglTexture,Te,Nt+ur)),F.blitFramebuffer(ze,rt,Ne,Ee,Oe,gt,Ne,Ee,F.DEPTH_BUFFER_BIT,F.NEAREST);w.bindFramebuffer(F.READ_FRAMEBUFFER,null),w.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(J!==0||T.isRenderTargetTexture||$.has(T)){let Lt=$.get(T),Zi=$.get(O);w.bindFramebuffer(F.READ_FRAMEBUFFER,C),w.bindFramebuffer(F.DRAW_FRAMEBUFFER,U);for(let St=0;St<Fe;St++)cr?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Lt.__webglTexture,J,ct+St):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Lt.__webglTexture,J),vt?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Zi.__webglTexture,Te,Nt+St):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Zi.__webglTexture,Te),J!==0?F.blitFramebuffer(ze,rt,Ne,Ee,Oe,gt,Ne,Ee,F.COLOR_BUFFER_BIT,F.NEAREST):vt?F.copyTexSubImage3D(De,Te,Oe,gt,Nt+St,ze,rt,Ne,Ee):F.copyTexSubImage2D(De,Te,Oe,gt,ze,rt,Ne,Ee);w.bindFramebuffer(F.READ_FRAMEBUFFER,null),w.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else vt?T.isDataTexture||T.isData3DTexture?F.texSubImage3D(De,Te,Oe,gt,Nt,Ne,Ee,Fe,bt,sn,At.data):O.isCompressedArrayTexture?F.compressedTexSubImage3D(De,Te,Oe,gt,Nt,Ne,Ee,Fe,bt,At.data):F.texSubImage3D(De,Te,Oe,gt,Nt,Ne,Ee,Fe,bt,sn,At):T.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,Te,Oe,gt,Ne,Ee,bt,sn,At.data):T.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,Te,Oe,gt,At.width,At.height,bt,At.data):F.texSubImage2D(F.TEXTURE_2D,Te,Oe,gt,Ne,Ee,bt,sn,At);w.pixelStorei(F.UNPACK_ROW_LENGTH,dn),w.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ut),w.pixelStorei(F.UNPACK_SKIP_PIXELS,Bn),w.pixelStorei(F.UNPACK_SKIP_ROWS,pi),w.pixelStorei(F.UNPACK_SKIP_IMAGES,Yi),Te===0&&O.generateMipmaps&&F.generateMipmap(De),w.unbindTexture()},this.initRenderTarget=function(T){$.get(T).__webglFramebuffer===void 0&&Q.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?Q.setTextureCube(T,0):T.isData3DTexture?Q.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?Q.setTexture2DArray(T,0):Q.setTexture2D(T,0),w.unbindTexture()},this.resetState=function(){B=0,z=0,j=null,w.reset(),Ce.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=at._getDrawingBufferColorSpace(e),t.unpackColorSpace=at._getUnpackColorSpace()}};var Xe=(i,e,t,n,s,r=!1,o=.6)=>({name:i,color:e,tex:t,scale:n,roughness:s,tintable:r,relief:o}),vc={wood:Xe("Light wood",14203279,"planks_light",2.4,.55),oak:Xe("Oak",13214325,"planks_oak",2.4,.5),walnut:Xe("Walnut",8084033,"planks_walnut",2.4,.45),grey_wood:Xe("Grey wood",11775397,"planks_grey",2.4,.6),herringbone:Xe("Herringbone",12819052,"herringbone",1.12,.5),tiles:Xe("Light tiles",14343128,"tiles_light",1.2,.35),tiles_dark:Xe("Dark tiles",6119267,"tiles_dark",1.2,.35),terracotta:Xe("Terracotta",12086603,"tiles_terracotta",1.2,.7),marble:Xe("Marble",15263457,"marble",1.6,.18),checker:Xe("Checkerboard",10132120,"checker",1.2,.35),carpet:Xe("Carpet",12169896,"carpet",1,.95,!0,.3),stone:Xe("Stone",12039083,"flagstone",2,.75),concrete:Xe("Concrete",12434877,"concrete",3,.8,!0,.2),vinyl:Xe("Vinyl",13157046,"vinyl",1.2,.5,!0,.1)},bc={paint:Xe("Paint",16052974,"plaster",2,.9,!0,.15),wallpaper_stripes:Xe("Striped wallpaper",15327956,"wp_stripes",.53,.85,!0,.05),wallpaper_damask:Xe("Damask wallpaper",14273974,"wp_damask",.53,.85,!0,.08),wallpaper_geo:Xe("Geometric wallpaper",14212310,"wp_geo",.53,.85,!0,.05),wallpaper_leaves:Xe("Leaf wallpaper",13621446,"wp_leaves",.53,.85,!0,.05),panelling:Xe("Panelling",15263455,"panelling",2.4,.7,!0,.7),tiles:Xe("Wall tiles",15921904,"tiles_metro",.6,.25,!0,.6),brick:Xe("Exposed brick",10902852,"brick_red",1.35,.85,!1,.9),wood:Xe("Wood cladding",11569248,"boards_v",1.2,.6,!1,.6),concrete:Xe("Concrete",12171702,"concrete",3,.8,!0,.25)},ci={render:Xe("Render",15129807,"render",2,.9,!0,.25),brick:Xe("Red brick",10902852,"brick_red",1.35,.85,!1,.9),brick_buff:Xe("Buff brick",13216121,"brick_buff",1.35,.85,!1,.9),brick_white:Xe("Painted brick",15526628,"brick_painted",1.35,.8,!0,.7),stone:Xe("Stone",11905944,"stone_wall",2,.85,!1,1),composite:Xe("Composite cladding",7304056,"boards_h",1.2,.55,!0,.7),timber:Xe("Timber cladding",10976081,"timber_h",1.2,.65,!1,.7),concrete:Xe("Concrete",11842736,"concrete_panels",3,.75,!0,.35),pebbledash:Xe("Pebbledash",14275268,"pebbledash",1,.95,!0,1)},Mc={fabric:Xe("Fabric",10134445,"weave",.3,.95,!0,.3),linen:Xe("Linen",13616821,"linen",.25,.92,!0,.3),velvet:Xe("Velvet",4152150,"velvet",.5,.75,!0,.15),boucle:Xe("Boucl\xE9",15525594,"boucle",.25,1,!0,.8),leather:Xe("Leather",7030320,"leather",.6,.45,!0,.35)},ms={painted:Xe("Painted wood",15855594,"plaster",1,.5,!0,.05),upvc:Xe("uPVC",15987438,"",1,.35,!0),aluminium:{...Xe("Aluminium",11120050,"brushed",.5,.35,!0,.1),metalness:.6},oak:Xe("Oak",12819052,"wood_grain_v",.9,.5,!1,.25),ash:Xe("Light wood",14270618,"wood_grain_v",.9,.5,!1,.2),walnut:Xe("Walnut",7229240,"wood_grain_v",.9,.45,!1,.25)},Sc={concrete_tiles:Xe("Concrete tiles",6971996,"roof_interlocking",1.5,.85,!0,.9),clay_plain:Xe("Clay plain tiles",10114362,"roof_plain",1.2,.8,!0,.8),slate:Xe("Slate",4935512,"roof_slate",1.5,.6,!1,.7),pantiles:Xe("Clay pantiles",11558973,"roof_pantile",1.4,.75,!0,1),thatch:Xe("Thatch",11770466,"roof_thatch",2,1,!1,1),metal:{...Xe("Standing seam metal",4080456,"roof_seam",1.6,.45,!0,.5),metalness:.4},felt:Xe("Mineral felt",3882304,"roof_felt",2,.95,!0,.4),epdm:Xe("Rubber (EPDM)",2829359,"roof_epdm",3,.8,!1,.15),grp:Xe("Fibreglass (GRP)",6185576,"roof_grp",3,.5,!0,.15),lead:Xe("Lead",8159880,"roof_lead",1.6,.6,!1,.4),sedum:Xe("Green roof (sedum)",7113546,"roof_sedum",1.5,1,!1,.8),glass:Xe("Glass (conservatory)",11128802,"",1,.05,!1)},hE=[["Pure white","#f5f4f0"],["Warm white","#efe8dc"],["Greige","#d5cdc0"],["Stone","#bdb5a6"],["Sage","#b3bfa3"],["Duck egg","#c3d6d1"],["Sky","#bcd0e2"],["Dusty pink","#dbbdb3"],["Terracotta","#c47a5a"],["Mustard","#d2a54a"],["Forest","#3e5747"],["Navy","#2f3d56"],["Charcoal","#4a4c50"],["Black","#26272a"]],fE=[["Light grey","#b9bec4"],["Grey","#8a9099"],["Charcoal","#4b4f56"],["Cream","#e6dfd0"],["Sand","#cbb595"],["Tan","#a8784f"],["Brown","#6b4630"],["Olive","#7c7f52"],["Green","#41624f"],["Teal","#2f6b6b"],["Navy","#2c3c5a"],["Blue","#5a7fa8"],["Rust","#a4553a"],["Mustard","#c99b3c"],["Blush","#d6aaa0"],["Oak","#c9a275"],["Walnut","#6e4f38"],["White","#f1efea"],["Black","#2b2c2f"]],dE=[["White","#f3f2ee"],["Cream","#e8e1d0"],["Agate grey","#b5b8b1"],["Anthracite","#383e42"],["Black","#26272a"],["Chartwell green","#a9bfae"],["Sage","#9aa58b"],["Duck egg","#c3d6d1"],["Racing green","#2f4a3a"],["Navy","#2c3c5a"],["Red","#8e2b2b"],["Mustard","#d2a54a"],["Pink","#d9a9a3"]],pE=[["Slate grey","#4b4f58"],["Charcoal","#35373b"],["Staffordshire blue","#3c4049"],["Smooth brown","#5e4a3f"],["Rustic red","#8f4a34"],["Terracotta","#b0603d"],["Antique brown","#6e5345"],["Sandfaced","#a0765a"],["Anthracite","#383e42"],["Moss green","#5d6b4f"]],mE=[["White","#f3f2ee"],["Black","#26272a"],["Anthracite","#383e42"],["Brown","#5a4636"],["Rosewood","#6b3a2e"],["Cream","#e8e1d0"]];function gE(i){let[e,t]=i.split(":");switch(e){case"floor":return vc[t]??vc.wood;case"wall":return bc[t]??bc.paint;case"ext":return ci[t]??ci.render;case"uph":return Mc[t]??Mc.fabric;case"jn":return ms[t]??ms.painted;case"roof":return Sc[t]??Sc.concrete_tiles;default:return null}}function fn(i){if(!i)return null;let e=/^#?([0-9a-f]{6})$/i.exec(i.trim());return e?parseInt(e[1],16):null}var Xp=64,mf=128,gs=512,pf=256;function yE(){return{uCut:{value:new Float32Array(mf)},uCutY:{value:1.1},uFloorY:{value:0},uCutColor:{value:new Se(4079944)},uTint:{value:new Float32Array(Xp*4)},uDim:{value:1},uIndoor:{value:0}}}var Sw=`
attribute float aRoom;
attribute float aWall;
uniform float uCut[${mf}];
uniform float uCutY;
uniform float uFloorY;
uniform vec4 uTint[${Xp}];
varying vec4 vTint;
varying float vCapCut;
`,ww=`
vCapCut = 0.0;
if (aWall >= 0.0) {
  float hang = step(${gs-.5}, aWall);
  float wall = aWall - ${gs}.0 * hang;
  float trim = step(${pf-.5}, wall);
  wall -= ${pf}.0 * trim;
  float slot = floor(wall * 0.5 + 0.01);
  float cut = uCut[int(slot)];
  if (cut > 0.001) {
    transformed.y = mix(transformed.y, min(transformed.y, uCutY - 0.003 * trim), cut);
    if (hang > 0.5 && cut > 0.999) transformed.y = uFloorY - 0.01;
    if (wall - slot * 2.0 > 0.5) vCapCut = cut;
  }
}
vTint = aRoom >= -0.5 ? uTint[int(aRoom + 0.5)] : vec4(0.0);
`,Aw=`
uniform vec3 uCutColor;
uniform float uDim;
varying vec4 vTint;
varying float vCapCut;
`,Ew=`
diffuseColor.rgb = mix(diffuseColor.rgb, uCutColor, vCapCut);
diffuseColor.rgb = mix(diffuseColor.rgb, vTint.rgb, vTint.a);
diffuseColor.rgb *= uDim;
`;function Tx(i,e,t){return i.onBeforeCompile=n=>{Object.assign(n.uniforms,e),n.vertexShader=Sw+n.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
`+ww),n.fragmentShader=Aw+n.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
`+Ew)},i.customProgramCacheKey=()=>t,i}function vE(i){return Tx(new En({vertexColors:!0}),i,"vh-opaque")}function bE(i){return Tx(new En({vertexColors:!0,transparent:!0,opacity:.55,depthWrite:!1,side:Nn,forceSinglePass:!0}),i,"vh-glass")}function ME(i,e,t){e>=0&&e<mf&&(i.uCut.value[e]=t)}function SE(i,e){return e>=0&&e<mf?i.uCut.value[e]:0}function wE(i,e,t,n,s,r){if(e<0||e>=Xp)return;let o=i.uTint.value;o[e*4]=t,o[e*4+1]=n,o[e*4+2]=s,o[e*4+3]=r}var pt=-1,xs=-2;function Tw(i){return i[1]>.5?1:i[1]<-.5?.62:.84+.14*(i[0]*-.55+i[2]*-.83)}var Hi=class{constructor(){this.pos=[];this.nrm=[];this.base=[];this.albedo=[];this.ao=[];this.uv=[];this.mat=[];this.room=[];this.wall=[];this.glow=[];this.item=[];this.currentItem=-1;this.currentMat=0;this.surfaces=[];this.uvY0=0;this.uvFrame=null;this.idx=[];this.surfaceIndex=new Map}useSurface(e){let t=this.surfaceIndex.get(e);t===void 0&&(t=this.surfaces.length,this.surfaces.push(e),this.surfaceIndex.set(e,t)),this.currentMat=t}get vertexCount(){return this.room.length}vertex(e,t,n,s,r=-1,o=-1,a=1){this.pos.push(e[0],e[1],e[2]),this.nrm.push(t[0],t[1],t[2]);let l=Tw(t)*a;this.base.push(n[0]*l,n[1]*l,n[2]*l),this.albedo.push(n[0],n[1],n[2]),this.ao.push(a);let c=this.uvFrame;if(t[1]>.7||t[1]<-.7)c?this.uv.push(e[0]*c.c+e[2]*c.s-c.ou,-e[0]*c.s+e[2]*c.c-c.ov):this.uv.push(e[0],e[2]);else{let u=Math.hypot(t[0],t[2])||1;this.uv.push((e[0]*-t[2]+e[2]*t[0])/u,e[1]-this.uvY0)}return this.mat.push(this.currentMat),this.room.push(s),this.wall.push(r),this.glow.push(o),this.item.push(this.currentItem),this.room.length-1}occlude(e,t){this.ao[e]*=t,this.base[e*3]*=t,this.base[e*3+1]*=t,this.base[e*3+2]*=t}tri(e,t,n,s){let r=this.pos,o=r[t*3]-r[e*3],a=r[t*3+1]-r[e*3+1],l=r[t*3+2]-r[e*3+2],c=r[n*3]-r[e*3],u=r[n*3+1]-r[e*3+1],f=r[n*3+2]-r[e*3+2],h=a*f-l*u,d=l*c-o*f,p=o*u-a*c;h*s[0]+d*s[1]+p*s[2]>=0?this.idx.push(e,t,n):this.idx.push(e,n,t)}quad(e,t,n,s,r,o,a,l=-1,c=-1,u=1,f=1,h=1){let d=this.vertexCount;for(let x=0;x<=f;x++){let m=x/f;for(let g=0;g<=u;g++){let y=g/u,S=e[0]+(t[0]-e[0])*y,v=e[1]+(t[1]-e[1])*y,M=e[2]+(t[2]-e[2])*y,b=s[0]+(n[0]-s[0])*y,E=s[1]+(n[1]-s[1])*y,_=s[2]+(n[2]-s[2])*y;this.vertex([S+(b-S)*m,v+(E-v)*m,M+(_-M)*m],r,o,a,l,c,h)}}let p=u+1;for(let x=0;x<f;x++)for(let m=0;m<u;m++){let g=d+x*p+m;this.tri(g,g+1,g+p+1,r),this.tri(g,g+p+1,g+p,r)}}toBufferGeometry(){let e=new Ke;return e.setAttribute("position",new tt(new Float32Array(this.pos),3)),e.setAttribute("color",new tt(new Float32Array(this.base),3)),e.setAttribute("aRoom",new tt(new Float32Array(this.room),1)),e.setAttribute("aWall",new tt(new Float32Array(this.wall),1)),e.setIndex(this.index(this.idx)),e.computeBoundingSphere(),e}toRealisticGeometry(e){let t=new Ke,n=this.vertexCount;t.setAttribute("position",new tt(new Float32Array(this.pos),3)),t.setAttribute("normal",new tt(new Float32Array(this.nrm),3)),t.setAttribute("uv",new tt(new Float32Array(this.uv),2));let s=new Float32Array(n*3);for(let c=0;c<n;c++){let u=this.ao[c];e(this.mat[c])?s[c*3]=s[c*3+1]=s[c*3+2]=u:(s[c*3]=this.albedo[c*3]*u,s[c*3+1]=this.albedo[c*3+1]*u,s[c*3+2]=this.albedo[c*3+2]*u)}t.setAttribute("color",new tt(s,3)),t.setAttribute("aLamp",new tt(new Float32Array(n*3),3)),t.setAttribute("aEmis",new tt(new Float32Array(n*3),3)),t.setAttribute("aRoom",new tt(new Float32Array(this.room),1)),t.setAttribute("aWall",new tt(new Float32Array(this.wall),1));let r=[];for(let c=0;c<this.idx.length;c+=3)r.push([this.mat[this.idx[c]],this.idx[c],this.idx[c+1],this.idx[c+2]]);r.sort((c,u)=>c[0]-u[0]);let o=[],a=0,l=r.length?r[0][0]:0;return r.forEach((c,u)=>{c[0]!==l&&(t.addGroup(a,u*3-a,l),a=u*3,l=c[0]),o.push(c[1],c[2],c[3])}),r.length&&t.addGroup(a,r.length*3-a,l),t.setIndex(this.index(o)),t.computeBoundingSphere(),t}index(e){return this.vertexCount>65535?new tt(new Uint32Array(e),1):new tt(new Uint16Array(e),1)}};var CE={bullet:"a camera on a bracket on its wall",dome:"a dome on the ceiling",doorbell:"a doorbell on its wall",cube:"a camera on a stand"},Rw=/doorbell|door_?bell|front_?door|door_?station|intercom/i,Cw=.6,Iw={bullet:90,dome:360,doorbell:150,cube:110},Pw={bullet:7,dome:4,doorbell:6,cube:6},rr=.11,or=.085;function gf(i){return(Math.atan2(-i[0],i[1])*180/Math.PI+360)%360}function xf(i){let e=i*Math.PI/180;return[-Math.sin(e),Math.cos(e)]}function Lw(i,e,t,n){let s=null;for(let r of i.walls){let o=r.b[0]-r.a[0],a=r.b[1]-r.a[1],l=o*o+a*a;if(l<1e-6)continue;let c=Math.max(0,Math.min(1,((e[0]-r.a[0])*o+(e[1]-r.a[1])*a)/l)),u=[r.a[0]+o*c,r.a[1]+a*c],f=(e[0]-u[0])*r.normal[0]+(e[1]-u[1])*r.normal[1],h=Math.max(0,Math.hypot(e[0]-u[0],e[1]-u[1])-r.thickness/2);if(h>Cw||s&&h>=s.gap)continue;let d=Math.sign(f);Math.abs(f)<.001&&(t?d=Math.sign(t[0]*r.normal[0]+t[1]*r.normal[1])||1:d=n>=0&&r.roomB===n?-1:1);let p=[r.normal[0]*d+0,r.normal[1]*d+0];s={gap:h,at:[u[0]+p[0]*r.thickness/2,u[1]+p[1]*r.thickness/2],out:p}}return s&&{at:s.at,out:s.out}}function Rx(i,e,t){let n=[t.x,t.z],s=i.rooms.findIndex(m=>Kt(n,m.points)),r=t.rotation!==null&&t.rotation!==void 0?xf(t.rotation):null,o=t.mount==="ceiling"?"dome":Rw.test(t.entity)?"doorbell":t.mount==="table"||t.mount==="floor"?"cube":"bullet",a=o==="bullet"||o==="doorbell"?Lw(e,n,r,s):null;!a&&o==="bullet"&&(o="cube");let l=s>=0?i.rooms[s]:null,c=t.rotation??(a?gf(a.out):l&&o==="cube"?Dw(n,Im(l.points)):0),u=xf(c),f=o==="dome"?i.height-.065:o==="doorbell"?1.4:o==="bullet"?2.2:t.mount==="floor"?.1:t.mount==="table"?.85:1,h=t.y??f,d=n;a&&o==="bullet"?d=[a.at[0]+a.out[0]*rr+u[0]*or,a.at[1]+a.out[1]*rr+u[1]*or]:a?d=[a.at[0]+a.out[0]*.034,a.at[1]+a.out[1]*.034]:o==="cube"&&(d=[n[0]+u[0]*.035,n[1]+u[1]*.035]);let p=Math.max(20,Math.min(360,t.fov??Iw[o])),x=Math.max(.5,Math.min(30,t.reach??Pw[o]));return{id:t.id,entity:t.entity,kind:o,lens:d,y:h,heading:c,fov:p,reach:x,wall:a,outside:s<0}}function Dw(i,e){let t=[e[0]-i[0],e[1]-i[1]];return Math.hypot(t[0],t[1])<.001?0:gf(t)}var Wi=(i,e,t,n,s,r,o=14)=>({shape:"cyl",axis:"z",x:i,y:e,z:t,w:n,h:n,d:s,role:r,seg:o}),Do=(i,e,t,n,s,r,o)=>({shape:"box",x:i,y:e,z:t,w:n,h:s,d:r,role:o});function Cx(i){let e=(n,s,r,o)=>({item:{id:`cam_${i.id}`,type:`camera_${i.kind}`,x:n[0],z:n[1],rotation:s,w:.1,d:.1,h:.1},bottom:r,parts:o}),t=i.y;if(i.kind==="dome")return[e(i.lens,i.heading,t-.002,[{shape:"cyl",x:0,y:.03,z:0,w:.13,h:.03,d:.13,role:"white",seg:20},{shape:"ball",x:0,y:0,z:0,w:.095,h:.058,d:.095,role:"screen",seg:14}])];if(i.kind==="doorbell"&&i.wall)return[e(i.wall.at,gf(i.wall.out),t-.095,[Do(0,0,.011,.048,.135,.022,"dark"),Do(0,.006,.025,.04,.123,.006,"metal"),Wi(0,.084,.0295,.022,.005,"screen"),Wi(0,.022,.0295,.03,.005,"blue",16),Wi(0,.027,.0315,.02,.006,"dark",16)])];if(i.kind==="bullet"&&i.wall){let{at:n,out:s}=i.wall,r=[n[0]+s[0]*rr,n[1]+s[1]*rr];return[e(n,gf(s),t-.085,[Wi(0,.005,.006,.07,.012,"white",16),Do(0,.029,(.012+rr)/2,.022,.022,rr-.012,"white"),{shape:"ball",x:0,y:.02,z:rr,w:.03,h:.034,d:.03,role:"metal",seg:8}]),e(r,i.heading,t-.0325,[Wi(0,0,0,.065,or*2,"white",16),Do(0,.066,.012,.078,.007,or*2+.03,"white"),Wi(0,.0065,or+.006,.052,.012,"dark",16),Wi(0,.0185,or+.015,.028,.006,"screen"),Do(.017,.042,or+.0125,.005,.005,.002,"red")])]}return[e([i.lens[0]-xf(i.heading)[0]*.035,i.lens[1]-xf(i.heading)[1]*.035],i.heading,t-.097,[{shape:"cyl",x:0,y:0,z:0,w:.07,h:.012,d:.07,role:"white",seg:16},{shape:"cyl",x:0,y:.012,z:0,w:.016,h:.05,d:.016,role:"white",seg:8},Do(0,.062,0,.07,.07,.055,"white"),Wi(0,.074,.0305,.046,.006,"dark",16),Wi(0,.086,.0345,.022,.004,"screen")])]}var et="pine",ui="blackMetal",Ve=(i,e,t,n,s,r,o,a={})=>({shape:"box",x:i,y:e,z:t,w:n,h:s,d:r,role:o,...a}),wc=(i,e,t,n,s,r,o)=>({shape:"cyl",x:i,y:e,z:t,w:n,h:s,d:r,role:o,seg:4,taper:0});function No(i,e,t=1){let n=Math.max(t,Math.round(i/e)),s=i/n;return{xs:Array.from({length:n},(r,o)=>-i/2+s*(o+.5)),p:s}}function Ix(i,e,t,n,s=et){return(e>1.3?[.2,e/2-.035,e-.27]:[.12,Math.max(.3,e-.22)]).map(o=>Ve(0,o,t,i,.07,n,s))}function qp(i,e,t,n=!1){return[-i/2+.0225,i/2-.0225,...n?[0]:[]].flatMap(r=>t.map(o=>Ve(r,0,o,.045,e,.02,et)))}function Px(i,e,t,n,s,r,o=et,a=0){let l=Math.max(1,Math.floor((e-n)/t)+1),c=e-(l-1)*t-n;return Array.from({length:l},(u,f)=>Ve(0,c+f*t,s+f%2*a,i,n,r,o))}function Lx(i,e,t){let s=[Ve(0,0,0,i,.04,.04,et),Ve(0,e-.04,0,i,.04,.04,et),Ve(-i/2+.02,.04,0,.04,e-.08,.04,et),Ve(i/2-.02,.04,0,.04,e-.08,.04,et)],r=t?.3:.15,o=i-2*.04,a=e-2*.04,l=Math.max(1,Math.round(o/r)-1),c=Math.max(1,Math.round(a/r)-1);for(let u=1;u<=l;u++)s.push(Ve(-o/2+o*u/(l+1),.04,.007,.028,a,.01,et));for(let u=1;u<=c;u++)s.push(Ve(0,.04+a*u/(c+1)-.014,-.007,o,.028,.01,et));return s}var Fn={closeboard:{name:"Closeboard",height:1.8,spacing:1.83,posts:"timber",paint:[et],timber:!0,gravel:!0,clear:.05,bay:(i,e,t)=>{let n=Ix(i,e-.03,-.03,.04);if(t.low)n.push(Ve(0,0,.006,i,e-.03,.022,et));else{let{xs:s,p:r}=No(i,.1,2);s.forEach((o,a)=>n.push(Ve(o,0,.003+a%2*.006,r+.025,e-.03,.016,et)))}return n.push(Ve(0,e-.03,.002,i,.03,.05,et)),n}},lap:{name:"Lap panel",height:1.8,spacing:1.83,posts:"timber",paint:[et],timber:!0,gravel:!0,clear:.05,bay:(i,e,t)=>{let n=i-.09,s=e-.04,r=Math.max(2,Math.round(s/.13)),o=s/r;return[...t.low?[Ve(0,0,.007,n,s,.016,et)]:Array.from({length:r},(l,c)=>Ve(0,c*o,.004+c%2*.006,n,Math.min(o+.02,s-c*o),.012,et)),...qp(i,s,[-.016,.026]),Ve(0,s,.005,i,.04,.07,et)]}},slatted:{name:"Slatted",height:1.8,spacing:1.83,posts:"timber",paint:[et],timber:!0,gravel:!1,clear:.05,bay:(i,e)=>[...Px(i,e,.09,.07,.01,.02),...qp(i,e,[-.0125],!0)]},venetian:{name:"Venetian",height:1.8,spacing:1.83,posts:"timber",paint:[et],timber:!0,gravel:!1,clear:.05,bay:(i,e,t)=>[...Px(i,e,t.low?.11:.055,t.low?.09:.045,.008,.016),...qp(i,e,[-.0125],!0)]},hit_miss:{name:"Hit and miss",height:1.8,spacing:1.83,posts:"timber",paint:[et],timber:!0,gravel:!0,clear:.05,bay:(i,e,t)=>{let n=Ix(i,e,0,.045),{xs:s,p:r}=No(i,t.low?.4:.2),o=Math.min(r/2+.02,r-.01);for(let a of s)n.push(Ve(a-r/4,0,.0305,o,e,.016,et)),n.push(Ve(a+r/4,0,-.0305,o,e,.016,et));return n}},louvre:{name:"Louvre",height:1.8,spacing:1.83,posts:"timber",paint:[et],timber:!0,gravel:!0,clear:.05,bay:(i,e,t)=>{let s=i-.09,r=[Ve(0,0,0,i,.045,.09,et),Ve(0,e-.045,0,i,.045,.09,et),Ve(-i/2+.045/2,.045,0,.045,e-2*.045,.09,et),Ve(i/2-.045/2,.045,0,.045,e-2*.045,.09,et)],o=t.low?.11:.055,a=Math.max(1,Math.floor((e-2*.045-.07)/o));for(let l=0;l<a;l++)r.push(Ve(0,.045+.035+l*o,0,s,.012,.07,et,{shear:-.9}));return r}},composite:{name:"Composite",height:1.8,spacing:1.83,posts:"metal",color:"#55585c",paint:["softwood"],timber:!1,gravel:!1,clear:.03,metal:{role:"dark",size:.09},bay:(i,e,t)=>{let n=e-.06,s=Math.max(1,Math.round(n/.15)),r=n/s;return[...t.low?[Ve(0,.03,0,i,n,.021,"softwood")]:Array.from({length:s},(a,l)=>Ve(0,.03+l*r,0,i,r-.004,.021,"softwood")),Ve(0,.03,-.0125,i,n,.003,"dark"),Ve(0,0,0,i,.03,.04,"dark"),Ve(0,e-.03,0,i,.03,.04,"dark")]}},trellis:{name:"Trellis",height:1.8,spacing:1.83,posts:"timber",paint:[et],timber:!0,gravel:!1,clear:.05,bay:(i,e,t)=>Lx(i,e,t.low)},picket:{name:"Picket",height:1,spacing:1.8,posts:"timber",color:"#f1efe9",paint:[et],timber:!0,gravel:!1,clear:.05,bay:(i,e,t)=>{let n=[Ve(0,.15,-.03,i,.07,.035,et),Ve(0,Math.max(.3,e-.3),-.03,i,.07,.035,et)],{xs:s}=No(i,t.low?.24:.12);for(let r of s)n.push(Ve(r,0,.005,.07,e-.07,.018,et),wc(r,e-.07,.005,.07,.07,.018,et));return n}},post_rail:{name:"Post and rail",height:1.1,spacing:2.4,posts:"timber",paint:[et],timber:!0,gravel:!1,clear:0,bay:(i,e,t)=>(e<.9?[.3,e-.12]:[.25,(.25+e-.12)/2,e-.12]).map(s=>Ve(0,s-.045,t.post/2+.0175,i+t.post,.09,.035,et))},railings:{name:"Railings",height:1.2,spacing:2,posts:"metal",paint:[ui],timber:!1,gravel:!1,clear:0,metal:{role:ui,size:.05},bay:(i,e,t)=>{let n=[Ve(0,.08,0,i,.04,.014,ui),Ve(0,e-.14,0,i,.04,.014,ui)];for(let s of No(i,t.low?.22:.11).xs)n.push(Ve(s,.02,0,.016,e-.08,.016,ui),wc(s,e-.06,0,.032,.06,.032,ui));return n}},estate:{name:"Estate",height:1.2,spacing:1.8,posts:"metal",paint:[ui],timber:!1,gravel:!1,clear:0,metal:{role:ui,size:.035},bay:(i,e,t)=>{let n=e>1?5:4;return Array.from({length:n},(s,r)=>Ve(0,.1+(e-.16)*r/(n-1),t.post/2+.006,i+t.post,.045,.012,ui))}},palisade:{name:"Palisade",height:2.1,spacing:2.75,posts:"metal",paint:["metal"],timber:!1,gravel:!1,clear:.05,metal:{role:"metal",size:.1},bay:(i,e,t)=>{let n=[Ve(0,.3,-.03,i+t.post,.05,.05,"metal"),Ve(0,e-.45,-.03,i+t.post,.05,.05,"metal")];for(let s of No(i,t.low?.34:.17).xs)n.push(Ve(s,0,0,.065,e-.1,.01,"metal"),wc(s,e-.1,0,.026,.1,.01,"metal")),n.push(wc(s-.022,e-.1,0,.022,.06,.01,"metal"),wc(s+.022,e-.1,0,.022,.06,.01,"metal"));return n}},balustrade:{name:"Spindles",height:1,spacing:1.5,posts:"timber",paint:[et],timber:!0,gravel:!1,clear:0,bay:(i,e,t)=>{let n=[Ve(0,.05,0,i+t.post,.07,.07,et),Ve(0,e-.07,0,i+t.post,.07,.09,et)];for(let s of No(i,t.low?.24:.12).xs)n.push(Ve(s,.12,0,.036,e-.19,.036,et));return n}},glass:{name:"Glass",height:1,spacing:1.2,posts:"metal",paint:[],timber:!1,gravel:!1,clear:0,metal:{role:"metal",size:.045},bay:(i,e)=>{let t=[Ve(0,.05,0,i-.03,e-.05,.012,"glass")];for(let n of[-1,1])for(let s of[.2,e-.3])t.push(Ve(n*(i/2-.02),s,0,.04,.06,.03,"metal"));return t}},brick_wall:{name:"Brick wall",height:.9,spacing:2.6,posts:"pier",paint:[],timber:!1,gravel:!1,clear:0,bay:(i,e)=>[Ve(0,0,0,i,e-.06,.215,"brick"),Ve(0,e-.06,0,i,.06,.3,"concrete")]}},PE=Object.keys(Fn),LE=[["Golden brown","#c9965d"],["Red cedar","#8b5a3c"],["Dark oak","#5a4030"],["Green treated","#7a7444"],["Forest green","#3b5a46"],["Sage","#8f9a84"],["Stone","#c9c3b4"],["White","#f1efe9"],["Anthracite","#4a4d52"],["Black","#2b2c2e"]];function Dx(i){return Fn[i]??Fn.closeboard}function Nw(i,e){var n;let t=i.posts??e.posts;return t==="concrete"?{kind:t,size:.1,extra:.05}:t==="metal"?{kind:t,size:((n=e.metal)==null?void 0:n.size)??.06,extra:.02}:t==="pier"?{kind:t,size:.33,extra:.1}:{kind:t,size:.09,extra:.05}}function Uw(i,e,t,n){return i==="concrete"?[Ve(0,0,0,e,t,e,"concrete"),{shape:"prism",x:0,y:t,z:0,w:e,h:.025,d:e,role:"concrete"}]:i==="metal"?[Ve(0,0,0,e,t,e,n),Ve(0,t,0,e+.012,.01,e+.012,n)]:i==="pier"?[Ve(0,0,0,e,t,e,"brick"),Ve(0,t,0,e+.07,.06,e+.07,"concrete")]:[Ve(0,0,0,e,t,e,et),Ve(0,t,0,e+.02,.022,e+.02,et)]}function Fw(i,e,t,n){let s=i===Fn.brick_wall||i===Fn.glass?Fn.railings:i,r=!s.timber&&s!==Fn.composite,o=r?s.paint[0]??ui:s===Fn.composite?"dark":et,a=.04,l=s.bay(e-(r?2*a:0),t-(r?2*a:0),{low:n,post:0}).map(c=>r?{...c,y:c.y+a}:c);if(r||s===Fn.composite)l.push(Ve(0,0,0,e,a,.03,o),Ve(0,t-a,0,e,a,.03,o),Ve(-e/2+a/2,a,0,a,t-2*a,.03,o),Ve(e/2-a/2,a,0,a,t-2*a,.03,o));else{let c=t*.15,u=t*.8;l.push(Ve(0,c,-.07,e-.03,.09,.022,et),Ve(0,u,-.07,e-.03,.09,.022,et)),l.push({shape:"cyl",x:-e/2+.08,y:c+.09,z:-.07,w:.07,h:u-c-.09,d:.022,role:et,seg:4,lean:[e-.16,0]})}return l.push(Ve(e/2-.08,t*.55,r?.03:.045,.025,.1,.02,"dark")),l}function DE(i){let e=0;for(let t=1;t<i.points.length;t++)e+=Math.hypot(i.points[t][0]-i.points[t-1][0],i.points[t][1]-i.points[t-1][1]);return e}function Yp(i,e){var x;let t=Dx(i.style),n=Math.max(.3,Math.min(3,i.height||t.height)),s=Nw(i,t),r=Math.max(.6,Math.min(6,i.spacing||t.spacing)),o=t.timber&&(i.gravel_board??t.gravel),a=o?.15:t.clear,l=t.timber&&i.topper==="trellis"&&t!==Fn.trellis?.3:0,c=n+l+s.extra,u=((x=t.metal)==null?void 0:x.role)??ui,f=i.color??t.color??null,h=(i.gates??[]).map(m=>({g:m,a:m.at-m.width/2,b:m.at+m.width/2})).sort((m,g)=>m.a-g.a),d=[],p=0;for(let m=1;m<i.points.length;m++){let g=i.points[m-1],y=i.points[m],S=Math.hypot(y[0]-g[0],y[1]-g[1]);if(S<.05)continue;let v=[(y[0]-g[0])/S,(y[1]-g[1])/S],M=Math.atan2(v[1],v[0])*180/Math.PI,b=(I,P,C,U)=>{let B=I-p;d.push({item:{id:i.id,type:"fence",x:g[0]+v[0]*B,z:g[1]+v[1]*B,rotation:M,w:P,d:.1,h:C,color:f},parts:U})},E=h.filter(I=>I.b>p+.01&&I.a<p+S-.01).map(I=>({...I,a:Math.max(I.a,p),b:Math.min(I.b,p+S)})),_=[],A=p;for(let I of E)I.a>A+.01&&_.push([A,I.a]),A=Math.max(A,I.b);p+S>A+.01&&_.push([A,p+S]);let R=new Map,L=(I,P)=>{let C=Math.round(I*1e3)/1e3;R.set(C,(R.get(C)??!1)||P)};for(let[I,P]of _){let C=Math.max(1,Math.ceil((P-I)/r-.01)),U=(P-I)/C;for(let z=0;z<=C;z++)L(I+z*U,!1);let B=U-s.size;if(!(B<.05))for(let z=0;z<C;z++){let j=t.bay(B,n-a,{low:e,post:s.size}).map(q=>({...q,y:q.y+a}));o&&j.push(Ve(0,0,.01,B,.15,.05,"concrete")),l&&j.push(...Lx(B,l,e).map(q=>({...q,y:q.y+n}))),b(I+(z+.5)*U,B,c,j)}}for(let I of E){L(I.a,!0),L(I.b,!0);let P=s.size*1.3,C=I.b-I.a-P-.02;if(C<.2)continue;let U=n-.05,B=I.g.double?2:1,z=(C-(B-1)*.01)/B;for(let j=0;j<B;j++){let q=Fw(t,z,U,e).map(k=>j===1?{...k,x:-k.x,lean:k.lean?[-k.lean[0],k.lean[1]]:void 0}:k).map(k=>({...k,y:k.y+.05}));b(I.a+P/2+.01+z*(j+.5)+j*.01,z,U,q)}}for(let[I,P]of R){if(m>1&&Math.abs(I-p)<.002)continue;let C=P?s.size*1.3:s.size;b(I,C,c,Uw(s.kind,C,c,u))}p+=S}return d}function Zp(i){return new Set(Dx(i.style).paint)}function _f(i){let e=0;return i.forEach((t,n)=>{let s=i[(n+1)%i.length];e+=t[0]*s[1]-s[0]*t[1]}),e>=0?1:-1}function Rn(i,e,t=_f(i)){let n=i[e],s=i[(e+1)%i.length],r=Math.hypot(s[0]-n[0],s[1]-n[1])||1e-9,o=[(s[0]-n[0])/r,(s[1]-n[1])/r];return{a:n,b:s,dir:o,len:r,out:[t*o[1],-t*o[0]]}}function Ow(i,e,t,n=.28){let s=Rn(e,t),r=[(s.a[0]+s.b[0])/2,(s.a[1]+s.b[1])/2],o=[r[0]+s.out[0]*.3,r[1]+s.out[1]*.3];if(i.rooms.some(l=>Kt(o,l.points)))return!0;let a=n/2+.2;return i.rooms.some(l=>l.points.some((c,u)=>Vo(r,c,l.points[(u+1)%l.points.length]).d<a&&Math.abs(Rn(l.points,u).dir[0]*s.dir[1]-Rn(l.points,u).dir[1]*s.dir[0])<.2))}function Ux(i,e,t=.28){return e.points.map((n,s)=>!Ow(i,e.points,s,t))}function Jp(i,e){let t=i.length,n=_f(i),s=i.map((r,o)=>{let a=Rn(i,o,n);return{p:[a.a[0]-a.out[0]*e,a.a[1]-a.out[1]*e],dir:a.dir}});return i.map((r,o)=>{let a=s[(o+t-1)%t],l=s[o],c=a.dir[0]*l.dir[1]-a.dir[1]*l.dir[0];if(Math.abs(c)<1e-6)return l.p;let u=((l.p[0]-a.p[0])*l.dir[1]-(l.p[1]-a.p[1])*l.dir[0])/c;return[a.p[0]+a.dir[0]*u,a.p[1]+a.dir[1]*u]})}var Nx=.3,Bw=.2;function Fx(i,e){let t=Rn(i,e.edge),n=Math.max(.6,Math.min(t.len,e.width??t.len));return[(t.len-n)/2,(t.len+n)/2]}function Ox(i,e,t){if(e.edge<0||e.edge>=i.length||t<.05)return[];let n=Rn(i,e.edge),s=Math.max(2,Math.ceil(t/Bw-1e-6)),[r,o]=Fx(i,e),a=(c,u)=>[n.a[0]+n.dir[0]*c+n.out[0]*u,n.a[1]+n.dir[1]*c+n.out[1]*u],l=[];for(let c=1;c<s;c++){let u=(c-1)*Nx,f=c*Nx;l.push({corners:[a(r,u),a(o,u),a(o,f),a(r,f)],top:t*(s-c)/s,dir:n.dir,out:n.out})}return l}function Bx(i,e,t,n=.05){let s=i.length;if(s<3)return[];let r=Jp(i,n),o=[];for(let l=0;l<s;l++){if(!e[l])continue;let c=r[l],u=r[(l+1)%s],f=Math.hypot(u[0]-c[0],u[1]-c[1]);if(f<.05)continue;let h=g=>[c[0]+(u[0]-c[0])*g/f,c[1]+(u[1]-c[1])*g/f],d=i[l],p=((c[0]-d[0])*(u[0]-c[0])+(c[1]-d[1])*(u[1]-c[1]))/f,x=t.filter(g=>g.edge===l).map(g=>Fx(i,g).map(y=>y-p)).sort((g,y)=>g[0]-y[0]),m=0;for(let[g,y]of x)g-.02>m+.05&&o.push({i:l,a:h(m),b:h(g-.02)}),m=Math.max(m,y+.02);f>m+.05&&o.push({i:l,a:h(m),b:h(f)})}let a=[];for(let l of o){let c=a[a.length-1],u=c==null?void 0:c[c.length-1];u&&Math.hypot(u[0]-l.a[0],u[1]-l.a[1])<.001?c.push(l.b):a.push([l.a,l.b])}if(a.length>1){let l=a[0],c=a[a.length-1],u=c[c.length-1];Math.hypot(u[0]-l[0][0],u[1]-l[0][1])<.001&&(a[0]=[...c,...l.slice(1)],a.pop())}return a}function OE(i){if(i.length<12)return null;let e=i.reduce((r,o)=>r+o[0],0)/i.length,t=i.reduce((r,o)=>r+o[1],0)/i.length,n=i.map(r=>Math.hypot(r[0]-e,r[1]-t)),s=n.reduce((r,o)=>r+o,0)/n.length;return n.every(r=>Math.abs(r-s)<Math.max(.03,s*.03))?{centre:[e,t],radius:s}:null}function BE(i,e,t=32){let n=s=>Math.round(s*1e3)/1e3;return Array.from({length:t},(s,r)=>{let o=r/t*Math.PI*2;return[n(i[0]+Math.cos(o)*e),n(i[1]+Math.sin(o)*e)]})}function kE(i,e,t){let n=c=>Math.round(c*1e3)/1e3,s=i.outdoor??[],r=s.filter(c=>c.kind===e).length+1,o={patio:"Patio",deck:"Deck",path:"Path"}[e]+(r>1?` ${r}`:""),a=zo(t),l=s.find(c=>c.kind==="lawn"&&Kt(a,c.points))??s.find(c=>Kt(a,c.points));return{id:Cm("out"),name:o,kind:e,area_id:(l==null?void 0:l.area_id)??null,points:t.map(([c,u])=>[n(c),n(u)]),...e==="patio"?{paving:"sandstone"}:{}}}function VE(i){if(i.length!==4)return null;for(let e=0;e<4;e++){let t=Rn(i,e),n=Rn(i,(e+1)%4);if(Math.abs(t.dir[0]*n.dir[0]+t.dir[1]*n.dir[1])>.02)return null}return[Rn(i,0).len,Rn(i,1).len]}function zE(i,e,t){let n=Rn(i,e),s=n.dir[0]*(t-n.len),r=n.dir[1]*(t-n.len),o=e===0?[1,2]:[2,3],a=l=>Math.round(l*1e3)/1e3;return i.map((l,c)=>o.includes(c)?[a(l[0]+s),a(l[1]+r)]:l)}var Wt={light:"#cdc7bb",grey:"#8a8781",charcoal:"#4a4a4b",buff:"#b49e7a",sand:"#b9a98a"},yf={sandstone:{name:"Indian sandstone",patterns:["random","stretcher","grid"],sizes:["600x600","900x600","600x290"],surface:"riven",colors:[["Kandla grey","#8f8b85",.3],["Raj green","#8e8c70",.85],["Autumn brown","#a27d5c",1],["Rippon buff","#c6aa82",.6],["Camel dust","#c4ae8d",.4],["Fossil mint","#c3b6a0",.55]],joint:12,jointColor:Wt.grey,module:300,vary:.16,roughness:.85,relief:.9},porcelain:{name:"Porcelain",patterns:["grid","stretcher","third","random"],sizes:["600x600","900x600","1200x600","800x800","1200x300"],surface:"smooth",colors:[["Light grey","#bdbcb7",0],["Mid grey","#8f8e8a",0],["Anthracite","#4c4d4f",0],["Ivory","#dad3c4",0],["Sand","#c3b59c",0],["Silver","#a9aaa7",0],["Black","#2f3032",0]],joint:4,jointColor:Wt.grey,module:300,vary:.04,roughness:.55,relief:.15},concrete:{name:"Concrete slabs",patterns:["grid","stretcher","random"],sizes:["600x600","450x450","600x300"],surface:"textured",colors:[["Natural","#b4b0a7",0],["Buff","#c9b590",.2],["Charcoal","#5d5d5d",0],["Silver","#bab9b4",0],["Red","#9c6253",.1]],joint:8,jointColor:Wt.grey,module:300,vary:.06,roughness:.9,relief:.35},slate:{name:"Slate",patterns:["random","grid","stretcher"],sizes:["600x600","900x600","600x300"],surface:"cleft",colors:[["Black","#33363a",.1],["Blue black","#3a4048",.15],["Grey","#5e6369",.2],["Rustic","#5a5450",.9]],joint:6,jointColor:Wt.charcoal,module:300,vary:.1,roughness:.6,relief:.7},granite:{name:"Granite",patterns:["grid","stretcher","random"],sizes:["600x600","900x600","600x300"],surface:"flamed",colors:[["Silver grey","#a5a5a3",0],["Dark grey","#6c6d6f",0],["Black","#2c2d2f",0],["Golden","#c2a67b",.3]],joint:6,jointColor:Wt.grey,module:300,vary:.05,roughness:.75,relief:.4},limestone:{name:"Limestone",patterns:["random","grid","stretcher"],sizes:["600x600","900x600"],surface:"honed",colors:[["Kota blue","#5f6b70",.25],["Kota brown","#7d6b59",.3],["Black","#323436",.1],["Jura beige","#cfc4ae",.2]],joint:8,jointColor:Wt.grey,module:300,vary:.1,roughness:.6,relief:.3},travertine:{name:"Travertine",patterns:["random","grid","stretcher"],sizes:["600x400","600x600"],surface:"tumbled",colors:[["Classic","#d5c3a3",.35],["Ivory","#e2d8c4",.25],["Silver","#c3beb5",.2],["Noce","#a98b6b",.45]],joint:3,jointColor:Wt.light,module:200,vary:.1,roughness:.7,relief:.45},block:{name:"Block paving",patterns:["herringbone","stretcher","basketweave","grid"],sizes:["200x100"],surface:"block",colors:[["Brindle","#8d624f",.9],["Charcoal","#525254",.1],["Natural","#9f9d98",.1],["Red","#9b4c3e",.2],["Buff","#c3a374",.3],["Burnt ochre","#a9764c",.5]],joint:3,jointColor:Wt.sand,vary:.12,roughness:.85,relief:.7},brick:{name:"Clay pavers",patterns:["herringbone","basketweave","stretcher"],sizes:["200x100"],surface:"clay",colors:[["Red","#a3553f",.3],["Multi","#8f5b46",.9],["Staffordshire blue","#3f4046",.2],["Buff","#caa97a",.35]],joint:4,jointColor:Wt.sand,vary:.14,roughness:.85,relief:.75},setts:{name:"Granite setts",patterns:["stretcher","grid"],sizes:["100x100","200x100"],surface:"sett",colors:[["Silver grey","#9e9e9c",.1],["Dark grey","#606164",.1],["Mixed","#a9a08c",.8],["Black","#3b3c3e",.05]],joint:10,jointColor:Wt.grey,vary:.12,roughness:.85,relief:1},crazy:{name:"Crazy paving",patterns:["crazy"],sizes:[],surface:"riven",colors:[["Buff","#c4a983",.6],["Grey","#9a9690",.3],["Multi","#a38c71",1],["York stone","#b3a58b",.4]],joint:16,jointColor:Wt.grey,vary:.16,roughness:.85,relief:.9},resin:{name:"Resin bound",patterns:["plain"],sizes:[],surface:"aggregate",colors:[["Golden","#c3a167",0],["Barley","#cab68b",0],["Silver grey","#a9a8a4",0],["Bronze","#90704d",0],["Charcoal","#4e4e50",0],["Cream","#d9ceb5",0]],joint:0,jointColor:Wt.grey,vary:0,roughness:.6,relief:.6},tarmac:{name:"Tarmac",patterns:["plain"],sizes:[],surface:"tarmac",colors:[["Black","#45474b",0],["Red","#7e4239",0]],joint:0,jointColor:Wt.grey,vary:0,roughness:.85,relief:.35},gravel:{name:"Gravel",patterns:["plain"],sizes:[],surface:"gravel",colors:[["Cotswold","#cbb58e",0],["Pea shingle","#b4a284",0],["Golden flint","#b8925e",0],["Slate chippings","#525961",0],["White","#e6e4df",0],["Grey granite","#9b9b99",0]],joint:0,jointColor:Wt.grey,vary:0,roughness:.9,relief:.9}},HE=Object.keys(yf),WE={random:"Random",grid:"Grid",stretcher:"Staggered",third:"Third offset",herringbone:"Herringbone",basketweave:"Basketweave",crazy:"Crazy",plain:"Seamless"},XE=[["Light",Wt.light],["Grey",Wt.grey],["Charcoal",Wt.charcoal],["Buff",Wt.buff],["Sand",Wt.sand]],kx=["setts","block","brick","porcelain","sandstone"],Vx={setts:"100x100",block:"200x100",brick:"200x100",porcelain:"1200x300",sandstone:"600x290"},$p={patio:{material:"sandstone"},path:{material:"block",pattern:"stretcher",color:"#9f9d98"},driveway:{material:"block"},gravel:{material:"gravel"}};function bf(i){return i.kind in $p}function zx(i){let e=/^(\d{2,4})x(\d{2,4})$/.exec(i??"");if(!e)return null;let t=Number(e[1]),n=Number(e[2]);return t>=n?[t,n]:[n,t]}var Kp=i=>!!i&&/^#[0-9a-f]{6}$/i.test(i);function jp(i,e={}){let t=i&&i in yf?i:"sandstone",n=yf[t],s=n.patterns.includes(e.pattern)?e.pattern:n.patterns[0],r=n.sizes.includes(e.unit??"")?e.unit:n.sizes[0],o=s==="random"?[n.module??300,n.module??300]:zx(r)??[600,600],a=Kp(e.color)?e.color.toLowerCase():n.colors[0][1],l=n.colors.find(([,c])=>c===a);return{material:t,pattern:s,unit:o,color:a,mix:l?l[2]:n.colors[0][2]*.5,joint:Kp(e.joint)?e.joint.toLowerCase():n.jointColor}}function Qp(i){let e=$p[i.kind]??$p.patio,t=i.kind==="gravel"?"gravel":i.paving&&i.paving!=="gravel"?i.paving:i.kind==="driveway"&&i.surface==="asphalt"?"tarmac":e.material,n=t===e.material;return jp(t,{pattern:i.pattern??(n?e.pattern:null),unit:i.unit,color:i.color??(n?e.color:null),joint:i.joint})}function em(i){return`pave:${i.material}.${i.pattern}.${i.unit[0]}x${i.unit[1]}.${i.color.slice(1)}.${i.joint.slice(1)}.${Math.round(i.mix*100)}`}function qE(i){let[e,t,n,s,r,o]=i.split(".");if(!(e in yf))return null;let a=zx(n);return{material:e,pattern:t,unit:a??[600,600],color:`#${s}`,joint:`#${r}`,mix:Number(o)/100||0}}var vf={softwood:{name:"Softwood",widths:[120,145,95],roughness:.75,colors:[["Brown treated","#9c7752"],["Golden","#c49b64"],["Green treated","#9f9768"],["Weathered","#9c968b"],["Dark oak stain","#5f4632"],["Grey stain","#8e8b86"],["Black stain","#38363a"]]},cedar:{name:"Cedar",widths:[140,95],roughness:.7,colors:[["Natural","#b5764e"],["Weathered","#a59b8e"]]},hardwood:{name:"Hardwood",widths:[145,90],roughness:.55,colors:[["Ipe","#7a5238"],["Iroko","#9c6c40"],["Balau","#8a5e3f"]]},composite:{name:"Composite",widths:[145,140],roughness:.6,colors:[["Grey","#8e8b87"],["Charcoal","#4c4b4a"],["Walnut","#6b5141"],["Oak","#a17e5b"],["Teak","#9b6f48"],["Silver","#b4b1ab"],["Black","#303031"]]}},YE=Object.keys(vf);function Mf(i){let e=i.boards&&i.boards in vf?i.boards:"softwood",t=vf[e],n=i.board_width&&i.board_width>=60&&i.board_width<=300?Math.round(i.board_width):t.widths[0];return{boards:e,color:Kp(i.color)?i.color.toLowerCase():t.colors[0][1],width:n}}function tm(i){return`deck:${i.boards}.${i.color.slice(1)}.${i.width}`}function ZE(i){let[e,t,n]=i.split(".");return e in vf?{boards:e,color:`#${t}`,width:Number(n)||120}:null}var JE={brick:"Brick",stone:"Stone",render:"Render",sleepers:"Sleepers"};function Gx(i){let e=0,t=-1;i.points.forEach((s,r)=>{let o=i.points[(r+1)%i.points.length],a=Math.hypot(o[0]-s[0],o[1]-s[1]),l=Math.atan2(o[1]-s[1],o[0]-s[0]),c=Math.abs(Math.sin(2*l));(a>t+.05||Math.abs(a-t)<=.05&&c<Math.abs(Math.sin(2*e)))&&(t=a,e=l)});let n=e*180/Math.PI;return n=(n%90+135)%90-45,Math.round((n+(i.angle??0))*100)/100}function Hx(i,e){let t=e*Math.PI/180,n=Math.cos(t),s=Math.sin(t),r=1/0,o=1/0;for(let[a,l]of i)r=Math.min(r,a*n+l*s),o=Math.min(o,-a*s+l*n);return{c:n,s,ou:isFinite(r)?r:0,ov:isFinite(o)?o:0}}function Wx(i){return i.kind==="deck"?Mf(i).color:bf(i)?Qp(i).color:null}var Yx={gable:{name:"Gable",pitch:35,hint:"Two slopes, walls up to the ridge at the ends"},hip:{name:"Hipped",pitch:35,hint:"Slopes on all four sides"},half_hip:{name:"Half-hipped",pitch:40,hint:"Gable ends with their tops hipped (jerkinhead)"},dutch:{name:"Dutch gable",pitch:35,hint:"Hipped, with a small gable at the top of each end"},pyramid:{name:"Pyramid",pitch:35,hint:"Four slopes meeting at a point"},mansard:{name:"Mansard",pitch:25,hint:"Steep lower slopes all round under shallow upper ones"},gambrel:{name:"Gambrel",pitch:30,hint:"A barn roof: steep lower slopes, gable ends"},lean_to:{name:"Lean-to",pitch:15,hint:"One slope rising to its back (mono-pitch, skillion)"},flat:{name:"Flat",pitch:0,hint:"Flat, with eaves or a parapet"},butterfly:{name:"Butterfly",pitch:12,hint:"Two slopes falling to a valley in the middle"},m_shaped:{name:"M-shaped",pitch:35,hint:"Two gables side by side with a valley between"}},tT=Object.keys(Yx),Cn=Math.PI/180,Ec=.2,On=(i,e,t)=>i.h0+i.k*(i.c-(i.n[0]*e+i.n[1]*t));function nm(i,e,t){let n=i.max?-1/0:1/0;for(let s of i.planes){let r=On(s,e,t);(i.max?r>n:r<n)&&(n=r)}return n}function sm(i,e,t){let n=0,s=1/0;return i.zones.forEach((r,o)=>{let a=Math.max(r.u0-e,e-r.u1,0)+Math.max(r.v0-t,t-r.v1,0);a<s-1e-9&&(n=o,s=a)}),n}function Af(i,e,t){return nm(i.zones[sm(i,e,t)],e,t)}function Tc(i,e){let t=e[0]-i.roof.x,n=e[1]-i.roof.z;return[i.cos*t+i.sin*n,-i.sin*t+i.cos*n]}function Ef(i,e,t){return[i.roof.x+i.cos*e-i.sin*t,i.roof.z+i.sin*e+i.cos*t]}var Xi=(i,e,t)=>[i.cos*e-i.sin*t,i.sin*e+i.cos*t];function rm(i,e,t){var q;let n=t.wallHalf,s=Math.max(.1,i.w/2+n),r=Math.max(.1,i.d/2+n),o=i.shape,a=i.covering==="glass",l=Math.max(0,Math.min(75,o==="flat"?0:i.pitch||((q=Yx[o])==null?void 0:q.pitch)||35)),c=Math.tan(l*Cn),u={left:i.party==="left"||i.party==="both",right:i.party==="right"||i.party==="both"},f={left:!1,right:!1,back:!1,front:!1,...t.abut},h=Math.max(0,i.overhang??(o==="flat"?i.parapet?0:.1:a?.08:.3)),d=Math.min(h,.15),p=o==="hip"||o==="pyramid"||o==="mansard"||o==="dutch",x=(k,H)=>f[k]?-.02:k==="left"&&u.left||k==="right"&&u.right||o==="flat"&&i.parapet?0:o==="flat"?Math.max(.03,H):H,m=x("left",p?h:d),g=x("right",p?h:d),y=x("back",o==="lean_to"?Math.min(h,.1):h),S=x("front",h),v=-s-m,M=s+g,b=-r-y,E=r+S,_={n:[0,1],c:r,k:c,h0:0},A={n:[0,-1],c:r,k:c,h0:0},R=(k,H=0)=>({n:[-1,0],c:s,k,h0:H}),L=(k,H=0)=>({n:[1,0],c:s,k,h0:H}),I=(k,H=0)=>[...u.left?[]:[R(k,H)],...u.right?[]:[L(k,H)]],P=(k,H=!1)=>[{u0:v,u1:M,v0:b,v1:E,planes:k,max:H}],C=[],U;switch(o){case"hip":U=P([_,A,...I(c)]);break;case"pyramid":U=P([_,A,...I(c*r/s)]);break;case"half_hip":U=P([_,A,...I(c,.5*r*c)]);break;case"dutch":{let k=Math.min(.55*r,s-.25);if(k<.3){U=P([_,A,...I(c)]);break}let H=u.left?v:-s+k,ue=u.right?M:s-k;U=[{u0:H,u1:ue,v0:b,v1:E,planes:[_,A],max:!1}],u.left||(U.push({u0:v,u1:H,v0:b,v1:E,planes:[_,A,R(c)],max:!1}),C.push({u:H,foot:k*c,outward:-1})),u.right||(U.push({u0:ue,u1:M,v0:b,v1:E,planes:[_,A,L(c)],max:!1}),C.push({u:ue,foot:k*c,outward:1}));break}case"mansard":case"gambrel":{let k=Math.tan((o==="mansard"?70:60)*Cn),H=Math.max(.35,Math.min(o==="mansard"?1:1.3,Math.min(s,r)*(o==="mansard"?.3:.28))),ue=G=>[{...G,k,h0:0},{...G,k:c,h0:H*k-H*c}],de=[_,A,...o==="mansard"?I(c):[]];U=P(de.flatMap(ue));break}case"lean_to":U=P([_]);break;case"flat":U=P([{n:[0,1],c:0,k:0,h0:Ec}]);break;case"butterfly":U=P([{n:[0,-1],c:0,k:c,h0:0},{n:[0,1],c:0,k:c,h0:0}],!0);break;case"m_shaped":U=[{u0:v,u1:M,v0:0,v1:E,planes:[_,{n:[0,-1],c:0,k:c,h0:0}],max:!1},{u0:v,u1:M,v0:b,v1:0,planes:[A,{n:[0,1],c:0,k:c,h0:0}],max:!1}];break;default:U=P([_,A])}let B=t.lift??0;B&&(U=U.map(k=>({...k,planes:k.planes.map(H=>({...H,h0:H.h0+B}))})));let z=(i.rotation??0)*Cn,j={roof:i,base:e,A:s,B:r,u0:v,u1:M,v0:b,v1:E,zones:U,faces:[],abut:f,party:u,gablets:C.map(k=>({...k,foot:k.foot+B})),T:a?.07:o==="flat"?.3:.2,cos:Math.cos(z),sin:Math.sin(z),glass:a};return j.faces=U.flatMap((k,H)=>k.planes.map((ue,de)=>{let G=k.planes.filter((ge,X)=>X!==de),le=om([[k.u0,k.v0],[k.u1,k.v0],[k.u1,k.v1],[k.u0,k.v1]],G.map(ge=>X=>{let Y=On(ge,X[0],X[1])-On(ue,X[0],X[1]);return k.max?-Y:Y}));return{zone:H,plane:ue,poly:le}})).filter(k=>k.poly.length>=3&&am(k.poly)>1e-4),j}function kw(i){let e=0;for(let t of i.faces)for(let[n,s]of t.poly)e=Math.max(e,On(t.plane,n,s));return e}function Zx(i,e,t){let n=null,s=1/0,r=sm(i,e,t);for(let o of i.faces){if(o.zone!==r)continue;if(Kt([e,t],o.poly))return o;let a=o.poly.reduce((c,u)=>[c[0]+u[0]/o.poly.length,c[1]+u[1]/o.poly.length],[0,0]),l=Math.hypot(a[0]-e,a[1]-t);l<s&&(n=o,s=l)}return n}function Vw(i,e){let t=Math.atan(e.plane.k)/Cn,n=Xi(i,e.plane.n[0],e.plane.n[1]);return{tilt:t,down:e.plane.k>1e-6?n:[0,1]}}function Rc(i,e){let t=e.plane.k,[n,s]=Xi(i,t*e.plane.n[0],t*e.plane.n[1]),r=Math.hypot(n,1,s);return[n/r,1/r,s/r]}function om(i,e){let t=i;for(let s of e){let r=t;t=[];for(let o=0;o<r.length;o++){let a=r[o],l=r[(o+r.length-1)%r.length],c=s(a),u=s(l);c>=-1e-9?(u<-1e-9&&t.push(Xx(l,a,u,c)),t.push(a)):u>=-1e-9&&t.push(Xx(l,a,u,c))}if(t.length<3)return[]}let n=[];for(let s of t){let r=n[n.length-1];(!r||Math.abs(r[0]-s[0])>1e-7||Math.abs(r[1]-s[1])>1e-7)&&n.push(s)}for(;n.length>1&&Math.abs(n[0][0]-n[n.length-1][0])<1e-7&&Math.abs(n[0][1]-n[n.length-1][1])<1e-7;)n.pop();return n}function Xx(i,e,t,n){let s=t/(t-n);return[i[0]+(e[0]-i[0])*s,i[1]+(e[1]-i[1])*s]}function am(i){let e=0;for(let t=0;t<i.length;t++){let n=i[(t+1)%i.length];e+=i[t][0]*n[1]-n[0]*i[t][1]}return Math.abs(e)/2}function lm(i,e,t,n=[]){let s=Math.hypot(t[0]-e[0],t[1]-e[1]);if(s<1e-6)return[];let r=(t[0]-e[0])/s,o=(t[1]-e[1])/s,a=new Set([0,s,...n.filter(f=>f>0&&f<s)]),l=(f,h,d)=>{if(Math.abs(d)<1e-9)return;let p=(f-h)/d;p>1e-6&&p<s-1e-6&&a.add(p)};for(let f of i.zones){l(f.u0,e[0],r),l(f.u1,e[0],r),l(f.v0,e[1],o),l(f.v1,e[1],o);for(let h=0;h<f.planes.length;h++)for(let d=h+1;d<f.planes.length;d++){let p=f.planes[h],x=f.planes[d],m=On(p,e[0],e[1])-On(x,e[0],e[1]),g=-p.k*(p.n[0]*r+p.n[1]*o)+x.k*(x.n[0]*r+x.n[1]*o);if(Math.abs(g)<1e-9)continue;let y=-m/g;y>1e-6&&y<s-1e-6&&a.add(y)}}let c=[...a].sort((f,h)=>f-h),u=[];for(let f=0;f+1<c.length;f++){let h=c[f],d=c[f+1];if(d-h<1e-6)continue;let p=(h+d)/2,x=i.zones[sm(i,e[0]+r*p,e[1]+o*p)];u.push([h,d,nm(x,e[0]+r*h,e[1]+o*h),nm(x,e[0]+r*d,e[1]+o*d)])}return u}function zw(i,e,t){let n=i.floors.slice(e+1).flatMap(d=>d.rooms),s=i.settings.wall_exterior/2,r=(t.rotation??0)*Cn,o=Math.cos(r),a=Math.sin(r),l=(d,p)=>[t.x+o*d-a*p,t.z+a*d+o*p],c=d=>n.some(p=>Kt(d,p.points)),u=t.w/2+s+.3,f=t.d/2+s+.3,h=d=>d.filter(c).length>=2;return{left:h([l(-u,0),l(-u,-t.d/4),l(-u,t.d/4)]),right:h([l(u,0),l(u,-t.d/4),l(u,t.d/4)]),back:h([l(0,-f),l(-t.w/4,-f),l(t.w/4,-f)]),front:h([l(0,f),l(-t.w/4,f),l(t.w/4,f)])}}function Jx(i,e){let t=i.floors[e];return(t.roofs??[]).map((n,s)=>rm(n,t.elevation+(n.eaves??t.height),{wallHalf:i.settings.wall_exterior/2,abut:zw(i,e,n),lift:s*.002}))}function Tf(i,e){let[t,n]=Tc(i,[e.x,e.z]),s=Zx(i,t,n);if(!s)return null;let r=i.base+On(s.plane,t,n),o=s.plane.k;if(o>.03){let l=Math.atan(o),c=Xi(i,-s.plane.n[0],-s.plane.n[1]),u=Xi(i,-s.plane.n[1],s.plane.n[0]);return{face:s,slope:l/Cn,c:[e.x,r,e.z],e1:[u[0],0,u[1]],e2:[c[0]*Math.cos(l),Math.sin(l),c[1]*Math.cos(l)],n:[-c[0]*Math.sin(l),Math.cos(l),-c[1]*Math.sin(l)]}}let a=(e.rotation??i.roof.rotation??0)*Cn;return{face:s,slope:0,c:[e.x,r,e.z],e1:[Math.cos(a),0,Math.sin(a)],e2:[Math.sin(a),0,-Math.cos(a)],n:[0,1,0]}}function Gw(i,e,t){let[n,s]=Vw(i,e).down;return((t+Math.atan2(n,-s)*180/Math.PI)%360+360)%360}function Hw(i,e,t){let n=e.plane.k,s=Math.sqrt(1+n*n);return e.poly.map(([r,o])=>{let[a,l]=Ef(i,r,o),c=a-t.c[0],u=l-t.c[2],f=c*t.e1[0]+u*t.e1[2],h=Math.hypot(t.e2[0],t.e2[2])||1,d=(c*t.e2[0]+u*t.e2[2])/h*(n>.03?s:1);return[f,d]})}function qx(i,e){let t=1/0,n=-1/0;for(let s=0;s<i.length;s++){let r=i[s],o=i[(s+1)%i.length];if((r[1]-e)*(o[1]-e)>0)continue;if(Math.abs(o[1]-r[1])<1e-9){t=Math.min(t,r[0],o[0]),n=Math.max(n,r[0],o[0]);continue}let a=r[0]+(e-r[1])/(o[1]-r[1])*(o[0]-r[0]);t=Math.min(t,a),n=Math.max(n,a)}return t<=n?[t,n]:null}function nT(i,e,t=!0,n=Jn,s=.3){let r=e.poly.reduce((M,b)=>[M[0]+b[0]/e.poly.length,M[1]+b[1]/e.poly.length],[0,0]),o=Ef(i,r[0],r[1]),a=Tf(i,{x:o[0],z:o[1]});if(!a||a.face!==e)return null;let l=Hw(i,e,a),c=(t?n.short:n.long)+Jn.gap,u=(t?n.long:n.short)+Jn.gap,f=(i.roof.items??[]).filter(M=>M.kind!=="solar").flatMap(M=>{let[b,E]=Tc(i,[M.x,M.z]);if(Zx(i,b,E)!==e)return[];let _=M.x-a.c[0],A=M.z-a.c[2],R=Math.hypot(a.e2[0],a.e2[2])||1,L=_*a.e1[0]+A*a.e1[2],I=(_*a.e2[0]+A*a.e2[2])/R*Math.sqrt(1+e.plane.k**2),P=Math.max(M.w,M.d)/2+.25;return[[L-P,L+P,I-P,I+P]]}),h=l.map(M=>M[1]),d=Math.min(...h)+s,p=Math.max(...h)-s,x=null;for(let M=Math.floor((p-d+Jn.gap)/u);M>=1;M--){let b=M*u-Jn.gap;for(let E=d;E+b<=p+1e-9;E+=.05){let _=qx(l,E),A=qx(l,E+b);if(!_||!A)continue;let R=Math.max(_[0],A[0])+s,L=Math.min(_[1],A[1])-s;for(let[P,C,U,B]of f)B<E||U>E+b||((P+C)/2<(R+L)/2?R=Math.max(R,C):L=Math.min(L,P));let I=Math.floor((L-R+Jn.gap)/c);I<1||(!x||I*M>x.cols*x.rows||I*M===x.cols*x.rows&&M<x.rows)&&(x={cols:I,rows:M,a:(R+L)/2,b:E+b/2})}}if(!x)return null;let m=e.plane.k,g=Math.hypot(a.e2[0],a.e2[2])||1,y=x.b/(m>.03?Math.sqrt(1+m*m):1),S=a.c[0]+a.e1[0]*x.a+a.e2[0]/g*y,v=a.c[2]+a.e1[2]*x.a+a.e2[2]/g*y;return{cols:x.cols,rows:x.rows,x:Math.round(S*100)/100,z:Math.round(v*100)/100}}function iT(i,e,t=!1){let n=t?0:180,s=null,r=-1/0;for(let o of i.faces){let a=am(o.poly)*Math.sqrt(1+o.plane.k**2);if(a<3)continue;let c=-(o.plane.k<.05?60:Math.abs((Gw(i,o,e)-n+540)%360-180))+Math.min(10,a/3);c>r&&(s=o,r=c)}return s}function $x(i){return Sc[i.covering]??Sc.concrete_tiles}function Kx(i){let e=$x(i);return(e.tintable?fn(i.color):null)??e.color}var _s=(i,e,t,n)=>{let[s,r]=Ef(i,e,t);return[s,n,r]};function im(i,e,t,n,s=-1){let r=e.map(o=>i.vertex(o,t,n,pt,-1,s));for(let o=1;o+1<r.length;o++)i.tri(r[0],r[o],r[o+1],t);return r}function wf(i,e,t,n,s,r,o,a,l,c,u,f){if(l-o<1e-4&&c-a<1e-4)return;let h=(x,m)=>_s(e,t[0]+n[0]*x,t[1]+n[1]*x,e.base+m),[d,p]=Xi(e,u[0],u[1]);i.quad(h(s,o),h(r,a),h(r,Math.max(a,c)),h(s,Math.max(o,l)),[d,0,p],f,pt)}function Ac(i,e,t,n,s,r,o,a,l=[]){let c=Math.hypot(n[0]-t[0],n[1]-t[1]);if(c<1e-6)return;let u=[(n[0]-t[0])/c,(n[1]-t[1])/c];for(let[f,h,d,p]of lm(e,t,n,l)){let x=d+o,m=p+o;if(x<=r&&m<=r)continue;if(x>=r&&m>=r){wf(i,e,t,u,f,h,r,r,x,m,s,a);continue}let g=f+(r-x)/(m-x)*(h-f);x>r?wf(i,e,t,u,f,g,r,r,x,r,s,a):wf(i,e,t,u,g,h,r,r,r,m,s,a)}}function Ww(i,e,t,n,s,r,o,a,l,c,u,f){let h=p=>a+(p-r)/(o-r)*(l-a),d=[r,o];if(isFinite(u))for(let[p,x]of[[a-c,l-c],[a,l]])(p-u)*(x-u)<0&&d.push(r+(u-p)/(x-p)*(o-r));d.sort((p,x)=>p-x);for(let p=0;p+1<d.length;p++){let x=d[p],m=d[p+1];if(m-x<1e-6)continue;let g=h(x),y=h(m),S=Math.max(u,g-c),v=Math.max(u,y-c);wf(i,e,t,n,x,m,S,v,Math.max(S,g),Math.max(v,y),s,f)}}function Rf(i,e,t){let n=i.roof,s=e.geo,r=$x(n),o=(t==null?void 0:t.cover)??{surf:`roof:${n.covering}`,col:e.colour(Kx(n),!0)},a=(t==null?void 0:t.trim)??{surf:"jn:upvc",col:e.colour(fn(n.trim)??ms.upvc.color,!0)},l=(t==null?void 0:t.wall)??e.exterior;for(let d of i.faces){let p=Rc(i,d),x=d.poly.map(([S,v])=>_s(i,S,v,i.base+On(d.plane,S,v))),m=i.glass?e.glass:s;i.glass||m.useSurface(o.surf);let g=im(m,x,p,i.glass?e.colour(r.color,!0):o.col),y=Math.sqrt(1+d.plane.k*d.plane.k);d.poly.forEach(([S,v],M)=>{let b=g[M],E=d.plane;m.uv[b*2]=d.plane.k>1e-6?-E.n[1]*S+E.n[0]*v:S,m.uv[b*2+1]=d.plane.k>1e-6?(E.c-(E.n[0]*S+E.n[1]*v))*y:v}),i.glass&&Zw(i,d,e,a)}!i.glass&&n.shape!=="flat"&&Xw(i,e,o);let{A:c,B:u,T:f}=i;s.useSurface(l.surf),i.abut.left||Ac(s,i,[-c,u],[-c,-u],[-1,0],0,-f,l.col),i.abut.right||Ac(s,i,[c,-u],[c,u],[1,0],0,-f,l.col),i.abut.back||Ac(s,i,[-c,-u],[c,-u],[0,-1],0,-f,l.col),i.abut.front||Ac(s,i,[c,u],[-c,u],[0,1],0,-f,l.col);for(let d of i.gablets){let p=i.zones[0],x={...i,zones:[p]},m=d.outward<0?[d.u,u]:[d.u,-u],g=d.outward<0?[d.u,-u]:[d.u,u];Ac(s,x,m,g,[d.outward,0],d.foot,0,l.col)}let h=[["left",[i.u0,i.v1],[i.u0,i.v0],[-1,0],1,-c-i.u0,u],["right",[i.u1,i.v0],[i.u1,i.v1],[1,0],1,i.u1-c,u],["back",[i.u0,i.v0],[i.u1,i.v0],[0,-1],0,-u-i.v0,c],["front",[i.u1,i.v1],[i.u0,i.v1],[0,1],0,i.v1-u,c]];for(let[d,p,x,m,g,y,S]of h){if(i.abut[d]||n.shape==="flat"&&n.parapet)continue;let M=d==="left"&&i.party.left||d==="right"&&i.party.right?l:a;s.useSurface(M.surf);let b=Math.hypot(x[0]-p[0],x[1]-p[1]),E=[(x[0]-p[0])/b,(x[1]-p[1])/b],_=null;if(y<.005){let A=(-S-p[g])/E[g],R=(S-p[g])/E[g];_=[Math.min(A,R),Math.max(A,R)]}for(let[A,R,L,I]of lm(i,p,x,_??[])){let P=(A+R)/2,C=_&&P>_[0]&&P<_[1]?0:-1/0;Ww(s,i,p,E,m,A,R,L,I,f,C,M.col)}}if(!i.glass){s.useSurface(a.surf);let d=[[p=>p[1]-u],[p=>-u-p[1]],[p=>p[0]-c,p=>u-p[1],p=>p[1]+u],[p=>-c-p[0],p=>u-p[1],p=>p[1]+u]];for(let p of i.faces){let x=Rc(i,p),m=[-x[0],-x[1],-x[2]];for(let g of d){let y=om(p.poly,g);y.length<3||am(y)<1e-4||im(s,y.map(([S,v])=>_s(i,S,v,i.base+On(p.plane,S,v)-f)),m,a.col)}}}n.shape==="flat"&&n.parapet||qw(i,e),n.shape==="flat"&&n.parapet&&Jw(i,e,l)}function Xw(i,e,t){let n=e.geo;n.useSurface(t.surf);let s=[t.col[0]*.85,t.col[1]*.85,t.col[2]*.85],r=new Set,o=a=>`${a[0].toFixed(3)},${a[1].toFixed(3)}`;i.faces.forEach((a,l)=>{i.zones[a.zone].max||a.poly.forEach((c,u)=>{let f=a.poly[(u+1)%a.poly.length];if(Math.hypot(f[0]-c[0],f[1]-c[1])<.05)return;let h=[o(c),o(f)].sort().join("|");if(r.has(h))return;let d=i.faces.find((L,I)=>I!==l&&L.zone===a.zone&&L.poly.some((P,C)=>{let U=L.poly[(C+1)%L.poly.length];return o(P)===o(f)&&o(U)===o(c)||o(P)===o(c)&&o(U)===o(f)}));if(!d)return;r.add(h);let p=_s(i,c[0],c[1],i.base+On(a.plane,c[0],c[1])),x=_s(i,f[0],f[1],i.base+On(a.plane,f[0],f[1])),m=Rc(i,a),g=Rc(i,d),y=Sf([x[0]-p[0],x[1]-p[1],x[2]-p[2]]),S=(L,I)=>{let P=Sf(Yw(L,y)),C=I.poly.reduce((B,z)=>[B[0]+z[0]/I.poly.length,B[1]+z[1]/I.poly.length],[0,0]),U=_s(i,C[0],C[1],i.base+On(I.plane,C[0],C[1]));return P[0]*(U[0]-p[0])+P[1]*(U[1]-p[1])+P[2]*(U[2]-p[2])<0&&(P=[-P[0],-P[1],-P[2]]),P},v=S(m,a),M=S(g,d),b=Sf([m[0]+g[0],m[1]+g[1],m[2]+g[2]]),E=.14,_=.09,A=(L,I,P)=>[L[0]+I[0]*E+P[0]*.012,L[1]+I[1]*E+P[1]*.012,L[2]+I[2]*E+P[2]*.012],R=L=>[L[0]+b[0]*_,L[1]+b[1]*_,L[2]+b[2]*_];for(let[L,I]of[[v,m],[M,g]]){let P=Sf([I[0]*.7+b[0]*.3-L[0]*.2,I[1]*.7+b[1]*.3-L[1]*.2,I[2]*.7+b[2]*.3-L[2]*.2]);n.quad(A(p,L,I),A(x,L,I),R(x),R(p),P,s,pt)}})})}function qw(i,e){let t=e.geo;t.useSurface("role:blackMetal");let n=e.colour(2829359,!0),s=[["front",[i.u0,i.v1],[i.u1,i.v1],[0,1]],["back",[i.u1,i.v0],[i.u0,i.v0],[0,-1]],["left",[i.u0,i.v0],[i.u0,i.v1],[-1,0]],["right",[i.u1,i.v1],[i.u1,i.v0],[1,0]]];for(let[r,o,a,l]of s){if(i.abut[r]||r==="left"&&i.party.left||r==="right"&&i.party.right)continue;let c=lm(i,o,a);if(!c.length)continue;let u=c[0][2];if(c.some(([,,v,M])=>Math.abs(v-u)>.01||Math.abs(M-u)>.01))continue;let f=[(o[0]+a[0])/2-l[0]*.3,(o[1]+a[1])/2-l[1]*.3];if(Af(i,f[0],f[1])<=u+.01)continue;let h=Math.hypot(a[0]-o[0],a[1]-o[1]),[d,p]=Xi(i,l[0],l[1]),[x,m]=Ef(i,o[0],o[1]),[g,y]=Xi(i,(a[0]-o[0])/h,(a[1]-o[1])/h),S={e1:[g,0,y],e2:[d,0,p],n:[0,1,0],c:[x,i.base+u-i.T*.35,m]};Xt(t,S,-.02,h+.02,0,.12,-.08,0,n,-1,!0)}}var Yw=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]],Sf=i=>{let e=Math.hypot(i[0],i[1],i[2])||1;return[i[0]/e,i[1]/e,i[2]/e]};function Zw(i,e,t,n){let s=e.plane,r=t.geo;r.useSurface(n.surf);let o=s.k>1e-6?[-s.n[1],s.n[0]]:[1,0],a=e.poly.map(f=>f[0]*o[0]+f[1]*o[1]),l=Math.min(...a),c=Math.max(...a),u=Math.max(1,Math.round((c-l)/.65));for(let f=0;f<=u;f++){let h=l+(c-l)*f/u,d=.025,p=om(e.poly,[x=>x[0]*o[0]+x[1]*o[1]-(h-d),x=>h+d-(x[0]*o[0]+x[1]*o[1])]);p.length<3||im(r,p.map(([x,m])=>_s(i,x,m,i.base+On(s,x,m)+.03)),Rc(i,e),n.col)}}function Jw(i,e,t){let n=e.geo,s=Ec+.35,r=.2,{A:o,B:a}=i,l=[[[-o,a],[o,a],[0,1],"front"],[[o,-a],[-o,-a],[0,-1],"back"],[[-o,-a],[-o,a],[-1,0],"left"],[[o,a],[o,-a],[1,0],"right"]];for(let[c,u,f,h]of l){if(i.abut[h])continue;let d=g=>[g[0]-f[0]*r,g[1]-f[1]*r],p=(g,y)=>_s(i,g[0],g[1],i.base+y),[x,m]=Xi(i,f[0],f[1]);n.useSurface(t.surf),n.quad(p(c,0),p(u,0),p(u,s),p(c,s),[x,0,m],t.col,pt),n.quad(p(d(u),Ec),p(d(c),Ec),p(d(c),s),p(d(u),s),[-x,0,-m],t.col,pt),n.useSurface("cap"),n.quad(p(c,s),p(u,s),p(d(u),s),p(d(c),s),[0,1,0],e.colour(10132118,!0),pt)}}function Xt(i,e,t,n,s,r,o,a,l,c=-1,u=!1){let f=(d,p,x)=>[e.c[0]+e.e1[0]*d+e.e2[0]*p+e.n[0]*x,e.c[1]+e.e1[1]*d+e.e2[1]*p+e.n[1]*x,e.c[2]+e.e1[2]*d+e.e2[2]*p+e.n[2]*x],h=d=>[-d[0],-d[1],-d[2]];i.quad(f(t,s,a),f(n,s,a),f(n,r,a),f(t,r,a),e.n,l,pt,-1,c),i.quad(f(t,s,o),f(n,s,o),f(n,s,a),f(t,s,a),h(e.e2),l,pt,-1,c),i.quad(f(n,r,o),f(t,r,o),f(t,r,a),f(n,r,a),e.e2,l,pt,-1,c),i.quad(f(t,r,o),f(t,s,o),f(t,s,a),f(t,r,a),h(e.e1),l,pt,-1,c),i.quad(f(n,s,o),f(n,r,o),f(n,r,a),f(n,s,a),e.e1,l,pt,-1,c),u&&i.quad(f(t,r,o),f(n,r,o),f(n,s,o),f(t,s,o),h(e.n),l,pt,-1,c)}function cm(i,e,t,n,s,r,o,a,l=-1){let c=(u,f)=>[e.c[0]+e.e1[0]*u+e.e2[0]*f+e.n[0]*o,e.c[1]+e.e1[1]*u+e.e2[1]*f+e.n[1]*o,e.c[2]+e.e1[2]*u+e.e2[2]*f+e.n[2]*o];i.quad(c(t,s),c(n,s),c(n,r),c(t,r),e.n,a,pt,-1,l)}function $w(i,e,t,n,s,r,o){let a=(p,x)=>Array.from({length:o},(m,g)=>{let y=g/o*Math.PI*2;return[e[0]+Math.cos(y)*x,e[1]+p,e[2]+Math.sin(y)*x]}),l=a(0,t),c=a(n,t*s);for(let p=0;p<o;p++){let x=(p+1)%o,m=(p+.5)/o*Math.PI*2;i.quad(l[p],l[x],c[x],c[p],[Math.cos(m),0,Math.sin(m)],r,pt)}let u=a(n-.02,t*s*.8),f=[r[0]*.25,r[1]*.25,r[2]*.25],h=i.vertex([e[0],e[1]+n-.02,e[2]],[0,1,0],f,pt),d=u.map(p=>i.vertex(p,[0,1,0],f,pt));for(let p=0;p<o;p++)i.tri(h,d[p],d[(p+1)%o],[0,1,0]);for(let p=0;p<o;p++){let x=(p+1)%o;i.quad(c[p],c[x],u[x],u[p],[0,1,0],r,pt)}}var sT={window:{name:"Roof window",w:.78,d:1.18},chimney:{name:"Chimney",w:1.1,d:.6,h:1},dormer:{name:"Dormer",w:2.2,d:2,h:1.3},solar:{name:"Solar panels",w:0,d:0},lantern:{name:"Roof lantern",w:2,d:1.2,h:.5}};function jx(i,e,t,n){if(e.kind==="chimney")return Qw(i,e,t);if(e.kind==="dormer")return eA(i,e,t,n);if(e.kind==="lantern")return tA(i,e,t);let s=Tf(i,e);s&&(e.kind==="window"?Kw(e,s,t):e.kind==="solar"&&jw(e,s,t))}function Kw(i,e,t){let n=t.geo,s=i.w/2,r=i.d/2,o=i.style==="conservation",a=fn(i.color)??(o?2763566:6120039),l=t.colour(a,!0),c=o?.05:.07,u=o?.05:.1;n.useSurface("role:dark"),Xt(n,e,-s-.05,s+.05,-r-.05,r+.05,0,.015,t.colour(3882821,!0)),n.useSurface("jn:aluminium"),Xt(n,e,-s,s,-r,-r+c,.01,u,l),Xt(n,e,-s,s,r-c,r,.01,u,l),Xt(n,e,-s,-s+c,-r+c,r-c,.01,u,l),Xt(n,e,s-c,s,-r+c,r-c,.01,u,l),o&&Xt(n,e,-.015,.015,-r+c,r-c,.01,u+.005,l);let f=t.glows.length;t.glows.push({kind:"window",entity:i.entity??null,room:t.roomAt([i.x,i.z])}),cm(t.glass,e,-s+c,s-c,-r+c,r-c,u-.02,t.colour(11128802,!0),f)}function jw(i,e,t){let n=t.geo,s=Math.max(1,Math.round(i.cols??1)),r=Math.max(1,Math.round(i.rows??1)),o=i.portrait??!0,a=Tm(i),l=o?a.short:a.long,c=o?a.long:a.short,u=i.style==="blue",f=t.colour(u?12172996:2303273,!0),h=t.colour(u?2308458:1382429,!0),d=t.glows.length;t.glows.push({kind:"screen",entity:i.entity??null,room:pt,type:"solar_panels"});let p=e.slope<1&&i.tilt?Math.max(0,Math.min(60,i.tilt)):0,{w:x}=Rm(i),m=p?c*(Math.cos(p*Cn)+1.4*Math.sin(p*Cn))+Jn.gap:c+Jn.gap,g=m*r-Jn.gap;for(let y=0;y<r;y++){let S=-g/2+y*m,v=e,M=.06;if(p){let E=p*Cn,_=Math.cos(E),A=Math.sin(E),R=[e.c[0]+e.e2[0]*S,e.c[1]+e.e2[1]*S+.12,e.c[2]+e.e2[2]*S],L=[e.e2[0]*_+e.n[0]*A,e.e2[1]*_+e.n[1]*A,e.e2[2]*_+e.n[2]*A],I=[-e.e2[0]*A+e.n[0]*_,-e.e2[1]*A+e.n[1]*_,-e.e2[2]*A+e.n[2]*_];v={...e,c:R,e2:L,n:I},M=0,n.useSurface("role:metal");for(let P of[-x/2+.05,x/2-.05])Xt(n,{...e,c:[R[0],e.c[1],R[2]]},P-.02,P+.02,c*_-.04,c*_,0,.12+c*A,t.colour(12172996,!0))}let b=p?0:S;for(let E=0;E<s;E++){let _=-x/2+E*(l+Jn.gap);n.useSurface(u?"role:metal":"role:blackMetal"),Xt(n,v,_,_+l,b,b+c,M,M+.035,f,-1,p>0),n.useSurface("pv"),cm(n,v,_+.02,_+l-.02,b+.02,b+c-.02,M+.037,h,d)}}}function Qw(i,e,t){let n=t.geo,[s,r]=Tc(i,[e.x,e.z]),o=(e.rotation??i.roof.rotation??0)*Cn,a=[Math.cos(o),0,Math.sin(o)],l=[-Math.sin(o),0,Math.cos(o)],c=Math.max(.3,e.w),u=Math.max(.3,e.d),f=1/0;for(let[E,_]of[[-1,-1],[1,-1],[1,1],[-1,1]]){let A=[e.x+a[0]*E*c/2+l[0]*_*u/2,e.z+a[2]*E*c/2+l[2]*_*u/2],[R,L]=Tc(i,A);f=Math.min(f,Af(i,R,L))}let h=i.base+Math.max(-i.T,f-.35),d=i.base+Af(i,s,r)+Math.max(.3,e.h??1),p=e.style==="render"||e.style==="stone"?e.style:"brick",x=t.exterior,m=p==="render"?"render":p==="stone"?"stone":x.surf.startsWith("ext:brick")?x.surf.slice(4):"brick",g=ci[m]??ci.brick,y=(g.tintable?fn(e.color):null)??g.color,S=t.colour(y,!0),v={e1:a,e2:l,n:[0,1,0],c:[e.x,0,e.z]};n.useSurface(`ext:${m}`),Xt(n,v,-c/2,c/2,-u/2,u/2,h,d-.3,S),Xt(n,v,-c/2-.03,c/2+.03,-u/2-.03,u/2+.03,d-.3,d-.2,S,-1,!0),Xt(n,v,-c/2,c/2,-u/2,u/2,d-.2,d-.06,S),n.useSurface("role:concrete"),Xt(n,v,-c/2-.04,c/2+.04,-u/2-.04,u/2+.04,d-.06,d,t.colour(11118496,!0),-1,!0);let M=Math.max(0,Math.min(6,Math.round(e.pots??(c>=.8?2:1))));n.useSurface("role:pot");let b=t.colour(11887935,!0);for(let E=0;E<M;E++){let _=M===1?0:-c/2+.2+(c-.4)*E/(M-1);$w(n,[e.x+a[0]*_,d,e.z+a[2]*_],.11,.42,.82,b,t.low?6:10)}}function eA(i,e,t,n){let s=Tf(i,e);if(!s||s.slope<10)return;let r=t.geo,o=s.face.plane.k,a=Xi(i,-s.face.plane.n[0],-s.face.plane.n[1]),l=[s.e1[0],s.e1[2]],c=Math.max(.8,e.w),u=[e.x-a[0]*e.d/2,e.z-a[1]*e.d/2],[f,h]=Tc(i,u),d=Af(i,f,h),p=kw(i),x=e.style==="box"||e.style==="hipped"?e.style:"gable",m=Math.max(25,Math.min(50,i.roof.pitch||35)),g=x==="box"?.15:(c/2+.1)*Math.tan(m*Cn),y=Math.max(.6,Math.min(e.h??(x==="box"?p-d-.35:1.3),p-d-g-.1)),S=d+y,v=Math.max(.5,(S+g-d)/Math.max(.05,o)+.3),M={surf:`roof:${i.roof.covering==="glass"?"felt":i.roof.covering}`,col:t.colour(Kx(i.roof),!0)},b={surf:"jn:upvc",col:t.colour(fn(e.color)??ms.upvc.color,!0)},E=(H,ue)=>[H[0],i.base+ue,H[1]],_=(H,ue)=>[u[0]+l[0]*H+a[0]*ue,u[1]+l[1]*H+a[1]*ue],A=y/Math.max(.05,o);r.useSurface(M.surf);for(let H of[-1,1]){let ue=H*c/2,de=[l[0]*H,0,l[1]*H],G=r.vertex(E(_(ue,0),d-.05),de,M.col,pt),le=r.vertex(E(_(ue,0),S),de,M.col,pt),ge=r.vertex(E(_(ue,A+.05),S),de,M.col,pt);r.tri(G,le,ge,de)}let R=[-a[0],0,-a[1]],L=Math.max(.4,c-.35),I=Math.max(.35,y-.4),P=d+.22,C=(H,ue)=>E(_(H,0),ue);r.useSurface(b.surf),r.quad(C(-c/2,d-.05),C(c/2,d-.05),C(c/2,P),C(-c/2,P),R,b.col,pt),r.quad(C(-c/2,P+I),C(c/2,P+I),C(c/2,S),C(-c/2,S),R,b.col,pt),r.quad(C(-c/2,P),C(-L/2,P),C(-L/2,P+I),C(-c/2,P+I),R,b.col,pt),r.quad(C(L/2,P),C(c/2,P),C(c/2,P+I),C(L/2,P+I),R,b.col,pt);let U={e1:[l[0],0,l[1]],e2:[0,1,0],n:R,c:E(_(0,.06),P+I/2)};Xt(r,U,-L/2,L/2,-I/2,-I/2+.06,-.06,0,b.col),Xt(r,U,-L/2,L/2,I/2-.06,I/2,-.06,0,b.col),Xt(r,U,-L/2,-L/2+.06,-I/2+.06,I/2-.06,-.06,0,b.col),Xt(r,U,L/2-.06,L/2,-I/2+.06,I/2-.06,-.06,0,b.col),L>1&&Xt(r,U,-.03,.03,-I/2+.06,I/2-.06,-.06,0,b.col);let B=t.glows.length;t.glows.push({kind:"window",entity:e.entity??null,room:t.roomAt([e.x,e.z])}),cm(t.glass,U,-L/2+.06,L/2-.06,-I/2+.06,I/2-.06,-.04,t.colour(11128802,!0),B);let z=_(0,v/2),j=Math.atan2(a[1],a[0])*180/Math.PI,q={id:`${e.id}_roof`,x:z[0],z:z[1],w:v,d:c,rotation:j,shape:x==="box"?"flat":x==="hipped"?"hip":"gable",pitch:m,covering:x==="box"?"felt":i.roof.covering,color:i.roof.color,trim:e.color??i.roof.trim??null,overhang:x==="box"?.1:.15,party:x==="hipped"?"right":null},k=rm(q,i.base+S-(x==="box"?Ec:0),{wallHalf:.04,abut:{right:!0}});Rf(k,t,{wall:M,trim:b,cover:x==="box"?void 0:M})}function tA(i,e,t){let n=Tf(i,e);if(!n)return;let s=t.geo,r=Math.max(.6,e.w),o=Math.max(.6,e.d),a=.22,l=fn(e.color)??3685954,c=t.colour(l,!0),u=n.slope<1?Math.atan2(n.e1[2],n.e1[0])/Cn:i.roof.rotation;s.useSurface("jn:aluminium"),Xt(s,n,-r/2,r/2,-o/2,o/2,-.05,a,c);let f=Math.max(.2,e.h??.5),h=Math.atan(f/(Math.min(r,o)/2))/Cn,d={id:`${e.id}_glass`,x:e.x,z:e.z,w:r,d:o,rotation:u,shape:"hip",pitch:h,covering:"glass",overhang:.02,trim:e.color??"#383e42"},p=rm(d,n.c[1]+a,{wallHalf:0}),x=t.glows.length;t.glows.push({kind:"window",entity:e.entity??null,room:t.roomAt([e.x,e.z])});let m=t.glass.vertexCount;Rf(p,t,{trim:{surf:"jn:aluminium",col:c}});for(let g=m;g<t.glass.vertexCount;g++)t.glass.glow[g]=x}var nA=(i,e)=>({...e,...i}),Qx={wood:13214330,woodDark:9071183,fabric:10134445,fabricDark:7305347,cushion:12041926,white:15855594,metal:12172996,dark:3882821,glass:12573158,plant:7315035,pot:13204573,accent:14263361,screen:2237996,ceramic:16250869,rug:13154726,mattress:16052716,bulb:15985368,leaf:5209925,soil:5127214,red:11880507,blue:4878245,paper:15525852,canvas:14271392,mirror:13622758,water:7320521,rubber:2829359,pine:14264421,softwood:15126435,oak:12819052,walnut:7229240,primed:15987438,blackMetal:2763566,concrete:11776168,brick:10902852,shiplap:11108952,logs:11831902,corrugated:7307114,felt:3816512,shingle:5916740,epdm:2829359,sedum:7113546,corten:9325356,galvanised:11120304,sleeper:6968384,stone:11905944,rattan:9136709,bloom:14251931,lavender:9338051,straw:13218940},iA={name:"day",outdoor:{lawn:10273402,patio:13222581,deck:11897442,path:12235686,driveway:10391428,asphalt:6514283,bed:8085061,gravel:13617339},background:15330801,ground:14213075,wallInner:16052974,wallOuter:15129807,wallCap:6053734,wallCut:4079944,slab:9211796,glass:11128802,glassLit:16767392,roles:Qx,ambient:1,lampGain:.55,text:2040617,accent:3112182},sA={name:"night",outdoor:{lawn:4284474,patio:7236195,deck:6967872,path:6709851,driveway:6051408,asphalt:3619133,bed:4864556,gravel:7301988},background:791072,ground:1317932,wallInner:10134450,wallOuter:7239559,wallCap:2830912,wallCut:5211824,slab:2304568,glass:3428458,glassLit:16762746,roles:nA({white:13225170,primed:13225170,ceramic:14014427,mattress:13619926,bulb:9276035,screen:856085},Qx),ambient:.34,lampGain:1,text:15265528,accent:5687295};function rA(i,e=!1){let t=i>>16&255,n=i>>8&255,s=i&255,r=e?[.44,.48,.52]:[.63,.66,.74];return Math.round(t*r[0])<<16|Math.round(n*r[1])<<8|Math.round(s*r[2])}function hi(i,e,t=!1){return i.name==="night"?rA(e,t):e}function oT(i){return i==="night"?sA:iA}var qn=.18;function hm(i){return!!i&&(i.kind==="deck"||(i.height??0)>.02)}function If(i,e){let t=i.outdoor??[],n=t[e],s=r=>r.kind==="deck"&&(r.height===null||r.height===void 0);return n&&s(n)?-.012+.002*Math.min(5,t.slice(0,e).filter(s).length):hm(n)?-qn+Math.max(.03,n.height??0)+.002*Math.min(5,e):-qn+.004+((n==null?void 0:n.kind)==="patio"?.012:0)+.003*e}function c_(i,e){let t=-1;return(i.outdoor??[]).forEach((n,s)=>{Kt(e,n.points)&&(t<0||If(i,s)>If(i,t))&&(t=s)}),t}function e_(i,e){let t=c_(i,e);return t>=0&&hm(i.outdoor[t])?If(i,t):-qn}var oA=1.5,t_=.32,aA=128,n_=new Map;function kt(i){let e=n_.get(i);if(!e){let t=new Se().setHex(i);e=[t.r,t.g,t.b],n_.set(i,e)}return e}function um(i,e,t,n,s,r){let o=(t.tintable?fn(n):null)??t.color;return{surf:`${i}:${e}`,col:kt(hi(s,o,r))}}function ST(i,e,t,n){let s=i.floors[e],r=Bf(s,i.settings),o=new Hi,a=new Hi;a.useSurface("glass");let l=[],c=[],u=[],f=[],h=[],d=[],p=[],x=new Map;for(let G of s.openings)x.set(G.id,p.length),p.push({kind:"opening",id:G.id});let m=s.elevation;o.uvY0=m,a.uvY0=m;let g=n.low?t_*1.4:t_,y=s.rooms.map((G,le)=>({index:le,id:G.id,name:G.name,area_id:G.area_id,label:zo(G.points),area:Math.abs(G.points.reduce((ge,X,Y)=>{let he=G.points[(Y+1)%G.points.length];return ge+X[0]*he[1]-he[0]*X[1]},0))/2})),S=s.outdoor??[];S.forEach((G,le)=>y.push({index:s.rooms.length+le,id:G.id,name:G.name,area_id:G.area_id,label:zo(G.points),area:0,outdoor:!0}));let v=G=>{for(let ge=0;ge<s.rooms.length;ge++)if(Kt(G,s.rooms[ge].points))return ge;let le=c_(s,G);return le>=0?s.rooms.length+le:pt},M=s.exterior_finish??i.settings.exterior_finish??"render",b=ci[M]??ci.render,E=um("ext",M,b,s.exterior_finish?s.exterior_color:i.settings.exterior_color,t,!0),_=s.rooms.map(G=>{let le=G.wall_finish??"paint",ge=bc[le]??bc.paint;return le==="paint"&&!fn(G.wall_color)?{surf:"wall:paint",col:kt(t.wallInner)}:um("wall",le,ge,G.wall_color,t,!1)}),A=G=>G===wi||G<0?E:_[G]??_[0]??E;S.forEach((G,le)=>fA(o,a,i,s,G,le,t,g*2,n.low));let R=IA(i,e),L=R.map(G=>hr(G.hole)),I=(G,le)=>G.minX<le.maxX&&le.minX<G.maxX&&G.minZ<le.maxZ&&le.minZ<G.maxZ,P=(G,le)=>R[G].room<0||R[G].room===le,C=(G,le)=>{let ge=[G];return R.forEach((X,Y)=>{P(Y,le)&&(ge=ge.flatMap(he=>I(hr(he),L[Y])?RA(he,X.hole):[he]))}),ge};s.rooms.forEach((G,le)=>{let ge=G.floor&&G.floor in vc?G.floor:"wood",X=vc[ge];o.useSurface(`floor:${ge}`);let Y=kt(hi(t,X.color)),he=hr(G.points),Re=G.points.map((se,ae)=>[se,G.points[(ae+1)%G.points.length]]),me=(se,ae)=>Math.min(...Re.map(([fe,Pe])=>Vo([se,ae],fe,Pe).d)),Ie=[0,1,0],je=[0,-1,0],ee=L.some((se,ae)=>P(ae,le)&&I(he,se)),re=[];for(let se=Math.floor(he.minX/g)*g;se<he.maxX;se+=g)for(let ae=Math.floor(he.minZ/g)*g;ae<he.maxZ;ae+=g){let fe=h_(G.points,se,ae,se+g,ae+g);if(!(fe.length<3))for(let Pe of ee?C(fe,le):[fe]){let Ue=jt.triangulateShape(Pe.map(([Ye,F])=>new oe(Ye,F)),[]),qe=Pe.map(([Ye,F])=>o.vertex([Ye,m,F],Ie,Y,le,-1,-1,.8+.2*Math.min(1,me(Ye,F)/.55)));for(let[Ye,F,ht]of Ue)o.tri(qe[Ye],qe[F],qe[ht],Ie);ee&&re.push(Pe)}}o.useSurface("slab");for(let se of ee?re:[G.points]){let ae=jt.triangulateShape(se.map(([Pe,Ue])=>new oe(Pe,Ue)),[]),fe=se.map(([Pe,Ue])=>o.vertex([Pe,m-qn,Ue],je,kt(t.slab),xs));for(let[Pe,Ue,qe]of ae)o.tri(fe[Pe],fe[Ue],fe[qe],je)}}),o.useSurface("wall:paint");let U=R.length?Bf(i.floors[e-1],i.settings).walls:[],B=G=>U.some(le=>Vo(G,le.a,le.b).d<le.thickness/2+.02);for(let{hole:G,room:le}of R){let ge=G.reduce((Y,he)=>Y+he[0],0)/G.length,X=G.reduce((Y,he)=>Y+he[1],0)/G.length;G.forEach((Y,he)=>{let Re=G[(he+1)%G.length],me=Math.hypot(Re[0]-Y[0],Re[1]-Y[1])||1,Ie=[(Re[1]-Y[1])/me,0,-(Re[0]-Y[0])/me];(ge-(Y[0]+Re[0])/2)*Ie[0]+(X-(Y[1]+Re[1])/2)*Ie[2]<0&&(Ie=[-Ie[0],0,-Ie[2]]);let je=Math.max(1,Math.ceil(me/.25));for(let ee=0;ee<je;ee++){let re=[Y[0]+(Re[0]-Y[0])*ee/je,Y[1]+(Re[1]-Y[1])*ee/je],se=[Y[0]+(Re[0]-Y[0])*(ee+1)/je,Y[1]+(Re[1]-Y[1])*(ee+1)/je],ae=[(re[0]+se[0])/2,(re[1]+se[1])/2],fe=s.rooms.findIndex(Pe=>Kt(ae,Pe.points));fe<0||le>=0&&fe!==le||B(ae)||o.quad([re[0],m-qn,re[1]],[se[0],m-qn,se[1]],[se[0],m,se[1]],[re[0],m,re[1]],Ie,kt(t.wallInner),fe)}})}let z=e===0,j=e<i.floors.length-1;r.walls.forEach((G,le)=>{let ge=le<aA?le:-1;gA(o,a,G,ge,m,t,g,l,f,u,z?-qn:0,j?G.height-.003:G.height,A(G.roomA),A(G.roomB),x,n.low),!z&&G.exterior&&mA(o,G,m,E)});for(let G of r.walls)if(!G.exterior)for(let le of G.openings)le.opening.kind!=="window"&&h.push({a:G.roomA,b:G.roomB,pos:[le.centre[0],m+1,le.centre[1]],width:le.t1-le.t0,entity:le.opening.entity??null,door:le.opening.kind==="door"});let q=new Set(s.furniture.map(G=>G.entity).filter(Boolean)),k=s.devices.filter(G=>G.entity.startsWith("light.")&&!q.has(G.entity)).map(G=>{let ge=S.some(Re=>Kt([G.x,G.z],Re.points))&&!s.rooms.some(Re=>Kt([G.x,G.z],Re.points))&&G.mount!=="wall"?"lamp_garden":dA(G.mount),[X,Y,he]=Ff[ge].size;return{id:`dev_${G.id}`,type:ge,x:G.x,z:G.z,rotation:G.rotation??0,w:X,d:Y,h:he,y:G.y??void 0,entity:G.entity}});for(let G of[...s.furniture,...k]){let le=G.id.startsWith("dev_");o.currentItem=a.currentItem=p.length,p.push({kind:le?"device":"furniture",id:le?G.id.slice(4):G.id});let ge=kc(G.type),X=v([G.x,G.z]),Y=ge.category==="lights",he=Am.has(G.type),Re=X>=s.rooms.length,me=m+Vc(G,s.height)+(Re?e_(s,[G.x,G.z]):0),Ie=ge.build(G.w,G.d,G.h,G),je=-1;(Y||Ie.some(re=>re.glow==="screen"))&&(je=l.length,l.push({kind:Y?"lamp":"screen",entity:G.entity??null,room:X,type:G.type}));let ee=Vc(G,s.height)>.05;if(Cf(o,Ie,G,me,ee,X,je,t,n.low,a),Y){let re=Ie.reduce((fe,Pe)=>Math.max(fe,Pe.y+Pe.h),-10),se=Ie.reduce((fe,Pe)=>Math.min(fe,Pe.y),10),ae=he?me+se:me+re-.1;c.push({id:G.id,entity:G.entity??null,room:X,pos:[G.x,ae,G.z],type:G.type,glow:je,radius:pA[G.type]??3.2})}else je>=0&&d.push({furniture:G,glow:je,entity:G.entity??null})}for(let G of s.fences??[]){o.currentItem=a.currentItem=p.length,p.push({kind:"fence",id:G.id});let le=Zp(G);for(let ge of Yp(G,n.low)){let X=[ge.item.x,ge.item.z];Cf(o,ge.parts,ge.item,m+e_(s,X),!1,v(X),-1,t,n.low,a,le)}}let H=[];for(let G of s.devices){if(!G.entity.startsWith("camera."))continue;let le=Rx(s,r,G);H.push(le),o.currentItem=a.currentItem=p.length,p.push({kind:"device",id:G.id});let ge=v(le.lens);for(let X of Cx(le))Cf(o,X.parts,X.item,m+X.bottom,!0,ge,-1,t,n.low,a)}o.currentItem=a.currentItem=-1;let ue=s.rooms.flatMap(G=>G.points),de={floor:s,items:p,index:e,opaque:o,glass:a,layout:r,rooms:y,glows:l,lamps:c,doors:u,windows:f,portals:h,screens:d,cameras:H,bounds:ue.length?hr(ue):{minX:0,minZ:0,maxX:1,maxZ:1},roof:new Hi,roofGlass:new Hi,roofs:[],glowsBase:l.length,itemsBase:p.length};return lA(i,de,t,n),de}function lA(i,e,t,n){let s=e.index,r=i.floors[s];e.glows.length=e.glowsBase,e.items.length=e.itemsBase;let o=new Hi,a=new Hi;a.useSurface("glass"),o.uvY0=a.uvY0=r.elevation;let l=r.exterior_finish??i.settings.exterior_finish??"render",c=ci[l]??ci.render,u={geo:o,glass:a,glows:e.glows,low:n.low,colour:(h,d)=>kt(hi(t,h,d)),exterior:um("ext",l,c,r.exterior_finish?r.exterior_color:i.settings.exterior_color,t,!0),roomAt:h=>r.rooms.findIndex(d=>Kt(h,d.points))},f=Jx(i,s);for(let h of f){o.currentItem=a.currentItem=e.items.length,e.items.push({kind:"roof",id:h.roof.id}),Rf(h,u);for(let d of h.roof.items??[])o.currentItem=a.currentItem=e.items.length,e.items.push({kind:"roofitem",id:d.id}),jx(h,d,u,r)}o.currentItem=a.currentItem=-1,e.roof=o,e.roofGlass=a,e.roofs=f}function u_(i,e){let t=fn(Wx(i));return{surf:i.kind==="deck"?tm(Mf(i)):bf(i)?em(Qp(i)):`out:${Of(i)}`,col:kt(t!==null?hi(e,t,!0):e.outdoor[Of(i)]??e.outdoor.lawn)}}function cA(i,e){if(!i.border)return null;if(i.kind==="deck"){if(i.border!=="frame")return null;let s=Mf(i);return{look:u_(i,e),width:(s.width+6)/1e3}}if(!bf(i)||!kx.includes(i.border))return null;let t=i.border,n=jp(t,{pattern:t==="setts"?"grid":"stretcher",unit:Vx[t],color:i.border_color,joint:i.joint});return{look:{surf:em(n),col:kt(hi(e,fn(n.color),!0))},width:n.unit[1]/1e3}}function uA(i,e,t){if(i.kind==="deck")return{surf:t.surf,col:t.col.map(r=>r*.85)};let n=i.walls??"brick";if(n==="sleepers")return{surf:tm({boards:"softwood",color:"#6a5440",width:194}),col:kt(hi(e,6968384,!0))};let s=n==="stone"?"stone":n==="render"?"render":"brick";return{surf:`ext:${s}`,col:kt(hi(e,ci[s].color,!0))}}function i_(i,e,t){let n=-e[1]*t[0]+e[0]*t[1]<0?-1:1,s=e[0]*n,r=e[1]*n;return{c:s,s:r,ou:i[0]*s+i[1]*r,ov:-i[0]*r+i[1]*s}}function hA(i,e,t,n,s,r){let o=[0,1,0],a=hr(e);for(let l=Math.floor(a.minX/r)*r;l<a.maxX;l+=r)for(let c=Math.floor(a.minZ/r)*r;c<a.maxZ;c+=r){let u=h_(e,l,c,l+r,c+r);if(u.length<3)continue;let f=jt.triangulateShape(u.map(([d,p])=>new oe(d,p)),[]),h=u.map(([d,p])=>i.vertex([d,t,p],o,n,s));for(let[d,p,x]of f)i.tri(h[d],h[p],h[x],o)}}function fA(i,e,t,n,s,r,o,a,l){if(s.points.length<3)return;let c=n.rooms.length+r,u=n.elevation,f=u+If(n,r),h=u-qn,d=u_(s,o),p=cA(s,o),x=_f(s.points),m=p?Jp(s.points,p.width):s.points;if(i.useSurface(d.surf),i.uvFrame=Hx(m,Gx(s)),hA(i,m,f,d.col,c,a),i.uvFrame=null,p&&(i.useSurface(p.look.surf),s.points.forEach((E,_)=>{let A=Rn(s.points,_,x);if(A.len<.01)return;let R=(_+1)%s.points.length;i.uvFrame=i_(E,A.dir,[-A.out[0],-A.out[1]]),i.quad([E[0],f,E[1]],[A.b[0],f,A.b[1]],[m[R][0],f,m[R][1]],[m[_][0],f,m[_][1]],[0,1,0],p.look.col,c,-1,-1,Math.max(1,Math.ceil(A.len/a)),1)}),i.uvFrame=null),!hm(s))return;let g=Ux(n,s,t.settings.wall_exterior),y=uA(s,o,d),S=s.kind==="deck",v=S?0:.03,M=S?0:.04;s.points.forEach((E,_)=>{if(!g[_])return;let A=Rn(s.points,_,x);if(A.len<.01)return;let R=[A.out[0],0,A.out[1]],L=Math.max(1,Math.ceil(A.len/a)),I=A.b;if(v){i.useSurface(d.surf),i.quad([E[0],f-M,E[1]],[I[0],f-M,I[1]],[I[0],f,I[1]],[E[0],f,E[1]],R,d.col.map(U=>U*.9),c,-1,-1,L,1);let P=[E[0]-A.out[0]*v,E[1]-A.out[1]*v],C=[I[0]-A.out[0]*v,I[1]-A.out[1]*v];i.quad([E[0],f-M,E[1]],[P[0],f-M,P[1]],[C[0],f-M,C[1]],[I[0],f-M,I[1]],[0,-1,0],d.col.map(U=>U*.6),c,-1,-1,L,1),i.useSurface(y.surf),i.quad([P[0],h-.01,P[1]],[C[0],h-.01,C[1]],[C[0],f-M,C[1]],[P[0],f-M,P[1]],R,y.col,c,-1,-1,L,1)}else i.useSurface(y.surf),i.quad([E[0],h-.01,E[1]],[I[0],h-.01,I[1]],[I[0],f,I[1]],[E[0],f,E[1]],R,y.col,c,-1,-1,L,1)});for(let E of s.steps??[])for(let _ of Ox(s.points,E,f-h)){let[A,R,L,I]=_.corners,P=h+_.top;i.useSurface(d.surf),i.uvFrame=i_(I,_.dir,[-_.out[0],-_.out[1]]),i.quad([A[0],P,A[1]],[R[0],P,R[1]],[L[0],P,L[1]],[I[0],P,I[1]],[0,1,0],d.col,c,-1,-1,Math.max(1,Math.ceil(Math.hypot(R[0]-A[0],R[1]-A[1])/a)),1),i.uvFrame=null,i.useSurface(y.surf);let C=h-.01;i.quad([I[0],C,I[1]],[L[0],C,L[1]],[L[0],P,L[1]],[I[0],P,I[1]],[_.out[0],0,_.out[1]],y.col,c),i.quad([R[0],C,R[1]],[L[0],C,L[1]],[L[0],P,L[1]],[R[0],P,R[1]],[_.dir[0],0,_.dir[1]],y.col,c),i.quad([A[0],C,A[1]],[I[0],C,I[1]],[I[0],P,I[1]],[A[0],P,A[1]],[-_.dir[0],0,-_.dir[1]],y.col,c)}let b=s.railing&&s.railing in Fn?s.railing:null;if(b)for(let[E,_]of Bx(s.points,g,s.steps??[]).entries()){let A={id:`${s.id}_rail${E}`,points:_,style:b,height:Math.min(1.1,Fn[b].height),gates:[],gravel_board:!1},R=Zp(A);for(let L of Yp(A,l))Cf(i,L.parts,L.item,f,!1,c,-1,o,l,e,R)}}function dA(i){return i==="floor"?"lamp_floor":i==="table"?"lamp_table":i==="wall"?"lamp_wall":"lamp_ceiling"}var pA={lamp_ceiling:4.6,lamp_pendant:4,lamp_globe:4,lamp_chandelier:4.8,lamp_downlight:3,lamp_spots:3.4,lamp_floor:3.4,lamp_arc:3.4,lamp_table:2.4,lamp_wall:2.8,led_strip:2.6,lamp_garden:3,lamp_post:3.6};function mA(i,e,t,n){let s=e.roomA===wi?1:-1,r=s*(e.thickness/2-.005),o=[e.normal[0]*s,0,e.normal[1]*s],a=(u,f)=>[e.a[0]+e.dir[0]*u+e.normal[0]*r,t+f,e.a[1]+e.dir[1]*u+e.normal[1]*r],l=-e.extendStart,c=e.length+e.extendEnd;i.useSurface(n.surf),s>0?i.quad(a(l,-qn),a(c,-qn),a(c,0),a(l,0),o,n.col,xs):i.quad(a(c,-qn),a(l,-qn),a(l,0),a(c,0),o,n.col,xs)}function gA(i,e,t,n,s,r,o,a,l,c,u,f,h,d,p,x){let m=t.thickness/2,g=-t.extendStart,y=t.length+t.extendEnd,S=[],v=g;for(let C of t.openings)C.t0>v+.005&&S.push([v,C.t0,u,f,!1]),C.bottom>.02?S.push([C.t0,C.t1,u,C.bottom,!1]):C.t1>C.t0&&S.push([C.t0,C.t1,u,-.005,!1]),C.top<f-.02&&S.push([C.t0,C.t1,C.top,f,C.top>=oA]),v=Math.max(v,C.t1);y>v+.005&&S.push([v,y,u,f,!1]);let M=(C,U,B)=>[t.a[0]+t.dir[0]*C+t.normal[0]*U,s+B,t.a[1]+t.dir[1]*C+t.normal[1]*U],b=[t.normal[0],0,t.normal[1]],E=[-t.normal[0],0,-t.normal[1]],_=t.roomA===wi?pt:t.roomA,A=t.roomB===wi?pt:t.roomB,R=n>=0?n*2:-1,L=n>=0?n*2+1:-1,I=kt(r.wallCap),P=t.roomA===wi?d:h;for(let[C,U,B,z,j]of S){let q=U-C,k=z-B;if(q<.004||k<.004)continue;let H=j&&R>=0?R+gs:R,ue=j&&L>=0?L+gs:L,de=Math.max(1,Math.round(q/o)),G=Math.max(1,Math.round(k/o));i.useSurface(h.surf),s_(i,()=>i.quad(M(C,m,B),M(U,m,B),M(U,m,z),M(C,m,z),b,h.col,_,H,-1,de,G),s),i.useSurface(d.surf),s_(i,()=>i.quad(M(U,-m,B),M(C,-m,B),M(C,-m,z),M(U,-m,z),E,d.col,A,H,-1,de,G),s),i.useSurface("cap"),i.quad(M(C,m,z),M(U,m,z),M(U,-m,z),M(C,-m,z),[0,1,0],I,xs,z>=f-.01?ue:H),i.useSurface(P.surf),B>.02&&i.quad(M(C,m,B),M(C,-m,B),M(U,-m,B),M(U,m,B),[0,-1,0],P.col,xs,H,-1,1,1,.85);let le=[t.dir[0],0,t.dir[1]],ge=[-t.dir[0],0,-t.dir[1]],X=C>g+.001||t.extendStart===0?C:C+.002,Y=U<y-.001||t.extendEnd===0?U:U-.002;i.quad(M(X,-m,B),M(X,m,B),M(X,m,z),M(X,-m,z),ge,P.col,xs,H,-1,1,1,.9),i.quad(M(Y,m,B),M(Y,-m,B),M(Y,-m,z),M(Y,m,z),le,P.col,xs,H,-1,1,1,.9)}for(let C of t.openings){let U=C.opening;if(U.kind==="passage")continue;let B=xA(t,C.inward),z=(C.t0+C.t1)/2,j={opening:U,wallSlot:n,room:B,base:M(z,0,0),along:t.dir,inward:C.inward,width:C.t1-C.t0,bottom:C.bottom,top:C.top,depth:t.thickness,ceiling:t.height,bothInside:t.roomA!==wi&&t.roomB!==wi,item:p.get(U.id)??-1},q=-1;U.kind==="window"?(q=a.length,a.push({kind:"window",entity:U.entity??null,room:B}),l.push({...j,centre:M(z,0,(C.bottom+C.top)/2),normal:C.inward,glow:q})):c.push(j),i.currentItem=e.currentItem=j.item,l_({g:i,glass:e,pal:r,look:a_(U,r),room:B,ws:R>=0?R+pf:R,glow:q,low:x},j),i.currentItem=e.currentItem=-1}}function xA(i,e){let t=e[0]*i.normal[0]+e[1]*i.normal[1]>0?i.roomA:i.roomB;return t===wi?pt:t}function s_(i,e,t){let n=i.vertexCount;e();for(let s=n;s<i.vertexCount;s++){let r=i.pos[s*3+1]-t;r<.5&&i.occlude(s,.8+.2*Math.max(0,r)/.5)}}var _A=new Set(["fabric","fabricDark","cushion"]),yA={fabricDark:.5,cushion:1.4,woodDark:.45},vA=.0015;function bA(i){return i.shape==="box"?[!0,!0,!i.shear,!i.shear,!0,!0]:i.shape==="prism"?[!0,!0,!0,!1,!1,!1]:i.shape==="ball"||i.shape==="hull"?[!1,!1,!1,!1,!1,!1]:i.shape==="hip"?[!1,!1,!0,!1,!1,!1]:i.axis==="x"?[!0,!0,!1,!1,!1,!1]:i.axis==="z"?[!1,!1,!1,!1,!0,!0]:[!1,!1,!0,(i.taper??1)>.001,!1,!1]}function r_(i,e){let t=i.x-i.w/2,n=i.x+i.w/2,s=i.y,r=i.y+i.h,o=i.z-i.d/2,a=i.z+i.d/2;if(e<2)return[e===0?t:n,s,r,o,a];let[l,c]=e===3&&i.lean?i.lean:[0,0];return e<4?[e===2?s:r,t+l,n+l,o+c,a+c]:[e===4?o:a,t,n,s,r]}function MA(i,e=!1){let t=new Uint8Array(i.length*6),n=i.map(bA),s=!1;for(let r=1;r<i.length;r++)for(let o=0;o<6;o++){if(!n[r][o]||o===2&&i[r].y<=.02&&!e)continue;let[a,l,c,u,f]=r_(i[r],o);for(let h=0;h<r;h++){if(!n[h][o])continue;let[d,p,x,m,g]=r_(i[h],o);Math.abs(a-d)>.001||Math.min(c,x)-Math.max(l,p)<=.001||Math.min(f,g)-Math.max(u,m)<=.001||(t[r*6+o]=Math.max(t[r*6+o],t[h*6+o]+1),s=!0)}}return s?i.map((r,o)=>{let a=l=>t[o*6+l]*vA;return t.subarray(o*6,o*6+6).some(l=>l>0)?{...r,x:r.x+(a(1)-a(0))/2,w:r.w+a(0)+a(1),y:r.y-a(2),h:r.h+a(2)+a(3),z:r.z+(a(5)-a(4))/2,d:r.d+a(4)+a(5)}:r}):i}function Cf(i,e,t,n,s,r,o,a,l,c,u){let f=kc(t.type),h=t.rotation*Math.PI/180,d=Math.cos(h),p=Math.sin(h),x=t.mirror?-1:1,m=(P,C,U)=>[t.x+d*P*x-p*U,n+C,t.z+p*P*x+d*U],g=(P,C,U)=>[d*P*x-p*U,C,p*P*x+d*U],y=(P,C,U)=>m(-U,C,P),S=(P,C,U)=>g(-U,C,P),v=t.finish??f.finish??"fabric",M=Mc[v]??Mc.fabric,b=fn(t.color)??(v!=="fabric"?M.color:null),E=f.trim?fn(t.trim):null,_=u??Em(f,e,t);e=MA(e,s);let A=(P,C)=>{let U=kt(hi(a,P)),B=yA[C]??1;return[Math.min(1,U[0]*B),Math.min(1,U[1]*B),Math.min(1,U[2]*B)]},R=P=>E!==null&&f.trim.includes(P)?A(E,P):b!==null&&_.has(P)?A(b,P):kt(a.roles[P]),L=P=>{let[C,U]=P?[-p,d]:[d,p];return{c:C,s:U,ou:t.x*C+t.z*U,ov:-t.x*U+t.z*C}},I=[L(!1),L(!0)];for(let P of e){let C=P.turn?y:m,U=P.turn?S:g;i.uvFrame=I[P.turn?1:0];let B=P.role==="glass"&&c?c:i;B===i&&B.useSurface(_A.has(P.role)?`uph:${v}`:`role:${P.role}`);let z=R(P.role),j=P.glow?o:-1,q=P.y>.02||s;if(P.shape==="box"){let k=P.x-P.w/2,H=P.x+P.w/2,ue=P.z-P.d/2,de=P.z+P.d/2,G=P.shear??0,le=P.y-G*P.d/2,ge=P.y+G*P.d/2,X=le+P.h,Y=ge+P.h,he=P.y<.05?.86:1,Re=Math.hypot(1,G),me=G?U(0,1/Re,-G/Re):[0,1,0],Ie=(je,ee,re,se,ae,fe)=>B.quad(C(...je),C(...ee),C(...re),C(...se),ae,z,r,-1,j,1,1,fe);Ie([k,X,ue],[H,X,ue],[H,Y,de],[k,Y,de],me,1),Ie([k,ge,de],[H,ge,de],[H,Y,de],[k,Y,de],U(0,0,1),he),Ie([H,le,ue],[k,le,ue],[k,X,ue],[H,X,ue],U(0,0,-1),he),Ie([H,ge,de],[H,le,ue],[H,X,ue],[H,Y,de],U(1,0,0),he),Ie([k,le,ue],[k,ge,de],[k,Y,de],[k,X,ue],U(-1,0,0),he),q&&Ie([k,ge,de],[H,ge,de],[H,le,ue],[k,le,ue],[-me[0],-me[1],-me[2]],1)}else P.shape==="prism"?SA(B,P,C,U,z,r,j,q):P.shape==="hip"?wA(B,P,C,U,z,r,j,q):P.shape==="hull"?AA(B,P,C,U,z,r,j,q):EA(B,P,C,U,z,r,j,q,l)}i.uvFrame=null}function SA(i,e,t,n,s,r,o,a){let l=e.x-e.w/2,c=e.x+e.w/2,u=e.z-e.d/2,f=e.z+e.d/2,h=e.y,d=e.y+e.h,p=Math.hypot(e.d/2,e.h)||1,x=n(0,e.d/2/p,e.h/p),m=n(0,e.d/2/p,-e.h/p);i.quad(t(l,h,f),t(c,h,f),t(c,d,e.z),t(l,d,e.z),x,s,r,-1,o),i.quad(t(c,h,u),t(l,h,u),t(l,d,e.z),t(c,d,e.z),m,s,r,-1,o);for(let[g,y]of[[l,n(-1,0,0)],[c,n(1,0,0)]]){let S=i.vertex(t(g,h,u),y,s,r,-1,o),v=i.vertex(t(g,h,f),y,s,r,-1,o),M=i.vertex(t(g,d,e.z),y,s,r,-1,o);i.tri(S,v,M,y)}a&&i.quad(t(l,h,f),t(c,h,f),t(c,h,u),t(l,h,u),[0,-1,0],s,r,-1,o)}function wA(i,e,t,n,s,r,o,a){let l=e.x-e.w/2,c=e.x+e.w/2,u=e.z-e.d/2,f=e.z+e.d/2,h=Math.max(0,Math.min(e.w,e.ridge??e.w-e.d))/2,d=e.y,p=e.y+e.h,x=[e.x-h,p,e.z],m=[e.x+h,p,e.z],g=y=>{let[S,v,M]=y,b=[v[0]-S[0],v[1]-S[1],v[2]-S[2]],E=[M[0]-S[0],M[1]-S[1],M[2]-S[2]],_=[b[1]*E[2]-b[2]*E[1],b[2]*E[0]-b[0]*E[2],b[0]*E[1]-b[1]*E[0]],A=Math.hypot(_[0],_[1],_[2])||1;_=[_[0]/A,_[1]/A,_[2]/A],_[1]<0&&(_=[-_[0],-_[1],-_[2]]);let R=n(_[0],_[1],_[2]),L=y.map(I=>i.vertex(t(I[0],I[1],I[2]),R,s,r,-1,o));for(let I=1;I<L.length-1;I++)i.tri(L[0],L[I],L[I+1],R)};g([[l,d,f],[c,d,f],m,x]),g([[c,d,u],[l,d,u],x,m]),g([[l,d,u],[l,d,f],x]),g([[c,d,f],[c,d,u],m]),a&&i.quad(t(l,d,f),t(c,d,f),t(c,d,u),t(l,d,u),n(0,-1,0),s,r,-1,o)}function AA(i,e,t,n,s,r,o,a){let l=(e.outline??[]).map(([x,m])=>[e.z-e.d/2+x*e.d,e.y+m*e.h]);if(l.length<3)return;let c=(e.inset??0)/(e.h||1),u=x=>e.w/2-c*(x-e.y),f=jt.triangulateShape(l.map(([x,m])=>new oe(x,m)),[]),h=Math.hypot(1,c);for(let x of[-1,1]){let m=n(x/h,c/h,0),g=l.map(([y,S])=>i.vertex(t(e.x+x*u(S),S,y),m,s,r,-1,o));for(let[y,S,v]of f)i.tri(g[y],g[S],g[v],m)}let d=0;l.forEach(([x,m],g)=>{let[y,S]=l[(g+1)%l.length];d+=x*S-y*m});let p=d>0?1:-1;l.forEach(([x,m],g)=>{let[y,S]=l[(g+1)%l.length],v=Math.hypot(y-x,S-m);if(v<1e-6)return;let M=-(y-x)/v*p,b=(S-m)/v*p;!a&&M<-.99&&m<e.y+.02||i.quad(t(e.x-u(m),m,x),t(e.x+u(m),m,x),t(e.x+u(S),S,y),t(e.x-u(S),S,y),n(0,M,b),s,r,-1,o)})}function EA(i,e,t,n,s,r,o,a,l){var v,M;let c=Math.max(e.shape==="ball"?6:5,Math.round((e.seg??12)*(l?.67:1))),u,f,h,d,p;if(e.axis==="x")u=e.h/2,f=e.d/2,h=e.w,d=(b,E,_)=>t(e.x-e.w/2+_,e.y+e.h/2+b,e.z+E),p=(b,E,_)=>n(_,b,E);else if(e.axis==="z")u=e.w/2,f=e.h/2,h=e.d,d=(b,E,_)=>t(e.x+b,e.y+e.h/2+E,e.z-e.d/2+_),p=(b,E,_)=>n(b,E,_);else{u=e.w/2,f=e.d/2,h=e.h;let b=(((v=e.lean)==null?void 0:v[0])??0)/h,E=(((M=e.lean)==null?void 0:M[1])??0)/h;d=(_,A,R)=>t(e.x+_+b*R,e.y+R,e.z+A+E*R),p=(_,A,R)=>n(_,R-b*_-E*A,A)}let x;if(e.shape==="ball"){let b=Math.max(4,Math.round(c/2));x=Array.from({length:b+1},(E,_)=>[Math.sin(Math.PI*_/b),(1-Math.cos(Math.PI*_/b))/2])}else x=[[1,0],[e.taper??1,1]];let m=(u+f)/2,g=Array.from({length:c},(b,E)=>E/c*Math.PI*2),y=[];x.forEach(([b,E],_)=>{let A=x[Math.max(0,_-1)],R=x[Math.min(x.length-1,_+1)],L=(R[0]-A[0])*m,I=(R[1]-A[1])*h,P=Math.hypot(L,I)||1,C=I/P,U=-L/P;y.push(g.map(B=>{let z=Math.cos(B),j=Math.sin(B),q=z/(u||1),k=j/(f||1),H=Math.hypot(q,k)||1;q=q/H*C,k=k/H*C;let ue=p(q,k,U),de=Math.hypot(ue[0],ue[1],ue[2])||1;return i.vertex(d(z*u*b,j*f*b,E*h),[ue[0]/de,ue[1]/de,ue[2]/de],s,r,-1,o)}))});for(let b=0;b<y.length-1;b++)for(let E=0;E<c;E++){let _=y[b][E],A=y[b][(E+1)%c],R=y[b+1][(E+1)%c],L=y[b+1][E],I=TA(i,_,R);i.tri(_,A,R,I),i.tri(_,R,L,I)}if(e.shape==="ball")return;let S=[[0,x[0][0],-1],[1,x[x.length-1][0],1]];for(let[b,E,_]of S){if(E<=.001||_<0&&!e.axis&&!a)continue;let A=p(0,0,_),R=i.vertex(d(0,0,b*h),A,s,r,-1,o),L=g.map(I=>i.vertex(d(Math.cos(I)*u*E,Math.sin(I)*f*E,b*h),A,s,r,-1,o));for(let I=0;I<c;I++)i.tri(R,L[I],L[(I+1)%c],A)}}function TA(i,e,t){let n=[i.nrm[e*3]+i.nrm[t*3],i.nrm[e*3+1]+i.nrm[t*3+1],i.nrm[e*3+2]+i.nrm[t*3+2]],s=Math.hypot(n[0],n[1],n[2])||1;return[n[0]/s,n[1]/s,n[2]/s]}function h_(i,e,t,n,s){return f_(i,[r=>r[0]-e,r=>n-r[0],r=>r[1]-t,r=>s-r[1]])}function f_(i,e){let t=i;for(let s of e){let r=t;if(t=[],!r.length)break;for(let o=0;o<r.length;o++){let a=r[o],l=r[(o+r.length-1)%r.length],c=s(a),u=s(l);c>=0?(u<0&&t.push(o_(l,a,u,c)),t.push(a)):u>=0&&t.push(o_(l,a,u,c))}}let n=[];for(let s of t){let r=n[n.length-1];(!r||Math.abs(r[0]-s[0])>1e-6||Math.abs(r[1]-s[1])>1e-6)&&n.push(s)}if(n.length>1){let s=n[0],r=n[n.length-1];Math.abs(s[0]-r[0])<1e-6&&Math.abs(s[1]-r[1])<1e-6&&n.pop()}return n}function RA(i,e){let t=e.reduce((o,a)=>o+a[0],0)/e.length,n=e.reduce((o,a)=>o+a[1],0)/e.length,s=e.map((o,a)=>{let l=e[(a+1)%e.length],c=l[1]-o[1],u=o[0]-l[0];return(t-o[0])*c+(n-o[1])*u>0&&([c,u]=[-c,-u]),f=>(f[0]-o[0])*c+(f[1]-o[1])*u}),r=[];return s.forEach((o,a)=>{let l=f_(i,[...s.slice(0,a).map(c=>u=>-c(u)),o]);l.length>=3&&Math.abs(CA(l))>1e-6&&r.push(l)}),r}function CA(i){let e=0;for(let t=0;t<i.length;t++){let n=i[t],s=i[(t+1)%i.length];e+=n[0]*s[1]-s[0]*n[1]}return e/2}function IA(i,e){let t=i.floors[e-1],n=i.floors[e];if(!t||!n)return[];let s=[];for(let r of t.furniture){if(kc(r.type).family!=="stairs")continue;let o=t.elevation+Vc(r,t.height)+r.h;if(Math.abs(o-n.elevation)>.35)continue;let a=r.w/2+.04,l=r.rotation*Math.PI/180,c=Math.cos(l),u=Math.sin(l),f=([x,m])=>[r.x+c*x-u*m,r.z+u*x+c*m],h=x=>n.rooms.findIndex(m=>Kt(x,m.points)),d=h(f([0,-r.d/2-.25])),p=d>=0?d:h(f([0,-r.d/2+.1]));s.push({hole:[[-a,-r.d/2],[a,-r.d/2],[a,r.d/2+.04],[-a,r.d/2+.04]].map(f),room:p})}return s}function o_(i,e,t,n){let s=t/(t-n);return[i[0]+(e[0]-i[0])*s,i[1]+(e[1]-i[1])*s]}var wT=Object.keys(Ff);var PA={flush:"Flush",panel:"Panelled",glazed:"Glazed",french:"French doors",sliding:"Sliding glass",barn:"Barn door"},LA={casement:"Casement",tilt:"Tilt and turn",awning:"Top-hung",sash:"Sliding sash",sliding:"Sliding",fixed:"Fixed"},DA={sectional:"Up and over",roller:"Roller",side:"Side-hinged"};function NA(i){return i==="door"?PA:i==="window"?LA:i==="garage"?DA:null}function Dc(i){let e=NA(i.kind);return e?i.style&&i.style in e?i.style:Object.keys(e)[0]:""}function UA(i){return i==="window"?"upvc":"painted"}var p_=new Set(["flush","panel","glazed","casement"]),fm=new Set([...p_,"french","side"]),FA=new Set(["sliding","barn"]),OA=new Set(["glazed","french","sliding"]);function IT(i){let e=Dc(i);return{hinge:p_.has(e)&&(i.kind!=="window"||m_(i.width)===1),swing:fm.has(e),side:e==="barn",slide:FA.has(e),bars:i.kind==="window"||OA.has(e)}}function PT(i){return i.kind==="door"&&fm.has(Dc(i))?28/82:0}function BA(i){return!!i.entity&&Dc(i)!=="fixed"}function m_(i){return i<=1?1:i<=2?2:3}function a_(i,e){let t=i.finish&&i.finish in ms?i.finish:UA(i.kind),n=ms[t],s=`jn:${t}`,r=n.tintable?fn(i.color):null;if(r===null&&(t==="painted"||t==="upvc")){let o=kt(e.roles.white);return{surf:s,col:i.kind==="window"?o:[o[0]*.9,o[1]*.88,o[2]*.85]}}return{surf:s,col:kt(hi(e,r??n.color))}}var g_=[0,1,0],bs=i=>[-i[0],-i[1],-i[2]],Oo=(i,e,t,n)=>[i[0]*e+t[0]*n,i[1]*e+t[1]*n,i[2]*e+t[2]*n];function $t(i,e,t,n){return[i.o[0]+i.u[0]*e+i.v[0]*t+i.w[0]*n,i.o[1]+i.u[1]*e+i.v[1]*t+i.w[1]*n,i.o[2]+i.u[2]*e+i.v[2]*t+i.w[2]*n]}function vs(i,e,t,n){return[i.u[0]*e+i.v[0]*t+i.w[0]*n,i.u[1]*e+i.v[1]*t+i.w[1]*n,i.u[2]*e+i.v[2]*t+i.w[2]*n]}function x_(i){return{o:i.base,u:[i.along[0],0,i.along[1]],v:g_,w:[i.inward[0],0,i.inward[1]]}}function Lf(i,e,t,n){return{...i,o:$t(i,e,t,n)}}function Fo(i,e,t,n){let s=Math.cos(n),r=Math.sin(n);return{o:i,u:Oo(e,s,t,r),v:g_,w:Oo(t,s,e,-r)}}function d_(i,e,t,n,s){let r=Math.cos(s),o=Math.sin(s);return{o:$t(i,e,t,n),u:i.u,v:Oo(i.v,r,i.w,o),w:Oo(i.w,r,i.v,-o)}}function kA(i,e,t,n,s){let r=Math.cos(s),o=Math.sin(s);return{o:$t(i,e,t,n),u:Oo(i.u,r,i.v,o),v:Oo(i.v,r,i.u,-o),w:i.w}}var Ic=1,Pc=2,Si=4,nn=8,qt=16,Vt=32,Pt=63;function ot(i,e,t,n,s,r,o,a,l,c=Pt,u=1){if(t>n&&([t,n]=[n,t]),s>r&&([s,r]=[r,s]),o>a&&([o,a]=[a,o]),n-t<1e-4||r-s<1e-4)return;let f=i.g;f.useSurface(l.surf);let h=(p,x,m)=>$t(e,p,x,m),d=(p,x,m,g,y,S=1)=>f.quad(p,x,m,g,y,l.col,i.room,i.ws,-1,1,S);c&qt&&d(h(t,s,a),h(n,s,a),h(n,r,a),h(t,r,a),vs(e,0,0,1),u),c&Vt&&d(h(n,s,o),h(t,s,o),h(t,r,o),h(n,r,o),vs(e,0,0,-1),u),c&Si&&d(h(t,r,a),h(n,r,a),h(n,r,o),h(t,r,o),vs(e,0,1,0)),c&nn&&d(h(t,s,o),h(n,s,o),h(n,s,a),h(t,s,a),vs(e,0,-1,0)),c&Ic&&d(h(n,s,a),h(n,s,o),h(n,r,o),h(n,r,a),vs(e,1,0,0),u),c&Pc&&d(h(t,s,o),h(t,s,a),h(t,r,a),h(t,r,o),vs(e,-1,0,0),u)}function Lc(i,e){return e>=1.5&&i.ws>=0?{...i,ws:i.ws+gs}:i}var dm=(i,e)=>({surf:i.surf,col:[i.col[0]*e,i.col[1]*e,i.col[2]*e]});function pm(i,e,t,n,s,r,o,a){if(n-t<.01||r-s<.01||(i.glass.quad($t(e,t,s,o),$t(e,n,s,o),$t(e,n,r,o),$t(e,t,r,o),vs(e,0,0,1),kt(i.pal.glass),i.room,i.ws,i.glow),!a))return;let l=Math.max(1,Math.round((n-t)/.3)),c=Math.max(1,Math.round((r-s)/.32)),u=.009,f=.012;for(let h=1;h<l;h++){let d=t+(n-t)*h/l;ot(i,e,d-u,d+u,s,r,o-f,o+f,i.look,Ic|Pc|qt|Vt)}for(let h=1;h<c;h++){let d=s+(r-s)*h/c;ot(i,e,t,n,d-u,d+u,o-f,o+f,i.look,Si|nn|qt|Vt)}}function ar(i,e,t,n,s,r,o,a){let l=s+r;ot(i,e,0,o,0,n,s,l,i.look),ot(i,e,t-o,t,0,n,s,l,i.look),ot(i,e,o,t-o,0,o,s,l,i.look,Si|nn|qt|Vt),ot(i,e,o,t-o,n-o,n,s,l,i.look,Si|nn|qt|Vt),pm(i,e,o,t-o,o,n-o,(s+l)/2,a)}var tn=.05,fi=.035,Pf=.045,ys=.05,VA=70*Math.PI/180,zA=12*Math.PI/180,GA=30*Math.PI/180;function __(i,e,t,n,s){let r=n+tn,o=s-tn,a=-t/2+tn,l=t/2-tn;if(e==="sash"||e==="sliding")return[{u0:a,u1:l,v0:r,v1:o,opens:!0,hinge:-1}];let c=m_(t),u=(l-a-(c-1)*tn)/c;return Array.from({length:c},(f,h)=>({u0:a+h*(u+tn),u1:a+h*(u+tn)+u,v0:r,v1:o,opens:e!=="fixed"&&!(c===3&&h===1),hinge:c===1?(i.hinge??"left")==="left"?-1:1:h<c/2?-1:1}))}function HA(i,e,t,n){let s=t.opening,r=t.width,o=t.bottom,a=t.top,l=i.look;ot(i,e,-r/2,-r/2+tn,o,a,-fi,fi,l,Pt&~Pc),ot(i,e,r/2-tn,r/2,o,a,-fi,fi,l,Pt&~Ic),ot(i,e,-r/2+tn,r/2-tn,o,o+tn,-fi,fi,l,Si|qt|Vt),ot(i,e,-r/2+tn,r/2-tn,a-tn,a,-fi,fi,l,nn|qt|Vt);let c=__(s,n,r,o,a);for(let h=1;h<c.length;h++)ot(i,e,c[h-1].u1,c[h].u0,o+tn,a-tn,-fi,fi,l,qt|Vt);for(let h of c)h.opens||pm(i,e,h.u0,h.u1,h.v0,h.v1,0,!!s.bars);let u=c[0],f=u.v1-u.v0;if(n==="sash"&&ar(i,Lf(e,u.u0,u.v1-(f/2+.02),0),u.u1-u.u0,f/2+.02,-.032,.03,.04,!!s.bars),n==="sliding"&&Df(i,e,u,(s.hinge??"left")==="left",0,!1,!!s.bars),o>.25){let h={surf:"jn:painted",col:kt(i.pal.roles.white)};ot(i,e,-r/2-.04,r/2+.04,o-.022,o+.003,fi,t.depth/2+.03,h,Pt&~Vt)}}function y_(i,e,t,n,s){let r=t.opening,o=!!r.bars,a=__(r,n,t.width,t.bottom,t.top);if(n!=="fixed"){if(n==="sliding"){Df(i,e,a[0],(r.hinge??"left")==="left",s,!0,o);return}if(n==="sash"){let l=a[0],c=l.v1-l.v0,u=c/2+.02;ar(i,Lf(e,l.u0,l.v0+s*(c-u)*.92,0),l.u1-l.u0,u,.002,.03,.04,o);return}for(let l of a){if(!l.opens)continue;let c=l.u1-l.u0,u=l.v1-l.v0;if(n==="tilt")ar(i,d_(e,l.u0,l.v0,ys/2,s*zA),c,u,-ys,ys,Pf,o);else if(n==="awning"){let f=d_(e,l.u0,l.v1,-ys/2,s*GA);ar(i,{...f,v:bs(f.v)},c,u,0,ys,Pf,o)}else{let f=r.swing==="out"?-1:1,h=$t(e,l.hinge<0?l.u0:l.u1,l.v0,f*ys/2),d=Fo(h,l.hinge<0?e.u:bs(e.u),f>0?e.w:bs(e.w),s*VA);ar(i,d,c,u,-ys,ys,Pf,o)}}}}function Df(i,e,t,n,s,r,o,a=Pf){let l=t.u1-t.u0,c=l/2+.025,u=t.v1-t.v0;if(!r){ar(i,Lf(e,n?t.u1-c:t.u0,t.v0,0),c,u,-.032,.03,a,o);return}let f=(l-c)*.95*s;ar(i,Lf(e,n?t.u0+f:t.u1-c-f,t.v0,0),c,u,.002,.03,a,o)}var v_=.04,qi=.004,Uo=.012,WA=.025,b_=82*Math.PI/180,Yn=.06;function XA(i,e,t,n){let s=t.width,r=t.top;if(n==="sliding"){ot(i,e,-s/2,-s/2+Yn,0,r,-.04,.04,i.look,Pt&~Pc),ot(i,e,s/2-Yn,s/2,0,r,-.04,.04,i.look,Pt&~Ic),ot(i,e,-s/2+Yn,s/2-Yn,r-Yn,r,-.04,.04,i.look,nn|qt|Vt),ot(i,e,-s/2+Yn,s/2-Yn,0,.02,-.04,.04,i.look,Si|qt|Vt),Df(i,e,M_(s,r),(t.opening.hinge??"left")==="left",0,!1,!!t.opening.bars,Yn);return}let o=.065,a=.014,l=Math.max(0,Math.min(o,t.ceiling-r-.005));for(let c of t.bothInside?[1,-1]:[1]){let u=c*t.depth/2,f=c*(t.depth/2+a),h=c>0?Vt:qt;ot(i,e,-s/2-o,-s/2,0,r+l,u,f,i.look,Pt&~h&~nn),ot(i,e,s/2,s/2+o,0,r+l,u,f,i.look,Pt&~h&~nn),l>.005&&ot(Lc(i,r),e,-s/2,s/2,r,r+l,u,f,i.look,(c>0?qt:Vt)|Si|nn)}if(fm.has(n)){let c=t.opening.swing==="out"?-1:1,u=c*t.depth/2-c*(v_/2+.001),f=u-c*WA;ot(i,e,-s/2,-s/2+Uo,0,r,u,f,i.look,Pt&~Pc&~nn&~Si),ot(i,e,s/2-Uo,s/2,0,r,u,f,i.look,Pt&~Ic&~nn&~Si),ot(Lc(i,r-Uo),e,-s/2+Uo,s/2-Uo,r-Uo,r,u,f,i.look,qt|Vt|nn)}}function M_(i,e){return{u0:-i/2+Yn,u1:i/2-Yn,v0:.02,v1:e-Yn}}function qA(i,e,t,n,s){let r=t.opening,o=t.width,a=t.top,l=!!r.bars,c=r.swing==="out"?-1:1,u=c*t.depth/2,f=c>0?e.w:bs(e.w),h=s*b_;if(n==="sliding")Df(i,e,M_(o,a),(r.hinge??"left")==="left",s,!0,l,Yn);else if(n==="barn")JA(i,e,t,s);else if(n==="french"){let d=(o-qi)/2;Cc(i,Fo($t(e,-o/2,0,u),e.u,f,h),d,a-qi,"french",l),Cc(i,Fo($t(e,o/2,0,u),bs(e.u),f,h),d,a-qi,"french",l)}else{let d=(r.hinge??"left")==="left",p=Fo($t(e,d?-o/2:o/2,0,u),d?e.u:bs(e.u),f,h);Cc(i,p,o-qi,a-qi,n,l)}}function Cc(i,e,t,n,s,r,o=!0){let a=v_/2,l=Math.min(1,n*.48),c=0;if(s==="glazed"||s==="french"){c=s==="french"?.1:.11;let u=s==="french"?.35:Math.min(n*.55,l+.12);ot(i,e,0,t,0,u,-a,a,i.look,Pt&~nn),ot(i,e,0,c,u,n,-a,a,i.look,Pt&~nn),ot(i,e,t-c,t,u,n,-a,a,i.look,Pt&~nn),ot(i,e,c,t-c,n-c,n,-a,a,i.look,Si|nn|qt|Vt),pm(i,e,c,t-c,u,n-c,0,r),s==="glazed"&&(c=0)}else ot(i,e,0,t,0,n,-a,a,i.look,Pt&~nn,2),s==="panel"&&ZA(i,e,t,n,a,l);o&&!i.low&&YA(i,e,t,a,l,c)}function YA(i,e,t,n,s,r){i.ws>=0&&(i={...i,ws:i.ws+gs});let o={surf:"role:metal",col:kt(i.pal.roles.metal)},a=r?t-r/2:t-.065,l=r?Math.min(.032,r-.03):.05,c=r?.2:.05,u=r?.09:.12;for(let f of[1,-1]){let h=f>0?Vt:qt;ot(i,e,a-l/2,a+l/2,s-c/2,s+c/2,f*n,f*(n+.008),o,Pt&~h),ot(i,e,a-.008,a+.008,s-.008,s+.008,f*(n+.008),f*(n+.045),o,Pt&~h),ot(i,e,a-u,a+.012,s-.009,s+.009,f*(n+.04),f*(n+.058),o)}}function ZA(i,e,t,n,s,r){let o=dm(i.look,.93),a=Math.min(.11,t*.14),l=t>.55?[[a,t/2-.05],[t/2+.05,t-a]]:[[a,t-a]],c=[[.2,r-.08],[r+.08,n-a]];for(let u of[1,-1])for(let[f,h]of l)for(let[d,p]of c)ot(i,e,f,h,d,p,u*s,u*(s+.006),o,Pt&~(u>0?Vt:qt))}function JA(i,e,t,n){let s=t.opening,r=t.width,o=t.top,a=s.swing==="out"?-1:1,l=a*t.depth/2,c=r+.1,u=o+.05,f=(s.hinge??"left")==="left"?-1:1,h=n*c*f,d=l+a*.012,p=l+a*.052,x=p+a*.022;ot(i,e,h-c/2,h+c/2,.01,u,d,p,i.look,Pt,2);let m=dm(i.look,.9);ot(i,e,h-c/2+.06,h+c/2-.06,.25,.37,p,x,m,Pt&~(a>0?Vt:qt)),ot(i,e,h-c/2+.06,h+c/2-.06,u-.37,u-.25,p,x,m,Pt&~(a>0?Vt:qt));let g=c-.32,y=u-.74-.12,S=kA(e,h-c/2+.16,.43,0,Math.atan2(y,g));ot(i,S,0,Math.hypot(g,y),-.055,.055,p,x,m,Pt&~(a>0?Vt:qt));let v={surf:"role:dark",col:kt(i.pal.roles.dark)},M=Math.min(-c/2,-c/2+f*c)-.05,b=Math.max(c/2,c/2+f*c)+.05;ot(Lc(i,u),e,M,b,u+.02,u+.06,l+a*.004,l+a*.03,v)}function $A(i,e,t,n,s){let r=t.opening,o=t.width,a=t.top,l=r.swing==="out"?-1:1,c=l*t.depth/2;if(n==="side"){let g=l>0?e.w:bs(e.w),y=s*b_;Cc(i,Fo($t(e,-o/2,0,c),e.u,g,y),(o-qi)/2,a-qi,"flush",!1,!1),Cc(i,Fo($t(e,o/2,0,c),bs(e.u),g,y),(o-qi)/2,a-qi,"flush",!1,!1);return}let u=.045,f=Math.min(a,s*a),h=-o/2-.03,d=o/2+.03;ot(i,e,h,d,f,a+.03,c,c+l*u,i.look,Pt,2);let p=dm(i.look,.78),x=n==="roller"?.1:a/4,m=c-l*.003;for(let g=f+x;g<a-.02;g+=x)i.g.useSurface(p.surf),i.g.quad($t(e,h,g-.008,m),$t(e,d,g-.008,m),$t(e,d,g+.008,m),$t(e,h,g+.008,m),vs(e,0,0,-l),p.col,i.room,i.ws);n==="sectional"?f>.01&&ot(Lc(i,a),e,h,d,a+.03,a+.03+u,c,c+l*f,i.look):ot(Lc(i,a),e,h-.02,d+.02,a+.03,Math.min(t.ceiling,a+.3),c,c+l*.26,i.look)}function l_(i,e){let t=x_(e),n=Dc(e.opening);e.opening.kind==="window"?(HA(i,t,e,n),BA(e.opening)||y_(i,t,e,n,0)):e.opening.kind==="door"&&XA(i,t,e,n)}function LT(i,e,t){let n=x_(e),s=Dc(e.opening);e.opening.kind==="window"?y_(i,n,e,s,t):e.opening.kind==="door"?qA(i,n,e,s,t):e.opening.kind==="garage"&&$A(i,n,e,s,t)}var yt=Math.PI/180,Nc=180/Math.PI,lr=(i,e)=>(i%e+e)%e;function S_(i){if(i>85)return 0;let e=Math.tan(i*yt);return i>5?(58.1/e-.07/e**3+86e-6/e**5)/3600:i>-.575?(1735+i*(-518.2+i*(103.4+i*(-12.79+i*.711))))/3600:-20.772/e/3600}function Uc(i,e,t){let s=(i/864e5+24405875e-1-2451545)/36525,r=lr(280.46646+s*(36000.76983+s*3032e-7),360),o=357.52911+s*(35999.05029-1537e-7*s),a=.016708634-s*(42037e-9+1267e-10*s),l=Math.sin(o*yt)*(1.914602-s*(.004817+14e-6*s))+Math.sin(2*o*yt)*(.019993-101e-6*s)+Math.sin(3*o*yt)*289e-6,c=125.04-1934.136*s,u=r+l-.00569-.00478*Math.sin(c*yt),f=23+(26+(21.448-s*(46.815+s*(59e-5-s*.001813)))/60)/60+.00256*Math.cos(c*yt),h=Math.asin(Math.sin(f*yt)*Math.sin(u*yt)),d=Math.tan(f/2*yt)**2,p=4*Nc*(d*Math.sin(2*r*yt)-2*a*Math.sin(o*yt)+4*a*d*Math.sin(o*yt)*Math.cos(2*r*yt)-.5*d*d*Math.sin(4*r*yt)-1.25*a*a*Math.sin(2*o*yt)),x=lr(i/6e4,1440),m=lr(x+p+4*t,1440),g=m/4<0?m/4+180:m/4-180,y=e*yt,S=Math.max(-1,Math.min(1,Math.sin(y)*Math.sin(h)+Math.cos(y)*Math.cos(h)*Math.cos(g*yt))),v=Math.acos(S),M=90-v*Nc,b=Math.sin(v),E;if(Math.abs(b)<1e-9||Math.abs(Math.cos(y))<1e-9)E=e>0?180:0;else{let _=Math.acos(Math.max(-1,Math.min(1,(Math.sin(y)*S-Math.sin(h))/(Math.cos(y)*b))))*Nc;E=g>0?lr(_+180,360):lr(540-_,360)}return{azimuth:E,elevation:M+S_(M)}}var Bo=23.4397*yt;function KA(i){let e=(357.5291+.98560028*i)*yt,t=e+(1.9148*Math.sin(e)+.02*Math.sin(2*e)+3e-4*Math.sin(3*e))*yt+102.9372*yt+Math.PI;return{ra:Math.atan2(Math.sin(t)*Math.cos(Bo),Math.cos(t)),dec:Math.asin(Math.sin(Bo)*Math.sin(t))}}function jA(i){let e=(218.316+13.176396*i)*yt,t=(134.963+13.064993*i)*yt,n=(93.272+13.22935*i)*yt,s=e+6.289*yt*Math.sin(t),r=5.128*yt*Math.sin(n);return{ra:Math.atan2(Math.sin(s)*Math.cos(Bo)-Math.tan(r)*Math.sin(Bo),Math.cos(s)),dec:Math.asin(Math.sin(r)*Math.cos(Bo)+Math.cos(r)*Math.sin(Bo)*Math.sin(s)),dist:385001-20905*Math.cos(t)}}function w_(i,e,t){let n=i/864e5+24405875e-1-2451545,s=jA(n),r=e*yt,o=(280.16+360.9856235*n)*yt+t*yt-s.ra,a=Math.asin(Math.sin(r)*Math.sin(s.dec)+Math.cos(r)*Math.cos(s.dec)*Math.cos(o))*Nc,l=Math.atan2(Math.sin(o),Math.cos(o)*Math.sin(r)-Math.tan(s.dec)*Math.cos(r))*Nc,c=KA(n),u=149598e3,f=Math.acos(Math.max(-1,Math.min(1,Math.sin(c.dec)*Math.sin(s.dec)+Math.cos(c.dec)*Math.cos(s.dec)*Math.cos(c.ra-s.ra)))),h=Math.atan2(u*Math.sin(f),s.dist-u*Math.cos(f));return{azimuth:lr(l+180,360),elevation:a+S_(a),lit:(1+Math.cos(h))/2}}var QA=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];function NT(i){return QA[Math.round(lr(i,360)/22.5)%16]}function UT(i,e,t){let r=h=>Uc(h,e,t).elevation,o=(h,d)=>{let p=r(d)>r(h);for(let x=0;x<20;x++){let m=(h+d)/2;r(m)>-.833===p?d=m:h=m}return(h+d)/2},a=null,l=null,c=i,u=-1/0,f=r(i);for(let h=i+6e5;h<=i+864e5;h+=6e5){let d=r(h);d>u&&(u=d,c=h),f<=-.833&&d>-.833&&a===null&&(a=o(h-6e5,h)),f>-.833&&d<=-.833&&l===null&&(l=o(h-6e5,h)),f=d}return{rise:a,noon:c,set:l}}var BT=["clear","cloudy","rain","storm","snow","fog"],eE={"clear-night":{cloud:.05},sunny:{cloud:.08},partlycloudy:{cloud:.45},cloudy:{cloud:.88},windy:{cloud:.3},"windy-variant":{cloud:.6},fog:{cloud:.92,fog:1},rainy:{cloud:.92,rain:.5},pouring:{cloud:1,rain:1},hail:{cloud:.95,rain:.8},lightning:{cloud:.9,storm:!0},"lightning-rainy":{cloud:.97,rain:.85,storm:!0},snowy:{cloud:.92,snow:.7},"snowy-rainy":{cloud:.94,rain:.35,snow:.4},exceptional:{cloud:.6}},tE={clear:{cloud:.04,wind:2},cloudy:{cloud:.9,wind:4},rain:{cloud:.95,rain:.7,wind:5},storm:{cloud:1,rain:1,storm:!0,wind:11},snow:{cloud:.92,snow:.8,wind:3},fog:{cloud:.95,fog:1,wind:1}},Fc=i=>Math.max(0,Math.min(1,i)),ko=i=>typeof i=="number"&&isFinite(i)?i:typeof i=="string"&&i.trim()!==""&&isFinite(Number(i))?Number(i):null;function nE(i,e){let t=String(e??"km/h").toLowerCase();return t==="m/s"?i:t==="mph"?i*.44704:t==="kn"||t==="kt"||t==="knots"?i*.514444:t==="ft/s"?i*.3048:i/3.6}var A_=new Set(["rainy","pouring","hail","lightning-rainy","snowy-rainy"]),E_=new Set(["snowy","snowy-rainy"]);function iE(i=Date.now()){return{time:i,sun:null,moon:null,cloud:.2,rain:0,snow:0,fog:0,wet:0,snowCover:0,wind:2,windFrom:240,storm:!1,condition:null,source:"none"}}function sE(i){let{time:e,lat:t,lon:n}=i,s=t!==null&&n!==null,r=s?Uc(e,t,n):null,o=s?w_(e,t,n):null,a={time:e,sun:r,moon:o};if(i.pick){let _=tE[i.pick];return{...a,cloud:_.cloud,rain:_.rain??0,snow:_.snow??0,fog:_.fog??0,wet:_.rain?1:0,snowCover:_.snow?1:0,wind:_.wind,windFrom:240,storm:!!_.storm,condition:i.pick,source:"pick"}}let l=i.weather;if(!l||l.state==="unavailable"||l.state==="unknown")return{...iE(e),sun:r,moon:o};let c=l.attributes,u=eE[l.state]??{cloud:.4},f=u.cloud,h=ko(c.cloud_coverage);h!==null&&(f=.6*Fc(h/100)+.4*u.cloud);let d=i.clearIndex;typeof d=="number"&&isFinite(d)&&(f=.75*Fc((.82-d)/.65)+.25*f);let p=u.fog??0,x=ko(c.visibility);if(x!==null){let _=String(c.visibility_unit??"km")==="mi"?x*1.609:x;p=Math.max(p,_<1?1:_<4?.45:_<8?.15:0)}let m=ko(c.temperature),g=m===null?null:String(c.temperature_unit??"\xB0C").includes("F")?(m-32)*5/9:m,y=ko(c.humidity),S=ko(c.wind_speed),v=u.rain??0,M=u.snow??0,b=v>0?1:0;if(!b&&i.lastRain){let _=g!==null&&g<6||(y??0)>88?5:2;b=Math.exp(-Math.max(0,e-i.lastRain)/36e5/_)}(y??0)>=97&&(b=Math.max(b,.3));let E=M>.2?1:0;if(!E&&i.lastSnow){let _=Math.max(0,e-i.lastSnow)/36e5;E=g!==null&&g<=1?_<48?1:0:Math.exp(-_/3)}return{...a,cloud:Fc(f),rain:v,snow:M,fog:p,wet:Fc(b),snowCover:Fc(E<.05?0:E),wind:S===null?2:nE(S,c.wind_speed_unit),windFrom:ko(c.wind_bearing)??240,storm:!!u.storm,condition:l.state,source:"live"}}function kT(i){let e=(t,n)=>Math.round(t/n);return[i.sun?`${e(i.sun.azimuth,.25)},${e(i.sun.elevation,.25)}`:"-",i.moon?`${e(i.moon.azimuth,2)},${e(i.moon.elevation,2)}`:"-",e(i.cloud,.05),e(i.rain,.1),e(i.snow,.1),e(i.fog,.05),e(i.wet,.1),e(i.snowCover,.1),e(i.wind,1),e(i.windFrom,15),i.storm].join("|")}var R_=3e5,C_=i=>Math.floor(i%864e5/R_);function rE(i,e,t){let n=new Map;for(let o of i)n.set(o.start,(n.get(o.start)??0)+Math.max(0,o.kw));let s=new Map,r=null;for(let[o,a]of n){let l=Uc(o+R_/2,e,t).elevation;if(l<=0)continue;let c=C_(o),u=s.get(c);(!u||a>u.kw)&&s.set(c,{kw:a,elevation:l}),(!r||a>r.kw)&&(r={kw:a,elevation:l})}return{slots:s,peak:r}}function oE(i,e,t,n,s){if(!(i!=null&&i.peak)||e===null||i.peak.kw<.2)return null;let r=Uc(t,n,s).elevation;if(r<8)return null;let o=h=>Math.sin(Math.max(1,h)*Math.PI/180),a=C_(t),l=null;for(let h of[a-1,a,a+1]){let d=i.slots.get((h+288)%288);d&&(!l||d.kw>l.kw)&&(l=d)}let c=l?l.kw*o(r)/o(l.elevation):0,u=i.peak.kw*o(r)/o(i.peak.elevation),f=Math.max(c,.7*u);return f<.05?null:e/f}var T_=class{constructor(){this.settings={};this.solar=[];this.lastRain=null;this.lastSnow=null;this.historyFor=null;this.ref=null;this.refAt=0;this.refFor="";this.refBusy=!1;this.onChange=null}weatherEntity(e){if(this.settings.enabled===!1)return null;let t=this.settings.weather;if(t)return e.states[t]?t:null;let n=Object.keys(e.states).filter(s=>s.startsWith("weather.")).sort();return n.find(s=>e.states[s].attributes.cloud_coverage!==void 0)??n[0]??null}sky(e,t,n={}){let s=aE(e),r=n.pick?null:this.weatherEntity(e),o=r?e.states[r]??null:null;!n.past&&o&&(this.remember(o,t),this.loadHistory(e,r));let a=null;return!n.past&&!n.pick&&s&&this.settings.enabled!==!1&&(this.loadReference(e,s,t),a=oE(this.ref,n.solarKw??null,t,s.lat,s.lon)),sE({time:t,lat:(s==null?void 0:s.lat)??null,lon:(s==null?void 0:s.lon)??null,weather:o,pick:n.pick??null,clearIndex:a,lastRain:n.past?null:this.lastRain,lastSnow:n.past?null:this.lastSnow})}remember(e,t){A_.has(e.state)&&(this.lastRain=t),E_.has(e.state)&&(this.lastSnow=t)}loadHistory(e,t){if(this.historyFor===t)return;this.historyFor=t;let n=new Date(Date.now()-36*36e5).toISOString();e.callWS({type:"history/history_during_period",start_time:n,entity_ids:[t],minimal_response:!0,no_attributes:!0}).then(s=>{var a;let r=(s==null?void 0:s[t])??[],o=!1;r.forEach((l,c)=>{var f;let u=(((f=r[c+1])==null?void 0:f.lu)??Date.now()/1e3)*1e3;A_.has(l.s)&&u>(this.lastRain??0)&&(this.lastRain=u,o=!0),E_.has(l.s)&&u>(this.lastSnow??0)&&(this.lastSnow=u,o=!0)}),o&&((a=this.onChange)==null||a.call(this))}).catch(()=>{})}loadReference(e,t,n){let s=this.solar.join(",");!s||this.refBusy||s===this.refFor&&n-this.refAt<4*36e5||(this.refBusy=!0,this.refFor=s,this.refAt=n,e.callWS({type:"recorder/statistics_during_period",start_time:new Date(n-12*864e5).toISOString(),statistic_ids:this.solar,period:"5minute",types:["max"],units:{power:"kW"}}).then(r=>{var a;let o=this.solar.flatMap(l=>(r==null?void 0:r[l])??[]).filter(l=>typeof l.max=="number").map(l=>({start:typeof l.start=="number"?l.start:Date.parse(l.start),kw:l.max}));this.ref=o.length?rE(o,t.lat,t.lon):null,(a=this.onChange)==null||a.call(this)}).catch(()=>{}).finally(()=>{this.refBusy=!1}))}};function aE(i){let e=i==null?void 0:i.config;return e&&typeof e.latitude=="number"&&typeof e.longitude=="number"&&(e.latitude!==0||e.longitude!==0)?{lat:e.latitude,lon:e.longitude}:null}export{G0 as a,H0 as b,xo as c,un as d,Nn as e,ri as f,js as g,zh as h,Od as i,ps as j,Gd as k,qd as l,Zd as m,qh as n,Yh as o,Zh as p,Jh as q,$h as r,Kh as s,jh as t,Nr as u,Ct as v,wt as w,ai as x,bn as y,Xn as z,nr as A,cn as B,zi as C,bi as D,mn as E,dt as F,zg as G,oe as H,Zt as I,N as J,at as K,Qt as L,$e as M,ft as N,Li as O,Se as P,_a as Q,ya as R,zt as S,tt as T,Le as U,Ke as V,Vn as W,Ni as X,En as Y,Tt as Z,_n as _,Ui as $,wa as aa,Jt as ba,Dn as ca,Ra as da,Zu as ea,Fi as fa,ls as ga,La as ha,jt as ia,vp as ja,yn as ka,ro as la,oo as ma,il as na,sl as oa,Ft as pa,dl as qa,ds as ra,pl as sa,yl as ta,Sl as ua,xh as va,yh as wa,Oh as xa,_c as ya,Wp as za,Mw as Aa,vc as Ba,bc as Ca,ci as Da,Mc as Ea,ms as Fa,Sc as Ga,hE as Ha,fE as Ia,dE as Ja,pE as Ka,mE as La,gE as Ma,Hi as Na,pf as Oa,yE as Pa,Sw as Qa,ww as Ra,Aw as Sa,Ew as Ta,vE as Ua,bE as Va,ME as Wa,SE as Xa,wE as Ya,iA as Za,oT as _a,PA as $a,LA as ab,DA as bb,NA as cb,Dc as db,UA as eb,IT as fb,PT as gb,BA as hb,a_ as ib,LT as jb,CE as kb,xf as lb,Rx as mb,Fn as nb,PE as ob,LE as pb,Dx as qb,DE as rb,_f as sb,Rn as tb,Ux as ub,Ox as vb,OE as wb,BE as xb,kE as yb,VE as zb,zE as Ab,yf as Bb,HE as Cb,WE as Db,XE as Eb,kx as Fb,bf as Gb,Qp as Hb,qE as Ib,vf as Jb,YE as Kb,Mf as Lb,ZE as Mb,JE as Nb,Wx as Ob,Yx as Pb,tT as Qb,On as Rb,Ef as Sb,Rc as Tb,am as Ub,Jx as Vb,Tf as Wb,Gw as Xb,nT as Yb,iT as Zb,sT as _b,qn as $b,hm as ac,If as bc,c_ as cc,kt as dc,ST as ec,lA as fc,h_ as gc,IA as hc,NT as ic,UT as jc,BT as kc,iE as lc,kT as mc,T_ as nc,aE as oc};
