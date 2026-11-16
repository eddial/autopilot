#!/bin/sh
# Put a soundtrack under a video, loudness-normalised (-18 LUFS, peaks at -1.5 dBTP), and keep its thumbnail.
# Usage: add-sound.sh <video.mp4> <sound.wav> <thumbnail.png>
set -e
video=$1; sound=$2; thumb=$3
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")
tmp=$(mktemp -d)
ffmpeg -loglevel error -y -i "$video" -i "$sound" -map 0:v:0 -map 1:a:0 -c:v copy -af "loudnorm=I=-18:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -t "$d" -movflags +faststart "$tmp/out.mp4"
mv "$tmp/out.mp4" "$video"; rm -rf "$tmp"
"$(dirname "$0")/thumbnail.sh" "$video" "$thumb"
echo "sound $sound → $video"
