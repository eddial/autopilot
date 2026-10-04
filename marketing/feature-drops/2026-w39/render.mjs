// Render a clip HTML to a 4:5 MP4 (1080x1350, 30 fps) and a poster PNG.
// Usage: node render.mjs <clip.html> [posterSecond]
// Needs playwright (NODE_PATH or local node_modules) and ffmpeg on PATH.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const FPS = 30;
const [file, posterAt = "12"] = process.argv.slice(2);
const base = path.resolve(file).replace(/\.html$/, "");

const browser = await chromium.launch();
let page;
async function open() {
  if (page) await page.close().catch(() => {});
  page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto("file://" + path.resolve(file) + "?record");
  await page.evaluate(() => document.fonts.ready);
}
await open();
const duration = await page.evaluate(() => window.DURATION);
const clip = { x: 0, y: 0, width: 1080, height: 1350 };

const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", base + ".mp4"],
  { stdio: ["pipe", "inherit", "inherit"] });

// Headless Chromium occasionally stalls on a screenshot: retry the frame, on a fresh page if needed.
async function frameAt(t) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await page.evaluate((t) => window.seek(t), t);
      return await page.screenshot({ type: "png", clip, timeout: 8000 });
    } catch (e) {
      console.error(`frame ${t.toFixed(2)}s attempt ${attempt + 1} failed: ${e.message.split("\n")[0]}`);
      if (attempt >= 1) await open();
    }
  }
  throw new Error("frame failed: " + t);
}
for (let i = 0; i < duration * FPS; i++) ff.stdin.write(await frameAt(i / FPS));
ff.stdin.end();
await new Promise((r) => ff.on("close", r));

(await import("node:fs")).writeFileSync(base + ".png", await frameAt(Number(posterAt)));
await browser.close();
console.log("wrote", base + ".mp4");
