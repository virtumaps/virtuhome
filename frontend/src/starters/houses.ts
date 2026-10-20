// House types to start a plan from: whole homes with their storeys, rooms named like Home Assistant's
// usual areas, doors, windows, stairs and a roof. Loaded only when the picker opens.
//
// Plans run along the middle of the walls, so with 28 cm outside walls a house's outside face is at
// 0 and its walls' middle at 0.14. The front is at the bottom of the plan, the garden at the top.
import { DEFAULT_SETTINGS, newId, normalizePlan, type ExteriorFinish, type FenceStyle, type Floor, type FloorMaterial, type Opening, type OutdoorKind, type OutdoorArea, type Plan, type Roof, type Vec2 } from "../model/plan";
import { suggestRoofs, type RoofChoice } from "../auto/roof";
import { fitPlan, fitRange, type Fit } from "../model/fit";

export interface Starter {
  id: string;
  name: string;
  text: string;
  /** Semis join next door on one side, which mirroring swaps. */
  joins: "none" | "side" | "both";
  plan(): Plan;
}

const rect = (x0: number, z0: number, x1: number, z1: number): Vec2[] => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

/** A storey being drawn: rooms by name, and doors and windows given by their middle on a room's wall. */
class Storey {
  readonly floor: Floor;

  constructor(name: string, elevation: number, height: number) {
    this.floor = { id: newId("floor"), name, ha_floor: null, elevation, height, rooms: [], openings: [], furniture: [], devices: [], walls: [], outdoor: [], fences: [], roofs: [] };
  }

  room(name: string, points: Vec2[], floor: FloorMaterial = "oak"): this {
    this.floor.rooms.push({ id: newId("room"), name, area_id: null, points, floor });
    return this;
  }

  /** A door, window or passage in a wall of room `name`, its middle at (x, z) on the middle of the wall. */
  private put(name: string, x: number, z: number, o: Partial<Opening> & Pick<Opening, "kind" | "width" | "height">): this {
    const r = this.floor.rooms.find((q) => q.name === name);
    const k = r?.points.findIndex((a, i) => {
      const b = r.points[(i + 1) % r.points.length];
      return Math.abs((b[0] - a[0]) * (z - a[1]) - (b[1] - a[1]) * (x - a[0])) < 1e-6
        && x >= Math.min(a[0], b[0]) - 1e-6 && x <= Math.max(a[0], b[0]) + 1e-6 && z >= Math.min(a[1], b[1]) - 1e-6 && z <= Math.max(a[1], b[1]) + 1e-6;
    }) ?? -1;
    if (!r || k < 0) throw new Error(`no wall of ${name} at ${x}, ${z}`);
    const a = r.points[k];
    this.floor.openings.push({ id: newId("o"), room_id: r.id, edge: k, offset: Math.hypot(x - a[0], z - a[1]), sill: 0, hinge: "left", swing: "in", ...o });
    return this;
  }

  /** An inside door, opening into room `name`. */
  door(name: string, x: number, z: number, o: Partial<Opening> = {}): this {
    return this.put(name, x, z, { kind: "door", width: 0.76, height: 1.98, ...o });
  }

  /** A door to outside. */
  front(name: string, x: number, z: number, o: Partial<Opening> = {}): this {
    return this.put(name, x, z, { kind: "door", width: 0.9, height: 2.05, style: "panel", ...o });
  }

  window(name: string, x: number, z: number, width = 1.2, o: Partial<Opening> = {}): this {
    return this.put(name, x, z, { kind: "window", width, height: 1.2, sill: 0.9, ...o });
  }

  /** A small high window (bathrooms, WCs). */
  small(name: string, x: number, z: number): this {
    return this.window(name, x, z, 0.6, { height: 0.9, sill: 1.2 });
  }

  /** A window over the kitchen worktop. */
  sink(name: string, x: number, z: number, width = 1.2): this {
    return this.window(name, x, z, width, { height: 1.0, sill: 1.05 });
  }

  passage(name: string, x: number, z: number, width: number): this {
    return this.put(name, x, z, { kind: "passage", width, height: 2.05 });
  }

  /** Straight stairs rising towards the back (-z), as tall as the storey, the balustrade on its open side. */
  stairs(x: number, z: number, w: number, side: "left" | "right"): this {
    const h = this.floor.height;
    this.floor.furniture.push({ id: newId("f"), type: "stairs", x, z, rotation: 0, w, d: 3, h, balustrade: "spindles", balustrade_side: side });
    return this;
  }

