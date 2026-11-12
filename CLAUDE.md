# CLAUDE.md — Cinematic 3D Explainer Animation Playbook

This repo builds **cinematic, stylized 3D explainer videos**: rounded "pill-people"
characters on simple low-poly sets, with moody film lighting, shallow depth of field,
and glowing gold UI badges ("THE ODDS 33%") floating over the scene.

Claude: when asked to make a video, scene or shot, **follow this file exactly**. Every
number here is a starting default chosen to match the reference look. Tune it after
test renders, but change it only when the user asks or a shot clearly needs it. A video that ignores the lighting, depth-of-field and grading rules looks like
a cheap 3D demo, not the reference.

**Reading order:** start with **§36 (the master prompt)**, which is the standard every video must meet. Then use
§0–§35 as the toolbox, §32 for lessons from real renders, and §51 for how to keep improving.
The working demo lives in `src/` (2 shots, 60fps, with full sound).

---

## 0. TL;DR pipeline

```
script.md ──► voiceover.mp3 ──► timing.json (word timestamps)
                                     │
storyboard.json (shots) ◄────────────┘
     │
     ▼
Remotion composition  ──►  per-shot <ThreeCanvas> scenes (React Three Fiber)
     │                        + postprocessing (DOF, bloom, vignette, grain, CA)
     ▼
2D overlay layer (titles, odds badges, counters, arrows)  ──►  MP4 (1920x1080, 60fps)
```

Stack (pin these versions — do not use `latest`):

| Purpose | Package |
|---|---|
| Video framework | `remotion`, `@remotion/cli`, `@remotion/three`, `@remotion/fonts` (pin all `@remotion/*` to the **same exact 4.x version**, or Remotion refuses to run) |
| 3D | `three@0.169.0`, `@react-three/fiber@8.17.10`, `@react-three/drei@9.114.0` |
| Post FX | `@react-three/postprocessing@2.16.3`, `postprocessing@6.36.3` |
| Fonts | `@fontsource/cinzel`, `@fontsource/inter` → copied to `public/fonts/`, loaded with `@remotion/fonts` (never fetch fonts at render time) |
| Sound | `scripts/make_sfx.py` (numpy only), which generates every SFX and the music bed procedurally (§33) |
| Audio timing | `scripts/estimate_timing.py` (built in), TTS alignment data, or `whisper` on your own machine (§38.3) |

Setup:
```bash
npx create-video@latest --template=blank .   # then pin versions above
npm i three@0.169.0 @react-three/fiber@8.17.10 @react-three/drei@9.114.0 \
      @react-three/postprocessing@2.16.3 postprocessing@6.36.3 @remotion/three @remotion/fonts @fontsource/cinzel @fontsource/inter
npx remotion studio            # preview
npx remotion render Main out/video.mp4 --codec=h264 --crf=16 --gl=angle --concurrency=4
```
On headless Linux, use `--gl=swangle` if `angle` fails. Always render a 3-second test
(`--frames=0-180`, which is 3s at 60fps) before a full render.

---

## 1. Project structure (✅ = exists now, 🔲 = planned; create it when first needed)

```
CLAUDE.md                  ✅ this playbook
package.json               ✅ npm scripts: sfx, studio, still, render, master, qa, determinism, render:chunks, typecheck
remotion.config.ts         ✅ swangle GL, jpeg frames, h264 CRF 16
scripts/
  sfxlib.py                ✅ synthesis building blocks (§36.6)
  make_sfx.py              ✅ 80 sounds + music stems → public/sfx/*.wav (git-ignored, run `npm run sfx`)
  estimate_timing.py       ✅ script text → words.json (no speech recogniser needed)
  qa.sh                    ✅ cuts, contact sheet, loudness, black/frozen frames (§28)
  determinism.sh           ✅ same frame twice → identical hash
  render_chunks.sh         ✅ crash-safe chunked render + concat + master
public/
  fonts/*.woff2            ✅ Cinzel 600/700, Inter 700 (local, never fetched)
  sfx/*.wav                ✅ generated
  vo/voiceover.wav         🔲 narration (§38)
  vo/words.json            🔲 word timings [{text,start,end}] in seconds
src/
  index.ts / Root.tsx      ✅ registers Main (1920×1080, 60fps)       🔲 MainVertical (§45)
  Main.tsx                 ✅ <Series> of shots + Soundtrack + letterbox + fades
  style/tokens.ts          ✅ colors, FPS/BASE, ease(), focusFor()
  style/time.ts            ✅ useBeat(), toFrames()
  style/fonts.ts           ✅ local font loading
  style/presets.ts         ✅ kelvin(), LIGHTS (6 sets), GRADES (5 acts)
  three/Stage.tsx          ✅ ThreeCanvas + camera + Lights + PostFX + handheld()
  three/Pill.tsx           ✅ character (body, hoodie, arms, legs, hats, squash, tilt)
  three/Face.tsx           ✅ canvas-painted expressions + blink + eye look
  three/Set.tsx            ✅ Hallway, Dust                         🔲 Classroom, Bedroom, Casino, Stadium, Void (§41)
  three/props/             🔲 Coin (now inline in S02), Dice, Cards, Alarm, Vending, Roulette (§40)
  overlay/Overlays.tsx     ✅ project(), Title, Tag, OddsBadge, Letterbox
  overlay/Transitions.tsx  ✅ DipToBlack, WhipStreak, Flash
  overlay/Captions.tsx     ✅ word-highlight captions from words.json
  overlay/Grain.tsx        ✅ deterministic film grain (replaces the Noise effect)
  overlay/                 🔲 Callout (arrow), BarRace, Counter (§8.3–8.4)
  audio/Soundtrack.tsx     ✅ CUES list in beats + music/ambience beds with ducking
  shots/_TEMPLATE.tsx      ✅ boilerplate for new shots
  shots/S01_Hook.tsx       ✅ demo shot 1      shots/S02_Reveal.tsx ✅ demo shot 2
storyboard.json            🔲 optional, for long videos. Short videos hard-code shots in Main.tsx (the demo does)
out/                       git-ignored renders, stills, qa/
```
**Rule:** when you add or remove a file, update this tree in the same commit. A wrong map misleads every future session.

---

## 2. Visual style tokens (`src/style/tokens.ts`)

```ts
export const C = {
  // world
  bgDeep:    '#14101f',  // void / night background
  purple:    '#3b2d5c',  // signature wall color
  purpleLit: '#6a5a9a',
  lavender:  '#b9b0d8',  // skin/body base (slightly cool white)
  skin:      '#ece6f2',  // head sphere
  floorWood: '#8a5a3c',
  felt:      '#1f6b3a',  // casino/sports green
  red:       '#c8323a',
  // light
  keyWarm:   '#ffd9a8',
  fillCool:  '#7b6cff',
  rimBlue:   '#9fc4ff',
  // UI
  gold:      '#f2c46b',
  goldDeep:  '#b8862f',
  cream:     '#f5ead2',
  uiBg:      'rgba(20,14,28,0.78)',
};
export const FONT = {
  title: 'Cinzel',              // 600, letter-spacing 0.12em, UPPERCASE
  serif: 'Cormorant Garamond',  // 600 italic for emphasis words
  ui:    'Inter',               // 700 for numbers in badges
};
export const FPS = 60, BASE = 30;  // render at 60, AUTHOR in 30fps "beats" (see §14.9)
export const W = 1920, H = 1080;
```

Rules:
- The palette is **desaturated purple and violet** with **warm amber accents**. Every frame
  needs one warm and one cool light source. Never use pure white `#fff` or pure black.
- Character bodies are near-white lavender. Color comes from **clothing**: hoodies in
  red, teal, blue, mustard, magenta or orange.
- UI is **only gold and cream on a dark translucent pill**. Never use colorful UI.

---

## 3. The character ("Pill") — exact spec

Units are meters. The character is about 1.7 tall. Build it from primitives; no external models are needed.

| Part | Geometry | Size | Material |
|---|---|---|---|
| Head | `SphereGeometry(0.42, 64, 64)` | y = 1.42 | `meshPhysicalMaterial` color `C.skin`, roughness 0.45, clearcoat 0.3, sheen 0.4 |
| Neck | `CylinderGeometry(0.05,0.05,0.18)` | y = 1.0 | same as body |
| Torso | `CapsuleGeometry(0.22, 0.38, 8, 24)` | y = 0.72 | hoodie color, roughness 0.85 |
| Arms | `CapsuleGeometry(0.06, 0.42)` ×2 | pivot at shoulder (±0.26, 0.92) | hoodie color |
| Hands | `SphereGeometry(0.075)` | end of arm | `C.skin` |
| Legs | `CapsuleGeometry(0.055, 0.5)` ×2 | pivot at hip (±0.09, 0.42) | `C.lavender` or pants color |
| Feet | flattened sphere `scale=[1,0.6,1.5]` r=0.07 | | dark grey |

The head is **oversized** (about 0.5× the body height). That ratio is the whole charm, so keep it.

**Hoodie details:** two thin white vertical strips on the chest for drawstrings
(`BoxGeometry(0.015,0.16,0.01)` at x=±0.04). Add a hood as a half torus behind the neck.

**Face (`Face.tsx`):** draw on a 1024×512 `CanvasTexture` mapped to the front of the
head sphere. Use a second, slightly larger sphere (r=0.421) with a transparent material
and `polygonOffset`. Expressions:
- `neutral`: two black ovals 26×40px with a 10px gap, and a small curved smile.
- `smug`: half-lidded eyes (flat top arc) and a one-sided smirk. This is the hero's default.
- `happy`: closed upward arcs for eyes (^ ^) and a wide smile.
- `bored`: two horizontal lines and no mouth.
- `shock`: small dot pupils and an "o" mouth.
- `glasses`: add thick black round frames with a 10px stroke and a bridge.
Animate blinks every 3–5s (random but seeded by shot id) over 4 frames: scale eye height
to 0.1 and back.

**Accessories:** baseball cap (half sphere plus a flat brim, offset forward), beanie (half
sphere at 1.05× scale, black), bob hair (scaled sphere shell, dark brown), bun.

**Poses (`poses.ts`):** each pose is Euler rotations per joint. Interpolate between poses
with `spring({fps: 30, frame: beat, config:{damping:14, mass:0.8}})` (beats, §14.9). Always add **idle breathing**:
torso scaleY `1 + 0.012*sin(t*2)` and head bob `0.008*sin(t*2+0.6)`. A character that
stands perfectly still looks dead.

Named poses: `idle`, `cheer` (both arms up 160°), `point`, `shrug`, `armsCrossed`,
`sitDesk`, `sleep` (lying in bed), `writeBoard`, `holdSign`, `facepalm`.

Crowds: instance 20–200 Pills with `InstancedMesh` per part. Randomize hoodie color from
the palette and add a per-instance phase offset to the cheer animation.

---

## 4. Lighting — the most important section

