// Launcher. Polls Linear with the API key: starts a session for each issue in Start, cleans up after Done/Canceled.
import fs from 'node:fs';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { ROOT, HOME, config, repoDir, readDir, section, instructions, withState, readState, run, log, transient, unwatch, claude, type Session } from './lib.ts';

const TMUX = 'autopilot';
// Every comment Autopilot writes starts with this; a comment without it is the owner steering the issue.
export const MARK = '🤖 Autopilot';
// A watcher's news is the one Autopilot comment that wakes the session, like a comment from the owner.
export const WATCH_UPDATE = `${MARK} · watcher update`;

export async function gql(query: string, variables: Record<string, unknown> = {}) {
  if (!process.env.LINEAR_API_KEY) throw new Error(`LINEAR_API_KEY missing in ${path.join(HOME, '.env')}`);
  const r = await fetch('https://api.linear.app/graphql', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: process.env.LINEAR_API_KEY },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(`Linear: ${r.status} ${JSON.stringify(j.errors ?? j).slice(0, 500)}`);
  return j.data;
}
const ISSUE = 'id identifier title description createdAt project { name } state { name type }';
const issuesIn = async (filter: object) =>
  (await gql(`query($f: IssueFilter) { issues(filter: $f, first: 100) { nodes { ${ISSUE} } } }`, { f: filter })).issues.nodes;
export const comment = (issueId: string, body: string) =>
  gql('mutation($i: CommentCreateInput!) { commentCreate(input: $i) { success } }', { i: { issueId, body } });
// A link attachment shows under the issue's Resources; the same URL again updates it instead of adding one.
const attach = (issueId: string, url: string, title: string, subtitle: string) =>
  gql('mutation($i: AttachmentCreateInput!) { attachmentCreate(input: $i) { success } }', { i: { issueId, url, title, subtitle } });
export const move = (id: string, stateId: string) =>
  gql('mutation($id: String!, $s: String!) { issueUpdate(id: $id, input: { stateId: $s }) { success } }', { id, s: stateId });

const tmux = (...a: string[]) => run('tmux', a);
// Claude Code stops at "Do you trust this folder?" in a folder it has not seen, and the session never starts.
// Every folder the launcher opens is its own (a workstream folder or a worktree of a configured repo), so it
// accepts the prompt ahead of time the way the app records it.
function trust(dir: string) {
  const file = path.join(os.homedir(), '.claude.json');
  const c = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (c.projects?.[dir]?.hasTrustDialogAccepted) return;
  c.projects ??= {};
  c.projects[dir] = { ...c.projects[dir], hasTrustDialogAccepted: true };
  fs.writeFileSync(file + '.autopilot.tmp', JSON.stringify(c, null, 2));
  fs.renameSync(file + '.autopilot.tmp', file);
}
const hasWindow = (name: string) => { try { return tmux('list-windows', '-t', TMUX, '-F', '#W').split('\n').includes(name); } catch { return false; } };

// Status name → id.
export async function teamStates(): Promise<Record<string, string>> {
  const team = (await gql('query($k: String!) { teams(filter: { key: { eq: $k } }) { nodes { states { nodes { id name type } } } } }',
    { k: config.linear_team })).teams.nodes[0];
  if (!team) throw new Error(`Linear team ${config.linear_team} not found`);
  // Two statuses can share a name (Linear's own Triage next to a backlog one made while triage was off); the triage one wins.
  const byType = [...team.states.nodes].sort((a: any, b: any) => +(a.type === 'triage') - +(b.type === 'triage'));
  return Object.fromEntries(byType.map((s: any) => [s.name, s.id]));
}

