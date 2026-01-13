import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  PaymentsAPI,
} from '../interfaces/payments'
import type { ApiClient } from '../client'
import type { EventTicketType } from '../types/payments'
import type { EventID } from '../types/events'

export const createPaymentsApi = (paymentsClient: ApiClient): PaymentsAPI => ({
  async getEventTicketType(eventId: EventID): Promise<EventTicketType[]> {
    return paymentsClient.get<EventTicketType[]>(`/events/${eventId}/ticket-types`)
  },

  async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    console.log('Creating checkout session with request:', request)
    return paymentsClient.post<CreateCheckoutSessionResponse>(`/checkout-sessions`, request)
  },
})
