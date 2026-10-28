// The live 3D view with its controls, shared by the dashboard card and the sidebar panel.
import { mdiArrowExpandAll, mdiHomeOutline, mdiHomeRoof, mdiWall, mdiWeatherNight, mdiWeatherSunny, mdiWeatherPartlyCloudy, mdiClose, mdiTune, mdiCheck, mdiThermometer, mdiAlert, mdiLightbulbOutline, mdiLightbulbGroup, mdiLightbulbGroupOff, mdiPencilOutline, mdiShieldHome, mdiShieldOffOutline, mdiShieldAlert } from "@mdi/js";
import { barChips, normalizePlan, spaces, type Plan, type Repair, type ThemeName } from "../model/plan";
import { canFollow, entityRegistry, followRenames } from "../model/links";
import { areaOf, domainOf, moreInfo, type Hass } from "../live/hass";
import { HassLive, initials, solarStep, toggleEntity, type Change, type RoomText, type RoomTint } from "../live/live";
import { EnergyLive, type EnergyNow } from "../live/energy";
import { hereText } from "../live/presence";
import { readingIcon, valueText } from "../live/readings";
import { ICONS } from "../scene/markers";
import { extensionFailures, loadExtensions, registerView, type Place, type ReplayOptions, type ReplaySession, type Tool, type ToolHandle, type ViewHandle } from "../ext/api";
import { Viewer, type Hit, type Quality, type RealisticModule, type WallMode } from "../scene/viewer";
import { autoTierInfo, capTier, clearCap, deviceTier, parseTierSetting, resolveTier, setDeviceTier, tierHint, tierName, tierNameEn, TIERS, type Tier, type TierSetting } from "../scene/tier";
import { ENERGY_CSS, energyChip, renderEnergySheet, type EnergySection, type EvActions } from "./energy";
import { CAR_TYPES, EV_TYPES } from "../scene/furniture-lib";
import { isNewHome, START_CHOICES, type StartKind } from "./setup";
import { esc, t, th } from "../i18n";
import { VIEW_CSS } from "./styles";
import { location as skyLocation, SkyLive, skyKey, type Sky } from "../live/sky";
import { roofFaces, shadeGeometry, solarArrays } from "../scene/roof-info";
import { SkyPanel, SKY_CSS, type SkyPick } from "./sky";
import { checkCounts, runChecks, type Check, type ServerChecks } from "./checks";
import { callEach, errorBox, errorDetails, isolate, logError, reportFrom, sendHeld } from "./errors";

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
  /** Roofs over the house (default on; the roof button turns them off on this device). */
  roof?: boolean;
  /** Values in the top bar, by entity (default: the plan's; an empty list shows none). */
  chips?: string[];
  /** Dev harness: extension modules to load without the integration. */
  dev_extensions?: string[];
  /** Options of extensions (e.g. Wall Tablet's popup, idle_return) live in the same config. */
  [option: string]: unknown;
  /** Saves somewhere else than the integration (dev harness). */
  save?: (plan: Plan) => Promise<number>;
  /** The online demo, and the demo home in Home Assistant: the editor works but can't save, no extensions, no dialogs. */
  demo?: boolean;
}

const svg = (path: string) => `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`;

/** Why the plan can't be saved now, or null: a demo never saves, and nothing saves while the demo home shows. */
export function saveRefused(config: ViewConfig, demoShown: boolean): string | null {
  return config.demo ? t("view.demoCantSave") : demoShown ? t("demo.closeFirst") : null;
}

/** The walls button shows its mode: a whole brick wall, one stepped down where it is cut away, or a low one. */
const WALL_ICONS: Record<WallMode, string> = {
  full: mdiWall,
  smart: "M3,4H11V9H3V4M2,10H8V15H2V10M9,10H15V15H9V10M3,16H12V21H3V16M13,16H21V21H13V16Z",
  low: "M2,10H8V15H2V10M9,10H15V15H9V10M16,10H22V15H16V10M3,16H12V21H3V16M13,16H21V21H13V16Z",
};

/** What the chargers' lights show, and what the cars' labels say (redrawn only when these change). */
function evKeys(now: EnergyNow | null): [string, string] {
  const ev = now?.ev ?? [];
  return [ev.map((c) => c.state).join("|"), ev.map((c) => `${c.state}:${c.level === null ? "" : Math.round(c.level)}`).join("|")];
}

/** Alarm states the chip names (others show as Home Assistant gives them). */
const ALARM_STATES = ["disarmed", "armed_home", "armed_away", "armed_night", "armed_vacation", "armed_custom_bypass", "arming", "pending", "triggered"] as const;

