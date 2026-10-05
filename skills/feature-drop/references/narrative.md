# The autonomous back office

The story behind every feature drop. Posts, the carousel and the drop page
must fit inside it. The video does not tell the story; it shows the feature
(see `copy.md`).

Sources, in this order. Re-read them for every drop:
1. **Internal product vision** ("vision-context", product team, October 2026):
   what the autonomous back office is, how autonomy is earned, how the ERP
   fits. Summarised below; it shapes angles and claims. Quote only the lines
   marked quotable here.
2. **`delta:lleverage-content-voice`** and its `references/brand-context.md`
   (brand workshop, March 2026): voice, message house, audience narratives,
   proof points, banned phrases.
3. **lleverage.ai**: the public wording, the six solution areas, customer
   results.

## The core frame

**Lleverage is building the autonomous back office for manufacturers,
distributors, wholesalers and other physical-goods companies.**

That does not mean replacing the ERP, removing every person, or turning every
process into an agent. It means taking the recurring operational work that
lives across the ERP, inboxes, spreadsheets, documents, approvals and people's
heads, making that work visible, and then **progressively taking
responsibility for more of it**.

Quotable: "The ERP remains the system of record. Lleverage operates the work
around it." · "More of the back office, operated with less human effort,
deployed faster each time."

## Who it is for

Companies that make, move, buy or sell physical goods and run a substantial
operational back office: manufacturing, wholesale, distribution, logistics.
ERP-centric (Exact, Business Central, SAP, AFAS, Sage, Dynamics 365,
Navision), lots of email and documents, high transaction volume, many
exceptions, knowledge sitting with specific people.

They already have an ERP; that is not the problem. **The ERP captures only
part of how the company runs.** Much of the work happens before, around and
after the ERP transaction: reading the email, interpreting the attachment,
finding the customer, order, SKU or invoice, checking whether something is
allowed, comparing it with ERP state, asking for missing information,
handling the exception, updating the ERP, replying, keeping the evidence,
checking the case actually completed. That is where the manual work sits.

Readers of the posts: operators (order desk, purchasing, finance, customer
service, planning), managers and controllers, the builders who set processes
up, and IT.

## How work changes

Today: **a person gets a signal → opens the ERP → searches → interprets →
decides → updates the ERP → sends a response.**

With Lleverage: **the signal arrives → Lleverage interprets the context →
reads the ERP → does what it is allowed to do → asks a person only where
needed → updates the ERP → carries the process on.**

What it should feel like (use these to pick the audience and angle of a post):
- **Operator**: "The system already knows what this is about. It has the ERP
  context. It has done the obvious work. It is asking me only for the part
  that actually requires me."
- **Manager**: "I can see where the operation is slow, manual or error-prone,
  what we have automated, whether it actually improved, and where to go next."
- **Builder**: starts from prior knowledge; the agent gathers, builds and tests
  much of the implementation; people solve the genuinely new parts.
- **IT**: "I can see what the agent can access, what it is allowed to do, who
  owns it, what changed and why."

## Autonomy is earned, step by step

The autonomous back office is not "AI runs everything". It is a controlled
progression in responsibility, **per step of a process**, not per process:

| Level | Meaning |
| --- | --- |
| By hand | A person does the step. |
| Assisted | The agent prepares; a person does or finishes it. |
| Supervised | The agent does it; a person checks or approves. |
| Autonomous | The agent does it within limits people set; exceptions go to a person. |

Example, order intake: receive order and read the attachment are autonomous;
matching customer and SKU are supervised; checking commercial terms is
assisted; approving an exception is by hand; creating the ERP order and
sending the confirmation are autonomous. That is an autonomous back office:
most of the work is done by software, and people stay where they add value
or hold authority.

The question is always **"which parts of this process have earned more
responsibility?"**, answered with evidence: success rate, intervention and
correction rates, exceptions, test and replay results, confidence, and the
business impact of a mistake. A good system "optimises for doing only what
it has earned the right to do" (quotable).

Underneath: **the process is stable, the step is the unit of improvement,
the executor is interchangeable** (a person, an agent, a workflow, a skill,
an integration, or a mix). A step can move from by hand to autonomous while
the process stays recognisable.

## Where people belong (guiding principle; never quote it as a slogan)

People should not be trapped in repetitive work, pumping data from one system
into the next. In the autonomous back office they:
1. **take the decisions that need them**: exceptions, judgement, authority
   ("approve, choose, correct, confirm, provide missing information");
2. **steer the agents**: set and approve the business rules, check the work,
   correct mistakes, decide which steps have earned more responsibility;
3. **improve the process**: every correction and every rule they approve
   makes the next case, and the next process, easier.

The product hands work to people through **Requests**: when a step reaches
uncertainty or an authority boundary, it asks the right person, waits, and
continues with their answer. Show this in examples (an order without a PO
going to the order desk, an invoice outside tolerance going to finance)
rather than stating the principle. Never write "work on the process, not in
it" or similar slogans.

## What makes it trustworthy

- **Business rules are explicit**: visible, attributable, testable,
  versioned. The agent can propose rules; people approve the important ones.
  Memory does not silently become policy.
- **Guardrails**: value and confidence thresholds, approvals, shadow mode,
  limits on write actions, validation before commit, duplicate protection.
- **Provenance**: for every change, what changed, what triggered it, which
  process and step, under whose authority, from which source data, and why.
- **Permissions**: what the agent can do is separate from what it may do.
- Site trust lines: "Agents ask before they act. You approve what matters." ·
  "Every step logged end to end. Trace any decision back to its source." ·
  "Your data stays in Europe." · SOC 2 Type II, ISO 27001, GDPR, EU hosted,
  zero retention.

