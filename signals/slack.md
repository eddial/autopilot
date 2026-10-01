---
every: 15m
delay: 30m               # leave Slack threads 30 minutes so I can answer them myself
tools: [mcp__claude_ai_Slack__slack_search_public_and_private, mcp__claude_ai_Slack__slack_search_channels, mcp__claude_ai_Slack__slack_read_thread, mcp__claude_ai_Slack__slack_read_channel]
---
Only threads that ask me for an explicit action an AI session can help
with: a question to answer, a draft to write, something to research,
analyse, decide on with a recommendation, or fix in a workflow or code.
Not every DM: drop chit-chat, thanks, FYIs, status updates, scheduling
and anything a teammate already owns or has resolved in the thread.

Look at direct messages to me, group DMs I am in, channel messages that
mention me or reply in threads I started or replied to, and customer
channels: channels named `<customer>-lleverage` (e.g. #argos-lleverage,
#sitech-lleverage; #peak-lleverage is our investor). In customer
channels a request counts when it is addressed to me, or to the team
with nobody from Lleverage picking it up.

Customers in shared channels show up as bots (user `U00`, or an app such
as Conclude posting for them): treat those as people. Skip only real
automation: Linear, alerts, CI and status bots, channel joins, and
threads where I already gave the last answer.

Search with the `after` parameter set to the window start (Unix seconds)
and `sort: timestamp`: first `is:dm`, then mentions of my user id
(`<@U06E7AAF99C>`), then the customer channels: list them with
search_channels (query `lleverage`, keep names ending in `-lleverage`)
and search them together with one `in:<#id>` filter per channel. Page
until results are older than the window. Read the whole thread for
each hit.

One thread is one issue, however many replies it gets. Source URL: the
permalink of the thread's root message, also when the hit is a reply.
Dedupe on the root's timestamp (the `p<digits>` part of the permalink):
a reply in a thread that already has an issue becomes a comment with
what is new, never a second issue.
