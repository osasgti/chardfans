/**
 * Lie-meter shot engine: turns a ShotSpec (data) into a rendered shot.
 * Camera language (CLAUDE.md §36.2): shot size → lens + distance; one primary move + handheld drift.
 */
import React from 'react';
import {AbsoluteFill, interpolate, Easing, random, Audio, Sequence, staticFile} from 'remotion';
import {PerspectiveCamera, Vector3} from 'three';
import {Stage, Lights, handheld, Cam, FAST} from '../three/Stage';
import {Pill, Hair} from '../three/Pill';
import type {Expr} from '../three/Face';
import {Hallway, Dust} from '../three/Set';
import {SETS, Phone, Card, CookieJar, CerealBox, MIRROR_Z, BathroomReflection} from '../three/LieSets';
import {Tag, Title} from '../overlay/Overlays';
import {C, W, H, ease, focusFor, NEAR, FAR} from '../style/tokens';
import {LieMeter} from './LieMeter';
import timeline from './timeline.json';

export type Line = {id: string; act: string; text: string; start: number; end: number; audio: string | null; words: {text: string; start: number; end: number}[]};
export const LINES = timeline.lines as Line[];
export const TOTAL = timeline.total as number;
export const lineById = (id: string) => LINES.find((l) => l.id === id)!;

/* ───────────── cast ───────────── */
export type Who = 'hero' | 'mom' | 'brother' | 'maya' | 'dad' | 'teacher' | 'lucky' | 'dealer' | 'driver' | 'kidA' | 'kidB' | 'kidC' | 'kidD' | 'girl' | 'fig';
type Look = {hoodie: string; hair: Hair; hairColor: string; glasses?: boolean; scale: number; expr: Expr};
export const CAST: Record<Who, Look> = {
  hero:    {hoodie: '#c8323a', hair: 'beanie',   hairColor: '#1b1622', scale: 1,    expr: 'smug'},
  mom:     {hoodie: '#d29a2d', hair: 'bun',      hairColor: '#4a2e20', scale: 1.1,  expr: 'happy'},
  brother: {hoodie: '#3d6fd6', hair: 'capBack',  hairColor: '#2f8f8a', scale: 0.8,  expr: 'neutral'},
  maya:    {hoodie: '#2f8f8a', hair: 'ponytail', hairColor: '#2a1a12', scale: 0.98, expr: 'neutral'},
  dad:     {hoodie: '#6b6f7a', hair: 'none',     hairColor: '#000',    scale: 1.12, expr: 'worried', glasses: true},
  teacher: {hoodie: '#8a6fb0', hair: 'bob',      hairColor: '#3a2418', scale: 1.08, expr: 'bored'},
  lucky:   {hoodie: '#2f8f8a', hair: 'capBack',  hairColor: '#c8323a', scale: 1,    expr: 'happy'},
  dealer:  {hoodie: '#1b1622', hair: 'visor',    hairColor: '#2f8f8a', scale: 1.05, expr: 'smug'},
  driver:  {hoodie: '#3f5466', hair: 'cap',      hairColor: '#1b1622', scale: 1.1,  expr: 'happy'},
  kidA:    {hoodie: '#d29a2d', hair: 'cap',      hairColor: '#3d6fd6', scale: 0.97, expr: 'neutral'},
  kidB:    {hoodie: '#c84a8a', hair: 'bob',      hairColor: '#2a1a12', scale: 0.95, expr: 'happy'},
  kidC:    {hoodie: '#5aa05a', hair: 'none',     hairColor: '#000',    scale: 1.02, expr: 'neutral', glasses: true},
  kidD:    {hoodie: '#e07a3a', hair: 'beanie',   hairColor: '#3b2d5c', scale: 0.99, expr: 'neutral'},
  girl:    {hoodie: '#e35d8f', hair: 'ponytail', hairColor: '#6e4630', scale: 0.96, expr: 'neutral'},
  fig:     {hoodie: '#55506a', hair: 'none',     hairColor: '#000',    scale: 1,    expr: 'neutral'},
};
export type Pose = 'idle' | 'cheer' | 'point' | 'phone' | 'sit' | 'sleep' | 'slump' | 'hold' | 'shrug' | 'run';
export type Prop = 'phone' | 'phoneText' | 'card' | 'cookie' | 'pan';
export type CastSpec = {who: Who; id?: string; pos: [number, number]; rot?: number; expr?: Expr; pose?: Pose; talk?: boolean; hold?: Prop; turn?: number; tilt?: number; y?: number};

