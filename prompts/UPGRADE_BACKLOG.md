# UPGRADE BACKLOG — 120 ways to push the look further

> Companion to `MASTER_PROMPT_INSANE.md`. Each item is one concrete, buildable upgrade.
> Tags: **[S]** small (< 1 h) · **[M]** medium (half day) · **[L]** large (1+ day).
> ⭐ = biggest visible impact per hour. ✅ = done. Tick items off here when built, and update CLAUDE.md §50.

## 1. Characters — faces & eyes (1–15)
1. ✅ Iris gradient + two catch-lights.
2. ✅ Brows on every expression.
3. ✅ Cheek blush, scaled by emotion.
4. ⭐ [M] Real 3D eyes (sclera + iris dome + clearcoat cornea) instead of painted ones, for hero close-ups only.
5. [S] Catch-light position follows the actual key-light direction per shot.
6. ✅ ⭐ [M] Mouth library expansion: visemes (MBP, AA, EE, OO, FV, rest) driven by `words.json`.
7. ✅ [S] Mouth opens 1–2 frames before each word (anticipation).
8. ✅ [S] Tongue + teeth hint inside big open mouths (dark-red gradient).
9. [M] Face swaps cross-fade over 3 frames instead of popping.
10. ✅ [S] Double blinks (15% chance) and blinks forced on head turns > 20°.
11. [S] Pupils dilate +10% on surprise / love, shrink on fear.
12. [S] Freckles / beauty marks per character (seeded, painted).
13. [M] Tear system: glossy bead mesh + wet lower-lid line + streak.
14. ✅ [S] Sweat drop (cartoon) on nervous beats, with a slide-down animation.
15. [S] Sparkle eyes (star catch-lights) for the "power" moments.

## 2. Characters — body, hair, cloth (16–30)
16. ✅ Non-spherical head shape, fake SSS glow, hair sheen, fringe.
17. ✅ ⭐ [M] Hair secondary motion: tufts/ponytail lag 3–5 frames and overshoot on head turns.
18. [M] Spiky hair option (5–7 cones with rounded tips).
19. [M] Curly hair option (cluster of small spheres).
20. [S] Hood that falls back with a spring when the head snaps up.
21. [S] Drawstrings swing with the body (pendulum).
22. [M] Procedural fabric normal noise on hoodies (no more plastic cloth).
23. [S] Hoodie seams + pocket + logo patch (per character).
24. [S] Sleeve cuffs and a neck rim in a darker shade.
25. [M] Mitten hands with a thumb, posable (fist, open, point, thumbs-up).
26. [M] Squash-and-stretch on the whole body on landings, volume preserved.
27. [L] 2-bone IK for arms (reach, hold two-handed props).
28. [L] Proper walk/run cycles with no foot sliding.
29. [S] Shoe colour per character + white sole stripe.
30. [S] Accessories: backpack, headphones, wristwatch, lanyard — each with physics lag.

## 3. Acting & animation (31–45)
31. ✅ ⭐ [S] Weight shift every 2–4 s on standing characters.
32. [S] Head nod on stressed words (`*emphasis*` in the script).
33. [S] Listeners nod / glance at the speaker every 2–3 s.
34. [M] Reaction library: doubleTake, gulp, facepalm, shrug, celebrate, deflate, smugNod.
35. [S] Smear frames (×1.4 stretch for 1–2 frames) on the fastest motions.
36. [S] Eyes lead → head → body offsets on every look (2/4/8 beats).
37. [M] Crowd variation: 3 idle loops × random phase × speed 0.9–1.1.
38. [S] "Hero" crowd members doing one unique thing (wave, phone check, yawn).
39. [S] Anticipation crouch before every jump / sit / stand.
40. [M] Speed-ramp orbits (fast → slow-mo on the key beat → normal).
41. ✅ [S] Breathing rate tied to emotion (calm 0.25 Hz, anxious 0.6 Hz).
42. [S] Asymmetric arms in all idle poses (never twins).
43. [M] Line-of-action check: a debug overlay that draws the spine curve per keypose.
44. ✅ [S] Moving holds: 1–2° head drift during any hold > 12 beats.
45. [M] Character turnaround test composition (4 angles) for every new character.

## 4. Sets & props (46–62)
46. ✅ Bevelled edges on every box.
47. ✅ ⭐ [M] Bus rebuild: rounded body, wheels with wells, headlights, stop sign arm, mirrors, door.
48. [S] ±5–10% seeded albedo variation on every instanced object.
49. [S] Grime gradient: darker floor patches near walls / under furniture.
50. [S] Worn-paint lighter edges on lockers, doors, desks.
51. ✅ [M] Posters with short readable text on every wall (canvas-texture Text).
52. ✅ [S] Working wall clock whose time matches the story.
53. [S] Random small rotation (±1–3°) on props so nothing is perfectly aligned.
54. [M] Stadium set (bleachers, railing, SEC signs, floodlights, instanced crowd).
55. [M] Vending machine with emissive cans grid.
56. [M] Roulette wheel with ball on a decaying spiral.
57. [S] Dice (rounded box + pips) and coin with glint sweep.
58. [M] Floor reflections (`MeshReflectorMaterial`) in hallway & gym.
59. [S] Puddles with reflections in the street set.
60. [S] Window blinds casting striped shadows (gobo).
61. [M] Plants with leaf sway; a cat that walks through one shot.
62. [S] Storytelling payoff details (a photo on the fridge that matters later).

