import type { GetEventInteractionsResponse, InteractionAPI } from '../interfaces/interactions'
import type { EventID } from '../types/events'
import { mockEventInteractions } from './data/interactions'

export const mockInteractionsApi: InteractionAPI = {
  async getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse> {
    const interaction = mockEventInteractions.find((interaction) => interaction.eventId === eventId)

    if (!interaction) {
      throw {
        message: `Interaction for ${eventId} not found`,
        code: 'INTERACTION_NOT_FOUND',
        status: 404,
      }
    }

    return interaction
  },
}
