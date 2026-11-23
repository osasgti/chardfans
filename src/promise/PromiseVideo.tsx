/**
 * "What If Every Promise Left a Glowing Thread?" — full composition (prompts/WHAT_IF_PROMISE_THREADS.md).
 * Timing: src/promise/timeline.json (scripts/build_promise_timeline.py). Shots: src/promise/shots.ts. Engine: src/lie/engine.tsx.
 * Thread SFX are derived from the shot data (spool on fresh, pluck on held, fray on broken, burst on burst), so picture and
 * sound share the same numbers (CLAUDE.md §33.2).
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {LieShot, Line, ShotSpec} from '../lie/engine';
import timeline from './timeline.json';
import CAL from './exposure_cal.json';
import {SHOTS} from './shots';
import {Captions} from '../overlay/Captions';
import {Letterbox} from '../overlay/Overlays';
import {Grain} from '../overlay/Grain';

export const P_LINES = timeline.lines as Line[];
export const P_TOTAL = timeline.total as number;
const L = (id: string) => P_LINES.find((l) => l.id === id)!;

type Timed = {i: number; startSec: number; durSec: number};
export const P_SHOT_TIMES: Timed[] = (() => {
  const out: Timed[] = [];
  P_LINES.forEach((l, li) => {
    const a = li === 0 ? 0 : l.start - 0.25, b = li === P_LINES.length - 1 ? P_TOTAL : P_LINES[li + 1].start - 0.25;
    const shots = SHOTS.map((s, i) => ({s, i})).filter((x) => x.s.line === l.id);
    const wsum = shots.reduce((s, x) => s + (x.s.w ?? 1), 0); let t = a;
    for (const x of shots) { const d = (b - a) * ((x.s.w ?? 1) / wsum); out.push({i: x.i, startSec: t, durSec: d}); t += d; }
  });
  return out;
})();
{
  const bad = SHOTS.flatMap((s, i) => [
    ...(typeof s.cam.on === 'number' && !s.cast[s.cam.on] ? [`shot ${i} cam.on`] : []),
    ...(s.threads ?? []).filter((t) => (typeof t.from === 'number' && !s.cast[t.from]) || (typeof t.to === 'number' && !s.cast[t.to])).map(() => `shot ${i} (${s.line}) thread ref`),
  ]);
  const missing = P_LINES.filter((l) => !SHOTS.some((s) => s.line === l.id)).map((l) => l.id);
  // story rule (§12): no thread leaves Kai's wrist before P032
  const twist = P_LINES.findIndex((l) => l.id === 'P032');
  const early = SHOTS.filter((s) => P_LINES.findIndex((l) => l.id === s.line) < twist)
    .filter((s) => (s.threads ?? []).some((t) => typeof t.from === 'number' && s.cast[t.from]?.who === 'hero')).map((s) => s.line);
  const all = [...bad, ...missing.map((m) => 'no shot for ' + m), ...early.map((e) => `Kai's wrist shown before the twist (${e})`)];
  if (all.length) throw new Error('Promise shots invalid: ' + all.join('; '));
}
const ACTS = ['hook', 'act1', 'act2', 'act3', 'act4', 'act5'];
const ACT_START = (a: string) => P_LINES.find((l) => l.act === a)!.start;

export const pDuck = (sec: number, depth: number) => {
  let g = 1;
  for (const l of P_LINES) {
    const v = sec < l.start ? interpolate(l.start - sec, [0, 0.12], [depth, 1], {extrapolateRight: 'clamp'})
      : sec > l.end ? interpolate(sec - l.end, [0, 0.4], [depth, 1], {extrapolateRight: 'clamp'}) : depth;
    if (v < g) g = v;
  }
  return g;
};
const Bed = ({src, from, to, vol, fps, fade = 1.5, duck = 0.35}: {src: string; from: number; to: number; vol: number; fps: number; fade?: number; duck?: number}) => (
  <Sequence from={Math.round(from * fps)} durationInFrames={Math.max(1, Math.round((to - from) * fps))} layout="none">
    <Audio src={staticFile(src)} loop volume={(f) => vol * pDuck(from + f / fps, duck) * interpolate(f / fps, [0, fade, to - from - fade, to - from], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
  </Sequence>
);
const Cue = ({src, at, vol = 0.6, rate = 1, fps, duck = 0.55}: {src: string; at: number; vol?: number; rate?: number; fps: number; duck?: number}) => (
  <Sequence from={Math.max(0, Math.round(at * fps))} layout="none"><Audio src={staticFile(`sfx/${src}.wav`)} volume={(f) => vol * pDuck(at + f / fps, duck)} playbackRate={rate} /></Sequence>
);

/** thread SFX from shot data: [sec, sfx, vol, rate] (max 3 per shot, §52.4) */
const THREAD_CUES: [number, string, number, number][] = P_SHOT_TIMES.flatMap((t) => {
  const s: ShotSpec = SHOTS[t.i]; const out: [number, string, number, number][] = [];
  (s.threads ?? []).forEach((th, k) => {
    const r = 1 + ((t.i * 7 + k * 3) % 9 - 4) * 0.015;   // ±6% variation (§33.2)
    if (th.swarm) return;
    const at = t.startSec + (th.at ?? 0) / 30;
    if (th.state === 'fresh') out.push([at, 'thread_spool', 0.4, r]);
    if (th.state === 'burst') out.push([at + 0.2, 'thread_burst', 0.6, r]);
    if (th.state === 'broken' && !th.at) out.push([t.startSec + 0.15, 'thread_drag', 0.22, r]);
    if (th.then) {
      const a2 = t.startSec + th.then.at / 30;
      out.push([a2, th.then.state === 'burst' ? 'thread_burst' : th.then.state === 'broken' ? 'thread_fray' : 'thread_snap_small', th.then.state === 'burst' ? 0.6 : 0.4, r]);
    }
    if (th.state === 'held' && !th.then && (th.thick ?? 0.01) >= 0.02) out.push([t.startSec + 0.3, 'rope_creak', 0.25, r]);
  });
  return out.slice(0, 3);
});

