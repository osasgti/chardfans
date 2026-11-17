import {useMemo} from 'react';
import {RoundedBoxGeometry} from 'three-stdlib';

/** Drop-in replacement for <boxGeometry>: same args, but bevelled edges that catch rim light (master prompt D2). */
const cache = new Map<string, RoundedBoxGeometry>();
export const RB = ({args: [w = 1, h = 1, d = 1]}: {args: [number?, number?, number?]}) => {
  const geo = useMemo(() => {
    const r = Math.min(0.06, Math.max(0.004, Math.min(w, h, d) * 0.22));
    const k = `${w}|${h}|${d}|${r}`;
    if (!cache.has(k)) cache.set(k, new RoundedBoxGeometry(w, h, d, 3, r));
    return cache.get(k)!;
  }, [w, h, d]);
  return <primitive object={geo} attach="geometry" />;
};
