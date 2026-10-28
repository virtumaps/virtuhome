import { describe, expect, it } from "vitest";
import { autoPlace } from "../src/auto/placement";
import { HassLive } from "../src/live/live";
import type { Hass, HassEntity } from "../src/live/hass";
import { normalizePlan, type Furniture } from "../src/model/plan";
import { buildFloor } from "../src/scene/build";
import { acMode, deviceGlow, fanTurns, gangsOf, gangWidth, heats, waterTemperature, wifiOffline } from "../src/scene/devices";
import { FURNITURE, styleOptions } from "../src/scene/furniture-lib";
import { DAY } from "../src/scene/palette";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const at = "2026-10-28T08:00:00Z";
const state = (entity_id: string, s: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state: s, attributes, last_changed: at, last_updated: at });
const piece = (type: string, extra: Partial<Furniture> = {}): Furniture => {
  const [w, d, h] = FURNITURE[type].size;
  return { id: "p", type, x: 1, z: 0.2, rotation: 0, w, d, h, ...extra };
};

/** A hall and a living room side by side, with a door between them hinged at its top end. */
const plan = (furniture: Furniture[] = []) => normalizePlan({
  version: 1,
  settings: {},
  floors: [{
    id: "g", name: "Ground", elevation: 0, height: 2.6,
    rooms: [
      { id: "hall", name: "Hallway", area_id: "hallway", points: rect(0, 0, 2, 4) },
      { id: "living", name: "Living Room", area_id: "living_room", points: rect(2, 0, 6, 4) },
    ],
    openings: [{ id: "o1", room_id: "living", edge: 3, offset: 2, width: 0.8, height: 2, sill: 0, kind: "door", hinge: "left", swing: "in" }],
    furniture, devices: [], walls: [],
  }],
});

describe("switches and sockets", () => {
  it("have a gang for each entity, one unless set, at most four", () => {
    expect(gangsOf(piece("switch_wall", { entity: "light.hall" }))).toEqual(["light.hall"]);
    expect(gangsOf(piece("switch_wall", { entity: "light.a", gangs: ["light.a", "", "light.c"] }))).toEqual(["light.a", null, "light.c"]);
    expect(gangsOf(piece("socket_wall", { gangs: ["switch.a", "switch.b", "switch.c", "switch.d", "switch.e"] })).length).toBe(4);
    expect(gangsOf(piece("socket_wall", { gangs: [] }))).toEqual([null]);
    // anything else has its one entity
    expect(gangsOf(piece("access_point", { entity: "binary_sensor.ap", gangs: ["x.y"] }))).toEqual(["binary_sensor.ap"]);
    expect([1, 2, 3, 4].map(gangWidth)).toEqual([0.086, 0.146, 0.206, 0.266]);
    expect(styleOptions("switch_wall")).toContain("socket_wall");
    expect(styleOptions("access_point")).toContain("wifi_point");
  });

  it("light each gang with its own entity, and can be tapped as a whole", () => {
    const p = plan([piece("switch_wall", { entity: "light.a", gangs: ["light.a", null, "switch.c"], w: gangWidth(3) }), piece("access_point", { id: "ap", entity: "binary_sensor.synology_srm_wan_status" })]);
    const fb = buildFloor(p, 0, DAY, { low: true });
    expect(fb.glows.filter((g) => g.type === "switch_wall").map((g) => g.entity)).toEqual(["light.a", null, "switch.c"]);
    // each rocker lights with its own glow
    const slots = new Set(fb.opaque.glow.filter((g, v) => g >= 0 && fb.items[fb.opaque.item[v]]?.id === "p"));
    expect(slots.size).toBe(3);
    expect(fb.targets.map((t) => t.entities)).toEqual([["light.a", "switch.c"], ["binary_sensor.synology_srm_wan_status"]]);
    // the access point hangs from the ceiling
    expect(fb.targets[1].pos[1]).toBeGreaterThan(2.4);
  });

  it("glow while on, an access point red while offline", () => {
    expect(deviceGlow("switch_wall", state("light.a", "on"))).not.toBeNull();
    expect(deviceGlow("socket_wall", state("switch.christmas_tree_socket_1", "off", { device_class: "outlet" }))).toBeNull();
    expect(deviceGlow("socket_wall", state("switch.a", "unavailable"))).toBeNull();
    const online = deviceGlow("access_point", state("binary_sensor.synology_srm_wan_status", "on", { device_class: "connectivity" }))!;
    const offline = deviceGlow("access_point", state("binary_sensor.synology_srm_wan_status", "off", { device_class: "connectivity" }))!;
    expect(offline[0]).toBeGreaterThan(offline[2]);
    expect(online[2]).toBeGreaterThan(online[0]);
    for (const s of ["unavailable", "unknown", "not_home", "disconnected"]) expect(wifiOffline(state("device_tracker.ap", s)), s).toBe(true);
    for (const s of ["home", "on", "12345"]) expect(wifiOffline(state("sensor.ap_uptime", s)), s).toBe(false);
    expect(wifiOffline(undefined)).toBe(true);
  });

  it("show their states in the view, and an access point with nothing linked shows nothing", () => {
    const l = new HassLive(plan());
    l.update({ states: { "light.b": state("light.b", "on"), "sensor.ap": state("sensor.ap", "unavailable") }, entities: {} } as unknown as Hass);
    expect(l.glowColor({ kind: "screen", entity: "light.b", room: 0, type: "switch_wall" })).not.toBeNull();
    expect(l.glowColor({ kind: "screen", entity: "light.missing", room: 0, type: "switch_wall" })).toBeNull();
    expect(l.glowColor({ kind: "screen", entity: "sensor.ap", room: 0, type: "access_point" })![0]).toBe(1);
    expect(l.glowColor({ kind: "screen", entity: null, room: 0, type: "access_point" })).toBeNull();
  });
});

