// Prints the tour's lines as the voice says them (script.ts, with SAY_AS applied), as one JSON array,
// for voice/make.py.
import * as esbuild from "esbuild";

const built = await esbuild.build({
  entryPoints: [new URL("./script.ts", import.meta.url).pathname],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  logLevel: "error",
});
const script = await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString("base64")}`);
const spoken = (text) => script.SAY_AS.reduce((t, [word, as]) => t.replace(word, as), text);
console.log(JSON.stringify(script.CHAPTERS.flatMap((c) => c.lines.map((l) => spoken(l.say)))));
