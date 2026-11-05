import { describe, expect, it } from "vitest";
import { autoPlace } from "../src/auto/placement";
import { applianceEntities, applianceGlow, applianceKind, applianceNow, applianceText, endsAt, programmeName, runWord } from "../src/live/appliances";
import type { Hass, HassEntity } from "../src/live/hass";
import { HassLive } from "../src/live/live";
import { normalizePlan, type Furniture } from "../src/model/plan";
import { buildFloor } from "../src/scene/build";
import { FURNITURE } from "../src/scene/furniture-lib";
import { DAY } from "../src/scene/palette";

const NOW = Date.parse("2026-11-05T12:00:00Z");
const at = new Date(NOW - 600_000).toISOString();
const state = (entity_id: string, s: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state: s, attributes, last_changed: at, last_updated: at });

/** A Home Assistant with one appliance device of these entities. */
function machine(device: string, states: HassEntity[], name = device, area = "utility"): Hass {
  return {
    states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
    entities: Object.fromEntries(states.map((s) => [s.entity_id, { entity_id: s.entity_id, device_id: device, area_id: area }])),
    devices: { [device]: { id: device, name, area_id: area } },
    areas: { [area]: { area_id: area, name: "Utility" } },
  } as unknown as Hass;
}

const now = (hass: Hass, linked: string) => applianceNow(hass, applianceEntities(hass, linked), NOW);

