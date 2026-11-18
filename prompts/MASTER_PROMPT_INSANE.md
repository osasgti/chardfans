# MASTER PROMPT — "INSANE" PRODUCTION STANDARD (v1)

> **Claude: read this entire file before writing, changing or rendering anything.**
> This is the top-level directive for every video made in this repo. It does not replace `CLAUDE.md`;
> it sits **above** it. `CLAUDE.md` is the toolbox (how things are built). This file is the bar
> (what "done" means) and the checklist (so no detail is ever missed).
>
> **Priority order when rules conflict:**
> 1. The user's explicit request in the current conversation.
> 2. This file.
> 3. The per-video prompt in `prompts/` (e.g. `WHAT_IF_LIE_METER.md`).
> 4. `CLAUDE.md` §52 / §54 (lessons from real renders).
> 5. `CLAUDE.md` §36, then §0–§35.
>
> When you break a rule, **say which rule (by number) and why**, in the commit message and to the user.

---

## TABLE OF CONTENTS

- **Part A — Philosophy & the bar**
  - A1. The prime directive
  - A2. The five tests every frame must pass
  - A3. What "insane" means, concretely
  - A4. Failure modes that make a video look cheap
- **Part B — Pre-production**
  - B1. Brief
  - B2. Research & references
  - B3. Script
  - B4. Beat sheet & emotional curve
  - B5. Storyboard & shot list
  - B6. Color script
  - B7. Sound map
- **Part C — Characters**
  - C1. Silhouette & proportions
  - C2. Skin shading
  - C3. Eyes (the most important 2% of the frame)
  - C4. Mouth, brows, lids, cheeks
  - C5. Hair & accessories
  - C6. Clothing
  - C7. Character bible per character
  - C8. Acting
  - C9. Lip sync
- **Part D — Sets, props & materials**
  - D1. Set design principles
  - D2. Modelling rules (low-poly, but premium)
  - D3. Material library
  - D4. Surface variation & wear
  - D5. Storytelling details
  - D6. Props
- **Part E — Lighting**
  - E1. Renderer & tone mapping
  - E2. Per-shot lighting plan
  - E3. Faces
  - E4. Practicals, screens & emissives
  - E5. Atmosphere: fog, haze, volumetrics, dust
  - E6. Shadows & ambient occlusion
  - E7. Exposure consistency
- **Part F — Camera**
  - F1. Lens package
  - F2. Composition
  - F3. Movement grammar
  - F4. Focus & depth of field
  - F5. Handheld & shake
- **Part G — Animation**
  - G1. The 12 principles, applied to pill-people
  - G2. Easing vocabulary
  - G3. Holds, anticipation, overshoot
  - G4. Secondary & ambient motion
  - G5. Impact frames
  - G6. Nothing is ever frozen
- **Part H — Post-processing & grade**
  - H1. Effect chain order
  - H2. Grade per act
  - H3. Film emulation
- **Part I — 2D graphics, UI & typography**
  - I1. Design system
  - I2. The signature meter/badge
  - I3. Titles & kinetic type
  - I4. Captions
  - I5. Anchoring 2D to 3D
- **Part J — Sound**
  - J1. Voice
  - J2. Music
  - J3. SFX
  - J4. Ambience / room tone
  - J5. Mixing & mastering targets
- **Part K — Edit & rhythm**
  - K1. Pacing
  - K2. Cuts & transitions
  - K3. Retention devices
- **Part L — Engineering**
  - L1. Determinism
  - L2. Performance & render speed
  - L3. Code structure & templates
  - L4. Automated QA
- **Part M — Delivery**
  - M1. Masters & formats
  - M2. Vertical cuts
  - M3. Thumbnails
  - M4. Captions/SRT, metadata
- **Part N — Workflow with the user**
- **Part O — The final gate (master checklist)**
- **Part P — Reference library**
- **Part Q — Glossary**
- **Part R — Scoring rubric**
- **Part S — Worked example shot**
- **Part T — Per-shot-size spec tables**
- **Part U — Emotion → everything map**
- **Part V — Bug → fix encyclopedia**
- **Part W — Per-set look sheets**
- **Part X — Department checklists**
- **Part Y — Iteration protocol**
- **Part Z — One-page summary**

---

# PART A — PHILOSOPHY & THE BAR

## A1. The prime directive

Every frame must be good enough to be someone's phone wallpaper. Every second must contain
**something moving** and **something audible**. Every shot must serve **one story beat** and only one.
"Fine" is a failure. If you would not pause on a frame, it does not ship.

## A2. The five tests every frame must pass

Run these mentally on every keyframe still, and literally on the contact sheet (L4).

| # | Test | Pass condition |
|---|---|---|
| 1 | **Squint test** | Blur your eyes: the subject is the brightest / highest-contrast area and is where the eye lands first. |
| 2 | **Silhouette test** | Fill the subject black: the pose and the action still read. |
| 3 | **Grayscale test** | Desaturate: there are at least 3 clear value layers (foreground / subject / background). |
| 4 | **Thumbnail test** | Shrink to 320×180: you can still tell what is happening and who feels what. |
| 5 | **Mute test** | Watch without sound: the story still reads. Then **listen with eyes closed**: the story still reads. |

## A3. What "insane" means, concretely

"Insane" is not "more effects". It is **more intention per frame**. Measurable targets:

- **Depth:** ≥ 3 depth layers in every shot, separated by DOF, fog and value.
- **Light:** every hero face has key + rim + catch-light. Every scene has ≥ 1 animated light.
- **Motion:** at any frame, ≥ 2 things are moving (character, camera, light, particles, UI).
- **Sound:** no stretch of > 1.5 s without a designed sound event on top of ambience.
- **Detail:** 3–5 storytelling details per set (posters, clock, scuffs, a sticker, a plant).
- **Variation:** no two consecutive shots share lens + angle + framing size.
- **Surprise:** a "screenshot moment" at least every 20–25 seconds.
- **Polish:** zero flash frames, zero popping, zero clipped audio, zero unreadable text.

## A4. Failure modes that make a video look cheap

Check for and kill all of these:

1. Flat, single-colour objects (no albedo variation, no roughness variation).
2. Pure black shadows or pure white highlights.
3. Faces without a rim light; faces without catch-lights in the eyes.
4. Characters floating (no contact shadow, no AO where feet meet floor).
5. Heads cropped at the eyebrows or chin in a non-deliberate way (see the v04 lockers shots).
6. Hard-edged primitives (sharp-edged boxes). Everything gets a bevel (`RoundedBox`, radius ≥ 2% of size).
7. Linear easing on anything.
8. Characters standing still with no breathing/blinking.
9. Text appearing with no animation, or animating with no sound.
10. Music fighting the voice; SFX louder than dialogue.
11. Exposure jumping between cuts (§52.1, §54).
12. Over-blurred DOF that hides the subject (§54.2).
13. Screens/practicals brighter than faces (§54.3).
14. Cluttered UI where several meters overlap (§54.4).
15. The same camera move twice in a row.
16. Whispering or inconsistent VO register (§54.1).

