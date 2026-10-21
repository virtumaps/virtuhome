// A pretend day in the demo house, for replays in the dev harness and the online demo: both leave
// for work and the alarm is set, a parcel comes, someone lets the dog out at lunchtime, everyone is
// home by the evening. It answers Home Assistant's history/history_during_period the way the
// recorder does, every day the same story with its times shifted a little.
import type { HassEntity } from "../live/hass";

type Attrs = Record<string, unknown>;
/** Minutes after the scene starts, the entity, its new state (and attributes). */
type Step = [number, string, string, Attrs?];

/** The recorder's compact rows: state, attributes, last updated (and last changed) in seconds. */
export interface Row {
  s: string;
  a?: Attrs;
  lu: number;
  lc?: number;
}

const WARM = { brightness: 190, color_temp_kelvin: 2700 };
const DIM = { brightness: 90, color_temp_kelvin: 2400 };

/** The house at midnight: asleep, the alarm set for the night. */
const NIGHT: Record<string, [string, Attrs?]> = {
  "alarm_control_panel.home": ["armed_home"],
  "person.alex": ["home"],
  "person.sam": ["home"],
  "cover.bedroom_curtains": ["closed", { current_position: 0 }],
  "media_player.living_room_tv": ["off"],
  "climate.thermostat": ["heat", { hvac_action: "idle", current_temperature: 18.5, temperature: 17 }],
};

/** "on" now and "off" after some minutes. */
const pulse = (at: number, id: string, minutes: number, on = "on", off = "off", attrs?: Attrs): Step[] => [[at, id, on, attrs], [at + minutes, id, off]];

/** Scenes: when they start (minutes after midnight) and what happens in them. */
const SCENES: [number, Step[]][] = [
  // getting up
  [400, [
    [0, "alarm_control_panel.home", "disarmed"],
    ...pulse(1, "binary_sensor.landing_motion", 2),
    ...pulse(2, "light.bedside_left", 13, "on", "off", { brightness: 110, color_temp_kelvin: 2500 }),
    ...pulse(5, "light.stairs", 5, "on", "off", WARM),
    ...pulse(6, "binary_sensor.hall_motion", 6),
    ...pulse(7, "binary_sensor.kitchen_camera_motion", 11),
    [-10, "climate.thermostat", "heat", { hvac_action: "heating", current_temperature: 18.4, temperature: 20 }],
    [65, "climate.thermostat", "heat", { hvac_action: "idle", current_temperature: 20.1, temperature: 17 }],
    ...pulse(25, "binary_sensor.bathroom_window", 30),
    [50, "cover.bedroom_curtains", "open", { current_position: 100 }],
  ]],
  // Sam leaves for work
  [480, [
    ...pulse(-2, "binary_sensor.hall_motion", 5),
    ...pulse(2, "binary_sensor.front_door", 1),
    [2, "person.sam", "Work"],
  ]],
  // Alex leaves, the alarm is set
  [510, [
    ...pulse(-12, "binary_sensor.landing_motion", 2),
    ...pulse(1, "binary_sensor.hall_motion", 3),
    ...pulse(4, "binary_sensor.front_door", 1),
    [4, "person.alex", "not_home"],
    [5, "alarm_control_panel.home", "arming"],
    [6, "alarm_control_panel.home", "armed_away"],
  ]],
  // a parcel
  [612, [
    ...pulse(0, "binary_sensor.doorbell_motion", 1),
    ...pulse(0.67, "binary_sensor.doorbell_ding", 0.17),
    ...pulse(2, "binary_sensor.doorbell_motion", 1),
  ]],
  // the dog walker lets themselves in and takes the dog to the garden
  [782, [
    ...pulse(0, "binary_sensor.front_door", 0.67),
    [0.03, "alarm_control_panel.home", "pending"],
    [0.33, "alarm_control_panel.home", "disarmed"],
    ...pulse(0.17, "binary_sensor.hall_motion", 4),
    ...pulse(1, "binary_sensor.kitchen_camera_motion", 6),
    ...pulse(2, "binary_sensor.garden_door", 12),
    ...pulse(3, "binary_sensor.utility_motion", 2),
    ...pulse(14, "binary_sensor.hall_motion", 3),
    ...pulse(16, "binary_sensor.front_door", 1),
    [17.5, "alarm_control_panel.home", "arming"],
    [18, "alarm_control_panel.home", "armed_away"],
  ]],
  // someone walking past
  [947, [...pulse(0, "binary_sensor.doorbell_motion", 1)]],
  // Alex comes home
  [1061, [
    ...pulse(0, "binary_sensor.doorbell_motion", 2),
    ...pulse(1, "binary_sensor.front_door", 1),
    [1.08, "alarm_control_panel.home", "pending"],
    [1.42, "alarm_control_panel.home", "disarmed"],
    [1, "person.alex", "home"],
    ...pulse(2, "binary_sensor.hall_motion", 4),
    [9, "light.living_room_ceiling", "on", WARM],
    [0, "climate.thermostat", "heat", { hvac_action: "heating", current_temperature: 18.9, temperature: 20.5 }],
    [220, "climate.thermostat", "heat", { hvac_action: "idle", current_temperature: 20.6, temperature: 17 }],
  ]],
  // after sunset
  [1085, [
    [5, "light.living_room_floor_lamp", "on", WARM],
    [5, "light.fireplace_strip", "on", { brightness: 140, rgb_color: [255, 120, 40] }],
    [6, "light.living_room_ceiling", "off"],
    [20, "cover.bedroom_curtains", "closed", { current_position: 0 }],
  ]],
  // Sam comes home
  [1110, [
    ...pulse(0, "binary_sensor.doorbell_motion", 1),
    ...pulse(1, "binary_sensor.front_door", 1),
    [1, "person.sam", "home"],
    ...pulse(2, "binary_sensor.hall_motion", 3),
    ...pulse(6, "light.stairs", 2, "on", "off", WARM),
    ...pulse(7, "binary_sensor.landing_motion", 2),
  ]],
  // the evening
  [1170, [
    ...pulse(0, "media_player.living_room_tv", 165, "playing", "off"),
    ...pulse(0, "light.living_room_downlights", 170, "on", "off", DIM),
  ]],
  // the dog goes out
  [1210, [
    ...pulse(-1, "switch.deck_lights", 5),
    ...pulse(0, "binary_sensor.garden_door", 2),
  ]],
  // bed
  [1340, [
    [0, "light.living_room_floor_lamp", "off"],
    [0, "light.fireplace_strip", "off"],
    ...pulse(0, "light.stairs", 3, "on", "off", WARM),
    ...pulse(1, "binary_sensor.landing_motion", 3),
    ...pulse(2, "light.bedside_left", 43, "on", "off", DIM),
    ...pulse(2, "light.bedside_right", 38, "on", "off", DIM),
    ...pulse(3, "binary_sensor.bedroom_3_motion", 2),
    [20, "alarm_control_panel.home", "armed_home"],
  ]],
];

