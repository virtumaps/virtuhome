import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { gpsMetres, grow, mirrored, readValetudo, robotSources, robotToPlan, valetudoChunk, valetudoMap, TRAIL_MAX } from "../src/live/robots";
import { HassLive } from "../src/live/live";
import { normalizePlan, type Device, type Plan, type RobotMap, type Vec2 } from "../src/model/plan";
import type { Hass, HassEntity } from "../src/live/hass";

const close = (a: Vec2, b: Vec2) => {
  expect(a[0]).toBeCloseTo(b[0], 6);
  expect(a[1]).toBeCloseTo(b[1], 6);
};

describe("lining a robot's map up with the plan", () => {
  it("puts both spots where they are on the plan, and what is between them between", () => {
    // a map in millimetres, turned a quarter and moved
    const map: RobotMap = { spots: [{ robot: [25000, 25000], plan: [1, 2] }, { robot: [29000, 25000], plan: [1, 6] }] };
    const f = robotToPlan(map, false)!;
    close(f([25000, 25000]), [1, 2]);
    close(f([29000, 25000]), [1, 6]);
    close(f([27000, 25000]), [1, 4]);
    // a quarter turn clockwise on the plan (x right, z down): +y on the map goes to -x
    close(f([25000, 26000]), [0, 2]);
  });

  it("mirrors a map whose y runs up before lining it up", () => {
    const map: RobotMap = { spots: [{ robot: [0, 0], plan: [0, 0] }, { robot: [1000, 0], plan: [1, 0] }] };
    close(robotToPlan(map, true)!([0, 1000]), [0, -1]);
    close(robotToPlan(map, false)!([0, 1000]), [0, 1]);
  });

  it("waits for two spots that are apart", () => {
    expect(robotToPlan(null, false)).toBeNull();
    expect(robotToPlan({ spots: [{ robot: [0, 0], plan: [0, 0] }] }, false)).toBeNull();
    expect(robotToPlan({ spots: [{ robot: [5, 5], plan: [0, 0] }, { robot: [5, 5], plan: [3, 0] }] }, false)).toBeNull();
    expect(robotToPlan({ spots: [{ robot: [0, 0], plan: [0, 0] }, { robot: [900, 0], plan: [0.1, 0] }] }, false)).toBeNull();
  });

  it("tells a mirrored map from its calibration points", () => {
    const cam = (cal: unknown): HassEntity => ({ entity_id: "camera.map", state: "idle", attributes: { vacuum_position: { x: 1, y: 2 }, calibration_points: cal }, last_changed: "", last_updated: "" });
    // the Xiaomi way: the robot's y up, the picture's down
    expect(mirrored(cam([{ vacuum: { x: 25500, y: 25500 }, map: { x: 466, y: 1083 } }, { vacuum: { x: 26500, y: 25500 }, map: { x: 486, y: 1083 } }, { vacuum: { x: 25500, y: 26500 }, map: { x: 466, y: 1063 } }]), "position"), "y up").toBe(true);
    expect(mirrored(cam([{ vacuum: { x: 0, y: 0 }, map: { x: 0, y: 0 } }, { vacuum: { x: 100, y: 0 }, map: { x: 20, y: 0 } }, { vacuum: { x: 0, y: 100 }, map: { x: 0, y: 20 } }]), "position"), "y down").toBe(false);
    expect(mirrored(cam(undefined), "position")).toBe(true);
    expect(mirrored(undefined, "valetudo")).toBe(false);
    expect(mirrored(undefined, "gps")).toBe(false);
  });

  it("turns GPS into metres east and south of home", () => {
    const [e, s] = gpsMetres(51.50009, -0.12745, 51.5, -0.1276);
    expect(e).toBeCloseTo(10.4, 1);
    expect(s).toBeCloseTo(-10, 1);
  });
});

/** A PNG with Valetudo's map in a zTXt chunk (the picture itself left out: only the chunks are read). */
function valetudoPng(map: unknown): ArrayBuffer {
  const chunk = (type: string, data: Uint8Array) => {
    const out = new Uint8Array(12 + data.length);
    new DataView(out.buffer).setUint32(0, data.length);
    out.set([...type].map((c) => c.charCodeAt(0)), 4);
    out.set(data, 8);
    return out;
  };
  const text = new Uint8Array([...new TextEncoder().encode("ValetudoMap"), 0, 0, ...deflateSync(JSON.stringify(map))]);
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", new Uint8Array(13)), chunk("zTXt", text), chunk("IEND", new Uint8Array())];
  const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    all.set(p, at);
    at += p.length;
  }
  return all.buffer;
}

const VALETUDO = {
  entities: [
    { __class: "PointMapEntity", type: "robot_position", points: [2510, 2620], metaData: { angle: 90 } },
    { __class: "PointMapEntity", type: "charger_location", points: [2400, 2500] },
    { __class: "PathMapEntity", type: "path", points: [2400, 2500, 2450, 2500, 2510, 2620] },
  ],
};

describe("Valetudo's map", () => {
  it("reads the robot, its dock and its path from the map's JSON", () => {
    expect(readValetudo(VALETUDO)).toEqual({ robot: [2510, 2620], dock: [2400, 2500], path: [[2400, 2500], [2450, 2500], [2510, 2620]] });
    expect(readValetudo({})).toEqual({ robot: null, dock: null, path: [] });
  });

  it("finds it in the map picture and unpacks it", async () => {
    const png = valetudoPng(VALETUDO);
    expect(valetudoChunk(png)).not.toBeNull();
    expect((await valetudoMap(png))?.robot).toEqual([2510, 2620]);
    expect(await valetudoMap(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer)).toBeNull();
  });
});

