// Graphics tiers: how much a device can draw.
//   low      Fire-class tablets: the model look at 1x, no antialiasing, simpler shapes
//   medium   the model look, antialiased, sharp on high-density screens
//   high     the realistic look: textures, sun and soft shadows, tone mapping
//   ultra    high plus ambient occlusion, bloom, bigger textures and shadow maps
export type Tier = "low" | "medium" | "high" | "ultra";
export type TierSetting = Tier | "auto";

export const TIERS: Tier[] = ["low", "medium", "high", "ultra"];

export const TIER_NAMES: Record<Tier, string> = {
  low: "Tablet",
  medium: "Standard",
  high: "Realistic",
  ultra: "Ultra",
};

export const TIER_HINTS: Record<Tier, string> = {
  low: "Fastest, for wall tablets",
  medium: "Clean model look",
  high: "Textures, sunlight and shadows",
  ultra: "Adds soft shading and glow; needs a strong GPU",
};

/** Weak devices: Fire tablets, old Android, little memory or few cores. */
export function detectLowEnd(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (
    /Silk|KF[A-Z]{2,4}\b|; KF|Android [5-9]\b/.test(navigator.userAgent) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 3) ||
    (navigator.hardwareConcurrency || 8) <= 4
  );
}

let gpuCache: string | null = null;
/** The GPU's name as WebGL reports it ("" when hidden). */
export function gpuName(): string {
  if (gpuCache !== null) return gpuCache;
  try {
    const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    gpuCache = ext && gl ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    gpuCache = "";
  }
  return gpuCache;
}

/** The tier a device gets unless someone picks one. Ultra is never picked automatically. */
export function detectTier(): Tier {
  if (detectLowEnd()) return "low";
  const gpu = gpuName();
  const ua = navigator.userAgent;
  if (/SwiftShader|llvmpipe|softpipe|Software|Mali-[GT]?\d{2,3}\b|PowerVR|Adreno \(TM\) [3-5]\d\d/i.test(gpu)) return "low";
  const phone = /iPhone|Android.+Mobile|Mobile Safari/.test(ua) && Math.min(screen.width, screen.height) < 600;
  if (phone) return "medium";
  // older integrated graphics: the model look stays smooth
  if (/Intel.*(HD|UHD) Graphics/i.test(gpu) && !/Iris|Arc/i.test(gpu)) return "medium";
  if (/Android/.test(ua)) return "medium";
  return "high";
}

const STORAGE_KEY = "virtuhome.graphics";
const CAP_KEY = "virtuhome.graphics.cap";

/** Remembers that this device struggled above a tier, so automatic picks stay at or below it. */
export function capTier(t: Tier): void {
  try {
    localStorage.setItem(CAP_KEY, t);
  } catch {
    // not remembered
  }
}

/** Lets automatic picks go back up (after a "Try again" in Check my setup). */
export function clearCap(): void {
  try {
    localStorage.removeItem(CAP_KEY);
  } catch {
    // nothing kept
  }
}

/** Where Automatic stands on this device: what it would pick, the level it stepped down to, and whether WebGL runs without a GPU. */
export function autoTierInfo(): { detected: Tier; cap: Tier | null; software: boolean } {
  return { detected: detectTier(), cap: cap(), software: /SwiftShader|llvmpipe|softpipe|Software/i.test(gpuName()) };
}

function cap(): Tier | null {
  try {
    const v = localStorage.getItem(CAP_KEY);
    return v && (TIERS as string[]).includes(v) ? (v as Tier) : null;
  } catch {
    return null;
  }
}

/** This device's own pick (it wins over the card's setting), or "auto". */
export function deviceTier(): TierSetting {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && (TIERS as string[]).includes(v) ? (v as Tier) : "auto";
  } catch {
    return "auto";
  }
}

export function setDeviceTier(t: TierSetting): void {
  try {
    if (t === "auto") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // private mode: the pick lasts until the page reloads
  }
}

/** Card option values, including the ones older versions wrote ("high" was the antialiased model look). */
export function parseTierSetting(v: unknown): TierSetting {
  return typeof v === "string" && (TIERS as string[]).includes(v) ? (v as Tier) : "auto";
}

/** The tier to use: this device's pick, else the card's, else what the device can do. */
export function resolveTier(card: TierSetting): { tier: Tier; auto: boolean } {
  const dev = deviceTier();
  if (dev !== "auto") return { tier: dev, auto: false };
  if (card !== "auto") return { tier: card, auto: false };
  const detected = detectTier();
  const c = cap();
  return { tier: c && TIERS.indexOf(c) < TIERS.indexOf(detected) ? c : detected, auto: true };
}
