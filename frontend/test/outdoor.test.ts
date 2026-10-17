import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Floor, type OutdoorArea, type Plan } from "../src/model/plan";
import { buildFloor, groundAt, outdoorAt, outdoorTop, SLAB } from "../src/scene/build";
import { DAY } from "../src/scene/palette";

const lawn: OutdoorArea = { id: "garden", name: "Garden", kind: "lawn", area_id: null, points: [[-3, -10], [6, -10], [6, -0.14], [-3, -0.14]] };
const deck: OutdoorArea = { id: "deck", name: "Deck", kind: "deck", area_id: null, points: [[3, -3.2], [6, -3.2], [6, -0.14], [3, -0.14]] };

function floor(outdoor: OutdoorArea[], furniture: Floor["furniture"] = []): Floor {
  return {
    id: "f0", name: "Ground", elevation: 0, height: 2.6, openings: [], devices: [], walls: [], furniture, outdoor,
    rooms: [{ id: "lounge", name: "Lounge", area_id: null, points: [[-3, 0], [6, 0], [6, 7], [-3, 7]] }],
  } as Floor;
}

describe("garden areas", () => {
  it("picks the deck lying on a lawn, whichever comes first in the plan", () => {
    for (const order of [[lawn, deck], [deck, lawn]]) {
      const f = floor(order);
      expect(f.outdoor![outdoorAt(f, [4.5, -1.5])].id).toBe("deck");
      expect(f.outdoor![outdoorAt(f, [0, -5])].id).toBe("garden");
      expect(outdoorAt(f, [20, 20])).toBe(-1);
    }
  });

  it("raises a deck level with the floor indoors and keeps the lawn on the ground", () => {
    const f = floor([lawn, deck]);
    expect(outdoorTop(f, 1)).toBeLessThan(0);
    expect(outdoorTop(f, 1)).toBeGreaterThan(-0.02);
    expect(outdoorTop(f, 0)).toBeLessThan(-SLAB + 0.02);
    expect(groundAt(f, [4.5, -1.5])).toBe(outdoorTop(f, 1));
    expect(groundAt(f, [0, -5])).toBe(-SLAB);
  });

  it("builds the deck's open sides but none against the house, and stands furniture on it", () => {
    const chair = { id: "chair", type: "garden_chair", x: 4.5, z: -1.5, rotation: 0, w: 0.55, d: 0.6, h: 0.85 };
    const f = floor([lawn, deck], [chair]);
    const plan = { version: 1, settings: { ...DEFAULT_SETTINGS }, floors: [f] } as unknown as Plan;
    const fb = buildFloor(plan, 0, DAY, { low: false });
    const g = fb.opaque;
    const top = outdoorTop(f, 1);
    const deckRoom = f.rooms.length + 1;
    // side faces: vertices of the deck's area with a sideways normal
    const sides = new Set<string>();
    let chairLow = Infinity;
    for (let v = 0; v < g.vertexCount; v++) {
      const y = g.pos[v * 3 + 1];
      if (g.item[v] < 0 && g.room[v] === deckRoom && Math.abs(g.nrm[v * 3 + 1]) < 0.1) sides.add(`${g.nrm[v * 3].toFixed(2)},${g.nrm[v * 3 + 2].toFixed(2)}`);
      if (g.item[v] >= 0 && fb.items[g.item[v]].id === "chair") chairLow = Math.min(chairLow, y);
    }
    // west (-x), north (-z) and east (+x): not south, which runs along the house
    expect([...sides].sort()).toEqual(["-1.00,0.00", "0.00,-1.00", "1.00,0.00"].sort());
    expect(chairLow).toBeCloseTo(top, 2);
  });
});
