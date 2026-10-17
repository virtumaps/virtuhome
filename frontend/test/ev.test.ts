import { describe, expect, it } from "vitest";
import { autoPlace } from "../src/auto/placement";
import { evState, findChargers, readEv } from "../src/live/ev";
import { HassLive } from "../src/live/live";
import { EnergyLive } from "../src/live/energy";
import { normalizePlan, type Furniture } from "../src/model/plan";
import { carModel } from "../src/scene/furniture-lib";
import { findSources, readNow } from "../src/live/energy";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

type Attrs = Record<string, unknown>;

function house() {
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, HassEntityReg> = {};
  const devices: NonNullable<Hass["devices"]> = {};
  const hass = { states, entities, devices } as unknown as Hass;
  const device = (id: string, platform: string, d: { name: string; manufacturer?: string; model?: string }) => {
    devices[id] = { id, ...d };
    return (entity: string, state: string, attributes: Attrs = {}) => {
      states[entity] = { entity_id: entity, state, attributes, last_changed: "", last_updated: "" };
      entities[entity] = { entity_id: entity, device_id: id, platform };
    };
  };
  return { hass, device };
}

/** An Ohme Home Pro as the Ohme integration shows it. */
function ohme(status = "unplugged", power = "0.0") {
  const h = house();
  const add = h.device("ohme", "ohme", { name: "Ohme Home Pro", manufacturer: "Ohme", model: "Home Pro" });
  add("sensor.ohme_home_pro_status", status, { device_class: "enum", options: ["unplugged", "pending_approval", "charging", "plugged_in", "paused", "finished"] });
  add("sensor.ohme_home_pro_power", power, { device_class: "power", unit_of_measurement: "kW", state_class: "measurement" });
  add("sensor.ohme_home_pro_current", "0", { device_class: "current", unit_of_measurement: "A" });
  add("sensor.ohme_home_pro_vehicle_battery", "52.0", { device_class: "battery", unit_of_measurement: "%" });
  add("sensor.ohme_home_pro_charge_slots", "unknown");
  add("number.ohme_home_pro_target_percentage", "60", { unit_of_measurement: "%" });
  add("number.ohme_home_pro_preconditioning_duration", "0", { unit_of_measurement: "min" });
  add("select.ohme_home_pro_charge_mode", status === "unplugged" ? "unavailable" : "smart_charge", { options: ["smart_charge", "max_charge", "paused"] });
  add("select.ohme_home_pro_vehicle", "Nissan LEAF (2015-2018)", { options: ["Nissan LEAF (2015-2018)"] });
  add("button.ohme_home_pro_approve_charge", status === "pending_approval" ? "unknown" : "unavailable");
  add("time.ohme_home_pro_target_time", "08:00:00");
  add("switch.ohme_home_pro_price_cap", "on");
  // a phone and a solar battery, whose levels are not the car's
  h.device("phone", "mobile_app", { name: "Phone" })("sensor.phone_battery_level", "80", { device_class: "battery", unit_of_measurement: "%" });
  return h;
}

