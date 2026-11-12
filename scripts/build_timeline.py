"""Builds the lie-meter timeline from the master prompt's TTS table.
- Real voice: public/vo/raw/<ID>.mp3 → cleaned public/vo/<ID>.wav, duration measured.
- Missing voice: duration estimated (150 wpm + pauses), shown as captions only.
Writes src/lie/timeline.json: [{id, act, text, start, end, audio|null, words:[{text,start,end}]}] (seconds)."""
import re, json, os, subprocess
ROOT = os.path.join(os.path.dirname(__file__), '..')
md = open(os.path.join(ROOT, 'prompts/WHAT_IF_LIE_METER.md')).read()
rows = re.findall(r'^\| (L\d+[a-z]?) \| `[^`]*` \| (.*) \|$', md, re.M)
ACTS = [('hook', 'L001'), ('act1', 'L004'), ('act2', 'L009'), ('act3', 'L016'), ('act4', 'L023'), ('end', 'L030')]
def act_of(i):
    a = 'hook'
    for name, first in ACTS:
        if i >= first: a = name
    return a
def key(i): m = re.match(r'L(\d+)([a-z]?)', i); return (int(m[1]), m[2])
EST_SCALE = 0.85
GAP = {'default': 0.45, 'act': 1.6}
HOLD_AFTER = {'L006': 0.8, 'L019': 1.6, 'L022d': 1.2, 'L024': 2.2, 'L025': 1.4, 'L027': 0.9, 'L032c': 0.8, 'L033': 0.8, 'L034': 1.5}
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
def est_words(text, t0, total=None):
    ws = text.replace('...', ' … ').split(); out = []; t = t0; spw = 60 / 150
    weights = []
    for w in ws:
        if w == '…': weights.append(('…', 0.55)); continue
        syl = max(1, len(re.findall(r'[aeiouy]+', w.lower())))
        p = 0.3 if w[-1] in '.?!' else 0.12 if w[-1] in ',:;' else 0
        weights.append((w, spw * (0.6 + 0.25 * syl), p))
    raw = sum(x[1] + (x[2] if len(x) > 2 else 0) for x in weights)
    k = (total / raw) if total else EST_SCALE  # calibrated against real ElevenLabs takes (L001/L007/L008: real/est ≈ 0.84)
    for x in weights:
        if x[0] == '…': t += x[1] * k; continue
        d = x[1] * k; out.append({'text': x[0], 'start': round(t, 3), 'end': round(t + d, 3)}); t += d + x[2] * k
    return out, (t - t0)
tl = []; t = 0.6; prev_act = None
os.makedirs(os.path.join(ROOT, 'public/vo'), exist_ok=True)
for lid, text in sorted(rows, key=lambda r: key(r[0])):
    text = re.sub(r'([.?!])",', r'\1"', text).replace(',,', ',').replace(' ,', ',')
    act = act_of(lid)
    if prev_act and act != prev_act: t += GAP['act']
    raw = os.path.join(ROOT, f'public/vo/raw/{lid}.mp3'); wav = os.path.join(ROOT, f'public/vo/{lid}.wav'); audio = None
    if os.path.exists(raw):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
            'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
            'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5,loudnorm=I=-16:TP=-2', '-ar', '48000', '-ac', '2', wav], check=True)
        d = dur(wav); words, _ = est_words(text, t, d); audio = f'vo/{lid}.wav'
    else:
        words, d = est_words(text, t)
    tl.append({'id': lid, 'act': act, 'text': text, 'start': round(t, 3), 'end': round(t + d, 3), 'audio': audio, 'words': words})
    t += d + HOLD_AFTER.get(lid, GAP['default']); prev_act = act
total = t + 2.5
json.dump({'total': round(total, 3), 'lines': tl}, open(os.path.join(ROOT, 'src/lie/timeline.json'), 'w'), indent=1)
voiced = sum(1 for l in tl if l['audio'])
print(f'{len(tl)} lines, {voiced} voiced, total {total:.1f}s ({total/60:.2f} min)')
for a, _ in ACTS:
    ls = [l for l in tl if l['act'] == a]; print(f'  {a:5s} {ls[0]["start"]:6.1f} → {ls[-1]["end"]:6.1f}')
