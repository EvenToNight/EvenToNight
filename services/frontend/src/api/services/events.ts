import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, Event, EventStatus, PartialEventData } from '../types/events'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { UserID } from '../types/users'
import type { ApiClient } from '../client'
// import { createPaymentsClient } from '../client'

export const createEventsApi = (eventsClient: ApiClient): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(eventId: EventID): Promise<GetEventByIdResponse> {
    console.log('Fetching event by ID2:', eventId)
    return eventsClient.get<GetEventByIdResponse>(`/${eventId}`)
  },
  async getEventsByIds(eventIds: EventID[]): Promise<EventsDataResponse> {
    const eventsResponses = await Promise.all(
      eventIds.map((eventId) => {
        console.log('Fetching event for ID:', eventId)
        return this.getEventById(eventId)
      })
    )
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
    formData.append('event', JSON.stringify(backendEventData))
    return await eventsClient.post<PublishEventResponse>('/', formData)
  },
  async updateEventData(eventId: EventID, eventData: PartialEventData): Promise<void> {
    const { poster, date, ...rest } = eventData
    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    await eventsClient.put(`/${eventId}`, backendEventData)
  },
  async updateEventPoster(eventId: EventID, poster: File): Promise<void> {
    const formData = new FormData()
    formData.append('poster', poster)
    await eventsClient.post(`/${eventId}/poster`, formData)
  },
  async deleteEventPoster(eventId: EventID): Promise<void> {
    await eventsClient.delete(`/${eventId}/poster`)
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
