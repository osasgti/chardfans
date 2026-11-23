// Shot auditor: geometric checks for every shot of both videos, using the SAME camera/focus maths the renderer uses
// (src/lie/camera.ts). Usage: node scripts/audit_shots.mjs [promise|lie] [--all]
// Checks (start / middle / end of each shot):
//   BLUR   an in-picture face is outside the sharp zone (shader blur > 0.2)  ← "sometimes too blurry"
//   CROP   the subject's face centre sits under the letterbox or off frame
//   BACK   the subject faces away from camera (> 115°)  ← back-of-head shots
//   CLIP   camera closer than 0.75 m to a head (inside / grazing the head)
//   THREAD a thread passes within 0.3 m of a face that is not its own end  ← lines across faces
//   EMPTY  no face in picture and no thread / extra to look at
import {build} from 'esbuild';
import {pathToFileURL} from 'url';
import fs from 'fs';
import path from 'path';

const which = process.argv[2] ?? 'promise', all = process.argv.includes('--all'), old = process.argv.includes('--old');
const tmp = path.resolve('out/audit_bundle.mjs');
fs.mkdirSync('out', {recursive: true});
await build({
  stdin: {contents: `export * from './src/lie/camera.ts'; export {SHOTS} from './src/${which === 'lie' ? 'lie' : 'promise'}/shots.ts';`, resolveDir: path.resolve('.'), loader: 'ts'},
  bundle: true, platform: 'node', format: 'esm', outfile: tmp, logLevel: 'error',
  external: ['remotion', 'three'],
});
const M = await import(pathToFileURL(tmp).href + '?t=' + Date.now());
const {SHOTS, camFor, focusPlan, blurAt, projectCam, inPicture, facesOf, headOf, wristR, chestOf, viewDepth, CAST, deg} = M;

