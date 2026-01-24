import type { EventID } from '../types/events'
import { api } from '@/api'

export interface Money {
  amount: number
  currency: string
}

export const TICKET_TYPE_VALUES: string[] = await api.payments.getTicketTypes()
export type TicketType = (typeof TICKET_TYPE_VALUES)[number]

export interface UpdateEventTicketTypeData {
  description?: string
  price?: Money
  quantity?: number
}

export interface EventTicketTypeData {
  type: TicketType
  description?: string
  price: Money
  quantity: number
}

export interface EventTicketType extends Omit<EventTicketTypeData, 'creatorId' | 'quantity'> {
  id: string
  eventId: EventID
  availableQuantity: number
  soldQuantity: number
  totalQuantity: number
  isSoldOut: boolean
}
