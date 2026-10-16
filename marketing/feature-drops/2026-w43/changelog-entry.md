{% update date="2026-10-19" tags="new-releases,improvements,fixes" %}
## Week 43: the Agent works with your team

{% embed url="https://www.youtube.com/watch?v=<id>" %}

This week the Agent learned to work with the people around it. It can hand part of a job to a colleague and carry on with their answer, learn a process by watching you do it on a screen call, and it checks with you before it runs or removes anything that needs approval.

### New features

* **Hand a task to a colleague.** Ask the Agent to involve someone, such as "have Mila approve the 8% discount", and it sends them a task. They answer it on a card like a request, or work through it with their own Agent. When they're done, your session picks up their answer and carries on. [Requests](https://docs.lleverage.ai/run-operations/request-inbox)
* **Walk the Agent through your process.** On a voice call, share your screen and show how you handle, for example, an order in Exact Online. The Agent asks as you go and saves each step, screen, field and exception as notes in your Project Files. Then ask it to build a Skill or Workflow from those notes. [Call with Agent](https://docs.lleverage.ai/run-operations/agent/call-with-agent)
* **The Agent asks before it acts.** Before it runs a Workflow that a Skill attaches with **Approval** on, switches a live version off, or deletes a Workflow that is in use, the Agent shows an approval card. For a Workflow in use, the card lists what uses it and what each would lose. [Access and approvals](https://docs.lleverage.ai/run-operations/agent/agent-context/access-and-approvals)
* **The composer finishes your sentence.** After each answer, a suggested next message waits in the composer, and what you type is completed in grey. Press **Tab** to take it. [Use the Agent](https://docs.lleverage.ai/run-operations/agent/getting-started)
* **Copy a skill into another project.** Choose **Copy to project…** in a skill card's menu on the Skills page. The copy lands in the other project as a draft, and the dialog lists what stays behind. [Skills](https://docs.lleverage.ai/build-and-improve/intelligence/skills)
* **Request forms that do the maths.** A form field can follow a formula over other fields, the picked record and line items, and updates while the person fills it in. The value stays editable, and **Use calculated value** puts it back. [Request input](https://docs.lleverage.ai/build-and-improve/automate/human-handoffs/request-input-page)

### Improvements

* **Hand the Agent a whole folder.** **Upload folder** in the composer's plus menu, or drop a folder on the composer, attaches every file in it, named by its path.
* **Skill versions you can open.** In a skill's **Versions** tab, open a version read-only, revert to it, or unpublish the active one. The **Usage** tab lists the sessions that used the skill, and the **Activity** tab lays a build out as one timeline.
* **Files from Slack and Teams.** When the Agent asks for a file in Slack or Teams, attach it to your reply and the run carries on. On the web, the conversation shows as one thread.
* **One note thread per request.** The notes under a request cover its whole Workflow run, so an approver reads the booker's notes and the other way round. [Requests](https://docs.lleverage.ai/run-operations/request-inbox)
* **Dates with a time, and progress bars.** A date column's **Format** menu has **Include time**, and a number column can show as a **Progress bar**.
* **See a step retrying.** On the Workflow canvas, a step with retries shows a **Retrying** pill while they run, and its trace row reads "Retrying (2/3)".
* **More on records and requests.** A card's **Timeline** shows who changed which field, from what to what. Archive several requests at once from the requests inbox. Pick a shared view in the **Table** widget, and download a Files folder as one zip.
* **Run a scheduled Workflow now.** Anyone who can run Workflows can start a scheduled Workflow's live version by hand.

### Fixes

* A cancelled sign-in to an integration shows as cancelled, not connected.
* Filters on Requests metrics include every match, also past 1,000 sessions.
* Gmail **Get Attachment** returns the real file, and Zoho CRM **Get Related Records** works with **Fields**.
* Uploading the wrong kind of file to the Agent's file request is refused with the reason.
{% endupdate %}