Use `renderer.toneMapping = ACESFilmicToneMapping` with exposure 1.0, `outputColorSpace = SRGBColorSpace`,
and `shadows="soft"` (PCFSoft, map size 2048).

**Default "Cinematic Interior" rig:**
```tsx
<ambientLight intensity={0.15} color={C.fillCool} />
<hemisphereLight args={[C.fillCool, '#2a1d3a', 0.35]} />
{/* KEY: warm, from camera-left-top, casts shadow */}
<spotLight position={[-4, 6, 4]} angle={0.5} penumbra={0.9} intensity={60}
           color={C.keyWarm} castShadow shadow-bias={-0.0004} />
{/* FILL: cool purple from opposite side, weak */}
<pointLight position={[5, 2.5, 2]} intensity={8} color={C.fillCool} />
{/* RIM: behind subject, makes the head glow-edge — never skip */}
<spotLight position={[0, 4, -5]} angle={0.6} penumbra={1} intensity={40} color={C.rimBlue} />
<fog attach="fog" args={[C.bgDeep, 8, 22]} />
```

Presets:
| Preset | Key | Fill | Mood |
|---|---|---|---|
| `classroom` | cool white window light from left, strength 50 | purple | flat, pale lavender |
| `hallway` | overhead fluorescent rectAreaLights, dark lockers | teal | night tension |
| `bedroom` | warm lamp (orange 2700K) | deep blue moonlight | cozy |
| `casino` | hot amber overhead pool light on table | magenta | rich, glowing |
| `stadium` | broad white top light | blue haze, heavy fog | epic |
| `void` | single spotlight from top on subject, everything else `C.bgDeep` | none | title cards |

