// The online demo's tour: what the host says, and what the demo house and the 3D view do meanwhile.
// tour.ts plays it. The add-ons' parts are previews drawn on the demo house with the same hooks the
// add-ons use (room colours and texts, the roof's paint, marks on furniture, replays), from pretend
// numbers: the demo loads no add-on.
//
// A line: { say: "…" }, with
//   mood           the host's face (cast.ts)
//   do / after     what happens as the line starts / ends
//   gap            the pause after it (ms, default 250): time to see a change before the next line
//   replay         where the replay's clock goes during the line ("10:15")
//   when           left out when it returns false
import {
  mdiCashMultiple, mdiClockOutline, mdiDishwasher, mdiDoorbellVideo, mdiHomeLightningBolt, mdiLightbulbGroup, mdiSolarPower,
  mdiTrashCan, mdiWaterPercent,
} from "@mdi/js";
import type { ViewHandle } from "../../src/ext/api";
import type { Hass } from "../../src/live/hass";
import type { RGBA } from "../../src/live/live";
import type { Mood } from "./cast";

/** The host's name (a placeholder). */
export const HOST = "Pip";

/** Words the voices say wrongly, and how to write them so they say them right (the subtitles keep the first). */
export const SAY_AS: [RegExp, string][] = [[/VirtuHome/g, "Virtue Home"]];

/** What a line or chapter can do with the house and the view. */
export interface Show {
  readonly view: ViewHandle;
  readonly hass: Hass;
  /** Trials of the add-ons are open (the licence server says so). */
  readonly trials: boolean;
  call(domain: string, service: string, entity: string | string[], data?: Record<string, unknown>): void;
  /** The whole house, with or without its roofs (null: as the roof button says). */
  house(roof?: boolean | null): void;
  /** One floor, from above, its rooms' names showing. */
  floor(index: number): void;
  /** Flies to the room an entity is in. */
  fly(entity: string): void;
  /** Starts showing the pretend day from a time ("07:45"). */
  replay(at: string): void;
  endReplay(): void;
}

export interface Chip {
  icon: string;
  label: string;
  value: string | ((hass: Hass) => string);
}

export interface Line {
  say: string;
  mood?: Mood;
  do?: (s: Show) => void;
  after?: (s: Show) => void;
  gap?: number;
  replay?: string;
  when?: (s: Show) => boolean;
}

export interface Chapter {
  title: string;
  kicker: string;
  /** The add-on it shows, on a badge. */
  addOn?: string;
  chips?: Chip[];
  start?: (s: Show) => void;
  /** Takes the chapter's previews off again (also when the tour is stopped or skipped). */
  end?: (s: Show) => void;
  lines: Line[];
}

// ------------------------------------------------------------------ the demo house

const LIVING = ["light.living_room_downlights", "light.living_room_floor_lamp", "light.fireplace_strip"];
const colour = (rgb: [number, number, number]) => (s: Show) => {
  s.call("light", "turn_on", LIVING, { rgb_color: rgb, brightness: 230 });
  s.call("light", "turn_on", "light.living_room_ceiling", { brightness: 40 });
};
const warm = (s: Show) => s.call("light", "turn_on", [...LIVING, "light.living_room_ceiling"], { color_temp_kelvin: 2700, brightness: 190 });

/** What each room uses in the Energy preview, kW (the kettle is on). */
const ROOM_KW: Record<string, number> = {
  kitchen: 2.2, living_room: 0.18, dining_room: 0.06, hallway: 0.02, utility: 0.11, bedroom: 0.04, bedroom_2: 0.09, bedroom_3: 0.12, bathroom: 0.01,
};

const lin = (v: number) => (v / 255) ** 2.2;

function energyRooms(s: Show, on: boolean): void {
  s.view.setRoomTint(on ? (_f, sp) => {
    const kw = sp.area_id ? ROOM_KW[sp.area_id] : undefined;
    return kw === undefined || sp.outdoor ? null : [1, 0.5, 0.12, 0.08 + 0.45 * Math.min(1, kw / 2.2)] as RGBA;
  } : null);
  s.view.setRoomText(on ? (_f, sp) => {
    const kw = sp.area_id && !sp.outdoor ? ROOM_KW[sp.area_id] : undefined;
    return kw === undefined ? null : kw < 1 ? `${Math.round(kw * 1000)} W` : `${kw.toFixed(1)} kW`;
  } : null);
  s.view.refreshRooms();
}

