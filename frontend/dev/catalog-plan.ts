// ?plan=catalog: every built-in item in its own little labelled room, by category, to check how
// each one looks in both looks.
import { CATEGORY_NAMES, FURNITURE, type Category } from "../src/scene/furniture-lib";
import { normalizePlan, type Furniture, type Plan, type Room } from "../src/model/plan";

export function catalogPlan(only?: string | null): Plan {
  const cell = 2.2;
  const perRow = 10;
  const rooms: Room[] = [];
  const furniture: Furniture[] = [];
  const cats = Object.keys(CATEGORY_NAMES) as Category[];
  let row = 0;
  for (const cat of cats) {
    if (only && only !== cat) continue;
    const types = Object.entries(FURNITURE).filter(([, t]) => t.category === cat);
    types.forEach(([key, t], i) => {
      const x0 = (i % perRow) * cell;
      const z0 = (row + Math.floor(i / perRow)) * cell;
      rooms.push({ id: `c_${key}`, name: t.name, area_id: null, floor: "wood", points: [[x0, z0], [x0 + cell, z0], [x0 + cell, z0 + cell], [x0, z0 + cell]] });
      const [w, d, h] = t.size;
      // big things are shrunk to fit their cell
      const k = Math.min(1, (cell - 0.4) / Math.max(w, d));
      furniture.push({ id: `f_${key}`, type: key, x: x0 + cell / 2, z: z0 + cell / 2, rotation: 0, w: w * k, d: d * k, h: h * (k < 1 ? Math.max(k, 0.5) : 1), y: t.category === "lights" ? undefined : t.y });
    });
    row += Math.ceil(types.length / perRow);
  }
  return normalizePlan({
    version: 1, name: "Catalogue",
    settings: { wall_exterior: 0.2, wall_interior: 0.06, north: 0, theme: "day", exterior_finish: "render" },
    floors: [{ id: "f", name: "Catalogue", elevation: 0, height: 2.6, rooms, openings: [], furniture, devices: [], walls: [] }],
  });
}