Add **practical lights** (lamps, screens, an alarm clock's red LED, a slot machine) as small
emissive meshes with `emissiveIntensity` 2–4 so bloom catches them.

---

## 5. Post-processing (`PostFX` in `Stage.tsx`) — non-negotiable (the full ordered chain is §36.4)

```tsx
<EffectComposer multisampling={4}>
  {/* focusDistance is NORMALIZED 0..1 of camera near..far, not meters: use
      focus = (meters - near) / (far - near) with near=0.1, far=40 → head at 3m ≈ 0.072 */}
  <DepthOfField focusDistance={focus} focalLength={0.035} bokehScale={4} />
  <Bloom intensity={0.6} luminanceThreshold={0.75} luminanceSmoothing={0.2} mipmapBlur />
  <ChromaticAberration offset={[0.0007, 0.0005]} radialModulation modulationOffset={0.3} />
  <HueSaturation saturation={-0.12} />
  <BrightnessContrast contrast={0.08} />
  <Vignette offset={0.28} darkness={0.75} />
  {/* NO <Noise/>: it reads wall-clock time, so it isn't deterministic. Grain = overlay/Grain.tsx (seeded SVG) */}
</EffectComposer>
```
- **DOF focus is driven per shot** to the subject's head distance. Backgrounds and
  foreground characters must blur heavily, which gives the "miniature or film" feel.
- Make the grain change every frame. Seed the noise with `frame` so Remotion renders stay
  deterministic.
- Add a 2.39:1 letterbox for dramatic shots: black bars of 132px top and bottom, animated in.

---

## 6. Camera language (`CameraRig.tsx`)

Use a `PerspectiveCamera` with fov 30–35. A low fov (telephoto) is key: it flattens and
looks cinematic. Never go above 45.

The camera **always moves**. Moves are driven by `interpolate(frame, ...)` with
`Easing.bezier(0.45, 0, 0.2, 1)`:
- `pushIn`: dolly 10–15% closer over the shot.
- `orbit`: 8–20° arc around the subject.
- `crane`: rise from a low angle (y=0.6) to eye level.
- `rackFocus`: animate the DOF focus from a foreground to a background subject.
- `whipPan`: fast 6-frame yaw with motion blur (render 2 sub-frames and average them).
- `handheld`: add a tiny noise drift (`±0.01m`, `±0.3°`) on top of every move.

Framing:
- Mostly **close-ups and medium shots**, with the head filling 30–60% of the frame height.
- Use low angles for "confident" characters and over-the-shoulder for reveals.
- For crowds and stadiums, use a high wide angle.
- Shot length is **2–4 seconds**. Cut on voiceover phrase boundaries. Never hold a static shot for more than 5 seconds.

---

## 7. Sets — low-poly, film-set style

- Build only what the camera sees. Use `BoxGeometry` and `RoundedBox` (drei, radius 0.02)
  so every edge catches a highlight.
- Materials are `meshStandardMaterial` with roughness 0.6–0.9 and metalness 0. Don't use image
  textures, except subtle procedural noise on floors (wood planks = alternating box strips).
- Add **contact shadows** under characters (drei `<ContactShadows opacity={0.5} blur={2.5}/>`).
- Add background depth: put at least 3 layers (foreground prop, subject, background wall)
  in every shot so the DOF has something to blur.
- Set ideas from the reference: classroom with a whiteboard, school hallway with lockers,
  bedroom with an alarm clock, casino roulette table, vending machine, hospital break room,
  stadium bleachers with railings and "SEC 308" signs.
- Signs and text inside 3D use drei `<Text>` with the Cinzel font, colored `C.cream`, on a dark
  board with a gold border, like the "CASINO NIGHT" banner.

---

## 8. Overlay graphics (2D, in Remotion, above the canvas)

### 8.1 Title (`Title.tsx`)
- Cinzel 600, UPPERCASE, `letter-spacing: 0.14em`, size 64–96px, color `C.cream`.
- Glow: `text-shadow: 0 0 18px rgba(242,196,107,.45), 0 2px 0 rgba(0,0,0,.4)`.
- Animate in **word by word**: each word fades 0→1, moves y +12→0px and blurs 6→0px over
  10 frames, staggered 4 frames apart. Emphasis words ("COULD", "NOT") use a different
  weight, size or italic serif.
- Hold it, then fade out over 8 frames while moving y −8px.

### 8.2 Odds Badge (`OddsBadge.tsx`) — the signature element
```
 ┌────────────────────────┐
 │ (◔)  THE ODDS          │   pill, height 64px, radius 999
 │      33%               │   bg C.uiBg, 1.5px border C.gold
 └────────────────────────┘   outer glow 0 0 24px rgba(242,196,107,.35)
```
- Ring: 36px SVG circle with a stroke of 4px and track `rgba(255,255,255,.15)`. The progress
  arc is gold, animated with `strokeDashoffset`.
- Label: Inter 700, 12px, tracking 0.1em, `C.cream` at 80% opacity. Value: Cinzel 700, 30px, `C.gold`.
- **The number rolls** from 0 to the value over 20 frames with ease-out, synced with the ring.
- **Anchored to 3D:** project the target's world position (`vector.project(camera)`) each
  frame and place the badge 0.6m above the head. Draw a dotted 1px gold line from the badge
  down to the object (like the basketball shot). Add a gentle float of `±4px` with a sine.
- Entry: scale 0.6→1 with spring (damping 12) and opacity 0→1. Exit: scale to 0.9 and fade out.
- Dramatic changes (for example 99% → 0%) flash the border white for 3 frames and shake ±3px.

### 8.3 Callout (`Callout.tsx`)
A handwritten curved arrow (SVG path animated with `pathLength` 0→1 over 15 frames) plus a
small Cinzel caps label, like "FLOATS ABOVE ANYTHING". Fade the secondary line to 40%.

### 8.4 BarRace (`BarRace.tsx`)
For comparisons ("YOU 1,000 vs NORMAL 256"):
- Rows of dots in a pill track. The leader row is a gold fill with glowing dots, the other row is lavender.
- Bars grow with spring and the numbers roll. The title sits above in Cinzel, with a small subtitle.

### 8.5 Subtitles / location tags
Small Cinzel caps tags at the top or bottom center ("SINCE LAST TUESDAY", "HOSPITAL"),
24–28px, cream with letter-spacing 0.2em, fading in and out over 6 frames.

---

## 9. Audio & timing

1. Write `script.md` with one line per shot.
2. Record or generate the voiceover. Place it at `public/audio/voiceover.mp3`.
3. Get word timestamps into `public/vo/words.json` ([{text,start,end}] in seconds). The options are in §38.3.
   `whisper` is **not installed** in the cloud container, so `scripts/estimate_timing.py` is the fallback.
4. Each shot in `storyboard.json`:
```json
{ "id": "S03", "set": "bedroom", "lighting": "bedroom",
  "start": 312, "duration": 96,
  "camera": { "move": "pushIn", "from": [1.8,1.4,2.6], "to": [1.4,1.35,2.0], "target": "hero.head" },
  "cast": [{ "id": "hero", "pose": "sleep", "face": "happy", "hoodie": "#3d6fd6" }],
  "overlay": [
    { "type": "tag", "text": "SINCE LAST TUESDAY", "at": 6 },
    { "type": "odds", "label": "RINGS NOW", "value": 99, "anchor": "alarm", "at": 30 }
  ],
  "sfx": ["whoosh@0", "tick@30"] }
```
5. Sound design matters as much as visuals. The full system is in §33.

---

## 10. Shot recipe (how every shot is built)

1. Pick a set and lighting preset.
2. Place 1–3 hero characters and a background crowd or props for depth.
3. Choose a camera move (never static) and set the DOF focus on the hero's head.
4. Add exactly **one** overlay idea per shot so it doesn't get cluttered.
5. Check against the QA list below.

---

## 11. QA checklist (run before every render)

- [ ] Is there one warm and one cool light, and is the rim light visible on the head edge?
- [ ] Is the background visibly blurred, with the focus on a face or object?
- [ ] Are vignette, grain and bloom on? Do emissive practicals glow?
- [ ] Is the camera moving with an eased curve and a handheld drift?
- [ ] Are the characters breathing and blinking, without frozen T-poses?
- [ ] Is the UI gold and cream only, Cinzel for titles, and the numbers rolling?
- [ ] Are badges anchored to 3D objects and staying on screen (clamped 80px from the edges)?
- [ ] Is the shot 2–4s long, with cuts on voiceover phrases?
- [ ] Are all random values seeded (`random(seed)` from Remotion)? Never use `Math.random()`.
- [ ] Is a test render of `--frames=0-90` reviewed before the full render?
- [ ] Is the polish checklist (§35.6) done too?

---

## 12. Performance tips

- Share geometries and materials across characters, and use `InstancedMesh` for crowds of more than 20.
- Use 2048 shadow maps on the key light only. Other lights don't cast shadows.
- `--concurrency` = CPU cores / 2. Render in chunks per shot if memory spikes.
- Keep each scene under about 200k triangles. Spheres with 64 segments are only for heroes; crowds use 24.

---

## 13. Don'ts

- Don't use realistic human models, photo textures or bright saturated backgrounds.
- Don't use sans-serif titles, emoji in the UI, or more than 2 overlays at once.
- Don't hold a static camera, use a wide fov above 45, or leave the image without post FX.
- Don't recreate a specific existing channel's characters, logos or exact videos. Use this
  *style*, with original characters, stories and branding.

---

## 14. Remotion + R3F rules (the things that break renders)

1. **Never animate with `useFrame` or `clock`.** Remotion renders frames out of order and in
   parallel. All motion must come from `useBeat()` (frame-derived, §14.9), i.e. `t = beat / 30` seconds.
   Use `useFrame` only to *apply* frame-derived values, never to accumulate them.
2. Use `<ThreeCanvas width={W} height={H}>` from `@remotion/three`, not R3F's `<Canvas>`.
   It bridges the Remotion context into the canvas, and it needs explicit width and height.
3. You don't need `frameloop="never"` with ThreeCanvas, but do pass `gl={{ preserveDrawingBuffer: true, antialias: false }}`
   (MSAA comes from `EffectComposer multisampling`).
4. **Load fonts and textures with `delayRender()` and `continueRender()`.** drei `<Text>` loads its font
   asynchronously. Wrap it in `<Suspense>` and block the frame until it's ready, or the first frames render without text.
5. For randomness, use `random('crowd-' + i)` from `remotion`. `Math.random()` makes every frame
   different and causes flicker.
6. The animated canvas face texture: redraw it only when the expression or blink state changes, then set
   `texture.needsUpdate = true`.
7. Put audio in `<Audio src={staticFile('audio/voiceover.mp3')} />` at the top level, and put SFX in
   `<Sequence from={f}><Audio .../></Sequence>`.
8. **Author in beats, render at any fps.** `src/style/time.ts` has `useBeat()`, which returns the frame in 30fps
   units (fractional at 60fps), and `toFrames(beats, fps)` for `<Series.Sequence>` and `<Sequence>` durations.
   Every number in this file ("10 frames", "4 frames apart") is in beats. Never write `useCurrentFrame()`
   in a shot, and never hard-code `/ 30` against real frames. Then switching 30 ↔ 60fps is a one-line change.
   Integer-only logic (blink cycles, `% n`) must `Math.floor(beat)`.
9. Each shot is its own `<Series.Sequence durationInFrames={d}>`. Inside, `useCurrentFrame()`
   restarts at 0, so write every shot relative to its own start.

---

## 15. Reference code snippets (copy, don't reinvent)

### 15.1 Eased value helper
```ts
import {interpolate, Easing} from 'remotion';
export const ease = (f: number, [a, b]: [number, number], [x, y]: [number, number]) =>
  interpolate(f, [a, b], [x, y], {
    easing: Easing.bezier(0.45, 0, 0.2, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
```

### 15.2 Camera rig (reference. The demo uses `handheld()` + per-shot `Cam` objects in `Stage.tsx`, which is the same idea)
```tsx
export const CameraRig = ({from, to, target, dur, seed = 'cam'}: Props) => {
  const frame = useCurrentFrame();
  const {camera} = useThree();
  const k = ease(frame, [0, dur], [0, 1]);
  const t = frame / 30; // frame = useBeat()
  // handheld drift: two slow sines with seeded phases
  const p1 = random(seed + 'a') * 10, p2 = random(seed + 'b') * 10;
  const drift = new Vector3(Math.sin(t * 0.7 + p1) * 0.01, Math.sin(t * 0.9 + p2) * 0.008, 0);
  camera.position.lerpVectors(new Vector3(...from), new Vector3(...to), k).add(drift);
  camera.lookAt(...target);
  camera.updateProjectionMatrix();
  return null;
};
```

### 15.3 Face texture
```ts
export function drawFace(ctx: CanvasRenderingContext2D, expr: Expr, blink: number) {
  ctx.clearRect(0, 0, 1024, 512);
  ctx.fillStyle = '#1a1424'; ctx.strokeStyle = '#1a1424'; ctx.lineCap = 'round';
  // the face sits in the middle of the equirect texture: u≈0.5 is the front (x≈512)
  const eyeY = 230, eyeH = 40 * (1 - blink * 0.9);
  for (const x of [482, 542]) {
    if (expr === 'happy') { ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, eyeY + 8, 14, Math.PI, 0); ctx.stroke(); }
    else if (expr === 'bored') { ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 14, eyeY); ctx.lineTo(x + 14, eyeY); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(x, eyeY, 13, eyeH / 2, 0, 0, Math.PI * 2); ctx.fill();
      if (expr === 'smug') { ctx.fillStyle = '#ece6f2'; ctx.fillRect(x - 16, eyeY - 22, 32, 20); ctx.fillStyle = '#1a1424'; } }
  }
  ctx.lineWidth = 6; ctx.beginPath();
  if (expr === 'shock') ctx.ellipse(512, 300, 10, 14, 0, 0, Math.PI * 2);
  else if (expr === 'smug') { ctx.moveTo(495, 292); ctx.quadraticCurveTo(520, 302, 540, 284); }
  else if (expr !== 'bored') ctx.arc(512, 280, expr === 'happy' ? 26 : 16, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}
```
The texture is mapped on a sphere and gets squashed toward the poles. Keep the features within the
center band (y 180–330) and check them in a close-up render.

### 15.4 Projecting a 3D anchor to an overlay
```tsx
// inside the canvas: write the screen position to a shared ref every frame
const v = new Vector3(); obj.getWorldPosition(v); v.y += 0.6; v.project(camera);
anchorRef.current = { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, visible: v.z < 1 };
```
It's more reliable to compute the anchor **in pure math outside the canvas**: use the same camera
`from`/`to`/`fov` values as the CameraRig and build a throwaway `PerspectiveCamera`. Then the
overlay doesn't depend on render order. Clamp the result to an 80px safe margin.

### 15.5 Rolling number
```tsx
const v = Math.round(ease(frame - start, [0, 20], [from, to]));
<span style={{fontVariantNumeric: 'tabular-nums'}}>{v.toLocaleString()}%</span>
```
Always use `tabular-nums` so the badge width doesn't jitter.

---

## 16. Transitions between shots

- Most cuts should be **hard cuts** on a voiceover beat. That's the look.
- Use a **dip to black** (6 frames down, 6 up) for chapter changes, with a title card on the `void` set.
- A **match cut** carries an object across shots (coin → coin). Keep its screen position identical.
- For a **whip transition**, the last 5 frames of shot A and the first 5 of shot B pan fast in the same direction,
  with a directional blur overlay (CSS `filter: blur()` on a stretched copy). Use it at most once per minute.
- A **zoom-through**: push the camera into a dark object (a hoodie, a door) until the screen is black, then cut.

---

## 17. Story structure that keeps people watching

1. **Hook (0–8s):** start with a striking image plus the question ("WHAT IF YOU COULD…"). No logo intro.
2. **Rule demo (8–40s):** show the power on small everyday things (alarm clock, vending machine).
   Each one gets its own badge.
3. **Escalation:** casino → sports → school → hospital. Raise the stakes each time.
4. **Twist / cost:** the power has a downside ("LIFETIME BAN", "LUCK 0%"). Change the lighting from warm to cold.
5. **Payoff + loop:** end on an image that mirrors the opening shot.

Plan a visual change **every 2–4s** and a new idea every 20–30s. Make each badge's number tell
the story (99% → 0%), because a number change is a plot beat.

---

## 18. Color grade per act

| Act | Grade |
|---|---|
| Hook / wonder | purple shadows, warm highlights, bloom 0.8 |
| Fun / montage | saturation −5% instead of −12%, brighter exposure 1.1 |
| Tension | teal-blue shadows, exposure 0.85, vignette darkness 0.9 |
| Consequence | desaturate −30%, cold key light, grain 0.06 |

Implement it as props on `<PostFX grade="tension" />`, so a whole act changes with one value.

---

## 19. Render & delivery

- Main output: 1920×1080 at **60fps** (silky camera moves and number rolls; render cost is 2×), H.264 CRF 16, AAC 320k audio, `--pixel-format=yuv420p`.
- Vertical cut (Shorts/TikTok): a separate `MainVertical` composition at 1080×1920. Reuse the shots but
  set the camera fov to 40 and move it about 15% back. Put overlays in the middle third, because UI covers the top and bottom.
- Thumbnail: render one still with `npx remotion still Main thumb.png --frame=N`. Use a hero close-up,
  a big badge, and 3 words or fewer.
- Write outputs to `out/` and keep them in `.gitignore`. Never commit MP4s.

---

## 20. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Black frames in render | WebGL is unavailable, so try `--gl=angle`, then `--gl=swangle` |
| Flicker between frames | `Math.random()` or `useFrame` accumulation. See §14 |
| Text missing on first frames | font not ready, so use `delayRender` + Suspense |
| Everything blurry | DOF `focusDistance` given in meters. It must be normalized (§5) |
| Faces look stretched | features too far from the texture center band (§15.3) |
| Shadow acne / stripes | lower `shadow-bias` to −0.0005, add `shadow-normalBias={0.02}` |
| Looks flat and "CG" | rim light missing, fog off, or post FX disabled. Re-run the §11 checklist |
| Render too slow | lower `multisampling` to 2 while drafting, `--scale=0.5` for previews |

---

## 21. Character acting (this is what makes it feel alive)

Apply the classic animation principles to every move. A pose change without them looks robotic.

| Principle | How to implement |
|---|---|
| **Anticipation** | Before any big move, go 10–15% the *opposite* way for 4–6 frames (crouch before a jump, pull the arm back before pointing). |
| **Overshoot + settle** | `spring({damping: 10–14})` instead of linear. The arm passes the target by about 8° and settles. |
| **Squash & stretch** | Head: on landing or a surprise, scale `[1.08, 0.92, 1.08]` for 3 frames, then spring back. Keep the volume constant: x·y·z ≈ 1. |
| **Follow-through** | Hood, cap brim, hair bun and drawstrings lag the body by 2–3 frames. Run a damped spring on the parent's rotation delta. |
| **Offset timing** | Never move all joints on the same frame. Order: hips → torso (+2f) → head (+4f) → arms (+3f) → hands (+5f). |
| **Arcs** | Hands move on curves. Add a sine bump perpendicular to the path, never a straight lerp. |
| **Moving holds** | During a "hold", keep breathing, add a 1–2° head drift, and blink. Nothing is ever 100% still. |
| **Eye darts** | Every 1–2s, pupils jump 3–6px to a new point over 2 frames (saccade), sometimes toward the camera. |
| **Look-at** | Heads turn toward whoever is speaking or the active object. Head leads, body follows 20% of the angle 6 frames later. |
| **Head tilt** | Use 5–10° roll for curiosity or smugness. It's the single most expressive cheap move. |

**Talking:** the speaking character's mouth opens with the voiceover amplitude.
Use `visualizeAudio()` from `@remotion/media-utils`, take the low bands, smooth over 3 frames, and
map 0..1 to mouth height 4..22px. Add a small head nod (±2°) on stressed words from `timing.json`.

**Reactions library:** `doubleTake` (look, look away, snap back with a squash), `gulp` (neck
squash plus a sweat drop), `celebrate` (anticipation crouch → jump 0.3m → arms up → land squash),
`deflate` (shoulders drop 6 frames, head down 15°), `smugNod` (half-lid eyes plus a slow 1-nod).

---

## 22. Atmosphere & lighting extras (the "insane" polish)

- **Dust motes:** drei `<Sparkles count={80} scale={[6,3,6]} size={1.5} speed={0} opacity={0.35} color={C.keyWarm}/>`.
  Drive their offset yourself from `frame` (speed 0 plus a manual offset) to stay deterministic. Place them in the key light beam.
- **Volumetric light shafts:** drei `<SpotLight volumetric distance={8} angle={0.35} attenuation={6} anglePower={4} opacity={0.25}/>`
  for windows, stadium lights and casino lamps. Combined with fog, this is the most "cinematic" single upgrade.
- **Fake reflections:** drei `<Environment resolution={256}>` containing `<Lightformer>` rectangles
  (warm softbox left, cool strip right). Nothing gets downloaded, and the clearcoat on heads gets beautiful specular highlights.
- **Floor reflections** in casino and hallway sets: `<MeshReflectorMaterial blur={[300,100]} mixStrength={0.6} roughness={0.8}/>`.
- **God-ray rim:** put a bright emissive card just behind a character's head, out of frame. Bloom
  turns it into a halo. Use it for hero "reveal" moments.
- **Light change as emotion:** animate the key light's color temperature during a shot (warm → cold over
  1s) when the mood flips. The audience feels it before they notice it.
