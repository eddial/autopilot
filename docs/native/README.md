# Autopilot Native

Autopilot today files work as Linear issues and steers sessions through Linear comments. Autopilot
Native replaces Linear as the control plane with Autopilot's own server and apps, built to sit
beside Claude Code rather than compete with it.

**Scope:** the Mac runs both the server and the app; an iPhone app is a client of that Mac. After
the iPhone, an always-on Mac can run the server with the MacBook as a client. Android and a headless
server are out of scope for now; the design leaves room
for them (see [PLAN.md](PLAN.md#later-out-of-scope)).

This folder is the plan. Nothing here is built yet.

| Document | What it covers |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | The experience: the queue, the attention model, tasks as updates, new tasks, signals, workstreams, servers, the pilot |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Roles (main, runner, client), how it runs on the Mac and reaches the iPhone, the stack, repo layout, storage, security |
| [API.md](API.md) | The contract: entities, commands, events, update kinds, access scopes, and the MCP tools any agent can use |
| [PLAN.md](PLAN.md) | Phases with exit criteria, migration off Linear, what stays open for later, open questions |

Design concept (private canvas, ask for access):
https://claude.ai/artifact/NaVZFaCJWSh8VT5aaaFoSP

## In one paragraph

One TypeScript server (Effect, SQLite as an event log) owns tasks, runs the tick (signals,
watchers, health, the nightly routing review) and starts Claude Code sessions with
`--remote-control`. Every app is only a client of its versioned API: an Electron app on the Mac,
an Expo app on iPhone. On the Mac the app installs the server as a background agent and talks to it
over a local socket; the iPhone pairs with that Mac and connects over the local network or
Tailscale. Sessions and any other agent use the same API through MCP, with access scoped per
caller. A task is a short conversation of typed updates, and the queue ranks tasks by whose turn it
is, so the top row is always something to act on.

## Decisions so far

| Decision | Choice | Why |
| --- | --- | --- |
| Control plane | Autopilot's own server, not Linear | Linear stays a signal source (team tickets), not where you steer |
| Stack | TypeScript and Effect throughout, like T3 Code | One language and one contract across server, desktop, mobile and MCP; the agent tooling (Claude Agent SDK, MCP SDK) is TypeScript-first |
| Desktop | Electron with React, styled like Claude | The same choice Claude desktop and T3 Code made; one UI codebase with a future web client |
| Mobile | Expo (React Native), iPhone only for now | Shares the contracts and client runtime with the Mac app; Android stays possible later from the same code |
| Remote access | Tailscale, free personal plan | No router setup; the server puts the Mac's Tailscale name in the pairing code |
| Offline phone | Outbox on the iPhone, replayed when the Mac is back | Idempotency keys make replay safe |
| Where it runs | The Mac is server and client; the iPhone is a client; later an always-on Mac as server with the MacBook as client | Server installed as a launchd agent by the app; a Mac that is only a client, or a headless server, stays possible by design |
| Visual language | Claude's warm greys, serif headings over sans body, Clay for "your turn", pilot green for Autopilot | It lives next to Claude all day |
| Mascot | Claude's pixel mascot in pilot green, captain's cap and aviators (option B) | |
