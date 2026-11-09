// The search box (the Search button, / or Ctrl+K), fetched the first time it opens: type a name and
// pick a room, device, piece of furniture or scene. The view goes there (it jumps with reduced
// motion), opens the room's sheet and points the thing out with a pulsing marker for a few seconds:
// one more marker in the markers' draw, no draw call of its own. A scene in no room opens its dialog.
import { domainOf, type Hass } from "../live/hass";
import type { Plan } from "../model/plan";
import type { Viewer } from "../scene/viewer";
import { find, findIndex, type Found } from "./find";
import { t } from "../i18n";

/** What the search needs of the view. */
export interface SearchHost {
  root: HTMLElement;
  /** The Search button: a press on it closes the box (rather than closing and opening it again). */
  button: HTMLElement;
  viewer: Viewer;
  hass(): Hass | null;
  plan(): Plan | null;
  /** Shows a room (its sheet too), or a floor when the room is -1. */
  go(floor: number, room: number): void;
  dialog(entity: string): void;
  /** The box closed (focus goes back to the Search button). */
  closed(): void;
  /** The view's magnifier and close icons (icons stay in the chunks they are in). */
  icons: { find: string; close: string };
}

export interface SearchBox {
  focus(): void;
  close(): void;
}

const CSS = /* css */ `
.vh-find {
  position: absolute; z-index: 7; top: 10px; left: 50%; transform: translateX(-50%); box-sizing: border-box;
  width: min(520px, calc(100% - 20px)); max-height: calc(100% - 20px); display: flex; flex-direction: column; overflow: hidden;
  border-radius: 18px; background: var(--vh-glass); color: var(--vh-text); box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.vh-find-bar { display: flex; align-items: center; gap: 8px; padding: 4px 4px 4px 14px; }
.vh-find-bar > svg { width: 20px; height: 20px; fill: var(--vh-dim); flex: none; }
.vh-find input { flex: 1; min-width: 0; border: 0; background: none; color: inherit; font: inherit; font-size: 16px; padding: 10px 0; outline: none; }
.vh-find input::placeholder { color: var(--vh-dim); }
.vh-find input::-webkit-search-cancel-button { display: none; }
.vh-find .vh-icon { width: 40px; height: 40px; background: none; box-shadow: none; flex: none; }
.vh-find-list { overflow: auto; overscroll-behavior: contain; padding: 0 6px 6px; }
.vh-find-list:empty { display: none; }
.vh-find [role="option"] {
  display: flex; flex-direction: column; justify-content: center; gap: 1px; min-height: 48px; box-sizing: border-box;
  padding: 6px 10px; border-radius: 12px; cursor: pointer;
}
.vh-find [role="option"]:hover { background: var(--vh-chip); }
.vh-find [role="option"][aria-selected="true"] { background: var(--vh-chip-on); box-shadow: inset 0 0 0 1.5px var(--vh-accent); }
.vh-find [role="option"] b { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vh-find [role="option"] small { font-size: 12px; color: var(--vh-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vh-find-none { padding: 4px 10px 10px; font-size: 13px; color: var(--vh-dim); }
`;

/** Each view's entity aliases, fetched once for the registry it had (a new registry fetches them again). */
const aliasCache = new WeakMap<object, Promise<Record<string, string[]>>>();

/** Home Assistant's aliases of the entities (the entity registry's own; any user may read them). */
function aliasesOf(hass: Hass, ids: string[]): Promise<Record<string, string[]>> {
  const key = hass.entities ?? hass;
  let p = aliasCache.get(key);
  if (!p) {
    p = hass.callWS<Record<string, { aliases?: unknown } | null>>({ type: "config/entity_registry/get_entries", entity_ids: ids })
      .then((res) => {
        const out: Record<string, string[]> = {};
        for (const [id, e] of Object.entries(res ?? {})) {
          const list = Array.isArray(e?.aliases) ? e.aliases.filter((a): a is string => typeof a === "string" && !!a.trim()) : [];
          if (list.length) out[id] = list;
        }
        return out;
      })
      .catch(() => ({}));
    aliasCache.set(key, p);
  }
  return p;
}

let boxes = 0;

