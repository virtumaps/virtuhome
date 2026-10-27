import{f as i}from"./chunk-JFOFFCBB.js";function l(t,o){var r,e,d;if(Array.isArray(t))return t.map(a=>l(a,o)).join(", ");if(typeof t=="string"){let a=(r=o==null?void 0:o.states[t])==null?void 0:r.attributes.friendly_name;if(a)return`${String(a)} (${t})`;let p=(e=o==null?void 0:o.devices)==null?void 0:e[t];if(p)return String(p.name_by_user??p.name??t);let m=(d=o==null?void 0:o.areas)==null?void 0:d[t];return m?m.name:t}return typeof t=="object"&&t!==null?JSON.stringify(t):String(t)}function v(t,o){let r=t.notify.map(e=>e.device_id?l(e.device_id,o):e.entity_id?l(e.entity_id,o):e.service??"");return{settings:t.inputs.map(e=>[e.name,l(e.value,o)]),notify:[...new Set(r)]}}var k=`
.bg { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.5); font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif); }
.box { box-sizing: border-box; width: min(520px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow: auto;
  padding: 20px; border-radius: 16px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #1d232b);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3); font-size: 14px; line-height: 1.45; }
h2 { margin: 0 0 8px; font-size: 18px; font-weight: 600; }
h3 { margin: 14px 0 4px; font-size: 13px; font-weight: 600; color: var(--secondary-text-color, #5a6573); }
p, ul { margin: 0 0 6px; } ul { padding-left: 18px; }
.dim { margin-top: 12px; color: var(--secondary-text-color, #5a6573); font-size: 13px; }
details { margin-top: 10px; } summary { cursor: pointer; font-size: 13px; }
pre { margin: 6px 0 0; padding: 8px; border-radius: 8px; overflow: auto; font-size: 12px; white-space: pre;
  background: var(--secondary-background-color, rgba(0,0,0,0.05)); }
.row { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
button { font: inherit; padding: 8px 16px; border-radius: 18px; border: 0; cursor: pointer; }
.no { background: transparent; color: var(--primary-color, #2f7cf6); }
.yes { background: var(--primary-color, #2f7cf6); color: var(--text-primary-color, #fff); }
`;function n(t,o,...r){let e=document.createElement(t);return o&&(e.className=o),e.append(...r),e}function _(t,o,r){let{settings:e,notify:d}=v(t,r),a=document.createElement("div"),p=a.attachShadow({mode:"open"}),m=document.createElement("style");m.textContent=k;let u=n("button","yes",i("automations.add")),x=n("button","no",i("automations.notNow")),b=(c,s)=>n("details","",n("summary","",c),n("pre","",s)),f=n("div","box",n("h2","",i("automations.title")),n("p","",i("automations.intro",{ext:o})),n("h3","",i("automations.name")),n("p","",t.alias),...t.blueprint.description?[n("h3","",i("automations.what")),n("p","",t.blueprint.description)]:[],...e.length?[n("h3","",i("automations.settings")),n("ul","",...e.map(([c,s])=>n("li","",`${c}: ${s}`)))]:[],...d.length?[n("h3","",i("automations.notify")),n("ul","",...d.map(c=>n("li","",c)))]:[],b(i("automations.yaml"),t.yaml),b(i("automations.blueprintYaml"),t.blueprint.yaml),n("p","dim",i("automations.where")),n("div","row",x,u));f.setAttribute("role","dialog"),f.setAttribute("aria-modal","true");let y=n("div","bg",f);return p.append(m,y),document.body.append(a),u.focus(),new Promise(c=>{let s=g=>{a.remove(),document.removeEventListener("keydown",w,!0),c(g)},w=g=>g.key==="Escape"&&s(!1);document.addEventListener("keydown",w,!0),u.onclick=()=>s(!0),x.onclick=()=>s(!1),y.onclick=g=>g.target===y&&s(!1)})}export{_ as askToAdd,v as previewRows};
