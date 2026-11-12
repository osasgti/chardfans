#!/usr/bin/env bash
# Crash-safe render: renders N-frame chunks, skips chunks already done, then concatenates + masters.
# Usage: scripts/render_chunks.sh [chunk=120]
set -euo pipefail
CH=${1:-120}; mkdir -p out/chunks; B=${REMOTION_BROWSER:-}
EXTRA=(); [ -n "$B" ] && EXTRA+=(--browser-executable="$B")
TOTAL=$(npx remotion compositions src/index.ts "${EXTRA[@]}" 2>/dev/null | awk '/^Main /{print $4}')
[ -n "$TOTAL" ] || { echo "could not read Main duration"; exit 1; }
: > out/chunks/list.txt
for ((s=0; s<TOTAL; s+=CH)); do
  e=$((s+CH-1)); ((e>=TOTAL)) && e=$((TOTAL-1)); f=out/chunks/c_$(printf %05d $s).mp4
  [ -s "$f" ] || npx remotion render src/index.ts Main "$f" --frames=$s-$e --concurrency=2 "${EXTRA[@]}"
  echo "file '$(basename "$f")'" >> out/chunks/list.txt
done
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy out/video.mp4 && npm run master
