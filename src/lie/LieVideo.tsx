/**
 * "What If You Could See When Anyone Is Lying?" — the full 5-minute composition.
 * Timing source of truth: src/lie/timeline.json (scripts/build_timeline.py). Shots: src/lie/shots.ts.
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {LieShot, LINES, TOTAL, Line} from './engine';
import {SHOTS} from './shots';
import {Captions, Word} from '../overlay/Captions';
import {Letterbox} from '../overlay/Overlays';
import {Grain} from '../overlay/Grain';

/* ── timing: each line owns [its start, next line's start); its shots split that window by weight ── */
type Timed = {i: number; startSec: number; durSec: number};
export const SHOT_TIMES: Timed[] = (() => {
  const out: Timed[] = [];
  LINES.forEach((l, li) => {
    const winStart = li === 0 ? 0 : l.start - 0.25;
    const winEnd = li === LINES.length - 1 ? TOTAL : LINES[li + 1].start - 0.25;
    const shots = SHOTS.map((s, i) => ({s, i})).filter((x) => x.s.line === l.id);
    const wsum = shots.reduce((a, x) => a + (x.s.w ?? 1), 0);
    let t = winStart;
    for (const x of shots) { const d = (winEnd - winStart) * ((x.s.w ?? 1) / wsum); out.push({i: x.i, startSec: t, durSec: d}); t += d; }
  });
  return out;
})();
// validate every shot's cast references up front (a bad index crashed a render at frame 197)
const bad = SHOTS.flatMap((s, i) => [
  ...(typeof s.cam.on === 'number' && !s.cast[s.cam.on] ? [`shot ${i} (${s.line}) cam.on=${s.cam.on}`] : []),
  ...(s.meters ?? []).filter((m) => typeof m.on === 'number' && !s.cast[m.on]).map((m) => `shot ${i} (${s.line}) meter.on=${m.on}`),
]);
if (bad.length) throw new Error('Invalid cast references: ' + bad.join('; '));
const missing = LINES.filter((l) => !SHOTS.some((s) => s.line === l.id)).map((l) => l.id);
if (missing.length) throw new Error('Lines without shots: ' + missing.join(', '));

const ALL_WORDS: Word[] = LINES.flatMap((l: Line) => l.words);
const ACT_START = (act: string) => LINES.find((l) => l.act === act)!.start;
const ACTS = ['hook', 'act1', 'act2', 'act3', 'act4', 'end'];

