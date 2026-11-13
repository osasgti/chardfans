"""VO consistency check (CLAUDE.md §54.2). Measures each take's loudness (active speech) and voicing ratio
(share of 100–1000Hz energy: a whisper is ~0.1–0.3, normal speech ~0.5–0.65).
Usage: python3 scripts/vo_consistency.py <file.mp3> [...]   → prints one row per file; flags outliers."""
import sys, subprocess, numpy as np
def measure(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768
    fr = x[:len(x) // 400 * 400].reshape(-1, 400); act = fr[np.sqrt((fr ** 2).mean(1)) > 0.01]
    if not len(act): return None, None
    sp = np.abs(np.fft.rfft(act * np.hanning(400), axis=1)); fq = np.fft.rfftfreq(400, 1 / 16000)
    voicing = float(np.median(sp[:, (fq > 100) & (fq < 1000)].sum(1) / sp.sum(1)))
    return 20 * np.log10(np.sqrt((act ** 2).mean())), voicing
if __name__ == '__main__':
    for f in sys.argv[1:]:
        r, v = measure(f)
        flag = '  ✘ whisper/breathy' if v is not None and v < 0.42 else ''
        print(f'{f:45s} level {r:6.1f} dB  voicing {v:.2f}{flag}')
