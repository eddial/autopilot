// Claude Code hooks for Autopilot sessions; a no-op elsewhere. The launcher sets AUTOPILOT_ISSUE.
//   stop:   answer where you were asked. Work that came from Linear (the first prompt, a relayed comment, watcher
//           update or new signal) ends with a comment on the issue: a turn that ends without one is sent back once
//           to write it, and if it still has none the hook comments itself. A message typed in the session is
//           answered in the session; Linear stays quiet.
//   notify: a session stuck on a permission prompt says so on the issue.
import fs from 'node:fs';
import { MARK, comment, fromLinear } from './launch.ts';
import { config } from './lib.ts';

const [kind] = process.argv.slice(2);
const issue = process.env.AUTOPILOT_ISSUE_UUID, id = process.env.AUTOPILOT_ISSUE;
if (!issue) process.exit(0);
const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');

const ASK = 'Before you pause, comment on Linear issue';
// Is a comment owed: did the last message come from Linear, with no comment on the issue since? This hook's own
// request to comment does not count as a message.
function owed(transcript: string) {
  let linear = false, commented = false;
  for (const line of fs.readFileSync(transcript, 'utf8').split('\n')) {
    let e: any; try { e = JSON.parse(line); } catch { continue; }
    const content = e.message?.content;
    const text = typeof content === 'string' ? content
      : Array.isArray(content) ? content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n') : '';
    if (e.type === 'user' && text && !text.includes(ASK)) { linear = fromLinear(text); commented = false; }
    if (e.type === 'assistant' && Array.isArray(content) && content.some((c: any) => c.type === 'tool_use' && /save_comment$/.test(c.name))) commented = true;
  }
  return linear && !commented;
}

if (kind === 'stop') {
  if (!input.transcript_path || !owed(input.transcript_path)) process.exit(0);
  if (!input.stop_hook_active) {
    console.log(JSON.stringify({ decision: 'block', reason:
      `${ASK} ${id} (save_comment), starting with "${MARK}": what you did, what is ready, ` +
      `and the one thing you need from ${config.owner}. Then move the issue to Review (their decision) or Waiting (someone else), and stop.` }));
  } else {
    await comment(issue, `${MARK} · paused\n\nThe session stopped without a briefing. Open it from the session links under Resources or \`tmux attach -t autopilot\`, or reply here to steer it.`);
  }
} else if (kind === 'notify') {
  await comment(issue, `${MARK} · waiting for permission\n\n${input.message ?? 'The session is waiting for a permission prompt.'}\n\nApprove it in the session (Remote Control or tmux), or reply here with what it should do instead.`);
}
