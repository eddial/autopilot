---
paused: true             # remove once /add has previewed it
every: 10m
tools: [mcp__c8562be6-ba3e-44a3-8490-a10e54f113e2__get_notifications, mcp__c8562be6-ba3e-44a3-8490-a10e54f113e2__list_issues, mcp__c8562be6-ba3e-44a3-8490-a10e54f113e2__get_issue, mcp__c8562be6-ba3e-44a3-8490-a10e54f113e2__list_comments]
---
Issues in other teams' Linear (never the Autopilot team itself)
that were assigned to me, mention me, or got a comment addressed to
me in the window. Skip status-only changes and my own comments.

Start from my notifications in the window (assignments, mentions,
comments), then list_issues with `assignee: me` and `updatedAt` = window
start. Source URL: the team issue's URL. One team issue is one item; dedupe
against Autopilot issues that have it attached.
