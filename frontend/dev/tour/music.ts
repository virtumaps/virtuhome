// Music for the online demo's tour, played by the browser as it goes (Web Audio): no recording to
// download or license. An upbeat loop at 104 bpm over four chords (B minor, G, D, A): a warm pad, a
// plucked arpeggio, a bass and soft drums, coming in chapter by chapter. It dips under the host's
// voice, swells with a chime at each new chapter, and ends on a held chord.

const BPM = 104;
const BEAT = 60 / BPM;
const STEP = BEAT / 4;
/** How loud the music is overall, and how far it dips while the host speaks. */
const LEVEL = 0.85;
const DUCKED = 0.42;

// a bar each, MIDI notes: B minor, G, D, A
const CHORDS = [[59, 62, 66], [55, 59, 62], [62, 66, 69], [57, 61, 64]];
const ROOTS = [35, 31, 38, 33];
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

export class Music {
  private ctx: AudioContext | null = null;
  private out!: GainNode;
  private duckGain!: GainNode;
  private bus!: GainNode;
  private verb!: GainNode;
  private echo!: GainNode;
  private noise!: AudioBuffer;
  private timer = 0;
  private next = 0;
  private step = 0;
  /** Which parts play: 0 the pad, 1 and the arpeggio, 2 and bass and kick, 3 and the hats and claps. */
  private parts = 0;
  private ending = false;
  private muted = false;

  /** Starts it, from a tap or click (a browser lets sound start only then), or with a context made in one. */
  start(given?: AudioContext | null): void {
    if (this.ctx) {
      void this.ctx.resume();
      this.ending = false;
      this.out.gain.cancelScheduledValues(this.ctx.currentTime);
      this.out.gain.setTargetAtTime(this.muted ? 0 : LEVEL, this.ctx.currentTime, 0.3);
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!given && !AC) return;
    const ctx = given ?? new AC();
    this.ctx = ctx;
    void ctx.resume();

    // master: a gentle compressor so the parts sit together, then the volume
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 4;
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.gain.setTargetAtTime(this.muted ? 0 : LEVEL, ctx.currentTime, 0.8);
    comp.connect(this.out).connect(ctx.destination);
    this.duckGain = ctx.createGain();
    this.duckGain.connect(comp);
    this.bus = ctx.createGain();
    this.bus.connect(this.duckGain);

    // a room: reverb from a burst of decaying noise
    const len = Math.floor(ctx.sampleRate * 2.6);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    this.verb = ctx.createGain();
    this.verb.gain.value = 0.5;
    this.verb.connect(conv).connect(this.duckGain);

    // an echo on the arpeggio, three sixteenths behind
    const delay = ctx.createDelay(2);
    delay.delayTime.value = STEP * 3;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2800;
    this.echo = ctx.createGain();
    this.echo.gain.value = 0.3;
    this.echo.connect(delay);
    delay.connect(tone).connect(fb).connect(delay);
    tone.connect(this.duckGain);

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const n = this.noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;

    this.next = ctx.currentTime + 0.1;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  /** A new chapter: more of the band (by how far through the tour it is), a swell and a chime. */
  section(index: number, total: number): void {
    this.parts = index === 0 ? 1 : index === 1 ? 2 : 3;
    if (index === total - 1) this.parts = 3;
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    this.riser(t, 1.3);
    this.chime(t + 1.25, 86);
  }

  /** The host is speaking: the music steps back. */
  duck(on: boolean): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.duckGain.gain.cancelScheduledValues(ctx.currentTime);
    this.duckGain.gain.setTargetAtTime(on ? DUCKED : 1, ctx.currentTime, on ? 0.08 : 0.35);
  }

  /** The end: the drums stop, a last D major chord and a chime ring out, then it fades away. */
  finish(): void {
    const ctx = this.ctx;
    if (!ctx || this.ending) return;
    this.ending = true;
    const t = ctx.currentTime + 0.05;
    this.duck(false);
    for (const m of [50, 62, 66, 69, 74]) this.pad(t, m, 7, 0.06);
    this.bass(t, 38, 3);
    this.chime(t, 86);
    this.chime(t + 0.18, 90);
    this.out.gain.setTargetAtTime(0, t + 4, 1.4);
  }

  /**
   * The host's recorded voice, played through the same audio so the mouth can follow it: its level
   * meter, or null when it plays straight (no audio running yet).
   */
  voice(el: HTMLMediaElement): AnalyserNode | null {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return null;
    try {
      const src = ctx.createMediaElementSource(el);
      const meter = ctx.createAnalyser();
      meter.fftSize = 1024;
      src.connect(meter).connect(ctx.destination);
      return meter;
    } catch {
      return null;
    }
  }

