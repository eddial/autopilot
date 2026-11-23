{% update date="2026-11-23" tags="new-releases,improvements,fixes" %}
## Week 48: pages written like documents, and more ways to steer the Agent

{% embed url="https://www.youtube.com/watch?v=<id>" %}

Pages now work like a document: you type on them, add blocks between the lines, and the Agent can make a new page for you. You can also correct the Agent while it works, point at the exact spot in a report it made, and let schedules run only when there is something new.

### New features

* **Write a page like a document.** Pages and the Overview edit in place: type on any line, and press **/** for a block, such as a **Callout**, a **Table**, a **File** or a chart the Agent builds. Point at a block for its **+** and its handle, and drag it beside another block to share the row, up to six side by side. Each page has its own lock, so a finished page stays as it is. [Pages](https://docs.lleverage.ai/run-operations/overview/pages)
* **Ask the Agent for a new page.** Ask the Agent for a dashboard, for example the orders waiting on a PO per customer, and it creates a page in Pages and builds on it, with text, numbers and charts. Its answer links to the page, and the link opens it. A locked page stops the Agent from changing it. [Pages](https://docs.lleverage.ai/run-operations/overview/pages)
* **Edit your message while the Agent works.** **Edit**, the pencil under your message, works while the Agent is still working on it. Saving a change stops the run and sends the new words, for example to leave out a customer whose account is on hold. [Chat and sessions](https://docs.lleverage.ai/run-operations/agent/chat-and-sessions)
* **Point at a spot and tell the Agent.** When the Agent hands back an HTML page or a PDF, such as a weekly order report, turn on notes in the file panel's header and click a spot or select text. Write what should change there and press **Send to agent**: the note goes to the Agent with the spot quoted, and the pin clears once it has replied. [Session workspace](https://docs.lleverage.ai/run-operations/agent/session-workspace)
* **Run a schedule only when something is new.** A schedule can watch new requests and your data tables, under **Run only when something is new**. Before each run it checks them; with nothing added or changed since the last run, the run is skipped and starts no Agent session. **Recent runs** lists each one, and a skipped run says "Nothing new since" with the time it checked from. [Schedules](https://docs.lleverage.ai/administer-and-govern/control/schedules)
* **Set up an empty page with the Agent.** An empty Workflows, Data tables, Skills, Knowledge, Files or Apps page says what it is for and offers starters, such as **Import Data** and **Use a Template** on Data tables. **Set this up with the agent** opens the Agent beside the page with the request already written. [Tables](https://docs.lleverage.ai/build-and-improve/intelligence/tables)

### Improvements

* **Projects are now workspaces.** The app, emails and the Agent say workspace. Owners decide whether members can create workspaces, under **Members can create workspaces** in Organisation Settings.
* **Edit many schedules at once.** In Schedules, tick several schedules for **Edit selected**, **Pause** or **Resume**. The edit changes only the session, status or time zone you set. [Schedules](https://docs.lleverage.ai/administer-and-govern/control/schedules)
* **Take a tour of the Agent.** People new to the Agent get **Take the tour** on the agent page: short stops you try for real, each with a message to send and **Next Step** to move on.
* **An Overview page for each role.** Where a workspace had a different Overview per role, each version is now a page of its own, pinned at the top for that role. In Members, Roles, each role lists its pages with a switch. [Roles and permissions](https://docs.lleverage.ai/administer-and-govern/control/members/roles-and-permissions)
* **Close the page, keep the Agent.** With the Agent open beside a page, **Close page** in the page's header closes the page and gives the Agent the full width.
* **Connections in the session.** A connections panel in the Agent session names why a connection failed, and shows **Waiting** while someone else has to act.
* **More.** Drop files anywhere in the Agent chat. Email triggers can hand over the email as an .eml file, which opens as an email. The Agent offers once to schedule a skill or workflow you keep starting by hand. Live widgets show in the Agent chat. New chats start on Claude Sonnet 5.5, and GPT-6.2 Sol joins the model pickers. The Agent step in workflows is the **Lleverage Agent**. Requests show up to ten files as separate cards. The navigation's **New** is now **Ask AI**, with **New page** under your pinned pages.

### Fixes

* The workflow editor says why a save was refused, and **Create Test** works on a run whose form or trigger step was renamed since.
* Deleting a loop or Run Subworkflow step keeps its subworkflow while another step can still run it.
* A variable that a connection uses can't be deleted until the connection is disconnected.
* HTML dashboard widgets no longer turn black in dark mode, and the workflow runs usage email shows the right share of your allowance.
{% endupdate %}
