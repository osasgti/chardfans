"""Full procedural SFX + music library (CLAUDE.md §36.6). Deterministic, numpy only.
Run: python3 scripts/make_sfx.py [name-filter]   → public/sfx/*.wav"""
import sys
from sfxlib import *

LIB = {}
def sfx(fn): LIB[fn.__name__] = fn; return fn

# ───────────────────────── TRANSITIONS ─────────────────────────
def _whoosh(d, lo, hi, q=1.4, verb=0.25):
    ph = np.linspace(0, 1, int(SR * d)); sw = lo + (hi - lo) * np.sin(np.pi * ph) ** 2
    return reverb(bandpass(N(d), sw, q) * np.sin(np.pi * ph) ** 1.6, 0.9, verb)
@sfx
def whoosh(): return _whoosh(0.9, 300, 3500)
@sfx
def whoosh_short(): return _whoosh(0.35, 800, 6000, 1.2, 0.15)
@sfx
def whoosh_heavy():
    d = 1.2; x = _whoosh(d, 120, 900, 1.0); ph = np.linspace(0, 1, int(SR * d))
    return x + cat(0.8 * sine(40 + 30 * ph, d) * np.sin(np.pi * ph) ** 2, np.zeros(len(x) - int(SR * d)))
@sfx
def swish_ui(): return _whoosh(0.18, 2500, 9000, 1.0, 0.1)
@sfx
def whip():
    x = _whoosh(0.22, 600, 8000, 1.0, 0.1); return x + at(len(x) / SR, (0.11, N(0.01) * dec(480, 300)))
@sfx
def reverse_cymbal():
    d = 2.0; x = highpass(N(d), 4000) * dec(int(SR * d), 2.2) + 0.3 * bell(6100, d, ((1, 1), (1.41, .7), (2.3, .5)), 2)
    return rev(reverb(x, 1.5, 0.3))
@sfx
def glitch():
    return at(0.5, *[(i * 0.13, bitcrush(N(0.04) * 0.8 + square(rng.uniform(200, 1200), 0.04) * 0.4, 4, 24)) for i in range(3)])
@sfx
def zoom_in():
    d = 0.5; ph = np.linspace(0, 1, int(SR * d)); return (sine(200 + 1400 * ph ** 2, d) * 0.5 + bandpass(N(d), 500 + 6000 * ph, 1.5)) * ph ** 1.5
@sfx
def zoom_out(): return rev(LIB['zoom_in']())
@sfx
def suck_back(): return rev(reverb(LIB['impact'](), 0.6, 0.2))[-int(SR * 1.2):]

# ───────────────────────── UI / GRAPHICS ─────────────────────────
@sfx
def tick(): t = T(0.08); return np.sin(2 * np.pi * 2400 * t) * np.exp(-90 * t) + 0.4 * N(0.08) * np.exp(-400 * t)
@sfx
def tick_soft(): t = T(0.07); return lowpass(np.sin(2 * np.pi * 1600 * t) * np.exp(-110 * t) + 0.2 * N(0.07) * np.exp(-500 * t), 4000)
@sfx
def word():
    t = T(0.35); x = np.sin(2 * np.pi * 180 * t * (1 - 0.3 * t)) * np.exp(-22 * t) + 0.15 * bandpass(N(0.35), 5000, 1) * np.exp(-30 * t)
    return reverb(x, 1.2, 0.35)
@sfx
def pop_small(): d = 0.07; return sine(np.linspace(520, 900, int(SR * d)), d) * dec(int(SR * d), 50)
@sfx
def pop_big():
    d = 0.14; return reverb(sine(np.linspace(300, 700, int(SR * d)), d) * dec(int(SR * d), 25) + 0.3 * lowpass(N(d), 3000) * dec(int(SR * d), 60), 0.5, 0.2)
@sfx
def chime(): return reverb(bell(1318.5, 1.6) + 0.6 * cat(np.zeros(int(.06 * SR)), bell(1975.5, 1.54)), 2.0, 0.35, 5000)
@sfx
def chime_low(): return reverb(bell(659.3, 2.0, decay=3.5) + 0.5 * cat(np.zeros(int(.07 * SR)), bell(987.8, 1.93, decay=3.5)), 2.2, 0.35, 3500)
@sfx
def sparkle():
    return reverb(sum(cat(np.zeros(int(i * .045 * SR)), bell(f, 2.2 - i * .045, decay=3.5)) * (0.9 ** i)
                      for i, f in enumerate([1046.5, 1318.5, 1568, 2093, 2637])), 2.8, 0.45, 6000)
