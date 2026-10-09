#!/usr/bin/env python3
"""Soundtrack for a feature video: a chill, jazzy lo-fi bed plus light interface sounds on the cues.

    python soundtrack.py cues.json out.wav [--seed 7] [--bpm 82] [--music track.mp3]

Everything is synthesised here, so there is nothing to license: an electric piano comping a ii-V-I in F,
a walking upright-style bass, a soft kick, brushed swing hats, a rim on 2 and 4, vinyl crackle and tape
warmth. The cues from cues.mjs add a soft click per cursor click, a short swoosh when a title card slides
away, a light tick run while text is typed, and a low chime under every card. Needs numpy and scipy.

--music puts a recorded track under the interface sounds instead of the synthesised bed (looped with a crossfade
when it is shorter than the video, faded in and out). Use only music whose licence allows commercial use: CC0 or
a licence the company holds. Note the source and licence next to the video (music.txt).
"""
import json, sys, argparse
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
ap = argparse.ArgumentParser()
ap.add_argument("cues"); ap.add_argument("out")
ap.add_argument("--seed", type=int, default=7); ap.add_argument("--bpm", type=float, default=82)
ap.add_argument("--music"); ap.add_argument("--music-gain", type=float, default=0.5)
ap.add_argument("--sfx", help="folder with click.wav, move.wav and type.wav: recorded sounds instead of synthesised ones")
a = ap.parse_args()
rng = np.random.default_rng(a.seed)
spec = json.load(open(a.cues))
DUR = spec["duration"] + 0.5
N = int(DUR * SR)
beat = 60 / a.bpm
bar = 4 * beat
swing = 0.62  # the off-beat eighth sits at 62% of the beat

def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def place(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    j = min(len(buf), i + len(sig)); buf[max(0, i):j] += g * sig[max(0, -i): j - i]

# ---- instruments -------------------------------------------------------------------------------------
def rhodes(m, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    env = np.exp(-t * 1.6) * (1 - np.exp(-t * 400))
    mod = np.sin(2 * np.pi * f * 14 * t) * 1.2 * np.exp(-t * 9)  # bell-like tine on the attack
    tone = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.2 * t)
    rel = np.clip((dur - t) / 0.12, 0, 1)
    return vel * tone * env * trem * rel

def bass(m, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    env = np.exp(-t * 3.2) * (1 - np.exp(-t * 600)) * np.clip((dur - t) / 0.05, 0, 1)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)
    return vel * lp(x * env, 900)

def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 48 + 70 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def brush(length=0.12):
    n = int(length * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 3000, 9000) * np.exp(-t * 28) * (1 - np.exp(-t * 300))

def rim():
    t = np.arange(int(0.08 * SR)) / SR
    return (bp(rng.standard_normal(len(t)), 1500, 5000) * 0.6 + np.sin(2 * np.pi * 1700 * t)) * np.exp(-t * 60)

# ---- the bed -------------------------------------------------------------------------------------------
# ii-V-I-VI in F, voiced in the middle register (MIDI). Gm9, C13, Fmaj9, D7(b13).
CHORDS = [[55, 58, 62, 65, 69], [52, 57, 58, 62, 64], [53, 57, 60, 64, 67], [54, 57, 60, 62, 66]]
ROOTS = [43, 48, 41, 38]
WALK = [[43, 46, 50, 49], [48, 47, 45, 44], [41, 45, 48, 47], [38, 42, 45, 44]]
keys = np.zeros(N); low = np.zeros(N); drums = np.zeros(N)
nbars = int(DUR / bar) + 1
for b_ in range(nbars):
    t0 = b_ * bar; ci = b_ % 4
    # comp: beat 1, and the swung "and" of 2 (a push), sometimes a ghost on 4
    for when, dur, vel in [(0, 1.6 * beat, 0.9), (beat + swing * beat, 1.3 * beat, 0.65)] + ([(3 * beat, 0.5 * beat, 0.35)] if b_ % 2 else []):
        for k, m in enumerate(CHORDS[ci]):
            place(keys, rhodes(m, dur, vel * (0.8 + 0.2 * rng.random())), t0 + when + k * 0.012 + rng.normal(0, 0.004))
    for q, m in enumerate(WALK[ci]):
        place(low, bass(m, beat * 0.95, 0.9 if q == 0 else 0.7), t0 + q * beat + rng.normal(0, 0.003))
    # drums: kick on 1 and the "and" of 3, rim on 2 and 4, brushes on swung eighths
    place(drums, kick(), t0, 0.8); place(drums, kick(), t0 + 2 * beat + swing * beat, 0.45)
    place(drums, rim(), t0 + beat, 0.18); place(drums, rim(), t0 + 3 * beat, 0.22)
    for q in range(4):
        place(drums, brush(), t0 + q * beat, 0.16 + 0.04 * rng.random())
        place(drums, brush(0.08), t0 + q * beat + swing * beat, 0.09 + 0.03 * rng.random())

# vinyl: hiss and sparse crackle
vinyl = lp(hp(rng.standard_normal(N), 1200), 7000) * 0.006
crack = np.zeros(N); idx = rng.choice(N, size=int(DUR * 9), replace=False); crack[idx] = rng.uniform(-1, 1, len(idx)) * 0.12
vinyl += hp(crack, 2000)

bed = 0.32 * lp(keys, 4200) + 0.55 * low + 0.5 * lp(drums, 9000) + vinyl
bed = np.tanh(bed * 1.3) / 1.3  # tape warmth
# Intro: drums and bass come in after the first bar; fade in and out
t = np.arange(N) / SR
bed *= np.clip(t / 1.5, 0, 1) * np.clip((DUR - 0.3 - t) / 3.0, 0, 1)

# ---- interface sounds -------------------------------------------------------------------------------------
def click():
    n = int(0.045 * SR); t = np.arange(n) / SR
    tick = np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 180)
    body = np.sin(2 * np.pi * 620 * t) * np.exp(-t * 70) * 0.5
    noise = hp(rng.standard_normal(n), 3000) * np.exp(-t * 400) * 0.4
    return tick * 0.6 + body + noise

