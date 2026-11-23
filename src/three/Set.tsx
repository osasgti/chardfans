import {RB} from './RB';
import {random} from 'remotion';
import {C} from '../style/tokens';
import {Poster, WallClock} from './LieSets';

/** School hallway: wood floor, purple wall, lockers, a lamp practical. */
export const Hallway = ({frame = 0}: {frame?: number}) => (
  <group>
    {/* storytelling details (backlog #51/#52): posters + a clock that reads 8:02 — just late for class */}
    <Poster pos={[1.1, 1.75, -2.88]} title="BE HONEST" sub="STUDENT COUNCIL" color="#3d6fd6" rot={0.03} />
    <Poster pos={[1.95, 1.6, -2.88]} w={0.5} h={0.7} title="SCIENCE" sub="FAIR · FRI" color="#2f8f8a" rot={-0.04} />
    <Poster pos={[-7.4, 1.7, -2.88]} w={0.55} title="TRYOUTS" sub="GYM 3PM" color="#d29a2d" rot={0.02} />
    <WallClock pos={[2.9, 2.75, -2.86]} time={8 * 60 + 2} frame={frame} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color={C.floorWood} roughness={0.55} /></mesh>
    {Array.from({length: 14}).map((_, i) => (
      <mesh key={i} position={[-13 + i * 2, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.02, 30]} /><meshStandardMaterial color="#4a2e20" /></mesh>
    ))}
    <mesh position={[0, 3, -3]} receiveShadow><RB args={[30, 6, 0.2]} /><meshStandardMaterial color={C.purple} roughness={0.9} /></mesh>
    {Array.from({length: 12}).map((_, i) => {
      const x = -6.6 + i * 0.62;
      return (
        <group key={i} position={[x, 1.05, -2.72]}>
          <mesh castShadow receiveShadow><RB args={[0.58, 2.1, 0.36]} /><meshStandardMaterial color={i % 5 === 3 ? '#4a6f8a' : '#3f5466'} roughness={0.5} metalness={0.25} /></mesh>
          {[0.55, 0.62, 0.69].map((y) => (<mesh key={y} position={[0, y, 0.185]}><RB args={[0.36, 0.025, 0.01]} /><meshStandardMaterial color="#1c2630" /></mesh>))}
          <mesh position={[0.2, 0, 0.19]}><RB args={[0.03, 0.12, 0.02]} /><meshStandardMaterial color="#c9d2da" metalness={0.8} roughness={0.3} /></mesh>
        </group>
      );
    })}
    {/* ceiling fluorescent practicals */}
    {[-3, 0, 3].map((x) => (<mesh key={x} position={[x, 4.2, -1]}><RB args={[1.4, 0.05, 0.25]} /><meshStandardMaterial color="#fff" emissive="#e8f0ff" emissiveIntensity={3} /></mesh>))}
  </group>
);

/** Deterministic dust motes drifting through the key light. */
export const Dust = ({frame, n = 90}: {frame: number; n?: number}) => (
  <group>
    {Array.from({length: n}).map((_, i) => {
      const t = frame / 30;
      const x = -2.5 + random('dx' + i) * 5 + Math.sin(t * 0.3 + i) * 0.25 + t * 0.04;
      const y = 0.4 + ((random('dy' + i) * 3 + t * (0.05 + random('dv' + i) * 0.08)) % 3);
      const layer = i % 3, z = [-4.5, -1.5, 1.2][layer] + random('dz' + i) * 3;
      const s = (0.006 + random('ds' + i) * 0.01) * [1.6, 1, 0.7][layer];
      return (<mesh key={i} position={[x, y, z]}><sphereGeometry args={[s, 6, 6]} /><meshBasicMaterial color={C.keyWarm} toneMapped={false} transparent opacity={0.8} /></mesh>);
    })}
  </group>
);
