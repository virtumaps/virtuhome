// The dashboard card: the live view at a fixed height (or filling a panel view).
import type { Hass } from "../live/hass";
import { failedView } from "./errors";
import { VhView, type ViewConfig } from "./view";

export interface CardConfig extends ViewConfig {
  /** Height in pixels; ignored when the card sits in a panel view or fill is true. */
  height?: number;
  fill?: boolean;
}

/**
 * Whether the card sits in a panel view. Home Assistant puts the card inside the view's shadow
 * root, which closest() doesn't look out of, so this climbs out of each shadow root on the way.
 */
export function inPanelView(node: Node | null): boolean {
  for (let n = node; n; n = n.parentNode ?? (n as ShadowRoot).host ?? null) {
    if ((n as Element).localName === "hui-panel-view") return true;
  }
  return false;
}

export class CardImpl {
  /** Null when the view could not be made (the error box shows instead). */
  private view: VhView | null;
  private frame: HTMLElement;
  private failed: { hass: Hass | null } | null = null;

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
    try {
      this.view = new VhView(inner, config);
    } catch (err) {
      this.view = null;
      this.failed = failedView(inner, err, "card", config.quality);
    }
  }

  private applyHeight(): void {
    const fill = this.config.fill || inPanelView(this.host);
    this.frame.style.height = fill ? "calc(100vh - var(--header-height, 56px) - 16px)" : `${this.config.height ?? 440}px`;
  }

  setConfig(config: CardConfig): void {
    this.config = config;
    this.applyHeight();
    this.view?.setConfig(config);
  }

  set hass(h: Hass) {
    if (this.view) this.view.hass = h;
    else if (this.failed) this.failed.hass = h;
  }

  connect(): void {
    // put back on a page, maybe in another view
    this.applyHeight();
    this.view?.connect();
  }

  disconnect(): void {
    this.view?.disconnect();
  }
}
