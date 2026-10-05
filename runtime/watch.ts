// Watchers. A session that hands over in Waiting (or Review) leaves a watcher on what the issue waits on:
// a Slack thread, an email thread, a PR, anything a signal's tools or a listed tool can read. The tick runs
// it every `every` while the issue is in Waiting or Review; news becomes a WATCH_UPDATE comment, which the
// launcher's relay delivers to the session like a comment from the owner. Closing the issue or `until` ends it.
import path from 'node:path';
import { HOME, config, readMd, readDir, instructions, duration, withState, readState, unwatch, succeeded, failed, log, claude, type Watcher } from './lib.ts';
import { gql, comment, move, teamStates, MARK, WATCH_UPDATE } from './launch.ts';

const WATCHING = ['Waiting', 'Review']; // Start and Working: a session is on it. Triage, Backlog: nobody is waiting yet.
const iso = (d: Date | number) => new Date(d).toISOString();
const signal = (name: string) => readMd(path.join(HOME, 'signals', `${name}.md`));

async function issue(id: string) {
  return (await gql(`query($id: String!) { issue(id: $id) { id identifier title description url
    state { name type } labels { nodes { name } } } }`, { id })).issue;
}

// autopilot watch <ID> "<what>" [--every 30m] [--for 14d] [--signal slack,gmail] [--tools a,b]
export async function add(argv: string[]) {
  const flag = (n: string) => { const i = argv.indexOf(`--${n}`); return i < 0 ? undefined : argv.splice(i, 2)[1]; };
  const list = (v?: string) => (v ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const every = flag('every') ?? '30m', span = flag('for') ?? '14d', sigFlag = flag('signal'), extra = list(flag('tools'));
  const [id, what] = argv;
  if (!id || !what) throw new Error('usage: autopilot watch <ID> "<what to watch>" [--every 30m] [--for 14d] [--signal slack,gmail] [--tools a,b]');
  duration(every); duration(span);
  const i = await issue(id);
  if (!i) throw new Error(`issue ${id} not found`);
  // Default: the signals the issue was filed from (its source label), so a watcher reads the same connector.
  const known = new Set(readDir('signals').map(s => s.name));
  const signals: string[] = sigFlag ? list(sigFlag) : i.labels.nodes.map((l: any) => l.name).filter((n: string) => known.has(n));
  for (const s of signals) if (!known.has(s)) throw new Error(`no signals/${s}.md`);
  const tools = [...new Set([...signals.flatMap(s => signal(s).meta.tools ?? []), ...extra])];
  if (!tools.length) throw new Error(`no tools to read with: give --signal <name> or --tools <tool,...> (signals for ${id}: ${signals.join(', ') || 'none'})`);
  const now = Date.now();
  const w: Watcher = { issue_id: i.id, what, signals, tools, every, until: iso(now + duration(span)), created: iso(now) };
  withState(s => { s.watchers[i.identifier] = w; });
  await comment(i.id, `${MARK} · watching: ${what}\n\nEvery ${every} while the issue is in ${WATCHING.join(' or ')}, until ${w.until.slice(0, 10)}, ` +
    `with ${signals.length ? `the ${signals.join(', ')} signal${signals.length > 1 ? 's' : ''}` : 'its own tools'}${extra.length ? ` and ${extra.join(', ')}` : ''}.`);
  console.log(`watching ${i.identifier}: ${what} (every ${every}, until ${w.until})`);
}

export function list() {
  const ws = Object.entries(readState().watchers);
  if (!ws.length) return console.log('no watchers');
  for (const [id, w] of ws) console.log(`${id}  every ${w.every}  until ${w.until.slice(0, 10)}  last ${w.last_run ?? '-'}  ${w.what}`);
}

const SCHEMA = {
  type: 'object', required: ['fingerprint', 'changed', 'summary', 'sources'], properties: {
    fingerprint: { type: 'string' }, changed: { type: 'boolean' }, summary: { type: 'string' }, sources: { type: 'array', items: { type: 'string' } },
  },
};

export async function check(id: string) {
  const key = `watch:${id}`;
  const w = readState().watchers[id];
  if (!w) return;
  try {
    const i = await issue(w.issue_id);
    if (!i || ['completed', 'canceled'].includes(i.state.type)) { unwatch(id); return log(key, 'issue closed: watcher removed'); }
    if (Date.now() > +new Date(w.until)) {
      unwatch(id);
      const states = await teamStates();
      // Nobody answered in time: that is now the owner's call.
      if (i.state.name === 'Waiting') await move(i.id, states.Review);
      await comment(i.id, `${MARK} · watcher expired: nothing new on "${w.what}" since ${w.created.slice(0, 10)}.` +
        (i.state.name === 'Waiting' ? '\n\n**Decision needed:** chase, wait longer (a new watcher), or close?' : ''));
      return log(key, 'expired');
    }
    if (!WATCHING.includes(i.state.name)) { succeeded(key); return log(key, `skipped: issue in ${i.state.name}`); }

    const notes = w.signals.map(s => `## ${s}\n\n${signal(s).body}`).join('\n\n');
    const prompt = [
      instructions(),
      `# Watcher for ${i.identifier}: ${i.title}\n\nWatch: ${w.what}\n\nIssue (context only):\n\n${(i.description ?? '').slice(0, 3000)}` +
        (notes ? `\n\n# How these sources are read (signal notes; their filing rules do not apply here)\n\n${notes}` : ''),
      `# Task\n\nRead-only: look at the current state of what is watched with your tools. Create, change, send and comment on nothing.\n\n` +
        `Previous fingerprint: ${w.fingerprint ?? 'none (first run)'}\n\nReturn:\n` +
        `- fingerprint: a short, stable record of the latest activity by people (ids, timestamps, counts, open/closed/merged) for the next run to compare against. ` +
        `Leave out values that move on their own: mergeable or CI state still computing, view counts, relative times\n` +
        `- changed: true only when a person did something since the previous fingerprint (a reply, a new commit or review, a status or decision); always false on the first run\n` +
        `- summary: when changed, one to three sentences: what is new, who, when; else ""\n` +
        `- sources: the URLs of what changed`,
    ].join('\n\n---\n\n');
    const out: any = claude(prompt, { tools: w.tools, model: config.model, schema: SCHEMA, timeout: 10 * 6e4,
      log: `watch-${id}-${iso(Date.now()).replace(/[:.]/g, '-')}` });
    const r = typeof out === 'string' ? JSON.parse(out.replace(/^[^{]*|[^}]*$/g, '')) : out;
    if (typeof r?.fingerprint !== 'string') throw new Error(`bad output: ${JSON.stringify(out).slice(0, 500)}`);
    if (r.changed && w.fingerprint) {
      await comment(i.id, [`${WATCH_UPDATE}: ${w.what}`, r.summary, ...r.sources.map((u: string) => `Source: ${u}`)].join('\n\n'));
      // The relay wakes a session this issue has; an issue without one gets a new session.
      if (!readState().sessions[id]) await move(i.id, (await teamStates()).Start);
    }
    withState(s => { if (s.watchers[id]) s.watchers[id].fingerprint = r.fingerprint; });
    succeeded(key);
    log(key, r.changed && w.fingerprint ? `changed: ${r.summary}` : w.fingerprint ? 'no change' : 'baseline set');
  } catch (e) { failed(key, e); }
}
