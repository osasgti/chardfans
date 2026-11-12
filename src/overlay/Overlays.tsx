import {spring, useVideoConfig, interpolate, Easing} from 'remotion';
import {PerspectiveCamera, Vector3} from 'three';
import {C, W, H, ease} from '../style/tokens';
import {TITLE, UI} from '../style/fonts';
import type {Cam} from '../three/Stage';

/** Pure-math projection — same params as the 3D camera, no render-order dependence. */
export const project = (cam: Cam, p: [number, number, number]) => {
  const c = new PerspectiveCamera(cam.fov, W / H, 0.1, 40);
  c.position.set(...cam.pos); c.lookAt(new Vector3(...cam.target)); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = new Vector3(...p).project(c);
  const m = 80;
  return {x: Math.min(W - m, Math.max(m, (v.x * 0.5 + 0.5) * W)), y: Math.min(H - m, Math.max(m, (-v.y * 0.5 + 0.5) * H))};
};

/** Word-by-word cinematic title: fade, rise, de-blur, tracking tightens. */
export const Title = ({words, frame, start = 0, size = 84, y = 0.5, emphasis = [] as number[], out}: {
  words: string[]; frame: number; start?: number; size?: number; y?: number; emphasis?: number[]; out?: number;
}) => {
  const fadeOut = out !== undefined ? ease(frame, [out, out + 10], [1, 0]) : 1;
  const yOut = out !== undefined ? ease(frame, [out, out + 10], [0, -10]) : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y * H - size, textAlign: 'center', opacity: fadeOut, transform: `translateY(${yOut}px)`}}>
      {words.map((w, i) => {
        const f = frame - start - i * 5;
        const o = ease(f, [0, 12], [0, 1]);
        const em = emphasis.includes(i);
        return (
          <span key={i} style={{
            display: 'inline-block', margin: `0 ${size * 0.22}px`, opacity: o,
            transform: `translateY(${ease(f, [0, 12], [16, 0])}px)`, filter: `blur(${ease(f, [0, 12], [8, 0])}px)`,
            fontFamily: TITLE, fontWeight: em ? 700 : 600, fontSize: em ? size * 1.08 : size,
            letterSpacing: `${ease(f, [0, 18], [0.32, 0.14])}em`,
            color: em ? 'transparent' : C.cream,
            backgroundImage: em ? `linear-gradient(100deg, ${C.goldDeep} 0%, ${C.gold} ${30 + (frame % 90)}%, #fff3cf ${40 + (frame % 90)}%, ${C.gold} ${50 + (frame % 90)}%, ${C.goldDeep} 100%)` : undefined,
            WebkitBackgroundClip: em ? 'text' : undefined, backgroundClip: em ? 'text' : undefined,
            textShadow: em ? undefined : '0 0 22px rgba(242,196,107,.45), 0 2px 0 rgba(0,0,0,.45)',
          }}>{w}</span>
        );
      })}
    </div>
  );
};

/** Small top tag like "SINCE LAST TUESDAY". */
export const Tag = ({text, frame, start, out}: {text: string; frame: number; start: number; out: number}) => (
  <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontFamily: TITLE, fontWeight: 600,
    fontSize: 30, letterSpacing: '0.24em', color: C.cream, textShadow: '0 0 14px rgba(242,196,107,.4)',
    opacity: Math.min(ease(frame, [start, start + 8], [0, 1]), ease(frame, [out, out + 8], [1, 0]))}}>{text}</div>
);

/** The signature odds badge with ring + rolling number, anchored to a screen point. */
export const OddsBadge = ({frame, start, x, y, label, steps, anchor}: {
  frame: number; start: number; x: number; y: number; label: string;
  steps: {at: number; value: number}[]; anchor?: {x: number; y: number};
}) => {
  const {fps} = useVideoConfig();
  const f = frame - start;
  if (f < 0) return null;
  const pop = spring({frame: f, fps, config: {damping: 11, mass: 0.7}});
  // value: roll between steps with ease-out-expo
  let value = 0, flash = 0, lastAt = 0;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i], prev = i === 0 ? 0 : steps[i - 1].value;
    if (f >= s.at) {
      value = interpolate(f, [s.at, s.at + 22], [prev, s.value], {easing: Easing.out(Easing.exp), extrapolateRight: 'clamp'});
      lastAt = s.at;
    }
  }
  const sinceChange = f - lastAt;
  if (lastAt > 0) flash = interpolate(sinceChange, [0, 4, 10], [1, 0.6, 0], {extrapolateRight: 'clamp'});
  const tick = lastAt > 0 ? 1 + 0.07 * Math.sin(Math.min(1, sinceChange / 8) * Math.PI) : 1;
  const float = Math.sin(frame / 30 * 2) * 4;
  const R = 17, circ = 2 * Math.PI * R;
  const shake = flash > 0.3 ? Math.sin(frame * 3.1) * 3 : 0;
  const pulse = lastAt > 0 ? ease(sinceChange, [0, 18], [0, 1]) : 1;
  return (
    <>
      {anchor && (
        <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={H}>
          <line x1={x} y1={y + 40 + float} x2={anchor.x} y2={anchor.y} stroke={C.gold} strokeWidth={2} strokeDasharray="3 7"
            strokeLinecap="round" opacity={ease(f, [6, 16], [0, 0.8])} />
          <circle cx={anchor.x} cy={anchor.y} r={5} fill={C.gold} opacity={ease(f, [10, 16], [0, 1])} />
        </svg>
      )}
      <div style={{position: 'absolute', left: x + shake, top: y + float, transform: `translate(-50%,-50%) scale(${(0.6 + 0.4 * pop) * tick})`, opacity: Math.min(1, f / 6)}}>
        {pulse < 1 && (
          <div style={{position: 'absolute', inset: -10, borderRadius: 999, border: `2px solid ${C.gold}`,
            transform: `scale(${1 + pulse * 0.5})`, opacity: 1 - pulse}} />
        )}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 30px 12px 14px', borderRadius: 999,
          background: C.uiBg, border: `2px solid ${flash > 0 ? `rgba(255,255,255,${0.5 + flash / 2})` : C.gold}`,
          boxShadow: `0 0 ${28 + flash * 30}px rgba(242,196,107,${0.4 + flash * 0.4}), inset 0 0 18px rgba(242,196,107,.12)`, backdropFilter: 'blur(4px)'}}>
          <svg width={48} height={48} viewBox="0 0 48 48">
            <circle cx={24} cy={24} r={R} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={5} />
            <circle cx={24} cy={24} r={R} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)} transform="rotate(-90 24 24)"
              style={{filter: `drop-shadow(0 0 4px ${C.gold})`}} />
          </svg>
          <div style={{lineHeight: 1}}>
            <div style={{fontFamily: UI, fontWeight: 700, fontSize: 15, letterSpacing: '0.14em', color: C.cream, opacity: 0.8}}>{label}</div>
            <div style={{fontFamily: TITLE, fontWeight: 700, fontSize: 42, color: C.gold, fontVariantNumeric: 'tabular-nums', marginTop: 4,
              textShadow: '0 0 12px rgba(242,196,107,.6)'}}>{Math.round(value)}%</div>
          </div>
        </div>
      </div>
    </>
  );
};

/** Letterbox bars that slide in. */
export const Letterbox = ({frame, start = 0}: {frame: number; start?: number}) => {
  const h = ease(frame, [start, start + 20], [0, 110]);
  return (<>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: h, background: '#000'}} />
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: h, background: '#000'}} />
  </>);
};
