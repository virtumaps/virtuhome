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
import type { WeatherPick } from "../../src/live/sky";
import type { Mood } from "./cast";
import type { ClipKind } from "./props";

/** The host's name (a placeholder). */
export const HOST = "Pip";

/** Words the voices say wrongly, and how to write them so they say them right (the subtitles keep the first). */
export const SAY_AS: [RegExp, string][] = [[/VirtuHome/g, "Virtue Home"], [/LiDAR/g, "lidar"]];

/** What shows beside the house: drawn props (props.ts), and panels as they look in the app (panels.ts). */
export type Prop =
  | { kind: "clip"; clip: ClipKind; time: string; caption: string }
  | { kind: "alert"; time: string; title: string; body: string }
  | { kind: "scan" }
  | { kind: "scenes" }
  | { kind: "editor"; tab: "home" | "room" }
  | { kind: "energy" }
  | { kind: "tablet" };

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
  /**
   * The sky at night (the lights glow), by day, or as it is now (a replay shows the sky of its moment
   * then), with the weather picked as the sun and weather panel picks it (null: the house's own).
   */
  sky(when: "night" | "day" | "now", weather?: WeatherPick | null): void;
  /** Turns the camera round the house by `deg` (positive: anticlockwise, seen from above) over `ms`. */
  turn(deg: number, ms: number): void;
  /** Runs `fn` after `ms`, unless the tour stops first. */
  later(ms: number, fn: () => void): void;
  /** Shows the plan as `fn` changes it (finishes, colours), in 3D only and never saved; null shows it as it is. */
  restyle(fn: ((plan: Plan) => void) | null): void;
  /** The floors apart, one above the other, or back together. */
  explode(on: boolean): void;
  /** Starts the camera `from` times as far out, and moves it in to where it is over `ms`. */
  push(from: number, ms: number): void;
  /** Moves the camera `by` times as far out (or in) as it is, over `ms`. */
  zoom(by: number, ms: number): void;
  /** Exactly these beside the house (an empty list: none). */
  props(list: Prop[]): void;
  /** Taps what `key` names in the panel showing; `then` runs as it is pressed. */
  tap(key: string, then?: (s: Show) => void): void;
  /** The Energy sheet's What if: Try it, then three more panels. */
  whatIf(): void;
  /** The doorbell rings on the wall tablet. */
  ring(): void;
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
  /** What happens as the voice reaches a word of the line (the first word that has this in it). */
  cues?: [string, (s: Show) => void][];
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

const LIVING = ["light.living_room_downlights", "light.living_room_floor_lamp", "light.fireplace_strip", "light.living_room_ceiling"];

/** Movie night, as the demo's scene sets it, with the strip by the fireplace a deep violet and the lamp turned down. */
const movieNight = (s: Show) => {
  s.call("scene", "turn_on", "scene.movie_night");
  s.call("light", "turn_on", "light.fireplace_strip", { rgb_color: [120, 60, 255], brightness: 210 });
  s.call("light", "turn_on", "light.living_room_floor_lamp", { color_temp_kelvin: 2200, brightness: 70 });
};
/** Friends round: every light in the room on, warm and bright. */
const bright = (s: Show) => {
  s.call("scene", "turn_on", "scene.living_room_bright");
  s.call("light", "turn_on", LIVING, { color_temp_kelvin: 2700, brightness: 235 });
};

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

/**
 * The roof's sun as the Energy add-on scores it for the demo house (% of the best the sun allows there):
 * the main roof's south, west and north slopes, and the two lean-tos of the side extension.
 */
function slopeScore(face: { floor: number; roof: string; tilt: number; azimuth: number }): number {
  if (face.floor === 0) return face.roof === "roof1" ? 39 : 60;
  const az = ((face.azimuth % 360) + 360) % 360;
  return az > 135 && az < 225 ? 98 : az >= 225 && az < 315 ? 83 : az >= 45 && az <= 135 ? 83 : 55;
}

