import {RB} from './RB';
import React from 'react';
import {random} from 'remotion';
import {AdditiveBlending} from 'three';
import {C} from '../style/tokens';
import {Face, Expr} from './Face';
import {FAST} from './Stage';

export type Hair = 'none' | 'beanie' | 'cap' | 'capBack' | 'bun' | 'ponytail' | 'bob' | 'visor';
export type PillProps = {
  id: string; frame: number; position?: [number, number, number]; rotY?: number;
  hoodie?: string; expr?: Expr; hat?: Hair; hatColor?: string; glasses?: boolean; scale?: number; mouth?: number; turnLag?: number; lean?: number; armLx?: number; armRx?: number; nod?: number; brow?: number; rightHand?: React.ReactNode; legSwing?: number; forceBlink?: number;
  armL?: number; armR?: number; headTilt?: number; headTurn?: number; squash?: number; look?: number; seg?: number;
};

const skinMat = <meshPhysicalMaterial color={C.skin} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} sheen={0.4} sheenColor="#ffffff" />;

export const Pill = ({id, frame, position = [0, 0, 0], rotY = 0, hoodie = C.red, expr = 'neutral', hat = 'none', hatColor = '#1b1622',
  armL = 0.15, armR = 0.15, headTilt = 0, headTurn = 0, squash = 0, look = 0, seg = 48, glasses = false, scale = 1, mouth = 0, turnLag = 0, lean = 0, armLx = 0, armRx = 0, nod = 0, brow = 0, rightHand, legSwing = 0, forceBlink = 0}: PillProps) => {
  if (FAST) seg = Math.min(seg, 28);
  const t = frame / 30, ph = random(id) * 6.28;
  // breathing rate follows emotion (backlog #41): calm ≈ 0.33 Hz, anxious ≈ 0.6 Hz
  const anxious = expr === 'worried' || expr === 'shock' || expr === 'sad';
  const breath = 1 + 0.014 * Math.sin(t * (anxious ? 3.8 : 2.1) + ph);
  // seeded blinks every ~3.5s; ~20% of cycles are double blinks (backlog #10)
  const period = 95 + Math.floor(random(id + 'b') * 40);
  const kb = Math.floor(frame) + Math.floor(random(id + 'o') * period), k = kb % period, cyc = Math.floor(kb / period);
  const dbl = random(id + 'd' + cyc) < 0.2;
  const blink0 = k < 5 ? Math.sin((k / 5) * Math.PI) : dbl && k >= 8 && k < 13 ? Math.sin(((k - 8) / 5) * Math.PI) : 0;
  // B24: big head turns blink (the lagging body tells us the head is mid-turn) · B12: forced blink hides an expression swap
  const blink = Math.max(blink0, Math.min(1, Math.max(0, Math.abs(turnLag) * 7 - 0.3)), forceBlink);
  // weight shift (backlog #31) + moving-hold head drift (backlog #44): slow, seeded, never twins
  const shift = Math.sin(t * 0.55 + ph * 1.7) * 0.022;
  const drift = Math.sin(t * 0.4 + ph) * 0.02, driftTilt = Math.sin(t * 0.33 + ph * 2.3) * 0.018;
  // saccades: tiny seeded eye darts every ~1–2s (master prompt C3.7)
  const sp = 30 + Math.floor(random(id + 's') * 25), si = Math.floor(frame / sp);
  const sacc = (random(id + 'sa' + si) - 0.5) * 5;
  const cloth = <meshStandardMaterial color={hoodie} roughness={0.88} />;
  const sq: [number, number, number] = [1 + squash * 0.5, 1 - squash, 1 + squash * 0.5];
  const arm = (side: 1 | -1, a: number, ax = 0) => (
    <group position={[side * 0.27, 0.93, 0]} rotation={[ax, 0, side * (0.12 + a)]}>
      <mesh position={[0, -0.24, 0]} castShadow><capsuleGeometry args={[0.062, 0.36, 6, 16]} />{cloth}</mesh>
      <mesh position={[0, -0.5, 0]} castShadow><sphereGeometry args={[0.072, 24, 24]} />{skinMat}</mesh>
      {side === 1 && rightHand && <group position={[0, -0.56, 0.02]} rotation={[0, 0, -(0.12 + a)]}>{rightHand}</group>}
    </group>
  );
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.09, 0.42, 0]} rotation={[s * legSwing, 0, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow><capsuleGeometry args={[0.055, 0.3, 6, 12]} /><meshStandardMaterial color={C.lavender} roughness={0.6} /></mesh>
          <mesh position={[0, -0.39, 0.03]} scale={[1, 0.6, 1.5]} castShadow><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color="#2a2433" roughness={0.7} /></mesh>
        </group>
      ))}
      <group scale={[1, breath, 1]} rotation={[lean, 0, shift]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow><capsuleGeometry args={[0.22, 0.36, 8, 24]} />{cloth}</mesh>
        {[-1, 1].map((s) => (
          // B15 follow-through: drawstrings hang from the collar and swing behind turns, leans and steps (pivot at the top)
          <group key={s} position={[s * 0.045, 0.865, 0.215]} rotation={[Math.max(-0.1, lean * -0.9 + Math.abs(legSwing) * 0.25), 0, turnLag * 2.2 + Math.sin(t * 2.6 + ph + s) * 0.04 + legSwing * 0.3 * s]}>
            <mesh position={[0, -0.085, 0]}><RB args={[0.016, 0.17, 0.012]} /><meshStandardMaterial color="#f4f0f8" /></mesh></group>
        ))}
        <mesh position={[0, 0.98, -0.1]} rotation={[0.3 + lean * 0.5 + Math.abs(legSwing) * 0.12, 0, -turnLag * 1.4]}><torusGeometry args={[0.13, 0.05, 12, 24, Math.PI]} />{cloth}</mesh>
        {arm(-1, armL, armLx)}{arm(1, armR, armRx)}
        <mesh position={[0, 1.04, 0]}><cylinderGeometry args={[0.05, 0.05, 0.2, 12]} /><meshStandardMaterial color={C.lavender} /></mesh>
        <group position={[0, 1.13, 0]} rotation={[nod, headTurn + drift, headTilt + driftTilt - shift * 0.6]} scale={sq}>
          <group position={[0, 0.4, 0]}>
            <group scale={[1, 1.04, 0.97]}>
              <mesh castShadow><sphereGeometry args={[0.42, seg, seg]} />{skinMat}</mesh>
              <mesh scale={1.006}><sphereGeometry args={[0.42, seg, seg]} /><SkinGlow /></mesh>
              <Face r={0.42} expr={expr} blink={blink} look={look + sacc} mouth={mouth} brow={brow} seg={Math.max(seg, 32)} />
            </group>
            {/* follow-through (backlog #17): hair trails the head by ~4 beats and overshoots a little */}
            <group rotation={[0, (turnLag + (Math.sin((t - 0.13) * 0.4 + ph) * 0.02 - drift)) * 1.6, (Math.sin((t - 0.13) * 0.33 + ph * 2.3) * 0.018 - driftTilt) * 1.6]}>
              <HairMesh hair={hat} color={hatColor} seg={seg} />
              {hat === 'bob' && <Fringe color={hatColor} />}
            </group>
            {glasses && <Glasses />}
          </group>
        </group>
      </group>
    </group>
  );
};

