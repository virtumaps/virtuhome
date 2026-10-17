// The live 3D view with its controls, shared by the dashboard card and the sidebar panel.
import { mdiArrowExpandAll, mdiHomeOutline, mdiWall, mdiWeatherNight, mdiWeatherSunny, mdiClose, mdiTune, mdiCheck, mdiThermometer, mdiAlert, mdiLightbulbOutline, mdiLightbulbGroup, mdiLightbulbGroupOff, mdiPencilOutline, mdiShieldHome, mdiShieldOffOutline, mdiShieldAlert } from "@mdi/js";
import { normalizePlan, spaces, type Plan, type ThemeName } from "../model/plan";
import { areaOf, domainOf, moreInfo, type Hass } from "../live/hass";
import { HassLive, solarStep, toggleEntity, type Change } from "../live/live";
import { EnergyLive, type EnergyNow } from "../live/energy";
import { loadExtensions, registerView, type Tool, type ToolHandle, type ViewHandle } from "../ext/api";
import { Viewer, type Hit, type Quality, type RealisticModule, type WallMode } from "../scene/viewer";
import { capTier, deviceTier, parseTierSetting, resolveTier, setDeviceTier, TIER_HINTS, TIER_NAMES, TIERS, type Tier, type TierSetting } from "../scene/tier";
import { ENERGY_CSS, energyChip, renderEnergySheet, type EnergySection } from "./energy";
import { VIEW_CSS } from "./styles";

export interface ViewConfig {
  /** Floor to open on (id, name or index); otherwise the whole house. */
  floor?: string | number;
  theme?: ThemeName;
  walls?: WallMode;
  quality?: Quality;
  room_panel?: boolean;
  floor_chips?: boolean;
  stats?: boolean;
  /** Shows the Edit button to admins (the sidebar panel). */
  editable?: boolean;
  /** Alarm panel shown in the top bar (default: the first alarm_control_panel; "none" hides it). */
  alarm?: string;
  /** Who is home, as avatars in the corner (default on). */
  people?: boolean;
  /** Solar, battery and grid: a chip in the corner and the energy sheet (default on). */
  energy?: boolean;
  /** Dev harness: extension modules to load without the integration. */
  dev_extensions?: string[];
  /** Options of extensions (e.g. Wall Tablet's popup, idle_return) live in the same config. */
  [option: string]: unknown;
  /** Saves somewhere else than the integration (dev harness). */
  save?: (plan: Plan) => Promise<number>;
}

const svg = (path: string) => `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`;

/** The walls button shows its mode: a whole brick wall, one stepped down where it is cut away, or a low one. */
const WALL_ICONS: Record<WallMode, string> = {
  full: mdiWall,
  smart: "M3,4H11V9H3V4M2,10H8V15H2V10M9,10H15V15H9V10M3,16H12V21H3V16M13,16H21V21H13V16Z",
  low: "M2,10H8V15H2V10M9,10H15V15H9V10M16,10H22V15H16V10M3,16H12V21H3V16M13,16H21V21H13V16Z",
};
const WALL_NAMES: Record<WallMode, string> = { smart: "Walls: smart cutaway", low: "Walls: low", full: "Walls: full height" };

let realisticModule: RealisticModule | null = null;
/** The realistic look's code, fetched the first time a view needs it. */
function loadRealistic(): Promise<RealisticModule> {
  return realisticModule ? Promise.resolve(realisticModule) : import("../scene/realistic").then((m) => (realisticModule = m));
}

export class VhView {
  readonly root: HTMLDivElement;
  readonly viewer: Viewer;
  readonly live: HassLive;
  private _hass: Hass | null = null;
  private plan: Plan | null = null;
  private unsub: (() => Promise<void>) | null = null;
  private subscribing = false;
  private chips: HTMLDivElement;
  private sheet: HTMLDivElement;
  private toastEl: HTMLDivElement;
  private empty: HTMLDivElement;
  private statsEl: HTMLDivElement;
  private wallsBtn: HTMLButtonElement;
  private themeBtn: HTMLButtonElement;
  private themeOverride: "day" | "night" | null = null;
  private sheetRoom: { floor: number; room: number } | null = null;
  private revision: number | null = null;
  /** The plan as saved; while editing, the view shows the editor's copy instead. */
  private savedPlan: Plan | null = null;
  private editor: { onHit(hit: Hit): void; el: HTMLElement } | null = null;
  private alarmKey = "";
  private hassListeners = new Set<(h: Hass) => void>();
  private touchListeners = new Set<() => void>();
  private unregister: (() => void) | null = null;
  private toastTimer = 0;
  private statsTimer = 0;
  private started = false;
  /** The tier was picked automatically (it may step down when the device struggles). */
  private tierAuto = true;
  private menu: HTMLDivElement;
  private alertEl: HTMLButtonElement;
  private statusEl: HTMLDivElement;
  private statusKey = "";
  readonly energy = new EnergyLive();
  private sheetEnergy = false;
  private energySections: EnergySection[] = [];
  private energyListeners = new Set<(now: EnergyNow) => void>();
  private todayTimer = 0;
  /** The plan has solar panels, and how brightly they shine now (in steps). */
  private hasPanels = false;
  private panelStep = -1;
  private barWatch: ResizeObserver | null = null;

