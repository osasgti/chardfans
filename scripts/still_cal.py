"""Fast per-shot exposure calibration + visual audit from stills (CLAUDE.md §52.1, §57).
Renders one still from the middle of every shot (GPU: ~3-6 s each), measures mean luma, and writes the per-shot exposure
correction toward the grade target, without a full render. Also tiles a labelled contact sheet to look at.
Usage: python scripts/still_cal.py [promise|lie] [--measure-only] [--scale 0.25]
  - run once with the current calibration in place: reports luma per shot (what the next render will look like)
  - calibration REPLACES src/<video>/exposure_cal.json (computed relative to what is already applied, so it converges).
Writes: src/<video>/exposure_cal.json · out/cal_<video>/<shot>.jpg · out/cal_<video>/sheet_<n>.jpg · out/cal_<video>/report.txt"""
import json, math, os, re, shutil, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VID = next((a for a in sys.argv[1:] if a in ('promise', 'lie')), 'promise'); LID = 'P' if VID == 'promise' else 'L'
COMP = 'PromiseThreads' if VID == 'promise' else 'LieMeter'
MEASURE_ONLY = '--measure-only' in sys.argv; NO_RENDER = '--no-render' in sys.argv
SCALE = float(sys.argv[sys.argv.index('--scale') + 1]) if '--scale' in sys.argv else 0.25
TARGET = {'wonder': 46, 'fun': 60, 'triumph': 62, 'tension': 42, 'consequence': 34}
STRENGTH, MAX_UP, MAX_DOWN = 0.8, 1.6, 1.6
FPS = 24                                                      # composition default (no fps prop)
NPX = 'npx.cmd' if os.name == 'nt' else 'npx'
ffmpeg = shutil.which('ffmpeg') or next((os.path.join(d, 'ffmpeg.exe') for d, _, f in os.walk(os.path.expandvars(r'%LOCALAPPDATA%\Microsoft\WinGet\Packages')) if 'ffmpeg.exe' in f), 'ffmpeg') if os.name == 'nt' else 'ffmpeg'

tl = json.load(open(os.path.join(ROOT, f'src/{VID}/timeline.json'))); lines, total = tl['lines'], tl['total']
src = open(os.path.join(ROOT, f'src/{VID}/shots.ts'), encoding='utf-8').read()
shots = [(m.group(1), float(m.group(2) or 1), m.group(3)) for m in
         re.finditer(r"\{line: '(" + LID + r"\d+[a-z]?)'(?:, w: ([\d.]+))?,[^\n]*?grade: '(\w+)'", src)]
plan = []
for li, l in enumerate(lines):
    ws = l['start'] - 0.25 if li else 0; we = lines[li + 1]['start'] - 0.25 if li < len(lines) - 1 else total
    ss = [s for s in shots if s[0] == l['id']]; Wt = sum(s[1] for s in ss); t = ws
    for k, s in enumerate(ss):
        d = (we - ws) * s[1] / Wt; plan.append((f"{l['id']}_{k}", l['id'], k, s[2], round((t + d / 2) * FPS))); t += d
calp = os.path.join(ROOT, f'src/{VID}/exposure_cal.json')
cur = json.load(open(calp)) if os.path.exists(calp) else {}

out = os.path.join(ROOT, f'out/cal_{VID}'); os.makedirs(out, exist_ok=True)
bundle = os.path.join(ROOT, 'out/bundle_cal')
if not NO_RENDER:
  print('bundling...', flush=True)
  subprocess.run([NPX, 'remotion', 'bundle', 'src/index.ts', '--out-dir', bundle], cwd=ROOT, check=True, capture_output=True)
env = {**os.environ, 'REMOTION_GL': os.environ.get('REMOTION_GL', 'angle')}
props = json.dumps({'res': SCALE})
for name, _, _, _, f in ([] if NO_RENDER else plan):
    jpg = os.path.join(out, name + '.jpg')
    r = subprocess.run([NPX, 'remotion', 'still', bundle, COMP, jpg, f'--frame={f}', f'--scale={SCALE}', f'--props={props}', '--timeout=180000', '--log=error'],
                       cwd=ROOT, env=env, capture_output=True, text=True)
    print(('ok  ' if r.returncode == 0 else 'FAIL') + f' {name} frame {f}', flush=True)

def luma(p):
    # metadata=print logs at info level (hidden by -v error), so write it to a file; relative path avoids Windows drive-colon escaping
    subprocess.run([ffmpeg, '-v', 'error', '-y', '-i', p, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=_y.txt', '-f', 'null', '-'],
                   capture_output=True, text=True, cwd=out)
    try: m = re.search(r'YAVG=([\d.]+)', open(os.path.join(out, '_y.txt')).read())
    except OSError: return None
    return float(m.group(1)) if m else None
cal, rep = {}, []
for name, lid, k, grade, f in plan:
    y = luma(os.path.join(out, name + '.jpg'))
    applied = (cur.get(lid) or [0] * (k + 1))[k] if k < len(cur.get(lid) or []) else 0
    if y is None: stops = applied
    else:
        delta = STRENGTH * math.log2(TARGET[grade] / max(y, 1))   # correction relative to what is already applied
        stops = max(-MAX_DOWN, min(MAX_UP, applied + delta))
        if abs(stops) < 0.1: stops = 0.0
    cal.setdefault(lid, []).append(round(stops, 2))
    flag = '' if y is None or abs(math.log2(TARGET[grade] / max(y, 1))) < 0.32 else '  <- off target'
    rep.append(f'{name:9s} {grade:11s} luma {y if y is None else round(y, 1)!s:>6} target {TARGET[grade]:3d}  applied {applied:+.2f}  next {stops:+.2f}{flag}')
open(os.path.join(out, 'report.txt'), 'w', encoding='utf-8').write('\n'.join(rep)); print('\n'.join(rep))
if not MEASURE_ONLY:
    json.dump(cal, open(calp, 'w'), indent=1); print('wrote', calp)

# labelled contact sheets, 16 per sheet
names = [p[0] for p in plan]
for s in range(0, len(names), 16):
    part = names[s:s + 16]; args, fl = [], ''
    for i, n in enumerate(part):
        args += ['-i', os.path.join(out, n + '.jpg')]
        font = "fontfile='C\:/Windows/Fonts/arial.ttf':" if os.name == 'nt' else ''
        fl += f"[{i}]scale=480:270,drawtext={font}text='{n}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.8[v{i}];"
    while len(part) < 16:
        args += ['-f', 'lavfi', '-i', 'color=black:s=480x270']; fl += f'[{len(part)}]null[v{len(part)}];'; part.append('')
    fl += ''.join(f'[v{i}]' for i in range(16)) + 'xstack=inputs=16:layout=' + '|'.join(f'{(i % 4) * 480}_{(i // 4) * 270}' for i in range(16))
    subprocess.run([ffmpeg, '-v', 'error', '-y', *args, '-filter_complex', fl, '-frames:v', '1', os.path.join(out, f'sheet_{s // 16}.jpg')])
print('sheets in', out)
