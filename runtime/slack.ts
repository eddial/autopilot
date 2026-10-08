// Slack file upload. The Slack connector sends and drafts text only, so a message with a native attachment goes
// through Slack's Web API with the owner's user token (SLACK_USER_TOKEN, scope files:write): the files post as
// the owner, in one message, with the text as its comment. Slack has no draft with a file, so this always sends.
import fs from 'node:fs';
import path from 'node:path';
import { HOME } from './lib.ts';

async function api(method: string, body: URLSearchParams | string, json = false) {
  const token = process.env.SLACK_USER_TOKEN;
  if (!token) throw new Error(`SLACK_USER_TOKEN missing in ${path.join(HOME, '.env')}`);
  const r = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST', body,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': json ? 'application/json; charset=utf-8' : 'application/x-www-form-urlencoded' },
  });
  const j = await r.json();
  if (!j.ok) throw new Error(`Slack ${method}: ${j.error}${j.needed ? ` (needs ${j.needed})` : ''}`);
  return j;
}

// autopilot slack-upload <channel> <file>... [--thread <ts>] [--message "<text>"]
export async function upload(argv: string[]) {
  const flag = (n: string) => { const i = argv.indexOf(`--${n}`); return i < 0 ? undefined : argv.splice(i, 2)[1]; };
  const thread = flag('thread'), message = flag('message');
  const [channel, ...files] = argv;
  if (!channel || !files.length) throw new Error('usage: autopilot slack-upload <channel> <file>... [--thread <ts>] [--message "<text>"]');
  // Uploads take a conversation id; a DM is its D… id (slack_read_channel on the user id shows it), not the U… id.
  if (/^[UW]/.test(channel)) throw new Error(`${channel} is a user id: pass the DM's conversation id (D…), which slack_read_channel with the user id shows`);
  const ids = [];
  for (const file of files) {
    const data = fs.readFileSync(file), name = path.basename(file);
    const { upload_url, file_id } = await api('files.getUploadURLExternal', new URLSearchParams({ filename: name, length: String(data.length) }));
    const r = await fetch(upload_url, { method: 'POST', body: data });
    if (!r.ok) throw new Error(`Slack upload of ${name}: ${r.status}`);
    ids.push({ id: file_id, title: name });
  }
  const done = await api('files.completeUploadExternal', JSON.stringify({
    files: ids, channel_id: channel, ...(thread && { thread_ts: thread }), ...(message && { initial_comment: message }),
  }), true);
  for (const f of done.files) console.log(`${f.title}  ${f.permalink}`);
}
