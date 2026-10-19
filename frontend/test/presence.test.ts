import { describe, expect, it } from "vitest";
import { HassLive } from "../src/live/live";
import { areaNamed, hereText, roomOf, roomTrackers, slug, sourcesOf } from "../src/live/presence";
import { normalizePlan, type Floor, type Plan } from "../src/model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** A hall and a living room downstairs, a landing in the hall's area and a study (linked to no area) upstairs. */
const plan = (settings: Plan["settings"] | object = {}, devices: { entity: string; x: number; z: number }[] = []) => normalizePlan({
  version: 1,
  settings,
  floors: [
    {
      id: "g", name: "Ground Floor", ha_floor: "ground", elevation: 0, height: 2.6,
      rooms: [
        { id: "hall", name: "Hallway", area_id: "hallway", points: rect(0, 0, 2, 4) },
        { id: "living", name: "Living Room", area_id: "living_room", points: rect(2, 0, 6, 4) },
      ],
      openings: [], furniture: [], walls: [],
      devices: devices.map((d, i) => ({ id: `d${i}`, ...d })),
    },
    {
      id: "f", name: "First Floor", ha_floor: "first", elevation: 2.6, height: 2.5,
      rooms: [
        { id: "landing", name: "Landing", area_id: "hallway", points: rect(0, 0, 2, 4) },
        { id: "study", name: "Study", area_id: null, points: rect(2, 0, 6, 4) },
      ],
      openings: [], furniture: [], devices: [], walls: [],
    },
  ],
});

type States = Record<string, [string, Record<string, unknown>?]>;

function hassOf(states: States, reg: Record<string, Partial<HassEntityReg>> = {}, hallFloor = "ground"): Hass {
  const s: Record<string, HassEntity> = {};
  for (const [id, [state, attributes]] of Object.entries(states)) {
    s[id] = { entity_id: id, state, attributes: attributes ?? {}, last_changed: "2026-10-19T12:00:00Z", last_updated: "2026-10-19T12:00:00Z" };
  }
  const entities = Object.fromEntries(Object.keys(states).map((id) => [id, { entity_id: id, ...reg[id] }]));
  return {
    states: s,
    entities,
    devices: { phone: { id: "phone", name: "Kadir's iPhone" } },
    areas: {
      hallway: { area_id: "hallway", name: "Hallway", floor_id: hallFloor },
      living_room: { area_id: "living_room", name: "Living Room", floor_id: "ground", aliases: ["Lounge"] },
      kitchen: { area_id: "kitchen", name: "Kitchen", floor_id: "ground" },
    },
  } as unknown as Hass;
}

const bermuda = (area: string | null, name = "Kadir's iPhone Area"): [string, Record<string, unknown>] =>
  [area ? { hallway: "Hallway", living_room: "Living Room" }[area] ?? area : "unknown", { friendly_name: name, area_id: area, area_name: area }];

describe("which area a tracker names", () => {
  const hass = hassOf({
    "sensor.a": ["Living Room", { area_id: "living_room" }],
    "sensor.b": ["living_room"],
    "sensor.c": ["Lounge"],
    "sensor.d": ["not_home"],
    "sensor.e": ["Garage"],
  });
  it("reads Bermuda's area_id, area names, ids and aliases", () => {
    expect(areaNamed(hass, hass.states["sensor.a"])).toBe("living_room");
    expect(areaNamed(hass, hass.states["sensor.b"])).toBe("living_room");
    expect(areaNamed(hass, hass.states["sensor.c"])).toBe("living_room");
  });
  it("knows away and rooms Home Assistant hasn't got", () => {
    expect(areaNamed(hass, hass.states["sensor.d"])).toBeNull();
    expect(areaNamed(hass, hass.states["sensor.e"])).toBeNull();
  });
  it("reads names the same with any apostrophe", () => {
    expect(slug("Kadir’s iPhone")).toBe(slug("Kadir's iPhone"));
    expect(slug("Living-Room ")).toBe("living_room");
  });
});

