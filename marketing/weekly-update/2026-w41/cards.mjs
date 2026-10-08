// Screenshot every .frame in a cards HTML (cover, slides, end) to <prefix>-1.png, <prefix>-2.png, ...
// Usage: node cards.mjs <cards.html> <prefix>   Format from format.mjs (CLIP_SIZE), as render.mjs.
import { createRequire } from "node:module"; import path from "node:path";
import { SCALE, VIEWPORT, query } from "./format.mjs";
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const [file, prefix] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
await p.goto("file://" + path.resolve(file) + query()); await p.evaluate(() => document.fonts.ready); await p.waitForLoadState("networkidle");
const frames = p.locator(".frame"), n = await frames.count();
for (let i = 0; i < n; i++) await frames.nth(i).screenshot({ path: `${prefix}-${i + 1}.png` });
await b.close(); console.log("wrote", n, "cards");
