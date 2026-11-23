/**
 * Thumbnail composition (CLAUDE.md §43, MASTER_PROMPT_ANIMATION F12): built as a design, not a frame grab.
 * The face is about 40% of the frame height on the right third; the glowing wrist thread runs to the left; ≤3 words of big type
 * with a dark outline on the left third. Three variants via the `v` prop (0 shock, 1 happy, 2 worried + grey thread).
 * Render: npx remotion still src/index.ts PromiseThumb out/thumb_A.png --props='{"v":0}'
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LieShot, ShotSpec} from '../lie/engine';
import {C} from '../style/tokens';

const VARIANTS = [
  {expr: 'shock', words: ['EVERY', 'PROMISE', 'GLOWS'], state: 'held', color: C.gold},
  {expr: 'happy', words: ['KEEP', 'IT'], state: 'burst', color: C.gold},
  {expr: 'worried', words: ['IT', 'SNAPPED'], state: 'broken', color: '#c8c2d4'},
] as const;

export const PromiseThumb = ({v = 0}: {v?: number}) => {
  const V = VARIANTS[v] ?? VARIANTS[0];
  const spec: ShotSpec = {
    line: 'THUMB', set: 'Void', light: 'void', grade: 'wonder', exposure: 1.3, dust: true, focusOn: 0,
    cam: {on: [-0.55, 1.2, 0], size: 'mcu', yaw: -20, pitch: 2, move: 'lock'},
    cast: [{who: 'hero', id: 'kai', pos: [0.35, 0], rot: -35, expr: V.expr as never, pose: 'point', turn: 10, tilt: 6}],
    threads: [{from: 0, to: [-2.6, 1.6, 0.3], state: V.state as never, at: 0, thick: 0.016}],
  } as ShotSpec;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <LieShot spec={spec} beat={V.state === 'burst' ? 14 : 20} dur={60} sec={0} seed="thumb" lines={[]} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 28% 50%, rgba(10,6,18,.75) 0%, rgba(10,6,18,0) 55%)'}} />
      <div style={{position: 'absolute', left: 80, top: 0, bottom: 0, maxWidth: 820, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        {V.words.map((w, i) => (
          <div key={i} style={{fontFamily: 'Cinzel', fontWeight: 700, fontSize: i === V.words.length - 1 ? 160 : 118, lineHeight: 1.0, letterSpacing: '0.04em',
            color: i === V.words.length - 1 ? V.color : C.cream, WebkitTextStroke: '6px rgba(12,8,18,.9)', paintOrder: 'stroke fill',
            textShadow: i === V.words.length - 1 ? `0 0 40px ${V.color}88` : '0 6px 0 rgba(0,0,0,.5)'}}>{w}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
