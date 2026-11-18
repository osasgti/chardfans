# FIX LIST v2: 120 concrete fixes and upgrades

> Companion to `MASTER_PROMPT_INSANE.md` (the bar) and `UPGRADE_BACKLOG.md` (the wishlist).
> **This file is different:** every item is written so a session can build it without guessing.
> Format per item: **Problem** (seen in a real render/still) → **Fix** (exact change) → **Where** → **Done when** (checkable).
> Tags: 🔴 visible bug · 🟠 quality gap · 🟢 new capability. Size: S < 1h · M ≈ half day · L ≥ 1 day.
> Work top-down inside each section. Tick `[x]` and add the commit hash when done.

---

## A. Characters: faces (1–14)

- [ ] **1 🟠 S: Eyes are flat discs on wide shots.** Fix: scale catch-light radius by 1/shot-size so it stays ≥2px at 960px wide. Where: `Face.tsx` draw(), pass `size` from engine. Done when: catch-lights visible in a WS still at 50% scale.
- [ ] **2 🟠 S: Happy eyes have no catch-light.** Fix: add a 2px white dot above each `^` arc. Where: `Face.tsx`, `expr === 'happy'` branch. Done when: Mom's happy close-up shows highlights.
- [ ] **3 🟠 S: Smug lid is a hard rectangle cut.** Fix: replace the destination-out rect with an arc-shaped lid (quadraticCurve) + 1px lash line. Where: `Face.tsx` smug branch. Done when: no straight horizontal cut visible in a CU.
- [ ] **4 🟢 M: No pupil dilation per emotion.** Fix: add `pupil` scale (shock 1.12, fear 0.88) on the iris ellipse. Where: `Face.tsx`. Done when: shock CU eyes visibly larger than neutral.
- [ ] **5 🟢 M: Eyes never look at the speaker.** Fix: engine computes `look` toward the talking cast member's screen x (±6px), else saccades. Where: `engine.tsx` Actor `look=`. Done when: in two-shots the listener's eyes point at the talker.
- [ ] **6 🟢 S: No tear state.** Fix: `expr: 'cry'` = sad + glossy lower-lid line + tear bead (gradient ellipse) sliding down 0.4px/beat. Where: `Face.tsx`. Done when: the "she was hurt" beat can use it.
- [ ] **7 🟠 S: Brows don't move during speech.** Fix: raise brows +3px on stressed words (word length ≥6 or ALL CAPS in timeline). Where: `engine.tsx` mouthAt → also return `browLift`. Done when: brows move during "did NOT eat".
- [ ] **8 🟠 S: Blush identical on every character.** Fix: per-character blush tint and strength in `CAST` (dad 0.1, maya 0.25). Where: `engine.tsx` CAST + `Face.tsx`. Done when: dad's face reads less rosy than Maya's.
- [ ] **9 🟢 S: No freckles/marks to tell characters apart.** Fix: seeded freckle dots for maya/brother. Where: `Face.tsx`, `marks` prop. Done when: Maya identifiable in a CU without hair.
- [ ] **10 🟠 M: Mouth shapes are tiny at MS/WS.** Fix: scale mouth stroke/size up 1.4× when shot size ≥ med. Where: engine passes size → Face. Done when: talking is readable in a MS still.
- [ ] **11 🟢 M: No teeth on big smiles.** Fix: white band clipped inside smile arc when `expr==='happy'` and mouth open. Where: `Face.tsx`. Done when: laughing frames show teeth.
- [ ] **12 🔴 S: Face texture crossfades are instant.** Fix: keep previous expr and blend alpha over 3 beats on change. Where: `Face.tsx` (two canvases) + engine passes `prevExpr`, `exprT`. Done when: no popping between shots that change expression mid-shot.
- [ ] **13 🟢 S: Glasses have no lens glint.** Fix: thin diagonal white line on each lens at 40% opacity. Where: `Pill.tsx` Glasses. Done when: dad's glasses catch light.
- [ ] **14 🟠 S: Eye whites missing.** Fix: optional sclera ellipse behind iris for ECU only (keeps the cute style elsewhere). Where: `Face.tsx`, `ecu` flag. Done when: ECU eyes read as eyes, not dots.

