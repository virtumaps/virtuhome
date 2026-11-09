import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { normalizePlan, spaces } from "../src/model/plan";
import { DEMO_PLAN } from "../src/demo/plan";
import { houseList } from "../src/ui/list";
import { minifyCss, minifyCssTemplates } from "../dev/css.mjs";
import { VIEW_CSS } from "../src/ui/styles";

describe("the List of rooms and devices", () => {
  const plan = normalizePlan(DEMO_PLAN);

  it("has each floor's rooms and garden areas, in the order the view counts them", () => {
    const floors = houseList(plan, () => null, () => []);
    expect(floors.map((f) => f.name)).toEqual(plan.floors.filter((f) => spaces(f).length).map((f) => f.name));
    floors.forEach((f) => {
      const fi = plan.floors.findIndex((x) => x.name === f.name);
      expect(f.rooms.map((r) => r.name)).toEqual(spaces(plan.floors[fi]).map((s) => s.name));
      f.rooms.forEach((r, ri) => expect([r.floor, r.room]).toEqual([fi, ri]));
    });
  });

  it("lists the devices placed in a room first, then the rest of its area's, each once", () => {
    const [first, second, ...rest] = [...new Set(plan.floors[0].devices.map((d) => d.entity))];
    const kitchen = plan.floors[0].rooms[0];
    const floors = houseList(
      plan,
      // the first two in the first room, the third only known by its floor, the rest nowhere
      (id) => (id === first || id === second ? { floor: 0, room: 0 } : id === rest[0] ? { floor: 0, room: -1 } : null),
      (area) => (area === kitchen.area_id ? ["switch.kettle", first] : []),
    );
    expect(floors[0].rooms[0].entities).toEqual([first, second, "switch.kettle"]);
    expect(floors.flatMap((f) => f.rooms.flatMap((r) => r.entities))).not.toContain(rest[0]);
  });

  it("leaves out floors with no rooms", () => {
    const bare = normalizePlan({ version: 1, floors: [{ id: "f", name: "Loft", elevation: 0, height: 2.5, rooms: [], openings: [], furniture: [], devices: [] }] });
    expect(houseList(bare, () => null, () => [])).toEqual([]);
  });
});

describe("CSS shipped without comments and spare spaces", () => {
  it("keeps what the spaces mean", () => {
    expect(minifyCss(`
      /* a comment */
      .a :focus-visible, .b > .c { outline: 2px solid var(--x); }
      .d { width: calc(100% - 12px); font: 600 12px/1 a, b; }
      @media (min-width: 601px) { .e .f { margin: 0 auto; } }
    `)).toBe(".a :focus-visible,.b>.c{outline:2px solid var(--x)}.d{width:calc(100% - 12px);font:600 12px/1 a,b}@media (min-width:601px){.e .f{margin:0 auto}}");
  });

  it("touches only the CSS of templates marked as CSS, around their placeholders", () => {
    const src = "const A = /* css */ `\n.a { color: red; }\n`;\nconst B = /* css */ `\n.b .${c} { color: ${d.e}; }\n`;\nconst C = `.c { color: red; }`;";
    expect(minifyCssTemplates(src)).toBe("const A = /* css */ `.a{color:red}`;\nconst B = /* css */ ` .b .${c}{color:${d.e}}`;\nconst C = `.c { color: red; }`;");
  });

  it("is what the build ships", () => {
    const built = new URL("../../custom_components/virtuhome/frontend/app/", import.meta.url).pathname;
    const app = readdirSync(built).filter((f) => f.endsWith(".js")).map((f) => readFileSync(built + f, "utf8")).join("\n");
    expect(app).toContain(minifyCss(VIEW_CSS));
    expect(app).not.toContain(VIEW_CSS.trim().split("\n")[1]);
  });
});
