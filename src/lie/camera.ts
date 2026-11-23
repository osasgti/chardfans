/**
 * Pure camera / cast / focus maths shared by the renderer (engine.tsx) and the shot auditor (scripts/audit_shots.mjs).
 * No React, no three.js scene objects: everything here is deterministic numbers, so the audit measures exactly what renders.
 */
import {random} from 'remotion';
import {PerspectiveCamera, Vector3} from 'three';
import type {Hair} from '../three/Pill';
import type {Expr} from '../three/Face';
import type {Reaction} from './reactions';

export const W = 1920, H = 1080, NEAR = 0.1, FAR = 40;
export const MIRROR_Z = -1.2;
export const deg = Math.PI / 180;
export type V3 = [number, number, number];
export type Cam = {pos: V3; target: V3; fov: number; roll?: number};

/* ───────────── cast ───────────── */
export type Who = 'hero' | 'mom' | 'brother' | 'maya' | 'dad' | 'teacher' | 'lucky' | 'dealer' | 'driver' | 'kidA' | 'kidB' | 'kidC' | 'kidD' | 'girl' | 'fig' | 'young' | 'grandma';
export type Look = {hoodie: string; hair: Hair; hairColor: string; glasses?: boolean; scale: number; expr: Expr};
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
  young:   {hoodie: '#c8323a', hair: 'none',     hairColor: '#000',    scale: 0.7,  expr: 'happy'},
  grandma: {hoodie: '#9a6fb0', hair: 'bun',      hairColor: '#cfc8d8', scale: 1.0,  expr: 'happy', glasses: true},
  fig:     {hoodie: '#55506a', hair: 'none',     hairColor: '#000',    scale: 1,    expr: 'neutral'},
};
export type Pose = 'idle' | 'cheer' | 'point' | 'phone' | 'sit' | 'sleep' | 'slump' | 'hold' | 'shrug' | 'run';
export type Prop = 'phone' | 'phoneText' | 'card' | 'cookie' | 'pan';
export type CastSpec = {who: Who; id?: string; pos: [number, number]; rot?: number; expr?: Expr; pose?: Pose; talk?: boolean; hold?: Prop; turn?: number; tilt?: number; y?: number; react?: Reaction; reactAt?: number; enter?: [number, number]; enterLen?: number; name?: string; exprAt?: {at: number; to: Expr}};

/** Thread anchors (WHAT_IF_PROMISE_THREADS §6.2): same maths as Pill.tsx (arm pivot (±0.27, 0.93), hand 0.5 down the arm). */
const toWorld = (c: CastSpec, lx: number, ly: number, lz: number): V3 => {
  const s = CAST[c.who].scale, r = (c.rot ?? 0) * deg, x = lx * s, y = ly * s, z = lz * s;
  return [c.pos[0] + x * Math.cos(r) + z * Math.sin(r), (c.y ?? 0) + y, c.pos[1] - x * Math.sin(r) + z * Math.cos(r)];
};
export const wristR = (c: CastSpec, armR = 0.15): V3 => {
  const th = 0.12 + armR;
  return toWorld(c, 0.27 + 0.5 * Math.sin(th), 0.93 - 0.5 * Math.cos(th), 0.04);
};
export const chestOf = (c: CastSpec): V3 => toWorld(c, 0, 0.8, 0.2);
/** head centre in world space */
export const headOf = (c: CastSpec): V3 => {
  const s = CAST[c.who].scale;
  if (c.pose === 'sleep') return [c.pos[0], 0.7, c.pos[1] - 1.53 * s];
  const sit = c.pose === 'sit' ? -0.28 : 0;
  return [c.pos[0], (c.y ?? 0) + sit + 1.53 * s, c.pos[1]];
};
export const mirrorOf = (p: V3): V3 => [p[0], p[1], 2 * MIRROR_Z - p[2]];

/* ───────────── camera ───────────── */
export type Size = 'ecu' | 'cu' | 'mcu' | 'med' | 'wide' | 'ews';
export type Move = 'push' | 'pull' | 'orbitL' | 'orbitR' | 'crane' | 'drop' | 'lock' | 'dz' | 'truck' | 'snap';
export type CamSpec = {on: number | V3; size: Size; yaw?: number; pitch?: number; move?: Move; amount?: number};
/** what a shot must provide for camera + focus maths (ShotSpec in engine.tsx is a superset) */
/** intent: audit exceptions that are deliberate ('back' = subject seen from behind) */
export type ShotGeom = {cam: CamSpec; cast: CastSpec[]; mirror?: boolean; focusOn?: number | V3; intent?: string[]};

