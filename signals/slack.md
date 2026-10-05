---
every: 15m
tools: [mcp__claude_ai_Slack__slack_search_public_and_private, mcp__claude_ai_Slack__slack_search_channels, mcp__claude_ai_Slack__slack_list_channel_members, mcp__claude_ai_Slack__slack_read_thread, mcp__claude_ai_Slack__slack_read_channel]
---
Only threads that ask me for an explicit action an AI session can help
with: a question to answer, a draft to write, something to research,
analyse, decide on with a recommendation, or fix in a workflow or code.
Not every DM: drop chit-chat, thanks, FYIs, status updates, scheduling
and anything a teammate already owns or has resolved in the thread.
A teammate reporting a bug, error or broken tool to me, or asking for
access, in a DM or a mention counts as a request to look into it, even
without an explicit question. So does a reply in a thread I started.

Look at direct messages to me, group DMs I am in, channel messages that
mention me or reply in threads I started or replied to, and the
customer channels I am a member of: channels named
`<customer>-lleverage` (e.g. #sitech-lleverage; #peak-lleverage is our
investor). Search finds every public channel, also ones I never joined;
those belong to a teammate, so skip them. In customer channels a
request counts when it is addressed to me, or to the team with nobody
from Lleverage picking it up. A teammate telling the customer something
(a feature is on, a fix is live, "let me know if it works") is theirs
to follow up, not a request to me.

Customers in shared channels show up as bots (user `U00`, or an app such
as Conclude posting for them): treat those as people. Skip only real
automation: Linear, alerts, CI and status bots, channel joins, and
threads where I already gave the last answer.

Run these four searches with slack_search_public_and_private, each with
`after` and `before` set to the window (Unix seconds), `sort: timestamp`
and `include_bots: true`:
1. DMs and group DMs: `{"filters": "is:dm"}`.
2. Messages that mention me, in any channel:
   `{"query": "<@U06E7AAF99C>"}`. Copy this exactly: the query is the
   bare mention, with no `from:`, `in:` or other text around it.
   (`from:<@U06E7AAF99C>` finds my own messages, which is wrong here.)
3. Replies in threads I started or replied to, in any channel:
   `{"filters": "is:thread with:<@U06E7AAF99C>"}`.
4. Customer channels: list them with search_channels (query
   `lleverage`, keep names ending in `-lleverage`), keep only those
   whose slack_list_channel_members (`response_format: ids_only`, every
   page) includes U06E7AAF99C, then
   `{"filters": "in:<#id1> in:<#id2> …"}` with one `in:` per kept
   channel and no query or keywords. None kept: skip this search.
Page until results are older than the window. Read the whole thread for
each hit.

One thread is one issue, however many replies it gets. Source URL: the
permalink of the thread's root message, also when the hit is a reply.
Dedupe on the root's timestamp (the `p<digits>` part of the permalink):
a reply in a thread that already has an issue is added to that
issue's description, never a second issue.
