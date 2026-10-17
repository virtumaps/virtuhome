// Solar, battery and grid on the view: a chip with what the panels make now, and a sheet with the
// power flowing between solar, battery, grid and the house, and today's totals.
import { mdiBatteryCharging, mdiBatteryHigh, mdiBatteryLow, mdiBatteryMedium, mdiClose, mdiHomeLightningBoltOutline, mdiSolarPower, mdiTransmissionTower } from "@mdi/js";
import { formatEnergy, formatPower, formatPrice, formatRate, type EnergyLive, type EnergyNow, type Flows } from "../live/energy";

const svg = (path: string, size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="fill:currentColor"><path d="${path}"/></svg>`;

/** Colours of the four ends (lines take their source's colour). */
const COL = { solar: "#f2a33a", grid: "#8f9db3", home: "#56c7ff", battery: "#2bb673" };

/** Below this (kW) a flow is nothing. */
const IDLE = 0.01;

function batteryIcon(n: EnergyNow): string {
  if ((n.battery ?? 0) < -IDLE) return mdiBatteryCharging;
  const l = n.batteryLevel ?? 100;
  return l >= 60 ? mdiBatteryHigh : l >= 25 ? mdiBatteryMedium : mdiBatteryLow;
}

/** The chip in the corner: the panels' output (or the house's use after dark) and the battery. */
export function energyChip(n: EnergyNow | null): string {
  if (!n) return "";
  const parts: string[] = [];
  if (n.solar !== null && n.solar > IDLE) parts.push(`<span class="sun">${svg(mdiSolarPower)}</span><span>${formatPower(n.solar)}</span>`);
  else if (n.home !== null) parts.push(`<span class="home">${svg(mdiHomeLightningBoltOutline)}</span><span>${formatPower(n.home)}</span>`);
  if (n.batteryLevel !== null) parts.push(`<span class="bat">${svg(batteryIcon(n))}</span><span>${Math.round(n.batteryLevel)}%</span>`);
  if (!parts.length) return "";
  return `<button class="vh-chip vh-energy" data-status="energy" title="Energy">${parts.join("")}</button>`;
}

// ------------------------------------------------------------------ the flow diagram

const NODE = { solar: [170, 46], grid: [50, 126], home: [290, 126], battery: [170, 206] } as const;
type End = keyof typeof NODE;
const R = 30;

/** Each flow's path from its source to where it goes. */
const LINES: { key: keyof Flows; from: End; to: End; d: string }[] = [
  { key: "solarToHome", from: "solar", to: "home", d: "M170 46 Q290 46 290 126" },
  { key: "solarToGrid", from: "solar", to: "grid", d: "M170 46 Q50 46 50 126" },
  { key: "solarToBattery", from: "solar", to: "battery", d: "M170 46 L170 206" },
  { key: "gridToHome", from: "grid", to: "home", d: "M50 126 L290 126" },
  { key: "batteryToHome", from: "battery", to: "home", d: "M170 206 Q290 206 290 126" },
  { key: "gridToBattery", from: "grid", to: "battery", d: "M50 126 Q50 206 170 206" },
  { key: "batteryToGrid", from: "battery", to: "grid", d: "M170 206 Q50 206 50 126" },
];

/** Seconds a dot takes along a line: quicker the more flows. */
const pace = (v: number) => Math.max(0.9, Math.min(6, 2.6 / Math.sqrt(Math.max(v, 0.02))));

function flowSvg(n: EnergyNow, motion: boolean): string {
  const lines = LINES.map((l) => {
    const v = n.flows[l.key];
    const on = v > IDLE;
    // a reversed twin (battery to grid on the grid-battery line) draws nothing while idle
    if (!on && l.key === "batteryToGrid") return "";
    const c = on ? COL[l.from] : "var(--vh-line)";
    const dot = on && motion
      ? `<circle r="3.6" fill="${c}"><animateMotion dur="${pace(v).toFixed(2)}s" repeatCount="indefinite" path="${l.d}"/></circle>`
      : "";
    return `<path d="${l.d}" fill="none" stroke="${c}" stroke-width="${on ? 2.4 : 1.5}" stroke-linecap="round" opacity="${on ? 0.9 : 0.6}"/>${dot}`;
  }).join("");
  const node = (end: End, icon: string, value: string, active: boolean) => {
    const [x, y] = NODE[end];
    return `<g class="n" data-end="${end}">
      <circle cx="${x}" cy="${y}" r="${R}" fill="var(--vh-node)" stroke="${COL[end]}" stroke-width="${active ? 2.6 : 1.6}" opacity="${active ? 1 : 0.75}"/>
      <path d="${icon}" fill="${COL[end]}" transform="translate(${x - 9} ${y - 20}) scale(0.75)"/>
      <text x="${x}" y="${y + 14}" text-anchor="middle" class="v" data-v="${end}">${value}</text></g>`;
  };
  const hasBattery = n.battery !== null || n.batteryLevel !== null;
  const hasSolar = n.solar !== null;
  const hasGrid = n.grid !== null;
  return `<svg class="vh-flow" viewBox="0 0 340 258" role="img" aria-label="Energy flow">
    ${lines}
    ${hasSolar ? node("solar", mdiSolarPower, formatPower(n.solar), (n.solar ?? 0) > IDLE) : ""}
    ${hasGrid ? node("grid", mdiTransmissionTower, formatPower(n.grid === null ? null : Math.abs(n.grid)), Math.abs(n.grid ?? 0) > IDLE) : ""}
    ${node("home", mdiHomeLightningBoltOutline, formatPower(n.home), true)}
    ${hasBattery ? node("battery", batteryIcon(n), formatPower(n.battery === null ? null : Math.abs(n.battery)), Math.abs(n.battery ?? 0) > IDLE) : ""}
    ${hasSolar ? `<text x="${NODE.solar[0]}" y="${NODE.solar[1] - R - 7}" text-anchor="middle" class="cap">Solar</text>` : ""}
    ${hasGrid ? `<text x="${NODE.grid[0]}" y="${NODE.grid[1] + R + 15}" text-anchor="middle" class="cap" data-cap="grid">${gridCaption(n)}</text>` : ""}
    <text x="${NODE.home[0]}" y="${NODE.home[1] + R + 15}" text-anchor="middle" class="cap">House</text>
    ${hasBattery ? `<text x="${NODE.battery[0]}" y="${NODE.battery[1] + R + 15}" text-anchor="middle" class="cap" data-cap="battery">${batteryCaption(n)}</text>` : ""}
  </svg>`;
}

function gridCaption(n: EnergyNow): string {
  const g = n.grid ?? 0;
  return g > IDLE ? "Buying" : g < -IDLE ? "Selling" : "Grid";
}

function batteryCaption(n: EnergyNow): string {
  const b = n.battery ?? 0;
  const lvl = n.batteryLevel !== null ? `${Math.round(n.batteryLevel)}%` : "";
  const what = b > IDLE ? "using" : b < -IDLE ? "charging" : "";
  return ["Battery", lvl, what].filter(Boolean).join(" · ");
}

/** The line under the title: prices now, and what buying or selling costs or earns an hour. */
function priceLine(n: EnergyNow): string {
  const g = n.grid ?? 0;
  const parts: string[] = [];
  if (g > IDLE) {
    const r = formatRate(g, n.priceImport);
    if (r) parts.push(`Buying at ${formatPrice(n.priceImport)}/kWh: ${r}`);
  } else if (g < -IDLE) {
    const r = formatRate(-g, n.priceExport);
    if (r) parts.push(`Selling at ${formatPrice(n.priceExport)}/kWh: ${r}`);
  }
  if (!parts.length && n.priceImport) parts.push(`${formatPrice(n.priceImport)}/kWh to buy${n.priceExport ? `, ${formatPrice(n.priceExport)} to sell` : ""}`);
  if (n.homeComputed) parts.push("house worked out from the others");
  return parts.join(" · ");
}

/** What decides whether the diagram is redrawn (redrawing restarts the moving dots). */
function shapeKey(n: EnergyNow, motion: boolean): string {
  return [
    motion, n.solar !== null, n.grid !== null, n.battery !== null || n.batteryLevel !== null,
    ...LINES.map((l) => (n.flows[l.key] > IDLE ? pace(n.flows[l.key]).toFixed(1) : "-")),
    (n.solar ?? 0) > IDLE, Math.abs(n.grid ?? 0) > IDLE, Math.abs(n.battery ?? 0) > IDLE,
  ].join("|");
}

export interface EnergySection {
  /** Draws (or updates) its part of the sheet; called on every change while the sheet is open. */
  render(el: HTMLElement, now: EnergyNow): void;
}

/**
 * The energy sheet. Builds its frame once, then updates in place: the numbers on every change,
 * the diagram only when a flow starts, stops or changes pace.
 */
export function renderEnergySheet(sheet: HTMLElement, energy: EnergyLive, sections: EnergySection[], close: () => void): void {
  const n = energy.now;
  if (!n) return;
  const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sheet.dataset.key !== "energy") {
    sheet.dataset.key = "energy";
    sheet.innerHTML = `
      <h3><span class="t">Energy</span><button class="vh-icon vh-close" style="width:32px;height:32px">${svg(mdiClose, 22)}</button></h3>
      <div class="sub"></div>
      <div class="vh-flow-box"></div>
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
  }
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
  const t = energy.today;
  if (!t || [t.solar, t.home, t.gridIn, t.gridOut].every((x) => x === null)) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  const self = t.home && t.gridIn !== null ? Math.max(0, Math.min(1, 1 - t.gridIn / t.home)) : null;
  const cells: [string, string][] = [];
  if (t.solar !== null) cells.push(["Solar", formatEnergy(t.solar)]);
  if (t.home !== null) cells.push(["House", formatEnergy(t.home)]);
  if (t.gridIn !== null) cells.push(["Bought", formatEnergy(t.gridIn)]);
  if (t.gridOut !== null) cells.push(["Sold", formatEnergy(t.gridOut)]);
  if (self !== null) cells.push(["Own power", `${Math.round(self * 100)}%`]);
  const html = `<div class="h">Today</div><div class="cells">${cells.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join("")}</div>`;
  if (el.innerHTML !== html) el.innerHTML = html;
}

