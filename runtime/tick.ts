// Scheduler. Cron runs `autopilot tick` every minute; each due signal, schedule, health report and
// the launcher runs as its own detached process, guarded by the PID in state.json.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, HOME, CONFIG, STATE_DIR, config, readDir, readMd, section, instructions, duration, withState, readState, job, succeeded, failed, alive, log, claude, unwatch } from './lib.ts';

const [cmd, ...args] = process.argv.slice(2);
const now = new Date();
const iso = (d: Date | number) => new Date(d).toISOString();

function detach(key: string, argv: string[]) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const out = fs.openSync(path.join(STATE_DIR, 'tick.log'), 'a');
  const child = spawn(process.execPath, [import.meta.filename, ...argv], { cwd: ROOT, detached: true, stdio: ['ignore', out, out] });
  child.unref();
  withState(s => { job(s, key).pid = child.pid; });
}

// m h dom mon dow; each field a list of *, n, a-b, with optional /step.
function cronMatch(expr: string, d: Date) {
  const vals = [d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()];
  return expr.trim().split(/\s+/).every((f, i) => f.split(',').some(part => {
    const [range, step] = part.split('/');
    const [lo, hi] = range === '*' ? [0, 99] : range.split('-').map(Number);
    return vals[i] >= lo && vals[i] <= (hi ?? (step ? 99 : lo)) && (vals[i] - lo) % Number(step ?? 1) === 0;
  }));
}

// The latest minute in the last 24 hours that matches, so a run missed while the laptop slept runs on wake.
function lastMatch(expr: string, d: Date) {
  const minute = Math.floor(+d / 6e4) * 6e4;
  for (let i = 0; i < 1440; i++) { const t = new Date(minute - i * 6e4); if (cronMatch(expr, t)) return t; }
  return null;
}

// The laptop sleeps and changes networks. A tick that finds a gap since the previous one (sleep) or no
// network does nothing, and that time does not count towards a job's failing time.
const WAKE_GAP = 5 * 6e4;
async function online() {
  const ok = (url: string) => fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) }).then(() => true, () => false);
  return (await Promise.all(['https://api.linear.app', 'https://api.anthropic.com'].map(ok))).every(Boolean);
}
const restartFailingClocks = () => withState(st => {
  for (const j of Object.values(st.jobs)) if (j.failing_since) j.failing_since = iso(now);
});

// delay: leaves the newest messages out of the window, so the owner can answer them first.
const lag = (sig: { meta: any }) => sig.meta.delay ? duration(sig.meta.delay) : 0;

async function tick() {
  if (!fs.existsSync(CONFIG) || !config.linear_team) return log('tick', `no linear_team in ${CONFIG}; run \`autopilot setup\`, then /autopilot:init`);
  const prev = readState().last_tick;
  withState(st => { st.last_tick = iso(now); });
  if (prev && +now - +new Date(prev) > WAKE_GAP) {
    restartFailingClocks();
    return log('tick', `woke after ${Math.round((+now - +new Date(prev)) / 6e4)}m; resuming next tick`); // network and connectors need a moment
  }
  if (!await online()) {
    if (!readState().offline_since) { withState(st => { st.offline_since = iso(now); }); log('tick', 'offline; pausing'); }
    return;
  }
  const offline = readState().offline_since;
  if (offline) {
    withState(st => { st.offline_since = null; });
    restartFailingClocks();
    log('tick', `online again after ${Math.round((+now - +new Date(offline)) / 6e4)}m`);
  }
  const s = readState();
  for (const sig of readDir('signals')) {
    const key = `signal:${sig.name}`, j = s.jobs[key] ?? {};
    if (sig.meta.paused === true || !sig.meta.tools?.length || alive(j.pid)) continue;
    // cron: a digest signal runs on its schedule over everything since its previous run; a failed run
    // is retried every `every:` until it succeeds.
    if (sig.meta.cron) {
      const sameMinute = j.last_run && iso(now).slice(0, 16) === j.last_run.slice(0, 16);
      const retry = j.failing_since && sig.meta.every && +now - +new Date(j.last_run!) >= duration(sig.meta.every);
      if (!sameMinute && (cronMatch(sig.meta.cron, now) || retry)) {
        withState(st => { job(st, key).last_run = iso(now); });
        detach(key, ['signal', sig.name]);
      }
      continue;
    }
    if (!j.last_checked) { withState(st => { job(st, key).last_checked = iso(now); }); continue; } // first run: no backfill
    // last_checked is where the previous window ended, which is now − delay for a delayed signal.
    if (+now - lag(sig) - +new Date(j.last_checked) >= duration(sig.meta.every)) detach(key, ['signal', sig.name]);
  }
  for (const sch of readDir('schedules')) {
    const key = `schedule:${sch.name}`, j = s.jobs[key] ?? {};
    if (!j.last_run) { withState(st => { job(st, key).last_run = iso(now); }); continue; } // first sight: no backfill
    const due = lastMatch(sch.meta.cron, now);
    if (!alive(j.pid) && due && +due > +new Date(j.last_run)) {
      withState(st => { job(st, key).last_run = iso(now); });
      detach(key, ['schedule', sch.name]);
    }
  }
  if (!alive(s.jobs.launcher?.pid)) detach('launcher', ['launch']);
  // Watchers: due every `every`; the run itself checks the issue's status (watch.ts).
  for (const [id, w] of Object.entries(s.watchers)) {
    const key = `watch:${id}`;
    if (alive(s.jobs[key]?.pid) || (w.last_run && +now - +new Date(w.last_run) < duration(w.every))) continue;
    withState(st => { if (st.watchers[id]) st.watchers[id].last_run = iso(now); });
    detach(key, ['watch-run', id]);
  }
  // Health: report after 60 minutes and 3 runs of failure, or on a capped window; close once runs succeed.
  // The run count keeps a single failure followed by sleep (a laptop's dark wake) from counting as an hour.
  for (const [key, j] of Object.entries(s.jobs)) {
    if (key.startsWith('health:') || alive(s.jobs[`health:${key}`]?.pid)) continue;
    const failing = !!j.failing_since && (j.failures ?? 0) >= 3 && +now - +new Date(j.failing_since) >= 60 * 6e4;
    if ((failing && !j.health_reported) || j.gaps?.length) detach(`health:${key}`, ['health', key, 'open']);
    else if (!j.failing_since && j.health_reported) detach(`health:${key}`, ['health', key, 'close']);
  }
}

