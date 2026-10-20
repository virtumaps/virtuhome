// The room finder's worker (built on its own as app/roomfind-worker.js): finding the rooms takes a
// second or so, which would stall the page if it ran there.
import { findRooms, type FindInput } from "./roomfind";

self.onmessage = (e: MessageEvent<FindInput>) => {
  try {
    postMessage({ ok: true, result: findRooms(e.data) });
  } catch (err) {
    postMessage({ ok: false, error: String((err as Error)?.message ?? err) });
  }
};
