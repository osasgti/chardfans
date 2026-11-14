"""timeline.json → SRT captions (CLAUDE.md §49: 5–7 words per cue, ≤42 chars per line, ≥1s on screen)."""
import json, sys, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
tl = json.load(open(os.path.join(ROOT, 'src/lie/timeline.json')))
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}'
cues = []
for line in tl['lines']:
    ws = line['words']; cur = []
    for w in ws:
        cur.append(w)
        text = ' '.join(x['text'] for x in cur)
        if len(cur) >= 7 or len(text) > 38 or w['text'][-1] in '.?!':
            cues.append(cur); cur = []
    if cur: cues.append(cur)
out = []
for i, c in enumerate(cues):
    st = c[0]['start']; en = max(c[-1]['end'], st + 1.0)
    if i + 1 < len(cues): en = min(en, cues[i + 1][0]['start'] - 0.02)
    out.append(f"{i + 1}\n{ts(st)} --> {ts(en)}\n{' '.join(x['text'] for x in c)}\n")
dst = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out/lie-meter_captions.srt')
open(dst, 'w').write('\n'.join(out)); print(len(out), 'cues →', dst)
