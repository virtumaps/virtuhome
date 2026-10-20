import { describe, expect, it } from "vitest";
import { afterglow, darkAt, duskColours, mixHex, moonlight, sunKelvin, sunlight } from "../src/scene/dusk";

const channels = (hex: number) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];

describe("dusk and dawn", () => {
  it("goes from day to night as the sun sinks, and never back", () => {
    expect(darkAt(30)).toBe(0);
    expect(darkAt(2)).toBe(0);
    expect(darkAt(-9)).toBe(1);
    expect(darkAt(-40)).toBe(1);
    for (let el = 20; el > -20; el -= 0.1) expect(darkAt(el - 0.1)).toBeGreaterThanOrEqual(darkAt(el));
  });

  it("changes the sky a little at a time: no jump anywhere between day and night", () => {
    let prev = duskColours(25);
    for (let el = 25; el >= -20; el -= 0.05) {
      const c = duskColours(el);
      for (let k = 0; k < 3; k++) {
        const a = channels(prev.sky[k]), b = channels(c.sky[k]);
        for (let ch = 0; ch < 3; ch++) expect(Math.abs(a[ch] - b[ch])).toBeLessThanOrEqual(4);
        expect(Math.abs(prev.tint[k] - c.tint[k])).toBeLessThan(0.02);
      }
      prev = c;
    }
  });

  it("keeps the day and the night looks as they were", () => {
    expect(duskColours(40)).toEqual({ sky: [0xb9d0e8, 0xd4e1ee, 0xeef2f4], tint: [1, 1, 1] });
    expect(duskColours(-30)).toEqual({ sky: [0x060a16, 0x0f1628, 0x18213a], tint: [1, 1, 1] });
    expect(sunlight(60)).toBeCloseTo(1, 5);
    expect(moonlight(-30)).toBe(1);
  });

  it("hands the light from the sun to the moon while both are dark", () => {
    expect(sunlight(-1)).toBe(0);
    expect(moonlight(-1)).toBe(0);
    expect(sunlight(-0.9)).toBeLessThan(0.01);
    expect(moonlight(-1.1)).toBeLessThan(0.01);
  });

  it("turns the sun golden low down and colours the sky around sunset only", () => {
    expect(sunKelvin(40)).toBeGreaterThan(5500);
    expect(sunKelvin(1)).toBeLessThan(2100);
    expect(afterglow(40)).toBe(0);
    expect(afterglow(-20)).toBe(0);
    expect(afterglow(0)).toBeGreaterThan(0.9);
    // a clear sunset sky: warm at the horizon, blue above
    const [top, , horizon] = duskColours(0.5).sky.map(channels);
    expect(horizon[0]).toBeGreaterThan(horizon[2] + 80);
    expect(top[2]).toBeGreaterThan(top[0]);
  });

  it("mixes colours channel by channel", () => {
    expect(mixHex(0x000000, 0xffffff, 0.5)).toBe(0x808080);
    expect(mixHex(0x102030, 0x405060, 0)).toBe(0x102030);
    expect(mixHex(0x102030, 0x405060, 2)).toBe(0x405060);
  });
});