/** Fake subsurface: warm fresnel glow at the silhouette, like light through a toy's soft skin (master prompt C2). */
const SkinGlow = () => (
  <shaderMaterial transparent depthWrite={false} blending={AdditiveBlending}
    vertexShader={`varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`}
    fragmentShader={`varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN,vV),0.0), 3.0); gl_FragColor = vec4(vec3(1.0,0.55,0.5)*f*0.32, 1.0); }`} />
);

/** Fringe: overlapping squashed lumps under the hat/hair edge so hair has volume, not a flat cap (C5). */
const Fringe = ({color}: {color: string}) => (<>
  {[-0.27, -0.15, -0.03, 0.09, 0.21, 0.3].map((x, i) => {
    const y = 0.215 - Math.abs(x) * 0.3 + (i % 2) * 0.012, z = Math.sqrt(Math.max(0.01, 0.43 ** 2 - x * x - y * y));
    return <mesh key={x} position={[x, y, z - 0.05]} rotation={[0.35, x * 1.4, (i % 2 ? 0.4 : -0.3)]} scale={[1.45, 0.55, 0.6]} castShadow>
      <sphereGeometry args={[0.068, 20, 16]} /><meshPhysicalMaterial color={color} roughness={0.55} sheen={0.8} sheenColor="#8a7aa8" /></mesh>;
  })}
</>);

