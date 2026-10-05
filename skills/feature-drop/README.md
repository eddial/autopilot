# Feature drop: a Claude skill

Turns what shipped in Lleverage into a weekly, review-ready LinkedIn feature
drop: a shortlist to pick from, then for the picked features a 4:5 clip each
(built on the real product UI), a combined video, a LinkedIn carousel PDF,
posts (weekly, per feature, optional spokesperson) and a drop page to review
and share. It never posts anything itself.

See `examples/2026-w39/` for the first drop it made (open `index.html`, play
the MP4s).

## Install (Claude Code)

```sh
mkdir -p ~/.claude/skills
unzip feature-drop.zip -d ~/.claude/skills/        # creates ~/.claude/skills/feature-drop
```
Start a new Claude Code session. Check with `/skills` or ask "what skills do
you have?"; it is called `feature-drop`.

## What it needs

| Need | Why |
| --- | --- |
| **Read-only access to `lleverage-ai/lleverage`**: GitHub (`gh auth login`) and a local checkout with `pnpm install` done | To check what shipped (merged PRs, descriptions, feature flags) and as the UI source: every clip rebuilds the real screens from `apps/app/src`, icons come from its `node_modules`. Tell Claude where the checkout is. |
| Slack connector with access to #change-log | What shipped, in the team's words |
| Node 20+, ffmpeg | Rendering (`brew install node ffmpeg`) |
| Playwright 1.57 + Chromium | Rendering frames; the skill installs it in a scratch folder on first run |
| Claude's Artifact tool (claude.ai account in Claude Code) | Publishing the private drop page |
| `delta:lleverage-content-voice` skill | Brand voice; the skill loads it before writing |
| Read access to `lleverage-ai/lleverage-design-system` (optional) | To check the bundled design-system kit is current and update it (`references/design-system.md`); the kit itself is included |

## Run it

Open Claude Code in the repo or folder where drops should live, then:

1. "Do a feature drop for last week" → you get a ranked shortlist of what
   shipped, with evidence and proposed names. Nothing is built yet.
2. Reply with your pick (usually three features) and confirm the names →
   Claude builds the clips, combined video, carousel, posts and drop page, in
   `marketing/feature-drops/<year>-w<week>/`.
3. Review the drop page link it sends, ask for changes, then post what you
   choose yourself.

A full drop takes about an hour, most of it rendering.

## What's inside

```
SKILL.md                 the workflow (8 steps, each with a done check)
references/narrative.md  the autonomous back office framing, processes, differentiators, vocabulary
references/copy.md       copy templates, limits, hooks, emoji rules, copy check
references/formats.md    exact specs for every output
references/build.md      setup, commands, how to write a clip timeline
references/design-system.md  the brand layer: the bundled design-system kit, rules, updating
references/app-ui.md     the real Lleverage UI, with source paths
references/qa.md         definition of done
toolkit/                 clip engine, renderers, icons, design-system kit, page/carousel/clip templates
examples/2026-w39/       the first drop
```

## Keeping it good

When something gets corrected in review (a name, a tone, a format), add it
to the relevant reference file and to "What earlier drops taught us" in
`SKILL.md`, so the next run gets it right the first time.
