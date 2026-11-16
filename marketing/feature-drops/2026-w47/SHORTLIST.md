# Feature Drop · Week 47: shortlist

Window: merged Mon 9 Nov – Sun 15 Nov 2026 (UTC), starting the day after Week 46's window ended (Sun 8 Nov).
Live in production: app at 0da29d2 (deployed 16 Nov 02:58 UTC), agent-service, workflow-service, channels-service and session-service at 8d3998f (15 Nov 18:48 UTC). Everything merged in the window is in those builds.

Theme: a new navigation, and a closer look at your data.

## Chapters (picked; Badr reviews the finished first version)

| # | Module | Chapter | Source PRs | Flag |
| --- | --- | --- | --- | --- |
| 1 | Navigation | Chats and requests / in one list | #9728, #10826 | none; every project moved to the new navigation |
| 2 | Navigation | Every builder page / one click away (compass, Builder Hub) | #9728, #10816, #10819, #10824 | none; builders only, by role |
| 3 | Pages | Click a number / to see its records | #10617 (#10376, #10380, #10385, #10387, #10389) | `live-widgets`, on for customers since 30 Oct |
| 4 | Agent | Steer the Agent / while it works | #10651, #10446 | agent-service `AGENT_MID_RUN_STEERING_ENABLED=true` for all organisations in production |
| 5 | Agent | Approve with / every detail in view | #10432 | none |
| 6 | Workflows | Copy a workflow / to another project | #10261 | none; needs Edit on workflows in both projects |

## Also new (cover card 2, six rows)

- Call the Agent again: a call that ends leaves a line in the chat, with Call again (#10360)
- View larger: wide or long tables open full screen (#10647, #10690)
- Archive or delete a chat: Archive next to Delete, right-click menus, letter shortcuts (#10687)
- The model for each schedule: a schedule runs on the model and effort you pick; simpler model picker (#10349, #10585, #10414)
- Approve from Teams: approvals, options and connect buttons on a Teams card (#10378)
- Alert groups: edit and delete them, and see which alerts use each (#10663)

Everything else goes in the changelog only.

Review 1 (16 Nov): chapter 4, where a widget's data comes from (#10623), taken out of the video and the post at Badr's request; it stays in the changelog as one line under Improvements.

## Placement (narrative.md)

| # | Feature | For | Moves | Diff. | Example |
| --- | --- | --- | --- | --- | --- |
| 1 | One list for chats and requests | operator | people asked only for what needs them | 2 | Quote & Sell: a request about a missing PO waiting in Needs me |
| 2 | Builder Hub | builder | faster to implement | 1, 4 | Quote & Sell: the order intake workflows and tables |
| 3 | Records behind a number | manager, operator | operation visible | 6 | Quote & Sell: orders waiting on a PO, per customer |
| 4 | Steer the Agent while it works | operator, builder | people steer the agents | 3 | Quote & Sell: correcting a delivery date mid-task |
| 5 | Approval with every detail | operator | control and trust | 5, 6 | Quote & Sell: creating a sales order in Exact Online |
| 6 | Copy a workflow to another project | builder | faster to implement | 7 | Moving the order intake workflow from a test project to production |

## Docs pull requests (lleverage-ai/docs)

- Merged in the window: #36, the Week 46 changelog only. No feature pages.
- Open #37, "Document Processes, Steps, Cases, person Steps and the board" (draft, opened 16 Nov): left out. Processes sit behind `processes`, Lleverage only, and person Steps behind `conversational-requests`.
- Open #20, "Announce the MCP tool renames in plugin 0.7.0" (open since 6 Oct): left out. A plugin release from October, not this week's product.

## Left out (flagged, internal or not live)

- Processes, Cases, Steps and boards (`processes`, Lleverage only), and Resolve Entity (`entity-resolve`).
- Person tasks and everything on them (`conversational-requests`), including "Needs me" tasks; the video shows requests only.
- The Lleverage device (Settings › Devices, firmware, voice on the board): not a customer product yet.
- Trigger health and its emails (`trigger-health`, off).
- The role switcher (#10584): live but off by default since #10629; in the changelog only.
