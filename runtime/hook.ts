// Claude Code hooks for Autopilot sessions; a no-op elsewhere. The launcher sets AUTOPILOT_ISSUE.
//   stop:   every pause leaves a comment on the issue. A turn that ends without one is sent back once
//           to write it; if it still ends without one, the hook comments itself.
//   notify: a session stuck on a permission prompt says so on the issue.
import fs from 'node:fs';
import { MARK, comment } from './launch.ts';

const [kind] = process.argv.slice(2);
const issue = process.env.AUTOPILOT_ISSUE_UUID, id = process.env.AUTOPILOT_ISSUE;
if (!issue) process.exit(0);
const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');

// Did the assistant comment on the issue since the last message from Badr (or the relay)?
function commentedThisTurn(transcript: string) {
  let commented = false;
  for (const line of fs.readFileSync(transcript, 'utf8').split('\n')) {
    let e: any; try { e = JSON.parse(line); } catch { continue; }
    const content = e.message?.content;
    if (e.type === 'user' && (typeof content === 'string' || content?.some((c: any) => c.type === 'text'))) commented = false;
    if (e.type === 'assistant' && Array.isArray(content) && content.some((c: any) => c.type === 'tool_use' && /save_comment$/.test(c.name))) commented = true;
  }
  return commented;
}

if (kind === 'stop') {
  if (input.transcript_path && commentedThisTurn(input.transcript_path)) process.exit(0);
  if (!input.stop_hook_active) {
    console.log(JSON.stringify({ decision: 'block', reason:
      `Before you pause, comment on Linear issue ${id} (save_comment), starting with "${MARK}": what you did, what is ready, ` +
      `and the one thing you need from Badr. Then move the issue to Review (his decision) or Waiting (someone else), and stop.` }));
  } else {
    await comment(issue, `${MARK} · paused\n\nThe session stopped without a briefing. Open it via the Remote Control link above or \`tmux attach -t autopilot\`, or reply here to steer it.`);
  }
} else if (kind === 'notify') {
  await comment(issue, `${MARK} · waiting for permission\n\n${input.message ?? 'The session is waiting for a permission prompt.'}\n\nApprove it in the session (Remote Control or tmux), or reply here with what it should do instead.`);
}
