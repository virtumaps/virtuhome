// Readings: an entity's value as Home Assistant writes it, for labels on the plan, room labels and
// the top bar.
import { domainOf, type Hass, type HassEntity } from "./hass";

const gone = (s: HassEntity | undefined): s is undefined => !s || s.state === "unavailable" || s.state === "unknown";

/**
 * An entity's value with its unit: "21.4 °C", "48%", "Open". Home Assistant's own formatting is used
 * where there is one (its display precision, the user's number format, translated states); "–"
 * while the entity is unavailable or missing.
 */
export function valueText(hass: Hass, id: string): string {
  const s = hass.states[id];
  if (gone(s)) return "–";
  if (hass.formatEntityState) {
    try {
      return hass.formatEntityState(s);
    } catch {
      // older or partial frontends: written below instead
    }
  }
  const unit = typeof s.attributes.unit_of_measurement === "string" ? s.attributes.unit_of_measurement : "";
  const n = s.state.trim() === "" ? NaN : Number(s.state);
  if (!isFinite(n)) return unit ? `${s.state} ${unit}` : s.state;
  const p = hass.entities?.[id]?.display_precision;
  let num: string;
  try {
    num = new Intl.NumberFormat(hass.language || undefined, typeof p === "number" ? { minimumFractionDigits: p, maximumFractionDigits: p } : { maximumFractionDigits: 2 }).format(n);
  } catch {
    num = typeof p === "number" ? n.toFixed(p) : String(Math.round(n * 100) / 100);
  }
  if (!unit) return num;
  // as Home Assistant writes them in English: "48%", "21°", "21 °C"
  return unit === "%" || unit === "°" ? `${num}${unit}` : `${num} ${unit}`;
}

/** The icon (a name in the markers' icon list) a reading of this entity shows. */
export function readingIcon(hass: Hass, id: string): string {
  const s = hass.states[id];
  const dc = String(s?.attributes.device_class ?? "");
  const unit = String(s?.attributes.unit_of_measurement ?? "");
  switch (dc) {
    case "temperature": return "thermometer";
    case "humidity": case "moisture": return "humidity";
    case "power": case "energy": case "current": case "voltage": case "apparent_power": case "reactive_power": return "power";
    case "battery": return "battery";
    case "illuminance": return "brightness";
    case "carbon_dioxide": case "carbon_monoxide": return "co2";
    case "pm1": case "pm25": case "pm10": case "aqi": case "volatile_organic_compounds": case "volatile_organic_compounds_parts": case "nitrogen_dioxide": case "ozone": return "particles";
    case "wind_speed": return "wind";
    case "precipitation": case "precipitation_intensity": return "rain";
    case "monetary": return "money";
    case "water": case "volume": case "volume_storage": return "water";
  }
  if (/°|K$/.test(unit) && !dc) return "thermometer";
  const dom = domainOf(id);
  if (dom === "binary_sensor") return "dot";
  if (dom === "climate") return "thermostat";
  return "gauge";
}
