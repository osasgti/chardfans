"""Promise Threads timeline: scripts/promise_tts.json + public/vo_promise/picks.txt + raw takes
→ cleaned public/vo_promise/<ID>.wav + src/promise/timeline.json (seconds; words estimated inside each real take)."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.join(os.path.dirname(__file__), '..')
P = lambda *a: os.path.join(ROOT, *a)
lines = json.load(open(P('scripts/promise_tts.json')))
picks = dict(l.split() for l in open(P('public/vo_promise/picks.txt')) if l.strip())
ACTS = [('hook', 'P001'), ('act1', 'P004'), ('act2', 'P013'), ('act3', 'P021'), ('act4', 'P031'), ('act5', 'P040')]
def key(i): m = re.match(r'P(\d+)([a-z]?)', i); return (int(m[1]), m[2])
def act_of(i):
    a = 'hook'
    for n, f in ACTS:
        if key(i) >= key(f): a = n
    return a
GAP, ACT_GAP = 0.7, 2.6
# holds after reveals / punchlines (§52.2): seconds of picture with no voice
HOLD = {'P018': 1.0, 'P019': 1.6, 'P025': 1.2, 'P034': 1.0, 'P037': 1.4, 'P041': 0.9, 'P046': 1.0, 'P002': 1.2, 'P003b': 1.0, 'P005': 0.7, 'P008': 0.9, 'P010': 1.0, 'P011': 0.9, 'P012': 1.2, 'P016': 0.8,
        'P020': 1.2, 'P024': 1.4, 'P027': 1.0, 'P029': 1.4, 'P032': 0.9, 'P033': 2.2, 'P035': 1.2, 'P038k': 1.4,
        'P039': 2.6, 'P043': 0.4, 'P044': 2.6, 'P045': 0.8, 'P047': 1.2, 'P049': 2.5}
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
def words(text, t0, total):
    ws = re.sub(r'\[[^\]]*\]', '', text).replace('...', ' ').replace('…', ' ').split(); w8 = []
    for w in ws:
        syl = max(1, len(re.findall(r'[aeiouy]+', w.lower())))
        w8.append((w, 0.6 + 0.25 * syl, 0.3 if w[-1] in '.?!' else 0.12 if w[-1] in ',:;' else 0))
    k = total / sum(a + b for _, a, b in w8); out = []; t = t0
    for w, a, b in w8: out.append({'text': w, 'start': round(t, 3), 'end': round(t + a * k, 3)}); t += (a + b) * k
    return out
tl, t, prev = [], 0.8, None
for lid, tag, text in sorted(lines, key=lambda r: key(r[0])):
    act = act_of(lid)
    if prev and act != prev: t += ACT_GAP
    raw = P(f'public/vo_promise/raw/{lid}_{picks[lid]}.mp3'); wav = P(f'public/vo_promise/{lid}.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
        'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5,loudnorm=I=-16:TP=-2', '-ar', '48000', '-ac', '2', wav], check=True)
    d = dur(wav); clean = text.replace('MESS', 'mess').replace('IGNITES', 'ignites')
    tl.append({'id': lid, 'act': act, 'speaker': 'kid' if lid.endswith('k') else 'narrator', 'text': clean,
               'start': round(t, 3), 'end': round(t + d, 3), 'audio': f'vo_promise/{lid}.wav', 'words': words(clean, t, d)})
    t += d + HOLD.get(lid, GAP); prev = act
total = t + 1.5
json.dump({'total': round(total, 3), 'lines': tl}, open(P('src/promise/timeline.json'), 'w'), indent=1)
print(f'{len(tl)} lines, total {total:.1f}s ({total/60:.2f} min)')
for a, _ in ACTS:
    ls = [l for l in tl if l['act'] == a]; print(f'  {a:5s} {ls[0]["start"]:6.1f} → {ls[-1]["end"]:6.1f}')
