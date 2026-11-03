import { describe, expect, it } from "vitest";
import { alarmPanels, armModes, openSensors, wantsCode, whatSetItOff } from "../src/live/alarm";
import { HassLive } from "../src/live/live";
import { normalizePlan, type Floor } from "../src/model/plan";
import type { Hass, HassEntity } from "../src/live/hass";

const T = Date.parse("2026-11-03T02:00:00Z");
const iso = (ms: number) => new Date(T + ms).toISOString();
const st = (entity_id: string, state: string, attributes: Record<string, unknown> = {}, changed = 0): HassEntity =>
  ({ entity_id, state, attributes, last_changed: iso(changed), last_updated: iso(changed) });
const sensor = (id: string, dc: string, state: string, changed: number) => st(id, state, { device_class: dc }, changed);

function hassOf(states: HassEntity[], areas: Record<string, string> = {}): Hass {
  return {
    states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
    entities: Object.fromEntries(states.map((s) => [s.entity_id, { entity_id: s.entity_id, area_id: areas[s.entity_id] ?? null }])),
    areas: { downstairs: { area_id: "downstairs", name: "Downstairs" }, garage: { area_id: "garage", name: "Garage" } },
  } as unknown as Hass;
}

describe("arming", () => {
  it("offers the ways the panel can be armed", () => {
    expect(armModes(st("alarm_control_panel.a", "disarmed", { supported_features: 3 })).map((m) => m.service)).toEqual(["alarm_arm_home", "alarm_arm_away"]);
    expect(armModes(st("alarm_control_panel.a", "disarmed", { supported_features: 39 })).map((m) => m.state)).toEqual(["armed_home", "armed_away", "armed_night", "armed_vacation"]);
    expect(armModes(st("alarm_control_panel.a", "disarmed")).map((m) => m.state)).toEqual(["armed_home", "armed_away"]);
  });

  it("asks for the code to disarm when there is one, and to arm unless the panel says it needn't", () => {
    const ring = st("alarm_control_panel.a", "disarmed", { code_format: "number", code_arm_required: false });
    expect([wantsCode(ring, true), wantsCode(ring, false)]).toEqual([false, true]);
    const strict = st("alarm_control_panel.a", "disarmed", { code_format: "text" });
    expect([wantsCode(strict, true), wantsCode(strict, false)]).toEqual([true, true]);
    expect(wantsCode(st("alarm_control_panel.a", "disarmed"), false)).toBe(false);
  });

  it("puts an Alarmo house panel before its areas'", () => {
    const h = hassOf([st("alarm_control_panel.alarmo_garage", "disarmed"), st("alarm_control_panel.alarmo", "disarmed"), st("light.x", "on")]);
    expect(alarmPanels(h)).toEqual(["alarm_control_panel.alarmo", "alarm_control_panel.alarmo_garage"]);
  });
});

describe("doors and windows left open", () => {
  it("are Alarmo's own list when arming failed", () => {
    const h = hassOf([
      st("alarm_control_panel.alarmo", "disarmed", { open_sensors: { "binary_sensor.back_door": "on" } }),
      sensor("binary_sensor.back_door", "door", "on", -60_000),
      sensor("binary_sensor.kitchen_window", "window", "on", -60_000),
    ]);
    expect(openSensors(h, "alarm_control_panel.alarmo")).toEqual(["binary_sensor.back_door"]);
  });

  it("else the open doors and windows in the panel's area, or the whole home's", () => {
    const states = [
      st("alarm_control_panel.house", "disarmed"),
      st("alarm_control_panel.garage", "disarmed"),
      sensor("binary_sensor.back_door", "door", "on", -60_000),
      sensor("binary_sensor.front_door", "door", "off", -60_000),
      sensor("binary_sensor.garage_door", "garage_door", "on", -60_000),
      sensor("binary_sensor.hall_motion", "motion", "on", -60_000),
    ];
    const h = hassOf(states, { "alarm_control_panel.garage": "garage", "binary_sensor.garage_door": "garage", "binary_sensor.back_door": "downstairs" });
    expect(openSensors(h, "alarm_control_panel.house").sort()).toEqual(["binary_sensor.back_door", "binary_sensor.garage_door"]);
    expect(openSensors(h, "alarm_control_panel.garage")).toEqual(["binary_sensor.garage_door"]);
  });
});

describe("what set it off", () => {
  it("is Alarmo's open sensor", () => {
    const h = hassOf([st("alarm_control_panel.alarmo", "triggered", { open_sensors: { "binary_sensor.hall_motion": "on" } }), sensor("binary_sensor.hall_motion", "motion", "on", -5000)]);
    expect(whatSetItOff(h, "alarm_control_panel.alarmo")).toBe("binary_sensor.hall_motion");
  });

  it("else the sensor that last turned on before the alarm went off, entry delay and all", () => {
    const h = hassOf([
      st("alarm_control_panel.ring", "triggered", {}, 0),
      // the front door opened 30 s before (the entry delay), the hall's motion just after
      sensor("binary_sensor.front_door", "door", "on", -30_000),
      sensor("binary_sensor.hall_motion", "motion", "on", 5_000),
      sensor("binary_sensor.kitchen_window", "window", "on", -3_600_000),
      sensor("binary_sensor.landing_motion", "motion", "off", -120_000),
    ]);
    expect(whatSetItOff(h, "alarm_control_panel.ring")).toBe("binary_sensor.front_door");
  });

  it("is nothing while the alarm isn't going off, or when nothing changed near the time", () => {
    const quiet = [sensor("binary_sensor.kitchen_window", "window", "on", -3_600_000)];
    expect(whatSetItOff(hassOf([st("alarm_control_panel.ring", "armed_away"), ...quiet]), "alarm_control_panel.ring")).toBeNull();
    expect(whatSetItOff(hassOf([st("alarm_control_panel.ring", "triggered"), ...quiet]), "alarm_control_panel.ring")).toBeNull();
  });
});

describe("the rooms the alarm marks", () => {
  it("are red where it was set off and orange where a door is open", () => {
    const p = normalizePlan({
      version: 1, settings: {},
      floors: [{ id: "g", name: "Ground", elevation: 0, height: 2.6, devices: [], furniture: [], walls: [],
        rooms: [
          { id: "hall", name: "Hall", area_id: null, points: [[0, 0], [2, 0], [2, 4], [0, 4]] },
          { id: "kitchen", name: "Kitchen", area_id: null, points: [[2, 0], [6, 0], [6, 4], [2, 4]] },
        ],
        openings: [
          { id: "o1", room_id: "hall", edge: 2, offset: 0.5, width: 0.9, kind: "door", entity: "binary_sensor.front_door" },
          { id: "o2", room_id: "kitchen", edge: 0, offset: 1, width: 1, kind: "window", entity: "binary_sensor.kitchen_window" },
        ] }],
    });
    const l = new HassLive(p);
    l.update(hassOf([sensor("binary_sensor.front_door", "door", "on", 0), sensor("binary_sensor.kitchen_window", "window", "on", 0)]));
    const f = p.floors[0] as Floor;
    expect(l.tint(f, { id: "hall" })).toBeNull();
    l.setAlarmMarks("binary_sensor.front_door", ["binary_sensor.kitchen_window"]);
    expect(l.tint(f, { id: "hall" })).toEqual([0.9, 0.12, 0.1, 0.42]);
    expect(l.tint(f, { id: "kitchen" })).toEqual([1.0, 0.5, 0.1, 0.3]);
    l.setAlarmMarks(null, []);
    expect(l.tint(f, { id: "kitchen" })).toBeNull();
  });
});
