---
repo: product            # a directory in repos_dir (or a path): each issue gets a git worktree on claude/<id>
---
## Routing
Code in the product repo: review requests on pull requests, bugs
assigned to me, and small fixes or changes someone asks me for.
Urgent: production is down, or a PR that blocks a release today.

## Work
For a review, read the PR and its linked issue, run the tests locally,
and prepare review comments in the briefing; post them only when I ask
(`gh pr review --comment`). For a fix, write a failing test first, commit
on the branch, push it and open a draft PR. Never push to main.
