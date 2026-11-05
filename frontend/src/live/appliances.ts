// Washing machines, dryers and dishwashers: whether one runs, what it does and when it finishes. A
// piece is linked to any entity of the appliance; the others of its device are read too, so this works
// with whatever its integration has: Home Connect, Miele, LG ThinQ, SmartThings, a "running" binary
// sensor, or a smart plug's power.
import { t } from "../i18n";
import type { Hass, HassEntity } from "./hass";
import { APPLIANCE_DOMAINS, APPLIANCE_TYPES } from "../scene/devices";

export { APPLIANCE_DOMAINS, APPLIANCE_TYPES };
/** A plug drawing more than this (W) means the machine runs. */
export const RUNNING_WATTS = 8;

export type RunState = "idle" | "waiting" | "running" | "paused" | "done" | "error";

export interface ApplianceNow {
  state: RunState;
  /** The programme or the phase it is in ("Cotton", "Rinse"), or null. */
  programme: string | null;
  /** When it finishes (ms), or null. */
  ends: number | null;
  /** The entity that says what it does. */
  entity: string;
}

/** Run states as integrations write them, folded to ours. */
const WORDS: [RunState, RegExp][] = [
  ["done", /^(finished|finish|end|ended|program_?ended|complete|completed|done|cycle_?finished)$/],
  ["error", /^(error|failure|fault|action_?required|program_?interrupted|aborting|service)$/],
  ["paused", /^(pause|paused|rinse_?hold)$/],
  ["waiting", /^(delayed_?start|waiting_?to_?start|reserved|programmed|scheduled)$/],
  ["running", /^(run|running|in_?use|washing|wash|main_?wash|pre_?wash|soak|rinse|rinsing|spin|spinning|drying|dry|cooling|detecting|steam|heating|refreshing|cleaning|auto_?cleaning|drain|draining)$/],
  ["idle", /^(off|power_?off|inactive|ready|idle|initial|standby|on|stop|stopped|none|not_?running)$/],
];

/** Our run state for a state word, or null when it isn't one. */
export function runWord(state: string): RunState | null {
  const w = state.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return WORDS.find(([, re]) => re.test(w))?.[0] ?? null;
}

/** Entity ids that say what a machine does, best first. */
const STATE_IDS = [/_operation_state$/, /_status$/, /_current_status$/, /_machine_state$/, /_run_state$/, /_job_state$/, /_state$/];
/** Ids of what it runs: a programme, a course, a cycle, or its phase. */
const PROGRAMME_IDS = /_(active_|selected_)?(program|programme|program_name|course|cycle)$/;
const PHASE_IDS = /_(program_phase|phase|job_state|washer_job_state|dryer_job_state|run_state_detail)$/;
const ENDS_IDS = /(remaining|finish|end|completion|done)/;

/** The appliance's entities: those of the linked entity's device, else the linked one alone. */
export function applianceEntities(hass: Hass, entity: string | null | undefined): string[] {
  if (!entity) return [];
  const dev = hass.entities?.[entity]?.device_id;
  if (!dev) return [entity];
  const ids = Object.values(hass.entities ?? {}).filter((e) => e.device_id === dev && !e.hidden).map((e) => e.entity_id);
  return ids.includes(entity) ? ids : [entity, ...ids];
}

/** "cotton_eco_40" → "Cotton eco 40"; Home Connect's "dishcare_dishwasher_program_eco_50" → "Eco 50". */
export function programmeName(raw: string): string | null {
  if (!raw || /^(unknown|unavailable|none|off|null|0)$/i.test(raw)) return null;
  const tail = raw.includes(".") ? raw.split(".").pop()! : raw;
  const cut = /_program_(.+)$/i.exec(tail)?.[1] ?? tail;
  const words = cut.replace(/[_-]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1).toLowerCase() : null;
}

/** When it finishes (ms) from a timestamp or a time left (minutes, hours, seconds, or "h:mm:ss"). */
export function endsAt(s: HassEntity, now: number): number | null {
  const v = s.state;
  if (!v || v === "unknown" || v === "unavailable") return null;
  if (s.attributes.device_class === "timestamp") {
    const t = Date.parse(v);
    return Number.isFinite(t) && t > now - 60_000 ? t : null;
  }
  const hms = /^(\d+):(\d{2})(?::(\d{2}))?$/.exec(v);
  if (hms) return now + ((Number(hms[1]) * 60 + Number(hms[2])) * 60 + Number(hms[3] ?? 0)) * 1000;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  const unit = String(s.attributes.unit_of_measurement ?? "min");
  const ms = /^h/.test(unit) ? n * 3_600_000 : /^(s|sec)/.test(unit) ? n * 1000 : /^d/.test(unit) ? n * 86_400_000 : n * 60_000;
  return now + ms;
}

