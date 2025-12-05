import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import { mockEvents } from './data/events'
import type { Event } from '../types/events'
import type { FeedAPI } from '../interfaces/feed'
import type { UserID } from '../types/users'
import { getPagintedItems } from '../utils'

export const mockFeedApi: FeedAPI = {
  async getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return getPagintedItems(mockEvents, pagination)
  },
  async getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return getPagintedItems(mockEvents, pagination)
  },
  async getFeed(_userId: UserID, pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    //TODO token for auth userId
    return getPagintedItems(mockEvents, pagination)
  },
  async getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return getPagintedItems(mockEvents, pagination)
  },
  async getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    if (lat < -90 || lat > 90) {
      throw { message: `Latitude out of range: ${lat} (must be between -90 and 90)`, status: 403 }
    }
    if (lon < -180 || lon > 180) {
      throw {
        message: `Longitude out of range: ${lon} (must be between -180 and 180)`,
        status: 403,
      }
    }
    return getPagintedItems(mockEvents, pagination)
  },
  async getFriendsEvents(
    _userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    //TODO token for auth userId
    return getPagintedItems(mockEvents, pagination)
  },
}