describe("Smart Setup with switches and plugs", () => {
  const hass = (): Hass => {
    const states: Record<string, HassEntity> = {
      "switch.living_room_relay_1": state("switch.living_room_relay_1", "on", { friendly_name: "Living Room Relay 1" }),
      "switch.living_room_relay_2": state("switch.living_room_relay_2", "off", { friendly_name: "Living Room Relay 2" }),
      "switch.christmas_tree_socket_1": state("switch.christmas_tree_socket_1", "on", { device_class: "outlet", friendly_name: "Christmas Tree Socket 1" }),
    };
    return {
      states,
      entities: {
        "switch.living_room_relay_1": { entity_id: "switch.living_room_relay_1", device_id: "relay", area_id: "living_room" },
        "switch.living_room_relay_2": { entity_id: "switch.living_room_relay_2", device_id: "relay", area_id: "living_room" },
        "switch.christmas_tree_socket_1": { entity_id: "switch.christmas_tree_socket_1", device_id: "tree", area_id: "living_room" },
      },
      devices: { relay: { id: "relay", name: "Shelly Plus 2PM" }, tree: { id: "tree", name: "Christmas Tree Socket" } },
      areas: { living_room: { area_id: "living_room", name: "Living Room" }, hallway: { area_id: "hallway", name: "Hallway" } },
    } as unknown as Hass;
  };

  it("puts a wall switch beside the door, on the side away from its hinges, and a plug on a socket", () => {
    const { plan: p, report } = autoPlace(plan(), hass());
    const f = p.floors[0].furniture;
    const sw = f.find((x) => x.type === "switch_wall")!;
    expect(sw.gangs).toEqual(["switch.living_room_relay_1", "switch.living_room_relay_2"]);
    expect(sw.w).toBe(gangWidth(2));
    // on the living room's side of the 0.12 m wall at x = 2, facing into it (+x)
    expect(sw.x).toBeCloseTo(2 + 0.06 + sw.d / 2, 3);
    expect(sw.rotation).toBe(-90);
    // the door runs from z = 2.4 down to 1.6 along the room's edge (4 -> 0), hinged at its start
    expect(Math.abs(sw.z - 2) - 0.4).toBeGreaterThan(0.1);
    const sock = f.find((x) => x.type === "socket_wall")!;
    expect(sock.entity).toBe("switch.christmas_tree_socket_1");
    expect(sock.gangs).toBeUndefined();
    expect(p.floors[0].devices).toEqual([]);
    expect(report.placed).toEqual(expect.arrayContaining(["Shelly Plus 2PM → Living Room", "Christmas Tree Socket → Living Room"]));
    // and leaves them where they are the next time
    expect(autoPlace(p, hass()).plan.floors[0].furniture.length).toBe(2);
  });
});

