import type { UserID } from '../types/users'

export interface GetEventInteractionRequest {
  eventId: string
}
export interface GetEventInteractionsResponse {
  likes: UserID[]
}

export interface InteractionAPI {
  getEventInteractions(request: GetEventInteractionRequest): Promise<GetEventInteractionsResponse>
}