- **Practical flicker:** fluorescent lights at 0.97–1.0 intensity on a seeded noise curve, with an occasional dip to 0.6.

---

## 23. Lens & film emulation

Add these in a `FilmLook` layer: CSS/SVG over the final frame, or shader passes.
- **Light leaks:** a large blurred orange/magenta radial gradient drifting slowly across a corner, at
  screen blend mode and 8–15% opacity. Use them on warm or happy shots only.
- **Anamorphic streak:** a horizontal stretch of bloom on bright practicals. Postprocessing's `Bloom`
  has no streak, so add a second bloom pass on a 1×8-scaled copy, or draw 1px blurred horizontal
  lines through bright UI and LEDs at 20% opacity.
- **Gate weave:** a ±0.6px seeded subpixel jitter of the whole frame. It's subtle but feels like film.
- **Halation:** a red-tinted blur of the highlights added back at 10%. It gives the bright edges a warm glow.
- **Motion blur:** for fast moves (whips, thrown coins, jumps), render with
  `<CameraMotionBlur>` from `@remotion/motion-blur` (5–8 samples, shutterAngle 180). Never use it on slow shots,
  because it costs N× render time.
- **Focus breathing:** during a rack focus, change the fov by 1–2% too, the way real lenses do.

---

## 24. Props & physics (precomputed, deterministic)

- Thrown objects (coins, dice, cards, chips, papers): **simulate once offline** with `cannon-es` in a
  Node script, save positions and rotations per frame to `public/sim/<name>.json`, and play them back by frame.
  Never run live physics in Remotion.
- Coin flip: 2.5 rotations per 10 frames with a parabolic arc. Add a gold glint (an emissive spike) when the face
  points at the key light, and motion blur on.
- A paper pile explosion (like the card table shot): 60 instanced planes with a small bend (vertex
  displacement) and staggered launch frames.
- Hero objects get a **glint sweep**: a thin bright gradient that crosses the object once when it's introduced.

---

## 25. Kinetic typography & UI motion upgrades

- Titles: tracking animates from 0.3em to 0.14em while fading in, which reads as a "cinematic title".
- **Mask reveals:** text rises out of an invisible line (`overflow: hidden` on its container), with words 3 frames apart.
- Emphasis word: a gold gradient fill with a slow shimmer (an animated `background-position`, `background-clip: text`).
- The badge **ticks** on value change. For each change, scale it 1 → 1.06 → 1, add a one-frame white border
  flash, and play the SFX "tick". When the value hits 100% or 0%, add a radial pulse ring that expands and fades.
- Bars and counters: numbers count with an *ease-out-expo* so they start fast and slow down at the end. The final digit
  lands with a small bounce.
- UI depth: overlays get a slight parallax with the camera (move 2–4% opposite the camera pan), so
  they feel like they live in the scene.
- Never let UI cover a face. Keep a "face exclusion zone", using the projected head anchor with a radius of 180px.

---

## 26. Shot list library (ready-made recipes)

| Name | Set / light | Camera | Acting | Overlay |
|---|---|---|---|---|
| `heroIntro` | void, top spot | low crane up to eye level, 4s | smug head tilt, blink | title word-by-word |
| `powerReveal` | any, god-ray rim | slow push-in on face, fov 30→28 | eyes widen (squash) | badge pops above head |
| `everydayOdds` | bedroom/vending | orbit 15° | glance at object | badge on object + dotted line |
| `crowdCheer` | casino/stadium | high wide → push | instanced cheer with offsets | 3–5 small badges on random heads |
| `numberDrop` | hallway, tension grade | locked-off + handheld | deflate reaction | badge 99%→0% with shake |
| `comparison` | void | static + slow drift | none | BarRace "YOU vs NORMAL" |
| `consequence` | cold light, desat grade | slow pull-back reveal | alone in frame | sign "BANNED" in 3D + tag |
| `whiteboardBeat` | classroom | over-the-shoulder | writeBoard pose | big serif word on board |

---

## 27. Final "insane" pass (do this before the final render)

1. Watch it muted. Does every 2–4s have a visual change? If not, add a camera move, acting or a badge.
2. Watch it with audio only. Does every badge, cut and impact have an SFX?
3. Scrub frame by frame through each cut. Look for flicker, popping and badges jumping.
4. Pause on 10 random frames. Each one should work as a wallpaper (composition, focus, light).
5. Check that a face reads at phone size (render at 25% and look).
6. Compare side by side against a reference frame and adjust exposure, saturation and grain to match.

---

## 28. Automated checks (let the computer catch what eyes miss)

Put these scripts in `scripts/` and run them after every full render.
- **Flicker detector:** `ffmpeg -i out/video.mp4 -vf "select='gt(scene,0.02)',metadata=print" -an -f null -`
  lists frames with sudden change. Any hit that is *not* a planned cut (check against `storyboard.json`
  start frames) is a bug.
- **Reference match:** extract the same-mood frame from your render and from the reference. Compare the mean
  luminance, saturation and average hue with `ffprobe -f lavfi "movie=x.png,signalstats"`. Aim to be within 10%.
- **Contact sheet:** `ffmpeg -i out/video.mp4 -vf "fps=1/3,scale=480:-1,tile=4x4" out/sheet%02d.jpg`.
  Review the sheets for variety. No two neighbouring tiles should share the same angle *and* set.
- **Loudness:** `ffmpeg -i out/video.mp4 -af loudnorm=print_format=summary -f null -` should land at
  about −14 LUFS integrated, with true peak ≤ −1 dB.

---

## 29. Variety rules (avoid the "same shot again" feeling)

- Alternate shot sizes: never two close-ups or two wides in a row.
- Change at least two of these each cut: camera angle, set, lighting preset, or subject.
- Each act gets one **signature shot** that is used only once (overhead top-down, extreme
  macro on an object, a silhouette against a bright doorway, a dolly-zoom on a shock moment).
- Give every named character a distinct **silhouette** (cap, bun, glasses, beanie) and a
  hoodie color. Keep both consistent all video long.
- Keep a color script: one representative frame per shot in a strip. The strip should show
  a deliberate warm → cold → warm journey.

---

## 30. Build order for a new video

1. `tokens.ts`, `Stage`, `Lighting`, `PostFX`: render one empty lit set and check it against §11.
2. `Pill` + `Face` + `poses`: render a turntable of one character and check its acting against §21.
3. `OddsBadge` + `Title`: render the overlay-only test.
4. The `heroIntro` + `powerReveal` recipes: compare them to the reference and tune the numbers in this file.
5. Script → voiceover → `timing.json` → `storyboard.json`.
6. Build shots act by act, render each act, and run the §28 checks.
7. Do the final pass (§27), then the vertical cut and thumbnail (§19).

---

## 31. (moved to the end, see §51)

---

## 32. Lessons from the first real render (demo in `src/`)

- **Fonts must be local.** The render browser can't reach Google Fonts here, and `@remotion/google-fonts`
  times out. Fonts live in `public/fonts/*.woff2` and load via `@remotion/fonts` (`src/style/fonts.ts`).
- **Browser in this cloud container:** pass
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
  `remotion.config.ts` sets the `swangle` GL renderer.
- **Speed:** without a GPU, it takes about 4s per 1080p frame. 10s of video takes about 20 min at 30fps and about 40 min at 60fps with
  `--concurrency=2` (4 got killed for running out of memory).
  Draft with `--scale=0.5`, and do final renders on a machine with a GPU.
- **Emissive and glint values must stay small.** A coin with emissive 3 and a point light of 4 blew out the whole frame.
  Hero props work at emissive 0.1–1.0 because bloom does the rest.
- **`postprocessing`'s `Noise` is non-deterministic.** Its shader uses accumulated wall-clock `time`. `npm run determinism`
  caught it (two renders of frame 300 differed, PSNR 61dB). It was replaced with `overlay/Grain.tsx` (SVG turbulence,
  `seed = frame`). **Audit any new effect for `time` uniforms** before using it.
- **Default still timeout is 30s.** On a busy CPU, stills of heavy scenes time out, so always pass `--timeout=120000`.
- **§36.3 stack verified in the demo:** SoftShadows (PCSS), N8AO, ContactShadows, Environment with Lightformers,
  bounce and kicker lights all render under swangle. **Gotcha:** the Environment makes gold metal
  much brighter, so set `envMapIntensity` to about 0.35 on metalness ≥0.8 props, or they blow out. Keep the kicker light away from hero props.
- **Workflow scripts:** `npm run sfx` → `npm run still` (look-dev) → `npm run render` → `npm run master`.
- **Close camera distance:** for a medium close-up at fov 30, keep the camera about 3.1–3.6m from the hero.
  At 2.1m the head fills the frame and the badge gets clamped off-screen.


---

## 33. Sound design system (half of "polished" is audio)

All sounds are **generated** by `scripts/make_sfx.py` using numpy only, with fixed seeds, so they're identical every run
and have no licensing issues. Re-run it after changing any recipe. The output is `public/sfx/*.wav` (48kHz/16-bit stereo).

### 33.1 The kit

