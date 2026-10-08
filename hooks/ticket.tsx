import { atom, read, update } from 'claude-code'
import type { EngineInterface, McpToolResult, Register } from 'claude-code'

import type { Ticket, TicketView } from '../types'

// The Autopilot launcher starts each issue's session with AUTOPILOT_ISSUE set
// (e.g. AP-28); in any other session this mod does nothing.
const LINEAR = 'claude.ai Linear'
const PANE = 'autopilot-ticket'
const REFRESH_MS = 60_000

const STATUSES = [
  { name: 'Working', hotkey: 'w' },
  { name: 'Review', hotkey: 'r' },
  { name: 'Waiting', hotkey: 'a' },
  { name: 'Done', hotkey: 'd' },
  { name: 'Canceled', hotkey: 'c' },
  { name: 'Backlog', hotkey: 'b' },
] as const

const view = atom({ plugin: 'autopilot', key: 'ticketView' } as const, {} as TicketView)

const textOf = (result: McpToolResult): string =>
  result.content.map(block => (block.type === 'text' ? block.text : '')).join('')

const issueId = async ($: EngineInterface) => (await $.env.get('AUTOPILOT_ISSUE')) || undefined

const refresh = async ($: EngineInterface, id: string) => {
  try {
    const result = await $.mcp.call(LINEAR, 'get_issue', {
      id,
      fields: ['title', 'description', 'status', 'url'],
    })
    if (result.isError) throw new Error(textOf(result))
    const issue = JSON.parse(textOf(result)) as Partial<Ticket>
    const ticket: Ticket = {
      id,
      title: issue.title ?? '',
      description: issue.description ?? '',
      status: issue.status ?? '?',
      url: issue.url ?? '',
    }
    await update($, view, v => ({ ...v, ticket, error: undefined }))
    $.ui.status(`${id} · ${ticket.status}`)
  } catch (err) {
    await update($, view, v => ({ ...v, error: `Could not read ${id}: ${String(err).slice(0, 200)}` }))
  }
}

const setStatus = async ($: EngineInterface, id: string, status: string) => {
  await update($, view, v => ({ ...v, busy: `Moving to ${status}…` }))
  try {
    const result = await $.mcp.call(LINEAR, 'save_issue', { id, state: status })
    if (result.isError) throw new Error(textOf(result))
    $.ui.toast(`${id} moved to ${status}`)
  } catch (err) {
    $.ui.toast(`${id}: could not move to ${status}: ${String(err).slice(0, 200)}`)
  }
  await update($, view, v => ({ ...v, busy: undefined }))
  await refresh($, id)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const id = await issueId($)
    if (!id) return next(e)

    await $.command.register({
      name: 'ticket',
      description: `Show ${id} in a pane; /ticket <status> moves it`,
      argumentHint: '[Working|Review|Waiting|Done|Canceled|Backlog]',
    })
    void $.ui.open({ id: PANE, title: id })
    void refresh($, id)
    $.clock.every(REFRESH_MS, () => void refresh($, id))

    return next(e)
  })

  on('command.run', { command: 'ticket' }, async ($, e) => {
    const id = await issueId($)
    if (!id) return { text: 'Not an Autopilot session: AUTOPILOT_ISSUE is not set.' }

    const wanted = e.args.trim().toLowerCase()
    if (wanted) {
      const status = STATUSES.find(s => s.name.toLowerCase() === wanted)
      if (!status) return { text: `Unknown status "${e.args.trim()}". Use one of: ${STATUSES.map(s => s.name).join(', ')}.` }
      await setStatus($, id, status.name)
      return { text: `${id} moved to ${status.name}.` }
    }

    const opened = await $.ui.open({ id: PANE, title: id })
    await refresh($, id)
    if (opened.isPlaced) return { text: `${id} shown in the pane.` }

    // Where no pane can be drawn (e.g. a surface that places none), print the ticket instead.
    const { ticket, error } = await read($, view)
    const surfaces = await $.session.surfaces()
    const why = `pane not placed: ${opened.reason ?? '?'}; surfaces: ${surfaces.join(', ') || 'none'}`
    if (!ticket) return { text: `${error ?? `Could not read ${id}.`} (${why})` }
    return {
      text: [
        `${ticket.id} · ${ticket.title}`,
        `Status: ${ticket.status} · ${ticket.url}`,
        '',
        ticket.description || '(no description)',
        '',
        `Move it with /ticket <${STATUSES.map(s => s.name).join('|')}>. (${why})`,
      ].join('\n'),
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Markdown } = $.ui.resolve(e)
    const { ticket, error, busy } = await read($, view)

    if (!ticket) {
      return (
        <Box flexDirection="column">
          <Text dimColor>{error ?? 'Loading the issue…'}</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Text bold>
          {ticket.id} · {ticket.title}
        </Text>
        <Text>
          Status: <Text bold>{ticket.status}</Text>
          {busy ? <Text dimColor>  {busy}</Text> : ''}
        </Text>
        <Box flexDirection="row" flexWrap="wrap" marginTop={1}>
          {STATUSES.map(s => (
            <Button
              key={`status-${s.name}`}
              label={s.name}
              hotkey={s.hotkey}
              dimColor={s.name === ticket.status}
              variant={s.name === ticket.status ? undefined : 'secondary'}
              onPress={() => {
                if (s.name !== ticket.status) void setStatus($, ticket.id, s.name)
              }}
            />
          ))}
          <Button key="refresh" label="↻" plain onPress={() => void refresh($, ticket.id)} />
        </Box>
        {error && <Text color="red">{error}</Text>}
        <Box marginTop={1} flexDirection="column">
          <Markdown text={ticket.description || '_No description._'} />
        </Box>
      </Box>
    )
  })
}
