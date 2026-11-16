# Feature Drop · Week 47: chapter specs

Theme: a new navigation, and a closer look at your data. Six chapters, canvas style, 1440 × 1440.
Window: merged Mon 9 Nov – Sun 15 Nov 2026, live in production (app at 0da29d2, deployed 16 Nov 02:58 UTC; agent-service, workflow-service, channels-service and session-service at 8d3998f, 15 Nov 18:48 UTC).
Footer: "Feature Drop · Week 47". `CHAPTER({ n, total: 6, module, footerLeft: "Feature Drop · Week 47", title, line })`.

People: Eva Visser (EV), Tom de Groot (TG), Mila Jansen (MJ). Project "Order intake"; a second project "Order intake Belgium" for the copy.
Data: orders, POs, Exact Online; Van Dijk Metaal, Kuipers Hout, Smit Elektro, Bakker Installatietechniek, Brouwer Verpakking; euro amounts.

Shell: the new navigation from LLE-17451 (#9728, 15 Nov), for every project. `APP.sidebar` is rebuilt: a 252px beige card (`--nav-surface`) with rounded right corners on the white page; top row with the project switcher and, for builders, the Configure compass (`faGrip`); pinned pages; the agent list with icon-only tabs Needs me · Chats · Completed and their counts; New with the orange pixel mark; the account button and the help buttons. 0.5px borders. `APP.header(trail)` draws "Project › Configure › Page". Specs read from the code are in the task's scratchpad (spec-nav, spec-widgets, spec-chat, spec-copy).

Left out (flagged, internal or not live): Processes, Cases, Steps and boards (`processes`, Lleverage only); Resolve Entity (`entity-resolve`); person tasks, including tasks in Needs me (`conversational-requests`); the Lleverage device (Settings › Devices and its firmware); trigger health (`trigger-health`, off); the guided setup changes (#10393, #10394), which sit on the project setup that touches `processes`.

Docs pull requests: #37 (Processes, draft) left out, flagged; #20 (MCP tool renames, plugin 0.7.0, October) left out, not this week's product.

Assumed: `live-widgets` is on for customers (the docs say live widgets went live on 30 Oct). Chapter 3 depends on it. Steering (chapter 4) is on for every organisation: agent-service production has `AGENT_MID_RUN_STEERING_ENABLED=true` and `AGENT_MID_RUN_STEERING_ORGANISATION_IDS=*`.

## Placement (narrative.md)

| # | Feature | For | Moves | Diff. | Example |
| --- | --- | --- | --- | --- | --- |
| 1 | Chats and requests in one list | operator | asked only for what needs them | 2 | Quote & Sell: a missing PO number waiting in Needs me |
| 2 | Every builder page in one place | builder | faster to implement | 1, 4 | Quote & Sell: the order intake workflows and tables |
| 3 | Click a number to see its records | manager, operator | operation visible | 6 | Quote & Sell: orders waiting on a PO, per customer |
| 4 | Steer the Agent while it works | operator | people steer the agents | 3 | Quote & Sell: a new delivery date mid-task |
| 5 | Approve with every detail in view | operator | control and trust | 5, 6 | Quote & Sell: a sales order in Exact Online |
| 6 | Copy a workflow to another project | builder | faster to implement | 7 | Order intake into a second site's project |

## Chapters

| # | File | Module | Title | Source PRs |
| --- | --- | --- | --- | --- |
| 1 | `ch1-list.html` | Navigation | Chats and requests / *in one list.* | #9728, #10826 |
| 2 | `ch2-hub.html` | Navigation | Every builder page / *in one place.* | #9728, #10816, #10819, #10824 |
| 3 | `ch3-records.html` | Pages | Click a number / *to see its records.* | #10617 (#10376, #10380, #10385, #10387, #10389) |
| 4 | `ch4-steer.html` | Agent | Steer the Agent / *while it works.* | #10651, #10446, #10548 |
| 5 | `ch5-approve.html` | Agent | Approve with / *every detail in view.* | #10432 |
| 6 | `ch6-copy.html` | Workflows | Copy a workflow / *to another project.* | #10261 |

Also new (card 2): call the Agent again (#10360, #10689) · view larger (#10647, #10690) · archive or delete a chat (#10687) · a model for each schedule (#10349, #10585, #10414) · approve from Teams (#10378) · alert groups you can manage (#10663).

Review 1 (16 Nov): the widget source chapter (#10623) is out of the video and the post. Input placeholders used the class `.ph`, which app.css also uses for the page header (16px top padding), so they sat low; renamed to `.plh`.
