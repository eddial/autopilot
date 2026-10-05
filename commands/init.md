---
description: Set up Autopilot — the home folder, then the Linear projects, statuses and labels
---

Set up Autopilot for the person running this. Report what exists, what you
will create or change, then do it. Never delete or rename anything that is
not listed here.

1. **Home.** Run `node ~/.claude/skills/autopilot/runtime/tick.ts where`. If
   `~/.claude/skills/autopilot` does not exist, ask where the Autopilot repo
   was cloned and run `node <repo>/runtime/tick.ts setup` there. If the home
   is not set up, run `node <engine>/runtime/tick.ts setup`; it makes
   `autopilot.yaml`, `.env`, the `autopilot` workstream and the dream from their
   examples in the home (default `<engine>/home`; git tracks only its `_` examples).
2. **Config.** In the home's `autopilot.yaml`, fill in what is still a
   placeholder by asking: `owner` (the name sessions address), `linear_team`
   (the key of a Linear team for Autopilot alone, e.g. `AP`; it should be a private team, since issues quote the owner's mail and messages and every non-Autopilot comment counts as the owner's instruction), `repos_dir`,
   `worktrees_dir`. Check the `filing_tools` names against `/mcp`. Check that
   the home's `.env` has `LINEAR_API_KEY` (a personal API key); never ask for
   the key in chat, tell them to paste it into the file themselves.
3. **Projects.** For each `workstreams/<name>.md` in the home, ensure a project named
   exactly `<name>` exists in the team. Put the file's Routing section
   in the project description.
4. **Statuses.** Ensure the team's workflow has these statuses, in order:
   | Name | Type |
   | --- | --- |
   | Triage | triage (or backlog if the team has triage off) |
   | Start | unstarted |
   | Working | started |
   | Review | started |
   | Waiting | started |
   | Done | completed |
   | Canceled | canceled |
   The Linear connector may not be able to create statuses. If not, list
   the missing ones and say to add them in Linear → Team settings →
   Workflow, then re-run /autopilot:init.
5. **Labels.** Ensure team labels `autopilot` and one per file in the
   home's `signals/` (the file name).
6. **Local.** Check that `~/.claude/skills/autopilot` links to the engine (else run
   `node <engine>/runtime/tick.ts install`) and any deny rules from the engine's `.claude/settings.json` are in `~/.claude/settings.json`.

End with a checklist of what is now in place and what is still to do by
hand: the scheduler that runs `<engine>/bin/autopilot tick` every minute
(README, step 5), Slack notifications for issues assigned to them, and
enabling signals one by one with /autopilot:add.
