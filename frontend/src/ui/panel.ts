// The sidebar panel: the live view filling the page, with Home Assistant's menu button on phones.
import { mdiMenu } from "@mdi/js";
import type { Hass } from "../live/hass";
import { failedView } from "./errors";
import { ViewHost } from "./host";
import { VhView } from "./view";

export class PanelImpl extends ViewHost {
  private menu: HTMLButtonElement;
  private root: ShadowRoot;
  private narrow = false;

  constructor(host: HTMLElement) {
    super(host);
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
      :host { display: block; height: 100%; }
      .page { position: relative; height: 100vh; height: 100dvh; background: #0c1220; }
      .menu { position: absolute; z-index: 2; top: 10px; left: 10px; width: 40px; height: 40px; border-radius: 50%;
        border: 0; display: none; place-items: center; background: rgba(14,20,32,.62); color: #eef3fb; cursor: pointer; }
      .menu svg { width: 22px; height: 22px; fill: currentColor; }
      .page.narrow .menu { display: grid; }
      .page.narrow .host { --bar-left: 58px; }
    </style>`;
    const page = document.createElement("div");
    page.className = "page";
    this.menu = document.createElement("button");
    this.menu.className = "menu";
    this.menu.innerHTML = `<svg viewBox="0 0 24 24"><path d="${mdiMenu}"/></svg>`;
    this.menu.onclick = () => host.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
    const viewHost = document.createElement("div");
    viewHost.className = "host";
    viewHost.style.cssText = "position:absolute;inset:0";
    page.append(viewHost, this.menu);
    shadow.appendChild(page);
    this.root = viewHost.attachShadow({ mode: "open" });
    this.build();
  }

  protected get inner(): ShadowRoot {
    return this.root;
  }

  protected make(inner: ShadowRoot): VhView {
    const view = new VhView(inner, { editable: true, stats: new URLSearchParams(location.search).has("stats") });
    this.showNarrow(view);
    return view;
  }

  protected failure(inner: ShadowRoot, err: unknown): { hass: Hass | null } {
    return failedView(inner, err, "panel");
  }

  setNarrow(narrow: boolean): void {
    this.narrow = narrow;
    this.host.shadowRoot?.querySelector(".page")?.classList.toggle("narrow", narrow);
    if (this.view) this.showNarrow(this.view);
  }

  private showNarrow(view: VhView): void {
    view.root.style.setProperty("--vh-bar-left", this.narrow ? "56px" : "0px");
    view.root.classList.toggle("narrow", this.narrow);
  }
}
