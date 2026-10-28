import { describe, expect, it } from "vitest";
import { autoPlace } from "../src/auto/placement";
import { HassLive } from "../src/live/live";
import type { Hass, HassEntity } from "../src/live/hass";
import { normalizePlan, type Furniture } from "../src/model/plan";
import { buildFloor } from "../src/scene/build";
import { deviceGlow, gangsOf, gangWidth, linkedEntities, wifiOffline } from "../src/scene/devices";
import { entityUses, replaceEntity } from "../src/model/links";
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

describe("a switch's gangs in the plan's links", () => {
  it("are followed when renamed and counted as placed", () => {
    const p = plan([piece("switch_wall", { entity: "light.a", gangs: ["light.a", "light.b"] })]);
    expect(entityUses(p).map((u) => u.entity)).toEqual(expect.arrayContaining(["light.a", "light.b"]));
    replaceEntity(p, "light.b", "light.b2");
    expect(p.floors[0].furniture[0].gangs).toEqual(["light.a", "light.b2"]);
    expect(linkedEntities(p.floors[0].furniture[0])).toEqual(["light.a", "light.b2"]);
  });
});