## The value language

Keep it simple: **cost, mistakes, bottlenecks**. Every feature should help a
customer see or reduce at least one of them. Three things compound over time:
**more autonomy** (by hand → autonomous), **more operational depth** (one
process → more steps → more processes → more of the back office), and
**faster time to value** (reusable domain knowledge, agent-led
implementation, less effort per deployment).

## The six core processes (site)

Features are generic. Do not label a feature with a process; take the
example from one.

| Process | Site line | Typical steps | Typical decisions for people |
| --- | --- | --- | --- |
| Quote & Sell | "Turn quote requests and incoming orders into accurate records in your ERP." | read order, match customer and SKU, check terms, create order, confirm | missing PO, terms outside the agreement, unusual configuration |
| Source & Procure | "Send purchase orders, match supplier confirmations and flag deviations." | compare confirmation with PO, update dates, chase late suppliers | changed quantity or date that affects customers |
| Plan & Produce | "Track orders, schedules and shipments, and adjust the plan when things change." | track orders and receipts, spot shortages | what to re-plan and who to tell |
| Deliver & Support | "Answer customer questions with full context on orders, stock and delivery." | find order, check shipment and stock, reply | complaints, returns, exceptions |
| Pay & Collect | "Match invoices to purchase orders and receipts, flag variances and post approved records." | extract, three-way match, post inside tolerance, reconcile, remind | variances, approvals, releasing payments |
| Govern & Enable | "Keep master data accurate and consistent across your systems." | detect duplicates, enrich, write back | create vs reuse, conflicting records |

## Product differentiators

Use them to choose angles; name the one a feature shows on the drop page.

1. **Built for champions.** Most AI tools depend on every person adopting
   them. Lleverage expects a few champions per team and lets them push working
   skills and workflows to everyone else.
2. **A workspace for teams.** Memory, skills and workflows belong to the team,
   not to one person's chat.
3. **Agents and workflows in one process.** Agents for interpretation and
   judgement, workflows for deterministic, repeatable steps, people through
   Requests, mixed per step.
4. **Built for the messiness of reality.** Building, testing and improving
   skills and workflows is part of the product, with playbooks.
5. **Autonomy earned per step.** From by hand to autonomous, on evidence,
   with monitoring, guardrails and human handoffs.
6. **Works on the ERP, connects to any system.** Direct ERP actions and
   lookups, conversational access to ERP data, connectors created in the app,
   fine-grained permissions.
7. **Forward deployed engineers**, increasingly reviewing what the agent
   builds rather than building from scratch.

## What Lleverage is not

Not a replacement ERP, a generic chatbot, a low-code app builder, a BI tool, a
pure workflow engine, an RPA vendor or a process-mapping consultancy. Copy
never positions a feature as one of those. Against them: ERPs hold the
records but not the work around them; workflow tools and RPA break on messy,
judgement-heavy input; generic copilots do not run persistent, governed work
on the ERP.

## Placing a feature in the story

Answer these for every feature before writing; put the answers on the drop
page, one line each.

1. **What does it let someone do?** In product terms, from the change log and the PR.
2. **Who is it for?** Operator, manager, builder or IT.
3. **What does it move?** At least one of: more steps run on their own; people
   get asked only for what needs them (Requests, exceptions); people steer the
   agents (rules, tests, approvals, corrections); the operation becomes visible
   (cost, mistakes, bottlenecks); more control and trust (permissions,
   provenance, guardrails); faster to implement.
4. **Which differentiator does it show?** Number from the list, or none.
5. **Which process gives the clearest example?** One row from the table.

Example, first drop (week 39, 2026):

| Feature | For | Moves | Differentiator | Example |
| --- | --- | --- | --- | --- |
| Talk to your ERP (voice calls with the agent) | operator, manager | operation visible; ask the ERP directly | 6 | Order intake: "which orders are waiting for a PO number?" |
| Board view for data tables | operator | people get the exceptions only | 3 | Supplier invoices grouped by match status |
| Skill tests | builder | autonomy earned on evidence | 4, 5 | An order intake skill tested against saved orders |

## Proof points

Quote exactly and only for the same process; never invent numbers. Site:
Koninklijke Dekker "92% of orders straight through, untouched" · Topa "90%+ of
incoming orders automated" · SPL Treatments "Purchase orders read 20x faster"
· J. Kisch & Zonen "36% lower DSO". Brand reference outcomes (order ~15 min →
~2 min, invoice ~12 min → ~90 sec, 60–80% touchless invoices) are typical
results, not one customer's: say so.

## Vocabulary

| Use | Avoid |
| --- | --- |
| the agent; Llev (in-app name of the platform agent) | coworker, co-worker, colleague (for the agent), assistant, copilot, bot |
| by hand, assisted, supervised, autonomous (per step) | "fully automated" for a whole process, "AI runs everything" |
| earned more responsibility, on evidence | flip a switch, set and forget |
| voice call | phone call, "call" on its own |
| the order desk, finance, purchasing, planning, the controller; the person who owns the decision | users, resources, "humans in the loop" as a noun |
| the ERP is the system of record; Lleverage works on it and around it | replace your ERP, rip and replace |
| cost, mistakes, bottlenecks | digital transformation, efficiency gains (without numbers) |
| exceptions, decisions that need a person | edge cases (in customer copy) |
| the ERP by name when it fits (Exact, SAP, Business Central) | "your systems" when a specific one fits |
