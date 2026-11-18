import {AbsoluteFill} from 'remotion';

/** 2D film layer (backlog #91 light leaks, #93 gate weave helper). Deterministic: everything is a function of `sec`. */
const LEAK: Record<string, [string, number]> = {
  wonder: ['255,170,90', 0.1], fun: ['255,150,80', 0.13], triumph: ['255,180,100', 0.14], tension: ['120,140,255', 0.05], consequence: ['0,0,0', 0],
};
export const FilmLook = ({sec, grade}: {sec: number; grade: string}) => {
  const [rgb, a] = LEAK[grade] ?? LEAK.wonder;
  if (!a) return null;
  const x = 8 + 10 * Math.sin(sec * 0.21), y = 12 + 8 * Math.sin(sec * 0.17 + 1.3), b = a * (0.75 + 0.25 * Math.sin(sec * 0.6));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen',
      background: `radial-gradient(ellipse 55% 45% at ${x}% ${y}%, rgba(${rgb},${b}) 0%, rgba(${rgb},0) 70%),
                   radial-gradient(ellipse 30% 40% at ${100 - x}% ${95 - y}%, rgba(255,90,140,${b * 0.45}) 0%, rgba(255,90,140,0) 70%)`}} />
  );
};
/** Sub-pixel gate weave for the 3D layer only (UI stays still). */
export const weave = (sec: number) => `translate(${(Math.sin(sec * 2.3) * 0.35 + Math.sin(sec * 5.1) * 0.2).toFixed(3)}px, ${(Math.sin(sec * 1.7 + 2) * 0.3).toFixed(3)}px)`;
