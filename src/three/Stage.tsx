import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, random} from 'remotion';
import {useThree} from '@react-three/fiber';
import {EffectComposer, DepthOfField, Bloom, Vignette, Noise, ChromaticAberration, HueSaturation, BrightnessContrast} from '@react-three/postprocessing';
import {BlendFunction} from 'postprocessing';
import {ACESFilmicToneMapping, Vector2, Vector3} from 'three';
import {C, W, H, NEAR, FAR} from '../style/tokens';

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

export const Lights = ({keyColor = C.keyWarm, keyI = 70}: {keyColor?: string; keyI?: number}) => (
  <>
    <ambientLight intensity={0.12} color={C.fillCool} />
    <hemisphereLight args={[C.fillCool, '#2a1d3a', 0.45]} />
    <spotLight position={[-3.5, 5.5, 4]} angle={0.55} penumbra={0.9} intensity={keyI} decay={1.6} color={keyColor}
      castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02} />
    <pointLight position={[4, 2.2, 2]} intensity={9} decay={1.6} color={C.fillCool} />
    <spotLight position={[0.5, 4, -4]} angle={0.6} penumbra={1} intensity={55} decay={1.5} color={C.rimBlue} />
    <fog attach="fog" args={[C.bgDeep, 6, 18]} />
    <color attach="background" args={[C.bgDeep]} />
  </>
);

export const PostFX = ({focus, frame}: {focus: number; frame: number}) => (
  <EffectComposer multisampling={4}>
    <DepthOfField focusDistance={focus} focalLength={0.03} bokehScale={5} />
    <Bloom intensity={0.7} luminanceThreshold={0.72} luminanceSmoothing={0.2} mipmapBlur />
    <ChromaticAberration offset={new Vector2(0.0008, 0.0006)} radialModulation modulationOffset={0.3} />
    <HueSaturation saturation={-0.1} />
    <BrightnessContrast contrast={0.08} />
    <Vignette offset={0.28} darkness={0.78} />
    <Noise opacity={0.05 + (frame % 2) * 0.001} premultiply blendFunction={BlendFunction.OVERLAY} />
  </EffectComposer>
);

export const Stage = ({cam, focus, children}: {cam: Cam; focus: number; children: React.ReactNode}) => {
  const frame = useCurrentFrame();
  return (
    <ThreeCanvas width={W} height={H} shadows="soft" camera={{fov: cam.fov, near: NEAR, far: FAR, position: cam.pos}}
      gl={{antialias: false, preserveDrawingBuffer: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05}}>
      <CameraApply cam={cam} />
      {children}
      <PostFX focus={focus} frame={frame} />
    </ThreeCanvas>
  );
};
