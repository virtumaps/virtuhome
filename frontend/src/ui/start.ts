// The first run's choices, over the demo house: fetched only for a home that has no rooms yet, so a wall
// tablet showing a finished home never loads it.
import { mdiChevronRight, mdiCubeScan, mdiFloorPlan, mdiHomeGroup, mdiPencilRuler, mdiPlayCircleOutline } from "@mdi/js";
import { t, th } from "../i18n";
import { START_CHOICES, type StartKind } from "./setup";

const svg = (path: string) => `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`;
const ICONS: Record<StartKind, string> = { trace: mdiFloorPlan, starter: mdiHomeGroup, scan: mdiCubeScan, draw: mdiPencilRuler };

/**
 * The choices: a heading, a button for each way to get a home in (the quickest one says so), and, with
 * `demo`, a button that opens the demo home (the house turning behind them).
 */
export function startBox(pick: (kind: StartKind) => void, demo: (() => void) | null): HTMLElement {
  const box = document.createElement("div");
  box.className = "vh-start";
  box.innerHTML = `<h2>${th("start.title")}</h2><p>${th("start.text")}</p>`;
  const row = (cls: string, icon: string, title: string, text: string, tail = "") => {
    const b = document.createElement("button");
    b.className = cls;
    b.innerHTML = `${svg(icon)}<span class="w"><span class="h"><b></b></span><span class="d"></span></span>${tail}`;
    b.querySelector("b")!.textContent = title;
    b.querySelector(".d")!.textContent = text;
    return b;
  };
  for (const kind of START_CHOICES) {
    const b = row("vh-start-choice", ICONS[kind], t(`start.${kind}.title`), t(`start.${kind}.text`), svg(mdiChevronRight));
    if (kind === "starter") {
      const tag = document.createElement("i");
      tag.textContent = t("start.quickest");
      b.querySelector(".h")!.append(tag);
    }
    b.onclick = () => pick(kind);
    box.append(b);
  }
  if (demo) {
    const b = row("vh-start-demo", mdiPlayCircleOutline, t("start.demo.title"), t("start.demo.text"));
    b.onclick = demo;
    box.append(b);
  }
  return box;
}

export const START_CSS = /* css */ `
/* the first run: the demo house in the evening behind the choices, which stand on a dark sheet whatever the theme */
.vh-root.vh-new .vh-status { display: none; }
/* Edit stays in reach over the choices */
.vh-root.vh-new .vh-bar { z-index: 3; }
.vh-empty.vh-welcome { display: block; padding: 0; text-align: left; background: #0c1220; color: #eef3fb; overflow: hidden; }
.vh-hero { position: absolute; inset: 0; opacity: 0; transition: opacity 0.9s ease; pointer-events: none; }
.vh-hero.on { opacity: 1; }
.vh-start {
  pointer-events: auto; position: absolute; left: 0; right: 0; bottom: 0; max-height: 64%; overflow: auto; box-sizing: border-box;
  display: flex; flex-direction: column; gap: 8px; align-items: stretch; padding: 18px 16px 16px;
  background: rgba(12, 18, 32, 0.9); border-radius: 22px 22px 0 0; box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.35);
  --vh-text: #eef3fb; --vh-dim: #a9b8ce; --vh-accent: #56c7ff; color: var(--vh-text);
}
.vh-empty.wide .vh-start {
  left: clamp(20px, 5%, 64px); right: auto; top: 50%; bottom: auto; transform: translateY(-50%); width: 400px; max-height: calc(100% - 32px);
  padding: 20px; border-radius: 22px; background: rgba(12, 18, 32, 0.8); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.vh-root.solid .vh-empty.wide .vh-start { background: #0f1626; backdrop-filter: none; -webkit-backdrop-filter: none; }
.vh-empty .vh-start h2 { margin: 0; font-size: 22px; letter-spacing: -0.01em; }
.vh-empty .vh-start p { margin: 0 0 4px; max-width: none; color: var(--vh-dim); font-size: 14px; line-height: 1.4; }
.vh-start-choice, .vh-start-demo {
  border: 0; border-radius: 14px; padding: 9px 10px 9px 12px; font: inherit; text-align: left; cursor: pointer; color: var(--vh-text);
  display: flex; align-items: center; gap: 12px; flex: none;
}
.vh-start-choice { background: rgba(255, 255, 255, 0.07); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1); transition: background 0.15s, box-shadow 0.15s; }
.vh-start svg { flex: none; width: 20px; height: 20px; fill: var(--vh-dim); }
.vh-start-choice > svg:first-child, .vh-start-demo > svg:first-child {
  width: 22px; height: 22px; padding: 9px; border-radius: 11px; fill: var(--vh-accent); background: rgba(86, 199, 255, 0.14);
}
.vh-start .w { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.vh-start .h { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; }
.vh-start .h b { font-size: 15px; font-weight: 600; }
.vh-start .h i { font-style: normal; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 999px; color: #0c1220; background: var(--vh-accent); }
.vh-start .d { color: var(--vh-dim); font-size: 13px; line-height: 1.35; }
.vh-start-choice:hover, .vh-start-choice:focus-visible { background: rgba(86, 199, 255, 0.16); box-shadow: inset 0 0 0 1.5px var(--vh-accent); outline: none; }
.vh-start-choice:hover > svg:last-child, .vh-start-choice:focus-visible > svg:last-child { fill: var(--vh-accent); }
.vh-start-demo { background: none; margin-top: 2px; border-top: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0 0 14px 14px; padding-top: 13px; }
.vh-start-demo > svg:first-child { background: none; padding: 9px; }
.vh-start-demo .h b { color: var(--vh-accent); }
.vh-start-demo:hover .h b, .vh-start-demo:focus-visible .h b { text-decoration: underline; }
.vh-start-demo:focus-visible { outline: 2px solid var(--vh-accent); outline-offset: -2px; }
/* a phone: the house keeps the top of the screen */
.vh-empty.vh-welcome:not(.wide) .vh-hero { bottom: 52%; }
`;
