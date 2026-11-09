// What a tap on a gate or an awning opens by the finger: what it is doing, and what it can do (open,
// close, stop, a position; a lock's lock and unlock; a switch's on and off), asked before anything
// moves, with Details for its dialog. Loaded the first time one is tapped.
import { domainOf, type Hass } from "../live/hass";
import { lockActions, lockKind, needsCode } from "../live/locks";
import { valueText } from "../live/readings";
import { t } from "../i18n";

export interface CoverMenuHost {
  /** Its name in Home Assistant. */
  name: string;
  /** Closes the menu. */
  done(): void;
  toast(text: string): void;
  dialog(id: string): void;
}

/** A cover's features (Home Assistant's CoverEntityFeature). */
const OPEN = 1, CLOSE = 2, SET_POSITION = 4, STOP = 8;

/** The menu's rows for a gate's or awning's entity. */
export function coverRows(hass: Hass, id: string, host: CoverMenuHost): HTMLElement[] {
  const s = hass.states[id];
  const dom = domainOf(id);
  const head = document.createElement("div");
  head.className = "vh-pop-head";
  head.innerHTML = "<b></b><small></small>";
  head.querySelector("b")!.textContent = host.name;
  const pos = s?.attributes.current_position;
  head.querySelector("small")!.textContent = valueText(hass, id) + (typeof pos === "number" && pos > 0 && pos < 100 ? ` · ${pos} %` : "");
  const rows: HTMLElement[] = [head];
  let code: HTMLInputElement | null = null;
  const run = (domain: string, service: string, data: Record<string, unknown>, doing: string | null) => {
    host.done();
    if (doing) host.toast(doing);
    hass.callService(domain, service, data, { entity_id: id })
      .catch((err: unknown) => host.toast(t("lock.failed", { error: err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err) })));
  };
  const row = (text: string, onclick: () => void) => {
    const b = document.createElement("button");
    b.className = "vh-menu-row";
    b.innerHTML = "<span><b></b></span>";
    b.querySelector("b")!.textContent = text;
    b.onclick = onclick;
    rows.push(b);
  };
  const name = host.name;
  if (s && s.state !== "unavailable") {
    if (dom === "cover") {
      const f = typeof s.attributes.supported_features === "number" ? s.attributes.supported_features : OPEN | CLOSE | STOP;
      if (f & OPEN) row(t("cover.open"), () => run("cover", "open_cover", {}, t("cover.doing.open", { name })));
      if (f & CLOSE) row(t("cover.close"), () => run("cover", "close_cover", {}, t("cover.doing.close", { name })));
      if (f & STOP) row(t("cover.stop"), () => run("cover", "stop_cover", {}, t("cover.doing.stop", { name })));
      if (f & SET_POSITION) {
        const r = document.createElement("input");
        r.type = "range";
        r.min = "0";
        r.max = "100";
        r.step = "1";
        r.value = String(typeof pos === "number" ? pos : s.state === "open" ? 100 : 0);
        r.setAttribute("aria-label", t("cover.position"));
        r.title = t("cover.position");
        r.style.cssText = "border:0;padding:0;accent-color:var(--vh-accent)";
        r.onchange = () => run("cover", "set_cover_position", { position: Number(r.value) }, null);
        rows.push(r);
      }
    } else if (dom === "lock") {
      // a gate on a lock: as a door's lock, the code first when it needs one
      const acts = lockActions(s, lockKind(s, null));
      if (acts.length && needsCode(s)) {
        code = document.createElement("input");
        code.type = "password";
        code.inputMode = "numeric";
        code.autocomplete = "off";
        code.placeholder = t("lock.code");
        code.setAttribute("aria-label", t("lock.code"));
        rows.push(code);
      }
      for (const act of acts) {
        row(act === "open" ? t("cover.open") : t(`lock.do.${act}`), () => {
          const given = code?.value.trim() ?? "";
          if (code && !given) return code.focus();
          run("lock", act, given ? { code: given } : {}, t(`lock.doing.${act}`, { name }));
        });
      }
    } else if (dom === "switch" || dom === "input_boolean") {
      row(t("cover.open"), () => run(dom, "turn_on", {}, t("cover.doing.open", { name })));
      row(t("cover.close"), () => run(dom, "turn_off", {}, t("cover.doing.close", { name })));
    }
  }
  row(t("lock.details"), () => {
    host.done();
    host.dialog(id);
  });
  return rows;
}