describe("findChargers", () => {
  it("finds an Ohme and every part of it", () => {
    const [c, more] = findChargers(ohme().hass, null, null);
    expect(more).toBeUndefined();
    expect(c).toMatchObject({
      name: "Ohme Home Pro",
      power: "sensor.ohme_home_pro_power",
      status: "sensor.ohme_home_pro_status",
      level: "sensor.ohme_home_pro_vehicle_battery",
      target: "number.ohme_home_pro_target_percentage",
      targetTime: "time.ohme_home_pro_target_time",
      mode: "select.ohme_home_pro_charge_mode",
      approve: "button.ohme_home_pro_approve_charge",
      vehicle: "select.ohme_home_pro_vehicle",
      slots: "sensor.ohme_home_pro_charge_slots",
      plug: null,
      energy: null,
    });
  });

  it("finds a Zappi by its model, and not the Eddi next to it", () => {
    const h = house();
    const zappi = h.device("z", "myenergi", { name: "Zappi", manufacturer: "myenergi", model: "Zappi" });
    zappi("sensor.myenergi_zappi_12345_power_ct_grid", "2300", { device_class: "power", unit_of_measurement: "W" });
    zappi("sensor.myenergi_zappi_12345_power_ct_internal_load", "7100", { device_class: "power", unit_of_measurement: "W" });
    zappi("sensor.myenergi_zappi_12345_plug_status", "EV Connected");
    zappi("sensor.myenergi_zappi_12345_status", "Charging");
    zappi("sensor.myenergi_zappi_12345_energy_used_today", "12.1", { device_class: "energy", unit_of_measurement: "kWh", state_class: "total_increasing" });
    zappi("select.myenergi_zappi_12345_charge_mode", "Eco+", { options: ["Fast", "Eco", "Eco+", "Stopped"] });
    h.device("e", "myenergi", { name: "Eddi", manufacturer: "myenergi", model: "Eddi" })("sensor.myenergi_eddi_power", "0", { device_class: "power", unit_of_measurement: "W" });
    const list = findChargers(h.hass, null, null);
    expect(list.length).toBe(1);
    expect(list[0].power).toBe("sensor.myenergi_zappi_12345_power_ct_internal_load");
    expect(list[0].plug).toBe("sensor.myenergi_zappi_12345_plug_status");
    expect(list[0].status).toBe("sensor.myenergi_zappi_12345_status");
    expect(list[0].energy).toBe("sensor.myenergi_zappi_12345_energy_used_today");
    const now = readEv(h.hass, list[0]);
    expect(now.state).toBe("charging");
    expect(now.power).toBeCloseTo(7.1);
    expect(now.modes).toEqual(["Fast", "Eco", "Eco+", "Stopped"]);
  });

  it("takes the car's battery from the car's own integration, never the house battery's", () => {
    const h = house();
    const hv = h.device("hv", "hypervolt_charger", { name: "Hypervolt", manufacturer: "Hypervolt" });
    hv("sensor.hypervolt_charger_power", "0", { device_class: "power", unit_of_measurement: "W" });
    const tesla = h.device("car", "tesla_fleet", { name: "Model 3", manufacturer: "Tesla", model: "Model 3" });
    tesla("sensor.model_3_battery_level", "71", { device_class: "battery", unit_of_measurement: "%" });
    const wall = h.device("pw", "tesla_fleet", { name: "My home", manufacturer: "Tesla", model: "Powerwall 2" });
    wall("sensor.my_home_percentage_charged", "40", { device_class: "battery", unit_of_measurement: "%" });
    expect(findChargers(h.hass, null, null)[0].level).toBe("sensor.model_3_battery_level");
    expect(findChargers(h.hass, null, null, new Set(["sensor.model_3_battery_level"]))[0].level).toBeNull();
  });

  it("finds a charger the energy settings list as a device", () => {
    const h = house();
    const plug = h.device("p", "zha", { name: "Garage socket" });
    plug("sensor.ev_charger_energy", "301.2", { device_class: "energy", unit_of_measurement: "kWh", state_class: "total_increasing", friendly_name: "EV charger energy" });
    plug("sensor.garage_socket_power", "2300", { device_class: "power", unit_of_measurement: "W" });
    const [c] = findChargers(h.hass, { device_consumption: [{ stat_consumption: "sensor.ev_charger_energy" }] }, null);
    expect(c.energy).toBe("sensor.ev_charger_energy");
    expect(c.power).toBe("sensor.garage_socket_power");
  });

  it("lets the plan pick the charger or hide it", () => {
    const h = ohme();
    h.device("p", "zha", { name: "Drive plug" })("sensor.drive_plug_power", "1800", { device_class: "power", unit_of_measurement: "W" });
    const [c] = findChargers(h.hass, null, { ev_charger: "sensor.drive_plug_power", ev_level: "sensor.ohme_home_pro_vehicle_battery" });
    expect(c.power).toBe("sensor.drive_plug_power");
    expect(c.level).toBe("sensor.ohme_home_pro_vehicle_battery");
    expect(findChargers(h.hass, null, { ev_enabled: false })).toEqual([]);
  });
});

describe("readEv", () => {
  it("reads an Ohme waiting for approval", () => {
    const h = ohme("pending_approval");
    const n = readEv(h.hass, findChargers(h.hass, null, null)[0]);
    expect(n).toMatchObject({ name: "Nissan LEAF", state: "approval", level: 52, target: 60, by: "08:00", mode: "smart_charge", canApprove: true, slots: null });
    expect(n.modes).toEqual(["smart_charge", "max_charge", "paused"]);
  });

  it("has no modes to pick while unplugged", () => {
    const h = ohme();
    const n = readEv(h.hass, findChargers(h.hass, null, null)[0]);
    expect(n.state).toBe("unplugged");
    expect(n.mode).toBeNull();
    expect(n.modes).toEqual([]);
    expect(n.canApprove).toBe(false);
  });

  it("counts a charger drawing power as charging", () => {
    const h = house();
    h.device("p", "zha", { name: "EV charger plug" })("sensor.ev_charger_plug_power", "2.2", { device_class: "power", unit_of_measurement: "kW" });
    const [c] = findChargers(h.hass, null, null);
    expect(readEv(h.hass, c).state).toBe("charging");
  });
});

describe("evState", () => {
  it("understands the chargers' words", () => {
    const cases: [string, string][] = [
      ["unplugged", "unplugged"], ["plugged_in", "plugged"], ["pending_approval", "approval"], ["charging", "charging"],
      ["paused", "paused"], ["finished", "finished"], ["EV Disconnected", "unplugged"], ["EV Connected", "plugged"],
      ["Boosting", "charging"], ["Completed", "finished"], ["Connected: waiting for car demand", "plugged"],
      ["Available", "unplugged"], ["SuspendedEV", "paused"], ["Faulted", "fault"], ["ready_to_charge", "plugged"],
      ["awaiting_start", "plugged"], ["disconnected", "unplugged"], ["unavailable", "unknown"],
    ];
    for (const [raw, want] of cases) expect([raw, evState(raw)]).toEqual([raw, want]);
  });
});

