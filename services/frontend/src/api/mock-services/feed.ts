import type { FeedAPI } from '../interfaces/feed'
import { mockEvents } from './data/events'
import type { GetUpcomingResponse } from '@/api/interfaces/feed'

export const mockFeedApi: FeedAPI = {
  async getUpcomingEvents(): Promise<GetUpcomingResponse> {
    const upcomingEvents = mockEvents.slice(0, 5)
    return Promise.resolve({ events: upcomingEvents })
  },
}
