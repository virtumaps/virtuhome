import { describe, expect, it } from "vitest";
import { autoPlace } from "../src/auto/placement";
import { HassLive } from "../src/live/live";
import type { Hass, HassEntity } from "../src/live/hass";
import { canOpen, lockActions, lockKind, needsCode } from "../src/live/locks";
import { artwork, mediaText } from "../src/live/media";
import { normalizePlan, type Device, type Opening } from "../src/model/plan";
import { entityUses, replaceEntity } from "../src/model/links";
import { buildFloor } from "../src/scene/build";
import { DAY } from "../src/scene/palette";

const rect = (x0: number, z0: number, x1: number, z1: number): [number, number][] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const at = "2026-10-28T08:00:00Z";
const state = (entity_id: string, s: string, attributes: Record<string, unknown> = {}): HassEntity => ({ entity_id, state: s, attributes, last_changed: at, last_updated: at });
const door = (id: string, room: string, edge: number, offset: number, extra: Partial<Opening> = {}): Opening =>
  ({ id, room_id: room, edge, offset, width: 0.86, height: 2, sill: 0, kind: "door", hinge: "left", swing: "in", ...extra });

/**
 * A hall with the front door at the bottom of the plan (z = 5) and a door to the lounge, a lounge
 * with a garden door at the top (z = 0), and a kitchen beside the hall.
 */
const plan = (devices: Device[] = [], openings?: Opening[]) => normalizePlan({
  version: 1,
  settings: {},
  floors: [{
    id: "g", name: "Ground", elevation: 0, height: 2.6,
    rooms: [
      { id: "hall", name: "Hallway", area_id: "hallway", points: rect(0, 2, 2, 5) },
      { id: "lounge", name: "Lounge", area_id: "living_room", points: rect(2, 0, 6, 5) },
      { id: "kitchen", name: "Kitchen", area_id: "kitchen", points: rect(0, 0, 2, 2) },
    ],
    // hall edges: 0 top (z=2), 1 right (x=2), 2 bottom (z=5, front), 3 left; lounge edge 0 is z=0 (garden)
    openings: openings ?? [door("front", "hall", 2, 1), door("inner", "hall", 1, 1.5), door("garden", "lounge", 0, 2), door("kitchen", "kitchen", 2, 1)],
    furniture: [], devices, walls: [],
  }],
});

const hassOf = (states: HassEntity[], reg: Record<string, { area?: string; device?: string }> = {}, devices: Record<string, string> = {}): Hass => ({
  states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
  entities: Object.fromEntries(states.map((s) => [s.entity_id, { entity_id: s.entity_id, area_id: reg[s.entity_id]?.area ?? null, device_id: reg[s.entity_id]?.device ?? null }])),
  devices: Object.fromEntries(Object.entries(devices).map(([id, name]) => [id, { id, name }])),
  areas: { hallway: { area_id: "hallway", name: "Hallway" }, living_room: { area_id: "living_room", name: "Lounge" }, kitchen: { area_id: "kitchen", name: "Kitchen" } },
}) as unknown as Hass;

const lockOf = (p: ReturnType<typeof plan>, id: string) => p.floors[0].openings.find((o) => o.id === id)?.lock ?? null;

