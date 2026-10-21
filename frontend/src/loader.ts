// Loaded on every Home Assistant page, so it stays tiny: it defines the card and panel elements
// and fetches the 3D engine (app/app.js) only when one of them is actually shown.


type AppModule = typeof import("./app");
type Impl = { setConfig?(c: unknown): void; set hass(h: unknown); setNarrow?(n: boolean): void; disconnect(): void; connect(): void };

const APP_URL = new URL(`./app/app.js?v=${__VERSION__}`, import.meta.url).href;
let app: Promise<AppModule> | null = null;
const loadApp = (): Promise<AppModule> => (app ??= import(/* @vite-ignore */ APP_URL) as Promise<AppModule>);

abstract class LazyElement extends HTMLElement {
  protected impl: Impl | null = null;
  protected _hass: unknown = null;
  private loading = false;

  set hass(h: unknown) {
    this._hass = h;
    if (this.impl) this.impl.hass = h;
    else this.start();
  }

  get hass(): unknown {
    return this._hass;
  }

  connectedCallback(): void {
    if (this.impl) this.impl.connect();
    else this.start();
  }

  disconnectedCallback(): void {
    this.impl?.disconnect();
  }

  protected abstract mount(app: AppModule): Impl;

  private async start(): Promise<void> {
    if (this.loading || this.impl || !this.isConnected || !this._hass) return;
    this.loading = true;
    try {
      const mod = await loadApp();
      // the texts in the user's language before anything is drawn
      await mod.useLanguage(this._hass);
      this.impl = this.mount(mod);
      this.impl.hass = this._hass;
    } catch (err) {
      this.textContent = `VirtuHome could not load: ${err}`;
    } finally {
      this.loading = false;
    }
  }
}

class VirtuHomeCard extends LazyElement {
  private config: Record<string, unknown> = {};

  setConfig(config: Record<string, unknown>): void {
    this.config = { ...config };
    this.impl?.setConfig?.(this.config);
  }

  protected mount(mod: AppModule): Impl {
    return mod.mountCard(this, this.config);
  }

  getCardSize(): number {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, rows: 8, min_rows: 4, min_columns: 6 };
  }

  static getStubConfig() {
    return {};
  }

  static async getConfigElement(): Promise<HTMLElement> {
    return (await loadApp()).createCardEditor();
  }
}

class VirtuHomePanel extends LazyElement {
  private _narrow = false;

  set narrow(n: boolean) {
    this._narrow = n;
    this.impl?.setNarrow?.(n);
  }

  // Home Assistant also sets route and panel; nothing to do with them yet
  set route(_r: unknown) {}
  set panel(_p: unknown) {}

  protected mount(mod: AppModule): Impl {
    const impl = mod.mountPanel(this);
    impl.setNarrow?.(this._narrow);
    return impl;
  }
}

// Some dashboard plugins swap window.customElements for a polyfill after we defined ours, and
// dashboards then no longer find the card. Define again (a fresh subclass) on whatever registry is
// current, for a while after loading.
const ensureDefined = () => {
  try {
    if (!customElements.get("virtuhome-card")) customElements.define("virtuhome-card", class extends VirtuHomeCard {});
    if (!customElements.get("virtuhome-panel")) customElements.define("virtuhome-panel", class extends VirtuHomePanel {});
  } catch (err) {
    // the native registry already has it under this name: nothing more to do
  }
};
ensureDefined();
for (const ms of [250, 1000, 3000, 8000, 20000]) window.setTimeout(ensureDefined, ms);

const w = window as unknown as { customCards?: { type: string; name: string; description: string; preview?: boolean }[] };
w.customCards = w.customCards || [];
if (!w.customCards.some((c) => c.type === "virtuhome-card")) {
  w.customCards.push({
    type: "virtuhome-card",
    name: "VirtuHome",
    description: "Your home as a live 3D model: lights, doors, windows, cameras and sensors in place.",
    preview: false,
  });
}
