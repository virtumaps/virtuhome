// The online demo's tour: what the host says, and what the demo house and the 3D view do meanwhile.
// tour.ts plays it. The add-ons' parts are previews drawn on the demo house with the same hooks the
// add-ons use (room colours and texts, the roof's paint, marks on furniture, replays) and with props
// beside it (props.ts: a camera clip, a phone, a wall tablet), from pretend numbers: the demo loads no
// add-on. It leads with what impresses, and spends most of its time on the add-ons.
//
// A line: { say: "…" }, with
//   mood           the host's face (cast.ts)
//   do / after     what happens as the line starts / ends
//   pause          a wait before it is said (ms), with `do` already done: time to watch
//   gap            the pause after it (ms, default 250): time to see a change before the next line
//   replay         where the replay's clock goes during the line ("10:15")
//   when           left out when it returns false
import {
  mdiCashMultiple, mdiClockOutline, mdiDishwasher, mdiHomeLightningBolt, mdiLightbulbGroup, mdiSolarPower, mdiTrashCan,
  mdiWaterPercent,
} from "@mdi/js";
import type { ViewHandle } from "../../src/ext/api";
import type { Hass } from "../../src/live/hass";
import type { RGBA } from "../../src/live/live";
import type { Plan } from "../../src/model/plan";
import type { Mood } from "./cast";
import type { ClipKind } from "./props";

/** The host's name (a placeholder). */
export const HOST = "Pip";

/** Words the voices say wrongly, and how to write them so they say them right (the subtitles keep the first). */
export const SAY_AS: [RegExp, string][] = [[/VirtuHome/g, "Virtue Home"]];

/** What shows beside the house. */
export type Prop =
  | { kind: "clip"; clip: ClipKind; time: string; caption: string }
  | { kind: "alert"; time: string; title: string; body: string }
  | { kind: "scan" }
  | { kind: "tablet"; time: string }
  | { kind: "whatif" };

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
  /** The sky at night (the lights glow), by day, or as it is now (a replay shows the sky of its moment then). */
  sky(when: "night" | "day" | "now"): void;
  /** The weather ("snowy", "rainy", "partlycloudy"). */
  weather(state: string): void;
  /** Runs `fn` after `ms`, unless the tour stops first. */
  later(ms: number, fn: () => void): void;
  /** Shows the plan as `fn` changes it (finishes, colours), in 3D only and never saved; null shows it as it is. */
  restyle(fn: ((plan: Plan) => void) | null): void;
  /** The floors apart, one above the other, or back together. */
  explode(on: boolean): void;
  /** Starts the camera `from` times as far out, and moves it in to where it is over `ms`. */
  push(from: number, ms: number): void;
  /** Exactly these beside the house (an empty list: none). */
  props(list: Prop[]): void;
  /** Switches like `call` would, without the pulse a fresh change gets (for many things at once). */
  quiet(id: string, state: string, attributes?: Record<string, unknown>): void;
}

export interface Chip {
  icon: string;
  label: string;
  value: string | ((hass: Hass) => string);
}

export interface Line {
  say: string;
  mood?: Mood;
  pause?: number;
  do?: (s: Show) => void;
  after?: (s: Show) => void;
  gap?: number;
  replay?: string;
  when?: (s: Show) => boolean;
}

export interface Chapter {
  title: string;
  kicker: string;
  /** A line on screen while the chapter's last line is said, as in an advert. */
  tagline?: string;
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

/** 0..1 on a log scale from 1 W to 2 kW, and its colour: green for a few watts, yellow around 150 W, red from 2 kW (as the Energy add-on has them). */
const powerLevel = (kw: number) => Math.max(0, Math.min(1, Math.log10(Math.max(1, kw * 1000)) / Math.log10(2000)));
function powerColour(kw: number): [number, number, number] {
  const stops: [number, number, number][] = [[0.3, 0.85, 0.35], [0.75, 0.88, 0.25], [1, 0.8, 0.15], [1, 0.5, 0.12], [1, 0.25, 0.12]];
  const f = powerLevel(kw) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(f));
  const k = f - i;
  return [0, 1, 2].map((c) => stops[i][c] + (stops[i + 1][c] - stops[i][c]) * k) as [number, number, number];
}

