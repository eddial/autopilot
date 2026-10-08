// Sound cues for a combined video, in output seconds: node cues.mjs out.json part part ... (the same parts, in the
// same order, as combine.sh: card.png:N or clip.html). Each clip page reports its cues (window.CUES, held time);
// they are divided by CLIP_SPEED and offset by the parts before them. Needs playwright and ffprobe.
import { createRequire } from "node:module"; import path from "node:path"; import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { VIEWPORT, query } from "./format.mjs";
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const [out, ...parts] = process.argv.slice(2);
const speed = Number(process.env.CLIP_SPEED) || 0.85;
const b = await chromium.launch(); const p = await b.newPage({ viewport: VIEWPORT });
let at = 0; const cues = [], marks = [];
for (const part of parts) {
  if (/\.png:/.test(part)) { marks.push({ kind: "card", t: at }); at += Number(part.split(":").pop()); continue; }
  const mp4 = part.replace(/\.html$/, ".mp4");
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]).toString());
  await p.goto("file://" + path.resolve(part) + query());
  const list = await p.evaluate(() => (window.CUES ? window.CUES() : []));
  marks.push({ kind: "chapter", t: at });
  for (const c of list) cues.push({ kind: c.kind, t: at + c.t / speed, end: c.end === undefined ? undefined : at + c.end / speed });
  at += dur;
}
await b.close();
fs.writeFileSync(out, JSON.stringify({ duration: at, marks, cues: cues.sort((x, y) => x.t - y.t) }, null, 1));
console.log("wrote", out, cues.length, "cues over", at.toFixed(1) + "s");
