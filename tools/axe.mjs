// axe-core on a Playwright page, for tools/a11y.mjs and the end-to-end test.
import { readFileSync } from "node:fs";

const AXE = readFileSync(new URL("../frontend/node_modules/axe-core/axe.min.js", import.meta.url), "utf8");

/** WCAG 2.2 A and AA, and target sizes. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Runs axe on the page, open shadow roots included. */
export async function axeRun(page) {
  if (!(await page.evaluate(() => "axe" in window))) await page.addScriptTag({ content: AXE });
  return page.evaluate((tags) => window.axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] }), TAGS);
}

/**
 * The serious and critical violations, one line each (all of them with `verbose`), and how many nodes
 * they are on; `ours` keeps only nodes whose path (through shadow roots) it matches.
 */
export function axeReport(result, verbose = false, ours = null) {
  const lines = [];
  let count = 0;
  const violations = result.violations
    .map((v) => ({ ...v, nodes: ours ? v.nodes.filter((n) => ours.test(n.target.flat().join(" "))) : v.nodes }))
    .filter((v) => v.nodes.length);
  for (const v of violations) {
    const bad = v.impact === "serious" || v.impact === "critical";
    if (bad) count += v.nodes.length;
    if (!bad && !verbose) continue;
    lines.push(`  ${v.impact}: ${v.id} (${v.nodes.length}) ${v.help}`);
    for (const n of v.nodes.slice(0, verbose ? 20 : 4)) lines.push(`    ${n.target.join(" >>> ")}${verbose ? `\n      ${n.failureSummary?.replace(/\n/g, "\n      ")}` : ""}`);
  }
  return { lines, count };
}
