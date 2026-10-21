// Errors the view carries on after, and keeping extensions' errors away from the core view.

/** An error the view carries on after (an extension's, a frame that failed once). */
export function logError(err: unknown, where: string): void {
  console.error(`VirtuHome error (${where})`, err);
}

/**
 * An extension's function the core calls (for each room or point: a room tint, a roof map). When
 * it throws the core gets `fallback`, and with `setAside` it isn't called again (a function called
 * thousands of times would throw thousands of times).
 */
export function isolate<A, B, R>(fn: (a: A, b: B) => R, fallback: R, where = "extension", setAside = true): (a: A, b: B) => R {
  let failed = false;
  return (a, b) => {
    if (failed) return fallback;
    try {
      return fn(a, b);
    } catch (err) {
      failed = setAside;
      logError(err, where);
      return fallback;
    }
  };
}

/** Calls each listener of an extension; one that throws stops neither the others nor the view. */
export function callEach<T>(listeners: Iterable<(value: T) => void>, value: T, where = "extension"): void {
  for (const cb of listeners) {
    try {
      cb(value);
    } catch (err) {
      logError(err, where);
    }
  }
}
