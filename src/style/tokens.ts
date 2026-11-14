import {interpolate, Easing} from 'remotion';
export const C = {
  bgDeep: '#14101f', purple: '#3b2d5c', purpleLit: '#6a5a9a', lavender: '#c9c1e3',
  skin: '#ece6f2', floorWood: '#6e4630', red: '#c8323a',
  keyWarm: '#ffd9a8', fillCool: '#7b6cff', rimBlue: '#9fc4ff',
  gold: '#f2c46b', goldDeep: '#b8862f', cream: '#f5ead2', uiBg: 'rgba(20,14,28,0.78)',
};
/** Render at 60fps; all animation is authored in 30fps "beats" (B) and converted. */
export const FPS = 60, BASE = 30, W = 1920, H = 1080;
export const NEAR = 0.1, FAR = 40;
export const ease = (f: number, [a, b]: [number, number], [x, y]: [number, number], e = Easing.bezier(0.45, 0, 0.2, 1)) =>
  interpolate(f, [a, b], [x, y], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const focusFor = (meters: number) => (meters - NEAR) / (FAR - NEAR);
