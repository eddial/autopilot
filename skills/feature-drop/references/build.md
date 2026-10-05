# Building a drop

## Setup (once per machine)

| Need | How |
| --- | --- |
| Node 20+ and ffmpeg | `node -v`, `ffmpeg -version` |
| Playwright 1.57 + Chromium | `npm i playwright@1.57` in a scratch folder; run scripts with `NODE_PATH=<that folder>/node_modules`. If Chromium is missing: `npx playwright install chromium` |
| **Read-only access to the `lleverage-ai/lleverage` monorepo** (GitHub + a local checkout with `node_modules` installed) | Required, for two things: (1) checking what shipped: merged PRs, their descriptions and feature flags (`gh pr list/view`); (2) the UI source for the videos: every clip rebuilds the real screens from `apps/app/src`, and icons are extracted from its `node_modules`. Read-only is enough; the skill never writes to it. Default path `~/Sites/lleverage`; use yours |
| Read access to Slack #change-log and the GitHub repo | For the shortlist and the facts |
| The Artifact tool (Claude) | To publish the drop page |

## 1. Start the folder

```sh
W=marketing/feature-drops/2026-w41          # ISO week of the drop
mkdir -p $W && cp skills/feature-drop/toolkit/*.* $W/
cp skills/feature-drop/toolkit/templates/*.html $W/
```
`toolkit/` holds the engine (`clip.css`, `clip.js`, `app.css`, `app.js`,
`fa-icons.js`) and the renderers (`render.mjs`, `carousel.mjs`, `weekly.sh`).
`toolkit/templates/` holds the page, carousel and card templates and three
clip templates. Then update the week: replace "Week 39", "22 Sep – 3 Oct
2026" and the week-39 feature names in `index.html`, `carousel.html`,
`weekly-cards.html` and the clips' brand row; remove clip templates you do not
use, and rewrite every text from `copy.md`.

## 2. Pick a clip template per feature

| The feature lives in… | Start from | It already has |
| --- | --- | --- |
| the agent chat, voice, Overview or dashboards | `talk-to-llev.html` | sidebar, Overview widgets, agent sidebar, composer, voice status, chart |
| data tables, dialogs, lists, boards | `kanban-board.html` | table page, toolbar, grid, Columns dialog, select menu, board lanes, drag |
| skills, tests, editors, side panels | `skill-tests.html` | skill page, editor fields, side panel tabs, test list, results card, diff lines |

Rename it to the feature's slug. Then **read the real components** for the
feature in the Lleverage repo (`apps/app/src`) and change the markup and CSS
to match them: classes, sizes, colours, labels, icons. `app-ui.md` lists the
components already mapped; add what you read.

## 3. Write the timeline

Everything is a function of time `t` (seconds of clip time); no CSS
animations, no timers. In the clip's script:

- `C.captions([[start, end, html], …])` → call the returned function with `t`.
- `C.camera(appEl, 952, 900, [[t, x, y, scale], …])` → `(x, y)` is the app
  point centred in the stage.
- Measure targets with `at(el)` (app coordinates of an element's centre) and
  map them through the camera at the click time: `F(t, at(el))`.
- `C.cursor([[t, frameX, frameY, click?], …])`.
- `C.hook(el, t, 2.2)`, `C.endcard(el, t, 17)` for the cards.
- Inside `C.run(D, (t) => { … })` set every state from `t`: which panel is
  open, typed text (`C.type`), what is visible (`C.show`), status labels.
- Icons: `fa("faName")`, `fa("s:faName")` (solid), `lu("name")` (lucide).
  Missing icon → extract it (`app-ui.md`), add it to `fa-icons.js`.

Beats: one caption per beat; give each beat at least 4s of clip time; the
camera moves at the start of a beat, then holds.

## 4. Check stills before rendering

```sh
node stills.mjs <slug>.html check 1 5 9 13 16 19    # writes check-<t>.png
```
Take one still per beat plus the title and end card (e.g. t = 1, 5, 9, 13,
16, 19). Look at every one. Fix before rendering. See `qa.md`.

## 5. Render

```sh
cd $W
export NODE_PATH=<scratch>/node_modules
node render.mjs talk-to-llev.html 10      # poster at clip second 10
node render.mjs kanban-board.html 9
node render.mjs skill-tests.html 9
node carousel.mjs                         # after the clip MP4s exist and stills are extracted
./weekly.sh                               # edit the seg lines first
```
- Render one file at a time, in the background; each takes a few minutes.
- `render.mjs` retries frames that stall; if a render still fails, run it
  again on its own.
- Options: `CLIP_SPEED` (default 0.85), `CLIP_FROM`, `CLIP_UNTIL`,
  `CLIP_QUERY` (`chapter=…`), `CLIP_OUT`.

## 6. Verify

```sh
for f in *.mp4; do echo "$f $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done
ffmpeg -ss <t> -i <file>.mp4 -frames:v 1 check.png     # and look at it
```
Expect ~22–24s per clip and ~65s for `weekly.mp4`. Pull frames from the start,
middle and end of every file, and the first frame of every chapter.

## 7. Publish and commit

- Publish `index.html` with the Artifact tool, passing every MP4, poster,
  `weekly-cover.png` and `carousel-*.png` as `files`. It is private; the
  reviewer shares it.
- Commit the folder on a branch and push. Never post to LinkedIn, Slack or
  anywhere else.
