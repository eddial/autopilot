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
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto("file://" + path.resolve(file) + "?record");
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.DURATION);
const frame = page.locator(".frame");

const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", base + ".mp4"],
  { stdio: ["pipe", "inherit", "inherit"] });

for (let i = 0; i < duration * FPS; i++) {
  await page.evaluate((t) => window.seek(t), i / FPS);
  ff.stdin.write(await frame.screenshot({ type: "png" }));
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));

await page.evaluate((t) => window.seek(t), Number(posterAt));
await frame.screenshot({ path: base + ".png" });
await browser.close();
console.log("wrote", base + ".mp4");
