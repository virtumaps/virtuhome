// The 3D engine, loaded on demand by virtuhome-loader.js.
import { CardImpl, type CardConfig } from "./ui/card";
import { PanelImpl } from "./ui/panel";

export function mountCard(host: HTMLElement, config: Record<string, unknown>): CardImpl {
  return new CardImpl(host, config as CardConfig);
}

export function mountPanel(host: HTMLElement): PanelImpl {
  return new PanelImpl(host);
}

export { VhView } from "./ui/view";
export { createCardEditor } from "./ui/card-editor";
export { normalizePlan } from "./model/plan";
