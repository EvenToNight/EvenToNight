import type { ApiError, PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import { mockEvents } from './data/events'
import type { Event } from '../types/events'
import type { FeedAPI } from '../interfaces/feed'
import type { UserID } from '../types/users'

const defaultLimit = 4
const defaultOffset = 0

const evaluatePagination = (pagination?: PaginatedRequest): { limit: number; offset: number } => {
  const limit = pagination?.limit ?? defaultLimit
  const offset = pagination?.offset ?? defaultOffset
  return { limit, offset }
}

const getPagintedEvents = (pagination?: PaginatedRequest): PaginatedResponse<Event> => {
  const { limit, offset } = evaluatePagination(pagination)
  const hasMore = mockEvents.length > offset + limit
  const items = mockEvents.slice(offset, offset + limit)
  return {
    items,
    limit,
    offset,
    hasMore,
  }
}

export const mockFeedApi: FeedAPI = {
  async getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return getPagintedEvents(pagination)
  },
  async getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return getPagintedEvents(pagination)
  },
  async getFeed(userId: UserID, pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    //TODO token for auth userId
    return getPagintedEvents(pagination)
  },
  async getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>> {
    return getPagintedEvents(pagination)
  },
  async getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event> | ApiError> {
    if (lat < -90 || lat > 90) {
      return { message: `Latitude out of range: ${lat} (must be between -90 and 90)`, status: 403 }
    }
    if (lon < -180 || lon > 180) {
      return {
        message: `Longitude out of range: ${lon} (must be between -180 and 180)`,
        status: 403,
      }
    }
    return getPagintedEvents(pagination)
  },
  async getFriendsEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>> {
    //TODO token for auth userId
    return getPagintedEvents(pagination)
  },
}
