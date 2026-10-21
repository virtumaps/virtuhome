// A pretend Home Assistant for the dev harness and the online demo: states for every entity the
// plan uses, areas taken from the plan's rooms, and services that flip states like the real thing.
// It never reaches a real Home Assistant.
import type { Plan } from "../model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../live/hass";
import { demoHistory, storyState } from "./history";

/**
 * Changes to the pretend registry, to try relinking (window.demo in the harness):
 * demo.rename("light.stairs", "light.stair_lights"), demo.remove(id), demo.add(id, { name, area, device }).
 */
export const demoEdits = {
  rename(_from: string, _to: string): void {},
  remove(_id: string): void {},
  add(_id: string, _reg: { name?: string; area?: string; device?: string } = {}): void {},
};

/** How the pretend house starts (the harness takes these from its address). */
export interface DemoOptions {
  /** Night: more lights on, the sun down (default). */
  night?: boolean;
  /** The weather's state (rainy, snowy, pouring, fog, lightning-rainy...; "none" leaves it out). */
  weather?: string;
  /** The area Alex is in. */
  where?: string;
  /** The kitchen's leak sensor is on, to show the alert banner. */
  leak?: boolean;
}

export function demoHass(plan: Plan, onChange: (h: Hass) => void, opts: DemoOptions = {}): Hass {
  const night = opts.night ?? true;
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, HassEntityReg> = {};
  const areas: NonNullable<Hass["areas"]> = {};
  const now = new Date().toISOString();
  const put = (entity_id: string, state: string, attributes: HassEntity["attributes"] = {}) => {
    states[entity_id] = { entity_id, state, attributes: { friendly_name: pretty(entity_id), ...attributes }, last_changed: now, last_updated: now };
  };

  for (const floor of plan.floors) {
    for (const o of floor.outdoor ?? []) if (o.area_id) areas[o.area_id] = { area_id: o.area_id, name: o.name, floor_id: floor.ha_floor ?? null };
    for (const room of floor.rooms) {
      if (!room.area_id) continue;
      areas[room.area_id] = { area_id: room.area_id, name: room.name, floor_id: floor.ha_floor ?? null };
      // a climate sensor per area so the labels show something
      const t = `sensor.${room.area_id}_temperature`;
      put(t, (19 + Math.random() * 3).toFixed(1), { device_class: "temperature", unit_of_measurement: "°C" });
      entities[t] = { entity_id: t, area_id: room.area_id };
      const h = `sensor.${room.area_id}_humidity`;
      put(h, String(Math.round(42 + Math.random() * 15)), { device_class: "humidity", unit_of_measurement: "%" });
      entities[h] = { entity_id: h, area_id: room.area_id };
    }
    const roomArea = (x: number, z: number) => {
      for (const r of floor.rooms) {
        let inside = false;
        const p = r.points;
        for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
          if (p[i][1] > z !== p[j][1] > z && x < ((p[j][0] - p[i][0]) * (z - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) inside = !inside;
        }
        if (inside) return r.area_id;
      }
      return null;
    };
    const ids: [string, string | null][] = [
      ...floor.devices.map((d) => [d.entity, roomArea(d.x, d.z)] as [string, string | null]),
      ...floor.furniture.filter((f) => f.entity).map((f) => [f.entity!, roomArea(f.x, f.z)] as [string, string | null]),
      ...floor.openings.flatMap((o) => [o.entity, o.cover].filter(Boolean).map((e) => [e!, floor.rooms.find((r) => r.id === o.room_id)?.area_id ?? null] as [string, string | null])),
    ];
    for (const [id, area] of ids) {
      if (states[id]) continue;
      entities[id] = { entity_id: id, area_id: area };
      const dom = id.split(".")[0];
      if (dom === "light") {
        const on = night ? Math.random() > 0.35 : Math.random() > 0.8;
        const warm = Math.random() > 0.3;
        put(id, on ? "on" : "off", on ? (warm ? { brightness: 150 + Math.round(Math.random() * 100), color_temp_kelvin: 2700 } : { brightness: 200, rgb_color: [90, 140, 255] }) : {});
      } else if (dom === "binary_sensor") {
        const dc = /window/.test(id) ? "window" : /door/.test(id) ? "door" : "motion";
        put(id, Math.random() > (dc === "motion" ? 0.6 : 0.75) ? "on" : "off", { device_class: dc });
      } else if (dom === "media_player") put(id, /tv|webos/.test(id) ? "playing" : "idle");
      else if (dom === "camera") put(id, "idle");
      else if (dom === "climate") put(id, "heat", { hvac_action: "heating", current_temperature: 20.5, temperature: 21 });
      else if (dom === "cover") put(id, "open", { current_position: 60 });
      else put(id, "on");
    }
    // the roofs' solar strings (dark in the demo) and roof windows
    for (const it of (floor.roofs ?? []).flatMap((r) => r.items ?? [])) {
      if (it.entity && !states[it.entity]) {
        if (it.kind === "solar") put(it.entity, "0", { device_class: "power", unit_of_measurement: "kW" });
        else put(it.entity, "off", { device_class: "window" });
        entities[it.entity] = { entity_id: it.entity, area_id: null };
      }
    }
  }
  put("sun.sun", night ? "below_horizon" : "above_horizon", { azimuth: night ? 320 : 200, elevation: night ? -20 : 38 });
  // the weather
  const weather = opts.weather ?? "partlycloudy";
  if (weather !== "none") {
    const cloud: Record<string, number> = { sunny: 5, "clear-night": 5, partlycloudy: 45, cloudy: 95, fog: 100, rainy: 100, pouring: 100, snowy: 100, "lightning-rainy": 100 };
    put("weather.forecast_home", weather, {
      friendly_name: "Forecast Home", temperature: /snow/.test(weather) ? -1 : 12, temperature_unit: "°C", humidity: 78,
      cloud_coverage: cloud[weather] ?? 50, wind_bearing: 240, wind_speed: weather === "lightning-rainy" ? 38 : 14, wind_speed_unit: "km/h",
    });
  }
  // two people and the alarm, where the pretend day (history.ts) has them now
  const story = (id: string, fallback: string) => storyState(id, Date.now())?.s ?? fallback;
  put("person.alex", story("person.alex", "home"), { friendly_name: "Alex" });
  put("person.sam", story("person.sam", "not_home"), { friendly_name: "Sam" });
  put("alarm_control_panel.home", story("alarm_control_panel.home", "disarmed"), { friendly_name: "Alarm", code_arm_required: false });
  // the cameras' own sensors, on their devices (a doorbell's ding is an occupancy sensor, as ring-mqtt has it)
  const devices: NonNullable<Hass["devices"]> = {
    doorbell: { id: "doorbell", name: "Doorbell" },
    kitchen_camera: { id: "kitchen_camera", name: "Kitchen camera" },
  };
  for (const [id, device, dc] of [
    ["binary_sensor.doorbell_motion", "doorbell", "motion"],
    ["binary_sensor.doorbell_ding", "doorbell", "occupancy"],
    ["binary_sensor.kitchen_camera_motion", "kitchen_camera", "motion"],
  ] as const) {
    put(id, "off", { device_class: dc });
    entities[id] = { entity_id: id, device_id: device };
  }
  for (const [id, device] of [["camera.doorbell", "doorbell"], ["camera.kitchen", "kitchen_camera"]]) {
    if (entities[id]) entities[id].device_id = device;
  }
  // who is in which room: Alex's phone through Bermuda, on the same device
  // as the tracker in Alex's person; Sam's watch through ESPresense's mqtt_room, found by its name
  devices.alex_phone = { id: "alex_phone", name: "Alex's phone" };
  const alexArea = opts.where ?? "living_room";
  states["person.alex"].attributes.device_trackers = ["device_tracker.alexs_phone_bermuda_tracker"];
  put("device_tracker.alexs_phone_bermuda_tracker", "home", { friendly_name: "Alex's phone Bermuda Tracker" });
  entities["device_tracker.alexs_phone_bermuda_tracker"] = { entity_id: "device_tracker.alexs_phone_bermuda_tracker", device_id: "alex_phone", platform: "bermuda" };
  put("sensor.alexs_phone_area", areas[alexArea]?.name ?? "unknown", { friendly_name: "Alex's phone Area", area_id: alexArea, area_name: areas[alexArea]?.name });
  entities["sensor.alexs_phone_area"] = { entity_id: "sensor.alexs_phone_area", device_id: "alex_phone", platform: "bermuda" };
  put("sensor.sams_watch", "kitchen", { friendly_name: "Sam's watch", distance: 1.4 });
  entities["sensor.sams_watch"] = { entity_id: "sensor.sams_watch", platform: "mqtt_room" };
  // an mmWave presence sensor in the main bedroom
  put("binary_sensor.bedroom_presence", "on", { device_class: "occupancy", friendly_name: "Bedroom presence" });
  entities["binary_sensor.bedroom_presence"] = { entity_id: "binary_sensor.bedroom_presence", area_id: "bedroom" };
  // a leak sensor
  const kitchenArea = plan.floors[0]?.rooms.find((r) => /kitchen/i.test(r.name))?.area_id ?? null;
  put("binary_sensor.kitchen_leak", opts.leak ? "on" : "off", { device_class: "moisture", friendly_name: "Kitchen leak" });
  entities["binary_sensor.kitchen_leak"] = { entity_id: "binary_sensor.kitchen_leak", area_id: kitchenArea };

  const hass: Hass = {
    states,
    entities,
    devices,
    areas,
    floors: {},
    user: { id: "demo", name: "Demo", is_admin: true },
    // a house in London: the sun is where it is there now
    config: { latitude: 51.5072, longitude: -0.1276, time_zone: "Europe/London" },
    async callService(domain, service, _data, target) {
      const ids = ([] as string[]).concat((target?.entity_id as string | string[]) ?? []);
      for (const id of ids) {
        const s = states[id];
        if (!s) continue;
        let next = s.state;
        if (service === "toggle") next = s.state === "on" || s.state === "open" ? (domain === "cover" ? "closed" : "off") : domain === "cover" ? "open" : "on";
        if (service === "turn_on") next = "on";
        if (service === "turn_off") next = "off";
        const attrs = { ...s.attributes };
        if (domain === "light" && next === "on" && attrs.brightness === undefined) Object.assign(attrs, { brightness: 220, color_temp_kelvin: 2900 });
        if (domain === "cover") attrs.current_position = next === "open" ? 100 : 0;
        states[id] = { ...s, state: next, attributes: attrs, last_changed: new Date().toISOString() };
      }
      Object.assign(hass, { states: { ...states } });
      onChange({ ...hass, states: { ...states } });
    },
    async callWS<T>(msg: Record<string, unknown>) {
      // replays read the recorder's history; the demo has a pretend day for them
      if (msg.type === "history/history_during_period") return demoHistory(msg as Parameters<typeof demoHistory>[0], states) as T;
      if (msg.type === "virtuhome/background/upload") return demoUpload(msg) as T;
      // Check my setup: all well with the card, and no licence
      if (msg.type === "virtuhome/checks" || msg.type === "virtuhome/checks/fix_card") {
        return { version: __VERSION__, dashboard: { mode: "storage", urls: [`/local/virtuhome/card-loader.js?v=${__VERSION__}`], current: true }, licence: { status: "none", error: null, extensions: [] } } as T;
      }
      if (msg.type === "config/entity_registry/list") {
        return Object.values(entities).map((e) => ({ id: regId(e.entity_id), entity_id: e.entity_id, device_id: e.device_id ?? null, area_id: e.area_id ?? null, platform: e.platform ?? "demo" })) as T;
      }
      if (msg.type === "auth/sign_path") {
        const file = decodeURIComponent(String(msg.path).split("/").pop() ?? "");
        if (!demoImages.has(file)) throw new Error("not found");
        return { path: demoImages.get(file) } as T;
      }
      // the rest (saving, restore points, licences) needs the integration
      throw new Error("Not in the demo");
    },
    connection: {
      async subscribeMessage() {
        throw new Error("demo");
      },
    },
  };
  // registry ids stay with an entity when it is renamed
  const regIds = new Map<string, string>();
  const regId = (id: string) => {
    if (!regIds.has(id)) regIds.set(id, Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    return regIds.get(id)!;
  };
  const publish = () => {
    Object.assign(hass, { states: { ...states }, entities: { ...entities } });
    onChange({ ...hass });
  };
  demoEdits.rename = (from, to) => {
    if (!states[from]) return;
    regId(from);
    states[to] = { ...states[from], entity_id: to };
    if (entities[from]) entities[to] = { ...entities[from], entity_id: to };
    regIds.set(to, regIds.get(from)!);
    demoEdits.remove(from);
  };
  demoEdits.remove = (id) => {
    delete states[id];
    delete entities[id];
    regIds.delete(id);
    publish();
  };
  demoEdits.add = (id, reg = {}) => {
    put(id, id.startsWith("light.") ? "on" : "off", reg.name ? { friendly_name: reg.name } : {});
    entities[id] = { entity_id: id, area_id: reg.area ?? null, device_id: reg.device ?? null };
    publish();
  };
  return hass;
}

/** Floor plan pictures "stored" by the demo: file name -> a blob: URL of this page. */
const demoImages = new Map<string, string>();
const demoUploads = new Map<string, string[]>();

function demoUpload(msg: Record<string, unknown>): { upload_id?: string; file?: string; bytes: number } {
  const id = (msg.upload_id as string | undefined) ?? Math.random().toString(16).slice(2, 18).padEnd(16, "0");
  const parts = demoUploads.get(id) ?? [];
  parts.push(String(msg.data));
  demoUploads.set(id, parts);
  const bytes = parts.map((b) => atob(b)).join("");
  if (!msg.done) return { upload_id: id, bytes: bytes.length };
  demoUploads.delete(id);
  const raw = Uint8Array.from(bytes, (c) => c.charCodeAt(0));
  const png = raw[0] === 0x89;
  let hash = 0;
  for (const b of raw) hash = (hash * 31 + b) >>> 0;
  const file = `${msg.floor_id}-${hash.toString(16).padStart(12, "0").slice(-12)}.${png ? "png" : "jpg"}`;
  demoImages.set(file, URL.createObjectURL(new Blob([raw], { type: png ? "image/png" : "image/jpeg" })));
  return { file, bytes: raw.length };
}

function pretty(id: string): string {
  const name = id.split(".")[1].replace(/_/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}
