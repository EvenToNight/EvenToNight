import type {
  GetUserInfoResponse,
  GetReviewResponse,
  GetReviewWithStatisticsResponse,
  GetUserLikedEventsResponse,
  InteractionAPI,
} from '../interfaces/interactions'
import type { EventID, OrganizationRole } from '../types/events'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'
import type {
  EventReviewData,
  UpdateEventReviewData,
  EventReview,
  UserPartecipation,
  PartecipationInfo,
} from '../types/interaction'
import type { PaginatedRequest, PaginatedResponseWithTotalCount } from '../interfaces/commons'
import { evaluatePagination, buildQueryParams } from '@/api/utils/requestUtils'

export const createInteractionsApi = (interactionsClient: ApiClient): InteractionAPI => ({
  async followUser(currentUserId: UserID, targetUserId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/users/${currentUserId}/following`, {
      followedId: targetUserId,
    })
  },

  async following(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    return interactionsClient.get<GetUserInfoResponse>(
      `/users/${userId}/following${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },

  async isFollowing(currentUserId: UserID, targetUserId: UserID): Promise<boolean> {
    return interactionsClient
      .get<{ isFollowing: boolean }>(`/users/${currentUserId}/following/${targetUserId}`)
      .then((response) => response.isFollowing)
  },

  async unfollowUser(currentUserId: UserID, targetUserId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/users/${currentUserId}/following/${targetUserId}`)
  },

  async followers(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    return interactionsClient.get<GetUserInfoResponse>(
      `/users/${userId}/followers${buildQueryParams({ ...evaluatePagination(pagination) })}`
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

  async userLikesEvent(eventId: EventID, userId: UserID): Promise<boolean> {
    return interactionsClient
      .get<{ hasLiked: boolean }>(`/users/${userId}/likes/${eventId}`)
      .then((response) => response.hasLiked)
  },

  async getUserReviews(
    userId: UserID,
    params: {
      search?: string
      pagination?: PaginatedRequest
    }
  ): Promise<GetReviewResponse> {
    return interactionsClient.get<GetReviewResponse>(
      `/users/${userId}/reviews${buildQueryParams({ ...evaluatePagination(params.pagination), search: params.search })}`
    )
  },

  async userReviewForEvent(userId: UserID, eventId: EventID): Promise<EventReview> {
    return interactionsClient.get<EventReview>(`/users/${userId}/reviews/${eventId}`)
  },

  async userParticipations(
    userId: UserID,
    params?: {
      organizationId?: UserID
      reviewed?: boolean
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponseWithTotalCount<UserPartecipation>> {
    return interactionsClient.get<PaginatedResponseWithTotalCount<UserPartecipation>>(
      `/users/${userId}/participations${buildQueryParams({
        ...evaluatePagination(params?.pagination),
        organizationId: params?.organizationId,
        reviewed: params?.reviewed,
      })}`
    )
  },

  async userParticipatedToEvent(userId: UserID, eventId: EventID): Promise<PartecipationInfo> {
    return interactionsClient.get<PartecipationInfo>(`/users/${userId}/participations/${eventId}`)
  },

  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/events/${eventId}/likes`, { userId })
  },

  async getEventLikes(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetUserInfoResponse> {
    return interactionsClient.get<GetUserInfoResponse>(
      `/events/${eventId}/likes${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },

  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/likes/${userId}`)
  },

  async createEventReview(eventId: EventID, review: EventReviewData): Promise<void> {
    return interactionsClient.post<void>(`/events/${eventId}/reviews`, review)
  },

  async getEventReviews(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewWithStatisticsResponse> {
    const response = await interactionsClient.get<
      GetReviewWithStatisticsResponse & { totalItems: number }
    >(`/events/${eventId}/reviews${buildQueryParams({ ...evaluatePagination(pagination) })}`)
    response.totalReviews = response.totalItems
    return response
  },

  async deleteEventReview(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/reviews/${userId}`)
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
    params?: {
      role?: OrganizationRole
      pagination?: PaginatedRequest
    }
  ): Promise<GetReviewWithStatisticsResponse> {
    const response = await interactionsClient.get<
      GetReviewWithStatisticsResponse & { totalItems: number }
    >(
      `/organizations/${organizationId}/reviews${buildQueryParams({ ...evaluatePagination(params?.pagination) })}`
    )
    response.totalReviews = response.totalItems
    return response
  },
})
