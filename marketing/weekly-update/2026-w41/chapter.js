// Chapter shell for a video of several features: brand row, captions host, footer and the chapter intro.
// CHAPTER({ n, total, module, title: "Line one<br><em>line two.</em>", line, footerLeft?, footerRight? })
// module: the product module the feature lives in ("Workflows", "Data tables"). It is the brand row's tag and the
// chip above the title, so the viewer knows where to find it without a click path.
// The intro is #hook: the chapter title, in the captions' place, before the first caption (the module is in the brand row).
// line is kept for the changelog and older formats; the video does not show it.
function CHAPTER(o) {
  const f = document.querySelector(".frame"), nn = String(o.n).padStart(2, "0");
  const tot = o.total || 5, segs = Array.from({ length: tot }, (_, i) => `<i class="${i + 1 < o.n ? "done" : i + 1 === o.n ? "cur" : ""}"><b></b></i>`).join("");
  f.insertAdjacentHTML("afterbegin", `<div class="brandrow has-prog"><div class="logo"><span data-logo></span></div><div class="tag">${o.module || o.tag}</div><div class="prog">${segs}</div></div><div class="captions"></div>`);
  f.insertAdjacentHTML("beforeend", `<div class="footer"><span>${o.footerLeft || "lleverage.ai"}</span><span>${o.footerRight || nn + " / " + String(o.total || 5).padStart(2, "0")}</span></div>
    <div class="intro" id="hook"><h1>${o.title}</h1></div>`);
}
