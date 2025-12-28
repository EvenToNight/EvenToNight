import type {
  GetEventInteractionsResponse,
  GetReviewResponse,
  GetReviewWithStatisticsResponse,
  InteractionAPI,
} from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'
import type { EventReviewData, UpdateEventReviewData } from '../types/interaction'
import type { PaginatedRequest } from '../interfaces/commons'
import { evaluatePagination, buildQueryParams } from '../utils'

export const createInteractionsApi = (interactionsClient: ApiClient): InteractionAPI => ({
  async getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse> {
    return interactionsClient.get<GetEventInteractionsResponse>(`/events/${eventId}`)
  },
  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/events/${eventId}/interactions/likes`, { userId })
  },
  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/interactions/likes/${userId}`)
  },
  async followUser(targetUserId: UserID, currentUserId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/users/${targetUserId}/interactions/followers`, {
      userId: currentUserId,
    })
  },
  async unfollowUser(targetUserId: UserID, currentUserId: UserID): Promise<void> {
    return interactionsClient.delete<void>(
      `/users/${targetUserId}/interactions/followers/${currentUserId}`
    )
  },
  async getEventReviews(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewResponse> {
    return interactionsClient.get<GetReviewResponse>(
      `/events/${eventId}/reviews${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },
  async createEventReview(eventId: EventID, review: EventReviewData): Promise<void> {
    return interactionsClient.post<void>(`/events/${eventId}/reviews`, review)
  },
  async updateEventReview(
    eventId: EventID,
    userId: UserID,
    review: UpdateEventReviewData
  ): Promise<void> {
    return interactionsClient.put<void>(`/events/${eventId}/reviews/${userId}`, review)
  },
  async getOrganizationReviews(
    organizationId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewWithStatisticsResponse> {
    return interactionsClient.get<GetReviewWithStatisticsResponse>(
      `/organizations/${organizationId}/reviews${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },
  async deleteEventReview(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/reviews/${userId}`)
  },
})
