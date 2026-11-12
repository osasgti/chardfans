#!/usr/bin/env bash
# Crash-safe render: muted N-frame video chunks (skips finished ones) + one audio pass, then mux + master.
# Usage: COMP=LieMeter SCALE=0.75 PROPS='{"quality":"fast"}' scripts/render_chunks.sh [chunk=240]
# Env: COMP (default Main), SCALE (default 1; must give integer pixel sizes, e.g. 0.75 → 1440×810),
#      PROPS (input props JSON), REMOTION_BROWSER (browser path), OUT (default out/<COMP>.mp4)
set -euo pipefail
CH=${1:-240}; COMP=${COMP:-Main}; SCALE=${SCALE:-1}; PROPS=${PROPS:-'{}'}; OUT=${OUT:-out/$COMP.mp4}
D=out/chunks_$COMP; mkdir -p "$D"; B=${REMOTION_BROWSER:-}
EXTRA=(); [ -n "$B" ] && EXTRA+=(--browser-executable="$B")
npx remotion bundle src/index.ts --out-dir out/bundle_$COMP >/dev/null
TOTAL=$(npx remotion compositions out/bundle_$COMP "${EXTRA[@]}" 2>/dev/null | awk -v c="$COMP" '$1==c{print $4}')
[ -n "$TOTAL" ] || { echo "could not read $COMP duration"; exit 1; }
echo "$COMP: $TOTAL frames in chunks of $CH"
: > "$D/list.txt"
for ((s=0; s<TOTAL; s+=CH)); do
  e=$((s+CH-1)); ((e>=TOTAL)) && e=$((TOTAL-1)); f=$D/c_$(printf %06d $s).mp4
  if [ ! -s "$f" ]; then
    echo "[$(date +%H:%M)] chunk $s-$e"
    npx remotion render out/bundle_$COMP "$COMP" "$f.tmp.mp4" --frames=$s-$e --scale="$SCALE" --props="$PROPS" \
      --concurrency=2 --timeout=240000 --muted "${EXTRA[@]}" >"$D/log_$s.txt" 2>&1 && mv "$f.tmp.mp4" "$f"
  fi
  echo "file '$(basename "$f")'" >> "$D/list.txt"
done
# video chunks are muted; audio renders once in one pass (no AAC seams at chunk joins)
ffmpeg -v error -y -f concat -safe 0 -i "$D/list.txt" -c copy "$D/video.mp4"
[ -s "$D/audio.wav" ] || npx remotion render out/bundle_$COMP "$COMP" "$D/audio.wav" --codec=wav --props="$PROPS" --timeout=240000 "${EXTRA[@]}" >"$D/log_audio.txt" 2>&1
ffmpeg -v error -y -i "$D/video.mp4" -i "$D/audio.wav" -map 0:v -map 1:a -c:v copy -af "acompressor=threshold=-18dB:ratio=3:attack=10:release=150,loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=0.84" -ar 48000 -c:a aac -b:a 320k "$OUT"
echo "DONE → $OUT"
