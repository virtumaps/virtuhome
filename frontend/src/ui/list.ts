// The List: the house as floors, rooms and the devices in them, each with what it shows now, for
// screen readers and anyone who would rather read than look. Fetched the first time it opens. It
// imports nothing: the view hands it what it needs, so the code the view loads up front isn't
// split into more pieces to share with it.
import type { Plan } from "../model/plan";

export interface ListRoom {
  floor: number;
  /** Index into the floor's spaces (rooms, then garden areas). */
  room: number;
  name: string;
  entities: string[];
}

export interface ListFloor {
  name: string;
  rooms: ListRoom[];
}

/** What the List needs of its view. */
export interface ListHost {
  sheet: HTMLElement;
  plan: Plan;
  /** The sheet's heading (title, help and close button) and the line under it, as HTML. */
  head: string;
  /** Where an entity is: its floor and room (-1: only the floor is known). */
  place(entity: string): { floor: number; room: number } | null;
  /** The devices of an area, as a room's sheet shows them. */
  area(area: string | null): string[];
  /** What a room's label says now. */
  line(floor: number, room: number): string;
  name(entity: string): string;
  /** An entity's state in words. */
  value(entity: string): string;
  /** Redraws `box`, keeping the focus where it was. */
  keep(box: HTMLElement, redraw: () => void): void;
  close(): void;
  /** Opens a room, as a tap on its label does. */
  room(floor: number, room: number): void;
  /** Switches a device, as a tap on it does (or opens its dialog). */
  tap(entity: string): void;
}

/**
 * Each floor with its rooms and garden areas (in the order of the plan's spaces) and their devices:
 * those placed in them in the plan first, then the rest of their area's. Floors without any are left out.
 */
export function houseList(plan: Plan, place: ListHost["place"], area: ListHost["area"]): ListFloor[] {
  const placed = new Map<string, string[]>();
  for (const f of plan.floors) {
    for (const d of f.devices) {
      const p = place(d.entity);
      if (p && p.room >= 0) placed.set(`${p.floor}/${p.room}`, [...(placed.get(`${p.floor}/${p.room}`) ?? []), d.entity]);
    }
  }
  return plan.floors
    .map((f, fi) => ({
      name: f.name,
      rooms: [...f.rooms, ...(f.outdoor ?? [])].map((s, ri) => ({
        floor: fi, room: ri, name: s.name, entities: [...new Set([...(placed.get(`${fi}/${ri}`) ?? []), ...area(s.area_id)])],
      })),
    }))
    .filter((f) => f.rooms.length);
}

const CSS = /* css */ `
.vh-list h4 { margin: 12px 0 6px; font-size: 13px; font-weight: 600; color: var(--vh-dim); }
.vh-list ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.vh-list ul ul { margin: 4px 0 6px 16px; }
.vh-list b { font-weight: 600; }
`;

/**
 * Draws the List into the sheet. Its rows are drawn again only when the house's rooms or devices
 * change; their states are written into them in place.
 */
export function showList(host: ListHost): void {
  const { sheet } = host;
  const floors = houseList(host.plan, host.place, host.area);
  const key = `list|${JSON.stringify(floors)}`;
  if (sheet.dataset.key !== key) host.keep(sheet, () => {
    sheet.dataset.key = key;
    sheet.innerHTML = `<style>${CSS}</style>${host.head}<div class="vh-list"></div>`;
    sheet.querySelector<HTMLButtonElement>(".vh-close")!.onclick = host.close;
    const row = (k: string, name: string, tag: "b" | "span") => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.className = "vh-row";
      b.dataset.k = k;
      // the space is for screen readers ("Kitchen, 21°"): the row's gap does it on screen
      b.innerHTML = `<${tag}></${tag}> <span class="state"></span>`;
      b.firstChild!.textContent = name;
      li.append(b);
      return li;
    };
    const list = sheet.querySelector<HTMLElement>(".vh-list")!;
    for (const f of floors) {
      const head = document.createElement("h4");
      head.textContent = f.name;
      const rooms = document.createElement("ul");
      for (const r of f.rooms) {
        const li = row(`r:${r.floor}/${r.room}`, r.name, "b");
        if (r.entities.length) {
          const devices = document.createElement("ul");
          for (const id of r.entities) devices.append(row(`e:${id}`, host.name(id), "span"));
          li.append(devices);
        }
        rooms.append(li);
      }
      list.append(head, rooms);
    }
    list.onclick = (e) => {
      const k = (e.target as HTMLElement).closest<HTMLElement>("[data-k]")?.dataset.k;
      if (!k) return;
      if (k[0] === "e") return host.tap(k.slice(2));
      const [fi, ri] = k.slice(2).split("/").map(Number);
      host.room(fi, ri);
    };
  });
  sheet.querySelectorAll<HTMLElement>(".vh-list [data-k]").forEach((b) => {
    const k = b.dataset.k!.slice(2);
    const at = k.split("/").map(Number);
    const text = b.dataset.k![0] === "e" ? host.value(k) : host.line(at[0], at[1]);
    const state = b.lastElementChild!;
    if (state.textContent !== text) state.textContent = text;
  });
}
