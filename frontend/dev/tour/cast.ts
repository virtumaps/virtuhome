// The online demo tour's two hosts, drawn on canvas each frame: a calm orb of light with turning rings,
// and a bouncy blob with big eyes. Their faces follow how they speak (level), where they look (gaze),
// blinking and a mood. The tour (tour.ts) owns the timing; this only draws.

const TAU = Math.PI * 2;

export type Who = "orb" | "blob";
export type Mood = "neutral" | "smile" | "dry" | "proud" | "happy" | "wink" | "surprised" | "excited" | "pout";

/** One host's face between frames. */
export class Face {
  /** How loud it speaks now (0..1), easing to `target`. */
  level = 0;
  target = 0;
  /** Where it looks: -1 left, 0 at the viewer, 1 right. */
  gaze = 0;
  gazeTo = 0;
  mood: Mood = "neutral";
  talking = false;
  blink = 0;
  private blinkLeft = 0;
  private nextBlink = 1 + Math.random() * 3;
  nextGlance = 2 + Math.random() * 2;
  sweep = 0;
  sparks: { x: number; y: number; size: number; life: number; spin: number }[] = [];

  update(dt: number): void {
    this.level += (this.target - this.level) * Math.min(1, dt * (this.target > this.level ? 30 : 11));
    this.gaze += (this.gazeTo - this.gaze) * Math.min(1, dt * 7);
    this.nextBlink -= dt;
    if (this.nextBlink <= 0) {
      this.blinkLeft = 0.17;
      // now and then a double blink
      this.nextBlink = Math.random() < 0.15 ? 0.3 : 2.4 + Math.random() * 4;
    }
    this.blinkLeft = Math.max(0, this.blinkLeft - dt);
    this.blink = this.blinkLeft > 0 ? Math.sin((1 - this.blinkLeft / 0.17) * Math.PI) : 0;
  }
}

type C = CanvasRenderingContext2D;

function ellipse(c: C, x: number, y: number, rx: number, ry: number, rot = 0): void {
  c.beginPath();
  c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU);
}

