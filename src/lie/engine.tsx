/**
 * Lie-meter shot engine: turns a ShotSpec (data) into a rendered shot.
 * Camera language (CLAUDE.md §36.2): shot size → lens + distance; one primary move + handheld drift.
 */
import {RB} from '../three/RB';
import React from 'react';
import {LIGHTS} from '../style/presets';
import {Color} from 'three';
import {Text as Text3} from '../three/LieSets';
import {WhipStreak} from '../overlay/Transitions';
import {AbsoluteFill, interpolate, Easing, random, Audio, Sequence, staticFile} from 'remotion';
import {PerspectiveCamera, Vector3} from 'three';
import {reactAt, Reaction} from './reactions';
import {FilmLook, weave} from '../overlay/FilmLook';
import {Stage, Lights, handheld, Cam, FAST} from '../three/Stage';
import {Pill, Hair} from '../three/Pill';
import type {Expr} from '../three/Face';
import {Hallway, Dust} from '../three/Set';
import {SETS, Phone, Card, CookieJar, CerealBox, MIRROR_Z, BathroomReflection} from '../three/LieSets';
import {Tag, Title} from '../overlay/Overlays';
import {C, W, H, ease, focusFor, NEAR, FAR} from '../style/tokens';
import {LieMeter} from './LieMeter';
import timeline from './timeline.json';
import {CAST, CastSpec, Who, Pose, Prop, Size, Move, V3, wristR, chestOf, headOf, camFor, projectCam, focusPlan, deg} from './camera';
export {CAST, wristR, chestOf, headOf, camFor, projectCam, focusPlan};
export type {CastSpec, Who, Pose, Prop, Size, Move};
import {Thread, ThreadSwarm, ThreadState} from '../three/Thread';

export type Line = {id: string; act: string; text: string; start: number; end: number; audio: string | null; words: {text: string; start: number; end: number}[]};
export const LINES = timeline.lines as Line[];
export const TOTAL = timeline.total as number;
export const lineById = (id: string) => LINES.find((l) => l.id === id)!;

/* ───────────── shot spec ───────────── */
export type MeterSpec = {on: number | [number, number, number]; value: number; label?: string; mode?: 'normal' | 'mirror' | 'q' | 'fire' | 'fade'; delay?: number; from?: number; small?: boolean};
/** Promise thread (WHAT_IF_PROMISE_THREADS §6). from/to: cast index (wrist → chest) or a world point. `at` = beat the state starts;
 *  `then` switches state later in the shot (e.g. held → burst). `swarm` draws n hair-thin threads from `from` instead. */
export type ThreadSpec = {from: number | [number, number, number]; to?: number | [number, number, number]; state: ThreadState; at?: number; thick?: number;
  then?: {state: ThreadState; at: number}; swarm?: number; grey?: number; xray?: boolean};
export type ShotSpec = {
  line: string; w?: number; set: string; setProps?: Record<string, unknown>; light: string; grade: string; keyPos?: [number, number, number]; keyI?: number;
  cam: {on: number | [number, number, number]; size: Size; yaw?: number; pitch?: number; move?: Move; amount?: number; path?: [V3, V3]; arc?: 1 | -1};
  cast: CastSpec[]; meters?: MeterSpec[]; tag?: string; title?: {words: string[]; emph?: number[]; y?: number; size?: number};
  dust?: boolean; extra?: string; threads?: ThreadSpec[]; shake?: number; shakeKind?: 'light' | 'hit' | 'quake'; slowmo?: {at: number; len?: number; rate?: number}; rack?: {at: number; to: number}; whip?: 'in' | 'out' | 'both'; callout?: {text: string; at: [number, number, number]; from?: number}; title3d?: {words: string[]; pos: [number, number, number]; size?: number}; net?: boolean; focusOn?: number | V3; intent?: string[]; flash?: number; exposure?: number; mirror?: boolean; flicker?: boolean;
};

const E = Easing.bezier(0.45, 0, 0.2, 1);

/* ───────────── speaking / poses ───────────── */
/** Lip sync (backlog #6, #7): openness from the word envelope + a viseme from the letter being spoken.
 *  Looks 0.05s ahead so the mouth opens just BEFORE the sound. Encoded as shape*10 + openness for Face. */
