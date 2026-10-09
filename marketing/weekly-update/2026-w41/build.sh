#!/bin/sh
# Build Feature Drop · Week 41 (2–9 Oct): cover, seven chapters, "Also new", end, with music and interface sounds.
# 1:1, 1440 x 1440, 30 fps, 10 Mbit/s. One continuous canvas: every part renders its background on the video's
# clock (t0.mjs), so the cuts don't show. Each part is drawn with render-plane.mjs: the app is a flat image moved
# by the camera, so zooms and pans don't shimmer. Parts are <clip.mp4>=<page.html>[?query].
# Needs NODE_PATH with playwright, ffmpeg, and SOUND_PY: a python with numpy, scipy and opencv (cv2).
# MUSIC and CREDIT: the track and its credit line (music.txt has the source and licence); SFX: sound effects (sfx/).
set -e
cd "$(dirname "$0")"
export CLIP_SIZE=1440x1440 CLIP_FPS=30 CLIP_BITRATE=10M
MUSIC=${MUSIC:-music/muted-trumpet-jazz.mp3}
CREDIT=${CREDIT:-"Music: Muted Trumpet Jazz Study Session by Alex Morgan · CC BY 4.0"}
PARTS="card-m1.mp4=weekly-cards.html?card=1
fd1-setup.mp4=ch2-setup.html?part=feature
fd2-dashboards.mp4=ch7-dashboards.html
fd3-workflows.mp4=ch1-agent.html?part=sidebar
fd4-voice.mp4=ch5-voice.html?part=feature
fd5-agent-step.mp4=ch1-agent.html?part=step
fd6-tables.mp4=ch6-tables.html?part=feature
fd7-skills.mp4=ch3-skills.html?part=feature
card-m2.mp4=weekly-cards.html?card=2
card-m3.mp4=weekly-cards.html?card=3"
CLIP_QUERY="credit=$CREDIT" node cards.mjs weekly-cards.html card   # card-1.png: the cover, composed, is the thumbnail
node t0.mjs $(echo "$PARTS" | sed 's/^[^=]*=//') > t0.txt
# Three parts at a time.
echo "$PARTS" | while IFS= read -r spec; do
  out=${spec%%=*}; page=${spec#*=}; file=${page%%\?*}; q=""; case $page in *\?*) q=${page#*\?};; esac
  t0=$(grep -F " $page" t0.txt | head -1 | cut -d' ' -f1)
  case $q in card=3*) q="$q&credit=$CREDIT";; esac
  printf '%s\t%s\t%s\n' "$file" "${q:+$q&}t0=$t0" "$out"
done | tr '\n' '\0' | xargs -0 -P 3 -I{} sh -c 'IFS="$(printf "\t")"; set -- $1; CLIP_QUERY="$2" CLIP_OUT="$3" node render-plane.mjs "$1"' _ {}
CLIP_THUMB=card-1.png ./combine.sh feature-drop-2026-w41.mp4 $(echo "$PARTS" | sed 's/=.*//')
node cues.mjs cues.json $(echo "$PARTS")
${SOUND_PY:-python3} soundtrack.py cues.json soundtrack.wav --music "$MUSIC" --sfx "${SFX:-sfx}"
./add-sound.sh feature-drop-2026-w41.mp4 soundtrack.wav card-1.png
