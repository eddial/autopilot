#!/bin/sh
# Build the Feature Drop: cover, one chapter per feature, "Also new", end, with music and interface sounds.
# 1:1, 1440 x 1440, 30 fps, 10 Mbit/s, canvas style: one steady window on moving paper, every part rendering its
# background on the video's clock (t0.mjs) so the cuts don't show, and the app drawn as a flat plane
# (render-plane.mjs) so zooms and pans don't shimmer.
# Edit WEEK and PARTS each week. A part is <clip.mp4>=<page.html>[?query]; a chapter cut from a shared timeline
# names its part (ch1-agent.html?part=step). Cards are parts too (feature-drop-cards.html?card=N).
# Needs NODE_PATH with playwright, ffmpeg, and SOUND_PY: a python with numpy, scipy and opencv (cv2).
# MUSIC and CREDIT: the track and its credit line (music/music.txt); the credit goes on the end card.
set -e
cd "$(dirname "$0")"
export CLIP_SIZE=1440x1440 CLIP_FPS=30 CLIP_BITRATE=10M CLIP_STYLE=canvas
WEEK=${WEEK:-44} YEAR=${YEAR:-2026}
OUT=feature-drop-$YEAR-w$WEEK.mp4
MUSIC=${MUSIC:-music/muted-trumpet-jazz.mp3}
CREDIT=${CREDIT:-"Music: Muted Trumpet Jazz Study Session by Alex Morgan · CC BY 4.0"}
PARTS="card-m1.mp4=feature-drop-cards.html?card=1
fd1-reassign.mp4=ch1-reassign.html
fd2-workflow-asks.mp4=ch2-workflow-asks.html
fd3-continue.mp4=ch3-continue.html
fd4-agent-files.mp4=ch4-agent-files.html
fd5-stacked-bars.mp4=ch5-stacked-bars.html
fd6-date-metrics.mp4=ch6-date-metrics.html
card-m2.mp4=feature-drop-cards.html?card=2
card-m3.mp4=feature-drop-cards.html?card=3"
CLIP_QUERY="credit=$CREDIT" node cards.mjs feature-drop-cards.html card   # card-1.png: the cover, composed, is the thumbnail
node t0.mjs $(echo "$PARTS" | sed 's/^[^=]*=//') > t0.txt
# Three parts at a time.
echo "$PARTS" | while IFS= read -r spec; do
  out=${spec%%=*}; page=${spec#*=}; file=${page%%\?*}; q=""; case $page in *\?*) q=${page#*\?};; esac
  t0=$(grep -F " $page" t0.txt | head -1 | cut -d' ' -f1)
  case $q in card=3*) q="$q&credit=$CREDIT";; esac
  printf '%s\t%s\t%s\n' "$file" "${q:+$q&}t0=$t0" "$out"
done | tr '\n' '\0' | xargs -0 -P 3 -I{} sh -c 'IFS="$(printf "\t")"; set -- $1; CLIP_QUERY="$2" CLIP_OUT="$3" node render-plane.mjs "$1"' _ {}
CLIP_THUMB=card-1.png ./combine.sh "$OUT" $(echo "$PARTS" | sed 's/=.*//')
node cues.mjs cues.json $(echo "$PARTS")
${SOUND_PY:-python3} soundtrack.py cues.json soundtrack.wav --music "$MUSIC" --sfx "${SFX:-sfx}"
./add-sound.sh "$OUT" soundtrack.wav card-1.png
