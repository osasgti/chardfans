import {AbsoluteFill, spring} from 'remotion';
import {useBeat} from '../style/time';
import {Stage, Lights, handheld, Cam} from '../three/Stage';
import {Pill} from '../three/Pill';
import {Hallway, Dust} from '../three/Set';
import {Title} from '../overlay/Overlays';
import {ease, focusFor} from '../style/tokens';

export const S01_Hook = () => {
  const frame = useBeat();
  const fps = 30;
  const k = ease(frame, [0, 140], [0, 1]);
  const base: Cam = {
    pos: [0.55 - 0.35 * k, 0.85 + 0.7 * k, 4.7 - 1.5 * k],
    target: [0, 1.35 + 0.18 * k, 0], fov: 32 - 2 * k,
  };
  const cam = handheld(base, frame, 's01');
  const dist = Math.hypot(cam.pos[0], cam.pos[1] - 1.55, cam.pos[2]);
  // head turns to camera at 55 with anticipation + overshoot
  const turn = spring({frame: frame - 55, fps, config: {damping: 9, mass: 0.8}});
  const antic = ease(frame, [48, 55], [0, 1]) * (1 - ease(frame, [55, 60], [0, 1]));
  return (
    <AbsoluteFill>
      <Stage cam={cam} focus={focusFor(dist)}>
        <Lights />
        <Hallway />
        <Dust frame={frame} />
        <Pill id="hero" frame={frame} hoodie="#c8323a" hat="beanie" expr={frame > 58 ? 'smug' : 'neutral'}
          headTurn={-0.55 + 0.55 * turn + 0.08 * antic} headTilt={0.1 * turn} look={frame > 58 ? -4 : 6} rotY={0.15} />
        <Pill id="bg1" frame={frame} position={[-1.7, 0, -1.6]} rotY={0.5} hoodie="#2f8f8a" hat="cap" hatColor="#22303a" seg={24} expr="bored" />
        <Pill id="bg2" frame={frame} position={[1.9, 0, -1.9]} rotY={-0.6} hoodie="#d29a2d" seg={24} />
      </Stage>
      <Title words={['WHAT', 'IF', 'YOU', 'COULD']} frame={frame} start={14} y={0.2} size={78} emphasis={[3]} out={122} />
      <Title words={['SEE', 'THE', 'ODDS?']} frame={frame} start={52} y={0.31} size={64} out={122} />
    </AbsoluteFill>
  );
};
