// The card's visual editor in the dashboard UI, built on Home Assistant's own ha-form.
import type { Hass } from "../live/hass";
import { cardSchemas, loadExtensions } from "../ext/api";
import { t, useLanguage } from "../i18n";
import { tierName } from "../scene/tier";

/** The form, in the user's language. */
const schema = () => [
  { name: "floor", selector: { text: {} } },
  {
    type: "grid", name: "", schema: [
      { name: "theme", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: t("card.theme.auto") }, { value: "day", label: t("card.theme.day") }, { value: "night", label: t("card.theme.night") }] } } },
      { name: "walls", selector: { select: { mode: "dropdown", options: [{ value: "smart", label: t("card.walls.smart") }, { value: "low", label: t("card.walls.low") }, { value: "full", label: t("card.walls.full") }] } } },
      { name: "quality", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: t("view.graphics.auto") }, { value: "low", label: t("card.quality.low") }, { value: "medium", label: tierName("medium") }, { value: "high", label: tierName("high") }, { value: "ultra", label: tierName("ultra") }] } } },
      { name: "height", selector: { number: { min: 200, max: 1600, step: 10, unit_of_measurement: "px", mode: "box" } } },
    ],
  },
  { type: "grid", name: "", schema: [
    { name: "room_panel", selector: { boolean: {} } },
    { name: "floor_chips", selector: { boolean: {} } },
    { name: "fill", selector: { boolean: {} } },
    { name: "people", selector: { boolean: {} } },
    { name: "energy", selector: { boolean: {} } },
    { name: "roof", selector: { boolean: {} } },
  ] },
  { name: "alarm", selector: { entity: { domain: "alarm_control_panel" } } },
];

/** The options the form labels itself. */
const OPTIONS = ["floor", "theme", "walls", "quality", "people", "height", "room_panel", "floor_chips", "fill", "alarm", "energy", "roof"] as const;

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
      // in the user's language, and with the extensions' own options, once they are loaded
      useLanguage(h).then(() => this.render());
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
    const labels = Object.assign(Object.fromEntries(OPTIONS.map((o) => [o, t(`card.${o}`)])), ...cardSchemas.map((s) => s.labels));
    this.form!.hass = this._hass;
    this.form!.schema = [...schema(), ...cardSchemas.map((s) => s.section)];
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
