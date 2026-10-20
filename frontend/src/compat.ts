// Small stand-ins for what the oldest supported browsers lack (frontend/browsers.json).

/** A deep copy of plain data (plans are JSON, so a JSON round trip copies them exactly). */
export function jsonClone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

// structuredClone came with Chrome 98 and Safari 15.4; the editor copies plans with it
const g = globalThis as { structuredClone?: unknown };
if (typeof g.structuredClone !== "function") g.structuredClone = jsonClone;