const ITEMS_SCHEMA = {
  type: 'object', required: ['items'], properties: { items: { type: 'array', items: {
    type: 'object', required: ['source', 'source_url', 'from', 'subject', 'snippet', 'action', 'reason', 'searches', 'workstream', 'priority', 'issue'], properties: {
      source: { type: 'string' }, source_url: { type: 'string' }, from: { type: 'string' }, subject: { type: 'string' },
      snippet: { type: 'string' }, action: { enum: ['created', 'updated', 'dropped'] }, reason: { type: 'string' },
      // The list_issues queries actually run for this item: empty only when the gate dropped it.
      searches: { type: 'array', items: { type: 'string' } },
      workstream: { type: ['string', 'null'] }, priority: { type: ['integer', 'null'] }, issue: { type: ['string', 'null'] },
    } } } },
};

// --dry=<minutes>: preview a window of that length; read-only Linear tools, nothing filed, no state or log written.
// The team's active issues go into every signal run, so matching a follow-up does not depend on the model
// remembering to search. Without the list (Linear unreachable, no key) it falls back to its own searches.
async function activeIssues(): Promise<string> {
  try {
    const { gql } = await import('./launch.ts');
    const nodes = (await gql(`query($f: IssueFilter) { issues(filter: $f, first: 250, orderBy: updatedAt) { nodes {
        identifier title description state { name } project { name } } } }`,
      { f: { team: { key: { eq: config.linear_team } }, state: { type: { nin: ['completed', 'canceled'] } } } })).issues.nodes;
    return nodes.map((i: any) => `- ${i.identifier} [${i.state.name} · ${i.project?.name ?? 'no project'}] ${i.title}: ` +
      (i.description ?? '').replace(/\s+/g, ' ').slice(0, 300)).join('\n') || '(none)';
  } catch (e) { return `(could not list them: ${(e as Error).message.slice(0, 200)}; use the searches)`; }
}

