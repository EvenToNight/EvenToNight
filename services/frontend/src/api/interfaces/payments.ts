import type { EventID, EventStatus } from '../types/events'
import type { EventTicketType, EventTicketTypeData, TicketType } from '../types/payments'
import type { PaginatedRequest, PaginatedResponse, SortOrder } from './commons'

export interface CreateCheckoutSessionResponse {
  sessionId: string
  redirectUrl: string
  expiresAt: number
  reservedTicketIds: string[]
}

export interface CheckoutTicketItem {
  ticketTypeId: string
  attendeeName: string
}

export interface CreateCheckoutSessionRequest {
  userId: string
  items: CheckoutTicketItem[]
  successUrl?: string
  cancelUrl?: string
}

export interface PaymentsAPI {
  getTicketTypes(): Promise<TicketType[]>
  createEventTicketType(eventId: EventID, request: EventTicketTypeData): Promise<EventTicketType>
  updateEventTicketType(
    ticketTypeId: string,
    request: EventTicketTypeData
  ): Promise<EventTicketType>
  getEventTicketsType(eventId: EventID): Promise<EventTicketType[]>
  createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse>
  //TODO: evaluate order or get from interactions
  findEventsWithUserTickets(
    userId: string,
    params?: {
      status?: Omit<EventStatus, 'DRAFT'>
      order?: SortOrder
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponse<EventID>>
  getEventPdfTickets(userId: string, eventId: string): Promise<Blob>
}
