---
description: Create or update Autopilot's Linear setup — a project per workstream file, the statuses and labels
---

Set up Linear for Autopilot. Read `autopilot.yaml` for the team key.
Report what exists, what you will create or change, then do it.
Never delete or rename anything that is not listed here.

1. **Projects.** For each `workstreams/<name>.md`, ensure a project named
   exactly `<name>` exists in the team. Put the file's Routing section
   in the project description.
2. **Statuses.** Ensure the team's workflow has these statuses, in order:
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
   the missing ones and tell Badr to add them in Linear → Team settings →
   Workflow, then re-run /autopilot:init.
3. **Labels.** Ensure team labels `autopilot`, `gmail`, `slack`, `linear`,
   `github`, `product-weekly` (one per file in `signals/`).
4. **Local.** Check that `~/.claude/skills/autopilot` links to this repo (else run `node runtime/tick.ts install`), the
   deny rules are in `~/.claude/settings.json`, and `.env` has `LINEAR_API_KEY`.

End with a checklist of what is now in place and what Badr still has to
do by hand (Slack notifications for issues assigned to him, the crontab line).
