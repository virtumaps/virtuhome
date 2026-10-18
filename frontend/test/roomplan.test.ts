import { describe, expect, it } from "vitest";
import { importRoomPlan, isRoomPlan } from "../src/import/roomplan";

// a RoomPlan surface: size and a column-major transform turned by `angle` about y, centred at (x, y, z)
const surface = (len: number, h: number, x: number, y: number, z: number, angle: number, extra: Record<string, unknown> = {}) => ({
  dimensions: [len, h, 0],
  transform: [Math.cos(angle), 0, Math.sin(angle), 0, 0, 1, 0, 0, -Math.sin(angle), 0, Math.cos(angle), 0, x, y, z, 1],
  ...extra,
});
const FLOOR = -1.3; // the phone was 1.3 m above the floor
const wall = (ax: number, az: number, bx: number, bz: number) =>
  surface(Math.hypot(bx - ax, bz - az), 2.5, (ax + bx) / 2, FLOOR + 1.25, (az + bz) / 2, Math.atan2(bz - az, bx - ax));
const floorOf = (pts: number[][]) => ({ transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, FLOOR, 0, 1], polygonCorners: pts.map(([x, z]) => [x, 0, z]), dimensions: [1, 1, 0] });

// two rooms side by side, 12 cm apart (their walls are the room-side surfaces); a door between them,
// a front door in the bottom wall of room A, a window in room B's top wall, a sofa
const roomA = {
  walls: [wall(0, 0, 4, 0), wall(4, 0, 4, 3), wall(4, 3, 0, 3), wall(0, 3, 0, 0)],
  floors: [floorOf([[0, 0], [4, 0], [4, 3], [0, 3]])],
  sections: [{ label: "livingRoom", center: [2, FLOOR, 1.5] }],
};
const roomB = {
  walls: [wall(4.12, 0, 7, 0), wall(7, 0, 7, 3), wall(7, 3, 4.12, 3), wall(4.12, 3, 4.12, 0)],
  floors: [floorOf([[4.12, 0], [7, 0], [7, 3], [4.12, 3]])],
  sections: [{ label: "unidentified", center: [5.5, FLOOR, 1.5] }],
};
const scan = {
  rooms: [roomA, roomB],
  walls: [...roomA.walls, ...roomB.walls],
  doors: [surface(0.9, 2.0, 4.06, FLOOR + 1.0, 1.5, Math.PI / 2), surface(1.0, 2.0, 1.5, FLOOR + 1.0, 3, 0)],
  windows: [surface(1.2, 1.2, 5.5, FLOOR + 0.9 + 0.6, 0, 0)],
  openings: [],
  objects: [{ category: { sofa: {} }, ...surface(2, 0.8, 1.5, FLOOR + 0.4, 2.4, Math.PI) }],
};