/** head centre in world space (used by camera + meter) */
export const headOf = (c: CastSpec): [number, number, number] => {
  const s = CAST[c.who].scale;
  if (c.pose === 'sleep') return [c.pos[0], 0.7, c.pos[1] - 1.53 * s];
  const sit = c.pose === 'sit' ? -0.28 : 0;
  return [c.pos[0], (c.y ?? 0) + sit + 1.53 * s, c.pos[1]];
};

/* ───────────── shot spec ───────────── */
export type Size = 'ecu' | 'cu' | 'mcu' | 'med' | 'wide' | 'ews';
export type Move = 'push' | 'pull' | 'orbitL' | 'orbitR' | 'crane' | 'drop' | 'lock' | 'dz' | 'truck' | 'snap';
export type MeterSpec = {on: number | [number, number, number]; value: number; label?: string; mode?: 'normal' | 'mirror' | 'q' | 'fire' | 'fade'; delay?: number; from?: number; small?: boolean};
export type ShotSpec = {
  line: string; w?: number; set: string; setProps?: Record<string, unknown>; light: string; grade: string; keyPos?: [number, number, number];
  cam: {on: number | [number, number, number]; size: Size; yaw?: number; pitch?: number; move?: Move; amount?: number};
  cast: CastSpec[]; meters?: MeterSpec[]; tag?: string; title?: {words: string[]; emph?: number[]; y?: number; size?: number};
  dust?: boolean; extra?: string; flash?: number; exposure?: number; mirror?: boolean; flicker?: boolean;
};

const SIZE: Record<Size, [number, number]> = {ecu: [1.5, 20], cu: [2.4, 24], mcu: [3.2, 28], med: [4.4, 32], wide: [7.2, 38], ews: [11, 42]};
const deg = Math.PI / 180;
const E = Easing.bezier(0.45, 0, 0.2, 1);

export const camFor = (spec: ShotSpec, k: number, beat: number, seed: string): Cam => {
  const {cam} = spec;
  const S = typeof cam.on === 'number' ? headOf(spec.cast[cam.on]) : cam.on;
  const [d0, f0] = SIZE[cam.size];
  let d = d0, fov = f0, yaw = (cam.yaw ?? 0) * deg, pitch = (cam.pitch ?? 4) * deg, lift = 0;
  const a = cam.amount ?? 1;
  switch (cam.move ?? 'push') {
    case 'push': d = d0 * (1 - 0.16 * a * k); break;
    case 'pull': d = d0 * (0.86 + 0.18 * a * k); break;
    case 'orbitL': yaw += 14 * a * deg * k; break;
    case 'orbitR': yaw -= 14 * a * deg * k; break;
    case 'crane': pitch += (-14 + 20 * k) * a * deg; lift = -0.3 * (1 - k); break;
    case 'drop': pitch += (22 - 18 * k) * a * deg; break;
    case 'truck': yaw += (-10 + 20 * k) * a * deg; d = d0 * 1.05; break;
    case 'snap': { const s = interpolate(k, [0, 0.12, 1], [0, 1, 1], {extrapolateRight: 'clamp'}); d = d0 * (1 - 0.25 * s); break; }
    case 'dz': { // dolly-zoom: pull back while narrowing fov so the subject stays the same size
      const dd = d0 * (0.85 + 0.6 * k); fov = 2 * Math.atan(Math.tan((f0 * deg) / 2) * (d0 * 0.85) / dd) / deg; d = dd; break; }
    case 'lock': break;
  }
  const pos: [number, number, number] = [S[0] + d * Math.sin(yaw) * Math.cos(pitch), S[1] + lift + d * Math.sin(pitch), S[2] + d * Math.cos(yaw) * Math.cos(pitch)];
  return handheld({pos, target: [S[0], S[1] - 0.04, S[2]], fov}, beat, seed);
};

