// Serves the dev harness on http://127.0.0.1:5173 (localhost only: the live mode hands the page a token).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import * as esbuild from "esbuild";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".map": "application/json" };
const devDir = new URL(".", import.meta.url).pathname;

export async function startDevServer(outDir, port = 5173, fast = process.argv.includes("--fast")) {
  const ctx = await esbuild.context({
    entryPoints: { main: join(devDir, "main.ts"), "roomfind-worker": join(devDir, "../src/editor/roomfind-worker.ts") },
    outdir: join(devDir, "out"),
    bundle: true,
    format: "esm",
    target: ["es2020", "chrome87", "safari15"],
    sourcemap: fast ? false : "inline",
    minify: fast,
    external: ["/dev/local.env.js"],
    define: { __VERSION__: '"dev"', __DEV__: "true" },
    logLevel: "info",
  });
  await ctx.watch();
  createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    if (url.pathname === "/dev/local.env.js") {
      // live mode: Home Assistant URL and token from the environment, never from a file in the repo
      if (!process.env.HA_URL || !process.env.HA_TOKEN) {
        res.writeHead(404);
        return res.end("set HA_URL and HA_TOKEN in the environment of the dev server");
      }
      res.writeHead(200, { "content-type": "text/javascript", "cache-control": "no-store" });
      return res.end(`export const HA_URL = ${JSON.stringify(process.env.HA_URL)};\nexport const HA_TOKEN = ${JSON.stringify(process.env.HA_TOKEN)};\n`);
    }
    let path = url.pathname === "/" ? "/dev/index.html" : url.pathname;
    const file = path.startsWith("/dev/") ? join(devDir, normalize(path.slice(5))) : join(outDir, normalize(path));
    try {
      if (!(await stat(file)).isFile()) throw new Error();
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  }).listen(port, "127.0.0.1", () => console.log(`VirtuHome dev: http://127.0.0.1:${port}/`));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startDevServer(new URL("../../custom_components/virtuhome/frontend/", import.meta.url).pathname);
}
