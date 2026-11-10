import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CHAPTERS, type Show } from "../dev/tour/script";
import { voiceId } from "../dev/tour/tour";
import { demoHass } from "../src/demo/hass";
import { DEMO_PLAN } from "../src/demo/plan";
import { normalizePlan, spaces, type Plan } from "../src/model/plan";
import type { ItemMarks, RoomTint } from "../src/live/live";

const plan = normalizePlan(structuredClone(DEMO_PLAN));

/** The online demo's tour run against a stand-in: what it switches, flies to, tints and marks. */
function run(trials: boolean) {
  const hass = demoHass(plan, () => undefined);
  const entities: string[] = [];
  const tints: RoomTint[] = [];
  const marks: ItemMarks[] = [];
  const replays: string[] = [];
  const restyled: Plan[] = [];
  const props: string[] = [];
  const view = {
    setRoomTint: (fn: RoomTint | null) => fn && tints.push(fn),
    markItems: (fn: ItemMarks | null) => fn && marks.push(fn),
  };
  // the rest of the view does nothing here
  const handle = new Proxy(view, { get: (t, k) => (t as Record<string | symbol, unknown>)[k] ?? (() => undefined) }) as unknown as Show["view"];
  const show: Show = {
    view: handle,
    hass,
    trials,
    call: (_d, _s, entity) => entities.push(...[entity].flat()),
    house: () => undefined,
    floor: () => undefined,
    fly: (entity) => entities.push(entity),
    replay: (at) => replays.push(at),
    endReplay: () => undefined,
    sky: () => undefined,
    weather: () => undefined,
    later: (_ms, fn) => fn(),
    restyle: (fn) => {
      if (!fn) return;
      const copy = structuredClone(plan);
      fn(copy);
      restyled.push(copy);
    },
    explode: () => undefined,
    push: () => undefined,
    props: (list) => props.push(...list.map((p) => p.kind)),
    quiet: (id) => entities.push(id),
  };
  const said: string[] = [];
  for (const ch of CHAPTERS) {
    ch.start?.(show);
    for (const line of ch.lines) {
      if (line.when && !line.when(show)) continue;
      said.push(line.say);
      line.do?.(show);
      line.after?.(show);
      if (line.replay) replays.push(line.replay);
    }
    ch.end?.(show);
  }
  hass.stop();
  return { hass, entities, tints, marks, replays, said, restyled, props };
}

describe("the online demo's tour", () => {
  it("names a recorded line as voice/make.py does", () => {
    // the same three as make.py's voice_id() gives
    expect(voiceId("Hi!")).toBe("325d0001");
    expect(voiceId("Imagine this is your home. Alive, in 3D, right inside Home Assistant.")).toBe("8635cb4f");
    expect(voiceId("Virtue Home £")).toBe("de4fa9ee");
  });

  it("keeps every line short", () => {
    for (const line of CHAPTERS.flatMap((c) => c.lines)) {
      expect(line.say.trim().length).toBeGreaterThan(0);
      expect(line.say.length).toBeLessThan(140);
    }
  });

  it("only switches and flies to things the demo house has", () => {
    const { hass, entities } = run(false);
    expect(entities.length).toBeGreaterThan(0);
    for (const id of entities) expect(hass.states[id], id).toBeDefined();
  });

  it("colours rooms and marks furniture the demo house has", () => {
    const { tints, marks } = run(false);
    expect(tints.length).toBeGreaterThan(0);
    for (const tint of tints) {
      const hit = plan.floors.some((f) => spaces(f).some((sp) => tint(f, sp)));
      expect(hit).toBe(true);
    }
    for (const mark of marks) expect(plan.floors.some((f) => f.furniture.some((item) => mark(f, item)))).toBe(true);
  });

  it("makes over rooms the demo house has, and shows every prop", () => {
    const { restyled, props } = run(false);
    expect(restyled.length).toBeGreaterThan(0);
    const room = restyled[restyled.length - 1].floors[0].rooms.find((r) => r.area_id === "living_room");
    expect(room?.floor).toBe("herringbone");
    expect(new Set(props)).toEqual(new Set(["scan", "clip", "alert", "tablet", "whatif"]));
  });

  it("plays the day back forwards", () => {
    const minutes = run(false).replays.map((at) => Number(at.slice(0, 2)) * 60 + Number(at.slice(3)));
    expect(minutes.length).toBeGreaterThan(2);
    for (let i = 1; i < minutes.length; i++) expect(minutes[i]).toBeGreaterThan(minutes[i - 1]);
  });

  it("stays out of what Home Assistant downloads", () => {
    // the integration's frontend is built from src/ alone (build.mjs): nothing there may import dev/
    const src = new URL("../src/", import.meta.url).pathname;
    for (const f of readdirSync(src, { recursive: true }).filter((f) => f.endsWith(".ts"))) {
      expect(readFileSync(src + f, "utf8"), f).not.toMatch(/(from|import\()\s*["'][^"']*\/dev\//);
    }
    // and the committed build has none of the tour in it
    const out = new URL("../../custom_components/virtuhome/frontend/", import.meta.url).pathname;
    const built = readdirSync(out, { recursive: true }).filter((f) => f.endsWith(".js"));
    expect(built.length).toBeGreaterThan(0);
    for (const f of built) {
      const text = readFileSync(out + f, "utf8");
      for (const word of ["SpeechSynthesisUtterance", "license.virtumaps.com/v1/catalog", "Take the tour"]) expect(text, f).not.toContain(word);
    }
  });

  it("ends on the trials only while they are open", () => {
    const open = run(true).said;
    const shut = run(false).said;
    expect(open.length).toBe(shut.length);
    expect(open.some((s) => /trial/.test(s))).toBe(true);
    expect(shut.some((s) => /trial/.test(s))).toBe(false);
  });
});
