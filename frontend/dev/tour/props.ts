// What the online demo's tour shows beside the 3D house, drawn here so the demo needs no recordings: a
// doorbell camera's clip, a phone with an alert or scanning a room, a wall tablet taken over by the
// doorbell, and the Energy add-on's what-if. Pretend, like the rest of the tour.

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
    const horizon = H * 0.38;

    // the street beyond the hedges, the hedges, and the path coming down to the door
    let g = c.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, "#c9d6df");
    g.addColorStop(1, "#e8ecef");
    c.fillStyle = g;
    c.fillRect(0, 0, W, horizon);
    c.fillStyle = "#7d858c";
    for (const [x, w, h] of [[20, 120, 70], [150, 90, 52], [470, 150, 78], [380, 70, 40]]) c.fillRect(x, horizon - h, w, h);
    c.fillStyle = "#9aa3aa";
    for (const [x, w, h] of [[60, 18, 14], [180, 16, 12], [500, 20, 16]]) c.fillRect(x, horizon - h - 70 + (h > 15 ? 0 : 22), w, h);
    c.fillStyle = "#6f7a70";
    c.fillRect(0, horizon - 6, W, 10);
    g = c.createLinearGradient(0, horizon, 0, H);
    g.addColorStop(0, "#56634f");
    g.addColorStop(1, "#3c4636");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, horizon);
    c.lineTo(W, horizon);
    c.lineTo(W, H);
    c.lineTo(0, H);
    c.fill();
    c.fillStyle = "#2f3a2c";
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(W / 2 + side * 70, horizon - 18);
      c.lineTo(W / 2 + side * W * 0.62, H);
      c.lineTo(W / 2 + side * W * 0.62, H * 0.62);
      c.lineTo(W / 2 + side * 92, horizon - 34);
      c.fill();
    }
    g = c.createLinearGradient(0, horizon, 0, H);
    g.addColorStop(0, "#a7a9a6");
    g.addColorStop(1, "#8b8d8a");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(W / 2 - 26, horizon);
    c.lineTo(W / 2 + 26, horizon);
    c.lineTo(W / 2 + 250, H);
    c.lineTo(W / 2 - 250, H);
    c.fill();
    c.strokeStyle = "rgba(60,62,60,0.35)";
    c.lineWidth = 1;
    for (let i = 1; i < 9; i++) {
      const y = horizon + (H - horizon) * (i / 9) ** 1.8;
      const half = lerp(26, 250, (y - horizon) / (H - horizon));
      c.beginPath();
      c.moveTo(W / 2 - half, y);
      c.lineTo(W / 2 + half, y);
      c.stroke();
    }
    c.fillStyle = "#4a3b33";
    c.fillRect(W / 2 - 120, H - 34, 240, 34);

    // the visitor: walks up the path (depth 0 far, 1 at the door), leaves a parcel or rings and waves
    let d = 0;
    let away = false;
    let bend = 0;
    let wave = 0;
    let carrying = false;
    let parcelDown = false;
    let shown = true;
    if (this.kind === "parcel") {
      if (t < 3.4) [d, carrying] = [ease(t / 3.4) * 0.84, true];
      else if (t < 4.6) [d, bend, carrying, parcelDown] = [0.84, Math.sin(((t - 3.4) / 1.2) * Math.PI), t < 4.0, t >= 4.0];
      else if (t < 8.4) [d, away, parcelDown] = [0.84 - ease((t - 4.6) / 3.8) * 0.84, true, true];
      else [shown, parcelDown] = [false, true];
    } else {
      if (t < 3) d = ease(t / 3) * 0.92;
      else [d, wave] = [0.92, t > 4 ? Math.sin((t - 4) * 7) : 0];
    }
    const feet = lerp(horizon, H * 1.04, d ** 1.5);
    const k = lerp(0.1, 1.25, d ** 1.5);
    const walk = shown && (this.kind === "parcel" ? t < 3.4 || (t > 4.6 && t < 8.4) : t < 3) ? Math.sin(t * 9) : 0;
    let box: [number, number, number, number] | null = null;
    if (parcelDown) {
      const s = 0.95;
      c.fillStyle = "#b58a58";
      c.fillRect(W / 2 - 40 * s, H - 70 * s, 80 * s, 56 * s);
      c.fillStyle = "#d9c49a";
      c.fillRect(W / 2 - 6, H - 70 * s, 12, 56 * s);
      box = [W / 2 - 46, H - 76, 92, 66];
    }
    let person: [number, number, number, number] | null = null;
    if (shown && k > 0.12) {
      const x = W / 2 + (away ? 18 : -10) * k;
      const top = feet - 300 * k + bend * 60 * k;
      c.save();
      c.translate(x, 0);
      // legs
      c.fillStyle = "#1f2733";
      for (const side of [-1, 1]) {
        c.save();
        c.translate(side * 16 * k, feet - 120 * k);
        c.rotate(side * walk * 0.22);
        c.fillRect(-11 * k, 0, 22 * k, 120 * k);
        c.restore();
      }
      // body: a courier's jacket, or a visitor's coat
      c.fillStyle = this.kind === "parcel" ? "#d9862b" : "#3c5a7a";
      const by = top + 62 * k;
      c.beginPath();
      // rounded where the browser can (roundRect is newer than the oldest browsers we support)
      if (typeof c.roundRect === "function") c.roundRect(-46 * k, by, 92 * k, 128 * k, 22 * k);
      else c.rect(-46 * k, by, 92 * k, 128 * k);
      c.fill();
      if (this.kind === "parcel") {
        c.fillStyle = "rgba(240,240,200,0.8)";
        c.fillRect(-46 * k, by + 70 * k, 92 * k, 9 * k);
      }
      // arms, one waving at the camera
      c.fillStyle = this.kind === "parcel" ? "#c4761f" : "#34506d";
      c.save();
      c.translate(40 * k, by + 12 * k);
      c.rotate(wave ? -2.4 + wave * 0.35 : walk * -0.2);
      c.fillRect(-9 * k, 0, 18 * k, 92 * k);
      c.restore();
      c.save();
      c.translate(-40 * k, by + 12 * k);
      c.rotate(walk * 0.2);
      c.fillRect(-9 * k, 0, 18 * k, 92 * k);
      c.restore();
      // head, and a cap for the courier
      c.fillStyle = "#c9a184";
      c.beginPath();
      c.arc(0, top + 32 * k, 30 * k, 0, TAU);
      c.fill();
      if (this.kind === "parcel") {
        c.fillStyle = "#222";
        c.fillRect(-32 * k, top + 2 * k, 64 * k, 14 * k);
        c.fillRect(away ? -46 * k : 0, top + 10 * k, 46 * k, 7 * k);
      } else {
        c.fillStyle = "#3a2a20";
        c.beginPath();
        c.arc(0, top + 26 * k, 31 * k, Math.PI, TAU);
        c.fill();
      }
      if (carrying) {
        c.fillStyle = "#b58a58";
        c.fillRect(-44 * k, by + 40 * k + bend * 40 * k, 88 * k, 62 * k);
        c.fillStyle = "#d9c49a";
        c.fillRect(-6 * k, by + 40 * k + bend * 40 * k, 12 * k, 62 * k);
      }
      c.restore();
      person = [x - 56 * k, top - 6 * k, 112 * k, feet - top + 6 * k];
    }

    // the camera's look: muted colours, grain, a vignette from its wide lens
    c.fillStyle = "rgba(40,55,70,0.16)";
    c.fillRect(0, 0, W, H);
    const tile = grainTile();
    c.drawImage(tile, -Math.random() * 64, -Math.random() * 64, W + 128, H + 128);
    g = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    c.fillStyle = g;
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
    if (person && d > 0.2) tagBox(person, `Person ${this.kind === "parcel" ? 94 : 97}%`, "#5cf2c2");
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
    const stamp = `YESTERDAY ${this.time}:${sec}`;
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
  alert(title: string, body: string, still: HTMLCanvasElement | null): void {
    this.mode = "alert";
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
      c.fillText("10:12", W / 2, 205);
      c.textAlign = "left";
      return;
    }
    // the camera's view of a room, darkened, with the scan drawn over it
    c.fillStyle = "#1d1f24";
    c.fillRect(0, 0, W, H);
    const P = (x: number, y: number, z: number): [number, number] => {
      const s = 260 / (z + 3.2);
      return [W / 2 + x * s, H * 0.44 - y * s];
    };
    const line = (a: [number, number, number], b: [number, number, number], k: number, colour: string) => {
      if (k <= 0) return;
      const [x1, y1] = P(...a);
      const [x2, y2] = P(...b);
      c.strokeStyle = colour;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(lerp(x1, x2, Math.min(1, k)), lerp(y1, y2, Math.min(1, k)));
      c.stroke();
    };
    // the room: floor corners, walls up; then a sofa and a table, as boxes
    const fl: [number, number, number][] = [[-2.1, -1.2, 0], [2.1, -1.2, 0], [2.1, -1.2, 3.6], [-2.1, -1.2, 3.6]];
    const wall = "#ffffff";
    for (let i = 0; i < 4; i++) line(fl[i], fl[(i + 1) % 4], (t - i * 0.5) / 0.5, wall);
    for (let i = 0; i < 4; i++) line(fl[i], [fl[i][0], 1.3, fl[i][2]], (t - 2 - i * 0.25) / 0.4, wall);
    for (let i = 0; i < 4; i++) line([fl[i][0], 1.3, fl[i][2]], [fl[(i + 1) % 4][0], 1.3, fl[(i + 1) % 4][2]], (t - 3 - i * 0.2) / 0.4, wall);
    const boxes: [number, number, number, number, number, number][] = [[-1.7, -1.2, 2.6, 1.6, 0.8, 0.9], [0.3, -1.2, 1.2, 1.0, 0.45, 0.6]];
    boxes.forEach(([x, y, z, w, h, dz], j) => {
      const k = (t - 4.2 - j * 0.6) / 0.5;
      const corners: [number, number, number][] = [[x, y, z], [x + w, y, z], [x + w, y, z + dz], [x, y, z + dz]];
      for (let i = 0; i < 4; i++) {
        line(corners[i], corners[(i + 1) % 4], k, "#ffd36b");
        line(corners[i], [corners[i][0], y + h, corners[i][2]], k, "#ffd36b");
        line([corners[i][0], y + h, corners[i][2]], [corners[(i + 1) % 4][0], y + h, corners[(i + 1) % 4][2]], k, "#ffd36b");
      }
    });
    // the sweep
    const sy = H * (0.15 + 0.6 * ((t * 0.4) % 1));
    const g = c.createLinearGradient(0, sy - 40, 0, sy + 40);
    g.addColorStop(0, "rgba(92,208,255,0)");
    g.addColorStop(0.5, "rgba(92,208,255,0.35)");
    g.addColorStop(1, "rgba(92,208,255,0)");
    c.fillStyle = g;
    c.fillRect(0, sy - 40, W, 80);
    // what it found so far
    const done = t > 5.6;
    c.fillStyle = "rgba(0,0,0,0.55)";
    c.fillRect(20, H - 150, W - 40, 110);
    c.fillStyle = "#fff";
    c.font = "600 22px system-ui, sans-serif";
    c.fillText(done ? "Living room ✓" : "Scanning…", 40, H - 108);
    c.font = "400 17px system-ui, sans-serif";
    c.fillStyle = "rgba(255,255,255,0.8)";
    c.fillText(t > 3.6 ? "4.2 × 3.6 m · 2 windows · 1 door" : "Walls…", 40, H - 78);
    c.fillStyle = "rgba(255,255,255,0.2)";
    c.fillRect(40, H - 62, W - 80, 6);
    c.fillStyle = "#5cd0ff";
    c.fillRect(40, H - 62, (W - 80) * Math.min(1, t / 5.6), 6);
  }
}

