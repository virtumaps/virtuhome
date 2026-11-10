// What the online demo's tour shows beside the 3D house, drawn here so the demo needs no recordings: a
// doorbell camera's clip, and a phone with an alert or scanning a room. Pretend, like the rest of the
// tour. VirtuHome's own panels and the add-ons' are in panels.ts.

const TAU = Math.PI * 2;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => (k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k));

export type ClipKind = "parcel" | "ring";

/** Film grain, made once and laid over the clips at a random offset each frame. */
let grain: HTMLCanvasElement | null = null;
function grainTile(): HTMLCanvasElement {
  if (grain) return grain;
  grain = document.createElement("canvas");
  grain.width = grain.height = 128;
  const c = grain.getContext("2d")!;
  const img = c.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 26;
  }
  c.putImageData(img, 0, 0);
  return grain;
}

type C = CanvasRenderingContext2D;

function rrect(c: C, x: number, y: number, w: number, h: number, r: number): void {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** A limb from (x1, y1) to (x2, y2), `w` wide with round ends. */
function limb(c: C, x1: number, y1: number, x2: number, y2: number, w: number, colour: string): void {
  c.strokeStyle = colour;
  c.lineWidth = w;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

/** The view from the front door, drawn once: houses over the road, the front wall and garden, the path. */
let street: HTMLCanvasElement | null = null;
function streetView(): HTMLCanvasElement {
  if (street) return street;
  street = document.createElement("canvas");
  street.width = 640;
  street.height = 360;
  const c = street.getContext("2d")!;
  const W = 640;
  const H = 360;
  const wall = 196;
  let g = c.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, "#aebfcf");
  g.addColorStop(1, "#dfe6ec");
  c.fillStyle = g;
  c.fillRect(0, 0, W, 170);
  // trees behind the houses
  c.fillStyle = "#5d6f55";
  for (let x = -10; x < W + 20; x += 38) {
    c.beginPath();
    c.arc(x, 74 + Math.sin(x) * 6, 26 + (x % 3) * 5, 0, Math.PI * 2);
    c.fill();
  }
  // the houses over the road: brick and render, roofs, windows, doors
  const houses: [number, number, string, string][] = [[-30, 150, "#9b6a55", "#3f6b8a"], [120, 150, "#c9b9a3", "#7a2f2f"], [270, 160, "#a5735c", "#2f4f3a"], [430, 150, "#d3c7b6", "#30343b"], [580, 140, "#9b6a55", "#5a4632"]];
  for (const [x, w, wallC, door] of houses) {
    c.fillStyle = "#4b5058";
    c.beginPath();
    c.moveTo(x - 6, 104);
    c.lineTo(x + w * 0.2, 70);
    c.lineTo(x + w * 0.8, 70);
    c.lineTo(x + w + 6, 104);
    c.fill();
    c.fillStyle = "#6c4a3c";
    c.fillRect(x + w * 0.7, 54, 14, 20);
    c.fillStyle = wallC;
    c.fillRect(x, 104, w, 66);
    for (const [wx, wy] of [[0.14, 112], [0.6, 112], [0.6, 140]]) {
      c.fillStyle = "#f2f2ee";
      c.fillRect(x + w * wx, wy, w * 0.28, 20);
      g = c.createLinearGradient(0, wy, 0, wy + 18);
      g.addColorStop(0, "#5b6b7a");
      g.addColorStop(1, "#28313b");
      c.fillStyle = g;
      c.fillRect(x + w * wx + 2, wy + 2, w * 0.28 - 4, 16);
    }
    c.fillStyle = door;
    c.fillRect(x + w * 0.2, 138, w * 0.16, 32);
  }
  // the road, a parked car, the pavement
  c.fillStyle = "#5c6064";
  c.fillRect(0, 168, W, 16);
  c.fillStyle = "#2f5d8c";
  rrect(c, 430, 150, 120, 24, 8);
  c.fill();
  rrect(c, 452, 138, 72, 20, 8);
  c.fill();
  c.fillStyle = "#bcd2e6";
  rrect(c, 458, 141, 28, 13, 3);
  c.fill();
  rrect(c, 490, 141, 28, 13, 3);
  c.fill();
  c.fillStyle = "#1b1d20";
  for (const wx of [452, 528]) {
    c.beginPath();
    c.arc(wx, 174, 9, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#b9b8b2";
  c.fillRect(0, 184, W, 12);
  // the low front wall with its gateway, then the lawn
  g = c.createLinearGradient(0, wall, 0, H);
  g.addColorStop(0, "#71914e");
  g.addColorStop(1, "#47652f");
  c.fillStyle = g;
  c.fillRect(0, wall, W, H - wall);
  c.strokeStyle = "rgba(255,255,255,0.05)";
  c.lineWidth = 18;
  for (let i = -3; i < 8; i++) {
    c.beginPath();
    c.moveTo(W / 2 + i * 90, wall);
    c.lineTo(W / 2 + i * 260, H);
    c.stroke();
  }
  for (const [x0, x1] of [[0, W / 2 - 34], [W / 2 + 34, W]]) {
    c.fillStyle = "#8a5541";
    c.fillRect(x0, wall - 14, x1 - x0, 16);
    c.fillStyle = "#c9c2b6";
    c.fillRect(x0, wall - 17, x1 - x0, 4);
    c.strokeStyle = "rgba(60,30,20,0.35)";
    c.lineWidth = 1;
    for (let x = x0; x < x1; x += 14) {
      c.beginPath();
      c.moveTo(x, wall - 13);
      c.lineTo(x, wall + 2);
      c.stroke();
    }
  }
  // shrubs and a flower bed either side of the path
  for (const [x, y, r] of [[60, 230, 34], [110, 216, 26], [575, 228, 36], [520, 214, 24], [30, 300, 42], [612, 296, 40]]) {
    c.fillStyle = "#2f4a26";
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(140,190,90,0.35)";
    c.beginPath();
    c.arc(x - r * 0.3, y - r * 0.35, r * 0.5, 0, Math.PI * 2);
    c.fill();
  }
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1;
    const y = wall + 10 + (i / 40) * 140;
    const x = W / 2 + side * (40 + ((y - wall) / (H - wall)) * 190 + 14);
    c.fillStyle = ["#e86a8a", "#f2c14e", "#f5f0e8", "#b07ae0"][i % 4];
    c.beginPath();
    c.arc(x + Math.sin(i * 7) * 6, y, 2.4 + (y - wall) / 60, 0, Math.PI * 2);
    c.fill();
  }
  // the path, slab by slab
  c.fillStyle = "#b3aea6";
  c.beginPath();
  c.moveTo(W / 2 - 30, wall);
  c.lineTo(W / 2 + 30, wall);
  c.lineTo(W / 2 + 215, H);
  c.lineTo(W / 2 - 215, H);
  c.fill();
  c.strokeStyle = "rgba(70,66,60,0.35)";
  c.lineWidth = 1.2;
  for (let i = 1; i < 10; i++) {
    const y = wall + (H - wall) * (i / 10) ** 1.7;
    const half = 30 + ((y - wall) / (H - wall)) * 185;
    c.beginPath();
    c.moveTo(W / 2 - half, y);
    c.lineTo(W / 2 + half, y);
    c.stroke();
  }
  c.beginPath();
  c.moveTo(W / 2, wall);
  c.lineTo(W / 2, H);
  c.stroke();
  // the doorstep and mat at the bottom of the picture
  c.fillStyle = "#3f3a36";
  c.fillRect(W / 2 - 150, H - 26, 300, 26);
  c.fillStyle = "#57402f";
  rrect(c, W / 2 - 110, H - 22, 220, 20, 4);
  c.fill();
  return street;
}

/**
 * A doorbell camera's clip: looking out down the front path, someone walks up, leaves a parcel (or rings
 * and waves), with the camera's name, the time, and boxes round what it spotted.
 */
export class Clip {
  readonly canvas = document.createElement("canvas");
  private from = performance.now();

  constructor(private kind: ClipKind, private time: string) {
    this.canvas.width = 640;
    this.canvas.height = 360;
  }

  restart(kind: ClipKind, time: string): void {
    this.kind = kind;
    this.time = time;
    this.from = performance.now();
  }

  draw(now: number): void {
    const c = this.canvas.getContext("2d");
    if (!c) return;
    const W = 640;
    const H = 360;
    const loop = this.kind === "parcel" ? 9.5 : 7.5;
    const t = ((now - this.from) / 1000) % loop;
    c.drawImage(streetView(), 0, 0);

    // the visitor: comes through the gateway and up the path (depth 0 at the gate, 1 at the door)
    let d = 0;
    let away = false;
    let bend = 0;
    let wave = 0;
    let carrying = false;
    let parcelDown = false;
    let shown = true;
    let walking = false;
    if (this.kind === "parcel") {
      if (t < 3.4) [d, carrying, walking] = [ease(t / 3.4) * 0.86, true, true];
      else if (t < 4.6) [d, bend, carrying, parcelDown] = [0.86, Math.sin(((t - 3.4) / 1.2) * Math.PI), t < 4.0, t >= 4.0];
      else if (t < 8.4) [d, away, parcelDown, walking] = [0.86 - ease((t - 4.6) / 3.8) * 0.86, true, true, true];
      else [shown, parcelDown] = [false, true];
    } else if (t < 3) [d, walking] = [ease(t / 3) * 0.9, true];
    else [d, wave] = [0.9, t > 3.8 ? Math.sin((t - 3.8) * 8) : 0];
    const feet = lerp(202, H + 4, d ** 1.6);
    const k = lerp(0.18, 1.05, d ** 1.6);
    const step = walking ? Math.sin(t * 8.5) : 0;
    let box: [number, number, number, number] | null = null;
    if (parcelDown) {
      const bx = W / 2 - 34;
      const by = H - 66;
      c.fillStyle = "rgba(0,0,0,0.25)";
      c.beginPath();
      c.ellipse(W / 2, H - 14, 46, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#a87b4a";
      c.fillRect(bx, by, 68, 50);
      c.fillStyle = "#c79a64";
      c.fillRect(bx, by, 68, 12);
      c.fillStyle = "#e8d7ad";
      c.fillRect(bx + 29, by, 10, 50);
      box = [bx - 6, by - 6, 80, 62];
    }
    let person: [number, number, number, number] | null = null;
    if (shown && k > 0.2) {
      const x = W / 2 + (away ? 14 : -8) * k;
      const top = feet - 300 * k + bend * 50 * k;
      const coat = this.kind === "parcel" ? ["#f08a2c", "#c86a18"] : ["#41698f", "#2c4b69"];
      // a soft shadow on the path
      c.fillStyle = "rgba(0,0,0,0.25)";
      c.beginPath();
      c.ellipse(x, feet, 48 * k, 9 * k, 0, 0, Math.PI * 2);
      c.fill();
      // legs and shoes
      const hip = top + 152 * k;
      for (const side of [-1, 1]) {
        const swing = side * step * 26 * k;
        limb(c, x + side * 15 * k, hip, x + side * 15 * k + swing, feet - 10 * k, 27 * k, "#26303f");
        c.fillStyle = "#15171a";
        c.beginPath();
        c.ellipse(x + side * 15 * k + swing, feet - 6 * k, 17 * k, 8 * k, 0, 0, Math.PI * 2);
        c.fill();
      }
      // body: shoulders wider than the waist, lit from the left
      let g = c.createLinearGradient(x - 46 * k, 0, x + 46 * k, 0);
      g.addColorStop(0, coat[0]);
      g.addColorStop(1, coat[1]);
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(x - 44 * k, top + 56 * k);
      c.quadraticCurveTo(x, top + 46 * k, x + 44 * k, top + 56 * k);
      c.lineTo(x + 34 * k, hip + 6 * k);
      c.lineTo(x - 34 * k, hip + 6 * k);
      c.closePath();
      c.fill();
      if (this.kind === "parcel") {
        c.fillStyle = "rgba(235,240,215,0.85)";
        c.fillRect(x - 40 * k, top + 108 * k, 80 * k, 7 * k);
      }
      // arms: holding the parcel, swinging, or one waving
      const sh = top + 62 * k;
      const arm = coat[1];
      if (carrying) {
        limb(c, x - 40 * k, sh, x - 34 * k, sh + 70 * k + bend * 30 * k, 18 * k, arm);
        limb(c, x + 40 * k, sh, x + 34 * k, sh + 70 * k + bend * 30 * k, 18 * k, arm);
      } else {
        limb(c, x - 42 * k, sh, x - 50 * k - step * 8 * k, sh + 92 * k, 18 * k, arm);
        if (wave) limb(c, x + 42 * k, sh, x + 70 * k + wave * 10 * k, sh - 70 * k, 18 * k, arm);
        else limb(c, x + 42 * k, sh, x + 50 * k + step * 8 * k, sh + 92 * k, 18 * k, arm);
      }
      // head, with a cap for the courier or hair for the visitor
      c.fillStyle = "#c79a7a";
      c.fillRect(x - 7 * k, top + 36 * k, 14 * k, 14 * k);
      c.beginPath();
      c.arc(x, top + 24 * k, 22 * k, 0, Math.PI * 2);
      c.fill();
      if (this.kind === "parcel") {
        c.fillStyle = "#1f2226";
        c.beginPath();
        c.arc(x, top + 18 * k, 23 * k, Math.PI, Math.PI * 2);
        c.fill();
        c.fillRect(away ? x - 34 * k : x - 4 * k, top + 15 * k, 38 * k, 6 * k);
      } else {
        c.fillStyle = "#3b2a20";
        c.beginPath();
        c.arc(x, top + 20 * k, 23 * k, Math.PI * 1.02, Math.PI * 1.98);
        c.fill();
      }
      if (carrying) {
        const by = sh + 48 * k + bend * 30 * k;
        c.fillStyle = "#a87b4a";
        c.fillRect(x - 40 * k, by, 80 * k, 58 * k);
        c.fillStyle = "#c79a64";
        c.fillRect(x - 40 * k, by, 80 * k, 13 * k);
        c.fillStyle = "#e8d7ad";
        c.fillRect(x - 6 * k, by, 12 * k, 58 * k);
        g = c.createLinearGradient(0, by, 0, by + 58 * k);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.18)");
        c.fillStyle = g;
        c.fillRect(x - 40 * k, by, 80 * k, 58 * k);
      }
      person = [x - 60 * k, top - 6 * k, 120 * k, feet - top + 8 * k];
    }

    // the camera's look: colours a little flat, grain, its wide lens darkening the corners
    c.save();
    c.globalCompositeOperation = "saturation";
    c.fillStyle = "rgba(128,128,128,0.3)";
    c.fillRect(0, 0, W, H);
    c.restore();
    c.fillStyle = "rgba(30,45,60,0.1)";
    c.fillRect(0, 0, W, H);
    c.drawImage(grainTile(), -Math.random() * 64, -Math.random() * 64, W + 128, H + 128);
    const v = c.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.64);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.6)");
    c.fillStyle = v;
    c.fillRect(0, 0, W, H);

    // what it spotted
    c.font = "600 13px ui-monospace, Menlo, monospace";
    const tagBox = (r: [number, number, number, number], text: string, colour: string) => {
      c.strokeStyle = colour;
      c.lineWidth = 2;
      c.strokeRect(r[0], r[1], r[2], r[3]);
      const w = c.measureText(text).width + 10;
      c.fillStyle = colour;
      c.fillRect(r[0] - 1, r[1] - 19, w, 19);
      c.fillStyle = "#06121c";
      c.fillText(text, r[0] + 4, r[1] - 5);
    };
    if (person && d > 0.15) tagBox(person, `Person ${this.kind === "parcel" ? 94 : 97}%`, "#5cf2c2");
    if (box) tagBox(box, "Package 88%", "#ffd36b");

    // the camera's name, the time and the recording light
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fillRect(12, 12, 132, 24);
    c.fillStyle = "#fff";
    c.fillText("FRONT DOOR", 34, 29);
    if (Math.floor(now / 600) % 2 === 0) {
      c.fillStyle = "#ff4d4d";
      c.beginPath();
      c.arc(23, 24, 5, 0, TAU);
      c.fill();
    }
    const sec = String(Math.floor(t) + 7).padStart(2, "0");
    // a recording from yesterday, or the doorbell's live picture
    const stamp = this.kind === "ring" ? `LIVE  ${this.time}:${sec}` : `YESTERDAY ${this.time}:${sec}`;
    const sw = c.measureText(stamp).width + 16;
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fillRect(W - 12 - sw, 12, sw, 24);
    c.fillStyle = "#fff";
    c.fillText(stamp, W - 4 - sw, 29);
  }
}

