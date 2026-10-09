#!/bin/sh
# Build the weekly update video for 2–8 Oct: cover, seven chapters, "Also new", end, with music and interface sounds.
# 4:3, 1440 x 1080, 30 fps, 8 Mbit/s. One continuous canvas: every part renders its background on the video's
# clock (t0.mjs), so the cuts don't show. Parts are <clip.mp4>=<page.html>[?query].
# Needs NODE_PATH with playwright, ffmpeg, and SOUND_PY: a python with numpy and scipy (default python3).
# MUSIC: the track under it (music.txt has its source and licence); SFX: the sound effects folder (sfx/).
set -e
cd "$(dirname "$0")"
export CLIP_SIZE=1440x1080 CLIP_FPS=30 CLIP_BITRATE=8M
PARTS="card-m1.mp4=weekly-cards.html?card=1
ch1-agent.mp4=ch1-agent.html?part=step
ch2-sidebar.mp4=ch1-agent.html?part=sidebar
ch2-setup.mp4=ch2-setup.html
ch3-skills.mp4=ch3-skills.html
ch4-requests.mp4=ch4-requests.html?part=requests
ch5-voice.mp4=ch5-voice.html
ch6-tables.mp4=ch6-tables.html
card-m2.mp4=weekly-cards.html?card=2
card-m3.mp4=weekly-cards.html?card=3"
node cards.mjs weekly-cards.html card   # card-1.png: the cover, composed, is the thumbnail
node t0.mjs $(echo "$PARTS" | sed 's/^[^=]*=//') > t0.txt
echo "$PARTS" | while IFS= read -r spec; do
  out=${spec%%=*}; page=${spec#*=}; file=${page%%\?*}; q=""; case $page in *\?*) q=${page#*\?};; esac
  t0=$(grep -F " $page" t0.txt | head -1 | cut -d' ' -f1)
  CLIP_QUERY="${q:+$q&}t0=$t0" CLIP_OUT=$out node render.mjs "$file"
done
CLIP_THUMB=card-1.png ./combine.sh weekly-update-2026-w41.mp4 $(echo "$PARTS" | sed 's/=.*//')
node cues.mjs cues.json $(echo "$PARTS")
${SOUND_PY:-python3} soundtrack.py cues.json soundtrack.wav --music "${MUSIC:-music/a-blue-day.mp3}" --sfx "${SFX:-sfx}"
./add-sound.sh weekly-update-2026-w41.mp4 soundtrack.wav card-1.png
