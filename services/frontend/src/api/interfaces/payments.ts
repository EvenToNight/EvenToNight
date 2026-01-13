import type { EventID } from '../types/events'
import type { EventTicketType } from '../types/payments'

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
  getEventTicketType(eventId: EventID): Promise<EventTicketType[]>
  createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse>
}
