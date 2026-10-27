// Solar, battery and grid on the view: a chip with what the panels make now, and a sheet with the
// power flowing between solar, battery, grid, the house and the car, and today's totals.
import { mdiBatteryCharging, mdiBatteryHigh, mdiBatteryLow, mdiBatteryMedium, mdiCarElectric, mdiClose, mdiHomeLightningBoltOutline, mdiSolarPower, mdiTransmissionTower } from "@mdi/js";
import { formatEnergy, formatPower, formatPrice, formatRate, type EnergyLive, type EnergyNow, type Flows } from "../live/energy";
import { evStateText, modeName, type EvNow } from "../live/ev";
import { esc, t, th } from "../i18n";

const svg = (path: string, size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="fill:currentColor"><path d="${path}"/></svg>`;

/** Colours of the ends (lines take their source's colour). */
const COL = { solar: "#f2a33a", grid: "#8f9db3", home: "#56c7ff", battery: "#2bb673", car: "#a98bff" };

/** Below this (kW) a flow is nothing. */
const IDLE = 0.01;

function batteryIcon(n: EnergyNow): string {
  if ((n.battery ?? 0) < -IDLE) return mdiBatteryCharging;
  const l = n.batteryLevel ?? 100;
  return l >= 60 ? mdiBatteryHigh : l >= 25 ? mdiBatteryMedium : mdiBatteryLow;
}

/** A car that is plugged in (the first, when there are several). */
const pluggedCar = (n: EnergyNow) => n.ev.find((c) => c.state !== "unplugged" && c.state !== "unknown");

/** The chip in the corner: the panels' output (or the house's use after dark), the battery, and a car plugged in. */
export function energyChip(n: EnergyNow | null): string {
  if (!n) return "";
  const parts: string[] = [];
  if (n.solar !== null && n.solar > IDLE) parts.push(`<span class="sun">${svg(mdiSolarPower)}</span><span>${formatPower(n.solar)}</span>`);
  else if (n.home !== null) parts.push(`<span class="home">${svg(mdiHomeLightningBoltOutline)}</span><span>${formatPower(n.home)}</span>`);
  if (n.batteryLevel !== null) parts.push(`<span class="bat">${svg(batteryIcon(n))}</span><span>${Math.round(n.batteryLevel)}%</span>`);
  const car = pluggedCar(n);
  if (car && (car.level !== null || car.power !== null)) {
    parts.push(`<span class="car${car.state === "charging" ? " on" : ""}">${svg(mdiCarElectric)}</span><span>${car.level !== null ? `${Math.round(car.level)}%` : formatPower(car.power)}</span>`);
  }
  if (!parts.length) return "";
  return `<button class="vh-chip vh-energy" data-status="energy" title="${th("energy.title")}">${parts.join("")}</button>`;
}

// ------------------------------------------------------------------ the flow diagram

type End = "solar" | "grid" | "home" | "battery" | "car";
type Layout = Record<End, readonly [number, number]>;
/** Solar above, battery below, the grid and the house to the sides; with a car the diamond moves left for it. */
const PLAIN: Layout = { solar: [170, 46], grid: [50, 126], home: [290, 126], battery: [170, 206], car: [0, 0] };
const WITH_CAR: Layout = { solar: [150, 46], grid: [40, 126], home: [240, 126], battery: [150, 206], car: [306, 206] };
const R = 30;

/** Each flow from its source to where it goes; curves bend at the grid's or the house's side. */
const LINES: { key: keyof Flows; from: End; to: End; curve: boolean }[] = [
  { key: "solarToHome", from: "solar", to: "home", curve: true },
  { key: "solarToGrid", from: "solar", to: "grid", curve: true },
  { key: "solarToBattery", from: "solar", to: "battery", curve: false },
  { key: "gridToHome", from: "grid", to: "home", curve: false },
  { key: "batteryToHome", from: "battery", to: "home", curve: true },
  { key: "gridToBattery", from: "grid", to: "battery", curve: true },
  { key: "batteryToGrid", from: "battery", to: "grid", curve: true },
];

function linePath(L: Layout, from: End, to: End, curve: boolean): string {
  const a = L[from], b = L[to];
  if (!curve) return `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
  const side = from === "grid" || from === "home" ? a : b, mid = side === a ? b : a;
  return `M${a[0]} ${a[1]} Q${side[0]} ${mid[1]} ${b[0]} ${b[1]}`;
}

