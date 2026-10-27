// The parts of Home Assistant's frontend `hass` object VirtuHome uses.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    friendly_name?: string;
    device_class?: string;
    unit_of_measurement?: string;
    brightness?: number;
    rgb_color?: [number, number, number];
    color_temp_kelvin?: number;
    current_position?: number;
    hvac_action?: string;
    icon?: string;
  };
  last_changed: string;
  last_updated: string;
}

export interface HassEntityReg {
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
  entity_category?: "config" | "diagnostic" | null;
  hidden?: boolean;
  name?: string | null;
  platform?: string;
  /** Decimals the user (or the integration) picked for a sensor's value. */
  display_precision?: number;
}

export interface HassDeviceReg {
  id: string;
  area_id?: string | null;
  name?: string | null;
  name_by_user?: string | null;
  model?: string | null;
  manufacturer?: string | null;
}

export interface HassAreaReg {
  area_id: string;
  name: string;
  floor_id?: string | null;
  icon?: string | null;
  aliases?: string[];
}

export interface HassFloorReg {
  floor_id: string;
  name: string;
  level?: number | null;
}

export interface Hass {
  states: Record<string, HassEntity>;
  entities?: Record<string, HassEntityReg>;
  devices?: Record<string, HassDeviceReg>;
  areas?: Record<string, HassAreaReg>;
  floors?: Record<string, HassFloorReg>;
  user?: { id: string; name: string; is_admin: boolean };
  themes?: { darkMode?: boolean };
  language?: string;
  /** The home's location and time zone (Settings → System → General). */
  config?: { latitude?: number; longitude?: number; elevation?: number; time_zone?: string };
  /** A state as Home Assistant's frontend writes it: precision, unit, number format, translated states. */
  formatEntityState?(stateObj: HassEntity, state?: string): string;
  callService(domain: string, service: string, data?: Record<string, unknown>, target?: Record<string, unknown>): Promise<unknown>;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  /** A path on Home Assistant as a full address (Home Assistant's frontend has it, and so does the dev harness). */
  hassUrl?(path?: string): string;
  connection: {
    subscribeMessage<T>(cb: (msg: T) => void, msg: Record<string, unknown>): Promise<() => Promise<void>>;
  };
}

export const domainOf = (entityId: string): string => entityId.slice(0, entityId.indexOf("."));

/** A sensor of power (W, kW, MW…). */
export const isPower = (s: HassEntity | undefined): boolean =>
  !!s && domainOf(s.entity_id) === "sensor" && s.attributes.device_class === "power" && /^(m|k|M|G)?W$/.test(String(s.attributes.unit_of_measurement ?? ""));

/** A power sensor's reading in kW, or null. */
export function kw(hass: Hass, id: string | null): number | null {
  const s = id ? hass.states[id] : undefined;
  if (!s) return null;
  const v = parseFloat(s.state);
  if (!isFinite(v)) return null;
  const unit = String(s.attributes.unit_of_measurement ?? "kW");
  const k = unit === "W" ? 1e-3 : unit === "mW" ? 1e-6 : unit === "MW" ? 1e3 : unit === "GW" ? 1e6 : 1;
  return v * k;
}

/** The area an entity belongs to: its own, or its device's. */
export function areaOf(hass: Hass, entityId: string): string | null {
  const reg = hass.entities?.[entityId];
  if (!reg) return null;
  if (reg.area_id) return reg.area_id;
  if (reg.device_id) return hass.devices?.[reg.device_id]?.area_id ?? null;
  return null;
}

/** Opens Home Assistant's own dialog for an entity (works from cards and panels). */
export function moreInfo(from: HTMLElement, entityId: string): void {
  from.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
}
