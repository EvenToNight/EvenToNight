import type { EventID } from '../types/events'
import type { EventTicketType, EventTicketTypeData, TicketType } from '../types/payments'
import type { PaginatedRequest, PaginatedResponse } from './commons'

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
  getEventTicketType(eventId: EventID): Promise<EventTicketType[]>
  createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse>
  //TODO: evaluate order or get from interactions
  findEventsWithUserTickets(
    userId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>>
  getEventPdfTickets(userId: string, eventId: string): Promise<Blob>
}
