// Start from a house type: the picker in the editor's Home tab. The house types load on demand (their
// own chunk); each shows a little plan of its storeys, and is fitted to the home's size before use.
import { mdiClose } from "@mdi/js";
import { bounds } from "../model/geom";
import type { Plan } from "../model/plan";
import type { Starter } from "../starters/houses";

type Houses = typeof import("../starters/houses");
let houses: Promise<Houses> | null = null;
const load = (): Promise<Houses> => (houses ??= import("../starters/houses"));

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, ...children: (Node | string | null)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  for (const c of children) if (c !== null) e.append(c);
  return e;
}

/** The storeys side by side, their rooms outlined (built-in plans only: no Home Assistant names here). */
function thumbnail(plan: Plan): string {
  const floors = plan.floors.filter((f) => f.rooms.length);
  const b = bounds(floors.flatMap((f) => f.rooms.flatMap((r) => r.points)));
  const w = b.maxX - b.minX, d = b.maxZ - b.minZ, gap = 1.2, pad = 0.4;
  const rooms = floors.map((f, i) => f.rooms.map((r) =>
    `<polygon points="${r.points.map(([x, z]) => `${(x - b.minX + i * (w + gap)).toFixed(2)},${(z - b.minZ).toFixed(2)}`).join(" ")}"/>`).join("")).join("");
  const vw = floors.length * w + (floors.length - 1) * gap;
  return `<svg viewBox="${-pad} ${-pad} ${(vw + 2 * pad).toFixed(2)} ${(d + 2 * pad).toFixed(2)}" aria-hidden="true">${rooms}</svg>`;
}

export class HouseTypes {
  readonly el = el("div", "ed-houses");
  private size = { width: 0, depth: 0, mirror: false };

  constructor(private host: { use(plan: Plan, name: string): void; close(): void; reveal(el: HTMLElement): void }) {
    const close = el("button", "ed-ib small");
    close.title = "Close";
    close.innerHTML = `<svg viewBox="0 0 24 24"><path d="${mdiClose}"/></svg>`;
    close.onclick = () => host.close();
    this.el.append(el("div", "ed-houses-head", el("h4", "", "Start from a house type"), close), el("p", "ed-hint", "Loading…"));
    load().then((m) => this.list(m), () => this.el.lastElementChild!.replaceWith(el("p", "ed-hint", "The house types could not be loaded.")));
  }

  private list(m: Houses): void {
    const grid = el("div", "ed-houses-grid");
    const fit = el("div", "ed-houses-fit");
    for (const s of m.STARTERS) {
      const card = el("button", "ed-house", el("span", ""), el("b", "", s.name), el("small", "", s.text));
      card.querySelector("span")!.innerHTML = thumbnail(s.plan());
      card.onclick = () => {
        grid.querySelectorAll(".ed-house").forEach((c) => c.classList.toggle("on", c === card));
        this.pick(m, s, fit);
        this.host.reveal(fit);
      };
      grid.append(card);
    }
    this.el.lastElementChild!.replaceWith(el("p", "ed-hint", "Pick the one most like your home. The walls can be dragged to fit afterwards."), grid, fit);
  }

  private pick(m: Houses, s: Starter, box: HTMLElement): void {
    const own = m.fitRange(s.plan())!;
    const up = (v: number) => Math.ceil(v * 10) / 10;
    const range = {
      minWidth: up(Math.max(own.minWidth, own.width * 0.7)), maxWidth: up(own.width * 1.6),
      minDepth: up(Math.max(own.minDepth, own.depth * 0.7)), maxDepth: up(own.depth * 1.6),
    };
    this.size = { width: own.width, depth: own.depth, mirror: false };
    const num = (key: "width" | "depth", label: string) => {
      const input = el("input", "ed-in num");
      const [lo, hi] = key === "width" ? [range.minWidth, range.maxWidth] : [range.minDepth, range.maxDepth];
      Object.assign(input, { type: "number", step: "0.1", min: String(lo), max: String(hi), value: String(own[key]), title: `${lo}–${hi} m` });
      input.inputMode = "decimal";
      input.onchange = () => {
        const v = Number(input.value);
        this.size[key] = isFinite(v) && v > 0 ? Math.min(hi, Math.max(lo, v)) : own[key];
        input.value = String(Math.round(this.size[key] * 100) / 100);
      };
      return el("label", "ed-houses-num", label, input, "m");
    };
    const thumb = () => this.el.querySelector<HTMLElement>(".ed-house.on span");
    let side: HTMLElement;
    if (s.joins === "side") {
      // a semi: which side it joins next door on is the mirror choice (drawn joined on the right)
      const chip = (label: string, mirror: boolean) => {
        const c = el("button", `ed-chip${mirror === this.size.mirror ? " on" : ""}`, label);
        c.onclick = () => {
          this.size.mirror = mirror;
          side.querySelectorAll(".ed-chip").forEach((x) => x.classList.toggle("on", x === c));
          thumb()?.classList.toggle("flip", mirror);
        };
        return c;
      };
      side = el("div", "ed-row", el("span", "ed-hint", "Joins next door on the"), chip("Left", true), chip("Right", false));
    } else {
      const box2 = el("input", "");
      box2.type = "checkbox";
      box2.onchange = () => {
        this.size.mirror = box2.checked;
        thumb()?.classList.toggle("flip", box2.checked);
      };
      side = el("label", "ed-check", box2, "Mirror left to right");
    }
    thumb()?.classList.remove("flip");
    const use = el("button", "ed-btn", "Use this house type");
    use.onclick = () => {
      const { width, depth, mirror } = this.size;
      this.host.use(m.starterPlan(s.id, { width, depth, mirror }), s.name);
    };
    box.replaceChildren(
      el("h4", "", "Fit to my home"),
      el("p", "ed-hint", "Your home's outside width and depth, as an estate agent's listing gives them. Doors, windows and stairs keep their size."),
      el("div", "ed-row", num("width", "Width"), num("depth", "Depth")),
      side,
      el("div", "ed-row", use),
    );
  }
}
