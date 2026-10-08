import { expect, mock, test } from 'claude-code/testing'

const PANE = {
  component: 'Pane',
  requestId: 'autopilot-ticket',
  props: {
    title: 'AP-28',
    isFocused: false,
    bodyColumns: 80,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

test('shows the issue and moves its status on every surface', async ($, on) => {
  mock.env(on, { AUTOPILOT_ISSUE: 'AP-28' })
  mock.clock(on)
  let status = 'Waiting'
  const saved: unknown[] = []
  on('session.start', async (_$, e) => ({ cwd: e.cwd }))
  on('command.register', async () => ({ value: {} }) as never)
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('ui.status', async () => ({ value: undefined }))
  on('ui.toast', async () => ({ value: undefined }))
  on('mcp.call', async (_$, e) => {
    if (e.tool === 'save_issue') {
      saved.push(e.args)
      status = String(e.args.state)
      return { value: { content: [{ type: 'text', text: '{}' }], isError: false } }
    }
    const issue = { id: 'AP-28', title: 'Write email to Johny', description: 'Draft **it**.', status, url: 'https://linear.app/x' }
    return { value: { content: [{ type: 'text', text: JSON.stringify(issue) }], isError: false } }
  })

  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    status = 'Waiting'
    await $.command.run({ command: 'ticket', args: '' } as never)
    const ui = await $.ui.mount({ plugin: 'autopilot', surface, ...PANE })
    expect(await ui.find({ text: /Write email to Johny/ })).toBeDefined()
    expect(await ui.find({ text: /Waiting/ })).toBeDefined()

    await ui.press({ key: 'status-Review' })
    expect(saved.at(-1)).toEqual({ id: 'AP-28', state: 'Review' })
    await ui.unmount()
  }

  const done = await $.command.run({ command: 'ticket', args: 'done' } as never)
  expect(saved.at(-1)).toEqual({ id: 'AP-28', state: 'Done' })
  expect(done).toEqual(expect.objectContaining({ text: 'AP-28 moved to Done.' }))
})
