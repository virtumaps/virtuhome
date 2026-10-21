// Types for markdown.mjs, which the tests use.
export type Block =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "quote"; blocks: Block[] }
  | { type: "rule" }
  | { type: "list"; ordered: boolean; start: number; loose: boolean; items: Block[][] }
  | { type: "table"; align: string[]; head: string[]; rows: string[][] };
export interface Options {
  shift?: number;
  href?(url: string, kind: "link" | "image"): string;
  image?(url: string): string;
}
export function escapeHtml(s: string): string;
export function slug(text: string): string;
export function slugger(): (text: string) => string;
export function textOf(html: string): string;
export function parse(md: string): Block[];
export function inline(text: string, opts?: Options): string;
export function render(blocks: Block[], opts?: Options, tight?: boolean): string;
