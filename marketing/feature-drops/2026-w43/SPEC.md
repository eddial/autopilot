# Feature Drop · Week 43: chapter specs

Theme: work with the Agent like a colleague. Six chapters, canvas style, 1440 × 1440.
Footer: "Feature Drop · Week 43". `CHAPTER({ n, total: 6, module, footerLeft: "Feature Drop · Week 43", title, line })`.

People: Eva Visser (EV, the person in the session), Tom de Groot (TG), Mila Jansen (MJ).
Data: orders, invoices, POs, Exact Online; Dutch company names (Van Dijk Metaal, Kuipers Hout,
Smit Elektro, Bakker Installatietechniek), SAP-style PO numbers (4500012877), euro amounts.
Project: "Order intake" (as in Week 42).

Every chapter: opens on the feature (navigation before the part's start), 2–3 beats, one caption
per beat, about 13–17 s, at most one held zoom ≥ 1.3×, holds on each result and the end.
Sound cues: `C.typing`/`C.type` where a person types, `C.voice` for a spoken request (words one by
one), the Agent writes silently (`C.type(..., null)`).

## 1 · Agent · conversational requests (`ch1-tasks.html`, PRs #8445–#8745, LLE-15189..15721)
Title: "Hand a task to a colleague.<br><em>Your session carries on.</em>"
Cover row: "Hand a task to a colleague"
Beats:
1. "Ask the Agent to involve someone.<br><em>It sends them a task.</em>" Eva types: "Draft the
   sales order for Van Dijk Metaal and have Mila approve the 8% discount." The Agent raises a task
   to Mila Jansen; the task card (shown exactly as a request card) appears in Eva's thread, waiting.
2. "Mila answers on the card,<br><em>or works it with her Agent.</em>" Mila's side: the same task
   as a request-style card with its answer (approve/reject), she approves.
3. "Once she's done,<br><em>the Agent picks it up.</em>" Back in Eva's session: the card shows the
   outcome, the Agent continues and reports the draft order in Exact Online.
Real UI: apps/app/src/components/person-tasks/*, the task card in the session thread (LLE-15523,
LLE-15524 "task cards exactly as request cards"), raise_task in
apps/agent-service/src/modules/agent/platform/tools/raise-task-tool.ts (presentation "request" vs
"guided", answers approval/choice/input, outcomes).

## 2 · Agent · process walkthrough on a screen call (`ch2-walkthrough.html`, PR #8584)
Title: "Walk the Agent<br><em>through your process.</em>"
Cover row: "Walk the Agent through your process"
Beats:
1. "Show how you do it<br><em>on a screen call.</em>" On a voice call, Eva shares her screen (the
   screen button next to mute); the Agent sees an Exact Online sales order screen.
2. "The Agent asks as you go<br><em>and writes each step down.</em>" A spoken answer (C.voice), the
   Agent saves notes to Project Files `process-walkthroughs/order-intake-by-email/`.
3. "Then ask for a skill<br><em>built from the notes.</em>" After the call, Eva asks; the Agent
   starts building the skill from the notes.
Real UI: PR #8584 (screen share button in composer + call pill, "Show it on a screen call" proposal
card), built-in skill apps/agent-service/src/modules/agent/platform/builtin-skills/process-walkthrough/SKILL.md.
Week 42's voice chapter (w42/ch5-voice.html) and voice-call-pill.html are the starting points.

## 3 · Agent · approvals before acting (`ch3-approvals.html`, PRs #8081, #8423, #8083)
Title: "The Agent asks<br><em>before it acts.</em>"
Cover row: "The Agent asks before it acts"
Beats:
1. "A workflow with Approval on?<br><em>The Agent asks first.</em>" Eva: "Run the order intake on
   this morning's emails." Approval card for the skill's workflow; Eva approves; it runs.
2. "Deleting one that's in use?<br><em>It shows what would break.</em>" Eva: "Delete the old
   invoice matching workflow." Approval card lists what uses it (a Skill, its schedule) and what
   deleting does to each; Eva cancels or confirms.
Real UI: the approval card components from those PRs.

## 4 · Agent · composer suggestions (`ch4-composer.html`, PRs #8413, #8603)
Title: "The composer<br><em>finishes your sentence.</em>"
Cover row: "The composer finishes your sentence"
Beats:
1. "After each answer,<br><em>a next step waits.</em>" The Agent replies; a suggested next message
   shows in the composer; Tab takes it.
2. "Start typing,<br><em>Tab finishes it.</em>" Eva types "Which orders are", the completion shows
   in grey ("waiting on a PO number?"), Tab, send.

## 5 · Skills · copy a skill (`ch5-copy-skill.html`, PR #8582)
Title: "Copy a skill<br><em>into another project.</em>"
Cover row: "Copy a skill into another project"
Beats:
1. "Pick Copy to project<br><em>from the skill's menu.</em>" Skills page, the skill card's menu.
2. "Choose where it goes.<br><em>It lands there as a draft.</em>" The dialog: destination project
   ("Order intake Belgium"), what stays behind; Copy; the draft in the other project.

## 6 · Requests · calculated form fields (`ch6-form-maths.html`, PR #8278)
Title: "Request forms<br><em>that do the maths.</em>"
Cover row: "Request forms that do the maths"
Beats:
1. "Fill in the request.<br><em>Totals follow as you type.</em>" An operator answers a request form
   (order lines: quantity × price, discount); calculated fields update while typing.
2. "Change a calculated value?<br><em>Use calculated value puts it back.</em>" Override, then the
   "Use calculated value" control under the field restores it.

Also new (card 2, max six rows, ≤ 90 chars each):
1. Hand the Agent a whole folder · Upload folder in the composer attaches every file in it · Agent
2. Skill versions you can open · Open, revert or unpublish a version; a Usage tab lists sessions · Skills
3. Files from Slack and Teams · Attach a file to your reply and the Agent's run carries on · Agent
4. One note thread per request · Everyone on a workflow run sees the same notes · Requests
5. Dates with a time · Include time on date columns, and numbers as progress bars · Data tables
6. See a step retrying · A Retrying pill on the canvas while a step tries again · Workflows
