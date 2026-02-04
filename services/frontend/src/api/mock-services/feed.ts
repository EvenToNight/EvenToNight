import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { EventID } from '../types/events'
import type { FeedAPI } from '../interfaces/feed'
import type { UserID } from '../types/users'
import { getPaginatedItems } from '../utils/requestUtils'
import { mockFeed } from './data/feed'

export const mockFeedApi: FeedAPI = {
  async getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>> {
    return getPaginatedItems(mockFeed, pagination)
  },
  async getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>> {
    return getPaginatedItems(mockFeed, pagination)
  },
  async getFeed(
    _userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>> {
    return getPaginatedItems(mockFeed, pagination)
  },
  async getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>> {
    return getPaginatedItems(mockFeed, pagination)
  },
  async getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>> {
    if (lat < -90 || lat > 90) {
      throw { message: `Latitude out of range: ${lat} (must be between -90 and 90)`, status: 403 }
    }
    if (lon < -180 || lon > 180) {
      throw {
        message: `Longitude out of range: ${lon} (must be between -180 and 180)`,
        status: 403,
      }
    }
    return getPaginatedItems(mockFeed, pagination)
  },
  async getFriendsEvents(
    _userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>> {
    return getPaginatedItems(mockFeed, pagination)
  },
}
