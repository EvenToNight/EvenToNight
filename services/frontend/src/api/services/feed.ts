import { ApiClient } from '../client'
import type { FeedAPI } from '../interfaces/feed'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Event } from '../types/events'
import type { UserID } from '../types/users'
import { buildQueryParams } from '../utils'

export const createFeedApi = (feedClient: ApiClient): FeedAPI => ({
  async getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<Event>>(`/upcoming-events${queryParams}`)
  },

  async getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<Event>>(`/trending-events${queryParams}`)
  },

  async getFeed(userId: UserID, pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<Event>>(`/feed/${userId}${queryParams}`)
  },

  async getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<Event>>(`/newest-events${queryParams}`)
  },

  async getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    const queryParams = buildQueryParams({ lat, lon, ...pagination })
    return feedClient.get<PaginatedResponse<Event>>(`/nearby-events${queryParams}`)
  },

  async getFriendsEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<Event>>(`/friends-events/${userId}${queryParams}`)
  },
})
