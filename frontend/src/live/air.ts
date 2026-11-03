// Air quality: the maps beside the temperature map (CO₂, humidity, fine particles and VOC), each
// reading put into a band from good to bad, and the bands' colours.
import type { HassEntity } from "./hass";

export const AIR = ["co2", "humidity", "pm25", "voc"] as const;
export type Air = (typeof AIR)[number];
/** The maps the map button steps through: temperature, then those of the air. */
export type MapKind = "temperature" | Air;
/** How a reading is: humidity can be too dry too, the rest only too high. */
export type Band = "dry" | "good" | "fair" | "poor" | "bad";

/** The sensors' device classes for each map. */
export const AIR_CLASSES: Record<Air, readonly string[]> = {
  co2: ["carbon_dioxide"],
  humidity: ["humidity"],
  pm25: ["pm25"],
  voc: ["volatile_organic_compounds", "volatile_organic_compounds_parts"],
};

/**
 * Where good, fair and poor end (bad above), in each map's unit:
 * - CO₂ (ppm): fresh air is ~420; over 1000 a room feels stuffy, over 1500 it needs a window open.
 * - PM2.5 (µg/m³): the WHO's 24-hour guideline is 15; 35 and 55 start the US index's "unhealthy
 *   for sensitive groups" and "unhealthy".
 * - VOC (µg/m³): the German Environment Agency's levels for all VOCs together (0.3, 1 and 3 mg/m³);
 *   in ppb, Sensirion's (220, 660, 2200).
 * - Humidity (%): dry under 30, good to 60, damp to 70 and mould likely over it.
 */
export const LIMITS = {
  co2: [800, 1000, 1500],
  pm25: [15, 35, 55],
  voc: [300, 1000, 3000],
  vocPpb: [220, 660, 2200],
  humidity: [30, 60, 70],
} as const;

/** The bands each map uses, from best to worst (what its legend lists). */
export const BANDS: Record<Air, readonly Band[]> = {
  co2: ["good", "fair", "poor", "bad"],
  humidity: ["dry", "good", "poor", "bad"],
  pm25: ["good", "fair", "poor", "bad"],
  voc: ["good", "fair", "poor", "bad"],
};

/**
 * The bands' colours (sRGB 0–1), from the Okabe–Ito set, which people with each kind of colour
 * blindness tell apart: sky blue, bluish green, yellow, orange, vermilion. They also go from light
 * to dark as the air gets worse.
 */
export const BAND_COLOURS: Record<Band, [number, number, number]> = {
  dry: [0.337, 0.706, 0.914],
  good: [0, 0.62, 0.451],
  fair: [0.941, 0.894, 0.259],
  poor: [0.902, 0.624, 0],
  bad: [0.835, 0.369, 0],
};

/** Whether a sensor reads this map's air: by its device class. */
export function readsAir(kind: Air, s: HassEntity | undefined): boolean {
  return !!s && AIR_CLASSES[kind].includes(String(s.attributes.device_class ?? ""));
}

const unitOf = (s: HassEntity) => String(s.attributes.unit_of_measurement ?? "").toLowerCase();
/** A VOC sensor that reads in parts (ppb or ppm) rather than µg/m³. */
const inParts = (s: HassEntity) => s.attributes.device_class === "volatile_organic_compounds_parts" || unitOf(s) === "ppb" || unitOf(s) === "ppm";

/** A reading's number, in the unit the map's bands are in (VOC: µg/m³, or ppb for a sensor in parts). */
function value(kind: Air, s: HassEntity): { v: number; ppb: boolean } | null {
  const v = s.state.trim() === "" ? NaN : Number(s.state);
  if (!isFinite(v)) return null;
  if (kind !== "voc") return { v, ppb: false };
  if (inParts(s)) return { v: unitOf(s) === "ppm" ? v * 1000 : v, ppb: true };
  return { v: unitOf(s) === "mg/m³" ? v * 1000 : v, ppb: false };
}

/** The band a sensor's reading is in, or null while it has none (unavailable, not a number). */
export function airBand(kind: Air, s: HassEntity | undefined): Band | null {
  if (!s) return null;
  const r = value(kind, s);
  if (!r) return null;
  const [a, b, c] = kind === "voc" && r.ppb ? LIMITS.vocPpb : LIMITS[kind];
  const v = r.v;
  if (kind === "humidity") return v < a ? "dry" : v <= b ? "good" : v <= c ? "poor" : "bad";
  return v < a ? "good" : v < b ? "fair" : v < c ? "poor" : "bad";
}

/** The limits and unit a map's legend shows, for the home's sensor of it (VOC in ppb or µg/m³). */
export function legendScale(kind: Air, s: HassEntity | undefined): { limits: readonly number[]; unit: string } {
  if (kind === "voc") return s && inParts(s) ? { limits: LIMITS.vocPpb, unit: "ppb" } : { limits: LIMITS.voc, unit: "µg/m³" };
  return { limits: LIMITS[kind], unit: kind === "co2" ? "ppm" : kind === "humidity" ? "%" : "µg/m³" };
}

/** Whether a band is worth saying on the room's label: the air needs something doing. */
export const needsDoing = (band: Band | null): boolean => band === "poor" || band === "bad" || band === "dry";