/** Which appliance a device's name says it is: a washer-dryer counts as a washing machine. */
export function applianceKind(name: string): "washer" | "dryer" | "dishwasher" | null {
  const n = name.toLowerCase();
  if (/dish ?washer|geschirr|vaatwas|lave-vaisselle/.test(n)) return "dishwasher";
  if (/washing|washer|laundry|waschmaschine|wasmachine|lave-linge/.test(n)) return "washer";
  if (/dryer|tumble|trockner|droger|sèche-linge|seche-linge/.test(n)) return "dryer";
  return null;
}

/** What the appliance does now, or null when nothing linked says (or it can't be reached). */
export function applianceNow(hass: Hass, ids: string[], now = Date.now()): ApplianceNow | null {
  const states = ids.map((id) => hass.states[id]).filter((s): s is HassEntity => !!s && s.state !== "unavailable");
  if (!states.length) return null;
  // the run state: the best named entity whose state reads as one, else a running sensor, else a plug's power
  let state: RunState | null = null;
  let entity = states[0].entity_id;
  const worded = states.filter((s) => /^(sensor|select)\./.test(s.entity_id) && runWord(s.state) !== null)
    .sort((a, b) => rankOf(a.entity_id) - rankOf(b.entity_id));
  if (worded.length) {
    state = runWord(worded[0].state);
    entity = worded[0].entity_id;
  } else {
    const running = states.find((s) => s.entity_id.startsWith("binary_sensor.") && (s.attributes.device_class === "running" || s.attributes.device_class === "power" || /_(running|run|in_use|active)$/.test(s.entity_id)));
    const power = states.find((s) => s.entity_id.startsWith("sensor.") && s.attributes.device_class === "power");
    if (running) {
      state = running.state === "on" ? "running" : "idle";
      entity = running.entity_id;
    } else if (power && Number.isFinite(Number(power.state))) {
      const w = Number(power.state) * (/^kW$/i.test(String(power.attributes.unit_of_measurement ?? "W")) ? 1000 : 1);
      state = w > RUNNING_WATTS ? "running" : "idle";
      entity = power.entity_id;
    }
  }
  if (!state) return null;
  let programme: string | null = null;
  let ends: number | null = null;
  if (state === "running" || state === "paused" || state === "waiting") {
    const phase = states.find((s) => s.entity_id !== entity && PHASE_IDS.test(s.entity_id.split(".")[1]) && runWord(s.state) !== "idle");
    const prog = states.find((s) => PROGRAMME_IDS.test(s.entity_id.split(".")[1]));
    programme = (phase && programmeName(phase.state)) || (prog && programmeName(prog.state)) || null;
    for (const s of states) {
      if (!ENDS_IDS.test(s.entity_id) || !/^sensor\./.test(s.entity_id)) continue;
      if (s.attributes.device_class !== "timestamp" && s.attributes.device_class !== "duration" && !/^\d+:\d{2}/.test(s.state)) continue;
      ends = endsAt(s, now);
      if (ends !== null) break;
    }
  }
  return { state, programme, ends, entity };
}

/** How well an entity's id says it's the machine's state: Miele's is the device's own name, its phase comes last. */
function rankOf(id: string): number {
  const name = id.split(".")[1];
  if (PHASE_IDS.test(name)) return STATE_IDS.length + 1;
  const i = STATE_IDS.findIndex((re) => re.test(name));
  return i < 0 ? STATE_IDS.length : i;
}

/** The glow of its display: blue while it runs, green when done, red on a fault. */
export function applianceGlow(a: ApplianceNow | null): [number, number, number] | null {
  if (!a) return null;
  if (a.state === "running") return [0.35, 0.65, 1.0];
  if (a.state === "done") return [0.25, 0.9, 0.45];
  if (a.state === "error") return [1.0, 0.18, 0.12];
  if (a.state === "paused" || a.state === "waiting") return [1.0, 0.7, 0.2];
  return null;
}

/** "14 min", "1 h 05". */
export function timeLeft(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60_000));
  return min < 60 ? t("appliance.min", { n: min }) : t("appliance.hours", { h: Math.floor(min / 60), m: String(min % 60).padStart(2, "0") });
}

/** What its label says: nothing while idle. */
export function applianceText(a: ApplianceNow | null, now = Date.now()): string | null {
  if (!a) return null;
  const left = a.ends !== null && a.ends > now ? timeLeft(a.ends - now) : null;
  switch (a.state) {
    case "running": {
      const what = a.programme ?? t("appliance.running");
      return left ? t("appliance.left", { what, left }) : what;
    }
    case "paused":
      return t("appliance.paused");
    case "waiting":
      return t("appliance.waiting");
    case "done":
      return t("appliance.done");
    case "error":
      return t("appliance.error");
    default:
      return null;
  }
}
