// Dev harness: the VirtuHome view outside Home Assistant.
//   ?hass=demo (default)  pretend states, toggles work locally
//   ?hass=live            your Home Assistant (dev/local.env.js gives the URL and a token)
//   ?plan=demo|<file>     the demo house, or a plan JSON from dev/plans/<file>.json
//   ?plan=empty           no home yet (the first run)
//   ?plan=catalog[&cat=<category>]  every built-in item in a labelled grid
//   ?theme=day|night  ?walls=smart|low|full  ?floor=<index>  ?quality=low|medium|high|ultra  ?stats
import "../src/compat";
import { createConnection, createLongLivedTokenAuth, subscribeEntities, type Connection } from "home-assistant-js-websocket";
import { emptyPlan, normalizePlan, type Plan } from "../src/model/plan";
import type { Hass } from "../src/live/hass";
import { VhView } from "../src/ui/view";
import type { WallMode, Quality } from "../src/scene/viewer";
import { DEMO_PLAN } from "./demo-plan";
import { catalogPlan } from "./catalog-plan";
import { demoHass } from "./demo-hass";
import { importRoomPlan } from "../src/import/roomplan";
import { autoPlace } from "../src/auto/placement";

const q = new URLSearchParams(location.search);

async function loadPlan(): Promise<Plan> {
  const scan = q.get("scan");
  if (scan) {
    // a House Scan folder under dev/scans (git-ignored: scans of real homes stay local)
    const house = await (await fetch(`/dev/scans/${scan}/house.json`)).json();
    const res = await fetch(`/dev/scans/${scan}/manifest.json`);
    const manifest = res.ok ? await res.json() : null;
    const det = await fetch(`/dev/scans/${scan}/detections.json`);
    const detections = det.ok ? await det.json().catch(() => null) : null;
    const { plan, report } = importRoomPlan(house, manifest, { frontDoorRoom: q.get("front") ?? "Hallway (downstairs)", detections });
    console.info("import", report);
    (window as unknown as { importReport: unknown }).importReport = report;
    return plan;
  }
  const name = q.get("plan") ?? "demo";
  if (name === "demo") return normalizePlan(DEMO_PLAN);
  if (name === "empty") return emptyPlan();
  // ?plan=catalog[&cat=plants]: every built-in item, labelled
  if (name === "catalog") return catalogPlan(q.get("cat"));
  const res = await fetch(`/dev/plans/${name}.json`);
  return normalizePlan(await res.json());
}

async function liveHass(onChange: (h: Hass) => void): Promise<Hass> {
  const cfg = (await import(/* @vite-ignore */ "/dev/local.env.js" as string)) as { HA_URL: string; HA_TOKEN: string };
  const conn: Connection = await createConnection({ auth: createLongLivedTokenAuth(cfg.HA_URL, cfg.HA_TOKEN) });
  const list = <T>(type: string) => conn.sendMessagePromise<T[]>({ type });
  const config = await conn.sendMessagePromise<Hass["config"]>({ type: "get_config" });
  const [ents, devs, areas, floors] = await Promise.all([
    list<{ entity_id: string; device_id: string | null; area_id: string | null; entity_category: string | null; hidden_by: string | null; platform: string }>("config/entity_registry/list"),
    list<{ id: string; area_id: string | null; name: string | null; name_by_user: string | null; model: string | null }>("config/device_registry/list"),
    list<{ area_id: string; name: string; floor_id: string | null }>("config/area_registry/list"),
    list<{ floor_id: string; name: string; level: number | null }>("config/floor_registry/list"),
  ]);
  const hass: Hass = {
    states: {},
    entities: Object.fromEntries(ents.map((e) => [e.entity_id, { entity_id: e.entity_id, device_id: e.device_id, area_id: e.area_id, entity_category: e.entity_category as never, hidden: !!e.hidden_by, platform: e.platform }])),
    devices: Object.fromEntries(devs.map((d) => [d.id, d])),
    areas: Object.fromEntries(areas.map((a) => [a.area_id, a])),
    floors: Object.fromEntries(floors.map((f) => [f.floor_id, f])),
    user: { id: "dev", name: "Dev", is_admin: true },
    config,
    callService: (domain, service, data, target) =>
      conn.sendMessagePromise({ type: "call_service", domain, service, service_data: data ?? {}, target }),
    callWS: <T>(msg: Record<string, unknown>) => conn.sendMessagePromise<T>(msg as never),
    hassUrl: (path = "") => cfg.HA_URL.replace(/\/$/, "") + path,
    connection: {
      subscribeMessage: (cb, msg) => conn.subscribeMessage(cb as never, msg as never) as never,
    },
  };
  subscribeEntities(conn, (states) => onChange({ ...hass, states: states as unknown as Hass["states"] }));
  return hass;
}

async function main(): Promise<void> {
  const plan = await loadPlan();
  const host = document.getElementById("view")!;
  const view = new VhView(host.attachShadow({ mode: "open" }), {
    theme: (q.get("theme") as never) ?? undefined,
    walls: (q.get("walls") as WallMode) ?? "smart",
    quality: (q.get("quality") as Quality) ?? "auto",
    stats: q.has("stats"),
    editable: true,
    // ?ext=wall_tablet loads dev/ext/wall_tablet.js (a build from virtuhome-pro, git-ignored)
    dev_extensions: q.getAll("ext").map((id) => `/dev/ext/${id}.js`),
    popup_camera: q.get("popup_camera") ?? undefined,
    popup_triggers: q.getAll("popup_trigger"),
    idle_return: q.has("idle") ? Number(q.get("idle")) : undefined,
    idle_orbit: q.has("orbit"),
    night_dim: q.get("night_dim") ?? undefined,
    save: async (p) => {
      // the dev harness keeps saves in the browser
      localStorage.setItem("virtuhome-dev-plan", JSON.stringify(p));
      console.info("saved", p);
      return Date.now();
    },
  }, plan);
  let placed = !q.has("auto");
  const set = (h: Hass) => {
    view.hass = h;
    // ?auto: place the devices of Home Assistant into the plan, once states are there
    if (!placed && Object.keys(h.states).length) {
      placed = true;
      const { plan: next, report } = autoPlace(plan, h);
      console.info("autoPlace", report);
      (window as unknown as { placeReport: unknown }).placeReport = report;
      view.applyPlan(next);
    }
  };
  const hass = q.get("hass") === "live" ? await liveHass(set) : demoHass(plan, set, (q.get("theme") ?? "night") === "night");
  set(hass);
  const floor = q.get("floor");
  if (floor !== null) view.showFloor(Number(floor));
  (window as unknown as { vh: VhView }).vh = view;
  window.dispatchEvent(new Event("virtuhome-ready"));
}

main().catch((err) => {
  document.body.textContent = String(err?.stack ?? err);
  window.dispatchEvent(new Event("virtuhome-ready"));
});
