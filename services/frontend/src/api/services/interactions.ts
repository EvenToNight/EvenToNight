import type { GetEventInteractionsResponse, InteractionAPI } from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { ApiClient } from '../client'
import type { UserID } from '../types/users'

export const createInteractionsApi = (interactionsClient: ApiClient): InteractionAPI => ({
  async getEventInteractions(eventId: EventID): Promise<GetEventInteractionsResponse> {
    return interactionsClient.get<GetEventInteractionsResponse>(`/events/${eventId}`)
  },
  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/events/${eventId}/interactions/likes`, { userId })
  },
  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    return interactionsClient.delete<void>(`/events/${eventId}/interactions/likes/${userId}`)
  },
  async followUser(targetUserId: UserID, currentUserId: UserID): Promise<void> {
    return interactionsClient.post<void>(`/users/${targetUserId}/interactions/followers`, {
      userId: currentUserId,
    })
  },
  async unfollowUser(targetUserId: UserID, currentUserId: UserID): Promise<void> {
    return interactionsClient.delete<void>(
      `/users/${targetUserId}/interactions/followers/${currentUserId}`
    )
  },
})
