#!/bin/sh
# Build the combined weekly video (~14s): cover card, the payoff moment (~3s) of each clip as a chapter
# labelled "n / 3 · process", and one shared end card. Needs NODE_PATH with playwright.
set -e
cd "$(dirname "$0")"
enc() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }
# Only the key moment of each feature: no per-clip hook or end cards.
seg() { CLIP_QUERY="chapter=$(enc "$2")" CLIP_FROM=$3 CLIP_UNTIL=$4 CLIP_OUT=$5 node render.mjs "$1"; }
seg talk-to-llev.html '1 / 3 · Talk to Llev' 8.9 11.4 weekly-1.mp4
seg kanban-board.html '2 / 3 · Board view' 7.4 10.2 weekly-2.mp4
seg skill-tests.html '3 / 3 · Skill tests' 11.2 14.0 weekly-3a.mp4
seg skill-tests.html '3 / 3 · Skill tests' 15.6 17.2 weekly-3b.mp4
node -e '
const { chromium } = require("playwright"); const path = require("path");
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto("file://" + path.resolve("weekly-cards.html") + "?record"); await p.evaluate(() => document.fonts.ready); await p.waitForLoadState("networkidle");
  const f = p.locator(".frame"); await f.nth(0).screenshot({ path: "weekly-cover.png" }); await f.nth(1).screenshot({ path: "weekly-end.png" }); await b.close(); })();'
card() { ffmpeg -loglevel error -y -loop 1 -framerate 30 -t "$2" -i "$1" -vf "fade=in:0:9,format=yuv420p" -c:v libx264 -crf 18 -r 30 "$3"; }
card weekly-cover.png 1.5 weekly-0.mp4
card weekly-end.png 2 weekly-4.mp4
ffmpeg -loglevel error -y -i weekly-0.mp4 -i weekly-1.mp4 -i weekly-2.mp4 -i weekly-3a.mp4 -i weekly-3b.mp4 -i weekly-4.mp4 \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v][5:v]concat=n=6:v=1:a=0,format=yuv420p[v]" -map "[v]" -c:v libx264 -crf 18 -preset slow -movflags +faststart weekly.mp4
rm -f weekly-0.mp4 weekly-1.mp4 weekly-2.mp4 weekly-3a.mp4 weekly-3b.mp4 weekly-4.mp4 weekly-end.png
echo "wrote weekly.mp4"
