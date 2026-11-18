"""20 s sound sketch of the Promise Threads hook (P001–P003b), SFX + music only, no VO yet.
   Timeline mirrors WHAT_IF_PROMISE_THREADS_SHOTS.md shots 1–6. Output: out/promise_sound_sketch.wav"""
import wave, numpy as np, os
SR = 48000
def load(n):
    w = wave.open(f'public/sfx/{n}.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels()) / 32768
    return x if x.shape[1] == 2 else np.repeat(x, 2, 1)
def pan(x, p):  # p −1..1, constant power
    a = (p + 1) * np.pi / 4; return x * np.array([np.cos(a), np.sin(a)]) * 1.41
out = np.zeros((SR * 20, 2))
def put(n, t, vol=1.0, p=0.0, loop_to=None):
    x = load(n)
    if loop_to: x = np.tile(x, (int(np.ceil((loop_to - t) * SR / len(x))), 1))[: int((loop_to - t) * SR)]
    x = pan(x, p) * vol; s = int(t * SR); e = min(len(out), s + len(x)); out[s:e] += x[: e - s]
put('promise_celesta', 0.0, 0.55)                       # celesta motif bed, wonder
put('thread_spool', 0.8, 0.55, -0.3)                    # shot 1: the thread is born from the wrist (frame left)
put('thread_hum', 1.4, 0.18, 0.0, loop_to=8.0)          # held thread hum under shots 1–3
put('thread_pluck', 2.6, 0.4, 0.2)                      # shot 2: Kai looks down, the thread tightens
put('word', 4.2, 0.35); put('word', 4.5, 0.32); put('word', 4.8, 0.3)   # shot 3: title words
put('thread_burst', 7.6, 0.8, -0.1)                     # shot 4: "...like a firework" (hit lands at 8.1 s, after the word)
put('thread_fray', 11.2, 0.6, 0.25)                     # shot 5: "Break it…"
put('thread_drag', 12.2, 0.22, 0.25, loop_to=19.0)      # shot 6: the grey thread on the floor
put('pop_small', 14.0, 0.3)                             # tag "ONLY YOU CAN SEE THEM"
fade = np.ones(len(out)); fade[-SR:] = np.linspace(1, 0, SR); out *= fade[:, None]
out /= max(1.0, np.abs(out).max() / 0.89)
os.makedirs('out', exist_ok=True)
w = wave.open('out/promise_sound_sketch.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('ok', np.abs(out).max())
