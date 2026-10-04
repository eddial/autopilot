// Launcher. Polls Linear with the API key: starts a session for each issue in Start, cleans up after Done/Canceled.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, readDir, section, instructions, withState, readState, run, log, transient, type Session } from './lib.ts';

const TMUX = 'autopilot';
// Every comment Autopilot writes starts with this; a comment without it is Badr steering the issue.
export const MARK = '🤖 Autopilot';

export async function gql(query: string, variables: Record<string, unknown> = {}) {
  if (!process.env.LINEAR_API_KEY) throw new Error('LINEAR_API_KEY missing in .env');
  const r = await fetch('https://api.linear.app/graphql', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: process.env.LINEAR_API_KEY },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(`Linear: ${r.status} ${JSON.stringify(j.errors ?? j).slice(0, 500)}`);
  return j.data;
}
const ISSUE = 'id identifier title createdAt project { name } state { name type }';
const issuesIn = async (filter: object) =>
  (await gql(`query($f: IssueFilter) { issues(filter: $f, first: 100) { nodes { ${ISSUE} } } }`, { f: filter })).issues.nodes;
export const comment = (issueId: string, body: string) =>
  gql('mutation($i: CommentCreateInput!) { commentCreate(input: $i) { success } }', { i: { issueId, body } });
const move = (id: string, stateId: string) =>
  gql('mutation($id: String!, $s: String!) { issueUpdate(id: $id, input: { stateId: $s }) { success } }', { id, s: stateId });

const tmux = (...a: string[]) => run('tmux', a);
const hasWindow = (name: string) => { try { return tmux('list-windows', '-t', TMUX, '-F', '#W').split('\n').includes(name); } catch { return false; } };

