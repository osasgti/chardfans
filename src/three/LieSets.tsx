/**
 * Sets for the lie-meter video (prompts/WHAT_IF_LIE_METER.md §12). All low-poly, meters, origin = room centre floor.
 * Each set: floor at y=0, back wall around z=-3, camera usually in +z looking toward -z.
 */
import React, {useMemo} from 'react';
import {CanvasTexture} from 'three';
import {random} from 'remotion';
import {RoundedBox} from '@react-three/drei';
import {C} from '../style/tokens';

/**
 * 3D text drawn onto a canvas texture. (drei/troika <Text> loads fonts in a web worker that cannot reach
 * staticFile() fonts in the render browser, so it never lays out — see CLAUDE.md §32.) Fonts here are the page's
 * already-loaded FontFaces (style/fonts.ts), so this is synchronous and deterministic.
 */
const Text = ({children, position, fontSize, color = '#fff', font = 'Cinzel'}: {
  children: React.ReactNode; position?: [number, number, number]; fontSize: number; color?: string; font?: string; maxWidth?: number; textAlign?: string;
}) => {
  const tex = useMemo(() => {
    const str = String(children); const px = 128; const c = document.createElement('canvas'); const ctx = c.getContext('2d')!;
    ctx.font = `700 ${px}px ${font}`; const w = Math.ceil(ctx.measureText(str).width) + 16;
    c.width = w; c.height = Math.ceil(px * 1.3);
    ctx.font = `700 ${px}px ${font}`; ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.fillText(str, 8, c.height / 2);
    const t = new CanvasTexture(c); t.anisotropy = 8; return {t, aspect: w / c.height};
  }, [children, color, font]);
  const h = fontSize * 1.3;
  return <mesh position={position}><planeGeometry args={[h * tex.aspect, h]} /><meshBasicMaterial map={tex.t} transparent toneMapped={false} depthWrite={false} /></mesh>;
};
const std = (color: string, r = 0.8, m = 0) => <meshStandardMaterial color={color} roughness={r} metalness={m} />;
const glow = (color: string, i = 2.5) => <meshStandardMaterial color={color} emissive={color} emissiveIntensity={i} toneMapped={false} />;

const Floor = ({color, planks = true, size = 30}: {color: string; planks?: boolean; size?: number}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[size, size]} />{std(color, 0.55)}</mesh>
    {planks && Array.from({length: 16}).map((_, i) => (
      <mesh key={i} position={[-8 + i, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.015, size]} />{std('#3a2418', 0.9)}</mesh>
    ))}
  </group>
);
const Wall = ({z = -3, color, w = 30, h = 6, x = 0, rotY = 0}: {z?: number; color: string; w?: number; h?: number; x?: number; rotY?: number}) => (
  <group rotation={[0, rotY, 0]}>
    <mesh position={[x, h / 2, z]} receiveShadow><boxGeometry args={[w, h, 0.2]} />{std(color, 0.92)}</mesh>
    <mesh position={[x, 0.06, z + 0.11]}><boxGeometry args={[w, 0.12, 0.03]} />{std('#e9e2f0', 0.6)}</mesh>
  </group>
);
/** A window with an emissive "sky" — a motivated light source (pair with a key light from the same side). */
export const Window = ({pos, w = 1.6, h = 1.3, sky = '#9fc4ff', i = 1.6}: {pos: [number, number, number]; w?: number; h?: number; sky?: string; i?: number}) => (
  <group position={pos}>
    <mesh><planeGeometry args={[w, h]} />{glow(sky, i)}</mesh>
    {[[0, h / 2, w + 0.14, 0.07], [0, -h / 2, w + 0.14, 0.07], [0, 0, 0.05, h], [0, 0, w, 0.05]].map(([x, y, ww, hh], k) => (
      <mesh key={k} position={[x, y, 0.03]}><boxGeometry args={[ww, hh, 0.06]} />{std('#efe8f5', 0.5)}</mesh>
    ))}
    {[-w / 2, w / 2].map((x) => <mesh key={x} position={[x, 0, 0.03]}><boxGeometry args={[0.07, h + 0.07, 0.06]} />{std('#efe8f5', 0.5)}</mesh>)}
  </group>
);
const PendantLamp = ({pos, color = '#ffcf8f', i = 3}: {pos: [number, number, number]; color?: string; i?: number}) => (
  <group position={pos}>
    <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.01, 0.01, 1.2, 6]} />{std('#222')}</mesh>
    <mesh><coneGeometry args={[0.28, 0.25, 24, 1, true]} />{std('#2b2233', 0.6)}</mesh>
    <mesh position={[0, -0.08, 0]}><sphereGeometry args={[0.07, 16, 16]} />{glow(color, i)}</mesh>
  </group>
);