---

# PART B — PRE-PRODUCTION

Never skip a phase. Show the user the output of each phase before spending render time on the next one.

## B1. Brief (`brief.md`)

Must contain, in this order:

1. **Logline** (one sentence, ≤ 25 words).
2. **Audience** (age range, platform, what else they watch).
3. **Length** and **format** (16:9 main, 9:16 cut-downs).
4. **The promise**: what the viewer gets that makes them stay.
5. **Three emotional beats** (e.g. wonder → dread → warmth).
6. **The ending image** (describe the last frame exactly).
7. **The hook** (first 3 seconds, described shot by shot).
8. **The comment bait**: the question viewers will argue about.
9. **Constraints** (budget for TTS credits, render time, deadline).

## B2. Research & references (`refs/`)

- Collect 10–20 reference stills into `refs/` (or links in `refs/README.md` if licensing forbids copying).
- For each ref, note *what* we're taking from it: lighting, palette, framing, acting, UI.
- Build a **mood board** contact sheet: `out/moodboard.png`.
- We take *techniques* from references, never characters, logos, music or exact designs.

## B3. Script (`script.md`)

- 150–165 words per minute of finished video.
- Every line must have a **visual idea** written next to it in brackets.
- Every 20–25 s: a new escalation, a joke with a number payoff, or a twist.
- Sentences ≤ 18 words. Spoken rhythm: short, short, long.
- Read aloud; mark breath points with `/`.
- No line may only *describe* what's on screen; it must add info or emotion.
- Final line must land on the ending image from B1.

## B4. Beat sheet & emotional curve (`beats.json`)

Each beat entry:

```json
{
  "id": "B07",
  "start": 72.4,
  "end": 88.0,
  "emotion": "paranoia",
  "intensity": 0.7,
  "grade": "coldTension",
  "music": "pulse_build",
  "screenshotMoment": "Mom's badge flickers to 61%"
}
```

- Plot intensity over time; it must rise overall with ≥ 2 dips (breathers).
- The biggest spike is at ~75–85% of runtime, not at the end.
- The last 10% resolves to warmth / clarity.

## B5. Storyboard & shot list (`storyboard.json` / `src/lie/shots.ts`)

Every shot entry MUST specify all of the following. A missing field fails `npm run validate`:

| Field | Example |
|---|---|
| `id` | `S014` |
| `beat` | `B07` |
| `duration` (s) | `3.4` |
| `set` | `lockers_night` |
| `characters` + `positions` | `[{"id":"kid","pos":[0,0,0],"facing":-20}]` |
| `size` | `ECU / CU / MCU / MS / MWS / WS / EWS` |
| `lens` | `85` |
| `angle` | `eye / low / high / dutch5` |
| `move.primary` | `push-in 0.4m, easeInOutCubic` |
| `move.secondary` | `handheld 0.3, rack focus 1.6→3.2m` |
| `lighting` | full gaffer block (E2) |
| `acting` | `glance left (8f), brows up, hold, exhale` |
| `ui` | `meter "LIE 61%" on mom, enter at 0.4s` |
| `vo` | line ids |
| `sfx` | cue list with frame offsets |
| `music` | section + intensity |
| `transition.in/out` | `hard cut`, `whip`, `match cut on shape`, `dip`... |
| `screenshot` | bool — is this a screenshot moment? |

## B6. Color script (`out/colorscript.png`)

- One keyframe per shot in a horizontal strip, in order.
- Must show a **deliberate** warm/cool journey that mirrors the emotion curve.
- No more than 3 consecutive shots in the same dominant hue.
- Each act gets a palette of 1 dominant + 1 accent + neutrals.

## B7. Sound map

- Timeline listing: VO lines, music sections, every SFX cue, ambience beds per scene.
- Every visual accent (UI pop, impact, cut, reveal) has a sound.
- Music changes land on beat boundaries.

---

# PART C — CHARACTERS

The characters are the #1 visual upgrade target. Plain spheres with painted faces read as "placeholder".

## C1. Silhouette & proportions

- Head : body ratio ≈ 1 : 1.1 (big head, toy-like).
- Head is **not** a perfect sphere: scale to `[1.0, 1.04, 0.96]` with a subtly flatter face plane.
- Body is a capsule with a slight taper (narrower at shoulders than hips by ~6%).
- Every character has a **unique silhouette**: hair shape, accessory, height (±8%), or body width.
- Neck: a short, darker cylinder (or AO shadow) to separate head from body.
- Hands: simple mitten shapes or spheres; if visible, they must animate (gesture, fidget).

## C2. Skin shading

- `meshPhysicalMaterial`: roughness 0.42, clearcoat 0.35, clearcoatRoughness 0.4, sheen 0.4, sheenColor slightly warmer than skin.
- **Fake subsurface:** add a warm (`#ff9a8a`) rim term via `onBeforeCompile` or a second slightly larger backface shell at 6% opacity with additive blend → warm glow at the silhouette edges when backlit.
- **Blush:** soft radial gradient on cheeks in the face texture, `#ff8fa3` at 18–25% opacity; intensifies with emotion (embarrassed, crying, warm).
- **Albedo variation:** low-frequency noise ±3% so the face isn't a CG flat colour.
- Never let skin go pure white: max value ≈ 0.92 after grade.

## C3. Eyes

The eyes sell life. Every eye needs:

1. **Sclera**: off-white (`#f6f1ea`), never pure white, with a faint top shadow from the lid.
2. **Iris/pupil**: dark, slightly oval, with a subtle colour (deep brown/violet), not pure black.
3. **Primary catch-light**: a crisp white dot at upper-left (matching key direction), 18–22% of pupil size.
4. **Secondary catch-light**: a smaller soft dot lower-right, 40% opacity.
5. **Wet specular**: if eyes are geometry, clearcoat 1.0 roughness 0.05 so they pick up Environment reflections.
6. **Blinks**: every 2–6 s (random, seeded), 6–8 frames at 60fps (close 2f, hold 1f, open 4f). Double-blink occasionally. Blink on head turns.
7. **Saccades**: tiny eye darts (1–3 px equivalent) every 0.8–2 s when listening/thinking.
8. **Eye leads the head**: on a look, eyes move 4–6 frames before the head turns.
9. **Pupil dilation**: +10% on surprise/love, −10% on fear/anger.
10. **Tears** (if needed): glossy bead geometry with transmission, plus a wet line on the lower lid.

## C4. Mouth, brows, lids, cheeks

