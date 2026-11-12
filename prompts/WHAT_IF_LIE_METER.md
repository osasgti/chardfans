# MASTER PROMPT — "What If You Could See When Anyone Is Lying?" (5:00, TTS)

> Claude: this file is the brief, script, shot plan, voice spec and sound map for one 5-minute video.
> Follow `CLAUDE.md` §36 (the production standard) for *how* to build. This file says *what* to build.
> Do the phases in order (§36.1) and show the user the artifact at each gate before spending render time.

---

## 1. Concept (why this one)

**Logline:** a kid wakes up able to see a glowing "LIE %" badge above everyone's head. It's a superpower, until
it points at the people they love, and finally at themselves.

Why it's the strongest pick for this engine:
- It **reuses the signature asset**: the odds badge becomes a LIE meter, so there's no new UI language to invent.
- There are dozens of instantly readable everyday scenes (school, home, friends), and every one is a mini joke with a number payoff.
- It has a real emotional arc (fun → power → paranoia → twist → warmth) that keeps people watching all 5 minutes.
- It's a universal "would you want this?" question, which drives comments.

Alternatives if you want a different topic (the same structure works):
| Title | Badge | Twist |
|---|---|---|
| What if you could rewind 10 seconds? | `REWINDS LEFT 3` | rewinds cost memories |
| What if you could see how much everyone *likes* you? | `LIKES YOU 64%` | yours for yourself is the lowest |
| What if you could pause time, but only for 5 seconds? | `PAUSE 5.0s` countdown | the world keeps a scar of every pause |
| What if every choice showed its regret %? | `REGRET 12%` | the 0% choice is the scariest one |

---

## 2. Text-to-speech recommendation

| Provider | Why | Word timings | Use it if |
|---|---|---|---|
| **ElevenLabs** (recommended) | the most natural, emotional narration, controllable stability/style, many storyteller voices | ✅ the "with timestamps" endpoint returns character-level alignment | you want the best result |
| OpenAI TTS (gpt-4o-mini-tts) | cheap, and you can *instruct* the delivery ("whisper this", "smug") | ❌ estimate them with `scripts/estimate_timing.py` | you're on a budget |
| Azure Neural TTS | SSML control (pauses, emphasis, rate), very stable | ✅ word boundary events | you want precise SSML |

Verify current prices and voice names on the provider's site before choosing. They change often.

**Voice casting:** a young-adult narrator, warm, slightly intimate, with a dry humor edge. Avoid "documentary-deep" voices
and avoid hype. Think "a friend telling you something wild at 2am".

**Settings (ElevenLabs terms):**
- Stability 0.40–0.50: expressive, but it doesn't drift.
- Similarity 0.75.
- Style 0.25–0.35.
- Speaker boost on.
- Speed 1.0, giving about 150 words/min.

**Generation rules:**
- Generate **one file per line** (`public/vo/L001.wav` …), not one long take. This lets you retime, re-roll a bad line, and
  get clean timestamps per line.
