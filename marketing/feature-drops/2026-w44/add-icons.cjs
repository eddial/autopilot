// Add Font Awesome Pro icons from the Lleverage app's node_modules to fa-icons.js in this folder.
// Usage: node add-icons.cjs faName s:faName ...   (s: = pro-solid). LLEVERAGE_REPO defaults to ~/Sites/lleverage.
const fs = require("fs"), path = require("path");
const repo = process.env.LLEVERAGE_REPO || path.join(process.env.HOME, "Sites/lleverage");
const base = path.join(repo, "apps/app/node_modules/@fortawesome");
const reg = require(path.join(base, "pro-regular-svg-icons")), sol = require(path.join(base, "pro-solid-svg-icons"));
const file = path.join(__dirname, "fa-icons.js"), src = fs.readFileSync(file, "utf8");
const m = src.match(/^const FA = (\{.*?\});$/m), FA = JSON.parse(m[1]);
for (const n of process.argv.slice(2)) {
  const solid = n.startsWith("s:"), icon = (solid ? sol : reg)[solid ? n.slice(2) : n];
  if (!icon) { console.log("missing", n); continue; }
  const [w, h, , , p] = icon.icon; FA[n] = [w, h, Array.isArray(p) ? p.join(" ") : p];
}
fs.writeFileSync(file, src.replace(m[1], JSON.stringify(FA)));
console.log(Object.keys(FA).length, "icons");
