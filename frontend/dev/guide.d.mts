// Types for guide.mjs, which the tests use.
export type Section = [title: string, part: string, url: string, text: string];
export function fold(s: string): string;
export function wordsOf(q: string): string[];
export function find(index: Section[], query: string): Section[];
export function snippet(text: string, words: string[], size?: number): [text: string, marked: boolean][];
export function foundText(n: number): string;
