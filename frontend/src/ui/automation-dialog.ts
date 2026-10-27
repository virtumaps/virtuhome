// The dialog that asks the user before an extension adds an automation to Home Assistant
// (ExtensionContext.automations.add). Loaded only when one asks. What it shows comes from the
// integration's preview of the signed blueprint with the inputs filled in; names from Home
// Assistant go in as text only.
import { t } from "../i18n";
import type { Hass } from "../live/hass";

/** virtuhome/automations/preview's answer. */
export interface AutomationPreview {
  alias: string;
  description: string;
  blueprint: { id: string; path: string; name: string; description: string; yaml: string };
  inputs: { key: string; name: string; value: unknown }[];
  /** Where notifications go: notify services (with notify entities), or mobile_app devices. */
  notify: { service?: string; entity_id?: string | string[]; device_id?: string }[];
  /** The triggers, conditions and actions with the inputs filled in. */
  yaml: string;
}

/** A value as people know it: an entity, device or area by its name; else as it is. */
function shown(value: unknown, hass: Hass | null): string {
  if (Array.isArray(value)) return value.map((v) => shown(v, hass)).join(", ");
  if (typeof value === "string") {
    const name = hass?.states[value]?.attributes.friendly_name;
    if (name) return `${String(name)} (${value})`;
    const device = hass?.devices?.[value];
    if (device) return String(device.name_by_user ?? device.name ?? value);
    const area = hass?.areas?.[value];
    return area ? area.name : value;
  }
  return typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
}

/** What the dialog lists: its settings as [name, value] and where notifications go. */
export function previewRows(p: AutomationPreview, hass: Hass | null): { settings: [string, string][]; notify: string[] } {
  const notify = p.notify.map((n) => n.device_id ? shown(n.device_id, hass) : n.entity_id ? shown(n.entity_id, hass) : n.service ?? "");
  return { settings: p.inputs.map((i): [string, string] => [i.name, shown(i.value, hass)]), notify: [...new Set(notify)] };
}

const CSS = `
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
`;

function el(tag: string, cls: string, ...children: (Node | string)[]): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  node.append(...children);
  return node;
}

/** Asks the user whether to add the automation; true when they agree. */
export function askToAdd(p: AutomationPreview, extName: string, hass: Hass | null): Promise<boolean> {
  const { settings, notify } = previewRows(p, hass);
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = CSS;
  const yes = el("button", "yes", t("automations.add"));
  const no = el("button", "no", t("automations.notNow"));
  const yaml = (summary: string, text: string) => el("details", "", el("summary", "", summary), el("pre", "", text));
  const box = el("div", "box",
    el("h2", "", t("automations.title")),
    el("p", "", t("automations.intro", { ext: extName })),
    el("h3", "", t("automations.name")), el("p", "", p.alias),
    ...(p.blueprint.description ? [el("h3", "", t("automations.what")), el("p", "", p.blueprint.description)] : []),
    ...(settings.length ? [el("h3", "", t("automations.settings")), el("ul", "", ...settings.map(([k, v]) => el("li", "", `${k}: ${v}`)))] : []),
    ...(notify.length ? [el("h3", "", t("automations.notify")), el("ul", "", ...notify.map((n) => el("li", "", n)))] : []),
    yaml(t("automations.yaml"), p.yaml),
    yaml(t("automations.blueprintYaml"), p.blueprint.yaml),
    el("p", "dim", t("automations.where")),
    el("div", "row", no, yes),
  );
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  const bg = el("div", "bg", box);
  root.append(style, bg);
  document.body.append(host);
  yes.focus();
  return new Promise((resolve) => {
    const done = (answer: boolean) => {
      host.remove();
      document.removeEventListener("keydown", key, true);
      resolve(answer);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && done(false);
    document.addEventListener("keydown", key, true);
    yes.onclick = () => done(true);
    no.onclick = () => done(false);
    bg.onclick = (e) => e.target === bg && done(false);
  });
}
