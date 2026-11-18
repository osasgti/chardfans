# MASTER PROMPT — "What If Every Promise Left a Glowing Thread?" (5:00, TTS)

**Format:** 5:00 main video, 16:9, 1920×1080, 60 fps on GPU (24 fps CPU drafts) + 3 vertical Shorts (≤ 60 s).
**Engine:** this repo (pill-people, film lighting, gold UI). Follow `CLAUDE.md` + `prompts/MASTER_PROMPT_INSANE.md` for *how*;
this file says *what*. Shot-by-shot table, cue sheet, Shorts and metadata live in `WHAT_IF_PROMISE_THREADS_SHOTS.md`.

**The one-sentence promise to the viewer:** *every frame is laced with light, every promise is something you can see,
and the ending makes you look at your own wrist.*

> Claude: build in the phase order of MASTER_PROMPT_INSANE Part B / CLAUDE.md §36.1. Show the user the artifact at every gate
> (script → stills per set → thread look-dev → 20 s draft clip) **before** spending TTS credits or a long render.
> Never start TTS (credits) or a full render without the user's explicit OK.

---

## 1. Concept

**Logline:** A kid wakes up able to see every promise as a glowing thread tying the promiser's wrist to the person they promised.
Kept promises burst into light. Broken ones fray, grey, and drag. It's a superpower, until they notice the thousands of threads on
their *own* wrist.

**Why this one (from `WHAT_IF_IDEA_ENGINE.md` Part 9):** the only top-3 idea with no close match in the first search. It's built for
this engine: a glowing thread is a tube + bloom, and it reads at thumbnail size. The twist re-reads the whole video.

**Emotional curve:** wonder → comedy → power → doubt → dread → twist → warmth.
**Comment bait:** *"How many threads would be on your wrist right now?"* and *"Which promise would you keep first?"*

**Rules of the world (keep them 100% consistent; viewers will check):**
1. A thread appears **the moment a promise is spoken** ("I'll…", "I promise…", "I won't…", "I swear…"). Not for statements, only promises.
2. It runs from the **promiser's right wrist** to the **promisee's chest** (heart height). It slides along with them as they move.
3. **Colour = health:** fresh = warm gold · being kept/working on it = steady gold glow · getting old/forgotten = dimmer, slack, amber
   · broken = grey, frayed, it drops and drags on the floor · kept = it **snaps into a burst of gold sparks** that drift up.
4. Threads **don't block movement**; they pass through walls (that's the magic).
5. **Only the hero can see them.** No one else reacts to threads.
6. **Promises to yourself count** (this is the twist; never state it before Act 4).
7. Thread **thickness = size of the promise** ("I'll text you back" = hair-thin; "I'll always be there" = rope).

---

## 2. Cast (reuse `CAST` looks from `src/lie/engine.tsx`, new names; never change a look mid-video)

| Role | Reuse look | Silhouette | Hoodie | Default face | Promise pattern | Motion personality |
|---|---|---|---|---|---|---|
| **Hero (Kai)** | `hero` | black beanie | red | smug → worried → soft | **many threads on own wrist** (twist) | relaxed, tilts head, hands in pockets |
| **Mom** | `mom` | bun, scale 1.1 | mustard | happy | keeps nearly everything; threads always gold | warm, busy, never still |
| **Little brother (Leo)** | `brother` | backwards cap, 0.8 | blue | neutral | promises everything, keeps nothing (comic grey tangles) | bouncy, fidgety |
| **Best friend (Maya)** | `maya` | ponytail | teal | neutral | one old fraying thread to Kai | quick, guarded |
| **Dad** | `dad` | glasses, bald, 1.12 | grey | worried | a thick, old **gold** rope to the family that never broke | still, slow nods |
| **Teacher (Ms. Bell)** | `teacher` | bob | lavender | bored | a thin thread to every student ("I'll grade them by Friday") | still, slow blinks |
| **Younger Kai (age 7)** | `hero`, scale 0.7, no beanie | — | red | happy | **the oldest thread on Kai's wrist ends here** | bouncy |

