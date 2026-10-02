# Autopilot

Turns everything that needs Badr's attention into Linear issues, one workstream each, and starts a
prepared Claude Code session when he moves an issue to **Start**. Runs on his own server on top of
Claude Code and his claude.ai connectors. The system is a directory: one Markdown file per capability.

```
autopilot.yaml           config: Linear team, model, paths, limits, Linear filing tools
instructions.md          shared rules prepended to every Claude call (incl. the filing rules)
workstreams/<name>.md    routing + work; file name = workstream id = Linear project
signals/<source>.md      every:, optional delay:, tools:, what counts; `paused: true` until /autopilot:add enables it
schedules/dream.md       cron: + prompt; the nightly routing review
skills/work/SKILL.md     autopilot:work, how a session works an issue
commands/                /autopilot:init, :add, :why, :status
.claude-plugin/          makes the repo the `autopilot` plugin, so commands and skill are namespaced
runtime/tick.ts          scheduler: signals, schedules, health, launcher (each a detached process)
runtime/launch.ts        Linear poll, sessions in tmux, cleanup
runtime/lib.ts           config, Markdown, state.json, claude -p
bin/autopilot            cron entry point
dreams/YYYY-MM-DD.md     nightly journal (committed)
.state/                  gitignored: state.json, decisions.jsonl, tick.log
```

Node ≥ 24 runs the TypeScript directly; there are no dependencies.

## Setup

1. Create an `autopilot` Unix user with access only to this repo, `repos_dir` and `worktrees_dir`;
   install Claude Code, Node 24, git and tmux.
2. As that user: `claude auth login` with Badr's claude.ai account; run `/mcp` and check the
   connector tool names. claude.ai connectors register in the CLI as `claude.ai Gmail` etc., so the
   files use `mcp__claude_ai_Gmail__…`, `mcp__claude_ai_Slack__…` and `mcp__claude_ai_Linear__…` (the
   desktop app shows the same tools under connector UUIDs). GitHub has no connector yet, so
   `signals/github.md` stays paused with no tools. Run `claude --permission-mode bypassPermissions`
   once and accept the warning, or the first launched session waits on it in tmux.
3. Clone this repo and the work repos into `repos_dir`; `cp .env.example .env` and add a Linear
   personal API key.
4. Run `node runtime/tick.ts install`. It symlinks this repo into `~/.claude/skills/autopilot`, where Claude
   Code loads it as the `autopilot` plugin in every session and repo (`/autopilot:*` commands, the
   `autopilot:work` skill; edits are live), and merges the deny rules into `~/.claude/settings.json`.
   Then write the workstream files (or `/autopilot:add` them) and run `/autopilot:init`, which creates
   the projects, statuses and labels.
5. In Linear's notification settings, enable Slack delivery for issues assigned to Badr (priority 1).
6. Run the tick every minute from a LaunchAgent (not cron: cron cannot read the keychain, so it has no claude.ai connectors and no GitHub login): `~/Library/LaunchAgents/ai.lleverage.autopilot.plist` running `bin/autopilot tick` with `StartInterval` 60, loaded with `launchctl bootstrap gui/$(id -u) <plist>`. Do not set `CLAUDE_CODE_OAUTH_TOKEN`: a `setup-token` token has no connectors.
7. Enable signals one by one with `/autopilot:add <source>` (GitHub, Linear, then Slack, then Gmail). Use `/autopilot:why`
   on every misfiled issue in the first days.

## How it runs

- **Signals.** A signal is due when `now − last_checked ≥ every` and its previous run is dead. The
  window is `max(last_checked − window_overlap, now − window_cap)` → start of run. One `claude -p
  --model haiku --json-schema …` call with the signal's read tools plus `filing_tools` files the items;
  every item goes to `.state/decisions.jsonl`. A failed or unparseable run leaves `last_checked`, so the
  next tick retries. The first run only sets `last_checked` (no backfill).
- **Launcher.** Every tick: issues in Done/Canceled with a session are cleaned up (tmux window killed,
  worktree removed unless it has uncommitted or unpushed work); then issues in Start, oldest first, are
  claimed (→ Working) while fewer than `max_parallel_sessions` are Working. Each gets a worktree at
  `worktrees_dir/<ID>` on `claude/<id>` and a tmux window in session `autopilot` running
  `claude --remote-control <ID> --permission-mode bypassPermissions`: no permission prompts, only the
  deny rules in `.claude/settings.json` block. The Remote Control link is scraped from the pane and
  commented on the issue. A failure before the session starts moves the issue back to Triage with the error.
- **Health.** A job failing for 60 minutes, or a window cut by the 24-hour cap, makes a Claude call that
  creates or updates a p2 issue in the `autopilot` project; the failing issue is closed once runs succeed.
- **Dream.** `schedules/dream.md` runs at 03:30 and commits `autopilot(dream): …` plus the journal.

Run a single job by hand: `node runtime/tick.ts signal gmail`, `… schedule dream`, `… launch`.
Preview a signal without filing anything: `node runtime/tick.ts signal gmail --dry=15` (last 15 minutes).

## Day-one checks

- [ ] `claude -p` from cron, with no terminal, can use the claude.ai connectors under `--allowedTools`.
- [ ] A Haiku signal call over a real 15-minute window returns valid JSON well within the interval.
- [ ] Dedupe works: `list_issues` with `query` = a source URL finds the issue (filed issues carry `Source: <url>` in the description, since the connector cannot filter by attachment).
- [ ] A session in tmux with Remote Control prints its link to the pane (the launcher scrapes it).
- [ ] Permission rules block send, merge and force-push inside a session.
