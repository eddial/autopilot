#!/bin/sh
# The 16:9 version of a square drop, for YouTube and the GitBook changelog: GitBook embeds YouTube in a 16:9 frame,
# so a square video gets black bars. This centres the video at 1080 x 1080 and stretches its own left and right
# edge (plain paper) to fill 1920 x 1080, softened so the join doesn't show. The sound is copied as is.
# Usage: ./wide.sh feature-drop-2026-w42.mp4   ->   feature-drop-2026-w42-16x9.mp4
set -e
IN=$1; OUT=${2:-${IN%.mp4}-16x9.mp4}
F="[0:v]scale=1080:1080:flags=lanczos,split=3[m][a][b];[a]crop=2:1080:0:0,scale=420:1080,boxblur=20:2[l];[b]crop=2:1080:1078:0,scale=420:1080,boxblur=20:2[r];[l][m][r]hstack=3,format=yuv420p[v]"
ffmpeg -hide_banner -loglevel error -y -i "$IN" -filter_complex "$F" -map "[v]" -map 0:a -c:v libx264 -preset slow -crf 18 -r 30 -c:a copy -movflags +faststart "$OUT"
echo "$OUT"
