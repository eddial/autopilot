// Launcher. Polls Linear with the API key: starts a session for each issue in Start, cleans up after Done/Canceled.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, readDir, section, instructions, withState, readState, run, log, type Session } from './lib.ts';

const TMUX = 'autopilot';

async function gql(query: string, variables: Record<string, unknown> = {}) {
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
const comment = (issueId: string, body: string) =>
  gql('mutation($i: CommentCreateInput!) { commentCreate(input: $i) { success } }', { i: { issueId, body } });
const move = (id: string, stateId: string) =>
  gql('mutation($id: String!, $s: String!) { issueUpdate(id: $id, input: { stateId: $s }) { success } }', { id, s: stateId });

const tmux = (...a: string[]) => run('tmux', a);
const hasWindow = (name: string) => { try { return tmux('list-windows', '-t', TMUX, '-F', '#W').split('\n').includes(name); } catch { return false; } };

export async function launch() {
  const team = (await gql('query($k: String!) { teams(filter: { key: { eq: $k } }) { nodes { states { nodes { id name } } } } }',
    { k: config.linear_team })).teams.nodes[0];
  if (!team) throw new Error(`Linear team ${config.linear_team} not found`);
  const states: Record<string, string> = Object.fromEntries(team.states.nodes.map((s: any) => [s.name, s.id]));
  for (const n of ['Start', 'Working', 'Triage']) if (!states[n]) throw new Error(`status ${n} missing; run /init`);
  const inTeam = (name: string) => ({ team: { key: { eq: config.linear_team } }, state: { name: { eq: name } } });

  // Cleanup first, so finished sessions free their slot.
  const known = Object.entries(readState().sessions);
  if (known.length) {
    const finished = (await issuesIn({ id: { in: known.map(([, s]) => s.issue_id) } }))
      .filter((i: any) => ['completed', 'canceled'].includes(i.state.type));
    for (const i of finished) await cleanup(i.identifier, readState().sessions[i.identifier]);
  }

  let running = (await issuesIn(inTeam('Working'))).length;
  const queue = (await issuesIn(inTeam('Start'))).sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt));
  for (const issue of queue) {
    if (running >= config.max_parallel_sessions) break;
    await move(issue.id, states.Working); // the status is the lock
    running++;
    try { await start(issue); } catch (e) {
      log('launcher', issue.identifier, 'start failed:', (e as Error).message);
      await move(issue.id, states.Triage);
      await comment(issue.id, `Autopilot could not start a session:\n\n\`\`\`\n${(e as Error).message}\n\`\`\``);
      running--;
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

  const prompt = [instructions(), section(ws.body, 'Work'), `Use the work skill on Linear issue ${id}.`].filter(Boolean).join('\n\n---\n\n');
  tmux('new-window', '-d', '-t', `${TMUX}:`, '-n', id, '-c', worktree,
    'claude', '--remote-control', id, '--permission-mode', 'acceptEdits', '--settings', path.join(ROOT, '.claude', 'settings.json'), prompt);

  // Past step 3: the session runs. Failures from here on are reported but do not undo the claim.
  let link = '';
  for (let i = 0; i < 30 && !link; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try { link = tmux('capture-pane', '-p', '-J', '-S', '-200', '-t', `${TMUX}:${id}`).match(/https:\/\/claude\.ai\/\S+/)?.[0] ?? ''; } catch { break; }
  }
  const session: Session = { issue_id: issue.id, repo, worktree, branch, window: `${TMUX}:${id}`, link, started: new Date().toISOString() };
  withState(s => { s.sessions[id] = session; });
  await comment(issue.id, [`Session started on branch \`${branch}\`.`,
    link ? `Remote Control: ${link}` : 'Remote Control link not found yet; open it from the Claude app session list.',
    `On the server: \`tmux attach -t ${TMUX} \\; select-window -t ${id}\``].join('\n\n'));
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
  if (lost) await comment(s.issue_id, `Autopilot kept the worktree \`${s.worktree}\`; removing it would lose:\n\n\`\`\`\n${lost.slice(0, 3000)}\n\`\`\``);
  withState(st => { delete st.sessions[id]; });
  log('launcher', id, lost ? 'cleaned up, worktree kept' : 'cleaned up');
}
