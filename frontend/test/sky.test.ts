import { describe, expect, it } from "vitest";
import type { Hass, HassEntity } from "../src/live/hass";
import { clearIndex, clearReference, quietSky, SkyLive, skyAt, skyKey, windMs } from "../src/live/sky";
import { sunPosition } from "../src/live/sun";

const LAT = 51.5, LON = -0.12;
const NOON = Date.parse("2026-10-18T12:00:00Z");

function weather(state: string, attributes: Record<string, unknown> = {}): HassEntity {
  return { entity_id: "weather.home", state, attributes, last_changed: "", last_updated: "" };
}

describe("skyAt", () => {
  it("places the sun and the moon where they are", () => {
    const s = skyAt({ time: NOON, lat: LAT, lon: LON, weather: null });
    const sun = sunPosition(NOON, LAT, LON);
    expect(s.sun!.elevation).toBeCloseTo(sun.elevation, 6);
    expect(s.moon).not.toBeNull();
    expect(s.source).toBe("none");
  });

  it("has no sun without a location", () => {
    expect(skyAt({ time: NOON, lat: null, lon: null, weather: null }).sun).toBeNull();
  });

  it("reads Home Assistant's conditions", () => {
    const at = (state: string, a: Record<string, unknown> = {}) => skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather(state, a) });
    expect(at("sunny").cloud).toBeLessThan(0.15);
    expect(at("cloudy").cloud).toBeGreaterThan(0.8);
    expect(at("rainy").rain).toBeGreaterThan(0.3);
    expect(at("rainy").wet).toBe(1);
    expect(at("pouring").rain).toBe(1);
    expect(at("snowy").snow).toBeGreaterThan(0.5);
    expect(at("snowy").snowCover).toBe(1);
    expect(at("fog").fog).toBe(1);
    expect(at("lightning-rainy").storm).toBe(true);
    expect(at("sunny").storm).toBe(false);
    expect(at("unavailable").source).toBe("none");
  });

  it("weighs the cloud cover in", () => {
    const low = skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("partlycloudy", { cloud_coverage: 10 }) });
    const high = skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("partlycloudy", { cloud_coverage: 90 }) });
    expect(low.cloud).toBeLessThan(high.cloud);
  });

  it("trusts the solar panels over the forecast", () => {
    // the forecast says cloudy, the panels make what clear sun makes
    const s = skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("cloudy", { cloud_coverage: 95 }), clearIndex: 1 });
    expect(s.cloud).toBeLessThan(0.3);
    const dull = skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("sunny", { cloud_coverage: 5 }), clearIndex: 0.1 });
    expect(dull.cloud).toBeGreaterThan(0.7);
  });

  it("keeps the ground wet for a while after the rain", () => {
    const after = (hours: number, a: Record<string, unknown> = {}) =>
      skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("cloudy", { temperature: 14, humidity: 70, ...a }), lastRain: NOON - hours * 3_600_000 }).wet;
    expect(after(0.25)).toBeGreaterThan(0.8);
    expect(after(3)).toBeLessThan(0.3);
    // slower when cold
    expect(after(3, { temperature: 2 })).toBeGreaterThan(after(3));
  });

  it("keeps snow lying while it freezes and thaws it after", () => {
    const after = (hours: number, temperature: number) =>
      skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("cloudy", { temperature }), lastSnow: NOON - hours * 3_600_000 }).snowCover;
    expect(after(10, -2)).toBe(1);
    expect(after(10, 6)).toBe(0);
    expect(after(1, 6)).toBeGreaterThan(0.5);
  });

  it("converts wind speeds", () => {
    expect(windMs(36, "km/h")).toBeCloseTo(10);
    expect(windMs(10, "m/s")).toBe(10);
    expect(windMs(10, "mph")).toBeCloseTo(4.47, 2);
    expect(windMs(10, "kn")).toBeCloseTo(5.14, 2);
    const s = skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("windy", { wind_speed: 54, wind_speed_unit: "km/h", wind_bearing: 200 }) });
    expect(s.wind).toBeCloseTo(15);
    expect(s.windFrom).toBe(200);
  });

  it("shows a pick instead of the live weather", () => {
    const s = skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("sunny"), pick: "storm" });
    expect(s.source).toBe("pick");
    expect(s.storm).toBe(true);
    expect(s.rain).toBe(1);
  });

  it("changes its key only when it looks different", () => {
    const a = skyAt({ time: NOON, lat: LAT, lon: LON, weather: weather("sunny") });
    const b = skyAt({ time: NOON + 5_000, lat: LAT, lon: LON, weather: weather("sunny") });
    const c = skyAt({ time: NOON + 30 * 60_000, lat: LAT, lon: LON, weather: weather("sunny") });
    expect(skyKey(a)).toBe(skyKey(b));
    expect(skyKey(a)).not.toBe(skyKey(c));
    expect(skyKey(quietSky())).toBe(skyKey(quietSky()));
  });
});

