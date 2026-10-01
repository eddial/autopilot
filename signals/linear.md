---
paused: true             # remove once /add has previewed it
every: 10m
tools: [mcp__claude_ai_Linear__list_issues, mcp__claude_ai_Linear__get_issue, mcp__claude_ai_Linear__list_comments]
---
Issues in other teams' Linear (never the Autopilot team itself)
that were assigned to me, mention me, or got a comment addressed to
me in the window. Skip status-only changes and my own comments.

Source URL: the team issue's URL. One team issue is one item; dedupe
against Autopilot issues that have it attached.