## B. Characters: body & acting (15–32)

- [ ] **15 🟢 L: Reaction library.** Fix: `react: 'doubleTake'|'gulp'|'shrug'|'facepalm'|'deflate'|'celebrate'|'smugNod'` in CastSpec, each a keyed timeline of armL/armR/headTurn/headTilt/squash with anticipation + overshoot. Where: new `src/lie/reactions.ts`, used in `poseArgs`. Done when: 7 reactions render and validator accepts the field.
- [ ] **16 🟠 M: Arms snap between poses.** Fix: spring-interpolate arm angles from previous shot pose over 8 beats. Where: `poseArgs`. Done when: no arm pop at cuts within a scene.
- [ ] **17 🟢 M: No hand shapes.** Fix: mitten hand = sphere + thumb capsule; `hand: 'fist'|'open'|'point'`. Where: `Pill.tsx` arm(). Done when: point pose shows an index finger.
- [ ] **18 🟢 M: No elbows.** Fix: split arm capsule in two with a bend angle (default 12°, point 0°, phone 110°). Where: `Pill.tsx`. Done when: the phone pose reads as holding a phone, not a straight stick.
- [ ] **19 🟠 S: Torso never leans.** Fix: lean forward 6° when talking, back 8° when bored/smug. Where: `Pill.tsx`, new `lean` prop from engine. Done when: visible posture difference between talk and listen.
- [ ] **20 🟠 S: Shoulders static.** Fix: shoulder shrug offset (arm pivot y ±0.03) driven by breathing and shrug reaction. Where: `Pill.tsx`. Done when: shrug lifts shoulders.
- [ ] **21 🟢 M: No head nod on stressed words.** Fix: headTilt X ±2° impulse on stressed words. Where: engine Actor. Done when: speaking heads nod.
- [ ] **22 🟢 L: Real walk cycle.** Fix: 16-beat cycle, legs ±25°, arms ∓15°, bob 0.03 m at 2× frequency, root speed = stride/8 beats. Where: `poseArgs('walk')` + root offset. Done when: no foot sliding at 50% playback.
- [ ] **23 🟠 S: Run pose bobs but legs don't move.** Fix: drive leg rotation in run (10-beat cycle). Where: `Pill.tsx` legs get `legSwing`. Done when: legs alternate.
- [ ] **24 🟠 S: Sitting characters float above chairs.** Fix: sit offset tuned per set chair height (kitchen 0.45, classroom 0.42). Where: engine `sit`. Done when: no gap between body and seat in any sit shot.
- [ ] **25 🟢 M: Look-at body follow.** Fix: body rotY follows head turn at 20% with 6-beat lag. Where: engine Actor. Done when: big head turns pull the torso.
- [ ] **26 🟢 S: Squash on surprise.** Fix: when meter lands ≥90 on a character, squash 0.08 for 3 beats then spring. Where: engine (meter land → actor squash). Done when: high readings get a body reaction.
- [ ] **27 🟠 S: Characters in a group move in sync.** Fix: per-id phase offsets for breathing/drift already exist; also offset pose springs by random 0–6 beats. Where: engine. Done when: no two characters move identically in the classroom.
- [ ] **28 🟢 M: Background crowd variation.** Fix: 3 idle variants (sway, phone check, look around) chosen by seeded id. Where: `poseArgs('idle')`. Done when: classroom back rows don't look cloned.
- [ ] **29 🟢 S: Hood flop.** Fix: hood half-torus rotates with head pitch lag. Where: `Pill.tsx`. Done when: hood moves on nods.
- [ ] **30 🟢 S: Drawstring swing.** Fix: drawstrings pendulum from torso velocity (shift). Where: `Pill.tsx`. Done when: strings sway during weight shifts.
- [ ] **31 🟠 S: Hair follow-through only while talking.** Fix: also drive `turnLag` from turn changes across reactions. Where: engine. Done when: hair lags on reaction head snaps.
- [ ] **32 🟢 M: Smear frames.** Fix: on head snaps > 25°/2 beats, stretch head 1.25× along motion for 1–2 beats. Where: `Pill.tsx`. Done when: double-take shows a smear frame.