@sfx
def shimmer_loop():
    src = sum(bell(f, 0.6, decay=4) for f in [2093, 2637, 3136, 4186]); return loop_xfade(reverb(granular(src, 7, 60, 0.12, 0.02), 1.5, 0.5, 8000)[:int(SR * 7)])
@sfx
def counter_roll():
    times = np.cumsum(0.11 * 0.88 ** np.arange(18)); return at(times[-1] + 0.2, *[(s, LIB['tick']() * 0.7) for s in times])
@sfx
def bar_fill():
    d = 1.2; ph = np.linspace(0, 1, int(SR * d)); return lowpass(saw(220 * 2 ** (ph * 1.5), d), 600 + 3000 * ph) * np.minimum(1, ph * 8) * (1 - ph ** 8)
@sfx
def type_key():
    return at(1.0, *[(i * 0.18, (bandpass(N(0.03), rng.uniform(2500, 4000), 3) * dec(1440, 160) + 0.5 * sine(rng.uniform(140, 220), 0.03) * dec(1440, 120))) for i in range(5)])
@sfx
def stamp():
    d = 0.6; return saturate(0.9 * sine(np.linspace(110, 45, int(SR * d)), d) * dec(int(SR * d), 12) + lowpass(N(d), 2500) * dec(int(SR * d), 35), 2)
@sfx
def success(): return reverb(bell(880, 1.2, decay=4) + cat(np.zeros(int(0.09 * SR)), bell(1108.7, 1.11, decay=4)), 1.5, 0.3, 6000)
@sfx
def fail_buzz():
    d = 0.45; return lowpass(square(110, d) + square(116.5, d), 1800) * adsr(int(SR * d), 0.005, 0.05, 0.8, 0.12) * 0.5
@sfx
def error_blip(): return cat(square(330, 0.07) * dec(3360, 20), np.zeros(1500), square(247, 0.11) * dec(5280, 15)) * 0.4
@sfx
def notification(): return reverb(cat(fm(1567, 3134, 1.5, 0.12) * dec(5760, 25), fm(2093, 4186, 1.5, 0.5) * dec(24000, 8)), 1.0, 0.3, 7000)
@sfx
def slide_in(): x = _whoosh(0.4, 1500, 7000, 1.0, 0.1); return x + at(len(x) / SR, (0.36, LIB['tick_soft']() * 0.8))
@sfx
def lock_click(): return at(0.2, (0, bandpass(N(0.02), 3500, 4) * dec(960, 250)), (0.06, bandpass(N(0.03), 1800, 4) * dec(1440, 150)))

# ───────────────────────── IMPACTS & TENSION ─────────────────────────
@sfx
def impact():
    d = 2.2; t = T(d); sub = sine(38 + 90 * np.exp(-14 * t), d) * np.exp(-2.2 * t)
    return reverb(saturate(sub * 1.2 + lowpass(N(d), 900) * np.exp(-18 * t) * 3 + 0.3 * N(d) * np.exp(-60 * t), 1.5), 2.5, 0.3, 2500)
@sfx
def impact_light():
    d = 0.8; t = T(d); return reverb(sine(70 + 120 * np.exp(-25 * t), d) * np.exp(-6 * t) + lowpass(N(d), 1500) * np.exp(-40 * t), 1.0, 0.25)
@sfx
def boom_sub(): d = 3.5; t = T(d); return saturate(sine(30 + 40 * np.exp(-5 * t), d) * np.exp(-1.2 * t), 1.3)
@sfx
def hit_metal():
    return reverb(bell(310, 2.5, ((1, 1), (2.32, .8), (4.25, .6), (6.63, .4), (9.38, .3)), 3) + 0.5 * highpass(N(2.5), 3000) * dec(int(SR * 2.5), 30), 2.0, 0.3, 6000)
@sfx
def riser():
    d = 2.0; t = T(d); ph = t / d
    x = 0.4 * lowpass(saw(120 * 2 ** (ph * 3.5), d), 400 + 5000 * ph ** 2) + bandpass(N(d), 400 + 7000 * ph ** 2, 1.2)
    return reverb(x * ph ** 2.2, 1.0, 0.25)
