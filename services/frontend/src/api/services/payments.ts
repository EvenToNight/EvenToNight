import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  PaymentsAPI,
} from '../interfaces/payments'
import type { ApiClient } from '../client'
import type {
  EventTicketType,
  TicketType,
  UpdateEventTicketTypeData,
  EventTicketTypeData,
} from '../types/payments'
import type { EventID } from '../types/events'

export const createPaymentsApi = (paymentsClient: ApiClient): PaymentsAPI => ({
  async getTicketTypes(): Promise<TicketType[]> {
    return paymentsClient.get<TicketType[]>(`/ticket-types/values`)
  },

  async updateEventTicketType(
    ticketTypeId: string,
    request: UpdateEventTicketTypeData
  ): Promise<EventTicketType> {
    return paymentsClient.put<EventTicketType>(`/ticket-types/${ticketTypeId}`, request)
  },
  async createEventTicketType(
    eventId: EventID,
    request: EventTicketTypeData
  ): Promise<EventTicketType> {
    return paymentsClient.post<EventTicketType>(`/events/${eventId}/ticket-types`, request)
  },

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