## 5. Lighting (63–78)
63. ✅ ⭐ [M] Volumetric spot cones on interior keys (drei `SpotLight volumetric`).
64. ⭐ [M] GodRays from windows / stadium lights.
65. [S] Kelvin-based light colours everywhere (`kelvin()` helper).
66. ✅ [S] Dedicated low-power "eye light" near camera for guaranteed catch-lights.
67. [S] Bounce light tinted by floor colour under every character.
68. [S] Coloured kicker (magenta/teal) on the shadow side, 5–10% of key.
69. [S] Fluorescent flicker with occasional dips (seeded).
70. [M] Passing car headlights sweeping across walls at night.
71. [S] Key-light colour temperature shifts with emotion (warm → cold over 1 s).
72. [M] Gobo / cookie patterns (leaves, window frames) on the key.
73. [S] Rim intensity boosted ×1.3 on hero close-ups.
74. [S] Light cone over the meter badge's target (subtle spotlight on the liar).
75. [M] Per-shot automatic face-luminance check (target 0.55–0.72).
76. [S] Switch tone mapping to AgX and re-calibrate exposure.
77. [S] Emissive practical always visible at least once per scene (light motivation).
78. [M] Shadow-camera frustum auto-fit to the visible set (crisper shadows).

## 6. Camera & composition (79–88)
79. ✅ ⭐ [S] Fix headroom in the lockers close-ups (no crop above the brows).
80. ✅ [S] Lens-package enforcement: validator rejects fov outside the 5 lenses.
81. ✅ [S] Validator rejects two consecutive shots with same lens + angle + size.
82. [S] Foreground blur element in ≥ 50% of shots.
83. [M] Rack focus driven by narrative (attention shift) with focus breathing (fov ±1.5%).
84. [S] Dutch angle (≤ 8°) only in tension beats.
85. [M] One dolly-zoom per video on the biggest shock moment.
86. [S] Camera anticipation (pull back 2% before a push-in).
87. [S] Handheld amplitude tied to tension (0.3 calm → 1.0 panic).
88. [M] Overhead top-down signature shot per act.

## 7. Post & film look (89–98)
89. ✅ ⭐ [M] Per-act LUTs generated by script (`.cube`), applied via the `LUT` effect. *(built as a soft-light split-tone per act in FilmLook; a real .cube LUT is still open)*
90. [S] Halation: red-orange glow around highlights.
91. ✅ [S] Light leaks on warm/happy shots (8–15% screen blend).
92. [S] Anamorphic streaks on bright practicals.
93. ✅ [S] Gate weave ±0.6 px (smooth noise).
94. [M] Motion blur on whips and fast props (`@remotion/motion-blur`).
95. [S] Chromatic aberration spike on every impact.
96. [S] Letterbox animates in for the most cinematic act only.
97. [S] Lens dirt texture that lights up when a bright source crosses frame.
98. [S] Grain strength per act (heavier in "consequence").

## 8. UI, graphics & typography (99–108)
99. ✅ [S] Meter colour interpolated in OKLCH (teal → gold → red) by value.
100. ✅ [S] Meter idle pulse (scale ±1.5%, glow ±10%).
101. [S] Radial pulse ring when a meter hits 0% or 100%.
102. [M] Meter glitch effect when the reading is uncertain ("?").
103. [S] Title tracking animation 0.3em → 0.14em + shimmer on emphasis words.
104. [M] Callout arrows (hand-drawn SVG paths) for explainer beats.
105. [M] BarRace / Counter components for comparison beats.
106. [S] UI parallax (2–4% opposite camera pan).
107. [S] Face exclusion zone enforced automatically (180 px).
108. [M] Chapter title cards on the void set between acts.

## 9. Sound (109–116)
109. ⭐ [S] Stereo panning of SFX from on-screen position.
110. [M] Visemes driving mouth plus synced tiny "lip smack" foley on dialogue starts.
111. [S] Pre-lap ambience 0.3–0.6 s before every scene cut.
112. [M] Recurring "power" motif re-orchestrated per act.
113. [S] Silence + suck_back before the biggest reveal.
114. [S] Foley pass: cloth rustle on every arm gesture, steps on every move.
115. [M] Stem export (vo / music / sfx) for future remixes.
116. [S] Short-term loudness check: no > 6 LU jumps between neighbouring lines.

## 10. Pipeline, QA & delivery (117–125)
117. ⭐ [M] Automated contact sheet + colour script on every draft render.
118. [S] Frozen-motion detector (≥ 1 s without motion fails).
119. [M] Headroom / crop detector (face bbox vs frame edges).
120. [M] Vertical composition (`MainVertical`) with re-framed cameras.
121. [M] Dedicated `Thumb` composition with 3 A/B variants.
122. [S] Chapter list auto-generated from beats for the YouTube description.
123. [M] GitHub Action: typecheck + 3 stills per PR.
124. [L] GPU render path (desktop or Lambda) for 60fps full-quality finals.
125. [S] Before/after still sheet generated for every visual change (`out/before_after.jpg`).

---

### Suggested order (biggest jump first)
1. Lighting: 63, 64, 67, 68, 76
2. Characters: 17, 6, 4, 22
3. Camera: 79, 82, 86
4. Sets: 47, 58, 51
5. Look: 89, 90, 91, 94
6. Sound: 109, 111, 113
7. QA: 117, 118, 119