  pause(on: boolean): void {
    if (!this.ctx) return;
    void (on ? this.ctx.suspend() : this.ctx.resume());
  }

  mute(on: boolean): void {
    this.muted = on;
    if (this.ctx) this.out.gain.setTargetAtTime(on || this.ending ? 0 : LEVEL, this.ctx.currentTime, 0.1);
  }

  stop(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.out.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    window.clearInterval(this.timer);
    this.ctx = null;
    window.setTimeout(() => void ctx.close(), 700);
  }

  // ---------------------------------------------------------------- the band

  /** Schedules the sixteenths due in the next moment (a look-ahead, so timers' jitter doesn't show). */
  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.next < ctx.currentTime + 0.12) {
      if (!this.ending) this.play(this.step, this.next);
      this.next += STEP;
      this.step++;
    }
  }

  private play(step: number, t: number): void {
    const bar = Math.floor(step / 16) % 4;
    const s = step % 16;
    const chord = CHORDS[bar];
    if (s === 0) for (const m of chord) this.pad(t, m, BEAT * 4, 0.035);
    if (this.parts >= 1 && s % 2 === 0) {
      const up = [0, 1, 2, 1, 2, 0, 1, 2][s / 2];
      this.pluck(t, chord[up] + (s >= 8 && s % 4 === 0 ? 24 : 12));
    }
    if (this.parts >= 2) {
      if ([0, 6, 8, 14].includes(s)) this.bass(t, ROOTS[bar], STEP * 2.5);
      if (s % 4 === 0) this.kick(t);
    }
    if (this.parts >= 3) {
      if (s % 4 === 2) this.hat(t, 0.05);
      if (s % 2 === 1) this.hat(t, 0.015);
      if (s === 4 || s === 12) this.clap(t);
    }
  }

  private env(t: number, peak: number, attack: number, hold: number, release: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    return g;
  }

  private osc(type: OscillatorType, freq: number, t: number, end: number, to: AudioNode, detune = 0): void {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(to);
    o.start(t);
    o.stop(end);
  }

  private pad(t: number, midi: number, length: number, peak: number): void {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(700, t);
    f.frequency.linearRampToValueAtTime(1600, t + length * 0.5);
    f.frequency.linearRampToValueAtTime(900, t + length);
    const g = this.env(t, peak, 0.5, Math.max(0, length - 0.6), 1.2);
    f.connect(g);
    g.connect(this.bus);
    g.connect(this.verb);
    for (const d of [-8, 8]) this.osc("sawtooth", hz(midi), t, t + length + 1.4, f, d);
  }

  private pluck(t: number, midi: number): void {
    const g = this.env(t, 0.07, 0.004, 0, 0.32);
    g.connect(this.bus);
    g.connect(this.echo);
    this.osc("triangle", hz(midi), t, t + 0.4, g);
  }

  private bass(t: number, midi: number, length: number): void {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 420;
    const g = this.env(t, 0.22, 0.01, length * 0.5, length * 0.6);
    f.connect(g).connect(this.bus);
    this.osc("triangle", hz(midi), t, t + length + 0.2, f);
    this.osc("sine", hz(midi - 12), t, t + length + 0.2, f);
  }

  private kick(t: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = this.env(t, 0.5, 0.003, 0, 0.28);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 0.35);
  }

  private hiss(t: number, length: number, filter: BiquadFilterType, freq: number, peak: number, q = 0.7): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.env(t, peak, 0.002, 0, length);
    src.connect(f).connect(g).connect(this.bus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + length + 0.05);
  }

  private hat(t: number, peak: number): void {
    this.hiss(t, 0.05, "highpass", 8000, peak);
  }

  private clap(t: number): void {
    this.hiss(t, 0.16, "bandpass", 1600, 0.09, 0.8);
    this.hiss(t + 0.012, 0.12, "bandpass", 1600, 0.06, 0.8);
  }

  /** Noise rising in pitch and volume, into the new chapter. */
  private riser(t: number, length: number): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 2;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(5000, t + length);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + length * 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.15);
    src.connect(f).connect(g);
    g.connect(this.bus);
    g.connect(this.verb);
    src.start(t);
    src.stop(t + length + 0.2);
  }

  /** A bell: a few out-of-tune partials, ringing in the room. */
  private chime(t: number, midi: number): void {
    const f0 = hz(midi);
    for (const [k, peak, decay] of [[1, 0.06, 1.8], [2.76, 0.025, 1.1], [5.4, 0.012, 0.6]]) {
      const g = this.env(t, peak, 0.004, 0, decay);
      g.connect(this.bus);
      g.connect(this.verb);
      this.osc("sine", f0 * k, t, t + decay + 0.1, g);
    }
  }
}
