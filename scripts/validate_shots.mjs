// Validates src/lie/shots.ts cast references without a browser (esbuild ships with Remotion).
import {build} from 'esbuild';
const r = await build({entryPoints: ['src/lie/shots.ts'], bundle: true, write: false, format: 'esm', platform: 'node'});
const mod = await import('data:text/javascript;base64,' + Buffer.from(r.outputFiles[0].text).toString('base64'));
const bad = [];
mod.SHOTS.forEach((s, i) => {
  if (typeof s.cam.on === 'number' && !s.cast[s.cam.on]) bad.push(`shot ${i} ${s.line} cam.on=${s.cam.on}`);
  (s.meters ?? []).forEach((m) => { if (typeof m.on === 'number' && !s.cast[m.on]) bad.push(`shot ${i} ${s.line} meter.on=${m.on}`); });
});
console.log(bad.length ? 'INVALID:\n' + bad.join('\n') : `ok: ${mod.SHOTS.length} shots valid`);
process.exit(bad.length ? 1 : 0);
