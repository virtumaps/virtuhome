import { describe, expect, it } from "vitest";
import { compassName, moonPosition, sunPosition } from "../src/live/sun";

// reference values from astral 3.2, the library Home Assistant's sun.sun uses
const REF: [string, number, number, string, number, number][] = [
  ["greenwich", 51.4769, -0.0005, "2026-06-21T12:00:00Z", 61.968, 179.109],
  ["greenwich", 51.4769, -0.0005, "2026-12-21T12:00:00Z", 15.144, 180.456],
  ["greenwich", 51.4769, -0.0005, "2026-03-20T07:00:00Z", 8.14, 100.417],
  ["greenwich", 51.4769, -0.0005, "2026-10-18T15:30:00Z", 12.101, 236.882],
  ["sydney", -33.8688, 151.2093, "2026-06-21T12:00:00Z", -62.417, 255.507],
  ["sydney", -33.8688, 151.2093, "2026-03-20T07:00:00Z", 13.095, 278.776],
  ["sydney", -33.8688, 151.2093, "2026-10-18T15:30:00Z", -39.162, 144.151],
  ["tromso", 69.6492, 18.9553, "2026-06-21T12:00:00Z", 42.512, 203.254],
  ["tromso", 69.6492, 18.9553, "2026-12-21T12:00:00Z", -4.05, 197.824],
  ["tromso", 69.6492, 18.9553, "2026-03-20T07:00:00Z", 10.608, 120.482],
];

describe("sunPosition", () => {
  for (const [name, lat, lon, time, el, az] of REF) {
    it(`${name} ${time}`, () => {
      const p = sunPosition(Date.parse(time), lat, lon);
      expect(Math.abs(p.elevation - el)).toBeLessThan(0.1);
      expect(Math.abs(p.azimuth - az)).toBeLessThan(0.1);
    });
  }

  it("moves smoothly: a minute is about a quarter of a degree", () => {
    const t = Date.parse("2026-10-18T10:00:00Z");
    const a = sunPosition(t, 53, -2.4);
    const b = sunPosition(t + 60_000, 53, -2.4);
    const step = Math.hypot(b.elevation - a.elevation, (b.azimuth - a.azimuth) * Math.cos((a.elevation * Math.PI) / 180));
    expect(step).toBeGreaterThan(0.15);
    expect(step).toBeLessThan(0.3);
  });
});

describe("moonPosition", () => {
  it("is full at a full moon and new at a new moon", () => {
    // full moon 3 March 2026 (a total lunar eclipse), new moon 17 February 2026
    expect(moonPosition(Date.parse("2026-03-03T11:38:00Z"), 51.5, 0).lit).toBeGreaterThan(0.98);
    expect(moonPosition(Date.parse("2026-02-17T12:01:00Z"), 51.5, 0).lit).toBeLessThan(0.02);
  });

  it("stays on the sky's sphere", () => {
    for (let h = 0; h < 48; h += 3) {
      const m = moonPosition(Date.parse("2026-10-18T00:00:00Z") + h * 3_600_000, 53, -2.4);
      expect(m.azimuth).toBeGreaterThanOrEqual(0);
      expect(m.azimuth).toBeLessThan(360);
      expect(Math.abs(m.elevation)).toBeLessThanOrEqual(90);
    }
  });
});

describe("compassName", () => {
  it("names bearings", () => {
    expect(compassName(0)).toBe("N");
    expect(compassName(359)).toBe("N");
    expect(compassName(225)).toBe("SW");
    expect(compassName(-90)).toBe("W");
    expect(compassName(100)).toBe("E");
  });
});
