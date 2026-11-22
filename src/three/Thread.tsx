/**
 * Glowing promise thread (prompts/WHAT_IF_PROMISE_THREADS.md §6).
 * States: fresh (spools out) · held · slack · broken (frayed, on the floor) · burst (kept → sparks).
 * Deterministic: everything is a function of `t` (seconds into the state) and `seed`. No clock, no Math.random.
 */
import React, {useMemo} from 'react';
import {random} from 'remotion';
import {AdditiveBlending, CatmullRomCurve3, Color, TubeGeometry, Vector3, BufferGeometry, Float32BufferAttribute} from 'three';

export type ThreadState = 'fresh' | 'held' | 'slack' | 'broken' | 'burst';
export type V3 = [number, number, number];

const GOLD = '#f2c46b', AMBER = '#e0a24a', GREY = '#8a8494';
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** Curve between two anchors with sag + seeded wobble. `floor` pulls the middle down to y≈0.02 (broken). */
const makeCurve = (from: V3, to: V3, sag: number, t: number, seed: string, floor = 0) => {
  const a = new Vector3(...from), b = new Vector3(...to), d = a.distanceTo(b), N = 9, pts: Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1), p = a.clone().lerp(b, u), bell = Math.sin(u * Math.PI);
    p.y -= sag * d * 0.35 * bell;
    if (floor > 0) p.y = p.y * (1 - floor * bell) + 0.02 * floor * bell;
    const w = 0.015 * bell * (1 - floor);
    p.x += Math.sin(t * 2.4 + i * 1.7 + random(seed + 'wx') * 6) * w;
    p.y += Math.sin(t * 2.0 + i * 1.3 + random(seed + 'wy') * 6) * w;
    pts.push(p);
  }
  return new CatmullRomCurve3(pts);
};

/** Partial curve (0..p) for spooling. */
const subCurve = (c: CatmullRomCurve3, p: number) => new CatmullRomCurve3(Array.from({length: 12}, (_, i) => c.getPoint((i / 11) * Math.max(0.002, p))));

