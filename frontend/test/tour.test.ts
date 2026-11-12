import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chapters, type Show } from "../dev/tour/script";
import { spoken, voiceId } from "../dev/tour/tour";
import { cued, detect, EN, load, NAMES, type DemoStrings } from "../dev/lang";
import { tapKeys } from "../dev/tour/panels";
import { demoHass } from "../src/demo/hass";
import { DEMO_PLAN } from "../src/demo/plan";
import { normalizePlan, spaces, type Plan } from "../src/model/plan";
import type { ItemMarks, RoomTint } from "../src/live/live";

const plan = normalizePlan(structuredClone(DEMO_PLAN));

const CHAPTERS = chapters(EN);

/** The online demo's tour run against a stand-in: what it switches, flies to, tints and marks. */
function run(trials: boolean, S: DemoStrings = EN) {
  const hass = demoHass(plan, () => undefined);
  const entities: string[] = [];
  const tints: RoomTint[] = [];
  const marks: ItemMarks[] = [];
  const replays: string[] = [];
  const restyled: Plan[] = [];
  const props: string[] = [];
  const taps: string[] = [];
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
    turn: () => undefined,
    later: (_ms, fn) => fn(),
    restyle: (fn) => {
      if (!fn) return;
      const copy = structuredClone(plan);
      fn(copy);
      restyled.push(copy);
    },
    explode: () => undefined,
    push: () => undefined,
    zoom: () => undefined,
    props: (list) => props.push(...list.map((p) => p.kind)),
    quiet: (id) => entities.push(id),
    tap: (key, then) => {
      taps.push(key);
      then?.(show);
    },
    whatIf: () => undefined,
    ring: () => undefined,
  };
  const said: string[] = [];
  for (const ch of chapters(S)) {
    ch.start?.(show);
    for (const line of ch.lines) {
      if (line.when && !line.when(show)) continue;
      said.push(line.say);
      line.do?.(show);
      for (const cue of Object.values(line.cues ?? {})) cue(show);
      line.after?.(show);
      if (line.replay) replays.push(line.replay);
    }
    ch.end?.(show);
  }
  hass.stop();
  return { hass, entities, tints, marks, replays, said, restyled, props, taps };
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
      expect(cued(line.say).text.length).toBeLessThan(140);
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
    expect(new Set(props)).toEqual(new Set(["scenes", "editor", "scan", "clip", "alert", "energy", "tablet"]));
  });

  it("only taps what the panels have, and only waits for words its lines say", () => {
    const { taps } = run(false);
    expect(taps.length).toBeGreaterThan(3);
    const keys = new Set(tapKeys());
    for (const key of taps) expect(keys.has(key), key).toBe(true);
    for (const line of CHAPTERS.flatMap((c) => c.lines)) {
      const marked = Object.keys(cued(line.say).cues).sort();
      expect(marked, line.id).toEqual(Object.keys(line.cues ?? {}).sort());
    }
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
    // and the committed build has none of the tour in it (What's new quotes the changelog, which
    // names Take the tour, so look for the tour's own buttons)
    const out = new URL("../../custom_components/virtuhome/frontend/", import.meta.url).pathname;
    const built = readdirSync(out, { recursive: true }).filter((f) => f.endsWith(".js"));
    expect(built.length).toBeGreaterThan(0);
    for (const f of built) {
      const text = readFileSync(out + f, "utf8");
      for (const word of ["SpeechSynthesisUtterance", "license.virtumaps.com/v1/catalog", "Start the tour", "Close the tour"]) expect(text, f).not.toContain(word);
    }
  });

  it("ends on the trials only while they are open", () => {
    const open = run(true).said;
    const shut = run(false).said;
    expect(open.length).toBe(shut.length);
    expect(open.some((s) => /trial/.test(s))).toBe(true);
    expect(shut.some((s) => /trial/.test(s))).toBe(false);
  });

  it("has every text in every language, with the same placeholders and cues", async () => {
    const holes = (t: string) => [...t.matchAll(/\{(\w+)\}|\[\[(\w+)\]\]|<b>/g)].map((m) => m[0]).sort();
    const walk = (en: unknown, other: unknown, path: string, out: string[]) => {
      if (typeof en === "string") {
        if (typeof other !== "string" || !other.trim()) out.push(`${path}: missing`);
        // a language says the what-if's saving in its money; English spells its pounds out
        else if (path !== "lines.whatIf" && JSON.stringify(holes(en)) !== JSON.stringify(holes(other))) out.push(`${path}: ${holes(other)} for ${holes(en)}`);
        return;
      }
      if (Array.isArray(en)) {
        if (path === "sayAs") return;
        en.forEach((v, i) => walk(v, (other as unknown[] | undefined)?.[i], `${path}[${i}]`, out));
        return;
      }
      if (en && typeof en === "object") {
        for (const [k, v] of Object.entries(en)) walk(v, (other as Record<string, unknown> | undefined)?.[k], path ? `${path}.${k}` : k, out);
        for (const k of Object.keys((other ?? {}) as object)) if (!(k in (en as object))) out.push(`${path}.${k}: not in English`);
      }
    };
    for (const code of Object.keys(NAMES)) {
      const S = await load(code);
      expect(S === EN, code).toBe(code === "en");
      const out: string[] = [];
      walk(EN, S, "", out);
      expect(out, code).toEqual([]);
      expect(S.lines.whatIf, code).toMatch(code === "en" ? /pounds/ : /\{saving\}/);
      for (const line of chapters(S).flatMap((c) => c.lines)) {
        expect(line.say, `${code} ${line.id}`).not.toMatch(/\{\w+\}/);
        expect(cued(line.say).text.length, `${code} ${line.id}`).toBeLessThan(160);
      }
    }
  });

  it("runs the same in every language", async () => {
    const en = run(false);
    for (const code of Object.keys(NAMES)) {
      const r = run(false, await load(code));
      expect(r.taps, code).toEqual(en.taps);
      expect(r.props, code).toEqual(en.props);
    }
  });

  it("has a recording for every line of the languages it records, and none left over", async () => {
    const dir = new URL("../dev/tour/voice/", import.meta.url).pathname;
    const recorded = Object.keys(NAMES).filter((code) => readdirSync(dir).includes(code));
    // the list the tour reads to know which languages have recordings (make.py writes it)
    expect(new Set(JSON.parse(readFileSync(`${dir}index.json`, "utf8")) as string[])).toEqual(new Set(recorded));
    expect(recorded).toContain("en");
    for (const code of recorded) {
      const S = await load(code);
      const want = new Set(chapters(S).flatMap((c) => c.lines).map((l) => voiceId(spoken(S, l.say))));
      const index = JSON.parse(readFileSync(`${dir}${code}/voices.json`, "utf8")) as Record<string, number>;
      expect(new Set(Object.keys(index)), code).toEqual(want);
      const files = readdirSync(`${dir}${code}`).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4));
      expect(new Set(files), code).toEqual(want);
    }
  });

  it("speaks the language picked, else the browser's, else where the viewer is", () => {
    const d = (languages: string[], timeZone: string | null, saved: string | null = null, param: string | null = null) => detect({ languages, timeZone, saved, param });
    expect(d(["de-DE", "en"], "Europe/London")).toBe("de");
    expect(d(["en-US"], "Europe/Istanbul")).toBe("tr");
    expect(d(["en-GB"], "Europe/London")).toBe("en");
    expect(d(["en-US"], "America/New_York")).toBe("en");
    expect(d(["en-US"], "Europe/Sofia")).toBe("bg");
    expect(d(["ja-JP"], "Asia/Tokyo")).toBe("en");
    expect(d(["ja-JP", "fr"], "Asia/Tokyo")).toBe("fr");
    expect(d(["nn-NO"], "Europe/Oslo")).toBe("nb");
    expect(d(["pt-BR"], "America/Sao_Paulo")).toBe("pt");
    expect(d(["en-US"], "America/Argentina/Buenos_Aires")).toBe("es");
    expect(d(["de-DE"], "Europe/Berlin", "en")).toBe("en");
    expect(d(["de-DE"], "Europe/Berlin", "en", "pl")).toBe("pl");
    expect(d(["de-DE"], "Europe/Berlin", null, "xx")).toBe("de");
  });
});
