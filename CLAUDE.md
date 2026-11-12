# CLAUDE.md — Cinematic 3D Explainer Animation Playbook

This repo builds **cinematic, stylized 3D explainer videos**: rounded "pill-people"
characters on simple low-poly sets, with moody film lighting, shallow depth of field,
and glowing gold UI badges ("THE ODDS 33%") floating over the scene.

Claude: when asked to make a video, scene or shot, **follow this file exactly**. Every
number here is a starting default chosen to match the reference look. Tune it after
test renders, but change it only when the user asks or a shot clearly needs it. A video that ignores the lighting, depth-of-field and grading rules looks like
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
| Video framework | `remotion`, `@remotion/cli`, `@remotion/three`, `@remotion/google-fonts` (pin all `@remotion/*` to the **same exact 4.x version**, or Remotion refuses to run) |
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
  {/* focusDistance is NORMALIZED 0..1 of camera near..far, not meters: use
      focus = (meters - near) / (far - near) with near=0.1, far=40 → head at 3m ≈ 0.072 */}
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

---

## 14. Remotion + R3F rules (the things that break renders)

1. **Never animate with `useFrame` or `clock`.** Remotion renders frames out of order and in
   parallel. All motion must come from `const frame = useCurrentFrame()`, i.e. `t = frame / fps`.
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
8. Each shot is its own `<Series.Sequence durationInFrames={d}>`. Inside, `useCurrentFrame()`
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

### 15.2 Camera rig
```tsx
export const CameraRig = ({from, to, target, dur, seed = 'cam'}: Props) => {
  const frame = useCurrentFrame();
  const {camera} = useThree();
  const k = ease(frame, [0, dur], [0, 1]);
  const t = frame / 30;
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

- Main output: 1920×1080 at 30fps, H.264 CRF 16, AAC 320k audio, `--pixel-format=yuv420p`.
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

## 31. What's left is iteration

Past this point, the remaining quality comes from **rendering and tuning**, not from more rules.
Build the base `Stage`, `Pill` and `OddsBadge` first. Render the `heroIntro` and `powerReveal` recipes,
compare them against the reference frames, then update the numbers in this file with what actually looked best.

---

## 32. Lessons from the first real render (demo in `src/`)

- **Fonts must be local.** The render browser can't reach Google Fonts here, and `@remotion/google-fonts`
  times out. Fonts live in `public/fonts/*.woff2` and load via `@remotion/fonts` (`src/style/fonts.ts`).
- **Browser in this cloud container:** pass
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
  `remotion.config.ts` sets the `swangle` GL renderer.
- **Speed:** without a GPU, it takes about 4s per 1080p frame (10s of video ≈ 20 min, `--concurrency=2`; 4 got killed).
  Draft with `--scale=0.5`, and do final renders on a machine with a GPU.
- **Emissive and glint values must stay small.** A coin with emissive 3 and a point light of 4 blew out the whole frame.
  Hero props work at emissive 0.1–1.0 because bloom does the rest.
- **Close camera distance:** for a medium close-up at fov 30, keep the camera about 3.1–3.6m from the hero.
  At 2.1m the head fills the frame and the badge gets clamped off-screen.