// the colours the Energy add-on paints the roof with, worst to best
const RAMP: [number, number][] = [[0, 0x2b0f54], [0.25, 0x7a1f6e], [0.5, 0xc4305a], [0.7, 0xef6a2b], [0.85, 0xfbb43a], [1, 0xfdf3a0]];

/** A score (0..1) as the ramp's colour, linear RGB. */
function ramp(v: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, v));
  let i = 1;
  while (i < RAMP.length - 1 && x > RAMP[i][0]) i++;
  const [a, ca] = RAMP[i - 1];
  const [b, cb] = RAMP[i];
  const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
  const mix = (shift: number) => lin(((ca >> shift) & 255) * (1 - k) + ((cb >> shift) & 255) * k);
  return [mix(16), mix(8), mix(0)];
}

/** The roof's sun, roughly: how square each slope faces the sun at a typical British height. */
function solarRoof(s: Show, on: boolean): void {
  if (!on) {
    s.view.paintRoofs(null);
    s.view.showRoofs(null);
    return;
  }
  s.view.showRoofs(true);
  const sun = (38 * Math.PI) / 180;
  s.view.paintRoofs((face) => {
    const tilt = (face.tilt * Math.PI) / 180;
    const facing = Math.cos(((face.azimuth - 180) * Math.PI) / 180);
    const d = Math.cos(tilt) * Math.sin(sun) + Math.sin(tilt) * Math.cos(sun) * facing;
    return ramp(0.25 + 0.75 * Math.max(0, d));
  }, 0.3);
}

const tintRoom = (s: Show, area: string, tint: RGBA | null, text: string | null) => {
  s.view.setRoomTint(tint ? (_f, sp) => (sp.area_id === area && !sp.outdoor ? tint : null) : null);
  s.view.setRoomText(text ? (_f, sp) => (sp.area_id === area && !sp.outdoor ? text : null) : null);
  s.view.refreshRooms();
};

const dishwasher = (s: Show, on: boolean) => {
  s.view.markItems(on ? (_f, item) => (item.type === "dishwasher" ? { glow: [0.25, 1, 0.55], text: "Done" } : null) : null);
  s.view.refreshItems();
};

const lightsOn = (h: Hass) => String(Object.values(h.states).filter((e) => e.entity_id.startsWith("light.") && e.state === "on").length);

// ------------------------------------------------------------------ the tour