const VIS = (ch: string) => /[mbp]/.test(ch) ? 1 : /[ouwq]/.test(ch) ? 2 : /[eiy]/.test(ch) ? 3 : /[fv]/.test(ch) ? 4 : 0;
const mouthAt = (line: Line | undefined, sec: number) => {
  if (!line) return 0;
  const t = sec + 0.05;
  const w = line.words.find((x) => t >= x.start && t < x.end);
  if (!w) return 0;
  const p = (t - w.start) / Math.max(0.05, w.end - w.start);
  const letters = w.text.toLowerCase().replace(/[^a-z]/g, '') || 'a';
  const shape = VIS(letters[Math.min(letters.length - 1, Math.floor(p * letters.length))]);
  const open = Math.sin(p * Math.PI) * (0.55 + 0.45 * random(w.text + w.start));
  return shape * 10 + Math.max(0.06, open);
};
/** FIX_LIST_V2 #21/#7: stressed words (ALL CAPS or ≥7 letters) give a small nod + brow lift that peaks mid-word. */
const stressAt = (line: Line | undefined, sec: number) => {
  if (!line) return 0;
  const w = line.words.find((x) => sec >= x.start - 0.05 && sec < x.end + 0.15);
  if (!w) return 0;
  const bare = w.text.replace(/[^A-Za-z]/g, '');
  const stressed = (bare.length >= 2 && bare === bare.toUpperCase()) || bare.length >= 7;
  if (!stressed) return 0;
  const p = (sec - (w.start - 0.05)) / Math.max(0.1, w.end + 0.2 - w.start);
  return Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
};
const poseArgs = (pose: Pose | undefined, beat: number, id: string) => {
  const t = beat / 30, ph = random(id + 'p') * 6;
  switch (pose) {
    case 'cheer': return {armL: 2.7 + 0.15 * Math.sin(t * 9 + ph), armR: 2.7 + 0.15 * Math.sin(t * 9 + ph + 1)};
    case 'point': return {armL: 0.15, armR: 1.45};
    case 'phone': return {armL: 0.15 + 0.05 * Math.max(0, Math.sin(t * 7 + ph)) * (Math.sin(t * 0.9 + ph) > 0 ? 1 : 0), armR: 2.55 + 0.03 * Math.sin(t * 3.3 + ph)};
    case 'hold': return {armL: 0.15, armR: 0.9};
    // B18 pinky promise: right arm reaches forward and in, a small seeded wobble as the fingers hook
    case 'pinkyL': return {armR: 0.15 + 0.03 * Math.sin(t * 1.1 + ph), armL: 0.42 + 0.03 * Math.sin(t * 5 + ph), armLx: -1.15 + 0.04 * Math.sin(t * 4 + ph)};
    case 'pinky': return {armL: 0.15 + 0.03 * Math.sin(t * 1.3 + ph), armR: 0.42 + 0.03 * Math.sin(t * 5 + ph), armRx: -1.15 + 0.04 * Math.sin(t * 4 + ph)};
    case 'shrug': return {armL: 0.75, armR: 0.75};
    case 'slump': return {armL: 0.05, armR: 0.05};
    case 'run': return {armL: 0.15 + 0.6 * Math.sin(t * 12), armR: 0.15 - 0.6 * Math.sin(t * 12)};
    default: return {armL: 0.15 + 0.03 * Math.sin(t * 1.3 + ph), armR: 0.15 + 0.03 * Math.sin(t * 1.1 + ph + 2)};
  }
};
const PropMesh = ({p, text}: {p?: Prop; text?: string}) => {
  if (!p) return null;
  if (p === 'phone' || p === 'phoneText') return <group rotation={[0.2, -0.6, 0]} position={[0, -0.04, 0.05]}><Phone text={p === 'phoneText' ? text : undefined} /></group>;
  if (p === 'card') return <group rotation={[-0.5, 0, 0]}><Card face /></group>;
  if (p === 'cookie') return <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.07, 0.07, 0.02, 20]} /><meshStandardMaterial color="#b0743a" roughness={0.9} /></mesh>;
  return <mesh rotation={[0, 0, 0]}><cylinderGeometry args={[0.12, 0.1, 0.05, 20]} /><meshStandardMaterial color="#2a2a30" roughness={0.35} metalness={0.6} /></mesh>;
};