describe("smart locks", () => {
  it("say locked, unlocked, jammed or unavailable, and a problem when locked with the door open", () => {
    const lock = (s: string) => state("lock.front_door", s);
    expect(["locked", "unlocked", "jammed", "locking", "open", "unavailable"].map((s) => lockKind(lock(s), 0))).toEqual(["locked", "unlocked", "jammed", "moving", "open", "unavailable"]);
    expect(lockKind(undefined, null)).toBe("unavailable");
    expect(lockKind(lock("locked"), 1)).toBe("problem");
    // no door sensor: locked is locked
    expect(lockKind(lock("locked"), null)).toBe("locked");
    expect(lockKind(lock("unlocked"), 1)).toBe("unlocked");
  });

  it("offer what the lock can do, and ask for a code when it needs one", () => {
    // a Nuki can pull the latch (LockEntityFeature.OPEN); an Aqara over Matter asks for a PIN
    const nuki = state("lock.nuki_front_door", "locked", { supported_features: 1, friendly_name: "Front Door" });
    const aqara = state("lock.aqara_smart_lock_u200", "unlocked", { supported_features: 0, code_format: "^\\d{4,8}$" });
    expect(canOpen(nuki)).toBe(true);
    expect(lockActions(nuki, "locked")).toEqual(["unlock", "open"]);
    expect(lockActions(aqara, "unlocked")).toEqual(["lock"]);
    expect(lockActions(aqara, "jammed")).toEqual(["unlock", "lock"]);
    expect(lockActions(aqara, "unavailable")).toEqual([]);
    expect(needsCode(aqara)).toBe(true);
    expect(needsCode(nuki)).toBe(false);
  });

  it("show their badge with their door, and are followed when renamed", () => {
    const p = plan([], [door("front", "hall", 2, 1, { lock: "lock.front_door", entity: "binary_sensor.front_door" })]);
    const l = new HassLive(p);
    l.update(hassOf([state("lock.front_door", "locked"), state("binary_sensor.front_door", "on", { device_class: "door" })]));
    expect(l.lockBadge(p.floors[0].openings[0])).toEqual({ kind: "problem", text: "Locked, but the door is open" });
    expect(l.place("lock.front_door")).toEqual({ floor: 0, room: 0 });
    expect(entityUses(p).map((u) => u.entity)).toContain("lock.front_door");
    replaceEntity(p, "lock.front_door", "lock.yale_front_door");
    expect(lockOf(p, "front")).toBe("lock.yale_front_door");
    // the badge is a label: the floor's meshes are the same with a lock or without
    const without = buildFloor(plan(), 0, DAY, { low: true });
    const withLock = buildFloor(p, 0, DAY, { low: true });
    expect(withLock.opaque.vertexCount).toBe(buildFloor(plan([], [door("front", "hall", 2, 1)]), 0, DAY, { low: true }).opaque.vertexCount);
    expect(without.doors.length).toBe(4);
  });
});

describe("Smart Setup with smart locks", () => {
  it("puts a front door lock on the front door, and another of the hall on its outside door", () => {
    const { plan: p, report } = autoPlace(plan(), hassOf(
      [state("lock.front_door", "locked", { friendly_name: "Front Door Lock" })],
      { "lock.front_door": { area: "hallway", device: "yale" } },
      { yale: "Front Door Lock" },
    ));
    expect(lockOf(p, "front")).toBe("lock.front_door");
    expect(p.floors[0].devices).toEqual([]);
    expect(report.linked).toEqual(["Front Door Lock → Hallway door"]);
    // a lock with no name to go by in the hall still goes on its outside door, not the one to the lounge
    const q = autoPlace(plan(), hassOf([state("lock.yale_linus", "unlocked")], { "lock.yale_linus": { area: "hallway", device: "linus" } }, { linus: "Yale Linus" })).plan;
    expect(lockOf(q, "front")).toBe("lock.yale_linus");
    expect(lockOf(q, "inner")).toBeNull();
  });

  it("finds the door a lock in no room names, and leaves one that names none", () => {
    const { plan: p, report } = autoPlace(plan(), hassOf([
      state("lock.ultion_back_door", "locked", { friendly_name: "Back Door" }),
      state("lock.shed", "locked", { friendly_name: "Shed" }),
    ]));
    // the back door is the outside door highest on the plan: the lounge's garden door
    expect(lockOf(p, "garden")).toBe("lock.ultion_back_door");
    expect(p.floors[0].openings.filter((o) => o.lock).length).toBe(1);
    expect(report.linked).toEqual(["Back Door → Lounge door"]);
  });

  it("moves a lock placed as a pin onto the door nearest it", () => {
    const { plan: p, report } = autoPlace(plan([{ id: "d1", entity: "lock.kitchen_door", x: 1.2, z: 1.7, y: 1.4 }]), hassOf([state("lock.kitchen_door", "locked", { friendly_name: "Kitchen Door" })]));
    expect(lockOf(p, "kitchen")).toBe("lock.kitchen_door");
    expect(p.floors[0].devices).toEqual([]);
    expect(report.linked).toEqual(["Kitchen Door → Kitchen door"]);
    // and leaves a pin far from any door where it is
    const far = autoPlace(plan([{ id: "d1", entity: "lock.safe", x: 4, z: 2.5 }]), hassOf([state("lock.safe", "locked")])).plan;
    expect(far.floors[0].devices.map((d) => d.entity)).toEqual(["lock.safe"]);
  });
});

