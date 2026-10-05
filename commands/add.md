---
description: Add a workstream or signal — short interview, writes the file
argument-hint: <workstream or signal name>
---

Add `$ARGUMENTS` to Autopilot. First run `node ~/.claude/skills/autopilot/runtime/tick.ts where`:
it prints the engine directory and the Autopilot home (default `<engine>/home`). All files below
are in the home; examples (files starting with `_`) are in the engine's `home/`.

If it names a source (gmail, slack, linear, github, lleverage, fathom, or any other connector), it is a signal;
otherwise a workstream. Ask if unclear.

## Workstream

Ask, one question at a time, at most four:
1. What lands here? (people, customers, topics, kinds of requests)
2. What is urgent? (becomes the `Urgent:` line)
3. Does the work change code? Only then it gets a repo (a directory under `repos_dir`, a path,
   or `autopilot` = the engine), worked on a branch per issue. Otherwise no repo: sessions
   run in the Autopilot folder, or in a `folder:` (a path) when the work belongs in one.
4. How should the work be done? (language, sources of truth, tone)

Write `workstreams/<name>.md`, starting from the closest example in the engine's
`home/workstreams/_*.md` (customers, company, product-marketing, engineering with a repo):
frontmatter `repo:` only for a workstream with a repo (or `folder:` for one with its own folder), then `## Routing` (ending with the `Urgent:` line) and
`## Work`. Check the Routing does not overlap other workstreams; if it does,
propose the boundary. Then create the Linear project `<name>` in the team
from `autopilot.yaml` and show the file.

## Signal

If `signals/_<name>.md` exists in the engine's `home/`, start from that example
(gmail, slack, linear, github, lleverage, fathom, and weekly-digest for a `cron:` digest). List the connector's
tools (as `/mcp` shows them) and pick only read/search tools. Ask what counts
(whose messages, which channels) and what to skip, and how often (`every:`).

Write `signals/<name>.md` with `paused: true`. Then preview the last hour with
`node <engine>/runtime/tick.ts signal <name> --dry=60`: it applies the filing
rules with read-only Linear tools and files nothing. Show a table: item,
action (would create / would update / drop), workstream, priority, reason.

Ask whether to enable it. On a yes, remove the `paused:` line and make sure
the team has a label named after the signal; the next tick starts it from now,
without backfill.
