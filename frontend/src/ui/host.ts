// What the card and the panel share: their view, let go a while after it leaves the page and made
// again when it comes back.
import type { Hass } from "../live/hass";
import type { VhView } from "./view";

/**
 * How long a view out of the page keeps its 3D scene. Home Assistant keeps a dashboard's views
 * after they were shown, and makes a new panel each time it opens one, so without letting go every
 * visit would leave a WebGL context and a scene behind, and a tablet slows down after a few.
 */
export const RELEASE_MS = 10_000;

export abstract class ViewHost {
  /** Null when let go, or when it could not be made (the error box shows instead). */
  protected view: VhView | null = null;
  private failed: { hass: Hass | null } | null = null;
  private last: Hass | null = null;
  private releaseTimer = 0;

  constructor(protected host: HTMLElement) {}

  /** A new view in `inner`; may throw. */
  protected abstract make(inner: ShadowRoot): VhView;
  /** The error box in `inner` for a view that could not be made. */
  protected abstract failure(inner: ShadowRoot, err: unknown): { hass: Hass | null };
  /** Where the view goes. */
  protected abstract get inner(): ShadowRoot;

  protected build(): void {
    try {
      this.view = this.make(this.inner);
    } catch (err) {
      this.view = null;
      this.failed = this.failure(this.inner, err);
    }
  }

  set hass(h: Hass) {
    this.last = h;
    if (this.view) this.view.hass = h;
    else if (this.failed) this.failed.hass = h;
  }

  connect(): void {
    window.clearTimeout(this.releaseTimer);
    if (this.view || this.failed) {
      this.view?.connect();
      return;
    }
    // back after it was let go
    this.build();
    if (this.last) this.hass = this.last;
  }

  disconnect(): void {
    this.view?.disconnect();
    this.releaseLater();
  }

  private releaseLater(): void {
    window.clearTimeout(this.releaseTimer);
    this.releaseTimer = window.setTimeout(() => this.release(), RELEASE_MS);
  }

  private release(): void {
    const view = this.view;
    if (!view || this.host.isConnected) return;
    // an open editor may hold changes that aren't saved: they wait for the user
    if (view.editing) return this.releaseLater();
    view.destroy();
    this.inner.replaceChildren();
    this.view = null;
  }
}
