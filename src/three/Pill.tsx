import React from 'react';
import {random} from 'remotion';
import {C} from '../style/tokens';
import {Face, Expr} from './Face';
import {FAST} from './Stage';

export type Hair = 'none' | 'beanie' | 'cap' | 'capBack' | 'bun' | 'ponytail' | 'bob' | 'visor';
export type PillProps = {
  id: string; frame: number; position?: [number, number, number]; rotY?: number;
  hoodie?: string; expr?: Expr; hat?: Hair; hatColor?: string; glasses?: boolean; scale?: number; mouth?: number; rightHand?: React.ReactNode;
  armL?: number; armR?: number; headTilt?: number; headTurn?: number; squash?: number; look?: number; seg?: number;
};

const skinMat = <meshPhysicalMaterial color={C.skin} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.4} sheen={0.4} sheenColor="#ffffff" />;

export const Pill = ({id, frame, position = [0, 0, 0], rotY = 0, hoodie = C.red, expr = 'neutral', hat = 'none', hatColor = '#1b1622',
  armL = 0.15, armR = 0.15, headTilt = 0, headTurn = 0, squash = 0, look = 0, seg = 48, glasses = false, scale = 1, mouth = 0, rightHand}: PillProps) => {
  if (FAST) seg = Math.min(seg, 28);
  const t = frame / 30, ph = random(id) * 6.28;
  const breath = 1 + 0.014 * Math.sin(t * 2.1 + ph);
  // seeded blinks: every ~3.5s, 5 frames
  const period = 95 + Math.floor(random(id + 'b') * 40);
  const k = (Math.floor(frame) + Math.floor(random(id + 'o') * period)) % period;
  const blink = k < 5 ? Math.sin((k / 5) * Math.PI) : 0;
  const cloth = <meshStandardMaterial color={hoodie} roughness={0.88} />;
  const sq: [number, number, number] = [1 + squash * 0.5, 1 - squash, 1 + squash * 0.5];
  const arm = (side: 1 | -1, a: number) => (
    <group position={[side * 0.27, 0.93, 0]} rotation={[0, 0, side * (0.12 + a)]}>
      <mesh position={[0, -0.24, 0]} castShadow><capsuleGeometry args={[0.062, 0.36, 6, 16]} />{cloth}</mesh>
      <mesh position={[0, -0.5, 0]} castShadow><sphereGeometry args={[0.072, 24, 24]} />{skinMat}</mesh>
      {side === 1 && rightHand && <group position={[0, -0.56, 0.02]} rotation={[0, 0, -(0.12 + a)]}>{rightHand}</group>}
    </group>
  );
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.09, 0.42, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow><capsuleGeometry args={[0.055, 0.3, 6, 12]} /><meshStandardMaterial color={C.lavender} roughness={0.6} /></mesh>
          <mesh position={[0, -0.39, 0.03]} scale={[1, 0.6, 1.5]} castShadow><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color="#2a2433" roughness={0.7} /></mesh>
        </group>
      ))}
      <group scale={[1, breath, 1]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow><capsuleGeometry args={[0.22, 0.36, 8, 24]} />{cloth}</mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.045, 0.78, 0.215]}><boxGeometry args={[0.016, 0.17, 0.012]} /><meshStandardMaterial color="#f4f0f8" /></mesh>
        ))}
        <mesh position={[0, 0.98, -0.1]} rotation={[0.3, 0, 0]}><torusGeometry args={[0.13, 0.05, 12, 24, Math.PI]} />{cloth}</mesh>
        {arm(-1, armL)}{arm(1, armR)}
        <mesh position={[0, 1.04, 0]}><cylinderGeometry args={[0.05, 0.05, 0.2, 12]} /><meshStandardMaterial color={C.lavender} /></mesh>
        <group position={[0, 1.13, 0]} rotation={[0, headTurn, headTilt]} scale={sq}>
          <group position={[0, 0.4, 0]}>
            <mesh castShadow><sphereGeometry args={[0.42, seg, seg]} />{skinMat}</mesh>
            <Face r={0.42} expr={expr} blink={blink} look={look} mouth={mouth} seg={Math.max(seg, 32)} />
            <HairMesh hair={hat} color={hatColor} seg={seg} />
            {glasses && <Glasses />}
          </group>
        </group>
      </group>
    </group>
  );
};

const HairMesh = ({hair, color, seg}: {hair: Hair; color: string; seg: number}) => {
  const m = <meshStandardMaterial color={color} roughness={0.75} />;
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
    <mesh><boxGeometry args={[0.05, 0.01, 0.01]} />{m}</mesh>
  </group>);
};
