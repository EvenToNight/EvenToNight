import type { ApiClient } from '../client'
import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, PartialEventData, Event, EventStatus } from '../types/events'
import { buildQueryParams, evaluatePagination } from '../utils'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { UserID } from '../types/users'

export const createEventsApi = (eventsClient: ApiClient): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(id_event: EventID): Promise<GetEventByIdResponse> {
    return eventsClient.get<GetEventByIdResponse>(`/${id_event}`)
  },
  async getEventsByIds(id_events: EventID[]): Promise<EventsDataResponse> {
    const eventsResponses = await Promise.all(
      id_events.map((id_event) => this.getEventById(id_event))
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
    console.log('publishEvent backendEventData', backendEventData)
    formData.append('event', JSON.stringify(backendEventData))
    return eventsClient.post<PublishEventResponse>('/', formData)
  },
  async updateEventData(id_event: EventID, eventData: PartialEventData): Promise<void> {
    const { poster, date, ...rest } = eventData
    const backendEventData = {
      ...rest,
      date: date?.toISOString().replace(/\.\d{3}Z$/, ''),
    }
    console.log('updateEventData backendEventData', backendEventData)
    await eventsClient.put(`/${id_event}`, backendEventData)
  },
  async updateEventPoster(id_event: EventID, poster: File): Promise<void> {
    const formData = new FormData()
    formData.append('poster', poster)
    await eventsClient.post(`/${id_event}/poster`, formData)
  },
  async deleteEvent(id_event: EventID): Promise<void> {
    await eventsClient.delete(`/${id_event}`)
  },
  async searchEvents(params: {
    title?: string
    pagination?: PaginatedRequest
    id_organization?: UserID
    status?: EventStatus
  }): Promise<PaginatedResponse<Event>> {
    const { pagination = { ...evaluatePagination(params.pagination) }, ...rest } = params
    return eventsClient.get<PaginatedResponse<Event>>(
      `/search${buildQueryParams({ ...pagination, ...rest })}`
    )
  },
})
