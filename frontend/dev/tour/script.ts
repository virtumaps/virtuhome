// The online demo's tour: what the two hosts say, and what the demo house and the 3D view do
// meanwhile. tour.ts plays it. The add-ons' parts are previews drawn on the demo house with the same
// hooks the add-ons use (room colours and texts, the roof's paint, marks on furniture, replays), from
// pretend numbers: the demo loads no add-on.
//
// A line: { orb: "…" } or { blob: "…" }, with
//   mood / react   the speaker's and the listener's faces (cast.ts)
//   do / after     what happens as the line starts / ends
//   gap            the pause after it (ms, default 250): time to see a change before the next line
//   replay         where the replay's clock goes during the line ("10:15")
//   when           left out when it returns false
import {
  mdiBattery10, mdiCashMultiple, mdiClockOutline, mdiDishwasher, mdiHomeLightningBolt, mdiLightbulbGroup, mdiSolarPower,
  mdiTrashCan, mdiWaterPercent,
} from "@mdi/js";
import type { ViewHandle } from "../../src/ext/api";
import type { Hass } from "../../src/live/hass";
import type { RGBA } from "../../src/live/live";
import type { Mood } from "./cast";

/** The hosts' names (placeholders). */
export const NAMES = { orb: "Atlas", blob: "Pip" };

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
  orb?: string;
  blob?: string;
  mood?: Mood;
  react?: Mood;
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
      { blob: `Hi! I'm ${NAMES.blob}, and this is ${NAMES.orb}.`, mood: "excited" },
      { orb: "Welcome to VirtuHome: your home, live in 3D, inside Home Assistant.", mood: "smile" },
      { blob: "This is a pretend house. But everything you'll see works on yours.", mood: "happy" },
      { orb: "Two minutes. Let's go.", mood: "dry", react: "wink" },
    ],
  },
  {
    title: "Live, in 3D",
    kicker: "Free, for every home",
    chips: [{ icon: mdiLightbulbGroup, label: "Lights on", value: lightsOn }],
    start: (s) => s.house(false),
    lines: [
      { orb: "Every light, door and window sits where it really is, and changes the moment it does." },
      { orb: "Watch the living room.", do: (s) => s.fly("light.living_room_downlights"), after: colour([40, 90, 255]), gap: 1400 },
      { blob: "Ooh! Blue.", mood: "surprised", after: colour([255, 40, 170]), gap: 1200 },
      { blob: "Pink! Now we're talking.", mood: "excited" },
      { orb: "Tap anything to switch it. All of that is free.", after: warm },
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
      { orb: "With the Energy add-on, every room glows with what it's using, right now." },
      { blob: "The kitchen's the hungry one. Kettle's on!", mood: "happy" },
      { orb: "It knows when power is cheap, what the house has cost today, and when to charge the car." },
      {
        blob: "And look up!", mood: "excited", gap: 900,
        after: (s) => {
          energyRooms(s, false);
          s.house(true);
          solarRoof(s, true);
        },
      },
      { orb: "It scores every part of the roof for solar panels, from the sun's path and the house's own shade." },
      { orb: "The yellower, the better.", mood: "proud" },
      { blob: "Before you spend a penny on panels.", mood: "wink", react: "smile" },
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
      { blob: "Been out all day? The Security add-on plays back what happened, right on the house.", replay: "08:28" },
      { orb: "Half past eight: the house is empty, and the alarm sets itself.", replay: "08:40" },
      { orb: "Around ten: a parcel at the front door.", replay: "10:20" },
      { blob: "One o'clock: the dog walker lets themselves in, and takes the dog out.", replay: "13:20" },
      { orb: "And at twenty to six, Alex is home. The heating came on in time.", replay: "17:50" },
      { blob: "Camera clips play right beside it. And your phone tells you what happened while you were out.", mood: "happy" },
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
      { blob: "The Household add-on keeps an eye on the everyday stuff.", mood: "happy" },
      { orb: "The dishwasher's done. It says so on every screen, and on your phone." },
      {
        blob: "It tags the bin to put out the night before. And it watches for damp and mould, room by room.",
        do: (s) => {
          s.floor(1);
          tintRoom(s, "bathroom", [0.3, 0.6, 1, 0.45], "Damp risk");
        },
      },
      { orb: "Telling you to open a window, basically.", mood: "dry", react: "wink" },
      { blob: "Nicely, though.", mood: "wink" },
    ],
  },
  {
    title: "On the wall",
    kicker: "Wall tablets, and every device's health",
    addOn: "Wall Tablet and Network add-ons",
    chips: [{ icon: mdiBattery10, label: "Hall sensor", value: "Battery 8%" }],
    start: (s) => s.house(true),
    end: (s) => tintRoom(s, "hallway", null, null),
    lines: [
      { orb: "Put it on a tablet on the wall. It wakes as you walk up, and shows the doorbell camera when someone rings." },
      { blob: "Visitors always ask about that bit!", mood: "excited" },
      {
        orb: "And the Network add-on lights up any device that's offline, or running out of battery.",
        do: (s) => {
          s.floor(0);
          tintRoom(s, "hallway", [1, 0.3, 0.3, 0.45], "Battery 8%");
        },
      },
      { blob: "So you know which batteries to buy.", mood: "happy" },
    ],
  },
  {
    title: "Your turn",
    kicker: "Get VirtuHome",
    start: (s) => s.house(true),
    lines: [
      { orb: "VirtuHome is free, in the Home Assistant Community Store.", mood: "proud" },
      { blob: "And every add-on has a free fourteen-day trial. Try them on your own house!", mood: "excited", when: (s) => s.trials },
      { blob: "And the add-ons are coming very soon. Keep an eye out!", mood: "excited", when: (s) => !s.trials },
      { orb: "Thanks for watching.", mood: "smile" },
      { blob: "Bye!", mood: "excited" },
    ],
  },
];