/** Opens the search box over the view. */
export function openSearch(host: SearchHost): SearchBox {
  const hass = host.hass();
  const plan = host.plan();
  let index: Found[] = hass && plan ? findIndex(plan, hass) : [];
  const id = `vh-find-${++boxes}`;
  const el = document.createElement("div");
  el.className = "vh-find";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", t("view.tool.search"));
  el.innerHTML = `<style>${CSS}</style><div class="vh-find-bar">${host.icons.find}<input type="search" role="combobox" aria-autocomplete="list" aria-controls="${id}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"><button class="vh-icon">${host.icons.close}</button></div><div class="vh-find-list" role="listbox" id="${id}"></div>`;
  const input = el.querySelector("input")!;
  const list = el.querySelector<HTMLElement>(".vh-find-list")!;
  const closeBtn = el.querySelector("button")!;
  input.placeholder = t("search.placeholder");
  input.setAttribute("aria-label", t("search.placeholder"));
  list.setAttribute("aria-label", t("search.results"));
  closeBtn.title = t("view.close");
  closeBtn.setAttribute("aria-label", t("view.close"));
  host.root.append(el);

  let shown: Found[] = [];
  let active = 0;
  const mark = (i: number) => {
    active = i;
    list.querySelectorAll<HTMLElement>("[role=option]").forEach((o, k) => o.setAttribute("aria-selected", String(k === i)));
    const on = list.children[i] as HTMLElement | undefined;
    if (on?.id) {
      input.setAttribute("aria-activedescendant", on.id);
      on.scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  };
  const draw = () => {
    const q = input.value;
    // nothing typed: the rooms, to tap one
    shown = q.trim() ? find(index, q) : index.filter((x) => x.kind === "room" || x.kind === "garden").slice(0, 30);
    list.replaceChildren(...shown.map((x, i) => {
      const o = document.createElement("div");
      o.id = `${id}-${i}`;
      o.setAttribute("role", "option");
      o.innerHTML = "<b></b><small></small>";
      o.querySelector("b")!.textContent = x.name;
      o.querySelector("small")!.textContent = [kindName(x), x.where].filter(Boolean).join(" · ");
      o.onclick = () => pick(x);
      return o;
    }));
    if (!shown.length && q.trim()) {
      const none = document.createElement("div");
      none.className = "vh-find-none";
      none.textContent = t("search.none", { text: q.trim() });
      list.append(none);
    }
    input.setAttribute("aria-expanded", String(shown.length > 0));
    mark(0);
  };

  let open = true;
  const close = () => {
    if (!open) return;
    open = false;
    el.remove();
    host.root.removeEventListener("pointerdown", outside, true);
    host.closed();
  };
  const outside = (e: Event) => {
    const path = e.composedPath();
    if (!path.includes(el) && !path.includes(host.button)) close();
  };
  host.root.addEventListener("pointerdown", outside, true);

  const pick = (x: Found) => {
    close();
    if (x.floor < 0) {
      if (x.entity) host.dialog(x.entity);
      return;
    }
    host.go(x.floor, x.room);
    if (x.spot) flash(host, x);
  };

  input.addEventListener("input", draw);
  input.addEventListener("keydown", (e) => {
    const n = shown.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (n) mark((active + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) pick(shown[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });
  closeBtn.onclick = close;
  draw();
  input.focus();

  // aliases arrive a moment later: then what is typed is matched again
  if (hass && plan) {
    void aliasesOf(hass, index.flatMap((x) => (x.entity ? [x.entity] : []))).then((aliases) => {
      if (!open || !Object.keys(aliases).length) return;
      index = findIndex(plan, hass, aliases);
      const was = shown[active];
      draw();
      const i = shown.findIndex((x) => x.entity === was?.entity && x.name === was?.name);
      if (i > 0) mark(i);
    });
  }
  return { focus: () => input.focus(), close };
}

/**
 * The kinds of device with a name of their own, as Check my setup names them (model/links.ts has
 * the same list: importing it would move that module into a chunk of its own).
 */
const DEVICE_KINDS = [
  "light", "camera", "binary_sensor", "sensor", "climate", "media_player", "switch", "cover", "lock", "fan", "vacuum", "alarm_control_panel",
  "assist_satellite", "water_heater", "humidifier",
] as const;

/** What it is, in a word: a device by its kind ("Lock"). */
function kindName(x: Found): string {
  if (x.kind !== "device") return t(`search.kind.${x.kind}`);
  const d = DEVICE_KINDS.find((k) => k === domainOf(x.entity ?? ""));
  return d ? t(`links.device.${d}`) : t("links.device");
}

/** Points the thing out for a few seconds: a marker over it, pulsing unless the device asks for less motion. */
function flash(host: SearchHost, x: Found): void {
  const v = host.viewer;
  const plan = host.plan();
  const s = x.spot!;
  const floor = plan?.floors[x.floor];
  if (!floor) return;
  // after go(): the floor is shown alone, so it stands at its own height
  const pos: [number, number, number] = s.device ? v.devicePosition(x.floor, s.device) : [s.x, floor.elevation + s.y, s.z];
  let calm = false;
  try {
    calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    // no matchMedia: it pulses
  }
  const marker = { key: "__found", pos, icon: 0, color: 0x56c7ff, size: 34, pulse: calm ? 0 : 1, alpha: 1 };
  v.overlayMarkers = [marker];
  v.refreshMarkers();
  window.setTimeout(() => {
    // unless something else (the editor) has put its own there since
    if (v.overlayMarkers[0] !== marker) return;
    v.overlayMarkers = [];
    v.refreshMarkers();
  }, 4000);
}
