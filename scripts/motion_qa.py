"""Motion + highlight QA (prompts/MASTER_PROMPT_ANIMATION.md I2, I3).
Usage: python scripts/motion_qa.py <video.mp4> [fps]
  STILL  any 1-second window whose summed frame-to-frame difference is below 14 (0-255): the picture is frozen.
  CLIP   any second where more than 0.4% of pixels sit at luma >= 245: highlights are blowing out (faces, screens).
Exit code 1 if anything is flagged (planned black at the very start/end is ignored)."""
import os, re, shutil, subprocess, sys
video = os.path.abspath(sys.argv[1]); fps = float(sys.argv[2]) if len(sys.argv) > 2 else 60
ff = shutil.which('ffmpeg') or 'ffmpeg'; wd = os.path.dirname(video)
# metadata=print to a file (info-level logs are hidden by -v error); relative name + cwd avoids Windows drive-colon escaping
for vf in ['scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=_mqa_diff.txt',
           'scale=320:-1,format=gray,lutyuv=y=if(gte(val\,245)\,255\,0),signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=_mqa_clip.txt']:
    subprocess.run([ff, '-v', 'error', '-y', '-i', video, '-vf', vf, '-an', '-f', 'null', '-'], cwd=wd, check=True)
rd = lambda n: [float(x) for x in re.findall(r'YAVG=([\d.]+)', open(os.path.join(wd, n)).read())]
diff, clip = rd('_mqa_diff.txt'), rd('_mqa_clip.txt')
F = int(round(fps)); secs = len(clip) // F
still = [s for s in range(1, secs - 2) if sum(diff[s * F:(s + 1) * F]) < 14]   # motion per SECOND (fps-independent)
hot = [(s, round(max(clip[s * F:(s + 1) * F]) / 255 * 100, 2)) for s in range(secs) if max(clip[s * F:(s + 1) * F]) / 255 > 0.004]
print('frozen seconds (STILL):', still or 'none')
print('blown-highlight seconds (CLIP, % pixels):', hot or 'none')
sys.exit(1 if still or hot else 0)
