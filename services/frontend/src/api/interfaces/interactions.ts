import type { UserID } from '../types/users'
import type { EventID } from '../types/events'
import type { EventReview, EventReviewData } from '../types/interaction'

export interface GetEventInteractionsResponse {
  likes: UserID[]
}

export interface InteractionAPI {
  getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse>
  likeEvent(eventId: EventID, userId: UserID): Promise<void>
  unlikeEvent(eventId: EventID, userId: UserID): Promise<void>
  followUser(targetUserId: UserID, currentUserId: UserID): Promise<void>
  unfollowUser(targetUserId: UserID, currentUserId: UserID): Promise<void>
  getEventReviews(eventId: EventID): Promise<EventReview[]>
  createEventReview(eventId: EventID, review: EventReviewData): Promise<void>
  getOrganizationReviews(organizationId: UserID): Promise<EventReview[]>
}
