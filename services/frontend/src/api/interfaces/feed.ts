import type { Event } from '../types/events'
import type { UserID } from '../types/users'
import type { PaginatedRequest, PaginatedResponse } from './commons'

export interface FeedAPI {
  getUpcomingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>>
  getTrendingEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>>
  getFeed(userId: UserID, pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>>
  getNewestEvents(pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>>
  getNearbyEvents(
    lat: number,
    lon: number,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Event>>
  getFriendsEvents(userId: UserID, pagination?: PaginatedRequest): Promise<PaginatedResponse<Event>>
}