/** The house to the car: out to the right, then down. */
const carPath = (L: Layout) => `M${L.home[0]} ${L.home[1]} Q${L.car[0]} ${L.home[1]} ${L.car[0]} ${L.car[1]}`;

/** What the cars draw now (kW), or null without a reading. */
function carPower(n: EnergyNow): number | null {
  const v = n.ev.map((c) => c.power).filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + Math.max(0, b), 0) : null;
}

/** Seconds a dot takes along a line: quicker the more flows. */
const pace = (v: number) => Math.max(0.9, Math.min(6, 2.6 / Math.sqrt(Math.max(v, 0.02))));

function flowSvg(n: EnergyNow, motion: boolean): string {
  const hasCar = n.ev.length > 0;
  const L = hasCar ? WITH_CAR : PLAIN;
  const line = (d: string, v: number, colour: string) => {
    const on = v > IDLE;
    const c = on ? colour : "var(--vh-line)";
    const dot = on && motion
      ? `<circle r="3.6" fill="${c}"><animateMotion dur="${pace(v).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`
      : "";
    return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${on ? 2.4 : 1.5}" stroke-linecap="round" opacity="${on ? 0.9 : 0.6}"/>${dot}`;
  };
  // a reversed twin (battery to grid on the grid-battery line) draws nothing while idle
  const lines = LINES.filter((l) => n.flows[l.key] > IDLE || l.key !== "batteryToGrid")
    .map((l) => line(linePath(L, l.from, l.to, l.curve), n.flows[l.key], COL[l.from])).join("") +
    (hasCar ? line(carPath(L), carPower(n) ?? 0, COL.home) : "");
  const node = (end: End, icon: string, value: string, active: boolean) => {
    const [x, y] = L[end];
    return `<g class="n" data-end="${end}">
      <circle cx="${x}" cy="${y}" r="${R}" fill="var(--vh-node)" stroke="${COL[end]}" stroke-width="${active ? 2.6 : 1.6}" opacity="${active ? 1 : 0.75}"/>
      <path d="${icon}" fill="${COL[end]}" transform="translate(${x - 9} ${y - 20}) scale(0.75)"/>
      <text x="${x}" y="${y + 14}" text-anchor="middle" class="v" data-v="${end}">${value}</text></g>`;
  };
  const hasBattery = n.battery !== null || n.batteryLevel !== null;
  const hasSolar = n.solar !== null;
  const hasGrid = n.grid !== null;
  return `<svg class="vh-flow" viewBox="0 0 340 258" role="img" aria-label="${th("energy.flow")}">
    ${lines}
    ${hasSolar ? node("solar", mdiSolarPower, formatPower(n.solar), (n.solar ?? 0) > IDLE) : ""}
    ${hasGrid ? node("grid", mdiTransmissionTower, formatPower(n.grid === null ? null : Math.abs(n.grid)), Math.abs(n.grid ?? 0) > IDLE) : ""}
    ${node("home", mdiHomeLightningBoltOutline, formatPower(n.home), true)}
    ${hasBattery ? node("battery", batteryIcon(n), formatPower(n.battery === null ? null : Math.abs(n.battery)), Math.abs(n.battery ?? 0) > IDLE) : ""}
    ${hasCar ? node("car", mdiCarElectric, formatPower(carPower(n)), (carPower(n) ?? 0) > IDLE) : ""}
    ${hasSolar ? `<text x="${L.solar[0]}" y="${L.solar[1] - R - 7}" text-anchor="middle" class="cap">${th("energy.solar")}</text>` : ""}
    ${hasGrid ? `<text x="${L.grid[0]}" y="${L.grid[1] + R + 15}" text-anchor="middle" class="cap" data-cap="grid">${esc(gridCaption(n))}</text>` : ""}
    <text x="${L.home[0]}" y="${L.home[1] + R + 15}" text-anchor="middle" class="cap">${th("energy.house")}</text>
    ${hasBattery ? `<text x="${L.battery[0]}" y="${L.battery[1] + R + 15}" text-anchor="middle" class="cap" data-cap="battery">${esc(batteryCaption(n))}</text>` : ""}
    ${hasCar ? `<text x="${L.car[0]}" y="${L.car[1] + R + 15}" text-anchor="middle" class="cap" data-cap="car">${esc(carCaption(n))}</text>` : ""}
  </svg>`;
}

