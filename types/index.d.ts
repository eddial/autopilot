export type Ticket = {
  id: string
  title: string
  description: string
  status: string
  url: string
}

export type TicketView = {
  ticket?: Ticket
  error?: string
  busy?: string
}

declare module 'claude-code' {
  interface PluginState {
    autopilot: { ticketView: TicketView }
  }
}
