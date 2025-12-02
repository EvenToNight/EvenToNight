import type { GetEventInteractionsResponse, InteractionAPI } from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'

export const createInteractionsApi = (_interactionsClient: ApiClient): InteractionAPI => ({
  async getEventInteractions(_eventId: EventID): Promise<GetEventInteractionsResponse> {
    throw new Error('Not implemented')
  },
  async likeEvent(_eventId: EventID, _userId: UserID): Promise<void> {
    throw new Error('Not implemented')
  },
})
