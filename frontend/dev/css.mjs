// The build ships the CSS written in the sources as /* css */ `…` templates without its comments and
// spare spaces: it is a good part of what a tablet downloads, and none of it needs them.

/** CSS without comments, with one space where there were several and none where none is needed. */
export function minifyCss(css) {
  return squeeze(css).trim();
}

/** As minifyCss, but a space at either end stays (a piece of CSS between two ${…}). */
function squeeze(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/ ?([{};,>]) ?/g, "$1")
    .replace(/: /g, ":")
    .replace(/;}/g, "}");
}

/**
 * A module's source with each /* css *\/ template minified: the CSS between its ${…}, which are left
 * as they are (only simple ones, with no braces or backticks in them, are allowed).
 */
export function minifyCssTemplates(src) {
  return src.replace(/\/\* css \*\/ `((?:[^`\\$]|\$(?!\{)|\$\{[^{}`]*\})*)`/g, (_, css) => {
    const parts = css.split(/(\$\{[^{}`]*\})/);
    const out = parts.map((p, i) => (i % 2 ? p : squeeze(p))).join("");
    return `/* css */ \`${parts.length > 1 ? out : out.trim()}\``;
  });
}

/** An esbuild plugin that does it to the frontend's TypeScript as it is bundled. */
export const cssTemplates = {
  name: "css-templates",
  setup(build) {
    build.onLoad({ filter: /[\\/]src[\\/].*\.ts$/ }, async (args) => {
      const { readFile } = await import("node:fs/promises");
      const src = await readFile(args.path, "utf8");
      return src.includes("/* css */") ? { contents: minifyCssTemplates(src), loader: "ts" } : undefined;
    });
  },
};
