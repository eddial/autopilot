{% update date="2026-10-09" tags="new,improved,fixed" %}
## Week of 5 October

{% embed url="weekly-update-2026-w41.mp4" %}
This week in Lleverage: the five highlights, each showing where to find it.
{% endembed %}

### The Agent step is available to everyone

Hand a workflow task to an agent that can use tools, integrations and files. The Agent step no longer needs a feature flag and has lost its alpha badge. It is listed first under **AI** when you add a step. The old step is now called **Agent (legacy)**. Existing workflows keep running on it, but new workflows can't add it any more. The Agent sidebar also opens in the workflow editor, from the **Agent** button at the top right of the canvas.

**Find it:** Workflows › a workflow › **+** after a step › AI › Agent. [Agent step](../build-and-improve/automate/advanced-workflow-building/agent.md)

### Guided setup for a new project

A blank project gets a setup plan the Agent works through. The Agent connects your systems and reads them before it asks you anything, builds the Overview as an operational dashboard, and links to each page it mentions. New projects can also start from one of six templates: Quote & Sell, Pay & Collect, Procure & Receive, Plan & Produce, Store & Ship, or Support.

**Find it:** Project switcher › **New Project** › Blank project (or one of the six templates) › Create › Agent. [Projects and solutions](../understand-lleverage/readme/projects-and-solutions.md)

### Voice calls follow you across the project

Open another page during a call and the call keeps going. It moves into the Agent sidebar, or into a small pill with mute and hang-up when no chat is visible. The voice keeps pace with the transcript and no longer goes quiet after it promises work.

**Find it:** Agent › **Call the agent** (phone button in the message box) › open any page. [Call with Agent](../run-operations/agent/call-with-agent.md)

### Data tables and boards

When you drop a card into another lane on a board, it stays there. Saved views have **Reset to view** in the column menu. Relationship fields show the linked record's name wherever they used to show an id or `[object Object]`: on cards and boards, in the record preview, filters and grid, and in table widgets.

**Find it:** Data tables › a table › a board view (and **Columns › Reset to view** on a saved view). [Tables](../build-and-improve/intelligence/tables.md)

### SSO invites stay on your domains

With SSO on, invites only go to addresses on your organisation's SSO or verified domains. Owners can switch this off. No existing member is removed.

**Find it:** Project menu › Organisation Settings › Members › Add Member. Owners switch it off under Organisation Settings › SSO. [Members](../administer-and-govern/control/members/README.md)

<details>

<summary>Improvements</summary>

* **Table widget shows a saved view.** Pick a data table view in the Table widget, and its filters and sort come with it. Overview › Edit › Table widget › View.
* **Zoom into request attachments.** Zoom, fit and drag image previews, and click through every attachment. Requests › a request › attachment.
* **Preview files before you submit a form.** Works on app start forms, request forms and the item editor.
* **Feedback tab on every Skill.** Builders see the feedback from sessions where the Skill ran. Skills › a skill › Feedback.
* **Claude Haiku 5.5 is the Fastest preset.** Haiku 4.5 moves to legacy.
* **Shared request links open the request** even when your current view is empty, and queue filters survive a refresh.

</details>

<details>

<summary>Fixes</summary>

* Fixed the Requests page crashing on some PDFs after approving.
* Fixed the filter values panel opening under the menu instead of beside it.
* Fixed voice calls ending during an integration sign-in.

</details>
{% endupdate %}