async function runSignal(name: string, dry?: number) {
  const key = `signal:${name}`;
  try {
    const sig = readMd(path.join(HOME, 'signals', `${name}.md`));
    const end = new Date(+now - lag(sig));
    const cap = duration(sig.meta.window_cap ?? config.window_cap);
    // A cron signal's first run covers its whole cap (a full digest); others start from now.
    const first = sig.meta.cron ? new Date(+end - cap) : end;
    const last = dry ? new Date(+end - dry * 6e4) : new Date(readState().jobs[key]?.last_checked ?? first);
    const from = new Date(Math.max(+last - duration(config.window_overlap), +end - cap));
    const routing = readDir('workstreams').map(w => `## ${w.name}\n${section(w.body, 'Routing')}`).join('\n\n');
    const prompt = [
      instructions(),
      `# Signal: ${name}\n\nSource label: ${name}. Linear team: ${config.linear_team}.\n\n${sig.body}`,
      `# Workstreams (Linear project = workstream name)\n\n${routing}`,
      `# Active issues\n\nThe team's open issues right now (identifier, status, project, title, start of the description). Step 2 of the filing rules matches each item against this list first; the searches find what it does not show.\n\n${await activeIssues()}`,
      `# Window\n\nFetch items with activity from ${iso(from)} up to ${iso(end)} (Unix seconds ${Math.floor(+from / 1e3)} to ${Math.floor(+end / 1e3)}). Ignore anything outside it.`,
      dry ? `# Output\n\nDRY RUN: apply the filing rules, including both dedupe searches with list_issues, but create, change and comment on nothing. Report what you would do (action = what you would do, issue = the existing issue for an update, else null).`
          : `# Output\n\nThis is an unattended run: nobody reads or answers questions. Do it now: fetch the window's items with the signal's tools, apply the filing rules to each (gate, active-issue searches, then drop, update or file), and return {"items": [...]} with one entry per item, filed or dropped. Return an empty list only when the fetch itself found nothing.`,
    ].join('\n\n---\n\n');
    const filing = dry ? config.filing_tools.filter((t: string) => !/__save_/.test(t)) : config.filing_tools;
    const started = Date.now();
    // The run's full transcript, for /autopilot:why and for debugging empty runs.
    const out = claude(prompt, { tools: [...sig.meta.tools, ...filing], model: config.model, schema: ITEMS_SCHEMA,
      log: `${name}-${iso(now).replace(/[:.]/g, '-')}${dry ? '-dry' : ''}` });
    const items = (typeof out === 'string' ? JSON.parse(out.replace(/^[^{]*|[^}]*$/g, '')) : out).items;
    if (!Array.isArray(items)) throw new Error(`bad output: ${JSON.stringify(out).slice(0, 500)}`);
    if (dry) return console.log(JSON.stringify({ window: [iso(from), iso(end)], seconds: (Date.now() - started) / 1e3, items }, null, 2));
    fs.appendFileSync(path.join(STATE_DIR, 'decisions.jsonl'),
      items.map(i => JSON.stringify({ ts: iso(Date.now()), signal: name, window: [iso(from), iso(end)], ...i }) + '\n').join(''));
    const cut = +last < +end - cap;
    withState(s => { if (cut) (job(s, key).gaps ??= []).push({ from: iso(last), to: iso(from) }); });
    succeeded(key, { last_checked: iso(end) });
    log(key, `${items.length} items`, items.map(i => `${i.action}${i.issue ? ' ' + i.issue : ''}`).join(', '));
  } catch (e) { if (dry) throw e; failed(key, e); }
}

function runSchedule(name: string) {
  const key = `schedule:${name}`;
  try {
    const sch = readMd(path.join(HOME, 'schedules', `${name}.md`));
    const ctx = `Now: ${iso(now)}. Autopilot home (config, workstreams, dreams; not in git): ${HOME}. Autopilot engine: ${ROOT}. Linear team: ${config.linear_team}. Autopilot's own project (health issues, proposals): ${config.autopilot_workstream}.`;
    const out = claude([instructions(), ctx, sch.body].join('\n\n---\n\n'), { tools: sch.meta.tools ?? [], model: sch.meta.model, timeout: 60 * 6e4 });
    succeeded(key);
    log(key, String(out).slice(0, 500));
  } catch (e) { failed(key, e); }
}

function runHealth(target: string, mode: string) {
  const key = `health:${target}`;
  try {
    const j = readState().jobs[target] ?? {};
    const title = `Autopilot health: ${target} failing`;
    const task = mode === 'close'
      ? `If an open issue titled exactly "${title}" exists, comment that runs succeed again since ${j.last_success} and move it to Done. Do nothing else.`
      : [j.failing_since && `Find the open issue titled exactly "${title}"; comment the latest state on it, or create it if none exists: project ${config.autopilot_workstream}, status Triage, priority 2, label autopilot. ` +
          `Body: what fails (${target}), failing since ${j.failing_since}, ${j.failures} failed runs, last error:\n\n${j.last_error}`,
        j.gaps?.length && `Create an issue "Autopilot health: ${target} skipped a time range": project ${config.autopilot_workstream}, status Triage, priority 2, label autopilot. ` +
          `Body: the window was capped at ${config.window_cap}; check these ranges by hand: ${j.gaps.map(g => `${g.from} → ${g.to}`).join('; ')}.`,
      ].filter(Boolean).join('\n\n');
    claude(`${instructions()}\n\n---\n\nLinear team: ${config.linear_team}.\n\n${task}\n\nReply "ok" when done.`, { tools: config.filing_tools, model: config.model });
    withState(s => {
      const t = job(s, target);
      if (mode === 'close') t.health_reported = false;
      // What was reported, not the state now: the job may have recovered meanwhile, and the next tick closes the issue.
      else { t.health_reported = !!j.failing_since; t.gaps = (t.gaps ?? []).slice(j.gaps?.length ?? 0); }
    });
    succeeded(key);
  } catch (e) { failed(key, e); }
}

