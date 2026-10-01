---
paused: true             # remove once /add has previewed it
every: 15m
tools: [mcp__67b05302-0fa0-41a5-8158-94bacb5a8352__search_threads, mcp__67b05302-0fa0-41a5-8158-94bacb5a8352__get_thread]
---
Inbox threads not sent by me. Skip newsletters, receipts,
calendar notifications and automated mail.

Search with `in:inbox -from:me after:<window start date, YYYY/MM/DD>`
(dates only, so drop threads whose latest message is before the window),
page through all results, and read each remaining thread with get_thread.
Source URL: the thread's `viewUrl`.
