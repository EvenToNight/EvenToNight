import type { GetEventInteractionsResponse, InteractionAPI } from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { UserID } from '../types/users'
import { mockEventInteractions } from './data/interactions'

const findInteractionByEventId = (eventId: EventID) => {
  const interaction = mockEventInteractions.find((interaction) => interaction.eventId === eventId)

  if (!interaction) {
    throw {
      message: `Interaction for ${eventId} not found`,
      code: 'INTERACTION_NOT_FOUND',
      status: 404,
    }
  }
  return interaction
}

export const mockInteractionsApi: InteractionAPI = {
  async getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse> {
    return findInteractionByEventId(eventId)
  },
  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    findInteractionByEventId(eventId).likes.push(userId)
  },
  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    const interaction = findInteractionByEventId(eventId)
    interaction.likes = interaction.likes.filter((id) => id !== userId)
  },
}