describe("which room of the plan", () => {
  it("takes the room linked to the area, on the area's own storey", () => {
    const p = plan();
    expect(roomOf(p, hassOf({ "sensor.x": ["Hallway"] }), hassOf({ "sensor.x": ["Hallway"] }).states["sensor.x"])).toEqual({ floor: 0, room: 0 });
    const upstairs = hassOf({ "sensor.x": ["Hallway"] }, {}, "first");
    expect(roomOf(p, upstairs, upstairs.states["sensor.x"])).toEqual({ floor: 1, room: 0 });
  });
  it("finds a room linked to no area by its name", () => {
    const h = hassOf({ "sensor.x": ["study"] });
    expect(roomOf(plan(), h, h.states["sensor.x"])).toEqual({ floor: 1, room: 1 });
  });
  it("leaves out an area with no room in the plan", () => {
    const h = hassOf({ "sensor.x": ["Kitchen"] });
    expect(roomOf(plan(), h, h.states["sensor.x"])).toBeNull();
  });
});

describe("finding room trackers", () => {
  const hass = hassOf({
    "sensor.kadirs_iphone_area": bermuda("living_room"),
    "sensor.kadirs_iphone_area_last_seen": ["Living Room", { friendly_name: "Kadir's iPhone Area Last Seen", area_id: "living_room" }],
    "sensor.kadirs_iphone_distance": ["1.2", { friendly_name: "Kadir's iPhone Distance", area_id: "living_room" }],
    "sensor.thea_watch": ["not_home", { friendly_name: "Thea Watch" }],
    "device_tracker.kadirs_iphone": ["home", { friendly_name: "Kadir’s iPhone", latitude: 53.1 }],
    "device_tracker.kadirs_iphone_bermuda_tracker": ["home", { friendly_name: "Kadir's iPhone Bermuda Tracker" }],
    "device_tracker.thea_companion": ["hallway", { friendly_name: "Thea" }],
    "sensor.samsung_tag_area": bermuda("hallway", "Samsung Tag Area"),
    "person.kadir": ["home", { friendly_name: "Kadir", device_trackers: ["device_tracker.kadirs_iphone_bermuda_tracker"] }],
    "person.thea": ["home", { friendly_name: "Thea", device_trackers: ["device_tracker.thea_companion"] }],
    "person.sam": ["home", { friendly_name: "Sam" }],
  }, {
    "sensor.kadirs_iphone_area": { platform: "bermuda", device_id: "phone" },
    "sensor.kadirs_iphone_area_last_seen": { platform: "bermuda", device_id: "phone" },
    "sensor.kadirs_iphone_distance": { platform: "bermuda", device_id: "phone" },
    "device_tracker.kadirs_iphone_bermuda_tracker": { platform: "bermuda", device_id: "phone" },
    "device_tracker.kadirs_iphone": { platform: "mobile_app" },
    "sensor.thea_watch": { platform: "mqtt_room" },
    "device_tracker.thea_companion": { platform: "mqtt" },
    "sensor.samsung_tag_area": { platform: "bermuda" },
  });

  it("offers Bermuda's Area sensors, mqtt_room and trackers that name a room, nothing else", () => {
    expect(roomTrackers(hass)).toEqual(["device_tracker.thea_companion", "sensor.kadirs_iphone_area", "sensor.samsung_tag_area", "sensor.thea_watch"]);
  });
  it("finds Bermuda's Area on the device of a person's tracker", () => {
    expect(sourcesOf(hass, "person.kadir", null)).toContain("sensor.kadirs_iphone_area");
  });
  it("takes a person's own tracker that names rooms, and a tracker named after them", () => {
    expect(sourcesOf(hass, "person.thea", null)).toEqual(["device_tracker.thea_companion", "sensor.thea_watch"]);
  });
  it("matches whole names only", () => {
    expect(sourcesOf(hass, "person.sam", null)).toEqual([]);
  });
  it("uses the tracker picked by hand, or none", () => {
    expect(sourcesOf(hass, "person.sam", { people: { "person.sam": "sensor.samsung_tag_area" } })).toEqual(["sensor.samsung_tag_area"]);
    expect(sourcesOf(hass, "person.kadir", { people: { "person.kadir": null } })).toEqual([]);
  });
});

