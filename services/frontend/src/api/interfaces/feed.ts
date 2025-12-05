import type { EventID } from '../types/events'
import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'

export interface FeedAPI {
  getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>>
  getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>>
  getFeed(userId: UserID, pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>>
  getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<EventID>>
  getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>>
  getFriendsEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<EventID>>
}