/* ─────────── props ─────────── */
export const Phone = ({screen = '#9fb8ff', i = 2.2, text}: {screen?: string; i?: number; text?: string}) => (
  <group>
    <RoundedBox args={[0.16, 0.3, 0.02]} radius={0.015} castShadow>{std('#15121c', 0.35, 0.4)}</RoundedBox>
    <mesh position={[0, 0, 0.011]}><planeGeometry args={[0.14, 0.27]} />{glow(screen, i)}</mesh>
    {text && <Text position={[0, 0.02, 0.012]} fontSize={0.022} maxWidth={0.12} color="#14101f" textAlign="center">{text}</Text>}
  </group>
);
export const CerealBox = () => (
  <group>
    <RoundedBox args={[0.42, 0.6, 0.14]} radius={0.01} castShadow>{std('#f2b134', 0.6)}</RoundedBox>
    <mesh position={[0, 0.08, 0.071]}><circleGeometry args={[0.12, 24]} />{std('#ff7a2f', 0.5)}</mesh>
    {Array.from({length: 10}).map((_, k) => (
      <mesh key={k} position={[Math.cos(k / 10 * 6.28) * 0.15, 0.08 + Math.sin(k / 10 * 6.28) * 0.15, 0.072]} rotation={[0, 0, k / 10 * 6.28]}>
        <planeGeometry args={[0.05, 0.015]} />{std('#ffdd55', 0.5)}</mesh>
    ))}
    <Text position={[0, -0.16, 0.072]} fontSize={0.06} color="#5a1f12">SUNNY O'S</Text>
  </group>
);
export const CookieJar = ({open = true}: {open?: boolean}) => (
  <group>
    <mesh castShadow position={[0, 0.16, 0]}><cylinderGeometry args={[0.15, 0.14, 0.32, 32]} /><meshPhysicalMaterial color="#cfe6ff" transmission={0.6} roughness={0.1} transparent opacity={0.55} /></mesh>
    {[0.05, 0.12].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.12, 0.12, 0.03, 20]} />{std('#a8692f', 0.9)}</mesh>)}
    <mesh position={open ? [0.26, 0.02, 0.05] : [0, 0.34, 0]} rotation={open ? [0.2, 0, 1.2] : [0, 0, 0]} castShadow>
      <cylinderGeometry args={[0.155, 0.155, 0.04, 32]} />{std('#e05a5a', 0.5)}</mesh>
  </group>
);
export const Card = ({face = false}: {face?: boolean}) => (
  <RoundedBox args={[0.12, 0.17, 0.004]} radius={0.008} castShadow>{std(face ? '#f7f3ea' : '#b8323a', 0.6)}</RoundedBox>
);
export const ChipStack = ({n = 6, color = '#3d6fd6'}: {n?: number; color?: string}) => (
  <group>{Array.from({length: n}).map((_, k) => (
    <mesh key={k} position={[0, 0.012 + k * 0.016, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.014, 24]} />{std(k % 2 ? '#f4f0f8' : color, 0.4)}</mesh>
  ))}</group>
);
const Bed = () => (
  <group position={[-0.6, 0, -1.9]}>
    <RoundedBox args={[1.4, 0.35, 2.1]} radius={0.05} position={[0, 0.25, 0]} castShadow receiveShadow>{std('#5b4a72', 0.8)}</RoundedBox>
    <RoundedBox args={[1.36, 0.16, 1.5]} radius={0.06} position={[0, 0.5, 0.28]} castShadow>{std('#3d6fd6', 0.95)}</RoundedBox>
    <RoundedBox args={[0.9, 0.14, 0.35]} radius={0.06} position={[0, 0.52, -0.78]} castShadow>{std('#ece6f2', 0.95)}</RoundedBox>
    <RoundedBox args={[1.5, 1.0, 0.1]} radius={0.04} position={[0, 0.55, -1.05]} castShadow>{std('#6e4630', 0.6)}</RoundedBox>
  </group>
);

