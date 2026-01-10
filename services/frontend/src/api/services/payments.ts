import type { ApiClient } from '../client'
import type {
  PaymentsAPI,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  CreateCheckoutSessionResponse,
  TicketCategory,
} from '../interfaces/payments'

export const createPaymentsApi = (paymentsClient: ApiClient): PaymentsAPI => ({
  async createCheckout(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    return paymentsClient.post<CreateCheckoutResponse>('/checkout/create', request)
  },

  async createCheckoutSession(
    request: CreateCheckoutRequest
  ): Promise<CreateCheckoutSessionResponse> {
    return paymentsClient.post<CreateCheckoutSessionResponse>('/checkout/session/create', request)
  },

  async cancelCheckout(reservationId: string): Promise<{ status: string }> {
    return paymentsClient.post<{ status: string }>('/checkout/cancel', { reservationId })
  },

  async getEventTickets(eventId: string): Promise<TicketCategory[]> {
    return paymentsClient.get<TicketCategory[]>(`/events/${eventId}/tickets`)
  },
})
