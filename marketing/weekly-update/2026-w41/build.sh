#!/bin/sh
# Join the weekly update video for 2–8 Oct: cover, six chapters, "Also this week", end card, with a soundtrack.
# 4:3, 1440 x 1080, 30 fps, 8 Mbit/s. Render the chapters first (node render.mjs chN-*.html 12).
# Needs NODE_PATH with playwright, ffmpeg, and SOUND_PY: a python with numpy and scipy (default python3).
set -e
cd "$(dirname "$0")"
export CLIP_SIZE=1440x1080 CLIP_FPS=30 CLIP_BITRATE=8M
# The cards are clips too (motion layer): cover, "Also this week" and end, rendered from weekly-cards.html?card=N.
# card-1.png (the cover's composed state) stays the thumbnail.
node cards.mjs weekly-cards.html card
for n in 1 2 3; do CLIP_QUERY="card=$n" CLIP_OUT="card-m$n.mp4" node render.mjs weekly-cards.html; done
CH="ch1-agent ch2-setup ch3-skills ch4-requests ch5-voice ch6-tables"
CLIP_THUMB=card-1.png ./combine.sh weekly-update-2026-w41.mp4 card-m1.mp4 $(for c in $CH; do printf "%s.mp4 " $c; done) card-m2.mp4 card-m3.mp4
node cues.mjs cues.json "card-m1.mp4=weekly-cards.html?card=1" $(for c in $CH; do printf "%s.html " $c; done) "card-m2.mp4=weekly-cards.html?card=2" "card-m3.mp4=weekly-cards.html?card=3"
# Music: a CC0 track (music.txt) under the interface sounds; without MUSIC, the synthesised bed.
${SOUND_PY:-python3} soundtrack.py cues.json soundtrack.wav ${MUSIC:+--music "$MUSIC"}
./add-sound.sh weekly-update-2026-w41.mp4 soundtrack.wav card-1.png
