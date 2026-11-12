#!/usr/bin/env bash
# Automated checks (CLAUDE.md §28). Usage: scripts/qa.sh out/final.mp4
set -euo pipefail
V=${1:-out/final.mp4}; mkdir -p out/qa
echo "== scene changes (compare against planned cuts) =="
ffmpeg -hide_banner -i "$V" -vf "select='gt(scene,0.25)',showinfo" -an -f null - 2>&1 | grep -oE "pts_time:[0-9.]+" | sed 's/pts_time:/  cut/'
echo "== contact sheet → out/qa/sheet*.jpg =="
ffmpeg -v error -y -i "$V" -vf "fps=1,scale=480:-1,tile=4x4" out/qa/sheet%02d.jpg
echo "== loudness (target -14 LUFS, TP <= -1) =="
ffmpeg -hide_banner -i "$V" -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input (Integrated|True Peak)"
echo "== black / frozen frames =="
ffmpeg -hide_banner -i "$V" -vf "blackdetect=d=0.3:pix_th=0.05,freezedetect=n=0.001:d=1" -an -f null - 2>&1 | grep -E "black_start|freeze_start" || echo "  none"
