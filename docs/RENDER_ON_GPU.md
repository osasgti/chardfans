# Rendering on your own computer (GPU) — the fast way

The cloud container has **no graphics card**, so every frame is drawn in software (~4 s/frame → ~6 h for the 5-minute video at 24 fps).
A normal gaming PC or Apple-silicon Mac draws the same frame in ~0.05–0.15 s: **30–60× faster**, at full quality and 60 fps.

| Where | Settings | 5-min video |
|---|---|---|
| Cloud container (now) | 24 fps, 1440×810, fast quality | ~6 h |
| Mac M1/M2/M3 | 60 fps, 1920×1080, full quality | ~20–40 min |
| PC with NVIDIA/AMD GPU | 60 fps, 1920×1080, full quality | ~10–30 min |

## 1. One-time setup (about 10 minutes)

1. Install **Node.js 22** — https://nodejs.org (LTS installer).
2. Install **Git** — https://git-scm.com (Windows) / already on Mac (`xcode-select --install`).
3. Install **ffmpeg** — Mac: `brew install ffmpeg` · Windows: `winget install ffmpeg`.
4. Install **Python 3** (for the sound generator) — https://python.org, then `pip install numpy`.
5. Get the project:
   ```bash
   git clone https://github.com/osasgti/chardfans.git
   cd chardfans
   git checkout claude/sleepy-cannon-tj6r5n
   npm ci
   npm run sfx          # generates the sound effects (~2 min)
   ```

## 2. Quick test (1 minute)

```bash
# Mac / Windows
REMOTION_GL=angle npx remotion still src/index.ts LieMeter out/test.png --frame=2400 --props='{"fps":60}'
```
Windows PowerShell: `$env:REMOTION_GL="angle"; npx remotion still src/index.ts LieMeter out/test.png --frame=2400 --props='{\"fps\":60}'`

If it finishes in a few seconds, the GPU is being used. If it takes ~30 s+, the GPU isn't used — try `REMOTION_GL=egl` (Linux) or `vulkan`.

## 3. Short preview clip (5–10 s of video)

```bash
REMOTION_GL=angle npx remotion render src/index.ts LieMeter out/clip.mp4 --frames=2400-3000 --props='{"fps":60}' --concurrency=6
```

## 4. Full video, full quality

```bash
GL=angle CONC=6 COMP=LieMeter SCALE=1 PROPS='{"fps":60}' bash scripts/render_chunks.sh
```
- Output: `out/LieMeter.mp4` (mastered audio, −14 LUFS).
- Crash-safe: re-run the same command and finished chunks are skipped.
- `CONC` = how many frames render at once. Start at 6; lower it if the computer runs out of memory.
- Windows: run it in **Git Bash** (installed with Git), not PowerShell.

## 5. Even faster options

| Option | Speed | Cost |
|---|---|---|
| Your GPU (above) | 30–60× | free |
| **Remotion Lambda** (AWS, hundreds of machines in parallel) | 5-min video in ~2–5 min | a few cents–dollars per render, needs an AWS account + Remotion license for companies |
| Cloud GPU box (RunPod, Vast.ai, Lambda Labs) | same as a gaming PC | ~$0.30–1/hour |
| Stay in the cloud container, render only changed chunks | 10–50× less work | free (see CLAUDE.md §53.4) |

## 6. After rendering
```bash
python3 scripts/luma_qa.py out/LieMeter.mp4 60     # flash / brightness check
bash scripts/qa.sh out/LieMeter.mp4                # cuts, loudness, contact sheet
```
