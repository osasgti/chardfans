import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Stage, Lights, handheld, Cam} from '../three/Stage';
import {Pill} from '../three/Pill';
import {Hallway, Dust} from '../three/Set';
import {OddsBadge, Tag, project} from '../overlay/Overlays';
import {C, ease, focusFor} from '../style/tokens';

const FLIP = 88;

export const S02_Reveal = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = ease(frame, [0, 160], [0.55, 0.12]);
  const r = ease(frame, [0, 160], [3.6, 3.1]);
  const base: Cam = {pos: [Math.sin(a) * r + 0.4, 1.55, Math.cos(a) * r], target: [0.42, 1.5, 0], fov: 30};
  const cam = handheld(base, frame, 's02');
  const coin: [number, number, number] = [0.78, 1.5 + Math.sin(frame / 30 * 2.2) * 0.04, 0.35];
  const dist = Math.hypot(cam.pos[0] - 0.2, cam.pos[1] - 1.55, cam.pos[2]);
  const pop = spring({frame: frame - FLIP, fps, config: {damping: 8, mass: 0.6}});
  const antic = ease(frame, [FLIP - 6, FLIP], [0, 1]) * (frame < FLIP ? 1 : 0);
  const squash = frame >= FLIP ? 0.1 * Math.sin(Math.min(1, (frame - FLIP) / 8) * Math.PI) : -0.05 * antic;
  const spin = frame * 0.35 + (frame > FLIP ? (frame - FLIP) * 0.25 : 0);
  const glint = Math.max(0, Math.cos(spin * 2)) ** 12;
  const anchor = project(cam, [coin[0], coin[1] + 0.14, coin[2]]);
  const badge = project(cam, [coin[0] + 0.05, coin[1] + 0.48, coin[2]]);
  // light warms on the flip: emotion via color temperature
  const keyI = 70 + 12 * pop;
  return (
    <AbsoluteFill>
      <Stage cam={cam} focus={focusFor(dist)}>
        <Lights keyI={keyI} keyColor={frame > FLIP ? '#ffcf8f' : C.keyWarm} />
        <Hallway />
        <Dust frame={frame + 300} />
        <Pill id="hero" frame={frame + 140} hoodie="#c8323a" hat="beanie" expr={frame >= FLIP ? 'happy' : 'smug'}
          headTurn={0.35 + 0.15 * pop} headTilt={-0.12 + 0.18 * pop - 0.05 * antic} squash={squash}
          armR={0.15 - 0.1 * antic + 1.9 * pop} look={frame < FLIP ? 7 : 0} rotY={0.25} />
        <Pill id="bg3" frame={frame} position={[-1.4, 0, -1.7]} rotY={0.7} hoodie="#3d6fd6" seg={24} expr="neutral" />
        <group position={coin} rotation={[Math.PI / 2, 0, spin]}>
          <mesh castShadow><cylinderGeometry args={[0.09, 0.09, 0.016, 48]} />
            <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.25} emissive={C.gold} emissiveIntensity={0.08 + glint * 0.9} /></mesh>
        </group>
        <pointLight position={[coin[0], coin[1], coin[2] + 0.2]} intensity={0.2 + glint * 0.8} distance={0.8} color={C.gold} />
      </Stage>
      <Tag text="THE ODDS, LIVE" frame={frame} start={4} out={150} />
      <OddsBadge frame={frame} start={18} x={badge.x} y={badge.y} anchor={anchor} label="HEADS"
        steps={[{at: 4, value: 50}, {at: FLIP - 18, value: 99}]} />
    </AbsoluteFill>
  );
};