@sfx
def riser_short(): x = LIB['riser'](); n = int(SR * 2.0); return x[::2][:n // 2 + int(SR * 0.5)]
@sfx
def riser_shepard():
    d = 6.0; t = T(d); x = np.zeros(len(t))
    for k in range(6):
        oct_pos = (k + t / d * 1.5) % 6; f = 55 * 2 ** oct_pos; amp = np.exp(-((oct_pos - 3) ** 2) / 2)
        x += sine(f, d) * amp
    return reverb(x * np.minimum(1, t / 0.5), 2.0, 0.3)
@sfx
def drone_low():
    d = 12; t = T(d); x = saw(55, d) + saw(55.4, d) + 0.5 * saw(82.4, d)
    return loop_xfade(lowpass(x, 300 + 150 * np.sin(2 * np.pi * t / 6)) * 0.4)
@sfx
def heartbeat():
    k = lambda: sine(45 + 50 * np.exp(-30 * T(0.35)), 0.35) * dec(int(SR * .35), 10)
    return lowpass(at(1.0, (0, k()), (0.26, k() * 0.7)), 400)
@sfx
def clock_tick():
    times = np.cumsum(0.5 * 0.92 ** np.arange(24)); return at(times[-1] + 0.3, *[(s, bandpass(N(0.02), 3000 if i % 2 else 2300, 6) * dec(960, 200)) for i, s in enumerate(times)])
@sfx
def stinger_good():
    d = 1.6; ch = [261.6, 329.6, 392, 523.3]
    return reverb(sum(lowpass(saw(f, d) + saw(f * 1.004, d), 3000) for f in ch) * adsr(int(SR * d), 0.01, 0.2, 0.5, 1.0) * 0.3 + LIB['impact_light']()[:int(SR * d)] * 0.6, 2.0, 0.35)
@sfx
def stinger_bad():
    d = 2.0; ch = [130.8, 155.6, 185, 196]
    return reverb(sum(lowpass(saw(f, d), 1200) for f in ch) * adsr(int(SR * d), 0.01, 0.3, 0.5, 1.2) * 0.3 + LIB['impact']()[:int(SR * d)] * 0.6, 2.0, 0.35)

# ───────────────────────── FOLEY ─────────────────────────
def _step(fc, tone):
    d = 0.18; return lowpass(N(d), fc) * dec(int(SR * d), 45) + 0.6 * sine(tone, d) * dec(int(SR * d), 35)
@sfx
def step_wood(): return at(2.4, *[(i * 0.5, _step(rng.uniform(1200, 1800), rng.uniform(90, 120)) * rng.uniform(.8, 1)) for i in range(4)])
@sfx
def step_tile(): return at(2.4, *[(i * 0.5, highpass(_step(5000, rng.uniform(180, 240)), 200) * rng.uniform(.8, 1)) for i in range(4)])
@sfx
def cloth_rustle():
    return at(1.6, *[(i * 0.5, bandpass(N(0.3), rng.uniform(1500, 3500), 0.8) * np.sin(np.linspace(0, np.pi, int(SR * .3))) ** 2 * 0.6) for i in range(3)])
@sfx
def chair_creak():
    d = 0.7; t = T(d); src = (rng.random(len(t)) < 0.004 + 0.003 * np.sin(2 * np.pi * 3 * t)).astype(float)
    return bandpass(src, 700 + 200 * np.sin(2 * np.pi * 1.3 * t), 12) * np.sin(np.pi * t / d)
@sfx
def paper_shuffle(): return at(1.2, *[(rng.uniform(0, 0.9), highpass(N(0.12), 1500) * dec(5760, 25) * rng.uniform(.3, 1)) for _ in range(12)])
@sfx
def paper_flutter():
    d = 1.4; t = T(d); return highpass(N(d), 1200) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (14 + 6 * np.sin(t * 3)) * t))) * np.sin(np.pi * t / d) * 0.5
@sfx
def coin_flip():
    d = 1.0; t = T(d); ping = bell(4200, 0.6, ((1, 1), (2.4, .5), (3.9, .3)), 6)
    whirr = bandpass(N(d), 3000, 3) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t)) * np.exp(-2 * t) * 0.4
    return reverb(at(d, (0, ping), (0, whirr)), 0.8, 0.2, 8000)