function carCaption(n: EnergyNow): string {
  if (n.ev.length > 1) return t("energy.cars");
  const l = n.ev[0]?.level;
  return l !== null && l !== undefined ? t("energy.carLevel", { level: Math.round(l) }) : t("energy.car");
}

function gridCaption(n: EnergyNow): string {
  const g = n.grid ?? 0;
  return t(g > IDLE ? "energy.buying" : g < -IDLE ? "energy.selling" : "energy.grid");
}

function batteryCaption(n: EnergyNow): string {
  const b = n.battery ?? 0;
  const lvl = n.batteryLevel !== null ? `${Math.round(n.batteryLevel)}%` : "";
  const what = b > IDLE ? t("energy.battery.using") : b < -IDLE ? t("energy.battery.charging") : "";
  return [t("energy.battery"), lvl, what].filter(Boolean).join(" · ");
}

/** The line under the title: prices now, and what buying or selling costs or earns an hour. */
function priceLine(n: EnergyNow): string {
  const g = n.grid ?? 0;
  const parts: string[] = [];
  if (g > IDLE) {
    const r = formatRate(g, n.priceImport);
    if (r) parts.push(t("energy.price.buying", { price: formatPrice(n.priceImport), rate: r }));
  } else if (g < -IDLE) {
    const r = formatRate(-g, n.priceExport);
    if (r) parts.push(t("energy.price.selling", { price: formatPrice(n.priceExport), rate: r }));
  }
  if (!parts.length && n.priceImport) {
    const price = formatPrice(n.priceImport);
    parts.push(n.priceExport ? t("energy.price.toBuySell", { price, sell: formatPrice(n.priceExport) }) : t("energy.price.toBuy", { price }));
  }
  if (n.homeComputed) parts.push(t("energy.houseComputed"));
  return parts.join(" · ");
}

/** What decides whether the diagram is redrawn (redrawing restarts the moving dots). */
function shapeKey(n: EnergyNow, motion: boolean): string {
  return [
    motion, n.solar !== null, n.grid !== null, n.battery !== null || n.batteryLevel !== null,
    ...LINES.map((l) => (n.flows[l.key] > IDLE ? pace(n.flows[l.key]).toFixed(1) : "-")),
    (n.solar ?? 0) > IDLE, Math.abs(n.grid ?? 0) > IDLE, Math.abs(n.battery ?? 0) > IDLE,
    n.ev.length, (carPower(n) ?? 0) > IDLE ? pace(carPower(n)!).toFixed(1) : "-",
  ].join("|");
}

/** What a tap on a car's card does. */
export interface EvActions {
  setMode(charger: number, option: string): void;
  approve(charger: number): void;
  open(charger: number): void;
}

/** Each car: what it is doing, its battery with the level it charges to, and its charge modes. */
function evCards(ev: EvNow[]): string {
  return ev.map((c, i) => {
    const status = [evStateText(c.state), c.state === "charging" && c.power !== null ? formatPower(c.power) : ""].filter(Boolean).join(" · ");
    const level = c.level !== null ? Math.max(0, Math.min(100, c.level)) : null;
    const goal = c.target !== null ? (c.by ? t("energy.ev.toBy", { level: Math.round(c.target), time: c.by }) : t("energy.ev.to", { level: Math.round(c.target) }))
      : c.by ? t("energy.ev.readyBy", { time: c.by }) : "";
    const meta = [level !== null ? `${Math.round(level)}%` : "", goal, c.slots ? t("energy.ev.slots", { slots: c.slots }) : ""].filter(Boolean).join(" · ");
    const bar = level !== null
      ? `<div class="bar"><i style="width:${level.toFixed(1)}%"></i>${c.target !== null ? `<u style="left:${Math.max(0, Math.min(100, c.target)).toFixed(1)}%"></u>` : ""}</div>`
      : "";
    const modes = c.modes.map((o) => `<button class="vh-chip${o === c.mode ? " on" : ""}" data-mode="${esc(o)}">${esc(modeName(o))}</button>`).join("");
    const approve = c.canApprove ? `<button class="vh-chip vh-approve" data-approve="1">${th("energy.ev.approve")}</button>` : "";
    return `<div class="vh-ev ${c.state}" data-i="${i}">
      <div class="top"><span class="ic">${svg(mdiCarElectric, 18)}</span><b>${esc(c.name)}</b><span class="st">${esc(status)}</span></div>
      ${bar}${meta ? `<div class="meta">${esc(meta)}</div>` : ""}${modes || approve ? `<div class="modes">${modes}${approve}</div>` : ""}
    </div>`;
  }).join("");
}

