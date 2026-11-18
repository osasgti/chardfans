# WHAT-IF IDEA ENGINE: master prompt for the next 5-minute video

> **Purpose:** find, verify and fully spec a "What if…?" premise that is (a) genuinely fresh, (b) spectacular in *this* engine
> (pill-people, film lighting, floating gold meters), and (c) has a real emotional arc across 5:00.
>
> **How to use:** paste the box in Part 1 into a new session. Claude will (1) generate ≥15 ideas, (2) **check each one against
> what already exists online**, (3) score them, (4) present the top 3 to the user, and (5) after the user picks, write the full
> per-video master prompt (`prompts/WHAT_IF_<SLUG>.md`) in the same format as `WHAT_IF_LIE_METER.md`.
>
> **Honesty rule:** nobody can prove an idea has *never* been done. "Unique" here means: **no prominent video uses the same premise
> with the same twist**, checked by real searches, with the evidence written down. If a close match exists, say so and either drop the
> idea or change the angle until it no longer matches.

---

## PART 1 — THE PROMPT (copy everything in the box)

```text
You are the showrunner, head writer, story editor and research lead for this repo's next 5-minute "What if…?" video.
Read first: prompts/WHAT_IF_IDEA_ENGINE.md (this file, all parts), prompts/MASTER_PROMPT_INSANE.md (Parts A, B, U, W),
prompts/WHAT_IF_LIE_METER.md (the format of a finished per-video prompt), CLAUDE.md §17 (story structure), §38 (voice).

STEP 1 — GENERATE (no filtering yet)
- Produce at least 15 premises. Use the generators in Part 3 (at least 3 from each family A–E).
- Each premise: one-line hook ("What if…?"), the visible mechanic (what we SEE on screen), the badge/meter text,
  the escalation ladder (3 rungs), the twist, and the ending image.
- Reject on sight anything in the Part 2 "already done to death" list unless you have a twist that changes its meaning.

STEP 2 — CHECK (uniqueness research; this is mandatory)
For EVERY premise:
- Run at least 3 web searches (standard mode) using the query patterns in Part 4: the literal "what if" phrasing, the mechanic
  in plain words, and the twist in plain words. Add "YouTube", "animation", "short film" and "Reddit WritingPrompts" variants.
- Record: the 3 closest existing things (title, creator, year, URL, views if shown), and how ours differs.
- Classify: FRESH (nothing close) / ADJACENT (same mechanic, different twist or format) / TAKEN (same premise + same twist).
- TAKEN → drop or re-angle and re-search. Never present a TAKEN idea as unique.
- Use extended search only for the final 3 candidates, to double-check.

STEP 3 — SCORE (Part 5 rubric, 0–5 each, show the table)
Novelty · Visual hook in frame 1 · Engine fit · Escalation range · Emotional twist · Comment bait · Thumbnail ·
Production cost (inverted) · Shorts potential · Rewatch value. Total /50. Keep ≥38 only.

STEP 4 — PRESENT to the user
- Top 3 with: hook, 3-sentence pitch, the first 10 seconds shot by shot, the twist, the thumbnail concept, the score table,
  and the uniqueness evidence (closest matches + why ours differs).
- Then the remaining ideas in a compact table.
- Recommend one, and say why in two sentences. STOP and wait for the user's choice.

STEP 5 — WRITE the per-video master prompt for the chosen idea (only after the user picks)
- File: prompts/WHAT_IF_<SLUG>.md, same structure as WHAT_IF_LIE_METER.md, filled using Part 6 (the template) completely.
- 5:00 runtime, 40–55 VO lines, 70–90 shots, 4–5 acts, every line with its visual, every shot with set/light/camera/acting/UI/SFX.
- Reuse existing sets/props/reactions/meters where possible; list every NEW asset with a build estimate.
- Commit on the session branch and push. Do not start rendering or spend TTS credits without the user's OK.

Rules: original characters and world only (CLAUDE.md §13). No real people, brands or existing IP.
Be honest in the uniqueness section — cite what you found, including near-misses.
```

---

