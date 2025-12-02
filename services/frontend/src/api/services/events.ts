import { createEventsClient } from '../client'
import type { EventAPI } from '../interfaces/events'
import type { GetTagResponse } from '../interfaces/events'

export const eventsApi: EventAPI = {
  async getTags(): Promise<GetTagResponse> {
    const eventsClient = createEventsClient()
    return eventsClient.get<GetTagResponse>('/tags')
  },
}
