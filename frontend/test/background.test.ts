import { describe, expect, it } from "vitest";
import { imageCorners, imageUrl, insideImage, parseLength, placeImage, rescale, toImage, uploadImage } from "../src/editor/background";

describe("parseLength", () => {
  it("reads metres, centimetres and millimetres", () => {
    expect(parseLength("3.45")).toBe(3.45);
    expect(parseLength(" 3,45 m ")).toBe(3.45);
    expect(parseLength("345cm")).toBeCloseTo(3.45);
    expect(parseLength("3450 mm")).toBeCloseTo(3.45);
  });

  it("reads feet and inches as estate agents write them", () => {
    expect(parseLength("11'4\"")).toBeCloseTo(3.4544);
    expect(parseLength("11’ 4”")).toBeCloseTo(3.4544);
    expect(parseLength("11 ft 4 in")).toBeCloseTo(3.4544);
    expect(parseLength("11'")).toBeCloseTo(3.3528);
  });

  it("refuses what isn't a length", () => {
    expect(parseLength("")).toBeNull();
    expect(parseLength("about 3")).toBeNull();
    expect(parseLength("3 x 4")).toBeNull();
  });
});

describe("placing and scaling the picture", () => {
  const bg = placeImage("g-0123456789ab.png", 1000, 500, [2, 1], 10);

  it("centres it where asked, the width asked", () => {
    expect(bg.scale).toBeCloseTo(0.01);
    expect(imageCorners(bg)).toEqual([[-3, -1.5], [7, -1.5], [7, 3.5], [-3, 3.5]]);
    expect(toImage(bg, [2, 1])).toEqual([500, 250]);
    expect(insideImage(bg, [6.9, 3.4])).toBe(true);
    expect(insideImage(bg, [7.1, 1])).toBe(false);
  });

  it("knows its pixels when it is turned", () => {
    const turned = { ...bg, rotation: 90 };
    // a quarter turn clockwise: the picture's top edge now runs down its right side
    const [u, v] = toImage(turned, [2 + 2.5, 1]);
    expect(u).toBeCloseTo(500);
    expect(v).toBeCloseTo(0);
    const c = imageCorners(turned)[0];
    expect(c[0]).toBeCloseTo(4.5);
    expect(c[1]).toBeCloseTo(-4);
  });

  it("scales from a wall of known length, keeping its first end in place", () => {
    // the wall from (0, 0) to (4, 0) on the picture is really 6 m long
    const next = rescale(bg, [0, 0], [4, 0], 6)!;
    expect(next.scale).toBeCloseTo(0.015);
    expect(toImage(next, [0, 0])[0]).toBeCloseTo(toImage(bg, [0, 0])[0]);
    expect(toImage(next, [6, 0])[0]).toBeCloseTo(toImage(bg, [4, 0])[0]);
    expect(rescale(bg, [1, 1], [1, 1], 3)).toBeNull();
    expect(rescale(bg, [0, 0], [1, 0], 0)).toBeNull();
  });
});

describe("sending the picture", () => {
  it("goes in pieces of 1 MB, each at its offset, and gives the stored name", async () => {
    const sent: Record<string, unknown>[] = [];
    const hass = {
      async callWS<T>(msg: Record<string, unknown>): Promise<T> {
        sent.push(msg);
        return (msg.done ? { file: "g-0123456789ab.png", bytes: 0 } : { upload_id: "abcdef0123456789", bytes: 0 }) as T;
      },
    };
    const data = new Uint8Array(2.5 * 1024 * 1024).map((_, i) => i % 251);
    const progress: number[] = [];
    const name = await uploadImage(hass, "g", new Blob([data]), (d) => progress.push(d));
    expect(name).toBe("g-0123456789ab.png");
    expect(sent.map((m) => [m.offset, m.done, m.upload_id])).toEqual([
      [0, false, undefined],
      [1024 * 1024, false, "abcdef0123456789"],
      [2 * 1024 * 1024, true, "abcdef0123456789"],
    ]);
    const back = sent.map((m) => atob(String(m.data))).join("");
    expect(back.length).toBe(data.length);
    let same = true;
    for (let i = 0; i < data.length && same; i++) same = back.charCodeAt(i) === data[i];
    expect(same).toBe(true);
    expect(progress[progress.length - 1]).toBe(1);
  });

  it("loads from a signed path, made absolute where Home Assistant is elsewhere", async () => {
    const hass = {
      async callWS<T>(msg: Record<string, unknown>): Promise<T> {
        return { path: `${msg.path}?authSig=x` } as T;
      },
    };
    expect(await imageUrl(hass, "g-0123456789ab.png")).toBe("/api/virtuhome/background/g-0123456789ab.png?authSig=x");
    expect(await imageUrl({ ...hass, hassUrl: (p = "") => `http://ha.local:8123${p}` }, "g-0123456789ab.png")).toBe("http://ha.local:8123/api/virtuhome/background/g-0123456789ab.png?authSig=x");
  });
});
