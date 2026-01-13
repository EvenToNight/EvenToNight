import type { EventID } from '../types/events'
import type { EventTicketType } from '../types/payments'

export interface PaymentsAPI {
  getEventTicketType(eventId: EventID): Promise<EventTicketType[]>
}
