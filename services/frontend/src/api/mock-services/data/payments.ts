import type { EventTicketType } from '@/api/types/payments'

export const DEFAULT_TICKET_TYPE: Omit<EventTicketType, 'eventId'> = {
  id: '1',
  type: 'STANDARD',
  description: 'Standard ticket',
  price: {
    amount: 100,
    currency: 'USD',
  },
  availableQuantity: 100,
  soldQuantity: 50,
}

export const mockEventTicketTypes: EventTicketType[] = []
