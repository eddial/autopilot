{% update date="2026-11-16" tags="new-releases,improvements,fixes" %}
## Week 47: a new navigation, and a closer look at your data

{% embed url="https://www.youtube.com/watch?v=<id>" %}

Every project now has one navigation: your pinned pages at the top, then one list of the chats and requests that need you. Builders reach every page of the project from one place. And the numbers on your pages open up: click one to see the records behind it, or see which workflows fill a widget.

### New features

* **Chats and requests in one list.** The foot of the navigation holds one list with three tabs: **Needs me** for the requests waiting on you, **Chats** for your conversations with the Agent, and **Completed**. An orange dot marks something new, and a request opens full page and reads like a chat, for example a missing PO number with the form to fill it in. Pinned pages keep their place above it, and **New** starts a chat. [Navigation](https://docs.lleverage.ai/run-operations/overview/navigation)
* **Every builder page in one place.** Builders get **Configure** at the top of the navigation. Point at it to see every page of the project grouped as Automations, Context, Monitoring, Integrations and Settings; **View all** opens the Configure page, with one line on what each page is for and **Search this project** across workflows, tables and pages. [Navigation](https://docs.lleverage.ai/run-operations/overview/navigation)
* **Click a number to see its records.** On a live widget, click a big number, a bar or a row and a side panel lists the records behind it, such as the six orders from Kuipers Hout waiting on a PO. The panel lists every condition that made the number (**Widget filter**, **Page** and **Clicked**), so the count matches, and a record opens with one click. [Live widgets](https://docs.lleverage.ai/run-operations/overview/live-widgets)
* **See where a widget's data comes from.** The line under a widget names its data table, for example **From Orders**. Open it to see the workflows that fill the table, what starts each one, when it last ran and when the table last changed, with a link to the table. The refresh button says when the data changes. [Project overview](https://docs.lleverage.ai/run-operations/overview/project-dashboard)
* **Steer the Agent while it works.** A message you type while the Agent works waits its turn below the conversation, with **Send now**, edit, copy and discard. **Send now** steers it into the work under way, for example a new delivery date, and the Agent carries on with it. **Stop** stays in view while you type, and the chat marks where you stopped. [Chat and sessions](https://docs.lleverage.ai/run-operations/agent/chat-and-sessions)
* **Approve with every detail in view.** When the Agent asks to change something in a connected system, such as creating a sales order in Exact Online, the approval lists every value it will send: the customer, your reference, the dates and the lines, with readable labels and dates. Secrets are never shown. [Use the Agent](https://docs.lleverage.ai/run-operations/agent/getting-started)
* **Copy a workflow to another project.** **Copy to project…** in a workflow's menu on the Workflows page puts a copy in another project of your organisation as an unpublished draft. It then lists what the copy still points at that the other project doesn't have, such as a data table or a connection, so you can point those steps at the right ones before you publish. [Build a workflow](https://docs.lleverage.ai/build-and-improve/automate/build-a-workflow)

### Improvements

* **Call the Agent again.** When a voice call ends, the chat shows where, with its length and **Call again**. During a call, a soft glow behind the message box shows who is talking, and mute shows a struck-through microphone. [Call the Agent](https://docs.lleverage.ai/run-operations/agent/call-with-agent)
* **View larger.** A table that's too wide or longer than ten rows gets **View larger**, which opens it full screen, in the Agent chat, on pages and in requests.
* **Archive or delete a chat.** Chat menus have **Archive** next to **Delete**, a right-click on a chat opens the same menu, and letters work as shortcuts while a menu is open.
* **A model for each schedule.** An Agent schedule runs on the model and effort you pick, and the Agent picks a lighter model for routine checks. The model picker is simpler: choose Claude or GPT, then slide the effort. A chat a schedule started shows a small clock. [Schedules](https://docs.lleverage.ai/administer-and-govern/control/schedules)
* **Approve from Teams.** Approvals, choices and connection buttons from the Agent arrive in Teams as a card with buttons, as they do in Slack. A document the Agent makes in a group chat or channel is also offered in your personal chat, to save to OneDrive. [The Agent in Microsoft Teams](https://docs.lleverage.ai/run-operations/agent/agent-in-microsoft-teams)
* **Alert groups you can manage.** In Organisation Settings, Notifications, **Alert groups** have **Edit** and **Delete** and list the alerts that use them; the bell on an activity view manages them too. [Alerts](https://docs.lleverage.ai/build-and-improve/monitoring/alerts-system)
* **Pages by role.** A role can be limited to specific pages, as with tables and workflows, and everyone opens a project on the top page they can see. Admins can view the project as another role after switching on **Show role switcher** under My Account.
* **Clearer widgets.** A widget with nothing to show says "Nothing yet for this period", charts name every bar and fill every day, and number cards share one layout.
* **Read-only workflows.** Someone whose role can view but not edit workflows opens a workflow read-only, with its versions, runs and tests.
* **Runs that explain themselves.** A failed run that can't be retried says why, a trigger request that was refused shows in Activity as **Not started**, and a connection that lacks a permission names it in plain words.
* **More.** The connection link page and email say what the connection will do and list the permissions the provider will ask for, a bounced link email shows as such, a new connection suggests a first thing to ask the Agent, and new users choose between a tour and getting straight to work.

### Fixes

* Outlook attachments download when the setting was never saved, and file names with accents download with their real name.
* Long text in a live widget cell is cut instead of left out, and a request table keeps its rows when a cell is outside its choices.
* Moving a pinned item in the navigation no longer reloads the page, and Gmail search returns whole To and Cc addresses.
{% endupdate %}
