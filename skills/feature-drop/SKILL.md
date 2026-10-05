---
name: feature-drop
description: Produce the weekly Lleverage feature drop from what shipped - a shortlist to pick from, then for the picked features a 4:5 animated clip each built on the real product UI, a combined video with every feature as a titled chapter, a LinkedIn carousel PDF, LinkedIn posts (weekly, per feature, optional spokesperson) and a drop page to review and share. Use for "feature drop", "what shipped for LinkedIn", "clips and posts for this release", or when a shortlist pick comes in.
---

# Feature drop

Turns what shipped in Lleverage into a ready-to-review LinkedIn feature drop.
Anyone running it should end up with the same set of outputs, in the same
style, as the first drop, bundled in `examples/2026-w39/` (open its
`index.html` and the MP4s to see the result).

## What you deliver

| Output | File(s) |
| --- | --- |
| Shortlist of what shipped, ranked | a message to the reviewer |
| One clip per feature, 4:5, ~23s | `<slug>.mp4` (+ `<slug>.html` source, `<slug>.png` poster) |
| Combined weekly video, ~65s, one titled chapter per feature | `weekly.mp4` |
| LinkedIn carousel, N + 2 pages | `carousel.pdf`, `carousel-*.png` |
| Posts: one weekly, one per feature, optional spokesperson post | on the drop page |
| Drop page with everything, to review and share | `index.html`, published as a private Artifact |

Nothing is ever posted by this skill. A person reviews, picks and posts.

## What it needs

- **Read-only access to the Lleverage monorepo** (`lleverage-ai/lleverage`, on
  GitHub and as a local checkout with dependencies installed). It is used to
  check what shipped (merged PRs, descriptions, feature flags) and as the UI
  source for the videos (every clip rebuilds the real screens from the code).
  The skill never writes to it.
- Read access to Slack #change-log.
- Node, ffmpeg and Playwright (`references/build.md`), and the Artifact tool
  to publish the drop page.

## Read first

| File | When |
| --- | --- |
| `references/narrative.md` | Always. The autonomous back office: core frame, ICP, how autonomy is earned per step, where people belong, trust, value language, processes, differentiators, vocabulary. |
| `references/copy.md` | Before writing any text. Templates, limits, hooks, emoji rules, copy check. |
| `references/formats.md` | Before building. Exact specs for every output. |
| `references/build.md` | When building and rendering. Setup, commands, timeline guide. |
| `references/app-ui.md` | When rebuilding a screen. The real UI, with source paths. |
| `references/qa.md` | Before hand-over. Definition of done. |

Also load `delta:lleverage-content-voice` before writing.

## Steps

### 1. Gather what shipped
Read Slack #change-log for the window (default: the previous ISO week) and
the merged PRs in `lleverage-ai/lleverage` for the same dates. Keep changes a
customer can see. For each: what it does, the change-log permalink, the PR(s),
and whether a feature flag is involved.
*Done when* every candidate has evidence and a flag status.

### 2. Shortlist, then stop
Rank the candidates by marketing value: customer-visible, differentiating,
easy to show on screen. One line each: what it is, why it matters (role in the
story), the angle, the evidence link, flag status, and a proposed marketing
name. Send it to the reviewer and **build nothing until they pick** (default
three features) and confirm the names.
*Done when* the reviewer has picked and the names are confirmed.

### 3. Place each feature in the story
For each picked feature answer the five questions in `narrative.md`
(what it lets someone do, who it is for, what it moves, which differentiator,
which process gives the example). Choose the example data (orders, invoices,
a named ERP).
*Done when* each feature has its five answers written down.

### 4. Write the copy
Using the templates in `copy.md`: title card, 3–4 captions and end card per
clip; weekly cover and end; the weekly post, one post per feature, optional
spokesperson post; carousel pages; the "why" paragraph per feature.
*Done when* the copy check in `copy.md` passes.

### 5. Build the clips
Start the week's folder and pick a clip template per feature (`build.md`).
Read the feature's real components in the Lleverage repo and rebuild them
faithfully (`app-ui.md`). Write the timeline. Take stills for every beat and
look at them before rendering.
*Done when* every still passes the video checks in `qa.md`.

### 6. Render everything
Clips one at a time, then the carousel stills and `carousel.pdf`, then
`weekly.sh` (`build.md`, `formats.md`).
*Done when* durations and frames match `formats.md`.

### 7. Check
Go through `qa.md` top to bottom. Fix and re-render; do not hand over with
known issues.

### 8. Publish and hand over
Publish `index.html` as a private Artifact with all media, commit and push the
folder, and send the reviewer:

```
Feature drop week <NN> is ready to review: <drop page link>
- <Feature>: <what the clip shows> (<role in the story>)
- <Feature>: …
Formats: per-feature clips, combined video (<length>), carousel (<pages> pages), weekly + per-feature posts<, spokesperson post>.
Source: <folder> on <branch> (<commit>).
Decision needed: which format and which posts go out, and any copy changes.
```

If the drop is tracked somewhere (an issue, a ticket, a thread), post the
same message there and mark it ready for review.

## Rules that never change

- The video shows the feature; the posts tell the story. No value claims or
  slogans in the video.
- The autonomous back office: the ERP stays the system of record, Lleverage
  operates the work around it, and autonomy is earned per step (by hand →
  assisted → supervised → autonomous) on evidence. People get asked only for
  the decisions that need them. Never claim "AI runs everything".
- One framing everywhere (`narrative.md`): people off the repetitive data work
  and onto the hard cases and the process, steering the AI; check copy against
  its five principles. Say it in plain sentences, never as a tagline.
- Real product UI from the codebase; never a lookalike.
- ERP examples (orders, invoices, POs, a named ERP); features stay generic, so
  no process or domain labels on cards.
- Marketing names for features; on-screen labels as the app shows them;
  "voice call"; never "coworker".
- Facts from the change log and PRs only; flagged features are never "live".
- Same specs every week (`formats.md`). Change a format only after the
  reviewer has seen the current one.
- Draft only: never post, send or share anything yourself.

## What earlier drops taught us

- Brand-styled lookalike screens were rejected; screens rebuilt from the
  codebase were accepted.
- Generic demo data ("runs", "workflows") did not land; orders and invoices did.
- Slogans and value-prop titles in the video felt sloppy; functional video
  with the message in the posts worked.
- The combined video was unclear when cut to key moments (29s, 13s) and too
  fast; full chapters with a title card per feature at 0.85 speed worked.
- Process labels on cards were wrong because features are generic.
- Exceptions have owners: an order without the customer's PO goes to the
  order desk, not purchasing. Check before writing.
- A person reviewing a page must see every version before it is changed
  again; do not iterate on a format they have not seen.
- One drop, one session: two sessions editing the same folder and drop page
  overwrite each other.