---

## 3. Structure (5:00 ≈ 690 words at 150 wpm + held pauses)

| Act | Time | Emotion / grade | Set(s) | Purpose |
|---|---|---|---|---|
| Hook | 0:00–0:18 | wonder | Void | the image: a hand, a promise, a thread of light |
| 1. The rules | 0:18–1:00 | fun | Bedroom, Kitchen, Street | how threads work; comic examples |
| 2. Using it | 1:00–2:00 | fun → triumph | Hallway, Classroom, Gym | power: you know who'll come through |
| 3. It turns | 2:00–3:05 | tension | Hallway (night), Kitchen (night), Bedroom | grey threads everywhere, Maya's thread fraying, Dad's late-night rope |
| 4. The twist | 3:05–3:55 | consequence | Bathroom mirror, Void | Kai sees their own wrist: hundreds of threads, the oldest to their 7-year-old self |
| 5. Keeping one | 3:55–5:00 | triumph / warmth | Rooftop, Kitchen, Void | Kai keeps one promise; it bursts into light; the ending |

---

## 4. Script v1 (≈ 690 words). `/` short pause · `//` long pause · `*x*` emphasis. Visual in [brackets].

**HOOK (0:00)**
P001: What if every promise you heard / left a thread? [Void. ECU: a hand. A whisper of gold light spools out of the wrist.]
P002: A real one. / Glowing. / Tied from their wrist… / to your heart. [The thread pulls taut across the void to Kai's chest. Title.]
P003: Keep the promise, / and it lights up like a firework. // Break it… [Thread bursts gold. Second thread greys and frays.]
P003b: …and it hangs there. / Grey. / For everyone to see. // Well. / For *you* to see. [Grey thread drops to the floor. Kai looks at camera.]

**ACT 1 — THE RULES (0:18)**
P004: You wake up. / Your alarm promises "five more minutes." [Bedroom. A hair-thin thread from the alarm clock to Kai.]
P005: The thread snaps grey before you even sit up. [It frays instantly; tiny grey puff.]
P006: Downstairs, Mom says, "I'll drive you today." // Gold. / Thick. / Already glowing. [Kitchen. Strong gold thread, Mom smiling.]
P007: Your little brother promises he'll "clean his room *this time*." [Leo; a thread, instantly wobbly.]
P008: His wrist / is a *mess*. [Pull back: Leo's wrist is a bird's nest of grey threads trailing behind him.]
P009: The rules are simple. / Every promise makes a thread. / Big promises, / thick threads. // Kept ones turn to light. / Broken ones turn grey… / and drag. [Street. Cutaways: thin vs. thick, burst vs. drag.]
P010: The bus driver: / "I'll wait for you!" // [Bus pulls away; a thread stretches… stretches… *snaps grey*.]
P011: A billboard promises "your best summer ever." // The thread goes up into the sky / and just… / ends. [Billboard; a thread vanishing into clouds.]
P012: By lunch, you learn the first secret. // Most promises aren't lies. / People just… / forget. [Hallway wide: hundreds of slack amber threads drooping between students.]

**ACT 2 — USING IT (1:00)**
P013: At school, / it's like seeing the future. [Hallway, Kai smug.]
P014: "I'll pay you back Friday." / Thin. / Already sagging. / You keep your money. [A kid; slack thread; Kai pockets the coin.]
P015: Ms. Bell: "I'll grade them by Monday." // Twenty-eight threads, / one to every desk, / all still gold. [Classroom; a fan of gold threads from her wrist.]
P016: She means it. / She's just tired. [Her shoulders; threads gently pulse.]
P017: At casino night, / a kid swears he'll "split the winnings." // The thread is already grey / before the cards are dealt. [Gym; a grey thread across the felt.]
P018: You stop trusting words. / You start trusting threads. [Montage: gold = yes, grey = no.]
P019: Group projects? / You pick the gold ones. / Dates? / Gold ones. / Friends? [Quick cuts; threads deciding.]
P020: For about a week, // your life is perfectly organised / by light. [Kai walks through the hallway; threads part around them like strings of a harp.]

**ACT 3 — IT TURNS (2:00)**
P021: Then you notice Maya. [Hallway; Maya at her locker.]
P022: There's a thread between you. / Old. / From a long time ago. [Thin amber thread between Maya and Kai; it's from Maya's wrist.]
P023: "I'll always save you a seat." // You remember her saying it. / In second grade. [Flash: two tiny kids at a lunch table.]
P024: It's still there. / Still gold. / Barely. // Because she still saves it. / Every day. / And you never sit there. [Cafeteria seat with a backpack on it.]
P025: You start seeing it everywhere. / Not lies. / Just… / waiting. [Montage: threads waiting at doors, phones, empty chairs.]
P026: Late at night, / you find Dad at the kitchen table. [Kitchen night; Dad alone, bills.]
P027: He has one thread. / *One.* // Thick as a rope. / Gold. / Going to every one of you. [A rope from Dad's wrist splits to Mom, Leo, Kai's rooms.]
P028: You ask him what he promised. / He laughs. / "That I'd take care of you." [Dad's tired smile.]
P029: He never said it out loud. / Not once. / And it's the brightest thread in the house. [The rope glows through the ceiling.]
P030: That night, / you can't sleep. [Bedroom night; Kai under a blanket.]

**ACT 4 — THE TWIST (3:05)**
P031: You go to the bathroom, / turn on the light, // and look in the mirror. [Bathroom; flicker; mirror.]
P032: You never thought to look at your *own* wrist. [ECU: Kai's hand rises into frame.]
P033: There are hundreds. [Reveal: hundreds of threads from Kai's wrist, out through walls in every direction. Impact.]
P034: "I'll start tomorrow." / "I'll call Grandma." / "I'll be nicer to Leo." / "I'll text you back." [Each phrase = a grey thread lighting up as it's named.]
P035: Most of them are grey. // And they all lead / to people you love. [Pull back: grey threads tying Kai to every room, every friend.]
P036: But one / is older than all the others. [One thread, frayed almost to nothing, glowing faintly.]
P037: You follow it. [Void. Kai walks along the thread into darkness.]
P038: It leads to *you*. / Seven years old. // "I'll be brave." [Younger Kai at the end, smiling, holding the other end.]
P039: Promises to yourself count too. // You just never see them break. [The thread trembles. Silence.]

**ACT 5 — KEEPING ONE (3:55)**
P040: So the next morning, / you keep one. [Dawn kitchen.]
P041: Just one. / Small. [Kai at the cafeteria.]
P042: You sit in the seat Maya saves. [Kai sits; Maya looks up.]
P043: And the thread between you / doesn't snap. [Their thread brightens… brightens…]
P044: It *ignites*. [Huge gold burst; sparks rain over the cafeteria. Wow moment.]
P045: You call Grandma. / Gold. // You help Leo clean his room. / He's so shocked, / *his* thread bursts too. [Quick montage of bursts.]
P046: Your wrist doesn't get lighter overnight. // But it gets brighter. [Kai's wrist: grey threads, a few gold sparks drifting off.]
P047: And that oldest thread? // You're working on it. [Rooftop dusk; the thin thread to younger Kai pulses gold.]
P048: So. // If you could see every promise / you've made… [Void; Kai faces camera, wrist raised.]
P049: …how many would still be waiting? [Final image: Kai's wrist; one fresh gold thread spools toward the camera, toward the viewer. Cut to black.]

---

## 5. Voice (ElevenLabs; follow CLAUDE.md §32 and §54.1 exactly)

- **Narrator:** the same voice as the lie-meter video for channel consistency (`Jesse`, `UlSegI53MOVdpfoA7K1h`), model `eleven_v4`,
  unless the user picks another. Check the connector permissions first (the last quota check failed: reconnect needed).
- **Every tag starts with the register** (§54.1): `[normal speaking voice, warm]`, never `[whispering]`, `[soft]` or `[hushed]` alone.
- **Character lines** (Mom, Leo, Dad, Ms. Bell, young Kai) are spoken by the narrator *quoting* them with `[mimicking …]`, as in the
  lie video. **Exception:** P038 "I'll be brave" uses a second, younger voice for real impact (one generation).
- **Credits estimate:** 49 lines × 2 takes × ≈120 credits ≈ 12k credits. Run `estimate_only` on P001 first and tell the user the total.
- After generating: `scripts/vo_consistency.py` (voicing ≥ 0.42 and within ±0.15 of the median), then `build_timeline.py`.

**Direction tags per line** (excerpt; Claude fills all 49 in the same style):

| ID | Tag | Notes |
|---|---|---|
| P001 | `[normal speaking voice, intimate, curious]` | lean in; hold "thread" |
| P002 | `[normal speaking voice, wonder]` | "to your heart" lands soft but voiced |
| P003b | `[normal speaking voice, playful, dry]` | the "Well. For *you* to see." is a wink |
| P008 | `[normal speaking voice, amused]` | "a *mess*" with a laugh in it |
| P027 | `[normal speaking voice, quiet awe, firm]` | "*One.*" alone, full voice |
| P033 | `[normal speaking voice, stunned, clear]` | short line: the most likely to whisper, so keep it voiced |
| P038 | young voice `[child, normal speaking voice, proud]` | "I'll be brave." |
| P044 | `[normal speaking voice, rising joy]` | "It *ignites*." with no whisper |
| P049 | `[normal speaking voice, warm, direct to camera]` | slow; final word lands on the cut |

---

## 6. THE THREAD SYSTEM (new tech; build this first and look-dev it before anything else)

### 6.1 Component: `src/three/Thread.tsx`
```ts
type ThreadProps = {
  from: [number, number, number];      // promiser wrist (world)
  to: [number, number, number];        // promisee chest (world)
  state: 'fresh' | 'held' | 'slack' | 'broken' | 'burst';
  t: number;                           // seconds into the state (drives animation)
  thickness?: number;                  // 0.004 (tiny) … 0.03 (rope)
  sag?: number;                        // 0 taut … 1 drooping to the floor
  seed: string;                        // deterministic wobble/fray
};
```
- **Geometry:** a `CatmullRomCurve3` through 6–10 points between `from` and `to`. The middle points sag by `sag × distance × 0.35` and
  wobble with seeded sines (amplitude 1–2 cm, 0.4 Hz). `TubeGeometry(curve, 64, thickness, 8, false)`, rebuilt per frame (cheap) or
  `useMemo` keyed on rounded params.
- **Material:** custom `shaderMaterial` (no time uniforms from the clock, only `uT` = frame-derived seconds):
  - Core: emissive gold `#f2c46b` × intensity (fresh 2.2, held 1.6, slack 0.9 amber `#e0a24a`, broken 0.25 grey `#8a8494`).
  - **Energy pulse:** a bright band travelling from→to along `uv.x` (`smoothstep` bump at `fract(uT * 0.35 + seed)`), 25% extra.
  - **Fresnel edge** brighter (it reads as a light filament, not a pipe).
  - `toneMapped={false}` only on the core so bloom catches it; keep intensity ≤ 2.2 (§32 emissive lesson).
- **Glow halo:** a second tube at 3× thickness, additive, opacity 0.18 (cheap fake volumetric).
- **States:**
  - `fresh`: the thread *spools* from the wrist to the target over 0.6 s (draw-range from 0→1 along the curve, `easeOutCubic`), with a
    bright head spark at the tip.
  - `held`: steady glow + pulse.
  - `slack`: sag 0.4–0.7, dimmer, the pulse slows down.
  - `broken`: sag 1 (lies on the floor), grey; **fray**: the last 15% splits into 3–5 thinner sub-tubes that curl apart; grey dust
    particles fall off (20, seeded).
  - `burst`: the thread tightens (sag→0, 6 beats) → flash white (2 beats) → breaks into 80–150 gold sparks along its length that fly
    outward and then drift up (gravity −0.3, drag), fading over 2 s; plus a ring shockwave at the midpoint.
- **Performance:** ≤ 40 full threads per shot; for "hundreds", use `InstancedMesh` of thin straight segments (cheap lines) + 10
  hero threads. CPU-test one still before building scenes with crowds of threads.
- **Determinism:** all randomness via `random(seed + i)`; no `Math.random`, no clock. Verify with the determinism check.

### 6.2 Anchors
- Add `wristR(cast)` and `chest(cast)` helpers in `engine.tsx` (like `headOf`). The wrist follows the arm pose (use the arm angle
  maths from `Pill.tsx`; or pick the hand sphere's world position with a ref and pure maths from pose args).
- ShotSpec gains: `threads?: {from: number | Vec3; to: number | Vec3; state; at?: number; thickness?; sag?; label?}[]`.

### 6.3 Thread label (UI)
- When a thread is born, a small cream label floats at its midpoint for 1.5 s, quoting the promise in italic Cormorant:
  *"I'll drive you today."* Max 1 label on screen. Captions already carry the VO, so labels only appear when the quote differs.

### 6.4 Look-dev gate (show the user before building shots)
Render 6 stills on the Void set: fresh (spooling), held, slack, broken + fray, burst (mid-sparks), and "hundreds" (Kai's wrist).
Pass criteria: readable at 320 px wide, bloom doesn't wash the face, broken grey still visible on the dark floor.

---

## 7. Sound design (NEW sounds: add these to `scripts/make_sfx.py`, numpy-only, seeded; name by role)

| File | Role | Recipe (sfxlib building blocks) | Length | Level |
|---|---|---|---|---|
| `thread_spool` | a thread is born | rising FM glass tone 600→1800 Hz (`fm`, index 2→0.5) + a filtered noise "zip" swept 2→8 kHz (`bandpass`), short reverb | 0.6 s | 0.30 |
| `thread_hum` | a held thread nearby (loop) | 3 detuned sines (220/221.5/330 Hz) with a slow tremolo + an airy high shimmer (`granular` of a bell), seamless `loop_crossfade` | 6 s loop | 0.06–0.12 by thread count |
| `thread_pluck` | a thread tightens / gets touched | `karplus_strong` at 440–660 Hz (seeded pick), bright damping, small room | 0.8 s | 0.25 |
| `thread_fray` | a thread breaks/greys | low-passed noise crackle bursts (paper tear) + a descending detuned pluck 330→180 Hz + a soft sub thump | 1.0 s | 0.30 |
| `thread_drag` | a broken thread dragging (loop) | brown noise through a low bandpass 200–600 Hz with an irregular amplitude (`granular`) | 4 s loop | 0.05 |
| `thread_burst` | **a promise kept** | tension: a pluck pitch-bending up a 4th (6 beats) → impact: `bell` cluster (C6 E6 G6 C7) + `sparkle` + sub 55 Hz bloom + a reverse-cymbal swell into it; tail: granular glitter falling (pitch drifting down) | 2.5 s | 0.6 (hero) / 0.35 (montage) |
| `thread_snap_small` | a tiny promise breaks (alarm, bus) | a dry pluck + a quick "tsk" noise click | 0.25 s | 0.25 |
| `rope_creak` | Dad's rope | a slow resonant filtered noise with a pitch wobble (like `chair_creak`, lower) | 1.5 s | 0.18 |
| `wrist_reveal` | P033 "hundreds" | 40 staggered `thread_spool`s compressed in 1.2 s (pitch-randomised) + a low `boom_sub` | 2 s | 0.7 |
| `heartbeat_soft` | under the Act 4 mirror | two low kicks 0.25 s apart, 58 bpm, lowpassed | loop | 0.2 |

**Existing sounds to reuse:** `whoosh` family (cuts), `pop_small`/`tick` (labels), `impact` (P033), `sparkle` (layers on bursts),
`riser`/`riser_shepard` (Act 3 build), `suck_back` (into the P039 silence), `amb_*` beds per set, `crowd_murmur` (cafeteria),
`alarm_beep` (P004), `chips_stack`/`card_flick` (casino night), `door_creak`, `clock_tick`.

**Placement rules specific to threads** (on top of CLAUDE.md §36.6 and §52.4):
- Every visible thread birth = `thread_spool`, panned to the thread's screen x (pre-render `_L`/`_R` variants, FIX #103).
- More than 3 births at once → play one `thread_spool` + `granular` glitter, not 10 stacked spools (§52.4 max 3 SFX).
- `thread_burst` lands **after** the spoken word (§52.2 "hits after words"), at `line.end + 0.05 s`.
- **The silence:** P039 ends → `suck_back` → 0.8 s of total silence (music, ambience and hum all muted) → P040 dawn ambience fades in.
- The `thread_hum` bed scales with the number of visible threads; in the P033 reveal it swells to 0.25, then cuts on P034.

---

## 8. Music plan (generate stems in `make_sfx.py`; one motif reworked per act, §36.7)

- **Motif "The Promise":** 5 notes, E–G#–B–C#–B (rising, then a hopeful step down), 72 bpm.
- **Hook / wonder:** a celesta/bell motif over a soft pad.
- **Act 1 (fun):** pizzicato plucks (`karplus_strong`) playing the motif bouncily at 96 bpm, light brushes.
- **Act 2 (triumph):** add a bass + kick; the motif in octaves on bells.
- **Act 3 (tension):** a minor version (E–G–B–C–B) on low saw strings, a heartbeat, a Shepard riser into P030.
- **Act 4:** the motif reduced to **one sustained note** under the mirror, then silence (P039).
- **Act 5:** solo piano motif → full: strings, bells, choir pad on the P044 burst; final chord rings over black for 1.5 s.
- **Ducking:** `duckAt()` as in the lie video; bells/plucks duck harder (0.3×) because they share the voice band (§52.3).

---

## 9. Look bible per act (CLAUDE.md §36.3, presets in `style/presets.ts`)

| Act | Grade | Key / fill | Thread look | Practical |
|---|---|---|---|---|
| Hook | wonder | top spot, void, 1:4 | single hero thread, max bloom | none (the thread *is* the light) |
| 1 | fun | warm morning 3200 K | many thin threads, playful | alarm LED, kitchen window |
| 2 | fun → triumph | bright school daylight | gold dominates the frame | fluorescents, casino lamps |
| 3 | tension | night, 1:8, cool 6500 K | grey and slack dominate; one gold rope (Dad) | desk lamp, phone glow |
| 4 | consequence | mirror tube light, 1:16 | hundreds of grey threads; one faint gold (younger self) | flickering mirror tube |
| 5 | triumph | dawn 2900 K → dusk gold | gold bursts, sparks in the air | dawn window, rooftop sun |

**Thread-light interaction:** each hero thread casts a weak point light (gold, intensity 0.4, decay 2) at its midpoint so faces near it
pick up a glow (max 3 such lights per shot). Bursts spike that light to 3 for 4 beats.

---

## 10. Signature shots (one per act; never reuse)

1. **Hook:** ECU macro of the wrist as the thread spools out (135 mm, fov 15, rack focus wrist → face).
2. **Act 1:** overhead on Leo dragging a nest of grey threads through the house (pitch 80).
3. **Act 2:** the "harp" walk: Kai walks through a hallway strung with gold threads; they part like harp strings with `thread_pluck` notes forming the motif.
4. **Act 3:** a dolly *up* through the house: Dad's rope runs through the ceiling, branching to every bedroom (crane through floors).
5. **Act 4:** the mirror **dolly-zoom** on "There are hundreds." (the only dolly-zoom in the video).
6. **Act 5:** the cafeteria burst in slow motion (speed ramp 1.0 → 0.3 → 1.0), sparks raining in the foreground.

---

## 11. Wow-moment map (one screenshot moment ≤ every 25 s)

0:04 first thread spools · 0:14 burst vs. fray · 0:36 Leo's nest · 0:58 hallway of drooping threads · 1:20 Ms. Bell's fan of 28 threads
· 1:52 the harp walk · 2:20 Maya's barely-gold thread + the second-grade flashback · 2:45 Dad's rope through the ceiling
· 3:15 hundreds of threads in the mirror · 3:40 younger Kai holding the other end · 4:12 the cafeteria ignition
· 4:35 burst montage · 4:58 the thread toward the viewer.

---

## 12. New assets (add to CLAUDE.md §50 and §1 when built)

| Asset | Size | Notes |
|---|---|---|
| `src/three/Thread.tsx` (+ shader, sparks, fray) | L | §6, look-dev gate first |
| Thread anchors `wristR`/`chest` | S | engine helpers |
| `ShotSpec.threads` + validator rules | M | validate from/to cast indices |
| Thread label overlay | S | Cormorant italic, cream |
| Cafeteria set (tables, trays, a saved seat with a backpack) | M | reuse Classroom desks + Kitchen style |
| Billboard prop + sky thread | S | Street set |
| Alarm-clock prop (red 7-seg) | S | FIX #37 |
| Young-Kai variant (no beanie, scale 0.7) | S | CAST entry |
| Second-grade flashback grade (warm, soft vignette, film grain ×2) | S | `GRADES.memory` |
| 10 new SFX + motif stems | M | §7, §8 |
| `heartbeat_soft`, `wrist_reveal` | S | §7 |

Reused as-is: Bedroom, Kitchen (day/night), Street + Bus, Hallway (+posters/clock), Classroom, Gym (casino night), Bathroom mirror,
Void, Rooftop; reactions library (gulp, deflate, celebrate, doubleTake, smugNod); LieMeter is **not** used (threads replace it).

---

## 13. Production plan & render budget

1. **Script lock** (user approves §4).
2. **Thread look-dev** (§6.4), with 6 stills shown to the user.
3. **SFX + music stems** generated; audition a 20 s sound sketch of P001–P003b.
4. **TTS** (with the user's OK on credits) → `vo_consistency.py` → `build_timeline.py` (adapt it for the `P` line IDs).
5. **Shots** built act by act (`WHAT_IF_PROMISE_THREADS_SHOTS.md`) → per-shot audit stills (CLAUDE.md §56 method).
6. **Draft clip** (Hook + Act 1, ≈ 60 s) at 24 fps half scale → user review.
7. **Full render:** on a GPU (docs/RENDER_ON_GPU.md) at 60 fps, or here at 24 fps (≈ 6 h); then exposure calibration and QA (§52.6).
8. **Shorts + thumbnails + SRT + metadata.**

---

## 14. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Threads clutter the frame | max 10 hero threads + instanced background lines; the subject's thread is always the brightest |
| Viewers confuse "broken" with "lying" (last video) | never use meters or %; grey means *forgotten*, not *lied*. Script P012 states it |
| Bloom washes faces | thread core intensity ≤ 2.2; keep threads below or beside faces in CUs; test at the look-dev gate |
| Twist guessed too early | never show Kai's own wrist before P032; no thread from Kai's wrist on screen before Act 4 (validator rule) |
| CPU render too slow with sparks | sparks are instanced; cap 150; test frame time in the look-dev |
| Melodrama | Act 1–2 comedy (Leo's nest, bus driver, billboard) earns the turn; keep the VO dry and specific |

---

## 15. Definition of done (copy into the release commit)

- [ ] All 49 lines voiced and consistent (§54.1), script matches the timeline
- [ ] Thread look-dev approved; every thread state readable at 320 px
- [ ] Rule consistency: wrist → chest, colours, thickness = size, no own-wrist threads before P032
- [ ] Every thread birth/burst/fray has its sound, panned; max 3 SFX at once
- [ ] Music motif present in all 5 acts; silence before P040
- [ ] Per-shot audit sheet (76–90 stills) reviewed; no face covered, no head cropped, brightness consistent (§52.1)
- [ ] Master Prompt Part O final gate ticked
- [ ] 16:9 master + 3 Shorts + 3 thumbnails + SRT + metadata
