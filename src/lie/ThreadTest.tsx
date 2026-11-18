/**
 * Dev comp: thread look-dev gate (prompts/WHAT_IF_PROMISE_THREADS.md §6.4).
 * props.state picks the panel: fresh | held | slack | broken | burst | swarm. Frame 0–60 at 30 fps.
 */
import {AbsoluteFill, useCurrentFrame, useVideoConfig, getInputProps} from 'remotion';
import {Stage, Lights} from '../three/Stage';
import {Void} from '../three/LieSets';
import {focusFor} from '../style/tokens';
import {Actor, wristR, chestOf, CastSpec} from './engine';
import {Thread, ThreadSwarm, ThreadState} from '../three/Thread';

export const ThreadTest = () => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig();
  const beat = frame * (30 / fps), sec = beat / 30;
  const mode = ((getInputProps() as {state?: string}).state ?? 'held') as ThreadState | 'swarm';
  const A: CastSpec = {who: 'mom', id: 'tt-a', pos: [-1.2, 0], rot: 35, expr: 'happy', pose: 'hold'};
  const Bc: CastSpec = {who: 'hero', id: 'tt-b', pos: [1.2, 0], rot: -35, expr: mode === 'broken' ? 'sad' : 'neutral'};
  const wrist = wristR(A, 0.9), chest = chestOf(Bc);
  return (
    <AbsoluteFill>
      <Stage cam={{pos: [0, 1.5, 5.2], target: [0, 1.0, 0], fov: 32}} focus={focusFor(5.2)} grade="wonder">
        <Lights preset="void" />
        <Void />
        <Actor c={A} beat={beat} sec={sec} />
        <Actor c={Bc} beat={beat} sec={sec} />
        {mode === 'swarm'
          ? <ThreadSwarm from={wristR(Bc)} t={sec} seed="sw" />
          : <Thread from={wrist} to={chest} state={mode} t={sec} thickness={0.012} seed="tt" />}
      </Stage>
      <div style={{position: 'absolute', bottom: 60, width: '100%', textAlign: 'center', color: '#f5ead2', fontFamily: 'Inter', fontSize: 40, letterSpacing: '0.2em'}}>{mode.toUpperCase()}</div>
    </AbsoluteFill>
  );
};
