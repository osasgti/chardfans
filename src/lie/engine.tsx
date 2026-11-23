/**
 * Lie-meter shot engine: turns a ShotSpec (data) into a rendered shot.
 * Camera language (CLAUDE.md §36.2): shot size → lens + distance; one primary move + handheld drift.
 */
import {RB} from '../three/RB';
import React from 'react';
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
  cam: {on: number | [number, number, number]; size: Size; yaw?: number; pitch?: number; move?: Move; amount?: number};
  cast: CastSpec[]; meters?: MeterSpec[]; tag?: string; title?: {words: string[]; emph?: number[]; y?: number; size?: number};
  dust?: boolean; extra?: string; threads?: ThreadSpec[]; shake?: number; shakeKind?: 'light' | 'hit' | 'quake'; slowmo?: {at: number; len?: number; rate?: number}; focusOn?: number | V3; intent?: string[]; flash?: number; exposure?: number; mirror?: boolean; flicker?: boolean;
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
    case 'phone': return {armL: 0.15, armR: 2.55};
    case 'hold': return {armL: 0.15, armR: 0.9};
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

export const Actor = ({c, beat, sec, line, mirrored = false, speaker}: {c: CastSpec; beat: number; sec: number; line?: Line; mirrored?: boolean; speaker?: [number, number]}) => {
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
  const bob = (c.talk ? 0.012 * talkW * Math.abs(Math.sin(t * 6 + ph)) + 0.02 * st : 0.006 * Math.sin(t * 1.4 + ph));
  const body = (
    <Pill id={id} frame={beat} position={sleep ? [0, 0, 0] : [c.pos[0] + wx, (c.y ?? 0) + sit + run + R.dy + (sleep ? 0 : bob) + Math.abs(wsw) * 0.035, z]} rotY={sleep ? 0 : rotY}
      hoodie={L.hoodie} hat={L.hair} hatColor={L.hairColor} glasses={L.glasses} expr={c.expr ?? L.expr} scale={s}
      headTurn={(c.turn ?? 0) * deg + R.headTurn + (!c.talk && speaker && !sleep ? Math.max(-0.55, Math.min(0.55, (Math.atan2(speaker[0] - c.pos[0], speaker[1] - c.pos[1]) - (c.rot ?? 0) * deg) * 0.5)) * Math.min(1, Math.max(0, (beat - 6) / 12)) : 0) + (c.talk ? Math.sin(beat / 30 * 2.3) * 0.04 : 0)} squash={R.squash + st * 0.04} lean={R.lean + (c.talk ? st * 0.06 : 0.025 * Math.sin(t * 0.6 + ph))} turnLag={(reactAt(c.react, beat - 4, c.reactAt).headTurn - R.headTurn) + (c.talk ? (Math.sin((beat - 4) / 30 * 2.3) - Math.sin(beat / 30 * 2.3)) * 0.04 : 0)} headTilt={(c.tilt ?? 0) * deg + R.headTilt} nod={st * 0.06} brow={Math.max(st, c.talk && line?.text.trim().endsWith('?') ? 0.6 : 0)}
      mouth={mouth} armL={base.armL + R.armL} armR={base.armR + R.armR} legSwing={wsw * 0.45} armLx={wsw * 0.5 + R.armLx + (free && c.talk ? st * 0.35 : 0)} armRx={-wsw * 0.5 + R.armRx + (free ? gest * 0.4 : 0)} rightHand={<PropMesh p={c.hold} text={c.hold === 'phoneText' ? 'we\'re good, right?' : undefined} />}
      look={c.talk ? Math.round(Math.sin(t * 0.9 + ph)) * 2 : Math.round(Math.sin(t * 0.7 + random(id) * 9) * 1.4) * 5} />
  );
  if (sleep) return <group position={[c.pos[0], 0.62, c.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>{body}</group>;
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
  const fp = focusPlan(spec, cam);
  const line = lines.find((l) => l.id === spec.line);
  const Set = SETS[spec.set];
  const flick = spec.flicker ? (random('fl' + Math.floor(beat / 3)) > 0.82 ? 0.35 : 1) : 1;
  const setNode = spec.set === 'Hallway' ? <Hallway frame={beat} /> : Set ? <Set {...(spec.setProps ?? {})} {...(spec.set === 'Bathroom' ? {flicker: flick} : {})} /> : null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: weave(sec)}}>
      <Stage cam={cam} focus={fp.focus} focusRange={fp.range} grade={spec.grade} flash={spec.flash ?? 0} exposure={(spec.exposure ?? 1.05) * Math.pow(2, calStops)}>
        <Lights preset={spec.light} keyPos={spec.keyPos} keyI={spec.keyI} subjectDepth={fp.meters} />
        {/* void: every character stands in its own soft pool of light (a dark scene still has a lit subject, CLAUDE.md §57.2 rule 2) */}
        {spec.set === 'Void' && spec.cast.map((c, i) => { const h = headOf(c); return (<group key={'pool' + i}>
          <pointLight position={[h[0] - 0.9, h[1] + 0.3, h[2] + 1.4]} intensity={1.3} distance={3.2} decay={2} color="#ffd2a8" />
          <mesh position={[c.pos[0], 0.004, c.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.9, 40]} /><meshBasicMaterial color="#6a5a9a" transparent opacity={0.22} depthWrite={false} toneMapped={false} /></mesh>
        </group>); })}
        {setNode}
        {spec.dust !== false && <Dust frame={beat} n={FAST ? 30 : 60} />}
        {spec.cast.map((c, i) => {
          // FIX_LIST_V2 #26: a character whose meter lands ≥90% reacts (gulp) unless the shot says otherwise
          const hot = (spec.meters ?? []).some((m) => m.on === i && m.value >= 90 && m.mode !== 'q');
          const cc = hot && !c.react ? {...c, react: 'gulp' as const, reactAt: c.reactAt ?? Math.round(dur * 0.55)} : c;
          const sp = spec.cast.find((x) => x.talk); return <Actor key={i} c={cc} beat={beat} sec={sec} line={line} speaker={sp && sp !== c ? sp.pos : undefined} />;
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
      {spec.tag && <Tag text={spec.tag} frame={beat} start={4} out={dur - 10} />}
      {spec.title && <Title words={spec.title.words} frame={beat} start={6} y={spec.title.y ?? 0.2} size={spec.title.size ?? 76} emphasis={spec.title.emph ?? []} out={dur - 12} />}
    </AbsoluteFill>
  );
};
