---
paused: true             # remove once /add has previewed it
every: 10m
tools: [mcp__claude_ai_GitHub__search_issues, mcp__claude_ai_GitHub__get_pull_request, mcp__claude_ai_GitHub__get_issue]
---
Pull requests where my review is requested, issues and PRs assigned
to me, and comments that mention me, updated in the window. Skip bot
comments (dependabot, renovate, CI) and PRs I authored unless someone
asks me something on them.

Search with `review-requested:@me`, `assignee:@me` and `mentions:@me`
plus `updated:>=<window start>`. Source URL: the PR or issue URL.
