// Screenshot a clip at given clip seconds, for review before rendering.
// Usage: node stills.mjs <clip.html> <outPrefix> <t> [t …]   (needs playwright; format from format.mjs, CLIP_SIZE)
import { createRequire } from "node:module";
import path from "node:path";
import { VIEWPORT, CLIP, query } from "./format.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [file, out, ...ts] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
await page.goto("file://" + path.resolve(file) + query(process.env.CLIP_QUERY || ""));
await page.evaluate(() => document.fonts.ready);
for (const t of ts) {
  await page.evaluate((t) => window.seek(t), Number(t));
  await page.screenshot({ path: `${out}-${t}.png`, clip: CLIP });
}
await browser.close();
console.log("wrote", ts.length, "stills");
