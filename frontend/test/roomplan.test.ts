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
});
