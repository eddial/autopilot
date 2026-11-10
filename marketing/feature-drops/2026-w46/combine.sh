#!/bin/sh
# Combine one video from parts, in order: a PNG card held for N seconds (card.png:N) or a clip (clip.mp4, rendered
# beforehand with render.mjs). Every part must have the same size; cards are scaled to the clips' size.
# Usage: combine.sh out.mp4 cover.png:3 ch1.mp4 ch2.mp4 slide.png:8 end.png:3
# Format from format.mjs (CLIP_SIZE, CLIP_FPS, CLIP_BITRATE), the same values the parts were rendered with.
# The first part is the thumbnail: it opens on its first frame (no fade from black, so Slack and other sites show
# it as the preview), is embedded as cover art and is written beside the video as <out>.png (thumbnail.sh).
# CLIP_THUMB=<image.png> picks another thumbnail.
set -e
here=$(cd "$(dirname "$0")" && pwd)
eval "$(node "$here/format.mjs")"
out=$1; shift
size=""
for a in "$@"; do case $a in *.mp4) size=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$a" | tr x :); break;; esac; done
[ -n "$size" ] || size=$W:$H
[ "$size" = "$W:$H" ] || { echo "parts are $size but the format is $W:$H: render them with the same CLIP_SIZE" >&2; exit 1; }
tmp=$(mktemp -d); i=0; list=""; thumb=${CLIP_THUMB:-}
for a in "$@"; do
  i=$((i + 1))
  case $a in
    *.png:*) img=${a%:*}; d=${a##*:}
      fade=",fade=in:0:$((FPS * 3 / 20))"; [ $i -eq 1 ] && fade=""
      [ -n "$thumb" ] || thumb=$img
      ffmpeg -loglevel error -y -loop 1 -framerate "$FPS" -t "$d" -i "$img" -vf "scale=$size:flags=lanczos$fade,format=yuv420p" -c:v libx264 -crf 12 -r "$FPS" "$tmp/$i.mp4";;
    *.mp4) ffmpeg -loglevel error -y -i "$a" -map 0:v:0 -c copy "$tmp/$i.mp4"
      [ -n "$thumb" ] || { thumb=$tmp/first.png; ffmpeg -loglevel error -y -i "$a" -frames:v 1 "$thumb"; };;
    *) echo "unknown part: $a" >&2; exit 1;;
  esac
  list="$list -i $tmp/$i.mp4"
done
n=$i; filt=""; j=0; while [ $j -lt $n ]; do filt="$filt[$j:v:0]"; j=$((j + 1)); done
ffmpeg -loglevel error -y $list -filter_complex "${filt}concat=n=$n:v=1:a=0,fps=$FPS,format=yuv420p[v]" -map "[v]" -c:v libx264 $RATE -preset slow -movflags +faststart "$out"
"$here/thumbnail.sh" "$out" "$thumb"
rm -rf "$tmp"; echo "wrote $out (${W}x${H} @ $FPS fps${CLIP_BITRATE:+, $CLIP_BITRATE})"
