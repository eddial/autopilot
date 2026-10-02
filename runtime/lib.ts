// Shared helpers for tick.ts and launch.ts: config, Markdown files, state, claude -p.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const STATE_DIR = path.join(ROOT, '.state');
const home = (p: string) => p.replace(/^~(?=\/|$)/, os.homedir());
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch {}
// Cron cannot read the keychain, so git gets GitHub credentials from GH_TOKEN through gh instead.
if (process.env.GH_TOKEN) Object.assign(process.env, {
  GIT_CONFIG_COUNT: '2', GIT_CONFIG_KEY_0: 'credential.helper', GIT_CONFIG_VALUE_0: '',
  GIT_CONFIG_KEY_1: 'credential.https://github.com.helper', GIT_CONFIG_VALUE_1: '!gh auth git-credential',
});

// Flat YAML: `key: value`, `key: [a, b]`, `# comments`. Enough for config and frontmatter.
export function parseYaml(text: string): Record<string, any> {
  const out: Record<string, any> = {};
  for (const line of text.split('\n')) {
    const m = line.replace(/\s+#.*$/, '').match(/^([\w-]+):\s*(.*?)\s*$/);
    if (!m) continue;
    const v = m[2].replace(/^(["'])(.*)\1$/, '$2');
    out[m[1]] = v.startsWith('[') ? v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean) : /^\d+$/.test(v) ? Number(v) : v === 'true' ? true : v === 'false' ? false : v;
  }
  return out;
}

export const config = {
  linear_team: 'BADR', model: 'haiku', max_parallel_sessions: 3, window_cap: '24h', window_overlap: '2m',
  repos_dir: '~/repos', worktrees_dir: '~/work', autopilot_workstream: 'autopilot', filing_tools: [] as string[],
  ...parseYaml(fs.readFileSync(path.join(ROOT, 'autopilot.yaml'), 'utf8')),
};
config.repos_dir = home(config.repos_dir);
config.worktrees_dir = home(config.worktrees_dir);

export type Md = { name: string; meta: Record<string, any>; body: string };
export function readMd(file: string): Md {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return { name: path.basename(file, '.md'), meta: m ? parseYaml(m[1]) : {}, body: (m ? m[2] : text).trim() };
}
export const readDir = (dir: string) =>
  fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort().map(f => readMd(path.join(ROOT, dir, f)));
export const section = (body: string, name: string) =>
  body.match(new RegExp(`^## ${name}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))?.[1].trim() ?? '';
export const instructions = () => fs.readFileSync(path.join(ROOT, 'instructions.md'), 'utf8').trim();

export function duration(s: string): number {
  const m = String(s).match(/^(\d+)\s*([smhd])$/);
  if (!m) throw new Error(`bad duration: ${s}`);
  return Number(m[1]) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2] as 's'];
}

// state.json, guarded by a mkdir lock because detached jobs write it concurrently.
export type Job = {
  pid?: number | null; last_checked?: string; last_run?: string; last_success?: string; last_error?: string | null;
  failures?: number; failing_since?: string | null; gaps?: { from: string; to: string }[]; health_reported?: boolean;
};
export type Session = { issue_id: string; repo: string; worktree: string; branch: string; window: string; link?: string; started: string; seen?: string };
export type State = { jobs: Record<string, Job>; sessions: Record<string, Session> };
const STATE = path.join(STATE_DIR, 'state.json');
export const readState = (): State => {
  try { return { jobs: {}, sessions: {}, ...JSON.parse(fs.readFileSync(STATE, 'utf8')) }; } catch { return { jobs: {}, sessions: {} }; }
};
export function withState<T>(fn: (s: State) => T): T {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const lock = path.join(STATE_DIR, 'lock');
  for (let i = 0; ; i++) {
    try { fs.mkdirSync(lock); break; } catch {
      if (i > 100 || Date.now() - fs.statSync(lock).mtimeMs > 30e3) { fs.rmSync(lock, { recursive: true, force: true }); continue; }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
  try {
    const s = readState();
    const r = fn(s);
    fs.writeFileSync(STATE + '.tmp', JSON.stringify(s, null, 2));
    fs.renameSync(STATE + '.tmp', STATE);
    return r;
  } finally { fs.rmSync(lock, { recursive: true, force: true }); }
}
export const job = (s: State, key: string) => (s.jobs[key] ??= {});
export function succeeded(key: string, patch: Job = {}) {
  withState(s => Object.assign(job(s, key), { pid: null, last_success: new Date().toISOString(), last_error: null, failures: 0, failing_since: null }, patch));
}
export function failed(key: string, err: unknown) {
  const msg = String((err as Error)?.message ?? err).slice(0, 2000);
  log(key, 'failed:', msg);
  withState(s => {
    const j = job(s, key);
    Object.assign(j, { pid: null, last_error: msg, failures: (j.failures ?? 0) + 1, failing_since: j.failing_since ?? new Date().toISOString() });
  });
}

export const alive = (pid?: number | null) => { try { return !!pid && process.kill(pid, 0); } catch { return false; } };
export const log = (...a: unknown[]) => console.log(new Date().toISOString(), ...a);

export function run(cmd: string, args: string[], opts: { cwd?: string; input?: string; timeout?: number; env?: NodeJS.ProcessEnv } = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 << 20, ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 3).join(' ')}: ${r.error?.message ?? (r.stderr || r.stdout).trim().slice(-1500)}`);
  return r.stdout.trim();
}

// One non-interactive Claude call. Tools not listed are denied (dontAsk); the prompt goes in on stdin.
// claude.ai connectors connect in the background, and -p only waits briefly for them. Make it wait until
// they are connected (MCP_CONNECTION_NONBLOCKING=0, up to 30s). As a safety net every listed MCP tool must
// be in the init event's tools, or the call fails and the next tick retries the same window instead of
// "succeeding" without them.
export function claude(prompt: string, o: { tools: string[]; model?: string; schema?: object; timeout?: number }) {
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'dontAsk', '--allowedTools', o.tools.join(',')];
  if (o.model) args.push('--model', o.model);
  if (o.schema) args.push('--json-schema', JSON.stringify(o.schema));
  const env = { ...process.env, MCP_CONNECTION_NONBLOCKING: '0', CLAUDE_CODE_MCP_STARTUP_WAIT_MS: '30000' };
  const events = run('claude', args, { cwd: ROOT, input: prompt, env, timeout: o.timeout ?? 30 * 6e4 })
    .split('\n').flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
  const init = events.find(e => e.type === 'system' && e.subtype === 'init');
  const missing = o.tools.filter(t => t.startsWith('mcp__') && !init?.tools?.includes(t));
  if (missing.length) throw new Error(`claude: tools not available (connector not connected?): ${missing.join(', ')}`);
  const out = events.findLast(e => e.type === 'result');
  if (!out) throw new Error('claude: no result event');
  if (out.is_error) throw new Error(`claude: ${out.result ?? out.subtype}`);
  return out.structured_output ?? out.result;
}
