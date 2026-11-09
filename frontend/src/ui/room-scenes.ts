// The scenes and scripts on a room's sheet (live/scenes.ts picks them), fetched the first time a
// sheet opens. A tap runs one; a scene that locks, arms or opens something asks first, as the alarm
// sheet does, and a script that needs details opens its dialog to ask for them.
import { domainOf, type Hass } from "../live/hass";
import { needsDetails, roomScenes, sceneRisks } from "../live/scenes";
import type { Floor } from "../model/plan";
import { t } from "../i18n";

/** What the buttons need of the view. */
export interface SceneHost {
  hass(): Hass | null;
  name(id: string): string;
  dialog(id: string): void;
  toast(text: string): void;
  /** The buttons' icon (the view's play icon: icons stay in the chunks they are in). */
  icon: string;
}

/** What the sheet of a room or garden area (by id) shows. */
export function sheetScenes(hass: Hass, floor: Floor, id: string): string[] {
  const s = [...floor.rooms, ...(floor.outdoor ?? [])].find((x) => x.id === id);
  return s ? roomScenes(hass, s) : [];
}

/** Adds the buttons to the sheet's actions; while one asks first, its question and Run and Cancel instead. */
export function sceneButtons(host: SceneHost, scenes: string[], actions: HTMLElement): void {
  const box = document.createElement("span");
  box.style.display = "contents";
  actions.append(box);
  const draw = (ask: string | null) => {
    const hass = host.hass();
    box.replaceChildren();
    if (!hass) return;
    const chip = (text: string, onclick: () => void, main = false, icon = "") => {
      const b = document.createElement("button");
      b.className = `vh-chip${main ? " on" : ""}`;
      b.innerHTML = `${icon}<span></span>`;
      b.querySelector("span")!.textContent = text;
      b.onclick = onclick;
      box.append(b);
      return b;
    };
    if (ask) {
      const q = document.createElement("span");
      q.className = "sub";
      q.style.cssText = "flex-basis:100%;margin:0";
      q.textContent = t("view.scene.ask", { name: host.name(ask), what: sceneRisks(hass, ask).map(host.name).join(", ") });
      box.append(q);
      chip(t("view.scene.run"), () => {
        draw(null);
        run(host, ask);
      }, true);
      chip(t("view.scene.cancel"), () => draw(null));
      return;
    }
    for (const id of scenes) {
      const details = needsDetails(hass, id);
      const b = chip(host.name(id), () => {
        if (details) host.dialog(id);
        else if (sceneRisks(hass, id).length) draw(id);
        else run(host, id);
      }, false, host.icon);
      if (details) b.title = t("view.scene.details");
    }
  };
  draw(null);
}

function run(host: SceneHost, id: string): void {
  const hass = host.hass();
  if (!hass) return;
  const name = host.name(id);
  host.toast(t(domainOf(id) === "script" ? "view.scene.started" : "view.scene.on", { name }));
  hass.callService(domainOf(id), "turn_on", {}, { entity_id: id })
    .catch((err: unknown) => host.toast(t("view.scene.failed", { name, error: err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err) })));
}