// The engine's home/ holds the folders and examples (files starting with _, which readDir skips). setup copies
// them to HOME when it lives elsewhere, then makes the ones every Autopilot needs real. Nothing existing is replaced.
const STARTERS = [['_autopilot.yaml', 'autopilot.yaml'], ['.env.example', '.env'], ['workstreams/_autopilot.md', 'workstreams/autopilot.md'], ['schedules/_dream.md', 'schedules/dream.md']];
function setup() {
  const examples = path.join(ROOT, 'home');
  if (path.resolve(HOME) !== examples) fs.cpSync(examples, HOME, { recursive: true, force: false, errorOnExist: false,
    filter: f => !f.includes(`${path.sep}.state`) && (fs.statSync(f).isDirectory() || /^(_|\.env\.example$|\.gitkeep$)/.test(path.basename(f))) });
  const made = STARTERS.filter(([, to]) => !fs.existsSync(path.join(HOME, to)));
  for (const [from, to] of made) fs.copyFileSync(path.join(HOME, from), path.join(HOME, to));
  fs.chmodSync(path.join(HOME, '.env'), 0o600);
  console.log(made.length ? `${HOME}: created ${made.map(([, to]) => to).join(', ')}; fill in autopilot.yaml and .env, then run /autopilot:init` : `${HOME} is set up; left as is`);
  install();
}

// Links this repo into ~/.claude/skills/autopilot, where Claude Code loads it as the `autopilot` plugin in
// every session and repo, and merges the deny rules into the user's settings.
function install() {
  const dir = path.join(os.homedir(), '.claude');
  fs.mkdirSync(path.join(dir, 'skills'), { recursive: true });
  const link = path.join(dir, 'skills', 'autopilot');
  // unlink, not rmSync: rmSync on a symlink to a directory throws EISDIR. A real directory is left alone.
  if (fs.lstatSync(link, { throwIfNoEntry: false })?.isSymbolicLink()) fs.unlinkSync(link);
  fs.symlinkSync(ROOT, link);
  const file = path.join(dir, 'settings.json');
  const user = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const ours = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude', 'settings.json'), 'utf8'));
  user.permissions ??= {};
  user.permissions.deny = [...new Set([...(user.permissions.deny ?? []), ...ours.permissions.deny])];
  fs.writeFileSync(file, JSON.stringify(user, null, 2));
  console.log(`linked ${link}; merged ${ours.permissions.deny.length} deny rules into ${file}`);
}

if (cmd === 'signal') await runSignal(args[0], Number(args.find(a => a.startsWith('--dry='))?.slice(6)) || undefined);
else if (cmd === 'schedule') runSchedule(args[0]);
else if (cmd === 'health') runHealth(args[0], args[1]);
else if (cmd === 'launch') {
  const { launch } = await import('./launch.ts');
  try { await launch(); succeeded('launcher'); } catch (e) { failed('launcher', e); }
} else if (cmd === 'watch' || cmd === 'watch-run') {
  const w = await import('./watch.ts');
  if (cmd === 'watch-run') await w.check(args[0]);
  else if (!args.length) w.list();
  else try { await w.add(args); } catch (e) { console.error((e as Error).message); process.exit(1); }
} else if (cmd === 'unwatch') { unwatch(args[0]); console.log(`unwatched ${args[0]}`); }
else if (cmd === 'install') install();
else if (cmd === 'setup') setup();
else if (cmd === 'where') console.log(`engine ${ROOT}\nhome   ${HOME}${fs.existsSync(CONFIG) ? '' : ' (not set up: run `autopilot setup`)'}`);
else if (!cmd || cmd === 'tick') await tick();
else { console.error('usage: autopilot [tick|signal <name> [--dry=<minutes>]|schedule <name>|launch|watch [<ID> "<what>" …]|unwatch <ID>|setup|install|where]'); process.exit(1); }
