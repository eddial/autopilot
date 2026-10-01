---
paused: true             # remove once /add has previewed it
every: 15m
tools: [mcp__claude_ai_Gmail__search_threads, mcp__claude_ai_Gmail__get_thread]
---
Inbox threads not sent by me. Skip newsletters, receipts,
calendar notifications and automated mail.

Search the inbox for threads with messages in the window, e.g.
`in:inbox -from:me after:<window start, epoch seconds>`, and read each
thread in full. Source URL: `https://mail.google.com/mail/u/0/#inbox/<thread id>`.