/** The Energy add-on's power map on the demo house: every room coloured by what it uses, with what it costs an hour. */
function energyRooms(s: Show, on: boolean): void {
  const kwOf = (area: string | null, outdoor: boolean) => (area && !outdoor ? ROOM_KW[area] : undefined);
  s.view.setRoomTint(on ? (_f, sp) => {
    const kw = kwOf(sp.area_id, sp.outdoor);
    return kw === undefined ? null : [...powerColour(kw), 0.14 + 0.3 * powerLevel(kw)] as RGBA;
  } : null);
  s.view.setRoomText(on ? (_f, sp) => {
    const kw = kwOf(sp.area_id, sp.outdoor);
    if (kw === undefined) return null;
    const watts = kw < 1 ? `${Math.round(kw * 1000)} W` : `${kw.toFixed(1)} kW`;
    // at 24.5p a unit
    return `${watts} · ${(kw * 24.5).toFixed(kw < 0.2 ? 1 : 0)}p/h`;
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

/** Every light off, then on again one after another, warm, as night falls. */
function cascade(s: Show): void {
  const lights = Object.keys(s.hass.states).filter((id) => id.startsWith("light.")).sort();
  for (const id of lights) s.quiet(id, "off");
  const warmWhite = { color_temp_kelvin: 2700, brightness: 210, rgb_color: undefined };
  lights.forEach((id, i) => s.later(700 + i * 170, () => s.quiet(id, "on", warmWhite)));
}

/** The demo house made over: rendered white outside, then the living room's walls and floor. */
const makeover = (step: number) => (plan: Plan) => {
  plan.settings.exterior_finish = "render";
  const room = plan.floors[0]?.rooms.find((r) => r.area_id === "living_room");
  if (!room || step < 1) return;
  room.wall_finish = step >= 2 ? "wallpaper_leaves" : "paint";
  room.wall_color = "#7f9c8b";
  room.floor = "herringbone";
};

const CLIP: Prop = { kind: "clip", clip: "parcel", time: "10:12", caption: "Doorbell clip · yesterday, 10:12" };

// ------------------------------------------------------------------ the tour

export const CHAPTERS: Chapter[] = [
  {
    title: "VirtuHome",
    kicker: "Your home, alive in 3D",
    start: (s) => {
      s.sky("night");
      s.house(true);
      s.push(1.45, 7000);
      cascade(s);
    },
    lines: [
      { say: "Imagine this is your home. Alive, in 3D, right inside Home Assistant.", mood: "excited", pause: 2800 },
      { say: "I'm Pip! Give me two minutes, and I'll show you what it can do.", mood: "happy" },
    ],
  },
  {
    title: "Live, in 3D",
    kicker: "Free, for every home",
    chips: [{ icon: mdiLightbulbGroup, label: "Lights on", value: lightsOn }],
    start: (s) => s.house(false),
    lines: [
      { say: "Every light, door and window sits where it really is, and changes the moment it does." },
      { say: "Watch the living room.", do: (s) => s.fly("light.living_room_downlights"), after: colour([40, 90, 255]), gap: 1500 },
      { say: "Ooh, look! It's gone blue.", mood: "surprised", after: colour([255, 40, 170]), gap: 1300 },
      { say: "Pink! Now we're talking.", mood: "excited", after: warm },
      { say: "Real sky, real weather. Even snow!", mood: "excited", do: (s) => {
        s.house(true);
        s.weather("snowy");
      }, gap: 2200 },
    ],
  },
  {
    title: "Make it yours",
    kicker: "Finishes, furniture, and your own floor plan",
    start: (s) => {
      s.weather("partlycloudy");
      s.sky("day");
      s.house(true);
    },
    end: (s) => {
      s.props([]);
      s.explode(false);
      s.restyle(null);
    },
    lines: [
      { say: "Make it look like home. Change the bricks...", do: (s) => s.restyle(makeover(0)), gap: 600 },
      {
        say: "paint the walls, pick the floors, and bring in your own furniture.",
        do: (s) => {
          s.fly("light.living_room_downlights");
          s.restyle(makeover(1));
          s.later(2200, () => s.restyle(makeover(2)));
        },
      },
      {
        say: "Got an iPhone with LiDAR? Scan your home room by room, and it's in 3D in minutes.",
        do: (s) => {
          s.restyle(null);
          s.house(false);
          s.explode(true);
          s.props([{ kind: "scan" }]);
        },
      },
      { say: "Or start from a house type, or trace the estate agent's floor plan.", gap: 600 },
    ],
  },
  {
    title: "While you were out",
    kicker: "Your day, played back on the house",
    addOn: "Security add-on",
    tagline: "Know what happened, not just that something did.",
    start: (s) => {
      s.sky("now");
      s.house(false);
      s.replay("07:40");
    },
    end: (s) => {
      s.props([]);
      s.endReplay();
    },
    lines: [
      { say: "Now, the add-ons. Out all day? Security plays back what happened, right on the house.", replay: "08:28" },
      { say: "Half past eight. Everyone's gone, and the alarm sets itself.", replay: "08:40" },
      { say: "Ten past ten: a parcel. And here's the doorbell clip, playing right beside it.", do: (s) => s.props([CLIP]), replay: "10:13", gap: 700 },
      { say: "One o'clock: the dog walker lets themselves in, and takes the dog out.", do: (s) => s.props([]), replay: "13:20" },
      { say: "Twenty to six: Alex is home, and the heating's already on.", replay: "17:50" },
      {
        say: "And Alex's phone has the whole day, summed up.",
        do: (s) => s.props([{ kind: "alert", time: "17:41", title: "While you were out", body: "A parcel at 10:12, and the dog walker at 1 o'clock. Tap to play it back." }]),
        gap: 900,
      },
    ],
  },
  {
    title: "Energy",
    kicker: "What every room uses, and what it costs",
    addOn: "Energy add-on",
    tagline: "See where the money goes. Keep more of it.",
    chips: [
      { icon: mdiHomeLightningBolt, label: "House now", value: "2.8 kW" },
      { icon: mdiCashMultiple, label: "Today so far", value: "£1.84" },
      { icon: mdiClockOutline, label: "Cheapest power", value: "00:30 – 05:30" },
      { icon: mdiSolarPower, label: "Best slope for panels", value: "97% of the best" },
    ],
    start: (s) => {
      s.sky("day");
      s.floor(0);
      energyRooms(s, true);
    },
    end: (s) => {
      s.props([]);
      energyRooms(s, false);
      solarRoof(s, false);
    },
    lines: [
      { say: "The Energy add-on shows what every room is using, right now." },
      { say: "The kitchen's the hungry one. Kettle's on!", mood: "happy", do: (s) => s.fly("media_player.kitchen_speaker") },
      { say: "It knows when power is cheap, and the best time to charge the car.", do: (s) => s.floor(0) },
      {
        say: "Now, look up at the roof!", mood: "excited", gap: 900,
        after: (s) => {
          energyRooms(s, false);
          s.house(true);
          solarRoof(s, true);
        },
      },
      { say: "It scores every part of your roof for solar panels, from the sun's path and the house's own shade." },
      { say: "Then it asks: what if? Four more panels would pay for themselves in seven years.", do: (s) => s.props([{ kind: "whatif" }]), gap: 900 },
    ],
  },
  {
    title: "The everyday stuff",
    kicker: "Appliances, bins, damp and mould",
    addOn: "Household add-on",
    tagline: "The chores that remember themselves.",
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
      { say: "Household keeps an eye on the everyday stuff. The dishwasher's done, and it says so on every screen.", mood: "happy" },
      {
        say: "It tags the bin to put out the night before, and spots damp and mould, room by room.",
        do: (s) => {
          s.floor(1);
          tintRoom(s, "bathroom", [0.3, 0.6, 1, 0.45], "Damp risk");
        },
      },
      { say: "It'll even tell you when to open a window. Nicely!", mood: "wink" },
    ],
  },
  {
    title: "On the wall",
    kicker: "A screen by the front door",
    addOn: "Wall Tablet add-on",
    tagline: "Your whole home, by the front door.",
    start: (s) => s.house(true),
    end: (s) => s.props([]),
    lines: [
      { say: "And the Wall Tablet add-on puts it all on a screen by the door." },
      { say: "When someone rings, the doorbell camera takes over. Visitors love that bit!", mood: "excited", do: (s) => s.props([{ kind: "tablet", time: "17:42" }]), gap: 1200 },
    ],
  },
  {
    title: "Your turn",
    kicker: "Get VirtuHome",
    // the closing shot: the house at night, every light on, behind the end card
    start: (s) => {
      s.sky("night");
      s.house(true);
      const lights = Object.keys(s.hass.states).filter((id) => id.startsWith("light."));
      lights.forEach((id, i) => s.later(i * 90, () => s.quiet(id, "on", { color_temp_kelvin: 2700, brightness: 220, rgb_color: undefined })));
    },
    lines: [
      { say: "VirtuHome is free, in the Home Assistant Community Store.", mood: "happy" },
      { say: "And every add-on has a free fourteen-day trial. Go on, try them on your own home!", mood: "excited", when: (s) => s.trials },
      { say: "And the add-ons are coming very soon. Don't miss them!", mood: "excited", when: (s) => !s.trials },
      { say: "Thanks so much for watching. See you soon!", mood: "excited" },
    ],
  },
];
