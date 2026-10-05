---
cron: 30 3 * * *
tools: [Read, Glob, Grep, Edit, Write, Bash(tail:*), Bash(wc:*), mcp__claude_ai_Linear__list_issues, mcp__claude_ai_Linear__get_issue, mcp__claude_ai_Linear__list_comments, mcp__claude_ai_Linear__list_projects, mcp__claude_ai_Linear__save_issue, mcp__claude_ai_Linear__save_comment, mcp__claude_ai_Linear__list_issue_labels]
---
# Dream

Review the last 24 hours of Autopilot's decisions against what the owner did
in Linear, improve the routing, and write the night's journal.

## Read

1. `.state/decisions.jsonl`: every line with `ts` in the last 24 hours.
2. The current state of every issue those lines created or updated:
   project, priority, status, and whether any work happened (comments
   beyond the signal's, a session, a status past Triage).
3. Issues in the team created by hand in the last 24 hours: no
   `autopilot` label and no source attachment.
4. The current `workstreams/*.md`, `signals/*.md` and `instructions.md`,
   and the last few `dreams/*.md` for patterns seen before.

## Learn

| What happened | Meaning | Fix |
| --- | --- | --- |
| Issue moved to another project | Wrong workstream | Routing of both workstreams |
| Priority changed | Urgency misjudged | That workstream's "Urgent" line |
| Canceled from Triage, no work done | Should have been dropped | What counts as relevant (the Routing it was filed under) |
| Manual issue matching a dropped item | Missed item | Routing of its workstream |
| Manual issue no signal fetched | Coverage gap | Proposal for the signal file |
| Two issues for one source | Dedupe miss | Proposal for instructions.md |

A pattern counts when it is seen at least twice, today or across today
and earlier dreams. One-offs go in the journal only.

## Change

- Edit only the `## Routing` sections of `workstreams/*.md`. Keep each
  section under 40 lines by merging and generalising, not appending.
  Never touch `## Work`, frontmatter, or any other file except the journal.
- Everything else (signals, instructions, Work sections) becomes a
  proposal: one Linear issue in Autopilot's own project (named in the
  context above), status Triage,
  priority 3, labels `autopilot`, describing the pattern, the issues
  behind it and the exact suggested edit. Check first that an open
  proposal for the same thing does not already exist; comment on it instead.

## Write

`dreams/YYYY-MM-DD.md` (today's date):

```
# Dream YYYY-MM-DD

| Fetched | Filed | Re-filed | Re-prioritised | Canceled unused | Misses | Gaps |
| --- | --- | --- | --- | --- | --- | --- |
| n | n | n% | n% | n | n | n |

## Changes
- <workstream>: <what changed> (AP-1, AP-7)
  - before: `<the exact line(s) replaced, or "none" for an added line>`
  - after: `<the exact new line(s)>`

## Proposals
- AP-12: <one line>

## Notes
- <one-offs worth watching>
```

Gaps come from `.state/state.json` (`jobs.*.gaps` and failing jobs).

The home is not in git: the journal is the only record of tonight's
edits, so every change lists its exact before and after lines, enough to
undo it by hand. Write the journal even when nothing changed.

Reply with a one-line summary.
