import { describe, expect, it } from "vitest";
import { findSources, flows, formatPower, formatPrice, formatRate, readNow, type EnergyPrefs } from "../src/live/energy";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

/** A FoxESS inverter over Modbus with an Octopus tariff, as Home Assistant shows them. */
function foxess(): Hass {
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, HassEntityReg> = {};
  const add = (id: string, state: string, attrs: Record<string, unknown>, device: string | null = "inv") => {
    states[id] = { entity_id: id, state, attributes: attrs, last_changed: "", last_updated: "" };
    entities[id] = { entity_id: id, device_id: device };
  };
  const kw = (id: string, v: string) => add(id, v, { device_class: "power", unit_of_measurement: "kW" });
  const kwh = (id: string, v: string) => add(id, v, { device_class: "energy", unit_of_measurement: "kWh" });
  kw("sensor.foxess_inverter_pv1_power", "1.616");
  kw("sensor.foxess_inverter_pv2_power", "0.769");
  kw("sensor.foxess_modbus_foxess_inverter_pv_power_foxess_inverter", "2.385");
  kw("sensor.foxess_inverter_load_power", "1.449");
  kw("sensor.foxess_inverter_battery_charge", "0.93");
  kw("sensor.foxess_inverter_battery_discharge", "0");
  kw("sensor.foxess_inverter_invbatpower", "-0.93");
  kw("sensor.foxess_inverter_grid_consumption", "0.014");
  kw("sensor.foxess_inverter_feed_in", "0");
  kw("sensor.foxess_inverter_grid_ct", "-0.014");
  kw("sensor.foxess_inverter_rpower", "1.435");
  kw("sensor.foxess_inverter_ct2_meter", "0.0");
  kwh("sensor.foxess_inverter_pv1_energy_total", "1414.5");
  kwh("sensor.foxess_inverter_pv2_energy_total", "1110.0");
  kwh("sensor.foxess_inverter_battery_charge_total", "972.9");
  kwh("sensor.foxess_inverter_battery_discharge_total", "980.5");
  kwh("sensor.foxess_inverter_grid_consumption_energy_total", "1488.4");
  kwh("sensor.foxess_inverter_feed_in_energy_total", "2072.0");
  add("sensor.foxess_inverter_battery_soc", "72", { device_class: "battery", unit_of_measurement: "%" });
  add("sensor.foxess_inverter_min_soc", "10", { device_class: "battery", unit_of_measurement: "%" });
  add("sensor.foxess_inverter_battery_soh", "100", { device_class: "battery", unit_of_measurement: "%" });
  add("sensor.octopus_energy_electricity_x_y_current_rate", "0.245", { unit_of_measurement: "GBP/kWh" }, "meter");
  add("sensor.octopus_energy_electricity_x_z_export_current_rate", "0.12", { unit_of_measurement: "GBP/kWh" }, "meter");
  add("sensor.octopus_energy_gas_x_y_current_rate", "0.05", { unit_of_measurement: "GBP/kWh" }, "gas");
  // a smart plug elsewhere
  add("sensor.garden_light_power", "12", { device_class: "power", unit_of_measurement: "W" }, "plug");
  return { states, entities } as unknown as Hass;
}

const PREFS: EnergyPrefs = {
  energy_sources: [
    { type: "solar", stat_energy_from: "sensor.foxess_inverter_pv1_energy_total" },
    { type: "solar", stat_energy_from: "sensor.foxess_inverter_pv2_energy_total" },
    { type: "battery", stat_energy_to: "sensor.foxess_inverter_battery_charge_total", stat_energy_from: "sensor.foxess_inverter_battery_discharge_total" },
    {
      type: "grid",
      flow_from: [{ stat_energy_from: "sensor.foxess_inverter_grid_consumption_energy_total" }],
      flow_to: [{ stat_energy_to: "sensor.foxess_inverter_feed_in_energy_total" }],
    },
  ],
};