@sfx
def coin_land():
    times = np.cumsum(0.18 * 0.72 ** np.arange(9)); return reverb(at(times[-1] + 0.6, *[(s, bell(3900 + 200 * i, 0.4, ((1, 1), (2.4, .5)), 10) * 0.85 ** i) for i, s in enumerate(times)]), 0.8, 0.2, 8000)
@sfx
def coin():
    x = at(5.5, *[(k * 0.21 + rng.uniform(0, .05), bell(rng.uniform(3800, 5200), 0.25, ((1, 1), (2.4, .4)), 14) * 0.5) for k in range(26)])
    return reverb(x, 1.0, 0.3, 7000)
@sfx
def chips_stack(): return at(0.8, *[(i * 0.06 + rng.uniform(0, .015), bandpass(N(0.03), rng.uniform(3000, 4500), 8) * dec(1440, 120)) for i in range(8)])
@sfx
def dice_roll():
    hits = np.sort(rng.uniform(0, 0.9, 14)); return at(1.2, *[(s, (bandpass(N(0.04), rng.uniform(1500, 2500), 5) * dec(1920, 90)) * (1 - s)) for s in hits])
@sfx
def card_flick(): return cat(highpass(N(0.05), 2500) * dec(2400, 60), np.zeros(800), bandpass(N(0.03), 2000, 3) * dec(1440, 100))
@sfx
def locker_slam(): m = LIB['hit_metal'](); return at(len(m) / SR, (0, m * 0.6), (0, saturate(lowpass(N(0.3), 600) * dec(int(SR * .3), 20), 3)))
@sfx
def door_creak():
    d = 1.6; t = T(d); src = (rng.random(len(t)) < 0.003 + 0.002 * t).astype(float)
    return bandpass(src, 450 + 300 * t / d + 40 * np.sin(2 * np.pi * 2 * t), 15) * np.sin(np.pi * t / d)
@sfx
def pen_write(): return at(1.5, *[(i * 0.11, bandpass(N(0.08), rng.uniform(4000, 6000), 2) * np.hanning(int(SR * .08)) * 0.5) for i in range(12)])
@sfx
def marker_squeak():
    d = 0.5; t = T(d); return sine(1400 + 300 * np.sin(2 * np.pi * 9 * t), d) * np.sin(np.pi * t / d) * 0.3 + bandpass(N(d), 3000, 2) * 0.1
@sfx
def alarm_beep(): return at(2.0, *[(i * 0.25 + (0.5 if i >= 4 else 0), square(2700, 0.12) * adsr(5760, .002, .01, .9, .01) * 0.3) for i in range(8)])
@sfx
def vending_drop(): return cat(saturate(sine(np.linspace(90, 50, 7200), 0.15) * dec(7200, 20) + lowpass(N(0.15), 1200) * dec(7200, 25), 2), LIB['dice_roll']()[:int(SR * .6)] * 0.4)
@sfx
def ball_bounce():
    times = np.cumsum(0.42 * 0.75 ** np.arange(8)); k = lambda: sine(np.linspace(140, 70, 9600), 0.2) * dec(9600, 25)
    return at(times[-1] + 0.3, *[(s, k() * 0.8 ** i) for i, s in enumerate(times)])

# ───────────────────────── CROWD & VOCAL ─────────────────────────
def _voices(d, n=24, bright=1.0):
    t = T(d); x = np.zeros(len(t))
    for _ in range(n):
        v = formant(saw(rng.uniform(110, 260) * bright, d) * 0.3 + N(d) * 0.05, rng.choice(list('aeiou')))
        x += v * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(3, 6) * t + rng.uniform(0, 6))) ** 2 * rng.uniform(.3, 1)
    return x
@sfx
def crowd_murmur(): return loop_xfade(reverb(lowpass(_voices(10, 18), 2500), 1.8, 0.45, 2000)[:int(SR * 10)])
@sfx
def crowd_cheer():
    d = 4; t = T(d); sw = np.minimum(1, t / 0.4) * np.exp(-0.5 * np.maximum(0, t - 1.5))
    whistle = sum(sine(rng.uniform(1800, 2600) + 200 * np.sin(2 * np.pi * 3 * t), d) * np.exp(-((t - rng.uniform(.5, 2)) ** 2) / .1) * 0.3 for _ in range(3))
    return reverb((highpass(_voices(d, 30, 1.6), 300) + bandpass(N(d), 2500, 0.7) * 0.8 + whistle) * sw, 2.0, 0.4)