const ShotSeq = ({t}: {t: Timed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = fps / 30;
  return <LieShot spec={SHOTS[t.i]} beat={frame / r} dur={t.durSec * 30} sec={t.startSec + frame / fps} seed={'s' + t.i} fpsRatio={r} />;
};

/** looped bed with fades at both ends (seconds) */
const Bed = ({src, from, to, vol, fps, fade = 1.5}: {src: string; from: number; to: number; vol: number; fps: number; fade?: number}) => (
  <Sequence from={Math.round(from * fps)} durationInFrames={Math.max(1, Math.round((to - from) * fps))} layout="none">
    <Audio src={staticFile(src)} loop volume={(f) => vol * interpolate(f / fps, [0, fade, to - from - fade, to - from], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
  </Sequence>
);
const Cue = ({src, at, vol = 0.6, rate = 1, fps}: {src: string; at: number; vol?: number; rate?: number; fps: number}) => (
  <Sequence from={Math.max(0, Math.round(at * fps))} layout="none"><Audio src={staticFile(`sfx/${src}.wav`)} volume={vol} playbackRate={rate} /></Sequence>
);

export const LieVideo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sec = frame / fps;
  const L = (id: string) => LINES.find((l) => l.id === id)!;
  const end = (a: string) => { const i = ACTS.indexOf(a); return i === ACTS.length - 1 ? TOTAL : ACT_START(ACTS[i + 1]); };
  // act transitions: dip to black around each act start
  const dip = Math.max(0, ...ACTS.slice(1).map((a) => interpolate(sec, [ACT_START(a) - 1.4, ACT_START(a) - 0.7, ACT_START(a) - 0.3], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const fadeIn = interpolate(sec, [0, 0.8], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(sec, [TOTAL - 1.6, TOTAL - 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mirror = L('L025').start;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SHOT_TIMES.map((t) => (
        <Sequence key={t.i} from={Math.round(t.startSec * fps)} durationInFrames={Math.max(1, Math.round((t.startSec + t.durSec) * fps) - Math.round(t.startSec * fps))}>
          <ShotSeq t={t} />
        </Sequence>
      ))}

      {/* ── VOICE ── */}
      {LINES.filter((l) => l.audio).map((l) => (
        <Sequence key={l.id} from={Math.round(l.start * fps)} layout="none"><Audio src={staticFile(l.audio!)} volume={1} /></Sequence>
      ))}

      {/* ── MUSIC per act (§13) ── */}
      <Bed src="sfx/music_pad.wav" from={0} to={end('hook')} vol={0.32} fps={fps} />
      <Bed src="sfx/drone_low.wav" from={0} to={end('hook')} vol={0.08} fps={fps} />
      <Cue src="music_motif" at={1.2} vol={0.3} fps={fps} />
      <Bed src="sfx/music_pad.wav" from={ACT_START('act1')} to={end('act2')} vol={0.2} fps={fps} />
      <Bed src="sfx/music_pluck.wav" from={ACT_START('act1')} to={end('act2')} vol={0.26} fps={fps} />
      <Bed src="sfx/music_drums.wav" from={ACT_START('act1') + 6} to={end('act2')} vol={0.18} fps={fps} />
      <Bed src="sfx/music_bass.wav" from={ACT_START('act2')} to={end('act2')} vol={0.24} fps={fps} />
      <Bed src="sfx/drone_low.wav" from={ACT_START('act3')} to={mirror - 2.2} vol={0.22} fps={fps} />
      <Bed src="sfx/riser_shepard.wav" from={L('L021').start} to={L('L022d').end} vol={0.12} fps={fps} />
      <Bed src="sfx/music_motif.wav" from={L('L026').start} to={end('act4')} vol={0.32} fps={fps} />
      <Bed src="sfx/music_pad.wav" from={L('L028').start} to={end('act4')} vol={0.18} fps={fps} />
      <Bed src="sfx/music_pad.wav" from={ACT_START('end')} to={TOTAL} vol={0.3} fps={fps} />
      <Bed src="sfx/music_pluck.wav" from={ACT_START('end')} to={TOTAL} vol={0.2} fps={fps} />
      <Bed src="sfx/shimmer_loop.wav" from={L('L032c').start} to={TOTAL} vol={0.1} fps={fps} />

      {/* ── AMBIENCE ── */}
      <Bed src="sfx/amb_void.wav" from={0} to={end('hook')} vol={0.25} fps={fps} />
      <Bed src="sfx/room.wav" from={ACT_START('act1')} to={L('L008b').start} vol={0.25} fps={fps} />
      <Bed src="sfx/amb_hallway.wav" from={L('L008d').start} to={L('L012').start} vol={0.18} fps={fps} />
      <Bed src="sfx/amb_casino.wav" from={L('L012').start - 0.6} to={L('L014').start} vol={0.25} fps={fps} />
      <Bed src="sfx/amb_hallway.wav" from={L('L014').start} to={L('L015d').start} vol={0.2} fps={fps} />
      <Bed src="sfx/amb_hallway.wav" from={ACT_START('act3')} to={L('L019').start} vol={0.14} fps={fps} />
      <Bed src="sfx/heartbeat.wav" from={L('L019').start} to={L('L019').end + 1.4} vol={0.45} fps={fps} fade={0.4} />
      <Bed src="sfx/amb_bedroom_night.wav" from={L('L022').start} to={mirror - 2.2} vol={0.22} fps={fps} />
      <Bed src="sfx/drone_low.wav" from={L('L023').start + 2} to={mirror - 2.2} vol={0.12} fps={fps} />
      <Bed src="sfx/room.wav" from={ACT_START('end')} to={TOTAL} vol={0.18} fps={fps} />

      {/* ── HARD CUES ── */}
      <Cue src="reverse_cymbal" at={0.2} vol={0.25} fps={fps} />
      {ACTS.slice(1).map((a) => <Cue key={a} src="whoosh_heavy" at={ACT_START(a) - 1.35} vol={0.45} fps={fps} />)}
      <Cue src="alarm_beep" at={L('L004').start + 1.0} vol={0.25} fps={fps} />
      <Cue src="kid_laugh" at={L('L006').end + 0.4} vol={0.14} fps={fps} />
      <Cue src="whip" at={L('L008b').start - 0.2} vol={0.4} fps={fps} />
      <Cue src="step_tile" at={L('L008b').start + 0.4} vol={0.3} fps={fps} rate={1.4} />
      <Cue src="glitch" at={L('L008c').end - 0.4} vol={0.25} fps={fps} />
      <Cue src="marker_squeak" at={L('L010').start + 0.2} vol={0.25} fps={fps} />
      <Cue src="card_flick" at={L('L012').start + 3.5} vol={0.4} fps={fps} />
      <Cue src="chips_stack" at={L('L013').start + 0.8} vol={0.4} fps={fps} />
      {[0, 0.9, 1.8].map((d, i) => <Cue key={d} src="success" at={L('L013').start + 2.2 + d} vol={0.25} rate={1 + i * 0.12} fps={fps} />)}
      <Cue src="crowd_cheer" at={L('L014').start + 0.3} vol={0.35} fps={fps} />
      <Cue src="stinger_good" at={L('L015').start} vol={0.4} fps={fps} />
      <Cue src="sparkle" at={L('L015').start + 0.3} vol={0.3} fps={fps} />
      <Cue src="stinger_bad" at={ACT_START('act3') - 0.2} vol={0.25} fps={fps} />
      <Cue src="locker_slam" at={L('L017').start + 0.2} vol={0.25} fps={fps} />
      <Cue src="door_creak" at={L('L019').start + 0.3} vol={0.3} fps={fps} />
      <Cue src="mumble_vo" at={L('L019').start + 1.5} vol={0.08} fps={fps} />
      <Cue src="notification" at={L('L022c').start + 0.3} vol={0.35} fps={fps} />
      <Cue src="suck_back" at={L('L022d').end - 0.6} vol={0.35} fps={fps} />
      <Cue src="step_wood" at={L('L023').start + 2.0} vol={0.2} rate={0.8} fps={fps} />
      {/* THE MIRROR: silence → impact stack */}
      <Cue src="suck_back" at={mirror - 1.4} vol={0.45} fps={fps} />
      <Cue src="impact" at={mirror} vol={0.9} fps={fps} />
      <Cue src="boom_sub" at={mirror} vol={0.6} fps={fps} />
      <Cue src="stinger_bad" at={mirror + 0.1} vol={0.4} fps={fps} />
      <Cue src="glitch" at={L('L028').start + 0.5} vol={0.2} fps={fps} />
      <Cue src="chime_low" at={L('L028').end - 1.0} vol={0.35} fps={fps} />
      <Cue src="kid_laugh" at={L('L029b').end - 0.6} vol={0.18} fps={fps} />
      <Cue src="door_creak" at={L('L029c').start + 1.0} vol={0.25} rate={0.9} fps={fps} />
      <Cue src="notification" at={L('L032b').start + 0.2} vol={0.3} fps={fps} />
      <Cue src="sparkle" at={L('L032c').end - 0.3} vol={0.35} fps={fps} />
      <Cue src="notification" at={L('L034').start + 0.2} vol={0.3} fps={fps} />
      <Cue src="boom_sub" at={TOTAL - 1.5} vol={0.35} fps={fps} />

      {/* ── OVERLAYS ── */}
      <Captions words={ALL_WORDS} seconds={sec} bottom={140} />
      <Grain opacity={0.05} />
      <Letterbox frame={30} />
      {/* mirror moment: red flash */}
      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', background: 'radial-gradient(circle at 50% 40%, #ff5a5a, transparent 70%)',
        opacity: interpolate(sec, [mirror + 0.2, mirror + 0.28, mirror + 0.6], [0, 0.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut, dip)}} />
    </AbsoluteFill>
  );
};
export const LIE_TOTAL = TOTAL;
