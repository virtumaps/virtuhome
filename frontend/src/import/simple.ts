// The simple plan format (docs/import-format.md) and NeonPlan 3D's "neonplan-import" format, which
// it follows: floors of rooms as corner lists, doors and windows by a point on a room edge,
// furniture by type or name. Lengths in m, cm or mm.
import type { OpeningKind, Vec2 } from "../model/plan";
import { DOOR_STYLES, GARAGE_STYLES, WINDOW_STYLES } from "../scene/joinery";
import type { Draft, DraftFloor, DraftOpening } from "./draft";

export const SIMPLE_FORMATS = ["virtuhome-import", "neonplan-import"];

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const own = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);
const isPoint = (v: unknown): boolean => Array.isArray(v) && v.length >= 2 && v.slice(0, 2).every((n) => typeof n === "number" && Number.isFinite(n));

/** A plan in the simple format: says so, or has floors (or rooms) with corner lists and isn't a VirtuHome plan file. */
export function isSimplePlan(data: unknown): boolean {
  if (!isObj(data)) return false;
  if (typeof data.format === "string") return SIMPLE_FORMATS.includes(data.format);
  if ("settings" in data) return false;
  const floors = Array.isArray(data.floors) ? data.floors : [data];
  return floors.some((f) => isObj(f) && Array.isArray(f.rooms) && f.rooms.some((r) => isObj(r) && Array.isArray(r.points) && r.points.some(isPoint)));
}

export function importSimple(data: unknown): Draft {
  if (!isObj(data)) throw new Error("The file is not a plan.");
  const units: Record<string, number> = { m: 1, cm: 0.01, mm: 0.001 };
  const key = String(data.units ?? "m").toLowerCase();
  const unit = own(units, key) ? units[key] : 0;
  if (!unit) throw new Error(`Unknown units "${String(data.units)}": use m, cm or mm.`);
  const num = (v: unknown, d: number): number => (typeof v === "number" && Number.isFinite(v) ? v * unit : d);
  const pt = (v: unknown): Vec2 | null => (isPoint(v) ? [(v as number[])[0] * unit, (v as number[])[1] * unit] : null);
  const list = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter(isObj) : []);
  const text = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
  const left: string[] = [];

  // a file with just rooms is one floor
  const rawFloors = Array.isArray(data.floors) ? list(data.floors) : [data];
  if (!rawFloors.length) throw new Error("The file has no floors.");
  let level = 0;
  const floors = rawFloors.map((f): DraftFloor => {
    const height = num(f.height, 2.5);
    const elevation = num(f.elevation, level);
    level = elevation + height;
    const opening = (o: Obj, kind: OpeningKind, d: [number, number, number]): DraftOpening | null => {
      const at = pt(o.at);
      if (!at) {
        left.push(`A ${kind === "window" ? "window" : "door"} without "at"`);
        return null;
      }
      const name = text(o.kind) ?? text(o.type);
      const k: OpeningKind = kind === "window" ? "window" : name === "garage" ? "garage" : name === "passage" || name === "opening" ? "passage" : "door";
      const styles: Record<string, string> = k === "window" ? WINDOW_STYLES : k === "garage" ? GARAGE_STYLES : DOOR_STYLES;
      const style = text(o.style);
      return {
        at, kind: k, width: num(o.width, d[0]), height: num(o.height, d[1]), sill: k === "window" ? num(o.sill, d[2]) : 0,
        ...(style && own(styles, style) && k !== "passage" ? { style: style as DraftOpening["style"] } : {}),
      };
    };
    return {
      name: text(f.name),
      elevation,
      height,
      rooms: list(f.rooms).map((r) => ({ name: text(r.name), points: (Array.isArray(r.points) ? r.points : []).map(pt).filter((p): p is Vec2 => !!p) })),
      walls: list(f.walls).flatMap((w) => {
        const a = pt(w.from), b = pt(w.to);
        return a && b ? [{ a, b, thickness: num(w.thickness, 0) || null, height: num(w.height, 0) || null }] : [];
      }),
      openings: [
        ...list(f.doors).map((o) => opening(o, "door", [0.9, 2.0, 0])),
        ...list(f.windows).map((o) => opening(o, "window", [1.2, 1.2, 0.9])),
      ].filter((o): o is DraftOpening => !!o),
      furniture: list(f.furniture).flatMap((x) => {
        const at = pt(x.at);
        if (!at) {
          left.push(`${text(x.name) ?? text(x.type) ?? "A piece"} without "at"`);
          return [];
        }
        const len = (v: unknown) => (typeof v === "number" && v > 0 ? v * unit : null);
        return [{
          at, type: text(x.type) ?? null, name: text(x.name),
          w: len(x.width), d: len(x.depth), h: len(x.height),
          rotation: typeof x.rotation === "number" ? x.rotation : 0, elevation: num(x.elevation, 0),
        }];
      }),
    };
  });

  const walls = isObj(data.wall_thickness) ? data.wall_thickness : {};
  return {
    roomsAt: data.rooms_at === "inner" ? "inner" : "centre",
    wallExterior: num(walls.outside, 0) || null,
    wallInterior: num(walls.inside, 0) || null,
    north: typeof data.north === "number" && Number.isFinite(data.north) ? data.north : null,
    floors,
    left,
  };
}
