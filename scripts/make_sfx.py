"""Procedural sound design kit — deterministic, no downloads.
Run: python3 scripts/make_sfx.py  → writes public/sfx/*.wav (48 kHz, 16-bit stereo)."""
import numpy as np, wave, os
SR = 48000
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
os.makedirs(OUT, exist_ok=True)

def t(d): return np.arange(int(SR * d)) / SR
def env(n, a, r, curve=4.0):
    e = np.ones(n); A = max(1, int(a * SR)); e[:A] = np.linspace(0, 1, A) ** 2
    rel = np.exp(-curve * np.linspace(0, 1, n - A)); e[A:] *= rel; return e
def lowpass(x, fc):
    """one-pole lowpass; fc may be an array (time-varying)."""
    fc = np.broadcast_to(fc, x.shape); a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def bandpass(x, fc, q=2.0):
    """state-variable filter, time-varying fc."""
    fc = np.broadcast_to(fc, x.shape); y = np.empty_like(x); lp = bp = 0.0
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        hp = x[i] - lp - bp / q; bp += f * hp; lp += f * bp; y[i] = bp
    return y
def reverb(x, size=1.8, mix=0.3, damp=3000):
    n = int(SR * size); ir = rng.standard_normal(n) * np.exp(-6.0 * np.linspace(0, 1, n))
    ir = lowpass(ir, damp); ir /= np.abs(ir).sum() ** 0.5 * 4
    L = len(x) + n; F = np.fft.rfft(x, L) * np.fft.rfft(ir, L)
    wet = np.fft.irfft(F, L)[:L]; dry = np.concatenate([x, np.zeros(n)])
    return dry * (1 - mix) + wet * mix
def stereo(x, width=0.25, delay_ms=11):
    d = int(SR * delay_ms / 1000); r = np.concatenate([np.zeros(d), x])[:len(x)]
    return np.stack([x, x * (1 - width) + r * width])
def save(name, x, peak=0.89):
    if x.ndim == 1: x = stereo(x)
    x = x / (np.abs(x).max() + 1e-9) * peak
    fade = min(480, x.shape[1] // 4); x[:, -fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x.T * 32767).astype('<i2').tobytes())
    print('wrote', name, f'{x.shape[1] / SR:.2f}s')

def bell(f0, d, partials=((1, 1), (2.76, .5), (5.4, .25), (8.9, .12)), decay=5):
    tt = t(d); y = sum(a * np.sin(2 * np.pi * f0 * r * tt) * np.exp(-decay * r ** 0.5 * tt) for r, a in partials)
    return y * env(len(tt), 0.002, 1, 0.5)

# 1. whoosh — swept band-passed noise, swells then fades (cuts, camera moves)
d = 0.9; n = rng.standard_normal(len(t(d))); ph = np.linspace(0, 1, len(n))
sweep = 300 + 3200 * np.sin(np.pi * ph) ** 2
w = bandpass(n, sweep, 1.4) * np.sin(np.pi * ph) ** 1.6
save('whoosh', reverb(w, 0.9, 0.25))

# 2. tick — UI number tick
d = 0.08; tt = t(d); x = np.sin(2 * np.pi * 2400 * tt) * np.exp(-90 * tt) + 0.4 * rng.standard_normal(len(tt)) * np.exp(-400 * tt)
save('tick', x, 0.6)

# 3. title word — soft low "tock" with air
d = 0.35; tt = t(d); x = np.sin(2 * np.pi * 180 * tt * (1 - 0.3 * tt)) * np.exp(-22 * tt) + 0.15 * bandpass(rng.standard_normal(len(tt)), 5000, 1) * np.exp(-30 * tt)
save('word', reverb(x, 1.2, 0.35), 0.7)

# 4. badge pop — gold chime (two bells a fifth apart)
x = bell(1318.5, 1.6) + 0.6 * np.concatenate([np.zeros(int(.06 * SR)), bell(1975.5, 1.54)])
save('chime', reverb(x, 2.0, 0.35, 5000))

# 5. riser — 2s rising noise + saw sweep (tension before reveal)
d = 2.0; tt = t(d); ph = tt / d
f = 120 * 2 ** (ph * 3.5); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
x = 0.4 * lowpass(saw, 400 + 5000 * ph ** 2) + bandpass(rng.standard_normal(len(tt)), 400 + 7000 * ph ** 2, 1.2)
x *= ph ** 2.2
save('riser', reverb(x, 1.0, 0.25))

# 6. impact — sub drop + body thump + noise transient (the 99% hit)
d = 2.2; tt = t(d)
sub = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-14 * tt)) / SR) * np.exp(-2.2 * tt)
body = lowpass(rng.standard_normal(len(tt)), 900) * np.exp(-18 * tt) * 3
x = sub * 1.2 + body + 0.3 * rng.standard_normal(len(tt)) * np.exp(-60 * tt)
save('impact', reverb(x, 2.5, 0.3, 2500))

# 7. reveal sparkle — big chime cluster for the reveal
x = sum(np.concatenate([np.zeros(int(i * .045 * SR)), bell(f, 2.2 - i * .045, decay=3.5)]) * (0.9 ** i)
        for i, f in enumerate([1046.5, 1318.5, 1568, 2093, 2637]))
save('sparkle', reverb(x, 2.8, 0.45, 6000))

# 8. coin shimmer — metallic glints looping while the coin spins
d = 5.5; tt = t(d); x = np.zeros(len(tt))
for k in range(26):
    s = int((k * 0.21 + rng.uniform(0, .05)) * SR); g = bell(rng.uniform(3800, 5200), 0.25, ((1, 1), (2.4, .4)), 14) * 0.5
    x[s:s + len(g)] += g[:len(x) - s]
save('coin', reverb(x, 1.0, 0.3, 7000), 0.5)

# 9. music bed — warm detuned-saw pad, Am → F → C → G, slow attack, big verb
bpm = 72; beat = 60 / bpm; chords = [(57, 60, 64), (53, 57, 60), (48, 55, 64), (55, 59, 62)]
total = 11.0; x = np.zeros(int(total * SR)); cl = beat * 4 * 0.75
for ci in range(int(total / cl) + 1):
    notes = chords[ci % 4]; s = int(ci * cl * SR); n = min(int((cl + 1.0) * SR), len(x) - s)
    if n <= 0: break
    tt = np.arange(n) / SR; e = np.minimum(1, tt / 0.9) * np.exp(-0.5 * np.maximum(0, tt - cl))
    for m in notes + (notes[0] - 12,):
        f = 440 * 2 ** ((m - 69) / 12)
        for det in (-0.12, 0.0, 0.12):
            ph = (f * 2 ** (det / 12) * tt + rng.uniform()) % 1
            x[s:s + n] += (2 * ph - 1) * e * 0.08
pad = lowpass(x, 1400 + 600 * np.sin(2 * np.pi * np.arange(len(x)) / SR / 8))
pulse = np.zeros(len(x))  # soft heartbeat kick on each bar
for b in np.arange(0, total, beat * 2):
    s = int(b * SR); tt = np.arange(int(.4 * SR)) / SR
    k = np.sin(2 * np.pi * np.cumsum(45 + 60 * np.exp(-25 * tt)) / SR) * np.exp(-9 * tt)
    pulse[s:s + len(k)] += k[:len(x) - s] * 0.35
save('music', reverb(pad + pulse, 3.5, 0.45, 2200)[: int(total * SR)], 0.8)

# 10. room tone — very quiet air under everything
x = lowpass(rng.standard_normal(int(11 * SR)), 500) + 0.2 * lowpass(rng.standard_normal(int(11 * SR)), 3000)
save('room', x, 0.25)
