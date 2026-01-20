import type { EventTicketType, TicketType } from '@/api/types/payments'

export const DEFAULT_TICKET_TYPE: Omit<EventTicketType, 'eventId' | 'type'> = {
  id: '1',
  description: 'Standard ticket',
  price: {
    amount: 100,
    currency: 'USD',
  },
  availableQuantity: 100,
  soldQuantity: 50,
}

let mockTicketIdCounter = 0

export const createMockEventTicketType = (
  eventId: string,
  type: TicketType,
  amount?: number
): EventTicketType => ({
  ...DEFAULT_TICKET_TYPE,
  id: `mock-ticket-${++mockTicketIdCounter}`,
  eventId,
  type,
  price: {
    ...DEFAULT_TICKET_TYPE.price,
    amount: amount ?? DEFAULT_TICKET_TYPE.price.amount,
  },
})

export const mockEventTicketTypes: EventTicketType[] = []
