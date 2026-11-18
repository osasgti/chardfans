import {useMemo} from 'react';
import {CanvasTexture} from 'three';

export type Expr = 'neutral' | 'smug' | 'happy' | 'shock' | 'bored' | 'sad' | 'worried';
const INK = '#1a1424';

function draw(ctx: CanvasRenderingContext2D, expr: Expr, blink: number, look: number, mouth: number) {
  ctx.clearRect(0, 0, 1024, 512);
  // cheek blush (soft radial, stronger on warm/embarrassed faces)
  const blushA = expr === 'happy' ? 0.34 : expr === 'sad' || expr === 'worried' ? 0.28 : 0.2;
  for (const cx of [458, 566]) {
    const b = ctx.createRadialGradient(cx, 272, 0, cx, 272, 26);
    b.addColorStop(0, `rgba(255,128,150,${blushA})`); b.addColorStop(1, 'rgba(255,128,150,0)');
    ctx.fillStyle = b; ctx.beginPath(); ctx.ellipse(cx, 272, 30, 18, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  const eyeY = 236, eyeH = 46 * (1 - blink * 0.92);
  for (const bx of [486, 538]) {
    const x = bx + look;
    if (expr === 'happy') { ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(x, eyeY + 8, 13, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); continue; }
    if (expr === 'bored') { ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 13, eyeY); ctx.lineTo(x + 13, eyeY); ctx.stroke(); continue; }
    // iris: deep violet → ink radial gradient (master prompt C3: never flat black)
    const ry = Math.max(2, eyeH / 2) * (expr === 'shock' ? 1.08 : 1);
    const g = ctx.createRadialGradient(x - 2, eyeY + ry * 0.35, 1, x, eyeY, Math.max(ry, 11));
    g.addColorStop(0, '#4a2f6e'); g.addColorStop(0.55, '#24183a'); g.addColorStop(1, INK);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, eyeY, expr === 'shock' ? 12.5 : 11, ry, 0, 0, Math.PI * 2); ctx.fill();
    // upper-lid shadow: darker band at the top of the eye
    ctx.fillStyle = 'rgba(10,6,18,.45)'; ctx.beginPath(); ctx.ellipse(x, eyeY - ry * 0.55, 11, ry * 0.45, 0, Math.PI, Math.PI * 2); ctx.fill();
    // two catch-lights: crisp primary upper-left-of-centre, soft secondary lower-right
    if (blink < 0.5) {
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(x + 4, eyeY - ry * 0.42, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(x - 4, eyeY + ry * 0.4, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = INK;
    if (expr === 'smug') { // heavy upper lid
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 17, eyeY - 4); ctx.lineTo(x + 17, eyeY - 4); ctx.stroke();
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillRect(x - 20, eyeY - 30, 40, 24); ctx.globalCompositeOperation = 'source-over';
    }
  }
  // neutral-family brows (brows carry emotion; every face has them, master prompt C4)
  if (expr === 'neutral' || expr === 'happy' || expr === 'smug' || expr === 'shock' || expr === 'bored') {
    ctx.lineWidth = 5; const lift = expr === 'shock' ? -12 : expr === 'happy' ? -4 : expr === 'bored' ? 6 : 0;
    for (const [bx, d] of [[486, -1], [538, 1]] as const) {
      const sk = expr === 'smug' && d === 1 ? -8 : 0;
      ctx.beginPath(); ctx.moveTo(bx + look - 13, eyeY - 36 + lift + sk); ctx.quadraticCurveTo(bx + look, eyeY - 42 + lift + sk, bx + look + 13, eyeY - 37 + lift + sk); ctx.stroke(); }
  }
  ctx.fillStyle = INK;
  if (expr === 'sad' || expr === 'worried') { // brows angled up toward the middle
    ctx.lineWidth = 6; for (const [bx, d] of [[486, -1], [538, 1]] as const) {
      // inner end (toward the nose) higher than the outer end = worried/sad (the reverse reads as angry)
      ctx.beginPath(); ctx.moveTo(bx + look - 14 * d, eyeY - 42); ctx.lineTo(bx + look + 16 * d, eyeY - 30 + (expr === 'sad' ? 4 : 0)); ctx.stroke(); } }
  if (expr === 'worried' || expr === 'shock') { // cartoon sweat drop at the temple (backlog #14)
    const sx = 582, sy = 252; const g2 = ctx.createLinearGradient(sx, sy - 14, sx, sy + 14);
    g2.addColorStop(0, 'rgba(190,225,255,.95)'); g2.addColorStop(1, 'rgba(120,170,235,.95)');
    ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(sx, sy - 16); ctx.quadraticCurveTo(sx + 11, sy + 2, sx, sy + 12); ctx.quadraticCurveTo(sx - 11, sy + 2, sx, sy - 16); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(sx - 3, sy + 2, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK;
  }
  ctx.lineWidth = 6; ctx.beginPath();
  if (mouth > 0.05) {
    const shape = Math.floor(mouth / 10), m = mouth - shape * 10;
    if (shape === 1) { ctx.lineWidth = 6; ctx.moveTo(498, 292); ctx.lineTo(526, 292); ctx.stroke(); return; }            // M B P: lips pressed
    if (shape === 4) { ctx.ellipse(512, 291, 13, 3 + m * 4, 0, 0, Math.PI * 2); ctx.fill();                             // F V: teeth on lip
      ctx.fillStyle = '#f4efe8'; ctx.fillRect(503, 286, 18, 4); return; }
    const rx = shape === 2 ? 7 + m * 3 : shape === 3 ? 14 + m * 7 : 10 + m * 6, ry = shape === 2 ? 5 + m * 9 : shape === 3 ? 3 + m * 7 : 3 + m * 13;
    ctx.ellipse(512, 290, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    if (ry > 9) { ctx.fillStyle = '#c4505c'; ctx.beginPath(); ctx.ellipse(512, 290 + ry * 0.45, rx * 0.55, ry * 0.35, 0, 0, Math.PI * 2); ctx.fill(); } // tongue hint (#8)
    return;
  }
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
