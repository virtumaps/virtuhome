// Builds the frontend into custom_components/virtuhome/frontend:
//   virtuhome-loader.js  tiny, loaded on every Home Assistant page; defines the card and panel elements
//   app/*.js             the 3D engine and editor, fetched by the loader only where they are shown
// `node build.mjs --dev` rebuilds on change and serves the dev harness (dev/index.html) on :5173.
import * as esbuild from "esbuild";
import { readFileSync, rmSync } from "node:fs";

const dev = process.argv.includes("--dev");
// --dev --fast: the dev harness with minified code and no source maps (closer to what HA loads)
const fast = process.argv.includes("--fast");
// production builds ship inside the integration; dev builds stay out of git
const out = dev
  ? new URL("./dev/out/ha/", import.meta.url).pathname
  : new URL("../custom_components/virtuhome/frontend/", import.meta.url).pathname;
const version = JSON.parse(readFileSync(new URL("../custom_components/virtuhome/manifest.json", import.meta.url))).version;

const common = {
  bundle: true,
  format: "esm",
  target: ["es2020", "chrome87", "safari15"],
  minify: !dev || fast,
  sourcemap: dev && !fast ? "inline" : false,
  legalComments: "none",
  define: { __VERSION__: JSON.stringify(version), __DEV__: String(dev) },
  logLevel: "info",
};

const loader = { ...common, entryPoints: { "virtuhome-loader": "src/loader.ts" }, outdir: out };
const app = {
  ...common,
  entryPoints: { app: "src/app.ts" },
  outdir: out + "app",
  splitting: true,
  chunkNames: "chunk-[hash]",
};

if (dev) {
  const ctxs = await Promise.all([esbuild.context(loader), esbuild.context(app)]);
  await Promise.all(ctxs.map((c) => c.watch()));
  const { startDevServer } = await import("./dev/server.mjs");
  startDevServer(out);
} else {
  // old chunks would pile up next to the new ones
  rmSync(out + "app", { recursive: true, force: true });
  await Promise.all([esbuild.build(loader), esbuild.build(app)]);
}
