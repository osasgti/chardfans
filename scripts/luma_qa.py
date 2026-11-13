"""Picture-consistency QA (CLAUDE.md §52). Usage: python3 scripts/luma_qa.py <video.mp4> [fps]
Flags: 1-frame flashes/dropouts (|Δ| > 30 that reverts next frame), and per-second brightness outside 20..100 (0..255 luma)."""
import sys, re, subprocess, os
v, fps = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 24
meta = 'out/qa/yavg_qa.txt'; os.makedirs('out/qa', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', v, '-vf', f'scale=160:-1,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file={meta}',
                '-an', '-f', 'null', '-'], check=True)
Y = [float(x) for x in re.findall(r'YAVG=([\d.]+)', open(meta).read())]
flashes = [i for i in range(1, len(Y) - 1) if abs(Y[i] - Y[i - 1]) > 30 and abs(Y[i] - Y[i + 1]) > 30]
sec = [sum(Y[i:i + int(fps)]) / len(Y[i:i + int(fps)]) for i in range(0, len(Y), int(fps))]
hot = [(i, round(s)) for i, s in enumerate(sec) if s > 100]; cold = [(i, round(s)) for i, s in enumerate(sec) if s < 20]
print(f'frames {len(Y)}  mean {sum(Y)/len(Y):.1f}  per-second range {min(sec):.0f}..{max(sec):.0f}')
print('1-frame flashes:', [f'{i} ({i/fps:.2f}s)' for i in flashes] or 'none')
print('too bright seconds (>100):', hot or 'none'); print('too dark seconds (<20):', cold or 'none (planned blacks are OK)')
sys.exit(1 if flashes else 0)
