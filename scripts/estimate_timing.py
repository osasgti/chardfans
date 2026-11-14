"""Estimate word timings from a script when no recogniser is available.
Usage: python3 scripts/estimate_timing.py script.txt [wpm=155] > public/vo/words.json
Pauses: '.', '?', '!' add 0.35s, ',' adds 0.15s, an empty line adds 0.8s. Replace with real
timings (TTS alignment or whisper) once a voiceover exists — keep the same JSON shape."""
import sys, json, re
text = open(sys.argv[1]).read(); wpm = float(sys.argv[2]) if len(sys.argv) > 2 else 155
spw = 60 / wpm; t = 0.3; out = []
for para in text.split('\n\n'):
    for w in para.split():
        syl = max(1, len(re.findall(r'[aeiouy]+', w.lower())))
        d = spw * (0.6 + 0.25 * syl)
        out.append({'text': w, 'start': round(t, 3), 'end': round(t + d, 3)}); t += d
        if w[-1] in '.?!': t += 0.35
        elif w[-1] in ',;:': t += 0.15
    t += 0.8
json.dump(out, sys.stdout, indent=1)