describe("fans, air conditioners, radiators and hot water", () => {
  it("turn a fan's blades with its speed only while it runs", () => {
    expect(fanTurns(state("fan.living_room", "off", { percentage: 100 }))).toBe(0);
    expect(fanTurns(state("fan.living_room", "on", { percentage: 0 }))).toBe(0);
    expect(fanTurns(state("fan.living_room", "on", { percentage: 100 }))).toBe(1);
    expect(fanTurns(state("fan.living_room", "on", { percentage: 33 }))).toBeLessThan(fanTurns(state("fan.living_room", "on", { percentage: 66 })));
    // a fan on a plug has no speed
    expect(fanTurns(state("switch.fan_plug", "on"))).toBeGreaterThan(0);
    expect(fanTurns(state("fan.living_room", "unavailable"))).toBe(0);
  });

  it("tell what an air conditioner and a radiator do", () => {
    const ac = (s: string, action?: string) => acMode(state("climate.bedroom_ac", s, action ? { hvac_action: action } : {}));
    expect([ac("cool", "cooling"), ac("heat", "heating"), ac("fan_only", "fan"), ac("dry", "drying"), ac("cool", "idle"), ac("off", "off")]).toEqual(["cooling", "heating", "fan", "drying", null, null]);
    // without hvac_action, its mode while on
    expect([ac("cool"), ac("fan_only"), ac("auto")]).toEqual(["cooling", "fan", null]);
    expect(heats(state("climate.bedroom_trv", "heat", { hvac_action: "heating" }))).toBe(true);
    expect(heats(state("climate.thermostat_2", "heat", { hvac_action: "idle", hvac_modes: ["auto", "heat", "off"] }))).toBe(false);
    expect(heats(state("valve.kitchen_underfloor", "open"))).toBe(true);
    expect(heats(state("valve.kitchen_underfloor", "closed", { current_position: 0 }))).toBe(false);
    expect(heats(state("switch.towel_rail", "on"))).toBe(true);
    expect(deviceGlow("radiator", state("switch.towel_rail", "off"))).toBeNull();
    expect(deviceGlow("ac_wall", state("climate.bedroom_ac", "cool", { hvac_action: "cooling" }))![2]).toBe(1);
  });

  it("read a hot water cylinder's temperature", () => {
    expect(waterTemperature(state("water_heater.hot_water", "eco", { current_temperature: 52, temperature: 55 }))).toEqual({ current: 52, target: 55 });
    expect(waterTemperature(state("water_heater.hot_water", "off", { current_temperature: 40, temperature: 55 }))).toEqual({ current: 40, target: null });
    expect(waterTemperature(state("sensor.cylinder_temperature", "48.5", { unit_of_measurement: "°C" }))).toEqual({ current: 48.5, target: null });
    expect(waterTemperature(state("sensor.cylinder_temperature", "unavailable"))).toBeNull();
    const l = new HassLive(plan());
    l.update({ states: { "water_heater.hot_water": state("water_heater.hot_water", "eco", { current_temperature: 52, temperature: 55 }) }, entities: {} } as unknown as Hass);
    expect(l.pieceReading(piece("hot_water_cylinder", { entity: "water_heater.hot_water" }))).toEqual({ text: "52.0° → 55°", icon: "water" });
  });

  it("put a fan's blades into the moving parts and its light among the lamps", () => {
    const fan = piece("fan_ceiling_light", { x: 4, z: 2, entity: "fan.lounge", light: "light.lounge_fan" });
    const fb = buildFloor(plan([fan]), 0, DAY, { low: true });
    expect(fb.fans.map((f) => f.furniture.id)).toEqual(["p"]);
    expect(fb.lamps.map((l) => l.entity)).toEqual(["light.lounge_fan"]);
    expect(fb.targets[0].entities).toEqual(["fan.lounge", "light.lounge_fan"]);
    // the blades are not in the floor's own mesh
    expect(fb.opaque.surfaces.includes("role:wood")).toBe(false);
  });

  it("warm a room whose radiator heats, cool one whose air conditioner cools, and never warm the house with it", () => {
    const p = plan([
      piece("ac_wall", { id: "ac", x: 4, z: 0.26, entity: "climate.lounge_ac" }),
      piece("radiator", { id: "rad", x: 1, z: 3.8, entity: "climate.hall_trv" }),
    ]);
    const l = new HassLive(p);
    const states = (ac: string, action: string) => ({
      "climate.lounge_ac": state("climate.lounge_ac", ac, { hvac_action: action, hvac_modes: ["off", "cool", "fan_only"] }),
      "climate.hall_trv": state("climate.hall_trv", "heat", { hvac_action: "heating" }),
    });
    l.update({ states: states("cool", "cooling"), entities: {} } as unknown as Hass);
    const tint = (id: string) => l.tint(p.floors[0], { id });
    expect(tint("hall")![0]).toBeGreaterThan(tint("hall")![2]);
    expect(tint("living")![2]).toBeGreaterThan(tint("living")![0]);
    l.update({ states: states("fan_only", "fan"), entities: {} } as unknown as Hass);
    expect(tint("living")).not.toBeNull();
    // only an air conditioner and a valve: the rest of the house is not warmed by either
    const lone = plan([piece("ac_wall", { id: "ac", x: 4, z: 0.26, entity: "climate.lounge_ac" })]);
    const l2 = new HassLive(lone);
    l2.update({ states: { "climate.lounge_ac": state("climate.lounge_ac", "heat", { hvac_action: "heating" }) }, entities: {} } as unknown as Hass);
    expect(l2.tint(lone.floors[0], { id: "hall" })).toBeNull();
  });
});

