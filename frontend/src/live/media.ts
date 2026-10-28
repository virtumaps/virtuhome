// What a TV or speaker is playing, for the label over it.
import type { Hass, HassEntity } from "./hass";

const OFF = new Set(["off", "standby", "unavailable", "unknown"]);

/**
 * The line a media player shows: "Title · Artist" while it plays or is paused; a TV that is on
 * without anything named shows its app or source ("Netflix", "HDMI 1"). Null: nothing to show.
 */
export function mediaText(s: HassEntity | undefined, tv: boolean): string | null {
  if (!s || OFF.has(s.state)) return null;
  const a = s.attributes;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const title = str(a.media_title);
  const by = str(a.media_artist) ?? str(a.media_album_artist) ?? str(a.media_series_title) ?? str(a.media_channel);
  const active = s.state === "playing" || s.state === "paused" || s.state === "buffering";
  if (active && title) return by && by !== title ? `${title} · ${by}` : title;
  // a speaker says nothing while it is idle (it keeps the last title)
  if (!tv) return null;
  return str(a.app_name) ?? str(a.source) ?? (active ? title : null);
}

/** Whether a media player is playing now (a speaker glows softly while it does). */
export const isPlaying = (s: HassEntity | undefined): boolean => s?.state === "playing" || s?.state === "buffering";

/** The artwork of what a TV plays, as an address the view can load; null without one. */
export function artwork(hass: Hass, s: HassEntity | undefined): string | null {
  const pic = s?.attributes.entity_picture;
  if (typeof pic !== "string" || !s || !(s.state === "playing" || s.state === "paused")) return null;
  if (/^https?:\/\//.test(pic)) return pic;
  if (!pic.startsWith("/") || pic.startsWith("//")) return null;
  return hass.hassUrl ? hass.hassUrl(pic) : pic;
}
