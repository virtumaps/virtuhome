// The sidebar panel: the live view filling the page, with Home Assistant's menu button on phones.
import { mdiMenu } from "@mdi/js";
import type { Hass } from "../live/hass";
import { VhView } from "./view";

export class PanelImpl {
  private view: VhView;
  private menu: HTMLButtonElement;

  constructor(private host: HTMLElement) {
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
    this.view = new VhView(viewHost.attachShadow({ mode: "open" }), { editable: true, stats: new URLSearchParams(location.search).has("stats") });
  }

  setNarrow(narrow: boolean): void {
    this.host.shadowRoot?.querySelector(".page")?.classList.toggle("narrow", narrow);
    this.view.root.style.setProperty("--vh-bar-left", narrow ? "56px" : "0px");
    this.view.root.classList.toggle("narrow", narrow);
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
