/** The LIE meter (prompts/WHAT_IF_LIE_METER.md §5): OddsBadge language + gold→amber→red ramp, speech-timed count. */
import {interpolate, Easing, spring, random} from 'remotion';
import {C, W, H} from '../style/tokens';
import {TITLE, UI} from '../style/fonts';

export const rampColor = (v: number) => (v <= 30 ? C.gold : v < 70 ? '#f29a3b' : '#e0464f');

export const LieMeter = ({beat, start, land, x, y, anchor, value, from = 0, label = 'LIE', mode = 'normal', small = false, dur}: {
  beat: number; start: number; land: number; x: number; y: number; anchor?: {x: number; y: number}; value: number; from?: number;
  label?: string; mode?: 'normal' | 'mirror' | 'q' | 'fire' | 'fade'; small?: boolean; dur: number;
}) => {
  const f = beat - start;
  if (f < 0) return null;
  const pop = spring({frame: f, fps: 30, config: {damping: 11, mass: 0.7}});
  const v = interpolate(beat, [start + 4, land], [from, value], {easing: Easing.out(Easing.exp), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const since = beat - land;
  const landed = since >= 0;
  const flash = landed ? interpolate(since, [0, 3, 10], [1, 0.6, 0], {extrapolateRight: 'clamp'}) : 0;
  const tick = landed ? 1 + 0.08 * Math.sin(Math.min(1, since / 8) * Math.PI) : 1;
  const col = mode === 'q' ? C.cream : rampColor(v);
  const hot = v > 90 && mode !== 'q';
  const jitter = hot ? (random('j' + Math.floor(beat)) - 0.5) * 3 : 0;
  const out = interpolate(beat, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeAway = mode === 'fade' && landed ? interpolate(since, [10, 40], [1, 0], {extrapolateRight: 'clamp'}) : 1;
  const opacity = Math.min(1, f / 6) * out * fadeAway;
  const float = Math.sin((beat / 30) * 2) * 4;
  const R = small ? 12 : 17, circ = 2 * Math.PI * R, sc = small ? 0.62 : 1;
  const pulse = landed ? interpolate(since, [0, 18], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  const cx = Math.min(W - 160, Math.max(160, x)), cy = Math.min(H - 230, Math.max(200, y));
  return (
    <>
      {anchor && !small && (
        <svg style={{position: 'absolute', left: 0, top: 0, opacity}} width={W} height={H}>
          <line x1={cx} y1={cy + 40 * sc + float} x2={anchor.x} y2={anchor.y} stroke={col} strokeWidth={2} strokeDasharray="3 7" strokeLinecap="round" opacity={0.75} />
          <circle cx={anchor.x} cy={anchor.y} r={4} fill={col} />
        </svg>
      )}
      <div style={{position: 'absolute', left: cx + jitter, top: cy + float + jitter * 0.6, opacity,
        transform: `translate(-50%,-50%) scale(${(0.6 + 0.4 * pop) * tick * sc}) ${mode === 'mirror' ? 'scaleX(-1)' : ''}`}}>
        {pulse < 1 && <div style={{position: 'absolute', inset: -10, borderRadius: 999, border: `2px solid ${col}`, transform: `scale(${1 + pulse * 0.5})`, opacity: 1 - pulse}} />}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 30px 12px 14px', borderRadius: 999, background: C.uiBg,
          border: `2px solid ${flash > 0 ? `rgba(255,255,255,${0.5 + flash / 2})` : col}`,
          boxShadow: `0 0 ${26 + flash * 30 + (hot ? 18 : 0)}px ${col}${hot ? 'cc' : '88'}, inset 0 0 18px ${col}22`}}>
          <svg width={48} height={48} viewBox="0 0 48 48">
            <circle cx={24} cy={24} r={R} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={5} />
            {mode !== 'q' && <circle cx={24} cy={24} r={R} fill="none" stroke={col} strokeWidth={5} strokeLinecap="round" strokeDasharray={circ}
              strokeDashoffset={circ * (1 - v / 100)} transform="rotate(-90 24 24)" style={{filter: `drop-shadow(0 0 4px ${col})`}} />}
          </svg>
          <div style={{lineHeight: 1}}>
            <div style={{fontFamily: UI, fontWeight: 700, fontSize: 15, letterSpacing: '0.16em', color: C.cream, opacity: 0.8}}>{label}</div>
            <div style={{fontFamily: TITLE, fontWeight: 700, fontSize: 42, color: col, fontVariantNumeric: 'tabular-nums', marginTop: 4,
              textShadow: `0 0 12px ${col}aa`}}>{mode === 'q' ? '?' : `${Math.round(v)}%`}</div>
          </div>
        </div>
        {mode === 'fire' && landed && Array.from({length: 14}).map((_, i) => {
          const life = ((beat * (0.6 + random('e' + i) * 0.6) + i * 9) % 40) / 40;
          return <div key={i} style={{position: 'absolute', left: `${10 + random('ex' + i) * 80}%`, top: -life * 90, width: 6, height: 6, borderRadius: 6,
            background: i % 2 ? '#ffb347' : '#ff5a36', opacity: 1 - life, boxShadow: '0 0 8px #ff7a3a', transform: `scale(${1 - life * 0.6})`}} />;
        })}
      </div>
    </>
  );
};
