import {AbsoluteFill, Series, useCurrentFrame} from 'remotion';
import {S01_Hook} from './shots/S01_Hook';
import {S02_Reveal} from './shots/S02_Reveal';
import {Letterbox} from './overlay/Overlays';
import {ease} from './style/tokens';

export const Main = () => {
  const frame = useCurrentFrame();
  const fadeIn = ease(frame, [0, 14], [1, 0]);
  const fadeOut = ease(frame, [284, 300], [0, 1]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Series>
        <Series.Sequence durationInFrames={140}><S01_Hook /></Series.Sequence>
        <Series.Sequence durationInFrames={160}><S02_Reveal /></Series.Sequence>
      </Series>
      <Letterbox frame={frame} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};
