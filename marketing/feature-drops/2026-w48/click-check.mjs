// At every click cue, the element under the cursor's tip (document.elementFromPoint), to check each click lands on
// its target. Usage: node click-check.mjs <clip.html> [...]
import { createRequire } from "node:module";
import path from "node:path";
import { VIEWPORT, query } from "./format.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
for (const file of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto("file://" + path.resolve(file) + query(process.env.CLIP_QUERY || ""));
  await page.evaluate(() => document.fonts.ready);
  const clicks = await page.evaluate(() => window.CUES().filter((c) => c.kind === "click").map((c) => c.t));
  for (const t of clicks) {
    const hit = await page.evaluate((t) => {
      window.seek(t + 0.01);
      const cur = document.querySelector(".cursor"), svg = cur.querySelector("svg").getBoundingClientRect();
      const x = svg.left + svg.width * (3 / 24), y = svg.top + svg.height * (2 / 24);
      cur.style.display = "none"; const el = document.elementFromPoint(x, y); cur.style.display = "";
      const d = (e) => e ? `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.className && typeof e.className === "string" ? "." + e.className.split(" ").join(".") : ""}` : "none";
      return `${d(el)} < ${d(el && el.parentElement)} "${(el && el.textContent || "").trim().slice(0, 40)}"`;
    }, t);
    console.log(`${path.basename(file)} ${t.toFixed(2)}s  ${hit}`);
  }
  await page.close();
}
await browser.close();