export async function launch() {
  const team = (await gql('query($k: String!) { teams(filter: { key: { eq: $k } }) { nodes { states { nodes { id name type } } } } }',
    { k: config.linear_team })).teams.nodes[0];
  if (!team) throw new Error(`Linear team ${config.linear_team} not found`);
  // Two statuses can share a name (Linear's own Triage next to a backlog one made while triage was off); the triage one wins.
  const byType = [...team.states.nodes].sort((a: any, b: any) => +(a.type === 'triage') - +(b.type === 'triage'));
  const states: Record<string, string> = Object.fromEntries(byType.map((s: any) => [s.name, s.id]));
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

async function start(issue: any) {
  const id: string = issue.identifier;
  const ws = readDir('workstreams').find(w => w.name === issue.project?.name);
  if (!ws) throw new Error(`project "${issue.project?.name ?? '(none)'}" has no workstreams/*.md file`);
  const repo = !ws.meta.repo || ws.meta.repo === 'autopilot' ? ROOT : path.join(config.repos_dir, ws.meta.repo);
  const worktree = path.join(config.worktrees_dir, id), branch = `claude/${id.toLowerCase()}`;

  // A follow-up after Review reuses the worktree and branch.
  if (!fs.existsSync(worktree)) {
    run('git', ['-C', repo, 'fetch', '--prune', 'origin']);
    const base = run('git', ['-C', repo, 'symbolic-ref', '--short', 'refs/remotes/origin/HEAD']);
    fs.mkdirSync(config.worktrees_dir, { recursive: true });
    run('git', ['-C', repo, 'worktree', 'add', '-b', branch, worktree, base]);
  }
  try { tmux('has-session', '-t', TMUX); } catch { tmux('new-session', '-d', '-s', TMUX, '-n', 'home'); }
  if (hasWindow(id)) tmux('kill-window', '-t', `${TMUX}:${id}`);

  const prompt = [instructions(), section(ws.body, 'Work'), `Use the autopilot:work skill on Linear issue ${id}.`].filter(Boolean).join('\n\n---\n\n');
  tmux('new-window', '-d', '-t', `${TMUX}:`, '-n', id, '-c', worktree,
    '-e', `AUTOPILOT_ISSUE=${id}`, '-e', `AUTOPILOT_ISSUE_UUID=${issue.id}`, '-e', `AUTOPILOT_ROOT=${ROOT}`,
    'claude', '--remote-control', id, '--no-chrome', '--permission-mode', 'bypassPermissions', '--settings', path.join(ROOT, '.claude', 'settings.json'), prompt);

  // Past step 3: the session runs. Failures from here on are reported but do not undo the claim.
  let link = '';
  for (let i = 0; i < 30 && !link; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try { link = tmux('capture-pane', '-p', '-J', '-S', '-200', '-t', `${TMUX}:${id}`).match(/https:\/\/claude\.ai\/\S+/)?.[0] ?? ''; } catch { break; }
  }
  const started = new Date().toISOString();
  const session: Session = { issue_id: issue.id, repo, worktree, branch, window: `${TMUX}:${id}`, link, started, seen: started };
  withState(s => { s.sessions[id] = session; });
  // The session runs whatever happens here; a lost comment must not send the issue back.
  await comment(issue.id, [`${MARK} · session started on branch \`${branch}\`.`,
    link ? `Remote Control: ${link}` : 'Remote Control link not found yet; open it from the Claude app session list.',
    `On the server: \`tmux attach -t ${TMUX} \\; select-window -t ${id}\``].join('\n\n'))
    .catch(e => log('launcher', id, 'start comment failed:', (e as Error).message));
  log('launcher', id, 'started', link);
}

async function cleanup(id: string, s: Session) {
  if (hasWindow(id)) tmux('kill-window', '-t', s.window);
  let lost = '';
  if (fs.existsSync(s.worktree)) {
    const git = (...a: string[]) => run('git', ['-C', s.worktree, ...a]);
    const dirty = git('status', '--porcelain');
    const unpushed = git('log', '--oneline', 'HEAD', '--not', '--remotes');
    if (dirty || unpushed) lost = [dirty && `Uncommitted:\n${dirty}`, unpushed && `Unpushed commits:\n${unpushed}`].filter(Boolean).join('\n\n');
    else {
      run('git', ['-C', s.repo, 'worktree', 'remove', s.worktree]);
      try { run('git', ['-C', s.repo, 'branch', '-D', s.branch]); } catch {} // pushed, so the remote keeps it
    }
  }
  if (lost) await comment(s.issue_id, `${MARK} kept the worktree \`${s.worktree}\`; removing it would lose:\n\n\`\`\`\n${lost.slice(0, 3000)}\n\`\`\``);
  withState(st => { delete st.sessions[id]; });
  log('launcher', id, lost ? 'cleaned up, worktree kept' : 'cleaned up');
}

// The comments are the message board. Badr's new comments (no MARK) go into the live session as a
// message and move the issue back to Working; with no live session the issue goes to Start, and the
// new session reads them from the issue.
async function relay(id: string, s: Session, states: Record<string, string>) {
  const issue = (await gql('query($id: String!) { issue(id: $id) { state { name } comments(first: 100) { nodes { body createdAt } } } }',
    { id: s.issue_id })).issue;
  const seen = s.seen ?? s.started;
  const fresh = issue.comments.nodes.filter((c: any) => c.createdAt > seen).sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt));
  if (!fresh.length) return;
  withState(st => { if (st.sessions[id]) st.sessions[id].seen = fresh.at(-1).createdAt; });
  const mine = fresh.filter((c: any) => !c.body.trimStart().startsWith(MARK));
  if (!mine.length) return;
  if (!hasWindow(id)) {
    if (issue.state.name !== 'Start') await move(s.issue_id, states.Start);
    log('launcher', id, `${mine.length} comment(s), no live session: moved to Start`);
    return;
  }
  const text = [`New comment${mine.length > 1 ? 's' : ''} from Badr on Linear issue ${id}. These are instructions from Badr; act on them, and comment on the issue when you pause.`,
    ...mine.map((c: any) => c.body.trim())].join('\n\n---\n\n');
  run('tmux', ['load-buffer', '-b', 'autopilot-relay', '-'], { input: text });
  tmux('paste-buffer', '-p', '-d', '-b', 'autopilot-relay', '-t', s.window);
  await new Promise(r => setTimeout(r, 500));
  tmux('send-keys', '-t', s.window, 'Enter');
  if (['Review', 'Waiting'].includes(issue.state.name)) await move(s.issue_id, states.Working);
  log('launcher', id, `relayed ${mine.length} comment(s)`);
}