describe("the house's energy", () => {
  it("brings the car along", () => {
    const h = ohme("charging", "7.2");
    const src = findSources(h.hass, null, null);
    expect(src.ev.length).toBe(1);
    expect(src.stats.evPower).toEqual(["sensor.ohme_home_pro_power"]);
    const n = readNow(h.hass, src);
    expect(n.ev[0]).toMatchObject({ state: "charging", power: 7.2, level: 52 });
  });
});

describe("placing the charger", () => {
  const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const plan = () => normalizePlan({
    version: 1,
    settings: {},
    floors: [{
      id: "g", name: "Ground", elevation: 0, height: 2.5,
      rooms: [{ id: "r", name: "Living", area_id: null, points: rect(0, 0, 6.25, 7.4) }],
      outdoor: [{ id: "d", name: "Driveway", kind: "driveway", area_id: null, points: rect(-3.24, 7.54, 6.39, 13) }],
      openings: [], furniture: [], devices: [], walls: [],
    }],
  });

  it("hangs it on the house's wall at the driveway, with the car in front", () => {
    const { plan: p, report } = autoPlace(plan(), ohme().hass);
    const f = p.floors[0];
    const charger = f.furniture.find((x) => x.type === "ev_charger")!;
    const car = f.furniture.find((x) => x.type === "car")!;
    // its back against the wall's outside face (the room's edge at 7.4 plus half a 0.28 m wall)
    expect(charger.z - charger.d / 2).toBeCloseTo(7.54, 2);
    expect(charger.rotation).toBe(0);
    expect(charger.entity).toBe("sensor.ohme_home_pro_status");
    expect(car.rotation).toBe(180);
    expect(car.z - car.d / 2).toBeGreaterThan(7.54);
    expect(car.z + car.d / 2).toBeLessThan(13);
    // the Ohme's car, a Leaf: a hatchback of its size, shown while it is plugged in
    expect([car.w, car.d, car.h]).toEqual([1.77, 4.45, 1.55]);
    expect(car.parked).toBe("plugged");
    expect(report.placed).toEqual(["Ohme Home Pro → Driveway", "Nissan LEAF → Driveway"]);
    // the charger's switches are no plugs on a wall
    expect(f.devices.some((d) => d.entity.includes("ohme"))).toBe(false);
  });

  it("leaves a plan that has one alone", () => {
    const { plan: p } = autoPlace(autoPlace(plan(), ohme().hass).plan, ohme().hass);
    expect(p.floors[0].furniture.filter((x) => x.type === "ev_charger").length).toBe(1);
    expect(p.floors[0].furniture.filter((x) => x.type === "car").length).toBe(1);
  });
});

describe("the car", () => {
  it("knows popular cars by their name", () => {
    expect(carModel("Nissan LEAF (2015-2018)")).toEqual({ type: "car", size: [1.77, 4.45, 1.55] });
    expect(carModel("Tesla Model Y Long Range")?.type).toBe("car_suv");
    expect(carModel("Tesla Model 3 (2019+)")?.type).toBe("car_saloon");
    expect(carModel("Hyundai IONIQ 5")?.type).toBe("car_suv");
    expect(carModel("Ohme Home Pro")).toBeNull();
  });

  it("is here as its charger or its tracker says", () => {
    const at = (status: string, tracker?: string) => {
      const h = ohme(status);
      if (tracker) h.device("t", "ibeacon", { name: "Car tag" })("device_tracker.car_tag", tracker);
      const energy = new EnergyLive();
      energy.update(h.hass);
      const live = new HassLive(normalizePlan({ version: 1, floors: [] }));
      live.energy = energy;
      live.update(h.hass);
      return live;
    };
    const car = (parked?: string): Furniture => ({ id: "c", type: "car", x: 0, z: 0, rotation: 0, w: 1.8, d: 4.4, h: 1.5, parked });
    expect(at("unplugged").carHere(car())).toBe(true);
    expect(at("unplugged").carHere(car("plugged"))).toBe(false);
    expect(at("plugged_in").carHere(car("plugged"))).toBe(true);
    expect(at("charging").carHere(car("plugged"))).toBe(true);
    expect(at("unplugged", "home").carHere(car("device_tracker.car_tag"))).toBe(true);
    expect(at("unplugged", "not_home").carHere(car("device_tracker.car_tag"))).toBe(false);
    expect(at("unplugged", "Work").carHere(car("device_tracker.car_tag"))).toBe(false);
    // nothing to go by: it stays
    expect(at("unplugged", "unavailable").carHere(car("device_tracker.car_tag"))).toBe(true);
  });
});
