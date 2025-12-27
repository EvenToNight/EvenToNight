import type { UserID } from '../types/users'
import type { EventID } from '../types/events'
import type {
  EventReview,
  EventReviewData,
  OrganizationReviewsStatistics,
} from '../types/interaction'
import type {
  PaginatedRequest,
  PaginatedResponseWithTotalCount,
  PaginatedResponseWithStatistics,
} from './commons'

export type GetReviewResponse = PaginatedResponseWithTotalCount<EventReview>
export type GetReviewWithStatisticsResponse = PaginatedResponseWithStatistics<
  EventReview,
  OrganizationReviewsStatistics
>

export interface GetEventInteractionsResponse {
  likes: UserID[]
}

export interface InteractionAPI {
  getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse>
  likeEvent(eventId: EventID, userId: UserID): Promise<void>
  unlikeEvent(eventId: EventID, userId: UserID): Promise<void>
  followUser(targetUserId: UserID, currentUserId: UserID): Promise<void>
  unfollowUser(targetUserId: UserID, currentUserId: UserID): Promise<void>
  getEventReviews(eventId: EventID, pagination?: PaginatedRequest): Promise<GetReviewResponse>
  createEventReview(eventId: EventID, review: EventReviewData): Promise<void>
  getOrganizationReviews(
    organizationId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewWithStatisticsResponse>
}
