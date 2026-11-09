import { describe, expect, it } from "vitest";
import { areaScenes, MAX_SCENES, needsDetails, roomScenes, sceneRisks } from "../src/live/scenes";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";
import { normalizePlan } from "../src/model/plan";
import { entityUses, missingLinks, replaceEntity } from "../src/model/links";
import { sheetScenes } from "../src/ui/room-scenes";
import { demoHass } from "../src/demo/hass";
import { DEMO_PLAN } from "../src/demo/plan";

const at = "2026-11-09T08:00:00Z";
const st = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state, attributes, last_changed: at, last_updated: at });

/** Scenes and scripts in the kitchen (by their own area or their device's), one in the lounge, one in none. */
function hassOf(extra: Partial<Record<string, Partial<HassEntityReg>>> = {}): Hass {
  const states = [
    st("scene.cooking", at, { friendly_name: "Cooking", entity_id: ["light.kitchen"] }),
    st("scene.breakfast", at, { friendly_name: "Breakfast" }),
    st("script.coffee", "off", { friendly_name: "Make coffee" }),
    st("script.announce", "off", { friendly_name: "Announce" }),
    st("scene.lounge_movie", at, { friendly_name: "Movie" }),
    st("script.goodnight", "off", { friendly_name: "Goodnight" }),
    st("scene.leaving", at, { friendly_name: "Leaving", entity_id: ["light.hall", "lock.front_door", "cover.garage", "cover.blind", "alarm_control_panel.home"] }),
    st("lock.front_door", "unlocked", { friendly_name: "Front door" }),
    st("cover.garage", "closed", { friendly_name: "Garage door", device_class: "garage" }),
    st("cover.blind", "open", { friendly_name: "Blind", device_class: "blind" }),
    st("light.kitchen", "on"),
  ];
  const reg: Record<string, Partial<HassEntityReg>> = {
    "scene.cooking": { area_id: "kitchen" },
    "scene.breakfast": { device_id: "hub" },
    "script.coffee": { area_id: "kitchen" },
    "script.announce": { area_id: "kitchen" },
    "scene.lounge_movie": { area_id: "lounge" },
    "script.goodnight": {},
    "scene.leaving": { area_id: "hall" },
    "light.kitchen": { area_id: "kitchen" },
    ...extra,
  };
  return {
    states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
    entities: Object.fromEntries(Object.entries(reg).map(([id, r]) => [id, { entity_id: id, ...r }])),
    devices: { hub: { id: "hub", area_id: "kitchen" } },
    areas: { kitchen: { area_id: "kitchen", name: "Kitchen" }, lounge: { area_id: "lounge", name: "Lounge" } },
    services: { script: { announce: { fields: { message: { required: true }, where: {} } }, coffee: { fields: { strength: { required: false } } } } },
  } as unknown as Hass;
}

describe("a room's scenes and scripts", () => {
  it("are its area's, by their own area or their device's, in the order of their names", () => {
    expect(areaScenes(hassOf(), "kitchen")).toEqual(["scene.breakfast", "scene.cooking", "script.coffee"]);
    expect(areaScenes(hassOf(), "lounge")).toEqual(["scene.lounge_movie"]);
    expect(areaScenes(hassOf(), null)).toEqual([]);
  });

  it("leave out what Home Assistant hides and scripts that can't run without details", () => {
    const h = hassOf({ "scene.breakfast": { device_id: "hub", hidden: true }, "script.coffee": { area_id: "kitchen", entity_category: "config" } });
    expect(areaScenes(h, "kitchen")).toEqual(["scene.cooking"]);
    expect(needsDetails(h, "script.announce")).toBe(true);
    expect(needsDetails(h, "script.coffee")).toBe(false);
    expect(needsDetails(h, "scene.cooking")).toBe(false);
  });

  it("put those picked for the room first, without the hidden ones", () => {
    const h = hassOf();
    const room = { area_id: "kitchen", scenes: ["script.goodnight", "scene.lounge_movie", "scene.gone"], hide_scenes: ["scene.breakfast"] };
    expect(roomScenes(h, room)).toEqual(["script.goodnight", "scene.lounge_movie", "scene.cooking", "script.coffee"]);
    // picked by hand, a script that needs details still shows (its dialog asks for them)
    expect(roomScenes(h, { area_id: null, scenes: ["script.announce"] })).toEqual(["script.announce"]);
    // a plan edited by hand
    expect(roomScenes(h, { area_id: "lounge", scenes: "scene.cooking" as never, hide_scenes: [1] as never })).toEqual(["scene.lounge_movie"]);
  });

  it(`shows at most ${MAX_SCENES}`, () => {
    const h = hassOf();
    for (let i = 0; i < 20; i++) {
      h.states[`scene.extra_${i}`] = st(`scene.extra_${i}`, at);
      h.entities![`scene.extra_${i}`] = { entity_id: `scene.extra_${i}`, area_id: "kitchen" };
    }
    expect(roomScenes(h, { area_id: "kitchen" })).toHaveLength(MAX_SCENES);
  });

  it("asks first before a scene that sets a lock, an alarm or a garage door", () => {
    const h = hassOf();
    expect(sceneRisks(h, "scene.leaving")).toEqual(["lock.front_door", "cover.garage", "alarm_control_panel.home"]);
    expect(sceneRisks(h, "scene.cooking")).toEqual([]);
    expect(sceneRisks(h, "script.goodnight")).toEqual([]);
  });
});