- Write the pauses into the text: a comma is short, "…" is a longer beat, and a new line is a separate file plus silence you control.
- Emphasis: deliver *italic* words with capitals in the TTS input only if the provider respects it. Otherwise re-roll until it lands.
- Re-roll any line that sounds flat **3 times** and keep the best. The narration is half the video.
- Post chain: `highpass=f=70, acompressor=threshold=-20dB:ratio=2.5, loudnorm=I=-16`. Then build
  `public/vo/words.json` from the timestamps (offset by each line's start time in the edit).

**Credentials:** the API key goes through the session's credential tool. Never paste it into chat or commit it.

---

## 3. Structure (5:00 ≈ 680 words at 150 wpm + held pauses)

| Time | Act | Emotion | Grade | Music cue | Sets |
|---|---|---|---|---|---|
| 0:00–0:20 | **Hook** | wonder | wonder | pad + motif on bells | void → bedroom |
| 0:20–1:10 | **Act 1 · The rules** | fun | fun | pluck arpeggio + light drums | bedroom, kitchen, hallway |
| 1:10–2:10 | **Act 2 · Using it** | fun → power | fun → triumph | drums up, bass in | classroom, casino-night fundraiser |
| 2:10–3:20 | **Act 3 · It turns** | tension | tension | drone + heartbeat + Shepard riser | hallway night, home |
| 3:20–4:20 | **Act 4 · The mirror (twist)** | consequence | consequence | solo piano motif, sparse | bathroom mirror, void |
| 4:20–5:00 | **Ending · The choice** | warmth | triumph (soft) | full motif, warm pad | bedroom at dawn (mirrors the opening) |

There's a new set, a new graphic idea or a new music layer every 20–30s. There's one silence (6 beats) before the twist reveal.

---

## 4. Script (draft v2, about 680 words: ≈ 4:35 of speech + ≈ 25s of written pauses ≈ 5:00; measure after recording). `/` = short pause, `//` = long pause, `*x*` = emphasis

**HOOK (0:00)**
L001: What if, starting tomorrow, / you could see when *anyone* is lying?
L002: Not a guess. / Not a feeling. // A number. / Floating right above their head.
L003: Zero means the truth. // A hundred means… / well. / You'll see.
L003b: At first, / it feels like the best thing that's ever happened to you. // It isn't. / But we'll get there.

**ACT 1 — THE RULES (0:20)**
L004: You wake up. / Your alarm says "five more minutes won't hurt." // *Eighty-two percent.*
L005: Downstairs, Mom says breakfast is "almost ready." / Thirty-one percent. / Fair.
L006: Your little brother says he did *not* eat the last cookie. // Ninety-nine.
L007: The rules are simple. / The meter only shows up when someone talks. / It glows gold when they're honest… / and red when they're not.
L008: It works on people, / on ads, / on the cereal box that says "part of a balanced breakfast." // *Seventy-four.*
L008b: On the bus, / the driver says he'll "wait just one more minute." / Ninety. / He does not wait.
L008c: A guy on a billboard promises you'll "lose ten pounds in a week." // The meter is so red / it's basically on fire.
L008d: By lunch, / you've figured out the first big secret. // Almost nobody lies to hurt you. / They lie to make things *easier*. / Mostly for themselves.

**ACT 2 — USING IT (1:10)**
L009: At school, it's basically a cheat code.
L010: "This won't be on the test." / Ninety-one. / You study that chapter twice.
L011: "I totally didn't copy your homework." / Hundred. / You knew that one already.
L012: At the school's casino night fundraiser, / the guy running the card table says the deck is "totally random." // Sixty-eight.
L013: You don't win money. / The chips are fake. // But you win *every* hand. / And people start to notice.
L014: Suddenly, everyone wants you on their team. / For group projects. / For debates. / For "is he into me?"
L015: For about a week, // you're the most popular kid in school.
L015b: You settle arguments. / "Did she *really* say that about me?" // Twelve percent. / Drama over.
L015c: You catch the class rumor before it spreads. / You know which compliments are real / and which ones are just polite.
L015d: And honestly? // You start to think / you might be the only person in the world / who sees things *clearly*.

**ACT 3 — IT TURNS (2:10)**
L016: Then it starts showing you things you didn't ask for.
L017: Your best friend says, "No, I'm not mad." // Fifty-five.
L018: Your teacher says, "Everyone gets a fair chance." / Forty.
L019: Your dad, on the phone, late at night: / "Everything's fine. / Don't worry about it." //// *Eighty-eight.*
L020: You start hearing people differently. / Every "I'm good," / every "no worries," / every "love you"… / comes with a number.
L021: And numbers don't care how you feel.
L022: You stop asking questions. / Because you're scared of the answers.
L022b: At dinner, / everyone talks, / and you just watch the numbers float / over the mashed potatoes.
L022c: Maya texts you, / "we're good, right?" // Texts don't have meters. // And for some reason / that's worse.
L022d: You realise you don't trust anyone anymore. // Not because they changed. / Because *you* did.

**ACT 4 — THE MIRROR (3:20)**
L023: One night, you can't sleep. / You go to the bathroom, / look in the mirror, / and say it out loud.
L024: "I'm fine." //////
L025: *Ninety-six.*
L026: Turns out, / the person lying the most / wasn't your friend. / Or your dad. / Or the card dealer.
L027: It was you. / To yourself. / Every single day.
L028: And here's the thing the meter never told you. // It shows *that* someone is lying. // Not *why*.
L029: Your friend wasn't hiding anger. / She was hurt. // Your dad wasn't hiding a lie. / He was protecting you.
L029b: Even your little brother / wasn't lying about the cookie to be evil. // He just really, / really / likes cookies.
L029c: A lie, / it turns out, / is usually a door someone closed / because they didn't know how to open it.

**ENDING — THE CHOICE (4:20)**
L030: So the next morning, / you do something new.
L031: You ask your dad what's really going on. / And you listen.
L032: Some meters go down. / Some stay high. // But for the first time, / you're not reading numbers. / You're reading people.
L032b: You don't text Maya. / Not "we're good, right?" // You call her. / You say sorry. / And you mean it. // No meter needed.
L032c: That night, / you look in the mirror again. / "I'm not fine. / But I will be." // Zero.
L033: So, / if you could see when anyone is lying… // would you *want* to?
L034: Tell me in the comments. / I'll know if you're honest. // *Zero percent.* / Probably.

> Re-time after recording. If the total exceeds 5:10, cut L008b, L008c or L015c first. If it's under 4:50, lengthen the held pauses (dad shot, mirror). Never cut L019, L024–L029, L032c or L033.

---

## 5. The LIE meter (new UI rules, extending §8.2)
- It's the OddsBadge with the label `LIE` and a **color ramp by value**: 0–30 gold (`C.gold`), 31–69 amber `#f29a3b`, 70–100 red `#e0464f`,
  with a red glow and a faint 2px jitter above 90.
- It appears **only while the character speaks** (from `words.json` line ranges), with a 6-beat spring-in and a 10-beat fade after the line ends.
- Numbers count from 0 to the value during the line, so the meter "lands" on the final word.
- Above 90, add a short `fail_buzz` (vol 0.2) plus a 1-frame red border flash. At 0, use `success` + `sparkle` (quiet).
- The mirror shot: the meter appears **reversed in the mirror**. Use the projected position of the reflection, and mirror the text with `scaleX(-1)`.
  Then the camera pushes in and the *real* meter fades in over the hero's real head. This is the twist reveal.
- The motif plays on bells every time the meter appears in Act 1, on plucks in Act 2, and on low saw in Act 3. It stays
  silent in Act 4 until L029.

---

## 6. Cast (from CLAUDE.md §42, extended)
| Character | Look | Notes |
|---|---|---|
| **You** (hero) | black beanie, red hoodie | the camera lives near them. Smug → anxious → open |
| Mom | bun, mustard cardigan, taller | warm, kitchen |
| Little brother | small (scale 0.8), cap backwards, cookie crumbs (tiny brown dots on the face texture) | comic relief |
| Best friend (Maya) | ponytail, teal hoodie | Act 3 hurt, Act 4 resolution |
| Dad | glasses, grey sweater, taller | phone call in a dark kitchen, lit by the phone screen |
| Teacher | bob hair, cardigan | classroom |
| Card dealer | visor cap, vest | casino-night fundraiser (fake chips, it's school) |
| Crowd | instanced | hallway, cafeteria, fundraiser |

---

## 7. Shot plan. **The full 81-shot storyboard, per-line voice direction, retention plan, Shorts cut-downs, thumbnails and metadata are in `WHAT_IF_LIE_METER_SHOTS.md`.**

(Summary below: about 81 shots, average 3.7s.)
Write `storyboard.json` with one entry per shot. Minimum fields: `id, line, set, light, grade, lens, move, cast[], acting, overlay[], sfx[]`.
Key shots that must be special:
| Shot | Line | Description |
|---|---|---|
| S001 | L001 | void, a single top spotlight. The hero in silhouette, then the rim light comes up. The first meter fades in empty (`LIE —`). Slow push-in, 85mm |
| S006 | L004 | bedroom, phone alarm close-up at 135mm, then a rack focus to the hero's face. The meter lands on 82 with a tick |
| S010 | L006 | the brother, a crumbs close-up. The meter rockets to 99 with `fail_buzz` and a comic squash. Hold 1s |
| S015 | L007 | the "rules" explainer in the void set: two characters, a gold meter versus a red meter side by side, an animated ramp legend (Callout) |
| S028 | L012 | casino-night fundraiser: an overhead top-down of the card table, chips stacking, a "SCHOOL FUNDRAISER · FAKE CHIPS" banner |
| S034 | L015 | a crowd montage: 6 quick cuts (1.2s each), whip transitions, crowd_cheer, drums peak |
| S040 | L017 | Maya close-up at 85mm, shallow DOF. The meter at 55 is amber, not red. Silence under the number, then the motif on low saw |
| S046 | L019 | **the dad shot**: dark kitchen, lit only by the phone (an emissive plane with a blue key light), seen through a doorway (frame within frame). The meter slowly climbs to 88. Heartbeat. Hold for 4s |
| S055 | L024–L025 | **the mirror twist**: the bathroom at night, one fluorescent flickering. "I'm fine." Then 6 beats of total silence (`suck_back` before), then 96 lands with `impact` + `boom_sub` + a red flash. A dolly-zoom (fov 30→22 while the camera pulls back) |
| S062 | L028 | the void set: the meter shatters into particles that re-form as a question mark |
| S070 | L031 | the kitchen at dawn, warm key light through the window (GodRays). The hero sits with Dad. The meter flickers and fades away as they talk |
| S085 | L034 | the final frame mirrors S001 (the same void and angle), but with warm light and the hero smiling. The meter shows `0%` and winks out. Cut to black on a sub tail |

---

## 8. Sound map (extends the CLAUDE.md §33 and §36.6 cue list)
- **Ambience per set:** bedroom → `amb_bedroom_night` (night) or a warm `room` (day), kitchen → `room` + fridge hum (lowpassed `drone_low`),
  hallway → `amb_hallway`, classroom → `amb_classroom`, fundraiser → `amb_casino`, bathroom → fluorescent buzz (`drone_low` with a 120Hz bandpass) + drip.
- **Meter sounds:** `pop_small` on appear, `counter_roll` while counting, `tick` on land, `fail_buzz` above 90, `success` at 0.
- **Comedy beats** (the brother, the cereal box): `pop_big` + `kid_laugh` (vol 0.15) after the number lands.
- **Act transitions:** `DipToBlack` + `whoosh_heavy` + a music cue change on the bar line.
- **The dad shot:** music drops to the drone only, `heartbeat` loop, phone-speaker babble (`mumble_vo` through a bandpass at 1–3kHz, vol 0.2).
- **The twist:** `riser_shepard` under L023 → `suck_back` → 6 beats of silence → `impact` + `boom_sub` + `stinger_bad` → then the solo
  piano motif (generate `music_piano` via `karplus` with low damping) under L026–L029.
- **Ending:** the full motif + `music_pad` + `shimmer_loop` at 0.15, swelling into the last line. The comment-bait line gets a `notification` ding.
- **Ducking:** music at 0.15 under VO, 0.45 in gaps longer than 1s, and silence where the script says ////.

---

## 9. Production plan & render budget
| Step | Output | Time here (CPU only) |
|---|---|---|
| Script lock + TTS lines | `public/vo/L*.wav`, `words.json` | minutes (needs an API key) |
| Storyboard + color strip | `storyboard.json`, `out/colorscript.png` | 1 session |
| Build missing assets (§50 🔲) | sets: Bedroom, Kitchen (new), Classroom, Casino, Bathroom (new), Void. Props: phone, cereal box, cookie, cards, chips, mirror | 2–4 sessions |
| Blocking draft | 30fps, `--scale=0.5` | about 2–3h per full draft |
| Final master | 5:00 at 60fps = **18,000 frames** | **about 10h on this CPU** vs **about 15–30 min on a desktop GPU** |

**Strong recommendation:** do drafts here, and render the final on a machine with a GPU (`npm run render:chunks`), or with Remotion
Lambda. Alternatively, render the final at 30fps here (about 5h, chunked so a crash doesn't lose everything).

---

## 10. Definition of done
- [ ] Runtime 4:50–5:10, the hook question in the first 5s, and a twist at about 3:30
- [ ] Every meter appears only during speech, lands on the last word, and uses the correct color ramp
- [ ] A new set, graphic or music layer every 20–30s
- [ ] The dad shot and the mirror shot are the two most beautiful frames in the video (lighting reviewed as stills first)
- [ ] VO at −16 LUFS, master at −14, music ducked, silence before the twist
- [ ] Captions on (for vertical cut-downs), an SRT exported, and YouTube chapters for each act
- [ ] All §36.10 boxes ticked


---

## 11. Look bible per act (lighting and grade, using CLAUDE.md §36.3 + `style/presets.ts`)
| Act | Key | Fill ratio | Accent | Atmosphere | Signature image |
|---|---|---|---|---|---|
| Hook | top spot 4000K | 1:16 (near black) | cold rim 9000K | fog wall, no dust | a silhouette with the rim light coming on |
| Act 1 | morning window 5600K + warm practicals 2700K | 1:2 (open, happy) | magenta kicker 5% | dust in the window beams, steam | the brother frozen mid-chew under a red meter |
| Act 2 | classroom daylight, then amber pool lights 3000K in the fundraiser | 1:3 | string-light bokeh | volumetric cones over the tables | the slow-mo hallway walk with light leaks |
| Act 3 | cold fluorescent 6500K, one flickering; the phone screen as the only key in the kitchen | 1:8 → 1:16 | blue moonlight 12000K | heavier fog, no dust | Dad through the doorway, lit by the phone |
| Act 4 | bathroom fluorescent (flicker → off), then a void top spot | 1:16 | red meter glow as the only colored light | silence-dark | the mirrored 96 |
| Ending | golden dawn 3000K GodRays | 1:2 | warm bounce from the table | dust and soft bloom 0.9 | the warm mirror smile, meter at 0 |

The hook and the ending are deliberately **the same angle and set with opposite light** (cold → warm). That's the whole arc in two frames.

---

## 12. New assets this video needs (add them to CLAUDE.md §50 when built)
| Asset | Spec |
|---|---|
| **Kitchen** | 5×4m. Counter, stove, fridge (box + handle), table with 4 chairs, a window on the left (GodRays), a pendant lamp practical |
| **Bathroom** | 2.5×2.5m. Tiles (a grid texture via thin box seams), a sink, a **mirror** (drei `MeshReflectorMaterial` mirror=1 or a second camera render target), one fluorescent tube that can flicker |
| **Gym fundraiser** | the casino set (§41) plus basketball hoops, string lights (instanced emissive spheres), the banner |
| **Bus stop / street** | a sidewalk, a shelter, a bus (rounded box, windows emissive), a billboard plane |
| **Rooftop** | a ledge, a sky gradient dome (sunset), distant city blocks (instanced boxes with emissive windows) |
| **Dining room** | a table, plates, a bowl of mashed potatoes (a squashed sphere), a pendant lamp |
| **Props** | phone (emissive screen with alarm/text UI), cereal box (original mascot), cookie and jar, cards, chips, pan, marker, test papers, door |
| **Characters** | Mom, brother, Maya, Dad, the dealer, the teacher, crowd. Hair: bun, ponytail, bob, visor. Glasses |
| **Meter v2** | OddsBadge with a `LIE` label, the color ramp, speech-gated visibility, a mirrored mode, a shatter-to-particles mode, a `?` mode, a "fire" mode (>95, ember particles) |

Build order: Meter v2 → Kitchen + Bedroom (Acts 1, 3, Ending) → Bathroom + mirror (the twist) → Classroom, Hallway night → Fundraiser → the rest.
Render one look-dev still of each set and show it to the user before animating (CLAUDE.md §48).

---

## 13. Music plan (bars at 72 → 96 → 72 bpm)
| Section | Tempo | Stems | Motif treatment |
|---|---|---|---|
| Hook | 72 | `music_pad` + `drone_low` 0.1 | bells, the first 3 notes only (unfinished, which teases) |
| Act 1 | 96 | pad + `music_pluck` + light `music_drums` | full motif on plucks when the first real meter lands (A03) |
| Act 2 | 96 | + `music_bass`, drums full, claps on 2 and 4 | the motif an octave up, triumphant, at B13 |
| Act 3 | 72 | drone + heartbeat + `riser_shepard`, everything else muted | the motif on low saw, slowed, minor (A C E♭ D C) |
| Act 4 | free time | solo piano (karplus) | the motif slow, with a long gap between notes 3 and 4 |
| Ending | 72 | pad + plucks + bells, no drums | the full motif resolving to the tonic (the first time it's ever completed) |

The motif is **never completed until the last shot**. That's the musical version of the story's resolution.
Generate the extra stems (`music_piano`, `music_minor_motif`, tempo-96 versions) by extending `scripts/make_sfx.py`.