  area(name: string, kind: OutdoorKind, points: Vec2[], o: Partial<OutdoorArea> = {}): this {
    this.floor.outdoor!.push({ id: newId("out"), name, kind, area_id: null, points, ...o });
    return this;
  }

  fence(points: Vec2[], style: FenceStyle, height: number, gates: { at: number; width: number }[] = []): this {
    this.floor.fences!.push({ id: newId("fence"), points, style, height, gates });
    return this;
  }
}

/** A plan of storeys; its roofs worked out from the walls, or given. */
function house(storeys: Storey[], finish: ExteriorFinish, roof: RoofChoice | ((p: Plan) => Roof[]) | null): Plan {
  const plan: Plan = { version: 1, settings: { ...DEFAULT_SETTINGS, exterior_finish: finish }, floors: storeys.map((s) => s.floor) };
  if (typeof roof === "function") plan.floors[plan.floors.length - 1].roofs = roof(plan);
  else if (roof) for (const { floor, roof: r } of suggestRoofs(plan, roof).roofs) plan.floors[floor].roofs!.push(r);
  return normalizePlan(plan);
}

// ------------------------------------------------------------------ two-bed mid-terrace
// Victorian: front room and back room, the stairs up from a hall by the party wall, the kitchen and
// bathroom in a single-storey extension at the back.
function terrace(): Plan {
  const g = new Storey("Ground Floor", 0, 2.6)
    .room("Bathroom", rect(0.14, 0.14, 2.54, 2.14), "tiles")
    .room("Kitchen", rect(0.14, 2.14, 2.54, 4.74), "tiles")
    .room("Dining Room", rect(0.14, 4.74, 4.86, 8.6))
    .room("Living Room", rect(0.14, 8.6, 3.7, 12.86))
    .room("Hallway", rect(3.7, 8.6, 4.86, 12.86), "wood")
    .front("Hallway", 4.24, 12.86, { width: 0.84 })
    .door("Living Room", 3.7, 12.05)
    .door("Dining Room", 2.9, 8.6)
    .door("Kitchen", 1.9, 4.74)
    .door("Bathroom", 1.0, 2.14, { width: 0.7 })
    .front("Kitchen", 2.54, 3.95, { width: 0.84, style: "glazed" })
    .window("Living Room", 1.92, 12.86, 1.6, { style: "sash", height: 1.5, sill: 0.7 })
    .window("Dining Room", 3.7, 4.74, 1.2, { style: "sash" })
    .sink("Kitchen", 2.54, 2.95, 0.9)
    .small("Bathroom", 2.54, 1.14)
    .stairs(4.29, 10.17, 0.85, "left")
    .area("Garden", "lawn", rect(0, -9, 5, 0))
    .area("Patio", "patio", rect(2.68, 0, 5, 4.6))
    .fence([[0, 0], [0, -9], [5, -9], [5, 4.6]], "closeboard", 1.8, [{ at: 11.5, width: 0.9 }]);
  const f = new Storey("First Floor", 2.6, 2.5)
    .room("Bedroom 1", [[0.14, 7.6], [3.7, 7.6], [3.7, 11.9], [4.86, 11.9], [4.86, 12.86], [0.14, 12.86]], "carpet")
    .room("Bedroom 2", rect(0.14, 4.74, 4.86, 7.6), "carpet")
    .room("Landing", rect(3.7, 7.6, 4.86, 11.9), "carpet")
    .door("Bedroom 2", 4.28, 7.6)
    .door("Bedroom 1", 3.7, 8.1)
    .window("Bedroom 1", 1.92, 12.86, 1.4, { style: "sash" })
    .window("Bedroom 1", 4.28, 12.86, 0.6, { style: "sash" })
    .window("Bedroom 2", 3.6, 4.74, 1.2, { style: "sash" });
  return house([g, f], "brick", { kind: "terrace", covering: "slate" });
}

