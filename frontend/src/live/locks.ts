// Smart locks on their doors: what a lock's badge shows, and what a tap on it may do.
import type { HassEntity } from "./hass";

/** What a lock's badge says: locked, unlocked, opened (the latch pulled), moving, jammed, gone, or a problem. */
export type LockKind = "locked" | "unlocked" | "open" | "moving" | "jammed" | "unavailable" | "problem";

/**
 * A lock's state, and its door's: a door that is open while its lock says locked (a deadbolt thrown
 * with the door open) is a problem.
 */
export function lockKind(s: HassEntity | undefined, doorOpen: number | null): LockKind {
  if (!s || s.state === "unavailable" || s.state === "unknown") return "unavailable";
  switch (s.state) {
    case "jammed": return "jammed";
    case "locking": case "unlocking": case "opening": return "moving";
    case "open": return "open";
    case "locked": return doorOpen !== null && doorOpen > 0.5 ? "problem" : "locked";
    default: return "unlocked";
  }
}

/** Locks that can pull the latch back too (Home Assistant's LockEntityFeature.OPEN). */
export const canOpen = (s: HassEntity | undefined): boolean => ((Number(s?.attributes.supported_features) || 0) & 1) === 1;

/** Locks that ask for a code to lock or unlock (their code_format is a pattern the code must match). */
export const needsCode = (s: HassEntity | undefined): boolean => typeof s?.attributes.code_format === "string" && s.attributes.code_format !== "";

/** What a tap offers: lock while unlocked or open, unlock while locked, both while jammed or a problem; open where it can. */
export function lockActions(s: HassEntity | undefined, kind: LockKind): ("lock" | "unlock" | "open")[] {
  if (kind === "unavailable" || kind === "moving") return [];
  const out: ("lock" | "unlock" | "open")[] = kind === "locked" ? ["unlock"] : kind === "jammed" || kind === "problem" ? ["unlock", "lock"] : ["lock"];
  if (canOpen(s)) out.push("open");
  return out;
}
