import type { ApiClient } from '../client'
import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  EventsDataResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, EventData } from '../types/events'
import { buildQueryParams } from '../utils'

export const createEventsApi = (eventsClient: ApiClient): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(id: EventID): Promise<GetEventByIdResponse> {
    return eventsClient.get<GetEventByIdResponse>(`/events/${id}`)
  },
  async getEventsByIds(ids: EventID[]): Promise<EventsDataResponse> {
    const eventsResponses = await Promise.all(ids.map((id) => this.getEventById(id)))
    return { events: eventsResponses.map((r) => r.event) }
  },
  async publishEvent(eventData: EventData): Promise<PublishEventResponse> {
    return eventsClient.post<PublishEventResponse>('/events', eventData)
  },
  async searchByName(query: string): Promise<EventsDataResponse> {
    return eventsClient.get<EventsDataResponse>(`/events${buildQueryParams({ query })}`)
  },
  async getEventsByUserIdAndStatus(userId: string, status: string): Promise<EventsDataResponse> {
    return eventsClient.get<EventsDataResponse>(`/events${buildQueryParams({ userId, status })}`)
  },
})
