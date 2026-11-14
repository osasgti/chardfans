import {random} from 'remotion';
import {C} from '../style/tokens';

/** School hallway: wood floor, purple wall, lockers, a lamp practical. */
export const Hallway = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color={C.floorWood} roughness={0.55} /></mesh>
    {Array.from({length: 14}).map((_, i) => (
      <mesh key={i} position={[-13 + i * 2, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.02, 30]} /><meshStandardMaterial color="#4a2e20" /></mesh>
    ))}
    <mesh position={[0, 3, -3]} receiveShadow><boxGeometry args={[30, 6, 0.2]} /><meshStandardMaterial color={C.purple} roughness={0.9} /></mesh>
    {Array.from({length: 12}).map((_, i) => {
      const x = -6.6 + i * 0.62;
      return (
        <group key={i} position={[x, 1.05, -2.72]}>
          <mesh castShadow receiveShadow><boxGeometry args={[0.58, 2.1, 0.36]} /><meshStandardMaterial color={i % 5 === 3 ? '#4a6f8a' : '#3f5466'} roughness={0.5} metalness={0.25} /></mesh>
          {[0.55, 0.62, 0.69].map((y) => (<mesh key={y} position={[0, y, 0.185]}><boxGeometry args={[0.36, 0.025, 0.01]} /><meshStandardMaterial color="#1c2630" /></mesh>))}
          <mesh position={[0.2, 0, 0.19]}><boxGeometry args={[0.03, 0.12, 0.02]} /><meshStandardMaterial color="#c9d2da" metalness={0.8} roughness={0.3} /></mesh>
        </group>
      );
    })}
    {/* ceiling fluorescent practicals */}
    {[-3, 0, 3].map((x) => (<mesh key={x} position={[x, 4.2, -1]}><boxGeometry args={[1.4, 0.05, 0.25]} /><meshStandardMaterial color="#fff" emissive="#e8f0ff" emissiveIntensity={3} /></mesh>))}
  </group>
);

/** Deterministic dust motes drifting through the key light. */
export const Dust = ({frame, n = 90}: {frame: number; n?: number}) => (
  <group>
    {Array.from({length: n}).map((_, i) => {
      const t = frame / 30;
      const x = -2.5 + random('dx' + i) * 5 + Math.sin(t * 0.3 + i) * 0.15;
      const y = 0.4 + ((random('dy' + i) * 3 + t * 0.05) % 3);
      const z = -1.5 + random('dz' + i) * 4;
      const s = 0.006 + random('ds' + i) * 0.01;
      return (<mesh key={i} position={[x, y, z]}><sphereGeometry args={[s, 6, 6]} /><meshBasicMaterial color={C.keyWarm} toneMapped={false} transparent opacity={0.8} /></mesh>);
    })}
  </group>
);
