import type {
  GetEventInteractionRequest,
  GetEventInteractionsResponse,
  InteractionAPI,
} from '../interfaces/interactions'

export const interactionsApi: InteractionAPI = {
  async getEventInteractions(
    _request: GetEventInteractionRequest
  ): Promise<GetEventInteractionsResponse> {
    throw new Error('Not implemented')
  },
}