/** A wall tablet in its frame: the doorbell camera has taken over the screen. */
export class Tablet {
  readonly el = document.createElement("div");

  constructor(clip: Clip) {
    this.el.className = "tablet";
    this.el.innerHTML = `<div class="bar"><i></i><b>Front door</b><span>Someone's at the door</span><em>17:42</em></div><div class="feed"></div>
      <div class="acts"><span>Talk</span><span>Unlock</span><span>Dismiss</span></div>`;
    this.el.querySelector(".feed")!.append(clip.canvas);
  }
}

/** The Energy add-on's what-if, for a few more panels on the best slope. */
export function whatIf(): HTMLElement {
  const el = document.createElement("div");
  el.className = "whatif";
  // a year of what they'd make, month by month (kWh)
  const months = [38, 62, 110, 150, 185, 192, 188, 160, 122, 78, 44, 30];
  const top = Math.max(...months);
  el.innerHTML = `<div class="k">What if</div><h3>4 more panels on the south slope</h3>
    <div class="rows">
      <div><b>1,520 kWh</b><span>made a year</span></div>
      <div><b>£285</b><span>saved a year</span></div>
      <div><b>7 years</b><span>to pay back</span></div>
    </div>
    <div class="bars">${months.map((m) => `<i style="height:${Math.round((m / top) * 100)}%"></i>`).join("")}</div>
    <div class="m"><span>Jan</span><span>Jun</span><span>Dec</span></div>`;
  return el;
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
.phone { right: calc(var(--u) * 6); top: calc(var(--u) * 10); width: calc(var(--u) * 24); aspect-ratio: 9 / 19; border-radius: calc(var(--u) * 3.6);
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
.tablet { left: 3vw; top: calc(var(--u) * 18); width: min(46vw, calc(var(--u) * 84)); border-radius: calc(var(--u) * 2.4); background: #111;
  border: calc(var(--u) * 1.1) solid #0a0b0e; box-shadow: 0 2vh 6vh rgba(0,0,0,.5); overflow: hidden; color: #fff; }
.tablet .bar { display: flex; align-items: center; gap: .7em; padding: .7em 1em; font-size: max(12px, calc(var(--u) * 1.6)); background: #1b1e25; }
.tablet .bar i { width: .7em; height: .7em; border-radius: 50%; background: #ff4d4d; animation: blink 1s infinite; }
.tablet .bar span { color: #ffb4b4; } .tablet .bar em { margin-left: auto; font-style: normal; color: #aaa; }
.tablet .feed canvas { display: block; width: 100%; height: auto; }
.tablet .acts { display: flex; gap: .6em; padding: .7em; justify-content: center; font-size: max(12px, calc(var(--u) * 1.5)); background: #1b1e25; }
.tablet .acts span { padding: .5em 1.2em; border-radius: 99px; background: rgba(255,255,255,.12); }
.tablet .acts span:first-child { background: #2fb36d; }
@keyframes blink { 50% { opacity: .2; } }
.whatif { left: 3vw; top: calc(var(--u) * 22); width: min(34vw, calc(var(--u) * 56)); padding: calc(var(--u) * 2.4); border-radius: calc(var(--u) * 2.2);
  background: rgba(10,14,26,.8); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.16); color: #fff; }
.whatif .k { font-size: max(10px, calc(var(--u) * 1.35)); letter-spacing: .25em; text-transform: uppercase; color: #ffd36b; font-weight: 700; }
.whatif h3 { margin: .3em 0 .8em; font-size: max(16px, calc(var(--u) * 2.6)); font-weight: 500; }
.whatif .rows { display: grid; grid-template-columns: repeat(3, 1fr); gap: .6em; }
.whatif .rows b { display: block; font-size: max(16px, calc(var(--u) * 2.8)); }
.whatif .rows span { font-size: max(11px, calc(var(--u) * 1.4)); color: rgba(238,244,255,.7); }
.whatif .bars { display: flex; align-items: flex-end; gap: 4%; height: calc(var(--u) * 9); margin-top: 1.2em; }
.whatif .bars i { flex: 1; border-radius: 3px 3px 0 0; background: linear-gradient(#ffd36b, #ef6a2b); }
.whatif .m { display: flex; justify-content: space-between; font-size: max(10px, calc(var(--u) * 1.2)); color: rgba(238,244,255,.6); margin-top: .4em; }
.narrow .clipbox, .narrow .tablet, .narrow .whatif { left: 4vw; right: 4vw; width: auto; top: calc(var(--u) * 26); }
.narrow .phone { right: 4vw; top: auto; bottom: calc(25vw + 120px); width: 30vw; }
`;
