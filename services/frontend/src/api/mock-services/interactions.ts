import type {
  GetEventInteractionRequest,
  GetEventInteractionsResponse,
  InteractionAPI,
} from '../interfaces/interactions'
import { mockEventInteractions } from './data/interactions'

export const mockInteractionsApi: InteractionAPI = {
  async getEventInteractions(
    request: GetEventInteractionRequest
  ): Promise<GetEventInteractionsResponse> {
    const interaction = mockEventInteractions.find(
      (interaction) => interaction.eventId === request.eventId
    )

    if (!interaction) {
      throw {
        message: `Interaction for ${request.eventId} not found`,
        code: 'INTERACTION_NOT_FOUND',
        status: 404,
      }
    }

    return interaction
  },
}
