// Dusk and dawn for the realistic look: everything that changes with the sun's height, as smooth
// functions of it, so an evening goes from day to night without a jump. The low sun turns golden,
// the sky's light warms to rose and cools to blue, and the house's lamps take over as it gets dark.
// Colours are sRGB hex; the sky holds three stops (top, middle, horizon) for a clear sky.

/** How far into the dark it is: 0 by day (sun 2° up or more) .. 1 at night (sun 9° down or more). */
export function darkAt(elevation: number): number {
  return smooth(2, -9, elevation);
}

/** The sun's own light against full sun (before clouds): it fades as the sun sinks into the haze. */
export function sunlight(elevation: number): number {
  return smooth(-1, 3, elevation) * (0.35 + 0.65 * smooth(2, 30, elevation));
}

/**
 * Moonlight's share of its full strength: none until the sun is a degree down (when the sunlight
 * has gone too, so the one light in the scene can turn from the sun to the moon unseen).
 */
export function moonlight(elevation: number): number {
  return smooth(-1, -8, elevation);
}

/** The sun's colour temperature: white by day, golden low down, deep amber at the horizon. */
export function sunKelvin(elevation: number): number {
  return 2000 + 3600 * smooth(0, 32, elevation);
}

/** A rose push on the sun's colour right at sunset and sunrise (0..1). */
export function sunRose(elevation: number): number {
  return 1 - smooth(-1, 7, elevation);
}

interface Key {
  el: number;
  sky: [number, number, number];
  /** What the sky's light does to the colours it lights: a multiplier per channel. */
  tint: [number, number, number];
}

// a clear evening, from day to night (the morning runs the same way back)
const KEYS: Key[] = [
  { el: 15, sky: [0xb9d0e8, 0xd4e1ee, 0xeef2f4], tint: [1, 1, 1] },
  { el: 6, sky: [0xa8c0de, 0xdcdcd6, 0xf5dab2], tint: [1, 0.94, 0.84] },
  { el: 1.5, sky: [0x8099c4, 0xd9b4a8, 0xf6b27c], tint: [1, 0.84, 0.72] },
  { el: -2, sky: [0x5a6ca2, 0xb88e9d, 0xe99a76], tint: [0.94, 0.78, 0.86] },
  { el: -5, sky: [0x313d6c, 0x6c6190, 0xb08089], tint: [0.78, 0.74, 0.96] },
  { el: -8, sky: [0x151e3e, 0x2a325e, 0x464a78], tint: [0.68, 0.75, 1] },
  { el: -12, sky: [0x060a16, 0x0f1628, 0x18213a], tint: [1, 1, 1] },
];

export interface DuskColours {
  /** Top, middle and horizon of a clear sky. */
  sky: [number, number, number];
  tint: [number, number, number];
}

/** The clear sky's colours and the tint of its light at a sun height. */
export function duskColours(elevation: number): DuskColours {
  const first = KEYS[0], last = KEYS[KEYS.length - 1];
  if (elevation >= first.el) return { sky: [...first.sky], tint: [...first.tint] };
  if (elevation <= last.el) return { sky: [...last.sky], tint: [...last.tint] };
  let i = 0;
  while (KEYS[i + 1].el > elevation) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = smooth(0, 1, (a.el - elevation) / (a.el - b.el));
  return {
    sky: [0, 1, 2].map((k) => mixHex(a.sky[k], b.sky[k], t)) as DuskColours["sky"],
    tint: [0, 1, 2].map((k) => a.tint[k] + (b.tint[k] - a.tint[k]) * t) as DuskColours["tint"],
  };
}

/** How strongly dusk or dawn colours a picture (0 by day and at night, 1 around sunset). */
export function afterglow(elevation: number): number {
  return smooth(14, 2, elevation) * smooth(-11, -3, elevation);
}

export function smooth(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Two sRGB colours mixed (t = 0: a, 1: b). */
export function mixHex(a: number, b: number, t: number): number {
  const k = Math.max(0, Math.min(1, t));
  const ch = (s: number) => {
    const x = (a >> s) & 255, y = (b >> s) & 255;
    return Math.round(x + (y - x) * k) << s;
  };
  return ch(16) | ch(8) | ch(0);
}
