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

export const RATING_VALUES = [1, 2, 3, 4, 5] as const
export type Rating = (typeof RATING_VALUES)[number]

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

export interface OrganizationReviewsStatistics {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<Rating, number>
}
