import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {random, getInputProps} from 'remotion';

/** Render quality: `final` (default, GPU machines) or `fast` (CPU-only renders): --props='{"quality":"fast"}'. */
export const FAST = (getInputProps() as {quality?: string}).quality === 'fast';
/** Internal 3D resolution factor. Set it to the same value as --scale (e.g. 0.75) so WebGL renders at the OUTPUT size instead of
 *  1920×1080 and is then downscaled. --props='{"res":0.75}'. Default 1. */
export const RES = Number((getInputProps() as {res?: number}).res ?? 1);
import {useThree} from '@react-three/fiber';
import {SoftShadows, ContactShadows, Environment, Lightformer} from '@react-three/drei';
import {EffectComposer, N8AO, DepthOfField, Bloom, Vignette, ChromaticAberration, HueSaturation, BrightnessContrast} from '@react-three/postprocessing';
import {ACESFilmicToneMapping, Vector2, Vector3, Quaternion, Color, DoubleSide, AdditiveBlending} from 'three';
import {C, W, H, NEAR, FAR} from '../style/tokens';
import {LIGHTS, GRADES, Grade} from '../style/presets';

export type Cam = {pos: [number, number, number]; target: [number, number, number]; fov: number};

const CameraApply = ({cam}: {cam: Cam}) => {
  const {camera} = useThree();
  camera.position.set(...cam.pos);
  camera.lookAt(new Vector3(...cam.target));
  (camera as any).fov = cam.fov; camera.near = NEAR; camera.far = FAR;
  camera.updateProjectionMatrix();
  return null;
};

/** Handheld drift on top of an animated camera — deterministic. */
export const handheld = (cam: Cam, frame: number, seed: string): Cam => {
  const t = frame / 30, a = random(seed + 'a') * 9, b = random(seed + 'b') * 9;
  return {...cam, pos: [cam.pos[0] + Math.sin(t * 0.7 + a) * 0.012, cam.pos[1] + Math.sin(t * 0.93 + b) * 0.009, cam.pos[2]],
    target: [cam.target[0] + Math.sin(t * 0.5 + b) * 0.006, cam.target[1] + Math.sin(t * 0.61 + a) * 0.005, cam.target[2]]};
};

const Beam = ({from, to, color, opacity}: {from: [number, number, number]; to: [number, number, number]; color: string; opacity: number}) => {
  const a = new Vector3(...from), b = new Vector3(...to), len = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), a.clone().sub(b).normalize());
  return (
    <mesh position={mid.toArray()} quaternion={q} renderOrder={5}>
      <cylinderGeometry args={[0.05, len * 0.42, len, 32, 1, true]} />
      <shaderMaterial transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} fog={false}
        uniforms={{uColor: {value: new Color(color)}, uOp: {value: opacity}}}
        vertexShader={`varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`}
        fragmentShader={`uniform vec3 uColor; uniform float uOp; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main(){ float edge = pow(abs(dot(vN, vV)), 2.0); float along = smoothstep(0.0, 0.25, vUv.y) * (0.35 + 0.65 * vUv.y);
          gl_FragColor = vec4(uColor * edge * along * uOp, 1.0); }`} />
    </mesh>
  );
};

