---
name: feature-drop
description: Turn the features Badr picked from a product-marketing shortlist into a weekly feature drop - a 4:5 animated clip per feature built on the real Lleverage UI, a ~30s combined video, a 5-page LinkedIn carousel PDF, LinkedIn posts and a drop page published as an artifact. Use in the product-marketing workstream once Badr has picked from the shortlist, or when asked for "a feature drop", "clips for this week", "the weekly LinkedIn post".
---

# Feature drop

One drop per week, made from what shipped. The first one is AP-10, worked
example in `marketing/feature-drops/2026-w39/` (its drop page is
https://claude.ai/artifact/WMcxSyuDMu8XB5WcYsqBKW). Read that folder before
building a new drop; copy from it rather than starting from nothing.

The order of work never changes: **shortlist → Badr picks → build → review → hand over.**
Build nothing before the pick (see the workstream's Work section).

## 1. The story every drop tells

The autonomous back office. Say it the same way every time:

> Nobody should spend their day copying an order from an email into the ERP,
> or checking an invoice line by line against a PO. The routine runs on its
> own. People work **on the process, not in it**: they take the cases that need
> judgement, and they steer the agents (set the rules, check the work, correct
> mistakes, decide what can run without them).

Every feature does one of two things, and the copy says which:
1. it takes repetitive work off people, or
2. it gives people a better way to steer the agents or handle the hard cases.

Rules that follow from it:
- **ERP work as the example**: orders, invoices, POs, three-way matching,
  booking in Exact / Business Central / SAP, customer price lists, article
  codes. Not generic "runs", "records" or "tasks".
- **Features are generic.** Do not label a card or chapter with a process or
  domain ("Quote & Sell", "Pay & Collect"). Let the example speak to the
  process; name the feature instead ("1 / 3 · Talk to Llev").
- The website's processes (lleverage.ai, re-check when unsure): Quote & Sell
  (quotes, order entry, confirmations), Source & Procure (invoices and POs),
  Plan & Produce, Deliver & Support, Pay & Collect (3-way matching,
  reconciliation, debtor reminders), Govern & Enable (master data). Reuse its
  phrasing: "with a person on the exceptions", "invoices inside tolerance book
  themselves", "clean orders post on their own".
- **Never call the agent a "coworker"** (or co-worker, colleague-as-agent).
  Describe what it does instead.

## 2. Copy

Visuals may be flashy; **text is plain and grounded**. Follow
`delta:lleverage-content-voice` (load it), plus:

- Captions and cards say what happens: "Move it to Ready to book.", "See which
  check failed and why." No slogans ("It's done.", "Not a suggestion.").
- Two lines per caption, second line in orange (`<em>`), at most ~32
  characters a line. One caption per beat, 3–4 beats per clip.
- **LinkedIn posts open with a catchy, concrete first line**: a statement or a
  mild provocation, not a question, no emoji. Examples that worked:
  "The fastest report on your order backlog is now a phone call." ·
  "Finance should only ever see the invoices that don't match." ·
  "An AI that guesses a PO number is worse than no AI at all." ·
  "People should work on the process, not in it."
- Body: problem first, then what shipped, then the role it gives people. Short
  paragraphs. End with where the clips are (first comment), not a generic CTA.
- **Emojis**: none in the first line; at most one or two that do a job (→ for
  list items, ✅/❌ for what posts vs what goes to a person); no hype emojis
  (🚀🔥🤯💡👇); 📦 at the end of the weekly post as the series marker.
- Facts come from #change-log and the PR descriptions only. **Never present a
  feature-flagged change as available**; check the PR for a flag. Use the
  feature's real name and real UI words (e.g. the voice button is "Call the
  agent"; board view is switched in the Columns dialog, "List | Board").
- Data in clips is illustrative (Dutch-sounding supplier/customer names, PO
  numbers like 4500012877); say so on the drop page.
- Personal post for Badr: one opinion tied to the narrative, draft only.

## 3. Design: the real product, not a lookalike

Every clip rebuilds the real Lleverage app UI from the codebase
(`~/Sites/lleverage`, `apps/app/src`). Before animating a feature, read the
components that render it and mirror their classes, colours, radii, copy and
icons. `references/app-ui.md` has the shell, tokens and the components used so
far, with file paths; extend it when you read new ones.

- Tokens, shell (muted frame, 240px sidebar, rounded `bg-background` panel),
  Public Sans at 13px base: `toolkit/app.css` + `toolkit/app.js`.
- Icons are Font Awesome Pro (regular / solid) and lucide, taken from the app's
  `node_modules`. `toolkit/fa-icons.js` has the ones used so far; extract more
  with the snippet in `references/app-ui.md`.
- The app is rendered at real size (1280×800) inside the clip's stage and a
  **camera** zooms to the action (≈0.74 establishing shot, 1.5–2.0 for the
  action), Linear-style.
- Frame chrome: brand row, captions above the stage, navy hook card (kicker
  with the Lleverage loader mark + "New in Lleverage", feature name) and end
  card ("Live now"), Public Sans, orange highlight. No serif.

## 4. Formats (make all of them; marketing picks)

| Output | Spec |
| --- | --- |
| One clip per feature | 1080×1350 (4:5), 18–20s, 30 fps, silent, captions burned in, loops. Hook card 0–2.2s → camera/UI → end card from ~17s. |
| Combined weekly video | **~13s**: 1.5s cover card, only the **payoff moment** of each clip (~2.5–3s: the chart landing, the card dropping, all tests passing; no per-clip hook/end cards) with chapter label "n / 3 · Feature", 2s end card. Built by `weekly.sh`. |
| Carousel PDF | 5 pages 1080×1350: cover (narrative headline + list), one page per feature (feature label, plain line, still from the clip), closing page. LinkedIn carousels are documents only; videos cannot go inside one. |
| Posts | One weekly post (works with the combined video or the carousel), one post per feature, one personal post for Badr. |
| Drop page | `index.html` published as an Artifact (private): narrative, Option 1 weekly post (video + carousel + copy), Option 2 per-feature clips + posts, personal post, how it is made. |

## 5. Build

1. Make the week's folder: `marketing/feature-drops/<YYYY>-w<NN>/`. Copy
   `toolkit/*` into it (engine, shell, icons, renderers), plus `index.html`,
   `carousel.html` and `weekly-cards.html` from
   `marketing/feature-drops/2026-w39/` as page/carousel/card templates. Copy
   the closest clip from that folder as the starting point for each feature
   (`talk-to-llev.html`: agent sidebar, voice, Overview widgets;
   `kanban-board.html`: data table, dialog, board, drag;
   `skill-tests.html`: skill page, side panel tests, results, diff).
2. Playwright: `npm i playwright@1.57` in your scratchpad and run everything
   with `NODE_PATH=<scratchpad>/node_modules`. ffmpeg is on PATH.
3. Write each clip's timeline: captions `[start, end, html]`, camera keys
   `[t, x, y, scale]`, cursor keys `[t, x, y, click]` (measure targets with the
   `at()` helper, map through the camera), state per `t` in `C.run(D, t => …)`.
   Everything is a function of `t`; no CSS animations.
4. **Review stills before rendering video**: `node` a few `seek(t)` screenshots
   (one per caption beat, hook, end) and look at them. Check: caption fits in
   two lines, camera shows the target, nothing overlaps, text matches the UI.
5. Render: `node render.mjs <clip>.html <posterSecond>` (one at a time, in the
   background; it retries stalled frames). Then `node carousel.mjs`, then
   `./weekly.sh` (edit its `seg` lines: clip, chapter label, from, until).
   Extract carousel stills with ffmpeg `crop=952:900:64:330` from the clips.
6. Verify: `ffprobe` durations (20/19/20, ~13 for weekly); check the first and last frame of every chapter (no empty slots mid-pan, results finished), and pull a frame or
   two from every MP4. Fix and re-render rather than explain.
7. Publish `index.html` with the Artifact tool, passing the MP4s, posters and
   carousel PNGs as `files`. Commit the folder (HTML, MP4, PNG, PDF) on the
   issue branch and push.

## 6. Hand over

Comment on the issue (`🤖 Autopilot · briefing`): the drop page link, one line
per feature (what it shows, the role it gives people), the formats ready, the
commit. Decision needed is usually which format and which posts go out. Move
the issue to Review. Never post anything yourself.

## Lessons from AP-10

- First versions looked "brand-styled", not like the product: always start
  from the codebase.
- Generic demo data ("runs", "workflows") was rejected: use orders and invoices.
- Slogans were rejected: keep text down to earth, keep the visuals lively.
- The combined video was too long at 58s and still too long at 29s: ~13s, payoff moments only.
- Domain labels on cards were wrong because features are generic.
- Order intake: an order without the customer's PO goes to the order desk,
  not to purchasing. Check who really owns an exception before writing it.
