import type { EventTicketType, TicketType } from '@/api/types/payments'

export const DEFAULT_TICKET_TYPE: Omit<EventTicketType, 'eventId' | 'type'> = {
  id: '1',
  description: 'Standard ticket',
  price: 100,
  availableQuantity: 100,
  soldQuantity: 50,
  totalQuantity: 150,
  isSoldOut: false,
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
  price: amount ?? DEFAULT_TICKET_TYPE.price,
})

export const mockEventTicketTypes: EventTicketType[] = []
