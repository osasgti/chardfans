/**
 * Reaction library (FIX_LIST_V2 #15): short acted moments layered on top of a pose.
 * Each reaction is a set of keyframed channels in BEATS after `at`, with anticipation → hit → overshoot → settle
 * (CLAUDE.md §21). Channels add to the base pose; headTurn/headTilt are radians, dy is metres, squash is −0.1…0.1.
 * Pure functions of beat → deterministic.
 */
import {interpolate, Easing} from 'remotion';

export type Reaction = 'doubleTake' | 'gulp' | 'shrug' | 'facepalm' | 'deflate' | 'celebrate' | 'smugNod';
type Ch = 'armL' | 'armR' | 'armLx' | 'armRx' | 'headTurn' | 'headTilt' | 'squash' | 'dy' | 'lean';
type Keys = [number, number][];

const E = Easing.bezier(0.45, 0, 0.2, 1);
const kf = (b: number, keys: Keys) => interpolate(b, keys.map((k) => k[0]), keys.map((k) => k[1]), {easing: E, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// timing charts (beats): written first, as the master prompt asks
const LIB: Record<Reaction, Partial<Record<Ch, Keys>>> = {
  // 0 look away | 6 notice | 9 snap back (anticipation dip) | 12 hit + squash | 20 settle
  doubleTake: {headTurn: [[0, 0], [6, -0.35], [9, -0.42], [12, 0.12], [16, -0.03], [22, 0]],
               squash: [[0, 0], [11, 0], [12, 0.09], [15, -0.04], [20, 0]], dy: [[0, 0], [12, 0.04], [18, 0]]},
  // 0 still | 4 neck squash down (swallow) | 10 back | 14 tiny head shake
  gulp: {squash: [[0, 0], [4, 0.07], [8, -0.03], [12, 0]], headTilt: [[0, 0], [10, 0], [12, 0.04], [14, -0.04], [16, 0]],
         dy: [[0, 0], [4, -0.03], [10, 0]]},
  // 0 | 3 dip (anticipation) | 9 shoulders/arms up | 18 hold | 26 down
  shrug: {armL: [[0, 0], [3, -0.05], [9, 0.45], [18, 0.42], [26, 0]], armR: [[0, 0], [3, -0.05], [9, 0.45], [18, 0.42], [26, 0]],
          armLx: [[0, 0], [9, -0.9], [18, -0.85], [26, 0]], armRx: [[0, 0], [9, -0.9], [18, -0.85], [26, 0]],
          headTilt: [[0, 0], [9, 0.14], [18, 0.12], [26, 0]], dy: [[0, 0], [3, -0.02], [9, 0.03], [26, 0]]},
  // 0 | 6 arm rises | 10 slap (overshoot) | 30 hold | 38 release
  facepalm: {armRx: [[0, 0], [6, -2.2], [10, -2.6], [12, -2.5], [30, -2.5], [38, 0]], armR: [[0, 0], [8, -0.32], [30, -0.32], [38, 0]], headTilt: [[0, 0], [10, 0.18], [30, 0.16], [38, 0]],
             squash: [[0, 0], [10, 0.05], [13, 0]]},
  // 0 | 8 shoulders drop + head down | hold
  deflate: {armL: [[0, 0], [8, -0.12]], armR: [[0, 0], [8, -0.12]], headTilt: [[0, 0], [8, -0.26]], lean: [[0, 0], [8, 0.12]],
            dy: [[0, 0], [8, -0.05]]},
  // 0 | 4 crouch | 10 jump + arms up | 16 land squash | 22 settle, arms stay up
  celebrate: {dy: [[0, 0], [4, -0.06], [10, 0.3], [16, 0], [18, -0.03], [22, 0]], squash: [[0, 0], [4, 0.08], [9, -0.08], [16, 0.1], [22, 0]],
              armL: [[0, 0], [4, -0.1], [10, 2.6], [22, 2.5]], armR: [[0, 0], [4, -0.1], [10, 2.7], [22, 2.55]]},
  // 0 | 6 slow tilt | 14 one nod down | 20 up | hold
  smugNod: {headTilt: [[0, 0], [6, 0.12], [20, 0.12]], headTurn: [[0, 0], [14, 0], [16, 0.05], [22, 0]],
            lean: [[0, 0], [8, -0.08]]},
};

export const reactAt = (kind: Reaction | undefined, beat: number, at = 8) => {
  const out: Record<Ch, number> = {armL: 0, armR: 0, armLx: 0, armRx: 0, headTurn: 0, headTilt: 0, squash: 0, dy: 0, lean: 0};
  if (!kind) return out;
  const b = beat - at, keys = LIB[kind];
  for (const ch of Object.keys(keys) as Ch[]) out[ch] = kf(b, keys[ch]!);
  return out;
};
export const REACTIONS = Object.keys(LIB) as Reaction[];
