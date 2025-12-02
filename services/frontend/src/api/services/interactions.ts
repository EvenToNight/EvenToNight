import type { GetEventInteractionsResponse, InteractionAPI } from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { ApiClient } from '../client'

export const createInteractionsApi = (_interactionsClient: ApiClient): InteractionAPI => ({
  async getEventInteractions(_eventId: EventID): Promise<GetEventInteractionsResponse> {
    throw new Error('Not implemented')
  },
})
