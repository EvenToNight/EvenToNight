import type { EventID } from '../types/events'

export interface Money {
  amount: number
  currency: string
}

export const TICKET_TYPE_VALUES = ['STANDARD', 'VIP', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as const
export type TicketType = (typeof TICKET_TYPE_VALUES)[number]

export interface EventTicketType {
  id: string
  eventId: EventID
  type: TicketType
  description?: string
  price: Money
  availableQuantity: number
  soldQuantity: number
}
