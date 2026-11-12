# CLAUDE.md — Cinematic 3D Explainer Animation Playbook

This repo builds **cinematic, stylized 3D explainer videos**: rounded "pill-people"
characters on simple low-poly sets, with moody film lighting, shallow depth of field,
and glowing gold UI badges ("THE ODDS 33%") floating over the scene.

Claude: when asked to make a video, scene or shot, **follow this file exactly**. Every
number here is a starting default chosen to match the reference look; tune it after test renders. Change one only when the user asks, or when a shot clearly
needs it. A video that ignores the lighting, depth-of-field and grading rules looks like
a cheap 3D demo, not the reference.

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
2D overlay layer (titles, odds badges, counters, arrows)  ──►  MP4 (1920x1080, 30fps)
```

Stack (pin these versions — do not use `latest`):

| Purpose | Package |
|---|---|
| Video framework | `remotion@4`, `@remotion/cli@4`, `@remotion/three@4` |
| 3D | `three@0.169.0`, `@react-three/fiber@8.17.10`, `@react-three/drei@9.114.0` |
| Post FX | `@react-three/postprocessing@2.16.3`, `postprocessing@6.36.3` |
| Fonts | `@remotion/google-fonts` (Cinzel, Cormorant Garamond, Inter) |
| Audio timing (optional) | `whisper` / `openai-whisper` CLI locally for word timestamps |

Setup:
```bash
npx create-video@latest --template=blank .   # then pin versions above
npm i three@0.169.0 @react-three/fiber@8.17.10 @react-three/drei@9.114.0 \
      @react-three/postprocessing@2.16.3 postprocessing@6.36.3 @remotion/three @remotion/google-fonts
npx remotion studio            # preview
npx remotion render Main out/video.mp4 --codec=h264 --crf=16 --gl=angle --concurrency=4
```
On headless Linux, use `--gl=swangle` if `angle` fails. Always render a 3-second test
(`--frames=0-90`) before a full render.

---

## 1. Project structure

```
src/
  Root.tsx                 # registers <Composition id="Main" .../>
  Main.tsx                 # <Series> of shots from storyboard.json + audio
  style/tokens.ts          # ALL colors, fonts, timings (single source of truth)
  three/
    Stage.tsx              # Canvas wrapper: camera, lights, fog, post FX
    Lighting.tsx           # 3-point cinematic rig presets (warm/cool/night/casino)
    PostFX.tsx             # DOF, bloom, vignette, noise, chromatic aberration, tone map
    CameraRig.tsx          # frame-driven camera moves (dolly, orbit, push-in, handheld)
    characters/
      Pill.tsx             # the base character (parametric)
      Face.tsx             # canvas-drawn face textures (expressions)
      poses.ts             # named poses (idle, cheer, shrug, point, sit, sleep)
      accessories.tsx      # caps, beanies, hair, glasses, hoodies
    sets/
      Classroom.tsx  Hallway.tsx  Bedroom.tsx  Casino.tsx  Stadium.tsx  Void.tsx
    props/                 # Coin, Dice, Roulette, Alarm, VendingMachine, Card ...
  overlay/
    Title.tsx              # big serif caps headlines
    OddsBadge.tsx          # pill badge with ring progress + %
    Callout.tsx            # handwritten-style arrow + label
    BarRace.tsx            # "YOU vs NORMAL" dot bars
    Counter.tsx            # rolling number
    Subtitle.tsx           # lower caption
  shots/                   # one file per shot, e.g. S03_AlarmClock.tsx
storyboard.json
public/audio/voiceover.mp3
```

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
export const FPS = 30;
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
with `spring({fps, frame, config:{damping:14, mass:0.8}})`. Always add **idle breathing**:
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

## 5. Post-processing (`PostFX.tsx`) — non-negotiable

```tsx
<EffectComposer multisampling={4}>
  <DepthOfField focusDistance={focus} focalLength={0.035} bokehScale={4} />
  <Bloom intensity={0.6} luminanceThreshold={0.75} luminanceSmoothing={0.2} mipmapBlur />
  <ChromaticAberration offset={[0.0007, 0.0005]} radialModulation modulationOffset={0.3} />
  <HueSaturation saturation={-0.12} />
  <BrightnessContrast contrast={0.08} />
  <Vignette offset={0.28} darkness={0.75} />
  <Noise opacity={0.045} premultiply blendFunction={BlendFunction.OVERLAY} />
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
3. Get word timestamps (`whisper voiceover.mp3 --word_timestamps True --output_format json`)
   and convert them to `timing.json`.
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
5. Sound design matters as much as visuals. Add soft whooshes on cuts, a "tick" or "ding" when a
   badge appears, low cinematic music at −22 LUFS under the voice, and a riser before reveals.

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
