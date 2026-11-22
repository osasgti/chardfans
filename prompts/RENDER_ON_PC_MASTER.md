# MASTER PROMPT — Render "Promise Threads" on my own PC (paste this into Claude Code in VS Code)

> Copy everything below the line into Claude Code running on your PC, in the folder where you want the project.
> Claude does the rest: setup, sound, GPU check, test render, full render, quality checks, mastering, and a report.

---

You are running on my own computer, inside VS Code, with my GPU available. Your job: produce the **finished
"What if every promise left a glowing thread?" video** from the repo `osasgti/chardfans`, branch
`claude/sleepy-cannon-tj6r5n`, at the best quality my machine can do, and verify it. Work through the phases in order.
Do not skip a gate. Fix problems yourself when the fix is in this prompt; stop and ask me only where it says **ASK**.

Read `CLAUDE.md` §32, §46, §52, §53 and `docs/RENDER_ON_GPU.md` once before Phase 3. Where they conflict with this prompt, this prompt wins.

## Phase 0 — Know the machine (2 min)
1. Detect OS (Windows / macOS / Linux), CPU cores, RAM, free disk, and the GPU (Windows: `nvidia-smi` or
   `wmic path win32_VideoController get name`; macOS: `system_profiler SPDisplaysDataType`; Linux: `nvidia-smi` / `lspci | grep -i vga`).
2. Check tools: `git`, `node` (need ≥18; 20 LTS preferred), `npm`, `python3` (or `python`/`py` on Windows), `ffmpeg`, `ffprobe`.
3. On **Windows**, run every bash script from **Git Bash** (`"C:\Program Files\Git\bin\bash.exe" -c "..."`), never PowerShell.
4. Print a short table: OS · GPU · VRAM · cores · RAM · free disk · tool versions. Free disk must be ≥ 15 GB.
   Missing tool → install it (winget/brew/apt) and say what you installed. **ASK** before installing anything that needs admin rights.

## Phase 1 — Get the project
```bash
git clone https://github.com/osasgti/chardfans.git   # skip if it already exists; then: git fetch && git pull
cd chardfans
git checkout claude/sleepy-cannon-tj6r5n
git log --oneline -1        # must show the "Promise Threads design pass" commit or newer
npm install
```
Gate: `npm run typecheck` passes with no output. If `npm install` fails on a native module, delete `node_modules` and
`package-lock`-independent caches only if needed, retry once, then **ASK**.

## Phase 2 — Sound effects and voice
1. `pip install numpy` (use the same Python that runs the scripts), then `npm run sfx` (≈2 min). Gate: `public/sfx/` holds ≥ 90 `.wav` files,
   including `thread_spool thread_burst thread_fray thread_drag thread_hum wrist_reveal promise_celesta promise_pizz promise_minor promise_piano`.
2. The voice is already in git: `public/vo_promise/P*.wav` (51 files) and `src/promise/timeline.json`. Gate: 51 wavs exist.
   Do **not** regenerate voice or call ElevenLabs. Do **not** re-run `build_promise_timeline.py` (it would change timing).

## Phase 3 — Pick the GPU path (the speed lever)
Remotion renders WebGL in headless Chrome. Try GL backends in this order and keep the first that renders a correct frame:
| OS | Order to try |
|---|---|
| Windows (NVIDIA/AMD/Intel) | `angle` → `vulkan` → `swangle` |
| Linux + NVIDIA | `egl` → `angle` → `swangle` |
| macOS (Apple Silicon) | `angle` → `swangle` |

For each candidate:
```bash
REMOTION_GL=<gl> npx remotion still src/index.ts PromiseThreads out/gltest_<gl>.png --frame=1957 --timeout=120000
```
Time it. Open the PNG and look at it yourself: it must show the hallway with characters (not black, not blank, no missing faces).
`swangle` = software (CPU) and is the slow fallback (≈4 s/frame). A real GPU path should be ≤ 0.5 s/frame.
Print: backend · seconds per still · looks correct yes/no. Keep the winner as `GL`.

## Phase 4 — Choose quality from measured speed
Render a 2-second test **at full quality** with the winning GL and time it:
```bash
REMOTION_GL=$GL npx remotion render src/index.ts PromiseThreads out/speedtest.mp4 --frames=11470-11589 --props='{"fps":60}' --concurrency=<cores/2> --timeout=240000
```
(Frames 11470–11589 at 60 fps ≈ 3:11, the "There are hundreds" swarm reveal, the heaviest shot.)
Compute seconds per frame and estimate the full video: ≈ 16,090 frames at 60 fps (4:28).
| Estimated full time | Settings |
|---|---|
| ≤ 2 h | **Final:** `SCALE=1`, fps 60, full quality (no `quality` prop) |
| 2–6 h | `SCALE=1`, **fps 30**, full quality |
| > 6 h | `SCALE=1`, fps 24, `"quality":"fast"`, and tell me the GPU path likely isn't being used |
Tell me the estimate and the setting you picked, then continue without waiting.
Raise `CONC` until it stops getting faster (try cores/2, then cores−2); if a render crashes with out-of-memory, step back down.

