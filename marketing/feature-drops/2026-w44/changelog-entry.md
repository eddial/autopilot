{% update date="2026-10-26" tags="new-releases,improvements,fixes" %}
## Week 44: runs that keep going

{% embed url="https://www.youtube.com/watch?v=<id>" %}

This week is about runs that keep going. A workflow the Agent runs asks you on a card when it needs an answer, the rest of a run can move to someone else in one go, and a run that stops halfway carries on from where it was.

### New features

* **Hand someone the rest of a run.** Reassigning a form step in a workflow run now offers two choices. **Reassign task** moves only this step, as before. **Reassign person** also moves every open step of that run that was with the first person, so the next form, such as **Confirm invoice details** after **Select supplier**, goes to the new person too. The step's header keeps the history of who it was assigned to. [Request input](https://docs.lleverage.ai/build-and-improve/automate/human-handoffs/request-input-page)
* **A workflow needs you? The Agent asks.** When the Agent runs a workflow from the chat and it stops at a Form, Chat, Record Voice or approval step, the chat shows that step as a card above the composer. Fill it in, for example a missing PO number, and the same run carries on to its end. [Use the Agent](https://docs.lleverage.ai/run-operations/agent/getting-started)
* **Carry on a run that stopped.** When an Agent run fails partway, **Continue** picks up where the Agent stopped, with every step it already took in that run. **Resend** still sends your last message again and starts over. [Use the Agent](https://docs.lleverage.ai/run-operations/agent/getting-started)
* **The Agent step saves to Files.** An Agent step in a live workflow can read and save Project Files, the way a **Write Project File** step does. A supplier invoice workflow can, for example, save each invoice check in an `invoice-checks` folder for the team. In Files, the **Source** filter has **From a workflow**. [Files](https://docs.lleverage.ai/build-and-improve/intelligence/files)
* **See what each bar is made of.** A bar chart on a data table can be stacked: choose **Stacked bar**, then the column to **Split by**, and each bar shows a coloured segment per value, such as orders per day by status. Horizontal bars stack the same way, and the Agent builds stacked charts when you ask for them. [Project overview](https://docs.lleverage.ai/run-operations/overview/project-dashboard)
* **Track a date with every run.** A metric's **Value Type** can be **Date**. The **Track Metric** step records a day, such as the delivery date an order confirmation promises, Activity shows it as a date, and Activity and Requests filter on it with a date picker, for example runs whose promised date is before the end of the month. [Metrics](https://docs.lleverage.ai/administer-and-govern/control/metrics)

### Improvements

* **The next step, one click away.** After each answer, up to three suggestions for the next step of the work sit in one row above the composer, such as running a workflow on new emails or connecting a system the work needs.
* **Requests views keep their filters.** Each view keeps your filter edits until you choose **Reset to view**, filters can be shown or hidden per view, and you stay in your view after completing a step. Hide the requests list to give a request the full width.
* **A sidebar grouped by what you do.** The project sidebar groups pages under **Automations** (Workflows, Skills, Channels, Schedules), **Intelligence** (Tables, Memory, Connections, Files, Knowledge), **Monitoring** and **Control**. Members, billing and project settings all open inside **Settings**. [Project navigation](https://docs.lleverage.ai/run-operations/overview/navigation)
* **Connect Notion and BigQuery from the chat.** Ask the Agent to connect Notion or Google BigQuery and it shows a sign-in card instead of asking for a token.
* **Agent steps reach every table in their project.** An Agent step in a workflow can read and write all the project's data tables, the way the workflow's Data Tables steps can.
* **Stop the Agent from Slack.** Say "stop" in the Slack thread and the Agent stops.
* **More on the Agent.** A finished skill build says what the skill still can't do. The Agent can list the organisation's members and invite someone, after an approval card. Item list fields can switch off deleting rows.
* **Dark mode in midnight blue.** The dark theme uses the Lleverage brand's midnight blue.

### Fixes

* Visitors of a public app can cancel their own runs.
* PDF previews load on Safari 17.
* Slack and Teams users without a seat are told they need one, with a link to ask for it.
* After you connect an integration from the chat, you land at the end of the conversation.
* A slow **Search Web** attempt stops after 10 seconds instead of holding up the run.
* SFTP steps no longer fail with an "isDate is not a function" error.
{% endupdate %}