| File | Recipe | Use it for |
|---|---|---|
| `whoosh` | white noise → band-pass sweeping 300→3500→300Hz, sin² envelope, short reverb | every cut and fast camera move. Start it **14 beats before** the cut so the peak lands on the cut |
| `word` | 180Hz sine with a slight pitch drop + airy noise, 22/s decay | each title word. Pitch it up across a line (`rate` 1.00, 1.06, 1.12…) |
| `chime` | two inharmonic bells (E6 + B6, partials 1/2.76/5.4/8.9) | badge pop, emphasis word (rate 0.75 = darker) |
| `tick` | 2.4kHz sine blip + noise click, 80ms | each rolling-number step. Space ticks out as the number slows (ease-out) |
| `riser` | saw sweep 120Hz × 2^(3.5·t) + noise sweep, t^2.2 swell, 2s | tension before every reveal. It **ends exactly on** the hit |
| `impact` | 38Hz sub with pitch drop + low thump + noise transient + long tail | big beats (99%, BANNED, 0%) |
| `sparkle` | 5-bell arpeggio (C6 E6 G6 C7 E7), 45ms apart, big reverb | magical/positive reveals, on top of `impact` |
| `coin` | random high metallic pings (3.8–5.2kHz) | continuous spinning or glinting objects |
| `music` | detuned-saw pad Am→F→C→G at 72bpm, slow LFO lowpass, heartbeat kick every 2 beats, 3.5s reverb | the bed under everything |
| `room` | quiet low-passed noise | room tone. Silence sounds broken, so this is always on at about 0.25 |

### 33.2 Mixing rules
- Keep **one cue list** (`src/audio/Soundtrack.tsx` → `CUES`) in beats, next to the shot constants
  (`CUT`, `FLIP`) that the visuals also use. Visual and sound share the same numbers, so they can't drift apart.
- Volume ladder: impact 0.9 > whoosh 0.7 > sparkle/chime 0.55–0.6 > music 0.45 > riser 0.55 (it swells) > word/tick 0.3–0.45 > room 0.25.
- **Duck the music** to about 0.18 during the riser, so the pause before the hit feels like
  held breath. Then swell it to 0.6 on the hit. With a voiceover, keep music at 0.12–0.18 under speech.
- **Every visual accent has a sound:** a badge pop, a number change, a cut, a head snap, a squash or a light change.
  If something moves fast and is silent, it feels cheap.
- **Silence is an instrument:** cut ALL audio for 4–8 beats right before the biggest reveal of the video.
- Vary repeated SFX. Never play the same file twice with identical `rate`/`vol`. Nudge `rate` ±3–8%.
- Stereo: when something enters from the left, pan its whoosh left. Use `<Audio>` per side, or pre-render panned variants.
- Final loudness is about −14 LUFS integrated with a true peak ≤ −1 dB (check with the §28 loudnorm command).
- At 60fps, `<Sequence from>` takes real frames, so always convert with `toFrames(beat, fps)`.

### 33.3 Adding a new sound
Write it as a function in `make_sfx.py` from the building blocks: `bell`, `bandpass` (time-varying),
`lowpass`, `reverb`, `env` and `stereo`. Name it by its *role* (`pop_small`, `fail_buzz`), not by its timbre.
Normalize it with `save()` and set loudness in the mix, not in the file.

Ideas worth building next: `fail_buzz` (two detuned square waves, 110Hz), `pop_small` (sine
520→900Hz, 60ms), `crowd_cheer` (dense band-passed noise with an amplitude-modulated "voices" layer),
`heartbeat` (two low kicks 0.25s apart), `tape_stop` (the music playback rate ramps 1→0 over 0.6s, for "everything stops"
moments), and `stinger` (a short brass-like saw chord for chapter titles).

---

## 34. 60fps motion — what changes

- Remotion renders 60 real frames per second. Author in beats (§14.9) and nothing else changes.
- 60fps exposes **jitter** that 30fps hides. Handheld drift must use smooth sines (not per-frame random),
  and the projected badge positions are continuous (pure-math projection, §15.4).
- Rolling numbers look buttery at 60. Round only at display time, never inside the animation curve.
- The noise/grain pattern should change every *real* frame (fine). Gate weave uses smooth noise, not random jumps.
- Cost: 2× frames means 2× render time. Draft at 30fps (`FPS=30` in tokens) and render the final at 60.

---

## 35. Advanced animation polish (the gap between "good" and "insane")

### 35.1 Easing vocabulary — use the right curve for each motion
| Motion | Curve |
|---|---|
| camera moves | `bezier(0.45,0,0.2,1)` (slow in, slow out). Never linear |
| UI entering | spring damping 11–13 (slight overshoot) |
| UI leaving | `Easing.in(Easing.cubic)`, 30% faster than the entry |
| numbers counting | `Easing.out(Easing.exp)` |
| characters reacting | anticipation → spring damping 8–10 → settle |
| heavy things landing | `Easing.in(Easing.quad)` fall + squash + a tiny bounce (10% of the height) |
| light/color shifts | `bezier(0.4,0,0.6,1)` over 20–40 beats |

### 35.2 Impact frames (for every big beat)
On the hit beat, stack these together:
1. **Camera shake:** an amplitude of 0.03m and 0.6° that decays as `e^(−8t)` over 15 beats, with 2 sines at different frequencies.
2. **Flash:** a full-frame white/gold overlay at 0.25 opacity for 2 beats, then a fast fade.
3. **Push:** the camera fov drops 1.5° in 3 beats, then slowly returns. It reads as a "punch-in".
4. **Bloom spike:** intensity +0.4 for 6 beats.
5. **Chromatic aberration spike:** ×3 for 4 beats.
6. Sound: `impact` + a role-specific layer (`sparkle` for good, `fail_buzz` for bad).

### 35.3 Camera choreography
- **Anticipate camera reveals too:** pull back 2% for 6 beats, then push in.
- Use **speed ramps** for a dramatic orbit: fast → slow-motion at the key moment (time remap the shot's
  beat with `interpolate(beat, [0,40,60,100], [0,40,50,90])`) → normal.
- **Cut on action:** cut in the middle of a movement (a head turn, an arm raise). Shot B starts mid-motion too.
- **Match eyelines:** if A looks right, B is framed so the thing they look at is on the right.
- Hold one **"breath" shot** (static plus slow drift, about 3s) after every big reveal so it lands.

### 35.4 Secondary life in the world
- Background characters: idle sway with random phases, occasional head turns toward the hero (every 3–5s),
  and blinks. Never fully static.
- Environment: fluorescent flicker, dust, a fan rotating or a clock ticking. There should be **always something moving** in every layer.
- Props react to the hero: a coin bobs harder when the badge changes, and papers flutter after a whoosh.

### 35.5 Sync: visual accents land on audio
- Put music downbeats (72bpm → one every 25 beats at 30fps) in the timing sheet and cut on downbeats.
- Pop badges on beats, never between them.
- Speech emphasis words get the title emphasis styling *and* a `chime`.

### 35.6 Polish checklist (add to §11)
- [ ] Every fast or visible change has a sound (§33.2), and the music ducks before hits
- [ ] At least one impact frame stack (§35.2) per 20s
- [ ] Camera anticipation before reveals, and cuts happen on action
- [ ] Background characters and the environment always have motion
- [ ] There's one silent moment before the biggest reveal
- [ ] Rendered at 60fps with no jitter in projected UI

---

## 36. MASTER PROMPT — the "out of this world" production standard

> **Claude, read this whole section before touching any shot.** It is the director, the cinematographer,
> the lighting artist, the animator, the sound designer and the editor speaking at once. Everything
> above is the toolbox. This section is the standard every frame and every sound must meet. If a rule here
> conflicts with an earlier section, **this section wins**. If the user's request conflicts with this section,
> **the user wins**. Say which rule you're breaking and why.

### 36.0 The prime directive
Every frame should be good enough to be a wallpaper, every second should have something moving and something
audible, and every moment should serve the story beat. "Fine" is a failure. Don't ship a shot you wouldn't pause on.

### 36.1 Production phases (never skip, never reorder)

| # | Phase | Output file | Gate (must be true before moving on) |
|---|---|---|---|
| 1 | **Brief** | `brief.md` | the logline, the audience, the length, the 3 emotional beats, the ending image |
| 2 | **Script** | `script.md` | read it aloud: 150–165 words/min, every line has a visual idea |
| 3 | **Beat sheet** | `beats.json` | each beat has an emotion (wonder, fun, tension, loss, triumph) and a grade preset (§18) |
| 4 | **Shot list** | `storyboard.json` | every shot has a set, lighting, camera move, acting, overlay, and **SFX cues** |
| 5 | **Color script** | `out/colorscript.png` | one key frame per shot in a strip, showing a deliberate warm/cold journey |
| 6 | **Sound map** | `src/audio/Soundtrack.tsx` cues | every visual accent has a cue (§36.6), and the music sections are mapped to beats |
| 7 | **Blocking** | draft render (30fps, `--scale=0.5`) | the timing reads with *no* polish. If it's boring now, polish won't save it |
| 8 | **Animation pass** | draft render | all §21 principles applied, nothing frozen, eyes alive |
| 9 | **Lighting/look pass** | stills of every shot | each still passes §36.3 |
| 10 | **Sound pass** | audio-only render (`--codec=wav`) | listen with eyes closed: does the story still come through? |
| 11 | **QA** | §11 + §27 + §28 + §35.6 + §36.10 | all boxes ticked |
| 12 | **Final** | 60fps master + vertical cut + thumbnail | export specs §19 |

At each gate, Claude shows the user the artifact (still, contact sheet or draft) **before** spending render time on the next phase.

### 36.2 Cinematography standard

**Lens package** (with fixed fov values, so the look stays consistent):
| Lens | fov | Use |
|---|---|---|
| 24mm-equivalent | 45 | establishing wides, crowds, stadiums (maximum, never wider) |
| 35mm | 38 | medium shots, two-shots, walking |
| 50mm | 30–32 | the default storytelling lens |
| 85mm | 20–24 | close-ups and reactions. Background melts |
| 135mm | 14–16 | extreme close-ups (eyes, a badge on an object, the coin), compressing heroes against the background |

**Composition rules:**
- Put eyes on the upper third line. Give the hero look room (space in the direction they face).
- Use depth layers in every shot: a foreground element (blurred), the subject (sharp), the midground, and the background
  (blurred and darker). §36.3's fog and DOF must separate them.
- Frame within frames: doorways, locker gaps and railings frame the subject.
- Silhouette test: if you fill the frame black, the subject's pose still reads.
- Keep the horizon level unless it's a deliberate dutch angle (≤8°, only for unease).
- Mind the 180° line: never cross it within a scene unless the camera visibly moves across it.

**Movement grammar:** every shot has *one* primary move and *one* secondary layer (handheld drift, a focus shift, or a light change).
Shot entry and exit speeds must match the cut: a slow-ending shot cuts to a slow-starting one, unless you're
deliberately whip-cutting.

### 36.3 Lighting & shadow standard (the "insane" look)

**Renderer settings (Stage):**
- Tone mapping: AgX (`AgXToneMapping`, three ≥0.160) or ACES. Pick one for the whole video. AgX has
  the more filmic highlights. Exposure goes in the grade presets, never per-light hacks.