export async function launch() {
  const states = await teamStates();
  for (const n of ['Start', 'Working', 'Triage']) if (!states[n]) throw new Error(`status ${n} missing; run /autopilot:init`);
  const inTeam = (name: string) => ({ team: { key: { eq: config.linear_team } }, state: { name: { eq: name } } });

  // Cleanup first, so finished sessions free their slot.
  const known = Object.entries(readState().sessions);
  if (known.length) {
    const finished = (await issuesIn({ id: { in: known.map(([, s]) => s.issue_id) } }))
      .filter((i: any) => ['completed', 'canceled'].includes(i.state.type));
    for (const i of finished) await cleanup(i.identifier, readState().sessions[i.identifier]);
  }
  for (const [id, s] of Object.entries(readState().sessions)) {
    try { await relay(id, s, states); } catch (e) { log('launcher', id, 'relay failed:', (e as Error).message); }
  }
  await startCommented(states);

  let running = (await issuesIn(inTeam('Working'))).length;
  const queue = (await issuesIn(inTeam('Start'))).sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt));
  for (const issue of queue) {
    if (running >= config.max_parallel_sessions) break;
    await move(issue.id, states.Working); // the status is the lock
    running++;
    try { await start(issue); } catch (e) {
      log('launcher', issue.identifier, 'start failed:', (e as Error).message);
      running--;
      if (transient(e)) { await move(issue.id, states.Start); continue; } // network dropped: retry next tick
      await move(issue.id, states.Triage);
      await comment(issue.id, `${MARK} · could not start a session:\n\n\`\`\`\n${(e as Error).message}\n\`\`\``);
    }
  }
}

// An issue the owner files by hand often has no project. Pick the workstream from the Routing sections, the
// way signals do, and set it as the project so the issue shows where it went.
async function route(issue: any): Promise<string> {
  const workstreams = readDir('workstreams');
  const routing = workstreams.map(w => `## ${w.name}\n${section(w.body, 'Routing')}`).join('\n\n');
  const schema = { type: 'object', required: ['workstream'], properties: { workstream: { enum: workstreams.map(w => w.name) } } };
  const out = claude([`# Workstreams\n\n${routing}`,
    `# Issue\n\n${issue.title}\n\n${issue.description ?? ''}`,
    'Pick the one workstream this issue belongs to and return {"workstream": "<name>"}.'].join('\n\n---\n\n'),
    { tools: [], model: config.model, schema, timeout: 5 * 6e4 });
  // Haiku now and then answers in prose instead of the schema; take the one workstream it names.
  const named = typeof out === 'string' ? workstreams.filter(w => out.includes(w.name)) : [];
  const name: string = typeof out === 'string' ? (named.length === 1 ? named[0].name : '') : out.workstream;
  if (!name) throw new Error(`no project, and routing picked no workstream: ${String(out).slice(0, 300)}`);
  const project = (await gql('query($n: String!) { projects(filter: { name: { eq: $n } }) { nodes { id } } }', { n: name })).projects.nodes[0];
  if (!project) throw new Error(`workstream "${name}" has no Linear project; run /autopilot:init`);
  await gql('mutation($id: String!, $p: String!) { issueUpdate(id: $id, input: { projectId: $p }) { success } }', { id: issue.id, p: project.id });
  log('launcher', issue.identifier, 'no project: routed to', name);
  return name;
}