export const ENERGY_CSS = /* css */ `
.vh-root { --vh-node: #1a2232; }
.vh-root.day { --vh-node: #ffffff; }
.vh-energy { padding: 7px 11px; gap: 4px; font-variant-numeric: tabular-nums; }
.vh-energy .sun { color: ${COL.solar}; display: inline-flex; }
.vh-energy .home { color: ${COL.home}; display: inline-flex; }
.vh-energy .bat { color: ${COL.battery}; display: inline-flex; margin-left: 4px; }
.vh-flow-box { display: grid; place-items: center; margin: 2px 0 8px; }
.vh-flow { width: 100%; max-width: 360px; height: auto; overflow: visible; }
.vh-flow text { fill: var(--vh-text); font: 600 12px/1 var(--ha-font-family-body, Roboto, system-ui, sans-serif); font-variant-numeric: tabular-nums; }
.vh-flow text.cap { fill: var(--vh-dim); font-weight: 400; font-size: 11px; }
.vh-today .h { font-size: 12px; color: var(--vh-dim); margin: 0 0 6px; }
.vh-today .cells { display: grid; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); gap: 6px; }
.vh-today .cells > div { background: var(--vh-chip); border-radius: 12px; padding: 7px 10px; }
.vh-today small { display: block; font-size: 11px; color: var(--vh-dim); }
.vh-today b { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.vh-en-ext > div:not(:empty) { margin-top: 12px; }
`;
