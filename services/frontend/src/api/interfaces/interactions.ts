import type { UserID } from '../types/users'
import type { EventID } from '../types/events'

export interface GetEventInteractionsResponse {
  likes: UserID[]
}

export interface InteractionAPI {
  getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse>
  likeEvent(eventId: EventID, userId: UserID): Promise<void>
}
