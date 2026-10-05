// Deterministic clip runtime: every frame is render(t). ?record exposes seek(t) for the recorder;
// otherwise the clip loops in the browser for preview.
const C = (() => {
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
  function type(el, text, t, a, b) {
    el.textContent = text.slice(0, Math.round(text.length * p(t, a, b)));
  }
  // Captions: [[start, end, html], ...] onto .caption elements built here.
  function captions(list) {
    const host = $(".captions");
    const els = list.map(([, , html]) => {
      const d = document.createElement("div");
      d.className = "caption";
      d.innerHTML = `<div>${html}</div>`;
      host.appendChild(d);
      return d;
    });
    return (t) => list.forEach(([a, z], i) => show(els[i], t, a, z, 30));
  }
  // Cursor path: [[t, x, y, click?], ...] in frame pixels.
  function cursor(keys) {
    const el = document.createElement("div");
    el.className = "cursor";
    el.innerHTML = `<div class="ring"></div><svg viewBox="0 0 24 24" width="44" height="44"><path d="M3 2l7 19 2.6-7.4L20 11z" fill="#141413" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    $(".frame").appendChild(el);
    const ring = $(".ring", el);
    return (t) => {
      let k = keys[0];
      let x = k[1], y = k[2];
      for (let i = 0; i < keys.length - 1; i++) {
        const [a, ax, ay] = keys[i], [b, bx, by] = keys[i + 1];
        if (t >= a && t <= b) { const e = io(p(t, a, b)); x = lerp(ax, bx, e); y = lerp(ay, by, e); }
        else if (t > b) { x = bx; y = by; }
      }
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
      el.style.transform = `translate(${vw / 2 - x * s}px, ${vh / 2 - y * s}px) scale(${s})`;
      return { x, y, s, map: (ux, uy) => [vw / 2 + (ux - x) * s, vh / 2 + (uy - y) * s] };
    };
  }
  // Hook card slides up and away; end card fades in.
  function hook(el, t, z) { const q = io(p(t, z, z + 0.6)); el.style.transform = `translateY(${-q * 1350}px)`; }
  function endcard(el, t, a) { const q = out(p(t, a, a + 0.6)); el.style.opacity = q; el.style.transform = `scale(${1.04 - 0.04 * q})`; }

  const LOGO = `<svg viewBox="0 0 54 54" aria-label="Lleverage"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.1199 0C39.6152 0 43.3629 0 46.2257 1.45857C48.7439 2.74167 50.7915 4.78926 52.0746 7.30749C53.5333 10.1703 53.5332 13.918 53.5332 21.4133V32.1199C53.5332 39.6152 53.5333 43.3629 52.0746 46.2257C50.7915 48.7439 48.7439 50.7915 46.2257 52.0746C43.3629 53.5333 39.6152 53.5332 32.1199 53.5332H21.4133C13.918 53.5332 10.1703 53.5333 7.30749 52.0746C4.78926 50.7915 2.74167 48.7439 1.45857 46.2257C0 43.3629 0 39.6152 0 32.1199L0 21.4133C0 13.918 0 10.1703 1.45857 7.30749C2.74167 4.78926 4.78926 2.74167 7.30749 1.45857C10.1703 0 13.918 0 21.4133 0L32.1199 0ZM27.0667 11.4545C26.2351 10.0143 24.3934 9.52078 22.9531 10.3523L20.6351 11.6906C19.1949 12.5221 18.7014 14.3639 19.5328 15.8041L34.5976 41.8639C35.4291 43.3042 37.2709 43.7977 38.7111 42.9662L41.0292 41.6279C42.4694 40.7963 42.963 38.9546 42.1315 37.5143L27.0667 11.4545ZM21.619 27.5806C20.7875 26.1404 18.9457 25.6468 17.5055 26.4783L15.1874 27.8166C13.7472 28.6481 13.2537 30.4899 14.0851 31.9301L19.8536 41.9214C20.6851 43.3616 22.5268 43.8551 23.9671 43.0237L26.2851 41.6853C27.7253 40.8538 28.2189 39.012 27.3874 37.5718L21.619 27.5806Z"/></svg>`;
  function run(duration, render) {
    $$("[data-logo]").forEach((el) => (el.innerHTML = LOGO));
    const params = new URLSearchParams(location.search);
    const record = params.has("record");
    // ?chapter=1 / 3 · Quote & Sell labels a clip when it is cut into the weekly video.
    if (params.get("chapter")) $$(".brandrow .tag").forEach((el) => (el.textContent = params.get("chapter")));
    window.DURATION = duration;
    window.seek = (t) => render(t);
    render(0);
    if (record) return;
    const start = performance.now();
    const loop = (now) => { render(((now - start) / 1000) % duration); requestAnimationFrame(loop); };
    document.fonts.ready.then(() => requestAnimationFrame(loop));
  }
  return { clamp, p, io, out, back, lerp, $, $$, show, type, captions, cursor, camera, hook, endcard, run };
})();