/** H3: a quiet whoosh peaking on every cut (varied rate) · H1: cloth rustle on stressed words of on-screen talkers (max 3 per line) */
const CUT_CUES: [number, number][] = P_SHOT_TIMES.slice(1).map((t, i) => [t.startSec - 0.18, 0.92 + ((i * 5) % 11) * 0.016]);
/** H2: footsteps under walk-ins (3.8 steps/s while the walk lasts, last steps softer) */
const STEP_CUES: [number, number][] = P_SHOT_TIMES.flatMap((t) => SHOTS[t.i].cast.filter((c) => c.enter).flatMap((c) => {
  const len = (c.enterLen ?? 30) / 30, n = Math.floor(len * 3.8);
  return Array.from({length: n}, (_, k) => [t.startSec + k / 3.8, 0.2 * (1 - 0.5 * k / n)] as [number, number]);
}));
const RUSTLE_CUES: number[] = P_LINES.flatMap((l) => {
  const talks = P_SHOT_TIMES.some((t) => SHOTS[t.i].line === l.id && SHOTS[t.i].cast.some((c) => c.talk));
  if (!talks) return [];
  return l.words.filter((w) => { const b = w.text.replace(/[^A-Za-z]/g, ''); return (b.length >= 2 && b === b.toUpperCase()) || b.length >= 7; }).slice(0, 3).map((w) => w.start - 0.04);
});
const ShotSeq = ({t}: {t: Timed}) => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), r = fps / 30;
  const spec = SHOTS[t.i], k = SHOTS.filter((s) => s.line === spec.line).indexOf(spec);
  const calStops = ((CAL as Record<string, number[]>)[spec.line] ?? [])[k] ?? 0;   // scripts/still_cal.py (§52.1)
  return <LieShot spec={spec} beat={frame / r} dur={t.durSec * 30} sec={t.startSec + frame / fps} seed={'p' + t.i} fpsRatio={r} lines={P_LINES} calStops={calStops} />;
};

