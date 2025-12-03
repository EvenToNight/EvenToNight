import type { ApiClient } from '../client'
import type {
  EventAPI,
  GetEventByIdResponse,
  PublishEventResponse,
  SearchEventsByNameResponse,
} from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID, EventData } from '../types/events'

export const createEventsApi = (eventsClient: ApiClient): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(id: EventID): Promise<GetEventByIdResponse> {
    return eventsClient.get<GetEventByIdResponse>(`/events/${id}`)
  },
  async publishEvent(eventData: EventData): Promise<PublishEventResponse> {
    return eventsClient.post<PublishEventResponse>('/events', eventData)
  },

  async searchByName(query: string): Promise<SearchEventsByNameResponse> {
    return eventsClient.get<SearchEventsByNameResponse>(
      `/events/search?q=${encodeURIComponent(query)}`
    )
  },
})
