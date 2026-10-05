#!/bin/sh
# Build the combined weekly video: cover card, the three clips as chapters (cut before their own
# end cards, with a "n / 3 · process" label), and one shared end card. Needs NODE_PATH with playwright.
set -e
cd "$(dirname "$0")"
enc() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }
CLIP_QUERY="chapter=$(enc '1 / 3 · Quote & Sell')" CLIP_UNTIL=17.6 CLIP_OUT=weekly-1.mp4 node render.mjs talk-to-llev.html
CLIP_QUERY="chapter=$(enc '2 / 3 · Pay & Collect')" CLIP_UNTIL=16.2 CLIP_OUT=weekly-2.mp4 node render.mjs kanban-board.html
CLIP_QUERY="chapter=$(enc '3 / 3 · Quote & Sell')" CLIP_UNTIL=17.8 CLIP_OUT=weekly-3.mp4 node render.mjs skill-tests.html
node -e '
const { chromium } = require("playwright"); const path = require("path");
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto("file://" + path.resolve("weekly-cards.html") + "?record"); await p.evaluate(() => document.fonts.ready); await p.waitForLoadState("networkidle");
  const f = p.locator(".frame"); await f.nth(0).screenshot({ path: "weekly-cover.png" }); await f.nth(1).screenshot({ path: "weekly-end.png" }); await b.close(); })();'
card() { ffmpeg -loglevel error -y -loop 1 -framerate 30 -t "$2" -i "$1" -vf "fade=in:0:9,format=yuv420p" -c:v libx264 -crf 18 -r 30 "$3"; }
card weekly-cover.png 2.5 weekly-0.mp4
card weekly-end.png 3.5 weekly-4.mp4
ffmpeg -loglevel error -y -i weekly-0.mp4 -i weekly-1.mp4 -i weekly-2.mp4 -i weekly-3.mp4 -i weekly-4.mp4 \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0,format=yuv420p[v]" -map "[v]" -c:v libx264 -crf 18 -preset slow -movflags +faststart weekly.mp4
rm -f weekly-0.mp4 weekly-1.mp4 weekly-2.mp4 weekly-3.mp4 weekly-4.mp4 weekly-end.png
echo "wrote weekly.mp4"
