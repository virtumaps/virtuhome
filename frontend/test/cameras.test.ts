import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Device, type Floor } from "../src/model/plan";
import { layoutWalls } from "../src/model/walls";
import { cameraPieces, cameraRig, headingDir } from "../src/scene/cameras";

// a 4 x 3 room with its front door in the bottom edge (z = 3)
const floor = (devices: Device[]): Floor => ({
  id: "g", name: "Ground", elevation: 0, height: 2.5, walls: [], furniture: [], devices,
  rooms: [{ id: "a", name: "A", area_id: null, points: [[0, 0], [4, 0], [4, 3], [0, 3]] }],
  openings: [{ id: "d", room_id: "a", edge: 2, offset: 2, width: 0.9, height: 2, sill: 0, kind: "door" }],
});
const rigOf = (d: Partial<Device>) => {
  const dev: Device = { id: "c", entity: "camera.hall", x: 1, z: 0.1, ...d };
  const f = floor([dev]);
  return cameraRig(f, layoutWalls(f, DEFAULT_SETTINGS), dev);
};

describe("camera rigs", () => {
  it("hangs a wall camera on the wall's face and looks away from it unless turned", () => {
    const rig = rigOf({});
    expect(rig.kind).toBe("bullet");
    expect(rig.wall!.at[1]).toBeCloseTo(DEFAULT_SETTINGS.wall_exterior / 2);
    expect(rig.wall!.out).toEqual([0, 1]);
    // into the room: +z is heading 0
    expect(rig.heading).toBeCloseTo(0);
    expect(rig.lens[1]).toBeGreaterThan(rig.wall!.at[1]);
    expect(rig.fov).toBe(90);
  });

  it("keeps a set direction and range", () => {
    const rig = rigOf({ rotation: 30, fov: 120, reach: 4 });
    expect(rig.heading).toBe(30);
    expect([rig.fov, rig.reach]).toEqual([120, 4]);
    // the lens sits in front of the body, which turns with the aim
    const [ax, az] = headingDir(30);
    const centre = [rig.wall!.at[0], rig.wall!.at[1] + 0.11];
    expect((rig.lens[0] - centre[0]) * ax + (rig.lens[1] - centre[1]) * az).toBeGreaterThan(0.05);
  });

  it("knows a dome, a doorbell and a camera on a stand", () => {
    expect(rigOf({ mount: "ceiling", x: 2, z: 1.5 })).toMatchObject({ kind: "dome", fov: 360, wall: null });
    // a doorbell outside the front door looks out of the house
    const bell = rigOf({ entity: "camera.front_doorbell", x: 1.2, z: 3.2 });
    expect(bell).toMatchObject({ kind: "doorbell", outside: true });
    expect(bell.heading).toBeCloseTo(0);
    expect(bell.wall!.at[1]).toBeCloseTo(3 + DEFAULT_SETTINGS.wall_exterior / 2);
    // nowhere near a wall: it stands on something, facing the room's middle
    const cube = rigOf({ x: 1, z: 1.5 });
    expect(cube.kind).toBe("cube");
    expect(cube.heading).toBeCloseTo(270);
    expect(rigOf({ mount: "table", x: 0.3, z: 0.4 }).kind).toBe("cube");
  });

  it("builds every kind of model upright and close to its lens", () => {
    for (const d of [{}, { mount: "ceiling" as const, x: 2, z: 1.5 }, { entity: "camera.doorbell", x: 1.2, z: 3.2 }, { x: 1, z: 1.5 }]) {
      const rig = rigOf(d);
      const pieces = cameraPieces(rig);
      expect(pieces.length).toBeGreaterThan(0);
      for (const p of pieces) {
        expect(Math.hypot(p.item.x - rig.lens[0], p.item.z - rig.lens[1])).toBeLessThan(0.25);
        const top = Math.max(...p.parts.map((x) => x.y + x.h)) + p.bottom;
        expect(Math.abs(top - rig.y)).toBeLessThan(0.15);
      }
    }
  });
});
