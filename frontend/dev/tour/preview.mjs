// A local preview of the online demo and its tour, rebuilt whenever a file changes: reload to see it.
//   node dev/tour/preview.mjs   then   http://127.0.0.1:5181/virtuhome/demo/?tour   (localhost only)
import * as esbuild from "esbuild";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join, normalize, extname } from "node:path";
const FRONT = new URL("../..", import.meta.url).pathname;
const OUT = join(FRONT, "dev/out/tour-preview/");
const version = JSON.parse(readFileSync(join(FRONT, "../custom_components/virtuhome/manifest.json"), "utf8")).version;
const ctx = await esbuild.context({
  absWorkingDir: FRONT, entryPoints: { demo: "dev/demo.ts" }, outdir: OUT, bundle: true, format: "esm", splitting: true,
  chunkNames: "chunk-[hash]", target: ["es2020", "chrome87", "safari15"], sourcemap: true, external: ["/dev/local.env.js"],
  define: { __VERSION__: JSON.stringify(version), __DEV__: "false", __NEWS__: "[]" }, logLevel: "warning",
  plugins: [{ name: "log", setup(b) { b.onEnd((r) => console.log(new Date().toLocaleTimeString(), r.errors.length ? `build failed (${r.errors.length})` : "rebuilt")); } }],
});
await ctx.watch();
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".map": "application/json", ".json": "application/json", ".mp3": "audio/mpeg", ".jpg": "image/jpeg" };
createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = null;
  if (path === "/virtuhome/demo/" || path === "/virtuhome/demo/index.html") file = join(FRONT, "dev/demo.html");
  else if (path === "/virtuhome/demo/og.jpg") file = join(FRONT, "dev/og.jpg");
  else if (path.startsWith("/virtuhome/demo/voice/")) file = join(FRONT, "dev/tour/voice", normalize(path.slice(22)));
  else if (path.startsWith("/virtuhome/demo/")) file = join(OUT, normalize(path.slice(16)));
  if (path.endsWith("/voice/voices.json") && !existsSync(file)) return res.end("{}");
  if (!file || !existsSync(file)) { res.writeHead(404); return res.end("not here in the preview"); }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
  res.end(readFileSync(file));
}).listen(5181, "127.0.0.1", () => console.log("preview: http://127.0.0.1:5181/virtuhome/demo/?tour"));
