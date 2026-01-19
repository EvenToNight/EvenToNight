import type { EventID } from '../types/events'
import type { EventTicketType, TicketType } from '../types/payments'

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

export interface CreateEventTicketTypeRequest {
  type: TicketType
  description?: string
  price: number
  currency?: string
  quantity: number
}

export interface PaymentsAPI {
  getTicketTypes(): Promise<TicketType[]>
  createEventTicketType(
    eventId: EventID,
    request: CreateEventTicketTypeRequest
  ): Promise<EventTicketType>
  getEventTicketType(eventId: EventID): Promise<EventTicketType[]>
  createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse>
}
