import type { ApiClient } from '../client'
import type { EventAPI, GetEventByIdResponse } from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'
import type { EventID } from '../types/events'

export const createEventsApi = (eventsClient: ApiClient): EventAPI => ({
  async getTags(): Promise<GetTagResponse> {
    return eventsClient.get<GetTagResponse>('/tags')
  },
  async getEventById(id: EventID): Promise<GetEventByIdResponse> {
    return eventsClient.get<GetEventByIdResponse>(`/events/${id}`)
  },
})
