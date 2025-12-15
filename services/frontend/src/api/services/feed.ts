import { ApiClient } from '../client'
import type { FeedAPI } from '../interfaces/feed'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Event, EventID } from '../types/events'
import type { UserID } from '../types/users'
import { buildQueryParams } from '../utils'

export const createFeedApi = (feedClient: ApiClient): FeedAPI => ({
  async getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    const response = await feedClient.get<PaginatedResponse<Event>>(
      `/search${queryParams}?status=PUBLISHED`
    )
    return {
      ...response,
      items: response.items.map((item: Event) => item.id_event),
    }
  },

  async getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<EventID>>(`/trending-events${queryParams}`)
  },

  async getFeed(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<EventID>>(`/feed/${userId}${queryParams}`)
  },

  async getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<EventID>>(`/newest-events${queryParams}`)
  },

  async getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>> {
    const queryParams = buildQueryParams({ lat, lon, ...pagination })
    return feedClient.get<PaginatedResponse<EventID>>(`/nearby-events${queryParams}`)
  },

  async getFriendsEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>> {
    const queryParams = pagination ? buildQueryParams(pagination) : ''
    return feedClient.get<PaginatedResponse<EventID>>(`/friends-events/${userId}${queryParams}`)
  },
})
