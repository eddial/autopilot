{% update date="2026-10-09" tags="new,improved,fixed" %}
## Week of 5 October

{% embed url="weekly-update-2026-w41.mp4" %}
This week in Lleverage: six highlights from 2–8 October, each showing where to find it.
{% endembed %}

### The Agent in every workflow

The Agent step is available to everyone. It no longer needs a feature flag or carries an alpha badge, and it is listed first under **AI** when you add a step. Use it to hand a workflow task to an agent that can use tools, integrations and files. The old step is now **Agent (legacy)**. Existing workflows keep running on it, but new workflows can't add it.

The Agent sidebar has also replaced the old workflow copilot. Open it from the **Agent** button at the top right of the canvas, and it takes the open workflow, with its version, as context. Steps the Agent adds or changes glow briefly on the canvas.

**Find it:** Workflows › a workflow › **+** after a step › AI › Agent. For the sidebar: Workflows › a workflow › **Agent** (top right of the canvas). [Agent step](../build-and-improve/automate/advanced-workflow-building/agent.md)

### Project templates and guided setup

A new project can start from one of six process templates: Quote & Sell, Pay & Collect, Procure & Receive, Plan & Produce, Store & Ship, or Support. It can also start blank. A blank project gets a setup plan the Agent works through. The Agent connects your systems and reads them before it asks you anything, builds the Overview as an operational dashboard, and links to each page it mentions. When it needs a lot from you, it offers a voice call.

**Find it:** Project switcher › **New Project** › a template or Blank project › Create › Agent. [Projects and solutions](../understand-lleverage/readme/projects-and-solutions.md)

### Skills that learn from feedback

Every Skill page has a **Feedback** tab, next to Preview, Tests and Versions. It shows the feedback people gave on sessions where that Skill ran. Builders can mark each item as reviewed, and the Agent can propose an improvement to the Skill based on it. Nothing is saved until the builder approves the change.

**Find it:** Skills › a skill › **Feedback**, then **Improve with agent** (robot button in the skill header). [Skills](../build-and-improve/intelligence/skills.md)

### Requests and app forms

You can zoom into image attachments on a request: use the zoom and fit buttons, Ctrl/Cmd + scroll or double-click, and drag to move around. You can also click through every attachment on the request. On app forms, you can preview a file you have uploaded before you submit. In a workflow app session, **Edit and resubmit** on an answered step lets you correct it and send a new response, where the step allows it.

**Find it:** Requests › a request › Attachments › zoom buttons. For corrections: Apps › an app › a session › **Edit and resubmit**. [Requests](../run-operations/request-inbox.md)

### Voice calls that follow you

Open another page during a call and the call keeps going. It moves into the Agent sidebar, or into a small pill with mute and hang-up when no chat is visible. The Agent uses its working time on a call to tell you what it is finding. It no longer goes quiet after it promises work.

**Find it:** Agent › **Call the agent** (phone button in the message box) › open any page. [Call with Agent](../run-operations/agent/call-with-agent.md)

### Data tables and boards

When you drop a card into another lane on a board, it stays there. Saved views have **Reset to view** in the column menu. Relationship fields show the linked record's name wherever they used to show an id: on cards and boards, in the record preview, filters and grid, and in table widgets. A Table widget can show a saved view, and that view's filters and sort come with it.

**Find it:** Data tables › a table › a board view › **Columns** › Reset to view. [Tables](../build-and-improve/intelligence/tables.md)

<details>

<summary>Improvements</summary>

* **SSO invites stay on your domains.** With SSO on, invites only go to addresses on your organisation's SSO or verified domains. Owners can switch this off under Organisation Settings › SSO, and no existing member is removed.
* **Rotate database credentials.** A Secret linked to a database connection now shows on the Secrets page, marked "Used by <connection>". On the Databases page, **Manage credentials** links to it.
* **New Agent session from a project card.** Each card on the organisation overview has a **+** button that opens a new session in that project's Agent.
* **The Agent asks before it puts a workflow live**, and it can re-run a workflow after fixing it.
* **Up to 50 files per message** to the Agent. When a file is refused, you see why.
* **Claude Haiku 5.5 is the Fastest preset.** Haiku 4.5 moves to legacy.

</details>

<details>

<summary>Fixes</summary>

* Fixed the Requests page crashing on some PDFs after approving. Queue filters now survive a refresh.
* Fixed a shared request link not opening the request when your current view was empty.
* Fixed voice calls ending during an integration sign-in.
* Fixed large replace-mode table imports timing out after the table was cleared.

</details>
{% endupdate %}
