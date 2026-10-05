---
repo: autopilot
---
## Routing
Autopilot itself: health issues, failed runs, coverage gaps, dream
proposals, and requests to change how Autopilot routes or works.
Urgent: Autopilot has stopped filing or starting sessions altogether.

## Work
Work in the autopilot repo. Changes to signal, workstream or
instruction files go on the branch as a commit; describe the change
and its expected effect in the briefing.

When the change is done, merge it into main yourself, without waiting
for Badr: commit on the branch, then
`git -C "$AUTOPILOT_ROOT" merge --no-ff <branch> -m "Merge <branch>: <what changed>"`
(the main checkout must be on main and clean; if it is not, or the
merge conflicts, abort and say so on the issue). Do not push. The
running Autopilot reads the main checkout, so the merge is what makes
the change live; say in the briefing that it is merged.
