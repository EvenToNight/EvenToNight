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

export interface UserInteractionsInfo {
  following: number
  followers: number
  isFollowing?: boolean
}

export const RATING_VALUES = [1, 2, 3, 4, 5] as const
export type Rating = (typeof RATING_VALUES)[number]

export interface UpdateEventReviewData {
  rating: Rating
  title: string
  comment: string
}
export interface EventReviewData extends UpdateEventReviewData {
  userId: UserID
}
export interface EventReview extends EventReviewData {
  eventId: EventID
  createdAt: Date
  updatedAt: Date
  id: string
  creatorId: UserID
  collaboratorsId: UserID[]
}

export interface OrganizationReviewsStatistics {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<Rating, number>
}

export interface PartecipationInfo {
  hasParticipated: boolean
  hasReviewed: boolean
}

export interface UserPartecipation {
  eventId: EventID
  reviewed: boolean
}
