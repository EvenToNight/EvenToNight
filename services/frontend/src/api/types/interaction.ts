import type { EventID } from './events'
import type { UserID } from './users'

export interface EventInteraction {
  id: string
  eventId: EventID
  likes: UserID[]
}