/** preset → LIGHTS (style/presets.ts). keyColor/keyI override the preset. `env` dims reflections for dark scenes. */
export const Lights = ({preset = 'hallway', keyColor, keyI, keyPos = [-3.5, 5.5, 4], extra, beam}: {
  preset?: string; keyColor?: string; keyI?: number; keyPos?: [number, number, number]; extra?: React.ReactNode; beam?: number;
}) => {
  const L = LIGHTS[preset] ?? LIGHTS.hallway;
  // the beam needs a motivated indoor source; on exteriors/void/bathroom it read as grey haze over half the frame (check, Nov 18)
  const BEAM: Record<string, number> = {hallway: 0.12, bedroom: 0.14, kitchen: 0.1, classroom: 0.12, casino: 0.14, gym: 0.14, dawn: 0.12, bathroomWarm: 0.08};
  beam = beam ?? Number((getInputProps() as {beam?: number}).beam ?? BEAM[preset] ?? 0);
  const kc = keyColor ?? L.key, ki = keyI ?? L.keyI;
  return (
  <>
    {extra}
    <ambientLight intensity={0.12} color={C.fillCool} />
    <hemisphereLight args={[C.fillCool, '#2a1d3a', 0.45]} />
    <spotLight position={keyPos} angle={0.55} penumbra={0.9} intensity={ki} decay={1.6} color={kc}
      castShadow shadow-mapSize={FAST ? [1024, 1024] : [2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02} />
    <pointLight position={[4, 2.2, 2]} intensity={L.fillI} decay={1.6} color={L.fill} />
    <spotLight position={[0.5, 4, -4]} angle={0.6} penumbra={1} intensity={L.rimI} decay={1.5} color={L.rim} />
    {/* bounce: warm floor light up onto chins (§36.3) */}
    <pointLight position={[0, 0.15, 1.2]} intensity={2.2} decay={1.8} color="#ff9a5c" />
    {/* kicker: subtle magenta on the shadow side */}
    <pointLight position={[-2.5, 1.4, -1.5]} intensity={2.5} decay={1.8} color="#ff6fd0" />
    {/* fake volumetric beam from the key (backlog #63): additive cone, fades along its length and at its edges.
        Pure shader, no time uniforms → deterministic. Fog makes it read. */}
    {beam > 0 && <Beam from={keyPos} to={[0, 0.6, 0]} color={kc} opacity={beam} />}
    {!FAST && <SoftShadows size={18} samples={12} focus={0.6} />}
    <ContactShadows position={[0, 0.003, 0]} opacity={0.5} scale={10} blur={2.5} far={1.2} resolution={FAST ? 512 : 1024} frames={1} color="#120a1c" />
    {/* reflections for clearcoat heads + gold (no download: Lightformers only) */}
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.5} color={C.keyWarm} position={[-4, 3, 3]} scale={[4, 3, 1]} />
      <Lightformer form="rect" intensity={1.5} color={C.fillCool} position={[4, 1.5, 1]} scale={[1, 4, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
    </Environment>
    <fog attach="fog" args={[L.bg, L.fog[0], L.fog[1]]} />
    <color attach="background" args={[L.bg]} />
  </>
  );
};

export const PostFX = ({focus, g = GRADES.wonder, flash = 0}: {focus: number; g?: Grade; flash?: number}) => (
  <EffectComposer multisampling={FAST ? 0 : 4}>
    {!FAST ? <N8AO aoRadius={0.6} distanceFalloff={1} intensity={2.2} color="#1a1030" /> : <></>}
    <DepthOfField focusDistance={focus} focalLength={0.03} bokehScale={3} />
    <Bloom intensity={g.bloom + flash * 0.4} luminanceThreshold={0.72} luminanceSmoothing={0.2} mipmapBlur />
    <ChromaticAberration offset={new Vector2(g.ca * (1 + flash * 2), g.ca * 0.75 * (1 + flash * 2))} radialModulation modulationOffset={0.3} />
    <HueSaturation saturation={g.saturation} />
    <BrightnessContrast contrast={g.contrast} />
    <Vignette offset={0.28} darkness={g.vignette} />
    {/* grain is NOT here: postprocessing's Noise reads wall-clock time (non-deterministic). See overlay/Grain.tsx */}
  </EffectComposer>
);

export const Stage = ({cam, focus, children, grade = 'wonder', flash = 0, exposure}: {
  cam: Cam; focus: number; children: React.ReactNode; grade?: string; flash?: number; exposure?: number;
}) => (
  <ThreeCanvas width={W} height={H} dpr={RES} shadows="soft" camera={{fov: cam.fov, near: NEAR, far: FAR, position: cam.pos}}
    gl={{antialias: false, preserveDrawingBuffer: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: exposure ?? 1.05}}>
    <CameraApply cam={cam} />
    {/* eye light (backlog #66): tiny, shadowless light at the lens so every eye gets a catch-light */}
    <pointLight position={cam.pos} intensity={0.9} decay={2} color="#fff4e8" />
    {children}
    <PostFX focus={focus} g={GRADES[grade] ?? GRADES.wonder} flash={flash} />
  </ThreeCanvas>
);