function pill(c: C, x: number, y: number, w: number, h: number): void {
  const r = Math.min(h / 2, w / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** A smooth closed shape through the midpoints of `pts`. */
function blobPath(c: C, pts: [number, number][]): void {
  const n = pts.length;
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[n - 1], pts[0]);
  c.beginPath();
  c.moveTo(start[0], start[1]);
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    c.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  c.closePath();
}

/** The orb: calm and precise, rings turning, a ring that moves with its voice, visor eyes. */
export function drawOrb(c: C, f: Face, W: number, H: number, t: number, dt: number): void {
  const s = Math.min(W, H);
  const cx = W / 2;
  const cy = H * 0.45;
  const R = s * 0.2;
  const lv = f.level;
  c.clearRect(0, 0, W, H);
  c.lineCap = "round";

  let g = c.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.6);
  g.addColorStop(0, `rgba(70,190,255,${0.3 + lv * 0.25})`);
  g.addColorStop(1, "rgba(70,190,255,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  // three arcs turning slowly, ticks turning the other way, a comet that speeds up as it talks
  c.strokeStyle = "rgba(150,225,255,0.55)";
  c.lineWidth = s * 0.007;
  for (let k = 0; k < 3; k++) {
    const a = t * 0.3 + (k * TAU) / 3;
    c.beginPath();
    c.arc(cx, cy, R * 1.33, a, a + 1.65);
    c.stroke();
  }
  c.save();
  c.translate(cx, cy);
  c.rotate(-t * 0.07);
  c.lineWidth = s * 0.0045;
  for (let i = 0; i < 72; i++) {
    const long = i % 6 === 0;
    const a = (i / 72) * TAU;
    const r0 = R * 1.56;
    const r1 = r0 + s * (long ? 0.03 : 0.014);
    c.strokeStyle = `rgba(150,225,255,${long ? 0.5 : 0.2})`;
    c.beginPath();
    c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    c.stroke();
  }
  c.restore();
  f.sweep += (0.7 + lv * 2.4) * dt;
  c.lineWidth = s * 0.009;
  for (let i = 0; i < 16; i++) {
    c.strokeStyle = `rgba(200,244,255,${(1 - i / 16) * 0.8})`;
    c.beginPath();
    c.arc(cx, cy, R * 1.9, f.sweep - (i + 1) * 0.055, f.sweep - i * 0.055);
    c.stroke();
  }

  // the voice ring
  c.beginPath();
  for (let i = 0; i <= 140; i++) {
    const a = (i / 140) * TAU;
    const w = 0.55 * Math.sin(a * 5 + t * 9) + 0.3 * Math.sin(a * 9 - t * 13) + 0.15 * Math.sin(a * 14 + t * 6);
    const r = R * 1.11 + w * lv * R * 0.24 + lv * R * 0.05;
    if (i) c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else c.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  c.strokeStyle = `rgba(130,220,255,${0.3 + lv * 0.65})`;
  c.lineWidth = s * 0.006;
  c.stroke();

  // the core
  const br = R * (1 + 0.013 * Math.sin(t * 1.4) + lv * 0.045);
  g = c.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, br);
  g.addColorStop(0, "#f4fdff");
  g.addColorStop(0.32, "#a6e8ff");
  g.addColorStop(0.72, "#2c9de2");
  g.addColorStop(1, "#0c4778");
  c.save();
  c.shadowColor = "rgba(90,200,255,0.85)";
  c.shadowBlur = s * 0.07;
  c.fillStyle = g;
  c.beginPath();
  c.arc(cx, cy, br, 0, TAU);
  c.fill();
  c.restore();

  const mood = f.mood;
  const ey = cy - R * 0.08;
  const gx = f.gaze * R * 0.15;
  const ew = R * 0.29;
  const eh = R * 0.15;
  c.fillStyle = c.strokeStyle = "#06263f";
  for (const side of [-1, 1]) {
    const x = cx + side * R * 0.34 + gx;
    if (mood === "smile" || mood === "proud") {
      c.lineWidth = R * 0.085;
      c.beginPath();
      c.arc(x, ey + R * 0.07, ew * 0.42, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
      continue;
    }
    let open = 1 - f.blink;
    if (mood === "dry" && side === -1) open *= 0.42;
    const h = Math.max(R * 0.025, eh * open);
    pill(c, x - ew / 2, ey - h / 2 + (mood === "dry" && side === -1 ? eh * 0.22 : 0), ew, h);
    c.fill();
  }
  if (mood === "dry") {
    // one brow up
    c.lineWidth = R * 0.05;
    c.beginPath();
    c.moveTo(cx + R * 0.2 + gx, ey - R * 0.2);
    c.lineTo(cx + R * 0.48 + gx, ey - R * 0.27);
    c.stroke();
  }

  // a small equaliser where a mouth would be
  const by = cy + R * 0.38;
  c.globalAlpha = 0.72;
  for (let i = 0; i < 5; i++) {
    const wob = 0.55 + 0.45 * Math.sin(t * 19 + i * 1.9) * Math.sin(t * 7.3 + i);
    const h = R * (0.04 + lv * 0.26 * Math.abs(wob) * (1 - Math.abs(i - 2) * 0.18));
    pill(c, cx + (i - 2) * R * 0.11 + gx * 0.3 - R * 0.03, by - h / 2, R * 0.06, h);
    c.fill();
  }
  c.globalAlpha = 1;
  if (mood === "proud" || (mood === "smile" && lv < 0.05)) {
    c.lineWidth = R * 0.045;
    c.beginPath();
    c.arc(cx + gx * 0.3, by - R * 0.12, R * 0.2, Math.PI * 0.2, Math.PI * 0.8);
    c.stroke();
  }
}

/** The blob: warm and bouncy, big eyes, cheeks, and a mouth that moves as it talks. */
export function drawBlob(c: C, f: Face, W: number, H: number, t: number, dt: number): void {
  const s = Math.min(W, H);
  const R = s * 0.22;
  const lv = f.level;
  const mood = f.mood;
  const excited = mood === "excited";
  const cx = W / 2;
  const bob = Math.sin(t * 2.3) * R * 0.035;
  const hop = (f.talking ? Math.abs(Math.sin(t * 6.4)) * lv * R * 0.16 : 0) + (excited ? Math.abs(Math.sin(t * 7)) * R * 0.11 : 0);
  const base = H * 0.47;
  const cy = base + bob - hop;
  const sq = (f.talking ? lv * 0.07 : 0) + 0.016 * Math.sin(t * 2.3) - (excited ? (hop / R) * 0.15 : 0);
  c.clearRect(0, 0, W, H);

  // its shadow on the floor, smaller as it hops
  const lift = Math.min(1, hop / R);
  c.fillStyle = `rgba(0,0,0,${0.3 - lift * 0.15})`;
  ellipse(c, cx, base + R * 1.12, R * 0.78 * (1 - lift * 0.3), R * 0.11);
  c.fill();

  let g = c.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.4);
  g.addColorStop(0, `rgba(255,120,140,${0.26 + lv * 0.2})`);
  g.addColorStop(1, "rgba(255,120,140,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  c.save();
  c.translate(cx, cy);
  c.scale(1 + sq, 1 - sq);
  const pts: [number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU - Math.PI / 2;
    const r = R * 1.09 * (1 + 0.04 * Math.sin(t * 1.8 + i * 1.3) + 0.028 * Math.sin(t * 2.9 + i * 2.1) + lv * 0.05 * Math.sin(t * 12 + i * 2));
    pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.97]);
  }
  blobPath(c, pts);
  g = c.createLinearGradient(-R, -R, R, R);
  g.addColorStop(0, "#ffe27c");
  g.addColorStop(0.45, "#ff9e6c");
  g.addColorStop(1, "#ff5a92");
  c.save();
  c.shadowColor = "rgba(255,110,140,0.7)";
  c.shadowBlur = s * 0.07;
  c.fillStyle = g;
  c.fill();
  c.restore();
  c.fillStyle = "rgba(255,255,255,0.34)";
  ellipse(c, -R * 0.4, -R * 0.52, R * 0.3, R * 0.14, -0.5);
  c.fill();
  c.fillStyle = "rgba(255,70,120,0.34)";
  for (const side of [-1, 1]) {
    ellipse(c, side * R * 0.53, R * 0.12, R * 0.14, R * 0.085);
    c.fill();
  }

  // eyes
  const ink = "#3a1430";
  const ey = -R * 0.13;
  const gx = f.gaze * R * 0.08;
  const surprised = mood === "surprised";
  for (const side of [-1, 1]) {
    const x = side * R * 0.3 + gx;
    if (mood === "happy" || excited || (mood === "wink" && side === 1)) {
      c.strokeStyle = ink;
      c.lineWidth = R * 0.08;
      c.lineCap = "round";
      c.beginPath();
      c.arc(x, ey + R * 0.07, R * 0.12, Math.PI * 1.12, Math.PI * 1.88);
      c.stroke();
      continue;
    }
    const k = surprised ? 1.18 : 1;
    let ry = R * 0.19 * k * (1 - f.blink * 0.92);
    let y = ey;
    if (mood === "pout") {
      ry *= 0.55;
      y += R * 0.06;
    }
    c.fillStyle = "#fff";
    ellipse(c, x, y, R * 0.15 * k, ry);
    c.fill();
    if (ry > R * 0.05) {
      const pr = R * (surprised ? 0.075 : 0.1) * Math.min(1, ry / (R * 0.12));
      const px = x + f.gaze * R * 0.05;
      const py = y + R * 0.02;
      c.fillStyle = ink;
      ellipse(c, px, py, pr, Math.min(pr, ry * 0.9));
      c.fill();
      c.fillStyle = "#fff";
      ellipse(c, px - pr * 0.35, py - pr * 0.4, pr * 0.32, pr * 0.32);
      c.fill();
    }
    if (mood === "pout") {
      c.strokeStyle = ink;
      c.lineWidth = R * 0.045;
      c.beginPath();
      c.moveTo(x - R * 0.13, y - R * 0.14 - side * R * 0.03);
      c.lineTo(x + R * 0.13, y - R * 0.14 + side * R * 0.03);
      c.stroke();
    }
  }

  // mouth
  c.lineCap = "round";
  const my = R * 0.3;
  c.fillStyle = c.strokeStyle = "#4a1232";
  c.lineWidth = R * 0.05;
  if (f.talking && lv > 0.03) {
    const rx = R * (0.11 + lv * 0.06);
    const ry = R * (0.035 + lv * 0.17);
    ellipse(c, 0, my, rx, ry);
    c.fill();
    c.save();
    ellipse(c, 0, my, rx, ry);
    c.clip();
    c.fillStyle = "#ff7d98";
    ellipse(c, 0, my + ry * 0.75, rx * 0.7, ry * 0.55);
    c.fill();
    c.restore();
  } else if (surprised) {
    ellipse(c, 0, my, R * 0.065, R * 0.085);
    c.fill();
  } else if (mood === "pout") {
    c.beginPath();
    c.arc(0, my + R * 0.12, R * 0.12, Math.PI * 1.25, Math.PI * 1.75);
    c.stroke();
  } else {
    c.beginPath();
    c.arc(0, my - R * 0.14, R * (mood === "happy" || excited ? 0.17 : 0.14), Math.PI * 0.18, Math.PI * 0.82);
    c.stroke();
  }
  c.restore();

  // sparkles when it's excited, and now and then as it talks
  if ((excited && Math.random() < dt * 9) || (f.talking && lv > 0.55 && Math.random() < dt * 2)) {
    const a = Math.random() * TAU;
    f.sparks.push({ x: cx + Math.cos(a) * R * 1.3, y: cy + Math.sin(a) * R * 1.1, size: R * (0.06 + Math.random() * 0.08), life: 1, spin: Math.random() * TAU });
  }
  f.sparks = f.sparks.filter((p) => (p.life -= dt * 0.9) > 0);
  for (const p of f.sparks) {
    p.y -= dt * R * 0.6;
    const k = p.size * Math.sin(p.life * Math.PI);
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.spin + (1 - p.life));
    c.fillStyle = `rgba(255,236,160,${p.life})`;
    c.beginPath();
    c.moveTo(0, -k * 2);
    c.quadraticCurveTo(0, 0, k * 2, 0);
    c.quadraticCurveTo(0, 0, 0, k * 2);
    c.quadraticCurveTo(0, 0, -k * 2, 0);
    c.quadraticCurveTo(0, 0, 0, -k * 2);
    c.fill();
    c.restore();
  }
}
