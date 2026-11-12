// What the online demo says, in one language: its page, the tour's host and her panels. VirtuHome's own
// texts (the 3D view's buttons and sheets) are the app's translations (src/i18n), not these.
//
// Texts may have placeholders, {name}, filled in when shown. A tour line may have cues, [[name]], just
// before the word that something happens on (the weather changing as she says "rain"): keep each one
// before the word that means the same in the translation. Texts marked "HTML" may have <b>…</b>.

/** The tour's lines, by what each one is for. */
export type LineId =
  | "imagine" | "pip"
  | "everything" | "faces" | "scene" | "friends" | "weather"
  | "bricks" | "paint" | "scan" | "plans"
  | "security" | "halfEight" | "parcel" | "walker" | "alexHome" | "summary"
  | "energy" | "kettle" | "cheap" | "roof" | "sun" | "whatIf"
  | "household" | "bins" | "window"
  | "tablet" | "wakes" | "doorbell"
  | "free" | "trials" | "soon" | "thanks";

/** The tour's chapters, in order. */
export type ChapterId = "intro" | "live" | "yours" | "security" | "energy" | "household" | "wall" | "end";

export interface DemoStrings {
  /** The language's own name, for the language menu ("Deutsch"). */
  name: string;
  /** BCP 47, for dates, numbers and <html lang> ("de-DE"). */
  locale: string;
  /** Money as the tour shows it here, from the demo house's British prices. */
  money: { currency: string; perPound: number };
  /** How the voice should say words it says wrongly: [as written, as it should be said]. */
  sayAs: [string, string][];

  page: {
    title: string;
    description: string;
    /** In the bar under the demo. */
    demo: string;
    takeTour: string;
    getIt: string;
    language: string;
    failed: string;
    /** What to try, shown over the house until it is touched. */
    hint: string;
  };

  /** The demo house's rooms, floors and garden, by their English names. */
  house: Record<string, string>;

  ui: {
    /** HTML. */
    introTitle: string;
    introText: string;
    start: string;
    noThanks: string;
    soundOff: string;
    soundOn: string;
    pause: string;
    play: string;
    next: string;
    close: string;
    /** HTML. */
    outroTitle: string;
    outroFree: string;
    outroTrials: string;
    outroSoon: string;
    /** The add-ons on the end card: [name, what it does]. */
    outroSecurity: [string, string];
    outroEnergy: [string, string];
    outroHousehold: [string, string];
    outroWall: [string, string];
    getFree: string;
    tryAddOns: string;
    aboutAddOns: string;
    again: string;
    explore: string;
    /** The replay's clock. */
    yesterdayAt: string;
    /** When the voice isn't in this language: the subtitles are. */
    subtitled: string;
  };

  chapters: Record<ChapterId, { title: string; kicker: string; tagline?: string; addOn?: string }>;

  chips: {
    lightsOn: string;
    houseNow: string;
    todaySoFar: string;
    cheapest: string;
    bestSlope: string;
    /** {pct} */
    bestSlopeValue: string;
    dishwasher: string;
    done: string;
    bins: string;
    binsValue: string;
    bathroom: string;
    bathroomValue: string;
  };

  /** What Pip says. {saving}: the what-if's saving a year, in money. */
  lines: Record<LineId, string>;

  props: {
    frontDoor: string;
    yesterday: string;
    live: string;
    person: string;
    parcel: string;
    /** {time} */
    clipCaption: string;
    alertTitle: string;
    alertBody: string;
    now: string;
    scanMove: string;
    scanKeep: string;
    scanDone: string;
    scanning: string;
    walls: string;
    roomDone: string;
    roomSize: string;
    sofa: string;
    table: string;
    /** Over a room in the Energy preview: {power} and {cost} an hour. */
    roomPower: string;
    damp: string;
    dishwasherDone: string;
  };

  panels: {
    allLightsOn: string;
    bright: string;
    movieNight: string;
    editHome: string;
    undo: string;
    redo: string;
    save: string;
    view3d: string;
    plan2d: string;
    tabHome: string;
    tabRooms: string;
    tabDevices: string;
    tabSelected: string;
    tabExtras: string;
    outsideWalls: string;
    walls: string;
    floor: string;
    plainWhite: string;
    /** The finishes on the editor's tiles, by group and kind ("out.brick_buff"). */
    finishes: Record<string, string>;
    energy: string;
    solarOnRoof: string;
    shownOnRoof: string;
    /** {pct} {kwh} */
    best: string;
    south: string;
    west: string;
    north: string;
    /** {slope} {deg} */
    slope: string;
    firstFloorRoof: string;
    /** {n} */
    groundFloorRoof: string;
    /** {pct} */
    lostToShade: string;
    /** {kwh} {kwp} */
    yourPanels: string;
    /** {n} {kwp} */
    panels: string;
    /** {kwh} */
    kwhAYear: string;
    whatIf: string;
    tryIt: string;
    close: string;
    panelsOn: string;
    howMany: string;
    of: string;
    /** {n} */
    roomFor: string;
    addBattery: string;
    costOfWork: string;
    forPayback: string;
    aYear: string;
    now: string;
    withThem: string;
    solarKwh: string;
    usedAtHome: string;
    soldKwh: string;
    boughtKwh: string;
    bill: string;
    saving: string;
    /** {money} */
    savingValue: string;
    paysBackIn: string;
    /** {n} */
    years: string;
    toast: string;
    weather: string;
    whoIsHome: string;
    nextEvent: string;
  };
}
