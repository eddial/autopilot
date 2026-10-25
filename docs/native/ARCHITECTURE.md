# Architecture

## Roles

One server program plays up to two roles; every app is a client.

| Role | Does | How many |
| --- | --- | --- |
| **Main** | Holds the store, runs the tick (signals, watchers, health, routing review), serves the API and MCP, assigns sessions | Exactly one |
| **Runner** | Runs Claude Code sessions for the main | Any; the main is also a runner |
| **Client** | The Mac, iPhone and Android apps, the CLI, any agent over MCP | Any; holds no data of its own beyond a cache |

Apps never read the database. They use the same API whether the main is on the same Mac or on a
server, so "everything on my Mac" and "headless server, Mac as client" are one code path with a
different connection.

## Topologies

### 1. Everything on one Mac (built first)

```
 Autopilot.app (Electron)                     ~/Library/Application Support/Autopilot/
 ├─ renderer: React UI  ──WebSocket RPC──┐     ├─ autopilot.sqlite   (event log + projections)
 └─ main process: tray, notifications,   │     ├─ config/            (workstreams, signals: Markdown)
    global shortcut, updater             │     └─ logs/
                                         ▼
 autopilot server (launchd agent, user session)  ── node-pty ──▶ claude --remote-control …  (sessions)
   unix socket, owner-only                       ── spawn ─────▶ claude -p --json-schema …  (signals, watchers)
```

- The app bundles the server and, on first run, installs it as a per-user launchd agent. It starts
  at login, keeps running when the window closes, and runs inside the user session, so it has the
  Keychain, the Claude login with its connectors, and `gh`.
- The app connects over a Unix socket that only the user can open: no network port, no token.
- Quitting from the menu bar stops the agent after a warning if sessions are running.
- One app update (electron-updater) replaces the UI and the bundled server together; the app
  restarts the agent after an update.

### 2. Mac plus iPhone and Android (phase 3–4)

The server adds a network listener for paired devices: TLS, device keys, and by default only
loopback, private LAN and Tailscale addresses. Routes are tried in order (LAN, then Tailscale)
and the client switches back when a faster route returns, as T3 Code does.

### 3. Headless main, Mac as client (kept open)

The same server runs on Linux or a Mac mini as a systemd or launchd service
(`autopilot service install`), signed in with `claude auth login` (not a `setup-token` token,
which has no connectors). The Mac app pairs with it and can also join as a runner, so sessions
for repo-bound workstreams run on the Mac next to its files. Moving the main role later is a
snapshot of the event log plus replay, then clients follow.

## Stack

Modelled on T3 Code (pingdotgg/t3code), which runs the same shape: an Effect server, an Electron
desktop app, an Expo mobile app and shared contracts.

| Layer | Choice |
| --- | --- |
| Language | TypeScript, strict; Node LTS (24) |
| Effects, services, schema, RPC | Effect 4 (`effect`, `@effect/platform-node`, `@effect/sql`), Effect Schema for every contract |
| Store | SQLite (`@effect/sql-sqlite-node`), event log plus projections, one transaction per command |
| API transport | Effect RPC over WebSocket; Unix socket locally, TLS for paired devices |
| Sessions | `claude --remote-control` in a pseudo-terminal owned by the server (`node-pty`); tmux optional for terminal attach |
| Signals and watchers | `claude -p --json-schema` with the signal's read-only tools, as today |
| MCP | `@modelcontextprotocol/sdk`: streamable HTTP on the server, `autopilot mcp` as a stdio bridge |
| Desktop | Electron, React 19, Vite, Tailwind 4, TanStack Router, Legend List, `@effect/atom-react` |
| Mobile | Expo with a dev client and EAS builds, React Native, React Navigation native stack, Legend List, `@expo/ui`, `expo-secure-store`, `expo-notifications`, share extension |
| Keys and crypto | `jose` and `@noble/curves` for device keys and tokens; Keychain on macOS via `@napi-rs/keyring` |
| Tooling | pnpm workspaces, Vitest (`@effect/vitest`), oxlint, tsc |

## Repository layout

The new code lives beside today's engine until the switch (see [PLAN.md](PLAN.md)).

```
apps/
  server/          the autopilot server and CLI: store, tick, launcher, watchers, health, routing review, API, MCP
  desktop/         Electron shell: window, tray, notifications, global shortcut, updater, agent install
  web/             the React UI rendered by desktop (and a browser client later)
  mobile/          Expo app for iPhone, then Android
packages/
  contracts/       Effect Schema: entities, commands, events, update kinds, RPC groups, MCP tool definitions
  client-runtime/  connection, routes, auth, snapshot + deltas, cache, offline outbox; shared by web and mobile
  shared/          small utilities used everywhere
prompts/           the signal, workstream, routing-review and session instructions (today's Markdown, moved)
home/              unchanged: a person's config (workstreams and signals as Markdown), now read by the server
```

## Data model

The store is an append-only event log. Projections (tables derived from it) serve reads; both are
written in one transaction per command, with the command's idempotency key recorded so a retry
never applies twice. Side effects (starting a session, calling a connector) run after commit from
an outbox.

Main entities: `Task`, `Update`, `Session`, `Signal`, `SignalRun`, `Decision` (every item a signal
looked at, replacing `decisions.jsonl`), `Watcher`, `Workstream`, `Machine`, `Device`, `Token`,
`RoutingProposal`. Details in [API.md](API.md).

Workstreams and signals stay Markdown files in `home/`, so they can still be edited by hand and by
sessions; the server watches them and records changes as events.

## Sessions

- A session is started for a task on a runner: in the workstream's folder, or a git worktree on
  `claude/<id>` for a workstream with a repo (as today).
- The server owns the pseudo-terminal, scrapes the Remote Control link and records the session's
  resume link (`claude://resume?session=<id>`), so "Open session" works on the Mac and on the phone.
- The session gets an MCP token scoped to its own task. The work skill posts updates
  (`updates.post`) instead of Linear comments; answers arrive as new turns in the same session.
- The `/ticket` hook in Claude Code reads the task through the same API.

## Security

- **No open ports by default.** Locally a Unix socket only the user can open; for devices,
  loopback, LAN and Tailscale only, with TLS.
- **Pairing**: one-time code or QR, valid five minutes; each device creates its own key, kept in
  the Keychain or secure storage, and can be removed from Servers.
- **Scoped access**: `owner`, `read`, `create`, `session` (its own task only), `signal` (match and
  file only). Every RPC and MCP tool declares the scope it needs.
- **Source content is data**: mail, messages and tickets never become instructions; only `owner`
  updates do. Authorship comes from the token, not a comment prefix.
- **Secrets** in the macOS Keychain; on Linux a file readable only by the service user. Never in
  the repo or the event log.
- **Sessions** keep running with `bypassPermissions` as today; hard limits stay as deny rules in
  the engine's `.claude/settings.json`.

## Keeping the door open

Built in from the start, though only topology 1 ships first:

- The UI only talks to the API, never to the database.
- Roles are configuration; sessions start through a runner interface (local first).
- Devices and tokens have their own tables even with one device.
- The API carries a version; the server accepts the previous app version.
- Every write carries an idempotency key.
- CI builds and tests `apps/server` on Linux, so nothing Mac-only slips into it. Mac-only pieces
  (Keychain, launchd) sit behind small services with a Linux implementation.
