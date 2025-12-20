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

export interface EventReview {
  id: string
  eventId: EventID
  organizationId: UserID
  collaboratorId?: UserID[]
  userId: UserID
  rating: 0 | 1 | 2 | 3 | 4 | 5
  description: string
}
