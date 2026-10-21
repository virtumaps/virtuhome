// Types for guide-site.mjs, which the tests use.
import type { Block } from "./markdown.mjs";
export const SITE: string;
export const REPO: string;
export interface Part { id: string; file: string; title: string; heading?: Block; blocks: Block[] }
export function readGuide(): string;
export function currentVersion(): string;
export function parts(md: string): Part[];
export function anchors(parts: Part[]): Record<string, string>;
export function releaseTags(): string[];
export function previousMinor(version: string, tags?: string[]): string | null;
export function readRelease(version: string): (path: string) => Uint8Array | null;
export function imageSize(data: Uint8Array): { width: number; height: number } | null;
export function guideSite(opts?: {
  md?: string;
  version?: string;
  read?(path: string): Uint8Array | null;
  root?: string;
  older?: { version: string; href: string }[];
  newest?: { version: string; href: string; anchors: Record<string, string> } | null;
}): { files: { name: string; text?: string; data?: Uint8Array }[]; anchors: Record<string, string>; problems: string[] };