// ------------------------------------------------------------------ three-bed semi-detached
// 1930s: the hall and stairs on the outer side, living room at the front by the party wall (on the
// right), kitchen and dining room behind; upstairs two double bedrooms, a box room and the bathroom.
function semi(): Plan {
  const g = new Storey("Ground Floor", 0, 2.6)
    .room("Kitchen", rect(0.14, 0.14, 3.0, 3.9), "tiles")
    .room("Dining Room", rect(3.0, 0.14, 6.46, 3.9))
    .room("Hallway", rect(0.14, 3.9, 2.2, 8.46), "wood")
    .room("Living Room", rect(2.2, 3.9, 6.46, 8.46))
    .front("Hallway", 1.25, 8.46, { hinge: "right" })
    .door("Living Room", 2.2, 7.6)
    .door("Kitchen", 1.66, 3.9)
    .door("Dining Room", 4.0, 3.9)
    .door("Kitchen", 3.0, 2.9)
    .front("Dining Room", 4.73, 0.14, { width: 1.5, style: "french" })
    .front("Kitchen", 0.14, 2.6, { style: "glazed" })
    .sink("Kitchen", 1.6, 0.14)
    .window("Living Room", 4.33, 8.46, 2.0)
    .stairs(0.735, 5.5, 0.9, "right")
    .area("Garden", "lawn", rect(0, -12, 6.6, -3))
    .area("Patio", "patio", rect(0, -3, 6.6, 0))
    .area("Driveway", "driveway", rect(-3, 3, 0, 13))
    .fence([[0, 0], [0, -12], [6.6, -12], [6.6, 0]], "closeboard", 1.8);
  const f = new Storey("First Floor", 2.6, 2.5)
    .room("Bedroom 1", rect(2.2, 3.9, 6.46, 8.46), "carpet")
    .room("Bathroom", rect(0.14, 0.14, 2.2, 2.9), "tiles")
    .room("Bedroom 2", rect(2.2, 0.14, 6.46, 3.9), "carpet")
    .room("Landing", rect(0.14, 2.9, 2.2, 6.2), "carpet")
    .room("Bedroom 3", rect(0.14, 6.2, 2.2, 8.46), "carpet")
    .door("Bathroom", 1.0, 2.9, { width: 0.7 })
    .door("Bedroom 2", 2.2, 3.4)
    .door("Bedroom 1", 2.2, 5.6)
    .door("Bedroom 3", 1.68, 6.2)
    .small("Bathroom", 1.17, 0.14)
    .window("Bedroom 2", 4.33, 0.14, 1.5)
    .window("Bedroom 1", 4.33, 8.46, 1.8)
    .window("Bedroom 3", 1.17, 8.46, 1.0)
    .window("Landing", 0.14, 3.5, 0.8);
  return house([g, f], "pebbledash", { kind: "semi", side: "right", covering: "clay_plain" });
}

// ------------------------------------------------------------------ four-bed detached
// A new build: hall with the stairs in the middle, living room and study at the front, a kitchen
// with room to eat across the back; upstairs four bedrooms, the main one with an en suite.
function detached(): Plan {
  const g = new Storey("Ground Floor", 0, 2.6)
    .room("Kitchen", rect(0.14, 0.14, 6.9, 3.8), "tiles")
    .room("Utility", rect(6.9, 0.14, 8.86, 3.8), "vinyl")
    .room("Living Room", rect(0.14, 3.8, 3.5, 8.46))
    .room("Hallway", rect(3.5, 3.8, 5.5, 8.46), "wood")
    .room("WC", rect(5.5, 3.8, 6.9, 5.4), "tiles")
    .room("Study", [[5.5, 5.4], [6.9, 5.4], [6.9, 3.8], [8.86, 3.8], [8.86, 8.46], [5.5, 8.46]])
    .front("Hallway", 4.5, 8.46)
    .door("Living Room", 3.5, 7.7)
    .door("Kitchen", 4.95, 3.8)
    .door("WC", 5.5, 4.6, { width: 0.7 })
    .door("Study", 5.5, 6.3)
    .door("Utility", 6.9, 2.8)
    .front("Kitchen", 2.2, 0.14, { width: 2.4, height: 2.1, style: "sliding" })
    .sink("Kitchen", 5.2, 0.14)
    .front("Utility", 8.86, 2.0, { style: "glazed" })
    .window("Living Room", 1.82, 8.46, 1.8)
    .window("Living Room", 0.14, 6.1, 1.2)
    .window("Study", 7.18, 8.46, 1.4)
    .stairs(4.015, 5.57, 0.9, "right")
    .area("Garden", "lawn", rect(-1.5, -14, 10.5, -3.5))
    .area("Patio", "patio", rect(0.5, -3.5, 6.5, 0))
    .area("Driveway", "driveway", rect(5.6, 8.6, 9, 15))
    .area("Front Garden", "lawn", rect(-1.5, 8.6, 5.6, 15));
  const f = new Storey("First Floor", 2.6, 2.5)
    .room("Bedroom 1", [[1.9, 4.2], [3.5, 4.2], [3.5, 8.46], [0.14, 8.46], [0.14, 6.0], [1.9, 6.0]], "carpet")
    .room("Bedroom 2", rect(0.14, 0.14, 3.5, 4.2), "carpet")
    .room("Bathroom", rect(3.5, 0.14, 5.5, 3.0), "tiles")
    .room("Bedroom 3", rect(5.5, 0.14, 8.86, 4.4), "carpet")
    .room("Landing", rect(3.5, 3.0, 5.5, 8.46), "carpet")
    .room("En Suite", rect(0.14, 4.2, 1.9, 6.0), "tiles")
    .room("Bedroom 4", rect(5.5, 4.4, 8.86, 8.46), "carpet")
    .door("Bedroom 2", 3.5, 3.55)
    .door("Bathroom", 4.5, 3.0, { width: 0.7 })
    .door("Bedroom 3", 5.5, 3.6)
    .door("Bedroom 4", 5.5, 5.2)
    .door("Bedroom 1", 3.5, 7.7)
    .door("En Suite", 1.9, 5.1, { width: 0.7 })
    .window("Bedroom 2", 1.82, 0.14, 1.5)
    .small("Bathroom", 4.5, 0.14)
    .window("Bedroom 3", 7.18, 0.14, 1.5)
    .window("Bedroom 1", 1.82, 8.46, 1.5)
    .small("En Suite", 0.14, 5.1)
    .window("Bedroom 4", 7.18, 8.46, 1.5)
    .window("Landing", 4.5, 8.46, 0.8);
  return house([g, f], "brick", { kind: "detached" });
}