const HairMesh = ({hair, color, seg}: {hair: Hair; color: string; seg: number}) => {
  const m = <meshPhysicalMaterial color={color} roughness={0.6} sheen={0.6} sheenColor="#8a7aa8" />;
  const cap = (back: boolean) => (<>
    <mesh rotation={[-0.25, 0, 0]} position={[0, 0.06, -0.02]} castShadow><sphereGeometry args={[0.44, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.42]} />{m}</mesh>
    <mesh position={[0, 0.22, back ? -0.34 : 0.34]} rotation={[back ? -0.25 : 0.25, 0, 0]} scale={[1, 0.08, 1]} castShadow><cylinderGeometry args={[0.24, 0.24, 0.2, 24]} />{m}</mesh>
  </>);
  switch (hair) {
    case 'none': return null;
    case 'beanie': return <mesh rotation={[-0.25, 0, 0]} position={[0, 0.06, -0.02]} castShadow><sphereGeometry args={[0.44, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.42]} />{m}</mesh>;
    case 'cap': return cap(false);
    case 'capBack': return cap(true);
    case 'visor': return <mesh position={[0, 0.2, 0.3]} rotation={[0.35, 0, 0]} scale={[1, 0.08, 1]} castShadow><cylinderGeometry args={[0.26, 0.26, 0.2, 24]} /><meshStandardMaterial color={color} roughness={0.4} transparent opacity={0.85} /></mesh>;
    case 'bob': return <mesh position={[0, -0.02, -0.03]} castShadow><sphereGeometry args={[0.455, seg, seg, Math.PI * 0.62, Math.PI * 1.76, 0, Math.PI * 0.62]} />{m}</mesh>;
    case 'bun': return (<>
      <mesh rotation={[-0.15, 0, 0]} position={[0, 0.03, -0.02]} castShadow><sphereGeometry args={[0.44, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.4]} />{m}</mesh>
      <mesh position={[0, 0.42, -0.2]} castShadow><sphereGeometry args={[0.15, 24, 24]} />{m}</mesh></>);
    case 'ponytail': return (<>
      <mesh rotation={[-0.15, 0, 0]} position={[0, 0.03, -0.02]} castShadow><sphereGeometry args={[0.44, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.42]} />{m}</mesh>
      <mesh position={[0, 0.05, -0.47]} rotation={[0.5, 0, 0]} castShadow><capsuleGeometry args={[0.08, 0.32, 6, 12]} />{m}</mesh></>);
  }
};

const Glasses = () => {
  const m = <meshStandardMaterial color="#141018" roughness={0.3} />;
  return (<group position={[0, 0.07, 0.41]}>
    {[-0.085, 0.085].map((x) => <mesh key={x} position={[x, 0, 0]}><torusGeometry args={[0.058, 0.01, 8, 24]} />{m}</mesh>)}
    <mesh><RB args={[0.05, 0.01, 0.01]} />{m}</mesh>
  </group>);
};