/** A phone: an alert from the house on its lock screen, or a room being scanned. */
export class Phone {
  readonly el = document.createElement("div");
  private screen = document.createElement("canvas");
  private card = document.createElement("div");
  private mode: "alert" | "scan" = "alert";
  private from = 0;
  private time = "10:12";

  constructor() {
    this.el.className = "phone";
    this.el.innerHTML = `<div class="notch"></div>`;
    this.screen.width = 360;
    this.screen.height = 760;
    this.card.className = "note";
    this.el.prepend(this.screen);
    this.el.append(this.card);
  }

  /** The lock screen, and an alert with a still from the clip. */
  alert(time: string, title: string, body: string, still: HTMLCanvasElement | null): void {
    this.mode = "alert";
    this.time = time;
    this.from = performance.now();
    this.card.innerHTML = `<div class="app"><i></i><span>VirtuHome</span><em>now</em></div><b></b><p></p>`;
    this.card.querySelector("b")!.textContent = title;
    this.card.querySelector("p")!.textContent = body;
    if (still) {
      const img = document.createElement("canvas");
      img.width = 320;
      img.height = 180;
      img.getContext("2d")?.drawImage(still, 0, 0, 320, 180);
      this.card.append(img);
    }
    this.card.classList.remove("in");
    void this.card.offsetWidth;
    window.setTimeout(() => this.card.classList.add("in"), 700);
  }

