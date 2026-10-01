---
paused: true             # remove once /autopilot:add has previewed it
every: 15m
tools: [mcp__claude_ai_Gmail__search_threads, mcp__claude_ai_Gmail__get_thread]
---
Inbox threads not sent by me. Skip newsletters, receipts,
calendar notifications and automated mail.

Search with `in:inbox -from:me after:<window start date, YYYY/MM/DD>`
(dates only, so drop threads whose latest message is before the window),
page through all results, and read each remaining thread with get_thread.
Source URL: the thread's `viewUrl`.