export const CHAPTERS: Chapter[] = [
  {
    title: "Meet VirtuHome",
    kicker: "Your home, live in 3D",
    start: (s) => s.house(true),
    lines: [
      { say: `Hi! I'm ${HOST}. Welcome to VirtuHome: your home, live in 3D, inside Home Assistant.`, mood: "excited" },
      { say: "This is a pretend house, but everything you'll see works on yours. Two minutes. Let's go!", mood: "happy" },
    ],
  },
  {
    title: "Live, in 3D",
    kicker: "Free, for every home",
    chips: [{ icon: mdiLightbulbGroup, label: "Lights on", value: lightsOn }],
    start: (s) => s.house(false),
    lines: [
      { say: "Every light, door and window sits where it really is, and changes the moment it does." },
      { say: "Watch the living room.", do: (s) => s.fly("light.living_room_downlights"), after: colour([40, 90, 255]), gap: 1400 },
      { say: "Ooh! Blue.", mood: "surprised", after: colour([255, 40, 170]), gap: 1200 },
      { say: "Pink! Now we're talking.", mood: "excited" },
      { say: "Tap anything to switch it. And all of that is free.", mood: "happy", after: warm },
    ],
  },
  {
    title: "Energy",
    kicker: "What every room uses, and what it costs",
    addOn: "Energy add-on",
    chips: [
      { icon: mdiHomeLightningBolt, label: "House now", value: "2.8 kW" },
      { icon: mdiCashMultiple, label: "Today so far", value: "£1.84" },
      { icon: mdiClockOutline, label: "Cheapest power", value: "00:30 – 05:30" },
      { icon: mdiSolarPower, label: "Best slope for panels", value: "97% of the best" },
    ],
    start: (s) => {
      s.floor(0);
      energyRooms(s, true);
    },
    end: (s) => {
      energyRooms(s, false);
      solarRoof(s, false);
    },
    lines: [
      { say: "With the Energy add-on, every room glows with what it's using, right now." },
      { say: "The kitchen's the hungry one. Kettle's on!", mood: "happy" },
      { say: "It knows when power is cheap, what the house has cost today, and when to charge the car." },
      {
        say: "And look up!", mood: "excited", gap: 900,
        after: (s) => {
          energyRooms(s, false);
          s.house(true);
          solarRoof(s, true);
        },
      },
      { say: "It scores every part of the roof for solar panels, from the sun's path and the house's own shade." },
      { say: "The yellower, the better. Before you spend a penny on panels!", mood: "wink" },
    ],
  },
  {
    title: "While you were out",
    kicker: "Your day, played back on the house",
    addOn: "Security add-on",
    start: (s) => {
      s.house(false);
      s.replay("07:40");
    },
    end: (s) => s.endReplay(),
    lines: [
      { say: "Been out all day? The Security add-on plays back what happened, right on the house.", replay: "08:28" },
      { say: "Half past eight: the house is empty, and the alarm sets itself.", replay: "08:40" },
      { say: "Around ten: a parcel at the front door.", replay: "10:20" },
      { say: "One o'clock: the dog walker lets themselves in, and takes the dog out.", replay: "13:20" },
      { say: "Twenty to six: Alex is home, and the heating came on in time.", replay: "17:50" },
      { say: "Camera clips play right beside it. And your phone tells you what happened while you were out.", mood: "happy" },
    ],
  },
  {
    title: "The everyday stuff",
    kicker: "Appliances, bins, damp and mould",
    addOn: "Household add-on",
    chips: [
      { icon: mdiDishwasher, label: "Dishwasher", value: "Done" },
      { icon: mdiTrashCan, label: "Bins", value: "Black bin tomorrow" },
      { icon: mdiWaterPercent, label: "Bathroom", value: "Damp risk this week" },
    ],
    start: (s) => {
      s.floor(0);
      dishwasher(s, true);
    },
    end: (s) => {
      dishwasher(s, false);
      tintRoom(s, "bathroom", null, null);
    },
    lines: [
      { say: "The Household add-on keeps an eye on the everyday stuff.", mood: "happy" },
      { say: "The dishwasher's done. It says so on every screen, and on your phone." },
      {
        say: "It tags the bin to put out the night before. And it watches for damp and mould, room by room.",
        do: (s) => {
          s.floor(1);
          tintRoom(s, "bathroom", [0.3, 0.6, 1, 0.45], "Damp risk");
        },
      },
      { say: "It'll even tell you when to open a window. Nicely.", mood: "wink" },
    ],
  },
  {
    title: "On the wall",
    kicker: "A screen by the front door",
    addOn: "Wall Tablet add-on",
    chips: [{ icon: mdiDoorbellVideo, label: "Front door", value: "Someone's there" }],
    start: (s) => s.house(true),
    lines: [
      { say: "And with the Wall Tablet add-on, it all goes on a tablet on the wall." },
      { say: "It wakes as you walk up, and shows the doorbell camera the moment someone rings.", do: (s) => s.fly("camera.doorbell") },
      { say: "Visitors always ask about that bit!", mood: "excited" },
    ],
  },
  {
    title: "Your turn",
    kicker: "Get VirtuHome",
    start: (s) => s.house(true),
    lines: [
      { say: "VirtuHome is free, in the Home Assistant Community Store.", mood: "happy" },
      { say: "And every add-on has a free fourteen-day trial. Try them on your own house!", mood: "excited", when: (s) => s.trials },
      { say: "And the add-ons are coming very soon. Keep an eye out!", mood: "excited", when: (s) => !s.trials },
      { say: "Thanks for watching. Bye!", mood: "excited" },
    ],
  },
];
