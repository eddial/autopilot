---
paused: true             # replace mcp__lleverage__ with the prefix /mcp shows for your Lleverage connector, then /autopilot:add lleverage
every: 30m
tools: [mcp__lleverage__workflow_executions_list, mcp__lleverage__workflow_execution_get, mcp__lleverage__feedback_list, mcp__lleverage__requests_query]
---
The Lleverage projects I look after: failed workflow runs, negative
feedback from users, and requests that are waiting on a person.

- Failed runs in the window: one workflow is one item, however many of
  its runs failed. Read one failed run to name the node and the error.
  Skip a failure that a later run of the same input fixed.
- Negative feedback in the window (thumbs down or a correction): one
  workflow is one item; quote what the user said.
- Requests waiting on a person for more than a day: one item per
  workflow, with how many are waiting.

Source URL: the link the tools return for the workflow or run. Dedupe on
the workflow name: new failures or feedback for a workflow that already
has an open issue are added to that issue.