/* ─────────── sets ─────────── */
export const Bedroom = ({night = false}: {night?: boolean}) => (
  <group>
    <Floor color="#7a5236" />
    <Wall color="#4a3a6e" />
    <Wall color="#433463" rotY={Math.PI / 2} z={-3.2} />
    <Window pos={[1.6, 1.9, -2.88]} sky={night ? '#3b4f9a' : '#ffd9a8'} i={night ? 0.9 : 2.2} />
    <Bed />
    {/* nightstand + alarm clock */}
    <group position={[0.55, 0, -2.4]}>
      <RoundedBox args={[0.5, 0.55, 0.45]} radius={0.03} position={[0, 0.275, 0]} castShadow>{std('#6e4630', 0.6)}</RoundedBox>
      <RoundedBox args={[0.24, 0.12, 0.1]} radius={0.02} position={[0, 0.62, 0]} castShadow>{std('#1b1622', 0.5)}</RoundedBox>
      <mesh position={[0, 0.62, 0.051]}><planeGeometry args={[0.18, 0.07]} />{glow('#ff3b3b', 2.5)}</mesh>
    </group>
    {/* desk with lamp */}
    <group position={[2.3, 0, -2.2]}>
      <RoundedBox args={[1.3, 0.06, 0.6]} radius={0.01} position={[0, 0.75, 0]} castShadow receiveShadow>{std('#8a5a3c', 0.6)}</RoundedBox>
      {[[-0.6, -0.25], [0.6, -0.25], [-0.6, 0.25], [0.6, 0.25]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, 0.37, z]}><boxGeometry args={[0.05, 0.74, 0.05]} />{std('#5a3a26')}</mesh>)}
      <mesh position={[0.45, 1.05, -0.1]}><sphereGeometry args={[0.07, 16, 16]} />{glow('#ffcf8f', night ? 3 : 1)}</mesh>
    </group>
    {/* poster + rug */}
    <mesh position={[-2.2, 2.1, -2.88]}><planeGeometry args={[0.8, 1.1]} />{std('#c8323a', 0.9)}</mesh>
    <mesh position={[0.2, 0.004, -0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.3, 48]} />{std('#3b2d5c', 1)}</mesh>
  </group>
);