export const Actor = ({c, beat, sec, line, mirrored = false, speaker, camPos}: {c: CastSpec; beat: number; sec: number; line?: Line; mirrored?: boolean; speaker?: [number, number]; camPos?: number[]}) => {
  const L = CAST[c.who]; const id = c.id ?? c.who;
  const s = L.scale; const sit = c.pose === 'sit' ? -0.28 : 0; const sleep = c.pose === 'sleep';
  const mouth = c.talk ? mouthAt(line, sec) : 0;
  // B8 walk-in: ease from pos+enter to pos, facing the direction of travel, with a 16-beat step cycle (bob + arm swing)
  const wl = c.enterLen ?? 30, wk = c.enter ? Math.min(1, Math.max(0, beat / wl)) : 1, we = 1 - Math.pow(1 - wk, 2), walking = c.enter && wk < 1;
  const wx = c.enter ? c.enter[0] * (1 - we) : 0, wz = c.enter ? c.enter[1] * (1 - we) : 0;
  const wsw = walking ? Math.sin(beat / 30 * Math.PI * 2 * 1.9) * (1 - we * 0.6) : 0;
  const z = (mirrored ? 2 * MIRROR_Z - c.pos[1] : c.pos[1]) + wz;
  const travel = c.enter ? Math.atan2(-c.enter[0], -c.enter[1]) : 0, turnBack = Math.min(1, Math.max(0, (wk - 0.75) / 0.25));
  const rotY = ((c.enter ? travel + ((c.rot ?? 0) * deg - travel) * turnBack : (c.rot ?? 0) * deg)) * (mirrored ? -1 : 1) + (mirrored ? Math.PI : 0);
  const run = c.pose === 'run' ? Math.abs(Math.sin(beat / 30 * 12)) * 0.05 : 0;
  const R = reactAt(c.react, beat, c.reactAt);
  const st = c.talk ? stressAt(line, sec) : 0;
  const base0 = poseArgs(c.pose, beat, id);
  // MOTION PASS B1-B6: talkers gesture on every word (beat hand + stressed-word open palm), listeners sway and glance
  const t = beat / 30, ph = random(id + 'g') * 6, talkW = c.talk && mouth > 0 ? 1 : 0;
  const free = !c.pose || c.pose === 'idle' || c.pose === 'shrug';
  const gest = free ? (c.talk ? 0.35 * talkW * (0.5 + 0.5 * Math.sin(t * 4.2 + ph)) + 0.9 * st : 0.08 * Math.sin(t * 0.9 + ph)) : 0;
  const base = {armL: base0.armL + (free && c.talk ? 0.45 * st + 0.12 * talkW * Math.sin(t * 3.1 + ph + 1) : 0), armR: base0.armR + gest};
  // B11: the hero glances down at the thread wrist when the narration says thread/wrist/promise
  const ww = c.who === 'hero' && !sleep && line ? line.words.find((w) => /thread|wrist|promise/i.test(w.text) && sec > w.start - 0.25 && sec < w.end + 0.9) : undefined;
  const wristLook = ww ? Math.sin(Math.min(1, Math.max(0, (sec - ww.start + 0.25) / (ww.end - ww.start + 1.15))) * Math.PI) : 0;
  // B16: sad characters sigh every 4 s (shoulders rise 0.4 s, then drop and slump)
  const sp4 = ((t + random(id + 's') * 4) % 4) / 4, sigh = c.expr === 'sad' ? (sp4 < 0.15 ? Math.sin(sp4 / 0.15 * Math.PI / 2) : sp4 < 0.35 ? 1 - (sp4 - 0.15) / 0.2 * 1.3 : -0.3 * (1 - (sp4 - 0.35) / 0.65)) : 0;
  const bob = sigh * 0.018 + (c.talk ? 0.012 * talkW * Math.abs(Math.sin(t * 6 + ph)) + 0.02 * st : 0.006 * Math.sin(t * 1.4 + ph));
  const body = (
    <Pill id={id} frame={beat} position={sleep ? [0, 0, 0] : [c.pos[0] + wx, (c.y ?? 0) + sit + run + R.dy + (sleep ? 0 : bob) + Math.abs(wsw) * 0.035, z]} rotY={sleep ? 0 : rotY}
      hoodie={L.hoodie} hat={L.hair} hatColor={L.hairColor} glasses={L.glasses} expr={c.exprAt && beat >= c.exprAt.at ? c.exprAt.to : c.expr ?? L.expr} forceBlink={c.exprAt ? Math.max(0, 1 - Math.abs(beat - c.exprAt.at) / 3) : 0} scale={s}
      headTurn={(c.turn ?? 0) * deg + R.headTurn + (c.lookCam !== undefined && camPos && beat >= c.lookCam ? Math.max(-0.7, Math.min(0.7, Math.atan2(camPos[0] - c.pos[0], camPos[2] - c.pos[1]) - (c.rot ?? 0) * deg - (c.turn ?? 0) * deg)) * Math.min(1, (beat - c.lookCam) / 8) : 0) + (!c.talk && speaker && !sleep ? Math.max(-0.55, Math.min(0.55, (Math.atan2(speaker[0] - c.pos[0], speaker[1] - c.pos[1]) - (c.rot ?? 0) * deg) * 0.5)) * Math.min(1, Math.max(0, (beat - 6) / 12)) : 0) + (c.talk ? Math.sin(beat / 30 * 2.3) * 0.04 : 0)} squash={R.squash + st * 0.04 - sigh * 0.02} lean={R.lean + (c.talk ? st * 0.06 : 0.025 * Math.sin(t * 0.6 + ph))} turnLag={(reactAt(c.react, beat - 4, c.reactAt).headTurn - R.headTurn) + (c.talk ? (Math.sin((beat - 4) / 30 * 2.3) - Math.sin(beat / 30 * 2.3)) * 0.04 : 0)} headTilt={(c.tilt ?? 0) * deg + R.headTilt - 0.32 * wristLook - 0.06 * sigh} nod={st * 0.06} brow={Math.max(st, c.talk && line?.text.trim().endsWith('?') ? 0.6 : 0)}
      mouth={mouth} armL={base.armL + R.armL + sigh * 0.06} armR={base.armR + R.armR + sigh * 0.06 + wristLook * 0.5} legSwing={wsw * 0.45} armLx={wsw * 0.5 + ((base0 as {armLx?: number}).armLx ?? 0) + R.armLx + (free && c.talk ? st * 0.35 : 0)} armRx={-wsw * 0.5 + ((base0 as {armRx?: number}).armRx ?? 0) + R.armRx + (free ? gest * 0.4 : 0)} rightHand={<PropMesh p={c.hold} text={c.hold === 'phoneText' ? 'we\'re good, right?' : undefined} />}
      look={c.talk ? Math.round(Math.sin(t * 0.9 + ph)) * 2 : Math.round(Math.sin(t * 0.7 + random(id) * 9) * 1.4) * 5} />
  );
  if (sleep) return <group position={[c.pos[0], 0.62, c.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
    <group rotation={[0, 0, Math.max(0, Math.sin(t * 0.7 + ph) - 0.93) * 2.2 * Math.sin(t * 14)]}>{body}</group></group>;
  const phoneGlow = (c.hold === 'phone' || c.hold === 'phoneText') && !mirrored ? (() => { const h = headOf(c), a = (c.rot ?? 0) * deg;
    return <pointLight position={[h[0] + Math.sin(a) * 0.35, h[1] - 0.25, h[2] + Math.cos(a) * 0.35]} intensity={0.35 * (0.9 + 0.1 * Math.sin(t * 2))} distance={1.2} decay={2} color="#9fc4ff" />; })() : null;
  if (phoneGlow) return <>{phoneGlow}{mirrored ? <group scale={[-1, 1, 1]}>{body}</group> : body}</>;
  return mirrored ? <group scale={[-1, 1, 1]}>{body}</group> : body;
};

/* ───────────── special extras ───────────── */
/** Bus (backlog #47): rounded body, roof, bumper, wheel wells, hubcaps, headlights, stop arm, mirror, door, side stripe. */
const Bus = ({k}: {k: number}) => {
  const paint = <meshPhysicalMaterial color="#f2b134" roughness={0.4} clearcoat={0.8} clearcoatRoughness={0.25} />;
  const dark = <meshStandardMaterial color="#1a1620" roughness={0.6} />;
  const x = -3 + 14 * Math.max(0, k - 0.45) ** 1.6 * 2.2, spin = -x / 0.38;
  return (
  <group position={[x, 0, 1.6]}>
    <mesh position={[0, 1.35, 0]} castShadow receiveShadow><RB args={[6, 2.1, 2.2]} />{paint}</mesh>
    <mesh position={[0, 2.45, 0]} castShadow><RB args={[5.8, 0.12, 2.05]} /><meshPhysicalMaterial color="#f6e6c0" roughness={0.5} clearcoat={0.5} /></mesh>
    <mesh position={[0, 1.05, 1.105]}><RB args={[5.9, 0.08, 0.02]} />{dark}</mesh>
    <mesh position={[0, 0.85, 1.105]}><RB args={[5.9, 0.08, 0.02]} />{dark}</mesh>
    <mesh position={[3.02, 0.45, 0]} castShadow><RB args={[0.18, 0.28, 2.3]} /><meshStandardMaterial color="#2a2530" roughness={0.4} metalness={0.4} /></mesh>
    <mesh position={[-3.02, 0.45, 0]} castShadow><RB args={[0.18, 0.28, 2.3]} /><meshStandardMaterial color="#2a2530" roughness={0.4} metalness={0.4} /></mesh>
    {Array.from({length: 5}).map((_, i) => (<group key={i} position={[-2.3 + i * 1.05, 1.75, 1.105]}>
      <mesh><RB args={[0.92, 0.72, 0.03]} />{dark}</mesh>
      <mesh position={[0, 0, 0.02]}><planeGeometry args={[0.82, 0.62]} /><meshStandardMaterial color="#5a6a9a" emissive="#ffd9a8" emissiveIntensity={0.12} roughness={0.1} /></mesh>
    </group>))}
    <group position={[2.55, 1.15, 1.105]}><mesh><RB args={[0.7, 1.7, 0.03]} />{dark}</mesh>
      <mesh position={[0, 0.2, 0.02]}><planeGeometry args={[0.55, 0.9]} /><meshStandardMaterial color="#9fc4ff" emissive="#ffd9a8" emissiveIntensity={0.1} /></mesh></group>
    {[0.75, -0.75].map((z) => (<group key={z} position={[3.06, 0.95, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.13, 0.06, 20]} /><meshStandardMaterial color="#fff2cf" emissive="#fff2cf" emissiveIntensity={1.4} toneMapped={false} /></mesh>
    </group>))}
    {[0.85, -0.85].map((z) => <mesh key={z} position={[-3.06, 0.95, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 0.05, 16]} /><meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={1.2} toneMapped={false} /></mesh>)}
    <group position={[-1.75, 1.0, 1.16]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.24, 0.24, 0.03, 8]} /><meshStandardMaterial color="#c8323a" roughness={0.5} /></mesh></group>
    <group position={[3.2, 1.9, 1.1]}><mesh><RB args={[0.05, 0.4, 0.05]} />{dark}</mesh><mesh position={[0.05, -0.15, 0.06]}><RB args={[0.06, 0.3, 0.2]} />{dark}</mesh></group>
    {[-2, 2].flatMap((wx) => [1.0, -1.0].map((z) => (<group key={`${wx}${z}`} position={[wx, 0.38, z]}>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.48, 0.48, 0.1, 24, 1, true, 0, Math.PI]} />{dark}</mesh>
      <group rotation={[Math.PI / 2, 0, 0]}><group rotation={[0, spin, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.38, 0.38, 0.28, 28]} /><meshStandardMaterial color="#141118" roughness={0.85} /></mesh>
        <mesh position={[0, z > 0 ? 0.145 : -0.145, 0]}><cylinderGeometry args={[0.2, 0.2, 0.02, 6]} /><meshStandardMaterial color="#b9b6c2" metalness={0.8} roughness={0.3} envMapIntensity={0.4} /></mesh>
      </group></group>
    </group>)))}
  </group>
  );
};
const Door = ({k}: {k: number}) => (
  <group position={[0, 0, -0.6]}>
    <mesh position={[0, 1.1, -0.05]}><RB args={[1.2, 2.3, 0.08]} /><meshStandardMaterial color="#3b2d5c" roughness={0.8} /></mesh>
    <mesh position={[0, 1.05, 0]}><planeGeometry args={[0.9, 2.1]} /><meshStandardMaterial color="#ffd9a0" emissive="#ffcf8f" emissiveIntensity={3} toneMapped={false} /></mesh>
    <group position={[-0.45, 0, 0.02]} rotation={[0, -0.9 * ease(k, [0.35, 1], [0, 1]), 0]}>
      <mesh position={[0.45, 1.05, 0]} castShadow><RB args={[0.9, 2.1, 0.05]} /><meshStandardMaterial color="#6e4630" roughness={0.6} /></mesh>
    </group>
    <mesh position={[0, 0.004, 0.6]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.9, 1.2 * ease(k, [0.35, 1], [0.1, 1])]} /><meshBasicMaterial color="#ffcf8f" transparent opacity={0.35} toneMapped={false} /></mesh>
  </group>
);
const Shards = ({k}: {k: number}) => (
  <group position={[-1.15, 2.0, 0]}>
    {Array.from({length: 60}).map((_, i) => {
      const a = random('sa' + i) * Math.PI * 2, b = random('sb' + i) * Math.PI - Math.PI / 2, r = 0.1 + random('sr' + i) * 1.4;
      const t = ease(k, [0, 0.55], [0, 1]), back = ease(k, [0.55, 1], [0, 1]);
      const ex = Math.cos(a) * Math.cos(b) * r * t, ey = Math.sin(b) * r * t, ez = Math.sin(a) * Math.cos(b) * r * t * 0.5;
      // re-form into a "?" outline (parametric)
      const q = i / 60, qx = q < 0.75 ? Math.cos(Math.PI * (1 - q / 0.75 * 1.5)) * 0.35 : 0, qy = q < 0.75 ? 0.35 + Math.sin(Math.PI * (1 - q / 0.75 * 1.5)) * 0.35 : q < 0.92 ? 0.1 - (q - 0.75) * 2 : -0.45;
      return (<mesh key={i} position={[ex * (1 - back) + qx * back, ey * (1 - back) + qy * back, ez * (1 - back)]} rotation={[a * t * 4, b * t * 4, 0]}>
        <tetrahedronGeometry args={[0.045]} /><meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={1.5 + back * 2} toneMapped={false} /></mesh>);
    })}
  </group>
);

