#!/usr/bin/env bash
# Render the same frame twice; hashes must match (no Math.random / clock leaks). Usage: scripts/determinism.sh 300
set -euo pipefail
F=${1:-300}; B=${REMOTION_BROWSER:-}
ARGS=(--frame="$F" --scale=0.25); [ -n "$B" ] && ARGS+=(--browser-executable="$B")
npx remotion still src/index.ts Main out/det_a.png "${ARGS[@]}" >/dev/null
npx remotion still src/index.ts Main out/det_b.png "${ARGS[@]}" >/dev/null
A=$(ffmpeg -v error -i out/det_a.png -f md5 -); Bh=$(ffmpeg -v error -i out/det_b.png -f md5 -)
[ "$A" = "$Bh" ] && echo "deterministic ✔ ($A)" || { echo "NON-DETERMINISTIC ✘ $A vs $Bh"; exit 1; }