const vert = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`;
const frag = `uniform vec3 uColor; uniform float uI; uniform float uT; uniform float uSeed; uniform float uPulse; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  float f = 1.0 - abs(dot(vN, vV));                       // fresnel: bright edges = filament, not pipe
  float core = 0.65 + 0.35 * (1.0 - f);
  float band = smoothstep(0.08, 0.0, abs(fract(uT * 0.35 + uSeed) - vUv.x)) * uPulse;  // travelling energy pulse
  gl_FragColor = vec4(uColor * uI * (core + 0.6 * f + band), 1.0);
}`;

const Tube = ({curve, r, color, i, t, seed, pulse, halo = true}: {curve: CatmullRomCurve3; r: number; color: string; i: number; t: number; seed: string; pulse: number; halo?: boolean}) => {
  const geo = useMemo(() => new TubeGeometry(curve, 64, r, 8, false), [curve, r]);
  const halog = useMemo(() => (halo ? new TubeGeometry(curve, 48, r * 3.6, 8, false) : null), [curve, r, halo]);
  const u = {uColor: {value: new Color(color)}, uI: {value: i}, uT: {value: t}, uSeed: {value: random(seed)}, uPulse: {value: pulse}};
  return (
    <group>
      <mesh geometry={geo}><shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={u} toneMapped={false} /></mesh>
      {halog && <mesh geometry={halog}><meshBasicMaterial color={color} transparent opacity={0.22 * Math.min(1, i)} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>}
    </group>
  );
};

/** Small additive points for sparks/dust (one draw call). */
const Points = ({pos, color, size, opacity}: {pos: number[]; color: string; size: number; opacity: number}) => {
  const g = useMemo(() => { const b = new BufferGeometry(); b.setAttribute('position', new Float32BufferAttribute(pos, 3)); return b; }, [pos]);
  return <points geometry={g}><pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></points>;
};

/** Glowing bead where a thread is tied on (wrist / chest): makes it read as "tied", not floating. */
const Knot = ({p, r, color}: {p: Vector3 | V3; r: number; color: string}) => (
  <group position={p as any}>
    <mesh><sphereGeometry args={[r * 2.2, 14, 14]} /><meshBasicMaterial color="#fff6dc" toneMapped={false} /></mesh>
    <mesh><sphereGeometry args={[r * 5, 14, 14]} /><meshBasicMaterial color={color} transparent opacity={0.25} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
  </group>
);

/** camPos: threads keep a minimum on-screen width (≈1.5 px at 1080p) so they still read in wides. */
export const Thread = ({from, to, state, t, thickness = 0.01, seed, light = true, camPos}: {
  from: V3; to: V3; state: ThreadState; t: number; thickness?: number; seed: string; light?: boolean; camPos?: V3;
}) => {
  const mid0 = new Vector3(...from).lerp(new Vector3(...to), 0.5);
  const r = camPos ? Math.max(thickness, mid0.distanceTo(new Vector3(...camPos)) * 0.0016) : thickness;
  if (state === 'fresh' || state === 'held' || state === 'slack') {
    const sag = state === 'slack' ? 0.55 : 0.04;
    const c = makeCurve(from, to, sag, t, seed);
    const p = state === 'fresh' ? easeOut(t / 0.6) : 1;
    const curve = p < 1 ? subCurve(c, p) : c;
    const col = state === 'slack' ? AMBER : GOLD, I = state === 'slack' ? 0.9 : state === 'fresh' ? 2.0 : 1.6;
    const tip = c.getPoint(p), mid = c.getPoint(0.5);
    return (
      <group>
        <Tube curve={curve} r={r} color={col} i={I} t={t} seed={seed} pulse={state === 'slack' ? 0.3 : 1} />
        <Knot p={from} r={r} color={col} />
        {p >= 1 && <Knot p={to} r={r} color={col} />}
        {state === 'fresh' && p < 1 && <mesh position={tip}><sphereGeometry args={[r * 2.6, 12, 12]} /><meshBasicMaterial color="#fff6dc" toneMapped={false} /></mesh>}
        {light && <pointLight position={mid} color={col} intensity={state === 'slack' ? 0.15 : 0.4} distance={2.5} decay={2} />}
      </group>
    );
  }
  if (state === 'broken') {
    const c = makeCurve(from, to, 0.2, t, seed, 1);
    const main = subCurve(c, 0.85);
    // fray: the last 15% splits into curling sub-strands
    const fr = Array.from({length: 4}, (_, k) => {
      const base = c.getPoint(0.85), end = c.getPoint(1);
      const ang = random(seed + 'fa' + k) * Math.PI * 2, spread = 0.06 + random(seed + 'fs' + k) * 0.05;
      const m = base.clone().lerp(end, 0.5).add(new Vector3(Math.cos(ang) * spread * 0.6, 0.02, Math.sin(ang) * spread * 0.6));
      const e = end.clone().add(new Vector3(Math.cos(ang) * spread, 0.03 + random(seed + 'fy' + k) * 0.04, Math.sin(ang) * spread));
      return new CatmullRomCurve3([base, m, e]);
    });
    const dust: number[] = [];
    for (let k = 0; k < 44; k++) {
      // grey ash drifting up off the dead thread (slow, with a little sideways sway)
      const u = 0.45 + random(seed + 'du' + k) * 0.55, p = c.getPoint(u), life = (t * 0.3 + random(seed + 'dl' + k)) % 1;
      dust.push(p.x + (random(seed + 'dx' + k) - 0.5) * 0.16 + Math.sin(life * 6 + k) * 0.03, p.y + 0.02 + life * 0.45, p.z + (random(seed + 'dz' + k) - 0.5) * 0.16);
    }
    const endP = c.getPoint(0.95);
    return (
      <group>
        <Tube curve={main} r={r * 0.9} color={GREY} i={0.7} t={t} seed={seed} pulse={0} halo={false} />
        {fr.map((f, k) => <Tube key={k} curve={f} r={r * 0.4} color={GREY} i={0.6} t={t} seed={seed + k} pulse={0} halo={false} />)}
        <Points pos={dust} color="#b8b2c2" size={0.02} opacity={0.45} />
        {/* scuff where the dead thread drags on the floor */}
        <mesh position={[endP.x, 0.004, endP.z]} rotation={[-Math.PI / 2, 0, random(seed + 'sc') * 3]}><circleGeometry args={[0.22, 24]} /><meshBasicMaterial color="#3a3444" transparent opacity={0.35} depthWrite={false} /></mesh>
      </group>
    );
  }
  // burst: tighten (0–0.2s) → white flash (0.2–0.27s) → sparks (0.27s+)
  const c = makeCurve(from, to, Math.max(0, 0.04 - t * 0.2), t, seed);
  if (t < 0.27) {
    const flash = t > 0.2 ? 1 : 0;
    return <group><Tube curve={c} r={r * (1 + t * 2)} color={flash ? '#fff6dc' : GOLD} i={2.2 + t * 4} t={t} seed={seed} pulse={1} />
      {light && <pointLight position={c.getPoint(0.5)} color={GOLD} intensity={0.6 + t * 10} distance={3} decay={2} />}</group>;
  }
  const s = t - 0.27, sparks: number[] = [], n = 240;
  for (let k = 0; k < n; k++) {
    const u = random(seed + 'su' + k), p = c.getPoint(u);
    const vx = (random(seed + 'vx' + k) - 0.5) * 1.6, vy = 0.4 + random(seed + 'vy' + k) * 1.2, vz = (random(seed + 'vz' + k) - 0.5) * 1.6;
    const drag = (1 - Math.exp(-2.2 * s)) / 2.2;       // velocity decays; then slow upward drift
    const fall = Math.max(0, s - 0.9); // after the pop, sparks drift down like embers for ~3 s
    sparks.push(p.x + vx * drag + Math.sin(s * 2 + k) * 0.02 * fall, p.y + vy * drag + 0.25 * Math.min(s, 0.9) - 0.18 * fall * fall, p.z + vz * drag);
  }
  const fade = clamp01(1 - s / 3.2);
  const ring = c.getPoint(0.5), rs = 0.1 + s * 1.4;
  return (
    <group>
      <Points pos={sparks} color={GOLD} size={0.04} opacity={fade} />
      <Points pos={sparks.map((v, i) => v + (i % 3 === 1 ? -0.01 : 0))} color="#fff6dc" size={0.015} opacity={fade} />
      {s < 0.6 && <mesh position={ring} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[rs, rs + 0.02, 48]} /><meshBasicMaterial color={GOLD} transparent opacity={(1 - s / 0.6) * 0.6} blending={AdditiveBlending} depthWrite={false} toneMapped={false} side={2} /></mesh>}
      {/* warm flare across every nearby face as it fires */}
      {light && <pointLight position={ring} color={GOLD} intensity={3 * fade + 9 * Math.exp(-4 * s)} distance={5} decay={2} />}
    </group>
  );
};

/** "Hundreds" of thin threads radiating from one wrist (one draw call). Directions and lengths are seeded. */
/** xray: draw through walls (P033: "out through walls in every direction"). */
/** Face exclusion (CLAUDE.md §57.2 rule 1): with `camPos` + `faces`, segments that would be drawn over a face (screen-space, so it
 *  also works for xray lines behind the head) are dropped. The reveal's threads then frame the face instead of hatching across it. */
const overFace = (p: number[], cam: V3 | undefined, faces: V3[]) => {
  if (!cam) return false;
  for (const f of faces) {
    const fx = f[0] - cam[0], fy = f[1] - cam[1], fz = f[2] - cam[2], fd = Math.hypot(fx, fy, fz);
    const px = p[0] - cam[0], py = p[1] - cam[1], pz = p[2] - cam[2];
    const t = (px * fx + py * fy + pz * fz) / fd;                       // depth of p along the camera→face ray
    if (t <= 0.05) continue;
    const perp = Math.hypot(px - fx * t / fd, py - fy * t / fd, pz - fz * t / fd);
    if (perp * (fd / t) < 0.5) return true;                             // within ~1.2 head radii of the face, as seen from the lens
  }
  return false;
};
export const ThreadSwarm = ({from, n = 120, t, seed, grey = 0.85, xray = false, camPos, faces = []}: {from: V3; n?: number; t: number; seed: string; grey?: number; xray?: boolean; camPos?: V3; faces?: V3[]}) => {
  const {pos, col} = useMemo(() => {
    const pos: number[] = [], col: number[] = [], g = new Color(GREY), go = new Color(GOLD);
    for (let k = 0; k < n; k++) {
      const az = Math.PI + (random(seed + 'a' + k) - 0.5) * Math.PI * 1.6, el = (random(seed + 'e' + k) - 0.35) * 1.2, L = 3 + random(seed + 'l' + k) * 9;
      const dir = new Vector3(Math.cos(az) * Math.cos(el), Math.sin(el), -Math.abs(Math.sin(az) * Math.cos(el)) * 0.9 + 0.12);
      const sagK = 0.3 + random(seed + 's' + k) * 0.5, seg = 6;
      const c = random(seed + 'c' + k) < grey ? g : go;
      for (let i = 0; i < seg; i++) {
        const u0 = i / seg, u1 = (i + 1) / seg;
        const p = (u0r: number) => { const u = 0.04 + u0r * 0.96; return [from[0] + dir.x * L * u, from[1] + dir.y * L * u - sagK * Math.sin(u * Math.PI) * L * 0.1, from[2] + dir.z * L * u]; };
        const f0 = 1 - 0.8 * u0, f1 = 1 - 0.8 * u1;   // far end fades into the fog (additive: darker = dimmer)
        const a0 = p(u0), a1 = p(u1);
        if (overFace(a0, camPos, faces) || overFace(a1, camPos, faces)) continue;
        pos.push(...a0, ...a1); col.push(c.r * f0, c.g * f0, c.b * f0, c.r * f1, c.g * f1, c.b * f1);
      }
    }
    return {pos, col};
  }, [from[0], from[1], from[2], n, seed, grey, camPos?.[0], camPos?.[1], camPos?.[2], faces.map((f) => f.join(',')).join('|')]);
  const geo = useMemo(() => { const b = new BufferGeometry(); b.setAttribute('position', new Float32BufferAttribute(pos, 3)); b.setAttribute('color', new Float32BufferAttribute(col, 3)); return b; }, [pos, col]);
  // a few thick near threads in front of the hair-thin mass give the swarm depth layers (near / mid / far)
  const near = Array.from({length: Math.min(9, Math.round(n / 20))}, (_, k) => {
    const az = Math.PI * 0.5 + (random(seed + 'na' + k) - 0.5) * 2.2, el = (random(seed + 'ne' + k) - 0.4) * 0.9, L = 2.2 + random(seed + 'nl' + k) * 2;
    const to: V3 = [from[0] + Math.cos(az) * L, from[1] + Math.sin(el) * L * 0.6, from[2] + Math.abs(Math.sin(az)) * L * 0.8];
    const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
    if (overFace(mid, camPos, faces) || overFace(to, camPos, faces)) return null;
    return <Tube key={k} curve={makeCurve(from, to, 0.25, t, seed + 'n' + k)} r={0.007} color={random(seed + 'nc' + k) < grey ? GREY : GOLD} i={0.9} t={t} seed={seed + 'n' + k} pulse={0.3} />;
  });
  return <group>
    <lineSegments geometry={geo}><lineBasicMaterial depthTest={!xray} vertexColors transparent opacity={(xray ? 0.5 : 0.36) + 0.06 * Math.sin(t * 1.3)} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></lineSegments>
    {!xray && near}
    <Knot p={from} r={0.012} color={GREY} />
  </group>;
};
