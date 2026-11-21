#!/bin/bash
# Renders the full film at native 2160x3840 / 24 fps in 6 chunks, then joins them.
set -e
cd "$(dirname "$0")"
OUT=${1:-out}
mkdir -p "$OUT"
for i in 0 1 2 3 4 5; do
  s=$((i*120)); e=$((s+120))
  f="$OUT/chunk$i.mp4"
  [ -f "$f.done" ] && continue
  node render.js film 2160 "$f" $s $e > "$OUT/chunk$i.log" 2>&1
  touch "$f.done"
done
printf "file 'chunk%d.mp4'\n" 0 1 2 3 4 5 > "$OUT/list.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$OUT/list.txt" -c copy -movflags +faststart "$OUT/the-invisible-universe-2160x3840.mp4"
echo DONE > "$OUT/ALL_DONE"
