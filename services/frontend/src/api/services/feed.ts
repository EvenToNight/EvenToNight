import { ApiClient } from '../client'
import type { FeedAPI } from '../interfaces/feed'
import type { GetUpcomingResponse } from '../interfaces/feed'

export const createFeedApi = (feedClient: ApiClient): FeedAPI => ({
  async getUpcomingEvents(): Promise<GetUpcomingResponse> {
    return feedClient.get<GetUpcomingResponse>('/upcoming-events')
  },
})