## PART 2 — ALREADY DONE TO DEATH (avoid unless the twist changes the meaning)

These premises have many popular videos. Don't pitch them as fresh.

| Saturated premise | Why it's saturated |
|---|---|
| What if you could read minds | Countless shorts, films and series |
| What if you could stop time | Same, and a standard explainer topic |
| What if you could see when anyone is lying | **Our own last video**, and common online |
| What if you lived forever / immortality | Huge explainer genre |
| What if the moon disappeared / earth stopped spinning | Science explainer staple |
| What if you could see death dates / countdown timers | Common film and short-story premise |
| What if you could see everyone's soulmate | Very common romance short premise |
| What if you could rewind time 10 seconds | Common game and short-story premise |
| What if humans could fly / be invisible | Superpower-listicle staples |
| What if social media likes floated over heads | Common satire premise |

**Pattern to learn from:** saturated ideas are *single superpowers with obvious payoffs*. Fresh ideas usually come from a
**mundane, measurable quantity made visible**, with a twist that turns it into something tender (family, friendship, self).

---

## PART 3 — IDEA GENERATORS (families A–E)

**A. Make an invisible quantity visible** (the engine's core strength: a meter over a head or object)
Formula: *What if everyone could see [hidden number] about [ordinary thing]?* Hidden numbers: time remaining together, attention,
promises kept, words left, energy, how often someone thinks of you, borrowed time, memories kept.

**B. One physical rule of the world changes**
Formula: *What if [physics/law] depended on [emotion/behaviour]?* Gravity on happiness, light on honesty, sound on kindness.

**C. A trade or economy that doesn't exist**
Formula: *What if you could trade [abstract thing] like money?* Luck, sleep, minutes, courage, memories.

**D. Time and causality twists**
Formula: *What if [you/your reflection/your shadow] lived [offset] in time?* Reflection one minute ahead, shadow one day behind.

**E. Objects and places with memory or opinion**
Formula: *What if [objects/rooms] kept [record] of people?* Doors that count goodbyes, chairs that remember who sat there.

---

## PART 4 — UNIQUENESS CHECK: query patterns and evidence format

**Queries per idea (minimum 3, more if anything close appears):**
1. `"what if" <premise words> animation` / `<premise words> YouTube video`
2. The mechanic in plain words, e.g. `see how many minutes you have left with someone counter`
3. The twist in plain words, e.g. `counter of time left with parents short film`
4. Variants: `<mechanic> short film`, `<mechanic> writing prompt reddit`, `<mechanic> webtoon`, `<mechanic> TikTok`

**Evidence table (required per idea):**

| # | Closest existing work | Creator / year | Link | Same mechanic? | Same twist? | How ours differs |
|---|---|---|---|---|---|---|

**Classification:**
- **FRESH:** nothing with the same mechanic in a visible, popular video.
- **ADJACENT:** mechanic exists as a writing prompt or obscure short, but not this twist or this treatment.
  Acceptable if the twist and visual treatment are clearly ours.
- **TAKEN:** same mechanic and same twist in a popular video → drop or re-angle.

---

## PART 5 — SCORING RUBRIC (0–5 each, total /50, keep ≥38)

| Axis | 0–1 | 2–3 | 4–5 |
|---|---|---|---|
| Novelty | taken | adjacent | fresh, with evidence |
| Visual hook (frame 1) | needs explaining | readable in 3 s | readable muted at thumbnail size |
| Engine fit | needs new tech | some new sets | reuses meters, pill-people, existing sets |
| Escalation range | one joke | 3 rungs | 5+ rungs from funny to devastating |
| Emotional twist | none | sad ending | twist re-reads everything before it |
| Comment bait | none | "cool" | a question every viewer answers differently |
| Thumbnail | busy | ok | one face + one number + ≤3 words |
| Production cost (inverted) | > 3 new sets | 1–2 new sets | 0 new sets |
| Shorts potential | none | 1 clip | 3+ self-contained 30–60 s moments |
| Rewatch value | none | some | hidden details pay off on second watch |

---

## PART 6 — PER-VIDEO MASTER PROMPT TEMPLATE (fill every section)

1. **Title & logline** (≤ 60 chars title, ≤ 25-word logline).
2. **Why this idea** (uniqueness evidence summary, score table).
3. **The rule** — exactly how the mechanic works, its limits, what the meter shows, colour logic (gold/amber/red meaning).
4. **Characters** — hero + 4–6 cast from `CAST` (reuse looks; new ones need a full bible entry: silhouette, hoodie colour, hair, default face, motion personality).
5. **Act structure** (5:00): Hook 0:00–0:15 · Rules 0:15–0:50 · Fun 0:50–1:50 · Escalation 1:50–2:50 · Turn 2:50–3:40 · Twist 3:40–4:20 · Resolution 4:20–5:00.
6. **Script** — 40–55 lines, ≤ 18 words each, with `[visual]` next to every line, emphasis `*word*`, voice tags per §54.1.
7. **Shot list** — every shot: set, light preset, grade, cam size/lens/move, cast (pos, rot, expr, pose, react), meters, extras, title/tag, SFX cues.
8. **Signature shots** — one per act (overhead, dolly-zoom, silhouette, mirror/match cut…).
9. **New assets** — sets, props, meter variants, reactions; each with build estimate (S/M/L).
10. **Sound map** — ambience per set, music per act, motif plan, the planned silence before the twist.
11. **Thumbnail** — 3 variants.
12. **Shorts** — 3 cut-downs ≤ 60 s with start/end times.
13. **Risks** — what could make it read as a copy, what could confuse viewers, how we mitigate.
14. **QA** — Master prompt Part O checklist pre-filled for this video.

---

## PART 7 — 15 STARTER IDEAS (pre-research; Claude must run Step 2 before calling any of them unique)

Scores are **estimates before searching**. Novelty can only be confirmed by Step 2.

### 1. ⭐ "What if you could see how many hours you have left with everyone?"
- **Meter:** `HOURS LEFT 2,190` above each person = lifetime hours you'll still spend together.
- **Ladder:** a cashier (`0.02h`) → best friend (`3,400h`) → a crush (`11h`) → grandparent (`86h`) → a parent (`1,200h`, but it **drops** every time you skip dinner).
- **Twist:** the numbers aren't fate, they're **habits**. When the hero starts calling Grandma, her number *goes up*. The meter was never a countdown; it was a mirror.
- **Ending image:** hero and grandparent at a kitchen table; the meter ticks *up* by one.
- **Why it's strong:** devastating and hopeful, every viewer runs the math on their own parents (comment bait), and it reuses the kitchen, bedroom and hallway sets plus the meter.
- **Risk:** "death countdown" premises are common, so the twist (time *together*, and it can grow) must lead from frame 1.
- Est. score: 45/50.

### 2. ⭐ "What if every promise left a glowing thread until it was kept?"
- **Visual:** a gold thread from the promiser's wrist to the person; kept promises snap into sparkles, broken ones fray and turn grey.
- **Ladder:** "I'll text you back" → "I'll be there" → a parent's "I'll never leave" → the hero's own threads covering the room.
- **Twist:** the oldest thread on the hero's wrist leads to their younger self ("I'll be brave").
- **Fit:** threads are cheap (tube geometry); gorgeous with bloom. Est. 44/50.

### 3. ⭐ "What if your reflection lived one minute ahead of you?"
- **Visual:** mirrors, windows and puddles show what you'll do in 60 s.
- **Ladder:** spoilers for a trivia game → avoiding a spilled drink → seeing yourself say something cruel and choosing not to.
- **Twist:** one day your reflection is missing for a minute. Reuses the existing mirror tech (§32). Est. 42/50.

### 4. "What if you could see how often someone thinks about you?"
- **Meter:** `THINKING OF YOU 3×/day`. Twist: the person with the highest number is the one you ignore. Est. 40/50.

### 5. "What if luck was a currency you could spend?"
- **Meter:** `LUCK 34 ◎` coins. Ladder: green lights → a test → saving someone. Twist: you can *give* luck away, and your mom has been doing it for you for years. Est. 41/50.

### 6. "What if every word had a daily limit?"
- **Meter:** `WORDS LEFT 1,240`. Twist: the hero saves words all week for one sentence. Est. 39/50.

### 7. "What if objects remembered the last person who touched them?"
- **Badge on objects:** `LAST: DAD · 3 YRS AGO`. Twist: a jacket whose last touch is a person who's gone. Very emotional; needs prop work. Est. 40/50.

### 8. "What if gravity got weaker when you were happy?"
- **Visual:** people literally float when joyful; sad people sink into the floor. Spectacular, but floating crowds are heavy to build. Est. 38/50.

### 9. "What if you could borrow an hour from your future self?"
- **Meter:** `TIME DEBT −14h`. Twist: the future self shows up exhausted to collect. Est. 39/50.

### 10. "What if your shadow showed how you really feel?"
- **Visual:** shadows slump, cry or dance independently. Strong noir lighting showcase. Twist: the bully's shadow is curled up in a corner. Est. 41/50.

### 11. "What if every door counted the goodbyes said through it?"
- **Badge:** `GOODBYES 4,812 · LAST: "BYE MOM"`. Twist: the front door's counter vs. the hospital door. Est. 38/50.

### 12. "What if forgetting was visible?"
- **Visual:** memories drift off people as gold shards (reuses the shard effect). Twist: grandpa's are drifting fastest, so the hero catches them. Est. 40/50.

### 13. "What if you could see everyone's 'almost' moments?"
- **Visual:** ghost-paths of the things people almost did (almost said hi, almost quit). Twist: the hero sees the countless times their parent almost gave up and didn't. Est. 42/50.

### 14. "What if kindness made sound?"
- **Visual + audio:** every kind act plays a note; the city becomes music, a rude act is a wrong note. A sound-design showcase. Est. 39/50.

### 15. "What if you could see the exact moment you'd remember forever?"
- **Badge:** `THIS ONE` glows over a moment that will become a lifelong memory, usually something tiny. Est. 41/50.

---

## PART 8 — RECOMMENDATION LOGIC (how Claude chooses what to recommend)

1. Highest total among FRESH ideas.
2. Tie-break: the one whose twist **re-reads the first minute** (rewatch value).
3. Tie-break: lowest production cost (fewest new sets).
4. Never recommend an idea whose closest match has the same twist, even if it scores higher.

---

## PART 9 — FIRST UNIQUENESS CHECK (Nov 18, standard web searches, top 3 only)

| Idea | Classification | Closest existing work found | How ours differs |
|---|---|---|---|
| **2. Promise threads** | **FRESH** (no match found) | Live-action shorts about promises ("Promise", "Promises", "Promessa"); none show promises as a visible thread | A literal glowing thread per promise, snapping or fraying, plus the twist that the oldest thread leads to the hero's younger self |
| **1. Hours left with everyone** | **ADJACENT** | Tim Urban's essay *"The Tail End"* (Wait But Why), which is widely shared and says you've used ~90% of in-person parent time by the end of high school; a "see your folks" calculator site; newsletters and videos citing it | The *concept* is famous, so the video must lead with what's new: meters over **everyone's** head, a funny opening ladder, and the twist that the number **grows** with habits (it's a mirror, not a countdown). Credit the idea's lineage in the description |
| **3. Reflection one minute ahead** | **ADJACENT** | Short film *"Echo 2"*: a girl sees her reflection **ten seconds** ahead | Ours is a day-in-the-life comedy-to-drama with choices and the "missing reflection" twist, but the core gimmick is close. Only pick this with a stronger, different twist |

**Recommendation after the check:** **#2 Promise threads**. It was the only one of the three with no close match, it's visually spectacular in this engine (glowing threads + bloom), and its twist re-reads the whole video.
**Runner-up:** #1, which is the most emotional, as long as the "it can grow" twist leads from the first minute and the lineage is credited.
Ideas 4–15 have **not been searched yet**; run Part 4 on them before choosing one.
