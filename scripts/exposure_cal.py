"""Per-shot exposure calibration (CLAUDE.md §52).
Measures each shot's mean luma in a rendered video and computes an exposure correction (in stops) toward a
per-grade target, so white-headed close-ups don't blow out and void shots don't crush to black.
Usage: python3 scripts/exposure_cal.py <video.mp4> [fps=24]
Writes: src/lie/exposure_cal.json  {"L003b": [stops_shot0, stops_shot1], ...}  (read by engine.tsx for future renders)
        out/qa/exposure_filter.txt  ffmpeg filter chain that applies the same correction to an existing render."""
import json, re, sys, subprocess, math, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
video = sys.argv[1]; fps = float(sys.argv[2]) if len(sys.argv) > 2 else 24
TARGET = {'wonder': 46, 'fun': 60, 'triumph': 62, 'tension': 42, 'consequence': 34}   # mean luma 0..255 per grade
STRENGTH, MAX_UP, MAX_DOWN = 0.75, 1.0, 1.1                                           # partial correction, clamped (stops)
ymeta = os.path.join(ROOT, 'out/qa/yavg_cal.txt')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-vf',
                f'scale=160:-1,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file={ymeta}', '-an', '-f', 'null', '-'], check=True)
Y = [float(x) for x in re.findall(r'YAVG=([\d.]+)', open(ymeta).read())]
tl = json.load(open(os.path.join(ROOT, 'src/lie/timeline.json'))); lines, total = tl['lines'], tl['total']
src = open(os.path.join(ROOT, 'src/lie/shots.ts')).read()
shots = [(m.group(1), float(m.group(2) or 1), m.group(3)) for m in
         re.finditer(r"\{line: '(L\d+[a-z]?)'(?:, w: ([\d.]+))?,[^\n]*?grade: '(\w+)'", src)]
cal, filt = {}, []
for li, l in enumerate(lines):
    ws = l['start'] - 0.25 if li else 0; we = lines[li + 1]['start'] - 0.25 if li < len(lines) - 1 else total
    ss = [s for s in shots if s[0] == l['id']]; W = sum(s[1] for s in ss); t = ws
    for s in ss:
        d = (we - ws) * s[1] / W; fr = Y[int(t * fps):int((t + d) * fps)] or [TARGET[s[2]]]
        mean = sorted(fr)[len(fr) // 2]                                   # median: ignores 1-frame glitches
        stops = max(-MAX_DOWN, min(MAX_UP, STRENGTH * math.log2(TARGET[s[2]] / max(mean, 1))))
        if abs(stops) < 0.1: stops = 0.0
        cal.setdefault(l['id'], []).append(round(stops, 2))
        # frame-exact windows, using the same rounding as LieVideo's <Sequence from={round(start*fps)}> (time-based windows drifted by 1 frame)
        n0, n1 = round(t * fps), round((t + d) * fps) - 1
        if stops: filt.append(f"exposure=exposure={stops:.2f}:enable='between(n,{n0},{n1})'")
        print(f"{l['id']:6s} {s[2]:11s} {t:6.1f}s  median {mean:5.1f} → target {TARGET[s[2]]:3d}  {stops:+.2f} stops")
        t += d
json.dump(cal, open(os.path.join(ROOT, 'src/lie/exposure_cal.json'), 'w'), indent=1)
open(os.path.join(ROOT, 'out/qa/exposure_filter.txt'), 'w').write(','.join(filt) or 'null')
print(f'{len(filt)} shots corrected')
