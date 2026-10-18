// Dates and times in Home Assistant's time zone (the house's), whatever the browser's is.

/** Milliseconds to add to UTC for the wall clock in `tz` at moment t. */
function offset(t: number, tz: string | undefined): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(t));
    const get = (k: string) => Number(parts.find((p) => p.type === k)?.value ?? 0);
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - Math.floor(t / 1000) * 1000;
  } catch {
    return -new Date(t).getTimezoneOffset() * 60_000;
  }
}

/** The moment it is `minutes` past midnight on a day (month 0-11) in the house's time zone. */
export function zonedTime(year: number, month: number, day: number, minutes: number, tz: string | undefined): number {
  const wall = Date.UTC(year, month, day) + minutes * 60_000;
  const t = wall - offset(wall, tz);
  return wall - offset(t, tz);
}

/** A moment's day and minute of the day in the house's time zone; `yday` counts from 0 on 1 January. */
export function zonedParts(t: number, tz: string | undefined): { year: number; month: number; day: number; minutes: number; yday: number } {
  const local = new Date(t + offset(t, tz));
  const year = local.getUTCFullYear();
  return {
    year, month: local.getUTCMonth(), day: local.getUTCDate(),
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
    yday: Math.floor((Date.UTC(year, local.getUTCMonth(), local.getUTCDate()) - Date.UTC(year, 0, 1)) / 86_400_000),
  };
}