export const SIZE: Record<Size, [number, number]> = {ecu: [1.5, 20], cu: [3.4, 24], mcu: [3.6, 28], med: [4.4, 32], wide: [7.2, 38], ews: [11, 42]};

export const handheld = (cam: Cam, frame: number, seed: string): Cam => {
  const t = frame / 30, a = random(seed + 'a') * 9, b = random(seed + 'b') * 9;
  return {...cam, pos: [cam.pos[0] + Math.sin(t * 0.7 + a) * 0.018 + Math.sin(t * 1.9 + b) * 0.004, cam.pos[1] + Math.sin(t * 0.93 + b) * 0.013, cam.pos[2] + Math.sin(t * 0.41 + a) * 0.01],
    target: [cam.target[0] + Math.sin(t * 0.5 + b) * 0.006, cam.target[1] + Math.sin(t * 0.61 + a) * 0.005, cam.target[2]]};
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const camFor = (spec: ShotGeom, k: number, beat: number, seed: string): Cam => {
  const {cam} = spec;
  const S = typeof cam.on === 'number' ? headOf(spec.cast[cam.on]) : cam.on;
  const [d0, f0] = SIZE[cam.size];
  let d = d0, fov = f0, yaw = (cam.yaw ?? 0) * deg, pitch = (cam.pitch ?? 4) * deg, lift = 0;
  const a = cam.amount ?? 1;
  switch (cam.move ?? 'push') {
    case 'push': d = d0 * (1 - 0.24 * a * k - 0.02 * a * Math.sin(clamp01((k - 0.7) / 0.3) * Math.PI)); yaw += 5 * a * deg * k; break;
    case 'pull': d = d0 * (0.82 + 0.26 * a * k); yaw -= 5 * a * deg * k; break;
    case 'orbitL': yaw += 22 * a * deg * k; break;
    case 'orbitR': yaw -= 22 * a * deg * k; break;
    case 'crane': pitch += (-14 + 20 * k) * a * deg; lift = -0.3 * (1 - k); break;
    case 'drop': pitch += (22 - 18 * k) * a * deg; break;
    case 'truck': yaw += (-10 + 20 * k) * a * deg; d = d0 * 1.05; break;
    case 'snap': { const s = clamp01(k / 0.12); d = d0 * (1 - 0.25 * s - 0.03 * Math.sin(clamp01((k - 0.08) / 0.3) * Math.PI)); break; }
    case 'dz': { const dd = d0 * (0.85 + 0.6 * k); fov = 2 * Math.atan(Math.tan((f0 * deg) / 2) * (d0 * 0.85) / dd) / deg; d = dd; break; }
    case 'lock': d = d0 * (1 - 0.05 * k); break;
  }
  // MOTION PASS (prompts/MASTER_PROMPT_ANIMATION.md A1-A4): secondary arc + rise on every shot, and cut-in momentum
  const sd = random(seed + 'sec');
  const grade = (spec as {grade?: string}).grade;
  if (cam.pitch === undefined) pitch += (grade === 'triumph' ? -7 : grade === 'consequence' ? 6 : 0) * deg;   // A16 hero low / alone high angles
  yaw += (sd > 0.5 ? 1 : -1) * 4 * deg * k; lift += 0.06 * Math.sin(k * Math.PI);
  const inMo = Math.exp(-beat / 7); d *= 1 + 0.07 * inMo; yaw += (sd > 0.5 ? -1 : 1) * 2.5 * deg * inMo;
  const pos: V3 = [S[0] + d * Math.sin(yaw) * Math.cos(pitch), S[1] + lift + d * Math.sin(pitch), S[2] + d * Math.cos(yaw) * Math.cos(pitch)];
  const ty = cam.size === 'cu' || cam.size === 'mcu' ? S[1] + 0.08 : S[1] - 0.04;
  // A5 dutch breathing (±0.6°, tension ±2.5°) · A19 lens breathing (fov ±0.4°)
  const roll = Math.sin(beat / 30 * 0.45 + sd * 9) * (grade === 'tension' ? 2.5 : 0.6) * deg;
  fov += Math.sin(beat / 30 * 0.6 + sd * 5) * 0.4;
  return {...handheld({pos, target: [S[0], ty, S[2]], fov}, beat, seed), roll};
};

export const projectCam = (cam: Cam, p: V3) => {
  const c = new PerspectiveCamera(cam.fov, W / H, NEAR, FAR);
  c.position.set(...cam.pos); c.lookAt(new Vector3(...cam.target)); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = new Vector3(...p).project(c);
  return {x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, visible: v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15};
};
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** visible picture band: 2.39 letterbox bars (132 px) top and bottom */
export const LETTERBOX = 132;
export const inPicture = (s: {x: number; y: number; visible: boolean}, margin = 0) =>
  s.visible && s.x > -margin && s.x < W + margin && s.y > LETTERBOX - margin && s.y < H - LETTERBOX + margin;

/** faces the viewer actually sees: real heads + (mirror shots) their reflections */
export const facesOf = (spec: ShotGeom) => {
  const out: {i: number; p: V3; mirrored: boolean}[] = spec.cast.map((c, i) => ({i, p: headOf(c), mirrored: false}));
  if (spec.mirror) spec.cast.forEach((c, i) => { if (c.who === 'hero') out.push({i, p: mirrorOf(headOf(c)), mirrored: true}); });
  return out;
};

/** depth along the view axis (what postprocessing's DOF measures), not straight-line distance */
export const viewDepth = (cam: Cam, p: V3) => {
  const f = [cam.target[0] - cam.pos[0], cam.target[1] - cam.pos[1], cam.target[2] - cam.pos[2]], n = Math.hypot(f[0], f[1], f[2]);
  return ((p[0] - cam.pos[0]) * f[0] + (p[1] - cam.pos[1]) * f[1] + (p[2] - cam.pos[2]) * f[2]) / n;
};
/** blur amount 0..1 at a world point for a focus plan (same smoothstep as the shader) */
export const blurAt = (plan: {meters: number; rangeMeters: number}, cam: Cam, p: V3) => {
  const x = Math.min(1, Math.abs(viewDepth(cam, p) - plan.meters) / plan.rangeMeters);
  return x * x * (3 - 2 * x);
};
/**
 * Focus plan (fixes "sometimes too blurry"). postprocessing's DOF blur = smoothstep(0, range, |depth − focus|), so blur starts at
 * once: with the old fixed 1.2 m range a face was only fully crisp within ±0.3 m. Wides blurred anyone half a step off the subject,
 * point-aimed shots focused on empty space, and mirror shots focused on the back of the head instead of the face we see.
 *  1. subject = `focusOn`; else the aimed-at head; in mirror shots the reflected face; for point-aimed shots the in-picture face
 *     nearest the screen centre (if near the aim depth), else the aim point.
 *  2. every in-picture face within ±3 m of the subject (and not a deliberate near-camera foreground) must be crisp:
 *     sharpHalf covers them (+0.3 m head radius), range = 4·sharpHalf so blur there ≤ 0.15. Backgrounds beyond still melt.
 */
export const focusPlan = (spec: ShotGeom, cam: Cam) => {
  const aim = typeof spec.cam.on === 'number' ? headOf(spec.cast[spec.cam.on]) : spec.cam.on;
  const cen = (s: {x: number; y: number}) => Math.hypot(s.x - W / 2, s.y - H / 2);
  const faces = facesOf(spec).map((f) => ({...f, s: projectCam(cam, f.p), d: viewDepth(cam, f.p)}));
  const seen = faces.filter((f) => inPicture(f.s, -40) && f.d > 0.3);
  let subj: V3 = aim;
  if (spec.focusOn !== undefined) subj = typeof spec.focusOn === 'number' ? headOf(spec.cast[spec.focusOn]) : spec.focusOn;
  else if (spec.mirror) { const m = seen.filter((f) => f.mirrored).sort((a, b) => cen(a.s) - cen(b.s))[0]; if (m) subj = m.p; }
  else if (typeof spec.cam.on !== 'number') {
    const n = seen.sort((a, b) => cen(a.s) - cen(b.s))[0];
    if (n && cen(n.s) < 420 && Math.abs(n.d - viewDepth(cam, aim)) < 2.5) subj = n.p;
  }
  const ds = viewDepth(cam, subj);
  let lo = ds, hi = ds;
  for (const f of seen) if (f.d > ds * 0.6 && Math.abs(f.d - ds) < 3) { lo = Math.min(lo, f.d); hi = Math.max(hi, f.d); }
  const centre = (lo + hi) / 2;
  const sharpHalf = Math.max(0.3, 0.05 * centre, (hi - lo) / 2 + 0.3);
  const range = Math.min(10, 4 * sharpHalf);
  return {focus: (centre - NEAR) / (FAR - NEAR), range: range / (FAR - NEAR), meters: centre, rangeMeters: range, subject: subj};
};
