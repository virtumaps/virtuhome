// Plays the tour from the local preview (preview.mjs) with its recorded voice, the sound muted, logs when
// every line and chapter starts, screenshots the moments asked for, and reports the page's errors.
//   node dev/tour/review.mjs <outdir> [width] [height] ["name=words in the line+ms after,..."]
// e.g. node dev/tour/review.mjs /tmp/tour 1440 810 "clip=a parcel+3000,end=Thanks+1500"
// END_WAIT=<ms> waits that long on the end card before its picture. Uses your local Chrome.
import { chromium } from "playwright-core";
const [OUT, W = "1440", H = "810", SHOTS = ""] = process.argv.slice(2);
const want = SHOTS ? SHOTS.split(",").map((s) => { const [n, rest] = s.split("="); const [text, delay] = rest.split("+"); return { n, text, delay: Number(delay ?? 1200), done: false }; }) : [];
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--mute-audio"] });
const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto("http://127.0.0.1:5181/virtuhome/demo/?tour");
await page.waitForTimeout(3500);
const box = await page.evaluate(() => { const b = document.getElementById("vh-tour").shadowRoot.querySelector(".start").getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; });
await page.mouse.click(box[0], box[1]);
const t0 = Date.now();
let lastLine = "", lastTitle = "";
const timeline = [];
const pending = [];
while (true) {
  const st = await page.evaluate(() => { const r = document.getElementById("vh-tour")?.shadowRoot; return r ? { line: r.querySelector(".subs.show .say")?.textContent ?? "", title: r.querySelector(".big .t")?.textContent ?? "", end: !!r.querySelector(".outro.show") } : { end: true }; });
  const t = ((Date.now() - t0) / 1000).toFixed(1);
  if (st.title && st.title !== lastTitle) { timeline.push(`${t.padStart(6)}  == ${st.title}`); lastTitle = st.title; }
  if (st.line && st.line !== lastLine) {
    timeline.push(`${t.padStart(6)}  ${st.line}`);
    lastLine = st.line;
    for (const w of want) if (!w.done && st.line.includes(w.text)) { w.done = true; pending.push({ ...w, at: Date.now() + w.delay }); }
  }
  for (const p of pending.filter((p) => p.at <= Date.now())) { await page.screenshot({ path: `${OUT}/${p.n}.png` }); pending.splice(pending.indexOf(p), 1); }
  if (st.end || Date.now() - t0 > 300000) break;
  await page.waitForTimeout(100);
}
timeline.push(`${((Date.now() - t0) / 1000).toFixed(1).padStart(6)}  == end card`);
await page.waitForTimeout(Number(process.env.END_WAIT ?? 900));
await page.screenshot({ path: `${OUT}/end.png` });
console.log(timeline.join("\n"));
console.log(JSON.stringify(logs.slice(0, 10)));
await browser.close();
