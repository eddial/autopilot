# Formats

Every drop produces all of these. The marketing team chooses what goes out.
Keep the numbers; they are what makes drops look the same week after week.

## Per-feature clip

| Property | Value |
| --- | --- |
| Size | 1080 × 1350 (4:5), H.264, yuv420p, CRF 18, 30 fps, no audio |
| Timeline | ~20s of clip time, written in the clip HTML |
| Playback | rendered at **0.85 speed** (`CLIP_SPEED`, default) → ~22–24s file |
| Structure | 0–2.2s title card (slides up at 2.2) → app with camera, cursor and captions → end card fades in at ~17s and holds to the end |
| Captions | 3–4 beats, each ≥ 4s of clip time, 58px Public Sans 600, two lines max, second line orange |
| Frame chrome | brand row (logo + "Feature drop · Week NN" in orange caps), captions above the stage, stage 952 × 900 at (64, 330) with rounded border, footer "lleverage.ai · Live now" |
| Stage | the real app at 1280 × 800, moved by a camera: ≈0.74 establishing shot, 1.45–2.0 on the action; one camera move per beat, 0.5–0.7s long |
| Cursor | arrives 0.2–0.4s before a click; click ring on clicks; leaves the frame when idle |
| Data | illustrative ERP data (see `copy.md`) |
| Files | `<slug>.html` (source), `<slug>.mp4`, `<slug>.png` (poster at the clearest moment) |

Slugs are short and stable: `talk-to-llev`, `kanban-board`, `skill-tests`.

## Combined weekly video

| Property | Value |
| --- | --- |
| Length | ~65s for three features (≈ 2.5 + 3 × ~20 + 3) |
| Structure | 2.5s cover card → each clip from 0 (its title card announces the feature) up to its end card → 3s end card |
| Chapter label | top-right tag "n / N · <Feature name>" instead of "Feature drop · Week NN" |
| Speed | same 0.85 |
| Build | `weekly.sh` (edit the `seg` lines: clip, chapter label, from `0`, until the clip's end-card time) |
| File | `weekly.mp4`, cover still `weekly-cover.png` |

Do not cut chapters down to "key moments": that was tried at 29s and 13s and
was too fast and unclear. Change the length only after the reviewer has seen
the current version.

## Carousel (LinkedIn document post)

LinkedIn carousels are documents (PDF); videos cannot go inside them.

| Property | Value |
| --- | --- |
| Pages | N + 2: cover, one page per feature, closing page |
| Size | 1080 × 1350 per page, PDF via Playwright `page.pdf`, plus one PNG per page |
| Feature page | label "n / N · <Feature>" (22px orange caps) at y 150, headline 62px at y 196, sub line 27px at y 352, still 784 × 741 at (148, 520), page number bottom right |
| Stills | from the clip MP4: `ffmpeg -ss <t> -i <slug>.mp4 -frames:v 1 -vf crop=952:900:64:330 carousel-<slug>.png` at the moment the result is visible (chart landed, card dropped, results shown) |
| Files | `carousel.html` (source), `carousel.pdf`, `carousel-1.png` … `carousel-<N+2>.png` |

## Posts

| Post | Count | Attach |
| --- | --- | --- |
| Weekly company post | 1 | `weekly.mp4` or `carousel.pdf` |
| Per-feature company post | 1 per feature | `<slug>.mp4` |
| Spokesperson post (optional) | 0–1 | a clip or nothing |

Clips and the drop page link go in the first comment, not the post body.

## Drop page

`index.html`, published as a private Artifact; the reviewer shares it.
Sections, in order:
1. Header: "Feature drop · Week NN · <date range>", a headline, one-line lede,
   a note that nothing is posted and data is illustrative.
2. The story: the autonomous back office in three short paragraphs (from
   the framing in `narrative.md`, in plain words). Marked as guidance for the team.
3. **Option 1 · one weekly post**: combined video, carousel page strip, the
   weekly post with a Copy button.
4. **Option 2 · one post per feature**: per feature the clip, the "why"
   paragraph (role, differentiator, example), facts (length, change-log
   link, PRs), the post with a Copy button.
5. Spokesperson post, if any.
6. How it is made (one paragraph) and where the source is.

## Folder

`marketing/feature-drops/<YYYY>-w<NN>/` (ISO week of the drop), committed with
sources, MP4s, PNGs and the PDF. One folder per drop; never edit an older
drop's folder except to fix it.