- **Brows** are the main emotion driver. Library of shapes: neutral, raised, worried (inner up), angry (inner down), skeptical (one up), sad.
- Brows move **before** the mouth by 2–4 frames.
- **Eyelids**: upper lid position carries emotion (half-lidded = tired/skeptical, wide = shock). Lids are drawn as shapes that occlude the eye, not just scale.
- **Cheeks** squash up when smiling (the eye's lower edge rises).
- **Mouth library**: neutral, smile, big smile, smirk, frown, "o", wobble (sad), gritted, plus visemes (C9).
- Face swaps must **ease** (crossfade 3–4 frames or morph), never pop.

## C5. Hair & accessories

- Hair must have **volume and shape**, not a flat cap. Build from 3–8 overlapping rounded lumps (scaled spheres/capsules) with one or two stray tufts.
- Hair material: roughness 0.6, sheen 0.6 so it gets an anisotropic-looking highlight band.
- Hair has **secondary motion**: tufts lag head motion by 3–5 frames and overshoot 5–10%.
- Accessories (backpack, glasses, cap, headphones) define identity; each has its own subtle physics lag.

## C6. Clothing

- Hoodies/shirts: roughness 0.88, procedural fabric normal noise, seams as thin darker lines.
- At least one colour-accent per outfit that ties to the character's theme colour.
- Fabric folds: a few baked darker crease decals at elbows / waist.

## C7. Character bible

For every character, record in `prompts/<video>.md` or `CLAUDE.md` §42:

- Name, age, role, one-word personality.
- Theme colour (hex), outfit, accessory, silhouette feature.
- Default expression, default posture, signature gesture.
- Voice (if voiced): voice id, register, pace.
- Height relative to the hero.
- Do / don't (e.g. "Mom never crosses her arms").

## C8. Acting

- Every shot's acting is written as a **beat list** with frame counts (see B5).
- **Think → react → act**: show the thought (eyes/brows), then the reaction (body), then the action.
- **Weight shifts**: characters standing for > 2 s shift weight (body tilt ±2°, 30–40 frame ease).
- **Breathing**: chest/body scale Y ±1.2% over 3–4 s; faster when anxious.
- **Listening**: the non-speaking character always reacts (nods, blinks, glances).
- **Hold the moment**: big emotional beats get a 0.5–1.0 s hold with only breathing + one blink.
- **Avoid twins**: two characters in frame never do the same motion at the same time; offset by ≥ 6 frames.

## C9. Lip sync

- Driven by `public/vo/words.json` + a simple viseme map: `closed (MBP)`, `open (AA)`, `wide (EE)`, `round (OO)`, `F/V`, `rest`.
- Mouth opens **1–2 frames before** the sound (anticipation).
- Hold `rest` during pauses > 150 ms. No chattering mouth on silence.
- Volume-scale: mouth opening ∝ RMS of the line (clamped).

---

# PART D — SETS, PROPS & MATERIALS

## D1. Set design principles

- Sets are **film sets**: build only what the camera sees, plus 20% margin.
- Every set has: a floor with variation, walls with a gradient, a ceiling or sky, 1+ practical light source, and 3–5 storytelling details.
- Scale is in metres. Pill-person height ≈ 1.1 m.
- Each set has a **dominant colour** and an **accent colour** taken from the act palette (B6).
- Layout favours depth: corridors, doorways, things in the foreground.

## D2. Modelling rules

- Low-poly but **never sharp**: every box is `RoundedBox` (radius 0.02–0.06 m, smoothness 3–4).
- Bevelled edges catch the rim light — this is the single cheapest "premium" upgrade.
- Panel lines and seams as thin inset geometry or decals, not just colour changes.
- Windows have frames, sills and glass. Doors have handles and gaps.
- Vehicles: rounded body, wheel wells with AO, tyres darker with rim highlights, headlights emissive.

## D3. Material library (`src/style/materials.ts`)

All materials come from one module. No inline materials in shots.

| Name | Base | Roughness | Metal | Extras |
|---|---|---|---|---|
| `skin` | per character | 0.42 | 0 | clearcoat 0.35, sheen 0.4, fake SSS (C2) |
| `cloth` | per outfit | 0.88 | 0 | fabric normal noise |
| `hair` | per character | 0.6 | 0 | sheen 0.6 |
| `woodFloor` | `#6e4630` | 0.55 | 0 | plank seams, ±8% per-plank colour |
| `paintWall` | act colour | 0.9 | 0 | vertical gradient, baseboard |
| `lockerMetal` | act colour | 0.45 | 0.3 | vents, dents, stickers |
| `vehiclePaint` | per vehicle | 0.35 | 0.1 | clearcoat 0.8 |
| `glass` | `#cfe3ff` | 0.05 | 0 | transmission 0.9, thickness 0.02 |
| `screen` | content | 0.2 | 0 | emissive ≤ face luminance (E4) |
| `gold` | `#f2c46b` | 0.25 | 0.9 | emissive 0.1 |
| `felt` | `#1f6b4a` | 1.0 | 0 | sheen 1 |
| `concrete` | `#6b6870` | 0.95 | 0 | noise albedo ±6% |
| `plastic` | any | 0.4 | 0 | clearcoat 0.2 |

## D4. Surface variation & wear

- Every instanced object gets seeded ±5–10% albedo variation and ±0.05 roughness variation.
- Floors: darker patches near walls and under furniture (fake grime AO).
- Edges: slightly lighter (worn paint) on the outer bevels of lockers, doors, desks.
- Walls: subtle smudges near handles and switches.
- Nothing is perfectly aligned: rotate props ±1–3° randomly (seeded).

## D5. Storytelling details

Each set gets 3–5 details that say *where* and *who*:

- School: posters with readable short text, a clock showing a plausible time, a lost sock, stickers on lockers, a fire alarm.
- Home: fridge magnets, family photo frame, a plant, mail on the counter, a coat on a hook.
- Street: bus stop sign, puddle reflections, trash can, a cat (if budget allows).
- At least one detail per set **pays off** the story (a photo that matters later, a clock time that matches a line).

## D6. Props

- Props must have weight: when placed, a 2–3 frame settle with tiny bounce.
- Held props attach to the hand anchor and inherit lag.
- Phones/screens follow E4 (never brighter than faces).

---

# PART E — LIGHTING

## E1. Renderer & tone mapping

- Tone mapping: **AgX** for the whole video (or ACES — pick one, never mix).
- `outputColorSpace = SRGBColorSpace`, physically correct lights on.
- Shadows: `soft` + drei `<SoftShadows size={18} samples={12} focus={0.6} />`.
- `<Environment resolution={256} frames={1}>` with Lightformers (warm softbox, cool strip, dim top) in **every** scene.

## E2. Per-shot lighting plan

Write it like a gaffer, in the shot file:

```json
"lighting": {
  "key":   {"type":"spot","from":"camera-left-high","kelvin":3200,"power":70,"softness":0.9},
  "fill":  {"type":"point","from":"camera-right","kelvin":9000,"ratio":"1:4"},
  "rim":   {"type":"spot","from":"behind-right-high","kelvin":8000,"power":55},
  "kick":  {"type":"rectArea","from":"behind-left","color":"#ff7ad9","power":6},
  "bounce":{"type":"point","from":"floor","tint":"floor","power":4},
  "practicals":["fluorescent x3 flicker","exit sign red"],
  "atmos": {"fog":[6,18],"volumetric":"key","dust":90},
  "animated": "fluorescent flicker on #2, 0.4Hz drift ±8%"
}
```

Key-to-fill ratios: 1:2 happy · 1:4 default · 1:8 tension · 1:16 noir.
Kelvin: warm keys 2700–3500 K, cool fills 7000–10000 K, moonlight 12000 K tinted violet.

## E3. Faces

- Key highlight upper-left on the head, rim along the back edge, catch-lights in both eyes. Missing any = failed shot.
- Face luminance target: **0.55–0.72** (normalized) on the lit side in every shot. QA script checks this (L4).
- The face is the brightest *non-practical* element in the frame.
- Avoid flat front light: the key is ≥ 30° off the camera axis.
- Use a soft "eye light" (tiny point light near camera, very low power, no shadows) to guarantee catch-lights.

## E4. Practicals, screens & emissives

- Every light has a visible or implied source; show the source once per scene.
- Screens/phones: emissive intensity capped so their luminance ≤ face luminance (§54.3).
- Neon/signs: bloom-friendly emissive, but threshold set so only the tube glows, not the wall.
- Practical flicker is seeded and deterministic.

## E5. Atmosphere

- Fog colour = lifted shadow tone (e.g. `#14101f`), never grey.
- Volumetric cones on interior keys at 0.15–0.3 opacity.
- `GodRays` from windows / stadium lights where the source is in frame.
- Dust motes: 60–150 particles in key-light volume, slow drift + gentle sparkle when crossing the light.
- Exterior night: subtle haze + distant bokeh lights for depth.

## E6. Shadows & AO

- 1–2 shadow-casting lights max. Key shadow map 2048 (4096 for hero ECU), `normalBias 0.02`, tight frustum.
- `N8AO` tinted purple (`#1a1030`), never black.
- `ContactShadows` under every grounded character/prop (opacity 0.45, blur 2.5, far 1.2).
- Never use `AccumulativeShadows` (non-deterministic in Remotion).

## E7. Exposure consistency

- Per-shot exposure calibration lives in `src/lie/exposure_cal.json` (generated by `scripts/exposure_cal.py`).
- Adjacent shots: mean luma difference ≤ 8% unless the cut is a deliberate exposure change (logged in the shot).
- No single frame may exceed 2% clipped pixels (except deliberate flashes ≤ 3 frames).
- `scripts/luma_qa.py` must pass on every render.

---

# PART F — CAMERA

## F1. Lens package

| Lens | fov | Use |
|---|---|---|
| 24mm | 45 | establishing wides (max width) |
| 35mm | 38 | MS, two-shots, walking |
| 50mm | 30–32 | default storytelling |
| 85mm | 20–24 | CU, reactions |
| 135mm | 14–16 | ECU, eyes, inserts |

## F2. Composition

- Eyes on the upper-third line. Look room in the facing direction.
- **Headroom rules:** CU: top of head may crop, but never above the brows unless ECU on eyes. MCU: 5–10% headroom. MS and wider: 8–15% headroom.
- **Never crop at a joint**, the chin, or exactly at the top of the head.
- Foreground element in ≥ 50% of shots (blurred locker edge, doorframe, plant).
- Frames within frames; leading lines toward the subject.
- Horizon level unless deliberate dutch (≤ 8°, unease only).
- Respect the 180° line within a scene.
- UI meters must sit in negative space, never over faces.

## F3. Movement grammar

- Each shot = **1 primary move + 1 secondary layer**.
- Primary vocabulary: push-in, pull-out, truck, arc, crane, tilt-reveal, dolly-zoom (max once per video), whip.
- Ease every move (G2). Entry/exit speeds match across cuts.
- No two consecutive shots with the same primary move.
- Moves are motivated: push-in on realisation, pull-out on isolation, arc on reveal, crane on scale.

## F4. Focus & depth of field

- Focus distance is set per shot in metres via `focusFor()`.
- **DOF limits (§54.2):** subject must remain sharp; bokeh scale ≤ the shot preset maximum; background readable as shapes.
- Rack focus only when it carries meaning (attention shift), 12–24 frames, eased.
- Never animate focus during dialogue unless the line is about the thing being focused.

## F5. Handheld & shake

- Base handheld: seeded noise, amplitude 0.3 (calm) to 1.0 (panic), frequency 0.3–0.8 Hz.
- Impact shake: 6–10 frames, decaying, rotational more than positional.
- Shake never makes captions or UI unreadable — UI is in screen space.

---

# PART G — ANIMATION

## G1. Principles applied

| Principle | Pill-people application |
|---|---|
| Squash & stretch | Body scale on landings/jumps (±8%), volume preserved. |
| Anticipation | 4–8 frames counter-move before every action. |
| Staging | One clear action at a time; silhouette readable. |
| Straight-ahead / pose-to-pose | Pose-to-pose keys, eased in between. |
| Follow-through & overlap | Hair, accessories, UI elements lag 3–6 frames. |
| Slow in / slow out | Every interpolation eased. |
| Arcs | Head turns and hand moves travel on arcs, not lines. |
| Secondary action | Breathing, blinking, fidgets during holds. |
| Timing | Comedic beats are fast (6–10 frames), emotional beats slow (30–60). |
| Exaggeration | Push poses 20% further than "realistic". |
| Solid drawing | Consistent volumes from all angles. |
| Appeal | Asymmetry in poses; never perfectly symmetric faces. |

## G2. Easing vocabulary

- UI enter: `easeOutBack(1.4)` · UI exit: `easeInCubic` (faster than enter).
- Camera: `easeInOutCubic` / `bezier(0.45,0,0.2,1)`.
- Character settle: spring (damping 12–16, stiffness 120–180).
- Numbers counting: `easeOutExpo`.
- Impacts: `easeInQuad` into the hit, spring out.
- **Never linear**, except constant-speed things (conveyor, clock hand, scrolling bg).

## G3. Holds, anticipation, overshoot

- After every big action, a moving hold (breathing + 1 blink) of 12–30 frames.
- Overshoot 5–12% then settle for anything that "arrives".
- Anticipation scales with the size of the action.

## G4. Secondary & ambient motion

- Background characters: idle loops with offset phases.
- Environment: fluorescent flicker, swaying plant, drifting dust, passing headlights, clock ticking.
- UI: subtle idle pulse on meters (scale ±1.5%, glow ±10%) every 1.5–2.5 s.

## G5. Impact frames

For each major beat (reveal, twist, shock):

1. 1–2 frames of contrast spike (or inverted / tinted flash ≤ 3 frames, exposure-safe).
2. Chromatic aberration spike (0.001 → 0.004 → 0.001).
3. Camera shake (F5).
4. Sound: sub drop + transient + reverse riser before.
5. UI reacts (meters jolt, number jumps).

## G6. Nothing is ever frozen

Automated check: per-shot, compute frame-to-frame difference; any window ≥ 1.0 s with near-zero
motion fails unless the shot is tagged `deliberateStill`.

---

# PART H — POST-PROCESSING & GRADE

## H1. Effect chain (exact order)

1. `N8AO`
2. `DepthOfField`
3. `GodRays` (only with in-frame source)
4. `Bloom` (mipmapBlur, threshold 0.72, intensity 0.5–0.9)
5. `ChromaticAberration` (radial, 0.0006–0.001; spikes on impacts)
6. `HueSaturation` + `BrightnessContrast` (grade preset)
7. `LUT` (per act, generated `.cube`)
8. `Vignette` (offset 0.3, darkness 0.5–0.7)
9. Film grain (2D overlay, `Grain.tsx`, 3–5% opacity, animated per frame, seeded)

## H2. Grade per act

| Act emotion | Shadows | Mids | Highlights | Saturation |
|---|---|---|---|---|
| Wonder | violet | warm skin | cream gold | +10% |
| Fun | teal | warm | warm | +15% |
| Tension | deep blue | desaturated | cold | −15% |
| Loss | blue-grey | grey | soft | −30% |
| Warmth/resolution | warm brown | golden | cream | +5% |

Grade transitions happen **across a cut** or over ≥ 2 s; never visibly jump mid-shot.

## H3. Film emulation

- Grain always on (subtle). Halation: faint red-orange bloom around bright highlights.
- Gate weave: none (it fights UI). Letterbox: optional 2.39:1 bars for the most cinematic act only.

---

# PART I — 2D GRAPHICS, UI & TYPOGRAPHY

## I1. Design system

- Fonts: **Cinzel** (display, 600/700) and **Inter** (UI, 700), local files in `public/fonts/`.
- Colours come only from `src/style/tokens.ts` (`C.gold`, `C.cream`, `C.uiBg`, ...).
- Spacing scale: 4, 8, 12, 16, 24, 32, 48 px (at 1080p).
- Corner radius: pills = full; cards = 14 px.
- Every UI element has: background blur/plate (`uiBg`), 1 px inner highlight, soft drop shadow, and glow matched to its colour.

## I2. The signature meter/badge

- Anatomy: ring gauge + label (small caps, tracking +8%) + value (large, tabular numerals).
- Enter: scale 0.6 → 1.08 → 1.0 (easeOutBack), opacity 0 → 1 over 10 frames, + soft "tick" SFX.
- Value change: rolling numbers (`easeOutExpo`), ring sweeps, glow pulse on settle, SFX per step.
- Colour by value: low = cool teal, mid = gold, high = red; transitions interpolated in OKLCH.
- Tether line from badge to the character's head anchor (projected, I5), 1 px, 60% opacity, with a dot at the end.
- Max **2 meters on screen** unless the shot is a deliberate "crowd of meters" moment (§54.4), then stagger and scale by depth.

## I3. Titles & kinetic type

- Titles animate per word or per letter (stagger 2–3 frames), with motion blur.
- Big numbers get a slam: overshoot, shake, sound.
- Text is always on screen ≥ (words × 0.3 s + 1 s).
- Never put text over busy, high-contrast detail; use a plate.

## I4. Captions

- Word-by-word highlight (current word gold, spoken words cream, upcoming dimmed).
- Max 2 lines, max ~42 characters per line, bottom-centre, safe area 8%.
- Captions only while speech is happening (§52).
- Plate: `uiBg`, radius 10 px, padding 8/14.

## I5. Anchoring 2D to 3D

- Project 3D anchors to screen each frame (CLAUDE.md §15.4).
- Smooth with a critically damped spring to avoid jitter.
- Clamp inside the title-safe area; flip side if the anchor nears the edge.

---

# PART J — SOUND

## J1. Voice

- One narrator register for the whole video (§54.1): no whispers unless a line is tagged `whisper` by the user.
- Chain: highpass 70 Hz → de-ess → compressor (−20 dB, 2.5:1) → loudnorm −16 LUFS per line.
- Trim to 80 ms silence; the edit controls pauses.
- Check every take for mispronunciation, clicks, breaths cut mid-way.

## J2. Music

- Sections mapped to beats; transitions on bar lines.
- Under VO: duck by 9–12 dB with 120 ms attack / 400 ms release.
- Leave a **frequency pocket** for voice (cut 1–4 kHz by 3 dB under VO).
- Music must breathe: drop to near-silence before the biggest reveal, then return.
- Generated or licensed only; credit as required.

## J3. SFX

- Every UI event, cut, impact, character motion of note: has a sound.
- Layers: transient + body + tail. Big moments add sub (40–60 Hz) and a riser/reverse before.
- Foley for characters: footsteps (surface-specific), cloth rustle on gestures, squeaky toy-like body bumps.
- Pitch-randomise repeated sounds ±3% and volume ±1.5 dB (seeded).
- SFX never mask VO (peak ≥ 6 dB under VO while speech is active).

## J4. Ambience

- Each scene has a room-tone bed (school hallway hum, fridge buzz, street, night crickets).
- Ambience crossfades over cuts by 6–12 frames (J-cuts/L-cuts).
- Never pure digital silence except as a deliberate effect (≤ 1 s).

## J5. Mixing & mastering targets

| Target | Value |
|---|---|
| Integrated loudness | −14 LUFS (YouTube) |
| True peak | ≤ −1.5 dBTP |
| Dialogue range | VO always the loudest element when present |
| Music under VO | −22 to −26 LUFS short-term |
| Stereo | VO centre; SFX panned with on-screen position |

---

# PART K — EDIT & RHYTHM

## K1. Pacing

- Average shot length 2.5–4.5 s; hook section 1–2 s.
- Vary shot lengths — no 4 in a row of the same length (±0.3 s).
- Cut on action or on the end of a thought, never mid-gesture without reason.

## K2. Cuts & transitions

- Default: hard cut. Specials: match cut (shape/colour/motion), whip pan, light-wipe, dip to black (act breaks only).
- Sound leads picture by 4–10 frames on scene changes (J-cut).
- Every transition has a sound.

## K3. Retention devices

- Open loop in the first 10 s ("...and then it pointed at me").
- A new question or escalation every 20–25 s.
- Pay off every set-up; tease the twist once before it lands.
- End card under 5 s with a strong final image, no dead air.

---

# PART L — ENGINEERING

## L1. Determinism

- No `Math.random()` — use seeded random (`random(seed)` from Remotion).
- No time-based APIs (`Date.now`, `performance.now`) in render code.
- No frame-accumulating effects. `scripts/determinism.sh` must pass.

## L2. Performance & render speed

- Follow CLAUDE.md §53: render 3D at output size, 480-frame chunks, `scripts/render_chunks.sh`.
- Instanced meshes for repeated props; merge static geometry.
- Particles ≤ 300 per shot; shadows ≤ 2 lights.
- Draft renders at `--scale=0.5`, 30 fps; finals at 60 fps.

## L3. Code structure

- New shots start from `src/shots/_TEMPLATE.tsx`. Presets from `src/style/presets.ts`.
- All colours from `tokens.ts`; all materials from `materials.ts`.
- Each shot is pure: `(frame, props) → scene`.
- `npm run typecheck` and `npm run validate` must pass before any render.

## L4. Automated QA

Run all before showing anything to the user:

| Check | Tool | Pass condition |
|---|---|---|
| Types | `npm run typecheck` | 0 errors |
| Shot schema | `npm run validate` | every field in B5 present |
| Determinism | `npm run determinism` | identical frames |
| Exposure | `scripts/luma_qa.py` | E7 limits |
| Face luminance | `luma_qa.py` face-box mode | E3 range |
| Frozen frames | motion diff | G6 |
| Audio | `npm run qa` | J5 targets, no clipping |
| VO consistency | `scripts/vo_consistency.py` | register & level within tolerance |
| Contact sheet | still per shot | reviewed against A2 |

---

# PART M — DELIVERY

## M1. Masters

- 1920×1080, 60 fps, H.264 high, CRF 16–18, AAC 320 kbps, mastered (`npm run master`).
- File naming: `releases/<slug>_v<NN>_<fps>.mp4`.

## M2. Vertical cuts

- 1080×1920, ≤ 60 s each, re-framed (not cropped blindly): re-render with vertical camera presets.
- Captions larger (+30%), positioned above the platform UI safe zone.
- Hook in the first 1 s.

## M3. Thumbnails

- 3 variants (A/B/C), 1280×720.
- One face with a strong expression + one big number/meter + ≤ 4 words.
- High contrast, readable at 160 px wide. Rendered from the 3D scene at 2× then graded.

## M4. Captions & metadata

- `.srt` generated from `words.json` (`scripts/make_srt.py`).
- Title, description, chapters (from beats), tags in `releases/<slug>_meta.md`.

---

# PART N — WORKFLOW WITH THE USER

1. Show the artifact at every gate (brief, script, colour script, stills, draft, final).
2. Always present **contact sheets**, not single frames, for look reviews.
3. When the user gives feedback, convert it into a **numbered rule** in `CLAUDE.md` (like §52, §54) so it never regresses.
4. Before spending credits (TTS) or long renders, give the estimate and wait for approval.
5. Version every release (`v01`, `v02`, ...) with a changelog line in the commit.

---

# PART O — THE FINAL GATE (MASTER CHECKLIST)

Nothing ships until every box is ticked. Copy this into the release commit or PR.

**Story**
- [ ] Hook works muted in the first 3 s
- [ ] Screenshot moment every ≤ 25 s
- [ ] Emotional curve matches `beats.json`
- [ ] Ending image matches the brief

**Characters**
- [ ] Non-spherical heads, unique silhouettes
- [ ] Eyes: two catch-lights, blinks, saccades
- [ ] Brows lead the mouth; no popping face swaps
- [ ] Hair has volume and secondary motion
- [ ] Lip sync with anticipation; rest on silence
- [ ] Listeners react

**Sets & materials**
- [ ] All edges bevelled
- [ ] Albedo/roughness variation on everything
- [ ] 3–5 storytelling details per set
- [ ] Contact shadows + AO grounding

**Lighting**
- [ ] Key + rim + catch-light on every hero face
- [ ] ≥ 1 animated light per scene
- [ ] Face luminance in range; screens dimmer than faces
- [ ] Exposure consistent across cuts (luma QA pass)

**Camera**
- [ ] Headroom rules respected; no awkward crops
- [ ] No repeated lens+angle+size in consecutive shots
- [ ] DOF within limits; subject sharp

**Animation**
- [ ] No linear easing; anticipation/overshoot present
- [ ] No frozen windows ≥ 1 s
- [ ] Impact frames on every big beat

**Graphics**
- [ ] ≤ 2 meters on screen (unless deliberate)
- [ ] UI never covers faces
- [ ] Captions synced, ≤ 2 lines, readable at mobile size

**Sound**
- [ ] VO consistent register, always on top
- [ ] Music ducked, pocketed, breathes before reveals
- [ ] Every visual accent has a sound
- [ ] −14 LUFS, ≤ −1.5 dBTP, no clipping

**Engineering & delivery**
- [ ] typecheck, validate, determinism, qa all pass
- [ ] 16:9 master, vertical cuts, 3 thumbnails, SRT, metadata

---

# PART P — REFERENCE LIBRARY

Use for technique, never copy designs, characters or music.

**Look & storytelling**
- Pixar shorts (lighting, acting, appeal) — study "Piper", "Bao", "Purl".
- Kurzgesagt (graphic clarity, colour scripts, explainer rhythm).
- Spider-Verse / Arcane (stylised rendering, impact frames, graphic overlays).
- ArtStation: search "stylized character lighting", "low poly diorama", "toy render".

**Lighting & cinematography**
- Roger Deakins interviews & "Deakins podcast" (motivated light).
- "Blender Guru — lighting fundamentals" (key/fill/rim, exposure).
- "Cinematography Database" (lens choice, composition).

**Animation**
- *The Animator's Survival Kit* — Richard Williams.
- Alan Becker "12 Principles of Animation" (YouTube).

**Tech**
- Remotion + Three: https://www.remotion.dev/docs/three
- drei: https://drei.docs.pmnd.rs (`Environment`, `Lightformer`, `SoftShadows`, `ContactShadows`, `RoundedBox`, `SpotLight volumetric`, `MeshTransmissionMaterial`)
- postprocessing: https://github.com/pmndrs/postprocessing (`N8AO`, `GodRays`, `LUT`, `DepthOfField`)
- three.js examples: https://threejs.org/examples (subsurface scattering, volumetric light)
- Colour: https://oklch.com, https://meshgradient.com

**Sound**
- "Sound design for animation" talks (Ben Burtt, Randy Thom).
- EBU R128 / YouTube loudness guidance.

---

# PART Q — GLOSSARY

- **Key / fill / rim / kicker / bounce**: main light / shadow-filling light / back edge light / coloured accent on the shadow side / light reflected up from the floor.
- **Catch-light**: the white reflection in an eye.
- **ECU/CU/MCU/MS/WS**: extreme close-up / close-up / medium close-up / medium shot / wide shot.
- **J-cut / L-cut**: audio of the next shot starts early / audio of the previous shot continues.
- **Moving hold**: a "still" pose that keeps tiny motion alive.
- **Viseme**: mouth shape for a group of sounds.
- **LUFS / dBTP**: loudness unit / true-peak level.
- **Screenshot moment**: a frame strong enough that viewers would pause and share it.

---

# PART R — SCORING RUBRIC (grade every shot 0–5)

Before a shot is approved, score it. **A shot ships only if every row ≥ 4 and the total ≥ 52/60.**
Record the scores in the shot file comment: `// score: L5 C4 M5 ...`.

| # | Axis | 0–1 (fail) | 2–3 (ok) | 4–5 (insane) |
|---|---|---|---|---|
| 1 | Light (L) | flat, no rim | key+fill only | key/fill/rim/kick/bounce, motivated, animated |
| 2 | Composition (C) | crop at brows, centred dead | thirds-ish | thirds, look room, foreground frame, 3+ depth layers |
| 3 | Motion (M) | static camera or frozen character | one move | primary move + secondary layer + character life |
| 4 | Acting (A) | pose holds, no thought | expression change | eyes lead, thought change, asymmetry, overlap |
| 5 | Face (F) | flat eyes | catch-light | two catch-lights, brows, blush, saccades, blinks |
| 6 | Materials (Mt) | flat colours | roughness varied | bevels, wear, variation, reflections |
| 7 | Atmosphere (At) | none | fog | fog + dust + volumetric / god rays |
| 8 | Grade (G) | inconsistent | act grade | act grade + LUT + matched to neighbours |
| 9 | UI (U) | covers face / pops | animated | entry/life/exit, sound, anchored, in lane |
| 10 | Sound (S) | silent accents | most accents | every accent, panned, layered, mixed under VO |
| 11 | Story (St) | unclear purpose | readable | one clear beat, screenshot-worthy |
| 12 | Tech (T) | flicker / flash | passes QA | passes QA + determinism + luma within ±10% |

---

# PART S — WORKED EXAMPLE: ONE SHOT, FULLY SPECIFIED

This is what "no detail missed" looks like. Every new shot is written at this level **before** coding.

```jsonc
{
  "id": "S031",
  "beat": "B09 — Mom's meter flickers",
  "duration": 3.6,                      // seconds
  "set": "kitchen_evening",
  "act": "tension",
  "size": "MCU", "lens": 85, "fov": 22, "angle": "eye, slight low (−4°)",
  "composition": {
    "subject": "mom", "eyesOn": "upper third", "lookRoom": "frame-left 40%",
    "foreground": "blurred cereal box edge frame-right, 12% of width",
    "depthLayers": ["cereal box (fg, blurred)", "mom (sharp)", "counter + fridge (mid)", "window dusk (bg, blurred)"]
  },
  "camera": {
    "primary": "push-in 0.35 m over 3.2 s, bezier(0.45,0,0.2,1)",
    "secondary": "handheld amp 0.45 (tension), rack focus 0 (locked on mom)",
    "anticipation": "pull back 2% over first 6 beats"
  },
  "focus": { "target": "mom.head", "bokehScale": 3 },
  "lighting": {
    "key":   { "type": "spot", "from": "window frame-left high", "kelvin": 3400, "power": 55, "softness": 0.9 },
    "fill":  { "type": "point", "from": "camera-right", "kelvin": 9000, "ratio": "1:8" },
    "rim":   { "type": "spot", "from": "behind-right high", "kelvin": 8000, "power": 50 },
    "kick":  { "type": "rectArea", "from": "behind-left", "color": "#ff7ad9", "power": 5 },
    "bounce":{ "from": "counter", "tint": "#8a5a3c", "power": 3 },
    "eyeLight": { "power": 0.6 },
    "animated": "key Kelvin 3400 → 4600 over 1.0 s at t=1.8 (mood turns cold)",
    "atmos": { "fog": [5, 16], "dust": 70, "volumetric": "key, opacity 0.2" }
  },
  "acting": [
    "0.00 neutral smile, breathing 0.25 Hz",
    "0.40 eyes dart to camera-left (2 beats), head follows (+4 beats)",
    "1.20 brows inner-up 6 beats before mouth flattens",
    "1.80 blink (forced by head turn), smile fades to worried over 10 beats",
    "2.40 moving hold: head drift 1.5°, breathing quickens to 0.45 Hz",
    "3.20 single slow blink, hold"
  ],
  "ui": [
    "meter 'LIE' on mom.head, enters 0.30 s (easeOutBack 1.4, 10 frames)",
    "value rolls 12 → 61 % (easeOutExpo, 20 frames) at 1.80 s, ring sweeps, colour gold → red (OKLCH)",
    "glitch flicker 3 frames at 1.80 s, pulse ring on settle"
  ],
  "vo": ["L019"],
  "sfx": [
    "0.30 pop_small vol 0.22 pan −0.2",
    "1.75 riser_short end at 1.80",
    "1.80 tick ×8 (spaced by ease) vol 0.25",
    "1.80 glitch vol 0.3",
    "2.05 impact_light vol 0.45 (after the word, never on it)"
  ],
  "ambience": "amb_kitchen_evening 0.22, pre-lapped 0.4 s",
  "music": "tension pad, ducked to 0.35× under L019",
  "grade": "tension, exposure from exposure_cal.json",
  "transition": { "in": "hard cut on action (head turn)", "out": "L-cut: fridge hum carries 0.5 s" },
  "screenshot": true,
  "qa": { "faceLuma": [0.55, 0.72], "maxMeters": 1, "captionLane": "clear" }
}
```

---

# PART T — PER-SHOT-SIZE SPEC TABLES

## T1. Framing numbers

| Size | Head height (% frame) | Headroom | Lens | Camera distance (fov) | Badge placement |
|---|---|---|---|---|---|
| EWS | < 8% | n/a | 24 | 10–20 m | above head, small (0.62×) |
| WS | 8–15% | 15% | 24–35 | 6–10 m | above head |
| MWS | 15–25% | 12% | 35 | 4–6 m | above head |
| MS | 25–35% | 10% | 50 | 3.5–4.5 m | above head |
| MCU | 35–50% | 6–8% | 50–85 | 3.1–3.6 m (fov 30) | above / beside head |
| CU | 50–70% | 0–4% (top of head may crop) | 85 | 2.4–3.0 m (fov 22) | beside head |
| ECU | > 70% | crop allowed above brows only | 135 | 2.5–3.5 m (fov 15) | beside, or none |

## T2. Light multipliers by shot size (white heads reflect a lot)

| Size | Key × | Rim × | Bloom intensity | Exposure offset |
|---|---|---|---|---|
| WS | 1.0 | 1.0 | 0.7 | 0 |
| MS | 0.85 | 1.1 | 0.65 | 0 |
| MCU | 0.7 | 1.2 | 0.6 | −0.1 EV |
| CU | 0.6 | 1.3 | 0.55 | −0.2 EV |
| ECU | 0.5 | 1.3 | 0.5 | −0.3 EV |

## T3. DOF by shot size (bokehScale 3 cap)

| Size | Focus target | Focal length | Background state |
|---|---|---|---|
| WS | hero body | 0.02 | shapes readable |
| MS | hero head | 0.03 | soft |
| MCU/CU | near eye | 0.035 | melted, but silhouettes read |
| ECU | the eye / prop | 0.04 | melted |

---

# PART U — EMOTION → EVERYTHING MAP

One emotion value drives every department. Pick the row, apply all columns.

| Emotion | Key:fill | Kelvin key | Grade | Camera | Handheld | Music | Face | Pace (avg shot) |
|---|---|---|---|---|---|---|---|---|
| Wonder | 1:2 | 3200 | wonder | slow crane/push | 0.2 | pad + bells | wide eyes, sparkle catch-lights | 3.5 s |
| Fun | 1:2 | 3000 | fun | snappy orbits, whips | 0.3 | plucks, kick/hat | big smiles, bouncy | 2.0 s |
| Smug | 1:4 | 3200 | fun | low angle, slow push | 0.25 | pluck motif | half lids, smirk, tilt | 3.0 s |
| Suspicion | 1:6 | 3800 | tension | slow push, dutch 3° | 0.4 | drone | skeptical brow | 3.0 s |
| Tension | 1:8 | 4500 | tension | creeping push, rack focus | 0.5 | drone + heartbeat | worried brows, darting eyes | 2.5 s |
| Shock | 1:8 | 5000 | tension | punch-in fov −1.5°, shake | 0.9 | hit + silence | dilated pupils, "o" mouth | 1.5 s |
| Loss | 1:16 | 6500 | consequence | slow pull-out, high angle | 0.15 | solo piano | sad brows, wet eyes | 4.5 s |
| Warmth | 1:3 | 2900 | triumph | slow arc | 0.2 | full motif, warm | soft smile, blush up | 4.0 s |

---

# PART V — THE BUG → FIX ENCYCLOPEDIA

| Symptom | Root cause | Fix |
|---|---|---|
| Head looks like a white ball | key too strong, no rim, flat face | T2 multipliers, rim ×1.3, face upgrades (C2–C4) |
| Face looks pasted on | painted texture without lighting cues | blush, lid shadow, iris gradient, SSS glow |
| Hair looks like a helmet | single smooth shell | fringe lumps, tufts, sheen, secondary motion |
| Sets look like a toy box | sharp flat boxes | RB bevels, variation, wear, details |
| Scene looks empty | no atmosphere | fog + dust + volumetric + background life |
| Cuts feel jumpy | exposure / grade mismatch | exposure_cal, neighbour luma ≤ 30 |
| Video feels slow | long static holds | 2.5–3.5 s avg, ≥ 2 moving things per frame |
| Video feels chaotic | too many moves / UI | 1 primary move, ≤ 2 meters, ≤ 2 overlay families |
| Character feels dead | no breathing / blinks / saccades | G4, C3, C8 |
| Movement feels robotic | linear easing, synced joints | G2 curves, offset timing |
| Badge jitters | per-frame projection noise | spring-smoothed anchor (I5) |
| Voice sounds like two narrators | whispered takes | §54.1 register tags, vo_consistency.py |
| Music drowns voice | no ducking / pocket | duckAt, 2–5 kHz dip |
| One white frame | bright practical in fg bokeh | §52.1 practical rule |
| Render differs on re-run | Math.random / time uniforms | L1 determinism |

---

# PART W — PER-SET LOOK SHEETS

Each set must ship with a look sheet: palette, light plan, details, ambience, signature shot.

| Set | Dominant / accent | Key source | Practicals | 5 details | Ambience | Signature shot |
|---|---|---|---|---|---|---|
| Bedroom | deep blue / warm lamp | lamp 2700 K | lamp, phone, alarm LED | posters, rug, clothes pile, glow stars, alarm clock | night air, clock tick | overhead on bed |
| Kitchen | warm wood / teal fridge | window dusk 3400 K | pendant lamp, oven clock | magnets, fruit bowl, mail, kettle, family photo | fridge hum | through-the-fridge-door shot |
| Classroom | pale lavender / gold | window 5600 K | projector | whiteboard text, clock, posters, backpacks, globe | fans, murmur | low angle from desk level |
| Hallway | purple / teal | fluorescents | exit sign | lockers w/ stickers, trophy case, poster, fire alarm, lost sock | hum + distant chatter | long-lens down the corridor |
| Gym (casino night) | dark / hot amber | pool lamps | banner, string lights | chip stacks, cards, felt, balloons, scoreboard | murmur + jingles | top-down on the table |
| Bathroom | cold tile / mirror light | mirror strip | mirror strip | tiles, toothbrush cup, towel, sticky note, mirror crack | drip, hum | the mirror reveal |
| Street | night violet / sodium orange | streetlight 2200 K | bus lights, signs | bus stop sign, puddles, trash can, poster, cat | traffic, wind | low puddle reflection |
| Rooftop | dusk gradient / city lights | sky | city bokeh | AC units, railing, antenna, water tower, pigeons | wind, distant city | silhouette against sky |
| Void | near-black / gold | top spot | floor glow ring | floating dust, ring, title, meter, none else | sub drone + air | slow crane over hero |

---

# PART X — DEPARTMENT CHECKLISTS (per shot, tick in the shot file)

**Director**
- [ ] One beat, one idea, one screenshot moment if tagged
- [ ] Shot serves the emotion row (Part U)

**DP / camera**
- [ ] Lens from package, framing from T1
- [ ] Primary + secondary move, eased, anticipation
- [ ] Foreground element (if ≥ 50% quota not yet met)
- [ ] Focus on the subject; bokeh ≤ 3

**Gaffer**
- [ ] Key, fill (ratio from U), rim, kick, bounce, eye light
- [ ] Animated light present in scene
- [ ] Face luma 0.55–0.72; screens ≤ face

**Animator**
- [ ] Timing chart written first
- [ ] Eyes → head → body offsets, overlap, asymmetry
- [ ] Thought change visible; blinks; breathing; saccades

**Set / props**
- [ ] Bevels, variation, wear; 3–5 details visible in frame
- [ ] Contact shadows on everything grounded

**Graphics**
- [ ] Entry / life / exit, sound on every change
- [ ] In lane, not over a face, ≤ 2 meters

**Sound**
- [ ] Every accent has a cue; hits after words; panned
- [ ] Ambience pre-lap; music ducked

**Editor**
- [ ] Shot length fits the emotion pace
- [ ] Cut on action; J/L cut where planned

**QA**
- [ ] Rubric (Part R) ≥ 52/60, no row < 4

---

# PART Y — ITERATION PROTOCOL

1. Render stills (first / middle / last frame) of every changed shot at half scale.
2. Build a before/after sheet (`out/before_after.jpg`) for every visual change.
3. Score with Part R. Fix the lowest row first.
4. Send the sheet to the user; turn feedback into numbered rules (new §5x in CLAUDE.md).
5. Tick the item in `UPGRADE_BACKLOG.md`.
6. Only then render a draft clip; only after approval render the master.

---

# PART Z — THE ONE-PAGE SUMMARY (read this if nothing else)

1. Every frame a wallpaper; every second moving and audible.
2. Faces: key + rim + two catch-lights, brows lead, blinks, saccades, blush.
3. Sets: bevels, variation, wear, 3–5 details, contact shadows.
4. Light: motivated, ratio by emotion, one animated light per scene, fog + dust.
5. Camera: lens package, thirds, headroom table, one move + one layer.
6. Animation: never linear, never frozen, eyes lead, overlap, asymmetry.
7. Grade: per act, exposure consistent across cuts.
8. UI: gold/cream/red only, entry–life–exit, never on a face, always with sound.
9. Sound: voice always wins, every accent heard, ducked music, planned silence.
10. QA: typecheck, validate, determinism, luma, loudness, rubric ≥ 52/60.
