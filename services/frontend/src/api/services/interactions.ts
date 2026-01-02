import type {
  GetEventLikesResponse,
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
import { evaluatePagination, buildQueryParams } from '../utils'

export const createInteractionsApi = (interactionsClient: ApiClient): InteractionAPI => ({
  async getEventLikes(eventId: EventID): Promise<GetEventLikesResponse> {
    return interactionsClient.get<GetEventLikesResponse>(`/events/${eventId}/likes`)
  },
  async userLikesEvent(eventId: EventID, userId: UserID): Promise<boolean> {
    //TODO implement proper endpoint to check if user likes event
    return interactionsClient
      .get<boolean>(`/events/${eventId}/likes/${userId}`)
      .then((_response) => true)
      .catch((error) => {
        if (error.status === 404) {
          console.log('Like not found - returning false to catch 404')
          return false
        }
        throw error
      })
  },
  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/events/${eventId}/likes`, { userId })
  },
  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/likes/${userId}`)
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
    const response = await interactionsClient.get<GetReviewWithStatisticsResponse>(
      `/organizations/${organizationId}/reviews${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
    //TODO: decide how to retrieve statistics from backend
    response.averageRating = 0
    response.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    response.totalReviews = 0
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