## C. Sets & props (33–52)

- [ ] **33 🟠 M: Floors are one flat colour.** Fix: plank colour variation ±8% seeded per plank + darker grime near walls. Where: `LieSets.tsx` Floor, `Set.tsx` Hallway. Done when: floor shows planks in a WS.
- [ ] **34 🟢 M: Hallway floor reflections.** Fix: `MeshReflectorMaterial` (resolution 512, blur [300,100], mixStrength 0.4) on GPU only; fallback to roughness 0.35 on CPU. Where: `Set.tsx`, gated by `FAST`. Done when: lockers reflect softly in the GPU render.
- [ ] **35 🟢 S: Lockers have no stickers/dents.** Fix: 2–3 seeded stickers (coloured circles) + a dent (darker bevel) per 4 lockers. Where: `Set.tsx`. Done when: lockers aren't identical.
- [ ] **36 🟢 M: Kitchen needs life.** Fix: fridge magnets, fruit bowl, kettle, mail stack, family photo. Where: `LieSets.tsx` Kitchen. Done when: 5 details visible in the kitchen wide.
- [ ] **37 🟢 M: Bedroom details.** Fix: glow-in-dark stars on ceiling, poster, clothes pile, rug, alarm clock with red 7-seg digits. Where: Bedroom. Done when: 5 details in the bedroom wide.
- [ ] **38 🟢 M: Classroom details.** Fix: whiteboard text ("TEST FRIDAY"), globe, backpacks by desks, wall clock, posters. Where: Classroom. Done when: board text readable in the classroom wide.
- [ ] **39 🟢 L: Stadium set.** Fix: stepped bleachers, railing, field plane, SEC signs, 200 instanced crowd, floodlights. Where: `LieSets.tsx` Stadium + `stadium` preset exists. Done when: a still renders at < 6s/frame CPU.
- [ ] **40 🟢 M: Vending machine prop.** Fix: emissive can grid, glass front, coin slot, price labels. Where: new `three/props/Vending.tsx`. Done when: usable via `extra: 'vending'`.
- [ ] **41 🟢 M: Roulette wheel.** Fix: wheel spin + ball decaying spiral, deterministic. Where: `three/props/Roulette.tsx`. Done when: gym shot can show it.
- [ ] **42 🟢 S: Dice prop.** Fix: rounded box with pips (instanced spheres). Where: `three/props/Dice.tsx`. Done when: renders in the gym.
- [ ] **43 🟠 S: Bus windows have no passengers.** Fix: 3 tiny pill silhouettes behind windows (dark, low detail). Where: engine Bus. Done when: bus reads as occupied.
- [ ] **44 🟠 S: Street has no road markings.** Fix: dashed centre line, kerb stripe, a manhole. Where: Street. Done when: road reads as road in the street wide.
- [ ] **45 🟢 S: Puddle reflections on the street.** Fix: 2 dark glossy discs (roughness 0.05) that pick up streetlights. Where: Street. Done when: glints visible.
- [ ] **46 🟠 S: Rooftop city is flat boxes.** Fix: lit windows already random; add rooftop water tanks/antennas and a dusk gradient sky plane. Where: Rooftop. Done when: skyline silhouette varies.
- [ ] **47 🟢 S: Bathroom details.** Fix: toothbrush cup, towel, sticky note on the mirror ("you got this"). Where: Bathroom. Done when: note readable in mirror CU.
- [ ] **48 🟢 S: Void set floor ring is plain.** Fix: second faint ring + slow-rotating dashed ring. Where: Void. Done when: hook shot has subtle motion on the floor.
- [ ] **49 🟠 S: Props sit perfectly aligned.** Fix: seeded ±2° rotation and ±1 cm offset on all small props. Where: prop placements in engine. Done when: nothing looks grid-snapped.
- [ ] **50 🟢 M: Wall gradients.** Fix: walls darker at the bottom (vertex colours) + baseboard shadow. Where: `Wall`, Hallway wall. Done when: walls aren't flat-lit.
- [ ] **51 🟢 S: Ceiling lights in hallway are white bars.** Fix: diffuser panel + frame + soft glow card. Where: `Set.tsx`. Done when: they look like fixtures.
- [ ] **52 🟢 M: Insert shots for details.** Fix: add 3 new 1-second inserts (clock 8:02, "BE HONEST" poster, phone screen) to the shot list. Where: `shots.ts`. Done when: validator passes and timing unchanged (use existing line time).

