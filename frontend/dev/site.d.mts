// Types for site.mjs, which the tests use.
export const FORBIDDEN: string[];
export const FORBIDDEN_SOURCES: RegExp[];
export function liveCode(files: { name: string; text: string }[], sources: string[]): string[];
export function bundle(entry?: string): Promise<{ files: { name: string; text: string }[]; preload: string[]; problems: string[] }>;
export function demoPage(preload: string[]): string;
export function buildSite(out: string): Promise<{ name: string; bytes: number }[]>;
export function serveSite(out: string, port?: number): void;
