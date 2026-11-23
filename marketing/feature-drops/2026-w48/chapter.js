// Chapter shell for a video of several features: brand row, captions host, footer and the chapter's opening.
// Two forms, matching clip.js's styles. Call before C.run.
//
// Classic, a numbered title card (#hook.card-full) that slides away (C.hook($("#hook"), t, 1.5)):
//   CHAPTER({ n, total, tag, kicker, title: "Line one<br><em>line two.</em>", line, extra?, where?, footerLeft?, footerRight?, cardRight? })
//   where: a label for the "find it" row (default "Find it"); fill its path with C.where([[t, step], ...]).
//   A consuming skill wraps it to add its own parts (daily-merge-report adds the PRs and who built it).
//
// Canvas (?style=canvas), when `module` is given: the product module the feature lives in ("Workflows", "Data
// tables") is the brand row's tag; under the logo a chapter line has one segment per chapter (earlier ones full, this
// one filling as it plays); the title (#hook.intro) takes the captions' place before the first caption. run() drives it.
//   CHAPTER({ n, total, module, title, line?, footerLeft?, footerRight? })   footerRight defaults to "nn / tt".
//   line is not shown; keep it for the changelog.
function CHAPTER(o) {
  const f = document.querySelector(".frame"), nn = String(o.n).padStart(2, "0"), tt = String(o.total || 5).padStart(2, "0");
  if (o.module) {
    const segs = Array.from({ length: o.total || 5 }, (_, i) => `<i class="${i + 1 < o.n ? "done" : i + 1 === o.n ? "cur" : ""}"><b></b></i>`).join("");
    f.insertAdjacentHTML("afterbegin", `<div class="brandrow has-prog"><div class="logo"><span data-logo></span></div><div class="tag">${o.module}</div><div class="prog">${segs}</div></div><div class="captions"></div>`);
    f.insertAdjacentHTML("beforeend", `<div class="footer"><span>${o.footerLeft || "lleverage.ai"}</span><span>${o.footerRight || nn + " / " + tt}</span></div>
    <div class="intro" id="hook"><h1>${o.title}</h1></div>`);
    return;
  }
  f.insertAdjacentHTML("afterbegin", `<div class="brandrow"><div class="logo"><span data-logo></span></div><div class="tag">${o.tag} · ${nn}</div></div><div class="captions"></div>${o.where ? `<div class="where"><span class="lbl">${o.where === true ? "Find it" : o.where}</span><span class="path"></span></div>` : ""}`);
  f.insertAdjacentHTML("beforeend", `<div class="footer"><span>${o.footerLeft || "lleverage.ai"}</span><span>${o.footerRight || ""}</span></div>
    <div class="card-full" id="hook"><div class="num">${nn} / ${tt}</div><div class="kicker"><span></span>${o.kicker || "New in Lleverage"}</div>
    <h1>${o.title}</h1><p>${o.line}</p>${o.extra ? `<div class="extra">${o.extra}</div>` : ""}<div class="mark"><span data-logo></span></div>${o.cardRight ? `<div class="by">${o.cardRight}</div>` : ""}</div>`);
}
