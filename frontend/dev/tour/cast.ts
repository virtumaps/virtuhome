// The online demo tour's host, Nell, drawn on canvas each frame: a little house (VirtuHome's own) with big eyes. Its face follows
// how it speaks (level), where it looks (gaze), blinking and a mood. The tour (tour.ts) owns the
// timing; this only draws.

const TAU = Math.PI * 2;

export type Mood = "neutral" | "happy" | "wink" | "surprised" | "excited" | "pout" | "look";

/** The host's face between frames. */
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

/** The house front: a gable, in units of R from the middle. */
const HOUSE: [number, number][] = [[0, -1.02], [0.88, -0.2], [0.78, 0.86], [-0.78, 0.86], [-0.88, -0.2]];

/** The host: a little lit house, bouncy, big eyes, cheeks, and a mouth that moves as it talks. */
export function drawHost(c: C, f: Face, W: number, H: number, t: number, dt: number): void {
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

  // a warm glow behind it, like a lit house at night
  let g = c.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.4);
  g.addColorStop(0, `rgba(255,190,110,${0.22 + lv * 0.18})`);
  g.addColorStop(1, "rgba(255,190,110,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  c.save();
  c.translate(cx, cy);
  // turned towards what she's showing: the house, on her left
  if (mood === "look") c.rotate(-0.07);
  c.scale(1 + sq, 1 - sq);

  // the chimney, behind the roof (fillRect: roundRect isn't in older browsers)
  c.fillStyle = "#173d8a";
  c.fillRect(R * 0.42, -R * 1.0, R * 0.2, R * 0.36);

  // the house front: a gable, its corners rounded by a wide stroke in the same paint; it breathes
  c.beginPath();
  HOUSE.forEach(([x, y], i) => {
    const k = 1 + 0.025 * Math.sin(t * 1.8 + i * 1.3) + lv * 0.03 * Math.sin(t * 12 + i * 2);
    if (i) c.lineTo(x * R * k, y * R * k);
    else c.moveTo(x * R * k, y * R * k);
  });
  c.closePath();
  g = c.createLinearGradient(-R, -R, R, R);
  g.addColorStop(0, "#8fe0ff");
  g.addColorStop(0.5, "#4fb8ff");
  g.addColorStop(1, "#2f7cf6");
  c.save();
  c.shadowColor = "rgba(20,70,170,0.6)";
  c.shadowBlur = s * 0.06;
  c.fillStyle = c.strokeStyle = g;
  c.lineJoin = "round";
  c.lineWidth = R * 0.32;
  c.fill();
  c.stroke();
  c.restore();

  // the roof: a navy cap with eaves
  c.beginPath();
  c.moveTo(-R * 1.12, -R * 0.12);
  c.lineTo(0, -R * 1.12);
  c.lineTo(R * 1.12, -R * 0.12);
  c.strokeStyle = "#1f4aa8";
  c.lineWidth = R * 0.26;
  c.lineCap = c.lineJoin = "round";
  c.stroke();

  // light on the wall, and cheeks
  c.fillStyle = "rgba(255,255,255,0.28)";
  ellipse(c, -R * 0.45, -R * 0.05, R * 0.22, R * 0.1, -0.5);
  c.fill();
  c.fillStyle = "rgba(255,120,150,0.35)";
  for (const side of [-1, 1]) {
    ellipse(c, side * R * 0.53, R * 0.24, R * 0.14, R * 0.085);
    c.fill();
  }

  // eyes
  const ink = "#13275a";
  const ey = -R * 0.01;
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
      const py = y + R * 0.02 - (mood === "look" ? R * 0.035 : 0);
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
  const my = R * 0.42;
  c.fillStyle = c.strokeStyle = "#0e1f4a";
  c.lineWidth = R * 0.05;
  if (f.talking && lv > 0.03) {
    const rx = R * (0.11 + lv * 0.06);
    const ry = R * (0.035 + lv * 0.17);
    ellipse(c, 0, my, rx, ry);
    c.fill();
    c.save();
    ellipse(c, 0, my, rx, ry);
    c.clip();
    c.fillStyle = "#ff8a7a";
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
    // some puff out of the chimney
    const puff = excited && Math.random() < 0.3;
    const x = puff ? cx + R * 0.52 : cx + Math.cos(a) * R * 1.3;
    const y = puff ? cy - R * 1.0 : cy + Math.sin(a) * R * 1.1;
    f.sparks.push({ x, y, size: R * (0.06 + Math.random() * 0.08), life: 1, spin: Math.random() * TAU });
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