// ------------------------------------------------------------------ two-bed bungalow
function bungalow(): Plan {
  const g = new Storey("Ground Floor", 0, 2.5)
    .room("Bedroom 1", rect(5.6, 3.8, 10.26, 7.26), "carpet")
    .room("Kitchen", rect(0.14, 0.14, 4.2, 3.8), "tiles")
    .room("Living Room", rect(0.14, 3.8, 4.2, 7.26))
    .room("Bathroom", rect(4.2, 0.14, 6.6, 2.6), "tiles")
    .room("Bedroom 2", rect(6.6, 0.14, 10.26, 3.8), "carpet")
    .room("Hallway", [[4.2, 2.6], [6.6, 2.6], [6.6, 3.8], [5.6, 3.8], [5.6, 7.26], [4.2, 7.26]], "wood")
    .front("Hallway", 4.9, 7.26)
    .door("Living Room", 4.2, 4.8)
    .door("Kitchen", 4.2, 3.2)
    .door("Bathroom", 5.0, 2.6)
    .door("Bedroom 2", 6.6, 3.2)
    .door("Bedroom 1", 5.6, 4.4)
    .window("Living Room", 2.17, 7.26, 2.0)
    .window("Living Room", 0.14, 5.5, 1.2)
    .sink("Kitchen", 1.4, 0.14)
    .front("Kitchen", 3.4, 0.14, { style: "glazed" })
    .small("Bathroom", 5.4, 0.14)
    .window("Bedroom 2", 8.43, 0.14, 1.5)
    .window("Bedroom 1", 7.93, 7.26, 1.8)
    .area("Garden", "lawn", rect(-1, -10, 11.4, 0))
    .area("Path", "path", rect(4.4, 7.4, 5.4, 12))
    .area("Driveway", "driveway", rect(6.4, 7.4, 10.4, 12));
  return house([g], "brick_buff", { kind: "detached" });
}

// ------------------------------------------------------------------ two-bed flat
// One floor of a block, entered from the landing outside at the top of the plan; no roof of its own.
function flat(): Plan {
  const g = new Storey("Ground Floor", 0, 2.5)
    .room("Bedroom 1", [[6.6, 0.14], [8.86, 0.14], [8.86, 4.2], [4.8, 4.2], [4.8, 2.6], [6.6, 2.6]], "carpet")
    .room("Hallway", rect(3.4, 0.14, 4.8, 4.2), "wood")
    .room("Bedroom 2", rect(0.14, 0.14, 3.4, 3.2), "carpet")
    .room("Kitchen", rect(0.14, 3.2, 3.4, 7.46), "tiles")
    .room("Living Room", rect(3.4, 4.2, 8.86, 7.46))
    .room("Bathroom", rect(4.8, 0.14, 6.6, 2.6), "tiles")
    .front("Hallway", 4.1, 0.14, { style: "flush" })
    .door("Bedroom 2", 3.4, 1.7)
    .door("Living Room", 4.1, 4.2)
    .passage("Kitchen", 3.4, 5.9, 1.6)
    .door("Bathroom", 4.8, 1.6)
    .door("Bedroom 1", 4.8, 3.4)
    .window("Kitchen", 1.77, 7.46, 1.4)
    .front("Living Room", 5.4, 7.46, { width: 2.0, height: 2.1, style: "sliding" })
    .window("Living Room", 7.8, 7.46, 1.2)
    .window("Bedroom 2", 0.14, 1.67, 1.2)
    .window("Bedroom 1", 8.86, 2.17, 1.2)
    .area("Balcony", "deck", rect(4.2, 7.6, 8.4, 9), { railing: "glass" });
  return house([g], "render", null);
}