/** The roof painted with its score for panels, as the Energy add-on paints it. */
function solarRoof(s: Show, on: boolean): void {
  if (!on) {
    s.view.paintRoofs(null);
    s.view.showRoofs(null);
    return;
  }
  s.view.showRoofs(true);
  // 40 % and under is the ramp's bottom, 100 % its top
  s.view.paintRoofs((face) => ramp((slopeScore(face) - 40) / 60), 0.3);
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

/** The demo house made over: buff bricks outside, then the living room's walls painted, papered, and its floor. */
const SAGE = "#b3bfa3";
const makeover = (step: number) => (plan: Plan) => {
  plan.settings.exterior_finish = "brick_buff";
  const room = plan.floors[0]?.rooms.find((r) => r.area_id === "living_room");
  if (!room || step < 1) return;
  room.wall_finish = step >= 2 ? "wallpaper_leaves" : "paint";
  room.wall_color = SAGE;
  if (step >= 3) room.floor = "herringbone";
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
      { say: "I'm Pip! Give me a couple of minutes, and I'll show you what it can do.", mood: "happy" },
    ],
  },
  {
    title: "Live, in 3D",
    kicker: "Free, for every home",
    chips: [{ icon: mdiLightbulbGroup, label: "Lights on", value: lightsOn }],
    start: (s) => s.house(false),
    end: (s) => s.props([]),
    lines: [
      { say: "Every light, door and window sits where it really is, and changes the moment it does." },
      {
        say: "And the little faces show who's home, room by room. That's Sam, in the kitchen!", mood: "happy",
        do: (s) => {
          s.quiet("person.alex", "home");
          s.quiet("person.sam", "home");
          s.quiet("sensor.sams_watch", "kitchen", { distance: 1.4 });
        },
      },
      {
        say: "Set the scene. Movie night: the lights go down, and the telly comes on.", pause: 900, gap: 1100,
        do: (s) => {
          s.fly("light.living_room_downlights");
          s.props([{ kind: "scenes" }]);
        },
        cues: [["Movie", (s) => s.tap("movie", movieNight)]],
      },
      { say: "Friends coming round? One tap, and it's bright and warm.", mood: "happy", gap: 1000, cues: [["One", (s) => s.tap("bright", bright)]] },
      {
        say: "Real sky, real weather: sunshine, rain, thunder, fog... and even snow!", mood: "excited", gap: 1800,
        do: (s) => {
          s.props([]);
          s.house(true);
          s.sky("day", "clear");
          s.later(800, () => s.turn(150, 6500));
        },
        cues: [
          ["rain", (s) => s.sky("day", "rain")],
          ["thunder", (s) => s.sky("day", "storm")],
          ["fog", (s) => s.sky("day", "fog")],
          ["snow", (s) => s.sky("day", "snow")],
        ],
      },
    ],
  },
  {
    title: "Make it yours",
    kicker: "Finishes, furniture, and your own floor plan",
    start: (s) => {
      s.sky("day", "clear");
      s.house(true);
    },
    end: (s) => {
      s.props([]);
      s.explode(false);
      s.restyle(null);
    },
    lines: [
      {
        say: "Make it look like home. Change the bricks...", gap: 900,
        do: (s) => s.props([{ kind: "editor", tab: "home" }]),
        cues: [["bricks", (s) => s.tap("out:brick_buff", (s) => s.restyle(makeover(0)))]],
      },
      {
        say: "paint the walls, or paper them, and pick the flooring.", gap: 2200,
        do: (s) => {
          s.fly("light.living_room_downlights");
          s.props([{ kind: "editor", tab: "room" }]);
        },
        cues: [
          ["paint", (s) => s.tap(`paint:${SAGE}`, (s) => s.restyle(makeover(1)))],
          ["paper", (s) => s.tap("walls:wallpaper_leaves", (s) => s.restyle(makeover(2)))],
          ["flooring", (s) => s.tap("floor:herringbone", (s) => s.restyle(makeover(3)))],
        ],
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
      { icon: mdiSolarPower, label: "Best slope for panels", value: "98% of the best" },
    ],
    start: (s) => {
      s.sky("day", "clear");
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
      { say: "It knows when power's cheapest, and what today has cost so far.", do: (s) => s.floor(0) },
      {
        say: "Now, look up at the roof!", mood: "excited", gap: 1100,
        after: (s) => {
          energyRooms(s, false);
          s.house(true);
          solarRoof(s, true);
          s.view.toast("Sun on the roof: the yellower, the better for panels");
        },
      },
      { say: "It follows the sun over your roof all year, and scores every slope for panels.", do: (s) => s.props([{ kind: "energy" }]) },
      {
        say: "Want more? Try it first: three more panels would save about two hundred and twenty pounds a year, and pay back in under seven years.",
        do: (s) => s.whatIf(), gap: 1200,
      },
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
    start: (s) => {
      s.house(true);
      s.props([{ kind: "tablet" }]);
    },
    end: (s) => s.props([]),
    lines: [
      { say: "Got a spare tablet? Put it up by the front door, and the Wall Tablet add-on makes it your home's own screen." },
      { say: "It wakes as you walk past, with the time, the weather, and who's home." },
      { say: "Add a video doorbell, and its camera takes over the moment someone's there.", mood: "excited", gap: 1600, cues: [["camera", (s) => s.ring()]] },
    ],
  },
  {
    title: "Your turn",
    kicker: "Get VirtuHome",
    // the closing shot: round the back at night, every light on, the garden's too, behind the end card
    start: (s) => {
      s.sky("night");
      s.house(true);
      const lights = Object.keys(s.hass.states).filter((id) => id.startsWith("light.") || /^switch\.(deck|garden|patio)/.test(id));
      lights.forEach((id, i) => s.later(i * 90, () => s.quiet(id, "on", id.startsWith("light.") ? { color_temp_kelvin: 2700, brightness: 220, rgb_color: undefined } : {})));
      s.later(900, () => {
        s.turn(155, 7000);
        s.zoom(1.2, 7000);
      });
    },
    lines: [
      { say: "VirtuHome is free, in the Home Assistant Community Store.", mood: "happy" },
      { say: "And every add-on has a free fourteen-day trial. Go on, try them on your own home!", mood: "excited", when: (s) => s.trials },
      { say: "And the add-ons are coming very soon. Don't miss them!", mood: "excited", when: (s) => !s.trials },
      { say: "Thanks so much for watching. See you soon!", mood: "excited" },
    ],
  },
];
