import { describe, expect, it } from "vitest";
import { openWindows, powerCut, rainComing, rainSensors, type ForecastHour } from "../src/live/warnings";
import { HassLive } from "../src/live/live";
import { normalizePlan, type Plan } from "../src/model/plan";
import type { Hass, HassEntity } from "../src/live/hass";

const NOW = Date.parse("2026-11-03T14:20:00Z");
const st = (entity_id: string, state: string, attributes: Record<string, unknown> = {}, ago = 0): HassEntity =>
  ({ entity_id, state, attributes, last_changed: new Date(NOW - ago).toISOString(), last_updated: new Date(NOW - ago).toISOString() });
const hassOf = (states: HassEntity[]): Hass => ({ states: Object.fromEntries(states.map((s) => [s.entity_id, s])), entities: {} }) as unknown as Hass;
const hour = (h: string, condition: string, precipitation = 0, precipitation_probability?: number): ForecastHour => ({ datetime: `2026-11-03T${h}:00:00Z`, condition, precipitation, precipitation_probability });

describe("rain coming", () => {
  const weather = (state: string) => st("weather.home", state);

  it("is what a rain sensor says, believed over the weather's condition", () => {
    const wet = hassOf([weather("sunny"), st("binary_sensor.garden_rain", "on")]);
    expect(rainSensors(wet)).toEqual(["binary_sensor.garden_rain"]);
    expect(rainComing(wet, "weather.home", rainSensors(wet), null, NOW)).toBe("now");
    const dry = hassOf([weather("rainy"), st("binary_sensor.garden_rain", "off")]);
    expect(rainComing(dry, "weather.home", rainSensors(dry), null, NOW)).toBeNull();
    const gauge = hassOf([st("sensor.rain_rate", "1.4", { device_class: "precipitation_intensity", unit_of_measurement: "mm/h" })]);
    expect(rainComing(gauge, null, rainSensors(gauge), null, NOW)).toBe("now");
  });

  it("is the weather's condition now, else an hour of the forecast starting within the hour", () => {
    expect(rainComing(hassOf([weather("pouring")]), "weather.home", [], null, NOW)).toBe("now");
    const h = hassOf([weather("cloudy")]);
    // the hour under way (14:00) and the next (15:00) count; 16:00 is too far
    expect(rainComing(h, "weather.home", [], [hour("14", "cloudy"), hour("15", "rainy")], NOW)).toBe("soon");
    expect(rainComing(h, "weather.home", [], [hour("13", "rainy"), hour("15", "cloudy"), hour("16", "pouring")], NOW)).toBeNull();
    // wet enough and likely, whatever its picture
    expect(rainComing(h, "weather.home", [], [hour("14", "cloudy", 0.8, 70)], NOW)).toBe("soon");
    expect(rainComing(h, "weather.home", [], [hour("14", "cloudy", 0.8, 20)], NOW)).toBeNull();
    expect(rainComing(h, "weather.home", [], null, NOW)).toBeNull();
  });
});

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const plan = (): Plan => normalizePlan({
  version: 1, settings: {},
  floors: [{ id: "g", name: "Ground", elevation: 0, height: 2.6, devices: [], furniture: [], walls: [],
    rooms: [{ id: "k", name: "Kitchen", area_id: null, points: rect(0, 0, 4, 4) }, { id: "p", name: "Porch", area_id: null, points: rect(4, 0, 6, 4) }],
    openings: [
      { id: "w1", room_id: "k", edge: 0, offset: 1, width: 1, kind: "window", entity: "binary_sensor.kitchen_window" },
      { id: "w2", room_id: "p", edge: 0, offset: 0.5, width: 1, kind: "window", entity: "binary_sensor.porch_window", sheltered: true },
      { id: "d1", room_id: "k", edge: 3, offset: 1, width: 0.9, kind: "door", entity: "binary_sensor.back_door" },
    ] }],
});

describe("open windows", () => {
  it("are the windows whose sensors are on, not doors, not those out of the rain", () => {
    const h = hassOf(["binary_sensor.kitchen_window", "binary_sensor.porch_window", "binary_sensor.back_door"].map((id) => st(id, "on")));
    expect(openWindows(plan(), h)).toEqual(["binary_sensor.kitchen_window"]);
  });

  it("make the banner and tint their rooms when rain is coming", () => {
    const p = plan();
    const l = new HassLive(p);
    l.now = () => NOW;
    l.update(hassOf([st("binary_sensor.kitchen_window", "on"), st("weather.home", "rainy")]));
    l.weather = "weather.home";
    expect(l.alerts().map((a) => a.text)).toEqual(["It's raining: Kitchen window open"]);
    l.setRainMarks(l.rainCheck()!.windows);
    expect(l.tint(p.floors[0], { id: "k" })).toEqual([0.25, 0.55, 1.0, 0.3]);
    l.update(hassOf([st("binary_sensor.kitchen_window", "off"), st("weather.home", "rainy")]));
    expect(l.rainCheck()).toBeNull();
  });
});

describe("a power cut", () => {
  const none = { status: null, grid: null, battery: null, batteryLevel: null };

  it("is what a grid status sensor says", () => {
    expect(powerCut(hassOf([st("binary_sensor.grid", "off", { device_class: "power" })]), { ...none, status: "binary_sensor.grid" }, NOW)).toEqual({ battery: null });
    expect(powerCut(hassOf([st("binary_sensor.grid", "on", { device_class: "power" })]), { ...none, status: "binary_sensor.grid" }, NOW)).toBeNull();
    expect(powerCut(hassOf([st("binary_sensor.grid_fault", "on", { device_class: "problem" })]), { ...none, status: "binary_sensor.grid_fault" }, NOW)).not.toBeNull();
    const text = (state: string) => powerCut(hassOf([st("sensor.inverter_grid_status", state), st("sensor.battery_soc", "64.4")]), { ...none, status: "sensor.inverter_grid_status", batteryLevel: "sensor.battery_soc" }, NOW);
    expect(text("Off Grid")).toEqual({ battery: 64 });
    expect(text("On Grid")).toBeNull();
  });

  it("is a UPS on its battery", () => {
    const h = hassOf([st("sensor.ups_status", "OB DISCHRG"), st("sensor.ups_battery_charge", "87")]);
    expect(powerCut(h, none, NOW)).toEqual({ battery: 87 });
    expect(powerCut(hassOf([st("sensor.ups_status", "OL CHRG")]), none, NOW)).toBeNull();
  });

  it("is the grid's power gone for 2 minutes while the battery still reports", () => {
    const src = { ...none, grid: "sensor.grid_power", batteryLevel: "sensor.battery_soc" };
    expect(powerCut(hassOf([st("sensor.grid_power", "unavailable", {}, 180_000), st("sensor.battery_soc", "41")]), src, NOW)).toEqual({ battery: 41 });
    expect(powerCut(hassOf([st("sensor.grid_power", "unavailable", {}, 60_000), st("sensor.battery_soc", "41")]), src, NOW), "a blip").toBeNull();
    // the whole inverter gone (its cloud, say): not a power cut
    expect(powerCut(hassOf([st("sensor.grid_power", "unavailable", {}, 180_000), st("sensor.battery_soc", "unavailable")]), src, NOW)).toBeNull();
  });
});
