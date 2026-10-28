// The dashboard card: the live view at a fixed height (or filling a panel view).
import type { Hass } from "../live/hass";
import { failedView } from "./errors";
import { ViewHost } from "./host";
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

export class CardImpl extends ViewHost {
  private frame: HTMLElement;
  private root: ShadowRoot;

  constructor(host: HTMLElement, private config: CardConfig) {
    super(host);
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
    this.root = this.frame.attachShadow({ mode: "open" });
    this.build();
  }

  protected get inner(): ShadowRoot {
    return this.root;
  }

  protected make(inner: ShadowRoot): VhView {
    return new VhView(inner, this.config);
  }

  protected failure(inner: ShadowRoot, err: unknown): { hass: Hass | null } {
    return failedView(inner, err, "card", this.config.quality);
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

  connect(): void {
    // put back on a page, maybe in another view
    this.applyHeight();
    super.connect();
  }
}
