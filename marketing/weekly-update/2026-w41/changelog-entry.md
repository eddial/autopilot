{% update date="2026-10-09" tags="new,improved,fixed" %}
## Week of 5 October

{% embed url="weekly-update-2026-w41.mp4" %}
Six things you can do in Lleverage this week, and where to find each one.
{% endembed %}

### Give a step to the Agent

A workflow can hand one of its steps to the Agent. Describe the task in plain words, for example "read the order email, match the customer and items in Exact Online, and draft the sales order", and the Agent does that step. It can use your tools, integrations and files. It can also ask a person when something is missing, such as a PO number.

You can also open the Agent beside the canvas while you work on a workflow. It already knows the workflow you have open. Ask it for a change, such as "check each line's price against our price agreements", and the steps it changes light up on the canvas.

**Find it:** Workflows › a workflow › **+** after a step › AI › **Agent**. To open the Agent beside the canvas: the **Agent** button at the top right of the workflow. [Agent step](../build-and-improve/automate/advanced-workflow-building/agent.md)

### Start a project from a template

Start a new project from one of six processes: Quote & Sell, Pay & Collect, Procure & Receive, Plan & Produce, Store & Ship, or Support. You can also start blank. Either way, the Agent sets the project up with you. It connects your systems and reads them before it asks you anything, then builds the Overview: your process, its volumes and its open work on one page. When it needs a lot of information from you, it offers to talk it through on a call.

**Find it:** Project switcher › **New Project** › a template or Blank project › Create. [Projects and solutions](../understand-lleverage/readme/projects-and-solutions.md)

### Improve a Skill from real feedback

A Skill is how the Agent does one job, such as reading purchase orders. Each Skill has a **Feedback** tab that collects every rating people gave on work where it was used. You can filter it to the negative ones to see what went wrong. Choose **Improve with agent**, and the Agent reads that feedback and drafts a change to the Skill. Nothing changes until a builder approves it.

**Find it:** Skills › a skill › **Feedback**, then **Improve with agent** in the skill's header. [Skills](../build-and-improve/intelligence/skills.md)

### Check the document before you decide

A request is where the Agent asks a person to decide, for example to approve an invoice that doesn't match its order. You can zoom into the attached scan to read a single line, drag around it, and click through every attachment without leaving the request.

If you sent a form in a workflow app too soon, choose **Edit and resubmit** on it. You get a new response, filled in with your earlier answers, so you only change what was wrong. This works on steps that allow corrections.

**Find it:** Requests › a request › Attachments, then the zoom buttons on the preview. For corrections: Apps › an app › a session › **Edit and resubmit**. [Requests](../run-operations/request-inbox.md)

### Talk to the Agent while you work

Start a voice call with the Agent and keep working: open any page in the project and the call comes with you. You can mute or hang up from wherever you are. While it works, the Agent tells you what it is finding.

**Find it:** Agent › **Call the agent** (the phone button in the message box). [Call with Agent](../run-operations/agent/call-with-agent.md)

### Work through records on a board

Show a data table as a board, with a lane for each status. Drag a card to the next lane, and the record's status changes with it. If you've changed which columns a saved view shows, **Reset to view** brings back the ones it was saved with.

**Find it:** Data tables › a table › a board view. Reset to view is under **Columns**. [Tables](../build-and-improve/intelligence/tables.md)

<details>

<summary>Also new</summary>

* **Invites that stay inside your company.** With single sign-on, people can only be invited with an address on your company's domains. Owners can allow other addresses under Organisation Settings › SSO.
* **Change a database password in one place.** The secret behind each database connection is listed on the Secrets page. On the Databases page, **Manage credentials** takes you there.
* **Linked records by name.** Cards, filters, record previews, the grid and table widgets show the name of the linked record.
* **A saved view on your Overview.** The Table widget can show a data table view, with that view's filters and sort.
* **Start a session from any project.** Each project card on the organisation overview has a **+** button that opens a new Agent session in that project.
* **The Agent checks with you before it puts a workflow live**, and it can run a workflow again after fixing it.
* **Up to 50 files in one message** to the Agent. If a file can't be used, it says why.
* **Claude Haiku 5.5 for quick steps.** Choose **Fastest** in any model picker.

</details>

<details>

<summary>Fixes</summary>

* The Requests page opens PDFs reliably after you approve a request, and your queue filters stay in place after a refresh.
* A shared link to a request opens that request, whatever view you are on.
* A voice call stays connected while you sign in to an integration.
* Large table imports that replace all rows finish without timing out.

</details>
{% endupdate %}
