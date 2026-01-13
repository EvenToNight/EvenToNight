import type { EventTicketType } from '../types/payments'
import type { EventID } from '../types/events'
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from '../interfaces/payments'

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

  async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    return {
      sessionId: 'mock-session-id',
      redirectUrl: request.successUrl || 'http://localhost',
      expiresAt: Date.now() + 30 * 60 * 1000, // Expires in 30 minutes
      reservedTicketIds: request.items.map((_item, index) => `ticket-${index + 1}`),
    }
  },
}
