# Plan

Scope: the Mac runs the server and the app; the iPhone is a client of the Mac. Each phase ends with
something usable. Everything else is listed under [Later](#later-out-of-scope).

## Phase 0 · Foundations

- pnpm workspace with `apps/` and `packages/` beside today's engine; TypeScript strict, Effect 4,
  Vitest, oxlint; CI on macOS.
- `packages/contracts`: entities, update kinds, commands, events, RPC groups, typed errors, API
  version, MCP tool definitions, JSON Schema export.
- Short decision records for the choices in [README.md](README.md).

**Done when** the contracts build and export, CI is green, and the MCP tool list is reviewed.

## Phase 1 · Server on the Mac, no Linear

- Store: SQLite event log, projections, idempotency, outbox for side effects.
- Queue logic: bands, ordering rules and notification triggers from [PRODUCT.md](PRODUCT.md).
- API over a Unix socket; `autopilot` CLI (`new`, `ls`, `show`, `answer`, `signal`, `watch`,
  `status`, `service install`); `autopilot mcp`.
- The tick, ported from `runtime/`: signals file through `items.match` / `items.file` instead of
  Linear; the launcher starts sessions in a server-owned pseudo-terminal with `--remote-control`;
  watchers; health; the routing review.
- The work skill and shared instructions rewritten to post typed updates instead of
  `🤖 Autopilot` comments; `/ticket` reads the API.
- No import from Linear: the queue starts empty and signals are switched on one at a time, each
  with a dry-run preview, as `/autopilot:add` does today.
- launchd install for the server in the user session.

**Done when** a full day runs on the Mac with the CLI only: signals file tasks, `autopilot answer`
reaches live sessions, watchers wake tasks, and nothing touches the Linear Autopilot team.

## Phase 2 · Mac app

- Electron shell: one window with navigation, list and task columns (each hideable or resizable),
  the narrow layout for beside Claude Code, tray with the Your turn count, notifications, global
  quick-add shortcut, first-run setup that installs the server.
- Built and installed locally (`autopilot update` pulls and rebuilds); see
  [Apple account](#apple-account).
- Screens: queue with answering in place and bulk actions, task conversation, New task, Signals and
  workstreams, Servers (machines, devices, agents).
- Claude look and the pilot from [PRODUCT.md](PRODUCT.md).
- Retire the Linear control plane: the Linear signal stays for team tickets and their mirrors.

**Done when** it is the daily driver and the old `runtime/` engine is removed.

## Phase 3 · iPhone

- Server: network listener with TLS, pairing codes and QR, device keys, routes (LAN, Tailscale),
  API version handshake.
- Expo app: queue, task, reply, New task, and local notifications when it syncs (there is no push
  without the relay).
- Works offline: the last snapshot stays readable, and answers, new tasks and other actions go into
  an outbox on the phone that is sent when the Mac is reachable again (see
  [ARCHITECTURE.md](ARCHITECTURE.md#offline-on-the-iphone)).
- Tailscale (free personal plan) for reaching the Mac away from home; its name goes into the
  pairing code next to the LAN address.
- Installed from Xcode on your own iPhone with the free Apple account; see
  [Apple account](#apple-account).

**Done when** you can answer, start and create tasks from the phone away from home, including
while the Mac is unreachable, and everything arrives once it is back.

## Phase 4 · MacBook as a client of an always-on Mac

- An always-on Mac (a Mac mini) runs the main server; the MacBook's app pairs with it like the
  iPhone does, and stops running its own server.
- First-run setup offers "This Mac" or "Connect to another Mac"; Servers gets a way to move the
  data from the MacBook to the Mac mini (snapshot plus replay).

**Done when** the queue keeps running with the MacBook closed, and the MacBook and iPhone see the
same queue.

## Later (out of scope)

Designed for, not planned:

- Android, from the same Expo app.
- A headless server (Linux or a Mac mini) and remote runners; moving the main role between machines.
- A push relay for APNs, so the iPhone gets notifications while the Mac sleeps, with answers from
  the lock screen.
- A web client from `apps/web`.

## Apple account

A free Apple account (no paid developer membership) is enough to build and run everything for
yourself, with these limits:

| | Free account | Paid membership ($99/year) adds |
| --- | --- | --- |
| Mac app | Built on the Mac and run locally; updated by `autopilot update` (pull and rebuild) | Signing and notarising, so it installs on other Macs; electron-updater auto-updates |
| iPhone app | Installed from Xcode on your own phone; the signature expires after 7 days, so it is re-installed weekly (`autopilot ios install`) | TestFlight, a year-long signature |
| Share extension | Not available: it needs an app group, which free accounts cannot use | Share sheet into the offline outbox |
| Push | Not available (and the relay is out of scope anyway) | APNs, for the later relay |

The Expo config strips the capabilities a free account cannot sign (app groups, push, Sign in with
Apple) with a config plugin, so builds work on either account. Upgrading
later needs no code change.

## Migration off Linear

1. Phases 0–1 run beside the current engine; the Linear setup keeps working.
2. When phase 1 is done, pause the Linear filing and switch signals on in the new server one at a
   time. Nothing is imported.
3. After phase 2 the old engine (`runtime/`, the Linear filing tools, the comment conventions) is
   removed; the Markdown in `home/` (workstreams, signals) carries over unchanged apart from the
   filing instructions.

## Open questions

- Whether to pay for the Apple developer membership before phase 3 (weekly re-install otherwise).

- Bundle id and product name (Autopilot).
- Signals: keep `claude -p` or move to the Claude Agent SDK; needs a check that claude.ai
  connectors are available through the SDK.
