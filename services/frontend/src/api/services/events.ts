import { createEventsClient } from '../client'
import type { GetTagResponse } from '../types/events'

export const eventsApi = {
  async getTags(): Promise<GetTagResponse[]> {
    const eventsClient = createEventsClient()
    return eventsClient.get<GetTagResponse[]>('/tags')
  },
}