  constructor(shadow: ShadowRoot, private config: ViewConfig, private fixedPlan?: Plan) {
    const style = document.createElement("style");
    style.textContent = VIEW_CSS + ENERGY_CSS;
    this.root = document.createElement("div");
    this.root.className = "vh-root";
    this.root.innerHTML = `
      <div class="vh-canvas"></div>
      <div class="vh-overlay"></div>
      <div class="vh-bar"></div>
      <div class="vh-tools">
        <button class="vh-icon" data-act="walls" title="Walls">${svg(WALL_ICONS.smart)}</button>
        <button class="vh-icon" data-act="theme" title="Day / night">${svg(mdiWeatherNight)}</button>
        <button class="vh-icon" data-act="frame" title="Show all">${svg(mdiArrowExpandAll)}</button>
        <button class="vh-icon" data-act="heat" title="Temperature map">${svg(mdiThermometer)}</button>
        <button class="vh-icon" data-act="graphics" title="Graphics">${svg(mdiTune)}</button>
      </div>
      <button class="vh-alert" hidden></button>
      <div class="vh-status"></div>
      <div class="vh-menu" hidden></div>
      <div class="vh-sheet"></div>
      <div class="vh-empty" hidden></div>
      <div class="vh-toast"></div>
      <div class="vh-stats" hidden></div>`;
    shadow.append(style, this.root);
    const canvas = this.root.querySelector<HTMLDivElement>(".vh-canvas")!;
    const overlay = this.root.querySelector<HTMLDivElement>(".vh-overlay")!;
    this.chips = this.root.querySelector(".vh-bar")!;
    this.sheet = this.root.querySelector(".vh-sheet")!;
    this.toastEl = this.root.querySelector(".vh-toast")!;
    this.empty = this.root.querySelector(".vh-empty")!;
    this.statsEl = this.root.querySelector(".vh-stats")!;
    this.wallsBtn = this.root.querySelector('[data-act="walls"]')!;
    this.themeBtn = this.root.querySelector('[data-act="theme"]')!;
    this.menu = this.root.querySelector(".vh-menu")!;
    this.alertEl = this.root.querySelector(".vh-alert")!;
    this.statusEl = this.root.querySelector(".vh-status")!;
    // the status row and the alert sit under the top bar, however many lines its chips take
    if (typeof ResizeObserver !== "undefined") {
      this.barWatch = new ResizeObserver(() => this.placeUnderBar());
      this.barWatch.observe(this.chips);
    }
    this.alertEl.onclick = () => {
      const first = this.live.alerts()[0];
      if (first) moreInfo(this.root, first.id);
    };
    this.statusEl.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-status]");
      if (!b) return;
      if (b.dataset.status === "lights") this.lightsOff();
      else if (b.dataset.status === "energy") this.openEnergy();
      else if (b.dataset.status) moreInfo(this.root, b.dataset.status);
    });

    const { tier, auto } = resolveTier(parseTierSetting(config.quality));
    this.tierAuto = auto;
    this.viewer = new Viewer(canvas, overlay, { tier, theme: "night", realistic: realisticModule });
    this.viewer.onSlow = () => this.onSlow();
    this.ensureLook();
    this.viewer.walls = config.walls ?? "smart";
    this.live = new HassLive(normalizePlan({ version: 1, floors: [] }));
    this.live.energy = this.energy;
    this.energy.onSources = () => this.onEnergy();
    this.viewer.onHit = (hit, gesture) => this.onHit(hit, gesture);
    this.root.addEventListener("pointerdown", () => this.touchListeners.forEach((cb) => cb()), { passive: true });

    overlay.addEventListener("click", (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".vh-label");
      if (!el) return;
      const floor = Number(el.dataset.floor);
      if (el.dataset.room !== undefined) this.openRoom(floor, Number(el.dataset.room));
      else this.showFloor(floor);
    });
    this.root.querySelector(".vh-tools")!.addEventListener("click", (e) => {
      const act = (e.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
      if (act === "walls") this.cycleWalls();
      if (act === "theme") this.cycleTheme();
      if (act === "frame") this.viewer.frame(true);
      if (act === "graphics") this.toggleGraphicsMenu();
      if (act === "heat") this.toggleHeatmap();
    });
    this.menu.addEventListener("click", (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-tier]")?.dataset.tier;
      if (t) this.setGraphics(t as TierSetting);
    });
    this.root.addEventListener("pointerdown", (e) => {
      if (!this.menu.hidden && !(e.target as HTMLElement).closest(".vh-menu, [data-act=graphics]")) this.menu.hidden = true;
    });
    if (config.stats) {
      this.statsEl.hidden = false;
      this.statsTimer = window.setInterval(() => {
        this.statsEl.textContent = `${this.viewer.fps.toFixed(0)} fps · ${TIER_NAMES[this.viewer.tier]}`;
      }, 1000);
    }
    this.updateWallsButton();
    if (fixedPlan) this.applyPlan(fixedPlan);
  }

  // ------------------------------------------------------------------ hass and plan

  set hass(h: Hass) {
    this._hass = h;
    this.subscribe();
    const energyChanged = this.energy.update(h);
    const changes = this.live.update(h);
    this.applyTheme();
    const sun = h.states["sun.sun"]?.attributes;
    if (sun && typeof sun.azimuth === "number" && typeof sun.elevation === "number") this.viewer.setSun(sun.azimuth, sun.elevation);
    if (this.plan && this.plan.floors.length) this.apply(changes);
    if (energyChanged) this.onEnergy();
    this.updateAlarm(h);
    if (!this.unregister) {
      this.unregister = registerView(this.handle());
      loadExtensions(h, this.config.dev_extensions ?? []);
    }
    for (const cb of this.hassListeners) {
      try {
        cb(h);
      } catch (err) {
        console.error("VirtuHome extension error", err);
      }
    }
  }

  /** What extensions get to see and do with this view. */
  private handle(): ViewHandle {
    const self = this;
    return {
      root: this.root,
      viewer: this.viewer,
      get config() {
        return self.config;
      },
      get hass() {
        return self._hass;
      },
      get plan() {
        return self.plan;
      },
      onHass(cb) {
        self.hassListeners.add(cb);
        if (self._hass) cb(self._hass);
        return () => self.hassListeners.delete(cb);
      },
      onTouch(cb) {
        self.touchListeners.add(cb);
        return () => self.touchListeners.delete(cb);
      },
      showStart: () => this.showStart(),
      closeSheet: () => this.closeSheet(),
      toast: (t) => this.toast(t),
      isEditing: () => !!this.editor,
      createCard: async (config) => {
        const helpers = (window as unknown as { loadCardHelpers?: () => Promise<{ createCardElement(c: Record<string, unknown>): HTMLElement & { hass?: unknown } }> }).loadCardHelpers;
        if (!helpers) return null;
        const card = (await helpers()).createCardElement(config);
        card.hass = this._hass;
        return card;
      },
      moreInfo: (id) => moreInfo(this.root, id),
      addTool: (tool) => this.addTool(tool),
      setRoomTint: (fn) => {
        this.live.roomTint = fn;
      },
      setRoomText: (fn) => {
        this.live.roomExtraText = fn;
      },
      refreshRooms: () => {
        this.viewer.refreshTints();
        this.viewer.refreshLabels();
      },
      energy: {
        get sources() {
          return self.energy.sources;
        },
        get now() {
          return self.energy.now;
        },
        get today() {
          return self.energy.today;
        },
        onChange(cb) {
          self.energyListeners.add(cb);
          if (self.energy.now) cb(self.energy.now);
          return () => self.energyListeners.delete(cb);
        },
        addSection(section) {
          self.energySections.push(section);
          if (self.sheetEnergy) self.renderEnergy();
          return () => {
            self.energySections = self.energySections.filter((x) => x !== section);
            if (self.sheetEnergy) self.renderEnergy();
          };
        },
        open: () => self.openEnergy(),
      },
    };
  }

  private addTool(tool: Tool): ToolHandle {
    const b = document.createElement("button");
    b.className = "vh-icon";
    b.title = tool.title;
    b.innerHTML = svg(tool.icon);
    b.onclick = () => tool.onClick();
    this.root.querySelector(".vh-tools")!.prepend(b);
    return { el: b, setOn: (on) => b.classList.toggle("on", on), remove: () => b.remove() };
  }

  /** The view the card or panel opens with: its floor, or the whole house. */
  showStart(): void {
    if (!this.plan) return;
    this.closeSheet();
    const f = this.startFloor(this.plan);
    if (f >= 0) this.viewer.setMode("floor", f);
    else this.viewer.setMode("house");
    this.renderChips();
  }

  private alarmEntity(h: Hass): string | null {
    const a = this.config.alarm;
    if (a === "none") return null;
    if (a) return a;
    return Object.keys(h.states).find((id) => id.startsWith("alarm_control_panel.")) ?? null;
  }

  private updateAlarm(h: Hass): void {
    const id = this.alarmEntity(h);
    const s = id ? h.states[id] : undefined;
    const key = s ? `${id}|${s.state}` : "";
    if (key === this.alarmKey) return;
    this.alarmKey = key;
    this.renderChips();
  }



  get hass(): Hass | null {
    return this._hass;
  }

  private apply(changes: Set<Change>): void {
    if (!this.started) {
      this.viewer.setLive(this.live);
      this.started = true;
      return;
    }
    if (changes.has("lighting")) this.viewer.refreshLighting();
    if (changes.has("openings")) this.viewer.refreshOpenings();
    if (changes.has("markers")) this.viewer.refreshMarkers();
    if (changes.has("tints")) this.viewer.refreshTints();
    if (changes.has("labels")) this.viewer.refreshLabels();
    if (changes.has("status") || changes.has("lighting")) this.renderStatus();
    if (this.sheetRoom && changes.size) this.renderSheet();
  }

  // ------------------------------------------------------------------ status: alerts, lights, people

  /** The alert banner, the lights-on chip and who is home (only redrawn when something shown changed). */
  private renderStatus(): void {
    const alerts = this.live.alerts();
    this.alertEl.hidden = !alerts.length;
    if (alerts.length) {
      this.alertEl.innerHTML = `${svg(mdiAlert)}<span></span>`;
      this.alertEl.querySelector("span")!.textContent = alerts.length > 1 ? `${alerts[0].text} · and ${alerts.length - 1} more` : alerts[0].text;
    }
    const floor = this.viewer.mode === "floor" ? this.viewer.activeFloor : null;
    const on = this.live.lightsOn(floor).length;
    const people = this.config.people === false ? [] : this.live.people();
    const energy = this.showEnergy() ? energyChip(this.energy.now) : "";
    const key = JSON.stringify([on, floor, people, energy]);
    if (key === this.statusKey) return;
    this.statusKey = key;
    const parts: string[] = [];
    if (energy) parts.push(energy);
    if (on) parts.push(`<button class="vh-chip vh-lights" data-status="lights" title="Turn them off">${svg(mdiLightbulbOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}<span>${on} on</span></button>`);
    for (const p of people) {
      const initials = p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      parts.push(`<button class="vh-person ${p.home ? "home" : "away"}" data-status="${p.id}" title="">${p.picture ? `<img alt="" src="${p.picture.replace(/"/g, "")}">` : `<i>${initials}</i>`}</button>`);
    }
    this.statusEl.innerHTML = parts.join("");
    // names and places as text, never as markup
    this.statusEl.querySelectorAll<HTMLElement>(".vh-person").forEach((b, i) => (b.title = `${people[i].name}: ${people[i].where}`));
  }

  /** Turns off the lights that are on, on the shown floor (or in the whole house). */
  private async lightsOff(): Promise<void> {
    const h = this._hass;
    if (!h) return;
    const floor = this.viewer.mode === "floor" ? this.viewer.activeFloor : null;
    const ids = this.live.lightsOn(floor);
    if (!ids.length) return;
    try {
      await h.callService("light", "turn_off", {}, { entity_id: ids });
      this.toast(`Turned off ${ids.length} light${ids.length === 1 ? "" : "s"}${floor !== null ? ` on ${this.plan?.floors[floor]?.name ?? "this floor"}` : ""}`);
    } catch (err) {
      this.toast(`Could not turn them off: ${String((err as { message?: string }).message ?? err)}`);
    }
  }

  private placeUnderBar(): void {
    const top = this.chips.offsetTop + this.chips.offsetHeight + 10;
    this.statusEl.style.top = `${top}px`;
    this.alertEl.style.top = `${top - 2}px`;
  }

  // ------------------------------------------------------------------ energy

  private showEnergy(): boolean {
    return this.config.energy !== false && this.energy.enabled;
  }

  /** Solar, battery or grid changed: the chip, the open sheet, the panels in 3D, the extensions. */
  private onEnergy(): void {
    this.renderStatus();
    if (this.sheetEnergy) this.renderEnergy();
    const now = this.energy.now;
    if (now) {
      for (const cb of this.energyListeners) {
        try {
          cb(now);
        } catch (err) {
          console.error("VirtuHome extension error", err);
        }
      }
    }
    if (this.hasPanels && this.started) {
      const step = solarStep(this.energy.solarLevel());
      if (step !== this.panelStep) {
        this.panelStep = step;
        this.viewer.refreshLighting();
      }
    }
  }

  private renderEnergy(): void {
    renderEnergySheet(this.sheet, this.energy, this.energySections, () => this.closeSheet());
  }

  /** The energy sheet: the flow between solar, battery, grid and the house, and today's totals. */
  openEnergy(): void {
    if (!this.energy.now || this.editor) return;
    this.sheetRoom = null;
    this.sheetEnergy = true;
    this.renderEnergy();
    this.sheet.classList.add("open");
    const refresh = () => this.energy.refreshToday().then(() => {
      if (this.sheetEnergy) this.renderEnergy();
    });
    refresh();
    window.clearInterval(this.todayTimer);
    this.todayTimer = window.setInterval(refresh, 300_000);
  }

  private toggleHeatmap(): void {
    this.live.heatmap = !this.live.heatmap;
    this.root.querySelector('[data-act="heat"]')?.classList.toggle("on", this.live.heatmap);
    this.viewer.refreshTints();
    this.toast(this.live.heatmap ? "Temperature map: blue is cold, red is warm" : "Temperature map off");
  }

  private async subscribe(): Promise<void> {
    if (this.fixedPlan || this.unsub || this.subscribing || !this._hass) return;
    this.subscribing = true;
    try {
      this.unsub = await this._hass.connection.subscribeMessage<{ plan: unknown; revision: number }>(
        (msg) => {
          this.revision = msg.revision;
          this.savedPlan = normalizePlan(msg.plan);
          if (!this.editor) this.applyPlan(this.savedPlan);
        },
        { type: "virtuhome/plan/subscribe" },
      );
    } catch (err) {
      this.showEmpty("VirtuHome is not set up", `Add the VirtuHome integration under Settings → Devices & services. (${(err as Error).message ?? err})`);
    } finally {
      this.subscribing = false;
    }
  }

  /** Shows a plan that is not saved (the editor's working copy). */
  previewPlan(plan: Plan): void {
    this.applyPlan(plan);
  }

  applyPlan(plan: Plan): void {
    const first = !this.plan;
    this.plan = plan;
    this.energy.setSettings(plan.settings.energy);
    this.live.setPlan(plan);
    if (this._hass) {
      if (this.energy.update(this._hass)) this.renderStatus();
      this.live.update(this._hass);
    }
    if (!plan.floors.length) {
      if (this.editor) return;
      this.showEmpty("No home yet", this.canEdit() ? "Tap Edit to import a scan of your home." : "Open VirtuHome in the sidebar to import a scan of your home or draw it.");
      this.renderChips();
      return;
    }
    this.empty.hidden = true;
    this.hasPanels = plan.floors.some((f) => f.furniture.some((x) => x.type === "solar_panels"));
    this.applyTheme();
    this.viewer.setPlan(plan, !first);
    if (this._hass) {
      this.viewer.setLive(this.live);
      this.started = true;
    }
    if (first) {
      const f = this.startFloor(plan);
      if (f >= 0) this.viewer.setMode("floor", f, false);
    }
    this.renderChips();
  }

  private startFloor(plan: Plan): number {
    const want = this.config.floor;
    if (want === undefined || want === null || want === "") return -1;
    if (typeof want === "number") return Math.min(want, plan.floors.length - 1);
    return plan.floors.findIndex((f) => f.id === want || f.name.toLowerCase() === String(want).toLowerCase());
  }

  setConfig(config: ViewConfig): void {
    this.config = config;
    if (config.walls) {
      this.viewer.setWalls(config.walls);
      this.updateWallsButton();
    }
    this.applyTheme();
  }

  connect(): void {
    this.subscribe();
    this.viewer.invalidate();
  }

  disconnect(): void {
    const u = this.unsub;
    this.unsub = null;
    u?.().catch(() => undefined);
  }

  destroy(): void {
    this.disconnect();
    this.unregister?.();
    this.unregister = null;
    window.clearInterval(this.statsTimer);
    window.clearInterval(this.todayTimer);
    this.barWatch?.disconnect();
    this.viewer.dispose();
  }

  // ------------------------------------------------------------------ looks

  private themeName(): "day" | "night" {
    if (this.themeOverride) return this.themeOverride;
    const t = this.config.theme ?? this.plan?.settings.theme ?? "auto";
    if (t === "day" || t === "night") return t;
    const sun = this._hass?.states["sun.sun"]?.state;
    if (sun) return sun === "below_horizon" ? "night" : "day";
    return this._hass?.themes?.darkMode ? "night" : "day";
  }

  private applyTheme(): void {
    const name = this.themeName();
    this.root.classList.toggle("day", name === "day");
    this.live.day = name === "day";
    this.themeBtn.innerHTML = svg(name === "night" ? mdiWeatherNight : mdiWeatherSunny);
    if (this.viewer.pal.name !== name) {
      this.viewer.setTheme(name);
      this.viewer.refreshAll();
    }
  }

  private cycleTheme(): void {
    this.themeOverride = this.themeName() === "night" ? "day" : "night";
    this.applyTheme();
    this.toast(this.themeOverride === "night" ? "Night look" : "Day look");
  }

  // ------------------------------------------------------------------ graphics

  /** Fetches the realistic look when the tier needs it (the view shows the model look meanwhile). */
  private ensureLook(): void {
    const t = this.viewer.tier;
    if ((t === "high" || t === "ultra") && !this.viewer.realisticLook) {
      loadRealistic()
        .then((m) => this.viewer.setTier(this.viewer.tier, m))
        .catch((err) => {
          console.warn("VirtuHome: realistic look unavailable", err);
          this.viewer.setTier("medium");
        });
    }
  }

  private setGraphics(choice: TierSetting): void {
    setDeviceTier(choice);
    const { tier, auto } = resolveTier(parseTierSetting(this.config.quality));
    this.tierAuto = auto;
    this.menu.hidden = true;
    this.viewer.setTier(tier);
    this.ensureLook();
    this.toast(`Graphics: ${TIER_NAMES[tier]}${auto ? " (auto)" : ""}`);
  }

  private toggleGraphicsMenu(): void {
    if (!this.menu.hidden) {
      this.menu.hidden = true;
      return;
    }
    const picked = deviceTier();
    const autoTier = resolveTier(parseTierSetting(this.config.quality));
    const row = (value: TierSetting, name: string, hint: string) =>
      `<button class="vh-menu-row${picked === value ? " on" : ""}" data-tier="${value}">
        <span class="tick">${picked === value ? svg(mdiCheck) : ""}</span>
        <span><b>${name}</b><small>${hint}</small></span></button>`;
    const autoName = parseTierSetting(this.config.quality) !== "auto" ? `card setting: ${TIER_NAMES[autoTier.tier]}` : TIER_NAMES[autoTier.tier];
    this.menu.innerHTML = `<div class="vh-menu-title">Graphics on this device</div>` +
      row("auto", "Automatic", autoName) +
      TIERS.map((t: Tier) => row(t, TIER_NAMES[t], TIER_HINTS[t])).join("");
    this.menu.hidden = false;
  }

  /** The device can't keep up: step down a tier (only when the tier was picked automatically). */
  private onSlow(): void {
    if (!this.tierAuto) return;
    const i = TIERS.indexOf(this.viewer.tier);
    if (i <= 0) return;
    const next = TIERS[i - 1];
    capTier(next);
    this.viewer.setTier(next);
    this.toast(`Switched to ${TIER_NAMES[next]} graphics to keep it smooth`);
  }

  private cycleWalls(): void {
    const next: Record<WallMode, WallMode> = { smart: "low", low: "full", full: "smart" };
    this.viewer.setWalls(next[this.viewer.walls]);
    this.updateWallsButton();
    this.toast(WALL_NAMES[this.viewer.walls]);
  }

  private updateWallsButton(): void {
    const mode = this.viewer.walls;
    this.wallsBtn.classList.toggle("on", mode !== "full");
    this.wallsBtn.innerHTML = svg(WALL_ICONS[mode]);
    this.wallsBtn.title = `${WALL_NAMES[mode]} (tap to change)`;
  }

  // ------------------------------------------------------------------ floors, rooms and gestures

  private canEdit(): boolean {
    return !!this.config.editable && (this._hass?.user?.is_admin ?? false);
  }

  private renderChips(): void {
    const edit = () => {
      if (!this.canEdit() || this.editor) return;
      const b = document.createElement("button");
      b.className = "vh-chip vh-edit";
      b.innerHTML = `${svg(mdiPencilOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}Edit`;
      b.onclick = () => this.openEditor();
      const spacer = document.createElement("span");
      spacer.className = "vh-spacer";
      this.chips.append(spacer, b);
    };
    if (!this.plan || !this.plan.floors.length || this.config.floor_chips === false) {
      this.chips.innerHTML = "";
      edit();
      return;
    }
    const house = this.viewer.mode === "house";
    const parts = [`<button class="vh-chip ${house ? "on" : ""}" data-floor="-1">${svg(mdiHomeOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}House</button>`];
    this.plan.floors.forEach((_, i) => {
      const on = !house && this.viewer.activeFloor === i;
      parts.push(`<button class="vh-chip ${on ? "on" : ""}" data-floor="${i}"></button>`);
    });
    this.chips.innerHTML = parts.join("");
    this.chips.querySelectorAll<HTMLButtonElement>("[data-floor]").forEach((b) => {
      const i = Number(b.dataset.floor);
      if (i >= 0) b.textContent = this.plan!.floors[i].name;
      b.onclick = () => (i < 0 ? this.showHouse() : this.showFloor(i));
    });
    this.alarmChip();
    edit();
  }

  private alarmChip(): void {
    const h = this._hass;
    const id = h ? this.alarmEntity(h) : null;
    const s = id ? h!.states[id] : undefined;
    if (!id || !s) return;
    const armed = s.state.startsWith("armed");
    const alert = s.state === "triggered" || s.state === "pending" || s.state === "arming";
    const b = document.createElement("button");
    b.className = `vh-chip vh-alarm ${armed ? "armed" : ""} ${alert ? "alert" : ""}`;
    b.innerHTML = `${svg(alert ? mdiShieldAlert : armed ? mdiShieldHome : mdiShieldOffOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}<span></span>`;
    const label: Record<string, string> = {
      disarmed: "Disarmed", armed_home: "Armed home", armed_away: "Armed away", armed_night: "Armed night",
      armed_vacation: "Armed vacation", armed_custom_bypass: "Armed", arming: "Arming…", pending: "Entry delay", triggered: "Alarm!",
    };
    b.querySelector("span")!.textContent = label[s.state] ?? s.state;
    b.onclick = () => moreInfo(this.root, id);
    this.chips.append(b);
  }

  async openEditor(): Promise<void> {
    if (this.editor || !this._hass) return;
    this.closeSheet();
    this.empty.hidden = true;
    const { Editor } = await import("../editor/editor");
    const hass = this._hass;
    const editor = new Editor({
      view: this,
      hass,
      plan: this.plan ?? normalizePlan({ version: 1, floors: [] }),
      revision: this.revision,
      save: async (plan, base) => {
        if (this.config.save) return this.config.save(plan);
        const res = await hass.callWS<{ revision: number }>({ type: "virtuhome/plan/save", plan, ...(base !== null ? { base_revision: base } : {}) });
        this.revision = res.revision;
        this.savedPlan = plan;
        return res.revision;
      },
      restorePoints: this.config.save ? undefined : () => hass.callWS({ type: "virtuhome/history/list" }),
      restore: this.config.save ? undefined : async (id) => {
        await hass.callWS({ type: "virtuhome/history/restore", snapshot_id: id });
      },
      close: () => {
        this.editor = null;
        this.root.classList.remove("editing");
        if (this.savedPlan) this.applyPlan(this.savedPlan);
        else if (this.plan && !this.plan.floors.length) this.applyPlan(this.plan);
        this.renderChips();
      },
    });
    this.editor = editor;
    this.root.classList.add("editing");
    this.root.append(editor.el);
    this.renderChips();
  }

  showHouse(): void {
    this.closeSheet();
    this.viewer.setMode("house");
    this.renderChips();
    this.renderStatus();
  }

  showFloor(i: number): void {
    this.closeSheet();
    this.viewer.setMode("floor", i);
    this.renderChips();
    this.renderStatus();
  }

  private openRoom(floor: number, room: number): void {
    this.viewer.selectRoom(floor, room);
    this.renderChips();
    if (this.config.room_panel !== false) {
      this.sheetEnergy = false;
      window.clearInterval(this.todayTimer);
      this.sheetRoom = { floor, room };
      this.renderSheet();
      this.sheet.classList.add("open");
    }
  }

  private closeSheet(): void {
    this.sheetRoom = null;
    this.sheetEnergy = false;
    window.clearInterval(this.todayTimer);
    this.sheet.classList.remove("open");
  }

  private async onHit(hit: Hit, gesture: "tap" | "long" | "double"): Promise<void> {
    const hass = this._hass;
    if (!hass) return;
    if (this.editor) {
      if (gesture === "tap") this.editor.onHit(hit);
      return;
    }
    if (hit.entity && (hit.kind === "marker" || hit.kind === "lamp" || hit.kind === "entity")) {
      if (gesture === "long") return moreInfo(this.root, hit.entity);
      if (gesture === "double") return;
      const done = await toggleEntity(hass, hit.entity).catch(() => false);
      if (!done) moreInfo(this.root, hit.entity);
      else this.toast(this.nameOf(hit.entity));
      return;
    }
    if (hit.kind === "room") {
      if (gesture === "double") return this.toggleRoomLights(hit.floor, hit.room);
      if (this.viewer.mode === "house") {
        this.viewer.setMode("floor", hit.floor);
        this.renderChips();
      }
      this.openRoom(hit.floor, hit.room);
      return;
    }
    if (gesture === "double") this.showHouse();
    else {
      this.closeSheet();
      if (this.viewer.selectedRoom >= 0) this.viewer.selectRoom(this.viewer.activeFloor, -1, false);
    }
  }

  private async toggleRoomLights(fi: number, ri: number): Promise<void> {
    const floor = this.plan?.floors[fi];
    const room = floor ? spaces(floor)[ri] : undefined;
    if (!floor || !room || !this._hass) return;
    const lights = this.live.roomLights(floor, room);
    if (!lights.length) return this.toast(`No lights in ${room.name}`);
    const anyOn = lights.some((id) => this._hass!.states[id]?.state === "on");
    await this._hass.callService("light", anyOn ? "turn_off" : "turn_on", {}, { entity_id: lights });
    this.toast(`${room.name}: lights ${anyOn ? "off" : "on"}`);
  }

  private nameOf(entityId: string): string {
    const s = this._hass?.states[entityId];
    return String(s?.attributes.friendly_name ?? entityId);
  }

  private toast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.classList.add("show");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("show"), 1600);
  }

  private showEmpty(title: string, text: string): void {
    this.empty.hidden = false;
    this.empty.innerHTML = `<div><h2></h2><p></p></div>`;
    this.empty.querySelector("h2")!.textContent = title;
    this.empty.querySelector("p")!.textContent = text;
  }

  // ------------------------------------------------------------------ room sheet

  private tileHelpers: Promise<{ createCardElement(c: Record<string, unknown>): HTMLElement & { hass?: unknown } }> | null = null;

  private renderSheet(): void {
    const hass = this._hass;
    if (!this.sheetRoom || !this.plan || !hass) return;
    const floor = this.plan.floors[this.sheetRoom.floor];
    const room = floor ? spaces(floor)[this.sheetRoom.room] : undefined;
    if (!room) return this.closeSheet();
    const ids = this.areaEntities(room.area_id);
    const text = this.live.roomText(floor, room);
    const lights = this.live.roomLights(floor, room);
    const anyOn = lights.some((id) => hass.states[id]?.state === "on");
    const key = `${room.id}|${ids.join(",")}|${anyOn}|${text}`;
    if (this.sheet.dataset.key === key) {
      this.sheet.querySelectorAll<HTMLElement & { hass?: unknown }>("[data-tile]").forEach((t) => (t.hass = hass));
      this.updateRows(hass);
      return;
    }
    this.sheet.dataset.key = key;
    this.sheet.innerHTML = `
      <h3><span class="t"></span><button class="vh-icon vh-close" style="width:32px;height:32px">${svg(mdiClose)}</button></h3>
      <div class="sub"></div>
      <div class="actions"></div>
      <div class="vh-tiles"></div>`;
    this.sheet.querySelector(".t")!.textContent = room.name;
    this.sheet.querySelector(".sub")!.textContent = [text, room.area_id ? null : "Not linked to an area"].filter(Boolean).join(" · ") || " ";
    this.sheet.querySelector<HTMLButtonElement>(".vh-close")!.onclick = () => this.closeSheet();
    const actions = this.sheet.querySelector(".actions")!;
    if (lights.length) {
      const b = document.createElement("button");
      b.className = "vh-chip";
      b.innerHTML = `${svg(anyOn ? mdiLightbulbGroupOff : mdiLightbulbGroup).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}<span></span>`;
      b.querySelector("span")!.textContent = anyOn ? "All lights off" : "All lights on";
      b.onclick = () => this.toggleRoomLights(this.sheetRoom!.floor, this.sheetRoom!.room);
      actions.appendChild(b);
    }
    const grid = this.sheet.querySelector(".vh-tiles")!;
    const helpers = (window as unknown as { loadCardHelpers?: () => Promise<never> }).loadCardHelpers;
    if (helpers) {
      this.tileHelpers ??= helpers();
      this.tileHelpers.then((h) => {
        if (this.sheet.dataset.key !== key) return;
        for (const id of ids) {
          const card = h.createCardElement({ type: "tile", entity: id });
          card.dataset.tile = id;
          card.hass = hass;
          grid.appendChild(card);
        }
      });
    } else {
      for (const id of ids) {
        const row = document.createElement("div");
        row.className = "vh-row";
        row.dataset.row = id;
        row.innerHTML = `<span class="n"></span><span class="state"></span>`;
        row.querySelector(".n")!.textContent = this.nameOf(id);
        row.onclick = async () => {
          if (!(await toggleEntity(hass, id).catch(() => false))) moreInfo(this.root, id);
        };
        grid.appendChild(row);
      }
      this.updateRows(hass);
    }
  }

  private updateRows(hass: Hass): void {
    this.sheet.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
      const s = hass.states[row.dataset.row!];
      const unit = s?.attributes.unit_of_measurement ? ` ${s.attributes.unit_of_measurement}` : "";
      row.querySelector(".state")!.textContent = s ? `${s.state}${unit}` : "—";
    });
  }

  /**
   * What a room's sheet shows: one tile per device (its most useful entity; all lights of a
   * multi-gang switch), plus the room's own entities. No dead battery sensors, no media-player
   * wrappers (Plex clients, Music Assistant), no diagnostics.
   */
  private areaEntities(area: string | null): string[] {
    const hass = this._hass;
    if (!hass || !area) return [];
    const order = ["light", "switch", "cover", "climate", "fan", "media_player", "lock", "camera", "vacuum", "binary_sensor", "sensor"];
    // what a device is shown by; 100 and above is not shown at all
    const rank = (id: string) => {
      const dom = domainOf(id);
      const dc = String(hass.states[id]?.attributes.device_class ?? "");
      const base: Record<string, number> = { light: 0, camera: 5, climate: 10, media_player: 15, cover: 20, lock: 25, fan: 30, vacuum: 35 };
      if (base[dom] !== undefined) return base[dom];
      if (dom === "binary_sensor") return /door|window|opening|garage|motion|occupancy|presence|smoke|moisture|gas|carbon/.test(dc) ? 40 : 200;
      if (dom === "switch") return /do_not_disturb|snooze|home_mode|_led\b|child_lock|sync_|nightlight|freeze|reverse|detection|play_.*sound/.test(id) ? 200 : dc === "outlet" ? 45 : 60;
      if (dom === "sensor") return /temperature|humidity/.test(dc) ? 70 : 200;
      return 200;
    };
    const byDevice = new Map<string, string[]>();
    for (const [id, reg] of Object.entries(hass.entities ?? {})) {
      if (reg.hidden || reg.entity_category || !hass.states[id]) continue;
      const dom = domainOf(id);
      if (!order.includes(dom)) continue;
      if (dom === "media_player" && ["plex", "music_assistant", "group"].includes(String(reg.platform))) continue;
      if (areaOf(hass, id) !== area) continue;
      const key = reg.device_id ?? id;
      if (!byDevice.has(key)) byDevice.set(key, []);
      byDevice.get(key)!.push(id);
    }
    const picked: string[] = [];
    for (const ids of byDevice.values()) {
      const lights = ids.filter((id) => domainOf(id) === "light");
      if (lights.length) {
        picked.push(...lights);
        continue;
      }
      const best = ids.sort((a, b) => rank(a) - rank(b))[0];
      const s = hass.states[best];
      const dead = (s?.state === "unavailable" || s?.state === "unknown") && /sensor/.test(domainOf(best));
      if (best && rank(best) < 100 && !dead) picked.push(best);
    }
    return picked.sort((a, b) => rank(a) - rank(b) || this.nameOf(a).localeCompare(this.nameOf(b))).slice(0, 24);
  }

}
