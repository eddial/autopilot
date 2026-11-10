#!/bin/sh
# Give a video its thumbnail: the image is embedded as the MP4's cover art (Finder, QuickTime, players that show one)
# and kept beside the video as <video>.png (to upload as a preview where a platform asks for one).
# Slack and most sites take the video's first frame as the preview, so the first frame must be a card, never black:
# render.mjs and combine.sh take care of that, and run this at the end.
# Usage: thumbnail.sh <video.mp4> <image.png>
set -e
video=$1; img=$2
[ -f "$video" ] && [ -f "$img" ] || { echo "usage: thumbnail.sh <video.mp4> <image.png>" >&2; exit 1; }
size=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$video" | tr x :)
tmp=$(mktemp -d)
ffmpeg -loglevel error -y -i "$img" -vf "scale=$size:flags=lanczos" -q:v 2 "$tmp/cover.jpg"
ffmpeg -loglevel error -y -i "$video" -i "$tmp/cover.jpg" -map 0:v:0 -map "0:a?" -map 1 -c copy -c:v:1 mjpeg -disposition:v:1 attached_pic -movflags +faststart "$tmp/out.mp4"
mv "$tmp/out.mp4" "$video"
[ "$img" -ef "${video%.mp4}.png" ] || ffmpeg -loglevel error -y -i "$img" -vf "scale=$size:flags=lanczos" "${video%.mp4}.png"
rm -rf "$tmp"; echo "thumbnail $img → $video"