## D. Lighting (53–66)

- [ ] **53 🟢 M: GodRays from windows.** Fix: `GodRays` effect with the window plane as sun, samples 40, density 0.9, decay 0.94, weight 0.3; only kitchen/classroom/bedroom shots with the window in frame. Where: `Stage.tsx` PostFX + set exposes a ref. Done when: rays visible in classroom wide; determinism passes.
- [ ] **54 🟠 S: Key light ignores shot size.** Fix: multiply key by size factor (WS 1, MS 0.85, MCU 0.7, CU 0.6, ECU 0.5). Where: engine → Lights `keyI`. Done when: CU faces not hotter than WS faces (luma QA).
- [ ] **55 🟢 S: Kelvin shift on mood turns.** Fix: `keyShift: [fromK, toK, atSec]` per shot. Where: ShotSpec + Lights. Done when: the dad beat cools over 1s.
- [ ] **56 🟢 S: Fluorescent flicker in hallway.** Fix: seeded flicker on one tube (dip to 0.6 for 2 beats every ~6s). Where: `Set.tsx`. Done when: visible in a clip.
- [ ] **57 🟢 M: Passing car light sweep (street/bedroom night).** Fix: moving rectArea light across the wall every ~8s. Where: Street, Bedroom night. Done when: sweep visible in clip.
- [ ] **58 🟠 S: Rim light too weak on dark hair.** Fix: rim ×1.3 when cast hair is dark and shot ≤ MCU. Where: Lights. Done when: hair silhouettes separate from dark walls.
- [ ] **59 🟢 S: Window light gobo.** Fix: projected window-frame pattern on the floor (spotlight + map texture). Where: Kitchen/Classroom. Done when: frame shadow on floor.
- [ ] **60 🟢 S: Screen light on faces.** Fix: when a character holds a phone, add a weak cool point light at the phone (0.6). Where: engine Actor with `hold: 'phone*'`. Done when: underlit blue on the face in phone shots.
- [ ] **61 🟠 S: Bounce light same everywhere.** Fix: tint bounce by set floor colour (wood orange, tile cool, street grey). Where: Lights via preset. Done when: bathroom chins cool, kitchen chins warm.
- [ ] **62 🟢 S: Hero halo for reveals.** Fix: emissive card behind head (out of focus) for `reveal: true` shots. Where: engine. Done when: power-reveal shot glows.
- [ ] **63 🔴 S: exposure_cal.json is stale.** Fix: after the next full render run `scripts/exposure_cal.py` and commit. Where: `src/lie/exposure_cal.json`. Done when: every shot within ±25% of grade target.
- [ ] **64 🟠 S: Shadow acne risk at new CU distances.** Fix: verify normalBias 0.02 at 3.4 m; bump to 0.03 if stripes. Where: Lights. Done when: no stripes on faces at full scale.
- [ ] **65 🟢 M: Shadow frustum fit.** Fix: fit key shadow camera to a 6×6 m box around the subject. Where: Lights. Done when: shadow edges crisper in CUs.
- [ ] **66 🟢 S: Practical light source visible once per scene.** Fix: add a lamp/tube/window into at least one shot per set. Where: shots.ts camera yaw tweaks. Done when: every scene shows its light source.

