// Render a clip to MP4 with the app drawn as a flat plane: node render-plane.mjs <clip.html>
// Zooms and pans in a browser re-draw text at a new size every frame, which shimmers and wobbles. Here the app
// (the .app inside .stage) is drawn on its own at a fixed size and high density each frame, and composite.py moves
// that image (scale and position from window.LAYOUT) between the background layer (paper and window frame) and
// the top layer (captions, titles, cursor). Every layer is drawn at 2x and the result scaled down, so edges are
// smooth too. Pages without a stage (cards) are drawn at 2x and scaled down.
// Env as render.mjs: CLIP_SIZE, CLIP_FPS, CLIP_QUERY, CLIP_OUT, CLIP_SPEED (default 0.85). SOUND_PY: a python with
// numpy and opencv (cv2). CLIP_PLANE: the app's pixel density (default 3, enough for a 1.5x zoom).
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FPS, SCALE, OUT_W, OUT_H, VIEWPORT, query as pageQuery } from "./format.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const [file] = process.argv.slice(2);
const out = process.env.CLIP_OUT ? path.resolve(process.env.CLIP_OUT) : path.resolve(file).replace(/\.html$/, ".mp4");
const url = "file://" + path.resolve(file) + pageQuery(process.env.CLIP_QUERY ? String(new URLSearchParams(process.env.CLIP_QUERY)) : "");
// Layers are drawn at 2x the layout (Q) whatever the output size, then scaled down to it.
const Q = 2, PD = Number(process.env.CLIP_PLANE) || 3;

const browser = await chromium.launch();
const main = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: Q });
await main.goto(url); await main.evaluate(() => document.fonts.ready);
const flat = !(await main.evaluate(() => !!(window.LAYOUT && window.LAYOUT())));
let plane = null;
if (!flat) {
  const appH = await main.evaluate(() => C.APP_H);
  plane = await browser.newPage({ viewport: { width: 1280, height: appH }, deviceScaleFactor: PD });
  await plane.goto(url); await plane.evaluate(() => document.fonts.ready);
  await plane.evaluate(() => document.documentElement.classList.add("L-plane"));
}
const duration = Number(process.env.CLIP_UNTIL) || await main.evaluate(() => window.DURATION);
const py = spawn(process.env.SOUND_PY || "python3", [path.join(here, "composite.py"), String(OUT_W), String(OUT_H), String(FPS), out, String(Q), String(PD)],
  { stdio: ["pipe", "inherit", "inherit"] });
const send = (meta, bufs) => new Promise((res) => {
  const m = Buffer.from(JSON.stringify({ ...meta, sizes: bufs.map((b) => b.length) }));
  const h = Buffer.alloc(4); h.writeUInt32BE(m.length);
  if (py.stdin.write(Buffer.concat([h, m, ...bufs]))) res(); else py.stdin.once("drain", res);
});
const cls = (c) => main.evaluate((c) => { const h = document.documentElement; h.classList.remove("L-under", "L-over"); if (c) h.classList.add(c); }, c);
const speed = Number(process.env.CLIP_SPEED) || 0.85;
const n = Math.ceil((duration / speed) * FPS);
for (let i = 0; i < n; i++) {
  const t = (i / FPS) * speed;
  if (flat) {
    await main.evaluate((t) => window.seek(t), t);
    await send({ kind: "flat" }, [await main.screenshot({ type: "png" })]);
    continue;
  }
  await Promise.all([main.evaluate((t) => window.seek(t), t), plane.evaluate((t) => window.seek(t), t)]);
  const lay = await main.evaluate(() => window.LAYOUT());
  await cls("L-under"); const under = await main.screenshot({ type: "jpeg", quality: 94 });
  await cls("L-over"); const over = await main.screenshot({ type: "png", omitBackground: true });
  await cls("");
  const app = await plane.screenshot({ type: "png", fullPage: false });
  await send({ kind: "plane", lay }, [under, over, app]);
  if (i % 150 === 0) console.error(`${path.basename(out)} ${i}/${n}`);
}
py.stdin.end();
await new Promise((r) => py.on("close", r));
await browser.close();
console.log(`wrote ${out} ${OUT_W}x${OUT_H} @ ${FPS} fps (plane)`);
