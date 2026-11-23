"""Final assembly (CLAUDE.md §57.1): patch GPU dropout frames + two-pass loudness master + mux.
Usage: python scripts/finish.py <video.mp4 (muted)> <audio.wav> <out.mp4>
1. Dropouts: parallel GPU rendering occasionally returns a single blank/white frame (8 in 16k on a GTX 1650). Any frame whose
   luma jumps > 30 from BOTH neighbours is replaced by the previous frame (1/60 s, invisible). Only re-encodes if any are found.
2. Audio: compressor → loudnorm measured first, then applied linearly to −14 LUFS → limiter WITHOUT auto-level (level=0; the
   default auto make-up gain pushed masters to −12 LUFS / +0.2 dBTP). Then verified with ebur128; fails if off target."""
import json, os, re, shutil, subprocess, sys
video, audio, out = sys.argv[1:4]
ff = shutil.which('ffmpeg') or 'ffmpeg'
def run(args, **k): return subprocess.run([ff, *args], capture_output=True, text=True, **k)

# 1 — dropout frames
# metadata=print logs at info level (hidden by -v error), so write to a file; relative name + cwd avoids Windows drive-colon escaping
wd = os.path.dirname(os.path.abspath(out))
run(['-v', 'error', '-y', '-i', os.path.abspath(video), '-vf', 'scale=160:-1,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=_yavg_finish.txt',
     '-an', '-f', 'null', '-'], cwd=wd)
Y = [float(x) for x in re.findall(r'YAVG=([\d.]+)', open(os.path.join(wd, '_yavg_finish.txt')).read())]
if len(Y) < 10: sys.exit('could not measure frame brightness')
bad = [i for i in range(1, len(Y) - 1) if abs(Y[i] - Y[i - 1]) > 30 and abs(Y[i] - Y[i + 1]) > 30]
src = video
if bad:
    print(f'patching {len(bad)} dropout frame(s):', bad)
    g = '[0:v]null[v0]'
    for i, n in enumerate(bad):
        g += f';[v{i}]split[a{i}][b{i}];[a{i}][b{i}]freezeframes=first={n}:last={n}:replace={n - 1}[v{i + 1}]'
    src = os.path.splitext(out)[0] + '_patched_video.mp4'
    r = run(['-v', 'error', '-y', '-i', video, '-filter_complex', g, '-map', f'[v{len(bad)}]', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', src])
    if r.returncode: sys.exit('patch failed: ' + r.stderr)
else:
    print('no dropout frames')

# 2 — two-pass loudness master
comp = 'acompressor=threshold=-18dB:ratio=3:attack=10:release=150'
r = run(['-i', audio, '-af', f'{comp},loudnorm=I=-14:TP=-2:LRA=9:print_format=json', '-f', 'null', '-'])
m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
ln = (f"loudnorm=I=-14:TP=-2:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
r = run(['-v', 'error', '-y', '-i', src, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
         '-af', f'{comp},{ln},alimiter=limit=0.63:level=0:attack=1:release=60', '-ar', '48000', '-c:a', 'aac', '-b:a', '320k', out])
if r.returncode: sys.exit('mux failed: ' + r.stderr)
if src != video: os.remove(src)

# verify
r = run(['-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1]); P = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
print(f'master: {I:.1f} LUFS, peak {P:.1f} dB -> {out}')
if abs(I + 14) > 1 or P > -1: sys.exit('loudness out of spec')
