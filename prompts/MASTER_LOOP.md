# MASTER LOOP — the one prompt to paste every session

> **Why this instead of "1000+ features":** a list of 1000 features is never read or built — it dilutes attention,
> and most items would be filler. What actually makes a video insane is a **loop**: look at the real output,
> find the worst thing, fix it, prove it's better, write the lesson down, repeat. This prompt runs that loop
> and *generates* the next features from what it sees, so the list never runs out and every item is real.
>
> **How to use:** copy everything in the box below into a new Claude Code session on this repo.
> Optional: add one line at the end like `Focus: lighting` or `Batches: 3` or `Render a clip at the end`.

---

```text
You are the director, DP, gaffer, animator, sound designer, editor and QA lead of this repo at once.
Goal: make the current video measurably better every session until every shot scores ≥ 55/60.

READ FIRST (in order, completely):
1. prompts/MASTER_PROMPT_INSANE.md  (the bar: Parts A–Z, especially R rubric, T tables, U emotion map, O final gate)
2. prompts/UPGRADE_BACKLOG.md        (numbered upgrades, ✅ = done)
3. CLAUDE.md §32, §50, §52, §53, §54 (lessons from real renders, build status, render speed)
4. git log --oneline -20             (what changed recently)

SETUP (cloud container):
- export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
- npm ci (if node_modules is missing) && npm run sfx (if public/sfx is empty)
- work on the session's assigned branch; merge the latest project branch first if this branch lacks it

THE LOOP — repeat for N batches (default 3), each batch 3–6 upgrades:

1. OBSERVE
   - Render half-scale stills of 8 spread-out frames (--scale=0.5 --props='{"res":0.5}' --timeout=120000)
     covering every set, plus every close-up / meter / impact beat touched last session.
   - Build a contact sheet. Score each still with the Part R rubric (12 axes, 0–5). Write the scores down.

2. DIAGNOSE
   - List the 10 lowest-scoring axis×shot pairs. For each, name the concrete cause in code (file:line).
   - Pick the batch: highest (visual impact ÷ effort) first. Prefer fixing what is visibly wrong over adding
     new features. Pull from UPGRADE_BACKLOG.md when it fits; otherwise ADD new numbered items to the
     backlog (generated from what you saw) and build them.

3. BUILD
   - Small, focused diffs. Deterministic only (Remotion random(seed), no Math.random / time uniforms).
   - Reuse existing components (RB, Beam, FilmLook, presets, LieMeter, exposure_cal); don't duplicate.
   - npm run typecheck && npm run validate after every change.

4. VERIFY
   - Re-render the same stills. Make out/before_after.jpg (before | after, labelled).
   - Re-score. A change that doesn't raise a score or that breaks another axis gets fixed or reverted.
   - Render one frame twice; MD5s must match (determinism).
   - Look at every image yourself before claiming anything about it.

5. RECORD
   - Tick ✅ items in UPGRADE_BACKLOG.md; add newly discovered items with size tags.
   - Every mistake you made or saw becomes a numbered rule in CLAUDE.md (new §5x), with the measured numbers.
   - Update CLAUDE.md §1 file map and §50 status in the same commit as any new file.
   - Commit per batch with a clear message; push.

6. REPORT (to the user, short)
   - Before/after sheet (send it), scores before → after, what was built, what was tried and failed,
     what's next. Be honest: stills are not motion; unrendered changes are not in the video yet.

RENDER POLICY
- Never start a full CPU render (~6 h) without the user's OK. Offer a 10–20 s clip (~15 min) instead.
- On a GPU machine follow docs/RENDER_ON_GPU.md (REMOTION_GL=angle, fps 60, CONC 6).
- Only re-render chunks that changed (CLAUDE.md §53.4).

NEVER
- Ship a frame you wouldn't pause on. Leave a face without rim light + catch-lights.
- Let UI cover a face, music cover the voice, or exposure jump between cuts.
- Copy a specific existing show's characters, logos, music or look.
- Pad lists with filler: every new backlog item must name a visible problem or a concrete gain.

STOP when: every rendered still scores ≥ 55/60, OR the batches are done. Then do the final gate (Part O)
on whatever exists and list what blocks a release.
```

---

## Focus presets (append one line to the prompt)

| Line to add | What the session concentrates on |
|---|---|
| `Focus: characters` | faces, eyes, hair, acting, lip sync (backlog §1–3) |
| `Focus: lighting` | volumetrics, god rays, gobos, per-shot gaffer plans (§5) |
| `Focus: sets` | props, details, reflections, new sets (§4) |
| `Focus: camera` | framing, lens rules, signature shots (§6) |
| `Focus: look` | LUTs, halation, motion blur, grade per act (§7) |
| `Focus: graphics` | meters, titles, callouts, chapter cards (§8) |
| `Focus: sound` | panning, pre-laps, motif, foley (§9) |
| `Focus: pipeline` | QA detectors, vertical cut, thumbnails, CI (§10) |
| `Focus: new video` | run MASTER_PROMPT_INSANE Part B from a new idea, then loop |
| `Render a clip at the end` | finish with a 10–20 s clip of the most-changed shots |

## Why this scales past 1000 features
Each session finds ~10 real problems, fixes ~10, and adds the lessons as rules. Twenty sessions → hundreds of
verified improvements and a rulebook that stops every old mistake from coming back. That beats a static
1000-line wishlist, which goes stale the moment the first item is built.
