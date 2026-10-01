---
description: Show the logged decision behind an issue and propose a one-line routing fix
argument-hint: <issue id, e.g. BADR-123>
---

Explain why Autopilot filed `$ARGUMENTS` the way it did.

1. Find its lines in `.state/decisions.jsonl` (`grep '"issue":"$ARGUMENTS"'`
   and lines with the same `source_url`). Fetch the issue from Linear:
   project, priority, status, attachments, history if available.
2. Show: the source item (from, subject, snippet), what the signal decided
   (action, workstream, priority, reason, window), and what the issue
   looks like now. If nothing is logged, say it was likely created by hand.
3. If the issue was misfiled (Badr moved it, changed priority, or says
   so), read the Routing sections involved and propose **one line** to add
   or change in one workstream's `## Routing` that would have routed it
   right, without breaking the others. Show it as a diff.
4. On a yes, apply it and commit `autopilot(why): <issue> <summary>`.