describe("people in their rooms", () => {
  const reg = { "sensor.kadirs_iphone_area": { platform: "bermuda", device_id: "phone" }, "device_tracker.bt": { platform: "bermuda", device_id: "phone" } };
  const states = (area: string | null, person = "home", extra: States = {}): States => ({
    "person.kadir": [person, { friendly_name: "Kadir", device_trackers: ["device_tracker.bt"] }],
    "device_tracker.bt": ["home"],
    "sensor.kadirs_iphone_area": bermuda(area),
    ...extra,
  });
  const at = (p: Plan, fi: number, id: string) => ({ floor: p.floors[fi] as Floor, room: { id } });

  it("puts someone who is home in their room: a face, a soft glow and the room's name", () => {
    const p = plan();
    const l = new HassLive(p);
    l.update(hassOf(states("living_room"), reg));
    const r = at(p, 0, "living");
    expect(l.roomPeople(r.floor, r.room).map((x) => x.name)).toEqual(["Kadir"]);
    expect(l.tint(r.floor, r.room)).not.toBeNull();
    expect(l.people()[0].room).toBe("Living Room");
    const hall = at(p, 0, "hall");
    expect(l.roomPeople(hall.floor, hall.room)).toEqual([]);
    expect(l.tint(hall.floor, hall.room)).toBeNull();
  });

  it("never shows someone who is away in a room", () => {
    const p = plan();
    const l = new HassLive(p);
    l.update(hassOf(states("living_room", "not_home"), reg));
    expect(l.personRoom("person.kadir")).toBeNull();
    expect(l.people()[0].room).toBeNull();
  });

  it("redraws only when someone changes room", () => {
    const p = plan();
    const l = new HassLive(p);
    const h1 = hassOf(states("living_room"), reg);
    l.update(h1);
    // the tracker's distance moved: same room
    const h2 = { ...h1, states: { ...h1.states, "sensor.kadirs_iphone_area": { ...h1.states["sensor.kadirs_iphone_area"], attributes: { ...h1.states["sensor.kadirs_iphone_area"].attributes, current_mac: "x" } } } };
    expect([...l.update(h2)]).toEqual([]);
    const moved = hassOf(states("hallway"), reg);
    const h3 = { ...h2, states: { ...h2.states, "sensor.kadirs_iphone_area": moved.states["sensor.kadirs_iphone_area"] } };
    expect([...l.update(h3)].sort()).toEqual(["labels", "status", "tints"]);
    expect(l.personRoom("person.kadir")).toEqual({ floor: 0, room: 0 });
  });

  it("keeps room trackers out of what replays load", () => {
    const l = new HassLive(plan());
    l.update(hassOf(states("living_room"), reg));
    expect(l.watched()).not.toContain("sensor.kadirs_iphone_area");
    expect(l.watched()).toContain("person.kadir");
  });

  it("can be turned off in the plan, by the card, or for one person", () => {
    for (const [settings, card] of [[{ presence: { enabled: false } }, true], [{}, false], [{ presence: { people: { "person.kadir": null } } }, true]] as const) {
      const l = new HassLive(plan(settings));
      l.peopleInRooms = card;
      l.update(hassOf(states("living_room"), reg));
      expect(l.personRoom("person.kadir")).toBeNull();
    }
  });

  it("counts a presence sensor for the room it is placed in, else its area's", () => {
    const p = plan({}, [{ entity: "binary_sensor.fp2", x: 1, z: 2 }]);
    const l = new HassLive(p);
    l.update(hassOf({
      "binary_sensor.fp2": ["on", { device_class: "occupancy" }],
      "binary_sensor.fp2_zone_lounge": ["off", { device_class: "occupancy" }],
    }, { "binary_sensor.fp2": { area_id: "living_room" }, "binary_sensor.fp2_zone_lounge": { area_id: "living_room" } }));
    const hall = at(p, 0, "hall"), living = at(p, 0, "living");
    expect(l.tint(hall.floor, hall.room)).not.toBeNull();
    expect(l.tint(living.floor, living.room)).toBeNull();
  });
});

describe("the room sheet's line", () => {
  it("names who is here", () => {
    expect(hereText([])).toBeNull();
    expect(hereText(["Kadir"])).toBe("Kadir is here");
    expect(hereText(["Kadir", "Thea"])).toBe("Kadir and Thea are here");
    expect(hereText(["Alex", "Sam", "Kim"])).toBe("Alex, Sam and Kim are here");
  });
});