const d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const segDist = (p, a, b) => { const ab = b.map((v, i) => v - a[i]), ap = p.map((v, i) => v - a[i]); const t = Math.max(0, Math.min(1, ap.reduce((s, v, i) => s + v * ab[i], 0) / ab.reduce((s, v) => s + v * v, 0))); return d3(p, a.map((v, i) => v + ab[i] * t)); };
const per = {};
const issues = [];
SHOTS.forEach((spec, idx) => {
  const tag = `${String(idx).padStart(2)} ${spec.line.padEnd(6)} ${spec.set.padEnd(9)} ${spec.cam.size.padEnd(4)}`;
  per[spec.line] = (per[spec.line] ?? -1) + 1;
  const found = new Set();
  for (const k of [0.02, 0.5, 0.98]) {
    const cam = camFor(spec, k, k * 90, 's' + idx);
    let fp = focusPlan(spec, cam);
    if (old) { const aim = typeof spec.cam.on === 'number' ? headOf(spec.cast[spec.cam.on]) : spec.cam.on; fp = {meters: d3(cam.pos, aim), rangeMeters: 1.2, subject: aim}; }
    const faces = facesOf(spec).map((f) => ({...f, s: projectCam(cam, f.p), d: viewDepth(cam, f.p)}));
    const seen = faces.filter((f) => inPicture(f.s, -40) && f.d > 0.3);
    const subjDepth = viewDepth(cam, fp.subject);
    for (const f of seen) {
      const b = blurAt(fp, cam, f.p);
      if (b > 0.2 && f.d > subjDepth * 0.6 && Math.abs(f.d - subjDepth) < 3) found.add(`BLUR  face of #${f.i}${f.mirrored ? ' (mirror)' : ''} blur ${b.toFixed(2)}`);
      if (d3(cam.pos, f.p) < 0.75) found.add(`CLIP  camera ${d3(cam.pos, f.p).toFixed(2)} m from head #${f.i}`);
    }
    if (typeof spec.cam.on === 'number') {
      const c = spec.cast[spec.cam.on], s = projectCam(cam, headOf(c));
      if (!inPicture(s, -20) && !(spec.mirror && c.who === 'hero')) found.add(`CROP  subject #${spec.cam.on} face at (${s.x.toFixed(0)}, ${s.y.toFixed(0)})`);
      const face = ((c.rot ?? 0) + (c.turn ?? 0)) * deg, h = headOf(c);
      const tc = [cam.pos[0] - h[0], 0, cam.pos[2] - h[2]], n = Math.hypot(tc[0], tc[2]);
      const ang = Math.acos((Math.sin(face) * tc[0] + Math.cos(face) * tc[2]) / n) / deg;
      if (ang > 115 && !spec.mirror && c.pose !== 'sleep' && !(spec.intent ?? []).includes('back')) found.add(`BACK  subject #${spec.cam.on} faces ${ang.toFixed(0)}° away from camera`);
    }
    for (const [ti, th] of (spec.threads ?? []).entries()) {
      if (th.swarm) continue;
      const a = typeof th.from === 'number' ? wristR(spec.cast[th.from]) : th.from;
      const b = typeof th.to === 'number' ? chestOf(spec.cast[th.to]) : (th.to ?? [0, 1, 0]);
      for (const f of seen) {
        if (f.mirrored || f.i === th.from || f.i === th.to) continue;
        const dd = segDist(f.p, a, b);
        if (dd < 0.3) found.add(`THREAD thread ${ti} passes ${dd.toFixed(2)} m from face #${f.i}`);
      }
    }
    if (!seen.length && !(spec.threads ?? []).length && !spec.extra && !spec.meters?.length && !spec.title) found.add('EMPTY no face, thread or prop in picture');
  }
  // I5 STATIC: locked camera with nothing alive in it · A20 rhythm: same size AND move as the previous shot
  if ((spec.cam.move ?? 'push') === 'lock' && !spec.cast.some((c) => c.talk || c.react) && !spec.extra && !(spec.threads ?? []).length) found.add('STATIC locked camera, no talker, reaction, thread or extra');
  const prev = SHOTS[idx - 1];
  if (prev && prev.cam.size === spec.cam.size && (prev.cam.move ?? 'push') === (spec.cam.move ?? 'push') && prev.set === spec.set) found.add(`RHYTHM same size + move + set as the previous shot (${spec.cam.size}/${spec.cam.move ?? 'push'})`);
  // A15 matched motion: lateral (screen-x) camera drift at the end of the previous shot vs the start of this one
  if (prev && !spec.whip && !prev.whip) {
    const lat = (sp, k0, k1, sd) => { const a = camFor(sp, k0, k0 * 90, sd), b = camFor(sp, k1, k1 * 90, sd);
      const f = [a.target[0] - a.pos[0], a.target[2] - a.pos[2]], n = Math.hypot(...f), r = [-f[1] / n, f[0] / n];
      return ((b.pos[0] - a.pos[0]) * r[0] + (b.pos[2] - a.pos[2]) * r[1]) / Math.max(0.5, Math.hypot(a.target[0] - a.pos[0], a.target[2] - a.pos[2])); };
    const e = lat(prev, 0.85, 1, 's' + (idx - 1)), b = lat(spec, 0, 0.15, 's' + idx);
    if (Math.abs(e) > 0.01 && Math.abs(b) > 0.01 && Math.sign(e) !== Math.sign(b) && prev.set === spec.set) found.add(`MOTION camera drifts ${e > 0 ? 'right' : 'left'} into the cut, then ${b > 0 ? 'right' : 'left'} out of it`);
  }
  if (found.size) issues.push([tag, [...found]]);
  else if (all) console.log(tag, 'ok');
});
for (const [t, f] of issues) { console.log(t); for (const x of f) console.log('    ' + x); }
const count = (k) => issues.filter(([, f]) => f.some((x) => x.startsWith(k))).length;
console.log(`\n${SHOTS.length} shots · ${issues.length} with issues · BLUR ${count('BLUR')} · CROP ${count('CROP')} · BACK ${count('BACK')} · CLIP ${count('CLIP')} · THREAD ${count('THREAD')} · EMPTY ${count('EMPTY')} · STATIC ${count('STATIC')} · RHYTHM ${count('RHYTHM')} · MOTION ${count('MOTION')}`);
