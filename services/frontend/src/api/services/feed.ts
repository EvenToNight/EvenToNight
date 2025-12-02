import { createFeedClient } from '../client'
import type { FeedAPI } from '../interfaces/feed'
import type { GetUpcomingResponse } from '../interfaces/feed'

export const feedApi: FeedAPI = {
  async getUpcomingEvents(): Promise<GetUpcomingResponse> {
    const eventsClient = createFeedClient()
    return eventsClient.get<GetUpcomingResponse>('/upcoming-events  ')
  },
}
