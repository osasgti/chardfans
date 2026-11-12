"""Deterministic synthesis building blocks for the SFX library (numpy only)."""
import numpy as np, wave, os
SR = 48000
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
os.makedirs(OUT, exist_ok=True)

def T(d): return np.arange(int(SR * d)) / SR
def N(d): return rng.standard_normal(int(SR * d))
def sine(f, d, ph=0.0):
    f = np.broadcast_to(np.asarray(f, float), (int(SR * d),)); return np.sin(2 * np.pi * np.cumsum(f) / SR + ph)
def saw(f, d):
    f = np.broadcast_to(np.asarray(f, float), (int(SR * d),)); return 2 * ((np.cumsum(f) / SR + rng.uniform()) % 1) - 1
def square(f, d, duty=0.5): return np.where((saw(f, d) + 1) / 2 < duty, 1.0, -1.0)
def adsr(n, a=0.005, d=0.1, s=0.6, r=0.2):
    A, D, R = int(a * SR), int(d * SR), int(r * SR); S = max(0, n - A - D - R)
    e = np.concatenate([np.linspace(0, 1, A), np.linspace(1, s, D), np.full(S, s), np.linspace(s, 0, R)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]
def dec(n, rate, a=0.002):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-rate * t)
def _svf(x, fc, q, mode):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape); y = np.empty_like(x); lp = bp = 0.0
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6.5) / SR); hp = x[i] - lp - bp / q; bp += f * hp; lp += f * bp
        y[i] = lp if mode == 0 else bp if mode == 1 else hp
    return y
def lowpass(x, fc, q=0.707): return _svf(x, fc, q, 0)
def bandpass(x, fc, q=2.0): return _svf(x, fc, q, 1)
def highpass(x, fc, q=0.707): return _svf(x, fc, q, 2)
FORMANTS = {'a': (800, 1150, 2900), 'e': (400, 1600, 2700), 'i': (300, 2300, 3000), 'o': (450, 800, 2830), 'u': (325, 700, 2530)}
def formant(x, vowel='a'):
    f1, f2, f3 = FORMANTS[vowel]; return bandpass(x, f1, 6) + 0.6 * bandpass(x, f2, 8) + 0.3 * bandpass(x, f3, 10)
def bell(f0, d, partials=((1, 1), (2.76, .5), (5.4, .25), (8.9, .12)), decay=5.0):
    t = T(d); return sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-decay * r ** 0.5 * t) for r, a in partials) * np.minimum(1, t / 0.002)
def fm(fc, fmod, index, d):
    t = T(d); idx = np.broadcast_to(np.asarray(index, float), t.shape)
    return np.sin(2 * np.pi * fc * t + idx * np.sin(2 * np.pi * fmod * t))
def karplus(f, d, damp=0.996):
    n = int(SR * d); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); y = np.empty(n)
    for i in range(n): y[i] = buf[i % p]; buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return y
def granular(src, d, density=40, glen=0.06, pitch_jit=0.1):
    out = np.zeros(int(SR * d)); g = int(glen * SR); win = np.hanning(g)
    for _ in range(int(density * d)):
        s = rng.integers(0, len(out) - g); o = rng.integers(0, max(1, len(src) - g * 2))
        r = 1 + rng.uniform(-pitch_jit, pitch_jit); idx = (o + np.arange(g) * r).astype(int) % len(src)
        out[s:s + g] += src[idx] * win
    return out
def reverb(x, size=1.8, mix=0.3, damp=3000):
    n = int(SR * size); ir = rng.standard_normal(n) * np.exp(-6.0 * np.linspace(0, 1, n)); ir = lowpass(ir, damp)
    ir /= np.sqrt(np.sum(ir ** 2)) * 3; L = len(x) + n
    wet = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[:L]
    return np.concatenate([x, np.zeros(n)]) * (1 - mix) + wet * mix
def delay(x, time=0.25, fb=0.35, mix=0.3):
    d = int(time * SR); y = np.concatenate([x, np.zeros(d * 6)])
    for k in range(1, 7): y[d * k:d * k + len(x)] += x * (fb ** k) * mix
    return y
def saturate(x, drive=2.0): return np.tanh(x * drive) / np.tanh(drive)
def bitcrush(x, bits=6, hold=8):
    q = 2 ** bits; y = np.round(x * q) / q; return np.repeat(y[::hold], hold)[:len(x)]
def rev(x): return x[::-1].copy()
def cat(*xs): return np.concatenate(xs)
def at(total, *events):
    """Mix (start_seconds, signal) events into a buffer of `total` seconds."""
    out = np.zeros(int(SR * total))
    for s, sig in events:
        i = int(s * SR); n = min(len(sig), len(out) - i)
        if n > 0: out[i:i + n] += sig[:n]
    return out
def loop_xfade(x, fade=1.0):
    f = int(fade * SR); head, body = x[:f], x[f:].copy(); w = np.linspace(0, 1, f)
    body[-f:] = body[-f:] * (1 - w) + head * w; return body
def stereo(x, width=0.25, delay_ms=11, pan=0.0):
    d = int(SR * delay_ms / 1000); r = np.concatenate([np.zeros(d), x])[:len(x)]
    L, R = x, x * (1 - width) + r * width; gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([L * gl * 1.414, R * gr * 1.414])
def save(name, x, peak=0.89, keep_tail=True):
    if x.ndim == 1: x = stereo(x)
    x = x / (np.abs(x).max() + 1e-9) * peak; fade = min(480, x.shape[1] // 4); x[:, -fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype('<i2').tobytes())
    print(f'  {name:18s} {x.shape[1] / SR:5.2f}s')