describe("what TVs and speakers play", () => {
  // as Music Assistant and LG webOS report them in Kadir's home
  const speaker = (s: string) => state("media_player.home_assistant_voice_09aade", s, {
    media_title: "Empire Of The Sun", media_artist: "DNA (Ian Asher Remix)", media_album_name: "Fresh 92.7", app_id: "music_assistant", source: "Music Assistant Queue", device_class: "speaker",
  });
  it("is the title and artist while playing or paused", () => {
    expect(mediaText(speaker("playing"), false)).toBe("Empire Of The Sun · DNA (Ian Asher Remix)");
    expect(mediaText(speaker("paused"), false)).toBe("Empire Of The Sun · DNA (Ian Asher Remix)");
    // an idle speaker keeps its last title: it says nothing
    expect(mediaText(speaker("idle"), false)).toBeNull();
    expect(mediaText(speaker("off"), true)).toBeNull();
    expect(mediaText(undefined, true)).toBeNull();
  });

  it("is a TV's app or source while it is on with nothing named, and a programme with its series", () => {
    expect(mediaText(state("media_player.lg_webos_tv_oled77c45la_3", "on", { source: "Netflix", device_class: "tv" }), true)).toBe("Netflix");
    expect(mediaText(state("media_player.living_room_tv", "on", { app_name: "BBC iPlayer", source: "HDMI 1" }), true)).toBe("BBC iPlayer");
    expect(mediaText(state("media_player.living_room_tv", "playing", { media_title: "Planet Earth III", media_series_title: "Ocean", app_name: "BBC iPlayer" }), true)).toBe("Planet Earth III · Ocean");
    expect(mediaText(state("media_player.living_room_tv", "standby", { source: "Netflix" }), true)).toBeNull();
    // a speaker that is on but names nothing says nothing
    expect(mediaText(state("media_player.kitchen", "on", { source: "Spotify" }), false)).toBeNull();
  });

  it("shows a TV's artwork from Home Assistant while it plays, never from anywhere a page could not load", () => {
    const hass = { hassUrl: (p: string) => `https://ha.local${p}` } as unknown as Hass;
    const tv = (pic: unknown, s = "playing") => state("media_player.tv", s, { entity_picture: pic });
    expect(artwork(hass, tv("/api/media_player_proxy/media_player.tv?token=abc&cache=1"))).toBe("https://ha.local/api/media_player_proxy/media_player.tv?token=abc&cache=1");
    expect(artwork(hass, tv("https://img.example/x.jpg"))).toBe("https://img.example/x.jpg");
    for (const bad of ["javascript:alert(1)", "//evil.example/x.png", 42, null]) expect(artwork(hass, tv(bad))).toBeNull();
    expect(artwork(hass, tv("/x.jpg", "idle"))).toBeNull();
  });

  it("comes from the view's state, a speaker's while it plays", () => {
    const l = new HassLive(plan());
    l.update(hassOf([speaker("playing"), state("media_player.tv", "on", { app_name: "Netflix" })]));
    expect(l.nowPlaying("media_player.home_assistant_voice_09aade", false)).toEqual({ text: "Empire Of The Sun · DNA (Ian Asher Remix)", picture: null });
    expect(l.nowPlaying("media_player.tv", true)).toEqual({ text: "Netflix", picture: null });
    expect(l.nowPlaying("media_player.none", true)).toBeNull();
  });
});
