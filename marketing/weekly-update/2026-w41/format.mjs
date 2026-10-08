// The output format every toolkit script shares, from the environment. Portrait and square layouts are 1080 px
// wide and the ratio sets their height; landscape layouts (wider than 1:1, e.g. 4:3) are 1080 px tall and the
// ratio sets their width. The output size sets the pixel density.
//   CLIP_SIZE     output size, e.g. 1080x1350 (4:5, default), 1440x1800 (4:5, sharper), 1080x1080 (1:1), 1080x1920 (9:16),
//                 1440x1080 (4:3, landscape)
//   CLIP_SCALE    older form: 4:5 at this density (1.3333333 → 1440 x 1800); ignored when CLIP_SIZE is set
//   CLIP_FPS      frame rate, default 60
//   CLIP_BITRATE  final video's average bitrate (e.g. 8M); without it, quality-based CRF 18
// Pages get the layout size as ?w=<px>&h=<px> (clip.js sets --frame-w and --frame-h from them).
const BASE = 1080;

function parse() {
  const size = process.env.CLIP_SIZE;
  if (size) {
    const m = /^(\d+)\s*[x×:]\s*(\d+)$/i.exec(size.trim());
    if (!m) throw new Error(`CLIP_SIZE ${size}: expected <width>x<height>, e.g. 1080x1080`);
    const w = Number(m[1]), h = Number(m[2]);
    if (w > h) {
      // Landscape: 1080 tall, the stage takes the full width under the captions and the "find it" row.
      const layoutW = Math.round((BASE * w) / h);
      if (w / h > 16 / 9 + 0.01) throw new Error(`CLIP_SIZE ${size}: wider than 16:9 is not supported`);
      return { scale: h / BASE, layoutW, layoutH: BASE, outW: w, outH: h };
    }
    return { scale: w / BASE, layoutW: BASE, layoutH: Math.round((BASE * h) / w), outW: w, outH: h };
  }
  const scale = Number(process.env.CLIP_SCALE) || 1;
  return { scale, layoutW: BASE, layoutH: 1350, outW: Math.round((1080 * scale) / 2) * 2, outH: Math.round((1350 * scale) / 2) * 2 };
}

const f = parse();
if (f.outW % 2 || f.outH % 2) throw new Error(`output ${f.outW}x${f.outH}: H.264 needs even width and height`);
export const SCALE = f.scale;
export const LAYOUT_W = f.layoutW, LAYOUT_H = f.layoutH;
export const WIDE = LAYOUT_W > LAYOUT_H;
export const OUT_W = f.outW, OUT_H = f.outH;
export const FPS = Number(process.env.CLIP_FPS) || 60;
export const BITRATE = process.env.CLIP_BITRATE || "";
export const VIEWPORT = { width: LAYOUT_W, height: LAYOUT_H };
export const CLIP = { x: 0, y: 0, ...VIEWPORT };
// Query string for a page: the layout size, plus anything extra.
export const query = (extra = "") => `?record&w=${LAYOUT_W}&h=${LAYOUT_H}` + (extra ? "&" + extra : "");
// x264 rate control for the final video: an average bitrate with headroom, or CRF 18.
export function rateArgs() {
  if (!BITRATE) return ["-crf", "18"];
  const n = parseFloat(BITRATE), unit = BITRATE.replace(/^[\d.]+/, "");
  return ["-b:v", BITRATE, "-maxrate", `${n * 1.5}${unit}`, "-bufsize", `${n * 2}${unit}`];
}

// node format.mjs → shell variables for combine.sh
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`W=${OUT_W} H=${OUT_H} FPS=${FPS} RATE="${rateArgs().join(" ")}"`);
}
