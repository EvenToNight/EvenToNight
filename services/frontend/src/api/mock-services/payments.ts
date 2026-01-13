import type { EventTicketType } from '../types/payments'
import type { EventID } from '../types/events'

export const mockPaymentsAPI = {
  async getEventTicketType(eventId: EventID): Promise<EventTicketType[]> {
    return [
      {
        id: '1',
        eventId: eventId,
        type: 'STANDARD',
        description: 'Standard ticket',
        price: {
          amount: 100,
          currency: 'USD',
        },
        availableQuantity: 100,
        soldQuantity: 50,
      },
    ]
  },
}