/** pure-math projection with a given camera (no render-order dependence) */
export const projectCam = (cam: Cam, p: [number, number, number]) => {
  const c = new PerspectiveCamera(cam.fov, W / H, NEAR, FAR);
  c.position.set(...cam.pos); c.lookAt(new Vector3(...cam.target)); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = new Vector3(...p).project(c);
  return {x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, visible: v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15};
};

/* ───────────── speaking / poses ───────────── */
const mouthAt = (line: Line | undefined, sec: number) => {
  if (!line) return 0;
  const w = line.words.find((x) => sec >= x.start && sec < x.end);
  if (!w) return 0;
  const p = (sec - w.start) / Math.max(0.05, w.end - w.start);
  return Math.sin(p * Math.PI) * (0.55 + 0.45 * random(w.text + w.start));
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

export const Actor = ({c, beat, sec, line, mirrored = false}: {c: CastSpec; beat: number; sec: number; line?: Line; mirrored?: boolean}) => {
  const L = CAST[c.who]; const id = c.id ?? c.who;
  const s = L.scale; const sit = c.pose === 'sit' ? -0.28 : 0; const sleep = c.pose === 'sleep';
  const mouth = c.talk ? mouthAt(line, sec) : 0;
  const z = mirrored ? 2 * MIRROR_Z - c.pos[1] : c.pos[1];
  const rotY = ((c.rot ?? 0) * deg) * (mirrored ? -1 : 1) + (mirrored ? Math.PI : 0);
  const run = c.pose === 'run' ? Math.abs(Math.sin(beat / 30 * 12)) * 0.05 : 0;
  const body = (
    <Pill id={id} frame={beat} position={sleep ? [0, 0, 0] : [c.pos[0], (c.y ?? 0) + sit + run, z]} rotY={sleep ? 0 : rotY}
      hoodie={L.hoodie} hat={L.hair} hatColor={L.hairColor} glasses={L.glasses} expr={c.expr ?? L.expr} scale={s}
      headTurn={(c.turn ?? 0) * deg + (c.talk ? Math.sin(beat / 30 * 2.3) * 0.04 : 0)} headTilt={(c.tilt ?? 0) * deg}
      mouth={mouth} {...poseArgs(c.pose, beat, id)} rightHand={<PropMesh p={c.hold} text={c.hold === 'phoneText' ? 'we\'re good, right?' : undefined} />}
      look={c.talk ? 0 : Math.round(Math.sin(beat / 30 * 0.7 + random(id) * 9)) * 5} />
  );
  if (sleep) return <group position={[c.pos[0], 0.62, c.pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>{body}</group>;
  return mirrored ? <group scale={[-1, 1, 1]}>{body}</group> : body;
};

/* ───────────── special extras ───────────── */
const Bus = ({k}: {k: number}) => (
  <group position={[-3 + 14 * Math.max(0, k - 0.45) ** 1.6 * 2.2, 0, 1.6]}>
    <mesh position={[0, 1.3, 0]} castShadow><boxGeometry args={[6, 2.2, 2.2]} /><meshStandardMaterial color="#f2b134" roughness={0.6} /></mesh>
    {Array.from({length: 5}).map((_, i) => <mesh key={i} position={[-2.2 + i * 1.1, 1.7, 1.11]}><planeGeometry args={[0.9, 0.7]} /><meshStandardMaterial color="#9fc4ff" emissive="#9fc4ff" emissiveIntensity={0.6} /></mesh>)}
    {[-2, 2].map((x) => <mesh key={x} position={[x, 0.35, 1.0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.35, 0.35, 0.3, 20]} /><meshStandardMaterial color="#111" /></mesh>)}
  </group>
);
const Door = ({k}: {k: number}) => (
  <group position={[0, 0, -0.6]}>
    <mesh position={[0, 1.1, -0.05]}><boxGeometry args={[1.2, 2.3, 0.08]} /><meshStandardMaterial color="#3b2d5c" roughness={0.8} /></mesh>
    <mesh position={[0, 1.05, 0]}><planeGeometry args={[0.9, 2.1]} /><meshStandardMaterial color="#ffd9a0" emissive="#ffcf8f" emissiveIntensity={3} toneMapped={false} /></mesh>
    <group position={[-0.45, 0, 0.02]} rotation={[0, -0.9 * ease(k, [0.35, 1], [0, 1]), 0]}>
      <mesh position={[0.45, 1.05, 0]} castShadow><boxGeometry args={[0.9, 2.1, 0.05]} /><meshStandardMaterial color="#6e4630" roughness={0.6} /></mesh>
    </group>
    <mesh position={[0, 0.004, 0.6]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.9, 1.2 * ease(k, [0.35, 1], [0.1, 1])]} /><meshBasicMaterial color="#ffcf8f" transparent opacity={0.35} toneMapped={false} /></mesh>
  </group>
);
const Shards = ({k}: {k: number}) => (
  <group position={[0, 2.25, 0]}>
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
export const LieShot = ({spec, beat, dur, sec, seed, fpsRatio = 1, calStops = 0}: {spec: ShotSpec; beat: number; dur: number; sec: number; seed: string; fpsRatio?: number; calStops?: number}) => {
  const k = interpolate(beat, [0, dur], [0, 1], {easing: E, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cam = camFor(spec, k, beat, seed);
  const S = typeof spec.cam.on === 'number' ? headOf(spec.cast[spec.cam.on]) : spec.cam.on;
  const focus = focusFor(Math.hypot(cam.pos[0] - S[0], cam.pos[1] - S[1], cam.pos[2] - S[2]));
  const line = LINES.find((l) => l.id === spec.line);
  const Set = SETS[spec.set];
  const flick = spec.flicker ? (random('fl' + Math.floor(beat / 3)) > 0.82 ? 0.35 : 1) : 1;
  const setNode = spec.set === 'Hallway' ? <Hallway /> : Set ? <Set {...(spec.setProps ?? {})} {...(spec.set === 'Bathroom' ? {flicker: flick} : {})} /> : null;
  return (
    <AbsoluteFill>
      <Stage cam={cam} focus={focus} grade={spec.grade} flash={spec.flash ?? 0} exposure={(spec.exposure ?? 1.05) * Math.pow(2, calStops)}>
        <Lights preset={spec.light} keyPos={spec.keyPos} keyI={spec.flicker ? undefined : undefined} />
        {setNode}
        {spec.dust !== false && <Dust frame={beat} n={FAST ? 30 : 60} />}
        {spec.cast.map((c, i) => <Actor key={i} c={c} beat={beat} sec={sec} line={line} />)}
        {spec.mirror && <>
          <BathroomReflection />
          {spec.cast.filter((c) => c.who === 'hero').map((c, i) => <Actor key={'m' + i} c={c} beat={beat} sec={sec} line={line} mirrored />)}
        </>}
        {spec.extra === 'bus' && <Bus k={k} />}
        {spec.extra === 'door' && <Door k={k} />}
        {spec.extra === 'shards' && <Shards k={k} />}
        {spec.extra === 'cereal' && <group position={[0.4, 0.95, -2.45]} rotation={[0, -0.25, 0]}><CerealBox /></group>}
        {spec.extra === 'jar' && <group position={[-0.35, 0.79, 0.05]}><CookieJar /></group>}
        {spec.extra === 'phoneDesk' && <group position={[0.55, 0.64, -2.32]} rotation={[-1.2, 0, 0]}><Phone text="5 MORE MIN?" /></group>}
      </Stage>
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
      {spec.extra === 'orbitMeters' && Array.from({length: 14}).map((_, i) => {
        const ang = (i / 14) * Math.PI * 2 + beat * 0.02, r = 1.6 + (i % 3) * 0.35;
        const p = projectCam(cam, [Math.cos(ang) * r, 1.3 + Math.sin(i * 1.7) * 0.6, Math.sin(ang) * r]);
        const v = Math.round(random('om' + i) * 100);
        return p.visible ? <LieMeter key={'o' + i} beat={beat} start={i * 3} land={i * 3 + 25} x={p.x} y={p.y} value={v} small dur={dur} /> : null;
      })}
      {spec.tag && <Tag text={spec.tag} frame={beat} start={4} out={dur - 10} />}
      {spec.title && <Title words={spec.title.words} frame={beat} start={6} y={spec.title.y ?? 0.2} size={spec.title.size ?? 76} emphasis={spec.title.emph ?? []} out={dur - 12} />}
    </AbsoluteFill>
  );
};
