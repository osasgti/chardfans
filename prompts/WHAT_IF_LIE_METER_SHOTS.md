# Shot-by-shot storyboard: "What If You Could See When Anyone Is Lying?"

Companion to `WHAT_IF_LIE_METER.md`. **Every line of the script has its shots here.**
Durations are first estimates; after the voiceover is recorded, re-time every shot to the `words.json` timings (cuts land on
word starts or on pauses, never mid-word unless it's a deliberate J-cut).

Legend:
- **Lens**: 24 / 35 / 50 / 85 / 135 (CLAUDE.md §36.2).
- **Move**: push, pull, orbit, crane, rack (focus), whip, dz (dolly-zoom), lock (static + handheld drift).
- **Meter**: `LIE n%` on whoever speaks. "→" means it counts up during the line and lands on the last word.
- **Grade** per act: wonder (W), fun (F), tension (T), consequence (C), triumph (Tr).
- **SFX** names refer to `public/sfx/*`.

---

## HOOK (0:00–0:20) · grade W · music: pad + motif on bells · set: Void → Bedroom

| Shot | Line | s | Set / light | Lens · move | Action & acting | Meter / overlay | SFX |
|---|---|---|---|---|---|---|---|
| H01 | (pre) | 1.5 | void, total black | — | black frame. Room tone only | — | `amb_void` fades in, `drone_low` 0.1 |
| H02 | L001a "What if, starting tomorrow," | 2.5 | void, top spot fades up (0→90 over 40 beats) | 85 · push 10% | the hero in silhouette, head down. The rim light appears first, then the key | title word-by-word: WHAT IF | `word` ×2, `reverse_cymbal` building |
| H03 | L001b "you could see when *anyone* is lying?" | 3.0 | void | 50 · crane up from low | the hero lifts their head and opens their eyes (blink, then a saccade to the camera) | title: YOU COULD SEE · gold shimmer on LYING | `chime` on "anyone", `whoosh` |
| H04 | L002a "Not a guess. Not a feeling." | 2.5 | void, 2 extra figures fade in out of the fog, blurred | 35 · orbit 12° | the figures stand still, idle breathing | — | `tick_soft` on each "Not" |
| H05 | L002b "A number. Floating right above their head." | 3.0 | void | 50 · push to the middle figure | an empty badge `LIE —` pops above the figure, then a dotted line drops to the head | **first meter** (springs in, ring empty) | `pop_big`, `notification`, motif on bells |
| H06 | L003 "Zero means the truth… A hundred means… well." | 3.5 | void, a split frame: two figures | 50 · lock | left figure: the meter counts to 0 (gold). Right figure: counts to 100 (red, jittering) | two meters side by side | `success` (left), `fail_buzz` 0.2 (right) |
| H07 | L003 "You'll see." + L003b | 4.0 | void → **match cut** to the bedroom ceiling | 35 · pull | the hero turns to the camera and gives a smug half-smile. Light goes from cold to warm | — | `whoosh_heavy` into the cut, the music bar lands |

---

## ACT 1 · THE RULES (0:20–1:10) · grade F · music: pluck arpeggio + light drums · sets: Bedroom, Kitchen, Bus, Street

| Shot | Line | s | Set / light | Lens · move | Action & acting | Meter / overlay | SFX |
|---|---|---|---|---|---|---|---|
| A01 | L004a "You wake up." | 2.0 | bedroom, dawn blue through the window, warm lamp off | 24 · top-down crane | the hero in bed, eyes opening (squash on the head as they sit up) | tag: MONDAY · 6:59 AM | `amb_bedroom_night` → day room, `cloth_rustle` |
| A02 | L004b alarm says "five more minutes…" | 2.5 | bedroom, phone screen emissive | 135 · rack (phone → face) | the phone alarm UI shows the speech text as a notification | meter on the PHONE → 82 | `alarm_beep`, `counter_roll` |
| A03 | L004c "Eighty-two percent." | 1.5 | bedroom | 85 · lock | the hero stares at the phone, deadpan blink | badge lands, ticks | `tick`, short silence |
| A04 | L005 Mom "almost ready" | 3.0 | kitchen, warm key from the window (GodRays), steam | 35 · orbit | Mom at the stove (with a pan prop), turns her head to talk (eyes lead) | Mom → 31 (amber-gold) | `room` + sizzle (`paper_shuffle` lowpassed), `pop_small` |
| A05 | L005 "Fair." | 1.0 | kitchen | 50 · lock | the hero nods once, mouth flat | — | `tick_soft` |
| A06 | L006 brother: cookie | 3.0 | kitchen table | 50 · push | the brother (scale 0.8) with crumbs on his face, a cookie jar behind him with its lid off | brother → **99** (red jitter) | `counter_roll` fast, `fail_buzz` 0.25 |
| A07 | L006 "Ninety-nine." | 1.5 | kitchen | 85 · snap zoom (fov −4° in 3 beats) | the brother freezes mid-chew (hold pose 12 beats) | pulse ring red | `pop_big`, `kid_laugh` 0.15 |
| A08 | L007a "The rules are simple." | 2.0 | void, rules-explainer layout | 35 · lock | the hero stands center, looking at the camera | title tag: THE RULES | `stinger_good` (short), `slide_in` |
| A09 | L007b "only shows up when someone talks" | 3.0 | void | 50 · orbit 8° | figure B talks (mouth flap). The meter appears with the mouth and vanishes when it closes | meter blinks in and out with speech | `pop_small` in, `swish_ui` out |
| A10 | L007c "gold when honest… red when not" | 3.5 | void, two figures | 35 · lock | a gold meter on the left, red on the right, and a ramp legend (0 → 100, gold → amber → red) draws itself | Callout with arrows: TRUTH / LIE | `bar_fill`, `success`, `error_blip` |
| A11 | L008 people, ads | 2.5 | street, billboard | 24 · whip-in | a quick montage of a person and then an ad poster | meters pop on each | `whip`, `pop_small` ×2 |
| A12 | L008 cereal box "balanced breakfast" | 2.5 | kitchen counter | 135 · push on the box | a cereal box prop with a smiling sun mascot (original design) | box → 74 | `counter_roll`, `tick` |
| A13 | L008b bus driver "one more minute" | 3.5 | bus stop, morning | 50 → 24 | the driver says the line, the doors close, and the bus pulls away while the hero runs (run cycle) | driver → 90 | `step_tile` running, a bus hiss (`whoosh_heavy` lowpassed) |
| A14 | L008b "He does not wait." | 1.5 | bus stop | 35 · lock | the hero stops and slumps (deflate reaction) | — | `crowd_aww` 0.1 |
| A15 | L008c billboard "ten pounds" | 3.0 | street, a huge billboard | 24 · crane up the billboard | a giant billboard figure with a speech bubble | a meter so red it **flickers with fire particles** | `fail_buzz` + `glitch`, comic `pop_big` |
| A16 | L008d "first big secret…" | 3.5 | school cafeteria, lunch | 35 · slow push | the hero at a table alone, watching the crowd. Background crowd meters fade on and off as people talk | 6 small meters in the background at mixed values | `crowd_murmur`, a cluster of quiet ticks |
| A17 | L008d "…mostly for themselves." | 2.5 | cafeteria | 85 · lock | the hero raises an eyebrow (head tilt) | — | music drops a layer (beat break) |

---

## ACT 2 · USING IT (1:10–2:10) · grade F → Tr · music: drums up, bass in · sets: Classroom, Hallway, Fundraiser

| Shot | Line | s | Set / light | Lens · move | Action & acting | Meter / overlay | SFX |
|---|---|---|---|---|---|---|---|
| B01 | L009 "basically a cheat code" | 2.5 | classroom, window GodRays | 24 → 50 crane | the hero sits down with a smug lean back. Glasses-glint style ping on their eye | tag: PERIOD 3 · HISTORY | `stinger_good`, drums enter |
| B02 | L010 teacher "won't be on the test" | 2.5 | classroom whiteboard | 50 · OTS from the hero | the teacher at the whiteboard, marker in hand | teacher → 91 | `marker_squeak`, `counter_roll` |
| B03 | L010 "study that chapter twice" | 2.0 | bedroom desk, night lamp | 35 · time-lapse | the hero studies. A clock spins (props). Papers pile up | — | `pen_write`, `clock_tick` sped up |
| B04 | L011 "didn't copy your homework" | 2.5 | hallway, lockers | 50 · lock | Lucky (backwards cap) leans on a locker, grinning | Lucky → **100** | `counter_roll`, `fail_buzz` |
| B05 | L011 "knew that one already" | 1.5 | hallway | 85 | the hero, deadpan | — | `tick_soft` |
| B06 | L012 the casino-night banner | 3.0 | gym as a casino: felt tables, string lights, CASINO NIGHT · SCHOOL FUNDRAISER · FAKE CHIPS banner | 24 · crane down through the string lights | an establishing shot with crowd | — | `amb_casino`, `whoosh_heavy` |
| B07 | L012 dealer "totally random" | 3.0 | card table, a hot amber pool light (volumetric) | 50 · orbit | the dealer (visor) shuffles cards (card prop animation) | dealer → 68 | `card_flick` ×4, `counter_roll` |
| B08 | L013a "chips are fake" | 2.0 | card table | 135 · top-down | chips stacking (precomputed physics drop) | — | `chips_stack` |
| B09 | L013b "win *every* hand" | 3.5 | card table | 35 · a 3-shot speed-ramp montage | the hero flips a winning card ×3. Chips slide over. A crowd forms behind | counter: WINS 1 → 7 | `card_flick`, `success` ×3 rising in pitch |
| B10 | L013c "people start to notice" | 2.0 | fundraiser | 85 · rack to the background | blurred crowd heads turn toward the hero one by one (staggered) | — | `crowd_gasp` 0.3 |
| B11 | L014 "everyone wants you on their team" | 3.0 | hallway | 35 · pull back | 5 kids crowd the hero. Hands go up | — | `crowd_cheer` 0.4 |
| B12 | L014 "group projects / debates / is he into me?" | 3.5 | 3 quick cuts: classroom, auditorium, locker | 50 · whip ×2 | three 1.1s vignettes. The last one: a girl whispers. Meter → 3 (gold) | `WhipStreak` | `whip` ×2, `pop_small` |
| B13 | L015 "most popular kid in school" | 3.0 | hallway, slow-mo walk | 50 · dolly backward | the hero walks toward the camera (walk cycle), the crowd parts, light leaks, warm grade spike (Tr) | title: MOST POPULAR | `stinger_good`, `sparkle`, music peak |
| B14 | L015b settle arguments: "Did she really say that?" | 3.0 | cafeteria | 35 · lock | two girls arguing. The hero points. Meter → 12 | meter on the accused | `pop_small`, `success` |
| B15 | L015b "Drama over." | 1.0 | cafeteria | 85 | the girls hug awkwardly | — | `tick_soft`, `kid_laugh` 0.1 |
| B16 | L015c rumors / compliments | 4.0 | hallway montage, 4 × 1s | 50 | 4 kids with meters: 2, 88, 5, 61 | quick meters | `pop_small` ×4, panned L/R |
| B17 | L015d "only person who sees clearly" | 4.0 | rooftop at sunset (Void variant + sky gradient) | 24 · orbit 25° | the hero alone at the edge, wind in their hood (follow-through) | — | music thins to pad, wind (`whoosh` slow, lowpassed) |

---

## ACT 3 · IT TURNS (2:10–3:20) · grade T · music: drone + heartbeat + Shepard riser · sets: Hallway night, Kitchen night, Dinner

| Shot | Line | s | Set / light | Lens · move | Action & acting | Meter / overlay | SFX |
|---|---|---|---|---|---|---|---|
| C01 | L016 "things you didn't ask for" | 3.0 | hallway, half the lights off, one flickering | 35 · slow push | the hero walks alone. The flickering practical sets the mood | `DipToBlack` into the act | `whoosh_heavy`, `drone_low`, `stinger_bad` (quiet) |
| C02 | L017 Maya "No, I'm not mad." | 3.0 | lockers, cold key | 85 · lock | Maya (ponytail, teal) avoids eye contact and closes her locker | Maya → **55** (amber, not red) | `locker_slam` 0.4, slow `counter_roll` |
| C03 | L017 "Fifty-five." | 2.0 | same | 135 on the hero | the hero's eyes flick to the meter, then back to Maya. A gulp | — | silence under the number, then motif on low saw |
| C04 | L018 teacher "fair chance" | 2.5 | classroom, desaturated | 50 · OTS | the teacher hands back tests | teacher → 40 | `paper_shuffle`, `tick` |
| C05 | L019a "Your dad, on the phone, late at night" | 3.0 | house hallway, a doorway frame, darkness | 35 · slow creep forward | the hero in pajamas at a doorway. The kitchen beyond is dark except for a phone glow | — | `heartbeat` loop starts, `door_creak` |
| C06 | L019b Dad: "Everything's fine. Don't worry about it." | 4.5 | kitchen lit only by the phone (blue emissive + a blue spot) | 85 through the door gap · lock | Dad sits hunched, phone to his ear, rubbing his forehead | Dad → climbs slowly to **88** over the whole line | phone babble (`mumble_vo` bandpassed), `heartbeat` |
| C07 | L019 hold | 2.5 | same | 135 on the meter → rack to the hero's eyes | the hero, frozen. Eyes glisten (a small specular catch-light boost) | the meter pulses once | only the heartbeat, then silence |
| C08 | L020 "Every 'I'm good'…" | 4.0 | montage: 4 people, 1s each | 50 · lock | "I'm good" 63, "no worries" 71, "love you" 12, "I'm fine" 58 | meters | `tick` ×4, each pitched lower |
| C09 | L021 "numbers don't care how you feel" | 2.5 | void, the hero surrounded by 20 floating meters | 24 · orbit 30° | meters orbit like planets around the hero | many meters, dim | `shimmer_loop` detuned, `riser_shepard` starts |
| C10 | L022 "stop asking questions" | 2.5 | bedroom, night | 50 · lock | the hero puts the phone face-down on the desk | — | `cloth_rustle`, a soft `stamp` |
| C11 | L022b dinner, numbers over the mashed potatoes | 4.5 | dining room, a warm practical lamp but a cold grade | 35 · overhead slow rotate | the family talking (mouth flaps), with small meters bobbing over their heads above the plates | 3 meters: 22, 47, 15 | muffled family chatter (`mumble_vo` lowpassed), cutlery (`chips_stack` pitched) |
| C12 | L022c Maya text "we're good, right?" | 3.0 | bedroom, phone close-up | 135 · lock | a text bubble on screen. **No meter appears.** An empty badge slot flickers, `LIE ?` | the badge shows `?` | `notification`, then silence |
| C13 | L022c "that's worse" | 2.0 | bedroom | 85 · slow push | the hero lies back on the bed, staring up | — | the heartbeat slows |
| C14 | L022d "you don't trust anyone anymore" | 3.0 | bedroom, cold moonlight only | 35 · pull out through the window | the hero is small in frame. The house is dark | — | `drone_low`, `riser_shepard` continues |
| C15 | L022d "Because *you* did." | 2.0 | same | — | cut to black for 0.5s | — | `suck_back`, hard silence |

---

## ACT 4 · THE MIRROR (3:20–4:20) · grade C · music: solo piano motif, sparse · sets: Bathroom, Void

| Shot | Line | s | Set / light | Lens · move | Action & acting | Meter / overlay | SFX |
|---|---|---|---|---|---|---|---|
| D01 | L023a "One night, you can't sleep." | 2.5 | bedroom, 3:14 AM clock | 50 · lock | the hero sits up in the dark | tag: 3:14 AM | `clock_tick` slow, `amb_bedroom_night` |
| D02 | L023b "go to the bathroom" | 2.5 | hallway, bathroom door light spilling out | 35 · follow | walk cycle, slow and tired | — | `step_wood` slow, `door_creak` |
| D03 | L023c "look in the mirror" | 3.0 | bathroom: one flickering fluorescent, tiles, a sink | 50 · OTS into the mirror | we see the hero's reflection. The real hero is a blurred silhouette in the foreground | — | fluorescent buzz (`drone_low` bandpassed 120Hz), drip |
| D04 | L024 "I'm fine." | 2.5 | bathroom | 85 on the reflection · lock | the reflection's mouth says it. Small, tired | — | the line itself, dry (no reverb), everything else ducked |
| D05 | (silence) | 2.0 | bathroom | **dolly-zoom** (fov 30→22 while the camera pulls back) | the face is frozen. The flicker stops dead | — | 6 beats of TOTAL silence (room tone off) |
| D06 | L025 "Ninety-six." | 3.0 | bathroom | 85 · snap push | a meter erupts **reversed in the mirror**, counting at full speed to 96 in red. Then the real meter fades in over the real head | mirrored + real meter, red glow | `impact` + `boom_sub` + `stinger_bad`, red `Flash` |
| D07 | L026 "the person lying the most…" | 4.0 | void: the friend, Dad and the dealer appear as silhouettes in a row with their old meters | 35 · slow truck past them | each silhouette's meter fades to grey as the camera passes | meters 55, 88, 68 fading | solo piano motif starts (karplus, slow) |
| D08 | L027 "It was you. To yourself." | 3.5 | void, the hero alone in a top spot | 50 · slow push | the hero looks down at their own hands | the 96 meter above the head, dimming | piano, with space |
| D09 | L027 "Every single day." | 2.0 | same | 85 | a slow blink. The head drops 10° (deflate) | — | — |
| D10 | L028 "the thing the meter never told you" | 3.0 | void | 35 · orbit | the meter **shatters** into gold particles (instanced shards, precomputed) | — | `glitch` soft, `sparkle` reversed |
| D11 | L028 "It shows *that*… not *why*." | 3.0 | void | 50 · lock | the particles re-form into a big glowing `?` | title: NOT WHY (gold) | `chime_low`, piano |
| D12 | L029a Maya "wasn't hiding anger. She was hurt." | 3.5 | hallway, but now warm, desaturated | 85 · slow push | Maya alone at her locker after school, wiping an eye | her meter fades to nothing | piano, `amb_hallway` soft |
| D13 | L029b Dad "protecting you" | 3.5 | kitchen at night (the C06 set, but warm) | 50 · reverse angle of C06 | we finally see Dad's face: tired, worried, then a soft look toward the hero's door | — | piano + low pad enters |
| D14 | L029b brother "really likes cookies" | 3.0 | kitchen at night | 50 · lock | the brother sneaks a cookie in pajamas and freezes when caught by the light | a tiny meter pops: 99 → it shrugs | `pop_small`, `kid_laugh` 0.2 (a comic relief beat) |
| D15 | L029c "a door someone closed…" | 4.0 | void, a single door in a spotlight | 35 · slow push | the door is closed, light leaking under it. It slowly opens a crack | — | `door_creak` (soft), warm pad swell |

---

## ENDING · THE CHOICE (4:20–5:00) · grade Tr (soft) · music: full motif, warm pad · sets: Kitchen dawn, Bedroom, Void

| Shot | Line | s | Set / light | Lens · move | Action & acting | Meter / overlay | SFX |
|---|---|---|---|---|---|---|---|
| E01 | L030 "next morning, something new" | 3.0 | kitchen at dawn, golden GodRays, dust | 24 · crane down | the hero enters, light hitting their face | tag: TUESDAY · 7:02 AM | `amb` warm, birds (`shimmer_loop` filtered), `whoosh` |
| E02 | L031 "ask your dad… and you listen" | 4.5 | kitchen table | 50 · slow orbit around both | the hero sits across from Dad. Dad talks (mouth flap), the hero listens and nods | Dad's meter flickers on at 40 → **fades away** as he keeps talking | music pad + motif on plucks, softly |
| E03 | L032a "some go down, some stay high" | 3.0 | montage: Mom, teacher, Lucky | 50 | meters drop (40 → 5) and some stay (Lucky 100, a comic wink) | meters animate down | descending `tick`s, `success` |
| E04 | L032a "reading people" | 3.0 | school hallway, morning | 35 · dolly backward | the hero walks. Meters around them dissolve into soft bokeh | meters → bokeh particles | the motif on bells |
| E05 | L032b calls Maya | 4.5 | bedroom, phone to ear, window light | 85 · lock | the hero talks, a nervous then relieved smile. Cut to Maya at her window smiling (match framing) | **no meter**: `No meter needed` small cream text | `notification` (incoming), music swell |
| E06 | L032c mirror again: "I'm not fine. But I will be." | 4.5 | bathroom, now **warm** (fixed light, no flicker), morning | 50 · OTS mirror (mirrors D03) | the hero says it with a small honest smile | meter → **0** in gold, then a sparkle | `success`, `sparkle`, the full motif |
| E07 | L033 "would you *want* to?" | 4.0 | void, **the same angle as H03** (book-end) | 50 · slow push | the hero looks straight down the lens. Warm light this time, not cold | title: WOULD YOU WANT TO? (gold emphasis on WANT) | `word` ticks, music holds a sustained chord |
| E08 | L034 "Tell me in the comments… I'll know" | 3.5 | void | 85 · lock | the hero gives a smug half-smile (bookends H07) | a meter appears over **the viewer's position** (bottom center, facing out): `YOU ?%` | `notification` |
| E09 | L034 "Zero percent. Probably." | 2.5 | void | 85 | a wink. The meter lands on 0, wobbles to 3, then 0 | — | `tick`, `kid_laugh` 0.1 |
| E10 | (end) | 2.0 | black | — | cut to black, then the end card space (keep the bottom-right 40% clean) | — | `boom_sub` tail, music ring-out |

**Totals:** 7 + 17 + 17 + 15 + 15 + 10 = **81 shots**. The listed durations add up to **3:52**, but the voiceover is about 5:00,
so when re-timing to `words.json`, shots stretch by about 30% on average. Spend the extra time on *held* moments
(the dad shot, the mirror, the rooftop, the ending), not by slowing the comedy beats. If a shot would exceed 6s, split it with a new angle.

---

## Per-line voice direction (paste as TTS instructions or use as a recording guide)

| Line | Delivery |
|---|---|
| L001 | intimate, curious, a half-whisper on "starting tomorrow", leaning on "anyone" |
| L002 | crisp, staccato, with a small smile on "Floating right above their head" |
| L003 | playful. A beat before "well". "You'll see" is ominous but light |
| L003b | warm, then dry and deadpan on "It isn't." |
| L004–L006 | comic timing: deliver the setup normally and the number dry, as a punchline. "Ninety-nine" deadpan |
| L007 | teacher-like and clear, slightly faster |
| L008–L008c | a quick comic list rhythm, getting more incredulous. "basically on fire" laughs lightly |
| L008d | it slows down here: a realisation, thoughtful |
| L009–L011 | cocky, the momentum building |
| L012–L013 | storytelling, with excitement on "*every* hand" |
| L014–L015 | rising energy and pride. "most popular kid in school" savoured |
| L015b–c | quick and satisfied |
| L015d | a little too confident. A hint that this is the high before the fall |
| L016 | a tone shift: quieter, slower, darker |
| L017–L018 | gentle, the numbers said softly as if they hurt |
| L019 | barely above a whisper. Long pause before "Eighty-eight." Let it hang |
| L020–L021 | measured, heavy |
| L022–L022d | tired, lonely. "Because *you* did." very quiet, almost to yourself |
| L023 | slow, sleepy, with a calm dread |
| L024 | **small and brittle**: the character's own voice (a different, younger TTS voice, or the narrator pitched slightly up) |
| L025 | a whisper. The number lands like a confession |
| L026–L027 | slow realisation. A break in the voice on "To yourself" |
| L028–L029c | warmer: understanding, gentle wisdom, not preachy |
| L030–L032c | hopeful, lighter, a smile you can hear. "No meter needed" soft and proud |
| L033 | straight to the viewer, sincere, slow |
| L034 | playful again, with a wink in the voice. "Probably." is a throwaway |

---

## Retention engineering (where viewers drop off, and the counter-move)
| Time | Risk | Counter-move already in the plan |
|---|---|---|
| 0:00–0:05 | the swipe-away | the question is in the first line plus a striking void silhouette, with no logo |
| 0:30 | "I get it" | the rules explainer (A08–A10) adds a new visual language with gold vs red |
| 1:00 | montage fatigue | a new location (the fundraiser) plus drums entering |
| 1:50 | peak and then plateau | the rooftop beat (B17) slows down and plants doubt |
| 2:10 | the act change | a dip to black, a new grade, a new music cue |
| 2:40 | darkness drags | the dad shot is the visual highlight, with a heartbeat for tension |
| 3:20 | the twist | silence + dolly-zoom + the mirrored meter, the biggest moment in the video |
| 4:00 | the moral could feel preachy | the brother cookie comic relief (D14), then hope |
| 4:40 | early exit before the end | a direct address plus "YOU ?%" on the viewer is the comment bait |

---

## Cut-downs (Shorts, ≤ 60s each, 1080×1920, captions on)
1. **"The cookie"**: A04–A07 + E09 (about 20s). Comedy hook.
2. **"Dad on the phone"**: C05–C07 + D13 (about 25s). An emotional hook. End on the text "full video ↑".
3. **"The mirror"**: D01–D06 (about 18s). End on 96 with no resolution, a cliffhanger into the full video.

---

## Thumbnail (CLAUDE.md §43)
- **A:** the hero's face (shock), half-lit by the bathroom flicker, with a giant red meter `LIE 96%` and the text "MY OWN?".
- **B:** Dad in the dark kitchen with a phone glow, a red `88%`, and the text "DAD LIED".
- **C:** the brother with a cookie, a red `99%`, and no text (comedy).
Test them at 168×94. Pick the one where the number reads first.

---

## YouTube metadata
- **Title options:**
  - "What If You Could See When Anyone Is Lying?"
  - "I Could See Everyone's Lies… Then I Looked in the Mirror"
- **Chapters:** `0:00 What if…` · `0:20 The rules` · `1:10 Cheat code` · `2:10 It turns` · `3:20 The mirror` · `4:20 The choice`
- **Pinned comment:** "Would you want this power? Be honest… I'll know 👀"
