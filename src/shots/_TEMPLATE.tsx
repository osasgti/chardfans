/**
 * SHOT TEMPLATE — copy to SXX_Name.tsx. All timing in beats (30/s). Fill the timing chart FIRST.
 * // 0 establish | 12 anticipation | 18 key pose | 24 overshoot | 32 settle | 60 overlay | 90 cut
 */
import {AbsoluteFill, spring} from 'remotion';
import {useBeat} from '../style/time';
import {Stage, Lights, handheld, Cam} from '../three/Stage';
import {Pill} from '../three/Pill';
import {Hallway, Dust} from '../three/Set';
import {Tag} from '../overlay/Overlays';
import {ease, focusFor} from '../style/tokens';

export const DUR = 90;            // beats — export so Main + Soundtrack share it
export const S00_Template = () => {
  const beat = useBeat();
  const k = ease(beat, [0, DUR], [0, 1]);                               // ONE primary move…
  const base: Cam = {pos: [0.4 - 0.2 * k, 1.5, 3.4 - 0.3 * k], target: [0, 1.5, 0], fov: 30};
  const cam = handheld(base, beat, 's00');                               // …plus one secondary layer
  const dist = Math.hypot(cam.pos[0], cam.pos[1] - 1.55, cam.pos[2]);
  const pop = spring({frame: beat - 18, fps: 30, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <Stage cam={cam} focus={focusFor(dist)}>
        <Lights />
        <Hallway />
        <Dust frame={beat} />
        <Pill id="hero" frame={beat} expr={beat > 18 ? 'smug' : 'neutral'} headTilt={0.1 * pop} />
      </Stage>
      <Tag text="LOCATION TAG" frame={beat} start={6} out={DUR - 12} />
    </AbsoluteFill>
  );
};
