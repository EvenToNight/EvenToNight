import type { UserID, UserInfo } from '../types/users'
import type { EventID, EventStatus, OrganizationRole } from '../types/events'
import type {
  EventReview,
  EventReviewData,
  UpdateEventReviewData,
  OrganizationReviewsStatistics,
  PartecipationInfo,
  UserPartecipation,
  Rating,
} from '../types/interaction'
import type {
  PaginatedRequest,
  PaginatedResponseWithTotalCount,
  ExtendedPaginatedResponse,
  SortOrder,
} from './commons'

export type GetReviewResponse = PaginatedResponseWithTotalCount<EventReview>
export type GetReviewWithStatisticsResponse = ExtendedPaginatedResponse<
  EventReview,
  OrganizationReviewsStatistics
>

export type GetUserInfoResponse = PaginatedResponseWithTotalCount<UserInfo>
export type GetUserLikedEventsResponse = PaginatedResponseWithTotalCount<EventID>

export interface InteractionAPI {
  followUser(currentUserId: UserID, targetUserId: UserID): Promise<void>
  following(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse>
  isFollowing(currentUserId: UserID, targetUserId: UserID): Promise<boolean>
  unfollowUser(currentUserId: UserID, targetUserId: UserID): Promise<void>
  followers(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse>
  getUserLikedEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetUserLikedEventsResponse>
  userLikesEvent(eventId: EventID, userId: UserID): Promise<boolean>
  getUserReviews(
    userId: UserID,
    params: {
      search?: string
      pagination?: PaginatedRequest
    }
  ): Promise<GetReviewResponse>
  userReviewForEvent(userId: UserID, eventId: EventID): Promise<EventReview>
  userParticipations(
    userId: UserID,
    params?: {
      organizationId?: UserID
      reviewed?: boolean
      eventStatus?: EventStatus
      order?: SortOrder
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponseWithTotalCount<UserPartecipation>>
  userParticipatedToEvent(userId: UserID, eventId: EventID): Promise<PartecipationInfo>
  likeEvent(eventId: EventID, userId: UserID): Promise<void>
  getEventLikes(eventId: EventID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse>
  unlikeEvent(eventId: EventID, userId: UserID): Promise<void>
  createEventReview(eventId: EventID, review: EventReviewData): Promise<void>
  getEventReviews(
    eventId: EventID,
    params?: {
      rating?: Rating
      pagination?: PaginatedRequest
    }
  ): Promise<GetReviewWithStatisticsResponse>
  getEventParticipants(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetUserInfoResponse>
  deleteEventReview(eventId: EventID, userId: UserID): Promise<void>
  updateEventReview(eventId: EventID, userId: UserID, review: UpdateEventReviewData): Promise<void>
  getOrganizationReviews(
    organizationId: UserID,
    params?: {
      role?: OrganizationRole
      rating?: Rating
      pagination?: PaginatedRequest
    }
  ): Promise<GetReviewWithStatisticsResponse>
  getOrganizationReviewStatistics(organizationId: UserID): Promise<OrganizationReviewsStatistics>
}