- Shadows: `shadows="soft"` plus drei `<SoftShadows size={18} samples={12} focus={0.6} />` (PCSS:
  contact-hardening shadows that are sharp near the feet and soft further away). Only 1–2 lights cast shadows. The key light
  shadow map is 2048 (4096 for the hero close-up), `shadow-normalBias 0.02`, and the shadow camera is tightly
  fitted to the visible set (a tight frustum gives crisp shadows).
- **Ambient occlusion:** `<N8AO aoRadius={0.6} distanceFalloff={1} intensity={2.2} color="#1a1030" />`
  from `@react-three/postprocessing`. Tint the occlusion purple, never black. It's essential where heads meet necks,
  feet meet floor, and in locker seams.
- Contact shadows under every character and prop on the floor (drei `<ContactShadows>`, opacity 0.45, blur
  2.5, far 1.2). They're even more important than real shadows for grounding.
- Never use `AccumulativeShadows` or anything that accumulates over frames, because it isn't deterministic in Remotion.

**Light design per shot:** write it like a gaffer would.
```json
"lighting": {
  "key":   {"type": "spot", "from": "camera-left-high", "kelvin": 3200, "power": 70, "softness": 0.9},
  "fill":  {"type": "point", "from": "camera-right", "kelvin": 9000, "ratio": "1:4"},
  "rim":   {"type": "spot", "from": "behind-right-high", "kelvin": 8000, "power": 55},
  "kick":  {"type": "rectArea", "from": "behind-left", "color": "#ff7ad9", "power": 6},
  "practicals": ["fluorescent x3 flicker", "exit sign red"],
  "atmos": {"fog": [6, 18], "volumetric": "key", "dust": 90}
}
```
- **Key-to-fill ratio** sets the mood: 1:2 is happy and open, 1:4 is the cinematic default, 1:8 is tension, and 1:16 is noir or consequence.
- **Kelvin palette:** use a helper `kelvin(k) → hex`. Warm keys are 2700–3500K, cool fills 7000–10000K, moonlight 12000K tinted
  violet.
- **Every hero has three lights on the head:** a key highlight (top-left), a rim edge (back) and an eye catch-light (the
  painted dot plus a tiny specular from the key). A head without a rim light is a failed shot.
- **Kickers and accents:** add a colored kicker (magenta, teal) on the shadow side for richness. It should be subtle, 5–10% of the key.
- **Bounce light:** a low-intensity point light near the floor tinted with the floor color (warm wood → orange
  bounce up onto the chin). It's cheap, and it's what makes CG look real.
- **Light motivation:** every light should have a believable source (a window, a lamp, a screen, the sky). Show the source
  in frame at least once per scene.
- **Volumetrics:** drei `<SpotLight volumetric>` cones on the key in interior scenes, at opacity 0.15–0.3,
  plus `GodRays` from `@react-three/postprocessing` (sun = an emissive mesh, samples 40, density 0.9,
  decay 0.94, weight 0.4) for windows and stadium lights. They need fog to read.
- **Animated light** (at least one per scene): flicker, a slow cloud-like intensity drift (±8% over 4s), screens
  pulsing, a passing car's light sweeping a wall, or a light that changes with the emotion (§22).
- **Darkness is a color:** blacks are never pure. Lift them with fog color (`#14101f`). Crush only on purpose.

**Materials standard:**
| Surface | Settings |
|---|---|
| Character skin | physical, roughness 0.42, clearcoat 0.35, sheen 0.4 (velvet-plastic toy look) |
| Cloth/hoodie | standard, roughness 0.88, plus subtle normal noise (procedural) so it isn't plastic |
| Wood floor | roughness 0.55 with plank seams and a ±8% per-plank color variation (seeded) |
| Painted wall | roughness 0.9, a slight vertical gradient (darker at the bottom), and a baseboard |
| Metal lockers | metalness 0.25–0.4, roughness 0.45, edge highlights via RoundedBox |
| Gold UI/props | metalness 0.9, roughness 0.25, small emissive (0.1–1), and an env map for reflections |
| Glass/screens | transmission 0.9 or emissive content, with a reflection from an Environment Lightformer |
| Felt (casino) | roughness 1, sheen 1, sheenColor lighter green |

- **Environment for reflections:** `<Environment resolution={256} frames={1}>` with 3 Lightformers (a warm
  softbox, a cool strip and a dim top). Use it on every scene so metals and clearcoat have something to reflect.
- **Color variation:** nothing in a set is a single flat color. Vary albedo ±5–10% per instance with seeded random.
- **Wear and detail:** a scuffed floor (darker patches under the lockers), posters on walls (simple text/colour cards), and
  a clock. Aim for 3–5 storytelling details per set, all low-poly.

### 36.4 Post-processing chain (in this exact order)
1. `N8AO` (ambient occlusion)
2. `DepthOfField` (per-shot focus, normalized §5)
3. `GodRays` (only scenes with a sun/window source)
4. `Bloom` (mipmapBlur, threshold 0.72, intensity per grade 0.5–0.9)
5. `ChromaticAberration` (radial, 0.0006–0.001, spiked on impacts)
6. `HueSaturation` + `BrightnessContrast` (grade preset)
7. `LUT` (optional: a 3D `.cube` LUT per act, generated by a script, never downloaded)
8. `Vignette` (offset 0.28, darkness 0.7–0.9 by grade)
9. Grain: **not** the `Noise` effect (non-deterministic). Use `<Grain opacity={0.04–0.06} />` from `overlay/Grain.tsx`, seeded by frame
Then the 2D film layer: halation, light leaks, gate weave, letterbox (§23).
Render a **"look-dev" still** (one frame per set, with the full chain) and compare it with a reference still before animating.

### 36.5 Animation standard (beyond §21)
- **Timing chart per action:** write keyposes and breakdowns with beat numbers in the shot file as a
  comment before coding. Example: `// 0 idle | 6 anticipation | 10 hit pose | 14 overshoot | 22 settle`.
- **Pose quality:** asymmetry always (one shoulder higher, weight on one leg, head tilted). Twinning (left = right) is
  forbidden except for comic effect.
