import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type {
  EventID,
  PartialEventData,
  Event,
  EventStatus,
  PartialEventDataForUpdate,
} from '../types/events'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { UserID } from '../types/users'
import type { PaymentsAPI } from '../interfaces/payments'
import type { ApiClient } from '../client'
import type { EventTicketTypeData } from '../types/payments'

export const createEventsApi = (eventsClient: ApiClient, paymentsApi: PaymentsAPI): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(eventId: EventID): Promise<GetEventByIdResponse> {
    return eventsClient.get<GetEventByIdResponse>(`/${eventId}`)
  },
  async getEventsByIds(eventIds: EventID[]): Promise<EventsDataResponse> {
    const eventsResponses = await Promise.all(eventIds.map((eventId) => this.getEventById(eventId)))
    return { events: eventsResponses }
  },
  async createEvent(eventData: PartialEventData): Promise<PublishEventResponse> {
    const { poster, date, ...rest } = eventData
    const formData = new FormData()
    if (poster) {
      formData.append('poster', poster)
    }
    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    const tickets: EventTicketTypeData[] = []
    for (const ticket of eventData.ticketTypes) {
      tickets.push({ ...ticket, creatorId: eventData.creatorId })
    }
    formData.append('event', JSON.stringify(backendEventData))
    const event = await eventsClient.post<PublishEventResponse>('/', formData)
    for (const ticket of tickets) {
      await paymentsApi.createEventTicketType(event.eventId, ticket)
    }
    return event
  },
  async updateEventData(eventId: EventID, eventData: PartialEventDataForUpdate): Promise<void> {
    const { poster, date, ...rest } = eventData
    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    console.log('createEvent backendEventData1', date?.toISOString())

    console.log('updateEventData backendEventData', backendEventData)
    await eventsClient.put(`/${eventId}`, backendEventData)
    const tickets: (EventTicketTypeData & { id: string })[] = []
    for (const ticket of eventData.ticketTypes) {
      tickets.push({ ...ticket, creatorId: eventData.creatorId })
    }
    for (const ticket of tickets) {
      await paymentsApi.updateEventTicketType(ticket.id!, ticket)
    }
  },
  async updateEventPoster(eventId: EventID, poster: File): Promise<void> {
    const formData = new FormData()
    formData.append('poster', poster)
    await eventsClient.post(`/${eventId}/poster`, formData)
  },
  async deleteEvent(eventId: EventID): Promise<void> {
    await eventsClient.delete(`/${eventId}`)
  },
  async searchEvents(params: {
    title?: string
    pagination?: PaginatedRequest
    organizationId?: UserID
    status?: EventStatus
  }): Promise<PaginatedResponse<Event>> {
    const { pagination = { ...evaluatePagination(params.pagination) }, ...rest } = params
    return eventsClient.get<PaginatedResponse<Event>>(
      `/search${buildQueryParams({ ...pagination, ...rest })}`
    )
  },
})
