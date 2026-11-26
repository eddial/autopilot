# Feature Drop · Week 48: chapter specs

Theme: pages you write and shape yourself, and more ways to steer the Agent. Seven chapters, canvas style, 1440 × 1440.
Window: merged Mon 16 Nov – Wed 25 Nov 2026, live in production (app at 590cf45, deployed 26 Nov 09:19 UTC; agent-service, workflow-service and session-service at 6519227, 26 Nov 09:07; channels-service at 32eba16, 26 Nov 09:40).
Footer: "Feature Drop · Week 48". `CHAPTER({ n, total: 7, module, footerLeft: "Feature Drop · Week 48", title, line })`.

People: Eva Visser (EV), Tom de Groot (TG), Mila Jansen (MJ). Project "Order intake".
Data: orders, POs, Exact Online; Van Dijk Metaal, Kuipers Hout, Smit Elektro, Bakker Installatietechniek, Brouwer Verpakking, De Vries Bouw; euro amounts.

Shell (`app.js`, `app.css`, `fa-icons.js`), read at 590cf45:
- Icons: the app moved to the Pierre set (@pierre/icons 0.9.0, #11529 and #11549–#11555). `fa-icons.js` now holds the app's 220 Pierre paths (`PI`), draws them with `pi("piName")`, and `fa()` and `lu()` return the Pierre icon wherever the app replaced one (`FA2PI`, `LU2PI`). Still Font Awesome: the compass (faGrip), the drag handle, the call button, the sharp Hand on Needs me, the ghost.
- Navigation: the sidebar toggle moved from the top row to the footer; one Help button (piLifeRaft, #11393) replaces the bug and chat buttons; a search button ends the tab row; the Ask AI row lost its bottom margin (#11385); "New page" is 14px (#11485).
- From the first cut (9696627): "Ask AI", the quiet "New page" row, the bell, a custom page's quiet bar (name, pin, refresh, Share, lock, Close page).

Changed in the five chapters kept from the first cut: the / menu lists App under Files and data (#11524); a link to a page in a reply is a chip and opens the page beside the chat, with Close page; a new chat has the Incognito button (#11399); the message row reads time, branch, Edit, Retry, Copy; notes on is the secondary button (#11581).

Left out: see `SHORTLIST.md`.

Assumed: the Agent (`platform-agent`) and `live-widgets` are on for customers, as in every earlier drop.

## Chapters

| # | File | Module | Title | Source PRs |
| --- | --- | --- | --- | --- |
| 1 | `ch1-write.html` | Pages | Write a page / *like a document.* | #10825, #10915, #10912, #11524 |
| 2 | `ch2-agentpage.html` | Pages | Ask the Agent / *for a new page.* | #10889, #10913, #10914 |
| 3 | `ch3-widget.html` | Pages | Change a live widget / *yourself.* | #11413 |
| 4 | `ch4-timeline.html` | Data tables | See a table's records / *on a timeline.* | #11571, #11603 |
| 5 | `ch5-edit.html` | Agent | Edit your message / *while the Agent works.* | #11164 |
| 6 | `ch6-notes.html` | Agent | Point at a spot / *and tell the Agent.* | #11004 |
| 7 | `ch7-schedule.html` | Schedules | Run a schedule only / *when something is new.* | #10705 |

Chapter 3 shows the edit (Settings, Edit widget, Total of Amount, Grouped by Customer, Save), because building a new widget by hand from a page is Lleverage only (`internalOnly` on "Chart, set up by hand"). A widget built by hand has no value format, so amounts read "184,250" without a euro sign. No zoom: the window is the full view.
Chapter 4 leaves the Amount column out of the view: a number shows raw in a bar ("12450"). The selects show the columns the timeline falls back to (Order date, Delivery date, Order).

Also new (card 2): incognito chats (#11399, #11604) · sort your pins into sections (#11484, #11486) · more charts and date ranges (#11342, #11345, #11327, #11354) · set up an empty page with the Agent (#11031) · projects are now workspaces (#10239) · edit many schedules at once (#11070).

Not confirmed from the code:
- Chapter 2: the Agent's tool steps use the generic label ("Lleverage Create Page: <title>"), read from `tool-meta.ts`; the real chat may read "Gateway Actions Lleverage Create Page: <title>" or word it differently. The width of the page panel beside the chat is a guess (60%).
- Chapter 3: the settings popover's exact place on the block; the chart cards' icons at 24px (the component's default).
- Chapter 4: the table page's header above the card (the chapter shows the name only); whether the selects show the fallback columns or "Choose a column".

Placement: see `SHORTLIST.md`.