## E. Camera & edit (67–80)

- [ ] **67 🟢 M: Dolly-zoom on the biggest shock.** Fix: set `move: 'dz'` on the mirror reveal shot. Where: shots.ts. Done when: background stretches while face stays same size.
- [ ] **68 🟢 S: Top-down signature shot per act.** Fix: add `pitch: 80` overhead variant for the dinner/classroom beats. Where: shots.ts. Done when: 1 overhead per act.
- [ ] **69 🟠 S: Camera never anticipates.** Fix: push moves start with a 2% pull-back over 6 beats. Where: camFor 'push'. Done when: subtle ease-back visible.
- [ ] **70 🟢 M: Speed ramp on orbits.** Fix: time-remap orbit progress (fast→slow at 60%→normal). Where: camFor 'orbitL/R'. Done when: orbit "hangs" at the key moment.
- [ ] **71 🟢 S: Rack focus between characters.** Fix: `focusFrom/focusTo` per shot animating focus over 12–24 beats + fov breathing 1.5%. Where: engine focus. Done when: two-shot rack works.
- [ ] **72 🟢 S: Foreground elements.** Fix: optional `fg: 'locker'|'plant'|'doorframe'` blurred object 0.8 m from camera. Where: engine. Done when: ≥50% of shots have fg depth.
- [ ] **73 🟠 S: Dutch angle in tension only.** Fix: `roll` up to 6° allowed only when grade=tension (validator warns otherwise). Where: camFor + validator. Done when: tension shots can roll.
- [ ] **74 🟢 M: Whip-pan transition.** Fix: wire existing `WhipStreak` to shots with `transition: 'whip'` + camera yaw spike in last/first 5 beats. Where: LieVideo. Done when: one whip per minute max.
- [ ] **75 🟢 S: Match cut helper.** Fix: validator check that an object's projected position matches across a `match: 'id'` cut (±40px). Where: validate_shots.mjs. Done when: script reports match error.
- [ ] **76 🟠 S: Shot length distribution.** Fix: script reports average and histogram of shot lengths; warn if >5s holds. Where: validate_shots.mjs. Done when: report prints.
- [ ] **77 🟢 S: Handheld scales with tension.** Fix: handheld amplitude ×(0.6 calm, 1.0 fun, 1.6 tension). Where: Stage `handheld` gets amp. Done when: tension feels shakier.
- [ ] **78 🟢 M: Impact frame stack helper.** Fix: `impact: sec` per shot → shake + fov punch + bloom/CA spike + flash ≤0.25 opacity. Where: engine + Stage `flash`. Done when: the 96% reveal hits hard.
- [ ] **79 🟢 S: Cut on action.** Fix: when consecutive shots share a character, start shot B with the head turn already 30% in. Where: engine reaction timing. Done when: cuts feel continuous.
- [ ] **80 🟢 S: Breath shot after reveals.** Fix: validator warns if a reveal shot is followed by a shot < 2.5s. Where: validate_shots.mjs. Done when: warning prints.

## F. Post & film look (81–90)