/** A fixed shuffle per day and scene, so each day differs a little and every load of a day matches. */
function jitter(day: number, scene: number): number {
  const x = Math.sin(day * 127.1 + scene * 311.7) * 43758.5453;
  return Math.round((x - Math.floor(x) - 0.5) * 12);
}

/** Sunrise 07:25, sunset 18:05: the sun's state and position at a minute of the day. */
function sunAt(minute: number): [string, Attrs] {
  const rise = 445, set = 1085, night = 1440 - set + rise;
  const up = minute >= rise && minute < set;
  // how far through the day (or the night) it is, 0..1
  const k = up ? (minute - rise) / (set - rise) : ((minute - set + 1440) % 1440) / night;
  const elevation = up ? 26 * Math.sin(Math.PI * k) : -2 - 30 * Math.sin(Math.PI * k);
  const azimuth = up ? 110 + 140 * k : (250 + 220 * k) % 360;
  return [up ? "above_horizon" : "below_horizon", { azimuth: Math.round(azimuth * 10) / 10, elevation: Math.round(elevation * 10) / 10, friendly_name: "Sun" }];
}

interface Change {
  t: number;
  id: string;
  s: string;
  a?: Attrs;
}

/** Every change of one day (local midnight `midnight`, in ms). */
function dayChanges(midnight: number): Change[] {
  const day = Math.round(midnight / 86_400_000);
  const out: Change[] = [];
  SCENES.forEach(([start, steps], i) => {
    const base = start + jitter(day, i);
    for (const [m, id, s, a] of steps) out.push({ t: midnight + Math.round((base + m) * 60_000), id, s, a });
  });
  for (let m = 0; m < 1440; m += 20) {
    const [s, a] = sunAt(m);
    out.push({ t: midnight + m * 60_000, id: "sun.sun", s, a });
  }
  return out.sort((x, y) => x.t - y.t);
}

const midnightOf = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** The story's state of an entity at a time (null: the story never changes it). */
export function storyState(id: string, t: number): { s: string; a?: Attrs } | null {
  const m0 = midnightOf(t);
  let found: Change | null = null;
  for (const c of dayChanges(m0)) if (c.id === id && c.t <= t) found = c;
  if (found) return found;
  // before the day's first change: the night, or the end of yesterday
  for (const c of dayChanges(midnightOf(m0 - 1))) if (c.id === id) found = c;
  if (found) return found;
  const n = NIGHT[id];
  if (n) return { s: n[0], a: n[1] };
  // lights the story never switches stay off
  return /^(light|switch)\./.test(id) ? { s: "off" } : null;
}

/** history/history_during_period over the demo house. */
export function demoHistory(
  msg: { start_time: string; end_time?: string; entity_ids: string[]; no_attributes?: boolean; include_start_time_state?: boolean },
  live: Record<string, HassEntity>,
): Record<string, Row[]> {
  const start = Date.parse(msg.start_time);
  const end = Math.min(msg.end_time ? Date.parse(msg.end_time) : Date.now(), Date.now());
  const ids = new Set(msg.entity_ids);
  const changes: Change[] = [];
  for (let m = midnightOf(start); m <= end; m = midnightOf(m + 36 * 3_600_000)) {
    for (const c of dayChanges(m)) if (ids.has(c.id) && c.t > start && c.t <= end) changes.push(c);
  }
  const out: Record<string, Row[]> = {};
  const attrs = (id: string, a?: Attrs) => (msg.no_attributes ? undefined : { ...(live[id]?.attributes ?? {}), ...(a ?? {}) });
  for (const id of msg.entity_ids) {
    const first = storyState(id, start) ?? (live[id] ? { s: live[id].state, a: undefined } : null);
    if (!first) continue;
    out[id] = msg.include_start_time_state === false ? [] : [{ s: first.s, a: attrs(id, first.a), lu: start / 1000 }];
  }
  for (const c of changes) {
    const rows = (out[c.id] ??= []);
    const prev = rows[rows.length - 1];
    if (prev && prev.s === c.s && !c.a) continue;
    rows.push({ s: c.s, a: attrs(c.id, c.a), lu: c.t / 1000 });
  }
  for (const rows of Object.values(out)) for (const r of rows) if (r.a === undefined) delete r.a;
  return out;
}
