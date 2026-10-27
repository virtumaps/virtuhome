import { describe, expect, it, vi } from "vitest";
import { automationsFor, EXT_API_VERSION } from "../src/ext/api";
import type { Hass } from "../src/live/hass";
import { previewRows, type AutomationPreview } from "../src/ui/automation-dialog";

const PHONE = "0123456789abcdef0123456789abcdef";
const PREVIEW: AutomationPreview = {
  alias: "Garage left open",
  description: "Added by VirtuHome for the Security extension.",
  blueprint: { id: "garage_open", path: "virtuhome/security/garage_open.yaml", name: "Garage left open", description: "Tells you when the garage is open late.", yaml: "blueprint: …" },
  inputs: [
    { key: "door", name: "Garage door", value: "cover.garage" },
    { key: "phone", name: "Phone", value: PHONE },
    { key: "at", name: "Time", value: "22:00" },
    { key: "for", name: "Open for", value: { minutes: 10 } },
  ],
  notify: [{ device_id: PHONE }, { service: "notify.family" }, { service: "notify.send_message", entity_id: "notify.kitchen" }],
  yaml: "triggers: …",
};
const ADDED = { id: "virtuhome-security-0a1b2c3d4e5f", alias: "Garage left open", blueprint: "garage_open", entity_id: "automation.garage_left_open", state: "on" };

function fakeHass() {
  const calls: Record<string, unknown>[] = [];
  const hass = {
    states: {
      "cover.garage": { entity_id: "cover.garage", state: "open", attributes: { friendly_name: "Garage door" }, last_changed: "", last_updated: "" },
      "notify.kitchen": { entity_id: "notify.kitchen", state: "unknown", attributes: { friendly_name: "Kitchen speaker" }, last_changed: "", last_updated: "" },
    },
    devices: { [PHONE]: { id: PHONE, name: "Pixel 8", name_by_user: "Kadir's phone" } },
    callWS: async (msg: Record<string, unknown>) => {
      calls.push(msg);
      if (msg.type === "virtuhome/automations/preview") return PREVIEW;
      if (msg.type === "virtuhome/automations/add") return { id: ADDED.id, entity_id: ADDED.entity_id };
      if (msg.type === "virtuhome/automations/list") return [ADDED];
      return null;
    },
  } as unknown as Hass;
  return { hass, calls };
}

describe("automations from an extension's blueprints (API 5)", () => {
  it("API 5", () => expect(EXT_API_VERSION).toBe(5));

  it("adds nothing unless the user agrees", async () => {
    const { hass, calls } = fakeHass();
    const ask = vi.fn(async () => false);
    const handle = automationsFor({ id: "security", name: "Security" }, () => hass, ask);
    expect(await handle.add("garage_open", { door: "cover.garage" })).toBeNull();
    expect(ask).toHaveBeenCalledWith(PREVIEW, "Security", hass);
    expect(calls.map((c) => c.type)).toEqual(["virtuhome/automations/preview"]);
  });

  it("adds, lists and removes the extension's own automations", async () => {
    const { hass, calls } = fakeHass();
    const handle = automationsFor({ id: "security", name: "Security" }, () => hass, async () => true);
    expect(await handle.add("garage_open", { door: "cover.garage" }, { name: "Garage" })).toEqual(ADDED);
    expect(calls.map((c) => c.type)).toEqual(["virtuhome/automations/preview", "virtuhome/automations/add", "virtuhome/automations/list"]);
    // what the user agreed to is what is added, tagged with the extension
    expect(calls[1]).toEqual({
      type: "virtuhome/automations/add", ext_id: "security", blueprint: "garage_open", inputs: { door: "cover.garage" },
      alias: "Garage", description: "Added by VirtuHome for the Security extension.",
    });
    await handle.remove(ADDED.id);
    expect(calls.at(-1)).toEqual({ type: "virtuhome/automations/remove", ext_id: "security", automation_id: ADDED.id });
    expect(await handle.list()).toEqual([ADDED]);
  });

  it("the dialog names entities, devices and where notifications go", () => {
    const { hass } = fakeHass();
    expect(previewRows(PREVIEW, hass)).toEqual({
      settings: [["Garage door", "Garage door (cover.garage)"], ["Phone", "Kadir's phone"], ["Time", "22:00"], ["Open for", '{"minutes":10}']],
      notify: ["Kadir's phone", "notify.family", "Kitchen speaker (notify.kitchen)"],
    });
    expect(previewRows(PREVIEW, null).notify).toEqual([PHONE, "notify.family", "notify.kitchen"]);
  });
});
