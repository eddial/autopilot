---
cron: 0 8 * * 1          # Mondays 08:00: one digest of the previous week
every: 30m               # retry interval when the Monday run fails
window_cap: 8d
tools: [mcp__claude_ai_Slack__slack_read_channel, mcp__claude_ai_Slack__slack_read_thread, Bash(gh pr list:*), Bash(gh pr view:*)]
---
A weekly digest for product marketing, not one issue per message: the
whole window is a single item, filed in product-marketing at priority 3.

Collect what shipped in the window from two sources:
- Slack #change-log (channel C09PS3956F5): read it with `oldest` set to
  the window start (Unix seconds) and page until done. Keep product
  announcements and "This week in product" posts; skip joins, bare
  links, reactions-only and chit-chat replies. Note each post's author,
  date and permalink.
- GitHub lleverage-ai/lleverage: `gh pr list -R lleverage-ai/lleverage
  --state merged --search "merged:<window start date>..<window end date>"
  --limit 200 --json number,title,url,mergedAt,author,labels`. Skip
  dependency bumps, bots, CI, refactors and internal tooling; keep
  changes a customer could notice. Use `gh pr view` only when a title
  is unclear.

Merge the two: one entry per change, with the #change-log permalink and
the PR(s) behind it. Drop the item only when nothing customer-visible
shipped.

Title: "Shortlist what to market from week <ISO week>" . Description:
the entries, newest first, one line each, then the usual From/Source
lines (From: #change-log + lleverage-ai/lleverage). Source URL, which
is also the dedupe key: `https://github.com/lleverage-ai/lleverage/pulls?q=is%3Apr+is%3Amerged+merged%3A<window start date>..<window end date>`
with dates as YYYY-MM-DD.