## Phase 5 — Preview gate (before the long render)
Render 5 stills at the chosen settings and look at each one yourself:
`--frame=` 147 (hook close-up + gold thread), 1957 (hallway), 4591 (bathroom mirror + swarm), 5084 (void, Kai + young Kai), 5744 (cafeteria burst). These are 24-fps frame numbers (the default with no `fps` prop); add `--props='{"fps":N}'` and multiply by N/24 to check another fps.
Each must: show faces sharply, have visible glowing threads, no black frame, no white blow-out, title text not cut off by the black bars.
If one fails, describe it, fix it only if the cause is obvious (e.g. wrong GL), otherwise **ASK**.

## Phase 6 — Full render (crash-safe)
```bash
COMP=PromiseThreads SCALE=<scale> CONC=<conc> GL=$GL PROPS='{"fps":<fps>}' OUT=out/promise_threads_v01_<fps>.mp4 bash scripts/render_chunks.sh
```
(Add `"quality":"fast"` inside PROPS only if Phase 4 said so.)
- It renders 480-frame chunks into `out/chunks_PromiseThreads/`, skips finished ones, then renders audio, muxes and masters to −14 LUFS.
- **If chunks from an earlier run exist at a different scale/fps, delete `out/chunks_PromiseThreads/` first** (mixing them breaks the video).
- If it crashes: read the last `out/chunks_PromiseThreads/log_*.txt`, fix (lower CONC on OOM; raise `--timeout` on timeouts), and re-run the same command — it resumes.
- Report progress every ~10 chunks: chunks done / total and estimated time left.

## Phase 7 — Quality gates (all must pass; CLAUDE.md §52.6)
```bash
python3 scripts/luma_qa.py out/promise_threads_v01_<fps>.mp4 <fps>
ffmpeg -i out/promise_threads_v01_<fps>.mp4 -af loudnorm=print_format=summary -f null -
bash scripts/qa.sh out/promise_threads_v01_<fps>.mp4
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,codec_name -of compact out/promise_threads_v01_<fps>.mp4
```
| Check | Pass |
|---|---|
| Duration | 268 s ± 1 |
| Size / codec | 1920×1080 (or the chosen scale), h264 + aac |
| 1-frame flashes | none (a flash is always a bug: report its timestamp and the shot) |
| Loudness | −14 LUFS ± 1, true peak ≤ −1 dBTP |
| Black / frozen frames | only the planned ones: the fade at 0:00, act dips, the 0.8 s silence after "You just never see them break" (~3:37), and the final fade |
| Known, accepted | one bright second at the "It ignites" flash (~3:58); dark stretch ~3:20–3:34 (grey threads → young Kai) |
Then watch these moments yourself by extracting frames (`ffmpeg -ss <t> -i video -frames:v 1 out/qa/t<t>.png`) and looking:
0:03, 0:20, 1:00, 2:05, 3:03, 3:05, 3:30, 3:50, 3:58, 4:25. Write any issue as `timestamp: problem → fix`.

## Phase 8 — Deliver
1. Keep the file in `out/` (git-ignored). Make a 1280×720 thumbnail from ~3:05 (the reveal):
   `ffmpeg -ss 185 -i out/promise_threads_v01_<fps>.mp4 -frames:v 1 -vf scale=1280:720 out/promise_threads_thumb.png`.
2. Captions: `python3 scripts/make_srt.py src/promise/timeline.json out/promise_threads.srt` (5–7 words per cue, ≤ 42 chars, ≥ 1 s each).
3. **ASK** before committing anything. If I say yes: copy the mp4 (only if < 100 MB), SRT and thumbnail to `releases/`, commit on
   `claude/sleepy-cannon-tj6r5n`, push, and update the `releases/` line in `CLAUDE.md` §1.
4. Final report (short): file path, resolution, fps, duration, size, GL backend, total render time, every gate with pass/fail,
   any issues found with timestamps, and what you'd fix next.

## Rules for you
- Never `Math.random`, never change timing, never regenerate voice, never edit shots unless a gate fails and I approve the fix.
- Never force-push; never push to a branch other than `claude/sleepy-cannon-tj6r5n`.
- Keep my PC usable: if CPU is at 100% for long, say so; do not change system settings.
- Be brief in progress updates; detail goes in the final report.
