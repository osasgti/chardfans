"""Motion test for one line (MASTER_PROMPT_ANIMATION I1, I4): renders that line's shots as a half-scale 24 fps clip, a flip-book GIF
(review motion fast) and a 12-frame contact sheet, then runs motion_qa.py on the clip.
Usage: python scripts/motion_test.py P021 [promise|lie]
Writes out/motion/<line>.mp4 · out/motion/<line>.gif · out/motion/<line>_sheet.jpg"""
import json, os, shutil, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
line = sys.argv[1]; vid = sys.argv[2] if len(sys.argv) > 2 else 'promise'
comp = 'PromiseThreads' if vid == 'promise' else 'LieMeter'
tl = json.load(open(os.path.join(ROOT, f'src/{vid}/timeline.json')))
L = tl['lines']; i = next(k for k, l in enumerate(L) if l['id'] == line)
a = (L[i]['start'] - 0.25) if i else 0; b = (L[i + 1]['start'] - 0.25) if i + 1 < len(L) else tl['total']
f0, f1 = max(0, round(a * 24)), round(b * 24) - 1
out = os.path.join(ROOT, 'out', 'motion'); os.makedirs(out, exist_ok=True)
mp4 = os.path.join(out, line + '.mp4')
npx = 'npx.cmd' if os.name == 'nt' else 'npx'
env = {**os.environ, 'REMOTION_GL': os.environ.get('REMOTION_GL', 'angle')}
subprocess.run([npx, 'remotion', 'render', 'src/index.ts', comp, mp4, f'--frames={f0}-{f1}', '--scale=0.5', '--props={"res":0.5}', '--concurrency=6', '--log=error'],
               cwd=ROOT, env=env, check=True)
ff = shutil.which('ffmpeg') or 'ffmpeg'
subprocess.run([ff, '-v', 'error', '-y', '-i', mp4, '-vf', 'fps=10,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse', os.path.join(out, line + '.gif')], check=True)
n = f1 - f0 + 1
subprocess.run([ff, '-v', 'error', '-y', '-i', mp4, '-vf', f"select='not(mod(n\\,{max(1, n // 12)}))',scale=320:-1,tile=4x3", '-frames:v', '1', os.path.join(out, line + '_sheet.jpg')], check=True)
print(f'{line}: frames {f0}-{f1} ({n / 24:.1f} s) -> {out}')
subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'motion_qa.py'), mp4, '24'])
