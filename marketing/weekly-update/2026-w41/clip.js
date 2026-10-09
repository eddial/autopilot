// Deterministic clip runtime: every frame is render(t). ?record exposes seek(t) for the recorder;
// otherwise the clip loops in the browser for preview.
// Motion (on unless ?motion=0): one continuous canvas rather than slides. Critically damped motion (it settles, never
// bounces); words rise in with a blur; a chapter's app window glides in from the right beside its title, grows into
// place and glides out to the left, so the next chapter flows in. render-plane.mjs draws the app as a flat image
// (window.LAYOUT says where), so zooms and pans never re-draw its text. The paper background drifts on the video's own clock (?t0=, seconds
// of the parts before this one), so it carries on across cuts.
const C = (() => {
  // Frame size from the format (?w=<px>&h=<px>, set by the toolkit scripts; default 4:5, 1080 x 1350).
  // Portrait and square: 1080 wide, stage 952 x (H - 450) at (64, 330).
  // Landscape (WIDE, e.g. 4:3 at 1440 x 1080): stage (W - 128) x (H - 362) at (64, 278), under the captions.
  // Square (1:1): stage (W - 128) x (H - 364) at (64, 280).
  // The app plane is 1280 wide and as tall as the stage's shape needs (at least 800): APP_H, set as --app-h.
  const q = new URLSearchParams(location.search);
  const H = Number(q.get("h")) || 1350, W = Number(q.get("w")) || 1080, WIDE = W > H;
  document.documentElement.style.setProperty("--frame-h", H + "px");
  document.documentElement.style.setProperty("--frame-w", W + "px");
  const SQUARE = W === H;
  if (WIDE) document.documentElement.classList.add("wide");
  if (SQUARE) document.documentElement.classList.add("square");
  const MOTION = q.get("motion") !== "0", T0 = Number(q.get("t0")) || 0;
  let RAW = 0, DRIFT = 1, POSED = 1, FADE = 1;
  const STAGE_X = 64, STAGE_Y = WIDE ? 278 : SQUARE ? 280 : 330, STAGE_W = W - 128, STAGE_H = WIDE ? H - 362 : SQUARE ? H - 364 : H - 450;
  const APP_H = Math.max(800, Math.round((1280 * (STAGE_H - 4)) / (STAGE_W - 4)));
  document.documentElement.style.setProperty("--app-h", APP_H + "px");
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const p = (t, a, b) => clamp((t - a) / (b - a));
  const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const smooth = (x) => x * x * x * (x * (6 * x - 15) + 10); // smootherstep: no jolt where a move starts or stops
  const expo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const out = (x) => 1 - Math.pow(1 - x, 3);
  const back = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
  const lerp = (a, b, x) => a + (b - a) * x;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // A damped spring from 0 to 1, d seconds after it starts. z damping (1 = critically damped: no overshoot), w stiffness.
  function spring(d, z = 1, w = 11) {
    if (d <= 0) return 0;
    if (z >= 1) return 1 - Math.exp(-w * d) * (1 + w * d);
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * d) * (Math.cos(wd * d) + ((z * w) / wd) * Math.sin(wd * d));
  }

  // Fade and lift in at a, optionally out at z.
  function show(el, t, a, z = Infinity, dy = 24, dur = 0.45) {
    const i = out(p(t, a, a + dur));
    const o = z === Infinity ? 1 : 1 - p(t, z, z + 0.3);
    el.style.opacity = Math.min(i, o);
    el.style.transform = `translateY(${(1 - i) * dy}px)`;
  }
  // Wrap every word of an element in a span (keeping <em> and <br>), for word-by-word motion.
  function words(el) {
    const walk = (n) => [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) return f.appendChild(document.createTextNode(w));
          const m = document.createElement("span"); m.className = "wm";
          const s = document.createElement("span"); s.className = "w"; s.textContent = w; m.appendChild(s); f.appendChild(m);
        });
        n.replaceChild(f, c);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
    walk(el);
    return $$(".w", el);
  }
  // Words rise into place through a mask from a, one after another; from z they rise out the same way.
  function wordsIn(ws, t, a, z = Infinity, gap = 0.035) {
    ws.forEach((w, i) => {
      const e = expo(clamp((t - a - i * gap) / 0.75));
      const o = z === Infinity ? 0 : io(clamp((t - z - i * 0.012) / 0.32));
      w.style.transform = `translateY(${((1 - e) - o) * 108}%)`;
      w.style.opacity = t < a + i * gap ? 0 : 1;
    });
  }
  // Sound cues (timeline seconds): clicks and typing. run() maps them to held time as window.CUES for
  // soundtrack.py; nothing here makes a sound. Raw cues (raw: true) are already in real seconds.
  const SFX = (window.SFX = []), seen = new Set();
  const cue = (kind, t, end) => { const k = kind + t + (end || ""); if (!seen.has(k)) { seen.add(k); SFX.push({ kind, t, end }); } };
  function type(el, text, t, a, b) {
    cue("type", a, b);
    el.textContent = text.slice(0, Math.round(text.length * p(t, a, b)));
  }
  // Captions: [[start, end, html], ...] onto .caption elements built here; word by word with MOTION.
  function captions(list) {
    const host = $(".captions");
    const els = list.map(([, , html]) => {
      const d = document.createElement("div");
      d.className = "caption";
      d.innerHTML = `<div>${html}</div>`;
      host.appendChild(d);
      d.ws = MOTION ? words(d.firstChild) : [];
      return d;
    });
    return (t) => list.forEach(([a, z], i) => {
      if (!MOTION) return show(els[i], t, a, z, 30);
      els[i].style.opacity = t >= a && t < z + 0.7 ? 1 : 0;
      wordsIn(els[i].ws, t, a, z, 0.04);
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
        if (t >= a && t <= b) {
          // A hand moves in a slight arc and eases in and out; the bow is 6% of the distance.
          const e = smooth(p(t, a, b)), dx = bx - ax, dy = by - ay, bow = 0.06 * Math.sin(Math.PI * e);
          x = lerp(ax, bx, e) - dy * bow; y = lerp(ay, by, e) + dx * bow;
        }
        else if (t > b) { x = bx; y = by; }
      }
      // The cursor follows the camera's drift during holds.
      x = STAGE_X + STAGE_W / 2 + (x - STAGE_X - STAGE_W / 2) * DRIFT; y = STAGE_Y + STAGE_H / 2 + (y - STAGE_Y - STAGE_H / 2) * DRIFT;
      el.style.opacity = t < keys[0][0] || t > keys[keys.length - 1][0] + 0.4 ? 0 : 1;
      // A press: the pointer dips to 88% for a moment and a thin ring opens and fades.
      const click = keys.find((k) => k[3] && t >= k[0] - 0.06 && t < k[0] + 0.5);
      const press = click ? Math.sin(Math.PI * clamp((t - click[0] + 0.06) / 0.2)) : 0;
      el.style.transform = `translate(${x}px, ${y}px) scale(${1 - 0.12 * press})`;
      if (click && t >= click[0]) { const q = expo(p(t, click[0], click[0] + 0.5)); ring.style.opacity = 0.9 * (1 - q); ring.style.transform = `scale(${0.5 + 0.9 * q})`; }
      else ring.style.opacity = 0;
      return { x, y };
    };
  }
  // Camera over a real-size app window: keys [[t, x, y, scale], ...], (x, y) = UI point centred in the viewport.
  // Keys are kept inside the app and snapped to an edge when they come within 140 UI px of it, so a zoom never shows a
  // sliver of the app cut off at the window's edge (a sidebar half in view, a word cut in two).
  function camera(el, vw, vh, keys) {
    el.style.transformOrigin = "0 0";
    keys = keys.map(([t, x, y, s]) => {
      const hw = vw / 2 / s, hh = vh / 2 / s, AW = 1280, AH = APP_H, SNAP = 140;
      if (hw >= AW / 2) x = AW / 2; else { x = Math.min(Math.max(x, hw), AW - hw); if (x - hw < SNAP) x = hw; if (AW - hw - x < SNAP) x = AW - hw; }
      if (hh >= AH / 2) y = AH / 2; else { y = Math.min(Math.max(y, hh), AH - hh); if (y - hh < SNAP) y = hh; if (AH - hh - y < SNAP) y = AH - hh; }
      return [t, x, y, s];
    });
    return (t) => {
      let [, x, y, s] = keys[0];
      for (let i = 0; i < keys.length - 1; i++) {
        const [a, ax, ay, as] = keys[i], [b, bx, by, bs] = keys[i + 1];
        if (t > b) { x = bx; y = by; s = bs; continue; }
        if (t >= a) { const e = smooth(p(t, a, b)); x = lerp(ax, bx, e); y = lerp(ay, by, e); s = Math.exp(lerp(Math.log(as), Math.log(bs), e)); }
      }
      const S = s * DRIFT;
      el.style.transform = `translate(${vw / 2 - x * S}px, ${vh / 2 - y * S}px) scale(${S})`;
      return { x, y, s, map: (ux, uy) => [vw / 2 + (ux - x) * S, vh / 2 + (uy - y) * S] };
    };
  }
  // "Find it" path row (portrait formats). With MOTION the module is named in the chapter title instead, and the
  // row is not shown.
  function where(steps) {
    const host = $(".where .path");
    if (!host) return () => {};
    host.innerHTML = steps.map(([, l]) => `<span class="wstep">${l}</span>`).join('<span class="sep">›</span>');
    const els = $$(".wstep", host);
    return (t) => steps.forEach(([a], i) => els[i].classList.toggle("on", t >= a));
  }
  // The chapter intro (#hook) is driven by run(); hook() keeps the old call sites working without MOTION.
  function hook(el, t, z) { if (!MOTION) { const q = io(p(t, z, z + 0.6)); el.style.transform = `translateY(${-q * H}px)`; } }
  function endcard(el, t, a) { const q = out(p(t, a, a + 0.6)); el.style.opacity = q; el.style.transform = `scale(${1.04 - 0.04 * q})`; }

  const LOGO = `<svg viewBox="0 0 54 54" aria-label="Lleverage"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.1199 0C39.6152 0 43.3629 0 46.2257 1.45857C48.7439 2.74167 50.7915 4.78926 52.0746 7.30749C53.5333 10.1703 53.5332 13.918 53.5332 21.4133V32.1199C53.5332 39.6152 53.5333 43.3629 52.0746 46.2257C50.7915 48.7439 48.7439 50.7915 46.2257 52.0746C43.3629 53.5333 39.6152 53.5332 32.1199 53.5332H21.4133C13.918 53.5332 10.1703 53.5333 7.30749 52.0746C4.78926 50.7915 2.74167 48.7439 1.45857 46.2257C0 43.3629 0 39.6152 0 32.1199L0 21.4133C0 13.918 0 10.1703 1.45857 7.30749C2.74167 4.78926 4.78926 2.74167 7.30749 1.45857C10.1703 0 13.918 0 21.4133 0L32.1199 0ZM27.0667 11.4545C26.2351 10.0143 24.3934 9.52078 22.9531 10.3523L20.6351 11.6906C19.1949 12.5221 18.7014 14.3639 19.5328 15.8041L34.5976 41.8639C35.4291 43.3042 37.2709 43.7977 38.7111 42.9662L41.0292 41.6279C42.4694 40.7963 42.963 38.9546 42.1315 37.5143L27.0667 11.4545ZM21.619 27.5806C20.7875 26.1404 18.9457 25.6468 17.5055 26.4783L15.1874 27.8166C13.7472 28.6481 13.2537 30.4899 14.0851 31.9301L19.8536 41.9214C20.6851 43.3616 22.5268 43.8551 23.9671 43.0237L26.2851 41.6853C27.7253 40.8538 28.2189 39.012 27.3874 37.5718L21.619 27.5806Z"/></svg>`;
  // The paper background: two soft glows and a faint dot grid, moving on the video's clock (T0 + real seconds).
  function ambient(frame) {
    const a = document.createElement("div"); a.className = "amb";
    a.innerHTML = '<div class="dots"></div><div class="glow g1"></div><div class="glow g2"></div>';
    frame.prepend(a);
    const g1 = $(".g1", a), g2 = $(".g2", a), dots = $(".dots", a);
    return (r) => {
      const G = T0 + r;
      g1.style.transform = `translate(${W * (0.62 + 0.14 * Math.sin(G * 0.13))}px, ${H * (0.18 + 0.12 * Math.cos(G * 0.1))}px)`;
      g2.style.transform = `translate(${W * (0.08 + 0.12 * Math.cos(G * 0.09 + 1))}px, ${H * (0.7 + 0.1 * Math.sin(G * 0.12))}px)`;
      dots.style.backgroundPosition = `${(-G * 9) % 28}px ${(-G * 4) % 28}px`;
    };
  }

  function run(duration, render) {
    // Brand logos from the design-system kit: full logo on paper, light logo on midnight.
    $$(".brandrow [data-logo]").forEach((el) => (el.innerHTML = '<img src="design-system/logo/logo-full-dark.svg" alt="Lleverage">'));
    $$(".card-full [data-logo]").forEach((el) => (el.innerHTML = '<img src="design-system/logo/logo-full-light.svg" alt="Lleverage">'));
    $$("[data-logo]:empty").forEach((el) => (el.innerHTML = LOGO));
    const params = new URLSearchParams(location.search);
    const record = params.has("record");
    if (params.get("chapter")) $$(".brandrow .tag").forEach((el) => (el.textContent = params.get("chapter")));
    // Parts: window.PARTS = { name: [from, to] } cuts one timeline into chapters; ?part=name renders one. A part that
    // starts later holds its first frame for 1.5 s behind its intro, as a chapter's opening does.
    const part = (window.PARTS || {})[params.get("part")] || [0, duration];
    const [from, to] = part, lead = from > 0 ? 1.5 : 0;
    const tl = (u) => (u < lead ? from : from + u - lead); // part-local seconds to the clip's timeline
    const loc = (t) => t - from + lead; // and back
    // Holds: [[at, seconds], ...] in part-local time freeze the timeline so a result can be read.
    const intro = MOTION && !!$("#hook");
    let holds = (window.HOLDS || []).map(([at, d]) => [loc(at), d]).filter(([at]) => at > (from > 0 ? lead : -1) && at < to - from + lead);
    if (intro) {
      // The intro builds for about 3 s: its hold grows (or is added) so the title can be read.
      const h = holds.find(([at]) => at >= 0.8 && at < 1.5);
      if (h) h[1] = Math.max(h[1], 1.6); else holds.push([1.0, 1.6]);
    }
    holds = holds.sort((a, b) => a[0] - b[0]);
    const warp = (t) => { for (const [at, d] of holds) { if (t < at) return t; if (t < at + d) return at; t -= d; } return t; };
    const held = (t) => t + holds.reduce((s, [at, d]) => s + (at < t ? d : 0), 0);
    duration = to - from + lead + holds.reduce((s, [, d]) => s + d, 0);
    // The camera pushes in 3.5% over each hold and eases back after it.
    const rawHolds = []; let acc = 0;
    for (const [at, d] of holds) { rawHolds.push([at + acc, d]); acc += d; }
    const drift = (r) => 1 + 0.035 * rawHolds.reduce((s, [a, d]) => s + io(p(r, a, a + d)) * (1 - io(p(r, a + d, a + d + 0.8))), 0);

    const frame = $$(".frame").find((f) => getComputedStyle(f).display !== "none") || $(".frame");
    const amb = MOTION ? ambient(frame) : null;
    const stage = $(".stage", frame), hookEl = $("#hook"), capHost = $(".captions", frame), tag = $(".brandrow .tag", frame);
    const ZR = held(1.5); // real seconds when the intro hands over to the feature
    const CAP = held(1.9); // when the first caption arrives: the title leaves just before
    const OUT = duration - 0.5; // the content starts to fade out
    let iw = [], tagW = [], kick = null;
    if (intro) {
      iw = words($("h1", hookEl)); kick = $(".kick", hookEl);
      if (tag) tagW = words(tag);
    }
    const inner = render;
    render = (r) => {
      RAW = r; DRIFT = MOTION ? drift(r) : 1;
      const u = warp(r);
      inner(tl(u));
      if (amb) amb(r);
      if (!intro) return;
      // The window stays put: its content fades in at the start and out at the end, so chapters change inside one
      // steady frame.
      FADE = Math.min(smooth(clamp(r / 0.45)), 1 - smooth(clamp((r - OUT) / (duration - OUT))));
      stage.querySelector(".app").style.opacity = FADE;
      // The title takes the captions' place: kicker, then the words, then it hands over to the first caption.
      const kq = expo(clamp((r - 0.1) / 0.6)), ko = io(clamp((r - CAP + 0.32) / 0.3));
      kick.style.opacity = kq * (1 - ko); kick.style.transform = `translateY(${(1 - kq) * 12 - ko * 12}px)`;
      wordsIn(iw, r, 0.2, CAP - 0.36, 0.04);
      if (tagW.length) wordsIn(tagW, r, 0.15, Infinity, 0.03);
      const e3 = smooth(clamp((r - OUT) / (duration - OUT)));
      if (capHost) capHost.style.opacity = r < CAP - 0.05 ? 0 : 1 - e3;
      const cur = $(".cursor", frame); if (cur && e3 > 0) cur.style.opacity = Math.min(Number(cur.style.opacity || 1), 1 - e3);
    };
    window.DURATION = duration;
    // Where the app sits this frame, for render-plane.mjs: the app's box and the window's box in frame pixels, and the
    // window's scale (its corner radius and border scale with it).
    const appEl = stage && $(".app", stage);
    window.LAYOUT = () => {
      if (!appEl) return null;
      const a = appEl.getBoundingClientRect(), b = stage.getBoundingClientRect();
      return { app: [a.left, a.top, a.width, a.height], stage: [b.left, b.top, b.width, b.height], s: POSED, border: stage.clientLeft, fade: FADE };
    };
    // Cues in real seconds: those inside this part, mapped to part-local time, then to held time.
    window.CUES = () => SFX.filter((c) => c.raw || (c.t >= from - 0.001 && c.t < to)).map((c) => (c.raw ? c : { ...c, t: held(loc(c.t)), end: c.end === undefined ? undefined : held(loc(Math.min(c.end, to))) }));
    window.seek = (t) => render(t);
    render(0);
    if (record) return;
    const start = performance.now();
    const loop = (now) => { render(((now - start) / 1000) % duration); requestAnimationFrame(loop); };
    document.fonts.ready.then(() => requestAnimationFrame(loop));
  }
  return { MOTION, raw: () => RAW, spring, words, wordsIn, W, H, WIDE, SQUARE, APP_H, STAGE_X, STAGE_Y, STAGE_W, STAGE_H, clamp, p, io, out, back, lerp, $, $$, show, type, captions, where, cursor, camera, hook, endcard, run };
})();