  /** Scanning a room with the phone's LiDAR: the walls, then the furniture, outlined as it goes. */
  scan(): void {
    this.mode = "scan";
    this.from = performance.now();
    this.card.classList.remove("in");
  }

  draw(now: number): void {
    const c = this.screen.getContext("2d");
    if (!c) return;
    const W = 360;
    const H = 760;
    const t = (now - this.from) / 1000;
    if (this.mode === "alert") {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#2b3a67");
      g.addColorStop(0.55, "#6a4c93");
      g.addColorStop(1, "#e2738c");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      c.fillStyle = "rgba(255,255,255,0.92)";
      c.textAlign = "center";
      c.font = "500 18px system-ui, sans-serif";
      // the alert came yesterday: the lock screen shows that day
      const day = new Date(Date.now() - 864e5).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
      c.fillText(day.replace(",", ""), W / 2, 120);
      c.font = "200 86px system-ui, sans-serif";
      c.fillText(this.time, W / 2, 205);
      c.textAlign = "left";
      return;
    }
    // the camera's view of a room: walls, floor, a window, a sofa, a table and a lamp
    // as a phone held in the room sees it: close, so the room fills the screen
    const P = (x: number, y: number, z: number): [number, number] => {
      const sc = 300 / (z + 2.4);
      return [W / 2 + x * sc, H * 0.45 - y * sc];
    };
    const poly = (pts: [number, number, number][], fill: string | CanvasGradient) => {
      c.fillStyle = fill;
      c.beginPath();
      pts.forEach((p, i) => (i ? c.lineTo(...P(...p)) : c.moveTo(...P(...p))));
      c.closePath();
      c.fill();
    };
    const X = 2.1;
    const F = -1.5;
    const T = 2.0;
    const D = 3.6;
    c.fillStyle = "#1a1c20";
    c.fillRect(0, 0, W, H);
    poly([[-X, F, D], [X, F, D], [X, T, D], [-X, T, D]], "#cfc3b0");
    poly([[-X, F, 0], [-X, F, D], [-X, T, D], [-X, T, 0]], "#b9ad9a");
    poly([[X, F, 0], [X, F, D], [X, T, D], [X, T, 0]], "#c2b6a3");
    const fl = c.createLinearGradient(0, H * 0.55, 0, H);
    fl.addColorStop(0, "#8a6a4c");
    fl.addColorStop(1, "#6b4f37");
    poly([[-X, F, 0], [X, F, 0], [X, F, D], [-X, F, D]], fl);
    poly([[-0.9, -0.2, D], [0.9, -0.2, D], [0.9, 1.0, D], [-0.9, 1.0, D]], "#e9f1f7");
    poly([[-0.85, -0.15, D], [0.85, -0.15, D], [0.85, 0.95, D], [-0.85, 0.95, D]], "#a9c4dc");
    poly([[-1.4, F + 0.01, 1.4], [0.8, F + 0.01, 1.4], [0.8, F + 0.01, 2.8], [-1.4, F + 0.01, 2.8]], "#7d5b6a");
    // the sofa against the left wall, the table, the lamp
    poly([[-X + 0.05, F, 2.6], [-X + 0.9, F, 2.6], [-X + 0.9, -0.75, 2.6], [-X + 0.05, -0.75, 2.6]], "#4b5563");
    poly([[-X + 0.05, -0.75, 1.0], [-X + 0.9, -0.75, 1.0], [-X + 0.9, -0.75, 2.6], [-X + 0.05, -0.75, 2.6]], "#5c6676");
    poly([[-X + 0.05, F, 1.0], [-X + 0.35, F, 1.0], [-X + 0.35, -0.3, 1.0], [-X + 0.05, -0.3, 1.0]], "#424b58");
    poly([[-0.4, F, 1.9], [0.5, F, 1.9], [0.5, -0.8, 1.9], [-0.4, -0.8, 1.9]], "#6d4a30");
    poly([[-0.4, -0.8, 1.9], [0.5, -0.8, 1.9], [0.5, -0.8, 2.5], [-0.4, -0.8, 2.5]], "#8b6240");
    const [lx, ly] = P(1.6, -0.2, 3.0);
    const [, ly2] = P(1.6, F, 3.0);
    c.strokeStyle = "#2b2b2b";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(lx, ly);
    c.lineTo(lx, ly2);
    c.stroke();
    c.fillStyle = "#f4e3c1";
    c.beginPath();
    c.ellipse(lx, ly - 6, 16, 12, 0, 0, Math.PI * 2);
    c.fill();
    // the camera's picture, a little dark under the scan
    c.fillStyle = "rgba(10,14,22,0.38)";
    c.fillRect(0, 0, W, H);

    // the scan: dots spreading over each surface, then its edges, then the furniture outlined
    const dots = (a: [number, number, number], u: [number, number, number], v: [number, number, number], from: number) => {
      const k = Math.min(1, Math.max(0, (t - from) / 1.4));
      if (!k) return;
      c.fillStyle = "rgba(170,235,255,0.55)";
      for (let i = 0; i <= 10; i++) {
        for (let j = 0; j <= 8; j++) {
          if ((i + j * 0.7) / 15.6 > k) continue;
          const [x, y] = P(a[0] + u[0] * i / 10 + v[0] * j / 8, a[1] + u[1] * i / 10 + v[1] * j / 8, a[2] + u[2] * i / 10 + v[2] * j / 8);
          c.fillRect(x - 1, y - 1, 2.2, 2.2);
        }
      }
    };
    dots([-X, F, 0], [2 * X, 0, 0], [0, 0, D], 0.2);
    dots([-X, F, D], [2 * X, 0, 0], [0, T - F, 0], 0.8);
    dots([-X, F, 0], [0, 0, D], [0, T - F, 0], 1.3);
    dots([X, F, 0], [0, 0, D], [0, T - F, 0], 1.6);
    const line = (a: [number, number, number], b: [number, number, number], k: number, colour: string, width = 3) => {
      if (k <= 0) return;
      const [x1, y1] = P(...a);
      const [x2, y2] = P(...b);
      c.strokeStyle = colour;
      c.lineWidth = width;
      c.shadowColor = colour;
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(lerp(x1, x2, Math.min(1, k)), lerp(y1, y2, Math.min(1, k)));
      c.stroke();
      c.shadowBlur = 0;
    };
    const fl4: [number, number, number][] = [[-X, F, 0], [X, F, 0], [X, F, D], [-X, F, D]];
    for (let i = 0; i < 4; i++) line(fl4[i], fl4[(i + 1) % 4], (t - 1.8 - i * 0.25) / 0.35, "#ffffff");
    for (let i = 1; i < 3; i++) line(fl4[i + 1], [fl4[i + 1][0], T, fl4[i + 1][2]], (t - 2.6 - i * 0.2) / 0.3, "#ffffff");
    line([-X, T, D], [X, T, D], (t - 3.2) / 0.4, "#ffffff");
    line([-0.9, -0.2, D], [0.9, -0.2, D], (t - 3.4) / 0.3, "#5cd0ff", 2);
    line([0.9, -0.2, D], [0.9, 1.0, D], (t - 3.6) / 0.3, "#5cd0ff", 2);
    line([0.9, 1.0, D], [-0.9, 1.0, D], (t - 3.8) / 0.3, "#5cd0ff", 2);
    line([-0.9, 1.0, D], [-0.9, -0.2, D], (t - 4.0) / 0.3, "#5cd0ff", 2);
    const boxes: [string, number, number, number, number, number, number][] = [["Sofa", -X + 0.05, F, 1.0, 0.85, 0.45, 1.6], ["Table", -0.4, F, 1.9, 0.9, 0.4, 0.6]];
    boxes.forEach(([name, x, y, z, w, h, dz], j) => {
      const k = (t - 4.2 - j * 0.5) / 0.5;
      if (k <= 0) return;
      const corners: [number, number, number][] = [[x, y, z], [x + w, y, z], [x + w, y, z + dz], [x, y, z + dz]];
      for (let i = 0; i < 4; i++) {
        line(corners[i], corners[(i + 1) % 4], k, "#ffd36b", 2);
        line(corners[i], [corners[i][0], y + h, corners[i][2]], k, "#ffd36b", 2);
        line([corners[i][0], y + h, corners[i][2]], [corners[(i + 1) % 4][0], y + h, corners[(i + 1) % 4][2]], k, "#ffd36b", 2);
      }
      if (k >= 1) {
        const [tx, ty] = P(x + w / 2, y + h + 0.15, z + dz / 2);
        c.font = "600 14px system-ui, sans-serif";
        const tw = c.measureText(name).width + 14;
        c.fillStyle = "rgba(255,211,107,0.95)";
        c.fillRect(tx - tw / 2, ty - 12, tw, 20);
        c.fillStyle = "#1a1407";
        c.fillText(name, tx - tw / 2 + 7, ty + 3);
      }
    });
    // the sweep
    const sy = H * (0.12 + 0.6 * ((t * 0.45) % 1));
    const sweep = c.createLinearGradient(0, sy - 40, 0, sy + 40);
    sweep.addColorStop(0, "rgba(92,208,255,0)");
    sweep.addColorStop(0.5, "rgba(92,208,255,0.28)");
    sweep.addColorStop(1, "rgba(92,208,255,0)");
    c.fillStyle = sweep;
    c.fillRect(0, sy - 40, W, 80);
    // the hint at the top, and what it found at the bottom with a little plan when it's done
    const done = t > 5.6;
    c.fillStyle = "rgba(0,0,0,0.5)";
    rrect(c, 40, 64, W - 80, 34, 17);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "500 15px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText(done ? "Room done. Next room?" : t < 2 ? "Move slowly round the room" : "Keep going…", W / 2, 86);
    c.textAlign = "left";
    c.fillStyle = "rgba(0,0,0,0.6)";
    rrect(c, 20, H - 168, W - 40, 128, 18);
    c.fill();
    c.fillStyle = "#fff";
    c.font = "600 22px system-ui, sans-serif";
    c.fillText(done ? "Living room ✓" : "Scanning…", 40, H - 130);
    c.font = "400 16px system-ui, sans-serif";
    c.fillStyle = "rgba(255,255,255,0.82)";
    c.fillText(t > 3.4 ? "4.2 × 3.6 m · 1 window · 1 door" : "Walls…", 40, H - 102);
    c.fillStyle = "rgba(255,255,255,0.2)";
    c.fillRect(40, H - 84, W - 160, 6);
    c.fillStyle = "#5cd0ff";
    c.fillRect(40, H - 84, (W - 160) * Math.min(1, t / 5.6), 6);
    if (done) {
      c.strokeStyle = "#ffffff";
      c.lineWidth = 2;
      c.strokeRect(W - 100, H - 150, 64, 56);
      c.strokeStyle = "#5cd0ff";
      c.beginPath();
      c.moveTo(W - 84, H - 150);
      c.lineTo(W - 56, H - 150);
      c.stroke();
      c.strokeStyle = "#ffd36b";
      c.strokeRect(W - 96, H - 136, 14, 30);
    }
  }
}

