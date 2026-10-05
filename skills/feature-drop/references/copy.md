# Copy for a feature drop

Two kinds of text, with different jobs:

| Where | Job | Tone |
| --- | --- | --- |
| **In the video** (title card, captions, end card, weekly cover/end) | Show what the feature is and what happens on screen. | Strictly functional. No value claims. |
| **Around the video** (posts, carousel, drop page) | Explain why it matters, inside the autonomous back office story (`narrative.md`). | Grounded, concrete, direct. |

Always load `delta:lleverage-content-voice` before writing. Its rules apply
(active voice, problem before solution, no hype words, no "leverage" as a
verb, concrete numbers only when real). The rules below add to it.

## Names

- Use the feature's **marketing name**, written for the buyer. It can differ
  from the in-app name: the voice feature is "Talk to Llev" in the app and
  is announced as **"Talk to your ERP"**. When the change log has no
  buyer-friendly name, propose one in the shortlist and get it confirmed
  before building.
- On-screen UI labels stay exactly as the app shows them ("Call the agent",
  "Columns", "List | Board", "Run all").
- Say "voice call", never "phone call" or "call" on its own.
- Never call the agent a coworker, co-worker, colleague, assistant or copilot.

## Facts

- Only from the change log (#change-log) and the PR descriptions.
- **Check every feature for a feature flag** in its PR. A flagged feature is
  "behind a flag" or left out; never "live".
- Say "live for everyone" only when the change log says so.
- Data in clips is illustrative: Dutch-sounding customer and supplier names,
  SAP-style PO numbers (4500012877), euro amounts. Never a real customer name
  in demo data. The drop page says the data is illustrative.
- Check who owns an exception before writing it (an order without the
  customer's PO goes to the order desk, not purchasing).

## In the video

### Title card (per feature, and each chapter of the combined video)

```
Kicker:  New in Lleverage
Title:   <Feature name, max 2 lines, second line in orange>
Line:    <What it lets you do, one sentence, max 90 characters>
```
Examples: "Talk to / your ERP." – "Start a voice call with the agent and ask
about the orders and invoices in your ERP." · "Board view / for data tables."
– "Show any data table as a Kanban board and drag records between lanes." ·
"Skill / tests." – "Run a skill against saved test cases and see which checks
pass."

### Captions (3–4 per clip, one per beat)

```
<Action, max ~28 characters><br><em><Result or second step, max ~32 characters></em>
```
Describe what the viewer sees, in the imperative or plain present. Examples:
"Start a voice call / from the chat." · "Ask for a chart. / It lands on the
Overview." · "Open Columns. / Switch from List to Board." · "Drag a card to
another lane. / The record updates." · "Open a failed test. / See each check
and why." · "Run again. / All six pass."
Not allowed: slogans ("It's done.", "Not a suggestion."), value claims, the
guiding principle, questions.

### End card

```
Kicker:  Live now
Title:   <Feature name>
Line:    <Where it is available, e.g. "Live in the Lleverage agent." / "Live for every data table.">
```

### Weekly video cover and end

Cover: kicker "Feature drop · Week <NN>", title "New in Lleverage.", list
"1 / 3  <Feature>" … , date range bottom right. End: kicker "Live now", title
"Live now in Lleverage.", line "<Feature> · <Feature> · <Feature>".

## Around the video

### Weekly company post (one per drop; goes with the combined video or the carousel)

```
<Hook: one line, catchy and concrete, no emoji, not a question>

<2–3 sentences: the back-office problem these features chip away at. Use the
narrative's angle, never its slogan.>

<One line leading into the list, e.g. "Three things we shipped toward that in the last two weeks:">

→ <Feature name>. <What you can now do, with the ERP example. 1–2 sentences.>

→ <Feature name>. <…>

→ <Feature name>. <…>

Clips of all three in the first comment. 📦
```

### Per-feature company post (one per feature)

```
<Hook: one line, catchy and concrete>

<The situation in the back office: who, what they deal with. 1–3 short paragraphs.>

<What shipped and how it works, with the clip's example.>

<The role it gives people: what now runs on its own, or what people now steer or decide.>

<Availability line, e.g. "Skill tests are live for everyone.">
```

### Spokesperson post (optional; for a named leader, in their voice)

An opinion about where people belong in the back office, tied to one feature
of the week. 120–200 words. Problem first, then the belief, then the feature
as a small piece of evidence. The spokesperson edits and posts it.

### Carousel pages

- Cover: kicker "Feature drop · Week <NN>"; a headline that frames the week in
  the narrative without the slogan; the features as a numbered list.
- Feature page: label "n / 3 · <Feature>", headline (feature + what it does,
  max 2 lines), one sentence that connects it to the role it gives people,
  then the still.
- Closing page: kicker "Live now"; one line on the narrative; "Clips of all
  three: link in the first comment."

### Drop page

Per feature, one "why" paragraph: what it does, the role it serves, the
example used, and that the feature works beyond that example.

## Hooks that worked

- "Nobody should spend their day retyping orders into an ERP."
- "The fastest report on your order backlog is now a voice call."
- "Finance should only ever see the invoices that don't match."
- "An AI that guesses a PO number is worse than no AI at all."
- "Nobody joined an order desk to copy PO numbers from a PDF into an ERP."

A good hook names a real job in the back office (order desk, finance, a PO, an
invoice) and makes a claim the post then backs up.

## Emojis

- None in the first line.
- At most one or two per post, only where they do a job: → for list items,
  ✅ / ❌ for what runs on its own vs what goes to a person.
- No hype emojis (🚀 🔥 🤯 💡 👇).
- 📦 at the end of the weekly post marks the series.

## Final copy check

- [ ] Every fact traceable to the change log or a PR; no flagged feature presented as live.
- [ ] Marketing names used consistently in video, posts, carousel and page.
- [ ] Video text is functional only; no value claims, no slogan.
- [ ] Each post opens with a hook from the pattern above; no emoji in it.
- [ ] Each feature's post says which role it gives people.
- [ ] No "coworker", "phone call", "leverage" (verb), hype words, invented numbers.
- [ ] ERP examples (orders, invoices, POs, a named ERP) rather than generic records.
