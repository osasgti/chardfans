import {AbsoluteFill, useCurrentFrame} from 'remotion';
/** Deterministic film grain: SVG turbulence seeded by the REAL frame (new pattern every frame, identical every render). */
export const Grain = ({opacity = 0.06}: {opacity?: number}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width="100%" height="100%">
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 997} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};
