// Render carousel.html to a LinkedIn document carousel (PDF, 1080x1350 pages) and one PNG per page.
// Usage: node carousel.mjs   (needs playwright)
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto("file://" + path.resolve("carousel.html") + "?record");
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState("networkidle");
const frames = page.locator(".frame");
const n = await frames.count();
for (let i = 0; i < n; i++) await frames.nth(i).screenshot({ path: `carousel-${i + 1}.png`, timeout: 15000 });
await page.pdf({ path: "carousel.pdf", width: "1080px", height: "1350px", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log("wrote carousel.pdf and", n, "pages");
