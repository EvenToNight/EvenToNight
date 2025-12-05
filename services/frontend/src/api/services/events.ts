import type { ApiClient } from '../client'
import type {
  EventAPI,
  GetEventByIdResponse,
  GetEventsByIdsResponse,
  PublishEventResponse,
  SearchEventsByNameResponse,
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
  async getEventsByIds(ids: EventID[]): Promise<GetEventsByIdsResponse> {
    const eventsResponses = await Promise.all(ids.map((id) => this.getEventById(id)))
    return { events: eventsResponses.map((r) => r.event) }
  },
  async publishEvent(eventData: EventData): Promise<PublishEventResponse> {
    return eventsClient.post<PublishEventResponse>('/events', eventData)
  },
  async searchByName(query: string): Promise<SearchEventsByNameResponse> {
    return eventsClient.get<SearchEventsByNameResponse>(`/events${buildQueryParams({ query })}`)
  },
})
