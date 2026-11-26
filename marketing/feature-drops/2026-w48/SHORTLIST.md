# Feature Drop · Week 48: shortlist

Window: merged Mon 16 Nov – Wed 25 Nov 2026 (448 PRs to 22 Nov, 294 more on 23–25 Nov). Week 47 ended Sun 15 Nov and is the last drop in the changelog, so the window starts the day after. The first cut of 23 Nov (16–22 Nov) was never published; this version keeps its work and adds 23–25 Nov.
Production: app at 590cf45 (deployed 26 Nov 09:19 UTC); agent-service, workflow-service and session-service at 6519227 (26 Nov 09:07); channels-service at 32eba16 (26 Nov 09:40). Every PR below is an ancestor of the app build.

Theme: pages you write and shape yourself, and more ways to steer the Agent.

## Chapters (in order)

| # | Module | Chapter | PRs | Live |
| --- | --- | --- | --- | --- |
| 1 | Pages | Write a page / like a document | #10825, #10915, #10910, #10912, #10923, #11524 | live, no flag |
| 2 | Pages | Ask the Agent / for a new page | #10889, #10913, #10916, #10914 | live, no flag |
| 3 | Pages | Change a live widget / yourself | #11413 | live: Edit widget on a live widget has no flag of its own (`live-widgets` is on). Building a new one by hand from a page is Lleverage only, so the chapter shows the edit |
| 4 | Data tables | See a table's records / on a timeline | #11571, #11603 | live, no flag |
| 5 | Agent | Edit your message / while the Agent works | #11164, #11000 | live, no flag |
| 6 | Agent | Point at a spot / and tell the Agent | #11004 | live, no flag |
| 7 | Schedules | Run a schedule only / when something is new | #10705 | live, no flag |

## Also new (card 2)

| Row | PRs | Live |
| --- | --- | --- |
| Incognito chats | #11399, #11604 | live |
| Sort your pins into sections | #11484, #11486, #11482, #11490, #11517 | live; dragging one pin onto another to group them (#11572) sits behind `processes`, left out |
| More charts and date ranges | #11342, #11345, #11327, #11354 | live (`live-widgets`); by hand only area and list, the rest through the Agent |
| Set up an empty page with the Agent | #11031 | live; a chapter in the first cut, now a row |
| Projects are now workspaces | #10239, #10213, #10210, #10179, #10271 | live (personal workspaces stay behind `personal-workspaces`) |
| Edit many schedules at once | #11070 | live |

Changelog only: the Agent tour and Getting started on an invite (#10960, #11060, #11434), an Overview page per role (#10525, #10942), Close page (#11122), chats that used a page (#11315), the Notifications panel and bell dot (#11300, #11385), emails per workspace (#11530, #11514), audio and video in place (#11480), the PDF reader (#11581), Excel in its own window (#11395), the whole thread in an email attachment (#11302), right-click a row (#11436), Highlight rows when (#11398), age bands, linked fields and tracked metrics in widgets (#11348, #11329, #11386), the Pierre icon set (#11529 and on), the Help button (#11393), hidden workspaces (#11414), Waiting to join (#11579), AI usage for every organisation (#11053), Outlook Online Archive (#11371), finished and failed schedule runs in the list (#11024, #11525), and the 16–22 Nov items from the first cut. Fixes: #11273, #11370, #11606, #11168, #11018, #11105, #11121, #11135, #11269.

## Left out

- Person tasks: a note on an answer (#11496), what each checklist item delivers (#11056), a task's draft email (#11516), Remind now (#10603): behind `conversational-requests`.
- Processes, Cases, Steps, the board, step fields, routes and guards (#10693 and on, #11136, #11333, #11344): behind `processes`.
- Applets and the apps they place on pages (#11117 and on, #11583): behind `applets`.
- Meeting transcript view in Files (#11317): behind `meeting-recordings`, off for everyone.
- A connection link that names the account that signs in (#11419): behind a deploy switch that defaults to off; not settled, so left out.
- Custom project roles in directory mappings (#11507): directory sync is behind `directory-sync` and the enterprise tier.
- Personal workspaces, the organisation Tasks page: behind `personal-workspaces` and `organisation-task-list`.
- Access model, org scope batches, LiteLLM routing, zero data retention logging: groundwork, nothing to use on screen.

## Docs pull requests

| PR | State | What happened |
| --- | --- | --- |
| #40 Describe pages as documents (merged 16 Nov) | merged in the window | from #10825: in, chapter 1 |
| #38 New project navigation, Configure and Pages (merged 16 Nov) | merged in the window | Week 47's navigation (#9728): already in Week 47 |
| #42 Custom Project roles in directory mappings (merged 25 Nov) | merged in the window | from #11507: left out, directory sync is flagged and enterprise only |
| #39 Document the features shipped since the July docs audit | open | backfill of weeks 37–46, no new feature |
| #37 Processes, Steps, Cases, the board | open, draft | behind `processes`: left out, not live |
| #20 MCP tool renames in plugin 0.7.0 | open, draft | October, plugin, not this week's product |

No docs PR yet covers Edit widget, the Timeline view or incognito chats: the changelog links the existing Live widgets and Tables pages.

## Placement (narrative.md)

| # | Feature | For | Moves | Diff. | Example |
| --- | --- | --- | --- | --- | --- |
| 1 | Write a page like a document | builder, manager | operation visible; faster to implement | 2, 4 | Order intake: the order desk page with a note and two numbers |
| 2 | Ask the Agent for a new page | manager, builder | faster to implement | 7 | Order intake: orders waiting on a PO, per customer |
| 3 | Change a live widget yourself | manager, builder | operation visible; people steer | 1, 4 | Order intake: order value per customer |
| 4 | See a table's records on a timeline | operator, manager | operation visible | 2, 6 | Order intake: orders from order date to delivery date, per customer |
| 5 | Edit your message while the Agent works | operator | people steer the agents | 4 | Order intake: leave out a customer on hold mid-run |
| 6 | Point at a spot and tell the Agent | operator, manager | people steer the agents | 4 | Order intake: the weekly order report |
| 7 | Run a schedule only when something is new | builder | more steps run on their own; cost | 5 | Order intake: an hourly new order check |
