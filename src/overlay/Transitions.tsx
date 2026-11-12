import {AbsoluteFill, interpolate} from 'remotion';
/** All take `beat` relative to the transition point (0 = the cut). Place them in Main above the shots. */
export const DipToBlack = ({beat, len = 6}: {beat: number; len?: number}) => (
  <AbsoluteFill style={{background: '#000', pointerEvents: 'none',
    opacity: interpolate(beat, [-len, 0, len], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
);
/** Directional blur streak for whip cuts — pair with a fast camera yaw in both shots + `whip` SFX. */
export const WhipStreak = ({beat, len = 5}: {beat: number; len?: number}) => {
  const k = interpolate(beat, [-len, 0, len], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{pointerEvents: 'none', backdropFilter: `blur(${k * 18}px)`, transform: `scaleX(${1 + k * 0.08})`,
    background: `linear-gradient(90deg, transparent, rgba(255,240,210,${k * 0.15}), transparent)`}} />;
};
/** Impact flash (§35.2). */
export const Flash = ({beat, color = '#fff3cf', peak = 0.35}: {beat: number; color?: string; peak?: number}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', background: `radial-gradient(circle, ${color}, transparent 70%)`,
    opacity: beat < 0 ? 0 : interpolate(beat, [0, 2, 10], [peak, peak * 0.7, 0], {extrapolateRight: 'clamp'})}} />
);