async function start(issue: any) {
  const id: string = issue.identifier;
  const project = issue.project?.name ?? await route(issue);
  const ws = readDir('workstreams').find(w => w.name === project);
  if (!ws) throw new Error(`project "${project}" has no workstreams/*.md file`);
  // Structural work (a workstream with a repo) gets a worktree and branch per issue; everything else
  // works in the workstream's own folder, shared by its sessions and kept.
  const repo = ws.meta.repo ? repoDir(ws.meta.repo) : '';
  const worktree = path.join(config.worktrees_dir, repo ? id : ws.name), branch = repo ? `claude/${id.toLowerCase()}` : '';
  fs.mkdirSync(config.worktrees_dir, { recursive: true });
  if (!repo) fs.mkdirSync(worktree, { recursive: true });
  // A follow-up after Review reuses the worktree and branch.
  else if (!fs.existsSync(worktree)) {
    // A local-only repo (the home, before it gets a remote) branches from its checked-out branch.
    const remote = run('git', ['-C', repo, 'remote']).split('\n').includes('origin');
    if (remote) run('git', ['-C', repo, 'fetch', '--prune', 'origin']);
    const base = remote ? run('git', ['-C', repo, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD']) : run('git', ['-C', repo, 'rev-parse', '--abbrev-ref', 'HEAD']);
    run('git', ['-C', repo, 'worktree', 'add', '-b', branch, worktree, base]);
  }
  trust(worktree);
  try { tmux('has-session', '-t', TMUX); } catch { tmux('new-session', '-d', '-s', TMUX, '-n', 'home'); }
  if (hasWindow(id)) tmux('kill-window', '-t', `${TMUX}:${id}`);

  // A session ID we choose gives the desktop app's deep link, which opens this terminal session in the Code tab.
  const sessionId = randomUUID(), local = `claude://resume?session=${sessionId}`;
  const place = repo ? `You work in a git worktree of ${repo} on branch \`${branch}\`.`
    : `You work in ${worktree}, the ${ws.name} workstream's folder: not a git repo, shared with its other sessions. Put files for this issue in ${id}/.`;
  const prompt = [instructions(), section(ws.body, 'Work'), `${place} Use the autopilot:work skill on Linear issue ${id}.`].filter(Boolean).join('\n\n---\n\n');
  // Without --name the app titles the session from the prompt, which opens with the same generic
  // instructions for every issue, so every session gets a title like "General coding session".
  const name = `${id} ${issue.title}`;
  tmux('new-window', '-d', '-t', `${TMUX}:`, '-n', id, '-c', worktree,
    '-e', `AUTOPILOT_ISSUE=${id}`, '-e', `AUTOPILOT_ISSUE_UUID=${issue.id}`, '-e', `AUTOPILOT_ROOT=${ROOT}`, '-e', `AUTOPILOT_HOME=${HOME}`,
    'claude', '--session-id', sessionId, '--name', name, '--remote-control', name, '--no-chrome', '--permission-mode', 'bypassPermissions', '--settings', path.join(ROOT, '.claude', 'settings.json'), prompt);

  // Past step 3: the session runs. Failures from here on are reported but do not undo the claim.
  let link = '', pane = '';
  for (let i = 0; i < 30 && !link; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try { pane = tmux('capture-pane', '-p', '-J', '-S', '-200', '-t', `${TMUX}:${id}`); } catch { break; }
    link = pane.match(/https:\/\/claude\.ai\/\S+/)?.[0] ?? '';
  }
  // A session held at a startup prompt has no transcript, so its deep link opens nothing. Send the issue
  // back to Triage with what the window showed instead of leaving it in Working.
  if (!link && /trust this folder|Enter to confirm/.test(pane)) {
    try { tmux('kill-window', '-t', `${TMUX}:${id}`); } catch {}
    throw new Error(`the session stopped at a startup prompt in ${worktree}:\n${pane.trim().split('\n').slice(0, 12).join('\n')}`);
  }
  const started = new Date().toISOString();
  const session: Session = { issue_id: issue.id, repo, worktree, branch, window: `${TMUX}:${id}`, session_id: sessionId, link, started, seen: started };
  withState(s => { s.sessions[id] = session; });
  // The session runs whatever happens here; a lost comment or attachment must not send the issue back.
  const when = `${branch || ws.name} · started ${started.slice(0, 16).replace('T', ' ')} UTC`;
  for (const [url, title, sub] of [[local, 'Claude Code session (this Mac)', `Claude app · ${when}`], [link, 'Claude Code session (Remote Control)', when]])
    if (url) await attach(issue.id, url, title, sub).catch(e => log('launcher', id, 'session attachment failed:', (e as Error).message));
  await comment(issue.id, [`${MARK} · session started ${branch ? `on branch \`${branch}\`` : `in the ${ws.name} folder`}.`,
    `In the Claude app: ${local}`,
    link ? `Remote Control: ${link}` : 'Remote Control link not found yet; open it from the Claude app session list.',
    `On the server: \`tmux attach -t ${TMUX} \\; select-window -t ${id}\``].join('\n\n'))
    .catch(e => log('launcher', id, 'start comment failed:', (e as Error).message));
  log('launcher', id, 'started', link);
}

async function cleanup(id: string, s: Session) {
  if (hasWindow(id)) tmux('kill-window', '-t', s.window);
  let lost = '';
  // A workstream folder stays; only a worktree is removed, and only when nothing would be lost.
  if (s.branch && fs.existsSync(s.worktree)) {
    const git = (...a: string[]) => run('git', ['-C', s.worktree, ...a]);
    const dirty = git('status', '--porcelain');
    // Without a remote, work counts as kept once it is on the repo's checked-out branch.
    const remote = git('remote');
    const unpushed = git('log', '--oneline', 'HEAD', '--not', ...(remote ? ['--remotes'] : [run('git', ['-C', s.repo, 'rev-parse', '--abbrev-ref', 'HEAD'])]));
    if (dirty || unpushed) lost = [dirty && `Uncommitted:\n${dirty}`, unpushed && `Unpushed commits:\n${unpushed}`].filter(Boolean).join('\n\n');
    else {
      run('git', ['-C', s.repo, 'worktree', 'remove', s.worktree]);
      try { run('git', ['-C', s.repo, 'branch', '-D', s.branch]); } catch {} // pushed, so the remote keeps it
    }
  }
  if (lost) await comment(s.issue_id, `${MARK} kept the worktree \`${s.worktree}\`; removing it would lose:\n\n\`\`\`\n${lost.slice(0, 3000)}\n\`\`\``);
  withState(st => { delete st.sessions[id]; });
  unwatch(id);
  log('launcher', id, lost ? 'cleaned up, worktree kept' : 'cleaned up');
}

// A comment from the owner on an issue that never had a session (Triage or Backlog) is enough to start one:
// the issue goes to Start when its latest comment is theirs. A failed start ends on a MARK comment, so it
// does not loop.
async function startCommented(states: Record<string, string>) {
  const tracked = new Set(Object.values(readState().sessions).map(s => s.issue_id));
  const issues = (await gql(`query($f: IssueFilter) { issues(filter: $f, first: 100) { nodes { id identifier
      comments(first: 1, orderBy: createdAt) { nodes { body createdAt } } } } }`,
    { f: { team: { key: { eq: config.linear_team } }, state: { type: { in: ['triage', 'backlog'] } } } })).issues.nodes;
  for (const i of issues) {
    const last = i.comments.nodes[0];
    if (tracked.has(i.id) || !last || last.body.trimStart().startsWith(MARK)) continue;
    await move(i.id, states.Start);
    log('launcher', i.identifier, 'comment on an issue without a session: moved to Start');
  }
}

// The comments are the message board. The owner's new comments (no MARK) and watcher updates go into the live
// session as a message and move the issue back to Working; with no live session the issue goes to Start,
// and the new session reads them from the issue.
async function relay(id: string, s: Session, states: Record<string, string>) {
  const issue = (await gql('query($id: String!) { issue(id: $id) { state { name } comments(first: 100) { nodes { body createdAt } } } }',
    { id: s.issue_id })).issue;
  const seen = s.seen ?? s.started;
  const fresh = issue.comments.nodes.filter((c: any) => c.createdAt > seen).sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt));
  if (!fresh.length) return;
  withState(st => { if (st.sessions[id]) st.sessions[id].seen = fresh.at(-1).createdAt; });
  const watched = (c: any) => c.body.trimStart().startsWith(WATCH_UPDATE);
  const mine = fresh.filter((c: any) => !c.body.trimStart().startsWith(MARK) || watched(c));
  if (!mine.length) return;
  if (!hasWindow(id)) {
    if (issue.state.name !== 'Start') await move(s.issue_id, states.Start);
    log('launcher', id, `${mine.length} comment(s), no live session: moved to Start`);
    return;
  }
  const head = mine.every(watched)
    ? `A watcher on Linear issue ${id} saw something new on what this issue waits on. Act on it, and comment on the issue when you pause.`
    : `New comment${mine.length > 1 ? 's' : ''} on Linear issue ${id}. Comments without ${MARK} are instructions from ${config.owner}; a "${WATCH_UPDATE}" is news from a watcher. Act on them, and comment on the issue when you pause.`;
  const text = [head, ...mine.map((c: any) => c.body.trim())].join('\n\n---\n\n');
  run('tmux', ['load-buffer', '-b', 'autopilot-relay', '-'], { input: text });
  tmux('paste-buffer', '-p', '-d', '-b', 'autopilot-relay', '-t', s.window);
  await new Promise(r => setTimeout(r, 500));
  tmux('send-keys', '-t', s.window, 'Enter');
  if (['Review', 'Waiting'].includes(issue.state.name)) await move(s.issue_id, states.Working);
  log('launcher', id, `relayed ${mine.length} comment(s)`);
}
