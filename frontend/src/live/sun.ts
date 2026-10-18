// Where the sun and the moon are, worked out in the browser from Home Assistant's location: for any
// moment (now, a replay's past, a picked date), smoothly, without waiting for sun.sun's updates.
// The sun follows NOAA's solar calculator (well within 0.1° of the real thing); the moon a shorter
// series, good to about a degree, which is plenty for moonlight.

export interface SunPlace {
  /** Degrees clockwise from north. */
  azimuth: number;
  /** Degrees above the horizon, with atmospheric refraction (as sun.sun reports it). */
  elevation: number;
}

export interface MoonPlace extends SunPlace {
  /** How much of its face is lit, 0 (new moon) .. 1 (full moon). */
  lit: number;
}

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Refraction lifts what is near the horizon (degrees, for an elevation in degrees). */
function refraction(e: number): number {
  if (e > 85) return 0;
  const t = Math.tan(e * RAD);
  if (e > 5) return (58.1 / t - 0.07 / t ** 3 + 0.000086 / t ** 5) / 3600;
  if (e > -0.575) return (1735 + e * (-518.2 + e * (103.4 + e * (-12.79 + e * 0.711)))) / 3600;
  return -20.772 / t / 3600;
}

/** The sun at a moment (ms since 1970) seen from a place (degrees; east and north positive). */
export function sunPosition(time: number, lat: number, lon: number): SunPlace {
  const jd = time / 86_400_000 + 2440587.5;
  const jc = (jd - 2451545) / 36525;
  const l0 = mod(280.46646 + jc * (36000.76983 + jc * 0.0003032), 360);
  const m = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const c = Math.sin(m * RAD) * (1.914602 - jc * (0.004817 + 0.000014 * jc))
    + Math.sin(2 * m * RAD) * (0.019993 - 0.000101 * jc)
    + Math.sin(3 * m * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * jc;
  const appLong = l0 + c - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const obliq = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(obliq * RAD) * Math.sin(appLong * RAD));
  const y = Math.tan((obliq / 2) * RAD) ** 2;
  // the equation of time, in minutes
  const eot = 4 * DEG * (y * Math.sin(2 * l0 * RAD) - 2 * e * Math.sin(m * RAD) + 4 * e * y * Math.sin(m * RAD) * Math.cos(2 * l0 * RAD)
    - 0.5 * y * y * Math.sin(4 * l0 * RAD) - 1.25 * e * e * Math.sin(2 * m * RAD));
  const minutes = mod(time / 60_000, 1440);
  const solar = mod(minutes + eot + 4 * lon, 1440);
  const hour = solar / 4 < 0 ? solar / 4 + 180 : solar / 4 - 180;
  const phi = lat * RAD;
  const cosZ = Math.max(-1, Math.min(1, Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(hour * RAD)));
  const zenith = Math.acos(cosZ);
  const elevation = 90 - zenith * DEG;
  const sinZ = Math.sin(zenith);
  let azimuth: number;
  if (Math.abs(sinZ) < 1e-9 || Math.abs(Math.cos(phi)) < 1e-9) azimuth = lat > 0 ? 180 : 0;
  else {
    const a = Math.acos(Math.max(-1, Math.min(1, (Math.sin(phi) * cosZ - Math.sin(decl)) / (Math.cos(phi) * sinZ)))) * DEG;
    azimuth = hour > 0 ? mod(a + 180, 360) : mod(540 - a, 360);
  }
  return { azimuth, elevation: elevation + refraction(elevation) };
}

/** Right ascension and declination (radians) of the sun and the moon, days after J2000. */
const OBLIQ = 23.4397 * RAD;
function sunCoords(d: number) {
  const m = (357.5291 + 0.98560028 * d) * RAD;
  const l = m + (1.9148 * Math.sin(m) + 0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m)) * RAD + 102.9372 * RAD + Math.PI;
  return { ra: Math.atan2(Math.sin(l) * Math.cos(OBLIQ), Math.cos(l)), dec: Math.asin(Math.sin(OBLIQ) * Math.sin(l)) };
}
function moonCoords(d: number) {
  const l = (218.316 + 13.176396 * d) * RAD;
  const m = (134.963 + 13.064993 * d) * RAD;
  const f = (93.272 + 13.22935 * d) * RAD;
  const lon = l + 6.289 * RAD * Math.sin(m);
  const lat = 5.128 * RAD * Math.sin(f);
  return {
    ra: Math.atan2(Math.sin(lon) * Math.cos(OBLIQ) - Math.tan(lat) * Math.sin(OBLIQ), Math.cos(lon)),
    dec: Math.asin(Math.sin(lat) * Math.cos(OBLIQ) + Math.cos(lat) * Math.sin(OBLIQ) * Math.sin(lon)),
    dist: 385001 - 20905 * Math.cos(m),
  };
}

/** The moon at a moment, seen from a place, and how full it is. */
export function moonPosition(time: number, lat: number, lon: number): MoonPlace {
  const d = time / 86_400_000 + 2440587.5 - 2451545;
  const c = moonCoords(d);
  const phi = lat * RAD;
  const h = (280.16 + 360.9856235 * d) * RAD + lon * RAD - c.ra;
  const alt = Math.asin(Math.sin(phi) * Math.sin(c.dec) + Math.cos(phi) * Math.cos(c.dec) * Math.cos(h)) * DEG;
  const az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(phi) - Math.tan(c.dec) * Math.cos(phi)) * DEG;
  const s = sunCoords(d);
  const sdist = 149598000;
  const angle = Math.acos(Math.max(-1, Math.min(1, Math.sin(s.dec) * Math.sin(c.dec) + Math.cos(s.dec) * Math.cos(c.dec) * Math.cos(s.ra - c.ra))));
  const inc = Math.atan2(sdist * Math.sin(angle), c.dist - sdist * Math.cos(angle));
  return { azimuth: mod(az + 180, 360), elevation: alt + refraction(alt), lit: (1 + Math.cos(inc)) / 2 };
}

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

/** "SW" for 225: a bearing as a point of the compass. */
export function compassName(bearing: number): string {
  return COMPASS[Math.round(mod(bearing, 360) / 22.5) % 16];
}

/** Sunrise, solar noon and sunset (ms) of the day starting at `dayStart`; null where the sun doesn't rise or set. */
export function sunEvents(dayStart: number, lat: number, lon: number): { rise: number | null; noon: number; set: number | null } {
  const HORIZON = -0.833;
  const step = 10 * 60_000;
  const el = (t: number) => sunPosition(t, lat, lon).elevation;
  // the moment between a and b where the sun crosses the horizon
  const cross = (a: number, b: number) => {
    const up = el(b) > el(a);
    for (let i = 0; i < 20; i++) {
      const m = (a + b) / 2;
      if ((el(m) > HORIZON) === up) b = m;
      else a = m;
    }
    return (a + b) / 2;
  };
  let rise: number | null = null, set: number | null = null, noon = dayStart, best = -Infinity;
  let prev = el(dayStart);
  for (let t = dayStart + step; t <= dayStart + 86_400_000; t += step) {
    const e = el(t);
    if (e > best) {
      best = e;
      noon = t;
    }
    if (prev <= HORIZON && e > HORIZON && rise === null) rise = cross(t - step, t);
    if (prev > HORIZON && e <= HORIZON && set === null) set = cross(t - step, t);
    prev = e;
  }
  return { rise, noon, set };
}
