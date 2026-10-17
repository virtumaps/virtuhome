// The dashboard card: the live view at a fixed height (or filling a panel view).
import type { Hass } from "../live/hass";
import { VhView, type ViewConfig } from "./view";

export interface CardConfig extends ViewConfig {
  /** Height in pixels; ignored when the card sits in a panel view or fill is true. */
  height?: number;
  fill?: boolean;
}

export class CardImpl {
  private view: VhView;
  private frame: HTMLElement;

  constructor(private host: HTMLElement, private config: CardConfig) {
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
      :host { display: block; }
      ha-card, .frame { overflow: hidden; height: 100%; }
      .frame { position: relative; border-radius: var(--ha-card-border-radius, 12px); }
    </style>`;
    this.frame = document.createElement("div");
    this.frame.className = "frame";
    shadow.appendChild(this.frame);
    this.applyHeight();
    const inner = this.frame.attachShadow({ mode: "open" });
    this.view = new VhView(inner, config);
  }

  private applyHeight(): void {
    const fill = this.config.fill || this.host.closest?.("hui-panel-view") !== null;
    this.frame.style.height = fill ? "calc(100vh - var(--header-height, 56px) - 16px)" : `${this.config.height ?? 440}px`;
  }

  setConfig(config: CardConfig): void {
    this.config = config;
    this.applyHeight();
    this.view.setConfig(config);
  }

  set hass(h: Hass) {
    this.view.hass = h;
  }

  connect(): void {
    this.view.connect();
  }

  disconnect(): void {
    this.view.disconnect();
  }
}
