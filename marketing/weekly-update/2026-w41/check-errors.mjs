// Print page errors and console errors of a clip, to run before stills: node check-errors.mjs <clip.html>
import { createRequire } from "node:module"; import path from "node:path";
import { VIEWPORT, query } from "./format.mjs";
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const b = await chromium.launch(); const p = await b.newPage({ viewport: VIEWPORT });
p.on("pageerror", (e) => console.log("ERR", e.message)); p.on("console", (m) => m.type() === "error" && console.log("CON", m.text()));
await p.goto("file://" + path.resolve(process.argv[2]) + query()); await p.waitForTimeout(500); await b.close();
