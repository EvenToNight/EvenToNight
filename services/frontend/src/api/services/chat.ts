import type { ChatAPI } from '../interfaces/chat'
import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'
import type { Conversation, Message } from '../types/chat'
import { buildQueryParams, evaluatePagination } from '../utils/requestUtils'
import type { ApiClient } from '../client'

export const createSupportApi = (supportClient: ApiClient): ChatAPI => ({
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
})