/* ───────────── the shot ───────────── */
export const LieShot = ({spec, beat: beatIn, dur, sec, seed, fpsRatio = 1, calStops = 0, lines = LINES}: {spec: ShotSpec; beat: number; dur: number; sec: number; seed: string; fpsRatio?: number; calStops?: number; lines?: Line[]}) => {
  const sm = spec.slowmo, smLen = sm?.len ?? 18, smRate = sm?.rate ?? 0.3;
  const beat = !sm || beatIn < sm.at ? beatIn : beatIn < sm.at + smLen ? sm.at + (beatIn - sm.at) * smRate : beatIn - smLen * (1 - smRate);
  const k = interpolate(beat, [0, dur], [0, 1], {easing: E, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const camB = camFor(spec, k, beat, seed);
  // A7 punch-in: fov tightens 1.2° on the speaker's stressed words
  const cam0 = spec.cast.some((x) => x.talk) ? {...camB, fov: camB.fov - 1.2 * stressAt(lines.find((l) => l.id === spec.line), sec)} : camB;
  // impact shake (§35.2): 0.03 m, decays e^(−8t) over ~15 beats, two sines at different frequencies
  const sh = spec.shake !== undefined && beat >= spec.shake ? Math.exp(-(spec.shakeKind === 'quake' ? 5 : 8) * (beat - spec.shake) / 30) * ({light: 0.012, hit: 0.03, quake: 0.06}[spec.shakeKind ?? 'hit']) : 0;
  const cam = sh ? {...cam0, pos: [cam0.pos[0] + Math.sin(beat * 2.1) * sh, cam0.pos[1] + Math.sin(beat * 2.9 + 1) * sh * 0.7, cam0.pos[2]] as [number, number, number]} : cam0;
  if (spec.whip) {
    const wo = spec.whip !== 'in' ? Math.max(0, (beat - (dur - 6)) / 6) ** 2 : 0, wi = spec.whip !== 'out' ? Math.max(0, 1 - beat / 6) ** 2 : 0;
    const yawW = (wo - wi) * 38 * deg, dx = cam.target[0] - cam.pos[0], dz = cam.target[2] - cam.pos[2];
    const cs = Math.cos(-yawW), sn = Math.sin(-yawW);
    cam.target = [cam.pos[0] + dx * cs - dz * sn, cam.target[1], cam.pos[2] + dx * sn + dz * cs] as typeof cam.target;
  }
  // D4 emotion light: when a thread breaks in this shot, the key light drains from warm to cold over 1 s
  const brk = (spec.threads ?? []).map((th) => th.then?.state === 'broken' ? th.then.at : th.state === 'broken' && th.at ? th.at : -1).filter((x) => x >= 0)[0];
  const coldK = brk !== undefined ? Math.min(1, Math.max(0, (beat - brk) / 30)) : 0;
  const coldKey = coldK > 0 ? '#' + new Color((LIGHTS[spec.light ?? 'hallway'] ?? LIGHTS.hallway).key).lerp(new Color('#8ea4ff'), coldK * 0.75).getHexString() : undefined;
  const fpA = focusPlan(spec, cam);
  const rk = spec.rack ? Math.min(1, Math.max(0, (beat - spec.rack.at) / 12)) : 0, rke = rk * rk * (3 - 2 * rk);
  const fpB = spec.rack ? focusPlan({...spec, focusOn: spec.rack.to}, cam) : fpA;
  const fp = spec.rack ? {...fpA, focus: fpA.focus + (fpB.focus - fpA.focus) * rke, range: Math.min(fpA.range, fpB.range) * 0.45, meters: fpA.meters + (fpB.meters - fpA.meters) * rke} : fpA;
  if (spec.rack) cam.fov *= 1 + 0.015 * Math.sin(rk * Math.PI);
  const line = lines.find((l) => l.id === spec.line);
  const Set = SETS[spec.set];
  const flick = spec.flicker ? (random('fl' + Math.floor(beat / 3)) > 0.82 ? 0.35 : 1) : 1;
  const setNode = spec.set === 'Hallway' ? <Hallway frame={beat} /> : Set ? <Set {...(spec.setProps ?? {})} {...(spec.set === 'Bathroom' ? {flicker: flick} : {})} /> : null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: weave(sec)}}>
      <Stage cam={cam} focus={fp.focus} focusRange={fp.range} grade={spec.grade} flash={spec.flash ?? 0} exposure={(spec.exposure ?? 1.05) * Math.pow(2, calStops)}>
        <Lights preset={spec.light} keyColor={coldKey} keyPos={spec.keyPos} keyI={spec.keyI ?? ((LIGHTS[spec.light ?? 'hallway'] ?? LIGHTS.hallway).keyI * ({ecu: 0.5, cu: 0.6, mcu: 0.75} as Record<string, number>)[spec.cam.size] || undefined)} subjectDepth={fp.meters} rimPos={(() => { const s = fp.subject as number[], dx = s[0] - cam.pos[0], dz = s[2] - cam.pos[2], n = Math.hypot(dx, dz) || 1;
          return [s[0] + dx / n * 4 + 0.5, 4, s[2] + dz / n * 4] as [number, number, number]; })()} />
        {/* void: every character stands in its own soft pool of light (a dark scene still has a lit subject, CLAUDE.md §57.2 rule 2) */}
        {spec.set === 'Void' && spec.cast.map((c, i) => { const h = headOf(c); return (<group key={'pool' + i}>
          <pointLight position={[h[0] - 0.9, h[1] - 0.25, h[2] + 1.5]} intensity={0.7} distance={3.2} decay={2} color="#ffd2a8" />
          <mesh position={[c.pos[0], 0.004, c.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.9, 40]} /><meshBasicMaterial color="#6a5a9a" transparent opacity={0.22} depthWrite={false} toneMapped={false} /></mesh>
        </group>); })}
        {setNode}
        {spec.dust !== false && <Dust frame={beat} n={FAST ? 30 : 60} />}
        {spec.cast.map((c, i) => {
          // FIX_LIST_V2 #26: a character whose meter lands ≥90% reacts (gulp) unless the shot says otherwise
          const hot = (spec.meters ?? []).some((m) => m.on === i && m.value >= 90 && m.mode !== 'q');
          const cc = hot && !c.react ? {...c, react: 'gulp' as const, reactAt: c.reactAt ?? Math.round(dur * 0.55)} : c;
          const sp = spec.cast.find((x) => x.talk); return <Actor key={i} c={cc} beat={beat} sec={sec} line={line} speaker={sp && sp !== c ? sp.pos : undefined} camPos={cam.pos} />;
        })}
        {/* A18 parallax foreground: in wides/EWS of real sets a dark vertical edge (locker, door frame, plant) sits 0.9 m from the lens at the
            frame edge; the DOF melts it and the camera move slides it fast, which sells depth */}
        {(spec.cam.size === 'wide' || spec.cam.size === 'ews') && spec.set !== 'Void' && (() => {
          const f = [cam.target[0] - cam.pos[0], cam.target[1] - cam.pos[1], cam.target[2] - cam.pos[2]], fl = Math.hypot(...f);
          const fx = f[0] / fl, fz = f[2] / fl, side = random(seed + 'fg') > 0.5 ? 1 : -1, rx = -fz * side, rz = fx * side;
          const p: [number, number, number] = [cam.pos[0] + fx * 0.95 + rx * 0.62, cam.pos[1] - 0.2, cam.pos[2] + fz * 0.95 + rz * 0.62];
          return <mesh position={p} rotation={[0, Math.atan2(fx, fz), 0]}><boxGeometry args={[0.16, 3.2, 0.16]} /><meshStandardMaterial color="#1c1626" roughness={0.7} /></mesh>;
        })()}
        {/* F1 3D title: gold words standing IN the scene (parallax with the camera move), each rising out of the floor glow */}
        {spec.title3d && spec.title3d.words.map((w, i) => {
          const T = spec.title3d!, sz = T.size ?? 0.42, e = Math.min(1, Math.max(0, (beat - 8 - i * 7) / 14)), ee = 1 - Math.pow(1 - e, 3);
          const wd = (ww: string) => sz * 1.3 * ww.length * 0.74, gap = sz * 0.7, tot = T.words.reduce((q, ww) => q + wd(ww), 0) + gap * (T.words.length - 1);
          const x = T.pos[0] - tot / 2 + T.words.slice(0, i).reduce((q, ww) => q + wd(ww) + gap, 0) + wd(w) / 2;
          return <group key={'t3' + i} position={[x, T.pos[1] - 0.25 * (1 - ee), T.pos[2]]} scale={[1, 0.6 + 0.4 * ee, 1]}>
            <Text3 position={[0, 0, 0]} fontSize={sz} color={i === T.words.length - 1 ? '#f2c46b' : '#f5ead2'} opacity={ee * 0.92}>{w}</Text3>
          </group>;
        })}
        {/* C15 ending tapestry: 26 gold threads spool across the sky one after another and weave a net over the city */}
        {spec.net && Array.from({length: 26}).map((_, i) => {
          // anchored to the camera so the net always spans the frame: D m ahead, left half → right half, above the eye line
          const cn = camFor(spec, 0.5, 0, seed);   // fixed mid-shot camera: the net stays put in the world, so the orbit gives parallax
          const f0 = [cn.target[0] - cn.pos[0], 0, cn.target[2] - cn.pos[2]], fn = Math.hypot(f0[0], f0[2]), fx = f0[0] / fn, fz = f0[2] / fn;
          const P = (side: number, d: number, up: number): [number, number, number] => [cn.pos[0] + fx * d - fz * side, cn.pos[1] + up, cn.pos[2] + fz * d + fx * side];
          const D = 9 + random('nc' + i) * 5;
          const a = P(-(1.5 + random('na' + i) * 7), D, 0.1 + random('nb' + i) * 2.2), b = P(1.5 + random('nd' + i) * 7, D + (random('nf' + i) - 0.5) * 3, 0.1 + random('ne' + i) * 2.2);
          const at = 6 + i * 3.2;
          return beat >= at ? <Thread key={'net' + i} from={a} to={b} state="fresh" t={(beat - at) / 30} thickness={0.007} seed={'net' + i} light={false} /> : null;
        })}
        {/* E2 background extras: two students walk along the lockers in hallway shots (16-beat step cycle) */}
        {spec.set === 'Hallway' && !spec.cast.some((c) => c.enter || c.name) && [0, 1].map((k) => {
          const tt = sec + k * 4.3, dir = k ? -1 : 1, ph = (tt * 0.11 + random(seed + 'ex' + k)) % 1, x = dir * (-6 + ph * 12), sw = Math.sin(tt * Math.PI * 2 * 1.8);
          return <Pill key={'ex' + k} id={'extra' + k} frame={beat} position={[x, Math.abs(sw) * 0.03, -2.62 + k * 0.1]} rotY={dir * Math.PI / 2} hoodie={k ? '#6a5a9a' : '#8a5a3c'}
            hat={k ? 'cap' : 'bob'} scale={0.94} legSwing={sw * 0.42} armLx={sw * 0.45} armRx={-sw * 0.45} />;
        })}
        {spec.mirror && <>
          <BathroomReflection />
          {spec.cast.filter((c) => c.who === 'hero').map((c, i) => <Actor key={'m' + i} c={c} beat={beat} sec={sec} line={line} mirrored />)}
        </>}
        {(spec.threads ?? []).map((th, i) => {
          const end = (v: number | [number, number, number] | undefined, f: 'w' | 'c'): [number, number, number] =>
            typeof v === 'number' ? (f === 'w' ? wristR(spec.cast[v]) : chestOf(spec.cast[v])) : (v ?? [0, 1, 0]);
          const a = end(th.from, 'w');
          if (th.swarm) return beat >= (th.at ?? 0) ? <ThreadSwarm key={'t' + i} from={a} n={th.swarm} t={sec} seed={seed + 'sw' + i} grey={th.grey ?? 0.85} xray={th.xray} camPos={cam.pos as V3} faces={[...spec.cast.map(headOf), ...(spec.mirror ? spec.cast.filter((c) => c.who === 'hero').map((c) => { const h = headOf(c); return [h[0], h[1], 2 * MIRROR_Z - h[2]] as V3; }) : [])]} /> : null;
          const late = th.then && beat >= th.then.at;
          const st = late ? th.then!.state : th.state, t0 = late ? th.then!.at : th.at ?? 0;
          if (beat < t0 && st === 'fresh') return null;
          return <Thread key={'t' + i} from={a} to={end(th.to, 'c')} state={st} t={Math.max(0, beat - t0) / 30} thickness={th.thick ?? 0.01} seed={seed + 'th' + i} light={i < 3} camPos={cam.pos as [number, number, number]} />;
        })}
        {spec.extra === 'bus' && <Bus k={k} />}
        {spec.extra === 'door' && <Door k={k} />}
        {spec.extra === 'shards' && <Shards k={k} />}
        {spec.extra === 'cereal' && <group position={[0.4, 0.95, -2.45]} rotation={[0, -0.25, 0]}><CerealBox /></group>}
        {spec.extra === 'jar' && <group position={[-0.78, 0.79, -0.45]}><CookieJar /></group>}
        {spec.extra === 'phoneDesk' && <group position={[0.55, 0.64, -2.32]} rotation={[-1.2, 0, 0]}><Phone text="5 MORE MIN?" /></group>}
      </Stage>
      </AbsoluteFill>
      <FilmLook sec={sec} grade={spec.grade} />
      {(spec.meters ?? []).map((m, i) => {
        const p = typeof m.on === 'number' ? headOf(spec.cast[m.on]) : m.on;
        const top: [number, number, number] = [p[0], p[1] + 0.62 * (typeof m.on === 'number' ? CAST[spec.cast[m.on].who].scale : 1), p[2]];
        const mp: [number, number, number] = m.mode === 'mirror' ? [top[0], top[1], 2 * MIRROR_Z - top[2]] : top;
        const a0 = projectCam(cam, mp), anc = projectCam(cam, m.mode === 'mirror' ? [p[0], p[1] + 0.45, 2 * MIRROR_Z - p[2]] : [p[0], p[1] + 0.45, p[2]]);
        const hc = projectCam(cam, m.mode === 'mirror' ? [p[0], p[1], 2 * MIRROR_Z - p[2]] : p);
        const a = a0.y > 200 && a0.visible ? a0 : {x: hc.x + (hc.x > W * 0.6 ? -330 : 330), y: Math.max(230, hc.y - 60)};
        const st = line ? Math.max(0, (line.start - (sec - beat / 30)) * 30) : 0;
        const en = line ? (line.end - (sec - beat / 30)) * 30 : dur * 0.8;
        const start = (m.delay ?? 0) + Math.min(st, dur * 0.3), land = Math.min(dur - 12, Math.max(en, start + 20));
        return (<React.Fragment key={i}>
          <LieMeter beat={beat} start={start} land={land} x={a.x} y={a.y}
            anchor={anc} value={m.value} from={m.from ?? 0} label={m.label ?? 'LIE'} mode={m.mode ?? 'normal'} small={m.small} dur={dur} />
          {/* meter sound design (§8): pop on appear, tick on land, buzz > 90, success at 0 */}
          <Sequence from={Math.round(start * fpsRatio)} layout="none"><Audio src={staticFile('sfx/pop_small.wav')} volume={m.small ? 0.18 : 0.32} playbackRate={1 + i * 0.05} /></Sequence>
          {m.mode !== 'q' && m.mode !== 'fade' && m.from !== m.value && <Sequence from={Math.round(land * fpsRatio)} layout="none">
            <Audio src={staticFile(m.value >= 90 ? 'sfx/fail_buzz.wav' : m.value === 0 ? 'sfx/success.wav' : 'sfx/tick.wav')} volume={m.value >= 90 ? 0.22 : m.small ? 0.2 : 0.35} />
          </Sequence>}
        </React.Fragment>);
      })}
      {spec.extra === 'orbitMeters' && Array.from({length: 8}).map((_, i) => {
        // 8 meters on one ring, evenly spaced; screen positions kept out of the face zone and caption lane (§54.4)
        const ang = (i / 8) * Math.PI * 2 + beat * 0.015;
        const p = projectCam(cam, [Math.cos(ang) * 2.1, 1.35 + Math.sin(ang * 2) * 0.35, Math.sin(ang) * 2.1]);
        const head = projectCam(cam, [0, 1.42, 0]);
        const tooClose = Math.hypot(p.x - head.x, p.y - head.y) < 200;
        const v = Math.round(random('om' + i) * 100);
        return p.visible && !tooClose && p.y < H - 260 ? <LieMeter key={'o' + i} beat={beat} start={i * 4} land={i * 4 + 25} x={p.x} y={p.y} value={v} small dur={dur} /> : null;
      })}
      {spec.cast.map((c, i) => {
        if (!c.name) return null;
        const h = projectCam(cam, headOf(c)), side = h.x > W * 0.62 ? -1 : 1;
        const op = Math.min(ease(beat, [10, 20], [0, 1]), ease(beat, [Math.min(dur - 14, 96), Math.min(dur - 4, 106)], [1, 0]));
        const x = Math.max(60, Math.min(W - 360, h.x + side * 190 - (side < 0 ? 300 : 0))), y = Math.max(220, Math.min(H - 330, h.y + 150));
        return (<div key={'nm' + i} style={{position: 'absolute', left: x, top: y, opacity: op, transform: `translateX(${(1 - op) * side * -16}px)`}}>
          <div style={{width: Math.round(60 * op) + 'px', height: 2, background: C.gold, boxShadow: '0 0 10px rgba(242,196,107,.6)', marginBottom: 8}} />
          <div style={{fontFamily: 'Cinzel', fontWeight: 700, fontSize: 44, letterSpacing: '0.18em', color: C.cream, textShadow: '0 2px 12px rgba(0,0,0,.85), 0 0 18px rgba(242,196,107,.35)'}}>{c.name}</div>
        </div>);
      })}
      {(spec.whip === 'out' || spec.whip === 'both') && <WhipStreak beat={beat - dur} len={6} />}
      {(spec.whip === 'in' || spec.whip === 'both') && <WhipStreak beat={beat} len={6} />}
      {/* F6 callout: a hand-drawn gold arrow draws itself (pathLength) to a 3D point, with a small Cinzel label */}
      {spec.callout && (() => {
        const co = spec.callout!, p = projectCam(cam, co.at), b0 = co.from ?? 24;
        const e = Math.min(1, Math.max(0, (beat - b0) / 15)), out = Math.min(1, Math.max(0, (dur - 10 - beat) / 8)), side = p.x > W / 2 ? -1 : 1;
        const lx = p.x + side * 260, ly = Math.max(190, p.y - 170);
        const d = `M ${lx} ${ly + 26} Q ${(lx + p.x) / 2 + side * 40} ${ly - 30}, ${p.x + side * 16} ${p.y - 14}`;
        return (<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: out}}>
          <path d={d} fill="none" stroke="#f2c46b" strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - e} style={{filter: 'drop-shadow(0 0 6px rgba(242,196,107,.6))'}} />
          {e > 0.95 && <path d={`M ${p.x + side * 16} ${p.y - 14} l ${side * 14} -4 M ${p.x + side * 16} ${p.y - 14} l ${side * 6} -14`} stroke="#f2c46b" strokeWidth={3} strokeLinecap="round" />}
          <text x={lx} y={ly} textAnchor={side > 0 ? 'start' : 'end'} fontFamily="Cinzel" fontWeight={700} fontSize={30} letterSpacing="0.16em" fill="#f5ead2" opacity={Math.min(1, e * 1.6)} style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.8))'}}>{co.text}</text>
        </svg>);
      })()}
      {spec.tag && <Tag text={spec.tag} frame={beat} start={4} out={dur - 10} />}
      {spec.title && <div style={{position: 'absolute', inset: 0, transform: `translateX(${(0.5 - k) * 36}px)`}}><Title words={spec.title.words} frame={beat} start={6} y={spec.title.y ?? 0.2} size={spec.title.size ?? 76} emphasis={spec.title.emph ?? []} out={dur - 12} /></div>}
    </AbsoluteFill>
  );
};
