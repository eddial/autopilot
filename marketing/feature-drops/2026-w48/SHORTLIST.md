# Feature Drop · Week 48: shortlist

Window: merged Mon 16 Nov – Sun 22 Nov 2026 (448 PRs). Week 47 ended Sun 15 Nov, so the window starts the day after.
Production: app, agent-service, workflow-service, session-service and channels-service all at 9696627 (deployed 23 Nov, 13:05–13:12 UTC), which contains every PR merged in the window. PRs merged on 23 Nov (such as "No trigger, no publish", #11273) belong to Week 49.

Theme: pages written like documents, and more ways to steer the Agent.

## Chapters (in order)

| # | Module | Chapter | PRs | Live |
| --- | --- | --- | --- | --- |
| 1 | Pages | Write a page / like a document | #10825, #10915, #10910, #10912, #10923 | live, no flag |
| 2 | Pages | Ask the Agent / for a new page | #10889, #10913, #10916, #10914 | live, no flag |
| 3 | Agent | Edit your message / while the Agent works | #11164, #11000 | live, no flag |
| 4 | Agent | Point at a spot / and tell the Agent | #11004 | live, no flag |
| 5 | Schedules | Run a schedule / only when something is new | #10705 | live, no flag |
| 6 | Data tables | Set up an empty page / with the Agent | #11031 | live, no flag |

## Also new (card 2)

| Row | PRs | Live |
| --- | --- | --- |
| Projects are now workspaces; owners decide who can create them | #10239, #10213, #10210, #10179, #10271 | live (personal workspaces stay behind `personal-workspaces`, left out) |
| Edit many schedules at once | #11070 | live |
| Take a tour of the Agent by using it | #10960, #11060 | live; sending the tour to a colleague as a task is a person task (`conversational-requests`), left out |
| An Overview page for each role | #10525, #10942 | live |
| Close the page, keep the Agent | #11122 | live |
| The connections panel in a session | #11034 | live |

Changelog only: drop files anywhere in the chat (#10875), email triggers hand over the email as an .eml file that opens as an email (#10884, #10882), the Agent offers once to schedule what you keep starting by hand (#10892), live widgets in the chat (#10891), new sessions start on Claude Sonnet 5.5 (#10776), GPT-6.2 Sol (#11043), the Lleverage Agent step (#10950), the workflow editor says why a save was refused (#11018), up to ten files as cards on a request (#11025), a form set by an expression made editable (#10544), Remove from workspace in the Members row menu (#10879), copy a custom connection without its key (#10277), a variable a connection uses can't be deleted (#11121), fixes (#11105, #11135, #11269, #11027, #11029).

## Left out

- Remind now on a task (#10603), how long each Needs me task has waited (#10951), the tour sent as a task: person tasks, behind `conversational-requests`.
- Processes: Process map, step panel, Process block, Case lines (#10693, #10893, #10954, #11038, #10807): behind `processes`.
- Personal workspaces, the organisation Tasks page, organisation usage by person: behind `personal-workspaces` and `organisation-task-list`.
- Applets (#11117 and on), meeting recordings from a Chrome extension (#11200), project phone lines (#10771), the Lleverage device PIN (#10792, #10795), model suggestions (#11174): behind flags, off or Lleverage only.
- Audit log of what the Agent did (#10077 and on): behind `organisation-audit-log`.
- Moving a workflow to another project (#11107, #11108): groundwork, nothing to use yet.

## Docs pull requests

| PR | State | What happened |
| --- | --- | --- |
| #40 Describe pages as documents (merged 16 Nov) | merged in the window | from #10825: in, chapter 1 |
| #38 New project navigation, Configure and Pages (merged 16 Nov) | merged in the window | Week 47's navigation (#9728): already in Week 47 |
| #39 Document the features shipped since the July docs audit | open | backfill of weeks 37–46, no new feature: not this week's product |
| #37 Processes, Steps, Cases, the board | open, draft | behind `processes`: left out, not live |
| #20 MCP tool renames in plugin 0.7.0 | open, draft | October, plugin, not this week's product |

## Placement (narrative.md)

| # | Feature | For | Moves | Diff. | Example |
| --- | --- | --- | --- | --- | --- |
| 1 | Write a page like a document | builder, manager | operation visible; faster to implement | 2, 4 | Order intake: an order desk page with notes and a table of held orders |
| 2 | Ask the Agent for a new page | manager, builder | faster to implement | 7 | Order intake: a page of orders waiting on a PO, per customer |
| 3 | Edit your message while the Agent works | operator | people steer the agents | 4 | Order intake: correcting a delivery week mid-task |
| 4 | Point at a spot and tell the Agent | operator, manager | people steer the agents | 4 | Order intake: a weekly order report the Agent made |
| 5 | Run a schedule only when something is new | builder | more steps run on their own; cost | 5 | Order intake: an hourly check for new orders |
| 6 | Set up an empty page with the Agent | builder | faster to implement | 1 | Order intake: a first data table for incoming orders |
