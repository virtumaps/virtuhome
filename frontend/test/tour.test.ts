import { describe, expect, it } from "vitest";
import { CHAPTERS, type Show } from "../dev/tour/script";
import { demoHass } from "../src/demo/hass";
import { DEMO_PLAN } from "../src/demo/plan";
import { normalizePlan, spaces } from "../src/model/plan";
import type { ItemMarks, RoomTint } from "../src/live/live";

const plan = normalizePlan(structuredClone(DEMO_PLAN));

/** The online demo's tour run against a stand-in: what it switches, flies to, tints and marks. */
function run(trials: boolean) {
  const hass = demoHass(plan, () => undefined);
  const entities: string[] = [];
  const tints: RoomTint[] = [];
  const marks: ItemMarks[] = [];
  const replays: string[] = [];
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
  };
  const said: string[] = [];
  for (const ch of CHAPTERS) {
    ch.start?.(show);
    for (const line of ch.lines) {
      if (line.when && !line.when(show)) continue;
      said.push((line.orb ?? line.blob)!);
      line.do?.(show);
      line.after?.(show);
      if (line.replay) replays.push(line.replay);
    }
    ch.end?.(show);
  }
  hass.stop();
  return { hass, entities, tints, marks, replays, said };
}

describe("the online demo's tour", () => {
  it("gives every line one speaker and keeps it short", () => {
    for (const line of CHAPTERS.flatMap((c) => c.lines)) {
      expect(!!line.orb !== !!line.blob).toBe(true);
      expect((line.orb ?? line.blob)!.length).toBeLessThan(140);
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

  it("plays the day back forwards", () => {
    const minutes = run(false).replays.map((at) => Number(at.slice(0, 2)) * 60 + Number(at.slice(3)));
    expect(minutes.length).toBeGreaterThan(2);
    for (let i = 1; i < minutes.length; i++) expect(minutes[i]).toBeGreaterThan(minutes[i - 1]);
  });

  it("ends on the trials only while they are open", () => {
    const open = run(true).said;
    const shut = run(false).said;
    expect(open.length).toBe(shut.length);
    expect(open.some((s) => /trial/.test(s))).toBe(true);
    expect(shut.some((s) => /trial/.test(s))).toBe(false);
  });
});