describe("findSources", () => {
  it("finds the power sensors next to the energy dashboard's sensors", () => {
    const src = findSources(foxess(), PREFS, null);
    expect(src.solar).toEqual(["sensor.foxess_inverter_pv1_power", "sensor.foxess_inverter_pv2_power"]);
    expect(src.home).toBe("sensor.foxess_inverter_load_power");
    expect(src.batteryCharge).toBe("sensor.foxess_inverter_battery_charge");
    expect(src.batteryDischarge).toBe("sensor.foxess_inverter_battery_discharge");
    expect(src.batteryLevel).toBe("sensor.foxess_inverter_battery_soc");
    expect(src.gridImport).toBe("sensor.foxess_inverter_grid_consumption");
    expect(src.gridExport).toBe("sensor.foxess_inverter_feed_in");
    expect(src.priceImport).toBe("sensor.octopus_energy_electricity_x_y_current_rate");
    expect(src.priceExport).toBe("sensor.octopus_energy_electricity_x_z_export_current_rate");
    expect(src.stats.gridIn).toEqual(["sensor.foxess_inverter_grid_consumption_energy_total"]);
  });

  it("finds them by name without energy settings", () => {
    const src = findSources(foxess(), null, null);
    expect(src.solar).toEqual(["sensor.foxess_modbus_foxess_inverter_pv_power_foxess_inverter"]);
    expect(src.home).toBe("sensor.foxess_inverter_load_power");
    expect(src.batteryLevel).toBe("sensor.foxess_inverter_battery_soc");
  });

  it("lets the plan's settings win", () => {
    const src = findSources(foxess(), PREFS, { solar: ["sensor.foxess_modbus_foxess_inverter_pv_power_foxess_inverter"], battery: "sensor.foxess_inverter_invbatpower" });
    expect(src.solar).toEqual(["sensor.foxess_modbus_foxess_inverter_pv_power_foxess_inverter"]);
    expect(src.battery).toBe("sensor.foxess_inverter_invbatpower");
    expect(src.batteryCharge).toBeNull();
  });
});

describe("readNow", () => {
  it("reads the house now", () => {
    const hass = foxess();
    const n = readNow(hass, findSources(hass, PREFS, null));
    expect(n.solar).toBeCloseTo(2.385, 3);
    expect(n.home).toBeCloseTo(1.449, 3);
    expect(n.battery).toBeCloseTo(-0.93, 3);
    expect(n.grid).toBeCloseTo(0.014, 3);
    expect(n.batteryLevel).toBe(72);
    expect(n.priceImport).toEqual({ value: 0.245, currency: "GBP" });
    expect(n.flows.solarToBattery).toBeCloseTo(0.93, 3);
    expect(n.flows.solarToHome).toBeCloseTo(1.455, 3);
    expect(n.flows.gridToHome).toBeCloseTo(0.014, 3);
  });

  it("works the house out when it has no sensor of its own", () => {
    const hass = foxess();
    const src = { ...findSources(hass, PREFS, null), home: null };
    const n = readNow(hass, src);
    expect(n.homeComputed).toBe(true);
    expect(n.home).toBeCloseTo(2.385 - 0.93 + 0.014, 3);
  });
});

describe("flows", () => {
  it("sends spare solar to the battery, then the grid", () => {
    const f = flows(4, -1, -1.5);
    expect(f.solarToGrid).toBeCloseTo(1.5);
    expect(f.solarToBattery).toBeCloseTo(1);
    expect(f.solarToHome).toBeCloseTo(1.5);
    expect(f.gridToHome).toBe(0);
  });
  it("charges the battery from the grid at night", () => {
    const f = flows(0, -3, 3.4);
    expect(f.gridToBattery).toBeCloseTo(3);
    expect(f.gridToHome).toBeCloseTo(0.4);
    expect(f.solarToHome).toBe(0);
  });
  it("runs the house from the battery and exports the rest", () => {
    const f = flows(0, 2, -0.5);
    expect(f.batteryToGrid).toBeCloseTo(0.5);
    expect(f.batteryToHome).toBeCloseTo(1.5);
  });
});

describe("formatting", () => {
  it("formats power, prices and rates", () => {
    expect(formatPower(0.014)).toBe("14 W");
    expect(formatPower(2.385)).toBe("2.4 kW");
    expect(formatPrice({ value: 0.245, currency: "GBP" })).toBe("24.5p");
    expect(formatPrice({ value: 0.31, currency: "EUR" })).toBe("€0.310");
    expect(formatRate(1.5, { value: 0.245, currency: "GBP" })).toBe("37p/h");
    expect(formatRate(0.1, { value: 0.245, currency: "GBP" })).toBe("2.5p/h");
  });
});
