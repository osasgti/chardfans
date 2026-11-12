import {useMemo} from 'react';
import {CanvasTexture} from 'three';

export type Expr = 'neutral' | 'smug' | 'happy' | 'shock' | 'bored' | 'sad' | 'worried';
const INK = '#1a1424';

function draw(ctx: CanvasRenderingContext2D, expr: Expr, blink: number, look: number, mouth: number) {
  ctx.clearRect(0, 0, 1024, 512);
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  const eyeY = 236, eyeH = 46 * (1 - blink * 0.92);
  for (const bx of [486, 538]) {
    const x = bx + look;
    if (expr === 'happy') { ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, eyeY + 8, 13, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); continue; }
    if (expr === 'bored') { ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 13, eyeY); ctx.lineTo(x + 13, eyeY); ctx.stroke(); continue; }
    ctx.beginPath(); ctx.ellipse(x, eyeY, 11, Math.max(2, eyeH / 2), 0, 0, Math.PI * 2); ctx.fill();
    // catch-light
    if (blink < 0.5) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x + 4, eyeY - 9, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK; }
    if (expr === 'smug') { // heavy upper lid
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 17, eyeY - 4); ctx.lineTo(x + 17, eyeY - 4); ctx.stroke();
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillRect(x - 20, eyeY - 30, 40, 24); ctx.globalCompositeOperation = 'source-over';
    }
  }
  if (expr === 'sad' || expr === 'worried') { // brows angled up toward the middle
    ctx.lineWidth = 6; for (const [bx, d] of [[486, -1], [538, 1]] as const) {
      // inner end (toward the nose) higher than the outer end = worried/sad (the reverse reads as angry)
      ctx.beginPath(); ctx.moveTo(bx + look - 14 * d, eyeY - 42); ctx.lineTo(bx + look + 16 * d, eyeY - 30 + (expr === 'sad' ? 4 : 0)); ctx.stroke(); } }
  ctx.lineWidth = 6; ctx.beginPath();
  if (mouth > 0.05) { ctx.ellipse(512, 290, 10 + mouth * 6, 3 + mouth * 13, 0, 0, Math.PI * 2); ctx.fill(); return; }
  if (expr === 'sad') { ctx.arc(512, 306, 15, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); return; }
  if (expr === 'worried') { ctx.moveTo(498, 296); ctx.quadraticCurveTo(505, 290, 512, 296); ctx.quadraticCurveTo(519, 302, 526, 296); ctx.stroke(); return; }
  if (expr === 'shock') ctx.ellipse(512, 300, 9, 13, 0, 0, Math.PI * 2);
  else if (expr === 'smug') { ctx.moveTo(498, 296); ctx.quadraticCurveTo(522, 306, 542, 286); }
  else if (expr !== 'bored') ctx.arc(512, 282, expr === 'happy' ? 24 : 15, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();
}

/** Transparent shell with a painted face. Face centre is u=0.5 → rotated to +Z. */
export const Face = ({r, expr, blink, look = 0, mouth = 0, seg = 64}: {r: number; expr: Expr; blink: number; look?: number; mouth?: number; seg?: number}) => {
  const {canvas, tex} = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
    const tex = new CanvasTexture(canvas); tex.anisotropy = 8; return {canvas, tex};
  }, []);
  draw(canvas.getContext('2d')!, expr, blink, look, mouth);
  tex.needsUpdate = true;
  return (
    <mesh rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[r * 1.003, seg, seg]} />
      <meshStandardMaterial map={tex} transparent roughness={0.6} polygonOffset polygonOffsetFactor={-2} depthWrite={false} />
    </mesh>
  );
};
