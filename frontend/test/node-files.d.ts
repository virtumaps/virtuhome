// The Node file functions the import tests use to read their fixtures (the project has no Node types).
declare module "node:fs" {
  export function readFileSync(path: URL, encoding: "utf8"): string;
  export function readFileSync(path: URL): Uint8Array;
}
