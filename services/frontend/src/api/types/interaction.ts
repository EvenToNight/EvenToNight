import type { EventID } from './events'
import type { UserID } from './users'

export interface EventInteraction {
  id: string
  eventId: EventID
  likes: UserID[]
}

export interface UserInteraction {
  id: string
  userId: UserID
  followers: UserID[]
  following: UserID[]
}

export type Rating = 0 | 1 | 2 | 3 | 4 | 5

export interface EventReviewData {
  userId: UserID
  organizationId: UserID
  collaboratorsId: UserID[]
  rating: Rating
  title: string
  comment: string
}
export interface EventReview extends EventReviewData {
  id: string
  eventId: EventID
}