describe("radiators and the rooms they warm", () => {
  const thermostat = { id: "d1", entity: "climate.thermostat", x: 1, z: 2 };
  const withThermostat = (furniture: Furniture[]) => {
    const p = plan(furniture);
    p.floors[0].devices.push(thermostat);
    return p;
  };
  const update = (l: HassLive, states: HassEntity[]) => l.update({ states: Object.fromEntries(states.map((x) => [x.entity_id, x])), entities: {} } as unknown as Hass);

  it("count a radiator valve as its room's, and the house's thermostat on a radiator only as warming it", () => {
    const p = withThermostat([
      piece("radiator", { id: "r1", x: 4, z: 3.9, entity: "climate.thermostat" }),
      piece("radiator", { id: "r2", x: 1, z: 3.9, entity: "climate.hall_trv" }),
    ]);
    const l = new HassLive(p);
    update(l, [
      state("climate.thermostat", "heat", { hvac_action: "heating", current_temperature: 20.5, temperature: 21 }),
      state("climate.hall_trv", "heat", { hvac_action: "idle", current_temperature: 19, temperature: 18 }),
    ]);
    const room = (id: string) => ({ floor: p.floors[0], room: { id } });
    // the living room keeps its own reading (none here); it glows while the house's heating is on
    expect(l.roomText(room("living").floor, room("living").room)).toBeNull();
    expect(l.tint(p.floors[0], { id: "living" })).not.toBeNull();
    // the hall's label shows the valve's and the thermostat's
    expect(l.roomLine(room("hall").floor, room("hall").room)[0].text).toBe("20.5° → 21°");
  });

  it("warm their room while their valve is open or their switch is on", () => {
    const p = plan([piece("underfloor_heating", { x: 4, z: 2, w: 2, d: 2, entity: "valve.lounge_underfloor" }), piece("towel_rail", { id: "t", x: 1, z: 3.9, entity: "switch.towel_rail" })]);
    const l = new HassLive(p);
    update(l, [state("valve.lounge_underfloor", "open"), state("switch.towel_rail", "off")]);
    expect(l.tint(p.floors[0], { id: "living" })).not.toBeNull();
    expect(l.tint(p.floors[0], { id: "hall" })).toBeNull();
    update(l, [state("valve.lounge_underfloor", "closed"), state("switch.towel_rail", "on")]);
    expect(l.tint(p.floors[0], { id: "living" })).toBeNull();
    expect(l.tint(p.floors[0], { id: "hall" })).not.toBeNull();
  });
});

