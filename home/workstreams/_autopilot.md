---
# `autopilot setup` makes workstreams/autopilot.md from this example; every Autopilot needs it, since
# health issues and dream proposals land in its project. To let sessions change the engine as well,
# add `repo: autopilot` (each issue then gets a branch in the engine repo).
---
## Routing
Autopilot itself: health issues, failed runs, coverage gaps, dream
proposals, and requests to change how Autopilot routes or works.
Urgent: Autopilot has stopped filing or starting sessions altogether.

## Work
Signal, workstream, schedule and instruction files are in the Autopilot
home (`$AUTOPILOT_HOME`). Edit them there directly; the running
Autopilot reads them on its next tick. Say in the briefing what changed,
with the old and new lines, and the expected effect.
