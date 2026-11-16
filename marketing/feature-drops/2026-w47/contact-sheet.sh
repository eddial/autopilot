#!/bin/sh
# contact-sheet.sh out.png a.png b.png c.png d.png → one 2x2 sheet (1080 wide), to look at four stills at once.
# Stills are scaled to 540 wide, keeping their ratio; all four should be the same size.
o=$1; shift
ffmpeg -loglevel error -y -i "$1" -i "$2" -i "$3" -i "$4" -filter_complex \
  "[0]scale=540:-2[a];[1]scale=540:-2[b];[2]scale=540:-2[c];[3]scale=540:-2[d];[a][b]hstack[t];[c][d]hstack[u];[t][u]vstack" "$o"