export interface EnergySection {
  /** Draws (or updates) its part of the sheet; called on every change while the sheet is open. */
  render(el: HTMLElement, now: EnergyNow): void;
}

/**
 * The energy sheet. Builds its frame once, then updates in place: the numbers on every change,
 * the diagram only when a flow starts, stops or changes pace.
 */
export function renderEnergySheet(sheet: HTMLElement, energy: EnergyLive, sections: EnergySection[], close: () => void, actions: EvActions): void {
  const n = energy.now;
  if (!n) return;
  const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sheet.dataset.key !== "energy") {
    sheet.dataset.key = "energy";
    sheet.innerHTML = `
      <h3><span class="t">${th("energy.title")}</span><button class="vh-icon vh-close" style="width:32px;height:32px" title="${th("view.close")}">${svg(mdiClose, 22)}</button></h3>
      <div class="sub"></div>
      <div class="vh-flow-box"></div>
      <div class="vh-ev-box"></div>
      <div class="vh-today"></div>
      <div class="vh-en-ext"></div>`;
    sheet.querySelector<HTMLButtonElement>(".vh-close")!.onclick = close;
  }
  // extensions may add their sections after the sheet was built
  const ext = sheet.querySelector<HTMLElement>(".vh-en-ext")!;
  while (ext.children.length < sections.length) ext.append(document.createElement("div"));
  while (ext.children.length > sections.length) ext.lastElementChild!.remove();
  sheet.querySelector(".sub")!.textContent = priceLine(n) || " ";
  const box = sheet.querySelector<HTMLElement>(".vh-flow-box")!;
  const key = shapeKey(n, motion);
  if (box.dataset.key !== key) {
    box.dataset.key = key;
    box.innerHTML = flowSvg(n, motion);
  } else {
    const set = (sel: string, text: string) => {
      const el = box.querySelector(sel);
      if (el) el.textContent = text;
    };
    set('[data-v="solar"]', formatPower(n.solar));
    set('[data-v="grid"]', formatPower(n.grid === null ? null : Math.abs(n.grid)));
    set('[data-v="home"]', formatPower(n.home));
    set('[data-v="battery"]', formatPower(n.battery === null ? null : Math.abs(n.battery)));
    set('[data-cap="grid"]', gridCaption(n));
    set('[data-cap="battery"]', batteryCaption(n));
    set('[data-v="car"]', formatPower(carPower(n)));
    set('[data-cap="car"]', carCaption(n));
  }
  const evBox = sheet.querySelector<HTMLElement>(".vh-ev-box")!;
  const cards = evCards(n.ev);
  if (evBox.dataset.html !== cards) {
    evBox.dataset.html = cards;
    evBox.innerHTML = cards;
  }
  evBox.onclick = (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest<HTMLElement>("[data-i]");
    if (!card) return;
    const i = Number(card.dataset.i);
    const mode = target.closest<HTMLElement>("[data-mode]")?.dataset.mode;
    if (mode !== undefined) actions.setMode(i, mode);
    else if (target.closest("[data-approve]")) actions.approve(i);
    else if (target.closest(".top")) actions.open(i);
  };
  renderToday(sheet.querySelector(".vh-today")!, energy);
  sections.forEach((s, i) => {
    try {
      s.render(ext.children[i] as HTMLElement, n);
    } catch (err) {
      console.error("VirtuHome energy section failed", err);
    }
  });
}