- **Line of action:** every key pose has a clear C or S curve through spine and head.
- **Weight:** heavy things move slowly and settle long, light things snap. Show weight shifts before steps.
- **Overlapping action:** a minimum of 2 parts lagging on any big move (hood, cap brim, drawstrings, the arm that isn't leading).
- **Eyes lead everything:** eyes move first (2 beats) → head (4 beats) → body (8 beats). Blink on big head turns.
- **Acting beats per shot:** at least one *thought change* per shot that's visible in the face (neutral → realise → smug).
- **Lip flap:** speaking characters' mouths follow voiceover amplitude (§21). Non-speakers react (nods, glances).
- **Walk cycles:** 16 beats per cycle at a normal pace, with pelvis bob ×2 per cycle, opposite arm swing, and a head-bob counter.
- **Crowds:** 3 animation variations × random phase × random speed (0.9–1.1) × occasional "hero" crowd
  members who do something unique (a wave, a phone check).
- **Cartoon physics accents:** 1–2 frames of smear (stretch the mesh ×1.4 along the motion vector) on the
  fastest arm swings and head snaps.
- **Never** do linear interpolation on anything visible, never leave a pose frozen longer than 12 beats, and never move all
  characters in sync.

### 36.6 Sound design standard — the "every frame is heard" doctrine

**Layers (each must exist across the whole video):**
| Layer | Content | Level |
|---|---|---|
| L1 Room tone | per-set ambience: hallway hum + distant chatter, a casino murmur + slot jingles, stadium crowd wash, a bedroom clock tick + night air | always on, 0.15–0.3 |
| L2 Music | a score that changes with the acts (§36.7) | 0.35–0.5, ducked under VO to 0.12–0.18 |
| L3 Foley | footsteps, cloth rustle on arm moves, chair creak, paper shuffle, coin clinks, a locker slam | synced to the animation, 0.3–0.6 |
| L4 Hard SFX | impacts, whooshes, risers, UI sounds | 0.4–0.9 |
| L5 Voice | voiceover plus character vocalisations (hmm, gasp, cheer) | the loudest, −16 to −14 LUFS |

**The complete SFX library.** ✅ **All 80 are built** in `scripts/make_sfx.py`, with building blocks in `scripts/sfxlib.py`.
Generate them with `npm run sfx` (about 2 min). The WAVs are git-ignored, so regenerate them after cloning. Audition one with `python3 scripts/make_sfx.py <name>`:

*Transitions:* `whoosh` (built) · `whoosh_short` (0.35s, higher band) · `whoosh_heavy` (low band 120–900Hz + sub)
· `swish_ui` (very short high noise sweep) · `whip` (very fast sweep + click) · `reverse_cymbal` (noise + metallic
partials, reversed, swelling into the cut) · `tape_stop` (music rate 1→0 in 0.6s) · `glitch` (sample-and-hold
bit-crushed noise bursts, 3×40ms) · `zoom_in` (rising sine + noise, 0.5s) · `zoom_out` (falling).

*UI / graphics:* `tick` (built) · `tick_soft` · `pop_small` (sine 520→900Hz 60ms) · `pop_big` (sine 300→700Hz +
noise, 120ms) · `chime` (built) · `chime_low` · `sparkle` (built) · `shimmer_loop` (granular high bells) ·
`counter_roll` (accelerating ticks, generated per count) · `bar_fill` (rising filtered saw while a bar grows) ·
`type_key` ×5 variants (for typed text) · `stamp` (low thump + paper slap for BANNED stamps) · `success`
(major-third bell pair) · `fail_buzz` (two detuned squares at 110Hz, 0.4s) · `error_blip` · `notification`
(two-tone glass ping) · `slide_in` (soft airy swish + click on arrival) · `lock_click`.

*Impacts & tension:* `impact` (built) · `impact_light` · `boom_sub` (30Hz sine drop, 3s tail) · `hit_metal`
(inharmonic metal partials + noise) · `riser` (built) · `riser_short` (1s) · `riser_shepard` (endless
rising Shepard tones, for long tension) · `drone_low` (two detuned 55Hz saws, slow filter) · `heartbeat` ·
`clock_tick` (accelerating for countdowns) · `stinger_good` (bright major chord stab) · `stinger_bad` (minor
cluster plus a low hit) · `suck_back` (reversed impact into silence).

*Foley:* `step_wood` ×4 · `step_tile` ×4 · `cloth_rustle` ×3 (band-passed noise bursts with an organic envelope) ·
`chair_creak` (resonant filtered noise with a pitch wobble) · `paper_shuffle` · `paper_flutter` · `coin_flip`
(metal ping + spin whirr) · `coin_land` (bouncing pings with a decreasing interval) · `chips_stack`
(clicky ceramic) · `dice_roll` · `card_flick` · `locker_slam` (metal hit + rattle) · `door_creak` ·
`pen_write` (scratchy noise bursts) · `marker_squeak` (whiteboard, a resonant sine wobble) · `alarm_beep`
(square 2.7kHz pattern) · `vending_drop` (thud + rattle) · `ball_bounce` (sub thump with decay intervals).

*Crowd & vocal (synthesised):* `crowd_murmur` (many band-passed noise "voices" with random
amplitude modulation 3–6Hz) · `crowd_cheer` (murmur with a rising level + brighter formants + whistles) · `crowd_gasp`
(a short inhale-like noise swell) · `crowd_aww` · `kid_laugh` (formant-filtered pulses) · `mumble_vo` (a
formant-filtered sawtooth "speech" for character babble, Animal-Crossing-style).

*Ambience beds (10–30s loops, seamless crossfade):* `amb_hallway` · `amb_classroom` (fans, a distant voice murmur)
· `amb_casino` (murmur + random slot jingles + chip clicks) · `amb_stadium` (crowd wash + PA reverb) ·
`amb_bedroom_night` (air + crickets + a slow clock) · `amb_hospital` (beeps + HVAC) · `amb_void` (soft sub drone + air).

**Synthesis building blocks (✅ in `scripts/sfxlib.py`):** `sine/saw/square/noise` · `adsr` · time-varying
`bandpass/lowpass/highpass` · `formant(x, vowel)` (3 parallel bandpasses at F1/F2/F3) · `bell` (inharmonic
partials) · `fm(carrier, mod, index_env)` (metallic and glassy tones) · `karplus_strong` (plucks and strings) ·
`granular(src, density, pitch_jitter)` (shimmers, crowds) · `reverb(size, damp, mix)` · `delay(time, fb)` ·
`chorus` · `saturate(drive)` (tanh, which adds weight to impacts) · `bitcrush` · `pan(x, pos)` · `reverse` ·
`pitch_env` · `loop_crossfade` (seamless ambience). Keep everything seeded and deterministic.

**Rules of placement:**
1. **Pre-lap:** the next scene's ambience starts 8–15 beats *before* the cut. The ear arrives first.
2. **Whoosh peaks on the cut**, not after it. Start a whoosh at `CUT − 14` beats for the 0.9s whoosh.
3. **Hits land on the visual frame exactly.** Check with an audio-only render plus the timing sheet.
4. **Size matches size:** small UI gets small sounds. A big reveal gets impact + sub + sparkle + a music swell.
5. **Variation:** footsteps and ticks are never the same sample twice in a row. Rotate between variants and vary `rate` by ±5%.
6. **Spatial:** pan the SFX with the on-screen position (`pan = (x / W) * 2 − 1`, scaled by 0.6). Distant sources
   get a lowpass at 3–5kHz plus more reverb.
7. **Frequency slots:** the sub (≤60Hz) belongs to impacts only. Music is high-passed at 40Hz. Dip the music
   2–5kHz by 3dB under VO.
8. **Silence before the biggest moment** (4–8 beats), and a `suck_back` into it.
9. **Ducking:** music and ambience are side-chained to VO (−6dB, 80ms attack, 300ms release, implemented
   as volume curves computed from the VO amplitude).
10. **Master chain** (`npm run master` after `npm run render`; the demo measured −14.4 LUFS with a +0.5 TP peak before mastering, so the limiter is required): `acompressor=threshold=-18dB:ratio=3:attack=10:release=150`,
    then `loudnorm=I=-14:TP=-1:LRA=9`. Keep the uncompressed stems in `out/stems/`.

### 36.7 Music system
- One **motif** (4–6 notes) for "the power". It returns in every act, in a different instrument and harmony each time
  (bells in wonder, plucks in fun, low strings/saws in tension, solo piano for consequence).
- **Act-based cues:** wonder (pad + bells, 72bpm), fun (pluck arpeggios + light kick/hat, 96–110bpm),
  tension (drone + heartbeat + Shepard riser), consequence (sparse piano + reverb, no drums), triumph (full
  chord stack + big kick + sparkles).
- Generate stems separately (`music_pad`, `music_pluck`, `music_drums`, `music_bass`) so you can mute or duck layers per shot.
- Transitions between cues: stingers, or a 1-bar drum fill, or a `tape_stop`, never an abrupt start.
- **Tempo map in beats:** make cut points and music bars land together (e.g. 72bpm means one bar every 100 beats at 30-beat/s).

### 36.8 Typography & graphics standard
- Hierarchy: big titles (Cinzel 72–96), tags (Cinzel 26–30, tracking 0.24em), badges (Inter labels + Cinzel numbers),
  captions (Inter 600, 34px with a dark plate, for accessibility on mobile).
- Every graphic has an **entry, a life and an exit**: it enters with spring/blur, stays alive with float, shimmer or
  subtle pulse, and leaves with an accelerated fade. Nothing just appears or vanishes.
- Every graphic has a **sound**, and every number change has a tick.
- Keep the graphic language consistent: gold = the power or odds, cream = information, red = danger or loss. Nothing else.
- Safe areas: titles inside 90% action-safe, captions above the bottom 12% (and the middle third for vertical).

### 36.9 Edit & rhythm standard
- Average shot length 2.5–3.5s. Make it faster (1.5–2s) in montages and slower (4–6s) in emotional beats.
- Every 20–30s, something **new**: a new set, a new lighting mood, a new graphic type, or a new music layer.
- J-cuts and L-cuts: let sound lead or trail the picture across cuts at least twice per minute.
- The ending mirrors the opening (same angle and set, but the light or emotion has changed). Hold the last frame 1.5s, then cut to black with a sub-tail.

### 36.10 The final gate — "out of this world" checklist
**Picture**
- [ ] Every shot has key, fill, rim and a motivated source, with a correct key:fill ratio for the mood
- [ ] PCSS shadows + N8AO + contact shadows: nothing floats, and contact points are dark
- [ ] Volumetric or god rays appear in ≥1 shot per scene, and fog separates depth layers
- [ ] An Environment map exists, and metals and clearcoat show reflections
- [ ] Each shot uses the lens package, follows composition rules and respects the 180° line
- [ ] Every shot has one primary move + one secondary layer, eased (no linear)
- [ ] Characters: asymmetry, line of action, offsets, overlaps, eyes lead, a thought change, blinks
- [ ] Background life: crowd variations, practical flicker, dust
- [ ] Graphics: entry/life/exit, consistent colors, inside safe areas, never covering a face

**Sound**
- [ ] L1–L5 layers are present throughout, with no dead air (except the planned silence)
- [ ] Every cut, graphic, number change, impact and big motion has a sound
- [ ] Ambience pre-laps, whooshes peak on cuts, hits land on the frame
- [ ] Repeated sounds vary, and positional SFX are panned
- [ ] Music: the motif recurs, the cues match acts, the music ducks under VO and before the biggest hit
- [ ] Master: −14 LUFS, TP ≤ −1, no clipping, stems saved

**Delivery**
- [ ] 60fps master, vertical cut, thumbnail, and a contact sheet reviewed
- [ ] 10 random paused frames are all wallpaper quality
- [ ] Watched once on a phone at low volume, it still reads and still sounds good
## 37. (moved to the end, see §51)

---

## 38. Voice & narration

### 38.1 Writing for the ear
- 150–165 words per minute, and one idea per sentence. Sentences of 6–14 words. Use contractions.
- **Second person, present tense** ("You wake up. The alarm says 99%.") pulls the viewer inside.
- Rule of three for escalation lists. End lines on the strongest word ("…and the odds were **zero**").
- Write **visual hooks** into the text: every sentence must name something we can show. If a line has nothing to show, cut it.
- Mark emphasis in the script with `*word*` and pauses with `/` (0.3s) or `//` (0.8s). `estimate_timing.py` treats
  punctuation as pauses, so write `/` as `,` and `//` as an empty line when estimating.
- The hook is the first 2 sentences. It must pose a question the video answers only at the end.

### 38.2 Getting a voice
| Option | Quality | Notes |
|---|---|---|
| Record it yourself | best | a quiet room with a blanket over your head, phone 15cm from the mouth, 48kHz WAV. Do 3 takes per line and pick the best |
| TTS service (ElevenLabs, OpenAI TTS, Azure) | very good | needs an **API key**. In the cloud session, ask for it with the credential tool, never paste it in chat. Prefer providers that return **word timestamps** (alignment), which skips §38.3 |
| `mumble_vo` babble | stylised | Animal-Crossing-style character "speech" with no real words. Good for in-world characters, not for narration |

Clean-up chain for recorded voice (ffmpeg): `highpass=f=80, afftdn=nf=-25, acompressor=threshold=-20dB:ratio=3,
deesser, loudnorm=I=-16`. Export to `public/vo/voiceover.wav`.

### 38.3 Word timings → `public/vo/words.json`
1. **TTS alignment** (best). Convert the provider's character or word timestamps into `[{text,start,end}]`.
2. **whisper on your own machine:** `whisper vo.wav --word_timestamps True --output_format json`, then map the segments to words.
3. **Estimate** (always available): `python3 scripts/estimate_timing.py script.txt 155 > public/vo/words.json`.
   It's accurate to about ±0.3s, which is fine for blocking. Swap in real timings before the final.

Shot cuts and SFX cues then come from word times: `beat = Math.round(word.start * 30)`.

### 38.4 Lip sync & listening
- Narration with no on-screen speaker: the hero reacts *to* the narration (nods on stresses, eye-rolls on jokes).
- On-screen speaker: mouth height = smoothed VO amplitude (`visualizeAudio` from `@remotion/media-utils`,
  🔲 install it when first needed). Close the mouth on silences longer than 0.15s. Add a head nod (±2°) on `*emphasis*` words.
- Listeners: blink on sentence ends, and glance at the speaker every 2–3s.

---

## 39. Captions & accessibility
- Use `<Captions words={words} seconds={beat / 30} />` (✅ `overlay/Captions.tsx`). It shows 4–6 word chunks and highlights the
  active word in gold.
- Horizontal: put captions 150px from the bottom (above the letterbox). Vertical: put them in the middle third, above the platform UI.
- Turn captions **on** for Shorts and social, and make them optional for YouTube 16:9 (upload an `.srt` instead, §49).
- Contrast: cream on a dark plate. Never rely on color alone. The odds are always written as a number too, not
  only shown by the ring.
- Never flash faster than 3 times per second (photosensitivity). Impact flashes are single, under 0.4 opacity.
- Make sure the gold-versus-red meaning also differs by **shape or text** (✔ ✘, or the words "WIN" and "LOSS").

---

## 40. Props, hands & locomotion
- **Holding:** parent the prop to the hand group. Put a `hand` slot at the end of each arm in `Pill`
  (🔲 add a `rightHand?: ReactNode` prop rendered at the hand sphere's position). The prop's grip offset is ~0.06m.
- **Two-handed props** (signs, trays): attach to the right hand, and aim the left arm at the prop's left handle with a
  2-bone IK solve (law of cosines: shoulder → elbow → hand).
- **Sitting:** hips at the seat height (0.45m), thighs rotated −90°, shins +90°. The torso leans forward 5–10° when engaged
  and back 10° when bored.
- **Walk cycle** (16 beats, at 30 beats per second): legs swing ±25° as a sine, arms ∓15° (opposite), and the body bobs
  0.03m at twice the step frequency with its lowest point on contact. Move the root at a constant speed
  `stride / 8 beats`. Stride is 0.45m. **No foot sliding:** the root speed must equal the stride divided by the half-cycle.
- **Run:** 10 beats per cycle, 15° forward lean, a 0.08m bob, arms bent.
- **Paths:** walk along a CatmullRom curve (`three` `CatmullRomCurve3`). The body faces the curve tangent and turns
  with spring smoothing.
- **Props library** (🔲 `three/props/`): Coin (gold, glint), Dice (rounded box with pips), Card, Chip stack,
  Roulette wheel (spinning plus a ball on a decaying spiral), Alarm clock (a red 7-segment display texture), Vending
  machine (a grid of emissive colored cans), Basketball (orange plus black seam torus rings), Paper (a bent plane),
  Phone (rounded box with an emissive screen), Sign board (with drei `<Text>`).

---

## 41. Set library specs (all low-poly, all in meters)

| Set | Layout | Key details | Light preset |
|---|---|---|---|
| **Hallway** ✅ | wood floor, a wall at z=−3, 12 lockers 0.58m wide | 3 fluorescent practicals, locker vents and handles | `hallway` |
| **Classroom** 🔲 | 4×3 grid of desks (1.0×0.6, h 0.75) spaced 1.4m apart, a whiteboard 3×1.2 at z=−4 | a window on the left (GodRays source), a clock, posters, the teacher's desk | `classroom` |
| **Bedroom** 🔲 | 4×4 room, a bed 2×1.2 against the back wall, a nightstand on the right | an alarm clock (red LED), a window with moonlight, a lamp practical, a rug | `bedroom` |
| **Casino** 🔲 | a felt table 2.4×1.2 with a padded rim, a roulette wheel r=0.35, chip stacks | hanging pool lamps (volumetric), a "CASINO NIGHT" banner, a crowd ring | `casino` |
| **Stadium** 🔲 | stepped bleachers (rows 0.4 high and 0.8 deep), a railing, a field plane | "SEC 308" signs, floodlights (GodRays), an instanced crowd of 200 | `stadium` |
| **Void** 🔲 | none: a dark floor plus a fog wall | one top spotlight, a floor glow ring | `void` |

Every set exports its **camera marks**: named `Cam` presets (`wide`, `med`, `cu`, `ots`). Shots start from a mark instead
of inventing coordinates, so the framing stays consistent across shots in the same set.

---

## 42. Character bible
Keep a cast table in this file and never change a character's look mid-video.

| Name | Role | Silhouette | Hoodie | Default face | Personality in motion |
|---|---|---|---|---|---|
| **Hero** | can see the odds | black beanie | red `#c8323a` | smug | relaxed, slow head turns, tilts a lot |
| **Brain** | sceptic friend | round glasses | blue `#3d6fd6` | neutral | quick, precise, pushes glasses up |
| **Lucky** | rival | backwards cap | teal `#2f8f8a` | happy | bouncy, over-confident, big arm moves |
| **Teacher** | authority | bun hair, taller (scale 1.1) | mustard `#d29a2d` | bored | still, minimal moves, slow blinks |
| **Crowd** | background | random cap/beanie/none | palette pool | neutral | 3 animation variants, random phase |

- **Variety tools:** body scale 0.9–1.15, head scale 0.95–1.05, hair options (beanie, cap, bun, bob, ponytail,
  spikes made of 5 cones), glasses, a hood up or down, freckles painted on the face texture, and a skin tint ±3%.
- **Turnaround check:** before using a new character, render it at 4 angles (0°, 90°, 180°, 270°) in the `void` set
  and look for intersecting meshes and broken silhouettes.

---

## 43. Thumbnail design
- 1280×720. Render with `npx remotion still` from a **dedicated `Thumb` composition**, not a random frame.
- Layout: the hero's face is huge (40% of the frame height) on one third, one big badge or number on the other third, and
  **3 words or fewer** in Cinzel 140px+ with a dark outline (8px).
- Contrast: a bright subject on a dark background, plus a rim light boosted ×1.5 versus the video. Saturation is +10% versus the video.
- One clear emotion on the face: shock or smug reads best at small sizes.
- Test it at 168×94 (YouTube sidebar size). It should still read.
- Make 3 variants (different expression, number or color) for A/B testing.

---

## 44. Shot, transition & preset templates (use them, don't rewrite them)
- **New shot:** copy `src/shots/_TEMPLATE.tsx`. Write the timing chart in its header comment *first*, export
  `DUR` (in beats), and import `DUR` into `Main.tsx` and the cue constants into `Soundtrack.tsx`.
- **Lighting:** `LIGHTS[preset]` from `style/presets.ts` (🔲 wire it into `<Lights preset="casino" />`, which
  currently takes `keyColor`/`keyI` only). Use `kelvin(3200)` for any color temperature.
- **Grade:** `GRADES[act]` → pass it into PostFX (🔲 add a `grade` prop to `PostFX`).
- **Transitions** (`overlay/Transitions.tsx`): pass `beat - CUT` as the `beat` prop.
  - `<DipToBlack>` for chapter breaks, plus a `whoosh_heavy` cue.
  - `<WhipStreak>` for whip cuts, plus a fast camera yaw on both sides and a `whip` cue.
  - `<Flash>` for impacts, plus `impact` and `sparkle`.
  - Match cut: no component. Keep the object's projected screen position identical across the cut (check it with `project()`).

---

## 45. Vertical (Shorts / TikTok / Reels) — 🔲 planned
- Make a separate `MainVertical` composition at 1080×1920. `Stage` and `project()` currently use the global `W/H`.
  First change them to read `useVideoConfig()` width and height. **Do this before building vertical.**
- Camera: fov ×1.25 and pull back about 15% so the head and the badge both fit. Recompose the shots so the subject is centered.
- Overlays: titles at 0.22 of the height, badges stay anchored, captions in the middle third, and nothing in the top 12% or bottom 20%
  (platform UI).
- Length: 30–58s. Cut the hook down to 2 seconds. The ending must loop seamlessly into the start (for replays).

---

## 46. Render operations
| Need | How |
|---|---|
| Fast preview | `npx remotion studio`, which plays live in the browser (on a machine with a GPU) |
| Look-dev still | `npm run still -- --frame=N` (half scale) |
| Draft video | set `FPS = 30` in tokens, `--scale=0.5`, `multisampling` 2 |
| Final | `npm run render && npm run master` or, crash-safe, `npm run render:chunks` |
| Resume after a crash | `render_chunks.sh` skips chunks that already exist. Delete a chunk to redo it |
| Faster | a machine with a GPU (about 30–60× faster than this CPU container), or Remotion Lambda for long videos |
| Memory | `--concurrency=2` on 4 cores in the cloud container (4 got OOM-killed). Use `cores/2` elsewhere |

Set the browser path once per session: `export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
(the scripts read it), and pass `--browser-executable=$REMOTION_BROWSER` to plain `npx remotion` commands.

---

## 47. Testing & CI
- `npm run typecheck` before every render. A type error mid-render wastes the whole run.
- `npm run determinism` after touching any animation code. It renders the same frame twice, and the hashes must match.
- `npm run qa` on every final: planned cuts versus detected cuts, the contact sheet, loudness, and black or frozen frames.
- Before a long render, render stills at the **first, middle and last beat of every shot**, plus every impact beat.
- 🔲 A GitHub Actions workflow can run `typecheck` and render 3 stills per PR (the CI machine has no GPU either, so keep it to stills).

---

## 48. Review loop with the user
1. After phases 4–5 (§36.1), send the shot list and color strip. Wait for a 👍.
2. After look-dev, send 1 still per set (`SendUserFile`, display render).
3. After blocking, send a 30fps, half-scale draft with audio.
4. Turn feedback into a numbered list in the reply ("1. badge bigger → OddsBadge scale 1.2 ✅"). Fix everything in one pass,
   re-render only the affected shots (`--frames`), and say what changed.
5. Never re-render the full 60fps master until the user has approved the draft.

---

## 49. Output organisation & publishing
- File names: `out/<slug>_v<NN>_<fps>.mp4`, plus `_vertical`, `_thumb_A/B/C.png`, `_captions.srt` and `_stems/` (music, sfx, vo).
  Never overwrite a version the user has seen. Bump `vNN` instead.
- `out/` is git-ignored. Hand finals to the user with `SendUserFile`, never commit them.
- **SRT export** from `words.json`: group 5–7 words per line, each line under 42 characters, at least 1s on screen.
- **YouTube metadata:** title under 60 characters (curiosity + payoff), chapters in the description (`0:00 Hook`, one per act, from the
  shot list), 3–5 tags, end screen space in the last 20s (keep the bottom-right 40% clean), and the thumbnail from §43.
- **Localization:** keep all on-screen strings in one `src/text/<lang>.ts` (🔲) and never hard-code text in shots.
  Cinzel has no Cyrillic or CJK, so fall back to Cormorant or Noto Serif for other languages.

---

## 50. Build status & roadmap (keep this current)
| Area | Status |
|---|---|
| Engine: Stage, PostFX, beats/60fps, local fonts | ✅ |
| Lighting: 3-point + bounce + kicker + PCSS + N8AO + contact shadows + env reflections | ✅ |
| Lighting/grade presets as data | ✅ data · 🔲 wired into components |
| Character: Pill, faces, blink, squash, tilt, hats | ✅ · 🔲 hand slots, IK, walk, sit, hair variants, glasses |
| Sets | ✅ Hallway · 🔲 Classroom, Bedroom, Casino, Stadium, Void |
| Props | 🔲 library (the coin is inline) |
| Overlays | ✅ Title, Tag, OddsBadge, Letterbox, Captions, Transitions · 🔲 Callout, BarRace, Counter |
| Sound | ✅ 80 SFX + music stems + cue list + mastering · 🔲 VO ducking curves, panning |
| Voice | ✅ timing estimator · 🔲 VO recording/TTS, lip sync |
| Ops | ✅ chunked render, QA, determinism, typecheck · 🔲 CI, vertical, thumbnail comp, SRT export |
| Film layer (§23): halation, light leaks, gate weave, motion blur | 🔲 |
| GodRays / volumetric spot | 🔲 (documented in §36.3, not yet in the demo) |

When you finish a 🔲 item, flip it to ✅ here **and** in §1 in the same commit.

---

## 51. What's left is iteration

Past this point, the remaining quality comes from **rendering and tuning**, not from more rules.
Build the base `Stage`, `Pill` and `OddsBadge` first. Render the `heroIntro` and `powerReveal` recipes,
compare them against the reference frames, then update the numbers in this file with what actually looked best.
