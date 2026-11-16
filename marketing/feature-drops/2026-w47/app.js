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
  // Sidebar after LLE-17451 (#9728, 15 Nov 2026), the one navigation for every project (nav/sidebar-nav.tsx):
  // top row (logo, collapse, project switcher, the Configure compass for builders, faGrip), pinned pages, the agent
  // list (operate-section.tsx: icon-only tabs Needs me · Chats · Completed with counts; rows are a title and small
  // icons: the schedule clock, the files doc, an orange dot when unread, yellow when waiting on you), New with the
  // pixel mark between two lines, then the account button and the help buttons (sidebar-bottom-row.tsx).
  // active: a pin label or a row title. o: { tab: "needs"|"chats"|"done", rows, counts, builder, pins }.
  const PINS = [["Overview", "faHouse"], ["Requests", "faInbox", 3], ["Order desk", "faGrid2"], ["Workflows", "faBolt"], ["Data tables", "faFileSpreadsheet"]];
  const CHATS = [["Kuipers Hout delivery date", { dot: "new" }], ["Invoices waiting on a PO", { files: true }], ["Weekly order report", { clock: true }],
    ["Smit Elektro order", {}], ["Price check Van Dijk Metaal", { files: true }], ["Daily open orders", { clock: true }], ["Returns from Brouwer Verpakking", {}]];
  function sidebar(active, project = "Order intake", o = {}) {
    const pins = o.pins || PINS, tab = o.tab || "chats", builder = o.builder !== false;
    const rows = o.rows || CHATS, counts = o.counts || { needs: 3, chats: 14, done: 31 };
    const item = ([label, icon, badge]) => `<div class="nav${label === active ? " on" : ""}" data-pin="${label}"><span class="ib">${fa(icon)}</span><span class="t">${label}</span>${badge ? `<span class="badge-n">${badge}</span>` : ""}</div>`;
    const row = ([title, f = {}]) => `<div class="arow${title === active ? " on" : ""}" data-row="${title}"><span class="t">${title}</span><span class="tr">`
      + (f.clock ? `<i class="ri">${fa("faClock")}</i>` : "") + (f.files ? `<i class="ri">${fa("faFileLines")}</i>` : "")
      + (f.dot ? `<i class="rd ${f.dot}"></i>` : "") + `</span></div>`;
    const tb = (k, icon, label) => `<span class="atab${k === tab ? " on" : ""}" data-tab="${k}" title="${label}">${fa(icon)}<b>${counts[k]}</b></span>`;
    return `<aside class="sb">
      <div class="sb-top"><span class="sb-ic32 sb-logo">${LOGO_SVG}</span><span class="sb-ic32">${lu("panelLeft", "", "width:16px;height:16px")}</span>
        <span class="sb-proj"><i class="org">O</i>${project}</span>${builder ? `<span class="sb-ic32 sb-compass" id="sb-compass">${fa("faGrip")}</span>` : ""}</div>
      <div class="sb-body">${pins.map(item).join("")}</div>
      <div class="sb-list"><div class="sb-div"></div>
        <div class="atabs">${tb("needs", "faHand", "Needs me")}${tb("chats", "faComment", "Chats")}${tb("done", "faCircleCheck", "Completed")}</div>
        <div class="arows" id="sb-rows">${rows.map(row).join("")}</div></div>
      <div class="sb-new"><div class="nav" id="sb-new"><span class="ib">${loader(16)}</span><span class="t">New</span></div></div>
      <div class="sb-bot"><span class="sb-acct"><i class="avt">EV</i>Eva Visser</span><span class="sb-ic28">${fa("faBug")}</span><span class="sb-ic28">${fa("faComment")}</span></div>
    </aside>`;
  }
  // Page title bar (nav/page-title-bar.tsx): builders see "Project › Configure › Page"; a page opened from a pin
  // shows only its name.
  function header(trail) {
    const parts = trail.map((t, i) => i < trail.length - 1 ? `<span class="s">${t}</span>${fa("faChevronRight")}` : `<span>${t}</span>`).join("");
    return `<div class="ptb"><h1>${parts}</h1></div>`;
  }
  const LOGO_SVG = `<svg viewBox="0 0 54 54"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.1199 0C39.6152 0 43.3629 0 46.2257 1.45857C48.7439 2.74167 50.7915 4.78926 52.0746 7.30749C53.5333 10.1703 53.5332 13.918 53.5332 21.4133V32.1199C53.5332 39.6152 53.5333 43.3629 52.0746 46.2257C50.7915 48.7439 48.7439 50.7915 46.2257 52.0746C43.3629 53.5333 39.6152 53.5332 32.1199 53.5332H21.4133C13.918 53.5332 10.1703 53.5333 7.30749 52.0746C4.78926 50.7915 2.74167 48.7439 1.45857 46.2257C0 43.3629 0 39.6152 0 32.1199L0 21.4133C0 13.918 0 10.1703 1.45857 7.30749C2.74167 4.78926 4.78926 2.74167 7.30749 1.45857C10.1703 0 13.918 0 21.4133 0L32.1199 0ZM27.0667 11.4545C26.2351 10.0143 24.3934 9.52078 22.9531 10.3523L20.6351 11.6906C19.1949 12.5221 18.7014 14.3639 19.5328 15.8041L34.5976 41.8639C35.4291 43.3042 37.2709 43.7977 38.7111 42.9662L41.0292 41.6279C42.4694 40.7963 42.963 38.9546 42.1315 37.5143L27.0667 11.4545ZM21.619 27.5806C20.7875 26.1404 18.9457 25.6468 17.5055 26.4783L15.1874 27.8166C13.7472 28.6481 13.2537 30.4899 14.0851 31.9301L19.8536 41.9214C20.6851 43.3616 22.5268 43.8551 23.9671 43.0237L26.2851 41.6853C27.7253 40.8538 28.2189 39.012 27.3874 37.5718L21.619 27.5806Z"/></svg>`;
  return { loader, drive, sidebar, header, logo: () => LOGO_SVG };
})();
// Exact Online logo, 128px PNG, for tool steps that act in Exact Online.
APP.EXACT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAALVBMVEX////hFB3gAADlTFDzqaz97/DnWF3kJC72uLr0wsP619nkNTvvkZTpdXfviYxRQlBxAAAB8UlEQVR4nO2aCW7DIBBFMQaDWXz/49aRolZVBhvDZ1DVeQfIfwYCw6KUIAiCIAiCIAjC38beMyg5eJOOnLdbMtzA2pBW/Wa5Q69ogT3HitwfNqyAicuTdLCAPdzDdKyA3Z7HIwXM08YHC6SmeJzA0ZiPEmj9fpSAac7HCNjmeJBA8wAACYQ4uQXaRyBGwPbkIwTyhYC+pX85Dq4YvsT0zV6iuwF8qW1z6P7tKsge0KvnST+H4Erlb0xffxLIfLZ4ehJw/SOrno1oAb72PyEagLMDVPgU0AenAFEJuFG7LRL/KQDf61zyWQpow5lPzYNsc2BJIK51RIQpORFXAukrS81D/0ogzO6CnoJYBOYLIFZtEZgu0DUVQwR6ZkIRgBTPRD1wvyN+M0rgMJUg8ufXhERZzlsVExuTZbaA5i2LiQMa1r0huTvm3J2Tx8Tge6BrqFGoOQ2oI5pF428DixRuimJiM9ip/LMRognD7mV/YYsnpXHdckrJX7LPPit2/Wsi9T+oJwIW5Z4LE4hA8bycS+ByFLAI9NyaQQSUb+8EjEDHzSVIwDYPA5CAsq13dyiB1/uByQLKN71gAAqcU2KDAlRA7ebxMxaswGswupr3S+METoLJa6x6RjVI4MSG3R/vh2TRXTJGQBAEQRAEQRAEAcgXbjMbwSIdiogAAAAASUVORK5CYII=";
// lucide-react glyphs the agent chat uses (agent-chat-input.tsx, waiting-messages.tsx, chat-message.tsx).
Object.assign(LU, {
  listPlus: '<path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M18 9v6"/><path d="M21 12h-6"/>',
  cornerDownRight: '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  squareFill: '<rect width="14" height="14" x="5" y="5" rx="2" fill="currentColor"/>',
});
