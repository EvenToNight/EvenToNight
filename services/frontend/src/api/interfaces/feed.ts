import type { Event } from '../types/events'
import type { UserID } from '../types/users'
import type { ApiError, PaginatedRequest, PaginatedResponse } from './commons'

export interface FeedAPI {
  getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event> | ApiError>
  getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event> | ApiError>
  getFeed(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event> | ApiError>
  getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event> | ApiError>
  getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event> | ApiError>
  getFriendsEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event> | ApiError>
}