export const PROPS_CSS = /* css */ `
.props { position: absolute; inset: 0; pointer-events: none; }
.prop { position: absolute; opacity: 0; transform: translateY(16px) scale(.97); transition: opacity .5s, transform .6s cubic-bezier(.2,.9,.3,1); }
.prop.show { opacity: 1; transform: none; }
.clipbox { left: 3vw; top: calc(var(--u) * 20); width: min(40vw, calc(var(--u) * 74)); border-radius: calc(var(--u) * 1.6); overflow: hidden;
  box-shadow: 0 1.5vh 5vh rgba(0,0,0,.45); border: 1px solid rgba(255,255,255,.18); background: #000; }
.clipbox canvas { display: block; width: 100%; height: auto; }
.clipbox .cap { position: absolute; left: 0; right: 0; bottom: 0; padding: .6em .9em; font-size: max(12px, calc(var(--u) * 1.6)); font-weight: 600;
  background: linear-gradient(transparent, rgba(0,0,0,.7)); color: #fff; }
.phone { right: calc(var(--u) * 6); top: calc(var(--u) * 10); width: calc(var(--u) * 29); aspect-ratio: 9 / 19; border-radius: calc(var(--u) * 3.6);
  border: calc(var(--u) * .7) solid #0b0c0f; background: #000; overflow: hidden; box-shadow: 0 1.5vh 5vh rgba(0,0,0,.5); }
.phone > canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.phone .notch { position: absolute; top: 2%; left: 50%; transform: translateX(-50%); width: 30%; height: 3.2%; border-radius: 99px; background: #000; z-index: 2; }
.phone .note { position: absolute; left: 5%; right: 5%; top: 33%; padding: 6% 6% 5%; border-radius: calc(var(--u) * 1.8); color: #111;
  background: rgba(245,245,247,.9); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); font-size: calc(var(--u) * 1.25);
  opacity: 0; transform: translateY(-30%); transition: opacity .45s, transform .55s cubic-bezier(.2,.9,.3,1.2); }
.phone .note.in { opacity: 1; transform: none; }
.phone .app { display: flex; align-items: center; gap: .5em; color: #555; font-size: .9em; }
.phone .app i { width: 1.6em; height: 1.6em; border-radius: .4em; background: linear-gradient(135deg, #5cd0ff, #a08cff); }
.phone .app em { margin-left: auto; font-style: normal; }
.phone .note b { display: block; margin-top: .55em; font-size: 1.12em; }
.phone .note p { margin: .25em 0 .6em; line-height: 1.3; color: #333; }
.phone .note canvas { width: 100%; border-radius: .6em; display: block; }
.narrow .clipbox { left: 4vw; right: 4vw; width: auto; top: 140px; }
.narrow .phone { right: 4vw; top: auto; bottom: calc(25vw + 120px); width: 30vw; }
`;
