// App shell pieces shared by the clips, mirroring apps/app components.
const APP = (() => {
  // LleverageLoader: 7x7 grid, cell 6 units, lit rect 4x5 (components/lleverage-loader.tsx).
  const MARK = [".-----.", "-##-##-", "-#-#-#-", "--###--", "-#-#-#-", "-##-##-", ".-----."];
  const cells = [];
  MARK.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === ".") return;
    cells.push({ r, c, on: ch === "#", dist: Math.max(Math.abs(r - 3), Math.abs(c - 3)), ang: Math.atan2(r - 3, c - 3) });
  }));
  function loader(size = 20) {
    const rects = cells.map((k) => `<rect class="off" x="${k.c * 6 + 1}" y="${k.r * 6 + 0.5}" width="4" height="5"/>`
      + (k.on ? `<rect class="on" data-i="${cells.indexOf(k)}" x="${k.c * 6 + 1}" y="${k.r * 6 + 0.5}" width="4" height="5"/>` : "")).join("");
    return `<svg class="loader" width="${size}" height="${size}" viewBox="0 0 42 42" shape-rendering="crispEdges">${rects}</svg>`;
  }
  // Drive every loader in el for time t. mode: static | ring | connecting | listening | user | agent | working.
  function drive(el, mode, t) {
    el.querySelectorAll("rect.on").forEach((r) => {
      const k = cells[+r.dataset.i];
      const inner = k.dist <= 1;
      let o = 1;
      const wave = (x, period) => 0.5 + 0.5 * Math.cos((2 * Math.PI * x) / period);
      if (mode === "ring") o = 0.35 + 0.65 * wave(t - k.dist * 0.15, 1.6);
      else if (mode === "connecting") o = 0.2 + 0.8 * wave(t - k.dist * 0.15, 1);
      else if (mode === "listening") o = 0.75 + 0.25 * wave(t, 3);
      else if (mode === "user") o = inner ? 0.25 + 0.75 * wave(t, 0.9) : 0.75 + 0.25 * wave(t, 3);
      else if (mode === "agent") o = inner ? 1 : 0.3 + 0.7 * wave(t - (k.ang + Math.PI) / (2 * Math.PI) * 0.9, 0.9);
      else if (mode === "working") { const d = Math.cos(k.ang - (2 * Math.PI * t) / 1.4); o = 0.2 + 0.8 * Math.pow(Math.max(0, d), 3); }
      r.style.opacity = o;
    });
  }
  // Sidebar (sidebar-nav, platform-nav-item). pins: [[label, faIcon|"agent", badge?], ...]
  function sidebar(active, project = "Order intake") {
    const pins = [["Agent", "agent"], ["Overview", "faHouse"], ["Requests", "faInbox", 4], ["Workflows", "faBolt"], ["Skills", "faStar"], ["Data tables", "faFileSpreadsheet"], ["Monitoring", "faChartLine"]];
    const more = [["Knowledge", "faBookOpen"], ["Apps", "faPaperPlane"]];
    const item = ([label, icon, badge]) => `<div class="nav${label === active ? " on" : ""}"><span class="ib">${icon === "agent" ? loader(14) : fa(icon)}</span><span class="t">${label}</span>${badge ? `<span class="badge-n">${badge}</span>` : ""}</div>`;
    return `<aside class="sb">
      <div class="sb-top"><div class="sb-logo">${LOGO_SVG}</div>${lu("panelLeft", "", "width:16px;height:16px;color:hsl(var(--muted-foreground))")}
        <div class="sb-proj">${project} ${fa("faChevronDown", "", "width:10px;height:10px;color:hsl(var(--muted-foreground))")}</div></div>
      <div class="sb-body"><div class="sb-label">Pinned</div>${pins.map(item).join("")}<div class="sb-label" style="margin-top:8px">Project</div>${more.map(item).join("")}</div>
    </aside>`;
  }
  const LOGO_SVG = `<svg viewBox="0 0 54 54"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.1199 0C39.6152 0 43.3629 0 46.2257 1.45857C48.7439 2.74167 50.7915 4.78926 52.0746 7.30749C53.5333 10.1703 53.5332 13.918 53.5332 21.4133V32.1199C53.5332 39.6152 53.5333 43.3629 52.0746 46.2257C50.7915 48.7439 48.7439 50.7915 46.2257 52.0746C43.3629 53.5333 39.6152 53.5332 32.1199 53.5332H21.4133C13.918 53.5332 10.1703 53.5333 7.30749 52.0746C4.78926 50.7915 2.74167 48.7439 1.45857 46.2257C0 43.3629 0 39.6152 0 32.1199L0 21.4133C0 13.918 0 10.1703 1.45857 7.30749C2.74167 4.78926 4.78926 2.74167 7.30749 1.45857C10.1703 0 13.918 0 21.4133 0L32.1199 0ZM27.0667 11.4545C26.2351 10.0143 24.3934 9.52078 22.9531 10.3523L20.6351 11.6906C19.1949 12.5221 18.7014 14.3639 19.5328 15.8041L34.5976 41.8639C35.4291 43.3042 37.2709 43.7977 38.7111 42.9662L41.0292 41.6279C42.4694 40.7963 42.963 38.9546 42.1315 37.5143L27.0667 11.4545ZM21.619 27.5806C20.7875 26.1404 18.9457 25.6468 17.5055 26.4783L15.1874 27.8166C13.7472 28.6481 13.2537 30.4899 14.0851 31.9301L19.8536 41.9214C20.6851 43.3616 22.5268 43.8551 23.9671 43.0237L26.2851 41.6853C27.7253 40.8538 28.2189 39.012 27.3874 37.5718L21.619 27.5806Z"/></svg>`;
  return { loader, drive, sidebar };
})();
