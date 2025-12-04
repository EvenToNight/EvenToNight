import { ApiClient } from '../client'
import type { FeedAPI } from '../interfaces/feed'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Event } from '../types/events'
import type { UserID } from '../types/users'

export const createFeedApi = (feedClient: ApiClient): FeedAPI => ({
  async getUpcomingEvents(_pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return feedClient.get<PaginatedResponse<Event>>('/upcoming-events')
  },

  async getTrendingEvents(_pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return feedClient.get<PaginatedResponse<Event>>('/trending-events')
  },

  async getFeed(userId: UserID, _pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return feedClient.get<PaginatedResponse<Event>>(`/feed/${userId}`)
  },

  async getNewestEvents(_pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return feedClient.get<PaginatedResponse<Event>>('/newest-events')
  },

  async getNearbyEvents(
    lat: number,
    lon: number,
    _pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    return feedClient.get<PaginatedResponse<Event>>(`/nearby-events?lat=${lat}&lon=${lon}`)
  },

  async getFriendsEvents(
    userId: UserID,
    _pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    return feedClient.get<PaginatedResponse<Event>>(`/friends-events/${userId}`)
  },
})
