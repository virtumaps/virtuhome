// Runs the room finder in its worker. The worker's script is fetched only when rooms are looked for,
// so nobody else downloads it.
import type { FindInput, FindResult } from "./roomfind";

declare const __VERSION__: string;

const workerUrl = () => new URL(`./roomfind-worker.js?v=${typeof __VERSION__ === "string" ? __VERSION__ : "dev"}`, import.meta.url);

/** Finds the rooms off the page's thread. The picture's pixels are handed over (`input.grey` is emptied). */
export function findRoomsAside(input: FindInput, signal?: AbortSignal): Promise<FindResult> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(workerUrl(), { type: "module" });
    } catch {
      reject(new Error("This browser can't look for rooms."));
      return;
    }
    const done = () => {
      worker.terminate();
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      done();
      reject(new DOMException("Stopped", "AbortError"));
    };
    if (signal?.aborted) return abort();
    signal?.addEventListener("abort", abort);
    worker.onmessage = (e: MessageEvent<{ ok: boolean; result?: FindResult; error?: string }>) => {
      done();
      if (e.data.ok && e.data.result) resolve(e.data.result);
      else reject(new Error(e.data.error || "Looking for rooms went wrong."));
    };
    worker.onerror = (e) => {
      done();
      e.preventDefault?.();
      reject(new Error("Looking for rooms went wrong."));
    };
    worker.postMessage(input, [input.grey.buffer]);
  });
}
