import type { PaymentsAPI } from '../interfaces/payments'
import type { ApiClient } from '../client'
import type { EventTicketType } from '../types/payments'
import type { EventID } from '../types/events'

export const createPaymentsApi = (paymentsClient: ApiClient): PaymentsAPI => ({
  async getEventTicketType(eventId: EventID): Promise<EventTicketType[]> {
    return paymentsClient.get<EventTicketType[]>(`/events/${eventId}/ticket-types`)
  },
})
