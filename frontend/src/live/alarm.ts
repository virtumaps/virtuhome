// The alarm: what each panel can be armed to and whether it wants a code, the doors and windows
// left open in what it covers, and what set it off. Alarmo says the last two itself
// (`open_sensors`); for other panels they are worked out from the sensors in its area.
import { areaOf, domainOf, type Hass, type HassEntity } from "./hass";

/** The ways to arm, each with its feature bit and service (Home Assistant's AlarmControlPanelEntityFeature). */
export const ARM_MODES = [
  { state: "armed_home", bit: 1, service: "alarm_arm_home" },
  { state: "armed_away", bit: 2, service: "alarm_arm_away" },
  { state: "armed_night", bit: 4, service: "alarm_arm_night" },
  { state: "armed_vacation", bit: 32, service: "alarm_arm_vacation" },
] as const;
export type ArmMode = (typeof ARM_MODES)[number];

/** The ways a panel can be armed (home and away when it doesn't say). */
export function armModes(s: HassEntity | undefined): ArmMode[] {
  const f = s?.attributes.supported_features;
  return typeof f === "number" ? ARM_MODES.filter((m) => f & m.bit) : ARM_MODES.filter((m) => m.bit <= 2);
}

/** Whether arming (or disarming) asks for the panel's code. */
export function wantsCode(s: HassEntity | undefined, arming: boolean): boolean {
  return !!s?.attributes.code_format && (!arming || s.attributes.code_arm_required !== false);
}

/** Whether a code is digits only (the box then shows a number pad). */
export const numericCode = (s: HassEntity | undefined): boolean => s?.attributes.code_format === "number";

const OPENINGS = new Set(["door", "window", "opening", "garage_door"]);
const MOVEMENT = new Set(["motion", "occupancy", "presence"]);
const classOf = (s: HassEntity | undefined) => String(s?.attributes.device_class ?? "");

/** The alarm panels Home Assistant has: an Alarmo house panel before its areas' (it is the shortest id). */
export function alarmPanels(hass: Hass): string[] {
  return Object.keys(hass.states).filter((id) => domainOf(id) === "alarm_control_panel").sort((a, b) => a.length - b.length || a.localeCompare(b));
}

/** The area a panel covers, or null for the whole home (a panel in no area). */
export function panelArea(hass: Hass, panel: string): string | null {
  return areaOf(hass, panel);
}

/** Alarmo's sensors, from its `open_sensors` (an object of entity ids, or a list): null when the panel doesn't say. */
function alarmoSensors(s: HassEntity | undefined): string[] | null {
  const o = s?.attributes.open_sensors;
  if (Array.isArray(o)) return o.filter((x): x is string => typeof x === "string");
  if (o && typeof o === "object") return Object.keys(o);
  return null;
}

/** Sensors of a kind in what a panel covers: its area, or the whole home. */
function covered(hass: Hass, panel: string, kinds: Set<string>): string[] {
  const area = panelArea(hass, panel);
  return Object.keys(hass.states).filter((id) =>
    domainOf(id) === "binary_sensor" && kinds.has(classOf(hass.states[id])) && (!area || areaOf(hass, id) === area));
}

/** The doors and windows open in what a panel covers: Alarmo's own list when it has one (arming failed), else those that are on. */
export function openSensors(hass: Hass, panel: string): string[] {
  const own = alarmoSensors(hass.states[panel]);
  if (own?.length) return own.filter((id) => hass.states[id]);
  return covered(hass, panel, OPENINGS).filter((id) => hass.states[id].state === "on");
}

/**
 * What set a triggered alarm off: Alarmo says (its open sensors); else the door, window or motion
 * sensor in what the panel covers that last turned on before it went off, up to 10 minutes before
 * (an entry delay). Null while it isn't triggered or nothing fits.
 */
export function whatSetItOff(hass: Hass, panel: string): string | null {
  const s = hass.states[panel];
  if (s?.state !== "triggered") return null;
  const own = alarmoSensors(s);
  if (own?.length) return own.find((id) => hass.states[id]) ?? null;
  const at = Date.parse(s.last_changed);
  let best: string | null = null;
  let when = -Infinity;
  for (const id of covered(hass, panel, new Set([...OPENINGS, ...MOVEMENT]))) {
    const x = hass.states[id];
    const t = Date.parse(x.last_changed);
    // it turned on (and may have turned off since: someone walked through)
    if (!isFinite(t) || t > at + 2000 || t < at - 600_000) continue;
    if (x.state !== "on" && t > at) continue;
    if (t > when) {
      when = t;
      best = id;
    }
  }
  return best;
}
