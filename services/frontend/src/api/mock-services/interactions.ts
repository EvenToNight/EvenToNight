import type { GetEventInteractionsResponse, InteractionAPI } from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { EventReview } from '../types/interaction'
import type { UserID } from '../types/users'
import { mockEventInteractions, mockEventReviews, mockUserInteractions } from './data/interactions'

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

const findUserInteraction = (userId: UserID) => {
  const userInteraction = mockUserInteractions.find((ui) => ui.userId === userId)

  if (!userInteraction) {
    throw {
      message: `User interaction for ${userId} not found`,
      code: 'USER_INTERACTION_NOT_FOUND',
      status: 404,
    }
  }
  return userInteraction
}

export const mockInteractionsApi: InteractionAPI = {
  async getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse> {
    return findInteractionByEventId(eventId)
  },
  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    const interaction = findInteractionByEventId(eventId)
    if (!interaction.likes.includes(userId)) {
      interaction.likes.push(userId)
    }
  },
  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    const interaction = findInteractionByEventId(eventId)
    interaction.likes = interaction.likes.filter((id) => id !== userId)
  },
  async followUser(targetUserId: UserID, currentUserId: UserID): Promise<void> {
    const currentUserInteraction = findUserInteraction(currentUserId)
    const targetUserInteraction = findUserInteraction(targetUserId)

    if (!currentUserInteraction.following.includes(targetUserId)) {
      currentUserInteraction.following.push(targetUserId)
    }
    if (!targetUserInteraction.followers.includes(currentUserId)) {
      targetUserInteraction.followers.push(currentUserId)
    }
  },
  async unfollowUser(targetUserId: UserID, currentUserId: UserID): Promise<void> {
    const currentUserInteraction = findUserInteraction(currentUserId)
    const targetUserInteraction = findUserInteraction(targetUserId)

    currentUserInteraction.following = currentUserInteraction.following.filter(
      (id) => id !== targetUserId
    )
    targetUserInteraction.followers = targetUserInteraction.followers.filter(
      (id) => id !== currentUserId
    )
  },
  async getEventReviews(eventId: EventID): Promise<EventReview[]> {
    return mockEventReviews.filter((review) => review.eventId === eventId)
  },
}