export const Kitchen = ({night = false, dawn = false}: {night?: boolean; dawn?: boolean}) => (
  <group>
    <Floor color="#c9b8a6" planks={false} />
    {/* checker tiles */}
    {Array.from({length: 64}).map((_, k) => ((k + Math.floor(k / 8)) % 2 ? null :
      <mesh key={k} position={[-4 + (k % 8), 0.002, -4 + Math.floor(k / 8)]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1, 1]} />{std('#a8968a', 0.5)}</mesh>))}
    <Wall color="#6a5a8a" />
    <Window pos={[-1.8, 1.9, -2.88]} sky={night ? '#22305e' : dawn ? '#ffc078' : '#fff1d6'} i={night ? 0.5 : 2.4} />
    {/* counter run */}
    <group position={[0.9, 0, -2.55]}>
      <RoundedBox args={[3.2, 0.9, 0.7]} radius={0.02} position={[0, 0.45, 0]} castShadow receiveShadow>{std('#e9e2f0', 0.6)}</RoundedBox>
      <mesh position={[0, 0.92, 0]}><boxGeometry args={[3.24, 0.05, 0.74]} />{std('#3a3346', 0.3)}</mesh>
      {/* stove */}
      {[[-0.3, -0.12], [-0.3, 0.12], [0.05, -0.12], [0.05, 0.12]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.95, z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.06, 0.09, 24]} />{std('#111', 0.4)}</mesh>))}
      <group position={[-0.3, 1.0, -0.12]}><mesh castShadow><cylinderGeometry args={[0.16, 0.13, 0.08, 24]} />{std('#2a2a30', 0.35, 0.6)}</mesh>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />{std('#2a2a30', 0.4, 0.5)}</mesh></group>
      {/* upper cabinets */}
      <RoundedBox args={[3.2, 0.7, 0.35]} radius={0.02} position={[0, 2.1, -0.15]} castShadow>{std('#d9cfe6', 0.6)}</RoundedBox>
    </group>
    {/* fridge */}
    <group position={[2.9, 0, -2.5]}>
      <RoundedBox args={[0.8, 1.9, 0.75]} radius={0.04} position={[0, 0.95, 0]} castShadow receiveShadow>{std('#eef0f4', 0.35, 0.1)}</RoundedBox>
      <mesh position={[-0.3, 1.2, 0.39]}><boxGeometry args={[0.03, 0.5, 0.04]} />{std('#9aa0aa', 0.3, 0.8)}</mesh>
    </group>
    {/* table + chairs (also used as the dining room) */}
    <group position={[0, 0, 0]}>
      <RoundedBox args={[1.6, 0.06, 0.95]} radius={0.02} position={[0, 0.76, 0]} castShadow receiveShadow>{std('#8a5a3c', 0.55)}</RoundedBox>
      {[[-0.72, -0.4], [0.72, -0.4], [-0.72, 0.4], [0.72, 0.4]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, 0.38, z]} castShadow><boxGeometry args={[0.06, 0.76, 0.06]} />{std('#5a3a26')}</mesh>)}
      {[[-1.05, 0, Math.PI / 2], [1.05, 0, -Math.PI / 2], [0, -0.75, 0], [0, 0.75, Math.PI]].map(([x, z, r]) => (
        <group key={`${x}${z}`} position={[x, 0, z]} rotation={[0, r, 0]}>
          <RoundedBox args={[0.42, 0.05, 0.42]} radius={0.02} position={[0, 0.46, 0]} castShadow>{std('#6e4630', 0.6)}</RoundedBox>
          <RoundedBox args={[0.42, 0.45, 0.04]} radius={0.02} position={[0, 0.7, -0.2]} castShadow>{std('#6e4630', 0.6)}</RoundedBox>
        </group>))}
      {/* plates + mashed potatoes */}
      {[[-0.45, 0], [0.45, 0], [0, -0.25]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, 0.8, z]} receiveShadow><cylinderGeometry args={[0.13, 0.11, 0.015, 32]} />{std('#f6f2fa', 0.3)}</mesh>)}
      <mesh position={[0, 0.84, 0.18]} scale={[1, 0.55, 1]} castShadow><sphereGeometry args={[0.12, 24, 16]} />{std('#f3e3b5', 0.9)}</mesh>
    </group>
    <PendantLamp pos={[0, 2.3, 0]} i={night ? 4 : 2} />
  </group>
);

