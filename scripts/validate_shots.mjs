// Validates src/lie/shots.ts cast references without a browser (esbuild ships with Remotion).
import {build} from 'esbuild';
const r = await build({entryPoints: ['src/lie/shots.ts'], bundle: true, write: false, format: 'esm', platform: 'node'});
const mod = await import('data:text/javascript;base64,' + Buffer.from(r.outputFiles[0].text).toString('base64'));
const bad = [];
mod.SHOTS.forEach((s, i) => {
  if (typeof s.cam.on === 'number' && !s.cast[s.cam.on]) bad.push(`shot ${i} ${s.line} cam.on=${s.cam.on}`);
  (s.meters ?? []).forEach((m) => { if (typeof m.on === 'number' && !s.cast[m.on]) bad.push(`shot ${i} ${s.line} meter.on=${m.on}`); });
});
// variety (backlog #81): two consecutive shots with the same size AND same set AND |yaw diff| < 10° read as a jump cut
const warn = [];
mod.SHOTS.forEach((s, i) => { const p = mod.SHOTS[i - 1]; if (!p) return;
  if (p.set === s.set && p.cam.size === s.cam.size && Math.abs((p.cam.yaw ?? 0) - (s.cam.yaw ?? 0)) < 10 && p.cam.move === s.cam.move)
    warn.push(`shot ${i} ${s.line}: same set+size+move+angle as shot ${i - 1} (jump cut)`); });
// sizes must come from the lens package (backlog #80)
const SIZES = ['ecu', 'cu', 'mcu', 'med', 'wide', 'ews'];
mod.SHOTS.forEach((s, i) => { if (!SIZES.includes(s.cam.size)) bad.push(`shot ${i} ${s.line}: size ${s.cam.size} not in lens package`); });
if (warn.length) console.log('WARN (variety):\n' + warn.join('\n'));
console.log(bad.length ? 'INVALID:\n' + bad.join('\n') : `ok: ${mod.SHOTS.length} shots valid`);
process.exit(bad.length ? 1 : 0);
