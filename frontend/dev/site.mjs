// Builds the static site GitHub Pages serves (.github/workflows/pages.yml):
//   site/             the user guide, a page per part of docs/GUIDE.md (dev/guide-site.mjs)
//   site/<minor>/     the guide of the minor release before it (0.10/ beside 0.11.0), from its tag
//   site/demo/        the online demo: the demo house with pretend states (dev/demo.ts)
// `npm run site` (or `node dev/site.mjs [out]`); `--serve` then shows it on
// http://127.0.0.1:5180/virtuhome/, as Pages does. It fails if the harness's live mode, or anything
// that handles a Home Assistant address or token, ends up in the demo, or if a link in the guide
// leads nowhere.
import * as esbuild from "esbuild";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { basename, dirname, extname, join, normalize, resolve } from "node:path";
import { currentVersion, guideSite, previousMinor, readRelease } from "./guide-site.mjs";

const dev = new URL(".", import.meta.url).pathname;
const frontend = join(dev, "..");

/** Text that must never be in the published demo. */
export const FORBIDDEN = [
  "HA_URL", "HA_TOKEN", // what the dev server hands the live mode
  "local.env", // the module that carries them
  "access_token", "auth_required", "auth_invalid", // signing in to Home Assistant over its WebSocket
  "hass=live",
  "virtuhome-dev-plan", // the harness's pretend save
];
/** Sources that must never be bundled into it. */
export const FORBIDDEN_SOURCES = [/home-assistant-js-websocket/, /(^|\/)dev\/main\.ts$/, /(^|\/)dev\/server\.mjs$/];

/** Whatever in a build could reach a Home Assistant, one line each (none: the build is fine). */
export function liveCode(files, sources) {
  const problems = [];
  for (const s of sources) if (FORBIDDEN_SOURCES.some((re) => re.test(s))) problems.push(`bundles ${s}`);
  for (const f of files) for (const word of FORBIDDEN) if (f.text.includes(word)) problems.push(`${f.name} contains "${word}"`);
  return problems;
}

/** A page's script built as the site has it, in memory: its files, the chunks it starts with, and its problems. */
export async function bundle(entry = "dev/demo.ts") {
  const version = JSON.parse(readFileSync(join(frontend, "../custom_components/virtuhome/manifest.json"), "utf8")).version;
  const res = await esbuild.build({
    absWorkingDir: frontend,
    entryPoints: { demo: entry },
    outdir: join(dev, "out/site"),
    write: false,
    bundle: true,
    format: "esm",
    // the editor and the realistic look stay out of the first download
    splitting: true,
    chunkNames: "chunk-[hash]",
    target: ["es2020", "chrome87", "safari15"],
    minify: true,
    legalComments: "none",
    metafile: true,
    // left out rather than failing to resolve, so the check below names it
    external: ["/dev/local.env.js"],
    define: { __VERSION__: JSON.stringify(version), __DEV__: "false" },
    logLevel: "warning",
  });
  const files = res.outputFiles.map((f) => ({ name: basename(f.path), text: f.text }));
  const start = Object.values(res.metafile.outputs).find((o) => o.entryPoint === entry);
  const preload = start.imports.filter((i) => i.kind === "import-statement").map((i) => basename(i.path));
  return { files, preload, problems: liveCode(files, Object.keys(res.metafile.inputs)) };
}

/** The demo's page: the chunks it starts with load alongside its script, not one round trip after it. */
export function demoPage(preload) {
  const links = preload.map((f) => `  <link rel="modulepreload" href="${f}" />\n`).join("");
  return readFileSync(join(dev, "demo.html"), "utf8").replace("</head>", `${links}</head>`);
}

export async function buildSite(out) {
  const { files, preload, problems } = await bundle();
  const pages = [{ name: "demo/index.html", text: demoPage(preload) }];
  problems.push(...liveCode(pages, []));
  if (problems.length) throw new Error(`The site must not reach a Home Assistant:\n  ${problems.join("\n  ")}`);
  const version = currentVersion();
  const before = previousMinor(version);
  const md = before && readRelease(before)("docs/GUIDE.md");
  const minor = before?.replace(/\.\d+$/, "");
  const guide = guideSite({ version, older: md ? [{ version: before, href: `${minor}/` }] : [] });
  if (guide.problems.length) throw new Error(`Links in docs/GUIDE.md lead nowhere:\n  ${guide.problems.join("\n  ")}`);
  let older = [];
  if (md) {
    const newest = { version, href: "../", anchors: guide.anchors };
    const old = guideSite({ md: md.toString("utf8"), version: before, read: readRelease(before), root: "../", newest });
    // a released guide can't be changed any more: what it gets wrong is only reported
    for (const p of old.problems) console.warn(`The ${before} guide: ${p}`);
    older = old.files.map((f) => ({ ...f, name: `${minor}/${f.name}` }));
  } else {
    console.warn(`No guide of a release before ${version} to publish beside it (are the tags fetched?)`);
  }
  const all = [...guide.files, ...older, ...pages, ...files.map((f) => ({ name: `demo/${f.name}`, text: f.text }))];
  rmSync(out, { recursive: true, force: true });
  for (const f of all) {
    mkdirSync(dirname(join(out, f.name)), { recursive: true });
    writeFileSync(join(out, f.name), f.data ?? f.text);
  }
  return all.map((f) => ({ name: f.name, bytes: f.data?.length ?? Buffer.byteLength(f.text) }));
}

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".jpg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm",
};

/** Serves the built site under /virtuhome/, as GitHub Pages does, on this computer only. */
export function serveSite(out, port = 5180) {
  createServer(async (req, res) => {
    let path;
    try {
      path = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname));
    } catch {
      path = "";
    }
    if (!path.startsWith("/virtuhome/")) {
      res.writeHead(302, { location: "/virtuhome/" });
      return res.end();
    }
    let file = join(out, path.slice("/virtuhome".length));
    if ((await stat(file).catch(() => null))?.isDirectory()) {
      if (!path.endsWith("/")) {
        res.writeHead(301, { location: `${path}/` });
        return res.end();
      }
      file = join(file, "index.html");
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("Not found");
    }
  }).listen(port, "127.0.0.1", () => console.log(`Site: http://127.0.0.1:${port}/virtuhome/`));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const serve = args.indexOf("--serve");
  const port = serve >= 0 && /^\d+$/.test(args[serve + 1] ?? "") ? Number(args.splice(serve + 1, 1)[0]) : undefined;
  const out = resolve(args.find((a) => !a.startsWith("--")) ?? join(frontend, "../site"));
  try {
    for (const f of await buildSite(out)) console.log(`  ${f.name.padEnd(40)} ${(f.bytes / 1024).toFixed(0).padStart(5)} KB`);
    console.log(`Site built in ${out}`);
  } catch (err) {
    console.error(String(err?.message ?? err));
    process.exit(1);
  }
  if (serve >= 0) serveSite(out, port);
}
