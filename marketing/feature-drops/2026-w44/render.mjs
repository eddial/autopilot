// Render a clip HTML to an MP4 and a poster PNG; the poster is also the clip's thumbnail (thumbnail.sh).
// Usage: node render.mjs <clip.html> [posterSecond]
// Format from format.mjs: CLIP_SIZE (default 1080x1350), CLIP_FPS (default 60). Clips are encoded at CRF 12 (headroom for the final encode);
// CLIP_BITRATE is for the final video (combine.sh).
// Optional env: CLIP_QUERY (extra query string, e.g. "chapter=1 / 3"), CLIP_FROM and CLIP_UNTIL (clip seconds), CLIP_OUT (output .mp4 path),
// CLIP_SPEED (playback speed, default 0.85: everything a little slower than the timeline).
// Needs playwright (NODE_PATH or local node_modules) and ffmpeg on PATH.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FPS, SCALE, OUT_W, OUT_H, VIEWPORT, CLIP, query as pageQuery } from "./format.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [file, posterAt = "12"] = process.argv.slice(2);
const base = path.resolve(file).replace(/\.html$/, "");
const out = process.env.CLIP_OUT ? path.resolve(process.env.CLIP_OUT) : base + ".mp4";
const query = pageQuery(process.env.CLIP_QUERY ? String(new URLSearchParams(process.env.CLIP_QUERY)) : "");

const browser = await chromium.launch();
let page;
async function open() {
  if (page) await page.close().catch(() => {});
  page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });
  await page.goto("file://" + path.resolve(file) + query);
  await page.evaluate(() => document.fonts.ready);
}
await open();
const duration = Number(process.env.CLIP_UNTIL) || await page.evaluate(() => window.DURATION);
const clip = CLIP;

const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-vf", `scale=${OUT_W}:${OUT_H}:flags=lanczos`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "12", "-preset", "slow", "-movflags", "+faststart", out],
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
const from = Number(process.env.CLIP_FROM) || 0;
const speed = Number(process.env.CLIP_SPEED) || 0.85;
for (let i = Math.round((from / speed) * FPS); i < (duration / speed) * FPS; i++) ff.stdin.write(await frameAt((i / FPS) * speed));
ff.stdin.end();
await new Promise((r) => ff.on("close", r));

if (!process.env.CLIP_OUT) (await import("node:fs")).writeFileSync(base + ".png", await frameAt(Number(posterAt)));
await browser.close();
// The poster becomes the clip's thumbnail (embedded cover art).
if (!process.env.CLIP_OUT) await new Promise((r, j) => spawn(path.join(path.dirname(fileURLToPath(import.meta.url)), "thumbnail.sh"), [out, base + ".png"], { stdio: "inherit" })
  .on("close", (c) => (c ? j(new Error("thumbnail.sh failed")) : r())));
console.log("wrote", out, `${OUT_W}x${OUT_H} @ ${FPS} fps`);