describe("solar against clear sun", () => {
  // ten days of a 4 kW array: clear days follow the sun's height, cloudy ones make a fifth of it
  const rows: { start: number; kw: number }[] = [];
  const day0 = Date.parse("2026-10-08T00:00:00Z");
  for (let d = 0; d < 10; d++) {
    for (let k = 0; k < 288; k++) {
      const start = day0 + d * 86_400_000 + k * 300_000;
      const el = sunPosition(start + 150_000, LAT, LON).elevation;
      const clear = el > 0 ? 4 * Math.sin((el * Math.PI) / 180) / Math.sin((40 * Math.PI) / 180) : 0;
      rows.push({ start, kw: d % 3 === 1 ? clear : clear * 0.2 });
    }
  }
  const ref = clearReference(rows, LAT, LON);

  it("is about 1 in clear sun and low under cloud", () => {
    const t = Date.parse("2026-10-18T12:00:00Z");
    const el = sunPosition(t, LAT, LON).elevation;
    const clearNow = 4 * Math.sin((el * Math.PI) / 180) / Math.sin((40 * Math.PI) / 180);
    expect(clearIndex(ref, clearNow, t, LAT, LON)!).toBeGreaterThan(0.85);
    expect(clearIndex(ref, clearNow, t, LAT, LON)!).toBeLessThan(1.15);
    expect(clearIndex(ref, clearNow * 0.2, t, LAT, LON)!).toBeLessThan(0.3);
  });

  it("can't tell with the sun low, or without history", () => {
    expect(clearIndex(ref, 0.5, Date.parse("2026-10-18T06:45:00Z"), LAT, LON)).toBeNull();
    expect(clearIndex(null, 2, NOON, LAT, LON)).toBeNull();
    expect(clearIndex(ref, null, NOON, LAT, LON)).toBeNull();
  });
});

describe("SkyLive", () => {
  const hass = (states: Record<string, HassEntity>): Hass => ({
    states, config: { latitude: LAT, longitude: LON }, callService: async () => undefined,
    callWS: async () => ({}) as never, connection: { subscribeMessage: async () => async () => undefined },
  });

  it("follows the first weather entity with cloud cover, or the one picked", () => {
    const live = new SkyLive();
    const h = hass({ "weather.a": weather("sunny"), "weather.b": { ...weather("rainy", { cloud_coverage: 100 }), entity_id: "weather.b" } });
    expect(live.weatherEntity(h)).toBe("weather.b");
    live.settings = { weather: "weather.a" };
    expect(live.weatherEntity(h)).toBe("weather.a");
    live.settings = { enabled: false };
    expect(live.weatherEntity(h)).toBeNull();
  });

  it("remembers the rain once it stops", () => {
    const live = new SkyLive();
    live.sky(hass({ "weather.b": weather("rainy", { cloud_coverage: 100 }) }), NOON);
    const later = live.sky(hass({ "weather.b": weather("cloudy", { cloud_coverage: 90, temperature: 12 }) }), NOON + 20 * 60_000);
    expect(later.rain).toBe(0);
    expect(later.wet).toBeGreaterThan(0.7);
    // a replay of the past knows only its own moment
    const past = live.sky(hass({ "weather.b": weather("cloudy", { cloud_coverage: 90 }) }), NOON - 86_400_000, { past: true });
    expect(past.wet).toBe(0);
  });
});
