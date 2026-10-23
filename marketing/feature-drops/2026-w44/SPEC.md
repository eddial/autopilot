# Feature Drop · Week 44: chapter specs

Theme: people stay in the loop, and runs don't stall. Seven chapters, canvas style, 1440 × 1440.
Window: merged 20–23 Oct 2026, live in production (app and agent-service at 5fbb9ee, 23 Oct 12:15 UTC).
Footer: "Feature Drop · Week 44". `CHAPTER({ n, total: 7, module, footerLeft: "Feature Drop · Week 44", title, line })`.

People: Eva Visser (EV), Tom de Groot (TG), Mila Jansen (MJ). Project "Order intake".
Data: orders, invoices, POs, Exact Online; Van Dijk Metaal, Kuipers Hout, Smit Elektro, Bakker Installatietechniek;
PO 4500012877; euro amounts.

Left out (flagged or not deployed): Processes and Cases (`processes`, Lleverage-only), browser extension
(`browser-extension`), meeting recordings in the native apps (`meeting-recordings`), live inbox (`live-inbox`),
live widgets (`live-widgets`, not deployed), the "Waiting for you" list (`conversational-requests`), Entra domain
discovery (builds on `directory-sync`).

## Placement (narrative.md)

| # | Feature | For | Moves | Diff. | Example |
| --- | --- | --- | --- | --- | --- |
| 1 | Task notifications (in-app and email) | operator | people asked only for what needs them | 3, 5 | Quote & Sell: approve a discount |
| 2 | Reassign a person for the rest of a run | operator, manager | people asked only for what needs them | 3 | Pay & Collect: invoice booking steps |
| 3 | A workflow stops, the Agent asks on a card | operator, builder | more steps run on their own | 3 | Quote & Sell: order entry workflow needs a PO |
| 4 | Retry continues a failed run | builder | faster to implement; trust | 4 | Quote & Sell |
| 5 | Agent step saves to Project Files | builder | more steps run on their own | 3, 2 | Pay & Collect: supplier invoice summary |
| 6 | Stacked bar charts | manager | operation visible | 2 | Quote & Sell: orders per day by status |
| 7 | Date metrics | manager, builder | operation visible | 5 | Deliver & Support: promised delivery date |

## Chapters

| # | File | Module | Title | Captions | Source PRs |
| --- | --- | --- | --- | --- | --- |
| 1 | `ch1-notifications.html` | Requests | Know when a task / *needs you.* | A task for you? / *The bell tells you.* · Open it / *and answer.* · Eva hears back / *as soon as Mila answers.* | #8895, #8890, #8899, #9054, #9091 |
| 2 | `ch2-reassign.html` | Requests | Hand someone the rest / *of a run.* | Tom is out today? / *Pick someone else.* · Reassign person hands Mila / *the rest of the run.* · Every change stays / *on the step.* | #8995 |
| 3 | `ch3-workflow-asks.html` | Agent | A workflow needs you? / *The Agent asks on a card.* | Ask the Agent to run a workflow. / *It stops for a PO number.* · Fill it in on the card. / *The same run carries on.* · The order is drafted / *in Exact Online.* | #8551 (#8082's card) |
| 4 | `ch4-continue.html` | Agent | A run stopped halfway? / *Carry on from there.* | A run stopped halfway? / *Press Continue.* · It picks up where it stopped, / *with everything it did.* | #9008 |
| 5 | `ch5-agent-files.html` | Workflows | The Agent step / *saves to Files.* | An Agent step in a workflow / *saves what it found.* · The file is in Files, / *with the rest of the project.* | #8790, #8792 |
| 6 | `ch6-stacked-bars.html` | Overview | See what each bar / *is made of.* | Pick Stacked bar / *and what to split it by.* · Each bar shows / *a segment per status.* | #8941 |
| 7 | `ch7-date-metrics.html` | Monitoring | Track a date / *with every run.* | A metric can be a date. / *Pick Date as its type.* · Activity shows the day, / *and filters on it.* | #8944, #8957 |

UI read from origin/main on 23 Oct: the sidebar after #8934 (pins, Agent section, Automations / Intelligence /
Monitoring / Control, the bell in the bottom row) is in `app.js`; per-screen sources are noted in each chapter's CSS.

Also new (cover card 2): next-step suggestions (#8962) · Requests views keep their filters (#8992, #8994, #8998,
#8993) · sidebar regroup and settings in one place (#8934, #8834) · Notion and BigQuery by OAuth (#9096) · tasks that
expire (#8896, #8899) · dark mode in midnight blue (#8750).
