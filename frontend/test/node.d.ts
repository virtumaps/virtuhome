// The little of Node the tests use (the project carries no Node types).
declare module "node:fs" {
  export function readFileSync(path: URL): Uint8Array;
  export function readdirSync(path: URL): string[];
}
declare module "node:zlib" {
  export function inflateSync(data: Uint8Array): Uint8Array;
}
