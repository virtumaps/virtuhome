// Prints the tour's lines in a language as the voice says them (script.ts and dev/lang, without cue
// markers, with sayAs applied), as one JSON array, for voice/make.py.
//   node dev/tour/lines.mjs [language] [--shown | --moods]
// English if left out; --shown: as the subtitles write them; --moods: [line, Pip's mood] pairs.
import * as esbuild from "esbuild";

const code = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "en";
const shown = process.argv.includes("--shown");
const moods = process.argv.includes("--moods");
const built = await esbuild.build({
  stdin: {
    contents: `export { chapters } from "./script"; export { load, spokenAs, cued } from "../lang";`,
    resolveDir: new URL(".", import.meta.url).pathname,
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  logLevel: "error",
});
const m = await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString("base64")}`);
const S = await m.load(code);
const said = (l) => (shown ? m.cued(l.say).text : m.spokenAs(S, m.cued(l.say).text));
console.log(JSON.stringify(m.chapters(S).flatMap((c) => c.lines.map((l) => (moods ? [said(l), l.mood ?? "neutral"] : said(l))))));
