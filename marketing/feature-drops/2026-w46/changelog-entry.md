{% update date="2026-11-10" tags="new-releases,improvements,fixes" %}
## Week 46: pages the Agent builds with you

{% embed url="https://www.youtube.com/watch?v=W83CK6uB2RM" %}

This week is about the pages you run the work from. Describe a page and the Agent builds it, with widgets of its own design when a standard chart won't do, and you can change any page by hand. Working with the Agent gets more direct too: point at a row, paste a screenshot, and get drafts you can copy or send.

### New features

* **Describe a page, the Agent builds it.** Pages has its own place in the navigation, between Intelligence and Monitoring: the Overview first, then the project's own pages. **New page** asks what the page is for, for example "orders waiting on a PO, handling time per day and orders per customer this month", and the Agent names it, connects the data and builds it beside you, checking every widget before it hands it over. [Project overview](https://docs.lleverage.ai/run-operations/overview/project-dashboard)
* **The Agent builds custom widgets.** When a standard chart doesn't show what you need, such as a heat map of late orders per customer and weekday, the Agent draws the widget itself in HTML, in the Lleverage look. A widget can read the other live widgets on its page, and the Agent changes it with small edits when you ask. [Live widgets](https://docs.lleverage.ai/run-operations/overview/live-widgets)
* **Change a page by hand.** The pencil at the top of a page switches edit mode on. Move, resize and remove widgets, add one with the widget builder, and change the page's title and description in place. The cog sets the page width (Narrow, Default or Full). Every change saves as you make it. [Project overview](https://docs.lleverage.ai/run-operations/overview/project-dashboard)
* **Point the Agent at what you mean.** The pointer button next to the plus in the Agent's message box starts pointing. Click a row, a cell or a widget on the page, such as an order on hold, and it joins your next message with the value you clicked, so "Why is this one on hold?" needs no more explaining. [Use the Agent](https://docs.lleverage.ai/run-operations/agent/getting-started)
* **Paste a screenshot into the chat.** Paste an image into any Agent message box, such as a supplier's order confirmation, and it attaches with a thumbnail. Text you paste with it stays in the box, so the screenshot and your question go in one message. [Use the Agent](https://docs.lleverage.ai/run-operations/agent/getting-started)
* **Drafts you can copy or send.** An email the Agent writes for you shows as an email card with To, Cc, Subject and **Copy**. A message for a connected Slack or Teams shows in a box naming the channel, and **Send** posts it. A message for anywhere else gets **Copy**, line breaks and bullets included. [Use the Agent](https://docs.lleverage.ai/run-operations/agent/getting-started)
* **New requests, posted in Teams.** In **Organisation Settings**, **Channels**, a pinned Teams channel has a **Post new requests** switch. With it on, every new or reassigned request in the pinned project is posted in that channel, with its title, the project, who it's for and a link to open it. [Set up Microsoft Teams](https://docs.lleverage.ai/administer-and-govern/control/channels/set-up-microsoft-teams)

### Improvements

* **Live widgets show your runs.** A live widget can read the project's own measures: runs, requests and approvals, activity, and tasks automated.
* **Ask your database.** The Agent lists database connections, runs read-only queries on one, and links it to a **Query Database** step.
* **Sort a whole inbox at once.** Gmail **Modify Labels on Messages** labels or archives up to 1,000 emails in one action, so a clean-up needs one approval.
* **Add to a task in progress.** A message you send while the Agent works waits at the end of the chat, with **Send now** and a cross to discard it.
* **Clearer cards in the chat.** A workflow run comes back as one card with how it ended, its first outputs and **Open run**. A finished connection shows the account it connected. Approval cards lead with the question and fold the details under **Details**.
* **A failed save says so.** When a workflow autosave fails, **Couldn't save. Retry** shows beside the workflow's status, and leaving or publishing waits for the save.
* **A new look.** The light theme takes the brand's colours and rounded corners on every page, and the app follows your device's light or dark setting unless you choose one under **Theme**.
* **A fresh session in Teams or Slack.** Send `new session` in your direct chat with the Agent (or `/new` in Teams) to start over. The old session keeps its history in the web app, and **Open previous session** takes you back to it. [The Agent in Microsoft Teams](https://docs.lleverage.ai/run-operations/agent/agent-in-microsoft-teams)
* **Where you are, on every page.** A bar above every page shows the organisation and the project, and switches either.
* **Warnings in the form builder.** A number field's settings have a **Warnings** section, for checks like "the total doesn't match the lines", with a tolerance and a severity.
* **Boards set up by the Agent.** Ask the Agent for a board and it sets up a data table's Board view: the column to group by, card title, sort and lane order.
* **Request emails like the page.** Each request email says what you need to do, shows the request as its page does, and has one button.
* **More.** Form cards in the Agent chat take a file, files in a request keep your zoom, a copy of a default role lists what it can't carry, owners add SSO domains proven by DNS, Dynamics 365 Finance & Operations connects with an app registration, and publishing a workflow names the trigger connection to reconnect.

### Fixes

* Zoho CRM, Zendesk, Slack, Outlook, Excel, Google Drive, OneDrive and SharePoint errors say what went wrong.
* PDFs with more pages than the model accepts are read as text, and encrypted or malformed PDFs are indexed whole.
* Gmail retries after a dropped network connection, and Create Excel accepts sheet names that are numbers.
{% endupdate %}
