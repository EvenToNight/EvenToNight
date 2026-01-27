import type { EventTicketType, EventTicketTypeData, TicketType } from '../types/payments'
import type { EventID, EventStatus } from '../types/events'
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  PaymentsAPI,
} from '../interfaces/payments'
import type { PaginatedRequest, PaginatedResponse, SortOrder } from '../interfaces/commons'
import { createMockEventTicketType, mockEventTicketTypes } from './data/payments'
import { getPaginatedItems } from '../utils/requestUtils'
import { mockEvents } from './data/events'

export const mockPaymentsApi: PaymentsAPI = {
  async getTicketTypes(): Promise<TicketType[]> {
    return ['STANDARD', 'VIP', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
  },

  async createEventTicketType(
    eventId: EventID,
    request: EventTicketTypeData
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
      price: request.price,
      availableQuantity: request.quantity,
      soldQuantity: 0,
      totalQuantity: request.quantity,
      isSoldOut: false,
    }
    mockEventTicketTypes.push(newTicketType)
    return newTicketType
  },

  async updateEventTicketType(
    ticketTypeId: string,
    request: EventTicketTypeData
  ): Promise<EventTicketType> {
    const ticketTypeIndex = mockEventTicketTypes.findIndex((t) => t.id === ticketTypeId)
    if (ticketTypeIndex === -1) {
      throw new Error(`Ticket type with ID ${ticketTypeId} not found`)
    }
    const existingTicketType = mockEventTicketTypes[ticketTypeIndex]!
    const tempAvailableQuantity = request.quantity
      ? request.quantity - existingTicketType.soldQuantity
      : existingTicketType.availableQuantity
    const availableQuantity = tempAvailableQuantity < 0 ? 0 : tempAvailableQuantity
    const updatedTicketType: EventTicketType = {
      ...existingTicketType,
      description: request.description ?? existingTicketType.description,
      price: request.price ?? existingTicketType.price,
      availableQuantity: availableQuantity,
      totalQuantity: availableQuantity + existingTicketType.soldQuantity,
      isSoldOut: availableQuantity === 0,
    }
    mockEventTicketTypes[ticketTypeIndex] = updatedTicketType
    return updatedTicketType
  },

  async getEventTicketsType(eventId: EventID): Promise<EventTicketType[]> {
    const filteredTicketTypes = mockEventTicketTypes.filter((t) => t.eventId === eventId)
    if (filteredTicketTypes.length === 0)
      return [
        createMockEventTicketType(eventId, 'STANDARD', 20),
        createMockEventTicketType(eventId, 'VIP'),
        createMockEventTicketType(eventId, 'A'),
        createMockEventTicketType(eventId, 'B'),
        createMockEventTicketType(eventId, 'C'),
        createMockEventTicketType(eventId, 'D'),
        createMockEventTicketType(eventId, 'E'),
        createMockEventTicketType(eventId, 'F'),
        createMockEventTicketType(eventId, 'G'),
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

  async findEventsWithUserTickets(
    _userId: string,
    params?: {
      order?: SortOrder
      status?: Omit<EventStatus, 'DRAFT'>
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponse<EventID>> {
    return getPaginatedItems(
      mockEvents.filter((e) => e.status !== 'DRAFT').map((event) => event.eventId),
      params?.pagination
    )
  },

  async getEventPdfTickets(_userId: string, _eventId: string): Promise<Blob> {
    return new Blob(['Mock PDF content'], { type: 'application/pdf' })
  },

  async verifyTicket(_ticketId: string): Promise<boolean> {
    return true
  },
}