export const Classroom = ({dim = false}: {dim?: boolean}) => (
  <group>
    <Floor color="#9b8f84" planks={false} />
    <Wall color="#5c4f86" z={-4} />
    <Window pos={[-4.3, 1.9, -1]} sky="#fff6e0" i={dim ? 0.8 : 2.4} />
    {/* whiteboard */}
    <group position={[0.5, 1.6, -3.88]}>
      <mesh><planeGeometry args={[3.2, 1.3]} />{std('#f4f6f8', 0.25)}</mesh>
      <mesh position={[0, 0, -0.01]}><planeGeometry args={[3.32, 1.42]} />{std('#9aa0aa', 0.3, 0.6)}</mesh>
      <Text position={[-0.6, 0.25, 0.01]} fontSize={0.12} color="#2a3a8a">CHAPTER 7</Text>
      <Text position={[-0.4, -0.05, 0.01]} fontSize={0.07} color="#2a3a8a">the industrial revolution</Text>
    </group>
    {/* clock */}
    <group position={[2.8, 2.6, -3.88]}><mesh><circleGeometry args={[0.25, 32]} />{std('#f6f2fa', 0.4)}</mesh>
      <mesh position={[0, 0.06, 0.01]}><boxGeometry args={[0.02, 0.14, 0.01]} />{std('#111')}</mesh></group>
    {/* desks grid 4×3 */}
    {Array.from({length: 12}).map((_, k) => {
      const x = -2.1 + (k % 4) * 1.4, z = -2.2 + Math.floor(k / 4) * 1.5;
      return (<group key={k} position={[x, 0, z]}>
        <RoundedBox args={[1.0, 0.05, 0.6]} radius={0.01} position={[0, 0.75, 0]} castShadow receiveShadow>{std('#c9a27a', 0.6)}</RoundedBox>
        <mesh position={[0, 0.37, 0]}><boxGeometry args={[0.9, 0.74, 0.04]} />{std('#55606e', 0.5, 0.4)}</mesh>
        {random('paper' + k) > 0.5 && <mesh position={[0.1, 0.78, 0]} rotation={[-Math.PI / 2, 0, random('pr' + k)]}><planeGeometry args={[0.21, 0.29]} />{std('#f8f6f0', 0.9)}</mesh>}
      </group>);
    })}
    {/* teacher desk */}
    <RoundedBox args={[1.6, 0.8, 0.7]} radius={0.02} position={[-2.2, 0.4, -3.1]} castShadow receiveShadow>{std('#6e4630', 0.6)}</RoundedBox>
  </group>
);

export const Gym = () => (
  <group>
    <Floor color="#b07a45" />
    <Wall color="#3b2d5c" z={-5} />
    {/* hoop */}
    <group position={[3.5, 3.0, -4.8]}><mesh><planeGeometry args={[1.6, 1.0]} />{std('#f4f0f8', 0.4)}</mesh>
      <mesh position={[0, -0.4, 0.3]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.23, 0.015, 8, 24]} />{std('#ff6a2a', 0.4)}</mesh></group>
    {/* banner */}
    <group position={[-0.5, 3.5, -4.85]}>
      <mesh><planeGeometry args={[5.0, 0.9]} />{std('#5a1626', 0.8)}</mesh>
      <mesh position={[0, 0, -0.01]}><planeGeometry args={[5.1, 1.0]} />{std(C.gold, 0.3, 0.6)}</mesh>
      <Text position={[0, 0.12, 0.01]} fontSize={0.36} color={C.gold}>CASINO NIGHT</Text>
      <Text position={[0, -0.25, 0.01]} fontSize={0.13} color={C.cream}>SCHOOL FUNDRAISER · FAKE CHIPS</Text>
    </group>
    {/* string lights */}
    {Array.from({length: 40}).map((_, k) => {
      const x = -6 + k * 0.3, y = 4.0 - Math.sin((k % 20) / 20 * Math.PI) * 0.5;
      return <mesh key={k} position={[x, y, -2 + (k >= 20 ? 1.5 : 0)]}><sphereGeometry args={[0.035, 8, 8]} />{glow(k % 3 ? '#ffd27a' : '#ff8fd0', 4)}</mesh>;
    })}
    {/* card table with felt */}
    <group position={[0, 0, 0]}>
      <RoundedBox args={[2.4, 0.12, 1.3]} radius={0.06} position={[0, 0.78, 0]} castShadow receiveShadow>{std('#3a2418', 0.5)}</RoundedBox>
      <mesh position={[0, 0.845, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.2, 1.1]} /><meshStandardMaterial color="#1f6b3a" roughness={1} /></mesh>
      <mesh position={[0, 0.39, 0]} castShadow><cylinderGeometry args={[0.1, 0.25, 0.78, 16]} />{std('#2a1a12', 0.6)}</mesh>
      <group position={[0.65, 0.85, 0.2]}><ChipStack n={7} /></group>
      <group position={[0.8, 0.85, -0.1]}><ChipStack n={5} color="#c8323a" /></group>
      <group position={[-0.7, 0.85, 0.15]}><ChipStack n={9} color="#2f8f8a" /></group>
      {[-0.2, 0, 0.2].map((x, k) => <group key={k} position={[x, 0.852, 0.25]} rotation={[-Math.PI / 2, 0, 0]}><Card face={k === 1} /></group>)}
    </group>
    <PendantLamp pos={[0, 2.4, 0]} color="#ffb85c" i={5} />
    <PendantLamp pos={[-3.5, 2.6, -2]} color="#ffb85c" i={4} />
  </group>
);

