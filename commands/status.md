---
description: Autopilot status — signals, sessions and open health issues
---

Read `.state/state.json`, the tail of `.state/tick.log` and the last
24 hours of `.state/decisions.jsonl`. Show:

1. **Signals and schedules** — one row per `jobs` entry (and per
   `signals/*.md`, marking paused ones): last success, last checked
   window end, failures and failing since, last error (one line), gaps,
   and items in the last 24 h by action (created / updated / dropped).
2. **Launcher** — last success, last error.
3. **Sessions** — one row per `sessions` entry: issue, branch, started,
   whether its tmux window is alive (`tmux list-windows -t autopilot`),
   the Remote Control link.
4. **Health issues** — open Linear issues in the `autopilot` project whose
   title starts with "Autopilot health:".

Flag anything that needs Badr: a job failing for more than an hour, a
running PID older than an hour, a session whose window has died while
its issue is still Working.
