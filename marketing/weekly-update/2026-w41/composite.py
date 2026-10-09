#!/usr/bin/env python3
"""Composite frames from render-plane.mjs and encode them: composite.py W H FPS out.mp4 Q PD

Reads frames on stdin (4-byte length, JSON header, then the images). A "flat" frame is one image at Q times the
output size. A "plane" frame is the background layer (paper and window frame), the top layer (captions, titles,
cursor; with alpha) and the app drawn flat at PD pixels per CSS pixel. The app image is scaled and placed where
the header's layout says, clipped to the window's rounded inside, then the top layer goes over it. Everything is
composed at Q times the output size and scaled down with area averaging. Needs numpy and opencv (cv2).
"""
import sys, json, struct, subprocess
import numpy as np, cv2

W, H, FPS, OUT, Q, PD = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4], float(sys.argv[5]), float(sys.argv[6])
RADIUS = 24  # .stage border-radius (CSS px), border included
ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", FPS, "-i", "-",
                       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "12", "-preset", "slow", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
inp = sys.stdin.buffer

def read(n):
    b = inp.read(n)
    if len(b) < n: raise EOFError
    return b

def dec(b, flag=cv2.IMREAD_COLOR):
    return cv2.imdecode(np.frombuffer(b, np.uint8), flag)

def rounded_mask(shape, x, y, w, h, r):
    """Anti-aliased mask of a rounded rectangle (pixels), from its signed distance."""
    m = np.zeros(shape, np.float32)
    x0, y0, x1, y1 = max(0, int(x) - 2), max(0, int(y) - 2), min(shape[1], int(x + w) + 3), min(shape[0], int(y + h) + 3)
    if x1 <= x0 or y1 <= y0: return m
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32) + 0.5
    cx, cy, hx, hy = x + w / 2, y + h / 2, w / 2 - r, h / 2 - r
    dx, dy = np.maximum(np.abs(xx - cx) - hx, 0), np.maximum(np.abs(yy - cy) - hy, 0)
    inside = np.minimum(np.maximum(np.abs(xx - cx) - hx, np.abs(yy - cy) - hy), 0)
    d = np.sqrt(dx * dx + dy * dy) + inside - r
    m[y0:y1, x0:x1] = np.clip(0.5 - d, 0, 1)
    return m

n = 0
while True:
    try: hl = struct.unpack(">I", read(4))[0]
    except EOFError: break
    meta = json.loads(read(hl)); bufs = [read(s) for s in meta["sizes"]]
    if meta["kind"] == "flat":
        img = dec(bufs[0])
    else:
        under = dec(bufs[0]).astype(np.float32)
        over = dec(bufs[1], cv2.IMREAD_UNCHANGED).astype(np.float32)
        app = dec(bufs[2])
        L, T, Wa, Ha = meta["lay"]["app"]; sL, sT, sW, sH = meta["lay"]["stage"]; s = meta["lay"]["s"]; bw = meta["lay"]["border"] * s
        k = Q * Wa / app.shape[1]
        if k < 1:  # scale down with area averaging first, then place with a near-1 scale
            app = cv2.resize(app, (max(1, round(app.shape[1] * k)), max(1, round(app.shape[0] * k))), interpolation=cv2.INTER_AREA)
        a4 = np.dstack([app, np.full(app.shape[:2], 255, np.uint8)])
        M = np.float32([[Q * Wa / app.shape[1], 0, Q * L], [0, Q * Ha / app.shape[0], Q * T]])
        hq, wq = under.shape[:2]
        content = cv2.warpAffine(a4, M, (wq, hq), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0)).astype(np.float32)
        clip = rounded_mask((hq, wq), Q * (sL + bw), Q * (sT + bw), Q * (sW - 2 * bw), Q * (sH - 2 * bw), Q * max(0, RADIUS * s - bw))
        m = (np.clip(content[:, :, 3], 0, 255) / 255.0 * clip * meta["lay"].get("fade", 1))[:, :, None]
        comp = under * (1 - m) + np.clip(content[:, :, :3], 0, 255) * m
        if over.ndim == 3 and over.shape[2] == 4:
            a = (over[:, :, 3:4] / 255.0)
            comp = comp * (1 - a) + over[:, :, :3] * a
        img = np.clip(comp, 0, 255).astype(np.uint8)
    if img.shape[1] != W or img.shape[0] != H:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    ff.stdin.write(img.tobytes()); n += 1
ff.stdin.close(); ff.wait()
print(f"composited {n} frames", file=sys.stderr)
