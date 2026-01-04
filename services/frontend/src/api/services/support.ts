import type { SupportAPI } from '../interfaces/support'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Conversation, Message } from '../types/support'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { ApiClient } from '../client'
import { createSupportWebSocket, type SupportWebSocket } from '../mock-services/supportWebSocket'

export const createSupportApi = (supportClient: ApiClient): SupportAPI => ({
  async getConversations(
    userId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Conversation>> {
    return supportClient.get<PaginatedResponse<Conversation>>(
      `users/${userId}/conversations${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },

  async getConversationMessages(
    conversationId: string,
    pagination?: PaginatedRequest
  ): Promise<PaginatedResponse<Message>> {
    return supportClient.get<PaginatedResponse<Message>>(
      `conversations/${conversationId}/messages${buildQueryParams({ ...evaluatePagination(pagination) })}`
    )
  },

  async sendMessage(conversationId: string, message: Message): Promise<void> {
    return supportClient.post<void>(`conversations/${conversationId}/messages`, message)
  },

  createWebSocket(userId: string): SupportWebSocket {
    // For now, use BroadcastChannel even for real API
    // In the future, this could establish a real WebSocket connection to the server
    return createSupportWebSocket(userId)
  },
})
