// Deterministic clip runtime: every frame is render(t). ?record exposes seek(t) for the recorder;
// otherwise the clip loops in the browser for preview.
const C = (() => {
  // Frame size from the format (?w=<px>&h=<px>, set by the toolkit scripts; default 4:5, 1080 x 1350).
  // Portrait and square: 1080 wide, stage 952 x (H - 450) at (64, 330).
  // Landscape (WIDE, e.g. 4:3 at 1440 x 1080): stage (W - 128) x (H - 402) at (64, 318), under the captions and
  // the "find it" row.
  const q = new URLSearchParams(location.search);
  const H = Number(q.get("h")) || 1350, W = Number(q.get("w")) || 1080, WIDE = W > H;
  document.documentElement.style.setProperty("--frame-h", H + "px");
  document.documentElement.style.setProperty("--frame-w", W + "px");
  if (WIDE) document.documentElement.classList.add("wide");
  // Motion layer (on unless ?motion=0): orange wipes between parts, kinetic lines on cards and captions, a drifting
  // glow behind cards, and a slow camera push during every hold so a paused frame never stands still.
  const MOTION = q.get("motion") !== "0";
  let RAW = 0, DRIFT = 1;
  const STAGE_X = 64, STAGE_Y = WIDE ? 318 : 330, STAGE_W = W - 128, STAGE_H = WIDE ? H - 402 : H - 450;
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const p = (t, a, b) => clamp((t - a) / (b - a));
  const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const out = (x) => 1 - Math.pow(1 - x, 3);
  const back = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
  const lerp = (a, b, x) => a + (b - a) * x;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Fade and lift in at a, optionally out at z.
  function show(el, t, a, z = Infinity, dy = 24, dur = 0.45) {
    const i = out(p(t, a, a + dur));
    const o = z === Infinity ? 1 : 1 - p(t, z, z + 0.3);
    el.style.opacity = Math.min(i, o);
    el.style.transform = `translateY(${(1 - i) * dy}px)`;
  }
  // Sound cues (timeline seconds): clicks, the title card leaving, typing. run() maps them to held time as
  // window.CUES for soundtrack.py; nothing here makes a sound.
  const SFX = (window.SFX = []), seen = new Set();
  const cue = (kind, t, end) => { const k = kind + t + (end || ""); if (!seen.has(k)) { seen.add(k); SFX.push({ kind, t, end }); } };
  function type(el, text, t, a, b) {
    cue("type", a, b);
    el.textContent = text.slice(0, Math.round(text.length * p(t, a, b)));
  }
  // Split an element's <br>-separated lines into masked spans that can rise into place.
  function lines(el) {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l) => `<span class="ln"><span>${l}</span></span>`).join("");
    return $$(".ln > span", el);
  }
  // Lines rise in one after another from a, and leave upwards from z.
  function rise(ls, t, a, z = Infinity, gap = 0.09) {
    ls.forEach((s, j) => {
      const i = out(p(t, a + j * gap, a + j * gap + 0.5)), o = io(p(t, z + j * 0.05, z + j * 0.05 + 0.35));
      s.style.transform = `translateY(${((1 - i) - o) * 110}%)`;
    });
  }
  // Captions: [[start, end, html], ...] onto .caption elements built here.
  function captions(list) {
    const host = $(".captions");
    const els = list.map(([, , html]) => {
      const d = document.createElement("div");
      d.className = "caption";
      d.innerHTML = `<div>${html}</div>`;
      host.appendChild(d);
      d.ls = lines(d.firstChild);
      return d;
    });
    return (t) => list.forEach(([a, z], i) => {
      if (!MOTION) return show(els[i], t, a, z, 30);
      els[i].style.opacity = t >= a && t < z + 0.5 ? 1 : 0;
      rise(els[i].ls, t, a, z);
    });
  }
  // Cursor path: [[t, x, y, click?], ...] in frame pixels.
  function cursor(keys) {
    const el = document.createElement("div");
    el.className = "cursor";
    el.innerHTML = `<div class="ring"></div><svg viewBox="0 0 24 24" width="44" height="44"><path d="M3 2l7 19 2.6-7.4L20 11z" fill="#141413" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    $(".frame").appendChild(el);
    keys.forEach((k) => k[3] && cue("click", k[0]));
    const ring = $(".ring", el);
    return (t) => {
      let k = keys[0];
      let x = k[1], y = k[2];
      for (let i = 0; i < keys.length - 1; i++) {
        const [a, ax, ay] = keys[i], [b, bx, by] = keys[i + 1];
        if (t >= a && t <= b) { const e = io(p(t, a, b)); x = lerp(ax, bx, e); y = lerp(ay, by, e); }
        else if (t > b) { x = bx; y = by; }
      }
      // The cursor follows the camera's drift during holds.
      x = STAGE_X + STAGE_W / 2 + (x - STAGE_X - STAGE_W / 2) * DRIFT; y = STAGE_Y + STAGE_H / 2 + (y - STAGE_Y - STAGE_H / 2) * DRIFT;
      el.style.opacity = t < keys[0][0] || t > keys[keys.length - 1][0] + 0.4 ? 0 : 1;
      el.style.transform = `translate(${x}px, ${y}px)`;
      const click = keys.find((k) => k[3] && t >= k[0] && t < k[0] + 0.45);
      if (click) { const q = p(t, click[0], click[0] + 0.45); ring.style.opacity = 1 - q; ring.style.transform = `scale(${0.4 + q})`; }
      else ring.style.opacity = 0;
      return { x, y };
    };
  }
  // Camera over a real-size app window: keys [[t, x, y, scale], ...], (x, y) = UI point centred in the viewport.
  function camera(el, vw, vh, keys) {
    el.style.transformOrigin = "0 0";
    return (t) => {
      let [, x, y, s] = keys[0];
      for (let i = 0; i < keys.length - 1; i++) {
        const [a, ax, ay, as] = keys[i], [b, bx, by, bs] = keys[i + 1];
        if (t > b) { x = bx; y = by; s = bs; continue; }
        if (t >= a) { const e = io(p(t, a, b)); x = lerp(ax, bx, e); y = lerp(ay, by, e); s = Math.exp(lerp(Math.log(as), Math.log(bs), e)); }
      }
      const S = s * DRIFT;
      el.style.transform = `translate(${vw / 2 - x * S}px, ${vh / 2 - y * S}px) scale(${S})`;
      return { x, y, s, map: (ux, uy) => [vw / 2 + (ux - x) * S, vh / 2 + (uy - y) * S] };
    };
  }
  // "Find it": the path to the feature, [[t, label], ...]. Each step lights up at its time (when the cursor
  // gets there); until then it shows dimmed, so the whole path is readable from the first frame.
  function where(steps) {
    const host = $(".where .path");
    if (!host) return () => {};
    host.innerHTML = steps.map(([, l]) => `<span class="wstep">${l}</span>`).join('<span class="sep">›</span>');
    const els = $$(".wstep", host);
    // Each step pops as it lights; an orange underline draws under the newest one.
    return (t) => {
      let cur = -1;
      steps.forEach(([a], i) => { els[i].classList.toggle("on", t >= a); if (t >= a) cur = i; });
      if (MOTION) els.forEach((el, i) => {
        const q = out(p(t, steps[i][0], steps[i][0] + 0.35));
        el.style.transform = t >= steps[i][0] ? `scale(${1 + 0.12 * (1 - q)})` : "";
        el.style.setProperty("--u", i === cur ? q * 100 + "%" : "0%");
      });
    };
  }
  // Hook card slides up and away; end card fades in.
  function hook(el, t, z) {
    cue("whoosh", z);
    const q = io(p(t, z, z + 0.6));
    if (!MOTION) { el.style.transform = `translateY(${-q * H}px)`; return; }
    // The card leaves with an orange band trailing under it; its title leaves a little faster than its background.
    card(el, RAW);
    el.style.transform = `translateY(${-q * (H + 90)}px)`;
    const h = $("h1", el); if (h) h.style.translate = `0 ${-q * 160}px`;
  }
  // A dark card builds itself: the glow drifts, the orange bar grows, the title rises line by line, the rest
  // follows. r is real (unheld) seconds; a is when it starts.
  function card(el, r, a = 0.25) {
    if (!el.ls) {
      el.insertAdjacentHTML("afterbegin", '<div class="bgwrap"><div class="glow"></div></div>');
      el.insertAdjacentHTML("beforeend", '<div class="trail"></div>');
      const h = $("h1", el); el.ls = h ? lines(h) : [];
    }
    const d = clamp(r / 8);
    $(".glow", el).style.transform = `scale(${1.14 - 0.08 * d}) translate(${-2 + 4 * d}%, ${1 - 2 * d}%)`;
    el.style.setProperty("--bar", out(p(r, a, a + 0.55)));
    rise(el.ls, r, a + 0.12, Infinity, 0.12);
    [[".num", 0], [".kicker", 0.05], ["p", 0.55], [".extra", 0.6], [".list", 0.6], [".mark", 0.7], [".url", 0.7], [".by", 0.7]]
      .forEach(([s, w]) => { const e = $(s, el); if (e) show(e, r, a + w, Infinity, 24, 0.5); });
  }
  function endcard(el, t, a) { const q = out(p(t, a, a + 0.6)); el.style.opacity = q; el.style.transform = `scale(${1.04 - 0.04 * q})`; }

  const LOGO = `<svg viewBox="0 0 54 54" aria-label="Lleverage"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.1199 0C39.6152 0 43.3629 0 46.2257 1.45857C48.7439 2.74167 50.7915 4.78926 52.0746 7.30749C53.5333 10.1703 53.5332 13.918 53.5332 21.4133V32.1199C53.5332 39.6152 53.5333 43.3629 52.0746 46.2257C50.7915 48.7439 48.7439 50.7915 46.2257 52.0746C43.3629 53.5333 39.6152 53.5332 32.1199 53.5332H21.4133C13.918 53.5332 10.1703 53.5333 7.30749 52.0746C4.78926 50.7915 2.74167 48.7439 1.45857 46.2257C0 43.3629 0 39.6152 0 32.1199L0 21.4133C0 13.918 0 10.1703 1.45857 7.30749C2.74167 4.78926 4.78926 2.74167 7.30749 1.45857C10.1703 0 13.918 0 21.4133 0L32.1199 0ZM27.0667 11.4545C26.2351 10.0143 24.3934 9.52078 22.9531 10.3523L20.6351 11.6906C19.1949 12.5221 18.7014 14.3639 19.5328 15.8041L34.5976 41.8639C35.4291 43.3042 37.2709 43.7977 38.7111 42.9662L41.0292 41.6279C42.4694 40.7963 42.963 38.9546 42.1315 37.5143L27.0667 11.4545ZM21.619 27.5806C20.7875 26.1404 18.9457 25.6468 17.5055 26.4783L15.1874 27.8166C13.7472 28.6481 13.2537 30.4899 14.0851 31.9301L19.8536 41.9214C20.6851 43.3616 22.5268 43.8551 23.9671 43.0237L26.2851 41.6853C27.7253 40.8538 28.2189 39.012 27.3874 37.5718L21.619 27.5806Z"/></svg>`;
  function run(duration, render) {
    // Brand logos from the design-system kit: full logo on paper, light logo on midnight.
    $$(".brandrow [data-logo]").forEach((el) => (el.innerHTML = '<img src="design-system/logo/logo-full-dark.svg" alt="Lleverage">'));
    $$(".card-full [data-logo]").forEach((el) => (el.innerHTML = '<img src="design-system/logo/logo-full-light.svg" alt="Lleverage">'));
    $$("[data-logo]:empty").forEach((el) => (el.innerHTML = LOGO));
    const params = new URLSearchParams(location.search);
    const record = params.has("record");
    // ?chapter=<label> relabels the brand row tag when a clip is cut into a combined video.
    if (params.get("chapter")) $$(".brandrow .tag").forEach((el) => (el.textContent = params.get("chapter")));
    // Holds: [[at, seconds], ...] freeze the timeline at `at` so a result can be read; motion keeps its speed.
    const holds = (window.HOLDS || []).map((h) => h.slice()).sort((a, b) => a[0] - b[0]);
    // A title card builds in about a second, so its hold grows to keep the reading time.
    if (MOTION && $("#hook")) holds.forEach((h) => { if (h[0] >= 0.8 && h[0] < 1.5) h[1] = Math.max(h[1], 1.5); });
    const warp = (t) => { for (const [at, d] of holds) { if (t < at) return t; if (t < at + d) return at; t -= d; } return t; };
    duration += holds.reduce((s, [, d]) => s + d, 0);
    const inner = render;
    // Holds in real seconds; the camera pushes in 3.5% over each one and eases back after it.
    const rawHolds = []; let acc = 0;
    for (const [at, d] of holds) { rawHolds.push([at + acc, d]); acc += d; }
    const drift = (r) => 1 + 0.035 * rawHolds.reduce((s, [a, d]) => s + io(p(r, a, a + d)) * (1 - io(p(r, a + d, a + d + 0.8))), 0);
    // Wipes: an orange panel lifts off the first frame and rises over the last, so parts cut on orange.
    // window.WIPE: "both" (default), "in", "out" or "none".
    const frame = $$(".frame").find((f) => getComputedStyle(f).display !== "none");
    const mode = MOTION ? window.WIPE || "both" : "none";
    let wipe = null;
    if (mode !== "none") { wipe = document.createElement("div"); wipe.className = "wipe"; frame.appendChild(wipe); }
    if (mode === "both" || mode === "out") SFX.push({ kind: "whoosh", t: duration - 0.5, raw: true });
    render = (t) => {
      RAW = t; DRIFT = MOTION ? drift(t) : 1;
      inner(warp(t));
      if (!wipe) return;
      const i = mode === "out" ? 1 : io(p(t, 0, 0.42)), o = mode === "in" ? 0 : io(p(t, duration - 0.42, duration));
      wipe.style.transform = `translateY(${o > 0 ? (1 - o) * 100 : -i * 100}%)`;
    };
    window.DURATION = duration;
    // Timeline seconds to held seconds: every hold that starts before t pushes it later.
    const held = (t) => t + holds.reduce((s, [at, d]) => s + (at < t ? d : 0), 0);
    window.CUES = () => SFX.map((c) => (c.raw ? c : { ...c, t: held(c.t), end: c.end === undefined ? undefined : held(c.end) }));
    window.seek = (t) => render(t);
    render(0);
    if (record) return;
    const start = performance.now();
    const loop = (now) => { render(((now - start) / 1000) % duration); requestAnimationFrame(loop); };
    document.fonts.ready.then(() => requestAnimationFrame(loop));
  }
  return { MOTION, raw: () => RAW, lines, rise, card, W, H, WIDE, STAGE_X, STAGE_Y, STAGE_W, STAGE_H, clamp, p, io, out, back, lerp, $, $$, show, type, captions, where, cursor, camera, hook, endcard, run };
})();