const ROOF_KEY = "virtuhome.roof";
/** The roof button's choice on this device, if made. */
function roofSetting(): boolean | null {
  try {
    const v = localStorage.getItem(ROOF_KEY);
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
}

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
  private roofBtn: HTMLButtonElement;
  private themeBtn: HTMLButtonElement;
  private themeOverride: "day" | "night" | null = null;
  private sheetRoom: { floor: number; room: number } | null = null;
  private revision: number | null = null;
  /** The plan as saved; while editing, the view shows the editor's copy instead. */
  private savedPlan: Plan | null = null;
  /** The saved plan as JSON, and the same before renamed entities were followed (the plan is unsaved since). */
  private baseJson: string | null = null;
  private unsavedFrom: string | null = null;
  /** Entities followed to their new ids since the plan was loaded: [from, to]. */
  private followed: [string, string][] = [];
  /** The entity registry last seen (Home Assistant hands over a new object when it changes). */
  private registrySeen: unknown = null;
  /** Check my setup, for admins: what normalizePlan put right, what the integration says, the problems for the dot on Edit. */
  private repairs: Repair[] = [];
  private server: ServerChecks | null | undefined = undefined;
  /** Asks the integration again while Home Assistant is still starting. */
  private serverTimer = 0;
  private serverTries = 0;
  private problems = 0;
  private checksSeen: unknown[] = [];
  private reported = "";
  private editor: { onHit(hit: Hit): void; el: HTMLElement; registryChanged(): void; checksChanged(): void; startSetup(kind: StartKind): void } | null = null;
  private alarmKey = "";
  /** While the first run shows: for whom it was drawn (who may edit), else "". */
  private firstRun = "";
  private hassListeners = new Set<(h: Hass) => void>();
  private planListeners = new Set<(p: Plan) => void>();
  private touchListeners = new Set<() => void>();
  private unregister: (() => void) | null = null;
  private toastTimer = 0;
  private statsTimer = 0;
  private started = false;
  /** The tier was picked automatically (it may step down when the device struggles). */
  private tierAuto = true;
  private menu: HTMLDivElement;
  /** A small menu at the finger: a device's entities (a switch's gangs). */
  private pop: HTMLDivElement;
  private alertEl: HTMLButtonElement;
  private tools: HTMLDivElement;
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
  /** The plan has a car or a charger: what the chargers do (their lights) and the cars' levels (their labels). */
  private hasEv = false;
  private evGlowKey = "";
  private evLabelKey = "";
  /** Cars that are away now (as their "parked" says): left out of the 3D view, never out of the plan. */
  private awayKey = "";
  private barWatch: ResizeObserver | null = null;
  /** An extension replaying the past: the view draws its states, and live ones wait until it ends. */
  private replayed: { hass: Hass; time: number; options: ReplayOptions; drawn: boolean } | null = null;
  /** Extensions' room colours and texts, set aside while a replay shows its own. */
  private extTint: RoomTint | null = null;
  private extText: RoomText | null = null;
  private themeTimer = 0;
  /** The sky over the house: the sun moves every minute; the weather follows its entity. */
  readonly skyLive = new SkyLive();
  private skyShown = "";
  private skyTimer = 0;
  /** A date, time or weather picked in the sun and weather panel, instead of now. */
  private skyPick: SkyPick | null = null;
  private skyPanel: SkyPanel;
  /** The house can't be drawn: the error box shows instead. */
  private failed = false;
  private unreport: () => void;
  /** The demo home shown over this view (Look at the demo home). */
  private demo: { close(): void } | null = null;

  constructor(shadow: ShadowRoot, private config: ViewConfig, private fixedPlan?: Plan) {
    const style = document.createElement("style");
    style.textContent = VIEW_CSS + ENERGY_CSS + SKY_CSS;
    this.root = document.createElement("div");
    this.root.className = "vh-root";
    this.root.innerHTML = `
      <div class="vh-canvas"></div>
      <div class="vh-overlay"></div>
      <div class="vh-bar"></div>
      <div class="vh-tools">
        <button class="vh-icon" data-act="walls" title="${th("view.tool.walls")}">${svg(WALL_ICONS.smart)}</button>
        <button class="vh-icon" data-act="roof" title="${th("view.tool.roof")}" hidden>${svg(mdiHomeRoof)}</button>
        <button class="vh-icon" data-act="theme" title="${th("view.tool.theme")}">${svg(mdiWeatherNight)}</button>
        <button class="vh-icon" data-act="sky" title="${th("view.tool.sky")}">${svg(mdiWeatherPartlyCloudy)}</button>
        <button class="vh-icon" data-act="frame" title="${th("view.tool.frame")}">${svg(mdiArrowExpandAll)}</button>
        <button class="vh-icon" data-act="heat" title="${th("view.tool.heat")}">${svg(mdiThermometer)}</button>
        <button class="vh-icon" data-act="graphics" title="${th("view.tool.graphics")}">${svg(mdiTune)}</button>
      </div>
      <button class="vh-alert" hidden></button>
      <div class="vh-status"></div>
      <div class="vh-menu" hidden></div>
      <div class="vh-pop" hidden></div>
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
    this.roofBtn = this.root.querySelector('[data-act="roof"]')!;
    this.themeBtn = this.root.querySelector('[data-act="theme"]')!;
    this.menu = this.root.querySelector(".vh-menu")!;
    this.pop = this.root.querySelector(".vh-pop")!;
    this.alertEl = this.root.querySelector(".vh-alert")!;
    this.statusEl = this.root.querySelector(".vh-status")!;
    this.tools = this.root.querySelector(".vh-tools")!;
    // the status row and the alert sit under the top bar, however many lines its chips take
    if (typeof ResizeObserver !== "undefined") {
      this.barWatch = new ResizeObserver(() => this.placeUnderBar());
      this.barWatch.observe(this.chips);
      this.barWatch.observe(this.statusEl);
    }
    this.alertEl.onclick = () => {
      const first = this.live.alerts()[0];
      if (first) this.dialog(first.id);
    };
    this.statusEl.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-status]");
      if (!b) return;
      if (b.dataset.status === "lights") this.lightsOff();
      else if (b.dataset.status === "energy") this.openEnergy();
      else if (b.dataset.status) this.dialog(b.dataset.status);
    });

    const { tier, auto } = resolveTier(parseTierSetting(config.quality));
    this.tierAuto = auto;
    this.viewer = new Viewer(canvas, overlay, { tier, theme: "night", realistic: realisticModule });
    this.viewer.onSlow = () => this.onSlow();
    this.viewer.onError = (err, fatal, where) => (fatal ? this.fail(err, where) : logError(err, where));
    // errors go to the integration stripped of what this view knows
    this.unreport = reportFrom(() => ({ hass: this._hass, plan: this.plan, graphics: tierNameEn(this.viewer.tier) }));
    this.ensureLook();
    this.viewer.walls = config.walls ?? "smart";
    this.viewer.roofOn = roofSetting() ?? config.roof ?? true;
    this.live = new HassLive(normalizePlan({ version: 1, floors: [] }));
    this.live.peopleInRooms = config.people !== false;
    this.live.energy = this.energy;
    this.energy.onSources = () => this.onEnergy();
    this.viewer.onHit = (hit, gesture) => this.onHit(hit, gesture);
    this.root.addEventListener("pointerdown", () => callEach(this.touchListeners, undefined), { passive: true });

    overlay.addEventListener("click", (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".vh-label");
      if (!el) return;
      const floor = Number(el.dataset.floor);
      const opens = (e.target as HTMLElement).closest<HTMLElement>("[data-entity]")?.dataset.entity;
      // a reading opens its entity (in a replay, the replay hears of it as of a device)
      if (el.dataset.reading !== undefined || el.dataset.piece !== undefined) {
        if (this.replayed) this.replayed.options.onHit?.({ floor, room: -1, entity: el.dataset.entity ?? null }, "tap");
        else if (opens && !this.editor) this.dialog(opens);
      } else if (el.dataset.room === undefined) this.showFloor(floor);
      // the room's heating opens its thermostat; the rest of the label opens the room
      else if (opens && !this.replayed && !this.editor) this.dialog(opens);
      else if (this.replayed) this.replayed.options.onHit?.({ floor, room: Number(el.dataset.room), entity: null }, "tap");
      else this.openRoom(floor, Number(el.dataset.room));
    });
    this.root.querySelector(".vh-tools")!.addEventListener("click", (e) => {
      const act = (e.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
      if (act === "walls") this.cycleWalls();
      if (act === "roof") this.toggleRoof();
      if (act === "theme") this.cycleTheme();
      if (act === "frame") this.viewer.frame(true);
      if (act === "graphics") this.toggleGraphicsMenu();
      if (act === "heat") this.toggleHeatmap();
      if (act === "sky") this.toggleSkyPanel();
    });
    this.menu.addEventListener("click", (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-tier]")?.dataset.tier;
      if (t) this.setGraphics(t as TierSetting);
    });
    this.root.addEventListener("pointerdown", (e) => {
      if (!this.menu.hidden && !(e.target as HTMLElement).closest(".vh-menu, [data-act=graphics]")) this.menu.hidden = true;
      if (!this.pop.hidden && !(e.target as HTMLElement).closest(".vh-pop")) this.pop.hidden = true;
    });
    if (config.stats) {
      this.statsEl.hidden = false;
      this.statsTimer = window.setInterval(() => {
        this.statsEl.textContent = `${this.viewer.fps.toFixed(0)} fps · ${tierName(this.viewer.tier)}`;
      }, 1000);
    }
    this.updateWallsButton();
    this.skyPanel = new SkyPanel({
      hass: () => this._hass,
      sky: () => this.viewer.currentSky,
      realistic: () => this.viewer.realisticLook || this.viewer.tier === "high" || this.viewer.tier === "ultra",
      pick: (p) => {
        this.skyPick = p;
        this.updateSky();
        this.applyTheme();
      },
      useRealistic: () => this.setGraphics("high"),
    });
    this.root.append(this.skyPanel.el);
    this.skyLive.onChange = () => this.updateSky();
    // the sun moves about a quarter of a degree a minute
    this.skyTimer = window.setInterval(() => this.updateSky(), 60_000);
    if (fixedPlan) {
      this.baseJson = JSON.stringify(fixedPlan);
      this.showPlan(fixedPlan);
    }
  }

  // ------------------------------------------------------------------ errors

  /** The house can't be drawn: a box says so, with Copy details and Reload, instead of a blank view. */
  private fail(err: unknown, where: string): void {
    logError(err, where);
    if (this.failed) return;
    this.failed = true;
    this.viewer.halt();
    this.root.classList.add("vh-failed");
    this.root.append(errorBox(() => errorDetails(err, { where, graphics: tierNameEn(this.viewer.tier), hass: this._hass, plan: this.plan })));
  }

  /** Before the house is drawn, an error would leave the view blank; afterwards the view carries on. */
  private caught(err: unknown, where: string): void {
    if (this.started) logError(err, where);
    else this.fail(err, where);
  }

  /** Draws a plan; one that can't be drawn shows the error box. */
  private showPlan(plan: Plan): void {
    try {
      this.applyPlan(plan);
    } catch (err) {
      this.fail(err, "plan");
    }
  }

  // ------------------------------------------------------------------ hass and plan

  set hass(h: Hass) {
    if (!this._hass) queueMicrotask(sendHeld);
    if (this.failed) {
      // kept for Copy details, which strips the names it knows
      this._hass = h;
      return;
    }
    try {
      this.setHass(h);
    } catch (err) {
      this.caught(err, "view");
    }
  }

  private setHass(h: Hass): void {
    this._hass = h;
    this.subscribe();
    // who may edit is known once the user is: the first run shows its choices or who can set it up
    if (this.firstRun && this.firstRun !== this.firstRunKey()) this.showFirstRun();
    const energyChanged = this.energy.update(h);
    // while a replay shows the past, live states wait for it to end
    if (!this.replayed) this.draw(h);
    if (energyChanged) this.onEnergy();
    else this.checkParked();
    // the demos load no extensions: they could reach Home Assistant past the pretend states
    if (!this.unregister && !this.config.demo) {
      this.unregister = registerView(this.handle());
      // an extension that can't load shows in Check my setup
      loadExtensions(h, this.config.dev_extensions ?? []).then(() => this.updateChecks());
    }
    if (h.entities !== this.registrySeen) {
      this.registrySeen = h.entities;
      this.followRenames();
    }
    if (h.entities !== this.checksSeen[0] || h.areas !== this.checksSeen[1] || h.devices !== this.checksSeen[2]) {
      this.checksSeen = [h.entities, h.areas, h.devices];
      this.updateChecks();
    }
    callEach(this.hassListeners, h);
  }

  /** Draws a set of states: the live ones, or a replay's (plus parts to redraw anyway). */
  private draw(h: Hass, extra: Change[] = []): void {
    const changes = this.live.update(h);
    for (const c of extra) changes.add(c);
    this.applyTheme();
    this.updateSky();
    if (this.plan && this.plan.floors.length) this.apply(changes);
    this.updateAlarm(h);
    this.updateBarValues(h);
  }

  /** The states the view shows: a replay's, else the live ones. */
  private get shown(): Hass | null {
    return this.replayed?.hass ?? this._hass;
  }

  // ------------------------------------------------------------------ replays of the past

  private startReplay(given: ReplayOptions): ReplaySession {
    // the extension's tints, texts and taps, kept from stopping the view when they throw
    const options: ReplayOptions = {
      ...given,
      tint: given.tint && isolate(given.tint, null),
      text: given.text && isolate(given.text, null),
      onHit: given.onHit && isolate(given.onHit, undefined, "extension", false),
    };
    this.endReplay();
    if (this.editor || !this._hass) {
      // nothing to replay into: the session ends at once
      queueMicrotask(() => options.onEnd?.());
      return { show: () => undefined, refreshTints: () => undefined, end: () => undefined, active: false };
    }
    this.closeSheet();
    const r = { hass: { ...this._hass, states: {} } as Hass, time: Date.now(), options, drawn: false };
    this.replayed = r;
    this.live.roomTint = options.tint ?? null;
    this.live.roomExtraText = options.text ?? null;
    // solar panels, chargers and cars would show what they do now
    this.live.energy = null;
    this.live.now = () => r.time;
    this.root.classList.add("replaying");
    this.statusKey = "";
    const self = this;
    return {
      show: (states, time) => {
        if (this.replayed !== r || !this._hass) return;
        r.time = time;
        // the registries stay live (they rarely change); the states are the replay's
        Object.assign(r.hass, this._hass, { states });
        // the first picture also takes the replay's room tints and texts, and the panels' and chargers' lights off
        this.draw(r.hass, r.drawn ? [] : ["lighting", "tints", "labels", "status"]);
        r.drawn = true;
      },
      refreshTints: () => {
        if (this.replayed === r && this.started) this.viewer.refreshTints();
      },
      end: () => {
        if (this.replayed === r) this.endReplay();
      },
      get active() {
        return self.replayed === r;
      },
    };
  }

  /** Back to live: what changed meanwhile is drawn, and the extensions get their rooms back. */
  private endReplay(): void {
    const r = this.replayed;
    if (!r) return;
    this.replayed = null;
    this.root.classList.remove("replaying");
    this.live.roomTint = this.extTint;
    this.live.roomExtraText = this.extText;
    this.live.energy = this.energy;
    this.live.now = Date.now;
    this.statusKey = "";
    // a room picked out in the past is not picked now
    if (this.viewer.selectedRoom >= 0) this.viewer.selectRoom(this.viewer.activeFloor, -1, false);
    if (this._hass) {
      // the rooms' tints and texts, and the lights of panels and chargers, changed hands too
      this.draw(this._hass, ["lighting", "tints", "labels", "status"]);
      this.checkParked();
    }
    if (r.options.onEnd) callEach([r.options.onEnd], undefined);
  }

  /** Where an entity is in the plan, with the names of its floor and room. */
  private locate(entity: string): Place | null {
    const p = this.live.place(entity);
    const floor = p ? this.plan?.floors[p.floor] : undefined;
    if (!p || !floor) return null;
    const room = p.room >= 0 ? spaces(floor)[p.room] : undefined;
    return { floor: p.floor, room: p.room, floorName: floor.name, roomName: room?.name ?? null };
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
      moreInfo: (id) => this.dialog(id),
      addTool: (tool) => this.addTool(tool),
      setRoomTint: (fn) => {
        this.extTint = fn && isolate(fn, null);
        if (!this.replayed) this.live.roomTint = this.extTint;
      },
      setRoomText: (fn) => {
        this.extText = fn && isolate(fn, null);
        if (!this.replayed) this.live.roomExtraText = this.extText;
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
      watchedEntities: () => this.live.watched(),
      locate: (id) => this.locate(id),
      replay: (options = {}) => this.startReplay(options),
      get replaying() {
        return !!self.replayed;
      },
      showFloor: (i) => this.showFloor(i),
      showHouse: () => this.showHouse(),
      selectRoom: (floor, room, fly = true) => {
        if (!this.plan?.floors[floor]) return;
        this.viewer.selectRoom(floor, room, fly);
        this.renderChips();
        this.renderStatus();
      },
      roofFaces: () => (this.plan ? roofFaces(this.plan) : []),
      solarArrays: () => (this.plan ? solarArrays(this.plan) : []),
      shadeGeometry: () => shadeGeometry(Array.from({ length: this.viewer.floorCount }, (_, i) => this.viewer.floorBuild(i)!).filter(Boolean)),
      site: () => {
        const loc = skyLocation(this._hass);
        return loc ? { north: this.plan?.settings.north ?? 0, lat: loc.lat, lon: loc.lon } : null;
      },
      paintRoofs: (fn, spacing) => this.viewer.setRoofPaint(fn && isolate(fn, null), spacing),
      showRoofs: (on) => this.viewer.forceRoof(on),
      onPlan: (cb) => {
        self.planListeners.add(cb);
        return () => self.planListeners.delete(cb);
      },
    };
  }

  private addTool(tool: Tool): ToolHandle {
    const b = document.createElement("button");
    b.className = "vh-icon";
    b.title = tool.title;
    b.innerHTML = svg(tool.icon);
    b.onclick = () => callEach([() => tool.onClick()], undefined);
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
    if (changes.has("readings")) this.viewer.refreshReadings();
    if (changes.has("status") || changes.has("lighting")) this.renderStatus();
    if (this.sheetRoom && changes.size) this.renderSheet();
  }

  // ------------------------------------------------------------------ status: alerts, lights, people

  /** The alert banner, the lights-on chip and who is home (only redrawn when something shown changed). */
  private renderStatus(): void {
    const alerts = this.live.alerts();
    const alertText = alerts.length > 1 ? t("view.alerts.more", { alert: alerts[0].text, n: alerts.length - 1 }) : alerts[0]?.text ?? "";
    if (alertText !== (this.alertEl.hidden ? "" : this.alertEl.textContent)) {
      this.alertEl.hidden = !alerts.length;
      if (alerts.length) {
        this.alertEl.innerHTML = `${svg(mdiAlert)}<span></span>`;
        this.alertEl.querySelector("span")!.textContent = alertText;
      }
      this.placeUnderBar();
    }
    const floor = this.viewer.mode === "floor" ? this.viewer.activeFloor : null;
    // a replay shows who was home then; the lights chip (a switch) and today's energy would be about now
    const past = !!this.replayed;
    const on = past ? 0 : this.live.lightsOn(floor).length;
    const people = this.config.people === false ? [] : this.live.people();
    const energy = this.showEnergy() && !past ? energyChip(this.energy.now) : "";
    const key = JSON.stringify([on, floor, people, energy]);
    if (key === this.statusKey) return;
    this.statusKey = key;
    const parts: string[] = [];
    if (energy) parts.push(energy);
    if (on) parts.push(`<button class="vh-chip vh-lights" data-status="lights" title="${th("view.lights.turnOff")}">${svg(mdiLightbulbOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}<span>${th("view.lights.on", { n: on })}</span></button>`);
    for (const p of people) {
      parts.push(`<button class="vh-person ${p.home ? "home" : "away"}" data-status="${p.id}" title="">${p.picture ? `<img alt="" src="${p.picture.replace(/"/g, "")}">` : "<i></i>"}</button>`);
    }
    this.statusEl.innerHTML = parts.join("");
    // names and places as text, never as markup
    this.statusEl.querySelectorAll<HTMLElement>(".vh-person").forEach((b, i) => {
      b.title = `${people[i].name}: ${people[i].room ?? people[i].where}`;
      const letters = b.querySelector("i");
      if (letters) letters.textContent = initials(people[i].name);
    });
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
      const n = ids.length;
      this.toast(floor === null ? t("view.lights.turnedOff", { n }) : t("view.lights.turnedOffOn", { n, floor: this.plan?.floors[floor]?.name ?? t("view.lights.thisFloor") }));
    } catch (err) {
      this.toast(t("view.lights.failed", { error: String((err as { message?: string }).message ?? err) }));
    }
  }

  /**
   * The status row under the top bar, however many lines its chips take; the alert beside it, or
   * under it where they would overlap (a phone); the buttons on the right below both (a short view
   * wraps them into a second column).
   */
  private placeUnderBar(): void {
    const top = this.chips.offsetTop + this.chips.offsetHeight + 10;
    this.statusEl.style.top = `${top}px`;
    let below = top + this.statusEl.offsetHeight;
    this.alertEl.style.top = `${top - 2}px`;
    if (!this.alertEl.hidden) {
      const a = this.alertEl.getBoundingClientRect();
      const s = this.statusEl.getBoundingClientRect();
      if (s.width && a.right > s.left && a.left < s.right) {
        this.alertEl.style.top = `${below + 6}px`;
        below += 6 + this.alertEl.offsetHeight;
      } else below = Math.max(below, top - 2 + this.alertEl.offsetHeight);
    }
    this.tools.style.top = `${below + 10}px`;
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
    if (now) callEach(this.energyListeners, now);
    let relight = false;
    if (this.hasPanels && this.started) {
      const step = solarStep(this.energy.solarLevel());
      if (step !== this.panelStep) {
        this.panelStep = step;
        relight = true;
      }
    }
    // a charger's light changes when it starts or stops; the driveway's label when a level moves
    if (this.hasEv && this.started && now) {
      const [glow, label] = evKeys(now);
      if (glow !== this.evGlowKey) {
        this.evGlowKey = glow;
        relight = true;
      }
      if (label !== this.evLabelKey) {
        this.evLabelKey = label;
        if (!this.replayed) this.viewer.refreshLabels();
      }
    }
    // a replay draws the past without them; its end draws them as they are then
    if (relight && !this.replayed) this.viewer.refreshLighting();
    this.checkParked();
  }

  /** Cars of the plan that are away now. */
  private awayCars(plan: Plan): string[] {
    if (this.editor) return [];
    return plan.floors.flatMap((f) => f.furniture.filter((x) => CAR_TYPES.has(x.type) && x.parked && !this.live.carHere(x)).map((x) => x.id));
  }

  /** The plan as the 3D view shows it: without the cars that are away. */
  private shownPlan(plan: Plan): Plan {
    const away = new Set(this.awayCars(plan));
    this.awayKey = [...away].join(",");
    if (!away.size) return plan;
    return { ...plan, floors: plan.floors.map((f) => (f.furniture.some((x) => away.has(x.id)) ? { ...f, furniture: f.furniture.filter((x) => !away.has(x.id)) } : f)) };
  }

  /** A car arrived or left: its floor is drawn again with it or without it (a few times a day). */
  private checkParked(): void {
    if (!this.plan || !this.started || this.editor || this.replayed || !this.hasEv) return;
    if (this.awayCars(this.plan).join(",") === this.awayKey) return;
    this.viewer.setPlan(this.shownPlan(this.plan), true);
  }

  private renderEnergy(): void {
    renderEnergySheet(this.sheet, this.energy, this.energySections, () => this.closeSheet(), this.evActions);
  }

  /** Taps on a car's card: its charge mode, approving a charge, its charger's own dialog. */
  private evActions: EvActions = {
    setMode: (i, option) => {
      const id = this.energy.sources.ev[i]?.mode;
      if (id) this.callFromSheet("select", "select_option", { option }, id, "view.ev.modeFailed");
    },
    approve: (i) => {
      const id = this.energy.sources.ev[i]?.approve;
      if (id) this.callFromSheet("button", "press", {}, id, "view.ev.approveFailed");
    },
    open: (i) => {
      const c = this.energy.sources.ev[i];
      const id = c?.status ?? c?.power ?? c?.level;
      if (id) this.dialog(id);
    },
  };

  private async callFromSheet(domain: string, service: string, data: Record<string, unknown>, entity: string, failed: "view.ev.modeFailed" | "view.ev.approveFailed"): Promise<void> {
    try {
      await this._hass?.callService(domain, service, data, { entity_id: entity });
    } catch (err) {
      this.toast(t(failed, { error: String((err as { message?: string }).message ?? err) }));
    }
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
    this.toast(t(this.live.heatmap ? "view.heat.on" : "view.heat.off"));
  }

  private async subscribe(): Promise<void> {
    if (this.fixedPlan || this.unsub || this.subscribing || !this._hass) return;
    this.subscribing = true;
    try {
      this.unsub = await this._hass.connection.subscribeMessage<{ plan: unknown; revision: number }>(
        (msg) => {
          if (this.failed) return;
          try {
            this.revision = msg.revision;
            this.repairs = [];
            this.savedPlan = normalizePlan(msg.plan, this.repairs);
            this.baseJson = JSON.stringify(this.savedPlan);
            this.unsavedFrom = null;
            this.followed = [];
            if (!this.editor) {
              this.applyPlan(this.savedPlan);
              this.followRenames();
            }
          } catch (err) {
            // a plan that can't be loaded or drawn
            this.fail(err, "plan");
          }
        },
        { type: "virtuhome/plan/subscribe" },
      );
    } catch (err) {
      this.firstRun = "";
      this.showEmpty(t("view.notSetUp.title"), t("view.notSetUp.text", { error: String((err as Error).message ?? err) }));
    } finally {
      this.subscribing = false;
    }
  }

  /**
   * Entities renamed in Home Assistant: links follow them by the registry ids the plan keeps. Only
   * the plan in memory changes; the editor then has it unsaved. Runs when the registry changes.
   */
  private async followRenames(): Promise<void> {
    const h = this._hass;
    if (this.editor) return this.editor.registryChanged();
    const plan = this.plan;
    if (!h || !plan?.floors.length || !canFollow(plan, h)) return;
    const registry = await entityRegistry(h);
    if (!registry || this.plan !== plan || this.editor) return;
    const next = structuredClone(plan);
    const moved = followRenames(next, h, registry);
    if (!moved.length) return;
    this.unsavedFrom ??= this.baseJson;
    this.followed.push(...moved);
    if (this.savedPlan === plan) this.savedPlan = next;
    this.showPlan(next);
  }

  /** Check my setup for a plan (the editor's, or the one shown). */
  setupChecks(plan: Plan): Check[] {
    const h = this._hass!;
    return runChecks({
      plan, hass: h, repairs: this.repairs, server: this.server, version: __VERSION__,
      graphics: { tier: this.viewer.tier, auto: this.tierAuto, ...autoTierInfo() }, extensions: extensionFailures(),
    });
  }

  /** Asks the integration about the card, its version and the licence (admins only). */
  async refreshServer(fix = false): Promise<void> {
    window.clearTimeout(this.serverTimer);
    try {
      this.server = await this._hass!.callWS<ServerChecks>({ type: fix ? "virtuhome/checks/fix_card" : "virtuhome/checks" });
    } catch {
      this.server = null;
    }
    // Home Assistant is still starting: ask again until it knows about the card (for up to 5 minutes)
    if (!this.server?.dashboard.pending) this.serverTries = 0;
    else if (this.serverTries++ < 30) {
      this.serverTimer = window.setTimeout(() => void this.refreshServer().then(() => this.editor?.checksChanged()), 10_000);
    }
    this.updateChecks();
  }

  /** Lets Automatic graphics go back up after stepping down. */
  resetGraphics(): void {
    clearCap();
    this.setGraphics("auto");
  }

  /**
   * The problems Check my setup finds, for the dot on Edit (admins of the panel only). Runs when the
   * plan or Home Assistant's registries change, never per frame. The counts go to the integration
   * for the diagnostics file.
   */
  private updateChecks(): void {
    if (!this.canEdit() || !this.plan || this.editor) return;
    if (this.server === undefined) {
      this.server = null;
      this.refreshServer();
      return;
    }
    const checks = this.setupChecks(this.plan);
    const problems = checks.filter((c) => c.level === "problem").length;
    if (problems !== this.problems) {
      this.problems = problems;
      this.renderChips();
    }
    const counts = checkCounts(checks);
    const key = JSON.stringify(counts);
    if (this.server && key !== this.reported) {
      this.reported = key;
      this._hass!.callWS({ type: "virtuhome/checks", report: counts }).catch(() => undefined);
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
    this.skyLive.settings = plan.settings.sky ?? {};
    this.skyShown = "";
    this.live.setPlan(plan);
    if (this._hass) {
      if (this.energy.update(this._hass)) this.renderStatus();
      this.live.update(this.shown ?? this._hass);
    }
    if (!plan.floors.length) {
      if (this.editor) return;
      this.showFirstRun();
      this.renderChips();
      return;
    }
    // floors but no rooms yet (a picture to trace, an empty storey): still the first run
    if (isNewHome(plan) && !this.editor) this.showFirstRun();
    else this.hideFirstRun();
    this.hasPanels = plan.floors.some((f) => f.furniture.some((x) => x.type === "solar_panels")
      || (f.roofs ?? []).some((r) => (r.items ?? []).some((it) => it.kind === "solar")));
    this.roofBtn.hidden = !plan.floors.some((f) => (f.roofs ?? []).length > 0);
    this.updateRoofButton();
    this.hasEv = plan.floors.some((f) => f.furniture.some((x) => EV_TYPES.has(x.type)));
    // the plan is drawn with the chargers as they are now
    [this.evGlowKey, this.evLabelKey] = evKeys(this.energy.now);
    this.applyTheme();
    this.viewer.setPlan(this.shownPlan(plan), !first);
    if (this._hass) {
      this.viewer.setLive(this.live);
      this.started = true;
    }
    if (first) {
      const f = this.startFloor(plan);
      if (f >= 0) this.viewer.setMode("floor", f, false);
    }
    // the weather may have been switched off or another entity picked
    this.updateSky();
    this.renderChips();
    this.updateChecks();
    callEach(this.planListeners, plan);
  }

  private startFloor(plan: Plan): number {
    const want = this.config.floor;
    if (want === undefined || want === null || want === "") return -1;
    if (typeof want === "number") return Math.min(want, plan.floors.length - 1);
    return plan.floors.findIndex((f) => f.id === want || f.name.toLowerCase() === String(want).toLowerCase());
  }

  setConfig(config: ViewConfig): void {
    this.config = config;
    if (config.roof !== undefined && roofSetting() === null) {
      this.viewer.setRoof(config.roof !== false);
      this.updateRoofButton();
    }
    if (config.walls) {
      this.viewer.setWalls(config.walls);
      this.updateWallsButton();
    }
    this.applyTheme();
    this.renderChips();
  }

  connect(): void {
    this.subscribe();
    this.viewer.invalidate();
  }

  disconnect(): void {
    const u = this.unsub;
    this.unsub = null;
    u?.().catch(() => undefined);
    // leaving the page closes the demo home: its pretend devices stop, its graphics are let go
    this.closeDemo(false);
  }

  destroy(): void {
    this.endReplay();
    window.clearTimeout(this.themeTimer);
    window.clearTimeout(this.serverTimer);
    window.clearInterval(this.skyTimer);
    this.skyPanel.dispose();
    this.disconnect();
    this.unregister?.();
    this.unregister = null;
    this.unreport();
    window.clearInterval(this.statsTimer);
    window.clearInterval(this.todayTimer);
    this.barWatch?.disconnect();
    this.viewer.dispose();
  }

  // ------------------------------------------------------------------ sun and weather

  /**
   * The sky for the moment shown: now, a replay's moment (with the weather it recorded), or a date,
   * time and weather picked in the panel. The 3D view hears about it only when it looks different.
   */
  private updateSky(): void {
    const h = this.shown ?? this._hass;
    if (!h) return;
    const pick = this.skyPick;
    const past = !!this.replayed && !pick;
    const time = pick?.time ?? (past ? this.replayed!.time : Date.now());
    // a replay's states carry the weather of their moment (its registries and location are the live ones)
    this.skyLive.solar = this.energy.sources.solar;
    const sky: Sky = this.skyLive.sky(h, time, { pick: pick?.weather ?? null, past: past || pick?.time != null, solarKw: this.energy.now?.solar ?? null });
    if (!sky.sun) {
      // no location: sun.sun still knows where the sun is
      const a = (h.states["sun.sun"] ?? this._hass?.states["sun.sun"])?.attributes;
      if (a && typeof a.azimuth === "number" && typeof a.elevation === "number") sky.sun = { azimuth: a.azimuth, elevation: a.elevation };
    }
    const key = skyKey(sky);
    if (key === this.skyShown) return;
    this.skyShown = key;
    this.viewer.setSky(sky);
    this.skyPanel.render();
  }

  private toggleSkyPanel(): void {
    if (this.skyPanel.open) {
      this.skyPanel.close();
      return;
    }
    this.closeSheet();
    this.menu.hidden = true;
    this.skyPanel.show();
  }

  // ------------------------------------------------------------------ looks

  /** Day or night as set (the card, the plan, the button), or null: "auto", by the sun. */
  private themeSet(): "day" | "night" | null {
    if (this.themeOverride) return this.themeOverride;
    const t = this.config.theme ?? this.plan?.settings.theme ?? "auto";
    return t === "day" || t === "night" ? t : null;
  }

  private themeName(): "day" | "night" {
    const set = this.themeSet();
    if (set) return set;
    // a picked time shows day or night as it would be then
    const picked = this.skyPick?.time != null ? this.viewer.currentSky?.sun : null;
    if (picked) return picked.elevation > -0.833 ? "day" : "night";
    // a replay shows day or night as it was then
    const sun = (this.shown?.states["sun.sun"] ?? this._hass?.states["sun.sun"])?.state;
    if (sun) return sun === "below_horizon" ? "night" : "day";
    return this._hass?.themes?.darkMode ? "night" : "day";
  }

  private applyTheme(): void {
    const name = this.themeName();
    if ((this.replayed || this.skyPick?.time != null) && this.viewer.pal.name !== name) {
      // a new look crossfades (and rebuilds the model look): scrubbing back and forth over sunset
      // changes it at most every 300 ms; the realistic look's light follows the sky meanwhile
      this.themeTimer ||= window.setTimeout(() => {
        this.themeTimer = 0;
        this.setLook(this.themeName());
      }, 300);
      return;
    }
    window.clearTimeout(this.themeTimer);
    this.themeTimer = 0;
    this.setLook(name);
  }

  private setLook(name: "day" | "night"): void {
    this.root.classList.toggle("day", name === "day");
    this.live.day = name === "day";
    this.themeBtn.innerHTML = svg(name === "night" ? mdiWeatherNight : mdiWeatherSunny);
    // by the sun, the realistic look's light goes through dusk and dawn with it
    this.viewer.setTheme(name, this.themeSet() === null);
  }

  private cycleTheme(): void {
    this.themeOverride = this.themeName() === "night" ? "day" : "night";
    window.clearTimeout(this.themeTimer);
    this.themeTimer = 0;
    this.setLook(this.themeOverride);
    this.toast(t(this.themeOverride === "night" ? "view.look.night" : "view.look.day"));
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
    this.toast(t(auto ? "view.graphics.setAuto" : "view.graphics.set", { tier: tierName(tier) }));
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
    const autoName = parseTierSetting(this.config.quality) !== "auto" ? th("view.graphics.cardSetting", { tier: tierName(autoTier.tier) }) : esc(tierName(autoTier.tier));
    this.menu.innerHTML = `<div class="vh-menu-title">${th("view.graphics.title")}</div>` +
      row("auto", th("view.graphics.auto"), autoName) +
      TIERS.map((tier: Tier) => row(tier, esc(tierName(tier)), esc(tierHint(tier)))).join("");
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
    this.updateChecks();
    this.toast(t("view.graphics.slow", { tier: tierName(next) }));
  }

  private cycleWalls(): void {
    const next: Record<WallMode, WallMode> = { smart: "low", low: "full", full: "smart" };
    this.viewer.setWalls(next[this.viewer.walls]);
    this.updateWallsButton();
    this.toast(t(`view.walls.${this.viewer.walls}`));
  }

  /** The roof button: roofs over the house, or the house open to the sky. Kept per device. */
  private toggleRoof(): void {
    const on = !this.viewer.roofOn;
    this.viewer.setRoof(on);
    try {
      // the demo doesn't change the device's choice for the user's own home
      if (!this.config.demo) localStorage.setItem(ROOF_KEY, on ? "1" : "0");
    } catch {
      // private windows: the choice lasts until the page closes
    }
    this.updateRoofButton();
    this.viewer.frame(true);
    this.toast(t(on ? "view.roof.on" : "view.roof.off"));
  }

  private updateRoofButton(): void {
    this.roofBtn.classList.toggle("on", this.viewer.roofOn);
    this.roofBtn.title = t(this.viewer.roofOn ? "view.roof.onTap" : "view.roof.offTap");
  }

  private updateWallsButton(): void {
    const mode = this.viewer.walls;
    this.wallsBtn.classList.toggle("on", mode !== "full");
    this.wallsBtn.innerHTML = svg(WALL_ICONS[mode]);
    this.wallsBtn.title = t("view.walls.tap", { walls: t(`view.walls.${mode}`) });
  }

  // ------------------------------------------------------------------ floors, rooms and gestures

  private canEdit(): boolean {
    return !!this.config.editable && (this._hass?.user?.is_admin ?? false);
  }

  private renderChips(): void {
    const edit = () => {
      if (!this.canEdit() || this.editor) return;
      const b = document.createElement("button");
      b.className = `vh-chip vh-edit${this.problems ? " dot" : ""}`;
      b.innerHTML = `${svg(mdiPencilOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}${th("view.edit")}`;
      if (this.problems) b.title = t("view.editProblems");
      b.onclick = () => this.openEditor();
      const spacer = document.createElement("span");
      spacer.className = "vh-spacer";
      this.chips.append(spacer, b);
    };
    if (!this.plan || !this.plan.floors.length || this.config.floor_chips === false) {
      this.chips.innerHTML = "";
      this.valueChips();
      edit();
      return;
    }
    const house = this.viewer.mode === "house";
    const parts = [`<button class="vh-chip ${house ? "on" : ""}" data-floor="-1">${svg(mdiHomeOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}${th("view.house")}</button>`];
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
    this.valueChips();
    edit();
  }

  /** The chosen values (the card's `chips`, else the plan's): each opens its dialog. */
  private valueChips(): void {
    const h = this.shown;
    for (const id of barChips(this.config.chips, this.plan)) {
      const b = document.createElement("button");
      b.className = "vh-chip vh-value";
      b.dataset.entity = id;
      b.onclick = () => this.dialog(id);
      this.chips.append(b);
      if (h) this.drawValueChip(b, h);
    }
  }

  /** A value chip's icon, value and name, redrawn only when they change. */
  private drawValueChip(b: HTMLElement, h: Hass): void {
    const id = b.dataset.entity!;
    const text = valueText(h, id);
    const icon = readingIcon(h, id);
    if (b.dataset.text === text && b.dataset.icon === icon) return;
    b.dataset.text = text;
    b.dataset.icon = icon;
    const path = (ICONS.find(([n]) => n === icon) ?? ICONS[0])[1];
    b.innerHTML = `${svg(path).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}<span></span>`;
    b.querySelector("span")!.textContent = text;
    b.title = String(h.states[id]?.attributes.friendly_name ?? id);
  }

  /** The top bar's values follow their states without redrawing the bar (a press on it is never lost). */
  private updateBarValues(h: Hass): void {
    this.chips.querySelectorAll<HTMLElement>(".vh-value").forEach((b) => this.drawValueChip(b, h));
  }

  private alarmChip(): void {
    const h = this.shown;
    const id = h ? this.alarmEntity(h) : null;
    const s = id ? h!.states[id] : undefined;
    if (!id || !s) return;
    const armed = s.state.startsWith("armed");
    const alert = s.state === "triggered" || s.state === "pending" || s.state === "arming";
    const b = document.createElement("button");
    b.className = `vh-chip vh-alarm ${armed ? "armed" : ""} ${alert ? "alert" : ""}`;
    b.innerHTML = `${svg(alert ? mdiShieldAlert : armed ? mdiShieldHome : mdiShieldOffOutline).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}<span></span>`;
    const state = ALARM_STATES.find((x) => x === s.state);
    b.querySelector("span")!.textContent = state ? t(`alarm.${state}`) : s.state;
    b.onclick = () => this.dialog(id);
    this.chips.append(b);
  }

  async openEditor(): Promise<void> {
    if (this.editor || !this._hass) return;
    // the editor works on the house as it is now
    this.endReplay();
    this.closeSheet();
    this.hideFirstRun();
    const { Editor } = await import("../editor/editor");
    const hass = this._hass;
    const editor = new Editor({
      view: this,
      hass,
      plan: this.plan ?? normalizePlan({ version: 1, floors: [] }),
      revision: this.revision,
      demo: !!this.config.demo,
      savedJson: this.unsavedFrom ?? undefined,
      followed: this.followed,
      save: async (plan, base) => {
        const refused = saveRefused(this.config, !!this.demo);
        if (refused) throw new Error(refused);
        const saved = (revision: number) => {
          this.baseJson = JSON.stringify(plan);
          this.unsavedFrom = null;
          this.followed = [];
          return revision;
        };
        if (this.config.save) return saved(await this.config.save(plan));
        const res = await hass.callWS<{ revision: number }>({ type: "virtuhome/plan/save", plan, ...(base !== null ? { base_revision: base } : {}) });
        this.revision = res.revision;
        this.savedPlan = plan;
        return saved(res.revision);
      },
      restorePoints: this.config.save || this.config.demo ? undefined : () => hass.callWS({ type: "virtuhome/history/list" }),
      restore: this.config.save || this.config.demo ? undefined : async (id) => {
        await hass.callWS({ type: "virtuhome/history/restore", snapshot_id: id });
      },
      close: () => {
        this.editor = null;
        this.root.classList.remove("editing");
        if (this.savedPlan) this.applyPlan(this.savedPlan);
        else if (this.plan && !this.plan.floors.length) this.applyPlan(this.plan);
        this.renderChips();
        this.updateChecks();
      },
    });
    this.editor = editor;
    // every car is shown while editing, here or not
    if (this.awayKey && this.plan) this.viewer.setPlan(this.shownPlan(this.plan), true);
    this.root.classList.add("editing");
    this.root.append(editor.el);
    this.renderChips();
  }

  /** Home Assistant's dialog for an entity. The demos have none: their devices are pretend. */
  private dialog(entityId: string): void {
    if (this.config.demo) this.toast(t("demo.noDialogs"));
    else moreInfo(this.root, entityId);
  }

  /** Whether the demo home shows over this view. */
  get demoShown(): boolean {
    return !!this.demo;
  }

  /**
   * Look at the demo home: the demo house in a view of its own over this one, with its own pretend
   * states. This view, its plan, the editor and Home Assistant's states carry on underneath, hidden.
   */
  async openDemo(): Promise<void> {
    if (this.demo || this.config.demo) return;
    const { openDemo } = await import("./demo");
    if (this.demo) return;
    this.closeSheet();
    this.menu.hidden = true;
    if (this.skyPanel.open) this.skyPanel.close();
    const c = this._hass?.config;
    const place = typeof c?.latitude === "number" && typeof c.longitude === "number" ? { latitude: c.latitude, longitude: c.longitude, time_zone: c.time_zone } : undefined;
    this.demo = openDemo(VhView, this.root, this.config, place, (start) => this.closeDemo(start));
    this.root.classList.add("vh-demo-on");
  }

  /** Back to the user's home: Start my own home goes on to the editor. */
  private closeDemo(start: boolean): void {
    const demo = this.demo;
    if (!demo) return;
    this.demo = null;
    demo.close();
    this.root.classList.remove("vh-demo-on");
    // a graphics level picked in the demo is this device's, so this view takes it too
    const { tier, auto } = resolveTier(parseTierSetting(this.config.quality));
    this.tierAuto = auto;
    if (tier !== this.viewer.tier) {
      this.viewer.setTier(tier);
      this.ensureLook();
    }
    // the realistic look's weather and lamp light are shared by the views: this one's again
    const sky = this.viewer.currentSky;
    if (sky) this.viewer.setSky(sky);
    if (start && !this.editor) void this.openEditor();
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
      if (this.skyPanel.open) this.skyPanel.close();
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
    if (this.replayed) {
      // the past can be looked around in, but nothing is switched: the replay gets the tap
      const r = this.replayed;
      const entity = hit.kind === "marker" || hit.kind === "lamp" || hit.kind === "entity" ? hit.entity : null;
      if (!entity && hit.kind === "room" && gesture === "tap" && this.viewer.mode === "house") {
        this.viewer.setMode("floor", hit.floor);
        this.renderChips();
      }
      if (!entity && hit.kind === "empty") {
        if (gesture === "double") this.showHouse();
        else if (this.viewer.selectedRoom >= 0) this.viewer.selectRoom(this.viewer.activeFloor, -1, false);
      }
      r.options.onHit?.({ floor: hit.floor, room: hit.kind === "empty" ? -1 : hit.room, entity }, gesture);
      return;
    }
    // a switch with several gangs: a menu of them (a long press opens their dialogs from it)
    if (hit.entities && hit.entities.length > 1 && gesture !== "double") return this.entityMenu(hit.entities, hit.at, gesture === "long");
    if (hit.entity && (hit.kind === "marker" || hit.kind === "lamp" || hit.kind === "entity")) {
      if (gesture === "long") return this.dialog(hit.entity);
      if (gesture === "double") return;
      const done = await toggleEntity(hass, hit.entity).catch(() => false);
      if (!done) this.dialog(hit.entity);
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

  /** A small menu by the finger: each entity with its state; a tap switches it (or opens its dialog). */
  private entityMenu(ids: string[], at: [number, number] | undefined, dialogs: boolean): void {
    const hass = this._hass;
    if (!hass) return;
    const pop = this.pop;
    pop.replaceChildren(...ids.map((id) => {
      const b = document.createElement("button");
      b.className = "vh-menu-row";
      b.innerHTML = "<span><b></b><small></small></span>";
      b.querySelector("b")!.textContent = this.nameOf(id);
      b.querySelector("small")!.textContent = valueText(hass, id);
      b.onclick = async () => {
        pop.hidden = true;
        if (dialogs) return this.dialog(id);
        if (await toggleEntity(hass, id).catch(() => false)) this.toast(this.nameOf(id));
        else this.dialog(id);
      };
      return b;
    }));
    pop.hidden = false;
    // under the finger, kept inside the view
    const [x, y] = at ?? [this.root.clientWidth / 2, this.root.clientHeight / 2];
    pop.style.left = `${Math.max(8, Math.min(this.root.clientWidth - pop.offsetWidth - 8, x - pop.offsetWidth / 2))}px`;
    pop.style.top = `${Math.max(8, Math.min(this.root.clientHeight - pop.offsetHeight - 8, y + 16))}px`;
  }

  private async toggleRoomLights(fi: number, ri: number): Promise<void> {
    const floor = this.plan?.floors[fi];
    const room = floor ? spaces(floor)[ri] : undefined;
    if (!floor || !room || !this._hass) return;
    const lights = this.live.roomLights(floor, room);
    if (!lights.length) return this.toast(t("view.room.noLights", { room: room.name }));
    const anyOn = lights.some((id) => this._hass!.states[id]?.state === "on");
    await this._hass.callService("light", anyOn ? "turn_off" : "turn_on", {}, { entity_id: lights });
    this.toast(t(anyOn ? "view.room.lightsOff" : "view.room.lightsOn", { room: room.name }));
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

  /** A home with no rooms: the ways to get it in for those who can edit, else who can. */
  private firstRunKey(): string {
    return `${this.canEdit()}|${this._hass?.user?.is_admin ?? "?"}`;
  }

  private hideFirstRun(): void {
    this.firstRun = "";
    this.empty.hidden = true;
    this.root.classList.remove("vh-new");
  }

  private showFirstRun(): void {
    this.firstRun = this.firstRunKey();
    // nothing to see yet: the ground alone looks broken behind the choices
    this.root.classList.add("vh-new");
    if (!this.canEdit()) {
      this.showEmpty(t("view.noHome.title"), t(this._hass?.user?.is_admin ? "view.noHome.admin" : "view.noHome.user"));
      return;
    }
    this.empty.hidden = false;
    const box = document.createElement("div");
    box.className = "vh-start";
    box.innerHTML = `<h2>${th("start.title")}</h2><p>${th("start.text")}</p>`;
    for (const kind of START_CHOICES) {
      const b = document.createElement("button");
      b.className = "vh-start-choice";
      b.innerHTML = `<b></b><span></span>`;
      b.querySelector("b")!.textContent = t(`start.${kind}.title`);
      b.querySelector("span")!.textContent = t(`start.${kind}.text`);
      b.onclick = () => void this.openEditor().then(() => this.editor?.startSetup(kind));
      box.append(b);
    }
    if (!this.config.demo) {
      const demo = document.createElement("button");
      demo.className = "vh-start-demo";
      demo.textContent = t("start.demo.title");
      demo.title = t("start.demo.text");
      demo.onclick = () => void this.openDemo();
      box.append(demo);
    }
    this.empty.replaceChildren(box);
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
    const here = hereText(this.config.people === false || this.replayed ? [] : this.live.roomPeople(floor, room).map((p) => p.name));
    const lights = this.live.roomLights(floor, room);
    const anyOn = lights.some((id) => hass.states[id]?.state === "on");
    const key = `${room.id}|${ids.join(",")}|${anyOn}|${text}|${here}`;
    if (this.sheet.dataset.key === key) {
      this.sheet.querySelectorAll<HTMLElement & { hass?: unknown }>("[data-tile]").forEach((t) => (t.hass = hass));
      this.updateRows(hass);
      return;
    }
    this.sheet.dataset.key = key;
    this.sheet.innerHTML = `
      <h3><span class="t"></span><button class="vh-icon vh-close" style="width:32px;height:32px" title="${th("view.close")}">${svg(mdiClose)}</button></h3>
      <div class="sub"></div>
      <div class="actions"></div>
      <div class="vh-tiles"></div>`;
    this.sheet.querySelector(".t")!.textContent = room.name;
    this.sheet.querySelector(".sub")!.textContent = [text, here, room.area_id ? null : t("view.room.notLinked")].filter(Boolean).join(" · ") || " ";
    this.sheet.querySelector<HTMLButtonElement>(".vh-close")!.onclick = () => this.closeSheet();
    const actions = this.sheet.querySelector(".actions")!;
    if (lights.length) {
      const b = document.createElement("button");
      b.className = "vh-chip";
      b.innerHTML = `${svg(anyOn ? mdiLightbulbGroupOff : mdiLightbulbGroup).replace("<svg", '<svg width="16" height="16" style="fill:currentColor"')}<span></span>`;
      b.querySelector("span")!.textContent = t(anyOn ? "view.room.allOff" : "view.room.allOn");
      b.onclick = () => this.toggleRoomLights(this.sheetRoom!.floor, this.sheetRoom!.room);
      actions.appendChild(b);
    }
    const grid = this.sheet.querySelector(".vh-tiles")!;
    // the demo's devices are pretend: Home Assistant's tiles would open its own dialogs for them
    const helpers = this.config.demo ? undefined : (window as unknown as { loadCardHelpers?: () => Promise<never> }).loadCardHelpers;
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
        const row = document.createElement("button");
        row.className = "vh-row";
        row.dataset.row = id;
        row.innerHTML = `<span class="n"></span><span class="state"></span>`;
        row.querySelector(".n")!.textContent = this.nameOf(id);
        row.onclick = async () => {
          if (!(await toggleEntity(hass, id).catch(() => false))) this.dialog(id);
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