const state = (entity_id: string, s: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state: s, attributes, last_changed: "", last_updated: "" });

function hassOf(states: HassEntity[], devices: Record<string, string> = {}): Hass {
  return {
    states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
    entities: Object.fromEntries(states.map((s) => [s.entity_id, { entity_id: s.entity_id, device_id: devices[s.entity_id] ?? null }])),
    config: { latitude: 51.5, longitude: -0.1276 },
  } as unknown as Hass;
}

describe("where a robot's position comes from", () => {
  it("its own device's map camera first, then any; Valetudo's map data; a mower's own GPS only", () => {
    const hass = hassOf([
      state("vacuum.robbie", "docked"),
      state("camera.other_map", "idle", { vacuum_position: { x: 1, y: 2 } }),
      state("camera.robbie_map", "idle", { vacuum_position: { x: 1, y: 2 } }),
      state("camera.valetudo_robbie_map_data", "idle"),
      state("lawn_mower.mo", "docked"),
      state("device_tracker.mo", "home", { latitude: 51.5, longitude: -0.1 }),
      state("device_tracker.phone", "home", { latitude: 51.5, longitude: -0.1 }),
    ], { "vacuum.robbie": "rob", "camera.robbie_map": "rob", "lawn_mower.mo": "mo", "device_tracker.mo": "mo" });
    expect(robotSources(hass, "vacuum.robbie")).toEqual([
      { entity: "camera.robbie_map", kind: "position" },
      { entity: "camera.other_map", kind: "position" },
      { entity: "camera.valetudo_robbie_map_data", kind: "valetudo" },
    ]);
    expect(robotSources(hass, "lawn_mower.mo")).toEqual([{ entity: "device_tracker.mo", kind: "gps" }]);
  });
});

describe("a robot on the plan", () => {
  const plan = (robot?: RobotMap): Plan => normalizePlan({
    version: 1, settings: {},
    floors: [{ id: "g", name: "Ground", elevation: 0, height: 2.6, rooms: [], openings: [], furniture: [], walls: [],
      devices: [{ id: "r", entity: "vacuum.robbie", x: 0.5, z: 0.5, mount: "floor", ...(robot ? { robot } : {}) }] }],
  });
  const LINED: RobotMap = { mirror: false, spots: [{ robot: [0, 0], plan: [0, 0] }, { robot: [1000, 0], plan: [1, 0] }] };
  const at = (s: string, x: number, y: number) => [state("vacuum.robbie", s), state("camera.robbie_map", "idle", { vacuum_position: { x, y } })];

  it("stays at its pin until its map is lined up, then goes where it is", async () => {
    const p = plan();
    const l = new HassLive(p);
    l.update(hassOf(at("cleaning", 2000, 1000)));
    expect(await l.tickRobots(0)).toBe(false);
    const d = p.floors[0].devices[0] as Device;
    expect(l.robotAt(d)).toBeNull();
    expect(await l.robotFix(d)).toEqual([2000, 1000]);

    const lined = plan(LINED);
    const l2 = new HassLive(lined);
    l2.update(hassOf(at("cleaning", 2000, 1000)));
    expect(await l2.tickRobots(0)).toBe(true);
    close(l2.robotAt(lined.floors[0].devices[0])!, [2, 1]);
  });

  it("leaves a trail while it works, a new one each run, and none at its dock", async () => {
    const p = plan(LINED);
    const d = p.floors[0].devices[0];
    const l = new HassLive(p);
    const go = async (s: string, x: number, y: number) => {
      l.update(hassOf(at(s, x, y)));
      return l.tickRobots(0);
    };
    await go("cleaning", 0, 0);
    await go("cleaning", 1000, 0);
    // a step under 2 cm is no move
    expect(await go("cleaning", 1010, 0)).toBe(false);
    await go("cleaning", 1000, 2000);
    expect(l.robotTrail(d)).toHaveLength(3);
    await go("docked", 0, 0);
    expect(l.robotTrail(d)).toEqual([]);
    await go("cleaning", 500, 0);
    expect(l.robotTrail(d)).toHaveLength(1);
    // a replay of the past keeps it at its pin
    l.robotsShown = false;
    expect(l.robotAt(d)).toBeNull();
  });

  it("keeps long trails short", () => {
    let trail: Vec2[] = [];
    for (let i = 0; i < 3000; i++) trail = grow(trail, [i * 0.1, 0]);
    expect(trail.length).toBeLessThanOrEqual(TRAIL_MAX);
    close(trail[trail.length - 1], [299.9, 0]);
  });

  it("keeps a saved map as far as it makes sense", () => {
    const p = normalizePlan({ version: 1, floors: [{ id: "g", name: "G", elevation: 0, height: 2.6, rooms: [], devices: [
      { id: "a", entity: "vacuum.a", x: 0, z: 0, robot: { source: "", spots: [{ robot: [1, 2], plan: [0, 0] }, { robot: [1], plan: [0, 0] }, { plan: [1, 1] }], mirror: "x" } },
      { id: "b", entity: "vacuum.b", x: 0, z: 0, robot: "nonsense" },
      { id: "c", entity: "light.c", x: 0, z: 0 },
    ] }] });
    expect(p.floors[0].devices.map((d) => d.robot)).toEqual([{ source: null, spots: [{ robot: [1, 2], plan: [0, 0] }], mirror: null }, null, undefined]);
  });
});
