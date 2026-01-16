import { TICKET_TYPE_VALUES, type EventTicketType, type TicketType } from '../types/payments'
import type { EventID } from '../types/events'
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  CreateEventTicketTypeRequest,
} from '../interfaces/payments'
import { createMockEventTicketType, mockEventTicketTypes } from './data/payments'

export const mockPaymentsApi = {
  async getTicketTypes(): Promise<TicketType[]> {
    return [...TICKET_TYPE_VALUES]
  },

  async createEventTicketType(
    eventId: EventID,
    request: CreateEventTicketTypeRequest
  ): Promise<EventTicketType> {
    const existingTicketType = mockEventTicketTypes.find(
      (t) => t.eventId === eventId && t.type === request.type
    )
    if (existingTicketType) {
      throw new Error(`Ticket type ${request.type} already exists for event ${eventId}`)
    }
    const newTicketType: EventTicketType = {
      id: (mockEventTicketTypes.length + 1).toString(),
      eventId,
      type: request.type,
      description: request.description,
      price: {
        amount: request.price,
        currency: request.currency || 'USD',
      },
      availableQuantity: request.quantity,
      soldQuantity: 0,
    }
    mockEventTicketTypes.push(newTicketType)
    return newTicketType
  },

  async getEventTicketType(eventId: EventID): Promise<EventTicketType[]> {
    const filteredTicketTypes = mockEventTicketTypes.filter((t) => t.eventId === eventId)
    if (filteredTicketTypes.length === 0)
      return [
        createMockEventTicketType(eventId, 'STANDARD', 20),
        createMockEventTicketType(eventId, 'VIP'),
      ]
    return filteredTicketTypes
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
