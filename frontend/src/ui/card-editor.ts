// The card's visual editor in the dashboard UI, built on Home Assistant's own ha-form.
import type { Hass } from "../live/hass";
import { cardSchemas, loadExtensions } from "../ext/api";

const SCHEMA = [
  { name: "floor", selector: { text: {} } },
  {
    type: "grid", name: "", schema: [
      { name: "theme", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Auto (day/night by the sun)" }, { value: "day", label: "Day" }, { value: "night", label: "Night" }] } } },
      { name: "walls", selector: { select: { mode: "dropdown", options: [{ value: "smart", label: "Smart cutaway" }, { value: "low", label: "Low" }, { value: "full", label: "Full height" }] } } },
      { name: "quality", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Automatic" }, { value: "low", label: "Tablet (fastest)" }, { value: "medium", label: "Standard" }, { value: "high", label: "Realistic" }, { value: "ultra", label: "Ultra" }] } } },
      { name: "height", selector: { number: { min: 200, max: 1600, step: 10, unit_of_measurement: "px", mode: "box" } } },
    ],
  },
  { type: "grid", name: "", schema: [
    { name: "room_panel", selector: { boolean: {} } },
    { name: "floor_chips", selector: { boolean: {} } },
    { name: "fill", selector: { boolean: {} } },
  ] },
  { name: "alarm", selector: { entity: { domain: "alarm_control_panel" } } },
];

const LABELS: Record<string, string> = {
  floor: "Open on floor (name, id or number; empty = whole house)",
  theme: "Look", walls: "Walls", quality: "Graphics", height: "Height",
  room_panel: "Tap a room to open it", floor_chips: "Floor buttons", fill: "Fill the screen",
  alarm: "Alarm panel in the top bar",
};

type Config = Record<string, unknown>;

export class VirtuHomeCardEditor extends HTMLElement {
  private _hass: Hass | null = null;
  private config: Config = {};
  private form: (HTMLElement & { hass?: unknown; data?: unknown; schema?: unknown; computeLabel?: unknown }) | null = null;

  setConfig(config: Config): void {
    this.config = { ...config };
    this.render();
  }

  set hass(h: Hass) {
    this._hass = h;
    if (this.form) this.form.hass = h;
    else {
      this.render();
      // extensions add their own options once they are loaded
      loadExtensions(h).then(() => this.render());
    }
  }

  private render(): void {
    if (!this._hass) return;
    if (!this.form) {
      const form = document.createElement("ha-form") as HTMLElement & { hass?: unknown; data?: unknown; schema?: unknown; computeLabel?: unknown };
      form.addEventListener("value-changed", (e: Event) => this.changed((e as CustomEvent).detail.value));
      this.appendChild(form);
      this.form = form;
    }
    const labels = Object.assign({}, LABELS, ...cardSchemas.map((s) => s.labels));
    this.form!.hass = this._hass;
    this.form!.schema = [...SCHEMA, ...cardSchemas.map((s) => s.section)];
    this.form!.computeLabel = (s: { name: string; title?: string }) => labels[s.name] ?? s.title ?? s.name;
    this.form!.data = { ...this.config };
  }

  private changed(value: Record<string, unknown>): void {
    const next: Config = { type: "custom:virtuhome-card", ...value };
    for (const k of Object.keys(next)) if (next[k] === "" || next[k] === undefined) delete next[k];
    this.config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
}

export function createCardEditor(): HTMLElement {
  if (!customElements.get("virtuhome-card-editor")) customElements.define("virtuhome-card-editor", VirtuHomeCardEditor);
  return document.createElement("virtuhome-card-editor");
}