describe("importRoomPlan", () => {
  it("recognises RoomPlan JSON", () => {
    expect(isRoomPlan(scan)).toBe(true);
    expect(isRoomPlan({ hello: 1 })).toBe(false);
  });

  it("builds rooms joined on the wall's middle with the manifest's names", () => {
    const { plan, report } = importRoomPlan(scan, { rooms: [{ order: 1, name: "Living Room" }, { order: 2, name: "Hallway (downstairs)" }] }, { frontDoorRoom: "Living Room" });
    expect(report.warnings).toEqual([]);
    const f = plan.floors[0];
    expect(f.rooms.map((r) => r.name)).toEqual(["Living Room", "Hallway"]);
    // the shared edge sits on the middle of the 12 cm gap: both rooms use the same coordinate
    const xsA = f.rooms[0].points.map((p) => p[0]);
    const xsB = f.rooms[1].points.map((p) => p[0]);
    const shared = xsA.filter((x) => xsB.some((y) => Math.abs(x - y) < 1e-6));
    expect(shared.length).toBeGreaterThan(0);
    expect(plan.settings.wall_interior).toBeCloseTo(0.12, 2);
  });

  it("turns the plan so the front door is at the bottom, and keeps doors, windows and the sofa", () => {
    const { plan, report } = importRoomPlan(scan, null, {});
    const f = plan.floors[0];
    expect(report.openings).toBe(3);
    expect(f.openings.filter((o) => o.kind === "door")).toHaveLength(2);
    const win = f.openings.find((o) => o.kind === "window")!;
    expect(win.sill).toBeCloseTo(0.9, 1);
    expect(f.furniture.map((x) => x.type)).toEqual(["sofa"]);
    // the front door (1 m, in room A's bottom wall) lies on the room's highest-z edge
    const front = f.openings.find((o) => o.kind === "door" && Math.abs(o.width - 1) < 1e-6)!;
    const room = f.rooms.find((r) => r.id === front.room_id)!;
    const a = room.points[front.edge];
    const b = room.points[(front.edge + 1) % room.points.length];
    const maxZ = Math.max(...f.rooms.flatMap((r) => r.points.map((p) => p[1])));
    expect(a[1]).toBeCloseTo(maxZ);
    expect(b[1]).toBeCloseTo(maxZ);
  });

  it("picks furniture styles from RoomPlan's attributes and joins an L-shaped sofa", () => {
    const obj = (cat: string, attrs: Record<string, string>, w: number, h: number, d: number, x: number, z: number) =>
      ({ category: { [cat]: {} }, attributes: attrs, ...surface(w, h, x, FLOOR + h / 2, z, 0), dimensions: [w, h, d] });
    const withObjects = {
      ...scan,
      objects: [
        obj("sofa", { SofaType: "lShaped" }, 2.4, 0.8, 0.95, 2, 1.0),
        // the return: in front of the main part, at its right end
        obj("sofa", { SofaType: "lShapedExtension" }, 0.8, 0.8, 0.9, 2.8, 1.925),
        obj("chair", { ChairType: "stool" }, 0.4, 0.75, 0.4, 5, 1),
        obj("table", { TableType: "coffee", TableShapeType: "circularElliptic" }, 0.8, 0.4, 0.8, 5.5, 2),
        obj("storage", { StorageType: "shelf" }, 0.9, 1.9, 0.3, 6.5, 0.4),
      ],
    };
    const { plan } = importRoomPlan(withObjects, null, {});
    const types = plan.floors[0].furniture.map((x) => x.type).sort();
    expect(types).toEqual(["bookcase", "coffee_round", "sofa_l", "stool_bar"]);
    const l = plan.floors[0].furniture.find((x) => x.type === "sofa_l")!;
    expect(l.w).toBeCloseTo(2.4, 2);
    expect(l.d).toBeCloseTo(1.85, 2);
    expect(l.mirror).toBeFalsy();
  });

  it("adds decoration from detections.json: on the floor, and pictures onto the wall", () => {
    const detections = {
      version: 1,
      space: "structure" as const,
      objects: [
        { label: "plant", position: [2, FLOOR + 0.5, 1.5], size: [0.5, 1.0, 0.5], room: 0, story: 0 },
        { label: "picture", position: [1, FLOOR + 1.5, 0.1], size: [0.6, 0.45, 0.03], room: 0, story: 0 },
        { label: "other", position: [1, FLOOR, 1], room: 0 },
      ],
    };
    const { plan, report } = importRoomPlan(scan, null, { detections });
    expect(report.decor).toBe(2);
    const f = plan.floors[0];
    const plant = f.furniture.find((x) => x.type === "plant")!;
    expect(plant.y).toBeUndefined();
    expect(plant.h).toBeCloseTo(1.0, 2);
    const pic = f.furniture.find((x) => x.type === "picture")!;
    expect(pic.rotation).toBeCloseTo(0, 5);
    expect(pic.y).toBeCloseTo(1.275, 2);
    // flat against the top wall of its room, facing into it
    const room = f.rooms[0];
    const top = Math.min(...room.points.map((p) => p[1]));
    expect(pic.z - top).toBeGreaterThan(0);
    expect(pic.z - top).toBeLessThan(0.15);
  });
});

describe("north from House Scan's compass", () => {
  // the whole scan turned by θ about y (as if the phone had started facing another way)
  const ry = (t: number) => [Math.cos(t), 0, -Math.sin(t), 0, 0, 1, 0, 0, Math.sin(t), 0, Math.cos(t), 0, 0, 0, 0, 1];
  const mul = (a: number[], b: number[]) => {
    const out = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return out;
  };
  const turned = (t: number): typeof scan => {
    const r = ry(t);
    const fix = (o: unknown): unknown => {
      if (Array.isArray(o)) return o.map(fix);
      if (!o || typeof o !== "object") return o;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(o)) {
        if (k === "transform") out[k] = mul(r, v as number[]);
        else if (k === "center") {
          const [x, y, z] = v as number[];
          out[k] = [x * Math.cos(t) + z * Math.sin(t), y, -x * Math.sin(t) + z * Math.cos(t)];
        } else out[k] = fix(v);
      }
      return out;
    };
    return fix(scan) as typeof scan;
  };
  const compass = (bearing: number) => ({ version: 1, space: "structure" as const, objects: [], compass: { structure_minus_z_bearing: bearing, reference: "true" as const, samples: 40, spread: 4 } });

  it("leaves north up without a reading", () => {
    const { plan, report } = importRoomPlan(scan, null, {});
    expect(plan.settings.north).toBe(0);
    expect(report.north).toBeNull();
  });

  it("gives the same north however the scan was turned", () => {
    const base = importRoomPlan(scan, null, { detections: compass(40) });
    expect(base.plan.settings.north).toBeCloseTo(40, 1);
    expect(base.report.north?.spread).toBe(4);
    // the house turned by θ in the scan's frame: the frame's -Z now points θ further round
    for (const deg of [30, 90, 200]) {
      const t = (deg * Math.PI) / 180;
      const { plan } = importRoomPlan(turned(t), null, { detections: compass(40 + deg) });
      const diff = Math.abs((((plan.settings.north - base.plan.settings.north) % 360) + 540) % 360 - 180);
      expect(diff).toBeLessThan(0.5);
    }
  });

  it("ignores a reading with too few samples", () => {
    const d = compass(40);
    d.compass.samples = 3;
    expect(importRoomPlan(scan, null, { detections: d }).plan.settings.north).toBe(0);
  });
});
