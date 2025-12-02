import type { Event } from '../types/events'

export interface GetUpcomingResponse {
  events: Event[]
}

export interface FeedAPI {
  getUpcomingEvents(): Promise<GetUpcomingResponse>
}
