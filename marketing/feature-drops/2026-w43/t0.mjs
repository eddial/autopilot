// Where each part starts on the video's clock, in page seconds: node t0.mjs page.html?query page.html ...
// Prints one line per part, "<t0> <spec>", so every clip can render its background on one continuous clock (?t0=).
import { createRequire } from "node:module"; import path from "node:path";
import { VIEWPORT, query } from "./format.mjs";
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const b = await chromium.launch(); const p = await b.newPage({ viewport: VIEWPORT });
let t0 = 0;
for (const spec of process.argv.slice(2)) {
  const [file, extra = ""] = spec.split("?");
  await p.goto("file://" + path.resolve(file) + query(extra));
  console.log(t0.toFixed(3), spec);
  t0 += await p.evaluate(() => window.DURATION);
}
await b.close();
