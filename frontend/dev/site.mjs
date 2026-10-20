// Builds the static site GitHub Pages serves (.github/workflows/pages.yml):
//   site/index.html   a front page; the root is left for the user guide
//   site/demo/        the online demo: the demo house with pretend states (dev/demo.ts)
// `npm run site` (or `node dev/site.mjs [out]`). It fails if the harness's live mode, or anything
// that handles a Home Assistant address or token, ends up in the files.
import * as esbuild from "esbuild";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

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
  const pages = [
    { name: "index.html", text: readFileSync(join(dev, "site-index.html"), "utf8") },
    { name: "demo/index.html", text: demoPage(preload) },
  ];
  problems.push(...liveCode(pages, []));
  if (problems.length) throw new Error(`The site must not reach a Home Assistant:\n  ${problems.join("\n  ")}`);
  const all = [...pages, ...files.map((f) => ({ name: `demo/${f.name}`, text: f.text }))];
  rmSync(out, { recursive: true, force: true });
  for (const f of all) {
    mkdirSync(dirname(join(out, f.name)), { recursive: true });
    writeFileSync(join(out, f.name), f.text);
  }
  return all.map((f) => ({ name: f.name, bytes: Buffer.byteLength(f.text) }));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const out = resolve(process.argv[2] ?? join(frontend, "../site"));
  try {
    for (const f of await buildSite(out)) console.log(`  ${f.name.padEnd(28)} ${(f.bytes / 1024).toFixed(0).padStart(5)} KB`);
    console.log(`Site built in ${out}`);
  } catch (err) {
    console.error(String(err?.message ?? err));
    process.exit(1);
  }
}