function renderToday(el: HTMLElement, energy: EnergyLive): void {
  const today = energy.today;
  if (!today || [today.solar, today.home, today.gridIn, today.gridOut, today.car].every((x) => x === null)) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  const self = today.home && today.gridIn !== null ? Math.max(0, Math.min(1, 1 - today.gridIn / today.home)) : null;
  const cells: [string, string][] = [];
  if (today.solar !== null) cells.push([th("energy.solar"), formatEnergy(today.solar)]);
  if (today.home !== null) cells.push([th("energy.house"), formatEnergy(today.home)]);
  if (today.car !== null) cells.push([th("energy.car"), formatEnergy(today.car)]);
  if (today.gridIn !== null) cells.push([th("energy.today.bought"), formatEnergy(today.gridIn)]);
  if (today.gridOut !== null) cells.push([th("energy.today.sold"), formatEnergy(today.gridOut)]);
  if (self !== null) cells.push([th("energy.today.own"), `${Math.round(self * 100)}%`]);
  const html = `<div class="h">${th("energy.today")}</div><div class="cells">${cells.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join("")}</div>`;
  if (el.innerHTML !== html) el.innerHTML = html;
}

export const ENERGY_CSS = /* css */ `
.vh-root { --vh-node: #1a2232; }
.vh-root.day { --vh-node: #ffffff; }
.vh-energy { padding: 7px 11px; gap: 4px; font-variant-numeric: tabular-nums; }
.vh-energy .sun { color: ${COL.solar}; display: inline-flex; }
.vh-energy .home { color: ${COL.home}; display: inline-flex; }
.vh-energy .bat { color: ${COL.battery}; display: inline-flex; margin-left: 4px; }
.vh-energy .car { color: var(--vh-dim); display: inline-flex; margin-left: 4px; }
.vh-energy .car.on { color: ${COL.car}; }
.vh-flow-box { display: grid; place-items: center; margin: 2px 0 8px; }
.vh-flow { width: 100%; max-width: 360px; height: auto; overflow: visible; }
.vh-flow text { fill: var(--vh-text); font: 600 12px/1 var(--ha-font-family-body, Roboto, system-ui, sans-serif); font-variant-numeric: tabular-nums; }
.vh-flow text.cap { fill: var(--vh-dim); font-weight: 400; font-size: 11px; }
.vh-ev { background: var(--vh-chip); border-radius: 12px; padding: 9px 11px; margin: 0 0 10px; }
.vh-ev .top { display: flex; align-items: center; gap: 7px; cursor: pointer; }
.vh-ev .ic { color: var(--vh-dim); display: inline-flex; }
.vh-ev.charging .ic { color: ${COL.car}; }
.vh-ev .top b { font-size: 14px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vh-ev .st { margin-left: auto; font-size: 12px; color: var(--vh-dim); white-space: nowrap; font-variant-numeric: tabular-nums; }
.vh-ev.charging .st { color: ${COL.car}; }
.vh-ev.approval .st, .vh-ev.fault .st { color: #f2a33a; }
.vh-ev .bar { position: relative; height: 8px; border-radius: 4px; background: var(--vh-line); margin: 9px 0 5px; }
.vh-ev .bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: ${COL.car}; opacity: 0.85; }
.vh-ev .bar u { position: absolute; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; background: var(--vh-text); border-radius: 1px; }
.vh-ev .meta { font-size: 12px; color: var(--vh-dim); font-variant-numeric: tabular-nums; }
.vh-ev .modes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.vh-ev .modes .vh-chip { padding: 5px 10px; font-size: 12px; }
.vh-ev .vh-approve { margin-left: auto; background: var(--vh-chip-on); }
.vh-today .h { font-size: 12px; color: var(--vh-dim); margin: 0 0 6px; }
.vh-today .cells { display: grid; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); gap: 6px; }
.vh-today .cells > div { background: var(--vh-chip); border-radius: 12px; padding: 7px 10px; }
.vh-today small { display: block; font-size: 11px; color: var(--vh-dim); }
.vh-today b { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.vh-en-ext > div:not(:empty) { margin-top: 12px; }
`;
