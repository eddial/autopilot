// Chapter shell for a video of several features: brand row, captions host, footer and a numbered title card.
// CHAPTER({ n, total, tag, kicker, title: "Line one<br><em>line two.</em>", line, extra?, where?, footerLeft?, footerRight?, cardRight? })
// where: a label for the "find it" row (default "Find it"); fill its path with C.where([[t, step], ...]) in the timeline.
// Call before C.run; the title card is #hook (C.hook($("#hook"), t, 1.5)). A consuming skill wraps it to add its own parts
// (daily-merge-report adds the PRs and who built it; feature-drop adds nothing).
function CHAPTER(o) {
  const f = document.querySelector(".frame"), nn = String(o.n).padStart(2, "0"), tt = String(o.total || 5).padStart(2, "0");
  f.insertAdjacentHTML("afterbegin", `<div class="brandrow"><div class="logo"><span data-logo></span></div><div class="tag">${o.tag} · ${nn}</div></div><div class="captions"></div>${o.where ? `<div class="where"><span class="lbl">${o.where === true ? "Find it" : o.where}</span><span class="path"></span></div>` : ""}`);
  f.insertAdjacentHTML("beforeend", `<div class="footer"><span>${o.footerLeft || "lleverage.ai"}</span><span>${o.footerRight || ""}</span></div>
    <div class="card-full" id="hook"><div class="num">${nn} / ${tt}</div><div class="kicker"><span></span>${o.kicker || "New in Lleverage"}</div>
    <h1>${o.title}</h1><p>${o.line}</p>${o.extra ? `<div class="extra">${o.extra}</div>` : ""}<div class="mark"><span data-logo></span></div>${o.cardRight ? `<div class="by">${o.cardRight}</div>` : ""}</div>`);
}
