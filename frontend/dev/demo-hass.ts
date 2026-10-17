// A pretend Home Assistant for the dev harness and the online demo: states for every entity the
// plan uses, areas taken from the plan's rooms, and services that flip states like the real thing.
import type { Plan } from "../src/model/plan";
import type { Hass, HassEntity, HassEntityReg } from "../src/live/hass";

export function demoHass(plan: Plan, onChange: (h: Hass) => void, night = true): Hass {
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, HassEntityReg> = {};
  const areas: NonNullable<Hass["areas"]> = {};
  const now = new Date().toISOString();
  const put = (entity_id: string, state: string, attributes: HassEntity["attributes"] = {}) => {
    states[entity_id] = { entity_id, state, attributes: { friendly_name: pretty(entity_id), ...attributes }, last_changed: now, last_updated: now };
  };

  for (const floor of plan.floors) {
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
  }
  put("sun.sun", night ? "below_horizon" : "above_horizon", { azimuth: night ? 320 : 200, elevation: night ? -20 : 38 });
  // two people, and a leak sensor (?leak turns it on to show the alert banner)
  put("person.alex", "home", { friendly_name: "Alex" });
  put("person.sam", "not_home", { friendly_name: "Sam" });
  const kitchenArea = plan.floors[0]?.rooms.find((r) => /kitchen/i.test(r.name))?.area_id ?? null;
  put("binary_sensor.kitchen_leak", new URLSearchParams(location.search).has("leak") ? "on" : "off", { device_class: "moisture", friendly_name: "Kitchen leak" });
  entities["binary_sensor.kitchen_leak"] = { entity_id: "binary_sensor.kitchen_leak", area_id: kitchenArea };

  const hass: Hass = {
    states,
    entities,
    devices: {},
    areas,
    floors: {},
    user: { id: "demo", name: "Demo", is_admin: true },
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
    async callWS() {
      throw new Error("demo");
    },
    connection: {
      async subscribeMessage() {
        throw new Error("demo");
      },
    },
  };
  return hass;
}

function pretty(id: string): string {
  const name = id.split(".")[1].replace(/_/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}