- [ ] **81 🟢 M: Halation.** Fix: custom postprocessing Effect: threshold highlights, blur, tint red-orange, add 10%. Where: new `src/three/Halation.ts`, in PostFX after Bloom. Done when: bright edges glow warm; determinism passes.
- [ ] **82 🟢 M: Real per-act LUT.** Fix: generate `.cube` files from the GradeTone colours (python script), load with `LUT` effect. Where: `scripts/make_luts.py`, `public/luts/`. Done when: GradeTone overlay can be turned off with same look.
- [ ] **83 🟢 L: Motion blur on fast shots.** Fix: `@remotion/motion-blur` CameraMotionBlur (6 samples) only on shots tagged `blur: true`. Where: LieVideo. Done when: whips/snaps are smeared; render time impact measured.
- [ ] **84 🟢 S: Anamorphic streaks.** Fix: horizontal blurred line overlay through projected positions of bright practicals. Where: FilmLook. Done when: lamps show a subtle horizontal streak.
- [ ] **85 🟢 S: Lens dirt.** Fix: faint smudge texture revealed by bright areas (screen-blend, masked by a bright-source position). Where: FilmLook. Done when: visible only when a lamp is in frame.
- [ ] **86 🟠 S: Grain identical across acts.** Fix: grain opacity from `GRADES[grade].grain`. Where: LieVideo Grain. Done when: consequence act grainier.
- [ ] **87 🟠 S: Vignette ignores grade.** Fix: already per grade; add +0.1 darkness on CU. Where: PostFX. Done when: CUs feel more intimate.
- [ ] **88 🟢 S: Letterbox animation.** Fix: bars slide in over 12 beats at act starts instead of being constant. Where: Overlays Letterbox. Done when: visible at act transitions.
- [ ] **89 🟢 S: Chromatic aberration spike on impacts.** Fix: tie `flash` to impact helper (#78). Where: Stage. Done when: CA spikes on hits.
- [ ] **90 🟢 S: Bloom per grade audit.** Fix: render 1 still per grade, measure highlight clipping %, cap ≤2%. Where: luma_qa.py add clip %. Done when: no grade clips >2%.

## G. UI, graphics, typography (91–102)

- [ ] **91 🟢 M: Callout component.** Fix: hand-drawn SVG arrow drawn on with pathLength + Cinzel caps label. Where: `overlay/Callout.tsx`. Done when: used once in the "rules" explanation.
- [ ] **92 🟢 M: Counter component.** Fix: big rolling number with label for "lies told today: 214". Where: `overlay/Counter.tsx`. Done when: used once.
- [ ] **93 🟢 M: BarRace component.** Fix: dot-bar comparison. Where: `overlay/BarRace.tsx`. Done when: renders in a void shot.
- [ ] **94 🟠 S: Meter tether is straight.** Fix: slight curved tether (quadratic) + dot pulse on land. Where: LieMeter. Done when: tether reads hand-placed.
- [ ] **95 🟢 S: Meter glitch for "?" mode.** Fix: RGB-split + jitter + scanline for 6 beats when mode='q'. Where: LieMeter. Done when: uncertain meters glitch.
- [ ] **96 🟢 S: Meter parallax.** Fix: offset meters by −3% of camera pan delta. Where: engine meter placement. Done when: meters feel in-scene during orbits.
- [ ] **97 🟠 S: Caption word timing pops.** Fix: active word fades in over 3 beats instead of instant colour switch. Where: Captions.tsx. Done when: smoother highlight.
- [ ] **98 🟢 S: Emphasis word shimmer in titles.** Fix: animated gold gradient on emphasis words. Where: Overlays Title. Done when: hook title shimmers.
- [ ] **99 🟢 M: Chapter cards.** Fix: void-set card with act title + number at each act break, 1.5s, with stinger. Where: LieVideo + shots. Done when: 4 chapter cards.
- [ ] **100 🟢 S: End card.** Fix: last 5s: hero silhouette + "WOULD YOU WANT IT?" + subscribe-safe area. Where: last shot. Done when: ending holds 1.5s then black.
- [ ] **101 🟠 S: UI never covers face (automated).** Fix: script projects head anchors + meter rects per shot, fails on overlap. Where: validate_shots.mjs. Done when: report prints zero overlaps.
- [ ] **102 🟢 S: Colour-blind safety.** Fix: meters ≥70% also show a ✕ glyph, ≤30% a ✓. Where: LieMeter. Done when: meaning readable in greyscale.

## H. Sound (103–112)

- [ ] **103 🟢 M: Stereo panning.** Fix: pre-render `_L`/`_R` variants (pan ±0.6) for pop/tick/whoosh in make_sfx.py; choose by projected x. Where: make_sfx.py + LieMeter cues. Done when: meters on the left sound left.
- [ ] **104 🟢 S: Ambience pre-lap.** Fix: start next set's ambience 0.4s before the cut, crossfade 1.2s. Where: LieVideo ambience beds. Done when: audible in clip.
- [ ] **105 🟢 M: Power motif.** Fix: 5-note motif rendered 4 ways (bells, pluck, low saw, piano) in make_sfx.py; place at each act start. Where: make_sfx.py + LieVideo cues. Done when: motif recurs.
- [ ] **106 🟢 S: Foley on reactions.** Fix: each reaction (#15) carries its foley (cloth rustle, gulp, slap). Where: reactions.ts. Done when: reactions are heard.
- [ ] **107 🟢 S: Footsteps for walk cycle.** Fix: step_wood/step_tile on each foot contact (surface by set). Where: engine/LieVideo. Done when: walking is audible.
- [ ] **108 🟠 S: Repeated SFX identical.** Fix: seeded rate ±5% and vol ±1.5dB on every cue. Where: LieVideo cue helper. Done when: no two consecutive ticks identical.
- [ ] **109 🟢 S: Silence before the mirror reveal.** Fix: mute music+ambience for 0.25s before, suck_back into it. Where: LieVideo. Done when: audible drop.
- [ ] **110 🟢 S: Room tone per set.** Fix: map every set to an ambience bed (bathroom = hum+drip, street = traffic). Where: LieVideo. Done when: no set uses the generic room tone.
- [ ] **111 🟠 S: Stem export.** Fix: render vo/music/sfx stems separately (`--muted` variants via props). Where: render_chunks.sh. Done when: `out/stems/` has 3 files.
- [ ] **112 🟠 S: Loudness window check.** Fix: ebur128 short-term scan, flag > 6 LU jumps between lines. Where: qa.sh. Done when: report prints.

## I. Pipeline, QA & delivery (113–120)

- [ ] **113 🟢 M: Per-set contact sheet script.** Fix: `scripts/set_sheet.sh` renders one mid-shot still per set + tiles them (what found 3 bugs in round 3). Where: scripts/. Done when: one command makes the sheet.
- [ ] **114 🟢 M: Frozen-motion detector.** Fix: frame-diff per shot; fail if ≥1s near-zero motion unless `still: true`. Where: qa.sh. Done when: report prints.
- [ ] **115 🟢 M: Head-crop detector.** Fix: project head top per shot; fail if inside the letterbox band. Where: validate_shots.mjs. Done when: no CU crops.
- [ ] **116 🟢 M: Vertical composition.** Fix: `LieVertical` 1080×1920, camera fov ×1.25, pull back 15%, captions middle third. Where: Root.tsx + engine W/H from useVideoConfig. Done when: 3 Shorts cuts render.
- [ ] **117 🟢 S: Thumbnail composition.** Fix: `Thumb` comp with hero CU shock, big 96% meter, ≤3 words, 3 variants. Where: Root.tsx. Done when: 3 PNGs readable at 168×94.
- [ ] **118 🟢 S: SRT export in pipeline.** Fix: make_srt.py run by render_chunks.sh. Where: render_chunks.sh. Done when: `out/<comp>.srt` appears.
- [ ] **119 🟢 S: CI stills.** Fix: GitHub Action: typecheck + validate (no render; no GPU there). Where: `.github/workflows/ci.yml`. Done when: green check on push.
- [ ] **120 🟢 S: Release checklist file.** Fix: `releases/CHECKLIST.md` copied from Master Prompt Part O, ticked per release. Where: releases/. Done when: v05 release has it ticked.

---

## Build order (biggest visible jump per hour)
1. **Acting:** 15, 16, 21, 26, 7, 5
2. **Impact & camera:** 78, 67, 69, 71, 72
3. **Look:** 53, 81, 54, 56
4. **Sets:** 36, 37, 38, 33, 52
5. **Sound:** 103, 104, 105, 110
6. **QA:** 113, 114, 115, 63
7. **Delivery:** 116, 117, 118