// ------------------------------------------------------------------ open-plan single storey
// A modern single storey: one room for living, cooking and eating across the back, opening onto the
// garden, and three bedrooms off the hall; a flat roof with a parapet and a lantern over the kitchen.
function openPlan(): Plan {
  const g = new Storey("Ground Floor", 0, 2.5)
    .room("Bedroom 1", rect(7.4, 0.14, 11.86, 4.6), "carpet")
    .room("Living Room", rect(0.14, 0.14, 7.4, 4.6))
    .room("Bedroom 2", rect(0.14, 4.6, 3.6, 8.26), "carpet")
    .room("Hallway", [[3.6, 4.6], [9.4, 4.6], [9.4, 5.8], [5.0, 5.8], [5.0, 8.26], [3.6, 8.26]], "wood")
    .room("Bathroom", rect(5.0, 5.8, 7.4, 8.26), "tiles")
    .room("Utility", rect(7.4, 5.8, 9.4, 8.26), "vinyl")
    .room("Bedroom 3", rect(9.4, 4.6, 11.86, 8.26), "carpet")
    .front("Hallway", 4.3, 8.26, { style: "glazed" })
    .door("Living Room", 4.3, 4.6, { width: 0.9, style: "glazed" })
    .door("Bedroom 1", 8.6, 4.6)
    .door("Bedroom 2", 3.6, 5.3)
    .door("Bathroom", 5.7, 5.8)
    .door("Utility", 8.4, 5.8)
    .door("Bedroom 3", 9.4, 5.2)
    .front("Living Room", 2.6, 0.14, { width: 3.0, height: 2.1, style: "sliding" })
    .sink("Living Room", 6.0, 0.14, 1.6)
    .window("Living Room", 0.14, 2.37, 1.6)
    .front("Bedroom 1", 9.63, 0.14, { width: 1.5, style: "french" })
    .window("Bedroom 1", 11.86, 2.37, 1.2)
    .window("Bedroom 2", 1.87, 8.26, 1.6)
    .small("Bathroom", 6.2, 8.26)
    .sink("Utility", 8.4, 8.26, 0.6)
    .window("Bedroom 3", 10.63, 8.26, 1.2)
    .area("Patio", "patio", rect(0.5, -3.5, 7, 0), { paving: "porcelain" })
    .area("Garden", "lawn", rect(-1, -14, 13, -3.5))
    .area("Driveway", "driveway", rect(6, 8.4, 12, 14));
  return house([g], "render", () => [{
    id: newId("roof"), x: 6, z: 4.2, w: 11.72, d: 8.12, rotation: 0, shape: "flat", pitch: 0, covering: "epdm", parapet: true,
    items: [{ id: newId("ri"), kind: "lantern", x: 4.6, z: 2.4, w: 2.0, d: 1.2 }],
  }]);
}

export const STARTERS: Starter[] = [
  { id: "terrace", name: "Two-bed mid-terrace", text: "Two up, two down, with a kitchen and bathroom in an extension at the back.", joins: "both", plan: terrace },
  { id: "semi", name: "Three-bed semi-detached", text: "Living and dining rooms, a kitchen at the back, three bedrooms upstairs.", joins: "side", plan: semi },
  { id: "detached", name: "Four-bed detached", text: "A kitchen to eat in, living room, study, utility and WC; four bedrooms, one en suite.", joins: "none", plan: detached },
  { id: "bungalow", name: "Two-bed bungalow", text: "All on one floor: hall, living room, kitchen, bathroom and two bedrooms.", joins: "none", plan: bungalow },
  { id: "flat", name: "Two-bed flat", text: "One floor of a block, with a balcony and no roof of its own.", joins: "none", plan: flat },
  { id: "open", name: "Open-plan single storey", text: "One big room to live, cook and eat in, three bedrooms, and a flat roof.", joins: "none", plan: openPlan },
];

/** A house type fitted to a home: as drawn unless a size or mirroring is given. */
export function starterPlan(id: string, fit: Partial<Fit> = {}): Plan {
  const s = STARTERS.find((x) => x.id === id) ?? STARTERS[0];
  const plan = s.plan();
  const own = fitRange(plan);
  if (!own) return plan;
  return normalizePlan(fitPlan(plan, { width: fit.width ?? own.width, depth: fit.depth ?? own.depth, mirror: fit.mirror ?? false }));
}

export { fitRange };