/** Bathroom with a MIRROR at z = MIRROR_Z. Reflections are faked: shots render a mirrored copy of the cast behind it. */
export const MIRROR_Z = -1.2;
export const Bathroom = ({flicker = 1}: {flicker?: number}) => (
  <group>
    <Floor color="#cfd6de" planks={false} />
    {/* tiled walls: back wall with a mirror-sized opening, built from 4 boxes */}
    {[[-2.6, 1.5, 3.2, 3], [2.6, 1.5, 3.2, 3], [0, 0.45, 2, 0.9], [0, 2.6, 2, 0.8]].map(([x, y, w, h]) => (
      <mesh key={`${x}${y}`} position={[x, y, MIRROR_Z - 0.06]} receiveShadow><boxGeometry args={[w, h, 0.1]} />{std('#b9c6cf', 0.35)}</mesh>))}
    {Array.from({length: 18}).map((_, k) => Math.abs(-4 + k * 0.45) < 1.08 ? null : <mesh key={k} position={[-4 + k * 0.45, 1.5, MIRROR_Z - 0.005]}><planeGeometry args={[0.012, 3]} />{std('#8d9aa4', 0.5)}</mesh>)}
    {/* mirror frame + glass */}
    {/* mirror frame: 4 thin bars (a solid box here would hide the reflection) */}
    {[[0, 0.66, 2.06, 0.05], [0, -0.66, 2.06, 0.05], [-1.0, 0, 0.05, 1.36], [1.0, 0, 0.05, 1.36]].map(([x, y, w, h]) => (
      <mesh key={`${x}${y}`} position={[x, 1.55 + y, MIRROR_Z]}><boxGeometry args={[w, h, 0.04]} />{std('#c8ccd2', 0.25, 0.9)}</mesh>))}
    <mesh position={[0, 1.55, MIRROR_Z + 0.025]}><planeGeometry args={[1.96, 1.26]} /><meshPhysicalMaterial color="#cfe3ff" transparent opacity={0.12} roughness={0.05} metalness={0} /></mesh>
    {/* sink */}
    <RoundedBox args={[1.0, 0.18, 0.5]} radius={0.06} position={[0, 0.85, MIRROR_Z + 0.3]} castShadow receiveShadow>{std('#f4f6f8', 0.2)}</RoundedBox>
    <mesh position={[0, 0.42, MIRROR_Z + 0.3]} castShadow><cylinderGeometry args={[0.1, 0.14, 0.84, 16]} />{std('#f4f6f8', 0.25)}</mesh>
    <mesh position={[0, 1.02, MIRROR_Z + 0.12]} rotation={[0.6, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />{std('#c8ccd2', 0.2, 0.9)}</mesh>
    {/* the fluorescent tube (the only light) */}
    <mesh position={[0, 2.45, MIRROR_Z + 0.15]}><boxGeometry args={[1.2, 0.05, 0.06]} />{glow('#e8f4ff', 3 * flicker)}</mesh>
  </group>
);
/** The reflected room behind the mirror (dark tiles), so the mirror doesn't show the void. */
export const BathroomReflection = () => (
  <group>
    <mesh position={[0, 1.5, MIRROR_Z * 2 - 2.5]}><boxGeometry args={[6, 3.2, 0.1]} />{std('#7f8d97', 0.4)}</mesh>
    <mesh position={[0, 0, MIRROR_Z * 2 - 1.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[6, 3]} />{std('#aab3bb', 0.5)}</mesh>
  </group>
);

export const Void = ({ring = true}: {ring?: boolean}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} />{std('#120e1c', 0.9)}</mesh>
    {ring && <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.9, 1.0, 64]} />{glow('#6a5a9a', 0.6)}</mesh>}
  </group>
);