export const PromiseVideo = () => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), sec = frame / fps;
  const end = (a: string) => { const i = ACTS.indexOf(a); return i === ACTS.length - 1 ? P_TOTAL : ACT_START(ACTS[i + 1]); };
  const dip = Math.max(0, ...ACTS.slice(1).map((a) => interpolate(sec, [ACT_START(a) - 1.6, ACT_START(a) - 0.9, ACT_START(a) - 0.3], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const fadeIn = interpolate(sec, [0, 0.8], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(sec, [P_TOTAL - 1.5, P_TOTAL - 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const silence = L('P039').end + 0.2;                         // the scored silence (§7): P039 → 0.8s nothing → dawn
  const reveal = L('P033').end + 0.05, burst = L('P044').end + 0.05;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {P_SHOT_TIMES.map((t) => (
        <Sequence key={t.i} from={Math.round(t.startSec * fps)} durationInFrames={Math.max(1, Math.round((t.startSec + t.durSec) * fps) - Math.round(t.startSec * fps))}>
          <ShotSeq t={t} />
        </Sequence>
      ))}

      {/* ── VOICE ── */}
      {P_LINES.map((l) => <Sequence key={l.id} from={Math.round(l.start * fps)} layout="none"><Audio src={staticFile(l.audio!)} volume={1} /></Sequence>)}

      {/* ── MUSIC: one motif, reworked per act (§8) ── */}
      <Bed src="sfx/promise_celesta.wav" from={0} to={end('hook')} vol={0.34} fps={fps} />
      <Bed src="sfx/music_pad.wav" from={0} to={end('hook')} vol={0.16} fps={fps} />
      <Bed src="sfx/promise_pizz.wav" from={ACT_START('act1')} to={end('act2')} vol={0.3} fps={fps} />
      <Bed src="sfx/music_drums.wav" from={ACT_START('act2')} to={end('act2')} vol={0.14} fps={fps} />
      <Bed src="sfx/music_bass.wav" from={ACT_START('act2')} to={end('act2')} vol={0.18} fps={fps} />
      <Bed src="sfx/promise_minor.wav" from={ACT_START('act3')} to={end('act3')} vol={0.3} fps={fps} />
      <Bed src="sfx/heartbeat_soft.wav" from={L('P026').start} to={end('act3')} vol={0.3} fps={fps} duck={0.6} />
      <Bed src="sfx/riser_shepard.wav" from={L('P029').start} to={end('act3') - 0.6} vol={0.1} fps={fps} />
      <Bed src="sfx/drone_low.wav" from={ACT_START('act4')} to={silence} vol={0.2} fps={fps} fade={0.3} />
      <Bed src="sfx/promise_piano.wav" from={L('P036').start} to={silence} vol={0.26} fps={fps} fade={0.4} />
      <Bed src="sfx/promise_piano.wav" from={ACT_START('act5')} to={burst} vol={0.3} fps={fps} />
      <Bed src="sfx/promise_celesta.wav" from={burst - 0.2} to={P_TOTAL} vol={0.32} fps={fps} />
      <Bed src="sfx/music_pad.wav" from={burst - 0.2} to={P_TOTAL} vol={0.24} fps={fps} />
      <Bed src="sfx/shimmer_loop.wav" from={burst} to={P_TOTAL} vol={0.08} fps={fps} />

      {/* ── AMBIENCE (pre-laps 0.5s) + the thread hum bed ── */}
      <Bed src="sfx/amb_void.wav" from={0} to={end('hook')} vol={0.22} fps={fps} duck={0.6} />
      <Bed src="sfx/thread_hum.wav" from={0} to={end('act5')} vol={0.1} fps={fps} duck={0.7} />
      <Bed src="sfx/amb_bedroom_night.wav" from={ACT_START('act1') - 0.5} to={L('P006').start} vol={0.16} fps={fps} duck={0.6} />
      <Bed src="sfx/room.wav" from={L('P006').start - 0.5} to={L('P009').start} vol={0.22} fps={fps} duck={0.6} />
      <Bed src="sfx/amb_hallway.wav" from={L('P012').start - 0.5} to={L('P015').start} vol={0.18} fps={fps} duck={0.6} />
      <Bed src="sfx/amb_classroom.wav" from={L('P015').start - 0.5} to={L('P017').start} vol={0.18} fps={fps} duck={0.6} />
      <Bed src="sfx/amb_casino.wav" from={L('P017').start - 0.5} to={L('P018').start} vol={0.2} fps={fps} duck={0.6} />
      <Bed src="sfx/amb_hallway.wav" from={L('P018').start} to={L('P023').start} vol={0.14} fps={fps} duck={0.6} />
      <Bed src="sfx/crowd_murmur.wav" from={L('P024').start - 0.5} to={L('P025').start} vol={0.1} fps={fps} duck={0.6} />
      <Bed src="sfx/amb_bedroom_night.wav" from={L('P026').start - 0.5} to={end('act3')} vol={0.18} fps={fps} duck={0.6} />
      <Bed src="sfx/amb_void.wav" from={L('P034').start} to={silence} vol={0.2} fps={fps} duck={0.6} fade={0.3} />
      <Bed src="sfx/room.wav" from={ACT_START('act5') - 0.3} to={P_TOTAL} vol={0.16} fps={fps} duck={0.6} />
      <Bed src="sfx/crowd_murmur.wav" from={L('P041').start} to={L('P045').start} vol={0.1} fps={fps} duck={0.6} />

      {/* ── HARD CUES ── */}
      <Cue src="reverse_cymbal" at={0.2} vol={0.2} fps={fps} />
      {ACTS.slice(1).map((a) => <Cue key={a} src="whoosh_heavy" at={ACT_START(a) - 1.5} vol={0.4} fps={fps} />)}
      {THREAD_CUES.map(([at, s, v, r], i) => <Cue key={'tc' + i} src={s} at={at} vol={v} rate={r} fps={fps} />)}
      {CUT_CUES.map(([at, r], i) => <Cue key={'cw' + i} src="whoosh_short" at={at} vol={0.1} rate={r} fps={fps} duck={0.5} />)}
      {STEP_CUES.map(([at, v], i) => <Cue key={'st' + i} src="step_wood" at={at} vol={v} rate={0.95 + (i % 5) * 0.025} fps={fps} duck={0.8} />)}
      {RUSTLE_CUES.map((at, i) => <Cue key={'cr' + i} src="cloth_rustle" at={at} vol={0.13} rate={0.94 + (i % 7) * 0.02} fps={fps} duck={0.8} />)}
      <Cue src="alarm_beep" at={L('P004').start + 0.8} vol={0.22} fps={fps} />
      <Cue src="kid_laugh" at={L('P008').end + 0.3} vol={0.14} fps={fps} />
      <Cue src="stinger_good" at={L('P013').start} vol={0.3} fps={fps} />
      <Cue src="card_flick" at={L('P017').start + 1.5} vol={0.35} fps={fps} />
      <Cue src="stinger_bad" at={ACT_START('act3') - 0.2} vol={0.22} fps={fps} />
      <Cue src="chime_low" at={L('P023').start + 0.3} vol={0.3} fps={fps} />
      {/* P033: the reveal — riser into it, wrist_reveal + impact after the word (§52.2) */}
      <Cue src="riser_short" at={L('P033').start - 1.0} vol={0.35} fps={fps} />
      <Cue src="wrist_reveal" at={reveal} vol={0.7} fps={fps} duck={1} />
      <Cue src="impact" at={reveal} vol={0.85} fps={fps} duck={1} />
      <Cue src="boom_sub" at={reveal} vol={0.55} fps={fps} duck={1} />
      {['P034'].map((id) => [0.4, 1.5, 2.6, 3.6].map((d, i) => <Cue key={id + i} src="thread_pluck" at={L(id).start + d} vol={0.3} rate={0.9 + i * 0.06} fps={fps} />))}
      <Cue src="suck_back" at={silence - 1.2} vol={0.4} fps={fps} />
      {/* P044 burst: the wow moment */}
      <Cue src="riser" at={burst - 2.0} vol={0.3} fps={fps} />
      <Cue src="thread_burst" at={burst} vol={0.8} fps={fps} duck={1} />
      <Cue src="sparkle" at={burst + 0.1} vol={0.5} fps={fps} duck={1} />
      <Cue src="crowd_cheer" at={burst + 0.3} vol={0.3} fps={fps} />
      <Cue src="boom_sub" at={P_TOTAL - 1.4} vol={0.3} fps={fps} />

      {/* ── OVERLAYS ── */}
      {(() => { const l = P_LINES.find((x) => sec >= x.start - 0.05 && sec <= x.end + 0.5); return l ? <Captions words={l.words} seconds={Math.min(sec, l.end - 0.01)} bottom={140} /> : null; })()}
      <Grain opacity={0.05} />
      <Letterbox frame={30} />
      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', background: 'radial-gradient(circle at 50% 50%, #f2c46b, transparent 70%)',
        opacity: interpolate(sec, [burst, burst + 0.08, burst + 0.6], [0, 0.35, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut, dip, interpolate(sec, [silence, silence + 0.15, silence + 0.8, silence + 1.2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}))}} />
    </AbsoluteFill>
  );
};
