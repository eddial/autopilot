// Scheduler. Cron runs `autopilot tick` every minute; each due signal, schedule, health report and
// the launcher runs as its own detached process, guarded by the PID in state.json.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, STATE_DIR, config, readDir, readMd, section, instructions, duration, withState, readState, job, succeeded, failed, alive, log, claude } from './lib.ts';

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

// delay: leaves the newest messages out of the window, so Badr can answer them himself first.
const lag = (sig: { meta: any }) => sig.meta.delay ? duration(sig.meta.delay) : 0;

function tick() {
  const s = readState();
  for (const sig of readDir('signals')) {
    const key = `signal:${sig.name}`, j = s.jobs[key] ?? {};
    if (sig.meta.paused === true || !sig.meta.tools?.length || alive(j.pid)) continue;
    if (!j.last_checked) { withState(st => { job(st, key).last_checked = iso(now); }); continue; } // first run: no backfill
    // last_checked is where the previous window ended, which is now − delay for a delayed signal.
    if (+now - lag(sig) - +new Date(j.last_checked) >= duration(sig.meta.every)) detach(key, ['signal', sig.name]);
  }
  for (const sch of readDir('schedules')) {
    const key = `schedule:${sch.name}`, j = s.jobs[key] ?? {};
    const sameMinute = j.last_run && iso(now).slice(0, 16) === j.last_run.slice(0, 16);
    if (!alive(j.pid) && !sameMinute && cronMatch(sch.meta.cron, now)) {
      withState(st => { job(st, key).last_run = iso(now); });
      detach(key, ['schedule', sch.name]);
    }
  }
  if (!alive(s.jobs.launcher?.pid)) detach('launcher', ['launch']);
  // Health: report after 60 minutes of failure or on a capped window; close once runs succeed.
  for (const [key, j] of Object.entries(s.jobs)) {
    if (key.startsWith('health:') || alive(s.jobs[`health:${key}`]?.pid)) continue;
    const failing = !!j.failing_since && +now - +new Date(j.failing_since) >= 60 * 6e4;
    if ((failing && !j.health_reported) || j.gaps?.length) detach(`health:${key}`, ['health', key, 'open']);
    else if (!j.failing_since && j.health_reported) detach(`health:${key}`, ['health', key, 'close']);
  }
}

const ITEMS_SCHEMA = {
  type: 'object', required: ['items'], properties: { items: { type: 'array', items: {
    type: 'object', required: ['source', 'source_url', 'from', 'subject', 'snippet', 'action', 'reason', 'workstream', 'priority', 'issue'], properties: {
      source: { type: 'string' }, source_url: { type: 'string' }, from: { type: 'string' }, subject: { type: 'string' },
      snippet: { type: 'string' }, action: { enum: ['created', 'commented', 'dropped'] }, reason: { type: 'string' },
      workstream: { type: ['string', 'null'] }, priority: { type: ['integer', 'null'] }, issue: { type: ['string', 'null'] },
    } } } },
};

// --dry=<minutes>: preview a window of that length; read-only Linear tools, nothing filed, no state or log written.
function runSignal(name: string, dry?: number) {
  const key = `signal:${name}`;
  try {
    const sig = readMd(path.join(ROOT, 'signals', `${name}.md`));
    const end = new Date(+now - lag(sig));
    const last = dry ? new Date(+end - dry * 6e4) : new Date(readState().jobs[key]?.last_checked ?? end);
    const from = new Date(Math.max(+last - duration(config.window_overlap), +end - duration(config.window_cap)));
    const routing = readDir('workstreams').map(w => `## ${w.name}\n${section(w.body, 'Routing')}`).join('\n\n');
    const prompt = [
      instructions(),
      `# Signal: ${name}\n\nSource label: ${name}. Linear team: ${config.linear_team}.\n\n${sig.body}`,
      `# Workstreams (Linear project = workstream name)\n\n${routing}`,
      `# Window\n\nFetch items with activity from ${iso(from)} up to ${iso(end)}. Ignore anything outside it.`,
      dry ? `# Output\n\nDRY RUN: apply the filing rules but create, change and comment on nothing. Report what you would do (action = what you would do, issue = the existing issue for a comment, else null).`
          : `# Output\n\nFile each item per the filing rules, then return {"items": [...]} with one entry per item, filed or dropped.`,
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
    const cut = +last < +end - duration(config.window_cap);
    withState(s => { if (cut) (job(s, key).gaps ??= []).push({ from: iso(last), to: iso(from) }); });
    succeeded(key, { last_checked: iso(end) });
    log(key, `${items.length} items`, items.map(i => `${i.action}${i.issue ? ' ' + i.issue : ''}`).join(', '));
  } catch (e) { if (dry) throw e; failed(key, e); }
}

function runSchedule(name: string) {
  const key = `schedule:${name}`;
  try {
    const sch = readMd(path.join(ROOT, 'schedules', `${name}.md`));
    const ctx = `Now: ${iso(now)}. Autopilot directory: ${ROOT}. Linear team: ${config.linear_team}.`;
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
      else { t.health_reported = !!t.failing_since; t.gaps = (t.gaps ?? []).slice(j.gaps?.length ?? 0); }
    });
    succeeded(key);
  } catch (e) { failed(key, e); }
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

if (cmd === 'signal') runSignal(args[0], Number(args.find(a => a.startsWith('--dry='))?.slice(6)) || undefined);
else if (cmd === 'schedule') runSchedule(args[0]);
else if (cmd === 'health') runHealth(args[0], args[1]);
else if (cmd === 'launch') {
  const { launch } = await import('./launch.ts');
  try { await launch(); succeeded('launcher'); } catch (e) { failed('launcher', e); }
} else if (cmd === 'install') install();
else if (!cmd || cmd === 'tick') tick();
else { console.error('usage: autopilot [tick|signal <name> [--dry=<minutes>]|schedule <name>|launch|install]'); process.exit(1); }
