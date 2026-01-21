import type {
  GetUserInfoResponse,
  GetReviewResponse,
  GetReviewWithStatisticsResponse,
  GetUserLikedEventsResponse,
  InteractionAPI,
} from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'
import type { EventReviewData, UpdateEventReviewData } from '../types/interaction'
import type { PaginatedRequest } from '../interfaces/commons'
import { evaluatePagination, buildQueryParams } from '@/api/utils/requestUtils'

export const createInteractionsApi = (interactionsClient: ApiClient): InteractionAPI => ({
  async getEventLikes(eventId: EventID): Promise<GetUserInfoResponse> {
    return interactionsClient.get<GetUserInfoResponse>(`/events/${eventId}/likes`)
  },
  async userLikesEvent(eventId: EventID, userId: UserID): Promise<boolean> {
    return interactionsClient
      .get<{ hasLiked: boolean }>(`/users/${userId}/likes/${eventId}`)
      .then((response) => response.hasLiked)
  },
  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/events/${eventId}/likes`, { userId })
  },
  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/likes/${userId}`)
  },
  async isFollowing(currentUserId: UserID, targetUserId: UserID): Promise<boolean> {
    return interactionsClient
      .get<{ isFollowing: boolean }>(`/users/${currentUserId}/following/${targetUserId}`)
      .then((response) => response.isFollowing)
  },
  async followUser(currentUserId: UserID, targetUserId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/users/${currentUserId}/following`, {
      followedId: targetUserId,
    })
  },
  async unfollowUser(currentUserId: UserID, targetUserId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/users/${currentUserId}/following/${targetUserId}`)
  },
  async following(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    return interactionsClient.get<GetUserInfoResponse>(
      `/users/${userId}/following${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },
  async followers(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    return interactionsClient.get<GetUserInfoResponse>(
      `/users/${userId}/followers${buildQueryParams({ ...evaluatePagination(pagination) })}`
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
    const response = await interactionsClient.get<
      GetReviewWithStatisticsResponse & { totalItems: number }
    >(
      `/organizations/${organizationId}/reviews${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
    response.totalReviews = response.totalItems
    return response
  },
  async deleteEventReview(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/reviews/${userId}`)
  },
  async getUserReviews(userId: UserID, pagination?: PaginatedRequest): Promise<GetReviewResponse> {
    return interactionsClient.get<GetReviewResponse>(
      `/users/${userId}/reviews${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },
  async getUserLikedEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetUserLikedEventsResponse> {
    return interactionsClient.get<GetUserLikedEventsResponse>(
      `/users/${userId}/likes${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },
})