describe("scenes picked in the plan", () => {
  const plan = () => normalizePlan({
    version: 1,
    floors: [{
      id: "g", name: "Ground", elevation: 0, height: 2.6,
      rooms: [{ id: "k", name: "Kitchen", area_id: "kitchen", points: [[0, 0], [3, 0], [3, 3]], scenes: ["script.goodnight"], hide_scenes: ["scene.breakfast"] }],
      outdoor: [{ id: "p", name: "Patio", kind: "patio", area_id: null, points: [[0, 3], [3, 3], [3, 5]], scenes: ["scene.bbq"] }],
    }],
  });

  it("reach the sheets of rooms and garden areas", () => {
    const h = hassOf();
    h.states["scene.bbq"] = st("scene.bbq", at);
    const f = plan().floors[0];
    expect(sheetScenes(h, f, "k")).toEqual(["script.goodnight", "scene.cooking", "script.coffee"]);
    expect(sheetScenes(h, f, "p")).toEqual(["scene.bbq"]);
    expect(sheetScenes(h, f, "gone")).toEqual([]);
  });

  it("are links: a renamed one is followed, a missing one is listed, an unlinked one leaves", () => {
    const p = plan();
    expect(entityUses(p).map((u) => u.entity)).toEqual(expect.arrayContaining(["script.goodnight", "scene.breakfast", "scene.bbq"]));
    expect(missingLinks(p, hassOf()).map((m) => m.entity)).toEqual(expect.arrayContaining(["scene.bbq"]));
    replaceEntity(p, "script.goodnight", "script.good_night");
    expect(p.floors[0].rooms[0].scenes).toEqual(["script.good_night"]);
    replaceEntity(p, "scene.bbq", null);
    expect(p.floors[0].outdoor![0].scenes).toEqual([]);
  });
});

describe("the demo home", () => {
  it("has scenes in its rooms, and Goodnight picked for the main bedroom", async () => {
    const plan = normalizePlan(structuredClone(DEMO_PLAN));
    let last: Hass | null = null;
    const h = demoHass(plan, (x) => (last = x), { night: true });
    expect(sheetScenes(h, plan.floors[0], "living_room")).toEqual(["scene.living_room_bright", "scene.movie_night"]);
    expect(sheetScenes(h, plan.floors[1], "bedroom_1")).toEqual(["script.goodnight", "scene.bedtime"]);
    expect(sceneRisks(h, "scene.leaving")).toEqual(["lock.front_door"]);
    await h.callService("scene", "turn_on", {}, { entity_id: "scene.movie_night" });
    expect(last!.states["light.living_room_ceiling"].state).toBe("off");
    expect(last!.states["light.living_room_floor_lamp"].state).toBe("on");
    await h.callService("script", "turn_on", {}, { entity_id: "script.goodnight" });
    expect(Object.values(last!.states).filter((s) => s.entity_id.startsWith("light.") && s.state === "on")).toEqual([]);
    h.stop();
  });
});