describe("Smart Setup with fans and air conditioners", () => {
  const hass = (): Hass => ({
    states: {
      "fan.living_room_fan": state("fan.living_room_fan", "on", { percentage: 50, friendly_name: "Living Room Fan" }),
      "light.living_room_fan_light": state("light.living_room_fan_light", "off", { friendly_name: "Living Room Fan Light" }),
      // an air purifier is a fan too (Philips AC0950)
      "fan.bedroom": state("fan.bedroom", "on", { preset_modes: ["auto", "turbo", "medium", "sleep"], percentage: null, friendly_name: "Bedroom" }),
      "climate.living_room_ac": state("climate.living_room_ac", "cool", { hvac_modes: ["off", "cool", "heat", "fan_only", "dry"], hvac_action: "cooling" }),
      "climate.thermostat_2": state("climate.thermostat_2", "heat", { hvac_modes: ["auto", "heat", "off"] }),
    },
    entities: {
      "fan.living_room_fan": { entity_id: "fan.living_room_fan", device_id: "fan", area_id: "living_room" },
      "light.living_room_fan_light": { entity_id: "light.living_room_fan_light", device_id: "fan", area_id: "living_room" },
      "fan.bedroom": { entity_id: "fan.bedroom", device_id: "purifier", area_id: "hallway" },
      "climate.living_room_ac": { entity_id: "climate.living_room_ac", device_id: "ac", area_id: "living_room" },
      "climate.thermostat_2": { entity_id: "climate.thermostat_2", device_id: "hive", area_id: "hallway" },
    },
    devices: {
      fan: { id: "fan", name: "Living Room Fan", model: "Ceiling fan" },
      purifier: { id: "purifier", name: "Bedroom", manufacturer: "Philips", model: "AC0950/10" },
      ac: { id: "ac", name: "Living Room Air Conditioner" },
      hive: { id: "hive", name: "Thermostat 2" },
    },
    areas: { living_room: { area_id: "living_room", name: "Living Room" }, hallway: { area_id: "hallway", name: "Hallway" } },
  }) as unknown as Hass;

  it("hangs a ceiling fan with its light, and an air conditioner on an outside wall with its outdoor unit outside", () => {
    const { plan: p } = autoPlace(plan(), hass());
    const f = p.floors[0];
    const fan = f.furniture.find((x) => x.type === "fan_ceiling_light")!;
    expect([fan.entity, fan.light]).toEqual(["fan.living_room_fan", "light.living_room_fan_light"]);
    expect(f.devices.some((d) => d.entity.startsWith("light.living_room_fan"))).toBe(false);
    // the purifier and the heating's thermostat stay pins
    expect(f.devices.map((d) => d.entity).sort()).toEqual(["climate.thermostat_2", "fan.bedroom"]);
    const ac = f.furniture.find((x) => x.type === "ac_wall")!;
    const out = f.furniture.find((x) => x.type === "ac_outdoor")!;
    expect(ac.entity).toBe("climate.living_room_ac");
    expect(out.entity).toBe("climate.living_room_ac");
    // in the middle of the living room's outside wall at z = 0 (0.28 m thick), facing in; its outdoor unit outside it
    expect([ac.x, ac.z, ac.rotation]).toEqual([4, 0.14 + ac.d / 2, 0]);
    expect(out.x).toBe(4);
    expect(out.z + out.d / 2).toBeLessThan(-0.14);
    expect(Math.abs(out.rotation)).toBe(180);
  });
});
