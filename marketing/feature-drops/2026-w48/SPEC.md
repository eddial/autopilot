# Feature Drop · Week 48: chapter specs

Theme: pages written like documents, and more ways to steer the Agent. Six chapters, canvas style, 1440 × 1440.
Window: merged Mon 16 Nov – Sun 22 Nov 2026, live in production (app, agent-service, workflow-service, session-service and channels-service at 9696627, deployed 23 Nov 13:05–13:12 UTC).
Footer: "Feature Drop · Week 48". `CHAPTER({ n, total: 6, module, footerLeft: "Feature Drop · Week 48", title, line })`.

People: Eva Visser (EV), Tom de Groot (TG), Mila Jansen (MJ). Project "Order intake".
Data: orders, POs, Exact Online; Van Dijk Metaal, Kuipers Hout, Smit Elektro, Bakker Installatietechniek, Brouwer Verpakking, De Vries Bouw; euro amounts.

Shell changes this week (`app.js`, `app.css`), read at 9696627: "New" is "Ask AI" (the pixel mark grey and still until hovered, #10825); a quiet "New page" row (faPlus, 12px, #8F8F8A at 70%) under the pins; a bell (faBell) before the help buttons; the Workflows pin uses faDiagramProject (#10930); a custom page's bar is its name, the pin, refresh, Share, the lock and, with the Agent beside it, Close page, and it fades until pointed at (#10928). The app says "workspace" (#10239), which the shell shows only in tooltips and the switcher menu. Specs read from the code are in the task's scratchpad.

Left out: see `SHORTLIST.md`.

Assumed: the Agent (`platform-agent`) is on for customers, as in every earlier drop; Schedules sits behind it.

## Placement (narrative.md)

| # | Feature | For | Moves | Diff. | Example |
| --- | --- | --- | --- | --- | --- |
| 1 | Write a page like a document | builder, manager | operation visible; faster to implement | 2, 4 | Order intake: the order desk page with a note and two numbers |
| 2 | Ask the Agent for a new page | manager, builder | faster to implement | 7 | Order intake: orders waiting on a PO, per customer |
| 3 | Edit your message while the Agent works | operator | people steer the agents | 4 | Order intake: leave out a customer on hold mid-run |
| 4 | Point at a spot and tell the Agent | operator, manager | people steer the agents | 4 | Order intake: the weekly order report |
| 5 | Run a schedule only when something is new | builder | more steps run on their own; cost | 5 | Order intake: an hourly new order check |
| 6 | Set up an empty page with the Agent | builder | faster to implement | 1 | Order intake: a first data table |

## Chapters

| # | File | Module | Title | Source PRs |
| --- | --- | --- | --- | --- |
| 1 | `ch1-write.html` | Pages | Write a page / *like a document.* | #10825, #10915, #10912 |
| 2 | `ch2-agentpage.html` | Pages | Ask the Agent / *for a new page.* | #10889, #10913, #10914 |
| 3 | `ch3-edit.html` | Agent | Edit your message / *while the Agent works.* | #11164 |
| 4 | `ch4-notes.html` | Agent | Point at a spot / *and tell the Agent.* | #11004 |
| 5 | `ch5-schedule.html` | Schedules | Run a schedule only / *when something is new.* | #10705 |
| 6 | `ch6-starters.html` | Data tables | Set up an empty page / *with the Agent.* | #11031 |

Also new (card 2): projects are now workspaces (#10239, #10179, #10271) · edit many schedules at once (#11070) · take a tour of the Agent (#10960, #11060) · an Overview page for each role (#10525, #10942) · close the page, keep the Agent (#11122) · connections in the session (#11034).

Not confirmed from the code: in chapter 2 the Agent's tool steps use the generic label ("Lleverage Create Page: <title>"), read from `tool-meta.ts`; the real chat may word it differently. The link in the reply opens the page in place (in-app links open in the same tab).