describe("run states from the common integrations", () => {
  it("Home Connect: operation state, programme and the time it finishes", () => {
    const hass = machine("bosch", [
      state("sensor.dishwasher_operation_state", "run", { device_class: "enum" }),
      state("select.dishwasher_active_program", "dishcare_dishwasher_program_eco_50"),
      state("sensor.dishwasher_remaining_program_time", new Date(NOW + 47 * 60_000).toISOString(), { device_class: "timestamp" }),
      state("binary_sensor.dishwasher_door", "off", { device_class: "door" }),
    ]);
    // linked to any of its entities, the door's here
    const a = now(hass, "binary_sensor.dishwasher_door")!;
    expect(a).toMatchObject({ state: "running", programme: "Eco 50", entity: "sensor.dishwasher_operation_state" });
    expect(applianceText(a, NOW)).toBe("Eco 50 · 47 min left");
    hass.states["sensor.dishwasher_operation_state"] = state("sensor.dishwasher_operation_state", "finished");
    expect(applianceText(now(hass, "binary_sensor.dishwasher_door"), NOW)).toBe("Done");
  });

  it("Miele: status, phase and time left in minutes", () => {
    const hass = machine("miele", [
      state("sensor.washing_machine_status", "in_use", { device_class: "enum" }),
      state("sensor.washing_machine_program", "cottons"),
      state("sensor.washing_machine_program_phase", "rinse"),
      state("sensor.washing_machine_remaining_time", "83", { device_class: "duration", unit_of_measurement: "min" }),
    ]);
    const a = now(hass, "sensor.washing_machine_status")!;
    expect(a.programme).toBe("Rinse");
    expect(applianceText(a, NOW)).toBe("Rinse · 1 h 23 left");
    // switched on but not running, and programmed for later
    hass.states["sensor.washing_machine_status"] = state("sensor.washing_machine_status", "on");
    expect(now(hass, "sensor.washing_machine_status")!.state).toBe("idle");
    expect(applianceText(now(hass, "sensor.washing_machine_status"), NOW)).toBeNull();
    hass.states["sensor.washing_machine_status"] = state("sensor.washing_machine_status", "waiting_to_start");
    expect(applianceText(now(hass, "sensor.washing_machine_status"), NOW)).toBe("Waiting to start");
  });

  it("a real Miele dishwasher (its status is the device's own name, its phase is apart)", () => {
    const enumOf = (options: string[]) => ({ device_class: "enum", options });
    const hass = machine("miele", [
      state("binary_sensor.dishwasher_door", "off", { device_class: "door" }),
      state("sensor.dishwasher_program_phase", "not_running", enumOf(["drying", "final_rinse", "finished", "main_dishwash", "not_running"])),
      state("sensor.dishwasher", "off", enumOf(["autocleaning", "failure", "idle", "in_use", "off", "on", "pause", "program_ended", "programmed", "reserved"])),
      state("sensor.dishwasher_program", "no_program"),
      state("sensor.dishwasher_remaining_time", "unknown", { device_class: "duration", unit_of_measurement: "min" }),
      state("sensor.dishwasher_finish", "unknown", { device_class: "timestamp" }),
      state("switch.dishwasher_power", "off"),
    ], "Dishwasher", "kitchen");
    expect(now(hass, "binary_sensor.dishwasher_door")).toMatchObject({ state: "idle", entity: "sensor.dishwasher" });
    const set = (id: string, v: string, extra: Record<string, unknown> = {}) => (hass.states[id] = state(id, v, { ...hass.states[id].attributes, ...extra }));
    set("sensor.dishwasher", "in_use");
    set("sensor.dishwasher_program", "eco");
    set("sensor.dishwasher_program_phase", "main_dishwash");
    set("sensor.dishwasher_remaining_time", "95");
    expect(applianceText(now(hass, "binary_sensor.dishwasher_door"), NOW)).toBe("Main dishwash · 1 h 35 left");
    set("sensor.dishwasher", "program_ended");
    set("sensor.dishwasher_program_phase", "finished");
    expect(now(hass, "binary_sensor.dishwasher_door")).toMatchObject({ state: "done", entity: "sensor.dishwasher" });
  });

  it("a real LG ThinQ washer: its time left is a timestamp", () => {
    const hass = machine("lg", [
      state("sensor.washer_current_status", "running", { device_class: "enum" }),
      state("select.washer_operation", "unknown"),
      state("sensor.washer_cycles", "0"),
      state("sensor.washer_remaining_time", new Date(NOW + 41 * 60_000).toISOString(), { device_class: "timestamp" }),
      state("switch.washer_power", "on", { device_class: "switch" }),
    ], "Washer");
    expect(applianceText(now(hass, "switch.washer_power"), NOW)).toBe("Running · 41 min left");
    expect(applianceKind("Washer")).toBe("washer");
  });

  it("LG ThinQ: current status and time left as h:mm:ss", () => {
    const hass = machine("lg", [
      state("sensor.washer_current_status", "spinning"),
      state("sensor.washer_remaining_time", "0:12:00", { device_class: "duration" }),
    ]);
    expect(applianceText(now(hass, "sensor.washer_current_status"), NOW)).toBe("Running · 12 min left");
    hass.states["sensor.washer_current_status"] = state("sensor.washer_current_status", "end");
    expect(now(hass, "sensor.washer_current_status")!.state).toBe("done");
    hass.states["sensor.washer_current_status"] = state("sensor.washer_current_status", "power_off");
    expect(now(hass, "sensor.washer_current_status")!.state).toBe("idle");
  });

  it("SmartThings: machine state with the job as the phase, and the completion time", () => {
    const hass = machine("st", [
      state("sensor.dryer_machine_state", "run"),
      state("sensor.dryer_job_state", "drying"),
      state("sensor.dryer_completion_time", new Date(NOW + 30 * 60_000).toISOString(), { device_class: "timestamp" }),
    ]);
    expect(applianceText(now(hass, "sensor.dryer_machine_state"), NOW)).toBe("Drying · 30 min left");
    hass.states["sensor.dryer_machine_state"] = state("sensor.dryer_machine_state", "pause");
    expect(applianceText(now(hass, "sensor.dryer_machine_state"), NOW)).toBe("Paused");
  });

  it("a running binary sensor, or a smart plug's power", () => {
    const run = machine("x", [state("binary_sensor.washer_running", "on", { device_class: "running" })]);
    expect(now(run, "binary_sensor.washer_running")!.state).toBe("running");
    const plug = machine("plug", [state("switch.washer_plug", "on"), state("sensor.washer_plug_power", "1840", { device_class: "power", unit_of_measurement: "W" })]);
    expect(now(plug, "switch.washer_plug")).toMatchObject({ state: "running", entity: "sensor.washer_plug_power" });
    plug.states["sensor.washer_plug_power"] = state("sensor.washer_plug_power", "1.2", { device_class: "power", unit_of_measurement: "W" });
    expect(now(plug, "switch.washer_plug")!.state).toBe("idle");
  });

  it("knows nothing when it can't be reached or nothing says", () => {
    expect(now(machine("x", [state("sensor.washer_status", "unavailable")]), "sensor.washer_status")).toBeNull();
    expect(now(machine("x", [state("switch.washer_child_lock", "off")]), "switch.washer_child_lock")).toBeNull();
    expect(applianceNow({ states: {} } as Hass, [], NOW)).toBeNull();
  });
});

