// Screenshot a clip at given clip seconds, for review before rendering.
// Usage: node stills.mjs <clip.html> <outPrefix> <t> [t …]   (needs playwright)
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [file, out, ...ts] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto("file://" + path.resolve(file) + "?record");
await page.evaluate(() => document.fonts.ready);
for (const t of ts) {
  await page.evaluate((t) => window.seek(t), Number(t));
  await page.screenshot({ path: `${out}-${t}.png`, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
}
await browser.close();
console.log("wrote", ts.length, "stills");
