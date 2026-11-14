import {useCurrentFrame, useVideoConfig} from 'remotion';
import {BASE} from './tokens';
/** Frame in 30fps beats (fractional at 60fps). Author everything in beats so fps can change freely. */
export const useBeat = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame * (BASE / fps);
};
/** Convert beats (30fps frames) to real frames for <Sequence>/<Series> durations. */
export const toFrames = (beats: number, fps: number) => Math.round((beats * fps) / BASE);