describe("words and times", () => {
  it("folds state words to run states", () => {
    expect(["Run", "in_use", "Main wash", "rinse-hold", "program_ended", "DelayedStart", "actionrequired", "standby", "open"].map(runWord))
      .toEqual(["running", "running", "running", "paused", "done", "waiting", "error", "idle", null]);
  });

  it("names programmes and reads times left", () => {
    expect(programmeName("cotton_eco_40")).toBe("Cotton eco 40");
    expect(programmeName("unknown")).toBeNull();
    expect(endsAt(state("sensor.t", "1.5", { unit_of_measurement: "h" }), NOW)).toBe(NOW + 5_400_000);
    expect(endsAt(state("sensor.t", "90", { unit_of_measurement: "s" }), NOW)).toBe(NOW + 90_000);
    expect(endsAt(state("sensor.t", "unknown"), NOW)).toBeNull();
  });

  it("glows blue while running, green when done, nothing when idle", () => {
    const a = { programme: null, ends: null, entity: "x" };
    expect(applianceGlow({ ...a, state: "running" })![2]).toBe(1);
    expect(applianceGlow({ ...a, state: "done" })![1]).toBeGreaterThan(0.8);
    expect(applianceGlow({ ...a, state: "idle" })).toBeNull();
  });

  it("tells the machine from its name", () => {
    expect(["Bosch Dishwasher", "Washer Dryer", "Miele Tumble dryer", "Kitchen fridge"].map(applianceKind)).toEqual(["dishwasher", "washer", "dryer", null]);
  });
});

describe("in the plan", () => {
  const piece = (type: string, extra: Partial<Furniture> = {}): Furniture => {
    const [w, d, h] = FURNITURE[type].size;
    return { id: "wm", type, x: 1, z: 1, rotation: 0, w, d, h, ...extra };
  };
  const plan = (furniture: Furniture[]) => normalizePlan({
    version: 1, settings: {},
    floors: [{ id: "g", name: "Ground", elevation: 0, height: 2.6, devices: [], walls: [], openings: [], furniture,
      rooms: [{ id: "u", name: "Utility", area_id: "utility", points: [[0, 0], [3, 0], [3, 3], [0, 3]] }] }],
  });

  it("has a display that glows, and the label shows only while it does something", () => {
    const p = plan([piece("washer", { entity: "sensor.washing_machine_status" })]);
    const fb = buildFloor(p, 0, DAY, { low: true });
    const slot = fb.glows.find((g) => g.type === "washer")!;
    expect(slot).toMatchObject({ item: "wm", entity: "sensor.washing_machine_status" });
    const hass = machine("miele", [state("sensor.washing_machine_status", "in_use"), state("sensor.washing_machine_program", "cottons")]);
    const l = new HassLive(p);
    l.update(hass);
    expect(l.glowColor(slot)).toEqual([0.35, 0.65, 1.0]);
    expect(l.pieceReading(p.floors[0].furniture[0])).toEqual({ text: "Cottons", icon: "washer" });
    l.update({ ...hass, states: { ...hass.states, "sensor.washing_machine_status": state("sensor.washing_machine_status", "off") } });
    expect(l.glowColor(slot)).toBeNull();
    expect(l.pieceReading(p.floors[0].furniture[0])).toBeNull();
  });

  it("Smart Setup links a washing machine already drawn to its appliance, not a pin", () => {
    const hass = machine("miele", [
      state("sensor.washing_machine_status", "off", { friendly_name: "Washing machine Status" }),
      state("sensor.washing_machine_remaining_time", "0", { device_class: "duration", unit_of_measurement: "min" }),
    ], "Washing machine");
    const { plan: out, report } = autoPlace(plan([piece("washer"), piece("dishwasher", { id: "dw", x: 2 })]), hass);
    expect(out.floors[0].furniture.find((x) => x.id === "wm")!.entity).toBe("sensor.washing_machine_status");
    expect(out.floors[0].furniture.find((x) => x.id === "dw")!.entity).toBeUndefined();
    expect(out.floors[0].devices).toEqual([]);
    expect(report.linked).toContain("Washing machine → Washing machine");
  });
});
