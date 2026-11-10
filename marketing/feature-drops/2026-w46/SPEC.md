# Feature Drop · Week 46: chapter specs

Theme: pages the Agent builds with you. Seven chapters, canvas style, 1440 × 1440.
Window: merged 30 Oct 14:37 UTC – Sun 8 Nov 2026, live in production (app at 301302d, agent-service and workflow-service at d7a21e8, 10 Nov 08:58 UTC).
Footer: "Feature Drop · Week 46". `CHAPTER({ n, total: 7, module, footerLeft: "Feature Drop · Week 46", title, line })`.

People: Eva Visser (EV), Tom de Groot (TG), Mila Jansen (MJ). Project "Order intake".
Data: orders, invoices, POs, Exact Online; Van Dijk Metaal, Kuipers Hout, Smit Elektro, Bakker Installatietechniek; euro amounts.

Shell: app.css takes the light palette from LLE-17353 (#9702), and app.js has Pages between Intelligence and Monitoring (use-tray-buttons.ts).

Moved to Week 47 (merged 9 Nov): simpler model picker (#10414), waiting messages like sent ones (#10446), agent schedules pick model and effort (#10349), quiet voice calls end themselves (#10400), Add a widget only in edit mode (#10352).

Left out (flagged, internal or not live): everything on person tasks (`conversational-requests`); Processes, Cases and boards (`processes`); Resolve Entity (`entity-resolve`); the guided project setup (#9490, touches `processes`); trigger health and its emails (`trigger-health`, off); Fathom; SharePoint folder sync (`microsoft-folder-sync`); page sharing (`PAGE_SHARING_ENABLED`); Email settings (`managed-email`); the iOS and Android apps (in store review).

Assumed: `live-widgets` (strict, stored in the database) is on, as Week 45 presented live widgets as live. Chapter 2 and "Live widgets show your runs" depend on it.

## Placement (narrative.md)

| # | Feature | For | Moves | Diff. | Example |
| --- | --- | --- | --- | --- | --- |
| 1 | Describe a page, the Agent builds it | manager, builder | operation visible; faster to implement | 2 | Quote & Sell: an order desk page |
| 2 | The Agent builds custom widgets | manager, builder | operation visible | 4 | Plan & Produce: late orders per customer and weekday |
| 3 | Change a page by hand | manager, builder | people steer the agents | 2 | Quote & Sell: the order desk page |
| 4 | Point the Agent at what you mean | operator | people on the decisions | 6 | Quote & Sell: an order on hold |
| 5 | Paste a screenshot into the chat | operator | people on the decisions | 4 | Source & Procure: a supplier's order confirmation |
| 6 | Drafts you can copy or send | operator | asked only for what needs them; control | 5 | Quote & Sell: a missing PO number |
| 7 | New requests, posted in Teams | operator, manager | people get asked where they work | 3 | Quote & Sell: a request for the order desk |

## Chapters

| # | File | Module | Title | Source PRs |
| --- | --- | --- | --- | --- |
| 1 | `ch1-pages.html` | Pages | Describe a page. / *The Agent builds it.* | #9685, #9990, #9989 |
| 2 | `ch2-widgets.html` | Pages | The Agent builds / *custom widgets.* | #10108, #10012, #10014, #10008 |
| 3 | `ch3-edit.html` | Pages | Change a page / *by hand.* | #10007 |
| 4 | `ch4-point.html` | Agent | Point the Agent / *at what you mean.* | #9791 |
| 5 | `ch5-paste.html` | Agent | Paste a screenshot / *into the chat.* | #9574, #9690 |
| 6 | `ch6-drafts.html` | Agent | Drafts you can / *copy or send.* | #9958, #9970, #9824 |
| 7 | `ch7-teams.html` | Requests | New requests, / *posted in Teams.* | #10040, #10236 |

Also new (cover card 2): live widgets show your runs (#10107) · ask your database (#9760, #9470) · sort a whole inbox at once (#9955) · add to a task in progress (#10000) · clearer cards in the chat (#9629, #9680, #10164) · a failed save says so (#10220).