def whoosh(length=0.55):
    n = int(length * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); out = np.zeros(n); seg = 512
    for i in range(0, n, seg):  # a band of noise sweeping down
        f = 4500 - 3500 * (i / n)
        out[i:i + seg] = bp(x[i:i + seg], max(200, f * 0.6), min(12000, f * 1.4), 1)
    env = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 1.6
    return out * env

def typing(length):
    out = np.zeros(int(length * SR) + SR // 10); t_ = 0.0
    while t_ < length:
        place(out, click() * 0.5, t_, 0.5 + 0.3 * rng.random()); t_ += 0.06 + 0.05 * rng.random()
    return lp(out, 6000)

def chime():
    n = int(1.6 * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * 2.2) * g for m, g in [(77, 0.5), (81, 0.35), (84, 0.25)])

fx = np.zeros(N)
if a.sfx:
    # Recorded interface sounds (sfx/SOURCES.txt), kept low under the music: one of several real trackpad clicks per
    # click, so repeats never sound identical, and a stretch of real typing while text is typed. No transition
    # sounds: the cuts carry on the music.
    import glob
    from scipy.signal import resample_poly
    def load(path):
        sr, x = wavfile.read(path); x = x.astype(float)
        x = x.mean(1) if x.ndim > 1 else x
        if sr != SR: x = resample_poly(x, SR, sr)
        return x / max(1e-9, np.max(np.abs(x)))
    CLICKS = [load(p) for p in sorted(glob.glob(f"{a.sfx}/click-*.wav"))]
    TYPE = load(f"{a.sfx}/type.wav")
    for c in spec["cues"]:
        if c["kind"] == "click" and CLICKS:
            place(fx, CLICKS[int(rng.integers(len(CLICKS)))], c["t"] - 0.004, 0.24 * (0.85 + 0.3 * rng.random()))
        elif c["kind"] == "type" and c.get("end"):
            n = int((c["end"] - c["t"]) * SR); o = int(rng.integers(0, max(1, len(TYPE) - n)))
            seg = TYPE[o:o + n].copy(); r = min(len(seg) // 4, int(0.06 * SR)); env = np.ones(len(seg))
            if r: env[:r] = np.linspace(0, 1, r); env[-r:] = np.linspace(1, 0, r)
            place(fx, seg * env, c["t"], 0.14)
    spec["cues"] = []; spec["marks"] = []
for c in spec["cues"]:
    if c["kind"] == "click": place(fx, click(), c["t"], 0.3)
    elif c["kind"] == "whoosh": place(fx, whoosh(), c["t"] - 0.1, 0.22)
    elif c["kind"] == "type" and c.get("end"): place(fx, typing(c["end"] - c["t"]), c["t"], 0.28)
for m in spec.get("marks", []):
    if m["kind"] == "card": place(fx, chime(), m["t"] + 0.15, 0.06)

if a.music:
    import subprocess
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.music, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    m = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)
    m /= max(1e-9, np.sqrt(np.mean(m ** 2))) / 0.12  # the same loudness whatever the track
    xf = 2 * SR
    while len(m) < N:  # loop with a two-second crossfade
        r = np.linspace(0, 1, xf)[:, None]
        m = np.concatenate([m[:-xf], m[-xf:] * (1 - r) + m[:xf] * r, m[xf:]])
    m = m[:N] * (np.clip(t / 1.0, 0, 1) * np.clip((DUR - 0.3 - t) / 3.0, 0, 1))[:, None]
    stereo = a.music_gain * m + fx[:, None]
else:
    mix = bed * 0.75 + fx
    stereo = np.stack([mix, np.roll(mix, 9)], 1)  # a touch of width
stereo /= max(1e-9, np.max(np.abs(stereo))) / 0.89
wavfile.write(a.out, SR, (stereo * 32767).astype(np.int16))
print(f"wrote {a.out}: {DUR:.1f}s, {len(spec['cues'])} cues")