@sfx
def crowd_gasp():
    d = 1.2; t = T(d); return reverb(formant(N(d), 'a') * np.sin(np.pi * np.minimum(1, t / 0.5)) ** 2 * np.exp(-2 * np.maximum(0, t - .5)), 1.5, 0.4)
@sfx
def crowd_aww():
    d = 1.6; t = T(d); return reverb(lowpass(_voices(d, 20, 1.2) * np.sin(np.pi * t / d), 2500) * (1 - 0.3 * t / d), 1.5, 0.4)
@sfx
def kid_laugh():
    d = 1.4; t = T(d); pulses = (np.sin(2 * np.pi * 6.5 * t) > 0.3).astype(float); f = 330 + 40 * np.sin(2 * np.pi * 6.5 * t)
    return reverb(formant(saw(f, d), 'a') * lowpass(pulses, 40) * np.exp(-1.2 * t), 0.8, 0.25)
@sfx
def mumble_vo():
    d = 2.0; t = T(d); syl = (np.sin(2 * np.pi * 5 * t) > 0).astype(float); f = 180 * 2 ** (rng.choice([0, 2, 4, 7], len(t) // 4800 + 1).repeat(4800)[:len(t)] / 12)
    return sum(formant(saw(f, d), v) for v in 'ao') * lowpass(syl, 30) * 0.5

# ───────────────────────── AMBIENCE BEDS (seamless loops) ─────────────────────────
@sfx
def room(): return lowpass(N(11), 500) + 0.2 * lowpass(N(11), 3000)
@sfx
def amb_hallway():
    d = 12; t = T(d); hum = 0.3 * (sine(60, d) + 0.5 * sine(120, d)) + lowpass(N(d), 400)
    return loop_xfade(hum + 0.25 * lowpass(_voices(d, 8), 1200) * 0.4)
@sfx
def amb_classroom(): d = 12; return loop_xfade(lowpass(N(d), 700) * 0.8 + 0.3 * bandpass(N(d), 150, 3) + 0.2 * lowpass(_voices(d, 6), 1500))
@sfx
def amb_casino():
    d = 12; base = LIB['crowd_murmur']()[:int(SR * d)] * 0.7
    jingles = at(d, *[(rng.uniform(0, d - 1), sum(bell(f, 0.3, decay=8) * 0.2 for f in rng.choice([1047, 1319, 1568, 2093], 3))) for _ in range(10)])
    return loop_xfade(at(d, (0, base), (0, jingles)))
@sfx
def amb_stadium(): d = 12; return loop_xfade(reverb(highpass(_voices(d, 40, 1.3), 200) * 0.6 + lowpass(N(d), 900), 3.0, 0.6, 2000)[:int(SR * d)])
@sfx
def amb_bedroom_night():
    d = 12; t = T(d); crick = sine(4600, d) * (np.sin(2 * np.pi * 30 * t) > 0.6) * (np.sin(2 * np.pi * 0.7 * t) > 0.2) * 0.05
    clock = at(d, *[(i * 1.0, bandpass(N(0.02), 2800, 6) * dec(960, 200) * 0.3) for i in range(12)])
    return loop_xfade(lowpass(N(d), 300) * 0.5 + crick + clock)
@sfx
def amb_hospital():
    d = 12; beeps = at(d, *[(i * 1.0, sine(1000, 0.12) * adsr(5760, .003, .02, .8, .03) * 0.25) for i in range(12)])
    return loop_xfade(lowpass(N(d), 250) + 0.2 * bandpass(N(d), 2000, 2) + beeps)
@sfx
def amb_void(): d = 12; t = T(d); return loop_xfade(0.5 * sine(41.2, d) * (0.7 + 0.3 * np.sin(2 * np.pi * t / 6)) + 0.3 * lowpass(N(d), 800))

# ───────────────────────── MUSIC (stems) ─────────────────────────
BPM = 72; BEAT = 60 / BPM; CHORDS = [(57, 60, 64), (53, 57, 60), (48, 55, 64), (55, 59, 62)]  # Am F C G
MOTIF = [69, 72, 76, 74, 72]  # "the power" motif: A C E D C
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def _chords(total, voice):
    x = np.zeros(int(total * SR)); cl = BEAT * 4 * 0.75
    for ci in range(int(total / cl) + 1):
        s = int(ci * cl * SR); n = min(int((cl + 1.0) * SR), len(x) - s)
        if n <= 0: break
        x[s:s + n] += voice(CHORDS[ci % 4], n, cl)
    return x
@sfx
def music_pad():
    def v(ch, n, cl):
        t = np.arange(n) / SR; e = np.minimum(1, t / 0.9) * np.exp(-0.5 * np.maximum(0, t - cl)); y = np.zeros(n)
        for m in ch + (ch[0] - 12,):
            for det in (-0.12, 0, 0.12): y += (2 * ((mtof(m) * 2 ** (det / 12) * t + rng.uniform()) % 1) - 1) * e * 0.08
        return y
    x = _chords(11, v); return reverb(lowpass(x, 1400 + 600 * np.sin(2 * np.pi * np.arange(len(x)) / SR / 8)), 3.5, 0.45, 2200)[:int(11 * SR)]
@sfx
def music_pluck():
    x = np.zeros(int(11 * SR)); step = BEAT / 2
    for i in range(int(11 / step)):
        ch = CHORDS[int(i * step / (BEAT * 3)) % 4]; m = ch[i % 3] + 12 * (i % 4 == 3)
        p = karplus(mtof(m), 0.6) * 0.3; s = int(i * step * SR); x[s:s + len(p)] += p[:len(x) - s]
    return delay(x, BEAT * 0.75, 0.35, 0.3)[:int(11 * SR)]
@sfx
def music_bass():
    x = np.zeros(int(11 * SR)); cl = BEAT * 3
    for ci in range(int(11 / cl) + 1):
        s = int(ci * cl * SR); n = min(int(cl * SR), len(x) - s)
        if n <= 0: break
        t = np.arange(n) / SR; x[s:s + n] += lowpass(saw(mtof(CHORDS[ci % 4][0] - 24), n / SR), 300) * np.minimum(1, t / .02) * np.exp(-0.6 * t)
    return x
@sfx
def music_drums():
    x = np.zeros(int(11 * SR)); kick = sine(45 + 60 * np.exp(-25 * T(.4)), .4) * dec(int(SR * .4), 9)
    hat = highpass(N(0.05), 7000) * dec(2400, 80) * 0.25
    for b in np.arange(0, 11, BEAT):
        s = int(b * SR); x[s:s + len(kick)] += kick[:len(x) - s] * 0.6
        h = int((b + BEAT / 2) * SR); x[h:h + len(hat)] += hat[:max(0, len(x) - h)]
    return x
@sfx
def music_motif():
    x = at(11, *[(1.0 + i * BEAT * 0.75, bell(mtof(m), 2.0, decay=2.5) * 0.4) for i, m in enumerate(MOTIF)],
           *[(6.5 + i * BEAT * 0.75, bell(mtof(m + 12), 2.0, decay=2.5) * 0.25) for i, m in enumerate(MOTIF)])
    return reverb(x, 3.0, 0.5, 5000)[:int(11 * SR)]
@sfx
def music():
    """Mixed bed for simple projects (pad + soft heartbeat kick)."""
    pad = LIB['music_pad'](); pulse = np.zeros(len(pad)); k = sine(45 + 60 * np.exp(-25 * T(.4)), .4) * dec(int(SR * .4), 9)
    for b in np.arange(0, 11, BEAT * 2): s = int(b * SR); pulse[s:s + len(k)] += k[:len(pulse) - s] * 0.35
    return pad + reverb(pulse, 1.0, 0.2)[:len(pad)]

PEAK = {'room': 0.25, 'coin': 0.5, 'tick': 0.6, 'word': 0.7, 'music': 0.8}
if __name__ == '__main__':
    flt = sys.argv[1] if len(sys.argv) > 1 else ''
    names = [n for n in LIB if flt in n]
    print(f'generating {len(names)} sounds')
    for n in names: save(n, LIB[n](), PEAK.get(n, 0.89))
