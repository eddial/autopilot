---
paused: true             # remove once /add has previewed it
every: 15m
tools: [mcp__40251ff7-c90e-4271-bf2b-f4bf03a01b37__slack_search_public_and_private, mcp__40251ff7-c90e-4271-bf2b-f4bf03a01b37__slack_read_thread, mcp__40251ff7-c90e-4271-bf2b-f4bf03a01b37__slack_read_channel]
---
Direct messages to me, group DMs I am in, and channel messages that
mention me or reply in threads I started or replied to. Skip bot
messages, channel joins, and threads where I already gave the last answer.

Search with the `after` parameter set to the window start (Unix seconds),
`sort: timestamp`, and filters `is:dm`, then mentions of my user id;
page until results are older than the window. Read the whole thread
for each hit. Source URL: the permalink of the thread's root message.
