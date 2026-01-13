import type { EventID } from '../types/events'

export interface Money {
  amount: number
  currency: string
}

export type TicketType = 'STANDARD' | 'VIP'

export interface EventTicketType {
  id: string
  eventId: EventID
  type: TicketType
  description?: string
  price: Money
  availableQuantity: number
  soldQuantity: number
}
