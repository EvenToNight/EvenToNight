import type { ApiClient } from '../client'
import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
  EventPaginatedResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, PartialEventData } from '../types/events'
import { buildQueryParams, evaluatePagination } from '../utils'
import type { PaginatedRequest } from '../interfaces/commons'

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
  async publishEvent(eventData: PartialEventData): Promise<PublishEventResponse> {
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
    return eventsClient.post<{ id_event: string }>('/', formData)
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
  async searchByName(
    id_organization: string,
    pagination?: PaginatedRequest
  ): Promise<EventPaginatedResponse> {
    return eventsClient.get<EventPaginatedResponse>(
      `/search${buildQueryParams({ id_organization, ...evaluatePagination(pagination) })}`
    )
  },
  async getEventsByUserIdAndStatus(
    id_organization: string,
    status: string,
    pagination?: PaginatedRequest
  ): Promise<EventPaginatedResponse> {
    return eventsClient.get<EventPaginatedResponse>(
      `/search${buildQueryParams({ id_organization, status, ...evaluatePagination(pagination) })}`
    )
  },
})
