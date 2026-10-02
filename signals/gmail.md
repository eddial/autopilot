---
every: 15m
tools: [mcp__claude_ai_Gmail__search_threads, mcp__claude_ai_Gmail__get_thread]
---
First gate, before anything else: the sender must be one of the people
below. Everyone else is dropped, however direct their question: cold
outreach, sales and partnership pitches, agencies, recruiters I have
not written to, surveys and research requests.

Inbox threads not sent by me, from people who matter:
- investors: Peak Capital (peak.capital) and Quickbase (quickbase.com);
- customers: Ynvolve, TAKS (taks.nl) and any other customer domain;
- anyone I have written to: check with `in:sent to:<sender address>`
  (or `to:@<domain>` for a company domain) before dropping a sender;
- colleagues (@lleverage.ai) when the mail needs something from me
  (a question, decision, approval or review addressed to me), not when
  I am only in CC on a thread someone else is handling.

File only threads that ask me for an explicit action an AI session can
help with: a question to answer, a draft to write, something to
research, analyse, decide on with a recommendation, or fix. Drop FYIs,
thanks, status updates, scheduling, and threads a colleague already
owns or has resolved.

Skip newsletters, receipts, calendar notifications, automated mail,
mail from my own accounts (badr@lleverage.onmicrosoft.com), and
threads whose last message is mine.

Search with `in:inbox -from:me after:<window start as Unix seconds>`
(e.g. `after:1790886000`; Gmail takes seconds, so the search itself
excludes older mail). A thread qualifies only when a message not from
me arrived inside the window; an older thread is not new, even if it
is still unanswered,
page through all results, and read each remaining thread with get_thread.
Source URL: the thread's `viewUrl`.
