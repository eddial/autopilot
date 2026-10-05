# Rebuilding the Lleverage app UI

Read from `~/Sites/lleverage` (commit 3bf4bfa7b1, 30 Sep 2026). Paths are
relative to `apps/app/src/`. Re-read the component when a feature changed it.

## Tokens and type (`styles/globals.css`, `app/layout.tsx`, `tailwind.config.ts`)

Light theme is the default (org foundation `lightWarm`). HSL triplets:

| Token | Value | Token | Value |
| --- | --- | --- | --- |
| background | 48 33% 97% | primary | 230 35% 15% (navy) |
| foreground | 83 11% 14.1% | highlight | 24 84% 53.1% (orange) |
| card | 0 0% 100% | success | 145 35% 35% |
| muted | 50 18% 93% | destructive | 0 55% 40% |
| muted-foreground | 60 7% 43.9% | warning | 48 65% 42% |
| accent / secondary | 60 32% 91.4% | info | 210 45% 45% |
| border / input | 48 22% 87% | radius | 0.5rem |

Charts: chart-2 teal 170 35% 35%, chart-3 amber 35 50% 40%, chart-6 olive
85 30% 38%; activity "successful" = `color-mix(teal 55%, white)`.
Fonts: Public Sans (body), Roboto Mono, Abhaya Libre (rare). `text-sm` is
13px/20px, `text-xs` 12px/16px.

## Shell (`(dashboard)/layout.tsx`, `components/navigation/platform/*`)

- Frame `bg-muted`; page panel `bg-background rounded-l-xl` (both sides
  rounded when the agent sidebar is open), no border or shadow.
- Sidebar 240px, `p-1`; top row logo 32px button, lucide PanelLeft, project
  selector with border. Section labels 11px medium muted. Nav item
  `rounded-md p-1.5 text-13 font-medium gap-1`, icon 16px box; active
  `bg-border shadow-sm`; badge `bg-highlight` pill 16px.
- Pin icons (FA regular): Overview faHouse, Workflows faBolt, Data tables
  faFileSpreadsheet, Skills faStar, Requests faInbox, Monitoring faChartLine,
  Knowledge faBookOpen, Apps faPaperPlane; Agent pin uses the loader mark.
- Page header `px-8 pt-4`, h1 `text-xl font-semibold tracking-tight`.
  Section tabs `gap-5 border-b`, tab `py-2 text-sm font-medium`, active has a
  2px foreground underline.

## LleverageLoader (`components/lleverage-loader.tsx`)

7×7 grid, cell 6 units, lit rect 4×5, `shapeRendering=crispEdges`; lit cells
currentColor, unlit border. Shape rows: `.-----.`, `-##-##-`, `-#-#-#-`,
`--###--`, `-#-#-#-`, `-##-##-`, `.-----.`. Voice states: connecting (ripple),
listening (breathe 3s), user speaking (inner diamond pulses 0.9s), agent
speaking (corners pulse), working (sweep 1.4s). Implemented in
`toolkit/app.js` (`APP.loader`, `APP.drive`).

## Agent chat and voice (`components/agent/*`)

- Agent sidebar 400px, sits on the muted frame. Messages: user bubble right,
  `rounded-xl px-2 py-1.5`; assistant is plain prose with a 20px loader avatar.
- Tool steps: `text-xs muted`, 16px round `bg-border` icon dot, connector line,
  label + "(1.2s)"; header "Working…" / "Worked for 3s".
- Composer `rounded-2xl border bg-card`; footer: lucide Plus, model picker,
  mic (faMicrophone), and when the input is empty the call button
  (`s:faPhoneFlip`, title "Call the agent"); in a call it becomes
  `s:faPhoneHangup` on `bg-destructive/10`.
- Voice status above the composer: loader 20px + "Connecting…" / "Listening" /
  "Working on it" / "Speaking", `text-highlight`, "· Stop" link.
- Placeholder is a typewriter; "Ask the agent anything…" is fine.

## Overview widgets (`components/dashboard-grid/*`)

Card `rounded-xl border bg-card p-5`; header `h3 text-base font-semibold` +
xs muted suffix. Stat tile: 44px `bg-muted rounded-lg` icon box, number
`text-3xl font-medium`, label xs uppercase tracking. Greeting: eyebrow xs
semibold uppercase tracking-widest highlight, `text-4xl font-semibold`, name
in `<em>` medium 80% opacity. Recharts: dashed horizontal grid, 11px ticks,
bar radius 4 on top, maxBarSize 32.

## Data tables (`app/.../data-tables/[tableId]/components/`)

- Header: title `text-xl font-semibold` + chevron, view tabs, primary
  "New Record". Body card `rounded-lg border bg-card`; toolbar 52px with
  outline "Filter", search "Search records...", icon buttons faEye,
  faLayerPlus, faFileImport, faDownload, faSliders (Columns).
- Grid: header 48px semibold, rows 48px, row number column 56px xs muted,
  `border-r border-b`. Select badges: `rounded-full border px-2.5 py-0.5 text-xs`
  with `color-mix` 12% bg / 30% border / 75% text of the choice colour
  (#8b5cf6 #3b82f6 #06b6d4 #10b981 #f59e0b #ef4444 #ec4899 #6b7280).
- **List/Board switch lives in the Columns dialog** (`manage-columns-dialog`):
  "View" + toggle group (faTableList "List", faSquareKanban "Board",
  selected `bg-border`), then board settings: Group by (placeholder "Choose a
  column"), Card title, "Lane for records without a value", "Hide empty
  lanes". Number columns cannot group: tooltip "Numbers need ranges before
  they can make lanes."
- Board (`kanban-board.tsx`): lanes `w-64`, header grip + colour dot + label +
  count; lane body `rounded-lg bg-muted p-2 gap-2`, `bg-accent` while a card is
  over it; card `rounded-md border bg-card p-2.5 shadow-sm`, title
  `text-sm font-medium`, fields `dl` xs with `w-20` muted labels; dragged card
  ghost at opacity 40, overlay `shadow-md`.

## Skills and skill tests (`context/skills/[skillId]`, `components/skill-evals/*`)

- Header: back arrow, name, xs meta "Skill • …", "Unpublished Changes"
  secondary badge, Publish.
- Side panel (560px, floating) tabs Preview / Tests / Versions; spinner on
  Tests while running.
- Tests tab: "Tests run this skill against saved assertions.", outline h-7
  "New test", "Run all" (→ "Running…"). Rows `rounded-lg border p-3`: chevron,
  name, xs description, status pill, play, trash.
- Status pills: Passed `bg-success/10 text-success` faCheck, Failed
  destructive faXmark, Running info spinning faCircleNotch, Ready muted faVial.
- Expanded test: modes Results / Edit / Transcript; failure summary
  destructive with TriangleAlert ("1 of 3 checks failed. …"); Assertions card
  `bg-muted` header, items with faCheck / faXmark, expanded Reasoning (10px
  uppercase label) and Confidence Score.
- Instruction edits show as a line diff (`skill-field-diff.tsx`): added rows
  `bg-success/10` with a muted "+" gutter.

## Extracting icons

```sh
cd ~/Sites/lleverage/apps/app && node -e '
const r=require("@fortawesome/pro-regular-svg-icons");
const [w,h,,,p]=r.faHouse.icon; console.log(JSON.stringify([w,h,p]))'
```
Add the result to `FA` in `fa-icons.js` (prefix `s:` for pro-solid). Lucide
icons are inline SVG strings in `LU`.
