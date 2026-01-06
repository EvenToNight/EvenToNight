import type { UserID } from '../types/users'
import type { EventID } from '../types/events'
import type {
  EventReview,
  EventReviewData,
  UpdateEventReviewData,
  OrganizationReviewsStatistics,
} from '../types/interaction'
import type {
  PaginatedRequest,
  PaginatedResponseWithTotalCount,
  ExtendedPaginatedResponse,
} from './commons'

export type GetReviewResponse = PaginatedResponseWithTotalCount<EventReview>
export type GetReviewWithStatisticsResponse = ExtendedPaginatedResponse<
  EventReview,
  OrganizationReviewsStatistics
>

export type GetEventLikesResponse = PaginatedResponseWithTotalCount<UserID>
export type GetUserLikedEventsResponse = PaginatedResponseWithTotalCount<EventID>

//TODO: find way to get user following status and if user participated to event
export interface InteractionAPI {
  getEventLikes(eventId: EventID): Promise<GetEventLikesResponse>
  userLikesEvent(eventId: EventID, userId: UserID): Promise<boolean>
  likeEvent(eventId: EventID, userId: UserID): Promise<void>
  unlikeEvent(eventId: EventID, userId: UserID): Promise<void>
  followUser(targetUserId: UserID, currentUserId: UserID): Promise<void>
  unfollowUser(targetUserId: UserID, currentUserId: UserID): Promise<void>
  getEventReviews(eventId: EventID, pagination?: PaginatedRequest): Promise<GetReviewResponse>
  createEventReview(eventId: EventID, review: EventReviewData): Promise<void>
  updateEventReview(eventId: EventID, userId: UserID, review: UpdateEventReviewData): Promise<void>
  getOrganizationReviews(
    organizationId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewWithStatisticsResponse>
  deleteEventReview(eventId: EventID, userId: UserID): Promise<void>
  getUserReviews(userId: UserID, pagination?: PaginatedRequest): Promise<GetReviewResponse>
  getUserLikedEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetUserLikedEventsResponse>
}