export const Street = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow><planeGeometry args={[40, 8]} />{std('#3a3542', 0.8)}</mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, -1.5]} receiveShadow><planeGeometry args={[40, 3]} />{std('#8f8a94', 0.8)}</mesh>
    <mesh position={[0, 0.04, -0.02]}><boxGeometry args={[40, 0.08, 0.15]} />{std('#77727c')}</mesh>
    {[-6, -2, 2, 6].map((x) => <mesh key={x} position={[x, 0.005, 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.2, 0.12]} />{std('#e8e2c8', 0.6)}</mesh>)}
    {/* bus shelter */}
    <group position={[-1.5, 0, -2.2]}>
      <mesh position={[0, 1.2, -0.4]}><boxGeometry args={[2.4, 2.4, 0.04]} /><meshPhysicalMaterial color="#bcd4ff" transparent opacity={0.25} roughness={0.1} /></mesh>
      <mesh position={[0, 2.45, 0]}><boxGeometry args={[2.6, 0.08, 1.0]} />{std('#3b2d5c', 0.5)}</mesh>
      <RoundedBox args={[1.8, 0.08, 0.35]} radius={0.02} position={[0, 0.5, -0.2]}>{std('#6e4630', 0.6)}</RoundedBox>
    </group>
    {/* buildings + billboard */}
    {Array.from({length: 9}).map((_, k) => (
      <mesh key={k} position={[-12 + k * 3, 3 + random('bh' + k) * 3, -6]} castShadow><boxGeometry args={[2.8, 6 + random('bh' + k) * 6, 2]} />{std(['#4a3a6e', '#5c4f86', '#3f5466'][k % 3], 0.9)}</mesh>))}
    <group position={[3.5, 5.2, -4.9]}>
      <mesh><planeGeometry args={[4.2, 2.2]} />{std('#ffd166', 0.5)}</mesh>
      <Text position={[0, 0.45, 0.01]} fontSize={0.34} color="#c8323a">LOSE 10 LBS</Text>
      <Text position={[0, -0.05, 0.01]} fontSize={0.34} color="#c8323a">IN A WEEK!</Text>
      <mesh position={[0, -1.6, -0.1]}><boxGeometry args={[0.2, 1.2, 0.2]} />{std('#55606e', 0.5, 0.5)}</mesh>
    </group>
  </group>
);

export const Rooftop = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 12]} />{std('#5a5466', 0.9)}</mesh>
    <mesh position={[0, 0.5, -1.6]} castShadow receiveShadow><boxGeometry args={[12, 1.0, 0.3]} />{std('#6d6578', 0.8)}</mesh>
    {/* sky dome gradient: big emissive back plane + sun */}
    <mesh position={[0, 6, -30]}><planeGeometry args={[120, 30]} /><meshBasicMaterial color="#ff9a6a" toneMapped={false} /></mesh>
    <mesh position={[0, 16, -29.9]}><planeGeometry args={[120, 14]} /><meshBasicMaterial color="#7a5aa8" toneMapped={false} /></mesh>
    <mesh position={[4, 3.2, -29]}><circleGeometry args={[2.2, 48]} /><meshBasicMaterial color="#ffd9a0" toneMapped={false} /></mesh>
    {/* city blocks with lit windows */}
    {Array.from({length: 24}).map((_, k) => {
      const h = 3 + random('ch' + k) * 9;
      return (<group key={k} position={[-24 + k * 2.1, h / 2 - 6, -14 - random('cz' + k) * 8]}>
        <mesh><boxGeometry args={[1.8, h, 1.8]} />{std('#2a2240', 0.9)}</mesh>
        {random('cw' + k) > 0.3 && <mesh position={[0, h * 0.2, 0.91]}><planeGeometry args={[0.3, 0.3]} />{glow('#ffcf8f', 3)}</mesh>}
      </group>);
    })}
  </group>
);

export const HallwayNight = () => null; // the Hallway set + `hallway` preset with dim key (see LieShot light overrides)

export const SETS: Record<string, React.FC<any>> = {Bedroom, Kitchen, Classroom, Gym, Bathroom, Void, Street, Rooftop};
