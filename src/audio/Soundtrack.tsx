import {Audio, Sequence, staticFile, useVideoConfig, interpolate} from 'remotion';
import {toFrames} from '../style/time';

/** One cue = sound file + start (in 30fps beats) + volume. Keep ALL cues in one list. */
type Cue = {sfx: string; at: number; vol?: number; rate?: number};

const CUT = 140, FLIP = 228;
export const CUES: Cue[] = [
  // shot 1 — title words land with soft tocks (pitch rises across the line)
  ...[14, 19, 24, 29].map((at, i) => ({sfx: 'word', at, vol: 0.45, rate: 1 + i * 0.06})),
  {sfx: 'chime', at: 29, vol: 0.25, rate: 0.75},                // emphasis word "COULD"
  ...[52, 57, 62].map((at, i) => ({sfx: 'word', at, vol: 0.35, rate: 1.1 + i * 0.06})),
  {sfx: 'whoosh', at: 46, vol: 0.25, rate: 1.4},                 // head turn
  {sfx: 'whoosh', at: CUT - 14, vol: 0.7},                       // cut into shot 2
  // shot 2 — badge pop, number ticks, riser, the 99% hit
  {sfx: 'coin_flip', at: CUT - 4, vol: 0.4},                     // pre-lap the coin before the cut
  {sfx: 'coin', at: CUT, vol: 0.3},
  {sfx: 'cloth_rustle', at: 50, vol: 0.25},                    // hero turns (foley)
  {sfx: 'swish_ui', at: CUT + 4, vol: 0.3},                    // tag slides in
  {sfx: 'cloth_rustle', at: FLIP - 4, vol: 0.35, rate: 1.1},   // arm raise
  {sfx: 'reverse_cymbal', at: FLIP - 105, vol: 0.25},          // 3.5s swell ends on the hit
  {sfx: 'suck_back', at: FLIP - 36, vol: 0.3},
  {sfx: 'chime', at: CUT + 18, vol: 0.55},
  ...[0, 3, 6, 9, 13, 18].map((d) => ({sfx: 'tick', at: CUT + 22 + d, vol: 0.35})),
  {sfx: 'riser', at: FLIP - 60, vol: 0.55},
  {sfx: 'impact', at: FLIP, vol: 0.9},
  {sfx: 'sparkle', at: FLIP, vol: 0.6},
  {sfx: 'boom_sub', at: FLIP, vol: 0.5},
  {sfx: 'success', at: FLIP + 8, vol: 0.35},
  ...[0, 2, 4, 7, 10, 14, 19].map((d) => ({sfx: 'tick', at: FLIP + d, vol: 0.3, rate: 1.15})),
];

export const Soundtrack = ({totalBeats}: {totalBeats: number}) => {
  const {fps} = useVideoConfig();
  const end = toFrames(totalBeats, fps);
  return (
    <>
      {/* music bed: fade in, duck under the riser, swell on the hit, fade out */}
      <Audio src={staticFile('sfx/music.wav')} volume={(f) => interpolate(f,
        [0, toFrames(30, fps), toFrames(FLIP - 50, fps), toFrames(FLIP - 2, fps), toFrames(FLIP + 6, fps), end - toFrames(30, fps), end],
        [0, 0.45, 0.45, 0.18, 0.6, 0.45, 0], {extrapolateRight: 'clamp'})} />
      <Audio src={staticFile('sfx/amb_hallway.wav')} volume={0.22} />
      <Audio src={staticFile('sfx/music_motif.wav')} volume={0.35} />
      {CUES.map((c, i) => (
        <Sequence key={i} from={toFrames(c.at, fps)} layout="none">
          <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.vol ?? 1} playbackRate={c.rate ?? 1} />
        </Sequence>
      ))}
    </>
  );
};
