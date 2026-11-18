/** Dev-only: all reactions side by side on the void set (check poses before using them in shots). */
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Stage, Lights} from '../three/Stage';
import {Void} from '../three/LieSets';
import {focusFor} from '../style/tokens';
import {Actor} from './engine';
import {REACTIONS} from './reactions';

export const ReactTest = () => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig();
  const beat = frame * (30 / fps);
  return (
    <AbsoluteFill>
      <Stage cam={{pos: [0, 2.2, 10], target: [0, 1.1, 0], fov: 38}} focus={focusFor(10)} grade="fun">
        <Lights preset="void" />
        <Void />
        {REACTIONS.map((r, i) => (
          <Actor key={r} c={{who: 'hero', id: 'rt' + i, pos: [-4.2 + i * 1.4, 0], react: r, reactAt: 4, expr: 'neutral'}} beat={beat} sec={beat / 30} />
        ))}
      </Stage>
      <div style={{position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', gap: 70, color: '#f5ead2', fontSize: 26, fontFamily: 'Inter'}}>
        {REACTIONS.map((r) => <span key={r}>{r}</span>)}
      </div>
    </AbsoluteFill>
  );
};
