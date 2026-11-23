# MASTER PROMPT: Animation & Design Pass ("feature-film feel")

> Paste this into Claude Code in this repo. Goal: no frame is static, nothing is too bright, every shot looks designed.
> Work through the list **in order of the tiers**, one batch of about 10 at a time. After each batch:
> `npm run typecheck` → `npm run audit` (0 issues) → render a 10 s motion test at half scale (`--frames`, `--scale=0.5 --props='{"res":0.5}'`)
> → look at it **as video**, not only as stills → tick the items here → commit. Only render the full 1080p60 once every Tier 1 item is ticked
> and the motion test has been approved by the user.
>
> **Hard rules (never break):**
> - **Brightness:** no face highlight clips (luma ≤ 235 on the skin's brightest pixel). Shot mean luma follows CLAUDE.md §52.1. The
>   soft-shoulder ExposureEffect (Stage.tsx) stays on. Lights never sit straight above a white head closer than 1.5 m.
> - **Motion:** something moves in **every layer** of every frame (camera, character, environment, FX). No pose held more than 12 beats.
>   No linear motion on anything visible.
> - **Determinism:** all motion is frame-derived (`beat`) and seeded (`random()`). No `Math.random`, no `useFrame` accumulation, no `time` uniforms.
> - **Same maths everywhere:** camera changes go in `src/lie/camera.ts` so `audit_shots.mjs` sees them.
>
> Legend: ✅ done · 🔲 to do. Each item gives the rule plus where it goes. The "done when" check is implied: you can see it in the motion test.

---

## A. Camera: a living lens (20)
- ✅ A1 Bigger primary moves: push 24% (was 16), pull 82→108%, orbits 22° (was 14). (`camFor`)
- ✅ A2 Secondary arc on every shot: a 4° yaw drift plus a 6 cm rise and fall, so even `lock` shots move. (`camFor`)
- ✅ A3 Cut-in momentum: each shot starts 7% further out and 2.5° off-axis, then settles in over about 0.25 s (`exp(-beat/7)`). Cuts feel like landings.
- ✅ A4 A richer handheld: 3 axes, two frequencies (18 mm, 13 mm, 10 mm). (`handheld`)
- ✅ A5 Camera **roll** (dutch breathing ±0.6°, and ±4° on tension shots): add `roll` to `Cam`, then apply `camera.up` in `CameraApply`.
- ✅ A6 **Speed ramps** on signature shots: `timeRemap` on the shot spec, slow motion (0.3×) at the peak frame for 0.5 s.
- ✅ A7 **Punch-in on stressed words**: fov −1.2° over 3 beats on each stressed word of the speaker in frame.
- ✅ A8 **Whip pans** between related shots (once a minute): ±35° yaw over the last and first 5 beats, plus `WhipStreak` and a `whip` SFX.
- ✅ A9 **Rack focus** moves: `focusOn` keyframes `[{at, target}]`, eased over 12 beats, with a 1.5% fov focus breathing.
- ✅ A10 **Dolly zoom** on the 2 biggest realisations (the existing `dz` move, used on purpose).
- ✅ A11 **Crane reveals** opening every new set: start low behind a foreground object and rise over it.
- 🔲 A12 **Arc to reveal**: an orbit that moves a foreground object off the subject in the first 20% of the shot.
- 🔲 A13 **Follow cam** on walking or running characters: the target leads the subject by 0.3 m in the direction of travel.
- ✅ A14 **Overshoot settles**: push and snap moves overshoot by 2% and spring back (damping 12).
- 🔲 A15 **Matched motion across cuts**: if shot A ends moving left, shot B starts moving left (`move` direction checked by `validate_shots`).
- ✅ A16 **Low hero angles** for confident or triumph beats (pitch −8 to −12°), and high angles for small or alone beats.
- ✅ A17 **Impact shake presets**: `light` (0.012), `hit` (0.03), `quake` (0.06 + roll), each with its own decay.
- ✅ A18 **Parallax foreground cards** in every wide: a blurred locker edge, plant or chair at 0.8 m from the camera.
- ✅ A19 **Lens breathing**: fov ±0.4° slow sine, so the image is never frozen.
- ✅ A20 **Shot-size rhythm audit**: no two neighbouring shots with the same size **and** move (warning in `audit_shots.mjs`).

## B. Character animation: actors, not mannequins (25)
- ✅ B1 Talk gestures: the right hand beats with the words, and an open palm on stressed words (both arms out, palms forward).
- ✅ B2 Speaking body bob plus a squash accent on stressed words.
- ✅ B3 Listener life: slow arm sway, lean drift, and eye glances on a longer cycle.
- ✅ B4 Speaker eye micro-darts (±2 px).
- ✅ B5 **Anticipation** on every reaction (§21): a 4–6 beat counter-move before the main move.
- ✅ B6 **Head-turn-to-speaker**: listeners turn toward whoever talks (the head leads, the body follows at 20%, 6 beats later).
- ✅ B7 **Real walk cycle** (§40): a 16-beat cycle, pelvis bob, opposite arm swing, no foot slide. Use it for entrances.
- ✅ B8 **Entrances and exits**: characters walk into frame on act openings instead of standing pre-placed.
- ✅ B9 **Weight shifts** every 3–5 s: the hip moves 2 cm, the shoulders counter-tilt.
- ✅ B10 **Hand-to-face** gestures: chin scratch, rubbing the neck (nervous), facepalm (exists in reactions, so use it).
- ✅ B11 **Wrist look**: Kai glances down at the thread wrist whenever a thread is mentioned.
- ✅ B12 **Expression transitions**: `exprAt: {at, to}` swaps the face under a forced blink (the classic animator trick, since the canvas face cannot cross-fade).
- ✅ B13 **Brow acting**: worried brows on tension lines, raised brows on questions (the line ends with "?").
- 🔲 B14 **Smear frames** on the fastest arm swings (stretch ×1.3 for 1–2 frames).
- 🔲 B15 **Secondary motion**: the hood and drawstrings lag the torso by 3 beats (a spring on the rotation delta).
- ✅ B16 **Breathing that shows emotion**: a big sigh (shoulders up, then drop) on sad lines.
- 🔲 B17 **Crowd variation**: 3 idle loops × random phase × speed 0.9–1.1, and one "hero extra" per crowd doing something unique.
- ✅ B18 **Hug, handshake and pinky-promise poses** for the promise moments (two-character contact pose, wrist-to-wrist).
- ✅ B19 **Jump celebrate** with squash on landing and a dust puff.
- 🔲 B20 **Sit-down and stand-up** transitions, not teleporting between poses.
- ✅ B21 **Phone acting**: thumb taps, a screen glow on the face, and a pocket put-away.
- ✅ B22 **Sleep acting**: slow breathing, a twitch, and the blanket rising.
- 🔲 B23 **Eye contact with the camera** once per act, on the direct-address lines ("you").
- ✅ B24 **Blink on head turns** (always) and double blinks on surprise.
- 🔲 B25 **Pose library audit**: no character holds the default arms for more than 3 s while on screen.

## C. Threads (the signature effect) (15)
- ✅ C1 **Living threads**: a travelling light pulse runs along each thread every 1.5 s, heartbeat-style.
- ✅ C2 **Thread sway**: a catenary sag plus wind noise (2 sines), and tension straightens it.
- ✅ C3 **Creation moment**: the thread is drawn from wrist to wrist over 10 beats with a spark head and a trail.
- ✅ C4 **Snap**: a 3-frame white flash at the break point, the two halves whip back (spring), and ember sparks fall with gravity.
- ✅ C5 **Fray**: the broken ends curl and drop fibres for 2 s.
- ✅ C6 **Thread light** actually lights faces (a point light at the thread midpoint, intensity tied to the pulse), colour gold or grey.
- ✅ C7 **Ignite**: a fire wave travels along the thread, then bloom spikes, an impact stack, and a 0.5 s slow-motion peak (A6).
- ✅ C8 **Swarm choreography**: the threads in a swarm flow like a school of fish (curl noise), not static lines.
- 🔲 C9 **Knot tying**: the thread loops into a visible knot (instanced torus segments).
- 🔲 C10 **Ghost threads** (tried in batch 12 as slack threads: far too strong, read as amber bands, so removed; needs a faint line material) for past promises: faint, thin and drifting.
- 🔲 C11 **Colour grammar**: gold = kept, grey = broken, red = lie, blue-white = new. Write it in a legend card once.
- ✅ C12 **Depth-sorted glow**: near threads get bigger bloom, far ones a soft haze.
- 🔲 C13 **Thread sound sync**: each pulse has a soft tick, the snap has a crack plus a reverse tail (SFX exist).
- 🔲 C14 **Thread-cam** (move `along` + `cam.path` exists in camera.ts; the first test on P003 flew too close: heads filled the frame and the thread was lost. Needs a path 1.5 m+ off the thread and a wider fov): one shot travels along a thread from wrist to wrist (camera on a CatmullRom curve).
- ✅ C15 **Ending tapestry**: every kept thread weaves into a glowing net above the city.

## D. Lighting & look (15)
- ✅ D00 **Calibration never brightens a clipping shot**: `still_cal.py` measures the share of pixels ≥ 235; above 2% it may only darken (void close-ups were being pushed +1 stop by their black backgrounds and blew out)
- ✅ D0 **Close-ups get less key** (CLAUDE.md §52.1 rule, now wired in): key × 0.75 MCU, 0.6 CU, 0.5 ECU unless the shot sets `keyI`. The lens eye-light also fades with camera distance.
- ✅ D1 No clipped faces: void light moved to the front-left at 1.3; soft-shoulder highlight roll-off in ExposureEffect.
- ✅ D2 **Two-colour lighting** on every shot: a warm key against a cool fill/rim, with a ≥ 2000 K difference.
- ✅ D3 **Animated light**: one light per shot moves (a passing car, a flicker, cloud drift, a screen pulse).
- ✅ D4 **Emotion light shift**: the key colour moves warm → cold over 1 s when a promise breaks.
- 🔲 D5 **Volumetric shafts** in the hallway, classroom and bedroom (the `Beam` exists, so add motion to its dust).
- ✅ D6 **Glossy void floor** (clearcoat physical material instead of MeshReflectorMaterial, which costs a second render pass) so the threads and figures reflect.
- ✅ D7 **Void depth**: 34 far bokeh lights (9–16 m) that DOF melts into discs. (A backdrop glow plane was tried and removed: it read as a flat wall.): a gradient backdrop glow behind the subject, layered fog cards, and distant bokeh lights.
- ✅ D8 **Rim light boost** on dark backgrounds, so every head has a bright edge.
- 🔲 D9 **Practical motivation**: every set shows its light source in frame at least once.
- ✅ D10 **Highlight check**: the soft shoulder in ExposureEffect caps the 3D picture at about 235; `motion_qa.py` CLIP flags any second with more than 0.4% of pixels ≥ 245.
- 🔲 D11 **Bokeh shapes**: hexagonal bokeh plus a slight cat-eye at the frame edges.
- ✅ D12 **Halation** on the thread glow (a red-tinted highlight bloom, §23).
- 🔲 D13 **A real LUT per act**, generated by a script (§36.4 step 7).
- ✅ D14 **Light leaks** timed to the warm emotional beats only.
- ✅ D15 **Contrast per act**: tension is +contrast with lifted blacks, wonder is soft with deep colour.

## E. Environment life (12)
- ✅ E1 Dust drifts and rises at varied speeds (it was nearly frozen).
- ✅ E2 **Background extras** in every set: walking students in the hallway, someone eating in the cafeteria.
- ✅ E3 **Wind**: posters, curtains and plants sway (vertex sine).
- ✅ E4 **Clocks tick**, screens scroll, fans spin, lights buzz-flicker.
- 🔲 E5 **Weather beyond windows**: moving clouds, rain streaks on the night shots.
- ✅ E6 **Street life**: passing cars (light sweeps), and a traffic light changing.
- ✅ E7 **Floating motes in the void**, with 3 depth layers at different speeds and sizes.
- ✅ E8 **Steam** from the cafeteria food, plus breath in the cold rooftop scene.
- 🔲 E9 **Shadow play**: blinds cast moving stripes in the classroom.
- 🔲 E10 **Interactive props**: a chair spins slightly when someone stands up, a paper flutters on a cut.
- ✅ E11 **Birds and planes** cross the sky shots (tiny silhouettes).
- 🔲 E12 **Set dressing pass**: 5 storytelling details per set (§36.3).

## F. Graphics, titles & UI (12)
- ✅ F1 **3D titles**: `title3d` puts the words IN the scene as canvas-text cards that rise out of the floor glow and parallax with the camera (flat cards, not extruded geometry). Used on the PROMISE THREADS title.
- ✅ F2 **Kinetic captions**: the active word scales 1.08 with a gold underline sweep.
- 🔲 F3 **Title reveal FX**: letters assemble from thread fibres (the signature).
- 🔲 F4 **Act cards** with a parallax thread-weave background and a chapter number.
- 🔲 F5 **Counters** (promises kept / broken) as a rolling odometer in the corner on the stats beats.
- 🔲 F6 **Callout arrows** (component `spec.callout` built in batch 16; the first use, on the opening CU, covered the face, so it is not placed yet) (§8.3), drawn with pathLength, for the first time each concept appears.
- ✅ F7 **UI parallax**: overlays drift 2–4% against the camera pan.
- ✅ F8 **Exit animations** on every graphic (an accelerated fade plus a −8 px rise), so nothing pops off.
- ✅ F9 **Shimmer** on the gold emphasis words (an animated gradient).
- ✅ F10 **Lower-third name tags** the first time each character appears.
- ✅ F11 **End card** with a subscribe area, and the thread knot as a logo mark.
- ✅ F12 **Thumbnail composition** (`Thumb`, §43): the face at 40% of the height, a glowing wrist, ≤ 3 words, 3 variants.

## G. Edit & transitions (10)
- 🔲 G1 **Match cuts** on the thread: same screen position across the cut.
- 🔲 G2 **Zoom-through** transitions into a glowing thread or a dark hoodie.
- ✅ G3 **J/L cuts**: the next scene's ambience pre-laps by 0.4 s (twice per minute minimum).
- 🔲 G4 **Cut on action**: cuts land mid-gesture (B1 gestures make this possible).
- 🔲 G5 **Average shot length 2.5 s** in montages, and 4–5 s on emotional beats (check the cut list).
- 🔲 G6 **Breath shots** after every big reveal (3 s of slow drift, music only).
- ✅ G7 **Flash frames** on the snap and the ignite (2 beats, 0.25 opacity, never more than 3 per second).
- ✅ G8 **Dip-to-black** only at the act breaks, with a whoosh_heavy.
- 🔲 G9 **Montage split-screens** for "every promise" lists (2–3 panels sliding in).
- ✅ G10 **Loopable ending** that mirrors the first frame (vertical-cut ready).

## H. Sound to match the motion (10)
- ✅ H1 Cloth rustle on every gesture of B1 (vol 0.15, rate ±5%).
- ✅ H2 Footsteps under B7 walks.
- ✅ H3 A camera whoosh on every A3 cut-in with momentum > 0.5 (quiet, 0.2).
- ✅ H4 A thread hum that follows the pulse (C1).
- 🔲 H5 Snap: crack + sub + reverse tail, and silence 6 beats before it.
- 🔲 H6 Ignite: riser → impact → sparkle → music swell.
- 🔲 H7 Spatial panning from the screen x position (§36.6 rule 6).
- ✅ H8 Stingers on the act cards.
- 🔲 H9 Music hits on the cut downbeats (the tempo map, §36.7).
- ✅ H10 Room tone per set crossfading across cuts.

## I. Process & QA (11)
- ✅ I1 `npm run motion` renders a 10 s, half-scale clip of any shot: `python scripts/motion_test.py P020` (clip + GIF + sheet + motion_qa).
- ✅ I2 **Stillness detector**: `python scripts/motion_qa.py <video> <fps>`, so any second with summed frame difference < 14 fails. v04 failed 170 of 268 seconds; the motion-pass test clip fails 1 of 11.
- ✅ I3 **Highlight detector**: % of pixels at luma ≥ 245 per shot. Faces must not clip (D10).
- ✅ I4 **Contact sheets as GIFs**: a 6-frame flip per shot, so motion can be reviewed fast.
- ✅ I5 The audit adds a `STATIC` warning: a shot with `move: 'lock'`, no talker and no extra.
- 🔲 I6 A per-shot render cache: re-render only changed shots (hash the spec) and splice them.
- ✅ I7 Every batch is committed with the ticked IDs in the message.
- 🔲 I8 Look-dev stills at full quality on the GPU for every changed shot (§57.2 rule 9).
- 🔲 I9 The vertical cut renders with the master (§45).
- 🔲 I10 The user approves the motion test before every full render.
- 🔲 I11 Update CLAUDE.md §1 and §50 when items ship.

**Total: 132 items (91 done).**
