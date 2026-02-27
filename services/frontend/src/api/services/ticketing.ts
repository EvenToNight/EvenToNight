import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  TicketingAPI,
  TicketRequestEventStatus,
} from '../interfaces/ticketing'
import type { ApiClient } from '../client'
import type {
  EventTicketType,
  TicketType,
  UpdateEventTicketTypeData,
  EventTicketTypeData,
} from '../types/ticketing'
import type { EventID } from '../types/events'
import type { PaginatedRequest, PaginatedResponse, SortOrder } from '../interfaces/commons'
import { buildQueryParams } from '../utils/requestUtils'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
export const createTicketingApi = (ticketingClient: ApiClient): TicketingAPI => ({
  async getTicketTypes(): Promise<TicketType[]> {
    return ticketingClient.get<TicketType[]>(`/ticket-types/values`)
  },

  async updateEventTicketType(
    ticketTypeId: string,
    request: UpdateEventTicketTypeData
  ): Promise<EventTicketType> {
    logger.log('Updating ticket type:', ticketTypeId, request)
    return ticketingClient.put<EventTicketType>(`/ticket-types/${ticketTypeId}`, request)
  },
  async createEventTicketType(
    eventId: EventID,
    request: EventTicketTypeData
  ): Promise<EventTicketType> {
    return ticketingClient.post<EventTicketType>(`/events/${eventId}/ticket-types`, request)
  },

  async getEventTicketsType(eventId: EventID): Promise<EventTicketType[]> {
    return ticketingClient.get<EventTicketType[]>(`/events/${eventId}/ticket-types`)
  },

  async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    return ticketingClient.post<CreateCheckoutSessionResponse>(`/checkout-sessions`, request)
  },

  findEventsWithUserTickets(
    userId: string,
    params?: {
      status?: TicketRequestEventStatus
      order?: SortOrder
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponse<EventID>> {
    const queryParams = {
      ...params?.pagination,
      status: params?.status,
      order: params?.order,
    }
    return ticketingClient.get<PaginatedResponse<EventID>>(
      `/users/${userId}/events${buildQueryParams(queryParams)}`
    )
  },

  async getEventPdfTickets(userId: string, eventId: string): Promise<Blob> {
    return ticketingClient.getBlob(`/users/${userId}/events/${eventId}/pdf`)
  },

  async verifyTicket(ticketId: string): Promise<boolean> {
    return ticketingClient.put<boolean>(`/tickets/${ticketId}/verify`)
  },
})
