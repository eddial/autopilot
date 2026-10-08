#!/bin/sh
# Join the weekly update video for 2–8 Oct: cover, six chapters, "Also this week", end card, with a soundtrack.
# 4:3, 1440 x 1080, 30 fps, 8 Mbit/s. Render the chapters first (node render.mjs chN-*.html <poster>).
# Needs NODE_PATH with playwright, ffmpeg, and SOUND_PY: a python with numpy and scipy (default python3).
set -e
cd "$(dirname "$0")"
export CLIP_SIZE=1440x1080 CLIP_FPS=30 CLIP_BITRATE=8M
PARTS="card-1.png:4 ch1-agent.mp4 ch2-setup.mp4 ch3-skills.mp4 ch4-requests.mp4 ch5-voice.mp4 ch6-tables.mp4 card-2.png:10 card-3.png:3"
node cards.mjs weekly-cards.html card
./combine.sh weekly-update-2026-w41.mp4 $PARTS
node cues.mjs cues.json $(echo "$PARTS" | sed 's/\.mp4/.html/g')
${SOUND_PY:-python3} soundtrack.py cues.json soundtrack.wav
./add-sound.sh weekly-update-2026-w41.mp4 soundtrack.wav card-1.png
