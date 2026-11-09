// Types for png.mjs, for the tests.
export interface Pixels {
  width: number;
  height: number;
  /** Four bytes a pixel: red, green, blue, alpha. */
  data: Uint8Array;
}
export function readPng(buf: Uint8Array): Pixels;
export function writePng(pixels: Pixels): Uint8Array;
export function compare(expected: Pixels, actual: Pixels, threshold?: number): { ratio: number; differ: number; sized: boolean; diff: Pixels | null };
export function sideBySide(pics: Pixels[], gap?: number): Pixels;
