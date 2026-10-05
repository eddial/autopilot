---
description: Add a workstream or signal — short interview, writes the file
argument-hint: <workstream or signal name>
---

Add `$ARGUMENTS` to Autopilot. If it names a source (gmail, slack,
linear, github, or another connector), it is a signal; otherwise a
workstream. Ask if unclear.

## Workstream

Ask, one question at a time, at most four:
1. What lands here? (people, customers, topics, kinds of requests)
2. What is urgent? (becomes the `Urgent:` line)
3. Which repo do sessions run in? (a directory under `repos_dir`, or autopilot)
4. How should the work be done? (language, sources of truth, tone)

Write `workstreams/<name>.md` in the format of `workstreams/daily-support.md`:
frontmatter `repo:`, then `## Routing` (ending with the `Urgent:` line) and
`## Work`. Check the Routing does not overlap other workstreams; if it does,
propose the boundary. Then create the Linear project `<name>` in the team
from `autopilot.yaml` and show the file.

## Signal

List the connector's tools (as `/mcp` shows them) and pick only
read/search tools. Ask what counts (whose messages, which channels) and
what to skip, and how often (`every:`).

Write `signals/<name>.md` in the format of `signals/gmail.md`, with
`paused: true`. Then preview: do what a signal run would do for the last
hour — fetch with the read tools, apply the filing rules in
`instructions.md` against the Routing of every workstream — but **do not
create, update or attach anything**. Show a table: item, action
(would create / would update / drop), workstream, priority, reason.

Ask whether to enable it. On a yes, remove the `paused:` line; the next
tick starts it from now, without backfill. Commit the file.
